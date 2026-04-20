'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginV6() {
  const r = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error || 'Lỗi đăng nhập'); return; }
      r.push('/boards');
    } catch { setErr('Lỗi kết nối'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a0f2e 0%, #2e1a55 50%, #1a0f2e 100%)', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 600 }}>N</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500, color: '#1f1f1f' }}>NBECOM Boards</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#71717a' }}>Quản lý design v6.0</p>
        </div>

        <form onSubmit={submit}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 6 }}>Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d4d4d8', fontSize: 14, marginBottom: 14, boxSizing: 'border-box', color: '#1f1f1f' }} />

          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 6 }}>Mật khẩu</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d4d4d8', fontSize: 14, marginBottom: 16, boxSizing: 'border-box', color: '#1f1f1f' }} />

          {err && <div style={{ background: '#fef2f2', color: '#991b1b', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 14 }}>{err}</div>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: 11, borderRadius: 6, border: 'none', background: loading ? '#a1a1aa' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 500, cursor: loading ? 'default' : 'pointer' }}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#71717a' }}>
          Chưa có tài khoản? <a href="/register" style={{ color: '#6366f1', fontWeight: 500, textDecoration: 'none' }}>Đăng ký</a>
        </div>
      </div>
    </div>
  );
}
