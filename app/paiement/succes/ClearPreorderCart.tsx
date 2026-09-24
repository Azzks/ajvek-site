"use client";

import { useEffect } from "react";

const STORAGE_KEY = "ajvek-preorder-cart";

export default function ClearPreorderCart() {
  useEffect(() => {
    localStorage.removeItem(STORAGE_KEY);

    window.dispatchEvent(
      new Event("ajvek-cart-updated")
    );
  }, []);

  return null;
}