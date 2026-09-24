"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";

import { useAuth } from "@/components/AuthContext";
import type {
  Product,
  Colorway,
} from "@/lib/products";

import MadeInFrance from "@/components/MadeInFrance";

const PREORDER_GOAL = 10;

const STORAGE_KEY =
  "ajvek-preorder-cart";

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
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [count, setCount] =
    useState<number | null>(null);

  const [added, setAdded] =
    useState(false);

  const [cartCount, setCartCount] =
    useState(0);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    fetch("/api/preorder-count")
      .then((res) => res.json())
      .then((data) =>
        setCount(data.count ?? 0)
      )
      .catch(() => setCount(0));
  }, []);

  useEffect(() => {
    updateCartCount();
  }, []);

  function getCart(): PreorderCartItem[] {
    try {
      const stored =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!stored) return [];

      const parsed =
        JSON.parse(stored);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }

  function updateCartCount() {
    const cart = getCart();

    const total = cart.reduce(
      (sum, item) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );

    setCartCount(total);
  }

  function addToPreorder() {
    setError(null);
    setAdded(false);

    if (!size) {
      setError(
        "Choisis une taille avant d'ajouter le vêtement."
      );

      return;
    }

    const cart = getCart();

    const existingIndex =
      cart.findIndex(
        (item) =>
          item.product_slug ===
            product.slug &&
          item.color ===
            colorway.label &&
          item.size === size
      );

    if (existingIndex >= 0) {
      cart[existingIndex]
        .quantity += 1;
    } else {
      cart.push({
        product_slug:
          product.slug,

        product_name:
          product.name,

        color:
          colorway.label,

        size,

        quantity: 1,
      });
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(cart)
    );

    updateCartCount();
    setAdded(true);
  }

  const thresholdReached =
    count !== null &&
    count >= PREORDER_GOAL;

  const progress =
    count === null
      ? 0
      : Math.min(
          (count / PREORDER_GOAL) *
            100,
          100
        );

  const counterDisplay = (
    <div>
      <div className="flex items-end justify-between gap-4">
        <p className="text-[10px] uppercase tracking-[0.28em] text-stone">
          Précommandes payées
        </p>

        <p className="font-display text-lg text-foreground">
          {count === null
            ? "—"
            : thresholdReached
              ? `${count}`
              : `${count} / ${PREORDER_GOAL}`}
        </p>
      </div>

      <div className="mt-3 h-[2px] w-full overflow-hidden bg-stone/20">
        <div
          className="h-full bg-foreground transition-all duration-700"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <p className="mt-3 text-[10px] leading-5 text-stone">
        {count === null
          ? "Chargement..."
          : thresholdReached
            ? "Le seuil de production est atteint."
            : "Production lancée dès que 10 précommandes payées sont atteintes."}
      </p>
    </div>
  );

  if (authLoading) {
    return (
      <div className="space-y-5">
        {counterDisplay}

        <div className="border-t border-surface pt-5">
          <MadeInFrance />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        {counterDisplay}

        <div className="mt-6 border-t border-surface pt-6">
          <p className="text-sm leading-6 text-stone">
            Connecte-toi pour
            ajouter ce vêtement à
            ta précommande.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link
              href="/connexion"
              className="flex items-center justify-center rounded-full border border-foreground px-5 py-3.5 text-[10px] uppercase tracking-[0.25em] text-foreground transition hover:bg-foreground hover:text-background"
            >
              Se connecter
            </Link>

            <Link
              href="/inscription"
              className="flex items-center justify-center rounded-full border border-stone/40 px-5 py-3.5 text-[10px] uppercase tracking-[0.25em] text-stone transition hover:border-foreground hover:text-foreground"
            >
              Créer un compte
            </Link>
          </div>
        </div>

        <div className="mt-6 border-t border-surface pt-5">
          <MadeInFrance />
        </div>
      </div>
    );
  }

  return (
    <div>
      {counterDisplay}

      <div className="mt-6 border-t border-surface pt-6">
        <button
          type="button"
          onClick={addToPreorder}
          className="w-full rounded-full bg-foreground px-6 py-4 text-[10px] uppercase tracking-[0.25em] text-background transition hover:opacity-85"
        >
          Ajouter à ma précommande
        </button>

        {error && (
          <p className="mt-3 text-xs leading-5 text-stone">
            {error}
          </p>
        )}

        {added && (
          <div className="mt-4 border border-surface p-4">
            <p className="text-xs text-foreground">
              {product.name} —{" "}
              {colorway.label} —
              Taille {size}
            </p>

            <p className="mt-1 text-xs text-stone">
              Ajouté à ta
              précommande.
            </p>

            <Link
              href="/precommande"
              className="mt-4 inline-flex rounded-full bg-foreground px-5 py-2.5 text-[10px] uppercase tracking-widest text-background"
            >
              Voir ma précommande (
              {cartCount})
            </Link>
          </div>
        )}

        {!added &&
          cartCount > 0 && (
            <Link
              href="/precommande"
              className="mt-4 inline-block text-[10px] uppercase tracking-widest text-stone underline underline-offset-4"
            >
              Ma précommande —{" "}
              {cartCount} vêtement
              {cartCount > 1
                ? "s"
                : ""}
            </Link>
          )}
      </div>

      <div className="mt-6 border-t border-surface pt-5">
        <MadeInFrance />
      </div>
    </div>
  );
}