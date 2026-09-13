"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function InscriptionPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setSubmitting(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });

    if (signUpError) {
      setError(
        signUpError.message === "User already registered"
          ? "Un compte existe déjà avec cet email."
          : "Une erreur est survenue, réessaie dans un instant."
      );
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
    setDone(true);
  }

  if (done) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
        <p className="mb-4 text-xs tracking-[0.3em] text-stone uppercase">
          Compte
        </p>
        <h1 className="mb-6 text-4xl font-display">Vérifie tes emails</h1>
        <p className="max-w-sm text-sm text-stone">
          On t&apos;a envoyé un lien de confirmation. Clique dessus pour
          activer ton compte, puis reviens te connecter.
        </p>
        <Link
          href="/connexion"
          className="mt-8 inline-block rounded-full bg-foreground px-8 py-3 text-sm uppercase tracking-widest text-background transition hover:opacity-80"
        >
          Aller à la connexion
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center text-foreground">
      <p className="mb-4 text-xs tracking-[0.3em] text-stone uppercase">
        Compte
      </p>
      <h1 className="mb-8 text-4xl font-display">Créer un compte</h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-3 text-left"
      >
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="rounded border border-stone/40 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        {error && <p className="text-xs text-stone">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-full border border-foreground px-4 py-3 text-xs uppercase tracking-widest text-foreground transition hover:bg-foreground hover:text-background"
        >
          {submitting ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p className="mt-8 text-xs text-stone">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="underline hover:text-foreground">
          Se connecter
        </Link>
      </p>
    </main>
  );
}
