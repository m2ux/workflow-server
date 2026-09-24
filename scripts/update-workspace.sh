#!/usr/bin/env bash
# Merge the template branch workspace from the upstream remote into this checkout.
#
# Run from the checkout folder:
#   ./scripts/update-workspace.sh
#
# upstream is the remote fork-workspace.sh keeps for the template.
set -euo pipefail

UPSTREAM_BRANCH="workspace"

die() {
  echo "error: $*" >&2
  exit 1
}

if [[ $# -ne 0 ]]; then
  die "usage: update-workspace.sh"
fi

ROOT="$(pwd)"
top="$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null)" \
  || die "run from the checkout folder"
[[ "$top" == "$ROOT" ]] || die "run from the checkout folder: ${top}"
current="$(git -C "$ROOT" rev-parse --abbrev-ref HEAD)"
[[ "$current" != "HEAD" ]] || die "checkout is detached"
git -C "$ROOT" remote get-url upstream >/dev/null 2>&1 \
  || die "upstream remote is absent"

echo "Fetching upstream ${UPSTREAM_BRANCH}"
git -C "$ROOT" fetch upstream "$UPSTREAM_BRANCH"
echo "Merging upstream/${UPSTREAM_BRANCH} → ${current}"
git -C "$ROOT" merge --no-edit "upstream/${UPSTREAM_BRANCH}"
