import { NextRequest, NextResponse } from 'next/server';
import { getJobs, getJobCount, createJob, getQueueStats } from '@/lib/db/job-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const jobsList = getJobs({ type, status, limit, offset });
    const total = getJobCount({ type, status });
    const stats = getQueueStats();

    return NextResponse.json({ jobs: jobsList, total, stats });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, payload, priority, maxRetries, scheduledAt } = body;

    if (!type) {
      return NextResponse.json({ error: 'Job type is required' }, { status: 400 });
    }

    const userId = await getSessionUserIdAsync(request);
    const id = createJob({
      type,
      payload,
      priority,
      maxRetries,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      createdBy: userId ?? undefined,
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
