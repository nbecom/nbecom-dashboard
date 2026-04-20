// ============================================================
// API: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me
// ============================================================

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  redis,
  getUser,
  getUserByEmail,
  genId,
  USER_STATUS,
  SYSTEM_ROLES,
  ROLE_FEATURE_PRESETS,
} from '@/lib/nbecom-schema';
import { getCurrentUser, jsonError, jsonOk } from '@/lib/auth';

function hashPw(pw) {
  return crypto.createHash('sha256').update(pw + 'nbecom_salt_v6').digest('hex');
}

// ---------- POST /api/auth/register ----------
export async function register(req) {
  const body = await req.json();
  const email = (body.email || '').toLowerCase().trim();
  const name = (body.name || '').trim();
  const password = body.password || '';

  if (!email || !name || !password) {
    return jsonError('Thiếu email, tên hoặc mật khẩu');
  }
  if (password.length < 6) {
    return jsonError('Mật khẩu tối thiểu 6 ký tự');
  }

  const existed = await getUserByEmail(email);
  if (existed) return jsonError('Email đã tồn tại', 409);

  const uid = genId('u_');
  const isFirstUser = (await redis.scard('users:all')) === 0;

  const userData = {
    email,
    name,
    password: hashPw(password),
    // User đầu tiên tự động là Admin đã duyệt
    role: isFirstUser ? SYSTEM_ROLES.ADMIN : SYSTEM_ROLES.DESIGNER,
    status: isFirstUser ? USER_STATUS.APPROVED : USER_STATUS.PENDING,
    features: JSON.stringify(
      isFirstUser ? ROLE_FEATURE_PRESETS.admin : []
    ),
    createdAt: String(Date.now()),
    avatar: name.slice(0, 2).toUpperCase(),
  };

  const pipe = redis.pipeline();
  pipe.hset(`user:${uid}`, userData);
  pipe.set(`email:${email}`, uid);
  pipe.sadd('users:all', uid);
  if (!isFirstUser) pipe.sadd('users:pending', uid);
  await pipe.exec();

  return jsonOk({
    message: isFirstUser
      ? 'Đăng ký thành công! Bạn là Admin đầu tiên.'
      : 'Đăng ký thành công! Vui lòng chờ Admin duyệt tài khoản.',
    pending: !isFirstUser,
  });
}

// ---------- POST /api/auth/login ----------
export async function login(req) {
  const body = await req.json();
  const email = (body.email || '').toLowerCase().trim();
  const password = body.password || '';
  if (!email || !password) return jsonError('Thiếu email hoặc mật khẩu');

  const uid = await redis.get(`email:${email}`);
  if (!uid) return jsonError('Email hoặc mật khẩu sai', 401);

  const user = await redis.hgetall(`user:${uid}`);
  if (!user || user.password !== hashPw(password)) {
    return jsonError('Email hoặc mật khẩu sai', 401);
  }

  if (user.status === USER_STATUS.PENDING) {
    return jsonError('Tài khoản chưa được Admin duyệt', 403);
  }
  if (user.status === USER_STATUS.DISABLED) {
    return jsonError('Tài khoản đã bị vô hiệu hóa', 403);
  }

  // Tạo session
  const token = crypto.randomBytes(32).toString('hex');
  await redis.set(`session:${token}`, uid, { ex: 60 * 60 * 24 * 7 });

  const res = jsonOk({
    user: {
      id: uid,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
    },
  });
  res.cookies.set('nb_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

// ---------- POST /api/auth/logout ----------
export async function logout(req) {
  const token = req.cookies.get('nb_session')?.value;
  if (token) await redis.del(`session:${token}`);
  const res = jsonOk();
  res.cookies.delete('nb_session');
  return res;
}

// ---------- GET /api/auth/me ----------
export async function me(req) {
  const user = await getCurrentUser(req);
  if (!user) return jsonError('Chưa đăng nhập', 401);
  const { password, ...safe } = user;
  return NextResponse.json({ user: safe });
}
