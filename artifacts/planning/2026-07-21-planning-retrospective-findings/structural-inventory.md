# Structural Inventory — workflow-design, work-package

**Mode:** update (multi-target)
**Catalog source:** committed workflow catalog (`list_workflows`)

This session's change requests are derived from retrospective findings across the last 10 planning folders and span two committed workflows plus shared `work-package` techniques reused elsewhere (`manage-artifacts::write-artifact`). Both targets are inventoried below; `workflow-design` is the primary/first target.

## Target 1 — workflow-design

**Workflow:** Workflow Design Workflow
**ID:** `workflow-design`
**Version:** 1.28.0
**Initial activity:** `intake-and-context`

### File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 9 |
| Technique leaf files (`.md`, excl. containers/README) | 38 |
| Technique container `TECHNIQUE.md` files | 1 |
| Resource files (excl. README) | 22 |
| Total files under workflow tree | 75 |

### Entity counts

| Entity | Count |
|--------|------:|
| Activities | 9 |
| Checkpoints (incl. nested in loops) | 16 |
| Transitions | 11 |
| Decisions blocks | 1 |
| Workflow variables | 59 |
| Workflow rules (activity partition) | 3 |

### Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 67 |
| checkpoint | 16 |
| action | 26 |
| loop | 5 |

### Activities

| # | Activity ID |
|---|-------------|
| 01 | `intake-and-context` |
| 03 | `requirements-refinement` |
| 04 | `pattern-analysis` |
| 05 | `impact-analysis` |
| 06 | `scope-and-draft` |
| 08 | `quality-review` |
| 09 | `validate-and-commit` |
| 10 | `post-update-review` |
| 11 | `retrospective` |

## Target 2 — work-package

**Workflow:** Work Package Implementation Workflow
**ID:** `work-package`
**Version:** 3.33.0
**Initial activity:** `start-work-package`

### File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 15 |
| Technique leaf files (`.md`, excl. containers/README) | 91 |
| Technique container `TECHNIQUE.md` files | 17 |
| Resource files (excl. README) | 28 |
| Total files under workflow tree | 158 |

### Entity counts

| Entity | Count |
|--------|------:|
| Activities | 15 |
| Checkpoints (incl. nested in loops) | 43 |
| Transitions | 27 |
| Decisions blocks | 2 |
| Workflow variables | 113 |
| Workflow rules (workflow partition) | 10 |

### Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 162 |
| checkpoint | 43 |
| action | 26 |
| loop | 14 |

### Activities

| # | Activity ID |
|---|-------------|
| 01 | `start-work-package` |
| 02 | `design-philosophy` |
| 03 | `requirements-elicitation` |
| 04 | `research` |
| 05 | `implementation-analysis` |
| 06 | `plan-prepare` |
| 07 | `assumptions-review` |
| 08 | `implement` |
| 09 | `lean-coding-audit` |
| 10 | `post-impl-review` |
| 11 | `validate` |
| 12 | `strategic-review` |
| 13 | `submit-for-review` |
| 14 | `complete` |
| 15 | `codebase-comprehension` |

## Update scope

Retrospective findings extracted from the last 10 planning folders (root: `.engineering/artifacts/planning/`), grouped by target:

**workflow-design:**
- `write-artifact` technique reference (`manage-artifacts::write-artifact`) unresolvable via `get_technique` from within a bound protocol step — reproduced live during this very intake step (see Findings note below); recurs across the 2026-07-17 slim/simplify sessions unresolved.
- Transition-condition claim/registration mismatches (quoting, `isDefault` vs. explicit variable conditions) causing validation noise on routine `next_activity` calls.
- `validate-and-commit`'s completed-steps manifest omits some executed steps (e.g. `verify-commit`, `announce-completion`).
- Checkpoint-default pattern: near-universal first-pass default/recommended-option replay across sessions (AP-81/82 merge/demote candidates unaddressed across ≥3 consecutive sessions).
- Checkpoint message verbosity — no message-length guideline; a verbosity-reduction PR reproduced its own target defect in its drafting.
- Protocol-bullet tails carry rationale beyond the operative clause — needs `plain-technical-language` tightening.
- Binding-fidelity checks run only in the commit tail (`validate-and-commit`) — defects should surface earlier, at `draft-attestation` inside `scope-and-draft`.
- MCP resource-read fallback (worker harness cannot always `get_resource`) is not codified in `intake-and-context`'s format-literacy step.
- Dimension-confirmation checkpoints in `requirements-refinement` see near-universal default-replay — AP-81/82 consolidation candidate.
- Change-block index: hyperlink each Block title to file:line; remove the Instructions section and file index table.
- Deprecate `switch-model-pre-impl` / `switch-model-post-impl` checkpoints (work-package `08-implement`, referenced from workflow-design's own design canon for interactive gates).
- Formalise in-task `follow-ups.md` vs. `deferred-items.md` split (template + technique + canonical-home map entry) — currently agent-invented, unregistered.
- MR-1..MR-4 authoring-guidance additions to `anti-patterns` / drafting canon: cut comment/JSDoc verbosity; no dense prose after config examples; prefer worktree-root placeholders; do not ship a parallel runbook when SETUP covers it.

**work-package:**
- `post-impl-review` block-interview must process reviewer feedback one item at a time and confirm with the reviewer before exiting the loop (currently batches / can auto-advance after a single `issue-recorded`). **Confirmed structurally** — `activities/10-post-impl-review.yaml`'s `block-interview` is a single `kind: checkpoint` step (message references `{current_block_index}`/`{block_path}`) with `defaultOption: issue-recorded` + `autoAdvanceMs: 30000`, gated by `has_flagged_blocks == true` but not wrapped in any `kind: loop`. Nothing in the activity's own `steps[]` bounds iteration over the flagged-block set or guarantees a confirm turn before exit — the one-item-at-a-time discipline depends entirely on the executing agent re-yielding `block-interview#<instance>` per block, which the retrospective found agents skip under headless/auto-advance. Candidate fix: wrap in a `forEach` loop over the flagged-block list with a `breakCondition` tied to an explicit reviewer confirm, mirroring the retrospective interview's requested shape.
- Seed `project_type` into the session bag at intake so downstream activities do not re-infer project type from ambient state.
- `implementation-analysis` should drop its `analysis-confirmed` gate and resolve gaps via the same autonomous loop already used for codebase comprehension, then auto-proceed.
- Detect manual reviewer edits made during `post-impl-review` (diffs applied outside the agent) and surface confirmed patterns as retrospective candidates (see 2026-07-21 MR-1..MR-4 as worked example).
- Retrospective interview should run as its own dedicated session in the same one-item-at-a-time, confirm-before-continuing format as the block-change interview.
- Complexity-variable naming ambiguity: `path_gating_complexity` (classification) vs. `problem_complexity` (ADR gate in `complete`) — low-priority legibility fix.

## Findings note (reproduced during this intake step)

`intake-classification`'s own protocol instructs persisting `{structural_inventory}` via a `[write-artifact](../../work-package/techniques/manage-artifacts/write-artifact.md)` reference embedded in protocol prose rather than a bound activity step. As a disposable worker, no `get_technique { step_id }` exists for that cross-workflow reference — it is not one of this activity's own `steps[]`. This artifact was written directly as a fallback, reproducing the exact defect the 2026-07-17 retrospectives (PR #254, PR #255) already flagged as unresolved. This is now confirmed evidence for the corresponding change item above.
