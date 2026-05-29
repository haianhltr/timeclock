import type { SerializedEntry } from "./api/types";

export const TARGET_DEFAULT = 485; // 8:05

const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WD_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

export type TimedEntry = SerializedEntry & {
  type: "TIMED";
  gate: number;
  desk: number;
};

export type EntryWithDur = TimedEntry & { dur: number; late: boolean };

export type WeekdayBucket = {
  day: string;
  full: string;
  avg: number | null;
  lateN: number;
  n: number;
};

export type ReasonBucket = { reason: string; n: number };

export type Metrics = {
  target: number;
  withDur: EntryWithDur[];
  onTimeCount: number;
  lateCount: number;
  onTimePct: number;
  reasonDays: number;
  avgDur: number;
  avgDesk: number;
  avgGate: number;
  curStreak: number;
  best: number;
  byWd: WeekdayBucket[];
  reasons: ReasonBucket[];
};

function isTimed(e: SerializedEntry): e is TimedEntry {
  return e.type === "TIMED" && e.gate != null && e.desk != null;
}

export function computeMetrics(
  entries: SerializedEntry[],
  target: number = TARGET_DEFAULT
): Metrics {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const withDur: EntryWithDur[] = sorted
    .filter(isTimed)
    .map((e) => ({ ...e, dur: e.desk - e.gate, late: e.desk > target }));

  const n = withDur.length;
  const onTimeCount = withDur.filter((e) => !e.late).length;
  const lateCount = n - onTimeCount;
  const onTimePct = n ? Math.round((onTimeCount / n) * 100) : 0;
  const avgDur = n ? Math.round(withDur.reduce((a, e) => a + e.dur, 0) / n) : 0;
  const avgDesk = n ? Math.round(withDur.reduce((a, e) => a + e.desk, 0) / n) : 0;
  const avgGate = n ? Math.round(withDur.reduce((a, e) => a + e.gate, 0) / n) : 0;
  const reasonDays = withDur.filter((e) => e.reason).length;

  // Current streak: on-time days, counting back from newest.
  let curStreak = 0;
  for (let i = withDur.length - 1; i >= 0; i--) {
    if (!withDur[i].late) curStreak++;
    else break;
  }
  // Best streak.
  let best = 0;
  let run = 0;
  for (const e of withDur) {
    if (!e.late) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }

  // Avg arrival per weekday (Mon-Fri only — matches prototype).
  const byWd: WeekdayBucket[] = [1, 2, 3, 4, 5].map((d) => {
    const rows = withDur.filter(
      (e) => new Date(e.date + "T00:00:00").getDay() === d
    );
    const avg = rows.length
      ? Math.round(rows.reduce((a, e) => a + e.desk, 0) / rows.length)
      : null;
    const lateN = rows.filter((e) => e.late).length;
    return { day: WD[d], full: WD_FULL[d], avg, lateN, n: rows.length };
  });

  const reasonMap: Record<string, number> = {};
  for (const e of withDur) {
    if (e.reason) reasonMap[e.reason] = (reasonMap[e.reason] || 0) + 1;
  }
  const reasons: ReasonBucket[] = Object.entries(reasonMap)
    .map(([reason, count]) => ({ reason, n: count }))
    .sort((a, b) => b.n - a.n);

  return {
    target,
    withDur,
    onTimeCount,
    lateCount,
    onTimePct,
    reasonDays,
    avgDur,
    avgDesk,
    avgGate,
    curStreak,
    best,
    byWd,
    reasons,
  };
}
