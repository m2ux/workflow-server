# Implementation Analysis - Context Fidelity and Observability

> #365 / PR #366 · 2026-07-31 · Complete

## Implementation Review

### Existing Location

| Component | Path | Description |
|-----------|------|-------------|
| Tool layer | `src/tools/workflow-tools.ts` | `next_activity`, `get_activity`, `record_usage`, `inspect_session`, `get_trace`; eager bundling; projections |
| Resource tools | `src/tools/resource-tools.ts` | `get_technique`, `get_resource`; `technique_fetched` / `resource_fetched` writers |
| Delivery ledger | `src/utils/delivery.ts` | `DEDUP_BLOCKS`, `dedupTechniqueBlocks`, content keys, `deliveryScope` |
| Technique projection | `src/loaders/technique-loader.ts` | `projectTechnique` / `projectTechniqueToYaml` (includes `provenance_note`) |
| Provenance decoration | `src/utils/binding-provenance.ts` | Injects byte-identical `provenance_note` on step-bound techniques |
| Validation | `src/utils/validation.ts` | `validateStepManifest`, `validateTechniqueFetches`, `buildValidation` |
| Trace audit | `src/logging.ts` | `appendTraceEvent` → `TraceEvent.aid` from `state.agentId` only |
| Session schema | `src/schema/session.schema.ts` | `deliveredContent`; no artifact-manifest field |
| History enum | `src/schema/state.schema.ts` | Closed enum; `step_started` / `step_completed` declared, unused |
| Dispatch | `src/utils/dispatch.ts` | `dispatchKind` fresh/resume; stale comment on usage-on-`next_activity` |
| Dispatch bench | `scripts/run-dispatch-benchmark.ts` | Resume-vs-fresh `savingPct`; `--gate --min-saving-pct` |
| Token bench | `scripts/run-token-benchmark.ts` | Fresh-mode A0 gate (`evaluateGate`) |
| Oracle fixture | `tests/fixtures/inspect-session/inspect_session.py` | Seven views; no `usage` |
| Parity test | `tests/mcp-server.test.ts` PR215-TC-08 | Hardcoded seven-view loop omits `usage` |
| Block-dedup tests | `tests/reference-delivery.test.ts` | Five cases for existing `DEDUP_BLOCKS` |
| Comprehension | `.engineering/artifacts/comprehension/context-fidelity-observability.md` | Baselines Q1–Q11, corpus resource replay |

Host and worktree `src/utils/delivery.ts` match (122 lines); analysis cites host checkout at the comprehension commit baseline (`092b0c1b` family) unless noted.

### Usage Patterns

**How it is used today:**

- Every activity transition: orchestrator calls `next_activity` with optional `step_manifest` / `activity_manifest` / `variables_changed` — advisory validation only; no artifact parameter.
- Every disposable worker: `get_activity` with `context_tokens` + `agent_id`; full mode default ships `resource_refs` without resolving; reference mode runs resource load loop and silently `continue`s on failure.
- Per dispatch: orchestrator may call `record_usage { activity, usage }` — open `z.record(z.unknown())` payload; no `agent_id`.
- Debugging: `inspect_session { view }` and `get_trace` return unfiltered session-wide projections.
- Ship measurement: manual `npm run bench:token` / `bench:dispatch` (not in CI).

**Call frequency:** Once per activity exit (`next_activity`); once per worker spawn/resume (`get_activity`); N× per multi-worker run for technique/resource tools; optional once per dispatch for usage.

### Dependencies

**Depends On:**

- `src/utils/session/*` — load/save/advance session under planning folder
- `src/loaders/*` — workflow, technique, resource composition
- `src/trace.ts` — `TraceEvent` shape and store
- Python oracle — parity contract for six of eight inspect views

**Depended On By:**

- Orchestrator / worker agents (MCP tool surface)
- `validateTechniqueFetches` via `next_activity` (fidelity consumer)
- Benchmark scripts and `scripts/generate-site-data.ts` (transitive via tool registration)
- Companion #338 W3 (consumes S3 token aggregate later — D-2)

### Architecture

**Existing patterns:** Record-the-claim writers → sparse reducers (delivery ledger, `dispatchKind`) → agent-blind readers. Advisory `_meta.validation` is the only discrepancy channel. Content-keyed ledger; block dedup reference-mode only at call sites.

