"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(titleRef.current, { opacity: 1, rotationX: 0 });
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
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background text-foreground px-6 text-center">
      <p className="mb-4 text-xs tracking-[0.3em] text-stone uppercase">
        Streetwear
      </p>
      <h1
        ref={titleRef}
        className="text-5xl sm:text-7xl font-display opacity-0"
      >
        AJVEK
      </h1>
      <p className="mt-6 max-w-md text-stone">
        Le site arrive. En construction, une étape à la fois.
      </p>
    </main>
  );
}