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
              onCardDragStart={onCardDragS
