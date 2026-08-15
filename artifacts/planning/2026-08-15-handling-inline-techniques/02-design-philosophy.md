# Design Philosophy

> design-philosophy · Handling Inline Techniques · [#397](https://github.com/m2ux/workflow-server/issues/397) [Epic] Protocol Structure: Alternatives and Delegation the Server Can See · 2026-08-15

## Problem Statement

A technique file calls another technique from inside its own Protocol prose, and the server treats that sentence as ordinary text: nothing resolves the reference, nothing checks its arguments against the callee's declared inputs, and the callee's body never arrives with the caller. A 2026-08-02 survey of 554 technique files found 118 such call edges, 99 of them (84%) invisible to the activity layer and 56 passing fewer arguments than the technique they call declares. A whole class of instruction therefore goes unchecked — callers drift out of step silently when a callee is renamed or changes what it needs, and a step whose technique cannot be loaded cannot be executed as written. This work package settles how those calls are handled and carries the answer into the guards, the loader, and the design canon together.

### System Context

The composition pipeline runs parse → compose → deliver across `markdown-technique-loader.ts`, `technique-loader.ts` and `fragment-resolver.ts`. Its only body rewrite is resource links, so an inline technique reference passes through verbatim to the agent. No guard reaches it either: `check-all-refs` reads `techniques[]` lists, `check-binding-fidelity` reads activity step binds, and `check-resource-anchors` requires a `#anchor` that the canonical call form never carries. Around ten hand-maintained entries in `core-ops.ts` stand in for the missing delivery, with nothing keeping them aligned with the prose they mirror.

Two written authorities disagree about the construct with no mechanical enforcement behind either. The design canon forbids technique-to-technique work calls in three homes (AP-114, §25 Bind Sibling Operations as Steps, §26 Atomic Techniques; Compose at Activities), hardened further by AP-142/143. The addressing specification fully defines the call syntax and sanctions it (§3.5, §4.1, §4.2). The schema has no formal construct for the edge at any layer, which is why no layer owns it.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High — platform correctness and maintainability; no end-user-facing surface |
| Scope | 554 technique files across 16 workflows; 118 call edges; the composition pipeline, three guards, the design canon, and the addressing specification |
| Business Impact | Silent contract drift with live instances already in the corpus — a dropped `client_session_index`, a `{state}`→`substitutions` rename, and restated callee procedure that no longer matches its source. Where a reference resolves to nothing, the agent either skips the step or improvises, and nothing in the run records which happened. Under progressive step-technique load the fetch is the only delivery path for a step outside the eager bundle, so that failure is silent by construction. |

## Problem Classification

**Type:** Specific Problem

**Subtype:**
- [x] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [ ] Improvement goal
- [ ] Prevention goal

**Complexity:** Complex

**Rationale:** Something is failing now, with named instances rather than inference — three malformed rule-addressed-as-operation call sites, 56 call sites underspecified against their callee's declared contract, and references that no delivery path serves at all. The cause is known and traced end to end: the loader rewrites resource links and nothing else, so the reference survives as prose past every layer that could have owned it. That places this at cause-known rather than cause-unknown, and the remedy is a direct fix rather than an investigation.

Complexity is complex on four independent counts. A construct that does not exist yet must be added across schema, loader and guard together. Several approaches are viable with real trade-offs between them, recorded as twenty-five decisions across seven review rounds in the [doctrine decision record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-02-protocol-structure-consolidation/doctrine-decision.md). The canon and the specification contradict each other and must be reconciled in one pass. And 118 corpus edges need dispositioning behind the change.

A call-graph impact analysis over the composition path corroborates the assessment: upstream impact on `resolveTechniques` is critical — 3 direct callers, 11 affected execution flows, 4 modules — reaching both delivery doors (`composeActivityArtifacts` and `registerWorkflowTools`), the `check-all-refs` guard that would enforce the new rule, and three benchmark and smoke harnesses.

## Workflow Path Decision

**Selected Path:** Full workflow

**Activities Included:**
- [x] Requirements Elicitation
- [x] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Elicitation is load-bearing. The hoist-to-activity-level versus canonical-inline-mechanism question the request poses already has a recorded answer — the visibility rule, which resolves it as neither alone: a technique may call another when the outcome stays inside the caller's own work, and the call becomes an activity step the moment the workflow itself acts on the outcome. Whether this package executes that decision or reopens it is a stakeholder call, as is which work items land here; #397 carries W0, W1, W2, W3a, dormant W3b, W4 and the migration batches, and this package is not all of them.

Research is partly redundant against what already exists: both corpus surveys are fresh against the same head and reproducible by script, the pipeline trace inventories the reusable machinery (roughly 80% of it already in the server, pointed at resources), and the alternatives a knowledge-base pass would surface were explored and rejected with rationale in the doctrine record. It is included nonetheless, because the lighter path records this problem as moderate rather than complex, and complexity governs how much of the design framework `plan-prepare` applies. For a change spanning schema, loader and guards, with a 118-edge migration behind it and critical impact on the composition path, under-applying the framework is the worse error of the two. Research therefore corroborates the settled ground and probes for what the seven review rounds missed; it does not re-derive them. A nil finding is stated plainly and briefly rather than padded.

Codebase comprehension is mandatory on every path and carries the real cost here, the change landing on a critical-fan-out composition path.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Both surveys are reproducible by script and the doctrine was settled with the inventory in hand, but their freshness has begun to decay and the decay is measured — see [DP-8](02-assumptions-log.md#log). A stale survey turns a mechanical pre-sort back into a manual audit of the full edge set, so the inventory is re-run before disposition rather than carried forward. |
| Technical | The canonical prose call form stays the declaration site, so 554 files load with unchanged meaning and the change carries no corpus migration of its own. Delivery cost stays inside the existing bundling budget. The engine layer — `workflow-engine`, `agent-conduct`, `harness-compat` — is excluded as a fold target from product techniques. Canon and specification amend with delivery rather than ahead of it, so the canon describes the running platform at every commit. |
| Dependencies | W0 — cross-workflow container ancestry, the subsumed #405 — lands before delivery. The section-delivery epic's first item (#398 W1) builds the shared slug computation for the anchored half of the same reference surface; whichever of the two lands second builds on the first's module rather than beside it. |
| Resources | Agentic development time plus separate human review. The 118-edge disposition is worked off a worklist across migration batches rather than in a single pass. |

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria) once elicited.

## Notes

- Scope within the epic is open and is fixed at requirements elicitation, along with whether this package executes the recorded doctrine or reopens it.
- Three delivery failures are available as regression cases for whatever check lands, one per class. A step-bound reference the loader does not serve: `update-pr::verify-body`, referenced by a `work-package` step and not returned by `get_technique { step_id }`. Mid-protocol references with no step to address them by: `dispatch-activity`'s calls to `sync-progress-status`, `compose-prompt` and `harness-compat::spawn-agent`, none of the three retrievable by any route. And a callee named by a value rather than a link: this activity's own analysis loop binds `analyse_technique` to `review-assumptions::reconcile` and directs the agent to invoke the bound technique, which no delivery path resolves — the value-named class the epic identifies as beyond static reach, exercised in `work-package` rather than hypothetical.
