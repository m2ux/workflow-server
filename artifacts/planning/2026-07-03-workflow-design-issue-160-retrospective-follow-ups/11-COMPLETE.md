# Workflow Design: workflow-design — Complete

> Update · 2026-07-03

## Summary

This session addressed GitHub issue [#160](https://github.com/m2ux/workflow-server/issues/160) — retrospective follow-ups from the `substrate-node-security-audit` remediation ([#159](https://github.com/m2ux/workflow-server/issues/159)) — as an update to the **`workflow-design`** workflow. It landed three review-integrity improvements (RE-2/RE-3/RE-4) that make the workflow self-enforcing on High-finding verification and stop the `enforcement-confirmed` checkpoint's recorded disposition from diverging from what actually ships. Two further gaps (#1 guard-script path-parameterization, #2/RE-1 loop-body checkpoint-id replay) were investigated, confirmed to require parent-repo/engine changes, and routed to companion deliverables.

## What Was Delivered

Shipped in PR [#162](https://github.com/m2ux/workflow-server/pull/162) → base `workflows`, branch `workflow/workflow-design-issue-160`, commits `11bd35f2` + `9fce1576`.

- **Activities:** `08-quality-review.yaml` **modified** — new `verify-high-findings` step (`kind: technique`, gated `is_review_mode != true`, placed before `classify-audit-findings`); new activity rule (RE-3); `enforcement-confirmed` checkpoint relabelled/re-defaulted (RE-4); version bump 1.4.0 → 1.5.0.
- **Techniques:** `techniques/verify-high-findings.md` **added** — adversarial refute-by-default re-derivation of High-tier findings, severity recalibration, and a lighter confirmation pass over surviving Mediums; outputs `verified_findings`.
- **Resources:** `techniques/README.md` and root `README.md` technique index/table **modified** — `verify-high-findings` rows added.
- **Variables / rules:** RE-3 activity rule "High findings must be independently verified before they drive remediation." `enforcement-confirmed` `add-enforcement` option gains `effect.setVariable { needs_audit_fixes: true }` and becomes the `defaultOption`; `classify-audit-findings` set-messages re-wired to classify on `verified_findings`.

## Design Decisions

Canonically recorded in the [assumptions log](assumptions-log.md) (RE-1 through RE-5) and the [planning README's Design Decisions section](README.md#design-decisions) — see those for the full Context / Decision / Rationale / Alternatives record. Key branch point:

- **RE-1 / #2 (checkpoint replay):** the confirmed fix was per-assumption dynamic checkpoint id (option A), *conditional* on impact-analysis confirming the engine resolves a templated loop-body checkpoint id. RE-5 investigation found it does **not** (loader matches static `c.id` at `workflow-loader.ts:265`; responses keyed by static id at `workflow-tools.ts:440`; static id at `activity.schema.ts:289-301`). The fix therefore has no YAML-only form and was routed OUT to the companion parent-repo track (engine change + coupled `03-requirements-refinement.yaml` edit), rather than being forced into this PR.

## Scope Outcome

All in-scope manifest items delivered ([scope manifest](README.md#scope-manifest) / [06-scope-and-draft](06-scope-and-draft.md)): the RE-2/RE-3/RE-4 change set on `08-quality-review.yaml`, the new technique, and index updates. Scope was **revised mid-session** at the `impact-confirmed` checkpoint (`revise` routing): #1 and #2/RE-1 were removed from this PR's blast radius and re-routed to companion deliverables once RE-5 confirmed both require engine/parent-repo work. No unflagged drift.

## Known Limitations & Deferrals

<!-- Canonical home. Other artifacts link here; do not duplicate this list elsewhere. -->
- **#1 [High] — worktree-aware guard scripts (deferred).** `scripts/check-all-refs.ts` and `scripts/check-binding-fidelity.ts` are hardwired to the main `../workflows` checkout and cannot validate a worktree. Path-parameterizing them (as `validate-workflow-yaml.ts` already is) needs a parent-repo (`src`/`scripts`) branch + PR — outside this workflow's authoring scope. Validating this session's own worktree required a multi-symlink staging-root workaround, empirically confirming the need.
- **#2 / RE-1 [Medium] — loop-body checkpoint-id replay (deferred).** The `assumption-decision` checkpoint (and loop-body checkpoints generally) replay a single recorded response across iterations because the loader matches checkpoint ids statically. Both candidate mechanisms (dynamic per-iteration id, and namespacing) require a **server engine change**; ships as a parent-repo change plus its coupled `03-requirements-refinement.yaml` dynamic-id edit.

## Workflow Retrospective

[messages: ~15 total, ~6 non-checkpoint · session quality: Minor friction]

### Observations

<!-- One line per signal, ONLY for categories that occurred. -->
- [checkpoint anomaly] The `assumption-decision` (4 assumptions), `dimension-confirmed` (5 dimensions), and `impact-confirmed` (on re-yield) checkpoints each **replayed a single recorded response across iterations** — the loop-body checkpoint-id replay defect (`03-requirements-refinement` `assumption-interview-loop`; root cause: loader keys responses by static `c.id`). The defect this session set out to fix (RE-1/#2) manifested **live three times during the session itself**, empirically confirming the problem statement.
- [scope revision] `impact-confirmed` was answered `revise` — impact analysis (RE-5) showed the #2 fix needs an engine change, so the scope was correctly narrowed mid-session and #1/#2 re-routed to companion deliverables. Not friction; the workflow's impact-analysis gate did its job.
- [process observation] All design-dimension and assumption checkpoints resolved to `accept`/confirm with no corrections or deferrals — a clean elicitation, consistent with a well-specified intake from issue #160.

### Recommendations

<!-- Prioritized, specific, actionable. -->
1. **High:** Loop-body checkpoints replay one recorded response across all iterations → land the RE-1/#2 engine fix (dynamic per-iteration checkpoint id or per-iteration namespacing) so `assumption-decision`, `dimension-confirmed`, and any forEach-body checkpoint record a distinct response per iteration (`03-requirements-refinement` `assumption-interview-loop`; engine: `workflow-loader.ts:265`, `workflow-tools.ts:440`, `activity.schema.ts:289-301`). This session is direct evidence.
2. **Medium:** Guards cannot validate a worktree, forcing a symlink staging workaround → path-parameterize `check-all-refs.ts` / `check-binding-fidelity.ts` with a `--root` arg (companion #1).

**Key takeaway:** The session cleanly delivered its in-scope review-integrity fixes and correctly deferred the two items needing engine/parent-repo work — while the deferred checkpoint-replay defect demonstrated itself live, giving the RE-1 fix concrete supporting evidence.
**Action required:** No — follow-ups #1 and #2/RE-1 are already tracked as companion deliverables off issue #160.
