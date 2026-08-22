# Workflow Server IDE Setup

An agent has to be told three things before it can drive a workflow: where the server is, that it must ask the server how to start rather than assuming, and which repository the session is for. Wiring those by hand across a Cursor workspace, a Claude configuration and a set of rule files is fiddly, and the pieces have to agree with each other. So the repository ships a workspace template that installs all of them together.

## Deploying the example workspace

Deploy [`examples/cursor-workspace/`](../examples/cursor-workspace/) with [`scripts/deploy-cursor-workspace.sh`](../scripts/deploy-cursor-workspace.sh); the template's own [README](../examples/cursor-workspace/README.md) covers its flags. The script installs a live layout under `~/.local/share/cursor/workspaces/<name>/`, writing absolute `$HOME/…` paths into the folder list.

It wires up four things. The MCP servers, with `workflow-server` reaching `http://127.0.0.1:3000/mcp` through `mcp-remote`, alongside `concept-rag`, `atlassian` and `gitnexus`. The always-applied rule that sends an agent to `discover` before it does anything else. The `AGENTS.md` and `CLAUDE.md` files carrying the checkout basename and the `owner/repo` a session binds to. And the four workspace roots: the workspace itself, the project, the planning folder and the work trees. For Claude Code it also installs a workspace-local baseline — the hooks under `scripts/claude/`, and a rendered `.claude/settings.json`.

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
| `.cursor/mcp.json`, `.mcp.json` | The required MCP servers, home-path tokens expanded |
| `.cursor/rules/`, `.claude/rules/` | The bootstrap rule and its companions |
| `.claude/skills/` | The skills the template ships, one directory each; skills added locally stay |
| `AGENTS.md`, `CLAUDE.md` | The target checkout and an `owner/repo` placeholder, seeded when absent and workspace-owned after that |
| `scripts/claude/` | Portable hooks and the sandbox wrapper, from the repository's own [`scripts/claude/`](../scripts/claude/) |
| `.claude/settings.json` | Generated at deploy from [the settings template](../examples/cursor-workspace/.claude/settings.template.json) |

`install.sh` places the deploy script, the workspace template and `scripts/claude/` under the install directory, so deploying a workspace does not need a full checkout.

Deploy expands the `__HOME__` and `__WORKSPACE__` tokens in the template. Re-run it with `--force` after the template or the hooks change; `AGENTS.md` and `CLAUDE.md` survive that refresh, so edits describing the target repository stay put.

## The bootstrap rule

The example workspace carries this rule already, always applied. A hand-maintained client needs the same text:

```
For any start workflow, create work package, or resume work package request, call the `discover` tool on the workflow-server MCP server to learn the bootstrap procedure. Complete the procedure before any other action.

Pass `session_index` from `start_session` on every authenticated workflow-server call.
```

That is deliberately all of it. `discover` returns the live bootstrap steps — fetch the schema, bind the repository, open the session, load the workflow — so copying the procedure into an IDE rule only creates a second copy to go stale.

## Binding the repository

Every `start_session` call carries `repo: "owner/repo"`, and an agent derives that from git rather than from configuration: it is the origin remote of the outermost superproject that claims the workspace checkout. The user, and the workspace `AGENTS.md` or `CLAUDE.md`, are fallbacks only for the cases where the derivation yields nothing — a workspace that is not a git repository, or a host with no origin remote. Agents do not special-case the server's own topology.

## Checking that it worked

Open the example workspace, restarting the MCP client if its configuration changed underneath it. Ask the agent to start a work package, or any workflow: it must call `discover` first and then follow the bootstrap it gets back. Confirm that the `start_session` call it makes carries `repo: "owner/repo"`.

Two further checks are worth making. Asking the agent to list workflows exercises `list_workflows`, which reads the catalogue — useful, though not a substitute for the bootstrap itself. And for Claude in Cursor, confirm that the kickoff directory holds `.claude/settings.json` and `scripts/claude/hooks/` after the deploy.

An agent that skips `discover` has not loaded the rule.

## Where else to look

The install sequence is in [setup.md](../setup.md), whose third section covers the Cursor workspace, and the [template's own README](../examples/cursor-workspace/README.md) goes further into its deploy flags and the Claude baseline. The [hooks layout](../scripts/claude/README.md) is documented beside the hooks themselves. What differs between the two transports is in [http.md](../http.md) and [stdio.md](../stdio.md). Once an agent is connected, the tools available to it — including `context_mode` and `context_tokens` — are catalogued in the [API reference](api-reference.md).
