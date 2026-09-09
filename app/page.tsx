"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(titleRef.current, { opacity: 1, rotationX: 0 });
      gsap.set(sectionRef.current, { opacity: 1, y: 0 });
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

      gsap.set(sectionRef.current, { opacity: 0, y: 40 });
      gsap.to(sectionRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
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
        <p className="mt-6 max-w-md text-stone">
          Le site arrive. En construction, une étape à la fois.
        </p>
      </main>

      <section
        ref={sectionRef}
        className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center border-t border-surface"
      >
        <h2 className="text-3xl font-display">La collection arrive</h2>
        <p className="max-w-md text-stone">
          Les premières pièces AJVEK sont en préparation. Reviens bientôt pour les découvrir.
        </p>
      </section>
    </>
  );
}