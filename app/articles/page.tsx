import Link from "next/link";

type Article = {
  title: string;
  date: string;
  excerpt: string;
  href: string;
};

// Add your articles here. `href` can be an external link (Medium, Substack, etc.)
// or an internal path once you create individual article pages.
const articles: Article[] = [
  {
    title: "How AI changes what one person can build in a week",
    date: "2026",
    excerpt:
      "Not just coding — the whole stack: design, copy, research, and marketing, and what that shift means for small teams that ship.",
    href: "#",
  },
  {
    title: "The Pakistani startup ecosystem deserves better documentation",
    date: "2026",
    excerpt:
      "Why it gets written about less than it should, and what I keep learning from the founders quietly building here.",
    href: "#",
  },
];

export default function ArticlesPage() {
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
            <li key={a.title} className="py-8 first:pt-0">
              <Link href={a.href} className="group block">
                <div className="text-sm text-[#c2410c] mb-2">{a.date}</div>
                <h2 className="text-xl md:text-2xl font-medium text-[#1a1a1a] transition-colors group-hover:text-[#c2410c]">
                  {a.title}
                </h2>
                <p className="mt-2 text-base md:text-lg leading-relaxed text-[#1a1a1a]/70">
                  {a.excerpt}
                </p>
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
