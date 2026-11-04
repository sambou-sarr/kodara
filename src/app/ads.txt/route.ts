// /ads.txt : fichier exigé par AdSense (et la plupart des régies) pour déclarer qui peut vendre tes pubs.
// Généré à partir de NEXT_PUBLIC_ADSENSE_CLIENT (ex. « ca-pub-1234567890123456 »).
// ADS_TXT_EXTRA : lignes supplémentaires fournies par une autre régie, séparées par « | ».
export const dynamic = "force-dynamic";

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.replace(/^ca-/, "");
  const lines: string[] = [];
  if (client && /^pub-\d{8,}$/.test(client))
    lines.push(`google.com, ${client}, DIRECT, f08c47fec0942fa0`);
  for (const l of (process.env.ADS_TXT_EXTRA ?? "").split("|")) if (l.trim()) lines.push(l.trim());

  return new Response(lines.length ? lines.join("\n") + "\n" : "# Aucune régie configurée\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
