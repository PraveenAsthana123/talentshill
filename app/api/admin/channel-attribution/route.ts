import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getChannelConversionRates, getDuplicateLeadTouches } from '@/lib/marketing/channel-attribution';

export const GET = withPermission('channel_attribution', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ channels: getChannelConversionRates(), dedup: getDuplicateLeadTouches() });
});
