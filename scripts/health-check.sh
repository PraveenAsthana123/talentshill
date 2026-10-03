#!/usr/bin/env bash
# TalentsHill Portal — Health Check
# Usage: bash scripts/health-check.sh [--json]
set -uo pipefail

JSON=false
[[ "${1:-}" == "--json" ]] && JSON=true

GREEN="\033[92m"; RED="\033[91m"; YELLOW="\033[93m"; NC="\033[0m"
FAIL=0

ok()   { echo -e "${GREEN}[OK]  $*${NC}"; }
fail() { echo -e "${RED}[FAIL] $*${NC}"; FAIL=$((FAIL+1)); }
warn() { echo -e "${YELLOW}[WARN] $*${NC}"; }

check() {
  local name="$1"; local url="$2"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
  [[ "$code" == "200" ]] && ok "$name → HTTP $code" || { fail "$name → HTTP $code"; }
}

echo ""
echo "=== TalentsHill Health Check — $(date) ==="
echo ""

# App
check "Next.js /api/health"   "http://localhost:3000/api/health"
check "Next.js root"          "http://localhost:3000"

# nginx (if running)
check "nginx (HTTP)"          "http://localhost:80" 2>/dev/null || warn "nginx not on port 80"
check "nginx (HTTPS)"         "https://localhost:443" 2>/dev/null || warn "nginx not on port 443"

# Ollama
check "Ollama API"            "http://localhost:11434/api/tags"

# Docker
if command -v docker &>/dev/null; then
  echo ""
  echo "--- Docker status ---"
  docker compose ps 2>/dev/null || docker ps 2>/dev/null || warn "docker not available"
fi

echo ""
[[ $FAIL -eq 0 ]] && echo -e "${GREEN}All checks passed.${NC}" || echo -e "${RED}$FAIL check(s) FAILED.${NC}"
exit $FAIL
