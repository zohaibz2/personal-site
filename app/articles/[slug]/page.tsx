import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
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

  const dateLabel = new Date(article.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  return (
    <main className="relative min-h-screen">
      {/* Fixed background image (works reliably on mobile too) */}
      <div
        aria-hidden
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div aria-hidden className="fixed inset-0 -z-10 bg-black/25" />

      <article className="mx-auto w-full max-w-[820px] px-4 py-12 md:py-20">
        {/* Floating white card, echoing an editorial spread */}
        <div className="rounded-2xl bg-white px-6 py-12 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] md:px-16 md:py-16">
          <div className="mb-10 text-center">
            <div
              className="mb-5 text-xs uppercase tracking-[0.16em] text-[#c2410c]"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              {dateLabel}
            </div>
            <h1 className="text-4xl leading-[1.05] font-bold tracking-tight text-[#1a1a1a] md:text-5xl">
              {article.heading}
            </h1>
            {article.subheading && (
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#1a1a1a]/70 md:text-xl">
                {article.subheading}
              </p>
            )}
          </div>

          <div className="article-body">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-12 border-t border-[#1a1a1a]/10 pt-6 text-center">
            <Link
              href="/articles"
              className="text-sm text-[#c2410c] transition-colors hover:text-[#ea580c]"
              style={{ fontFamily: "system-ui, sans-serif" }}
            >
              &larr; All articles
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
