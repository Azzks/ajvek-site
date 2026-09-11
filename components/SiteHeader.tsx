"use client";

import { useState } from "react";
import Link from "next/link";
import CartLink from "@/components/CartLink";

const NAV_LINKS = [
  { href: "/catalogue", label: "Collection" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative border-b border-surface">
      <div className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-display text-xl tracking-wide"
          onClick={() => setOpen(false)}
        >
          AJVEK
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-stone md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <CartLink />
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="relative z-50 flex h-6 w-6 flex-col items-center justify-center md:hidden"
        >
          <span
            className={`absolute h-px w-6 bg-foreground transition-all duration-300 ease-out ${
              open ? "translate-y-0 rotate-45" : "-translate-y-2"
            }`}
          />
          <span
            className={`absolute h-px w-6 bg-foreground transition-opacity duration-200 ease-out ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute h-px w-6 bg-foreground transition-all duration-300 ease-out ${
              open ? "translate-y-0 -rotate-45" : "translate-y-2"
            }`}
          />
        </button>
      </div>

      <div
        className={`overflow-hidden transition-[max-height] duration-300 ease-in-out md:hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col items-center gap-6 border-t border-surface bg-background px-6 py-8 text-sm uppercase tracking-widest text-stone">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div onClick={() => setOpen(false)}>
            <CartLink />
          </div>
        </nav>
      </div>
    </header>
  );
}
