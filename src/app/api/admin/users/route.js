// /api/admin/users/route.js
// GET  /api/admin/users          → list tất cả user + phân loại pending/approved
// POST /api/admin/users/approve  → duyệt user (body: { uid, role, features })
// POST /api/admin/users/disable  → vô hiệu hóa
// PATCH /api/admin/users/[uid]   → sửa role/features của user đã duyệt
import { NextResponse } from 'next/server';
import {
  redis,
  USER_STATUS,
  SYSTEM_ROLES,
  ROLE_FEATURE_PRESETS,
} from '@/lib/nbecom-schema';
import { requireAdmin, jsonError, jsonOk } from '@/lib/auth';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const allIds = await redis.smembers('users:all');
  const users = await Promise.all(
    (allIds || []).map(async (uid) => {
      const u = await redis.hgetall(`user:${uid}`);
      if (!u?.email) return null;
      const { password, ...safe } = u;
      return {
        id: uid,
        ...safe,
        features: u.features ? JSON.parse(u.features) : [],
      };
    })
  );

  const filtered = users.filter(Boolean);
  return NextResponse.json({
    pending: filtered.filter((u) => u.status === USER_STATUS.PENDING),
    approved: filtered.filter((u) => u.status === USER_STATUS.APPROVED),
    disabled: filtered.filter((u) => u.status === USER_STATUS.DISABLED),
  });
}

// POST /api/admin/users → action = approve | disable | enable | setRole
export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const body = await req.json();
  const { action, uid, role, features } = body;
  if (!action || !uid) return jsonError('Thiếu action hoặc uid');

  const user = await redis.hgetall(`user:${uid}`);
  if (!user?.email) return jsonError('User không tồn tại', 404);

  if (action === 'approve') {
    const r = role || SYSTEM_ROLES.DESIGNER;
    const f = Array.isArray(features) && features.length > 0
      ? features
      : (ROLE_FEATURE_PRESETS[r] || ROLE_FEATURE_PRESETS.designer);

    await redis.hset(`user:${uid}`, {
      status: USER_STATUS.APPROVED,
      role: r,
      features: JSON.stringify(f),
    });
    await redis.srem('users:pending', uid);
    return jsonOk();
  }

  if (action === 'disable') {
    await redis.hset(`user:${uid}`, { status: USER_STATUS.DISABLED });
    return jsonOk();
  }

  if (action === 'enable') {
    await redis.hset(`user:${uid}`, { status: USER_STATUS.APPROVED });
    return jsonOk();
  }

  if (action === 'setRole') {
    const r = role || user.role;
    const updates = { role: r };
    if (Array.isArray(features)) updates.features = JSON.stringify(features);
    await redis.hset(`user:${uid}`, updates);
    return jsonOk();
  }

  return jsonError('Action không hợp lệ');
}
