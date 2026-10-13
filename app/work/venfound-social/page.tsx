import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Venfound on social media \u2014 Zohaib Narejo",
  description: "Reels and posts Zohaib Narejo made for Venfound's LinkedIn and Instagram.",
};

const ui = { fontFamily: "var(--font-ui)" } as const;
const EYEBROW = "mb-5 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]";

// The reels only download when someone presses play (preload="none"); until
// then each shows a still from the reel.
const REELS = [
  { src: "/work/social/reel-lets-build-it.mp4", still: "/work/social/reel-lets-build-it.jpg", caption: "Got an idea? Need an MVP? Let\u2019s build it." },
  { src: "/work/social/reel-clients-online.mp4", still: "/work/social/reel-clients-online.jpg", caption: "Hey, business owner: get your clients online." },
  { src: "/work/social/reel-websites-that-grow.mp4", still: "/work/social/reel-websites-that-grow.jpg", caption: "We build websites that grow your business." },
];

const POSTS = [
  { src: "/work/social/post-ideas-to-impact.jpg", alt: "Venfound post: From ideas to impact, we build for founders!", caption: "The studio, in one line." },
  { src: "/work/social/post-six-months.jpg", alt: "Venfound post: Why do founders spend 6 months building something they'll never launch?", caption: "Cover for an Insights article." },
  { src: "/work/social/post-validate.jpg", alt: "Venfound post: Everybody tells you to validate your idea. Nobody tells you how.", caption: "Cover for an Insights article." },
];

export default function VenfoundSocial() {
  return (
    <article className="mx-auto max-w-[640px] lg:max-w-5xl px-6 py-16 md:py-24">
      <Link href="/portfolio" className="inline-block text-sm text-[#1a1a1a]/60 transition-colors hover:text-[#1a1a1a]" style={ui}>
        &larr; Portfolio
      </Link>

      <header className="mt-8 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#1a1a1a]">Venfound on social media</h1>
        <p className="mt-2 text-lg md:text-xl text-[#c2410c]">Reels and posts for Venfound&rsquo;s LinkedIn and Instagram.</p>
        <p className="mt-4 max-w-3xl text-lg md:text-xl text-[#1a1a1a]/70 leading-relaxed">
          Content for Venfound, the studio I co-founded: short reels about what we build, a post that says it in one line, and
          covers for the articles we write for founders.
        </p>
      </header>

      <section>
        <h2 className={EYEBROW} style={ui}>Reels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {REELS.map((r) => (
            <figure key={r.src} className="mx-auto w-full max-w-[320px] sm:max-w-none">
              <video
                src={r.src}
                poster={r.still}
                controls
                playsInline
                preload="none"
                aria-label={r.caption}
                className="aspect-[9/16] w-full rounded-2xl bg-black object-cover shadow-[0_8px_20px_-14px_rgba(234,88,12,0.18)]"
              />
              <figcaption className="mt-3 text-base text-[#1a1a1a]/70 leading-relaxed">{r.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className={EYEBROW} style={ui}>Posts</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {POSTS.map((p) => (
            <figure key={p.src}>
              <div className="overflow-hidden rounded-2xl border border-black/[0.072] shadow-[0_8px_20px_-14px_rgba(234,88,12,0.18)]">
                <Image src={p.src} alt={p.alt} width={1080} height={1350} sizes="(max-width: 640px) 100vw, 320px" className="h-auto w-full" />
              </div>
              <figcaption className="mt-3 text-base text-[#1a1a1a]/70 leading-relaxed">{p.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </article>
  );
}
