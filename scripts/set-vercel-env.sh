#!/usr/bin/env bash
# Copies one variable from .env.local into the Vercel project (production, preview, development),
# without the value ever appearing on a command line. Run from the repo root:
#   bash scripts/set-vercel-env.sh MAKE_INTAKE_WEBHOOK
# Requires: `vercel link` done once (creates the gitignored .vercel/ folder) and the variable
# present in .env.local as KEY=value.
set -eu
KEY="${1:?usage: set-vercel-env.sh KEY}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env.local"
[ -f "$ENV_FILE" ] || { echo "no .env.local at $ROOT"; exit 1; }
VALUE="$(grep -E "^${KEY}=" "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r')"
[ -n "$VALUE" ] || { echo "$KEY is empty or missing in .env.local"; exit 1; }
cd "$ROOT"
for target in production preview development; do
  # --force replaces an existing value instead of refusing.
  printf '%s' "$VALUE" | vercel env add "$KEY" "$target" --force --yes >/dev/null
  echo "set $KEY for $target"
done
