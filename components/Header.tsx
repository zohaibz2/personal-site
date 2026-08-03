import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "Articles", href: "/articles" },
  { label: "About", href: "/#about" },
];

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-white px-6 pt-[13px]"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <nav className="relative flex items-center justify-between gap-6 rounded-[20.4px] bg-[#0a0a0a] px-6 py-[15.6px] md:px-[30px] shadow-[0_16px_44px_-18px_rgba(0,0,0,0.55)]">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/z-mark.png"
            alt="Zohaib Narejo"
            width={36}
            height={36}
            className="h-9 w-9"
            priority
          />
          <span className="hidden text-[9.6px] font-semibold tracking-[0.14em] text-white sm:inline">
            ZOHAIB NAREJO
          </span>
        </Link>

        {/* Center nav — absolutely centered in the bar */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-10 md:flex">
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
          className="flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-semibold text-[#0a0a0a] transition-colors hover:bg-white/85 md:px-7"
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
