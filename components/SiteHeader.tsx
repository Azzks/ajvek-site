"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PRIMARY_LINKS = [
  { href: "/catalogue", label: "Collection" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/a-propos", label: "À propos" },
];

const MENU_LINKS = [
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
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  /* =========================================================
     SCROLL HEADER
  ========================================================= */

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =========================================================
     BLOQUER LE SCROLL QUAND MENU OUVERT
  ========================================================= */

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

  /* =========================================================
     FERMER LE MENU AU CHANGEMENT DE PAGE
  ========================================================= */

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* =========================================================
     COMPTEUR PRÉCOMMANDE
  ========================================================= */

  useEffect(() => {
    function updateCartCount() {
      try {
        const stored = localStorage.getItem(
          "ajvek-preorder-cart"
        );

        if (!stored) {
          setCartCount(0);
          return;
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          setCartCount(0);
          return;
        }

        const total = parsed.reduce(
          (
            sum: number,
            item: { quantity?: number }
          ) => {
            return sum + Number(item.quantity || 0);
          },
          0
        );

        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();

    window.addEventListener(
      "storage",
      updateCartCount
    );

    window.addEventListener(
      "focus",
      updateCartCount
    );

    const interval = window.setInterval(
      updateCartCount,
      1000
    );

    return () => {
      window.removeEventListener(
        "storage",
        updateCartCount
      );

      window.removeEventListener(
        "focus",
        updateCartCount
      );

      window.clearInterval(interval);
    };
  }, []);

  /* =========================================================
     ADMIN
  ========================================================= */

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

        const response = await fetch(
          "/api/admin/orders",
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (active) {
          setIsAdmin(response.ok);
        }
      } catch (error) {
        console.error(
          "[SiteHeader] Vérification admin :",
          error
        );

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

  const menuLinks = isAdmin
    ? [...MENU_LINKS, ADMIN_LINK]
    : MENU_LINKS;

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.07] bg-background/85 backdrop-blur-xl"
            : "border-b border-surface bg-background"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-all duration-500 md:px-8 ${
            scrolled
              ? "h-[58px]"
              : "h-[68px] md:h-[74px]"
          }`}
        >
          {/* =================================================
              LOGO
          ================================================== */}

          <Link
            href="/"
            aria-label="AJVEK — Accueil"
            className="group relative z-10"
          >
            <span className="block font-display text-xl tracking-[0.18em] text-foreground transition-all duration-300 group-hover:tracking-[0.22em] md:text-[22px]">
              AJVEK
            </span>
          </Link>

          {/* =================================================
              NAV DESKTOP
          ================================================== */}

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
            {PRIMARY_LINKS.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative py-2 text-[9px] uppercase tracking-[0.3em] transition-colors duration-300 ${
                    active
                      ? "text-foreground"
                      : "text-stone hover:text-foreground"
                  }`}
                >
                  {link.label}

                  <span
                    className={`absolute bottom-0 left-0 h-px bg-foreground transition-all duration-300 ${
                      active
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* =================================================
              ACTIONS DESKTOP
          ================================================== */}

          <div className="hidden items-center md:flex">
            <Link
              href="/mes-commandes"
              className="group mr-7 text-[9px] uppercase tracking-[0.28em] text-stone transition-colors hover:text-foreground"
            >
              Compte
            </Link>

            <Link
              href="/precommande"
              className="group flex items-center gap-3 rounded-full border border-surface px-4 py-2.5 transition-all duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
            >
              <span className="text-[9px] uppercase tracking-[0.27em]">
                Précommande
              </span>

              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[8px] transition-colors ${
                  cartCount > 0
                    ? "bg-foreground text-background group-hover:bg-background group-hover:text-foreground"
                    : "bg-surface text-stone group-hover:bg-background group-hover:text-foreground"
                }`}
              >
                {cartCount}
              </span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin/commandes"
                className="ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-surface text-[8px] uppercase tracking-[0.15em] text-stone transition hover:border-foreground hover:text-foreground"
                aria-label="Administration"
              >
                A
              </Link>
            )}
          </div>

          {/* =================================================
              MOBILE ACTIONS
          ================================================== */}

          <div className="flex items-center gap-3 md:hidden">
            <Link
              href="/precommande"
              aria-label={`Précommande — ${cartCount} article${
                cartCount > 1 ? "s" : ""
              }`}
              className="relative flex h-9 min-w-9 items-center justify-center"
            >
              <span className="text-[9px] uppercase tracking-[0.2em]">
                Bag
              </span>

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[7px] text-background">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              className="group flex h-10 w-10 flex-col items-end justify-center gap-[6px]"
            >
              <span className="h-px w-6 bg-foreground transition-all duration-300 group-hover:w-5" />

              <span className="h-px w-4 bg-foreground transition-all duration-300 group-hover:w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================
          MENU MOBILE
      ====================================================== */}

      <div
        className={`fixed inset-0 z-[100] bg-[#0c0c0b] text-[#f3f0ea] transition-all duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] md:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0"
        }`}
      >
        {/* GHOST TEXT */}

        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 top-1/2 -translate-y-1/2 font-display text-[55vw] leading-none text-white/[0.018]"
        >
          A
        </div>

        <div className="relative z-10 flex h-[100svh] flex-col px-5">
          {/* =================================================
              MENU TOP
          ================================================== */}

          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="font-display text-xl tracking-[0.18em]"
            >
              AJVEK
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="/precommande"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2"
              >
                <span className="text-[8px] uppercase tracking-[0.3em] text-stone-400">
                  Précommande
                </span>

                <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-white/15 px-1 text-[8px]">
                  {cartCount}
                </span>
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
          </div>

          {/* =================================================
              MENU LINKS
          ================================================== */}

          <div className="flex min-h-0 flex-1 flex-col justify-center py-5">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-[8px] uppercase tracking-[0.42em] text-stone-500">
                Navigation
              </p>

              <p className="text-[8px] uppercase tracking-[0.35em] text-stone-600">
                Drop 001
              </p>
            </div>

            <nav>
              {menuLinks.map((link, index) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between border-t border-white/10 py-[13px]"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-display text-[1.85rem] leading-none tracking-[-0.02em] transition-all duration-300 ${
                          active
                            ? "text-white"
                            : "text-white/75 group-hover:text-white"
                        }`}
                      >
                        {link.label}
                      </span>

                      {active && (
                        <span className="h-1 w-1 rounded-full bg-white" />
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[8px] tracking-[0.25em] text-stone-600">
                        {String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </span>

                      <span className="translate-x-1 text-sm text-stone-600 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-white group-hover:opacity-100">
                        →
                      </span>
                    </div>
                  </Link>
                );
              })}

              <div className="border-t border-white/10" />
            </nav>
          </div>

          {/* =================================================
              MENU BOTTOM
          ================================================== */}

          <div className="shrink-0 border-t border-white/10 pb-[max(22px,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[8px] uppercase tracking-[0.38em] text-stone-500">
                  AJVEK · France
                </p>

                <p className="mt-3 max-w-[230px] text-[11px] leading-5 text-stone-400">
                  Drop 001 — Roses / Cerisier
                  <br />
                  Précommande ouverte · 39,90 €
                </p>
              </div>

              <div className="text-right">
                <p className="text-[8px] uppercase tracking-[0.3em] text-stone-600">
                  2026
                </p>

                <p className="mt-3 text-base">
                  🇫🇷
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}