import Link from "next/link";

const navLinks = [
  { label: "Work", href: "#work" },
  { label: "About", href: "#about" },
];

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-white px-6 pt-[13px]"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <nav className="flex items-center justify-between gap-6 rounded-3xl bg-[#0a0a0a] px-8 py-2.5 md:px-10 shadow-[0_16px_44px_-18px_rgba(0,0,0,0.55)]">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#f97316] to-[#c2410c] text-sm font-bold text-white">
            ZN
          </span>
          <span className="hidden text-base font-semibold tracking-[0.14em] text-white sm:inline">
            ZOHAIB NAREJO
          </span>
        </Link>

        {/* Center nav */}
        <div className="hidden items-center gap-10 md:flex">
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="text-base font-medium text-white/80 transition-colors hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <a
          href="mailto:narejozohaib33@gmail.com"
          className="flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-2 text-base font-semibold text-[#0a0a0a] transition-colors hover:bg-white/85 md:px-7"
        >
          Let&apos;s talk
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
