'use client';
import { useState } from 'react';

const shops = [
  { name: 'LNTArtStudio', type: 'Vật lý', orders: 25, revenue: 14373600, profit: 3416380, status: 'active' },
  { name: 'QuinnCreativeDesign', type: 'Vật lý', orders: 41, revenue: 52337224, profit: 38693118, status: 'active' },
  { name: 'HADesignConner', type: 'Vật lý', orders: 32, revenue: 36367901, profit: 25870491, status: 'active' },
  { name: 'EmbroideryTVT', type: 'Vật lý', orders: 58, revenue: 56721276, profit: 38700819, status: 'active' },
  { name: 'NDAHandmadeEMB', type: 'Vật lý', orders: 56, revenue: 41263316, profit: 26644952, status: 'active' },
  { name: 'ThiHoaEmbroidery', type: 'Vật lý', orders: 11, revenue: 14462062, profit: 7373798, status: 'active' },
  { name: 'TonyHungGift', type: 'Vật lý', orders: 2, revenue: 1486671, profit: 911744, status: 'warning' },
  { name: 'EmbroideryAnhThu', type: 'Digital', orders: 338, revenue: 32861013, profit: 15565930, status: 'active' },
  { name: 'EmbroideryTuanAnh', type: 'Digital', orders: 350, revenue: 31909726, profit: 15434899, status: 'active' },
  { name: 'BumMachineEmbroidery', type: 'Digital', orders: 167, revenue: 13537855, profit: 4782325, status: 'active' },
  { name: 'NINNEmbroidery', type: 'Digital', orders: 78, revenue: 5054766, profit: 891652, status: 'warning' },
];

const monthlyData = [
  { month: 'T10', revenue: 142, profit: 48 },
  { month: 'T11', revenue: 168, profit: 55 },
  { month: 'T12', revenue: 195, profit: 72 },
  { month: 'T1', revenue: 178, profit: 61 },
  { month: 'T2', revenue: 210, profit: 78 },
  { month: 'T3', revenue: 248, profit: 92 },
];

const recentOrders = [
  { id: '#3990951845', shop: 'LNTArtStudio', product: 'Sweatshirt - L', buyer: 'Jasmeen Mangat', amount: '$54.24', status: 'Paid' },
  { id: '#3990663281', shop: 'NDAHandmadeEMB', product: 'Wash Hat', buyer: 'Mike R Brooks', amount: '$34.38', status: 'Paid' },
  { id: '#3991646683', shop: 'HADesignConner', product: 'Football Jersey M', buyer: 'Natasha Ansari', amount: '$45.45', status: 'Paid' },
  { id: '#3992108405', shop: 'ThiHoaEmbroidery', product: 'Sweatshirt L', buyer: 'MAUNG SUNNY', amount: '$64.29', status: 'Paid' },
  { id: '#3990812487', shop: 'EmbroideryTVT', product: 'Embroidered Cap', buyer: 'Mikayla Kneebone', amount: '$38.97', status: 'Paid' },
];

const menuItems = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'orders', icon: '📦', label: 'Đơn hàng' },
  { id: 'shops', icon: '🏪', label: 'Quản lý Shop' },
  { id: 'reports', icon: '📈', label: 'Báo cáo' },
  { id: 'basecost', icon: '💰', label: 'Basecost' },
  { id: 'payout', icon: '🏦', label: 'Payout & Công nợ' },
  { id: 'refund', icon: '🔄', label: 'Cancel / Refund' },
  { id: 'designer', icon: '🎨', label: 'Designer' },
  { id: 'staff', icon: '👥', label: 'Nhân sự' },
  { id: 'settings', icon: '⚙️', label: 'Cài đặt' },
];

function formatVND(n) {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + ' tỷ';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return n.toString();
}

