'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

async function resizeImageClient(file, maxSize = 2400, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => { img.src = e.target.result; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) { height = Math.round(height * maxSize / width); width = maxSize; }
        else { width = Math.round(width * maxSize / height); height = maxSize; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('Không thể nén ảnh'));
        resolve(blob);
      }, 'image/webp', quality);
    };
    img.onerror = () => reject(new Error('Không đọc được ảnh'));
    reader.readAsDataURL(file);
  });
}

export default function BoardDetailPage() {
  const r = useRouter();
  const params = useParams();
  const boardId = params.id;
  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openCardId, setOpenCardId] = useState(null);
  const [editingBoardName, setEditingBoardName] = useState(false);
  const [boardNameDraft, setBoardNameDraft] = useState('');
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const draggingRef = useRef(null);

  useEffect(() => { load(); }, [boardId]);

  async function load() {
    try {
      const [meRes, boardRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/boards/${boardId}`),
      ]);
      if (!meRes.ok) { r.push('/login'); return; }
      const meData = await meRes.json();
      setMe(meData.user);
      if (!boardRes.ok) { alert('Không có quyền xem board này'); r.push('/boards'); return; }
      const d = await boardRes.json();
      setData(d);
      setBoardNameDraft(d.board.name);
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

  async function saveBoardName() {
    if (!boardNameDraft.trim() || boardNameDraft === data.board.name) {
      setEditingBoardName(false);
      setBoardNameDraft(data.board.name);
      return;
    }
    setData({ ...data, board: { ...data.board, name: boardNameDraft } });
    setEditingBoardName(false);
    const res = await fetch(`/api/boards/${boardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: boardNameDraft }),
    });
    if (res.ok) showToast('✓ Đã đổi tên bảng');
    else { showToast('Lỗi đổi tên', 'error'); load(); }
  }

  async function deleteBoard() {
    if (!confirm(`XÓA BẢNG "${data.board.name}"?\n\nToàn bộ cột, thẻ, ảnh sẽ bị xóa vĩnh viễn.`)) return;
    const res = await fetch(`/api/boards/${boardId}`, { method: 'DELETE' });
    if (res.ok) { showToast('✓ Đã xóa bảng'); r.push('/boards'); }
    else showToast('Lỗi xóa bảng', 'error');
  }

  async function renameList(listId, newName) {
    if (!newName.trim()) return;
    const list = data.lists.find((l) => l.id === listId);
    if (list.name === newName) return;
    const newLists = data.lists.map((l) => l.id === listId ? { ...l, name: newName } : l);
    setData({ ...data, lists: newLists });
    const res = await fetch(`/api/lists/${listId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    if (!res.ok) { showToast('Lỗi đổi tên cột', 'error'); load(); }
  }

  async function toggleDoneColumn(listId) {
    const list = data.lists.find((l) => l.id === listId);
    const newIsDone = list.isDone === '1' ? false : true;
    const newLists = data.lists.map((l) => l.id === listId ? { ...l, isDone: newIsDone ? '1' : '0' } : l);
    setData({ ...data, lists: newLists });
    const res = await fetch(`/api/lists/${listId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDone: newIsDone }),
    });
    if (res.ok) showToast(newIsDone ? '✓ Cột này sẽ tự chấm điểm' : '✓ Bỏ tự chấm điểm');
  }

  function onCardDragStart(card, listId, e) {
    draggingRef.current = { card, fromListId: listId };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id);
    requestAnimationFrame(() => { e.target.style.opacity = '0.4'; });
  }
  function onCardDragEnd(e) {
    e.target.style.opacity = '1';
    draggingRef.current = null;
  }
  function onListDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
  async function onListDrop(toListId, e) {
    e.preventDefault();
    const dragData = draggingRef.current;
    if (!dragData) return;
    const { card, fromListId } = dragData;
    if (fromListId === toListId) return;
    const newLists = data.lists.map((l) => ({ ...l, cards: [...l.cards] }));
    const fromList = newLists.find((l) => l.id === fromListId);
    const toList = newLists.find((l) => l.id === toListId);
    const idx = fromList.cards.findIndex((c) => c.id === card.id);
    if (idx >= 0) fromList.cards.splice(idx, 1);
    toList.cards.push({ ...card, listId: toListId });
    setData({ ...data, lists: newLists });
    draggingRef.current = null;
    const res = await fetch(`/api/cards/${card.id}/move`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toListId, toIndex: toList.cards.length - 1 }),
    });
    const result = await res.json();
    if (!res.ok) { showToast(result.error || 'Lỗi di chuyển', 'error'); load(); return; }
    if (result.scoreResult?.scored) showToast(`✓ Đã cộng ${result.scoreResult.points} điểm`, 'success');
  }

  async function addCard(listId, title) {
    if (!title.trim()) return;
    const res = await fetch('/api/cards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ boardId, name, isDone: name.toLowerCase().includes('done') }),
    });
    const d = await res.json();
    if (!res.ok) { showToast(d.error, 'error'); return; }
    setData({ ...data, lists: [...data.lists, d.list] });
  }

  async function deleteList(listId) {
    const list = data.lists.find((l) => l.id === listId);
    if (list.cards.length > 0) { showToast('Cột còn thẻ - hãy di chuyển hoặc xóa thẻ trước', 'error'); return; }
    if (!confirm('Xóa cột này?')) return;
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
            {editingBoardName ? (
              <input autoFocus value={boardNameDraft} onChange={(e) => setBoardNameDraft(e.target.value)}
                onBlur={saveBoardName} onKeyDown={(e) => { if (e.key === 'Enter') saveBoardName(); if (e.key === 'Escape') { setEditingBoardName(false); setBoardNameDraft(board.name); } }}
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 15, fontWeight: 500, padding: '2px 8px', borderRadius: 4, minWidth: 200 }} />
            ) : (
              <span onDoubleClick={() => canManage && setEditingBoardName(true)} title={canManage ? 'Double-click để đổi tên' : ''}
                style={{ cursor: canManage ? 'text' : 'default' }}>{board.name}</span>
            )}
            {canManage && (
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowBoardMenu(!showBoardMenu)}
                  style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>⋯</button>
                {showBoardMenu && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#2e1a55', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, minWidth: 180, zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                    <button onClick={() => { setShowBoardMenu(false); setEditingBoardName(true); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#fff', padding: '10px 14px', fontSize: 12, cursor: 'pointer' }}>✏️ Đổi tên bảng</button>
                    <button onClick={() => { setShowBoardMenu(false); deleteBoard(); }}
                      style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#fca5a5', padding: '10px 14px', fontSize: 12, cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.1)' }}>🗑 Xóa bảng</button>
                  </div>
                )}
              </div>
            )}
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
              onDeleteList={() => deleteList(list.id)}
              onRenameList={(newName) => renameList(list.id, newName)}
              onToggleDone={() => toggleDoneColumn(list.id)}
              canManage={canManage}
            />
          ))}
          <AddListButton onAdd={addList} />
        </div>
      </div>

      {openCardId && <CardModal cardId={openCardId} onClose={() => { setOpenCardId(null); load(); }} me={me} boardMembers={data.members} />}
    </div>
  );
}

