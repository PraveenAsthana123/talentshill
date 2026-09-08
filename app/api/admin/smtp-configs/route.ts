import { NextRequest, NextResponse } from 'next/server';
import { getAllSmtpConfigs, createSmtpConfig } from '@/lib/db/email-profile-queries';
import nodemailer from 'nodemailer';

export async function GET() {
  try {
    const configs = getAllSmtpConfigs();
    // Mask passwords in response
    const masked = configs.map(c => ({ ...c, password: '••••••••' }));
    return NextResponse.json({ configs: masked });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Test connection if requested
    if (body.action === 'test') {
      const { host, port, secure, username, password } = body;
      try {
        const transport = nodemailer.createTransport({
          host, port, secure, auth: { user: username, pass: password },
        });
        await transport.verify();
        return NextResponse.json({ success: true, message: 'Connection successful' });
      } catch (err) {
        return NextResponse.json({
          success: false,
          message: err instanceof Error ? err.message : 'Connection failed',
        });
      }
    }

    const { name, host, port, secure, username, password } = body;
    if (!name || !host || !username || !password) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const id = createSmtpConfig({ name, host, port: port || 587, secure: secure || false, username, password });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create config' }, { status: 500 });
  }
}
