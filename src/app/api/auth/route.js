import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'nbecom_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    // ====== SETUP ADMIN (first time) ======
    if (action === 'setup') {
      const { username, password, fullName } = body;
      if (!username || !password) {
        return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
      }

      const adminExists = await redis.get('admin_exists');
      if (adminExists) {
        return NextResponse.json({ error: 'Admin đã được tạo rồi' }, { status: 400 });
      }

      const hashedPw = await hashPassword(password);
      const user = {
        username,
        password: hashedPw,
        fullName: fullName || username,
        role: 'admin',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      await redis.set(`user:${username}`, JSON.stringify(user));
      await redis.set('admin_exists', 'true');
      await redis.lpush('users_list', username);

      const token = generateToken();
      await redis.set(`session:${token}`, JSON.stringify({ username, role: 'admin', fullName: user.fullName }), { ex: 86400 * 7 });

      return NextResponse.json({ success: true, token, user: { username, role: 'admin', fullName: user.fullName, status: 'active' } });
    }

    // ====== REGISTER ======
    if (action === 'register') {
      const { username, password, fullName } = body;
      if (!username || !password || !fullName) {
        return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
      }

      if (username.length < 3) {
        return NextResponse.json({ error: 'Username tối thiểu 3 ký tự' }, { status: 400 });
      }

      if (password.length < 6) {
        return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 });
      }

      const existing = await redis.get(`user:${username}`);
      if (existing) {
        return NextResponse.json({ error: 'Username đã tồn tại' }, { status: 400 });
      }

      const hashedPw = await hashPassword(password);
      const user = {
        username,
        password: hashedPw,
        fullName,
        role: 'pending',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await redis.set(`user:${username}`, JSON.stringify(user));
      await redis.lpush('users_list', username);

      return NextResponse.json({ success: true, message: 'Đăng ký thành công! Vui lòng chờ Admin duyệt tài khoản.' });
    }

    // ====== LOGIN ======
    if (action === 'login') {
      const { username, password } = body;
      if (!username || !password) {
        return NextResponse.json({ error: 'Vui lòng nhập username và mật khẩu' }, { status: 400 });
      }

      const userData = await redis.get(`user:${username}`);
      if (!userData) {
        return NextResponse.json({ error: 'Username không tồn tại' }, { status: 401 });
      }

      const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
      const hashedPw = await hashPassword(password);

      if (user.password !== hashedPw) {
        return NextResponse.json({ error: 'Mật khẩu không đúng' }, { status: 401 });
      }

      if (user.status === 'pending') {
        return NextResponse.json({ error: 'Tài khoản đang chờ Admin duyệt. Vui lòng liên hệ Admin.' }, { status: 403 });
      }

      if (user.status === 'blocked') {
        return NextResponse.json({ error: 'Tài khoản đã bị khóa. Liên hệ Admin.' }, { status: 403 });
      }

      const token = generateToken();
      await redis.set(`session:${token}`, JSON.stringify({ username, role: user.role, fullName: user.fullName }), { ex: 86400 * 7 });

      return NextResponse.json({ success: true, token, user: { username, role: user.role, fullName: user.fullName, status: user.status } });
    }

    // ====== VERIFY SESSION ======
    if (action === 'verify') {
      const { token } = body;
      if (!token) {
        return NextResponse.json({ error: 'No token' }, { status: 401 });
      }

      const session = await redis.get(`session:${token}`);
      if (!session) {
        return NextResponse.json({ error: 'Session expired' }, { status: 401 });
      }

      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      return NextResponse.json({ success: true, user: sessionData });
    }

    // ====== GET ALL USERS (admin only) ======
    if (action === 'getUsers') {
      const { token } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      if (sessionData.role !== 'admin') {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      }

      const usernames = await redis.lrange('users_list', 0, -1);
      const users = [];

      for (const uname of usernames) {
        const userData = await redis.get(`user:${uname}`);
        if (userData) {
          const u = typeof userData === 'string' ? JSON.parse(userData) : userData;
          users.push({ username: u.username, fullName: u.fullName, role: u.role, status: u.status, createdAt: u.createdAt });
        }
      }

      return NextResponse.json({ success: true, users });
    }

    // ====== UPDATE USER (admin only) ======
    if (action === 'updateUser') {
      const { token, targetUsername, newRole, newStatus } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      if (sessionData.role !== 'admin') {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      }

      const userData = await redis.get(`user:${targetUsername}`);
      if (!userData) {
        return NextResponse.json({ error: 'User không tồn tại' }, { status: 404 });
      }

      const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
      if (newRole) user.role = newRole;
      if (newStatus) user.status = newStatus;

      await redis.set(`user:${targetUsername}`, JSON.stringify(user));

      return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    }

    // ====== DELETE USER (admin only) ======
    if (action === 'deleteUser') {
      const { token, targetUsername } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      if (sessionData.role !== 'admin') {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      }

      await redis.del(`user:${targetUsername}`);
      await redis.lrem('users_list', 0, targetUsername);

      return NextResponse.json({ success: true, message: 'Đã xóa user' });
    }

    // ====== LOGOUT ======
    if (action === 'logout') {
      const { token } = body;
      if (token) {
        await redis.del(`session:${token}`);
      }
      return NextResponse.json({ success: true });
    }

    // ====== CHECK ADMIN EXISTS ======
    if (action === 'checkSetup') {
      const adminExists = await redis.get('admin_exists');
      return NextResponse.json({ adminExists: !!adminExists });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
  }
}
