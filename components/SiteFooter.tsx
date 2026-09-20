import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/catalogue", label: "Collection" },
  { href: "/precommande", label: "Ma précommande" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-surface bg-[#0c0c0b] text-[#f3f0ea]">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-8 md:py-20">
        <div className="grid gap-14 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="font-display text-3xl tracking-[0.18em] md:text-4xl">
              AJVEK
            </p>

            <p className="mt-5 max-w-md text-sm leading-6 text-stone-400">
              Streetwear pensé autour du dessin, du végétal et d&apos;une
              identité graphique propre à AJVEK.
            </p>

            <p className="mt-6 text-[10px] uppercase tracking-[0.35em] text-stone-500">
              Produit en France
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">
              Navigation
            </p>

            <nav className="mt-5 flex flex-col gap-3">
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-stone-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-stone-500">
              Informations
            </p>

            <nav className="mt-5 flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-stone-300 transition hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.25em] text-stone-500 md:flex-row md:items-center md:justify-between">
          <p>© 2026 AJVEK</p>

          <p>Précommande · Paiement sécurisé · France</p>
        </div>
      </div>
    </footer>
  );
}