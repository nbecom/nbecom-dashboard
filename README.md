# NBECOM Dashboard v5.7

Hệ thống quản lý nội bộ NBECOM — tích hợp Gmail Sync + CSV upload

## ✨ Mới trong v5.7

- 📧 **Gmail Sync (Phase 1)** — Kết nối Gmail master qua OAuth2, test fetch emails
- 🔐 OAuth2 flow với access_token + refresh_token auto-refresh
- 🧪 Test fetch emails với Gmail query (from, subject, newer_than, etc.)
- 🎯 Chuẩn bị cho Phase 2-4: Parser, Auto import, Cron, Review

## 📋 Tính năng đầy đủ

- 🔐 Auth system (Login/Register/Admin) + Upstash Redis
- 📤 Upload CSV (Order Items + Statement)
- 💰 Basecost Database (4 suppliers)
- 📦 Đơn hàng với phân trang, filter tháng/năm/shop
- 📈 Báo cáo tài chính chính xác từ Etsy Statement
- 🖼️ Quản lý hình ảnh sản phẩm
- 🏪 Quản lý Shop động
- 👥 Quản lý người dùng + phân quyền
- 🔖 Bookmarklet lấy ảnh Etsy
- **📧 Gmail Sync — NEW!**

## 🚀 Deploy

**Stack:** Next.js 14 • Upstash Redis • Vercel

### Vercel Environment Variables (BẮT BUỘC cho Gmail Sync)

Vào Vercel → Project → Settings → Environment Variables → thêm:

```
GOOGLE_CLIENT_ID=<client_id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-<secret>
GMAIL_REDIRECT_URI=https://nbecom.app/api/auth/gmail/callback
```

Các env var hiện có (giữ nguyên):
```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Sau khi add env vars → Redeploy để Vercel load variables mới.

## 🔧 Google Cloud Setup

1. Tạo project ở https://console.cloud.google.com
2. Enable **Gmail API**
3. **OAuth consent screen** → External → add scope `https://www.googleapis.com/auth/gmail.readonly`
4. Add **Test Users** (Gmail dùng để kết nối)
5. **Credentials → Create OAuth client ID → Web application:**
   - Authorized JavaScript origins: `https://nbecom.app`
   - Authorized redirect URIs: `https://nbecom.app/api/auth/gmail/callback`
6. Copy Client ID + Secret → add vào Vercel env vars

## 📧 Quy trình Gmail Sync

1. Login NBECOM với tài khoản Admin
2. Menu trái → **📧 Gmail Sync**
3. Click **🔗 Kết nối Gmail** → redirect sang Google
4. Đăng nhập master Gmail + grant permission
5. Quay về NBECOM với status "Đã kết nối"
6. Test fetch: gõ query (ví dụ `from:(@etsy.com)`) → xem 10 email gần nhất

## 🐛 Troubleshooting

- **Error "redirect_uri_mismatch":** Redirect URI trong Google Cloud phải khớp CHÍNH XÁC với env var `GMAIL_REDIRECT_URI`
- **Error "access_denied":** Gmail chưa nằm trong Test Users list (OAuth consent screen)
- **Token hết hạn:** App tự động refresh. Nếu không có refresh_token → phải disconnect và connect lại
- **"GOOGLE_CLIENT_ID chưa được cấu hình":** Env vars chưa add vào Vercel hoặc chưa redeploy

## 🗂️ Redis Keys

**Existing:**
- `session:{token}` — user session
- `user:{username}` — user account
- `orders:{shop}:{month}` — orders
- `stmt:{shop}:{month}` — statement
- `product_images` — listing images
- `custom_shops` — shop list

**New v5.7:**
- `gmail:tokens` — { access_token, refresh_token, expiry_date, email, ... }

## 📖 Version History

- v5.0 — Initial Next.js release
- v5.1-5.5 — Shop management, bookmarklet, product listings
- v5.6 — Fixed Statement dedup (refund + typeBreakdown)
- **v5.7 — Gmail Sync Phase 1 (OAuth + Test fetch)**

Phase roadmap:
- Phase 2 — Etsy email parser + auto import orders
- Phase 3 — Vercel Cron auto-sync every 5min + re-sync by date range
- Phase 4 — Parse failed review + profit rules + audit log
