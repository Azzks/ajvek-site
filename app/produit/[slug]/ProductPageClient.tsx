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
    <main className="min-h-screen bg-background text-foreground">
      {/* =====================================================
          PRODUCT
      ====================================================== */}

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-9 px-5 pb-16 pt-8 md:grid-cols-[1.15fr_0.85fr] md:gap-16 md:px-8 md:pb-32 md:pt-16">
        {/* ===================================================
            VIEWER
        ==================================================== */}

        <div className="md:sticky md:top-24 md:self-start">
          <div className="overflow-hidden bg-[#111110]">
            <ProductViewer3D colorway={colorway} />
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-surface pt-3 text-[9px] uppercase tracking-[0.28em] text-stone">
            <span>AJVEK</span>
            <span>Précommande</span>
          </div>
        </div>

        {/* ===================================================
            PRODUCT INFOS
        ==================================================== */}

        <div className="flex flex-col">
          {/* HEADER */}

          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-stone">
              Collection actuelle
            </p>

            <h1 className="mt-4 font-display text-4xl leading-none md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="font-display text-3xl text-foreground">
                {product.price}
              </p>

              <span className="rounded-full border border-surface px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-stone">
                Précommande
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-stone">
              {product.description}
            </p>
          </div>

          {/* =================================================
              COULEUR
          ================================================== */}

          <div className="mt-8 border-t border-surface pt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                Couleur
              </p>

              <p className="text-xs text-foreground">{colorway.label}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.colorways.map((cw, index) => (
                <button
                  key={cw.label}
                  type="button"
                  onClick={() => setColorIndex(index)}
                  className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition ${
                    index === colorIndex
                      ? "border-foreground bg-foreground text-background"
                      : "border-surface text-stone hover:border-stone/60 hover:text-foreground"
                  }`}
                >
                  {cw.label}
                </button>
              ))}
            </div>
          </div>

          {/* =================================================
              TAILLE
          ================================================== */}

          <div className="mt-7 border-t border-surface pt-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                Taille
              </p>

              <span className="text-[10px] uppercase tracking-[0.2em] text-stone">
                Coupe oversize
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`h-12 border text-xs uppercase tracking-[0.2em] transition ${
                    s === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-surface text-stone hover:border-stone/60 hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {!size && (
              <p className="mt-3 text-[11px] leading-5 text-stone">
                Sélectionne ta taille avant d&apos;ajouter le vêtement à ta
                précommande.
              </p>
            )}
          </div>

          {/* =================================================
              PREORDER
          ================================================== */}

          <div className="mt-8 border-t border-surface pt-7">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-[0.35em] text-stone/60">
                  Ta pièce
                </p>

                <p className="mt-2 font-display text-2xl">
                  {product.price}
                </p>
              </div>

              <p className="text-right text-[8px] uppercase leading-5 tracking-[0.28em] text-stone/60">
                Drop 001
                <br />
                Précommande
              </p>
            </div>

            <PreorderForm
              product={product}
              colorway={colorway}
              size={size}
            />
          </div>

          {/* =================================================
              PRODUCTION + LIVRAISON
          ================================================== */}

          <div className="mt-10 border-y border-surface">
            <div className="grid grid-cols-1 divide-y divide-surface sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="py-5 sm:pr-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                  Production
                </p>

                <p className="mt-3 text-sm leading-6 text-foreground">
                  Lancée à partir de 10 vêtements précommandés et payés.
                </p>
              </div>

              <div className="py-5 sm:pl-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                  Livraison
                </p>

                <p className="mt-3 text-sm leading-6 text-foreground">
                  Mondial Relay 4,90 € · domicile 7,90 € · offerte dès 3
                  vêtements.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              REASSURANCE
          ================================================== */}

          <div className="mt-6 grid grid-cols-2 gap-px bg-surface">
            <div className="bg-background p-4">
              <p className="text-[10px] text-foreground">
                Paiement sécurisé
              </p>

              <p className="mt-2 text-[11px] leading-5 text-stone">
                Carte bancaire via Stripe.
              </p>
            </div>

            <div className="bg-background p-4">
              <p className="text-[10px] text-foreground">
                Retours
              </p>

              <p className="mt-2 text-[11px] leading-5 text-stone">
                14 jours après réception.
              </p>
            </div>

            <div className="bg-background p-4">
              <p className="text-[10px] text-foreground">
                Fabrication
              </p>

              <p className="mt-2 text-[11px] leading-5 text-stone">
                Produit en France.
              </p>
            </div>

            <div className="bg-background p-4">
              <p className="text-[10px] text-foreground">
                Précommande
              </p>

              <p className="mt-2 text-[11px] leading-5 text-stone">
                Paiement = confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL BRAND SECTION
      ====================================================== */}

      <section className="relative flex min-h-[40svh] items-center justify-center overflow-hidden border-t border-surface px-6 py-20 text-center md:min-h-[50svh]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[30vw] leading-none text-foreground/[0.015]"
        >
          AJVEK
        </div>

        <div className="relative z-10">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · DROP 001
          </p>

          <p className="mx-auto mt-6 max-w-xl font-display text-4xl leading-[0.95] tracking-[-0.03em] md:text-6xl">
            Du dessin
            <br />
            à la pièce finale.
          </p>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-stone">
            Une première série pensée autour du dessin et produite en quantité
            limitée.
          </p>
        </div>
      </section>
    </main>
  );
}