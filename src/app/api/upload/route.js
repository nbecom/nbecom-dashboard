import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { uploadToR2 } from '@/lib/r2-client';
import { requireAuth, jsonError } from '@/lib/auth';
import { genId, redis, logActivity, canEditCard } from '@/lib/nbecom-schema';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_SIZE = 15 * 1024 * 1024;

export async function POST(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const cardId = formData.get('cardId');

    if (!file) return jsonError('Thiếu file');
    if (!cardId) return jsonError('Thiếu cardId');

    if (file.size > MAX_SIZE) {
      return jsonError(`Ảnh quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa 15MB.`);
    }

    if (!(await canEditCard(user.id, cardId))) {
      return jsonError('Không có quyền upload vào card này', 403);
    }

    const card = await redis.hgetall(`card:${cardId}`);
    if (!card?.boardId) return jsonError('Card không tồn tại', 404);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const imageId = genId('img_');
    const ext = 'webp';
    const prefix = `boards/${card.boardId}/${cardId}/${imageId}`;

    const [thumb, medium, full] = await Promise.all([
      sharp(buffer).resize(300, 300, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
      sharp(buffer).resize(1000, 1000, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(),
      sharp(buffer).webp({ quality: 90 }).toBuffer(),
    ]);

    const [thumbUrl, mediumUrl, fullUrl] = await Promise.all([
      uploadToR2(`${prefix}/thumb.${ext}`, thumb, 'image/webp'),
      uploadToR2(`${prefix}/medium.${ext}`, medium, 'image/webp'),
      uploadToR2(`${prefix}/full.${ext}`, full, 'image/webp'),
    ]);

    const attId = imageId;
    const attData = {
      cardId,
      boardId: card.boardId,
      url: fullUrl,
      thumbUrl,
      mediumUrl,
      name: file.name || 'image.webp',
      size: String(file.size),
      uploadedBy: user.id,
      uploadedAt: String(Date.now()),
    };

    const pipe = redis.pipeline();
    pipe.hset(`att:${attId}`, attData);
    pipe.sadd(`card:${cardId}:attachments`, attId);
    if (!card.cover) {
      pipe.hset(`card:${cardId}`, { cover: mediumUrl, coverThumb: thumbUrl });
    }
    await pipe.exec();

    await logActivity(cardId, user.id, 'upload_image', { name: file.name, size: file.size });

    return NextResponse.json({
      ok: true,
      attachment: { id: attId, ...attData },
    });
  } catch (e) {
    console.error('Upload error:', e);
    return jsonError('Lỗi upload: ' + e.message, 500);
  }
}

export async function DELETE(req) {
  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const { attId } = await req.json();
    if (!attId) return jsonError('Thiếu attId');

    const att = await redis.hgetall(`att:${attId}`);
    if (!att?.cardId) return jsonError('Không tồn tại', 404);

    if (!(await canEditCard(user.id, att.cardId))) {
      return jsonError('Không có quyền', 403);
    }

    const { deleteFromR2, extractKeyFromUrl } = await import('@/lib/r2-client');
    for (const url of [att.url, att.thumbUrl, att.mediumUrl]) {
      const key = extractKeyFromUrl(url);
      if (key) await deleteFromR2(key);
    }

    const pipe = redis.pipeline();
    pipe.del(`att:${attId}`);
    pipe.srem(`card:${att.cardId}:attachments`, attId);
    const card = await redis.hgetall(`card:${att.cardId}`);
    if (card?.cover === att.mediumUrl) {
      pipe.hset(`card:${att.cardId}`, { cover: '', coverThumb: '' });
    }
    await pipe.exec();

    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError('Lỗi xóa: ' + e.message, 500);
  }
}
