"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";
import type { Product, Colorway } from "@/lib/products";
import MadeInFrance from "@/components/MadeInFrance";
import PaymentNotice from "@/components/PaymentNotice";

const PREORDER_GOAL = 10;

export default function PreorderForm({
  product,
  colorway,
  size,
}: {
  product: Product;
  colorway: Colorway;
  size: string | null;
}) {
  const { user, loading: authLoading } = useAuth();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetch("/api/preorder-count")
      .then((res) => res.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [user]);

  useEffect(() => {
    if (count !== null && count === PREORDER_GOAL) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  }, [count]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!size) {
      setError("Choisis une taille avant de précommander.");
      return;
    }

    if (!user) {
      setError("Connecte-toi pour précommander.");
      return;
    }

    if (!name.trim()) {
      setError("Indique ton nom.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("Ta session a expiré. Reconnecte-toi puis réessaie.");
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/create-preorder-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          product_slug: product.slug,
          product_name: product.name,
          color: colorway.label,
          size,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        setError(
          data.error ||
            "Impossible de lancer le paiement. Réessaie dans un instant."
        );
        setSubmitting(false);
        return;
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("[PreorderForm] Erreur checkout :", error);

      setError(
        "Impossible de lancer le paiement. Vérifie ta connexion et réessaie."
      );

      setSubmitting(false);
    }
  }

  const counterDisplay = (
    <div className="mt-2 mb-1">
      <p className="mb-1 text-[10px] uppercase tracking-widest text-stone">
        {count === null
          ? "Chargement..."
          : count < PREORDER_GOAL
            ? `${count}/${PREORDER_GOAL} précommandes payées`
            : `${count} précommandes payées`}
      </p>

      <div className="h-1 w-full overflow-hidden rounded-full bg-stone/20">
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{
            width:
              count === null
                ? "0%"
                : `${Math.min((count / PREORDER_GOAL) * 100, 100)}%`,
          }}
        />
      </div>

      {count !== null && count < PREORDER_GOAL && (
        <p className="mt-2 text-[10px] leading-relaxed text-stone">
          Production lancée à partir de {PREORDER_GOAL} précommandes payées.
        </p>
      )}

      {count !== null && count >= PREORDER_GOAL && (
        <p className="mt-2 text-[10px] uppercase tracking-widest text-foreground">
          Seuil de production atteint.
        </p>
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div>
        {counterDisplay}
        <MadeInFrance />
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        {counterDisplay}

        <p className="mt-2 mb-3 text-xs text-stone">
          Connecte-toi pour précommander cet article.
        </p>

        <div className="flex gap-3">
          <Link
            href="/connexion"
            className="rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
          >
            Se connecter
          </Link>

          <Link
            href="/inscription"
            className="rounded-full border border-stone/40 px-6 py-3 text-xs uppercase tracking-widest text-stone transition hover:border-foreground hover:text-foreground"
          >
            Créer un compte
          </Link>
        </div>

        <PaymentNotice />
        <MadeInFrance />
      </div>
    );
  }

  if (!open) {
    return (
      <div>
        {counterDisplay}

        <button
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="mt-2 rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          Précommander
        </button>

        <PaymentNotice />
        <MadeInFrance />
      </div>
    );
  }

  return (
    <div>
      {counterDisplay}

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex flex-col gap-3 rounded border border-surface p-4"
      >
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />

        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Téléphone (optionnel)"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />

        <div className="rounded border border-surface px-3 py-3">
          <p className="text-[10px] uppercase tracking-widest text-stone">
            Précommande
          </p>

          <p className="mt-1 text-sm text-foreground">
            {product.name}
          </p>

          <p className="mt-1 text-xs text-stone">
            {colorway.label}
            {size ? ` — Taille ${size}` : ""}
          </p>

          <p className="mt-2 text-sm text-foreground">
            {product.price}
          </p>
        </div>

        <p className="text-[10px] text-stone">
          Précommande liée au compte {user.email}
        </p>

        <p className="text-[10px] leading-relaxed text-stone">
          Tu seras redirigé vers Stripe pour effectuer le paiement sécurisé.
          Ta précommande sera comptabilisée une fois le paiement confirmé.
        </p>

        {error && (
          <p className="text-xs text-stone">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full border border-foreground px-4 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Redirection vers Stripe..." : "Payer ma précommande"}
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="text-[10px] uppercase tracking-widest text-stone underline underline-offset-4"
        >
          Annuler
        </button>
      </form>

      <PaymentNotice />
      <MadeInFrance />
    </div>
  );
}