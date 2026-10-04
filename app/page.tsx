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

const shootingImages = [
  {
    src: "/images/shooting/cerisier blanc dos de biais.jpg",
    alt: "AJVEK Cerisier blanc porté de dos",
    label: "Cerisier / Blanc",
    position: "object-center",
  },
  {
    src: "/images/shooting/AJK blanc sur noir proche.jpg",
    alt: "Broderie AJVEK blanche sur tee-shirt noir",
    label: "Broderie / Noir",
    position: "object-center",
  },
  {
    src: "/images/shooting/rose noir dos de biais.jpg",
    alt: "AJVEK Roses noir porté de dos",
    label: "Roses / Noir",
    position: "object-center",
  },
  {
    src: "/images/shooting/cerisier noir dos proche.jpg",
    alt: "Détail du motif AJVEK Cerisier noir",
    label: "Cerisier / Détail",
    position: "object-center",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#0d0d0c] text-[#f3f0ea]">
      {/* =====================================================
          HERO — AJVEK
      ====================================================== */}

      <section className="relative flex min-h-[calc(100svh-68px)] items-center justify-center overflow-hidden border-b border-white/[0.08] px-5 md:min-h-[calc(100svh-76px)] md:px-10">
        <div className="absolute left-5 right-5 top-7 flex items-center justify-between sm:left-10 sm:right-10 lg:left-14 lg:right-14 xl:left-20 xl:right-20">
          <p className="text-[8px] uppercase tracking-[0.34em] text-[#716a63] sm:text-[9px]">
            Drop 001 · 2026
          </p>

          <p className="text-[8px] uppercase tracking-[0.34em] text-[#716a63] sm:text-[9px]">
            Créé en France
          </p>
        </div>

        <div className="relative flex w-full flex-col items-center justify-center text-center">
          <p className="mb-5 text-[8px] uppercase tracking-[0.5em] text-[#8a8178] sm:mb-7 sm:text-[9px]">
            Streetwear français
          </p>

          <h1
            className="
              font-display
              text-[clamp(5rem,22vw,20rem)]
              font-normal
              leading-[0.7]
              tracking-[-0.065em]
              text-[#f3f0ea]
            "
          >
            AJVEK
          </h1>

          <p className="mt-8 font-display text-xl italic tracking-[-0.02em] text-[#9c948b] sm:mt-10 sm:text-2xl lg:text-3xl">
            Le dessin prend corps.
          </p>
        </div>

        <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 sm:bottom-9">
          <span className="text-[7px] uppercase tracking-[0.38em] text-[#625c56] sm:text-[8px]">
            Découvrir
          </span>

          <span aria-hidden className="text-sm text-[#716a63]">
            ↓
          </span>
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
          IMAGE ÉDITORIALE — SHOOTING
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="relative h-[70svh] min-h-[520px] overflow-hidden sm:h-[82svh] lg:min-h-[760px]">
          <Image
            src="/images/shooting/cerisier et rose blanc de dos.jpg"
            alt="AJVEK Roses et Cerisier portés de dos"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/10" />

          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-8 p-6 sm:p-10 lg:p-14 xl:p-20">
            <div>
              <p className="text-[8px] uppercase tracking-[0.38em] text-white/60 sm:text-[9px]">
                AJVEK · Drop 001
              </p>

              <h2 className="mt-4 max-w-3xl font-display text-5xl leading-[0.9] tracking-[-0.04em] sm:text-6xl lg:text-8xl">
                Deux dessins.
                <br />
                Une identité.
              </h2>
            </div>

            <p className="hidden max-w-xs text-right text-xs leading-6 text-white/60 md:block">
              Roses et Cerisier, photographiés dans leur environnement.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          MANIFESTE
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
          <div className="relative min-h-[560px] overflow-hidden bg-[#151413] sm:min-h-[700px]">
            <Image
              src="/images/shooting/cerisier noir dos de biais.jpg"
              alt="Tee-shirt AJVEK Cerisier noir porté"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
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
          SHOOTING — DÉTAILS
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto max-w-[1600px] px-6 py-20 sm:px-10 lg:px-14 lg:py-28 xl:px-20">
          <div className="mb-12 flex items-end justify-between gap-8 sm:mb-16">
            <div>
              <p className="text-[9px] uppercase tracking-[0.34em] text-[#8a8178]">
                Porté / Détails
              </p>

              <h2 className="mt-5 font-display text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
                Dans la rue.
                <br />
                <span className="italic">Dans le détail.</span>
              </h2>
            </div>

            <Link
              href="/lookbook"
              className="hidden border-b border-[#8a8178] pb-2 text-[9px] uppercase tracking-[0.3em] sm:block"
            >
              Voir le lookbook →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {shootingImages.map((photo, index) => (
              <div
                key={photo.src}
                className={`group ${
                  index === 0 || index === 3
                    ? "col-span-2 lg:col-span-1"
                    : ""
                }`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#181716]">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={`object-cover ${photo.position} transition-transform duration-700 ease-out group-hover:scale-[1.025]`}
                  />
                </div>

                <div className="flex items-center justify-between py-4">
                  <p className="text-[8px] uppercase tracking-[0.28em] text-[#8a8178]">
                    {photo.label}
                  </p>

                  <span className="text-[8px] text-[#57524d]">
                    0{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/lookbook"
            className="mt-8 inline-flex border-b border-[#8a8178] pb-2 text-[9px] uppercase tracking-[0.3em] sm:hidden"
          >
            Voir le lookbook →
          </Link>
        </div>
      </section>

      {/* =====================================================
          BRODERIE
      ====================================================== */}

      <section className="border-b border-white/[0.08]">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#151413] lg:aspect-auto lg:min-h-[720px]">
            <Image
              src="/images/shooting/AJK blanc sur noir proche.jpg"
              alt="Détail de la broderie AJVEK sur tee-shirt noir"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-[#d6d2cb] lg:aspect-auto lg:min-h-[720px]">
            <Image
              src="/images/shooting/AJK en noir sur blanc proche.jpg"
              alt="Détail de la broderie AJVEK sur tee-shirt blanc"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />

            <div className="absolute bottom-6 left-6 rounded-full bg-black/70 px-4 py-2 text-[8px] uppercase tracking-[0.28em] text-white backdrop-blur-md sm:bottom-8 sm:left-8">
              Broderie poitrine
            </div>
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