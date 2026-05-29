"use client";

import { useState } from "react";
import { fmt } from "@/lib/dates";
import { smoothPath } from "@/lib/charts/path";
import { useMeasure } from "@/lib/hooks/useMeasure";
import type { EntryWithDur, Metric } from "@/lib/metrics";

const MO = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function shortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${MO[d.getMonth()]} ${d.getDate()}`;
}

type Props = {
  data: EntryWithDur[];
  target: number;
  metric: Metric;
};

export function TrendChart({ data, target, metric }: Props) {
  const [ref, w] = useMeasure();
  const [hover, setHover] = useState<number | null>(null);

  const H = 220;
  const padL = 44;
  const padR = 14;
  const padT = 16;
  const padB = 26;
  const rows = data.slice(-30);

  if (rows.length === 0) {
    return (
      <div style={{ color: "var(--muted)", fontSize: 13.5, padding: "20px 0" }}>
        Not enough data yet.
      </div>
    );
  }

  const innerW = Math.max(10, w - padL - padR);
  const innerH = H - padT - padB;
  const values = rows.map((r) => r.value);
  const lo = Math.min(target, ...values) - 4;
  const hi = Math.max(target, ...values) + 4;
  const x = (i: number) =>
    padL +
    (rows.length <= 1 ? innerW / 2 : (i / (rows.length - 1)) * innerW);
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * innerH;
  const pts = rows.map((r, i) => ({ x: x(i), y: y(r.value), r }));
  const line = smoothPath(pts);
  const area =
    line +
    ` L ${x(rows.length - 1)} ${padT + innerH} L ${x(0)} ${padT + innerH} Z`;
  const ty = y(target);
  const ticks = [lo + 4, Math.round((lo + hi) / 2), hi - 4];

  return (
    <div ref={ref} style={{ width: "100%", position: "relative" }}>
      {w > 0 && (
        <svg
          width={w}
          height={H}
          style={{ display: "block", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={padL}
                x2={w - padR}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--line-soft)"
                strokeWidth="1"
              />
              <text
                x={padL - 8}
                y={y(t) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--muted)"
                className="mono"
              >
                {fmt(t)}
              </text>
            </g>
          ))}
          <line
            x1={padL}
            x2={w - padR}
            y1={ty}
            y2={ty}
            stroke="var(--late)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <text
            x={w - padR}
            y={ty - 6}
            textAnchor="end"
            fontSize="10.5"
            fill="var(--late)"
            fontWeight="600"
          >
            target {fmt(target)}
          </text>
          <path d={area} fill="url(#trendFill)" />
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {pts.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hover === i ? 5 : 2.8}
              fill={p.r.late ? "var(--late)" : "var(--accent)"}
              stroke="var(--surface)"
              strokeWidth={hover === i ? 2 : 1}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer", transition: "r .12s" }}
            />
          ))}
          {hover != null && (
            <line
              x1={pts[hover].x}
              x2={pts[hover].x}
              y1={padT}
              y2={padT + innerH}
              stroke="var(--ink-2)"
              strokeWidth="1"
              opacity="0.25"
              pointerEvents="none"
            />
          )}
        </svg>
      )}
      {hover != null && w > 0 && (
        <div
          className="mono"
          style={{
            position: "absolute",
            left: Math.min(Math.max(pts[hover].x - 50, 0), w - 110),
            top: Math.max(pts[hover].y - 48, 0),
            background: "var(--ink)",
            color: "var(--surface)",
            padding: "5px 9px",
            borderRadius: 8,
            fontSize: 11.5,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "var(--shadow)",
          }}
        >
          {shortDate(rows[hover].date)} · {metric} {fmt(rows[hover].value)}
        </div>
      )}
    </div>
  );
}
