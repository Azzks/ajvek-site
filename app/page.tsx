"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

import MadeInFrance from "@/components/MadeInFrance";
import PaymentNotice from "@/components/PaymentNotice";
import DesignProcessStory from "@/components/DesignProcessStory";
import HomeIntro from "@/components/HomeIntro";

const PREORDER_GOAL = 10;

const DESIGNS = [
  {
    number: "01",
    code: "AJVEK 001",
    name: "ROSES",
    letter: "R",
    description:
      "Une composition construite autour du mouvement de la rose et du lettrage AJVEK.",
    href: "/catalogue",
  },
  {
    number: "02",
    code: "AJVEK 002",
    name: "CERISIER",
    letter: "C",
    description:
      "Une seconde lecture du végétal, plus légère, pensée comme le contrepoint de Roses.",
    href: "/catalogue",
  },
];

export default function Home() {
  const heroRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  const [count, setCount] = useState<number | null>(null);

  /*
   * ============================================================
   * PRÉCOMMANDES
   * ============================================================
   */

  useEffect(() => {
    fetch("/api/preorder-count", {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(null));
  }, []);

  /*
   * ============================================================
   * ANIMATION HERO
   * ============================================================
   */

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const elements = [
      eyebrowRef.current,
      titleRef.current,
      textRef.current,
      buttonRef.current,
      metaRef.current,
    ];

    if (reducedMotion) {
      gsap.set(elements, {
        opacity: 1,
        y: 0,
        rotationX: 0,
      });

      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(eyebrowRef.current, {
        opacity: 0,
        y: 10,
      });

      gsap.set(titleRef.current, {
        opacity: 0,
        y: 24,
        rotationX: -15,
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

      const timeline = gsap.timeline({
        delay: 0.65,
      });

      timeline
        .to(eyebrowRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.95,
            ease: "power3.out",
          },
          "-=0.25"
        )
        .to(
          textRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .to(
          buttonRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .to(
          metaRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out",
          },
          "-=0.2"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  /*
   * ============================================================
   * COMPTEUR
   * ============================================================
   */

  const safeCount = count ?? 0;

  const thresholdReached =
    count !== null && safeCount >= PREORDER_GOAL;

  const remaining =
    count !== null
      ? Math.max(PREORDER_GOAL - safeCount, 0)
      : PREORDER_GOAL;

  const percent =
    count !== null
      ? Math.min((safeCount / PREORDER_GOAL) * 100, 100)
      : 0;

  return (
    <main className="overflow-hidden bg-background text-foreground">
      <HomeIntro />

      {/* =======================================================
          HERO
      ======================================================== */}

      <section
        ref={heroRef}
        className="relative overflow-hidden border-b border-surface"
      >
        {/* GRILLE TRÈS DISCRÈTE */}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "25% 25%",
          }}
        />

        {/* GRAND TEXTE FANTÔME */}

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[44vw] leading-none text-foreground/[0.018] md:text-[24vw]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] max-w-7xl flex-col px-5 pb-8 pt-12 md:px-8 md:pb-10 md:pt-20">
          {/* PETITES INFOS */}

          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone/70">
              Drop 001 · 2026
            </p>

            <p className="text-[9px] uppercase tracking-[0.4em] text-stone/50">
              France
            </p>
          </div>

          {/* CENTRE */}

          <div className="flex flex-1 flex-col justify-center py-12">
            <p
              ref={eyebrowRef}
              className="text-[10px] uppercase tracking-[0.5em] text-stone opacity-0"
            >
              Roses / Cerisier
            </p>

            <h1
              ref={titleRef}
              className="mt-7 font-display text-[21vw] leading-[0.75] tracking-[-0.055em] opacity-0 sm:text-[8rem] md:text-[10rem] lg:text-[12rem]"
            >
              AJVEK
            </h1>

            <p
              ref={textRef}
              className="mt-8 max-w-lg text-[15px] leading-7 text-stone opacity-0 md:text-base"
            >
              Le vêtement commence par une ligne.
              <br />
              Le reste construit son identité.
            </p>

            <Link
              ref={buttonRef}
              href="/catalogue"
              className="group mt-10 flex w-full max-w-md items-center justify-between rounded-full bg-foreground px-7 py-5 text-[10px] uppercase tracking-[0.3em] text-background opacity-0 transition duration-300 hover:scale-[0.99] md:w-fit md:min-w-[360px]"
            >
              <span>Découvrir Drop 001</span>

              <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* BAS HERO */}

          <div
            ref={metaRef}
            className="border-t border-surface pt-5 opacity-0"
          >
            <div className="flex items-center justify-between gap-5">
              <p className="text-[9px] uppercase tracking-[0.35em] text-stone">
                Collection
              </p>

              <p className="text-[11px] text-foreground">
                Roses · Cerisier
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          RÉASSURANCE — BEAUCOUP PLUS COMPACTE
      ======================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 py-5 text-center text-[8px] uppercase tracking-[0.28em] text-stone md:gap-x-10 md:py-6 md:text-[9px]">
            <span>Paiement sécurisé</span>

            <span className="text-stone/35">·</span>

            <span>Production française</span>

            <span className="text-stone/35">·</span>

            <span>Précommande limitée</span>
          </div>

          <div className="hidden">
            <PaymentNotice />
            <MadeInFrance />
          </div>
        </div>
      </section>

      {/* =======================================================
          INTRO DROP
      ======================================================== */}

      <section className="border-b border-surface px-5 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[0.35fr_1fr] md:gap-20">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
              01 — Drop 001
            </p>

            <div>
              <h2 className="max-w-3xl font-display text-[3.25rem] leading-[0.9] tracking-[-0.035em] sm:text-6xl md:text-7xl">
                Deux dessins.
                <br />
                Une identité.
              </h2>

              <p className="mt-8 max-w-xl text-[15px] leading-7 text-stone md:text-base">
                Roses et Cerisier composent le premier chapitre AJVEK.
                Deux interprétations du végétal pensées directement
                pour le vêtement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          LES 2 DESIGNS — FUSIONNÉS
      ======================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2">
            {DESIGNS.map((design, index) => (
              <Link
                key={design.name}
                href={design.href}
                className={`group relative flex min-h-[62svh] flex-col justify-between overflow-hidden px-5 py-8 transition duration-500 hover:bg-white/[0.015] md:min-h-[78vh] md:px-10 md:py-10 ${
                  index === 0
                    ? "border-b border-surface md:border-b-0 md:border-r"
                    : ""
                }`}
              >
                {/* LETTRE FANTÔME */}

                <span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 font-display text-[62vw] leading-none text-foreground/[0.025] transition duration-700 group-hover:scale-[1.03] group-hover:text-foreground/[0.04] md:text-[24vw]"
                >
                  {design.letter}
                </span>

                {/* TOP */}

                <div className="relative z-10 flex items-center justify-between">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-stone/60">
                    {design.code}
                  </p>

                  <p className="text-[9px] uppercase tracking-[0.4em] text-stone/60">
                    {design.name}
                  </p>
                </div>

                {/* BOTTOM */}

                <div className="relative z-10">
                  <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                    Design {design.number} / 02
                  </p>

                  <h3 className="mt-5 font-display text-[4rem] leading-none tracking-[-0.035em] sm:text-7xl">
                    {design.name}
                  </h3>

                  <p className="mt-7 max-w-md text-[15px] leading-7 text-stone">
                    {design.description}
                  </p>

                  <div className="mt-9 flex items-center gap-7 text-[9px] uppercase tracking-[0.35em] text-foreground">
                    <span>Découvrir la pièce</span>

                    <span className="transition-transform duration-300 group-hover:translate-x-2">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================
          PRÉCOMMANDES — COMPACT
      ======================================================== */}

      <section className="border-b border-surface px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-24">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                Production Drop 001
              </p>

              <div className="mt-7 flex items-end gap-3">
                <span className="font-display text-[5.5rem] leading-[0.72] tracking-[-0.05em] md:text-[8rem]">
                  {String(safeCount).padStart(2, "0")}
                </span>

                <span className="pb-1 font-display text-3xl text-stone md:pb-2 md:text-4xl">
                  / {PREORDER_GOAL}
                </span>
              </div>
            </div>

            <div>
              <h2 className="font-display text-4xl leading-[0.95] md:text-6xl">
                {thresholdReached
                  ? "La production peut commencer."
                  : `${remaining} ${
                      remaining > 1 ? "pièces" : "pièce"
                    } avant production.`}
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-7 text-stone md:text-base">
                Chaque précommande payée rapproche Drop 001 du
                lancement de sa production.
              </p>

              <div className="mt-10">
                <div className="h-px overflow-hidden bg-surface">
                  <div
                    className="h-full bg-foreground transition-all duration-1000 ease-out"
                    style={{
                      width: `${percent}%`,
                    }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between text-[8px] uppercase tracking-[0.35em] text-stone/55">
                  <span>00</span>
                  <span>Production</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          PROCESS ROSES
      ======================================================== */}

      <section className="border-b border-surface px-5 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                Design 01 — Roses
              </p>

              <p className="mt-3 text-xs text-stone/60">
                L&apos;histoire du premier dessin de Drop 001.
              </p>
            </div>

            <span className="hidden text-[9px] uppercase tracking-[0.35em] text-stone/50 sm:block">
              Processus créatif ↓
            </span>
          </div>
        </div>
      </section>

      <DesignProcessStory />

      {/* =======================================================
          MANIFESTE — PLUS COURT
      ======================================================== */}

      <section className="relative overflow-hidden border-t border-surface px-5 py-24 md:px-8 md:py-36">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-1/2 -translate-y-1/2 font-display text-[55vw] leading-none text-foreground/[0.018] md:right-0 md:text-[28vw]"
        >
          A
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            03 — AJVEK
          </p>

          <h2 className="mt-12 max-w-5xl font-display text-[3.15rem] leading-[0.94] tracking-[-0.035em] sm:text-6xl md:text-7xl">
            Pas un motif posé
            <br />
            sur un vêtement.
            <br />

            <span className="text-stone">
              Une pièce pensée
              <br />
              comme un ensemble.
            </span>
          </h2>

          <div className="mt-16 grid gap-0 border-y border-surface md:grid-cols-3">
            {[
              ["01", "Dessin"],
              ["02", "Construction"],
              ["03", "Vêtement"],
            ].map(([number, label], index) => (
              <div
                key={number}
                className={`py-7 md:px-8 md:py-9 ${
                  index < 2
                    ? "border-b border-surface md:border-b-0 md:border-r"
                    : ""
                } ${index === 0 ? "md:pl-0" : ""}`}
              >
                <p className="text-[9px] tracking-[0.4em] text-stone/55">
                  {number}
                </p>

                <p className="mt-5 font-display text-3xl">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =======================================================
          CTA FINAL
      ======================================================== */}

      <section className="relative flex min-h-[65svh] items-center overflow-hidden border-t border-surface px-5 py-24 text-center md:px-8 md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[23vw] leading-none text-foreground/[0.025]"
        >
          DROP 001
        </div>

        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            Drop 001
          </p>

          <h2 className="mt-7 font-display text-5xl leading-[0.9] tracking-[-0.04em] sm:text-6xl md:text-8xl">
            ROSES
            <span className="text-stone"> / </span>
            CERISIER
          </h2>

          <p className="mx-auto mt-8 max-w-md text-sm leading-7 text-stone md:text-base">
            Le premier chapitre AJVEK est disponible en précommande.
          </p>

          <Link
            href="/catalogue"
            className="group mx-auto mt-10 flex w-full max-w-xl items-center justify-between rounded-full bg-foreground px-7 py-5 text-[10px] uppercase tracking-[0.3em] text-background transition duration-300 hover:scale-[0.99]"
          >
            <span>Entrer dans la collection</span>

            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

          <p className="mt-16 text-[8px] uppercase tracking-[0.5em] text-stone/40">
            AJVEK · France · 2026
          </p>
        </div>
      </section>
    </main>
  );
}