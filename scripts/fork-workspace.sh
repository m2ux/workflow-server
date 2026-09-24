#!/usr/bin/env bash
# Create a fork of this checkout at <repo>.
#
# Run from the checkout folder:
#   ./scripts/fork-workspace.sh <repo>
#
# <repo> is owner/name or a git URL. The branch is the checkout directory
# name, the name given to deploy-workspace. The local branch takes that
# name, then the commits are pushed there. The template remote becomes
# upstream. cursor.code-workspace stays as it is.
set -euo pipefail

die() {
  echo "error: $*" >&2
  exit 1
}

if [[ $# -ne 1 ]]; then
  die "usage: fork-workspace.sh <repo>"
fi

REPO="$1"

if [[ "$REPO" != *@* && "$REPO" != *://* && "$REPO" != /* ]]; then
  [[ "$REPO" =~ ^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]] \
    || die "repo must be owner/name or a git URL: ${REPO}"
  REPO="git@github.com:${REPO}.git"
fi

ROOT="$(pwd)"
top="$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null)" \
  || die "run from the checkout folder"
[[ "$top" == "$ROOT" ]] || die "run from the checkout folder: ${top}"
current="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)"
[[ "$current" != "HEAD" ]] || die "checkout is detached"
BRANCH="$(basename "$ROOT")"
[[ "$BRANCH" =~ ^[A-Za-z0-9._-]+$ ]] \
  || die "workspace name must be alphanumeric/._-: ${BRANCH}"

if git -C "$ROOT" remote get-url upstream >/dev/null 2>&1; then
  :
elif git -C "$ROOT" remote get-url origin >/dev/null 2>&1; then
  git -C "$ROOT" remote rename origin upstream
  echo "Renamed origin → upstream"
fi

if git -C "$ROOT" remote get-url origin >/dev/null 2>&1; then
  origin_url="$(git -C "$ROOT" remote get-url origin)"
  [[ "$origin_url" == "$REPO" ]] || die "origin is ${origin_url}, not ${REPO}"
else
  git -C "$ROOT" remote add origin "$REPO"
  echo "Added origin → ${REPO}"
fi

if [[ "$current" != "$BRANCH" ]]; then
  git -C "$ROOT" show-ref --verify --quiet "refs/heads/${BRANCH}" \
    && die "local branch ${BRANCH} already exists"
  git -C "$ROOT" branch -m "$current" "$BRANCH"
  echo "Renamed ${current} → ${BRANCH}"
fi

echo "Creating fork ${BRANCH} → ${REPO}"
git -C "$ROOT" push -u origin "$BRANCH"
