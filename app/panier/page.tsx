"use client";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function PanierPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl">Ton panier est vide</h1>
        <Link href="/catalogue" className="text-sm uppercase tracking-widest text-stone hover:text-foreground">
          Voir la collection
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <h1 className="mb-10 text-center font-display text-3xl">Panier</h1>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 border-b border-surface pb-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-foreground">{item.name}</p>
              <p className="text-xs text-stone">
                {item.colorLabel} · Taille {item.size}
              </p>
              <button
                onClick={() => removeItem(item.id)}
                className="mt-1 text-[10px] uppercase tracking-widest text-stone underline hover:text-foreground"
              >
                Retirer
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-7 w-7 rounded-full border border-stone/40 text-xs">
                −
              </button>
              <span className="w-4 text-center text-sm">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-7 w-7 rounded-full border border-stone/40 text-xs">
                +
              </button>
            </div>
            <p className="w-20 text-right text-sm text-foreground">{(item.price * item.quantity).toFixed(2)} €</p>
          </div>
        ))}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm uppercase tracking-widest text-stone">Total</p>
          <p className="text-lg text-foreground">{totalPrice.toFixed(2)} €</p>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
  <span
    aria-disabled="true"
    className="w-full rounded-full border border-stone/40 px-6 py-3 text-center text-xs uppercase tracking-widest text-stone cursor-not-allowed"
  >
    Passer commande
  </span>
  <p className="text-center text-xs text-stone">
    Commande en ligne bientôt disponible — précommande ta pièce depuis sa fiche produit en attendant.
  </p>
</div>
      </div>
    </main>
  );
}