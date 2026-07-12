# Work Package Plan

> [Design Philosophy](02-design-philosophy.md) · [Assumptions Log](02-assumptions-log.md) · [Comprehension](../../comprehension/state-tools.md) · [Proposal](proposal.md) · [Reference impl](scripts/inspect_session.py) · Issue [#193](https://github.com/m2ux/workflow-server/issues/193) · PR [#215](https://github.com/m2ux/workflow-server/pull/215)

## Overview

Add a read-only `inspect_session` MCP tool to the workflow-server and add advisory step notes to four close-out techniques so workers read session state through the tool instead of ad-hoc `python3 -c` reads of `session.json`. The tool is an additive read-side surface built by cloning the `get_workflow_status` shape minus its advance/save tail; the projection logic is ported faithfully from the normative reference implementation `scripts/inspect_session.py`.

Two delivery surfaces, both required for the feature to be complete:

1. **Server source** (`src/`) in the target worktree — the tool handler, zod param schema, registration, and tests.
2. **Technique content** in the `workflows` orphan-branch worktree — four advisory notes (plain markdown, non-normative).

## Design Framework — approach

Simple-tier design (problem clear, solution pre-designed by the proposal + reference script). The framework reduces to: reuse the existing read primitive, port the projection contract verbatim, and settle the one open composition decision below.

### Reuse over redesign

- Read path: `loadSessionForTool(workspaceDir, session_index)` → `resolveSessionLocation` → `verifySeal` → `safeValidateSessionFile` → `navigatePath`. A read-only tool stops after this chain — it does **not** call `advanceSession` / `saveSessionForTool`, exactly like `get_workflow_status` (`src/tools/workflow-tools.ts:1063`).
- Registration shape: `server.tool(name, description, { ...sessionIndexParam, ...toolParams }, withAuditLog(name, withSessionStoreErrors(handler)), traceOpts)` inside `registerWorkflowTools` (`src/tools/workflow-tools.ts:112`).
- Error mapping: `withSessionStoreErrors` + `describeSessionStoreError` already turn every `SessionStoreError` code (INVALID_INDEX, NOT_FOUND, COLLISION, SEAL_MISMATCH, WORKSPACE_INVALID) into an actionable message. The handler adds nothing here.
- Do **not** call `assertNoActiveCheckpoint` — an inspection surface must work while the session is blocked at a checkpoint (the `get_workflow_status` precedent).
- Register with `excludeFromTrace: true` (inspection polls should stay out of the execution trace, matching `get_workflow_status`).

### Projection contract — port, don't redesign

`scripts/inspect_session.py` is the normative output contract. Port each projection function against the TypeScript `SessionFile` / `SessionView` types (`src/schema/session.schema.ts`, `src/schema/state.schema.ts`):

| View | Projection (from reference script) |
|---|---|
| `identity` | `{ workflowId, workflowVersion, sessionIndex, agentId, status, currentActivity, currentTechnique, startedAt, seq }` |
| `variables` | the `variables` bag; with `variable` set, just that one key's value |
| `checkpoints` | `checkpointResponses` map → `id → { optionId, respondedAt, variablesSet }` (from `effects.variablesSet`) |
| `activities` | `{ completed, skipped, current }` |
| `history` | `{ count, byType (event-type tally), milestones }` — milestones filter the 6 event types the script lists: `activity_entered`, `activity_exited`, `checkpoint_reached`, `checkpoint_response`, `workflow_triggered`, `workflow_completed` |
| `children` | one-line-per-child digest of `triggeredWorkflows`: `{ index, sessionIndex, workflowId, status, currentActivity, completed }` — **always computed from the addressed session's `triggeredWorkflows`** |
| `summary` (default) | `{ identity, activities, variables, checkpoints, history, children }` |

Output is a compact structured projection serialized as JSON text in the tool's `content` (never the raw `session.json`). Match the reference script's shape key-for-key so a parity test can compare directly.

### Design decision — `child_index` semantics (settles comprehension Open Question 2)

**Decision: `child_index` is root-relative-to-the-addressed-session, one level deep, positional — identical to the reference script's `--child N`.** The tool resolves the addressed session via `loadSessionForTool(session_index)` (`loaded.state` — root or, if a child's own index was supplied, that child), then, when `child_index` is provided, descends exactly one positional level: `navigatePath(loaded.state, ['triggeredWorkflows', child_index, 'state'])`. All views except `children` project the resulting session; the `children` and `summary.children` digests are always computed from that same addressed session's `triggeredWorkflows` (matching the script, where `children(doc)` reads the resolved doc).

Rationale and boundaries:

- **Keeps the reference contract.** The script's `resolve(doc, child_index)` returns `doc["triggeredWorkflows"][N]["state"]` — single-level positional from the addressed document. Reproducing it with `navigatePath` on `loaded.state` is behaviorally identical when the addressed session is the root.
- **Two orthogonal addressing modes coexist, no conflict.** A caller reaches a nested child either (a) by passing the child's **own** `session_index` (the resolver's enumeration matches the stored index and hands back the child as `loaded.state`; existing tools use only this), or (b) by passing the parent's index **plus** `child_index` N (positional descent into that parent's `triggeredWorkflows`). `child_index` is not required to reach any child — it is the positional convenience the reference script defines. Deeper nesting is reached by supplying a deeper session's own index, not by stacking positional indices.
- **Failure shape is already canonical.** An out-of-range or missing `child_index` makes `navigatePath` throw `SessionStoreError(NOT_FOUND)`, which `withSessionStoreErrors` + `describeSessionStoreError` render as an actionable message — no bespoke error handling in the handler.

**Rejected alternative:** making `child_index` an alias that re-resolves through `resolveSessionLocation` by the child's stored index. Rejected because it discards the positional semantics the reference contract fixes, and because the resolver already covers own-index addressing — the positional path is the distinct capability `child_index` is meant to add.

