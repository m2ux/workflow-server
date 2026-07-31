# Design Philosophy

> design-philosophy · Context Fidelity and Observability · #365 Server backlog: the live remainder of #337 · 2026-07-31

## Problem Statement

Four follow-through items from the #189 / #232 / #322–#324 epics remain unbuilt in the workflow server's context-fidelity machinery: worker-declared artifacts are never reconciled against the planning folder before that folder is committed wholesale (S2), per-activity token usage is recorded row-by-row but never aggregated or costed because the resumed-worker counting convention was never settled (S3), block-level delivery dedup is unmeasured against the fresh-mode benchmark gate that would show whether it recovers the ~25% of technique-delivery cost attributed to repeated contract/rules boilerplate (S4), and three specified observability pieces — resource validation, step-granularity events, per-agent filtering — were never delivered (S5). The cost is concrete rather than hypothetical: undeclared files already reached an unreviewed commit in the #141 run, run cost stays invisible until a bill arrives, repeated material is paid for on every delivery, and one worker's fetch currently counts as fidelity coverage for a sibling worker's step. Scope is fixed by the user to S2, S3 tail, S4 and S5; S7, S8 and S9 are out of this package.

### System Context

One TypeScript MCP server. The four items land on five coupled surfaces:

| Surface | Files | Relevance |
|---------|-------|-----------|
| Tool layer | `src/tools/workflow-tools.ts` (~1600 lines), `src/tools/resource-tools.ts` | `next_activity`, `get_activity`, `record_usage`, `inspect_session`, `get_trace`; eager bundling and its budget |
| Delivery ledger | `src/utils/delivery.ts`, ledger stored `agentId → key → hash` at `src/schema/session.schema.ts:155-164` | S4's block dedup; the `agent_id` scoping S1 landed |
| Session / state schema | `src/schema/session.schema.ts:57-165`, closed `HistoryEventTypeSchema` enum at `src/schema/state.schema.ts:6-46` | S2 needs a home for an accumulated manifest and has no event type; S5's `step_started` / `step_completed` are already declared in the enum but emitted nowhere |
| Validation layer | `src/utils/validation.ts` — `validateStepManifest:65`, `validateTechniqueFetches:141-187` | The only consumer that reads fidelity events; S2's manifest checks |
| Benchmarks and guards | `scripts/run-token-benchmark.ts`, `run-dispatch-benchmark.ts`, `check-*.ts` + `guards.ts` | S4's measurement gate; existing build-time resource-anchor checking |

Current state per item, established by code inspection:

