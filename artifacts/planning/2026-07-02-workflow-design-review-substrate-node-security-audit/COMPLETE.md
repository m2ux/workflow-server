# Workflow Design: substrate-node-security-audit — Complete

> Update (review → remediation) · 2026-07-02

## Summary

This session reviewed the `substrate-node-security-audit` workflow (v4.16.0) against the workflow-design principles, then remediated it to v4.17.0. The review surfaced 23 findings; an adversarial verification pass recalibrated the 7-strong High tier down to a single confirmed High (F-05) plus one verified false positive, materially changing what drove remediation. All 20 remediated findings landed in commit `a3479f81` (draft PR [#159](https://github.com/m2ux/workflow-server/pull/159) vs `workflows`) with zero new findings introduced and no schema/contract break.

## What Was Delivered

Against v4.16.0 (27-file diff: 16 modified / 9 created / 2 removed):

- **Activities:** modified `02-reconnaissance`, `03-primary-audit`, `04-adversarial-verification`, `05-report-generation`, `06-ensemble-pass`, `11-sub-static-analysis`. Activity set unchanged (14 activities); transitions and `initialActivity` preserved.
- **Techniques:** added the `dispatch-sub-agents/` group (`TECHNIQUE.md` + 5 ops: `assign-roster`, `route-leads`, `dispatch-concurrent`, `collect-results`, `verify-output-files`); removed the `dispatch-sub-agents.md` monolith; modified `score-severity`, `map-vulnerability-domains`, `map-codebase`, `search-pattern-catalog`.
- **Resources:** thinned `audit-prompt-template.md` (1017→302 lines, §2/§3/§5 relocated to owning techniques/resources); merged `severity-calibration.md` into `severity-rubric.md` (former removed); trimmed `static-analysis-patterns.md` (tombstones + `## Overview`); added subfolder READMEs to `activities/`, `techniques/`, `resources/`.
- **Variables / rules:** pruned unread gate variables (`agents_assigned`, `agents_dispatched`); wired the three retained gate vars into structural F-05 conditions; de-CAPS'd and regrouped rule prose (F-03/F-04), deduped cross-level rules (F-02), moved rationale tails to `CHANGELOG.md`. Version bumped 4.16.0 → 4.17.0.

## Design Decisions

Recorded in the [assumptions log](assumptions-log.md) (RR-1–RR-10, RS-1–RS-4) and the [planning README](README.md) Design Decisions section — see those for the full record. The four user-confirmed design judgements (RS-1..RS-4) were: hybrid F-05 gate enforcement (`condition` + `validate`); split-and-collapse the dispatch/verify/merge bindings while preserving the AP-73 roster exception; the §2/§3/§5 relocation with a surviving thin `audit-prompt-template.md`; and a minor version bump. No drafting-time decision arose that is recorded nowhere else.

## Scope Outcome

All manifest items delivered ([scope manifest in README](README.md#scope-manifest)); the [post-update review](10-post-update-review.md) scope-discipline audit confirmed no drift — the committed file set matches the manifest, and the discretionary no-changes (F-15 band-split, F-23 in-domain, `start-here.md:13`) were respected.

## Known Limitations & Deferrals

- **Medium/Low tiers were not independently re-verified.** Adversarial verification covered only the 7 High findings. The 16 Medium/Low findings were remediated on their first-pass audit judgements; their severities and diagnoses were not re-checked against ground truth the way the High tier was.
- **F-18 partial (2 of 3).** `verify-sub-agent-output`'s `every-protocol-executed-mechanically` slug was left as-is — a defensible retention under the Low "review" disposition, not a completed fix.
- **F-15 numbering gap not closed.** The 08/09 activity-file gap remains; it is documented as a band-split in the new `activities/README.md` rather than renumbered.

## Lessons Learned

- A review's High tier should be independently verified before it drives remediation. Adversarial re-verification cut the confirmed High count from 7 to 1 and caught a false positive (F-01) that would otherwise have produced a no-op "fix" — verification is cheap relative to remediating a phantom.

## Workflow Retrospective

[messages: 14 checkpoint responses across the session, 0 free-form user chat messages · session quality: Smooth]

### Observations

<!-- This was a fully orchestrated multi-agent design session: user interaction was entirely
     via checkpoint option selections (no free-form clarifications, corrections, or frustration
     signals). Observations below are checkpoint-pattern anomalies and process friction, not chat signals. -->

- [checkpoint-anomaly] `requirements-refinement::assumption-decision` fired once then **replayed 3×** (one checkpoint answered `accept`, then re-presented for the next assumptions in the same loop) — 4 assumptions (RS-1..RS-4) resolved through a single checkpoint id via replay rather than distinct gates.
- [checkpoint-pattern] The `quality-review::review-disposition = fix-issues` selection is the pivot that re-entered `intake-and-context` in UPDATE mode — a review→remediate round-trip inside one session, with `is_review_mode` flipping false and `create-completion-doc` therefore becoming in-scope for this terminal activity.
- [process-friction] Repo guards (`check-all-refs`, `check-binding-fidelity`, `validate-workflow-yaml`) are hardwired to the main `workflows/` checkout, but all edits lived in a dedicated worktree. Validation required pointing the guards at the worktree via a staging root — real friction, and a correctness hazard if an agent forgets and validates the stale main checkout instead.
- [checkpoint-default] Second-pass `quality-review::enforcement-confirmed = accept-text-only` reads as accepting text-only gate enforcement in the very session whose one confirmed High (F-05) was a text-only-enforcement defect that was then remediated structurally — the checkpoint's disposition set and the actual remediation diverged, so the gate under-described what shipped.

### Recommendations

1. **High:** Guards assume the main checkout → make the ref/binding/schema guards worktree-aware (accept a `--root`/staging-root argument, or auto-detect the active worktree) so an isolated-worktree remediation validates the code it actually ships, not the stale main checkout. (`.engineering/` guard scripts; validate-and-commit + post-update-review)
2. **Medium:** `assumption-decision` re-presents through replay rather than a batch or per-assumption gate → either present the assumption set as one batched decision, or give each assumption a distinct checkpoint id, so the history is legible and replay isn't overloaded to mean "next assumption." (workflow-design `requirements-refinement` activity)
3. **Medium:** A review's High tier drove remediation before verification recalibrated it 7→1 → make adversarial High-tier verification a first-class step of `quality-review` (not an ad-hoc addendum), and extend a lighter verification pass to the Medium tier that survives into a fix. (workflow-design `quality-review` activity; `08-quality-review-verification.md` was produced out-of-band)
4. **Low:** `enforcement-confirmed = accept-text-only` mislabeled a session that shipped structural enforcement → align the enforcement checkpoint's option semantics with the remediation actually taken, or record the divergence in the disposition. (workflow-design `quality-review::enforcement-confirmed`)

**Key takeaway:** The design workflow ran smoothly end-to-end (7/7 update-mode activities, CLEAN post-update verdict); the friction is in tooling and checkpoint ergonomics — guards that don't follow the worktree, and an assumption checkpoint whose replay overloads a single id — not in the workflow's design logic.
**Action required:** yes — file an issue for the worktree-aware guards (Recommendation 1); Recommendations 2–4 are workflow-design polish for a future review pass.
