# Code Review — #365 / PR #366 Context Fidelity and Observability

Scope: lean-coding (over-engineering) audit of the implemented change set vs `origin/main` merge-base `3b72a760`. Correctness, security, and performance are out of scope here.

## Lean-Coding Audit

Pass scope: `src/` + tests that landed with #365 (`feat` + `test` commits on `feat/365-context-fidelity-observability`). Lens: ponytail over-engineering taxonomy only.

src/tools/workflow-tools.ts:L21: delete unused `parseResourceRef` import — only `qualifyResourceId` / `extractResourceIds` are used. Saves 1.
src/tools/workflow-tools.ts:L1186-1202 + src/tools/resource-tools.ts:L739-755: shrink duplicated idempotent `step_started` push (same predicate + history shape) — one shared helper e.g. `appendStepStartedIfAbsent(draft, {activity, stepId, agentId, timestamp})`. Saves ~12.
src/tools/workflow-tools.ts:L648-666: shrink artifact-cover name set (four `coveredNames.add` variants + stem + `f.includes(id)`) — single normalizer of declared id/name → candidate basenames, then Set membership. Saves ~8.
src/utils/delivery.ts:L143-180: shrink note/items split branches — same hash/lookup/stage pattern twice; one `stageField(next, field, keyPrefix)` for `note` and `items`. Saves ~10.
src/logging.ts:L98-99: shrink two-line comment above three-line ternary — one short why or drop. Saves ~1.
tests/fetch-observability.test.ts:L853-857: delete no-op asserts in PR366-TC-23 (`expect(stamps.length).toBeGreaterThanOrEqual(2)` after the same on `started.length`) — keep one length check; optional distinct-ts is comment-only. Saves ~3.
tests/mcp-server.test.ts:L1170: delete weak `every(e => e.aid === 'worker-aid-a' || e.aid === undefined)` when the next line already requires filtered aids match — keep the stricter filter assertion. Saves ~1.

net: -36 lines possible.

### Notes (not findings)

- Four mechanisms (S2/S3/S4/S5) stay separate — matches design; not yagni.
- `projectUsage` shape change (`rows` + `totals`), agent filters, `qualifyResourceId`, RE-8 hybrid events, and `artifacts_produced` accumulation are required surface; not delete candidates.
- Tests that assert SC contracts and oracle parity are the safety-floor runnable checks — not bloat.
- No `ponytail:` markers in the tree (see debt ledger).

## Disposition

**Applied** at checkpoint `audit-findings-confirmed` → `apply-simplifications` (cycle 1). All seven findings landed on the feature branch.

## Lean-Coding Audit (re-score after apply)

Pass scope: same #365 change set after the seven simplifications.

Lean already. Ship.

