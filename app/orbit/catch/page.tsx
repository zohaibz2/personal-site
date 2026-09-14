"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Trait = "bold" | "curious" | "chaos" | "warmth" | "ambition" | "whimsy";

const POOL: { e: string; t: Trait }[] = [
  // bold
  { e: "🔥", t: "bold" }, { e: "🚀", t: "bold" }, { e: "⚡", t: "bold" }, { e: "🥊", t: "bold" },
  { e: "🏎️", t: "bold" }, { e: "🗡️", t: "bold" }, { e: "💥", t: "bold" }, { e: "🎯", t: "bold" },
  { e: "🧗", t: "bold" }, { e: "🪂", t: "bold" }, { e: "🏍️", t: "bold" }, { e: "🥋", t: "bold" },
  { e: "🏹", t: "bold" }, { e: "🦁", t: "bold" }, { e: "🏈", t: "bold" }, { e: "🏂", t: "bold" },
  // curious
  { e: "📚", t: "curious" }, { e: "🔭", t: "curious" }, { e: "🧠", t: "curious" }, { e: "🔬", t: "curious" },
  { e: "🧪", t: "curious" }, { e: "💡", t: "curious" }, { e: "🗺️", t: "curious" }, { e: "🧩", t: "curious" },
  { e: "🔍", t: "curious" }, { e: "🧭", t: "curious" }, { e: "📖", t: "curious" }, { e: "🪐", t: "curious" },
  { e: "🧬", t: "curious" }, { e: "📐", t: "curious" }, { e: "🖋️", t: "curious" }, { e: "♟️", t: "curious" },
  // chaos
  { e: "🎲", t: "chaos" }, { e: "🌪️", t: "chaos" }, { e: "🎰", t: "chaos" }, { e: "🧨", t: "chaos" },
  { e: "🌀", t: "chaos" }, { e: "🤪", t: "chaos" }, { e: "👻", t: "chaos" }, { e: "🎢", t: "chaos" },
  { e: "🐙", t: "chaos" }, { e: "🪩", t: "chaos" }, { e: "🎆", t: "chaos" }, { e: "🕹️", t: "chaos" },
  { e: "🦖", t: "chaos" }, { e: "🃏", t: "chaos" }, { e: "🛸", t: "chaos" }, { e: "🪤", t: "chaos" },
  // warmth
  { e: "🌱", t: "warmth" }, { e: "🐶", t: "warmth" }, { e: "🫂", t: "warmth" }, { e: "🧸", t: "warmth" },
  { e: "☕", t: "warmth" }, { e: "🍪", t: "warmth" }, { e: "🕯️", t: "warmth" }, { e: "🏡", t: "warmth" },
  { e: "🤝", t: "warmth" }, { e: "💌", t: "warmth" }, { e: "🐣", t: "warmth" }, { e: "🫖", t: "warmth" },
  { e: "🍯", t: "warmth" }, { e: "🧶", t: "warmth" }, { e: "🌻", t: "warmth" }, { e: "🥰", t: "warmth" },
  // ambition
  { e: "💰", t: "ambition" }, { e: "🏆", t: "ambition" }, { e: "👑", t: "ambition" }, { e: "💎", t: "ambition" },
  { e: "📈", t: "ambition" }, { e: "🏗️", t: "ambition" }, { e: "💼", t: "ambition" }, { e: "⌚", t: "ambition" },
  { e: "🥇", t: "ambition" }, { e: "🎩", t: "ambition" }, { e: "🏦", t: "ambition" }, { e: "🪙", t: "ambition" },
  { e: "📊", t: "ambition" }, { e: "🗽", t: "ambition" }, { e: "🦅", t: "ambition" }, { e: "🚁", t: "ambition" },
  // whimsy
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
  if (tally[top] - tally[sorted[5]] <= 1) return ENIGMA; // very even spread
  if (tally[top] - tally[second] <= 1) {
    const combo = COMBOS.find(
      (c) => (c.a === top && c.b === second) || (c.a === second && c.b === top)
    );
    if (combo) return combo.r;
  }
  return BASE[top];
}

const TOTAL = 10;

