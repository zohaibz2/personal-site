import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privately Property — Zohaib Narejo",
  description: "Privately — peer-to-peer real estate marketplace cutting out the middleman for direct property transactions.",
};

const sansStyle = { fontFamily: "system-ui, sans-serif" } as const;

const whatIBuilt = [
  {
    title: "Direct-to-Consumer Onboarding & Hero UX",
    body: "Built a clean, action-oriented entry point for users to self-select their journey immediately as a buyer or seller.",
  },
  {
    title: "Granular Search & Discovery Engine",
    body: "Engineered an advanced filtering layout mapping out property type, price limits, exact floor/land sizes, and localized suburbs to deliver targeted matching with zero bloat.",
  },
  {
    title: "Step-by-Step Listing Onboarding",
    body: "Designed an intuitive, visual selection matrix for property amenities featuring a real-time progress tracker to drastically lower listing drop-off rates.",
  },
  {
    title: "Robust Multi-Role Seller Dashboard",
    body: "Programmed a secure ecosystem dashboard allowing sellers to track active listings under offer, monitor upcoming billing schedules, review direct buyer requests, and seamlessly connect with verified attorney networks.",
  },
  {
    title: "Smart Integrations & Core Infrastructure",
    body: "Integrated an OpenAI-backed engine for automated listing support, secure payment gateway infrastructure for subscription handling, and a custom relational database to handle lead generation pipeline metrics seamlessly.",
  },
];

export default function Privately() {
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
          Privately Property
        </h1>
        <p className="mt-2 text-lg md:text-xl text-[#c2410c]">
          Peer-to-peer real estate marketplace cutting out the middleman for direct property transactions.
        </p>
        <a
          href="https://privately.co.za"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c2410c] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#ea580c]"
          style={sansStyle}
        >
          Visit Privately Property →
        </a>
      </header>

      {/* Splash */}
      <div className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
        <Image
          src="/work/privately/landing-page.png"
          alt="Privately — Peer-to-peer real estate marketplace"
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
          Traditional real estate transactions are bogged down by expensive agent
          commissions and fragmented communication. Buyers and sellers waste
          thousands on middlemen just to find verified listings, coordinate legal
          help, and handle basic inquiries. Privately solves this by creating a
          direct, frictionless pipeline where users connect safely and settle
          deals on their own terms.
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
          Lead Designer &amp; Developer. I spearheaded the end-to-end product
          execution, from initial competitor analysis and product requirement
          definitions to full database architecture, UI/UX design, and
          cross-platform mobile-responsive Bubble.io development.
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
            src="/work/privately/property-search.png"
            alt="Privately property search"
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 360px"
          />
        </figure>
        <figure className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
          <Image
            src="/work/privately/property-listing-process.png"
            alt="Privately property listing process"
            fill
            className="object-cover object-top"
            sizes="(max-width: 640px) 100vw, 360px"
          />
        </figure>
        <figure className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4] sm:col-span-2">
          <Image
            src="/work/privately/seller-dashboard.png"
            alt="Privately seller dashboard"
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
          Built no-code on Bubble.io with OpenAI API, custom relational database
          schemas, and external Payment Gateway integrations. User flows,
          component wireframes, and responsive design prototypes engineered
          entirely in Figma.
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
          Live and production-ready. Launched in June 2026. Codebase optimized,
          user flows deployed, and actively enabling commission-free property
          transactions.
        </p>
      </section>

      {/* Visit — closing */}
      <div className="mt-14">
        <a
          href="https://privately.co.za"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#c2410c] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#ea580c]"
          style={sansStyle}
        >
          Visit Privately Property →
        </a>
      </div>
    </article>
  );
}
