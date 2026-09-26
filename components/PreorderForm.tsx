"use client";

import type {
  Product,
  Colorway,
} from "@/lib/products";

import MadeInFrance from "@/components/MadeInFrance";

type StockItem = {
  product_slug: string;
  color: string;
  size: string;
  stock_quantity: number;
  sales_enabled: boolean;
  available: boolean;
};

export default function PreorderForm({
  product,
  colorway,
  size,
  selectedStock,
  stockLoading,
  stockError,
}: {
  product: Product;
  colorway: Colorway;
  size: string | null;
  selectedStock: StockItem | null;
  stockLoading: boolean;
  stockError: boolean;
}) {
  /*
   * =========================================================
   * ÉTAT DE LA VENTE
   * =========================================================
   *
   * Tant que sales_enabled = false dans Supabase,
   * aucune commande ne peut être passée.
   */

  const salesEnabled =
    selectedStock?.sales_enabled === true;

  const quantity = Math.max(
    Number(selectedStock?.stock_quantity ?? 0),
    0
  );

  const available =
    salesEnabled &&
    quantity > 0;

  const soldOut =
    salesEnabled &&
    quantity <= 0;

  /*
   * =========================================================
   * TEXTE PRINCIPAL
   * =========================================================
   */

  let statusTitle =
    "Bientôt disponible";

  let statusDescription =
    "Le premier stock AJVEK arrive bientôt. Quantités limitées pour ce premier drop.";

  if (stockLoading) {
    statusTitle =
      "Vérification des disponibilités";

    statusDescription =
      "Chargement des informations du premier drop.";
  } else if (stockError) {
    statusTitle =
      "Bientôt disponible";

    statusDescription =
      "Les disponibilités sont momentanément indisponibles. Réessaie dans quelques instants.";
  } else if (
    size &&
    soldOut
  ) {
    statusTitle = "Épuisé";

    statusDescription =
      `La taille ${size} est actuellement épuisée en ${colorway.label}.`;
  } else if (
    size &&
    available
  ) {
    statusTitle = "Disponible";

    statusDescription =
      `${quantity} pièce${
        quantity > 1 ? "s" : ""
      } disponible${
        quantity > 1 ? "s" : ""
      } en ${colorway.label}, taille ${size}.`;
  }

  /*
   * =========================================================
   * BOUTON
   * =========================================================
   */

  let buttonLabel =
    "Bientôt disponible";

  if (stockLoading) {
    buttonLabel = "Chargement...";
  } else if (stockError) {
    buttonLabel =
      "Indisponible momentanément";
  } else if (!size) {
    buttonLabel = salesEnabled
      ? "Choisir une taille"
      : "Bientôt disponible";
  } else if (soldOut) {
    buttonLabel = "Épuisé";
  } else if (available) {
    buttonLabel = "Disponible";
  }

  return (
    <div className="w-full">
      {/* =====================================================
          DISPONIBILITÉ
      ====================================================== */}

      <div className="pt-2 sm:pt-0">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-stone">
              DROP 001
            </p>

            <p className="mt-3 font-display text-xl leading-tight text-foreground">
              {statusTitle}
            </p>
          </div>

          <span
            className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
              available
                ? "bg-foreground"
                : "bg-stone/40"
            }`}
          />
        </div>

        <p className="mt-5 max-w-md text-xs leading-6 text-stone">
          {statusDescription}
        </p>
      </div>

      {/* =====================================================
          OFFRE LANCEMENT
      ====================================================== */}

      <div className="mt-7 border-y border-surface py-7">
        <p className="text-[9px] uppercase tracking-[0.3em] text-stone">
          Offre de lancement
        </p>

        <p className="mt-4 font-display text-lg leading-7 text-foreground">
          Les 10 premières commandes participent
          au tirage au sort.
        </p>

        <p className="mt-3 text-xs leading-5 text-stone">
          Une chance de gagner un bon
          d&apos;achat de -30 % valable sur une
          prochaine commande AJVEK.
        </p>
      </div>

      {/* =====================================================
          PRODUIT SÉLECTIONNÉ
      ====================================================== */}

      <div className="mt-7">
        <div className="border border-surface px-4 py-5">
          <p className="text-[9px] uppercase tracking-[0.25em] text-stone">
            Sélection
          </p>

          <p className="mt-3 text-xs leading-5 text-foreground">
            {product.name} ·{" "}
            {colorway.label}
            {size
              ? ` · Taille ${size}`
              : ""}
          </p>

          {size &&
            available && (
              <p className="mt-2 text-[10px] leading-5 text-stone">
                {quantity} pièce
                {quantity > 1
                  ? "s"
                  : ""}{" "}
                disponible
                {quantity > 1
                  ? "s"
                  : ""}
              </p>
            )}
        </div>
      </div>

      {/* =====================================================
          BOUTON
      ====================================================== */}

      <div className="mt-5">
        <button
          type="button"
          disabled
          className="w-full cursor-not-allowed rounded-full border border-surface bg-surface px-6 py-4 text-[10px] uppercase tracking-[0.25em] text-stone opacity-70"
        >
          {buttonLabel}
        </button>

        <p className="mt-4 px-3 text-center text-[10px] leading-5 text-stone">
          {!salesEnabled
            ? "Les achats seront ouverts dès l'arrivée du premier stock."
            : soldOut
              ? "Cette taille n'est plus disponible."
              : !size
                ? "Sélectionne une taille pour continuer."
                : "Les commandes seront bientôt accessibles."}
        </p>
      </div>

      {/* =====================================================
          MADE IN FRANCE
      ====================================================== */}

      <div className="mt-7 border-t border-surface pt-6">
        <MadeInFrance />
      </div>
    </div>
  );
}