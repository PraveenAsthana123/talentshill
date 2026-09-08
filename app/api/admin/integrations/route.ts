import { NextResponse } from 'next/server';
import { getAllIntegrations, getAccountsByIntegration } from '@/lib/db/integration-queries';

export async function GET() {
  const integrations = getAllIntegrations();
  const result = integrations.map(i => ({
    ...i,
    configSchema: i.configSchema ? JSON.parse(i.configSchema) : null,
    accounts: getAccountsByIntegration(i.id),
  }));
  return NextResponse.json(result);
}
