import type { Metadata } from "next";
import Link from "next/link";
import { AdBanner } from "@/components/AdBanner";
import { Designer } from "@/components/Designer";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { HOME_FAQ } from "@/content/homeFaq";
import { QR_PAGES } from "@/content/qrPages";
import { adsGateEnabled } from "@/lib/env";
import { SITE_NAME, SITE_TAGLINE, faqLd, howToLd, organizationLd, webAppLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} · ${SITE_TAGLINE}` },
  alternates: { canonical: "/" },
};

const GATE = adsGateEnabled();

const STEPS = [
  "Choisis le type de QR code et saisis ton contenu.",
  "Personnalise les couleurs, les formes et ajoute ton logo.",
  GATE
    ? "Regarde une courte publicité, puis télécharge ton QR code en PNG, JPEG, WEBP ou SVG."
    : "Télécharge ton QR code en PNG, JPEG, WEBP ou SVG.",
];

export default function HomePage() {
  return (
    <>
      <JsonLd data={webAppLd()} />
      <JsonLd data={organizationLd()} />
      <JsonLd data={faqLd(HOME_FAQ)} />
      <JsonLd data={howToLd("Comment créer un QR code personnalisé", STEPS)} />

      <section className="hero">
        <span className="eyebrow">Gratuit · Sans inscription</span>
        <h1>
          Crée ton <em>QR code</em> sur&#8209;mesure.
        </h1>
        <p className="lead">
          Couleurs, formes, logo : dessine un QR code qui te ressemble, puis télécharge-le en haute
          définition.{GATE ? " Une courte pub, et il est à toi." : " Gratuit, sans inscription."}
        </p>
      </section>

      <Designer initialType="url" gateEnabled={GATE} />

      <section className="section" aria-labelledby="comment">
        <h2 id="comment">Comment créer un QR code en 3 étapes</h2>
        <ol className="steps">
          {STEPS.map(s => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>

      <AdBanner />

      <section className="section" aria-labelledby="types">
        <h2 id="types">Un QR code pour chaque usage</h2>
        <div className="cards">
          {QR_PAGES.map(p => (
            <Link key={p.slug} className="card" href={`/qr-code/${p.slug}`}>
              <h3>QR code {p.label.toLowerCase()}</h3>
              <p>{p.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section prose" aria-labelledby="pourquoi">
        <h2 id="pourquoi">Pourquoi choisir Kodara ?</h2>
        <ul>
          <li>
            <strong>Personnalisation complète :</strong> couleurs, dégradés, six styles de modules,
            coins arrondis et logo au centre.
          </li>
          <li>
            <strong>QR codes statiques et durables :</strong> aucune redirection, aucun abonnement,
            ils ne s'éteignent jamais.
          </li>
          <li>
            <strong>Quatre formats d'export :</strong> PNG, JPEG, WEBP pour le web, SVG vectoriel pour
            l'impression grand format.
          </li>
          <li>
            <strong>Respect de ta vie privée :</strong> ton contenu est encodé dans ton navigateur et
            n'est jamais envoyé à nos serveurs.
          </li>
        </ul>
      </section>

      <AdBanner />

      <FaqSection items={HOME_FAQ} />
    </>
  );
}
