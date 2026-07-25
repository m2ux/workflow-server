#!/usr/bin/env bash
# workflow-server — initialize a managed repo under the projects multi-root
#
# Accepts a full GitHub-style path (owner/repo), creates basename checkout:
#   $PROJECTS_ROOT/<repo>/              # app checkout (default branch or --branch)
#   $PROJECTS_ROOT/<repo>/.engineering/ # eng submodule or materialised eng
#   $PROJECTS_ROOT/<repo>/.worktrees/   # parent for feature worktrees (gitignored)
#
# PROJECTS_ROOT defaults to HOST_PROJECTS_ROOT from env, else $ROOT/projects.
# $INSTALL/worktrees/<owner>/<repo> is deprecated and is not created.
#
# Engineering resolution (into <checkout>/.engineering):
#   1. Explicit --engineering-url / --engineering-branch overrides
#   2. App checkout: git submodule update --init -- .engineering
#   3. App remote branch named "engineering" (or --engineering-branch) into .engineering
#   4. App default branch: in-tree .engineering/ directory materialised
#
# Does NOT init other product submodules (e.g. workflows) by default.
#
#   ~/.local/share/workflow-server/init-repo.sh m2ux/workflow-server
#   ./scripts/init-repo.sh --projects-root=~/projects/dev --branch=develop acme/app
#   ./scripts/init-repo.sh --url=git@github.com:acme/app.git acme/app
#
# Needs: git
set -euo pipefail

DEFAULT_ROOT="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_ENG_BRANCH="engineering"
DEFAULT_HOST="github.com"
DEFAULT_ENG_PATH=".engineering"
DEFAULT_WORKTREES_NAME=".worktrees"

ROOT="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_ROOT}"
# Prefer external HOST_PROJECTS_ROOT; fall back to install-colocated projects/.
PROJECTS_ROOT="${HOST_PROJECTS_ROOT:-${WORKFLOW_SERVER_ENGINEERING_DIR:-}}"
# Project checkout branch (empty = remote default: main/master via origin/HEAD).
SOURCE_BRANCH="${WORKFLOW_SERVER_SOURCE_BRANCH:-}"
ENG_BRANCH="${WORKFLOW_SERVER_ENGINEERING_BRANCH:-$DEFAULT_ENG_BRANCH}"
REPO_URL=""
REPO_PATH=""
ENG_URL_OVERRIDE=""
ENG_BRANCH_OVERRIDE=""
FORCE=0
FETCH=1

ENG_SOURCE_URL=""
ENG_SOURCE_BRANCH=""
ENG_SOURCE_MODE=""
ENG_SOURCE_PIN=""

