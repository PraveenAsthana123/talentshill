import styles from './LeadsShared.module.css';

const TEST_CASES = [
  { mode: 'Manual', case: 'PATCH status update logs operation_run', expected: 'Real manual operation_run row', actual: 'Confirmed — logOperationRun wired into existing PATCH /api/admin/leads/[id]', result: 'PASS' },
  { mode: 'Pipeline', case: 'Score a real lead submitted via the actual public contact form', expected: 'Correct deterministic score', actual: 'Submitted via real /api/contact, scored 85/100 "hot" -- math independently verified: 20+20+20+15+10=85', result: 'PASS' },
  { mode: 'Pipeline', case: 'Score written to real DB', expected: 'contact_submissions.leadScore/leadTier updated', actual: 'Confirmed via direct DB query', result: 'PASS' },
  { mode: 'Agentic', case: 'Real Ollama call drafts qualification narrative', expected: 'Narrative references real submission data', actual: '41.7s real inference, narrative correctly referenced real timeline/budget/score', result: 'PASS' },
  { mode: 'Cross-module', case: 'Test lead cleanup', expected: '0 leftover rows after test', actual: 'Deleted test submission, confirmed 0 rows remain', result: 'PASS' },
];

export default function TestingTab() {
  const passCount = TEST_CASES.filter((t) => t.result === 'PASS').length;
  return (
    <div className={styles.subSection}>
      <h4>Test cases &amp; results ({passCount}/{TEST_CASES.length} passed)</h4>
      <table className={styles.table}>
        <thead><tr><th>Mode</th><th>Case</th><th>Expected</th><th>Actual</th><th>Result</th></tr></thead>
        <tbody>{TEST_CASES.map((t, i) => <tr key={i}><td>{t.mode}</td><td>{t.case}</td><td>{t.expected}</td><td>{t.actual}</td><td>{t.result}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
