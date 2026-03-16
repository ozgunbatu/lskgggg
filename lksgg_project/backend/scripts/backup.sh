#!/usr/bin/env bash
set -euo pipefail
STAMP=$(date +%Y%m%d_%H%M%S)
OUTDIR=${BACKUP_DIR:-./backups}
mkdir -p "$OUTDIR"
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required" >&2
  exit 1
fi
pg_dump "$DATABASE_URL" > "$OUTDIR/lksg_backup_$STAMP.sql"
echo "backup created at $OUTDIR/lksg_backup_$STAMP.sql"
