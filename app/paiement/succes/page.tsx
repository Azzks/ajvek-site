import Link from "next/link";

import ClearPreorderCart from "@/components/ClearPreorderCart";

export default function PaiementSuccesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <ClearPreorderCart />

      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">
        Paiement confirmé
      </p>

      <h1 className="font-display text-3xl sm:text-5xl">
        Commande confirmée
      </h1>

      <p className="mt-6 max-w-md text-stone">
        Ton paiement a bien été reçu. Ta commande AJVEK est maintenant
        confirmée.
      </p>

      <p className="mt-3 max-w-md text-sm text-stone">
        Ta pièce est réservée. Tu peux suivre l&apos;avancement de ta commande
        directement depuis ton espace AJVEK.
      </p>

      <p className="mt-3 max-w-md text-sm text-stone">
        Tu vas également recevoir un email de confirmation avec le
        récapitulatif de ta commande.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/mes-commandes"
          className="rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background transition hover:opacity-85"
        >
          Suivre ma commande
        </Link>

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