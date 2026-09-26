"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartContext";

type ClearPreorderCartProps = {
  enabled: boolean;
};

export default function ClearPreorderCart({
  enabled,
}: ClearPreorderCartProps) {
  const { clearCart } = useCart();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    clearCart();
  }, [enabled, clearCart]);

  return null;
}