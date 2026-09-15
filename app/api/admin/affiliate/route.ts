import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { recruitAffiliate, createTrackingLink, recordClick, recordConversion, getAffiliateControlTowerView } from '@/lib/affiliate/affiliate-engine';

export const GET = withPermission('affiliate', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json(getAffiliateControlTowerView());
});

// Single action-dispatch endpoint (recruit -> link -> click -> convert),
// same pattern as this session's other net-new engines -- avoids 4
// near-identical route files for one linear real flow.
export const POST = withPermission('affiliate', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as
    | { action: 'recruit'; name: string; email: string; commissionRateBasisPoints?: number }
    | { action: 'create_link'; affiliateId: string; destinationUrl: string }
    | { action: 'click'; trackingCode: string }
    | { action: 'convert'; affiliateClickId: string; orderValueCents: number }
    | null;

  if (!body?.action) return NextResponse.json({ error: 'action is required (recruit|create_link|click|convert)' }, { status: 400 });

  try {
    if (body.action === 'recruit') {
      if (!body.name || !body.email) return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
      const id = recruitAffiliate({ name: body.name, email: body.email, commissionRateBasisPoints: body.commissionRateBasisPoints });
      return NextResponse.json({ id }, { status: 201 });
    }
    if (body.action === 'create_link') {
      if (!body.affiliateId || !body.destinationUrl) return NextResponse.json({ error: 'affiliateId and destinationUrl are required' }, { status: 400 });
      const link = createTrackingLink(body.affiliateId, body.destinationUrl);
      return NextResponse.json(link, { status: 201 });
    }
    if (body.action === 'click') {
      if (!body.trackingCode) return NextResponse.json({ error: 'trackingCode is required' }, { status: 400 });
      const id = recordClick(body.trackingCode);
      return NextResponse.json({ id }, { status: 201 });
    }
    if (body.action === 'convert') {
      if (!body.affiliateClickId || !body.orderValueCents) return NextResponse.json({ error: 'affiliateClickId and orderValueCents are required' }, { status: 400 });
      const result = recordConversion({ affiliateClickId: body.affiliateClickId, orderValueCents: body.orderValueCents });
      return NextResponse.json(result, { status: 201 });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to process affiliate action' }, { status: 400 });
  }
});
