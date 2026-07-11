# 06 — Scope and Draft

Scope manifest and structural design for the issue-160 retrospective follow-ups (RE-2, RE-3, RE-4) landing in the `workflow-design` workflow.

## Worktree

- **Root:** `/home/mike1/projects/work/workflow-server/workflow/workflow-design-issue-160`
- **Branch:** `workflow/workflow-design-issue-160` (present, checked out, clean)
- **Sources:** `.../workflow-design/`

## In-scope change set

| # | Path | Action | Type | Description |
|---|------|--------|------|-------------|
| 1 | `workflow-design/activities/08-quality-review.yaml` | modify | activity | Add `verify-high-findings` technique step (gated `is_review_mode != true`) before `classify-audit-findings`/`audit-fix-cycle`; add activity rule (RE-3); relabel/re-default `enforcement-confirmed` checkpoint (RE-4); bump `version` 1.4.0 → 1.5.0 |
| 2 | `workflow-design/techniques/verify-high-findings.md` | create | technique | Adversarial verification of High-tier audit findings (independent re-derivation, refute-by-default), severity recalibration, lighter confirmation pass over surviving Mediums, before remediation |
| 3 | `workflow-design/techniques/README.md` | modify | readme | Add `verify-high-findings` to the Quality audits area row |

Out of scope for this run (companion parent-repo deliverables): #1 guard scripts, #2/RE-1 checkpoint-replay engine change + `03-requirements-refinement.yaml`. Not touched here.

## Structural design

### RE-2 — new step + technique (08-quality-review.yaml)

The quality-review activity has two branches keyed on `is_review_mode`:
- **Review-mode branch** (`is_review_mode == true`): reload → 4 audit passes → compile-report → review-disposition checkpoint.
- **Draft-review branch** (`is_review_mode != true`): 4 review passes (expressiveness, conformance, rule-hygiene, rule-enforcement), each with its confirm checkpoint → `classify-audit-findings` (sets `needs_audit_fixes`, `has_critical_finding`) → `audit-fix-cycle` (while-loop, applies fixes) → `blocker-gate` decision.

The new `verify-high-findings` step sits in the **draft-review branch**, gated `is_review_mode != true`, positioned **after** `audit-rule-enforcement`/`enforcement-confirmed` and **before** `classify-audit-findings`. Rationale: `classify-audit-findings` is the step that decides which findings drive remediation (`needs_audit_fixes`) and which are Critical (`has_critical_finding`). Verifying and recalibrating High findings *before* classification means only independently-confirmed Highs feed the remediation decision — exactly "verify before it drives remediation."

It binds a new technique `verify-high-findings` (activity-group-shorthand does not apply — techniques here are single-file ids bound bare by name, matching every sibling audit step, e.g. `technique: audit-conformance`).

### RE-2 — technique file (verify-high-findings.md)

Follows the sibling audit-technique convention (front-matter `metadata` block, `## Capability`, `## Protocol` with numbered `###` sections, optional `## Outputs`/`## Rules`). Content:
- **Capability:** independently verify each High-tier finding before it drives remediation — re-derive the finding from the source construct without relying on the original pass's reasoning, refute by default, and recalibrate severity; a lighter confirmation pass over surviving Medium findings.
- **Protocol:** (1) Re-derive each High finding adversarially (refute-by-default; a finding survives only if independently reproduced against the cited construct). (2) Recalibrate severity — downgrade/withdraw findings that fail re-derivation, upgrade if warranted. (3) Lighter confirmation pass over Medium findings (spot-confirm the construct exists and the class is right; no full re-derivation). (4) Present the verified/recalibrated finding set.
- **Outputs:** `verified_findings` — the recalibrated finding set (survivors with confirmed severity) that `classify-audit-findings` reads.

### RE-3 — activity rule (08-quality-review.yaml)

Add to the activity `rules[]`: "High findings must be independently verified before they drive remediation." Structurally backed by the RE-2 step + its position before `classify-audit-findings`.

