import { db, schema } from './index';
import { eq, sql } from 'drizzle-orm';

const { contacts, campaignRecipients } = schema;

export interface ContactActivationAggregate {
  contactId: string;
  status: string;
  createdAt: Date;
  totalSent: number;
  totalOpens: number;
  totalClicks: number;
  lastOpenedAt: Date | null;
  lastClickedAt: Date | null;
}

const SENT_STATUSES = ['sent', 'delivered', 'opened', 'clicked'];

// Real SQL aggregation over real campaign_recipients rows -- a contact's
// full cross-campaign send/open/click history, not scoped to one
// campaign. Contacts with zero campaign_recipients rows return
// totalSent:0 (never a fabricated engagement number).
export function getActivationAggregateForAllContacts(): ContactActivationAggregate[] {
  const rows = db.select({
    contactId: contacts.id,
    status: contacts.status,
    createdAt: contacts.createdAt,
    totalSent: sql<number>`COALESCE(SUM(CASE WHEN ${campaignRecipients.status} IN ('sent','delivered','opened','clicked') THEN 1 ELSE 0 END), 0)`,
    totalOpens: sql<number>`COALESCE(SUM(CASE WHEN ${campaignRecipients.openedAt} IS NOT NULL THEN 1 ELSE 0 END), 0)`,
    totalClicks: sql<number>`COALESCE(SUM(CASE WHEN ${campaignRecipients.clickedAt} IS NOT NULL THEN 1 ELSE 0 END), 0)`,
    lastOpenedAt: sql<number | null>`MAX(${campaignRecipients.openedAt})`,
    lastClickedAt: sql<number | null>`MAX(${campaignRecipients.clickedAt})`,
  })
    .from(contacts)
    .leftJoin(campaignRecipients, eq(campaignRecipients.contactId, contacts.id))
    .groupBy(contacts.id)
    .all();

  // Raw SQL MAX() bypasses drizzle's timestamp-mode column mapping, which
  // returns seconds-since-epoch (confirmed against a real stored row,
  // not assumed) -- must be *1000 to build a valid JS Date, unlike
  // drizzle's normal ORM-mapped reads which do this conversion for you.
  return rows.map((r) => ({
    ...r,
    lastOpenedAt: r.lastOpenedAt ? new Date(r.lastOpenedAt * 1000) : null,
    lastClickedAt: r.lastClickedAt ? new Date(r.lastClickedAt * 1000) : null,
  }));
}

export function getActivationAggregateForContact(contactId: string): ContactActivationAggregate | null {
  return getActivationAggregateForAllContacts().find((c) => c.contactId === contactId) ?? null;
}
