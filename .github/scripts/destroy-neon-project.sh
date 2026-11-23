#!/usr/bin/env bash
# Two phases of an environment teardown, because prevent_destroy blocks terraform destroy on the Neon project:
#   release  takes the project out of Terraform state (before the destroy) and writes its ID to GITHUB_OUTPUT
#   delete   deletes the project (after the destroy); a project that is already gone only gives a notice
set -euo pipefail

release() {
  : "${GITHUB_OUTPUT:?GITHUB_OUTPUT is required}"

  if [ -z "$(terraform -chdir=infra state list module.database)" ]; then
    echo "No Neon project in state; nothing to release."
    echo "neon_project_id=" >>"$GITHUB_OUTPUT"
    return
  fi

  local project_id
  project_id=$(terraform -chdir=infra output -raw neon_project_id)
  echo "neon_project_id=${project_id}" >>"$GITHUB_OUTPUT"
  terraform -chdir=infra state rm module.database
  echo "Released Neon project ${project_id} from state."
}

delete() {
  : "${PROJECT_NAME:?PROJECT_NAME is required}"
  : "${ENVIRONMENT:?ENVIRONMENT is required}"

  local scripts name project_id matches
  scripts="$(dirname "$0")"
  name="${PROJECT_NAME}-${ENVIRONMENT}"

  # A re-dispatch after a failed run has no ID from state, so fall back to the Terraform-derived name.
  project_id="${RELEASED_PROJECT_ID:-}"
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
      npx --yes neon@9.5.0 projects delete "$matches" --output json --no-analytics </dev/null >/dev/null
      echo "Deleted Neon project ${matches}."
      ;;
    *)
      echo "::error::More than one Neon project is named ${name}; delete the right one by hand."
      exit 1
      ;;
  esac
}

case "${1:-}" in
  release) release ;;
  delete) delete ;;
  *)
    echo "Usage: $0 release|delete" >&2
    exit 2
    ;;
esac
