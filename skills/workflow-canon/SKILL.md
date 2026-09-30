---
name: workflow-canon
description: "Apply the workflow-server design canon — design principles, the anti-pattern catalog, convention conformance, and the repo guard suite — when authoring or auditing a workflow definition (workflow.yaml, activities/, techniques/, resources/, READMEs). Use for: \"review this workflow\", \"audit workflow X\", \"does this technique comply\", \"check for anti-patterns\", \"is this the right schema construct\", before drafting or editing any definition file, before committing definition changes, and to revise the workflow-canon skill itself. Examples: \"audit workflow-design\", \"review my new activity YAML\", \"why is this rule an anti-pattern?\""
---

# Workflow Canon

Workflow Canon locates the canon's homes, enumerates their units, walks them over workflow definitions, and reports. The canon has five homes:

- **Design Principles**  The principles a definition is designed to.
- **Anti-Patterns**  The catalog of defects, grouped in families of entries.
- **Convention Conformance**  How a definition compares with its sibling workflows.
- **Guard suite**  The registry of mechanical checks.
- **Schema fields**  The fields each definition file kind takes.

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

| Home | Path | Root |
|------|------|------|
| Design Principles | `corpus/canon/resources/design-principles.md` | corpus |
| Anti-Patterns | `corpus/canon/resources/anti-patterns.md` | corpus |
| Convention Conformance | `corpus/canon/resources/convention-conformance.md` | corpus |
| Guard suite | `guards/guards.ts` | server |
| Schema fields | `docs/schemas.md` | server |

- **Server checkout.**
  - Inside the checkout, `git rev-parse --show-toplevel`.
  - From a cursor workspace (`.mcp.json`, `*.code-workspace`, no `package.json`), the checkout is the `project` folder that workspace names.
- **Corpus tree.**
  The canon, ledgers, and walk artifacts live in the corpus tree: a `workflows` worktree at `.worktrees/workflows` unless `WORKFLOWS_DIR` or `--root` names another.
- **Branches.**
  - A schema-reading guard failing on the corpus branch may be reading a field the code branch has not merged. That clears on the code merge.
  - Establish which before recording a corpus defect.
- **Principle citations.**
  Cite a principle by the title its file uses. An anchor that embeds the section ordinal breaks when a principle is inserted ahead of it.
- **Canon map.**
  [Canon map](references/canon-map.md) states how each home is enumerated, and where a judgement already made is recorded. Read it before the first fetch.

## Dependencies

- **git.**  For the base ref, the diff, and the merge-base a delta run measures against.
- **Node and npm.**  In the server checkout, for the guard suite and the option-coverage walk.
- **Corpus worktree.**
  Confirm `corpus/canon/resources/` is present. A fresh clone gains it from [Provision the corpus](references/commands.md#provision-the-corpus). If it is absent, say so.
- **The server's AGENTS.md.**
  It owns the check commands, the worktree a run measures, and binding-fidelity triage.
- **workflow-server MCP.**  For fetching a canon section inside a workflow session.

## Rules

- **Homes own the criteria.**
  - Follow each home as its own overview and entries are written. This skill does not restate them.
  - Fetch the section and follow it. Notes taken from a section are not the section.
- **One question.**
  A single question about the canon takes no mode: fetch that entry, answer, and stop.
- **Walks.**  Every walk of the canon's units follows the [walk rules](references/walk-rules.md).
- **Mechanical checks.**
  Every mode that saves or commits a definition runs the checks in [commands.md](references/commands.md), under its shared conventions.
- **Reports.**
  Bands, severity, row shapes and report layouts are in [Reporting](references/reporting.md).
