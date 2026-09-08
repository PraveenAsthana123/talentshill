import type { NextRequest } from 'next/server';
import {
  getMicrosoftConfig,
  getRedirectUri,
  consumeOAuthFlow,
  completeOAuthLogin,
  oauthErrorRedirect,
} from '@/lib/security/oauth';
import { normalizeEmail } from '@/lib/security/sanitize';

interface MicrosoftTokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

interface MicrosoftGraphMe {
  mail?: string | null;
  userPrincipalName?: string | null;
  error?: { message?: string };
}

export async function GET(request: NextRequest) {
  const config = getMicrosoftConfig();
  if (!config) {
    return oauthErrorRedirect(request, 'Microsoft OAuth is not configured on this server.');
  }

  const { searchParams } = request.nextUrl;
  const providerError = searchParams.get('error');
  const code = searchParams.get('code');
  const returnedState = searchParams.get('state');

  const flow = await consumeOAuthFlow();

  if (providerError) {
    return oauthErrorRedirect(request, `Microsoft sign-in was cancelled or failed (${providerError}).`);
  }

  if (!code || !returnedState) {
    return oauthErrorRedirect(request, 'Invalid Microsoft OAuth callback: missing code or state.');
  }

  // CSRF check: state must match the one we generated and stored server-side.
  if (!flow || flow.provider !== 'microsoft' || flow.state !== returnedState) {
    return oauthErrorRedirect(request, 'OAuth state mismatch. Please try signing in again.');
  }

  // Exchange the authorization code for tokens (PKCE code_verifier proves
  // this callback is tied to the request we initiated).
  let tokenJson: MicrosoftTokenResponse;
  try {
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          code_verifier: flow.codeVerifier,
          grant_type: 'authorization_code',
          redirect_uri: getRedirectUri('microsoft', request),
        }),
      }
    );
    tokenJson = (await tokenRes.json()) as MicrosoftTokenResponse;
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new Error(tokenJson.error_description || tokenJson.error || 'token_exchange_failed');
    }
  } catch {
    return oauthErrorRedirect(request, 'Failed to exchange the authorization code with Microsoft.');
  }

  // Microsoft's v2.0 id_token does not reliably carry an "email_verified"
  // claim the way Google's does (this varies by account type: personal
  // Microsoft account vs. Azure AD work/school account). Microsoft Graph's
  // /me endpoint is the more reliable source: `mail` is the account's
  // verified mailbox when set, falling back to `userPrincipalName` (the
  // account's verified sign-in identifier) for accounts without a mailbox.
  let me: MicrosoftGraphMe;
  try {
    const meRes = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    me = (await meRes.json()) as MicrosoftGraphMe;
    if (!meRes.ok) {
      throw new Error(me.error?.message || 'graph_me_failed');
    }
  } catch {
    return oauthErrorRedirect(request, 'Failed to fetch account information from Microsoft.');
  }

  const email = me.mail || me.userPrincipalName;
  if (!email) {
    return oauthErrorRedirect(request, 'Could not determine a verified email from your Microsoft account.');
  }

  // completeOAuthLogin enforces "existing admin user only" -- see
  // lib/security/oauth.ts for the fail-closed lookup.
  return completeOAuthLogin(request, normalizeEmail(email), 'microsoft');
}
