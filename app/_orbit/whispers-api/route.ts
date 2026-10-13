import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  text: string;
  color: string | null;
  font: string | null;
  sticker: string | null;
  x: number | null;
  y: number | null;
  rotation: number | null;
  pin_color: string | null;
  likes: number | null;
  edit_token: string | null;
  created_at: string;
};

function relTime(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  if (d < 7) return d + "d ago";
  return new Date(iso).toLocaleDateString();
}

function toClient(r: Row) {
  return {
    id: r.id,
    text: r.text,
    color: r.color,
    font: r.font,
    sticker: r.sticker,
    x: r.x,
    y: r.y,
    rotation: r.rotation,
    pinColor: r.pin_color,
    likes: r.likes ?? 0,
    date: relTime(r.created_at),
  };
}

async function isAuthorized(
  supabase: ReturnType<typeof getServiceClient>,
  id: string,
  req: Request
): Promise<boolean> {
  const pw = req.headers.get("x-admin-password") ?? "";
  if (process.env.SPRINT_ADMIN_PASSWORD && pw === process.env.SPRINT_ADMIN_PASSWORD) {
    return true;
  }
  const token = req.headers.get("x-edit-token") ?? "";
  if (!token) return false;
  const { data } = await supabase
    .from("whispers")
    .select("edit_token")
    .eq("id", id)
    .maybeSingle();
  return !!(data && data.edit_token && data.edit_token === token);
}

export async function GET() {
  if (!isSupabaseConfigured()) return NextResponse.json([]);
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("whispers")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json([]);
  return NextResponse.json((data as Row[]).map(toClient));
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  const body = await req.json().catch(() => ({}));
  const text = (body.text ?? "").toString().trim();
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (text.length > 500)
    return NextResponse.json({ error: "too long" }, { status: 400 });

  const editToken = randomUUID();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("whispers")
    .insert({
      text,
      color: body.color ?? "yellow",
      font: body.font ?? null,
      sticker: body.sticker ?? null,
      x: Math.round(Number(body.x) || 2000),
      y: Math.round(Number(body.y) || 1500),
      rotation: Number(body.rotation) || 0,
      pin_color: body.pinColor ?? null,
      likes: 0,
      edit_token: editToken,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...toClient(data as Row), editToken });
}

export async function PATCH(req: Request) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  const body = await req.json().catch(() => ({}));
  const id = body.id;
  if (!id) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const supabase = getServiceClient();

  if (body.text !== undefined) {
    const text = String(body.text).trim();
    if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
    if (text.length > 500)
      return NextResponse.json({ error: "too long" }, { status: 400 });
    if (!(await isAuthorized(supabase, id, req)))
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { error } = await supabase.from("whispers").update({ text }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, text });
  }

  const delta = Number(body.delta) || 0;
  if (!delta) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const { data: cur } = await supabase
    .from("whispers")
    .select("likes")
    .eq("id", id)
    .maybeSingle();
  const next = Math.max(0, ((cur?.likes as number) ?? 0) + delta);
  const { error } = await supabase
    .from("whispers")
    .update({ likes: next })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ likes: next });
}

export async function DELETE(req: Request) {
  if (!isSupabaseConfigured())
    return NextResponse.json({ error: "not configured" }, { status: 500 });
  const body = await req.json().catch(() => ({}));
  const id = body.id;
  if (!id) return NextResponse.json({ error: "bad request" }, { status: 400 });
  const supabase = getServiceClient();
  if (!(await isAuthorized(supabase, id, req)))
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { error } = await supabase.from("whispers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}