export default function CatchGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const objRef = useRef(new Map<number, { y: number; vy: number; el: HTMLButtonElement | null }>());
  const idRef = useRef(0);
  const rafRef = useRef(0);
  const spawnRef = useRef<number | undefined>(undefined);
  const lastRef = useRef(0);

  const [list, setList] = useState<{ id: number; e: string; t: Trait; left: number }[]>([]);
  const [caught, setCaught] = useState<Trait[]>([]);
  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  function start() {
    setCaught([]);
    setResult(null);
    setList([]);
    setCopied(false);
    objRef.current.clear();
    setPhase("playing");
  }

  // spawn + fall loop
  useEffect(() => {
    if (phase !== "playing") return;

    const spawn = () => {
      const item = POOL[Math.floor(Math.random() * POOL.length)];
      const id = ++idRef.current;
      const left = 5 + Math.random() * 82;
      const vy = 85 + Math.random() * 70;
      objRef.current.set(id, { y: -50, vy, el: null });
      setList((l) => [...l, { id, e: item.e, t: item.t, left }]);
    };

    spawn();
    spawnRef.current = window.setInterval(spawn, 750);
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
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      if (spawnRef.current) clearInterval(spawnRef.current);
    };
  }, [phase]);

  // end when 10 caught
  useEffect(() => {
    if (phase === "playing" && caught.length >= TOTAL) {
      setResult(computeResult(caught));
      setPhase("done");
    }
  }, [caught, phase]);

  function grab(id: number, t: Trait) {
    if (!objRef.current.has(id)) return;
    objRef.current.delete(id);
    setList((l) => l.filter((x) => x.id !== id));
    setCaught((c) => (c.length >= TOTAL ? c : [...c, t]));
  }

  async function share() {
    if (!result) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = `I'm ${result.name} ${result.emoji} — ${result.blurb}\n\nFind your type: ${origin}/orbit/catch`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-14 md:py-20">
      <Link
        href="/orbit"
        className="text-xs uppercase tracking-[0.14em] text-[#1a1a1a]/45 transition-colors hover:text-[#c2410c]"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        &larr; Orbit
      </Link>

      <h1 className="mt-6 text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a]">
        Catch Yourself
      </h1>
      <p className="mt-2 mb-6 text-[#1a1a1a]/65">
        Catch the ten things that call to you — no overthinking. What you grab says
        more than you&apos;d like.
      </p>

      {phase === "playing" && (
        <div
          className="mb-3 text-sm font-medium text-[#1a1a1a]/60"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          Caught {caught.length}/{TOTAL}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative mx-auto h-[68vh] max-h-[560px] w-full overflow-hidden rounded-2xl border border-black/10 bg-white/60"
      >
        {/* falling objects */}
        {list.map((o) => (
          <button
            key={o.id}
            ref={(el) => {
              const rec = objRef.current.get(o.id);
              if (rec) {
                rec.el = el;
                if (el) el.style.transform = `translateY(${rec.y}px)`;
              }
            }}
            onClick={() => grab(o.id, o.t)}
            aria-label="catch"
            className="absolute cursor-pointer select-none p-1.5 leading-none transition-transform active:scale-90"
            style={{ left: `${o.left}%`, top: 0, fontSize: "2.4rem" }}
          >
            {o.e}
          </button>
        ))}

        {/* intro overlay */}
        {phase === "intro" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/70 px-8 text-center backdrop-blur-sm">
            <div className="text-5xl">🪄</div>
            <p className="max-w-sm text-[#1a1a1a]/70">
              Things will start falling. Tap the ten that pull at you fastest —
              gut, not brain. Then meet yourself.
            </p>
            <button
              onClick={start}
              className="mt-1 rounded-full bg-[#1a1a1a] px-6 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Start
            </button>
          </div>
        )}

        {/* result overlay */}
        {phase === "done" && result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/85 px-8 text-center backdrop-blur-sm">
            <div className="text-6xl">{result.emoji}</div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1a1a1a]">
              {result.name}
            </h2>
            <p className="max-w-sm text-[#1a1a1a]/70">{result.blurb}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5" style={{ fontFamily: "system-ui, sans-serif" }}>
              <button
                onClick={start}
                className="rounded-full bg-[#1a1a1a] px-5 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.03]"
              >
                Play again
              </button>
              <button
                onClick={share}
                className="rounded-full border border-[#1a1a1a]/25 px-5 py-2 text-sm font-medium text-[#1a1a1a] transition-colors hover:border-[#1a1a1a]/50"
              >
                {copied ? "Copied!" : "Share result"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
