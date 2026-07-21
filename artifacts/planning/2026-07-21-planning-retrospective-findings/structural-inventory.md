# Structural Inventory — workflow-design, work-package

**Mode:** update (multi-target) · **Iterate:** post-update findings + auto-remediate mandate
**Catalog source:** committed workflow catalog (`list_workflows`) — `workflow-design` 1.28.0 / `work-package` 3.33.0; worktree baseline below is PR #268 post-commit (`workflow-design` 1.29.0 / `work-package` 3.34.0)

This session's **second update cycle** (iterate from `post-update-disposition`) targets the same planning folder, worktree, and PR. Baseline inventory below is the current worktree state after the first commit. Prior retrospective scope from lap 1 remains delivered; this inventory's Update scope lists only the iterate change request.

## Target 1 — workflow-design

**Workflow:** Workflow Design Workflow
**ID:** `workflow-design`
**Version:** 1.29.0 (worktree) · catalog 1.28.0
**Initial activity:** `intake-and-context`

### File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 9 |
| Technique leaf files (`.md`, excl. containers/README) | 38 |
| Technique container `TECHNIQUE.md` files | 1 |
| Resource files (excl. README) | 23 |
| Total files under workflow tree | 76 |

### Entity counts

| Entity | Count |
|--------|------:|
| Activities | 9 |
| Techniques (leaf) | 38 |
| Resources | 23 |
| Checkpoints (incl. nested in loops) | 16 |
| Transitions | 11 |
| Decisions | 1 |
| Workflow variables | 60 |
| Workflow rules (activity partition) | 3 |

### Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 91 |
| checkpoint | 16 |
| action | 27 |
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
**Version:** 3.34.0 (worktree) · catalog 3.33.0
**Initial activity:** `start-work-package`

### File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 15 |
| Technique leaf files (`.md`, excl. containers/README) | 91 |
| Technique container `TECHNIQUE.md` files | 17 |
| Resource files (excl. README) | 30 |
| Total files under workflow tree | 159 |

### Entity counts

| Entity | Count |
|--------|------:|
| Activities | 15 |
| Techniques (leaf) | 91 |
| Resources | 30 |
| Checkpoints (incl. nested in loops) | 41 |
| Transitions | 27 |
| Decisions | 2 |
| Workflow variables | 113 |
| Workflow rules (activity partition) | 1 |

### Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 162 |
| checkpoint | 41 |
| action | 27 |
| loop | 15 |

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

Iterate change request from [post-update review](10-post-update-review.md) (`review_findings_count: 3`) plus a critical new mandate. Classify as **UPDATE of `workflow-design`**, with a secondary touch to `work-package` only where required for the Medium findings.

**workflow-design (primary):**

1. **High — gate post-update persists** — Add `*_finding_count > 0` conditions on `persist-post-expressiveness` and `persist-post-conformance` in `activities/10-post-update-review.yaml`, mirroring quality-review's gated persist pattern.
2. **Medium — persist-report vs write-artifact** — Resolve inconsistency between `techniques/persist-report.md` and activity binds that still name `persist-report` while the shared path is `work-package::manage-artifacts::write-artifact` (pick one persist path and align protocol + binds).
3. **CRITICAL — auto-fix when findings > 0** — Change `activities/10-post-update-review.yaml` so that when `review_findings_count > 0`, findings are **always fixed automatically without a user checkpoint**. Remove `post-update-disposition` accept/iterate/revert ask. Prefer an automatic remediate/fix loop like quality-review's `audit-fix-cycle` (while findings remain). If a full update cycle is required, auto-transition to intake without presenting options. Keep clean path (`review_findings_count == 0` → retrospective) unchanged. Mandate: **never ask; always fix**.

**work-package (secondary, as needed):**

4. **Medium — AP-98** — Rewrite `activities/14-complete.yaml` `retrospective-confirm.message` without next-step narration (drop “select-next / cleanup is next”).

Lap-1 retrospective findings remain in the committed trees; this iterate does not re-open them unless they regress under the new auto-fix / gate work.
