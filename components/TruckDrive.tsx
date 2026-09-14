"use client";

import { useEffect, useRef } from "react";

/**
 * A truck that drives left → right across its parent while the hero text types,
 * then accelerates off the right edge and fades. Sits behind the content.
 *
 * `typingMs` should match the typewriter's total duration so the two stay in
 * sync. The parent must be `position: relative` (and ideally overflow-hidden).
 */
export default function TruckDrive({ typingMs = 2900 }: { typingMs?: number }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const group = groupRef.current;
    const img = imgRef.current;
    if (!layer || !group || !img) return;

    // Respect reduced-motion: don't animate, just stay hidden.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      group.style.opacity = "0";
      return;
    }

    const T = typingMs; // drive-across phase (matches typing)
    const OFF = 1300; // drive-off phase
    const easeOut = (p: number) => 1 - Math.pow(1 - p, 2);
    const easeIn = (p: number) => p * p;

    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const W = layer.clientWidth;
      const w = group.clientWidth;
      const t = now - start;

      let x: number;
      let op = 1;
      if (t < T) {
        const p = t / T;
        x = -w + (W * 0.55 + w) * easeOut(p); // off-left → right-of-center
      } else if (t < T + OFF) {
        const q = (t - T) / OFF;
        x = W * 0.55 + (W + w - W * 0.55) * easeIn(q); // → off right edge
        op = 1 - q;
      } else {
        x = W + w;
        op = 0;
      }

      const bob = op > 0 ? Math.sin(t / 110) * 2.5 : 0; // subtle suspension jiggle
      group.style.transform = `translate3d(${x}px, -50%, 0)`;
      group.style.opacity = String(op);
      img.style.transform = `scaleX(-1) translateY(${bob}px)`;

      if (t < T + OFF) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [typingMs]);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div
        ref={groupRef}
        className="absolute left-0 top-1/2 w-[200px] sm:w-[300px] md:w-[380px] lg:w-[440px]"
        style={{ transform: "translate3d(-9999px, -50%, 0)", willChange: "transform, opacity" }}
      >
        {/* ground shadow */}
        <div
          className="absolute inset-x-[7%] bottom-[-3%] h-[12%] rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.30), rgba(0,0,0,0) 70%)",
          }}
        />
        {/* truck (mirrored to face right) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src="/tundra.png"
          alt=""
          className="relative block w-full"
          style={{ transform: "scaleX(-1)" }}
        />
      </div>
    </div>
  );
}
