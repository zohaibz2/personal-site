import Image from "next/image";

// "Companies I've built", as part of the page (it used to be a separate
// page in a frame). Every fact here comes from narejofarms.com and
// venfound.com, plus two figures Zohaib gave: the farm's PKR 2M is assets
// he holds, and Venfound's PKR 10M is revenue over its past two years.
// They're different kinds of number, so they're never added together.
//
// Photos: add real ones to `photos` (put the files in /public/companies/).
// While a company has none, its card shows a designed panel instead.

type Photo = { src: string; alt: string; width: number; height: number };

type Company = {
  name: string;
  logo: string;
  role: string;
  url: string;
  site: string;
  story: string;
  quote?: string;
  number: string;
  numberLabel: string;
  facts: string[];
  milestones: string[];
  photos: Photo[];
  panel: { from: string; to: string; ink: string; route?: [string, string, string] };
};

const COMPANIES: Company[] = [
  {
    name: "Narejo Farms",
    logo: "/narejo-logo.png",
    role: "Founder",
    url: "https://www.narejofarms.com",
    site: "narejofarms.com",
    story:
      "A goat and buffalo farm on our own land in Mirpurkhas, Sindh, supplying Qurbani buyers in Karachi. It began in 2017 with 4,000 rupees of Eidi, and it has been rebuilt from zero more than once since.",
    quote:
      "I made a pact with myself: I would not quit until I had rebuilt this business from scratch at least 10 times.",
    number: "PKR 2M",
    numberLabel: "in farm assets",
    facts: ["Goats & buffalo", "Since 2017", "Mirpurkhas \u2192 Karachi, 250 km"],
    milestones: [
      "2017: started with 4,000 rupees of Eidi and the hunt for a first goat.",
      "2021: brought in a first partner and grew the herd to buffalo and goats.",
      "2023: started bringing our animals to Karachi buyers ourselves.",
      "2024: bought our own land in Mirpurkhas for a real farm.",
    ],
    photos: [],
    panel: { from: "#f3ead8", to: "#e2d2b3", ink: "#4a3a26", route: ["Mirpurkhas", "250 km", "Karachi"] },
  },
  {
    name: "Venfound",
    logo: "/venfound-logo.svg",
    role: "Cofounder & CEO",
    url: "https://www.venfound.com",
    site: "venfound.com",
    story:
      "A small, senior venture studio that turns founders\u2019 ideas into web products, from the first sketch to launch day. StratAI went from idea to launch in under three weeks.",
    number: "PKR 10M",
    numberLabel: "revenue in the past two years",
    facts: ["20+ founders served", "5 products launched"],
    milestones: [
      "Built and launched StratAI, an AI-powered strategy platform, in under 3 weeks.",
      "Built Kodex, a video-first knowledge platform for fast, searchable team onboarding.",
      "Designed Tolli\u2019s brand identity: wordmark, symbol and full visual system.",
      "Trusted by 20+ founders, including clients in the United States.",
    ],
    photos: [
      { src: "/work/venfound/main-header-v2.png", alt: "The Venfound website", width: 2940, height: 1520 },
      { src: "/work/stratai/dashboard.jpeg", alt: "StratAI, an AI strategy platform built by Venfound", width: 2560, height: 1386 },
      { src: "/work/kodex/dashboard.png", alt: "Kodex, a video-first knowledge platform built by Venfound", width: 2940, height: 1664 },
    ],
    panel: { from: "#1c1b1f", to: "#2b2433", ink: "#ffffff" },
  },
];

