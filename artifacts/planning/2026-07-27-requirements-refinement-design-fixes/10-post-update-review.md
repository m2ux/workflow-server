# Post-Update Review: requirements-refinement

**Date:** 2026-07-27
**Workflow:** requirements-refinement v1.2.0
**Files audited:** 21
**Mode:** post-update

Audit baseline is the committed state of `workflow/requirements-refinement` @ `37988f9a` in the session worktree. The MCP server serves v1.1.0 from the merged `workflows` branch, so `list_workflows` / `get_workflow` cannot deliver the post-commit definition — every finding below was derived from the worktree files, which is the state PR [#318](https://github.com/m2ux/workflow-server/pull/318) proposes.

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 2 |
| Medium   | 12 |
| Low      | 2 |
| Pass     | 16 |

**New findings introduced by this post-update pass: 2** (both requiring human input). **Applied in this pass: 6** — five workflow-definition edits plus one planning-register correction. The remaining 10 are dispositioned residuals and held judgements carried from the pre-commit audit, all re-confirmed present.

## Principle Compliance Findings

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| High | Correction cycle has no structural termination guarantee — cross-activity back-edge, no loop construct, counter advance carried by a technique output | `activities/04-validate-specification.yaml` · `techniques/update-specification.md` | No in-scope fix exists; documented structural limit |
| High | Canonical-document integrity text-only across three rule homes, zero `action: validate` | `workflow.yaml` · `techniques/TECHNIQUE.md` · `README.md` | Add `action: validate` or reclassify; held at Gate 2 |
| Medium | Five `rules.activity` entries dual-homed or restating Protocol; `[0]` list already drifted to 4 of 7 schemes | `workflow.yaml` `rules.activity[0]–[4]` | Delete the five; held Gate 2 removals |
| Medium | Three variables written but read by no gate (`source_coverage_complete`, `sources_confirmed`, `finalization_confirmed`) | `workflow.yaml` `variables[]` | Held as judgement A-3 |
| Medium | Terminal acknowledgement gate records nothing | `activities/06-report-failure.yaml` | Held as judgement A-5 |
| Medium | Three `revise` options carry no effect and no route, so the rework they offer cannot occur | `activities/01` ×2 · `activities/05` | Held as judgement A-7 |
| Medium | Protocol restates Output identity criteria; modes numbered as sequential phases | `techniques/validate-specification.md` · `techniques/update-specification.md` | Residual (E-1, E-4) |

(Detail in the [principle-findings satellite](10-principle-findings.md); this table is the decision surface.)

## Anti-Pattern Findings

| Severity | Entry | Location | Fix |
|----------|-------|----------|-----|
| Medium | **no-technique-resource-dual-home** | `techniques/validate-specification.md` `## Rules` | **APPLIED** — both rules deleted; `validation-rubric.md` is the single home |
| Medium | **no-rule-protocol-restatement** | `techniques/analyze-source.md` `## Rules` | **APPLIED** — `every-normative-statement-is-mapped` deleted |
| Medium | **no-technique-resource-dual-home** | `techniques/analyze-source.md` Protocol 4 | **APPLIED** — normative-statement vocabulary replaced with a cite to the rubric section |
| Low | **no-one-step-rules** | `techniques/update-specification.md` `## Rules` | **APPLIED** — `one-advance-per-correction-pass` deleted |
| Medium | **no-bind-mechanics-as-prose** | `techniques/intake-sources.md` Protocol 1 | **NEW** — not applied; narrows the declared intake boundary, needs a design call |
| Medium | **readme-orients-not-transcribes** | `activities/README.md` table | **NEW** — not applied; `preserve-readme-content` requires confirmation and headless is true |
| Low | **cited-home-owns-claim** | `03-follow-ups.md` F-9 rationale | **APPLIED** — F-9's basis restated; the 21 are other workflows' baseline staleness |
| Medium | **session-interaction-in-technique** | `techniques/intake-sources.md` Protocol 2 | Residual |
| Medium | **checkpoint-requires-decision** | `activities/06-report-failure.yaml` | Held (A-5) |
| Medium | **structure-backed-constraints** | three rule homes | Held (Gate 2) |
| Medium | **single-rule-authority** ×2, **no-rule-protocol-restatement** ×3 | `workflow.yaml` `rules.activity` | Held (Gate 2) |

(Detail in the [anti-pattern-findings satellite](10-anti-pattern-findings.md).)

## Schema Validation Results

| File | Result |
|------|--------|
| `workflow.yaml` + 5 activity YAMLs + 8 technique files | pass (14 of 14) |
| `validate-activities.ts` (corpus) | pass — 108 passed, 0 failed |
| `check-all-refs.ts` | pass — all `requirements-refinement` refs resolve, 0 unresolved |
| `check-binding-fidelity.ts` | pass — 0 new drift |
| `check-variable-model.ts` | pass — defaults, gates and `setVariable` effects coherent |
| `check-technique-template.ts` | pass — every technique follows the normative template |
| `check-activity-technique-overlap.ts` | pass — no activity technique duplicates a step binding |
| `check-resource-anchors.ts` | pass for this workflow — 3 corpus breakages, all in `meta` / `work-package` |

Re-run after the five remediation edits; all results above are post-fix.

### Precision on the binding-fidelity evidence

The guard's "21 baselined violations no longer present" is easy to read as credit to this change. Re-derived here, it is not: those 21 belong to `work-package` (14), `meta` (3), `workflow-design` (3) and `codebase-wiki` (1) — **zero** to `requirements-refinement` — and the guard reports the same 21 as absent when it scans the pre-change tree, so they are pre-existing baseline staleness that merging this branch will not affect. This corrects the rationale in [F-9](03-follow-ups.md), which assumed the merged corpus still carried them; the `--update-baseline` action F-9 recommends remains correct.

The workflow's sole baseline entry — `source_coverage_complete` declared-but-unconsumed in `validate-specification.md` — is **still live**, giving independent machine confirmation of judgement A-3. The precise claim for this change is: **0 new binding-fidelity drift; 1 pre-existing baselined violation unchanged.**

## Other pass summaries

| Pass | Count | Satellite |
|------|------:|-----------|
| Expressiveness | 5 | [08-expressiveness-findings.md](08-expressiveness-findings.md) |
| Conformance | 3 | [08-conformance-findings.md](08-conformance-findings.md) |
| Rule hygiene | 5 | [08-rule-hygiene-findings.md](08-rule-hygiene-findings.md) |
| Enforcement | 4 | [08-enforcement-findings.md](08-enforcement-findings.md) |
| Principles | 7 | [10-principle-findings.md](10-principle-findings.md) |
| Anti-patterns | 11 | [10-anti-pattern-findings.md](10-anti-pattern-findings.md) |

## Scope Audit

Clean. The committed diff against base `d9b30234` touches exactly the 16 files in the [scope manifest](06-scope-manifest.md) — no file changed outside it, no manifest item unaddressed. The five remediation edits in this pass touch 4 files, all already inside that same set, so remediation introduced no scope drift.

## Recommended Fixes

Prioritized by severity.

1. **Settle the three held judgements** (A-3 dead variables, A-5 terminal gate, A-7 rework destination). A-7 is the most consequential: three user-facing `revise` options presently do nothing when chosen.
2. **Accept or schedule the two High structural limits.** The correction cycle's termination cannot be structurally guaranteed without merging or renumbering activities, both out of scope; canonical-document integrity needs `action: validate` to stop being text-only.
3. **Decide the two new definition findings** — the `intake-sources` Protocol 1 bind prose ([F-12](03-follow-ups.md)), and the `activities/README.md` transcription columns ([F-13](03-follow-ups.md), which needs an AP-80 preservation confirmation).
4. **Publish the five applied definition edits.** They are uncommitted in the worktree; PR #318 does not yet reflect them.
