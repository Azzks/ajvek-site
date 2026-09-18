import Link from "next/link";

export default function PaiementSuccesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">
        Paiement confirmé
      </p>

      <h1 className="font-display text-3xl sm:text-5xl">
        Précommande confirmée
      </h1>

      <p className="mt-6 max-w-md text-stone">
        Ton paiement a bien été reçu. Ta précommande AJVEK est maintenant
        confirmée et comptabilisée dans l&apos;objectif de production.
      </p>

      <p className="mt-3 max-w-md text-sm text-stone">
        La production sera lancée dès que le seuil de 10 précommandes payées
        sera atteint.
      </p>

      <p className="mt-3 max-w-md text-sm text-stone">
        Tu recevras également un email de confirmation avec le récapitulatif de
        ta précommande.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/catalogue"
          className="rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          Voir la collection
        </Link>

        <Link
          href="/"
          className="rounded-full border border-stone/40 px-6 py-3 text-xs uppercase tracking-widest text-stone transition hover:border-foreground hover:text-foreground"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}