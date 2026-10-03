"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type LookbookCollection = {
  id: "roses" | "cerisier";
  name: string;
  subtitle: string;
  productHref: string;
  cover: string;
  images: {
    src: string;
    label: string;
  }[];
};

const COLLECTIONS: LookbookCollection[] = [
  {
    id: "roses",
    name: "ROSES",
    subtitle: "Drop 001",
    productHref: "/produit/roses",
    cover: "/images/lookbook/rose-blanc-dos.jpg",
    images: [
      {
        src: "/images/lookbook/rose-blanc-dos.jpg",
        label: "Roses — Blanc",
      },
      {
        src: "/images/lookbook/rose-noir-dos.jpg",
        label: "Roses — Noir",
      },
    ],
  },
  {
    id: "cerisier",
    name: "CERISIER",
    subtitle: "Drop 001",
    productHref: "/produit/sakura",
    cover: "/images/lookbook/cerisier-noir-dos.jpg",
    images: [
      {
        src: "/images/lookbook/cerisier-noir-dos.jpg",
        label: "Cerisier — Noir · Dos",
      },
      {
        src: "/images/lookbook/cerisier-noir-face.jpg",
        label: "Cerisier — Noir · Face",
      },
      {
        src: "/images/lookbook/cerisier-blanc-dos.jpg",
        label: "Cerisier — Blanc · Dos",
      },
      {
        src: "/images/lookbook/cerisier-blanc-face.jpg",
        label: "Cerisier — Blanc · Face",
      },
    ],
  },
];

