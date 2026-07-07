import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Getlivestock — Zohaib Narejo",
  description:
    "Getlivestock — revolutionizing the livestock supply chain through organic, farm-to-table efficiency.",
};

const sansStyle = { fontFamily: "system-ui, sans-serif" } as const;

const features = [
  "Organic Production Model: Pioneered an organic, stress-free raising methodology for goats, sheep, buffaloes, and bulls, ensuring healthier end-products at a lower market price.",
  "Supply Chain Research & Pivot: Conducted extensive operational testing by scaling livestock operations in Karachi, which provided the data-driven insights necessary to optimize cost-per-animal economics.",
  "Infrastructure Engineering: Designed and directed the construction of a custom 1,000-yard livestock farm in Mirpurkhas, engineered to solve the logistics and operational overheads identified during previous phases.",
  "Sustainable Farm Ecosystem: Built a scalable farm infrastructure nearing completion, designed to transition from a pilot project to full, operational capacity within two months.",
];

export default function Getlivestock() {
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
          Getlivestock
        </h1>
        <p className="mt-2 text-lg md:text-xl text-[#c2410c]">
          Revolutionizing the livestock supply chain through organic,
          farm-to-table efficiency.
        </p>
        <a
          href="https://getivestock-site.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c2410c] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#ea580c]"
          style={sansStyle}
        >
          Visit site →
        </a>
      </header>

      {/* Splash */}
      <div className="relative aspect-[1512/982] overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-[#f5f5f4]">
        <Image
          src="/work/getlivestock/splash.png"
          alt="Getlivestock"
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
          The livestock and agricultural supply chain in Pakistan is
          fundamentally broken. Witnessing extreme price volatility — such as
          tomatoes fluctuating from 10 PKR to 200 PKR on the same day — revealed
          massive inefficiencies. In the livestock sector, this manifests as
          exorbitant urban feeding costs that can triple production overhead,
          making quality meat unaffordable for the average consumer and
          unsustainable for the farmer.
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
          Founder &amp; CEO. I took a &quot;boots-on-the-ground&quot; approach by
          living with my animals full-time post-A-levels, performing every
          labor-intensive task to map out the supply chain friction. I am
          currently leading the architectural build-out of our new 1,000-yard
          facility.
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

      {/* Stack */}
      <section className="mt-12">
        <h2
          className="mb-3 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]"
          style={sansStyle}
        >
          Stack
        </h2>
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          Operational infrastructure design, organic livestock management
          protocols, supply chain logistics modeling, and project management.
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
          In rapid development. Following a tactical shutdown to accommodate BBA
          studies at Forman Christian College University, the new facility is
          currently in its final build-out phase and will be fully operational
          by September 2026.
        </p>
      </section>

      {/* Watch demo — closing */}
      <div className="mt-14">
        <a
          href="https://getivestock-site.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#c2410c] px-6 py-3 text-base md:text-lg text-white transition-colors duration-150 hover:bg-[#ea580c]"
          style={sansStyle}
        >
          Visit site →
        </a>
      </div>
    </article>
  );
}
