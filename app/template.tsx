"use client";

import { useEffect, useState } from "react";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="relative">
      {children}

      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-foreground transition-transform duration-[900ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
          revealed ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <span className="font-display text-2xl uppercase tracking-[0.4em] text-background">
          AJVEK
        </span>
      </div>
    </div>
  );
}
