"use client";

import { useEffect, useState } from "react";

export default function HomeIntro() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      setVisible(false);
      return;
    }

    const leaveTimer = window.setTimeout(() => {
      setLeaving(true);
    }, 650);

    const removeTimer = window.setTimeout(() => {
      setVisible(false);
    }, 1050);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[200] flex items-center justify-center bg-[#0c0c0b] transition-all duration-500 ${
        leaving
          ? "pointer-events-none scale-[1.015] opacity-0"
          : "opacity-100"
      }`}
    >
      <div
        className={`transition-all duration-700 ${
          leaving
            ? "-translate-y-1.5 scale-[1.03] opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <p className="font-display text-4xl tracking-[0.28em] text-[#f3f0ea] sm:text-5xl">
          AJVEK
        </p>
      </div>
    </div>
  );
}