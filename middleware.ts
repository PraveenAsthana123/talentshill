import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const PUBLIC_ADMIN_PATHS = ['/admin/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Guard both /admin/* (pages) and /api/admin/* (API routes). Second bug
  // found alongside the matcher one: this check used to be
  // `!pathname.startsWith('/admin')`, which is also false for
  // '/api/admin/...' (that string starts with '/api', not '/admin') --
  // so even after fixing the matcher below, this line alone would have
  // kept letting every API-admin request skip auth silently.
  const isAdminPath = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  if (!isAdminPath) {
    return response;
  }

  // Allow public admin paths
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return response;
  }

  // Check session cookie
  const token = request.cookies.get('admin_session')?.value;
  if (!token) {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    const secret = new TextEncoder().encode(SESSION_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Attach user info to response headers for downstream API routes
    response.headers.set('x-user-id', (payload.userId as string) || '');
    response.headers.set('x-user-role', (payload.role as string) || '');

    return response;
  } catch {
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  // 2026-09-08 security fix: matcher was '/admin/:path*' only, which never
  // matches '/api/admin/*' (different path prefix) -- the middleware body
  // already had correct /api/admin handling (401 on missing/invalid token),
  // but that code was dead: middleware never ran for API routes at all,
  // leaving the entire admin API surface (users, contacts, campaigns, roles,
  // RAG documents, webhooks, integrations -- 96 route files) reachable and
  // writable by any unauthenticated caller. Found live during an audit:
  // curl with no cookie returned real data and could create real rows.
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
