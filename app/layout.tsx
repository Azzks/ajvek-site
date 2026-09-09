import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AJVEK",
  description: "AJVEK — streetwear",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${cormorant.variable} ${manrope.variable} antialiased flex min-h-screen flex-col bg-background text-foreground`}
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-surface">
          <a href="/" className="font-display text-xl tracking-wide">
            AJVEK
          </a>
          <nav className="flex gap-6 text-sm text-stone">
            <a href="#" className="hover:text-foreground transition-colors">
              Collection
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              À propos
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </nav>
        </header>

        {children}

        <footer className="px-6 py-6 text-center text-xs text-stone border-t border-surface">
          © {new Date().getFullYear()} AJVEK. Tous droits réservés.
        </footer>
      </body>
    </html>
  );
}
