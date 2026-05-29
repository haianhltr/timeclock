"use client";

import { fmt } from "@/lib/dates";
import { useEntries } from "@/lib/hooks/useEntries";
import { computeMetrics, TARGET_DEFAULT } from "@/lib/metrics";
import { OnTimeRing } from "./charts/OnTimeRing";
import { WeekdayChart } from "./charts/WeekdayChart";

export function Insights() {
  const { data: entries } = useEntries();
  if (!entries) return null;
  const m = computeMetrics(entries, TARGET_DEFAULT);
  if (m.withDur.length === 0) return null;

  return (
    <section
      style={{
        marginTop: 32,
        animation: "fadeUp .45s ease both",
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <h2
          style={{
            margin: "0 0 4px",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "-.02em",
          }}
        >
          Your patterns
        </h2>
        <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 13 }}>
          {m.withDur.length} check-ins · {m.lateCount} late{" "}
          {m.lateCount === 1 ? "morning" : "mornings"}
        </p>
      </div>

      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--line-soft)",
          padding: 22,
          display: "flex",
          alignItems: "center",
          gap: 26,
          flexWrap: "wrap",
        }}
      >
        <OnTimeRing pct={m.onTimePct} size={120} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, auto)",
            gap: "18px 28px",
            flex: 1,
            minWidth: 200,
          }}
        >
          <Stat label="Current streak" value={`${m.curStreak}`} unit="days" />
          <Stat label="Best streak" value={`${m.best}`} unit="days" />
          <Stat label="Avg at desk" value={fmt(m.avgDesk)} unit="" />
          <Stat label="Avg walk" value={`${m.avgDur}`} unit="min" />
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          boxShadow: "var(--shadow)",
          border: "1px solid var(--line-soft)",
          padding: 22,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 14.5,
              fontWeight: 700,
            }}
          >
            Average arrival by weekday
          </h3>
          <div
            style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}
          >
            Bars above the dashed line mean late · target {fmt(m.target)}
          </div>
        </div>
        <WeekdayChart byWd={m.byWd} target={m.target} />
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: "var(--muted)",
          marginBottom: 4,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div
        className="tnum"
        style={{
          fontFamily: "var(--mono)",
          fontSize: 24,
          fontWeight: 800,
          color: "var(--ink)",
          lineHeight: 1,
        }}
      >
        {value}
        {unit && (
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              opacity: 0.6,
              marginLeft: 3,
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
