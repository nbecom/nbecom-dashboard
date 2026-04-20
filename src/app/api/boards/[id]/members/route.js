// /api/boards/[id]/members/route.js
// GET  → list members hiện tại
// POST → thêm/sửa role member (body: { uid, role })
// DELETE → xóa member (body: { uid })
import { NextResponse } from 'next/server';
import {
  redis,
  canManageBoard,
  BOARD_ROLES,
} from '@/lib/nbecom-schema';
import { requireAuth, jsonError, jsonOk } from '@/lib/auth';

export async function GET(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const bid = params.id;

  if (!(await canManageBoard(auth.user.id, bid))) {
    return jsonError('Không có quyền quản lý board', 403);
  }

  const raw = await redis.hgetall(`board:${bid}:members`);
  const ids = Object.keys(raw || {});
  const members = await Promise.all(
    ids.map(async (mid) => {
      const u = await redis.hgetall(`user:${mid}`);
      return u?.email
        ? {
            id: mid,
            email: u.email,
            name: u.name,
            avatar: u.avatar,
            role: raw[mid],
          }
        : null;
    })
  );
  return NextResponse.json({ members: members.filter(Boolean) });
}

export async function POST(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const bid = params.id;

  if (!(await canManageBoard(auth.user.id, bid))) {
    return jsonError('Không có quyền quản lý board', 403);
  }

  const { uid, role } = await req.json();
  if (!uid || !role) return jsonError('Thiếu uid hoặc role');
  if (!Object.values(BOARD_ROLES).includes(role)) {
    return jsonError('Role không hợp lệ');
  }

  const user = await redis.hgetall(`user:${uid}`);
  if (!user?.email) return jsonError('User không tồn tại', 404);

  await redis.hset(`board:${bid}:members`, { [uid]: role });
  await redis.sadd(`user:${uid}:boards`, bid);
  return jsonOk();
}

export async function DELETE(req, { params }) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const bid = params.id;

  if (!(await canManageBoard(auth.user.id, bid))) {
    return jsonError('Không có quyền', 403);
  }

  const { uid } = await req.json();
  if (!uid) return jsonError('Thiếu uid');

  // Không cho xóa owner cuối cùng
  const role = await redis.hget(`board:${bid}:members`, uid);
  if (role === BOARD_ROLES.OWNER) {
    const allMembers = await redis.hgetall(`board:${bid}:members`);
    const ownerCount = Object.values(allMembers || {}).filter(
      (r) => r === BOARD_ROLES.OWNER
    ).length;
    if (ownerCount <= 1) return jsonError('Không thể xóa Owner cuối cùng', 400);
  }

  await redis.hdel(`board:${bid}:members`, uid);
  await redis.srem(`user:${uid}:boards`, bid);
  return jsonOk();
}
