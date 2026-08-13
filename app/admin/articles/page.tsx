"use client";

import { useState, useEffect, useCallback } from "react";

interface Article {
  id: string;
  slug: string;
  heading: string;
  subheading: string | null;
  content: string;
  published: boolean;
  created_at: string;
}

function api(action: string, extra: Record<string, unknown>, pw: string) {
  return fetch("/api/articles/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pw },
    body: JSON.stringify({ action, ...extra }),
  }).then((r) => r.json());
}

export default function AdminArticlesPage() {
  const [pw, setPw] = useState("");
  const [authed, setAuthed] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [status, setStatus] = useState("");

  // ── login ──────────────────────────────────────────────────────────────────
  const [pwInput, setPwInput] = useState("");
  async function login() {
    const res = await fetch("/api/articles/admin", {
      headers: { "x-admin-password": pwInput },
    });
    if (res.ok) {
      setPw(pwInput);
      setAuthed(true);
    } else {
      const j = await res.json().catch(() => ({}));
      setStatus(j.error || "Wrong password.");
    }
  }

  // ── load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!pw) return;
    const res = await fetch("/api/articles/admin", {
      headers: { "x-admin-password": pw },
    });
    if (res.ok) {
      const j = await res.json();
      setArticles(j.articles ?? []);
    }
  }, [pw]);

  useEffect(() => {
    if (authed) load();
  }, [authed, load]);

  // ── editor state ─────────────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);

  function resetForm() {
    setEditingId(null);
    setHeading("");
    setSubheading("");
    setContent("");
    setPublished(true);
  }

  function startEdit(a: Article) {
    setEditingId(a.id);
    setHeading(a.heading);
    setSubheading(a.subheading ?? "");
    setContent(a.content);
    setPublished(a.published);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!heading.trim() || !content.trim()) {
      setStatus("Heading and text are required.");
      return;
    }
    setStatus("Saving…");
    const res = editingId
      ? await api("update", { id: editingId, heading, subheading, content, published }, pw)
      : await api("create", { heading, subheading, content, published }, pw);
    if (res.error) {
      setStatus(res.error);
      return;
    }
    setStatus(editingId ? "Updated ✓" : "Published ✓");
    resetForm();
    load();
  }

  async function togglePublish(id: string) {
    await api("toggle_publish", { id }, pw);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this article? This can't be undone.")) return;
    await api("delete", { id }, pw);
    if (editingId === id) resetForm();
    setStatus("Deleted.");
    load();
  }

  const paragraphs = content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // ── login screen ─────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 360, width: "100%", padding: "2rem", border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1.5rem", color: "#1a1a1a" }}>
            Articles Admin
          </h1>
          <input
            type="password"
            placeholder="Admin password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={{ width: "100%", padding: "0.6rem 0.8rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "1rem", marginBottom: "0.75rem", boxSizing: "border-box" }}
          />
          {status && <p style={{ color: "#c2410c", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{status}</p>}
          <button
            onClick={login}
            style={{ width: "100%", padding: "0.65rem", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: "1rem", cursor: "pointer" }}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  // ── styles ───────────────────────────────────────────────────────────────────
  const wrap: React.CSSProperties = { fontFamily: "system-ui, sans-serif", maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem 6rem", color: "#1a1a1a", background: "#fff", minHeight: "100vh" };
  const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, padding: "1.5rem", marginBottom: "2rem" };
  const label: React.CSSProperties = { display: "block", fontSize: "0.8rem", color: "#6b7280", marginBottom: "0.35rem" };
  const input: React.CSSProperties = { padding: "0.6rem 0.8rem", border: "1px solid #d1d5db", borderRadius: 8, fontSize: "0.95rem", width: "100%", boxSizing: "border-box", marginBottom: "1rem", fontFamily: "inherit" };
  const btn = (color = "#1a1a1a"): React.CSSProperties => ({ padding: "0.55rem 1.1rem", background: color, color: "#fff", border: "none", borderRadius: 8, fontSize: "0.9rem", cursor: "pointer" });

  return (
    <div style={wrap}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Articles Admin</h1>
        {status && <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>{status}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }} className="admin-grid">
        {/* Editor */}
        <div style={card}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 0, marginBottom: "1.25rem" }}>
            {editingId ? "Edit article" : "New article"}
          </h2>

          <label style={label}>Heading</label>
          <input style={input} value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="The big title" />

          <label style={label}>Subheading</label>
          <input style={input} value={subheading} onChange={(e) => setSubheading(e.target.value)} placeholder="A short line under the title (optional)" />

          <label style={label}>Text</label>
          <textarea
            style={{ ...input, minHeight: 320, resize: "vertical", lineHeight: 1.6 }}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={"Write your article here.\n\nLeave a blank line between paragraphs to start a new one."}
          />

          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "#374151", marginBottom: "1.25rem" }}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published (visible on the site)
          </label>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button style={btn("#c2410c")} onClick={save}>
              {editingId ? "Update" : "Publish"}
            </button>
            {editingId && (
              <button style={btn("#6b7280")} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Live preview */}
        <div style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "0.75rem 1.25rem", borderBottom: "1px solid #e5e7eb", fontSize: "0.8rem", color: "#6b7280" }}>
            Preview
          </div>
          <div
            style={{
              backgroundImage: "url('/background.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              padding: "2rem 1.25rem",
            }}
          >
            <div style={{ maxWidth: 620, margin: "0 auto", background: "#fff", borderRadius: 16, padding: "2.25rem 1.75rem", boxShadow: "0 30px 80px -30px rgba(0,0,0,0.6)" }}>
              <div style={{ textAlign: "center", marginBottom: "1.75rem", fontFamily: "var(--font-eb-garamond), Georgia, serif" }}>
                <h1 style={{ fontSize: "2rem", lineHeight: 1.08, fontWeight: 700, letterSpacing: "-0.01em", color: "#1a1a1a", margin: 0 }}>
                  {heading || "Your heading"}
                </h1>
                {subheading && (
                  <p style={{ marginTop: "0.9rem", fontSize: "1.05rem", lineHeight: 1.5, color: "rgba(26,26,26,0.7)" }}>
                    {subheading}
                  </p>
                )}
              </div>
              <div className="article-body" style={{ fontFamily: "var(--font-eb-garamond), Georgia, serif" }}>
                {paragraphs.length ? (
                  paragraphs.map((p, i) => <p key={i}>{p}</p>)
                ) : (
                  <p style={{ color: "#9ca3af" }}>Your article text will appear here…</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing articles */}
      <div style={card}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginTop: 0, marginBottom: "1rem" }}>
          All articles ({articles.length})
        </h2>
        {articles.length === 0 && <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>Nothing written yet.</p>}
        {articles.map((a) => (
          <div
            key={a.id}
            style={{ display: "flex", alignItems: "flex-start", gap: "1rem", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.9rem", marginBottom: "0.9rem" }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.15rem" }}>{a.heading}</div>
              <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                /articles/{a.slug}
                <span> · {new Date(a.created_at).toLocaleDateString()}</span>
                {a.published ? (
                  <span style={{ color: "#16a34a" }}> · published</span>
                ) : (
                  <span style={{ color: "#b45309" }}> · draft</span>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
              <button style={btn("#4b5563")} onClick={() => startEdit(a)}>Edit</button>
              <button style={btn(a.published ? "#6b7280" : "#16a34a")} onClick={() => togglePublish(a.id)}>
                {a.published ? "Unpublish" : "Publish"}
              </button>
              <button style={btn("#dc2626")} onClick={() => remove(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 900px) {
          .admin-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
