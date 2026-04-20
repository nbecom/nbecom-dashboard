import { NextResponse } from 'next/server';
import { redis, genId } from '@/lib/nbecom-schema';
import { requireAuth, jsonError } from '@/lib/auth';

export async function GET(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const boardIds = (await redis.smembers(`user:${user.id}:boards`)) || [];

  if (boardIds.length === 0) {
    return NextResponse.json({ boards: [] });
  }

  const pipe = redis.pipeline();
  boardIds.forEach((bid) => {
    pipe.hgetall(`board:${bid}`);
    pipe.hget(`board:${bid}:members`, user.id);
    pipe.llen(`board:${bid}:lists`);
  });
  const results = await pipe.exec();

  const boards = [];
  for (let i = 0; i < boardIds.length; i++) {
    const bid = boardIds[i];
    const board = results[i * 3];
    const role = results[i * 3 + 1];
    const listCount = results[i * 3 + 2] || 0;
    if (!board?.name) continue;
    boards.push({
      id: bid,
      ...board,
      myRole: role,
      listCount,
    });
  }

  boards.sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));

  return NextResponse.json({ boards });
}

export async function POST(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const body = await req.json();
  const { name, bg, icon } = body;
  if (!name?.trim()) return jsonError('Thiếu tên bảng');

  const bid = genId('b_');
  const now = Date.now();

  const boardData = {
    id: bid,
    name: name.trim(),
    bg: bg || '#378ADD',
    icon: icon || '📋',
    createdBy: user.id,
    createdAt: String(now),
  };

  const defaultLists = ['Chưa làm', 'Đang làm', 'Fix', 'Done'];
  const listIds = defaultLists.map(() => genId('l_'));

  const pipe = redis.pipeline();
  pipe.hset(`board:${bid}`, boardData);
  pipe.sadd('boards:all', bid);
  pipe.hset(`board:${bid}:members`, { [user.id]: 'owner' });
  pipe.sadd(`user:${user.id}:boards`, bid);

  defaultLists.forEach((lname, i) => {
    const lid = listIds[i];
    pipe.hset(`list:${lid}`, {
      id: lid,
      boardId: bid,
      name: lname,
      isDone: lname === 'Done' ? '1' : '0',
      createdAt: String(now),
    });
    pipe.rpush(`board:${bid}:lists`, lid);
  });

  await pipe.exec();

  return NextResponse.json({ ok: true, board: { id: bid, ...boardData } });
}
