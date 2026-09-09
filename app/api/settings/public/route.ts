import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/db/admin-queries';

// Real gap fixed: the admin Settings page (site_name, contact_email,
// social links) had zero real readers anywhere on the public site --
// Footer.tsx read build-time NEXT_PUBLIC_* env vars instead, so
// editing these settings in the admin panel silently did nothing.
// This is the public, unauthenticated route the site's client
// components use to read them, mirroring the maintenance-status
// pattern (a dedicated public route, not the RBAC-gated admin one).
const PUBLIC_KEYS = ['site_name', 'site_description', 'contact_email', 'social_linkedin', 'social_facebook', 'social_whatsapp'] as const;

export async function GET() {
  const values: Record<string, unknown> = {};
  for (const key of PUBLIC_KEYS) {
    const setting = getSetting(key);
    if (setting) values[key] = setting.value;
  }
  return NextResponse.json({ settings: values });
}
