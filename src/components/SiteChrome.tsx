import Link from "next/link";
import { QR_PAGES } from "@/content/qrPages";
import { adsGateEnabled } from "@/lib/env";
import { Logo } from "./Logo";

export function Header() {
  return (
    <header className="site-header">
      <div className="container">
        <Logo />
        <nav className="nav" aria-label="Types de QR code">
          {QR_PAGES.slice(0, 5).map(p => (
            <Link key={p.slug} href={`/qr-code/${p.slug}`}>
              {p.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="muted" style={{ marginTop: 12, maxWidth: "36ch" }}>
            Le générateur de QR code gratuit, personnalisable, sans inscription.
            {adsGateEnabled() && " Une courte pub, et ton QR code est à toi."}
          </p>
        </div>
        <nav aria-label="Générateurs">
          <h2>Générateurs</h2>
          <ul>
            {QR_PAGES.map(p => (
              <li key={p.slug}>
                <Link href={`/qr-code/${p.slug}`}>QR code {p.label.toLowerCase()}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Informations">
          <h2>Informations</h2>
          <ul>
            <li>
              <Link href="/#faq">Questions fréquentes</Link>
            </li>
            <li>
              <Link href="/confidentialite">Confidentialité</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
