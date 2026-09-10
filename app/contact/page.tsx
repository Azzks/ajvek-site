const LINKS = [
  { label: "Email", href: "mailto:ajvek.contact@gmail.com" },
  { label: "TikTok", href: "https://www.tiktok.com/@ajvekstreet" },
  { label: "Instagram", href: "https://www.instagram.com/ajvekstreet" },
];

export default function ContactPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <h1 className="font-display text-4xl sm:text-5xl">Contact</h1>
      <p className="max-w-md text-stone">Retrouve-nous ici, ou écris-nous directement.</p>
      <div className="flex flex-col gap-4 sm:flex-row">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="rounded-full border border-stone/40 px-6 py-3 text-xs uppercase tracking-widest text-foreground transition hover:border-foreground"
          >
            {link.label}
          </a>
        ))}
      </div>
    </main>
  );
}