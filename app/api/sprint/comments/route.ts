import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

// Simple in-memory rate limit: max 3 comments per IP per 10 minutes
const rateMap = new Map<string, { count: number; reset: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000; // 10 min
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + window });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRate(ip)) {
    return NextResponse.json({ error: "Too many comments. Try again later." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { name, comment, website } = body as { name?: string; comment?: string; website?: string };

  if (!name?.trim() || !comment?.trim()) {
    return NextResponse.json({ error: "Name and comment required." }, { status: 400 });
  }
  if (name.length > 80 || comment.length > 1000) {
    return NextResponse.json({ error: "Input too long." }, { status: 400 });
  }

  const supabase = getClient();
  const { error } = await supabase.from("sprint_comments").insert({
    name: name.trim(),
    comment: comment.trim(),
    website: website?.trim() || null,
    approved: false,
    spam: false,
  });

  if (error) {
    console.error("[sprint/comments POST]", error);
    return NextResponse.json({ error: "Failed to save comment." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
