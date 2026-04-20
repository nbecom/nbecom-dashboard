// ============================================================
// NBECOM v6.0 - BOARDS & SCORING SCHEMA
// ============================================================
// REDIS KEYS:
//
// AUTH & PERMISSION:
// user:{uid}                → Hash { email, name, role, status, features, createdAt, avatar }
// users:all                 → Set of uid
// users:pending             → Set of uid
// email:{email}             → String: uid
// session:{token}           → String: uid (TTL 7d)
//
// BOARDS:
// board:{bid}               → Hash { name, bg, icon, ownerId, createdAt }
// boards:all                → Set of bid
// board:{bid}:members       → Hash { uid: "owner|editor|viewer" }
// board:{bid}:lists         → List (ordered): [lid, lid, ...]
// user:{uid}:boards         → Set of bid  (index ngược)
//
// LISTS:
// list:{lid}                → Hash { boardId, name, order, isDone }
// list:{lid}:cards          → List (ordered): [cid, cid, ...]
//
// CARDS:
// card:{cid}                → Hash { listId, boardId, title, desc, cover,
//                                    designerId, scoreLevel, scored,
//                                    scoredAt, scoredBy, createdAt, createdBy }
// card:{cid}:attachments    → Set of attId
// card:{cid}:members        → Set of uid
// card:{cid}:lockedTo       → Set of uid (card-level lock)
// card:{cid}:comments       → List of json
// card:{cid}:activity       → List of json (200 mới nhất)
//
// ATTACHMENTS:
// att:{attId}               → Hash { cardId, url, thumbUrl, mediumUrl, name, size, uploadedBy, uploadedAt }
//
// SCORING:
// scorelevels               → Hash { levelId: json({ id, name, points, color, order }) }
// score:{uid}:{yyyy-mm}     → List of json({ cardId, points, levelId, at, by })
// score:{uid}:{yyyy-mm}:total → Number (cache tổng điểm tháng)
// ============================================================

import { Redis } from '@upstash/redis';

export const redis = Redis.fromEnv();

// ---------------- Constants ----------------

export const SYSTEM_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALE: 'sale',
  DESIGNER: 'designer',
};

export const BOARD_ROLES = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

export const USER_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DISABLED: 'disabled',
};

export const FEATURES = {
  DASHBOARD: 'dashboard',
  REPORTS: 'reports',
  ORDERS: 'orders',
  PRODUCT_LISTINGS: 'product_listings',
  BASECOST: 'basecost',
  SHOP_MGMT: 'shop_mgmt',
  CSV_UPLOAD: 'csv_upload',
  BOARDS: 'boards',
  MY_SCORES: 'my_scores',
  USER_MGMT: 'user_mgmt',
  SCORE_SETTINGS: 'score_settings',
};

// Preset features cho từng role
export const ROLE_FEATURE_PRESETS = {
  admin: Object.values(FEATURES),
  manager: [
    FEATURES.DASHBOARD, FEATURES.REPORTS, FEATURES.ORDERS,
    FEATURES.PRODUCT_LISTINGS, FEATURES.BASECOST, FEATURES.SHOP_MGMT,
    FEATURES.CSV_UPLOAD, FEATURES.BOARDS,
  ],
  sale: [
    FEATURES.ORDERS, FEATURES.PRODUCT_LISTINGS, FEATURES.BOARDS,
  ],
  designer: [
    FEATURES.BOARDS, FEATURES.MY_SCORES,
  ],
};

// Mức điểm mặc định (Bin có thể chỉnh trong admin)
export const DEFAULT_SCORE_LEVELS = [
  { id: 'lv_small', name: 'Mẫu 0.25đ', points: 0.25, color: '#97C459', order: 1 },
  { id: 'lv_normal', name: 'Mẫu 2đ', points: 2, color: '#378ADD', order: 2 },
  { id: 'lv_bundle3', name: 'Bundle 3đ', points: 3, color: '#EF9F27', order: 3 },
  { id: 'lv_bundle4', name: 'Bundle 4đ', points: 4, color: '#E24B4A', order: 4 },
];

// ---------------- Utils ----------------

