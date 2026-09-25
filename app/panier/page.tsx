"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function PanierPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
  } = useCart();

  /*
   * =========================================================
   * DIMINUER UNE QUANTITÉ
   * =========================================================
   *
   * Si la quantité est supérieure à 1 :
   * on retire simplement une unité.
   *
   * Si la quantité est égale à 1 :
   * le bouton − retire complètement l'article du panier.
   */

  function decreaseQuantity(
    itemId: string,
    currentQuantity: number
  ) {
    if (currentQuantity <= 1) {
      removeItem(itemId);
      return;
    }

    updateQuantity(
      itemId,
      currentQuantity - 1
    );
  }

  /*
   * =========================================================
   * PANIER VIDE
   * =========================================================
   */

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-3xl">
          Ton panier est vide
        </h1>

        <Link
          href="/catalogue"
          className="text-sm uppercase tracking-widest text-stone hover:text-foreground"
        >
          Voir la collection
        </Link>
      </main>
    );
  }

  /*
   * =========================================================
   * PANIER
   * =========================================================
   */

  return (
    <main className="min-h-screen px-6 py-16">
      <h1 className="mb-10 text-center font-display text-3xl">
        Panier
      </h1>

      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 border-b border-surface pb-4"
          >
            {/* =============================================
                PRODUIT
            ============================================== */}

            <div>
              <p className="text-sm uppercase tracking-widest text-foreground">
                {item.name}
              </p>

              <p className="text-xs text-stone">
                {item.colorLabel} · Taille{" "}
                {item.size}
              </p>

              <button
                type="button"
                onClick={() =>
                  removeItem(item.id)
                }
                className="mt-1 text-[10px] uppercase tracking-widest text-stone underline hover:text-foreground"
              >
                Retirer
              </button>
            </div>

            {/* =============================================
                QUANTITÉ
            ============================================== */}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  decreaseQuantity(
                    item.id,
                    item.quantity
                  )
                }
                aria-label={
                  item.quantity <= 1
                    ? `Retirer ${item.name} du panier`
                    : `Diminuer la quantité de ${item.name}`
                }
                className="h-7 w-7 rounded-full border border-stone/40 text-xs transition hover:border-foreground"
              >
                −
              </button>

              <span className="w-4 text-center text-sm">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  updateQuantity(
                    item.id,
                    item.quantity + 1
                  )
                }
                aria-label={`Augmenter la quantité de ${item.name}`}
                className="h-7 w-7 rounded-full border border-stone/40 text-xs transition hover:border-foreground"
              >
                +
              </button>
            </div>

            {/* =============================================
                PRIX
            ============================================== */}

            <p className="w-20 text-right text-sm text-foreground">
              {(
                item.price *
                item.quantity
              ).toFixed(2)}{" "}
              €
            </p>
          </div>
        ))}

        {/* ===============================================
            TOTAL
        ================================================ */}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm uppercase tracking-widest text-stone">
            Total
          </p>

          <p className="text-lg text-foreground">
            {totalPrice.toFixed(2)} €
          </p>
        </div>

        {/* ===============================================
            VENTES FERMÉES POUR LE MOMENT
        ================================================ */}

        <div className="mt-4 flex flex-col items-center gap-2">
          <span
            aria-disabled="true"
            className="w-full cursor-not-allowed rounded-full border border-stone/40 px-6 py-3 text-center text-xs uppercase tracking-widest text-stone"
          >
            Bientôt disponible
          </span>

          <p className="text-center text-xs leading-5 text-stone">
            Le premier stock AJVEK arrive
            bientôt. Les commandes ouvriront
            dès sa mise en ligne.
          </p>
        </div>
      </div>
    </main>
  );
}