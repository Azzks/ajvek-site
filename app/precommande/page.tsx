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
const PRODUCTION_GOAL = 10;

type PreorderCartItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
};

type DeliveryMethod = "relay" | "home";

function formatPrice(value: number) {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

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

  /*
   * ============================================================
   * PANIER
   * ============================================================
   */

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

  /*
   * ============================================================
   * UTILISATEUR
   * ============================================================
   */

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

  /*
   * ============================================================
   * CALCULS
   * ============================================================
   */

  const totalQuantity = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = getProduct(item.product_slug);

      if (!product) {
        return sum;
      }

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

  /*
   * ============================================================
   * CHECKOUT
   * ============================================================
   */

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

  /*
   * ============================================================
   * CHARGEMENT
   * ============================================================
   */

  if (authLoading) {
    return (
      <main className="min-h-screen bg-background px-6 py-20 text-foreground">
        <div className="mx-auto max-w-7xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · DROP 001
          </p>

          <h1 className="mt-5 font-display text-4xl">
            Précommande
          </h1>

          <div className="mt-8 h-px w-full bg-surface" />

          <p className="mt-6 text-sm text-stone">
            Chargement de ta précommande...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-surface px-5 pb-10 pt-12 md:px-8 md:pb-14 md:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-4%] top-1/2 -translate-y-1/2 font-display text-[35vw] leading-none text-foreground/[0.018] md:text-[17vw]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-9 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
                AJVEK · Drop 001
              </p>

              <h1 className="mt-5 font-display text-[3.4rem] leading-[0.88] tracking-[-0.04em] md:text-7xl">
                Finaliser
                <br />
                ma précommande.
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-stone md:text-[15px]">
                Vérifie ta sélection, choisis ta livraison
                puis finalise ton paiement.
              </p>
            </div>

            {items.length > 0 && (
              <div className="flex gap-8 border-t border-surface pt-5 md:border-0 md:pt-0">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.35em] text-stone/60">
                    Pièces
                  </p>

                  <p className="mt-2 font-display text-2xl">
                    {String(totalQuantity).padStart(2, "0")}
                  </p>
                </div>

                <div className="h-12 w-px bg-surface" />

                <div>
                  <p className="text-[8px] uppercase tracking-[0.35em] text-stone/60">
                    Total
                  </p>

                  <p className="mt-2 font-display text-2xl">
                    {formatPrice(total)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          ÉTAPES
      ====================================================== */}

      {items.length > 0 && (
        <section className="border-b border-surface">
          <div className="mx-auto grid max-w-7xl grid-cols-3 px-5 md:px-8">
            {[
              ["01", "Pièces"],
              ["02", "Livraison"],
              ["03", "Paiement"],
            ].map(([number, label], index) => (
              <div
                key={number}
                className={`py-5 ${
                  index > 0
                    ? "border-l border-surface pl-4 md:pl-8"
                    : ""
                }`}
              >
                <p className="text-[8px] tracking-[0.35em] text-stone/40">
                  {number}
                </p>

                <p className="mt-2 text-[9px] uppercase tracking-[0.25em]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-16">
        {items.length === 0 ? (
          /* ===================================================
             PANIER VIDE
          =================================================== */

          <div className="mx-auto max-w-2xl py-16 text-center md:py-24">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
              AJVEK · Drop 001
            </p>

            <h2 className="mt-6 font-display text-4xl md:text-5xl">
              Aucune pièce.
            </h2>

            <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-stone">
              Sélectionne une pièce de Drop 001 pour commencer
              ta précommande.
            </p>

            <Link
              href="/catalogue"
              className="group mx-auto mt-9 flex max-w-sm items-center justify-between rounded-full bg-foreground px-7 py-5 text-background"
            >
              <span className="text-[9px] uppercase tracking-[0.3em]">
                Découvrir Drop 001
              </span>

              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        ) : (
          <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-20">
            {/* =================================================
                COLONNE GAUCHE
            ================================================= */}

            <div>
              {/* ===============================================
                  01 — PIÈCES
              =============================================== */}

              <section>
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                      01 — Pièces
                    </p>

                    <h2 className="mt-4 font-display text-4xl">
                      Ta sélection.
                    </h2>
                  </div>

                  <p className="text-[9px] uppercase tracking-[0.25em] text-stone">
                    {totalQuantity}{" "}
                    {totalQuantity > 1 ? "pièces" : "pièce"}
                  </p>
                </div>

                <div className="mt-8 border-t border-surface">
                  {items.map((item, index) => {
                    const product = getProduct(item.product_slug);

                    const itemPrice =
                      product?.priceValue ?? 0;

                    const lineTotal =
                      itemPrice * item.quantity;

                    const image =
                      `/catalogue/${item.product_slug}-${item.color.toLowerCase()}.png`;

                    return (
                      <article
                        key={`${item.product_slug}-${item.color}-${item.size}-${index}`}
                        className="group border-b border-surface py-6 md:py-8"
                      >
                        <div className="grid grid-cols-[105px_minmax(0,1fr)] gap-5 md:grid-cols-[150px_minmax(0,1fr)] md:gap-8">
                          {/* IMAGE */}

                          <Link
                            href={`/produit/${item.product_slug}`}
                            className="relative aspect-[4/5] overflow-hidden bg-[#151514]"
                          >
                            <img
                              src={image}
                              alt={`${
                                product?.name ?? item.product_name
                              } ${item.color}`}
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
                            />

                            <div className="absolute bottom-2 left-2 text-[7px] uppercase tracking-[0.3em] text-white/45">
                              AJVEK
                            </div>
                          </Link>

                          {/* INFOS */}

                          <div className="flex min-w-0 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[8px] uppercase tracking-[0.35em] text-stone/55">
                                  AJVEK · Drop 001
                                </p>

                                <h3 className="mt-3 font-display text-2xl leading-none md:text-3xl">
                                  {product?.name ??
                                    item.product_name}
                                </h3>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(index)
                                }
                                className="shrink-0 text-[8px] uppercase tracking-[0.2em] text-stone/60 transition hover:text-foreground"
                              >
                                Retirer
                              </button>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-[9px] uppercase tracking-[0.18em] text-stone md:gap-x-5 md:text-[10px]">
                              <span>{item.color}</span>
                              <span>·</span>
                              <span>Taille {item.size}</span>
                            </div>

                            <div className="mt-auto flex items-end justify-between gap-3 pt-7">
                              {/* QUANTITÉ */}

                              <div className="inline-flex overflow-hidden rounded-full border border-surface">
                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(index)
                                  }
                                  aria-label="Diminuer la quantité"
                                  className="flex h-10 w-10 items-center justify-center text-sm text-stone transition hover:text-foreground"
                                >
                                  −
                                </button>

                                <span className="flex h-10 min-w-10 items-center justify-center border-x border-surface text-xs">
                                  {item.quantity}
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(index)
                                  }
                                  aria-label="Augmenter la quantité"
                                  className="flex h-10 w-10 items-center justify-center text-sm text-stone transition hover:text-foreground"
                                >
                                  +
                                </button>
                              </div>

                              <div className="text-right">
                                {item.quantity > 1 && (
                                  <p className="mb-1 text-[9px] text-stone">
                                    {formatPrice(itemPrice)} / pièce
                                  </p>
                                )}

                                <p className="font-display text-xl md:text-2xl">
                                  {formatPrice(lineTotal)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <Link
                  href="/catalogue"
                  className="mt-5 inline-flex items-center gap-4 text-[8px] uppercase tracking-[0.3em] text-stone transition hover:text-foreground"
                >
                  <span>+ Ajouter une pièce</span>
                  <span>→</span>
                </Link>
              </section>

              {/* ===============================================
                  02 — LIVRAISON
              =============================================== */}

              <section className="mt-20">
                <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                  02 — Livraison
                </p>

                <h2 className="mt-4 font-display text-4xl">
                  Où recevoir ta pièce ?
                </h2>

                <p className="mt-4 max-w-lg text-sm leading-7 text-stone">
                  Livraison disponible en France. Elle est offerte
                  à partir de trois vêtements.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {/* POINT RELAIS */}

                  <button
                    type="button"
                    onClick={() =>
                      changeDeliveryMethod("relay")
                    }
                    className={`group relative min-h-[165px] border p-5 text-left transition ${
                      deliveryMethod === "relay"
                        ? "border-foreground bg-white/[0.025]"
                        : "border-surface hover:border-stone/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                          Mondial Relay
                        </p>

                        <p className="mt-3 font-display text-2xl">
                          Point Relais
                        </p>
                      </div>

                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          deliveryMethod === "relay"
                            ? "border-foreground"
                            : "border-stone/40"
                        }`}
                      >
                        {deliveryMethod === "relay" && (
                          <div className="h-2 w-2 rounded-full bg-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                      <p className="text-[10px] text-stone">
                        En point partenaire
                      </p>

                      <p className="shrink-0 font-display text-xl">
                        {totalQuantity >= 3
                          ? "Offerte"
                          : "4,90 €"}
                      </p>
                    </div>
                  </button>

                  {/* DOMICILE */}

                  <button
                    type="button"
                    onClick={() =>
                      changeDeliveryMethod("home")
                    }
                    className={`group relative min-h-[165px] border p-5 text-left transition ${
                      deliveryMethod === "home"
                        ? "border-foreground bg-white/[0.025]"
                        : "border-surface hover:border-stone/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                          Livraison
                        </p>

                        <p className="mt-3 font-display text-2xl">
                          À domicile
                        </p>
                      </div>

                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          deliveryMethod === "home"
                            ? "border-foreground"
                            : "border-stone/40"
                        }`}
                      >
                        {deliveryMethod === "home" && (
                          <div className="h-2 w-2 rounded-full bg-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
                      <p className="text-[10px] text-stone">
                        Adresse au paiement
                      </p>

                      <p className="shrink-0 font-display text-xl">
                        {totalQuantity >= 3
                          ? "Offerte"
                          : "7,90 €"}
                      </p>
                    </div>
                  </button>
                </div>

                {totalQuantity >= 3 && (
                  <div className="mt-3 flex items-center justify-between gap-4 border border-surface px-5 py-4">
                    <p className="text-[9px] uppercase tracking-[0.3em]">
                      Livraison offerte
                    </p>

                    <p className="text-[8px] uppercase tracking-[0.25em] text-stone">
                      Dès 3 pièces
                    </p>
                  </div>
                )}

                {/* POINT RELAIS */}

                {deliveryMethod === "relay" && (
                  <div className="mt-8 border-t border-surface pt-8">
                    <div className="grid gap-6 md:grid-cols-[0.45fr_1fr]">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.35em] text-stone">
                          Point Relais
                        </p>

                        <p className="mt-3 text-sm leading-6 text-stone">
                          Entre ton code postal pour trouver les
                          Points Relais disponibles autour de toi.
                        </p>
                      </div>

                      <div>
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
                          placeholder="Code postal · 33000"
                          className="w-full border border-surface bg-transparent px-5 py-4 text-sm outline-none transition placeholder:text-stone/35 focus:border-foreground"
                        />

                        <ServicePointPicker
                          postalCode={postalCode}
                          selectedPoint={selectedPoint}
                          onSelect={setSelectedPoint}
                        />

                        {selectedPoint && (
                          <div className="mt-4 border border-foreground/30 bg-white/[0.02] px-5 py-4">
                            <div className="flex items-start gap-3">
                              <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
                              </span>

                              <div>
                                <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                                  Point sélectionné
                                </p>

                                <p className="mt-2 text-sm">
                                  {selectedPoint.name ||
                                    "Point Relais sélectionné"}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              {/* ===============================================
                  03 — INFORMATIONS
              =============================================== */}

              <section className="mt-20">
                <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                  03 — Informations
                </p>

                <h2 className="mt-4 font-display text-4xl">
                  Tes coordonnées.
                </h2>

                {!user ? (
                  <div className="mt-8 border border-surface p-6 md:p-8">
                    <p className="max-w-md text-sm leading-7 text-stone">
                      Connecte-toi à ton compte AJVEK pour
                      finaliser ta précommande et accéder au
                      paiement sécurisé.
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link
                        href="/connexion"
                        className="rounded-full bg-foreground px-6 py-4 text-[9px] uppercase tracking-[0.3em] text-background"
                      >
                        Se connecter
                      </Link>

                      <Link
                        href="/inscription"
                        className="rounded-full border border-surface px-6 py-4 text-[9px] uppercase tracking-[0.3em] text-stone"
                      >
                        Créer un compte
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="mt-8">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="text-[8px] uppercase tracking-[0.3em] text-stone">
                          Nom
                        </label>

                        <input
                          required
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          placeholder="Ton nom"
                          className="mt-3 w-full border border-surface bg-transparent px-5 py-4 text-sm outline-none transition focus:border-foreground"
                        />
                      </div>

                      <div>
                        <label className="text-[8px] uppercase tracking-[0.3em] text-stone">
                          Téléphone
                        </label>

                        <input
                          value={phone}
                          onChange={(e) =>
                            setPhone(e.target.value)
                          }
                          placeholder="Optionnel"
                          className="mt-3 w-full border border-surface bg-transparent px-5 py-4 text-sm outline-none transition focus:border-foreground"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 border-t border-surface pt-4">
                      <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />

                      <p className="min-w-0 truncate text-[9px] uppercase tracking-[0.2em] text-stone">
                        Connecté · {user.email}
                      </p>
                    </div>
                  </div>
                )}
              </section>

              {/* ===============================================
                  FONCTIONNEMENT DE LA PRÉCOMMANDE
              =============================================== */}

              <section className="mt-20 border-y border-surface py-8">
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
                      Le principe
                    </p>

                    <h2 className="mt-4 font-display text-3xl">
                      Comment ça fonctionne ?
                    </h2>
                  </div>

                  <p className="hidden text-[8px] uppercase tracking-[0.3em] text-stone/45 sm:block">
                    Drop 001
                  </p>
                </div>

                <div className="mt-8 grid gap-0 sm:grid-cols-3">
                  {[
                    [
                      "01",
                      "Paiement",
                      "Ta commande est payée et confirmée immédiatement.",
                    ],
                    [
                      "02",
                      "Seuil",
                      `La production démarre dès que ${PRODUCTION_GOAL} commandes payées sont confirmées.`,
                    ],
                    [
                      "03",
                      "Production",
                      "Ta pièce est fabriquée puis préparée pour son expédition.",
                    ],
                  ].map(
                    ([number, title, description], index) => (
                      <div
                        key={number}
                        className={`py-6 sm:px-6 ${
                          index > 0
                            ? "border-t border-surface sm:border-l sm:border-t-0"
                            : ""
                        } ${
                          index === 0 ? "sm:pl-0" : ""
                        }`}
                      >
                        <p className="text-[8px] tracking-[0.35em] text-stone/45">
                          {number}
                        </p>

                        <p className="mt-4 font-display text-xl">
                          {title}
                        </p>

                        <p className="mt-3 text-xs leading-6 text-stone">
                          {description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </section>
            </div>

            {/* =================================================
                RÉSUMÉ
            ================================================= */}

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="border border-surface bg-[#111110]">
                {/* HEADER */}

                <div className="border-b border-surface p-6 md:p-7">
                  <p className="text-[8px] uppercase tracking-[0.4em] text-stone">
                    AJVEK · Drop 001
                  </p>

                  <div className="mt-4 flex items-end justify-between gap-4">
                    <h2 className="font-display text-3xl">
                      Résumé
                    </h2>

                    <p className="text-[8px] uppercase tracking-[0.25em] text-stone">
                      {totalQuantity}{" "}
                      {totalQuantity > 1 ? "pièces" : "pièce"}
                    </p>
                  </div>
                </div>

                {/* PRODUITS */}

                <div className="border-b border-surface px-6 py-2 md:px-7">
                  {items.map((item, index) => {
                    const product = getProduct(item.product_slug);

                    return (
                      <div
                        key={`${item.product_slug}-${item.color}-${item.size}-${index}`}
                        className="flex items-center justify-between gap-4 border-b border-surface py-4 last:border-0"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs">
                            {product?.name ??
                              item.product_name}
                          </p>

                          <p className="mt-1 text-[8px] uppercase tracking-[0.18em] text-stone">
                            {item.color} · {item.size} · ×
                            {item.quantity}
                          </p>
                        </div>

                        <p className="shrink-0 text-xs">
                          {formatPrice(
                            (product?.priceValue ?? 0) *
                              item.quantity
                          )}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* TOTAUX */}

                <div className="p-6 md:p-7">
                  <div className="space-y-4">
                    <div className="flex justify-between gap-5 text-sm">
                      <span className="text-stone">
                        Sous-total
                      </span>

                      <span>
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between gap-5 text-sm">
                      <span className="text-stone">
                        Livraison
                      </span>

                      <span>
                        {shipping === 0
                          ? "Offerte"
                          : formatPrice(shipping)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-surface pt-6">
                    <div className="flex items-end justify-between gap-5">
                      <div>
                        <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                          Total
                        </p>

                        <p className="mt-2 text-[9px] text-stone/60">
                          TVA incluse
                        </p>
                      </div>

                      <p className="font-display text-4xl">
                        {formatPrice(total)}
                      </p>
                    </div>
                  </div>

                  {/* LIVRAISON */}

                  <div className="mt-7 border-y border-surface py-5">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] text-stone">
                        Livraison
                      </span>

                      <span className="text-[10px]">
                        {deliveryMethod === "relay"
                          ? "Point Relais"
                          : "Domicile"}
                      </span>
                    </div>

                    {deliveryMethod === "relay" && (
                      <div className="mt-4 flex items-start justify-between gap-5">
                        <span className="text-[10px] text-stone">
                          Point sélectionné
                        </span>

                        <span className="max-w-[180px] text-right text-[10px] leading-5">
                          {selectedPoint
                            ? selectedPoint.name ||
                              "Point Relais sélectionné"
                            : "À sélectionner"}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* PRÉCOMMANDE */}

                  <div className="mt-6">
                    <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                      Précommande
                    </p>

                    <p className="mt-3 text-xs leading-6 text-stone">
                      Ton paiement est effectué immédiatement.
                      La production débute lorsque les{" "}
                      <span className="text-foreground">
                        {PRODUCTION_GOAL} commandes payées
                      </span>{" "}
                      nécessaires au lancement sont confirmées.
                    </p>
                  </div>

                  {/* ERREUR */}

                  {error && (
                    <div className="mt-6 border border-white/15 bg-white/[0.02] px-4 py-4">
                      <p className="text-xs leading-5 text-foreground">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* CTA */}

                  {user ? (
                    <button
                      type="button"
                      onClick={handleCheckout}
                      disabled={submitting}
                      className="group mt-7 flex w-full items-center justify-between rounded-full bg-foreground px-6 py-5 text-background transition hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="text-[9px] uppercase tracking-[0.3em]">
                        {submitting
                          ? "Redirection..."
                          : "Payer maintenant"}
                      </span>

                      <span className="flex items-center gap-4">
                        <span className="font-display text-lg">
                          {formatPrice(total)}
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
                      className="group mt-7 flex w-full items-center justify-between rounded-full bg-foreground px-6 py-5 text-background"
                    >
                      <span className="text-[9px] uppercase tracking-[0.3em]">
                        Se connecter
                      </span>

                      <span className="transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  )}

                  {/* RÉASSURANCE */}

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[7px] uppercase tracking-[0.22em] text-stone/55">
                    <span>CB</span>
                    <span>·</span>
                    <span>Stripe</span>
                    <span>·</span>
                    <span>Paiement sécurisé</span>
                  </div>
                </div>
              </div>

              {/* INFORMATIONS */}

              <div className="mt-4 grid grid-cols-2 gap-px bg-surface">
                <div className="bg-background p-5">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Retours
                  </p>

                  <p className="mt-3 text-xs leading-5">
                    14 jours après réception
                  </p>
                </div>

                <div className="bg-background p-5">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Livraison
                  </p>

                  <p className="mt-3 text-xs leading-5">
                    Offerte dès 3 pièces
                  </p>
                </div>

                <div className="bg-background p-5">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Paiement
                  </p>

                  <p className="mt-3 text-xs leading-5">
                    Sécurisé par Stripe
                  </p>
                </div>

                <div className="bg-background p-5">
                  <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                    Production
                  </p>

                  <p className="mt-3 text-xs leading-5">
                    Dès 10 commandes
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>

      {/* =====================================================
          FIN
      ====================================================== */}

      {items.length > 0 && (
        <section className="border-t border-surface px-5 py-20 text-center md:px-8 md:py-28">
          <p className="text-[8px] uppercase tracking-[0.45em] text-stone">
            AJVEK · DROP 001
          </p>

          <p className="mx-auto mt-5 max-w-xl font-display text-3xl leading-[1.05] md:text-5xl">
            Du dessin.
            <br />
            À ta pièce.
          </p>
        </section>
      )}
    </main>
  );
}