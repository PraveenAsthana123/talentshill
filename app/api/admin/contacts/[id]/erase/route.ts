import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { db } from '@/lib/db';
import { contacts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { logAudit } from '@/lib/db/admin-queries';
import { logger } from '@/lib/logger';

export const POST = withPermission('contacts', 'delete')(
  async (_req: NextRequest, context: unknown) => {
    const { params } = context as { params: { id: string } };
    const contactId = params.id;

    if (!contactId) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    try {
      // Anonymize PII fields rather than hard delete (preserves audit trail
      // and FK-linked records while satisfying GDPR right to erasure).
      await db
        .update(contacts)
        .set({
          firstName: '[ERASED]',
          lastName: '[ERASED]',
          email: `erased-${contactId}@gdpr.invalid`,
          phone: null,
          company: null,
        })
        .where(eq(contacts.id, contactId));

      // Log the erasure in the audit trail
      logAudit({
        entityType: 'contact',
        entityId: contactId,
        action: 'gdpr_erasure',
        metadata: { reason: 'GDPR right to erasure request' },
      });

      logger.info({ contactId }, '[gdpr] Contact PII erased');

      return NextResponse.json({
        success: true,
        message: 'Contact PII erased per GDPR request',
      });
    } catch (err) {
      logger.error({ err, contactId }, '[gdpr] Failed to erase contact PII');
      return NextResponse.json({ error: 'Failed to erase contact' }, { status: 500 });
    }
  }
);
