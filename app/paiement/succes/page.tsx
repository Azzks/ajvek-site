export default function PaiementSuccesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-6 text-center">
      <p className="mb-4 text-xs tracking-[0.3em] text-stone uppercase">
        Paiement confirmé
      </p>
      <h1 className="text-3xl sm:text-5xl font-display">Merci !</h1>
      <p className="mt-6 max-w-md text-stone">
        Ton paiement a bien été reçu. On te recontacte très vite avec les
        détails d&apos;expédition.
      </p>
    </main>
  );
}