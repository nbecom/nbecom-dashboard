// /api/cards/[id]/move/route.js
// POST body: { toListId, toIndex }
import {
  redis,
  canEditBoard,
  logActivity,
  tryAutoScoreCard,
} from '@/lib/nbecom-schema';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth';

export async function POST(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;
  const cid = params.id;

  const body = await req.json();
  const { toListId, toIndex } = body;
  if (!toListId || typeof toIndex !== 'number') {
    return jsonError('Thiếu toListId hoặc toIndex');
  }

  const card = await redis.hgetall(`card:${cid}`);
  if (!card?.boardId) return jsonError('Card không tồn tại', 404);

  if (!(await canEditBoard(user.id, card.boardId))) {
    return jsonError('Không có quyền', 403);
  }

  const toList = await redis.hgetall(`list:${toListId}`);
  if (!toList || toList.boardId !== card.boardId) {
    return jsonError('List đích không hợp lệ', 400);
  }

  const fromListId = card.listId;

  // Xóa khỏi list cũ
  await redis.lrem(`list:${fromListId}:cards`, 1, cid);

  // Chèn vào list mới tại toIndex
  const targetCards = (await redis.lrange(`list:${toListId}:cards`, 0, -1)) || [];
  const idx = Math.max(0, Math.min(toIndex, targetCards.length));
  if (idx === 0) {
    await redis.lpush(`list:${toListId}:cards`, cid);
  } else if (idx >= targetCards.length) {
    await redis.rpush(`list:${toListId}:cards`, cid);
  } else {
    // Chèn giữa: lấy cid tại vị trí idx, rồi dùng linsert BEFORE
    const pivot = targetCards[idx];
    await redis.linsert(`list:${toListId}:cards`, 'BEFORE', pivot, cid);
  }

  // Cập nhật listId trong card
  await redis.hset(`card:${cid}`, { listId: toListId });

  await logActivity(cid, user.id, 'move', {
    fromListId,
    toListId,
    fromListName: (await redis.hget(`list:${fromListId}`, 'name')) || '',
    toListName: toList.name,
  });

  // Auto-score nếu vào cột Done
  let scoreResult = null;
  if (toList.isDone === '1') {
    scoreResult = await tryAutoScoreCard(cid);
  }

  return jsonOk({ scoreResult });
}
