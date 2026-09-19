import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Orbit — Zohaib Narejo",
  description: "A little universe of experiments, tools, and toys.",
};

const tools = [
  {
    title: "Catch Yourself",
    emoji: "🪄",
    href: "/orbit/catch",
    blurb: "Catch ten falling things and find out what kind of creature you are.",
  },
  {
    title: "Whisper Wall",
    emoji: "💬",
    href: "/whisper-wall.html",
    blurb: "Leave an anonymous whisper. Read what strangers left behind.",
  },
];

export default function OrbitPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <header className="mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a1a1a] mb-3">
          Orbit
        </h1>
        <p className="text-lg text-[#1a1a1a]/70 max-w-xl">
          A little universe of experiments, tools, and toys I&apos;m building —
          orbiting the main thing. Poke around.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="group flex flex-col rounded-2xl border border-black/10 bg-white/60 p-6 transition-colors hover:border-black/25"
          >
            <div className="text-4xl mb-4">{t.emoji}</div>
            <h2 className="text-xl font-semibold text-[#1a1a1a] transition-colors group-hover:text-[#c2410c]">
              {t.title}
            </h2>
            <p className="mt-1.5 text-[15px] leading-relaxed text-[#1a1a1a]/60">
              {t.blurb}
            </p>
            <span
              className="mt-4 text-xs uppercase tracking-[0.12em] text-[#c2410c]"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              Open &rarr;
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}