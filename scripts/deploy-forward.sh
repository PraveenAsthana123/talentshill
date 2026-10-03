#!/usr/bin/env bash
# =============================================================================
#  TalentsHill Portal — Forward Deployment Script
#  Usage: bash scripts/deploy-forward.sh [--tag v1.x.x] [--method pm2|docker]
#
#  Supports two deployment modes:
#    pm2    — git pull + npm ci + next build + pm2 reload (default if PM2 running)
#    docker — docker compose build --no-cache + docker compose up -d
# =============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_TAG="main"
DEPLOY_METHOD="auto"
LOG_DIR="$REPO_ROOT/logs/deploys"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_LOG="$LOG_DIR/deploy-forward-$TIMESTAMP.log"

GREEN="\033[92m"; YELLOW="\033[93m"; RED="\033[91m"; CYAN="\033[96m"; NC="\033[0m"
info()  { echo -e "${GREEN}[✔] $*${NC}" | tee -a "$DEPLOY_LOG"; }
warn()  { echo -e "${YELLOW}[!] $*${NC}" | tee -a "$DEPLOY_LOG"; }
error() { echo -e "${RED}[✘] $*${NC}" | tee -a "$DEPLOY_LOG"; }
step()  { echo -e "\n${CYAN}══ $* ══${NC}" | tee -a "$DEPLOY_LOG"; }

while [[ $# -gt 0 ]]; do
  case $1 in
    --tag)    DEPLOY_TAG="$2"; shift 2 ;;
    --method) DEPLOY_METHOD="$2"; shift 2 ;;
    *) shift ;;
  esac
done

mkdir -p "$LOG_DIR"
cd "$REPO_ROOT"

# Auto-detect deployment method
if [[ "$DEPLOY_METHOD" == "auto" ]]; then
  if command -v docker &>/dev/null && [[ -f "docker-compose.yml" ]]; then
    DEPLOY_METHOD="docker"
  elif command -v pm2 &>/dev/null; then
    DEPLOY_METHOD="pm2"
  else
    error "Neither Docker nor PM2 found. Install one and retry."
    exit 1
  fi
fi
info "Deployment method: $DEPLOY_METHOD"

# ── Snapshot current state ────────────────────────────────────────────────────
step "Snapshot"
CURRENT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
echo "ROLLBACK_SHA=$CURRENT_SHA" > "$REPO_ROOT/.last-deploy-state"
echo "ROLLBACK_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$REPO_ROOT/.last-deploy-state"
info "Saved rollback point: $CURRENT_SHA"

# ── Pull code ─────────────────────────────────────────────────────────────────
step "Pull $DEPLOY_TAG"
git fetch --tags origin 2>&1 | tee -a "$DEPLOY_LOG"
if [[ "$DEPLOY_TAG" == "main" ]]; then
  git pull origin main 2>&1 | tee -a "$DEPLOY_LOG"
else
  git checkout "$DEPLOY_TAG" 2>&1 | tee -a "$DEPLOY_LOG"
fi
NEW_SHA=$(git rev-parse --short HEAD)
info "At: $NEW_SHA"

# ── Install deps ──────────────────────────────────────────────────────────────
step "npm ci"
npm ci --omit=dev 2>&1 | tail -5 | tee -a "$DEPLOY_LOG"

# ── Deploy ────────────────────────────────────────────────────────────────────
if [[ "$DEPLOY_METHOD" == "docker" ]]; then
  step "Docker build + up"
  docker compose build --no-cache 2>&1 | tee -a "$DEPLOY_LOG"
  docker compose up -d 2>&1 | tee -a "$DEPLOY_LOG"
else
  step "Next.js build + PM2 reload"
  NODE_ENV=production npm run build 2>&1 | tee -a "$DEPLOY_LOG"
  if pm2 list | grep -q "talentshill"; then
    pm2 reload talentshill 2>&1 | tee -a "$DEPLOY_LOG"
  else
    pm2 start npm --name talentshill -- start 2>&1 | tee -a "$DEPLOY_LOG"
  fi
  pm2 save 2>&1 | tee -a "$DEPLOY_LOG"
fi

# ── Health check ──────────────────────────────────────────────────────────────
step "Health check"
RETRIES=0
until curl -sf http://localhost:3000/api/health > /dev/null 2>&1; do
  RETRIES=$((RETRIES+1))
  [[ $RETRIES -ge 30 ]] && { error "Health check failed — triggering rollback"; bash "$REPO_ROOT/scripts/deploy-backward.sh"; exit 1; }
  sleep 3
done
info "Health check passed"

echo "LAST_GOOD_SHA=$NEW_SHA" >> "$REPO_ROOT/.last-deploy-state"
echo ""
echo -e "${GREEN}Forward deployment SUCCESS: $CURRENT_SHA → $NEW_SHA${NC}"
