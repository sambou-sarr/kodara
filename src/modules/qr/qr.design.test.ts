import { describe, expect, it } from "vitest";
import { contrastRatio, parseHex, readabilityWarning, recommendedEcl } from "./qr.design";

describe("qr.design", () => {
  it("parse les couleurs hex", () => {
    expect(parseHex("#fff")).toEqual([255, 255, 255]);
    expect(parseHex("1B1A3A")).toEqual([27, 26, 58]);
    expect(parseHex("nope")).toBeNull();
  });

  it("calcule le contraste WCAG", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#777777", "#888888")!).toBeLessThan(2);
  });

  it("avertit si le contraste est faible ou le QR inversé", () => {
    expect(readabilityWarning("#111111", "#FFFFFF")).toBeNull();
    expect(readabilityWarning("#777777", "#888888")).toMatch(/Contraste/);
    expect(readabilityWarning("#FFFFFF", "#111111")).toMatch(/clair/);
  });

  it("monte la correction d'erreur avec un logo", () => {
    expect(recommendedEcl(true)).toBe("H");
    expect(recommendedEcl(false)).toBe("M");
  });
});