**Known technical debt:**

- Three statements claim usage arrives on `next_activity` (tool description `:437`, inspect view enum `:1571`, `dispatch.ts` header).
- `session.schema.ts` delivery-ledger namespace list incomplete vs `delivery.ts:17-30`.
- `INSPECT_SESSION_VIEWS` has eight members; parity loop hardcodes seven without `usage`.
- `step_started` / `step_completed` dead enum members.
- Orchestrators improvise `dispatch: "resume-after-checkpoint"` inside opaque usage payloads.

### GitNexus impact (plan symbols)

| Symbol | Risk | Direct callers | Plan note |
|--------|------|----------------|-----------|
| `projectUsage` | CRITICAL (graph) | `projectSessionView` only at d=1 | Real coupling is tool-layer projection + inspect_session; bootstrap fan-out is not edit cost. Extend return shape additively (rows + token aggregate). |
| `dedupTechniqueBlocks` | CRITICAL (graph) | `registerWorkflowTools`, `registerResourceTools` (conf 0.5) | Two call sites inside `if (referenceMode)`. Coverage fix stays in `delivery.ts` + tests; freeze check via benches. |
| `validateTechniqueFetches` | — | `next_activity` + unit tests | Filter on `data.agentId`; no schema change. |
| `appendTraceEvent` | many audit flows | `withAuditLog` | Prefer `params.agent_id ?? state.agentId` for `aid`. |

## Effectiveness Evaluation

### What's Working Well

| Capability | Evidence | Confidence |
|------------|----------|------------|
| Per-dispatch usage *recording* | `record_usage` writes one `activity_usage` row; tests in `mcp-server.test.ts` DI-33 | HIGH |
| Whole-technique reference dedup | Ledger `technique:<id>`; comprehension: 10,781 chars of one repeated technique body in a single payload | HIGH |
| Block dedup for uniform `rules` | `DEDUP_BLOCKS` + tests `reference-delivery.test.ts:751-933`; rules collapse across siblings | HIGH |
| Delivery scoped by `agent_id` | `deliveryScope`; events carry `data.agentId` on fetch/bundle/dispatch | HIGH |
| Artifact *contract* synthesis | `composeActivityArtifacts` → `{id,name}` on `get_activity` / `_meta.artifacts` | HIGH |
| Step enum already declared | `HistoryEventTypeSchema` includes `step_started` / `step_completed` | HIGH |
| Corpus resource failure quantified | 1,273 extractions / 29 unresolvable / 17 `planning-readme#*` (comprehension replay) | HIGH |

### What's Not Working

| Issue | Evidence | Impact |
|-------|----------|--------|
| No produced-artifact reconciliation | Zero `artifacts_produced` hits in `src/`/`tests/`/`scripts/`; `next_activity` accepts no artifact param | HIGH — SC-1/SC-2 gap |
| No usage rollup or agent on rows | `projectUsage` maps 1:1; writes `data: { usage }` only (`workflow-tools.ts:1170`) | HIGH — SC-3–SC-5 |
| Sibling fetch credits | `validateTechniqueFetches` ignores `data.agentId` (`validation.ts:166-172`) | HIGH — live false negative SC-11 |
| Trace `aid` constant per session | `appendTraceEvent` uses `state.agentId` only (`logging.ts:98-100`) | HIGH — SC-10 no-op filter |
| Silent resource skip (reference) | `if (!loaded.success) continue` (`:863`); id not in `resourceRefIds` | HIGH — SC-13 |
| Full-mode resources unvalidated | Loop skipped (`:904-908`); ids pushed unresolved | HIGH — SC-13 common path |
| Wrong workflow on extracted ids | `sourceWorkflowId` from activity, not technique (`:635`/`:861`) | HIGH — SC-14 |
| Dead step events | Zero emission/test refs for `step_started`/`step_completed` | MEDIUM — SC-14 step half |
| Stale usage-on-next_activity docs | Three sites (see architecture debt) | MEDIUM — SC-6 |
| Oracle omits `usage` | PR215-TC-08 literal seven views | MEDIUM — SC-12 untestable without fix |
| Mixed inherited blocks rarely collapse | Whole-block hash of `{note, items}` differs per technique (comprehension + DP-4) | MEDIUM — SC-8 |
| `provenance_note` not in `DEDUP_BLOCKS` | Present on every step-bound technique; identical bytes | MEDIUM — SC-8 |

