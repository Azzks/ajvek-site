"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ResumeCheckoutResponse = {
  resumable?: boolean;
  url?: string;
  checkoutGroupId?: string;
  error?: string;
};

export default function PaiementAnnulePage() {
  const [loading, setLoading] =
    useState(true);

  const [resumeUrl, setResumeUrl] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingCheckout() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (
          sessionError ||
          !session?.access_token
        ) {
          if (!cancelled) {
            setResumeUrl(null);
          }

          return;
        }

        const response = await fetch(
          "/api/resume-checkout",
          {
            method: "GET",
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as
            ResumeCheckoutResponse;

        if (!response.ok) {
          throw new Error(
            data.error ||
              "Impossible de vérifier le paiement."
          );
        }

        if (cancelled) {
          return;
        }

        if (
          data.resumable === true &&
          data.url
        ) {
          setResumeUrl(data.url);
        } else {
          setResumeUrl(null);
        }
      } catch (error) {
        console.error(
          "[paiement-annule] Vérification du paiement impossible :",
          error
        );

        if (!cancelled) {
          setResumeUrl(null);
          setError(
            "Impossible de vérifier ta session de paiement actuellement."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void checkExistingCheckout();

    return () => {
      cancelled = true;
    };
  }, []);

  function resumePayment() {
    if (!resumeUrl) {
      return;
    }

    window.location.assign(resumeUrl);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <p className="mb-4 text-xs uppercase tracking-[0.3em] text-stone">
        Paiement interrompu
      </p>

      <h1 className="font-display text-3xl sm:text-5xl">
        Aucun paiement confirmé
      </h1>

      <p className="mt-6 max-w-md text-stone">
        Aucun paiement n&apos;a été confirmé
        pour cette commande.
      </p>

      {loading ? (
        <p className="mt-3 max-w-md text-sm text-stone">
          Vérification de ta session de
          paiement...
        </p>
      ) : resumeUrl ? (
        <p className="mt-3 max-w-md text-sm text-stone">
          Tes articles sont toujours réservés
          temporairement. Tu peux reprendre la
          session de paiement existante sans
          recréer une nouvelle commande.
        </p>
      ) : (
        <p className="mt-3 max-w-md text-sm text-stone">
          Cette session de paiement ne peut
          plus être reprise. Tu peux retourner
          à ton panier ou consulter la
          collection.
        </p>
      )}

      {error && (
        <p className="mt-4 max-w-md text-xs text-stone">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {resumeUrl && !loading && (
          <button
            type="button"
            onClick={resumePayment}
            className="rounded-full bg-foreground px-6 py-3 text-xs uppercase tracking-widest text-background transition hover:opacity-85"
          >
            Reprendre mon paiement
          </button>
        )}

        <Link
          href="/panier"
          className="rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          Retour à mon panier
        </Link>

        <Link
          href="/catalogue"
          className="rounded-full border border-foreground px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          Voir la collection
        </Link>
      </div>
    </main>
  );
}