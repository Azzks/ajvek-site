"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function InscriptionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    /* =====================================================
       VALIDATIONS
    ====================================================== */

    if (!cleanName) {
      setError("Indique ton nom.");
      setSubmitting(false);
      return;
    }

    if (!cleanEmail) {
      setError("Indique ton adresse email.");
      setSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      setSubmitting(false);
      return;
    }

    /* =====================================================
       CRÉATION DU COMPTE SUPABASE
    ====================================================== */

    try {
      const redirectUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/connexion`
          : undefined;

      const { error: signUpError } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
            },

            ...(redirectUrl
              ? {
                  emailRedirectTo: redirectUrl,
                }
              : {}),
          },
        });

      if (signUpError) {
        console.error(
          "[signup]",
          signUpError
        );

        const message =
          signUpError.message.toLowerCase();

        if (
          message.includes(
            "user already registered"
          ) ||
          message.includes(
            "already been registered"
          )
        ) {
          setError(
            "Un compte existe déjà avec cet email."
          );
        } else if (
          message.includes("password")
        ) {
          setError(
            "Le mot de passe choisi n'est pas accepté."
          );
        } else if (
          message.includes("email")
        ) {
          setError(
            "L'adresse email indiquée n'est pas valide."
          );
        } else {
          setError(
            "Impossible de créer le compte pour le moment. Réessaie dans un instant."
          );
        }

        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      setDone(true);
    } catch (err) {
      console.error("[signup]", err);

      setError(
        "Une erreur est survenue. Vérifie ta connexion puis réessaie."
      );

      setSubmitting(false);
    }
  }

  /* =====================================================
     ICÔNE ŒIL
  ====================================================== */

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

  /* =====================================================
     CONFIRMATION
  ====================================================== */

  if (done) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5 py-20 text-foreground md:px-8">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-surface">
            <span className="text-xl">✓</span>
          </div>

          <p className="mt-8 text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Compte
          </p>

          <h1 className="mt-5 font-display text-4xl leading-[0.95] md:text-5xl">
            Vérifie tes emails.
          </h1>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-stone">
            Un lien de confirmation vient de
            t&apos;être envoyé. Clique dessus
            pour activer ton compte AJVEK.
          </p>

          <p className="mx-auto mt-3 max-w-sm text-xs leading-6 text-stone/60">
            Pense à vérifier tes courriers
            indésirables si tu ne trouves pas
            l&apos;email.
          </p>

          <Link
            href="/connexion"
            className="group mt-9 flex w-full items-center justify-between rounded-full bg-foreground px-7 py-5 text-[9px] uppercase tracking-[0.3em] text-background transition-transform duration-300 hover:scale-[0.99]"
          >
            <span>Aller à la connexion</span>

            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>

          <Link
            href="/"
            className="mt-6 inline-block text-[9px] uppercase tracking-[0.3em] text-stone underline underline-offset-4 transition hover:text-foreground"
          >
            Retour à AJVEK
          </Link>
        </div>
      </main>
    );
  }

  /* =====================================================
     INSCRIPTION
  ====================================================== */

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-surface px-5 pb-12 pt-20 md:px-8 md:pb-16 md:pt-28">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Compte
          </p>

          <h1 className="mt-6 font-display text-5xl leading-[0.9] tracking-[-0.03em] md:text-6xl">
            Créer
            <br />
            un compte.
          </h1>

          <p className="mx-auto mt-6 max-w-sm text-sm leading-7 text-stone">
            Crée ton compte AJVEK pour accéder
            à ton espace.
          </p>
        </div>
      </section>

      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-md">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* NOM */}

            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-[8px] uppercase tracking-[0.35em] text-stone"
              >
                Nom
              </label>

              <input
                id="name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="Ton nom"
                disabled={submitting}
                className="w-full border-b border-surface bg-transparent px-0 py-4 text-sm text-foreground outline-none transition-colors placeholder:text-stone/35 focus:border-foreground disabled:opacity-50"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[8px] uppercase tracking-[0.35em] text-stone"
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
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="ton@email.fr"
                disabled={submitting}
                className="w-full border-b border-surface bg-transparent px-0 py-4 text-sm text-foreground outline-none transition-colors placeholder:text-stone/35 focus:border-foreground disabled:opacity-50"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[8px] uppercase tracking-[0.35em] text-stone"
              >
                Mot de passe
              </label>

              <div className="relative">
                <input
                  id="password"
                  required
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="8 caractères minimum"
                  disabled={submitting}
                  className="w-full border-b border-surface bg-transparent px-0 py-4 pr-11 text-sm text-foreground outline-none transition-colors placeholder:text-stone/35 focus:border-foreground disabled:opacity-50"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={submitting}
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
                  }
                  aria-pressed={showPassword}
                  className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center justify-center text-stone transition hover:text-foreground disabled:opacity-50"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>

              <p className="mt-3 text-[10px] leading-5 text-stone/50">
                8 caractères minimum.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="border border-surface px-4 py-4"
              >
                <p className="text-xs leading-5 text-stone">
                  {error}
                </p>
              </div>
            )}

            {/* SUBMIT */}

            <button
              type="submit"
              disabled={submitting}
              className="group mt-3 flex w-full items-center justify-between rounded-full bg-foreground px-7 py-5 text-[9px] uppercase tracking-[0.3em] text-background transition-transform duration-300 hover:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>
                {submitting
                  ? "Création..."
                  : "Créer mon compte"}
              </span>

              {!submitting && (
                <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              )}
            </button>
          </form>

          {/* CONNEXION */}

          <div className="mt-10 border-t border-surface pt-8 text-center">
            <p className="text-xs text-stone">
              Déjà un compte ?
            </p>

            <Link
              href="/connexion"
              className="mt-3 inline-block text-[9px] uppercase tracking-[0.3em] text-foreground underline underline-offset-4"
            >
              Se connecter
            </Link>
          </div>

          <p className="mt-10 text-center text-[8px] uppercase tracking-[0.35em] text-stone/35">
            AJVEK · 2026
          </p>
        </div>
      </section>
    </main>
  );
}