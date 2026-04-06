'use client';
import { useState, useCallback, useRef } from 'react';

// ============================================
// BASECOST DATABASE
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
    'Embroidered Cap': { 'Free size':[14,19,19] },
    'Wash Hat': { 'Free size':[14,19,19] },
    'Trucker Hat': { 'Free size':[14,19,19] },
  },
  'Pet': {
    'T-Shirt': { S:[15.8,19,21], M:[15.8,19.5,21.5], L:[15.8,19.5,21.5], XL:[17,21.5,24.5], '2XL':[18,21.5,24.5], '3XL':[18.9,24.5,24.5], '4XL':[20.9,25,25.5], '5XL':[20.9,25,25.5] },
    'Sweatshirt': { S:[23.9,29,31.5], M:[23.9,29,31.5], L:[23.9,29,31.5], XL:[23.9,30,35.5], '2XL':[26.9,30,35.5], '3XL':[28.9,33,35.5], '4XL':[28.9,33,36.5], '5XL':[28.9,33,36.5] },
    'Hoodie': { S:[27.9,32,35.5], M:[27.9,32,35.5], L:[27.9,32,35.5], XL:[27.9,32,35.5], '2XL':[29.9,37,38.5], '3XL':[31.9,37,38.5], '4XL':[31.9,37,38.5], '5XL':[31.9,37,38.5] },
    'Quarter Zip': { S:[25.9,31,33.5], M:[25.9,31,33.5], L:[25.9,31,33.5], XL:[25.9,32,37.5], '2XL':[28.9,32,37.5], '3XL':[30.9,35,37.5], '4XL':[30.9,35,38.5], '5XL':[30.9,35,38.5] },
    'Baby Tee': { S:[15.8,19,21], M:[15.8,19.5,21.5], L:[15.8,19.5,21.5], XL:[17,21.5,24.5], '2XL':[18,21.5,24.5], '3XL':[18.9,24.5,24.5], '4XL':[20.9,25,25.5], '5XL':[20.9,25,25.5] },
    'Kid Sweatshirt': { S:[17.5,19.5,20.5], M:[17.5,19.5,20.5], L:[17.5,19.5,20.5], XL:[17.5,19.5,20.5], '2XL':[19.5,21.5,22.5] },
    'Kid Hoodie': { S:[18.5,20.5,21.5], M:[18.5,20.5,21.5], L:[20.5,22.5,23.5], XL:[20.5,22.5,23.5], '2XL':[20.5,22.5,23.5] },
    'Kid T-Shirt': { S:[13,14.5,15.5], M:[13,14.5,15.5], L:[14,15.5,16.5], XL:[14,15.5,16.5], '2XL':[14,15.5,16.5] },
    'Embroidered Cap': { 'Free size':[15,20,20] },
    'Wash Hat': { 'Free size':[15,20,20] },
    'Trucker Hat': { 'Free size':[15,20,20] },
  },
  'Zootop Bear': {
    'Hawaiian Shirt': { _all: 13.71 },
    'Youth Hawaiian Shirt': { _all: 12.02 },
    'Beach Short': { _all: 12.69 },
    'Football Jersey': { _all: 14.61 },
    'Kid Football Jersey': { _all: 11.47 },
    'Linen Shirt': { _all: 15.06 },
    'Baseball Jacket': { _all: 23.98 },
    'Kid Baseball Jacket': { _all: 23.30 },
    'Baseball Shirt': { _all: 13.33 },
    'Kid Baseball Shirt': { _all: 11.27 },
    'Hoodie': { _all: 21.44 },
    'Zip Hoodie': { _all: 21.68 },
    'Sweatshirt': { _all: 16.84 },
    'Kid Hoodie': { _all: 15.28 },
  },
  'TRIO': {
    'Keychain 7cm': { _all: 14 },
    'Crochet 12cm': { _all: 15.5 },
    'Crochet 20cm': { _all: 23 },
    'Crochet 30cm': { _all: 32 },
  }
};

