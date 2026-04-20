'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function BoardDetailPage() {
  const r = useRouter();
  const params = useParams();
  const boardId = params.id;
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCardId, setOpenCardId] = useState(null);
  const [draggingCard, setDraggingCard] = useState(null);

  useEffect(() => { load(); }, [boardId]);

  async function load() {
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) { r.push('/login'); return; }
      const meData = await meRes.json();
      setMe(meData.user);
      const res = await fetch(`/api/boards/${boardId}`);
      if (!res.ok) { alert('Không có quyền xem board này'); r.push('/boards'); return; }
      const d = await res.json();
      setData(d);
    } finally { setLoading(false); }
  }

  function showToast(msg, type = 'success') {
    const el = document.createElement('div');
    el.textContent = msg;
    const colors = { success: '#10b981', error: '#ef4444', info: '#6366f1' };
    el.style.cssText = `position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:${colors[type]};color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.25)`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  function onCardDragStart(card, listId, e) {
    setDraggingCard({ card, fromListId: listId });
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.style.opacity = '0.4';
  }
  function onCardDragEnd(e) {
    e.currentTarget.style.opacity = '1';
    setDraggingCard(null);
  }
  function onListDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  async function onListDrop(toListId, e) {
    e.preventDefault();
    if (!draggingCard) return;
    const { card, fromListId } = draggingCard;
    if (fromListId === toListId) return;

    const newLists = data.lists.map((l) => ({ ...l, cards: [...l.cards] }));
    const fromList = newLists.find((l) => l.id === fromListId);
    const toList = newLists.find((l) => l.id === toListId);
    const idx = fromList.cards.findIndex((c) => c.id === card.id);
    if (idx >= 0) fromList.cards.splice(idx, 1);
    toList.cards.push({ ...card, listId: toListId });
    setData({ ...data, lists: newLists });

    const res = await fetch(`/api/cards/${card.id}/move`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toListId, toIndex: toList.cards.length - 1 }),
    });
    const result = await res.json();
    if (!res.ok) { showToast(result.error, 'error'); load(); return; }
    if (result.scoreResult?.scored) {
      showToast(`✓ Đã cộng ${result.scoreResult.points} điểm`, 'success');
    }
  }

  async function addCard(listId, title) {
    if (!title.trim()) return;
    const res = await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId, title }),
    });
    const d = await res.json();
    if (!res.ok) { showToast(d.error, 'error'); return; }
    const newLists = data.lists.map((l) => l.id === listId ? { ...l, cards: [...l.cards, d.card] } : l);
    setData({ ...data, lists: newLists });
  }

  async function addList(name) {
    if (!name.trim()) return;
    const res = await fetch('/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId, name, isDone: name.toLowerCase().includes('done') }),
    });
    const d = await res.json();
    if (!res.ok) { showToast(d.error, 'error'); return; }
    setData({ ...data, lists: [...data.lists, d.list] });
  }

  async function deleteList(listId) {
    if (!confirm('Xóa cột này? (Cột phải trống thẻ)')) return;
    const res = await fetch(`/api/lists/${listId}`, { method: 'DELETE' });
    const d = await res.json();
    if (!res.ok) { showToast(d.error, 'error'); return; }
    setData({ ...data, lists: data.lists.filter((l) => l.id !== listId) });
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#fff', background: '#1a0f2e', minHeight: '100vh' }}>Đang tải...</div>;
  if (!data) return null;

  const { board, lists, canManage } = data;

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(135deg, ${board.bg}dd 0%, #1a0f2e 60%, ${board.bg}88 100%)`, color: '#fff' }}>
      <header style={{ background: 'rgba(15,8,32,0.85)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <a href="/boards" style={{ color: '#fff', textDecoration: 'none', opacity: 0.7, fontSize: 13 }}>← Boards</a>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500 }}>
            <span style={{ fontSize: 18 }}>{board.icon}</span>
            {board.name}
          </div>
        </div>
        <span style={{ fontSize: 12, opacity: 0.75 }}>{me?.name} · {canManage ? '👑 Owner' : '✏️ Editor'}</span>
      </header>

      <div style={{ padding: '16px 20px 20px', overflowX: 'auto', minHeight: 'calc(100vh - 54px)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', minWidth: 'fit-content' }}>
          {lists.map((list) => (
            <ListColumn key={list.id} list={list} onCardClick={setOpenCardId}
              onDrop={(e) => onListDrop(list.id, e)} onDragOver={onListDragOver}
              onCardDragStart={onCardDragStart} onCardDragEnd={onCardDragEnd}
              onAddCard={(title) => addCard(list.id, title)}
              onDeleteList={() => deleteList(list.id)} canManage={canManage}
            />
          ))}
          <AddListButton onAdd={addList} />
        </div>
      </div>

      {openCardId && <CardModal cardId={openCardId} onClose={() => { setOpenCardId(null); load(); }} me={me} boardMembers={data.members} />}
    </div>
  );
}

function ListColumn({ list, onCardClick, onDrop, onDragOver, onCardDragStart, onCardDragEnd, onAddCard, onDeleteList, canManage }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const isDone = list.isDone === '1';

  return (
    <div onDrop={onDrop} onDragOver={onDragOver}
      style={{ background: 'rgba(15,8,32,0.85)', borderRadius: 8, padding: 6, minWidth: 260, maxWidth: 260, flexShrink: 0, height: 'fit-content', border: isDone ? '2px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 10px' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#e5e3f5', display: 'flex', alignItems: 'center', gap: 6 }}>
          {isDone && <span style={{ fontSize: 11 }}>✓</span>}
          {list.name}
          <span style={{ fontSize: 11, opacity: 0.5, marginLeft: 4 }}>{list.cards.length}</span>
        </div>
        {canManage && (
          <button onClick={onDeleteList} title="Xóa cột" style={{ background: 'transparent', border: 'none', color: '#9a8fd0', cursor: 'pointer', fontSize: 14, padding: 2 }}>×</button>
        )}
      </div>

      <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: 2 }}>
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} onClick={() => onCardClick(card.id)}
            onDragStart={(e) => onCardDragStart(card, list.id, e)} onDragEnd={onCardDragEnd}
          />
        ))}
      </div>

      {adding ? (
        <div style={{ padding: 6 }}>
          <textarea autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề thẻ..."
            style={{ width: '100%', padding: 8, borderRadius: 4, border: 'none', fontSize: 12, resize: 'vertical', minHeight: 50, boxSizing: 'border-box', fontFamily: 'inherit' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onAddCard(title); setTitle(''); setAdding(false);
              }
            }} />
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button onClick={() => { onAddCard(title); setTitle(''); setAdding(false); }}
              style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Thêm</button>
            <button onClick={() => { setAdding(false); setTitle(''); }}
              style={{ background: 'transparent', border: 'none', color: '#9a8fd0', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Hủy</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          style={{ width: '100%', background: 'transparent', border: 'none', color: '#9a8fd0', padding: '8px 10px', textAlign: 'left', cursor: 'pointer', fontSize: 12, borderRadius: 4 }}>
          + Thêm thẻ
        </button>
      )}
    </div>
  );
}

