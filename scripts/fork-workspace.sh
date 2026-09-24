#!/usr/bin/env bash
# Create a fork of this checkout at <repo>.
#
# Run from the checkout folder:
#   ./scripts/fork-workspace.sh <repo> [branch]
#
# <repo> is owner/name or a git URL. [branch] is the branch on the fork.
# It defaults to workspace. The template remote becomes upstream.
set -euo pipefail

DEFAULT_BRANCH="workspace"

die() {
  echo "error: $*" >&2
  exit 1
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  die "usage: fork-workspace.sh <repo> [branch]"
fi

REPO="$1"
BRANCH="${2:-$DEFAULT_BRANCH}"

if [[ "$REPO" != *@* && "$REPO" != *://* && "$REPO" != /* ]]; then
  [[ "$REPO" =~ ^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]] \
    || die "repo must be owner/name or a git URL: ${REPO}"
  REPO="git@github.com:${REPO}.git"
fi
[[ "$BRANCH" =~ ^[A-Za-z0-9._-]+$ ]] \
  || die "branch must be alphanumeric/._-: ${BRANCH}"

ROOT="$(pwd)"
top="$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null)" \
  || die "run from the checkout folder"
[[ "$top" == "$ROOT" ]] || die "run from the checkout folder: ${top}"
git -C "$ROOT" show-ref --verify --quiet refs/heads/workspace \
  || die "local branch workspace is absent"

if git -C "$ROOT" remote get-url upstream >/dev/null 2>&1; then
  :
elif git -C "$ROOT" remote get-url origin >/dev/null 2>&1; then
  git -C "$ROOT" remote rename origin upstream
  echo "Renamed origin → upstream"
fi

if git -C "$ROOT" remote get-url origin >/dev/null 2>&1; then
  current="$(git -C "$ROOT" remote get-url origin)"
  [[ "$current" == "$REPO" ]] || die "origin is ${current}, not ${REPO}"
else
  git -C "$ROOT" remote add origin "$REPO"
  echo "Added origin → ${REPO}"
fi

echo "Creating fork ${BRANCH} → ${REPO}"
git -C "$ROOT" push -u origin "refs/heads/workspace:refs/heads/${BRANCH}"
