import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Page introuvable", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="container">
      <section className="hero">
        <h1>Page introuvable</h1>
        <p className="lead">Cette page n'existe pas ou a été déplacée.</p>
        <Link className="btn btn-primary" href="/">
          Créer un QR code
        </Link>
      </section>
    </main>
  );
}
