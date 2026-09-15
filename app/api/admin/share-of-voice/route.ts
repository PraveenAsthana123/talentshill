import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getShareOfVoice } from '@/lib/pr/share-of-voice';

// Reuses the 'branding' RBAC resource (brand_mentions is that module's
// table) rather than a new 'pr_media' resource -- this is an extension
// of the existing Branding module, not a new admin surface.
export const GET = withPermission('branding', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const newsOnly = searchParams.get('newsOnly') === 'true';
  return NextResponse.json(getShareOfVoice(newsOnly ? 'news' : undefined));
});
