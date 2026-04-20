// /api/admin/scores/route.js
// GET ?month=yyyy-mm → bảng điểm tất cả designer trong tháng
import { NextResponse } from 'next/server';
import {
  redis,
  getDesignerMonthlyScore,
  monthKey,
  SYSTEM_ROLES,
  USER_STATUS,
} from '@/lib/nbecom-schema';
import { requireAdmin } from '@/lib/auth';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const mk = searchParams.get('month') || monthKey();

  const allIds = await redis.smembers('users:all');
  const rows = [];
  for (const uid of allIds || []) {
    const u = await redis.hgetall(`user:${uid}`);
    if (!u?.email) continue;
    if (u.status !== USER_STATUS.APPROVED) continue;
    // Lấy điểm cho mọi user (không chỉ role designer - vì ai cũng có thể làm design)
    const score = await getDesignerMonthlyScore(uid, mk);
    if (score.total > 0 || u.role === SYSTEM_ROLES.DESIGNER) {
      rows.push({
        id: uid,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        total: score.total,
        count: score.count,
      });
    }
  }

  rows.sort((a, b) => b.total - a.total);

  return NextResponse.json({ month: mk, rows });
}
