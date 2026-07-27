# Post-Update Review: meta

**Date:** 2026-07-27
**Workflow:** meta v5.9.0
**Files audited:** 9 (`b3dc2506..aea417ec` — +106 −18)
**Mode:** post-update

Audit of the committed state on `workflow/meta-conditional-session-resume` ([PR #311](https://github.com/m2ux/workflow-server/pull/311)). Scope includes the user-directed `AP-127. bag-value-as-literal` entry on `workflow-design/resources/anti-patterns.md`, which rides the same branch outside the 8-item [scope manifest](07-scope-manifest.md).

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High     | 0 |
| Medium   | 0 |
| Low      | 6 |
| Pass     | 6 of 6 YAML files; 22 of 29 principles clean |

Six Low findings, all single-sentence text corrections in files the branch already touches. No behavioural defect: the new gate, the `exists` / `notExists` pair, and the nested-`workflowId` candidate filter all hold under the reference condition evaluator.

## Principle Compliance Findings

| Severity | Finding | Location | Fix |
|----------|---------|----------|-----|
| Low | #13 Separate Contract from Procedure — Violation; #15 Phase by Sequenced Outcome — Partial | `techniques/workflow-engine/detect-resume-intent.md` Protocol step 2 | Delete the pure-projection phase |
| Low | #5 Maximize Schema Expressiveness — Partial | `README.md` File Structure, `workflow.yaml` entry | Drop the inventory counts |
| Low | #6 One Authoritative Home — Partial | `techniques/workflow-engine/scan-saved-sessions.md` `saved_session_candidates` | Home sub-field sourcing in Protocol only |

(Detail in the [principle-findings satellite](10-principle-findings.md); these are the principle-side classification of the anti-pattern rows below, not additional defects.)

## Anti-Pattern Findings

| Severity | Entry | Location | Fix |
|----------|-------|----------|-----|
| Low | `contract-not-procedure` | `techniques/workflow-engine/detect-resume-intent.md` L25 | Delete Protocol step 2; step 1 emits `{resume_intent_requested}` |
| Low | `readme-orients-not-transcribes` | `README.md` L124 | Drop `(19 variables, 2 rules)` |
| Low | `no-rationale-in-description` | `techniques/workflow-engine/scan-saved-sessions.md` L26 | Cut the "so both arms are needed…" clause |
| Low | `procedure-in-io-contract` | `techniques/workflow-engine/scan-saved-sessions.md` L20 | Reduce the Output to shape and meaning |

(Detail in the [anti-pattern-findings satellite](10-anti-pattern-findings.md).)

## Schema Validation Results

| File | Result |
|------|--------|
| `meta/workflow.yaml` | pass |
| `meta/activities/00-discover-session.yaml` | pass |
| `meta/activities/01-initialize-session.yaml` … `04-end-workflow.yaml` | pass (4 files) |
| `meta/techniques/**` (132 files) | pass — no unanchored protocol references |

`pass_count` = **6**, `fail_count` = **0**. `check-all-refs` — 0 unresolved across all workflows; both new leaves resolve. `check-binding-fidelity` — 0 NEW against the baseline carrying [F-1](11-follow-ups.md)'s two rows. `check-variable-model` and `check-technique-template` clean. `check-resource-anchors` reports 3 broken links, none in a changed file — pre-existing on `main`.

## Other pass summaries

| Pass | Count | Satellite |
|------|------:|-----------|
| Expressiveness | 0 | — |
| Conformance | 2 | [08-conformance-findings.md](08-conformance-findings.md) |
| Principles | 4 | [10-principle-findings.md](10-principle-findings.md) |
| Anti-patterns | 4 | [10-anti-pattern-findings.md](10-anti-pattern-findings.md) |
| Scope | 0 | this document, below |

**Session finding total: 6 distinct defects** — the 4 anti-pattern rows plus the 2 conformance rows. The 4 principle rows classify three of the anti-pattern rows and are not counted twice.

## Scope Audit

8 of 8 [scope manifest](07-scope-manifest.md) files changed; no manifest item unaddressed; no unplanned file beyond the user-directed AP-127 addition. Zero drift.

One content-level divergence, no severity assigned: manifest row 2 and [design specification](03-design-specification.md) G3 specify *replacing* `00-discover-session.yaml`'s activity rule, while the committed state *deletes* the rule and the `rules:` key — the pre-commit R-1 repair, which reaches the stronger `no-activity-prose-rules` end state. The spec, A-4, and [09-file-review-note.md](09-file-review-note.md) still describe the superseded shape; [08-verified-findings.md § Resolution](08-verified-findings.md#resolution) is the accurate record. Reconciling those three artifacts is carried to [follow-ups](11-follow-ups.md).

## Recommended Fixes

All six were in-place text edits to files already on the branch, none changing runtime behaviour.

1. `detect-resume-intent.md` — delete Protocol step 2, fold the emit into step 1.
2. `scan-saved-sessions.md` — cut the rationale clause from Protocol step 3; reduce the `saved_session_candidates` description to shape and meaning.
3. `meta/README.md` — drop the inventory counts from the `workflow.yaml` tree entry.
4. `anti-patterns.md` AP-127 — add the `factor-repeated-paths` redirect; recast Detect's closing sentence as a no-declared-slot carve-out.

## Remedia Outcome

**Applied in one iteration; the audit is now clean.** `review_findings_count` = **0** across all five passes (expressiveness, conformance, principles, anti-patterns, scope). Per-finding edits and post-fix validation are recorded in [anti-pattern findings § Resolution](10-anti-pattern-findings.md#resolution), [conformance findings § Resolution](08-conformance-findings.md#resolution), and [principle findings § Resolution](10-principle-findings.md#resolution).

| Severity | Before | After |
|----------|-------:|------:|
| Critical | 0 | 0 |
| High | 0 | 0 |
| Medium | 0 | 0 |
| Low | 6 | 0 |

Four files were edited — `meta/techniques/workflow-engine/detect-resume-intent.md`, `meta/techniques/workflow-engine/scan-saved-sessions.md`, `meta/README.md`, `workflow-design/resources/anti-patterns.md` — all already on the branch, so the change set is unchanged at 9 files and no scope-manifest item moved. `meta` stays at v5.9.0 and `scan-saved-sessions` at v1.1.0: every edit removes redundant prose from content this branch introduced, so no additional version bump is warranted.

Post-fix guards: `validate-workflow-yaml` 6 pass / 0 fail, `check-all-refs` 0 unresolved, `check-binding-fidelity` 0 NEW, `check-technique-template` and `check-variable-model` clean, `check-resource-anchors` unchanged at the 3 pre-existing failures on `main`.

**The branch carries uncommitted changes and requires a re-commit before retrospective** — `needs_recommit` is true with `review_findings_count` at 0, routing back through `validate-and-commit` ([F-4](11-follow-ups.md)).
