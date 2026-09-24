"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const NAV_LINKS = [
  { href: "/catalogue", label: "Collection" },
  { href: "/precommande", label: "Ma précommande" },
  { href: "/mes-commandes", label: "Mes commandes" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const ADMIN_LINK = {
  href: "/admin/commandes",
  label: "Administration",
};

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          if (active) {
            setIsAdmin(false);
          }

          return;
        }

        const response = await fetch("/api/admin/orders", {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (active) {
          setIsAdmin(response.ok);
        }
      } catch (error) {
        console.error("[SiteHeader] Vérification admin :", error);

        if (active) {
          setIsAdmin(false);
        }
      }
    }

    checkAdmin();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const visibleLinks = isAdmin
    ? [...NAV_LINKS, ADMIN_LINK]
    : NAV_LINKS;

  return (
    <>
      {/* HEADER */}
      <header className="relative z-40 border-b border-surface bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
          {/* LOGO */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-display text-xl tracking-[0.18em] text-foreground transition-opacity hover:opacity-70 md:text-2xl"
          >
            AJVEK
          </Link>

          {/* NAV DESKTOP */}
          <nav className="hidden items-center gap-7 text-[11px] uppercase tracking-[0.2em] text-stone md:flex">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.href === "/admin/commandes"
                    ? "text-foreground transition-opacity hover:opacity-70"
                    : "transition-colors hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP FRANCE */}
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
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Ouvrir le menu"
            className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span className="h-px w-6 bg-foreground" />
            <span className="h-px w-6 bg-foreground" />
            <span className="h-px w-6 bg-foreground" />
          </button>
        </div>
      </header>

      {/* MENU MOBILE PLEIN ÉCRAN */}
      <div
        className={`fixed inset-0 z-[100] bg-[#0c0c0b] text-[#f3f0ea] transition-all duration-500 md:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        <div className="flex h-[100svh] flex-col px-6">
          {/* TOP */}
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="font-display text-xl tracking-[0.18em]"
            >
              AJVEK
            </Link>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fermer le menu"
              className="relative h-10 w-10"
            >
              <span className="absolute left-1/2 top-1/2 h-px w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
              <span className="absolute left-1/2 top-1/2 h-px w-7 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white" />
            </button>
          </div>

          {/* NAV */}
          <div className="flex flex-1 flex-col justify-center">
            <p className="mb-6 text-[10px] uppercase tracking-[0.4em] text-stone-500">
              Navigation
            </p>

            <nav>
              {visibleLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between border-t border-white/10 py-4 ${
                    link.href === "/admin/commandes"
                      ? "text-white"
                      : ""
                  }`}
                >
                  <span className="font-display text-[2rem] leading-none">
                    {link.label}
                  </span>

                  <span className="text-[10px] tracking-[0.25em] text-stone-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              ))}

              <div className="border-t border-white/10" />
            </nav>
          </div>

          {/* BOTTOM */}
          <div className="shrink-0 border-t border-white/10 py-6">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">
                  AJVEK
                </p>

                <p className="mt-3 text-xs leading-5 text-stone-400">
                  Précommande · Produit en France
                  <br />
                  Paiement sécurisé par Stripe
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
    </>
  );
}