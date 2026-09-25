"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/AuthContext";

type OrderItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
};

type Order = {
  checkout_group_id: string;

  created_at: string | null;
  paid_at: string | null;

  status: string;

  delivery_method: string | null;
  shipping_amount: number;

  service_point: {
    id: string | null;
    name: string | null;
    address: string | null;
    postal_code: string | null;
    city: string | null;
  } | null;

  carrier: string | null;

  tracking_number: string | null;
  tracking_url: string | null;

  shipped_at: string | null;
  delivered_at: string | null;

  items: OrderItem[];
};

/*
 * ============================================================
 * ÉTAPES DE COMMANDE
 * ============================================================
 */

const STEPS = [
  {
    key: "paid",
    label: "Commande confirmée",
    description:
      "Ton paiement a été validé et ta commande AJVEK est confirmée.",
  },

  {
    key: "preparing",
    label: "En préparation",
    description:
      "Nous préparons actuellement ta commande avant son expédition.",
  },

  {
    key: "shipped",
    label: "Expédiée",
    description:
      "Ta commande a quitté nos locaux et a été confiée au transporteur.",
  },

  {
    key: "delivered",
    label: "Livrée",
    description:
      "Ta commande a été livrée.",
  },
];

/*
 * ============================================================
 * STATUT
 * ============================================================
 */

function normalizeStatus(status: string) {
  /*
   * Compatibilité avec d'anciens statuts
   * éventuellement présents dans Supabase.
   */

  switch (status) {
    case "preorder_received":
      return "paid";

    case "production":
    case "manufacturing":
      return "preparing";

    default:
      return status;
  }
}

function getStatusIndex(status: string) {
  const normalized =
    normalizeStatus(status);

  const index = STEPS.findIndex(
    (step) =>
      step.key === normalized
  );

  return index >= 0 ? index : 0;
}

/*
 * ============================================================
 * FORMATAGE
 * ============================================================
 */

function formatDate(
  date: string | null
) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  ).format(new Date(date));
}

function formatPrice(
  amount: number
) {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      style: "currency",
      currency: "EUR",
    }
  ).format(amount / 100);
}

