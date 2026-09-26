import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export default function AProposPage() {
  return (
    <main className="bg-background text-foreground">
      {/* HERO */}
      <section className="border-b border-surface px-6 py-20 text-center md:px-8 md:py-28">
        <ScrollReveal>
          <p className="text-[10px] uppercase tracking-[0.42em] text-stone">
            À propos
          </p>

          <h1 className="mt-5 font-display text-6xl leading-none md:text-8xl">
            AJVEK
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-base leading-7 text-stone md:text-lg">
            Deux amis, deux villes, une même envie :
            construire une marque avec une vraie identité.
          </p>
        </ScrollReveal>
      </section>

      {/* ORIGINE */}
      <section className="px-6 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
              L&apos;origine
            </p>

            <h2 className="mt-5 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
              Une marque
              <br />
              construite à deux.
            </h2>

            <div className="mt-10 grid gap-7 text-sm leading-7 text-stone md:grid-cols-2 md:text-base">
              <p>
                AJVEK est né de l&apos;envie d&apos;Alexis et Julien de
                créer une marque de streetwear qui leur ressemble,
                sans partir d&apos;un catalogue déjà existant ni simplement
                poser un logo sur un vêtement.
              </p>

              <p>
                Alexis développe l&apos;univers créatif, les designs,
                le site et l&apos;identité visuelle. Julien gère notamment
                la relation avec les partenaires, le suivi de production
                et le développement du projet.
              </p>

              <p className="md:col-span-2 md:max-w-2xl">
                Bordeaux et Nice les séparent, mais chaque pièce est pensée,
                retravaillée et construite ensemble avant d&apos;arriver
                au vêtement final.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* UNIVERS */}
      <section className="border-y border-surface bg-[#0c0c0b] px-6 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
                L&apos;univers
              </p>

              <h2 className="mt-5 font-display text-4xl leading-tight md:text-6xl">
                Ici, tout part
                <br />
                des fleurs.
              </h2>
            </div>

            <div className="mt-14 grid gap-0 md:grid-cols-2">
              <article className="border-t border-surface py-8 md:border-r md:pr-10">
                <h3 className="font-display text-3xl">
                  La rose
                </h3>

                <p className="mt-5 text-sm leading-7 text-stone md:text-base">
                  Elle ne s&apos;offre jamais sans ses épines.
                  Elle porte à la fois la beauté, la tension et le caractère.
                  C&apos;est ce contraste qui nous intéresse.
                </p>
              </article>

              <article className="border-t border-surface py-8 md:pl-10">
                <h3 className="font-display text-3xl">
                  Le cerisier
                </h3>

                <p className="mt-5 text-sm leading-7 text-stone md:text-base">
                  Ses fleurs apparaissent puis disparaissent rapidement.
                  Quelque chose de beau, fragile et temporaire,
                  que l&apos;on choisit pourtant de garder.
                </p>
              </article>
            </div>

            <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-7 text-stone md:text-base">
              Ces images ne sont pas là pour décorer une pièce.
              Elles servent de point de départ à notre manière de dessiner
              et de construire chaque collection.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* MANIERE DE FAIRE */}
      <section className="px-6 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
              Notre manière de faire
            </p>

            <h2 className="mt-5 max-w-4xl font-display text-4xl leading-tight md:text-6xl">
              Pas une marque construite
              <br />
              autour de la quantité.
              <br />
              Une pièce à la fois.
            </h2>

            <div className="mt-12 border-t border-surface">
              <article className="border-b border-surface py-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  01
                </p>

                <h3 className="mt-4 text-xl text-foreground">
                  Dessiner
                </h3>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone md:text-base">
                  Chaque design commence par des essais, des formes et
                  des compositions avant d&apos;arriver au visuel retenu.
                </p>
              </article>

              <article className="border-b border-surface py-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  02
                </p>

                <h3 className="mt-4 text-xl text-foreground">
                  Développer
                </h3>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone md:text-base">
                  Le motif est adapté au vêtement, à la coupe,
                  au placement et aux techniques de fabrication.
                </p>
              </article>

              <article className="border-b border-surface py-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  03
                </p>

                <h3 className="mt-4 text-xl text-foreground">
                  Produire
                </h3>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-stone md:text-base">
                  Chaque drop est produit en série limitée, avec des quantités
                  maîtrisées pour rester fidèles à notre manière de construire
                  AJVEK.
                </p>
              </article>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FABRICATION */}
      <section className="border-y border-surface bg-[#0c0c0b] px-6 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
              Fabrication
            </p>

            <h2 className="mt-5 font-display text-4xl leading-tight md:text-6xl">
              Produit
              <br />
              en France.
            </h2>

            <div className="mt-10 max-w-3xl space-y-6 text-sm leading-7 text-stone md:text-base">
              <p>
                Les pièces AJVEK sont produites en France
                avec des entreprises françaises.
              </p>

              <p>
                Nous travaillons notamment avec{" "}
                <span className="text-foreground">
                  FB Création
                </span>{" "}
                pour l&apos;impression DTF et la broderie de nos tee-shirts.
              </p>

              <p>
                Nous privilégions des séries limitées et des quantités
                maîtrisées, afin de développer chaque collection à notre
                échelle plutôt que de produire de grandes quantités.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FINAL */}
      <section className="px-6 py-20 text-center md:px-8 md:py-28">
        <ScrollReveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
            AJVEK
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-tight md:text-6xl">
            Un jardin que l&apos;on construit
            <br />
            pièce par pièce.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-stone md:text-base">
            AJVEK évoluera avec ses collections, ses dessins
            et ceux qui choisiront de porter les pièces.
          </p>

          <Link
            href="/catalogue"
            className="mt-9 inline-flex rounded-full bg-foreground px-8 py-4 text-[10px] uppercase tracking-[0.28em] text-background transition hover:opacity-85"
          >
            Découvrir la collection
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}