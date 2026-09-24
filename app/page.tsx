"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

import DesignProcessStory from "@/components/DesignProcessStory";
import HomeIntro from "@/components/HomeIntro";

const PREORDER_GOAL = 10;
const PRICE = "39,90 €";

const PRODUCTS = [
  {
    number: "01",
    code: "AJVEK 001",
    name: "ROSES",
    description:
      "Une composition verticale construite autour de la rose et du lettrage AJVEK.",
    image: "/images/drop/roses-black.jpg",
    alternateImage: "/images/drop/roses-white.jpg",
    href: "/catalogue",
  },
  {
    number: "02",
    code: "AJVEK 002",
    name: "CERISIER",
    description:
      "Une seconde lecture du végétal, plus organique, pensée comme le contrepoint de Roses.",
    image: "/images/drop/cerisier-white.jpg",
    alternateImage: "/images/drop/cerisier-black.jpg",
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

  /* =========================================================
     PRÉCOMMANDES
  ========================================================= */

  useEffect(() => {
    fetch("/api/preorder-count", {
      cache: "no-store",
    })
      .then((response) => response.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(null));
  }, []);

  /* =========================================================
     ANIMATION HERO
  ========================================================= */

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
      gsap.set(elements, {
        opacity: 0,
        y: 18,
      });

      gsap.set(titleRef.current, {
        y: 30,
        rotationX: -12,
        transformPerspective: 1000,
      });

      const tl = gsap.timeline({
        delay: 0.45,
      });

      tl.to(eyebrowRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
      })
        .to(
          titleRef.current,
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.9,
            ease: "power3.out",
          },
          "-=0.2"
        )
        .to(
          textRef.current,
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
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
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.25"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const safeCount = count ?? 0;
  const remaining =
    count !== null ? Math.max(PREORDER_GOAL - safeCount, 0) : PREORDER_GOAL;

  const percent =
    count !== null
      ? Math.min((safeCount / PREORDER_GOAL) * 100, 100)
      : 0;

  const thresholdReached =
    count !== null && safeCount >= PREORDER_GOAL;

  return (
    <main className="overflow-hidden bg-background pb-24 text-foreground md:pb-0">
      <HomeIntro />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        ref={heroRef}
        className="relative min-h-[calc(100svh-65px)] overflow-hidden border-b border-surface"
      >
        {/* GRID */}

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

        {/* GHOST */}

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[49%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[50vw] leading-none text-foreground/[0.018] md:text-[25vw]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] max-w-7xl flex-col px-5 pb-8 pt-10 md:px-8 md:pb-10 md:pt-16">
          {/* TOP */}

          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone/60">
              Drop 001 · 2026
            </p>

            <p className="text-[9px] uppercase tracking-[0.4em] text-stone/60">
              France
            </p>
          </div>

          {/* CENTER */}

          <div className="flex flex-1 flex-col justify-center py-10">
            <p
              ref={eyebrowRef}
              className="text-[9px] uppercase tracking-[0.48em] text-stone opacity-0"
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

            {/* PRICE */}

            <div className="mt-8 flex items-center gap-4">
              <span className="font-display text-3xl">
                {PRICE}
              </span>

              <span className="h-px w-8 bg-stone/30" />

              <span className="text-[8px] uppercase tracking-[0.35em] text-stone">
                Précommande ouverte
              </span>
            </div>

            <Link
              ref={buttonRef}
              href="/catalogue"
              className="group mt-8 flex w-full max-w-md items-center justify-between rounded-full bg-foreground px-7 py-5 text-[10px] uppercase tracking-[0.3em] text-background opacity-0 transition duration-300 hover:scale-[0.99] md:w-fit md:min-w-[390px]"
            >
              <span>Voir le Drop 001</span>

              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <p className="mt-5 text-[8px] uppercase tracking-[0.3em] text-stone/45">
              Paiement sécurisé · Série limitée
            </p>
          </div>

          {/* BOTTOM */}

          <div
            ref={metaRef}
            className="border-t border-surface pt-5 opacity-0"
          >
            <div className="flex items-center justify-between">
              <p className="text-[8px] uppercase tracking-[0.35em] text-stone/55">
                Première collection
              </p>

              <p className="text-[11px]">
                Roses · Cerisier
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST STRIP
      ====================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 py-5 text-center text-[8px] uppercase tracking-[0.27em] text-stone md:gap-x-8">
            <span>39,90 €</span>
            <span className="text-stone/25">·</span>
            <span>Paiement sécurisé</span>
            <span className="text-stone/25">·</span>
            <span>Série limitée</span>
            <span className="text-stone/25">·</span>
            <span>Drop 001</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCTS INTRO
      ====================================================== */}

      <section className="px-5 pb-14 pt-20 md:px-8 md:pb-20 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
            01 — Drop 001
          </p>

          <div className="mt-8 grid gap-7 md:grid-cols-2 md:items-end">
            <h2 className="font-display text-[3.5rem] leading-[0.88] tracking-[-0.04em] sm:text-6xl md:text-8xl">
              Les
              <br />
              pièces.
            </h2>

            <p className="max-w-md text-[15px] leading-7 text-stone md:justify-self-end">
              Deux dessins. Deux interprétations du végétal.
              <br />
              Le premier chapitre AJVEK.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl">
          {PRODUCTS.map((product, index) => (
            <article
              key={product.name}
              className={`grid md:grid-cols-2 ${
                index !== PRODUCTS.length - 1
                  ? "border-b border-surface"
                  : ""
              }`}
            >
              {/* IMAGE */}

              <Link
                href={product.href}
                className={`group relative aspect-[4/5] overflow-hidden bg-[#d5d4d1] md:aspect-square ${
                  index % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                <Image
                  src={product.image}
                  alt={`T-shirt AJVEK ${product.name}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.015]"
                />

                <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-[9px] tracking-[0.2em] backdrop-blur-md">
                  {product.number}
                </div>

                <div className="absolute bottom-5 left-5 text-[8px] uppercase tracking-[0.4em] text-black/60">
                  AJVEK · DROP 001
                </div>

                <div className="absolute bottom-5 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl text-black transition duration-300 group-hover:scale-105">
                  →
                </div>
              </Link>

              {/* CONTENT */}

              <div
                className={`flex flex-col justify-center px-5 py-14 md:px-12 md:py-20 lg:px-16 ${
                  index % 2 === 1 ? "md:order-1" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
                    {product.code}
                  </p>

                  <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
                    {product.number} / 02
                  </p>
                </div>

                <p className="mt-16 text-[9px] uppercase tracking-[0.4em] text-stone">
                  AJVEK · Drop 001
                </p>

                <h3 className="mt-6 font-display text-[3.8rem] leading-[0.85] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
                  {product.name}
                </h3>

                <p className="mt-8 max-w-md text-[15px] leading-7 text-stone">
                  {product.description}
                </p>

                {/* FEATURES */}

                <div className="mt-9 flex flex-wrap gap-2">
                  {["Oversize", "Broderie", "DTF"].map((feature) => (
                    <span
                      key={feature}
                      className="border border-surface px-5 py-3 text-[8px] uppercase tracking-[0.32em] text-stone"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* PRICE */}

                <div className="mt-12 flex items-end justify-between border-t border-surface pt-7">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
                      Prix
                    </p>

                    <p className="mt-2 font-display text-4xl">
                      {PRICE}
                    </p>
                  </div>

                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone/50">
                    Précommande
                  </p>
                </div>

                <Link
                  href={product.href}
                  className="group mt-7 flex items-center justify-between rounded-full border border-foreground px-6 py-5 text-[9px] uppercase tracking-[0.3em] transition duration-300 hover:bg-foreground hover:text-background"
                >
                  <span>Précommander {product.name}</span>

                  <span className="text-base transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          PREORDER
      ====================================================== */}

      <section className="border-b border-surface px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 md:grid-cols-[0.85fr_1.15fr] md:items-end md:gap-24">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                Première série
              </p>

              <h2 className="mt-7 max-w-lg font-display text-[3.5rem] leading-[0.9] tracking-[-0.04em] md:text-7xl">
                10 pièces.
                <br />
                Pas plus.
              </h2>
            </div>

            <div>
              <p className="max-w-lg text-[15px] leading-7 text-stone">
                Drop 001 commence par une première série de dix
                précommandes. Une production courte pour lancer
                AJVEK sans surproduire.
              </p>

              {/* PROGRESS */}

              <div className="mt-10">
                <div className="flex items-end justify-between">
                  <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                    Première série
                  </p>

                  {count !== null && count > 0 && (
                    <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                      {safeCount} / {PREORDER_GOAL}
                    </p>
                  )}
                </div>

                <div className="mt-5 h-px overflow-hidden bg-surface">
                  <div
                    className="h-full bg-foreground transition-all duration-1000"
                    style={{
                      width: `${percent}%`,
                    }}
                  />
                </div>

                <div className="mt-4 flex justify-between text-[8px] uppercase tracking-[0.32em] text-stone/40">
                  <span>Lancement</span>
                  <span>10 pièces</span>
                </div>
              </div>

              <p className="mt-8 text-sm leading-6 text-stone/70">
                {thresholdReached
                  ? "La première série est complète."
                  : count !== null && count > 0
                  ? `${remaining} ${
                      remaining > 1 ? "pièces restantes" : "pièce restante"
                    } avant le lancement de la production.`
                  : "Les premières précommandes sont ouvertes."}
              </p>

              <Link
                href="/catalogue"
                className="group mt-9 flex w-full items-center justify-between rounded-full bg-foreground px-7 py-5 text-[9px] uppercase tracking-[0.3em] text-background"
              >
                <span>Précommander · {PRICE}</span>
                <span className="text-base transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESS
      ====================================================== */}

      <section className="border-b border-surface px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                02 — Processus
              </p>

              <h2 className="mt-7 font-display text-5xl leading-[0.9] md:text-7xl">
                Du croquis
                <br />
                au vêtement.
              </h2>
            </div>

            <p className="max-w-md text-[15px] leading-7 text-stone md:justify-self-end">
              Une idée, plusieurs essais, puis une construction
              progressive jusqu&apos;au dessin final.
            </p>
          </div>
        </div>
      </section>

      <DesignProcessStory />

      {/* =====================================================
          MANIFESTO
      ====================================================== */}

      <section className="relative overflow-hidden border-y border-surface px-5 py-24 md:px-8 md:py-36">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 font-display text-[65vw] leading-none text-foreground/[0.018] md:text-[30vw]"
        >
          A
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            03 — AJVEK
          </p>

          <h2 className="mt-10 max-w-5xl font-display text-[3.2rem] leading-[0.94] tracking-[-0.035em] sm:text-6xl md:text-8xl">
            Dessiné.
            <br />
            Développé.
            <br />

            <span className="text-stone">
              Porté.
            </span>
          </h2>

          <p className="mt-10 max-w-lg text-[15px] leading-7 text-stone">
            AJVEK construit chaque pièce autour du dessin, de sa
            composition et de sa place sur le vêtement.
          </p>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative flex min-h-[70svh] items-center overflow-hidden px-5 py-24 text-center md:px-8 md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[25vw] leading-none text-foreground/[0.02]"
        >
          DROP 001
        </div>

        <div className="relative z-10 mx-auto w-full max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            Drop 001
          </p>

          <h2 className="mt-8 font-display text-[3.6rem] leading-[0.88] tracking-[-0.04em] sm:text-7xl md:text-8xl">
            ROSES
            <span className="text-stone"> / </span>
            <br className="sm:hidden" />
            CERISIER
          </h2>

          <p className="mx-auto mt-8 max-w-md text-[15px] leading-7 text-stone">
            Le premier chapitre AJVEK.
            <br />
            Disponible maintenant en précommande.
          </p>

          <p className="mt-7 font-display text-4xl">
            {PRICE}
          </p>

          <Link
            href="/catalogue"
            className="group mx-auto mt-9 flex w-full max-w-xl items-center justify-between rounded-full bg-foreground px-7 py-5 text-[9px] uppercase tracking-[0.3em] text-background transition duration-300 hover:scale-[0.99]"
          >
            <span>Choisir ma pièce</span>

            <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

          <p className="mt-12 text-[8px] uppercase tracking-[0.45em] text-stone/40">
            AJVEK · DROP 001 · 2026
          </p>
        </div>
      </section>

      {/* =====================================================
          MOBILE STICKY BUY BAR
      ====================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="min-w-0 flex-1 pl-1">
            <p className="truncate text-[8px] uppercase tracking-[0.32em] text-stone/55">
              AJVEK · Drop 001
            </p>

            <p className="mt-1 font-display text-xl leading-none">
              {PRICE}
            </p>
          </div>

          <Link
            href="/catalogue"
            className="flex min-w-[185px] items-center justify-between rounded-full bg-foreground px-5 py-4 text-[8px] uppercase tracking-[0.25em] text-background"
          >
            <span>Précommander</span>
            <span className="ml-4 text-sm">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}