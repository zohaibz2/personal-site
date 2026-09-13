import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "Articles", href: "/articles" },
  { label: "About", href: "/#about" },
];

const ACCENT = "#ea580c";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-[#f4f1ea] px-6 pt-4"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-[22px] border border-black/[0.06] bg-white px-4 py-4 shadow-[0_10px_34px_-16px_rgba(0,0,0,0.28)] md:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center" aria-label="Home">
          <span className="relative block h-7 w-7">
            <Image
              src="/z-logo.png"
              alt="Zohaib Narejo"
              fill
              sizes="28px"
              className="object-contain"
              priority
            />
          </span>
        </Link>

        {/* Center nav with orange diamond separators */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-5 md:flex">
          {navLinks.map(({ label, href }, i) => (
            <div key={label} className="flex items-center gap-5">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rotate-45 rounded-[1px]"
                  style={{ backgroundColor: ACCENT }}
                />
              )}
              <Link
                href={href}
                className="text-[15px] font-medium text-[#1a1a1a] transition-colors hover:text-[#ea580c]"
              >
                {label}
              </Link>
            </div>
          ))}
        </div>

        {/* Email */}
        <a
          href="mailto:narejozohaib33@gmail.com"
          className="flex shrink-0 items-center gap-2 text-[15px] font-medium transition-opacity hover:opacity-80"
          style={{ color: ACCENT }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden lg:inline">narejozohaib33@gmail.com</span>
        </a>
      </nav>
    </header>
  );
}
