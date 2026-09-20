"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import MadeInFrance from "@/components/MadeInFrance";
import PaymentNotice from "@/components/PaymentNotice";
import DesignProcessStory from "@/components/DesignProcessStory";
import HomeIntro from "@/components/HomeIntro";

const PREORDER_GOAL = 10;

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/preorder-count")
      .then((response) => response.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(null));
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      gsap.set(
        [
          eyebrowRef.current,
          titleRef.current,
          textRef.current,
          buttonRef.current,
          metaRef.current,
        ],
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
        }
      );

      return;
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        delay: 0.72,
      });

      gsap.set(eyebrowRef.current, {
        opacity: 0,
        y: 10,
      });

      gsap.set(titleRef.current, {
        opacity: 0,
        y: 22,
        rotationX: -18,
        transformPerspective: 1000,
      });

      gsap.set(textRef.current, {
        opacity: 0,
        y: 14,
      });

      gsap.set(buttonRef.current, {
        opacity: 0,
        y: 14,
      });

      gsap.set(metaRef.current, {
        opacity: 0,
        y: 12,
      });

      timeline
        .to(eyebrowRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power2.out",
        })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 1,
            ease: "power3.out",
          },
          "-=0.3"
        )
        .to(
          textRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            ease: "power2.out",
          },
          "-=0.45"
        )
        .to(
          buttonRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
          },
          "-=0.35"
        )
        .to(
          metaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.25"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const thresholdReached =
    count !== null && count >= PREORDER_GOAL;

  const percent =
    count !== null
      ? Math.min((count / PREORDER_GOAL) * 100, 100)
      : 0;

  const remaining =
    count !== null
      ? Math.max(PREORDER_GOAL - count, 0)
      : 0;

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <HomeIntro />

      <section
        ref={heroRef}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035] sm:h-[44rem] sm:w-[44rem] lg:h-[58rem] lg:w-[58rem]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[42%] h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.025] sm:h-[30rem] sm:w-[30rem] lg:h-[40rem] lg:w-[40rem]"
        />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] max-w-7xl flex-col px-5 pb-6 pt-12 md:px-8 md:pb-10 md:pt-20">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p
              ref={eyebrowRef}
              className="text-[10px] uppercase tracking-[0.48em] text-stone opacity-0"
            >
              Streetwear · France
            </p>

            <h1
              ref={titleRef}
              className="mt-5 font-display text-[22vw] leading-[0.72] tracking-[-0.055em] opacity-0 sm:text-[8rem] md:text-[10rem] lg:text-[12rem]"
            >
              AJVEK
            </h1>

            <div className="mt-7 h-px w-12 bg-stone/35" />

            <p
              ref={textRef}
              className="mt-6 max-w-md text-sm leading-6 text-stone opacity-0 md:text-[15px]"
            >
              Des pièces construites autour du dessin,
              <br className="hidden sm:block" />
              du végétal et d&apos;une identité propre.
            </p>

            <Link
              ref={buttonRef}
              href="/catalogue"
              className="group mt-8 flex items-center gap-5 rounded-full border border-foreground bg-foreground px-6 py-3.5 text-[10px] uppercase tracking-[0.27em] text-background opacity-0 transition duration-300 hover:bg-transparent hover:text-foreground"
            >
              <span>Découvrir la collection</span>

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          <div
            ref={metaRef}
            className="mt-7 grid gap-5 opacity-0 md:grid-cols-[1fr_auto_1fr] md:items-end"
          >
            <div className="order-2 md:order-1">
              {count !== null && (
                <div className="mx-auto max-w-sm md:mx-0">
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.32em] text-stone">
                          Précommandes
                        </p>

                        <div className="mt-2 flex items-end gap-2">
                          <span className="font-display text-3xl leading-none">
                            {count}
                          </span>

                          <span className="pb-0.5 text-xs text-stone">
                            / {PREORDER_GOAL}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                          Production
                        </p>

                        <p className="mt-2 text-[11px] text-foreground">
                          {thresholdReached
                            ? "Seuil atteint"
                            : `${remaining} restant${
                                remaining > 1 ? "s" : ""
                              }`}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-px overflow-hidden bg-white/10">
                      <div
                        className="h-full bg-foreground transition-all duration-1000 ease-out"
                        style={{
                          width: `${percent}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="order-1 text-center md:order-2">
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone/70">
                Scroll
              </p>

              <div className="mx-auto mt-3 h-7 w-px bg-gradient-to-b from-stone/60 to-transparent" />
            </div>

            <div className="order-3 flex flex-col items-center gap-3 md:items-end">
              <PaymentNotice />
              <MadeInFrance />
            </div>
          </div>
        </div>
      </section>

      <DesignProcessStory />

      <section className="relative flex min-h-[62svh] items-center justify-center overflow-hidden border-t border-surface px-6 py-20 text-center md:min-h-[70svh] md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035] sm:h-96 sm:w-96"
        />

        <div className="relative z-10 max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
            Collection actuelle
          </p>

          <h2 className="mt-5 font-display text-4xl leading-[0.98] sm:text-5xl">
            Le dessin devient
            <br />
            une pièce AJVEK.
          </h2>

          <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-stone">
            Découvrez les pièces actuellement disponibles en précommande.
          </p>

          <Link
            href="/catalogue"
            className="group mt-9 inline-flex items-center gap-5 rounded-full border border-foreground px-6 py-3 text-[10px] uppercase tracking-[0.27em] text-foreground transition duration-300 hover:bg-foreground hover:text-background"
          >
            <span>Voir la collection</span>

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}