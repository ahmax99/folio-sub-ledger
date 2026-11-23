#!/usr/bin/env bash
# Takes the Neon project out of Terraform state, because prevent_destroy would fail the destroy.
# destroy-delete-neon-project.sh deletes the project after the rest of the environment is gone.
set -euo pipefail

: "${GITHUB_OUTPUT:?GITHUB_OUTPUT is required}"

if [ -z "$(terraform -chdir=infra state list module.database)" ]; then
  echo "No Neon project in state; nothing to release."
  echo "neon_project_id=" >>"$GITHUB_OUTPUT"
  exit 0
fi

project_id=$(terraform -chdir=infra output -raw neon_project_id)
echo "neon_project_id=${project_id}" >>"$GITHUB_OUTPUT"
terraform -chdir=infra state rm module.database
echo "Released Neon project ${project_id} from state."
