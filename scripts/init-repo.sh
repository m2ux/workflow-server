#!/usr/bin/env bash
# workflow-server — initialize a managed repo under the install root
#
# Accepts a full GitHub-style path (owner/repo), creates engineering + workspace
# directories, and checks out the repo's engineering branch.
#
#   ~/.local/share/workflow-server/init-repo.sh m2ux/workflow-server
#   ./scripts/init-repo.sh m2ux/workflow-server
#   ./scripts/init-repo.sh --url=git@github.com:acme/app.git acme/app
#
# Layout (default root = $XDG_DATA_HOME/workflow-server or ~/.local/share/workflow-server):
#
#   $ROOT/
#     engineering/<owner>/<repo>/    # checkout of the engineering branch
#     workspace/<owner>/<repo>/      # host root for feature worktrees
#
# Needs: git
set -euo pipefail

DEFAULT_ROOT="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_BRANCH="engineering"
DEFAULT_HOST="github.com"

ROOT="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_ROOT}"
BRANCH="${WORKFLOW_SERVER_ENGINEERING_BRANCH:-$DEFAULT_BRANCH}"
REPO_URL=""
REPO_PATH=""
FORCE=0
FETCH=1

usage() {
  cat <<EOF
Initialize engineering + workspace paths for a repo under the workflow-server install root.

USAGE
  $(basename "$0") [options] <owner/repo>

ARGUMENTS
  owner/repo             Full repo path, e.g. m2ux/workflow-server
                         (also accepts https://github.com/owner/repo[.git])

OPTIONS
  --root=PATH            Install root (default: ${DEFAULT_ROOT})
  --url=URL              Git remote URL (default: https://github.com/<owner/repo>.git)
  --branch=NAME          Engineering branch name (default: ${DEFAULT_BRANCH})
  --no-fetch             Skip fetch when checkout already exists
  --force                Recreate engineering checkout if path exists but is invalid
  -h, --help

LAYOUT
  \$ROOT/engineering/<owner>/<repo>/
  \$ROOT/workspace/<owner>/<repo>/
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

need() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

abs_path() {
  local p="$1"
  [[ "$p" == ~* ]] && p="${p/#\~/$HOME}"
  if command -v realpath >/dev/null 2>&1; then
    realpath -m "$p"
  else
    (cd "$(dirname "$p")" 2>/dev/null && echo "$(pwd)/$(basename "$p")") || echo "$p"
  fi
}

# Normalize input to owner/repo. Accepts:
#   m2ux/workflow-server
#   https://github.com/m2ux/workflow-server
#   https://github.com/m2ux/workflow-server.git
#   git@github.com:m2ux/workflow-server.git
normalize_repo_path() {
  local raw="$1"
  raw="${raw%.git}"
  raw="${raw%/}"

  if [[ "$raw" =~ ^https?://[^/]+/([^/]+)/([^/]+)$ ]]; then
    printf '%s/%s\n' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
    return 0
  fi
  if [[ "$raw" =~ ^git@[^:]+:([^/]+)/([^/]+)$ ]]; then
    printf '%s/%s\n' "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"
    return 0
  fi
  if [[ "$raw" =~ ^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]]; then
    printf '%s\n' "$raw"
    return 0
  fi
  return 1
}

default_url_for_repo() {
  local path="$1"
  printf 'https://%s/%s.git\n' "$DEFAULT_HOST" "$path"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --root=*)
      ROOT="${1#*=}"
      shift
      ;;
    --root)
      ROOT="${2:?}"
      shift 2
      ;;
    --url=*)
      REPO_URL="${1#*=}"
      shift
      ;;
    --url)
      REPO_URL="${2:?}"
      shift 2
      ;;
    --branch=*)
      BRANCH="${1#*=}"
      shift
      ;;
    --branch)
      BRANCH="${2:?}"
      shift 2
      ;;
    --no-fetch)
      FETCH=0
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    -*)
      die "unknown option: $1 (see --help)"
      ;;
    *)
      if [[ -n "$REPO_PATH" ]]; then
        die "unexpected argument: $1"
      fi
      REPO_PATH="$1"
      shift
      ;;
  esac
