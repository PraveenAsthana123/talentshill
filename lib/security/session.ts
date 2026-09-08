import { SignJWT, jwtVerify } from 'jose';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  roles: string[];
}

export const SESSION_COOKIE_NAME = 'admin_session';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(SESSION_SECRET);
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
