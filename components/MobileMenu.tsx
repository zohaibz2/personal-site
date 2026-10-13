"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// The header's menu on phones (the inline links only show from tablet width
// up): a button that opens a panel under the header. It closes when you pick
// a link, tap outside it, or press Escape.

type NavLink = { label: string; href: string };

// the current page, and the pages under it (case studies count as Portfolio)
function isCurrent(pathname: string, href: string) {
  if (pathname === href || pathname.startsWith(href + "/")) return true;
  return href === "/portfolio" && pathname.startsWith("/work/");
}

export default function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#1a1a1a] transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c2410c]"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-full mt-3 rounded-3xl border border-black/[0.05] bg-white p-2 shadow-[0_12px_36px_-16px_rgba(0,0,0,0.20)]"
        >
          <ul className="flex flex-col">
            {links.map((l) => {
              const current = isCurrent(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={current ? "page" : undefined}
                    className={`block rounded-2xl px-4 py-3 text-[17px] transition-colors hover:bg-black/[0.03] ${
                      current ? "text-[#c2410c]" : "text-[#1a1a1a]"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
