#!/usr/bin/env bash
# Render every route in headless Chrome against `npm run serve` and assert that
# each one actually produced DOM, has exactly one <h1>, shows real content rather
# than an error or not-found page, and emits no internal link that skips the
# deploy base path.
#
# The content check exists because ErrorBoundary and NotFound both render an
# <h1> — a route crashing into the error page satisfied "exactly one h1" and
# passed silently while every blog post was broken.
#
# Usage: npm run build && npm run serve &  then: bash scripts/smoke.sh
set -uo pipefail

BASE="${BASE:-http://localhost:4173}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
# "route|expected" — expected is a substring the real page must contain.
# The catch-all is the one route that is supposed to render NotFound.
ROUTES=(
  "|Standard RAG"
  "work|Selected"
  "work/neuralnoodle|NeuralNoodle"
  "work/hdes|Home Decor"
  "work/tdd|Tomato"
  "work/svufe|Signature"
  "blog|engineering"
  "blog/understanding-transformer|Understanding Transformers"
  "blog/django-stripe|Django"
  "blog/disease-detection|Disease Detection"
  "nope|No such page"
)

[ -x "$CHROME" ] || { echo "Chrome not found at $CHROME"; exit 2; }

fails=0
for entry in "${ROUTES[@]}"; do
  r="${entry%%|*}"
  expect="${entry#*|}"
  dom=$("$CHROME" --headless --no-sandbox --enable-unsafe-swiftshader --virtual-time-budget=8000 \
        --dump-dom "$BASE/$r" 2>/dev/null)
  result=$(EXPECT="$expect" ROUTE="$r" printf '%s' "$dom" | EXPECT="$expect" ROUTE="$r" python3 -c '
import sys, re, os
s = sys.stdin.read()
expect = os.environ["EXPECT"]
route = os.environ["ROUTE"]
m = re.search(r"<div id=\"root\">(.*)</div>\s*<script|<div id=\"root\">(.*)$", s, re.S)
root = next((g for g in (m.groups() if m else []) if g), "") if m else ""
strip = lambda t: re.sub(r"<[^>]+>", "", t).strip()

problems = []
if len(root) < 500:
    problems.append(f"root nearly empty ({len(root)} bytes)")

# A route that crashed renders ErrorBoundary; one that failed to resolve renders
# NotFound. Both look like a valid page to a naive h1 count.
text = re.sub(r"<[^>]+>", " ", root)
if "Something broke" in text:
    problems.append("rendered the ErrorBoundary")
if route != "nope" and "No such" in text:
    problems.append("rendered NotFound")
if expect not in text:
    problems.append(f"missing expected content {expect!r}")

h1 = re.findall(r"<h1[^>]*>(.*?)</h1>", root, re.S)
if len(h1) != 1:
    problems.append(f"{len(h1)} <h1> (want 1)")

# internal links that bypass the deploy base path
# With base "/" every internal href is already root-relative, so this guards
# against a stray hardcoded sub-path reappearing rather than a missing prefix.
bad = [h for h in re.findall(r"href=\"(/[^\"]*)\"", root)
       if h.startswith("/SaurabShrestha/")]
if bad:
    problems.append("stale /SaurabShrestha/ links: " + ", ".join(sorted(set(bad))[:4]))

title = strip(h1[0])[:44] if h1 else "(no h1)"
print(("FAIL " + "; ".join(problems)) if problems else "ok   " + title)
')
  printf "  %-36s %s\n" "/$r" "$result"
  [[ "$result" == FAIL* ]] && fails=$((fails+1))
done

echo
if [ "$fails" -gt 0 ]; then echo "✗ $fails route(s) failed"; exit 1; fi
echo "✓ all ${#ROUTES[@]} routes render"
