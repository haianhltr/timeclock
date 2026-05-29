"use client";

import { fmt } from "@/lib/dates";
import { useMeasure } from "@/lib/hooks/useMeasure";
import type { WeekdayBucket } from "@/lib/metrics";

type Props = {
  byWd: WeekdayBucket[];
  target: number;
};

export function WeekdayChart({ byWd, target }: Props) {
  const [ref, w] = useMeasure();
  const H = 200;
  const padL = 8;
  const padR = 8;
  const padT = 24;
  const padB = 30;

  const rows = byWd.filter((d): d is WeekdayBucket & { avg: number } => d.avg != null);
  if (rows.length === 0) {
    return (
      <div
        style={{ color: "var(--muted)", fontSize: 13.5, padding: "20px 0" }}
      >
        Not enough data yet.
      </div>
    );
  }

  const innerW = Math.max(10, w - padL - padR);
  const innerH = H - padT - padB;
  const lo = Math.min(target, ...rows.map((r) => r.avg)) - 3;
  const hi = Math.max(target, ...rows.map((r) => r.avg)) + 3;
  const bw = innerW / rows.length;
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo)) * innerH;
  const ty = y(target);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {w > 0 && (
        <svg
          width={w}
          height={H}
          style={{ display: "block", overflow: "visible" }}
        >
          <line
            x1={padL}
            x2={w - padR}
            y1={ty}
            y2={ty}
            stroke="var(--late)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />
          {rows.map((d, i) => {
            const top = y(d.avg);
            const bx = padL + i * bw + bw * 0.2;
            const bwi = bw * 0.6;
            const late = d.avg > target;
            return (
              <g key={d.day}>
                <rect
                  x={bx}
                  y={top}
                  width={bwi}
                  height={padT + innerH - top}
                  rx="8"
                  fill={late ? "var(--late-soft)" : "var(--accent)"}
                  opacity={late ? 1 : 0.9}
                  style={{
                    transformOrigin: `${bx}px ${padT + innerH}px`,
                    animation: `growUp .6s cubic-bezier(.2,.8,.2,1) ${i * 0.06}s both`,
                  }}
                />
                <text
                  x={bx + bwi / 2}
                  y={top - 7}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="700"
                  fill={late ? "var(--late)" : "var(--ink)"}
                  className="mono"
                >
                  {fmt(d.avg)}
                </text>
                <text
                  x={bx + bwi / 2}
                  y={H - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="var(--ink-2)"
                >
                  {d.day}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