function ListColumn({ list, onCardClick, onDrop, onDragOver, onCardDragStart, onCardDragEnd, onAddCard, onDeleteList, onRenameList, onToggleDone, canManage }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(list.name);
  const [showMenu, setShowMenu] = useState(false);
  const isDone = list.isDone === '1';

  function saveName() {
    if (nameDraft.trim() && nameDraft !== list.name) onRenameList(nameDraft.trim());
    else setNameDraft(list.name);
    setEditingName(false);
  }

  return (
    <div onDrop={onDrop} onDragOver={onDragOver}
      style={{ background: 'rgba(15,8,32,0.85)', borderRadius: 8, padding: 6, minWidth: 260, maxWidth: 260, flexShrink: 0, height: 'fit-content', border: isDone ? '2px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px 10px', position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#e5e3f5', display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
          {isDone && <span style={{ fontSize: 11 }}>✓</span>}
          {editingName ? (
            <input autoFocus value={nameDraft} onChange={(e) => setNameDraft(e.target.value)}
              onBlur={saveName} onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') { setNameDraft(list.name); setEditingName(false); } }}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: 13, padding: '2px 6px', borderRadius: 3, flex: 1, minWidth: 0 }} />
          ) : (
            <span onDoubleClick={() => canManage && setEditingName(true)} title={canManage ? 'Double-click để đổi tên' : ''}
              style={{ cursor: canManage ? 'text' : 'default', flex: 1 }}>{list.name}</span>
          )}
          <span style={{ fontSize: 11, opacity: 0.5 }}>{list.cards.length}</span>
        </div>
        {canManage && (
          <>
            <button onClick={() => setShowMenu(!showMenu)}
              style={{ background: 'transparent', border: 'none', color: '#9a8fd0', cursor: 'pointer', fontSize: 14, padding: 2, marginLeft: 4 }}>⋯</button>
            {showMenu && (
              <div style={{ position: 'absolute', top: 28, right: 2, background: '#2e1a55', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, minWidth: 180, zIndex: 30, boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                <button onClick={() => { setShowMenu(false); setEditingName(true); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#fff', padding: '9px 12px', fontSize: 12, cursor: 'pointer' }}>✏️ Đổi tên</button>
                <button onClick={() => { setShowMenu(false); onToggleDone(); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: isDone ? '#fbbf24' : '#86efac', padding: '9px 12px', fontSize: 12, cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  {isDone ? '○ Bỏ cột Done' : '✓ Đánh dấu cột Done'}
                </button>
                <button onClick={() => { setShowMenu(false); onDeleteList(); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', color: '#fca5a5', padding: '9px 12px', fontSize: 12, cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.08)' }}>🗑 Xóa cột</button>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ maxHeight: 'calc(100vh - 220px)', overflowY: 'auto', paddingRight: 2 }}>
        {list.cards.map((card) => (
          <CardItem key={card.id} card={card} onClick={() => onCardClick(card.id)}
            onDragStart={(e) => onCardDragStart(card, list.id, e)} onDragEnd={onCardDragEnd} />
        ))}
      </div>

      {adding ? (
        <div style={{ padding: 6 }}>
          <textarea autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề thẻ..."
            style={{ width: '100%', padding: 8, borderRadius: 4, border: 'none', fontSize: 12, resize: 'vertical', minHeight: 50, boxSizing: 'border-box', fontFamily: 'inherit' }}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAddCard(title); setTitle(''); setAdding(false); } }} />
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button onClick={() => { onAddCard(title); setTitle(''); setAdding(false); }}
              style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer' }}>Thêm</button>
            <button onClick={() => { setAdding(false); setTitle(''); }}
              style={{ background: 'transparent', border: 'none', color: '#9a8fd0', padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>Hủy</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          style={{ width: '100%', background: 'transparent', border: 'none', color: '#9a8fd0', padding: '8px 10px', textAlign: 'left', cursor: 'pointer', fontSize: 12, borderRadius: 4 }}>+ Thêm thẻ</button>
      )}
    </div>
  );
}

function CardItem({ card, onClick, onDragStart, onDragEnd }) {
  const cover = card.coverThumb || card.cover;
  return (
    <div draggable onDragStart={onDragStart} onDragEnd={onDragEnd} onClick={onClick}
      style={{ background: '#fff', borderRadius: 5, padding: 5, marginBottom: 5, cursor: 'grab', color: '#1f1f1f', border: '2px solid transparent' }}>
      {cover && (
        <img src={cover} alt="" loading="lazy"
          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 3, marginBottom: 5, display: 'block' }} />
      )}
      <div style={{ fontSize: 12, lineHeight: 1.4, padding: '1px 3px' }}>{card.title}</div>
      <div style={{ display: 'flex', gap: 8, marginTop: 4, color: '#666', fontSize: 10, alignItems: 'center', padding: '0 3px 2px' }}>
        {card.attachmentCount > 0 && <span>📎 {card.attachmentCount}</span>}
        {card.scored === '1' && <span style={{ color: '#10b981', fontWeight: 500 }}>✓ Đã chấm</span>}
        {card.designerId && card.scored !== '1' && <span style={{ color: '#f59e0b' }}>👤</span>}
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
      style={{ background: 'rgba(255,255,255,0.08)', border: '1px dashed rgba(255,255,255,0.2)', color: '#fff', padding: '10px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, minWidth: 240, height: 'fit-content', flexShrink: 0 }}>+ Thêm cột</button>
  );
}

function CardModal({ cardId, onClose, me, boardMembers }) {
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scoreLevels, setScoreLevels] = useState([]);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => { load(); loadScoreLevels(); }, [cardId]);

  async function load() {
    try {
      const res = await fetch(`/api/cards/${cardId}`);
      const d = await res.json();
      setCard(d);
    } finally { setLoading(false); }
  }

  async function loadScoreLevels() {
    try {
      const res = await fetch('/api/admin/score-levels');
      if (res.ok) { const d = await res.json(); setScoreLevels(d.levels || []); }
    } catch {}
  }

  async function updateField(field, value) {
    const res = await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    const d = await res.json();
    if (!res.ok) { alert(d.error); return; }
    await load();
  }

  async function deleteCard() {
    if (!confirm('Xóa thẻ này? Toàn bộ ảnh cũng sẽ bị xóa.')) return;
    const res = await fetch(`/api/cards/${cardId}`, { method: 'DELETE' });
    if (res.ok) onClose();
  }

  async function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        e.preventDefault();
        const blob = item.getAsFile();
        uploadInBackground(blob);
        return;
      }
    }
  }

  async function handleDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files?.length) return;
    for (const file of files) {
      if (file.type.startsWith('image/')) uploadInBackground(file);
    }
  }

  async function uploadInBackground(blob) {
    const MAX = 15 * 1024 * 1024;
    if (blob.size > MAX) {
      alert(`Ảnh quá lớn (${(blob.size / 1024 / 1024).toFixed(1)}MB). Tối đa 15MB.`);
      return;
    }

    const tempId = 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const previewUrl = URL.createObjectURL(blob);

    setUploadQueue((q) => [...q, { tempId, previewUrl, progress: 0, name: blob.name || 'pasted-image' }]);

    try {
      let uploadBlob = blob;
      if (blob.size > 500 * 1024) {
        try {
          uploadBlob = await resizeImageClient(blob, 2400, 0.85);
        } catch (err) {
          console.warn('Resize failed, upload original:', err);
          uploadBlob = blob;
        }
      }

      const fd = new FormData();
      fd.append('file', uploadBlob, (blob.name || 'image').replace(/\.[^.]+$/, '') + '.webp');
      fd.append('cardId', cardId);

      const xhr = new XMLHttpRequest();
      const promise = new Promise((resolve, reject) => {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadQueue((q) => q.map((u) => u.tempId === tempId ? { ...u, progress } : u));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(xhr.responseText));
        };
        xhr.onerror = () => reject(new Error('Lỗi mạng'));
        xhr.open('POST', '/api/upload');
        xhr.send(fd);
      });

      await promise;
      URL.revokeObjectURL(previewUrl);
      setUploadQueue((q) => q.filter((u) => u.tempId !== tempId));
      await load();
    } catch (e) {
      URL.revokeObjectURL(previewUrl);
      setUploadQueue((q) => q.map((u) => u.tempId === tempId ? { ...u, error: true } : u));
      setTimeout(() => setUploadQueue((q) => q.filter((u) => u.tempId !== tempId)), 4000);
      console.error('Upload error:', e);
    }
  }

  async function deleteAttachment(attId) {
    if (!confirm('Xóa ảnh này?')) return;
    const res = await fetch('/api/upload', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attId }),
    });
    if (res.ok) await load();
    else alert('Lỗi xóa ảnh');
  }

  async function setAsCover(attId) {
    const res = await fetch('/api/upload/set-cover', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attId, cardId }),
    });
    if (res.ok) await load();
  }

  if (loading || !card) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div style={{ color: '#fff' }}>Đang tải...</div>
    </div>
  );

  const c = card.card;
  const attachments = card.attachments || [];

  return (
    <>
    <div onClick={onClose} onPaste={handlePaste}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, padding: 30, overflow: 'auto' }}>
      <div onClick={(e) => e.stopPropagation()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
        style={{ background: '#f5f5f5', borderRadius: 10, width: '100%', maxWidth: 760, color: '#1f1f1f', overflow: 'hidden' }}>

        {c.cover && (
          <div style={{ height: 200, position: 'relative', background: '#e4e4e7' }}>
            <img src={c.cover} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={() => updateField('cover', '')}
              style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 }}>× Xóa ảnh bìa</button>
          </div>
        )}

        <div style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
          <div>
            <input value={c.title} onChange={(e) => setCard({...card, card:{...c, title: e.target.value}})}
              onBlur={() => updateField('title', c.title)}
              style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 17, fontWeight: 500, color: '#1f1f1f', padding: 0, marginBottom: 12, boxSizing: 'border-box' }} />

            <div style={{ border: '2px dashed #6366f1', borderRadius: 8, padding: 14, textAlign: 'center', marginBottom: 14, background: '#eef2ff' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>📎</div>
              <div style={{ fontSize: 13, color: '#4338ca', fontWeight: 500, marginBottom: 2 }}>Paste ảnh (Ctrl+V), kéo-thả, hoặc chọn file</div>
              <div style={{ fontSize: 11, color: '#6366f1', marginBottom: 6 }}>Tối đa 15MB · Tự động nén + upload nền</div>
              <input type="file" accept="image/*" multiple onChange={(e) => {
                const files = Array.from(e.target.files || []);
                files.forEach((f) => uploadInBackground(f));
                e.target.value = '';
              }} style={{ fontSize: 11 }} />
            </div>

            {(uploadQueue.length > 0 || attachments.length > 0) && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 6 }}>
                  📎 Ảnh đính kèm ({attachments.length}{uploadQueue.length > 0 ? ` · ${uploadQueue.length} đang upload` : ''})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 6 }}>
                  {uploadQueue.map((u) => (
                    <div key={u.tempId} style={{ position: 'relative', aspectRatio: '1', background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid #c7d2fe' }}>
                      <img src={u.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: u.error ? 0.3 : 0.7 }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.15)' }}>
                        {u.error ? (
                          <div style={{ background: '#ef4444', color: '#fff', fontSize: 10, padding: '3px 8px', borderRadius: 4 }}>Lỗi upload</div>
                        ) : (
                          <div style={{ background: 'rgba(255,255,255,0.95)', padding: '4px 8px', borderRadius: 10, fontSize: 10, fontWeight: 500, color: '#4338ca' }}>
                            ⏳ {u.progress}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {attachments.map((att) => (
                    <div key={att.id} style={{ position: 'relative', aspectRatio: '1', background: '#fff', borderRadius: 6, overflow: 'hidden', border: '1px solid #e4e4e7' }}>
                      <img src={att.thumbUrl} alt={att.name} loading="lazy"
                        onClick={() => setLightbox(att.url)}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '16px 4px 4px', display: 'flex', gap: 2 }}>
                        <button onClick={() => setAsCover(att.id)} title="Đặt làm ảnh bìa"
                          style={{ flex: 1, background: 'rgba(255,255,255,0.9)', border: 'none', padding: '3px', borderRadius: 3, fontSize: 10, cursor: 'pointer' }}>🖼</button>
                        <button onClick={() => deleteAttachment(att.id)} title="Xóa"
                          style={{ flex: 1, background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', padding: '3px', borderRadius: 3, fontSize: 10, cursor: 'pointer' }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
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
                    {(boardMembers || []).map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#71717a' }}>Mức điểm</label>
                  <select value={c.scoreLevel || ''} onChange={(e) => updateField('scoreLevel', e.target.value)}
                    style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #d4d4d8', fontSize: 12, marginTop: 2, color: '#1f1f1f' }}>
                    <option value="">-- Chọn mức --</option>
                    {scoreLevels.map((lv) => (<option key={lv.id} value={lv.id}>{lv.name} ({lv.points}đ)</option>))}
                  </select>
                </div>
              </div>
              {c.scored === '1' && (
                <div style={{ marginTop: 8, background: '#f0fdf4', color: '#166534', padding: '6px 10px', borderRadius: 4, fontSize: 11 }}>
                  ✓ Đã tính điểm tháng {c.scoredMonth}
                </div>
              )}
              {c.scored !== '1' && (
                <div style={{ marginTop: 6, fontSize: 11, color: '#71717a' }}>💡 Kéo thẻ vào cột "Done" sẽ tự động tính điểm</div>
              )}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 8 }}>📋 Thông tin</div>
            <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4 }}>Tạo: {new Date(Number(c.createdAt)).toLocaleString('vi-VN')}</div>
            <div style={{ fontSize: 11, color: '#71717a', marginBottom: 14 }}>ID: {c.id.slice(-8)}</div>

            <button onClick={deleteCard}
              style={{ width: '100%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#991b1b', padding: '6px 12px', borderRadius: 4, fontSize: 12, cursor: 'pointer', marginBottom: 14 }}>🗑 Xóa thẻ này</button>

            <div style={{ fontSize: 12, fontWeight: 500, color: '#52525b', marginBottom: 8 }}>📜 Hoạt động</div>
            <div style={{ fontSize: 11, color: '#71717a', maxHeight: 180, overflowY: 'auto' }}>
              {card.activity?.slice(0, 10).map((a, i) => (
                <div key={i} style={{ padding: '4px 0', borderBottom: '0.5px solid #e4e4e7' }}>
                  <b>{a.action}</b> · {new Date(a.at).toLocaleString('vi-VN')}
                </div>
              )) || <div style={{ color: '#a1a1aa' }}>Chưa có hoạt động</div>}
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 22px', borderTop: '1px solid #e4e4e7', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: '#71717a' }}>Tip: <b>Ctrl+V</b> hoặc kéo-thả ảnh · Upload nền tự động</div>
          <button onClick={onClose}
            style={{ background: '#6366f1', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 5, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Đóng</button>
        </div>
      </div>
    </div>

    {lightbox && (
      <div onClick={() => setLightbox(null)}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, cursor: 'zoom-out', padding: 20 }}>
        <img src={lightbox} alt="" style={{ maxWidth: '95%', maxHeight: '95%', objectFit: 'contain' }} />
      </div>
    )}
    </>
  );
}
