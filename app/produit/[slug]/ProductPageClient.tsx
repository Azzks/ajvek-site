"use client";

import { useState } from "react";
import { notFound } from "next/navigation";

import { getProduct } from "@/lib/products";
import ProductViewer3D from "@/components/ProductViewer3D";
import PreorderForm from "@/components/PreorderForm";

export default function ProductPageClient({
  slug,
  colorParam,
}: {
  slug: string;
  colorParam?: string;
}) {
  const product = getProduct(slug);

  const initialColorIndex = product
    ? Math.min(
        Math.max(parseInt(colorParam ?? "0", 10) || 0, 0),
        product.colorways.length - 1
      )
    : 0;

  const [colorIndex, setColorIndex] = useState(initialColorIndex);
  const [size, setSize] = useState<string | null>(null);

  if (!product) {
    return notFound();
  }

  const colorway = product.colorways[colorIndex];

  return (
    <main className="min-h-screen overflow-hidden bg-background pb-24 text-foreground md:pb-0">
      {/* =====================================================
          PRODUCT HERO
      ====================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:min-h-[calc(100svh-65px)] md:grid-cols-[1.08fr_0.92fr]">
            {/* =================================================
                VISUEL
            ================================================== */}

            <div className="relative border-b border-surface md:border-b-0 md:border-r">
              <div className="relative md:sticky md:top-0 md:min-h-[calc(100svh-65px)]">
                {/* INFORMATIONS VISUEL */}

                <div className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between md:left-8 md:right-8 md:top-8">
                  <p className="text-[8px] uppercase tracking-[0.4em] text-stone/70">
                    AJVEK · DROP 001
                  </p>

                  <p className="text-[8px] uppercase tracking-[0.4em] text-stone/70">
                    {String(colorIndex + 1).padStart(2, "0")} /{" "}
                    {String(product.colorways.length).padStart(2, "0")}
                  </p>
                </div>

                {/* VIEWER */}

                <div className="relative flex min-h-[58svh] items-center justify-center overflow-hidden bg-[#111110] md:min-h-[calc(100svh-65px)]">
                  {/* GRILLE DISCRÈTE */}

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

                  {/* NOM FANTÔME */}

                  <div
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[25vw] leading-none text-white/[0.025] md:text-[12vw]"
                  >
                    {product.name}
                  </div>

                  <div className="relative z-10 w-full">
                    <ProductViewer3D colorway={colorway} />
                  </div>
                </div>

                {/* BAS VISUEL */}

                <div className="absolute bottom-5 left-5 right-5 z-20 hidden items-end justify-between md:flex md:bottom-8 md:left-8 md:right-8">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.35em] text-stone/60">
                      Coloris
                    </p>

                    <p className="mt-2 text-xs text-foreground">
                      {colorway.label}
                    </p>
                  </div>

                  <p className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
                    Vue 3D · Interactif
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                INFORMATIONS
            ================================================== */}

            <div className="flex flex-col px-5 py-10 md:px-10 md:py-12 lg:px-14 lg:py-14">
              {/* TOP */}

              <div className="flex items-center justify-between">
                <p className="text-[8px] uppercase tracking-[0.4em] text-stone">
                  Drop 001
                </p>

                <span className="border border-surface px-3 py-2 text-[8px] uppercase tracking-[0.3em] text-stone">
                  Précommande
                </span>
              </div>

              {/* NOM */}

              <div className="mt-12 md:mt-16">
                <p className="text-[9px] uppercase tracking-[0.42em] text-stone/60">
                  AJVEK
                </p>

                <h1 className="mt-5 font-display text-[4rem] leading-[0.82] tracking-[-0.045em] sm:text-7xl lg:text-[5.8rem]">
                  {product.name}
                </h1>

                <div className="mt-8 flex items-end justify-between gap-5 border-b border-surface pb-7">
                  <p className="font-display text-3xl">
                    {product.price}
                  </p>

                  <p className="text-[8px] uppercase tracking-[0.32em] text-stone/55">
                    Série limitée
                  </p>
                </div>

                <p className="mt-7 max-w-lg text-[14px] leading-7 text-stone">
                  {product.description}
                </p>
              </div>

              {/* =================================================
                  COULEURS
              ================================================== */}

              <div className="mt-10 border-t border-surface pt-7">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
                      01 — Coloris
                    </p>

                    <p className="mt-3 text-sm text-foreground">
                      {colorway.label}
                    </p>
                  </div>

                  <p className="text-[9px] text-stone/50">
                    {colorIndex + 1} / {product.colorways.length}
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2">
                  {product.colorways.map((cw, index) => {
                    const active = index === colorIndex;

                    return (
                      <button
                        key={cw.label}
                        type="button"
                        onClick={() => setColorIndex(index)}
                        className={`group relative flex min-h-14 items-center justify-between border px-4 text-left transition duration-300 ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-surface text-stone hover:border-stone/60 hover:text-foreground"
                        }`}
                      >
                        <span className="text-[9px] uppercase tracking-[0.25em]">
                          {cw.label}
                        </span>

                        <span
                          className={`h-2 w-2 rounded-full border ${
                            active
                              ? "border-background bg-background"
                              : "border-stone/50"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* =================================================
                  TAILLES
              ================================================== */}

              <div className="mt-9 border-t border-surface pt-7">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
                      02 — Taille
                    </p>

                    <p className="mt-3 text-sm">
                      {size ? `Taille ${size}` : "Sélectionner une taille"}
                    </p>
                  </div>

                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone/50">
                    Coupe oversize
                  </p>
                </div>

                <div className="mt-6 grid grid-cols-4 gap-2">
                  {product.sizes.map((s) => {
                    const active = s === size;

                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`relative flex h-14 items-center justify-center border text-[10px] uppercase tracking-[0.25em] transition duration-300 ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-surface text-stone hover:border-stone/60 hover:text-foreground"
                        }`}
                      >
                        {s}

                        {active && (
                          <span className="absolute bottom-1.5 h-px w-3 bg-background/50" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {!size && (
                  <p className="mt-4 text-[10px] leading-5 text-stone/55">
                    Sélectionne ta taille pour ajouter cette pièce à ta
                    précommande.
                  </p>
                )}
              </div>

              {/* =================================================
                  CTA EXISTANT
              ================================================== */}

              <div className="mt-9 border-t border-surface pt-8">
                <PreorderForm
                  product={product}
                  colorway={colorway}
                  size={size}
                />
              </div>

              {/* MICRO TRUST */}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-[7px] uppercase tracking-[0.28em] text-stone/45">
                <span>Paiement sécurisé</span>
                <span>·</span>
                <span>14 jours pour retourner</span>
                <span>·</span>
                <span>France</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT IDENTITY
      ====================================================== */}

      <section className="border-b border-surface px-5 py-20 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-[0.35fr_1fr] md:gap-20">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                La pièce
              </p>
            </div>

            <div>
              <h2 className="max-w-4xl font-display text-[3.3rem] leading-[0.92] tracking-[-0.04em] sm:text-6xl md:text-7xl">
                Le dessin ne vient
                <br />
                pas après.
                <br />

                <span className="text-stone">
                  Il construit la pièce.
                </span>
              </h2>

              <p className="mt-9 max-w-xl text-[15px] leading-7 text-stone">
                Chaque design AJVEK est développé autour de sa place sur
                le vêtement, de ses proportions et de la manière dont il
                accompagne la silhouette.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DETAILS
      ====================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Coupe",
                value: "Oversize",
                text: "Une silhouette ample pensée pour un porté streetwear.",
              },
              {
                number: "02",
                title: "Devant",
                value: "Broderie",
                text: "Signature AJVEK travaillée en broderie.",
              },
              {
                number: "03",
                title: "Dos",
                value: "DTF",
                text: "Le dessin principal est imprimé au dos de la pièce.",
              },
              {
                number: "04",
                title: "Production",
                value: "France",
                text: "Personnalisation et production réalisées en France.",
              },
            ].map((detail, index) => (
              <div
                key={detail.number}
                className={`min-h-64 px-5 py-8 md:px-7 md:py-10 ${
                  index < 3
                    ? "border-b border-surface md:border-b-0 md:border-r"
                    : ""
                }`}
              >
                <p className="text-[8px] tracking-[0.4em] text-stone/45">
                  {detail.number}
                </p>

                <p className="mt-10 text-[8px] uppercase tracking-[0.35em] text-stone">
                  {detail.title}
                </p>

                <p className="mt-3 font-display text-3xl">
                  {detail.value}
                </p>

                <p className="mt-5 max-w-xs text-xs leading-6 text-stone/70">
                  {detail.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          PREORDER EXPLANATION
      ====================================================== */}

      <section className="border-b border-surface px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 md:grid-cols-2 md:gap-24">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                Précommande
              </p>

              <h2 className="mt-8 font-display text-[3.5rem] leading-[0.9] tracking-[-0.04em] md:text-7xl">
                Une première
                <br />
                série courte.
              </h2>
            </div>

            <div className="flex flex-col justify-end">
              <p className="max-w-lg text-[15px] leading-7 text-stone">
                La production du premier Drop AJVEK est lancée à partir
                de 10 vêtements précommandés et payés. Cette méthode nous
                permet de produire au plus proche de la demande.
              </p>

              <div className="mt-10 border-y border-surface">
                <div className="flex items-center justify-between border-b border-surface py-5">
                  <span className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Point Relais
                  </span>

                  <span className="text-sm">4,90 €</span>
                </div>

                <div className="flex items-center justify-between border-b border-surface py-5">
                  <span className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Domicile
                  </span>

                  <span className="text-sm">7,90 €</span>
                </div>

                <div className="flex items-center justify-between py-5">
                  <span className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Dès 3 vêtements
                  </span>

                  <span className="text-sm">Livraison offerte</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          REASSURANCE
      ====================================================== */}

      <section className="border-b border-surface px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-px bg-surface sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Paiement", "Sécurisé via Stripe"],
              ["Retours", "14 jours après réception"],
              ["Livraison", "France"],
              ["Collection", "Drop 001"],
            ].map(([title, text]) => (
              <div
                key={title}
                className="bg-background px-5 py-7 md:px-7"
              >
                <p className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
                  {title}
                </p>

                <p className="mt-3 text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative flex min-h-[62svh] items-center overflow-hidden px-5 py-24 text-center md:px-8 md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[35vw] leading-none text-foreground/[0.018] md:text-[20vw]"
        >
          {product.name}
        </div>

        <div className="relative z-10 mx-auto w-full max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Drop 001
          </p>

          <h2 className="mt-8 font-display text-[4rem] leading-[0.85] tracking-[-0.04em] sm:text-7xl md:text-8xl">
            {product.name}
          </h2>

          <p className="mt-7 font-display text-3xl">
            {product.price}
          </p>

          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-stone">
            Sélectionne ton coloris et ta taille pour réserver ta pièce
            du premier Drop AJVEK.
          </p>

          <button
            type="button"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="group mx-auto mt-10 flex w-full max-w-lg items-center justify-between rounded-full bg-foreground px-7 py-5 text-[9px] uppercase tracking-[0.3em] text-background"
          >
            <span>Choisir ma pièce</span>

            <span className="text-lg transition-transform duration-300 group-hover:-translate-y-1">
              ↑
            </span>
          </button>

          <p className="mt-12 text-[8px] uppercase tracking-[0.45em] text-stone/35">
            AJVEK · France · 2026
          </p>
        </div>
      </section>

      {/* =====================================================
          MOBILE BUY BAR
      ====================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-background/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[8px] uppercase tracking-[0.3em] text-stone/55">
              {product.name}
            </p>

            <p className="mt-1 font-display text-xl leading-none">
              {product.price}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="flex min-w-[180px] items-center justify-between rounded-full bg-foreground px-5 py-4 text-[8px] uppercase tracking-[0.25em] text-background"
          >
            <span>{size ? `Taille ${size}` : "Choisir"}</span>
            <span className="ml-4 text-sm">↑</span>
          </button>
        </div>
      </div>
    </main>
  );
}