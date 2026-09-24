#!/usr/bin/env bash
# Open a pull request for a feature worktree against its component branch.
#
# Run from the checkout folder:
#   ./scripts/raise-pr.sh <slug> [--body=TEXT]
#
# <slug> is the directory name under .worktrees/. The component is the
# checkout under .project/ that owns that worktree. The pull request base
# is the branch checked out there. The head is the worktree branch, pushed
# to that component's origin. Without --body, the body is the commit list
# from the git log.
#
# When <slug> is the directory name of a checkout under .project/, changes
# in that checkout are moved to .worktrees/<slug>-<datetime> first. The
# checkout returns to its upstream branch. The new branch carries the same
# datetime tag.
set -euo pipefail

die() {
  echo "error: $*" >&2
  exit 1
}

github_slug() {
  local url="$1"
  url="${url%.git}"
  url="${url%/}"
  case "$url" in
    git@github.com:*) echo "${url#git@github.com:}" ;;
    ssh://git@github.com/*) echo "${url#ssh://git@github.com/}" ;;
    https://github.com/*) echo "${url#https://github.com/}" ;;
    http://github.com/*) echo "${url#http://github.com/}" ;;
    *) die "remote is not a GitHub repository: ${1}" ;;
  esac
}

abs_git_common() {
  local dir="$1"
  local common
  common="$(git -C "$dir" rev-parse --git-common-dir 2>/dev/null)" || return 1
  (cd "$dir" && cd "$common" && pwd -P)
}

SLUG=""
BODY=""
BODY_SET=0
for arg in "$@"; do
  case "$arg" in
    --body=*) BODY="${arg#--body=}"; BODY_SET=1 ;;
    *)
      [[ -z "$SLUG" ]] || die "usage: raise-pr.sh <slug> [--body=TEXT]"
      SLUG="$arg"
      ;;
  esac
