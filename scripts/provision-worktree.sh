#!/usr/bin/env bash
# workflow-server — make a git worktree a place the work can be MEASURED.
#
# A fresh feature worktree comes up with no `workflows/` checkout and no `node_modules`, so the
# guards and the test suite cannot run where the edits are. Every measurement then becomes a
# cross-checkout operation against the main copy — which measures the wrong corpus (issue #327 R4,
# promoted from #324 C5). The merge-base delta runner needs the same provisioning for its base tree.
#
# This script is idempotent and does two things:
#   1. adds a `workflows` worktree of the `workflows` branch, and inits `.engineering` when present
#   2. makes `node_modules` resolvable, by symlinking the main checkout's install
#
#   scripts/provision-worktree.sh              # provision the worktree this script lives in
#   scripts/provision-worktree.sh <path>       # provision another worktree
#   npm run worktree:provision
#
# Needs: git, and an installed main checkout (for the node_modules link).
set -euo pipefail

TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  TARGET="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi
if [[ ! -d "$TARGET" ]]; then
  echo "provision-worktree: '$TARGET' is not a directory" >&2
  exit 2
fi
TARGET="$(cd "$TARGET" && pwd)"

if ! git -C "$TARGET" rev-parse --git-dir >/dev/null 2>&1; then
  echo "provision-worktree: '$TARGET' is not a git checkout" >&2
  exit 2
fi

echo "provisioning $TARGET"

# --- 1. workflows worktree ---------------------------------------------------------------------
# The corpus is a checkout of the `workflows` branch, not an object this tree stores. Guards and
# live-corpus tests read `./workflows` (or `WORKFLOWS_DIR`). `.engineering` holds planning artifacts
# and is optional — a missing remote for it must not fail provisioning.
add_workflows_worktree() {
  git -C "$TARGET" fetch origin workflows --quiet 2>/dev/null || true
  if git -C "$TARGET" worktree add "$TARGET/workflows" workflows; then
    return 0
  fi
  echo "  workflows      FAILED — run 'git worktree add ./workflows workflows'" >&2
  return 1
}

if [[ -d "$TARGET/workflows/.git" || -f "$TARGET/workflows/.git" ]]; then
  corpus_sha="$(git -C "$TARGET/workflows" rev-parse --short HEAD 2>/dev/null || echo unknown)"
  echo "  workflows      worktree @ ${corpus_sha}"
elif [[ -d "$TARGET/workflows" ]] && [[ -z "$(ls -A "$TARGET/workflows" 2>/dev/null)" ]]; then
  rmdir "$TARGET/workflows"
  add_workflows_worktree || exit 1
  echo "  workflows      worktree @ $(git -C "$TARGET/workflows" rev-parse --short HEAD 2>/dev/null || echo unknown)"
elif [[ ! -e "$TARGET/workflows" ]]; then
  add_workflows_worktree || exit 1
  echo "  workflows      worktree @ $(git -C "$TARGET/workflows" rev-parse --short HEAD 2>/dev/null || echo unknown)"
else
  echo "  workflows      present but not a git checkout — the guards cannot measure this worktree" >&2
  exit 1
fi

if [[ -f "$TARGET/.gitmodules" ]] && git -C "$TARGET" config --file .gitmodules --get submodule..engineering.path >/dev/null 2>&1; then
  if git -C "$TARGET" submodule update --init .engineering >/dev/null 2>&1; then
    echo "  .engineering   @ $(git -C "$TARGET/.engineering" rev-parse --short HEAD 2>/dev/null || echo unknown)"
  else
    echo "  .engineering   skipped (not reachable — planning artifacts only)"
  fi
fi

# --- 2. node_modules ---------------------------------------------------------------------------
# Node resolves `node_modules` by walking up the directory tree, so a worktree nested under the main
# checkout (`<repo>/.worktrees/<name>`) already resolves. A worktree elsewhere does not, and `npx`
# then reaches for the registry and dies with EAI_AGAIN — which reads as a sandbox fault rather than
# "no install here". A symlink removes that whole class of confusion.
# The test is resolvability, not the presence of a `node_modules` directory: vitest leaves a bare
# `node_modules/.vite` cache behind, and an empty directory would otherwise read as provisioned.
tsx_resolves() {
  (cd "$1" && node -e 'require.resolve("tsx/cli")') >/dev/null 2>&1
}

if tsx_resolves "$TARGET"; then
  echo "  node_modules   resolvable"
else
  main_root="$(git -C "$TARGET" rev-parse --path-format=absolute --git-common-dir)"
  main_root="$(cd "$(dirname "$main_root")" && pwd)"
  if [[ -d "$main_root/node_modules" && ! -e "$TARGET/node_modules" ]]; then
    ln -s "$main_root/node_modules" "$TARGET/node_modules"
    echo "  node_modules   linked -> $main_root/node_modules"
  else
    echo "  node_modules   NOT resolvable — run 'npm ci' in $main_root" >&2
    exit 1
  fi
fi

echo "provisioned — 'npm run check:all' and 'npm test' now measure this worktree"
