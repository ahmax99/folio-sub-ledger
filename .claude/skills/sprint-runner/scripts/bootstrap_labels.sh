#!/usr/bin/env bash
# bootstrap_labels.sh — one-time GitHub label setup for the sprint-runner
# state machine. HUMAN setup step, run once before the first /run-sprint;
# the loop itself never creates labels.
#
# It reuses backlog-runner's `agent:approved`, `agent:blocked` and
# `ready-for-agent`, so run backlog-runner's bootstrap_labels.sh too.
#
# Usage: scripts/bootstrap_labels.sh
set -euo pipefail

gh label create "sprint" \
  --description "Sprint tracking issue (one open at a time)" \
  --force

gh label create "sprint:plan-pending-approval" \
  --description "Sprint plan drafted in the issue body; waiting on a human" \
  --force

gh label create "sprint:active" \
  --description "Sprint approved; story issues created and in delivery" \
  --force

gh label create "sprint:review-pending-approval" \
  --description "Sprint review + retro posted; waiting on a human to close" \
  --force

gh label create "sprint:waiting" \
  --description "Story whose in-sprint dependencies are still open" \
  --force

echo "sprint-runner labels are ready."
