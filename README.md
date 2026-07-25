# Workflow Orchestration MCP Server

[![Node.js 18+](https://img.shields.io/badge/node-18%2B-blue.svg)](https://nodejs.org/en/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-green.svg)](https://modelcontextprotocol.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

**[Docs site](https://m2ux.github.io/workflow-server/)** · **[Setup](setup.md)** · **[API](docs/api-reference.md)** · **[Architecture](docs/architecture.md)** · **[Schemas](schemas/README.md)** · **[Development](docs/development.md)**

---

## What problem does this solve?

AI agents are powerful at coding, but long multi-step work (plan → implement → review → PR) drifts without structure. **Workflow Server** is an [MCP](https://modelcontextprotocol.io/) server that gives agents a **defined path**: discover a workflow, open a session, move through activities, pause at checkpoints for your decisions, and keep session state on disk so you can resume later.

## Who is it for?

- **Operators / integrators** who connect an IDE agent (Cursor, Claude Code, and similar) to structured workflows
- **Workflow authors** who define activities and techniques
- **Contributors** who work on the TypeScript server itself

## What using it looks like

You talk in natural language. The agent follows a bootstrap rule, calls MCP tools, and pauses when it needs you:

```
Start a new work-package workflow for Issue #1000
```

```
Resume the work-package workflow for PR #1000
```

You answer checkpoints (choices the workflow presents). You do not drive tool calls by hand.

### Mental model

```
User goal → Workflow → Activities → Techniques → Tools
```

| Term | Meaning |
|------|---------|
| **Workflow** | End-to-end process (for example implement a feature through merge) |
| **Activity** | Phase inside a workflow (plan, implement, review, …) |
| **Technique** | Markdown capability definition the agent applies at a step |
| **Tool** | MCP operation the agent invokes (`discover`, `start_session`, …) |
| **session_index** | Short id from `start_session`; required on authenticated calls |
| **Checkpoint** | Pause for a user decision before the run continues |

Glossary on the site: [Definitions](https://m2ux.github.io/workflow-server/guide/definitions.html).

## Before you install

- An MCP-capable client (Cursor, Claude Desktop, or compatible)
- Either **Docker** (HTTP path) or **Node.js 18+** and Git (stdio path)
- A **target product repository** you want workflows to operate on
- A GitHub-style **`owner/repo`** string for that project (for `start_session`)

## Which install path should you choose?

| Path | Choose when | Guide |
|------|-------------|--------|
| **Docker / HTTP** | You want the published image; no server source tree required | [http.md](http.md) |
| **stdio** | The IDE should spawn `node dist/index.js` from a local checkout | [stdio.md](stdio.md) |

Shared sequence (both paths): **[setup.md](setup.md)**.

## What gets modified?

| Script / step | Touches |
|---------------|---------|
| **`install.sh`** | Host install dir (default `~/.local/share/workflow-server`): helpers, workflows clone, layout |
| **`deploy.sh`** | **Inside the target product repo**: engineering layout so the project is workflow-compatible |
| **`init-repo.sh`** | **Under the install root only**: checkouts and planning paths for `owner/repo` — does not replace deploy |
| **Workflows** | Definitions live on the `workflows` branch / `$INSTALL/workflows` |
| **Sessions** | Planning folders under the engineering root (see [engineering storage](docs/engineering-storage.md)) |

Do not confuse **install** (server host), **deploy** (prepare the product repo), and **init-repo** (register that repo with the install layout). Details: [setup.md §2](setup.md#2-init-a-target-repo).

## Shortest path to a working first workflow

1. Follow **[setup.md](setup.md)** §1 (pick a transport) and the matching **[http.md](http.md)** or **[stdio.md](stdio.md)** install and MCP client steps.
2. **Deploy** engineering into your product repo, then **init-repo** — [setup.md §2](setup.md#2-init-a-target-repo).
3. Add the always-on bootstrap rule — [docs/ide-setup.md](docs/ide-setup.md).
4. Restart the MCP client. Confirm `discover` then `start_session` with `repo: "owner/repo"` (verify sections in the transport guide and ide-setup).
5. In chat: start a work-package (or other) workflow in plain language.

Illustrated walkthrough: [Getting started](https://m2ux.github.io/workflow-server/guide/getting-started.html).

## How do I know it worked?

- **HTTP:** `/health` ok, `/ready` with `sessionKeyWritable: true`, then MCP smoke in [http.md §4](http.md#4-verify).
- **stdio:** MCP entry connects without spawn errors; smoke in [stdio.md §3](stdio.md#3-verify).
- **Agent:** On a workflow request it calls **`discover` first**, then **`start_session`** including **`repo`**. Listing workflows alone is not enough.
- **Run:** The agent enters a workflow and may present a checkpoint you can answer.

## When it does not work

| Symptom | Where to look |
|---------|----------------|
| Container up but sessions fail | `/ready` / `sessionKeyWritable` — [http.md](http.md) |
| OAuth / `.well-known` 404 noise | Expected without auth — [http.md](http.md) |
| Agent never calls `discover` | Bootstrap rule not loaded — [ide-setup](docs/ide-setup.md) |
| `start_session` / binding errors | Missing `repo`, or skip deploy/init-repo — [setup.md](setup.md) |
| stdio process exits immediately | Need `--workspace` or `--repo`, not install-dir alone — [stdio.md](stdio.md) |

Transport troubleshooting sections expand these cases.

## Deeper reading

| Topic | Document |
|-------|----------|
| Shared install sequence | [setup.md](setup.md) |
| HTTP / Docker | [http.md](http.md) |
| stdio | [stdio.md](stdio.md) |
| Bootstrap rule | [docs/ide-setup.md](docs/ide-setup.md) |
| Tool and HTTP catalog | [docs/api-reference.md](docs/api-reference.md) · [site tools](https://m2ux.github.io/workflow-server/api/tools.html) |
| Architecture models | [docs/architecture.md](docs/architecture.md) |
| Workflow fidelity | [docs/workflow-fidelity.md](docs/workflow-fidelity.md) |
| Authoring (Orchestra, techniques, schemas) | [Specifications hub](https://m2ux.github.io/workflow-server/specifications.html) · [schemas/README.md](schemas/README.md) |
| Engineering storage | [docs/engineering-storage.md](docs/engineering-storage.md) |
| Contribute to the server | [docs/development.md](docs/development.md) |
| How docs are organized | [docs/documentation-system.md](docs/documentation-system.md) |
| Copy-ready Cursor workspace | [examples/cursor-workspace/](examples/cursor-workspace/) |

## License

MIT License — see [LICENSE](LICENSE).
