'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Button, Input, Select, Badge } from '@/components/ui';

interface Summary {
  totalObservations: number;
  mentionRate: number | null;
  byEngine: Record<string, { total: number; mentioned: number }>;
}

export default function GeoVisibilityPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [engine, setEngine] = useState('chatgpt');
  const [queryText, setQueryText] = useState('');
  const [mentioned, setMentioned] = useState(false);
  const [position, setPosition] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => fetch('/api/admin/geo-visibility/').then((r) => r.json()).then(setSummary);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setSubmitting(true);
    await fetch('/api/admin/geo-visibility/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ engine, queryText, talentshillMentioned: mentioned, mentionPosition: mentioned ? Number(position) : undefined }),
    });
    setQueryText(''); setMentioned(false); setPosition('');
    await load();
    setSubmitting(false);
  };

  return (
    <div>
      <SectionHeader
        title="GEO Visibility"
        subtitle="Real, admin-observed AI-answer-engine mention tracking. No automated AI-search-engine API integration exists -- an admin manually runs a real query and logs what they actually saw."
      />
      <Card>
        <CardBody>
          <p>Total real observations: <strong>{summary?.totalObservations ?? 0}</strong> &mdash; Mention rate: <strong>{summary?.mentionRate === null || summary?.mentionRate === undefined ? 'no data' : `${summary.mentionRate}%`}</strong></p>
          {summary && Object.entries(summary.byEngine).map(([eng, v]) => (
            <p key={eng}><Badge>{eng}</Badge> {v.mentioned}/{v.total} mentioned</p>
          ))}
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h3>Log a new observation</h3>
          <Select
            value={engine}
            onChange={(e) => setEngine(e.target.value)}
            options={[
              { value: 'chatgpt', label: 'ChatGPT' },
              { value: 'perplexity', label: 'Perplexity' },
              { value: 'gemini', label: 'Gemini' },
              { value: 'copilot', label: 'Copilot' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Input placeholder="The real query you typed" value={queryText} onChange={(e) => setQueryText(e.target.value)} />
          <label><input type="checkbox" checked={mentioned} onChange={(e) => setMentioned(e.target.checked)} /> TalentsHill was mentioned</label>
          {mentioned && <Input placeholder="Position in answer (e.g. 1)" value={position} onChange={(e) => setPosition(e.target.value)} />}
          <Button onClick={submit} disabled={submitting || !queryText}>{submitting ? 'Saving...' : 'Log Observation'}</Button>
        </CardBody>
      </Card>
    </div>
  );
}
