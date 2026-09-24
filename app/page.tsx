"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
    image: "/images/drop-001/roses-black.jpg",
    secondaryImage: "/images/drop-001/roses-white.jpg",
  },
  {
    number: "02",
    code: "AJVEK 002",
    name: "CERISIER",
    letter: "C",
    description:
      "Une seconde lecture du végétal, plus légère, pensée comme le contrepoint de Roses.",
    href: "/catalogue",
    image: "/images/drop-001/cerisier-white.jpg",
    secondaryImage: "/images/drop-001/cerisier-black.jpg",
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

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[44vw] leading-none text-foreground/[0.018] md:text-[24vw]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] max-w-7xl flex-col px-5 pb-8 pt-12 md:px-8 md:pb-10 md:pt-20">
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone/70">
              Drop 001 · 2026
            </p>

            <p className="text-[9px] uppercase tracking-[0.4em] text-stone/50">
              France
            </p>
          </div>

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
          RÉASSURANCE
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

      <section className="border-b border-surface px-5 py-16 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-[0.35fr_1fr] md:gap-20">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
              01 — Drop 001
            </p>

            <div>
              <h2 className="max-w-3xl font-display text-[3rem] leading-[0.9] tracking-[-0.035em] sm:text-6xl md:text-7xl">
                Deux dessins.
                <br />
                Une identité.
              </h2>

              <p className="mt-7 max-w-xl text-[14px] leading-7 text-stone md:text-base">
                Roses et Cerisier composent le premier chapitre AJVEK.
                Deux interprétations du végétal pensées directement
                pour le vêtement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          DROP 001 — PRODUITS
      ======================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-24">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
                Drop 001
              </p>

              <h2 className="mt-5 font-display text-5xl leading-none tracking-[-0.04em] md:text-7xl">
                Les pièces.
              </h2>
            </div>

            <p className="hidden max-w-xs text-right text-sm leading-6 text-stone md:block">
              Deux dessins. Deux interprétations.
              <br />
              Un même chapitre.
            </p>
          </div>
        </div>

        {DESIGNS.map((design, index) => (
          <article
            key={design.name}
            className="border-t border-surface"
          >
            <div
              className={`mx-auto grid max-w-7xl md:min-h-[82vh] md:grid-cols-2 ${
                index % 2 === 1
                  ? "md:[&>*:first-child]:order-2"
                  : ""
              }`}
            >
              {/* IMAGE PRINCIPALE */}

              <Link
                href={design.href}
                className="group relative min-h-[57svh] overflow-hidden bg-[#e8e6e2] md:min-h-full"
              >
                <Image
                  src={design.image}
                  alt={`T-shirt AJVEK ${design.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.025]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />

                <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-[8px] tracking-[0.2em] text-white backdrop-blur md:left-8 md:top-8">
                  {design.number}
                </div>

                <div className="absolute bottom-5 left-5 md:bottom-8 md:left-8">
                  <p className="text-[8px] uppercase tracking-[0.4em] text-white/65">
                    AJVEK · Drop 001
                  </p>
                </div>

                <div className="absolute bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg text-black transition-transform duration-300 group-hover:translate-x-1 md:bottom-8 md:right-8">
                  →
                </div>
              </Link>

              {/* INFORMATIONS */}

              <div className="relative flex min-h-[55svh] flex-col justify-between overflow-hidden px-5 py-9 md:min-h-full md:px-12 md:py-12 lg:px-16">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 font-display text-[70vw] leading-none text-foreground/[0.018] md:text-[30vw]"
                >
                  {design.letter}
                </span>

                <div className="relative z-10 flex items-center justify-between">
                  <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
                    {design.code}
                  </p>

                  <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
                    {design.number} / 02
                  </p>
                </div>

                <div className="relative z-10 py-12 md:py-20">
                  <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
                    AJVEK · Drop 001
                  </p>

                  <h3 className="mt-6 font-display text-[4rem] leading-[0.8] tracking-[-0.045em] sm:text-7xl md:text-8xl">
                    {design.name}
                  </h3>

                  <p className="mt-8 max-w-sm text-[14px] leading-7 text-stone md:text-[15px]">
                    {design.description}
                  </p>

                  <div className="mt-9 flex flex-wrap gap-2">
                    <span className="border border-surface px-4 py-2 text-[8px] uppercase tracking-[0.3em] text-stone">
                      Oversize
                    </span>

                    <span className="border border-surface px-4 py-2 text-[8px] uppercase tracking-[0.3em] text-stone">
                      Broderie
                    </span>

                    <span className="border border-surface px-4 py-2 text-[8px] uppercase tracking-[0.3em] text-stone">
                      DTF
                    </span>
                  </div>
                </div>

                <Link
                  href={design.href}
                  className="group relative z-10 flex items-center justify-between border-t border-surface pt-6"
                >
                  <span className="text-[9px] uppercase tracking-[0.4em]">
                    Découvrir la pièce
                  </span>

                  <span className="text-xl transition-transform duration-300 group-hover:translate-x-2">
                    →
                  </span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* =======================================================
          PRÉCOMMANDES
      ======================================================== */}

      <section className="border-b border-surface px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-24">
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

              <div className="mt-9">
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

              <Link
                href="/catalogue"
                className="group mt-9 flex w-full max-w-md items-center justify-between rounded-full border border-foreground px-6 py-4 text-[9px] uppercase tracking-[0.3em] transition duration-300 hover:bg-foreground hover:text-background"
              >
                <span>Précommander</span>

                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =======================================================
          PROCESS ROSES
      ======================================================== */}

      <section className="border-b border-surface px-5 py-7 md:px-8">
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
          MANIFESTE
      ======================================================== */}

      <section className="relative overflow-hidden border-t border-surface px-5 py-20 md:px-8 md:py-32">
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

          <h2 className="mt-9 max-w-5xl font-display text-[2.7rem] leading-[0.95] tracking-[-0.035em] sm:text-6xl md:text-7xl">
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

          <div className="mt-12 grid gap-0 border-y border-surface md:mt-16 md:grid-cols-3">
            {[
              ["01", "Dessin"],
              ["02", "Construction"],
              ["03", "Vêtement"],
            ].map(([number, label], index) => (
              <div
                key={number}
                className={`py-6 md:px-8 md:py-9 ${
                  index < 2
                    ? "border-b border-surface md:border-b-0 md:border-r"
                    : ""
                } ${index === 0 ? "md:pl-0" : ""}`}
              >
                <p className="text-[9px] tracking-[0.4em] text-stone/55">
                  {number}
                </p>

                <p className="mt-4 font-display text-3xl">
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

      <section className="relative flex min-h-[55svh] items-center overflow-hidden border-t border-surface px-5 py-20 text-center md:px-8 md:py-28">
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

          <p className="mx-auto mt-7 max-w-md text-sm leading-7 text-stone md:text-base">
            Le premier chapitre AJVEK est disponible en précommande.
          </p>

          <Link
            href="/catalogue"
            className="group mx-auto mt-9 flex w-full max-w-xl items-center justify-between rounded-full bg-foreground px-7 py-5 text-[10px] uppercase tracking-[0.3em] text-background transition duration-300 hover:scale-[0.99]"
          >
            <span>Entrer dans la collection</span>

            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

          <p className="mt-12 text-[8px] uppercase tracking-[0.5em] text-stone/40">
            AJVEK · France · 2026
          </p>
        </div>
      </section>
    </main>
  );
}