- **S2** has no server-side implementation whatsoever — `artifacts_produced` returns zero hits across `src/`, `scripts/` and `tests/`. `next_activity` (`workflow-tools.ts:437-609`) accepts `step_manifest` and `activity_manifest` and discards both into advisory warnings (`:467-490`); only `variables_changed` is recorded. Session state has no artifact field. The declared side that a reconciliation would compare against does exist: `composeActivityArtifacts` (`:98-137`) synthesizes the per-activity artifact contract from each step technique's `#### artifact` filenames. The wholesale staging is corpus prose, not server code — `workflows/meta/techniques/workflow-engine/commit-and-persist.md` commits everything under `.engineering/artifacts/`.
- **S3** records one raw history event per `record_usage` call (`workflow-tools.ts:1149-1186`) with `usageSchema` typed as `z.record(z.unknown())`. `projectUsage` (`:256-260`) maps history rows to `{activity, timestamp, usage}` with no rollup, no dedup and no cost math. The stated blocker is now removable: `dispatchKind()` (`src/utils/dispatch.ts`) derives a fresh/resume discriminator, and every delivery event already carries `chars`.
- **S4** is partly shipped. `DEDUP_BLOCKS = ['inherited_inputs', 'inherited_outputs', 'rules']` (`src/utils/delivery.ts:90`) and `dedupTechniqueBlocks` (`:104`) hash each block over a single-key projection so sibling techniques sharing a contract collapse to `technique:<block>:<hash>` markers; five tests cover it at `tests/reference-delivery.test.ts:751-933`. What is missing is the measurement.
- **S5**'s three gaps are each locatable. An unresolvable eager resource is silently dropped at `workflow-tools.ts:860-863` (`if (!loaded.success) continue;`) — no warning into `_meta.validation`, no event, and the id is not even added to `resourceRefIds`, so the worker never learns it existed; the same silent-skip shape sits at `:767` for an unresolvable technique ref. Existence checking exists only as build-time corpus guards (`scripts/check-resource-anchors.ts`, `check-all-refs.ts`), never at delivery. Step granularity needs no schema work: `step_started` and `step_completed` are already declared in `HistoryEventTypeSchema` (`state.schema.ts:10`) and have **zero emission sites and zero test references** across `src/`, `scripts/` and `tests/` — they are dead enum members, so S5's second gap is emission and consumption, not declaration. No read path carries an agent dimension: `get_trace` (`:1423-1467`) returns all events unfiltered even though each `TraceEvent` already carries `aid`; `inspect_session`, `projectHistory` and `projectUsage` have no agent parameter; and `validateTechniqueFetches` does not filter on `data.agentId`.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | **High.** S2 bypasses the review discipline the workflow exists to enforce, and has already failed once in production use. S5's agent-blind `validateTechniqueFetches` is a silent false-negative in the one validation that reads fidelity events — a latent defect, not merely a missing feature. S3 and S4 are Medium-High: cost invisibility and per-delivery waste rather than incorrectness. |
| Scope | Every workflow run. S3 and S4 are paid on every delivery; S2 fires on every activity persist; S5 bites whenever more than one worker is live or a resource ref rots. Objective upstream blast radius (gitnexus): `projectUsage` — CRITICAL, 1 direct caller, 9 affected execution flows, 4 modules; `dedupTechniqueBlocks` — CRITICAL, 2 direct callers, 9 flows, 5 modules. Both reach `scripts/generate-site-data.ts` and three benchmark scripts. |
| Business Impact | Unreviewed content keeps entering the committed record, so the audit trail the workflow produces cannot be trusted. Run cost cannot be budgeted, compared between approaches, or seen to have gone wrong. Repeated boilerplate inflates the price of every task. When something fails, the evidence needed to explain it was never captured. Companion issue #338 W3 stays gated on S3's aggregate. |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Complex

**Rationale:** Nothing is malfunctioning in the sense of a broken function — usage recording, block dedup, event emission and the persist path all work as built. What is absent is reconciliation and rollup that was never built, which puts this on the inventive branch rather than the specific-problem branch. Between improvement and prevention, three of the four items enhance existing working capability (aggregate the rows, measure and widen dedup, sharpen diagnostics), so improvement is the dominant mode; S2 carries a genuine prevention character and S5's agent-blind validation is a latent defect, so the package is not purely additive, but neither shifts the overall classification.

Complexity is Complex on four independent grounds:

1. **Architectural decisions with multiple viable approaches and no locally-correct answer.** S3's cumulative-vs-delta usage convention is a cross-harness contract choice that must be imposed, not discovered. S2's reconciliation site (`next_activity` vs a new tool vs the orchestrator persist hook) and its state home (a new session field vs a new type on a closed enum) are both open. S4's block set is a coverage-versus-benefit trade-off.
2. **Explicit cost/performance requirements with a hard gate.** S4 must be measured against `scripts/run-token-benchmark.ts`'s fresh-mode gate (`evaluateGate` at `:337-358` refuses to pass unless `modeMatched && workflowMatched`; `DEFAULT_MAX_REGRESSION_PCT = 1`) against the frozen `token-benchmark-a0-reference.json` baseline. S3 must produce defensible money figures.
3. **Contradictions between requirements.** Wider dedup shifts what the eager bundler includes, because markers deliberately do not draw down the budget (`workflow-tools.ts:797, 867-873`) — so a dedup gain and bundling behaviour are coupled, not independent. And a summable usage convention has to be imposed precisely because harnesses genuinely disagree.
4. **The objective signal exceeds the issue's own sizing.** The issue sizes S3 as "S", yet both target symbols measure CRITICAL with 9 affected execution flows each. No item is locally contained.

Additionally, four largely independent items require sequencing and a multi-task plan, and one of the issue's own premises needs correcting before planning inherits it (see Notes).

## Workflow Path Decision

**Selected Path:** Full workflow

