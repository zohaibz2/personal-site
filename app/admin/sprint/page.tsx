"use client";

import { useState, useEffect, useCallback } from "react";

interface Log { id: string; date: string; text: string }
interface Milestone { id: string; label: string; amount: number; completed: boolean }
interface Comment { id: string; name: string; comment: string; website?: string; created_at: string; approved: boolean; spam: boolean }
interface AdminData { earned: number; logs: Log[]; milestones: Milestone[]; comments: Comment[] }

function api(action: string, extra: Record<string, unknown>, pw: string) {
  return fetch("/api/sprint/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pw },
    body: JSON.stringify({ action, ...extra }),
  }).then(r => r.json());
}

export default function AdminSprintPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [status, setStatus] = useState("");

  // ── login ──────────────────────────────────────────────────────────────────
  const [pwInput, setPwInput] = useState("");

  async function login() {
    const res = await fetch("/api/sprint/admin", {
      headers: { "x-admin-password": pwInput },
    });
    if (res.ok) {
      setPw(pwInput);
      setAuthed(true);
    } else {
      setStatus("Wrong password.");
    }
  }

  // ── load data ──────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!pw) return;
    const res = await fetch("/api/sprint/admin", { headers: { "x-admin-password": pw } });
    if (res.ok) setData(await res.json());
  }, [pw]);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  // ── earned ─────────────────────────────────────────────────────────────────
  const [earnedInput, setEarnedInput] = useState("");

  async function setEarned() {
    setStatus("Saving…");
    await api("set_earned", { earned: parseFloat(earnedInput) }, pw);
    setStatus("Saved ✓"); load();
  }

  // ── logs ───────────────────────────────────────────────────────────────────
  const [logDate, setLogDate] = useState("");
  const [logText, setLogText] = useState("");
  const [editLog, setEditLog] = useState<Log | null>(null);

  async function createLog() {
    if (!logDate || !logText) { setStatus("Date and text required."); return; }
    setStatus("Saving…");
    await api("create_log", { date: logDate, text: logText }, pw);
    setLogDate(""); setLogText(""); setStatus("Log added ✓"); load();
  }

  async function saveEditLog() {
    if (!editLog) return;
    setStatus("Saving…");
    await api("update_log", { id: editLog.id, date: editLog.date, text: editLog.text }, pw);
    setEditLog(null); setStatus("Log updated ✓"); load();
  }

  async function deleteLog(id: string) {
    if (!confirm("Delete this log entry?")) return;
    await api("delete_log", { id }, pw);
    setStatus("Deleted."); load();
  }

  // ── milestones ─────────────────────────────────────────────────────────────
  const [msLabel, setMsLabel] = useState("");
  const [msAmount, setMsAmount] = useState("");

  async function createMilestone() {
    if (!msLabel || !msAmount) { setStatus("Label and amount required."); return; }
    setStatus("Saving…");
    await api("create_milestone", { label: msLabel, amount: parseFloat(msAmount) }, pw);
    setMsLabel(""); setMsAmount(""); setStatus("Milestone added ✓"); load();
  }

  async function toggleMilestone(id: string) {
    await api("toggle_milestone", { id }, pw); load();
  }

  async function deleteMilestone(id: string) {
    if (!confirm("Delete this milestone?")) return;
    await api("delete_milestone", { id }, pw);
    setStatus("Deleted."); load();
  }

  // ── comments ───────────────────────────────────────────────────────────────
  async function approveComment(id: string) { await api("approve_comment", { id }, pw); load(); }
  async function spamComment(id: string) { await api("spam_comment", { id }, pw); load(); }
  async function deleteComment(id: string) {
    if (!confirm("Delete this comment?")) return;
    await api("delete_comment", { id }, pw); load();
  }

  // ── render login ───────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 360, width: "100%", padding: "2rem", border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem", color: "#1a1a1a" }}>Sprint Admin</h1>
          <input
            type="password"
            placeholder="Admin password"
            value={pwInput}
            onChange={e => setPwInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
            style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "1rem", marginBottom: "0.75rem", boxSizing: "border-box" }}
          />
          {status && <p style={{ color: "#c2410c", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{status}</p>}
          <button onClick={login} style={{ width: "100%", padding: "0.65rem", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: "1rem", cursor: "pointer" }}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  const s: React.CSSProperties = {
    fontFamily: "system-ui, sans-serif",
    maxWidth: 760,
    margin: "0 auto",
    padding: "2rem 1.5rem 6rem",
    color: "#1a1a1a",
    background: "#fff",
    minHeight: "100vh",
  };

  const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "2rem" };
  const h2: React.CSSProperties = { fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", marginTop: 0 };
  const input: React.CSSProperties = { padding: "0.5rem 0.75rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "0.95rem", width: "100%", boxSizing: "border-box" };
  const btn = (color = "#1a1a1a"): React.CSSProperties => ({ padding: "0.45rem 0.9rem", background: color, color: "#fff", border: "none", borderRadius: 7, fontSize: "0.875rem", cursor: "pointer" });
  const row: React.CSSProperties = { display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" as const };
  const itemRow: React.CSSProperties = { display: "flex", alignItems: "flex-start", gap: "0.75rem", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.75rem", marginBottom: "0.75rem" };

  return (
    <div style={s}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Sprint Admin</h1>
        {status && <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{status}</span>}
      </div>

      {/* Earned */}
      <div style={card}>
        <h2 style={h2}>Current Earnings</h2>
        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: 0, marginBottom: "0.75rem" }}>
          Current: <strong>${(data?.earned ?? 0).toLocaleString()}</strong>
        </p>
        <div style={row}>
          <input style={{ ...input, maxWidth: 220 }} type="number" placeholder="New amount (e.g. 12500)" value={earnedInput} onChange={e => setEarnedInput(e.target.value)} />
          <button style={btn()} onClick={setEarned}>Update</button>
        </div>
      </div>

      {/* Sprint Logs */}
      <div style={card}>
        <h2 style={h2}>Sprint Log</h2>

        {/* Add log */}
        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "1rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 0, marginBottom: "0.5rem" }}>Add new entry</p>
          <div style={row}>
            <input style={{ ...input, maxWidth: 180 }} type="text" placeholder="Date (e.g. June 2026)" value={logDate} onChange={e => setLogDate(e.target.value)} />
          </div>
          <div style={row}>
            <input style={input} type="text" placeholder="Log text" value={logText} onChange={e => setLogText(e.target.value)} />
            <button style={btn()} onClick={createLog}>Add</button>
          </div>
        </div>

        {/* Edit log */}
        {editLog && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "1rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: "0.8rem", color: "#92400e", marginTop: 0, marginBottom: "0.5rem" }}>Editing log</p>
            <div style={row}>
              <input style={{ ...input, maxWidth: 180 }} type="text" value={editLog.date} onChange={e => setEditLog({ ...editLog, date: e.target.value })} />
            </div>
            <div style={row}>
              <input style={input} type="text" value={editLog.text} onChange={e => setEditLog({ ...editLog, text: e.target.value })} />
              <button style={btn("#c2410c")} onClick={saveEditLog}>Save</button>
              <button style={{ ...btn(), background: "#6b7280" }} onClick={() => setEditLog(null)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Logs list */}
        {(data?.logs ?? []).map(log => (
          <div key={log.id} style={itemRow}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.8rem", color: "#6b7280", marginRight: "0.5rem" }}>{log.date}</span>
              <span style={{ fontSize: "0.95rem" }}>{log.text}</span>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
              <button style={btn("#4b5563")} onClick={() => setEditLog(log)}>Edit</button>
              <button style={btn("#dc2626")} onClick={() => deleteLog(log.id)}>Delete</button>
            </div>
          </div>
        ))}
        {(data?.logs ?? []).length === 0 && <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>No logs yet.</p>}
      </div>

      {/* Milestones */}
      <div style={card}>
        <h2 style={h2}>Milestones</h2>
        <div style={{ background: "#f9fafb", borderRadius: 8, padding: "1rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: 0, marginBottom: "0.5rem" }}>Add milestone</p>
          <div style={row}>
            <input style={input} type="text" placeholder="Label (e.g. First $10k)" value={msLabel} onChange={e => setMsLabel(e.target.value)} />
            <input style={{ ...input, maxWidth: 160 }} type="number" placeholder="Amount" value={msAmount} onChange={e => setMsAmount(e.target.value)} />
            <button style={btn()} onClick={createMilestone}>Add</button>
          </div>
        </div>
        {(data?.milestones ?? []).map(m => (
          <div key={m.id} style={itemRow}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "0.8rem", color: "#6b7280", marginRight: "0.5rem" }}>${m.amount.toLocaleString()}</span>
              <span style={{ fontSize: "0.95rem", textDecoration: m.completed ? "line-through" : "none" }}>{m.label}</span>
              {m.completed && <span style={{ fontSize: "0.75rem", color: "#16a34a", marginLeft: "0.5rem" }}>✓ done</span>}
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
              <button style={btn(m.completed ? "#6b7280" : "#16a34a")} onClick={() => toggleMilestone(m.id)}>{m.completed ? "Undo" : "Complete"}</button>
              <button style={btn("#dc2626")} onClick={() => deleteMilestone(m.id)}>Delete</button>
            </div>
          </div>
        ))}
        {(data?.milestones ?? []).length === 0 && <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>No milestones yet.</p>}
      </div>

      {/* Comments */}
      <div style={card}>
        <h2 style={h2}>Comments</h2>
        {(data?.comments ?? []).map(c => (
          <div key={c.id} style={{ ...itemRow, opacity: c.spam ? 0.4 : 1 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                <strong style={{ color: "#1a1a1a" }}>{c.name}</strong>
                {c.website && <span> · <a href={c.website} target="_blank" rel="noopener noreferrer" style={{ color: "#c2410c" }}>{c.website}</a></span>}
                <span> · {new Date(c.created_at).toLocaleString()}</span>
                {c.approved && <span style={{ color: "#16a34a" }}> · approved</span>}
                {c.spam && <span style={{ color: "#dc2626" }}> · spam</span>}
              </div>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>{c.comment}</p>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
              {!c.approved && !c.spam && <button style={btn("#16a34a")} onClick={() => approveComment(c.id)}>Approve</button>}
              {!c.spam && <button style={btn("#f59e0b")} onClick={() => spamComment(c.id)}>Spam</button>}
              <button style={btn("#dc2626")} onClick={() => deleteComment(c.id)}>Delete</button>
            </div>
          </div>
        ))}
        {(data?.comments ?? []).length === 0 && <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>No comments yet.</p>}
      </div>
    </div>
  );
}
