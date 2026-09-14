"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Trait = "bold" | "curious" | "chaos" | "warmth" | "ambition" | "whimsy";

const POOL: { e: string; t: Trait }[] = [
  { e: "🔥", t: "bold" }, { e: "🚀", t: "bold" }, { e: "⚡", t: "bold" }, { e: "🥊", t: "bold" },
  { e: "🏎️", t: "bold" }, { e: "🗡️", t: "bold" }, { e: "💥", t: "bold" }, { e: "🎯", t: "bold" },
  { e: "🧗", t: "bold" }, { e: "🪂", t: "bold" }, { e: "🏍️", t: "bold" }, { e: "🥋", t: "bold" },
  { e: "🏹", t: "bold" }, { e: "🦁", t: "bold" }, { e: "🏈", t: "bold" }, { e: "🏂", t: "bold" },
  { e: "📚", t: "curious" }, { e: "🔭", t: "curious" }, { e: "🧠", t: "curious" }, { e: "🔬", t: "curious" },
  { e: "🧪", t: "curious" }, { e: "💡", t: "curious" }, { e: "🗺️", t: "curious" }, { e: "🧩", t: "curious" },
  { e: "🔍", t: "curious" }, { e: "🧭", t: "curious" }, { e: "📖", t: "curious" }, { e: "🪐", t: "curious" },
  { e: "🧬", t: "curious" }, { e: "📐", t: "curious" }, { e: "🖋️", t: "curious" }, { e: "♟️", t: "curious" },
  { e: "🎲", t: "chaos" }, { e: "🌪️", t: "chaos" }, { e: "🎰", t: "chaos" }, { e: "🧨", t: "chaos" },
  { e: "🌀", t: "chaos" }, { e: "🤪", t: "chaos" }, { e: "👻", t: "chaos" }, { e: "🎢", t: "chaos" },
  { e: "🐙", t: "chaos" }, { e: "🪩", t: "chaos" }, { e: "🎆", t: "chaos" }, { e: "🕹️", t: "chaos" },
  { e: "🦖", t: "chaos" }, { e: "🃏", t: "chaos" }, { e: "🛸", t: "chaos" }, { e: "🪤", t: "chaos" },
  { e: "🌱", t: "warmth" }, { e: "🐶", t: "warmth" }, { e: "🫂", t: "warmth" }, { e: "🧸", t: "warmth" },
  { e: "☕", t: "warmth" }, { e: "🍪", t: "warmth" }, { e: "🕯️", t: "warmth" }, { e: "🏡", t: "warmth" },
  { e: "🤝", t: "warmth" }, { e: "💌", t: "warmth" }, { e: "🐣", t: "warmth" }, { e: "🫖", t: "warmth" },
  { e: "🍯", t: "warmth" }, { e: "🧶", t: "warmth" }, { e: "🌻", t: "warmth" }, { e: "🥰", t: "warmth" },
  { e: "💰", t: "ambition" }, { e: "🏆", t: "ambition" }, { e: "👑", t: "ambition" }, { e: "💎", t: "ambition" },
  { e: "📈", t: "ambition" }, { e: "🏗️", t: "ambition" }, { e: "💼", t: "ambition" }, { e: "⌚", t: "ambition" },
  { e: "🥇", t: "ambition" }, { e: "🎩", t: "ambition" }, { e: "🏦", t: "ambition" }, { e: "🪙", t: "ambition" },
  { e: "📊", t: "ambition" }, { e: "🗽", t: "ambition" }, { e: "🦅", t: "ambition" }, { e: "🚁", t: "ambition" },
  { e: "🎨", t: "whimsy" }, { e: "🎭", t: "whimsy" }, { e: "🎪", t: "whimsy" }, { e: "🦄", t: "whimsy" },
  { e: "🌈", t: "whimsy" }, { e: "🎈", t: "whimsy" }, { e: "🖍️", t: "whimsy" }, { e: "🎠", t: "whimsy" },
  { e: "🪄", t: "whimsy" }, { e: "🎬", t: "whimsy" }, { e: "🎤", t: "whimsy" }, { e: "🎡", t: "whimsy" },
  { e: "🍭", t: "whimsy" }, { e: "🪁", t: "whimsy" }, { e: "🌟", t: "whimsy" }, { e: "🪀", t: "whimsy" },
];

type Result = { name: string; emoji: string; blurb: string };

const BASE: Record<Trait, Result> = {
  bold: { name: "The Firestarter", emoji: "🔥", blurb: "You act first and figure it out mid-air. Momentum is your love language." },
  curious: { name: "The Deep Diver", emoji: "🔭", blurb: "You open forty tabs to answer one question — and regret nothing." },
  chaos: { name: "The Chaos Gremlin", emoji: "🎲", blurb: "Plans are merely suggestions. You do your best work in the beautiful mess." },
  warmth: { name: "The Golden Retriever", emoji: "🐶", blurb: "You're a human group-hug. People are your whole thing, and they know it." },
  ambition: { name: "The Empire Builder", emoji: "🏗️", blurb: "You're already three moves ahead and quietly keeping score." },
  whimsy: { name: "The Daydreamer", emoji: "🎨", blurb: "Your brain is a carnival. Ideas just keep falling out of you." },
};

