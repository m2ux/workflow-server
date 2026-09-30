---
name: workflow-canon
description: "Applies the workflow-server design canon (principles, anti-patterns, conventions, guards) to workflow definitions. Use to draft, change or audit a workflow, activity, technique or resource, before committing definition changes, or to revise this skill: \"audit workflow X\", \"does this technique comply\", \"check for anti-patterns\", \"why is this an anti-pattern?\""
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

- **[Draft](references/draft-mode.md)**
  - Authoring a definition from scratch
  - A self-check against the units that bind each file kind
- **[Implement](references/implement-mode.md)**
  - A specified change: a work item, a finding, or a defect with a location
  - Closing a confirmed finding with the Fix its entry states
  - A walk of the draft before it is written, and an audit of each touched file after
- **[Audit](references/audit-mode.md)**
  - Reviews of existing definitions, entry by entry across the change surface
  - Attribution of each finding to the diff, to the base ref, or to a prior pass
  - Re-derivation of each High before it drives a fix
  - A report, standalone or in the layout a workflow run's guide owns
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

- **git.**  For the base ref, the diff, and the merge-base a delta run measures against.
- **Node and npm.**  In the server checkout, for the guard suite and the option-coverage walk.
- **Corpus worktree.**  For the prose homes, as [Homes](#homes) locates it.
- **The server's AGENTS.md.**
  It owns the check commands, the worktree a run measures, and binding-fidelity triage.
- **workflow-server MCP.**  For fetching a canon section inside a workflow session.

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
- **Commit gate.**
  A definition change takes an [Audit](references/audit-mode.md) before it commits.
