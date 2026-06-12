import { NextRequest, NextResponse } from "next/server";

function getClient() {
  const { createClient } = require("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || url === "placeholder") throw new Error("Supabase not configured");
  return createClient(url, key);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Simple in-memory rate limit: max 3 comments per IP per 10 minutes
const rateMap = new Map<string, { count: number; reset: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000;
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

  const { name, email, comment } = body as { name?: string; email?: string; comment?: string };

  // Server-side validation
  if (!name?.trim() || !email?.trim() || !comment?.trim()) {
    return NextResponse.json({ error: "Name, email, and comment are required." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }
  if (name.length > 80 || comment.length > 1000 || email.length > 200) {
    return NextResponse.json({ error: "Input too long." }, { status: 400 });
  }

  // If Supabase not configured, return success silently
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url === "placeholder") {
    return NextResponse.json({ ok: true });
  }

  const supabase = getClient();
  const { error } = await supabase.from("sprint_comments").insert({
    name: name.trim(),
    email: email.trim(),
    comment: comment.trim(),
    approved: false,
    spam: false,
  });

  if (error) {
    console.error("[sprint/comments POST]", error);
    return NextResponse.json({ error: "Failed to save comment." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
