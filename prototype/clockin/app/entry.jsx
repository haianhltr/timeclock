// ===== clockin daily check-in form =====
const MOODS = [
  { v: 1, label: 'Rough', hue: 'var(--late)' },
  { v: 2, label: 'Meh', hue: 'oklch(0.72 0.13 45)' },
  { v: 3, label: 'OK', hue: 'var(--amber)' },
  { v: 4, label: 'Good', hue: 'oklch(0.74 0.10 130)' },
  { v: 5, label: 'Great', hue: 'var(--good)' },
];

function TimePicker({ label, value, onChange, accent }) {
  return (
    <label style={{ flex: 1, display: 'block' }}>
      <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7 }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <input type="time" value={value} onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', padding: '16px 16px', fontSize: 22, fontWeight: 700, fontFamily: 'var(--mono)',
            color: 'var(--ink)', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--line)', outline: 'none', accentColor: accent,
          }} />
      </div>
    </label>
  );
}

function CheckIn({ boss, target, accent, onSave, today, existing }) {
  const [gate, setGate] = useState(existing ? fmt2(existing.gate) : '08:00');
  const [desk, setDesk] = useState(existing ? fmt2(existing.desk) : '08:05');
  const [useReason, setUseReason] = useState(existing ? !!existing.reason : false);
  const [reason, setReason] = useState(existing ? (existing.reason || '') : '');
  const [mood, setMood] = useState(existing ? existing.mood : 4);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const gateP = gate ? fmt(toMin(gate)) : '';
  const deskP = desk ? fmt(toMin(desk)) : '';
  const dur = (gate && desk) ? toMin(desk) - toMin(gate) : null;
  const late = desk ? toMin(desk) > target : false;
  const msg = buildMessage(boss, gateP, deskP, useReason && reason ? reason : null);

  function save() {
    onSave({ date: today, gate: toMin(gate), desk: toMin(desk), reason: useReason && reason ? reason : null, mood });
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  }
  function copy() {
    navigator.clipboard?.writeText(msg).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', animation: 'fadeUp .4s ease both' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: accent, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          {existing ? 'Already logged · editing' : 'Today'}
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>{prettyDate(today)}</h1>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: '26px 26px 28px', border: '1px solid var(--line-soft)' }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <TimePicker label="Time to gate" value={gate} onChange={setGate} accent={accent} />
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 16, color: 'var(--muted)', fontSize: 18 }}>→</div>
          <TimePicker label="Time to desk" value={desk} onChange={setDesk} accent={accent} />
        </div>

        {/* derived chips */}
        <div style={{ display: 'flex', gap: 9, marginTop: 14, flexWrap: 'wrap' }}>
          {dur != null && <Chip tone="neutral">{dur} min gate → desk</Chip>}
          {desk && (late
            ? <Chip tone="late">Late · target {fmt(target)}</Chip>
            : <Chip tone="good">On time</Chip>)}
        </div>

        {/* mood */}
        <div style={{ marginTop: 24 }}>
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 9 }}>Energy this morning</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {MOODS.map(m => {
              const on = mood === m.v;
              return (
                <button key={m.v} onClick={() => setMood(m.v)} style={{
                  flex: 1, padding: '10px 4px', borderRadius: 'var(--radius-sm)', fontSize: 12.5, fontWeight: 700,
                  background: on ? m.hue : 'var(--surface-2)', color: on ? '#fff' : 'var(--ink-2)',
                  border: `1.5px solid ${on ? m.hue : 'var(--line)'}`, transition: 'all .14s',
                  transform: on ? 'translateY(-2px)' : 'none', boxShadow: on ? 'var(--shadow-sm)' : 'none',
                }}>{m.label}</button>
              );
            })}
          </div>
        </div>

        {/* reason */}
        <div style={{ marginTop: 22 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <input type="checkbox" checked={useReason} onChange={e => setUseReason(e.target.checked)}
              style={{ width: 17, height: 17, accentColor: accent }} />
            Add a reason
          </label>
          <div style={{ display: 'grid', gridTemplateRows: useReason ? '1fr' : '0fr', transition: 'grid-template-rows .25s ease', marginTop: useReason ? 10 : 0 }}>
            <div style={{ overflow: 'hidden' }}>
              <input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. traffic at exit"
                style={{ width: '100%', padding: '12px 14px', fontSize: 14, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--line)', outline: 'none', color: 'var(--ink)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* live message preview — the note to the boss */}
      <div style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9, padding: '0 4px' }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>Your check-in message</span>
          <button onClick={copy} style={{ fontSize: 12.5, fontWeight: 700, color: copied ? 'var(--good)' : accent, display: 'flex', alignItems: 'center', gap: 5 }}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            maxWidth: '90%', background: accent, color: '#fff', padding: '14px 17px', fontSize: 14.5, lineHeight: 1.5,
            borderRadius: '18px 18px 4px 18px', boxShadow: '0 6px 18px -8px ' + accent, textWrap: 'pretty',
          }}>{msg}</div>
        </div>
      </div>

      <button onClick={save} disabled={!gate || !desk} style={{
        width: '100%', marginTop: 20, background: 'var(--ink)', color: '#fff', fontWeight: 700, fontSize: 15.5,
        padding: '16px', borderRadius: 'var(--radius-sm)', transition: 'transform .12s, background .2s',
        background: saved ? 'var(--good)' : 'var(--ink)',
      }} onMouseDown={e => e.currentTarget.style.transform = 'scale(.99)'} onMouseUp={e => e.currentTarget.style.transform = ''}>
        {saved ? '✓ Check-in saved' : existing ? 'Update check-in' : 'Save check-in'}
      </button>
    </div>
  );
}

function Chip({ children, tone }) {
  const map = {
    neutral: { bg: 'var(--surface-2)', fg: 'var(--ink-2)', bd: 'var(--line)' },
    good: { bg: 'var(--good-soft)', fg: 'oklch(0.42 0.10 158)', bd: 'transparent' },
    late: { bg: 'var(--late-soft)', fg: 'oklch(0.48 0.16 22)', bd: 'transparent' },
  }[tone];
  return <span style={{ background: map.bg, color: map.fg, border: `1px solid ${map.bd}`, padding: '6px 12px', borderRadius: 99, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{children}</span>;
}

Object.assign(window, { CheckIn });
