import { NextRequest, NextResponse } from 'next/server';
import {
  getJob,
  getJobRuns,
  getJobLogs,
  pauseJob,
  cancelJob,
  retryJob,
} from '@/lib/db/job-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = getJob(id);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    const runs = getJobRuns(id);
    const logs = getJobLogs(id);
    return NextResponse.json({ job, runs, logs });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'pause':
        pauseJob(id);
        break;
      case 'cancel':
        cancelJob(id);
        break;
      case 'retry':
        retryJob(id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
