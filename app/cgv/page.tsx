export const metadata = {
  title: "Conditions générales de vente — AJVEK",
};

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-xs tracking-[0.3em] text-stone uppercase">
          AJVEK
        </p>

        <h1 className="mb-8 text-3xl font-display">
          Conditions générales de vente
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-stone">
          <p>Dernière mise à jour : 18 septembre 2026</p>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              1. Identité du vendeur
            </h2>

            <p>
              Le site ajvek.fr et les ventes réalisées sous le nom commercial
              AJVEK sont exploités par :
            </p>

            <p className="mt-3">
              <strong className="text-foreground">
                Julien GORMAND – Entrepreneur individuel (EI)
              </strong>
              <br />
              Nom commercial : AJVEK
              <br />
              95 avenue du Groupe Morgan
              <br />
              06700 Saint-Laurent-du-Var
              <br />
              France
              <br />
              SIRET : 130 156 805 00017
              <br />
              Email :{" "}
              <a
                href="mailto:ajvek.contact@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                ajvek.contact@gmail.com
              </a>
            </p>

            <p className="mt-3">
              TVA non applicable, article 293 B du Code général des impôts.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              2. Objet
            </h2>

            <p>
              Les présentes conditions générales de vente définissent les
              droits et obligations applicables aux ventes et précommandes de
              produits AJVEK réalisées sur le site ajvek.fr.
            </p>

            <p className="mt-2">
              Toute commande ou précommande implique l&apos;acceptation des
              présentes conditions générales de vente dans leur version en
              vigueur au moment de la commande.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              3. Produits
            </h2>

            <p>
              AJVEK commercialise principalement des vêtements streetwear,
              notamment des tee-shirts issus de collections originales.
            </p>

            <p className="mt-2">
              Les caractéristiques essentielles de chaque produit, notamment
              son design, sa couleur, sa taille, sa composition et son prix,
              sont présentées sur sa fiche produit.
            </p>

            <p className="mt-2">
              Les photographies et visuels ont pour objectif de présenter les
              produits aussi fidèlement que possible. De légères différences
              de couleurs ou de rendu peuvent toutefois exister selon
              l&apos;écran utilisé ou les procédés de fabrication.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              4. Prix
            </h2>

            <p>
              Les prix sont indiqués en euros.
            </p>

            <p className="mt-2">
              AJVEK relève actuellement de la franchise en base de TVA. La TVA
              n&apos;est donc pas facturée au client.
            </p>

            <p className="mt-2">
              Les éventuels frais de livraison sont indiqués au client avant
              la validation définitive de la commande.
            </p>

            <p className="mt-2">
              AJVEK se réserve la possibilité de modifier ses prix à tout
              moment. Le prix applicable reste celui affiché au moment de la
              validation de la commande ou du paiement.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              5. Précommandes
            </h2>

            <p>
              Certains produits AJVEK peuvent être proposés dans le cadre
              d&apos;un système de précommande.
            </p>

            <p className="mt-2">
              Une précommande permet au client de manifester son souhait
              d&apos;acheter un produit avant le lancement ou la finalisation
              de sa production.
            </p>

            <p className="mt-2">
              Le fonctionnement précis de la précommande, notamment
              l&apos;objectif de quantité, les délais estimés et les modalités
              de paiement, est indiqué sur le site au moment de la
              précommande.
            </p>

            <p className="mt-2">
              Tant qu&apos;aucun paiement n&apos;est demandé et encaissé, la
              précommande ne constitue pas nécessairement une vente
              définitivement conclue.
            </p>

            <p className="mt-2">
              Lorsqu&apos;un seuil de précommandes doit être atteint avant le
              lancement de la production, le client en est informé sur le
              site.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              6. Commande
            </h2>

            <p>
              Le client sélectionne le produit souhaité, la taille, la couleur
              et les autres options proposées avant de confirmer sa commande.
            </p>

            <p className="mt-2">
              Le client est responsable de l&apos;exactitude des informations
              fournies lors de la commande, notamment son identité, son adresse
              email et son adresse de livraison.
            </p>

            <p className="mt-2">
              Une confirmation de commande peut être transmise par email après
              validation du paiement.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              7. Paiement
            </h2>

            <p>
              Lorsque le paiement en ligne est disponible, celui-ci est traité
              par le prestataire de paiement sécurisé Stripe.
            </p>

            <p className="mt-2">
              AJVEK ne conserve pas les numéros complets de cartes bancaires
              utilisés lors du paiement.
            </p>

            <p className="mt-2">
              La commande est considérée comme payée lorsque le paiement a été
              effectivement accepté par le prestataire de paiement.
            </p>

            <p className="mt-2">
              En cas de refus ou d&apos;échec du paiement, la commande ne pourra
              pas être considérée comme définitivement validée.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              8. Disponibilité
            </h2>

            <p>
              Les produits sont proposés dans la limite des stocks disponibles
              ou selon les conditions indiquées lorsqu&apos;ils sont proposés
              en précommande.
            </p>

            <p className="mt-2">
              En cas d&apos;indisponibilité après paiement, AJVEK en informera
              le client dans les meilleurs délais et procédera, selon la
              situation, au remboursement des sommes concernées.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              9. Livraison
            </h2>

            <p>
              Les produits sont livrés à l&apos;adresse renseignée par le
              client lors de sa commande.
            </p>

            <p className="mt-2">
              Les délais de livraison ou, dans le cadre d&apos;une précommande,
              les délais estimés de production et d&apos;expédition sont
              communiqués au client avant ou au moment de la commande lorsque
              ces informations sont disponibles.
            </p>

            <p className="mt-2">
              AJVEK ne pourra pas être tenu responsable d&apos;un retard causé
              par une adresse erronée communiquée par le client ou par un
              événement extérieur échappant raisonnablement à son contrôle.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              10. Droit de rétractation
            </h2>

            <p>
              Conformément aux règles applicables aux contrats conclus à
              distance, le consommateur dispose en principe d&apos;un délai de
              14 jours pour exercer son droit de rétractation à compter de la
              réception du produit.
            </p>

            <p className="mt-2">
              Pour exercer ce droit, le client doit informer AJVEK de sa
              décision de se rétracter par une déclaration claire envoyée à :
            </p>

            <p className="mt-2">
              <a
                href="mailto:ajvek.contact@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                ajvek.contact@gmail.com
              </a>
            </p>

            <p className="mt-2">
              Le simple renvoi du produit sans déclaration préalable ne suffit
              pas à exprimer la volonté de se rétracter.
            </p>

            <p className="mt-2">
              Les produits devront être retournés dans un état permettant leur
              remise en vente, sous réserve des manipulations nécessaires pour
              déterminer leur nature, leurs caractéristiques et leur bon
              fonctionnement.
            </p>

            <p className="mt-2">
              Les frais de retour restent à la charge du client sauf indication
              contraire ou lorsque le produit livré est défectueux ou non
              conforme.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              11. Remboursement après rétractation
            </h2>

            <p>
              Lorsque le droit de rétractation est valablement exercé, AJVEK
              rembourse les sommes dues conformément à la réglementation
              applicable.
            </p>

            <p className="mt-2">
              Le remboursement pourra être différé jusqu&apos;à récupération
              du produit ou jusqu&apos;à ce que le client fournisse une preuve
              de son expédition lorsque la réglementation le permet.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              12. Produits personnalisés
            </h2>

            <p>
              Lorsque AJVEK propose un produit confectionné selon les
              spécifications du client ou clairement personnalisé, le droit de
              rétractation peut ne pas être applicable conformément aux
              exceptions prévues par la réglementation.
            </p>

            <p className="mt-2">
              Lorsque cette exception s&apos;applique, le client en est informé
              avant la commande.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              13. Garanties légales
            </h2>

            <p>
              Le consommateur bénéficie des garanties légales applicables aux
              produits vendus, notamment de la garantie légale de conformité
              et de la garantie contre les vices cachés dans les conditions
              prévues par la loi.
            </p>

            <p className="mt-2">
              En cas de produit défectueux, endommagé ou non conforme, le
              client peut contacter AJVEK à :
            </p>

            <p className="mt-2">
              <a
                href="mailto:ajvek.contact@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                ajvek.contact@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              14. Responsabilité
            </h2>

            <p>
              AJVEK s&apos;engage à fournir les produits conformément aux
              informations présentées sur le site et aux obligations légales
              applicables.
            </p>

            <p className="mt-2">
              AJVEK ne saurait être tenu responsable d&apos;une mauvaise
              utilisation du produit par le client ou d&apos;un dommage
              résultant d&apos;une utilisation contraire à sa destination
              normale.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              15. Propriété intellectuelle
            </h2>

            <p>
              Les créations, designs, motifs, photographies, textes, logos,
              éléments graphiques et contenus utilisés par AJVEK sont protégés
              par les règles applicables en matière de propriété intellectuelle.
            </p>

            <p className="mt-2">
              Toute reproduction, diffusion, modification ou exploitation non
              autorisée est interdite, sauf autorisation préalable du ou des
              titulaires des droits concernés.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              16. Données personnelles
            </h2>

            <p>
              Les modalités relatives à la collecte et au traitement des
              données personnelles sont présentées dans la politique de
              confidentialité d&apos;AJVEK.
            </p>

            <a
              href="/confidentialite"
              className="mt-2 inline-block text-foreground underline underline-offset-4"
            >
              Consulter la politique de confidentialité
            </a>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              17. Réclamations
            </h2>

            <p>
              Pour toute question ou réclamation concernant une commande, le
              client peut contacter AJVEK à :
            </p>

            <p className="mt-2">
              <a
                href="mailto:ajvek.contact@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                ajvek.contact@gmail.com
              </a>
            </p>

            <p className="mt-2">
              AJVEK cherchera en priorité une solution amiable avec le client.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              18. Médiation de la consommation
            </h2>

            <p>
              Après une réclamation écrite préalable auprès d&apos;AJVEK et en
              l&apos;absence de solution satisfaisante, le consommateur peut
              recourir gratuitement au médiateur de la consommation dont relève
              AJVEK, dans les conditions prévues par la réglementation.
            </p>

            <p className="mt-2 font-medium text-foreground">
              Médiateur de la consommation :
            </p>

            <p className="mt-2">
              À compléter dès l&apos;adhésion d&apos;AJVEK à un médiateur de la
              consommation référencé.
            </p>

            <p className="mt-2">
              Les coordonnées complètes et l&apos;adresse du site internet du
              médiateur seront ajoutées à la présente page.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              19. Droit applicable
            </h2>

            <p>
              Les présentes conditions générales de vente sont soumises au
              droit français.
            </p>

            <p className="mt-2">
              En cas de litige, les règles légales applicables en matière de
              compétence juridictionnelle et de protection du consommateur
              demeurent applicables.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              20. Modification des CGV
            </h2>

            <p>
              AJVEK peut modifier les présentes conditions générales de vente
              afin de tenir compte de l&apos;évolution de son activité, de ses
              services ou de la réglementation.
            </p>

            <p className="mt-2">
              La version applicable à une commande est celle en vigueur au
              moment où celle-ci est conclue.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}