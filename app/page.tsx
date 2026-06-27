import Image from "next/image";
import Link from "next/link";
import MillionDollarSprint from "@/components/MillionDollarSprint";

const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/zohaib-narejo-aa61192a8/" },
  { label: "Twitter", href: "https://x.com/NarejoZohaib" },
  { label: "Instagram", href: "https://www.instagram.com/zohaibnarejo._/" },
];

export default function Home() {
  return (
    <>
      {/* Social pills — fixed top-right */}
      <nav className="fixed top-5 right-5 z-50 hidden md:flex gap-2">
        {socialLinks.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 text-xs border border-[#1a1a1a] rounded-full text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white transition-colors duration-150"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {label}
          </a>
        ))}
      </nav>

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
              Founder &amp; podcaster.
            </p>
            <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-[#1a1a1a]">
              based in Karachi,&nbsp;Pakistan
            </h1>
          </div>
          <p className="text-lg md:text-xl text-[#1a1a1a] leading-relaxed max-w-md">
            Hi, I am Zohaib Narejo. I build things on the internet and talk to
            people who do the same.
          </p>
        </div>

      </section>

      {/* Story paragraph */}
      <section className="mx-auto max-w-[640px] lg:max-w-5xl px-6 py-16 md:py-24">
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

      <MillionDollarSprint />

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
      <section className="mx-auto max-w-[640px] lg:max-w-5xl px-6 pb-16 md:pb-24">
        <h2 className="text-xl md:text-2xl font-medium text-[#1a1a1a] mb-6">
          Work
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/work/fittree"
            className="group flex h-full flex-col cursor-pointer overflow-hidden rounded-2xl border border-[#1a1a1a]/10 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-[#1a1a1a]/25 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="relative aspect-[1512/982] overflow-hidden bg-[#f5f5f4]">
              <Image
                src="/work/fittree/splash.png"
                alt="FitTree"
                fill
                className="object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px"
              />
            </div>
            <div className="px-5 py-4">
              <h3 className="text-lg md:text-xl font-medium text-[#1a1a1a]">
                FitTree
              </h3>
              <p className="text-base md:text-lg text-[#1a1a1a]/70 leading-relaxed">
                Custom training plans with one shared link.
              </p>
            </div>
          </Link>
          <Link
            href="/work/venfound"
            className="group flex h-full flex-col cursor-pointer overflow-hidden rounded-2xl border border-[#1a1a1a]/10 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-[#1a1a1a]/25 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="relative aspect-[1512/982] overflow-hidden bg-[#f4f4f5]">
              <Image
                src="/work/venfound/main-header-v2.png"
                alt="Venfound"
                fill
                className="object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px"
              />
            </div>
            <div className="px-5 py-4">
              <h3 className="text-lg md:text-xl font-medium text-[#1a1a1a]">
                Venfound
              </h3>
              <p className="text-base md:text-lg text-[#1a1a1a]/70 leading-relaxed">
                From ideas to MVPs in 3-4 weeks.
              </p>
            </div>
          </Link>
          <Link
            href="/work/stratai"
            className="group flex h-full flex-col cursor-pointer overflow-hidden rounded-2xl border border-[#1a1a1a]/10 shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1.5 hover:border-[#1a1a1a]/25 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <div className="relative aspect-[1512/982] overflow-hidden bg-[#f4f4f5]">
              <Image
                src="/work/stratai/main-header.jpeg"
                alt="StratAI"
                fill
                className="object-cover object-top transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transform-none"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 320px"
              />
            </div>
            <div className="px-5 py-4">
              <h3 className="text-lg md:text-xl font-medium text-[#1a1a1a]">
                StratAI
              </h3>
              <p className="text-base md:text-lg text-[#1a1a1a]/70 leading-relaxed">
                AI strategy platform — built and launched in under 3 weeks.
              </p>
            </div>
          </Link>
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
