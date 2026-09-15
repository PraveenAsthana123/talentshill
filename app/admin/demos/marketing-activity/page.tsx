'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge, Button } from '@/components/ui';

const LABELS: Record<string, string> = {
  demand_generation: 'Demand Generation', referral_marketing: 'Referral Marketing', social_media_marketing: 'Social Media Marketing',
  marketing_automation: 'Marketing Automation', customer_marketing: 'Customer Marketing (Upsell/Cross-Sell)',
  reputation_review_marketing: 'Reputation/Review Marketing', social_listening: 'Social Listening',
  community_marketing: 'Community Marketing', retargeting: 'Retargeting', personalization_marketing: 'Personalization Marketing',
  customer_journey_orchestration: 'Customer Journey Orchestration', pricing_promotion_marketing: 'Pricing/Promotion Marketing',
};

interface Activity { id: string; demoKey: string; channel: string; action: string; outcomeMetricName: string | null; outcomeMetricValue: number | null; loggedAt: string; }
interface Summary { totalActivities: number; byDemoKey: Record<string, number>; coveredDemoKeys: string[]; }

export default function MarketingActivityLogPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const [channel, setChannel] = useState('');
  const [action, setAction] = useState('');
  const [metricName, setMetricName] = useState('');
  const [metricValue, setMetricValue] = useState('');
  const [saving, setSaving] = useState(false);

  const loadSummary = () => fetch('/api/admin/marketing-activity/').then((r) => r.json()).then(setSummary);
  useEffect(() => { loadSummary(); }, []);

  const select = (demoKey: string) => {
    setSelected(demoKey);
    fetch(`/api/admin/marketing-activity/?demoKey=${demoKey}`).then((r) => r.json()).then((d) => setActivities(d.activities));
  };

  const submit = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch('/api/admin/marketing-activity/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ demoKey: selected, channel, action, outcomeMetricName: metricName || undefined, outcomeMetricValue: metricValue ? Number(metricValue) : undefined }),
    });
    setSaving(false);
    setChannel(''); setAction(''); setMetricName(''); setMetricValue('');
    select(selected);
    loadSummary();
  };

  return (
    <div>
      <SectionHeader
        title="Marketing Activity Log"
        subtitle="Real, generic structured activity log covering 12 of the demo catalog's remaining items — Demand Generation, Referral, Social Media, Marketing Automation, Customer/Upsell, Reputation, Social Listening, Community, Retargeting, Personalization, Journey Orchestration, Pricing/Promotion. Deliberately does NOT cover Product-Led Growth, Local Marketing, E-commerce, Podcast, or Loyalty — those assume a self-serve product, physical locations, an online store, a podcast, or a points program TalentsHill doesn't have."
      />
      {!summary ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16, marginTop: 16 }}>
          <Card><CardBody>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>{summary.totalActivities} real activities logged</p>
            {summary.coveredDemoKeys.map((k) => (
              <div key={k} onClick={() => select(k)} style={{ cursor: 'pointer', padding: 6, background: selected === k ? '#eef' : undefined }}>
                {LABELS[k] ?? k} <Badge>{summary.byDemoKey[k] ?? 0}</Badge>
              </div>
            ))}
          </CardBody></Card>

          <Card><CardBody>
            {!selected ? <p style={{ color: '#888' }}>Select an item to log a real activity.</p> : (
              <>
                <p style={{ fontWeight: 700 }}>{LABELS[selected]}</p>
                <input placeholder="Channel" value={channel} onChange={(e) => setChannel(e.target.value)} style={{ width: '100%', marginTop: 8, padding: 6 }} />
                <input placeholder="Action taken" value={action} onChange={(e) => setAction(e.target.value)} style={{ width: '100%', marginTop: 8, padding: 6 }} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input placeholder="Metric name" value={metricName} onChange={(e) => setMetricName(e.target.value)} style={{ flex: 1, padding: 6 }} />
                  <input placeholder="Metric value" type="number" value={metricValue} onChange={(e) => setMetricValue(e.target.value)} style={{ flex: 1, padding: 6 }} />
                </div>
                <Button onClick={submit} disabled={saving || !channel.trim() || !action.trim()} style={{ marginTop: 8 }}>{saving ? 'Saving...' : 'Log real activity'}</Button>

                {activities && (
                  <table style={{ width: '100%', fontSize: 12, marginTop: 16 }}>
                    <thead><tr><th style={{ textAlign: 'left' }}>Channel</th><th style={{ textAlign: 'left' }}>Action</th><th>Metric</th></tr></thead>
                    <tbody>{activities.map((a) => (
                      <tr key={a.id}><td>{a.channel}</td><td>{a.action}</td><td>{a.outcomeMetricName ? `${a.outcomeMetricName}: ${a.outcomeMetricValue}` : '—'}</td></tr>
                    ))}</tbody>
                  </table>
                )}
              </>
            )}
          </CardBody></Card>
        </div>
      )}
    </div>
  );
}
