"use client";

export type Metric = "gate" | "desk";

type Props = {
  value: Metric;
  onChange: (m: Metric) => void;
};

export function MetricToggle({ value, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Show arrival at gate or desk"
      style={{
        display: "inline-flex",
        padding: 3,
        background: "var(--surface-2)",
        borderRadius: 99,
        border: "1px solid var(--line)",
      }}
    >
      <Tab active={value === "gate"} onClick={() => onChange("gate")} label="Gate" />
      <Tab active={value === "desk"} onClick={() => onChange("desk")} label="Desk" />
    </div>
  );
}

function Tab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        padding: "5px 14px",
        borderRadius: 99,
        fontSize: 12.5,
        fontWeight: 700,
        background: active ? "var(--surface)" : "transparent",
        color: active ? "var(--ink)" : "var(--muted)",
        boxShadow: active ? "var(--shadow-sm)" : "none",
        transition: "background .14s, color .14s",
      }}
    >
      {label}
    </button>
  );
}
