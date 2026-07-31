# Requirements Elicitation: Context Fidelity and Observability

> 2026-07-31 · Confirmed

## Problem Statement

The workflow server records claims and magnitudes but never reconciles or aggregates them: worker-declared artifacts are never diffed against the planning folder before that folder is committed, per-activity token rows are never rolled up or costed, block-level delivery dedup is unmeasured against the ship gate, and three specified observability pieces (resource validation, step-granularity events, per-agent filtering) were never delivered. The cost is concrete — undeclared files already reached an unreviewed commit, run cost stays invisible until a bill arrives, repeated material is paid for on every delivery, and one worker's technique fetch currently counts as fidelity coverage for a sibling worker's step. Scope is fixed to items S2, S3 tail, S4 and S5 of #365; system context, impact and classification are in [design philosophy](02-design-philosophy.md).

## Goal

Every discrepancy the server can detect is surfaced to the agent that can act on it, and every magnitude it records is summable, attributable to the agent that incurred it, and priced — without changing the behaviour of any existing run.

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| Orchestrator agent | To learn about undeclared planning files at the moment it decides what to stage | As an orchestrator, I want undeclared files named in the `next_activity` response so that unreviewed content does not enter the committed record on my own action |
| Workflow operator / issue author | A per-run token total and a money figure they can budget against and compare between approaches | As an operator, I want a per-workflow usage aggregate and derived cost so that I can see run cost before a bill arrives and notice when it goes wrong |
| Agent or human debugging a multi-worker run | To attribute events, fetches and cost to the worker that caused them | As a debugger, I want trace, history and usage filterable by agent so that a parallel run's evidence is separable per worker |
| Server maintainer | Numbers, not estimates, before changing delivery shape | As a maintainer, I want technique-delivery cost measured against the fresh-mode gate so that a dedup change is justified by a measured share |
| `validateTechniqueFetches` (machine consumer) | An agent dimension on the events it reads | As the fidelity validator, I want fetch events scoped to the agent that manifested the step so that I stop crediting a sibling's fetch |

### Secondary Stakeholders

- Companion issue **#338** — consumes S3's aggregate at W3, and owns the corpus persist half this package deliberately leaves alone ([deferred-items](deferred-items.md) D-1, D-2).
- PR **#366** reviewers — the surfaced warnings and the honest benchmark figure are what makes the change reviewable.

## Context

### Integration Points