const COMBOS: { a: Trait; b: Trait; r: Result }[] = [
  { a: "bold", b: "chaos", r: { name: "The Wildcard", emoji: "🎢", blurb: "Pure kinetic energy, zero brakes, maximum fun. Nobody can predict you — least of all you." } },
  { a: "curious", b: "ambition", r: { name: "The Mastermind", emoji: "♟️", blurb: "You learn everything, then quietly use it. Terrifying, in the best way." } },
  { a: "warmth", b: "whimsy", r: { name: "The Sunshine Machine", emoji: "🌈", blurb: "You make everything more fun and everyone feel seen. A walking serotonin boost." } },
  { a: "bold", b: "ambition", r: { name: "The Closer", emoji: "💼", blurb: "You see it, you want it, you get it. Doubt is not on the menu." } },
  { a: "curious", b: "warmth", r: { name: "The Wise Owl", emoji: "🦉", blurb: "Thoughtful and kind — the one everyone calls when it actually matters." } },
];

const ENIGMA: Result = { name: "The Enigma", emoji: "🃏", blurb: "A little bit of everything and impossible to file. Good luck to anyone trying to summarize you." };

function computeResult(caught: Trait[]): Result {
  const tally: Record<Trait, number> = { bold: 0, curious: 0, chaos: 0, warmth: 0, ambition: 0, whimsy: 0 };
  caught.forEach((t) => (tally[t] += 1));
  const sorted = (Object.keys(tally) as Trait[]).sort((a, b) => tally[b] - tally[a]);
  const [top, second] = sorted;
  if (tally[top] === 0) return ENIGMA;
  if (tally[top] - tally[sorted[5]] <= 1) return ENIGMA;
  if (tally[top] - tally[second] <= 1) {
    const combo = COMBOS.find((c) => (c.a === top && c.b === second) || (c.a === second && c.b === top));
    if (combo) return combo.r;
  }
  return BASE[top];
}

function segDist(ax: number, ay: number, bx: number, by: number, px: number, py: number) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

const TOTAL = 10;

