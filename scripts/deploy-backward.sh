#!/usr/bin/env bash
# =============================================================================
#  TalentsHill Portal — Backward / Rollback Deployment Script
#  Usage: bash scripts/deploy-backward.sh [--to <sha-or-tag>]
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATE_FILE="$REPO_ROOT/.last-deploy-state"
LOG_DIR="$REPO_ROOT/logs/deploys"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ROLLBACK_LOG="$LOG_DIR/deploy-backward-$TIMESTAMP.log"
TARGET_SHA=""

GREEN="\033[92m"; YELLOW="\033[93m"; RED="\033[91m"; CYAN="\033[96m"; NC="\033[0m"
info()  { echo -e "${GREEN}[✔] $*${NC}" | tee -a "$ROLLBACK_LOG"; }
warn()  { echo -e "${YELLOW}[!] $*${NC}" | tee -a "$ROLLBACK_LOG"; }
error() { echo -e "${RED}[✘] $*${NC}" | tee -a "$ROLLBACK_LOG"; }
step()  { echo -e "\n${CYAN}══ $* ══${NC}" | tee -a "$ROLLBACK_LOG"; }

while [[ $# -gt 0 ]]; do
  case $1 in
    --to) TARGET_SHA="$2"; shift 2 ;;
    *) shift ;;
  esac
done

mkdir -p "$LOG_DIR"
cd "$REPO_ROOT"

step "Determining rollback target"
if [[ -z "$TARGET_SHA" ]]; then
  if [[ -f "$STATE_FILE" ]]; then
    TARGET_SHA=$(grep ROLLBACK_SHA "$STATE_FILE" 2>/dev/null | cut -d= -f2 | tr -d ' ')
  fi
  if [[ -z "$TARGET_SHA" || "$TARGET_SHA" == "unknown" ]]; then
    TARGET_SHA=$(git rev-parse --short HEAD~1 2>/dev/null || "")
    warn "No state file — using HEAD~1: $TARGET_SHA"
  fi
fi

CURRENT_SHA=$(git rev-parse --short HEAD)
info "Rolling back: $CURRENT_SHA → $TARGET_SHA"

step "Checkout $TARGET_SHA"
git fetch --tags origin 2>&1 | tee -a "$ROLLBACK_LOG"
git checkout "$TARGET_SHA" 2>&1 | tee -a "$ROLLBACK_LOG"

step "Rebuild and restart"
npm ci --omit=dev 2>&1 | tail -5 | tee -a "$ROLLBACK_LOG"

if command -v docker &>/dev/null && [[ -f "docker-compose.yml" ]]; then
  docker compose build 2>&1 | tee -a "$ROLLBACK_LOG"
  docker compose up -d 2>&1 | tee -a "$ROLLBACK_LOG"
else
  NODE_ENV=production npm run build 2>&1 | tee -a "$ROLLBACK_LOG"
  pm2 reload talentshill || pm2 start npm --name talentshill -- start
  pm2 save
fi

step "Health check"
RETRIES=0
until curl -sf http://localhost:3000/api/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES+1))
  [[ $RETRIES -ge 30 ]] && { error "Health check FAILED after rollback — manual intervention required"; exit 2; }
  sleep 3
done
info "Health OK after rollback"

echo "" | tee -a "$ROLLBACK_LOG"
echo -e "${GREEN}Rollback SUCCESS: $CURRENT_SHA → $TARGET_SHA${NC}"
