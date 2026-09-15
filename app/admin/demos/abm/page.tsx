'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface AccountMember { fullName: string; email: string; role: string | null; leadScore: number | null; leadTier: string | null; }
interface Account { companyName: string; memberCount: number; members: AccountMember[]; accountScore: number; }
interface Data { accounts: Account[]; summary: { totalAccounts: number; multiStakeholderAccounts: number }; }

export default function AbmDemoPage() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/admin/abm/').then((r) => r.json()).then(setData); }, []);

  return (
    <div>
      <SectionHeader title="Demo — ABM: AI Campaign for Top Enterprise Accounts" subtitle="Real named-account rollup grouping real contact submissions by company for multi-stakeholder buying-committee visibility." />
      {!data ? <p>Loading...</p> : (
        <>
          <Card><CardBody>
            <p><strong>{data.summary.totalAccounts}</strong> real accounts, <strong>{data.summary.multiStakeholderAccounts}</strong> with more than one known contact.</p>
          </CardBody></Card>
          <Card style={{ marginTop: 16 }}><CardBody>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Top real accounts (by account score)</p>
            <table style={{ width: '100%', fontSize: 14 }}>
              <thead><tr><th style={{ textAlign: 'left' }}>Company</th><th>Members</th><th>Score</th></tr></thead>
              <tbody>{data.accounts.slice(0, 10).map((a) => (
                <tr key={a.companyName}><td>{a.companyName}</td><td>{a.memberCount}</td><td><Badge>{a.accountScore}</Badge></td></tr>
              ))}</tbody>
            </table>
          </CardBody></Card>
        </>
      )}
    </div>
  );
}
