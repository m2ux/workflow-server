# Project Instructions

Project instructions for this repository.

- **Here:** rules that change what an agent does on an ordinary turn. A how-to for one kind of task lives in the doc that task already has.
- A rule that names a path on this machine, or a tool not in `package.json`, belongs here rather than the repo.
- **Edits to *this* file shall be succinct.** State the rule, not the reasoning behind it. Keep an example only where it makes the rule followable.
- When building, testing, or changing a checkout, follow [development.md](docs/development.md).

## Project overview

An MCP server for AI agent workflow orchestration (TypeScript, Node.js 20), driving agents through a **Goal → Workflow → Activities → Techniques → Tools** model. Definitions live on the `workflows` orphan branch, checked out as a worktree; engineering artifacts live in `.engineering/`. See [README.md](README.md) and [setup.md](docs/setup.md).

## Worktrees

- **Work a branch in its own worktree.** `.worktrees/workflows` stays on `workflows`; a feature branch lives at `.worktrees/<branch>`. Switching the shared dest moves the corpus under whatever is reading it — a guard sweep, a coverage walk, another agent — and the result reads as a defect in the change.
- **Name a worktree for its branch in full**, slashes as nested directories: `.worktrees/workflow/353-context-scoped-delivery`. `git worktree list` then reads as a branch index, and a path in a command or a stack trace says which branch it belongs to without anyone inspecting its `HEAD`.
- Provision, rename, and a corpus-only sweep: [guards/README.md](guards/README.md#running-guards-in-a-worktree).

## Dependencies

- **Never delete the lockfile or run `npm update`.** An install-time payload runs before any of this repo's code, so the lockfile is the last point a build can refuse.
- Adding a dependency, exact versions, and the known-bad denylist: [development.md](docs/development.md#dependencies).

Discovery walks `corpus/` and no sibling folder. A `workflow.yaml` at any depth under it is a workflow; a directory holding `techniques/`, `resources/` or `routines/` is a namespace references can name, with or without a definition beside it. The workflow id is the directory name.

Named roots on `workflows`: `corpus/` for definitions (specimens under `corpus/specimens/`), `ledgers/`, `walks/`, and `docs/` for layout authoring. On this tree: `guards/` for check programs, `scripts/` for generate and provision, `benchmark/` for the headless benches. The technique file contract is [docs/technique.md](docs/technique.md).

## Boundaries

- Do **not** modify server source (`src/`, `schemas/`) or workflow YAML unless the user explicitly asks.
- Follow workflow fidelity as the YAML and the workflow-server rules define it. Call `discover` first, then the sequence it returns (`start_session` / `get_workflow` / `next_activity` / `get_activity`). A unique catalog match embeds a child and returns `client` — call `get_workflow` and `next_activity` on that child. A fresh `start_session` carries `working_directory` as the absolute path of the checkout under work, and the server derives `owner/repo` from its origin. Fetch `workflow-server://schemas` to validate definitions. See [setup.md](docs/setup.md).

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

## Testing

- **After code or schema changes:** `npm run typecheck` and `npm run test:ci`. Both pass with no `.worktrees/workflows` checkout, because live-corpus tests skip on a missing or empty root — a local convenience only. `verify.yml` checks the definitions out at `workflows/` and runs the suite against them.
- **After corpus changes:** `npm run check:all`, or `npm run check:delta` for what your change added. Triage a new binding finding in `ledgers/binding-fidelity-triage.json` of the pointed tree as `harmless` / `fix-later` / `live-bug` rather than suppressing it; there is no re-snapshot command.
- **Definition changes land on `workflows`**, taking the artifacts that describe them in the same commit. Walk baselines under `walks/` and triage entries are read against the tree they sit in, so leaving either behind ships a tree that disagrees with itself. Watch a closed binding finding: delete the entry and it is untriaged, keep it and it matches nothing — so it moves with the change that settled it.
- Delivery cost is gated in engine CI. The command and the 1% rule: [benchmark](benchmark/README.md#appendix).

## Where to look

[docs/README.md](docs/README.md) is the index. Work on the engineering branch starts at [its AGENTS.md](https://github.com/m2ux/workflow-server/blob/engineering/AGENTS.md).

<!--
Code intelligence guidance is authored in the workspace AGENTS.md.
It is deliberately absent here: two copies drifted apart on the statistics they quoted and the
skills they listed. `npm run check:agent-homes` fails if a tool run puts it back in AGENTS.md or CLAUDE.md.
-->
