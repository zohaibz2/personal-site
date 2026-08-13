import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

// ── auth ─────────────────────────────────────────────────────────────────────
function authorized(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  const expected = process.env.SPRINT_ADMIN_PASSWORD;
  if (!auth || !expected) return false;
  // length-guarded comparison
  if (auth.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= auth.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

// ── simple in-memory brute-force guard on failed logins ──────────────────────
const failMap = new Map<string, { count: number; reset: number }>();
function tooManyFails(ip: string): boolean {
  const now = Date.now();
  const entry = failMap.get(ip);
  if (!entry || now > entry.reset) return false;
  return entry.count >= 8;
}
function recordFail(ip: string) {
  const now = Date.now();
  const window = 15 * 60 * 1000;
  const entry = failMap.get(ip);
  if (!entry || now > entry.reset) {
    failMap.set(ip, { count: 1, reset: now + window });
  } else {
    entry.count++;
  }
}
function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ── slug helper ──────────────────────────────────────────────────────────────
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

async function uniqueSlug(
  supabase: ReturnType<typeof getServiceClient>,
  base: string
): Promise<string> {
  let candidate = base;
  let n = 1;
  // Loop until we find an unused slug.
  while (true) {
    const { data } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

// ── GET — used both for login check and to list all articles ─────────────────
export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  if (tooManyFails(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }
  if (!authorized(req)) {
    recordFail(ip);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ articles: data ?? [] });
}

// ── POST — create / update / delete / toggle_publish ─────────────────────────
export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const supabase = getServiceClient();
  const { action, ...payload } = body as {
    action?: string;
    id?: string;
    heading?: string;
    subheading?: string;
    content?: string;
    published?: boolean;
  };

  switch (action) {
    case "create": {
      const heading = (payload.heading ?? "").trim();
      const subheading = (payload.subheading ?? "").trim();
      const content = (payload.content ?? "").trim();
      if (!heading || !content) {
        return NextResponse.json(
          { error: "Heading and text are required." },
          { status: 400 }
        );
      }
      const slug = await uniqueSlug(supabase, slugify(heading));
      const { data, error } = await supabase
        .from("articles")
        .insert({
          slug,
          heading,
          subheading,
          content,
          published: payload.published ?? true,
        })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, article: data });
    }

    case "update": {
      if (!payload.id)
        return NextResponse.json({ error: "Missing id." }, { status: 400 });
      const heading = (payload.heading ?? "").trim();
      const content = (payload.content ?? "").trim();
      if (!heading || !content) {
        return NextResponse.json(
          { error: "Heading and text are required." },
          { status: 400 }
        );
      }
      // Slug is left unchanged on edit so existing links keep working.
      const { data, error } = await supabase
        .from("articles")
        .update({
          heading,
          subheading: (payload.subheading ?? "").trim(),
          content,
          published: payload.published ?? true,
        })
        .eq("id", payload.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, article: data });
    }

    case "toggle_publish": {
      if (!payload.id)
        return NextResponse.json({ error: "Missing id." }, { status: 400 });
      const existing = await supabase
        .from("articles")
        .select("published")
        .eq("id", payload.id)
        .single();
      const { error } = await supabase
        .from("articles")
        .update({ published: !existing.data?.published })
        .eq("id", payload.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    case "delete": {
      if (!payload.id)
        return NextResponse.json({ error: "Missing id." }, { status: 400 });
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", payload.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
