import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const baseUrl = new URL(request.url).origin;

  if (errorParam) {
    return NextResponse.redirect(`${baseUrl}/?gmail_status=error&msg=${encodeURIComponent(errorParam)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/?gmail_status=error&msg=missing_code_or_state`);
  }

  // Verify state = valid session
  const session = await redis.get(`session:${state}`);
  if (!session) {
    return NextResponse.redirect(`${baseUrl}/?gmail_status=error&msg=invalid_state`);
  }

  const sessionData = typeof session === 'string' ? JSON.parse(session) : session;
  if (sessionData.role !== 'admin') {
    return NextResponse.redirect(`${baseUrl}/?gmail_status=error&msg=not_admin`);
  }

  try {
    // Step 1: Exchange code for tokens
    const redirectUri = process.env.GMAIL_REDIRECT_URI || `${baseUrl}/api/auth/gmail/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokens = await tokenRes.json();

    if (tokens.error) {
      return NextResponse.redirect(`${baseUrl}/?gmail_status=error&msg=${encodeURIComponent(tokens.error_description || tokens.error)}`);
    }

    if (!tokens.access_token) {
      return NextResponse.redirect(`${baseUrl}/?gmail_status=error&msg=no_access_token`);
    }

    // Step 2: Get user profile (email)
    const profileRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();

    if (!profile.emailAddress) {
      return NextResponse.redirect(`${baseUrl}/?gmail_status=error&msg=cannot_get_email`);
    }

    // Step 3: Store tokens in Redis
    const tokenData = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || null,
      expiry_date: Date.now() + (tokens.expires_in * 1000),
      email: profile.emailAddress,
      messages_total: profile.messagesTotal || 0,
      threads_total: profile.threadsTotal || 0,
      connected_at: Date.now(),
      connected_by: sessionData.username,
    };

    await redis.set('gmail:tokens', JSON.stringify(tokenData));

    return NextResponse.redirect(`${baseUrl}/?gmail_status=connected&email=${encodeURIComponent(profile.emailAddress)}`);
  } catch (e) {
    console.error('Gmail callback error:', e);
    return NextResponse.redirect(`${baseUrl}/?gmail_status=error&msg=${encodeURIComponent(e.message)}`);
  }
}
