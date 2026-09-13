import Link from "next/link";
import ArticleCover from "./ArticleCover";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ArticleCard = {
  slug: string;
  heading: string;
  subheading: string | null;
  created_at: string;
  category?: string | null;
  cover_image?: string | null;
};

const BASE_COLUMNS = "slug, heading, subheading, created_at";
const RICH_COLUMNS = "slug, heading, subheading, created_at, category, cover_image";

async function getArticles(): Promise<ArticleCard[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServiceClient();

  // Try the richer columns first (category / cover_image). If those columns
  // don't exist on the table yet, Supabase returns an error — in that case we
  // fall back to the base column set so the page keeps working. This means the
  // category pills and real thumbnails light up automatically once those two
  // columns are added, with no further change to this file.
  const rich = await supabase
    .from("articles")
    .select(RICH_COLUMNS)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (!rich.error) return (rich.data as ArticleCard[]) ?? [];

  const base = await supabase
    .from("articles")
    .select(BASE_COLUMNS)
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (base.data as ArticleCard[]) ?? [];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const SANS = { fontFamily: "system-ui, sans-serif" } as const;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const articles = await getArticles();

  // Categories are derived from the data. The filter is done server-side via
  // the ?category= query param, so it works without any client-side JS.
  const categories = Array.from(
    new Set(
      articles
        .map((a) => (a.category ?? "").trim())
        .filter((c) => c.length > 0)
    )
  );

  const active = (category ?? "all").trim();
  const isAll = active.toLowerCase() === "all";
  const visible = isAll
    ? articles
    : articles.filter(
        (a) => (a.category ?? "").toLowerCase() === active.toLowerCase()
      );

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      {/* Page header */}
      <header className="mb-10 md:mb-14">
        <h1 className="text-3xl md:text-4xl font-medium text-[#1a1a1a] mb-3">
          Articles
        </h1>
        <p className="text-lg text-[#1a1a1a]/70">
          Things I&apos;ve been writing about — building, startups, and the web.
        </p>
      </header>

      {/* Category filter row (only shown when categories exist in the data) */}
      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-[#1a1a1a]/10 pb-6">
          <span
            className="mr-1 text-[11px] uppercase tracking-[0.14em] text-[#1a1a1a]/40"
            style={SANS}
          >
            Categories
          </span>

          <FilterPill label="All" href="/articles" active={isAll} />
          {categories.map((c) => (
            <FilterPill
              key={c}
              label={c}
              href={`/articles?category=${encodeURIComponent(c)}`}
              active={!isAll && active.toLowerCase() === c.toLowerCase()}
            />
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-[#1a1a1a]/60">
          {articles.length === 0
            ? "New writing is on the way."
            : "Nothing in this category yet."}
        </p>
      ) : (
        // Connected-line grid: outer frame from top/left on the wrapper,
        // right/bottom from each card. Handles partial last rows cleanly.
        <div className="border-t border-l border-[#1a1a1a]/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((a) => (
              <ArticleCardItem key={a.slug} article={a} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

function FilterPill({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      style={SANS}
      className={
        "rounded-full border px-3.5 py-1 text-xs transition-colors " +
        (active
          ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
          : "border-[#1a1a1a]/20 text-[#1a1a1a]/70 hover:border-[#1a1a1a]/40 hover:text-[#1a1a1a]")
      }
    >
      {label}
    </Link>
  );
}

function ArticleCardItem({ article: a }: { article: ArticleCard }) {
  const href = `/articles/${a.slug}`;

  return (
    <article className="group flex flex-col border-b border-r border-[#1a1a1a]/10 p-5 md:p-6">
      {/* Date + category tag */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className="text-[11px] uppercase tracking-[0.1em] text-[#1a1a1a]/40"
          style={SANS}
        >
          {formatDate(a.created_at)}
        </span>
        {a.category && (
          <span
            className="rounded-full border border-[#1a1a1a]/20 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[#1a1a1a]/55"
            style={SANS}
          >
            {a.category}
          </span>
        )}
      </div>

      {/* Thumbnail — local image from /public/articles, else a branded placeholder */}
      <Link href={href} className="block overflow-hidden">
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#f6ede7]">
          <ArticleCover
            slug={a.slug}
            heading={a.heading}
            imageUrl={a.cover_image}
          />
        </div>
      </Link>

      {/* Heading */}
      <h2 className="mt-5 text-xl font-medium leading-snug text-[#1a1a1a] transition-colors group-hover:text-[#c2410c]">
        <Link href={href}>{a.heading}</Link>
      </h2>

      {/* Excerpt */}
      {a.subheading && (
        <p className="mt-2 text-[15px] leading-relaxed text-[#1a1a1a]/65">
          {a.subheading}
        </p>
      )}

      {/* Read more */}
      <Link
        href={href}
        style={SANS}
        className="mt-auto pt-5 text-xs uppercase tracking-[0.12em] text-[#c2410c] underline decoration-[#c2410c]/30 underline-offset-4 transition-colors hover:decoration-[#c2410c]"
      >
        Read more
      </Link>
    </article>
  );
}
