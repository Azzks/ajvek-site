import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

export default function AProposPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="px-6 pb-20 pt-24 text-center md:pb-28 md:pt-32">
        <ScrollReveal>
          <p className="text-[10px] uppercase tracking-[0.45em] text-stone">
            À propos
          </p>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <h1 className="mt-5 font-display text-5xl leading-none sm:text-6xl md:text-7xl">
            AJVEK
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-stone md:text-lg md:leading-8">
            Deux amis, deux villes, une même envie :
            <br className="hidden sm:block" />
            construire une marque avec une vraie identité.
          </p>
        </ScrollReveal>
      </section>

      {/* INTRO */}
      <section className="border-t border-surface px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
          <ScrollReveal>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
                L&apos;origine
              </p>

              <h2 className="mt-5 font-display text-3xl leading-tight md:text-5xl">
                Une marque
                <br />
                construite à deux.
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-6 text-sm leading-7 text-stone md:text-base md:leading-8">
            <ScrollReveal delay={100}>
              <p>
                AJVEK est né de l&apos;envie d&apos;Alexis et Julien de créer
                une marque de streetwear qui leur ressemble, sans partir
                d&apos;un catalogue déjà existant ni simplement poser un logo
                sur un vêtement.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <p>
                Alexis développe l&apos;univers créatif, les designs, le site
                et l&apos;identité visuelle. Julien travaille notamment sur la
                préparation des visuels, la relation avec les partenaires de
                production et le développement du projet.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p>
                Bordeaux et Nice les séparent, mais chaque pièce est pensée,
                retravaillée et construite ensemble avant d&apos;arriver au
                vêtement final.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* UNIVERS FLORAL */}
      <section className="bg-[#0d0d0c] px-6 py-24 text-[#f3f0ea] md:py-32">
        <div className="mx-auto max-w-5xl text-center">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.45em] text-stone-500">
              L&apos;univers
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h2 className="mx-auto mt-6 max-w-4xl font-display text-4xl leading-[1.05] md:text-6xl">
              Ici, tout part
              <br />
              des fleurs.
            </h2>
          </ScrollReveal>

          <div className="mx-auto mt-14 grid max-w-4xl gap-10 text-left md:grid-cols-2 md:gap-16">
            <ScrollReveal delay={150}>
              <div className="border-t border-white/15 pt-6">
                <p className="font-display text-2xl">La rose</p>

                <p className="mt-4 text-sm leading-7 text-stone-400">
                  Elle ne s&apos;offre jamais sans ses épines. Elle porte à la
                  fois la beauté, la tension et le caractère. C&apos;est ce
                  contraste qui nous intéresse.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="border-t border-white/15 pt-6">
                <p className="font-display text-2xl">Le cerisier</p>

                <p className="mt-4 text-sm leading-7 text-stone-400">
                  Ses fleurs apparaissent puis disparaissent rapidement.
                  Quelque chose de beau, fragile et temporaire, que l&apos;on
                  choisit pourtant de garder.
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={250}>
            <p className="mx-auto mt-16 max-w-2xl text-sm leading-7 text-stone-400 md:text-base">
              Ces images ne sont pas là pour décorer une pièce. Elles servent
              de point de départ à notre manière de dessiner et de construire
              chaque collection.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* MANIFESTE */}
      <section className="px-6 py-24 md:py-32">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
              Notre manière de faire
            </p>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <p className="mt-8 max-w-4xl font-display text-3xl leading-tight md:text-5xl">
              Pas une marque construite autour de la quantité.
              <br />
              Une pièce à la fois.
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <ScrollReveal delay={100}>
              <div className="border-t border-surface pt-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  01
                </p>

                <p className="mt-4 text-lg text-foreground">
                  Dessiner
                </p>

                <p className="mt-3 text-sm leading-6 text-stone">
                  Chaque design commence par des essais, des formes et des
                  compositions avant d&apos;arriver au visuel retenu.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="border-t border-surface pt-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  02
                </p>

                <p className="mt-4 text-lg text-foreground">
                  Développer
                </p>

                <p className="mt-3 text-sm leading-6 text-stone">
                  Le motif est adapté au vêtement, à la coupe, au placement et
                  aux techniques de fabrication.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="border-t border-surface pt-5">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                  03
                </p>

                <p className="mt-4 text-lg text-foreground">
                  Produire
                </p>

                <p className="mt-3 text-sm leading-6 text-stone">
                  Nous travaillons en précommande afin de produire en fonction
                  de l&apos;intérêt réel porté aux pièces.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FABRICATION */}
      <section className="border-y border-surface px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:gap-20">
          <ScrollReveal>
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
                Fabrication
              </p>

              <h2 className="mt-5 font-display text-3xl leading-tight md:text-5xl">
                Produit
                <br />
                en France.
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div className="text-sm leading-7 text-stone md:text-base md:leading-8">
              <p>
                AJVEK n&apos;est pas une marque de dropshipping. Les pièces
                sont réellement produites en France avec des entreprises
                françaises.
              </p>

              <p className="mt-5">
                Nous travaillons notamment avec{" "}
                <span className="text-foreground">FB Création</span> pour
                l&apos;impression DTF et la broderie de nos tee-shirts.
              </p>

              <p className="mt-5">
                La précommande nous permet de lancer une production lorsque le
                seuil prévu est atteint, plutôt que de fabriquer de grandes
                quantités sans savoir si elles seront portées.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CONCLUSION */}
      <section className="px-6 py-28 text-center md:py-36">
        <ScrollReveal>
          <p className="text-[10px] uppercase tracking-[0.45em] text-stone">
            AJVEK
          </p>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <p className="mx-auto mt-6 max-w-3xl font-display text-3xl leading-tight md:text-5xl">
            Un jardin que l&apos;on construit
            <br />
            pièce par pièce.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <p className="mx-auto mt-7 max-w-xl text-sm leading-7 text-stone">
            AJVEK évoluera avec ses collections, ses dessins et ceux qui
            choisiront de porter les pièces.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Link
            href="/catalogue"
            className="mt-10 inline-block rounded-full bg-foreground px-8 py-3 text-sm uppercase tracking-widest text-background transition hover:opacity-80"
          >
            Découvrir la collection
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}