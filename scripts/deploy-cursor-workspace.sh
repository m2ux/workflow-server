#!/usr/bin/env bash
# Deploy the example Cursor multi-root workspace for a product checkout.
#
# Copies examples/cursor-workspace into Cursor's workspaces data dir and writes
# absolute folder paths under /home/$USER/… so Cursor does not need
# HOST_PROJECTS_ROOT at launch.
#
# Layout (matches the canonical live workspace):
#   🏠 workspace   → ~/.local/share/cursor/workspaces/<name>/
#   📂 project     → /home/$USER/…/<repo>
#   📋 planning    → …/<repo>/.engineering/artifacts/planning
#   🌳 work trees  → …/<repo>/.worktrees
#
# Usage:
#   ./scripts/deploy-cursor-workspace.sh [--repo=NAME] [options]
#   ./scripts/deploy-cursor-workspace.sh workflow-server
#   ./scripts/deploy-cursor-workspace.sh --github=m2ux/workflow-server
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

# Canonical user paths are always /home/$USER/… (see --user to override $USER).
USER_NAME="${USER:-}"
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
Usage: $(basename "$0") [repo-basename | options]

Deploy examples/cursor-workspace to Cursor's multi-root workspaces dir with
absolute paths under /home/\$USER/….

Arguments:
  repo-basename              Checkout name under projects root (default: workflow-server)

Options:
  --repo=NAME                Same as positional repo-basename
  --github=owner/repo        Write AGENTS.md session identity (e.g. m2ux/workflow-server).
                             If --repo is omitted, basename is taken from this value.
  --name=NAME                Cursor workspace folder name (default: same as --repo)
  --user=NAME                Override \$USER when building /home/NAME/… paths
  --projects-root=PATH       Projects root (default: \$HOST_PROJECTS_ROOT or
                             /home/\$USER/projects/dev)
  --cursor-workspaces=PATH   Parent dir for kickoff folders
                             (default: /home/\$USER/.local/share/cursor/workspaces)
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
  \${HOME}  \$HOME  \${USER}  \$USER  __USER_HOME__  /home/<name>/…

Environment:
  USER                       Required (unless --user) for /home/\$USER/… path expansion
  HOST_PROJECTS_ROOT         Optional default for --projects-root
  CONCEPT_RAG_ENTRY          Override concept-rag entry script
                             (default: /home/\$USER/projects/main/concept-rag/dist/conceptual_index.js)
  CONCEPT_RAG_INDEX          Override concept-rag index dir (default: /home/\$USER/.concept_rag)
  GITNEXUS_BIN               Override gitnexus binary (default: /usr/local/bin/gitnexus)

Examples:
  $(basename "$0")
  $(basename "$0") my-app --github=acme/my-app
  $(basename "$0") --repo=workflow-server --github=m2ux/workflow-server --open
  $(basename "$0") --user=\"\$USER\" --projects-root=/home/\"\$USER\"/projects/dev
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

