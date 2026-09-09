import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const PUBLIC_ADMIN_PATHS = ['/admin/login'];

// Real gap fixed here: isMaintenanceMode() (lib/ops/maintenance.ts) had
// zero callers anywhere in the app -- toggling "Maintenance Mode: ON"
// in the admin UI wrote a real settings row but had no actual effect
// on the public site. Enforced here via a fetch() to a dedicated public
// status route rather than a direct DB call, because this file runs on
// the Edge runtime by default and better-sqlite3 is a Node.js native
// module (serverExternalPackages only covers the Node.js runtime).
function renderMaintenanceHtml(message: string): string {
  const safeMessage = message.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string));
  return `<!doctype html><html><head><meta charset="utf-8"><title>Under Maintenance</title></head><body style="font-family:sans-serif;text-align:center;padding:4rem 1rem;"><h1>Under Maintenance</h1><p>${safeMessage}</p></body></html>`;
}

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
    // Maintenance-mode enforcement for public pages only. Deliberately
    // NOT applied to /api/* (non-admin) -- webhook receivers, the chat
    // widget's own endpoints, etc. stay reachable, so maintenance mode
    // blocks what visitors see, not every API integration. Fails open
    // (serves the page) if the status check itself errors, so a broken
    // status endpoint can never cause a full site outage on its own.
    if (!pathname.startsWith('/api')) {
      try {
        const statusRes = await fetch(new URL('/api/maintenance-status', request.url));
        if (statusRes.ok) {
          const status = await statusRes.json();
          if (status.enabled) {
            return new NextResponse(renderMaintenanceHtml(status.message), {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': '3600' },
            });
          }
        }
      } catch {
        // fail open -- see comment above
      }
    }
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
  //
  // Third matcher entry added for the maintenance-mode fix: matches
  // public pages only. The negative lookahead excludes _next static/
  // image assets, favicon, and (deliberately, for safety) anything
  // starting with 'admin' or 'api' -- both of those are already fully
  // covered by the first two matcher entries above and must never be
  // gated by the maintenance check, or an admin could lock themselves
  // out of the one panel that can turn maintenance mode back off.
  matcher: ['/admin/:path*', '/api/admin/:path*', '/((?!_next/static|_next/image|favicon\\.ico|admin|api).*)'],
};
