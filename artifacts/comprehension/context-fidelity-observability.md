# Context Fidelity and Observability — Comprehension Artifact

> 2026-07-31 · work packages: [2026-07-30-issue-365-context-fidelity-observability](../planning/2026-07-30-issue-365-context-fidelity-observability/) (#365 / PR #366) · coverage: the reconcile-and-aggregate seam across five surfaces — manifest acceptance on `next_activity`, the usage ledger and its rollup, block-level delivery dedup and its measurement gate, and the three observability read/validate paths. Server code cited at commit `092b0c1b`; corpus prose at `workflows` commit `f7eb4793` · related: [delivery-ledger.md](delivery-ledger.md) (canonical home for the reference-not-repeat subsystem), [token-use-tracking.md](token-use-tracking.md) (canonical home for usage and cost), [state-tools.md](state-tools.md) (session persistence and `inspect_session`), [resource-section-addressing.md](resource-section-addressing.md) (resource-id resolution and anchor validation), [utils-layer.md](utils-layer.md) (`src/utils/`, including the validation helpers), [orchestration.md](orchestration.md) (orchestrator/worker model), [workflow-server.md](workflow-server.md) (cross-cutting `src/`)

## Architecture Overview

### Project Structure

One TypeScript ESM MCP server; `npm test` is vitest, `tsc` builds to `dist/`. The five surfaces this work package touches are all reachable from two tool modules and three utility modules — no new layer is involved. Cross-cutting `src/` shape is documented in [workflow-server.md](workflow-server.md) and is not restated here.

The workflow corpus is a separate git submodule (`workflows/`, tracked on the same repository's `workflows` branch) and is **empty in this worktree**. Every claim below about corpus prose was read at the superproject checkout.

### Module Map

The fidelity machinery is a single-direction pipeline with three roles. Naming them separates what exists from what is missing, because every gap in this package sits at a *read* position, not a *write* one.

| Role | Modules | What they do |
|---|---|---|
| **Writers** — append fidelity evidence to `SessionFile.history` | [`resource-tools.ts`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/resource-tools.ts) (`technique_fetched`, `resource_fetched`), [`workflow-tools.ts`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts) (`technique_bundled`, `resource_fetched`, `activity_usage`, `variable_set`), [`dispatch.ts`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/dispatch.ts#L43) (`activity_dispatched`) | Every write carries `chars` and, on delivery events, `delivery: 'full' \| 'unchanged'` and `agentId` |
| **Reducers** — collapse or derive from prior evidence | [`delivery.ts`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/delivery.ts) (ledger lookup, whole-payload and block markers), [`dispatchKind`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/dispatch.ts#L27) (fresh/resume from history) | The only two places that read fidelity evidence to change server behaviour |
| **Readers** — project evidence back out | [`validateTechniqueFetches`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/validation.ts#L141), [`projectUsage`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L256), [`projectHistory`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L214), `get_trace`, and the two benchmark scripts | Every one of them is agent-blind and rollup-free |

`src/schema/state.schema.ts` and `src/schema/session.schema.ts` hold the shared vocabulary both ends agree on: a closed event-type enum and an open `data` record.

### Design Patterns

**Record the claim, never reconcile it.** The one structural pattern that explains all four items. At each boundary the server accepts a self-reported magnitude or manifest, stores it faithfully, and never compares it against the thing it describes:

| Boundary | Claim accepted | Reconciliation that does not exist |
|---|---|---|
| `next_activity` step/activity manifest | which steps ran, with what output | the artifacts those steps declared, against the planning folder on disk |
| `record_usage` | one dispatch's token figure | any rollup, dedup, or cost derivation over the rows |
| Eager bundler and `get_technique` | a resource/technique ref exists | existence at delivery time; an unresolvable ref is `continue`d |
| Delivery ledger | this scope holds these bytes | measurement of what the dedup actually recovered |

The four in-scope items are four instances of the same missing habit, which is why they share surfaces.

**Derived, not declared.** Where a discriminator could have been a parameter, it is computed from history instead — [`dispatchKind`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/dispatch.ts#L27) reads prior `activity_dispatched` events rather than trusting a caller flag, because "a worker cannot self-measure". The same reasoning is the reason `activity_usage` *must* be declared: the server has no tokenizer on the request path.

**Content-keyed ledger, no invalidation.** `<hash>`-suffixed ledger keys make the key the content, so a changed payload simply misses. Detail in [delivery-ledger.md](delivery-ledger.md).

**Advisory-only validation.** Every manifest check returns strings that land in `_meta.validation.warnings` and change nothing. `buildValidation` can emit `status: 'error'` per its schema, but no fidelity caller ever produces one.

## Key Abstractions

### Core Types

**[`HistoryEventTypeSchema`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/schema/state.schema.ts#L6)** — a *closed* `z.enum` of 30 members; `HistoryEntry.data` is `z.record(z.unknown())`, so payload shape is free but the type is not. This asymmetry is the schema-extension pressure point for the whole package: a new *kind* of evidence needs an enum edit (a deliberate schema addition), while a new *field* on existing evidence needs nothing.

`step_started` and `step_completed` are already members ([`state.schema.ts:10`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/schema/state.schema.ts#L10)) with **zero emission sites and zero test references** anywhere in `src/`, `scripts/` or `tests/` — that line is the only occurrence of either string in the repository. They are dead enum members.

**[`SessionFile.deliveredContent`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/schema/session.schema.ts#L164)** — `agentId → contentKey → hash`. The doc comment lists four key namespaces; [`delivery.ts:17-30`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/delivery.ts#L17) documents seven, and the code writes the seven. The schema comment is stale.

**[`DEDUP_BLOCKS`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/delivery.ts#L90)** — `['inherited_inputs', 'inherited_outputs', 'rules']`, the contract-inherited keys of a projected technique. [`dedupTechniqueBlocks`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/delivery.ts#L104) hashes each over a *single-key projection* (`{ [block]: value }`) so the hash is independent of the surrounding technique, which is what lets siblings sharing a contract collapse against one another.

**[`StepManifestEntry`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/validation.ts#L60)** — `{ step_id, output }`. There is no artifact field, and no sibling `ArtifactManifestEntry`. `artifacts_produced` returns **zero hits** across `src/`, `scripts/` and `tests/`; it exists only in corpus prose ([`finalize-activity.md`](https://github.com/m2ux/workflow-server/blob/f7eb4793903ff32369f3b4a377c6d2429646062c/meta/techniques/workflow-engine/finalize-activity.md), 4 mentions).

**The declared artifact contract** — [`composeActivityArtifacts`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L98) synthesizes `Array<{ id, name, audience? }>` by resolving every step's technique and collecting each output's `#### artifact` filename. This is the *only* server-side statement of what an activity should produce, and it carries **no path** — the counterpart to the envelope's `{ id, name, path }`.

### Error Handling

The distinctive pattern is **skip on resolution failure**, at three sites on the delivery path:

| Site | Failure | Consequence |
|---|---|---|
| [`workflow-tools.ts:767`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L767) | a step's technique ref does not compose | step silently absent from `step_techniques`; the worker's own `get_technique` surfaces it later |
| [`workflow-tools.ts:863`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L863) | an eager resource does not load | no warning, no event, and the id is **not** added to `resourceRefIds` |
| [`resource-delivery.ts:41`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/resource-delivery.ts#L41) | `#section` anchor not found | returned as a failed result, which the caller above discards |

The resource case has **two different shapes by delivery mode**, which the issue text treats as one. Under reference mode the loop above runs and an unresolvable id vanishes. Under full delivery the loop is skipped entirely ([`:904-908`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L904)) and every linked id is pushed to `resource_refs` **unresolved**, so a rotten ref is surfaced to the worker but still unvalidated — it fails later inside `get_resource`, which throws. Fresh/full is the mode production uses. Neither mode warns.

Elsewhere the server is strict: `get_resource` throws on a missing section, `next_activity` throws on an unknown activity, `bindSessionRepo` throws on a conflicting rebind. The silence is specific to the eager-bundling path.

## Design Rationale

### Manifest validation is advisory only

**Observation**: every fidelity check returns warning strings; none raises.  
**Hypothesized rationale**: manifests are the *only* channel by which a worker reports work, and the server cannot distinguish "step legitimately skipped by an agent-side `when` gate" from "step not done" — the code says so at [`validation.ts:77-84`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/validation.ts#L77). A hard failure would block a walk on the server's own incomplete knowledge.  
**Trade-offs**: optimises for never wedging a run; sacrifices any guarantee that a reported completion is real.  
**Implications for changes**: S2's reconciliation inherits this default. "Warn" is the conservative continuation of an established stance; "block" would be the first hard gate in the fidelity surface and needs its own justification, not an analogy.

### Usage arrives on its own tool, not on `next_activity`

**Observation**: `record_usage` is a separate orchestrator tool; `next_activity` has no `usage` parameter, despite three code comments saying it does.  
**Hypothesized rationale**: `activity_usage` counts *dispatches* while `next_activity` fires on activity *exits*, and the two differ whenever an activity is resumed, retried, or dispatched out of band. A parameter on `next_activity` would have made one row per exit structurally impossible to exceed.  
**Trade-offs**: buys correct cardinality; costs an extra call per dispatch and an orchestrator that must remember to make it. Absence is deliberately distinguishable from a measured zero.  
**Implications for changes**: an aggregate cannot assume one row per activity. It must tolerate N rows and 0 rows for the same activity, which is exactly why the cumulative-vs-delta convention has to be settled before the sum is defined.

### Block dedup is gated behind reference mode

**Observation**: `dedupTechniqueBlocks` is invoked at exactly two sites and both are inside an `if (referenceMode)` ([`workflow-tools.ts:812`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L812), [`resource-tools.ts:784`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/resource-tools.ts#L784)). Ledger *writes* happen in every mode; ledger *reads* only in reference mode.  
**Hypothesized rationale**: a marker is unreadable to a context that never received the bytes, and fresh mode exists precisely because the receiving context is empty. Treating markers as a reference-mode-only device is the safe reading of that invariant.  
**Trade-offs**: correctness by construction; forfeits the intra-response case, where a repeat within one payload is safe in any mode because the earlier copy is in the same message the reader is holding.  
**Implications for changes**: this decides which benchmark can gate S4. See [Block dedup yield and the two gates that can measure it](#block-dedup-yield-and-the-two-gates-that-can-measure-it--2026-07-31).

### Trace identity is the session's, not the caller's

**Observation**: [`appendTraceEvent`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/logging.ts#L98) fills `TraceEvent.aid` from `state.agentId`, and never reads `params['agent_id']`.  
**Hypothesized rationale**: the audit wrapper predates per-dispatch agent scoping (#353 §1.1). It is generic over every tool, and only three tools declare `agent_id`, so the session field was the one identity always available.  
**Trade-offs**: uniform across tools; makes the field constant across concurrent workers on one session.  
**Implications for changes**: S5's per-agent filtering must populate the dimension before it can filter on it. See [Per-agent filtering has no per-agent dimension to filter on](#per-agent-filtering-has-no-per-agent-dimension-to-filter-on--2026-07-31).

## Data Flow and Operational Context

### Data Flow Map

**Declared artifacts** — technique `## Outputs` `#### artifact` name → [`markdown-technique-loader.ts:402`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/loaders/markdown-technique-loader.ts#L402) → `composeActivityArtifacts` → `get_activity` response body and `_meta.artifacts`. Terminates at the worker. **Produced artifacts** — worker writes files under `{planning_folder_path}` → reports `artifacts_produced` in its envelope → orchestrator relays… nowhere. `next_activity` has no parameter for it. The two halves never meet.

**Usage** — harness figure → `record_usage { activity, usage }` → one `activity_usage` row with `data: { usage }` → `projectUsage` maps rows 1:1 → `inspect_session { view: 'usage' }`. No agent id is recorded on the row, and no other consumer exists.

**Delivery magnitude** — composed payload → `chars` on `technique_fetched` / `technique_bundled` / `resource_fetched` / `activity_dispatched` → read only by [`run-dispatch-benchmark.ts`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/scripts/run-dispatch-benchmark.ts) and [`run-token-benchmark.ts`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/scripts/run-token-benchmark.ts). Both are manual (`npm run bench:*`) and absent from `.github/workflows/verify.yml`.

**Fidelity coverage** — `technique_fetched` / `technique_bundled` rows → `validateTechniqueFetches`, scoped to the current visit by scanning back to the last `activity_entered` → `_meta.validation.warnings` on `next_activity`. The scan filters on `entry.activity` and never on `data.agentId`, even though every one of those rows carries it.

### Invariant Alignment

| Invariant | Producer enforces? | Consumer assumes? | Gap |
|---|---|---|---|
| A declared artifact name equals an on-disk filename | No — `artifact-prefix` applies `NN-` at write time; 13 of 137 declarations are `{token}` templates; 6 hardcode their own numeric prefix | A name-keyed diff would assume equality | **Yes.** A literal comparison mismatches every artifact. See [The declared side of a reconciliation](#the-declared-side-of-a-reconciliation-is-not-a-filename-list--2026-07-31) |
| A worker-reported `path` is comparable to a server path | No — [`presentPathToAgent`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/path-presentation.ts#L109) rewrites server→host one-way; no inverse exists | A path-keyed diff would assume a shared namespace | **Yes.** Under Docker the two are different strings for the same file; reconciliation must key on basename |
| A `technique_fetched` row proves *this* worker fetched | No — the row carries `data.agentId`, but the filter ignores it | `validateTechniqueFetches` assumes any row in the visit is coverage | **Yes, live defect.** With two workers on one session, A's fetch silently satisfies B's manifest |
| `TraceEvent.aid` identifies the calling worker | No — it is `state.agentId`, constant per session | A per-agent trace filter would assume per-worker values | **Yes.** The filter would be a no-op |
| One `activity_usage` row is joinable to one dispatch | No — the row records no `agentId`, and dispatch rows do | A fresh-vs-resume rollup must join them | **Yes.** Only ordinal correlation is available, and out-of-band dispatches break it |
| An eager-bundled resource id resolves | Build-time only, and only for `.md#anchor` *links* — the `resource-anchors` guard's `LINK_RE` requires a `.md` target, which resource ids do not carry | Delivery assumes resolvable, `continue`s when not | **Yes.** The id form the runtime resolves has no build-time guard, and 2.8% of live extractions do not resolve. See [Resource refs rot by losing their home workflow](#resource-refs-rot-by-losing-their-home-workflow-not-by-going-stale--2026-07-31) |

### Execution Context

Single-process Node MCP server; every authenticated tool loads, mutates and re-seals `session.json` under last-writer-wins over the whole file. `get_activity` deliberately re-loads after composition ([`:998-1003`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L998)) because composition awaits dozens of FS reads and a stale save would revert a concurrent sibling write.

Error propagation is per-call: a throw becomes an MCP tool error and the session is not advanced. There is no consensus dimension and no fatal-error class — the blast radius of a bad guard is one tool call, not a halted system. This makes a *blocking* S2 reconciliation cheap to recover from (retry the `next_activity`) but capable of stalling a walk on a false positive.

### Operational Scenarios

| Scenario | Effect on this code path | Risk |
|---|---|---|
| Two workers live on one session | Every `technique_fetched` row is visible to both; `validateTechniqueFetches` accepts either as coverage | **High** — silent false negative, the live defect above |
| Worker resumed after a checkpoint yield | Second `activity_dispatched` for the same (scope, activity) → `dispatchKind: 'resume'`; a second `record_usage` row arrives with no agent id | **High** — see [The resumed-worker convention is already being improvised](#the-resumed-worker-convention-is-already-being-improvised-in-the-payload--2026-07-31) |
| Out-of-band dispatch that never calls `get_activity` | First call bearing an unseen scope records a `fresh` dispatch from `get_technique` / `get_resource` ([`resource-tools.ts:743`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/resource-tools.ts#L743)) with **no `chars`** | Medium — a dispatch row with no magnitude breaks a chars-based rollup unless treated as absent |
| Activity re-entered by a loop-back transition | `validateTechniqueFetches` rescopes to the newest `activity_entered`, so the revisit needs its own fetches; `completedActivities` already holds the id | Low — handled deliberately |
| Corpus submodule empty in the worktree | Corpus guards and any corpus-reading test are vacuous unless `--root` / `WORKFLOWS_DIR` points at a populated checkout | Medium — a green local run can be meaningless |
| Reference-mode marker arriving at a context that was summarized | `full: true` / `bundle: 'full'` recovers; without it the marker is unreadable | Low — documented escape hatch on all three delivery tools |

## Domain Concept Mapping

### Glossary

| Domain term | Technical construct | Description |
|---|---|---|
| Fidelity | `technique_fetched` / `technique_bundled` / `resource_fetched` rows + `validateTechniqueFetches` | Evidence that a step ran against its composed content rather than the agent's recollection |
| Delivery scope | [`deliveryScope`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/delivery.ts#L56) → per-call `agent_id`, else `state.agentId` | The agent *context* a payload was delivered to — the ledger key, and the dimension every read path lacks |
| Dispatch | `activity_dispatched` row | One agent context arriving at the server; counts arrivals, where `activity_usage` counts what they cost |
| Fresh / resume | [`DispatchKind`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/dispatch.ts#L20) | Whether a delivery call is a context's first arrival for an activity or the same context again |
| Block | a `DEDUP_BLOCKS` key of a projected technique | Contract-inherited material shared across the techniques of one group |
| Declared vs produced artifact | `composeActivityArtifacts` output vs envelope `artifacts_produced` | What the activity's techniques say they write, against what the worker says it wrote |
| Ship gate | [`evaluateGate`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/scripts/run-token-benchmark.ts#L337) | Fresh-mode, same-workflow, same-corpus delivery-char comparison against the frozen A0 fixture |
| Artifact prefix | server-computed `artifactPrefix` from the activity filename | Numeric ordering prefix applied at write time; techniques declare bare names |

### Domain Model

Two vocabularies meet in this package. The **delivery** vocabulary (scope, ledger, marker, chars) is about paying for context once, and is fully instrumented at the write end. The **accounting** vocabulary (dispatch, usage, cost, manifest, artifact) is about explaining a run afterwards, and stops at the write end. Both are anchored on one identity — the agent context — which the delivery half keys everything on and the accounting half records but never reads. Closing these four items is largely a matter of teaching the accounting half to use the key the delivery half already maintains.

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|---|---|---|---|
| 1 | Which benchmark can gate S4, given block dedup only runs in reference mode and the `bench:token` ship gate requires a fresh arm? | Resolved | `bench:dispatch`. It runs a fresh pass and a reference-mode resume pass against one `agent_id` and gates on the saving between them (`--gate --min-saving-pct`), so it is mode-matched by construction and exercises block dedup on the resume arm. `bench:token`'s fresh-arm rule governs total-delivery-char changes and would additionally apply if intra-response collapse were enabled in fresh mode | [Block dedup yield and the two gates that can measure it](#block-dedup-yield-and-the-two-gates-that-can-measure-it--2026-07-31) |
| 2 | What share of technique-delivery cost is recoverable by *block* dedup as distinct from whole-technique dedup? | Resolved for one delivery | On the 75,991-char `get_activity` payload this activity received: 13,499 chars (17.8%) are byte-exact repeats, of which 80% is one technique bound by two steps — the case the existing `technique:<id>` key already covers. Block dedup's own marginal share is 2,718 chars, 3.9% of that response. This quantifies the two-tier rationale already recorded in [delivery-ledger.md](delivery-ledger.md#design-rationale-hypotheses) | same |
| 3 | Can a usage row be joined to a fresh-vs-resume dispatch without a schema change? | Resolved | No. `activity_usage` records no `agentId`, and the orchestrator role is already writing a free-form `dispatch: "resume-after-checkpoint"` key into the opaque `usage` payload to compensate — an observed instance of the gap, not a hypothetical. Cost of leaving it unsettled, measured on this run's four rows: a naive sum gives 519,834 subagent tokens against 291,921 if resumed rows are cumulative — a **78% overstatement**. Two candidate fixes, both enum-free | [The resumed-worker convention is already being improvised](#the-resumed-worker-convention-is-already-being-improvised-in-the-payload--2026-07-31) |
| 4 | What is the comparison key for artifact reconciliation, given prefixes, templates and path presentation? | Resolved | The declared `id`, not the filename. `composeActivityArtifacts` already emits `{ id, name }` and the envelope already carries `{ id, name, path }`; ids are prefix-free, template-free and presentation-free, so an id join sidesteps all three hazards that defeat a name or path diff | [The declared side of a reconciliation is not a filename list](#the-declared-side-of-a-reconciliation-is-not-a-filename-list--2026-07-31) |
| 5 | Which artifacts legitimately land outside `{planning_folder_path}`, and how does a folder-scoped diff avoid flagging them? | Resolved | At least three declaration families do: `{codebase_area}.md` (this file, written to the comprehension directory), `{agent_id}.json`, and `s{scanner_number}-{submodule_path}.json`. The declaration carries no write target, so a folder-scoped diff must treat an id it cannot locate as unknown rather than missing | same |
| 6 | Would a delivery-time resource-existence check be quiet enough to act on? | Resolved | Yes. Replaying the bundler's discovery with correct source-workflow scoping over all 15 workflows and 691 technique steps yields 1,273 extracted ids and 1,244 resolvable — a 2.3% failure rate. All 29 failures are real, and the dominant one was reproduced live during this run: `get_resource { resource_id: "planning-readme" }` failed on this `work-package` session and succeeded only as `meta/planning-readme` | [Resource refs rot by losing their home workflow](#resource-refs-rot-by-losing-their-home-workflow-not-by-going-stale--2026-07-31) |
| 7 | Does extending `inspect_session`'s `usage` view need the Python oracle extended, or is it already un-oracled? | Resolved | Already un-oracled. The parity test iterates a hardcoded seven-view array that omits `usage`, so a new view is silently uncovered rather than failing | [The usage view is outside the parity oracle](#the-usage-view-is-outside-the-parity-oracle--2026-07-31) |
| 8 | Do technique steps fail to compose against their own workflow anywhere in the corpus? | Resolved | No. With `sourceWorkflowId` scoping as `get_activity` applies it, all 691 technique steps across 15 workflows compose, including 14 borrowed activities. The `:767` silent-skip site does not fire on this corpus | [Resource refs rot by losing their home workflow](#resource-refs-rot-by-losing-their-home-workflow-not-by-going-stale--2026-07-31) |
| 9 | Should S2 warn or block, given no fidelity check has ever raised an error? | Resolved | **Warn.** Settled in requirements-elicitation's stakeholder interview: undeclared files surface in `_meta.validation` at `next_activity` so the orchestrator sees them before staging. Blocking was rejected as a behavioural break; auto-declare was rejected because it would launder unreviewed files into apparently-reviewed ones. The uniform advisory stance this row identified is what carried the decision | [requirements](../planning/2026-07-30-issue-365-context-fidelity-observability/03-requirements-elicitation.md#success-criteria) SC-1 |
| 10 | What is block dedup's share across a whole walk, rather than on one delivery? | Open — measurement | The one measured delivery bundled 5 steps; the A0 fixture records 62 `technique_bundled` events for a full `work-package` walk, so the per-walk mix of repeated-technique versus shared-contract steps is unknown and could move the 80/20 split either way. Answering it means running `bench:dispatch` against a populated corpus, which belongs to the implementation phase, not to further comprehension | [Block dedup yield and the two gates that can measure it](#block-dedup-yield-and-the-two-gates-that-can-measure-it--2026-07-31) |
| 11 | What emits `step_started` / `step_completed`, given `step_manifest` carries no timestamps and an eagerly bundled step makes no per-step call? | Open — design | Surfaced during assumption reconciliation. Deriving both from the manifest stamps every step at activity close, so retrospective-only; the only timestamped per-step signals are `technique_fetched` and `technique_bundled`, and bundled steps produce neither at execution time. An internal contract choice, not a stakeholder one — carried to implementation-analysis | [Step granularity has no timestamped source for bundled steps](#step-granularity-has-no-timestamped-source-for-bundled-steps--2026-07-31) |

### Remaining follow-up items (out of scope)

- `SessionFile.deliveredContent`'s doc comment lists four of the seven key namespaces the code writes ([`session.schema.ts:158`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/schema/session.schema.ts#L158) vs [`delivery.ts:17`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/delivery.ts#L17)). Documentation drift, not behaviour.
- Six corpus artifact declarations hardcode a numeric prefix, contradicting the `artifact-prefix` rule that techniques declare bare names. A corpus fix, not a server one.
- Benchmarks are absent from `.github/workflows/verify.yml`, so no gate runs unattended regardless of what S4 measures.
- The eager budget charges a block-deduped entry its full pre-dedup size while charging a whole-technique marker nothing. Already recorded, and recorded as intentional, at [delivery-ledger.md](delivery-ledger.md#open-questions) Q6 — not re-adjudicated here.
- [token-use-tracking.md](token-use-tracking.md) questions 1–3 were answered before `record_usage` shipped and their predictions no longer match the code: usage landed on its own tool rather than `next_activity`, the event is `activity_usage` rather than `usage_recorded`, and no rolled-up `SessionFile.usage` field was added. Reconciling that artifact against shipped code is a separate augmentation pass.

## Deep-Dive Sections

### Block dedup yield and the two gates that can measure it — 2026-07-31

S4's remaining work is a measurement, and the obstacle is narrower than "no valid gate exists" — it is that the two benchmarks measure different things and only one of them sees block dedup at all.

**Why the ship gate does not see it.** `docs/development.md:231` states the rule without qualification: "**Every delivery-path change must be gated on a fresh-mode arm**". [`evaluateGate`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/scripts/run-token-benchmark.ts#L337) enforces it — a comparison that is not `modeMatched && workflowMatched` returns `passed: false`, and the frozen A0 fixture records `contextMode: "fresh"`. But `dedupTechniqueBlocks` never runs in fresh mode: both call sites sit inside `if (referenceMode)`, and `referenceMode` is false whenever the session is `fresh` and no per-call `bundle: "reference"` was passed. Ledger *writes* are mode-independent by design ([`workflow-tools.ts:665-667`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L665)); ledger *reads* are not. So a `bench:token --context-mode=fresh` run measures a path on which the feature is inert.

**The gate that does see it.** [`run-dispatch-benchmark.ts`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/scripts/run-dispatch-benchmark.ts) is a different instrument: for each sampled activity it runs a fresh spawn and then the *same* `agent_id` resumed with `bundle: "reference"`, and reports `savingPct` on delivered chars between the two, with `--gate --min-saving-pct=<n>` ([`:31-32`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/scripts/run-dispatch-benchmark.ts#L31), gate at [`:202`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/scripts/run-dispatch-benchmark.ts#L202)). The resume arm is reference mode, so block dedup is active on it; corpus, workflow and agent are held constant and only the fresh/resume dimension varies, so the comparison is mode-matched by construction and the `bench:token` cross-mode objection does not apply. Figures come from the server's own `chars` events rather than the script's estimate. **S4's measurement gate therefore already exists** — it is `bench:dispatch`, not `bench:token`, and the fresh-mode rule that appears to block S4 governs total-delivery-char changes on `bench:token` specifically.

**When the fresh-mode rule would apply.** `dedupTechniqueBlocks` already carries an intra-response mechanism independent of the ledger: `newDeliveries[key] === hash` collapses a block staged by an *earlier bundled step of the same call*. Collapsing a second copy against a first copy in the same message is safe in any mode, because the reader holds both; only the `if (referenceMode)` at the call site prevents it. Enabling that would make fresh-mode delivery cheaper — and would then be exactly the kind of change `docs/development.md` requires a `bench:token` fresh arm for, an arm that would now be sensitive to it. The two options are therefore complementary, not alternatives: measure the reference-mode win with `bench:dispatch` today, and if intra-response collapse ships, gate that separately on the fresh arm.

**How much is at stake.** Measured byte-exactly on the `get_activity` payload this very activity received (5 bundled steps, fresh/full mode, `work-package` corpus at `f7eb4793`):

| Quantity | Chars |
|---|---|
| Whole response | 75,991 |
| Ops section (bundle + step techniques) | 70,489 |
| `step_techniques` block alone | 43,457 |
| **Byte-exact repeated content within the one response** | **13,499** |
| — one whole technique body delivered twice (`manage-artifacts::write-artifact`, bound by `create-comprehension-artifact` and `update-artifact-initial`) | 10,781 |
| — `rules` ×2 and `inherited_outputs` ×1 shared across three *different* techniques of the `codebase-comprehension` group | 2,718 |

That is 31.1% of the `step_techniques` block, 19.2% of the ops section, 17.8% of the whole response — repeated bytes, in one message, that a reader has no use for twice.

**What this quantifies.** [delivery-ledger.md](delivery-ledger.md#design-rationale-hypotheses) already records *why* the two tiers exist — a re-fetch of the same technique collapses wholesale under `technique:<id>`, and only a not-yet-seen technique whose contract a sibling already delivered needs per-block markers. The measurement puts numbers on that split, and the numbers are lopsided. 80% of the repetition here is one technique body appearing twice, keyed identically at `technique:manage-artifacts::write-artifact`; the two bodies are byte-identical (10,781 chars each, verified after excluding only the `▼ STEP` marker line). Whole-technique dedup covers that case, and covers it *better*, collapsing 10,781 chars rather than the 7,352 of blocks inside it. Only the remaining 2,718 chars are what `DEDUP_BLOCKS` uniquely catches. So the issue's attribution of roughly a quarter of technique-delivery cost to "repeated contract/rules boilerplate" conflates two mechanisms with very different yields: on this sample block dedup's own marginal contribution is 3.9% of the response, and the already-shipped whole-technique tier accounts for the rest.

One delivery is not a walk, and the mix is what matters: the A0 fixture records 62 `technique_bundled` events for a full `work-package` walk against the 5 measured here, so a walk with more sibling-contract steps and fewer repeated-technique steps would shift the 80/20 the other way. Sizing S4 on this figure alone would be over-reading it — hence Q10.

`inherited_inputs` is the weakest of the three blocks, and the measurement shows why. The composed inherited set is whatever the group contract declares *minus* the technique's own declared inputs, so two techniques in one group share an `inherited_inputs` hash only when their own-input signatures match. All four distinct techniques in this payload hashed differently (1,041 / 1,296 / 1,394 / 1,539 chars); the only match was between the two steps bound to the same technique, which the whole-technique tier already covers. Any extension of `DEDUP_BLOCKS` should be justified per candidate block against this asymmetry rather than as a set.

**Confirmed no-change point.** [`projectTechniqueToYaml`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/loaders/technique-loader.ts#L56) is exactly `stringifyForResponse(projectTechnique(technique))`, the same expression `get_technique` hashes at [`resource-tools.ts:707-708`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/resource-tools.ts#L707). The bundle path and the fetch path therefore produce byte-identical text and genuinely share the `technique:<id>` ledger key in both directions, as the comment at `:720-723` claims. No work needed there.

### Per-agent filtering has no per-agent dimension to filter on — 2026-07-31

S5's third gap reads as "add a filter parameter". Two of the three read paths need the dimension *created* first, and the third has a live defect that a filter parameter would not fix.

**`get_trace` — the field exists but is constant.** `TraceEvent.aid` is populated in exactly one place, [`appendTraceEvent`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/logging.ts#L98), from `state.agentId`. The per-call `agent_id` is present in `params` for the three delivery tools that declare `agentIdParam` and is never read. Since a dispatched worker authenticates against the *orchestrator's* `session_index`, `state.agentId` is the same string for every concurrent worker on a session. A `get_trace { agent_id }` parameter added today would filter every event or none. The fix is two-part: populate `aid` from `params['agent_id'] ?? state.agentId`, then filter.

**`validateTechniqueFetches` — a live false negative, independent of any new parameter.** The visit scan at [`validation.ts:166-172`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/validation.ts#L166) filters on `entry.activity !== activityId` and then reads `data.stepId` / `data.techniqueId`. `data.agentId` is written by every producer and read by none. Consequence: when two workers are live on one session — the ordinary case for a parallel scatter, per the `spawn-concurrent` mode of `scatter-gather` — worker A's `get_technique` satisfies worker B's manifest claim for the same step. The warning that exists to catch "step reported complete without reading its technique" is silently suppressed by an unrelated sibling. This is the one item in the package that is a defect in shipped behaviour rather than an absent feature, and it needs no schema change: the field is already on the row.

**`projectUsage` / `projectHistory` — no dimension recorded at all.** `record_usage` declares `{ session_index, activity, usage }`. There is no `agent_id` parameter and none is written to the row, so per-agent usage filtering is not a read-path change but a write-path one.

**Live evidence.** This session's history carries 41 delivery events (23 `technique_bundled`, 9 `technique_fetched`, 9 `resource_fetched`) and 4 `activity_dispatched` rows, every one of them stamped with `data.agentId`. Not one read path consults it.

### The resumed-worker convention is already being improvised in the payload — 2026-07-31

S3's stated blocker is that the cumulative-vs-delta convention was never settled. The stronger finding is that the absence is already being worked around, invisibly, inside a field the server does not validate.

`usageSchema` is `z.record(z.unknown())` — deliberately opaque, so a harness can report whatever it measures. This session's four rows, read through `inspect_session { view: 'usage' }`:

| # | Activity | `subagent_tokens` | Extra keys the orchestrator added |
|---|---|---|---|
| 1 | start-work-package | 136,552 | — |
| 2 | start-work-package | 156,898 | `dispatch: "resume-after-checkpoint"` |
| 3 | design-philosophy | 91,361 | — |
| 4 | design-philosophy | 135,023 | `dispatch: "resume-after-checkpoint"` |

The `dispatch` key is not part of any declared shape. The orchestrator role writes it on resume dispatches because the tool signature offers nowhere to record that a pass was a resume, so the convention is being set by call-site improvisation rather than by contract — unvalidated, undocumented, and invisible to `projectUsage`, which passes `data.usage` straight through without inspecting it. This is the S3 gap manifesting as behaviour rather than as an absence: the need is real enough that it is already being met informally.

**The magnitude of the ambiguity, for the plan to inherit rather than re-derive.** A naive sum over these four rows gives **519,834 `subagent_tokens`**. If the two resumed rows are cumulative restatements of their activity's running total rather than that pass's delta, the correct total is **291,921** — the naive sum overstates by **78%**. Nothing in the recorded data distinguishes the two readings, and no rollup exists yet to be wrong. Any cost figure produced before the convention is imposed carries an error of roughly this magnitude, which is why S3's aggregate genuinely cannot precede the convention decision rather than merely being tidier after it.

**Why `dispatchKind` does not close this on its own.** [`dispatchKind`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/dispatch.ts#L27) does derive `fresh` / `resume` reliably, but it is keyed on `(scope, activityId)` and reads `activity_dispatched` rows. Joining that to a usage row requires the usage row to name its scope, and it does not. Ordinal correlation — the Nth usage row for activity A against the Nth dispatch row for activity A — fails in three recorded ways: a resume after a checkpoint yield goes through `resume_checkpoint` and may add no dispatch row; an out-of-band dispatch adds a dispatch row from `get_technique` / `get_resource` with no `chars` and likely no usage row; and `record_usage` is an orchestrator courtesy the server cannot compel, so rows go missing without trace. This session shows 4 dispatch rows against 4 usage rows, which is a coincidence of a walk that has so far had no out-of-band work, not a structural guarantee.

Two shapes make the aggregate well-defined, both enum-free because `HistoryEntry.data` is already an open record. The general one is an `agent_id` parameter on `record_usage`, written onto the row alongside `usage`, which restores the join to `activity_dispatched` and simultaneously gives S5's per-agent usage filtering the dimension it lacks. The narrower one is to declare the `dispatch` discriminator the orchestrator is *already* writing — promote it from an improvised key inside the opaque payload to a validated parameter — which settles the cumulative-versus-delta reading without introducing an identity join at all. The narrow option is cheaper and matches observed behaviour; the general one is the only one that also serves S5. Choosing between them is a plan decision, not a comprehension gap.

### The declared side of a reconciliation is not a filename list — 2026-07-31

S2 is framed as diffing the planning folder against the accumulated manifest. The declared side is not shaped for that diff, in three independent ways measured across the corpus at `f7eb4793`: **137 artifact declarations, 117 distinct names.**

**Prefixes.** The `artifact-prefix` rule has techniques declare bare names (`code-review.md`), with the server-computed `artifactPrefix` applied at write time (`09-code-review.md`). So the declared string never equals the on-disk filename for any artifact — a literal comparison mismatches all 137. Reconciliation must strip a leading `NN-` from the on-disk side. Six declarations additionally hardcode their own prefix (`01-audit-report.md`, `02-CONTEXT-ANALYSIS.md`, `01-COMPLETION-ANALYSIS.md`, `02-gap-analysis.md`, `01-cicd-audit-report.md`, and the `NNNN-{decision_title}.md` template), which contradicts the rule and will either double-prefix or mismatch depending on how the writing technique behaves.

**Templates.** 13 declarations are `{token}` patterns the *worker* interpolates at runtime: `{codebase_area}.md`, `{package_name}-plan.md`, `{lens_name}-analysis.md`, `{agent_id}.json`, `s{scanner_number}-{submodule_path}.json`, `{YYYY-MM-DD}-pr{pr_number}-review-analysis.md`, and seven more. The server holds the variable bag and could interpolate some of them, but not all — `{codebase_area}` is derived by the worker from the subsystem it chose to survey and exists in no variable. A reconciliation must either expand what it can and exempt the rest, or treat any template as a wildcard, which weakens the check exactly where naming is least predictable.

**Write target.** The declaration carries `{ id, name, audience? }` and no directory. At least three families write outside `{planning_folder_path}`: this artifact is declared `{codebase_area}.md` and written to `.engineering/artifacts/comprehension/` (a cumulative store, deliberately outside the per-work-package folder — which is also why it carries no numeric prefix, matching all 34 files already there); `{agent_id}.json`; and the scanner JSON family. A folder-scoped diff would report every one of them as declared-but-missing. The `write-artifact` technique does take a `target_dir` input defaulting to `{planning_folder_path}`, but that is a step *binding*, invisible to `composeActivityArtifacts`, which reads only the technique's `## Outputs`.

**Paths are not a fallback either.** The envelope reports `{ id, name, path }`, so a path-keyed diff looks attractive. It is unsound: [`presentPathToAgent`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/path-presentation.ts#L109) rewrites server paths to host paths one-way for agent-facing responses, with no inverse function anywhere in `src/`, and additionally collapses `owner/repo` segments to a basename. Under Docker the worker's `path` and the server's own path are different strings for the same file.

**The key that survives all three hazards is the id.** `composeActivityArtifacts` emits `{ id, name, audience? }`, where `id` is the technique output's own id (`comprehension_artifact`, `written_artifact`) and falls back to the name only when the output declares none. The envelope's `artifacts_produced` entries already carry `id` as their first field. An id join is prefix-free, template-free and presentation-free: it compares two symbolic names neither side rewrites, and it reduces the filename problem to a secondary check ("this id was declared and reported — does a file matching its expanded name exist?") that can be advisory even where the primary check is not. Filename or basename matching is then the fallback for the untracked case — a file present in the folder that no reported id claims, which is exactly the "undeclared files" S2 exists to surface.

**Mechanically, the read is free.** `loadSessionForTool` already returns `folderAbsPath`, and `readdir` is used in four modules including `src/utils/session/store.ts`, so listing the planning folder inside `next_activity` needs no new plumbing. What is missing is a parameter to carry `artifacts_produced` at all, plus the warn-versus-block decision.

### Resource refs rot by losing their home workflow, not by going stale — 2026-07-31

S5's first gap is framed as adding existence checking at delivery time. Replaying the bundler's own discovery over the whole corpus shows both that the check would be quiet enough to act on and that its failures have a single, unexpected cause.

**Method.** For every activity step of all 15 workflows, compose the step technique exactly as [`get_activity`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L764) does — including resolving against `sourceWorkflowId` from `loadWorkflowWithDiagnostics`, so the 14 borrowed activities compose against the workflow their activity file was authored in — then project with `projectTechniqueToYaml`, extract ids with the real `extractResourceIds`, and resolve each through the real `loadResourceDelivery`.

**Result.** 691 technique steps, **all 691 composed** — the `:767` silent-skip site does not fire anywhere on this corpus. **1,273 extracted resource-id occurrences, 1,244 resolvable, 29 unresolvable across 14 distinct ids — a 2.3% failure rate, with zero missing-anchor failures.** A delivery-time warning would fire on roughly one id in 44, which is actionable rather than noisy. `extractResourceIds` proved precise here: relative technique links are excluded by their leading `./` or `../`, so the extraction is not the source of the failures. Source scoping changed the extraction count and the compose count but left the unresolvable set exactly unchanged — the same 29 occurrences and 14 ids — so these are real, not a replay artifact.

**The cause is scoping, not staleness.** 17 of the 29 failures are `planning-readme#template`, `#rules`, `#status-vocabulary` and `#status-transition-policy`. That resource exists at exactly one place, `meta/resources/planning-readme.md`, and six `meta/techniques/workflow-engine/*.md` files link it correctly as `../../resources/planning-readme.md`. `extractResourceIds` strips everything through the last `resources/`, yielding the **bare** id `planning-readme#template`, and `parseResourceRef` returns `workflowId: undefined`. [`readResourceRaw`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/loaders/resource-loader.ts#L76) then resolves it under `<workflowDir>/<sourceWorkflow>/resources/` with no `meta` fallback — and the source workflow is the *activity's*, never the *technique's*. So a `meta` technique's own resource link is looked up in the borrower's resource directory. `work-package/resources/` has no `planning-readme.md`, so these fail on every non-`meta` workflow that binds one of those six techniques, which is every workflow with an orchestrator persist hook. The remaining 12 failures are the same shape (`assumptions-review#…`, `review-mode#…`, `deferred-items` under `workflow-design`) plus two strays (`l12`, `DETAILED-FINDINGS`) and one documentation placeholder (`relative/path/to/file`).

**Reproduced on the live delivery path, not only in replay.** During this work package's own run, a `get_resource { resource_id: "planning-readme" }` call against this `work-package` session failed with `Resource not found: planning-readme in workflow work-package`, and succeeded only when re-issued as `meta/planning-readme`. The bare id is what a technique's own link yields after extraction, and the workflow-qualified form is the workaround — so the corpus-replay figure above is not a measurement artifact of the replay harness. The defect fires in ordinary use, on the tool a worker reaches for when the eager bundle did not carry the body.

**Warning about it is not the only option.** Because the dominant cause is a lost workflow qualifier rather than a dead file, the failure can be removed at source: when the composed technique came from a workflow other than the delivering one, qualify the extracted id with the technique's own workflow (`meta/planning-readme#template`), a form `parseResourceRef` already accepts. That eliminates 17 of 29 failures and leaves a delivery-time check to catch only genuine rot — which is a better division of labour than warning about an addressing bug 17 times per walk. The two are complementary; the check is still needed for the residue.

**Why no guard catches it.** `check-resource-anchors.ts` validates the *authored* form — a relative `.md#anchor` markdown link, resolved against the source file's own directory. From `meta/techniques/workflow-engine/` that resolves to `meta/resources/planning-readme.md`, which exists, so the guard passes. The runtime resolves a *derived* form — a bare workflow-relative id — which fails. Guard and runtime validate two different strings, so a hard-zero guard and a 2.8% runtime failure rate coexist without contradiction. The guard's regex could not cover the derived form even if extended: `LINK_RE` requires a `.md` target and resource ids carry none.

This is a different defect from the slug-grammar divergence documented in [resource-section-addressing.md](resource-section-addressing.md#the-two-sluggers), and independent of it — this corpus produced zero missing-anchor failures, so the two failure modes do not currently overlap.

**Consequence at delivery.** In reference mode the failure hits `if (!loaded.success) continue;` and the id is not added to `resourceRefIds`, so the worker never learns the resource was linked. In full mode — production's default — the whole resolution loop is skipped and the id ships in `resource_refs` unvalidated, so the worker's own `get_resource` throws mid-activity. Adding the check on the resolution path only would leave full mode, the common case, still unchecked.

### The usage view is outside the parity oracle — 2026-07-31

The design philosophy records as a constraint that `inspect_session` is parity-tested against a Python oracle implementing no `usage` view, so extending that view means extending the oracle deliberately. The situation is one step worse: the view is not merely unimplemented in the oracle, it is **excluded from the parity assertion**, so nothing fails today and nothing would fail after an extension.

[`inspect_session.py`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/tests/fixtures/inspect-session/inspect_session.py) defines `identity`, `checkpoints`, `activities`, `history`, `children` and `summary`, and its `main` exits with `unknown view: usage` for anything else. The parity test PR215-TC-08 at [`mcp-server.test.ts:2564`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/tests/mcp-server.test.ts#L2564) iterates a hardcoded literal array of seven view names that omits `usage`, so the oracle is never invoked for it and the exit never happens. `INSPECT_SESSION_VIEWS` in the server lists eight.

The failure mode is silence in both directions: the eighth view is already uncovered, and an aggregate added to it inherits that. The array is a literal, not derived from `INSPECT_SESSION_VIEWS`, so adding a ninth view would also be silently uncovered. Deriving the loop from the exported constant would turn "view not in the oracle" into a test failure instead of a gap — the cheap structural fix, separable from whatever S3 adds.

### Step granularity has no timestamped source for bundled steps — 2026-07-31

Surfaced while reconciling requirements-elicitation's assumptions. S5's step-granularity gap is recorded as "emit and consume two already-declared enum members", which understates the missing piece: the server has no timestamped per-step signal for the steps that matter most.

`StepManifestEntry` is `{ step_id, output }` ([`validation.ts:60-63`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/utils/validation.ts#L60)) — no timestamps — and the manifest arrives once, on `next_activity`, at activity close. Deriving both `step_started` and `step_completed` from it therefore stamps every step with the same activity-close time and gives no in-flight visibility, which is most of what step granularity is for. The only per-step signals reaching the server with real timestamps today are `technique_fetched` (whose `data.stepId` identifies the step) and `technique_bundled`. But an eagerly bundled step makes no `get_technique { step_id }` call at all — that is the point of inlining, and `technique_bundled` is stamped at *delivery* time, not at step-execution time. So precisely the steps a bundling activity inlines are the ones with no start signal available.

Three candidate sources, none free: derive both events at activity close from the manifest (cheapest, retrospective only); add a worker-emitted per-step call (real timestamps, but a new worker-facing contract and a per-step round-trip the bundling design exists to avoid); or emit `step_started` from step-bound fetches and accept a hole for bundled steps (no new contract, silently partial coverage). The choice is an internal contract decision rather than a stakeholder one, so it is carried to implementation-analysis rather than into the open-assumption residue.

### Reconciliation notes on the other three items — 2026-07-31

Smaller confirmations from the same pass, each cheap to state and load-bearing for a success criterion:

- **The `agent_id` addition to `record_usage` is strictly additive.** Params are `{session_index, activity, usage}` and the handler writes `data: { usage }` ([`workflow-tools.ts:1149`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/tools/workflow-tools.ts#L1149)), while `projectUsage` reads only `e.data?.['usage']` (`:256-260`) — so an optional `agent_id` leaves every existing row projecting unchanged into an unattributed bucket. `activity_dispatched` already carries `{ agentId, dispatch }` in `data`, so `agentId` is the established field name to follow rather than a new convention.
- **S2 needs a session field, not an enum member.** `SessionFileSchema` ([`session.schema.ts:59-164`](https://github.com/m2ux/workflow-server/blob/092b0c1be65e140d843ee157b0c308a56405b533/src/schema/session.schema.ts#L59)) carries no artifact or manifest field, and `deliveredContent` at `:164` — an optional `z.record(z.record(z.string()))` keyed by agent — is the standing precedent for adding one. Storing the accumulation as a field avoids touching the closed `HistoryEventTypeSchema` entirely, and `buildValidation` (`validation.ts:255-265`) is variadic over warning strings, so the warn channel needs no shape change either.
- **The A0 re-freeze may still be owed, for a different reason than expected.** Block dedup is inert in fresh mode and A0 records `contextMode: "fresh"`, so the S4 coverage fix should not move delivered chars. But ledger *writes* are mode-independent (`workflow-tools.ts:665-667`) while reads are not, so adding a `DEDUP_BLOCKS` member can still shift key-count metrics on a fresh run. Settle it with a dry `bench:token` comparison rather than assuming the baseline is safe.
