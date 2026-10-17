#!/usr/bin/env bash
# verify_sprint_plan.sh — deterministic gate for a sprint-plan draft.
#
# Usage: verify_sprint_plan.sh <sprint-plan.md> <roadmap.md>
# Exit 0 = plan is well-formed; 1 = plan fails a check (fixable by redrafting);
# 2 = misuse or missing input (anomaly — the loop blocks, never retries).
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: verify_sprint_plan.sh <sprint-plan.md> <roadmap.md>" >&2
  exit 2
fi

plan="$1"
roadmap="$2"

for f in "$plan" "$roadmap"; do
  if [ ! -s "$f" ]; then
    echo "verify_sprint_plan.sh: '$f' does not exist or is empty" >&2
    exit 2
  fi
done

fail() {
  echo "verify_sprint_plan.sh: $*" >&2
  exit 1
}

# Roadmap item ids come only from "## R<n> · title" headings.
roadmap_ids=$(grep -oE '^## R[0-9]+' "$roadmap" | cut -c4- || true)
[ -n "$roadmap_ids" ] || {
  echo "verify_sprint_plan.sh: no '## R<n>' items in '$roadmap'" >&2
  exit 2
}

# --- Header ---------------------------------------------------------------
sprint_no=$(sed -nE '1s/^# Sprint ([0-9]+): .+/\1/p' "$plan")
[ -n "$sprint_no" ] || fail "first line must be '# Sprint <n>: <goal>'"

grep -qE '^- Status: proposed$' "$plan" || fail "missing '- Status: proposed'"
grep -qE '^- Dates: [0-9]{4}-[0-9]{2}-[0-9]{2} → [0-9]{4}-[0-9]{2}-[0-9]{2}$' "$plan" ||
  fail "missing or malformed '- Dates: YYYY-MM-DD → YYYY-MM-DD'"

capacity=$(sed -nE 's/^- Capacity: ([0-9]+)$/\1/p' "$plan" | head -n1)
[ -n "$capacity" ] || fail "missing '- Capacity: <n>'"
# Hard ceiling from HUMAN-GATES.md's budget; a draft can't raise it.
[ "$capacity" -ge 1 ] && [ "$capacity" -le 8 ] || fail "capacity $capacity outside 1-8"

sprint_roadmap=$(sed -nE 's/^- Roadmap: (R[0-9]+)$/\1/p' "$plan" | head -n1)
[ -n "$sprint_roadmap" ] || fail "missing sprint-level '- Roadmap: R<n>'"
printf '%s\n' "$roadmap_ids" | grep -qx "$sprint_roadmap" ||
  fail "sprint roadmap item $sprint_roadmap is not in '$roadmap'"

# --- Stories --------------------------------------------------------------
story_ids=$(grep -oE "^### S${sprint_no}\.[0-9]+ · " "$plan" | sed -E 's/^### (S[0-9]+\.[0-9]+) · /\1/' || true)
[ -n "$story_ids" ] || fail "no stories ('### S${sprint_no}.<k> · title')"

# Any '### S' heading that doesn't match this sprint's numbering is a malformed story.
total_headings=$(grep -cE '^### S' "$plan" || true)
story_count=$(printf '%s\n' "$story_ids" | wc -l | tr -d ' ')
[ "$total_headings" -eq "$story_count" ] || fail "a story heading doesn't match 'S${sprint_no}.<k> · title'"
[ "$story_count" -le "$capacity" ] || fail "$story_count stories exceed capacity $capacity"

dupes=$(printf '%s\n' "$story_ids" | sort | uniq -d)
[ -z "$dupes" ] || fail "duplicate story ids: $dupes"

# Check each story block (from its heading to the next '### ' or '## ').
for id in $story_ids; do
  block=$(awk -v id="$id" '
    $0 ~ "^### " id " · " {f=1; next}
    f && /^##/ {exit}
    f {print}
  ' "$plan")

  r=$(printf '%s\n' "$block" | sed -nE 's/^- Roadmap: (R[0-9]+)$/\1/p' | head -n1)
  [ -n "$r" ] || fail "$id: missing '- Roadmap: R<n>'"
  printf '%s\n' "$roadmap_ids" | grep -qx "$r" || fail "$id: roadmap item $r is not in '$roadmap'"

  printf '%s\n' "$block" | grep -qE '^- Size: (S|M|L)$' || fail "$id: '- Size:' must be S, M or L"
  printf '%s\n' "$block" | grep -qE '^- Accounting: (yes|no)$' || fail "$id: '- Accounting:' must be yes or no"
  printf '%s\n' "$block" | grep -qE '^- Depends on: .+' || fail "$id: missing '- Depends on:'"
  printf '%s\n' "$block" | grep -qE '^\*\*Story:\*\* As an? .+, I want .+, so that .+\.?$' ||
    fail "$id: story must read 'As a <persona>, I want <capability>, so that <outcome>'"
  printf '%s\n' "$block" | grep -qE '^- \[ \] .+' || fail "$id: needs at least one '- [ ]' acceptance criterion"

  # Dependencies on other stories must name stories in this plan.
  deps=$(printf '%s\n' "$block" | sed -nE 's/^- Depends on: (.+)$/\1/p' | grep -oE "S[0-9]+\.[0-9]+" || true)
  for d in $deps; do
    printf '%s\n' "$story_ids" | grep -qx "$d" || fail "$id: depends on $d, which is not in this sprint"
    [ "$d" != "$id" ] || fail "$id: depends on itself"
  done
done

grep -qE '^## Risks and decisions needed$' "$plan" || fail "missing '## Risks and decisions needed' section"

exit 0
