# Assumptions Log

> Parallel activities · [#671](https://github.com/m2ux/workflow-server/issues/671) · updated 2026-09-09

## Log

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| DP-1 | Design Philosophy | Problem Interpretation | M | A graph destination is a single activity-id string (or `__terminal__`) — that is the constraint the feature has to lift | Code: [GraphSchema](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/workflow.schema.ts#L51); [validateExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L565) compares `destination` to the sentinel and to known activity ids as a string | Validated |
| DP-2 | Design Philosophy | Complexity Assessment | M | Changing how a destination is represented is not a local edit — [getExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L496) is the meeting point of exits and the graph | Code: four direct callers (`validateReportedExit`, `validateActivityManifest`, `registerWorkflowTools`, `exitDestinations`) and eight affected processes | Validated |
| DP-3 | Design Philosophy | Problem Interpretation | M | The documents indexed from [index.md](index.md) are the design to implement, not a greenfield redesign — the request named that index | — | Open (stakeholder-dependent: whether those documents are complete enough is a judgement, not a code fact) |
| DP-4 | Design Philosophy | Workflow Path | M | Elicitation can be skipped because those documents already state the requirements — the path gate selected research-only; moderate problems otherwise warrant the full path | — | Open (stakeholder-dependent: research or comprehension may still surface gaps elicitation would have caught) |

## Open Assumptions

### DP-3: Specification is the design

**Assumption:** The documents indexed from [index.md](index.md) are the design this work package implements.  
**Decision space:** Treat the specification as canonical and implement it / reopen design where the specification is silent or contradictory / run elicitation to restate requirements. Trade-off: canonical is faster and matches the request; reopening design delays delivery and can drift from settled decisions.  
**Why not code-resolvable:** Completeness of a design document is a judgement. The codebase can show what exists today (DP-1, DP-2); it cannot show whether the specification covers every requirement the user will hold the change to.  
**Technical context:** [GraphSchema](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/workflow.schema.ts#L51) is `z.record(z.record(z.string()))`. [getExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L496) returns one `to` string per exit.  
**Agent's position:** Treat the specification as canonical. The request named that index.  
**Reversibility:** easily-reversible

### DP-4: Skip elicitation

**Assumption:** Elicitation can be skipped because the specification already states the requirements.  
**Decision space:** Honour research-only / restore elicitation if research or comprehension surfaces a requirements gap / take the full path now. Trade-off: skipping elicitation trusts the specification; restoring it costs a later activity if a gap appears.  
**Why not code-resolvable:** Whether a specification is complete enough to skip elicitation is a stakeholder judgement. The path gate already selected research-only; that is the path, not a proof that no gap exists.  
**Technical context:** [Design philosophy](02-design-philosophy.md#workflow-path-decision) records the divergence: moderate problems warrant the full path; research-only was selected.  
**Agent's position:** Honour the gate. Keep elicitation off unless a later activity surfaces a requirements gap.  
**Reversibility:** easily-reversible
