import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Venfound — Zohaib Narejo",
  description: "Venfound — from ideas to MVPs in 3-4 weeks.",
};

const sansStyle = { fontFamily: "system-ui, sans-serif" } as const;

const process = [
  {
    timeline: "1–3 days",
    title: "Discovery & Planning",
    body: "We dive deep into your goals, target audience, and technical requirements so we are aligned and set on a clear path forward.",
  },
  {
    timeline: "1–2 weeks",
    title: "Design",
    body: "We create the initial wireframes and design mockups — a visual blueprint — and tighten it with your feedback before a line is built.",
  },
  {
    timeline: "2–3 weeks",
    title: "Development",
    body: "We bring the design to life in Bubble.io, wiring up every feature while keeping scalability and security top of mind.",
  },
];

const selectedWork = [
  "Kodex — turns everyday know-how into fast, searchable videos so new hires ramp faster.",
  "StratAI — builds sales, hiring, and growth strategies, from outreach scripts to go-to-market plans.",
  "Odycy — a healthcare marketplace making care faster and more affordable to find and book.",
];

export default function Venfound() {
  return (
    <article className="mx-auto max-w-[720px] lg:max-w-5xl px-6 py-16 md:py-24">
      {/* Back link */}
      <Link
        href="/"
        className="inline-block text-sm text-[#1a1a1a]/60 transition-colors hover:text-[#1a1a1a]"
        style={sansStyle}
      >
        ← Zohaib Narejo
      </Link>

      {/* Title */}
      <header className="mt-8 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#091747]">
          Venfound
        </h1>
        <p className="mt-2 text-lg md:text-xl text-[#8f0397]">
          From ideas to MVPs in 3-4 weeks.
        </p>
        <a
          href="https://venfound.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#8f0397] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#b30dbd]"
          style={sansStyle}
        >
          venfound.com ↗
        </a>
      </header>

      {/* Splash */}
      <div className="relative aspect-[1600/734] overflow-hidden rounded-2xl border border-[#091747]/10 bg-[#f4f4f5]">
        <Image
          src="/work/venfound/main-header-v2.png"
          alt="Venfound — From Ideas to Impact"
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 720px"
          priority
        />
      </div>

      {/* What it is */}
      <section className="mt-14">
        <h2
          className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#8f0397]"
          style={sansStyle}
        >
          What it is
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          Venfound is a studio that transforms ideas into digital experiences.
          We take founders from a raw idea to a working MVP — usually in three
          to four weeks — so they can put something real in front of users
          instead of waiting months.
        </p>
      </section>

      {/* My role */}
      <section className="mt-12">
        <h2
          className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#8f0397]"
          style={sansStyle}
        >
          My role
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          I&apos;m cofounder and CEO of Venfound. I run the studio alongside
          Urooj Haider, who leads design — the same partner I build FitTree
          with.
        </p>
      </section>

      {/* How we work */}
      <section className="mt-12">
        <h2
          className="mb-4 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#8f0397]"
          style={sansStyle}
        >
          How we work
        </h2>
        <div className="flex flex-col gap-5">
          {process.map((step) => (
            <div key={step.title} className="flex flex-col gap-1">
              <span
                className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8f0397]/80"
                style={sansStyle}
              >
                Timeline: {step.timeline}
              </span>
              <h3 className="text-lg md:text-xl font-medium text-[#091747]">
                {step.title}
              </h3>
              <p className="text-base md:text-lg text-[#1a1a1a]/80 leading-[1.7]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
        <figure className="relative mt-8 aspect-[1307/711] overflow-hidden rounded-2xl border border-[#091747]/10 bg-[#f4f4f5]">
          <Image
            src="/work/venfound/our-process-v2.png"
            alt="Venfound process — Discovery, Design, Development"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </figure>
      </section>

      {/* The team */}
      <section className="mt-12">
        <h2
          className="mb-4 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#8f0397]"
          style={sansStyle}
        >
          The team
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          A small team of builders behind the vision — we&apos;ve helped 20+
          founders turn raw ideas into MVPs in under three to four weeks on
          average.
        </p>
        <figure className="relative mt-6 aspect-[1293/759] overflow-hidden rounded-2xl border border-[#091747]/10 bg-[#f4f4f5]">
          <Image
            src="/work/venfound/our-team-v2.png"
            alt="Meet the builders behind Venfound"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </figure>
      </section>

      {/* Selected work */}
      <section className="mt-12">
        <h2
          className="mb-4 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#8f0397]"
          style={sansStyle}
        >
          Selected work
        </h2>
        <ul className="list-none flex flex-col gap-4">
          {selectedWork.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-lg md:text-xl text-[#1a1a1a] leading-[1.7]"
            >
              <span className="mt-[0.35em] shrink-0 text-sm text-[#1a1a1a]/40">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <figure className="relative mt-6 aspect-[1321/733] overflow-hidden rounded-2xl border border-[#091747]/10 bg-[#f4f4f5]">
          <Image
            src="/work/venfound/our-work-v2.png"
            alt="Recent Venfound work — Kodex, StratAI, Odycy"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 720px"
          />
        </figure>
      </section>

      {/* Stack */}
      <section className="mt-12">
        <h2
          className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#8f0397]"
          style={sansStyle}
        >
          Stack
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          MVPs are built no-code on Bubble.io, designed in Figma — the
          combination that lets us ship a real product in weeks, not months.
        </p>
      </section>

      {/* Status */}
      <section className="mt-12">
        <h2
          className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#8f0397]"
          style={sansStyle}
        >
          Status
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          Live and taking on new founders — 20+ shipped so far.
        </p>
      </section>

      {/* Visit site — closing */}
      <div className="mt-14">
        <a
          href="https://venfound.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#8f0397] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#b30dbd]"
          style={sansStyle}
        >
          venfound.com ↗
        </a>
      </div>
    </article>
  );
}
