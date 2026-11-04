import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/Logo";
import { LoginForm } from "@/components/admin/LoginForm";
import { isAdmin } from "@/modules/admin/admin.session";

export const metadata: Metadata = { title: "Connexion admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin().catch(() => false)) redirect("/admin");
  return (
    <div className="login-wrap">
      <div className="panel login-card">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <LogoMark size={40} />
          <div>
            <h1 style={{ fontSize: "1.4rem", margin: 0 }}>Espace admin</h1>
            <span className="muted">Kodara · trafic et téléchargements</span>
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
