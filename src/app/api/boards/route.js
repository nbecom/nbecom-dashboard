// /api/boards/route.js
import { NextResponse } from 'next/server';
import {
  redis,
  genId,
  BOARD_ROLES,
  FEATURES,
  isAdmin,
} from '@/lib/nbecom-schema';
import { requireFeature, jsonError, jsonOk } from '@/lib/auth';

// ---------- GET /api/boards ----------
export async function GET(req) {
  const auth = await requireFeature(req, FEATURES.BOARDS);
  if (auth.error) return auth.error;
  const { user } = auth;

  let bids = [];
  if (await isAdmin(user.id)) {
    bids = await redis.smembers('boards:all');
  } else {
    bids = await redis.smembers(`user:${user.id}:boards`);
  }

  if (!bids?.length) return NextResponse.json({ boards: [] });

  const boards = await Promise.all(
    bids.map(async (bid) => {
      const b = await redis.hgetall(`board:${bid}`);
      if (!b?.name) return null;
      const role = await redis.hget(`board:${bid}:members`, user.id);
      const listCount = await redis.llen(`board:${bid}:lists`);
      return {
        id: bid,
        ...b,
        myRole: (await isAdmin(user.id)) ? BOARD_ROLES.OWNER : role,
        listCount,
      };
    })
  );

  return NextResponse.json({
    boards: boards.filter(Boolean).sort((a, b) => Number(b.createdAt) - Number(a.createdAt)),
  });
}

// ---------- POST /api/boards ----------
export async function POST(req) {
  const auth = await requireFeature(req, FEATURES.BOARDS);
  if (auth.error) return auth.error;
  const { user } = auth;

  // Chỉ Admin/Manager được tạo board
  if (!['admin', 'manager'].includes(user.role)) {
    return jsonError('Chỉ Admin/Manager được tạo board', 403);
  }

  const body = await req.json();
  const name = (body.name || '').trim();
  if (!name) return jsonError('Thiếu tên board');

  const bid = genId('b_');
  const data = {
    name,
    bg: body.bg || '#3C3489',
    icon: body.icon || '📋',
    ownerId: user.id,
    createdAt: String(Date.now()),
  };

  const pipe = redis.pipeline();
  pipe.hset(`board:${bid}`, data);
  pipe.sadd('boards:all', bid);
  pipe.hset(`board:${bid}:members`, { [user.id]: BOARD_ROLES.OWNER });
  pipe.sadd(`user:${user.id}:boards`, bid);
  await pipe.exec();

  // Tạo 4 list mặc định: Chưa làm | Đang làm | Fix | Done
  const defaultLists = [
    { name: 'Chưa làm', isDone: '0' },
    { name: 'Đang làm', isDone: '0' },
    { name: 'Fix', isDone: '0' },
    { name: 'Done', isDone: '1' },
  ];
  const listPipe = redis.pipeline();
  for (let i = 0; i < defaultLists.length; i++) {
    const lid = genId('l_');
    listPipe.hset(`list:${lid}`, {
      boardId: bid,
      name: defaultLists[i].name,
      order: String(i),
      isDone: defaultLists[i].isDone,
    });
    listPipe.rpush(`board:${bid}:lists`, lid);
  }
  await listPipe.exec();

  return jsonOk({ board: { id: bid, ...data } });
}
