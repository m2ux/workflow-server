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
#   rules/*.md          the rule text
#   .claude/rules       → ../rules
#   .cursor/rules/*.mdc → ../../rules/<name>.md
#   skills/<name>       → the template skill directory
#   .cursor/skills      → ../skills
#   .claude/skills      → ../skills
#   .agents             → .          (Codex discovers .agents/skills)
#   .mcp.json           canonical MCP document
#   .cursor/mcp.json    → ../.mcp.json
#   .codex/config.toml  generated from that MCP document and the always-apply rules
#   scripts/            hook scripts and sbx, copied from the template
#   config/             hook JSON, copied from the template
#   .claude/hooks       → ../scripts
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
  --force                    Refresh managed files in an existing workspace dir
                             (upserts required MCP servers; keeps any extras;
                             rewrites AGENTS.md from the template)
  --dry-run                  Print actions only
  --open                     Run \`cursor <workspace-file>\` after deploy (if on PATH)
  --skip-mkdir               Do not create .worktrees / planning parents on the checkout
  -h, --help                 Show this help

Required MCP servers written into mcp.json (workflows depend on these):
  concept-rag, atlassian, gitnexus, workflow-server

Shared content (one real file, tool folders are symlinks):
  rules/*.md is the rule text; .claude/rules links at rules/
  .cursor/rules holds one .mdc per rule, linked at rules/<name>.md
  skills/<name> links at the template skill; extra skills already in skills/ stay
  .cursor/skills and .claude/skills link at skills/
  .agents links at the kickoff directory, so Codex finds .agents/skills
  .mcp.json is the MCP document; .cursor/mcp.json links at it
  .codex/config.toml is generated from that document and the always-apply rules

Claude baseline (workspace-local only):
  copies the template's scripts/ (hook scripts and sbx) and config/
  links .claude/hooks → ../scripts
  writes .claude/settings.json from settings.template.json

Written on every deploy, from the template:
  <workspace>/AGENTS.md      workspace instructions for agents
  <workspace>/CLAUDE.md      the same instructions

When the project checkout exists, deploy also writes:
  <checkout>/.agents → the kickoff directory
  <checkout>/.cursor, .claude, .codex → the matching kickoff subdirectory
  <checkout>/AGENTS.md and <checkout>/CLAUDE.md
Both checkout instruction paths are gitignored.
The kickoff path and the checkout are trusted in ~/.codex/config.toml.

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
log "  claude settings   : ${CLAUDE_SETTINGS_TEMPLATE}"

# --- canonical rules and skills, then tool-folder symlinks --------------------
# One real rule file, rules/<name>.md. Claude's rules directory links there.
# Cursor's rules directory holds <name>.mdc, each linked at that file.
# Placeholders expand in the real file only.
if [[ "$DRY_RUN" -eq 1 ]]; then
  log "write canonical rules → ${DEST_DIR}/rules"
  log "symlink .claude/rules → ../rules"
  log "symlink .cursor/rules/*.mdc → ../../rules/<name>.md"
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

  rm -f "${DEST_DIR}/rules"/*.mdc
  if [[ -L "${DEST_DIR}/.cursor/rules" ]]; then
    rm -f "${DEST_DIR}/.cursor/rules"
  fi
  mkdir -p "${DEST_DIR}/.cursor/rules"
  find "${DEST_DIR}/.cursor/rules" -maxdepth 1 -type f -name '*.md' -delete

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

  for md in "${DEST_DIR}/rules"/*.md; do
    [[ -f "$md" && ! -L "$md" ]] || continue
    base="$(basename "$md" .md)"
    ln -sfn "../../rules/${base}.md" "${DEST_DIR}/.cursor/rules/${base}.mdc"
  done
  ensure_symlink "${DEST_DIR}/.claude/rules" "../rules"
  ensure_symlink "${DEST_DIR}/.cursor/skills" "../skills"
  ensure_symlink "${DEST_DIR}/.claude/skills" "../skills"
  ensure_symlink "${DEST_DIR}/.agents" "."
fi

# --- scripts and config — same paths as the template --------------------------
if [[ -d "${TEMPLATE_DIR}/scripts" ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "install scripts → ${DEST_DIR}/scripts"
    log "install config → ${DEST_DIR}/config"
    log "link .claude/hooks → ../scripts"
  else
    mkdir -p "${DEST_DIR}/scripts" "${DEST_DIR}/config" "${DEST_DIR}/.claude"
    find "${DEST_DIR}/scripts" -maxdepth 1 -type f -name '*.py' -delete
    rm -f "${DEST_DIR}/scripts/sbx"
    rm -rf "${DEST_DIR}/scripts/lib" "${DEST_DIR}/scripts/claude" "${DEST_DIR}/hooks"
    cp -a "${TEMPLATE_DIR}/scripts/." "${DEST_DIR}/scripts/"
    rm -f "${DEST_DIR}/scripts/.gitignore"
    find "${DEST_DIR}/scripts" -type d -name '__pycache__' -prune -exec rm -rf {} + 2>/dev/null || true
    find "${DEST_DIR}/scripts" -type f -name '*.pyc' -delete 2>/dev/null || true
    find "${DEST_DIR}/scripts" -maxdepth 1 -type f -name '*.py' -exec chmod a+x {} + 2>/dev/null || true
    if [[ -f "${DEST_DIR}/scripts/sbx" ]]; then
      chmod a+x "${DEST_DIR}/scripts/sbx"
    fi
    rm -rf "${DEST_DIR}/config"
    mkdir -p "${DEST_DIR}/config"
    if [[ -d "${TEMPLATE_DIR}/config" ]]; then
      cp -a "${TEMPLATE_DIR}/config/." "${DEST_DIR}/config/"
    fi
    rm -rf "${DEST_DIR}/.claude/hooks"
    ln -sfn ../scripts "${DEST_DIR}/.claude/hooks"
  fi
else
  log "warning: template scripts/ not found (skipping hooks install): ${TEMPLATE_DIR}/scripts"
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

# .mcp.json is the file. .cursor/mcp.json links to it.
MCP_SRC=""
if [[ -f "${DEST_DIR}/.mcp.json" ]]; then
  MCP_SRC="${DEST_DIR}/.mcp.json"
elif [[ -f "${DEST_DIR}/.cursor/mcp.json" ]]; then
  MCP_SRC="${DEST_DIR}/.cursor/mcp.json"
elif [[ -f "${TEMPLATE_DIR}/.mcp.json" ]]; then
  MCP_SRC="${TEMPLATE_DIR}/.mcp.json"
elif [[ -f "${TEMPLATE_DIR}/.cursor/mcp.json" ]]; then
  MCP_SRC="${TEMPLATE_DIR}/.cursor/mcp.json"
fi

MCP_JSON="$(merge_mcp_json "$MCP_SRC")"
write_file "${DEST_DIR}/.mcp.json" "$MCP_JSON"
if [[ "$DRY_RUN" -eq 1 ]]; then
  log "symlink .cursor/mcp.json → ../.mcp.json"
else
  mkdir -p "${DEST_DIR}/.cursor"
  rm -f "${DEST_DIR}/.cursor/mcp.json"
  ln -sfn ../.mcp.json "${DEST_DIR}/.cursor/mcp.json"
fi

# Codex reads .codex/config.toml. The servers are the mcp.json set just written.
RULES_DIR="${TEMPLATE_DIR}/rules"
if [[ ! -d "$RULES_DIR" ]]; then
  RULES_DIR="${TEMPLATE_DIR}/.claude/rules"
fi
CODEX_TOML="$(
  MCP_JSON="$MCP_JSON" \
  PROJECT_DIR="$PROJECT_DIR" \
  RULES_DIR="$RULES_DIR" \
  DEST_DIR="$DEST_DIR" \
  HOME_DIR="$HOME_DIR" \
  python3 - <<'PY'
import json, os, re, sys

mcp = json.loads(os.environ["MCP_JSON"])
project = os.environ["PROJECT_DIR"]
rules_dir = os.environ.get("RULES_DIR") or ""
workspace = os.environ.get("DEST_DIR", "").rstrip("/")
home = os.environ.get("HOME_DIR", "").rstrip("/")

def toml_str(value: str) -> str:
    escaped = (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t")
    )
    return f'"{escaped}"'

def rule_body(text: str) -> str:
    if not text.startswith("---"):
        return ""
    end = text.find("\n---", 3)
    if end < 0:
        return ""
    front = text[3:end]
    if not re.search(r"(?m)^alwaysApply:\s*true\s*$", front):
        return ""
    lines = text[end + 4 :].strip().splitlines()
    while lines and (not lines[0].strip() or lines[0].startswith("# ")):
        lines.pop(0)
    return "\n".join(lines).strip()

bodies = []
if os.path.isdir(rules_dir):
    names = sorted(n for n in os.listdir(rules_dir) if n.endswith(".md"))
    if "workflow-server.md" in names:
        names.remove("workflow-server.md")
        names.insert(0, "workflow-server.md")
    for name in names:
        with open(os.path.join(rules_dir, name), encoding="utf-8") as handle:
            body = rule_body(handle.read())
        if body:
            if workspace:
                body = body.replace("__WORKSPACE__", workspace)
            if home:
                body = body.replace("__HOME__", home)
            bodies.append(body)

parts = [
    "# Codex project config.",
    "# Skills load from .agents/skills.",
    "# MCP servers are the set written to mcp.json.",
    "# Always-apply rule text is included here.",
    "",
]
if bodies:
    joined = "\n\n".join(bodies).replace('"""', '\\"\\"\\"')
    parts.append('developer_instructions = """')
    parts.append(joined)
    parts.append('"""')
    parts.append("")
parts.append("[sandbox_workspace_write]")
parts.append("writable_roots = [")
parts.append(f"  {toml_str(project)},")
parts.append("]")
parts.append("")

servers = mcp.get("mcpServers") or {}
for name, spec in servers.items():
    if not isinstance(spec, dict):
        continue
    parts.append(f"[mcp_servers.{name}]")
    if isinstance(spec.get("command"), str):
        parts.append(f"command = {toml_str(spec['command'])}")
    args = spec.get("args")
    if isinstance(args, list):
        rendered = ",\n  ".join(toml_str(str(item)) for item in args)
        parts.append(f"args = [\n  {rendered},\n]")
    if isinstance(spec.get("url"), str):
        parts.append(f"url = {toml_str(spec['url'])}")
    env = spec.get("env")
    if isinstance(env, dict) and env:
        parts.append(f"[mcp_servers.{name}.env]")
        for key, value in env.items():
            parts.append(f"{key} = {toml_str(str(value))}")
    parts.append("")

sys.stdout.write("\n".join(parts).rstrip() + "\n")
PY
)"
write_file "${DEST_DIR}/.codex/config.toml" "$CODEX_TOML"

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
# AGENTS.md and CLAUDE.md are the workspace instructions, written on every
# deploy from the template. They name PROJECT.md, which lives in the repository.
AGENTS_SRC="${TEMPLATE_DIR}/AGENTS.md"
AGENTS_MD="${DEST_DIR}/AGENTS.md"
CLAUDE_MD="${DEST_DIR}/CLAUDE.md"
[[ -f "$AGENTS_SRC" ]] || die "template AGENTS.md not found: ${AGENTS_SRC}"

if [[ "$DRY_RUN" -eq 1 ]]; then
  log "write AGENTS.md from ${AGENTS_SRC}"
  log "write CLAUDE.md"
else
  cp -a "$AGENTS_SRC" "$AGENTS_MD"
  ln -sfn AGENTS.md "$CLAUDE_MD"
fi

ensure_symlink "${DEST_DIR}/.cursor/AGENTS.md" "../AGENTS.md"
ensure_symlink "${DEST_DIR}/.claude/CLAUDE.md" "../AGENTS.md"

# The checkout copies are the same instructions. Git ignores both paths.
if [[ -d "$PROJECT_DIR" ]]; then
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "write ${PROJECT_DIR}/AGENTS.md"
    log "write ${PROJECT_DIR}/CLAUDE.md"
    log "link project .agents .cursor .claude .codex at ${DEST_DIR}"
  else
    ln -sfn .cursor/AGENTS.md "${PROJECT_DIR}/AGENTS.md"
    ln -sfn .claude/CLAUDE.md "${PROJECT_DIR}/CLAUDE.md"
    ensure_symlink "${PROJECT_DIR}/.agents" "${DEST_DIR}"
    ensure_symlink "${PROJECT_DIR}/.cursor" "${DEST_DIR}/.cursor"
    ensure_symlink "${PROJECT_DIR}/.claude" "${DEST_DIR}/.claude"
    ensure_symlink "${PROJECT_DIR}/.codex" "${DEST_DIR}/.codex"
  fi
elif [[ "$DRY_RUN" -eq 1 ]]; then
  log "project checkout absent; skip project links: ${PROJECT_DIR}"
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  log "trust ${DEST_DIR} and ${PROJECT_DIR} in ${HOME_DIR}/.codex/config.toml"
else
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
