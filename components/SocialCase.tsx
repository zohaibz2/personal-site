import Image from "next/image";
import Link from "next/link";

// A social media project's page: laid out like the other case studies (back
// link, title, orange line), then an optional results row, the reels (which
// only download when someone presses play; until then each shows a still)
// and any posts.

type Reel = { src: string; still: string; caption: string };
type Post = { src: string; alt: string; caption: string; width: number; height: number };
type Stat = { value: string; label: string };

type Props = {
  title: string;
  tagline: string;
  about: string;
  stats?: Stat[];
  reels: Reel[];
  posts?: Post[];
};

const ui = { fontFamily: "var(--font-ui)" } as const;
const EYEBROW = "mb-5 text-xs md:text-sm font-semibold uppercase tracking-[0.15em] text-[#c2410c]";
const SHADOW = "shadow-[0_8px_20px_-14px_rgba(234,88,12,0.18)]";

export default function SocialCase({ title, tagline, about, stats, reels, posts }: Props) {
  const reelCols = reels.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";
  return (
    <article className="mx-auto max-w-[640px] lg:max-w-5xl px-6 py-16 md:py-24">
      <Link href="/portfolio" className="inline-block text-sm text-[#1a1a1a]/60 transition-colors hover:text-[#1a1a1a]" style={ui}>
        &larr; Portfolio
      </Link>

      <header className="mt-8 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#1a1a1a]">{title}</h1>
        <p className="mt-2 text-lg md:text-xl text-[#c2410c]">{tagline}</p>
        <p className="mt-4 max-w-3xl text-lg md:text-xl text-[#1a1a1a]/70 leading-relaxed">{about}</p>
      </header>

      {stats && stats.length > 0 && (
        <section className="mb-14">
          <h2 className={EYEBROW} style={ui}>Results</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className={`rounded-2xl border border-black/[0.072] bg-white px-5 py-4 ${SHADOW}`}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-2xl md:text-3xl font-semibold text-[#1a1a1a]">{s.value}</span>
                  <span className="mt-1 block text-base text-[#1a1a1a]/60">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section>
        <h2 className={EYEBROW} style={ui}>Reels</h2>
        <div className={`grid grid-cols-1 ${reelCols} gap-6`}>
          {reels.map((r) => (
            <figure key={r.src} className="mx-auto w-full max-w-[320px] sm:max-w-none">
              <video
                src={r.src}
                poster={r.still}
                controls
                playsInline
                preload="none"
                aria-label={r.caption}
                className={`aspect-[9/16] w-full rounded-2xl bg-black object-cover ${SHADOW}`}
              />
              <figcaption className="mt-3 text-base text-[#1a1a1a]/70 leading-relaxed">{r.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {posts && posts.length > 0 && (
        <section className="mt-14">
          <h2 className={EYEBROW} style={ui}>Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {posts.map((p) => (
              <figure key={p.src}>
                <div className={`overflow-hidden rounded-2xl border border-black/[0.072] ${SHADOW}`}>
                  <Image src={p.src} alt={p.alt} width={p.width} height={p.height} sizes="(max-width: 640px) 100vw, 320px" className="h-auto w-full" />
                </div>
                <figcaption className="mt-3 text-base text-[#1a1a1a]/70 leading-relaxed">{p.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
