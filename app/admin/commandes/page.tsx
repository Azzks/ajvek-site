"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

type OrderItem = {
  product_slug: string;
  product_name: string;
  color: string;
  size: string;
  quantity: number;
};

type AdminOrder = {
  checkout_group_id: string;

  created_at: string | null;
  paid_at: string | null;

  customer: {
    user_id: string | null;
    name: string;
    email: string;
    phone: string | null;
  };

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

type OrderDraft = {
  status: string;
  carrier: string;
  tracking_number: string;
  tracking_url: string;
};

/*
 * ============================================================
 * STATUTS
 * ============================================================
 */

const STATUS_OPTIONS = [
  {
    value: "paid",
    label: "Commande confirmée",
  },
  {
    value: "preparing",
    label: "En préparation",
  },
  {
    value: "shipped",
    label: "Expédiée",
  },
  {
    value: "delivered",
    label: "Livrée",
  },
];

/*
 * ============================================================
 * COMPATIBILITÉ ANCIENS STATUTS
 * ============================================================
 */

function normalizeStatus(
  status: string | null | undefined
) {
  switch (status) {
    case "preorder_received":
    case "awaiting_payment":
      return "paid";

    case "production":
    case "manufacturing":
      return "preparing";

    case "shipped":
      return "shipped";

    case "delivered":
      return "delivered";

    default:
      return "paid";
  }
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
    return "—";
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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
  if (id.startsWith("legacy-")) {
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

export default function AdminCommandesPage() {
  const [orders, setOrders] =
    useState<AdminOrder[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [savingId, setSavingId] =
    useState<string | null>(null);

  const [drafts, setDrafts] =
    useState<
      Record<
        string,
        OrderDraft
      >
    >({});

  /*
   * ==========================================================
   * TOKEN ADMIN
   * ==========================================================
   */

  async function getAccessToken() {
    const {
      data: { session },
    } =
      await supabase.auth.getSession();

    return (
      session?.access_token ??
      null
    );
  }

  /*
   * ==========================================================
   * CHARGER LES COMMANDES
   * ==========================================================
   */

  async function loadOrders() {
    setLoading(true);
    setError(null);

    try {
      const token =
        await getAccessToken();

      if (!token) {
        setError(
          "Tu dois être connecté avec ton compte admin."
        );

        return;
      }

      const response =
        await fetch(
          "/api/admin/orders",
          {
            cache: "no-store",

            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Impossible de charger les commandes."
        );

        return;
      }

      const fetchedOrders: AdminOrder[] =
        Array.isArray(
          data.orders
        )
          ? data.orders
          : [];

      setOrders(
        fetchedOrders
      );

      const nextDrafts: Record<
        string,
        OrderDraft
      > = {};

      for (
        const order of fetchedOrders
      ) {
        nextDrafts[
          order.checkout_group_id
        ] = {
          status:
            normalizeStatus(
              order.status
            ),

          carrier:
            order.carrier ||
            "",

          tracking_number:
            order.tracking_number ||
            "",

          tracking_url:
            order.tracking_url ||
            "",
        };
      }

      setDrafts(
        nextDrafts
      );
    } catch (error) {
      console.error(
        "[admin-commandes]",
        error
      );

      setError(
        "Impossible de charger les commandes."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  /*
   * ==========================================================
   * MODIFIER UN BROUILLON
   * ==========================================================
   */

  function updateDraft(
    orderId: string,
    values: Partial<OrderDraft>
  ) {
    setDrafts(
      (current) => ({
        ...current,

        [orderId]: {
          ...current[
            orderId
          ],

          ...values,
        },
      })
    );
  }

  /*
   * ==========================================================
   * ENREGISTRER UNE COMMANDE
   * ==========================================================
   */

  async function saveOrder(
    order: AdminOrder
  ) {
    const draft =
      drafts[
        order.checkout_group_id
      ];

    if (!draft) {
      return;
    }

    setSavingId(
      order.checkout_group_id
    );

    setError(null);

    try {
      const token =
        await getAccessToken();

      if (!token) {
        setError(
          "Ta session a expiré."
        );

        return;
      }

      const response =
        await fetch(
          "/api/admin/orders",
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body:
              JSON.stringify({
                checkout_group_id:
                  order.checkout_group_id,

                status:
                  draft.status,

                carrier:
                  draft.carrier,

                tracking_number:
                  draft.tracking_number,

                tracking_url:
                  draft.tracking_url,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            "Impossible de modifier la commande."
        );

        return;
      }

      await loadOrders();
    } catch (error) {
      console.error(
        "[admin-commandes/save]",
        error
      );

      setError(
        "Impossible de modifier la commande."
      );
    } finally {
      setSavingId(
        null
      );
    }
  }

  /*
   * ==========================================================
   * RECHERCHE
   * ==========================================================
   */

  const filteredOrders =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return orders;
      }

      return orders.filter(
        (order) => {
          const itemText =
            order.items
              .map(
                (item) =>
                  `${item.product_name} ${item.color} ${item.size}`
              )
              .join(" ");

          return [
            order.customer.name,
            order.customer.email,
            order.customer.phone ||
              "",
            order.checkout_group_id,
            itemText,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              query
            );
        }
      );
    }, [
      orders,
      search,
    ]);

  /*
   * ==========================================================
   * COMPTEURS
   * ==========================================================
   */

  const totalPieces =
    orders.reduce(
      (
        total,
        order
      ) =>
        total +
        order.items.reduce(
          (
            itemTotal,
            item
          ) =>
            itemTotal +
            item.quantity,
          0
        ),
      0
    );

  const preparingCount =
    orders.filter(
      (order) =>
        normalizeStatus(
          order.status
        ) ===
        "preparing"
    ).length;

  const shippedCount =
    orders.filter(
      (order) =>
        normalizeStatus(
          order.status
        ) ===
        "shipped"
    ).length;

  const deliveredCount =
    orders.filter(
      (order) =>
        normalizeStatus(
          order.status
        ) ===
        "delivered"
    ).length;

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-surface px-6 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
            AJVEK · Administration
          </p>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-display text-4xl md:text-6xl">
                Commandes
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-stone">
                Gestion des
                commandes payées,
                de leur préparation
                jusqu&apos;à leur
                livraison.
              </p>
            </div>

            <button
              type="button"
              onClick={
                loadOrders
              }
              disabled={
                loading
              }
              className="w-fit rounded-full border border-surface px-5 py-3 text-[9px] uppercase tracking-[0.25em] transition hover:border-foreground disabled:opacity-50"
            >
              {loading
                ? "Actualisation..."
                : "Actualiser"}
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENU
      ====================================================== */}

      <section className="px-6 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              RÉSUMÉ
          ================================================= */}

          <div className="mb-10 grid grid-cols-2 gap-px bg-surface lg:grid-cols-5">
            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Commandes
              </p>

              <p className="mt-3 font-display text-3xl">
                {
                  orders.length
                }
              </p>
            </div>

            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Pièces
              </p>

              <p className="mt-3 font-display text-3xl">
                {
                  totalPieces
                }
              </p>
            </div>

            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Préparation
              </p>

              <p className="mt-3 font-display text-3xl">
                {
                  preparingCount
                }
              </p>
            </div>

            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Expédiées
              </p>

              <p className="mt-3 font-display text-3xl">
                {
                  shippedCount
                }
              </p>
            </div>

            <div className="bg-background p-5">
              <p className="text-[8px] uppercase tracking-[0.3em] text-stone">
                Livrées
              </p>

              <p className="mt-3 font-display text-3xl">
                {
                  deliveredCount
                }
              </p>
            </div>
          </div>

          {/* =================================================
              RECHERCHE
          ================================================= */}

          <div className="mb-8 flex flex-col gap-4 border-b border-surface pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                Commandes payées
              </p>

              <p className="mt-2 font-display text-2xl">
                {
                  orders.length
                }
              </p>
            </div>

            <input
              value={
                search
              }
              onChange={(
                event
              ) =>
                setSearch(
                  event
                    .target
                    .value
                )
              }
              placeholder="Nom, email, produit..."
              className="w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none placeholder:text-stone/50 md:max-w-sm"
            />
          </div>

          {/* =================================================
              CHARGEMENT
          ================================================= */}

          {loading && (
            <p className="text-sm text-stone">
              Chargement des
              commandes...
            </p>
          )}

          {/* =================================================
              ERREUR
          ================================================= */}

          {error && (
            <div className="mb-8 border border-surface p-5">
              <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                Erreur
              </p>

              <p className="mt-3 text-sm">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              VIDE
          ================================================= */}

          {!loading &&
            !error &&
            filteredOrders.length ===
              0 && (
              <div className="border border-surface px-6 py-16 text-center">
                <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
                  Administration
                  AJVEK
                </p>

                <h2 className="mt-5 font-display text-3xl">
                  {search
                    ? "Aucun résultat."
                    : "Aucune commande payée."}
                </h2>
              </div>
            )}

          {/* =================================================
              COMMANDES
          ================================================= */}

          {!loading && (
            <div className="space-y-8">
              {filteredOrders.map(
                (order) => {
                  const draft =
                    drafts[
                      order
                        .checkout_group_id
                    ];

                  if (!draft) {
                    return null;
                  }

                  const pieceCount =
                    order.items.reduce(
                      (
                        total,
                        item
                      ) =>
                        total +
                        item.quantity,
                      0
                    );

                  return (
                    <article
                      key={
                        order.checkout_group_id
                      }
                      className="border border-surface"
                    >
                      {/* =====================================
                          HEADER
                      ====================================== */}

                      <div className="border-b border-surface px-5 py-6 md:px-7">
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                              Commande
                            </p>

                            <h2 className="mt-2 font-display text-2xl">
                              #
                              {shortOrderId(
                                order.checkout_group_id
                              )}
                            </h2>

                            <p className="mt-4 text-sm">
                              {
                                order
                                  .customer
                                  .name
                              }
                            </p>

                            <p className="mt-1 text-xs text-stone">
                              {
                                order
                                  .customer
                                  .email
                              }
                            </p>

                            {order
                              .customer
                              .phone && (
                              <p className="mt-1 text-xs text-stone">
                                {
                                  order
                                    .customer
                                    .phone
                                }
                              </p>
                            )}
                          </div>

                          <div className="md:text-right">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                              Paiement
                            </p>

                            <p className="mt-2 text-xs">
                              {formatDate(
                                order.paid_at
                              )}
                            </p>

                            <p className="mt-3 text-[10px] text-stone">
                              {
                                pieceCount
                              }{" "}
                              pièce
                              {pieceCount >
                              1
                                ? "s"
                                : ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid lg:grid-cols-[1fr_0.9fr]">

                        {/* ===================================
                            ARTICLES
                        ==================================== */}

                        <div className="border-b border-surface p-5 md:p-7 lg:border-b-0 lg:border-r">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                            Articles
                          </p>

                          <div className="mt-5 divide-y divide-surface border-y border-surface">
                            {order.items.map(
                              (
                                item,
                                index
                              ) => (
                                <div
                                  key={`${item.product_slug}-${item.color}-${item.size}-${index}`}
                                  className="flex items-start justify-between gap-4 py-4"
                                >
                                  <div>
                                    <p className="font-display text-lg">
                                      {
                                        item.product_name
                                      }
                                    </p>

                                    <p className="mt-1 text-xs text-stone">
                                      {
                                        item.color
                                      }{" "}
                                      ·
                                      Taille{" "}
                                      {
                                        item.size
                                      }
                                    </p>
                                  </div>

                                  <p className="text-xs text-stone">
                                    ×{" "}
                                    {
                                      item.quantity
                                    }
                                  </p>
                                </div>
                              )
                            )}
                          </div>

                          {/* ===============================
                              LIVRAISON
                          ================================ */}

                          <div className="mt-7">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                              Livraison
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

                            {order.service_point && (
                              <div className="mt-4 text-xs leading-5 text-stone">
                                <p className="text-foreground">
                                  {order
                                    .service_point
                                    .name ||
                                    "Point Relais"}
                                </p>

                                {order
                                  .service_point
                                  .address && (
                                  <p className="mt-1">
                                    {
                                      order
                                        .service_point
                                        .address
                                    }
                                  </p>
                                )}

                                {(order
                                  .service_point
                                  .postal_code ||
                                  order
                                    .service_point
                                    .city) && (
                                  <p>
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

                          {/* ===============================
                              DATES LOGISTIQUES
                          ================================ */}

                          {(order.shipped_at ||
                            order.delivered_at) && (
                            <div className="mt-7 border-t border-surface pt-6">
                              {order.shipped_at && (
                                <p className="text-xs text-stone">
                                  Expédiée :{" "}
                                  <span className="text-foreground">
                                    {formatDate(
                                      order.shipped_at
                                    )}
                                  </span>
                                </p>
                              )}

                              {order.delivered_at && (
                                <p className="mt-2 text-xs text-stone">
                                  Livrée :{" "}
                                  <span className="text-foreground">
                                    {formatDate(
                                      order.delivered_at
                                    )}
                                  </span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ===================================
                            GESTION
                        ==================================== */}

                        <div className="p-5 md:p-7">
                          <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                            Gestion
                          </p>

                          <div className="mt-5 space-y-5">

                            {/* =============================
                                STATUT
                            ============================== */}

                            <div>
                              <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                                Statut
                              </label>

                              <select
                                value={
                                  draft.status
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateDraft(
                                    order.checkout_group_id,
                                    {
                                      status:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                className="mt-2 w-full border border-surface bg-background px-4 py-3 text-sm outline-none"
                              >
                                {STATUS_OPTIONS.map(
                                  (
                                    status
                                  ) => (
                                    <option
                                      key={
                                        status.value
                                      }
                                      value={
                                        status.value
                                      }
                                    >
                                      {
                                        status.label
                                      }
                                    </option>
                                  )
                                )}
                              </select>
                            </div>

                            {/* =============================
                                TRANSPORTEUR
                            ============================== */}

                            <div>
                              <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                                Transporteur
                              </label>

                              <input
                                value={
                                  draft.carrier
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateDraft(
                                    order.checkout_group_id,
                                    {
                                      carrier:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                placeholder="Mondial Relay"
                                className="mt-2 w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none"
                              />
                            </div>

                            {/* =============================
                                NUMÉRO DE SUIVI
                            ============================== */}

                            <div>
                              <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                                Numéro de suivi
                              </label>

                              <input
                                value={
                                  draft.tracking_number
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateDraft(
                                    order.checkout_group_id,
                                    {
                                      tracking_number:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                placeholder="123456789"
                                className="mt-2 w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none"
                              />
                            </div>

                            {/* =============================
                                LIEN DE SUIVI
                            ============================== */}

                            <div>
                              <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                                Lien de suivi
                              </label>

                              <input
                                value={
                                  draft.tracking_url
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateDraft(
                                    order.checkout_group_id,
                                    {
                                      tracking_url:
                                        event
                                          .target
                                          .value,
                                    }
                                  )
                                }
                                placeholder="https://..."
                                className="mt-2 w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none"
                              />
                            </div>

                            {/* =============================
                                ENREGISTRER
                            ============================== */}

                            <button
                              type="button"
                              onClick={() =>
                                saveOrder(
                                  order
                                )
                              }
                              disabled={
                                savingId ===
                                order.checkout_group_id
                              }
                              className="w-full bg-foreground px-5 py-4 text-[10px] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {savingId ===
                              order.checkout_group_id
                                ? "Enregistrement..."
                                : "Enregistrer les modifications"}
                            </button>

                            {draft.status ===
                              "shipped" &&
                              !draft.tracking_number && (
                                <p className="text-[10px] leading-5 text-stone">
                                  Pense à renseigner
                                  le numéro de suivi
                                  avant de passer la
                                  commande en
                                  « Expédiée ».
                                </p>
                              )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}