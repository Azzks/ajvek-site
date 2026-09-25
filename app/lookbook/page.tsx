import Link from "next/link";

export const metadata = {
  title: "Lookbook — AJVEK",
  description:
    "L'univers visuel AJVEK. Silhouettes, matières, détails et direction artistique du Drop 001.",
};

const DIRECTIONS = [
  {
    number: "01",
    title: "SILHOUETTE",
    text: "Des volumes larges, une présence simple et une attention portée au tombé du vêtement.",
  },
  {
    number: "02",
    title: "MATIÈRE",
    text: "Le textile, la broderie et l'impression deviennent des éléments à regarder de près.",
  },
  {
    number: "03",
    title: "MOUVEMENT",
    text: "Des images vivantes. Marcher, tourner, laisser le vêtement prendre sa place naturellement.",
  },
  {
    number: "04",
    title: "DÉTAIL",
    text: "AJK brodé, motifs au dos, col et finitions : les éléments qui construisent chaque pièce.",
  },
];

export default function LookbookPage() {
  return (
    <main className="overflow-hidden bg-background text-foreground">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-[72svh] overflow-hidden border-b border-surface px-5 md:px-8">
        {/* cercle décoratif principal */}

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70vw] w-[70vw] max-h-[700px] max-w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.06]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[48vw] w-[48vw] max-h-[470px] max-w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.04]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[22vw] w-[22vw] max-h-[210px] max-w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.018]"
        />

        <div className="relative z-10 mx-auto flex min-h-[72svh] max-w-7xl flex-col">
          <div className="flex items-center justify-between pt-8">
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
              AJVEK · 2026
            </p>

            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/60">
              Lookbook 001
            </p>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
            <p className="text-[9px] uppercase tracking-[0.5em] text-stone">
              Drop 001
            </p>

            <h1 className="mt-7 font-display text-[17vw] leading-[0.78] tracking-[-0.055em] sm:text-8xl md:text-[9rem]">
              LOOK
              <br />
              BOOK
            </h1>

            <p className="mx-auto mt-9 max-w-md text-[14px] leading-7 text-stone md:text-[15px]">
              L&apos;univers AJVEK au-delà du dessin.
              <br />
              Silhouette, matière et mouvement.
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-surface py-5">
            <p className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
              Roses / Cerisier
            </p>

            <p className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
              001
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRO
      ====================================================== */}

      <section className="border-b border-surface px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                01 — Direction
              </p>

              <h2 className="mt-7 font-display text-[3.5rem] leading-[0.88] tracking-[-0.04em] md:text-7xl">
                Porter
                <br />
                le dessin.
              </h2>
            </div>

            <div className="md:justify-self-end">
              <p className="max-w-md text-[15px] leading-7 text-stone">
                Une pièce AJVEK ne s&apos;arrête pas au motif.
                Sa coupe, son mouvement et la manière dont elle
                s&apos;intègre à une silhouette font partie du dessin.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          GRANDE COMPOSITION
      ====================================================== */}

      <section className="border-b border-surface">
        <div className="mx-auto grid max-w-7xl md:grid-cols-2">
          {/* GAUCHE */}

          <div className="relative flex min-h-[65svh] items-center justify-center overflow-hidden border-b border-surface md:min-h-[80vh] md:border-b-0 md:border-r">
            <div
              aria-hidden
              className="absolute h-[70vw] w-[70vw] max-h-[540px] max-w-[540px] rounded-full border border-foreground/[0.07]"
            />

            <div
              aria-hidden
              className="absolute h-[48vw] w-[48vw] max-h-[370px] max-w-[370px] rounded-full border border-foreground/[0.05]"
            />

            <div
              aria-hidden
              className="absolute h-[25vw] w-[25vw] max-h-[190px] max-w-[190px] rounded-full bg-foreground/[0.025]"
            />

            <div className="relative z-10 text-center">
              <p className="text-[8px] uppercase tracking-[0.45em] text-stone/50">
                AJVEK
              </p>

              <p className="mt-5 font-display text-5xl md:text-7xl">
                001
              </p>
            </div>

            <p className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.35em] text-stone/40">
              Form / Volume
            </p>
          </div>

          {/* DROITE */}

          <div className="flex min-h-[65svh] flex-col justify-between px-5 py-12 md:min-h-[80vh] md:px-12 md:py-16 lg:px-16">
            <div className="flex items-center justify-between">
              <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
                Direction 001
              </p>

              <span className="h-2 w-2 rounded-full bg-foreground" />
            </div>

            <div className="py-16">
              <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                L&apos;intention
              </p>

              <h2 className="mt-7 font-display text-[3.7rem] leading-[0.87] tracking-[-0.04em] md:text-7xl">
                SIMPLE.
                <br />
                BRUT.
                <br />
                VIVANT.
              </h2>

              <p className="mt-8 max-w-md text-[15px] leading-7 text-stone">
                Peu d&apos;éléments. Beaucoup d&apos;espace.
                Une lumière qui laisse apparaître la matière et
                une silhouette qui donne sa place au vêtement.
              </p>
            </div>

            <div className="border-t border-surface pt-5">
              <p className="text-[8px] uppercase tracking-[0.35em] text-stone/40">
                AJVEK · Visual Direction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          4 PRINCIPES
      ====================================================== */}

      <section className="border-b border-surface px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 md:mb-20">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
              02 — Image
            </p>

            <h2 className="mt-7 font-display text-5xl leading-[0.9] tracking-[-0.04em] md:text-7xl">
              Quatre
              <br />
              directions.
            </h2>
          </div>

          <div className="grid border-t border-surface md:grid-cols-2">
            {DIRECTIONS.map((direction, index) => (
              <article
                key={direction.number}
                className={`group relative min-h-[310px] overflow-hidden border-b border-surface px-1 py-9 md:min-h-[390px] md:p-10 ${
                  index % 2 === 0
                    ? "md:border-r"
                    : ""
                }`}
              >
                {/* cercle */}

                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-foreground/[0.05] transition-transform duration-700 group-hover:scale-110"
                />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[0.35em] text-stone/50">
                      {direction.number}
                    </p>

                    <div className="h-2 w-2 rounded-full border border-stone/50" />
                  </div>

                  <div className="mt-auto pt-24">
                    <h3 className="font-display text-4xl tracking-[-0.03em] md:text-5xl">
                      {direction.title}
                    </h3>

                    <p className="mt-5 max-w-sm text-sm leading-7 text-stone">
                      {direction.text}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SHOOTING À VENIR
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-surface px-5 py-24 md:px-8 md:py-36">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[15vw] top-1/2 h-[60vw] w-[60vw] max-h-[750px] max-w-[750px] -translate-y-1/2 rounded-full border border-foreground/[0.04]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute -right-[5vw] top-1/2 h-[38vw] w-[38vw] max-h-[470px] max-w-[470px] -translate-y-1/2 rounded-full border border-foreground/[0.035]"
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            03 — Prochainement
          </p>

          <h2 className="mt-8 max-w-4xl font-display text-[3.4rem] leading-[0.9] tracking-[-0.04em] md:text-8xl">
            LES PIÈCES
            <br />
            DEVANT
            <br />
            L&apos;OBJECTIF.
          </h2>

          <p className="mt-10 max-w-lg text-[15px] leading-7 text-stone">
            Le premier shooting viendra compléter cette page
            avec les pièces AJVEK portées, leurs détails et leur
            tombé réel.
          </p>

          <div className="mt-12 flex items-center gap-4">
            <span className="h-3 w-3 rounded-full border border-foreground/40" />

            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              Shooting 001 · À venir
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="relative flex min-h-[60svh] items-center overflow-hidden px-5 py-24 text-center md:px-8 md:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[65vw] w-[65vw] max-h-[650px] max-w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.04]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[42vw] w-[42vw] max-h-[420px] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/[0.035]"
        />

        <div className="relative z-10 mx-auto w-full max-w-3xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            Drop 001
          </p>

          <h2 className="mt-7 font-display text-[3.7rem] leading-[0.88] tracking-[-0.04em] md:text-8xl">
            ROSES
            <span className="text-stone"> / </span>
            <br className="sm:hidden" />
            CERISIER
          </h2>

          <p className="mx-auto mt-7 max-w-md text-[15px] leading-7 text-stone">
            Découvrir les deux premières pièces AJVEK.
          </p>

          <Link
            href="/catalogue"
            className="group mx-auto mt-9 flex w-full max-w-lg items-center justify-between rounded-full bg-foreground px-7 py-5 text-[9px] uppercase tracking-[0.3em] text-background transition-transform duration-500 hover:scale-[0.99]"
          >
            <span>Voir le Drop 001</span>

            <span className="text-lg transition-transform duration-500 group-hover:translate-x-2">
              →
            </span>
          </Link>

          <p className="mt-10 text-[8px] uppercase tracking-[0.4em] text-stone/35">
            AJVEK · LOOKBOOK 001 · 2026
          </p>
        </div>
      </section>
    </main>
  );
}