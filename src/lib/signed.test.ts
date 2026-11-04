import { describe, expect, it } from "vitest";
import { signPayload, verifyPayload } from "./signed";

const SECRET = "un-secret-de-test-assez-long";

describe("signPayload / verifyPayload", () => {
  it("valide un jeton intact", () => {
    const t = signPayload({ a: 1, exp: 2000 }, SECRET, "test");
    expect(verifyPayload<{ a: number; exp: number }>(t, SECRET, "test", 1000)?.a).toBe(1);
  });

  it("refuse un jeton expiré", () => {
    const t = signPayload({ exp: 1000 }, SECRET, "test");
    expect(verifyPayload(t, SECRET, "test", 1000)).toBeNull();
    expect(verifyPayload(t, SECRET, "test", 5000)).toBeNull();
  });

  it("refuse un autre secret, un autre usage et un contenu modifié", () => {
    const t = signPayload({ exp: 9000 }, SECRET, "test");
    expect(verifyPayload(t, "autre-secret-autre-secret", "test", 1)).toBeNull();
    expect(verifyPayload(t, SECRET, "autre-usage", 1)).toBeNull();
    const [, sig] = t.split(".");
    const forge = Buffer.from(JSON.stringify({ exp: 99999999 })).toString("base64url");
    expect(verifyPayload(`${forge}.${sig}`, SECRET, "test", 1)).toBeNull();
  });

  it("refuse les formats invalides", () => {
    expect(verifyPayload("", SECRET, "test")).toBeNull();
    expect(verifyPayload("abc", SECRET, "test")).toBeNull();
    expect(verifyPayload("a.b.c", SECRET, "test")).toBeNull();
  });
});
