"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
} from "react";

const STEPS = [
  {
    image: "/process/01-roses.jpg",
    number: "01",
    title: "Les premières formes",
    text: "Premiers essais autour de la rose, des volumes et des formes.",
  },
  {
    image: "/process/02-feuilles.jpg",
    number: "02",
    title: "Construire le mouvement",
    text: "Recherche des tiges, feuilles et lignes qui vont structurer le motif.",
  },
  {
    image: "/process/03-lettres.jpg",
    number: "03",
    title: "Trouver le lettrage",
    text: "Plusieurs essais avant d’arriver progressivement au langage gothique d’AJVEK.",
  },
  {
    image: "/process/04-ajvek-floral.jpg",
    number: "04",
    title: "Faire fusionner les deux",
    text: "Le végétal commence à s’intégrer au lettrage jusqu’à créer une composition unique.",
  },
  {
    image: "/process/05-tee-shirt-tablette.jpg",
    number: "05",
    title: "Du dessin au vêtement",
    text: "Le design prend finalement place sur le tee-shirt.",
  },
];

export default function DesignProcessStory() {
  const desktopRef =
    useRef<HTMLDivElement | null>(null);

  const mobileRef =
    useRef<HTMLDivElement | null>(null);

  const [activeIndex, setActiveIndex] =
    useState(0);

  useEffect(() => {
    const container = desktopRef.current;

    if (!container) return;

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>(
        "[data-process-step]"
      )
    );

    const observer =
      new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter(
              (entry) =>
                entry.isIntersecting
            )
            .sort(
              (a, b) =>
                b.intersectionRatio -
                a.intersectionRatio
            );

          if (!visible.length) return;

          const index = Number(
            (
              visible[0]
                .target as HTMLElement
            ).dataset.processStep
          );

          if (!Number.isNaN(index)) {
            setActiveIndex(index);
          }
        },
        {
          threshold: [0.25, 0.45, 0.65],
          rootMargin:
            "-20% 0px -20% 0px",
        }
      );

    sections.forEach((section) =>
      observer.observe(section)
    );

    return () =>
      observer.disconnect();
  }, []);

  function handleMobileScroll() {
    const container = mobileRef.current;

    if (!container) return;

    const cards = Array.from(
      container.children
    ) as HTMLElement[];

    if (!cards.length) return;

    const center =
      container.scrollLeft +
      container.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter =
        card.offsetLeft +
        card.offsetWidth / 2;

      const distance = Math.abs(
        cardCenter - center
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }

  return (
    <section className="bg-[#0c0c0b] text-[#f3f0ea]">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-20 md:px-8 md:pb-20 md:pt-32">
        <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-stone-500">
          AJVEK — Processus créatif
        </p>

        <h2 className="font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
          Du croquis
          <br />
          au vêtement.
        </h2>

        <p className="mt-6 max-w-lg text-sm leading-6 text-stone-400 md:text-base">
          Une idée, plusieurs essais,
          puis une construction
          progressive jusqu&apos;au
          design final.
        </p>

        <p className="mt-7 text-[10px] uppercase tracking-[0.35em] text-stone-600 md:hidden">
          Glisse pour découvrir →
        </p>
      </div>

      {/* MOBILE */}
      <div className="md:hidden">
        <div
          ref={mobileRef}
          onScroll={handleMobileScroll}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {STEPS.map((step) => (
            <article
              key={step.image}
              className="w-[93vw] shrink-0 snap-center"
            >
              <div className="mb-6 px-1">
                <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-stone-500">
                  Étape {step.number}
                </p>

                <h3 className="font-display text-[2rem] leading-tight">
                  {step.title}
                </h3>

                <p className="mt-4 max-w-sm text-sm leading-6 text-stone-400">
                  {step.text}
                </p>
              </div>

              <div className="relative h-[59svh] overflow-hidden bg-[#151514]">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="93vw"
                  className="object-contain"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-black/5" />

                <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                    {step.number} / 05
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="flex justify-center gap-2 pb-16">
          {STEPS.map((_, index) => (
            <span
              key={index}
              className={`block h-[2px] transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 bg-white/80"
                  : "w-5 bg-white/15"
              }`}
            />
          ))}
        </div>
      </div>

      {/* DESKTOP */}
      <div
        ref={desktopRef}
        className="relative mx-auto hidden max-w-7xl md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:px-8"
      >
        <div className="sticky top-0 flex h-screen items-center">
          <div className="relative h-[78vh] w-full overflow-hidden bg-[#151514]">
            {STEPS.map(
              (step, index) => (
                <div
                  key={step.image}
                  className={`absolute inset-0 transition-all duration-1000 ease-out ${
                    activeIndex === index
                      ? "scale-100 opacity-100"
                      : index <
                          activeIndex
                        ? "scale-[1.015] opacity-0"
                        : "scale-[0.985] opacity-0"
                  }`}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    sizes="60vw"
                    className="object-contain"
                    priority={
                      index === 0
                    }
                  />
                </div>
              )
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />

            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                {String(
                  activeIndex + 1
                ).padStart(2, "0")}{" "}
                / 05
              </span>

              <div className="flex gap-1.5">
                {STEPS.map(
                  (_, index) => (
                    <span
                      key={index}
                      className={`block h-[2px] transition-all duration-500 ${
                        index ===
                        activeIndex
                          ? "w-8 bg-white"
                          : "w-3 bg-white/20"
                      }`}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          {STEPS.map(
            (step, index) => (
              <article
                key={step.image}
                data-process-step={
                  index
                }
                className="flex min-h-screen items-center"
              >
                <div
                  className={`max-w-md transition-all duration-700 ${
                    activeIndex ===
                    index
                      ? "translate-y-0 opacity-100"
                      : "translate-y-5 opacity-25"
                  }`}
                >
                  <p className="mb-5 text-[10px] uppercase tracking-[0.4em] text-stone-500">
                    Étape{" "}
                    {step.number}
                  </p>

                  <h3 className="font-display text-5xl leading-tight">
                    {step.title}
                  </h3>

                  <p className="mt-5 text-base leading-7 text-stone-400">
                    {step.text}
                  </p>
                </div>
              </article>
            )
          )}
        </div>
      </div>

      {/* FINALE */}
      <div className="mx-auto flex min-h-[48svh] max-w-7xl items-center justify-center px-6 py-20 text-center md:min-h-[55svh] md:py-24">
        <div>
          <p className="text-[10px] uppercase tracking-[0.45em] text-stone-500">
            AJVEK
          </p>

          <p className="mt-5 font-display text-3xl leading-tight md:text-5xl">
            Dessiné.
            <br />
            Développé.
            <br />
            Porté.
          </p>
        </div>
      </div>
    </section>
  );
}