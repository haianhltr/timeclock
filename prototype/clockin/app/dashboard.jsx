// ===== clockin insights dashboard =====

// per-style visual config
const DASH_STYLES = {
  soft: {
    card: { background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', border: '1px solid var(--line-soft)', padding: 22 },
    title: { fontSize: 14.5, fontWeight: 700 },
    heroBig: 56,
  },
  editorial: {
    card: { background: 'var(--surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: 'none', padding: 28 },
    title: { fontSize: 17, fontWeight: 800, letterSpacing: '-.01em' },
    heroBig: 88,
  },
  minimal: {
    card: { background: 'var(--surface)', borderRadius: 12, boxShadow: 'none', border: '1px solid var(--line)', padding: 18 },
    title: { fontSize: 13, fontWeight: 700, letterSpacing: '.02em', textTransform: 'uppercase', color: 'var(--ink-2)' },
    heroBig: 46,
  },
};

function SectionCard({ title, sub, children, span, cfg, right }) {
  return (
    <section style={{ ...cfg.card, gridColumn: span ? `span ${span}` : 'auto', display: 'flex', flexDirection: 'column', animation: 'fadeUp .5s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
        <div>
          <h3 style={{ margin: 0, ...cfg.title }}>{title}</h3>
          {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function StatMini({ label, value, unit, tone }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div className="tnum" style={{ fontSize: 24, fontWeight: 800, color: tone || 'var(--ink)', lineHeight: 1, fontFamily: 'var(--mono)' }}>
        {value}<span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)', marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}

function Dashboard({ m, accent, dashStyle, boss, owner, onSignIn }) {
  const cfg = DASH_STYLES[dashStyle] || DASH_STYLES.soft;
  const data = m.withDur;

  // hero block differs per style
  const Hero = (
    <div style={{ ...cfg.card, gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
      ...(dashStyle === 'editorial' ? { background: `linear-gradient(135deg, ${accent} 0%, var(--accent-ink) 100%)`, color: '#fff', border: 'none' } : {}) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, flex: 1, minWidth: 240 }}>
        {dashStyle === 'editorial' ? (
          <div>
            <div className="tnum" style={{ fontSize: cfg.heroBig, fontWeight: 800, lineHeight: 0.95 }}>{m.onTimePct}%</div>
            <div style={{ fontSize: 14, opacity: 0.9, fontWeight: 600, marginTop: 4 }}>on time over {data.length} days</div>
          </div>
        ) : (
          <OnTimeRing pct={m.onTimePct} accent={accent} size={dashStyle === 'minimal' ? 108 : 132} />
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '20px 30px' }}>
          <HeroStat lite={dashStyle === 'editorial'} label="Current streak" value={m.curStreak} unit="days" accent={accent} />
          <HeroStat lite={dashStyle === 'editorial'} label="Best streak" value={m.best} unit="days" accent={accent} />
          <HeroStat lite={dashStyle === 'editorial'} label="Avg at desk" value={fmt(m.avgDesk)} unit="" accent={accent} />
          <HeroStat lite={dashStyle === 'editorial'} label="Avg walk" value={m.avgDur} unit="min" accent={accent} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>Your patterns</h1>
          <p style={{ margin: '4px 0 0', color: 'var(--ink-2)', fontSize: 14 }}>{data.length} check-ins logged · {m.lateCount} late {m.lateCount === 1 ? 'morning' : 'mornings'}</p>
        </div>
        {!owner && <button onClick={onSignIn} style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 'var(--radius-sm)',
          background: 'var(--surface)', border: '1.5px solid var(--accent)', color: 'var(--accent-ink)', fontWeight: 700, fontSize: 13.5,
        }}>+ Log today’s check-in</button>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 16 }} className="dash-grid">
        {Hero}

        <SectionCard cfg={cfg} span={2} title="Arrival trend" sub="When you reached your desk, last 30 days">
          <TrendChart data={data} target={m.target} accent={accent} />
        </SectionCard>

        <SectionCard cfg={cfg} title="Average arrival by weekday" sub="Bars above the dashed line mean late">
          <WeekdayChart byWd={m.byWd} target={m.target} accent={accent} />
        </SectionCard>

        <SectionCard cfg={cfg} title="Gate → desk walk" sub="Minutes from badge-in to seated">
          <DurationChart data={data} accent={accent} />
        </SectionCard>

        <SectionCard cfg={cfg} title="What slowed you down"
          sub={m.reasonDays ? `${m.reasonDays} ${m.reasonDays === 1 ? 'morning' : 'mornings'} with a note` : 'No reasons logged'}
          right={<span className="tnum" style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 800, color: 'var(--accent-ink)' }}>{m.reasonDays}</span>}>
          {m.reasons.length ? <ReasonsChart reasons={m.reasons} />
            : <div style={{ color: 'var(--muted)', fontSize: 13.5, padding: '20px 0' }}>Clean record — no reasons on file.</div>}
        </SectionCard>

        <SectionCard cfg={cfg} title="Monthly view" sub="Each day coloured by arrival">
          <CalendarHeatmap data={data} target={m.target} accent={accent} />
        </SectionCard>
      </div>
    </div>
  );
}

function HeroStat({ label, value, unit, accent, lite }) {
  return (
    <div>
      <div style={{ fontSize: 11.5, fontWeight: 600, opacity: lite ? 0.85 : 1, color: lite ? '#fff' : 'var(--muted)', marginBottom: 4, whiteSpace: 'nowrap' }}>{label}</div>
      <div className="tnum" style={{ fontFamily: 'var(--mono)', fontSize: 27, fontWeight: 800, color: lite ? '#fff' : 'var(--ink)', lineHeight: 1 }}>
        {value}{unit && <span style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.65, marginLeft: 3 }}>{unit}</span>}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
