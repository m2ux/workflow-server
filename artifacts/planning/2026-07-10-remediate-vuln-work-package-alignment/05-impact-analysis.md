# Impact Analysis — remediate-vuln ↔ work-package alignment

Three change surfaces: remediate-vuln content, work-package content (stealth_mode gates), server loader seam.

## 1. remediate-vuln (workflows repo — dedicated worktree)

| File | Impact | Change |
|------|--------|--------|
| workflow.yaml | direct | v1.1.0 → 2.0.0; add `stealth_mode` (default true); mirror ~30 wp variable declarations with defaults (incl. `validation_results`, assumption/research/comprehension/implement/post-impl families, `reference_path`, `component_name`, `worktree_created:false`, `gitnexus_indexed:false`, `provenance_log_path`); REMOVE `is_sec_vuln_mode`, `has_failures`; refresh stale descriptions (L4); add outbound-query privacy rule |
| activities/01-start.yaml | direct | replace set-security-mode target with `stealth_mode`; add resolve-reference (reference_path/component_name from private checkout), detect-project-type (`work-package::project-type-detection`), verify-signing-precondition (action, mirrors wp) |
| activities/02-strategic-review.yaml | direct | mirror wp 12 v2.7.0: add verify-readme (`work-package::manage-artifacts::verify-readme-conforms`), changes-folder (`work-package::strategic-review::changes-folder`); re-bind analysis to `work-package::strategic-findings-analysis`; reshape review-findings checkpoint (findings-gated, blocking, +selective-fixes/+defer effects); REMOVE announce-completion log step (L1); keep unsigned-commits/resign + private deviations |
| activities/03-submit.yaml | direct | add dco-sign-off (`work-package::dco-provenance::record-attestation`) + dco-sign-off-confirmation checkpoint (privacy-adapted message) before push |
| techniques/strategic-review/review-scope.md | direct | port #203 authored-surface three-dot diff with private base discovery (security remote's default branch, no `gh pr view`); keep unsigned-commit outputs |
| techniques/analyze-findings.md | **REMOVED** | superseded by `work-package::strategic-findings-analysis` (same capability + `strategic_findings_summary` output the reshaped checkpoint needs) |
| README.md | direct | L3: borrowed-activity table, stealth_mode contract, mermaid flow |
| activities/README.md, techniques/README.md | indirect | tables/version refresh |
| Unaffected | — | security-setup/* (6), secure-submit/* (3), strategic-review/{apply-cleanup, document-findings, recommend-cleanup, resign-commits, summarize-architecture, verify-fragment, TECHNIQUE.md} |

## 2. work-package (workflows repo — same worktree, separate commits)

| File | Impact | Change |
|------|--------|--------|
| workflow.yaml | direct | v3.27.0 → 3.28.0; declare `stealth_mode` (boolean, defaultValue false, consumer-agnostic description: suppresses public-disclosure side-effects when a private consumer runs shared activities) |
| activities/06-plan-prepare.yaml | direct | gate update-pr step and the gh-auth validate action with `stealth_mode != true` (AND-composed with existing conditions) |
| activities/07-assumptions-review.yaml | direct | AND `stealth_mode != true` into post-summary-jira, post-summary-github, post-summary-review conditions |
| activities/05-implementation-analysis.yaml | inspect at draft | review-baseline-state ungated — verify it does not touch `gh`/PR in create mode; gate if it does |
| All other wp files | unaffected | gates are additive; default-false keeps wp behavior identical |

## 3. workflow-server (main repo — feature branch)

| File | Impact | Change |
|------|--------|--------|
| src/loaders/workflow-loader.ts | direct | expose per-activity `sourceWorkflowId` (map exists at load; persist for tool access) |
| src/loaders/technique-loader.ts | direct | `composeActivityTechnique`/`composeTechnique` accept source-workflow scope; unqualified refs in a borrowed activity resolve [source-workflow → meta] |
| src/tools/resource-tools.ts | direct | get_technique threads the current activity's source workflow (resource-tools.ts:568) |
| src/tools/workflow-tools.ts | direct | get_activity eager bundling + manifest candidate matching use the same scope (workflow-tools.ts:89-95, 449) |
| src/utils/binding-provenance.ts | direct | provenance context group-shorthand resolution uses source scope (binding-provenance.ts:102-105) |
| src/utils/validation.ts | indirect | manifest fidelity matching — id-based, expected unchanged; verify |
| tests + baselines | indirect | new resolution tests; `check:binding` baseline may shrink (borrowed-activity refs start resolving); e2e snapshots |

Call-site blast radius for `composeActivityTechnique` (grep-derived; GitNexus index stale for these symbols): the four direct consumers above. Risk MEDIUM: parameter is additive; non-borrowed activities keep `sourceWorkflowId == workflowId`, so behavior is unchanged outside the borrowed-activity case.

## Integrity checks

- Transition chains: stitched graph closed before and after (no activity additions/removals; in-activity changes only). review-findings' reshaped options keep the same transition targets (submit / plan-prepare).
- Reference integrity: all new refs verified resolvable from an rv session (`work-package::strategic-findings-analysis`, `::dco-provenance::record-attestation`, `::manage-artifacts::verify-readme-conforms`, `::strategic-review::changes-folder`, empirical probe 2026-07-10). Removal of `analyze-findings.md` orphans no other reference (single binding site in 02-strategic-review, re-bound).

## Removals requiring confirmation

1. `techniques/analyze-findings.md` (file) — superseded by wp op with identical capability + richer output.
2. `is_sec_vuln_mode` variable — renamed/replaced by `stealth_mode` (contract preserved, name generalized per A-002).
3. `has_failures` variable — dead: wp's validate loop reads `validation_results.*` (nothing reads it in the stitched graph).
4. 02-strategic-review announce-completion log step — duplicates the activity-level progress rule.
5. review-findings checkpoint's old non-blocking/auto-advance shape — replaced by wp's findings-gated blocking shape (options acceptable/fix/defer preserved; auto-advance dropped intentionally: this workflow's disposition should not self-resolve).
