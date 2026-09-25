"use client";

import { useEffect } from "react";

const STORAGE_KEY = "ajvek-preorder-cart";
const CART_UPDATED_EVENT = "ajvek-cart-updated";

export default function ClearPreorderCart() {
  useEffect(() => {
    try {
      /*
       * Le panier est supprimé uniquement lorsque
       * ce composant est monté sur la page de
       * confirmation de paiement.
       */
      localStorage.removeItem(STORAGE_KEY);

      /*
       * Informe immédiatement les autres composants
       * du site que le panier a été modifié.
       */
      window.dispatchEvent(
        new Event(CART_UPDATED_EVENT)
      );
    } catch (error) {
      console.error(
        "[ClearPreorderCart] Impossible de vider le panier :",
        error
      );
    }
  }, []);

  return null;
}