### Workarounds in Place

- Orchestrator writes free-form `dispatch: "resume-after-checkpoint"` inside `usage` because no first-class agent/dispatch join exists (comprehension live rows).
- Workers re-fetch `meta/planning-readme` with workflow-qualified ids when bare ids fail.
- Operators sum usage rows by hand; no server aggregate.

## Baseline Metrics

| Metric | Current Value | Measurement Method | Date Measured | Maps to |
|--------|--------------|-------------------|---------------|---------|
| Server-side artifact reconciliation | **Absent** (0 code refs to `artifacts_produced`) | ripgrep `src/`, `tests/`, `scripts/` | 2026-07-31 | SC-1, SC-2 |
| Session field for declared manifest accumulation | **Absent** | `SessionFileSchema` inspection | 2026-07-31 | SC-2 |
| `record_usage` optional `agent_id` | **Absent** (params: session, activity, usage) | `workflow-tools.ts:1149-1171` | 2026-07-31 | SC-3 |
| Usage rows with `data.agentId` | **0%** of rows | Schema of write path | 2026-07-31 | SC-3, SC-12 |
| `inspect_session view:usage` shape | **Array of `{activity,timestamp,usage}` only** — no aggregate object | `projectUsage` | 2026-07-31 | SC-4, SC-5 |
| Plain-sum token aggregate field | **Absent** | Same | 2026-07-31 | SC-5 |
| Derived money/cost field | **Absent** (correct for package; D-4) | Same | 2026-07-31 | SC-5 / D-4 |
| Stale "usage on next_activity" statements | **3** | Grep tool descriptions + `dispatch.ts` | 2026-07-31 | SC-6 |
| Ledger namespaces in schema comment vs code | **4 listed / 7 written** | `session.schema.ts:158-159` vs `delivery.ts:17-30` | 2026-07-31 | SC-6 |
| `DEDUP_BLOCKS` members | **3** (`inherited_inputs`, `inherited_outputs`, `rules`) | `delivery.ts:90` | 2026-07-31 | SC-8 |
| `provenance_note` as dedup candidate | **No** | `DEDUP_BLOCKS` + `projectTechnique` | 2026-07-31 | SC-8 |
| Inherited block hash granularity | **Whole block** (`{ [block]: value }`) | `dedupTechniqueBlocks:113` | 2026-07-31 | SC-8 |
| Marginal block-dedup share (one full `get_activity`) | **3.9%** of response (2,718 / 75,991 chars); whole-technique repeat **14.2%** | Byte-exact payload measure (comprehension) | 2026-07-31 | SC-7 baseline *sample* |
| Issue ~25% figure | **Not current** (pre-ship block dedup) | Issue vs shipped `DEDUP_BLOCKS` | — | SC-7 (do not quote as evidence) |
| Per-walk block-dedup share | **Unknown** (Q10 open) | Needs `bench:dispatch` on populated corpus | — | SC-7 |
| `bench:dispatch` `savingPct` meaning | Resume-vs-fresh delivered chars (**not** dedup-isolated); default gate 50% | `run-dispatch-benchmark.ts:170-203` | 2026-07-31 | SC-7 |
| A0 / fresh-mode sensitivity to block coverage | Dedup **inert** in fresh; ledger **writes** mode-independent | Call sites `if (referenceMode)`; writes `:665-667` | 2026-07-31 | SC-9 |
| `TraceEvent.aid` source | **`state.agentId` only** | `logging.ts:98-100` | 2026-07-31 | SC-10 |
| `get_trace` agent filter | **Absent** | Tool schema `:1423-1467` | 2026-07-31 | SC-10 |
| `validateTechniqueFetches` agent scope | **Activity visit only** | `validation.ts:166-172` | 2026-07-31 | SC-11 |
| `inspect_session` agent filter | **Absent** | Tool schema `:1566-1576` | 2026-07-31 | SC-12 |
| Oracle implements `usage` | **No** (`unknown view: usage`) | `inspect_session.py` | 2026-07-31 | SC-12 |
| Parity loop includes `usage` | **No** (7-literal) | `mcp-server.test.ts:2564` | 2026-07-31 | SC-12 |
| Server view count | **8** including `usage` | `INSPECT_SESSION_VIEWS` | 2026-07-31 | SC-12 |
| Unresolvable resource → warning | **Never** (silent skip / unvalidated refs) | `:863`, `:904-908` | 2026-07-31 | SC-13 |
| Corpus unresolvable resource ids | **29** occurrences / **14** distinct ids (17 planning-readme) | Full corpus replay 15 wf / 691 steps | 2026-07-31 | SC-14 |
| `step_started` / `step_completed` emission sites | **0** | Repo-wide string search | 2026-07-31 | S5 step / RE-8 |
| `StepManifestEntry` timestamps | **None** (`{step_id, output}`) | `validation.ts:60-63` | 2026-07-31 | RE-8 |

