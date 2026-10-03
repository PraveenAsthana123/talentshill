import { SignJWT, jwtVerify } from 'jose';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { validateEnv } from './validate-env';
import { logger } from '@/lib/logger';

validateEnv();

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  roles: string[];
}

export const SESSION_COOKIE_NAME = 'admin_session';

const DEV_FALLBACK = 'dev-secret-change-me';
const SESSION_SECRET = process.env.SESSION_SECRET;

// In production, the app must not start with the known dev secret.
// Fail loudly at module load so a misconfigured deployment surfaces
// immediately rather than silently signing tokens with a public value.
if (process.env.NODE_ENV === 'production' && !SESSION_SECRET) {
  throw new Error(
    'SESSION_SECRET environment variable is not set. ' +
    'Generate a strong secret (e.g. openssl rand -hex 32) and set it ' +
    'in your deployment environment before starting the server.'
  );
}

const EFFECTIVE_SECRET = SESSION_SECRET ?? DEV_FALLBACK;

if (!SESSION_SECRET) {
  // Development/test only — make the fallback visible in logs so it is
  // never silently used in a staging or shared environment.
  logger.warn(
    '[security] SESSION_SECRET is not set — using insecure dev fallback. ' +
    'Set SESSION_SECRET before deploying to any shared or public environment.'
  );
}

export function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(EFFECTIVE_SECRET);
}

export async function signToken(payload: SessionPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecretKey());

  return token;
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    const session: SessionPayload = {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'admin' | 'editor' | 'viewer',
      roles: (payload.roles as string[]) || [],
    };

    if (!session.userId || !session.email || !session.name || !session.role) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(
  cookies: ReadonlyRequestCookies
): Promise<SessionPayload | null> {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyToken(token);
}
