"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/CartContext";

/* =========================================================
   NAVIGATION
========================================================= */

const PRIMARY_LINKS = [
  {
    href: "/catalogue",
    label: "Collection",
  },
  {
    href: "/lookbook",
    label: "Lookbook",
  },
  {
    href: "/a-propos",
    label: "Notre histoire",
  },
];

const MENU_LINKS = [
  {
    href: "/catalogue",
    label: "Collection",
  },
  {
    href: "/lookbook",
    label: "Lookbook",
  },
  {
    href: "/a-propos",
    label: "Notre histoire",
  },
  {
    href: "/mes-commandes",
    label: "Compte",
  },
  {
    href: "/panier",
    label: "Panier",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

const ADMIN_LINK = {
  href: "/admin/commandes",
  label: "Administration",
};

/* =========================================================
   HEADER
========================================================= */

export default function SiteHeader() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const [open, setOpen] =
    useState(false);

  const [isAdmin, setIsAdmin] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  /* =======================================================
     HEADER AU SCROLL
  ======================================================= */

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /* =======================================================
     BLOQUER LE SCROLL AVEC LE MENU MOBILE
  ======================================================= */

  useEffect(() => {
    document.body.style.overflow =
      open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  /* =======================================================
     FERMER LE MENU AU CHANGEMENT DE PAGE
  ======================================================= */

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* =======================================================
     ADMIN
  ======================================================= */

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const {
          data: { session },
        } =
          await supabase.auth.getSession();

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
              Authorization:
                `Bearer ${session.access_token}`,
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
    } =
      supabase.auth.onAuthStateChange(
        () => {
          checkAdmin();
        }
      );

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
      {/* ===================================================
          HEADER DESKTOP + MOBILE
      ==================================================== */}

      <header
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled
            ? "border-white/[0.08] bg-[#0d0d0c]/95 backdrop-blur-xl"
            : "border-white/[0.07] bg-[#0d0d0c]"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 transition-[height] duration-300 md:px-8 lg:px-12 ${
            scrolled
              ? "h-[60px]"
              : "h-[68px] md:h-[76px]"
          }`}
        >
          {/* LOGO */}

          <Link
            href="/"
            aria-label="AJVEK — Accueil"
            className="relative z-10 shrink-0"
          >
            <span className="font-display text-[22px] tracking-[0.17em] text-[#f4f1ea] md:text-[24px]">
              AJVEK
            </span>
          </Link>

          {/* NAVIGATION DESKTOP */}

          <nav
            aria-label="Navigation principale"
            className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex xl:gap-11"
          >
            {PRIMARY_LINKS.map(
              (link) => {
                const active =
                  isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-2 text-[10px] uppercase tracking-[0.24em] transition-colors duration-200 ${
                      active
                        ? "text-[#f4f1ea]"
                        : "text-[#8a8178] hover:text-[#f4f1ea]"
                    }`}
                  >
                    {link.label}

                    <span
                      className={`absolute bottom-0 left-0 h-px bg-[#f4f1ea] transition-[width] duration-200 ${
                        active
                          ? "w-full"
                          : "w-0"
                      }`}
                    />
                  </Link>
                );
              }
            )}
          </nav>

          {/* ACTIONS DESKTOP */}

          <div className="hidden items-center gap-7 lg:flex">
            <Link
              href="/mes-commandes"
              className={`text-[10px] uppercase tracking-[0.24em] transition-colors ${
                isActive(
                  "/mes-commandes"
                )
                  ? "text-[#f4f1ea]"
                  : "text-[#8a8178] hover:text-[#f4f1ea]"
              }`}
            >
              Compte
            </Link>

            <Link
              href="/panier"
              aria-label={`Panier — ${totalItems} article${
                totalItems > 1
                  ? "s"
                  : ""
              }`}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-[#f4f1ea]"
            >
              <span>Panier</span>

              <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-white/15 px-1 text-[9px] tracking-normal">
                {totalItems}
              </span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin/commandes"
                aria-label="Administration"
                className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 text-[8px] uppercase text-[#8a8178] transition hover:border-white/40 hover:text-[#f4f1ea]"
              >
                A
              </Link>
            )}
          </div>

          {/* ACTIONS TABLETTE / MOBILE */}

          <div className="flex items-center gap-4 lg:hidden">
            <Link
              href="/panier"
              aria-label={`Panier — ${totalItems} article${
                totalItems > 1
                  ? "s"
                  : ""
              }`}
              className="flex items-center gap-2"
            >
              <span className="hidden text-[9px] uppercase tracking-[0.22em] text-[#f4f1ea] sm:inline">
                Panier
              </span>

              <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-white/15 px-1 text-[8px] text-[#f4f1ea]">
                {totalItems}
              </span>
            </Link>

            <button
              type="button"
              onClick={() =>
                setOpen(true)
              }
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className="flex h-10 w-10 flex-col items-end justify-center gap-[6px]"
            >
              <span className="block h-px w-6 bg-[#f4f1ea]" />
              <span className="block h-px w-4 bg-[#f4f1ea]" />
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================
          MENU MOBILE
      ==================================================== */}

      <div
        id="mobile-navigation"
        aria-hidden={!open}
        className={`fixed inset-0 z-[100] bg-[#0d0d0c] text-[#f4f1ea] transition-[opacity,transform] duration-300 lg:hidden ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <div className="mx-auto flex h-[100svh] max-w-[1440px] flex-col px-5 sm:px-8">
          {/* TOP */}

          <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10">
            <Link
              href="/"
              onClick={() =>
                setOpen(false)
              }
              className="font-display text-[22px] tracking-[0.17em]"
            >
              AJVEK
            </Link>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              aria-label="Fermer le menu"
              className="relative h-10 w-10"
            >
              <span className="absolute left-1/2 top-1/2 h-px w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#f4f1ea]" />

              <span className="absolute left-1/2 top-1/2 h-px w-7 -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#f4f1ea]" />
            </button>
          </div>

          {/* LIENS */}

          <div className="flex min-h-0 flex-1 flex-col justify-center py-8">
            <p className="mb-6 text-[9px] uppercase tracking-[0.35em] text-[#8a8178]">
              Navigation
            </p>

            <nav aria-label="Navigation mobile">
              {menuLinks.map(
                (link, index) => {
                  const active =
                    isActive(
                      link.href
                    );

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() =>
                        setOpen(false)
                      }
                      className="group flex items-center justify-between border-t border-white/10 py-4"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-display text-[2rem] leading-none ${
                            active
                              ? "text-white"
                              : "text-white/75"
                          }`}
                        >
                          {link.label}
                        </span>

                        {active && (
                          <span className="h-1 w-1 rounded-full bg-white" />
                        )}
                      </div>

                      <span className="text-[9px] tracking-[0.22em] text-[#6f6861]">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </Link>
                  );
                }
              )}

              <div className="border-t border-white/10" />
            </nav>
          </div>

          {/* BOTTOM */}

          <div className="shrink-0 border-t border-white/10 pb-[max(24px,env(safe-area-inset-bottom))] pt-5">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[8px] uppercase tracking-[0.32em] text-[#8a8178]">
                  AJVEK · France
                </p>

                <p className="mt-3 text-[11px] leading-5 text-white/55">
                  Drop 001
                  <br />
                  Roses / Cerisier
                </p>
              </div>

              <Link
                href="/panier"
                onClick={() =>
                  setOpen(false)
                }
                className="flex items-center gap-3 text-[9px] uppercase tracking-[0.24em]"
              >
                Panier

                <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-white/15 px-1 text-[8px]">
                  {totalItems}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}