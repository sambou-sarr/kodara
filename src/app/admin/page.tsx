import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { BarList, DailyChart, Kpi } from "@/components/admin/Charts";
import { isAdmin } from "@/modules/admin/admin.session";
import { statsQuery } from "@/modules/analytics/analytics.schemas";
import { AnalyticsService } from "@/modules/analytics/analytics.service";

export const metadata: Metadata = { title: "Tableau de bord", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const PERIODS = [7, 30, 90];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  if (!(await isAdmin().catch(() => false))) redirect("/admin/login");

  const parsed = statsQuery.safeParse(await searchParams);
  const days = parsed.success ? parsed.data.days : 30;
  const s = await AnalyticsService.stats(days);

  return (
    <div className="container">
      <header className="admin-bar">
        <Logo href="/admin" size={34} />
        <div className="right">
          <nav className="tabs" style={{ margin: 0 }} aria-label="Période">
            {PERIODS.map(p => (
              <Link
                key={p}
                href={`/admin?days=${p}`}
                className="tab"
                aria-selected={p === days}
                style={{ textDecoration: "none" }}
              >
                {p} jours
              </Link>
            ))}
          </nav>
          <form action="/api/admin/logout" method="post">
            <button className="btn btn-ghost" type="submit">
              Déconnexion
            </button>
          </form>
        </div>
      </header>

      <p className="muted">
        Du {s.from} au {s.to} · visiteurs comptés une fois par jour (identifiant anonyme, sans cookie).
      </p>

      <section className="kpis" aria-label="Indicateurs clés">
        <Kpi label="Visiteurs" value={s.totals.visitors} />
        <Kpi label="Pages vues" value={s.totals.pageviews} />
        <Kpi label="Bannières vues" value={s.totals.bannerViews} hint="estimation (AdSense fait foi)" />
        <Kpi label="Pubs lancées" value={s.totals.adStarts} />
        <Kpi label="Pubs terminées" value={s.totals.adCompletes} hint={`${s.rates.adCompletionPct} % des pubs lancées`} />
        <Kpi label="Téléchargements" value={s.totals.downloads} hint={`${s.rates.downloadPerVisitorPct} % des visiteurs`} />
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <h2>Trafic par jour</h2>
        <DailyChart daily={s.daily} />
      </section>

      <div className="admin-grid">
        <section className="panel">
          <h2>Pages les plus vues</h2>
          <BarList items={s.topPages} />
        </section>
        <section className="panel">
          <h2>Sources de trafic</h2>
          <BarList items={s.sources} />
        </section>
        <section className="panel">
          <h2>Pays</h2>
          <BarList items={s.countries} empty="Le pays n'est connu que derrière Vercel ou Cloudflare" />
        </section>
        <section className="panel">
          <h2>Formats téléchargés</h2>
          <BarList items={s.formats} />
        </section>
        <section className="panel">
          <h2>Appareils</h2>
          <BarList items={s.devices} />
        </section>
        <section className="panel">
          <h2>Navigateurs</h2>
          <BarList items={s.browsers} />
        </section>
      </div>
    </div>
  );
}
