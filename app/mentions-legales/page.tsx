export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
        <h1 className="mb-12 text-4xl font-semibold tracking-tight md:text-5xl">
          Mentions légales
        </h1>

        <div className="space-y-10 text-sm leading-7 text-neutral-300 md:text-base">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Éditeur du site
            </h2>

            <p>
              Le site <strong>ajvek.fr</strong> est édité par :
            </p>

            <p className="mt-4">
              <strong>Julien GORMAND – Entrepreneur individuel (EI)</strong>
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
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Contact
            </h2>

            <p>
              Email :{" "}
              <a
                href="mailto:ajvek.contact@gmail.com"
                className="underline underline-offset-4"
              >
                ajvek.contact@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Hébergement
            </h2>

            <p>
              Le site ajvek.fr est hébergé par Vercel Inc.
              <br />
              440 N Barranca Ave #4133
              <br />
              Covina, CA 91723
              <br />
              États-Unis
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Propriété intellectuelle
            </h2>

            <p>
              L’ensemble des éléments présents sur le site ajvek.fr, notamment
              les textes, créations graphiques, visuels, photographies, logos,
              motifs, designs et éléments du site, sont protégés par les règles
              applicables en matière de propriété intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Données personnelles
            </h2>

            <a
              href="/confidentialite"
              className="underline underline-offset-4"
            >
              Consulter la politique de confidentialité
            </a>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-white">
              Conditions générales de vente
            </h2>

            <a
              href="/cgv"
              className="underline underline-offset-4"
            >
              Consulter les CGV
            </a>
          </section>
        </div>
      </div>
    </main>
  );
}