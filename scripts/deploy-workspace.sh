#!/usr/bin/env bash
# Check out branch workspace as ./<name> in the current directory.
#
#   scripts/deploy-workspace.sh <name>
#   scripts/deploy-workspace.sh --name=<name> [--repo-url=URL]
#
# The checkout carries the kickoff: rules, skills, scripts, config, and the
# tool links. This script leaves those files in place. It renders
# .claude/settings.json and .codex/config.toml, which hold this machine's
# paths. Component worktrees under .project/ are added with
# scripts/add-component.sh. .engineering/ is a submodule created by
# scripts/deploy-engineering.sh, run from this checkout. .project/,
# .engineering/, and .worktrees/ are gitignored.
#
# Needs: git, python3
set -euo pipefail

DEFAULT_REPO_URL="https://github.com/m2ux/workflow-server.git"
DEFAULT_WORKSPACE_BRANCH="workspace"

REPO_URL="${WORKFLOW_SERVER_REPO_URL:-$DEFAULT_REPO_URL}"
CHECKOUT_NAME=""

usage() {
  cat <<EOF
Check out branch workspace as ./<name> in the current directory.
The same name is the code-workspace filename.
Render machine-local Claude settings and Codex config into the checkout.
Leave the committed kickoff links in place. Add component worktrees with
scripts/add-component.sh. Run scripts/deploy-engineering.sh from
this checkout to create the .engineering submodule. This script creates
empty .project/ and .worktrees/ directories and does not add a component.

No default name. Running with no arguments prints this help.

USAGE
  deploy-workspace.sh <name> [options]
  deploy-workspace.sh --name=<name> [options]

OPTIONS
  --name=NAME              Checkout folder and <name>.code-workspace
  --repo-url=URL           Git remote (default: GitHub m2ux)
  -h, --help

LAYOUT
  ./<name>/                           # branch workspace, in the current directory
    <name>.code-workspace             # renamed from the committed workspace file
    rules/ skills/ scripts/ config/   # committed kickoff
    .cursor/rules/*.mdc               # committed links at ../../rules/<name>.md
    .project/<component>/             # gitignored component worktree (add-component.sh)
    .engineering/                     # gitignored submodule (deploy-engineering.sh)
    .worktrees/<slug>/                # gitignored feature worktrees
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

need() {
  command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"
}

is_git_checkout() {
  local dest="$1"
  { [[ -d "${dest}/.git" ]] || [[ -f "${dest}/.git" ]]; } \
    && git -C "${dest}" rev-parse --is-inside-work-tree >/dev/null 2>&1
}

# Branch workspace is the kickoff. Clone it as ./workflow-server in the
# directory this script was started from. A directory that is some other
# branch stops the script.
ensure_workspace_checkout() {
  local branch
  if is_git_checkout "$CHECKOUT_DIR"; then
    branch="$(git -C "$CHECKOUT_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo detached)"
    [[ "$branch" == "$DEFAULT_WORKSPACE_BRANCH" ]] \
      || die "${CHECKOUT_DIR} is ${branch}, not ${DEFAULT_WORKSPACE_BRANCH}"
    echo "Workspace checkout already present: ${CHECKOUT_DIR}"
  elif [[ -e "$CHECKOUT_DIR" ]]; then
    die "${CHECKOUT_DIR} exists and is not a git checkout"
  else
    echo "Cloning ${REPO_URL} (${DEFAULT_WORKSPACE_BRANCH}) → ${CHECKOUT_DIR}"
    git clone -b "$DEFAULT_WORKSPACE_BRANCH" "$REPO_URL" "$CHECKOUT_DIR" \
      || die "failed to clone ${DEFAULT_WORKSPACE_BRANCH}"
  fi
}

# A real file or directory stays. A symlink is retargeted. A missing path is created.
ensure_symlink() {
  local dest="$1" target="$2"
  if [[ -L "$dest" ]]; then
    ln -sfn "$target" "$dest"
    return 0
  fi
  if [[ -e "$dest" ]]; then
    echo "keep existing path: ${dest}"
    return 0
  fi
  mkdir -p "$(dirname "$dest")"
  ln -sfn "$target" "$dest"
}

# Committed kickoff links stay. These files hold this machine's home directory
# and MCP command paths.
render_machine_local() {
  local template="${CHECKOUT_DIR}/.claude/settings.template.json"
  local settings="${CHECKOUT_DIR}/.claude/settings.json"
  local mcp="${CHECKOUT_DIR}/.mcp.json"
  local rules="${CHECKOUT_DIR}/rules"
  local mcp_json

  [[ -n "${HOME:-}" ]] || die "HOME is unset"
  if [[ ! -f "$template" ]]; then
    template="${CHECKOUT_DIR}/.claude/settings.example.json"
  fi
  [[ -f "$template" ]] || die "Claude settings template missing under ${CHECKOUT_DIR}/.claude"
  [[ -f "$mcp" ]] || die "MCP document missing: ${mcp}"

  echo "Rendering Claude settings → ${settings}"
  HOME_DIR="$HOME" DEST_DIR="$CHECKOUT_DIR" TEMPLATE_PATH="$template" python3 - <<'PY' >"$settings"
import json, os, re, sys

home = os.environ["HOME_DIR"].rstrip("/")
workspace = os.environ["DEST_DIR"].rstrip("/")
path = os.environ["TEMPLATE_PATH"]
raw = open(path, encoding="utf-8").read()
try:
    doc = json.loads(raw)
except json.JSONDecodeError as exc:
    print(f"error: invalid Claude settings template: {path}: {exc}", file=sys.stderr)
    sys.exit(1)

def expand(value):
    if not isinstance(value, str):
        return value
    value = value.replace("__WORKSPACE__", workspace)
    value = value.replace("__HOME__", home)
    value = value.replace("${HOME}", home)
    return re.sub(r"\$HOME(?![A-Za-z0-9_])", home, value)

def expand_obj(obj):
    if isinstance(obj, dict):
        return {k: expand_obj(v) for k, v in obj.items() if k != "_comment"}
    if isinstance(obj, list):
        return [expand_obj(v) for v in obj]
    if isinstance(obj, str):
        return expand(obj)
    return obj

json.dump(expand_obj(doc), sys.stdout, indent=2, ensure_ascii=False)
sys.stdout.write("\n")
PY

  local concept_entry concept_index gitnexus_bin node_bin
  concept_entry="${CONCEPT_RAG_ENTRY:-${HOME}/projects/main/concept-rag/dist/conceptual_index.js}"
  concept_index="${CONCEPT_RAG_INDEX:-${HOME}/.concept_rag}"
  if [[ -n "${GITNEXUS_BIN:-}" ]]; then
    gitnexus_bin="$GITNEXUS_BIN"
  elif command -v gitnexus >/dev/null 2>&1; then
    gitnexus_bin="$(command -v gitnexus)"
  else
    gitnexus_bin="/usr/local/bin/gitnexus"
  fi
  if command -v node >/dev/null 2>&1; then
    node_bin="$(command -v node)"
  else
    node_bin="node"
  fi

  echo "Rendering Codex config → ${CHECKOUT_DIR}/.codex/config.toml"
  mcp_json="$(
    MCP_URL="${WORKFLOW_SERVER_MCP_URL:-http://127.0.0.1:3000/mcp}" \
    EXISTING_PATH="$mcp" \
    HOME_DIR="$HOME" \
    CONCEPT_RAG_ENTRY="$concept_entry" \
    CONCEPT_RAG_INDEX="$concept_index" \
    GITNEXUS_BIN="$gitnexus_bin" \
    NODE_BIN="$node_bin" \
    python3 - <<'PY'
import json, os, re, sys

url = os.environ["MCP_URL"]
path = os.environ.get("EXISTING_PATH") or ""
home_dir = os.environ["HOME_DIR"].rstrip("/")
concept_entry = os.environ["CONCEPT_RAG_ENTRY"]
concept_index = os.environ["CONCEPT_RAG_INDEX"]
gitnexus_bin = os.environ["GITNEXUS_BIN"]
node_bin = os.environ["NODE_BIN"]

def expand(value):
    if not isinstance(value, str):
        return value
    value = value.replace("__USER_HOME__", home_dir)
    value = value.replace("${USER_HOME}", home_dir)
    value = value.replace("$USER_HOME", home_dir)
    value = value.replace("${HOME}", home_dir)
    value = re.sub(r"\$HOME(?![A-Za-z0-9_])", home_dir, value)
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

def load_mcp(path):
    if not path or not os.path.isfile(path):
        return {"mcpServers": {}}
    try:
        raw = open(path, encoding="utf-8").read()
        raw = re.sub(r",\s*([}\]])", r"\1", raw)
        loaded = json.loads(raw)
        if isinstance(loaded, dict) and isinstance(loaded.get("mcpServers"), dict):
            return loaded
    except (OSError, json.JSONDecodeError):
        pass
    return {"mcpServers": {}}

doc = load_mcp(path)
servers = doc.setdefault("mcpServers", {})
servers["concept-rag"] = {"command": node_bin, "args": [concept_entry, concept_index]}
servers["atlassian"] = {"command": "npx", "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/sse"]}
servers["gitnexus"] = {"command": node_bin, "args": [gitnexus_bin, "mcp"]}
servers["workflow-server"] = {"type": "http", "url": url}
doc = expand_obj(doc)
servers = doc.setdefault("mcpServers", {})
ordered = {}
for key in ("concept-rag", "atlassian", "gitnexus", "workflow-server"):
    if key in servers:
        ordered[key] = servers.pop(key)
for key in sorted(servers):
    ordered[key] = servers[key]
doc["mcpServers"] = ordered
json.dump(doc, sys.stdout, ensure_ascii=False)
PY
  )"

  mkdir -p "${CHECKOUT_DIR}/.codex"
  MCP_JSON="$mcp_json" RULES_DIR="$rules" \
    DEST_DIR="$CHECKOUT_DIR" HOME_DIR="$HOME" python3 - <<'PY' >"${CHECKOUT_DIR}/.codex/config.toml"
import json, os, re, sys

mcp = json.loads(os.environ["MCP_JSON"])
rules_dir = os.environ.get("RULES_DIR") or ""
workspace = os.environ.get("DEST_DIR", "").rstrip("/")
home = os.environ.get("HOME_DIR", "").rstrip("/")

def toml_str(value):
    escaped = (
        value.replace("\\", "\\\\")
        .replace('"', '\\"')
        .replace("\n", "\\n")
        .replace("\r", "\\r")
        .replace("\t", "\\t")
    )
    return f'"{escaped}"'

def rule_body(text):
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
parts.append(f"  {toml_str(workspace)},")
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

  HOME_DIR="$HOME" DEST_DIR="$CHECKOUT_DIR" python3 - <<'PY'
import os, pathlib

home = pathlib.Path(os.environ["HOME_DIR"])
paths = [os.environ["DEST_DIR"]]
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
}

if [[ $# -eq 0 ]]; then
  usage
  exit 0
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --name=*)
      CHECKOUT_NAME="${1#*=}"
      shift
      ;;
    --name)
      CHECKOUT_NAME="${2:?}"
      shift 2
      ;;
    --repo-url=*)
      REPO_URL="${1#*=}"
      shift
      ;;
    --repo-url)
      REPO_URL="${2:?}"
      shift 2
      ;;
    --*)
      die "unknown option: $1 (see --help)"
      ;;
    *)
      if [[ -n "$CHECKOUT_NAME" ]]; then
        die "unexpected argument: $1 (name already set to ${CHECKOUT_NAME})"
      fi
      CHECKOUT_NAME="$1"
      shift
      ;;
  esac
done

if [[ -z "$CHECKOUT_NAME" ]]; then
  usage >&2
  die "missing name: pass <name> or --name=NAME"
fi
if [[ ! "$CHECKOUT_NAME" =~ ^[A-Za-z0-9._-]+$ ]]; then
  die "name must be alphanumeric/._- (got: ${CHECKOUT_NAME})"
fi

need git
need python3

RUN_ROOT="$(pwd)"
CHECKOUT_DIR="${RUN_ROOT}/${CHECKOUT_NAME}"

echo "Workspace checkout: ${CHECKOUT_DIR}"

ensure_workspace_checkout

WORKSPACE_FILE="${CHECKOUT_DIR}/${CHECKOUT_NAME}.code-workspace"
mapfile -t WORKSPACE_FILES < <(find "$CHECKOUT_DIR" -maxdepth 1 -name '*.code-workspace' -print)
if [[ ! -f "$WORKSPACE_FILE" || ${#WORKSPACE_FILES[@]} -ne 1 ]]; then
  [[ ${#WORKSPACE_FILES[@]} -eq 1 ]] \
    || die "expected one *.code-workspace in ${CHECKOUT_DIR}"
  echo "Naming workspace file → ${WORKSPACE_FILE}"
  mv "${WORKSPACE_FILES[0]}" "$WORKSPACE_FILE"
fi

mkdir -p "${CHECKOUT_DIR}/.project"
if [[ ! -d "${CHECKOUT_DIR}/.worktrees" ]]; then
  echo "Creating feature worktrees dir → ${CHECKOUT_DIR}/.worktrees"
  mkdir -p "${CHECKOUT_DIR}/.worktrees"
fi
[[ -f "${CHECKOUT_DIR}/scripts/bump-project.sh" ]] \
  || die "bump-project.sh missing: ${CHECKOUT_DIR}/scripts/bump-project.sh"
echo "Making bump-project.sh executable → ${CHECKOUT_DIR}/scripts/bump-project.sh"
chmod +x "${CHECKOUT_DIR}/scripts/bump-project.sh"

render_machine_local

echo
echo "Workspace ready."
echo "  Checkout     : ${CHECKOUT_DIR}  (branch ${DEFAULT_WORKSPACE_BRANCH})"
echo "  Workspace    : ${CHECKOUT_DIR}/${CHECKOUT_NAME}.code-workspace"
echo "  Worktrees    : ${CHECKOUT_DIR}/.worktrees/"
echo
echo "Kickoff files and tool links come from the workspace branch."
echo "Machine-local files are .claude/settings.json and .codex/config.toml in the checkout."
echo
echo "Add a component worktree with:"
echo "  ${CHECKOUT_DIR}/scripts/add-component.sh <repo> <branch> <name> [display-name]"
echo "Fast-forward component worktrees with:"
echo "  ${CHECKOUT_DIR}/scripts/bump-project.sh"
