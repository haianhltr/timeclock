"use client";

import { useState } from "react";
import { fmt } from "@/lib/dates";
import { useEntries } from "@/lib/hooks/useEntries";
import { computeMetrics, type Metric } from "@/lib/metrics";
import { CalendarHeatmap } from "./charts/CalendarHeatmap";
import { DurationChart } from "./charts/DurationChart";
import { MetricToggle } from "./charts/MetricToggle";
import { OnTimeRing } from "./charts/OnTimeRing";
import { ReasonsChart } from "./charts/ReasonsChart";
import { TrendChart } from "./charts/TrendChart";
import { WeekdayChart } from "./charts/WeekdayChart";

type Props = {
  targetDesk: number;
  targetGate: number;
};

export function Insights({ targetDesk, targetGate }: Props) {
  const [metric, setMetric] = useState<Metric>("gate");
  const target = metric === "gate" ? targetGate : targetDesk;
  const { data: entries, isLoading } = useEntries();

  if (isLoading) return null;
  const m = computeMetrics(entries ?? [], target, metric);
  const empty = m.withDur.length === 0;

  return (
    <section style={{ animation: "fadeUp .45s ease both" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 14,
          flexWrap: "wrap",
        }}
      >
        <p style={{ margin: 0, color: "var(--ink-2)", fontSize: 13 }}>
          {empty
            ? "—"
            : `${m.withDur.length} check-ins · ${m.lateCount} late ${
                m.lateCount === 1 ? "morning" : "mornings"
              } at ${metric}`}
        </p>
        <MetricToggle value={metric} onChange={setMetric} />
      </div>

      {empty ? (
        <div
          style={{
            padding: "44px 28px",
            background: "var(--surface)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-sm)",
            border: "1px dashed var(--line)",
            color: "var(--muted)",
            textAlign: "center",
            fontSize: 14,
          }}
        >
          No check-ins yet. The dashboard fills in once you log one.
        </div>
      ) : (
        <>
          {/* Hero */}
          <Card>
            <div
              style={{
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
                <Stat
                  label={metric === "gate" ? "Avg at gate" : "Avg at desk"}
                  value={fmt(metric === "gate" ? m.avgGate : m.avgDesk)}
                  unit=""
                />
                <Stat label="Avg walk" value={`${m.avgDur}`} unit="min" />
              </div>
            </div>
          </Card>

          {/* Trend (wide) */}
          <Card
            title="Arrival trend"
            sub={`When you arrived, last ${Math.min(30, m.withDur.length)} days`}
          >
            <TrendChart data={m.withDur} target={target} metric={metric} />
          </Card>

          {/* 2-col responsive grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
              gap: 14,
              marginTop: 14,
            }}
          >
            <Card
              title={
                metric === "gate"
                  ? "Average arrival by weekday (gate)"
                  : "Average arrival by weekday (desk)"
              }
              sub={`Bars above the dashed line mean late · target ${fmt(target)}`}
            >
              <WeekdayChart byWd={m.byWd} target={target} />
            </Card>
            <Card title="Gate → desk walk" sub="Minutes from badge-in to seated">
              <DurationChart data={m.withDur} />
            </Card>
            <Card
              title="What slowed you down"
              sub={
                m.reasonDays
                  ? `${m.reasonDays} ${m.reasonDays === 1 ? "morning" : "mornings"} with a note`
                  : "No reasons logged"
              }
              rightOfTitle={
                <span
                  className="tnum"
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "var(--accent-ink)",
                  }}
                >
                  {m.reasonDays}
                </span>
              }
            >
              <ReasonsChart reasons={m.reasons} />
            </Card>
            <Card title="Monthly view" sub="Each day coloured by arrival">
              <CalendarHeatmap
                entries={entries ?? []}
                target={target}
                metric={metric}
              />
            </Card>
          </div>
        </>
      )}
    </section>
  );
}

function Card({
  title,
  sub,
  rightOfTitle,
  children,
}: {
  title?: string;
  sub?: string;
  rightOfTitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        border: "1px solid var(--line-soft)",
        padding: 20,
        marginTop: title || sub ? 14 : 0,
      }}
    >
      {(title || sub) && (
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div>
            {title && (
              <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700 }}>
                {title}
              </h3>
            )}
            {sub && (
              <div
                style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}
              >
                {sub}
              </div>
            )}
          </div>
          {rightOfTitle}
        </div>
      )}
      {children}
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
