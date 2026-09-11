"use client";

import { useEffect, useState } from "react";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}
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
