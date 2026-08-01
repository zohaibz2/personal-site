import Link from "next/link";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
];

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-white px-4 pt-4 md:px-6 md:pt-6"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-3xl bg-[#0a0a0a] px-4 py-3 md:px-6 md:py-4 shadow-[0_14px_40px_-16px_rgba(0,0,0,0.55)]">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#f97316] to-[#c2410c] text-xs font-bold text-white">
            ZN
          </span>
          <span className="hidden text-sm font-semibold tracking-[0.12em] text-white sm:inline">
            ZOHAIB NAREJO
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <a
          href="mailto:narejozohaib33@gmail.com"
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a0a0a] transition-colors hover:bg-white/85 md:px-5 md:py-2.5"
        >
          Let&apos;s talk
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z"
              fill="#ea580c"
              stroke="#ea580c"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </nav>
    </header>
  );
}
