#!/usr/bin/env bash
# Deletes the environment's Neon project. Idempotent: a project that is already gone only gives a notice.
set -euo pipefail

: "${NEON_API_KEY:?NEON_API_KEY is required}"
: "${NEON_ORG_ID:?NEON_ORG_ID is required}"
: "${PROJECT_NAME:?PROJECT_NAME is required}"
: "${ENVIRONMENT:?ENVIRONMENT is required}"

neon() { npx --yes neon@9.5.0 "$@" --no-analytics </dev/null; }

projects=$(neon projects list --org-id "$NEON_ORG_ID" --output json)
ids() { jq -r "(if type == \"array\" then . else .projects end)[] | select($1) | .id" <<<"$projects"; }

# A re-dispatch after a failed run has no ID from state, so fall back to the Terraform-derived name.
project_id="${NEON_PROJECT_ID:-}"
if [ -n "$project_id" ]; then
  matches=$(ids ".id == \"${project_id}\"")
else
  matches=$(ids ".name == \"${PROJECT_NAME}-${ENVIRONMENT}\"")
fi

case $(grep -c . <<<"$matches" || true) in
  0)
    echo "::notice::No Neon project ${project_id:-named ${PROJECT_NAME}-${ENVIRONMENT}}; it is already deleted."
    ;;
  1)
    neon projects delete "$matches" >/dev/null
    echo "Deleted Neon project ${matches}."
    ;;
  *)
    echo "::error::More than one Neon project is named ${PROJECT_NAME}-${ENVIRONMENT}; delete the right one by hand."
    exit 1
    ;;
esac
