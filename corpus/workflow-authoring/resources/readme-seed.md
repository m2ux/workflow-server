---
name: readme-seed
description: Workflow-authoring planning-folder README seed profile — Progress inventory, classifier vocabulary, and mode-exclusion map for create-readme.
metadata:
  version: 1.1.0
  order: 22
---

# Workflow Authoring README Seed

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

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Intake and context | Mode, target, edit-surface path | 15-30m | ⬚ |
| 2 | [Change brief](change-brief.md) | Purpose, dimension shape, open judgements | 20-40m | ⬚ |
| 3 | [Impact analysis](impact-analysis.md) | Blast radius, integrity, removals | 20-40m | ⊘ |
| 4 | Scope and draft | Worktree, manifest, per-file drafting | 30-60m | ⬚ |
| 5 | [Scope manifest](scope-manifest.md) | File-level change inventory | 15-30m | ⬚ |
| 6 | Quality review | Criteria walk, consumer surface, guards | 30-60m | ⬚ |
| 7 | [Findings register](findings-register.md) | Audit record, coverage, exclusions | 15-30m | ⬚ |
| 8 | Validate and commit | Scope re-check, commit, pull request | 20-40m | ⬚ |
| 9 | [Close-out](COMPLETE.md) | Delivery, limitations, retrospective | 10-20m | ⬚ |

Initial Status icons are from [Status vocabulary](../../meta/resources/planning-readme.md#status-vocabulary). The impact-analysis row starts cancelled/N/A because only an update run produces it.

## Row ownership

Which activity owns which rows, per [row-ownership map](../../meta/resources/planning-readme.md#row-ownership-map). Values are Item labels.

| @ | Rows |
|---|------|
| 01 | Intake and context · Change brief · Impact analysis |
| 06 | Scope and draft · Scope manifest |
| 08 | Quality review |
| 09 | Findings register · Validate and commit · Close-out |

## Mode exclusion map

Mode key: `{operation_type}` (`create` | `update` | `review`).

### Create

Leave Progress Status as authored; the impact-analysis row stays cancelled/N/A.

### Update

Flip the impact-analysis row from cancelled/N/A to pending. Leave the other rows as authored.

### Review

The planning-folder README is not seeded on a review run. When one is seeded anyway, keep the quality-review and findings-register rows in scope and set cancelled/N/A on every other row — a review run commits nothing and writes no close-out.
