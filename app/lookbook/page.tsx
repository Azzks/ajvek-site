import Image from "next/image";
import Link from "next/link";

const photos = {
  duo: "/images/shooting/cerisier et rose blanc de dos.jpg",

  roseWide: "/images/shooting/rose noir dos de biais.jpg",
  roseDetail: "/images/shooting/rose noir dos proche.jpg",

  cerisierWhiteWide:
    "/images/shooting/cerisier blanc dos de biais.jpg",
  cerisierWhiteDetail:
    "/images/shooting/cerisier blanc dos proche.jpg",

  cerisierBlackWide:
    "/images/shooting/cerisier noir dos de biais.jpg",
  cerisierBlackDetail:
    "/images/shooting/cerisier noir dos proche.jpg",

  embroideryBlack:
    "/images/shooting/AJK blanc sur noir proche.jpg",
  embroideryWhite:
    "/images/shooting/AJK en noir sur blanc proche.jpg",
};

export default function LookbookPage() {
  return (
    <main className="overflow-hidden bg-[#0d0d0c] text-[#f3f0ea]">
      {/* =====================================================
          INTRO
      ====================================================== */}

      <section className="px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <p className="text-[7px] uppercase tracking-[0.5em] text-[#8a8178] md:text-[8px]">
              AJVEK · 2026
            </p>

            <p className="text-[7px] uppercase tracking-[0.5em] text-[#8a8178] md:text-[8px]">
              Lookbook 001
            </p>
          </div>

          <div className="mt-20 md:mt-28">
            <p className="text-[8px] uppercase tracking-[0.5em] text-[#8a8178]">
              Roses / Cerisier
            </p>

            <h1 className="mt-6 font-display text-[17vw] leading-[0.72] tracking-[-0.055em] sm:text-[8rem] md:text-[10rem] lg:text-[12rem]">
              LOOK
              <br />
              BOOK.
            </h1>
          </div>

          <div className="mt-16 grid gap-8 border-t border-white/[0.08] pt-7 md:grid-cols-2 md:items-end">
            <p className="max-w-lg text-sm leading-7 text-[#8a8178] md:text-base">
              Le premier chapitre AJVEK porté.
              <br />
              Deux dessins. Deux coloris.
              <br />
              Une même identité.
            </p>

            <p className="text-[8px] uppercase leading-6 tracking-[0.4em] text-[#6f6861] md:text-right">
              Drop 001
              <br />
              France · 2026
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          HERO SHOOTING
      ====================================================== */}

      <section>
        <div className="relative h-[72svh] min-h-[540px] overflow-hidden md:h-[88svh] md:min-h-[760px]">
          <Image
            src={photos.duo}
            alt="AJVEK Roses et Cerisier blancs portés de dos"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />

          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-auto flex max-w-7xl items-end justify-between gap-8 px-5 pb-7 md:px-8 md:pb-12">
              <div>
                <p className="text-[7px] uppercase tracking-[0.45em] text-white/55 md:text-[8px]">
                  01 — Drop 001
                </p>

                <h2 className="mt-4 font-display text-5xl tracking-[-0.04em] text-white md:text-7xl">
                  Ensemble.
                </h2>
              </div>

              <p className="hidden text-right text-[8px] uppercase leading-6 tracking-[0.38em] text-white/55 sm:block">
                Roses
                <br />
                Cerisier
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          ROSES
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
          <div className="mb-12 grid gap-8 md:mb-16 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-[8px] uppercase tracking-[0.45em] text-[#8a8178]">
                02 — Roses
              </p>

              <h2 className="mt-6 font-display text-6xl leading-[0.85] tracking-[-0.045em] md:text-8xl">
                ROSES.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-[#8a8178] md:justify-self-end">
              Une composition verticale qui accompagne le dos et transforme la
              silhouette.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.35fr_0.65fr]">
            <div>
              <div className="relative min-h-[620px] overflow-hidden bg-[#151413] md:min-h-[850px]">
                <Image
                  src={photos.roseWide}
                  alt="AJVEK Roses noir porté"
                  fill
                  sizes="(max-width: 768px) 100vw, 67vw"
                  className="object-cover object-center"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                <p className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.4em] text-white/65 md:bottom-8 md:left-8">
                  Roses · Noir
                </p>
              </div>
            </div>

            <div>
              <div className="relative min-h-[480px] overflow-hidden bg-[#151413] md:min-h-[850px]">
                <Image
                  src={photos.roseDetail}
                  alt="Détail du motif Roses AJVEK"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-center"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                <p className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.4em] text-white/65 md:bottom-8 md:left-8">
                  Le dessin · Détail
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Link
              href="/produit/roses"
              className="group inline-flex items-center gap-8 border-b border-[#8a8178] pb-2 text-[8px] uppercase tracking-[0.35em]"
            >
              Découvrir Roses

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          BRODERIE
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#151413] md:aspect-auto md:min-h-[800px]">
            <Image
              src={photos.embroideryBlack}
              alt="Broderie AJVEK blanche sur tee-shirt noir"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

            <p className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.4em] text-white/65 md:bottom-8 md:left-8">
              Noir · Broderie
            </p>
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-[#d6d2cb] md:aspect-auto md:min-h-[800px]">
            <Image
              src={photos.embroideryWhite}
              alt="Broderie AJVEK noire sur tee-shirt blanc"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

            <p className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.4em] text-white/75 md:bottom-8 md:left-8">
              Blanc · Broderie
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="grid gap-8 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-[8px] uppercase tracking-[0.45em] text-[#8a8178]">
                03 — Signature
              </p>

              <h2 className="mt-6 font-display text-5xl leading-[0.9] tracking-[-0.04em] md:text-7xl">
                Devant,
                <br />
                l&apos;essentiel.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-7 text-[#8a8178] md:justify-self-end">
              Une broderie discrète sur la poitrine. Le dessin principal prend
              place dans le dos.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          CERISIER BLANC
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-36">
          <div className="mb-12 md:mb-16">
            <p className="text-[8px] uppercase tracking-[0.45em] text-[#8a8178]">
              04 — Cerisier
            </p>

            <h2 className="mt-6 max-w-5xl font-display text-6xl leading-[0.85] tracking-[-0.045em] md:text-8xl">
              CERISIER.
              <br />
              <span className="italic text-[#8a8178]">Blanc.</span>
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-[0.7fr_1.3fr]">
            <div className="relative min-h-[500px] overflow-hidden bg-[#151413] md:min-h-[820px]">
              <Image
                src={photos.cerisierWhiteDetail}
                alt="Détail du Cerisier blanc AJVEK"
                fill
                sizes="(max-width: 768px) 100vw, 35vw"
                className="object-cover object-center"
              />

              <p className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.4em] text-white/70 md:bottom-8 md:left-8">
                Détail
              </p>
            </div>

            <div className="relative min-h-[620px] overflow-hidden bg-[#151413] md:min-h-[820px]">
              <Image
                src={photos.cerisierWhiteWide}
                alt="AJVEK Cerisier blanc porté"
                fill
                sizes="(max-width: 768px) 100vw, 65vw"
                className="object-cover object-center"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              <p className="absolute bottom-6 left-6 text-[8px] uppercase tracking-[0.4em] text-white/70 md:bottom-8 md:left-8">
                Cerisier · Blanc
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CERISIER NOIR — FULL BLEED
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="relative h-[80svh] min-h-[620px] overflow-hidden md:h-[95svh] md:min-h-[800px]">
          <Image
            src={photos.cerisierBlackWide}
            alt="AJVEK Cerisier noir porté"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-black/5 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />

          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-7xl px-5 pb-8 md:px-8 md:pb-14">
              <p className="text-[8px] uppercase tracking-[0.45em] text-white/55">
                05 — Cerisier / Noir
              </p>

              <h2 className="mt-5 max-w-4xl font-display text-6xl leading-[0.85] tracking-[-0.045em] text-white md:text-9xl">
                La nuit
                <br />
                révèle le dessin.
              </h2>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 py-5 md:px-8 md:py-8">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <p className="max-w-lg text-sm leading-7 text-[#8a8178]">
              Noir profond, motif floral et contraste graphique.
            </p>

            <Link
              href="/produit/sakura"
              className="group inline-flex w-fit items-center gap-8 border-b border-[#8a8178] pb-2 text-[8px] uppercase tracking-[0.35em]"
            >
              Découvrir Cerisier

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          CERISIER NOIR DETAIL
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:grid-cols-2 md:items-center md:px-8 md:py-36">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#151413]">
            <Image
              src={photos.cerisierBlackDetail}
              alt="Détail du motif Cerisier noir AJVEK"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          <div className="md:px-10 lg:px-16">
            <p className="text-[8px] uppercase tracking-[0.45em] text-[#8a8178]">
              06 — Détail
            </p>

            <h2 className="mt-7 font-display text-5xl leading-[0.9] tracking-[-0.04em] md:text-7xl">
              Le dessin
              <br />
              prend corps.
            </h2>

            <p className="mt-8 max-w-md text-sm leading-7 text-[#8a8178]">
              Les lignes, les fleurs et la typographie construisent une
              composition pensée pour le dos du vêtement.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL
      ====================================================== */}

      <section className="px-5 py-24 text-center md:px-8 md:py-36">
        <div className="mx-auto max-w-5xl">
          <p className="text-[8px] uppercase tracking-[0.5em] text-[#8a8178]">
            Lookbook 001
          </p>

          <h2 className="mt-8 font-display text-6xl leading-[0.85] tracking-[-0.05em] sm:text-7xl md:text-9xl">
            ROSES.
            <br />
            <span className="italic text-[#8a8178]">
              CERISIER.
            </span>
          </h2>

          <p className="mx-auto mt-9 max-w-md text-sm leading-7 text-[#8a8178]">
            Le premier chapitre AJVEK.
          </p>

          <Link
            href="/catalogue"
            className="group mx-auto mt-12 inline-flex min-h-14 items-center gap-12 rounded-full bg-[#f3f0ea] px-8 text-[8px] font-semibold uppercase tracking-[0.3em] text-[#0d0d0c]"
          >
            Voir le Drop 001

            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

          <p className="mt-20 text-[7px] uppercase tracking-[0.5em] text-[#57514c]">
            AJVEK · France · 2026
          </p>
        </div>
      </section>
    </main>
  );
}