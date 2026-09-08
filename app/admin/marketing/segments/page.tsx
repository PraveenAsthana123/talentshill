'use client';

import { useState } from 'react';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminSegments.module.css';

interface RuleCondition { field: string; operator: string; value: string; }

const FIELDS = ['email', 'firstName', 'lastName', 'company', 'phone', 'source', 'status', 'tags', 'createdAt'];
const OPERATORS = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'greater_than', label: 'greater than' },
  { value: 'less_than', label: 'less than' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' },
];

export default function AdminSegmentsPage() {
  const [conditions, setConditions] = useState<RuleCondition[]>([{ field: 'email', operator: 'contains', value: '' }]);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [listName, setListName] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const addCondition = () => setConditions([...conditions, { field: 'email', operator: 'equals', value: '' }]);
  const removeCondition = (idx: number) => setConditions(conditions.filter((_, i) => i !== idx));
  const updateCondition = (idx: number, field: string, value: string) => {
    setConditions(conditions.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try {
      const rules = { logic, conditions: conditions.filter(c => c.value || c.operator === 'is_empty' || c.operator === 'is_not_empty') };
      const res = await fetch('/api/admin/lists/preview/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });
      const data = await res.json();
      setPreviewCount(data.count ?? 0);
    } catch { setPreviewCount(null); }
    setPreviewing(false);
  };

  const handleSave = async () => {
    if (!listName.trim()) return;
    setSaving(true);
    try {
      const rules = { logic, conditions };
      await fetch('/api/admin/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: listName,
          type: 'dynamic',
          rules: JSON.stringify(rules),
        }),
      });
      setMessage('Segment saved as list');
      setListName('');
    } catch { setMessage('Error saving segment'); }
    setSaving(false);
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Segment Builder" subtitle="Build dynamic audience segments with flexible rules." />

      <div className={styles.builderCard}>
        <div className={styles.logicToggle}>
          <span className={styles.logicLabel}>Match</span>
          <button className={`${styles.logicBtn} ${logic === 'AND' ? styles.logicActive : ''}`} onClick={() => setLogic('AND')}>All (AND)</button>
          <button className={`${styles.logicBtn} ${logic === 'OR' ? styles.logicActive : ''}`} onClick={() => setLogic('OR')}>Any (OR)</button>
          <span className={styles.logicLabel}>of the following:</span>
        </div>

        <div className={styles.conditionList}>
          {conditions.map((c, i) => (
            <div key={i} className={styles.conditionRow}>
              <select className={styles.select} value={c.field} onChange={(e) => updateCondition(i, 'field', e.target.value)}>
                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <select className={styles.select} value={c.operator} onChange={(e) => updateCondition(i, 'operator', e.target.value)}>
                {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {c.operator !== 'is_empty' && c.operator !== 'is_not_empty' && (
                <input className={styles.input} value={c.value} onChange={(e) => updateCondition(i, 'value', e.target.value)} placeholder="Value..." />
              )}
              <button className={styles.removeBtn} onClick={() => removeCondition(i)} disabled={conditions.length <= 1}>&times;</button>
            </div>
          ))}
        </div>

        <button className={styles.addBtn} onClick={addCondition}>+ Add Condition</button>

        <div className={styles.previewBar}>
          <Button size="sm" variant="ghost" onClick={handlePreview} disabled={previewing}>
            {previewing ? 'Counting...' : 'Preview Count'}
          </Button>
          {previewCount !== null && (
            <span className={styles.previewCount}>{previewCount} contacts match</span>
          )}
        </div>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.saveBar}>
        <input className={styles.nameInput} value={listName} onChange={(e) => setListName(e.target.value)} placeholder="Segment name..." />
        <Button variant="primary" onClick={handleSave} disabled={saving || !listName.trim()}>
          {saving ? 'Saving...' : 'Save as Dynamic List'}
        </Button>
      </div>
    </div>
  );
}
