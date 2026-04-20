'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MyScoresPage() {
  const r = useRouter();
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => { init(); }, [month]);

  async function init() {
    setLoading(true);
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { r.push('/login'); return; }
      const meData = await meRes.json();
      setMe(meData.user);
      const res = await fetch(`/api/scores/me?month=${month}`);
      const d = await res.json();
      setData(d);
    } finally { setLoading(false); }
  }

  if (loading) return <div style={{ minHeight: '100vh', background: '#1a0f2e', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Đang tải...</div>;

  const current = data?.current || { total: 0, count: 0, entries: [] };
  const diff = data?.diff;

  const byLevel = {};
  current.entries.forEach((e) => {
    if (!byLevel[e.levelName]) byLevel[e.levelName] = { count: 0, total: 0, points: e.points };
    byLevel[e.levelName].count++;
    byLevel[e.levelName].total += e.points;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0f2e 0%, #2e1a55 50%, #1a0f2e 100%)', color: '#fff' }}>
      <header style={{ background: 'rgba(15,8,32,0.9)', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/boards" style={{ color: '#fff', textDecoration: 'none', opacity: 0.7, fontSize: 13 }}>← Boards</a>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)' }} />
          <span style={{ fontWeight: 500, fontSize: 15 }}>⭐ Điểm của tôi</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '5px 10px', borderRadius: 4, fontSize: 12 }} />
          <span style={{ fontSize: 12, opacity: 0.75 }}>{me?.name}</span>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '24px' }}>
        <div style={{ background: 'linear-gradient(135deg,#3C3489,#7F77DD)', borderRadius: 14, padding: '20px 24px', marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 18 }}>
          <div style={{ borderRight: '1px solid rgba(255,255,255,0.2)', paddingRight: 14 }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Xin chào</div>
            <div style={{ fontSize: 17, fontWeight: 500, marginTop: 2 }}>{me?.name}</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>{monthLabel(month)}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Tổng điểm</div>
            <div style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.1, marginTop: 2 }}>{current.total.toFixed(2)}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>điểm</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Mẫu hoàn thành</div>
            <div style={{ fontSize: 30, fontWeight: 500, lineHeight: 1.1, marginTop: 2 }}>{current.count}</div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>mẫu</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, opacity: 0.8 }}>So với tháng trước</div>
            <div style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.1, marginTop: 2, color: diff === null ? '#fff' : diff >= 0 ? '#86efac' : '#fca5a5' }}>
              {diff === null ? '—' : (diff >= 0 ? '+' : '') + diff + '%'}
            </div>
            <div style={{ fontSize: 10, opacity: 0.7 }}>{diff === null ? 'Chưa có dữ liệu' : diff >= 0 ? '↗ tăng' : '↘ giảm'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 500, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📋 Lịch sử chấm điểm gần nhất</h3>
            {current.entries.length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', opacity: 0.6, fontSize: 13 }}>Chưa có điểm nào tháng này</div>
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {current.entries.slice(0, 20).map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 5, marginBottom: 5 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.levelName}</div>
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 1 }}>{new Date(e.at).toLocaleString('vi-VN')}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 10 }}>{e.points}đ</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 16 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 500, opacity: 0.8, textTransform: 'uppercase', letterSpacing: 0.5 }}>📊 Phân loại điểm</h3>
            {Object.keys(byLevel).length === 0 ? (
              <div style={{ padding: 20, textAlign: 'center', opacity: 0.6, fontSize: 13 }}>Chưa có dữ liệu</div>
            ) : (
              <div>
                {Object.entries(byLevel).map(([name, info]) => {
                  const pct = current.total > 0 ? (info.total / current.total) * 100 : 0;
                  return (
                    <div key={name} style={{ padding: '8px 0', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 12 }}>{name}</span>
                        <span style={{ fontSize: 11, opacity: 0.75 }}>{info.count} × {info.points}đ = {info.total.toFixed(2)}đ</span>
                      </div>
                      <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 2 }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                  <span style={{ fontSize: 13 }}>Tổng</span>
                  <span style={{ fontSize: 13, color: '#a5b4fc' }}>{current.total.toFixed(2)}đ</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function monthLabel(mk) {
  const [y, m] = mk.split('-');
  return `Tháng ${parseInt(m)} / ${y}`;
}