function shortOrderId(
  id: string
) {
  if (
    id.startsWith("legacy-")
  ) {
    return id
      .replace("legacy-", "")
      .slice(0, 8)
      .toUpperCase();
  }

  return id
    .replaceAll("-", "")
    .slice(0, 8)
    .toUpperCase();
}

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default function MesCommandesPage() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    orders,
    setOrders,
  ] = useState<Order[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  /*
   * ==========================================================
   * CHARGEMENT DES COMMANDES
   * ==========================================================
   */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    async function loadOrders() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (
          !session?.access_token
        ) {
          setError(
            "Ta session a expiré. Reconnecte-toi pour accéder à tes commandes."
          );

          return;
        }

        const response =
          await fetch(
            "/api/my-orders",
            {
              cache:
                "no-store",

              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.error ||
              "Impossible de charger tes commandes."
          );

          return;
        }

        setOrders(
          data.orders ?? []
        );
      } catch (error) {
        console.error(
          "[mes-commandes]",
          error
        );

        setError(
          "Impossible de charger tes commandes."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [
    user,
    authLoading,
  ]);

  /*
   * ==========================================================
   * CHARGEMENT
   * ==========================================================
   */

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="min-h-screen bg-background px-6 py-24 text-foreground">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
            AJVEK
          </p>

          <h1 className="mt-5 font-display text-4xl md:text-6xl">
            Mes commandes
          </h1>

          <div className="mt-12 border-t border-surface pt-8">
            <p className="text-sm text-stone">
              Chargement de tes commandes...
            </p>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * NON CONNECTÉ
   * ==========================================================
   */

  if (!user) {
    return (
      <main className="min-h-screen bg-background px-6 py-24 text-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
            AJVEK · Suivi
          </p>

          <h1 className="mt-6 font-display text-4xl md:text-6xl">
            Mes commandes
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-stone">
            Connecte-toi avec le compte utilisé lors de ta commande pour
            retrouver tes achats et suivre leur avancement.
          </p>

          <Link
            href="/connexion"
            className="mt-10 inline-flex rounded-full bg-foreground px-8 py-4 text-[10px] uppercase tracking-[0.25em] text-background"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-surface px-6 py-16 md:px-8 md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-4%] top-1/2 -translate-y-1/2 font-display text-[32vw] leading-none text-foreground/[0.018] md:text-[16vw]"
        >
          001
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
            AJVEK · Drop 001
          </p>

          <h1 className="mt-5 font-display text-4xl md:text-6xl">
            Mes commandes
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-stone">
            Retrouve tes commandes AJVEK et suis leur avancement jusqu&apos;à
            leur livraison.
          </p>

          {orders.length > 0 && (
            <div className="mt-10 flex items-center gap-8 border-t border-surface pt-6">
              <div>
                <p className="text-[8px] uppercase tracking-[0.35em] text-stone/60">
                  Commandes
                </p>

                <p className="mt-2 font-display text-2xl">
                  {String(
                    orders.length
                  ).padStart(
                    2,
                    "0"
                  )}
                </p>
              </div>

              <div className="h-12 w-px bg-surface" />

              <div>
                <p className="text-[8px] uppercase tracking-[0.35em] text-stone/60">
                  Compte
                </p>

                <p className="mt-2 max-w-[220px] truncate text-xs text-stone">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="px-6 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-5xl">

          {error && (
            <div className="border border-surface px-6 py-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone">
                Erreur
              </p>

              <p className="mt-4 text-sm">
                {error}
              </p>
            </div>
          )}

          {!error &&
            orders.length === 0 && (
              <div className="border border-surface px-6 py-16 text-center md:py-24">
                <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
                  Ton espace AJVEK
                </p>

                <h2 className="mt-5 font-display text-3xl md:text-4xl">
                  Aucune commande pour le moment.
                </h2>

                <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-stone">
                  Lorsque tu passeras une commande AJVEK, elle apparaîtra ici
                  dès que son paiement sera confirmé.
                </p>

                <Link
                  href="/catalogue"
                  className="mt-9 inline-flex rounded-full bg-foreground px-7 py-3.5 text-[10px] uppercase tracking-[0.25em] text-background"
                >
                  Découvrir Drop 001
                </Link>
              </div>
            )}

          {!error &&
            orders.length > 0 && (
              <div className="space-y-12">
                {orders.map(
                  (order) => {
                    const activeIndex =
                      getStatusIndex(
                        order.status
                      );

                    const currentStep =
                      STEPS[
                        activeIndex
                      ];

                    return (
                      <article
                        key={
                          order.checkout_group_id
                        }
                        className="overflow-hidden border border-surface"
                      >
                        <div className="border-b border-surface px-5 py-6 md:px-8 md:py-8">
                          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                              <p className="text-[9px] uppercase tracking-[0.35em] text-stone">
                                Commande AJVEK
                              </p>

                              <h2 className="mt-3 font-display text-2xl md:text-3xl">
                                #
                                {shortOrderId(
                                  order.checkout_group_id
                                )}
                              </h2>
                            </div>

                            <div className="sm:text-right">
                              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                                Statut
                              </p>

                              <p className="mt-2 text-sm">
                                {
                                  currentStep.label
                                }
                              </p>

                              {order.paid_at && (
                                <p className="mt-2 text-[10px] text-stone">
                                  Paiement confirmé le{" "}
                                  {formatDate(
                                    order.paid_at
                                  )}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="px-5 py-7 md:px-8">
                          <div className="flex items-end justify-between gap-5">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                              Ta commande
                            </p>

                            <p className="text-[8px] uppercase tracking-[0.25em] text-stone/60">
                              {order.items.reduce(
                                (
                                  total,
                                  item
                                ) =>
                                  total +
                                  item.quantity,
                                0
                              )}{" "}
                              pièce
                              {order.items.reduce(
                                (
                                  total,
                                  item
                                ) =>
                                  total +
                                  item.quantity,
                                0
                              ) >
                              1
                                ? "s"
                                : ""}
                            </p>
                          </div>

                          <div className="mt-5 divide-y divide-surface border-y border-surface">
                            {order.items.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={`${item.product_slug}-${item.color}-${item.size}-${index}`}
                                  className="flex items-start justify-between gap-6 py-5"
                                >
                                  <div>
                                    <p className="font-display text-xl">
                                      {
                                        item.product_name
                                      }
                                    </p>

                                    <p className="mt-2 text-xs text-stone">
                                      {
                                        item.color
                                      }{" "}
                                      · Taille{" "}
                                      {
                                        item.size
                                      }
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-xs text-stone">
                                    ×{" "}
                                    {
                                      item.quantity
                                    }
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>

                        <div className="border-t border-surface px-5 py-8 md:px-8 md:py-10">
                          <div className="flex items-center justify-between gap-5">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                              Avancement
                            </p>

                            <p className="text-xs">
                              {
                                currentStep.label
                              }
                            </p>
                          </div>

                          <div className="mt-6 h-px overflow-hidden bg-surface">
                            <div
                              className="h-full bg-foreground transition-all duration-500"
                              style={{
                                width: `${
                                  ((activeIndex +
                                    1) /
                                    STEPS.length) *
                                  100
                                }%`,
                              }}
                            />
                          </div>

                          <div className="mt-10">
                            {STEPS.map(
                              (
                                step,
                                index
                              ) => {
                                const completed =
                                  index <=
                                  activeIndex;

                                const current =
                                  index ===
                                  activeIndex;

                                return (
                                  <div
                                    key={
                                      step.key
                                    }
                                    className="relative flex gap-5 pb-9 last:pb-0"
                                  >
                                    {index <
                                      STEPS.length -
                                        1 && (
                                      <div
                                        className={`absolute left-[5px] top-3 h-full w-px ${
                                          index <
                                          activeIndex
                                            ? "bg-foreground"
                                            : "bg-surface"
                                        }`}
                                      />
                                    )}

                                    <div
                                      className={`relative z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border transition ${
                                        completed
                                          ? "border-foreground bg-foreground"
                                          : "border-stone/40 bg-background"
                                      }`}
                                    />

                                    <div className="-mt-0.5">
                                      <div className="flex flex-wrap items-center gap-3">
                                        <p
                                          className={`text-sm ${
                                            completed
                                              ? "text-foreground"
                                              : "text-stone/45"
                                          }`}
                                        >
                                          {
                                            step.label
                                          }
                                        </p>

                                        {current && (
                                          <span className="text-[8px] uppercase tracking-[0.25em] text-stone">
                                            En cours
                                          </span>
                                        )}
                                      </div>

                                      <p
                                        className={`mt-2 max-w-lg text-xs leading-5 ${
                                          completed
                                            ? "text-stone"
                                            : "text-stone/35"
                                        }`}
                                      >
                                        {
                                          step.description
                                        }
                                      </p>

                                      {step.key ===
                                        "paid" &&
                                        order.paid_at && (
                                          <p className="mt-2 text-[10px] text-stone">
                                            {formatDate(
                                              order.paid_at
                                            )}
                                          </p>
                                        )}

                                      {step.key ===
                                        "shipped" &&
                                        order.shipped_at && (
                                          <p className="mt-2 text-[10px] text-stone">
                                            {formatDate(
                                              order.shipped_at
                                            )}
                                          </p>
                                        )}

                                      {step.key ===
                                        "delivered" &&
                                        order.delivered_at && (
                                          <p className="mt-2 text-[10px] text-stone">
                                            {formatDate(
                                              order.delivered_at
                                            )}
                                          </p>
                                        )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>

                        <div className="border-t border-surface px-5 py-8 md:px-8">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                            Livraison
                          </p>

                          <div className="mt-6 grid gap-8 sm:grid-cols-2">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.25em] text-stone">
                                Mode
                              </p>

                              <p className="mt-3 text-sm">
                                {order.delivery_method ===
                                "relay"
                                  ? "Point Relais Mondial Relay"
                                  : "Livraison à domicile"}
                              </p>

                              <p className="mt-2 text-xs text-stone">
                                {order.shipping_amount ===
                                0
                                  ? "Livraison offerte"
                                  : formatPrice(
                                      order.shipping_amount
                                    )}
                              </p>
                            </div>

                            {order.delivery_method ===
                              "relay" &&
                              order.service_point && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.25em] text-stone">
                                    Point Relais
                                  </p>

                                  <p className="mt-3 text-sm">
                                    {order
                                      .service_point
                                      .name ||
                                      "Point Relais"}
                                  </p>

                                  {(order
                                    .service_point
                                    .address ||
                                    order
                                      .service_point
                                      .city) && (
                                    <p className="mt-2 text-xs leading-5 text-stone">
                                      {order
                                        .service_point
                                        .address && (
                                        <>
                                          {
                                            order
                                              .service_point
                                              .address
                                          }
                                          <br />
                                        </>
                                      )}

                                      {
                                        order
                                          .service_point
                                          .postal_code
                                      }{" "}
                                      {
                                        order
                                          .service_point
                                          .city
                                      }
                                    </p>
                                  )}
                                </div>
                              )}
                          </div>

                          {order.tracking_number && (
                            <div className="mt-8 border-t border-surface pt-8">
                              <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                  <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                                    Suivi transporteur
                                  </p>

                                  {order.carrier && (
                                    <p className="mt-3 text-sm">
                                      {
                                        order.carrier
                                      }
                                    </p>
                                  )}

                                  <p className="mt-2 font-mono text-xs text-stone">
                                    {
                                      order.tracking_number
                                    }
                                  </p>

                                  {order.shipped_at && (
                                    <p className="mt-2 text-[10px] text-stone">
                                      Expédiée le{" "}
                                      {formatDate(
                                        order.shipped_at
                                      )}
                                    </p>
                                  )}
                                </div>

                                {order.tracking_url && (
                                  <a
                                    href={
                                      order.tracking_url
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-fit rounded-full border border-foreground px-6 py-3 text-[9px] uppercase tracking-[0.25em] transition hover:bg-foreground hover:text-background"
                                  >
                                    Suivre mon colis →
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {!order.tracking_number &&
                            activeIndex < 2 && (
                              <div className="mt-8 border-t border-surface pt-6">
                                <p className="text-xs leading-6 text-stone">
                                  Le suivi transporteur apparaîtra ici dès que
                                  ta commande sera expédiée.
                                </p>
                              </div>
                            )}
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
        </div>
      </section>

      {orders.length > 0 &&
        !error && (
          <section className="border-t border-surface px-6 py-20 text-center md:px-8 md:py-28">
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