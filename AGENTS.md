# AGENTS.md

Instructions for AI coding agents working in this repository (Workflow Orchestration MCP Server).

## Project overview

This repo is an **MCP server** for AI agent workflow orchestration (TypeScript, Node.js 18+). Agents discover, navigate, and execute structured workflows via a **Goal → Activity → Skill → Tools** model. Workflow data lives in a `workflows` worktree (orphan branch); engineering artifacts live in `.engineering/`. See [README.md](README.md) for overview and [docs/ide-setup.md](docs/ide-setup.md) for rule setup.

## Setup commands

- **Install:** `npm install`
- **Build:** `npm run build`
- **Run:** `npm start` or `npm run dev`
- **Tests:** `npm test`
- **Typecheck:** `npm run typecheck`
- **Workflow data:** `git worktree add ./workflows workflows` (see [README.md](README.md) and [SETUP.md](SETUP.md)).

## Code and doc style

- TypeScript; follow existing patterns in `src/` and `schemas/`.
- Use clear, professional language; no process attribution in code comments (e.g. “Added by agent”).

## Task management

- Complete **one** task at a time unless the user asks for multiple.
- For multi-step work, use todos and mark them complete as you finish; only one todo in progress at a time.
- Request permission before starting a new task or making changes outside the current request.

## Boundaries

- Do **not** modify server source (`src/`, `schemas/`) or workflow TOON/registry content unless the user explicitly asks.
- When following workflows, respect workflow fidelity as defined in TOON files and the workflow-server rules (fetch `workflow-server://schemas`, call `get_rules`). See [docs/ide-setup.md](docs/ide-setup.md).

## Testing and PR instructions

- After code or schema changes, run `npm run typecheck` and `npm test` before committing.
- Follow the repo’s PR/commit conventions.

## Where to look

- **Quick start, schema, API:** [README.md](README.md), [schemas/README.md](schemas/README.md), [docs/api-reference.md](docs/api-reference.md)
- **IDE/MCP setup:** [docs/ide-setup.md](docs/ide-setup.md), [SETUP.md](SETUP.md)
- **Work in `.engineering/` (artifacts, planning):** [.engineering/AGENTS.md](.engineering/AGENTS.md)
