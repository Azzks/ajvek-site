import Link from "next/link";
import { PRODUCTS } from "@/lib/products";

const collectionPieces = [
  {
    number: "01",
    name: "Roses",
    slug: "roses",
    image: "/images/shooting/rose noir dos de biais.jpg",
    detailImage: "/images/shooting/rose noir dos proche.jpg",
    alt: "Tee-shirt AJVEK Roses noir porté de dos",
    colors: "Noir / Blanc",
  },
  {
    number: "02",
    name: "Cerisier",
    slug: "sakura",
    image: "/images/shooting/cerisier blanc dos de biais.jpg",
    detailImage: "/images/shooting/cerisier noir dos proche.jpg",
    alt: "Tee-shirt AJVEK Cerisier blanc porté de dos",
    colors: "Noir / Blanc",
  },
];

export default function CataloguePage() {
  const roses = PRODUCTS.find((product) => product.slug === "roses");
  const cerisier = PRODUCTS.find((product) => product.slug === "sakura");

  const defaultPrice =
    roses?.price ??
    cerisier?.price ??
    "39,90 €";

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-surface">
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

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[32vw] leading-none text-foreground/[0.018] md:text-[20vw]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-14 md:px-8 md:pb-24 md:pt-24">
          <div className="flex items-center justify-between">
            <p className="text-[8px] uppercase tracking-[0.42em] text-stone/60">
              AJVEK · 2026
            </p>

            <p className="text-[8px] uppercase tracking-[0.42em] text-stone/60">
              France
            </p>
          </div>

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
            ["02", "Dessins", "02"],
            ["03", "Prix", defaultPrice],
            ["04", "Série", "54 pièces"],
          ].map(([number, label, value], index) => (
            <div
              key={number}
              className={`px-5 py-6 md:px-7 md:py-8 ${
                index % 2 === 0 ? "border-r border-surface" : ""
              } ${
                index < 2
                  ? "border-b border-surface md:border-b-0"
                  : ""
              } ${index === 1 ? "md:border-r" : ""}`}
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
          INTRO COLLECTION
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
                son dessin.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-stone md:justify-self-end md:text-base">
              Roses ou Cerisier. Deux compositions pensées pour vivre sur le
              vêtement, disponibles en noir et en blanc.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          2 PIÈCES — SHOOTING RÉEL
      ====================================================== */}

      <section className="px-5 pb-24 md:px-8 md:pb-36">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 md:gap-5">
          {collectionPieces.map((piece) => (
            <Link
              key={piece.slug}
              href={`/produit/${piece.slug}`}
              className="group block"
            >
              <article>
                {/* PHOTO PRINCIPALE */}

                <div className="relative aspect-[4/5] overflow-hidden bg-[#171615]">
                  <img
                    src={piece.image}
                    alt={piece.alt}
                    className="absolute inset-0 h-full w-full object-cover transition duration-1000 ease-out group-hover:scale-[1.025]"
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

                  {/* NUMÉRO */}

                  <div className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/20 text-[8px] tracking-[0.2em] text-white/80 backdrop-blur-md md:left-7 md:top-7">
                    {piece.number}
                  </div>

                  {/* DROP */}

                  <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[7px] uppercase tracking-[0.3em] text-white/70 backdrop-blur-md md:right-7 md:top-7">
                    Drop 001
                  </div>

                  {/* BAS PHOTO */}

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
                    <div className="flex items-end justify-between gap-6">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.38em] text-white/60">
                          AJVEK
                        </p>

                        <p className="mt-2 font-display text-4xl text-white md:text-5xl">
                          {piece.name}
                        </p>
                      </div>

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-lg text-black transition duration-300 group-hover:translate-x-1 md:h-14 md:w-14">
                        →
                      </div>
                    </div>
                  </div>
                </div>

                {/* INFORMATIONS */}

                <div className="border-b border-surface py-6 md:py-7">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <p className="text-[8px] uppercase tracking-[0.34em] text-stone/55">
                        Coloris
                      </p>

                      <p className="mt-2 font-display text-xl">
                        {piece.colors}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[8px] uppercase tracking-[0.34em] text-stone/55">
                        Prix
                      </p>

                      <p className="mt-2 font-display text-xl">
                        {defaultPrice}
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex items-center justify-between border-t border-surface pt-5">
                    <p className="text-[8px] uppercase tracking-[0.32em] text-stone/50">
                      Disponible en XS · S · M · L
                    </p>

                    <p className="text-[8px] uppercase tracking-[0.32em] text-stone">
                      Découvrir →
                    </p>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* =====================================================
          PHOTO DUO
      ====================================================== */}

      <section className="border-y border-surface">
        <div className="relative min-h-[70svh] overflow-hidden md:min-h-[85svh]">
          <img
            src="/images/shooting/cerisier et rose blanc de dos.jpg"
            alt="AJVEK Roses et Cerisier blancs portés de dos"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />

          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-auto max-w-7xl px-5 pb-8 md:px-8 md:pb-14">
              <div className="grid gap-8 md:grid-cols-2 md:items-end">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.42em] text-white/60">
                    AJVEK · Drop 001
                  </p>

                  <h2 className="mt-5 max-w-3xl font-display text-5xl leading-[0.9] tracking-[-0.04em] text-white sm:text-6xl md:text-8xl">
                    Deux dessins.
                    <br />
                    Une identité.
                  </h2>
                </div>

                <div className="md:justify-self-end md:text-right">
                  <Link
                    href="/lookbook"
                    className="inline-flex items-center gap-8 border-b border-white/50 pb-2 text-[8px] uppercase tracking-[0.34em] text-white"
                  >
                    Voir le lookbook
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          DÉTAILS
      ====================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
          <div className="mb-12 md:mb-16">
            <p className="text-[9px] uppercase tracking-[0.42em] text-stone">
              02 — Détails
            </p>

            <h2 className="mt-6 max-w-4xl font-display text-5xl leading-[0.9] tracking-[-0.04em] sm:text-6xl md:text-8xl">
              Pensé de près.
              <br />
              <span className="text-stone">Porté de loin.</span>
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="relative aspect-[4/5] overflow-hidden bg-[#171615]">
                <img
                  src="/images/shooting/rose noir dos proche.jpg"
                  alt="Détail du motif Roses AJVEK noir"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.02]"
                />
              </div>

              <div className="flex items-center justify-between py-5">
                <p className="text-[8px] uppercase tracking-[0.32em] text-stone">
                  Roses
                </p>

                <p className="text-[8px] uppercase tracking-[0.32em] text-stone/50">
                  Détail
                </p>
              </div>
            </div>

            <div>
              <div className="relative aspect-[4/5] overflow-hidden bg-[#171615]">
                <img
                  src="/images/shooting/cerisier noir dos proche.jpg"
                  alt="Détail du motif Cerisier AJVEK noir"
                  className="absolute inset-0 h-full w-full object-cover transition duration-700 hover:scale-[1.02]"
                />
              </div>

              <div className="flex items-center justify-between py-5">
                <p className="text-[8px] uppercase tracking-[0.32em] text-stone">
                  Cerisier
                </p>

                <p className="text-[8px] uppercase tracking-[0.32em] text-stone/50">
                  Détail
                </p>
              </div>
            </div>
          </div>
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
            Deux dessins.
            <br />
            Noir ou blanc.
          </p>

          <p className="mt-8 font-display text-4xl">
            {defaultPrice}
          </p>

          <div className="mx-auto mt-10 flex max-w-xl items-center justify-center border-t border-surface pt-7">
            <Link
              href="/lookbook"
              className="text-[8px] uppercase tracking-[0.4em] text-stone transition hover:text-foreground"
            >
              Découvrir le lookbook →
            </Link>
          </div>

          <p className="mt-16 text-[8px] uppercase tracking-[0.5em] text-stone/35">
            AJVEK · FRANCE · 2026
          </p>
        </div>
      </section>
    </main>
  );
}