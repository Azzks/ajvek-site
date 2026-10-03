"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type LookbookImage = {
  src: string;
  label: string;
  shortLabel: string;
};

type LookbookCollection = {
  id: "roses" | "cerisier";
  name: string;
  motif: string;
  productHref: string;
  cover: string;
  images: LookbookImage[];
};

const COLLECTIONS: LookbookCollection[] = [
  {
    id: "roses",
    name: "ROSES",
    motif: "Motif Rose",
    productHref: "/produit/roses",
    cover: "/images/lookbook/rose-blanc-dos.jpg",
    images: [
      {
        src: "/images/lookbook/cerisier-noir-face.jpg",
        label: "Roses — Noir · Face",
        shortLabel: "Noir · Face",
      },
      {
        src: "/images/lookbook/rose-noir-dos.jpg",
        label: "Roses — Noir · Dos",
        shortLabel: "Noir · Dos",
      },
      {
        src: "/images/lookbook/cerisier-blanc-face.jpg",
        label: "Roses — Blanc · Face",
        shortLabel: "Blanc · Face",
      },
      {
        src: "/images/lookbook/rose-blanc-dos.jpg",
        label: "Roses — Blanc · Dos",
        shortLabel: "Blanc · Dos",
      },
    ],
  },
  {
    id: "cerisier",
    name: "CERISIER",
    motif: "Motif Cerisier",
    productHref: "/produit/sakura",
    cover: "/images/lookbook/cerisier-noir-dos.jpg",
    images: [
      {
        src: "/images/lookbook/cerisier-noir-face.jpg",
        label: "Cerisier — Noir · Face",
        shortLabel: "Noir · Face",
      },
      {
        src: "/images/lookbook/cerisier-noir-dos.jpg",
        label: "Cerisier — Noir · Dos",
        shortLabel: "Noir · Dos",
      },
      {
        src: "/images/lookbook/cerisier-blanc-face.jpg",
        label: "Cerisier — Blanc · Face",
        shortLabel: "Blanc · Face",
      },
      {
        src: "/images/lookbook/cerisier-blanc-dos.jpg",
        label: "Cerisier — Blanc · Dos",
        shortLabel: "Blanc · Dos",
      },
    ],
  },
];

