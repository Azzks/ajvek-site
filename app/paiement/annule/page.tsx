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
      </p>

      <p className="mt-3 max-w-md text-sm text-stone">
        Tes articles sont toujours présents dans ton panier. Tu peux
        modifier ta commande ou relancer le paiement quand tu veux.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/panier"
          className="rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background transition hover:opacity-85"
        >
          Retour à mon panier
        </Link>

        <Link
          href="/catalogue"
          className="rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          Voir la collection
        </Link>
      </div>
    </main>
  );
}