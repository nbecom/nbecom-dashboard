'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

// ============================================
// API HELPERS
// ============================================
async function authAPI(action, data = {}) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  });
  return res.json();
}

// ============================================
// BASECOST DATABASE (from Bin's file)
// ============================================
const BASECOST_DB = {
  'Phương Nhi': {
    'T-Shirt': { S:[16,19,21], M:[16.5,19.5,21.5], L:[17,20,23.5], XL:[17.5,21.5,24.5], '2XL':[18.5,22.5,26.5], '3XL':[19.5,24.5,26.5], '4XL':[21.5,25.5,27], '5XL':[22,26,27.5] },
    'Sweatshirt': { S:[24,29,31], M:[24,29,31.5], L:[24.5,29.5,32], XL:[26.5,31,35], '2XL':[28.5,32.5,36.5], '3XL':[29,34,37], '4XL':[29.5,35.5,37.5], '5XL':[30,36,38] },
    'Hoodie': { S:[29,33,36], M:[29,33,36.5], L:[29.5,33.5,37], XL:[30.5,34,37.5], '2XL':[31.5,37,39], '3XL':[32,37.5,40], '4XL':[33.5,38,40.5], '5XL':[33.5,38,41] },
    'Quarter Zip': { S:[26,31,33], M:[26,31,33.5], L:[26.5,31.5,34], XL:[28.5,33,37], '2XL':[30.5,34.5,38.5], '3XL':[31,36,39], '4XL':[31.5,37.5,39.5], '5XL':[32,38,40] },
    'Kid Sweatshirt': { S:[18,20,21], M:[18,20,21], L:[18,20,21], XL:[19,21,21.5], '2XL':[20,22.5,23] },
    'Kid Hoodie': { S:[19.5,20.5,21.5], M:[19.5,20.5,21.5], L:[20.5,22.5,23.5], XL:[20.5,22.5,23.5], '2XL':[21,23,24] },
    'Kid T-Shirt': { S:[14,15.5,16], M:[14,15.5,16], L:[14,15.5,16], XL:[15.5,16.5,17.5], '2XL':[15.5,16.5,17.5] },
    'Embroidered Cap': { 'Free size':[14,19,19] }, 'Wash Hat': { 'Free size':[14,19,19] }, 'Trucker Hat': { 'Free size':[14,19,19] },
  },
  'Pet': {
    'T-Shirt': { S:[15.8,19,21], M:[15.8,19.5,21.5], L:[15.8,19.5,21.5], XL:[17,21.5,24.5], '2XL':[18,21.5,24.5], '3XL':[18.9,24.5,24.5], '4XL':[20.9,25,25.5], '5XL':[20.9,25,25.5] },
    'Sweatshirt': { S:[23.9,29,31.5], M:[23.9,29,31.5], L:[23.9,29,31.5], XL:[23.9,30,35.5], '2XL':[26.9,30,35.5], '3XL':[28.9,33,35.5], '4XL':[28.9,33,36.5], '5XL':[28.9,33,36.5] },
    'Hoodie': { S:[27.9,32,35.5], M:[27.9,32,35.5], L:[27.9,32,35.5], XL:[27.9,32,35.5], '2XL':[29.9,37,38.5], '3XL':[31.9,37,38.5], '4XL':[31.9,37,38.5], '5XL':[31.9,37,38.5] },
    'Quarter Zip': { S:[25.9,31,33.5], M:[25.9,31,33.5], L:[25.9,31,33.5], XL:[25.9,32,37.5], '2XL':[28.9,32,37.5], '3XL':[30.9,35,37.5], '4XL':[30.9,35,38.5], '5XL':[30.9,35,38.5] },
    'Baby Tee': { S:[15.8,19,21], M:[15.8,19.5,21.5], L:[15.8,19.5,21.5], XL:[17,21.5,24.5], '2XL':[18,21.5,24.5], '3XL':[18.9,24.5,24.5], '4XL':[20.9,25,25.5], '5XL':[20.9,25,25.5] },
    'Embroidered Cap': { 'Free size':[15,20,20] }, 'Wash Hat': { 'Free size':[15,20,20] }, 'Trucker Hat': { 'Free size':[15,20,20] },
  },
  'Zootop Bear': {
    'Hawaiian Shirt': { _all: 13.71 }, 'Youth Hawaiian Shirt': { _all: 12.02 }, 'Beach Short': { _all: 12.69 },
    'Football Jersey': { _all: 14.61 }, 'Kid Football Jersey': { _all: 11.47 }, 'Linen Shirt': { _all: 15.06 },
    'Baseball Jacket': { _all: 23.98 }, 'Kid Baseball Jacket': { _all: 23.30 }, 'Baseball Shirt': { _all: 13.33 },
    'Kid Baseball Shirt': { _all: 11.27 }, 'Hoodie': { _all: 21.44 }, 'Zip Hoodie': { _all: 21.68 },
    'Sweatshirt': { _all: 16.84 }, 'Kid Hoodie': { _all: 15.28 },
  },
  'TRIO': { 'Keychain 7cm': { _all: 14 }, 'Crochet 12cm': { _all: 15.5 }, 'Crochet 20cm': { _all: 23 }, 'Crochet 30cm': { _all: 32 } },
};

