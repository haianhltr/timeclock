// ===== clockin data engine: mock entries + metric helpers =====

// ---- time helpers ----
function toMin(t) { // "8:04" -> minutes since midnight
  if (t == null) return null;
  const [h, m] = String(t).split(':').map(Number);
  return h * 60 + m;
}
function fmt(min) { // 484 -> "8:04"
  if (min == null) return '--:--';
  const h = Math.floor(min / 60), m = min % 60;
  return h + ':' + String(m).padStart(2, '0');
}
function fmt2(min) { // 484 -> "08:04" for inputs
  if (min == null) return '';
  const h = Math.floor(min / 60), m = min % 60;
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WD_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MO_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isoDate(d) { return d.toISOString().slice(0, 10); }
function prettyDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return WD_FULL[d.getDay()] + ', ' + MO[d.getMonth()] + ' ' + d.getDate();
}

// ---- mock generator: weekdays going back from a fixed "today" ----
const REASONS = [
  'traffic at exit', 'accident on 21st', 'slow elevator', 'badge reader was down',
  'dropped kids at school', 'rain — packed roads', 'long coffee line in lobby',
  'train was delayed', 'parking garage full', 'roadwork on Main',
];
function seededRand(seed) { // deterministic so graphs are stable across reloads
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

// ---- real check-in log (parsed from messages to Scott) ----
// times are minutes-since-midnight. single-time entries set gate == desk.
const REAL_ENTRIES = [
  { date: '2026-05-07', gate: 480, desk: 485, reason: null },
  { date: '2026-05-08', gate: 478, desk: 482, reason: null },
  { date: '2026-05-11', gate: 480, desk: 480, reason: null },
  { date: '2026-05-12', gate: 480, desk: 485, reason: 'traffic at 235 exit' },
  { date: '2026-05-13', gate: 477, desk: 480, reason: null },
  { date: '2026-05-14', gate: 495, desk: 495, reason: 'traffic at exit 254 — took 20 min', leftHome: 450 },
  { date: '2026-05-15', gate: 475, desk: 480, reason: null },
  { date: '2026-05-18', gate: 480, desk: 485, reason: 'traffic at exit' },
  { date: '2026-05-19', type: 'note', note: '6:30am team meeting (3–4 hrs) — heading to the office after.' },
  { date: '2026-05-27', gate: 478, desk: 482, reason: null },
  { date: '2026-05-28', gate: 480, desk: 484, reason: 'accident on 21st' },
  { date: '2026-05-29', gate: 478, desk: 484, reason: null },
];

function generateEntries() {
  return [...REAL_ENTRIES].sort((a, b) => a.date.localeCompare(b.date));
}

// ---- metrics ----
const TARGET_DEFAULT = 485; // 8:05

function computeMetrics(entries, target) {
  target = target == null ? TARGET_DEFAULT : target;
  const valid = entries.filter(e => e.type !== 'note' && e.gate != null && e.desk != null);
  const withDur = valid.map(e => ({ ...e, dur: e.desk - e.gate, late: e.desk > target }));

  const onTimeCount = withDur.filter(e => !e.late).length;
  const lateCount = withDur.length - onTimeCount;
  const onTimePct = withDur.length ? Math.round((onTimeCount / withDur.length) * 100) : 0;
  const avgDur = Math.round(withDur.reduce((a, e) => a + e.dur, 0) / withDur.length);
  const avgDesk = Math.round(withDur.reduce((a, e) => a + e.desk, 0) / withDur.length);
  const avgGate = Math.round(withDur.reduce((a, e) => a + e.gate, 0) / withDur.length);
  const reasonDays = withDur.filter(e => e.reason).length;

  // current streak (on-time days, counting back from newest)
  let curStreak = 0;
  for (let i = withDur.length - 1; i >= 0; i--) {
    if (!withDur[i].late) curStreak++; else break;
  }
  // best streak
  let best = 0, run = 0;
  for (const e of withDur) { if (!e.late) { run++; best = Math.max(best, run); } else run = 0; }

  // by weekday (Mon-Fri)
  const byWd = [1, 2, 3, 4, 5].map(d => {
    const rows = withDur.filter(e => new Date(e.date + 'T00:00:00').getDay() === d);
    const avg = rows.length ? Math.round(rows.reduce((a, e) => a + e.desk, 0) / rows.length) : null;
    const lateN = rows.filter(e => e.late).length;
    return { day: WD[d], full: WD_FULL[d], avg, lateN, n: rows.length };
  });

  // reasons breakdown
  const reasonMap = {};
  withDur.forEach(e => { if (e.reason) reasonMap[e.reason] = (reasonMap[e.reason] || 0) + 1; });
  const reasons = Object.entries(reasonMap).map(([k, v]) => ({ reason: k, n: v })).sort((a, b) => b.n - a.n);

  return {
    target, withDur, onTimeCount, lateCount, onTimePct, reasonDays,
    avgDur, avgDesk, avgGate, curStreak, best, byWd, reasons,
  };
}

// build the live "message to boss" string
function buildMessage(boss, gate, desk, reason) {
  let s = 'Good morning ' + (boss || 'Scott') + ', quick check-in for today.';
  s += ' Time to gate: ' + (gate || '—') + ', time to desk: ' + (desk || '—') + '.';
  if (reason) s += ' Reason: ' + reason + '.';
  return s;
}

Object.assign(window, {
  toMin, fmt, fmt2, WD, WD_FULL, MO, MO_FULL, isoDate, prettyDate,
  generateEntries, computeMetrics, buildMessage, REASONS, TARGET_DEFAULT,
});