const SHOPS = [
  { name: 'QuinnCreativeDesign', type: 'Vật lý', email: 'nakiaiaaiden@gmail.com' },
  { name: 'ThiHoaEmbroidery', type: 'Vật lý', email: 'kaylahsummers95747@gmail.com' },
  { name: 'Moyerpeters', type: 'Vật lý', email: 'moyerpeters0704517@gmail.com' },
  { name: 'NDAHandmadeEMB', type: 'Vật lý', email: 'venszkigabor412@gmail.com' },
  { name: 'EmbroideryTVT', type: 'Vật lý', email: 'jordynenglish08796@gmail.com' },
  { name: 'TonyHungGift', type: 'Vật lý', email: 'huynhkimly7711@gmail.com' },
  { name: 'EmbroideryAnhThu', type: 'Digital', email: 'eileenbenson22233@gmail.com' },
  { name: 'EmbroideryTuanAnh', type: 'Digital', email: 'imanimcninch23798@gmail.com' },
  { name: 'BumMachineEmbroidery', type: 'Digital', email: 'sydneyfarmer25147@gmail.com' },
  { name: 'NINNEmbroidery', type: 'Digital', email: 'vizuetevamesa786@gmail.com' },
  { name: 'Linhcraftshop', type: 'Digital', email: 'linh109t7@gmail.com' },
];

const RATE = 26500;

// ============================================
// CSV PROCESSING
// ============================================
function parseCSVText(text) {
  const lines = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQuotes = !inQuotes; current += ch; }
    else if (ch === '\n' && !inQuotes) { lines.push(current); current = ''; }
    else { current += ch; }
  }
  if (current) lines.push(current);

  return lines.map(line => {
    const cols = [];
    let col = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { q = !q; }
      else if (ch === ',' && !q) { cols.push(col.trim()); col = ''; }
      else { col += ch; }
    }
    cols.push(col.trim());
    return cols;
  });
}

