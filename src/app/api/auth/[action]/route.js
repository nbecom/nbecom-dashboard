// /api/auth/[action]/route.js
// Hỗ trợ: register, login, logout, me
import { register, login, logout, me } from '@/lib/auth-handlers';
import { jsonError } from '@/lib/auth';

export async function POST(req, { params }) {
  const { action } = params;
  if (action === 'register') return register(req);
  if (action === 'login') return login(req);
  if (action === 'logout') return logout(req);
  return jsonError('Action không tồn tại', 404);
}

export async function GET(req, { params }) {
  const { action } = params;
  if (action === 'me') return me(req);
  return jsonError('Action không tồn tại', 404);
}
