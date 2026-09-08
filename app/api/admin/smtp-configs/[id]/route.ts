import { NextRequest, NextResponse } from 'next/server';
import { getSmtpConfigById, updateSmtpConfig, deleteSmtpConfig } from '@/lib/db/email-profile-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const config = getSmtpConfigById(id);
    if (!config) {
      return NextResponse.json({ error: 'Config not found' }, { status: 404 });
    }
    return NextResponse.json({ config: { ...config, password: '••••••••' } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, host, port, secure, username, password, isActive } = body;
    updateSmtpConfig(id, { name, host, port, secure, username, password, isActive });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteSmtpConfig(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete config' }, { status: 500 });
  }
}
