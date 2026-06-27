import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kodex — Zohaib Narejo",
  description: "Kodex — video-first knowledge platform for fast, searchable team onboarding.",
};

const sansStyle = { fontFamily: "system-ui, sans-serif" } as const;

const whatIBuilt = [
  {
    title: "User-Centric Architecture",
    body: "Grounded the entire system in insights from 10 in-depth user interviews across product, engineering, and operations.",
  },
  {
    title: "Seamless Video Capture",
    body: "Built a streamlined video recording and upload pipeline based on the insight that employees prefer explaining over writing.",
  },
  {
    title: "AI-Powered Automation",
    body: "Integrated automated transcription and summary generation so documentation stays low-effort and easy to maintain.",
  },
  {
    title: "Centralized Team Workspace",
    body: "Created a unified onboarding space for teams and departments to prevent information from getting scattered across Slack or Notion.",
  },
  {
    title: "Smart Content Taxonomy",
    body: "Designed a structured organization layer utilizing teams, categories, and tags to keep knowledge easily searchable.",
  },
];

export default function Kodex() {
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
        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#1a1a1a]">
          Kodex
        </h1>
        <p className="mt-2 text-lg md:text-xl text-[#c2410c]">
          Video-first knowledge platform for fast, searchable team onboarding.
        </p>
        <a
          href="https://www.youtube.com/watch?si=oJbVOX3KoX_t3-RJ&v=DvqSBaqIpCA&feature=youtu.be"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c2410c] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#ea580c]"
          style={sansStyle}
        >
          Watch demo →
        </a>
      </header>

      {/* Splash */}
      <div className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
        <Image
          src="/work/kodex/main-header.png"
          alt="Kodex — Video-first knowledge platform"
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 720px"
          priority
        />
      </div>

      {/* The problem */}
      <section className="mt-14">
        <h2
          className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]"
          style={sansStyle}
        >
          The problem
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          Teams invest significant time upskilling themselves, yet critical
          expertise remains scattered across meetings, Slack threads, and
          individual knowledge silos. This makes onboarding slow, repetitive,
          and vulnerable to loss when team members leave or shift roles. Kodex
          gives that expertise a permanent, searchable home.
        </p>
      </section>

      {/* My role */}
      <section className="mt-12">
        <h2
          className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]"
          style={sansStyle}
        >
          My role
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          Lead Developer &amp; Designer. I led the end-to-end process from UX
          research and affinity mapping through information architecture,
          interaction design, and final MVP development for a founder based in
          Greater Chicago.
        </p>
      </section>

      {/* What I built */}
      <section className="mt-12">
        <h2
          className="mb-4 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]"
          style={sansStyle}
        >
          What I built
        </h2>
        <div className="flex flex-col gap-5">
          {whatIBuilt.map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="mt-[0.35em] shrink-0 text-sm text-[#1a1a1a]/40">—</span>
              <div>
                <span className="text-lg md:text-xl font-medium text-[#1a1a1a]">
                  {item.title}:{" "}
                </span>
                <span className="text-lg md:text-xl text-[#1a1a1a]/80 leading-[1.7]">
                  {item.body}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Screenshots */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <figure className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
          <Image
            src="/work/kodex/dashboard.png"
            alt="Kodex dashboard"
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 360px"
          />
        </figure>
        <figure className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
          <Image
            src="/work/kodex/transcript.png"
            alt="Kodex transcript view"
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 360px"
          />
        </figure>
        <figure className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4] sm:col-span-2">
          <Image
            src="/work/kodex/ai-summary.png"
            alt="Kodex AI summary"
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 720px"
          />
        </figure>
      </div>

      {/* Stack */}
      <section className="mt-12">
        <h2
          className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]"
          style={sansStyle}
        >
          Stack
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          Built on Bubble.io with AI-powered video, transcription, and summary
          integrations. Designed, prototyped, and UX-researched in Figma.
        </p>
      </section>

      {/* Status */}
      <section className="mt-12">
        <h2
          className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]"
          style={sansStyle}
        >
          Status
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          Resting in peace. Fully built, beautifully designed, and successfully
          launched — right before the founder decided to take the idea behind
          the barn and shoot it. RIP Kodex — gone too soon, but the video demo
          lives on to prove it actually existed.
        </p>
      </section>

      {/* Watch demo — closing */}
      <div className="mt-14">
        <a
          href="https://www.youtube.com/watch?si=oJbVOX3KoX_t3-RJ&v=DvqSBaqIpCA&feature=youtu.be"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#c2410c] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#ea580c]"
          style={sansStyle}
        >
          Watch demo →
        </a>
      </div>
    </article>
  );
}
