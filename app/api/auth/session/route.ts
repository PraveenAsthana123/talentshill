import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifyToken } from '@/lib/security/session';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Not authenticated.' },
      { status: 401 }
    );
  }

  const session = await verifyToken(token);

  if (!session) {
    return NextResponse.json(
      { error: 'Invalid or expired session.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
