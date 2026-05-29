"use client";

import { useEffect, useState, type FormEvent } from "react";
import { fmt, fmt2, toMin } from "@/lib/dates";
import { useCreateEntry, useUpdateEntry } from "@/lib/hooks/useEntries";
import type { SerializedEntry } from "@/lib/api/types";

const MOODS = [
  { v: 1, label: "Rough", hue: "var(--late)" },
  { v: 2, label: "Meh", hue: "oklch(0.72 0.13 45)" },
  { v: 3, label: "OK", hue: "var(--amber)" },
  { v: 4, label: "Good", hue: "oklch(0.74 0.10 130)" },
  { v: 5, label: "Great", hue: "var(--good)" },
] as const;

const WD_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];
const MO = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function prettyDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${WD_FULL[d.getDay()]}, ${MO[d.getMonth()]} ${d.getDate()}`;
}

type Props = {
  today: string;
  existing: SerializedEntry | undefined;
  target: number;
};

export function EntryForm({ today, existing, target }: Props) {
  const create = useCreateEntry();
  const update = useUpdateEntry();

  const existingTimed = existing?.type === "TIMED" ? existing : undefined;
  const [gate, setGate] = useState(
    existingTimed?.gate != null ? fmt2(existingTimed.gate) : "08:00"
  );
  const [desk, setDesk] = useState(
    existingTimed?.desk != null ? fmt2(existingTimed.desk) : "08:05"
  );
  const [useReason, setUseReason] = useState(!!existingTimed?.reason);
  const [reason, setReason] = useState(existingTimed?.reason ?? "");
  const [mood, setMood] = useState<number>(existingTimed?.mood ?? 4);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resync after refetch (e.g. just-submitted-existing entry got new updatedAt)
  useEffect(() => {
    if (!existingTimed) return;
    setGate(existingTimed.gate != null ? fmt2(existingTimed.gate) : "");
    setDesk(existingTimed.desk != null ? fmt2(existingTimed.desk) : "");
    setUseReason(!!existingTimed.reason);
    setReason(existingTimed.reason ?? "");
    setMood(existingTimed.mood ?? 4);
  }, [existingTimed?.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  // If today is already logged as a NOTE, the form is irrelevant — short-circuit.
  if (existing?.type === "NOTE") {
    return (
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "22px 24px",
          background: "var(--amber-soft)",
          border: "1px dashed var(--amber)",
          borderRadius: "var(--radius)",
          color: "var(--ink-2)",
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: ".04em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          {prettyDate(today)} · note
        </div>
        {existing.note}
      </div>
    );
  }

  const gateMin = toMin(gate);
  const deskMin = toMin(desk);
  const dur = gateMin != null && deskMin != null ? deskMin - gateMin : null;
  const late = deskMin != null && deskMin > target;
  const cleanReason = useReason && reason.trim() ? reason.trim() : null;

  const submitting = create.isPending || update.isPending;
  const canSubmit = gateMin != null && deskMin != null && !submitting;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      if (existingTimed) {
        await update.mutateAsync({
          date: today,
          gate: gateMin!,
          desk: deskMin!,
          reason: cleanReason,
          mood,
        });
      } else {
        await create.mutateAsync({
          date: today,
          type: "TIMED",
          gate: gateMin!,
          desk: deskMin!,
          reason: cleanReason,
          mood,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        maxWidth: 560,
        margin: "0 auto",
        animation: "fadeUp .4s ease both",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--accent)",
            letterSpacing: ".04em",
            textTransform: "uppercase",
          }}
        >
          {existingTimed ? "Already logged · editing" : "Today"}
        </div>
        <h1
          style={{
            margin: "4px 0 0",
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: "-.02em",
          }}
        >
          {prettyDate(today)}
        </h1>
      </div>

      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          padding: "24px 24px 26px",
          border: "1px solid var(--line-soft)",
        }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          <TimePicker label="Time to gate" value={gate} onChange={setGate} />
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              paddingBottom: 16,
              color: "var(--muted)",
              fontSize: 18,
            }}
          >
            →
          </div>
          <TimePicker label="Time to desk" value={desk} onChange={setDesk} />
        </div>

        <div style={{ display: "flex", gap: 9, marginTop: 14, flexWrap: "wrap" }}>
          {dur != null && <Chip tone="neutral">{dur} min gate → desk</Chip>}
          {deskMin != null &&
            (late ? (
              <Chip tone="late">Late · target {fmt(target)}</Chip>
            ) : (
              <Chip tone="good">On time</Chip>
            ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <span
            style={{
              display: "block",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--ink-2)",
              marginBottom: 9,
            }}
          >
            Energy this morning
          </span>
          <div style={{ display: "flex", gap: 7 }}>
            {MOODS.map((m) => {
              const on = mood === m.v;
              return (
                <button
                  key={m.v}
                  type="button"
                  onClick={() => setMood(m.v)}
                  style={{
                    flex: 1,
                    padding: "10px 4px",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12.5,
                    fontWeight: 700,
                    background: on ? m.hue : "var(--surface-2)",
                    color: on ? "#fff" : "var(--ink-2)",
                    border: `1.5px solid ${on ? m.hue : "var(--line)"}`,
                    transition: "all .14s",
                    transform: on ? "translateY(-2px)" : "none",
                    boxShadow: on ? "var(--shadow-sm)" : "none",
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            <input
              type="checkbox"
              checked={useReason}
              onChange={(e) => setUseReason(e.target.checked)}
              style={{ width: 17, height: 17, accentColor: "var(--accent)" }}
            />
            Add a reason
          </label>
          {useReason && (
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. traffic at exit"
              style={{
                width: "100%",
                marginTop: 10,
                padding: "12px 14px",
                fontSize: 14,
                background: "var(--surface-2)",
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--line)",
                outline: "none",
                color: "var(--ink)",
              }}
            />
          )}
        </div>
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
        disabled={!canSubmit}
        style={{
          width: "100%",
          marginTop: 18,
          background: saved ? "var(--good)" : "var(--ink)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 15,
          padding: "15px",
          borderRadius: "var(--radius-sm)",
          opacity: canSubmit ? 1 : 0.6,
          transition: "background .2s, opacity .15s",
        }}
      >
        {saved
          ? "✓ Saved"
          : submitting
            ? "Saving…"
            : existingTimed
              ? "Update check-in"
              : "Save check-in"}
      </button>
    </form>
  );
}

function TimePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label style={{ flex: 1, display: "block" }}>
      <span
        style={{
          display: "block",
          fontSize: 12.5,
          fontWeight: 600,
          color: "var(--ink-2)",
          marginBottom: 7,
        }}
      >
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "14px 14px",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "var(--mono)",
          color: "var(--ink)",
          background: "var(--surface-2)",
          borderRadius: "var(--radius-sm)",
          border: "1.5px solid var(--line)",
          outline: "none",
          accentColor: "var(--accent)",
        }}
      />
    </label>
  );
}

function Chip({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "neutral" | "good" | "late";
}) {
  const map = {
    neutral: { bg: "var(--surface-2)", fg: "var(--ink-2)", bd: "var(--line)" },
    good: { bg: "var(--good-soft)", fg: "oklch(0.42 0.10 158)", bd: "transparent" },
    late: { bg: "var(--late-soft)", fg: "oklch(0.48 0.16 22)", bd: "transparent" },
  }[tone];
  return (
    <span
      style={{
        background: map.bg,
        color: map.fg,
        border: `1px solid ${map.bd}`,
        padding: "5px 11px",
        borderRadius: 99,
        fontSize: 12.5,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