**Activities Included:**
- [x] Requirements Elicitation
- [x] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Complex maps to the full path, and both optional activities are independently justified. Elicitation is needed despite the scope being fixed by the user, because per-item success criteria remain genuinely open: what the server should do on finding undeclared files (warn, block, or auto-declare), which usage convention to impose and which cost model and prices to apply, which blocks join `DEDUP_BLOCKS`, and how far per-agent filtering should reach across the read paths. Research is needed because the resumed-worker convention has real external precedent worth consulting — how provider APIs and agent harnesses actually report usage across resumed and streamed turns — and the cost estimate needs current model pricing; neither is answerable from this codebase. Codebase comprehension is mandatory on every path and is independently warranted here, since the four items sit on five coupled surfaces whose upstream impact measures CRITICAL. Complexity `complex` also scopes the later design-framework application to its full set: problem definition, classification, conventional solutions, inventive solutions, synthesis.

Confirmed at the `classification-and-path-confirmed` checkpoint (option `full-workflow`).

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | None stated. Effort is agentic development time plus separate human review; the issue sizes the four in-scope items S–M. |
| Technical | No breaking schema change in this package — that is S7's job and S7 is explicitly excluded and required to stay on an isolated branch. `HistoryEventTypeSchema` (`src/schema/state.schema.ts:6-46`) is a closed enum, so a genuinely new event type is a deliberate schema addition — which S2 would need (no artifact event type exists) but S5's step events would not (`step_started` / `step_completed` are already declared). `inspect_session` is parity-tested against a Python oracle fixture (`tests/fixtures/inspect-session/inspect_session.py`) that implements no `usage` view, so extending that view means extending the oracle deliberately. S4's measurement must include a fresh-mode arm; a persistent-only comparison is not a valid ship gate (`docs/development.md:205-256`). |
| Dependencies | The workflow corpus is a separate git submodule (`workflows/`, empty in this worktree, populated at the superproject), so `artifacts_produced` is currently defined only in corpus prose (`finalize-activity.md`) and not in server code — S2 spans both halves. Companion issue #338 W3 consumes S3's aggregate. Benchmarks are manual (`npm run bench:token`, `bench:dispatch`) and absent from `.github/workflows/verify.yml`. |
| Resources | Delivery on branch `feat/365-context-fidelity-observability` in the worktree at `.worktrees/2026-07-30-issue-365-context-fidelity-observability`; PR #366 is already open. The `workflow-canon` skill must be applied to any workflow-definition edit (user request). |

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria) once elicited.

## Notes

Two premises must not be inherited from the issue text as written:

1. **S4 is not "never shipped".** Block-level dedup already exists and is tested — `DEDUP_BLOCKS` at `src/utils/delivery.ts:90` with five cases at `tests/reference-delivery.test.ts:751-933`. The remaining work is the fresh-mode measurement that proves what share of technique-delivery cost is actually recovered, plus any extension of block coverage that measurement justifies — not a build from zero. Planning should size S4 accordingly.
2. **`next_activity` has no `usage` parameter.** Its own tool description (`workflow-tools.ts:437`), `inspect_session`'s view-enum description (`:1571`) and the header comment in `src/utils/dispatch.ts:6-8` all state that usage arrives on `next_activity`. It does not; `record_usage` is the only recorder. These three stale statements should be corrected as part of S3 so the contract and its documentation agree.

3. **S5's step-granularity gap needs no schema change.** `step_started` and `step_completed` are already members of `HistoryEventTypeSchema` (`state.schema.ts:10`) with zero emission sites and zero test references anywhere in the repo. The item is to emit and consume them, not to declare them — so the "step events" checkbox is smaller than it reads, while the per-agent-filtering checkbox is the one carrying a latent defect (`validateTechniqueFetches` not filtering `data.agentId`).

A further documentation drift found during inspection: `src/schema/session.schema.ts:158-159` lists the delivery-ledger key namespaces as `bundle:<technique-ref>`, `bundle:rules`, `activity_rules`, `technique:<technique-id>`, omitting the content-hash suffixes and the `technique:<block>:<hash>`, `workflow_bundle:<hash>` and `resource:<id>` channels that `src/utils/delivery.ts:17-30` documents and the code actually writes. Natural to fix alongside S4.

Root-cause observation for later phases: these are not four unrelated gaps. The server records claims and magnitudes but never reconciles or aggregates them — it trusts self-reported manifests, stores per-event rows without a rollup, and treats a resolution failure as a skip rather than a finding. S2, S3 and S5's resource-validation gap are three faces of one missing habit, which may admit a shared approach at plan time.
