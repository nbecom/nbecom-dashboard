// /api/cards/route.js
// POST /api/cards → tạo card
import {
  redis,
  genId,
  canEditBoard,
} from '@/lib/nbecom-schema';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth';

export async function POST(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const body = await req.json();
  const { listId, title } = body;
  if (!listId || !title) return jsonError('Thiếu listId hoặc title');

  const list = await redis.hgetall(`list:${listId}`);
  if (!list?.boardId) return jsonError('List không tồn tại', 404);

  if (!(await canEditBoard(user.id, list.boardId))) {
    return jsonError('Không có quyền', 403);
  }

  const cid = genId('c_');
  const cardData = {
    listId,
    boardId: list.boardId,
    title,
    desc: body.desc || '',
    cover: body.cover || '',
    designerId: body.designerId || '',
    scoreLevel: body.scoreLevel || '',
    scored: '0',
    createdAt: String(Date.now()),
    createdBy: user.id,
  };
  await redis.hset(`card:${cid}`, cardData);
  await redis.rpush(`list:${listId}:cards`, cid);

  // Log
  const { logActivity } = await import('@/lib/nbecom-schema');
  await logActivity(cid, user.id, 'create', { title });

  return jsonOk({ card: { id: cid, ...cardData, attachmentCount: 0 } });
}