function detectProductType(itemName, variations, sku) {
  const text = (itemName + ' ' + (variations || '') + ' ' + (sku || '')).toLowerCase();
  const types = [
    'kid baseball shirt', 'kid baseball jacket', 'kid football jersey', 'kid hoodie', 'kid sweatshirt', 'kid t-shirt',
    'youth hawaiian shirt', 'baby tee', 'zip hoodie', 'quarter zip',
    'baseball jacket', 'baseball shirt', 'hawaiian shirt', 'beach short',
    'football jersey', 'linen shirt', 'trucker hat', 'wash hat', 'embroidered cap',
    'hoodie', 'sweatshirt', 't-shirt', 'tee',
    'keychain 7cm', 'keychain', 'crochet 30cm', 'crochet 20cm', 'crochet 12cm', 'crochet',
  ];
  for (const t of types) {
    if (text.includes(t)) {
      if (t === 'tee' && !text.includes('baby tee')) return 'T-Shirt';
      if (t === 'keychain') return 'Keychain 7cm';
      if (t === 'crochet') return 'Crochet 12cm';
      return t.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }
  return 'Unknown';
}

function detectSize(itemName, variations) {
  const text = (itemName + ' ' + (variations || '')).toUpperCase();
  const sizes = ['6XL','5XL','4XL','3XL','2XL','XL','L','M','S','XS','XXS','XXL',
    'YXL','YL','YM','YS','YXS','2T','3T','4T','6M','12M','6Y','8Y','10Y',
    'TODDLER 2T','TODDLER 3T','TODDLER 4T','TODDLER 4','TODDLER 5',
    'YOUTH XS','YOUTH S','YOUTH M','YOUTH L','YOUTH XL','FREE SIZE'];
  for (const s of sizes) {
    const patterns = [
      new RegExp('\\b' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'),
      new RegExp('SIZE:\\s*' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      new RegExp('-\\s*' + s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'),
    ];
    for (const p of patterns) {
      if (p.test(text)) return s;
    }
  }
  if (text.includes('CAP') || text.includes('HAT')) return 'Free size';
  return 'M';
}

function getBasecost(productType, size, supplier) {
  const supplierData = BASECOST_DB[supplier];
  if (!supplierData) return null;
  const productData = supplierData[productType];
  if (!productData) return null;
  if (productData._all !== undefined) return productData._all;
  const sizeData = productData[size] || productData['M'] || productData['Free size'];
  if (!sizeData) return null;
  return sizeData[0]; // Use first price tier (lowest)
}

function processEtsyCSV(rows, shopName, selectedSupplier) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.toLowerCase().trim());

  const colMap = {};
  headers.forEach((h, i) => {
    if (h.includes('sale date') || h === 'date') colMap.date = i;
    if (h.includes('item name') || h.includes('product')) colMap.itemName = i;
    if (h.includes('buyer')) colMap.buyer = i;
    if (h.includes('quantity') || h === 'sl') colMap.quantity = i;
    if (h.includes('price') || h.includes('item total')) colMap.price = i;
    if (h.includes('item total')) colMap.itemTotal = i;
    if (h.includes('discount amount')) colMap.discount = i;
    if (h.includes('order shipping')) colMap.shipping = i;
    if (h.includes('order sales tax') || h.includes('tax')) colMap.tax = i;
    if (h.includes('currency')) colMap.currency = i;
    if (h.includes('order id') || h.includes('#order')) colMap.orderId = i;
    if (h.includes('variations') || h.includes('type')) colMap.variations = i;
    if (h.includes('ship name') || h.includes('fullname')) colMap.shipName = i;
    if (h.includes('ship address') || h.includes('address')) colMap.address = i;
    if (h.includes('ship city') || h.includes('city')) colMap.city = i;
    if (h.includes('ship state') || h.includes('state')) colMap.state = i;
    if (h.includes('ship zip') || h.includes('zipcode')) colMap.zip = i;
    if (h.includes('ship country') || h.includes('country')) colMap.country = i;
    if (h === 'sku') colMap.sku = i;
    if (h.includes('vat paid')) colMap.vat = i;
    if (h.includes('payment status')) colMap.paymentStatus = i;
    if (h.includes('date paid')) colMap.datePaid = i;
    if (h.includes('color')) colMap.color = i;
  });

  const orders = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 3 || !r[colMap.date || 0]) continue;

    const itemName = r[colMap.itemName] || r[colMap.variations] || '';
    const variations = r[colMap.variations] || '';
    const sku = r[colMap.sku] || '';
    const productType = detectProductType(itemName, variations, sku);
    const size = detectSize(itemName, variations);
    const quantity = parseInt(r[colMap.quantity] || '1') || 1;
    const priceRaw = r[colMap.itemTotal] || r[colMap.price] || '0';
    const price = parseFloat(String(priceRaw).replace(/[^0-9.]/g, '')) || 0;
    const discount = parseFloat(String(r[colMap.discount] || '0').replace(/[^0-9.]/g, '')) || 0;
    const shipping = parseFloat(String(r[colMap.shipping] || '0').replace(/[^0-9.]/g, '')) || 0;
    const tax = parseFloat(String(r[colMap.tax] || r[colMap.vat] || '0').replace(/[^0-9.]/g, '')) || 0;
    const revenue = price - discount;
    const platformFee = revenue * 0.2;
    const basecost = getBasecost(productType, size, selectedSupplier) || 0;
    const totalBasecost = basecost * quantity;
    const profit = revenue - platformFee - tax - totalBasecost;

    orders.push({
      date: r[colMap.date] || '',
      orderId: r[colMap.orderId] || `ORD-${i}`,
      shop: shopName,
      itemName: itemName.substring(0, 80),
      productType,
      size,
      color: r[colMap.color] || '',
      quantity,
      buyer: r[colMap.shipName] || r[colMap.buyer] || '',
      address: [r[colMap.address], r[colMap.city], r[colMap.state], r[colMap.zip], r[colMap.country]].filter(Boolean).join(', '),
      country: r[colMap.country] || '',
      revenue,
      platformFee,
      tax,
      basecost: totalBasecost,
      profit,
      supplier: selectedSupplier,
      sku,
      currency: r[colMap.currency] || 'USD',
      status: r[colMap.paymentStatus] || 'Paid',
    });
  }
  return orders;
}

// ============================================
// STYLES
// ============================================
const S = {
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 },
  btn: { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'inherit' },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', width: '100%' },
  select: { padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14, fontFamily: 'inherit' },
  th: { padding: '10px 12px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid var(--border)' },
  td: { padding: '10px 12px', borderBottom: '1px solid rgba(30,41,59,0.2)', fontSize: 13 },
  mono: { fontFamily: "'Space Mono', monospace" },
  badge: (color) => ({ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: color + '15', color }),
};

function formatUSD(n) { return '$' + n.toFixed(2); }
function formatVND(n) {
  if (Math.abs(n) >= 1e9) return (n/1e9).toFixed(1) + ' tỷ';
  if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(1) + 'M';
  if (Math.abs(n) >= 1e3) return (n/1e3).toFixed(0) + 'K';
  return n.toFixed(0);
}

// ============================================
// COMPONENTS
// ============================================
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ ...S.card, position: 'relative', overflow: 'hidden' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 6, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, ...S.mono }}>{value}</div>
      {sub && <div style={{ color, fontSize: 12, marginTop: 6, fontWeight: 500 }}>{sub}</div>}
    </div>
  );
}

