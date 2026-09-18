"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthContext";
import type { Product, Colorway } from "@/lib/products";
import MadeInFrance from "@/components/MadeInFrance";

const PREORDER_GOAL = 10;
const STORAGE_KEY = "ajvek-preorder-cart";

type PreorderCartItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
};

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

  const [count, setCount] = useState<number | null>(null);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/preorder-count")
      .then((res) => res.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(0));
  }, []);

  useEffect(() => {
    updateCartCount();
  }, []);

  function getCart(): PreorderCartItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) return [];

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function updateCartCount() {
    const cart = getCart();

    const total = cart.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

    setCartCount(total);
  }

  function addToPreorder() {
    setError(null);
    setAdded(false);

    if (!size) {
      setError("Choisis une taille avant d'ajouter le vêtement.");
      return;
    }

    const cart = getCart();

    const existingIndex = cart.findIndex(
      (item) =>
        item.product_slug === product.slug &&
        item.color === colorway.label &&
        item.size === size
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        product_slug: product.slug,
        product_name: product.name,
        color: colorway.label,
        size,
        quantity: 1,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));

    updateCartCount();
    setAdded(true);
  }

  const thresholdReached =
    count !== null && count >= PREORDER_GOAL;

  const progress =
    count === null
      ? 0
      : Math.min((count / PREORDER_GOAL) * 100, 100);

  const counterDisplay = (
    <div className="mt-2 mb-5">
      <p className="mb-2 text-[10px] uppercase tracking-widest text-stone">
        {count === null
          ? "Chargement..."
          : thresholdReached
            ? `${count} précommandes payées`
            : `${count}/${PREORDER_GOAL} précommandes payées`}
      </p>

      <div className="h-1 w-full overflow-hidden rounded-full bg-stone/20">
        <div
          className="h-full rounded-full bg-foreground transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {count !== null && !thresholdReached && (
        <p className="mt-3 text-[10px] leading-relaxed text-stone">
          Production lancée à partir de 10 vêtements précommandés et payés.
        </p>
      )}

      {thresholdReached && (
        <p className="mt-3 text-[10px] uppercase tracking-widest text-foreground">
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

        <p className="mb-3 text-xs text-stone">
          Connecte-toi pour ajouter ce vêtement à ta précommande.
        </p>

        <div className="flex flex-wrap gap-3">
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

        <MadeInFrance />
      </div>
    );
  }

  return (
    <div>
      {counterDisplay}

      <button
        type="button"
        onClick={addToPreorder}
        className="w-full rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
      >
        Ajouter à ma précommande
      </button>

      {error && (
        <p className="mt-3 text-xs text-stone">
          {error}
        </p>
      )}

      {added && (
        <div className="mt-4 rounded border border-surface p-4">
          <p className="text-xs text-foreground">
            {product.name} — {colorway.label} — Taille {size}
          </p>

          <p className="mt-1 text-xs text-stone">
            Ajouté à ta précommande.
          </p>

          <Link
            href="/precommande"
            className="mt-4 inline-block rounded-full bg-foreground px-5 py-2.5 text-[10px] uppercase tracking-widest text-background"
          >
            Voir ma précommande ({cartCount})
          </Link>
        </div>
      )}

      {!added && cartCount > 0 && (
        <Link
          href="/precommande"
          className="mt-4 inline-block text-[10px] uppercase tracking-widest text-stone underline underline-offset-4"
        >
          Ma précommande — {cartCount} vêtement
          {cartCount > 1 ? "s" : ""}
        </Link>
      )}

      <MadeInFrance />
    </div>
  );
}