done

[[ -n "$REPO_PATH" ]] || die "missing <owner/repo> (see --help)"

need git

if ! REPO_PATH="$(normalize_repo_path "$REPO_PATH")"; then
  die "invalid repo path '${REPO_PATH}' — expected owner/repo (e.g. m2ux/workflow-server)"
fi

OWNER="${REPO_PATH%%/*}"
NAME="${REPO_PATH#*/}"
[[ "$OWNER" != "$NAME" && -n "$OWNER" && -n "$NAME" ]] \
  || die "invalid repo path '${REPO_PATH}'"

if [[ -z "$REPO_URL" ]]; then
  REPO_URL="$(default_url_for_repo "$REPO_PATH")"
fi

ROOT="$(abs_path "$ROOT")"
ENG_DIR="${ROOT}/engineering/${OWNER}/${NAME}"
WS_DIR="${ROOT}/workspace/${OWNER}/${NAME}"

echo "Repo        : ${REPO_PATH}"
echo "URL         : ${REPO_URL}"
echo "Branch      : ${BRANCH}"
echo "Root        : ${ROOT}"
echo "Engineering : ${ENG_DIR}"
echo "Workspace   : ${WS_DIR}"
echo

mkdir -p "${ROOT}/engineering/${OWNER}" \
  "${ROOT}/workspace/${OWNER}"

# engineering checkout
eng_ok=0
if [[ -d "${ENG_DIR}/.git" ]] || [[ -f "${ENG_DIR}/.git" ]]; then
  if git -C "${ENG_DIR}" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    eng_ok=1
  fi
fi

if [[ "${eng_ok}" -eq 1 && "${FORCE}" -eq 0 ]]; then
  echo "Engineering checkout already present"
  if [[ "${FETCH}" -eq 1 ]]; then
    echo "Updating engineering checkout → ${ENG_DIR}"
    git -C "${ENG_DIR}" remote set-url origin "${REPO_URL}" 2>/dev/null \
      || git -C "${ENG_DIR}" remote add origin "${REPO_URL}"
    git -C "${ENG_DIR}" fetch --prune origin
    git -C "${ENG_DIR}" checkout "${BRANCH}"
    git -C "${ENG_DIR}" pull --ff-only origin "${BRANCH}" \
      || git -C "${ENG_DIR}" reset --hard "origin/${BRANCH}"
  fi
else
  if [[ -e "${ENG_DIR}" ]]; then
    if [[ "${FORCE}" -eq 1 ]]; then
      echo "Removing existing path ( --force ) → ${ENG_DIR}"
      rm -rf "${ENG_DIR}"
    else
      die "path exists but is not a git checkout: ${ENG_DIR} (use --force)"
    fi
  fi
  echo "Cloning ${BRANCH} → ${ENG_DIR}"
  if ! git clone --branch "${BRANCH}" --single-branch "${REPO_URL}" "${ENG_DIR}"; then
    die "branch '${BRANCH}' not found on ${REPO_URL}
hint: create it with scripts/deploy.sh --orphan in that repo, then re-run init-repo.sh"
  fi
fi

if [[ -f "${ENG_DIR}/.gitmodules" ]]; then
  echo "Initializing engineering submodules → ${ENG_DIR}"
  git -C "${ENG_DIR}" submodule update --init --recursive || \
    echo "warning: submodule init incomplete (check access to nested remotes)" >&2
fi

# workspace root
if [[ ! -d "${WS_DIR}" ]]; then
  echo "Creating workspace root → ${WS_DIR}"
  mkdir -p "${WS_DIR}"
else
  echo "Workspace root already present"
fi

echo
echo "Init complete."
echo "  Repo path    : ${REPO_PATH}"
echo "  Engineering  : ${ENG_DIR}"
echo "  Workspace    : ${WS_DIR}"
