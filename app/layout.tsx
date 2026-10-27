import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Newsreader } from "next/font/google";
import SiteNav from "@/components/SiteNav";
import "./globals.css";

const sans = Inter({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-sans" });
const serif = Newsreader({ subsets: ["latin", "latin-ext"], variable: "--font-serif" });

export const viewport = { themeColor: [
  { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
  { media: "(prefers-color-scheme: dark)", color: "#111110" },
] };

export const metadata: Metadata = {
  title: { default: "na strani — ko je na čijoj strani", template: "%s · na strani" },
  description:
    "Javna baza veza funkcionera i javnih ličnosti sa političkim strankama u Srbiji, sa izvorima.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sr" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <header className="top">
          <div className="wrap">
            <Link href="/" className="brand">
              na strani<span>.rs</span>
            </Link>
            <SiteNav />
          </div>
        </header>
        <main>{children}</main>
        <footer className="foot">
          <div className="wrap">
            <span>Svaka tvrdnja je povezana sa javnim izvorom.</span>
            <span>
              <Link href="/metodologija">Metodologija i ispravke</Link>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
