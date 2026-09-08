import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { hasPermission } from '@/lib/db/rbac-queries';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';

export function getSessionUserId(request: NextRequest): string | null {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) return null;

  try {
    // Decode without full verification for sync access (middleware already verified)
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return payload.userId || null;
  } catch {
    return null;
  }
}

export async function getSessionUserIdAsync(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get('admin_session')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload.userId as string) || null;
  } catch {
    return null;
  }
}

export function checkPermission(userId: string, resource: string, action: string): boolean {
  return hasPermission(userId, resource, action);
}

export function withPermission(resource: string, action: string) {
  return function (handler: (request: NextRequest, context: unknown) => Promise<NextResponse>) {
    return async function (request: NextRequest, context: unknown): Promise<NextResponse> {
      const userId = await getSessionUserIdAsync(request);
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!hasPermission(userId, resource, action)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      return handler(request, context);
    };
  };
}
