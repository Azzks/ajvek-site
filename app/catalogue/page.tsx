import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

export default function CataloguePage() {
  const tiles = PRODUCTS.flatMap((product) =>
    product.colorways.map((colorway, index) => {
      const productName =
        product.slug === "sakura" ? "cerisier" : product.slug;

      const colorName =
        colorway.label.toLowerCase() === "noir" ? "black" : "white";

      return {
        key: `${product.slug}-${colorway.label}`,
        href: `/produit/${product.slug}?c=${index}`,
        slug: product.slug,
        name: product.name,
        color: colorway.label,
        price: product.price,
        image: `/images/drop-001/${productName}-${colorName}.jpg`,
        colorIndex: index,
      };
    })
  );

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-surface">
        {/* GRILLE */}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "25% 100%",
          }}
        />

        {/* DROP FANTÔME */}

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[32vw] leading-none text-foreground/[0.018] md:text-[20vw]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-24">
          {/* TOP */}

          <div className="flex items-center justify-between">
            <p className="text-[8px] uppercase tracking-[0.42em] text-stone/60">
              AJVEK · 2026
            </p>

            <p className="text-[8px] uppercase tracking-[0.42em] text-stone/60">
              France
            </p>
          </div>

          {/* TITLE */}

          <div className="mt-20 md:mt-28">
            <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
              Première collection
            </p>

            <h1 className="mt-6 font-display text-[18vw] leading-[0.78] tracking-[-0.055em] sm:text-8xl md:text-[9rem] lg:text-[11rem]">
              DROP
              <br />
              001.
            </h1>
          </div>

          {/* BOTTOM */}

          <div className="mt-14 grid gap-8 border-t border-surface pt-7 md:mt-20 md:grid-cols-2 md:items-end">
            <p className="max-w-xl text-[15px] leading-7 text-stone md:text-base">
              Deux dessins.
              <br />
              Deux interprétations du végétal.
              <br />
              Le premier chapitre AJVEK.
            </p>

            <div className="md:text-right">
              <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
                Collection
              </p>

              <p className="mt-3 font-display text-2xl">
                ROSES / CERISIER
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          COLLECTION INFO
      ====================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
          {[
            ["01", "Drop", "001"],
            ["02", "Pièces", "02"],
            ["03", "Prix", "39,90 €"],
            ["04", "Statut", "Bientôt disponible"],
          ].map(([number, label, value], index) => (
            <div
              key={number}
              className={`px-5 py-6 md:px-7 md:py-8 ${
                index % 2 === 0 ? "border-r border-surface" : ""
              } ${
                index < 2
                  ? "border-b border-surface md:border-b-0"
                  : ""
              } ${
                index === 1
                  ? "md:border-r"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[8px] tracking-[0.3em] text-stone/35">
                  {number}
                </p>

                <p className="text-[8px] uppercase tracking-[0.3em] text-stone/50">
                  {label}
                </p>
              </div>

              <p className="mt-8 font-display text-xl md:text-2xl">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
          PRODUCTS TITLE
      ====================================================== */}

      <section className="px-5 pb-12 pt-20 md:px-8 md:pb-16 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-[9px] uppercase tracking-[0.42em] text-stone">
                01 — Collection
              </p>

              <h2 className="mt-6 font-display text-5xl leading-[0.88] tracking-[-0.04em] md:text-7xl">
                Choisir
                <br />
                sa pièce.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-stone md:justify-self-end md:text-base">
              Chaque design est disponible dans plusieurs interprétations.
              Choisis la pièce, le coloris et la taille qui te correspondent.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}

      <section className="px-4 pb-24 md:px-8 md:pb-36">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((tile, index) => (
            <Link
              key={tile.key}
              href={tile.href}
              className="group block"
            >
              <article>
                {/* IMAGE */}

                <div className="relative aspect-[4/5] overflow-hidden bg-[#d0cfcb]">
                  <img
                    src={tile.image}
                    alt={`${tile.name} ${tile.color}`}
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
                  />

                  {/* OVERLAY */}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/5" />

                  {/* NUMBER */}

                  <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-[8px] tracking-[0.2em] text-white/70 backdrop-blur-md">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* STATUS */}

                  <div className="absolute right-4 top-4">
                    <span className="rounded-full border border-white/15 bg-black/20 px-3 py-2 text-[7px] uppercase tracking-[0.28em] text-white/70 backdrop-blur-md">
                      Bientôt disponible
                    </span>
                  </div>

                  {/* IMAGE BOTTOM */}

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[7px] uppercase tracking-[0.35em] text-white/50">
                          AJVEK
                        </p>

                        <p className="mt-1 text-[8px] uppercase tracking-[0.32em] text-white/80">
                          Drop 001
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg text-black transition duration-300 group-hover:scale-105">
                        →
                      </div>
                    </div>
                  </div>
                </div>

                {/* INFORMATION */}

                <div className="pt-5">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="font-display text-2xl leading-none">
                        {tile.name}
                      </p>

                      <p className="mt-2 text-[9px] uppercase tracking-[0.28em] text-stone">
                        {tile.color}
                      </p>
                    </div>

                    <p className="font-display text-xl">
                      {tile.price}
                    </p>
                  </div>

                  {/* DIVIDER */}

                  <div className="mt-5 border-t border-surface pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[8px] uppercase tracking-[0.3em] text-stone/55">
                        AJVEK {tile.slug === "roses" ? "001" : "002"}
                      </p>

                      <div className="flex items-center gap-3">
                        <span className="text-[8px] uppercase tracking-[0.3em] text-stone">
                          Découvrir
                        </span>

                        <span className="text-xs transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          EDITORIAL
      ====================================================== */}

      <section className="relative overflow-hidden border-y border-surface px-5 py-24 md:px-8 md:py-36">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 top-1/2 -translate-y-1/2 font-display text-[70vw] leading-none text-foreground/[0.018] md:right-0 md:text-[30vw]"
        >
          A
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            02 — AJVEK
          </p>

          <h2 className="mt-10 max-w-5xl font-display text-[3.2rem] leading-[0.93] tracking-[-0.04em] sm:text-6xl md:text-8xl">
            Pas quatre
            <br />
            produits.
            <br />

            <span className="text-stone">
              Deux dessins,
              <br />
              plusieurs lectures.
            </span>
          </h2>

          <p className="mt-10 max-w-lg text-[15px] leading-7 text-stone">
            Le coloris change. La composition reste. Chaque variation
            conserve le langage graphique du dessin original.
          </p>
        </div>
      </section>

      {/* =====================================================
          WHY AJVEK
      ====================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Le dessin",
                text: "Chaque pièce commence par une recherche graphique construite progressivement.",
              },
              {
                number: "02",
                title: "Le vêtement",
                text: "Le dessin est pensé selon sa position, son échelle et sa présence sur la pièce.",
              },
              {
                number: "03",
                title: "La série",
                text: "Une première production courte pensée pour le lancement du Drop 001.",
              },
            ].map((item, index) => (
              <div
                key={item.number}
                className={`px-5 py-12 md:px-8 md:py-16 ${
                  index < 2
                    ? "border-b border-surface md:border-b-0 md:border-r"
                    : ""
                }`}
              >
                <p className="text-[8px] tracking-[0.4em] text-stone/45">
                  {item.number}
                </p>

                <h3 className="mt-12 font-display text-3xl">
                  {item.title}
                </h3>

                <p className="mt-5 max-w-sm text-sm leading-7 text-stone">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}

      <section className="relative flex min-h-[65svh] items-center overflow-hidden px-5 py-24 text-center md:px-8 md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[26vw] leading-none text-foreground/[0.02]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto w-full max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Drop 001
          </p>

          <h2 className="mt-8 font-display text-[3.7rem] leading-[0.88] tracking-[-0.045em] sm:text-7xl md:text-8xl">
            ROSES
            <span className="text-stone"> / </span>
            <br className="sm:hidden" />
            CERISIER
          </h2>

          <p className="mx-auto mt-8 max-w-md text-[15px] leading-7 text-stone">
            Le premier chapitre AJVEK.
            <br />
            Bientôt disponible.
          </p>

          <p className="mt-8 font-display text-4xl">
            39,90 €
          </p>

          <div className="mx-auto mt-10 flex max-w-xl items-center justify-center border-t border-surface pt-7">
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              Choisis une pièce ci-dessus
            </p>
          </div>

          <p className="mt-16 text-[8px] uppercase tracking-[0.5em] text-stone/35">
            AJVEK · FRANCE · 2026
          </p>
        </div>
      </section>
    </main>
  );
}