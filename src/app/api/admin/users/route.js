// /api/admin/users/route.js (FIXED v2)
import { NextResponse } from 'next/server';
import {
  redis,
  USER_STATUS,
  SYSTEM_ROLES,
  ROLE_FEATURE_PRESETS,
  parseFeatures,
  serializeFeatures,
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
        features: parseFeatures(u.features),
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
      features: serializeFeatures(f),
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
    if (Array.isArray(features)) updates.features = serializeFeatures(features);
    await redis.hset(`user:${uid}`, updates);
    return jsonOk();
  }

  return jsonError('Action không hợp lệ');
}
