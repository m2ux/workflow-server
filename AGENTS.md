# Project Instructions

Project instructions for this repository.

- **Here:** rules that change what an agent does on an ordinary turn. A how-to for one kind of task lives in the doc that task already has.
- A rule that names a path on this machine, or a tool not in `package.json`, belongs here rather than the repo.
- **Edits to *this* file shall be succinct.** State the rule, not the reasoning behind it. Keep an example only where it makes the rule followable.
- When building, testing, or changing a checkout, follow [development.md](docs/development.md).

## Worktrees

- **Work a branch in its own worktree.** `.worktrees/workflows` stays on `workflows`; a feature branch lives at `.worktrees/<branch>`. Switching the shared dest moves the corpus under whatever is reading it — a guard sweep, a coverage walk, another agent — and the result reads as a defect in the change.
- **Name a worktree for its branch in full**, slashes as nested directories: `.worktrees/workflow/353-context-scoped-delivery`. `git worktree list` then reads as a branch index, and a path in a command or a stack trace says which branch it belongs to without anyone inspecting its `HEAD`.
- Provision, rename, and a corpus-only sweep: [guards/README.md](guards/README.md#running-guards-in-a-worktree).



## Dependencies

- **Never delete the lockfile or run** `npm update`**.** An install-time payload runs before any of this repo's code, so the lockfile is the last point a build can refuse.
- Adding a dependency, exact versions, and the known-bad denylist: [development.md](docs/development.md#dependencies).



## Boundaries

- Do **not** modify server source (`src/`, `schemas/`) or workflow YAML unless the user explicitly asks.
- Call `discover` first and follow what it returns. A fresh `start_session` passes `working_directory` as the checkout under work. The rest of the sequence is [setup](docs/setup.md).



## Issues and PRs

- **Shape:** See the reference example: [#394](https://github.com/m2ux/workflow-server/issues/394)
- **Explain the situation before naming it.** Ordinary sentences first, then the concept's name. Never open with a term of art the reader hasn't been handed.
- **Title:** `Name: plain description`**.** No conventional-commit prefixes, no abbreviations ("references", not "refs"), no anti-pattern numbers, no code tokens unless the token is the subject.
- **No file:line citations in the body.** Evidence reads as prose.
- **Spell out jargon.** "Phase 0/1/2" becomes named stages; shorthand like fold-by-reference gets a sentence or a definition on first use. Reference an anti-pattern by name with its meaning stated, so the reference corroborates rather than being required reading.
- **One paragraph per stage, and no section that restates another.** Where a "what was verified" section states what was proved, an acceptance-criteria list repeats it. Cut the prose around the counts, never the counts.
- **These bodies narrate against what preceded them.** They are the one sanctioned home for before/after; everything persisting past merge stays in positive present tense.
- Prefer replacement over accretion. When updating PR bodies. Don't narrate history. Don't add changes as comments. Replace the body with the version correct today.
- **A pull request lands on** `main` **or on** `workflows`**.** Code and definitions sit on separate long-lived branches, so the base is a choice. One aimed anywhere else is a stack: it merges, reads as delivered, and reaches neither branch until its base lands. Check the base before merging, and re-target a stacked request the moment its base merges.
- **A branch is absorbed when its content is on the target, not its commits.** The same change arriving by another route leaves the branch reading as unmerged. `git diff <target> <branch> -- <paths>` settles it; a commit count does not.



## Testing

Commands, what CI runs, and how a walk is re-baselined: [development](docs/development.md). Delivery cost: [benchmark](benchmark/README.md#appendix).

- **Definition changes land on** `workflows`, with the walk baselines and triage entries that describe them, in the same commit. A closed binding finding moves with the change that settled it: delete it and it is untriaged, keep it and it matches nothing.



## Where to look

[docs/README.md](docs/README.md) is the index. Open the page for the task. 

A **workflow** is the guide an operator follows. An **activity** is one phase of it. A **technique** is one capability a step names. A **routine** is steps written once and spliced in. A **resource** is material a technique cites and does not contain.

Engineering work starts at [its AGENTS.md](https://github.com/m2ux/workflow-server/blob/engineering/AGENTS.md).