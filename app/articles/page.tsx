import Link from "next/link";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ArticleCard = {
  slug: string;
  heading: string;
  subheading: string | null;
  created_at: string;
};

async function getArticles(): Promise<ArticleCard[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("articles")
    .select("slug, heading, subheading, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data as ArticleCard[]) ?? [];
}

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <main className="mx-auto max-w-[640px] lg:max-w-3xl px-6 py-20 md:py-28">
      <h1 className="text-3xl md:text-4xl font-medium text-[#1a1a1a] mb-3">
        Articles
      </h1>
      <p className="text-lg text-[#1a1a1a]/70 mb-14">
        Things I&apos;ve been writing about — building, startups, and the web.
      </p>

      {articles.length === 0 ? (
        <p className="text-[#1a1a1a]/60">New writing is on the way.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-[#1a1a1a]/10">
          {articles.map((a) => (
            <li key={a.slug} className="py-8 first:pt-0">
              <Link href={`/articles/${a.slug}`} className="group block">
                <div className="text-sm text-[#c2410c] mb-2">
                  {new Date(a.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                  })}
                </div>
                <h2 className="text-xl md:text-2xl font-medium text-[#1a1a1a] transition-colors group-hover:text-[#c2410c]">
                  {a.heading}
                </h2>
                {a.subheading && (
                  <p className="mt-2 text-base md:text-lg leading-relaxed text-[#1a1a1a]/70">
                    {a.subheading}
                  </p>
                )}
                <span className="mt-3 inline-block text-sm text-[#c2410c]">
                  Read &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
