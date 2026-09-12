#!/usr/bin/env bash
# Render every route in headless Chrome against `npm run serve` and assert that
# each one actually produced DOM, has exactly one <h1>, and emits no internal
# link that skips the deploy base path.
#
# Usage: npm run build && npm run serve &  then: bash scripts/smoke.sh
set -uo pipefail

BASE="${BASE:-http://localhost:4173/SaurabShrestha}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
ROUTES=("" "work" "work/neuralnoodle" "work/hdes" "work/tdd" "work/svufe" "blog" "blog/understanding-transformer" "blog/django-stripe" "nope")

[ -x "$CHROME" ] || { echo "Chrome not found at $CHROME"; exit 2; }

fails=0
for r in "${ROUTES[@]}"; do
  dom=$("$CHROME" --headless --disable-gpu --no-sandbox --virtual-time-budget=6000 \
        --dump-dom "$BASE/$r" 2>/dev/null)
  result=$(printf '%s' "$dom" | python3 -c '
import sys, re
s = sys.stdin.read()
m = re.search(r"<div id=\"root\">(.*)</div>\s*<script|<div id=\"root\">(.*)$", s, re.S)
root = next((g for g in (m.groups() if m else []) if g), "") if m else ""
strip = lambda t: re.sub(r"<[^>]+>", "", t).strip()

problems = []
if len(root) < 500:
    problems.append(f"root nearly empty ({len(root)} bytes)")

h1 = re.findall(r"<h1[^>]*>(.*?)</h1>", root, re.S)
if len(h1) != 1:
    problems.append(f"{len(h1)} <h1> (want 1)")

# internal links that bypass the deploy base path
bad = [h for h in re.findall(r"href=\"(/[^\"]*)\"", root)
       if not h.startswith("/SaurabShrestha/") and not h.startswith("//")]
if bad:
    problems.append("unprefixed links: " + ", ".join(sorted(set(bad))[:4]))

title = strip(h1[0])[:44] if h1 else "(no h1)"
print(("FAIL " + "; ".join(problems)) if problems else "ok   " + title)
')
  printf "  %-36s %s\n" "/$r" "$result"
  [[ "$result" == FAIL* ]] && fails=$((fails+1))
done

echo
if [ "$fails" -gt 0 ]; then echo "✗ $fails route(s) failed"; exit 1; fi
echo "✓ all ${#ROUTES[@]} routes render"
