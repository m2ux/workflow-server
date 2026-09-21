# AGENTS.md

Instructions for AI coding agents working in this repository (Workflow Orchestration MCP Server).

## Workspace instructions

This project sits in a workspace. Follow the workspace `CLAUDE.md` first and foremost.

## Project overview

An MCP server for AI agent workflow orchestration (TypeScript, Node.js 20), driving agents through a **Goal → Workflow → Activities → Techniques → Tools** model. Definitions live on the `workflows` orphan branch, checked out as a worktree; engineering artifacts live in `.engineering/`. See [README.md](README.md) and [docs/ide-setup.md](docs/ide-setup.md).

## Commands

| Task | Command |
|------|---------|
| Install | `npm ci` |
| Build | `npm run build` |
| Run (stdio, default) | `npm start` / `npm run dev` |
| Run (HTTP) | `npm run start:http` / `npm run dev:http` |
| Test | `npm test` (watch) / `npm run test:ci` (once) |
| Typecheck | `npm run typecheck` |
| Guards | `npm run check:all` / `npm run check:delta` |
| Provision a worktree | `npm run worktree:provision` |

`typecheck` is two compilations and fails on either: `tsconfig.json` over `src/` under the full house style, `tsconfig.tools.json` over guards, tests and scripts under the same strictness with `noPropertyAccessFromIndexSignature` relaxed.

`worktree:provision` runs on the primary checkout, adds `.worktrees/workflows`, and makes `node_modules` resolvable. A nested engine worktree reads that dest.

## Dependencies

Installs resolve from the lockfile. CI and provisioning run `npm ci`; use it locally too, and `npm install` only when deliberately changing a dependency.

- **Never delete the lockfile or run `npm update`.** An install-time payload runs before any of this repo's code, so the lockfile is the last point a build can refuse.
- **New direct dependencies take an exact version.**
- **Known-bad versions** sit in `scripts/known-bad-versions.json`, are held out of resolution by `overrides` in `package.json`, and fail `npm run check:lockfile`. That file says how to refresh it.
- **No blanket `ignore-scripts`** without an allowlist and a green build behind it; native addons need their install hooks.

## Worktrees

- **Work a branch in its own worktree.** `.worktrees/workflows` stays on `workflows`; a feature branch lives at `.worktrees/<branch>`. Switching the shared dest moves the corpus under whatever is reading it — a guard sweep, a coverage walk, another agent — and the result reads as a defect in the change.
- **Name a worktree for its branch in full**, slashes as nested directories: `.worktrees/workflow/353-context-scoped-delivery`. `git worktree list` then reads as a branch index, and a path in a command or a stack trace says which branch it belongs to without anyone inspecting its `HEAD`.
- **Rename by removing and re-adding:** `git worktree remove --force`, `git worktree add` at the new path, then provision. `git worktree move` and plain `remove` both refuse a worktree with submodules checked out, which provisioning is what does — so a rename becomes worth making past the point where they work.
- **Add the corpus worktree** with `git worktree add .worktrees/workflows workflows`, or let `npm run worktree:provision` do it.
- **Guard a corpus worktree** with `npx tsx guards/check-all.ts --root <path-to-worktree> --corpus-only`. It holds `workflows` alone — no `package.json`, so `worktree:provision` does not apply. Without `--root` the sweep measures `.worktrees/workflows` of the primary checkout.

## Corpus layout

Discovery walks `corpus/` and no sibling folder. A `workflow.yaml` at any depth under it is a workflow; a directory holding `techniques/`, `resources/` or `routines/` is a namespace references can name, with or without a definition beside it. The workflow id is the directory name.

Named roots on `workflows`: `corpus/` for definitions (specimens under `corpus/specimens/`), `ledgers/`, `walks/`, and `docs/` for layout authoring. On this tree: `guards/` for check programs, `scripts/` for generate, provision and the benches. The technique file contract is [docs/technique-protocol-specification.md](docs/technique-protocol-specification.md).

## Boundaries

