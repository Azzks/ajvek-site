"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>("[data-process-step]")
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;

        const index = Number(
          (visible[0].target as HTMLElement).dataset.processStep
        );

        if (!Number.isNaN(index)) {
          setActiveIndex(index);
        }
      },
      {
        threshold: [0.25, 0.4, 0.55, 0.7],
        rootMargin: "-20% 0px -20% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[#0c0c0b] text-[#f3f0ea]"
    >
      <div className="mx-auto max-w-7xl px-5 pb-12 pt-24 md:px-8 md:pb-20 md:pt-32">
        <div className="max-w-2xl">
          <p className="mb-4 text-[10px] uppercase tracking-[0.4em] text-stone-500">
            AJVEK — Processus créatif
          </p>

          <h2 className="font-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
            Du croquis
            <br />
            au vêtement.
          </h2>

          <p className="mt-6 max-w-lg text-sm leading-6 text-stone-400 md:text-base">
            Une idée, plusieurs essais, puis une construction progressive
            jusqu’au design final.
          </p>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl md:grid md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:px-8">
        <div className="sticky top-0 z-10 flex h-[72svh] items-center bg-[#0c0c0b] px-4 md:h-screen md:px-0">
          <div className="relative h-[62svh] w-full overflow-hidden bg-[#151514] md:h-[78vh]">
            {STEPS.map((step, index) => (
              <div
                key={step.image}
                className={`absolute inset-0 transition-all duration-1000 ease-out ${
                  activeIndex === index
                    ? "scale-100 opacity-100"
                    : index < activeIndex
                    ? "scale-[1.015] opacity-0"
                    : "scale-[0.985] opacity-0"
                }`}
              >
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-contain"
                  priority={index === 0}
                />
              </div>
            ))}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/5" />

            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between md:bottom-7 md:left-7 md:right-7">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">
                {String(activeIndex + 1).padStart(2, "0")} / 05
              </span>

              <div className="flex gap-1.5">
                {STEPS.map((_, index) => (
                  <span
                    key={index}
                    className={`block h-[2px] transition-all duration-500 ${
                      index === activeIndex
                        ? "w-8 bg-white"
                        : "w-3 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative px-6 md:px-0">
          {STEPS.map((step, index) => (
            <article
              key={step.image}
              data-process-step={index}
              className="flex min-h-[72svh] items-center py-20 md:min-h-screen md:py-0"
            >
              <div
                className={`max-w-md transition-all duration-700 ${
                  activeIndex === index
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-25"
                }`}
              >
                <p className="mb-5 text-[10px] uppercase tracking-[0.4em] text-stone-500">
                  Étape {step.number}
                </p>

                <h3 className="font-display text-3xl leading-tight md:text-5xl">
                  {step.title}
                </h3>

                <p className="mt-5 text-sm leading-6 text-stone-400 md:text-base md:leading-7">
                  {step.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mx-auto flex min-h-[55svh] max-w-7xl items-center justify-center px-6 py-24 text-center">
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