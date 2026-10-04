import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllCampaigns, createCampaign } from '@/lib/db/campaign-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['email', 'sms']).default('email'),
  audienceType: z.enum(['list', 'segment', 'all']).optional(),
  audienceId: z.string().optional(),
  emailProfileId: z.string().optional(),
  templateId: z.string().optional(),
  subject: z.string().max(500).optional(),
  throttlePerMinute: z.number().min(1).max(1000).default(60),
  scheduledAt: z.string().datetime().optional(),
  enableAbTest: z.boolean().optional(),
  variantBSubject: z.string().max(500).optional(),
});

export const GET = withPermission('campaigns', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const campaignsList = getAllCampaigns();
    return NextResponse.json({ campaigns: campaignsList });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
});

export const POST = withPermission('campaigns', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const parsed = CreateCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }
    const { name, type, audienceType, audienceId, emailProfileId, templateId, subject, throttlePerMinute,
            scheduledAt, enableAbTest, variantBSubject } = parsed.data;

    const userId = await getSessionUserIdAsync(request);
    const id = createCampaign({
      name, type, audienceType, audienceId, emailProfileId, templateId, subject, throttlePerMinute,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      enableAbTest,
      variantBSubject,
      createdBy: userId ?? undefined,
    });

    logOperationRun({
      moduleKey: 'campaigns', operationName: 'create_campaign', executionMode: 'manual', status: 'completed',
      inputPayload: { name, type }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
});