## Task breakdown

Ordered by dependency depth: schema-facing projection helpers and the param schema are leaves; the handler composes them; registration wires the handler; tests exercise the registered tool; docs and technique notes are independent additive surfaces. Tasks are atomic — each implementable, testable, and committable independently.

| Task | Depends on |
|---|---|
| T1 zod param schema | — |
| T2 projection/view logic | — |
| T3 handler + `child_index` resolution + registration | T1, T2 |
| T4 unit/integration + parity tests | T3 |
| T5 docs (README count/table, api-reference) | T3 |
| T6 four technique advisory notes (workflows worktree) | — (independent surface) |

### T1 — `inspect_session` zod param schema

Define the tool's zod params in `src/tools/workflow-tools.ts` (co-located with the handler): spread `sessionIndexParam` (`src/utils/session/params.ts:9`, the shared `/^[A-Z2-7]{6}$/` validator) and add: `view` — `z.enum(['summary','identity','variables','checkpoints','activities','history','children']).default('summary')`; `child_index` — optional non-negative integer; `variable` — optional string. Each param carries a self-describing `.describe()` matching the proposal's parameter table.

### T2 — projection / view logic ported from the reference script

Port the reference script's projection functions into TypeScript against `SessionFile` / `SessionView` (`src/schema/session.schema.ts`, `src/schema/state.schema.ts`). One pure function per view (`identity`, `checkpoints`, `activities`, `history`, `children`, `summary`) plus the `variables` slice, matching the reference output shape key-for-key. History `byType` is a tally over the event-type enum; `milestones` filters the six event types the script names. Keep these as pure helpers (no session I/O) so the parity test can drive them directly. Place them alongside the handler (or a small local module) following the existing file's organization.

### T3 — handler, `child_index` resolution, registration

Add the `inspect_session` handler inside `registerWorkflowTools` (`src/tools/workflow-tools.ts:112`), wrapped `withAuditLog(name, withSessionStoreErrors(...))`, registered with `excludeFromTrace: true`, and **without** `assertNoActiveCheckpoint`. Handler flow: `loadSessionForTool(config.workspaceDir, session_index)` → if `child_index` given, `navigatePath(loaded.state, ['triggeredWorkflows', child_index, 'state'])` per the decision above → dispatch on `view` to the T2 projection → return `{ content: [{ type: 'text', text: JSON.stringify(projection, null, 2) }], _meta: { session_index, validation: buildValidation() } }`. No `advanceSession`/`saveSessionForTool` (read-only). Update the README tool-count constant/comment source if the count is asserted anywhere in code (verified: no code assertion — count lives only in README/api-reference, handled in T5).

### T4 — tests

Add a `describe('tool: inspect_session')` block to `tests/mcp-server.test.ts` (vitest + `createServer` over `InMemoryTransport`): assert each view returns its projection; `variable` narrowing under `view=variables`; `child_index` positional descent into `triggeredWorkflows[n].state`; out-of-range `child_index` returns the NOT_FOUND actionable message; read-only (calling the tool leaves `session.json` bytes/seq unchanged); usable while a checkpoint is active. Add a **parity test** comparing the TS projection output against `scripts/inspect_session.py` run over the same fixture session (the comprehension-flagged port-fidelity guard) — drive it from an existing session fixture. No e2e snapshot changes expected (additive tool leaves workflow-walk snapshots untouched).

### T5 — docs

Update the two manual doc surfaces: `README.md` — bump "registers 16 MCP tools" → 17 (line 40) and add the `inspect_session` row to the MCP-tools-at-a-glance table; `docs/api-reference.md` — add the per-tool entry (params, views, read-only note). The docs-site data auto-captures registrations via `scripts/generate-site-data.ts` (`captureTools`), so no site-data edit is needed.

### T6 — technique advisory notes (workflows worktree)

Add one advisory `>` blockquote note (the established non-normative convention — see the merge-wait note in `retrospective.md` step 3) under the relevant protocol step of each of the four close-out techniques, telling the worker to obtain session state via `inspect_session` rather than reading `session.json` directly:

- `meta/techniques/workflow-engine/verify-outcomes.md`
- `meta/techniques/workflow-engine/generate-summary.md`
- `work-package/techniques/conduct-retrospective/retrospective.md`
- `work-package/techniques/conduct-retrospective/select-next.md`

These are plain-markdown content edits, no workflow-schema change and no new bound step (assumption DP-2). **Worktree discipline:** these edits land in a **dedicated `workflows` worktree** (the branch literally named `workflows`), created before editing and committed there — not in the target feature worktree's submodule and not in the main checkout. The implement activity sets that worktree up.

## Design decisions

1. **Clone `get_workflow_status`, drop the advance/save tail** — reuses the vetted read primitive; read-only guarantee is structural (no mutation call exists on the path) rather than asserted.
2. **`child_index` = root-relative one-level positional** — matches the reference contract; coexists with own-index resolution without conflict (see decision section).
3. **Compact JSON projection, never raw `session.json`** — the file accretes unbounded `history` + `deliveredContent`; shaped projections are the whole point (proposal Alternatives).
4. **Advisory notes as `>` blockquotes, no schema change** — matches the existing non-normative-guidance convention; keeps the feature additive on the content side.
5. **Parity test against the reference script** — the reference is the normative contract; a direct comparison guards port fidelity as the projection or schema evolves.

## Assumptions

Recorded in [02-assumptions-log.md](02-assumptions-log.md). Plan-phase additions (Task Breakdown / Design Approach / Scope Decisions) are appended by the collect-assumptions step; the load-bearing one — the `child_index` composition — is settled in the decision section above rather than left open.
