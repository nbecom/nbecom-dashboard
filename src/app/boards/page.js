'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BoardsListPage() {
  const r = useRouter();
  const [me, setMe] = useState(null);
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { r.push('/login'); return; }
      const meData = await meRes.json();
      setMe(meData.user);
      const bRes = await fetch('/api/boards');
      const bData = await bRes.json();
      setBoards(bData.boards || []);
    } finally { setLoading(false); }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    r.push('/login');
  }

  const canCreate = me && (me.role === 'admin' || me.role === 'manager');

  if (loading) return <div style={{ minHeight: '100vh', background: '#1a0f2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f2e 0%, #2e1a55 50%, #1a0f2e 100%)', color: '#fff' }}>
      <header style={{ background: 'rgba(15,8,32,0.9)', backdropFilter: 'blur(10px)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>N</div>
          <span style={{ fontWeight: 500, fontSize: 15 }}>NBECOM Boards</span>
        </div>

        <nav style={{ display: 'flex', gap: 6 }}>
          <NavLink href="/boards" active>📋 Boards</NavLink>
          <NavLink href="/my-scores">⭐ Điểm của tôi</NavLink>
          {me?.role === 'admin' && <NavLink href="/admin-v6">⚙️ Quản trị</NavLink>}
          <NavLink href="/">🏠 Dashboard v5.7</NavLink>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, opacity: 0.85 }}>{me?.name}</span>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500 }}>{me?.avatar}</div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Đăng xuất</button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 500 }}>Các bảng của bạn</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, opacity: 0.7 }}>{boards.length} bảng · Role: {me?.role}</p>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreate(true)}
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', padding: '10px 18px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
              + Tạo bảng mới
            </button>
          )}
        </div>

        {boards.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Chưa có bảng nào</h3>
            <p style={{ margin: '6px 0 16px', fontSize: 13, opacity: 0.7 }}>
              {canCreate ? 'Tạo bảng đầu tiên để bắt đầu quản lý design' : 'Admin chưa cấp quyền vào bảng nào cho bạn'}
            </p>
            {canCreate && (
              <button onClick={() => setShowCreate(true)}
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                + Tạo bảng mới
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
            {boards.map((b) => (
              <a key={b.id} href={`/boards/${b.id}`}
                style={{ background: b.bg || '#3C3489', height: 110, borderRadius: 10, padding: 14, textDecoration: 'none', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 24 }}>{b.icon || '📋'}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{b.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
                    {b.listCount || 0} cột · {b.myRole === 'owner' ? '👑 Owner' : b.myRole === 'editor' ? '✏️ Editor' : '👁 Viewer'}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      {showCreate && <CreateBoardModal onClose={() => setShowCreate(false)} onCreated={(b) => { setShowCreate(false); r.push(`/boards/${b.id}`); }} />}
    </div>
  );
}

function NavLink({ href, active, children }) {
  return (
    <a href={href} style={{ padding: '6px 12px', borderRadius: 5, fontSize: 13, textDecoration: 'none', color: '#fff', background: active ? 'rgba(99,102,241,0.3)' : 'transparent', fontWeight: active ? 500 : 400 }}>
      {children}
    </a>
  );
}

const BG_OPTIONS = ['#3C3489', '#0F6E56', '#993C1D', '#A32D2D', '#185FA5', '#854F0B'];
const ICON_OPTIONS = ['📋', '🎨', '🧵', '👕', '🎁', '📦', '⭐', '🔥'];

function CreateBoardModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [bg, setBg] = useState(BG_OPTIONS[0]);
  const [icon, setIcon] = useState(ICON_OPTIONS[0]);
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bg, icon }),
      });
      const data = await res.json();
      if (data.ok) onCreated(data.board);
      else alert(data.error || 'Lỗi tạo board');
    } finally { setSaving(false); }
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 10, padding: 24, width: '100%', maxWidth: 420, color: '#1f1f1f' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 17, fontWeight: 500 }}>Tạo bảng mới</h3>

        <label style={{ fontSize: 12, fontWeight: 500, color: '#52525b' }}>Tên bảng</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: NBecom_Hậu_EMB_2026" autoFocus
          style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #d4d4d8', fontSize: 14, marginTop: 4, marginBottom: 14, boxSizing: 'border-box', color: '#1f1f1f' }} />

        <label style={{ fontSize: 12, fontWeight: 500, color: '#52525b', display: 'block', marginBottom: 6 }}>Màu nền</label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {BG_OPTIONS.map((c) => (
            <button key={c} onClick={() => setBg(c)}
              style={{ width: 34, height: 34, borderRadius: 6, background: c, border: bg === c ? '3px solid #6366f1' : '1px solid #d4d4d8', cursor: 'pointer' }} />
          ))}
        </div>

        <label style={{ fontSize: 12, fontWeight: 500, color: '#52525b', display: 'block', marginBottom: 6 }}>Biểu tượng</label>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {ICON_OPTIONS.map((i) => (
            <button key={i} onClick={() => setIcon(i)}
              style={{ width: 34, height: 34, borderRadius: 6, background: icon === i ? '#ede9fe' : '#f4f4f5', border: icon === i ? '2px solid #6366f1' : '1px solid #d4d4d8', cursor: 'pointer', fontSize: 18 }}>
              {i}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '9px 16px', borderRadius: 6, border: '1px solid #d4d4d8', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#1f1f1f' }}>Huỷ</button>
          <button onClick={create} disabled={saving || !name.trim()}
            style={{ padding: '9px 18px', borderRadius: 6, border: 'none', background: saving || !name.trim() ? '#a1a1aa' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: saving || !name.trim() ? 'default' : 'pointer' }}>
            {saving ? 'Đang tạo...' : 'Tạo bảng'}
          </button>
        </div>
      </div>
    </div>
  );
}
