"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

const PREORDER_LIMIT = 20;

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/preorder-count")
      .then((res) => res.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(null));
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(titleRef.current, { opacity: 1, rotationX: 0 });
      gsap.set(buttonRef.current, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, {
        opacity: 0,
        rotationX: -90,
        transformPerspective: 800,
      });
      gsap.to(titleRef.current, {
        opacity: 1,
        rotationX: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.1,
      });

      gsap.set(buttonRef.current, { opacity: 0, y: 20 });
      gsap.to(buttonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.9,
      });
    });

    return () => ctx.revert();
  }, []);

  const isFull = count !== null && count >= PREORDER_LIMIT;
  const percent =
    count !== null ? Math.min((count / PREORDER_LIMIT) * 100, 100) : 0;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-6 text-center">
      <p className="mb-4 text-xs tracking-[0.3em] text-stone uppercase">
        Streetwear
      </p>
      <h1
        ref={titleRef}
        className="text-5xl sm:text-7xl font-display opacity-0"
      >
        AJVEK
      </h1>

      <Link
        ref={buttonRef}
        href="/catalogue"
        className="mt-10 inline-block rounded-full bg-foreground px-8 py-3 text-sm uppercase tracking-widest text-background opacity-0 transition hover:opacity-80"
      >
        Découvrir la collection
      </Link>

      {count !== null && (
        <div className="mt-8 w-full max-w-xs">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-stone">
            {isFull
              ? "Les 20 précommandes sont complètes !"
              : `${count}/${PREORDER_LIMIT} précommandées`}
          </p>
        </div>
      )}
    </main>
  );
}