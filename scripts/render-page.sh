#!/usr/bin/env bash
# Render a served HTML page to a letter-size PDF and a desktop PNG with the Chrome on this Mac.
# Usage: bash scripts/render-page.sh public/<page>.html
# Writes public/<page>.pdf next to it and <page>.png into the session scratchpad (or /tmp).
set -euo pipefail
src="$1"
base="${src%.html}"
out_png="${2:-${TMPDIR:-/tmp}/$(basename "$base").png}"
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$chrome" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=4000 \
  --print-to-pdf="$base.pdf" "file://$(pwd)/$src" 2>/dev/null
"$chrome" --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=4000 \
  --window-size=1440,1400 --screenshot="$out_png" "file://$(pwd)/$src" 2>/dev/null
echo "pdf: $base.pdf"
echo "png: $out_png"
