export function Logo({ size = 26, color }: { size?: number; color?: string }) {
  const stroke = color || "var(--accent)";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="13" stroke={stroke} strokeWidth="2.4" />
      <path
        d="M16 9.5 V16 L20.5 18.6"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
