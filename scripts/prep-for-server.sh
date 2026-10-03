#!/usr/bin/env bash
# scripts/prep-for-server.sh
# Run this on your DESKTOP before deploying to the VPS.
#
# The server doesn't have ../sohamyoga/packages/shared-social-platforms
# This script packs that local dep into a tarball in ./vendor/
# so the server can do a clean npm ci.
#
# Usage: bash scripts/prep-for-server.sh

set -euo pipefail
cd "$(dirname "$0")/.."

G="\033[92m"; Y="\033[93m"; R="\033[91m"; X="\033[0m"
info() { echo -e "${G}[✔] $*${X}"; }
warn() { echo -e "${Y}[!] $*${X}"; }
error(){ echo -e "${R}[✘] $*${X}"; exit 1; }

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  TalentsHill — Desktop pre-deploy prep"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LOCAL_DEP="../sohamyoga/packages/shared-social-platforms"
VENDOR_DIR="./vendor"
PACKED="$VENDOR_DIR/shared-social-platforms.tgz"

# ── 1. Pack the local dep ─────────────────────────────────────────────────
echo ""
echo "Step 1/3 — Pack local dependency"
if [ ! -d "$LOCAL_DEP" ]; then
  error "Cannot find $LOCAL_DEP — run this from /mnt/deepa/talentshill/"
fi

mkdir -p "$VENDOR_DIR"
rm -f "$VENDOR_DIR"/*.tgz

TGZ_NAME=$(npm pack "$LOCAL_DEP" --pack-destination "$VENDOR_DIR" 2>/dev/null | tail -1)
mv "$VENDOR_DIR/$TGZ_NAME" "$PACKED" 2>/dev/null || true
info "Packed → $PACKED"

# ── 2. Patch package.json ─────────────────────────────────────────────────
echo ""
echo "Step 2/3 — Patch package.json"
OLD='"@sohamyoga/shared-social-platforms": "file:../sohamyoga/packages/shared-social-platforms"'
NEW='"@sohamyoga/shared-social-platforms": "file:./vendor/shared-social-platforms.tgz"'

if grep -q "file:../sohamyoga" package.json; then
  # Use Python for reliable in-place string replace (avoids sed escaping issues)
  python3 -c "
import pathlib
p = pathlib.Path('package.json')
t = p.read_text()
t = t.replace(
    '\"@sohamyoga/shared-social-platforms\": \"file:../sohamyoga/packages/shared-social-platforms\"',
    '\"@sohamyoga/shared-social-platforms\": \"file:./vendor/shared-social-platforms.tgz\"'
)
p.write_text(t)
print('Patched')
"
  info "package.json patched — dep now points to tarball"
elif grep -q "file:./vendor" package.json; then
  info "package.json already patched"
else
  warn "Could not find @sohamyoga/shared-social-platforms in package.json — check manually"
fi

# ── 3. Verify npm ci works with the tarball ───────────────────────────────
echo ""
echo "Step 3/3 — Verify npm ci with tarball dep"
npm ci --omit=dev 2>&1 | tail -3
info "npm ci passed with tarball dep"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${G}  ✔  Ready to commit and push to server${X}"
echo ""
echo "  Now run:"
echo "    git add vendor/shared-social-platforms.tgz package.json"
echo "    git commit -m 'chore: bundle shared-social-platforms for server deploy'"
echo "    git push origin main"
echo ""
echo "  On the server:"
echo "    git clone https://github.com/PraveenAsthana123/talentshill /opt/talentshill"
echo "    sudo python3 /opt/talentshill/scripts/install.py \\"
echo "      --domain talentshill.com \\"
echo "      --email admin@talentshill.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
