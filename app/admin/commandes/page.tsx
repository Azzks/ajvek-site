"use client";

import { useEffect, useMemo, useState } from "react";
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

const STATUS_OPTIONS = [
  {
    value: "preorder_received",
    label: "Précommande reçue",
  },
  {
    value: "production",
    label: "Production lancée",
  },
  {
    value: "manufacturing",
    label: "En fabrication",
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

function formatDate(date: string | null) {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function shortOrderId(id: string) {
  return id.replaceAll("-", "").slice(0, 8).toUpperCase();
}

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [savingId, setSavingId] = useState<string | null>(null);

  const [drafts, setDrafts] = useState<
    Record<
      string,
      {
        status: string;
        carrier: string;
        tracking_number: string;
        tracking_url: string;
      }
    >
  >({});

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }

  async function loadOrders() {
    setLoading(true);
    setError(null);

    try {
      const token = await getAccessToken();

      if (!token) {
        setError("Tu dois être connecté avec ton compte admin.");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/admin/orders", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Impossible de charger les commandes.");
        return;
      }

      const fetchedOrders: AdminOrder[] = data.orders ?? [];

      setOrders(fetchedOrders);

      const nextDrafts: typeof drafts = {};

      for (const order of fetchedOrders) {
        nextDrafts[order.checkout_group_id] = {
          status: order.status || "preorder_received",
          carrier: order.carrier || "",
          tracking_number: order.tracking_number || "",
          tracking_url: order.tracking_url || "",
        };
      }

      setDrafts(nextDrafts);
    } catch (error) {
      console.error("[admin-commandes]", error);

      setError("Impossible de charger les commandes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function saveOrder(order: AdminOrder) {
    const draft = drafts[order.checkout_group_id];

    if (!draft) {
      return;
    }

    setSavingId(order.checkout_group_id);
    setError(null);

    try {
      const token = await getAccessToken();

      if (!token) {
        setError("Ta session a expiré.");
        return;
      }

      const response = await fetch("/api/admin/orders", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          checkout_group_id: order.checkout_group_id,
          status: draft.status,
          carrier: draft.carrier,
          tracking_number: draft.tracking_number,
          tracking_url: draft.tracking_url,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Impossible de modifier la commande.");
        return;
      }

      await loadOrders();
    } catch (error) {
      console.error("[admin-commandes/save]", error);

      setError("Impossible de modifier la commande.");
    } finally {
      setSavingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const itemText = order.items
        .map(
          (item) =>
            `${item.product_name} ${item.color} ${item.size}`
        )
        .join(" ");

      return [
        order.customer.name,
        order.customer.email,
        order.customer.phone || "",
        order.checkout_group_id,
        itemText,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [orders, search]);

  return (
    <main className="min-h-screen bg-background text-foreground">
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
                Gestion des commandes payées, de la précommande
                jusqu&apos;à la livraison.
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              className="w-fit rounded-full border border-surface px-5 py-3 text-[9px] uppercase tracking-[0.25em]"
            >
              Actualiser
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 border-b border-surface pb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                Commandes payées
              </p>

              <p className="mt-2 font-display text-2xl">
                {orders.length}
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nom, email, produit..."
              className="w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none placeholder:text-stone/50 md:max-w-sm"
            />
          </div>

          {loading && (
            <p className="text-sm text-stone">
              Chargement des commandes...
            </p>
          )}

          {error && (
            <div className="mb-8 border border-surface p-5">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filteredOrders.length === 0 && (
            <div className="border border-surface px-6 py-16 text-center">
              <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
                Administration AJVEK
              </p>

              <h2 className="mt-5 font-display text-3xl">
                Aucune commande payée.
              </h2>
            </div>
          )}

          <div className="space-y-8">
            {filteredOrders.map((order) => {
              const draft = drafts[order.checkout_group_id];

              if (!draft) {
                return null;
              }

              return (
                <article
                  key={order.checkout_group_id}
                  className="border border-surface"
                >
                  <div className="border-b border-surface px-5 py-6 md:px-7">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                          Commande
                        </p>

                        <h2 className="mt-2 font-display text-2xl">
                          #{shortOrderId(order.checkout_group_id)}
                        </h2>

                        <p className="mt-4 text-sm">
                          {order.customer.name}
                        </p>

                        <p className="mt-1 text-xs text-stone">
                          {order.customer.email}
                        </p>

                        {order.customer.phone && (
                          <p className="mt-1 text-xs text-stone">
                            {order.customer.phone}
                          </p>
                        )}
                      </div>

                      <div className="md:text-right">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                          Paiement
                        </p>

                        <p className="mt-2 text-xs">
                          {formatDate(order.paid_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-[1fr_0.9fr]">
                    <div className="border-b border-surface p-5 md:p-7 lg:border-b-0 lg:border-r">
                      <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                        Articles
                      </p>

                      <div className="mt-5 divide-y divide-surface border-y border-surface">
                        {order.items.map((item, index) => (
                          <div
                            key={`${item.product_slug}-${item.color}-${item.size}-${index}`}
                            className="flex items-start justify-between gap-4 py-4"
                          >
                            <div>
                              <p className="font-display text-lg">
                                {item.product_name}
                              </p>

                              <p className="mt-1 text-xs text-stone">
                                {item.color} · Taille {item.size}
                              </p>
                            </div>

                            <p className="text-xs text-stone">
                              × {item.quantity}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-7">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                          Livraison
                        </p>

                        <p className="mt-3 text-sm">
                          {order.delivery_method === "relay"
                            ? "Point Relais"
                            : "Domicile"}
                        </p>

                        {order.service_point && (
                          <div className="mt-3 text-xs leading-5 text-stone">
                            <p>
                              {order.service_point.name || "Point Relais"}
                            </p>

                            {order.service_point.address && (
                              <p>{order.service_point.address}</p>
                            )}

                            <p>
                              {order.service_point.postal_code}{" "}
                              {order.service_point.city}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 md:p-7">
                      <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
                        Gestion
                      </p>

                      <div className="mt-5 space-y-5">
                        <div>
                          <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                            Statut
                          </label>

                          <select
                            value={draft.status}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [order.checkout_group_id]: {
                                  ...current[order.checkout_group_id],
                                  status: event.target.value,
                                },
                              }))
                            }
                            className="mt-2 w-full border border-surface bg-background px-4 py-3 text-sm outline-none"
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option
                                key={status.value}
                                value={status.value}
                              >
                                {status.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                            Transporteur
                          </label>

                          <input
                            value={draft.carrier}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [order.checkout_group_id]: {
                                  ...current[order.checkout_group_id],
                                  carrier: event.target.value,
                                },
                              }))
                            }
                            placeholder="Mondial Relay"
                            className="mt-2 w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                            Numéro de suivi
                          </label>

                          <input
                            value={draft.tracking_number}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [order.checkout_group_id]: {
                                  ...current[order.checkout_group_id],
                                  tracking_number: event.target.value,
                                },
                              }))
                            }
                            placeholder="123456789"
                            className="mt-2 w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase tracking-[0.2em] text-stone">
                            Lien de suivi
                          </label>

                          <input
                            value={draft.tracking_url}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [order.checkout_group_id]: {
                                  ...current[order.checkout_group_id],
                                  tracking_url: event.target.value,
                                },
                              }))
                            }
                            placeholder="https://..."
                            className="mt-2 w-full border border-surface bg-transparent px-4 py-3 text-sm outline-none"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => saveOrder(order)}
                          disabled={
                            savingId === order.checkout_group_id
                          }
                          className="w-full bg-foreground px-5 py-4 text-[10px] uppercase tracking-[0.25em] text-background disabled:opacity-50"
                        >
                          {savingId === order.checkout_group_id
                            ? "Enregistrement..."
                            : "Enregistrer les modifications"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}