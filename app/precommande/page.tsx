"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";
import { getProduct } from "@/lib/products";

const STORAGE_KEY = "ajvek-preorder-cart";

type PreorderCartItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
};

export default function PrecommandePage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<PreorderCartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        setItems([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setName(user.user_metadata.full_name);
    }
  }, [user]);

  function saveItems(nextItems: PreorderCartItem[]) {
    setItems(nextItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }

  function increaseQuantity(index: number) {
    const nextItems = [...items];
    nextItems[index].quantity += 1;
    saveItems(nextItems);
  }

  function decreaseQuantity(index: number) {
    const nextItems = [...items];

    if (nextItems[index].quantity <= 1) {
      nextItems.splice(index, 1);
    } else {
      nextItems[index].quantity -= 1;
    }

    saveItems(nextItems);
  }

  function removeItem(index: number) {
    const nextItems = [...items];
    nextItems.splice(index, 1);
    saveItems(nextItems);
  }

  const totalQuantity = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = getProduct(item.product_slug);

      if (!product) return sum;

      return sum + product.priceValue * item.quantity;
    }, 0);
  }, [items]);

  const shipping = useMemo(() => {
    if (totalQuantity === 0) return 0;
    if (totalQuantity === 1) return 7.9;
    if (totalQuantity === 2) return 9.9;
    return 0;
  }, [totalQuantity]);

  const total = subtotal + shipping;

  async function handleCheckout() {
    if (!user) {
      setError("Connecte-toi pour finaliser ta précommande.");
      return;
    }

    if (!name.trim()) {
      setError("Indique ton nom.");
      return;
    }

    if (items.length === 0) {
      setError("Ta précommande est vide.");
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
          items: items.map((item) => ({
            product_slug: item.product_slug,
            color: item.color,
            size: item.size,
            quantity: item.quantity,
          })),
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
      console.error("[PrecommandePage] Erreur checkout :", error);

      setError(
        "Impossible de lancer le paiement. Vérifie ta connexion puis réessaie."
      );

      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background px-6 py-16 text-foreground">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-stone">Chargement...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-stone">
          AJVEK
        </p>

        <h1 className="font-display text-4xl sm:text-6xl">
          Ma précommande
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
          Livraison en France uniquement pour le moment.
          Les frais de port sont de 7,90 € pour 1 vêtement,
          9,90 € pour 2 vêtements, et offerts dès 3 vêtements.
        </p>

        {items.length === 0 ? (
          <div className="mt-12 rounded border border-surface p-6">
            <p className="text-sm text-stone">
              Ta précommande est vide.
            </p>

            <Link
              href="/catalogue"
              className="mt-5 inline-block rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-foreground hover:text-background"
            >
              Voir la collection
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 space-y-4">
              {items.map((item, index) => {
                const product = getProduct(item.product_slug);

                const itemPrice = product?.priceValue ?? 0;
                const lineTotal = itemPrice * item.quantity;

                return (
                  <div
                    key={`${item.product_slug}-${item.color}-${item.size}`}
                    className="rounded border border-surface p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-display text-xl">
                          {product?.name ?? item.product_name}
                        </p>

                        <p className="mt-1 text-xs text-stone">
                          {item.color} — Taille {item.size}
                        </p>

                        <p className="mt-2 text-sm text-foreground">
                          {lineTotal.toFixed(2).replace(".", ",")} €
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-[10px] uppercase tracking-widest text-stone underline underline-offset-4"
                      >
                        Retirer
                      </button>
                    </div>

                    <div className="mt-5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(index)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone/40 text-sm"
                      >
                        −
                      </button>

                      <span className="min-w-8 text-center text-sm">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(index)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-stone/40 text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded border border-surface p-5">
              <div className="flex justify-between gap-4 text-sm text-stone">
                <span>Sous-total</span>
                <span>
                  {subtotal.toFixed(2).replace(".", ",")} €
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-4 text-sm text-stone">
                <span>Livraison France</span>
                <span>
                  {shipping === 0
                    ? "Offerte"
                    : `${shipping.toFixed(2).replace(".", ",")} €`}
                </span>
              </div>

              {totalQuantity >= 3 && (
                <p className="mt-2 text-[10px] uppercase tracking-widest text-foreground">
                  Livraison offerte dès 3 vêtements
                </p>
              )}

              <div className="mt-5 border-t border-surface pt-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm uppercase tracking-widest">
                    Total
                  </span>

                  <span className="font-display text-2xl">
                    {total.toFixed(2).replace(".", ",")} €
                  </span>
                </div>
              </div>
            </div>

            {!user ? (
              <div className="mt-8">
                <p className="mb-4 text-sm text-stone">
                  Connecte-toi pour finaliser ta précommande.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/connexion"
                    className="rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest transition hover:bg-foreground hover:text-background"
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
              </div>
            ) : (
              <div className="mt-8 rounded border border-surface p-5">
                <p className="mb-4 text-xs uppercase tracking-widest text-stone">
                  Informations
                </p>

                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nom"
                  className="w-full rounded border border-stone/40 bg-transparent px-3 py-3 text-sm outline-none focus:border-foreground"
                />

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Téléphone (optionnel)"
                  className="mt-3 w-full rounded border border-stone/40 bg-transparent px-3 py-3 text-sm outline-none focus:border-foreground"
                />

                <p className="mt-3 text-[10px] text-stone">
                  Paiement lié au compte {user.email}
                </p>

                {error && (
                  <p className="mt-4 text-xs text-stone">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="mt-5 w-full rounded-full bg-foreground px-6 py-4 text-xs uppercase tracking-widest text-background transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Redirection vers Stripe..."
                    : `Payer ${total
                        .toFixed(2)
                        .replace(".", ",")} €`}
                </button>

                <p className="mt-3 text-center text-[10px] leading-relaxed text-stone">
                  L&apos;adresse de livraison française sera demandée
                  directement sur la page de paiement sécurisée Stripe.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}