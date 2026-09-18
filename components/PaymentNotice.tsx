export default function PaymentNotice() {
  return (
    <p className="mt-3 max-w-sm text-center text-[11px] text-stone">
      Paiement sécurisé par Stripe. La production sera lancée dès que le seuil
      de 10 précommandes payées sera atteint.
    </p>
  );
}