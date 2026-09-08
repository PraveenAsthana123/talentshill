'use client';

import { useState } from 'react';
import styles from './AdminImportWizard.module.css';

const STEPS = ['Upload', 'Map Columns', 'Preview', 'Import', 'Results'];
const CONTACT_FIELDS = ['email', 'firstName', 'lastName', 'company', 'phone', 'tags'];

export default function ImportWizardPage() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [csvText, setCsvText] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const hdrs = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
        setHeaders(hdrs);
        const rows = lines.slice(1, 6).map(l => l.split(',').map(c => c.trim().replace(/^["']|["']$/g, '')));
        setPreviewRows(rows);

        // Auto-map obvious columns
        const mapping: Record<string, string> = {};
        hdrs.forEach((h, i) => {
          const lower = h.toLowerCase();
          if (lower === 'email' || lower === 'e-mail') mapping[String(i)] = 'email';
          else if (lower.includes('first')) mapping[String(i)] = 'firstName';
          else if (lower.includes('last')) mapping[String(i)] = 'lastName';
          else if (lower === 'company' || lower === 'organization') mapping[String(i)] = 'company';
          else if (lower === 'phone' || lower === 'telephone') mapping[String(i)] = 'phone';
          else if (lower === 'tags') mapping[String(i)] = 'tags';
        });
        setColumnMapping(mapping);
      }
      setStep(1);
    };
    reader.readAsText(f);
  };

  const updateMapping = (colIdx: string, field: string) => {
    setColumnMapping(prev => {
      const next = { ...prev };
      if (field === '') { delete next[colIdx]; }
      else { next[colIdx] = field; }
      return next;
    });
  };

  const hasEmailMapping = Object.values(columnMapping).includes('email');

  const handleImport = async () => {
    setImporting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText, columnMapping }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); }
      else {
        setResult(data);
        setStep(4);
      }
    } catch { setError('Import failed'); }
    setImporting(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Import Contacts</h1>

      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <div key={s} className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
            <span className={styles.stepNum}>{i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        {step === 0 && (
          <div className={styles.uploadArea}>
            <p className={styles.uploadText}>Upload a CSV file with contact data</p>
            <input type="file" accept=".csv" onChange={handleFileUpload} className={styles.fileInput} />
            <p className={styles.hint}>Required column: email. Optional: firstName, lastName, company, phone, tags</p>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className={styles.stepTitle}>Map Columns</h2>
            <p className={styles.hint}>Map your CSV columns to contact fields</p>
            <div className={styles.mappingTable}>
              {headers.map((h, i) => (
                <div key={i} className={styles.mappingRow}>
                  <span className={styles.csvHeader}>{h}</span>
                  <span className={styles.arrow}>→</span>
                  <select className={styles.select} value={columnMapping[String(i)] || ''} onChange={e => updateMapping(String(i), e.target.value)}>
                    <option value="">Skip</option>
                    {CONTACT_FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                  {previewRows[0] && <span className={styles.sampleValue}>e.g. {previewRows[0][i] || '—'}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className={styles.stepTitle}>Preview</h2>
            <p className={styles.hint}>First 5 rows of your import:</p>
            <table className={styles.table}>
              <thead>
                <tr>
                  {Object.entries(columnMapping).sort(([a], [b]) => Number(a) - Number(b)).map(([idx, field]) => (
                    <th key={idx}>{field}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, ri) => (
                  <tr key={ri}>
                    {Object.keys(columnMapping).sort((a, b) => Number(a) - Number(b)).map(idx => (
                      <td key={idx}>{row[Number(idx)] || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.totalInfo}>Total rows to import: {csvText.split('\n').filter(l => l.trim()).length - 1}</p>
          </div>
        )}

        {step === 3 && (
          <div className={styles.confirmPane}>
            <h2 className={styles.stepTitle}>Confirm Import</h2>
            <p>Ready to import {csvText.split('\n').filter(l => l.trim()).length - 1} contacts?</p>
            <p className={styles.hint}>Duplicate emails will be skipped.</p>
            <button className={styles.btnPrimary} onClick={handleImport} disabled={importing}>
              {importing ? 'Importing...' : 'Start Import'}
            </button>
          </div>
        )}

        {step === 4 && result && (
          <div className={styles.resultsPane}>
            <h2 className={styles.stepTitle}>Import Complete</h2>
            <div className={styles.resultGrid}>
              <div className={styles.resultCard}><span className={styles.resultValue}>{result.imported ?? result.result?.imported ?? 0}</span><span className={styles.resultLabel}>Imported</span></div>
              <div className={styles.resultCard}><span className={styles.resultValue}>{result.duplicates ?? result.result?.duplicates ?? 0}</span><span className={styles.resultLabel}>Duplicates</span></div>
              <div className={styles.resultCard}><span className={styles.resultValue}>{result.errors ?? result.result?.errors ?? 0}</span><span className={styles.resultLabel}>Errors</span></div>
            </div>
          </div>
        )}
      </div>

      {step > 0 && step < 4 && (
        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={() => setStep(s => s - 1)}>Back</button>
          <div className={styles.spacer} />
          {step < 3 && <button className={styles.btnPrimary} onClick={() => setStep(s => s + 1)} disabled={step === 1 && !hasEmailMapping}>Next</button>}
        </div>
      )}
    </div>
  );
}
