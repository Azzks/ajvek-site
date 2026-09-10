"use client";
import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import type { Product, Colorway } from "@/lib/products";

const PREORDER_LIMIT = 20;

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
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/preorder-count")
      .then((res) => res.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  const isFull = count !== null && count >= PREORDER_LIMIT;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!size) {
      setError("Choisis une taille avant de précommander.");
      return;
    }
    if (isFull) {
      setError("Les précommandes sont complètes.");
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

    fetch("/api/notify-order/notify-preorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preorder),
    }).catch(() => {});

    const newCount = (count ?? 0) + 1;
    setCount(newCount);

    if (newCount >= PREORDER_LIMIT) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }

    setSubmitting(false);
    setDone(true);
  }

  const counterDisplay = (
    <div className="mt-2 mb-1">
      <p className="mb-1 text-[10px] uppercase tracking-widest text-stone">
        {count === null
          ? "Chargement..."
          : `${Math.min(count, PREORDER_LIMIT)}/${PREORDER_LIMIT} précommandes`}
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-stone/20">
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{
            width:
              count === null
                ? "0%"
                : `${Math.min((count / PREORDER_LIMIT) * 100, 100)}%`,
          }}
        />
      </div>
    </div>
  );

  if (done) {
    return (
      <div>
        {counterDisplay}
        <p className="text-sm text-stone">
          Tu es inscrit ! On te recontacte dès que la production est lancée.
        </p>
      </div>
    );
  }

  if (isFull) {
    return (
      <div>
        {counterDisplay}
        <p className="mt-2 text-xs uppercase tracking-widest text-stone">
          Précommandes complètes pour ce lancement.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div>
        {counterDisplay}
        <button
          onClick={() => setOpen(true)}
          className="mt-2 rounded-full border border-stone/40 px-6 py-3 text-xs uppercase tracking-widest text-stone transition hover:border-foreground hover:text-foreground"
        >
          Précommander
        </button>
      </div>
    );
  }

  return (
    <div>
      {counterDisplay}
      <form
        onSubmit={handleSubmit}
        className="mt-2 flex flex-col gap-3 rounded border border-surface p-4"
      >
        <input
          required
          name="name"
          placeholder="Nom"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <input
          required
          name="email"
          type="email"
          placeholder="Email"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <input
          name="phone"
          placeholder="Téléphone (optionnel)"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        {error && <p className="text-xs text-stone">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full border border-foreground px-4 py-2 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          {submitting ? "Envoi..." : "Confirmer ma précommande"}
        </button>
      </form>
    </div>
  );
}