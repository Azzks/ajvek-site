import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export default function CataloguePage() {
  const tiles = PRODUCTS.flatMap((product) =>
    product.colorways.map((colorway, index) => ({
      key: `${product.slug}-${colorway.label}`,
      href: `/produit/${product.slug}?c=${index}`,
      name: product.name,
      color: colorway.label,
      price: product.price,
      image: `/catalogue/${product.slug}-${colorway.label.toLowerCase()}.png`,
    }))
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HEADER */}
      <section className="px-6 pb-10 pt-20 text-center md:pb-16 md:pt-28">
        <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
          AJVEK
        </p>

        <h1 className="mt-4 font-display text-4xl leading-none md:text-6xl">
          Collection actuelle
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-stone md:text-base">
          Des pièces pensées autour du dessin, du végétal et d&apos;une identité
          graphique propre à AJVEK.
        </p>

        <div className="mx-auto mt-8 h-px w-16 bg-stone/30" />
      </section>

      {/* PRODUITS */}
      <section className="px-4 pb-24 md:px-8 md:pb-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.key}
              href={tile.href}
              className="group block"
            >
              <article>
                {/* IMAGE */}
                <div className="relative aspect-[4/5] overflow-hidden bg-[#111110]">
                  <img
                    src={tile.image}
                    alt={`${tile.name} ${tile.color}`}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-70" />

                  {/* BADGE */}
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[9px] uppercase tracking-[0.25em] text-white/70 backdrop-blur-sm">
                      Précommande
                    </span>
                  </div>

                  {/* CTA HOVER */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="flex items-center justify-between border-t border-white/15 pt-3 text-[10px] uppercase tracking-[0.25em] text-white">
                      <span>Découvrir</span>
                      <span>→</span>
                    </div>
                  </div>
                </div>

                {/* INFOS */}
                <div className="mt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-foreground">
                        {tile.name}
                      </p>

                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-stone">
                        {tile.color}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs text-stone">
                      {tile.price}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-surface pt-3">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-stone">
                      AJVEK
                    </span>

                    <span className="text-[10px] uppercase tracking-[0.25em] text-stone">
                      Made in France
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="border-t border-surface px-6 py-20 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
          AJVEK
        </p>

        <h2 className="mt-4 font-display text-3xl leading-tight md:text-5xl">
          Une collection.
          <br />
          Plusieurs interprétations.
        </h2>

        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-stone">
          Chaque coloris conserve la même identité tout en donnant au design
          une présence différente.
        </p>
      </section>
    </main>
  );
}