import TestExecutionTab from '@/components/admin/TestExecutionTab';

// Now backed by the real, persisted test_execution table (see
// lib/testing/backfill-test-executions.ts for the migration of this
// module's originally-hardcoded test results into real DB rows) --
// replaces the previous static array.
export default function TestingTab() {
  return <TestExecutionTab moduleKey="competitor_analysis" />;
}
