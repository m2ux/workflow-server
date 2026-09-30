#!/usr/bin/env bash
# Open a pull request for this fork's commits against the upstream workspace branch.
#
# Run from the checkout folder:
#   ./scripts/submit-upstream.sh
#
# origin is this fork. upstream is the template remote fork-workspace.sh keeps.
# The pull request base is branch workspace on upstream. The head is branch
# submit/<current>: the current branch's commits replayed onto upstream
# workspace without the paths .gitattributes marks upstream-exclude. Commits
# that touch only those paths drop out. The head goes to origin when GitHub
# records origin as a fork of upstream, and to upstream otherwise. GitHub
# opens a cross-repository pull request only from a repository in the base
# repository's fork network.
set -euo pipefail

UPSTREAM_BRANCH="workspace"
EXCLUDE_ATTR="upstream-exclude"

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
  die "usage: submit-upstream.sh"
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
base="upstream/${UPSTREAM_BRANCH}"
submit="submit/${current}"

excludes=()
while IFS= read -r path; do
  excludes+=(":(exclude,literal)${path}")
done < <(git -C "$ROOT" log --no-merges --no-renames --format= --name-only "${base}..HEAD" \
  | sort -u \
  | git -C "$ROOT" check-attr --stdin "$EXCLUDE_ATTR" \
  | sed -n "s/: ${EXCLUDE_ATTR}: set\$//p")

work="$(mktemp -d)"
patches="$(mktemp)"
cleanup() {
  git -C "$ROOT" worktree remove --force "$work" >/dev/null 2>&1 || rm -rf "$work"
  rm -f "$patches"
}
trap cleanup EXIT

git -C "$ROOT" format-patch --no-renames --stdout "${base}..HEAD" -- . "${excludes[@]}" >"$patches"
if [[ ! -s "$patches" ]]; then
  echo "No changes on ${current} beyond ${base} outside ${EXCLUDE_ATTR} paths."
  exit 0
fi

echo "Building ${submit} from ${base}"
git -C "$ROOT" worktree add --quiet --detach "$work" "$base"
git -C "$work" am --quiet --3way --committer-date-is-author-date "$patches" \
  || die "commits on ${current} do not apply to ${base} without ${EXCLUDE_ATTR} paths; merge ${base} first"
ahead="$(git -C "$work" rev-list --count "${base}..HEAD")"

upstream_slug="$(github_slug "$(git -C "$ROOT" remote get-url upstream)")"
origin_slug="$(github_slug "$(git -C "$ROOT" remote get-url origin)")"
origin_parent="$(gh api --jq '.parent.full_name // ""' "repos/${origin_slug}")"
if [[ "$origin_parent" == "$upstream_slug" ]]; then
  push_remote="origin"
  head_owner="${origin_slug%%/*}"
  head="${head_owner}:${submit}"
else
  push_remote="upstream"
  head_owner="${upstream_slug%%/*}"
  head="$submit"
fi

echo "Pushing ${submit} → ${push_remote}"
git -C "$work" push --force "$push_remote" "HEAD:refs/heads/${submit}"

existing="$(gh api --method GET --jq '.[0].html_url // ""' \
  "repos/${upstream_slug}/pulls" \
  -f "head=${head_owner}:${submit}" \
  -f "base=${UPSTREAM_BRANCH}" \
  -f state=open)"
if [[ -n "$existing" ]]; then
  echo "Pull request already open: ${existing}"
  exit 0
fi

title="$(git -C "$work" log -1 --format='%s' "${base}..HEAD")"
if [[ "$ahead" -gt 1 ]]; then
  title="Update the workspace branch from ${current}."
fi
body="$(git -C "$work" log --reverse --format='- %s' "${base}..HEAD")"

echo "Opening pull request ${head} → ${upstream_slug}:${UPSTREAM_BRANCH}"
url="$(gh api --method POST --jq .html_url \
  "repos/${upstream_slug}/pulls" \
  -f "title=${title}" \
  -f "head=${head}" \
  -f "base=${UPSTREAM_BRANCH}" \
  -f "body=${body}")"
echo "Pull request: ${url}"
