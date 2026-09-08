import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  getMicrosoftConfig,
  getRedirectUri,
  generateState,
  generateCodeVerifier,
  generateCodeChallenge,
  storeOAuthFlow,
} from '@/lib/security/oauth';

export async function GET(request: NextRequest) {
  const config = getMicrosoftConfig();

  // Fail closed: never proceed with empty/missing credentials.
  if (!config) {
    return NextResponse.json(
      { error: 'Microsoft OAuth is not configured on this server.' },
      { status: 503 }
    );
  }

  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  await storeOAuthFlow({ state, codeVerifier, provider: 'microsoft' });

  const authUrl = new URL(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize`
  );
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('redirect_uri', getRedirectUri('microsoft', request));
  authUrl.searchParams.set('response_type', 'code');
  // User.Read (Microsoft Graph) is required to look up the account's
  // verified email via /me in the callback -- see callback route comments.
  authUrl.searchParams.set('scope', 'openid email profile User.Read');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('response_mode', 'query');

  return NextResponse.redirect(authUrl.toString());
}
