# Workflow Authoring Workflow

> v1.0.0 — Guides agents through creating, updating, or reviewing workflow definitions. Intent is derived from the request first, so a gate is presented only where a real gap remains; `{headless_mode}` defaults to true, and a checkpoint declaring neither a default option nor an auto-advance interval always waits for a person. Create and update runs edit inside a dedicated `{target_path}` worktree.

---

## Overview

Activity `#` columns match the on-disk `NN-` file prefixes; the prefix is server-computed from the filename and orders both activities and the artifacts they produce, so gaps are intentional and renumbering is not free.

| # | Activity | Mode | Purpose |
|---|----------|------|---------|
| 01 | [**Intake and Context**](./activities/README.md#01-intake-and-context) | All | Classify create/update/review, name the target, derive the edit surface, produce the change brief and approve inventoried removals |
| 06 | [**Scope and Draft**](./activities/README.md#06-scope-and-draft) | Create, Update | Prepare the edit worktree, enumerate and confirm the file manifest, author every file it names, align the target README and the planning artifacts |
| 08 | [**Quality Review**](./activities/README.md#08-quality-review) | All | One criteria walk per target over its own surface and its consumer surface, plus the repository's definition guards against the tree the run edits |
| 09 | [**Validate and Commit**](./activities/README.md#09-validate-and-commit) | All | Re-derive the findings independently, gate the disposition, re-verify scope, then commit, publish and close out |

**Detailed documentation:**

- **Activities:** [activities/README.md](./activities/README.md) — the per-activity orientation map, linking the authoritative YAML.
- **Techniques:** [techniques/README.md](./techniques/README.md) — the local operation group and the shared operations this workflow binds.
- **Resources:** [resources/README.md](./resources/README.md) — creation guides, read-guides, and where the audit criteria live.

---

## Modes

| Mode | Activation | Description |
|------|------------|-------------|
| **Create** | "create a workflow", "new workflow" | Build a new workflow from a free-form description |
| **Update** | "update workflow", "modify workflow" | Change an existing workflow, with the removals it implies inventoried and approved |
| **Review** | "review workflow", "audit workflow" | Audit one or more existing workflows and produce a findings register |

`{operation_type}` is the sole mode state. Every mode-dependent step gates on it directly; there is no second mode flag.

---

## Orchestration Model

Inherits the meta orchestrator/worker pattern — [workflow-orchestrator](../meta/techniques/workflow-engine/workflow-orchestrator.md) and [activity-worker](../meta/techniques/workflow-engine/activity-worker.md) via [dispatch-activity](../meta/techniques/workflow-engine/dispatch-activity.md). Engine dispatch and checkpoint mechanics are not restated here.

---

## Criteria

The audit criteria this workflow applies — the anti-pattern catalog, the design principles, the schema construct inventory and the convention checklist — are consulted by cross-workflow reference rather than copied. They currently live in [workflow-design](../workflow-design/resources/), which this workflow depends on until that tree is retired. See [resources/README.md](./resources/README.md#criteria-homes).

---

## Outputs

In create and update modes the workflow seeds a **planning folder** under `.engineering/artifacts/planning/`: a `README.md` from the universal [planning-readme](../meta/resources/planning-readme.md) Template under this workflow's [readme-seed](./resources/readme-seed.md) profile, plus the planning artifacts each activity persists as numbered files via [`work-package::manage-artifacts::write-artifact`](../work-package/techniques/manage-artifacts/write-artifact.md).

**Create mode:** a change brief, a confirmed scope manifest, the enumerated definition files authored under `{target_path}`, a findings register, and — once the commit gate approves — a commit on the run's branch, a non-draft pull request against `workflows`, and a `COMPLETE.md` close-out.

**Update mode:** the same, plus an impact analysis whose removals inventory has been approved, and a per-file check that no reduction reaches the tree unaccounted for.

**Review mode:** the findings register is the run's terminal record. No planning folder is seeded, no worktree is created, nothing is committed and no close-out is written — the commit gate is mode-gated away. The edit-surface path is still derived, so every guard a review run invokes reads the tree the run targets. A review run may escalate to update mode against one narrowed target instead of closing.

---

## File Structure

```
workflows/workflow-authoring/
├── workflow.yaml                           # Workflow definition (variables, rules, inherited techniques)
├── README.md                               # This file
├── activities/
│   ├── README.md                           # Per-activity orientation map
│   ├── 01-intake-and-context.yaml          # Classify mode and target, derive edit surface, change brief
│   ├── 06-scope-and-draft.yaml             # Worktree, file manifest, per-file drafting, artifact alignment
│   ├── 08-quality-review.yaml              # Per-target criteria walk, consumer surface, definition guards
│   └── 09-validate-and-commit.yaml         # Independent re-derivation, disposition, commit, publish, close out
├── techniques/
│   ├── README.md                           # Technique orientation map
│   ├── TECHNIQUE.md                        # Shared inputs and authoring invariants
│   └── workflow-definition/                # Local operation group — cross-workflow addressable
│       ├── TECHNIQUE.md                    # Group contract
│       ├── derive-workflows-target-path.md
│       ├── intake-classification.md
│       ├── elicit-change-brief.md
│       ├── synthesize-change-brief.md
│       ├── impact-analysis.md
│       ├── derive-workflow-branch.md
│       ├── scope-definition.md
│       ├── yaml-authoring.md
│       ├── review-drafted-file.md
│       ├── readme-authoring.md
│       ├── verify-artifact-conforms.md
│       ├── load-known-findings.md
│       ├── reload-workflow.md
│       ├── resolve-consumer-surface.md
│       ├── audit-canon.md
│       ├── audit-schema-validation.md
│       ├── apply-audit-fixes.md
│       ├── verify-high-findings.md
│       ├── compile-report.md
│       ├── scope-verification.md
│       ├── compose-publication.md
│       ├── commit-verification.md
│       └── create-completion-doc.md
└── resources/
    ├── README.md                           # Resource index and artifact-to-guide map
    ├── change-brief.md                     # Creation guide
    ├── impact-analysis.md                  # Creation guide
    ├── scope-manifest.md                   # Creation guide
    ├── findings-register.md                # Creation guide, section-delivered
    ├── completion-artifact.md               # Creation guide, the run's terminal record
    ├── elicitation-guide.md                # Mode dimension sets and question bank
    ├── update-mode-guide.md                # Change-category vocabulary
    └── readme-seed.md                      # Progress inventory and mode map for the planning README
```
