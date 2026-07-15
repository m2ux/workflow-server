# Strategic Review — Token Use Tracking (#232)

> strategic-review · main → feat/232-token-use-tracking-and-cost-estimation · 2026-07-15

**Diff:** 13 files, +757 / −6 (commit `92536815` on `feat/232-token-use-tracking-and-cost-estimation`)

## Findings Summary

4 findings — 2 major (commit hygiene), 1 minor (PR body), 1 informational (price-table design). See sections below.

## Scope Assessment

All 13 implementation files in [10-change-block-index.md](10-change-block-index.md) map to requirements SC-1..SC-6. One accidental change outside that surface:

| File / Change | In Scope? | Notes |
|---------------|-----------|-------|
| `workflows` (submodule gitlink) | No | Submodule pointer deleted in worktree — not in change-block index, not required by any requirement |

## PR Body Conformance

Body conforms — stale "Implementation (coming next)" removed; Changes section updated to past-tense on PR #233 (2026-07-15).

## Minimality Assessment

| Question | Answer | Notes |
|----------|--------|-------|
| Is every changed file necessary for the fix? | No | `workflows` submodule deletion is accidental — restore before commit |
| Is every added line of code necessary? | Yes | Lean audit applied; no debug artifacts |
| Are all new dependencies required? | Yes | No new npm dependencies |
| Are all configuration changes required? | Yes | Price table required for SC-3/SC-4 |
| Is the solution as simple as it could be? | Yes | Post lean-coding pass |

## Investigation Artifacts

No investigation artifacts found in the authored surface.

## Over-Engineering

No over-engineering findings. Anthropic-seeded `DEFAULT_PRICE_TABLE` is a scoped design choice (see SR-4), not unused infrastructure.

## Orphaned Infrastructure

| ID | File | Description | Action | Rationale |
|----|------|-------------|--------|-----------|
| SR-2 | `workflows` | Git submodule link removed (`deleted file mode 160000`) | Restore submodule pointer | Accidental worktree artifact; corpus changes are out of server v1 scope |

## Operational / Commit Hygiene

| ID | Severity | Finding | Action |
|----|----------|---------|--------|
| SR-1 | Major | ~401 lines across 12 modified + 2 untracked files (`src/utils/usage.ts`, `tests/usage.test.ts`) exist only in the working tree — branch range vs `main` contains a single init commit | Commit implementation to `feat/232-token-use-tracking-and-cost-estimation` before submission |
| SR-3 | Minor | PR #233 body not updated post-implementation | Re-render PR body via plan-prepare `update-pr::render` pattern |

## Design Note (Informational)

| ID | Severity | Finding | Disposition |
|----|----------|---------|-------------|
| SR-4 | Info | Anthropic-seeded price table and cache multipliers — stakeholder harness-agnostic concern | Non-blocking. Cross-ref [09-code-review.md](09-code-review.md) CR-1/CR-2. Token metrics are harness-agnostic; cost degrades to `null`. Defer pricing decoupling or accept for v1. |

## Cleanup Actions Taken

| Action | Files Affected | Commit |
|--------|----------------|--------|
| SR-1: Committed server implementation | 13 files (`schemas/`, `src/`, `tests/`) | `92536815` on `feat/232-token-use-tracking-and-cost-estimation` |
| SR-2: Restored `workflows` submodule | `workflows` gitlink | Restored via `git submodule update --init`; not included in implementation commit |
| SR-3: Updated PR #233 body | PR description | Live body re-rendered to past-tense Changes section |

SR-4 accepted for v1 (informational — see [09-code-review.md](09-code-review.md) CR-1).

## Review Result

**Outcome:** Minor cleanup completed — ready for submission

**Rationale:** SR-1/SR-2/SR-3 addressed. Implementation remains focused and in-scope; validation passed. SR-4 is a non-blocking stakeholder design note.

**Next Step:** Proceed to submit-for-review
