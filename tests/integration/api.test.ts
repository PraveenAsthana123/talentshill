import { describe, it, expect } from 'vitest';

const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:3000';

// Integration tests require a running server (TEST_BASE_URL env var).
// Skip when not set to avoid false failures in unit-test-only CI runs.
const describeIf = (condition: boolean) => condition ? describe : describe.skip;

describeIf(!!process.env.TEST_BASE_URL)('API Integration Tests', () => {
  it('GET /api/health returns 200', async () => {
    const res = await fetch(`${BASE}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json() as { status: string };
    expect(data.status).toBe('ok');
  });

  it('GET /api/admin/contacts returns 401 without auth', async () => {
    const res = await fetch(`${BASE}/api/admin/contacts`);
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login rejects invalid credentials', async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'notexist@test.com', password: 'wrong' }),
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/admin/contacts requires RBAC', async () => {
    const res = await fetch(`${BASE}/api/admin/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': 'session=invalid' },
      body: JSON.stringify({ name: 'test' }),
    });
    expect(res.status).toBe(401);
  });
});
