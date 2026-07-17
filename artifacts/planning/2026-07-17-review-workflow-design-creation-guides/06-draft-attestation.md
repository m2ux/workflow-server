# Draft Attestation — pattern_analysis Output + #template cites + quality-review auto-fix

**Mode:** update · **Files:** 9 · **Attestation:** ready for batch review

## Reviewed blocks

| Block | File | Status | Rationale |
|-------|------|--------|-----------|
| `pattern_analysis` Output | `techniques/pattern-analysis.md` | modified | Closes High binding gap — assemble product declared |
| Persist cite `#template` | `techniques/pattern-analysis.md` | modified | Align persist with assemble anchor |
| Persist cite `#template` | `techniques/intake-classification.md` | modified | Same cite parity for structural-inventory |
| Persist cite `#template` | `techniques/assemble-file-approach.md` | modified | Same cite parity for drafting-plan |
| Persist cite `#template` | `techniques/review-drafted-file.md` | modified | Same cite parity for file-review-note |
| Persist cite `#template` | `techniques/review-draft-yaml.md` | modified | Same cite parity for draft-attestation |
| Persist cite `#template` | `techniques/persist-design-specification.md` | modified | Same cite parity for design-specification |
| Guide/compile cites `#template` | `techniques/compile-report.md` | modified | Output + protocol cite the template home |
| Workflow metadata | `workflow.yaml` | unchanged | Patch bump already applied (v1.24.4) on this branch |
| Remove `expressiveness-confirmed` checkpoint | `activities/08-quality-review.yaml` | modified | Intentional removal per user directive — zero-finding path (`expressiveness-clean`) and a non-blocking flagged-findings message replace it |
| Remove `conformance-confirmed` checkpoint | `activities/08-quality-review.yaml` | modified | Intentional removal per user directive — same pattern as expressiveness |
| Remove `rule-hygiene-confirmed` checkpoint | `activities/08-quality-review.yaml` | modified | Intentional removal per user directive — same pattern as expressiveness |
| Remove `enforcement-confirmed` checkpoint | `activities/08-quality-review.yaml` | modified | Intentional removal per user directive — its `setVariable needs_audit_fixes` effect is superseded by `classify-audit-findings`'s finding-count logic |
| Add 4 flagged-findings action steps | `activities/08-quality-review.yaml` | modified | Non-checkpoint `kind: action` message per pass, gated on `finding_count > 0`, linking the pass's findings artifact and naming the audit fix cycle |
| Rebase `classify-audit-findings` set-messages | `activities/08-quality-review.yaml` | modified | `needs_audit_fixes` now derives from the four finding counts (or unresolved verified findings), not user election; `has_critical_finding` unchanged |
| Rebase `reassess-audit-fixes` set-messages | `activities/08-quality-review.yaml` | modified | Same finding-count basis applied to the post-fix re-audit |
| Activity version bump | `activities/08-quality-review.yaml` | modified | 1.12.2 → 1.12.3 (patch) |
| Quality Review blurb | `activities/README.md` | modified | Describes automatic per-pass fixing instead of per-pass confirmation checkpoints |

**draft_attestation:** All sixteen reviewed blocks (7 prior-pass technique blocks + 9 this-pass quality-review-auto-fix blocks) are intentional and understood. Four checkpoint removals are flagged and intentional per the explicit user directive — no unflagged removals. `review-disposition` and `blocker-gate` are unaffected.

## Post-attestation (user request)

| Block | File | Status | Rationale |
|-------|------|--------|-----------|
| Principle §26 | `resources/design-principles.md` | added | Creation Guide for Generated Documents |
| AP-116 `no-template-creation-guide` | `resources/anti-patterns.md` | added | Smell when persist lacks Template guide or invents layout in Protocol |

---

## Return-to-draft (binding-fidelity pass) — 2026-07-17

