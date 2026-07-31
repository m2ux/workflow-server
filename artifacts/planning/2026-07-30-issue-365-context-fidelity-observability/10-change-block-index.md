# Change Block Index

> feat/365-context-fidelity-observability vs main · 16 files · 55 hunks · est. review ~28 minutes (30 sec/change)

## Block Rationale

### [Block 1 — logging.ts:95](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/logging.ts#L95)

Trace events take their `aid` from the call's `agent_id` when the tool was invoked under a worker context, and fall back to the session agent for solo walks. Multi-worker fidelity and `get_trace` filters need that distinction; a session-only stamp would credit every sibling under one identity.

### [Block 2 — session.schema.ts:155](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/schema/session.schema.ts#L155)

The delivery-ledger comment lists the content-key namespaces that `delivery.ts` actually writes, including split inherited note/items and provenance_note. Reviewers and maintainers need the schema comment to match the ledger keys so G7 stale-namespace debt does not reappear.

### [Block 3 — session.schema.ts:206](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/schema/session.schema.ts#L206)

`SessionFile` gains optional `declaredArtifacts` — the session-scoped accumulation of `{id,name,path?}` used at `next_activity` for planning-folder reconciliation. The TypeScript interface tracks the Zod field so tool code can read and merge without casts.

### [Block 4 — resource-tools.ts:52](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/resource-tools.ts#L52)

Lazy `get_technique` imports `appendStepStartedIfAbsent` so step-bound fetches emit hybrid RE-8 `step_started` from the same helper as the bundle path. One helper keeps idempotency and history shape consistent across both delivery entry points.

### [Block 5 — resource-tools.ts:724](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/resource-tools.ts#L724)

`recordFetch` captures a single timestamp shared by the `technique_fetched` history row and the optional `step_started` append. Shared wall-clock ties start evidence to the fetch that discovered the step without a second clock read.

### [Block 6 — resource-tools.ts:737](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/resource-tools.ts#L737)

When a step-bound technique is fetched out of band, the server appends idempotent `step_started` for `(activity, stepId, agentId)`. Bundling is not the only delivery path; lazy workers still need in-flight step clocks without a new worker tool.

### [Block 7 — workflow-tools.ts:18](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L18)

Imports for resource qualification, planning-folder `readdir`, and step-event helper land at the top of the workflow tool module. S2 reconciliation and S5 resource/step paths depend on these; the lean audit already dropped an unused `parseResourceRef` import here.

### [Block 8 — workflow-tools.ts:56](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L56)

`record_usage` schema text states DELTA-per-dispatch semantics and which numeric token keys the harness may supply. Contract prose matches the write path so orchestrators do not treat a row as a cumulative session total (S3 / D-4: no price field).

### [Block 9 — workflow-tools.ts:222](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L222)

`projectHistory` accepts optional `agentId` and keeps only events whose `data.agentId` matches. Parallel workers share one session history; filtering is how inspect and fidelity views separate one context without forking sessions.

### [Block 10 — workflow-tools.ts:264](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L264)

`USAGE_TOKEN_KEYS` plus `projectUsage` return `{ rows, totals }` with a plain arithmetic sum over known token fields, optional agent filter on rows, and no cost/price key. Operators get a run-readable token aggregate while price capture stays out of scope (D-4).

### [Block 11 — workflow-tools.ts:332](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L332)

`projectSummary` / session-view plumbing thread optional `agentId` into the projections that support filtering. The inspect surface stays one tool with additive filter params rather than a parallel API.

### [Block 12 — workflow-tools.ts:350](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L350)

`projectSessionView` routes `history` and `usage` through the agent-aware projectors. Oracle parity and live `inspect_session` share the same switch so the Python reference fixture can stay aligned.

### [Block 13 — workflow-tools.ts:491](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L491)

`next_activity` tool description drops the claim that usage is recorded on the transition. Usage is a separate `record_usage` call (dispatch accounting); the description must not reintroduce the stale coupling.

### [Block 14 — workflow-tools.ts:499](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L499)

`next_activity` accepts `artifacts_produced` and optional `agent_id`. Produced artifacts feed S2 accumulation; `agent_id` scopes technique-fetch fidelity and `step_completed` attribution to the exiting worker.

### [Block 15 — workflow-tools.ts:531](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L531)

Technique-fetch validation is invoked with the exiting `agent_id` so a sibling worker's fetch does not satisfy this context's manifest. Solo/legacy rows without agentId still credit under the unscoped path.

### [Block 16 — workflow-tools.ts:578](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L578)

For each `step_manifest` entry that carries a non-empty output, `next_activity` appends `step_completed` at transition time. Completions are known only when the worker reports the manifest; starts remain on delivery (hybrid RE-8).

### [Block 17 — workflow-tools.ts:627](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L627)

