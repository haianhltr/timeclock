// "8:04" -> minutes since midnight
export function toMin(t: string | null | undefined): number | null {
  if (t == null) return null;
  const [h, m] = String(t).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

// 484 -> "8:04"
export function fmt(min: number | null | undefined): string {
  if (min == null) return "--:--";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h + ":" + String(m).padStart(2, "0");
}

// 484 -> "08:04" (for <input type="time">)
export function fmt2(min: number | null | undefined): string {
  if (min == null) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}
