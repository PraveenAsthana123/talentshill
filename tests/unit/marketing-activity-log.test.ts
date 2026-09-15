import { describe, it, expect } from 'vitest';
import { COVERED_DEMO_KEYS } from '@/lib/marketing-activity/activity-log';

describe('COVERED_DEMO_KEYS', () => {
  it('covers exactly the 12 applicable not_started demo keys, not the 5 not-applicable ones (negative case)', () => {
    expect(COVERED_DEMO_KEYS).toHaveLength(12);
    expect(COVERED_DEMO_KEYS).not.toContain('product_led_growth');
    expect(COVERED_DEMO_KEYS).not.toContain('local_marketing');
    expect(COVERED_DEMO_KEYS).not.toContain('ecommerce_marketing');
    expect(COVERED_DEMO_KEYS).not.toContain('podcast_marketing');
    expect(COVERED_DEMO_KEYS).not.toContain('loyalty_marketing');
  });

  it('includes referral_marketing and pricing_promotion_marketing (positive case)', () => {
    expect(COVERED_DEMO_KEYS).toContain('referral_marketing');
    expect(COVERED_DEMO_KEYS).toContain('pricing_promotion_marketing');
  });
});
