import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new Response('Missing token', { status: 401 });
  }

  // Verify session
  const session = await redis.get(`session:${token}`);
  if (!session) {
    return new Response('Invalid session. Vui lòng đăng nhập lại NBECOM.', { status: 401 });
  }

  const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
  if (sessionData.role !== 'admin') {
    return new Response('Chỉ Admin mới được kết nối Gmail', { status: 403 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return new Response('GOOGLE_CLIENT_ID chưa được cấu hình trong Vercel env vars', { status: 500 });
  }

  const baseUrl = new URL(request.url).origin;
  const redirectUri = process.env.GMAIL_REDIRECT_URI || `${baseUrl}/api/auth/gmail/callback`;
  const scope = 'https://www.googleapis.com/auth/gmail.readonly';

  const authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scope,
    access_type: 'offline',
    prompt: 'consent', // force refresh_token to be returned
    state: token, // use session token as state for CSRF protection
  }).toString();

  return NextResponse.redirect(authUrl);
}
