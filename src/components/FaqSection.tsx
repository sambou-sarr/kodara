import type { Faq } from "@/lib/seo";

// <details> natif : accessible, sans JavaScript, et le texte reste dans le HTML pour les moteurs de recherche.
export function FaqSection({ items, id = "faq" }: { items: Faq[]; id?: string }) {
  return (
    <section className="section" id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>Questions fréquentes</h2>
      <div className="faq">
        {items.map(i => (
          <details key={i.q}>
            <summary>{i.q}</summary>
            <p>{i.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
