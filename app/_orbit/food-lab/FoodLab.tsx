"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import "./food-lab.css";

const icon = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function FoodLab() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // The kitchen fills the whole window, over the site header. While it's
    // open the header underneath is switched off (so Tab can't reach its
    // hidden links) and the page doesn't scroll; both come back on leaving.
    const siteHeader = Array.from(document.querySelectorAll("header")).find(
      (h) => !root.contains(h)
    );
    const headerWasInert = siteHeader ? siteHeader.inert : false;
    if (siteHeader) siteHeader.inert = true;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Load the 3D engine only in the browser, then boot it on this markup.
    let dispose: (() => void) | undefined;
    let cancelled = false;
    import("./engine").then(({ initFoodLab }) => {
      if (!cancelled) dispose = initFoodLab(root);
    });

    return () => {
      cancelled = true;
      if (siteHeader) siteHeader.inert = headerWasInert;
      document.body.style.overflow = prevOverflow;
      dispose?.();
    };
  }, []);

  return (
    <main ref={rootRef} className="food-lab" aria-label="Biryani kitchen">
      <div className="fl-stage" />

      {/* the way out: back to the Orbit page */}
      <Link href="/orbit" className="fl-exit" aria-label="Back to Orbit">
        <svg viewBox="0 0 24 24" {...icon}>
          <path d="M19 12H5" />
          <path d="M11 6l-6 6 6 6" />
        </svg>
      </Link>
      <div className="fl-vignette" />

      <div className="fl-hud" aria-hidden="true">
        <div className="fl-strip" />
        {/* the basket is full: unload it at the table */}
        <div className="fl-full">
          <svg viewBox="0 0 24 24" {...icon}>
            <path d="M3.5 10h17l-1.8 8.2a2 2 0 0 1-2 1.6H7.3a2 2 0 0 1-2-1.6z" />
            <path d="M7.5 10a4.5 4.5 0 0 1 9 0" />
            <path d="M9 13.5v3M12 13.5v3M15 13.5v3" />
          </svg>
          <svg viewBox="0 0 24 24" {...icon} className="fl-full-arrow">
            <path d="M4 12h15" />
            <path d="M14 7l5 5-5 5" />
          </svg>
          <svg viewBox="0 0 24 24" {...icon}>
            <path d="M2.5 9.5h19" />
            <path d="M4 9.5v10M20 9.5v10" />
            <path d="M8 6.5h3v3H8zM13 5h3v4.5h-3z" />
          </svg>
        </div>
        <div className="fl-steps" />
        <div className="fl-mix" />
        <div className="fl-reticle">
          <svg className="i-grab" viewBox="0 0 24 24" {...icon}>
            <path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12" />
            <path d="M11 11V5a1.5 1.5 0 0 1 3 0v6" />
            <path d="M14 11.5V6.5a1.5 1.5 0 0 1 3 0V14c0 3.6-2.4 6.5-6 6.5-2.6 0-4.2-1.4-5.4-3.4L4 14.4a1.5 1.5 0 0 1 2.5-1.6L8 15" />
          </svg>
          <svg className="i-door" viewBox="0 0 24 24" {...icon}>
            <path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21" />
            <path d="M4 21h16M14.5 12.5v1" />
          </svg>
          <svg className="i-place" viewBox="0 0 24 24" {...icon}>
            <path d="M12 3v10M8 9.5l4 4 4-4" />
            <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V15" />
          </svg>
          <svg className="i-turn" viewBox="0 0 24 24" {...icon}>
            <circle cx="12" cy="13" r="4.5" />
            <path d="M12 8.5v3" />
            <path d="M18.5 9.5A7.5 7.5 0 0 0 6.2 6.6" />
            <path d="M6 3.5v3.3h3.3" />
          </svg>
          <svg className="i-spark" viewBox="0 0 24 24" {...icon}>
            <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.8 2.8M15.2 15.2L18 18M18 6l-2.8 2.8M8.8 15.2L6 18" />
          </svg>
        </div>
        <div className="fl-joy">
          <i />
        </div>
        {/* board view: how to use the knife, shown until you've done it once */}
        <div className="fl-gesture">
          <svg className="g-cut" viewBox="0 0 48 48" {...icon}>
            <path d="M24 6v24M17 23l7 7 7-7" />
            <path d="M8 40h32" />
          </svg>
          <svg className="g-peel" viewBox="0 0 48 48" {...icon}>
            <path d="M6 24h36M13 17l-7 7 7 7M35 17l7 7-7 7" />
          </svg>
          <svg className="g-hold" viewBox="0 0 48 48" {...icon}>
            <circle cx="24" cy="24" r="6" />
            <circle cx="24" cy="24" r="15" strokeDasharray="3 4" />
          </svg>
          <svg className="g-stir" viewBox="0 0 48 48" {...icon}>
            <path d="M38 24A14 14 0 1 1 33.9 14.1" />
            <path d="M35 6.5v8.5h-8.5" />
          </svg>
        </div>
      </div>

      <button type="button" className="fl-back" aria-label="Put the knife down">
        <svg viewBox="0 0 24 24" {...icon}>
          <path d="M9 14L4 9l5-5" />
          <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
        </svg>
      </button>

      <div className="fl-start hide" role="button" tabIndex={0} aria-label="Start">
        <div className="fl-start-card">
          <div className="fl-play">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.4-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
            </svg>
          </div>
          <div className="fl-controls only-desk">
            <div className="fl-ctl">
              <svg viewBox="0 0 48 48" {...icon}>
                <rect x="17" y="12" width="14" height="22" rx="7" />
                <path d="M24 12v6" />
                <path d="M9 23c0-4 2-7.5 5-9.5M39 23c0-4-2-7.5-5-9.5" />
                <path d="M11.5 12.5L14 13.5 13.2 16M36.5 12.5L34 13.5 34.8 16" />
              </svg>
            </div>
            <div className="fl-ctl">
              <svg viewBox="0 0 48 48" {...icon}>
                <rect x="18" y="9" width="12" height="11" rx="2.5" />
                <rect x="5" y="23" width="12" height="11" rx="2.5" />
                <rect x="18" y="23" width="12" height="11" rx="2.5" />
                <rect x="31" y="23" width="12" height="11" rx="2.5" />
                <path d="M24 12.5v4.5M22 14.5l2-2 2 2M24 30.5V26M22 28.5l2 2 2-2M13.5 28.5H9M11 26.5l-2 2 2 2M34.5 28.5H39M37 26.5l2 2-2 2" />
              </svg>
            </div>
            <div className="fl-ctl">
              <svg viewBox="0 0 48 48" {...icon}>
                <path d="M19 26V13.5a2.5 2.5 0 0 1 5 0V24" />
                <path d="M24 22.5v-3a2.5 2.5 0 0 1 5 0v4" />
                <path d="M29 23.5v-2a2.5 2.5 0 0 1 5 0V29c0 6-4 10-9.5 10-4 0-6.5-2-8.5-5.5L13 28a2.4 2.4 0 0 1 4-2.6l2 2.6" />
                <path d="M14 9.5l-2.5-2.5M21.5 6.5V3M29 9.5l2.5-2.5" />
              </svg>
            </div>
          </div>
          <div className="fl-controls only-touch">
            <div className="fl-ctl">
              <svg viewBox="0 0 48 48" {...icon}>
                <circle cx="24" cy="24" r="15" />
                <circle cx="24" cy="24" r="6" />
                <path d="M24 5.5v3M24 39.5v3M5.5 24h3M39.5 24h3" />
              </svg>
            </div>
            <div className="fl-ctl">
              <svg viewBox="0 0 48 48" {...icon}>
                <path d="M21 30V17.5a2.5 2.5 0 0 1 5 0V27" />
                <path d="M26 25.5v-2a2.5 2.5 0 0 1 5 0V31c0 5-3.5 8.5-8 8.5-3.5 0-5.5-1.8-7-4.6L13.8 31a2.4 2.4 0 0 1 4-2.6l3.2 2.6" />
                <path d="M8 12h12M8 12l3-3M8 12l3 3M40 12H28M40 12l-3-3M40 12l-3 3" />
              </svg>
            </div>
            <div className="fl-ctl">
              <svg viewBox="0 0 48 48" {...icon}>
                <path d="M21 30V17.5a2.5 2.5 0 0 1 5 0V27" />
                <path d="M26 25.5v-2a2.5 2.5 0 0 1 5 0V31c0 5-3.5 8.5-8 8.5-3.5 0-5.5-1.8-7-4.6L13.8 31a2.4 2.4 0 0 1 4-2.6l3.2 2.6" />
                <circle cx="23.5" cy="17.5" r="8" strokeDasharray="2.5 3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="fl-loading" aria-label="Loading">
        <span className="fl-spin" />
      </div>

      <div className="fl-done" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10.5" fill="#2f9e5b" />
          <path d="M7.5 12.3l3 3 6-6.3" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="fl-pips">
          <i className="on" />
          <i />
          <i />
          <i />
        </div>
      </div>

      <div className="fl-fallback" aria-label="This experience needs WebGL">
        <svg viewBox="0 0 48 48" {...icon}>
          <rect x="6" y="9" width="36" height="24" rx="3" />
          <path d="M18 39h12M24 33v6M17 15l14 12M31 15L17 27" />
        </svg>
      </div>
    </main>
  );
}
