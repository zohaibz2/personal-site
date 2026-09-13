"use client";

import { useEffect, useState } from "react";

/**
 * Types out `text` one character at a time with a blinking cursor.
 * Renders as a <p> so it can drop in where a paragraph was.
 * The full text is rendered invisibly underneath to reserve the final
 * size, so content below never shifts while it types. The real text is
 * exposed to screen readers via aria-label.
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

  useEffect(() => {
    if (count >= text.length) return;
    const id = setTimeout(() => setCount((c) => c + 1), speed);
    return () => clearTimeout(id);
  }, [count, text.length, speed]);

  return (
    <p className={`relative ${className}`} aria-label={text}>
      {/* Reserves the final wrapped size so nothing below shifts. */}
      <span className="invisible" aria-hidden="true">
        {text}
      </span>

      {/* Animated overlay */}
      <span className="absolute inset-0" aria-hidden="true">
        {text.slice(0, count)}
        <span
          className="ml-0.5 inline-block w-[2px] bg-[#c2410c]"
          style={{
            height: "1.1em",
            verticalAlign: "-0.15em",
            animation: "tw-blink 1s step-end infinite",
          }}
        />
      </span>

      <style>{`@keyframes tw-blink{0%,49%{opacity:1}50%,100%{opacity:0}}`}</style>
    </p>
  );
}
