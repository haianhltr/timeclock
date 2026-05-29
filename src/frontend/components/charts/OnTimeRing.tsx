"use client";

import { useEffect, useState } from "react";

type Props = {
  pct: number;
  size?: number;
};

export function OnTimeRing({ pct, size = 132 }: Props) {
  const r = (size - 22) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;

  // Animate from 0 → pct on mount/change.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <svg width={size} height={size} aria-label={`${pct}% on time`}>
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="var(--line)"
        strokeWidth="11"
      />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - shown / 100)}
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{
          transition: "stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)",
        }}
      />
      <text
        x={cx}
        y={cx - 2}
        textAnchor="middle"
        fontSize="28"
        fontWeight="800"
        fill="var(--ink)"
        className="tnum"
      >
        {pct}
        <tspan fontSize="15">%</tspan>
      </text>
      <text
        x={cx}
        y={cx + 18}
        textAnchor="middle"
        fontSize="11.5"
        fill="var(--muted)"
        fontWeight="600"
      >
        on time
      </text>
    </svg>
  );
}
