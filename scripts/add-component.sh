#!/usr/bin/env bash
# Add a component worktree under .project/.
#
#   scripts/add-component.sh <repo> <branch> [name]
#
# <repo> is owner/name or a git URL. The worktree at .project/<name> is the
# local checkout of <branch>. <name> defaults to <branch>. The project
# folder in cursor.code-workspace shows it.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

die() {
  echo "error: $*" >&2
  exit 1
}

if [[ $# -lt 2 || $# -gt 3 ]]; then
  die "usage: add-component.sh <repo> <branch> [name]"
fi

REPO="$1"
BRANCH="$2"
NAME="${3:-$BRANCH}"

[[ "$NAME" != */* && "$NAME" != "." && "$NAME" != ".." ]] \
  || die "name must be a single path segment: ${NAME}"

DEST="${ROOT}/.project/${NAME}"
if [[ -e "$DEST" ]]; then
  die "component path already exists: ${DEST}"
fi

if [[ "$REPO" != *@* && "$REPO" != *://* && "$REPO" != /* ]]; then
  [[ "$REPO" =~ ^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]] \
    || die "repo must be owner/name or a git URL: ${REPO}"
  REPO="git@github.com:${REPO}.git"
fi

mkdir -p "${ROOT}/.project"
echo "Adding worktree ${BRANCH} → ${DEST}"
git clone -b "$BRANCH" "$REPO" "$DEST" \
  || die "failed to clone ${BRANCH}"
