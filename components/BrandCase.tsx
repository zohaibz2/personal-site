import Image from "next/image";
import Link from "next/link";

// A branding project's page: laid out like the other case studies (back
// link, title, orange line), then the full brand board.

type Props = {
  title: string;
  tagline: string;
  about: string;
  board: { src: string; alt: string; width: number; height: number };
};

export default function BrandCase({ title, tagline, about, board }: Props) {
  return (
    <article className="mx-auto max-w-[640px] lg:max-w-5xl px-6 py-16 md:py-24">
      <Link
        href="/portfolio"
        className="inline-block text-sm text-[#1a1a1a]/60 transition-colors hover:text-[#1a1a1a]"
        style={{ fontFamily: "var(--font-ui)" }}
      >
        &larr; Portfolio
      </Link>

      <header className="mt-8 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#1a1a1a]">{title}</h1>
        <p className="mt-2 text-lg md:text-xl text-[#c2410c]">{tagline}</p>
        <p className="mt-4 max-w-3xl text-lg md:text-xl text-[#1a1a1a]/70 leading-relaxed">{about}</p>
      </header>

      <div className="mx-auto max-w-[640px] overflow-hidden rounded-2xl border border-black/[0.072] shadow-[0_8px_20px_-14px_rgba(234,88,12,0.18)]">
        <Image
          src={board.src}
          alt={board.alt}
          width={board.width}
          height={board.height}
          sizes="(max-width: 768px) 100vw, 640px"
          className="h-auto w-full"
          priority
        />
      </div>
    </article>
  );
}
