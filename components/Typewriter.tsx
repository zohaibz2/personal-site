"use client";

import { useEffect, useState } from "react";

/**
 * Types out `text` one character at a time. A small car rides at the tip of the
 * text (in place of a cursor), so it looks like the car is towing the words into
 * view — advancing and wrapping right along with the text. When typing finishes,
 * the car drives off to the right and fades.
 */
export default function Typewriter({
  text,
  className = "",
  speed = 32,
}: {
  text: string;
  className?: string;
  speed?: number;
}) {
  const [count, setCount] = useState(0);
  const [driveOff, setDriveOff] = useState(false);
  const [gone, setGone] = useState(false);
  const done = count >= text.length;

  // type
  useEffect(() => {
    if (count >= text.length) return;
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [count, text.length, speed]);

  // small pause after the last character, then drive off
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setDriveOff(true), 450);
    return () => clearTimeout(id);
  }, [done]);

  // once it's off-screen, remove it so no trailing gap remains
  useEffect(() => {
    if (!driveOff) return;
    const id = setTimeout(() => setGone(true), 1100);
    return () => clearTimeout(id);
  }, [driveOff]);

  return (
    <p className={`relative ${className}`} aria-label={text}>
      {/* reserves the final wrapped size so nothing below shifts */}
      <span className="invisible" aria-hidden="true">
        {text}
      </span>

      <span className="absolute inset-0" aria-hidden="true">
        {text.slice(0, count)}
        {!gone && (
          <span
            className="ml-1 inline-block"
            style={{
              verticalAlign: "-0.4em",
              transition:
                "transform 1s cubic-bezier(.45,0,.7,.15), opacity 0.9s ease-in",
              transform: driveOff ? "translateX(88vw)" : "translateX(0)",
              opacity: driveOff ? 0 : 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tundra.png"
              alt=""
              className="block h-[1.4em] w-auto max-w-none"
              style={{ animation: "car-bob 0.5s ease-in-out infinite" }}
            />
          </span>
        )}
      </span>

      <style>{`
        @keyframes car-bob {
          0%, 100% { transform: scaleX(-1) translateY(0); }
          50%      { transform: scaleX(-1) translateY(-1px); }
        }
      `}</style>
    </p>
  );
}
