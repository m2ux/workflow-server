---
name: readme-seed
description: Workflow-design planning-folder README seed profile — Progress inventory, classifier vocabulary, and mode-exclusion map for create-readme.
metadata:
  version: 1.0.0
---

# Workflow-Design README Seed

Fill data for [create-readme](../../meta/techniques/workflow-engine/create-readme.md). Layout and policy live in [Planning Folder README Guide](../../meta/resources/planning-readme.md) ([Template](../../meta/resources/planning-readme.md#template)).

## Classifier

Header-line kind labels: `Create`, `Update`, `Review`.

Lifecycle **Status** values: `Planning`, `Drafting`, `Reviewing`, `Complete`.

## Links defaults

| Resource | Link shape |
|----------|------------|
| Target workflow | `workflows/[workflow-id]/` |
| Related workflow | `[name](../../[related]/README.md)` |
| PR | `[#N](https://{repo_host}/{org}/{repo}/pull/N)` |

## Progress inventory

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Intake and context | Target, mode, planning folder | 15-30m | ⬚ |
| 2 | 01 | [Format conventions](format-conventions.md) | Authoring literacy notes | 5-10m | ⬚ |
| 3 | 03 | [Design specification](design-specification.md) | Change goals and constraints | 20-40m | ⬚ |
| 4 | 03 | [Assumptions log](assumptions-log.md) | Open and settled assumptions | 10-15m | ⬚ |
| 5 | 04 | [Pattern analysis](pattern-analysis.md) | Applicable patterns and practices | 20-40m | ⬚ |
| 6 | 05 | [Impact analysis](impact-analysis.md) | Blast radius and preservations | 20-40m | ⬚ |
| 7 | 06 | [Scope manifest](scope-manifest.md) | File-level change inventory | 15-30m | ⬚ |
| 8 | 06 | [Drafting plan](drafting-plan.md) | Draft order and blocks | 10-20m | ⬚ |
| 9 | 06 | [Draft attestation](draft-attestation.md) | Batch review attestation | 5-10m | ⬚ |
| 10 | 06 | [File review note](file-review-note.md) | Removals and draft highlights | 5-10m | ⬚ |
| 11 | 08 | Quality review | Principle and anti-pattern audits | 30-60m | ⬚ |
| 12 | 08 | [Principle findings](principle-findings.md) | Principles audit satellite | 10-20m | ⬚ |
| 13 | 08 | [Anti-pattern findings](anti-pattern-findings.md) | Anti-pattern audit satellite | 10-20m | ⬚ |
| 14 | 09 | Validate and commit | Schema check, commit, PR | 20-40m | ⬚ |
| 15 | 10 | Post-update review | Follow-up after merge path | 15-30m | ⊘ |
| 16 | 11 | Retrospective | Session close-out | 15-30m | ⬚ |
| 17 | 11 | [Close-out (COMPLETE.md)](COMPLETE.md) | Deliverables and limitations | 10-20m | ⬚ |

Initial Status icons are from [Status vocabulary](../../meta/resources/planning-readme.md#status-vocabulary). Post-update review starts as cancelled/N/A outside update-mode seeds.

## Mode exclusion map

Mode key: `{operation_type}` (`create` | `update` | `review`).

### Create (`operation_type` == `create`)

Leave Progress Status as authored. Keep `@` `10` (post-update review) cancelled/N/A.

### Update (`operation_type` == `update`)

Flip `@` `10` Item post-update from cancelled/N/A to pending. Leave other rows as authored.

### Review (`operation_type` == `review`)

Planning-folder README is typically not seeded (intake skips create-readme). When seeded, set cancelled/N/A on draft/create-only artifact rows that the review path does not run; keep quality-review and validate rows in scope.
