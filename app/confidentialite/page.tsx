export const metadata = {
  title: "Politique de confidentialité — AJVEK",
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-xs tracking-[0.3em] text-stone uppercase">
          AJVEK
        </p>
        <h1 className="mb-8 text-3xl font-display">
          Politique de confidentialité
        </h1>

        <div className="space-y-6 text-sm leading-relaxed text-stone">
          <p>Dernière mise à jour : [date]</p>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              1. Responsable du traitement
            </h2>
            <p>
              Les données personnelles collectées sur ajvek.fr sont traitées
              par [Nom légal de l&apos;entreprise / auto-entrepreneur],
              joignable à l&apos;adresse ajvek.contact@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              2. Données collectées
            </h2>
            <p>
              Dans le cadre d&apos;une précommande, nous collectons : votre
              nom, votre adresse email, votre numéro de téléphone (facultatif),
              ainsi que le produit, la couleur et la taille choisis. Lors du
              paiement, votre adresse postale et vos informations bancaires
              sont collectées directement par notre prestataire de paiement
              Stripe — nous n&apos;y avons pas accès et ne les stockons pas.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              3. Finalités du traitement
            </h2>
            <p>
              Ces données sont utilisées pour : traiter votre précommande,
              vous informer de son avancement, vous envoyer le lien de
              paiement une fois la production lancée, et vous contacter en
              cas de besoin concernant votre commande.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              4. Base légale
            </h2>
            <p>
              Le traitement de vos données repose sur l&apos;exécution
              d&apos;une relation précontractuelle (votre précommande) et,
              le cas échéant, sur l&apos;exécution du contrat de vente une
              fois le paiement effectué.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              5. Destinataires des données
            </h2>
            <p>
              Vos données sont hébergées et traitées par les prestataires
              suivants, chacun agissant en tant que sous-traitant au sens du
              RGPD : Supabase (hébergement de la base de données),
              Stripe (traitement des paiements), et Resend (envoi des emails
              transactionnels). Ces prestataires n&apos;utilisent vos
              données à aucune autre fin que celle pour laquelle ils sont
              mandatés.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              6. Durée de conservation
            </h2>
            <p>
              Vos données sont conservées le temps nécessaire au traitement
              de votre précommande et de votre commande, puis archivées pour
              la durée requise par nos obligations légales et comptables.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              7. Vos droits
            </h2>
            <p>
              Conformément au Règlement Général sur la Protection des
              Données (RGPD), vous disposez d&apos;un droit d&apos;accès, de
              rectification, d&apos;effacement, de limitation et
              d&apos;opposition concernant vos données personnelles. Pour
              exercer ces droits, contactez-nous à
              ajvek.contact@gmail.com. Vous pouvez également introduire une
              réclamation auprès de la CNIL (www.cnil.fr).
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              8. Cookies
            </h2>
            <p>
              Le site ajvek.fr n&apos;utilise pas de cookies de suivi
              publicitaire. Seuls des cookies techniques strictement
              nécessaires au fonctionnement du site (par exemple, la gestion
              du panier) peuvent être utilisés.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
