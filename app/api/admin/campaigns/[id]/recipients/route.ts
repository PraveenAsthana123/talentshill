import { NextRequest, NextResponse } from 'next/server';
import { getCampaignRecipients, getCampaignRecipientCount } from '@/lib/db/campaign-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const recipients = getCampaignRecipients(id, { status, limit, offset });
    const total = getCampaignRecipientCount(id);
    return NextResponse.json({ recipients, total });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
  }
}
