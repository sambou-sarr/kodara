"use client";

import type QRCodeStyling from "qr-code-styling";
import type { Options } from "qr-code-styling";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CORNER_DOT_STYLES,
  CORNER_SQUARE_STYLES,
  DOT_STYLES,
  THEMES,
  readabilityWarning,
  recommendedEcl,
} from "@/modules/qr/qr.design";
import {
  EXPORT_FORMATS,
  QR_TYPES,
  buildPayload,
  type ExportFormat,
  type QrFields,
  type QrType,
} from "@/modules/qr/qr.payloads";
import { AdGate } from "./AdGate";

type FieldDef = {
  name: string;
  label: string;
  placeholder?: string;
  input?: "text" | "url" | "tel" | "email" | "textarea" | "select";
  options?: [string, string][];
};

const TYPE_LABELS: Record<QrType, string> = {
  url: "Lien",
  texte: "Texte",
  wifi: "Wi-Fi",
  whatsapp: "WhatsApp",
  email: "E-mail",
  sms: "SMS",
  vcard: "Contact",
};

const FIELDS: Record<QrType, FieldDef[]> = {
  url: [{ name: "url", label: "Adresse du site", placeholder: "https://monsite.com", input: "url" }],
  texte: [{ name: "texte", label: "Ton texte", placeholder: "Écris ton message…", input: "textarea" }],
  wifi: [
    { name: "ssid", label: "Nom du réseau (SSID)", placeholder: "MonWifi" },
    { name: "password", label: "Mot de passe", placeholder: "••••••••" },
    {
      name: "encryption",
      label: "Sécurité",
      input: "select",
      options: [
        ["WPA", "WPA / WPA2"],
        ["WEP", "WEP"],
        ["nopass", "Aucune"],
      ],
    },
    {
      name: "hidden",
      label: "Réseau masqué",
      input: "select",
      options: [
        ["", "Non"],
        ["true", "Oui"],
      ],
    },
  ],
  whatsapp: [
    { name: "phone", label: "Numéro (format international)", placeholder: "+221 77 123 45 67", input: "tel" },
    { name: "message", label: "Message prérempli (facultatif)", placeholder: "Bonjour, je souhaite…", input: "textarea" },
  ],
  email: [
    { name: "to", label: "Destinataire", placeholder: "contact@monsite.com", input: "email" },
    { name: "subject", label: "Objet (facultatif)" },
    { name: "body", label: "Message (facultatif)", input: "textarea" },
  ],
  sms: [
    { name: "phone", label: "Numéro", placeholder: "+221 77 123 45 67", input: "tel" },
    { name: "message", label: "Message (facultatif)", input: "textarea" },
  ],
  vcard: [
    { name: "prenom", label: "Prénom" },
    { name: "nom", label: "Nom" },
    { name: "org", label: "Entreprise (facultatif)" },
    { name: "title", label: "Fonction (facultatif)" },
    { name: "phone", label: "Téléphone (facultatif)", input: "tel" },
    { name: "email", label: "E-mail (facultatif)", input: "email" },
    { name: "url", label: "Site web (facultatif)", input: "url" },
  ],
};

type Style = {
  fg: string;
  bg: string;
  gradient: boolean;
  fg2: string;
  rotation: number;
  dots: string;
  cornerSquare: string;
  cornerDot: string;
  margin: number;
  ecl: "L" | "M" | "Q" | "H";
  logo: string | null;
  logoSize: number;
};

const DEFAULT_STYLE: Style = {
  fg: "#1B1A3A",
  bg: "#FFFFFF",
  gradient: false,
  fg2: "#C2570C",
  rotation: 45,
  dots: "rounded",
  cornerSquare: "extra-rounded",
  cornerDot: "dot",
  margin: 8,
  ecl: "M",
  logo: null,
  logoSize: 0.3,
};

const PREVIEW_SIZE = 300;
const PLACEHOLDER = "https://kodara.app";

function toOptions(s: Style, data: string, size: number, type: "svg" | "canvas"): Options {
  return {
    width: size,
    height: size,
    type,
    data: data || PLACEHOLDER,
    margin: Math.round((s.margin / PREVIEW_SIZE) * size),
    image: s.logo ?? undefined,
    qrOptions: { errorCorrectionLevel: s.logo ? recommendedEcl(true) : s.ecl },
    dotsOptions: {
      type: s.dots,
      color: s.fg,
      gradient: s.gradient
        ? {
            type: "linear",
            rotation: (s.rotation * Math.PI) / 180,
            colorStops: [
              { offset: 0, color: s.fg },
              { offset: 1, color: s.fg2 },
            ],
          }
        : undefined,
    },
    backgroundOptions: { color: s.bg },
    cornersSquareOptions: { type: s.cornerSquare, color: s.fg },
    cornersDotOptions: { type: s.cornerDot, color: s.fg },
    imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: s.logoSize, hideBackgroundDots: true },
  } as Options;
}

