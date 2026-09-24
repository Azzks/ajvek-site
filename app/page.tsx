"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import gsap from "gsap";

import MadeInFrance from "@/components/MadeInFrance";
import PaymentNotice from "@/components/PaymentNotice";
import DesignProcessStory from "@/components/DesignProcessStory";
import HomeIntro from "@/components/HomeIntro";

const PREORDER_GOAL = 10;

export default function Home() {
  const heroRef =
    useRef<HTMLElement | null>(null);

  const dropRef =
    useRef<HTMLParagraphElement | null>(null);

  const titleRef =
    useRef<HTMLHeadingElement | null>(null);

  const subtitleRef =
    useRef<HTMLParagraphElement | null>(null);

  const ctaRef =
    useRef<HTMLAnchorElement | null>(null);

  const footerRef =
    useRef<HTMLDivElement | null>(null);

  const [count, setCount] =
    useState<number | null>(null);

  /*
   * ============================================================
   * COMPTEUR
   * ============================================================
   */

  useEffect(() => {
    fetch("/api/preorder-count")
      .then((response) => response.json())
      .then((data) =>
        setCount(data.count ?? 0)
      )
      .catch(() => setCount(null));
  }, []);

  /*
   * ============================================================
   * HERO
   * ============================================================
   */

  useEffect(() => {
    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    const elements = [
      dropRef.current,
      titleRef.current,
      subtitleRef.current,
      ctaRef.current,
      footerRef.current,
    ];

    if (reducedMotion) {
      gsap.set(elements, {
        opacity: 1,
        y: 0,
      });

      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(elements, {
        opacity: 0,
        y: 24,
      });

      const tl = gsap.timeline({
        delay: 0.6,
      });

      tl.to(dropRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
      })

        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 1.15,
            ease: "power4.out",
          },
          "-=0.3"
        )

        .to(
          subtitleRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.65"
        )

        .to(
          ctaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.4"
        )

        .to(
          footerRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
          },
          "-=0.3"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const thresholdReached =
    count !== null &&
    count >= PREORDER_GOAL;

  const percent =
    count !== null
      ? Math.min(
          (count / PREORDER_GOAL) * 100,
          100
        )
      : 0;

  const remaining =
    count !== null
      ? Math.max(
          PREORDER_GOAL - count,
          0
        )
      : 0;

  return (
    <main className="overflow-hidden bg-background text-foreground">
      {/* =======================================================
          INTRO
      ======================================================= */}

      <HomeIntro />

      {/* =======================================================
          HERO
      ======================================================= */}

      <section
        ref={heroRef}
        className="relative min-h-[calc(100svh-65px)] overflow-hidden"
      >
        {/* GRILLE EDITORIALE */}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute bottom-0 left-[8%] top-0 w-px bg-white/[0.025]" />
          <div className="absolute bottom-0 left-1/2 top-0 w-px bg-white/[0.025]" />
          <div className="absolute bottom-0 right-[8%] top-0 w-px bg-white/[0.025]" />

          <div className="absolute left-0 right-0 top-[25%] h-px bg-white/[0.02]" />
          <div className="absolute left-0 right-0 top-[70%] h-px bg-white/[0.02]" />
        </div>

        {/* GRAND 001 */}

        <div
          aria-hidden
          className="pointer-events-none absolute right-[-0.08em] top-[9%] select-none font-display text-[48vw] leading-none tracking-[-0.08em] text-white/[0.018] md:right-[-0.03em] md:top-[-4%] md:text-[34rem]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] max-w-7xl flex-col px-5 pb-7 pt-9 md:px-8 md:pb-10 md:pt-14">
          {/* TOP */}

          <div className="flex items-center justify-between">
            <p
              ref={dropRef}
              className="text-[9px] uppercase tracking-[0.42em] text-stone opacity-0"
            >
              Drop 001 · 2026
            </p>

            <p className="text-[9px] uppercase tracking-[0.35em] text-stone/60">
              France
            </p>
          </div>

          {/* CENTER */}

          <div className="flex flex-1 flex-col justify-center py-14">
            <p className="mb-5 text-[9px] uppercase tracking-[0.42em] text-stone/70">
              Roses / Cerisier
            </p>

            <h1
              ref={titleRef}
              className="font-display text-[21vw] leading-[0.72] tracking-[-0.06em] opacity-0 sm:text-[8rem] md:text-[10rem] lg:text-[12.5rem]"
            >
              AJVEK
            </h1>

            <div className="mt-7 grid gap-8 md:grid-cols-[1fr_1fr] md:items-end">
              <p
                ref={subtitleRef}
                className="max-w-sm text-sm leading-6 text-stone opacity-0 md:text-[15px]"
              >
                Le vêtement commence
                par une ligne.
                <br />
                Le reste construit
                son identité.
              </p>

              <div className="md:flex md:justify-end">
                <Link
                  ref={ctaRef}
                  href="/catalogue"
                  className="group inline-flex items-center gap-6 rounded-full bg-foreground px-6 py-4 text-background opacity-0"
                >
                  <span className="text-[9px] uppercase tracking-[0.28em]">
                    Découvrir Drop 001
                  </span>

                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* BOTTOM */}

          <div
            ref={footerRef}
            className="grid gap-5 border-t border-white/10 pt-5 opacity-0 md:grid-cols-3 md:items-end"
          >
            <div>
              <p className="text-[8px] uppercase tracking-[0.35em] text-stone/60">
                Collection
              </p>

              <p className="mt-2 text-[11px]">
                Roses · Cerisier
              </p>
            </div>

            <div className="hidden text-center md:block">
              <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
                Scroll
              </p>

              <div className="mx-auto mt-3 h-6 w-px bg-gradient-to-b from-stone/50 to-transparent" />
            </div>

            <div className="flex items-end justify-between gap-5 md:justify-end">
              <PaymentNotice />
              <MadeInFrance />
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          DROP
      ======================================================= */}

      <section className="border-t border-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-32">
          <div className="grid gap-14 md:grid-cols-[0.7fr_1.3fr] md:gap-20">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                01 — Drop 001
              </p>
            </div>

            <div>
              <h2 className="font-display text-[12vw] leading-[0.88] tracking-[-0.04em] sm:text-6xl md:text-8xl">
                Deux dessins.
                <br />
                Une identité.
              </h2>

              <p className="mt-8 max-w-lg text-sm leading-7 text-stone md:text-base">
                Roses et Cerisier
                composent le premier
                chapitre AJVEK.
                Deux interprétations
                du végétal pensées
                directement pour
                le vêtement.
              </p>
            </div>
          </div>
        </div>

        {/* ROSES */}

        <Link
          href="/catalogue"
          className="group block border-t border-surface"
        >
          <div className="mx-auto grid min-h-[58svh] max-w-7xl md:grid-cols-2">
            <div className="relative flex min-h-[46svh] items-center justify-center overflow-hidden border-b border-surface bg-[#111110] p-8 md:min-h-[70svh] md:border-b-0 md:border-r">
              <span
                aria-hidden
                className="font-display text-[42vw] leading-none text-white/[0.025] transition-transform duration-700 group-hover:scale-105 md:text-[18rem]"
              >
                R
              </span>

              <div className="absolute bottom-6 left-6 right-6 flex justify-between">
                <span className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
                  AJVEK 001
                </span>

                <span className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
                  Roses
                </span>
              </div>
            </div>

            <div className="flex items-center px-6 py-14 md:px-14">
              <div>
                <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                  Design 01 / 02
                </p>

                <h3 className="mt-5 font-display text-5xl md:text-7xl">
                  ROSES
                </h3>

                <p className="mt-6 max-w-sm text-sm leading-7 text-stone">
                  Une composition
                  construite autour
                  du mouvement de la
                  rose et du lettrage
                  AJVEK.
                </p>

                <p className="mt-8 text-[9px] uppercase tracking-[0.3em]">
                  Découvrir la pièce{" "}
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Link>

        {/* CERISIER */}

        <Link
          href="/catalogue"
          className="group block border-t border-surface"
        >
          <div className="mx-auto grid min-h-[58svh] max-w-7xl md:grid-cols-2">
            <div className="order-2 flex items-center px-6 py-14 md:order-1 md:px-14">
              <div>
                <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                  Design 02 / 02
                </p>

                <h3 className="mt-5 font-display text-5xl md:text-7xl">
                  CERISIER
                </h3>

                <p className="mt-6 max-w-sm text-sm leading-7 text-stone">
                  Une seconde lecture
                  du végétal, plus
                  légère, pensée comme
                  le contrepoint de
                  Roses dans Drop 001.
                </p>

                <p className="mt-8 text-[9px] uppercase tracking-[0.3em]">
                  Découvrir la pièce{" "}
                  <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </div>
            </div>

            <div className="relative order-1 flex min-h-[46svh] items-center justify-center overflow-hidden border-b border-surface bg-[#111110] p-8 md:order-2 md:min-h-[70svh] md:border-b-0 md:border-l">
              <span
                aria-hidden
                className="font-display text-[42vw] leading-none text-white/[0.025] transition-transform duration-700 group-hover:scale-105 md:text-[18rem]"
              >
                C
              </span>

              <div className="absolute bottom-6 left-6 right-6 flex justify-between">
                <span className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
                  AJVEK 002
                </span>

                <span className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
                  Cerisier
                </span>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* =======================================================
          PREORDER / 10
      ======================================================= */}

      <section className="relative overflow-hidden border-y border-surface bg-[#0c0c0b]">
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-0.08em] top-1/2 -translate-y-1/2 font-display text-[80vw] leading-none text-white/[0.015] md:text-[38rem]"
        >
          10
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
          <p className="text-[9px] uppercase tracking-[0.42em] text-stone">
            Production Drop 001
          </p>

          {count !== null ? (
            <>
              <div className="mt-10 flex items-end gap-4">
                <span className="font-display text-[30vw] leading-[0.68] tracking-[-0.06em] sm:text-[11rem] md:text-[15rem]">
                  {String(
                    Math.min(
                      count,
                      PREORDER_GOAL
                    )
                  ).padStart(2, "0")}
                </span>

                <span className="pb-1 font-display text-3xl text-stone md:pb-3 md:text-5xl">
                  /10
                </span>
              </div>

              <div className="mt-12 grid gap-8 md:grid-cols-2 md:items-end">
                <div>
                  <h2 className="font-display text-3xl leading-tight md:text-5xl">
                    {thresholdReached
                      ? "Production débloquée."
                      : `${remaining} pièce${
                          remaining > 1
                            ? "s"
                            : ""
                        } avant production.`}
                  </h2>

                  <p className="mt-5 max-w-md text-sm leading-7 text-stone">
                    Chaque précommande
                    rapproche Drop 001
                    du lancement de sa
                    production.
                  </p>
                </div>

                <div>
                  <div className="h-px overflow-hidden bg-white/10">
                    <div
                      className="h-full bg-foreground transition-all duration-1000"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 flex justify-between text-[8px] uppercase tracking-[0.3em] text-stone/50">
                    <span>00</span>
                    <span>
                      Production
                    </span>
                    <span>10</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="mt-10 text-sm text-stone">
              Chargement de
              l&apos;avancement...
            </p>
          )}
        </div>
      </section>

      {/* =======================================================
          PROCESS ROSES
      ======================================================= */}

      <div className="border-b border-surface">
        <div className="mx-auto max-w-7xl px-5 pb-2 pt-20 md:px-8 md:pt-28">
          <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
            Design 01 — Roses
          </p>

          <p className="mt-3 text-xs text-stone/60">
            L&apos;histoire du premier
            dessin de Drop 001.
          </p>
        </div>
      </div>

      <DesignProcessStory />

      {/* =======================================================
          MANIFESTE
      ======================================================= */}

      <section className="border-t border-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-40">
          <div className="grid gap-14 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                03 — AJVEK
              </p>
            </div>

            <div>
              <p className="font-display text-[10vw] leading-[0.98] tracking-[-0.035em] sm:text-5xl md:text-7xl">
                Pas un motif
                posé sur un
                vêtement.
                <br />
                <span className="text-stone">
                  Une pièce pensée
                  comme un ensemble.
                </span>
              </p>

              <div className="mt-14 grid gap-px bg-surface sm:grid-cols-3">
                <div className="bg-background p-6">
                  <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                    01
                  </p>

                  <p className="mt-8 font-display text-2xl">
                    Dessin
                  </p>
                </div>

                <div className="bg-background p-6">
                  <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                    02
                  </p>

                  <p className="mt-8 font-display text-2xl">
                    Construction
                  </p>
                </div>

                <div className="bg-background p-6">
                  <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                    03
                  </p>

                  <p className="mt-8 font-display text-2xl">
                    Vêtement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          FINAL
      ======================================================= */}

      <section className="relative flex min-h-[85svh] items-center overflow-hidden border-t border-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[44vw] leading-none tracking-[-0.07em] text-white/[0.018] md:text-[27rem]"
        >
          A
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-5 py-24 text-center md:px-8">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            Drop 001
          </p>

          <h2 className="mt-7 font-display text-[18vw] leading-[0.78] tracking-[-0.055em] sm:text-8xl md:text-[10rem]">
            ROSES
            <br />
            <span className="text-stone">
              CERISIER
            </span>
          </h2>

          <p className="mx-auto mt-10 max-w-sm text-sm leading-7 text-stone">
            Le premier chapitre
            AJVEK est disponible
            en précommande.
          </p>

          <Link
            href="/catalogue"
            className="group mt-9 inline-flex items-center gap-6 rounded-full bg-foreground px-7 py-4 text-background"
          >
            <span className="text-[9px] uppercase tracking-[0.3em]">
              Entrer dans la collection
            </span>

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

          <p className="mt-14 text-[8px] uppercase tracking-[0.4em] text-stone/40">
            AJVEK · France · 2026
          </p>
        </div>
      </section>
    </main>
  );
}