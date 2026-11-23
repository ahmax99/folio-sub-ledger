#!/usr/bin/env bash
# Calls the Neon API and prints the JSON body: neon-api.sh <METHOD> <path?query>. Fails on an HTTP error.
set -euo pipefail

: "${NEON_API_KEY:?NEON_API_KEY is required}"
method="${1:?usage: $0 <METHOD> <path>}"
path="${2:?usage: $0 <METHOD> <path>}"

# Only idempotent reads are retried, and only on transient errors (timeouts, 408, 429, 5xx).
retry=()
[ "$method" = GET ] && retry=(--retry 3)

# The key reaches curl through a config on a file descriptor, so it never appears in the process list.
curl --silent --show-error --fail-with-body "${retry[@]}" \
  --request "$method" --header 'Accept: application/json' \
  --config <(printf 'header = "Authorization: Bearer %s"\n' "$NEON_API_KEY") \
  "https://console.neon.tech/api/v2${path}"
