# Harness configuration

Every supported harness uses a single command policy. This is the workspace's
set of rules for deciding whether an agent's requested operation can run
automatically, requires a confirmation decision, must be blocked, or should be
left to the harness's native permissions. It combines an allowlist with checks
on shell commands, sandbox use, web requests, and GitHub operations. Shared
policy code lets each harness apply these rules through its own hooks and
approval system.

Policy functions accept a request and return `deny`, `ask`, `allow`, or `abstain`.
Adapters translate event names, JSON payloads, and decisions into each harness's
native format; Codex delegates confirmation decisions to native approvals.
Python 3.11 or later and the existing Linux bubblewrap launcher are required.

## Shared sources

| Source | Responsibility |
| --- | --- |
| `AGENTS.md` | Workspace instructions; Claude and Cursor use existing links |
| `rules/*.md` | Common rule text; Claude and Cursor use links, Codex receives rendered instructions |
| `skills/` | Skills; `.claude/skills`, `.cursor/skills`, and `.agents/skills` link here |
| `config/permissions.json` | Command patterns, file grants, web domains, MCP servers, and skill grants |
| `config/compound-bash.json` | Additional commands allowed within compound commands |
| `config/curl-allow.json`, `config/webfetch-allow.json` | URL host and path grants |
| `hooks/policy.py` | Decision precedence and classifier composition |
| `hooks/protocol.py`, `hooks/runtime.py` | Reusable event protocol and policy execution |
| `scripts/rendering.py` | Shared rule-text and configuration rendering helpers |
| `.claude/hooks/adapter.py` | Claude event translation and local settings lookup; Cursor uses its native Claude import |
| `.codex/hooks/adapter.py` | Codex event translation and native approval delegation |
| `.claude/scripts/render.py`, `.codex/scripts/render.py` | Harness-specific configuration formats |
| `.codex/scripts/trust.py` | Codex project trust during deployment |
| `.codex/scripts/check_runtime.py` | Inspect native hook discovery, trust, and loaded instructions |
| `scripts/render-harnesses.py` | Discover and run harness configuration renderers |
| `scripts/sbx` | Filesystem and network containment |

Each harness owns real `hooks/` and `scripts/` directories. Their `shared` links
point to `../../hooks` and `../../scripts`. Rules and skills use their existing
links to the root sources. Root implementations contain shared policy and
utilities; harness formats and settings lookup belong to their harness directory.
The root `config/` directory contains configuration data only.

The shell list contains command patterns without harness tool wrappers. A
trailing ` *` permits arguments, interior wildcards match full command text,
and a pattern without wildcards requires an exact match. The shared matcher
also handles command chains, recognized wrappers, and project-local scripts.
Blocking rules run before confirmation rules, which run before approval grants.

Claude user and local settings can extend command grants through the Claude
adapter. Workspace-wide grants belong in `config/permissions.json` so every
harness receives them.

## Render and activate

Workspace deployment calls the renderer. After editing common configuration or
rules in an existing workspace, run:

```bash
python3 scripts/render-harnesses.py
python3 scripts/render-harnesses.py --check
```

These commands render the machine-local files `.claude/settings.json`,
`.codex/config.toml`, and `.codex/hooks.json`. The template under `.claude/`
contains only Claude-specific settings. Local rendering preserves the current
Codex MCP server configuration; a fresh rendering reads `.mcp.json`. Deployment
supplies its resolved MCP configuration through stdin.
Generated files are overwritten on rendering and are gitignored.

Claude registers `.claude/hooks/adapter.py` as its pre-tool handler. Cursor uses its built-in
Claude import; **Include Third-Party Plugins, Skills, and Other Configs** must
be enabled in Cursor Settings → Agents → Third-Party Imports. Its `Shell`
input is accepted by the same adapter. [Cursor compatibility reference](https://prod.cursor.com/docs/reference/third-party-hooks)

Codex registers `.codex/hooks/adapter.py` for both hook events and discovers the
registrations beside its configuration. Start a new session
in the trusted workspace, open `/hooks`, and review and trust both registrations.
Codex tracks trust against each hook definition and skips untrusted hooks.
This applies to clients using the Codex runtime, including CLI and IDE sessions.
Existing sessions retain their loaded configuration. [Codex hook reference](https://learn.chatgpt.com/docs/hooks)

## Native behavior and limits

| Concern | Claude / Cursor import | Codex |
| --- | --- | --- |
| Dynamic shell and required sandbox wrapper | Pre-tool denial | Pre-tool denial |
| Command allowlist | Native Claude grants and shared evaluation | Shared evaluation during `PermissionRequest` |
| GitHub confirmation hazards | Native `ask` response | Context at pre-tool time; no automatic grant at approval time |
| File access | Native file grants | Common directories supplied as sandbox writable roots; native file permissions apply |
| MCP grants | Native Claude server grants | Shared server grants during `PermissionRequest` |
| Skills | Native skill grants and discovery | Native discovery through `.agents/skills` |
| Local curl | Shared host/path classifier | Same classifier |
| Hosted web tools | WebFetch grants where supported | Hosted tools bypass local hooks |

Codex native permissions determine whether a confirmation hazard prompts. The
adapter does not turn that category into a denial. An operation already allowed
by native settings can run without confirmation. Unknown commands also delegate
to native permissions.

Codex approvals use `PermissionRequest`; pre-tool `ask` is unsupported. Keeping
exact and wildcard matching in the shared evaluator avoids broadening exact
grants into native command prefixes. [Codex approval events](https://learn.chatgpt.com/docs/hooks)
[Codex command rules](https://learn.chatgpt.com/docs/agent-configuration/rules)

Harness-managed restrictions, hook trust, and user settings remain authoritative.
Local hook coverage excludes hosted Codex web tools and subsequent input sent to
an already-running terminal session. The shared policy supplies equivalent
decisions where a harness exposes a supported event.

## Validation

```bash
python3 scripts/test-harnesses.py
bash -n scripts/deploy-workspace.sh
python3 scripts/render-harnesses.py --check
python3 .codex/scripts/check_runtime.py
```

Run the suite from a host shell: the containment test launches its own bubblewrap
sandbox. Shared tests live alongside reusable code; adapter tests live in each
harness's `hooks/` and `scripts/` directories. The runner discovers these suites
and runs each in a separate interpreter.

Tests exercise generated hook commands with shell, web, and approval requests;
all permission categories; malformed input; linked worktrees and symlink escapes;
rule rendering and Unicode; deployment in a temporary checkout; and project
trust registration. Command fixtures are evaluated as data. The containment
test verifies filesystem and network restrictions using disposable files and a
local listener. Classifier scripts also accept `--test`; for example, pass
command text on stdin to `hooks/block_dynamic_shell.py --test`.

The Codex runtime check starts a local app-server without a model turn and reads
its hook inventory and effective configuration. It exits unsuccessfully if the
workspace hooks are missing, disabled, or untrusted, or the loaded instructions
and skill link do not match the workspace. Use `--codex /path/to/codex` to check
a particular installation. This requires normal access to Codex's runtime cache.
It neither changes trust nor proves hook execution in an existing conversation.
Live validation requires a session opened in the rendered workspace, trusted
hook registrations, and observed hook decisions on that session's tool calls.