const SHOPS = [
  { name: 'QuinnCreativeDesign', type: 'Vật lý' }, { name: 'ThiHoaEmbroidery', type: 'Vật lý' },
  { name: 'Moyerpeters', type: 'Vật lý' }, { name: 'NDAHandmadeEMB', type: 'Vật lý' },
  { name: 'EmbroideryTVT', type: 'Vật lý' }, { name: 'TonyHungGift', type: 'Vật lý' },
  { name: 'EmbroideryAnhThu', type: 'Digital' }, { name: 'EmbroideryTuanAnh', type: 'Digital' },
  { name: 'BumMachineEmbroidery', type: 'Digital' }, { name: 'NINNEmbroidery', type: 'Digital' },
  { name: 'Linhcraftshop', type: 'Digital' },
];

const RATE = 26500;
const ROLES = { admin: 'Admin', manager: 'Manager', designer: 'Designer', sale: 'Sale' };
const ROLE_COLORS = { admin: '#ef4444', manager: '#3b82f6', designer: '#8b5cf6', sale: '#10b981', pending: '#64748b' };

// ============================================
// CSV PROCESSING - ETSY ORDER ITEMS FORMAT
// ============================================
function parseCSVText(text) {
  const lines = []; let current = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQ = !inQ; current += ch; }
    else if ((ch === '\n' || (ch === '\r' && text[i+1] === '\n')) && !inQ) {
      if (ch === '\r') i++;
      lines.push(current); current = '';
    } else { current += ch; }
  }
  if (current.trim()) lines.push(current);
  return lines.map(line => {
    const cols = []; let col = ''; let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') q = !q;
      else if (ch === ',' && !q) { cols.push(col.trim()); col = ''; }
      else col += ch;
    }
    cols.push(col.trim());
    return cols;
  });
}

function parseVariations(variations) {
  // Parse "Type:Sweatshirt - S,Color:Navy" or "Type:Hoodie - 3XL,Color:Black"
  let productType = 'Unknown', size = 'M', color = '', personalization = '';
  if (!variations) return { productType, size, color, personalization };

  const parts = variations.split(',');
  for (const part of parts) {
    const p = part.trim();
    if (p.startsWith('Type:') || p.startsWith('type:')) {
      let typeVal = p.substring(5).trim();
      // Skip non-product types
      if (typeVal === 'Additional Fee') { productType = 'Additional Fee'; continue; }
      // Extract size from type like "Sweatshirt - S" or "Hoodie - 3XL" or "Quarter Zip M"
      const dashMatch = typeVal.match(/^(.+?)\s*-\s*(\w+)$/);
      const spaceMatch = typeVal.match(/^(.+?)\s+((?:6XL|5XL|4XL|3XL|2XL|XL|XS|XXS|XXL|L|M|S|YXL|YL|YM|YS|YXS|6M|12M|2T|3T|4T|6Y|8Y|10Y))$/i);
      if (dashMatch) {
        productType = dashMatch[1].trim();
        size = dashMatch[2].trim().toUpperCase();
      } else if (spaceMatch) {
        productType = spaceMatch[1].trim();
        size = spaceMatch[2].trim().toUpperCase();
      } else {
        productType = typeVal;
      }
    }
    if (p.startsWith('Color:') || p.startsWith('color:')) {
      color = p.substring(6).trim();
    }
    if (p.startsWith('Personalization:') || p.startsWith('personalization:')) {
      personalization = p.substring(16).trim();
    }
  }
  return { productType, size, color, personalization };
}

function detectProductFromName(itemName) {
  // Fallback: detect product type from item name
  const text = (itemName || '').toLowerCase();
  const types = [
    ['kid baseball shirt', 'Kid Baseball Shirt'], ['kid baseball jacket', 'Kid Baseball Jacket'],
    ['kid football jersey', 'Kid Football Jersey'], ['kid hoodie', 'Kid Hoodie'],
    ['kid sweatshirt', 'Kid Sweatshirt'], ['kid t-shirt', 'Kid T-Shirt'],
    ['youth hawaiian', 'Youth Hawaiian Shirt'], ['baby tee', 'Baby Tee'],
    ['zip hoodie', 'Zip Hoodie'], ['quarter zip', 'Quarter Zip'],
    ['baseball jacket', 'Baseball Jacket'], ['baseball shirt', 'Baseball Shirt'],
    ['hawaiian shirt', 'Hawaiian Shirt'], ['beach short', 'Beach Short'],
    ['football jersey', 'Football Jersey'], ['linen shirt', 'Linen Shirt'],
    ['trucker hat', 'Trucker Hat'], ['wash hat', 'Wash Hat'],
    ['embroidered cap', 'Embroidered Cap'], ['cap', 'Embroidered Cap'],
    ['hoodie', 'Hoodie'], ['sweatshirt', 'Sweatshirt'], ['crewneck', 'Sweatshirt'],
    ['t-shirt', 'T-Shirt'], ['tee', 'T-Shirt'], ['shirt', 'T-Shirt'],
    ['keychain', 'Keychain 7cm'], ['crochet', 'Crochet 12cm'],
  ];
  for (const [key, val] of types) {
    if (text.includes(key)) return val;
  }
  return 'Unknown';
}

