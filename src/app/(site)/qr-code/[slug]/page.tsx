import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdBanner } from "@/components/AdBanner";
import { Designer } from "@/components/Designer";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { QR_PAGES, getQrPage } from "@/content/qrPages";
import { adsGateEnabled } from "@/lib/env";
import { breadcrumbLd, faqLd, howToLd } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// Pages générées au build : HTML complet pour les moteurs de recherche.
export const dynamicParams = false;
export function generateStaticParams() {
  return QR_PAGES.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getQrPage((await params).slug);
  if (!page) return {};
  const url = `/qr-code/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: page.title, description: page.description },
    twitter: { title: page.title, description: page.description },
  };
}

export default async function QrTypePage({ params }: Props) {
  const page = getQrPage((await params).slug);
  if (!page) notFound();
  const others = QR_PAGES.filter(p => p.slug !== page.slug);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Accueil", path: "/" },
          { name: `QR code ${page.label.toLowerCase()}`, path: `/qr-code/${page.slug}` },
        ])}
      />
      <JsonLd data={faqLd(page.faq)} />
      <JsonLd data={howToLd(page.h1, page.steps)} />

      <section className="hero">
        <p className="crumbs">
          <Link href="/">Accueil</Link> / QR code {page.label.toLowerCase()}
        </p>
        <h1>{page.h1}</h1>
        <p className="lead">{page.intro}</p>
      </section>

      <Designer initialType={page.type} gateEnabled={adsGateEnabled()} />

      <section className="section" aria-labelledby="etapes">
        <h2 id="etapes">Comment faire en 3 étapes</h2>
        <ol className="steps">
          {page.steps.map(s => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <AdBanner />

      <section className="section prose" aria-labelledby="usages">
        <h2 id="usages">À quoi sert ce QR code ?</h2>
        <ul>
          {page.uses.map(u => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </section>

      <FaqSection items={page.faq} id="faq-page" />

      <AdBanner />

      <section className="section" aria-labelledby="autres">
        <h2 id="autres">Autres types de QR code</h2>
        <div className="cards">
          {others.map(p => (
            <Link key={p.slug} className="card" href={`/qr-code/${p.slug}`}>
              <h3>QR code {p.label.toLowerCase()}</h3>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
