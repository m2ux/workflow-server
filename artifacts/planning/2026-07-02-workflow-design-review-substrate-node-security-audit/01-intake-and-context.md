# Intake and Context — substrate-node-security-audit

**Session:** CED3DG
**Activity:** intake-and-context
**Date:** 2026-07-02
**Mode:** REVIEW (first pass) → UPDATE (second pass, remediation)

> **Second-pass note (UPDATE mode).** After the review completed, the user chose "fix everything," so `intake-and-context` re-ran in UPDATE mode. State is now `is_review_mode=false`, `is_update_mode=true`, `user_wants_fixes=true`, `target_workflow_id=substrate-node-security-audit`. The original review classification below is retained for provenance; the [UPDATE-mode addendum](#update-mode-addendum-second-pass) records the recalibrated change request that drives remediation. All edits target the dedicated worktree at `work/workflow-server/substrate-node-security-audit-remediation/substrate-node-security-audit/` (branch `workflow/substrate-node-security-audit` off HEAD 35b35b86), never the main-checkout `workflows/` submodule.

## Classification

- **Operation type:** review (audit an existing workflow against the 15 design principles + schema/conformance/anti-pattern passes).
- **`is_review_mode`:** true
- **`is_update_mode`:** false (not applicable in review mode)
- **`target_workflow_id`:** `substrate-node-security-audit`
- Recognition: the user asked to "review" an existing workflow. Review mode produces a compliance report without modifying the target, then may offer to switch to update mode for remediation.

## Target workflow identity

| Field | Value |
|-------|-------|
| id | `substrate-node-security-audit` |
| title | Security Audit Workflow |
| version | 4.16.0 |
| author | m2ux |
| description | Fully automated multi-phase AI security audit for Substrate-based blockchain node codebases. |
| initialActivity | `scope-setup` |
| tags | security, audit, blockchain, substrate, automated, multi-phase |

Files live in the `workflows` submodule at `workflows/substrate-node-security-audit/`.

## Structural inventory

| Entity | Count | Notes |
|--------|-------|-------|
| Root files | 3 | `workflow.yaml`, `README.md` (17.7KB), `CHANGELOG.md` (28.7KB) |
| Activities | 14 | 7 main-flow + 7 sub-agent activities |
| Technique files | 18 | plus `TECHNIQUE.md` base contract |
| Resource files | 11 | |
| Steps (total) | 61 | 48 technique-bound, 13 action |
| Checkpoints | 0 | workflow is FULLY AUTOMATED (rule-declared); phase gates are `set` flags on final steps |
| Transition targets | 7 | |
| Workflow rules | 32 | scopes: `workflow` (18), `activity` (13), `universal` (1) |
| Variables | 18 | |

### Activities (14)

Main flow: `scope-setup`, `reconnaissance`, `primary-audit`, `adversarial-verification`,
`report-generation`, `ensemble-pass`, `gap-analysis`.

Sub-agent activities: `sub-crate-review`, `sub-static-analysis`, `sub-toolkit-review`,
`sub-architectural-analysis`, `sub-output-verification`, `sub-structured-merge`, `sub-reconnaissance`.

Activity file numbering: 01-07 for the main flow, 10-16 for the sub-agent activities
(no 08/09 files present).

### Techniques (18, excl. TECHNIQUE.md)

`analyze-architecture`, `apply-checklist`, `build-function-registry`, `decompose-safety-claims`,
`dispatch-sub-agents`, `execute-ensemble-pass`, `execute-sub-agent`, `extract-invariants`,
`map-codebase`, `map-vulnerability-domains`, `merge-findings`, `scan-storage-lifecycle`,
`score-severity`, `search-pattern-catalog`, `setup-audit-target`, `verify-sub-agent-output`,
`write-gap-analysis`, `write-report`.

Activity-wide strategy technique declared in `workflow.yaml`: `variable-binding`.

### Resources (11)

`audit-prompt-template.md` (117KB — very large), `static-analysis-patterns.md` (29KB),
`target-profile.md` (22KB), `audit-template-reference.md`, `gap-analysis-template.md`,
`severity-calibration.md`, `severity-rubric.md`, `start-here.md`,
`sub-agent-output-schema.md`, `toolkit-checklist.md`, `vulnerability-pattern-vocabulary.md`.

## Seeds for downstream quality-review

Points worth flagging to the audit passes (not findings yet — context only):

- **Zero checkpoints by design.** The workflow self-describes as FULLY AUTOMATED and encodes
  phase gates as `set` flags on final steps rather than schema `checkpoint` constructs. The
  audit should assess whether that is faithfully and consistently structured (audit-expressiveness /
  audit-rule-enforcement) vs. rule-text-only.
- **Heavy rule text (32 rules), much in UPPERCASE prose.** Many workflow/activity rules read as
  imperative HARD STOP prose (dispatch completeness, coverage gate, finding-count reconciliation).
  Candidate territory for audit-rule-hygiene (AP-24–29) and audit-rule-enforcement
  (text-only vs. structurally enforced).
- **Very large resources.** `audit-prompt-template.md` at 117KB is an outlier — relevant to
  expressiveness / resource-hygiene review.
- **Activity numbering gap (no 08/09).** Sub-agent activities jump to 10-16 — worth a conformance note.
- **`variable-binding`** is the only activity-wide strategy technique; per-step operations are
  bound at the step via `step.technique` — check binding fidelity in the audit.

---

## UPDATE-mode addendum (second pass)

### Classification (second pass)

- **Operation type:** update (remediate the reviewed workflow against the recalibrated finding set).
- **`is_update_mode`:** true — confirmed at the `mode-confirmation` checkpoint (`confirm-update`).
- **`is_review_mode`:** false.
- **`user_wants_fixes`:** true (set by the quality-review `fix-issues` disposition).
- **`target_workflow_id`:** `substrate-node-security-audit`.
- **Change-request category (per [update-mode-guide](../../../../workflows/workflow-design/resources/update-mode-guide.md)):** structural refactor + metadata/rule hygiene + resource decomposition — spanning `workflow.yaml` (rules, variables, gates), several activity files, technique files, resources, and READMEs. No activity add/remove/rename; transition/initialActivity integrity preserved.

### Format literacy (auto-confirmed in update mode)

Update mode auto-confirms `format_literacy_confirmed` and `schema_constructs_confirmed` (the existing workflow is the pattern baseline). Schema system internalized this pass: 6 schemas (workflow / activity / technique / condition / state / session-file); design-time constructs = `workflow.yaml` + activity YAML + technique files + conditions. Applicable constructs for this remediation: `action` (`set` with `target`+`value`; `validate`), `condition` (simple / and), technique-group decomposition via `step.technique`, and the `rules` audience partition (`workflow` / `activity` / `universal`).

### The change request (verification-recalibrated finding set)

Authoritative source: `08-quality-review-verification.md` for the High tier (adversarial recalibration); `08-quality-review.md` for the Medium/Low first-pass judgements. This — not the raw report severities — is the change spec.

- **DROP F-01 entirely** — verified FALSE POSITIVE. The four worker rules (MANDATORY WEIGHTS.RS READ, ENSEMBLE TARGETED BLIND-SPOTS, CONFIGURATION-VARIANT PANIC TRIAGE, GENESIS PARSING PATH COVERAGE) already sit in `rules.activity` (workflow.yaml:37-40), the correct worker-facing bucket. Independently confirmed against the file. No AP-71 violation; no action.
- **F-05 (High, confirmed):** wire the three HARD-STOP gates (coverage / dispatch-completeness / finding-count-reconciliation) to structural `condition`s or `validate` actions.
- **F-02 (Medium):** dedupe DEFENSE-IN-DEPTH (`workflow.yaml:36` ↔ `apply-checklist.md`) and weights.rs (`workflow.yaml:37` ↔ `apply-checklist.md`) to one authoritative home each; DROP the severity-rubric.md / severity-calibration.md cites (category slip — those hold rubric tables, not duplicated rules).
- **F-20 (Medium):** relocate the §2/§3/§5 operative content out of the 117KB `audit-prompt-template.md` into owning techniques; keep §4 Reporting Format + the §1-§5 taxonomy as reference/template. Drop the AP-83 angle.
- **F-10 (Medium):** `dispatch-sub-agents` is bound 13× (not 12) — reclassify as AP-73 phase-unroll (one 6-phase protocol unrolled across activity steps), NOT monolith-masking; consider splitting per-phase ops. The sub-agent-roster exception plausibly shields the two distinct `dispatch-*-agent` bindings.
- **F-07 (Low):** express the finalize `set` flags as `target`+`value` (schema hygiene; AP-67(c)-exempt — no functional gate is broken).
- **F-11 (Low):** counts are 7× / 6×; narrow to same-activity repeat bindings in `03-primary-audit` and `05-report-generation` (AP-73(a) collapse / verify-distinct-outputs review). The three `merge_strategy` modes live in distinct activities → documented distinct-purpose exception, not monolith-masking.
- **Plus the untouched first-pass tiers, applied with sensible discretion:**
  - **Medium:** F-03 (UPPERCASE rule prose + rationale tails), F-04 (flat prefix-shaped rule keys → grouped arrays), F-06 (unenforced FULLY-AUTOMATED phase-gate claim), F-08 (gate variables read by no condition), F-09 (routing duplicated as `decisions[]`+`transitions[]`), F-12 (role-prescriptive prose in README/description), F-13 (binding gap: `map-vulnerability-domains` inputs unproduced), F-14 (`score-severity` per-call rename), F-16 (missing subfolder READMEs), F-21 (guide-wrapper ceremony; merge the two severity resources).
  - **Low:** F-15 (activity-file numbering gap 08/09), F-18 (non-affirmative rule slugs), F-19 (`NN-` numeric resource index prefixes), F-22 (README artifact-list / step-mermaid enumerations restate YAML — keep flow diagrams), F-23 (`execute-sub-agent` delivery-mechanism narration — borderline/likely-accept), F-24 (retired-check tombstones).

**Net High tier:** 7 → 1 (only F-05 remains High). All fixes are non-destructive content refactors; none requires a schema change.

### Impact preview (for the downstream impact-analysis activity)

- **workflow.yaml** — directly modified: rule regrouping/dehyphenation (F-02/F-03/F-04), gate wiring (F-05/F-06/F-08), structured `set` flags (F-07), variable pruning (F-08).
- **activity files** — `05-report-generation.yaml` (F-05 gate conditions, F-09 dedupe, F-11), `06-ensemble-pass.yaml` (F-09), `02-reconnaissance.yaml` / `03-primary-audit.yaml` (F-10 phase-unroll, F-11), all finalize steps 02/03/04/05 (F-07).
- **techniques** — `dispatch-sub-agents.md` (F-10 split), `apply-checklist.md` (F-02 authoritative home), `map-vulnerability-domains.md` / `analyze-architecture.md` (F-13 canonical ids), `score-severity.md` / `merge-findings.md` (F-14 scoring home), owning techniques receiving relocated §2/§3/§5 (F-20).
- **resources** — `audit-prompt-template.md` (F-20 decomposition), `severity-rubric.md` + `severity-calibration.md` (F-21 merge), `static-analysis-patterns.md` (F-24 tombstones, F-19 slug), `README.md` (F-12/F-19/F-22).
- **new files** — subfolder READMEs in `activities/`, `techniques/`, `resources/` (F-16).
- **preservation:** content removals (117KB resource decomposition, rule deletions, tombstone removal) route through the update-mode preservation-check discipline in scope-and-draft.
