import type { ReactNode } from "react";
import { Footer, Header } from "@/components/SiteChrome";
import { Tracker } from "@/components/Tracker";

// Habillage du site public (l'espace admin a le sien, sans en-tête ni pied de page publics).
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#contenu">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="container">
        {children}
      </main>
      <Footer />
      <Tracker />
    </>
  );
}