### RE-4 — enforcement-confirmed checkpoint re-label/re-default (08-quality-review.yaml, L189-206)

Current state: `enforcement-confirmed` fires after `audit-rule-enforcement` (which finds text-only rules), `defaultOption: accept-text-only`. Two options: `add-enforcement` (add checkpoints/conditions/validate actions) and `accept-text-only`.

Problem (RE-4): the recorded disposition can drift from the enforcement actually shipped — accepting "text-only" as the default even when structural enforcement was in fact added, so the disposition doesn't match reality.

Fix (semantic, not deletion; preserve both option ids):
- Make `accept-text-only` genuinely mean "no structural change shipped — rules stay as text-only guidance."
- Make `add-enforcement` the recorded disposition when structural enforcement ships; wire its `effect.setVariable` so the shipped-enforcement decision is captured (feeds the downstream fix cycle rather than being a no-op label).
- Re-examine `defaultOption`: default should reflect the safer/again-recorded reality. Given the audit exists to *drive* enforcement of critical rules, re-default toward recording the enforcement decision rather than silently accepting text-only. Proposed `defaultOption: add-enforcement` with sharpened labels/descriptions, so the auto-advance records "enforcement added" only when it ships and the option semantics are unambiguous.

## Drafting order

Techniques before activity is the reference-dependency order, but here the activity references the technique by bare id (loader resolves at runtime), so no hard ordering constraint. Draft in: (1) `verify-high-findings.md` technique, (2) `08-quality-review.yaml` activity edits, (3) `techniques/README.md` index. Each YAML validated against schema after drafting.

## Drafted-content review — block-indexed table

Update mode against `target_workflow_id = workflow-design`. One row per drafted construct.

| Block | File | Location | State | Rationale |
|-------|------|----------|-------|-----------|
| `verify-high-findings` technique | `techniques/verify-high-findings.md` | whole file | added | RE-2: adversarial re-derivation of High findings (refute-by-default), severity recalibration, lighter Medium confirmation pass; outputs `verified_findings`. Sibling audit-technique structure (front-matter, Capability, Outputs, Protocol, Rules). |
| `quality-review` version | `activities/08-quality-review.yaml` L2 | metadata | modified | 1.4.0 → 1.5.0 for the RE-2/RE-3/RE-4 change set. |
| RE-3 activity rule | `activities/08-quality-review.yaml` rules[] | activity metadata | added | "High findings must be independently verified before they drive remediation" — text rule structurally backed by the RE-2 step + its position. |
| `verify-high-findings` step | `activities/08-quality-review.yaml` L211-218 | steps[] | added | RE-2: `kind: technique`, gated `is_review_mode != true`, bound `technique: verify-high-findings`, placed after `enforcement-confirmed` and before `classify-audit-findings` so only confirmed Highs feed remediation. |
| `enforcement-confirmed` checkpoint | `activities/08-quality-review.yaml` L190-210 | steps[] | modified | RE-4: `defaultOption` accept-text-only → add-enforcement; message + both labels/descriptions sharpened so `accept-text-only` = "no structural change shipped" and `add-enforcement` records shipped enforcement; `add-enforcement` gains `effect.setVariable { needs_audit_fixes: true }`. Both option ids preserved. |
| Technique index row | `techniques/README.md` L23 | Quality audits row | modified | Added `verify-high-findings` to the area listing. |
| Technique table row | `README.md` L139 | technique table | added | Added `verify-high-findings` row after `audit-rule-enforcement`. |

**Removals flagged (update mode):** none — every edit is additive or an in-place relabel/re-default. The RE-4 checkpoint change preserves both option ids and all structure; only labels/description/message/default/effect changed. No `has_unflagged_removals`.

## Draft attestation

Every drafted block above has been reviewed and is understood and intentional. YAML parse-check passed on `08-quality-review.yaml`. Full schema-guard validation deferred to validate-and-commit (guards run against the main `../workflows` checkout — not attempted here per boundary rules). No block flagged for revision.
