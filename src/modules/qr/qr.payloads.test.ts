import { describe, expect, it } from "vitest";
import { buildPayload, escapeWifi, normalizeUrl } from "./qr.payloads";

describe("normalizeUrl", () => {
  it("ajoute https:// quand il manque, sans toucher aux schémas connus", () => {
    expect(normalizeUrl("kodara.app")).toBe("https://kodara.app");
    expect(normalizeUrl("localhost:3000")).toBe("https://localhost:3000");
    expect(normalizeUrl("http://a.com")).toBe("http://a.com");
    expect(normalizeUrl("  ")).toBe("");
  });
});

describe("buildPayload", () => {
  it("url / texte", () => {
    expect(buildPayload("url", { url: "exemple.sn/menu" })).toBe("https://exemple.sn/menu");
    expect(buildPayload("texte", { texte: " bonjour " })).toBe("bonjour");
  });

  it("wifi : échappe les caractères spéciaux et gère les réseaux ouverts", () => {
    expect(escapeWifi('a;b,c:d"e\\')).toBe('a\\;b\\,c\\:d\\"e\\\\');
    expect(buildPayload("wifi", { ssid: "Maison", password: "p;ss", encryption: "WPA" })).toBe(
      "WIFI:T:WPA;S:Maison;P:p\\;ss;H:false;;"
    );
    expect(buildPayload("wifi", { ssid: "Café", encryption: "nopass", hidden: "true" })).toBe(
      "WIFI:T:nopass;S:Café;H:true;;"
    );
    expect(buildPayload("wifi", { ssid: "" })).toBe("");
  });

  it("whatsapp : garde les chiffres et encode le message", () => {
    expect(buildPayload("whatsapp", { phone: "+221 77 123 45 67", message: "Salut !" })).toBe(
      "https://wa.me/221771234567?text=Salut%20!"
    );
    expect(buildPayload("whatsapp", { phone: "abc" })).toBe("");
  });

  it("email et sms", () => {
    expect(buildPayload("email", { to: "a@b.sn", subject: "Hello World" })).toBe(
      "mailto:a@b.sn?subject=Hello%20World"
    );
    expect(buildPayload("email", { to: "a@b.sn" })).toBe("mailto:a@b.sn");
    expect(buildPayload("sms", { phone: "+221 77 000 00 00", message: "Hi" })).toBe(
      "SMSTO:+221770000000:Hi"
    );
  });

  it("vcard : champs vides ignorés, virgules échappées", () => {
    const v = buildPayload("vcard", { prenom: "Awa", nom: "Diop", org: "A, B", phone: "+221 77" });
    expect(v.startsWith("BEGIN:VCARD\r\nVERSION:3.0")).toBe(true);
    expect(v).toContain("N:Diop;Awa;;;");
    expect(v).toContain("ORG:A\\, B");
    expect(v).not.toContain("EMAIL:");
    expect(v.endsWith("END:VCARD")).toBe(true);
    expect(buildPayload("vcard", {})).toBe("");
  });
});
