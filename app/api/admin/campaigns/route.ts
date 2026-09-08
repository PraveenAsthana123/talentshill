import { NextRequest, NextResponse } from 'next/server';
import { getAllCampaigns, createCampaign } from '@/lib/db/campaign-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET() {
  try {
    const campaignsList = getAllCampaigns();
    return NextResponse.json({ campaigns: campaignsList });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, audienceType, audienceId, emailProfileId, templateId, subject, throttlePerMinute } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const userId = await getSessionUserIdAsync(request);
    const id = createCampaign({
      name, type, audienceType, audienceId, emailProfileId, templateId, subject, throttlePerMinute,
      createdBy: userId ?? undefined,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}
