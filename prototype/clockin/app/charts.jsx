// ===== clockin charts: hand-rolled responsive SVG =====
const { useRef, useState, useEffect, useLayoutEffect } = React;

// measure container width so SVG text stays crisp (no viewBox scaling)
function useMeasure() {
  const ref = useRef(null);
  const [w, setW] = useState(0);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(es => setW(es[0].contentRect.width));
    ro.observe(ref.current);
    setW(ref.current.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

const css = getComputedStyle(document.documentElement);
function tok(name, fallback) { const v = css.getPropertyValue(name).trim(); return v || fallback; }

// smooth path through points (catmull-rom -> bezier)
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

// ---------- Arrival trend (desk time over time) ----------
function TrendChart({ data, target, accent }) {
  const [ref, w] = useMeasure();
  const H = 230, padL = 44, padR = 14, padT = 16, padB = 28;
  const rows = data.slice(-30);
  const innerW = Math.max(10, w - padL - padR), innerH = H - padT - padB;
  const lo = Math.min(target, ...rows.map(r => r.desk)) - 4;
  const hi = Math.max(target, ...rows.map(r => r.desk)) + 4;
  const x = i => padL + (rows.length <= 1 ? innerW / 2 : (i / (rows.length - 1)) * innerW);
  const y = v => padT + (1 - (v - lo) / (hi - lo)) * innerH;
  const pts = rows.map((r, i) => ({ x: x(i), y: y(r.desk), r }));
  const line = smoothPath(pts);
  const area = line + ` L ${x(rows.length - 1)} ${padT + innerH} L ${x(0)} ${padT + innerH} Z`;
  const ty = y(target);
  const ticks = [lo + 4, Math.round((lo + hi) / 2), hi - 4];
  const [hover, setHover] = useState(null);

  return (
    <div ref={ref} style={{ width: '100%', position: 'relative' }}>
      {w > 0 && <svg width={w} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke={tok('--line-soft')} strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill={tok('--muted')} className="mono">{fmt(t)}</text>
          </g>
        ))}
        {/* target band */}
        <line x1={padL} x2={w - padR} y1={ty} y2={ty} stroke={tok('--late')} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
        <text x={w - padR} y={ty - 6} textAnchor="end" fontSize="10.5" fill={tok('--late')} fontWeight="600">target {fmt(target)}</text>
        <path d={area} fill="url(#trendFill)" />
        <path d={line} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round"
          style={{ ['--len']: '1400', strokeDasharray: 1400, animation: 'drawIn 1.1s ease forwards' }} />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 5 : 2.6}
            fill={p.r.late ? tok('--late') : accent} stroke="#fff" strokeWidth={hover === i ? 2 : 1}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer', transition: 'r .12s' }} />
        ))}
        {hover != null && (
          <g pointerEvents="none">
            <line x1={pts[hover].x} x2={pts[hover].x} y1={padT} y2={padT + innerH} stroke={tok('--ink-2')} strokeWidth="1" opacity="0.25" />
          </g>
        )}
      </svg>}
      {hover != null && (
        <div className="mono" style={{
          position: 'absolute', left: Math.min(Math.max(pts[hover].x - 50, 0), w - 110), top: pts[hover].y - 52,
          background: tok('--ink'), color: '#fff', padding: '6px 9px', borderRadius: 10, fontSize: 11.5,
          whiteSpace: 'nowrap', pointerEvents: 'none', boxShadow: 'var(--shadow)',
        }}>
          {prettyDate(rows[hover].date).replace(/,.*/, '')} · desk {fmt(rows[hover].desk)}
        </div>
      )}
    </div>
  );
}