function Media({ c }: { c: Company }) {
  const [main, ...rest] = c.photos;
  if (main) {
    return (
      <div className="flex flex-col gap-2">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#f5f5f4]">
          <Image src={main.src} alt={main.alt} fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, 480px" />
        </div>
        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {rest.slice(0, 2).map((p) => (
              <div key={p.src} className="relative aspect-[16/9] overflow-hidden rounded-lg bg-[#f5f5f4]">
                <Image src={p.src} alt={p.alt} fill className="object-cover object-top" sizes="(max-width: 768px) 50vw, 240px" />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  // no photos yet: a designed panel with the logo (and the farm's route)
  return (
    <div
      className="relative flex aspect-[16/9] flex-col items-center justify-center gap-5 overflow-hidden rounded-xl"
      style={{ background: `linear-gradient(135deg, ${c.panel.from}, ${c.panel.to})`, color: c.panel.ink }}
    >
      <Image src={c.logo} alt="" width={88} height={88} className="rounded-xl shadow-md" />
      {c.panel.route && (
        <div className="flex w-[78%] items-center gap-3 text-xs md:text-sm" style={{ fontFamily: "system-ui, sans-serif" }} aria-hidden="true">
          <span className="font-semibold">{c.panel.route[0]}</span>
          <span className="h-px flex-1 bg-current opacity-40" />
          <span className="whitespace-nowrap text-[11px] opacity-80">{c.panel.route[1]}</span>
          <span className="h-px flex-1 bg-current opacity-40" />
          <span className="font-semibold">{c.panel.route[2]}</span>
        </div>
      )}
    </div>
  );
}

export default function Companies() {
  return (
    <section id="companies" className="mx-auto max-w-[640px] lg:max-w-5xl px-6 pb-16 md:pb-24 scroll-mt-24">
      <h2 className="text-xl md:text-2xl font-medium text-[#1a1a1a] mb-10">Companies I&apos;ve built</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {COMPANIES.map((c) => (
          <article
            key={c.name}
            className="flex h-full flex-col rounded-2xl bg-white p-3 border border-black/[0.072] shadow-[0_8px_20px_-14px_rgba(234,88,12,0.18)]"
          >
            <Media c={c} />
            <div className="flex flex-1 flex-col px-2 pt-5 pb-2">
              <div className="flex items-center gap-3">
                <Image src={c.logo} alt="" width={36} height={36} className="rounded-lg" />
                <h3 className="text-lg md:text-xl font-medium text-[#1a1a1a]">{c.name}</h3>
                <span
                  className="ml-auto shrink-0 rounded-full bg-[#f5f5f4] px-3 py-1 text-xs font-medium text-[#1a1a1a]/75"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  {c.role}
                </span>
              </div>

              <p className="mt-4 text-base md:text-lg text-[#1a1a1a]/75 leading-relaxed">{c.story}</p>
              {c.quote && (
                <blockquote className="mt-4 border-l-2 border-[#c2410c]/50 pl-4 text-base md:text-lg italic text-[#1a1a1a]/85 leading-relaxed">
                  &ldquo;{c.quote}&rdquo;
                </blockquote>
              )}

              {/* one honest number */}
              <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                <span className="whitespace-nowrap text-2xl md:text-3xl font-semibold text-[#1a1a1a]" style={{ fontFamily: "system-ui, sans-serif" }}>
                  {c.number}
                </span>
                <span className="text-base text-[#1a1a1a]/60">{c.numberLabel}</span>
              </p>
              <ul className="mt-3 flex list-none flex-wrap gap-2 text-xs text-[#1a1a1a]/70" style={{ fontFamily: "system-ui, sans-serif" }}>
                {c.facts.map((f) => (
                  <li key={f} className="rounded-full bg-[#f5f5f4] px-2.5 py-1">
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-5">
              {/* milestones: a native disclosure, so it works by keyboard and touch */}
              <details className="group rounded-xl bg-[#fafaf9] px-4 py-3 [&_summary::-webkit-details-marker]:hidden">
                <summary
                  className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-[#1a1a1a] rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c2410c]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Milestones
                  <span aria-hidden="true" className="transition-transform duration-200 group-open:rotate-45 text-lg leading-none">+</span>
                </summary>
                <ul className="mt-3 flex list-none flex-col gap-2 text-base text-[#1a1a1a]/75 leading-relaxed">
                  {c.milestones.map((m) => (
                    <li key={m} className="flex gap-3">
                      <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c2410c]/60" aria-hidden="true" />
                      {m}
                    </li>
                  ))}
                </ul>
              </details>

              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex w-fit items-center gap-1 text-sm text-[#c2410c] hover:text-[#ea580c] transition-colors rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c2410c]"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                Visit {c.site} <span aria-hidden="true">&rarr;</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
