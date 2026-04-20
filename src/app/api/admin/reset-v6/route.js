// ============================================================
// /api/admin/reset-v6/route.js
// API AN TOÀN - chỉ xóa data v6.0 bị hỏng
// KHÔNG động đến data v5.7 (basecost, orders, shops, etc.)
// ============================================================

import { NextResponse } from 'next/server';
import { redis } from '@/lib/nbecom-schema';

// Bí mật key để bảo vệ endpoint này - chỉ Bin biết
const RESET_SECRET = 'nbecom-reset-v6-2026';

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  if (body.secret !== RESET_SECRET) {
    return NextResponse.json({ error: 'Sai secret key' }, { status: 403 });
  }

  const deleted = {
    users: 0,
    emails: 0,
    sessions: 0,
    userBoards: 0,
    boards: 0,
    lists: 0,
    cards: 0,
    attachments: 0,
    scores: 0,
    scoreLevels: 0,
    pending: 0,
    misc: 0,
  };

  try {
    // 1. Lấy tất cả user IDs v6.0
    const userIds = (await redis.smembers('users:all')) || [];

    // 2. Xóa từng user + email mapping
    for (const uid of userIds) {
      const user = await redis.hgetall(`user:${uid}`);
      if (user?.email) {
        await redis.del(`email:${user.email}`);
        deleted.emails++;
      }
      await redis.del(`user:${uid}`);
      await redis.del(`user:${uid}:boards`);
      deleted.users++;

      // Xóa score cả tháng này và tháng trước (an toàn)
      const now = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        await redis.del(`score:${uid}:${mk}`);
        await redis.del(`score:${uid}:${mk}:total`);
      }
      deleted.scores++;
    }

    // 3. Xóa index set
    await redis.del('users:all');
    await redis.del('users:pending');
    deleted.pending++;

    // 4. Xóa tất cả boards + lists + cards
    const boardIds = (await redis.smembers('boards:all')) || [];
    for (const bid of boardIds) {
      const listIds = (await redis.lrange(`board:${bid}:lists`, 0, -1)) || [];
      for (const lid of listIds) {
        const cardIds = (await redis.lrange(`list:${lid}:cards`, 0, -1)) || [];
        for (const cid of cardIds) {
          await redis.del(`card:${cid}`);
          await redis.del(`card:${cid}:attachments`);
          await redis.del(`card:${cid}:members`);
          await redis.del(`card:${cid}:lockedTo`);
          await redis.del(`card:${cid}:comments`);
          await redis.del(`card:${cid}:activity`);
          deleted.cards++;
        }
        await redis.del(`list:${lid}`);
        await redis.del(`list:${lid}:cards`);
        deleted.lists++;
      }
      await redis.del(`board:${bid}`);
      await redis.del(`board:${bid}:lists`);
      await redis.del(`board:${bid}:members`);
      deleted.boards++;
    }
    await redis.del('boards:all');

    // 5. Xóa score levels
    await redis.del('scorelevels');
    deleted.scoreLevels = 1;

    // 6. Session không xóa được hết vì không biết token
    //    Nhưng không sao - session sẽ hết hạn sau 7 ngày hoặc đè khi login lại

    return NextResponse.json({
      ok: true,
      message: '✓ Đã xóa sạch data v6.0. Data v5.7 của bạn KHÔNG bị ảnh hưởng.',
      deleted,
      nextStep: 'Đăng ký lại tài khoản admin qua /api/auth/register',
    });
  } catch (e) {
    return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
  }
}
