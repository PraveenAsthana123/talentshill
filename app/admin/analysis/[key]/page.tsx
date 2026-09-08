'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminAnalysisDetail.module.css';

interface AnalysisType { index: number; name: string; }
interface ItemScore { itemIndex: number; itemName: string; status: string; score: number | null; notes: string; updatedAt: string; }
interface Assessment { id: string; projectName: string; status: string; overallScore: number | null; completedItems: number; totalItems: number; itemScores: ItemScore[]; }
interface Framework { id: string; categoryKey: string; categoryName: string; description: string | null; totalItems: number; analysisTypes: AnalysisType[]; }

const STATUS_OPTIONS = ['not_started', 'in_progress', 'completed', 'not_applicable'] as const;

export default function AdminAnalysisDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [items, setItems] = useState<ItemScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newProject, setNewProject] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchFramework = async () => {
      try {
        const res = await fetch(`/api/admin/analysis/frameworks/${key}`);
        const data = await res.json();
        setFramework(data.framework || null);
        setAssessments(data.assessments || []);
        if (data.assessments?.length > 0) {
          setSelectedId(data.assessments[0].id);
          setItems(data.assessments[0].itemScores || []);
        }
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchFramework();
  }, [key]);

  const handleSelectAssessment = (id: string) => {
    setSelectedId(id);
    const a = assessments.find(x => x.id === id);
    setItems(a?.itemScores || []);
  };

  const handleCreateAssessment = async () => {
    if (!newProject.trim() || !framework) return;
    try {
      const res = await fetch('/api/admin/analysis/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frameworkId: framework.id, projectName: newProject }),
      });
      const data = await res.json();
      if (data.id) {
        const newItems = framework.analysisTypes.map(at => ({
          itemIndex: at.index, itemName: at.name, status: 'not_started', score: null, notes: '', updatedAt: new Date().toISOString(),
        }));
        const newAssessment: Assessment = { id: data.id, projectName: newProject, status: 'not_started', overallScore: null, completedItems: 0, totalItems: framework.totalItems, itemScores: newItems };
        setAssessments([newAssessment, ...assessments]);
        setSelectedId(data.id);
        setItems(newItems);
        setNewProject('');
        setMessage('Assessment created');
      }
    } catch { setMessage('Error creating assessment'); }
  };

  const updateItem = (index: number, field: string, value: unknown) => {
    setItems(prev => prev.map(item =>
      item.itemIndex === index ? { ...item, [field]: value, updatedAt: new Date().toISOString() } : item
    ));
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setMessage('');
    try {
      await fetch(`/api/admin/analysis/assessments/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemScores: items }),
      });
      setMessage('Saved successfully');
    } catch { setMessage('Error saving'); }
    setSaving(false);
  };

  const handleExport = () => {
    if (!selectedId) return;
    window.open(`/api/admin/analysis/assessments/${selectedId}/export`, '_blank');
  };

  const currentAssessment = assessments.find(a => a.id === selectedId);
  const completedCount = items.filter(i => i.status === 'completed').length;
  const scoredItems = items.filter(i => i.score !== null && i.score !== undefined);
  const avgScore = scoredItems.length > 0 ? Math.round(scoredItems.reduce((s, i) => s + (i.score ?? 0), 0) / scoredItems.length) : 0;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const filteredItems = statusFilter === 'all' ? items : items.filter(i => i.status === statusFilter);

  if (loading) return <div className={styles.page}><div className={styles.loading}>Loading...</div></div>;
  if (!framework) return <div className={styles.page}><div className={styles.loading}>Framework not found.</div></div>;

  return (
    <div className={styles.page}>
      <SectionHeader label="AI Analysis" title={framework.categoryName} subtitle={framework.description || ''} />
      <Link href="/admin/analysis" className={styles.backLink}>&larr; Back to Analysis Hub</Link>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.assessmentBar}>
        <div className={styles.assessmentSelect}>
          <select className={styles.select} value={selectedId} onChange={(e) => handleSelectAssessment(e.target.value)}>
            {assessments.map(a => (
              <option key={a.id} value={a.id}>{a.projectName} ({a.status})</option>
            ))}
            {assessments.length === 0 && <option value="">No assessments yet</option>}
          </select>
        </div>
        <div className={styles.newAssessment}>
          <input className={styles.input} placeholder="New project name..." value={newProject} onChange={(e) => setNewProject(e.target.value)} />
          <Button size="sm" variant="primary" onClick={handleCreateAssessment} disabled={!newProject.trim()}>Create</Button>
        </div>
      </div>

      {selectedId && (
        <>
          <div className={styles.scoreBar}>
            <div className={styles.scoreCard}>
              <span className={styles.scoreValue}>{avgScore}</span>
              <span className={styles.scoreLabel}>Avg Score</span>
            </div>
            <div className={styles.scoreCard}>
              <span className={styles.scoreValue}>{completedCount}/{items.length}</span>
              <span className={styles.scoreLabel}>Completed</span>
            </div>
            <div className={styles.progressCard}>
              <span className={styles.scoreLabel}>Progress</span>
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.progressText}>{progress}%</span>
            </div>
            <div className={styles.scoreActions}>
              <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Items</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="not_applicable">N/A</option>
              </select>
              <Button size="sm" variant="ghost" onClick={handleExport}>Export JSON</Button>
              <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Analysis Type</th>
                  <th>Status</th>
                  <th>Score (0-100)</th>
                  <th>Notes</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.itemIndex}>
                    <td className={styles.indexCell}>{item.itemIndex}</td>
                    <td className={styles.nameCell}>{item.itemName}</td>
                    <td>
                      <select
                        className={`${styles.statusSelect} ${styles[`st_${item.status}`] || ''}`}
                        value={item.status}
                        onChange={(e) => updateItem(item.itemIndex, 'status', e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className={styles.scoreInput}
                        type="number"
                        min={0}
                        max={100}
                        value={item.score ?? ''}
                        onChange={(e) => updateItem(item.itemIndex, 'score', e.target.value ? Number(e.target.value) : null)}
                      />
                    </td>
                    <td>
                      <input
                        className={styles.notesInput}
                        type="text"
                        value={item.notes}
                        onChange={(e) => updateItem(item.itemIndex, 'notes', e.target.value)}
                        placeholder="Add notes..."
                      />
                    </td>
                    <td className={styles.dateCell}>
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
