"use client";
import { useState } from "react";
import { useCart } from "@/components/CartContext";
import { supabase } from "@/lib/supabase";

export default function CommandePage() {
  const { items, totalPrice, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const orderData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      address: formData.get("address") as string,
      postal_code: formData.get("postal_code") as string,
      city: formData.get("city") as string,
      items,
      total_price: totalPrice,
    };

    const { error } = await supabase.from("orders").insert(orderData);

    if (error) {
      setSubmitting(false);
      setError("Une erreur est survenue, réessaie dans un instant.");
      return;
    }

    // On envoie la notif par email, sans bloquer la confirmation si ça échoue
    fetch("/api/notify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    }).catch(() => {});

    setSubmitting(false);
    clearCart();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl">Merci !</h1>
        <p className="max-w-md text-stone">
          Ta commande est enregistrée. Le paiement en ligne arrivera bientôt — on te recontactera pour finaliser en attendant.
        </p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl">Ton panier est vide</h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-16">
      <h1 className="mb-10 text-center font-display text-3xl">Commande</h1>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-4">
        <input required name="name" placeholder="Nom complet" className="rounded border border-stone/40 bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground" />
        <input required name="email" type="email" placeholder="Email" className="rounded border border-stone/40 bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground" />
        <input required name="address" placeholder="Adresse" className="rounded border border-stone/40 bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground" />
        <div className="flex gap-4">
          <input required name="postal_code" placeholder="Code postal" className="w-1/2 rounded border border-stone/40 bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground" />
          <input required name="city" placeholder="Ville" className="w-1/2 rounded border border-stone/40 bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground" />
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-surface pt-4">
          <p className="text-sm uppercase tracking-widest text-stone">Total</p>
          <p className="text-lg text-foreground">{totalPrice.toFixed(2)} €</p>
        </div>

        {error && <p className="text-center text-xs text-stone">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background disabled:opacity-50"
        >
          {submitting ? "Envoi..." : "Valider la commande"}
        </button>
        <p className="text-center text-[10px] text-stone">
          Paiement en ligne pas encore actif — commande enregistrée pour l&apos;instant.
        </p>
      </form>
    </main>
  );
}