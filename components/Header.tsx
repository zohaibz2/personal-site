import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "Journey", href: "/#about" },
  { label: "Portfolio", href: "/#work" },
  { label: "Built", href: "/#companies" },
  { label: "Writing", href: "/articles" },
];

const ACCENT = "#ea580c";

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 bg-white px-6 pt-4"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <nav className="relative mx-auto flex max-w-[1035px] items-center justify-between gap-6 rounded-full border border-black/[0.05] bg-white px-4 py-4 shadow-[0_12px_36px_-16px_rgba(0,0,0,0.20)] md:px-6">
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

        {/* Center nav with twinkling star separators */}
        <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-5 md:flex">
          {navLinks.map(({ label, href }, i) => (
            <div key={label} className="flex items-center gap-5">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className="select-none text-[13px] leading-none"
                  style={{
                    color: ACCENT,
                    animation: "hdr-twinkle 2.4s ease-in-out infinite",
                    animationDelay: `${(i - 1) * 0.7}s`,
                  }}
                >
                  &#10022;
                </span>
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
        <style>{`@keyframes hdr-twinkle{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.1;transform:scale(0.7)}}`}</style>

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
