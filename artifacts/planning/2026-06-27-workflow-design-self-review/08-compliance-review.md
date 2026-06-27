# Compliance Review: workflow-design

**Date:** 2026-06-27
**Workflow:** workflow-design v1.5.0
**Files audited:** workflow.yaml, 9 activities, 33 techniques, 10 resources, 3 READMEs
**Scope focus:** the 5-phase work-package→workflow-design integration (planning-folder parity, QA parity, retrospective, assumptions+elicitation, feature-branch/PR model)

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 |
| Medium   | 4 |
| Low      | 3 |
| Pass     | (all deterministic guards) |

No Critical/High findings: the workflow is schema-valid, loads, and runs (this review ran against it). Findings are prose-hygiene (AP-36/AP-61) and documentation-consistency (Principle 14, audit-consistency) issues — most introduced by the integration work, two pre-existing.

## Schema Validation Results (audit-schema-validation) — PASS

- `validate-workflow-yaml workflows/workflow-design` — all YAML valid (workflow + 9 activities + 33 techniques)
- `check-all-refs` — 0 unresolved references (cross-workflow `work-package::…` grouped refs resolve)
- `check:binding` — 0 new binding drift · `check:steps` — bound-step purity OK · `check:identifiers` — no bare-word ids · `check:self-input` — OK · `check:artifacts` — OK · `check:activity-tech` — no overlap

## Principle Compliance Findings

- **P1–P2, P4–P13: Pass** (within the integration scope).
- **P3 (One question at a time): Partial — F3.** The `design-principles` resource still states P3 is enforced by "8 separate checkpoints, one per design dimension." Phase 4 replaced those with a `forEach` over `design_dimensions` + one `dimension-confirmed` checkpoint. Enforcement text is now stale. (Introduced by Phase 4.)
- **P14 (Complete documentation structure): Violation — F4.** `workflow-design/techniques/README.md` is missing; P14 requires a README in every subfolder (activities/ and resources/ have one). (Pre-existing.)

## Anti-Pattern Findings

- **F1 [Medium] AP-61 + AP-36 — technique capabilities name activity-level constructs / encode position / compare to sibling implementations.** A technique must be stage-agnostic; capability prose must state what it does, not where it sits or how it compares. Occurrences (all introduced by the integration):
  - `apply-audit-fixes` — "the **quality-review** audit findings the user elected to fix" (names the activity + checkpoint); "so a fix never lands schema-invalid content" (rationale tail).
  - `review-draft-yaml` — "before the automated audit passes run" (position); "The structural counterpart of a manual diff review, indexed by construct rather than by git hunk" (comparison).
  - `reconcile-design-assumptions` — "so only genuine design judgements remain open for the user" (rationale); "The workflow-design counterpart of work-package's code-analysis reconcile, with audit passes in place of codebase tracing" (comparison).
  - `conduct-retrospective` — "The workflow-design counterpart of the work-package retrospective, without the PR-merge status step — workflow-design commits directly, with no PR" (comparison + step reference).
  - `elicitation` — "The per-iteration unit of the dimension-elicitation loop" (names the loop).
  - `scope-audit` — "so the update stays minimal and focused" (rationale tail).
  - `prepare-workflow-branch` — "so the work lands on a branch for review rather than directly on workflows" (rationale tail).
  - `publish-workflow-pr` — "so an authored or updated workflow is reviewed and merged through a PR rather than committed straight to workflows" (rationale tail).
- **F2 [Low] AP-36 — action message rationale tail.** `03-requirements-refinement` `set-design-dimensions` action: "…the activity model, variables, and techniques are already established and are skipped" narrates why update excludes them. (Introduced by Phase 4.)
- **NOT findings (verified):** `gh`/`git` literals in `publish-workflow-pr`/`prepare-workflow-branch` are AP-48-exempt (these techniques are the gh/git wrappers — invoking the tool is their purpose) and are correctly backticked (AP-59).

## Tool-Technique-Doc Consistency Findings

- **F5 [Low] Stale activity-name references in resources (pre-existing).** `design-principles` and `review-mode-guide` cite activity names that don't exist in the workflow: `02-context-and-literacy` (actual: `intake-and-context`), `06-scope-and-structure` (actual: `scope-and-draft`), `content-drafting` (actual: the `content-drafting` technique, not an activity). Pre-existing drift, unrelated to the integration.

## Rule Hygiene / Rule Enforcement Findings

- **Pass.** The integration's new rules (progress-tracker activity rule, `11-retrospective` rules, `09` feature-branch rule) are positive invariants, non-duplicative, and structurally backed where structure exists. No restatements/contradictions found.

## Work-package-owned (F6)

- **F6 [Low] AP-36 — `work-package::manage-artifacts::verify-readme-conforms` capability rationale tail** ("Catches template drift that would otherwise only be flagged late…"). Pre-existing WP content, carried through the Phase-1 edit. Remediated at the user's request (see Remediation).

## Recommended Fixes (prioritized)

1. **F1 (Medium):** Trim the 8 technique capabilities to crisp, stage-agnostic statements — drop activity/loop/position references, sibling comparisons, and "so that…" rationale tails.
2. **F3 (Medium):** Update `design-principles` P3 enforcement to describe the `forEach` over `design_dimensions` + the `dimension-confirmed` checkpoint.
3. **F4 (Medium):** Add `workflow-design/techniques/README.md`.
4. **F5 (Low):** Correct the stale activity-name references in `design-principles` and `review-mode-guide`.
5. **F2 (Low):** Trim the `set-design-dimensions` action-message rationale tail.

Disposition: **fix F1–F5** (the integration-introduced findings F1/F2/F3 and the cheap, clearly-correct pre-existing F4/F5). The work-package-owned item is left for a work-package review.

## Remediation (completed 2026-06-27)

All five findings eliminated:

- **F1** — trimmed all 8 technique capabilities (`apply-audit-fixes`, `review-draft-yaml`, `scope-audit`, `conduct-retrospective`, `elicitation`, `reconcile-design-assumptions`, `prepare-workflow-branch`, `publish-workflow-pr`) to crisp, stage-agnostic statements; dropped activity/loop/position references, sibling comparisons, and rationale tails. `elicitation` also anchored its bare "elicitation guide" noun to a hyperlink (AP-51).
- **F2** — removed the rationale tail from the `set-design-dimensions` action message.
- **F3** — `design-principles` P3 enforcement now describes the `forEach` over `design_dimensions` + `dimension-confirmed` checkpoint.
- **F4** — added `techniques/README.md` (orienting index + base-contract note + cross-workflow reuse table).
- **F5** — corrected the stale activity names in `design-principles` (P1, P2, P6, P11, P12, P13) and the stale activity + audit-technique names and single-technique framing in `review-mode-guide`.
- **F6** — trimmed the rationale tail from the `work-package::manage-artifacts::verify-readme-conforms` capability (the WP technique edited in Phase 1).

**Re-validation:** `validate-workflow-yaml` all valid · `check-all-refs` 0 unresolved · `check:binding` 0 drift · `check:steps`/`check:identifiers`/`check:self-input`/`check:activity-tech`/`check:artifacts` OK · `npm test` 386 passed. Verification re-scan confirms no residual capability rationale/comparison/position prose and no residual stale references.

**Result:** workflow-design v1.5.0 is compliant. Changes are uncommitted on `feat/workflow-design-wp-integration` (would update PR #139 on commit).