function CardItem({ card, onClick, onDragStart, onDragEnd }) {
  const cover = card.cover;
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick}
      style={{ background: '#fff', borderRadius: 5, padding: 5, marginBottom: 5, cursor: 'grab', color: '#1f1f1f', border: '2px solid transparent' }}>
      {cover && (
        <div style={{ width: '100%', height: 100, background: `url(${cover}) center/cover`, borderRadius: 3, marginBottom: 5 }} />
      )}
      <div style={{ fontSize: 12, lineHeight: 1.4, padding: '1px 3px' }}>{card.title}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4, color: '#666', fontSize: 10, alignItems: 'center', padding: '0 3px 2px' }}>
        {card.attachmentCount > 0 && <span>📎 {card.attachmentCount}</span>}
        {card.scored === '1' && <span style={{ color: '#10b981', fontWeight: 500 }}>✓ Đã chấm điểm</span>}
        {card.designerId && card.scored !== '1' && <span style={{ color: '#f59e0b' }}>👤 Designer</span>}
      </div>
    </div>
  );
}

function AddListButton({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  if (adding) {
    return (
      <div style={{ background: 'rgba(15,8,32,0.85)', borderRadius: 8, padding: 8, minWidth: 260, maxWidth: 260, flexShrink: 0 }}>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên cột mới..."
          style={{ width: '100%', padding: 8, borderRadius: 4, border: 'none', fontSize: 13, boxSizing: 'border-box' }}
          onKeyDown={(e) => { if (e.key === 'Enter') { onAdd(name); setName(''); setAdding(false); } }} />
        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
          <button onClick={() => { onAdd(name); setName(''); setAdding(false); }}
            style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Thêm</button>
          <button onClick={() => { setAdding(false); setName(''); }}
            style={{ background: 'transparent', border: 'none', color: '#9a8fd0', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Hủy</button>
        </div>
      </div>
    );
  }
  return (
    <button onClick={() => setAdding(true)}
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.2)', color: '#fff', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, minWidth: 240, height: 'fit-content', flexShrink: 0 }}>
      + Thêm cột
    </button>
  );
}

function CardModal({ cardId, onClose, me, boardMembers }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoreLevels, setScoreLevels] = useState([]);

  useEffect(() => { load(); loadScoreLevels(); }, [cardId]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/cards/${cardId}`);
      const d = await res.json();
      setCard(d);
    } finally { setLoading(false); }
  }

  async function loadScoreLevels() {
    try {
      const res = await fetch('/api/admin/score-levels');
      if (res.ok) {
        const d = await res.json();
        setScoreLevels(d.levels || []);
      }
    } catch {}
  }

  async function updateField(field, value) {
    const res = await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    const d = await res.json();
    if (!res.ok) { alert(d.error); return; }
    await load();
  }

  async function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        e.preventDefault();
        const blob = item.getAsFile();
        await uploadImage(blob);
        return;
      }
    }
  }

  async function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadImage(file);
    }
  }

  async function uploadImage(blob) {
    const reader = new FileReader();
    reader.onload = async () => {
      await updateField('cover', reader.result);
      alert('Đã đính kèm ảnh! (Build 3 sẽ upload lên Cloudflare R2 thay vì base64)');
    };
    reader.readAsDataURL(blob);
  }

  if (loading || !card) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ color: '#fff' }}>Đang tải...</div>
    </div>
  );

  const c = card.card;

  return (
    <div onClick={onClose} onPaste={handlePaste}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, padding: 30, overflow: 'auto' }}>
      <div onClick={(e) => e.stopPropagation()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
        style={{ background: '#f5f5f5', borderRadius: 10, width: '100%', maxWidth: 680, color: '#1f1f1f', overflow: 'hidden' }}>

        {c.cover && (
          <div style={{ height: 160, background: `url(${c.cover}) center/cover`, position: 'relative' }}>
            <button onClick={() => updateField('cover', '')}
              style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>
              × Xóa ảnh bìa
            </button>
          </div>
        )}

        <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
          <div>
            <input value={c.title} onChange={(e) => setCard({...card, card:{...c, title: e.target.value}})}
              onBlur={() => updateField('title', c.title)}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 17, fontWeight: 500, color: '#1f1f1f', padding: 0, marginBottom: 12, boxSizing: 'border-box' }} />

            {!c.cover && (
              <div style={{ border: '2px dashed #d4d4d8', borderRadius: 6, padding: 16, textAlign: 'center', marginBottom: 14, background: '#fff' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🖼</div>
                <div style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}><b>Paste ảnh (Ctrl+V)</b> hoặc kéo-thả ảnh vào đây</div>
                <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                  style={{ fontSize: 11, marginTop: 6 }} />
              </div>
            )}

            <div style={{ fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 4 }}>📝 Mô tả</div>
            <textarea value={c.desc || ''} onChange={(e) => setCard({...card, card:{...c, desc: e.target.value}})}
              onBlur={() => updateField('desc', c.desc || '')}
              placeholder="Thêm mô tả chi tiết..."
              style={{ width: '100%', minHeight: 70, padding: 8, borderRadius: 4, border: '1px solid #d4d4d8', fontSize: 12, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', color: '#1f1f1f' }} />

            <div style={{ marginTop: 14, background: '#fff', border: '1px solid #e4e4e7', borderRadius: 6, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 8 }}>⭐ Chấm điểm design</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#71717a' }}>Designer</label>
                  <select value={c.designerId || ''} onChange={(e) => updateField('designerId', e.target.value)}
                    style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d4d4d8', fontSize: 12, marginTop: 2, color: '#1f1f1f' }}>
                    <option value="">-- Chọn designer --</option>
                    {(boardMembers || []).map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#71717a' }}>Mức điểm</label>
                  <select value={c.scoreLevel || ''} onChange={(e) => updateField('scoreLevel', e.target.value)}
                    style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d4d4d8', fontSize: 12, marginTop: 2, color: '#1f1f1f' }}>
                    <option value="">-- Chọn mức --</option>
                    {scoreLevels.map((lv) => (
                      <option key={lv.id} value={lv.id}>{lv.name} ({lv.points}đ)</option>
                    ))}
                  </select>
                </div>
              </div>
              {c.scored === '1' && (
                <div style={{ marginTop: 8, background: '#f0fdf4', color: '#166534', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>
                  ✓ Đã tính điểm tháng {c.scoredMonth}
                </div>
              )}
              {c.scored !== '1' && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#71717a' }}>
                  💡 Kéo thẻ vào cột "Done" sẽ tự động tính điểm
                </div>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 8 }}>📋 Thông tin</div>
            <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Tạo lúc: {new Date(Number(c.createdAt)).toLocaleString('vi-VN')}</div>
            <div style={{ fontSize: 11, color: '#71717a', marginBottom: 14 }}>ID: {c.id.slice(-8)}</div>

            <div style={{ fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 8 }}>📜 Hoạt động</div>
            <div style={{ fontSize: 11, color: '#71717a', maxHeight: 180, overflowY: 'auto' }}>
              {card.activity?.slice(0, 5).map((a, i) => (
                <div key={i} style={{ padding: '4px 0', borderBottom: '0.5px solid #e4e4e7' }}>
                  <b>{a.action}</b> · {new Date(a.at).toLocaleString('vi-VN')}
                </div>
              )) || <div style={{ color: '#a1a1aa' }}>Chưa có hoạt động</div>}
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 22px', borderTop: '1px solid #e4e4e7', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: '#71717a' }}>Tip: Paste ảnh bằng <b>Ctrl+V</b> hoặc kéo-thả</div>
          <button onClick={onClose}
            style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 5, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
