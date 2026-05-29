"use client";

import { useMeasure } from "@/lib/hooks/useMeasure";
import type { EntryWithDur } from "@/lib/metrics";

type Props = {
  data: EntryWithDur[];
};

export function DurationChart({ data }: Props) {
  const [ref, w] = useMeasure();
  const H = 170;
  const padL = 30;
  const padR = 8;
  const padT = 12;
  const padB = 22;
  const rows = data.slice(-22);

  if (rows.length === 0) {
    return (
      <div style={{ color: "var(--muted)", fontSize: 13.5, padding: "20px 0" }}>
        Not enough data yet.
      </div>
    );
  }

  const innerW = Math.max(10, w - padL - padR);
  const innerH = H - padT - padB;
  const hi = Math.max(...rows.map((r) => r.dur)) + 1;
  const bw = innerW / rows.length;
  const avg = rows.reduce((a, r) => a + r.dur, 0) / rows.length;
  const ay = padT + (1 - avg / hi) * innerH;
  const ticks = [0, Math.round(hi / 2), Math.round(hi)];

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {w > 0 && (
        <svg
          width={w}
          height={H}
          style={{ display: "block", overflow: "visible" }}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={padL}
                x2={w - padR}
                y1={padT + (1 - t / hi) * innerH}
                y2={padT + (1 - t / hi) * innerH}
                stroke="var(--line-soft)"
              />
              <text
                x={padL - 6}
                y={padT + (1 - t / hi) * innerH + 4}
                textAnchor="end"
                fontSize="10.5"
                fill="var(--muted)"
                className="mono"
              >
                {t}
              </text>
            </g>
          ))}
          {rows.map((r, i) => {
            const h = (r.dur / hi) * innerH;
            const bx = padL + i * bw + bw * 0.18;
            return (
              <rect
                key={r.date}
                x={bx}
                y={padT + innerH - h}
                width={bw * 0.64}
                height={h}
                rx="3.5"
                fill="var(--accent)"
                opacity={0.55 + 0.45 * (r.dur / hi)}
              >
                <title>
                  {r.date} · {r.dur} min walk
                </title>
              </rect>
            );
          })}
          <line
            x1={padL}
            x2={w - padR}
            y1={ay}
            y2={ay}
            stroke="var(--accent-ink)"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <text
            x={w - padR}
            y={ay - 5}
            textAnchor="end"
            fontSize="10.5"
            fill="var(--accent-ink)"
            fontWeight="600"
          >
            avg {avg.toFixed(1)}m
          </text>
        </svg>
      )}
    </div>
  );
}
