"use client";

import { useEffect, useState } from "react";
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
        Math.max(parseInt(colorParam ?? "0", 10) || 0, 0),
        product.colorways.length - 1
      )
    : 0;

  const [colorIndex, setColorIndex] = useState(initialColorIndex);
  const [size, setSize] = useState<string | null>(null);
  const [stock, setStock] = useState<StockItem[]>([]);
  const [stockLoading, setStockLoading] = useState(true);
  const [stockError, setStockError] = useState(false);

  /* =========================================================
     CHARGEMENT DU STOCK
  ========================================================= */

  useEffect(() => {
    let cancelled = false;

    async function loadStock() {
      setStockLoading(true);
      setStockError(false);

      try {
        const response = await fetch("/api/stock", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Impossible de charger le stock.");
        }

        const data = await response.json();

        if (!cancelled) {
          setStock(Array.isArray(data.stock) ? data.stock : []);
        }
      } catch (error) {
        console.error("[product-stock]", error);

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
  const colorway = product.colorways[colorIndex];

  /* =========================================================
     STOCK DE LA TAILLE
  ========================================================= */

  function getStockForSize(selectedSize: string) {
    return stock.find(
      (item) =>
        item.product_slug === productSlug &&
        item.color.toLowerCase() === colorway.label.toLowerCase() &&
        item.size.toUpperCase() === selectedSize.toUpperCase()
    );
  }

  const selectedStock = size ? getStockForSize(size) ?? null : null;

  /*
   * Les ventes sont ouvertes pour cette couleur uniquement
   * si au moins une taille possède sales_enabled = true.
   */

  const salesOpen =
    !stockLoading &&
    !stockError &&
    product.sizes.some((currentSize) => {
      const item = getStockForSize(currentSize);

      return item?.sales_enabled === true;
    });

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =====================================================
          PRODUCT HERO
      ====================================================== */}

      <section className="mx-auto max-w-[1500px] px-4 pb-20 pt-4 sm:px-6 md:px-8 md:pb-32 md:pt-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)] lg:gap-12 xl:gap-20">
          {/* ===================================================
              VIEWER
          ==================================================== */}

          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden bg-[#111110]">
              <div className="pointer-events-none absolute left-5 top-5 z-10 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                <span className="text-[8px] uppercase tracking-[0.35em] text-white/60">
                  Drop 001
                </span>
              </div>

              <div className="pointer-events-none absolute right-5 top-5 z-10 text-right">
                <p className="text-[8px] uppercase tracking-[0.3em] text-white/40">
                  AJVEK
                </p>
              </div>

              <ProductViewer3D colorway={colorway} />

              <div className="pointer-events-none absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between">
                <p className="max-w-[180px] text-[8px] uppercase leading-4 tracking-[0.25em] text-white/35">
                  Vue interactive
                  <br />
                  avant / arrière
                </p>

                <p className="text-[8px] uppercase tracking-[0.3em] text-white/35">
                  001
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-surface pt-3 text-[8px] uppercase tracking-[0.3em] text-stone">
              <span>AJVEK</span>
              <span>{product.name}</span>
            </div>
          </div>

          {/* ===================================================
              PRODUCT INFOS
          ==================================================== */}

          <div className="flex min-w-0 flex-col lg:pt-4">
            {/* HEADER */}

            <div className="border-b border-surface pb-8">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                  Drop 001
                </p>

                <span className="text-[9px] uppercase tracking-[0.28em] text-stone">
                  {salesOpen ? "Disponible" : "Bientôt disponible"}
                </span>
              </div>

              <h1 className="mt-7 max-w-xl font-display text-[clamp(3.2rem,6vw,6.8rem)] leading-[0.82] tracking-[-0.055em]">
                {product.name}
              </h1>

              <div className="mt-8 flex items-end justify-between gap-5">
                <p className="font-display text-3xl tracking-[-0.03em] md:text-4xl">
                  {product.price}
                </p>

                <p className="max-w-[150px] text-right text-[8px] uppercase leading-4 tracking-[0.28em] text-stone">
                  Série limitée
                  <br />
                  Drop 001
                </p>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="grid gap-5 border-b border-surface py-7 sm:grid-cols-[90px_1fr]">
              <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                La pièce
              </p>

              <p className="max-w-xl text-sm leading-7 text-stone">
                {product.description}
              </p>
            </div>

            {/* =================================================
                COULEUR
            ================================================== */}

            <div className="border-b border-surface py-7">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                  01 — Couleur
                </p>

                <p className="text-[10px] uppercase tracking-[0.2em]">
                  {colorway.label}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {product.colorways.map((cw, index) => (
                  <button
                    key={cw.label}
                    type="button"
                    onClick={() => {
                      setColorIndex(index);
                      setSize(null);
                    }}
                    className={`group flex h-14 items-center justify-between border px-4 text-[9px] uppercase tracking-[0.25em] transition ${
                      index === colorIndex
                        ? "border-foreground bg-foreground text-background"
                        : "border-surface text-stone hover:border-stone/60 hover:text-foreground"
                    }`}
                  >
                    <span>{cw.label}</span>

                    <span
                      aria-hidden
                      className={`h-3 w-3 rounded-full border ${
                        index === colorIndex
                          ? "border-background/30"
                          : "border-stone/30"
                      }`}
                      style={{ backgroundColor: cw.color }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* =================================================
                TAILLE
            ================================================== */}

            <div className="border-b border-surface py-7">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                  02 — Taille
                </p>

                <span className="text-[9px] uppercase tracking-[0.2em] text-stone">
                  Coupe oversize
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map((s) => {
                  const stockItem = getStockForSize(s);

                  const soldOut =
                    salesOpen &&
                    stockItem?.sales_enabled === true &&
                    Number(stockItem.stock_quantity) <= 0;

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={stockLoading || stockError || soldOut}
                      onClick={() => setSize(s)}
                      className={`relative h-14 border text-[10px] uppercase tracking-[0.2em] transition ${
                        soldOut
                          ? "cursor-not-allowed border-surface text-stone/30 line-through"
                          : s === size
                            ? "border-foreground bg-foreground text-background"
                            : "border-surface text-stone hover:border-stone/60 hover:text-foreground"
                      } ${
                        stockLoading || stockError
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              <div className="min-h-8 pt-3">
                {stockLoading && (
                  <p className="text-[10px] leading-5 text-stone">
                    Chargement des disponibilités...
                  </p>
                )}

                {!stockLoading && stockError && (
                  <p className="text-[10px] leading-5 text-stone">
                    Disponibilités momentanément indisponibles.
                  </p>
                )}

                {!stockLoading && !stockError && !salesOpen && (
                  <p className="text-[10px] leading-5 text-stone">
                    Le premier stock AJVEK arrive bientôt.
                  </p>
                )}

                {!stockLoading && !stockError && salesOpen && !size && (
                  <p className="text-[10px] leading-5 text-stone">
                    Sélectionne une taille.
                  </p>
                )}
              </div>
            </div>

            {/* =================================================
                COMMANDE
            ================================================== */}

            <div className="py-8">
              <div className="mb-6 flex items-end justify-between gap-5">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                    Ta pièce
                  </p>

                  <p className="mt-2 font-display text-3xl tracking-[-0.03em]">
                    {product.price}
                  </p>
                </div>

                <p className="text-right text-[8px] uppercase leading-5 tracking-[0.28em] text-stone">
                  {colorway.label}
                  {size && (
                    <>
                      <br />
                      Taille {size}
                    </>
                  )}
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
                INFORMATIONS
            ================================================== */}

            <div className="border-t border-surface">
              <div className="grid grid-cols-2">
                <div className="border-b border-r border-surface py-5 pr-4">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Paiement
                  </p>

                  <p className="mt-3 text-xs leading-5">
                    Sécurisé via Stripe
                  </p>
                </div>

                <div className="border-b border-surface py-5 pl-4">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Retours
                  </p>

                  <p className="mt-3 text-xs leading-5">
                    14 jours après réception
                  </p>
                </div>

                <div className="border-r border-surface py-5 pr-4">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Fabrication
                  </p>

                  <p className="mt-3 text-xs leading-5">
                    Créé en France
                  </p>
                </div>

                <div className="py-5 pl-4">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Série
                  </p>

                  <p className="mt-3 text-xs leading-5">
                    Première série de 32 pièces
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DROP INFORMATION
      ====================================================== */}

      <section className="border-y border-surface">
        <div className="mx-auto grid max-w-[1500px] grid-cols-1 md:grid-cols-2">
          <div className="border-b border-surface px-5 py-12 md:border-b-0 md:border-r md:px-8 md:py-16">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
              Drop 001
            </p>

            <p className="mt-6 max-w-md font-display text-4xl leading-[0.95] tracking-[-0.04em] md:text-5xl">
              Une première série.
              <br />
              En quantité limitée.
            </p>

            <p className="mt-7 max-w-sm text-sm leading-7 text-stone">
              {salesOpen
                ? "Disponible dans la limite du stock."
                : "Le premier stock AJVEK arrive bientôt."}
            </p>
          </div>

          <div className="px-5 py-12 md:px-8 md:py-16">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
              Livraison
            </p>

            <p className="mt-6 max-w-md font-display text-3xl leading-[1] tracking-[-0.03em] md:text-4xl">
              De Bordeaux & Nice
              <br />
              jusqu&apos;à chez toi.
            </p>

            <p className="mt-7 max-w-md text-sm leading-7 text-stone">
              Mondial Relay 4,90 € · domicile 7,90 € · offerte dès
              3 vêtements.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL BRAND SECTION
      ====================================================== */}

      <section className="relative flex min-h-[55svh] items-center justify-center overflow-hidden px-6 py-24 text-center md:min-h-[65svh]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[30vw] leading-none text-foreground/[0.018]"
        >
          AJVEK
        </div>

        <div className="relative z-10">
          <p className="text-[8px] uppercase tracking-[0.5em] text-stone">
            AJVEK · DROP 001
          </p>

          <p className="mx-auto mt-8 max-w-3xl font-display text-5xl leading-[0.86] tracking-[-0.055em] md:text-7xl lg:text-8xl">
            Du dessin
            <br />
            à la pièce finale.
          </p>

          <div className="mx-auto mt-8 h-px w-12 bg-surface" />

          <p className="mx-auto mt-8 max-w-sm text-sm leading-7 text-stone">
            Une première série pensée autour du dessin et produite en
            quantité limitée.
          </p>
        </div>
      </section>
    </main>
  );
}