- Do **not** modify server source (`src/`, `schemas/`) or workflow YAML unless the user explicitly asks.
- Follow workflow fidelity as the YAML and the workflow-server rules define it — see [docs/ide-setup.md](docs/ide-setup.md):
  - Call `discover` first, then the sequence it returns: `start_session` / `get_workflow` / `next_activity` / `get_activity`.
  - A unique catalog match returns `client`; call `get_workflow` and `next_activity` on that child.
  - A fresh `start_session` carries `working_directory` as the absolute path of the checkout under work, and the server derives `owner/repo` from its origin.
  - Fetch `workflow-server://schemas` to validate definitions.

## Branches and pull requests

- **A pull request lands on `main` or on `workflows`.** Code and definitions sit on separate long-lived branches, so the base is a choice. One aimed anywhere else is a stack: it merges, reads as delivered, and reaches neither branch until its base lands. Check the base before merging, and re-target a stacked request the moment its base merges.
- **A branch is absorbed when its content is on the target, not its commits.** The same change arriving by another route leaves the branch reading as unmerged. `git diff <target> <branch> -- <paths>` settles it; a commit count does not.

## Testing

- **After code or schema changes:** `npm run typecheck` and `npm test`. Both pass with no `.worktrees/workflows` checkout, because live-corpus tests skip on a missing or empty root — a local convenience only, since `verify.yml` checks the definitions out and runs them.
- **After corpus changes:** `npm run check:all`, or `npm run check:delta` for what your change added. Triage a new binding finding in `ledgers/binding-fidelity-triage.json` of the pointed tree as `harmless` / `fix-later` / `live-bug` rather than suppressing it; there is no re-snapshot command.
- **Definition changes land on `workflows`**, taking the artifacts that describe them in the same commit. Walk baselines under `walks/` and triage entries are read against the tree they sit in, so leaving either behind ships a tree that disagrees with itself. Watch a closed binding finding: delete the entry and it is untriaged, keep it and it matches nothing — so it moves with the change that settled it.
- **Engine CI prices a fixture walk.** Delivery cost belongs to a walk rather than a file, so no guard reads it: `verify.yml` walks `delivery-fixture` against `tests/fixtures/token-benchmark-baseline.json` and fails past 1%. Run it as that job does:

  ```bash
  npm run --silent bench:token -- --workflow=delivery-fixture --fixture-corpus --label=ci --context-mode=fresh --gate --reference=tests/fixtures/token-benchmark-baseline.json
  ```

  `--fixture-corpus` builds that corpus into a temp root: the client workflow is authored under `tests/fixtures/token-bench/`, and the `meta` namespace beside it derives from the lists `src/loaders/core-ops.ts` names, so a ref added there reaches the gate with no fixture to edit.

## Where to look

| For | Read |
|-----|------|
| Quick start, schema, API | [README.md](README.md), [schemas/README.md](schemas/README.md), [docs/api-reference.md](docs/api-reference.md) |
| IDE and MCP setup | [docs/ide-setup.md](docs/ide-setup.md), [setup.md](setup.md), [stdio.md](stdio.md), [http.md](http.md) |
| Live sidecar walks | [.cursor/skills/server-in-the-loop/SKILL.md](.cursor/skills/server-in-the-loop/SKILL.md) |
| Work in `.engineering/` | [.engineering/AGENTS.md](.engineering/AGENTS.md) |

# GitNexus — Code Intelligence

This project is indexed by GitNexus as **workflow-server** (15467 symbols, 21142 relationships, 300 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.



## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run** `gitnexus_detect_changes()` **before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.



## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.



## Resources


| Resource                                         | Use for                                  |
| ------------------------------------------------ | ---------------------------------------- |
| `gitnexus://repo/workflow-server/context`        | Codebase overview, check index freshness |
| `gitnexus://repo/workflow-server/clusters`       | All functional areas                     |
| `gitnexus://repo/workflow-server/processes`      | All execution flows                      |
| `gitnexus://repo/workflow-server/process/{name}` | Step-by-step execution trace             |




## CLI


| Task                                         | Read this skill file                                        |
| -------------------------------------------- | ----------------------------------------------------------- |
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md`       |
| Blast radius / "What breaks if I change X?"  | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?"             | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md`       |
| Rename / extract / split / refactor          | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md`     |
| Tools, resources, schema reference           | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md`           |
| Index, status, clean, wiki CLI commands      | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md`             |



<!-- gitnexus:end -->
