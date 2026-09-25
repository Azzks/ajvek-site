import Link from "next/link";

export const metadata = {
  title: "Conditions générales de vente — AJVEK",
};

export default function CGVPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-stone">
          AJVEK
        </p>

        <h1 className="mb-8 font-display text-3xl">
          Conditions générales de vente
        </h1>

        <div className="space-y-8 text-sm leading-relaxed text-stone">
          <p>Dernière mise à jour : 25 septembre 2026</p>

          {/* =====================================================
              1. IDENTITÉ DU VENDEUR
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
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

          {/* =====================================================
              2. OBJET
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              2. Objet
            </h2>

            <p>
              Les présentes conditions générales de vente définissent les
              droits et obligations applicables aux ventes de produits AJVEK
              réalisées sur le site ajvek.fr.
            </p>

            <p className="mt-2">
              Toute commande implique l&apos;acceptation des présentes
              conditions générales de vente dans leur version en vigueur au
              moment de la validation de la commande.
            </p>
          </section>

          {/* =====================================================
              3. PRODUITS
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              3. Produits
            </h2>

            <p>
              AJVEK commercialise principalement des vêtements streetwear,
              notamment des tee-shirts issus de collections originales et
              proposés en séries limitées.
            </p>

            <p className="mt-2">
              Les caractéristiques essentielles de chaque produit, notamment
              son design, sa couleur, les tailles proposées, sa composition et
              son prix, sont présentées sur sa fiche produit.
            </p>

            <p className="mt-2">
              Les photographies, représentations 3D, illustrations et autres
              visuels ont pour objectif de présenter les produits aussi
              fidèlement que possible.
            </p>

            <p className="mt-2">
              De légères différences de couleur, de texture, de positionnement
              ou de rendu peuvent néanmoins exister en raison notamment de
              l&apos;affichage des écrans et des procédés de fabrication,
              d&apos;impression ou de broderie.
            </p>
          </section>

          {/* =====================================================
              4. PRIX
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              4. Prix
            </h2>

            <p>
              Les prix des produits sont indiqués en euros.
            </p>

            <p className="mt-2">
              AJVEK relève actuellement de la franchise en base de TVA. La TVA
              n&apos;est donc pas facturée au client.
            </p>

            <p className="mt-2">
              Les frais de livraison applicables sont indiqués au client avant
              la validation définitive de sa commande.
            </p>

            <p className="mt-2">
              Pour les livraisons actuellement proposées en France
              métropolitaine :
            </p>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Livraison en Point Relais Mondial Relay : 4,90 €</li>
              <li>Livraison à domicile : 7,90 €</li>
              <li>Livraison offerte à partir de 3 vêtements commandés</li>
            </ul>

            <p className="mt-2">
              AJVEK peut modifier ses prix ou ses frais de livraison pour les
              commandes futures. Les montants applicables à une commande sont
              ceux affichés au client avant sa validation.
            </p>
          </section>

          {/* =====================================================
              5. DISPONIBILITÉ ET STOCK
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              5. Disponibilité et stock
            </h2>

            <p>
              Les produits AJVEK sont proposés à la vente dans la limite des
              stocks disponibles.
            </p>

            <p className="mt-2">
              La disponibilité peut varier selon le produit, la couleur et la
              taille sélectionnés.
            </p>

            <p className="mt-2">
              Lorsqu&apos;une taille ou une variante est indiquée comme
              indisponible ou épuisée, elle ne peut normalement plus être
              commandée.
            </p>

            <p className="mt-2">
              La présence d&apos;un produit dans le panier ne constitue pas à
              elle seule une réservation définitive du stock.
            </p>

            <p className="mt-2">
              En cas d&apos;indisponibilité exceptionnelle constatée après le
              paiement, notamment en raison d&apos;une erreur de stock ou
              d&apos;un incident technique, AJVEK en informe le client dans les
              meilleurs délais et procède, lorsque la commande ne peut être
              exécutée, au remboursement des sommes dues pour le produit
              concerné.
            </p>
          </section>

          {/* =====================================================
              6. PASSAGE DE LA COMMANDE
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              6. Passage et validation de la commande
            </h2>

            <p>
              Le client sélectionne le produit souhaité, sa couleur, sa taille
              et sa quantité puis l&apos;ajoute à son panier.
            </p>

            <p className="mt-2">
              Avant le paiement, le client peut vérifier les éléments de sa
              commande et les informations communiquées.
            </p>

            <p className="mt-2">
              Le client sélectionne également le mode de livraison proposé par
              AJVEK.
            </p>

            <p className="mt-2">
              Pour une livraison en Point Relais, le client sélectionne le
              Point Relais proposé lors du parcours de commande.
            </p>

            <p className="mt-2">
              Le client est responsable de l&apos;exactitude des informations
              communiquées, notamment son nom, son adresse électronique, son
              numéro de téléphone, son adresse de livraison et, le cas échéant,
              le Point Relais sélectionné.
            </p>

            <p className="mt-2">
              La commande est définitivement prise en compte après validation
              du paiement, sous réserve de la confirmation de la transaction et
              de la disponibilité du produit.
            </p>
          </section>

          {/* =====================================================
              7. PAIEMENT
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              7. Paiement
            </h2>

            <p>
              Les paiements en ligne sont traités par le prestataire de
              paiement sécurisé Stripe.
            </p>

            <p className="mt-2">
              AJVEK ne conserve pas les numéros complets de cartes bancaires
              utilisés lors du paiement.
            </p>

            <p className="mt-2">
              La commande est considérée comme payée lorsque le paiement est
              effectivement accepté par le prestataire de paiement.
            </p>

            <p className="mt-2">
              En cas de refus, d&apos;annulation ou d&apos;échec du paiement,
              la commande n&apos;est pas considérée comme payée.
            </p>

            <p className="mt-2">
              Une confirmation de commande peut être transmise au client par
              voie électronique après validation du paiement.
            </p>
          </section>

          {/* =====================================================
              8. OPÉRATIONS PROMOTIONNELLES
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              8. Opérations promotionnelles
            </h2>

            <p>
              AJVEK peut organiser ponctuellement des opérations
              promotionnelles, concours, tirages au sort ou objectifs
              commerciaux.
            </p>

            <p className="mt-2">
              Ces opérations peuvent notamment être associées à un nombre
              déterminé de commandes payées.
            </p>

            <p className="mt-2">
              Lorsqu&apos;une opération fait référence aux 10 premières
              commandes, une commande payée est comptabilisée comme une
              commande, indépendamment du nombre d&apos;articles qu&apos;elle
              contient, sauf indication contraire dans les conditions de
              l&apos;opération.
            </p>

            <p className="mt-2">
              Un objectif promotionnel affiché sur le site ne conditionne pas
              la fabrication, la disponibilité ou l&apos;expédition des
              produits, sauf indication expresse contraire communiquée avant
              la commande.
            </p>

            <p className="mt-2">
              Les modalités particulières d&apos;une opération sont précisées
              sur le site ou dans les conditions spécifiques correspondantes.
            </p>

            <Link
              href="/conditions-tirage"
              className="mt-2 inline-block text-foreground underline underline-offset-4"
            >
              Consulter les conditions du tirage au sort
            </Link>
          </section>

          {/* =====================================================
              9. LIVRAISON
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              9. Livraison
            </h2>

            <p>
              Les commandes sont actuellement livrées en France selon les
              modes de livraison proposés au moment de la commande.
            </p>

            <p className="mt-2">
              Le client peut notamment choisir, lorsque ces options sont
              disponibles, entre :
            </p>

            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>une livraison en Point Relais Mondial Relay ;</li>
              <li>une livraison à domicile.</li>
            </ul>

            <p className="mt-2">
              En cas de livraison à domicile, la commande est expédiée à
              l&apos;adresse renseignée par le client.
            </p>

            <p className="mt-2">
              En cas de livraison en Point Relais, la commande est expédiée au
              Point Relais sélectionné par le client.
            </p>

            <p className="mt-2">
              Le client doit vérifier l&apos;exactitude de ses coordonnées et
              du lieu de livraison avant la validation de la commande.
            </p>

            <p className="mt-2">
              La date ou le délai de livraison applicable est indiqué au client
              avant la conclusion de la commande.
            </p>

            <p className="mt-2">
              En cas de retard de livraison, le consommateur conserve
              l&apos;ensemble des droits qui lui sont reconnus par la
              réglementation applicable.
            </p>
          </section>

          {/* =====================================================
              10. RÉCEPTION
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              10. Réception de la commande
            </h2>

            <p>
              Lors de la réception de sa commande, le client est invité à
              vérifier l&apos;état des produits reçus.
            </p>

            <p className="mt-2">
              En cas de produit manquant, endommagé ou manifestement différent
              du produit commandé, le client est invité à contacter AJVEK dans
              les meilleurs délais afin de permettre le traitement de sa
              demande, sans préjudice de ses garanties légales.
            </p>
          </section>

          {/* =====================================================
              11. RÉTRACTATION
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              11. Droit de rétractation
            </h2>

            <p>
              Lorsque le droit de rétractation est applicable, le consommateur
              dispose d&apos;un délai de 14 jours à compter de la réception du
              produit pour exercer ce droit, sans avoir à motiver sa décision.
            </p>

            <p className="mt-2">
              Pour exercer son droit de rétractation, le client doit informer
              AJVEK de sa décision au moyen d&apos;une déclaration dénuée
              d&apos;ambiguïté ou en utilisant le formulaire type figurant à la
              fin des présentes CGV.
            </p>

            <p className="mt-2">
              La demande peut être adressée à :
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
              Après avoir communiqué sa décision de se rétracter, le
              consommateur doit restituer le produit dans le délai légal
              applicable.
            </p>

            <p className="mt-2">
              Le consommateur peut manipuler le produit dans la mesure
              nécessaire pour en établir la nature, les caractéristiques et le
              bon fonctionnement. Sa responsabilité peut être engagée en cas de
              dépréciation résultant de manipulations excédant ce qui est
              nécessaire à cette vérification.
            </p>

            <p className="mt-2">
              Les frais directs de retour restent à la charge du client, sauf
              lorsque le produit livré est défectueux ou non conforme, ou
              lorsqu&apos;AJVEK indique expressément prendre ces frais en
              charge.
            </p>
          </section>

          {/* =====================================================
              12. REMBOURSEMENT
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              12. Remboursement après rétractation
            </h2>

            <p>
              Lorsque le droit de rétractation est valablement exercé, AJVEK
              rembourse les sommes dues conformément à la réglementation
              applicable.
            </p>

            <p className="mt-2">
              Le remboursement comprend, dans les conditions prévues par la
              réglementation, les frais de livraison standard initialement
              facturés. Les éventuels coûts supplémentaires résultant du choix
              d&apos;un mode de livraison plus coûteux que le mode standard
              proposé ne sont pas nécessairement remboursés.
            </p>

            <p className="mt-2">
              Le remboursement est effectué en utilisant le même moyen de
              paiement que celui utilisé pour la transaction initiale, sauf
              accord exprès du client pour un autre moyen de remboursement ne
              générant pas de frais pour lui.
            </p>

            <p className="mt-2">
              AJVEK peut différer le remboursement jusqu&apos;à récupération du
              produit ou jusqu&apos;à réception d&apos;une preuve de son
              expédition lorsque la réglementation le permet.
            </p>
          </section>

          {/* =====================================================
              13. PRODUITS PERSONNALISÉS
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              13. Produits personnalisés
            </h2>

            <p>
              Lorsque AJVEK propose un produit confectionné selon les
              spécifications du client ou clairement personnalisé, le droit de
              rétractation peut ne pas être applicable conformément aux
              exceptions prévues par la réglementation.
            </p>

            <p className="mt-2">
              Lorsque cette exception s&apos;applique, le client en est informé
              avant la validation de sa commande.
            </p>
          </section>

          {/* =====================================================
              14. GARANTIES LÉGALES
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              14. Garanties légales
            </h2>

            <p>
              Le vendeur répond des garanties légales applicables aux produits
              vendus.
            </p>

            <div className="mt-4 rounded-xl border border-stone/20 p-4">
              <p className="font-medium text-foreground">
                Garantie légale de conformité
              </p>

              <p className="mt-3">
                Le consommateur dispose d&apos;un délai de deux ans à compter
                de la délivrance du bien pour obtenir la mise en œuvre de la
                garantie légale de conformité en cas d&apos;apparition d&apos;un
                défaut de conformité.
              </p>

              <p className="mt-2">
                La garantie légale de conformité permet notamment, dans les
                conditions prévues par le Code de la consommation, d&apos;obtenir
                la réparation ou le remplacement du bien sans frais et dans le
                délai légal applicable.
              </p>

              <p className="mt-2">
                Dans les situations prévues par la loi, le consommateur peut
                également obtenir une réduction du prix ou la résolution du
                contrat.
              </p>

              <p className="mt-4 font-medium text-foreground">
                Garantie des vices cachés
              </p>

              <p className="mt-3">
                Le consommateur bénéficie également de la garantie légale des
                vices cachés prévue par les articles 1641 à 1649 du Code civil.
              </p>

              <p className="mt-2">
                Cette garantie peut notamment permettre au consommateur, dans
                les conditions prévues par la loi, d&apos;obtenir une réduction
                du prix s&apos;il conserve le bien ou un remboursement contre
                restitution du bien.
              </p>
            </div>

            <p className="mt-4">
              Le professionnel répondant de ces garanties est :
            </p>

            <p className="mt-3">
              <strong className="text-foreground">
                Julien GORMAND – Entrepreneur individuel – AJVEK
              </strong>
              <br />
              95 avenue du Groupe Morgan
              <br />
              06700 Saint-Laurent-du-Var
              <br />
              France
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

          {/* =====================================================
              15. RESPONSABILITÉ
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              15. Responsabilité
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
              normale, sous réserve des dispositions légales impératives
              applicables.
            </p>
          </section>

          {/* =====================================================
              16. PROPRIÉTÉ INTELLECTUELLE
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              16. Propriété intellectuelle
            </h2>

            <p>
              Les créations, designs, motifs, photographies, textes, logos,
              éléments graphiques et contenus utilisés par AJVEK sont protégés
              par les règles applicables en matière de propriété
              intellectuelle.
            </p>

            <p className="mt-2">
              Toute reproduction, diffusion, modification ou exploitation non
              autorisée est interdite, sauf autorisation préalable du ou des
              titulaires des droits concernés.
            </p>
          </section>

          {/* =====================================================
              17. DONNÉES PERSONNELLES
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              17. Données personnelles
            </h2>

            <p>
              Les modalités relatives à la collecte et au traitement des
              données personnelles sont présentées dans la politique de
              confidentialité d&apos;AJVEK.
            </p>

            <Link
              href="/confidentialite"
              className="mt-2 inline-block text-foreground underline underline-offset-4"
            >
              Consulter la politique de confidentialité
            </Link>
          </section>

          {/* =====================================================
              18. RÉCLAMATIONS
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              18. Réclamations
            </h2>

            <p>
              Pour toute question ou réclamation concernant une commande, un
              paiement, une livraison ou un produit, le client peut contacter
              AJVEK à :
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

          {/* =====================================================
              19. MÉDIATION
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              19. Médiation de la consommation
            </h2>

            <p>
              Conformément aux dispositions applicables à la médiation de la
              consommation, le consommateur peut, après une réclamation écrite
              préalable auprès d&apos;AJVEK restée sans solution satisfaisante,
              recourir gratuitement au médiateur de la consommation dont relève
              AJVEK.
            </p>

            <div className="mt-4 rounded-xl border border-stone/20 p-4">
              <p className="font-medium text-foreground">
                À COMPLÉTER AVANT L&apos;OUVERTURE DES VENTES
              </p>

              <p className="mt-2">
                Nom du médiateur :
                <br />
                Adresse postale :
                <br />
                Site internet :
              </p>
            </div>
          </section>

          {/* =====================================================
              20. DROIT APPLICABLE
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              20. Droit applicable
            </h2>

            <p>
              Les présentes conditions générales de vente sont soumises au
              droit français.
            </p>

            <p className="mt-2">
              Les dispositions impératives protégeant le consommateur demeurent
              applicables.
            </p>
          </section>

          {/* =====================================================
              21. MODIFICATION DES CGV
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              21. Modification des CGV
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

          {/* =====================================================
              22. FORMULAIRE DE RÉTRACTATION
          ====================================================== */}

          <section>
            <h2 className="mb-2 font-display text-base text-foreground">
              22. Formulaire type de rétractation
            </h2>

            <p>
              Le présent formulaire peut être utilisé si le consommateur
              souhaite exercer son droit de rétractation.
            </p>

            <div className="mt-4 rounded-xl border border-stone/20 p-4">
              <p>
                À l&apos;attention de :
                <br />
                Julien GORMAND – AJVEK
                <br />
                95 avenue du Groupe Morgan
                <br />
                06700 Saint-Laurent-du-Var
                <br />
                France
                <br />
                ajvek.contact@gmail.com
              </p>

              <p className="mt-4">
                Je vous informe par la présente de ma décision de me rétracter
                du contrat portant sur la vente du ou des produits suivants :
              </p>

              <p className="mt-4">Produit(s) :</p>
              <p>Date de commande :</p>
              <p>Date de réception :</p>
              <p>Nom du consommateur :</p>
              <p>Adresse du consommateur :</p>
              <p>Date :</p>
              <p>
                Signature, uniquement en cas d&apos;envoi du formulaire sur
                papier :
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}