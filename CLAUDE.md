# CLAUDE.md

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
- When following workflows, respect workflow fidelity as defined in TOON files and the workflow-server rules (fetch `workflow-server://schemas`, call `start_session`). See [docs/ide-setup.md](docs/ide-setup.md).

## Testing and PR instructions

- After code or schema changes, run `npm run typecheck` and `npm test` before committing.
- Follow the repo’s PR/commit conventions.

## Where to look

- **Quick start, schema, API:** [README.md](README.md), [schemas/README.md](schemas/README.md), [docs/api-reference.md](docs/api-reference.md)
- **IDE/MCP setup:** [docs/ide-setup.md](docs/ide-setup.md), [SETUP.md](SETUP.md)
- **Work in `.engineering/` (artifacts, planning):** [.engineering/AGENTS.md](.engineering/AGENTS.md)

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **workflow-server** (3939 symbols, 4801 relationships, 81 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/workflow-server/context` | Codebase overview, check index freshness |
| `gitnexus://repo/workflow-server/clusters` | All functional areas |
| `gitnexus://repo/workflow-server/processes` | All execution flows |
| `gitnexus://repo/workflow-server/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
