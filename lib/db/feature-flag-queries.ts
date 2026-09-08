import { randomUUID } from 'crypto';
import { eq, desc, asc } from 'drizzle-orm';
import { db, schema } from './index';

const { featureFlags, featureFlagVersions, featureFlagActive } = schema;

// ── Get all flags ──
export function getAllFlags() {
  return db
    .select()
    .from(featureFlags)
    .orderBy(asc(featureFlags.sortOrder), asc(featureFlags.label))
    .all();
}

// ── Get flag by ID ──
export function getFlagById(id: string) {
  return db.select().from(featureFlags).where(eq(featureFlags.id, id)).get();
}

// ── Get flag by key ──
export function getFlagByKey(key: string) {
  return db.select().from(featureFlags).where(eq(featureFlags.key, key)).get();
}

// ── Create flag ──
export function createFlag(data: {
  key: string;
  label: string;
  description?: string;
  module?: string;
  isEnabled?: boolean;
  sortOrder?: number;
}) {
  const now = new Date();
  const id = randomUUID();
  db.insert(featureFlags)
    .values({
      id,
      key: data.key,
      label: data.label,
      description: data.description,
      module: data.module,
      isEnabled: data.isEnabled ?? true,
      sortOrder: data.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

// ── Update flag ──
export function updateFlag(id: string, data: {
  label?: string;
  description?: string;
  module?: string;
  sortOrder?: number;
}) {
  db.update(featureFlags)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(featureFlags.id, id))
    .run();
}

// ── Toggle flag ──
export function toggleFlag(id: string, isEnabled: boolean, changedBy?: string) {
  const flag = getFlagById(id);
  if (!flag) return null;

  db.update(featureFlags)
    .set({ isEnabled, updatedAt: new Date() })
    .where(eq(featureFlags.id, id))
    .run();

  // Create version record for the toggle
  const versionId = randomUUID();
  const existingVersions = db
    .select()
    .from(featureFlagVersions)
    .where(eq(featureFlagVersions.flagId, id))
    .all();

  db.insert(featureFlagVersions)
    .values({
      id: versionId,
      flagId: id,
      version: existingVersions.length + 1,
      config: JSON.stringify({ isEnabled }),
      changedBy: changedBy,
      changedAt: new Date(),
    })
    .run();

  return { ...flag, isEnabled };
}

// ── Delete flag ──
export function deleteFlag(id: string) {
  db.delete(featureFlags).where(eq(featureFlags.id, id)).run();
}

// ── Get flag version history ──
export function getFlagHistory(flagId: string) {
  return db
    .select()
    .from(featureFlagVersions)
    .where(eq(featureFlagVersions.flagId, flagId))
    .orderBy(desc(featureFlagVersions.version))
    .all();
}

// ── Create a version snapshot ──
export function createFlagVersion(flagId: string, config: Record<string, unknown>, changedBy?: string) {
  const existingVersions = db
    .select()
    .from(featureFlagVersions)
    .where(eq(featureFlagVersions.flagId, flagId))
    .all();

  const id = randomUUID();
  db.insert(featureFlagVersions)
    .values({
      id,
      flagId,
      version: existingVersions.length + 1,
      config: JSON.stringify(config),
      changedBy,
      changedAt: new Date(),
    })
    .run();

  // Set as active version
  db.delete(featureFlagActive).where(eq(featureFlagActive.flagId, flagId)).run();
  db.insert(featureFlagActive)
    .values({
      flagId,
      versionId: id,
      activatedAt: new Date(),
      activatedBy: changedBy,
    })
    .run();

  return id;
}

// ── Rollback to a specific version ──
export function rollbackToVersion(flagId: string, versionId: string, activatedBy?: string) {
  const version = db
    .select()
    .from(featureFlagVersions)
    .where(eq(featureFlagVersions.id, versionId))
    .get();

  if (!version || version.flagId !== flagId) return null;

  const config = version.config ? JSON.parse(version.config) : {};

  // Apply the version config
  if (config.isEnabled !== undefined) {
    db.update(featureFlags)
      .set({ isEnabled: config.isEnabled, updatedAt: new Date() })
      .where(eq(featureFlags.id, flagId))
      .run();
  }

  // Update active version
  db.delete(featureFlagActive).where(eq(featureFlagActive.flagId, flagId)).run();
  db.insert(featureFlagActive)
    .values({
      flagId,
      versionId,
      activatedAt: new Date(),
      activatedBy,
    })
    .run();

  return version;
}

// ── Get active version for a flag ──
export function getActiveVersion(flagId: string) {
  return db
    .select()
    .from(featureFlagActive)
    .where(eq(featureFlagActive.flagId, flagId))
    .get();
}

// ── Get all enabled flag keys (for cache) ──
export function getEnabledFlagKeys(): string[] {
  const flags = db
    .select({ key: featureFlags.key })
    .from(featureFlags)
    .where(eq(featureFlags.isEnabled, true))
    .all();
  return flags.map(f => f.key);
}
