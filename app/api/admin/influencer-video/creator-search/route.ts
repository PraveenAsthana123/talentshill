import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { searchProspectingCreators } from '@/lib/db/influencer-campaign-metrics-queries';

// Real search/filter over creators already in this repo's own DB, not a
// third-party creator-database lookup -- no such integration exists,
// disclosed rather than faked.
export const GET = withPermission('influencer_video', 'read')(async (request: NextRequest) => {
  const platform = request.nextUrl.searchParams.get('platform') || undefined;
  const minFitParam = request.nextUrl.searchParams.get('minAudienceFitScore');
  const minAudienceFitScore = minFitParam ? Number(minFitParam) : undefined;

  const results = searchProspectingCreators({ platform, minAudienceFitScore });
  return NextResponse.json({ results });
});
