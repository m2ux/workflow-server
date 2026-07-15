# Token Usage — Token Use Tracking (#232)

> Work package QOBJOC · session index `QOBJOC` · 2026-07-15

## Summary

No usage figures were relayed during this work-package run. The orchestrator did not pass a `usage` object on `next_activity` calls, so `session.json` carries no `usage` field and no per-activity cost was recorded. This is expected graceful degradation (SC-6) while corpus Task 7 (orchestrator populate instruction) remains outstanding.

**Estimated cost:** not available (no usage relayed)

## Per-Activity Usage

| Activity | Input | Output | Total | Cache read | Cache write (5m) | Cache write (1h) | Model | Cost (USD) |
|----------|------:|-------:|------:|-----------:|-----------------:|-----------------:|-------|------------|
| — | — | — | — | — | — | — | — | — |

## Per-Workflow Totals

| Scope | Input | Output | Total | Cost (USD) | Price table |
|-------|------:|-------:|------:|-----------:|-------------|
| work-package (QOBJOC) | — | — | — | — | — |

## Notes

- Cost figures are estimates for API-key billing contexts; subscription plans may not map to per-token cost.
- Once corpus Task 7 instructs the orchestrator to relay harness-reported usage on each `next_activity`, future runs will populate this artifact automatically via the completion renderer (Task 8).
- Server-side capture is implemented on PR #233 (`92536815`); this run exercised the omission path only.
