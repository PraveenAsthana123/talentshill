import type { NextRequest } from 'next/server';
import {
  getGoogleConfig,
  getRedirectUri,
  consumeOAuthFlow,
  completeOAuthLogin,
  oauthErrorRedirect,
} from '@/lib/security/oauth';
import { normalizeEmail } from '@/lib/security/sanitize';

const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_ENDPOINT = 'https://openidconnect.googleapis.com/v1/userinfo';

interface GoogleTokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleUserinfoResponse {
  email?: string;
  email_verified?: boolean;
  error?: string;
}

export async function GET(request: NextRequest) {
  const config = getGoogleConfig();
  if (!config) {
    return oauthErrorRedirect(request, 'Google OAuth is not configured on this server.');
  }

  const { searchParams } = request.nextUrl;
  const providerError = searchParams.get('error');
  const code = searchParams.get('code');
  const returnedState = searchParams.get('state');

  const flow = await consumeOAuthFlow();

  if (providerError) {
    return oauthErrorRedirect(request, `Google sign-in was cancelled or failed (${providerError}).`);
  }

  if (!code || !returnedState) {
    return oauthErrorRedirect(request, 'Invalid Google OAuth callback: missing code or state.');
  }

  // CSRF check: state must match the one we generated and stored server-side.
  if (!flow || flow.provider !== 'google' || flow.state !== returnedState) {
    return oauthErrorRedirect(request, 'OAuth state mismatch. Please try signing in again.');
  }

  // Exchange the authorization code for tokens (PKCE code_verifier proves
  // this callback is tied to the request we initiated).
  let tokenJson: GoogleTokenResponse;
  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        code_verifier: flow.codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUri('google', request),
      }),
    });
    tokenJson = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new Error(tokenJson.error_description || tokenJson.error || 'token_exchange_failed');
    }
  } catch {
    return oauthErrorRedirect(request, 'Failed to exchange the authorization code with Google.');
  }

  // Fetch the verified email from Google's OpenID Connect userinfo endpoint.
  let userinfo: GoogleUserinfoResponse;
  try {
    const userinfoRes = await fetch(GOOGLE_USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    userinfo = (await userinfoRes.json()) as GoogleUserinfoResponse;
    if (!userinfoRes.ok) {
      throw new Error(userinfo.error || 'userinfo_failed');
    }
  } catch {
    return oauthErrorRedirect(request, 'Failed to fetch account information from Google.');
  }

  if (!userinfo.email || userinfo.email_verified !== true) {
    return oauthErrorRedirect(request, 'Your Google account email is not verified.');
  }

  // completeOAuthLogin enforces "existing admin user only" -- see
  // lib/security/oauth.ts for the fail-closed lookup.
  return completeOAuthLogin(request, normalizeEmail(userinfo.email), 'google');
}