**Mode:** update · **Files:** 20 · **Trigger:** `check-binding-fidelity.ts` (run inside `validate-and-commit`'s schema-validation step) found 21 NEW violations on the branch — 20 `dead-output`, 1 `orphan-input`.

| Block | File | Status | Rationale |
|-------|------|--------|-----------|
| `#### artifact` moved onto `expressiveness_findings` | `techniques/audit-expressiveness.md` | modified | Content Output had no consumer outside its own file; the artifact marker is the server-recognized exemption, and the `_path` Output keeps its existing consumer (the `quality-review` checkpoint message) |
| `#### artifact` moved onto `conformance_findings` | `techniques/audit-conformance.md` | modified | Same pattern as expressiveness |
| `#### artifact` moved onto `rule_hygiene_findings` | `techniques/audit-rule-hygiene.md` | modified | Same pattern as expressiveness |
| `#### artifact` moved onto `enforcement_findings` | `techniques/audit-rule-enforcement.md` | modified | Same pattern as expressiveness |
| `#### artifact` moved onto `anti_pattern_findings` | `techniques/audit-anti-patterns.md` | modified | Same pattern as expressiveness; its `_path` Output has no activity-message consumer, so `compile-report.md` now declares it as an Input and links it (see below) |
| `#### artifact` moved onto `principle_findings` | `techniques/audit-principles.md` | modified | Same as anti-patterns — `_path` consumer supplied by `compile-report.md`'s new Input/link |
| `#### artifact` moved onto `drafting_plan` | `techniques/assemble-file-approach.md` | modified | Same pattern as expressiveness; `_path` consumer is the `file-approach-confirmed` checkpoint message |
| `#### artifact` moved onto `pattern_analysis` | `techniques/pattern-analysis.md` | modified | Same pattern as expressiveness; `_path` consumer is the `04-pattern-analysis` checkpoint message |
| `#### artifact` moved onto `file_review_note` | `techniques/review-drafted-file.md` | modified | Same pattern as expressiveness; `_path` consumer is the `file-review` checkpoint message |
| `removal_inventory` Output → `{$removal_inventory}` local | `techniques/review-drafted-file.md` | modified | Only ever read within this file's own Protocol; `has_unflagged_removals` (the actually-consumed derived flag) is unchanged |
| `dimension_capture` Output → `{$dimension_capture}` local | `techniques/capture-dimension.md` | modified | Folded into `{accumulated_design}` within the same file and never read elsewhere |
| `structural_design` Output → `{$structural_design}` local | `techniques/scope-definition.md` | modified | Only used while assembling the persisted `scope-manifest.md` body within this file |
| `drafting_order` Output → `{$drafting_order}` local | `techniques/scope-definition.md` | modified | Same rationale as `structural_design` |
| `design_intent` Output → `{$design_intent}` local | `techniques/intake-classification.md` | modified | Summarized and immediately used within this file's own Protocol; not read downstream |
| `pr_title` / `pr_body` Outputs → `{$pr_title}` / `{$pr_body}` locals | `techniques/publish-workflow-pr.md` | modified | Composed and consumed only within this file's `create-pr` call; `pr_url`/`pr_number` stay declared Outputs (read by the activity) |
| Capture `{pushed_branch}` after push-branch | `techniques/publish-workflow-pr.md` | modified | Creates an external read of `push-branch.md`'s `pushed_branch` Output, closing its dead-output finding |
| Capture `{pr_status}` after mark-ready | `techniques/publish-workflow-pr.md` | modified | Creates an external read of `mark-ready.md`'s `pr_status` Output |
| Protocol lands literal `{pr_url}` / `{pr_status}` tokens | `work-package/techniques/update-pr/mark-ready.md` | modified | Prior wording named the fields only in backticks (not `{token}` interpolation), so it registered no read; now it does, giving `pr_status` a second external consumer |
| Remove own `user_description` Input | `techniques/synthesize-update-specification.md` | modified | Duplicated a Root `TECHNIQUE.md`-inherited Input as an own Input with no in-workflow producer; Protocol still reads `{user_description}` via inheritance |
| Add `report_content` Input | `techniques/persist-report.md` | modified | Protocol now persists the bound `{report_content}` instead of an unbound "the report content"; the three call sites below supply it |
| Add optional `principle_findings_path` / `anti_pattern_findings_path` Inputs + links | `techniques/compile-report.md` | modified | Matches the technique's existing "link satellite finding files for detail" capability; gives both Outputs an external consumer |
| `persist-compliance-report` binds `report_content: "{compliance_report}"` | `activities/08-quality-review.yaml` | modified | Wires `compile-report`'s rolled-up product into `persist-report`, closing `compliance_report`'s dead-output finding |
| `save-compliance-report` binds `report_content: "{compliance_report}"` | `activities/09-validate-and-commit.yaml` | modified | Same wiring on the review-mode persist step in this activity |
| `save-review-snapshot` binds `report_content: "{findings_summary}"` | `activities/10-post-update-review.yaml` | modified | Wires `summarize-findings`'s product into `persist-report` for the post-update path, closing `findings_summary`'s dead-output finding |

**draft_attestation (this pass):** All twenty-four reviewed blocks across the twenty files are intentional and understood. No content removal beyond the seven Outputs demoted to same-file `$locals` — each demoted Output's value stays in use within its own file's Protocol, only its bag-level signature changes. `check-binding-fidelity.ts` confirms **0 NEW** after this pass. No unflagged removals; `preservation-check` does not trigger.
