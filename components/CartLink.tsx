"use client";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

export default function CartLink() {
  const { totalItems } = useCart();
  return (
    <Link href="/panier" className="hover:text-foreground transition-colors">
      Panier{totalItems > 0 ? ` (${totalItems})` : ""}
    </Link>
  );
}