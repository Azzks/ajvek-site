import Link from "next/link";

export const metadata = {
  title: "Lookbook — AJVEK",
};

export default function LookbookPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="px-6 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <p className="text-[10px] uppercase tracking-[0.45em] text-stone">
          AJVEK
        </p>

        <h1 className="mt-5 font-display text-5xl leading-none md:text-7xl">
          Lookbook
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-stone md:text-base">
          Les pièces prennent une autre dimension lorsqu&apos;elles sont portées.
          En attendant les premières images réelles, découvrez l&apos;univers
          visuel qui guidera le premier lookbook AJVEK.
        </p>
      </section>

      {/* EDITORIAL BLOCK */}
      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-12">
          {/* CARD 1 */}
          <div className="relative min-h-[58svh] overflow-hidden bg-[#111110] md:col-span-7 md:min-h-[72vh]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),linear-gradient(to_bottom,transparent,rgba(0,0,0,0.5))]" />

            <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone-500">
                Direction 01
              </p>

              <h2 className="mt-4 max-w-xl font-display text-3xl leading-tight md:text-5xl">
                Ombres.
                <br />
                Béton.
                <br />
                Silhouettes.
              </h2>

              <p className="mt-5 max-w-md text-sm leading-6 text-stone-400">
                Une lumière basse, des textures brutes et des coupes larges.
                L&apos;univers AJVEK doit rester sombre, simple et centré sur la pièce.
              </p>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="relative min-h-[42svh] overflow-hidden border border-surface bg-surface/30 md:col-span-5 md:min-h-[72vh]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-64 w-44 md:h-80 md:w-56">
                <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />
                <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-white/10" />

                <div className="absolute inset-8 border border-white/10" />

                <div className="absolute left-1/2 top-1/2 h-28 w-20 -translate-x-1/2 -translate-y-1/2 rotate-6 border border-white/20" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-7 md:p-10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone-500">
                Direction 02
              </p>

              <p className="mt-3 text-sm leading-6 text-stone-400">
                Des cadrages simples et beaucoup d&apos;espace autour du vêtement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOOTING PLAN */}
      <section className="border-y border-surface px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
                À venir
              </p>

              <h2 className="mt-5 font-display text-3xl leading-tight md:text-5xl">
                Le premier
                <br />
                shooting AJVEK.
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="border-t border-surface pt-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  01
                </p>

                <p className="mt-3 text-lg">
                  Fit
                </p>

                <p className="mt-2 text-sm leading-6 text-stone">
                  Montrer la coupe oversize, les épaules, la longueur et le tombé
                  réel du tee-shirt.
                </p>
              </div>

              <div className="border-t border-surface pt-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  02
                </p>

                <p className="mt-3 text-lg">
                  Dos
                </p>

                <p className="mt-2 text-sm leading-6 text-stone">
                  Mettre le motif au centre de l&apos;image et laisser respirer le
                  cadre autour.
                </p>
              </div>

              <div className="border-t border-surface pt-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  03
                </p>

                <p className="mt-3 text-lg">
                  Détails
                </p>

                <p className="mt-2 text-sm leading-6 text-stone">
                  Broderie AJK, impression DTF, matière, col et finitions.
                </p>
              </div>

              <div className="border-t border-surface pt-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  04
                </p>

                <p className="mt-3 text-lg">
                  Mouvement
                </p>

                <p className="mt-2 text-sm leading-6 text-stone">
                  Marche, rotation du modèle et plans plus naturels pour donner
                  de la vie à la pièce.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLACEHOLDER PREMIUM */}
      <section className="px-6 py-28 text-center md:py-36">
        <p className="text-[10px] uppercase tracking-[0.45em] text-stone">
          Bientôt
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
          Les premières pièces
          <br />
          devant l&apos;objectif.
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-stone">
          Cette page évoluera dès la réception des premiers tee-shirts avec les
          photos et vidéos originales du premier shooting AJVEK.
        </p>

        <Link
          href="/catalogue"
          className="mt-10 inline-block rounded-full bg-foreground px-8 py-3 text-sm uppercase tracking-widest text-background transition hover:opacity-80"
        >
          Voir la collection
        </Link>
      </section>
    </main>
  );
}