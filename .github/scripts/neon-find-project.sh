#!/usr/bin/env bash
# Prints the ID of each Neon project in NEON_ORG_ID that matches exactly, one per line: --name <name> or --id <id>.
set -euo pipefail

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

api="$(dirname "$0")/neon-api.sh"
uri() { jq -rn --arg v "$1" '$v | @uri'; }
page_size=400
# search matches partial names and IDs; the jq filter below keeps only exact matches.
query="org_id=$(uri "$NEON_ORG_ID")&limit=${page_size}&search=$(uri "$value")"

cursor=''
while :; do
  page=$("$api" GET "/projects?${query}${cursor:+&cursor=$(uri "$cursor")}")
  # On a server-side timeout the API returns a partial list, which could hide the project.
  if [ "$(jq '.unavailable // [] | length' <<<"$page")" -ne 0 ]; then
    echo "::error::The Neon API returned an incomplete project list; re-run the job." >&2
    exit 1
  fi
  jq -r --arg field "$field" --arg value "$value" \
    '.projects[] | select(.[$field] == $value) | .id' <<<"$page"
  [ "$(jq '.projects | length' <<<"$page")" -lt "$page_size" ] && break
  cursor=$(jq -r '.pagination.cursor // empty' <<<"$page")
  [ -n "$cursor" ] || break
done
