import { NextResponse } from 'next/server';
import { getGoogleConfig, getMicrosoftConfig } from '@/lib/security/oauth';

/**
 * Public, unauthenticated config-status check for the login page -- exposes
 * only booleans, never the actual client IDs/secrets. Lets the UI show/hide
 * the "Continue with Google/Microsoft" buttons based on real server-side
 * configuration instead of a hardcoded `true`.
 */
export async function GET() {
  return NextResponse.json({
    google: getGoogleConfig() !== null,
    microsoft: getMicrosoftConfig() !== null,
  });
}
