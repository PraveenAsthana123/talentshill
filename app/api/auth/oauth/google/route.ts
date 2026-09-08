import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getGoogleConfig,
  getRedirectUri,
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
  storeOAuthFlow,
} from '@/lib/security/oauth';

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

export async function GET(request: NextRequest) {
  const config = getGoogleConfig();

  // Fail closed: never proceed with empty/missing credentials.
  if (!config) {
    return NextResponse.json(
      { error: 'Google OAuth is not configured on this server.' },
      { status: 503 }
    );
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  await storeOAuthFlow({ state, codeVerifier, provider: 'google' });

  const authUrl = new URL(GOOGLE_AUTH_ENDPOINT);
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', getRedirectUri('google', request));
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('access_type', 'online');
  authUrl.searchParams.set('prompt', 'select_account');

  return NextResponse.redirect(authUrl.toString());
}
