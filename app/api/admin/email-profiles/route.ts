import { NextRequest, NextResponse } from 'next/server';
import { getAllProfiles, createProfile } from '@/lib/db/email-profile-queries';

export async function GET() {
  try {
    const profiles = getAllProfiles();
    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, fromName, fromEmail, replyTo, signature, isDefault } = body;

    if (!name || !fromName || !fromEmail) {
      return NextResponse.json({ error: 'Name, fromName, and fromEmail are required' }, { status: 400 });
    }

    const id = createProfile({ name, fromName, fromEmail, replyTo, signature, isDefault });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}
