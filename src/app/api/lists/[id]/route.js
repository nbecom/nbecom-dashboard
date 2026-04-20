// /api/lists/[id]/route.js
import { redis, canEditBoard, canManageBoard } from '@/lib/nbecom-schema';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const lid = params.id;
  const list = await redis.hgetall(`list:${lid}`);
  if (!list?.boardId) return jsonError('List không tồn tại', 404);

  if (!(await canEditBoard(user.id, list.boardId))) {
    return jsonError('Không có quyền sửa', 403);
  }

  const body = await req.json();
  const updates = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.isDone !== undefined) updates.isDone = body.isDone ? '1' : '0';

  if (Object.keys(updates).length === 0) return jsonError('Không có gì để sửa');
  await redis.hset(`list:${lid}`, updates);
  return jsonOk();
}

export async function DELETE(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const lid = params.id;
  const list = await redis.hgetall(`list:${lid}`);
  if (!list?.boardId) return jsonError('List không tồn tại', 404);

  if (!(await canManageBoard(user.id, list.boardId))) {
    return jsonError('Chỉ Owner được xóa cột', 403);
  }

  const cardCount = await redis.llen(`list:${lid}:cards`);
  if (cardCount > 0) return jsonError('Di chuyển hết thẻ trước khi xóa cột', 400);

  await redis.del(`list:${lid}`);
  await redis.del(`list:${lid}:cards`);
  await redis.lrem(`board:${list.boardId}:lists`, 1, lid);
  return jsonOk();
}
