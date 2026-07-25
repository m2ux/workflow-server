#!/usr/bin/env bash
# DEPRECATED — project checkouts are managed by the user, outside workflow-server.
#
# workflow-server does not clone, update, or materialise product repos.
# Place basename checkouts under HOST_PROJECTS_ROOT yourself, for example:
#
#   $HOST_PROJECTS_ROOT/<repo>/                 # your clone
#   $HOST_PROJECTS_ROOT/<repo>/.engineering/    # after deploy.sh in that repo
#   $HOST_PROJECTS_ROOT/<repo>/.worktrees/      # feature worktrees (gitignored)
#
# See setup.md and docs/install-projects-worktrees.md.
set -euo pipefail

cat >&2 <<'EOF'
error: init-repo.sh is deprecated and no longer materialises project checkouts.

Project repository management is done solely by you, external to workflow-server:

  1. Clone or keep the product repo under $HOST_PROJECTS_ROOT/<repo>/ (basename).
  2. In that checkout, run scripts/deploy.sh (from the workflow-server repo) so
     .engineering/ exists for planning.
  3. Pass repo: "owner/repo" on start_session; the server plans under
     $HOST_PROJECTS_ROOT/<repo>/.engineering/artifacts/planning/.

Do not use this script. Prefer:

  install.sh --projects-root=~/projects/dev   # points HOST_PROJECTS_ROOT only
  # then manage clones under that root yourself

Docs: setup.md · docs/install-projects-worktrees.md · docs/engineering-storage.md
EOF
exit 1
