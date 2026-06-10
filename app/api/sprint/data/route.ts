import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function GET() {
  try {
    const supabase = getClient();

    const [configRes, logsRes, milestonesRes, commentsRes] = await Promise.all([
      supabase.from("sprint_config").select("*").single(),
      supabase.from("sprint_logs").select("*").order("date", { ascending: false }),
      supabase.from("sprint_milestones").select("*").order("amount", { ascending: true }),
      supabase.from("sprint_comments").select("*").eq("approved", true).order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      earned: configRes.data?.earned ?? 0,
      logs: (logsRes.data ?? []).map((l: { id: string; date: string; text: string }) => ({
        id: l.id,
        date: l.date,
        text: l.text,
      })),
      milestones: (milestonesRes.data ?? []).map((m: { id: string; label: string; amount: number; completed: boolean }) => ({
        id: m.id,
        label: m.label,
        amount: m.amount,
        completed: m.completed,
      })),
      comments: (commentsRes.data ?? []).map((c: { id: string; name: string; comment: string; website?: string; created_at: string }) => ({
        id: c.id,
        name: c.name,
        comment: c.comment,
        website: c.website ?? null,
        created_at: c.created_at,
      })),
    });
  } catch (err) {
    console.error("[sprint/data GET]", err);
    return NextResponse.json({ earned: 0, logs: [], milestones: [], comments: [] });
  }
}