Planning-folder reconciliation merges `artifacts_produced` into `declaredArtifacts` by id, diffs folder basenames against a compact cover-name set, and emits warn-only undeclared-file messages; outside-folder declarations are *unknown*, not *missing*. S2 is advisory so runs are never stranded on undeclared files.

### [Block 18 — workflow-tools.ts:679](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L679)

Artifact warnings join the existing `_meta.validation` channel with technique/resource warnings. One advisory channel for three mechanisms (DP-1) keeps operators looking in a single place.

### [Block 19 — workflow-tools.ts:954](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L954)

Resource ids extracted from technique text are qualified with the technique's workflow when it differs from the delivering session. Cross-workflow bare slugs resolve to the authoring tree instead of silently missing under the session workflow.

### [Block 20 — workflow-tools.ts:997](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L997)

In reference mode, unresolvable linked resource refs push bundling warnings rather than failing the call. Full and reference modes both surface broken refs so fidelity debt is visible without blocking delivery.

### [Block 21 — workflow-tools.ts:1047](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1047)

Full-mode eager resource loading walks the same qualified id set and records the same class of unresolvable warnings. Parity with reference mode closes the gap where only one delivery path validated refs.

### [Block 22 — workflow-tools.ts:1179](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1179)

Each technique bundled into `get_activity` triggers idempotent `step_started` for that step under the delivery scope agent. Bundled starts give in-flight clocks without per-step worker pings.

### [Block 23 — workflow-tools.ts:1308](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1308)

`record_usage` tool registration and description state DELTA-per-dispatch and optional `agent_id`. The write API is the only place usage enters history; attribution is optional so legacy unattributed rows remain valid.

### [Block 24 — workflow-tools.ts:1332](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1332)

When `agent_id` is supplied, it is stored as `data.agentId` on the `activity_usage` event. Inspect filters and multi-worker rollups read that field; omission leaves the row unattributed.

### [Block 25 — workflow-tools.ts:1348](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1348)

Success message text points operators at `inspect_session view:usage` for the session's usage events. Messaging reinforces that totals live on the projection, not on the record call alone.

### [Block 26 — workflow-tools.ts:1589](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1589)

`get_trace` accepts optional `agent_id` to keep only events whose `aid` matches. Trace and inspect share the agent dimension so a parallel run can be split in both stores.

### [Block 27 — workflow-tools.ts:1616](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1616)

Token-decoded trace path applies the same agent filter before returning events. Filter behaviour is identical whether the source is the live store or decoded tokens.

### [Block 28 — workflow-tools.ts:1632](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1632)

Live trace-store path filters by `aid` when `agent_id` is set. Completes S5 agent filtering on both get_trace backends.

### [Block 29 — workflow-tools.ts:1742](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1742)

`inspect_session` documents the `usage` view and optional `agent_id` filter for history/usage. The public contract matches `projectSessionView` so clients and the Python oracle stay in lockstep.

### [Block 30 — workflow-tools.ts:1766](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/tools/workflow-tools.ts#L1766)

Handler passes `agent_id` through to `projectSessionView`. Thin wiring; behaviour lives in the projectors above.

### [Block 31 — delivery.ts:22](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/utils/delivery.ts#L22)

Ledger key documentation adds `provenance_note` and split `inherited_*.note|items` namespaces. Docs and implementation share one vocabulary for S4 measurement and debugging.

### [Block 32 — delivery.ts:86](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/utils/delivery.ts#L86)

`DEDUP_BLOCKS` includes `provenance_note`; `stageField` centralises hash/lookup/marker staging for top-level and nested fields. Shared staging is the lean audit's shrink of duplicated note/items branches while recovering invariant preamble bytes.

### [Block 33 — delivery.ts:141](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/utils/delivery.ts#L141)

`dedupTechniqueBlocks` splits inherited note vs items, stages provenance_note and rules via `stageField`, and still records whole-block keys for first delivery. Techniques that share contract prose collapse the note across different own-input sets; whole-block readers keep working.

### [Block 34 — dispatch.ts:3](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/utils/dispatch.ts#L3)

Dispatch accounting comment states that `activity_usage` arrives via `record_usage` as a DELTA per dispatch, not on `next_activity`. Aligns module docs with the S3 write path and removes the three-way stale claim surface.

### [Block 35 — resource-ref.ts:92](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/utils/resource-ref.ts#L92)

`qualifyResourceId` prefixes bare ids with the technique workflow when it differs from the delivery workflow; already-qualified and same-workflow ids pass through. Extracted helpers stay pure and unit-tested away from the tool handlers.

### [Block 36 — step-events.ts:1](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/utils/step-events.ts#L1)

