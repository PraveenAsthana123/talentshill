import { db, schema } from '../db/index';
import { eq } from 'drizzle-orm';

const { siteSettings } = schema;

interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  scheduledEnd: string | null;
}

export function getMaintenanceStatus(): MaintenanceStatus {
  const setting = db.select().from(siteSettings)
    .where(eq(siteSettings.key, 'maintenance_mode'))
    .get();

  if (!setting || !setting.value) {
    return { enabled: false, message: '', scheduledEnd: null };
  }

  let status: MaintenanceStatus;
  try {
    status = JSON.parse(setting.value as string);
  } catch {
    return { enabled: false, message: '', scheduledEnd: null };
  }

  // scheduledEnd was stored but never actually checked anywhere -- a
  // real gap: maintenance mode could be scheduled to end at a given
  // time but would stay enabled forever past that time until someone
  // manually flipped it off. Auto-expire here so every caller
  // (including the new public enforcement check) sees the real state.
  if (status.enabled && status.scheduledEnd) {
    const endTime = new Date(status.scheduledEnd).getTime();
    if (!Number.isNaN(endTime) && endTime <= Date.now()) {
      return { ...status, enabled: false };
    }
  }

  return status;
}

export function setMaintenanceMode(enabled: boolean, message?: string, scheduledEnd?: string) {
  const value = JSON.stringify({
    enabled,
    message: message || 'We are currently performing maintenance. Please check back soon.',
    scheduledEnd: scheduledEnd || null,
  });

  const existing = db.select().from(siteSettings)
    .where(eq(siteSettings.key, 'maintenance_mode'))
    .get();

  if (existing) {
    db.update(siteSettings).set({
      value,
      updatedAt: new Date(),
    }).where(eq(siteSettings.key, 'maintenance_mode')).run();
  } else {
    db.insert(siteSettings).values({
      key: 'maintenance_mode',
      value,
      updatedAt: new Date(),
    }).run();
  }
}

export function isMaintenanceMode(): boolean {
  return getMaintenanceStatus().enabled;
}
