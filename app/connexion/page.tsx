"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ConnexionPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /* =========================================================
     CONNEXION
  ========================================================= */

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Renseigne ton email et ton mot de passe.");
      setSubmitting(false);
      return;
    }

    try {
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

      if (signInError) {
        console.error(
          "[connexion] Erreur Supabase :",
          signInError
        );

        setError("Email ou mot de passe incorrect.");
        return;
      }

      router.replace("/mes-commandes");
      router.refresh();
    } catch (err) {
      console.error(
        "[connexion] Erreur générale :",
        err
      );

      setError(
        "Impossible de se connecter pour le moment. Réessaie dans quelques instants."
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     MOT DE PASSE OUBLIÉ
  ========================================================= */

  async function handleForgotPassword() {
    if (resettingPassword) return;

    setError(null);
    setMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Entre d'abord ton adresse email pour réinitialiser ton mot de passe."
      );
      return;
    }

    setResettingPassword(true);

    try {
      const redirectTo =
        `${window.location.origin}/nouveau-mot-de-passe`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo,
          }
        );

      if (resetError) {
        console.error(
          "[connexion] Erreur réinitialisation :",
          resetError
        );

        setError(
          "Impossible d'envoyer l'email de réinitialisation pour le moment."
        );

        return;
      }

      /*
       * Message volontairement générique :
       * on ne révèle pas si une adresse possède ou non un compte.
       */
      setMessage(
        "Si un compte AJVEK correspond à cette adresse, un email de réinitialisation vient d'être envoyé."
      );
    } catch (err) {
      console.error(
        "[connexion] Erreur réinitialisation générale :",
        err
      );

      setError(
        "Impossible d'envoyer l'email de réinitialisation pour le moment."
      );
    } finally {
      setResettingPassword(false);
    }
  }

  /* =========================================================
     ICÔNE ŒIL
  ========================================================= */

  function EyeIcon({ open }: { open: boolean }) {
    if (open) {
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
          aria-hidden="true"
        >
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    }

    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        <path d="M3 3l18 18" />
        <path d="M10.6 6.2A10.8 10.8 0 0 1 12 6c6.5 0 10 6 10 6a18 18 0 0 1-2.1 2.8" />
        <path d="M6.6 6.6C3.6 8.4 2 12 2 12s3.5 6 10 6a10.8 10.8 0 0 0 5.4-1.4" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </svg>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-16 text-foreground md:px-8">
      <div className="w-full max-w-md">
        {/* ===================================================
            EN-TÊTE
        ==================================================== */}

        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Compte
          </p>

          <h1 className="mt-5 font-display text-4xl leading-none md:text-5xl">
            Se connecter
          </h1>

          <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-stone">
            Connecte-toi pour retrouver ton compte et suivre
            tes commandes AJVEK.
          </p>
        </div>

        {/* ===================================================
            FORMULAIRE
        ==================================================== */}

        <form
          onSubmit={handleSubmit}
          className="mt-10 flex flex-col gap-5"
        >
          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[9px] uppercase tracking-[0.3em] text-stone"
            >
              Email
            </label>

            <input
              id="email"
              required
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);

                if (error) {
                  setError(null);
                }

                if (message) {
                  setMessage(null);
                }
              }}
              placeholder="ton@email.fr"
              className="w-full rounded-xl border border-surface bg-transparent px-4 py-4 text-sm text-foreground outline-none transition placeholder:text-stone/40 focus:border-stone"
            />
          </div>

          {/* MOT DE PASSE */}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-[9px] uppercase tracking-[0.3em] text-stone"
              >
                Mot de passe
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={
                  resettingPassword ||
                  submitting
                }
                className="text-[9px] uppercase tracking-[0.18em] text-stone transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                {resettingPassword
                  ? "Envoi..."
                  : "Mot de passe oublié ?"}
              </button>
            </div>

            <div className="relative">
              <input
                id="password"
                required
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);

                  if (error) {
                    setError(null);
                  }
                }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-surface bg-transparent px-4 py-4 pr-12 text-sm text-foreground outline-none transition placeholder:text-stone/40 focus:border-stone"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((current) => !current)
                }
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
                aria-pressed={showPassword}
                className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-stone transition hover:text-foreground"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {/* =================================================
              MESSAGES
          ================================================== */}

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-surface px-4 py-3"
            >
              <p className="text-xs leading-5 text-stone">
                {error}
              </p>
            </div>
          )}

          {message && (
            <div
              role="status"
              className="rounded-xl border border-surface px-4 py-3"
            >
              <p className="text-xs leading-5 text-stone">
                {message}
              </p>
            </div>
          )}

          {/* =================================================
              CONNEXION
          ================================================== */}

          <button
            type="submit"
            disabled={
              submitting ||
              resettingPassword
            }
            className="group mt-2 flex w-full items-center justify-between rounded-full bg-foreground px-6 py-4 text-[10px] uppercase tracking-[0.3em] text-background transition duration-300 hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>
              {submitting
                ? "Connexion..."
                : "Se connecter"}
            </span>

            {!submitting && (
              <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        </form>

        {/* ===================================================
            INSCRIPTION
        ==================================================== */}

        <div className="mt-10 border-t border-surface pt-8 text-center">
          <p className="text-xs text-stone">
            Pas encore de compte ?
          </p>

          <Link
            href="/inscription"
            className="mt-3 inline-block text-[10px] uppercase tracking-[0.25em] text-foreground underline underline-offset-4 transition hover:text-stone"
          >
            Créer un compte
          </Link>
        </div>

        {/* ===================================================
            RETOUR
        ==================================================== */}

        <div className="mt-10 text-center">
          <Link
            href="/catalogue"
            className="text-[9px] uppercase tracking-[0.3em] text-stone/60 transition hover:text-foreground"
          >
            ← Retour à la collection
          </Link>
        </div>
      </div>
    </main>
  );
}