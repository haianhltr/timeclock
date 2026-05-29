// ===== clockin main app =====
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#e8744e",
  "dashStyle": "soft",
  "targetMin": 485,
  "boss": "Scott"
}/*EDITMODE-END*/;

const NAV = [
  { id: 'today', label: 'Check-in', icon: 'M12 6v6l4 2' },
  { id: 'insights', label: 'Insights', icon: 'M4 18 L9 12 L13 15 L20 6' },
  { id: 'history', label: 'History', icon: 'M4 6h16M4 12h16M4 18h10' },
];

function NavIcon({ d }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>;
}
function LockIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [user, setUser] = useState(null);            // owner email when signed in
  const [showLogin, setShowLogin] = useState(false);
  const [view, setView] = useState('insights');
  const [entries, setEntries] = useState(() => generateEntries());
  const today = '2026-05-29';
  const owner = !!user;

  useEffect(() => { document.documentElement.style.setProperty('--accent', t.accent); }, [t.accent]);

  const m = computeMetrics(entries, t.targetMin);
  const existing = entries.find(e => e.date === today);
  const navItems = owner ? NAV : NAV.filter(n => n.id !== 'today');
  const safeView = (view === 'today' && !owner) ? 'insights' : view;

  function saveEntry(rec) {
    setEntries(prev => {
      const i = prev.findIndex(e => e.date === rec.date);
      if (i >= 0) { const c = [...prev]; c[i] = rec; return c; }
      return [...prev, rec].sort((a, b) => a.date.localeCompare(b.date));
    });
    setTimeout(() => setView('insights'), 900);
  }
  function signIn(email) { setUser(email); setShowLogin(false); setView('today'); }
  function signOut() { setUser(null); setView('insights'); }

  if (showLogin) return (<>
    <Login onLogin={signIn} onClose={() => setShowLogin(false)} accent={t.accent} />
    <Tweaks t={t} setTweak={setTweak} />
  </>);

  const authButton = owner ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
      <div style={{ width: 36, height: 36, borderRadius: 99, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
        {(user[0] || 'J').toUpperCase()}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.split('@')[0]}</div>
        <button onClick={signOut} style={{ fontSize: 11.5, color: 'var(--muted)' }}>Sign out</button>
      </div>
    </div>
  ) : (
    <button onClick={() => setShowLogin(true)} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 15px', borderRadius: 'var(--radius-sm)',
      background: 'var(--accent)', color: '#fff', fontWeight: 700, fontSize: 13.5, boxShadow: '0 5px 14px -6px var(--accent)', whiteSpace: 'nowrap',
    }}><LockIcon /> Sign in to edit</button>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }} className="app-root">
      {/* desktop sidebar */}
      <aside className="sidebar" style={{
        width: 230, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--line)',
        padding: '24px 18px', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 20, letterSpacing: '-.02em', padding: '4px 8px 22px' }}>
          <Logo size={24} /> clockin
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(n => {
            const on = safeView === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 13px', borderRadius: 'var(--radius-sm)',
                fontSize: 14.5, fontWeight: 600, textAlign: 'left', transition: 'all .14s',
                background: on ? 'var(--accent-soft)' : 'transparent', color: on ? 'var(--accent-ink)' : 'var(--ink-2)',
              }}>
                <NavIcon d={n.icon} /> {n.label}
              </button>
            );
          })}
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: 14, borderTop: '1px solid var(--line-soft)' }}>
          {!owner && <div style={{ fontSize: 11.5, color: 'var(--muted)', margin: '0 4px 10px', lineHeight: 1.45 }}>You’re viewing in read-only mode.</div>}
          {authButton}
        </div>
      </aside>

      {/* mobile top bar */}
      <header className="topbar" style={{
        position: 'sticky', top: 0, zIndex: 30, display: 'none', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', background: 'var(--surface)', borderBottom: '1px solid var(--line)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: '-.02em' }}>
          <Logo size={22} /> clockin
        </div>
        {authButton}
      </header>

      {/* main */}
      <main style={{ flex: 1, minWidth: 0, padding: '34px clamp(18px, 4vw, 48px) 96px' }} className="app-main">
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          {safeView === 'today' && <CheckIn boss={t.boss} target={t.targetMin} accent={t.accent} onSave={saveEntry} today={today} existing={existing} />}
          {safeView === 'insights' && <Dashboard m={m} accent={t.accent} dashStyle={t.dashStyle} boss={t.boss} owner={owner} onSignIn={() => setShowLogin(true)} />}
          {safeView === 'history' && <History entries={entries} target={t.targetMin} />}
        </div>
      </main>

      {/* mobile bottom nav */}
      <nav className="bottomnav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--line)',
        display: 'none', justifyContent: 'space-around', padding: '8px 0 calc(8px + env(safe-area-inset-bottom))', zIndex: 40,
      }}>
        {navItems.map(n => {
          const on = safeView === n.id;
          return (
            <button key={n.id} onClick={() => setView(n.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 22px',
              color: on ? 'var(--accent)' : 'var(--muted)', fontSize: 11, fontWeight: 700,
            }}>
              <NavIcon d={n.icon} /> {n.label}
            </button>
          );
        })}
      </nav>

      <Tweaks t={t} setTweak={setTweak} />
    </div>
  );
}

