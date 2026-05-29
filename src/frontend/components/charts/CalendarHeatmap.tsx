"use client";

import { useMemo, useState } from "react";
import { fmt } from "@/lib/dates";
import type { SerializedEntry } from "@/lib/api/types";
import { MetricToggle, type Metric } from "./MetricToggle";

const MO_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type CellTone = "good" | "accent" | "late" | "note";

function entryTone(
  e: SerializedEntry | undefined,
  target: number,
  metric: Metric
): CellTone | null {
  if (!e) return null;
  if (e.type === "NOTE") return "note";
  const v = metric === "gate" ? e.gate : e.desk;
  if (v == null) return "note";
  if (v <= target - 5) return "good";
  if (v <= target) return "accent";
  return "late";
}

const TONE_BG: Record<CellTone, string> = {
  good: "var(--good)",
  accent: "var(--accent)",
  late: "var(--late)",
  note: "var(--amber-soft)",
};

type Props = {
  entries: SerializedEntry[];
  targetDesk: number;
  targetGate: number;
};

export function CalendarHeatmap({ entries, targetDesk, targetGate }: Props) {
  const [metric, setMetric] = useState<Metric>("gate");
  const target = metric === "gate" ? targetGate : targetDesk;

  const byDate = useMemo(
    () => Object.fromEntries(entries.map((e) => [e.date, e])),
    [entries]
  );
  const months = useMemo(() => {
    const set = new Set(entries.map((e) => e.date.slice(0, 7)));
    return [...set].sort();
  }, [entries]);

  const [ym, setYm] = useState<string>(() => {
    if (months.length === 0) {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    }
    return months[months.length - 1];
  });

  const idx = months.indexOf(ym);
  const [year, monthNum] = ym.split("-").map(Number);
  const first = new Date(year, monthNum - 1, 1);
  const startDow = first.getDay();
  const days = new Date(year, monthNum, 0).getDate();

  const cells: (string | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) {
    cells.push(`${ym}-${String(d).padStart(2, "0")}`);
  }

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <MetricToggle value={metric} onChange={setMetric} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <button
          type="button"
          disabled={idx <= 0}
          onClick={() => setYm(months[idx - 1])}
          style={{
            opacity: idx <= 0 ? 0.3 : 1,
            fontSize: 18,
            color: "var(--ink-2)",
            padding: "2px 8px",
          }}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>
          {MO_FULL[monthNum - 1]} {year}
        </div>
        <button
          type="button"
          disabled={idx >= months.length - 1 || idx === -1}
          onClick={() => setYm(months[idx + 1])}
          style={{
            opacity: idx >= months.length - 1 || idx === -1 ? 0.3 : 1,
            fontSize: 18,
            color: "var(--ink-2)",
            padding: "2px 8px",
          }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 6,
        }}
      >
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              fontSize: 10.5,
              fontWeight: 700,
              color: "var(--muted)",
              paddingBottom: 2,
            }}
          >
            {d}
          </div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={`pad-${i}`} />;
          const e = byDate[iso];
          const tone = entryTone(e, target, metric);
          const isFilled = tone === "good" || tone === "accent" || tone === "late";
          const isNote = tone === "note";
          const dnum = Number(iso.slice(-2));

          let title: string = iso;
          if (e) {
            if (e.type === "NOTE") {
              title = `${iso} · ${e.note ?? "note"}`;
            } else {
              const v = metric === "gate" ? e.gate : e.desk;
              if (v != null) title = `${iso} · ${metric} ${fmt(v)}`;
            }
          }

          return (
            <div
              key={iso}
              title={title}
              style={{
                aspectRatio: "1",
                borderRadius: 9,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11.5,
                fontWeight: 600,
                background: tone ? TONE_BG[tone] : "var(--surface-2)",
                color: isFilled
                  ? "#fff"
                  : isNote
                    ? "var(--accent-ink)"
                    : "var(--muted)",
                border: isFilled
                  ? "none"
                  : isNote
                    ? "1px dashed var(--amber)"
                    : "1px solid var(--line-soft)",
              }}
            >
              {dnum}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 14,
          flexWrap: "wrap",
          fontSize: 11.5,
          color: "var(--ink-2)",
        }}
      >
        <Legend bg="var(--good)" label="early" />
        <Legend bg="var(--accent)" label="on time" />
        <Legend bg="var(--late)" label="late" />
        <Legend bg="var(--amber)" label="note" />
      </div>
    </div>
  );
}

function Legend({ bg, label }: { bg: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{ width: 11, height: 11, borderRadius: 4, background: bg }}
      />
      {label}
    </span>
  );
}
