---
name: workflow-canon
description: "Applies the workflow-server design canon (principles, anti-patterns, conventions, guards) to workflow definitions: workflows, activities, techniques and resources. Use to author a definition or a change to one (\"write a new activity\", \"apply this finding\", \"fix this defect in workflow X\"), audit (\"audit workflow X\", \"does this technique comply\", \"check for anti-patterns\"), or revise this skill (\"update the workflow-canon skill\"). Also for one canon question (\"why is this an anti-pattern?\") and before committing definition changes."
hooks:
  PostToolUse:
    - matcher: "Edit|Write|MultiEdit"
      hooks:
        - type: command
          command: "python3 \"${CLAUDE_PROJECT_DIR}/.claude/skills/workflow-canon/scripts/edit_guard.py\""
---

# Workflow Canon

Workflow Canon locates the canon's homes, enumerates their units, walks them over workflow definitions, and reports. The canon has five homes:

- **[Design Principles][principles]**  The principles a definition is designed to.
- **[Anti-Patterns][anti-patterns]**  The catalog of defects, grouped in families of entries.
- **[Convention Conformance][conventions]**  How a definition compares with its sibling workflows.
- **[Guard suite][guards]**  The registry of mechanical checks.
- **[Schema fields][schemas]**  The fields each definition file kind takes.

[principles]: https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/design-principles.md
[anti-patterns]: https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/anti-patterns.md
[conventions]: https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/convention-conformance.md
[guards]: https://github.com/m2ux/workflow-server/blob/main/guards/guards.ts
[schemas]: https://github.com/m2ux/workflow-server/blob/main/docs/schemas.md

## Terms

- **Unit**
  One heading of a home, at the level the [unit inventory](references/canon-map.md#unit-inventory) names.
- **Entry**
  An anti-pattern unit: its Detect finds the defect, its Do not flag excuses a look-alike, and its Fix closes it.
- **Walk**  Applying each unit to every file on the surface, and recording its status.
- **Change surface**
  The touched files and their closure, as Audit's [Scope](references/audit-mode.md#scope) defines them.

## Modes

Read the file for the mode the request calls for:

- **[Author](references/author-mode.md)**
  - New definitions, and specified changes: a work item, a finding, or a defect with a location
  - Closing a confirmed finding with the Fix its entry states
  - A walk of each draft before it is written, and a check of what the pass wrote
  - Fix findings closed within the pass, and a stop when two entries undo each other
- **[Audit](references/audit-mode.md)**
  - Reviews of existing definitions, entry by entry across the change surface
  - Attribution of each finding to the diff, to the base ref, or to a prior pass
  - Re-derivation of each High before it drives a fix
  - A report, standalone or in the layout a workflow run's guide owns
  - Sub-agent slices for a change surface one pass cannot read, continued until the ledger closes or the user stops
  - Guard candidates for each Detect applied by pattern
- **[Revise](references/revise-mode.md)**
  - To make changes to this skill's own files
  - Conformance with the [skill guidelines](../guidelines.md)

## Homes

- **Links and roots.**
  - Each home's link names its path from its root: the corpus tree for the `workflows` branch, the server checkout for `main`.
  - Read a home on disk, at the commit audited, never from the link.
- **Server checkout.**
  The guards and the schema fields, found with [Find the server checkout](references/commands.md#find-the-server-checkout).
- **Corpus tree.**
  The canon, ledgers, and walk artifacts, a `workflows` worktree found with [Check the corpus tree](references/commands.md#check-the-corpus-tree).

## Dependencies

- **git.**  For the base ref, the diff, and the merge-base a delta run or the edit guard measures against.
- **Node and npm.**  In the server checkout, for the guard suite and the option-coverage walk.
- **Python 3.10+.**  For the [edit guard](references/commands.md#run-the-edit-guard) and its tests.
- **Workspace server checkout.**
  The edit guard runs the corpus guards in `.project/main` of the workspace holding this skill, with the `tsx` installed there.
- **Integration refs.**
  The corpus tree's `origin/workflows` and each `origin/iNN/workflows`, as last fetched. The edit guard measures against the nearest merge-base with them.
- **Claude Code hooks.**
  - Claude Code registers the edit guard when the skill is invoked, and runs it after each edit for the rest of the session. Cursor runs no hook.
  - The hook finds its script under `CLAUDE_PROJECT_DIR`, so the session starts at the workspace root.
- **Corpus worktree.**  For the prose homes, as [Homes](#homes) locates it.
- **The server's AGENTS.md.**
  It owns the check commands, the worktree a run measures, and binding-fidelity triage.
- **workflow-server MCP.**  For fetching a canon section inside a workflow session.
- **Sub-agents.**
  Where the harness has them, for the unread slices of an audit one pass cannot read.

## Rules

- **Homes own the criteria.**
  - Follow each home as its own overview and entries are written. This skill does not restate them.
  - Fetch the section and follow it. Notes taken from a section are not the section.
- **Canon map.**
  Read the [canon map](references/canon-map.md) before the first fetch: how each home is enumerated, and where a judgement already made is recorded.
- **One question.**
  A single question about the canon takes no mode: fetch that entry, answer, and stop.
- **Walks.**  Every walk of the canon's units follows the [walk rules](references/walk-rules.md).
- **Commands.**
  Every spec runs under the shared conventions at the top of [commands.md](references/commands.md).
- **Edit guard.**
  A failure the [edit guard](references/commands.md#run-the-edit-guard) returns after an edit is closed, or stated as unmeasured, before the next edit.
- **Commit gate.**
  A definition change commits only once audited, as [Author](references/author-mode.md#procedure)'s last step states.
