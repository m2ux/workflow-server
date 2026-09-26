# Harness configuration

Claude Code, Cursor, and Codex use one workspace command policy. Policy functions
accept a request and return `deny`, `ask`, `allow`, or `abstain`. Adapters own
event names, JSON payloads, and native approval behavior. Python 3.11 or later
and the existing Linux bubblewrap launcher are required.

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
| `config/rendering.py` | Shared rule-text and configuration rendering helpers |
| `.claude/hooks/adapter.py` | Claude event translation and local settings lookup; Cursor uses its native Claude import |
| `.codex/hooks/adapter.py` | Codex event translation and native approval delegation |
| `.claude/config/render.py`, `.codex/config/render.py` | Harness-specific configuration formats |
| `.codex/config/trust.py` | Codex project trust during deployment |
| `scripts/render-harnesses.py` | Discover and run harness configuration renderers |
| `scripts/sbx` | Filesystem and network containment |

Each harness owns real `hooks/` and `config/` directories. Their `shared` links
point to `../../hooks` and `../../config`. Rules and skills use their existing
links to the root sources. Root implementations contain shared policy and
utilities; harness formats and settings lookup belong to their harness directory.

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
```

Shared tests live alongside reusable code; adapter tests live in each harness's
`hooks/` and `config/` directories. The runner discovers these suites and runs
each in a separate interpreter. The tests cover decision precedence, exact and wildcard command grants,
sandbox redirection, URL scope, native approval delegation, imported Cursor
events, malformed input, and generated configuration drift. Classifier scripts
also accept `--test`; for example, pass command text on stdin to
`hooks/block_dynamic_shell.py --test`.
