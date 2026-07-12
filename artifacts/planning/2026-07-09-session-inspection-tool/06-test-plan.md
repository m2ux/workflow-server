# Test Plan

> [Design Philosophy](02-design-philosophy.md) · Ticket [#193](https://github.com/m2ux/workflow-server/issues/193) · PR [#215](https://github.com/m2ux/workflow-server/pull/215)

## Overview

Validates the read-only `inspect_session` MCP tool: each view's projection matches the normative reference (`scripts/inspect_session.py`), `child_index` positional descent and its failure shape, the `variable` slice, the read-only guarantee, and usability while a checkpoint is active. Central symbols:

- `inspect_session` handler — `src/tools/workflow-tools.ts` (added by implementation)
- projection helpers (`identity` / `checkpoints` / `activities` / `history` / `children` / `summary`) — ported from `scripts/inspect_session.py`
- `loadSessionForTool` / `navigatePath` — reused read primitives (`src/utils/session/resolver.ts`)

Test placement: a new `describe('tool: inspect_session')` block in `tests/mcp-server.test.ts` (vitest + `createServer` over `InMemoryTransport.createLinkedPair()`), driving `client.callTool({ name: 'inspect_session', arguments })`. A session fixture with a root session, populated `variables` / `checkpointResponses` / `history` / `completedActivities` / `skippedActivities`, and at least one `triggeredWorkflows[n].state` child is the shared input.

## Test Cases

<div style="width:120px">Test ID</div> | <div style="width:350px">Objective</div> | <div style="width:400px">Steps</div> | <div style="width:350px">Expected Result</div> | <div style="width:50px">Type</div>
|---|---|---|---|---|
| PR215-TC-01 | Verify the default `summary` view returns identity, activities, variables, checkpoints, history tally, and children digest | 1. Seal a fixture session  <br>2. Call `inspect_session { session_index }` (no `view`)  <br>3. Parse the JSON text | Result has keys `identity`, `activities`, `variables`, `checkpoints`, `history`, `children`; shapes match the reference `summary()` | Unit |
| PR215-TC-02 | Verify each narrow view returns only its slice | 1. Call the tool once per view (`identity`, `variables`, `checkpoints`, `activities`, `history`, `children`)  <br>2. Compare each to the corresponding reference projection | Each view's shape matches the reference function output for that view | Unit |
| PR215-TC-03 | Verify `variable` narrows `view=variables` to one key | 1. Call `inspect_session { session_index, view: 'variables', variable: 'pr_number' }` | Returns just that key's value, not the full bag | Unit |
| PR215-TC-04 | Verify `child_index` addresses `triggeredWorkflows[n].state` positionally | 1. Call `inspect_session { session_index: <root>, child_index: 0, view: 'identity' }` | Returns the child's identity (its `sessionIndex`, `workflowId`), not the root's | Integration |
| PR215-TC-05 | Verify out-of-range `child_index` returns the actionable NOT_FOUND message | 1. Call with `child_index` beyond `triggeredWorkflows` length | Tool errors with the `describeSessionStoreError` NOT_FOUND message; no crash | Integration |
| PR215-TC-06 | Verify the tool is read-only — no session mutation | 1. Read `session.json` bytes + `seq` before  <br>2. Call the tool across several views  <br>3. Re-read bytes + `seq` | Bytes and `seq` unchanged; `.session-token` seal unchanged | Integration |
| PR215-TC-07 | Verify the tool works while a checkpoint is active | 1. Fixture with `activeCheckpoint` set  <br>2. Call `inspect_session` | Returns the projection (does not reject as blocked); `assertNoActiveCheckpoint` is not applied | Integration |
| PR215-TC-08 | Verify port fidelity against the reference script (parity) | 1. Run `scripts/inspect_session.py` over the fixture `session.json` for each view  <br>2. Run the TS projection over the same fixture  <br>3. Deep-compare | Outputs are structurally equal per view; drift fails the test | Unit |
| PR215-TC-09 | Verify e2e workflow-walk snapshots are unaffected by the additive tool | 1. Run the e2e suite (`tests/e2e/`) | Snapshots unchanged (registration is additive; snapshots capture walk payloads, not the tool registry) | E2E |

## Acceptance Criteria Matrix

| Requirement (success criterion) | Test cases |
|---|---|
| Tool exists, all views return the specified projection | PR215-TC-01, TC-02, TC-03, TC-08 |
| Read-only guarantee (no mutation, no raw passthrough) | PR215-TC-06 |
| `child_index` positional contract + failure shape | PR215-TC-04, TC-05 |
| Usable while blocked at a checkpoint | PR215-TC-07 |
| Additive — existing baselines untouched | PR215-TC-09 |
| Quality gates green | full `npm test` + `npm run typecheck` |

Technique advisory notes (workflows worktree) are content-only and validated by inspection at review time (no automated test) — their acceptance criterion is verified by the strategic/content review, not this suite.

## Running Tests

- All tests: `npm test`
- This suite: `npm test -- mcp-server`
- Typecheck: `npm run typecheck`
- Parity script (reference): `scripts/inspect_session.py <session.json> <view>`
