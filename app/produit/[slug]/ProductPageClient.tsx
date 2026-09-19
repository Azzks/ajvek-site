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

  if (!product) return notFound();

  const colorway = product.colorways[colorIndex];

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-2">
        <ProductViewer3D colorway={colorway} />

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl uppercase tracking-[0.3em] text-foreground">
              {product.name}
            </h1>

            <p className="mt-2 text-sm text-stone">{product.price}</p>
          </div>

          <p className="text-sm text-stone">{product.description}</p>

          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-stone">
              Couleur
            </p>

            <div className="flex gap-2">
              {product.colorways.map((cw, i) => (
                <button
                  key={cw.label}
                  type="button"
                  onClick={() => setColorIndex(i)}
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest ${
                    i === colorIndex
                      ? "border-foreground text-foreground"
                      : "border-stone/40 text-stone"
                  }`}
                >
                  {cw.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-stone">
              Taille
            </p>

            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`h-10 w-10 rounded-full border text-xs uppercase tracking-widest ${
                    s === size
                      ? "border-foreground text-foreground"
                      : "border-stone/40 text-stone"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1 text-[11px] text-stone">
            <p>✓ Paiement sécurisé par carte bancaire avec Stripe</p>

            <p>
              ✓ Production lancée à partir de 10 vêtements précommandés et payés
            </p>

            <p>
              ✓ Livraison : Mondial Relay 4,90 € ou domicile 7,90 € · offerte dès
              3 vêtements
            </p>

            <p>✓ Retours possibles sous 14 jours après réception</p>
          </div>

          <PreorderForm
            product={product}
            colorway={colorway}
            size={size}
          />
        </div>
      </div>
    </div>
  );
}