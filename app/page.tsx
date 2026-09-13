import Image from "next/image";
import Work from "@/components/Work";
import Typewriter from "@/components/Typewriter";

export default function Home() {
  const companies = [
    {
      name: "Narejo Farms",
      role: "Founder",
      since: "2020",
      tagline:
        "I wasn't here for the quick buck. I was here to fix the supply chain.",
    },
    {
      name: "Venfound",
      role: "Co-founder",
      since: "2023",
      tagline: "From ideas to impact.",
    },
    {
      name: "FitTree",
      role: "Co-founder",
      since: "2026",
      tagline: "Train your clients with one simple link.",
    },
    {
      name: "StaLab",
      role: "Founder",
      since: "2026",
      tagline:
        "The Pakistani startup ecosystem, and why it deserves better documentation than it gets.",
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="flex flex-col md:flex-row md:min-h-screen md:items-center px-6 md:px-16 lg:px-24 py-16 md:py-0 gap-8 md:gap-12">

        {/* Left — photo */}
        <div className="flex justify-center md:justify-end md:w-[40%]">
          <div className="relative w-[260px] h-[340px] md:w-[360px] md:h-[460px] lg:w-[400px] lg:h-[500px]">
            <Image
              src="/me.png"
              alt="Zohaib Narejo"
              fill
              className="object-contain object-bottom"
              priority
            />
          </div>
        </div>

        {/* Right — text */}
        <div className="md:w-[60%] flex flex-col justify-center gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-lg md:text-xl text-[#c2410c]">
              Founder &amp; Marketeer.
            </p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#1a1a1a]">
              based in Karachi,&nbsp;Pakistan
            </h1>
          </div>
          <Typewriter
            className="text-lg md:text-xl text-[#1a1a1a] leading-relaxed max-w-md"
            text="Hi, I am Zohaib Narejo. I build things on the internet and talk to people who do the same."
          />
        </div>

      </section>

      {/* Story paragraph */}
      <section id="about" className="mx-auto max-w-[640px] lg:max-w-5xl px-6 py-16 md:py-24 scroll-mt-24">
        <p className="text-lg md:text-xl text-[#1a1a1a] leading-[1.8]">
          I have been making stuff and putting it online since I was 13 — a
          YouTube channel, a couple of e-commerce stores, small steps trying to
          figure out what I liked the most. These days I&apos;m doing fewer,
          bigger things. I run a small studio called{" "}
          <span className="text-[#c2410c]">Venfound</span>, where we build web
          products for founders. I also host{" "}
          <span className="text-[#c2410c]">StaLab</span>, where we explore the
          realities of building startups with the founders behind them.
          I&apos;m also doing my BBA at FCCU in Lahore, which I&apos;m slowly
          getting through.
        </p>
      </section>

      {/* Things on my mind */}
      <section className="mx-auto max-w-[640px] lg:max-w-5xl px-6 pb-16 md:pb-24">
        <h2 className="text-xl md:text-2xl font-medium text-[#1a1a1a] mb-6">
          Things on my mind lately
        </h2>
        <ul className="list-none flex flex-col gap-4">
          {[
            "How AI is changing what one person can build in a week — not just coding, but the whole stack: design, copy, research, marketing",
            "What it would take to make small parts of Pakistan's food system more sustainable",
            "The Pakistani startup ecosystem, and why it deserves better documentation than it gets",
            "Small teams that ship things, and what they do differently",
          ].map((item) => (
            <li key={item} className="flex gap-3 text-lg md:text-xl text-[#1a1a1a] leading-[1.7]">
              <span className="mt-[0.35em] shrink-0 text-sm text-[#1a1a1a]/40">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Work */}
      <Work />

      {/* Companies I've built */}
      <section
        id="companies"
        className="mx-auto max-w-[640px] lg:max-w-5xl px-6 pb-16 md:pb-24 scroll-mt-24"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <h2 className="mb-10 text-2xl md:text-3xl font-bold tracking-tight text-[#1a1a1a]">
          Companies I&apos;ve built
        </h2>
        <div className="flex flex-col">
          {companies.map((c, i) => (
            <div
              key={c.name}
              className={`py-6 md:py-7 ${i > 0 ? "border-t border-[#1a1a1a]/[0.08]" : ""}`}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg md:text-xl font-semibold tracking-tight text-[#1a1a1a]">
                  {c.name}
                </h3>
                <div className="flex shrink-0 items-baseline gap-4 text-right">
                  <span className="text-sm md:text-[15px] font-medium text-[#1a1a1a]/70">
                    {c.role}
                  </span>
                  <span className="text-sm text-[#1a1a1a]/35">
                    Since {c.since}
                  </span>
                </div>
              </div>
              <p className="mt-2 max-w-xl text-sm md:text-[15px] leading-relaxed text-[#1a1a1a]/50">
                {c.tagline}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-[640px] lg:max-w-5xl px-6 pb-28 md:pb-36 text-center">
        <p className="text-xl md:text-2xl text-[#1a1a1a] leading-relaxed mb-5">
          Drop me a line at{" "}
          <a
            href="mailto:narejozohaib33@gmail.com"
            className="text-[#c2410c] hover:text-[#ea580c] transition-colors"
          >
            narejozohaib33@gmail.com
          </a>
          . I read everything.
        </p>
        <p className="text-sm text-[#1a1a1a]/60" style={{ fontFamily: "system-ui, sans-serif" }}>
          <a href="https://www.linkedin.com/in/zohaib-narejo-aa61192a8/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] transition-colors">LinkedIn</a>
          <span className="mx-2">·</span>
          <a href="https://x.com/NarejoZohaib" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] transition-colors">Twitter</a>
          <span className="mx-2">·</span>
          <a href="https://www.instagram.com/zohaibnarejo._/" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1a1a] transition-colors">Instagram</a>
        </p>
      </section>
    </>
  );
}
