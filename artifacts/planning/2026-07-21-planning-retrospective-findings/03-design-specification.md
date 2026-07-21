# Design Specification — Planning Retrospective Findings (Iterate Lap 2)

**Workflow:** `workflow-design` v1.29.0 (primary) · `work-package` v3.34.0 (secondary)
**Mode:** Update (multi-target) · **Iterate:** post-update findings + auto-remediate mandate
**Date:** 2026-07-21
**Change categories:** activity, technique, structural-refactor
**Change request:** Gate empty post-update persists; rewrite `retrospective-confirm` (AP-98); align `persist-report` with `write-artifact`; replace `post-update-disposition` with automatic fix when findings remain (never ask accept/iterate/revert).
**Baseline:** [structural-inventory.md](structural-inventory.md#update-scope) · findings: [10-post-update-review.md](10-post-update-review.md)

---

## Purpose

Lap 1 delivered the retrospective process fixes and is already committed on PR #268. Post-update review found three compliance gaps plus a new operational mandate: when post-update findings remain, the workflow must **always remediate automatically** — never present accept / iterate / revert. This iterate updates `workflow-design` (and `work-package` only where AP-98 requires) so those gaps close and the post-update path cannot ask the user to choose among leaving debt, iterating, or reverting.

| Goal | Meaning |
|------|---------|
| Gate empty post-update satellites | `persist-post-expressiveness` / `persist-post-conformance` run only when `*_finding_count > 0`, matching quality-review. |
| Kill AP-98 next-step narration | `retrospective-confirm.message` states status only — no “select-next / cleanup is next”. |
| One persist path for reports | Resolve `persist-report` protocol vs activity binds: migrate call sites to bound `write-artifact` (or restore `persist-report` as the sole writer — pick one). |
| Always auto-fix post-update findings | Remove `post-update-disposition`. When `review_findings_count > 0`, run a quality-review-style remedia loop; never ask. Clean path (`0` → retrospective) unchanged. |

**Out of scope:**
- Re-opening lap-1 retrospective themes already committed (unless they regress under this iterate).
- MCP server source (`src/`, `schemas/`).
- New / removed / reordered activities (step and transition shape inside `post-update-review` only).

**Also see:** [assumptions log](03-assumptions-log.md) · [structural inventory](structural-inventory.md) · [post-update review](10-post-update-review.md)

---

## Activity list

No activities added, removed, or reordered. Step-level change is concentrated on `post-update-review`; secondary touch on `complete` (work-package) for the message rewrite.

| Activity (workflow) | Role in this change |
|----------------------|----------------------|
| `post-update-review` (workflow-design) | Gate expressiveness/conformance persists; remove disposition checkpoint; add automatic remedia loop; align report persist bind. |
| `quality-review` / `validate-and-commit` (workflow-design) | Touch only if needed to retire or rebind `persist-report` call sites for the same persist-path decision. |
| `complete` (work-package) | Rewrite `retrospective-confirm.message` (AP-98). |

---

## Checkpoints

| Gate family | Change |
|-------------|--------|
| `post-update-disposition` (`post-update-review`) | **Remove.** Do not offer accept / iterate / revert. When `review_findings_count > 0`, enter automatic remedia (see Rules). When `== 0`, keep existing clean message + transition to retrospective. |
| `retrospective-confirm` (work-package `complete`) | Message only: e.g. `Retrospective interview complete for this item set.` — drop next-step / routing clause (AP-98). Soft-gate options unchanged. |

---

## Artifacts

| Artifact / surface | Target shape |
|---------------------|--------------|
| Post-update expressiveness / conformance satellites | Written only when `expressiveness_finding_count > 0` / `conformance_finding_count > 0` (structural `condition` on the persist steps). |
| Post-update / compliance report persist | Single path: either each call site binds `work-package::manage-artifacts::write-artifact` with the correct bare filename (`post-update-review.md` / `compliance-review.md`), retiring `persist-report` as a separate writer; or `persist-report` remains the bound writer and its protocol describes the write itself (no phantom sibling `write-artifact` bind). Prefer the bound-`write-artifact` migration to match lap-1. |
| Design / assumptions (this folder) | Updated in place for iterate deltas; lap-1 rows retained where still true. |

---

## Rules

| Rule / principle | Application |
|------------------|---------------|
| Always fix; never ask (post-update) | `review_findings_count > 0` → automatic remedia while-loop modeled on quality-review `audit-fix-cycle` (apply fixes → re-audit → reassess; `maxIterations` bound). No disposition checkpoint. |
| Escalate without asking | If the remedia loop exits still dirty (findings remain), auto-transition to `intake-and-context` for a full update cycle — no options presented. |
| Clean path preserved | `review_findings_count == 0` → retrospective (existing default transition). |
| Re-commit after successful remedia | When remedia clears findings by editing committed files, flow must re-validate/commit before treating the update as clean (see [assumptions log](03-assumptions-log.md) A-12). |
| Count-gated persists | Mirror quality-review: satellite `write-artifact` steps carry `*_finding_count > 0` conditions. |
| Persist-path consistency | One writer story end-to-end for reports — no protocol that assumes a sibling bind the activity does not declare. |
| AP-98 | Checkpoint / action messages state current status; they do not narrate the next activity. |

---

## Confirmation ask

Approving this specification means: proceed to impact → scope-and-draft to implement the four iterate deltas above on `workflow-design` (and `work-package` for AP-98), with A-12 (re-commit after remedia) confirmed or corrected at Gate 2 if still open.
