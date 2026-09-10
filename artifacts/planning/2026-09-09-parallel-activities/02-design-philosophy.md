# Design Philosophy

> design-philosophy · Parallel activities · [#671](https://github.com/m2ux/workflow-server/issues/671) Parallel activities: a graph destination can name only one next activity · 2026-09-09

## Problem Statement

A graph destination names exactly one next activity, or the run's end. Independent work that shares no inputs therefore occupies the walk one after another, and repeating an activity over a collection happens inside a single worker. The cost is wall-clock time and visibility: a fan that could finish when the last branch returns waits in a line, and a session in flight shows one next step rather than a set of open branches.

### System Context

The MCP server walks Goal → Workflow → Activities → Techniques → Tools. An activity names outcomes; the [graph](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/workflow.schema.ts#L51) names where each leads; a worker is dispatched per activity; the session record holds the walk position. [getExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L496) is where those two halves meet. Server code lives on `main`; workflow definitions on the `workflows` branch. The design to implement is the [specification](README.md) indexed from [index.md](index.md).

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High |
| Scope | Every workflow whose independent analyses or per-item repeats currently run in series |
| Business Impact | Independent work stays serial; a fan in flight looks like a stall |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

**Rationale:** Classification-confirmed accepted inventive-improvement: nothing currently fails; the graph already routes, and the work adds a destination form that names several branches. The workflow-path gate set complexity to moderate as part of research-only. Classify had assessed complex because the specification names architectural decisions (destination form, derived join, frontier, branch keys, output isolation) and coupled changes across schema, session record, dispatch, guards, and observability. [getExitBindings](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/loaders/workflow-loader.ts#L496) has four direct callers and eight affected processes, so the routing change is not a local edit. That fan-out is why comprehension and research remain; it does not reopen elicitation.

## Workflow Path Decision

**Selected Path:** Research only

**Activities Included:**
- [ ] Requirements Elicitation
- [x] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Research-only. Moderate problems warrant the full path; this selection diverges because the [specification](README.md), [delivery plan](delivery-plan.md), smoke-test plan, and supersession documents already state the requirements. Research remains so conventional solutions and prior art get a pass before planning. At moderate, the design framework warrants problem definition, classification, conventional solutions, and synthesis. Comprehension precedes planning on every path.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Unfilled in the issue record |
| Technical | No backward-compatibility layers. A graph destination is a single activity-id string today ([GraphSchema](https://github.com/m2ux/workflow-server/blob/d54f3562f2781e63201d17b0423de5e8b1ff08fa/src/schema/workflow.schema.ts#L51)) |
| Dependencies | [Specification](README.md), [delivery plan](delivery-plan.md), smoke-test plan, supersession |
| Resources | Worktree `.worktrees/2026-09-09-parallel-activities` on `feat/671-parallel-activities-a-graph-destination`; [PR #672](https://github.com/m2ux/workflow-server/pull/672) |

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| A destination may name several branches | Schema and load accept a list of members, or one activity once per collection element | Legal forms in the permutation matrix pass; illegal forms refuse |
| Each branch runs in its own worker | Session frontier holds one entry per open branch | A fan in flight is a set of branches, not one next step |
| The walk continues from one join after the last branch returns | The join activity is entered once | Entering the join early is unrepresentable |
