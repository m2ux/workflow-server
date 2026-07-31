# Context Fidelity and Observability — Complete

> Enhancement · branch `feat/365-context-fidelity-observability` · PR [#366](https://github.com/m2ux/workflow-server/pull/366) · 2026-07-31 · package **0.2.0**

## Summary

Delivered server-side S2–S5 for [#365](https://github.com/m2ux/workflow-server/issues/365): planning-folder artifact reconciliation (warn-only), DELTA usage with plain-sum token aggregate and optional worker attribution, block-dedup coverage (`provenance_note` + split inherited note/items) with bench measurement hooks, and observability (resource warnings both modes, hybrid step events, per-agent trace/history/usage filters and fetch fidelity). Implementation plan: [06-work-package-plan.md](06-work-package-plan.md). ADR: [0008-context-fidelity-observability](../../adr/0008-context-fidelity-observability.md). Stakeholder review: **pass** ([13-2026-07-31-pr366-review-analysis.md](13-2026-07-31-pr366-review-analysis.md)).

## Results

- Validation: **787 tests passed** (`npm run test:ci` on the feature tip). No standalone `NN-validation.md` artifact was produced; the suite result is the validation witness.
- Success criteria: all SC-1–SC-14 and RE-8 met for automated coverage ([plan / requirements](03-requirements-elicitation.md#success-criteria)); S4 bench arms (SC-7/SC-9) remain manual host measurements as designed.
- Files changed: see [10-change-block-index.md](10-change-block-index.md) (20 files, ~823 / −144 at tip `b5cc8985`).
- Design decisions: [06-work-package-plan.md](06-work-package-plan.md#proposed-approach), [02-assumptions-log.md](02-assumptions-log.md), ADR-0008.

## Open Work

- Follow-ups: [register](follow-ups.md) — 1 open (F-1 undraft).
- Deferred items: [register](deferred-items.md) — 4 open (D-1–D-4); D-1/D-2 → #338; D-4 price deferred.

## Cost

Token use and cost estimate: [14-token-usage.md](14-token-usage.md).

## Known Limitations

- **PR #366 still draft** — GitHub REST `PATCH …/pulls/366` with `draft=false` returns 200 but leaves `draft: true`. Undraft requires GraphQL `markPullRequestReadyForReview` or `gh pr ready`, both outside the REST-only agent policy ([F-1](follow-ups.md)). Review is a pass; human undraft before merge visibility.
- **PR not merged at close-out** — branch is review-approved and open; merge is a separate host action after undraft.
- **D-4 price deferred** — no config/hard-coded price table and no money field on usage views; token aggregate only.
- **S2 warn-only** — undeclared files are named in `_meta.validation`; corpus wholesale staging still commits undeclared paths if the orchestrator ignores the warning ([D-1](deferred-items.md) / #338).
- **Partial usage ledger** — this run recorded 8 of 29 dispatches; totals are a floor ([14-token-usage.md](14-token-usage.md)).
- **In-memory trace empty at close-out** — `get_trace` returned zero events; mechanical evidence is session history ([14-session-trace.md](14-session-trace.md)).

## Lessons Learned

- Sandbox denial is not host auth failure: AGENTS.md already requires unsandboxed git/gh with tokens unset; workers still treated SSH permission errors as broken credentials (R-1).
- Stakeholder “defer price” (RE-4) correctly kept SC-5 on tokens only — research retained list-price notes for a later package without polluting the ship surface.

## Workflow Retrospective

[messages: checkpoint-heavy full path · session quality: Minor friction]  
[trace: [14-session-trace.md](14-session-trace.md) · cost: [14-token-usage.md](14-token-usage.md)]

### Observations

- [trace-retry] Sandboxed `gh`/SSH failures misread as broken host auth (plan-prepare false follow-ups; implement left commits local until orchestrator push) — AGENTS.md already states the fix; spawn prompts did not force unsandboxed remote ops — **R-1**.
- [process] REST-only undraft gap left PR #366 draft after mark-ready — host limitation, not review failure — **F-1**.
- Usage `record_usage` coverage dropped after requirements-elicitation (8/29 dispatches) — understates run token floor; harness/orchestrator discipline gap.
- Research five-dispatch path (interview + RE-4) was the densest tool surface; warranted by open cumulative-vs-delta and price decisions.
- No `vw` clusters or error storms on the mechanical history; fidelity path was clean once remote ops ran unsandboxed.
- Stakeholder review pass with empty GitHub review threads — close-out not blocked on undraft.

### Recommendations

1. **High:** Mandate unsandboxed shell + `unset GH_TOKEN GITHUB_TOKEN` in disposable-worker spawn / AGENTS.md callouts so sandbox SSH denials are not filed as auth outages ([R-1](follow-ups.md)).
2. **Medium:** Document REST undraft limitation next to PR-ready steps (or allow a single human `gh pr ready` checklist item) — [F-1](follow-ups.md).
3. **Medium:** Require `record_usage` on every activity exit (including resume) so close-out ledgers are complete floors, not early-run slices.

**Key takeaway:** The package shipped clean code and a review pass; the recurring friction was environment (sandbox vs keyring) and host API shape (REST draft), not the S2–S5 design.  
**Action required:** yes — human undraft PR #366 (`gh pr ready 366` or UI); optional later issues for R-1 spawn prose and D-4 price package.