### Key Findings

1. **Four items, one habit, three mechanisms** on one channel (`_meta.validation` / projections): set-diff (S2), reduction (S3), error-channel + emission (S5). S4 is coverage + measurement on existing reducers.
2. **S2 comparison key is declared `id`**, not filename/path — prefixes, templates, and `presentPathToAgent` make name/path joins unsound (comprehension deep-dive).
3. **SC-5 is token-aggregate sufficiency** — no price table; D-4 owns money. Aggregate = plain sum of documented numeric token fields on DELTA rows.
4. **SC-7 instrument split:** quote before/after delta on the same `bench:dispatch` arm; never treat absolute `savingPct` as pure block-dedup; use dry `bench:token` for SC-9 key-count / char freeze decision.
5. **RE-8 settled in this analysis** (below): hybrid emission — not manifest-only, not a new per-step tool.

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority | SC |
|----|-----|---------------|---------------|--------|----------|-----|
| G1 | No accumulated declared artifact manifest in session | No field; envelope artifacts never reach server | Session field accumulates `{id,name,path?}` across activities; join on **id** | Undeclared files reach commit without server signal | HIGH | SC-1, SC-2 |
| G2 | No planning-folder diff at `next_activity` | Manifests validated for steps only | Diff folder vs accumulated ids; undeclared → `_meta.validation`; unknown declared-out-of-folder; warn-only | Same | HIGH | SC-1 |
| G3 | No `artifacts_produced` (or equivalent) input on `next_activity` | Parameter absent | Accept worker-declared produced set for accumulation | Without it accumulation has no write path | HIGH | SC-1, SC-2 |
| G4 | `record_usage` lacks optional `agent_id` | Three-param tool | Optional `agent_id` → `data.agentId`; omit → unattributed bucket | Cannot attribute or filter usage | HIGH | SC-3, SC-12 |
| G5 | No plain-sum token aggregate on usage view | Row list only | View returns rows **and** token totals (session and optional per-agent filter) | Operators cannot compare runs | HIGH | SC-4, SC-5 |
| G6 | DELTA convention undocumented / improvised resume keys | Opaque usage; free-form `dispatch` key | Document DELTA; prefer `agent_id` over promoting improvised `dispatch` | 78% overstatement risk if cumulative re-posted | HIGH | SC-4 |
| G7 | Stale contract text (usage on next_activity; ledger namespaces) | 3 + incomplete schema comment | Match `record_usage` + `delivery.ts` keys | Reviewer/agent confusion | MEDIUM | SC-6 |
| G8 | Block coverage misses `provenance_note` and mixed note/items | 3-block whole hash | `provenance_note` candidate; hash invariant `note` separate from `items` | Leaves recoverable repeat bytes on wire | MEDIUM | SC-8 |
| G9 | Dedup share unmeasured on walk; ~25% stale | n=1 sample 3.9% marginal | Honest before/after on `bench:dispatch` arm | Ship gate honesty | MEDIUM | SC-7 |
| G10 | A0 freeze decision not run | Assumption only | Dry `bench:token` compare; re-freeze iff metrics move | Avoid false baseline churn | MEDIUM | SC-9 |
| G11 | Trace `aid` not per-call agent | Session agent constant | `params.agent_id ?? state.agentId`; filter on `get_trace` | Multi-worker traces inseparable | HIGH | SC-10 |
| G12 | Fidelity validator agent-blind | Visit-scoped sets only | Scope fetched sets by `data.agentId` matching manifest agent (or call-scoped agent) | Live false negative | HIGH | SC-11 |
| G13 | inspect history/usage unfiltered; oracle gap | No agent param; usage outside parity | Agent filter; extend oracle; derive parity loop from `INSPECT_SESSION_VIEWS` | SC-12 untestable otherwise | HIGH | SC-12 |
| G14 | Unresolvable resources silent / full mode unchecked | continue / skip loop | Warning/event in **both** modes; call still succeeds | Rotten refs invisible until mid-activity throw | HIGH | SC-13 |
| G15 | Extracted resource id loses technique workflow | Bare id under activity workflow | Qualify when technique workflow ≠ delivering workflow | 17/29 failures | HIGH | SC-14 |
| G16 | Step events never emitted | Dead enum members | Hybrid emission (RE-8 decision) | No step timeline | MEDIUM | S5 / RE-8 |