// ---- history list ----
const MOOD_LABEL = { 1: 'Rough', 2: 'Meh', 3: 'OK', 4: 'Good', 5: 'Great' };

function History({ entries, target }) {
  const rows = [...entries].reverse();
  return (
    <div style={{ animation: 'fadeIn .35s ease both' }}>
      <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: '-.02em' }}>History</h1>
      <p style={{ margin: '0 0 22px', color: 'var(--ink-2)', fontSize: 14 }}>{rows.length} check-ins, newest first</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {rows.map((e, i) => {
          const isNote = e.type === 'note';
          const late = !isNote && e.desk > target;
          return (
            <div key={e.date} style={{
              display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface)', borderRadius: 'var(--radius-sm)',
              border: isNote ? '1px dashed var(--amber)' : '1px solid var(--line-soft)', padding: '14px 18px', boxShadow: 'var(--shadow-sm)',
              animation: `fadeUp .4s ease ${Math.min(i, 12) * 0.02}s both`,
            }} className="hist-row">
              <div style={{ width: 92, flexShrink: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{MO[Number(e.date.slice(5, 7)) - 1]} {Number(e.date.slice(8))}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{WD[new Date(e.date + 'T00:00:00').getDay()]}</div>
              </div>
              {isNote ? (
                <>
                  <div style={{ flex: 1, fontSize: 13.5, color: 'var(--ink-2)', minWidth: 0, textWrap: 'pretty' }}>{e.note}</div>
                  <span style={{ flexShrink: 0, fontSize: 11.5, fontWeight: 700, padding: '5px 11px', borderRadius: 99, background: 'var(--amber-soft)', color: 'var(--accent-ink)' }}>Note</span>
                </>
              ) : (
                <>
                  <div className="mono" style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', flexShrink: 0, width: 130 }}>
                    {fmt(e.gate)} <span style={{ color: 'var(--muted)' }}>→</span> {fmt(e.desk)}
                  </div>
                  <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hist-reason">
                    {e.reason ? e.reason : <span style={{ color: 'var(--muted)' }}>—</span>}
                    {e.leftHome != null && <span style={{ color: 'var(--muted)' }}> · left home {fmt(e.leftHome)}</span>}
                  </div>
                  {e.mood != null && <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', flexShrink: 0, width: 46, textAlign: 'right' }} className="hist-mood">{MOOD_LABEL[e.mood]}</span>}
                  <span style={{
                    flexShrink: 0, fontSize: 11.5, fontWeight: 700, padding: '5px 11px', borderRadius: 99,
                    background: late ? 'var(--late-soft)' : 'var(--good-soft)', color: late ? 'oklch(0.48 0.16 22)' : 'oklch(0.42 0.10 158)',
                  }}>{late ? 'Late' : 'On time'}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- tweaks panel ----
function Tweaks({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Dashboard look" />
      <TweakRadio label="Style" value={t.dashStyle} options={['soft', 'editorial', 'minimal']}
        onChange={v => setTweak('dashStyle', v)} />
      <TweakColor label="Accent" value={t.accent}
        options={['#e8744e', '#3f9d6e', '#d99a2b', '#9d6ae0', '#e0698f', '#3b82c4']}
        onChange={v => setTweak('accent', v)} />
      <TweakSection label="Your rules" />
      <TweakRow label="On-time target" value={fmt(t.targetMin)}>
        <input type="range" className="twk-slider" min={465} max={525} step={5}
          value={t.targetMin} onChange={e => setTweak('targetMin', Number(e.target.value))} />
      </TweakRow>
      <TweakText label="Boss's name" value={t.boss} onChange={v => setTweak('boss', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