export default function LookbookPage() {
  const [selectedCollection, setSelectedCollection] =
    useState<LookbookCollection>(COLLECTIONS[0]);

  const [selectedImageIndex, setSelectedImageIndex] =
    useState(0);

  const selectedImage =
    selectedCollection.images[selectedImageIndex] ??
    selectedCollection.images[0];

  function selectCollection(
    collection: LookbookCollection
  ) {
    setSelectedCollection(collection);
    setSelectedImageIndex(0);
  }

  function previousImage() {
    setSelectedImageIndex((current) => {
      if (current === 0) {
        return selectedCollection.images.length - 1;
      }

      return current - 1;
    });
  }

  function nextImage() {
    setSelectedImageIndex((current) => {
      if (
        current ===
        selectedCollection.images.length - 1
      ) {
        return 0;
      }

      return current + 1;
    });
  }

  return (
    <main className="bg-background text-foreground">
      {/* =====================================================
          INTRO
      ====================================================== */}

      <section className="border-b border-surface px-5 pb-12 pt-12 md:px-8 md:pb-16 md:pt-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
              AJVEK · 2026
            </p>

            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
              Lookbook 001
            </p>
          </div>

          <div className="mt-14 md:mt-20">
            <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
              Drop 001
            </p>

            <h1 className="mt-5 font-display text-[clamp(4rem,12vw,9rem)] leading-[0.82] tracking-[-0.055em]">
              LOOKBOOK
            </h1>

            <div className="mt-8 flex flex-col gap-5 border-t border-surface pt-6 md:flex-row md:items-end md:justify-between">
              <p className="max-w-lg text-sm leading-7 text-stone md:text-[15px]">
                Roses et Cerisier.
                <br />
                Les premières pièces AJVEK portées.
              </p>

              <p className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
                Roses / Cerisier
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          GRANDE PHOTO
      ====================================================== */}

      <section className="border-b border-surface px-5 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden bg-[#11110f]">
            <div className="relative aspect-[4/5] w-full md:aspect-[16/10] lg:aspect-[16/9]">
              <Image
                key={selectedImage.src}
                src={selectedImage.src}
                alt={selectedImage.label}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1280px"
                className="object-cover object-center"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

              {/* INFORMATIONS PHOTO */}

              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-5 p-5 text-white md:p-8">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.4em] text-white/60">
                    AJVEK · Drop 001
                  </p>

                  <p className="mt-2 font-display text-2xl tracking-[-0.02em] md:text-4xl">
                    {selectedImage.label}
                  </p>
                </div>

                <p className="shrink-0 text-[8px] uppercase tracking-[0.3em] text-white/60">
                  {String(
                    selectedImageIndex + 1
                  ).padStart(2, "0")}
                  {" / "}
                  {String(
                    selectedCollection.images.length
                  ).padStart(2, "0")}
                </p>
              </div>

              {/* FLÈCHE GAUCHE */}

              {selectedCollection.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Photo précédente"
                    className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-lg text-white backdrop-blur-md transition hover:bg-black/40 md:left-6 md:h-12 md:w-12"
                  >
                    ←
                  </button>

                  {/* FLÈCHE DROITE */}

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Photo suivante"
                    className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/20 text-lg text-white backdrop-blur-md transition hover:bg-black/40 md:right-6 md:h-12 md:w-12"
                  >
                    →
                  </button>
                </>
              )}
            </div>
          </div>

          {/* =================================================
              2 CARRÉS ROSES / CERISIER
          ================================================== */}

          <div className="mt-5 grid grid-cols-2 gap-3 md:mt-6 md:max-w-2xl md:gap-5">
            {COLLECTIONS.map((collection) => {
              const active =
                selectedCollection.id ===
                collection.id;

              return (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() =>
                    selectCollection(collection)
                  }
                  className={`group relative aspect-square overflow-hidden border text-left transition ${
                    active
                      ? "border-foreground"
                      : "border-surface hover:border-stone"
                  }`}
                >
                  <Image
                    src={collection.cover}
                    alt={collection.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 320px"
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.025]"
                  />

                  <div
                    className={`absolute inset-0 transition ${
                      active
                        ? "bg-black/20"
                        : "bg-black/35 group-hover:bg-black/25"
                    }`}
                  />

                  <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-5">
                    <p className="text-[7px] uppercase tracking-[0.35em] text-white/60">
                      {collection.subtitle}
                    </p>

                    <div className="mt-2 flex items-end justify-between gap-3">
                      <p className="font-display text-xl tracking-[-0.02em] md:text-2xl">
                        {collection.name}
                      </p>

                      {active && (
                        <span className="mb-1 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* =================================================
              PETITES PHOTOS DE LA COLLECTION
          ================================================== */}

          <div className="mt-6">
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {selectedCollection.images.map(
                (image, index) => {
                  const active =
                    selectedImageIndex === index;

                  return (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() =>
                        setSelectedImageIndex(index)
                      }
                      aria-label={`Afficher ${image.label}`}
                      className={`relative aspect-[4/5] w-[72px] shrink-0 overflow-hidden border transition md:w-[86px] ${
                        active
                          ? "border-foreground"
                          : "border-surface opacity-55 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="86px"
                        className="object-cover object-center"
                      />
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* =================================================
              LIEN PRODUIT
          ================================================== */}

          <div className="mt-8 flex flex-col gap-5 border-t border-surface pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                Pièce sélectionnée
              </p>

              <p className="mt-2 font-display text-3xl">
                {selectedCollection.name}
              </p>
            </div>

            <Link
              href={selectedCollection.productHref}
              className="group flex w-full items-center justify-between border border-foreground px-5 py-4 text-[9px] uppercase tracking-[0.28em] transition hover:bg-foreground hover:text-background sm:w-auto sm:min-w-[240px]"
            >
              <span>Découvrir la pièce</span>

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          FIN
      ====================================================== */}

      <section className="px-5 py-20 text-center md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-[8px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Drop 001
          </p>

          <h2 className="mt-6 font-display text-[clamp(3rem,9vw,6rem)] leading-[0.88] tracking-[-0.045em]">
            LE DESSIN
            <br />
            PREND CORPS.
          </h2>

          <Link
            href="/catalogue"
            className="group mx-auto mt-10 flex w-full max-w-md items-center justify-between rounded-full bg-foreground px-7 py-5 text-[9px] uppercase tracking-[0.3em] text-background transition-transform duration-300 hover:scale-[0.99]"
          >
            <span>Voir le Drop 001</span>

            <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}