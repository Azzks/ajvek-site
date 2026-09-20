"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";
import { getProduct } from "@/lib/products";
import ServicePointPicker, {
  type SelectedServicePoint,
} from "@/components/ServicePointPicker";

const STORAGE_KEY = "ajvek-preorder-cart";

type PreorderCartItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
};

type DeliveryMethod = "relay" | "home";

export default function PrecommandePage() {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState<PreorderCartItem[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>("relay");

  const [postalCode, setPostalCode] = useState("");

  const [selectedPoint, setSelectedPoint] =
    useState<SelectedServicePoint | null>(null);

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

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(nextItems)
    );
  }

  function increaseQuantity(index: number) {
    const nextItems = items.map((item, i) =>
      i === index
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    saveItems(nextItems);
  }

  function decreaseQuantity(index: number) {
    const current = items[index];

    if (current.quantity <= 1) {
      removeItem(index);
      return;
    }

    const nextItems = items.map((item, i) =>
      i === index
        ? {
            ...item,
            quantity: item.quantity - 1,
          }
        : item
    );

    saveItems(nextItems);
  }

  function removeItem(index: number) {
    const nextItems = items.filter((_, i) => i !== index);

    saveItems(nextItems);
  }

  function changeDeliveryMethod(method: DeliveryMethod) {
    setDeliveryMethod(method);
    setError(null);

    if (method === "home") {
      setSelectedPoint(null);
    }
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
    if (totalQuantity === 0) {
      return 0;
    }

    if (totalQuantity >= 3) {
      return 0;
    }

    return deliveryMethod === "relay" ? 4.9 : 7.9;
  }, [totalQuantity, deliveryMethod]);

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

    if (deliveryMethod === "relay" && !selectedPoint) {
      setError(
        "Choisis ton Point Relais avant de continuer."
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError(
          "Ta session a expiré. Reconnecte-toi puis réessaie."
        );

        setSubmitting(false);
        return;
      }

      const response = await fetch(
        "/api/create-preorder-checkout",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim(),

            delivery_method: deliveryMethod,

            service_point:
              deliveryMethod === "relay"
                ? selectedPoint
                : null,

            items: items.map((item) => ({
              product_slug: item.product_slug,
              color: item.color,
              size: item.size,
              quantity: item.quantity,
            })),
          }),
        }
      );

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
      console.error(
        "[PrecommandePage] Erreur checkout :",
        error
      );

      setError(
        "Impossible de lancer le paiement. Vérifie ta connexion puis réessaie."
      );

      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background px-6 py-20 text-foreground">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
            AJVEK
          </p>

          <p className="mt-4 text-sm text-stone">
            Chargement de ta précommande...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="border-b border-surface px-6 pb-8 pt-12 md:px-8 md:pb-14 md:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
                AJVEK — Précommande
              </p>

              <h1 className="mt-4 font-display text-4xl leading-none md:text-6xl">
                Ma précommande
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-stone md:mt-5 md:text-base">
                Vérifie tes pièces, choisis ton mode de livraison puis
                finalise le paiement de ta précommande.
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                    Articles
                  </p>

                  <p className="mt-1 font-display text-2xl">
                    {totalQuantity}
                  </p>
                </div>

                <div className="h-10 w-px bg-surface" />

                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                    Total
                  </p>

                  <p className="mt-1 font-display text-2xl">
                    {total.toFixed(2).replace(".", ",")} €
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-9 md:px-8 md:py-14">
        {items.length === 0 ? (
          <div className="mx-auto max-w-2xl border border-surface px-6 py-10 text-center md:px-10 md:py-16">
            <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
              Ta sélection
            </p>

            <h2 className="mt-4 font-display text-3xl">
              Ta précommande est vide.
            </h2>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-stone">
              Découvre la collection AJVEK et ajoute une pièce avant
              de revenir ici.
            </p>

            <Link
              href="/catalogue"
              className="group mt-8 inline-flex items-center gap-4 rounded-full bg-foreground px-6 py-3.5 text-[10px] uppercase tracking-[0.25em] text-background"
            >
              <span>Voir la collection</span>

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-11 lg:grid-cols-[1fr_390px] lg:gap-16">
            {/* GAUCHE */}
            <div>
              {/* ARTICLES */}
              <section>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
                      01 — Pièces
                    </p>

                    <h2 className="mt-3 font-display text-3xl">
                      Ta sélection
                    </h2>
                  </div>

                  <p className="text-xs text-stone">
                    {totalQuantity} vêtement
                    {totalQuantity > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="mt-6 border-t border-surface">
                  {items.map((item, index) => {
                    const product = getProduct(item.product_slug);

                    const itemPrice = product?.priceValue ?? 0;

                    const lineTotal =
                      itemPrice * item.quantity;

                    const image = `/catalogue/${item.product_slug}-${item.color.toLowerCase()}.png`;

                    return (
                      <article
                        key={`${item.product_slug}-${item.color}-${item.size}`}
                        className="border-b border-surface py-5"
                      >
                        <div className="grid grid-cols-[92px_1fr] gap-5">
                          {/* MINIATURE */}
                          <div className="relative aspect-[4/5] overflow-hidden bg-[#151514]">
                            <img
                              src={image}
                              alt={`${product?.name ?? item.product_name} ${item.color}`}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* INFOS */}
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                                  AJVEK
                                </p>

                                <h3 className="mt-2 font-display text-2xl leading-none">
                                  {product?.name ?? item.product_name}
                                </h3>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-[9px] uppercase tracking-[0.25em] text-stone underline underline-offset-4"
                              >
                                Retirer
                              </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-stone">
                              <span>{item.color}</span>
                              <span>Taille {item.size}</span>
                              <span>
                                {itemPrice
                                  .toFixed(2)
                                  .replace(".", ",")}{" "}
                                € / pièce
                              </span>
                            </div>

                            <div className="mt-5 flex items-center justify-between gap-4">
                              <div className="inline-flex items-center border border-surface">
                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(index)
                                  }
                                  className="flex h-9 w-9 items-center justify-center text-sm text-stone hover:text-foreground"
                                >
                                  −
                                </button>

                                <span className="flex h-9 min-w-9 items-center justify-center border-x border-surface text-sm">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(index)
                                  }
                                  className="flex h-9 w-9 items-center justify-center text-sm text-stone hover:text-foreground"
                                >
                                  +
                                </button>
                              </div>

                              <p className="font-display text-lg">
                                {lineTotal
                                  .toFixed(2)
                                  .replace(".", ",")}{" "}
                                €
                              </p>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* LIVRAISON */}
              <section className="mt-11">
                <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
                  02 — Livraison
                </p>

                <h2 className="mt-3 font-display text-3xl">
                  Choisis la réception
                </h2>

                <p className="mt-3 text-sm leading-6 text-stone">
                  Livraison disponible en France uniquement.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      changeDeliveryMethod("relay")
                    }
                    className={`relative min-h-32 border p-4 text-left ${
                      deliveryMethod === "relay"
                        ? "border-foreground bg-white/[0.025]"
                        : "border-surface"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-foreground">
                          Point Relais
                        </p>

                        <p className="mt-1 text-xs text-stone">
                          Mondial Relay
                        </p>
                      </div>

                      <span
                        className={`mt-0.5 block h-3 w-3 rounded-full border ${
                          deliveryMethod === "relay"
                            ? "border-foreground bg-foreground"
                            : "border-stone/50"
                        }`}
                      />
                    </div>

                    <p className="absolute bottom-4 left-4 font-display text-xl">
                      {totalQuantity >= 3
                        ? "Offerte"
                        : "4,90 €"}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeDeliveryMethod("home")
                    }
                    className={`relative min-h-32 border p-4 text-left ${
                      deliveryMethod === "home"
                        ? "border-foreground bg-white/[0.025]"
                        : "border-surface"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-foreground">
                          À domicile
                        </p>

                        <p className="mt-1 text-xs leading-5 text-stone">
                          Adresse renseignée au paiement.
                        </p>
                      </div>

                      <span
                        className={`mt-0.5 block h-3 w-3 rounded-full border ${
                          deliveryMethod === "home"
                            ? "border-foreground bg-foreground"
                            : "border-stone/50"
                        }`}
                      />
                    </div>

                    <p className="absolute bottom-4 left-4 font-display text-xl">
                      {totalQuantity >= 3
                        ? "Offerte"
                        : "7,90 €"}
                    </p>
                  </button>
                </div>

                {totalQuantity >= 3 && (
                  <div className="mt-4 border border-white/10 bg-white/[0.02] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-foreground">
                      Livraison offerte dès 3 vêtements
                    </p>
                  </div>
                )}

                {deliveryMethod === "relay" && (
                  <div className="mt-6 border-t border-surface pt-6">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-stone">
                      Code postal
                    </label>

                    <p className="mt-2 text-xs leading-5 text-stone">
                      Indique ton code postal pour afficher les Points
                      Relais disponibles.
                    </p>

                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={5}
                      value={postalCode}
                      onChange={(e) => {
                        setPostalCode(
                          e.target.value.replace(/\D/g, "")
                        );

                        setSelectedPoint(null);
                      }}
                      placeholder="33000"
                      className="mt-4 w-full border border-surface bg-transparent px-4 py-4 text-sm outline-none transition focus:border-foreground"
                    />

                    <ServicePointPicker
                      postalCode={postalCode}
                      selectedPoint={selectedPoint}
                      onSelect={setSelectedPoint}
                    />
                  </div>
                )}
              </section>

              {/* INFORMATIONS */}
              <section className="mt-11">
                <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
                  03 — Informations
                </p>

                <h2 className="mt-3 font-display text-3xl">
                  Tes coordonnées
                </h2>

                {!user ? (
                  <div className="mt-6 border border-surface p-6">
                    <p className="text-sm leading-6 text-stone">
                      Connecte-toi pour finaliser ta précommande
                      et accéder au paiement sécurisé.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href="/connexion"
                        className="rounded-full bg-foreground px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-background"
                      >
                        Se connecter
                      </Link>

                      <Link
                        href="/inscription"
                        className="rounded-full border border-stone/40 px-6 py-3 text-[10px] uppercase tracking-[0.25em] text-stone"
                      >
                        Créer un compte
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="text-[9px] uppercase tracking-[0.3em] text-stone">
                          Nom
                        </label>

                        <input
                          required
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          placeholder="Nom"
                          className="mt-2 w-full border border-surface bg-transparent px-4 py-4 text-sm outline-none transition focus:border-foreground"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] uppercase tracking-[0.3em] text-stone">
                          Téléphone
                        </label>

                        <input
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          placeholder="Optionnel"
                          className="mt-2 w-full border border-surface bg-transparent px-4 py-4 text-sm outline-none transition focus:border-foreground"
                        />
                      </div>
                    </div>

                    <p className="mt-4 text-[10px] leading-5 text-stone">
                      Précommande associée au compte{" "}
                      <span className="text-foreground">
                        {user.email}
                      </span>
                    </p>
                  </div>
                )}
              </section>
            </div>

            {/* RÉSUMÉ */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="border border-surface bg-[#111110] p-6 md:p-7">
                <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
                  Résumé
                </p>

                <h2 className="mt-3 font-display text-3xl">
                  Précommande
                </h2>

                <div className="mt-6 space-y-4 border-t border-surface pt-5">
                  <div className="flex justify-between gap-5 text-sm text-stone">
                    <span>
                      {totalQuantity} vêtement
                      {totalQuantity > 1 ? "s" : ""}
                    </span>

                    <span>
                      {subtotal.toFixed(2).replace(".", ",")} €
                    </span>
                  </div>

                  <div className="flex justify-between gap-5 text-sm text-stone">
                    <span>Livraison</span>

                    <span>
                      {shipping === 0
                        ? "Offerte"
                        : `${shipping
                            .toFixed(2)
                            .replace(".", ",")} €`}
                    </span>
                  </div>

                  <div className="border-t border-surface pt-5">
                    <div className="flex items-end justify-between gap-5">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-stone">
                        Total
                      </span>

                      <span className="font-display text-3xl">
                        {total.toFixed(2).replace(".", ",")} €
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3 border-y border-surface py-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-stone">
                      Paiement
                    </span>

                    <span className="text-xs text-foreground">
                      Stripe
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-stone">
                      Production
                    </span>

                    <span className="text-xs text-foreground">
                      Dès 10 payés
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-stone">
                      Expédition
                    </span>

                    <span className="text-xs text-foreground">
                      France
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="mt-5 border border-white/10 px-4 py-3">
                    <p className="text-xs leading-5 text-stone">
                      {error}
                    </p>
                  </div>
                )}

                {user ? (
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={submitting}
                    className="group mt-6 flex w-full items-center justify-between rounded-full bg-foreground px-6 py-4 text-background disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="text-[10px] uppercase tracking-[0.25em]">
                      {submitting
                        ? "Redirection..."
                        : "Payer"}
                    </span>

                    <span className="flex items-center gap-3">
                      <span className="text-sm">
                        {total.toFixed(2).replace(".", ",")} €
                      </span>

                      {!submitting && (
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      )}
                    </span>
                  </button>
                ) : (
                  <Link
                    href="/connexion"
                    className="mt-6 flex w-full items-center justify-between rounded-full bg-foreground px-6 py-4 text-background"
                  >
                    <span className="text-[10px] uppercase tracking-[0.25em]">
                      Se connecter
                    </span>

                    <span>→</span>
                  </Link>
                )}

                <p className="mt-4 text-center text-[9px] uppercase tracking-[0.2em] text-stone">
                  Paiement sécurisé
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-px bg-surface">
                <div className="bg-background p-4">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-stone">
                    Retours
                  </p>

                  <p className="mt-2 text-xs leading-5 text-foreground">
                    14 jours après réception
                  </p>
                </div>

                <div className="bg-background p-4">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-stone">
                    Fabrication
                  </p>

                  <p className="mt-2 text-xs leading-5 text-foreground">
                    Produit en France
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}