import Image from "next/image";
import Link from "next/link";

const products = [
  {
    name: "Roses",
    slug: "roses",
    image: "/images/drop-001/roses-black.jpg",
    imageAlt: "Tee-shirt AJVEK Roses noir, vue avant et arrière",
    color: "Noir",
  },
  {
    name: "Cerisier",
    slug: "sakura",
    image: "/images/drop-001/cerisier-white.jpg",
    imageAlt: "Tee-shirt AJVEK Cerisier blanc, vue avant et arrière",
    color: "Blanc",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#0d0d0c] text-[#f3f0ea]">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative border-b border-white/[0.08]">
        <div className="mx-auto grid min-h-[calc(100svh-180px)] max-w-[1600px] lg:grid-cols-[0.82fr_1.18fr]">
          {/* TEXTE */}

          <div className="relative flex flex-col justify-between border-white/[0.08] px-6 py-10 sm:px-10 lg:border-r lg:px-14 lg:py-14 xl:px-20">
            <div className="flex items-center justify-between gap-6">
              <p className="text-[9px] uppercase tracking-[0.34em] text-[#8a8178]">
                Drop 001 · 2026
              </p>

              <p className="text-[9px] uppercase tracking-[0.34em] text-[#8a8178]">
                Créé en France
              </p>
            </div>

            <div className="my-20 max-w-xl lg:my-12">
              <p className="mb-5 text-[10px] uppercase tracking-[0.36em] text-[#b3a48c]">
                Roses / Cerisier
              </p>

              <h1 className="font-display text-[clamp(4rem,9vw,9rem)] font-normal leading-[0.72] tracking-[-0.06em]">
                Le dessin
                <br />
                <span className="italic">prend corps.</span>
              </h1>

              <p className="mt-10 max-w-md text-sm leading-7 text-[#aaa29a] sm:text-[15px]">
                Deux dessins. Deux interprétations.
                <br />
                Le premier chapitre AJVEK.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                <Link
                  href="/catalogue"
                  className="group inline-flex min-h-14 items-center gap-12 rounded-full bg-[#f3f0ea] px-7 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#0d0d0c] transition hover:bg-white"
                >
                  Découvrir le Drop 001

                  <span
                    aria-hidden
                    className="text-base transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>

                <p className="font-display text-2xl">39,90 €</p>
              </div>
            </div>

            <div className="flex items-end justify-between gap-8 border-t border-white/[0.08] pt-6">
              <p className="max-w-[260px] text-[9px] uppercase leading-5 tracking-[0.25em] text-[#716a63]">
                Deux créations disponibles en noir et blanc.
              </p>

              <span className="hidden text-[9px] uppercase tracking-[0.3em] text-[#716a63] sm:block">
                AJVEK / 001
              </span>
            </div>
          </div>

          {/* IMAGE PRINCIPALE */}

          <Link
            href="/produit/roses"
            className="group relative block min-h-[560px] overflow-hidden bg-[#d5d1ca] lg:min-h-0"
          >
            <Image
              src="/images/drop-001/roses-white.jpg"
              alt="Tee-shirt AJVEK Roses blanc, vue avant et arrière"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            />

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/15 to-transparent px-6 pb-7 pt-28 sm:px-10">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-white/60">
                  Drop 001
                </p>

                <p className="mt-2 font-display text-3xl text-white sm:text-4xl">
                  Roses
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-lg text-white backdrop-blur-sm transition group-hover:bg-white group-hover:text-black">
                →
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* =====================================================
          INTRO COLLECTION
      ====================================================== */}

      <section id="collection" className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1600px] px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
          <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr]">
            <p className="text-[9px] uppercase tracking-[0.34em] text-[#8a8178]">
              Les premières pièces
            </p>

            <div>
              <h2 className="max-w-4xl font-display text-5xl leading-[0.95] tracking-[-0.035em] sm:text-6xl lg:text-7xl xl:text-8xl">
                Deux dessins construisent
                <br className="hidden md:block" /> le premier chapitre.
              </h2>

              <p className="mt-8 max-w-xl text-sm leading-7 text-[#8f8881]">
                Roses et Cerisier explorent deux expressions différentes
                d&apos;AJVEK, réunies dans un même Drop 001.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUITS
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
          {products.map((product, index) => (
            <article
              key={product.name}
              className={
                index === 0
                  ? "border-b border-white/[0.08] lg:border-b-0 lg:border-r"
                  : ""
              }
            >
              <Link href={`/produit/${product.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#d6d2cb]">
                  <Image
                    src={product.image}
                    alt={product.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />

                  <div className="absolute left-5 top-5 rounded-full border border-black/15 bg-white/75 px-4 py-2 text-[8px] uppercase tracking-[0.28em] text-black backdrop-blur-md sm:left-8 sm:top-8">
                    Drop 001
                  </div>
                </div>

                <div className="flex items-start justify-between gap-6 px-6 py-7 sm:px-10 sm:py-9 lg:px-12">
                  <div>
                    <h3 className="font-display text-4xl tracking-[-0.03em] sm:text-5xl">
                      {product.name}
                    </h3>

                    <p className="mt-3 text-[9px] uppercase tracking-[0.28em] text-[#8a8178]">
                      Noir / Blanc
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-display text-2xl">39,90 €</p>

                    <p className="mt-3 text-[8px] uppercase tracking-[0.25em] text-[#8a8178]">
                      Voir la pièce →
                    </p>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          MANIFESTE COURT
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
          <div className="relative min-h-[560px] overflow-hidden bg-[#d5d1ca] sm:min-h-[700px]">
            <Image
              src="/images/drop-001/cerisier-black.jpg"
              alt="Tee-shirt AJVEK Cerisier noir"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-center px-6 py-20 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
            <p className="text-[9px] uppercase tracking-[0.34em] text-[#8a8178]">
              AJVEK / Détail
            </p>

            <h2 className="mt-8 max-w-xl font-display text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Le vêtement comme support du dessin.
            </h2>

            <p className="mt-8 max-w-md text-sm leading-7 text-[#918a82]">
              Chaque pièce part d&apos;une composition graphique pensée pour
              exister sur le vêtement, devant comme derrière.
            </p>

            <Link
              href="/notre-histoire"
              className="mt-10 inline-flex w-fit items-center gap-8 border-b border-[#8a8178] pb-2 text-[9px] uppercase tracking-[0.3em]"
            >
              Notre histoire
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================================
          PROCESSUS — 5 ÉTAPES
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1600px] py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
          <div className="mb-10 flex items-end justify-between gap-10 px-6 sm:mb-14 sm:px-0">
            <div>
              <p className="text-[9px] uppercase tracking-[0.34em] text-[#8a8178]">
                Du dessin au vêtement
              </p>

              <h2 className="mt-5 font-display text-5xl tracking-[-0.04em] sm:text-6xl">
                Le processus.
              </h2>
            </div>

            <p className="hidden max-w-sm text-right text-xs leading-6 text-[#817a73] md:block">
              Une identité construite par le dessin, les détails et leur
              passage au textile.
            </p>
          </div>

          {/* Indication mobile */}
          <div className="mb-5 flex items-center justify-between px-6 sm:hidden">
            <p className="text-[8px] uppercase tracking-[0.28em] text-[#6f6962]">
              5 étapes
            </p>

            <p className="flex items-center gap-3 text-[8px] uppercase tracking-[0.28em] text-[#8a8178]">
              Glisser
              <span aria-hidden className="text-sm">
                →
              </span>
            </p>
          </div>

          {/* MOBILE : swipe horizontal
              DESKTOP : grille actuelle */}
          <div className="flex snap-x snap-mandatory gap-px overflow-x-auto bg-white/[0.08] pl-6 pr-[12vw] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-5">
            <ProcessImage
              src="/process/01-roses.jpg"
              number="01"
              label="Esquisses"
            />

            <ProcessImage
              src="/process/02-feuilles.jpg"
              number="02"
              label="Éléments"
            />

            <ProcessImage
              src="/process/03-lettres.jpg"
              number="03"
              label="Typographie"
            />

            <ProcessImage
              src="/process/04-ajvek-floral.jpg"
              number="04"
              label="Composition"
            />

            <ProcessImage
              src="/process/05-tee-shirt-tablette.jpg"
              number="05"
              label="Vêtement"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          FIN
      ====================================================== */}

      <section>
        <div className="mx-auto max-w-[1600px] px-6 py-24 text-center sm:px-10 lg:py-36">
          <p className="text-[9px] uppercase tracking-[0.36em] text-[#8a8178]">
            AJVEK · Drop 001
          </p>

          <h2 className="mx-auto mt-7 max-w-5xl font-display text-6xl leading-[0.86] tracking-[-0.055em] sm:text-7xl lg:text-9xl">
            Roses.
            <br />
            <span className="italic">Cerisier.</span>
          </h2>

          <Link
            href="/catalogue"
            className="group mx-auto mt-12 inline-flex min-h-14 items-center gap-12 rounded-full bg-[#f3f0ea] px-8 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#0d0d0c]"
          >
            Voir la collection

            <span
              aria-hidden
              className="text-base transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   PROCESS IMAGE
========================================================= */

function ProcessImage({
  src,
  number,
  label,
}: {
  src: string;
  number: string;
  label: string;
}) {
  return (
    <div className="group w-[82vw] max-w-[330px] shrink-0 snap-start bg-[#0d0d0c] sm:w-auto sm:max-w-none">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1918]">
        <Image
          src={src}
          alt={`Processus AJVEK — ${label}`}
          fill
          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 50vw, 20vw"
          className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.02] group-hover:opacity-100"
        />
      </div>

      <div className="flex items-center justify-between px-5 py-5">
        <span className="text-[8px] tracking-[0.3em] text-[#6f6962]">
          {number}
        </span>

        <span className="text-[9px] uppercase tracking-[0.3em] text-[#aaa29a]">
          {label}
        </span>
      </div>
    </div>
  );
}