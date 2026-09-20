"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/catalogue", label: "Collection" },
  { href: "/precommande", label: "Ma précommande" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-surface bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        {/* LOGO */}
        <Link
          href="/"
          className="font-display text-xl tracking-[0.18em] text-foreground transition-opacity hover:opacity-70 md:text-2xl"
          onClick={() => setOpen(false)}
        >
          AJVEK
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.22em] text-stone md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT DESKTOP */}
        <div className="hidden items-center gap-4 md:flex">
          <span className="text-[10px] uppercase tracking-[0.25em] text-stone">
            Produit en France
          </span>

          <span
            className="text-sm"
            role="img"
            aria-label="Produits fabriqués en France"
          >
            🇫🇷
          </span>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className="relative z-[60] flex h-8 w-8 items-center justify-center md:hidden"
        >
          <span
            className={`absolute h-px w-6 bg-foreground transition-all duration-300 ${
              open ? "rotate-45" : "-translate-y-[7px]"
            }`}
          />

          <span
            className={`absolute h-px w-6 bg-foreground transition-all duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />

          <span
            className={`absolute h-px w-6 bg-foreground transition-all duration-300 ${
              open ? "-rotate-45" : "translate-y-[7px]"
            }`}
          />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-50 bg-[#0c0c0b] text-[#f3f0ea] transition-all duration-500 md:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        }`}
      >
        <div className="flex h-full flex-col px-6 pb-8 pt-24">
          <div className="flex flex-1 flex-col justify-center">
            <p className="mb-8 text-[10px] uppercase tracking-[0.4em] text-stone-500">
              Navigation
            </p>

            <nav className="flex flex-col">
              {NAV_LINKS.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between border-t border-white/10 py-5"
                >
                  <span className="font-display text-3xl leading-none">
                    {link.label}
                  </span>

                  <span className="text-[10px] uppercase tracking-[0.25em] text-stone-500 transition group-hover:text-white">
                    0{index + 1}
                  </span>
                </Link>
              ))}

              <div className="border-t border-white/10" />
            </nav>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-500">
                  AJVEK
                </p>

                <p className="mt-2 text-xs text-stone-400">
                  Précommande · Produit en France
                </p>
              </div>

              <span
                className="text-lg"
                role="img"
                aria-label="Produits fabriqués en France"
              >
                🇫🇷
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}