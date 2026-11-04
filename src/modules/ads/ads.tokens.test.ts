import { describe, expect, it } from "vitest";
import {
  AD_VIEW_MAX_AGE_MS,
  DOWNLOAD_TOKEN_TTL_MS,
  createDownloadToken,
  isViewExpired,
  isWatchComplete,
  readDownloadToken,
  secondsLeft,
} from "./ads.tokens";

const SECRET = "secret-de-test-assez-long-123";

describe("chronomètre de la pub", () => {
  it("exige la durée minimale (avec une petite tolérance réseau)", () => {
    expect(isWatchComplete(0, 3000, 8)).toBe(false);
    expect(isWatchComplete(0, 7000, 8)).toBe(false);
    expect(isWatchComplete(0, 7300, 8)).toBe(true);
    expect(isWatchComplete(0, 8000, 8)).toBe(true);
  });

  it("calcule les secondes restantes", () => {
    expect(secondsLeft(0, 3000, 8)).toBe(5);
    expect(secondsLeft(0, 9000, 8)).toBe(0);
  });

  it("expire une vue trop ancienne", () => {
    expect(isViewExpired(0, AD_VIEW_MAX_AGE_MS)).toBe(false);
    expect(isViewExpired(0, AD_VIEW_MAX_AGE_MS + 1)).toBe(true);
  });
});

describe("jeton de téléchargement", () => {
  it("retrouve l'identifiant de la vue tant qu'il est valide", () => {
    const t = createDownloadToken("view123456", SECRET, 1000);
    expect(readDownloadToken(t, SECRET, 2000)).toBe("view123456");
    expect(readDownloadToken(t, SECRET, 1000 + DOWNLOAD_TOKEN_TTL_MS + 1)).toBeNull();
  });

  it("refuse un mauvais secret ou un jeton falsifié", () => {
    const t = createDownloadToken("view123456", SECRET, 1000);
    expect(readDownloadToken(t, "autre-secret-autre-secret", 2000)).toBeNull();
    expect(readDownloadToken(t + "x", SECRET, 2000)).toBeNull();
  });
});
