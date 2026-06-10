import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

function authorized(req: NextRequest) {
  const auth = req.headers.get("x-admin-password");
  return auth === process.env.SPRINT_ADMIN_PASSWORD;
}

// GET — fetch all data including unapproved comments
export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getClient();
  const [configRes, logsRes, milestonesRes, commentsRes] = await Promise.all([
    supabase.from("sprint_config").select("*").single(),
    supabase.from("sprint_logs").select("*").order("date", { ascending: false }),
    supabase.from("sprint_milestones").select("*").order("amount", { ascending: true }),
    supabase.from("sprint_comments").select("*").order("created_at", { ascending: false }),
  ]);
  return NextResponse.json({
    earned: configRes.data?.earned ?? 0,
    logs: logsRes.data ?? [],
    milestones: milestonesRes.data ?? [],
    comments: commentsRes.data ?? [],
  });
}

// POST — create or update
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const supabase = getClient();
  const { action, ...payload } = body;

  switch (action) {
    case "set_earned": {
      const { data, error } = await supabase
        .from("sprint_config")
        .upsert({ id: 1, earned: Number(payload.earned) }, { onConflict: "id" });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }
    case "create_log": {
      const { data, error } = await supabase
        .from("sprint_logs")
        .insert({ date: payload.date, text: payload.text })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }
    case "update_log": {
      const { data, error } = await supabase
        .from("sprint_logs")
        .update({ date: payload.date, text: payload.text })
        .eq("id", payload.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }
    case "delete_log": {
      const { error } = await supabase.from("sprint_logs").delete().eq("id", payload.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "create_milestone": {
      const { data, error } = await supabase
        .from("sprint_milestones")
        .insert({ label: payload.label, amount: Number(payload.amount), completed: false })
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }
    case "toggle_milestone": {
      const existing = await supabase.from("sprint_milestones").select("completed").eq("id", payload.id).single();
      const { data, error } = await supabase
        .from("sprint_milestones")
        .update({ completed: !existing.data?.completed })
        .eq("id", payload.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true, data });
    }
    case "delete_milestone": {
      const { error } = await supabase.from("sprint_milestones").delete().eq("id", payload.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "approve_comment": {
      const { error } = await supabase.from("sprint_comments").update({ approved: true }).eq("id", payload.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "delete_comment": {
      const { error } = await supabase.from("sprint_comments").delete().eq("id", payload.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    case "spam_comment": {
      const { error } = await supabase.from("sprint_comments").update({ spam: true, approved: false }).eq("id", payload.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ ok: true });
    }
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
