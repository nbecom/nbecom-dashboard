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

    if (action === 'setup') {
      const { username, password, fullName } = body;
      if (!username || !password) return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 });
      const adminExists = await redis.get('admin_exists');
      if (adminExists) return NextResponse.json({ error: 'Admin đã được tạo rồi' }, { status: 400 });
      const hashedPw = await hashPassword(password);
      const user = { username, password: hashedPw, fullName: fullName || username, role: 'admin', status: 'active', createdAt: new Date().toISOString() };
      await redis.set(`user:${username}`, JSON.stringify(user));
      await redis.set('admin_exists', 'true');
      await redis.lpush('users_list', username);
      const token = generateToken();
      await redis.set(`session:${token}`, JSON.stringify({ username, role: 'admin', fullName: user.fullName }), { ex: 86400 * 7 });
      return NextResponse.json({ success: true, token, user: { username, role: 'admin', fullName: user.fullName, status: 'active' } });
    }

    if (action === 'register') {
      const { username, password, fullName } = body;
      if (!username || !password || !fullName) return NextResponse.json({ error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
      if (username.length < 3) return NextResponse.json({ error: 'Username tối thiểu 3 ký tự' }, { status: 400 });
      if (password.length < 6) return NextResponse.json({ error: 'Mật khẩu tối thiểu 6 ký tự' }, { status: 400 });
      const existing = await redis.get(`user:${username}`);
      if (existing) return NextResponse.json({ error: 'Username đã tồn tại' }, { status: 400 });
      const hashedPw = await hashPassword(password);
      const user = { username, password: hashedPw, fullName, role: 'pending', status: 'pending', createdAt: new Date().toISOString() };
      await redis.set(`user:${username}`, JSON.stringify(user));
      await redis.lpush('users_list', username);
      return NextResponse.json({ success: true, message: 'Đăng ký thành công! Vui lòng chờ Admin duyệt tài khoản.' });
    }

    if (action === 'login') {
      const { username, password } = body;
      if (!username || !password) return NextResponse.json({ error: 'Vui lòng nhập username và mật khẩu' }, { status: 400 });
      const userData = await redis.get(`user:${username}`);
      if (!userData) return NextResponse.json({ error: 'Username không tồn tại' }, { status: 401 });
      const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
      const hashedPw = await hashPassword(password);
      if (user.password !== hashedPw) return NextResponse.json({ error: 'Mật khẩu không đúng' }, { status: 401 });
      if (user.status === 'pending') return NextResponse.json({ error: 'Tài khoản đang chờ Admin duyệt.' }, { status: 403 });
      if (user.status === 'blocked') return NextResponse.json({ error: 'Tài khoản đã bị khóa.' }, { status: 403 });
      const token = generateToken();
      await redis.set(`session:${token}`, JSON.stringify({ username, role: user.role, fullName: user.fullName, shops: user.shops || [] }), { ex: 86400 * 7 });
      return NextResponse.json({ success: true, token, user: { username, role: user.role, fullName: user.fullName, status: user.status, shops: user.shops || [] } });
    }

    if (action === 'verify') {
      const { token } = body;
      if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 });
      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      const userData = await redis.get(`user:${sessionData.username}`);
      if (userData) { const u = typeof userData === 'string' ? JSON.parse(userData) : userData; sessionData.shops = u.shops || []; }
      return NextResponse.json({ success: true, user: sessionData });
    }

    if (action === 'getUsers') {
      const { token } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      if (sessionData.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      const usernames = await redis.lrange('users_list', 0, -1);
      const users = [];
      for (const uname of usernames) {
        const userData = await redis.get(`user:${uname}`);
        if (userData) { const u = typeof userData === 'string' ? JSON.parse(userData) : userData; users.push({ username: u.username, fullName: u.fullName, role: u.role, status: u.status, createdAt: u.createdAt, shops: u.shops || [] }); }
      }
      return NextResponse.json({ success: true, users });
    }

    if (action === 'updateUser') {
      const { token, targetUsername, newRole, newStatus, newShops } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      if (sessionData.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      const userData = await redis.get(`user:${targetUsername}`);
      if (!userData) return NextResponse.json({ error: 'User không tồn tại' }, { status: 404 });
      const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
      if (newRole) user.role = newRole;
      if (newStatus) user.status = newStatus;
      if (newShops !== undefined) user.shops = newShops;
      await redis.set(`user:${targetUsername}`, JSON.stringify(user));
      return NextResponse.json({ success: true, message: 'Cập nhật thành công' });
    }

    if (action === 'deleteUser') {
      const { token, targetUsername } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      if (sessionData.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      await redis.del(`user:${targetUsername}`);
      await redis.lrem('users_list', 0, targetUsername);
      return NextResponse.json({ success: true, message: 'Đã xóa user' });
    }

    if (action === 'logout') {
      const { token } = body;
      if (token) await redis.del(`session:${token}`);
      return NextResponse.json({ success: true });
    }

    if (action === 'checkSetup') {
      const adminExists = await redis.get('admin_exists');
      return NextResponse.json({ adminExists: !!adminExists });
    }

    // ====== SAVE/LOAD ORDERS TO REDIS (MỚI v5) ======
    if (action === 'saveOrders') {
      const { token, orders, shop, month } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      if (sessionData.role !== 'admin' && sessionData.role !== 'manager') return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      const key = `orders:${shop}:${month}`;
      await redis.set(key, JSON.stringify(orders));
      // Track which shop/months exist
      await redis.sadd('order_keys', key);
      return NextResponse.json({ success: true, message: `Đã lưu ${orders.length} đơn` });
    }

    if (action === 'loadOrders') {
      const { token } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      const keys = await redis.smembers('order_keys');
      const allOrders = [];
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const orders = typeof data === 'string' ? JSON.parse(data) : data;
          allOrders.push(...orders);
        }
      }
      // Filter by user shops if not admin
      const filtered = sessionData.role === 'admin' ? allOrders : allOrders.filter(o => (sessionData.shops || []).includes(o.shop));
      return NextResponse.json({ success: true, orders: filtered });
    }

    if (action === 'saveStatement') {
      const { token, stmtData, month } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      await redis.set(`stmt:${month}`, JSON.stringify(stmtData));
      await redis.sadd('stmt_keys', `stmt:${month}`);
      return NextResponse.json({ success: true });
    }

    if (action === 'loadStatements') {
      const { token } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const keys = await redis.smembers('stmt_keys');
      let merged = { orderNet: {}, totalAds: 0, totalFees: 0, totalTax: 0, totalVAT: 0, totalSales: 0 };
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const s = typeof data === 'string' ? JSON.parse(data) : data;
          merged.totalAds += s.totalAds || 0;
          merged.totalFees += s.totalFees || 0;
          merged.totalTax += s.totalTax || 0;
          merged.totalVAT += s.totalVAT || 0;
          merged.totalSales += s.totalSales || 0;
          merged.orderNet = { ...merged.orderNet, ...(s.orderNet || {}) };
        }
      }
      return NextResponse.json({ success: true, stmtData: merged });
    }

    if (action === 'saveImages') {
      const { token, images } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      await redis.set('product_images', JSON.stringify(images));
      return NextResponse.json({ success: true });
    }

    if (action === 'loadImages') {
      const { token } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const data = await redis.get('product_images');
      return NextResponse.json({ success: true, images: data ? (typeof data === 'string' ? JSON.parse(data) : data) : {} });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
  }
}
