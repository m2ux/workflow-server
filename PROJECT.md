# Project Instructions

Project instructions for this repository.

- **Here:** whatever survives a fresh clone on any machine — setup, boundaries, testing and PR mechanics.
- A rule that names a path on this machine, or a tool not in `package.json`, belongs here rather than the repo.
- **Edits to *this* file shall be succinct.** State the rule, not the reasoning behind it. Keep an example only where it makes the rule followable.
- *Always* follow the [development guide](/docs/development.md).

## Project overview

An MCP server for AI agent workflow orchestration (TypeScript, Node.js 20), driving agents through a **Goal → Workflow → Activities → Techniques → Tools** model. Definitions live on the `workflows` orphan branch, checked out as a worktree; engineering artifacts live in `.engineering/`. See [README.md](README.md) and [setup.md](docs/setup.md).

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
- **Rename by removing and re-adding:** `git worktree remove --force`, `git worktree add` at the new path, then provision.
- **Add the corpus worktree** with `git worktree add .worktrees/workflows workflows`, or let `npm run worktree:provision` do it.
- **Guard a corpus worktree** with `npx tsx guards/check-all.ts --root <path-to-worktree> --corpus-only`. It holds `workflows` alone — no `package.json`, so `worktree:provision` does not apply. Without `--root` the sweep measures `.worktrees/workflows` of the primary checkout.

## Corpus layout

Discovery walks `corpus/` and no sibling folder. A `workflow.yaml` at any depth under it is a workflow; a directory holding `techniques/`, `resources/` or `routines/` is a namespace references can name, with or without a definition beside it. The workflow id is the directory name.

Named roots on `workflows`: `corpus/` for definitions (specimens under `corpus/specimens/`), `ledgers/`, `walks/`, and `docs/` for layout authoring. On this tree: `guards/` for check programs, `scripts/` for generate, provision and the benches. The technique file contract is [docs/technique-protocol-specification.md](docs/technique-protocol-specification.md).

## Boundaries

- Do **not** modify server source (`src/`, `schemas/`) or workflow YAML unless the user explicitly asks.
- Follow workflow fidelity as the YAML and the workflow-server rules define it. Call `discover` first, then the sequence it returns (`start_session` / `get_workflow` / `next_activity` / `get_activity`). A unique catalog match returns `client` — call `get_workflow` and `next_activity` on that child. A fresh `start_session` carries `working_directory` as the absolute path of the checkout under work, and the server derives `owner/repo` from its origin. Fetch `workflow-server://schemas` to validate definitions. See [setup.md](docs/setup.md).

## Issues and PRs

Reference example: [#395](https://github.com/m2ux/workflow-server/issues/395). [#394](https://github.com/m2ux/workflow-server/issues/394) is the same material after conversion. Write to this mandate directly — do not draft in shorthand and translate after.

- **Explain the situation before naming it.** Ordinary sentences first, then the concept's name. Never open with a term of art the reader hasn't been handed.
- **Title:** `Name: plain description`**.** No conventional-commit prefixes, no abbreviations ("references", not "refs"), no anti-pattern numbers, no code tokens unless the token is the subject.
- **No file:line citations in the body.** Evidence reads as prose. Citations, traces and surveys go to `.engineering/artifacts/planning/`, linked once under **Investigation detail**.
- **Spell out jargon.** "Phase 0/1/2" becomes named stages; shorthand like fold-by-reference gets a sentence or a definition on first use. Reference an anti-pattern by name with its meaning stated, so the reference corroborates rather than being required reading.
- **One paragraph per stage, and no section that restates another.** Where a "what was verified" section states what was proved, an acceptance-criteria list repeats it. Cut the prose around the counts, never the counts.
- **Shape:** Summary → what happens today → the fix (named stages) → scope → what was verified → non-goals. Add "why now is cheap", acceptance criteria or investigation detail only where each carries something no other section does.
- **These bodies narrate against what preceded them.** They are the one sanctioned home for before/after; everything persisting past merge stays in positive present tense.
- Prefer replacement over accretion. When updating PR bodies. Don't narrate history. Don't add changes as comments. Replace the body with the version correct today.
- **A pull request lands on `main` or on `workflows`.** Code and definitions sit on separate long-lived branches, so the base is a choice. One aimed anywhere else is a stack: it merges, reads as delivered, and reaches neither branch until its base lands. Check the base before merging, and re-target a stacked request the moment its base merges.
- **A branch is absorbed when its content is on the target, not its commits.** The same change arriving by another route leaves the branch reading as unmerged. `git diff <target> <branch> -- <paths>` settles it; a commit count does not.

## Task management

- Server source (`.project/main/src/`, `.project/main/schemas/`) and workflow YAML change when the request asks for that change.

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
| IDE and MCP setup | [setup.md](docs/setup.md), [stdio.md](docs/stdio.md), [http.md](docs/http.md) |
| Work on the engineering branch | [AGENTS.md](https://github.com/m2ux/workflow-server/blob/engineering/AGENTS.md) |

<!--
Code intelligence guidance is authored in the workspace AGENTS.md.
It is deliberately absent here: two copies drifted apart on the statistics they quoted and the
skills they listed. `npm run check:agent-homes` fails if a tool run puts it back in AGENTS.md or CLAUDE.md.
-->
