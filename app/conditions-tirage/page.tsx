import Link from "next/link";

export const metadata = {
  title: "Conditions du tirage",
  description:
    "Conditions de l’opération promotionnelle AJVEK : 10 commandes, 1 gagnant, -30 % sur un prochain achat.",
};

export default function ConditionsTiragePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="border-b border-surface px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
            AJVEK · Private Draw
          </p>

          <h1 className="mt-5 font-display text-4xl leading-tight md:text-6xl">
            10 commandes.
            <br />
            1 gagnant.
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-stone md:text-base">
            À l&apos;occasion du lancement du premier drop AJVEK, un tirage au
            sort sera organisé lorsque la dixième commande payée aura été
            enregistrée.
          </p>
        </div>
      </section>

      {/* CONDITIONS */}
      <section className="px-6 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="border-t border-surface">
            {/* 01 */}
            <article className="border-b border-surface py-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                01 — Participation
              </p>

              <h2 className="mt-4 font-display text-2xl md:text-3xl">
                Qui participe ?
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
                Chaque commande AJVEK payée et validée parmi les 10 premières
                commandes comptabilisées pendant l&apos;opération donne droit
                à une participation au tirage au sort.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
                Une commande annulée, remboursée ou dont le paiement n&apos;a
                pas été validé ne participe pas au tirage.
              </p>
            </article>

            {/* 02 */}
            <article className="border-b border-surface py-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                02 — Déclenchement
              </p>

              <h2 className="mt-4 font-display text-2xl md:text-3xl">
                Quand aura lieu le tirage ?
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
                Le tirage sera organisé après validation de la dixième
                commande payée.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
                Le compteur affiché sur le site est donné à titre informatif et
                évolue en fonction des commandes effectivement payées et
                validées.
              </p>
            </article>

            {/* 03 */}
            <article className="border-b border-surface py-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                03 — Tirage
              </p>

              <h2 className="mt-4 font-display text-2xl md:text-3xl">
                Comment le gagnant est-il choisi ?
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
                Une participation sera sélectionnée de manière aléatoire parmi
                les 10 commandes éligibles.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
                Le gagnant sera contacté à l&apos;adresse e-mail utilisée lors
                de sa commande.
              </p>
            </article>

            {/* 04 */}
            <article className="border-b border-surface py-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                04 — Récompense
              </p>

              <h2 className="mt-4 font-display text-2xl md:text-3xl">
                -30 % sur le prochain achat
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
                Le gagnant recevra un code personnel permettant de bénéficier
                d&apos;une réduction de 30 % sur un prochain achat AJVEK.
              </p>

              <div className="mt-6 grid gap-px bg-surface sm:grid-cols-2">
                <div className="bg-background p-5">
                  <p className="text-[9px] uppercase tracking-[0.28em] text-stone">
                    Réduction
                  </p>

                  <p className="mt-2 font-display text-2xl">
                    -30 %
                  </p>
                </div>

                <div className="bg-background p-5">
                  <p className="text-[9px] uppercase tracking-[0.28em] text-stone">
                    Utilisation
                  </p>

                  <p className="mt-2 text-sm text-foreground">
                    1 prochaine commande
                  </p>
                </div>
              </div>
            </article>

            {/* 05 */}
            <article className="border-b border-surface py-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                05 — Utilisation du code
              </p>

              <h2 className="mt-4 font-display text-2xl md:text-3xl">
                Conditions du bon
              </h2>

              <div className="mt-5 max-w-2xl space-y-3 text-sm leading-7 text-stone">
                <p>
                  Le code est personnel et utilisable une seule fois.
                </p>

                <p>
                  La réduction s&apos;applique aux produits de la commande,
                  hors éventuels frais de livraison.
                </p>

                <p>
                  Le code n&apos;est pas échangeable contre de l&apos;argent et
                  ne peut donner lieu à aucun remboursement en espèces.
                </p>

                <p>
                  Il n&apos;est pas cumulable avec une autre réduction ou un
                  autre code promotionnel.
                </p>

                <p>
                  Sa durée de validité sera indiquée dans le message envoyé au
                  gagnant.
                </p>
              </div>
            </article>

            {/* 06 */}
            <article className="border-b border-surface py-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                06 — Données personnelles
              </p>

              <h2 className="mt-4 font-display text-2xl md:text-3xl">
                Utilisation des informations
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
                Les informations associées aux commandes sont utilisées afin
                d&apos;identifier les participations éligibles, d&apos;effectuer
                le tirage au sort et de contacter le gagnant.
              </p>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
                Pour plus d&apos;informations sur la gestion des données
                personnelles, consulte notre politique de confidentialité.
              </p>

              <Link
                href="/confidentialite"
                className="mt-5 inline-block text-[10px] uppercase tracking-[0.25em] text-foreground underline underline-offset-4"
              >
                Politique de confidentialité →
              </Link>
            </article>
          </div>

          {/* NOTE */}
          <div className="mt-10 border border-surface bg-[#0c0c0b] p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
              AJVEK
            </p>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-stone">
              Le compteur de cette opération correspond au nombre de commandes
              distinctes effectivement payées et validées. Une commande
              contenant plusieurs vêtements reste comptabilisée comme une
              seule commande pour le tirage au sort.
            </p>
          </div>

          <div className="mt-10">
            <Link
              href="/catalogue"
              className="group inline-flex items-center gap-4 rounded-full bg-foreground px-6 py-3.5 text-[10px] uppercase tracking-[0.25em] text-background"
            >
              <span>Voir la collection</span>
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}