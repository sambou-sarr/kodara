import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rateLimit";

describe("createRateLimiter", () => {
  it("bloque au-delà du maximum puis libère après la fenêtre", () => {
    const rl = createRateLimiter({ max: 2, windowMs: 1000 });
    expect(rl.hit("ip", 0).allowed).toBe(true);
    expect(rl.hit("ip", 100).allowed).toBe(true);
    const blocked = rl.hit("ip", 200);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBe(800);
    expect(rl.hit("ip", 1001).allowed).toBe(true);
  });

  it("compte chaque clé séparément et reset fonctionne", () => {
    const rl = createRateLimiter({ max: 1, windowMs: 1000 });
    expect(rl.hit("a", 0).allowed).toBe(true);
    expect(rl.hit("b", 0).allowed).toBe(true);
    expect(rl.hit("a", 10).allowed).toBe(false);
    rl.reset("a");
    expect(rl.hit("a", 20).allowed).toBe(true);
  });
});
