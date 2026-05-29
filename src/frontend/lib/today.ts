// User's "today" in their local timezone, formatted as YYYY-MM-DD.
// Local (not UTC) because the admin records their morning where they live,
// not where the server is.
export function todayIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
