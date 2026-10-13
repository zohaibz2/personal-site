import Image from "next/image";

// "In their words": quotes from founders and clients Zohaib has built with,
// laid out like a pair of cards. To add one, add an entry to TESTIMONIALS
// (the writer's own words, unedited; `highlight` is one phrase from it to
// mark). While the number of quotes is odd, an invitation card fills the
// last spot, so the cards always pair up; it disappears by itself when a
// real quote takes its place.

type Testimonial = {
  name: string;
  photo?: string;      // a path in /public; initials are shown without one
  initials: string;
  job: string;         // what they do
  tag?: string;        // how they know Zohaib, shown as a tag by the name
  quote: string[];     // their paragraphs, as written
  highlight?: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Faheem Riaz",
    photo: "/testimonials/faheem.jpg",
    initials: "FR",
    job: "Tax Associate at KPMG Pakistan",
    tag: "Partner, Sehpeher",
    quote: [
      "I\u2019ve had the pleasure of building Sehpeher, our gifting brand, alongside Zohaib, and he\u2019s one of the most naturally talented marketers and communicators I\u2019ve worked with.",
      "My day job is tax and numbers, so I\u2019ve really come to appreciate what Zohaib brings to the table. He has a sharp instinct for what makes people stop and pay attention, and he knows how to turn a product into a story people want to be part of. His content is creative and polished, and it always feels true to the brand rather than forced.",
      "His communication is just as strong. He explains ideas clearly, listens well, and has a real knack for getting everyone on the same page. When the camera comes on, he\u2019s completely in his element. He\u2019s relaxed, confident and natural, and he has the kind of presence that makes you want to keep watching.",
      "It\u2019s rare to find someone who has the creative ideas and can also deliver them himself. If you\u2019re looking for someone who can shape a brand\u2019s voice and be the face of it too, I\u2019d recommend Zohaib without hesitation.",
    ],
    highlight: "he knows how to turn a product into a story people want to be part of",
  },
  {
    // drafted for Urooj to read and approve before it goes live
    name: "Urooj Haider",
    photo: "/testimonials/urooj.jpg",
    initials: "UH",
    job: "UX Researcher \u00b7 MFA Experience Design, Northeastern",
    tag: "Cofounder, Venfound",
    quote: [
      "I co-founded Venfound with Zohaib, and one thing has been true from day one: he thinks big. Not in a vague, dreamy way. He sees where something could go, and then he actually goes after it.",
      "He thinks out of the box, too. Where most people see a wall, Zohaib sees a way around it. And when things go wrong, which in a studio they do, he doesn\u2019t waste time worrying about how bad it looks. He stays calm, finds the next move and gets everyone moving again.",
      "He\u2019s also the reason a lot of our projects exist. Zohaib works with our clients across the US, the UK and South Africa, and he makes it look easy. He builds trust quickly, understands what a founder actually needs, and locks in projects like it\u2019s a piece of cake. As the one who loves the research and design side, I can tell you a partner who brings the work in is priceless.",
      "If you want someone who will dream bigger than you and still close the deal, Zohaib is your person.",
    ],
    highlight: "locks in projects like it\u2019s a piece of cake",
  },
];

const EMAIL = "narejozohaib33@gmail.com";
const CARD = "flex h-full flex-col rounded-3xl bg-white p-8 md:p-9 shadow-[0_10px_34px_-14px_rgba(0,0,0,0.14)]";
const TEXT = "flex flex-col gap-4 text-base md:text-lg text-[#1a1a1a]/70 leading-relaxed";

// a paragraph, with its highlighted phrase (if it has one) marked in orange
function Paragraph({ text, highlight }: { text: string; highlight?: string }) {
  const at = highlight ? text.indexOf(highlight) : -1;
  if (!highlight || at < 0) return <p>{text}</p>;
  return (
    <p>
      {text.slice(0, at)}
      <mark className="rounded bg-[#c2410c]/10 px-1 py-0.5 font-medium text-[#1a1a1a] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
        {highlight}
      </mark>
      {text.slice(at + highlight.length)}
    </p>
  );
}

function Card({ t }: { t: Testimonial }) {
  return (
    <figure className={CARD}>
      <blockquote className={TEXT}>
        {t.quote.map((para, i) => (
          <Paragraph key={i} text={(i === 0 ? "\u201c" : "") + para + (i === t.quote.length - 1 ? "\u201d" : "")} highlight={t.highlight} />
        ))}
      </blockquote>
      <figcaption className="mt-auto flex items-center gap-3 pt-10">
        {t.photo ? (
          <Image src={t.photo} alt={t.name} width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c2410c]/10 text-sm font-medium text-[#c2410c]">
            {t.initials}
          </span>
        )}
        <span className="flex min-w-0 flex-col">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-semibold text-[#1a1a1a]">{t.name}</span>
            {t.tag && (
              <span className="rounded-full bg-[#c2410c]/10 px-2.5 py-0.5 text-xs font-medium text-[#c2410c]">{t.tag}</span>
            )}
          </span>
          <span className="text-sm text-[#1a1a1a]/55">{t.job}</span>
        </span>
      </figcaption>
    </figure>
  );
}

// fills the last spot while the number of quotes is odd
function Invite() {
  return (
    <figure className={CARD}>
      <blockquote className={TEXT}>
        <p>
          &ldquo;Worked with me on something?{" "}
          <mark className="rounded bg-[#c2410c]/10 px-1 py-0.5 font-medium text-[#1a1a1a] [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
            I&rsquo;d love to add your words here.
          </mark>{" "}
          Tell me what we built together and how it went, the good parts and the hard ones.&rdquo;
        </p>
      </blockquote>
      {/* side by side with a longer quote, a big faint quotation mark fills the space */}
      <span aria-hidden="true" className="hidden md:flex flex-1 items-center justify-center select-none text-[160px] leading-none text-[#c2410c]/10">
        &ldquo;
      </span>
      <figcaption className="mt-auto flex items-center gap-3 pt-10">
        <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[#c2410c]/50 text-lg text-[#c2410c]">
          +
        </span>
        <span className="flex flex-col">
          <span className="font-semibold text-[#1a1a1a]">Your name here</span>
          <a
            href={`mailto:${EMAIL}?subject=${encodeURIComponent("A few words for your website")}`}
            className="w-fit text-sm text-[#c2410c] transition-colors hover:text-[#ea580c] rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2410c]"
          >
            Email me your words &rarr;
          </a>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-[#fafaf9] py-16 md:py-24 mb-16 md:mb-24 scroll-mt-24">
      <div className="mx-auto max-w-[640px] lg:max-w-5xl px-6">
        <h2 className="text-center text-3xl md:text-4xl font-bold leading-tight tracking-tight text-[#1a1a1a]">In their words</h2>
        <p className="mt-3 text-center text-base md:text-lg text-[#1a1a1a]/60">From founders and clients I&rsquo;ve built with.</p>
        <div className="mt-10 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} t={t} />
          ))}
          {TESTIMONIALS.length % 2 === 1 && <Invite />}
        </div>
      </div>
    </section>
  );
}
