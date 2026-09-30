#!/usr/bin/env bash
# Fast-forward the workspace checkout, the engineering worktree at .engineering/,
# and each component worktree under .project/ to its upstream tip.
#
# Feature worktrees under .worktrees/ stay where they are.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
failed=0

bump() {
  local name="$1" dest="$2"
  echo "Fast-forward ${name} → ${dest}"
  if ! git -C "$dest" pull --ff-only; then
    echo "failed: ${name}" >&2
    failed=1
  fi
}

is_checkout() {
  [[ -d "${1}/.git" || -f "${1}/.git" ]]
}

bump workspace "$ROOT"

if is_checkout "${ROOT}/.engineering"; then
  bump engineering "${ROOT}/.engineering"
fi

if [[ -d "${ROOT}/.project" ]]; then
  for dest in "${ROOT}/.project"/*; do
    is_checkout "$dest" || continue
    bump "$(basename "$dest")" "$dest"
  done
fi

exit "$failed"
