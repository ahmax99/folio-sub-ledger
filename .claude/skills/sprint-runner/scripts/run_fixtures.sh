#!/usr/bin/env bash
# run_fixtures.sh — prove verify_sprint_plan.sh passes good drafts and rejects bad ones.
set -uo pipefail
here=$(cd "$(dirname "$0")" && pwd)
v="$here/verify_sprint_plan.sh"
fx="$here/fixtures"
status=0

expect() {
  local want="$1" plan="$2" roadmap="${3:-$fx/roadmap.md}"
  "$v" "$plan" "$roadmap" >/dev/null 2>&1
  local got=$?
  if [ "$got" -eq "$want" ]; then
    echo "ok   exit $got  $(basename "$plan")"
  else
    echo "FAIL want $want got $got  $(basename "$plan")"
    status=1
  fi
}

expect 0 "$fx/plan-pass.md"
for f in "$fx"/plan-fail-*.md; do expect 1 "$f"; done
expect 2 "$fx/does-not-exist.md"
expect 2 "$fx/plan-pass.md" "$fx/does-not-exist.md"
exit $status
