import Image from "next/image";

// "In their words": quotes from founders and clients Zohaib has built with.
// To add one, add an entry to TESTIMONIALS. Each quote keeps its writer's own
// paragraphs; `highlight` is one phrase from it to mark (optional); `photo`
// is a path in /public (optional; initials are shown without one). With two
// or more, the cards sit side by side on wider screens.

type Testimonial = {
  name: string;
  roles: string[]; // each on its own line
  initials: string;
  photo?: string;
  quote: string[];
  highlight?: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Faheem Riaz",
    roles: ["Tax Associate at KPMG Pakistan", "Partner, Sehpeher"],
    initials: "FR",
    quote: [
      "I\u2019ve had the pleasure of building Sehpeher, our gifting brand, alongside Zohaib, and he\u2019s one of the most naturally talented marketers and communicators I\u2019ve worked with.",
      "My day job is tax and numbers, so I\u2019ve really come to appreciate what Zohaib brings to the table. He has a sharp instinct for what makes people stop and pay attention, and he knows how to turn a product into a story people want to be part of. His content is creative and polished, and it always feels true to the brand rather than forced.",
      "His communication is just as strong. He explains ideas clearly, listens well, and has a real knack for getting everyone on the same page. When the camera comes on, he\u2019s completely in his element. He\u2019s relaxed, confident and natural, and he has the kind of presence that makes you want to keep watching.",
      "It\u2019s rare to find someone who has the creative ideas and can also deliver them himself. If you\u2019re looking for someone who can shape a brand\u2019s voice and be the face of it too, I\u2019d recommend Zohaib without hesitation.",
    ],
    highlight: "he knows how to turn a product into a story people want to be part of",
  },
];

// a paragraph, with its highlighted phrase (if it has one) marked
function Paragraph({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <p>{text}</p>;
  return (
    <p>
      {text.slice(0, at)}
      <mark className="rounded bg-[#c2410c]/10 px-1 py-0.5 text-[#1a1a1a] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
        {highlight}
      </mark>
      {text.slice(at + highlight.length)}
    </p>
  );
}

export default function Testimonials() {
  const several = TESTIMONIALS.length > 1;
  return (
    <section id="testimonials" className="mx-auto max-w-[640px] lg:max-w-5xl px-6 pb-16 md:pb-24 scroll-mt-24">
      <h2 className="text-xl md:text-2xl font-medium text-[#1a1a1a]">In their words</h2>
      <p className="mt-2 mb-10 text-base md:text-lg text-[#1a1a1a]/60">From founders and clients I&rsquo;ve built with.</p>

      <div className={`grid grid-cols-1 gap-6 ${several ? "md:grid-cols-2" : ""}`}>
        {TESTIMONIALS.map((t) => (
          <figure
            key={t.name}
            className={`flex h-full flex-col rounded-2xl bg-white p-6 md:p-8 border border-black/[0.072] shadow-[0_8px_20px_-14px_rgba(234,88,12,0.18)] ${
              several ? "" : "md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,2.6fr)] md:gap-10"
            }`}
          >
            <blockquote className={`flex flex-col gap-4 text-lg md:text-xl text-[#1a1a1a]/75 leading-relaxed ${several ? "" : "order-1 md:order-2"}`}>
              {t.quote.map((para, i) => (
                <Paragraph
                  key={i}
                  text={(i === 0 ? "\u201c" : "") + para + (i === t.quote.length - 1 ? "\u201d" : "")}
                  highlight={t.highlight}
                />
              ))}
            </blockquote>

            {/* who said it (on its own, a single quote gets a column for this, with a big quotation mark) */}
            <figcaption className={several ? "mt-auto flex items-center gap-3 pt-8" : "order-2 md:order-1 flex flex-col gap-3 pt-8 md:pt-0"}>
              {!several && (
                <span aria-hidden="true" className="hidden md:block text-7xl leading-none text-[#c2410c]/30">
                  &ldquo;
                </span>
              )}
              <span className="flex items-center gap-3">
                {t.photo ? (
                  <Image src={t.photo} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c2410c]/10 text-sm font-medium text-[#c2410c]"
                  >
                    {t.initials}
                  </span>
                )}
                <span className="flex flex-col">
                  <span className="font-medium text-[#1a1a1a]">{t.name}</span>
                  {t.roles.map((r) => (
                    <span key={r} className="text-sm text-[#1a1a1a]/60">
                      {r}
                    </span>
                  ))}
                </span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
