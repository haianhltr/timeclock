"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useUpdateConfig } from "@/lib/hooks/useConfig";
import type { SerializedConfig } from "@/lib/api/types";
import { fmt, fmt2, toMin } from "@/lib/dates";

const ACCENTS = [
  "#e8744e",
  "#3f9d6e",
  "#d99a2b",
  "#9d6ae0",
  "#e0698f",
  "#3b82c4",
];

export function SettingsForm({ initial }: { initial: SerializedConfig }) {
  const router = useRouter();
  const update = useUpdateConfig();
  const [targetDesk, setTargetDesk] = useState<string>(fmt2(initial.targetDesk));
  const [targetGate, setTargetGate] = useState<string>(fmt2(initial.targetGate));
  const [boss, setBoss] = useState(initial.boss);
  const [accent, setAccent] = useState(initial.accentHex);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetDeskMin = toMin(targetDesk);
  const targetGateMin = toMin(targetGate);
  const canSave =
    targetDeskMin != null &&
    targetGateMin != null &&
    boss.trim().length > 0 &&
    !update.isPending;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    setError(null);
    try {
      await update.mutateAsync({
        targetDesk: targetDeskMin!,
        targetGate: targetGateMin!,
        boss: boss.trim(),
        accentHex: accent,
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        maxWidth: 480,
        margin: "0 auto",
        animation: "fadeUp .4s ease both",
      }}
    >
      <h1
        style={{
          margin: "0 0 6px",
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: "-.02em",
        }}
      >
        Settings
      </h1>
      <p style={{ margin: "0 0 22px", color: "var(--ink-2)", fontSize: 14 }}>
        These values affect what the public sees too.
      </p>

      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--line-soft)",
          padding: "22px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <Field
          label="On-time target — gate"
          sub={`Currently ${fmt(initial.targetGate)} · badge-in time`}
        >
          <input
            type="time"
            value={targetGate}
            onChange={(e) => setTargetGate(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field
          label="On-time target — desk"
          sub={`Currently ${fmt(initial.targetDesk)} · seated time`}
        >
          <input
            type="time"
            value={targetDesk}
            onChange={(e) => setTargetDesk(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <Field label="Boss's name" sub="Used in the check-in message">
          <input
            type="text"
            value={boss}
            onChange={(e) => setBoss(e.target.value)}
            maxLength={40}
            style={inputStyle}
          />
        </Field>

        <Field label="Accent colour">
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {ACCENTS.map((hex) => {
              const on = accent === hex;
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setAccent(hex)}
                  aria-label={`Accent ${hex}`}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 99,
                    background: hex,
                    border: on
                      ? "2.5px solid var(--ink)"
                      : "1.5px solid var(--line)",
                    boxShadow: on ? "0 0 0 3px var(--surface)" : "none",
                    transition: "transform .12s",
                    transform: on ? "scale(1.1)" : "none",
                  }}
                />
              );
            })}
          </div>
        </Field>
      </div>

      {error && (
        <div
          style={{
            marginTop: 14,
            padding: "11px 14px",
            background: "var(--late-soft)",
            color: "var(--late)",
            fontSize: 13,
            borderRadius: "var(--radius-sm)",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSave}
        style={{
          width: "100%",
          marginTop: 18,
          background: saved ? "var(--good)" : "var(--ink)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          padding: "15px",
          borderRadius: "var(--radius-sm)",
          opacity: canSave ? 1 : 0.6,
          transition: "background .2s, opacity .15s",
        }}
      >
        {saved
          ? "✓ Saved"
          : update.isPending
            ? "Saving…"
            : "Save settings"}
      </button>
    </form>
  );
}

function Field({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 7,
        }}
      >
        <span
          style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-2)" }}
        >
          {label}
        </span>
        {sub && (
          <span style={{ fontSize: 11.5, color: "var(--muted)" }}>{sub}</span>
        )}
      </div>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 14.5,
  fontFamily: "var(--font)",
  color: "var(--ink)",
  background: "var(--surface-2)",
  borderRadius: "var(--radius-sm)",
  border: "1.5px solid var(--line)",
  outline: "none",
};
