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
      const { token, stmtData, month, shop } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const key = shop ? `stmt:${shop}:${month}` : `stmt:${month}`;
      await redis.set(key, JSON.stringify(stmtData));
      await redis.sadd('stmt_keys', key);
      return NextResponse.json({ success: true });
    }

    if (action === 'loadStatements') {
      const { token } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const keys = await redis.smembers('stmt_keys');
      let merged = { orderNet: {}, totalAds: 0, totalFees: 0, totalTax: 0, totalVAT: 0, totalSales: 0 };
      const perShop = {};
      for (const key of keys) {
        const data = await redis.get(key);
        if (data) {
          const s = typeof data === 'string' ? JSON.parse(data) : data;
          merged.totalAds += s.totalAds || 0;
          merged.totalFees += s.totalFees || 0;
          merged.totalTax += s.totalTax || 0;
          merged.totalVAT += s.totalVAT || 0;
          merged.totalSales += s.totalSales || 0;
          if (s.orderNet) Object.assign(merged.orderNet, s.orderNet);
          // Extract shop name from key like "stmt:ShopName:2026-03"
          const parts = key.split(':');
          if (parts.length === 3) {
            const shopName = parts[1];
            if (!perShop[shopName]) perShop[shopName] = { totalAds: 0, totalFees: 0, totalTax: 0, totalVAT: 0, totalSales: 0, orderNet: {} };
            perShop[shopName].totalAds += s.totalAds || 0;
            perShop[shopName].totalFees += s.totalFees || 0;
            perShop[shopName].totalTax += s.totalTax || 0;
            perShop[shopName].totalVAT += s.totalVAT || 0;
            perShop[shopName].totalSales += s.totalSales || 0;
            if (s.orderNet) Object.assign(perShop[shopName].orderNet, s.orderNet);
          }
        }
      }
      return NextResponse.json({ success: true, stmtData: merged, perShopStmt: perShop });
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

    // ====== SHOP MANAGEMENT (MỚI v5.1) ======
    if (action === 'saveShops') {
      const { token, shops } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
      if (sessionData.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 });
      await redis.set('custom_shops', JSON.stringify(shops));
      return NextResponse.json({ success: true });
    }

    if (action === 'loadShops') {
      const { token } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      const data = await redis.get('custom_shops');
      return NextResponse.json({ success: true, shops: data ? (typeof data === 'string' ? JSON.parse(data) : data) : [] });
    }

    // ====== BOOKMARKLET: Auto-import images from Etsy ======
    if (action === 'bookmarkletImages') {
      const { token, images } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // Merge with existing images
      const existing = await redis.get('product_images');
      const existingImages = existing ? (typeof existing === 'string' ? JSON.parse(existing) : existing) : {};
      const merged = { ...existingImages, ...images };
      await redis.set('product_images', JSON.stringify(merged));
      const newCount = Object.keys(images).length;
      const totalCount = Object.keys(merged).length;
      return NextResponse.json({ success: true, message: `+${newCount} ảnh (tổng ${totalCount})`, newCount, totalCount });
    }

    // ====== AUTO SYNC: Fetch images from Etsy public shop page ======
    if (action === 'syncShopImages') {
      const { token, shopUrl } = body;
      const session = await redis.get(`session:${token}`);
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      
      try {
        // Parse shop name from URL
        let shopName = shopUrl;
        const match = shopUrl.match(/shop\/([^/?]+)/);
        if (match) shopName = match[1];
        
        const allImages = {};
        let page = 1;
        let emptyCount = 0;
        
        while (page <= 100 && emptyCount < 3) {
          const url = page === 1 
            ? `https://www.etsy.com/shop/${shopName}` 
            : `https://www.etsy.com/shop/${shopName}?page=${page}`;
          
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          });
          
          if (!res.ok) break;
          const html = await res.text();
          
          // Parse listing images from HTML
          const listingRegex = /\/listing\/(\d+)/g;
          const imgRegex = /https:\/\/i\.etsystatic\.com\/[^"'\s]+/g;
          
          // Find all listing IDs and their images
          const pageImages = {};
          
          // Method 1: Find img tags with etsystatic URLs near listing links
          const chunks = html.split(/\/listing\/(\d+)/);
          for (let i = 1; i < chunks.length; i += 2) {
            const listingId = chunks[i];
            if (allImages[listingId] || pageImages[listingId]) continue;
            
            // Look backwards and forwards for etsystatic image URL
            const context = (chunks[i-1]?.slice(-2000) || '') + chunks[i] + (chunks[i+1]?.slice(0, 2000) || '');
            const imgMatch = context.match(/https:\/\/i\.etsystatic\.com\/\d+\/\d+\/il_[^"'\s)]+\.(jpg|png|webp)/);
            if (imgMatch) {
              let imgUrl = imgMatch[0];
              imgUrl = imgUrl.replace(/il_\d+x\d+/, 'il_570xN');
              pageImages[listingId] = imgUrl;
            }
          }
          
          // Method 2: Find data-listing-id patterns
          const dataListingRegex = /data-listing-id="(\d+)"[^>]*>[\s\S]*?src="(https:\/\/i\.etsystatic\.com\/[^"]+)"/g;
          let dlMatch;
          while ((dlMatch = dataListingRegex.exec(html)) !== null) {
            if (!allImages[dlMatch[1]] && !pageImages[dlMatch[1]]) {
              pageImages[dlMatch[1]] = dlMatch[2].replace(/il_\d+x\d+/, 'il_570xN');
            }
          }
          
          // Method 3: JSON-LD structured data (Etsy embeds this for SEO)
          const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
          let jsonMatch;
          while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
            try {
              const data = JSON.parse(jsonMatch[1]);
              if (data['@type'] === 'ItemList' && data.itemListElement) {
                data.itemListElement.forEach(item => {
                  const itemUrl = item.url || '';
                  const idMatch = itemUrl.match(/\/listing\/(\d+)/);
                  if (idMatch && item.image && !allImages[idMatch[1]] && !pageImages[idMatch[1]]) {
                    let img = Array.isArray(item.image) ? item.image[0] : item.image;
                    if (typeof img === 'object') img = img.url || img.contentUrl;
                    if (img) pageImages[idMatch[1]] = img.replace(/il_\d+x\d+/, 'il_570xN');
                  }
                });
              }
              if (data['@type'] === 'Product' && data.image) {
                const idMatch = (data.url || '').match(/\/listing\/(\d+)/);
                if (idMatch) {
                  let img = Array.isArray(data.image) ? data.image[0] : data.image;
                  if (typeof img === 'object') img = img.url;
                  if (img && !allImages[idMatch[1]]) pageImages[idMatch[1]] = img.replace(/il_\d+x\d+/, 'il_570xN');
                }
              }
            } catch(e) {}
          }
          
          const newOnPage = Object.keys(pageImages).length;
          if (newOnPage === 0) {
            emptyCount++;
          } else {
            emptyCount = 0;
            Object.assign(allImages, pageImages);
          }
          
          page++;
          // Small delay to be respectful
          await new Promise(r => setTimeout(r, 300));
        }
        
        // Merge with existing
        const existing = await redis.get('product_images');
        const existingImages = existing ? (typeof existing === 'string' ? JSON.parse(existing) : existing) : {};
        const merged = { ...existingImages, ...allImages };
        await redis.set('product_images', JSON.stringify(merged));
        
        return NextResponse.json({ 
          success: true, 
          newCount: Object.keys(allImages).length, 
          totalCount: Object.keys(merged).length,
          pages: page - 1,
          message: `Đã lấy ${Object.keys(allImages).length} ảnh từ ${page-1} trang`
        });
      } catch(e) {
        return NextResponse.json({ success: false, error: e.message });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Server error: ' + error.message }, { status: 500 });
  }
}
