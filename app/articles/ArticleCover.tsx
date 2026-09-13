"use client";

import { useState } from "react";

/**
 * Renders an article's cover image from the local /public/articles folder.
 *
 * Convention: drop an image into  public/articles/<slug>.<ext>
 * where <slug> is the part after /articles/ in the article's URL, e.g.
 *   public/articles/leaving-for-lahore.jpg
 *
 * It tries the file in a few common formats (jpg, jpeg, png, webp). If none
 * exist, it falls back to a branded placeholder — so a missing image never
 * shows a broken-image icon, and you never have to edit code to add one.
 */
export default function ArticleCover({
  slug,
  heading,
  imageUrl,
}: {
  slug: string;
  heading: string;
  imageUrl?: string | null;
}) {
  const candidates = [
    ...(imageUrl ? [imageUrl] : []),
    `/articles/${slug}.jpg`,
    `/articles/${slug}.jpeg`,
    `/articles/${slug}.png`,
    `/articles/${slug}.webp`,
  ];

  const [index, setIndex] = useState(0);

  if (index < candidates.length) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={candidates[index]}
        src={candidates[index]}
        alt={heading}
        onError={() => setIndex((i) => i + 1)}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    );
  }

  // All candidates failed — show the placeholder.
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#fdece3] to-[#f4d6c4]">
      <span className="text-5xl font-semibold text-[#c2410c]/30 select-none">
        {heading.trim().charAt(0).toUpperCase() || "\u2022"}
      </span>
    </div>
  );
}
