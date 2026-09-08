import { NextRequest, NextResponse } from 'next/server';
import { getCampaignById, updateCampaign, deleteCampaign, getCampaignVariants } from '@/lib/db/campaign-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaign = getCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    const variants = getCampaignVariants(id);
    return NextResponse.json({ campaign, variants });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { scheduledAt, startedAt, completedAt, ...rest } = body;
    updateCampaign(id, {
      ...rest,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      completedAt: completedAt ? new Date(completedAt) : undefined,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteCampaign(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
}
