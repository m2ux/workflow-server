#!/usr/bin/env bash
# Fast-forward the long-lived worktrees to their upstream tips.
#
#   components/main        branch main
#   components/workflows   branch workflows
#   engineering            branch engineering
#
# Feature worktrees under .worktrees/ stay where they are.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
failed=0

bump() {
  local name="$1" dest="$2"
  if [[ ! -d "${dest}/.git" && ! -f "${dest}/.git" ]]; then
    echo "missing worktree: ${dest}" >&2
    failed=1
    return
  fi
  echo "Fast-forward ${name} → ${dest}"
  if ! git -C "$dest" pull --ff-only; then
    echo "failed: ${name}" >&2
    failed=1
  fi
}

bump main "${ROOT}/components/main"
bump workflows "${ROOT}/components/workflows"
bump engineering "${ROOT}/engineering"

exit "$failed"
