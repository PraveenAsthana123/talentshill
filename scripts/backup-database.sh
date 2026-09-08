#!/usr/bin/env bash
# Real backup for TalentsHill's SQLite database. Adapted from
# sohamyoga/scripts/backup-databases.sh -- same retention/naming
# convention, but SQLite doesn't need pg_dump/Docker: WAL checkpoint then
# a straight file copy is the correct, safe way to snapshot a live
# better-sqlite3 database (sqlite3 .backup handles the WAL/live-write case
# correctly, a plain `cp` of a WAL-mode DB while it's being written to is
# not guaranteed consistent).
set -euo pipefail

DB_PATH="/mnt/deepa/talentshill/data/talentshill.db"
BACKUP_DIR="/mnt/deepa/talentshill/.backups"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
RETAIN_DAYS=14

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_PATH" ]; then
  echo "[backup] SKIP: $DB_PATH does not exist"
  exit 0
fi

OUT="$BACKUP_DIR/talentshill_${STAMP}.db"
if sqlite3 "$DB_PATH" ".backup '$OUT'"; then
  gzip "$OUT"
  echo "[backup] OK talentshill -> ${OUT}.gz ($(du -h "${OUT}.gz" | cut -f1))"
else
  echo "[backup] FAILED talentshill" >&2
  exit 1
fi

find "$BACKUP_DIR" -name '*.db.gz' -mtime "+${RETAIN_DAYS}" -print -delete
