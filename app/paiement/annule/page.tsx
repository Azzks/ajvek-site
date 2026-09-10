export default function PaiementAnnulePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-6 text-center">
      <p className="mb-4 text-xs tracking-[0.3em] text-stone uppercase">
        Paiement annulé
      </p>
      <h1 className="text-3xl sm:text-5xl font-display">Pas de souci</h1>
      <p className="mt-6 max-w-md text-stone">
        Le paiement a été annulé, aucune somme n&apos;a été débitée. Tu peux
        réessayer quand tu veux avec le même lien reçu par email.
      </p>
    </main>
  );
}