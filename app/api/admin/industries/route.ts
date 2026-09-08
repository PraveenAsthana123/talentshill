import { NextRequest, NextResponse } from 'next/server';
import { getAllIndustries, createIndustry } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';

export async function GET() {
  try {
    const industries = getAllIndustries();
    return NextResponse.json({ industries });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch industries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const industry = createIndustry(body);

    const token = request.cookies.get('admin_session')?.value;
    if (token) {
      const session = await verifyToken(token);
      logAudit({ entityType: 'industry', entityId: industry.id, action: 'create', userId: session?.userId, metadata: { name: body.name } });
    }

    return NextResponse.json({ industry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create industry' }, { status: 500 });
  }
}
