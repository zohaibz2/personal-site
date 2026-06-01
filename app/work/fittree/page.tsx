import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FitTree — Zohaib Narejo",
  description: "FitTree — custom training plans with one shared link.",
};

const sansStyle = { fontFamily: "system-ui, sans-serif" } as const;

const features = [
  "Trainer and client sign-up and login",
  "An exercise library where trainers add exercises through a simple form",
  "A drag-and-drop plan builder for creating a custom plan per client",
  "One shareable client link",
];

export default function FitTree() {
  return (
    <article className="mx-auto max-w-[720px] px-6 py-16 md:py-24">
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
          FitTree
        </h1>
        <p className="mt-2 text-lg md:text-xl text-[#c2410c]">
          Custom training plans with one shared link.
        </p>
        <a
          href="https://fitness-linktree.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c2410c] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#ea580c]"
          style={sansStyle}
        >
          Try it live →
        </a>
      </header>

      {/* Splash */}
      <div className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
        <Image
          src="/work/fittree/splash.png"
          alt="FitTree home screen"
          fill
          className="object-cover"
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
          For online trainers, building and sharing a workout plan is full of
          friction — it&apos;s scattered across spreadsheets, PDFs, and chat
          threads. FitTree turns it into a five-minute job: drag, drop, share.
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
          I built FitTree and I&apos;m a co-founder of the product. The design
          was done by my co-founder, Urooj.
        </p>
      </section>

      {/* What we built */}
      <section className="mt-12">
        <h2
          className="mb-4 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]"
          style={sansStyle}
        >
          What we built (MVP)
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
        <figure className="relative aspect-[1512/883] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
          <Image
            src="/work/fittree/login.png"
            alt="FitTree login screen"
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 360px"
          />
        </figure>
        <figure className="relative aspect-[1512/885] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
          <Image
            src="/work/fittree/signup.png"
            alt="FitTree sign-up screen"
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
          Built with Next.js, deployed on Vercel. Designed in Figma.
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
          Currently at MVP stage — live and testable.
        </p>
      </section>

      {/* Try it live — closing */}
      <div className="mt-14">
        <a
          href="https://fitness-linktree.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#c2410c] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#ea580c]"
          style={sansStyle}
        >
          Try it live →
        </a>
      </div>
    </article>
  );
}