export function Designer({
  initialType = "url",
  gateEnabled = false,
}: {
  initialType?: QrType;
  gateEnabled?: boolean; // true : une pub avant chaque téléchargement ; false : téléchargement libre
}) {
  const [type, setType] = useState<QrType>(initialType);
  const [fields, setFields] = useState<QrFields>({ encryption: "WPA" });
  const [style, setStyle] = useState<Style>(DEFAULT_STYLE);
  const [exportSize, setExportSize] = useState(1024);
  const [gate, setGate] = useState<ExportFormat | null>(null);
  const [busy, setBusy] = useState<ExportFormat | null>(null);
  const [dlError, setDlError] = useState("");

  const payload = useMemo(() => buildPayload(type, fields), [type, fields]);
  const ready = payload.length > 0;
  const warning = readabilityWarning(style.fg, style.bg);

  // ───────── Aperçu en direct (qr-code-styling n'est chargé que dans le navigateur) ─────────
  const host = useRef<HTMLDivElement>(null);
  const qr = useRef<QRCodeStyling | null>(null);
  const latest = useRef<Options>(toOptions(style, payload, PREVIEW_SIZE, "svg"));
  latest.current = toOptions(style, payload, PREVIEW_SIZE, "svg");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    import("qr-code-styling").then(({ default: QR }) => {
      if (cancelled || !el) return;
      qr.current = new QR(latest.current);
      qr.current.append(el);
      setMounted(true);
    });
    return () => {
      cancelled = true;
      qr.current = null;
      if (el) el.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    if (mounted) qr.current?.update(latest.current);
  }, [mounted, style, payload]);

  // ───────── Téléchargement (appelé uniquement après validation serveur du jeton) ─────────
  const download = useCallback(
    async (format: ExportFormat) => {
    const { default: QR } = await import("qr-code-styling");
    const instance = new QR(toOptions(style, payload, exportSize, format === "svg" ? "svg" : "canvas"));
    await new Promise(r => setTimeout(r, 250)); // laisse le rendu (logo compris) se terminer
    await instance.download({ name: `kodara-qr-${type}`, extension: format });
    },
    [style, payload, exportSize, type]
  );

  // Portail désactivé : on télécharge directement, puis on compte le téléchargement (sans bloquer l'utilisateur).
  const freeDownload = async (format: ExportFormat) => {
    setBusy(format);
    setDlError("");
    try {
      await download(format);
      fetch("/api/downloads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, type }),
      }).catch(() => {});
    } catch {
      setDlError("Le téléchargement a échoué, réessaie.");
    } finally {
      setBusy(null);
    }
  };

  const setField = (name: string, value: string) => setFields(f => ({ ...f, [name]: value }));
  const patch = (p: Partial<Style>) => setStyle(s => ({ ...s, ...p }));

  const onLogo = (file: File | undefined) => {
    if (!file) return patch({ logo: null });
    if (!file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => patch({ logo: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="designer" id="creer">
      <div>
        <section className="panel" aria-labelledby="h-contenu">
          <h2 id="h-contenu">1 · Que veux-tu encoder ?</h2>
          <div className="tabs" role="tablist" aria-label="Type de QR code">
            {QR_TYPES.map(t => (
              <button
                key={t}
                role="tab"
                type="button"
                className="tab"
                aria-selected={type === t}
                onClick={() => setType(t)}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
          {FIELDS[type].map(f => (
            <div className="field" key={`${type}-${f.name}`}>
              <label htmlFor={`f-${f.name}`}>{f.label}</label>
              {f.input === "textarea" ? (
                <textarea
                  id={`f-${f.name}`}
                  rows={3}
                  maxLength={1000}
                  placeholder={f.placeholder}
                  value={fields[f.name] ?? ""}
                  onChange={e => setField(f.name, e.target.value)}
                />
              ) : f.input === "select" ? (
                <select
                  id={`f-${f.name}`}
                  value={fields[f.name] ?? f.options![0][0]}
                  onChange={e => setField(f.name, e.target.value)}
                >
                  {f.options!.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`f-${f.name}`}
                  type={f.input ?? "text"}
                  maxLength={500}
                  placeholder={f.placeholder}
                  value={fields[f.name] ?? ""}
                  onChange={e => setField(f.name, e.target.value)}
                  autoComplete="off"
                />
              )}
            </div>
          ))}
        </section>

        <section className="panel" aria-labelledby="h-couleurs">
          <h2 id="h-couleurs">2 · Couleurs</h2>
          <div className="themes" role="group" aria-label="Thèmes de couleurs">
            {THEMES.map(t => (
              <button
                key={t.id}
                type="button"
                className="theme"
                aria-pressed={style.fg === t.fg && style.bg === t.bg}
                onClick={() => patch({ fg: t.fg, bg: t.bg, gradient: Boolean(t.fg2), fg2: t.fg2 ?? style.fg2 })}
              >
                <span className="swatch" style={{ background: t.bg, borderColor: t.fg }} />
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid-2" style={{ marginTop: 16 }}>
            <div className="field">
              <span className="label">Motif</span>
              <div className="color-row">
                <input type="color" aria-label="Couleur du motif" value={style.fg} onChange={e => patch({ fg: e.target.value })} />
                <code>{style.fg.toUpperCase()}</code>
              </div>
            </div>
            <div className="field">
              <span className="label">Fond</span>
              <div className="color-row">
                <input type="color" aria-label="Couleur du fond" value={style.bg} onChange={e => patch({ bg: e.target.value })} />
                <code>{style.bg.toUpperCase()}</code>
              </div>
            </div>
          </div>
          <div className="field">
            <label>
              <input type="checkbox" checked={style.gradient} onChange={e => patch({ gradient: e.target.checked })} /> Dégradé
            </label>
            {style.gradient && (
              <div className="grid-2">
                <div className="color-row">
                  <input type="color" aria-label="Seconde couleur du dégradé" value={style.fg2} onChange={e => patch({ fg2: e.target.value })} />
                  <code>{style.fg2.toUpperCase()}</code>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={15}
                  aria-label="Angle du dégradé"
                  value={style.rotation}
                  onChange={e => patch({ rotation: Number(e.target.value) })}
                />
              </div>
            )}
          </div>
          {warning && (
            <p className="warn" role="status">
              {warning}
            </p>
          )}
        </section>

        <section className="panel" aria-labelledby="h-formes">
          <h2 id="h-formes">3 · Formes</h2>
          <ChipGroup label="Modules" value={style.dots} options={DOT_STYLES} onChange={v => patch({ dots: v })} />
          <ChipGroup label="Cadres des coins" value={style.cornerSquare} options={CORNER_SQUARE_STYLES} onChange={v => patch({ cornerSquare: v })} />
          <ChipGroup label="Points des coins" value={style.cornerDot} options={CORNER_DOT_STYLES} onChange={v => patch({ cornerDot: v })} />
          <div className="field">
            <label htmlFor="margin">Marge autour du code : {style.margin} px</label>
            <input id="margin" type="range" min={0} max={40} value={style.margin} onChange={e => patch({ margin: Number(e.target.value) })} />
          </div>
        </section>

        <section className="panel" aria-labelledby="h-logo">
          <h2 id="h-logo">4 · Logo</h2>
          <div className="field">
            <label htmlFor="logo">Image au centre (PNG, JPG, SVG · 2 Mo max)</label>
            <input id="logo" type="file" accept="image/*" onChange={e => onLogo(e.target.files?.[0])} />
          </div>
          {style.logo && (
            <>
              <div className="field">
                <label htmlFor="logo-size">Taille du logo : {Math.round(style.logoSize * 100)} %</label>
                <input id="logo-size" type="range" min={0.1} max={0.45} step={0.05} value={style.logoSize} onChange={e => patch({ logoSize: Number(e.target.value) })} />
              </div>
              <button type="button" className="btn btn-ghost" onClick={() => patch({ logo: null })}>
                Retirer le logo
              </button>
              <p className="hint">La correction d'erreur est portée à 30 % pour compenser la zone masquée.</p>
            </>
          )}
        </section>
      </div>

      <aside className="designer-preview" aria-label="Aperçu et téléchargement">
        <div className="panel">
          <div className="qr-stage">
            <div ref={host} aria-label="Aperçu du QR code" role="img" />
          </div>
          {!ready && <p className="hint">Renseigne le contenu pour activer le téléchargement.</p>}
          <div className="field" style={{ marginTop: 14 }}>
            <label htmlFor="size">Taille d'export (PNG, JPEG, WEBP)</label>
            <select id="size" value={exportSize} onChange={e => setExportSize(Number(e.target.value))}>
              <option value={512}>512 × 512 px</option>
              <option value={1024}>1024 × 1024 px</option>
              <option value={2048}>2048 × 2048 px</option>
            </select>
          </div>
          <div className="dl-grid">
            {EXPORT_FORMATS.map((f, i) => (
              <button
                key={f}
                type="button"
                className={i === 0 ? "btn btn-primary" : "btn btn-ghost"}
                disabled={!ready || busy !== null}
                onClick={() => (gateEnabled ? setGate(f) : freeDownload(f))}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          {dlError && (
            <p className="error" role="alert">
              {dlError}
            </p>
          )}
          <p className="hint">
            {gateEnabled
              ? "Gratuit, sans inscription : une courte publicité avant chaque téléchargement. "
              : "Gratuit et sans inscription. "}
            Le SVG est idéal pour l'impression grand format.
          </p>
        </div>
      </aside>

      {gate && (
        <AdGate
          format={gate}
          qrType={type}
          onUnlocked={() => download(gate)}
          onClose={() => setGate(null)}
        />
      )}
    </div>
  );
}

function ChipGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="field">
      <span className="label">{label}</span>
      <div className="chips" role="group" aria-label={label}>
        {options.map(([v, l]) => (
          <button key={v} type="button" className="chip" aria-pressed={value === v} onClick={() => onChange(v)}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
