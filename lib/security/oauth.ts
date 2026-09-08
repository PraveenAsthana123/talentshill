import { randomBytes, createHash } from 'crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByEmail, logAudit } from '@/lib/db/admin-queries';
import { getUserRoles } from '@/lib/db/rbac-queries';
import { signToken, SESSION_COOKIE_NAME } from '@/lib/security/session';

/**
 * Manual OAuth 2.0 Authorization Code + PKCE flow for Google and Microsoft
 * admin login.
 *
 * Security model (do not weaken):
 *  - OAuth is an ALTERNATE CREDENTIAL for an existing admin user, never a
 *    signup mechanism. A verified provider email that has no matching row
 *    in `users` fails closed -- no account is created, no default role is
 *    granted. See completeOAuthLogin() below.
 *  - On success we mint the exact same admin_session JWT the password
 *    login route produces, so middleware.ts and every RBAC check work
 *    completely unchanged.
 */

export type OAuthProvider = 'google' | 'microsoft';

export const OAUTH_STATE_COOKIE = 'oauth_flow';
export const OAUTH_STATE_MAX_AGE = 600; // 10 minutes -- short-lived, single use

export interface OAuthFlowCookie {
  state: string;
  codeVerifier: string;
  provider: OAuthProvider;
}

/** Real random CSRF state token (not predictable / not a counter). */
export function generateState(): string {
  return randomBytes(32).toString('base64url');
}

/** Real random PKCE code_verifier per RFC 7636 (43-128 char unreserved string). */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString('base64url'); // 43 chars, well within spec
}

/** S256 PKCE code_challenge derived from the verifier. */
export function generateCodeChallenge(verifier: string): string {
  return createHash('sha256').update(verifier).digest('base64url');
}

/**
 * Redirect URI base. Prefers the app's existing NEXT_PUBLIC_SITE_URL
 * convention (used elsewhere: lib/constants.ts, lib/seo.ts, sitemap/robots);
 * falls back to the live request origin so local dev (no site URl set)
 * still produces a redirect_uri that matches between the authorize call
 * and the token exchange call.
 */
export function getRedirectUri(provider: OAuthProvider, request: NextRequest): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  return `${base}/api/auth/oauth/${provider}/callback`;
}

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
}

/** Returns null (never throws, never returns partial config) if unset. */
export function getGoogleConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret };
}

export interface MicrosoftOAuthConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

/** Returns null (never throws, never returns partial config) if unset. */
export function getMicrosoftConfig(): MicrosoftOAuthConfig | null {
  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const tenantId = process.env.MICROSOFT_TENANT_ID || 'common';
  return { clientId, clientSecret, tenantId };
}

/** Persist { state, codeVerifier, provider } in a short-lived httpOnly cookie. */
export async function storeOAuthFlow(flow: OAuthFlowCookie): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, JSON.stringify(flow), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: OAUTH_STATE_MAX_AGE,
  });
}

/** Read + delete (single use) the OAuth flow cookie. */
export async function consumeOAuthFlow(): Promise<OAuthFlowCookie | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OAuthFlowCookie;
    if (!parsed.state || !parsed.codeVerifier || !parsed.provider) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function oauthErrorRedirect(request: NextRequest, message: string): NextResponse {
  const url = new URL('/admin/login', request.url);
  url.searchParams.set('oauth_error', message);
  return NextResponse.redirect(url);
}

/**
 * Final step shared by both providers' callbacks: look up the VERIFIED
 * provider email against the existing `users` table.
 *
 *   - No matching row  -> fail closed. No user created. No role granted.
 *   - Row exists but inactive -> fail closed, same as password login.
 *   - Row exists and active -> mint the identical admin_session JWT the
 *     password login route mints, so downstream middleware/RBAC is
 *     unchanged.
 */
export async function completeOAuthLogin(
  request: NextRequest,
  verifiedEmail: string,
  provider: OAuthProvider
): Promise<NextResponse> {
  const user = getUserByEmail(verifiedEmail);

  if (!user) {
    logAudit({
      entityType: 'auth',
      action: 'oauth_login_failed',
      metadata: { email: verifiedEmail, provider, reason: 'no_matching_admin_account' },
    });
    return oauthErrorRedirect(
      request,
      'No admin account exists for this email. Ask an administrator to provision your account first.'
    );
  }

  if (!user.isActive) {
    logAudit({
      entityType: 'auth',
      action: 'oauth_login_failed',
      userId: user.id,
      metadata: { provider, reason: 'account_inactive' },
    });
    return oauthErrorRedirect(request, 'Your account has been deactivated. Contact an administrator.');
  }

  const rbacRoles = getUserRoles(user.id);
  const roleNames = rbacRoles.map((r) => r.name);

  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'admin' | 'editor' | 'viewer',
    roles: roleNames,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400, // 24 hours, matches password login
  });

  logAudit({
    entityType: 'auth',
    entityId: user.id,
    action: 'oauth_login_success',
    userId: user.id,
    metadata: { provider },
  });

  return NextResponse.redirect(new URL('/admin', request.url));
}
