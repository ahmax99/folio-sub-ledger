#!/usr/bin/env bash
# Prints the ID of each Neon project in NEON_ORG_ID that matches exactly, one per line: --name <name> or --id <id>.
# The Neon CLI reads NEON_API_KEY from the environment and pages through every project.
set -euo pipefail

: "${NEON_API_KEY:?NEON_API_KEY is required}"
: "${NEON_ORG_ID:?NEON_ORG_ID is required}"

case "${1:-}" in
  --name) field=name ;;
  --id) field=id ;;
  *)
    echo "usage: $0 --name <name> | --id <id>" >&2
    exit 2
    ;;
esac
value="${2:?a value is required}"

npx --yes neon@9.5.0 projects list --org-id "$NEON_ORG_ID" --output json --no-analytics </dev/null |
  jq -r --arg field "$field" --arg value "$value" '.[] | select(.[$field] == $value) | .id'
