# AGENTS.md

Instructions for AI coding agents working in this repository (Workflow Orchestration MCP Server).

## Project overview

This repo is an **MCP server** for AI agent workflow orchestration (TypeScript, Node.js 18+). Agents discover, navigate, and execute structured workflows via a **Goal → Workflow → Activities → Techniques → Tools** model. Workflow data lives in a `workflows` worktree (orphan branch); engineering artifacts live in `.engineering/`. See [README.md](README.md) for overview and [docs/ide-setup.md](docs/ide-setup.md) for rule setup.

## Setup commands

- **Install:** `npm install`
- **Build:** `npm run build`
- **Run (stdio, default):** `npm start` or `npm run dev`
- **Run (HTTP):** `npm run start:http` or `npm run dev:http`
- **Tests:** `npm test` (watch) / `npm run test:ci` (single run)
- **Typecheck:** `npm run typecheck`
- **Guards:** `npm run check:all` (every guard, one table) / `npm run check:delta` (only what your change added, against the merge-base)
- **Guarding a corpus worktree:** `npx tsx scripts/check-all.ts --root <path-to-worktree> --corpus-only`. A worktree of the corpus is a checkout of `workflows` alone — no `package.json`, so `worktree:provision` does not apply to it — and a run without `--root` measures `workflows/` in this checkout and reports the edits clean without ever reading them.
- **Work a branch in its own worktree.** The checkout at `workflows/` stays on the `workflows` branch, and a feature branch lives under `.worktrees/`. Switching the shared checkout moves the corpus under anything reading it — a guard sweep, a coverage walk, another agent — and the result is wrong in a way that reads as a defect in the change.
- **Worktree setup:** `npm run worktree:provision` — checks out the submodules and makes `node_modules` resolvable, so guards and tests measure the worktree you are editing
- **A worktree is named for the branch it holds.** `.worktrees/workflow/353-context-scoped-delivery` holds `workflow/353-context-scoped-delivery` — the branch name in full, slashes and all, as nested directories. `git worktree list` then reads as a branch index, and a path in a command or a stack trace says which branch it belongs to without anyone inspecting its `HEAD`. Rename with `git worktree move`, which fixes the administrative files a `mv` leaves dangling.
- **Workflow data:** `git worktree add ./workflows workflows` (see [README.md](README.md), [setup.md](setup.md), [stdio.md](stdio.md), [http.md](http.md)).

## Boundaries

- Do **not** modify server source (`src/`, `schemas/`) or workflow YAML files unless the user explicitly asks.
- When following workflows, respect workflow fidelity as defined in YAML files and the workflow-server rules: call `discover` first to learn the bootstrap procedure, then follow the returned sequence (`list_workflows` / `start_session` / `get_workflow` / `next_activity` / `get_activity`). Fetch the `workflow-server://schemas` MCP resource when you need to validate workflow definitions. See [docs/ide-setup.md](docs/ide-setup.md).

## Testing

- After code or schema changes, run `npm run typecheck` and `npm test` before committing.
- After workflow-corpus changes, run `npm run check:all`. To see only what your change added, run `npm run check:delta`. Corpus debt is triaged per finding in `scripts/binding-fidelity-triage.json` — classify a new finding there (`harmless` / `fix-later` / `live-bug`) rather than suppressing it; there is no re-snapshot command.

## Where to look

- **Quick start, schema, API:** [README.md](README.md), [schemas/README.md](schemas/README.md), [docs/api-reference.md](docs/api-reference.md)
- **IDE/MCP setup:** [docs/ide-setup.md](docs/ide-setup.md), [setup.md](setup.md), [stdio.md](stdio.md), [http.md](http.md)
- **Work in `.engineering/` (artifacts, planning):** [.engineering/AGENTS.md](.engineering/AGENTS.md)

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **workflow-server** (15467 symbols, 21142 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

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
