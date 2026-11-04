// Limiteur de débit en mémoire (fenêtre glissante). Suffisant pour une instance unique ;
// sur plusieurs instances / serverless, le remplacer par Redis ou Upstash.
export function createRateLimiter(opts: { max: number; windowMs: number }) {
  const hits = new Map<string, number[]>();
  return {
    hit(key: string, now = Date.now()): { allowed: boolean; retryAfterMs: number } {
      const recent = (hits.get(key) ?? []).filter(t => now - t < opts.windowMs);
      if (recent.length >= opts.max) {
        hits.set(key, recent);
        return { allowed: false, retryAfterMs: opts.windowMs - (now - recent[0]) };
      }
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 5000)
        for (const [k, v] of hits) if (v.every(t => now - t >= opts.windowMs)) hits.delete(k);
      return { allowed: true, retryAfterMs: 0 };
    },
    reset(key: string) {
      hits.delete(key);
    },
  };
}
