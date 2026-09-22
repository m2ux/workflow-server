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
#   🔀 workflows   → …/<repo>/.worktrees/workflows
#   📋 planning    → …/<repo>/.engineering/artifacts/planning
#   🌳 work trees  → …/<repo>/.worktrees
#
# Shared kickoff content has one real file. Tool folders are symlinks to it:
#   rules/*.md          canonical rule (sibling *.mdc → the .md)
#   .cursor/rules       → ../rules
#   .claude/rules       → ../rules
#   skills/<name>       → the template skill directory
#   .cursor/skills      → ../skills
#   .claude/skills      → ../skills
#   .agents             → .          (Codex discovers .agents/skills)
#   .cursor/mcp.json    canonical MCP document
#   .mcp.json           → .cursor/mcp.json
#   .codex/config.toml  generated from that MCP document
#   scripts/claude      → the hooks source (repo or install)
# When the product checkout exists, the project links at the kickoff:
#   .agents → the kickoff directory
#   .cursor .claude .codex → the matching kickoff subdirectory
#
# Usage:
#   ./scripts/deploy-cursor-workspace.sh REPO_NAME [options]
#   ./scripts/deploy-cursor-workspace.sh --repo=REPO_NAME [options]
#
# Needs: bash, cp, mkdir, ln, python3.
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
# Claude hooks tree: repo scripts/claude, or install-dir scripts/claude next to deploy.
if [[ -d "${SCRIPT_DIR}/claude" ]]; then
  CLAUDE_SCRIPTS_DIR="$(cd "${SCRIPT_DIR}/claude" && pwd)"
elif [[ -d "${SCRIPT_DIR}/scripts/claude" ]]; then
  CLAUDE_SCRIPTS_DIR="$(cd "${SCRIPT_DIR}/scripts/claude" && pwd)"
else
  CLAUDE_SCRIPTS_DIR=""
fi

# Paths are built from $HOME (see --home to override).
HOME_DIR="${HOME:-}"
REPO_BASENAME=""
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
Usage: $(basename "$0") REPO_NAME [options]
       $(basename "$0") --repo=REPO_NAME [options]

Deploy examples/cursor-workspace to Cursor's multi-root workspaces dir with
absolute paths under \$HOME/….

Requires a product repo name (checkout basename under the projects root).
No default target — running with no args prints this help.

Required:
  REPO_NAME                  Checkout / workspace name (e.g. workflow-server)
  --repo=NAME                Same as positional REPO_NAME