// ---------- Gate→desk duration (bars) ----------
function DurationChart({ data, accent }) {
  const [ref, w] = useMeasure();
  const H = 180, padL = 30, padR = 8, padT = 12, padB = 22;
  const rows = data.slice(-22);
  const innerW = Math.max(10, w - padL - padR), innerH = H - padT - padB;
  const hi = Math.max(...rows.map(r => r.dur)) + 1;
  const bw = innerW / rows.length;
  const avg = rows.reduce((a, r) => a + r.dur, 0) / rows.length;
  const ay = padT + (1 - avg / hi) * innerH;
  return (
    <div ref={ref} style={{ width: '100%' }}>
      {w > 0 && <svg width={w} height={H} style={{ display: 'block', overflow: 'visible' }}>
        {[0, Math.round(hi / 2), Math.round(hi)].map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={w - padR} y1={padT + (1 - t / hi) * innerH} y2={padT + (1 - t / hi) * innerH} stroke={tok('--line-soft')} />
            <text x={padL - 6} y={padT + (1 - t / hi) * innerH + 4} textAnchor="end" fontSize="10.5" fill={tok('--muted')} className="mono">{t}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const h = (r.dur / hi) * innerH;
          const bx = padL + i * bw + bw * 0.18;
          return <rect key={i} x={bx} y={padT + innerH - h} width={bw * 0.64} height={h} rx="3.5"
            fill={accent} opacity={0.55 + 0.45 * (r.dur / hi)}
            style={{ transformOrigin: `${bx}px ${padT + innerH}px`, animation: `growUp .6s ease ${i * 0.018}s both` }}>
            <title>{prettyDate(r.date)} · {r.dur} min walk</title>
          </rect>;
        })}
        <line x1={padL} x2={w - padR} y1={ay} y2={ay} stroke={tok('--accent-ink')} strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={w - padR} y={ay - 5} textAnchor="end" fontSize="10.5" fill={tok('--accent-ink')} fontWeight="600">avg {avg.toFixed(1)}m</text>
      </svg>}
    </div>
  );
}

// ---------- Average arrival by weekday ----------
function WeekdayChart({ byWd, target, accent }) {
  const [ref, w] = useMeasure();
  const H = 200, padL = 8, padR = 8, padT = 24, padB = 30;
  const rows = byWd.filter(d => d.avg != null);
  const innerW = Math.max(10, w - padL - padR), innerH = H - padT - padB;
  const lo = Math.min(target, ...rows.map(r => r.avg)) - 3;
  const hi = Math.max(target, ...rows.map(r => r.avg)) + 3;
  const bw = innerW / rows.length;
  const y = v => padT + (1 - (v - lo) / (hi - lo)) * innerH;
  return (
    <div ref={ref} style={{ width: '100%' }}>
      {w > 0 && <svg width={w} height={H} style={{ display: 'block', overflow: 'visible' }}>
        <line x1={padL} x2={w - padR} y1={y(target)} y2={y(target)} stroke={tok('--late')} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
        {rows.map((d, i) => {
          const top = y(d.avg);
          const bx = padL + i * bw + bw * 0.2;
          const bwi = bw * 0.6;
          const late = d.avg > target;
          return (
            <g key={i}>
              <rect x={bx} y={top} width={bwi} height={padT + innerH - top} rx="8"
                fill={late ? tok('--late-soft') : accent} opacity={late ? 1 : 0.9}
                style={{ transformOrigin: `${bx}px ${padT + innerH}px`, animation: `growUp .6s cubic-bezier(.2,.8,.2,1) ${i * 0.06}s both` }} />
              <text x={bx + bwi / 2} y={top - 7} textAnchor="middle" fontSize="11.5" fontWeight="700"
                fill={late ? tok('--late') : tok('--ink')} className="mono">{fmt(d.avg)}</text>
              <text x={bx + bwi / 2} y={H - 10} textAnchor="middle" fontSize="12" fontWeight="600" fill={tok('--ink-2')}>{d.day}</text>
            </g>
          );
        })}
      </svg>}
    </div>
  );
}

// ---------- On-time donut ----------
function OnTimeRing({ pct, accent, size = 132 }) {
  const r = (size - 22) / 2, c = 2 * Math.PI * r, cx = size / 2;
  const [shown, setShown] = useState(0);
  useEffect(() => { const t = setTimeout(() => setShown(pct), 120); return () => clearTimeout(t); }, [pct]);
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={tok('--line')} strokeWidth="11" />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={accent} strokeWidth="11" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)}
        transform={`rotate(-90 ${cx} ${cx})`} style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)' }} />
      <text x={cx} y={cx - 2} textAnchor="middle" fontSize="30" fontWeight="800" fill={tok('--ink')} className="tnum">{pct}<tspan fontSize="15">%</tspan></text>
      <text x={cx} y={cx + 18} textAnchor="middle" fontSize="11.5" fill={tok('--muted')} fontWeight="600">on time</text>
    </svg>
  );
}