# Expand leading ~ and rewrite $HOME-style paths onto /home/$USER when applicable.
normalize_user_path() {
  local p="$1"
  case "$p" in
    "~"|"~/"*) p="${USER_HOME}${p#\~}" ;;
  esac
  # If caller passed $HOME and it is /home/$USER, keep canonical form.
  if [[ -n "${HOME:-}" && "$p" == "$HOME"/* && "$HOME" == "$USER_HOME" ]]; then
    p="${USER_HOME}${p#"$HOME"}"
  fi
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

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help) usage; exit 0 ;;
    --repo=*) REPO_BASENAME="${1#*=}"; shift ;;
    --repo) REPO_BASENAME="${2:?}"; shift 2 ;;
    --github=*) GITHUB_REPO="${1#*=}"; shift ;;
    --github) GITHUB_REPO="${2:?}"; shift 2 ;;
    --name=*) WORKSPACE_NAME="${1#*=}"; shift ;;
    --name) WORKSPACE_NAME="${2:?}"; shift 2 ;;
    --user=*) USER_NAME="${1#*=}"; shift ;;
    --user) USER_NAME="${2:?}"; shift 2 ;;
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
    --*) die "unknown option: $1 (try --help)" ;;
    *)
      if [[ -n "$REPO_BASENAME" ]]; then
        die "unexpected argument: $1"
      fi
      REPO_BASENAME="$1"
      shift
      ;;
  esac
done

if [[ -z "$USER_NAME" ]]; then
  die "\$USER is unset; export USER or pass --user=NAME"
fi
if [[ ! "$USER_NAME" =~ ^[A-Za-z0-9._-]+$ ]]; then
  die "user name must be alphanumeric/._- (got: ${USER_NAME})"
fi

USER_HOME="/home/${USER_NAME}"
if [[ ! -d "$USER_HOME" ]]; then
  die "expected home directory missing: ${USER_HOME} (check \$USER or --user; HOME=${HOME:-unset})"
fi
if [[ -n "${HOME:-}" && "$HOME" != "$USER_HOME" ]]; then
  log "note: HOME=${HOME} differs from /home/${USER_NAME}; using /home/${USER_NAME} for defaults"
fi

if [[ -z "$PROJECTS_ROOT" ]]; then
  PROJECTS_ROOT="${USER_HOME}/projects/dev"
fi
if [[ -z "$CURSOR_WORKSPACES_ROOT" ]]; then
  CURSOR_WORKSPACES_ROOT="${USER_HOME}/.local/share/cursor/workspaces"
fi

if [[ -n "$GITHUB_REPO" ]]; then
  if [[ ! "$GITHUB_REPO" =~ ^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$ ]]; then
    die "--github must look like owner/repo (got: ${GITHUB_REPO})"
  fi
  if [[ -z "$REPO_BASENAME" ]]; then
    REPO_BASENAME="${GITHUB_REPO##*/}"
  fi
fi

if [[ -z "$REPO_BASENAME" ]]; then
  REPO_BASENAME="workflow-server"
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

PROJECTS_ROOT="$(normalize_user_path "$PROJECTS_ROOT")"
CURSOR_WORKSPACES_ROOT="$(normalize_user_path "$CURSOR_WORKSPACES_ROOT")"
TEMPLATE_DIR="$(normalize_user_path "$TEMPLATE_DIR")"

if [[ "$PROJECTS_ROOT" != "$USER_HOME" && "$PROJECTS_ROOT" != "$USER_HOME"/* ]]; then
  log "note: projects root is outside /home/${USER_NAME}: ${PROJECTS_ROOT}"
fi

PROJECT_DIR="${PROJECTS_ROOT}/${REPO_BASENAME}"
PLANNING_DIR="${PROJECT_DIR}/.engineering/artifacts/planning"
WORKTREES_DIR="${PROJECT_DIR}/.worktrees"
DEST_DIR="${CURSOR_WORKSPACES_ROOT}/${WORKSPACE_NAME}"
WORKSPACE_FILE="${DEST_DIR}/${REPO_BASENAME}.code-workspace"
# Keep a stable filename for the default product name used in docs/live layout.
if [[ "$REPO_BASENAME" == "workflow-server" || "$WORKSPACE_NAME" == "workflow-server" ]]; then
  WORKSPACE_FILE="${DEST_DIR}/workflow-server.code-workspace"
fi

if [[ -e "$DEST_DIR" && "$FORCE" -ne 1 && "$DRY_RUN" -ne 1 ]]; then
  die "destination exists: ${DEST_DIR} (re-run with --force to overwrite managed files)"
fi
if [[ -e "$DEST_DIR" && "$DRY_RUN" -eq 1 && "$FORCE" -ne 1 ]]; then
  log "note: destination exists (would require --force to write): ${DEST_DIR}"
fi

log "Deploy Cursor workspace"
log "  USER              : ${USER_NAME}"
log "  user home         : ${USER_HOME}"
log "  template          : ${TEMPLATE_DIR}"
log "  destination       : ${DEST_DIR}"
log "  projects root     : ${PROJECTS_ROOT}"
log "  project           : ${PROJECT_DIR}"
log "  planning          : ${PLANNING_DIR}"
log "  work trees        : ${WORKTREES_DIR}"
log "  workspace file    : ${WORKSPACE_FILE}"
log "  MCP URL           : ${MCP_URL}"
if [[ -n "$GITHUB_REPO" ]]; then
  log "  github            : ${GITHUB_REPO}"
fi

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
CONCEPT_RAG_ENTRY="${CONCEPT_RAG_ENTRY:-${USER_HOME}/projects/main/concept-rag/dist/conceptual_index.js}"
CONCEPT_RAG_INDEX="${CONCEPT_RAG_INDEX:-${USER_HOME}/.concept_rag}"
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
  USER_NAME="$USER_NAME" \
  USER_HOME="$USER_HOME" \
  CONCEPT_RAG_ENTRY="$CONCEPT_RAG_ENTRY" \
  CONCEPT_RAG_INDEX="$CONCEPT_RAG_INDEX" \
  GITNEXUS_BIN="$GITNEXUS_BIN" \
  NODE_BIN="$NODE_BIN" \
  python3 - <<'PY'
import json, os, re, sys

url = os.environ["MCP_URL"]
path = os.environ.get("EXISTING_PATH") or ""
user_name = os.environ["USER_NAME"]
user_home = os.environ["USER_HOME"].rstrip("/")
concept_entry = os.environ["CONCEPT_RAG_ENTRY"]
concept_index = os.environ["CONCEPT_RAG_INDEX"]
gitnexus_bin = os.environ["GITNEXUS_BIN"]
node_bin = os.environ["NODE_BIN"]

def expand(value: str) -> str:
    """Substitute user path tokens in any MCP string (all servers)."""
    if not isinstance(value, str):
        return value
    # Explicit placeholders (template + hand edits)
    value = value.replace("__USER_HOME__", user_home)
    value = value.replace("${USER_HOME}", user_home)
    value = value.replace("$USER_HOME", user_home)
    value = value.replace("${HOME}", user_home)
    # Only bare $HOME (not $HOSTNAME etc.)
    value = re.sub(r"\$HOME(?![A-Za-z0-9_])", user_home, value)
    value = value.replace("${USER}", user_name)
    value = re.sub(r"\$USER(?![A-Za-z0-9_])", user_name, value)
    # /home/<any-user>/… → canonical /home/$USER/…
    value = re.sub(r"/home/[^/]+/", user_home + "/", value)
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

# Expand user-path tokens on every server (required + extras), every field.
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

# --- .code-workspace (absolute /home/$USER paths) -----------------------------
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
if [[ -n "$GITHUB_REPO" ]]; then
  AGENTS_BODY="The Github repo for which this workspace is targeted is ${GITHUB_REPO}."
else
  AGENTS_BODY=$(cat <<EOF
# Target repository

## Filesystem checkout (navigation)

Projects live under:

\`\`\`
${PROJECTS_ROOT}
\`\`\`

The checkout for this workspace is the **repo basename**:

\`\`\`
${REPO_BASENAME}
\`\`\`

Full path: \`${PROJECT_DIR}\`

Same layout for every project:

\`\`\`text
${PROJECTS_ROOT}/<repo>/
${PROJECTS_ROOT}/<repo>/.engineering/artifacts/planning/
${PROJECTS_ROOT}/<repo>/.worktrees/<slug>/
\`\`\`

## Session identity (\`start_session\`)

If the agent needs a GitHub \`owner/repo\` for \`start_session\`, set it here:

\`\`\`
owner/repo
\`\`\`

Replace with your project (for example \`m2ux/${REPO_BASENAME}\`).
EOF
)
fi

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
if [[ -z "$GITHUB_REPO" ]]; then
  echo "Optional: set GitHub owner/repo in AGENTS.md, or re-run with --github=owner/repo"
  echo
fi

if [[ "$OPEN_AFTER" -eq 1 ]]; then
  if command -v cursor >/dev/null 2>&1; then
    run cursor "$WORKSPACE_FILE"
  else
    log "warning: 'cursor' not on PATH; open ${WORKSPACE_FILE} manually"
  fi
fi
