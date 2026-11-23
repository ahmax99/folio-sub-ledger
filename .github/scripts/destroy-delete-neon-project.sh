#!/usr/bin/env bash
# Deletes the environment's Neon project. Idempotent: a project that is already gone only gives a notice.
set -euo pipefail

: "${PROJECT_NAME:?PROJECT_NAME is required}"
: "${ENVIRONMENT:?ENVIRONMENT is required}"

scripts="$(dirname "$0")"
name="${PROJECT_NAME}-${ENVIRONMENT}"

# A re-dispatch after a failed run has no ID from state, so fall back to the Terraform-derived name.
project_id="${NEON_PROJECT_ID:-}"
if [ -n "$project_id" ]; then
  matches=$("$scripts/neon-find-project.sh" --id "$project_id")
else
  matches=$("$scripts/neon-find-project.sh" --name "$name")
fi

case $(grep -c . <<<"$matches" || true) in
  0)
    echo "::notice::No Neon project ${project_id:-named ${name}}; it is already deleted."
    ;;
  1)
    "$scripts/neon-api.sh" DELETE "/projects/${matches}" >/dev/null
    echo "Deleted Neon project ${matches}."
    ;;
  *)
    echo "::error::More than one Neon project is named ${name}; delete the right one by hand."
    exit 1
    ;;
esac
