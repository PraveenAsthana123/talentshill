import { NextRequest, NextResponse } from 'next/server';
import { deleteChannelSnapshot } from '@/lib/db/youtube-channel-snapshot-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const DELETE = withPermission('youtube', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ snapshotId: string }> };
  const { snapshotId } = await params;
  const userId = await getSessionUserIdAsync(request);
  deleteChannelSnapshot(snapshotId);
  logOperationRun({ moduleKey: 'youtube', operationName: 'manual_delete_channel_snapshot', executionMode: 'manual', status: 'completed', inputPayload: { id: snapshotId }, triggeredBy: userId });
  return NextResponse.json({ success: true });
});
