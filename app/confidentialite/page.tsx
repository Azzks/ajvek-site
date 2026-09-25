export const metadata = {
  title: "Politique de confidentialité — AJVEK",
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-stone">
          AJVEK
        </p>

        <h1 className="mb-8 text-3xl font-display">
          Politique de confidentialité
        </h1>

        <div className="space-y-6 text-sm leading-relaxed text-stone">
          <p>Dernière mise à jour : 25 septembre 2026</p>

          {/* =====================================================
              1. RESPONSABLE DU TRAITEMENT
          ====================================================== */}

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
              SIREN : 130 156 805
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
              <br />
              Téléphone :{" "}
              <a
                href="tel:+33673059556"
                className="text-foreground underline underline-offset-4"
              >
                +33 6 73 05 95 56
              </a>
            </p>
          </section>

          {/* =====================================================
              2. DONNÉES COLLECTÉES
          ====================================================== */}

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              2. Données personnelles collectées
            </h2>

            <p>
              Dans le cadre de l&apos;utilisation du site, de la création
              d&apos;un compte et de la réalisation d&apos;une précommande,
              AJVEK peut notamment collecter les informations suivantes :
            </p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>nom et prénom ;</li>
              <li>adresse email ;</li>
              <li>numéro de téléphone ;</li>
              <li>adresse de livraison lorsque nécessaire ;</li>
              <li>informations liées au compte utilisateur ;</li>

              <li>
                informations relatives aux produits, tailles, couleurs,
                quantités et précommandes ;
              </li>

              <li>
                mode de livraison choisi et informations relatives au Point
                Relais sélectionné lorsque cette option est utilisée ;
              </li>

              <li>
                informations nécessaires au suivi et à la gestion du paiement ;
              </li>

              <li>
                informations nécessaires à la gestion des opérations
                promotionnelles auxquelles une commande peut être éligible ;
              </li>

              <li>
                données techniques nécessaires au fonctionnement, à la sécurité
                et à l&apos;administration du site.
              </li>
            </ul>

            <p className="mt-3">
              Lorsqu&apos;un paiement est effectué par carte bancaire, les
              données bancaires sont traitées directement par Stripe. AJVEK ne
              conserve pas le numéro complet de la carte bancaire.
            </p>
          </section>

          {/* =====================================================
              3. FINALITÉS
          ====================================================== */}

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              3. Finalités du traitement
            </h2>

            <p>Les données personnelles sont utilisées afin de :</p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>créer et administrer les comptes utilisateurs ;</li>

              <li>enregistrer et gérer les précommandes ;</li>

              <li>traiter et confirmer les paiements ;</li>

              <li>
                informer les clients de l&apos;avancement de leur précommande ;
              </li>

              <li>
                organiser la livraison à domicile ou en Point Relais ;
              </li>

              <li>assurer le suivi des commandes et livraisons ;</li>

              <li>répondre aux demandes adressées à AJVEK ;</li>

              <li>
                gérer les opérations promotionnelles organisées par AJVEK,
                notamment identifier les commandes éligibles à un tirage au
                sort, effectuer le tirage et contacter le gagnant ;
              </li>

              <li>
                respecter les obligations légales, comptables et fiscales
                applicables ;
              </li>

              <li>prévenir la fraude et sécuriser le site ;</li>

              <li>
                mesurer de manière générale la fréquentation et les performances
                du site.
              </li>
            </ul>
          </section>

          {/* =====================================================
              4. BASES LÉGALES
          ====================================================== */}

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
                l&apos;exécution de mesures précontractuelles pour les démarches
                précédant la validation d&apos;une précommande ;
              </li>

              <li>
                l&apos;exécution du contrat pour le paiement, la préparation et
                la livraison des produits ;
              </li>

              <li>
                l&apos;exécution des conditions de l&apos;opération
                promotionnelle lorsqu&apos;un client participe à un tirage au
                sort lié à sa commande ;
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

          {/* =====================================================
              5. DONNÉES OBLIGATOIRES
          ====================================================== */}

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              5. Caractère obligatoire ou facultatif des données
            </h2>

            <p>
              Les informations signalées comme obligatoires dans les
              formulaires sont nécessaires au traitement de la demande, de la
              précommande, de la livraison ou à la création du compte.
            </p>

            <p className="mt-2">
              L&apos;absence de fourniture d&apos;une donnée obligatoire peut
              empêcher AJVEK de traiter la demande ou d&apos;exécuter la
              commande concernée.
            </p>
          </section>

          {/* =====================================================
              6. DESTINATAIRES
          ====================================================== */}

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              6. Destinataires et prestataires
            </h2>

            <p>
              Les données sont accessibles uniquement aux personnes et
              prestataires qui en ont besoin pour assurer le fonctionnement du
              service, le paiement et la livraison.
            </p>

            <p className="mt-3">AJVEK utilise notamment :</p>

            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Supabase pour l&apos;authentification et l&apos;hébergement de
                certaines données ;
              </li>

              <li>
                Stripe pour le traitement sécurisé des paiements ;
              </li>

              <li>
                Resend pour l&apos;envoi d&apos;emails transactionnels ;
              </li>

              <li>
                Sendcloud pour la gestion de certaines informations liées à la
                livraison et aux Points Relais ;
              </li>

              <li>
                Mondial Relay lorsque ce transporteur est sélectionné pour la
                livraison ;
              </li>

              <li>
                Vercel pour l&apos;hébergement du site et ses services associés.
              </li>
            </ul>

            <p className="mt-3">
              Les prestataires chargés de la livraison peuvent notamment
              recevoir les données nécessaires à l&apos;acheminement de la
              commande, telles que le nom, les coordonnées, l&apos;adresse ou
              le Point Relais choisi et le numéro de téléphone lorsque celui-ci
              est nécessaire au suivi de la livraison.
            </p>

            <p className="mt-3">
              Ces prestataires traitent les données dans la limite nécessaire à
              la fourniture de leurs services et selon leurs propres obligations
              réglementaires.
            </p>
          </section>

          {/* =====================================================
              7. TRANSFERTS INTERNATIONAUX
          ====================================================== */}

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              7. Transferts de données hors de l&apos;Union européenne
            </h2>

            <p>
              Certains prestataires utilisés par AJVEK peuvent être établis ou
              disposer d&apos;infrastructures situées en dehors de l&apos;Union
              européenne ou de l&apos;Espace économique européen.
            </p>

            <p className="mt-2">
              Lorsque des données font l&apos;objet d&apos;un transfert
              international, celui-ci doit être encadré conformément aux
              mécanismes prévus par la réglementation applicable en matière de
              protection des données personnelles.
            </p>
          </section>

          {/* =====================================================
              8. CONSERVATION
          ====================================================== */}

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              8. Durée de conservation
            </h2>

            <p>
              AJVEK conserve les données personnelles uniquement pendant la
              durée nécessaire aux finalités pour lesquelles elles ont été
              collectées, sous réserve des obligations légales de conservation
              applicables.
            </p>

            <p className="mt-2">
              Les données nécessaires à la gestion des commandes, des paiements,
              de la livraison et de la relation client sont conservées pendant
              la durée nécessaire à l&apos;exécution et au suivi de la relation
              commerciale.
            </p>

            <p className="mt-2">
              Certaines données relatives aux commandes et à la facturation
              peuvent ensuite être archivées pendant la durée imposée par les
              obligations légales, comptables ou fiscales applicables.
            </p>

            <p className="mt-2">
              Les documents comptables et pièces justificatives devant être
              conservés en application de la réglementation peuvent notamment
              être archivés pendant une durée de 10 ans.
            </p>

            <p className="mt-2">
              Les données liées à un compte utilisateur sont conservées pendant
              la durée d&apos;utilisation du compte puis supprimées ou
              anonymisées lorsqu&apos;elles ne sont plus nécessaires, sous
              réserve des données devant être conservées pour respecter une
              obligation légale ou assurer la constatation, l&apos;exercice ou
              la défense de droits en justice.
            </p>

            <p className="mt-2">
              Les données techniques et journaux nécessaires à la sécurité du
              site sont conservés pendant une durée proportionnée à leur
              finalité et aux besoins de sécurité du service.
            </p>
          </section>

          {/* =====================================================
              9. DROITS
          ====================================================== */}

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

              <li>
                droit à la portabilité lorsque celui-ci est applicable ;
              </li>

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
              Une preuve d&apos;identité peut être demandée lorsque cela est
              nécessaire pour vérifier l&apos;identité de la personne exerçant
              ses droits.
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

          {/* =====================================================
              10. COOKIES
          ====================================================== */}

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              10. Cookies, stockage local et mesure d&apos;audience
            </h2>

            <p>
              Le site utilise des mécanismes techniques nécessaires à son
              fonctionnement, notamment pour l&apos;authentification, la
              sécurité et la conservation temporaire de certaines informations
              liées à la précommande.
            </p>

            <p className="mt-2">
              Certaines informations du panier de précommande peuvent notamment
              être conservées localement dans le navigateur de
              l&apos;utilisateur afin de maintenir son panier entre plusieurs
              pages ou visites.
            </p>

            <p className="mt-2">
              AJVEK utilise également Vercel Web Analytics afin d&apos;obtenir
              des statistiques générales relatives à la fréquentation et aux
              performances du site.
            </p>

            <p className="mt-2">
              Lorsque l&apos;utilisation d&apos;un cookie ou d&apos;un autre
              traceur nécessite le consentement de l&apos;utilisateur, celui-ci
              doit être recueilli avant le dépôt ou la lecture du traceur
              concerné.
            </p>

            <p className="mt-2">
              Certains traceurs strictement nécessaires au fonctionnement du
              service ou certaines solutions de mesure d&apos;audience peuvent,
              sous les conditions prévues par la réglementation, être exemptés
              de consentement.
            </p>
          </section>

          {/* =====================================================
              11. SÉCURITÉ
          ====================================================== */}

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              11. Sécurité
            </h2>

            <p>
              AJVEK met en œuvre des mesures techniques et organisationnelles
              adaptées destinées à protéger les données personnelles contre la
              perte, l&apos;accès non autorisé, la modification, la destruction
              ou la divulgation illicite.
            </p>

            <p className="mt-2">
              Les paiements sont traités par Stripe et les clés ou identifiants
              sensibles utilisés par les services techniques du site ne sont
              pas destinés à être accessibles publiquement.
            </p>
          </section>

          {/* =====================================================
              12. MODIFICATIONS
          ====================================================== */}

          <section>
            <h2 className="mb-2 text-base font-display text-foreground">
              12. Modification de la politique de confidentialité
            </h2>

            <p>
              La présente politique peut être mise à jour afin de tenir compte
              de l&apos;évolution du site, des services proposés, des
              prestataires utilisés ou de la réglementation applicable.
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