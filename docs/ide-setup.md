# IDE setup

An agent has to be told three things before it can drive a workflow: where the server is, that it must ask the server how to start rather than assuming, and which repository the session is for. Wiring those by hand across a Cursor workspace, a Claude configuration and a set of rule files is fiddly, and the pieces have to agree with each other. So the repository ships a workspace template that installs all of them together.

## Deploying the example workspace

Deploy [`examples/cursor-workspace/`](../examples/cursor-workspace/) with [`scripts/deploy-cursor-workspace.sh`](../scripts/deploy-cursor-workspace.sh); the template's own [README](../examples/cursor-workspace/README.md) covers its flags. The script installs a live layout under `~/.local/share/cursor/workspaces/<name>/`, writing absolute `$HOME/…` paths into the folder list.

### What it wires up

- **The MCP servers** — `workflow-server` reaching `http://127.0.0.1:3000/mcp` through `mcp-remote`, alongside `concept-rag`, `atlassian` and `gitnexus`.
- **The always-applied rule** that sends an agent to `discover` before it does anything else.
- **`AGENTS.md` and `CLAUDE.md`**, the workspace instructions from the template. Checkout notes live in `PROJECT.md`, which deploy leaves in place.
- **The four workspace roots** — the workspace itself, the project, the planning folder and the work trees.

For Claude Code it also installs a workspace-local baseline: hook scripts in `scripts/`, their config in `config/`, `.claude/hooks` linking `scripts/`, the sandbox launcher at `scripts/sbx`, and a rendered `.claude/settings.json`.

### Running the deploy

```bash
# after install.sh (preferred)
~/.local/share/workflow-server/deploy-cursor-workspace.sh my-app
# or from a workflow-server checkout
./scripts/deploy-cursor-workspace.sh my-app
./scripts/deploy-cursor-workspace.sh   # help (repo name required)
# refresh MCP, rules, Claude hooks and settings, keeping extra MCP servers
./scripts/deploy-cursor-workspace.sh my-app --force
```

Then ask the agent to start a workflow. Prefer this to hand-rolling MCP configuration or pasting rules into a single-folder project: the pieces have to agree with one another, and the template is what keeps them agreeing.

### What deploy writes

Everything below lands under `~/.local/share/cursor/workspaces/<name>/`.

| Path | Role |
|------|------|
| `*.code-workspace` | The multi-root folder list, with absolute `$HOME/…` paths |
| `.mcp.json`, `.cursor/mcp.json` | The required MCP servers, home-path tokens expanded. `.cursor/mcp.json` links to `.mcp.json` |
| `.codex/config.toml` | The same MCP servers, the project checkout as a writable root, and the always-apply rule text |
| `rules/`, `.cursor/rules/`, `.claude/rules/` | Rule text in `rules/`. `.claude/rules` links there. Each `.cursor/rules/*.mdc` links to `rules/<name>.md` |
| `.claude/skills/` | The skills the template ships, one directory each; skills added locally stay |
| `AGENTS.md`, `CLAUDE.md` | Workspace instructions from the template, written on every deploy. Checkout notes live in `PROJECT.md`, which deploy leaves in place |
| `scripts/`, `config/` | Hook scripts in `scripts/`, config in `config/`, and the sandbox launcher at `scripts/sbx`. `.claude/hooks` links `scripts/`. Source is [`scripts/claude/`](../scripts/claude/) and [`scripts/sbx`](../scripts/sbx) |
| `.claude/settings.json` | Generated at deploy from [the settings template](../examples/cursor-workspace/.claude/settings.template.json) |

`install.sh` places the deploy script, the workspace template and `scripts/claude/` under the install directory, so deploying a workspace does not need a full checkout.

Deploy expands the `__HOME__` and `__WORKSPACE__` tokens in the template. Re-run it with `--force` after the template or the hooks change. That refresh rewrites `AGENTS.md` from the template. Checkout notes live in `PROJECT.md`, which deploy leaves in place.

## The bootstrap rule

The example workspace carries this rule already, always applied. A hand-maintained client needs the same text:

```
For any start workflow, create work package, or resume work package request, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure. Complete the procedure before any other action.

Pass `session_index` from `start_session` on every authenticated workflow-server call.
```

That is deliberately all of it. `discover` returns the live bootstrap steps — fetch the schema, bind the repository, open the session, load the workflow — so copying the procedure into an IDE rule only creates a second copy to go stale.

## Binding the repository

Every `start_session` call for a fresh session carries `working_directory` as the absolute path of the checkout under work. The server derives `owner/repo` from that checkout's origin remote. `repo` is optional and must equal the derived origin when present. The user, and the workspace `AGENTS.md` or `CLAUDE.md`, are fallbacks only for the cases where the derivation yields nothing — a workspace that is not a git repository, or a checkout with no origin remote. Agents do not special-case the server's own topology.

## Checking that it worked

Open the example workspace, restarting the MCP client if its configuration changed underneath it. Ask the agent to start a work package, or any workflow: it must call `discover` first and then follow the bootstrap it gets back. Confirm that the `start_session` call it makes carries `working_directory` as the checkout under work.

Two further checks are worth making. Asking the agent to list workflows exercises `list_workflows`, which reads the catalogue — useful, though not a substitute for the bootstrap itself. And for Claude in Cursor, confirm that the kickoff directory holds `.claude/settings.json` and `.claude/hooks/` after the deploy.

An agent that skips `discover` has not loaded the rule.

## Where else to look

The install sequence is in [setup.md](../setup.md), whose third section covers the Cursor workspace, and the [template's own README](../examples/cursor-workspace/README.md) goes further into its deploy flags and the Claude baseline. The [hooks layout](../scripts/claude/README.md) is documented beside the hooks themselves. What differs between the two transports is in [http.md](../http.md) and [stdio.md](../stdio.md). Once an agent is connected, the tools available to it — including `context_mode` and `context_tokens` — are catalogued in the [API reference](api-reference.md).
