// /api/boards/[id]/route.js
import { NextResponse } from 'next/server';
import { redis, canViewBoard, canManageBoard } from '@/lib/nbecom-schema';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth';

// GET /api/boards/:id → full board data
export async function GET(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;
  const bid = params.id;

  if (!(await canViewBoard(user.id, bid))) {
    return jsonError('Không có quyền xem board này', 403);
  }

  const board = await redis.hgetall(`board:${bid}`);
  if (!board?.name) return jsonError('Board không tồn tại', 404);

  const listIds = await redis.lrange(`board:${bid}:lists`, 0, -1);
  const lists = await Promise.all(
    (listIds || []).map(async (lid) => {
      const list = await redis.hgetall(`list:${lid}`);
      if (!list?.name) return null;
      const cardIds = await redis.lrange(`list:${lid}:cards`, 0, -1);
      const cards = await Promise.all(
        (cardIds || []).map(async (cid) => {
          const c = await redis.hgetall(`card:${cid}`);
          if (!c?.title) return null;
          const attCount = await redis.scard(`card:${cid}:attachments`);
          return {
            id: cid,
            ...c,
            attachmentCount: attCount,
          };
        })
      );
      return {
        id: lid,
        ...list,
        cards: cards.filter(Boolean),
      };
    })
  );

  // Member list + role của mình
  const membersRaw = await redis.hgetall(`board:${bid}:members`);
  const memberIds = Object.keys(membersRaw || {});
  const members = await Promise.all(
    memberIds.map(async (mid) => {
      const mu = await redis.hgetall(`user:${mid}`);
      return {
        id: mid,
        name: mu?.name,
        email: mu?.email,
        avatar: mu?.avatar,
        role: membersRaw[mid],
      };
    })
  );

  return NextResponse.json({
    board: { id: bid, ...board },
    lists: lists.filter(Boolean),
    members,
    canManage: await canManageBoard(user.id, bid),
  });
}

// DELETE /api/boards/:id
export async function DELETE(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;
  const bid = params.id;

  if (!(await canManageBoard(user.id, bid))) {
    return jsonError('Chỉ Owner được xóa board', 403);
  }

  // Xóa toàn bộ lists + cards liên quan
  const listIds = (await redis.lrange(`board:${bid}:lists`, 0, -1)) || [];
  const pipe = redis.pipeline();
  for (const lid of listIds) {
    const cardIds = (await redis.lrange(`list:${lid}:cards`, 0, -1)) || [];
    for (const cid of cardIds) {
      pipe.del(`card:${cid}`);
      pipe.del(`card:${cid}:attachments`);
      pipe.del(`card:${cid}:members`);
      pipe.del(`card:${cid}:lockedTo`);
      pipe.del(`card:${cid}:comments`);
      pipe.del(`card:${cid}:activity`);
    }
    pipe.del(`list:${lid}`);
    pipe.del(`list:${lid}:cards`);
  }
  pipe.del(`board:${bid}`);
  pipe.del(`board:${bid}:lists`);

  // Xóa khỏi user:{uid}:boards của tất cả member
  const membersRaw = await redis.hgetall(`board:${bid}:members`);
  Object.keys(membersRaw || {}).forEach((mid) => {
    pipe.srem(`user:${mid}:boards`, bid);
  });
  pipe.del(`board:${bid}:members`);
  pipe.srem('boards:all', bid);
  await pipe.exec();

  return jsonOk();
}

// PATCH /api/boards/:id → đổi tên, bg, icon
export async function PATCH(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;
  const bid = params.id;

  if (!(await canManageBoard(user.id, bid))) {
    return jsonError('Chỉ Owner được sửa board', 403);
  }

  const body = await req.json();
  const updates = {};
  ['name', 'bg', 'icon'].forEach((k) => {
    if (body[k] !== undefined) updates[k] = body[k];
  });
  if (Object.keys(updates).length === 0) return jsonError('Không có gì để cập nhật');

  await redis.hset(`board:${bid}`, updates);
  return jsonOk();
}
