"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Product, Colorway } from "@/lib/products";

export default function PreorderForm({
  product,
  colorway,
  size,
}: {
  product: Product;
  colorway: Colorway;
  size: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!size) {
      setError("Choisis une taille avant de précommander.");
      return;
    }
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const preorder = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      product_slug: product.slug,
      product_name: product.name,
      color: colorway.label,
      size,
    };

    const { error: dbError } = await supabase.from("preorders").insert(preorder);

    if (dbError) {
      setSubmitting(false);
      setError("Une erreur est survenue, réessaie dans un instant.");
      return;
    }

    fetch("/api/notify-preorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preorder),
    }).catch(() => {});

    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return <p className="text-sm text-stone">Tu es inscrit ! On te recontacte dès que la production est lancée.</p>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 rounded-full border border-stone/40 px-6 py-3 text-xs uppercase tracking-widest text-stone transition hover:border-foreground hover:text-foreground"
      >
        Précommander
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3 rounded border border-surface p-4">
      <input required name="name" placeholder="Nom" className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground" />
      <input required name="email" type="email" placeholder="Email" className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground" />
      <input name="phone" placeholder="Téléphone (optionnel)" className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground" />
      {error && <p className="text-xs text-stone">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-full border border-foreground px-4 py-2 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        {submitting ? "Envoi..." : "Confirmer ma précommande"}
      </button>
    </form>
  );
}