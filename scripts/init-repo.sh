#!/usr/bin/env bash
# workflow-server — initialize a managed repo under the install root
#
# Accepts a full GitHub-style path (owner/repo), creates engineering + workspace
# directories, and checks out that repo's engineering content.
#
# Engineering resolution order:
#   1. Explicit --engineering-url / --engineering-branch overrides
#   2. App default branch: .engineering git submodule (url + branch from
#      .gitmodules) — covers external engineering remotes
#   3. App remote branch named "engineering" (or --branch)
#   4. App default branch: in-tree .engineering/ directory
#
#   ~/.local/share/workflow-server/init-repo.sh m2ux/workflow-server
#   ./scripts/init-repo.sh m2ux/workflow-server
#   ./scripts/init-repo.sh --url=git@github.com:acme/app.git acme/app
#
# Layout (default root = $XDG_DATA_HOME/workflow-server or ~/.local/share/workflow-server):
#
#   $ROOT/
#     engineering/<owner>/<repo>/    # engineering content checkout
#     workspace/<owner>/<repo>/      # host root for feature worktrees
#
# Needs: git
set -euo pipefail

DEFAULT_ROOT="${XDG_DATA_HOME:-${HOME}/.local/share}/workflow-server"
DEFAULT_BRANCH="engineering"
DEFAULT_HOST="github.com"
DEFAULT_ENG_PATH=".engineering"

ROOT="${WORKFLOW_SERVER_INSTALL_DIR:-$DEFAULT_ROOT}"
BRANCH="${WORKFLOW_SERVER_ENGINEERING_BRANCH:-$DEFAULT_BRANCH}"
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
Initialize engineering + workspace paths for a repo under the workflow-server install root.

USAGE
  $(basename "$0") [options] <owner/repo>