export default function Home() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const totalOrders = shops.reduce((s, sh) => s + sh.orders, 0);
  const totalRevenue = shops.reduce((s, sh) => s + sh.revenue, 0);
  const totalProfit = shops.reduce((s, sh) => s + sh.profit, 0);
  const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));

  return (
    <div style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 260 : 72,
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        flexShrink: 0,
        animation: 'slideIn 0.4s ease',
      }}>
        <div style={{
          padding: sidebarOpen ? '28px 24px' : '28px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700, flexShrink: 0, color: '#fff',
          }}>N</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}>NBECOM</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Management System</div>
            </div>
          )}
        </div>

        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveMenu(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: sidebarOpen ? '12px 16px' : '12px',
                borderRadius: 10, marginBottom: 4, cursor: 'pointer',
                background: activeMenu === item.id ? 'rgba(59,130,246,0.08)' : 'transparent',
                borderLeft: activeMenu === item.id ? '3px solid var(--accent)' : '3px solid transparent',
                transition: 'all 0.2s ease',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{
                  fontSize: 14,
                  fontWeight: activeMenu === item.id ? 600 : 400,
                  color: activeMenu === item.id ? 'var(--accent)' : 'var(--text-muted)',
                }}>{item.label}</span>
              )}
            </div>
          ))}
        </nav>

        <div
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            padding: 16, borderTop: '1px solid var(--border)',
            cursor: 'pointer', textAlign: 'center',
            color: 'var(--text-dim)', fontSize: 18,
          }}
        >{sidebarOpen ? '◀' : '▶'}</div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Top Bar */}
        <header style={{
          padding: '20px 32px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(17,24,39,0.8)',
          backdropFilter: 'blur(12px)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Dashboard</h1>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>Báo cáo tháng 3/2026 • Dữ liệu đến 05/04</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              padding: '8px 16px', borderRadius: 8,
              background: 'var(--border)', fontSize: 13,
              color: 'var(--text-muted)', cursor: 'pointer',
            }}>Tháng 3, 2026 ▾</div>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#fff',
            }}>B</div>
          </div>
        </header>

        <div style={{ padding: '28px 32px' }}>
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
            {[
              { icon: '📦', label: 'TỔNG ĐƠN HÀNG', value: totalOrders.toLocaleString(), sub: '↑ 12% so với T2', color: 'var(--accent)' },
              { icon: '💵', label: 'TỔNG REVENUE', value: formatVND(totalRevenue) + ' ₫', sub: '↑ 18% so với T2', color: 'var(--green)' },
              { icon: '📈', label: 'TỔNG PROFIT', value: formatVND(totalProfit) + ' ₫', sub: '↑ 15% so với T2', color: 'var(--purple)' },
              { icon: '🏪', label: 'SHOP HOẠT ĐỘNG', value: shops.length, sub: `${shops.filter(s=>s.type==='Vật lý').length} vật lý • ${shops.filter(s=>s.type==='Digital').length} digital`, color: 'var(--orange)' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 24, position: 'relative', overflow: 'hidden',
                animation: `fadeSlideUp 0.6s ease ${0.1 + i * 0.1}s both`,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 6, letterSpacing: 0.5 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>{stat.value}</div>
                <div style={{ color: stat.color, fontSize: 13, marginTop: 6, fontWeight: 500 }}>{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 24, marginBottom: 28,
            animation: 'fadeSlideUp 0.6s ease 0.5s both',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>Doanh số theo tháng</h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>Revenue vs Profit (triệu VNĐ)</p>
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--accent)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Revenue</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Profit</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160, padding: '0 4px' }}>
              {monthlyData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'Space Mono', monospace" }}>{d.revenue}M</div>
                  <div style={{ position: 'relative', width: '100%', display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <div style={{
                      width: '45%', borderRadius: '4px 4px 0 0',
                      height: (d.revenue / maxRevenue) * 120,
                      background: 'linear-gradient(to top, var(--accent), var(--accent-light))',
                      animation: `growUp 0.8s ease ${0.1 * i}s both`,
                    }} />
                    <div style={{
                      width: '45%', borderRadius: '4px 4px 0 0',
                      height: (d.profit / maxRevenue) * 120,
                      background: 'linear-gradient(to top, rgba(16,185,129,0.5), var(--green))',
                      animation: `growUp 0.8s ease ${0.1 * i + 0.05}s both`,
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', fontWeight: 500 }}>{d.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Shop Table */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 24, marginBottom: 28,
            animation: 'fadeSlideUp 0.6s ease 0.6s both',
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Hiệu suất theo Shop — Tháng 3/2026</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Shop', 'Loại', 'Đơn hàng', 'Revenue', 'Profit', 'Trạng thái'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        color: 'var(--text-dim)', fontWeight: 500, fontSize: 12,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {shops.map((shop, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(30,41,59,0.3)', cursor: 'pointer' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            background: shop.type === 'Digital' ? 'rgba(139,92,246,0.12)' : 'rgba(59,130,246,0.12)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                          }}>{shop.type === 'Digital' ? '🖥' : '🧵'}</div>
                          {shop.name}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                          background: shop.type === 'Digital' ? 'rgba(139,92,246,0.1)' : 'rgba(59,130,246,0.1)',
                          color: shop.type === 'Digital' ? 'var(--purple)' : 'var(--accent)',
                        }}>{shop.type}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: "'Space Mono', monospace" }}>{shop.orders}</td>
                      <td style={{ padding: '14px 16px', fontFamily: "'Space Mono', monospace", color: 'var(--accent-light)' }}>{formatVND(shop.revenue)} ₫</td>
                      <td style={{ padding: '14px 16px', fontFamily: "'Space Mono', monospace", color: 'var(--green)' }}>{formatVND(shop.profit)} ₫</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: shop.status === 'active' ? 'var(--green)' : 'var(--orange)',
                            animation: 'pulse 2s infinite',
                          }} />
                          <span style={{ fontSize: 12, color: shop.status === 'active' ? 'var(--green)' : 'var(--orange)' }}>
                            {shop.status === 'active' ? 'Hoạt động' : 'Cảnh báo'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders */}
          <div style={{
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 24,
            animation: 'fadeSlideUp 0.6s ease 0.7s both',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>Đơn hàng gần đây</h3>
              <div style={{
                padding: '6px 14px', borderRadius: 6,
                background: 'rgba(16,185,129,0.1)', color: 'var(--green)',
                fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 1.5s infinite' }} />
                API Connected
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Order ID', 'Shop', 'Sản phẩm', 'Khách hàng', 'Giá', 'Trạng thái'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        color: 'var(--text-dim)', fontWeight: 500, fontSize: 12,
                        textTransform: 'uppercase', letterSpacing: 0.5,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(30,41,59,0.15)' }}>
                      <td style={{ padding: '14px 16px', fontFamily: "'Space Mono', monospace", color: 'var(--accent)' }}>{order.id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>{order.shop}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{order.product}</td>
                      <td style={{ padding: '14px 16px' }}>{order.buyer}</td>
                      <td style={{ padding: '14px 16px', fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>{order.amount}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                          background: 'rgba(16,185,129,0.1)', color: 'var(--green)',
                        }}>{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '32px 0 16px', color: 'var(--text-dim)', fontSize: 12 }}>
            NBECOM Management System v1.0 • Powered by Lisa AI 💙
          </div>
        </div>
      </main>
    </div>
  );
}
