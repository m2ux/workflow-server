#!/usr/bin/env bash
# Fast-forward each component worktree under .project/ to its upstream tip.
#
# Feature worktrees under .worktrees/ stay where they are.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
failed=0
found=0

if [[ -d "${ROOT}/.project" ]]; then
  for dest in "${ROOT}/.project"/*; do
    [[ -e "$dest" ]] || continue
    if [[ ! -d "${dest}/.git" && ! -f "${dest}/.git" ]]; then
      continue
    fi
    found=1
    name="$(basename "$dest")"
    echo "Fast-forward ${name} → ${dest}"
    if ! git -C "$dest" pull --ff-only; then
      echo "failed: ${name}" >&2
      failed=1
    fi
  done
fi

if [[ "$found" -eq 0 ]]; then
  echo "no component worktrees under ${ROOT}/.project" >&2
  exit 1
fi

exit "$failed"
