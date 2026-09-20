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

echo "== Intake form accessibility =="
# Added 2026-09-16 (tier-one fix lane, bug-first per web-standards review): every field's
# aria-describedby pointed at an id that did not exist in the DOM until an error fired, because
# the Err component returned null when there was no message. Static source check since the bug is
# in the component's own logic, not in anything that needs a live render to observe.
IF="$SRC/components/IntakeForm.tsx"
if grep -qE 'if \(!msg\) return null' "$IF" 2>/dev/null; then
  echo "FAIL: IntakeForm's Err component still returns null with no message (aria-describedby would point at a missing id)"
  fail=1
else
  echo "PASS: IntakeForm's Err component always renders its container (aria-describedby resolves)"
fi

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

echo "== Tier-two structural fixes =="
# Typographer #2, 2026-09-16: .src-line rendered as a sibling of .problem-fig, so the
# ".problem-fig .src-line" descendant selector in globals.css never matched it. Confirms the
# src-line span now lives inside the same .problem-fig wrapper as .pct, not after it closes.
node -e '
  const fs = require("fs");
  const src = fs.readFileSync(process.argv[1], "utf8");
  const figOpen = src.indexOf("<div className=\"problem-fig\">");
  const srcLine = src.indexOf("<span className=\"src-line\">");
  const figClose = src.indexOf("</div>", figOpen);
  if (figOpen === -1 || srcLine === -1 || figClose === -1 || !(figOpen < srcLine && srcLine < figClose)) {
    console.log("FAIL: homepage .src-line is not nested inside .problem-fig (citation selector will not match)");
    process.exit(1);
  }
  console.log("PASS: homepage .src-line is a descendant of .problem-fig");
' "$SRC/app/(main)/page.tsx" || fail=1

# Standards Zealot #1, 2026-09-16: the primary nav was <Link> siblings with no list semantics.
node -e '
  const fs = require("fs");
  const src = fs.readFileSync(process.argv[1], "utf8");
  const navOpen = src.indexOf("<nav id=\"primary-nav\"");
  const navClose = src.indexOf("</nav>", navOpen);
  const ul = src.indexOf("<ul>", navOpen);
  if (navOpen === -1 || navClose === -1 || ul === -1 || !(navOpen < ul && ul < navClose)) {
    console.log("FAIL: primary nav has no <ul> (Standards Zealot #1)");
    process.exit(1);
  }
  console.log("PASS: primary nav wraps its links in a <ul>");
' "$SRC/components/Nav.tsx" || fail=1

# Pixel Cop crime 1, 2026-09-16: ".nav { padding: 12px 0 }" is a shorthand that overwrote .wrap's
# horizontal gutter on the same element, so the header logo sat flush left instead of aligned with
# the hero text below it. (The src-line/.problem-fig nesting and the nav <ul> checks live in
# check-preview-metadata.mjs, where multi-line JSX structure is easier to assert reliably than in
# this grep's single-line matching.)
if grep -qE '^\.nav \{[^}]*padding:\s*[0-9]' "$SRC/app/globals.css"; then
  echo "FAIL: .nav still sets a padding shorthand (erases the .wrap gutter it shares the element with)"
  fail=1
else
  echo "PASS: .nav does not use a padding shorthand"
fi

echo "== Trial claims and retired palette =="
# Added 2026-09-20 (lane dispatch1). Three guards that could not be written with the check_absent
# helper above, because that helper only ever reads $SRC and all three have to cover public/ too:
# the banned "11 to 26 points" range, a rendered lift number with no baseline in its own sentence,
# and the retired navy/gold pair in either hex or rgba() form. Observed red on the tree at d8aa7ba
# (6 banned occurrences, 1 baseline-less number, 41 retired-colour sites across 6 files).
node "$ROOT/scripts/check-claims-and-palette.mjs" || fail=1

echo "== Served brand tokens =="
# Added 2026-09-20 (lane dispatch1). The served token files under public/ are generated from
# src/app/globals.css; this regenerates into memory and fails if what is served has drifted from the
# stylesheet. Without it the served copy becomes one more hand-kept duplicate, which is the exact
# failure the Hoplight brand file in the design canon has been sitting in since 2026-06-02.
node "$ROOT/scripts/build-brand-tokens.mjs" --check || fail=1

if [ "$fail" -eq 0 ]; then
  echo "ALL CHECKS PASSED"
else
  echo "SOME CHECKS FAILED"
fi
exit $fail