## Opportunities for Improvement

### Quick Wins (Low Effort, High Impact)

1. **Doc corrections (G7):** Three stale usage statements + ledger namespace list — Expected impact: SC-6 green; Effort: small, lands with S3/S4 files.
2. **Derive PR215-TC-08 loop from `INSPECT_SESSION_VIEWS` (G13 half):** Expected impact: makes missing oracle views fail loud; Effort: tiny; prerequisite for SC-12.
3. **Optional `agent_id` on `record_usage` (G4):** Additive write; Expected impact: unlocks SC-3/SC-12 usage half; Effort: small.

### Structural Improvements (Higher Effort)

1. **S2 session manifest + `next_activity` produced-artifacts param + folder diff (G1–G3):** Expected impact: SC-1/SC-2; Effort: medium; warn-only.
2. **`projectUsage` aggregate + agent filter + oracle usage view (G5, G13):** Expected impact: SC-4/SC-5/SC-12; Effort: medium.
3. **Resource qualify + dual-mode validation (G14–G15):** Expected impact: SC-13/SC-14; Effort: medium; corpus replay as gate.
4. **`dedupTechniqueBlocks` coverage redesign (G8):** Expected impact: SC-8; Effort: medium; paired with bench before/after (G9–G10).

### Optimization Opportunities

1. **S4 measurement before further DEDUP expansion:** Measure walk-level share (Q10) so S8 (D-3) can decide; do not expand block set beyond the two named fixes without numbers.

## Internal decision: RE-8 step event emission source

**Status:** Settled at implementation-analysis (not stakeholder-dependent).

| Option | In-flight visibility | Bundled steps | New worker contract | Verdict |
|--------|---------------------|---------------|---------------------|---------|
| A. Derive both from `step_manifest` at `next_activity` | None (single close timestamp) | Covered retrospectively | No | **Rejected** — RE-8 invalidated this |
| B. New `record_step` / per-step tool | Full | Would force pings bundling avoids | Yes | **Rejected** — fights `step_techniques_note` ("do NOT ping the server per bundled step") |
| C. `step_started` only from `technique_fetched`; hole for bundled | Partial | Hole | No | **Rejected as sole design** — bundled steps are the common path |
| **D. Hybrid (chosen)** | Starts staggered where the server already sees step binding; completes at manifest | Covered | No | **Accepted** |

**Chosen contract (D):**

1. **`step_started`** — emit when the server delivers step-bound technique content:
   - On each `technique_bundled` history write (`get_activity`): also append `step_started` with `{ stepId, agentId }` and the same timestamp as the bundle event (delivery time = earliest server-known start).
   - On each `technique_fetched` with `data.stepId` (`get_technique`): also append `step_started` with that step/agent/timestamp.
   - Idempotency: if a step already has `step_started` in the current activity visit for that `agentId`, do not duplicate.
2. **`step_completed`** — emit at `next_activity` when processing `step_manifest`: one `step_completed` per manifest entry with non-empty output, `{ stepId, agentId? }`, timestamp = transition time. Completion is only known when the orchestrator reports the manifest; that is the correct clock for completed.
3. **Consumption:** existing history projections / future filters treat these like other history types; no schema enum change. Optional later: include in milestones — **out of package** unless a test needs it.
4. **Non-goals:** agent begin-beat lines stay client-side only; no requirement that `step_started` equal wall-clock of the `▶ step` line for bundled steps (server cannot observe that without B).

This closes comprehension Q11 and RE-8 for plan-prepare.

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria).

Analysis-derived targets (not restating SC text):

