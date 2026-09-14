#!/usr/bin/env bash
# Run the full automated test pass for this repo: typecheck + all Vitest
# unit tests. Usage:
#   scripts/run-usecase-tests.sh [label]
#   scripts/run-usecase-tests.sh ads-management
#   scripts/run-usecase-tests.sh
#
# Writes a timestamped pass/fail log to docs/testing/, same format as the
# existing docs/testing/2026-09-09_* evidence files. This covers the
# automated half only -- live-server manual verification (curl/UI +
# recording real results into test_execution) is still a separate,
# required step. See docs/policies/USE_CASE_BUILD_STANDARD.md item 6.
set -uo pipefail

cd "$(dirname "$0")/.."
LABEL="${1:-full-suite}"
DATE="$(date -u +%Y-%m-%d)"
TIME="$(date -u +%H%M%S)"
LOG_FILE="docs/testing/${DATE}_${LABEL}-automated-${TIME}.log"

{
  echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) run-usecase-tests.sh ${LABEL} ==="

  echo "--- npx tsc --noEmit ---"
  npx tsc --noEmit -p tsconfig.json
  TSC_EXIT=$?
  echo "tsc exit: $TSC_EXIT"

  echo "--- npx vitest run ---"
  npx vitest run
  VITEST_EXIT=$?
  echo "vitest exit: $VITEST_EXIT"

  if [ "$TSC_EXIT" -eq 0 ] && [ "$VITEST_EXIT" -eq 0 ]; then
    echo "RESULT: PASS"
  else
    echo "RESULT: FAIL"
  fi
} | tee "$LOG_FILE"

echo ""
echo "Log written to $LOG_FILE"
