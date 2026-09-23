"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

const PROMO_GOAL = 10;

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

        const data =
          await response.json();

        if (
          !cancelled &&
          response.ok
        ) {
          setCount(
            Number(data.count ?? 0)
          );
        }
      } catch {
        if (!cancelled) {
          setCount(null);
        }
      }
    }

    loadCount();

    return () => {
      cancelled = true;
    };
  }, []);

  if (count === null) {
    return null;
  }

  const reached =
    count >= PROMO_GOAL;

  const progress = Math.min(
    (count / PROMO_GOAL) * 100,
    100
  );

  const remaining = Math.max(
    PROMO_GOAL - count,
    0
  );

  return (
    <section className="relative overflow-hidden border-b border-white/[0.07] bg-[#0c0c0b] text-[#f3f0ea]">
      {/* LUMIERE DISCRETE */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-32 w-80 -translate-x-1/2 -translate-y-2/3 rounded-full bg-white/[0.035] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-4 md:px-8">
        <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8">
          {/* LABEL */}
          <div className="flex items-center justify-between gap-5 md:block">
            <p className="text-[9px] uppercase tracking-[0.38em] text-stone-500">
              AJVEK · Private Draw
            </p>

            <p className="font-display text-lg leading-none md:hidden">
              {Math.min(
                count,
                PROMO_GOAL
              )}{" "}
              / {PROMO_GOAL}
            </p>
          </div>

          {/* MESSAGE */}
          <div>
            {!reached ? (
              <>
                <p className="text-xs uppercase tracking-[0.19em] text-[#f3f0ea] md:text-[13px]">
                  10 commandes. 1
                  gagnant.{" "}
                  <span className="text-[#b3a48c]">
                    -30 % sur le
                    prochain achat.
                  </span>
                </p>

                <p className="mt-1.5 text-[10px] leading-4 text-stone-500">
                  Tirage au sort
                  déclenché à la
                  10e commande
                  payée ·{" "}
                  {remaining}{" "}
                  commande
                  {remaining > 1
                    ? "s"
                    : ""}{" "}
                  restante
                  {remaining > 1
                    ? "s"
                    : ""}
                  .
                </p>
              </>
            ) : (
              <>
                <p className="text-xs uppercase tracking-[0.19em] text-[#f3f0ea] md:text-[13px]">
                  Les 10 commandes
                  sont atteintes.{" "}
                  <span className="text-[#b3a48c]">
                    Tirage au sort en
                    préparation.
                  </span>
                </p>

                <p className="mt-1.5 text-[10px] text-stone-500">
                  Un client recevra
                  -30 % sur son
                  prochain achat
                  AJVEK.
                </p>
              </>
            )}
          </div>

          {/* DESKTOP COUNT */}
          <div className="hidden min-w-24 text-right md:block">
            <p className="font-display text-2xl leading-none">
              {Math.min(
                count,
                PROMO_GOAL
              )}
              <span className="ml-1 text-sm text-stone-500">
                / {PROMO_GOAL}
              </span>
            </p>

            <Link
              href="/conditions-tirage"
              className="mt-2 inline-block text-[8px] uppercase tracking-[0.28em] text-stone-600 underline underline-offset-4 transition hover:text-stone-300"
            >
              Conditions
            </Link>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="mt-4 flex items-center gap-4">
          <div className="h-px flex-1 overflow-hidden bg-white/10">
            <div
              className="h-full bg-[#f3f0ea] transition-[width] duration-1000 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <Link
            href="/conditions-tirage"
            className="shrink-0 text-[8px] uppercase tracking-[0.25em] text-stone-600 underline underline-offset-4 md:hidden"
          >
            Conditions
          </Link>
        </div>
      </div>
    </section>
  );
}