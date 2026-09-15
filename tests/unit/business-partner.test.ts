import { describe, it, expect } from 'vitest';
import { createPartner, updatePartnerStatus, getPartners } from '@/lib/partner/business-partner';

describe('createPartner', () => {
  it('rejects an empty partnerName (negative case)', () => {
    expect(() => createPartner({ partnerName: '', partnerType: 'agency' })).toThrow(/partnerName/);
  });

  it('creates a real partner defaulting to prospecting status (positive case)', () => {
    const id = createPartner({ partnerName: '__e2e_test_partner', partnerType: 'technology' });
    const partner = getPartners().find((p) => p.id === id);
    expect(partner?.relationshipStatus).toBe('prospecting');
    updatePartnerStatus(id, 'active');
    const updated = getPartners().find((p) => p.id === id);
    expect(updated?.relationshipStatus).toBe('active');
    expect(updated?.startedAt).not.toBeNull();
  });
});
