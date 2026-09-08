import { randomUUID } from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db, schema } from './index';

const { emailProfiles, smtpConfigs, emailProfileSmtp, eventRoutes } = schema;

// ── Email Profiles ──

export function getAllProfiles() {
  return db.select().from(emailProfiles).all();
}

export function getProfileById(id: string) {
  return db.select().from(emailProfiles).where(eq(emailProfiles.id, id)).get();
}

export function getDefaultProfile() {
  return db.select().from(emailProfiles).where(eq(emailProfiles.isDefault, true)).get();
}

export function createProfile(data: {
  name: string;
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  signature?: string;
  isDefault?: boolean;
}) {
  const now = new Date();
  const id = randomUUID();

  // If setting as default, unset other defaults
  if (data.isDefault) {
    db.update(emailProfiles).set({ isDefault: false }).run();
  }

  db.insert(emailProfiles)
    .values({
      id,
      name: data.name,
      fromName: data.fromName,
      fromEmail: data.fromEmail,
      replyTo: data.replyTo,
      signature: data.signature,
      isDefault: data.isDefault ?? false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}

export function updateProfile(id: string, data: {
  name?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  signature?: string;
  isDefault?: boolean;
  isActive?: boolean;
}) {
  if (data.isDefault) {
    db.update(emailProfiles).set({ isDefault: false }).run();
  }
  db.update(emailProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(emailProfiles.id, id))
    .run();
}

export function deleteProfile(id: string) {
  db.delete(emailProfiles).where(eq(emailProfiles.id, id)).run();
}

// ── SMTP Configs ──

export function getAllSmtpConfigs() {
  return db.select().from(smtpConfigs).all();
}

export function getSmtpConfigById(id: string) {
  return db.select().from(smtpConfigs).where(eq(smtpConfigs.id, id)).get();
}

export function createSmtpConfig(data: {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}) {
  const id = randomUUID();
  db.insert(smtpConfigs)
    .values({
      id,
      name: data.name,
      host: data.host,
      port: data.port,
      secure: data.secure,
      username: data.username,
      password: data.password,
      isActive: true,
      createdAt: new Date(),
    })
    .run();
  return id;
}

export function updateSmtpConfig(id: string, data: {
  name?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  isActive?: boolean;
}) {
  db.update(smtpConfigs).set(data).where(eq(smtpConfigs.id, id)).run();
}

export function deleteSmtpConfig(id: string) {
  db.delete(smtpConfigs).where(eq(smtpConfigs.id, id)).run();
}

// ── Profile-SMTP mapping ──

export function getSmtpForProfile(profileId: string) {
  const mappings = db
    .select({ smtpConfigId: emailProfileSmtp.smtpConfigId })
    .from(emailProfileSmtp)
    .where(eq(emailProfileSmtp.profileId, profileId))
    .all();

  if (mappings.length === 0) return undefined;

  return db
    .select()
    .from(smtpConfigs)
    .where(and(eq(smtpConfigs.id, mappings[0].smtpConfigId), eq(smtpConfigs.isActive, true)))
    .get();
}

export function setProfileSmtp(profileId: string, smtpConfigId: string) {
  db.delete(emailProfileSmtp).where(eq(emailProfileSmtp.profileId, profileId)).run();
  db.insert(emailProfileSmtp).values({ profileId, smtpConfigId }).run();
}

// ── Event Routes ──

export function getAllEventRoutes() {
  return db.select().from(eventRoutes).all();
}

export function getProfileForEvent(eventType: string) {
  const route = db
    .select()
    .from(eventRoutes)
    .where(and(eq(eventRoutes.eventType, eventType), eq(eventRoutes.isActive, true)))
    .get();

  if (!route) return undefined;
  return getProfileById(route.profileId);
}

export function upsertEventRoute(eventType: string, profileId: string, description?: string) {
  const existing = db
    .select()
    .from(eventRoutes)
    .where(eq(eventRoutes.eventType, eventType))
    .get();

  if (existing) {
    db.update(eventRoutes)
      .set({ profileId, description, updatedAt: new Date() })
      .where(eq(eventRoutes.id, existing.id))
      .run();
    return existing.id;
  }

  const id = randomUUID();
  db.insert(eventRoutes)
    .values({
      id,
      eventType,
      profileId,
      description,
      isActive: true,
      updatedAt: new Date(),
    })
    .run();
  return id;
}

export function deleteEventRoute(id: string) {
  db.delete(eventRoutes).where(eq(eventRoutes.id, id)).run();
}
