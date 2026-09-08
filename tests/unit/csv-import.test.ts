import { describe, it, expect } from 'vitest';

describe('CSV Import Parser', () => {
  it('should export parse function', async () => {
    const mod = await import('@/lib/crm/csv-import');
    expect(mod.parseCsvText).toBeDefined();
  });

  it('should parse basic CSV text', async () => {
    const { parseCsvText } = await import('@/lib/crm/csv-import');
    const csv = 'email,firstName,lastName\njohn@test.com,John,Doe\njane@test.com,Jane,Smith';
    const rows = parseCsvText(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0].email).toBe('john@test.com');
    expect(rows[0].firstName).toBe('John');
    expect(rows[0].lastName).toBe('Doe');
    expect(rows[1].email).toBe('jane@test.com');
  });

  it('should handle CSV with extra whitespace', async () => {
    const { parseCsvText } = await import('@/lib/crm/csv-import');
    const csv = 'email , firstName , lastName\n  john@test.com , John , Doe  ';
    const rows = parseCsvText(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe('john@test.com');
    expect(rows[0].firstName).toBe('John');
  });

  it('should handle empty CSV', async () => {
    const { parseCsvText } = await import('@/lib/crm/csv-import');
    const rows = parseCsvText('email,firstName\n');
    expect(rows).toHaveLength(0);
  });

  it('should skip rows without email', async () => {
    const { parseCsvText } = await import('@/lib/crm/csv-import');
    const csv = 'email,firstName\n,NoEmail\nvalid@test.com,Valid';
    const rows = parseCsvText(csv);
    expect(rows).toHaveLength(1);
    expect(rows[0].email).toBe('valid@test.com');
  });
});
