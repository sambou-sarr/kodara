import { describe, expect, it } from "vitest";
import { absoluteUrl, breadcrumbLd, faqLd, howToLd } from "./seo";

describe("seo", () => {
  it("construit des URLs absolues", () => {
    expect(absoluteUrl("/qr-code/wifi", "https://kodara.app")).toBe(
      "https://kodara.app/qr-code/wifi"
    );
    expect(absoluteUrl("x", "https://kodara.app")).toBe("https://kodara.app/x");
  });

  it("génère un FAQPage valide", () => {
    const ld = faqLd([{ q: "Question ?", a: "Réponse." }]);
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity[0].acceptedAnswer.text).toBe("Réponse.");
  });

  it("génère un fil d'Ariane numéroté", () => {
    const ld = breadcrumbLd(
      [
        { name: "Accueil", path: "/" },
        { name: "Wi-Fi", path: "/qr-code/wifi" },
      ],
      "https://kodara.app"
    );
    expect(ld.itemListElement.map(i => i.position)).toEqual([1, 2]);
    expect(ld.itemListElement[1].item).toBe("https://kodara.app/qr-code/wifi");
  });

  it("génère un HowTo", () => {
    expect(howToLd("Titre", ["a", "b"]).step).toHaveLength(2);
  });
});