export function genId(prefix = '') {
  return `${prefix}${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

export function monthKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// ---------------- User helpers ----------------

export async function getUser(uid) {
  if (!uid) return null;
  const u = await redis.hgetall(`user:${uid}`);
  if (!u || !u.email) return null;
  return {
    id: uid,
    ...u,
    features: u.features ? JSON.parse(u.features) : [],
  };
}

export async function getUserByEmail(email) {
  if (!email) return null;
  const uid = await redis.get(`email:${email.toLowerCase()}`);
  return uid ? getUser(uid) : null;
}

export async function hasFeature(uid, feature) {
  const u = await getUser(uid);
  if (!u) return false;
  if (u.status !== USER_STATUS.APPROVED) return false;
  if (u.role === SYSTEM_ROLES.ADMIN) return true; // admin có mọi feature
  return (u.features || []).includes(feature);
}

export async function isAdmin(uid) {
  const u = await getUser(uid);
  return u?.role === SYSTEM_ROLES.ADMIN;
}

export async function canScore(uid) {
  const u = await getUser(uid);
  if (!u || u.status !== USER_STATUS.APPROVED) return false;
  return [SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.MANAGER, SYSTEM_ROLES.SALE].includes(u.role);
}

// ---------------- Board permission ----------------

export async function getBoardRole(uid, bid) {
  if (!uid || !bid) return null;
  if (await isAdmin(uid)) return BOARD_ROLES.OWNER;
  return (await redis.hget(`board:${bid}:members`, uid)) || null;
}

export async function canViewBoard(uid, bid) {
  return (await getBoardRole(uid, bid)) !== null;
}

export async function canEditBoard(uid, bid) {
  const r = await getBoardRole(uid, bid);
  return r === BOARD_ROLES.OWNER || r === BOARD_ROLES.EDITOR;
}

export async function canManageBoard(uid, bid) {
  return (await getBoardRole(uid, bid)) === BOARD_ROLES.OWNER;
}

// ---------------- Card permission (tầng 3) ----------------

export async function canViewCard(uid, cid) {
  const card = await redis.hgetall(`card:${cid}`);
  if (!card?.boardId) return false;
  if (await canManageBoard(uid, card.boardId)) return true;

  const locked = await redis.smembers(`card:${cid}:lockedTo`);
  if (locked?.length > 0) return locked.includes(uid);

  return canViewBoard(uid, card.boardId);
}

export async function canEditCard(uid, cid) {
  const card = await redis.hgetall(`card:${cid}`);
  if (!card?.boardId) return false;
  if (await canManageBoard(uid, card.boardId)) return true;

  const locked = await redis.smembers(`card:${cid}:lockedTo`);
  if (locked?.length > 0 && !locked.includes(uid)) return false;

  return canEditBoard(uid, card.boardId);
}

// ---------------- Activity log ----------------

export async function logActivity(cid, uid, action, meta = {}) {
  const entry = JSON.stringify({ uid, action, meta, at: Date.now() });
  await redis.lpush(`card:${cid}:activity`, entry);
  await redis.ltrim(`card:${cid}:activity`, 0, 199);
}

// ---------------- SCORING ----------------

export async function getScoreLevels() {
  const raw = await redis.hgetall('scorelevels');
  if (!raw || Object.keys(raw).length === 0) {
    // Khởi tạo mặc định
    const pipe = redis.pipeline();
    DEFAULT_SCORE_LEVELS.forEach((lv) => pipe.hset('scorelevels', { [lv.id]: JSON.stringify(lv) }));
    await pipe.exec();
    return [...DEFAULT_SCORE_LEVELS];
  }
  const levels = Object.values(raw).map((s) => (typeof s === 'string' ? JSON.parse(s) : s));
  return levels.sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function setScoreLevel(level) {
  if (!level.id) level.id = genId('lv_');
  await redis.hset('scorelevels', { [level.id]: JSON.stringify(level) });
  return level;
}

export async function deleteScoreLevel(levelId) {
  await redis.hdel('scorelevels', levelId);
}

/**
 * Tự động tính điểm khi card chuyển sang list "Done"
 * - Chỉ tính 1 lần (flag scored)
 * - Chỉ tính nếu có designerId và scoreLevel
 */
export async function tryAutoScoreCard(cid) {
  const card = await redis.hgetall(`card:${cid}`);
  if (!card || card.scored === '1') return { scored: false, reason: 'already_scored_or_missing' };
  if (!card.designerId || !card.scoreLevel) {
    return { scored: false, reason: 'missing_designer_or_level' };
  }

  // Lấy list hiện tại, xem có phải Done không
  const list = await redis.hgetall(`list:${card.listId}`);
  if (!list?.name) return { scored: false, reason: 'no_list' };
  const isDone = list.isDone === '1' || /done|ho[àa]n th[àa]nh/i.test(list.name);
  if (!isDone) return { scored: false, reason: 'not_done_column' };

  // Lấy mức điểm
  const levels = await getScoreLevels();
  const level = levels.find((l) => l.id === card.scoreLevel);
  if (!level) return { scored: false, reason: 'invalid_level' };

  const mk = monthKey(new Date());
  const entry = {
    cardId: cid,
    points: level.points,
    levelId: level.id,
    levelName: level.name,
    at: Date.now(),
    by: card.createdBy || null,
    boardId: card.boardId,
  };

  const pipe = redis.pipeline();
  pipe.lpush(`score:${card.designerId}:${mk}`, JSON.stringify(entry));
  pipe.incrbyfloat(`score:${card.designerId}:${mk}:total`, level.points);
  pipe.hset(`card:${cid}`, {
    scored: '1',
    scoredAt: String(Date.now()),
    scoredMonth: mk,
  });
  await pipe.exec();

  await logActivity(cid, card.createdBy, 'auto_score', {
    points: level.points,
    levelName: level.name,
    designerId: card.designerId,
  });

  return { scored: true, points: level.points };
}

export async function getDesignerMonthlyScore(uid, mk = monthKey()) {
  const total = await redis.get(`score:${uid}:${mk}:total`);
  const raw = await redis.lrange(`score:${uid}:${mk}`, 0, -1);
  const entries = raw
    .map((r) => {
      try {
        return typeof r === 'string' ? JSON.parse(r) : r;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
  return {
    month: mk,
    total: parseFloat(total || 0),
    count: entries.length,
    entries,
  };
}
