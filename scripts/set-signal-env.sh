#!/bin/sh
# Sets the two env vars the anonymous signal route needs on the `hoplight` Vercel project, production.
# The salt is generated here and piped straight in, so it never appears on a command line or in a file.
# Usage: scripts/set-signal-env.sh [path to a checkout linked to the hoplight Vercel project]
# (the linked checkout is the main hoplight-site folder; this worktree has no .vercel link)
set -e
DIR="${1:-hoplight-site}"
printf '%s' "https://quick-tools-pi.vercel.app/api/tool-signal" | vercel env add TOOL_SIGNAL_URL production --cwd "$DIR"
openssl rand -hex 32 | tr -d '\n' | vercel env add SIGNAL_HASH_SALT production --cwd "$DIR"
vercel env ls production --cwd "$DIR"
