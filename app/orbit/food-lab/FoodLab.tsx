"use client";

import { useEffect, useRef } from "react";
import "./food-lab.css";

const FONTS_URL =
  "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Newsreader:ital,opsz,wght@0,6..72,300..600;1,6..72,300..500&display=swap";

export default function FoodLab() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Fit the lab into the viewport below the site header.
    const siteHeader = Array.from(document.querySelectorAll("header")).find(
      (h) => !root.contains(h)
    );
    const syncTop = () =>
      root.style.setProperty("--fl-top", `${siteHeader ? siteHeader.offsetHeight : 0}px`);
    syncTop();
    const headerObserver = siteHeader ? new ResizeObserver(syncTop) : null;
    if (headerObserver && siteHeader) headerObserver.observe(siteHeader);

    // Load the 3D engine only in the browser, then boot it on this markup.
    let dispose: (() => void) | undefined;
    let cancelled = false;
    import("./engine").then(({ initFoodLab }) => {
      if (!cancelled) dispose = initFoodLab(root);
    });

    return () => {
      cancelled = true;
      headerObserver?.disconnect();
      dispose?.();
    };
  }, []);

  return (
    <main ref={rootRef} className="food-lab" data-theme="light">
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="stylesheet" href={FONTS_URL} />
      <div className="app">
        <div className="stage" id="stage">
          <div className="fallback" id="fallback">The 3D view needs WebGL and the Three.js library. Reload the page, or try a current desktop browser.</div>
        </div>

        <aside className="rail-left" aria-label="Recipe and pantry">
          <header className="masthead">
            <p className="kicker">MATERIAL STUDIES / NO. 14 — CHOCOLATE CHIP</p>
            <h1>Cookie<br />Lab.</h1>
            <p className="dek">Butter, sugar and heat.<br />Squish it raw.<br />Poke it warm.</p>
          </header>

          <section className="phases" aria-labelledby="phase-label">
            <h2 className="section-label" id="phase-label"><span>Recipe</span><span id="phase-count">01 / 04</span></h2>
            <ol>
              <li data-phase="1"><span>01</span><span>PORTION</span><span className="mark" aria-hidden="true"></span></li>
              <li data-phase="2"><span>02</span><span>EMBED</span><span className="mark" aria-hidden="true"></span></li>
              <li data-phase="3"><span>03</span><span>BAKE &amp; EXPAND</span><span className="mark" aria-hidden="true"></span></li>
              <li data-phase="4"><span>04</span><span>INSPECT</span><span className="mark" aria-hidden="true"></span></li>
            </ol>
            <p className="hint" id="hint" aria-live="polite"></p>
          </section>

          <section className="pantry" aria-labelledby="pantry-label">
            <h2 className="section-label" id="pantry-label"><span>Pantry</span></h2>
            <div className="pantry-list">
              <button className="pantry-item" data-item="scoop" aria-pressed="false" title="Butter dough (D)">
                <svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="31" rx="13" ry="3" fill="#3b2317" opacity=".12"/><path d="M8 27c-1-9 4-17 12-17s13 7 12 16c-.2 2-2 3-4 3H12c-2 0-3.8-.6-4-2z" fill="#e8c898"/><path d="M13 16c2-2.6 5-3.8 8-3.6" stroke="#fff" strokeOpacity=".7" strokeWidth="1.6" fill="none" strokeLinecap="round"/><circle cx="16" cy="22" r="1" fill="#c9a06a"/><circle cx="24" cy="19" r=".8" fill="#c9a06a"/><circle cx="26" cy="25" r="1" fill="#c9a06a"/></svg>
                <span><span className="name">Butter dough</span><span className="sub">40 mm scoop</span></span>
                <span className="count" id="count-dough">0 / 6</span>
              </button>
              <button className="pantry-item" data-item="chip" aria-pressed="false" title="Chocolate chunks (C)">
                <svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="31" rx="11" ry="2.5" fill="#3b2317" opacity=".12"/><path d="M10 26l3-11 9-4 8 6 1 9-9 4z" fill="#3b2317"/><path d="M13 15l9-4 8 6-9 3z" fill="#5a3826"/><path d="M14 16.5l7-3" stroke="#fff" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round"/></svg>
                <span><span className="name">Chocolate chunks</span><span className="sub">70% semi-sweet</span></span>
                <span className="count" id="count-chip">0</span>
              </button>
              <button className="pantry-item" data-item="salt" aria-pressed="false" title="Flaky sea salt (F)">
                <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M9 22l7-6 9 1 5 5-8 4z" fill="#fff" stroke="#bdb6a8" strokeWidth=".9"/><path d="M20 30l4-5 6 1 2 3-6 2z" fill="#fff" stroke="#bdb6a8" strokeWidth=".9"/><path d="M11 13l4-3 5 1 1 3-6 1z" fill="#fff" stroke="#bdb6a8" strokeWidth=".9"/></svg>
                <span><span className="name">Flaky sea salt</span><span className="sub">Coarse pyramids</span></span>
                <span className="count" id="count-salt">0</span>
              </button>
            </div>
            <p className="fine">Click an ingredient to use it, or drag it onto the sheet.</p>
          </section>
        </aside>

        <aside className="inspector" aria-label="The inspector">
          <div className="insp-head"><h2>The inspector</h2><span className="fig">fig. 14</span></div>

          <div className="group">
            <h3 className="section-label">Tool</h3>
            <div className="seg" role="group" aria-label="Tool">
              <button data-tool="hand" aria-pressed="true" title="Hand / squish (H)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 12V5.5a1.5 1.5 0 013 0V11"/><path d="M11 10.5V4.5a1.5 1.5 0 013 0V11"/><path d="M14 10.5V6a1.5 1.5 0 013 0v7"/><path d="M8 11.5l-1.6-1.7a1.6 1.6 0 00-2.3 2.2L8 17c1.3 1.6 3 3 5.4 3H14a5 5 0 005-5V13"/><path d="M17 9.5a1.5 1.5 0 013 0V14"/></svg>
                Hand
              </button>
              <button data-tool="scoop" aria-pressed="false" title="Scooper / drop (S)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 13a6 6 0 0012 0z"/><path d="M15.5 12.5L21 4"/><path d="M7 16.5c1 .8 2.2 1.2 3 1.2"/></svg>
                Scooper
              </button>
              <button data-tool="tongs" aria-pressed="false" title="Tongs / move (T)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 3l6 11v7"/><path d="M19 3l-6 11v7"/><path d="M8.5 9.5h7"/><path d="M9 20h6"/></svg>
                Tongs
              </button>
            </div>
          </div>

          <div className="group">
            <h3 className="section-label">Appliance</h3>
            <div className="field">
              <div className="field-row"><label htmlFor="watt">Microwave wattage</label><output id="watt-out" htmlFor="watt">900 W</output></div>
              <input type="range" id="watt" min="600" max="1200" step="50" defaultValue="900" />
              <div className="ends"><span>600 W</span><span>1200 W</span></div>
            </div>
            <div className="field">
              <div className="field-row"><label htmlFor="dur">Bake duration</label><output id="dur-out" htmlFor="dur">15 s</output></div>
              <input type="range" id="dur" min="6" max="30" step="1" defaultValue="15" />
              <div className="ends"><span>gooey</span><span>crisp</span></div>
            </div>
            <div className="field">
              <div className="field-row"><label htmlFor="moist">Internal moisture</label><output id="moist-out" htmlFor="moist">78 %</output></div>
              <input type="range" id="moist" min="45" max="92" step="1" defaultValue="78" />
              <div className="ends"><span>dry, cracks more</span><span>wet, spreads more</span></div>
            </div>
            <div className="field">
              <div className="field-row"><label htmlFor="mrate">Maillard reaction rate</label><output id="mrate-out" htmlFor="mrate">1.00×</output></div>
              <input type="range" id="mrate" min="0.4" max="2.2" step="0.05" defaultValue="1" />
              <div className="ends"><span>pale</span><span>deep</span></div>
            </div>
          </div>

          <div className="group">
            <div className="timer"><span>Bake timer</span><strong id="timer">0:15</strong></div>
            <div className="actions">
              <button className="btn" id="btn-transfer">TRANSFER TO OVEN</button>
              <button className="btn primary" id="btn-bake">START BAKE <kbd>B</kbd></button>
              <button className="btn" id="btn-door">OPEN DOOR</button>
              <button className="btn quiet" id="btn-reset">RESET SPECIMEN</button>
            </div>
          </div>

          <div className="group toggles">
            <label><input type="checkbox" id="opt-sound" defaultChecked /> Sound</label>
            <label><input type="checkbox" id="opt-lattice" /> Show lattice</label>
          </div>
        </aside>

        <dl className="telemetry" aria-label="Telemetry">
          <div className="metric" id="m-temp"><dt>TEMPERATURE</dt><dd><span id="t-temp">24.2</span><span className="unit">°C</span></dd></div>
          <div className="metric"><dt>CORE MOISTURE</dt><dd><span id="t-moist">78.4</span><span className="unit">%</span></dd></div>
          <div className="metric"><dt>MAILLARD INDEX</dt><dd><span id="t-maillard">0.00</span></dd></div>
          <div className="metric"><dt>CRACK COUNT</dt><dd><span id="t-crack">0</span></dd></div>
          <div className="metric"><dt>DOUGH VISCOSITY</dt><dd><span id="t-visc">1.42</span><span className="unit">Pa·s</span></dd></div>
        </dl>
      </div>

      <div className="cursor" id="cursor" aria-hidden="true"><div className="ring"></div><div className="dot"></div><div className="label" id="cursor-label">Contact 0.0 mm</div></div>
      <div className="toast" id="toast" role="status" aria-live="polite"></div>
      <div className="ghost" id="ghost" aria-hidden="true"></div>
    </main>
  );
}
