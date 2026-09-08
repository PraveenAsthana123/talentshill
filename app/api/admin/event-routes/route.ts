import { NextRequest, NextResponse } from 'next/server';
import { getAllEventRoutes, upsertEventRoute, deleteEventRoute } from '@/lib/db/email-profile-queries';

export async function GET() {
  try {
    const routes = getAllEventRoutes();
    return NextResponse.json({ routes });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch routes' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { routes } = body;

    if (!Array.isArray(routes)) {
      return NextResponse.json({ error: 'Routes array required' }, { status: 400 });
    }

    for (const route of routes) {
      if (route.eventType && route.profileId) {
        upsertEventRoute(route.eventType, route.profileId, route.description);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update routes' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.id) {
      deleteEventRoute(body.id);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete route' }, { status: 500 });
  }
}
