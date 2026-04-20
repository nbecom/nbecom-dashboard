// /api/lists/route.js + /api/lists/[id]/route.js gộp lại
// POST   /api/lists             → tạo list (body: boardId, name, isDone)
// PATCH  /api/lists/[id]        → sửa tên/isDone
// DELETE /api/lists/[id]        → xóa (phải trống cards)
// POST   /api/lists/reorder     → sắp xếp lại (body: boardId, listIds[])

import {
  redis,
  genId,
  canEditBoard,
  canManageBoard,
} from '@/lib/nbecom-schema';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth';

export async function POST(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const body = await req.json();
  const { boardId, name, isDone } = body;
  if (!boardId || !name) return jsonError('Thiếu boardId hoặc name');

  if (!(await canEditBoard(user.id, boardId))) {
    return jsonError('Không có quyền sửa board', 403);
  }

  const lid = genId('l_');
  const order = await redis.llen(`board:${boardId}:lists`);
  await redis.hset(`list:${lid}`, {
    boardId,
    name,
    order: String(order),
    isDone: isDone ? '1' : '0',
  });
  await redis.rpush(`board:${boardId}:lists`, lid);

  return jsonOk({ list: { id: lid, boardId, name, order, isDone: isDone ? '1' : '0', cards: [] } });
}
