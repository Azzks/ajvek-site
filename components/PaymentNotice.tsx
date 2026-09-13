export default function PaymentNotice() {
  return (
    <p className="mt-3 max-w-sm text-center text-[11px] text-stone">
      Le paiement sécurisé n&apos;est pas encore disponible sur le site. En
      attendant, tu peux passer par notre boutique{" "}
      <a
        href="https://www.vinted.fr/brand/34179442-ajvek"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-foreground"
      >
        Vinted
      </a>
      .
    </p>
  );
}
