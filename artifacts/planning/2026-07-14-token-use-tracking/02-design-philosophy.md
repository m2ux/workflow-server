# Design Philosophy

> design-philosophy · Token Use Tracking and Cost Estimation · #232 Add per-activity and per-workflow token use tracking and cost estimation · 2026-07-14

## Problem Statement

The workflow-server keeps no record of the LLM tokens consumed while an agent executes a workflow, nor of the resulting monetary cost. Usage cannot be attributed to individual activities or totalled per workflow, so expensive activities cannot be identified, run efficiency cannot be compared, and a completed work package carries no usage or cost record. This matters because every workflow run has a real cost that is currently invisible once the work is done.

### System Context

The workflow-server is an MCP server that agents (orchestrators and disposable workers) drive by calling its tools (`get_activity`, `next_activity`, `dispatch_child`, etc.). Session state persists to `session.json` under each work package's planning folder, carrying a `variables` bag, `completedActivities[]`, and an append-only `history[]` event log with `activity_entered` / `activity_exited` pairs. The server observes only tool calls — it has no direct view of the LLM tokens the calling agent consumes. Activity completion flows through the worker's `activity_complete` envelope and the control-plane `next_activity` call; workflow completion is marked when the terminal activity runs. Planning artifacts (including the folder `README.md`) are the durable per-work-package record.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium |
| Scope | Workflow operators and work-package stakeholders; every session that runs through the server |
| Business Impact | Workflow-run cost stays invisible — no way to attribute spend to activities, compare run efficiency, or leave a durable cost record with a completed work package |

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Complex

**Rationale:** Nothing is broken — the server works. This adds a new observability and accountability capability, so it is an inventive improvement goal, not a fix. It is complex because it carries a genuine architectural unknown and is cross-cutting. The unknown: the server only observes tool calls and holds no token/usage/cost concept today (confirmed in `src/schema/session.schema.ts` and `src/schema/state.schema.ts`), so "use the model's native capabilities" hinges on an unresolved question — how do the harness/model's native usage figures reach a server that never sees the agent's LLM token counts? Candidate channels (agent-reported usage on a tool call, an out-of-band harness feed, or server-side re-tokenization) carry different trade-offs. Cost estimation additionally needs a per-model pricing model that must be sourced, kept current, and degrade gracefully for unknown models. The change spans the session schema (new persisted usage records and history events), the tool-call contract (a channel to receive usage), aggregation logic (per-activity → per-workflow), and artifact writing on completion.

## Workflow Path Decision

**Selected Path:** Full workflow

**Activities Included:**
- [x] Requirements Elicitation
- [x] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** Selected by the user at the classification-and-path-confirmed checkpoint. The native-usage-sourcing unknown warrants research (how model harnesses expose usage metadata to an MCP server, and conventional cost-model designs), and elicitation to pin down where results are logged (dedicated artifact vs. README section) and how cost should be presented. Codebase comprehension is mandatory on every path.

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | None stated on the ticket |
| Technical | Measurement should use the model's / harness's native usage-reporting capabilities where possible, rather than heuristic estimation; the server sees only tool calls, so it cannot self-measure agent token use |
| Dependencies | A per-model pricing source for cost estimation; whatever native usage channel the harness exposes |
| Resources | Single-run tracking only — cross-session/fleet analytics and budget enforcement are out of scope |

## Success Criteria

Success criteria: [requirements](requirements-elicitation.md#success-criteria) once elicited.

## Notes

Open questions carried forward to research and elicitation:
- How does the calling harness surface native token-usage figures to an MCP server that only receives tool calls? (Primary architectural unknown.)
- Where do results land on completion — a dedicated usage/cost artifact, or a section of the planning `README.md`?
- What pricing source drives cost estimation, and how is an unknown model handled?
