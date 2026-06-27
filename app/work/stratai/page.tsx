import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "StratAI — Zohaib Narejo",
  description: "StratAI — an AI-powered strategy platform built in under 3 weeks using Bubble.io.",
};

const sansStyle = { fontFamily: "system-ui, sans-serif" } as const;

const features = [
  "Personalized onboarding flow — users share their company, goals, challenges, and market position",
  "OpenAI-powered strategy engine that generates tailored business game plans",
  "Stripe-powered subscription payments with Starter, Pro, and Elite tiers",
  "Collaborative documents for saving and revisiting generated strategies",
  "Fully responsive design across desktop and mobile",
];

export default function StratAI() {
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
          StratAI
        </h1>
        <p className="mt-2 text-lg md:text-xl text-[#c2410c]">
          AI-powered strategy platform — built and launched in under 3 weeks.
        </p>
        <a
          href="https://www.youtube.com/watch?v=aX0CQCXA8L0&t=5s"
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
          src="/work/stratai/main-header.jpeg"
          alt="StratAI home screen"
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
          Founders and revenue teams waste days trying to piece together a coherent
          go-to-market strategy from playbooks, coaches, and consultants. StratAI
          replaces that process with a personalized AI strategy partner — one that
          understands your specific company, goals, and market, and delivers
          actionable plans in minutes instead of weeks.
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
          Lead Developer &amp; Designer. I built and designed StratAI end-to-end —
          from product architecture and Bubble.io development to UI design,
          AI integration, and Stripe payments — and took it from idea to live
          product in under three weeks.
        </p>
      </section>

      {/* What we built */}
      <section className="mt-12">
        <h2
          className="mb-4 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]"
          style={sansStyle}
        >
          What I built
        </h2>
        <ul className="list-none flex flex-col gap-4">
          {features.map((item) => (
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
      </section>

      {/* Screenshots */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <figure className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
          <Image
            src="/work/stratai/dashboard.jpeg"
            alt="StratAI chat dashboard"
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 360px"
          />
        </figure>
        <figure className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
          <Image
            src="/work/stratai/pricing.jpeg"
            alt="StratAI pricing page"
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 360px"
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
          Built on Bubble.io with OpenAI API integration and Stripe for payments.
          Designed in Figma. Prototyped and QA tested before launch.
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
          Live and production-ready. Launched July 2025.
        </p>
      </section>

      {/* Visit — closing */}
      <div className="mt-14">
        <a
          href="https://www.youtube.com/watch?v=aX0CQCXA8L0&t=5s"
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
