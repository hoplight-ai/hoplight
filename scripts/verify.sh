#!/usr/bin/env bash
# Hoplight overhaul verification. Run from repo root: bash scripts/verify.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/src"
fail=0

check_absent() {
  # $1 = human label, $2 = pattern (grep -Ei)
  if grep -RInEi "$2" "$SRC" >/dev/null 2>&1; then
    echo "FAIL: $1"
    grep -RInEi "$2" "$SRC" | sed 's/^/   /'
    fail=1
  else
    echo "PASS: $1"
  fi
}

check_present() {
  if grep -RInE "$2" "$SRC" >/dev/null 2>&1; then
    echo "PASS: $1"
  else
    echo "FAIL: $1"
    fail=1
  fi
}

echo "== Content scrub =="
check_absent "no 'lorem ipsum'" "lorem ipsum"
check_absent "no 'AI systems for' positioning" "AI systems for"
check_absent "no 'built in the work'" "built in the work"
check_absent "no 'the pod' builder language" "the pod"
check_absent "no internal .html links" "href=\"/[a-z]+\.html"
check_absent "no IP disciplines/subscales count" "subscales|290\+|50\+ (validated )?traditions"
check_absent "no booking CTA copy" "Book a (session|conversation)"

echo "== Required presence =="
check_present "'AI strategy for' positioning present" "AI strategy for labor"
check_present "Contact in nav" "label: 'Contact'"
check_present "Start a conversation CTA" "Start a conversation"
check_present "FAQPage schema" "\"@type\": 'FAQPage'|@type.*FAQPage|FAQPage"
check_present "Organization schema" "Organization"
check_present "stone-deep token used" "var\(--stone-deep\)"
check_present "collapse aria-expanded" "aria-expanded"

echo "== Persuasion IP guardrails =="
# CORRECTED 2026-08-28 (lane preview7). This pointed at "$SRC/app/persuasion/page.tsx",
# a path that has not existed since the routes moved under the (main) route group. grep on a
# missing file always returns non-zero, so all four guardrails below printed PASS without ever
# reading anything. Pointing it at the real directory turns them into real checks.
P="$SRC/app/(main)/persuasion"
for term in "Change Agent" "Governed, not just powerful" "Built on tradition" "subscales"; do
  if grep -RInEi "$term" "$P" >/dev/null 2>&1; then
    echo "FAIL: persuasion still contains '$term'"; fail=1
  else
    echo "PASS: persuasion free of '$term'"
  fi
done

if [ "$fail" -eq 0 ]; then
  echo "ALL CHECKS PASSED"
else
  echo "SOME CHECKS FAILED"
fi
exit $fail