New module: idempotent `appendStepStartedIfAbsent` for hybrid RE-8 starts keyed on `(activity, stepId, agentId)`. Bundle and lazy-fetch call sites share one predicate and history shape (lean extraction).

### [Block 37 — validation.ts:143](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/utils/validation.ts#L143)

`validateTechniqueFetches` gains optional `agentId` with doc explaining sibling-fetch isolation vs solo/legacy unscoped credit. Signature change is the S5 fidelity half of agent dimension.

### [Block 38 — validation.ts:172](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/src/utils/validation.ts#L172)

History walk skips technique deliveries whose `data.agentId` does not match the requested agent. Prevents one worker's fetch from clearing another worker's missing-technique warnings.

### [Block 39 — fetch-observability.test.ts:311](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/fetch-observability.test.ts#L311)

Integration coverage for step events, agent-scoped fidelity, and related observability paths under the PR366 cases. Locks hybrid start/complete and multi-agent separation against regressions.

### [Block 40 — inspect_session.py:1](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/fixtures/inspect-session/inspect_session.py#L1)

Oracle header/docstring updates for the expanded inspect surface. Keeps the reference script's contract text aligned with the server tool.

### [Block 41 — inspect_session.py:24](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/fixtures/inspect-session/inspect_session.py#L24)

Import and preamble adjustments supporting usage projection and agent filtering. Shared prelude for the view implementations below.

### [Block 42 — inspect_session.py:71](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/fixtures/inspect-session/inspect_session.py#L71)

Activities/history helpers accept the agent dimension used by filtered views. Parity with `projectHistory` is the gate for PR215-style view loops.

### [Block 43 — inspect_session.py:89](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/fixtures/inspect-session/inspect_session.py#L89)

History projection filters on `data.agentId` when requested. Mirrors the TypeScript projector so oracle diffs stay empty on filter behaviour.

### [Block 44 — inspect_session.py:104](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/fixtures/inspect-session/inspect_session.py#L104)

`usage` view implements rows + plain-sum totals over the same token keys, with optional agent filter. SC-4/SC-5 and inspect parity depend on this matching `projectUsage`.

### [Block 45 — inspect_session.py:142](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/fixtures/inspect-session/inspect_session.py#L142)

CLI wiring discovers the `usage` view and agent filter flags. Operators and tests invoke the same entrypoint the parity suite shells out to.

### [Block 46 — inspect_session.py:158](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/fixtures/inspect-session/inspect_session.py#L158)

Main dispatches filtered history/usage through the new projectors. Completes oracle coverage of the additive inspect shape.

### [Block 47 — mcp-server.test.ts:875](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/mcp-server.test.ts#L875)

Inspect-view corpus / loop setup extended so `usage` is first-class in the view set. Avoids a seven-literal freeze that would miss the new projection.

### [Block 48 — mcp-server.test.ts:898](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/mcp-server.test.ts#L898)

Small assertion/path tweak so the view loop stays derived from `INSPECT_SESSION_VIEWS`. Keeps PR215-TC-08 style coverage additive.

### [Block 49 — mcp-server.test.ts:916](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/mcp-server.test.ts#L916)

PR366 cases for usage totals, agent filters, and related inspect behaviour. Executable success criteria for S3 read path and agent dimension.

### [Block 50 — mcp-server.test.ts:1070](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/mcp-server.test.ts#L1070)

Further PR366 integration cases (artifact warnings, record_usage attribution, trace filter). End-to-end coverage of S2/S3/S5 write-read loops on the MCP surface.

### [Block 51 — mcp-server.test.ts:2665](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/mcp-server.test.ts#L2665)

Targeted assertion cleanup from the lean audit (drop weak aid `every` where a stricter filter assert follows). Behaviour coverage stays; noise asserts go.

### [Block 52 — reference-delivery.test.ts:930](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/reference-delivery.test.ts#L930)

S4 cases: `provenance_note` and split inherited note/items collapse to unchanged markers while items stay full when distinct. Locks SC-8 delivery invariants.

### [Block 53 — resource-ref.test.ts:1](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/resource-ref.test.ts#L53)

Unit tests for `qualifyResourceId` (qualified pass-through, cross-workflow prefix, same-workflow bare). Pure helper coverage without standing up the full server.

### [Block 54 — validation.test.ts:490](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/validation.test.ts#L490)

Agent-scoped `validateTechniqueFetches` cases: sibling fetch does not credit; matching agent does; omit agentId keeps legacy behaviour. S5 fidelity unit gate.

### [Block 55 — variable-seeding.test.ts:332](https://github.com/m2ux/workflow-server/blob/a9c3ea2d55312f9cca032ad117941ae134c02e0d/tests/variable-seeding.test.ts#L332)

Fixture expectations updated where session shape or inspect projections gained fields. Keeps B7 seeding corpus green against the additive schema.
