"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// ─── Project data ─────────────────────────────────────────────────────────────
// `category` puts each project under a filter tab: "Development",
// "Branding and Design", "Social Media" or "YouTube". Every tab always shows;
// one with no projects yet says its work is on the way.
type Category = "Development" | "Branding and Design" | "Social Media" | "YouTube";

const projects: {
  href: string;
  src: string;
  alt: string;
  title: string;
  description: string;
  category: Category;
  bg: string;
  hidden?: boolean;
  youtube?: string; // a YouTube video's id: its card plays it in place
}[] = [
  {
    href: "/work/getlivestock",
    hidden: true,
    src: "/work/getlivestock/splash.png",
    alt: "Narejo Farms",
    title: "Narejo Farms",
    description:
      "Revolutionizing Pakistan's livestock supply chain — organic, farm-to-table.",
    category: "Development",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/fittree",
    hidden: true,
    src: "/work/fittree/splash.png",
    alt: "FitTree",
    title: "FitTree",
    description: "Custom training plans with one shared link.",
    category: "Development",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/venfound",
    hidden: true,
    src: "/work/venfound/main-header-v2.png",
    alt: "Venfound",
    title: "Venfound",
    description: "From ideas to MVPs in 3-4 weeks.",
    category: "Development",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/stratai",
    src: "/work/stratai/main-header.jpeg",
    alt: "StratAI",
    title: "StratAI",
    description: "AI strategy platform — built and launched in under 3 weeks.",
    category: "Development",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/kodex",
    src: "/work/kodex/main-header.png",
    alt: "Kodex",
    title: "Kodex",
    description:
      "Video-first knowledge platform for fast, searchable team onboarding.",
    category: "Development",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/privately",
    src: "/work/privately/landing-page.png",
    alt: "Privately",
    title: "Privately Property",
    description:
      "Peer-to-peer real estate marketplace cutting out the middleman.",
    category: "Development",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/steady",
    src: "/work/branding/steady.jpg",
    alt: "The Steady brand board",
    title: "Steady",
    description: "Brand identity: wordmark, palette and packaging.",
    category: "Branding and Design",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/frylab",
    src: "/work/branding/frylab.jpg",
    alt: "The FryLab brand board",
    title: "FryLab",
    description: "Brand identity: logo, packaging and storefront.",
    category: "Branding and Design",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/narejo-farms-brand",
    src: "/work/branding/narejo-farms.jpg",
    alt: "The Narejo Farms brand board",
    title: "Narejo Farms",
    description: "Brand identity for my own farm.",
    category: "Branding and Design",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/venfound-social",
    src: "/work/social/cover.jpg",
    alt: "Venfound reels and posts",
    title: "Venfound on social media",
    description: "Reels and posts for Venfound\u2019s LinkedIn and Instagram.",
    category: "Social Media",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/ai-society",
    src: "/work/ai-society/cover.jpg",
    alt: "The AI Society reels",
    title: "The AI Society",
    description: "Reels on new AI tools, grown from 0 to 6,000 followers.",
    category: "Social Media",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/narejo-farms-social",
    src: "/work/narejo-farms-social/cover.jpg",
    alt: "Narejo Farms reels",
    title: "Narejo Farms",
    description: "Reels from the farm\u2019s mango season, back when it was Getlivestock.",
    category: "Social Media",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "/work/trainwithzohaib",
    src: "/work/trainwithzohaib/cover.jpg",
    alt: "Trainwithzohaib: How muscle grows",
    title: "Trainwithzohaib",
    description: "Fitness explainers in English. Own your training.",
    category: "Social Media",
    bg: "bg-[#f5f5f4]",
  },
  {
    href: "https://www.youtube.com/watch?v=0o8G1siXLNI",
    youtube: "0o8G1siXLNI",
    src: "/work/youtube/islamabad-ep01.jpg",
    alt: "First night in Islamabad, episode 1: heavy rain",
    title: "First night in Islamabad",
    description: "Episode 1: heavy rain on my first night in Islamabad.",
    category: "YouTube",
    bg: "bg-black",
  },
  {
    href: "https://www.youtube.com/watch?v=AaD7kLkEkw8",
    youtube: "AaD7kLkEkw8",
    src: "/work/youtube/kashmir-ep02.jpg",
    alt: "First day in Kashmir, episode 2: Kutton Waterfall",
    title: "First day in Kashmir",
    description: "Episode 2: Kutton Waterfall, on my first day in Kashmir.",
    category: "YouTube",
    bg: "bg-black",
  },
  {
    href: "https://www.youtube.com/watch?v=eXgxtqKCFN4",
    youtube: "eXgxtqKCFN4",
    src: "/work/youtube/kashmir-ep03.jpg",
    alt: "2nd day in Kashmir, episode 3: Shaal",
    title: "2nd day in Kashmir",
    description: "Episode 3: Shaal, on my second day in Kashmir.",
    category: "YouTube",
    bg: "bg-black",
  },
];

