"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import MadeInFrance from "@/components/MadeInFrance";
import PaymentNotice from "@/components/PaymentNotice";
import DesignProcessStory from "@/components/DesignProcessStory";
import HomeIntro from "@/components/HomeIntro";

const PREORDER_GOAL = 10;

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/preorder-count")
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => setCount(null));
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduced) {
      gsap.set(titleRef.current, {
        opacity: 1,
        rotationX: 0,
      });

      gsap.set(buttonRef.current, {
        opacity: 1,
        y: 0,
      });

      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, {
        opacity: 0,
        rotationX: -90,
        transformPerspective: 800,
      });

      gsap.to(titleRef.current, {
        opacity: 1,
        rotationX: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.1,
      });

      gsap.set(buttonRef.current, {
        opacity: 0,
        y: 20,
      });

      gsap.to(buttonRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.9,
      });
    });

    return () => ctx.revert();
  }, []);

  const thresholdReached = count !== null && count >= PREORDER_GOAL;

  const percent =
    count !== null
      ? Math.min((count / PREORDER_GOAL) * 100, 100)
      : 0;

  const remaining =
    count !== null
      ? Math.max(PREORDER_GOAL - count, 0)
      : 0;

  return (
    <main className="bg-background text-foreground">
      <HomeIntro />

      <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">
          Streetwear
        </p>

        <h1
          ref={titleRef}
          className="font-display text-5xl opacity-0 sm:text-7xl"
        >
          AJVEK
        </h1>

        <p className="mt-6 max-w-md text-sm leading-6 text-stone">
          Des pièces pensées autour du dessin, du végétal et d&apos;une
          identité graphique propre à AJVEK.
        </p>

        <Link
          ref={buttonRef}
          href="/catalogue"
          className="mt-10 inline-block rounded-full bg-foreground px-8 py-3 text-sm uppercase tracking-widest text-background opacity-0 transition hover:opacity-80"
        >
          Découvrir la collection
        </Link>

        {count !== null && (
          <div className="mt-10 w-full max-w-sm">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-5 text-left backdrop-blur-sm">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.35em] text-stone">
                    Précommandes payées
                  </p>

                  <div className="mt-2 flex items-end gap-2">
                    <span className="font-display text-4xl leading-none text-foreground">
                      {count}
                    </span>

                    <span className="pb-1 text-sm text-stone">
                      / {PREORDER_GOAL}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-stone">
                    Production
                  </p>

                  <p className="mt-1 text-xs text-foreground">
                    {thresholdReached
                      ? "Seuil atteint"
                      : "En attente"}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-foreground transition-all duration-1000 ease-out"
                  style={{
                    width: `${percent}%`,
                  }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-4">
                <p className="text-xs leading-5 text-stone">
                  {thresholdReached
                    ? "Le seuil de production est atteint."
                    : `${remaining} vêtement${
                        remaining > 1 ? "s" : ""
                      } avant le lancement.`}
                </p>

                <span className="shrink-0 text-[10px] uppercase tracking-[0.25em] text-stone">
                  {Math.round(percent)}%
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <PaymentNotice />
        </div>

        <div className="mt-6">
          <MadeInFrance />
        </div>

        <div className="mt-16 text-[10px] uppercase tracking-[0.35em] text-stone/60">
          Scroll
        </div>
      </section>

      <DesignProcessStory />

      <section className="flex min-h-[70svh] items-center justify-center px-6 py-24 text-center">
        <div className="max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.4em] text-stone">
            Collection actuelle
          </p>

          <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
            Le dessin devient
            <br />
            une pièce AJVEK.
          </h2>

          <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-stone">
            Découvrez les pièces actuellement disponibles en précommande.
          </p>

          <Link
            href="/catalogue"
            className="mt-10 inline-block rounded-full bg-foreground px-8 py-3 text-sm uppercase tracking-widest text-background transition hover:opacity-80"
          >
            Voir la collection
          </Link>
        </div>
      </section>
    </main>
  );
}