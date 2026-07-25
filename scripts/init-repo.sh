#!/usr/bin/env bash
# Project checkouts are managed outside workflow-server.
set -euo pipefail

cat >&2 <<'EOF'
error: init-repo.sh is not used.

Manage product repositories yourself:

  1. Clone or keep the product repo under $HOST_PROJECTS_ROOT/<repo>/ (basename).
  2. In that checkout, run scripts/deploy.sh (from the workflow-server repo) so
     .engineering/ exists for planning.
  3. Pass repo: "owner/repo" on start_session; the server plans under
     $HOST_PROJECTS_ROOT/<repo>/.engineering/artifacts/planning/.

Docs: setup.md · docs/install-projects-worktrees.md · docs/engineering-storage.md
EOF
exit 1