done
[[ -n "$SLUG" ]] || die "usage: raise-pr.sh <slug> [--body=TEXT]"
[[ "$SLUG" != */* && "$SLUG" != "." && "$SLUG" != ".." ]] \
  || die "slug must be a single path segment: ${SLUG}"

ROOT="$(pwd)"
top="$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null)" \
  || die "run from the checkout folder"
[[ "$top" == "$ROOT" ]] || die "run from the checkout folder: ${top}"

WT="${ROOT}/.worktrees/${SLUG}"
COMPONENT_DIR="${ROOT}/.project/${SLUG}"
if abs_git_common "$COMPONENT_DIR" >/dev/null; then
  stamp="$(date +%Y%m%d-%H%M%S)"
  feature="${SLUG}-${stamp}"
  WT="${ROOT}/.worktrees/${feature}"
  git -C "$COMPONENT_DIR" remote get-url origin >/dev/null 2>&1 \
    || die "component origin is absent: ${COMPONENT_DIR}"
  current="$(git -C "$COMPONENT_DIR" rev-parse --abbrev-ref HEAD)"
  [[ "$current" != "HEAD" ]] || die "component checkout is detached: ${COMPONENT_DIR}"
  echo "Fetching origin for ${SLUG}"
  git -C "$COMPONENT_DIR" fetch origin
  if git -C "$COMPONENT_DIR" rev-parse --abbrev-ref '@{upstream}' >/dev/null 2>&1; then
    upstream_ref="$(git -C "$COMPONENT_DIR" rev-parse --abbrev-ref '@{upstream}')"
    restore="${upstream_ref#origin/}"
  else
    restore="$(git -C "$COMPONENT_DIR" symbolic-ref --short refs/remotes/origin/HEAD)"
    restore="${restore#origin/}"
  fi
  [[ -n "$restore" ]] || die "component has no upstream branch: ${COMPONENT_DIR}"
  if [[ "$current" == "$restore" ]]; then
    ahead="$(git -C "$COMPONENT_DIR" rev-list --count "origin/${restore}..HEAD")"
    [[ "$ahead" -gt 0 || -n "$(git -C "$COMPONENT_DIR" status --porcelain)" ]] \
      || die "no changes in ${COMPONENT_DIR}"
    git -C "$COMPONENT_DIR" branch "$feature" HEAD
  else
    feature="$current"
  fi
  stashed=0
  if [[ -n "$(git -C "$COMPONENT_DIR" status --porcelain)" ]]; then
    git -C "$COMPONENT_DIR" stash push --include-untracked -m "raise-pr ${SLUG}"
    stashed=1
  fi
  if [[ "$current" == "$restore" ]]; then
    git -C "$COMPONENT_DIR" reset --hard "origin/${restore}"
  elif git -C "$COMPONENT_DIR" show-ref --verify --quiet "refs/heads/${restore}"; then
    git -C "$COMPONENT_DIR" switch "$restore"
    git -C "$COMPONENT_DIR" reset --hard "origin/${restore}"
  else
    git -C "$COMPONENT_DIR" switch --track "origin/${restore}"
    git -C "$COMPONENT_DIR" reset --hard "origin/${restore}"
  fi
  mkdir -p "${ROOT}/.worktrees"
  echo "Creating worktree ${WT} on ${feature}"
  git -C "$COMPONENT_DIR" worktree add "$WT" "$feature"
  if [[ "$stashed" -eq 1 ]]; then
    git -C "$WT" stash pop
  fi
fi
[[ -d "$WT" ]] || die "worktree is absent: ${WT}"
wt_common="$(abs_git_common "$WT")" || die "worktree is not a git checkout: ${WT}"

component=""
for dir in "${ROOT}/.project"/*; do
  [[ -d "$dir" ]] || continue
  common="$(abs_git_common "$dir")" || continue
  if [[ "$common" == "$wt_common" ]]; then
    [[ -z "$component" ]] || die "several components own ${WT}"
    component="$dir"
  fi
done
[[ -n "$component" ]] || die "no component under .project owns ${WT}"

base="$(git -C "$component" rev-parse --abbrev-ref HEAD)"
[[ "$base" != "HEAD" ]] || die "component checkout is detached: ${component}"
head_branch="$(git -C "$WT" rev-parse --abbrev-ref HEAD)"
[[ "$head_branch" != "HEAD" ]] || die "worktree is detached: ${WT}"
[[ "$head_branch" != "$base" ]] || die "worktree branch is the component branch: ${base}"
git -C "$component" remote get-url origin >/dev/null 2>&1 \
  || die "component origin is absent: ${component}"
[[ -z "$(git -C "$WT" status --porcelain)" ]] \
  || die "commit worktree changes before opening a pull request"

echo "Fetching origin ${base}"
git -C "$WT" fetch origin "$base"
ahead="$(git -C "$WT" rev-list --count "origin/${base}..HEAD")"
if [[ "$ahead" -eq 0 ]]; then
  echo "No commits on ${head_branch} beyond origin/${base}."
  exit 0
fi

echo "Pushing ${head_branch} → origin"
git -C "$WT" push -u origin "$head_branch"

origin_slug="$(github_slug "$(git -C "$component" remote get-url origin)")"
origin_owner="${origin_slug%%/*}"

existing="$(gh api --method GET --jq '.[0].html_url // ""' \
  "repos/${origin_slug}/pulls" \
  -f "head=${origin_owner}:${head_branch}" \
  -f "base=${base}" \
  -f state=open)"
if [[ -n "$existing" ]]; then
  echo "Pull request already open: ${existing}"
  exit 0
fi

title="$(git -C "$WT" log -1 --format='%s' "origin/${base}..HEAD")"
if [[ "$ahead" -gt 1 ]]; then
  title="Raise ${SLUG} against ${base}."
fi
if [[ "$BODY_SET" -eq 0 ]]; then
  BODY="$(git -C "$WT" log --reverse --format='- %s' "origin/${base}..HEAD")"
fi

echo "Opening pull request ${head_branch} → ${origin_slug}:${base}"
url="$(gh api --method POST --jq .html_url \
  "repos/${origin_slug}/pulls" \
  -f "title=${title}" \
  -f "head=${head_branch}" \
  -f "base=${base}" \
  -f "body=${BODY}")"
echo "Pull request: ${url}"
