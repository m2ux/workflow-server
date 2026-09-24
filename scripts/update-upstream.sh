#!/usr/bin/env bash
# Open a pull request for this fork's commits against the upstream workspace branch.
#
# Run from the checkout folder:
#   ./scripts/update-upstream.sh
#
# origin is this fork. upstream is the template remote fork-workspace.sh keeps.
# The pull request base is branch workspace on upstream. The head is the
# current branch on origin.
set -euo pipefail

UPSTREAM_BRANCH="workspace"

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

if [[ $# -ne 0 ]]; then
  die "usage: update-upstream.sh"
fi

ROOT="$(pwd)"
top="$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null)" \
  || die "run from the checkout folder"
[[ "$top" == "$ROOT" ]] || die "run from the checkout folder: ${top}"
current="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)"
[[ "$current" != "HEAD" ]] || die "checkout is detached"
git -C "$ROOT" remote get-url upstream >/dev/null 2>&1 \
  || die "upstream remote is absent"
git -C "$ROOT" remote get-url origin >/dev/null 2>&1 \
  || die "origin remote is absent"
[[ -z "$(git -C "$ROOT" status --porcelain)" ]] \
  || die "commit checkout changes before opening a pull request"

echo "Fetching upstream ${UPSTREAM_BRANCH}"
git -C "$ROOT" fetch upstream "$UPSTREAM_BRANCH"
ahead="$(git -C "$ROOT" rev-list --count "upstream/${UPSTREAM_BRANCH}..HEAD")"
if [[ "$ahead" -eq 0 ]]; then
  echo "No commits on ${current} beyond upstream/${UPSTREAM_BRANCH}."
  exit 0
fi

echo "Pushing ${current} → origin"
git -C "$ROOT" push -u origin "$current"

upstream_slug="$(github_slug "$(git -C "$ROOT" remote get-url upstream)")"
origin_slug="$(github_slug "$(git -C "$ROOT" remote get-url origin)")"
upstream_owner="${upstream_slug%%/*}"
origin_owner="${origin_slug%%/*}"
if [[ "$origin_owner" == "$upstream_owner" && "$origin_slug" == "$upstream_slug" ]]; then
  head="$current"
else
  head="${origin_owner}:${current}"
fi

existing="$(gh api --jq '.[0].html_url // ""' \
  "repos/${upstream_slug}/pulls" \
  -f "head=${head}" \
  -f "base=${UPSTREAM_BRANCH}" \
  -f state=open)"
if [[ -n "$existing" ]]; then
  echo "Pull request already open: ${existing}"
  exit 0
fi

title="$(git -C "$ROOT" log -1 --format='%s' "upstream/${UPSTREAM_BRANCH}..HEAD")"
if [[ "$ahead" -gt 1 ]]; then
  title="Update the workspace branch from ${current}."
fi
body="$(git -C "$ROOT" log --reverse --format='- %s' "upstream/${UPSTREAM_BRANCH}..HEAD")"

echo "Opening pull request ${head} → ${upstream_slug}:${UPSTREAM_BRANCH}"
url="$(gh api --method POST --jq .html_url \
  "repos/${upstream_slug}/pulls" \
  -f "title=${title}" \
  -f "head=${head}" \
  -f "base=${UPSTREAM_BRANCH}" \
  -f "body=${body}")"
echo "Pull request: ${url}"
