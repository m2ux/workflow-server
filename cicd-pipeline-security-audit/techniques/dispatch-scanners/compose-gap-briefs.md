---
metadata:
  version: 2.0.0
---

## Capability

Compose targeted re-dispatch briefs for each coverage gap in the verification report — producing `{worker_briefs}` (possibly empty) for meta [orchestration-patterns](../../../meta/techniques/orchestration-patterns/TECHNIQUE.md)::[dispatch-workers](../../../meta/techniques/orchestration-patterns/dispatch-workers.md). Domain prompt assembly only; dispatch is a separate activity step.

## Outputs

### worker_briefs

Ordered `{ id, description, prompt }` array — one brief per gap requiring re-dispatch. Empty when `{verification_report}` finds zero gaps.

## Protocol

### 1. Compose Gap Briefs

- For each gap in `{verification_report.gaps}`, compose a narrowed scanner prompt for the responsible scanner (unscanned files or skipped patterns only), including the same bootstrap and output-schema requirements as [compose-scanner-briefs](./compose-scanner-briefs.md).
- Emit `{worker_briefs}` with stable `id` values (scanner designator plus gap discriminator when the same scanner appears more than once).
- When the verification report finds zero gaps, emit an empty `{worker_briefs}` array — the following dispatch step no-ops.
- Do not dispatch from this operation.