type Project = (typeof projects)[number];

function YouTubeCard({ p }: { p: Project }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-3 border border-black/[0.072] shadow-[0_8px_20px_-14px_rgba(234,88,12,0.18)]">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${p.youtube}?autoplay=1&rel=0`}
            title={p.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${p.title}`}
            className="group absolute inset-0 h-full w-full cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2410c]"
          >
            {/* no category badge here: a YouTube thumbnail is designed edge to edge */}
            <Image
              src={p.src}
              alt={p.alt}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#c2410c] text-white shadow-lg transition-colors group-hover:bg-[#ea580c]"
            >
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
        <h3 className="text-lg md:text-xl font-medium text-[#1a1a1a]">{p.title}</h3>
        <p className="text-base md:text-lg text-[#1a1a1a]/70 leading-relaxed">{p.description}</p>
        <a
          href={p.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-ui mt-4 w-fit text-sm text-[#c2410c] transition-colors hover:text-[#ea580c] rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2410c]"
        >
          Watch on YouTube &rarr;<span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </div>
  );
}

const filters = ["All", "Development", "Branding and Design", "Social Media", "YouTube"] as const;
type Filter = (typeof filters)[number];

export default function Work() {
  const [active, setActive] = useState<Filter>("All");

  const shown = projects.filter((p) => !p.hidden);
  const availableFilters = filters; // every tab always shows
  const visible = shown.filter(
    (p) => active === "All" || p.category === active
  );

  return (
    <section id="work" className="mx-auto max-w-[640px] lg:max-w-5xl px-6 py-16 md:py-24">
      <header className="mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#1a1a1a] mb-3">
          Portfolio
        </h1>
        <p className="text-lg text-[#1a1a1a]/70">
          Products I&apos;ve built with founders, from the first idea to launch.
        </p>
      </header>

      {/* Filter tabs */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-3xl bg-[#f5f5f4] p-1">
          {availableFilters.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setActive(f)}
                aria-pressed={isActive}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2410c] ${
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
        {visible.map((p) =>
          p.youtube ? (
            <YouTubeCard key={p.href} p={p} />
          ) : (
          <Link
            key={p.href}
            href={p.href}
            className="group flex h-full flex-col cursor-pointer rounded-2xl bg-white p-3 border border-black/[0.072] shadow-[0_8px_20px_-14px_rgba(234,88,12,0.18)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-16px_rgba(234,88,12,0.45)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
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
              <span className="font-ui mt-4 text-sm text-[#c2410c] group-hover:text-[#ea580c] transition-colors">View more &rarr;</span>
            </div>
          </Link>
          )
        )}
        {visible.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-black/15 px-6 py-14 text-center">
            <p className="text-lg md:text-xl text-[#1a1a1a]/70">This work is on its way. I&apos;m putting it together now.</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="flex justify-center mt-12">
        <a
          href="mailto:narejozohaib33@gmail.com"
          className="rounded-full bg-[#c2410c] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#ea580c]"
        >
          Let&apos;s build together
        </a>
      </div>
    </section>
  );
}
