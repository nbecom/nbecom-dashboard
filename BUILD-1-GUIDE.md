# NBECOM v6.0 — Build 1 (Backend) — Hướng dẫn cho Bin

## ✅ Đã xong trong Build 1

**Backend hoàn chỉnh** — 16 files, ~1200 dòng code:

### 1. Hệ thống Auth & Phân quyền
- `src/lib/nbecom-schema.js` — Schema Redis + helpers phân quyền 3 tầng
- `src/lib/auth.js` — Session + middleware kiểm tra feature
- `src/lib/auth-handlers.js` — Register, login, logout, me

### 2. API Boards
- `POST/GET /api/boards` — tạo/liệt kê board
- `GET/PATCH/DELETE /api/boards/:id` — chi tiết board
- `GET/POST/DELETE /api/boards/:id/members` — cấp quyền member

### 3. API Lists & Cards
- `POST /api/lists` + `PATCH/DELETE /api/lists/:id` — CRUD cột
- `POST /api/cards` + `GET/PATCH/DELETE /api/cards/:id` — CRUD thẻ
- `POST /api/cards/:id/move` — kéo-thả (tự chấm điểm khi vào Done)

### 4. API Admin
- `GET/POST /api/admin/users` — duyệt user pending
- `GET/POST/DELETE /api/admin/score-levels` — cấu hình mức điểm
- `GET /api/admin/scores?month=yyyy-mm` — bảng điểm tất cả designer

### 5. API Scoring
- `GET /api/scores/me?month=yyyy-mm` — điểm của mình + so sánh tháng trước

---

## 🧪 Bin cần test những gì?

Sau khi deploy lên Vercel, Bin mở **Chrome DevTools → Console** và chạy các lệnh test sau:

### Test 1 — Đăng ký user đầu tiên (tự động thành Admin)
```js
fetch('/api/auth/register', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({email: 'bin@nbecom.app', name: 'Bin', password: 'binpass123'})
}).then(r=>r.json()).then(console.log)
```
→ Phải trả về `{ ok: true, pending: false, message: "...Admin đầu tiên" }`

### Test 2 — Đăng nhập
```js
fetch('/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({email: 'bin@nbecom.app', password: 'binpass123'})
}).then(r=>r.json()).then(console.log)
```
→ Phải trả về `{ ok: true, user: {...} }` và set cookie `nb_session`

### Test 3 — Tạo board đầu tiên
```js
fetch('/api/boards', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({name: 'NBecom_Hậu_EMB_2026', bg: '#3C3489', icon: '📋'})
}).then(r=>r.json()).then(console.log)
```
→ Phải trả về board có id `b_xxx` và có sẵn 4 cột (Chưa làm, Đang làm, Fix, Done)

### Test 4 — Liệt kê boards
```js
fetch('/api/boards').then(r=>r.json()).then(console.log)
```

### Test 5 — Lấy chi tiết board (copy id từ Test 3)
```js
fetch('/api/boards/b_xxxxx').then(r=>r.json()).then(console.log)
```
→ Phải trả về board + 4 lists + members

### Test 6 — Tạo card (copy listId "Đang làm" từ Test 5)
```js
fetch('/api/cards', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({listId: 'l_xxxxx', title: 'Cool Mom Sweatshirt'})
}).then(r=>r.json()).then(console.log)
```

### Test 7 — Xem mức điểm (tự khởi tạo 4 mức mặc định)
```js
fetch('/api/admin/score-levels').then(r=>r.json()).then(console.log)
```

### Test 8 — Đăng ký user thứ 2 (sẽ pending)
Mở tab ẩn danh, register với email khác → nhận được `pending: true`

### Test 9 — Duyệt user (quay lại tab Admin)
```js
// Lấy danh sách pending
fetch('/api/admin/users').then(r=>r.json()).then(console.log)
// Copy uid của user pending, rồi duyệt làm Designer
fetch('/api/admin/users', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({action: 'approve', uid: 'u_xxxxx', role: 'designer'})
}).then(r=>r.json()).then(console.log)
```

### Test 10 — Auto-score khi kéo vào Done
1. Gán designer + scoreLevel cho card (dùng PATCH /api/cards/:id)
2. Kéo card sang list Done bằng POST /api/cards/:id/move
3. Kiểm tra điểm: `fetch('/api/scores/me').then(r=>r.json()).then(console.log)`

---

## 📝 Lưu ý kỹ thuật

**Biến môi trường cần có trên Vercel:**
- `UPSTASH_REDIS_REST_URL` (đã có)
- `UPSTASH_REDIS_REST_TOKEN` (đã có)

**Không cần thêm package mới** — vẫn dùng `@upstash/redis` sẵn có.

**Cookie session:** HttpOnly, 7 ngày. Bin muốn kéo dài thì sửa trong `auth-handlers.js` → `login()`.

**User đầu tiên = Admin tự động:** Bin đăng ký tài khoản đầu tiên sẽ tự thành Admin, không cần duyệt. Sau đó mọi user đăng ký sau đều pending.

**Tự chấm điểm:** Khi card được kéo sang cột có `isDone=1` (mặc định là cột "Done"), hệ thống tự cộng điểm. Nếu card thiếu designerId hoặc scoreLevel → bỏ qua, chờ gán sau sẽ tự chấm.

---

## 🚀 Build 2 tiếp theo

Khi Bin test xong Build 1 OK, Lisa sẽ làm tiếp:
1. **Upload ảnh** lên Cloudflare R2 + paste Ctrl+V + drag-drop
2. **UI trang /boards** — danh sách board
3. **UI trang /boards/[id]** — kanban với @dnd-kit
4. **UI modal card chi tiết** — giống hình 3 Bin gửi

Sau đó Build 3:
5. **UI Admin Panel** — duyệt user + cấp quyền + cấu hình điểm
6. **UI Dashboard Designer** — "Điểm của tôi"
7. **Comments + activity log UI**

Bin deploy Build 1 và test xong báo Lisa nhé!
