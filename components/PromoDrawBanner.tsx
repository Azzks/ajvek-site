"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

const PROMO_GOAL = 10;

const REFRESH_INTERVAL = 30_000;

export default function PromoDrawBanner() {
  const [count, setCount] =
    useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      try {
        const response = await fetch(
          "/api/promo-order-count",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Impossible de récupérer le compteur."
          );
        }

        const data =
          await response.json();

        if (!cancelled) {
          const nextCount =
            Number(data.count ?? 0);

          setCount(
            Number.isFinite(nextCount)
              ? Math.max(nextCount, 0)
              : 0
          );
        }
      } catch (error) {
        console.error(
          "[PromoDrawBanner]",
          error
        );

        /*
         * Si nous avions déjà récupéré
         * une valeur valide, on la conserve
         * en cas d'erreur temporaire.
         */
      }
    }

    loadCount();

    const interval =
      window.setInterval(
        loadCount,
        REFRESH_INTERVAL
      );

    window.addEventListener(
      "focus",
      loadCount
    );

    return () => {
      cancelled = true;

      window.clearInterval(interval);

      window.removeEventListener(
        "focus",
        loadCount
      );
    };
  }, []);

  /*
   * On n'affiche rien tant que la première
   * valeur n'a pas été récupérée.
   */

  if (count === null) {
    return null;
  }

  const reached =
    count >= PROMO_GOAL;

  const displayedCount = Math.min(
    count,
    PROMO_GOAL
  );

  const progress = Math.min(
    (count / PROMO_GOAL) * 100,
    100
  );

  const tickerText = reached
    ? "10 COMMANDES ATTEINTES — TIRAGE AU SORT EN PRÉPARATION"
    : "10 COMMANDES · 1 GAGNANT · -30 % SUR LE PROCHAIN ACHAT";

  return (
    <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#0a0a09] text-[#f3f0ea]">
      {/* =====================================================
          LIGNE PRINCIPALE ANIMÉE
      ====================================================== */}

      <div className="relative overflow-hidden border-b border-white/[0.06] py-3">
        <div className="ajvek-marquee flex w-max items-center whitespace-nowrap">
          {[0, 1].map(
            (group) => (
              <div
                key={group}
                aria-hidden={
                  group === 1
                }
                className="flex shrink-0 items-center"
              >
                {[0, 1, 2].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center"
                    >
                      <span className="px-6 text-[10px] uppercase tracking-[0.34em] text-[#f3f0ea] md:px-10 md:text-[11px]">
                        {tickerText}
                      </span>

                      <span className="font-display text-lg text-[#b3a48c]">
                        ✦
                      </span>
                    </div>
                  )
                )}
              </div>
            )
          )}
        </div>

        {/* OMBRES SUR LES CÔTÉS */}

        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a0a09] to-transparent md:w-24" />

        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0a09] to-transparent md:w-24" />
      </div>

      {/* =====================================================
          PROGRESSION
      ====================================================== */}

      <div className="mx-auto max-w-7xl px-5 py-3 md:px-8">
        <div className="flex items-center gap-4">
          <p className="shrink-0 text-[9px] uppercase tracking-[0.3em] text-stone">
            Private Draw
          </p>

          <div className="h-px flex-1 overflow-hidden bg-white/10">
            <div
              className="h-full bg-[#f3f0ea] transition-[width] duration-1000 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="shrink-0 font-display text-base">
            {displayedCount}

            <span className="ml-1 text-xs text-stone">
              / {PROMO_GOAL}
            </span>
          </p>

          <Link
            href="/conditions-tirage"
            className="shrink-0 text-[8px] uppercase tracking-[0.22em] text-stone underline underline-offset-4 transition hover:text-foreground"
          >
            Conditions
          </Link>
        </div>
      </div>
    </section>
  );
}