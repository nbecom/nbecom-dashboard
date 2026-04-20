import { NextResponse } from 'next/server';
import { redis, canViewBoard, canManageBoard } from '@/lib/nbecom-schema';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth';

export async function GET(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;
  const bid = params.id;

  if (!(await canViewBoard(user.id, bid))) {
    return jsonError('Không có quyền xem board này', 403);
  }

  const [board, listIds, membersRaw] = await Promise.all([
    redis.hgetall(`board:${bid}`),
    redis.lrange(`board:${bid}:lists`, 0, -1),
    redis.hgetall(`board:${bid}:members`),
  ]);

  if (!board?.name) return jsonError('Board không tồn tại', 404);

  const validListIds = listIds || [];
  let lists = [];
  let allCardIds = [];
  let cardIdsByList = {};

  if (validListIds.length > 0) {
    const listPipe = redis.pipeline();
    validListIds.forEach((lid) => {
      listPipe.hgetall(`list:${lid}`);
      listPipe.lrange(`list:${lid}:cards`, 0, -1);
    });
    const listResults = await listPipe.exec();

    for (let i = 0; i < validListIds.length; i++) {
      const lid = validListIds[i];
      const listData = listResults[i * 2];
      const cardIds = listResults[i * 2 + 1] || [];
      if (!listData?.name) continue;
      cardIdsByList[lid] = cardIds;
      allCardIds = allCardIds.concat(cardIds);
      lists.push({ id: lid, ...listData, cards: [] });
    }
  }

  let cardsById = {};
  if (allCardIds.length > 0) {
    const cardPipe = redis.pipeline();
    allCardIds.forEach((cid) => {
      cardPipe.hgetall(`card:${cid}`);
      cardPipe.scard(`card:${cid}:attachments`);
    });
    const cardResults = await cardPipe.exec();

    for (let i = 0; i < allCardIds.length; i++) {
      const cid = allCardIds[i];
      const cardData = cardResults[i * 2];
      const attCount = cardResults[i * 2 + 1] || 0;
      if (!cardData?.title) continue;
      cardsById[cid] = { id: cid, ...cardData, attachmentCount: attCount };
    }
  }

  lists = lists.map((list) => ({
    ...list,
    cards: (cardIdsByList[list.id] || [])
      .map((cid) => cardsById[cid])
      .filter(Boolean),
  }));

  const memberIds = Object.keys(membersRaw || {});
  let members = [];
  if (memberIds.length > 0) {
    const memPipe = redis.pipeline();
    memberIds.forEach((mid) => memPipe.hgetall(`user:${mid}`));
    const memResults = await memPipe.exec();
    members = memberIds.map((mid, i) => {
      const mu = memResults[i];
      return mu?.email ? {
        id: mid,
        name: mu.name,
        email: mu.email,
        avatar: mu.avatar,
        role: membersRaw[mid],
      } : null;
    }).filter(Boolean);
  }

  return NextResponse.json({
    board: { id: bid, ...board },
    lists,
    members,
    canManage: await canManageBoard(user.id, bid),
  });
}

export async function DELETE(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;
  const bid = params.id;

  if (!(await canManageBoard(user.id, bid))) {
    return jsonError('Chỉ Owner được xóa board', 403);
  }

  const listIds = (await redis.lrange(`board:${bid}:lists`, 0, -1)) || [];
  const allCardIds = [];
  if (listIds.length > 0) {
    const cardPipe = redis.pipeline();
    listIds.forEach((lid) => cardPipe.lrange(`list:${lid}:cards`, 0, -1));
    const results = await cardPipe.exec();
    results.forEach((cids) => {
      if (Array.isArray(cids)) allCardIds.push(...cids);
    });
  }

  const pipe = redis.pipeline();
  for (const cid of allCardIds) {
    pipe.del(`card:${cid}`);
    pipe.del(`card:${cid}:attachments`);
    pipe.del(`card:${cid}:members`);
    pipe.del(`card:${cid}:lockedTo`);
    pipe.del(`card:${cid}:comments`);
    pipe.del(`card:${cid}:activity`);
  }
  for (const lid of listIds) {
    pipe.del(`list:${lid}`);
    pipe.del(`list:${lid}:cards`);
  }
  pipe.del(`board:${bid}`);
  pipe.del(`board:${bid}:lists`);

  const membersRaw = await redis.hgetall(`board:${bid}:members`);
  Object.keys(membersRaw || {}).forEach((mid) => {
    pipe.srem(`user:${mid}:boards`, bid);
  });
  pipe.del(`board:${bid}:members`);
  pipe.srem('boards:all', bid);
  await pipe.exec();

  return jsonOk();
}

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
