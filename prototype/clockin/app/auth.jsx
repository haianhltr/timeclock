// ===== clockin login (for show) =====
function Logo({ size = 26, color }) {
  const s = size;
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" stroke={color || 'var(--accent)'} strokeWidth="2.4" />
      <path d="M16 9.5 V16 L20.5 18.6" stroke={color || 'var(--accent)'} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Login({ onLogin, onClose, accent }) {
  const [email, setEmail] = useState('jordan@northgate.co');
  const [pw, setPw] = useState('••••••••');
  const [busy, setBusy] = useState(false);
  function submit(e) {
    e.preventDefault();
    setBusy(true);
    setTimeout(() => onLogin(email), 650);
  }
  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', placeItems: 'center', padding: 20 }}>
      <div className="login-wrap" style={{
        width: 'min(940px, 100%)', background: 'var(--surface)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)', overflow: 'hidden', display: 'grid',
        gridTemplateColumns: '1.05fr 1fr', animation: 'pop .5s cubic-bezier(.2,.8,.2,1) both',
      }}>
        {/* brand panel */}
        <div className="login-brand" style={{
          background: `linear-gradient(150deg, ${accent} 0%, var(--accent-ink) 100%)`,
          color: '#fff', padding: '46px 42px', position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 520,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 21, letterSpacing: '-.02em' }}>
            <Logo size={28} color="#fff" /> clockin
          </div>
          {/* deco rings */}
          <svg viewBox="0 0 400 400" style={{ position: 'absolute', right: -110, top: 40, width: 360, opacity: 0.16 }}>
            <circle cx="200" cy="200" r="150" fill="none" stroke="#fff" strokeWidth="2" />
            <circle cx="200" cy="200" r="110" fill="none" stroke="#fff" strokeWidth="2" />
            <circle cx="200" cy="200" r="70" fill="none" stroke="#fff" strokeWidth="2" />
            <path d="M200 200 L200 80" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <path d="M200 200 L280 240" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.12, letterSpacing: '-.02em', marginBottom: 12, textWrap: 'balance' }}>
              Your morning,<br />in two timestamps.
            </div>
            <div style={{ fontSize: 14.5, opacity: 0.9, lineHeight: 1.5, maxWidth: 320 }}>
              Log your time to the gate and time to your desk. We turn it into the check-in you send — and the trends you never see.
            </div>
          </div>
        </div>
        {/* form */}
        <form onSubmit={submit} style={{ padding: '54px 46px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          {onClose && <button type="button" onClick={onClose} style={{ position: 'absolute', top: 18, right: 20, fontSize: 13, fontWeight: 600, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>← Back to dashboard</button>}
          <h1 style={{ margin: '0 0 6px', fontSize: 25, fontWeight: 800, letterSpacing: '-.02em' }}>Welcome back</h1>
          <p style={{ margin: '0 0 28px', color: 'var(--ink-2)', fontSize: 14 }}>Sign in to log today’s check-in.</p>
          <Field label="Email" value={email} onChange={setEmail} type="email" />
          <Field label="Password" value={pw} onChange={setPw} type="password" />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--ink-2)', margin: '4px 0 24px' }}>
            <input type="checkbox" defaultChecked style={{ accentColor: accent, width: 15, height: 15 }} /> Keep me signed in
          </label>
          <button type="submit" disabled={busy} style={{
            background: accent, color: '#fff', fontWeight: 700, fontSize: 15, padding: '14px', borderRadius: 'var(--radius-sm)',
            boxShadow: '0 6px 18px -6px ' + accent, transition: 'transform .12s, filter .12s', opacity: busy ? 0.8 : 1,
          }} onMouseDown={e => e.currentTarget.style.transform = 'scale(.98)'} onMouseUp={e => e.currentTarget.style.transform = ''}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'var(--muted)' }}>
            New here? <span style={{ color: accent, fontWeight: 600 }}>Create an account</span>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type }) {
  const [focus, setFocus] = useState(false);
  return (
    <label style={{ display: 'block', marginBottom: 16 }}>
      <span style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 6 }}>{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          width: '100%', padding: '13px 15px', fontSize: 14.5, color: 'var(--ink)',
          background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
          border: `1.5px solid ${focus ? 'var(--accent)' : 'var(--line)'}`,
          outline: 'none', transition: 'border-color .15s', boxShadow: focus ? '0 0 0 4px var(--accent-soft)' : 'none',
        }} />
    </label>
  );
}

Object.assign(window, { Login, Logo });
