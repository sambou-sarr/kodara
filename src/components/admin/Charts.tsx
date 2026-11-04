// Graphiques du tableau de bord : composants serveur, SVG pur (aucune dépendance).
import type { Stats } from "@/modules/analytics/analytics.pure";

export function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="kpi">
      <div className="v">{typeof value === "number" ? value.toLocaleString("fr-FR") : value}</div>
      <div className="l">{label}</div>
      {hint && <div className="l">{hint}</div>}
    </div>
  );
}

export function BarList({ items, empty = "Pas encore de données" }: { items: { label: string; count: number }[]; empty?: string }) {
  if (items.length === 0) return <p className="muted">{empty}</p>;
  const max = Math.max(...items.map(i => i.count));
  return (
    <ul className="bars">
      {items.map(i => (
        <li key={i.label}>
          <div className="row">
            <span title={i.label}>{i.label}</span>
            <strong>{i.count.toLocaleString("fr-FR")}</strong>
          </div>
          <div className="track">
            <span className="fill" style={{ width: `${(i.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

const W = 720;
const H = 220;
const PAD = { l: 36, r: 8, t: 10, b: 24 };

export function DailyChart({ daily }: { daily: Stats["daily"] }) {
  const max = Math.max(1, ...daily.map(d => Math.max(d.pageviews, d.downloads)));
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;
  const step = iw / daily.length;
  const bw = Math.max(2, step * 0.62);
  const y = (v: number) => PAD.t + ih - (v / max) * ih;
  const every = Math.max(1, Math.ceil(daily.length / 8));
  const line = daily.map((d, i) => `${PAD.l + step * i + step / 2},${y(d.downloads)}`).join(" ");

  return (
    <>
      <div className="legend">
        <span>
          <i style={{ background: "var(--brand)" }} />
          Pages vues
        </span>
        <span>
          <i style={{ background: "var(--accent)" }} />
          Téléchargements
        </span>
      </div>
      <svg
        className="chart"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Pages vues et téléchargements par jour sur ${daily.length} jours`}
      >
        {[0, 0.5, 1].map(t => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(max * t)} y2={y(max * t)} stroke="var(--line)" />
            <text x={PAD.l - 6} y={y(max * t) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
              {Math.round(max * t)}
            </text>
          </g>
        ))}
        {daily.map((d, i) => (
          <g key={d.date}>
            <rect
              x={PAD.l + step * i + (step - bw) / 2}
              y={y(d.pageviews)}
              width={bw}
              height={PAD.t + ih - y(d.pageviews)}
              rx={2}
              fill="var(--brand)"
              opacity={0.85}
            >
              <title>{`${d.date} · ${d.pageviews} pages vues · ${d.visitors} visiteurs · ${d.downloads} téléchargements`}</title>
            </rect>
            {i % every === 0 && (
              <text x={PAD.l + step * i + step / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--muted)">
                {d.date.slice(5).split("-").reverse().join("/")}
              </text>
            )}
          </g>
        ))}
        <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </>
  );
}
