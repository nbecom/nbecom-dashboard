import { NextResponse } from 'next/server';
import { redis, canEditCard } from '@/lib/nbecom-schema';
import { requireAuth, jsonError } from '@/lib/auth';

export async function POST(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;

  const { attId, cardId } = await req.json();
  if (!attId || !cardId) return jsonError('Thiếu attId hoặc cardId');

  if (!(await canEditCard(auth.user.id, cardId))) {
    return jsonError('Không có quyền', 403);
  }

  const att = await redis.hgetall(`att:${attId}`);
  if (!att?.mediumUrl) return jsonError('Attachment không tồn tại', 404);

  await redis.hset(`card:${cardId}`, {
    cover: att.mediumUrl,
    coverThumb: att.thumbUrl,
  });

  return NextResponse.json({ ok: true });
}
