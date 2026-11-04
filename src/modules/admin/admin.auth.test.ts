import { describe, expect, it } from "vitest";
import { createSessionToken, hashPassword, isValidSession, verifyPassword } from "./admin.auth";

const SECRET = "secret-de-test-assez-long-123";

describe("mot de passe admin", () => {
  it("vérifie le bon mot de passe et refuse les autres", () => {
    const h = hashPassword("un-mot-de-passe-solide");
    expect(h.startsWith("scrypt:")).toBe(true);
    expect(verifyPassword("un-mot-de-passe-solide", h)).toBe(true);
    expect(verifyPassword("autre", h)).toBe(false);
  });

  it("deux hachages du même mot de passe diffèrent (sel aléatoire)", () => {
    expect(hashPassword("abc")).not.toBe(hashPassword("abc"));
  });

  it("refuse un hash mal formé", () => {
    expect(verifyPassword("x", "")).toBe(false);
    expect(verifyPassword("x", "bcrypt:a:b")).toBe(false);
  });
});

describe("session admin", () => {
  it("est valide puis expire", () => {
    const t = createSessionToken(SECRET, 1000, 5000);
    expect(isValidSession(t, SECRET, 2000)).toBe(true);
    expect(isValidSession(t, SECRET, 6001)).toBe(false);
  });

  it("refuse l'absence de jeton, un mauvais secret et un jeton d'un autre usage", () => {
    const t = createSessionToken(SECRET, 1000, 5000);
    expect(isValidSession(undefined, SECRET)).toBe(false);
    expect(isValidSession(t, "autre-secret-autre-secret", 2000)).toBe(false);
  });
});