function getBasecost(productType, size, supplier) {
  const sd = BASECOST_DB[supplier]; if (!sd) return 0;
  const pd = sd[productType]; if (!pd) return 0;
  if (pd._all !== undefined) return pd._all;
  const sz = pd[size] || pd[size.toUpperCase()] || pd['M'] || pd['Free size'];
  if (!sz) return 0;
  return sz[0];
}

function processCSV(rows, shopName, supplier) {
  if (rows.length < 2) return [];
  const h = rows[0].map(x => x.toLowerCase().replace(/['"]/g, '').trim());

  // Map column indices - support both Order Items and Orders format
  const col = {};
  h.forEach((v, i) => {
    if (v === 'sale date') col.date = i;
    if (v === 'item name') col.itemName = i;
    if (v === 'buyer') col.buyer = i;
    if (v === 'quantity' || v === 'number of items') col.qty = i;
    if (v === 'price') col.price = i;
    if (v === 'item total') col.itemTotal = i;
    if (v === 'order total') col.orderTotal = i;
    if (v === 'order value') col.orderValue = i;
    if (v === 'discount amount') col.discount = i;
    if (v === 'order shipping') col.shipping = i;
    if (v === 'shipping') col.shipping2 = i;
    if (v === 'order sales tax' || v === 'sales tax') col.tax = i;
    if (v === 'vat paid by buyer') col.vat = i;
    if (v === 'order id') col.orderId = i;
    if (v === 'transaction id') col.transId = i;
    if (v === 'variations') col.variations = i;
    if (v === 'ship name' || v === 'full name') col.shipName = i;
    if (v === 'ship address1' || v === 'street 1') col.addr1 = i;
    if (v === 'ship address2' || v === 'street 2') col.addr2 = i;
    if (v === 'ship city') col.city = i;
    if (v === 'ship state') col.state = i;
    if (v === 'ship zipcode') col.zip = i;
    if (v === 'ship country') col.country = i;
    if (v === 'sku') col.sku = i;
    if (v === 'date shipped') col.dateShipped = i;
    if (v === 'date paid') col.datePaid = i;
    if (v === 'currency') col.currency = i;
    if (v === 'coupon code') col.coupon = i;
    if (v === 'status') col.status = i;
  });

  const orders = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 3) continue;

    const date = r[col.date] || '';
    if (!date) continue;

    // Parse variations to get product type, size, color
    const variationsRaw = col.variations !== undefined ? r[col.variations] : '';
    const itemName = col.itemName !== undefined ? r[col.itemName] : '';
    const parsed = parseVariations(variationsRaw);

    // If variations didn't give product type, try item name
    let productType = parsed.productType;
    if (productType === 'Unknown' || productType === 'Additional Fee') {
      productType = detectProductFromName(itemName);
    }
    // Skip additional fees
    if (parsed.productType === 'Additional Fee') continue;

    const size = parsed.size;
    const color = parsed.color;

    const qty = parseInt(r[col.qty] || '1') || 1;
    const price = parseFloat(r[col.price] || r[col.itemTotal] || r[col.orderValue] || '0') || 0;
    const discount = parseFloat(r[col.discount] || '0') || 0;
    const shipping = parseFloat(r[col.shipping] || r[col.shipping2] || '0') || 0;
    const tax = parseFloat(r[col.tax] || r[col.vat] || '0') || 0;

    const revenue = price - discount;
    const platformFee = revenue * 0.065 + 0.20 + revenue * 0.03; // Etsy: 6.5% transaction + $0.20 listing + 3% processing
    const basecost = getBasecost(productType, size, supplier) * qty;
    const profit = revenue - platformFee - tax - basecost;

    const address = [r[col.addr1], r[col.addr2], r[col.city], r[col.state], r[col.zip], r[col.country]].filter(Boolean).join(', ');

    orders.push({
      date,
      orderId: r[col.orderId] || r[col.transId] || `ORD-${i}`,
      shop: shopName,
      itemName: (itemName || '').substring(0, 100),
      productType,
      size,
      color,
      personalization: parsed.personalization,
      quantity: qty,
      buyer: r[col.shipName] || '',
      buyerId: r[col.buyer] || '',
      address,
      city: r[col.city] || '',
      state: r[col.state] || '',
      zip: r[col.zip] || '',
      country: r[col.country] || '',
      revenue,
      shipping,
      platformFee,
      tax,
      basecost,
      profit,
      supplier,
      sku: r[col.sku] || '',
      coupon: r[col.coupon] || '',
      dateShipped: r[col.dateShipped] || '',
      datePaid: r[col.datePaid] || '',
      currency: r[col.currency] || 'USD',
      status: r[col.dateShipped] ? 'Shipped' : r[col.datePaid] ? 'Paid' : 'Pending',
    });
  }
  return orders;
}

// ============================================
// STYLES
// ============================================
const S = {
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 },
  btn: { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit', transition: 'opacity 0.2s' },
  input: { padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', width: '100%', outline: 'none' },
  select: { padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit' },
  th: { padding: '10px 12px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid var(--border)' },
  td: { padding: '10px 12px', borderBottom: '1px solid rgba(30,41,59,0.2)', fontSize: 13 },
  mono: { fontFamily: "'Space Mono', monospace" },
  badge: (c) => ({ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c + '18', color: c }),
};

function formatUSD(n) { return '$' + n.toFixed(2); }
function formatVND(n) {
  if (Math.abs(n) >= 1e9) return (n/1e9).toFixed(1) + ' tỷ';
  if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(1) + 'M';
  return n.toFixed(0);
}

// ============================================
// AUTH PAGES
// ============================================
function LoginPage({ onLogin, onGoRegister, error, loading }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: 420, animation: 'fadeSlideUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 16 }}>N</div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>NBECOM</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 4 }}>Management System</p>
        </div>
        <div style={{ ...S.card, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>Đăng nhập</h2>
          {error && <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontSize: 13, marginBottom: 16, animation: 'shake 0.3s ease' }}>⚠️ {error}</div>}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>USERNAME</label>
            <input style={S.input} placeholder="Nhập username" value={u} onChange={e => setU(e.target.value)} onKeyDown={e => e.key === 'Enter' && onLogin(u, p)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>MẬT KHẨU</label>
            <input style={S.input} type="password" placeholder="Nhập mật khẩu" value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key === 'Enter' && onLogin(u, p)} />
          </div>
          <button onClick={() => onLogin(u, p)} disabled={loading} style={{ ...S.btn, background: 'var(--accent)', color: '#fff', width: '100%', padding: 14, fontSize: 15, opacity: loading ? 0.6 : 1 }}>
            {loading ? '⏳ Đang đăng nhập...' : '🔐 Đăng nhập'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Chưa có tài khoản? </span>
            <span onClick={onGoRegister} style={{ color: 'var(--accent)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Đăng ký</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onRegister, onGoLogin, error, loading, success }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [p2, setP2] = useState('');
  const [fn, setFn] = useState('');
  const handleReg = () => {
    if (p !== p2) { alert('Mật khẩu không khớp!'); return; }
    onRegister(u, p, fn);
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: 420, animation: 'fadeSlideUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 16 }}>N</div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>NBECOM</h1>
        </div>
        <div style={{ ...S.card, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>Đăng ký tài khoản</h2>
          {error && <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
          {success && <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: 'var(--green)', fontSize: 13, marginBottom: 16 }}>✅ {success}</div>}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>HỌ TÊN</label>
            <input style={S.input} placeholder="Nhập họ tên đầy đủ" value={fn} onChange={e => setFn(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>USERNAME</label>
            <input style={S.input} placeholder="Tối thiểu 3 ký tự" value={u} onChange={e => setU(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>MẬT KHẨU</label>
            <input style={S.input} type="password" placeholder="Tối thiểu 6 ký tự" value={p} onChange={e => setP(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>XÁC NHẬN MẬT KHẨU</label>
            <input style={S.input} type="password" placeholder="Nhập lại mật khẩu" value={p2} onChange={e => setP2(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReg()} />
          </div>
          <button onClick={handleReg} disabled={loading} style={{ ...S.btn, background: 'var(--green)', color: '#fff', width: '100%', padding: 14, fontSize: 15, opacity: loading ? 0.6 : 1 }}>
            {loading ? '⏳ Đang xử lý...' : '📝 Đăng ký'}
          </button>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>Đã có tài khoản? </span>
            <span onClick={onGoLogin} style={{ color: 'var(--accent)', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>Đăng nhập</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupPage({ onSetup, error, loading }) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [fn, setFn] = useState('');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ width: 460, animation: 'fadeSlideUp 0.5s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Chào mừng đến NBECOM!</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 14, marginTop: 8 }}>Tạo tài khoản Admin để bắt đầu sử dụng hệ thống</p>
        </div>
        <div style={{ ...S.card, padding: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, textAlign: 'center' }}>⚙️ Tạo tài khoản Admin</h2>
          {error && <div style={{ padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>⚠️ {error}</div>}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>HỌ TÊN ADMIN</label>
            <input style={S.input} placeholder="Ví dụ: Bin" value={fn} onChange={e => setFn(e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>USERNAME</label>
            <input style={S.input} placeholder="Tối thiểu 3 ký tự" value={u} onChange={e => setU(e.target.value)} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>MẬT KHẨU</label>
            <input style={S.input} type="password" placeholder="Tối thiểu 6 ký tự" value={p} onChange={e => setP(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSetup(u, p, fn)} />
          </div>
          <button onClick={() => onSetup(u, p, fn)} disabled={loading} style={{ ...S.btn, background: 'linear-gradient(135deg, var(--accent), var(--purple))', color: '#fff', width: '100%', padding: 14, fontSize: 15 }}>
            {loading ? '⏳ Đang tạo...' : '🔧 Tạo Admin & Bắt đầu'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ADMIN USER MANAGEMENT
// ============================================
function UserManagement({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await authAPI('getUsers', { token });
    if (res.success) setUsers(res.users);
    setLoading(false);
  }, [token]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const updateUser = async (username, role, status) => {
    await authAPI('updateUser', { token, targetUsername: username, newRole: role, newStatus: status });
    loadUsers();
  };

  const deleteUser = async (username) => {
    if (confirm(`Xóa user "${username}"?`)) {
      await authAPI('deleteUser', { token, targetUsername: username });
      loadUsers();
    }
  };

  const pending = users.filter(u => u.status === 'pending');
  const active = users.filter(u => u.status === 'active');
  const blocked = users.filter(u => u.status === 'blocked');

  return (
    <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>👥 Quản lý người dùng</h2>

      {pending.length > 0 && (
        <div style={{ ...S.card, marginBottom: 20, borderColor: 'var(--orange)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--orange)' }}>⏳ Chờ duyệt ({pending.length})</h3>
          {pending.map(u => (
            <div key={u.username} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>@{u.username} • Đăng ký: {new Date(u.createdAt).toLocaleDateString('vi')}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select style={{ ...S.select, fontSize: 12, padding: '6px 10px' }} defaultValue="sale" id={`role-${u.username}`}>
                  <option value="manager">Manager</option>
                  <option value="designer">Designer</option>
                  <option value="sale">Sale</option>
                </select>
                <button onClick={() => updateUser(u.username, document.getElementById(`role-${u.username}`).value, 'active')} style={{ ...S.btn, background: 'var(--green)', color: '#fff', fontSize: 12, padding: '6px 14px' }}>✅ Duyệt</button>
                <button onClick={() => deleteUser(u.username)} style={{ ...S.btn, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontSize: 12, padding: '6px 14px' }}>❌ Từ chối</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={S.card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Tất cả thành viên ({active.length})</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-dim)' }}>⏳ Đang tải...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Họ tên', 'Username', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {[...active, ...blocked].map(u => (
                <tr key={u.username}>
                  <td style={{ ...S.td, fontWeight: 600 }}>{u.fullName}</td>
                  <td style={{ ...S.td, ...S.mono, color: 'var(--text-dim)' }}>@{u.username}</td>
                  <td style={S.td}>
                    {u.role === 'admin' ? <span style={S.badge(ROLE_COLORS.admin)}>Admin</span> : (
                      <select style={{ ...S.select, fontSize: 12, padding: '4px 8px' }} value={u.role}
                        onChange={e => updateUser(u.username, e.target.value, u.status)}>
                        <option value="manager">Manager</option>
                        <option value="designer">Designer</option>
                        <option value="sale">Sale</option>
                      </select>
                    )}
                  </td>
                  <td style={S.td}>
                    <span style={S.badge(u.status === 'active' ? 'var(--green)' : 'var(--red)')}>
                      {u.status === 'active' ? '✅ Hoạt động' : '🚫 Bị khóa'}
                    </span>
                  </td>
                  <td style={{ ...S.td, fontSize: 12, color: 'var(--text-dim)' }}>{new Date(u.createdAt).toLocaleDateString('vi')}</td>
                  <td style={S.td}>
                    {u.role !== 'admin' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        {u.status === 'active' ? (
                          <button onClick={() => updateUser(u.username, u.role, 'blocked')} style={{ ...S.btn, fontSize: 11, padding: '4px 10px', background: 'rgba(239,68,68,0.1)', color: 'var(--red)' }}>Khóa</button>
                        ) : (
                          <button onClick={() => updateUser(u.username, u.role, 'active')} style={{ ...S.btn, fontSize: 11, padding: '4px 10px', background: 'rgba(16,185,129,0.1)', color: 'var(--green)' }}>Mở khóa</button>
                        )}
                        <button onClick={() => deleteUser(u.username)} style={{ ...S.btn, fontSize: 11, padding: '4px 10px', background: 'rgba(239,68,68,0.05)', color: 'var(--text-dim)' }}>Xóa</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================
// CSV UPLOAD MODULE (from v2)
// ============================================
function CSVUpload({ onData, data }) {
  const [shop, setShop] = useState(''); const [supplier, setSupplier] = useState(''); const [month, setMonth] = useState('');
  const [dragging, setDragging] = useState(false); const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState(''); const [error, setError] = useState(''); const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!shop) { setError('Chọn Shop trước'); return; }
    if (!supplier) { setError('Chọn Supplier trước'); return; }
    setError(''); setFileName(file.name); setProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSVText(e.target.result);
        const orders = processCSV(rows, shop, supplier);
        if (!orders.length) { setError('Không tìm thấy đơn hàng'); setProcessing(false); return; }
        setPreview({ total: orders.length, revenue: orders.reduce((s,o) => s+o.revenue, 0), profit: orders.reduce((s,o) => s+o.profit, 0), basecost: orders.reduce((s,o) => s+o.basecost, 0), orders });
        setProcessing(false);
      } catch (err) { setError('Lỗi: ' + err.message); setProcessing(false); }
    };
    reader.readAsText(file);
  }, [shop, supplier]);

  return (
    <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>📤 Upload CSV</h2>
      <div style={{ ...S.card, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div><label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>SHOP</label>
            <select style={{ ...S.select, width: '100%' }} value={shop} onChange={e => setShop(e.target.value)}>
              <option value="">-- Chọn --</option>{SHOPS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select></div>
          <div><label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>SUPPLIER</label>
            <select style={{ ...S.select, width: '100%' }} value={supplier} onChange={e => setSupplier(e.target.value)}>
              <option value="">-- Chọn --</option><option value="Phương Nhi">Phương Nhi</option><option value="Pet">Pet</option><option value="Zootop Bear">Zootop Bear</option><option value="TRIO">TRIO</option>
            </select></div>
          <div><label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>THÁNG</label>
            <select style={{ ...S.select, width: '100%' }} value={month} onChange={e => setMonth(e.target.value)}>
              <option value="">-- Chọn --</option>{['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={`2026-${m}`}>Tháng {parseInt(m)}/2026</option>)}
            </select></div>
        </div>
      </div>
      <div style={{ ...S.card, marginBottom: 20 }}>
        <div onDragOver={e => {e.preventDefault();setDragging(true)}} onDragLeave={() => setDragging(false)}
          onDrop={e => {e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0])}}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 12, padding: 48, textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(59,130,246,0.05)' : 'transparent' }}>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
          {processing ? <div style={{ color: 'var(--text-muted)' }}>⏳ Đang xử lý...</div> :
            fileName ? <div><div style={{ fontSize: 36 }}>📄</div><div style={{ color: 'var(--accent)', fontWeight: 600 }}>{fileName}</div></div> :
            <div><div style={{ fontSize: 48, marginBottom: 8 }}>📁</div><div style={{ fontWeight: 600 }}>Kéo thả file CSV vào đây</div><div style={{ color: 'var(--text-dim)', fontSize: 13 }}>hoặc click để chọn</div></div>}
        </div>
        {error && <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontSize: 13 }}>⚠️ {error}</div>}
      </div>
      {preview && (
        <div style={{ ...S.card, marginBottom: 20, borderColor: 'var(--accent)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Xác nhận ({preview.total} đơn)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(16,185,129,0.08)' }}><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Revenue</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--green)', ...S.mono }}>{formatUSD(preview.revenue)}</div></div>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(245,158,11,0.08)' }}><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Basecost</div><div style={{ fontSize: 20, fontWeight: 700, color: 'var(--orange)', ...S.mono }}>{formatUSD(preview.basecost)}</div></div>
            <div style={{ padding: 12, borderRadius: 8, background: 'rgba(139,92,246,0.08)' }}><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Profit</div><div style={{ fontSize: 20, fontWeight: 700, color: preview.profit >= 0 ? 'var(--green)' : 'var(--red)', ...S.mono }}>{formatUSD(preview.profit)}</div></div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { onData(prev => [...prev, ...preview.orders]); setPreview(null); setFileName(''); }} style={{ ...S.btn, background: 'var(--green)', color: '#fff', flex: 1 }}>✅ Xác nhận & Lưu</button>
            <button onClick={() => { setPreview(null); setFileName(''); }} style={{ ...S.btn, background: 'var(--border)', color: 'var(--text-muted)' }}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// REPORTS VIEW
// ============================================
function Reports({ orders }) {
  if (!orders.length) return <div style={{ ...S.card, textAlign: 'center', padding: 60 }}><div style={{ fontSize: 48 }}>📊</div><div style={{ color: 'var(--text-muted)', marginTop: 12 }}>Upload CSV trước để xem báo cáo</div></div>;
  const byShop = {}; orders.forEach(o => { if (!byShop[o.shop]) byShop[o.shop] = { n: 0, rev: 0, bc: 0, fee: 0, profit: 0 }; byShop[o.shop].n += o.quantity; byShop[o.shop].rev += o.revenue; byShop[o.shop].bc += o.basecost; byShop[o.shop].fee += o.platformFee; byShop[o.shop].profit += o.profit; });
  const tRev = orders.reduce((s,o) => s+o.revenue, 0); const tProfit = orders.reduce((s,o) => s+o.profit, 0);
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={S.card}><div style={{ fontSize: 12, color: 'var(--text-dim)' }}>ĐƠN HÀNG</div><div style={{ fontSize: 24, fontWeight: 700, ...S.mono }}>{orders.length}</div></div>
        <div style={S.card}><div style={{ fontSize: 12, color: 'var(--text-dim)' }}>REVENUE</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--green)', ...S.mono }}>{formatUSD(tRev)}</div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{formatVND(tRev*RATE)} ₫</div></div>
        <div style={S.card}><div style={{ fontSize: 12, color: 'var(--text-dim)' }}>PROFIT</div><div style={{ fontSize: 24, fontWeight: 700, color: 'var(--purple)', ...S.mono }}>{formatUSD(tProfit)}</div><div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{formatVND(tProfit*RATE)} ₫</div></div>
        <div style={S.card}><div style={{ fontSize: 12, color: 'var(--text-dim)' }}>MARGIN</div><div style={{ fontSize: 24, fontWeight: 700, ...S.mono }}>{tRev > 0 ? (tProfit/tRev*100).toFixed(1)+'%' : '-'}</div></div>
      </div>
      <div style={S.card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Hiệu suất theo Shop</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Shop','Đơn','Revenue','Basecost','Fee','Profit','Margin'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>{Object.entries(byShop).sort((a,b) => b[1].rev-a[1].rev).map(([shop,d]) => (
            <tr key={shop}>
              <td style={{ ...S.td, fontWeight: 600 }}>{shop}</td>
              <td style={{ ...S.td, ...S.mono }}>{d.n}</td>
              <td style={{ ...S.td, ...S.mono, color: 'var(--accent-light)' }}>{formatUSD(d.rev)}</td>
              <td style={{ ...S.td, ...S.mono, color: 'var(--orange)' }}>{formatUSD(d.bc)}</td>
              <td style={{ ...S.td, ...S.mono, color: 'var(--text-dim)' }}>{formatUSD(d.fee)}</td>
              <td style={{ ...S.td, ...S.mono, fontWeight: 700, color: d.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatUSD(d.profit)}</td>
              <td style={{ ...S.td, ...S.mono }}>{d.rev > 0 ? (d.profit/d.rev*100).toFixed(1)+'%' : '-'}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function Home() {
  const [authState, setAuthState] = useState('loading'); // loading, setup, login, register, app
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('nbecom_token');
      if (saved) {
        const res = await authAPI('verify', { token: saved });
        if (res.success) { setCurrentUser(res.user); setToken(saved); setAuthState('app'); return; }
        localStorage.removeItem('nbecom_token');
      }
      const setup = await authAPI('checkSetup');
      setAuthState(setup.adminExists ? 'login' : 'setup');
    };
    init();
  }, []);

  const handleSetup = async (username, password, fullName) => {
    setAuthLoading(true); setAuthError('');
    const res = await authAPI('setup', { username, password, fullName });
    if (res.success) { localStorage.setItem('nbecom_token', res.token); setCurrentUser(res.user); setToken(res.token); setAuthState('app'); }
    else setAuthError(res.error);
    setAuthLoading(false);
  };

  const handleLogin = async (username, password) => {
    setAuthLoading(true); setAuthError('');
    const res = await authAPI('login', { username, password });
    if (res.success) { localStorage.setItem('nbecom_token', res.token); setCurrentUser(res.user); setToken(res.token); setAuthState('app'); }
    else setAuthError(res.error);
    setAuthLoading(false);
  };

  const handleRegister = async (username, password, fullName) => {
    setAuthLoading(true); setAuthError(''); setRegSuccess('');
    const res = await authAPI('register', { username, password, fullName });
    if (res.success) setRegSuccess(res.message);
    else setAuthError(res.error);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await authAPI('logout', { token });
    localStorage.removeItem('nbecom_token');
    setCurrentUser(null); setToken(null); setAuthState('login');
  };

  if (authState === 'loading') return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ textAlign: 'center' }}><div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} /><div style={{ color: 'var(--text-muted)' }}>Đang tải...</div></div></div>;
  if (authState === 'setup') return <SetupPage onSetup={handleSetup} error={authError} loading={authLoading} />;
  if (authState === 'register') return <RegisterPage onRegister={handleRegister} onGoLogin={() => { setAuthState('login'); setAuthError(''); setRegSuccess(''); }} error={authError} loading={authLoading} success={regSuccess} />;
  if (authState === 'login') return <LoginPage onLogin={handleLogin} onGoRegister={() => { setAuthState('register'); setAuthError(''); }} error={authError} loading={authLoading} />;

  // ====== DASHBOARD ======
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager' || isAdmin;

  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard', show: true },
    { id: 'upload', icon: '📤', label: 'Upload CSV', show: isManager },
    { id: 'orders', icon: '📦', label: 'Đơn hàng', show: true },
    { id: 'reports', icon: '📈', label: 'Báo cáo', show: isManager },
    { id: 'basecost', icon: '💰', label: 'Basecost', show: isAdmin },
    { id: 'users', icon: '👥', label: 'Người dùng', show: isAdmin },
    { id: 'settings', icon: '⚙️', label: 'Cài đặt', show: isAdmin },
  ].filter(m => m.show);

  const renderContent = () => {
    switch (activeMenu) {
      case 'upload': return <CSVUpload onData={setAllOrders} data={allOrders} />;
      case 'orders': return (
        <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>📦 Đơn hàng ({allOrders.length})</h2>
          {allOrders.length === 0 ? <div style={{ ...S.card, textAlign: 'center', padding: 60 }}><div style={{ fontSize: 48 }}>📭</div><div style={{ color: 'var(--text-muted)', marginTop: 12 }}>Chưa có dữ liệu</div></div> :
          <div style={S.card}><div style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'auto' }}><table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1200 }}><thead style={{ position: 'sticky', top: 0, background: 'var(--card)', zIndex: 2 }}><tr>{['#','Ngày','Order ID','Shop','Sản phẩm','Size','Màu','SKU','Buyer','Địa chỉ','Quốc gia','Revenue','Fee','Basecost','Profit','Trạng thái'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>{allOrders.slice(0,200).map((o,i) => (
            <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='var(--card-hover)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{...S.td,...S.mono,color:'var(--text-dim)',fontSize:11}}>{i+1}</td>
              <td style={{...S.td,fontSize:12,whiteSpace:'nowrap'}}>{o.date}</td>
              <td style={{...S.td,...S.mono,color:'var(--accent)',fontSize:11}}>{o.orderId}</td>
              <td style={S.td}><span style={S.badge('var(--accent)')}>{o.shop.substring(0,15)}</span></td>
              <td style={{...S.td,fontWeight:600,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.productType}</td>
              <td style={{...S.td,...S.mono,textAlign:'center'}}>{o.size}</td>
              <td style={{...S.td,fontSize:12}}>{o.color}</td>
              <td style={{...S.td,...S.mono,fontSize:11,color:'var(--text-dim)'}}>{o.sku}</td>
              <td style={{...S.td,fontSize:12,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.buyer}</td>
              <td style={{...S.td,fontSize:11,color:'var(--text-dim)',maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{o.address}</td>
              <td style={{...S.td,fontSize:11}}>{o.country}</td>
              <td style={{...S.td,...S.mono,color:'var(--accent-light)'}}>{formatUSD(o.revenue)}</td>
              <td style={{...S.td,...S.mono,color:'var(--text-dim)',fontSize:11}}>{formatUSD(o.platformFee)}</td>
              <td style={{...S.td,...S.mono,color:'var(--orange)'}}>{formatUSD(o.basecost)}</td>
              <td style={{...S.td,...S.mono,fontWeight:600,color:o.profit>=0?'var(--green)':'var(--red)'}}>{formatUSD(o.profit)}</td>
              <td style={S.td}><span style={S.badge(o.status==='Shipped'?'var(--green)':o.status==='Paid'?'var(--accent)':'var(--orange)')}>{o.status}</span></td>
            </tr>
          ))}</tbody></table>{allOrders.length > 200 && <div style={{textAlign:'center',padding:12,color:'var(--text-dim)',fontSize:13}}>Hiển thị 200/{allOrders.length} đơn</div>}</div></div>}
        </div>
      );
      case 'reports': return <div style={{ animation: 'fadeSlideUp 0.4s ease' }}><h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>📈 Báo cáo</h2><Reports orders={allOrders} /></div>;
      case 'users': return <UserManagement token={token} />;
      case 'basecost': return (
        <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>💰 Basecost</h2>
          {Object.entries(BASECOST_DB).map(([sup, products]) => (
            <div key={sup} style={{ ...S.card, marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{sup}</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr>{['Sản phẩm','Giá (USD)'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead><tbody>
                {Object.entries(products).map(([p, sizes]) => sizes._all !== undefined ?
                  <tr key={p}><td style={{ ...S.td, fontWeight: 500 }}>{p}</td><td style={{ ...S.td, ...S.mono, color: 'var(--accent-light)' }}>${sizes._all}</td></tr> :
                  Object.entries(sizes).map(([sz, pr]) => <tr key={p+sz}><td style={{ ...S.td, fontWeight: 500 }}>{p} — {sz}</td><td style={{ ...S.td, ...S.mono, color: 'var(--accent-light)' }}>${pr[0]}</td></tr>)
                )}
              </tbody></table>
            </div>
          ))}
        </div>
      );
      default: return (
        <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
          {allOrders.length === 0 ? (
            <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>👋</div>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Xin chào, {currentUser?.fullName}!</div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Vai trò: <span style={S.badge(ROLE_COLORS[currentUser?.role] || 'var(--text-dim)')}>{ROLES[currentUser?.role] || currentUser?.role}</span></div>
              {isManager && <button onClick={() => setActiveMenu('upload')} style={{ ...S.btn, background: 'var(--accent)', color: '#fff', fontSize: 16, padding: '14px 32px' }}>📤 Upload CSV ngay</button>}
            </div>
          ) : <Reports orders={allOrders} />}
        </div>
      );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: sidebarOpen ? 240 : 68, background: 'var(--card)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', transition: 'width 0.3s', flexShrink: 0 }}>
        <div style={{ padding: sidebarOpen ? '20px 16px' : '20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0 }}>N</div>
          {sidebarOpen && <div><div style={{ fontWeight: 700, fontSize: 14 }}>NBECOM</div><div style={{ fontSize: 10, color: 'var(--text-dim)' }}>v3.0</div></div>}
        </div>
        <nav style={{ padding: '10px 8px', flex: 1 }}>
          {menuItems.map(item => (
            <div key={item.id} onClick={() => setActiveMenu(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: sidebarOpen ? '9px 12px' : '9px',
              borderRadius: 8, marginBottom: 2, cursor: 'pointer',
              background: activeMenu === item.id ? 'rgba(59,130,246,0.1)' : 'transparent',
              borderLeft: activeMenu === item.id ? '3px solid var(--accent)' : '3px solid transparent',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 13, fontWeight: activeMenu === item.id ? 600 : 400, color: activeMenu === item.id ? 'var(--accent)' : 'var(--text-muted)' }}>{item.label}</span>}
            </div>
          ))}
        </nav>
        {sidebarOpen && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{currentUser?.fullName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8 }}><span style={S.badge(ROLE_COLORS[currentUser?.role] || '#666')}>{ROLES[currentUser?.role] || currentUser?.role}</span></div>
            <button onClick={handleLogout} style={{ ...S.btn, fontSize: 12, padding: '6px 12px', background: 'rgba(239,68,68,0.1)', color: 'var(--red)', width: '100%' }}>🚪 Đăng xuất</button>
          </div>
        )}
        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 12, borderTop: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center', color: 'var(--text-dim)', fontSize: 14 }}>{sidebarOpen ? '◀' : '▶'}</div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
          <h1 style={{ fontSize: 16, fontWeight: 700 }}>{menuItems.find(m => m.id === activeMenu)?.icon} {menuItems.find(m => m.id === activeMenu)?.label}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {allOrders.length > 0 && <div style={{ fontSize: 12, color: 'var(--text-dim)', ...S.mono }}>{allOrders.length} đơn</div>}
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>{currentUser?.fullName?.charAt(0)}</div>
          </div>
        </header>
        <div style={{ padding: '20px 24px' }}>
          {renderContent()}
          <div style={{ textAlign: 'center', padding: '20px 0 8px', color: 'var(--text-dim)', fontSize: 11 }}>NBECOM v3.0 • Powered by Lisa AI 💙</div>
        </div>
      </main>
    </div>
  );
}
