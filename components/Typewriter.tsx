"use client";

import { useEffect, useState } from "react";

/**
 * Types out `text` one character at a time. A small car rides at the tip of the
 * text (in place of a cursor), towing the words into view — with exhaust smoke,
 * a tailpipe flame flicker, speed lines and a suspension bob for a sense of
 * motion. When typing finishes, the car drives off to the right and fades.
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

  useEffect(() => {
    if (count >= text.length) return;
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [count, text.length, speed]);

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setDriveOff(true), 450);
    return () => clearTimeout(id);
  }, [done]);

  useEffect(() => {
    if (!driveOff) return;
    const id = setTimeout(() => setGone(true), 1100);
    return () => clearTimeout(id);
  }, [driveOff]);

  return (
    <p className={`relative ${className}`} aria-label={text}>
      <span className="invisible" aria-hidden="true">
        {text}
      </span>

      <span className="absolute inset-0" aria-hidden="true">
        {text.slice(0, count)}
        {!gone && (
          <span
            className="relative ml-1 inline-block"
            style={{
              verticalAlign: "-0.4em",
              transition:
                "transform 1s cubic-bezier(.45,0,.7,.15), opacity 0.9s ease-in",
              transform: driveOff ? "translateX(88vw)" : "translateX(0)",
              opacity: driveOff ? 0 : 1,
            }}
          >
            {/* speed lines trailing behind */}
            <span className="tw-line" style={{ top: "42%", animationDelay: "0s" }} />
            <span className="tw-line" style={{ top: "58%", animationDelay: ".17s" }} />

            {/* exhaust smoke puffs (rear = left, since the car faces right) */}
            <span className="tw-smoke" style={{ animationDelay: "0s" }} />
            <span className="tw-smoke" style={{ animationDelay: ".4s" }} />
            <span className="tw-smoke" style={{ animationDelay: ".8s" }} />

            {/* tailpipe flame flicker */}
            <span className="tw-flame" />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tundra.png"
              alt=""
              className="relative block h-[1.4em] w-auto max-w-none"
              style={{ animation: "car-bob 0.5s ease-in-out infinite", zIndex: 1 }}
            />
          </span>
        )}
      </span>

      <style>{`
        @keyframes car-bob {
          0%, 100% { transform: scaleX(-1) translateY(0); }
          50%      { transform: scaleX(-1) translateY(-1px); }
        }
        .tw-smoke {
          position: absolute;
          left: 4%;
          bottom: 14%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(110,110,110,0.55), rgba(110,110,110,0) 70%);
          animation: tw-smoke 1.2s linear infinite;
          pointer-events: none;
        }
        @keyframes tw-smoke {
          0%   { opacity: 0.55; transform: translate(0,0) scale(0.4); }
          100% { opacity: 0;    transform: translate(-14px,-9px) scale(1.6); }
        }
        .tw-flame {
          position: absolute;
          left: 1%;
          bottom: 15%;
          width: 8px;
          height: 3px;
          border-radius: 3px;
          transform-origin: right center;
          background: linear-gradient(270deg, #f59e0b, #f97316 40%, rgba(249,115,22,0));
          animation: tw-flame 0.12s steps(2) infinite;
          pointer-events: none;
        }
        @keyframes tw-flame {
          0%   { opacity: 0.9;  transform: scaleX(1)   scaleY(1); }
          50%  { opacity: 0.55; transform: scaleX(1.3) scaleY(0.6); }
          100% { opacity: 0.85; transform: scaleX(0.85) scaleY(1.15); }
        }
        .tw-line {
          position: absolute;
          left: -12px;
          width: 12px;
          height: 1px;
          background: linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,0.35));
          animation: tw-line 0.3s linear infinite;
          pointer-events: none;
        }
        @keyframes tw-line {
          0%   { opacity: 0;   transform: translateX(5px); }
          50%  { opacity: 0.6; }
          100% { opacity: 0;   transform: translateX(-7px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tw-smoke, .tw-flame, .tw-line { animation: none; opacity: 0; }
        }
      `}</style>
    </p>
  );
}
