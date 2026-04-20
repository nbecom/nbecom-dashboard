// /api/cards/[id]/route.js
import { NextResponse } from 'next/server';
import {
  redis,
  canViewCard,
  canEditCard,
  canEditBoard,
  logActivity,
  tryAutoScoreCard,
  canScore,
} from '@/lib/nbecom-schema';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth';

// GET /api/cards/:id
export async function GET(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;
  const cid = params.id;

  if (!(await canViewCard(user.id, cid))) {
    return jsonError('Không có quyền xem thẻ này', 403);
  }

  const card = await redis.hgetall(`card:${cid}`);
  if (!card?.title) return jsonError('Không tồn tại', 404);

  const attIds = await redis.smembers(`card:${cid}:attachments`);
  const attachments = await Promise.all(
    (attIds || []).map(async (aid) => {
      const a = await redis.hgetall(`att:${aid}`);
      return a?.url ? { id: aid, ...a } : null;
    })
  );

  const memberIds = await redis.smembers(`card:${cid}:members`);
  const members = await Promise.all(
    (memberIds || []).map(async (mid) => {
      const u = await redis.hgetall(`user:${mid}`);
      return u?.name ? { id: mid, name: u.name, avatar: u.avatar } : null;
    })
  );

  const lockedTo = await redis.smembers(`card:${cid}:lockedTo`);

  const commentsRaw = await redis.lrange(`card:${cid}:comments`, 0, -1);
  const comments = (commentsRaw || [])
    .map((c) => {
      try {
        return typeof c === 'string' ? JSON.parse(c) : c;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  const activityRaw = await redis.lrange(`card:${cid}:activity`, 0, 49);
  const activity = (activityRaw || [])
    .map((a) => {
      try {
        return typeof a === 'string' ? JSON.parse(a) : a;
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return NextResponse.json({
    card: { id: cid, ...card },
    attachments: attachments.filter(Boolean),
    members: members.filter(Boolean),
    lockedTo: lockedTo || [],
    comments,
    activity,
    canEdit: await canEditCard(user.id, cid),
  });
}

// PATCH /api/cards/:id → sửa title/desc/cover/designerId/scoreLevel
export async function PATCH(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;
  const cid = params.id;

  if (!(await canEditCard(user.id, cid))) {
    return jsonError('Không có quyền sửa', 403);
  }

  const body = await req.json();
  const updates = {};
  ['title', 'desc', 'cover'].forEach((k) => {
    if (body[k] !== undefined) updates[k] = body[k];
  });

  // designerId và scoreLevel chỉ Admin/Manager/Sale được sửa
  if (body.designerId !== undefined || body.scoreLevel !== undefined) {
    if (!(await canScore(user.id))) {
      return jsonError('Không có quyền chấm điểm', 403);
    }
    if (body.designerId !== undefined) updates.designerId = body.designerId;
    if (body.scoreLevel !== undefined) updates.scoreLevel = body.scoreLevel;
  }

  if (Object.keys(updates).length === 0) return jsonError('Không có gì để sửa');
  await redis.hset(`card:${cid}`, updates);

  await logActivity(cid, user.id, 'edit', { fields: Object.keys(updates) });

  // Nếu vừa gán designer + scoreLevel xong và card đang ở cột Done → tự chấm
  const card = await redis.hgetall(`card:${cid}`);
  if (card.listId) {
    const list = await redis.hgetall(`list:${card.listId}`);
    if (list?.isDone === '1') await tryAutoScoreCard(cid);
  }

  return jsonOk();
}

// DELETE /api/cards/:id
export async function DELETE(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;
  const cid = params.id;

  const card = await redis.hgetall(`card:${cid}`);
  if (!card?.boardId) return jsonError('Không tồn tại', 404);

  if (!(await canEditBoard(user.id, card.boardId))) {
    return jsonError('Không có quyền xóa', 403);
  }

  const pipe = redis.pipeline();
  pipe.lrem(`list:${card.listId}:cards`, 1, cid);
  pipe.del(`card:${cid}`);
  pipe.del(`card:${cid}:attachments`);
  pipe.del(`card:${cid}:members`);
  pipe.del(`card:${cid}:lockedTo`);
  pipe.del(`card:${cid}:comments`);
  pipe.del(`card:${cid}:activity`);
  await pipe.exec();

  return jsonOk();
}
