"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExportFormat, QrType } from "@/modules/qr/qr.payloads";
import { GateAd } from "./GateAd";

type Props = {
  format: ExportFormat;
  qrType: QrType;
  onUnlocked: () => Promise<void>; // génère et télécharge le fichier une fois le jeton consommé
  onClose: () => void;
};

type Phase = "loading" | "watching" | "ready" | "finishing" | "done" | "error";

async function post<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Une erreur est survenue");
  return data as T;
}

// Parcours : le serveur démarre le chronomètre → countdown → le serveur vérifie la durée
// et délivre un jeton à usage unique → le jeton est consommé → le fichier est généré.
export function AdGate({ format, qrType, onUnlocked, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [left, setLeft] = useState(0);
  const [total, setTotal] = useState(8);
  const [error, setError] = useState("");
  const viewId = useRef<string | null>(null);
  const started = useRef(false);
  const btn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let timer: ReturnType<typeof setInterval> | undefined;
    post<{ viewId: string; minSeconds: number }>("/api/ads/start")
      .then(({ viewId: id, minSeconds }) => {
        viewId.current = id;
        setTotal(minSeconds);
        const t0 = performance.now();
        setPhase("watching");
        setLeft(minSeconds);
        timer = setInterval(() => {
          const remaining = Math.max(0, minSeconds - (performance.now() - t0) / 1000);
          setLeft(remaining);
          if (remaining <= 0) {
            clearInterval(timer);
            setPhase("ready");
          }
        }, 200);
      })
      .catch(e => {
        setError(e.message);
        setPhase("error");
      });
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (phase === "ready") btn.current?.focus();
  }, [phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const unlock = useCallback(async () => {
    if (!viewId.current) return;
    setPhase("finishing");
    try {
      const { token } = await post<{ token: string }>("/api/ads/complete", { viewId: viewId.current });
      await post("/api/downloads", { token, format, type: qrType });
      await onUnlocked();
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue");
      setPhase("error");
    }
  }, [format, qrType, onUnlocked]);

  const pct = Math.min(100, ((total - left) / total) * 100);

  return (
    <div className="overlay" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-title"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="ad-title">
          {phase === "done" ? "C'est téléchargé !" : "Une courte pub, puis ton QR code est à toi"}
        </h2>

        {phase !== "done" && phase !== "error" && (
          <>
            <div className="ad-box">{phase === "loading" ? <span>Chargement…</span> : <GateAd />}</div>
            <div
              className="progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={Math.round(total - left)}
              aria-label="Progression de la publicité"
            >
              <span style={{ width: `${pct}%` }} />
            </div>
            <p className="hint" aria-live="polite">
              {phase === "watching" && `Téléchargement disponible dans ${Math.ceil(left)} s…`}
              {phase === "ready" && "Merci ! Ton téléchargement est prêt."}
              {phase === "finishing" && "Préparation du fichier…"}
            </p>
          </>
        )}

        {phase === "done" && (
          <p>
            Ton fichier {format.toUpperCase()} a été enregistré sur ton appareil. Pense à tester le
            scan avec ton téléphone avant d'imprimer.
          </p>
        )}
        {phase === "error" && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            {phase === "done" ? "Fermer" : "Annuler"}
          </button>
          {phase !== "done" && phase !== "error" && (
            <button
              ref={btn}
              type="button"
              className="btn btn-primary"
              disabled={phase !== "ready"}
              onClick={unlock}
            >
              Télécharger en {format.toUpperCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
