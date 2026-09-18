export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <p className="mb-4 text-sm uppercase tracking-[0.35em] text-stone-500">
          AJVEK
        </p>

        <h1 className="mb-12 font-[var(--font-display)] text-4xl font-medium tracking-tight md:text-6xl">
          Mentions légales
        </h1>

        <div className="space-y-10 text-sm leading-7 text-stone-400 md:text-base">
          <section>
            <h2 className="mb-3 font-[var(--font-display)] text-2xl text-white">
              1. Éditeur du site
            </h2>

            <p>
              Le site <strong className="text-white">ajvek.fr</strong> est
              exploité commercialement par :
            </p>

            <p className="mt-4">
              <strong className="text-white">
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
            </p>

            <p className="mt-4">
              L’exploitation commerciale du site, la vente des produits et les
              obligations liées à l’activité de commerce relèvent de
              l’entreprise individuelle de Julien GORMAND.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[var(--font-display)] text-2xl text-white">
              2. Conception et direction créative
            </h2>

            <p>
              AJVEK est un projet développé conjointement par Julien GORMAND et
              Alexis.
            </p>

            <p className="mt-4">
              La conception du site ajvek.fr, son développement, sa direction
              artistique, son identité visuelle, la création et la recherche
              des éléments graphiques ainsi que le développement de l’univers
              créatif de la marque sont notamment assurés par Alexis,
              co-créateur du projet AJVEK.
            </p>

            <p className="mt-4">
              Cette mention ne confère pas à Alexis la qualité d’associé de
              l’entreprise individuelle de Julien GORMAND, laquelle demeure
              juridiquement exploitée par ce dernier.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[var(--font-display)] text-2xl text-white">
              3. Contact
            </h2>

            <p>
              Email :{" "}
              <a
                href="mailto:ajvek.contact@gmail.com"
                className="text-white underline underline-offset-4"
              >
                ajvek.contact@gmail.com
              </a>
            </p>

            <p className="mt-2">
              Pour toute demande concernant une commande, une précommande ou
              l’utilisation du site, vous pouvez également utiliser la page
              Contact.
            </p>

            <a
              href="/contact"
              className="mt-3 inline-block text-white underline underline-offset-4"
            >
              Accéder à la page Contact
            </a>
          </section>

          <section>
            <h2 className="mb-3 font-[var(--font-display)] text-2xl text-white">
              4. Hébergement
            </h2>

            <p>
              Le site ajvek.fr est hébergé par :
              <br />
              Vercel Inc.
              <br />
              440 N Barranca Ave #4133
              <br />
              Covina, CA 91723
              <br />
              États-Unis
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[var(--font-display)] text-2xl text-white">
              5. Propriété intellectuelle
            </h2>

            <p>
              Les éléments présents sur ajvek.fr, notamment les textes,
              créations graphiques, photographies, visuels, logos, motifs,
              designs, éléments d’interface, développements et contenus
              spécifiques, peuvent être protégés par les règles applicables en
              matière de propriété intellectuelle.
            </p>

            <p className="mt-4">
              Les créations restent attribuées à leur auteur ou à leurs auteurs
              respectifs, sauf cession ou accord écrit contraire.
            </p>

            <p className="mt-4">
              Toute reproduction, représentation, adaptation, modification,
              diffusion ou exploitation non autorisée de ces éléments est
              interdite, sauf accord préalable du ou des titulaires des droits
              concernés.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[var(--font-display)] text-2xl text-white">
              6. Données personnelles
            </h2>

            <p>
              Les informations relatives à la collecte et au traitement des
              données personnelles sont détaillées dans la politique de
              confidentialité du site.
            </p>

            <a
              href="/confidentialite"
              className="mt-3 inline-block text-white underline underline-offset-4"
            >
              Consulter la politique de confidentialité
            </a>
          </section>

          <section>
            <h2 className="mb-3 font-[var(--font-display)] text-2xl text-white">
              7. Conditions générales de vente
            </h2>

            <p>
              Les conditions applicables aux commandes et précommandes
              effectuées sur AJVEK sont disponibles dans les conditions
              générales de vente.
            </p>

            <a
              href="/cgv"
              className="mt-3 inline-block text-white underline underline-offset-4"
            >
              Consulter les CGV
            </a>
          </section>

          <section>
            <h2 className="mb-3 font-[var(--font-display)] text-2xl text-white">
              8. TVA
            </h2>

            <p>
              L’entreprise relève actuellement de la franchise en base de TVA.
              TVA non applicable, article 293 B du Code général des impôts.
            </p>
          </section>

          <section>
            <h2 className="mb-3 font-[var(--font-display)] text-2xl text-white">
              9. Mise à jour
            </h2>

            <p>Dernière mise à jour : 18 septembre 2026.</p>
          </section>
        </div>
      </div>
    </main>
  );
}