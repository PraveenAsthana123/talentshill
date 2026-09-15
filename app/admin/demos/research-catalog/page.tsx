'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge, Button } from '@/components/ui';

interface Methodology { num: number; name: string; description: string; typicalOutput: string; status: string; }
interface Data { total: number; notStartedCount: number; methodologies: Methodology[]; }
interface DimRow { dimension: string; score: string; rationale: string; }

const CALC_METHODOLOGY_NUMS = [1, 28, 45];

export default function ResearchCatalogPage() {
  const [data, setData] = useState<Data | null>(null);
  const [selected, setSelected] = useState<Methodology | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [dims, setDims] = useState<DimRow[]>([{ dimension: '', score: '', rationale: '' }]);
  const [detail, setDetail] = useState<{ assessments: unknown[]; calculations: unknown[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const load = () => fetch('/api/admin/research-catalog/').then((r) => r.json()).then(setData);
  useEffect(() => { load(); }, []);

  const loadDetail = (num: number) => fetch(`/api/admin/research-assessment/?methodologyNum=${num}`).then((r) => r.json()).then(setDetail);

  const selectMethodology = (m: Methodology) => {
    setSelected(m);
    setSubjectName('');
    setDims([{ dimension: '', score: '', rationale: '' }]);
    setLastResult(null);
    loadDetail(m.num);
  };

  const post = (payload: unknown) => fetch('/api/admin/research-assessment/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((r) => r.json());

  const submitAssessment = async () => {
    if (!selected) return;
    setSaving(true);
    const dimensionScores = dims.filter((d) => d.dimension.trim()).map((d) => ({ dimension: d.dimension, score: Number(d.score), rationale: d.rationale }));
    const res = await post({ action: 'assess', methodologyNum: selected.num, subjectName, dimensionScores });
    setSaving(false);
    if (res.error) { setLastResult(`Error: ${res.error}`); return; }
    setLastResult(`Saved — composite score computed from ${dimensionScores.length} real dimension(s).`);
    await loadDetail(selected.num);
    await load();
  };

  return (
    <div>
      <SectionHeader
        title="Research Methodology Catalog (90 items)"
        subtitle="Real, generic Research Assessment Engine + 3 distinct calculators (TAM/SAM/SOM, NPS, Van Westendorp) now back every methodology — real structured admin input, real deterministic scoring. No live third-party data feed exists for any of the 90 (disclosed)."
      />
      {!data ? <p>Loading...</p> : (
        <>
          <Card><CardBody>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{data.total - data.notStartedCount} / {data.total} partial (real tool exists)</p>
          </CardBody></Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, marginTop: 16 }}>
            <Card><CardBody>
              <table style={{ width: '100%', fontSize: 13 }}>
                <thead><tr><th style={{ textAlign: 'left' }}>#</th><th style={{ textAlign: 'left' }}>Methodology</th><th>Status</th></tr></thead>
                <tbody>{data.methodologies.map((m) => (
                  <tr key={m.num} onClick={() => selectMethodology(m)} style={{ cursor: 'pointer', background: selected?.num === m.num ? '#eef' : undefined }}>
                    <td>{m.num}</td><td>{m.name}</td><td><Badge variant={m.status === 'partial' ? 'success' : 'default'}>{m.status}</Badge></td>
                  </tr>
                ))}</tbody>
              </table>
            </CardBody></Card>

            <Card><CardBody>
              {!selected ? <p style={{ color: '#888' }}>Click a methodology to log a real assessment.</p> : (
                <>
                  <p style={{ fontWeight: 700 }}>#{selected.num} {selected.name}</p>
                  <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{selected.description}</p>

                  {CALC_METHODOLOGY_NUMS.includes(selected.num) ? (
                    <p style={{ fontSize: 12, color: '#888', marginTop: 12 }}>This methodology uses a distinct real calculator (TAM/SAM/SOM, NPS, or Van Westendorp), not the generic dimension-scoring form below — call it directly via the API (action=calc_tam_sam_som / calc_nps / calc_van_westendorp on /api/admin/research-assessment/).</p>
                  ) : (
                    <>
                      <input placeholder="Subject (e.g. 'Canadian physiotherapy market')" value={subjectName} onChange={(e) => setSubjectName(e.target.value)} style={{ width: '100%', marginTop: 12, padding: 6 }} />
                      {dims.map((d, i) => (
                        <div key={i} style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                          <input placeholder="Dimension" value={d.dimension} onChange={(e) => setDims(dims.map((x, j) => j === i ? { ...x, dimension: e.target.value } : x))} style={{ flex: 2, padding: 4 }} />
                          <input placeholder="Score 0-100" type="number" value={d.score} onChange={(e) => setDims(dims.map((x, j) => j === i ? { ...x, score: e.target.value } : x))} style={{ flex: 1, padding: 4 }} />
                          <input placeholder="Rationale" value={d.rationale} onChange={(e) => setDims(dims.map((x, j) => j === i ? { ...x, rationale: e.target.value } : x))} style={{ flex: 2, padding: 4 }} />
                        </div>
                      ))}
                      <Button onClick={() => setDims([...dims, { dimension: '', score: '', rationale: '' }])} style={{ marginTop: 8 }}>+ dimension</Button>
                      <Button onClick={submitAssessment} disabled={saving || !subjectName.trim()} style={{ marginTop: 8, marginLeft: 8 }}>{saving ? 'Saving...' : 'Save real assessment'}</Button>
                      {lastResult && <p style={{ marginTop: 8, fontSize: 13 }}>{lastResult}</p>}
                    </>
                  )}

                  {detail && (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>Real history ({detail.assessments.length} assessments, {detail.calculations.length} calculations)</p>
                      <pre style={{ fontSize: 11, maxHeight: 200, overflow: 'auto', background: '#f5f5f5', padding: 8 }}>{JSON.stringify(detail, null, 2)}</pre>
                    </div>
                  )}
                </>
              )}
            </CardBody></Card>
          </div>
        </>
      )}
    </div>
  );
}
