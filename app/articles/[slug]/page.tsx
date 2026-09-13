import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCover from "../ArticleCover";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase";

// Always read fresh so a newly published article shows immediately.
export const dynamic = "force-dynamic";

type Article = {
  id: string;
  slug: string;
  heading: string;
  subheading: string | null;
  content: string;
  published: boolean;
  created_at: string;
};

async function getArticle(slug: string): Promise<Article | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as Article) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article — Zohaib Narejo" };
  return {
    title: `${article.heading} — Zohaib Narejo`,
    description: article.subheading ?? article.heading,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const paragraphs = article.content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className="min-h-screen bg-[#f4f1ea]">
      <article className="mx-auto w-full max-w-[640px] px-6 py-14 md:py-20">
        {/* Back link */}
        <Link
          href="/articles"
          className="text-xs uppercase tracking-[0.14em] text-[#1a1a1a]/45 transition-colors hover:text-[#c2410c]"
          style={{ fontFamily: "system-ui, sans-serif" }}
        >
          &larr; Articles
        </Link>

        {/* Title */}
        <h1 className="mt-8 text-[2rem] font-bold leading-[1.12] tracking-tight text-[#1a1a1a] md:text-[2.7rem]">
          {article.heading}
        </h1>

        {/* Cover image */}
        <div className="relative mt-8 aspect-[3/2] w-full overflow-hidden bg-[#e7e2d7]">
          <ArticleCover slug={article.slug} heading={article.heading} />
        </div>

        {/* Optional italic lead (the subheading) */}
        {article.subheading && (
          <p className="mt-10 text-[1.15rem] italic leading-relaxed text-[#1a1a1a]/75">
            {article.subheading}
          </p>
        )}

        {/* Body */}
        <div className="mt-6 space-y-6">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-justify text-[1.0625rem] leading-[1.75] text-[#221f1b] [hyphens:auto] md:text-[1.125rem]"
            >
              {p}
            </p>
          ))}
        </div>
      </article>
    </main>
  );
}
