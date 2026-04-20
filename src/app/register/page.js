'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterV6() {
  const r = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || 'Lỗi đăng ký'); return; }
      setMsg(data.message);
      if (!data.pending) setTimeout(() => r.push('/login'), 1500);
    } catch { setErr('Lỗi kết nối'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a0f2e 0%, #2e1a55 50%, #1a0f2e 100%)', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, color: '#1f1f1f' }}>Đăng ký NBECOM</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#71717a' }}>Admin sẽ duyệt tài khoản của bạn</p>
        </div>

        {msg ? (
          <div style={{ background: '#f0fdf4', color: '#166534', padding: 14, borderRadius: 8, fontSize: 13, textAlign: 'center', lineHeight: 1.5 }}>
            ✓ {msg}<br /><br />
            <a href="/login" style={{ color: '#6366f1', fontWeight: 500 }}>Đi đến đăng nhập →</a>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 6 }}>Họ tên</label>
            <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d4d4d8', fontSize: 14, marginBottom: 14, boxSizing: 'border-box', color: '#1f1f1f' }} />

            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 6 }}>Email</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d4d4d8', fontSize: 14, marginBottom: 14, boxSizing: 'border-box', color: '#1f1f1f' }} />

            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 6 }}>Mật khẩu (tối thiểu 6 ký tự)</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d4d4d8', fontSize: 14, marginBottom: 16, boxSizing: 'border-box', color: '#1f1f1f' }} />

            {err && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 14 }}>{err}</div>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: 11, borderRadius: 6, border: 'none', background: loading ? '#a1a1aa' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'default' : 'pointer' }}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#71717a' }}>
              Đã có tài khoản? <a href="/login" style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>Đăng nhập</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
