"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ─── Project data ─────────────────────────────────────────────────────────────
// `category` drives the filter tabs. Allowed values: "Vibecoded" | "Nocode".
// Three are confirmed from the reference (FitTree, StratAI, Kodex); the other
// three are best guesses — flip any `category` below to correct them.
type Category = "Vibecoded" | "Nocode";

const projects: {
  href: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  category: Category;
  bg: string;
}[] = [
  {
    href: "/work/getlivestock",
    src: "/work/getlivestock/splash.png",
    alt: "Getlivestock",
    title: "Getlivestock",
    description:
      "Revolutionizing Pakistan's livestock supply chain — organic, farm-to-table.",
    category: "Nocode", // ← guess, adjust if needed
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/fittree",
    src: "/work/fittree/splash.png",
    alt: "FitTree",
    title: "FitTree",
    description: "Custom training plans with one shared link.",
    category: "Vibecoded",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/venfound",
    src: "/work/venfound/main-header-v2.png",
    alt: "Venfound",
    title: "Venfound",
    description: "From ideas to MVPs in 3-4 weeks.",
    category: "Vibecoded", // ← guess, adjust if needed
    bg: "bg-[#f4f4f5]",
  },
  {
    href: "/work/stratai",
    src: "/work/stratai/main-header.jpeg",
    alt: "StratAI",
    title: "StratAI",
    description: "AI strategy platform — built and launched in under 3 weeks.",
    category: "Nocode",
    bg: "bg-[#f4f4f5]",
  },
  {
    href: "/work/kodex",
    src: "/work/kodex/main-header.png",
    alt: "Kodex",
    title: "Kodex",
    description:
      "Video-first knowledge platform for fast, searchable team onboarding.",
    category: "Nocode",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/privately",
    src: "/work/privately/landing-page.png",
    alt: "Privately",
    title: "Privately Property",
    description:
      "Peer-to-peer real estate marketplace cutting out the middleman.",
    category: "Nocode", // ← guess, adjust if needed
    bg: "bg-[#f5f5f4]",
  },
];

const filters = ["All", "Vibecoded", "Nocode"] as const;
type Filter = (typeof filters)[number];

export default function Work() {
  const [active, setActive] = useState<Filter>("All");

  const visible = projects.filter(
    (p) => active === "All" || p.category === active
  );

  return (
    <section className="mx-auto max-w-[640px] lg:max-w-5xl px-6 pb-16 md:pb-24">
      <h2 className="text-xl md:text-2xl font-medium text-[#1a1a1a] mb-6">
        Work
      </h2>

      {/* Filter tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-1 rounded-full bg-[#f5f5f4] p-1">
          {filters.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                aria-pressed={isActive}
                className={`rounded-full px-4 py-1.5 text-sm transition-colors duration-150 ${
                  isActive
                    ? "bg-white text-[#1a1a1a] shadow-sm"
                    : "text-[#1a1a1a]/55 hover:text-[#1a1a1a]"
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className="group flex h-full flex-col cursor-pointer rounded-2xl bg-white p-3 shadow-[0_8px_20px_-14px_rgba(234,88,12,0.18)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-16px_rgba(234,88,12,0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className={`relative aspect-[1512/982] overflow-hidden rounded-xl ${p.bg}`}>
              {/* Category badge */}
              <span className="absolute top-3 left-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#1a1a1a] shadow-sm backdrop-blur-sm">
                {p.category}
              </span>
              <Image
                src={p.src}
                alt={p.alt}
                fill
                className="object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px"
              />
            </div>
            <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
              <h3 className="text-lg md:text-xl font-medium text-[#1a1a1a]">
                {p.title}
              </h3>
              <p className="text-base md:text-lg text-[#1a1a1a]/70 leading-relaxed">
                {p.description}
              </p>
              <span className="mt-4 text-sm text-[#c2410c] group-hover:text-[#ea580c] transition-colors">
                View more
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-12">
        <a
          href="mailto:narejozohaib33@gmail.com"
          className="rounded-full bg-[#1a1a1a] px-8 py-3 text-base font-medium text-white transition-colors duration-150 hover:bg-[#333]"
        >
          Let&apos;s Build Together
        </a>
      </div>
    </section>
  );
}
