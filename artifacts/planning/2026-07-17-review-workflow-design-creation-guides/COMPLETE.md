# Workflow Design: workflow-design — Complete

> Update · 2026-07-17

## Summary

This update closed out the review of the `workflow-design` slim planning-artifacts creation-guide delivery (PR #254): it fixed the two compliance findings from that review (an undeclared `pattern_analysis` Output and `#template` cite drift), converted `quality-review`'s four per-pass audit checkpoints into automatic fixing per a mid-session user directive, and — after `validate-and-commit` caught 21 new binding-fidelity violations — closed every one before merge. The branch committed clean at `4e0f75df` with zero new binding-fidelity, schema, or reference violations.

## What Was Delivered

- **Activities:** modified `activities/08-quality-review.yaml` (removed the four per-pass disposition checkpoints — `expressiveness-confirmed`, `conformance-confirmed`, `rule-hygiene-confirmed`, `enforcement-confirmed` — in favor of automatic fixing, gated only by the unchanged critical-blocker gate), `activities/09-validate-and-commit.yaml` and `activities/10-post-update-review.yaml` (both bind `persist-report`'s new `report_content` input), and `activities/README.md` (Quality Review blurb updated to describe automatic fixing).
- **Techniques:** 24 unique technique files modified across two passes — a 7-file pass declaring the `pattern_analysis` Output and normalizing persist-guide cites to `#template`, and a 17-file binding-fidelity pass (9 files move an `#### artifact` marker onto the correct Output, 5 demote same-file-only Outputs to `{$local}`, `persist-report.md` gains a `report_content` input, `compile-report.md` gains two optional satellite-path inputs, `synthesize-update-specification.md` drops a redundant own input, and `publish-workflow-pr.md` / `work-package/techniques/update-pr/mark-ready.md` add explicit captures of two meta outputs).
- **Resources:** `resources/design-principles.md` (+ Principle §26, Creation Guide for Generated Documents), `resources/anti-patterns.md` (+ AP-116, `no-template-creation-guide`), `resources/README.md` (index blurb for §26).
- **Variables / rules:** no new workflow-level variables or rule slugs. `workflow.yaml` and the workflow `README.md` bump 1.24.3 → 1.24.4.

## Design Decisions

See the [planning README](README.md#-executive-summary) and the [design specification](03-design-specification.md) for the confirmed dimension deltas, and the [assumptions log](03-assumptions-log.md) for the (empty) assumption record — the update's scope and construct choices were locked at `spec-confirmed` with no open design judgements.

One drafting-time decision has no other home: `scripts/binding-fidelity-baseline.json` was left unshrunk even though 4 of its previously-baselined findings no longer reproduce after the binding-fidelity fix pass. The 4 stale entries are a false-negative risk (they mask nothing now, since the violations they describe are gone) rather than a false-positive one, and shrinking the baseline is a server-scripts change, not a workflow-content change — deferred out of this update's scope rather than bundled in.

## Scope Outcome

28 of 28 files delivered — the 23 files across the confirmed scope manifest's two tables ([06-scope-manifest.md](06-scope-manifest.md)), plus 5 Low-severity files delivered outside the manifest and accepted as-is at `post-update-review` rather than reworked ([10-post-update-review.md](10-post-update-review.md)): the `workflow.yaml` / `README.md` version bumps, the Principle §26 and AP-116 additions, and the accompanying `resources/README.md` blurb. No unaddressed manifest items.

## Known Limitations & Deferrals

- **Scope-manifest drift not reconciled** — the 5 Low-severity files above were justified but never folded into `06-scope-manifest.md`'s file tables, so the manifest under-counts the actual committed diff by 5 files. `10-post-update-review.md` recommends appending a third table; that edit is deferred, not applied.
- **Binding-fidelity baseline left stale** — `scripts/binding-fidelity-baseline.json` still lists 4 findings that no longer reproduce after this update's fix pass (net improvement, not a regression). Shrinking the baseline is out of scope for a workflow-content update.
- **Stale planning-README row** — the progress tracker's "Pattern analysis" (04) row still reads "⬚ Pending". This session's activity routing (`requirements-refinement` → `impact-analysis` directly) never entered the `pattern-analysis` activity, so the row is a leftover placeholder from earlier planning, not an undelivered artifact.

## Workflow Retrospective

[10 checkpoints resolved across 4 activities (2 `pre-commit-attestation` return-to-draft cycles) · session quality: Minor friction]

### Observations

- [correction] First `pre-commit-attestation` return-to-draft (of 7 activities exercised) — the user rejected the attestation and directed that `quality-review` fix findings automatically instead of pausing at a checkpoint after every audit pass — root cause: the four per-pass disposition checkpoints (`expressiveness-confirmed`, `conformance-confirmed`, `rule-hygiene-confirmed`, `enforcement-confirmed`) each gated on a decision that the fix cycle was always going to apply anyway, so the checkpoints added interruption without adding a real choice.
- [correction] Second `pre-commit-attestation` return-to-draft — `validate-and-commit`'s schema-validation step (`check-binding-fidelity.ts`) surfaced 21 NEW violations (20 dead-output, 1 orphan-input) at the gate closest to commit — root cause: binding-fidelity is checked only at `validate-and-commit`, so violations introduced during the earlier 7-file Output/cite drafting pass went undetected until the final gate instead of during `scope-and-draft`/`quality-review`.
- [checkpoint anomaly] `post-update-review`'s scope audit found 5 Low-severity files (version bumps, Principle §26, AP-116, and their README blurbs) delivered outside the confirmed scope manifest; the `post-update-disposition` checkpoint accepted them as-is rather than triggering a manifest correction pass — root cause: the scope manifest was not re-verified against the final commit range before this review (flagged as a Principle 2 partial).

### Recommendations

1. **High:** binding-fidelity violations surface only at `validate-and-commit`, forcing a late return-to-draft cycle → run the binding-fidelity check as part of `quality-review`'s audit passes (or as a gate before `scope-and-draft` exits), so dead-output/orphan-input defects are caught during drafting instead of at the gate closest to commit (`activities/08-quality-review.yaml`, `activities/09-validate-and-commit.yaml`).
2. **Medium:** the scope manifest can silently drift from the actual committed diff by session end → add a manifest-reconciliation check to `validate-and-commit` (diff the manifest's file list against `git diff --name-only` before declaring the pass clean) so drift is caught before commit rather than accepted post-hoc at `post-update-review` (`activities/09-validate-and-commit.yaml`, `activities/10-post-update-review.yaml`).
3. **Low:** when the workflow's own routing bypasses a numbered activity (e.g. `pattern-analysis`/04 this session), its planning-README progress row is left as a stale "Pending" template placeholder, which reads as unfinished work in an otherwise complete session → have activity entry (or `finalize-activity`) mark a never-entered activity "— Not applicable" instead of leaving the default "Pending" state (`work-package/techniques/manage-artifacts` progress-table guidance).

**Key takeaway:** Both return-to-draft cycles were productive corrections — one user-directed behavior change, one tooling-caught defect — but both point to the same fix: move binding-fidelity and scope-manifest checks earlier in the loop so `validate-and-commit` confirms a clean state instead of discovering problems in it.
**Action required:** no — recommendations captured here for a future `workflow-design` update.
