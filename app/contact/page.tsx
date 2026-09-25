const LINKS = [
  {
    label: "Email",
    value: "ajvek.contact@gmail.com",
    href: "mailto:ajvek.contact@gmail.com",
    external: false,
  },
  {
    label: "Instagram",
    value: "@ajvekstreet",
    href: "https://www.instagram.com/ajvekstreet",
    external: true,
  },
  {
    label: "TikTok",
    value: "@ajvekstreet",
    href: "https://www.tiktok.com/@ajvekstreet",
    external: true,
  },
];

export const metadata = {
  title: "Contact — AJVEK",
  description:
    "Contacte AJVEK ou retrouve la marque sur Instagram et TikTok.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-surface px-5 pb-16 pt-20 md:px-8 md:pb-24 md:pt-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-[9px] uppercase tracking-[0.45em] text-stone">
            AJVEK · Contact
          </p>

          <h1 className="mt-7 font-display text-[4.5rem] leading-[0.85] tracking-[-0.04em] sm:text-7xl md:text-8xl">
            Parlons.
          </h1>

          <p className="mt-8 max-w-lg text-[15px] leading-7 text-stone">
            Une question sur une commande, une précommande,
            une pièce ou simplement envie de nous écrire ?
          </p>
        </div>
      </section>

      {/* =====================================================
          CONTACTS
      ====================================================== */}

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="border-t border-surface">
            {LINKS.map((link, index) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={
                  link.external
                    ? "noopener noreferrer"
                    : undefined
                }
                className="group flex items-center justify-between gap-6 border-b border-surface py-7 transition-opacity duration-300 hover:opacity-60 md:py-9"
              >
                <div className="flex items-center gap-5 md:gap-8">
                  <span className="text-[8px] tracking-[0.3em] text-stone/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.35em] text-stone">
                      {link.label}
                    </p>

                    <p className="mt-2 text-sm text-foreground md:text-base">
                      {link.value}
                    </p>
                  </div>
                </div>

                <span className="text-xl transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          SERVICE CLIENT
      ====================================================== */}

      <section className="border-t border-surface px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2">
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone">
              Service client
            </p>

            <h2 className="mt-5 font-display text-4xl leading-[0.9] md:text-5xl">
              Une question
              <br />
              sur ta commande ?
            </h2>
          </div>

          <div className="md:justify-self-end">
            <p className="max-w-md text-sm leading-7 text-stone">
              Pour toute demande concernant une commande,
              indique l&apos;adresse email utilisée lors de
              l&apos;achat afin que nous puissions la retrouver
              plus facilement.
            </p>

            <a
              href="mailto:ajvek.contact@gmail.com"
              className="group mt-7 flex w-full max-w-md items-center justify-between rounded-full bg-foreground px-6 py-4 text-[9px] uppercase tracking-[0.3em] text-background md:min-w-[360px]"
            >
              <span>Nous écrire</span>

              <span className="text-base transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOT NOTE
      ====================================================== */}

      <section className="border-t border-surface px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
            AJVEK
          </p>

          <p className="text-[8px] uppercase tracking-[0.35em] text-stone/50">
            France · 2026
          </p>
        </div>
      </section>
    </main>
  );
}