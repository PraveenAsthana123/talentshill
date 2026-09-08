#!/usr/bin/env bash
# Real external health monitor for TalentsHill, adapted from
# sohamyoga/scripts/health-monitor.sh (same log/alert pattern). Checks the
# public /api/health liveness endpoint added this session -- not just
# "is the process alive," but "does the app actually respond and reach
# its database."
#
# NOT YET SCHEDULED as a cron/systemd-timer job. TalentsHill has no
# persistent deployment (no systemd service, no Docker container, no
# fixed port) -- per docs/evidence/TALENTSHILL_COMPARISON.md it "was not
# currently running" as of this session. Running this on a schedule today
# would just log constant, expected failures. Wire it up once TalentsHill
# has a real persistent deployment; until then, run manually to check a
# local dev server.
set -uo pipefail

PORT="${TALENTSHILL_PORT:-3000}"
LOG_DIR="/mnt/deepa/talentshill/.health-logs"
LOG_FILE="$LOG_DIR/health-$(date -u +%Y-%m-%d).log"
ALERT_FILE="$LOG_DIR/alerts.log"
mkdir -p "$LOG_DIR"

TS="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
FAIL_COUNT=0

check() {
  local name="$1" url="$2" expect="${3:-200}"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 8 "$url" 2>/dev/null || echo "000")
  if [ "$code" = "$expect" ]; then
    echo "$TS OK   $name ($url) -> $code" >> "$LOG_FILE"
  else
    echo "$TS FAIL $name ($url) -> $code (expected $expect)" >> "$LOG_FILE"
    echo "$TS FAIL $name ($url) -> $code (expected $expect)" >> "$ALERT_FILE"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
}

check "TalentsHill (public liveness)" "http://127.0.0.1:${PORT}/api/health/"
check "TalentsHill (admin login page)" "http://127.0.0.1:${PORT}/admin/login/"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "$TS SUMMARY: $FAIL_COUNT service(s) failing -- see $ALERT_FILE" >> "$LOG_FILE"
fi

find "$LOG_DIR" -name 'health-*.log' -mtime +14 -delete

exit 0