Options:
  --name=NAME                Cursor workspace folder name (default: same as REPO_NAME)
  --home=PATH                Override \$HOME when building paths (default: \$HOME)
  --projects-root=PATH       Projects root (default: \$HOST_PROJECTS_ROOT or
                             \$HOME/projects/dev)
  --cursor-workspaces=PATH   Parent dir for kickoff folders
                             (default: \$HOME/.local/share/cursor/workspaces)
  --mcp-url=URL              workflow-server HTTP MCP URL written into mcp.json
                             (default: http://127.0.0.1:3000/mcp)
  --template=DIR             Template source (default: examples/cursor-workspace next to
                             this script, or ../examples/cursor-workspace from scripts/)
  --claude-scripts=DIR       Claude hooks source (default: scripts/claude next to this
                             script, or \$INSTALL/scripts/claude)
  --force                    Refresh managed files in an existing workspace dir
                             (upserts required MCP servers; keeps any extras;
                             keeps an existing AGENTS.md / CLAUDE.md)
  --dry-run                  Print actions only
  --open                     Run \`cursor <workspace-file>\` after deploy (if on PATH)
  --skip-mkdir               Do not create .worktrees / planning parents on the checkout
  -h, --help                 Show this help

Required MCP servers written into mcp.json (workflows depend on these):
  concept-rag, atlassian, gitnexus, workflow-server

Shared content (one real file, tool folders are symlinks):
  rules/*.md is the rule; each *.mdc links at that .md
  .cursor/rules and .claude/rules link at rules/
  skills/<name> links at the template skill; extra skills already in skills/ stay
  .cursor/skills and .claude/skills link at skills/
  .agents links at the kickoff directory, so Codex finds .agents/skills
  .cursor/mcp.json is the MCP document; .mcp.json links at it
  .codex/config.toml is generated from that document (Codex reads TOML)
  scripts/claude links at the hooks source

When the product checkout exists, it links at the kickoff:
  .agents → the kickoff directory
  .cursor, .claude, .codex → the matching kickoff subdirectory
  Both the kickoff path and the checkout are trusted in ~/.codex/config.toml

Workspace-owned (written when absent, kept as-is once present):
  AGENTS.md      target-repo notes for agents
  CLAUDE.md, .cursor/AGENTS.md, .claude/CLAUDE.md link at AGENTS.md

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
  $(basename "$0") workflow-server
  $(basename "$0") my-app --open
  $(basename "$0") --repo=workflow-server --force --dry-run
  $(basename "$0") workflow-server --home=\"\$HOME\" --projects-root=\"\$HOME\"/projects/dev
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

# Point dest at target. An existing symlink is retargeted. A real file or
# directory is replaced only with --force.
ensure_symlink() {
  local dest="$1"
  local target="$2"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "symlink ${dest} → ${target}"
    return 0
  fi
  if [[ -L "$dest" ]]; then
    ln -sfn "$target" "$dest"
    return 0
  fi
  if [[ -e "$dest" ]]; then
    if [[ "$FORCE" -ne 1 ]]; then
      log "keep existing path (re-run with --force to replace): ${dest}"
      return 0
    fi
    rm -rf "$dest"
  fi
  mkdir -p "$(dirname "$dest")"
  ln -sfn "$target" "$dest"
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
    --repo=*) REPO_BASENAME="${1#*=}"; shift ;;
    --repo) REPO_BASENAME="${2:?}"; shift 2 ;;
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
    --claude-scripts=*) CLAUDE_SCRIPTS_DIR="${1#*=}"; shift ;;
    --claude-scripts) CLAUDE_SCRIPTS_DIR="${2:?}"; shift 2 ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --open) OPEN_AFTER=1; shift ;;
    --skip-mkdir) SKIP_MKDIR=1; shift ;;
    --github=*|--github)
      die "unknown option: $1 (pass a repo name only, e.g. workflow-server; try --help)"
      ;;
    --*) die "unknown option: $1 (try --help)" ;;
    *)
      if [[ -n "$REPO_BASENAME" ]]; then
        die "unexpected argument: $1 (repo already set to ${REPO_BASENAME})"
      fi
      REPO_BASENAME="$1"
      shift
      ;;
  esac
done

if [[ -z "$REPO_BASENAME" ]]; then
  usage >&2
  die "missing required repo name: pass REPO_NAME or --repo=NAME"
fi
if [[ "$REPO_BASENAME" == */* ]]; then
  die "repo name must be a basename only (got: ${REPO_BASENAME}); do not pass owner/repo"
fi
if [[ ! "$REPO_BASENAME" =~ ^[A-Za-z0-9._-]+$ ]]; then
  die "repo name must be alphanumeric/._- (got: ${REPO_BASENAME})"
fi

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
if [[ -n "$CLAUDE_SCRIPTS_DIR" ]]; then
  CLAUDE_SCRIPTS_DIR="$(normalize_home_path "$CLAUDE_SCRIPTS_DIR")"
fi

if [[ "$PROJECTS_ROOT" != "$HOME_DIR" && "$PROJECTS_ROOT" != "$HOME_DIR"/* ]]; then
  log "note: projects root is outside \$HOME (${HOME_DIR}): ${PROJECTS_ROOT}"
fi

PROJECT_DIR="${PROJECTS_ROOT}/${REPO_BASENAME}"
PLANNING_DIR="${PROJECT_DIR}/.engineering/artifacts/planning"
WORKTREES_DIR="${PROJECT_DIR}/.worktrees"
WORKFLOWS_DIR="${WORKTREES_DIR}/workflows"
DEST_DIR="${CURSOR_WORKSPACES_ROOT}/${WORKSPACE_NAME}"
WORKSPACE_FILE="${DEST_DIR}/${REPO_BASENAME}.code-workspace"
CLAUDE_SETTINGS_TEMPLATE="${TEMPLATE_DIR}/.claude/settings.template.json"
if [[ ! -f "$CLAUDE_SETTINGS_TEMPLATE" ]]; then
  CLAUDE_SETTINGS_TEMPLATE="${TEMPLATE_DIR}/.claude/settings.example.json"
fi

if [[ -e "$DEST_DIR" && "$FORCE" -ne 1 && "$DRY_RUN" -ne 1 ]]; then
  die "destination exists: ${DEST_DIR} (re-run with --force to overwrite managed files)"
fi
if [[ -e "$DEST_DIR" && "$DRY_RUN" -eq 1 && "$FORCE" -ne 1 ]]; then
  log "note: destination exists (would require --force to write): ${DEST_DIR}"
fi

log "Deploy Cursor workspace"
log "  HOME              : ${HOME_DIR}"
log "  repo              : ${REPO_BASENAME}"
log "  template          : ${TEMPLATE_DIR}"
log "  destination       : ${DEST_DIR}"
log "  projects root     : ${PROJECTS_ROOT}"
log "  project           : ${PROJECT_DIR}"
log "  workflows         : ${WORKFLOWS_DIR}"
log "  planning          : ${PLANNING_DIR}"
log "  work trees        : ${WORKTREES_DIR}"
log "  workspace file    : ${WORKSPACE_FILE}"
log "  MCP URL           : ${MCP_URL}"
log "  claude scripts    : ${CLAUDE_SCRIPTS_DIR:-"(none)"}"
log "  claude settings   : ${CLAUDE_SETTINGS_TEMPLATE}"

# --- canonical rules and skills, then tool-folder symlinks --------------------
# One real rule file. Cursor loads .mdc and Claude loads .md, so the .mdc name
# is a symlink to the .md. Placeholders expand in the real file only.
if [[ "$DRY_RUN" -eq 1 ]]; then
  log "write canonical rules → ${DEST_DIR}/rules"
  log "symlink .cursor/rules and .claude/rules → ../rules"
  log "link template skills → ${DEST_DIR}/skills"
  log "symlink .cursor/skills and .claude/skills → ../skills"
  log "symlink .agents → ."
else
  mkdir -p "${DEST_DIR}/rules" "${DEST_DIR}/skills"
  rm -f \
    "${DEST_DIR}/.claude/settings.template.json" \
    "${DEST_DIR}/.claude/settings.example.json"

  if [[ -d "${TEMPLATE_DIR}/.claude/rules" ]]; then
    cp -a "${TEMPLATE_DIR}/.claude/rules/." "${DEST_DIR}/rules/"
  fi
  if [[ -d "${TEMPLATE_DIR}/.cursor/rules" ]]; then
    for mdc in "${TEMPLATE_DIR}/.cursor/rules"/*.mdc; do
      [[ -f "$mdc" ]] || continue
      stem="$(basename "$mdc" .mdc)"
      if [[ ! -f "${DEST_DIR}/rules/${stem}.md" ]]; then
        cp -a "$mdc" "${DEST_DIR}/rules/${stem}.md"
      fi
    done
  fi

  DEST_DIR="$DEST_DIR" HOME_DIR="$HOME_DIR" python3 - <<'PY'
import os, pathlib

workspace = os.environ["DEST_DIR"].rstrip("/")
home = os.environ["HOME_DIR"].rstrip("/")
rules = pathlib.Path(workspace) / "rules"
if rules.is_dir():
    for p in sorted(rules.glob("*.md")):
        if not p.is_file() or p.is_symlink():
            continue
        text = p.read_text(encoding="utf-8")
        new = text.replace("__WORKSPACE__", workspace).replace("__HOME__", home)
        if new != text:
            p.write_text(new, encoding="utf-8")
            print(f"  expanded placeholders: {p.relative_to(workspace)}")
PY

  for md in "${DEST_DIR}/rules"/*.md; do
    [[ -f "$md" && ! -L "$md" ]] || continue
    base="$(basename "$md")"
    ln -sfn "$base" "${DEST_DIR}/rules/${base%.md}.mdc"
  done

  # A template skill links at the checkout that versions it. Skills already in
  # skills/ that the template does not carry stay. A real tool skill directory
  # from an earlier deploy is folded in before that directory becomes a symlink.
  for skills_sub in .cursor/skills .claude/skills; do
    if [[ -d "${TEMPLATE_DIR}/${skills_sub}" ]]; then
      for skill_src in "${TEMPLATE_DIR}/${skills_sub}"/*/; do
        [[ -d "$skill_src" ]] || continue
        skill_name="$(basename "$skill_src")"
        skill_dest="${DEST_DIR}/skills/${skill_name}"
        if [[ -e "$skill_dest" && ! -L "$skill_dest" ]]; then
          rm -rf "$skill_dest"
        fi
        ln -sfn "${skill_src%/}" "$skill_dest"
      done
    fi
    tool_skills="${DEST_DIR}/${skills_sub}"
    if [[ -d "$tool_skills" && ! -L "$tool_skills" ]]; then
      for skill_src in "$tool_skills"/*/; do
        [[ -d "$skill_src" ]] || continue
        skill_name="$(basename "$skill_src")"
        if [[ ! -e "${DEST_DIR}/skills/${skill_name}" ]]; then
          mv "$skill_src" "${DEST_DIR}/skills/${skill_name}"
          log "  kept local skill: ${skill_name}"
        fi
      done
    fi
  done

  agents_dir="${DEST_DIR}/.agents"
  if [[ -d "${agents_dir}/skills" && ! -L "$agents_dir" ]]; then
    for skill_src in "${agents_dir}/skills"/*/; do
      [[ -d "$skill_src" ]] || continue
      skill_name="$(basename "$skill_src")"
      if [[ ! -e "${DEST_DIR}/skills/${skill_name}" ]]; then
        mv "$skill_src" "${DEST_DIR}/skills/${skill_name}"
        log "  kept local skill: ${skill_name}"
      fi
    done
  fi

  ensure_symlink "${DEST_DIR}/.cursor/rules" "../rules"
  ensure_symlink "${DEST_DIR}/.claude/rules" "../rules"
  ensure_symlink "${DEST_DIR}/.cursor/skills" "../skills"
  ensure_symlink "${DEST_DIR}/.claude/skills" "../skills"
  ensure_symlink "${DEST_DIR}/.agents" "."
fi

# --- scripts/claude — one link at the hooks source ---------------------------
if [[ -n "$CLAUDE_SCRIPTS_DIR" && -d "$CLAUDE_SCRIPTS_DIR" ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "symlink scripts/claude → ${CLAUDE_SCRIPTS_DIR}"
  else
    mkdir -p "${DEST_DIR}/scripts"
    ensure_symlink "${DEST_DIR}/scripts/claude" "${CLAUDE_SCRIPTS_DIR}"
  fi
else
  log "warning: claude scripts not found (skipping scripts/claude install)"
  log "         expected scripts/claude next to deploy, or pass --claude-scripts=DIR"
fi

# --- .claude/settings.json (workspace-local; expanded paths) ------------------
if [[ -f "$CLAUDE_SETTINGS_TEMPLATE" ]]; then
  CLAUDE_SETTINGS_JSON="$(
    HOME_DIR="$HOME_DIR" \
    DEST_DIR="$DEST_DIR" \
    TEMPLATE_PATH="$CLAUDE_SETTINGS_TEMPLATE" \
    python3 - <<'PY'
import json, os, re, sys

home = os.environ["HOME_DIR"].rstrip("/")
workspace = os.environ["DEST_DIR"].rstrip("/")
path = os.environ["TEMPLATE_PATH"]

raw = open(path, encoding="utf-8").read()
# Drop JSON-only helper keys if present
try:
    doc = json.loads(raw)
except json.JSONDecodeError as e:
    print(f"error: invalid Claude settings template: {path}: {e}", file=sys.stderr)
    sys.exit(1)

def expand(value: str) -> str:
    if not isinstance(value, str):
        return value
    value = value.replace("__WORKSPACE__", workspace)
    value = value.replace("__HOME__", home)
    value = value.replace("${HOME}", home)
    value = re.sub(r"\$HOME(?![A-Za-z0-9_])", home, value)
    return value

def expand_obj(obj):
    if isinstance(obj, dict):
        return {k: expand_obj(v) for k, v in obj.items() if k != "_comment"}
    if isinstance(obj, list):
        return [expand_obj(v) for v in obj]
    if isinstance(obj, str):
        return expand(obj)
    return obj

doc = expand_obj(doc)
json.dump(doc, sys.stdout, indent=2, ensure_ascii=False)
sys.stdout.write("\n")
PY
  )" || die "failed to render Claude settings from ${CLAUDE_SETTINGS_TEMPLATE}"
  write_file "${DEST_DIR}/.claude/settings.json" "$CLAUDE_SETTINGS_JSON"
else
  log "warning: Claude settings template missing (skipping .claude/settings.json)"
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
    "type": "http",
    "url": url,
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
ensure_symlink "${DEST_DIR}/.mcp.json" ".cursor/mcp.json"

# --- .code-workspace (absolute $HOME paths) -----------------------------------
# shellcheck disable=SC2016
WORKSPACE_JSON=$(
  PROJECT_DIR="$PROJECT_DIR" \
  WORKFLOWS_DIR="$WORKFLOWS_DIR" \
  PLANNING_DIR="$PLANNING_DIR" \
  WORKTREES_DIR="$WORKTREES_DIR" \
  python3 - <<'PY'
import json, os
doc = {
  "folders": [
    {"name": "🏠 workspace", "path": "./"},
    {"name": "📂 project", "path": os.environ["PROJECT_DIR"]},
    {"name": "🔀 workflows", "path": os.environ["WORKFLOWS_DIR"]},
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
# Workspace-owned: seeded on the first deploy, then left alone. The file accrues
# repo-specific instructions an operator or agent wrote for this checkout, so a
# generated copy is only ever a starting point. CLAUDE.md and the tool copies
# are symlinks to that file.
AGENTS_MD="${DEST_DIR}/AGENTS.md"
CLAUDE_MD="${DEST_DIR}/CLAUDE.md"

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

if [[ -e "$AGENTS_MD" || -L "$AGENTS_MD" ]]; then
  log "keep workspace AGENTS.md: ${AGENTS_MD}"
else
  write_file "$AGENTS_MD" "${AGENTS_BODY}"$'\n'
fi

ensure_symlink "$CLAUDE_MD" "AGENTS.md"
ensure_symlink "${DEST_DIR}/.cursor/AGENTS.md" "../AGENTS.md"
ensure_symlink "${DEST_DIR}/.claude/CLAUDE.md" "../AGENTS.md"

# --- Codex config from the same MCP document ---------------------------------
if [[ "$DRY_RUN" -eq 1 ]]; then
  log "write ${DEST_DIR}/.codex/config.toml from .cursor/mcp.json"
  log "trust ${DEST_DIR} and ${PROJECT_DIR} in ${HOME_DIR}/.codex/config.toml"
else
  DEST_DIR="$DEST_DIR" PROJECT_DIR="$PROJECT_DIR" python3 - <<'PY'
import json, os, pathlib

workspace = pathlib.Path(os.environ["DEST_DIR"])
project = os.environ["PROJECT_DIR"]
mcp = json.loads((workspace / ".cursor" / "mcp.json").read_text(encoding="utf-8"))
servers = mcp.get("mcpServers") or {}

def toml_str(value: str) -> str:
    escaped = value.replace("\\", "\\\\").replace('"', '\\"')
    return f'"{escaped}"'

parts = []
for name in ("workflow-server", "concept-rag"):
    path = workspace / "rules" / f"{name}.md"
    if not path.is_file():
        continue
    text = path.read_text(encoding="utf-8")
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            text = text[end + 4 :]
    body = text.strip()
    if body:
        parts.append(body)

lines = ['developer_instructions = """', "\n\n".join(parts), '"""', ""]
lines.append("[sandbox_workspace_write]")
lines.append(f"writable_roots = [{toml_str(project)}]")
lines.append("")
for name, cfg in servers.items():
    lines.append(f"[mcp_servers.{name}]")
    if cfg.get("url"):
        lines.append(f"url = {toml_str(str(cfg['url']))}")
    if cfg.get("command"):
        lines.append(f"command = {toml_str(str(cfg['command']))}")
    args = cfg.get("args") or []
    if args:
        rendered = ", ".join(toml_str(str(arg)) for arg in args)
        lines.append(f"args = [{rendered}]")
    env = cfg.get("env") or {}
    if env:
        lines.append("")
        lines.append(f"[mcp_servers.{name}.env]")
        for key, value in env.items():
            lines.append(f"{key} = {toml_str(str(value))}")
    lines.append("")

out = workspace / ".codex" / "config.toml"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")
print(f"  wrote {out}")
PY

  HOME_DIR="$HOME_DIR" DEST_DIR="$DEST_DIR" PROJECT_DIR="$PROJECT_DIR" python3 - <<'PY'
import os, pathlib

home = pathlib.Path(os.environ["HOME_DIR"])
paths = [os.environ["DEST_DIR"], os.environ["PROJECT_DIR"]]
cfg = home / ".codex" / "config.toml"
cfg.parent.mkdir(parents=True, exist_ok=True)
text = cfg.read_text(encoding="utf-8") if cfg.exists() else ""
for path in paths:
    header = f'[projects."{path}"]'
    if header in text:
        continue
    block = f'{header}\ntrust_level = "trusted"\n'
    text = (text.rstrip() + "\n\n" + block) if text.strip() else block
if not text.endswith("\n"):
    text += "\n"
cfg.write_text(text, encoding="utf-8")
print(f"  trusted Codex projects in {cfg}")
PY
fi

# --- project links at the kickoff artifacts ----------------------------------
if [[ -d "$PROJECT_DIR" ]]; then
  ensure_symlink "${PROJECT_DIR}/.agents" "${DEST_DIR}"
  ensure_symlink "${PROJECT_DIR}/.cursor" "${DEST_DIR}/.cursor"
  ensure_symlink "${PROJECT_DIR}/.claude" "${DEST_DIR}/.claude"
  ensure_symlink "${PROJECT_DIR}/.codex" "${DEST_DIR}/.codex"
elif [[ "$DRY_RUN" -eq 1 ]]; then
  log "project checkout absent; skip project links: ${PROJECT_DIR}"
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
echo "Optional: set GitHub owner/repo in AGENTS.md for start_session."
echo

if [[ "$OPEN_AFTER" -eq 1 ]]; then
  if command -v cursor >/dev/null 2>&1; then
    run cursor "$WORKSPACE_FILE"
  else
    log "warning: 'cursor' not on PATH; open ${WORKSPACE_FILE} manually"
  fi
fi
