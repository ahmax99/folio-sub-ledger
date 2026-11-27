#!/usr/bin/env bash
# Writes the API's runtime database credential once per Neon project, then only checks that it still logs in.
# When the secret is missing or invalid, it writes new passwords for both runtime users, with folio_runtime_a active.
# When the active user can't log in, it gives both users the secret's passwords, so an interrupted run heals on retry.
# Env: OWNER_URL (folio_owner, pooled), SECRET_ID. Never run with `set -x`: the variables hold passwords.
set -euo pipefail

: "${OWNER_URL:?OWNER_URL is required}"
: "${SECRET_ID:?SECRET_ID is required}"

readonly USERS=(folio_runtime_a folio_runtime_b)

# Sets $password in this shell, so the mask is printed on the runner's stdout before the value is used.
new_password() {
  password=$(openssl rand -hex 32)
  echo "::add-mask::${password}"
}

# psql reads the password from its environment, so it never appears in argv.
set_password() {
  ROLE="$1" NEW_PASSWORD="$2" psql --no-psqlrc --quiet -v ON_ERROR_STOP=1 <<'SQL'
\getenv role ROLE
\getenv pw NEW_PASSWORD
ALTER ROLE :"role" PASSWORD :'pw';
SQL
}

# The Lambda connects through the pooled host as the active user; prove that works now, not at its next cold start.
logs_in() {
  PGUSER="$1" PGPASSWORD="$2" psql --no-psqlrc --quiet -v ON_ERROR_STOP=1 -tAc 'SELECT 1' >/dev/null 2>&1
}

check_login() {
  if ! logs_in "$1" "$2"; then
    echo "::error::$1 cannot log in through ${PGHOST}. Replace it (runbook: Database credentials → Replace the credential)."
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

password_of() { jq -r --arg u "$1" '.passwords[$u]' <<<"$current"; }

# No secret value yet, or the old connection string. The secret is written before any ALTER ROLE,
# so a failure after this point leaves a valid secret that the next run applies.
if ! jq -e "$valid_secret" <<<"$current" >/dev/null 2>&1; then
  passwords='{}'
  for user in "${USERS[@]}"; do
    new_password
    passwords=$(PW="$password" jq -c --arg u "$user" '.[$u] = env.PW' <<<"$passwords")
  done
  current=$(PASSWORDS="$passwords" jq -c -n --arg host "$PGHOST" --arg database "$PGDATABASE" \
    '{host: $host, database: $database, active: "folio_runtime_a", passwords: (env.PASSWORDS | fromjson)}')
  aws secretsmanager put-secret-value --secret-id "$SECRET_ID" --secret-string file:///dev/stdin <<<"$current" >/dev/null
  echo "Secret written: folio_runtime_a is active."
fi

for user in "${USERS[@]}"; do
  echo "::add-mask::$(password_of "$user")"
done
active=$(jq -r '.active' <<<"$current")

if logs_in "$active" "$(password_of "$active")"; then
  echo "${active} logs in through ${PGHOST}; the secret is set up."
  exit 0
fi

# The secret is the source of truth: give both users its passwords, which a new secret or an interrupted run needs.
for user in "${USERS[@]}"; do
  set_password "$user" "$(password_of "$user")"
done
check_login "$active" "$(password_of "$active")"
