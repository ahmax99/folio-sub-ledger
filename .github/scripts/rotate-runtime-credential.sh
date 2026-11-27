#!/usr/bin/env bash
# Rotates the API's runtime database credential (docs/decisions/2026-11-21-rotated-runtime-database-credentials.md).
# Gives the inactive runtime user a new expiring password, makes it the active user in the secret, and checks it logs in.
# The previously active user keeps its password, so Lambdas pinned to it at cold start keep working.
# With FIRST_RUN_ONLY=true it changes nothing once the secret is set up, and only checks that the active user logs in.
# Env: OWNER_URL (folio_owner, pooled), SECRET_ID, FIRST_RUN_ONLY (default false). Never run with `set -x`: the variables hold passwords.
set -euo pipefail

: "${OWNER_URL:?OWNER_URL is required}"
: "${SECRET_ID:?SECRET_ID is required}"

# Must stay above Neon's 7-day password_expiration_warning_threshold, or ALTER ROLE fails (spike G3).
readonly VALIDITY_DAYS=14
readonly USERS=(folio_runtime_a folio_runtime_b)

# Sets $password in this shell, so the mask is printed on the runner's stdout before the value is used.
new_password() {
  password=$(openssl rand -hex 32)
  echo "::add-mask::${password}"
}

# psql reads the password and expiry from its environment, so neither appears in argv.
set_password() {
  ROLE="$1" NEW_PASSWORD="$2" VALID_UNTIL="$valid_until" psql --no-psqlrc --quiet -v ON_ERROR_STOP=1 <<'SQL'
\getenv role ROLE
\getenv pw NEW_PASSWORD
\getenv until VALID_UNTIL
ALTER ROLE :"role" PASSWORD :'pw' VALID UNTIL :'until';
SQL
}

# The Lambda connects through the pooled host as the active user; prove that works now, not at its next cold start.
check_login() {
  if ! PGUSER="$1" PGPASSWORD="$2" psql --no-psqlrc --quiet -v ON_ERROR_STOP=1 -tAc 'SELECT 1' >/dev/null; then
    echo "::error::$1 cannot log in through ${PGHOST}. Dispatch Rotate DB Credentials for this environment."
    exit 1
  fi
  echo "$1 logs in through ${PGHOST}."
}

# Split the owner URL into libpq variables, so it never reaches argv either.
rest="${OWNER_URL#*://}"
userinfo="${rest%%@*}"
hostpath="${rest#*@}"
export PGUSER="${userinfo%%:*}" PGPASSWORD="${userinfo#*:}"
export PGHOST="${hostpath%%/*}"
dbquery="${hostpath#*/}"
export PGDATABASE="${dbquery%%\?*}" PGSSLMODE=require
echo "::add-mask::${PGPASSWORD}"

valid_until=$(date -u -d "+${VALIDITY_DAYS} days" '+%Y-%m-%d %H:%M:%S+00')

# Only a secret without a value counts as missing; any other read error stops the run before a password changes.
if ! current=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ID" \
  --query SecretString --output text 2>"${RUNNER_TEMP:-/tmp}/get-secret.err"); then
  if grep -q ResourceNotFoundException "${RUNNER_TEMP:-/tmp}/get-secret.err"; then
    current=''
  else
    cat "${RUNNER_TEMP:-/tmp}/get-secret.err" >&2
    exit 1
  fi
fi

valid_secret='(.active == "folio_runtime_a" or .active == "folio_runtime_b")
  and (.passwords.folio_runtime_a | type == "string" and length > 0)
  and (.passwords.folio_runtime_b | type == "string" and length > 0)'

if jq -e "$valid_secret" <<<"$current" >/dev/null 2>&1; then
  for user in "${USERS[@]}"; do
    echo "::add-mask::$(jq -r --arg u "$user" '.passwords[$u]' <<<"$current")"
  done
  previous=$(jq -r '.active' <<<"$current")
  if [ "${FIRST_RUN_ONLY:-false}" = true ]; then
    check_login "$previous" "$(jq -r --arg u "$previous" '.passwords[$u]' <<<"$current")"
    echo "The secret is already set up; the daily rotation keeps it fresh."
    exit 0
  fi
  if [ "$previous" = folio_runtime_a ]; then active=folio_runtime_b; else active=folio_runtime_a; fi
  new_password
  set_password "$active" "$password"
  passwords=$(PW="$password" jq -c --arg u "$active" '.passwords | .[$u] = env.PW' <<<"$current")
  echo "Rotated ${active}; ${previous} keeps its password."
else
  # First run: no secret value yet, or the pre-rotation connection string. Both users get passwords.
  active=folio_runtime_a
  passwords='{}'
  for user in "${USERS[@]}"; do
    new_password
    set_password "$user" "$password"
    passwords=$(PW="$password" jq -c --arg u "$user" '.[$u] = env.PW' <<<"$passwords")
  done
  echo "First rotation: set passwords for both runtime users."
fi

PASSWORDS="$passwords" jq -n --arg host "$PGHOST" --arg database "$PGDATABASE" --arg active "$active" \
  '{host: $host, database: $database, active: $active, passwords: (env.PASSWORDS | fromjson)}' |
  aws secretsmanager put-secret-value --secret-id "$SECRET_ID" --secret-string file:///dev/stdin >/dev/null
echo "Secret updated: ${active} is active until $(date -u -d "+${VALIDITY_DAYS} days" +%F)."

check_login "$active" "$(jq -r --arg u "$active" '.[$u]' <<<"$passwords")"