usage() {
  cat <<EOF
Initialize a basename checkout under the projects multi-root (canonical layout).

USAGE
  $(basename "$0") [options] <owner/repo>

ARGUMENTS
  owner/repo             Full repo path, e.g. m2ux/workflow-server
                         (also accepts https://github.com/owner/repo[.git])
                         On disk the checkout is \$PROJECTS_ROOT/<repo>/ only.

OPTIONS
  --root=PATH            Install root (default: ${DEFAULT_ROOT})
  --projects-root=PATH   Projects multi-root (default: \$HOST_PROJECTS_ROOT
                         or \$ROOT/projects)
  --url=URL              App repo git remote (default: https://github.com/<owner/repo>.git)
  --branch=NAME          Branch to check out in \$PROJECTS_ROOT/<repo>
                         (default: remote default branch — usually main)
  --engineering-url=URL  Force engineering remote (skip submodule init)
  --engineering-branch=NAME
                         Engineering branch fallback / override
                         (default: ${DEFAULT_ENG_BRANCH}; also used when
                         .gitmodules has no branch)
  --no-fetch             Skip fetch when checkout already exists
  --force                Recreate paths if invalid / discard dirty trees
  -h, --help

LAYOUT (canonical)
  \$PROJECTS_ROOT/<repo>/                 # app checkout (--branch or default)
  \$PROJECTS_ROOT/<repo>/.engineering/    # planning eng root
  \$PROJECTS_ROOT/<repo>/.worktrees/      # feature worktree parent

RESOLUTION
  Clone the app into \$PROJECTS_ROOT/<repo> on --branch (or remote default), then
  prefer submodule init for .engineering, else clone eng branch
  "${DEFAULT_ENG_BRANCH}", else extract in-tree .engineering/.
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

# Normalize input to owner/repo.
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
  printf 'https://%s/%s.git\n' "$DEFAULT_HOST" "$1"
}

# Resolve a submodule URL that may be relative to the superproject remote.
resolve_submodule_url() {
  local super_url="$1"
  local sub_url="$2"

  case "$sub_url" in
    '') return 1 ;;
    http://*|https://*|git@*|ssh://*|file://*|/*)
      printf '%s\n' "$sub_url"
      return 0
      ;;
  esac

  local base="$super_url"
  base="${base%/}"
  base="${base%.git}"
  if [[ "$base" == git@*:*/* || "$base" == *://*/* ]]; then
    base="${base%/*}"
  else
    printf '%s\n' "$sub_url"
    return 0
  fi

  local rel="$sub_url"
  while [[ "$rel" == ../* ]]; do
    rel="${rel#../}"
    if [[ "$base" == git@*:*/* ]]; then
      base="${base%/*}"
    elif [[ "$base" == *://*/*/* ]]; then
      base="${base%/*}"
    else
      break
    fi
  done
  rel="${rel#./}"

  printf '%s/%s\n' "$base" "$rel"
}

# Look up submodule url/branch for a path via `git config -f .gitmodules`.
# Prints: url<TAB>branch  (branch may be empty). Returns 1 if not found.
read_gitmodules_entry() {
  local gitmodules="$1"
  local want_path="$2"
  [[ -f "$gitmodules" ]] || return 1

  local key path name url branch
  while read -r key path; do
    [[ -n "$key" && -n "$path" ]] || continue
    [[ "$path" == "$want_path" ]] || continue
    name="${key#submodule.}"
    name="${name%.path}"
    url="$(git config -f "$gitmodules" --get "submodule.${name}.url" 2>/dev/null || true)"
    [[ -n "$url" ]] || continue
    branch="$(git config -f "$gitmodules" --get "submodule.${name}.branch" 2>/dev/null || true)"
    printf '%s\t%s\n' "$url" "$branch"
    return 0
  done < <(git config -f "$gitmodules" --get-regexp '^submodule\..*\.path$' 2>/dev/null || true)

  return 1
}

is_git_checkout() {
  local dest="$1"
  { [[ -d "${dest}/.git" ]] || [[ -f "${dest}/.git" ]]; } \
    && git -C "${dest}" rev-parse --is-inside-work-tree >/dev/null 2>&1
}

default_branch_for() {
  local dest="$1"
  local ref
  ref="$(git -C "$dest" symbolic-ref --quiet refs/remotes/origin/HEAD 2>/dev/null || true)"
  if [[ -n "$ref" ]]; then
    printf '%s\n' "${ref#refs/remotes/origin/}"
    return 0
  fi
  if git -C "$dest" show-ref --verify --quiet refs/remotes/origin/main; then
    echo main
    return 0
  fi
  if git -C "$dest" show-ref --verify --quiet refs/remotes/origin/master; then
    echo master
    return 0
  fi
  echo main
}

# Resolve which branch the project checkout should track.
resolve_source_branch() {
  local dest="$1"
  if [[ -n "$SOURCE_BRANCH" ]]; then
    printf '%s\n' "$SOURCE_BRANCH"
    return 0
  fi
  default_branch_for "$dest"
}

# Clone or update the app checkout at PROJECTS_DIR (no bulk submodule init).
# Optional third arg: branch name (empty = remote default).
ensure_source_checkout() {
  local dest="$1"
  local url="$2"
  local want_br="${3:-}"

  if is_git_checkout "$dest" && [[ "${FORCE}" -eq 0 ]]; then
    echo "Project checkout already present → ${dest}"
    if [[ "${FETCH}" -eq 1 ]]; then
      echo "Updating project checkout"
      git -C "${dest}" remote set-url origin "${url}" 2>/dev/null \
        || git -C "${dest}" remote add origin "${url}"
      git -C "${dest}" fetch --prune origin
      local track_br
      if [[ -n "$want_br" ]]; then
        track_br="$want_br"
      else
        track_br="$(resolve_source_branch "$dest")"
      fi
      if ! git -C "${dest}" show-ref --verify --quiet "refs/remotes/origin/${track_br}"; then
        die "branch 'origin/${track_br}' not found in ${dest}
  Check --branch=NAME or that the remote has that branch"
      fi
      if ! git -C "${dest}" diff --quiet || ! git -C "${dest}" diff --cached --quiet; then
        die "local changes in source ${dest}
  Commit/stash them, or re-run with --force"
      fi
      local cur
      cur="$(git -C "${dest}" rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)"
      if [[ "$cur" != "$track_br" ]]; then
        git -C "${dest}" checkout -B "$track_br" "origin/${track_br}" \
          || die "failed to checkout ${track_br} in ${dest}"
      else
        git -C "${dest}" merge --ff-only "origin/${track_br}" \
          || git -C "${dest}" reset --hard "origin/${track_br}"
      fi
    fi
    return 0
  fi

  if [[ -e "${dest}" ]]; then
    if [[ "${FORCE}" -eq 1 ]]; then
      echo "Removing existing path ( --force ) → ${dest}"
      rm -rf "${dest}"
    else
      die "path exists but is not a git checkout: ${dest} (use --force)"
    fi
  fi

  mkdir -p "$(dirname "$dest")"
  if [[ -n "$want_br" ]]; then
    echo "Cloning app source (${want_br}) → ${url} → ${dest}"
    git clone --branch "${want_br}" --single-branch "${url}" "${dest}" \
      || die "failed to clone ${url} branch '${want_br}'"
  else
    echo "Cloning app source → ${url} → ${dest}"
    git clone --single-branch "${url}" "${dest}" \
      || die "failed to clone ${url}"
    local track_br
    track_br="$(resolve_source_branch "$dest")"
    if git -C "${dest}" show-ref --verify --quiet "refs/remotes/origin/${track_br}"; then
      git -C "${dest}" checkout -B "$track_br" "origin/${track_br}" \
        || die "failed to checkout ${track_br} in ${dest}"
    fi
  fi
}

# Try submodule init for .engineering only. Returns 0 on success.
try_init_engineering_submodule() {
  local source_dir="$1"
  local eng_path="$DEFAULT_ENG_PATH"

  [[ -f "${source_dir}/.gitmodules" ]] || return 1
  read_gitmodules_entry "${source_dir}/.gitmodules" "$eng_path" >/dev/null || return 1

  echo "Initializing engineering submodule → ${source_dir}/${eng_path}"
  if git -C "${source_dir}" submodule update --init -- "${eng_path}"; then
    # Prefer tracking branch from .gitmodules when present
    local entry sub_branch
    if entry="$(read_gitmodules_entry "${source_dir}/.gitmodules" "$eng_path")"; then
      sub_branch="${entry#*$'\t'}"
      [[ "$sub_branch" == "$entry" ]] && sub_branch=""
      if [[ -n "$ENG_BRANCH_OVERRIDE" ]]; then
        sub_branch="$ENG_BRANCH_OVERRIDE"
      fi
      if [[ -n "$sub_branch" ]] && is_git_checkout "${source_dir}/${eng_path}"; then
        git -C "${source_dir}/${eng_path}" fetch origin 2>/dev/null || true
        git -C "${source_dir}/${eng_path}" checkout -B "$sub_branch" "origin/${sub_branch}" 2>/dev/null \
          || git -C "${source_dir}/${eng_path}" checkout "$sub_branch" 2>/dev/null \
          || true
      fi
    fi
    ENG_SOURCE_MODE="submodule"
    return 0
  fi
  echo "warning: submodule init for ${eng_path} failed; trying alternate eng resolution" >&2
  return 1
}

remote_has_branch() {
  local url="$1"
  local branch="$2"
  git ls-remote --heads "$url" "refs/heads/${branch}" 2>/dev/null | grep -q .
}

# Decide engineering source when submodule init is unavailable. Sets ENG_SOURCE_*.
resolve_engineering_source_fallback() {
  local app_url="$1"
  local source_dir="$2"
  local fallback_branch="$3"

  ENG_SOURCE_URL=""
  ENG_SOURCE_BRANCH=""
  ENG_SOURCE_MODE=""
  ENG_SOURCE_PIN=""

  if [[ -n "$ENG_URL_OVERRIDE" ]]; then
    ENG_SOURCE_URL="$ENG_URL_OVERRIDE"
    ENG_SOURCE_BRANCH="${ENG_BRANCH_OVERRIDE:-$fallback_branch}"
    ENG_SOURCE_MODE="remote"
    echo "Engineering source (override): ${ENG_SOURCE_URL} @ ${ENG_SOURCE_BRANCH}"
    return 0
  fi

  # Prefer reading .gitmodules from the live project checkout
  local entry sub_url sub_branch
  if entry="$(read_gitmodules_entry "${source_dir}/.gitmodules" "$DEFAULT_ENG_PATH")"; then
    sub_url="${entry%%$'\t'*}"
    sub_branch="${entry#*$'\t'}"
    [[ "$sub_branch" == "$sub_url" ]] && sub_branch=""
    ENG_SOURCE_URL="$(resolve_submodule_url "$app_url" "$sub_url")"
    if [[ -n "$ENG_BRANCH_OVERRIDE" ]]; then
      ENG_SOURCE_BRANCH="$ENG_BRANCH_OVERRIDE"
    elif [[ -n "$sub_branch" ]]; then
      ENG_SOURCE_BRANCH="$sub_branch"
    else
      ENG_SOURCE_BRANCH="$fallback_branch"
    fi
    ENG_SOURCE_MODE="remote"
    echo "Engineering source (gitmodules remote): ${ENG_SOURCE_URL} @ ${ENG_SOURCE_BRANCH}"
    return 0
  fi

  # In-tree .engineering on current source HEAD
  if [[ -d "${source_dir}/${DEFAULT_ENG_PATH}" ]] && ! is_git_checkout "${source_dir}/${DEFAULT_ENG_PATH}"; then
    # Already present as plain tree — treat as ready
    if [[ -d "${source_dir}/${DEFAULT_ENG_PATH}/artifacts" ]] || [[ -f "${source_dir}/${DEFAULT_ENG_PATH}/README.md" ]]; then
      ENG_SOURCE_MODE="intree-present"
      echo "Engineering source (in-tree present at ${source_dir}/${DEFAULT_ENG_PATH})"
      return 0
    fi
  fi

  local try_branch="${ENG_BRANCH_OVERRIDE:-$fallback_branch}"
  if remote_has_branch "$app_url" "$try_branch"; then
    ENG_SOURCE_URL="$app_url"
    ENG_SOURCE_BRANCH="$try_branch"
    ENG_SOURCE_MODE="remote"
    echo "Engineering source (app branch): ${ENG_SOURCE_URL} @ ${ENG_SOURCE_BRANCH}"
    return 0
  fi

  # Last resort: materialise from default branch tree if path exists as tree blob
  if git -C "$source_dir" ls-tree HEAD -- "$DEFAULT_ENG_PATH" 2>/dev/null | grep -q '040000 tree'; then
    ENG_SOURCE_URL="$app_url"
    ENG_SOURCE_BRANCH="$(git -C "$source_dir" rev-parse --abbrev-ref HEAD)"
    ENG_SOURCE_MODE="intree"
    echo "Engineering source (in-tree extract from ${ENG_SOURCE_BRANCH})"
    return 0
  fi

  die "could not resolve engineering content for ${app_url}
hint: expected one of:
  - .engineering submodule on the default branch
  - branch '${try_branch}' on the app remote
  - in-tree .engineering/ on the default branch
create with scripts/deploy.sh in that repo, then re-run init-repo.sh"
}

clone_or_update_remote() {
  local dest="$1"
  local url="$2"
  local branch="$3"
  local pin="${4:-}"

  if is_git_checkout "$dest" && [[ "${FORCE}" -eq 0 ]]; then
    echo "Engineering checkout already present → ${dest}"
    if [[ "${FETCH}" -eq 1 ]]; then
      echo "Updating engineering checkout"
      git -C "${dest}" remote set-url origin "${url}" 2>/dev/null \
        || git -C "${dest}" remote add origin "${url}"
      git -C "${dest}" fetch --prune origin
      if [[ -n "$pin" ]]; then
        git -C "${dest}" fetch origin "$pin" 2>/dev/null || true
        git -C "${dest}" checkout --detach "$pin" \
          || die "failed to checkout pin ${pin} in ${dest}"
      elif [[ -n "$branch" ]]; then
        git -C "${dest}" checkout "${branch}"
        git -C "${dest}" pull --ff-only origin "${branch}" \
          || git -C "${dest}" reset --hard "origin/${branch}"
      fi
    fi
    return 0
  fi

  if [[ -e "${dest}" ]]; then
    if [[ "${FORCE}" -eq 1 ]]; then
      echo "Removing existing path ( --force ) → ${dest}"
      rm -rf "${dest}"
    else
      die "path exists but is not a usable engineering checkout: ${dest} (use --force)"
    fi
  fi

  mkdir -p "$(dirname "$dest")"
  if [[ -n "$branch" ]]; then
    echo "Cloning ${url} (${branch}) → ${dest}"
    if ! git clone --branch "${branch}" --single-branch "${url}" "${dest}"; then
      die "failed to clone ${url} branch '${branch}'"
    fi
  else
    echo "Cloning ${url} → ${dest}"
    if ! git clone --single-branch "${url}" "${dest}"; then
      die "failed to clone ${url}"
    fi
  fi

  if [[ -n "$pin" ]]; then
    echo "Checking out pin ${pin}"
    git -C "${dest}" fetch origin "$pin" 2>/dev/null || true
    git -C "${dest}" checkout --detach "$pin" \
      || die "failed to checkout pin ${pin} in ${dest}"
  fi
}

clone_intree_engineering() {
  local dest="$1"
  local source_dir="$2"

  if [[ -e "${dest}" ]] && [[ "${FORCE}" -eq 0 ]]; then
    echo "Engineering path already present (in-tree)"
    return 0
  fi
  if [[ -e "${dest}" ]]; then
    rm -rf "${dest}"
  fi

  [[ -d "${source_dir}/${DEFAULT_ENG_PATH}" ]] \
    || die "no ${DEFAULT_ENG_PATH}/ in ${source_dir}"

  mkdir -p "${dest}"
  tar -C "${source_dir}/${DEFAULT_ENG_PATH}" --exclude='.git' -cf - . \
    | tar -C "${dest}" -xf -

  cat >"${dest}/.workflow-server-source" <<EOF
mode=intree
source_dir=${source_dir}
path=${DEFAULT_ENG_PATH}
EOF
  echo "Materialised in-tree engineering → ${dest}"
}

init_nested_submodules() {
  local dest="$1"
  if [[ -f "${dest}/.gitmodules" ]]; then
    echo "Initializing nested submodules → ${dest}"
    git -C "${dest}" submodule update --init --recursive || \
      echo "warning: submodule init incomplete (check access to nested remotes)" >&2
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --root=*) ROOT="${1#*=}"; shift ;;
    --root) ROOT="${2:?}"; shift 2 ;;
    --projects-root=*) PROJECTS_ROOT="${1#*=}"; shift ;;
    --projects-root) PROJECTS_ROOT="${2:?}"; shift 2 ;;
    --url=*) REPO_URL="${1#*=}"; shift ;;
    --url) REPO_URL="${2:?}"; shift 2 ;;
    --branch=*) SOURCE_BRANCH="${1#*=}"; shift ;;
    --branch) SOURCE_BRANCH="${2:?}"; shift 2 ;;
    --engineering-url=*) ENG_URL_OVERRIDE="${1#*=}"; shift ;;
    --engineering-url) ENG_URL_OVERRIDE="${2:?}"; shift 2 ;;
    --engineering-branch=*)
      ENG_BRANCH_OVERRIDE="${1#*=}"
      ENG_BRANCH="$ENG_BRANCH_OVERRIDE"
      shift
      ;;
    --engineering-branch)
      ENG_BRANCH_OVERRIDE="${2:?}"
      ENG_BRANCH="$ENG_BRANCH_OVERRIDE"
      shift 2
      ;;
    --no-fetch) FETCH=0; shift ;;
    --force) FORCE=1; shift ;;
    -*) die "unknown option: $1 (see --help)" ;;
    *)
      [[ -z "$REPO_PATH" ]] || die "unexpected argument: $1"
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
if [[ -z "$PROJECTS_ROOT" ]]; then
  PROJECTS_ROOT="${ROOT}/projects"
fi
PROJECTS_ROOT="$(abs_path "$PROJECTS_ROOT")"
# Canonical basename checkout (not owner/repo).
PROJECTS_DIR="${PROJECTS_ROOT}/${NAME}"
ENG_DIR="${PROJECTS_DIR}/${DEFAULT_ENG_PATH}"
WT_DIR="${PROJECTS_DIR}/${DEFAULT_WORKTREES_NAME}"

echo
echo "Init complete."
echo "  Repo path    : ${REPO_PATH}"
echo "  Checkout     : ${PROJECTS_DIR}"
echo "  Source branch: ${SOURCE_BRANCH_ACTUAL:-unknown}"
echo "  Engineering  : ${ENG_DIR}"
echo "  Worktrees    : ${WT_DIR}"
echo "  Eng mode     : ${ENG_SOURCE_MODE:-unknown}"
if [[ -n "${ENG_SOURCE_URL:-}" ]]; then
  echo "  Eng URL      : ${ENG_SOURCE_URL}"
fi
if [[ -n "${ENG_SOURCE_BRANCH:-}" ]]; then
  echo "  Eng branch   : ${ENG_SOURCE_BRANCH}"
fi