export default function LookbookPage() {
  const [collectionIndex, setCollectionIndex] =
    useState(0);

  const [imageIndex, setImageIndex] =
    useState(0);

  const collection =
    COLLECTIONS[collectionIndex];

  const selectedImage =
    collection.images[imageIndex];

  function selectCollection(index: number) {
    setCollectionIndex(index);
    setImageIndex(0);
  }

  function previousImage() {
    setImageIndex((current) =>
      current === 0
        ? collection.images.length - 1
        : current - 1
    );
  }

  function nextImage() {
    setImageIndex((current) =>
      current ===
      collection.images.length - 1
        ? 0
        : current + 1
    );
  }

  return (
    <main className="overflow-hidden bg-[#0d0d0c] text-[#f3f0ea]">
      {/* =====================================================
          HEADER LOOKBOOK
      ====================================================== */}

      <section className="px-5 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <p className="text-[7px] uppercase tracking-[0.5em] text-[#8a8178] md:text-[8px]">
              AJVEK · 2026
            </p>

            <p className="text-[7px] uppercase tracking-[0.5em] text-[#8a8178] md:text-[8px]">
              Lookbook 001
            </p>
          </div>

          <div className="mt-10 text-center md:mt-12">
            <h1 className="font-display text-[clamp(3.6rem,9vw,7.5rem)] leading-none tracking-[0.04em]">
              LOOKBOOK
            </h1>

            <p className="mt-5 text-[8px] uppercase tracking-[0.55em] text-[#8a8178] md:text-[9px]">
              Roses / Cerisier — Drop 001
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          GALERIE
      ====================================================== */}

      <section className="px-5 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* GRANDE PHOTO */}

          <div className="relative overflow-hidden border border-white/[0.08] bg-[#080808]">
            <div className="relative h-[68svh] min-h-[520px] max-h-[850px] w-full md:h-[75vh]">
              {/*
                IMPORTANT :
                object-contain permet de conserver toute la
                photo verticale sans couper Julien.
              */}

              <Image
                key={selectedImage.src}
                src={selectedImage.src}
                alt={selectedImage.label}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1280px"
                className="object-contain object-center"
              />

              {/* Fond derrière la photo si l'écran est large */}

              <div className="-z-10 absolute inset-0 bg-[#080808]" />

              {/* Dégradé uniquement pour la lisibilité */}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/75 to-transparent" />

              {/* GAUCHE */}

              <button
                type="button"
                onClick={previousImage}
                aria-label="Photo précédente"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-lg text-white backdrop-blur-sm transition hover:bg-white hover:text-black md:left-6 md:h-12 md:w-12"
              >
                ←
              </button>

              {/* DROITE */}

              <button
                type="button"
                onClick={nextImage}
                aria-label="Photo suivante"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-lg text-white backdrop-blur-sm transition hover:bg-white hover:text-black md:right-6 md:h-12 md:w-12"
              >
                →
              </button>

              {/* INFOS */}

              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-5 p-5 md:p-8">
                <div>
                  <p className="text-[7px] uppercase tracking-[0.45em] text-white/55 md:text-[8px]">
                    AJVEK · Drop 001
                  </p>

                  <h2 className="mt-3 font-display text-2xl tracking-[-0.02em] md:text-4xl">
                    {selectedImage.label}
                  </h2>
                </div>

                <p className="shrink-0 text-[7px] uppercase tracking-[0.35em] text-white/55 md:text-[8px]">
                  {String(
                    imageIndex + 1
                  ).padStart(2, "0")}
                  {" / "}
                  {String(
                    collection.images.length
                  ).padStart(2, "0")}
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              4 MINIATURES
          ================================================== */}

          <div className="mt-4 grid grid-cols-4 gap-2 md:mt-5 md:gap-4">
            {collection.images.map(
              (image, index) => {
                const active =
                  imageIndex === index;

                return (
                  <button
                    key={`${collection.id}-${image.shortLabel}`}
                    type="button"
                    onClick={() =>
                      setImageIndex(index)
                    }
                    className="group text-left"
                  >
                    <div
                      className={`relative aspect-[4/5] overflow-hidden border transition ${
                        active
                          ? "border-[#f3f0ea]"
                          : "border-white/[0.08] opacity-55 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.label}
                        fill
                        sizes="(max-width: 768px) 25vw, 300px"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="mt-3 hidden items-center justify-center gap-2 sm:flex">
                      {active && (
                        <span className="h-1 w-1 rounded-full bg-[#f3f0ea]" />
                      )}

                      <p
                        className={`text-center text-[7px] uppercase tracking-[0.35em] ${
                          active
                            ? "text-[#f3f0ea]"
                            : "text-[#6f6861]"
                        }`}
                      >
                        {image.shortLabel}
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* =================================================
              ROSES / CERISIER
          ================================================== */}

          <div className="mt-16 grid gap-4 md:mt-24 md:grid-cols-2 md:gap-5">
            {COLLECTIONS.map(
              (item, index) => {
                const active =
                  collectionIndex === index;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      selectCollection(index)
                    }
                    className={`group relative overflow-hidden border text-left transition ${
                      active
                        ? "border-[#f3f0ea]/70"
                        : "border-white/[0.08]"
                    }`}
                  >
                    <div className="relative aspect-[4/3] md:aspect-[5/4]">
                      <Image
                        src={item.cover}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
                      />

                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/5" />

                      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-10">
                        <p className="text-[7px] uppercase tracking-[0.5em] text-white/55">
                          Drop 001
                        </p>

                        <h3 className="mt-4 font-display text-4xl tracking-[-0.03em] md:text-5xl lg:text-6xl">
                          {item.name}
                        </h3>

                        <p className="mt-4 text-[8px] uppercase tracking-[0.4em] text-white/60">
                          {item.motif}
                        </p>

                        <div className="mt-7 flex items-center gap-4">
                          <span className="border border-white/40 px-5 py-3 text-[7px] uppercase tracking-[0.35em] text-white transition group-hover:bg-white group-hover:text-black">
                            Voir le look
                          </span>

                          {active && (
                            <span className="text-[7px] uppercase tracking-[0.3em] text-white/60">
                              Sélectionné
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>

          {/* =================================================
              PRODUIT SÉLECTIONNÉ
          ================================================== */}

          <div className="mt-5 flex flex-col gap-6 border-b border-t border-white/[0.08] py-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[7px] uppercase tracking-[0.4em] text-[#6f6861]">
                Collection sélectionnée
              </p>

              <p className="mt-2 font-display text-3xl">
                {collection.name}
              </p>
            </div>

            <Link
              href={collection.productHref}
              className="group flex w-full items-center justify-between border border-white/20 px-6 py-4 text-[8px] uppercase tracking-[0.35em] transition hover:bg-[#f3f0ea] hover:text-[#0d0d0c] sm:w-auto sm:min-w-[260px]"
            >
              <span>Découvrir la pièce</span>

              <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOT LOOKBOOK
      ====================================================== */}

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 border-b border-white/[0.08] pb-16 md:grid-cols-[1fr_auto_1fr] md:items-end">
            <div>
              <p className="text-[7px] uppercase tracking-[0.45em] text-[#6f6861]">
                L&apos;univers AJVEK
              </p>

              <p className="mt-4 max-w-sm text-sm leading-7 text-[#8a8178]">
                Le vêtement porté.
                <br />
                Le dessin en mouvement.
              </p>
            </div>

            <p className="font-display text-center text-4xl tracking-[0.2em] md:text-5xl">
              AJVEK
            </p>

            <p className="text-left text-[7px] uppercase leading-6 tracking-[0.4em] text-[#6f6861] md:text-right">
              Silhouette
              <br />
              Matière
              <br />
              Mouvement
            </p>
          </div>

          <div className="pt-10 text-center">
            <Link
              href="/catalogue"
              className="group inline-flex items-center gap-8 text-[8px] uppercase tracking-[0.4em] text-[#8a8178] transition hover:text-[#f3f0ea]"
            >
              <span>Voir le Drop 001</span>

              <span className="text-base transition-transform duration-300 group-hover:translate-x-2">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}