function CSVUploadModule({ onDataProcessed, processedData }) {
  const [selectedShop, setSelectedShop] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!selectedShop) { setError('Vui lòng chọn Shop trước khi upload'); return; }
    if (!selectedSupplier) { setError('Vui lòng chọn Supplier trước khi upload'); return; }
    setError('');
    setFileName(file.name);
    setProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = parseCSVText(text);
        const orders = processEtsyCSV(rows, selectedShop, selectedSupplier);

        if (orders.length === 0) {
          setError('Không tìm thấy đơn hàng nào trong file. Kiểm tra lại format CSV.');
          setProcessing(false);
          return;
        }

        setPreview({
          total: orders.length,
          revenue: orders.reduce((s, o) => s + o.revenue, 0),
          profit: orders.reduce((s, o) => s + o.profit, 0),
          basecost: orders.reduce((s, o) => s + o.basecost, 0),
          fee: orders.reduce((s, o) => s + o.platformFee, 0),
          orders,
        });
        setProcessing(false);
      } catch (err) {
        setError('Lỗi xử lý file: ' + err.message);
        setProcessing(false);
      }
    };
    reader.readAsText(file);
  }, [selectedShop, selectedSupplier]);

  const confirmUpload = () => {
    if (preview) {
      onDataProcessed(prev => [...prev, ...preview.orders.map(o => ({ ...o, month: selectedMonth }))]);
      setPreview(null);
      setFileName('');
    }
  };

  return (
    <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>📤 Upload CSV đơn hàng</h2>

      {/* Step 1: Select shop & supplier */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Bước 1: Chọn thông tin</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>SHOP</label>
            <select style={S.select} value={selectedShop} onChange={e => setSelectedShop(e.target.value)}>
              <option value="">-- Chọn shop --</option>
              {SHOPS.map(s => <option key={s.name} value={s.name}>{s.name} ({s.type})</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>SUPPLIER</label>
            <select style={S.select} value={selectedSupplier} onChange={e => setSelectedSupplier(e.target.value)}>
              <option value="">-- Chọn supplier --</option>
              <option value="Phương Nhi">Phương Nhi</option>
              <option value="Pet">Pet</option>
              <option value="Zootop Bear">Zootop Bear</option>
              <option value="TRIO">TRIO</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>THÁNG</label>
            <select style={S.select} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
              <option value="">-- Chọn tháng --</option>
              <option value="2026-01">Tháng 1/2026</option>
              <option value="2026-02">Tháng 2/2026</option>
              <option value="2026-03">Tháng 3/2026</option>
              <option value="2026-04">Tháng 4/2026</option>
              <option value="2026-05">Tháng 5/2026</option>
              <option value="2026-06">Tháng 6/2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Step 2: Upload */}
      <div style={{ ...S.card, marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Bước 2: Upload file CSV</h3>
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={e => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 12, padding: 48, textAlign: 'center', cursor: 'pointer',
            background: isDragging ? 'rgba(59,130,246,0.05)' : 'transparent',
            transition: 'all 0.2s',
          }}
        >
          <input ref={fileRef} type="file" accept=".csv,.tsv" style={{ display: 'none' }}
            onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
          {processing ? (
            <div>
              <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <div style={{ color: 'var(--text-muted)' }}>Đang xử lý...</div>
            </div>
          ) : fileName ? (
            <div>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
              <div style={{ color: 'var(--accent)', fontWeight: 600 }}>{fileName}</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 4 }}>Click để chọn file khác</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
              <div style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>Kéo thả file CSV vào đây</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>hoặc click để chọn file</div>
              <div style={{ color: 'var(--text-dim)', fontSize: 12, marginTop: 12 }}>
                Hỗ trợ: Etsy Orders CSV, Etsy Sales CSV
              </div>
            </div>
          )}
        </div>
        {error && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Step 3: Preview & Confirm */}
      {preview && (
        <div style={{ ...S.card, marginBottom: 20, borderColor: 'var(--accent)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Bước 3: Xác nhận dữ liệu</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(59,130,246,0.08)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Tổng đơn</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)', ...S.mono }}>{preview.total}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(16,185,129,0.08)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Revenue</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)', ...S.mono }}>{formatUSD(preview.revenue)}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(245,158,11,0.08)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Basecost</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--orange)', ...S.mono }}>{formatUSD(preview.basecost)}</div>
            </div>
            <div style={{ padding: 16, borderRadius: 10, background: 'rgba(139,92,246,0.08)' }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>Profit</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: preview.profit >= 0 ? 'var(--green)' : 'var(--red)', ...S.mono }}>{formatUSD(preview.profit)}</div>
            </div>
          </div>

          {/* Preview table */}
          <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Ngày', 'Sản phẩm', 'Size', 'SL', 'Revenue', 'Basecost', 'Profit', 'Khách hàng'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.orders.slice(0, 20).map((o, i) => (
                  <tr key={i}>
                    <td style={{ ...S.td, ...S.mono, color: 'var(--text-dim)' }}>{i + 1}</td>
                    <td style={{ ...S.td, fontSize: 12 }}>{o.date}</td>
                    <td style={{ ...S.td, fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.productType}</td>
                    <td style={{ ...S.td, ...S.mono }}>{o.size}</td>
                    <td style={{ ...S.td, ...S.mono, textAlign: 'center' }}>{o.quantity}</td>
                    <td style={{ ...S.td, ...S.mono, color: 'var(--accent-light)' }}>{formatUSD(o.revenue)}</td>
                    <td style={{ ...S.td, ...S.mono, color: 'var(--orange)' }}>{formatUSD(o.basecost)}</td>
                    <td style={{ ...S.td, ...S.mono, color: o.profit >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{formatUSD(o.profit)}</td>
                    <td style={{ ...S.td, fontSize: 12, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.buyer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.total > 20 && (
              <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-dim)', fontSize: 13 }}>
                ... và {preview.total - 20} đơn hàng khác
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={confirmUpload} style={{ ...S.btn, background: 'var(--green)', color: '#fff', flex: 1 }}>
              ✅ Xác nhận & Lưu ({preview.total} đơn)
            </button>
            <button onClick={() => { setPreview(null); setFileName(''); }} style={{ ...S.btn, background: 'var(--border)', color: 'var(--text-muted)' }}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {processedData.length > 0 && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>📋 Dữ liệu đã upload ({processedData.length} đơn)</h3>
            <button onClick={() => onDataProcessed([])} style={{ ...S.btn, background: 'rgba(239,68,68,0.1)', color: 'var(--red)', fontSize: 12, padding: '6px 14px' }}>
              Xóa tất cả
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[...new Set(processedData.map(o => o.shop))].map(shop => {
              const shopOrders = processedData.filter(o => o.shop === shop);
              return (
                <div key={shop} style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(59,130,246,0.08)', fontSize: 13 }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{shop}</span>
                  <span style={{ color: 'var(--text-dim)', marginLeft: 8 }}>{shopOrders.length} đơn</span>
                  <span style={{ color: 'var(--green)', marginLeft: 8, ...S.mono }}>{formatUSD(shopOrders.reduce((s, o) => s + o.profit, 0))}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersView({ orders }) {
  const [search, setSearch] = useState('');
  const [filterShop, setFilterShop] = useState('');
  const filtered = orders.filter(o => {
    if (filterShop && o.shop !== filterShop) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.buyer.toLowerCase().includes(q) || o.orderId.toLowerCase().includes(q) || o.productType.toLowerCase().includes(q) || o.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>📦 Đơn hàng ({orders.length})</h2>
      {orders.length === 0 ? (
        <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 16 }}>Chưa có dữ liệu đơn hàng</div>
          <div style={{ color: 'var(--text-dim)', fontSize: 13, marginTop: 8 }}>Upload CSV ở tab "Upload CSV" để bắt đầu</div>
        </div>
      ) : (
        <div style={S.card}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <input placeholder="Tìm theo buyer, order ID, sản phẩm, SKU..." style={{ ...S.input, flex: 1 }}
              value={search} onChange={e => setSearch(e.target.value)} />
            <select style={S.select} value={filterShop} onChange={e => setFilterShop(e.target.value)}>
              <option value="">Tất cả shop</option>
              {[...new Set(orders.map(o => o.shop))].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--card)' }}>
                <tr>
                  {['#', 'Ngày', 'Shop', 'Sản phẩm', 'Size', 'Buyer', 'Địa chỉ', 'Revenue', 'Basecost', 'Profit'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map((o, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...S.td, ...S.mono, color: 'var(--text-dim)', fontSize: 11 }}>{i + 1}</td>
                    <td style={{ ...S.td, fontSize: 12, whiteSpace: 'nowrap' }}>{o.date}</td>
                    <td style={{ ...S.td, fontSize: 12 }}><span style={S.badge('var(--accent)')}>{o.shop.substring(0, 12)}</span></td>
                    <td style={{ ...S.td, fontWeight: 500, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.productType} {o.color && `(${o.color})`}</td>
                    <td style={{ ...S.td, ...S.mono, textAlign: 'center' }}>{o.size}</td>
                    <td style={{ ...S.td, fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.buyer}</td>
                    <td style={{ ...S.td, fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-dim)' }}>{o.address}</td>
                    <td style={{ ...S.td, ...S.mono, color: 'var(--accent-light)' }}>{formatUSD(o.revenue)}</td>
                    <td style={{ ...S.td, ...S.mono, color: 'var(--orange)' }}>{formatUSD(o.basecost)}</td>
                    <td style={{ ...S.td, ...S.mono, fontWeight: 600, color: o.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatUSD(o.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 100 && <div style={{ textAlign: 'center', padding: 12, color: 'var(--text-dim)', fontSize: 13 }}>Hiển thị 100/{filtered.length} đơn</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsView({ orders }) {
  if (orders.length === 0) {
    return (
      <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>📈 Báo cáo</h2>
        <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <div style={{ color: 'var(--text-muted)' }}>Upload CSV trước để xem báo cáo</div>
        </div>
      </div>
    );
  }

  const byShop = {};
  orders.forEach(o => {
    if (!byShop[o.shop]) byShop[o.shop] = { orders: 0, revenue: 0, basecost: 0, fee: 0, profit: 0 };
    byShop[o.shop].orders += o.quantity;
    byShop[o.shop].revenue += o.revenue;
    byShop[o.shop].basecost += o.basecost;
    byShop[o.shop].fee += o.platformFee;
    byShop[o.shop].profit += o.profit;
  });

  const byProduct = {};
  orders.forEach(o => {
    if (!byProduct[o.productType]) byProduct[o.productType] = { count: 0, revenue: 0, profit: 0 };
    byProduct[o.productType].count += o.quantity;
    byProduct[o.productType].revenue += o.revenue;
    byProduct[o.productType].profit += o.profit;
  });

  const totalRevenue = orders.reduce((s, o) => s + o.revenue, 0);
  const totalProfit = orders.reduce((s, o) => s + o.profit, 0);
  const totalBasecost = orders.reduce((s, o) => s + o.basecost, 0);
  const totalFee = orders.reduce((s, o) => s + o.platformFee, 0);
  const maxShopRevenue = Math.max(...Object.values(byShop).map(s => s.revenue));

  return (
    <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>📈 Báo cáo tổng hợp</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon="📦" label="TỔNG ĐƠN" value={orders.length} color="var(--accent)" />
        <StatCard icon="💵" label="REVENUE" value={formatUSD(totalRevenue)} sub={formatVND(totalRevenue * RATE) + ' ₫'} color="var(--green)" />
        <StatCard icon="💰" label="BASECOST + FEE" value={formatUSD(totalBasecost + totalFee)} color="var(--orange)" />
        <StatCard icon="📈" label="PROFIT" value={formatUSD(totalProfit)} sub={formatVND(totalProfit * RATE) + ' ₫'} color="var(--purple)" />
      </div>

      {/* By Shop */}
      <div style={{ ...S.card, marginBottom: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Hiệu suất theo Shop</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Shop', 'Đơn', 'Revenue', 'Basecost', 'Fee (20%)', 'Profit', 'Margin', 'Chart'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(byShop).sort((a, b) => b[1].revenue - a[1].revenue).map(([shop, data]) => (
              <tr key={shop}>
                <td style={{ ...S.td, fontWeight: 600 }}>{shop}</td>
                <td style={{ ...S.td, ...S.mono }}>{data.orders}</td>
                <td style={{ ...S.td, ...S.mono, color: 'var(--accent-light)' }}>{formatUSD(data.revenue)}</td>
                <td style={{ ...S.td, ...S.mono, color: 'var(--orange)' }}>{formatUSD(data.basecost)}</td>
                <td style={{ ...S.td, ...S.mono, color: 'var(--text-dim)' }}>{formatUSD(data.fee)}</td>
                <td style={{ ...S.td, ...S.mono, fontWeight: 700, color: data.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatUSD(data.profit)}</td>
                <td style={{ ...S.td, ...S.mono, color: data.revenue > 0 ? 'var(--green)' : 'var(--text-dim)' }}>{data.revenue > 0 ? (data.profit / data.revenue * 100).toFixed(1) + '%' : '-'}</td>
                <td style={S.td}>
                  <div style={{ width: '100%', height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: (data.revenue / maxShopRevenue * 100) + '%', height: '100%', background: 'linear-gradient(to right, var(--accent), var(--green))', borderRadius: 4 }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ borderTop: '2px solid var(--border)' }}>
              <td style={{ ...S.td, fontWeight: 700 }}>TỔNG</td>
              <td style={{ ...S.td, ...S.mono, fontWeight: 700 }}>{orders.length}</td>
              <td style={{ ...S.td, ...S.mono, fontWeight: 700, color: 'var(--accent-light)' }}>{formatUSD(totalRevenue)}</td>
              <td style={{ ...S.td, ...S.mono, fontWeight: 700, color: 'var(--orange)' }}>{formatUSD(totalBasecost)}</td>
              <td style={{ ...S.td, ...S.mono, fontWeight: 700, color: 'var(--text-dim)' }}>{formatUSD(totalFee)}</td>
              <td style={{ ...S.td, ...S.mono, fontWeight: 700, color: totalProfit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatUSD(totalProfit)}</td>
              <td style={{ ...S.td, ...S.mono, fontWeight: 700 }}>{totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) + '%' : '-'}</td>
              <td style={S.td}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* By Product */}
      <div style={S.card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Top sản phẩm</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Sản phẩm', 'Số lượng', 'Revenue', 'Profit', '% tổng revenue'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(byProduct).sort((a, b) => b[1].count - a[1].count).slice(0, 15).map(([product, data]) => (
              <tr key={product}>
                <td style={{ ...S.td, fontWeight: 500 }}>{product}</td>
                <td style={{ ...S.td, ...S.mono }}>{data.count}</td>
                <td style={{ ...S.td, ...S.mono, color: 'var(--accent-light)' }}>{formatUSD(data.revenue)}</td>
                <td style={{ ...S.td, ...S.mono, color: data.profit >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatUSD(data.profit)}</td>
                <td style={{ ...S.td, ...S.mono, color: 'var(--text-dim)' }}>{totalRevenue > 0 ? (data.revenue / totalRevenue * 100).toFixed(1) + '%' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
const menuItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'upload', icon: '📤', label: 'Upload CSV' },
  { id: 'orders', icon: '📦', label: 'Đơn hàng' },
  { id: 'reports', icon: '📈', label: 'Báo cáo' },
  { id: 'shops', icon: '🏪', label: 'Quản lý Shop' },
  { id: 'basecost', icon: '💰', label: 'Basecost' },
  { id: 'settings', icon: '⚙️', label: 'Cài đặt' },
];

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allOrders, setAllOrders] = useState([]);

  const totalOrders = allOrders.length;
  const totalRevenue = allOrders.reduce((s, o) => s + o.revenue, 0);
  const totalProfit = allOrders.reduce((s, o) => s + o.profit, 0);
  const shopCount = new Set(allOrders.map(o => o.shop)).size || SHOPS.length;

  const renderContent = () => {
    switch (activeMenu) {
      case 'upload':
        return <CSVUploadModule onDataProcessed={setAllOrders} processedData={allOrders} />;
      case 'orders':
        return <OrdersView orders={allOrders} />;
      case 'reports':
        return <ReportsView orders={allOrders} />;
      case 'basecost':
        return (
          <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>💰 Bảng Basecost</h2>
            {Object.entries(BASECOST_DB).map(([supplier, products]) => (
              <div key={supplier} style={{ ...S.card, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{supplier}</h3>
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Sản phẩm', 'Giá (USD)', 'Ghi chú'].map(h => <th key={h} style={S.th}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(products).map(([product, sizes]) => (
                        sizes._all !== undefined ? (
                          <tr key={product}>
                            <td style={{ ...S.td, fontWeight: 500 }}>{product} (tất cả size)</td>
                            <td style={{ ...S.td, ...S.mono, color: 'var(--accent-light)' }}>${sizes._all}</td>
                            <td style={S.td}>Giá cố định</td>
                          </tr>
                        ) : Object.entries(sizes).map(([size, prices]) => (
                          <tr key={product + size}>
                            <td style={{ ...S.td, fontWeight: 500 }}>{product} — {size}</td>
                            <td style={{ ...S.td, ...S.mono, color: 'var(--accent-light)' }}>${prices[0]}</td>
                            <td style={{ ...S.td, color: 'var(--text-dim)', fontSize: 12 }}>
                              3 mức: ${prices.join(' / $')}
                            </td>
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        );
      case 'shops':
        return (
          <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>🏪 Quản lý Shop</h2>
            <div style={S.card}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['#', 'Tên Shop', 'Loại', 'Email', 'Proxy', 'Etsy Plus'].map(h => <th key={h} style={S.th}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {SHOPS.map((s, i) => (
                    <tr key={s.name}>
                      <td style={{ ...S.td, ...S.mono, color: 'var(--text-dim)' }}>{i + 1}</td>
                      <td style={{ ...S.td, fontWeight: 600 }}>{s.name}</td>
                      <td style={S.td}><span style={S.badge(s.type === 'Digital' ? 'var(--purple)' : 'var(--accent)')}>{s.type}</span></td>
                      <td style={{ ...S.td, fontSize: 12, color: 'var(--text-dim)' }}>{s.email}</td>
                      <td style={{ ...S.td, ...S.mono }}>$2/th</td>
                      <td style={S.td}><span style={S.badge('var(--green)')}>CÓ</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default: // dashboard
        return (
          <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
              <StatCard icon="📦" label="TỔNG ĐƠN HÀNG" value={totalOrders || '—'} sub={totalOrders > 0 ? 'Từ CSV upload' : 'Upload CSV để bắt đầu'} color="var(--accent)" />
              <StatCard icon="💵" label="TỔNG REVENUE" value={totalOrders > 0 ? formatUSD(totalRevenue) : '—'} sub={totalOrders > 0 ? formatVND(totalRevenue * RATE) + ' ₫' : ''} color="var(--green)" />
              <StatCard icon="📈" label="TỔNG PROFIT" value={totalOrders > 0 ? formatUSD(totalProfit) : '—'} sub={totalOrders > 0 ? formatVND(totalProfit * RATE) + ' ₫' : ''} color="var(--purple)" />
              <StatCard icon="🏪" label="SHOP" value={SHOPS.length} sub={SHOPS.filter(s => s.type === 'Vật lý').length + ' vật lý • ' + SHOPS.filter(s => s.type === 'Digital').length + ' digital'} color="var(--orange)" />
            </div>

            {totalOrders === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🚀</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Chào mừng Bin đến với NBECOM!</div>
                <div style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Bắt đầu bằng cách upload file CSV đơn hàng từ Etsy</div>
                <button onClick={() => setActiveMenu('upload')} style={{ ...S.btn, background: 'var(--accent)', color: '#fff', fontSize: 16, padding: '14px 32px' }}>
                  📤 Upload CSV ngay
                </button>
              </div>
            ) : (
              <ReportsView orders={allOrders} />
            )}
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 240 : 68, background: 'var(--card)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s ease', flexShrink: 0,
      }}>
        <div style={{ padding: sidebarOpen ? '24px 20px' : '24px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>N</div>
          {sidebarOpen && <div><div style={{ fontWeight: 700, fontSize: 15 }}>NBECOM</div><div style={{ fontSize: 10, color: 'var(--text-dim)' }}>Management v2.0</div></div>}
        </div>

        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {menuItems.map(item => (
            <div key={item.id} onClick={() => setActiveMenu(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: sidebarOpen ? '10px 14px' : '10px',
              borderRadius: 8, marginBottom: 2, cursor: 'pointer',
              background: activeMenu === item.id ? 'rgba(59,130,246,0.1)' : 'transparent',
              borderLeft: activeMenu === item.id ? '3px solid var(--accent)' : '3px solid transparent',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
            }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: 13, fontWeight: activeMenu === item.id ? 600 : 400, color: activeMenu === item.id ? 'var(--accent)' : 'var(--text-muted)' }}>{item.label}</span>}
              {item.id === 'upload' && sidebarOpen && <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--green)', color: '#fff', fontWeight: 700 }}>MỚI</span>}
            </div>
          ))}
        </nav>

        <div onClick={() => setSidebarOpen(!sidebarOpen)} style={{ padding: 14, borderTop: '1px solid var(--border)', cursor: 'pointer', textAlign: 'center', color: 'var(--text-dim)', fontSize: 16 }}>
          {sidebarOpen ? '◀' : '▶'}
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header style={{
          padding: '16px 28px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700 }}>{menuItems.find(m => m.id === activeMenu)?.icon} {menuItems.find(m => m.id === activeMenu)?.label}</h1>
            <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>NBECOM Management System</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {totalOrders > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-dim)', ...S.mono }}>{totalOrders} đơn • {formatUSD(totalProfit)} profit</div>
            )}
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>B</div>
          </div>
        </header>

        <div style={{ padding: '24px 28px' }}>
          {renderContent()}
          <div style={{ textAlign: 'center', padding: '24px 0 12px', color: 'var(--text-dim)', fontSize: 11 }}>
            NBECOM Management System v2.0 • Powered by Lisa AI 💙
          </div>
        </div>
      </main>
    </div>
  );
}
