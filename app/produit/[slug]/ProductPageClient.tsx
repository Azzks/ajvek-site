"use client";

import {
  useEffect,
  useState,
} from "react";
import { notFound } from "next/navigation";

import { getProduct } from "@/lib/products";
import ProductViewer3D from "@/components/ProductViewer3D";
import PreorderForm from "@/components/PreorderForm";

type StockItem = {
  product_slug: string;
  color: string;
  size: string;
  stock_quantity: number;
  sales_enabled: boolean;
  available: boolean;
};

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
        Math.max(
          parseInt(colorParam ?? "0", 10) || 0,
          0
        ),
        product.colorways.length - 1
      )
    : 0;

  const [colorIndex, setColorIndex] =
    useState(initialColorIndex);

  const [size, setSize] =
    useState<string | null>(null);

  const [stock, setStock] =
    useState<StockItem[]>([]);

  const [stockLoading, setStockLoading] =
    useState(true);

  const [stockError, setStockError] =
    useState(false);

  /* =========================================================
     CHARGEMENT DU STOCK
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadStock() {
      setStockLoading(true);
      setStockError(false);

      try {
        const response = await fetch(
          "/api/stock",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Impossible de charger le stock."
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setStock(
            Array.isArray(data.stock)
              ? data.stock
              : []
          );
        }
      } catch (error) {
        console.error(
          "[product-stock]",
          error
        );

        if (!cancelled) {
          setStock([]);
          setStockError(true);
        }
      } finally {
        if (!cancelled) {
          setStockLoading(false);
        }
      }
    }

    loadStock();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!product) {
    return notFound();
  }

  const productSlug = product.slug;

  const colorway =
    product.colorways[colorIndex];

  /* =========================================================
     STOCK DE LA TAILLE
  ========================================================= */

  function getStockForSize(
    selectedSize: string
  ) {
    return stock.find(
      (item) =>
        item.product_slug === productSlug &&
        item.color.toLowerCase() ===
          colorway.label.toLowerCase() &&
        item.size.toUpperCase() ===
          selectedSize.toUpperCase()
    );
  }

  /*
   * Stock correspondant exactement à la
   * couleur + taille actuellement choisies.
   */

  const selectedStock = size
    ? getStockForSize(size) ?? null
    : null;

  /*
   * Les ventes sont ouvertes pour cette
   * couleur uniquement si au moins une taille
   * possède sales_enabled = true.
   *
   * Tant que les vêtements ne sont pas arrivés,
   * sales_enabled reste false dans Supabase.
   */

  const salesOpen =
    !stockLoading &&
    !stockError &&
    product.sizes.some((currentSize) => {
      const item =
        getStockForSize(currentSize);

      return (
        item?.sales_enabled === true
      );
    });

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
            <ProductViewer3D
              colorway={colorway}
            />
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-surface pt-3 text-[9px] uppercase tracking-[0.28em] text-stone">
            <span>AJVEK</span>
            <span>Drop 001</span>
          </div>
        </div>

        {/* ===================================================
            PRODUCT INFOS
        ==================================================== */}

        <div className="flex flex-col">
          {/* HEADER */}

          <div>
            <p className="text-[10px] uppercase tracking-[0.38em] text-stone">
              Drop 001
            </p>

            <h1 className="mt-4 font-display text-4xl leading-none md:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-center justify-between gap-4">
              <p className="font-display text-3xl text-foreground">
                {product.price}
              </p>

              <span className="rounded-full border border-surface px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-stone">
                {salesOpen
                  ? "Disponible"
                  : "Bientôt disponible"}
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

              <p className="text-xs text-foreground">
                {colorway.label}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {product.colorways.map(
                (cw, index) => (
                  <button
                    key={cw.label}
                    type="button"
                    onClick={() => {
                      setColorIndex(index);
                      setSize(null);
                    }}
                    className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[0.2em] transition ${
                      index === colorIndex
                        ? "border-foreground bg-foreground text-background"
                        : "border-surface text-stone hover:border-stone/60 hover:text-foreground"
                    }`}
                  >
                    {cw.label}
                  </button>
                )
              )}
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
              {product.sizes.map((s) => {
                const stockItem =
                  getStockForSize(s);

                /*
                 * Une taille est indiquée comme
                 * épuisée uniquement lorsque
                 * les ventes sont ouvertes.
                 */

                const soldOut =
                  salesOpen &&
                  stockItem?.sales_enabled ===
                    true &&
                  Number(
                    stockItem.stock_quantity
                  ) <= 0;

                return (
                  <button
                    key={s}
                    type="button"
                    disabled={
                      stockLoading ||
                      stockError ||
                      soldOut
                    }
                    onClick={() =>
                      setSize(s)
                    }
                    className={`relative h-12 border text-xs uppercase tracking-[0.2em] transition ${
                      soldOut
                        ? "cursor-not-allowed border-surface text-stone/30 line-through"
                        : s === size
                          ? "border-foreground bg-foreground text-background"
                          : "border-surface text-stone hover:border-stone/60 hover:text-foreground"
                    } ${
                      stockLoading ||
                      stockError
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {stockLoading && (
              <p className="mt-3 text-[11px] leading-5 text-stone">
                Chargement des disponibilités...
              </p>
            )}

            {!stockLoading &&
              stockError && (
                <p className="mt-3 text-[11px] leading-5 text-stone">
                  Disponibilités momentanément
                  indisponibles.
                </p>
              )}

            {!stockLoading &&
              !stockError &&
              !salesOpen && (
                <p className="mt-3 text-[11px] leading-5 text-stone">
                  Le premier stock AJVEK arrive
                  bientôt.
                </p>
              )}

            {!stockLoading &&
              !stockError &&
              salesOpen &&
              !size && (
                <p className="mt-3 text-[11px] leading-5 text-stone">
                  Sélectionne une taille.
                </p>
              )}
          </div>

          {/* =================================================
              DROP / COMMANDE
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
                Stock limité
              </p>
            </div>

            <PreorderForm
              product={product}
              colorway={colorway}
              size={size}
              selectedStock={selectedStock}
              stockLoading={stockLoading}
              stockError={stockError}
            />
          </div>

          {/* =================================================
              STOCK + LIVRAISON
          ================================================== */}

          <div className="mt-10 border-y border-surface">
            <div className="grid grid-cols-1 divide-y divide-surface sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <div className="py-5 sm:pr-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                  Premier drop
                </p>

                <p className="mt-3 text-sm leading-6 text-foreground">
                  Première série produite en
                  quantité limitée.
                </p>

                <p className="mt-2 text-[11px] leading-5 text-stone">
                  {salesOpen
                    ? "Disponible dans la limite du stock."
                    : "Le premier stock arrive bientôt."}
                </p>
              </div>

              <div className="py-5 sm:pl-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                  Livraison
                </p>

                <p className="mt-3 text-sm leading-6 text-foreground">
                  Mondial Relay 4,90 € ·
                  domicile 7,90 € · offerte dès
                  3 vêtements.
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
                Stock limité
              </p>

              <p className="mt-2 text-[11px] leading-5 text-stone">
                Première série de 32 pièces.
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
            Une première série pensée autour du
            dessin et produite en quantité limitée.
          </p>
        </div>
      </section>
    </main>
  );
}