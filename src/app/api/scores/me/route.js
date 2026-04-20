// /api/scores/me/route.js
// GET ?month=yyyy-mm → điểm của chính user đang đăng nhập
// GET /api/scores/[uid]?month=yyyy-mm → Admin xem điểm của user khác
import { NextResponse } from 'next/server';
import { getDesignerMonthlyScore, monthKey } from '@/lib/nbecom-schema';
import { requireAuth, jsonError } from '@/lib/auth';

export async function GET(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const mk = searchParams.get('month') || monthKey();

  // Tháng trước để so sánh
  const [y, m] = mk.split('-').map(Number);
  const prevDate = new Date(y, m - 2, 1);
  const prevMk = monthKey(prevDate);

  const current = await getDesignerMonthlyScore(user.id, mk);
  const prev = await getDesignerMonthlyScore(user.id, prevMk);

  return NextResponse.json({
    current,
    previous: prev,
    diff: prev.total > 0 ? Math.round(((current.total - prev.total) / prev.total) * 100) : null,
  });
}