The four items land on five coupled surfaces (tool layer, delivery ledger, session/state schema, validation layer, benchmarks and guards). The surface table with file paths and relevance is in [design philosophy](02-design-philosophy.md#system-context); it is not restated here.

### Dependencies

- The workflow corpus is a separate git submodule, empty in this worktree, so `artifacts_produced` exists only as corpus prose today.
- #338 W3 consumes S3's aggregate.
- Benchmarks are manual (`npm run bench:token`, `bench:dispatch`) and absent from CI.

### Constraints

- **Technical:** the full constraint table is in [design philosophy](02-design-philosophy.md#constraints). The stakeholder interview added three: (1) no breaking change to `record_usage` — the new `agent_id` must be optional and rows already recorded must stay valid; (2) extending `inspect_session`'s history and usage views obliges a deliberate extension of the Python oracle fixture, and that cost is accepted; (3) the token-benchmark reference baseline must be re-frozen after the dedup coverage change, and the reported saving must be the honest post-fix figure.
- **Timeline:** none stated.
- **Resources:** delivery on `feat/365-context-fidelity-observability` in the existing worktree; PR #366 open. `workflow-canon` applies to any workflow-definition edit.

## Scope

### In Scope

1. **S2 reconciliation.** Accumulate the declared artifact manifest in session state across activities, diff the planning folder against it at `next_activity`, and surface every undeclared file in `_meta.validation`. Warn only — no block, no auto-declare.
2. **S3 mechanism and convention.** Add an optional `agent_id` parameter to `record_usage`. Document DELTA as the cross-harness counting convention: each call reports only that dispatch's own work.
3. **S3 aggregate and cost.** A per-workflow usage aggregate that is the plain sum of the rows, plus a cost figure derived from it (price source and named consumer still open — see [assumptions log](02-assumptions-log.md) RE-4).
4. **S3 documentation corrections.** The three stale statements claiming usage arrives on `next_activity`, and the incomplete delivery-ledger namespace list.
5. **S4 measurement.** Report the recovered block-dedup share honestly, using both instruments: `bench:dispatch --gate --min-saving-pct` for the resume-vs-fresh delivered-chars figure — read as a before/after delta on the same arm, since its `savingPct` is not dedup-isolated — and `bench:token` for the frozen-baseline fresh-mode gate.
6. **S4 coverage fix.** Make `provenance_note` a dedup candidate, and stop hashing mixed blocks whole so the invariant `note` inside `inherited_inputs` / `inherited_outputs` collapses separately from their per-technique `items`. Re-freeze the baseline.
7. **S5 per-agent filtering.** Populate `TraceEvent.aid` from the per-call `agent_id`; scope `validateTechniqueFetches` on `data.agentId`; add an agent filter to `get_trace` and to `inspect_session`'s history and usage views, extending the oracle to match.
8. **S5 resource validation.** Replace the silent skip of an unresolvable resource with a surfaced warning/event, covering full mode as well as reference mode, and qualify an extracted resource id with the technique's own workflow when the technique was composed from a workflow other than the delivering one — removing 17 of the 29 corpus failures at source and leaving the check for genuine rot.
9. **S5 step granularity.** Emit and consume the already-declared `step_started` / `step_completed` history events. The emission source is an open internal contract choice — reconciliation showed `step_manifest` carries no timestamps, so deriving both events from it gives no in-flight visibility; settle the source at implementation-analysis (see [assumptions log](02-assumptions-log.md) RE-8).

### Out of Scope

1. **S7** — the issue requires it on an isolated branch.
2. **S9** — waits for a schema major; this package makes no breaking schema change.
3. **Blocking at `next_activity` on an undeclared set** — rejected as a behavioural break that can strand a run; no existing `next_activity` warning behaves that way.
4. **Auto-declaring undeclared files** — rejected because it would launder unreviewed files into apparently-reviewed ones, which is the exact harm S2 exists to prevent.
5. **Cumulative or per-call-declared usage semantics** — rejected; delta keeps the rows already recorded valid and matches the existing `account-every-dispatch` rule.
6. **Formalising the improvised `dispatch` discriminator** — rejected in favour of the `agent_id` parameter, which serves S3 and S5 with one addition.
7. **Agent filtering on every read path** (`projectSummary`, `projectActivities`, `projectCheckpoints`) — rejected on oracle-reconciliation cost.

### Deferred

Deferred scope items: [deferred-items register](deferred-items.md) — record each item there, not here.

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | `next_activity` names, in `_meta.validation`, every file in the planning folder that no accumulated manifest entry accounts for; the join is on the declared **`id`**, not a filename; a declared id whose file cannot be located reads as *unknown*, not *missing*; the call still succeeds and nothing is added to the manifest | Integration test: planning folder seeded with one declared and one undeclared file, plus one declaration that writes outside the folder — assert the undeclared name appears, the declared one does not, the outside-the-folder declaration is reported unknown rather than missing, the response is not an error, and the manifest is unchanged |
| SC-2 | The declared manifest accumulates across activities, so a file declared at activity N is not re-flagged at activity N+1 | Two-activity test asserting the earlier declaration suppresses the later warning |
| SC-3 | `record_usage` accepts an optional `agent_id`; calls that omit it are still accepted and their rows still project | Schema test both ways, plus projection over a fixture session whose existing rows carry no `agent_id` |
| SC-4 | Usage is delta per call and the per-workflow aggregate equals the arithmetic sum of the rows | `inspect_session view: usage` over an N-row fixture returns the plain sum; a resumed-dispatch row is asserted not to include the prior dispatch's tokens |
| SC-5 | The aggregate carries a derived cost figure from a price source with a named owner | Pending RE-4 — criterion is provisional until the price source and consumer are named |
| SC-6 | No server statement claims usage arrives on `next_activity`, and the delivery-ledger namespace list matches what the code writes | Grep assertion for the three stale statements; namespace list diffed against `src/utils/delivery.ts` |
| SC-7 | The recovered block-dedup share is reported as a before/after delta on the same `bench:dispatch --gate --min-saving-pct` arm (its `savingPct` measures resume-vs-fresh delivered chars, not dedup alone) | Two runs of the same arm, pre- and post-coverage-fix; the delta is quoted as measured, and the issue's ~25% is never quoted as evidence |
| SC-8 | `provenance_note` collapses to a marker across sibling techniques, and the invariant `note` inside `inherited_inputs` / `inherited_outputs` collapses independently of their `items` | Reference-delivery tests asserting a second technique's payload carries markers for `provenance_note` and the inherited-block `note` while its `items` still deliver in full |
| SC-9 | The frozen A0 reference is shown to be unmoved by the coverage fix — or re-frozen if it moves. Block dedup runs only in reference mode while A0 records `contextMode: "fresh"`, so delivered chars should be unaffected; ledger writes are mode-independent, so key-count metrics may still shift | Dry `bench:token` comparison against A0 before deciding: assert no regression, and re-freeze only if the comparison actually moves |
| SC-10 | `TraceEvent.aid` is populated from the per-call `agent_id`, and `get_trace` filtered by agent returns only that agent's events | Test asserting non-null `aid` on events recorded under an `agent_id`, and filtered/unfiltered `get_trace` differ |
| SC-11 | `validateTechniqueFetches` no longer credits one worker's fetch against a sibling worker's manifested step | Two-agent regression test that fails before the fix: A fetches step X, B manifests X without fetching, assert B is flagged |
| SC-12 | `inspect_session`'s history and usage views accept an agent filter; the oracle is extended for both; and the parity loop is derived from the exported `INSPECT_SESSION_VIEWS` instead of the hardcoded seven-view literal that omits `usage` — without that, a new view is silently uncovered and this criterion is untestable | Oracle-parity test over the extended fixture, asserting the filtered `history` reduce narrows on `data.agentId` identically on both sides, plus a test that a view present in `INSPECT_SESSION_VIEWS` but absent from the oracle now fails |
| SC-13 | An unresolvable resource surfaces a warning/event instead of being silently dropped, **in full mode as well as reference mode** — full mode is production's default and skips the resolution loop entirely, so a check on the resolution path alone would leave the common case unchecked; the call still succeeds either way | Two tests with a deliberately broken ref, one per delivery mode, asserting the id reaches `_meta.validation` and the response is not an error |
| SC-14 | An extracted resource id is qualified with the technique's own workflow when the composed technique came from a workflow other than the delivering one (`meta/planning-readme#template`) — a form `parseResourceRef` already accepts, so it adds a qualifier rather than moving a lookup root and cannot regress a ref that resolves today. 17 of the 29 corpus failures go away | Corpus replay before/after over all 15 workflows and 691 steps: assert the unresolvable set drops from 29 to 12 and that no previously-resolvable id joins it |

## Assumptions

Assumptions surfaced during elicitation: [assumptions log](02-assumptions-log.md) — record each there (categories: Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria Interpretation), not here.

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | What should the server do when it finds a discrepancy — specifically, an undeclared file in the planning folder? | Warn. Surface undeclared files in `_meta.validation` at `next_activity` so the orchestrator sees them before staging. Do not block (behavioural break), do not auto-declare (would launder unreviewed files). Matches the issue's own wording and the server's advisory-only validation posture. |
| Stakeholders | Who reads each of the four outputs? | Orchestrator agent reads the undeclared-file warning before staging — which is what makes warn sufficient. Whoever debugs a multi-worker run reads the per-agent trace, history and usage; `validateTechniqueFetches` is the machine consumer. The ship gate consumes the dedup measurement. The cost figure's human consumer was **not** settled — carried as RE-4. |
| Context | What mechanism carries the per-agent dimension, and what counting convention do resumed workers use? | Add an `agent_id` parameter to `record_usage`, chosen over formalising the improvised `dispatch` discriminator: the agent context is already the delivery ledger's key, `dispatchKind()` already derives fresh-vs-resume from it, and one addition serves S3 and S5. Counting is DELTA — each call reports only that dispatch's own work; the aggregate is a plain sum. Cumulative and per-call-declared both rejected. |
| Scope | Given the marginal dedup share measures 3.9% rather than the issue's ~25%, does S4 stay in, and how far does per-agent filtering reach? | S4 stays, on that corrected figure: measure **and** apply the targeted coverage fix (`provenance_note` as a candidate; stop hashing mixed blocks whole). Per-agent filtering reaches four surfaces — `TraceEvent.aid`, `validateTechniqueFetches`, `get_trace`, `inspect_session` history + usage. "Every read path" rejected on oracle-reconciliation cost. Resource validation: warn **and** fix the addressing bug at source. |
| Success | How will we know each item is done? | Each decision names its own observable: the warning visible in `_meta.validation`; delta rows summable with agent attribution; the bench arm clearing the fresh-mode gate with an honest figure; the agent filter changing what the four fidelity paths return and `validateTechniqueFetches` ceasing to credit a sibling's fetch; the resource warning surfacing and the unresolvable-ref count dropping at source. Recorded as SC-1 … SC-14. |

### Clarifications Made

- **The ~25% figure is not current.** The marginal share available to S4 measured 3.9%, not the issue's ~25% (which predates the block dedup that has since shipped). The stakeholder was told this before deciding, and kept S4 on that basis.
- **S4 is not "never shipped."** Block dedup exists and is tested; the work is measurement plus a coverage fix.
- **`next_activity` has no `usage` parameter.** Three server statements claim it does; `record_usage` is the only recorder. Correcting them is inside S3's boundary.
- **S5's step events need no schema change.** `step_started` / `step_completed` are already declared enum members with zero emission sites — the item is emission and consumption.

### Open Questions Resolved

- **Q9 — S2 warn vs block:** resolved to warn, with auto-declare explicitly rejected.
- **Q10 — block dedup's per-walk share:** still open by design. S4's own `bench:dispatch --gate` arm settles it during implementation; no figure may be quoted before then.

## Confirmation

**Confirmed by:** User
**Date:** 2026-07-31
**Notes:** Six decisions settled one at a time in direct stakeholder interview, each with a recommendation and its rejected alternatives. Residue: RE-4 (cost-estimate price source and consumer), routed to the research activity.