ARGUMENTS
  owner/repo             Full repo path, e.g. m2ux/workflow-server
                         (also accepts https://github.com/owner/repo[.git])

OPTIONS
  --root=PATH            Install root (default: ${DEFAULT_ROOT})
  --url=URL              App repo git remote (default: https://github.com/<owner/repo>.git)
  --branch=NAME          Fallback engineering branch when not taken from
                         .gitmodules (default: ${DEFAULT_BRANCH})
  --engineering-url=URL  Force engineering remote (skip app-repo probe)
  --engineering-branch=NAME
                         Force engineering branch (with --engineering-url, or
                         override the branch from .gitmodules)
  --no-fetch             Skip fetch when checkout already exists
  --force                Recreate engineering checkout if path exists but is invalid
  -h, --help

LAYOUT
  \$ROOT/engineering/<owner>/<repo>/
  \$ROOT/workspace/<owner>/<repo>/

RESOLUTION
  Probe the app repo for .engineering as a submodule (external URL + branch),
  else clone branch "${DEFAULT_BRANCH}" from the app repo, else extract an
  in-tree .engineering/ directory from the app default branch.
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
  # Lines look like: submodule.<name>.path <path>
  # Do not use `IFS= read` — that disables splitting and swallows the value.
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

# Shallow-probe the app repo default branch into $1 (empty/new dir).
probe_app_repo() {
  local dest="$1"
  local url="$2"
  echo "Probing app repo → ${url}"
  if git clone --depth 1 --filter=blob:none --single-branch "$url" "$dest" >/dev/null 2>&1; then
    return 0
  fi
  rm -rf "$dest"
  mkdir -p "$dest"
  git clone --depth 1 --single-branch "$url" "$dest" >/dev/null 2>&1
}

remote_has_branch() {
  local url="$1"
  local branch="$2"
  git ls-remote --heads "$url" "refs/heads/${branch}" 2>/dev/null | grep -q .
}

# Decide engineering source. Sets ENG_SOURCE_* globals.
resolve_engineering_source() {
  local app_url="$1"
  local fallback_branch="$2"

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

  local probe
  probe="$(mktemp -d "${TMPDIR:-/tmp}/wf-init-probe.XXXXXX")"
  cleanup_probe() { rm -rf "$probe"; }
  # shellcheck disable=SC2064
  trap cleanup_probe EXIT

  if ! probe_app_repo "$probe" "$app_url"; then
    cleanup_probe
    trap - EXIT
    echo "warning: could not probe app repo; falling back to branch '${fallback_branch}' on app remote" >&2
    ENG_SOURCE_URL="$app_url"
    ENG_SOURCE_BRANCH="${ENG_BRANCH_OVERRIDE:-$fallback_branch}"
    ENG_SOURCE_MODE="remote"
    return 0
  fi

  local mode_line mode_type entry sub_url sub_branch pin try_branch
  mode_line="$(git -C "$probe" ls-tree HEAD -- "$DEFAULT_ENG_PATH" 2>/dev/null || true)"
  mode_type="$(printf '%s\n' "$mode_line" | awk '{print $1" "$2}')"

  if [[ "$mode_type" == "160000 commit" ]]; then
    if entry="$(read_gitmodules_entry "${probe}/.gitmodules" "$DEFAULT_ENG_PATH")"; then
      sub_url="${entry%%$'\t'*}"
      sub_branch="${entry#*$'\t'}"
      # When entry has no tab-branch, sub_branch equals full entry — clear it.
      [[ "$sub_branch" == "$sub_url" ]] && sub_branch=""
      ENG_SOURCE_URL="$(resolve_submodule_url "$app_url" "$sub_url")"
      pin="$(printf '%s\n' "$mode_line" | awk '{print $3}')"
      ENG_SOURCE_PIN="${pin:-}"
      if [[ -n "$ENG_BRANCH_OVERRIDE" ]]; then
        ENG_SOURCE_BRANCH="$ENG_BRANCH_OVERRIDE"
      elif [[ -n "$sub_branch" ]]; then
        ENG_SOURCE_BRANCH="$sub_branch"
      else
        ENG_SOURCE_BRANCH=""
      fi
      ENG_SOURCE_MODE="remote"
      cleanup_probe
      trap - EXIT
      echo "Engineering source (submodule): ${ENG_SOURCE_URL}${ENG_SOURCE_BRANCH:+ @ ${ENG_SOURCE_BRANCH}}${ENG_SOURCE_PIN:+ (pin ${ENG_SOURCE_PIN})}"
      return 0
    fi
    echo "warning: .engineering is a submodule but .gitmodules entry is missing; falling back" >&2
  elif [[ "$mode_type" == "040000 tree" ]]; then
    ENG_SOURCE_URL="$app_url"
    ENG_SOURCE_BRANCH="$(git -C "$probe" rev-parse --abbrev-ref HEAD)"
    ENG_SOURCE_MODE="intree"
    cleanup_probe
    trap - EXIT
    echo "Engineering source (in-tree .engineering/ on ${ENG_SOURCE_BRANCH})"
    return 0
  fi

  try_branch="${ENG_BRANCH_OVERRIDE:-$fallback_branch}"
  cleanup_probe
  trap - EXIT

  if remote_has_branch "$app_url" "$try_branch"; then
    ENG_SOURCE_URL="$app_url"
    ENG_SOURCE_BRANCH="$try_branch"
    ENG_SOURCE_MODE="remote"
    echo "Engineering source (app branch): ${ENG_SOURCE_URL} @ ${ENG_SOURCE_BRANCH}"
    return 0
  fi

  die "could not resolve engineering content for ${app_url}
hint: expected one of:
  - .engineering submodule on the default branch (external or same-repo)
  - branch '${try_branch}' on the app remote
  - in-tree .engineering/ on the default branch
create with scripts/deploy.sh in that repo, then re-run init-repo.sh"
}

is_git_checkout() {
  local dest="$1"
  { [[ -d "${dest}/.git" ]] || [[ -f "${dest}/.git" ]]; } \
    && git -C "${dest}" rev-parse --is-inside-work-tree >/dev/null 2>&1
}

clone_or_update_remote() {
  local dest="$1"
  local url="$2"
  local branch="$3"
  local pin="${4:-}"

  if is_git_checkout "$dest" && [[ "${FORCE}" -eq 0 ]]; then
    echo "Engineering checkout already present"
    if [[ "${FETCH}" -eq 1 ]]; then
      echo "Updating engineering checkout → ${dest}"
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
      die "path exists but is not a git checkout: ${dest} (use --force)"
    fi
  fi

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
    echo "Checking out submodule pin ${pin}"
    git -C "${dest}" fetch origin "$pin" 2>/dev/null || true
    git -C "${dest}" checkout --detach "$pin" \
      || die "failed to checkout pin ${pin} in ${dest}"
  fi
}

# Materialise in-tree .engineering/ from the app default branch into dest.
clone_intree_engineering() {
  local dest="$1"
  local app_url="$2"
  local app_branch="$3"
  local tmp

  if [[ -e "${dest}" ]]; then
    if [[ "${FORCE}" -eq 0 && "${FETCH}" -eq 0 ]]; then
      echo "Engineering path already present (in-tree materialisation)"
      return 0
    fi
    echo "Removing existing path → ${dest}"
    rm -rf "${dest}"
  fi

  tmp="$(mktemp -d "${TMPDIR:-/tmp}/wf-init-intree.XXXXXX")"
  cleanup_intree() { rm -rf "$tmp"; }
  # shellcheck disable=SC2064
  trap cleanup_intree EXIT

  echo "Cloning app branch for in-tree .engineering/ → ${app_url} (${app_branch})"
  if ! git clone --depth 1 --branch "${app_branch}" --single-branch --filter=blob:none \
      "${app_url}" "${tmp}" >/dev/null 2>&1; then
    rm -rf "${tmp}"
    mkdir -p "${tmp}"
    git clone --depth 1 --branch "${app_branch}" --single-branch \
      "${app_url}" "${tmp}" >/dev/null \
      || { cleanup_intree; trap - EXIT; die "failed to clone ${app_url} (${app_branch})"; }
  fi

  [[ -d "${tmp}/${DEFAULT_ENG_PATH}" ]] \
    || { cleanup_intree; trap - EXIT; die "no ${DEFAULT_ENG_PATH}/ on ${app_url} (${app_branch})"; }

  mkdir -p "${dest}"
  tar -C "${tmp}/${DEFAULT_ENG_PATH}" --exclude='.git' -cf - . \
    | tar -C "${dest}" -xf -

  cat >"${dest}/.workflow-server-source" <<EOF
mode=intree
app_url=${app_url}
app_branch=${app_branch}
path=${DEFAULT_ENG_PATH}
EOF

  cleanup_intree
  trap - EXIT
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
    --url=*) REPO_URL="${1#*=}"; shift ;;
    --url) REPO_URL="${2:?}"; shift 2 ;;
    --branch=*) BRANCH="${1#*=}"; shift ;;
    --branch) BRANCH="${2:?}"; shift 2 ;;
    --engineering-url=*) ENG_URL_OVERRIDE="${1#*=}"; shift ;;
    --engineering-url) ENG_URL_OVERRIDE="${2:?}"; shift 2 ;;
    --engineering-branch=*) ENG_BRANCH_OVERRIDE="${1#*=}"; shift ;;
    --engineering-branch) ENG_BRANCH_OVERRIDE="${2:?}"; shift 2 ;;
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
ENG_DIR="${ROOT}/engineering/${OWNER}/${NAME}"
WS_DIR="${ROOT}/workspace/${OWNER}/${NAME}"

