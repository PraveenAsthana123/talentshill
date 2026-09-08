import { db, schema } from './index';
import { eq, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { integrations, integrationAccounts } = schema;

export function createIntegration(data: {
  providerKey: string;
  name: string;
  description?: string;
  category: string;
  iconUrl?: string;
  configSchema?: Record<string, unknown>;
}) {
  const id = randomUUID();
  db.insert(integrations).values({
    id,
    providerKey: data.providerKey,
    name: data.name,
    description: data.description ?? null,
    category: data.category,
    iconUrl: data.iconUrl ?? null,
    isAvailable: true,
    configSchema: data.configSchema ? JSON.stringify(data.configSchema) : null,
    createdAt: new Date(),
  }).run();
  return id;
}

export function getIntegrationByKey(key: string) {
  return db.select().from(integrations).where(eq(integrations.providerKey, key)).get();
}

export function getIntegrationById(id: string) {
  return db.select().from(integrations).where(eq(integrations.id, id)).get();
}

export function getAllIntegrations() {
  return db.select().from(integrations).orderBy(integrations.name).all();
}

export function createAccount(data: {
  integrationId: string;
  name: string;
  credentials?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  connectedBy?: string;
}) {
  const id = randomUUID();
  db.insert(integrationAccounts).values({
    id,
    integrationId: data.integrationId,
    name: data.name,
    status: 'connected',
    credentials: data.credentials ? JSON.stringify(data.credentials) : null,
    settings: data.settings ? JSON.stringify(data.settings) : null,
    connectedBy: data.connectedBy ?? null,
    connectedAt: new Date(),
  }).run();
  return id;
}

export function getAccountsByIntegration(integrationId: string) {
  return db.select().from(integrationAccounts).where(eq(integrationAccounts.integrationId, integrationId)).all();
}

export function getAccountById(id: string) {
  return db.select().from(integrationAccounts).where(eq(integrationAccounts.id, id)).get();
}

export function getActiveAccounts() {
  return db.select().from(integrationAccounts).where(eq(integrationAccounts.status, 'connected')).all();
}

export function updateAccountStatus(id: string, status: string, errorMessage?: string) {
  db.update(integrationAccounts).set({
    status,
    errorMessage: errorMessage ?? null,
    ...(status === 'connected' ? { connectedAt: new Date() } : {}),
  }).where(eq(integrationAccounts.id, id)).run();
}

export function deleteAccount(id: string) {
  db.delete(integrationAccounts).where(eq(integrationAccounts.id, id)).run();
}
