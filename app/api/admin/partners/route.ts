import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { createPartner, updatePartnerStatus, getPartners, getPartnerSummary } from '@/lib/partner/business-partner';

export const GET = withPermission('partner_ecosystem', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ partners: getPartners(), summary: getPartnerSummary() });
});

export const POST = withPermission('partner_ecosystem', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { partnerName?: string; partnerType?: string; contactName?: string; contactEmail?: string; notes?: string } | null;
  if (!body?.partnerName || !body.partnerType) return NextResponse.json({ error: 'partnerName and partnerType are required' }, { status: 400 });
  try {
    const id = createPartner({ ...body, partnerName: body.partnerName, partnerType: body.partnerType as CreatePartnerType, createdBy: 'admin' });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to create partner' }, { status: 400 });
  }
});

type CreatePartnerType = 'technology' | 'agency' | 'referral' | 'co_marketing' | 'reseller' | 'other';

export const PATCH = withPermission('partner_ecosystem', 'update')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { id?: string; status?: 'prospecting' | 'active' | 'inactive' } | null;
  if (!body?.id || !body.status) return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
  updatePartnerStatus(body.id, body.status);
  return NextResponse.json({ ok: true });
});