export default function CatchGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPolylineElement>(null);
  const objRef = useRef(new Map<number, { y: number; vy: number; t: Trait; e: string; el: HTMLButtonElement | null }>());
  const idRef = useRef(0);
  const popIdRef = useRef(0);
  const rafRef = useRef(0);
  const spawnRef = useRef<number | undefined>(undefined);
  const lastRef = useRef(0);
  const ptrRef = useRef<{ x: number; y: number } | null>(null);
  const trailRef = useRef<{ x: number; y: number; t: number }[]>([]);
  const phaseRef = useRef<"intro" | "playing" | "done">("intro");

  const [list, setList] = useState<{ id: number; e: string; t: Trait; left: number }[]>([]);
  const [pops, setPops] = useState<{ id: number; x: number; y: number; e: string }[]>([]);
  const [caught, setCaught] = useState<Trait[]>([]);
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  function start() {
    setCaught([]); setResult(null); setList([]); setPops([]); setCopied(false);
    objRef.current.clear(); trailRef.current = []; ptrRef.current = null;
    setPhase("playing");
  }

  useEffect(() => {
    if (phase !== "playing") return;

    const spawn = () => {
      const item = POOL[Math.floor(Math.random() * POOL.length)];
      const id = ++idRef.current;
      const left = 5 + Math.random() * 80;
      const vy = 55 + Math.random() * 55;
      objRef.current.set(id, { y: -54, vy, t: item.t, e: item.e, el: null });
      setList((l) => [...l, { id, e: item.e, t: item.t, left }]);
    };
    spawn();
    spawnRef.current = window.setInterval(spawn, 700);
    lastRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(50, now - lastRef.current) / 1000;
      lastRef.current = now;
      const h = containerRef.current?.clientHeight ?? 560;
      const remove: number[] = [];
      objRef.current.forEach((o, id) => {
        o.y += o.vy * dt;
        if (o.el) o.el.style.transform = `translateY(${o.y}px)`;
        if (o.y > h + 60) remove.push(id);
      });
      if (remove.length) {
        remove.forEach((id) => objRef.current.delete(id));
        setList((l) => l.filter((x) => !remove.includes(x.id)));
      }
      // blade trail
      trailRef.current = trailRef.current.filter((p) => now - p.t < 190);
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && lineRef.current) {
        lineRef.current.setAttribute(
          "points",
          trailRef.current.map((p) => `${p.x - rect.left},${p.y - rect.top}`).join(" ")
        );
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === "playing" && caught.length >= TOTAL) {
      setResult(computeResult(caught));
      setPhase("done");
    }
  }, [caught, phase]);

  function slice(id: number, t: Trait, e: string, clientX: number, clientY: number) {
    if (!objRef.current.has(id)) return;
    objRef.current.delete(id);
    setList((l) => l.filter((x) => x.id !== id));
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const pid = ++popIdRef.current;
      const px = clientX - rect.left, py = clientY - rect.top;
      setPops((p) => [...p, { id: pid, x: px, y: py, e }]);
      setTimeout(() => setPops((p) => p.filter((q) => q.id !== pid)), 450);
    }
    setCaught((c) => (c.length >= TOTAL ? c : [...c, t]));
  }

  function onPointerMove(e: React.PointerEvent) {
    if (phaseRef.current !== "playing") return;
    const cur = { x: e.clientX, y: e.clientY };
    const last = ptrRef.current || cur;
    ptrRef.current = cur;
    trailRef.current.push({ x: cur.x, y: cur.y, t: performance.now() });
    objRef.current.forEach((o, id) => {
      if (!o.el) return;
      const r = o.el.getBoundingClientRect();
      const ox = r.left + r.width / 2, oy = r.top + r.height / 2;
      if (segDist(last.x, last.y, cur.x, cur.y, ox, oy) < 34) slice(id, o.t, o.e, ox, oy);
    });
  }

  async function share() {
    if (!result) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `I'm ${result.name} ${result.emoji} — ${result.blurb}\n\nFind your type: ${origin}/orbit/catch`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-14 md:py-20">
      <Link href="/orbit" className="text-xs uppercase tracking-[0.14em] text-[#1a1a1a]/45 transition-colors hover:text-[#c2410c]" style={{ fontFamily: "system-ui, sans-serif" }}>
        &larr; Orbit
      </Link>

      <h1 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a]">Catch Yourself</h1>
      <p className="mt-2 mb-6 text-[#1a1a1a]/65">
        Slash through the ten things that call to you — swipe your cursor (or drag
        your finger) across them. What you grab says more than you&apos;d like.
      </p>

      {phase === "playing" && (
        <div className="mb-3 text-sm font-medium text-[#1a1a1a]/60" style={{ fontFamily: "system-ui, sans-serif" }}>
          Caught {caught.length}/{TOTAL}
        </div>
      )}

      <div
        ref={containerRef}
        onPointerMove={onPointerMove}
        onPointerLeave={() => { ptrRef.current = null; }}
        className="relative mx-auto h-[68vh] max-h-[560px] w-full overflow-hidden rounded-2xl border border-black/10 bg-white/60"
        style={{ touchAction: "none", userSelect: "none" }}
      >
        {list.map((o) => (
          <button
            key={o.id}
            ref={(el) => {
              const rec = objRef.current.get(o.id);
              if (rec) { rec.el = el; if (el) el.style.transform = `translateY(${rec.y}px)`; }
            }}
            onClick={(ev) => {
              const r = ev.currentTarget.getBoundingClientRect();
              slice(o.id, o.t, o.e, r.left + r.width / 2, r.top + r.height / 2);
            }}
            aria-label="catch"
            className="absolute cursor-pointer select-none p-1.5 leading-none"
            style={{ left: `${o.left}%`, top: 0, fontSize: "2.6rem" }}
          >
            {o.e}
          </button>
        ))}

        {/* blade trail */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <polyline ref={lineRef} points="" fill="none" stroke="#c2410c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </svg>

        {/* pop bursts */}
        {pops.map((p) => (
          <span key={p.id} className="pointer-events-none absolute" style={{ left: p.x, top: p.y, transform: "translate(-50%,-50%)", fontSize: "2.6rem", animation: "cy-pop 0.45s ease-out forwards" }}>
            {p.e}
          </span>
        ))}

        {phase === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/70 px-8 text-center backdrop-blur-sm">
            <div className="text-5xl">🪄</div>
            <p className="max-w-sm text-[#1a1a1a]/70">
              Things will start falling. Swipe your cursor or finger through the ten
              that pull at you — gut, not brain. Then meet yourself.
            </p>
            <button onClick={start} className="mt-1 rounded-full bg-[#1a1a1a] px-6 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]" style={{ fontFamily: "system-ui, sans-serif" }}>
              Start
            </button>
          </div>
        )}

        {phase === "done" && result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/85 px-8 text-center backdrop-blur-sm">
            <div className="text-6xl">{result.emoji}</div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a1a1a]">{result.name}</h2>
            <p className="max-w-sm text-[#1a1a1a]/70">{result.blurb}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5" style={{ fontFamily: "system-ui, sans-serif" }}>
              <button onClick={start} className="rounded-full bg-[#1a1a1a] px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]">Play again</button>
              <button onClick={share} className="rounded-full border border-[#1a1a1a]/25 px-5 py-2 text-sm font-medium text-[#1a1a1a] transition-colors hover:border-[#1a1a1a]/50">
                {copied ? "Copied!" : "Share result"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes cy-pop {0%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.9)}}`}</style>
    </main>
  );
}
