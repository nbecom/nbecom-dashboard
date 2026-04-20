// ============================================================
// AUTH HELPERS - Session + Feature Gate
// ============================================================

import { NextResponse } from 'next/server';
import { redis, getUser, USER_STATUS, hasFeature } from './nbecom-schema';

export async function getCurrentUser(req) {
  const cookie = req.cookies.get('nb_session');
  if (!cookie?.value) return null;
  const uid = await redis.get(`session:${cookie.value}`);
  if (!uid) return null;
  return await getUser(uid);
}

export async function requireAuth(req) {
  const user = await getCurrentUser(req);
  if (!user) {
    return { error: NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 }) };
  }
  if (user.status !== USER_STATUS.APPROVED) {
    return { error: NextResponse.json({ error: 'Tài khoản chưa được duyệt' }, { status: 403 }) };
  }
  return { user };
}

export async function requireFeature(req, feature) {
  const auth = await requireAuth(req);
  if (auth.error) return auth;

  if (!(await hasFeature(auth.user.id, feature))) {
    return {
      error: NextResponse.json(
        { error: `Không có quyền truy cập tính năng: ${feature}` },
        { status: 403 }
      ),
    };
  }
  return { user: auth.user };
}

export async function requireAdmin(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth;
  if (auth.user.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Chỉ Admin mới có quyền' }, { status: 403 }),
    };
  }
  return { user: auth.user };
}

// Helper chuẩn hóa response lỗi
export function jsonError(msg, code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}

export function jsonOk(data = {}) {
  return NextResponse.json({ ok: true, ...data });
}
