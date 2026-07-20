# Dual Transport Support — Complete

> Feature · branch `feat/dual-transport-support` · PR [#265](https://github.com/m2ux/workflow-server/pull/265) · 2026-07-20

## Summary

Added an opt-in HTTP transport (`StreamableHTTPServerTransport` at `/mcp`, plus `/health`/`/ready`) alongside the existing stdio transport, selected at startup via `--transport`/`--port`/`--host`, with stdio remaining the default and behaviorally unchanged. See the [implementation plan](06-work-package-plan.md) for the task breakdown.

**Status at close-out:** PR #265 is marked ready for review but **not yet merged** — see [Known Limitations](#known-limitations). This document records the delivered, self-reviewed state; the work-package status will move to "merged" once a maintainer completes the merge per the [instructed merge strategy](12-strategic-review-1.md).

## Results

- Build/typecheck/test: `npm run build` and `npm run typecheck` clean; `npx vitest run` for the new/extended suites clean — see [10-test-suite-review.md](10-test-suite-review.md) (178 pre-existing, unrelated failures documented there, traced to a missing `workflows/` checkout in the worktree, not this change).
- Success criteria: all met — no divergences. See [plan §Success Criteria](06-work-package-plan.md).
- Files changed: see the [change-block index](10-change-block-index.md).
- Design decisions: recorded in the [plan](06-work-package-plan.md#solution-design) and [assumptions log](02-assumptions-log.md). One decision not recorded elsewhere: chose the SDK's `StreamableHTTPServerTransport` over the plan's originally-specified `SSEServerTransport` — Context: the implementation plan predates the MCP SDK's move to `StreamableHTTPServerTransport` as the recommended HTTP transport. Decision: use `StreamableHTTPServerTransport`. Rationale: it is the actively maintained, more flexible transport (supports both streaming and plain-JSON responses over one `/mcp` route); `SSEServerTransport` is effectively legacy. Alternatives considered: implementing `SSEServerTransport` to match the plan literally — rejected as building against a transport the SDK itself is moving away from.

## Deferred Items

Deferred items: [register](06-deferred-items.md) — 2 open (D-1 auth/authz, D-2 session resumability/multi-process/eviction), 0 raised as issues (issue tracking was skipped for this work package).

## Known Limitations

- **PR not yet merged at close-out** — this work package's review loop found no reviewer feedback to act on (PR marked ready moments before this document was written); an actual human merge, using the [signed local squash-merge guidance](12-strategic-review-1.md), remains outstanding.
- **Unsigned commits** — all 6 original implementation commits on `feat/dual-transport-support` are unsigned (SR-1 in [12-strategic-review-1.md](12-strategic-review-1.md)); the user declined to re-sign them, so the merge guidance routes the actual merge commit through a signed local flow instead.
- **In-memory HTTP sessions** — no resumability or cross-process sharing; see D-2 above.
- **No authentication on the HTTP transport** — intended to sit behind network-level access control or a reverse proxy; see D-1 above.

## Lessons Learned

- The implementation plan's specifics (SSE transport class, Zod-based config, tool-registration extraction, nested `src/transports/` test layout) diverged from the actual codebase conventions in five places (see [02-assumptions-log.md](02-assumptions-log.md), CC-1/CC-2, PL-1..PL-4). None were blocking, but they meant codebase comprehension had to override the plan's letter to honor its intent — a plan authored without a comprehension pass first will generally need this reconciliation.

## Workflow Retrospective

[messages: 9 total, 0 non-checkpoint · session quality: Smooth]

No clarifications, corrections, or process-friction messages occurred — every user message was a checkpoint resolution (issue-verification, pr-creation, classification-and-path-confirmed, approach-confirmed, audit-findings-confirmed, unsigned-commits-prompt, review-findings, dco-sign-off-confirmation) answered promptly with an explicit decision. Work package was non-trivial (multi-hour, multi-activity) but the `skip-if-trivial` carve-in does not apply here since there is no resolved mechanical trace (`trace_tokens` were not accumulated in this session) and no user-message friction to report.

### Recommendations

None — no repeated corrections, frustration, or missing-guidance signals to act on this run.

**Key takeaway:** The workflow ran end-to-end through nine activities with zero corrective user turns; the only friction was internal to the agent (reconciling the implementation plan with actual codebase conventions during comprehension), already captured in Lessons Learned.
**Action required:** no
