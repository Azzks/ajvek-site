import Link from "next/link";

export default function PaiementAnnulePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">
        Paiement annulé
      </p>

      <h1 className="font-display text-3xl sm:text-5xl">
        Aucun paiement effectué
      </h1>

      <p className="mt-6 max-w-md text-stone">
        Ton paiement a été annulé et aucune somme n&apos;a été débitée.
        Ta précommande n&apos;est donc pas comptabilisée dans l&apos;objectif
        de production.
      </p>

      <p className="mt-3 max-w-md text-sm text-stone">
        Tu peux retourner sur la fiche produit et relancer ta précommande
        quand tu le souhaites.
      </p>

      <Link
        href="/catalogue"
        className="mt-8 rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
      >
        Retour à la collection
      </Link>
    </main>
  );
}