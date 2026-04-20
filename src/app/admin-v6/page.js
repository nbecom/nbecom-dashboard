'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminV6Page() {
  const r = useRouter();
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState({ pending: [], approved: [], disabled: [] });
  const [scoreLevels, setScoreLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, []);

  async function init() {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { r.push('/login'); return; }
      const meData = await meRes.json();
      if (meData.user.role !== 'admin') { alert('Chỉ Admin'); r.push('/boards'); return; }
      setMe(meData.user);
      await loadAll();
    } finally { setLoading(false); }
  }

  async function loadAll() {
    const [uRes, lRes] = await Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/score-levels').then(r => r.json()),
    ]);
    setUsers(uRes);
    setScoreLevels(lRes.levels || []);
  }

  async function approveUser(uid, role) {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', uid, role }),
    });
    if (res.ok) loadAll();
    else alert('Lỗi duyệt user');
  }

  async function disableUser(uid) {
    if (!confirm('Vô hiệu hóa user này?')) return;
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'disable', uid }),
    });
    loadAll();
  }

  async function enableUser(uid) {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enable', uid }),
    });
    loadAll();
  }

  async function changeRole(uid, role) {
    await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setRole', uid, role }),
    });
    loadAll();
  }

  async function saveLevel(level) {
    const res = await fetch('/api/admin/score-levels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(level),
    });
    if (res.ok) loadAll();
  }

  async function deleteLevel(id) {
    if (!confirm('Xóa mức điểm này?')) return;
    await fetch('/api/admin/score-levels', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadAll();
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#1a0f2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f2e 0%, #2e1a55 50%, #1a0f2e 100%)', color: '#fff' }}>
      <header style={{ background: 'rgba(15,8,32,0.9)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/boards" style={{ color: '#fff', textDecoration: 'none', opacity: 0.7, fontSize: 13 }}>← Boards</a>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontWeight: 500, fontSize: 15 }}>⚙️ Quản trị NBECOM v6.0</span>
        </div>
        <span style={{ fontSize: 12, opacity: 0.75 }}>{me?.name} · Admin</span>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <TabBtn active={tab === 'users'} onClick={() => setTab('users')}>👥 Người dùng ({users.pending.length} chờ duyệt)</TabBtn>
          <TabBtn active={tab === 'scores'} onClick={() => setTab('scores')}>⭐ Mức điểm</TabBtn>
        </div>

        {tab === 'users' && (
          <UsersTab
            pending={users.pending} approved={users.approved} disabled={users.disabled}
            onApprove={approveUser} onDisable={disableUser} onEnable={enableUser} onChangeRole={changeRole}
          />
        )}
        {tab === 'scores' && (
          <ScoresTab levels={scoreLevels} onSave={saveLevel} onDelete={deleteLevel} />
        )}
      </main>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      style={{ background: 'transparent', border: 'none', color: '#fff', padding: '10px 16px', fontSize: 13, cursor: 'pointer', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent', fontWeight: active ? 500 : 400, opacity: active ? 1 : 0.7 }}>
      {children}
    </button>
  );
}

function UsersTab({ pending, approved, disabled, onApprove, onDisable, onEnable, onChangeRole }) {
  return (
    <>
      {pending.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: 14, marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 500, color: '#fbbf24' }}>⏳ Chờ duyệt ({pending.length})</h3>
          {pending.map((u) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{u.email}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => onApprove(u.id, 'designer')}
                  style={{ background: '#8b5cf6', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>Designer</button>
                <button onClick={() => onApprove(u.id, 'sale')}
                  style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>Sale</button>
                <button onClick={() => onApprove(u.id, 'manager')}
                  style={{ background: '#f59e0b', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>Manager</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 14 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 500 }}>✓ Đã duyệt ({approved.length})</h3>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ opacity: 0.6 }}>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Tên</th>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Role</th>
              <th style={{ textAlign: 'right', padding: '6px 8px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {approved.map((u) => (
              <tr key={u.id} style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '8px' }}>{u.name}</td>
                <td style={{ padding: '8px', opacity: 0.75 }}>{u.email}</td>
                <td style={{ padding: '8px' }}>
                  <select value={u.role} onChange={(e) => onChangeRole(u.id, e.target.value)}
                    disabled={u.role === 'admin'}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '3px 6px', borderRadius: 3, fontSize: 11 }}>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="sale">Sale</option>
                    <option value="designer">Designer</option>
                  </select>
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {u.role !== 'admin' && (
                    <button onClick={() => onDisable(u.id)}
                      style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', padding: '3px 8px', borderRadius: 3, fontSize: 11, cursor: 'pointer' }}>Vô hiệu hóa</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {disabled.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 14, marginTop: 20 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 500, opacity: 0.7 }}>🚫 Đã vô hiệu hóa ({disabled.length})</h3>
          {disabled.map((u) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{u.name} · {u.email}</div>
              <button onClick={() => onEnable(u.id)}
                style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.4)', color: '#86efac', padding: '3px 10px', borderRadius: 3, fontSize: 11, cursor: 'pointer' }}>Kích hoạt lại</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ScoresTab({ levels, onSave, onDelete }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', points: 1, color: '#378ADD', order: 10 });

  function startNew() {
    setEditing('new');
    setForm({ name: '', points: 1, color: '#378ADD', order: levels.length + 1 });
  }
  function startEdit(l) {
    setEditing(l.id);
    setForm({ ...l });
  }
  async function save() {
    if (!form.name.trim() || !form.points) return;
    await onSave(editing === 'new' ? form : { ...form, id: editing });
    setEditing(null);
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>⭐ Cấu hình mức điểm</h3>
        {!editing && (
          <button onClick={startNew}
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 5, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>+ Thêm mức</button>
        )}
      </div>

      <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16, lineHeight: 1.5 }}>
        Các mức điểm này sẽ hiển thị trong dropdown khi Admin/Manager/Sale chấm điểm cho designer ở mỗi thẻ design.
      </p>

      {editing && (
        <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 10 }}>{editing === 'new' ? 'Thêm mức điểm mới' : 'Sửa mức điểm'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
            <div>
              <label style={{ fontSize: 11, opacity: 0.7 }}>Tên</label>
              <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="VD: Mẫu 2đ"
                style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, marginTop: 2, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, opacity: 0.7 }}>Điểm</label>
              <input type="number" step="0.25" value={form.points} onChange={(e) => setForm({...form, points: parseFloat(e.target.value) || 0})}
                style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, marginTop: 2, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, opacity: 0.7 }}>Màu</label>
              <input type="color" value={form.color} onChange={(e) => setForm({...form, color: e.target.value})}
                style={{ width: '100%', height: 28, padding: 2, borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', marginTop: 2, boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, opacity: 0.7 }}>Thứ tự</label>
              <input type="number" value={form.order} onChange={(e) => setForm({...form, order: parseInt(e.target.value) || 0})}
                style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 12, marginTop: 2, boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={save} style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Lưu</button>
              <button onClick={() => setEditing(null)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        </div>
      )}

      <div>
        {levels.map((lv) => (
          <div key={lv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, marginBottom: 6 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: lv.color }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{lv.name}</div>
              <div style={{ fontSize: 11, opacity: 0.6 }}>{lv.points} điểm · thứ tự {lv.order}</div>
            </div>
            <button onClick={() => startEdit(lv)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>Sửa</button>
            <button onClick={() => onDelete(lv.id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '4px 10px', borderRadius: 4, fontSize: 11, cursor: 'pointer' }}>Xóa</button>
          </div>
        ))}
      </div>
    </div>
  );
}
