// /api/admin/score-levels/route.js
// GET    → list mức điểm
// POST   → tạo/sửa (body: { id?, name, points, color, order })
// DELETE → xóa (body: { id })
import { NextResponse } from 'next/server';
import {
  getScoreLevels,
  setScoreLevel,
  deleteScoreLevel,
  genId,
} from '@/lib/nbecom-schema';
import { requireAdmin, jsonError, jsonOk } from '@/lib/auth';

export async function GET(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const levels = await getScoreLevels();
  return NextResponse.json({ levels });
}

export async function POST(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;

  const body = await req.json();
  const { id, name, points, color, order } = body;
  if (!name || typeof points !== 'number') {
    return jsonError('Thiếu name hoặc points');
  }
  const level = {
    id: id || genId('lv_'),
    name,
    points,
    color: color || '#378ADD',
    order: order ?? 100,
  };
  await setScoreLevel(level);
  return jsonOk({ level });
}

export async function DELETE(req) {
  const auth = await requireAdmin(req);
  if (auth.error) return auth.error;
  const { id } = await req.json();
  if (!id) return jsonError('Thiếu id');
  await deleteScoreLevel(id);
  return jsonOk();
}