// ---------- Reasons breakdown (horizontal bars) ----------
function ReasonsChart({ reasons }) {
  const max = Math.max(...reasons.map(r => r.n), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
      {reasons.slice(0, 6).map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 116, flexShrink: 0, fontSize: 12.5, color: 'var(--ink-2)', textAlign: 'right', lineHeight: 1.2 }}>{r.reason}</div>
          <div style={{ flex: 1, height: 22, background: 'var(--surface-2)', borderRadius: 7, overflow: 'hidden' }}>
            <div style={{ width: `${(r.n / max) * 100}%`, height: '100%', background: 'var(--amber)', borderRadius: 7,
              animation: `growW .7s cubic-bezier(.2,.8,.2,1) ${i * 0.05}s both` }} />
          </div>
          <div className="mono" style={{ width: 18, fontSize: 12.5, fontWeight: 700, color: 'var(--accent-ink)' }}>{r.n}</div>
        </div>
      ))}
    </div>
  );
}

// ---------- Monthly calendar heatmap ----------
function CalendarHeatmap({ data, target, accent }) {
  // most recent month present in data
  const last = data[data.length - 1];
  const [ym, setYm] = useState(() => last.date.slice(0, 7));
  const months = [...new Set(data.map(d => d.date.slice(0, 7)))];
  const idx = months.indexOf(ym);
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const startDow = first.getDay();
  const days = new Date(y, m, 0).getDate();
  const byDate = Object.fromEntries(data.map(d => [d.date, d]));
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(`${ym}-${String(d).padStart(2, '0')}`);

  function color(iso) {
    const e = byDate[iso];
    if (!e) return null;
    if (e.type === 'note' || e.desk == null) return 'note';
    if (e.desk <= target - 5) return tok('--good');
    if (e.desk <= target) return accent;
    return tok('--late');
  }
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <button disabled={idx <= 0} onClick={() => setYm(months[idx - 1])}
          style={{ opacity: idx <= 0 ? 0.3 : 1, fontSize: 18, color: 'var(--ink-2)', padding: '2px 8px' }}>‹</button>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{MO_FULL[m - 1]} {y}</div>
        <button disabled={idx >= months.length - 1} onClick={() => setYm(months[idx + 1])}
          style={{ opacity: idx >= months.length - 1 ? 0.3 : 1, fontSize: 18, color: 'var(--ink-2)', padding: '2px 8px' }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', paddingBottom: 2 }}>{d}</div>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <div key={i} />;
          const e = byDate[iso];
          const c = color(iso);
          const isNote = c === 'note';
          const bg = isNote ? null : c;
          const dnum = Number(iso.slice(-2));
          return (
            <div key={i} title={e ? (isNote ? `${prettyDate(iso)} · ${e.note}` : `${prettyDate(iso)} · desk ${fmt(e.desk)}`) : prettyDate(iso)}
              style={{
                aspectRatio: '1', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11.5, fontWeight: 600, position: 'relative',
                background: bg || (isNote ? 'var(--amber-soft)' : 'var(--surface-2)'),
                color: bg ? '#fff' : (isNote ? 'var(--accent-ink)' : 'var(--muted)'),
                border: bg ? 'none' : (isNote ? '1px dashed var(--amber)' : '1px solid var(--line-soft)'),
                boxShadow: bg ? 'inset 0 0 0 1px rgba(255,255,255,.12)' : 'none',
                animation: `pop .4s ease ${i * 0.004}s both`,
              }}>
              {dnum}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap', fontSize: 11.5, color: 'var(--ink-2)' }}>
        <Legend c={tok('--good')} t="early" />
        <Legend c={accent} t="on time" />
        <Legend c={tok('--late')} t="late" />
        <Legend c={tok('--amber')} t="note" />
      </div>
    </div>
  );
}
function Legend({ c, t }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
    <span style={{ width: 11, height: 11, borderRadius: 4, background: c }} />{t}</span>;
}

Object.assign(window, { useMeasure, TrendChart, DurationChart, WeekdayChart, OnTimeRing, ReasonsChart, CalendarHeatmap });
