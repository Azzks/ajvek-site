"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

import DesignProcessStory from "@/components/DesignProcessStory";
import HomeIntro from "@/components/HomeIntro";

const PRICE = "39,90 €";

const PRODUCTS = [
  {
    number: "01",
    code: "AJVEK 001",
    name: "ROSES",
    description:
      "Une composition verticale construite autour de la rose et du lettrage AJVEK.",
    href: "/catalogue",
  },
  {
    number: "02",
    code: "AJVEK 002",
    name: "CERISIER",
    description:
      "Une seconde lecture du végétal, plus organique, pensée comme le contrepoint de Roses.",
    href: "/catalogue",
  },
];

export default function Home() {
  const pageRef = useRef<HTMLElement>(null);

  const heroRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     HERO
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
        y: 35,
        rotationX: -14,
        transformPerspective: 1000,
      });

      const tl = gsap.timeline({
        delay: 0.4,
      });

      tl.to(eyebrowRef.current, {
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
            duration: 1,
            ease: "power3.out",
          },
          "-=0.25"
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
            duration: 0.55,
            ease: "power2.out",
          },
          "-=0.25"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  /* =========================================================
     REVEAL AU SCROLL
  ========================================================= */

  useEffect(() => {
    const root = pageRef.current;

    if (!root) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const revealElements = Array.from(
      root.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    const circleElements = Array.from(
      root.querySelectorAll<HTMLElement>("[data-circle-reveal]")
    );

    if (reducedMotion) {
      gsap.set(revealElements, {
        opacity: 1,
        y: 0,
      });

      gsap.set(circleElements, {
        opacity: 1,
        scale: 1,
      });

      return;
    }

    gsap.set(revealElements, {
      opacity: 0,
      y: 32,
    });

    gsap.set(circleElements, {
      opacity: 0,
      scale: 0.88,
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;

          gsap.to(element, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: "power3.out",
          });

          observer.unobserve(element);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );

    const circleObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target as HTMLElement;

          gsap.to(element, {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
          });

          observer.unobserve(element);
        });
      },
      {
        threshold: 0.15,
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

    circleElements.forEach((element) => {
      circleObserver.observe(element);
    });

    return () => {
      revealObserver.disconnect();
      circleObserver.disconnect();
    };
  }, []);

  return (
    <main
      ref={pageRef}
      className="overflow-hidden bg-background text-foreground"
    >
      <HomeIntro />

      {/* =====================================================
          HERO
      ====================================================== */}

      <section
        ref={heroRef}
        className="relative min-h-[calc(100svh-65px)] overflow-hidden border-b border-surface"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
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
          className="pointer-events-none absolute -right-[20vw] top-[8%] h-[78vw] w-[78vw] rounded-full border border-foreground/[0.055] md:-right-[12vw] md:h-[48vw] md:w-[48vw]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -right-[4vw] top-[24%] h-[45vw] w-[45vw] rounded-full border border-foreground/[0.07] md:right-[2vw] md:h-[27vw] md:w-[27vw]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -left-[20vw] bottom-[-25vw] h-[60vw] w-[60vw] rounded-full border border-foreground/[0.04] md:-left-[15vw] md:-bottom-[20vw] md:h-[45vw] md:w-[45vw]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[49%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[50vw] leading-none text-foreground/[0.018] md:text-[25vw]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-65px)] max-w-7xl flex-col px-5 pb-8 pt-10 md:px-8 md:pb-10 md:pt-16">
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone/60">
              Drop 001 · 2026
            </p>

            <p className="text-[9px] uppercase tracking-[0.4em] text-stone/60">
              France
            </p>
          </div>

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

            <div className="mt-8 flex items-center gap-4">
              <span className="font-display text-3xl">
                {PRICE}
              </span>

              <span className="h-px w-8 bg-stone/30" />

              <span className="text-[8px] uppercase tracking-[0.35em] text-stone">
                Bientôt disponible
              </span>
            </div>

            <Link
              ref={buttonRef}
              href="/catalogue"
              className="group mt-8 flex w-full max-w-md items-center justify-between rounded-full bg-foreground px-7 py-5 text-[10px] uppercase tracking-[0.3em] text-background opacity-0 transition duration-500 hover:scale-[0.985] md:w-fit md:min-w-[390px]"
            >
              <span>Découvrir le Drop 001</span>

              <span className="text-lg transition-transform duration-500 group-hover:translate-x-2">
                →
              </span>
            </Link>

            <p className="mt-5 text-[8px] uppercase tracking-[0.3em] text-stone/45">
              Stock limité · Bientôt disponible
            </p>
          </div>

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
          TRUST
      ====================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 py-5 text-center text-[8px] uppercase tracking-[0.27em] text-stone md:gap-x-8">
            <span>{PRICE}</span>

            <span className="text-stone/25">·</span>

            <span>Bientôt disponible</span>

            <span className="text-stone/25">·</span>

            <span>Série limitée</span>

            <span className="text-stone/25">·</span>

            <span>Drop 001</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          DROP
      ====================================================== */}

      <section className="px-5 pb-12 pt-20 md:px-8 md:pb-16 md:pt-28">
        <div data-reveal className="mx-auto max-w-7xl">
          <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
            01 — Drop 001
          </p>

          <div className="mt-8 grid gap-7 md:grid-cols-2 md:items-end">
            <h2 className="font-display text-[3.5rem] leading-[0.88] tracking-[-0.04em] sm:text-6xl md:text-8xl">
              Deux
              <br />
              pièces.
            </h2>

            <p className="max-w-md text-[15px] leading-7 text-stone md:justify-self-end">
              Deux dessins.
              <br />
              Deux interprétations du végétal.
              <br />
              Le premier chapitre AJVEK.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUITS
      ====================================================== */}

      <section className="border-b border-surface px-5 pb-24 pt-8 md:px-8 md:pb-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 md:grid-cols-2 md:gap-8">
            {PRODUCTS.map((product, index) => (
              <article
                key={product.name}
                data-reveal
                className={`flex flex-col ${
                  index === 1 ? "md:translate-y-24" : ""
                }`}
              >
                <Link
                  href={product.href}
                  data-circle-reveal
                  className="group relative mx-auto flex aspect-square w-full max-w-[520px] items-center justify-center rounded-full border border-surface transition-all duration-700 hover:border-stone/50"
                >
                  <div className="absolute inset-[8%] rounded-full border border-surface/70 transition-transform duration-1000 group-hover:scale-[0.96]" />

                  <div className="absolute inset-[18%] rounded-full border border-surface/40 transition-transform duration-1000 group-hover:scale-[1.04]" />

                  <div className="absolute left-[10%] top-[14%] flex h-12 w-12 items-center justify-center rounded-full border border-surface bg-background text-[9px] tracking-[0.2em]">
                    {product.number}
                  </div>

                  <div className="relative z-10 text-center">
                    <p className="text-[8px] uppercase tracking-[0.45em] text-stone">
                      {product.code}
                    </p>

                    <h3 className="mt-5 font-display text-[13vw] leading-none tracking-[-0.05em] sm:text-7xl md:text-[5.5vw] lg:text-8xl">
                      {product.name}
                    </h3>

                    <p className="mx-auto mt-6 max-w-[240px] text-xs leading-6 text-stone">
                      {product.description}
                    </p>
                  </div>

                  <div className="absolute bottom-[8%] right-[13%] flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-xl text-background transition-all duration-500 group-hover:translate-x-1 group-hover:scale-110">
                    →
                  </div>
                </Link>

                <div className="mx-auto mt-8 w-full max-w-[520px]">
                  <div className="flex items-center justify-between border-b border-surface pb-5">
                    <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                      AJVEK · Drop 001
                    </p>

                    <p className="font-display text-2xl">
                      {PRICE}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Oversize", "Broderie", "DTF"].map(
                      (feature) => (
                        <span
                          key={feature}
                          className="rounded-full border border-surface px-4 py-2 text-[7px] uppercase tracking-[0.3em] text-stone"
                        >
                          {feature}
                        </span>
                      )
                    )}
                  </div>

                  <Link
                    href={product.href}
                    className="group mt-7 flex items-center justify-between rounded-full border border-foreground px-6 py-5 text-[9px] uppercase tracking-[0.3em] transition-all duration-500 hover:bg-foreground hover:text-background"
                  >
                    <span>
                      Découvrir {product.name}
                    </span>

                    <span className="transition-transform duration-500 group-hover:translate-x-2">
                      →
                    </span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          DISPONIBILITÉ
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-surface px-5 py-24 md:px-8 md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[115vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.035] md:w-[70vw]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[85vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.04] md:w-[45vw]"
        />

        <div
          data-reveal
          className="relative z-10 mx-auto max-w-7xl"
        >
          <div className="grid gap-14 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-24">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                Drop 001 · Disponibilité
              </p>

              <h2 className="mt-7 max-w-lg font-display text-[3.5rem] leading-[0.9] tracking-[-0.04em] md:text-7xl">
                Bientôt
                <br />
                disponible.
              </h2>

              <p className="mt-7 max-w-md text-[14px] leading-7 text-stone">
                Les premières pièces AJVEK arrivent bientôt.
                Le Drop 001 ouvrira à la commande dès la mise
                en ligne du stock.
              </p>
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-[380px] items-center justify-center rounded-full border border-surface">
              <div className="absolute inset-[8%] rounded-full border border-surface/60" />

              <div className="relative z-10 px-8 text-center">
                <p className="text-[8px] uppercase tracking-[0.4em] text-stone">
                  Drop 001
                </p>

                <p className="mt-5 font-display text-4xl leading-none md:text-5xl">
                  ARRIVE
                  <br />
                  BIENTÔT
                </p>

                <p className="mt-5 text-[9px] uppercase tracking-[0.3em] text-stone">
                  Stock limité
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-14 max-w-md md:ml-auto md:mr-0">
            <Link
              href="/catalogue"
              className="group flex w-full items-center justify-between rounded-full bg-foreground px-7 py-5 text-[9px] uppercase tracking-[0.3em] text-background transition-transform duration-500 hover:scale-[0.99]"
            >
              <span>
                Découvrir le Drop · {PRICE}
              </span>

              <span className="text-base transition-transform duration-500 group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESS
      ====================================================== */}

      <section className="border-b border-surface px-5 py-14 md:px-8 md:py-20">
        <div data-reveal className="mx-auto max-w-7xl">
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
          MANIFESTE
      ====================================================== */}

      <section className="relative overflow-hidden border-y border-surface px-5 py-24 md:px-8 md:py-36">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[30vw] top-1/2 aspect-square w-[85vw] -translate-y-1/2 rounded-full border border-foreground/[0.04] md:-right-[15vw] md:w-[55vw]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -right-[15vw] top-1/2 aspect-square w-[55vw] -translate-y-1/2 rounded-full border border-foreground/[0.045] md:-right-[4vw] md:w-[32vw]"
        />

        <div
          data-reveal
          className="relative z-10 mx-auto max-w-7xl"
        >
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
            AJVEK construit chaque pièce autour du dessin,
            de sa composition et de sa place sur le vêtement.
          </p>
        </div>
      </section>

      {/* =====================================================
          CTA FINAL
      ====================================================== */}

      <section className="relative flex min-h-[75svh] items-center overflow-hidden px-5 py-24 text-center md:px-8 md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.04] md:w-[65vw]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.055] md:w-[42vw]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[52vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.05] md:w-[25vw]"
        />

        <div
          data-reveal
          className="relative z-10 mx-auto w-full max-w-3xl"
        >
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            Drop 001
          </p>

          <h2 className="mt-8 font-display text-[3.6rem] leading-[0.88] tracking-[-0.04em] sm:text-7xl md:text-8xl">
            ROSES
            <span className="text-stone">
              {" / "}
            </span>
            <br />
            CERISIER
          </h2>

          <p className="mx-auto mt-8 max-w-md text-[14px] leading-7 text-stone">
            Le premier chapitre AJVEK arrive bientôt.
            Découvre les pièces du Drop 001 avant l&apos;ouverture
            des commandes.
          </p>

          <div className="mx-auto mt-8 flex w-fit items-center gap-4">
            <span className="font-display text-3xl">
              {PRICE}
            </span>

            <span className="h-px w-8 bg-stone/30" />

            <span className="text-[8px] uppercase tracking-[0.35em] text-stone">
              Bientôt disponible
            </span>
          </div>

          <Link
            href="/catalogue"
            className="group mx-auto mt-10 flex w-full max-w-md items-center justify-between rounded-full bg-foreground px-7 py-5 text-[9px] uppercase tracking-[0.3em] text-background transition-transform duration-500 hover:scale-[0.99]"
          >
            <span>Voir la collection</span>

            <span className="text-base transition-transform duration-500 group-hover:translate-x-2">
              →
            </span>
          </Link>

          <p className="mt-6 text-[8px] uppercase tracking-[0.3em] text-stone/45">
            Drop 001 · Stock limité · 2026
          </p>
        </div>
      </section>
    </main>
  );
}