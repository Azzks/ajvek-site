"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { useCart } from "@/components/CartContext";
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
  const { addItem } = useCart();
  const router = useRouter();

  const initialColorIndex = product
    ? Math.min(Math.max(parseInt(colorParam ?? "0", 10) || 0, 0), product.colorways.length - 1)
    : 0;

  const [colorIndex, setColorIndex] = useState(initialColorIndex);
  const [size, setSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);

  if (!product) return notFound();

  const colorway = product.colorways[colorIndex];

  function handleAddToCart() {
    if (!size) {
      setSizeError(true);
      return;
    }
    addItem({
      id: `${product!.slug}-${colorway.label}-${size}`,
      slug: product!.slug,
      name: product!.name,
      colorLabel: colorway.label,
      size,
      price: product!.priceValue,
    });
    router.push("/panier");
  }

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-2">
        <ProductViewer3D colorway={colorway} />
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-xl uppercase tracking-[0.3em] text-foreground">{product.name}</h1>
            <p className="mt-2 text-sm text-stone">{product.price}</p>
          </div>
          <p className="text-sm text-stone">{product.description}</p>

          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-stone">Couleur</p>
            <div className="flex gap-2">
              {product.colorways.map((cw, i) => (
                <button
                  key={cw.label}
                  onClick={() => setColorIndex(i)}
                  className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest ${
                    i === colorIndex ? "border-foreground text-foreground" : "border-stone/40 text-stone"
                  }`}
                >
                  {cw.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-stone">Taille</p>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setSizeError(false);
                  }}
                  className={`h-9 w-9 rounded-full border text-xs ${
                    s === size ? "border-foreground text-foreground" : "border-stone/40 text-stone"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeError && <p className="mt-2 text-xs text-stone">Choisis une taille avant d&apos;ajouter au panier.</p>}
          </div>

          <button
            onClick={handleAddToCart}
            className="mt-4 rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
          >
            Ajouter au panier
          </button>
          <PreorderForm product={product} colorway={colorway} size={size} />
        </div>
      </div>
    </div>
  );
}