| Target | Gap | Note |
|--------|-----|------|
| Token fields summed for SC-5 | G5 | Sum known numeric keys when present: at minimum `input_tokens`, `output_tokens`, `total_tokens`, and `subagent_tokens` if present; ignore unknown keys; **no** cost field (D-4). Inventory harness keys during implementation (RC-4). |
| RE-8 hybrid emission | G16 | As above |
| Outside-folder declared ids → *unknown* | G1–G2 | Not *missing* |
| Parity loop = `INSPECT_SESSION_VIEWS` | G13 | Structural prerequisite for SC-12 |

### Measurement Strategy

**How will we validate improvements?**

| SC | Validation |
|----|------------|
| SC-1 | Integration test: seed planning folder with declared + undeclared file; declaration writing outside folder → unknown; assert warning names, success, manifest unchanged |
| SC-2 | Two-activity test: declaration at N suppresses warning at N+1 |
| SC-3 | Schema accept with/without `agent_id`; project fixture rows lacking `agentId` |
| SC-4 | N-row fixture: aggregate = arithmetic sum; resume row must not embed prior dispatch tokens (document + test convention) |
| SC-5 | Same fixture: summed token fields present; assert **no** required price/cost field |
| SC-6 | Grep CI or unit assert: three stale phrases gone; namespace list matches `delivery.ts` |
| SC-7 | Two runs same `bench:dispatch` arm pre/post coverage fix; report ΔsavingPct / ΔresumeChars; never quote ~25% as evidence |
| SC-8 | Reference-delivery tests: second technique markers for `provenance_note` and inherited `note`; `items` still full |
| SC-9 | Dry `bench:token` vs A0; re-freeze only if comparison moves |
| SC-10 | Events under `agent_id` have non-null distinct `aid`; filtered `get_trace` ⊂ unfiltered |
| SC-11 | Two-agent regression: A fetches X, B manifests X without fetch → B warned |
| SC-12 | Oracle history+usage agent filter parity; test that view in `INSPECT_SESSION_VIEWS` missing from oracle fails |
| SC-13 | Broken ref in full **and** reference mode → `_meta.validation` warning; response ok |
| SC-14 | Corpus replay 15 wf / 691 steps: unresolvable 29→12; no new unresolvable |
| RE-8 / steps | Unit/integration: bundled path emits `step_started`; manifest path emits `step_completed`; timestamps differ across lazy fetches within one activity when multiple `get_technique` calls occur |

**Comparison methodology:** Prefer fixture sessions and vitest over live multi-hour walks; benches for S4 only; corpus replay for SC-14 with `WORKFLOWS_DIR` pointing at populated superproject checkout.

## Recommended change surface (for plan-prepare)

Ordered for dependency, not effort:

1. **S3 write path** — optional `agent_id` on `record_usage`; DELTA docs; fix three stale statements.
2. **S3 read path** — `projectUsage` token aggregate + optional agent filter; oracle `usage` + history filter; derive parity views from export.
3. **S5 agent dimension** — `appendTraceEvent` aid; `get_trace` filter; `validateTechniqueFetches` agent scope.
4. **S5 resources** — qualify extracted ids; warn both modes.
5. **S5 steps** — hybrid RE-8 emission.
6. **S2** — session accumulated manifest field; `next_activity` accepts produced artifacts; folder diff → warnings.
7. **S4** — `dedupTechniqueBlocks` coverage; reference tests; bench:dispatch before/after; dry bench:token for freeze.

Out of package: D-1 corpus staging, D-2 artifact write, D-3 S8, D-4 price capture, S7/S9.

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| Host `src/` (workflow-tools, delivery, validation, logging, schemas) | Code | Baselines for all SC gaps |
| Comprehension artifact | Deep-dive metrics | 3.9% block share; 29/17 resource failures; oracle hole; RE-8 |
| Requirements SC-1…SC-14 | Spec | Acceptance targets; SC-5 token-only |
| Assumptions log RE-1…RE-8, DP-*, RS-* | Decisions | Closed stakeholder items; RE-8 open→closed here |
| KB research | External | DELTA + plain sum; price deferred D-4 |
| GitNexus context/impact | Graph | `projectUsage` / `dedupTechniqueBlocks` real callers vs CRITICAL bootstrap noise |
| `tests/mcp-server.test.ts` / oracle | Tests | Parity loop omission |
| `scripts/run-dispatch-benchmark.ts` | Bench | savingPct definition |

**Status:** Ready for plan-prepare activity
