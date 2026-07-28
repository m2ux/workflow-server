---
name: readme-seed
description: Workflow-authoring planning-folder README seed profile — Progress inventory, classifier vocabulary, and mode-exclusion map for create-readme.
metadata:
  version: 1.0.0
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

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | 01 | Intake and context | Mode, target, edit-surface path | 15-30m | ⬚ |
| 2 | 01 | [Change brief](change-brief.md) | Purpose, dimension shape, open judgements | 20-40m | ⬚ |
| 3 | 01 | [Impact analysis](impact-analysis.md) | Blast radius, integrity, removals | 20-40m | ⊘ |

Initial Status icons are from [Status vocabulary](../../meta/resources/planning-readme.md#status-vocabulary). The impact-analysis row starts cancelled/N/A because only an update run produces it.

## Mode exclusion map

Mode key: `{operation_type}` (`create` | `update` | `review`).

### Create

Leave Progress Status as authored; the impact-analysis row stays cancelled/N/A.

### Update

Flip the impact-analysis row from cancelled/N/A to pending. Leave the other rows as authored.

### Review

The planning-folder README is not seeded on a review run. When one is seeded anyway, set cancelled/N/A on every row a review run does not reach.
