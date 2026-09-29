# Meta Orchestration Pattern Activities

> Part of the [Meta Workflow](../../README.md)

Borrowable mid-phase multi-agent pipelines. This subdirectory is a library: its activities sit outside meta's lifecycle graph.

Session-level orchestrator/worker dispatch remains [`dispatch-activity`](../../techniques/workflow-engine/dispatch-activity.md). These activities cover **in-activity decompose / dispatch / consolidate** only, and they work through their units one at a time inside the calling worker.

Running units together is the graph's layer: bind the exit that reaches the per-unit activity to a destination naming that activity and the collection to run it over, and the run opens one worker per element, each with its own frontier entry, its own container slot and its own identity — see the [fan](../../techniques/fan/TECHNIQUE.md) group and [`scatter-gather`](../../techniques/scatter-gather.md). Reach for a pattern activity when the units are cheap enough to sit in one worker's context, and for the graph fan when each unit is worth a whole delivery of its own.

Atomic ops live under [`orchestration-patterns/`](../../techniques/orchestration-patterns/TECHNIQUE.md). Fan-out primitives remain [`scatter-gather`](../../techniques/scatter-gather.md) and [`harness-compat`](../../techniques/harness-compat/TECHNIQUE.md).

---

## Catalog map

| Catalog pattern | Activity | Borrow ref |
|-----------------|----------|------------|
| orchestrator-workers | *(graph)* a destination naming one activity and the collection to run it over | see the [fan](../../techniques/fan/TECHNIQUE.md) group |
| supervisor | [supervisor](./02-supervisor.yaml) | `meta/patterns/02-supervisor.yaml` |
| plan-and-execute | [plan-and-execute](./03-plan-and-execute.yaml) | `meta/patterns/03-plan-and-execute.yaml` |
| lead-researcher | [lead-researcher](./05-lead-researcher.yaml) | `meta/patterns/05-lead-researcher.yaml` |
| agent-as-tool-embedding | *(technique only)* `orchestration-patterns::invoke-as-tool` | bind in a local activity step |
| hierarchical-agents | *(composition)* `dispatch_child` + borrow a pattern activity in the child | depth-1; no nested Task orchestrators |

Deferred: dynamic-expert-recruitment; inter-agent-communication (MCP / workflow-server tools).

---

## How to consume

1. **Borrow the activity** into a client `workflow.yaml` `activities:` list (same mechanism as [remediate-vuln](/remediate-vuln/workflow.yaml)):

   ```yaml
   activities:
     - meta/patterns/02-supervisor.yaml
   ```

   An activity routes through the `exits` it declares, and the borrower's `graph` binds every one.

2. **Bind your own names.** A technique step takes `{ name, inputs }` deviations and a `kind: routine` step takes its arguments and output bindings at the reference, so a consumer whose bag spells a value differently says so at the site rather than inside the shared run. Read the run's signature off its file under [`meta/routines/`](../../routines/).

3. **Seed the bag** before the pattern runs (consumer responsibility). Each activity's `variables.reads` names what it expects to find there, and its `variables.writes` what it puts back — read them off the `.yaml`.

---

## Anti-pattern traps

- `work-through-activities` — do not informally merge worker outputs outside gather → synthesise steps.
- `pass-orchestration-in-technique` — do not fold this pipeline into one technique Protocol Apply chain; keep step binds (or borrow these activities).
- `duplicate-shared-capability` — do not re-teach `Task` / spawn-concurrent recipes locally; bind these ops or harness-compat.

---

## Pattern notes

### 02 Supervisor

Fixed `{lane_roster}` classification (not dynamic decomposition). Escalation when no lane fits (`lane_id: escalate`).

### 03 Plan and Execute

A person admits the plan into execution, and the plan is revised while execution finds it wrong.

### 05 Lead Researcher

Research questions are planned and answered, and follow-up rounds run while gaps remain. The follow-up loop is what this pattern is for — a fan opens once and cannot re-dispatch after a synthesis. Where a question deserves a context of its own and no follow-up round is needed, fan the questions from the graph instead and keep this for the loop.
