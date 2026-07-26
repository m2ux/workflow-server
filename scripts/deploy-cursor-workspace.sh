#!/usr/bin/env bash
# Deploy the example Cursor multi-root workspace for a product checkout.
#
# Copies examples/cursor-workspace into Cursor's workspaces data dir and writes
# absolute folder paths under $HOME/… so Cursor does not need
# HOST_PROJECTS_ROOT at launch.
#
# Layout (matches the canonical live workspace):
#   🏠 workspace   → $HOME/.local/share/cursor/workspaces/<name>/
#   📂 project     → $HOME/…/<repo>
#   📋 planning    → …/<repo>/.engineering/artifacts/planning
#   🌳 work trees  → …/<repo>/.worktrees
#
# Usage:
#   ./scripts/deploy-cursor-workspace.sh --github=owner/repo [options]
#   ./scripts/deploy-cursor-workspace.sh owner/repo [options]
#
# Needs: bash, cp, mkdir, python3.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Repo checkout: scripts/deploy-… → ../examples/cursor-workspace
# install.sh layout: $INSTALL/deploy-… + $INSTALL/examples/cursor-workspace
if [[ -d "${SCRIPT_DIR}/../examples/cursor-workspace" ]]; then
  TEMPLATE_DIR="$(cd "${SCRIPT_DIR}/../examples/cursor-workspace" && pwd)"
elif [[ -d "${SCRIPT_DIR}/examples/cursor-workspace" ]]; then
  TEMPLATE_DIR="$(cd "${SCRIPT_DIR}/examples/cursor-workspace" && pwd)"
else
  TEMPLATE_DIR="${SCRIPT_DIR}/../examples/cursor-workspace"
fi

# Paths are built from $HOME (see --home to override).
HOME_DIR="${HOME:-}"
REPO_BASENAME=""
GITHUB_REPO=""
WORKSPACE_NAME=""
PROJECTS_ROOT="${HOST_PROJECTS_ROOT:-}"
CURSOR_WORKSPACES_ROOT=""
MCP_URL="http://127.0.0.1:3000/mcp"
FORCE=0
DRY_RUN=0
OPEN_AFTER=0
SKIP_MKDIR=0

