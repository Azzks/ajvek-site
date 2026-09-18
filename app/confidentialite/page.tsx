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
          <p>Dernière mise à jour : 18 septembre 2026</p>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              1. Responsable du traitement
            </h2>

            <p>
              Le responsable du traitement des données personnelles collectées
              sur le site ajvek.fr est Julien GORMAND, entrepreneur individuel
              exerçant sous le nom commercial AJVEK.
            </p>

            <p className="mt-2">
              Adresse professionnelle : 95 avenue du Groupe Morgan, 06700
              Saint-Laurent-du-Var, France.
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
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              2. Données personnelles collectées
            </h2>

            <p>
              Dans le cadre de l&apos;utilisation du site, de la création d&apos;un
              compte, d&apos;une précommande ou d&apos;une commande, AJVEK peut
              notamment collecter les informations suivantes :
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>nom et prénom ;</li>
              <li>adresse email ;</li>
              <li>numéro de téléphone lorsqu&apos;il est renseigné ;</li>
              <li>adresse de livraison et de facturation lorsque nécessaire ;</li>
              <li>informations liées au compte utilisateur ;</li>
              <li>
                informations relatives aux produits, tailles, couleurs,
                précommandes et commandes ;
              </li>
              <li>
                données techniques strictement nécessaires au fonctionnement,
                à la sécurité et à l&apos;administration du site.
              </li>
            </ul>

            <p className="mt-3">
              Lorsqu&apos;un paiement est effectué par carte bancaire, les
              données bancaires sont traitées directement par Stripe. AJVEK ne
              conserve pas le numéro complet de la carte bancaire.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              3. Finalités du traitement
            </h2>

            <p>Les données personnelles sont utilisées afin de :</p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>créer et administrer les comptes utilisateurs ;</li>
              <li>enregistrer et gérer les précommandes ;</li>
              <li>traiter les commandes et les paiements ;</li>
              <li>
                informer les clients de l&apos;avancement de leur précommande
                ou de leur commande ;
              </li>
              <li>assurer la livraison et le suivi des commandes ;</li>
              <li>répondre aux demandes adressées à AJVEK ;</li>
              <li>
                respecter les obligations légales, comptables et fiscales
                applicables ;
              </li>
              <li>assurer la sécurité et le bon fonctionnement du site.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              4. Bases légales
            </h2>

            <p>
              Selon la nature du traitement, les données sont traitées sur les
              bases juridiques suivantes :
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                l&apos;exécution de mesures précontractuelles pour la gestion
                des précommandes ;
              </li>
              <li>
                l&apos;exécution du contrat pour le traitement des commandes et
                paiements ;
              </li>
              <li>
                le respect des obligations légales, notamment comptables et
                fiscales ;
              </li>
              <li>
                l&apos;intérêt légitime d&apos;AJVEK pour la sécurité, la
                prévention de la fraude et le bon fonctionnement du site ;
              </li>
              <li>
                le consentement lorsque celui-ci est requis par la
                réglementation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              5. Caractère obligatoire ou facultatif des données
            </h2>

            <p>
              Les informations signalées comme obligatoires dans les
              formulaires sont nécessaires au traitement de la demande, de la
              précommande, de la commande ou à la création du compte.
            </p>

            <p className="mt-2">
              Les informations indiquées comme facultatives peuvent être
              laissées vides.
            </p>

            <p className="mt-2">
              L&apos;absence de fourniture d&apos;une donnée obligatoire peut
              empêcher AJVEK de traiter la demande concernée.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              6. Destinataires des données
            </h2>

            <p>
              Les données sont accessibles uniquement aux personnes et
              prestataires qui en ont besoin pour assurer le fonctionnement du
              service.
            </p>

            <p className="mt-3">AJVEK utilise notamment :</p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Supabase pour l&apos;authentification et l&apos;hébergement de
                certaines données ;
              </li>
              <li>Stripe pour le traitement sécurisé des paiements ;</li>
              <li>Resend pour l&apos;envoi d&apos;emails transactionnels ;</li>
              <li>Vercel pour l&apos;hébergement du site et ses services associés.</li>
            </ul>

            <p className="mt-3">
              Ces prestataires peuvent traiter certaines données pour le compte
              d&apos;AJVEK dans la limite nécessaire à la fourniture de leurs
              services.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              7. Transferts de données hors de l&apos;Union européenne
            </h2>

            <p>
              Certains prestataires utilisés par AJVEK peuvent être établis ou
              disposer d&apos;infrastructures situées en dehors de l&apos;Union
              européenne.
            </p>

            <p className="mt-2">
              Lorsque cela est nécessaire, ces transferts sont encadrés par les
              mécanismes prévus par la réglementation applicable en matière de
              protection des données personnelles.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              8. Durée de conservation
            </h2>

            <p>
              AJVEK conserve les données personnelles uniquement pendant la
              durée nécessaire aux finalités pour lesquelles elles ont été
              collectées.
            </p>

            <p className="mt-2">
              Les données relatives aux commandes et aux obligations
              comptables peuvent être archivées pendant la durée imposée par la
              réglementation applicable.
            </p>

            <p className="mt-2">
              Les données liées à un compte utilisateur peuvent être conservées
              tant que le compte est actif, sous réserve des obligations
              légales de conservation applicables.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              9. Vos droits
            </h2>

            <p>
              Conformément à la réglementation applicable en matière de
              protection des données personnelles, vous pouvez notamment
              disposer des droits suivants :
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>droit d&apos;accès ;</li>
              <li>droit de rectification ;</li>
              <li>droit à l&apos;effacement ;</li>
              <li>droit à la limitation du traitement ;</li>
              <li>droit d&apos;opposition ;</li>
              <li>droit à la portabilité lorsque celui-ci est applicable ;</li>
              <li>
                droit de retirer votre consentement lorsque le traitement repose
                sur celui-ci.
              </li>
            </ul>

            <p className="mt-3">
              Pour exercer vos droits, vous pouvez contacter AJVEK à :
              <br />
              <a
                href="mailto:ajvek.contact@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                ajvek.contact@gmail.com
              </a>
            </p>

            <p className="mt-2">
              Vous pouvez également introduire une réclamation auprès de la
              Commission nationale de l&apos;informatique et des libertés
              (CNIL).
            </p>

            <a
              href="https://www.cnil.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-foreground underline underline-offset-4"
            >
              www.cnil.fr
            </a>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              10. Cookies et traceurs
            </h2>

            <p>
              Le site utilise les éléments techniques nécessaires à son
              fonctionnement, notamment pour l&apos;authentification, la
              sécurité et certaines fonctionnalités du panier.
            </p>

            <p className="mt-2">
              AJVEK utilise également Vercel Web Analytics afin d&apos;obtenir
              des statistiques générales de fréquentation du site.
            </p>

            <p className="mt-2">
              AJVEK ne dépose pas volontairement de cookies publicitaires ou de
              ciblage comportemental sans recueillir le consentement requis
              lorsque celui-ci est nécessaire.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              11. Sécurité
            </h2>

            <p>
              AJVEK met en œuvre des mesures techniques et organisationnelles
              destinées à protéger les données personnelles contre la perte,
              l&apos;accès non autorisé, la modification ou la divulgation
              illicite.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              12. Modification de la politique de confidentialité
            </h2>

            <p>
              La présente politique peut être mise à jour afin de tenir compte
              de l&apos;évolution du site, des services proposés ou de la
              réglementation applicable.
            </p>

            <p className="mt-2">
              La date de dernière mise à jour indiquée en haut de cette page
              permet d&apos;identifier la version actuellement applicable.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}