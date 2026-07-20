# Meta Orchestration Pattern Activities

> Part of the [Meta Workflow](../../README.md)

Borrowable mid-phase multi-agent pipelines. They are **not** part of meta's lifecycle graph (`loadActivitiesFromDir` is non-recursive — this subdirectory is library-only).

Session-level orchestrator/worker dispatch remains [`dispatch-activity`](../../techniques/workflow-engine/dispatch-activity.md). These activities cover **in-activity fan-out / consolidate** only.

Atomic ops live under [`orchestration-patterns/`](../../techniques/orchestration-patterns/TECHNIQUE.md). Fan-out primitives remain [`scatter-gather`](../../techniques/scatter-gather.md) and [`harness-compat`](../../techniques/harness-compat/TECHNIQUE.md).

---

## Catalog map

| Catalog pattern | Activity | Borrow ref |
|-----------------|----------|------------|
| orchestrator-workers | [orchestrator-workers](./01-orchestrator-workers.yaml) | `meta/patterns/01-orchestrator-workers.yaml` |
| supervisor | [supervisor](./02-supervisor.yaml) | `meta/patterns/02-supervisor.yaml` |
| plan-and-execute | [plan-and-execute](./03-plan-and-execute.yaml) | `meta/patterns/03-plan-and-execute.yaml` |
| subagent-isolation | [isolated-fan-out](./04-isolated-fan-out.yaml) | `meta/patterns/04-isolated-fan-out.yaml` |
| lead-researcher | [lead-researcher](./05-lead-researcher.yaml) | `meta/patterns/05-lead-researcher.yaml` |
| agent-as-tool-embedding | *(technique only)* `orchestration-patterns::invoke-as-tool` | bind in a local activity step |
| hierarchical-agents | *(composition)* `dispatch_child` + borrow a pattern activity in the child | depth-1; no nested Task orchestrators |

Deferred: dynamic-expert-recruitment; inter-agent-communication (MCP / workflow-server tools).

---

## How to consume

1. **Borrow the activity** into a client `workflow.yaml` `activities:` list (same mechanism as [remediate-vuln](../../../remediate-vuln/workflow.yaml)):

   ```yaml
   activities:
     - meta/patterns/01-orchestrator-workers.yaml
   ```

   Wire your own `transitions` in a thin local wrapper activity when the borrowed file has none, or copy the step pipeline into a local activity and bind the same ops with input overrides.

2. **Re-bind ops** inside a local activity with `{ name, inputs }` deviations when you need different bag names or concurrency defaults.

3. **Seed the bag** before the pattern runs (consumer responsibility):

| Variable / input | Used by |
|------------------|---------|
| `goal` | all patterns |
| `context` | decompose, plan-steps, plan-research-questions |
| `concurrency` | dispatch / isolated-fan-out / lead-researcher (default `1` on ops) |
| `isolation_mode` | isolated-fan-out (`context` \| `worktree`) |
| `effort_cap` | decompose / research planning |
| `lane_roster` | supervisor |
| `synthesis_criteria` | synthesise-results |
| `output_contract` | compose briefs |
| `planning_folder_path` | optional artifact persistence; plan-and-execute checkpoint link |
| `session_index` | optional, when workers must call workflow-server |

---

## Anti-pattern traps

- **AP-82** — do not informally merge worker outputs outside gather → synthesise steps.
- **AP-114** — do not fold this pipeline into one technique Protocol Apply chain; keep step binds (or borrow these activities).
- **AP-110** — do not re-teach `Task` / spawn-concurrent recipes locally; bind these ops or harness-compat.

---

## Pattern notes

### 01 Orchestrator Workers

Runtime decomposition → briefs → dispatch → gather → synthesise. Seed `goal`, `synthesis_criteria`; set `concurrency` > 1 for parallel fan-out.

### 02 Supervisor

Fixed `{lane_roster}` classification (not dynamic decomposition). Escalation when no lane fits (`lane_id: escalate`).

### 03 Plan and Execute

Soft `plan-confirmed` gate (30s default). `forEach` execute; `while` replan when `plan_needs_replan`. Nested re-execute after replan.

### 04 Isolated Fan Out

Same shape as 01 with `isolation_mode` and a validate gate on `gathered_results.completeness` before synthesise.

### 05 Lead Researcher

Research-question planning, parallel dispatch, synthesise, then `while has_research_gaps` follow-up (max 3 rounds).
