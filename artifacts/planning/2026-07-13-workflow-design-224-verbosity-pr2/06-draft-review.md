# Draft Review — Block Index

> workflow-design · #224 PR 2 · 2026-07-13 · branch `workflow/224-verbosity-pr2` · 36 files (34 modified, 2 added) · corpus definition net −102 lines

| # | Block | File(s) | Status | Rationale |
|---|---|---|---|---|
| 1 | Conformance gate op | `manage-artifacts/verify-artifact-conforms.md` | added | V1 — enforces output-discipline rules + canonical-home map at a boundary; verify + fix in place, no checkpoint (per #197/#218 direction) |
| 2 | Gate binding | `activities/12-strategic-review.yaml` (2.9.0) | modified | V1 — binds beside `verify-readme` (RR-1 user decision) |
| 3 | Plan template | `resources/wp-plan.md` (1.3.0) + `plan-prepare/plan.md` (1.1.0) | modified | V2+V3 — Key Findings Summary → link-only Inputs; Problem/Scope/Criteria/Assumptions/Testing → link slots; plan keeps Approach, Tasks, Risks; 150-line budget |
| 4 | Canonical-home map | `manage-artifacts/TECHNIQUE.md` (3.3.0) | modified | V3 — single declaration of fact-category → home artifact (RR-8 map confirmed) |
| 5 | Home + slot templates | `requirements-elicitation.md` (2.2.0), `design-framework.md` (1.3.0), `implementation-analysis.md` (1.2.0), `architecture-summary.md` (1.2.0), `complete-wp.md` (2.1.0), `assumptions-review.md` (5.1.0) | modified | V3 — requirements owns problem/scope/criteria; philosophy keeps classification + budgeted statement; others carry link slots |
| 6 | Producer techniques | `requirements-elicitation/create-document.md`, `design-philosophy/document.md`, `research/document.md`, `implementation-analysis/document.md` (all +0.1.0) | modified | V3 — each producer knows what it homes and what it links |
| 7 | Deferred-items register | `resources/deferred-items.md` | added | V6 — single register template; lazily created, one row per item updated in place |
| 8 | Register consumers | `review-assumptions/record.md`, `finalize-documentation/create-complete-doc.md`, `github-issue-creation.md`, `strategic-review/document-findings.md` | modified | V6 — deferral producers write register rows; COMPLETE.md carries one link line |
| 9 | Consolidated review format | `resources/review-mode.md` (1.6.0), `techniques/review-summary.md` (1.3.0) | modified | V6 — findings render as ID + title + severity + disposition; `<details>` restatement blocks removed; details live in linked reports |
| 10 | Manual-diff merge | `resources/manual-diff-review.md` (2.0.0), `techniques/review-diff.md` (2.0.0), `techniques/review-code.md` (2.2.0) | modified | V6 — report becomes a `## Manual Diff Review` section of `code-review.md`; `change-block-index.md` unchanged |
| 11 | Advisory-artifact redirects | `prism/techniques/structural-analysis.md` (1.2.0), `ponytail/techniques/review-over-engineering.md` (1.1.0), activities `09` (1.2.0) / `10` (1.17.0) | modified | V6 (RR-3) — optional `findings_destination` input, default preserves standalone; work-package call sites bind `code-review.md` |
| 12 | Reference sweep + versions | `workflow.yaml` (3.29.0), `README.md`, `resources/README.md`, `resources/readme.md` (3.2.0) | modified | V7 — prefix-example table, resource index, deferred pointers; REVIEW-MODE.md needed no change (no stale refs) |
| 13 | Anti-pattern codification | `workflow-design/resources/anti-patterns.md` (AP-86–89), `design-principles.md` (§15), `workflow.yaml` (1.8.0) | modified | V8 — template-mandated duplication, restatement slots, unenforced style rules, undeclared audience |

## Validation

- Schema validation: all four touched workflows pass (`validate-workflow-yaml.ts`).
- Guards: anchors, all-refs, identifiers, self-input, activity-tech overlap, technique-template, variable-model, fragments, review-mode gating (6/6 baselined), stealth isolation, prism lenses — all OK against the worktree.
- binding-fidelity: 3 NEW entries, all baseline-regen class (gate-op dead-output mirrors the baselined sibling; review-diff churn from the artifact merge; `derive-design-dimensions` pre-exists on main). Post-merge server-repo baseline regen recorded as follow-up (262 → ~256).

## Attestation

Draft attestation recorded 2026-07-13: every block above reviewed, understood, and intentional. User confirmations: scope manifest, all 9 flagged removals, RR-1/RR-3/RR-8 design decisions.
