"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = pageRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      gsap.set(element, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      });

      return;
    }

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 12,
        filter: "blur(5px)",
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.65,
        ease: "power3.out",
        clearProps: "filter",
      }
    );
  }, []);

  return (
    <div
      ref={pageRef}
      className="min-h-full"
    >
      {children}
    </div>
  );
}