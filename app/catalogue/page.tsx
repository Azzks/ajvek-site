import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import ProductViewer3D from "@/components/ProductViewer3D";

export default function CataloguePage() {
  const tiles = PRODUCTS.flatMap((product) =>
    product.colorways.map((colorway, index) => ({
      key: `${product.slug}-${colorway.label}`,
      href: `/produit/${product.slug}?c=${index}`,
      name: `${product.name} · ${colorway.label}`,
      price: product.price,
      colorway,
    }))
  );

  return (
    <div className="min-h-screen bg-background px-6 py-12">
      <h1 className="mb-8 text-center text-xl uppercase tracking-[0.3em] text-foreground">Catalogue</h1>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.key} className="flex flex-col items-center gap-3">
            <ProductViewer3D colorway={tile.colorway} />
            <Link
              href={tile.href}
              className="flex flex-col items-center gap-1 text-center transition hover:text-foreground"
            >
              <p className="text-xs uppercase tracking-widest text-foreground">{tile.name}</p>
              <p className="text-xs text-stone">{tile.price}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}