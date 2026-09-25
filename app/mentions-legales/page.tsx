import Link from "next/link";

export const metadata = {
  title: "Mentions légales — AJVEK",
  description:
    "Mentions légales du site AJVEK et informations relatives à son éditeur.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-surface px-5 pb-14 pt-20 md:px-8 md:pb-20 md:pt-28">
        <div className="mx-auto max-w-4xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Informations légales
          </p>

          <h1 className="mt-6 font-display text-5xl leading-[0.9] tracking-[-0.04em] md:text-7xl">
            Mentions
            <br />
            légales.
          </h1>

          <p className="mt-7 text-sm text-stone">
            Dernière mise à jour : 25 septembre 2026
          </p>
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-4xl space-y-14 text-sm leading-7 text-stone md:text-[15px]">
          {/* 01 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              01
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              Éditeur du site
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                Le site{" "}
                <strong className="text-foreground">
                  ajvek.fr
                </strong>{" "}
                et l&apos;activité commerciale exercée sous le
                nom AJVEK sont exploités par :
              </p>

              <p className="mt-5">
                <strong className="text-foreground">
                  Julien GORMAND
                </strong>
                <br />
                Entrepreneur individuel (EI)
                <br />
                Nom commercial : AJVEK
                <br />
                95 avenue du Groupe Morgan
                <br />
                06700 Saint-Laurent-du-Var
                <br />
                France
              </p>

              <p className="mt-5">
                SIREN : 130 156 805
                <br />
                SIRET : 130 156 805 00017
                <br />
                Immatriculation : Registre national des
                entreprises (RNE)
              </p>

              <p className="mt-5">
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

              <p className="mt-5">
                L&apos;exploitation commerciale du site, la
                vente des produits et les obligations liées à
                l&apos;activité commerciale relèvent de
                l&apos;entreprise individuelle de Julien
                GORMAND.
              </p>
            </div>
          </section>

          {/* 02 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              02
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              Directeur de la publication
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                Le directeur de la publication du site est :
              </p>

              <p className="mt-3">
                <strong className="text-foreground">
                  Julien GORMAND
                </strong>
                , entrepreneur individuel exploitant AJVEK.
              </p>
            </div>
          </section>

          {/* 03 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              03
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              Conception et direction créative
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                AJVEK est un projet développé conjointement
                par Julien GORMAND et Alexis.
              </p>

              <p className="mt-4">
                La conception du site ajvek.fr, son
                développement, sa direction artistique, son
                identité visuelle, la création et la recherche
                des éléments graphiques ainsi que le
                développement de l&apos;univers créatif de la
                marque sont notamment assurés par Alexis,
                co-créateur du projet AJVEK.
              </p>

              <p className="mt-4">
                Cette mention ne confère pas à Alexis la
                qualité d&apos;associé de l&apos;entreprise
                individuelle de Julien GORMAND, laquelle
                demeure juridiquement exploitée par ce dernier.
              </p>
            </div>
          </section>

          {/* 04 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              04
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              Contact
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                Email :{" "}
                <a
                  href="mailto:ajvek.contact@gmail.com"
                  className="text-foreground underline underline-offset-4"
                >
                  ajvek.contact@gmail.com
                </a>
              </p>

              <p className="mt-2">
                Téléphone :{" "}
                <a
                  href="tel:+33673059556"
                  className="text-foreground underline underline-offset-4"
                >
                  +33 6 73 05 95 56
                </a>
              </p>

              <p className="mt-4">
                Pour toute demande concernant une commande
                ou l&apos;utilisation du site, vous pouvez
                également utiliser la page Contact.
              </p>

              <Link
                href="/contact"
                className="mt-4 inline-block text-[9px] uppercase tracking-[0.28em] text-foreground underline underline-offset-4"
              >
                Accéder à la page Contact →
              </Link>
            </div>
          </section>

          {/* 05 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              05
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              Hébergement
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                Le site ajvek.fr est hébergé par :
              </p>

              <p className="mt-4">
                <strong className="text-foreground">
                  Vercel Inc.
                </strong>
                <br />
                440 N Barranca Ave #4133
                <br />
                Covina, CA 91723
                <br />
                États-Unis
              </p>

              <p className="mt-4">
                Site internet :{" "}
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline underline-offset-4"
                >
                  vercel.com
                </a>
              </p>

              <p className="mt-4">
                Les informations de contact de l&apos;hébergeur
                sont accessibles depuis son site internet et
                ses pages légales officielles.
              </p>
            </div>
          </section>

          {/* 06 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              06
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              Propriété intellectuelle
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                Les éléments présents sur ajvek.fr, notamment
                les textes, créations graphiques,
                photographies, visuels, logos, motifs,
                designs, éléments d&apos;interface,
                développements et contenus spécifiques,
                peuvent être protégés par les règles
                applicables en matière de propriété
                intellectuelle.
              </p>

              <p className="mt-4">
                Les créations restent attribuées à leur auteur
                ou à leurs auteurs respectifs, sauf cession ou
                accord écrit contraire.
              </p>

              <p className="mt-4">
                Toute reproduction, représentation,
                adaptation, modification, diffusion ou
                exploitation non autorisée de ces éléments est
                interdite, sauf accord préalable du ou des
                titulaires des droits concernés.
              </p>
            </div>
          </section>

          {/* 07 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              07
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              Données personnelles
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                Les informations relatives à la collecte et au
                traitement des données personnelles sont
                détaillées dans la politique de
                confidentialité du site.
              </p>

              <Link
                href="/confidentialite"
                className="mt-4 inline-block text-[9px] uppercase tracking-[0.28em] text-foreground underline underline-offset-4"
              >
                Politique de confidentialité →
              </Link>
            </div>
          </section>

          {/* 08 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              08
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              Conditions générales de vente
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                Les conditions applicables aux commandes
                effectuées sur AJVEK sont disponibles dans
                les conditions générales de vente.
              </p>

              <Link
                href="/cgv"
                className="mt-4 inline-block text-[9px] uppercase tracking-[0.28em] text-foreground underline underline-offset-4"
              >
                Consulter les CGV →
              </Link>
            </div>
          </section>

          {/* 09 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              09
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              TVA
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                L&apos;entreprise relève actuellement de la
                franchise en base de TVA.
              </p>

              <p className="mt-3 text-foreground">
                TVA non applicable, article 293 B du Code
                général des impôts.
              </p>
            </div>
          </section>

          {/* 10 */}

          <section>
            <p className="text-[8px] uppercase tracking-[0.4em] text-stone/50">
              10
            </p>

            <h2 className="mt-3 font-display text-2xl text-foreground md:text-3xl">
              Mise à jour
            </h2>

            <div className="mt-6 border-t border-surface pt-6">
              <p>
                Dernière mise à jour : 25 septembre 2026.
              </p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}