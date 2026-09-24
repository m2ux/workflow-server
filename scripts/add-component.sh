#!/usr/bin/env bash
# Add a component worktree under .project/ and a folder in the code-workspace file.
#
#   scripts/add-component.sh <repo-path> <branch> <name> [display-name]
#
# <repo-path> is a checkout of the repository that owns <branch>.
# <name> is the directory under .project/. The display name defaults to <name>.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

die() {
  echo "error: $*" >&2
  exit 1
}

if [[ $# -lt 3 || $# -gt 4 ]]; then
  die "usage: add-component.sh <repo-path> <branch> <name> [display-name]"
fi

REPO="$(cd "$1" && pwd)" || die "repo path is not a directory: $1"
BRANCH="$2"
NAME="$3"
DISPLAY="${4:-$NAME}"

[[ "$NAME" != */* && "$NAME" != "." && "$NAME" != ".." ]] \
  || die "name must be a single path segment: ${NAME}"
git -C "$REPO" rev-parse --is-inside-work-tree >/dev/null 2>&1 \
  || die "not a git checkout: ${REPO}"

DEST="${ROOT}/.project/${NAME}"
if [[ -e "$DEST" ]]; then
  die "component path already exists: ${DEST}"
fi

mkdir -p "${ROOT}/.project"
echo "Adding worktree ${BRANCH} → ${DEST}"
git -C "$REPO" worktree add "$DEST" "$BRANCH" \
  || die "failed to add worktree ${BRANCH}"

mapfile -t WORKSPACE_FILES < <(find "$ROOT" -maxdepth 1 -name '*.code-workspace' -print)
[[ ${#WORKSPACE_FILES[@]} -eq 1 ]] \
  || die "expected one *.code-workspace in ${ROOT}"
WORKSPACE_FILE="${WORKSPACE_FILES[0]}"

ROOT_DIR="$ROOT" WORKSPACE_FILE="$WORKSPACE_FILE" COMPONENT_NAME="$NAME" DISPLAY_NAME="$DISPLAY" python3 - <<'PY'
import json, os

path = os.environ["WORKSPACE_FILE"]
name = os.environ["DISPLAY_NAME"]
folder = "./.project/" + os.environ["COMPONENT_NAME"]
with open(path, encoding="utf-8") as fh:
    doc = json.load(fh)
folders = doc.setdefault("folders", [])
if any(item.get("path") == folder for item in folders):
    raise SystemExit(f"workspace already lists {folder}")
folders.append({"name": name, "path": folder})
with open(path, "w", encoding="utf-8") as fh:
    json.dump(doc, fh, indent="\t", ensure_ascii=False)
    fh.write("\n")
print(f"Workspace folder {name} → {folder}")
PY
