import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs uppercase tracking-widest text-stone">Erreur 404</p>
      <h1 className="font-display text-4xl">Cette page n&apos;existe pas</h1>
      <p className="max-w-sm text-sm text-stone">
        Le lien est peut-être cassé, ou la page a été déplacée.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
      >
        Retour à l&apos;accueil
      </Link>
    </main>
  );
}