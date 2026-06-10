"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SprintData {
  earned: number;
  logs: { id: string; date: string; text: string }[];
  milestones: { id: string; label: string; amount: number; completed: boolean }[];
  comments: { id: string; name: string; comment: string; website?: string; created_at: string }[];
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TARGET = 1_000_000;
const DEADLINE_UTC = "2027-01-01T00:00:00Z"; // Jan 1 2027 00:00 UTC — timezone offset applied client-side

const TIMEZONES = [
  { label: "Karachi (PKT)", value: "Asia/Karachi" },
  { label: "New York (EST/EDT)", value: "America/New_York" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "Dubai (GST)", value: "Asia/Dubai" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
];

const STORAGE_KEY = "sprint_tz";

// ─── Helper: compute countdown relative to selected timezone ─────────────────

function getTimeLeft(tz: string): TimeLeft {
  // We want "Jan 1 2027 00:00:00 in <tz>" – convert that to a UTC ms timestamp
  try {
    // Build the deadline in the given timezone using Intl
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
    // Find the UTC epoch for "2027-01-01 00:00:00" in tz by binary-searching
    // Simpler: just compute offset from known UTC deadline
    const deadlineUTC = new Date(DEADLINE_UTC).getTime();
    // Get current time in that timezone and compare to deadline in that timezone
    const now = new Date();
    const nowInTZ = new Date(
      now.toLocaleString("en-US", { timeZone: tz })
    ).getTime();
    const deadlineInTZ = new Date(
      new Date(DEADLINE_UTC).toLocaleString("en-US", { timeZone: tz })
    ).getTime();
    const diff = deadlineInTZ - nowInTZ;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
      total: diff,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
    void deadlineUTC; // silence unused
  } catch {
    // Fallback: straight UTC diff
    const diff = new Date(DEADLINE_UTC).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    return {
      total: diff,
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }
}

function fmt(n: number) {
  return String(n).padStart(2, "0");
}

function fmtMoney(n: number) {
  return "$" + n.toLocaleString("en-US");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="sprint-unit">
      <span className="sprint-unit-value">{fmt(value)}</span>
      <span className="sprint-unit-label">{label}</span>
    </div>
  );
}

// ─── Comment form ─────────────────────────────────────────────────────────────

function CommentForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit() {
    if (!name.trim() || !comment.trim()) {
      setMsg("Name and comment are required.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/sprint/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), comment: comment.trim(), website: website.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed");
      }
      setStatus("done");
      setMsg("Comment submitted — it'll appear once approved. Thanks!");
      setName(""); setComment(""); setWebsite("");
      onSubmitted();
    } catch (e: unknown) {
      setStatus("error");
      setMsg(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <div className="sprint-comment-form">
      <h3 className="sprint-comment-form-title">Leave a comment</h3>
      <div className="sprint-field-row">
        <input
          className="sprint-input"
          placeholder="Your name *"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={80}
          disabled={status === "sending"}
        />
        <input
          className="sprint-input"
          placeholder="Website (optional)"
          value={website}
          onChange={e => setWebsite(e.target.value)}
          maxLength={200}
          disabled={status === "sending"}
        />
      </div>
      <textarea
        className="sprint-textarea"
        placeholder="Your comment *"
        value={comment}
        onChange={e => setComment(e.target.value)}
        maxLength={1000}
        rows={4}
        disabled={status === "sending"}
      />
      {msg && (
        <p className={status === "error" ? "sprint-msg-error" : "sprint-msg-ok"}>{msg}</p>
      )}
      <button
        className="sprint-btn"
        onClick={submit}
        disabled={status === "sending" || status === "done"}
      >
        {status === "sending" ? "Submitting…" : status === "done" ? "Submitted ✓" : "Submit comment"}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MillionDollarSprint() {
  const [tz, setTz] = useState("Asia/Karachi");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 1 });
  const [data, setData] = useState<SprintData | null>(null);
  const [mounted, setMounted] = useState(false);

  // Load persisted timezone
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && TIMEZONES.find(t => t.value === stored)) setTz(stored);
    } catch { /* no-op */ }
  }, []);

  // Persist timezone change
  function changeTz(val: string) {
    setTz(val);
    try { localStorage.setItem(STORAGE_KEY, val); } catch { /* no-op */ }
  }

  // Countdown tick
  useEffect(() => {
    if (!mounted) return;
    setTimeLeft(getTimeLeft(tz));
    const id = setInterval(() => setTimeLeft(getTimeLeft(tz)), 1000);
    return () => clearInterval(id);
  }, [tz, mounted]);

  // Load sprint data
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/sprint/data");
      if (res.ok) setData(await res.json());
    } catch { /* no-op */ }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const earned = data?.earned ?? 0;
  const pct = Math.min(100, (earned / TARGET) * 100);

  if (!mounted) return null; // avoid hydration mismatch for countdown

  return (
    <section className="sprint-section">
      {/* Header */}
      <div className="sprint-header">
        <div className="sprint-eyebrow">Public challenge</div>
        <h2 className="sprint-title">The Million Dollar Sprint</h2>
        <p className="sprint-subtitle">
          My public challenge to reach $1,000,000 before 2027. Every day counts.
        </p>
      </div>

      {/* Countdown */}
      <div className="sprint-countdown-wrap">
        <div className="sprint-countdown">
          <CountdownUnit value={timeLeft.days} label="Days" />
          <div className="sprint-sep">:</div>
          <CountdownUnit value={timeLeft.hours} label="Hours" />
          <div className="sprint-sep">:</div>
          <CountdownUnit value={timeLeft.minutes} label="Minutes" />
          <div className="sprint-sep">:</div>
          <CountdownUnit value={timeLeft.seconds} label="Seconds" />
        </div>
        <div className="sprint-tz-row">
          <span className="sprint-tz-label">Timezone:</span>
          <select
            className="sprint-tz-select"
            value={tz}
            onChange={e => changeTz(e.target.value)}
          >
            {TIMEZONES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Progress dashboard */}
      <div className="sprint-dashboard">
        <div className="sprint-stats">
          <div className="sprint-stat">
            <span className="sprint-stat-label">Target</span>
            <span className="sprint-stat-value">{fmtMoney(TARGET)}</span>
          </div>
          <div className="sprint-stat sprint-stat-accent">
            <span className="sprint-stat-label">Earned so far</span>
            <span className="sprint-stat-value sprint-stat-earned">{fmtMoney(earned)}</span>
          </div>
          <div className="sprint-stat">
            <span className="sprint-stat-label">Remaining</span>
            <span className="sprint-stat-value">{fmtMoney(TARGET - earned)}</span>
          </div>
        </div>

        <div className="sprint-progress-wrap">
          <div className="sprint-progress-bar-bg">
            <div
              className="sprint-progress-bar-fill"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="sprint-progress-pct">{pct.toFixed(1)}% Complete</div>
        </div>
      </div>

      {/* Sprint log */}
      {data && data.logs.length > 0 && (
        <div className="sprint-log-wrap">
          <h2 className="sprint-section-heading">Sprint Log</h2>
          <div className="sprint-timeline">
            {data.logs.map((log) => (
              <div key={log.id} className="sprint-log-entry">
                <div className="sprint-log-dot" />
                <div className="sprint-log-body">
                  <span className="sprint-log-date">{log.date}</span>
                  <p className="sprint-log-text">{log.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      {data && data.milestones.length > 0 && (
        <div className="sprint-milestones-wrap">
          <h2 className="sprint-section-heading">Milestones</h2>
          <div className="sprint-milestones">
            {data.milestones.map(m => (
              <div key={m.id} className={`sprint-milestone ${m.completed ? "sprint-milestone--done" : ""}`}>
                <span className="sprint-milestone-check">{m.completed ? "✓" : "○"}</span>
                <span className="sprint-milestone-label">{m.label}</span>
                <span className="sprint-milestone-amount">{fmtMoney(m.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="sprint-comments-wrap">
        <h2 className="sprint-section-heading">Community Comments</h2>
        {data && data.comments.length > 0 ? (
          <div className="sprint-comments-list">
            {data.comments.map(c => (
              <div key={c.id} className="sprint-comment">
                <div className="sprint-comment-header">
                  {c.website ? (
                    <a href={c.website} target="_blank" rel="noopener noreferrer" className="sprint-comment-name sprint-comment-name-link">
                      {c.name}
                    </a>
                  ) : (
                    <span className="sprint-comment-name">{c.name}</span>
                  )}
                  <span className="sprint-comment-date">{new Date(c.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" })}</span>
                </div>
                <p className="sprint-comment-body">{c.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="sprint-no-comments">No comments yet — be the first.</p>
        )}
        <CommentForm onSubmitted={loadData} />
      </div>
    </section>
  );
}