echo "Repo        : ${REPO_PATH}"
echo "App URL     : ${REPO_URL}"
echo "Root        : ${ROOT}"
echo "Engineering : ${ENG_DIR}"
echo "Workspace   : ${WS_DIR}"
echo

mkdir -p "${ROOT}/engineering/${OWNER}" \
  "${ROOT}/workspace/${OWNER}"

resolve_engineering_source "$REPO_URL" "$BRANCH"

case "$ENG_SOURCE_MODE" in
  remote)
    clone_or_update_remote "$ENG_DIR" "$ENG_SOURCE_URL" "$ENG_SOURCE_BRANCH" "$ENG_SOURCE_PIN"
    init_nested_submodules "$ENG_DIR"
    ;;
  intree)
    clone_intree_engineering "$ENG_DIR" "$ENG_SOURCE_URL" "$ENG_SOURCE_BRANCH"
    if is_git_checkout "$ENG_DIR"; then
      init_nested_submodules "$ENG_DIR"
    fi
    ;;
  *)
    die "internal: unknown engineering source mode '${ENG_SOURCE_MODE}'"
    ;;
esac

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
echo "  Source mode  : ${ENG_SOURCE_MODE}"
if [[ "$ENG_SOURCE_MODE" == "remote" ]]; then
  echo "  Source URL   : ${ENG_SOURCE_URL}"
  if [[ -n "$ENG_SOURCE_BRANCH" ]]; then
    echo "  Source branch: ${ENG_SOURCE_BRANCH}"
  fi
  if [[ -n "$ENG_SOURCE_PIN" ]]; then
    echo "  Source pin   : ${ENG_SOURCE_PIN}"
  fi
fi