usage() {
  cat <<EOF
Usage: $(basename "$0") --github=owner/repo [options]
       $(basename "$0") owner/repo [options]

Deploy examples/cursor-workspace to Cursor's multi-root workspaces dir with
absolute paths under \$HOME/….

Requires a GitHub repo path (owner/repo). Only the repo name (basename) is used
for the projects checkout, workspace folder, and .code-workspace filename.
No target is assumed when args are omitted — that prints this help.

Required:
  --github=owner/repo        GitHub path (e.g. m2ux/workflow-server).
                             Basename becomes the checkout / workspace name.
  owner/repo                 Same as --github=owner/repo (positional)

Options:
  --name=NAME                Cursor workspace folder name (default: repo basename)
  --home=PATH                Override \$HOME when building paths (default: \$HOME)
  --projects-root=PATH       Projects root (default: \$HOST_PROJECTS_ROOT or
                             \$HOME/projects/dev)
  --cursor-workspaces=PATH   Parent dir for kickoff folders
                             (default: \$HOME/.local/share/cursor/workspaces)
  --mcp-url=URL              workflow-server HTTP MCP URL written into mcp.json
                             (default: http://127.0.0.1:3000/mcp)
  --template=DIR             Template source (default: examples/cursor-workspace next to
                             this script, or ../examples/cursor-workspace from scripts/)
  --force                    Refresh managed files in an existing workspace dir
                             (upserts required MCP servers; keeps any extras)
  --dry-run                  Print actions only
  --open                     Run \`cursor <workspace-file>\` after deploy (if on PATH)
  --skip-mkdir               Do not create .worktrees / planning parents on the checkout
  -h, --help                 Show this help

Required MCP servers written into mcp.json (workflows depend on these):
  concept-rag, atlassian, gitnexus, workflow-server

Path substitution (all MCP servers — command and args):
  \${HOME}  \$HOME  __USER_HOME__  /home/<name>/…  → \$HOME/…

Environment:
  HOME                       Required (unless --home) for path expansion
  HOST_PROJECTS_ROOT         Optional default for --projects-root
  CONCEPT_RAG_ENTRY          Override concept-rag entry script
                             (default: \$HOME/projects/main/concept-rag/dist/conceptual_index.js)
  CONCEPT_RAG_INDEX          Override concept-rag index dir (default: \$HOME/.concept_rag)
  GITNEXUS_BIN               Override gitnexus binary (default: /usr/local/bin/gitnexus)

Examples:
  $(basename "$0") --github=m2ux/workflow-server
  $(basename "$0") acme/my-app --open
  $(basename "$0") --github=m2ux/workflow-server --force --dry-run
  $(basename "$0") --github=m2ux/workflow-server --home=\"\$HOME\" --projects-root=\"\$HOME\"/projects/dev
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

log() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] $*"
  else
    echo "$*"
  fi
}

run() {
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] $*"
    return 0
  fi
  "$@"
}

abs_path() {
  local p="$1"
  if [[ "$p" != /* ]]; then
    p="$(pwd)/$p"
  fi
  # Resolve .. and . without requiring the path to exist end-to-end.
  if command -v realpath >/dev/null 2>&1; then
    realpath -m "$p" 2>/dev/null || python3 -c 'import os,sys; print(os.path.abspath(sys.argv[1]))' "$p"
  else
    python3 -c 'import os,sys; print(os.path.abspath(sys.argv[1]))' "$p"
  fi
}

# Expand leading ~ onto $HOME_DIR.
normalize_home_path() {
  local p="$1"
  case "$p" in
    "~"|"~/"*) p="${HOME_DIR}${p#\~}" ;;
  esac
  abs_path "$p"
}

write_file() {
  local dest="$1"
  local content="$2"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] write ${dest}"
    return 0
  fi
  mkdir -p "$(dirname "$dest")"
  printf '%s' "$content" >"$dest"
}

if [[ $# -eq 0 ]]; then
  usage
  exit 0
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --github=*) GITHUB_REPO="${1#*=}"; shift ;;
    --github) GITHUB_REPO="${2:?}"; shift 2 ;;
    --name=*) WORKSPACE_NAME="${1#*=}"; shift ;;
    --name) WORKSPACE_NAME="${2:?}"; shift 2 ;;
    --home=*) HOME_DIR="${1#*=}"; shift ;;
    --home) HOME_DIR="${2:?}"; shift 2 ;;
    --projects-root=*) PROJECTS_ROOT="${1#*=}"; shift ;;
    --projects-root) PROJECTS_ROOT="${2:?}"; shift 2 ;;
    --cursor-workspaces=*) CURSOR_WORKSPACES_ROOT="${1#*=}"; shift ;;
    --cursor-workspaces) CURSOR_WORKSPACES_ROOT="${2:?}"; shift 2 ;;
    --mcp-url=*) MCP_URL="${1#*=}"; shift ;;
    --mcp-url) MCP_URL="${2:?}"; shift 2 ;;
    --template=*) TEMPLATE_DIR="${1#*=}"; shift ;;
    --template) TEMPLATE_DIR="${2:?}"; shift 2 ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --open) OPEN_AFTER=1; shift ;;
    --skip-mkdir) SKIP_MKDIR=1; shift ;;
    --repo=*|--repo)
      die "unknown option: $1 (repo name is taken from --github=owner/repo; try --help)"
      ;;
    --*) die "unknown option: $1 (try --help)" ;;
    *)
      if [[ -n "$GITHUB_REPO" ]]; then
        die "unexpected argument: $1 (GitHub path already set to ${GITHUB_REPO})"
      fi
      GITHUB_REPO="$1"
      shift
      ;;
  esac
done

if [[ -z "$GITHUB_REPO" ]]; then
  usage >&2
  die "missing required GitHub path: pass --github=owner/repo or owner/repo"
fi
if [[ ! "$GITHUB_REPO" =~ ^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]]; then
  die "GitHub path must look like owner/repo (got: ${GITHUB_REPO})"
fi
# Paths use the repo name only (basename of owner/repo).
REPO_BASENAME="${GITHUB_REPO##*/}"

if [[ -z "$HOME_DIR" ]]; then
  die "\$HOME is unset; export HOME or pass --home=PATH"
fi
HOME_DIR="$(abs_path "$HOME_DIR")"
if [[ ! -d "$HOME_DIR" ]]; then
  die "home directory missing: ${HOME_DIR} (check \$HOME or --home)"
fi

if [[ -z "$PROJECTS_ROOT" ]]; then
  PROJECTS_ROOT="${HOME_DIR}/projects/dev"
fi
if [[ -z "$CURSOR_WORKSPACES_ROOT" ]]; then
  CURSOR_WORKSPACES_ROOT="${HOME_DIR}/.local/share/cursor/workspaces"
fi

if [[ ! "$REPO_BASENAME" =~ ^[A-Za-z0-9._-]+$ ]]; then
  die "repo basename must be alphanumeric/._- (got: ${REPO_BASENAME})"
fi

if [[ -z "$WORKSPACE_NAME" ]]; then
  WORKSPACE_NAME="$REPO_BASENAME"
fi

if [[ ! "$WORKSPACE_NAME" =~ ^[A-Za-z0-9._-]+$ ]]; then
  die "workspace name must be alphanumeric/._- (got: ${WORKSPACE_NAME})"
fi

[[ -d "$TEMPLATE_DIR" ]] || die "template not found: ${TEMPLATE_DIR}"

PROJECTS_ROOT="$(normalize_home_path "$PROJECTS_ROOT")"
CURSOR_WORKSPACES_ROOT="$(normalize_home_path "$CURSOR_WORKSPACES_ROOT")"
TEMPLATE_DIR="$(normalize_home_path "$TEMPLATE_DIR")"

if [[ "$PROJECTS_ROOT" != "$HOME_DIR" && "$PROJECTS_ROOT" != "$HOME_DIR"/* ]]; then
  log "note: projects root is outside \$HOME (${HOME_DIR}): ${PROJECTS_ROOT}"
fi

PROJECT_DIR="${PROJECTS_ROOT}/${REPO_BASENAME}"
PLANNING_DIR="${PROJECT_DIR}/.engineering/artifacts/planning"
WORKTREES_DIR="${PROJECT_DIR}/.worktrees"
DEST_DIR="${CURSOR_WORKSPACES_ROOT}/${WORKSPACE_NAME}"
WORKSPACE_FILE="${DEST_DIR}/${REPO_BASENAME}.code-workspace"

if [[ -e "$DEST_DIR" && "$FORCE" -ne 1 && "$DRY_RUN" -ne 1 ]]; then
  die "destination exists: ${DEST_DIR} (re-run with --force to overwrite managed files)"
fi
if [[ -e "$DEST_DIR" && "$DRY_RUN" -eq 1 && "$FORCE" -ne 1 ]]; then
  log "note: destination exists (would require --force to write): ${DEST_DIR}"
fi

log "Deploy Cursor workspace"
log "  HOME              : ${HOME_DIR}"
log "  github            : ${GITHUB_REPO}"
log "  repo (basename)   : ${REPO_BASENAME}"
log "  template          : ${TEMPLATE_DIR}"
log "  destination       : ${DEST_DIR}"
log "  projects root     : ${PROJECTS_ROOT}"
log "  project           : ${PROJECT_DIR}"
log "  planning          : ${PLANNING_DIR}"
log "  work trees        : ${WORKTREES_DIR}"
log "  workspace file    : ${WORKSPACE_FILE}"
log "  MCP URL           : ${MCP_URL}"

# --- copy template rules / skills (preserve extra local files) ----------------
if [[ "$DRY_RUN" -eq 1 ]]; then
  log "copy template rules/skills → ${DEST_DIR}"
else
  mkdir -p "${DEST_DIR}/.cursor/rules" "${DEST_DIR}/.claude/rules"

  if [[ -d "${TEMPLATE_DIR}/.cursor/rules" ]]; then
    cp -a "${TEMPLATE_DIR}/.cursor/rules/." "${DEST_DIR}/.cursor/rules/"
  fi
  if [[ -d "${TEMPLATE_DIR}/.claude/rules" ]]; then
    cp -a "${TEMPLATE_DIR}/.claude/rules/." "${DEST_DIR}/.claude/rules/"
  fi
  if [[ -f "${TEMPLATE_DIR}/.claude/settings.example.json" ]]; then
    cp -a "${TEMPLATE_DIR}/.claude/settings.example.json" \
      "${DEST_DIR}/.claude/settings.example.json"
  fi
  if [[ -d "${TEMPLATE_DIR}/.cursor/skills" ]]; then
    mkdir -p "${DEST_DIR}/.cursor/skills"
    cp -a "${TEMPLATE_DIR}/.cursor/skills/." "${DEST_DIR}/.cursor/skills/"
  fi
fi

# --- mcp.json (required companions + workflow-server; keep extras) ------------
# Workflows expect concept-rag, atlassian, and gitnexus alongside workflow-server.
CONCEPT_RAG_ENTRY="${CONCEPT_RAG_ENTRY:-${HOME_DIR}/projects/main/concept-rag/dist/conceptual_index.js}"
CONCEPT_RAG_INDEX="${CONCEPT_RAG_INDEX:-${HOME_DIR}/.concept_rag}"
if [[ -z "${GITNEXUS_BIN:-}" ]]; then
  if command -v gitnexus >/dev/null 2>&1; then
    GITNEXUS_BIN="$(command -v gitnexus)"
  else
    GITNEXUS_BIN="/usr/local/bin/gitnexus"
  fi
fi
if command -v node >/dev/null 2>&1; then
  NODE_BIN="$(command -v node)"
else
  NODE_BIN="node"
fi

merge_mcp_json() {
  local existing_path="$1"
  MCP_URL="$MCP_URL" \
  EXISTING_PATH="$existing_path" \
  HOME_DIR="$HOME_DIR" \
  CONCEPT_RAG_ENTRY="$CONCEPT_RAG_ENTRY" \
  CONCEPT_RAG_INDEX="$CONCEPT_RAG_INDEX" \
  GITNEXUS_BIN="$GITNEXUS_BIN" \
  NODE_BIN="$NODE_BIN" \
  python3 - <<'PY'
import json, os, re, sys

url = os.environ["MCP_URL"]
path = os.environ.get("EXISTING_PATH") or ""
home_dir = os.environ["HOME_DIR"].rstrip("/")
concept_entry = os.environ["CONCEPT_RAG_ENTRY"]
concept_index = os.environ["CONCEPT_RAG_INDEX"]
gitnexus_bin = os.environ["GITNEXUS_BIN"]
node_bin = os.environ["NODE_BIN"]

def expand(value: str) -> str:
    """Substitute home path tokens in any MCP string (all servers)."""
    if not isinstance(value, str):
        return value
    value = value.replace("__USER_HOME__", home_dir)
    value = value.replace("${USER_HOME}", home_dir)
    value = value.replace("$USER_HOME", home_dir)
    value = value.replace("${HOME}", home_dir)
    # Only bare $HOME (not $HOSTNAME etc.)
    value = re.sub(r"\$HOME(?![A-Za-z0-9_])", home_dir, value)
    # /home/<any-name>/… → $HOME/…
    value = re.sub(r"/home/[^/]+/", home_dir + "/", value)
    return value

def expand_obj(obj):
    if isinstance(obj, dict):
        return {k: expand_obj(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [expand_obj(v) for v in obj]
    if isinstance(obj, str):
        return expand(obj)
    return obj

def load_mcp(path: str):
    if not path or not os.path.isfile(path):
        return {"mcpServers": {}}
    try:
        raw = open(path, encoding="utf-8").read()
        # Tolerate trailing commas sometimes left in hand-edited mcp.json.
        raw = re.sub(r",\s*([}\]])", r"\1", raw)
        loaded = json.loads(raw)
        if isinstance(loaded, dict) and isinstance(loaded.get("mcpServers"), dict):
            return loaded
    except (OSError, json.JSONDecodeError):
        pass
    return {"mcpServers": {}}

doc = load_mcp(path)
servers = doc.setdefault("mcpServers", {})

# Required set — token-friendly values; expand_obj runs on the full doc below
# so substitution applies to these and to every other server the same way.
servers["concept-rag"] = {
    "command": node_bin,
    "args": [concept_entry, concept_index],
}
servers["atlassian"] = {
    "command": "npx",
    "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"],
}
servers["gitnexus"] = {
    "command": node_bin,
    "args": [gitnexus_bin, "mcp"],
}
servers["workflow-server"] = {
    "command": "npx",
    "args": ["-y", "mcp-remote", url],
}

# Expand home-path tokens on every server (required + extras), every field.
doc = expand_obj(doc)
servers = doc.setdefault("mcpServers", {})

# Stable key order for readable diffs.
ordered = {}
for key in ("concept-rag", "atlassian", "gitnexus", "workflow-server"):
    if key in servers:
        ordered[key] = servers.pop(key)
for key in sorted(servers):
    ordered[key] = servers[key]
doc["mcpServers"] = ordered

json.dump(doc, sys.stdout, indent=2, ensure_ascii=False)
sys.stdout.write("\n")
PY
}

# Prefer merging from existing dest, then template.
MCP_SRC=""
if [[ -f "${DEST_DIR}/.cursor/mcp.json" ]]; then
  MCP_SRC="${DEST_DIR}/.cursor/mcp.json"
elif [[ -f "${DEST_DIR}/.mcp.json" ]]; then
  MCP_SRC="${DEST_DIR}/.mcp.json"
elif [[ -f "${TEMPLATE_DIR}/.cursor/mcp.json" ]]; then
  MCP_SRC="${TEMPLATE_DIR}/.cursor/mcp.json"
elif [[ -f "${TEMPLATE_DIR}/.mcp.json" ]]; then
  MCP_SRC="${TEMPLATE_DIR}/.mcp.json"
fi

MCP_JSON="$(merge_mcp_json "$MCP_SRC")"
write_file "${DEST_DIR}/.cursor/mcp.json" "$MCP_JSON"
write_file "${DEST_DIR}/.mcp.json" "$MCP_JSON"

# --- .code-workspace (absolute $HOME paths) -----------------------------------
# shellcheck disable=SC2016
WORKSPACE_JSON=$(
  PROJECT_DIR="$PROJECT_DIR" \
  PLANNING_DIR="$PLANNING_DIR" \
  WORKTREES_DIR="$WORKTREES_DIR" \
  python3 - <<'PY'
import json, os
doc = {
  "folders": [
    {"name": "🏠 workspace", "path": "./"},
    {"name": "📂 project", "path": os.environ["PROJECT_DIR"]},
    {"name": "📋 planning", "path": os.environ["PLANNING_DIR"]},
    {"name": "🌳 work trees", "path": os.environ["WORKTREES_DIR"]},
  ],
  "settings": {},
}
print(json.dumps(doc, indent=2, ensure_ascii=False) + "\n")
PY
)
write_file "$WORKSPACE_FILE" "$WORKSPACE_JSON"

# --- AGENTS.md / CLAUDE.md ----------------------------------------------------
AGENTS_BODY="The Github repo for which this workspace is targeted is ${GITHUB_REPO}."
write_file "${DEST_DIR}/AGENTS.md" "${AGENTS_BODY}"$'\n'

if [[ "$DRY_RUN" -eq 1 ]]; then
  log "symlink CLAUDE.md → AGENTS.md"
else
  ln -sfn AGENTS.md "${DEST_DIR}/CLAUDE.md"
fi

# --- ensure checkout mount points --------------------------------------------
if [[ "$SKIP_MKDIR" -eq 0 ]]; then
  if [[ ! -d "$PROJECT_DIR" ]]; then
    log "warning: project checkout does not exist yet: ${PROJECT_DIR}"
    log "         create/clone it under projects root, then re-open the workspace"
  fi
  run mkdir -p "$WORKTREES_DIR"
  # Planning root may be absent until engineering is deployed; create parents so
  # Cursor can still mount the folder (empty until eng exists).
  run mkdir -p "$PLANNING_DIR"
fi

# --- summary ------------------------------------------------------------------
echo
echo "Deployed Cursor workspace:"
echo "  ${DEST_DIR}"
echo
echo "Open with:"
echo "  cursor ${WORKSPACE_FILE}"
echo "  # or: File → Open Workspace from File…"
echo
if [[ ! -d "$PROJECT_DIR" ]]; then
  echo "Next: clone or place the repo at:"
  echo "  ${PROJECT_DIR}"
  echo
fi

if [[ "$OPEN_AFTER" -eq 1 ]]; then
  if command -v cursor >/dev/null 2>&1; then
    run cursor "$WORKSPACE_FILE"
  else
    log "warning: 'cursor' not on PATH; open ${WORKSPACE_FILE} manually"
  fi
fi
