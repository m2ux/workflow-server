# Lean Change — Token Use Tracking (#232)

Simplifications applied in `src/utils/usage.ts` (iteration 1):

- Removed `addWorkflowTotals` yagni alias; `sumUsageTree` calls `addToWorkflowTotal` directly.
- Simplified `deriveTotalTokens` to `input_tokens + output_tokens`.
- Collapsed `buildActivityUsageEntry` optional fields into conditional spreads.
- Consolidated `recordActivityUsage` history `data` via destructuring + spread.

Test update: `tests/usage.test.ts` — `addWorkflowTotals` → `addToWorkflowTotal`.

Safety floor: 83 related tests pass (usage, session-schema, session-store, config).
