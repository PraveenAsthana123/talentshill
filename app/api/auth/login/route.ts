import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getUserByEmail, logAudit } from '@/lib/db/admin-queries';
import { getUserRoles } from '@/lib/db/rbac-queries';
import { verifyPassword } from '@/lib/security/password';
import { signToken, SESSION_COOKIE_NAME } from '@/lib/security/session';
import { authLimiter, getClientIp } from '@/lib/security/rate-limiter';
import { normalizeEmail } from '@/lib/security/sanitize';

export async function POST(request: NextRequest) {
  // Rate limit check
  const clientIp = getClientIp(request);
  const rateCheck = authLimiter.check(clientIp);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rateCheck.retryAfter ?? 60) },
      }
    );
  }

  // Parse request body
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { email, password } = body;

  // Validate fields
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 }
    );
  }

  const normalizedEmail = normalizeEmail(email);

  // Find user
  const user = getUserByEmail(normalizedEmail);
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );
  }

  // Verify password
  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    logAudit({
      entityType: 'auth',
      action: 'login_failed',
      metadata: { email: normalizedEmail, reason: 'invalid_password' },
    });

    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );
  }

  // Check if user is active
  if (!user.isActive) {
    logAudit({
      entityType: 'auth',
      action: 'login_failed',
      userId: user.id,
      metadata: { reason: 'account_inactive' },
    });

    return NextResponse.json(
      { error: 'Your account has been deactivated. Contact an administrator.' },
      { status: 403 }
    );
  }

  // Get RBAC roles
  const rbacRoles = getUserRoles(user.id);
  const roleNames = rbacRoles.map(r => r.name);

  // Sign JWT
  const token = await signToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'admin' | 'editor' | 'viewer',
    roles: roleNames,
  });

  // Set cookie
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 86400, // 24 hours
  });

  // Log successful login
  logAudit({
    entityType: 'auth',
    entityId: user.id,
    action: 'login_success',
    userId: user.id,
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}
