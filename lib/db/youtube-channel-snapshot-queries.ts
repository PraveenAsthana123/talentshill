import { db, schema } from './index';
import { desc, eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { youtubeChannelSnapshots } = schema;

export function createChannelSnapshot(data: {
  snapshotDate: Date;
  subscriberCount: number;
  totalViews: number;
  totalWatchTimeMinutes?: number;
  notes?: string;
  createdBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(youtubeChannelSnapshots).values({
    id, snapshotDate: data.snapshotDate, subscriberCount: data.subscriberCount,
    totalViews: data.totalViews, totalWatchTimeMinutes: data.totalWatchTimeMinutes ?? null,
    notes: data.notes ?? null, createdBy: data.createdBy, createdAt: now,
  }).run();
  return id;
}

export function getAllChannelSnapshots(options: { limit?: number; offset?: number } = {}) {
  const { limit = 50, offset = 0 } = options;
  const items = db.select().from(youtubeChannelSnapshots).orderBy(desc(youtubeChannelSnapshots.snapshotDate)).limit(limit).offset(offset).all();
  const total = db.select().from(youtubeChannelSnapshots).all().length;
  return { items, total };
}

export function getChannelSnapshotById(id: string) {
  return db.select().from(youtubeChannelSnapshots).where(eq(youtubeChannelSnapshots.id, id)).get();
}

// Real, deterministic: the two most recent real snapshots by
// snapshot_date, oldest-first. Returns fewer than 2 if fewer real
// snapshots exist.
export function getLatestTwoChannelSnapshots() {
  const latest = db.select().from(youtubeChannelSnapshots).orderBy(desc(youtubeChannelSnapshots.snapshotDate)).limit(2).all();
  return latest.reverse();
}

export function deleteChannelSnapshot(id: string) {
  db.delete(youtubeChannelSnapshots).where(eq(youtubeChannelSnapshots.id, id)).run();
}
