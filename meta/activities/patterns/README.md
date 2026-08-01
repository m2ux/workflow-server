# Meta Orchestration Pattern Activities

> Part of the [Meta Workflow](../../README.md)

**This directory is the reusable home of mid-phase coordination shapes** — worker fan-out/consolidate and same-context process-unit suites. Techniques endow atomic capabilities those activities bind; they do not own scatter / wait-all / gather. Stance: [Activities Coordinate; Techniques Endow](../../../workflow-design/resources/design-principles.md#2-activities-coordinate-techniques-endow).

They are **not** part of meta's lifecycle graph (`loadActivitiesFromDir` is non-recursive — this subdirectory is library-only).

Session-level orchestrator/worker dispatch remains [`dispatch-activity`](../../techniques/workflow-engine/dispatch-activity.md). These activities cover **in-activity fan-out / consolidate** only.

---

## Apportionment

| Home | Holds |
|------|--------|
| **Pattern activity (this directory)** | Step order, loops, concurrency as structure, wait-all before the next step, bag seeding, completeness gates, and which capability ops run when |
| **Technique** | One capability's inputs → tools/resources → outputs (unit body, pure combine, synthesise over already-gathered results) |
| **Resource** | Shared vocabulary, policy tables, unit-kind maps, templates |

**Placement test:** who-runs-when / how-many / when-merge → activity; how one capability produces its bag → technique; shared names/criteria without runtime order → resource.

---

## Catalog map

| Catalog pattern | Activity | Borrow ref |
|-----------------|----------|------------|
| orchestrator-workers | [orchestrator-workers](./01-orchestrator-workers.yaml) | `meta/patterns/01-orchestrator-workers.yaml` |
| supervisor | [supervisor](./02-supervisor.yaml) | `meta/patterns/02-supervisor.yaml` |
| plan-and-execute | [plan-and-execute](./03-plan-and-execute.yaml) | `meta/patterns/03-plan-and-execute.yaml` |
| subagent-isolation | [isolated-fan-out](./04-isolated-fan-out.yaml) | `meta/patterns/04-isolated-fan-out.yaml` |
| lead-researcher | [lead-researcher](./05-lead-researcher.yaml) | `meta/patterns/05-lead-researcher.yaml` |
| process-unit suite fan-out | [process-unit-fan-out](./06-process-unit-fan-out.yaml) | `meta/patterns/06-process-unit-fan-out.yaml` |
| agent-as-tool-embedding | *(technique only)* bind invoke-as-tool as a **step** | bind in a local activity step |
| hierarchical-agents | *(composition)* `dispatch_child` + borrow a pattern activity in the child | depth-1; no nested Task orchestrators |

Deferred: dynamic-expert-recruitment; inter-agent-communication (MCP / workflow-server tools).

Capability ops those activities bind live under technique groups (e.g. orchestration-patterns, cargo-operations). Indexes catalogue them; pattern activities are the coordination spine.

---

## How to consume

1. **Borrow the activity** into a client `workflow.yaml` `activities:` list (same mechanism as [remediate-vuln](../../../remediate-vuln/workflow.yaml)):

   ```yaml
   activities:
     - meta/patterns/01-orchestrator-workers.yaml
   ```

   Wire your own `transitions` in a thin local wrapper activity when the borrowed file has none, or copy the step pipeline into a local activity and bind the same ops with input overrides.

2. **Re-bind ops** inside a local activity with `{ name, inputs }` deviations when you need different bag names or a non-default dispatch concurrency.

3. **Seed the bag** before the pattern runs (consumer responsibility):

| Variable / input | Used by |
|------------------|---------|
| `work_goal` | agent patterns 01–05 |
| `planning_context` | decompose, plan-steps, plan-research-questions |
| `work_units` | process-unit-fan-out (roster); also agent decompose outputs |
| `dispatch_concurrency` | dispatch / isolated-fan-out / lead-researcher / process-unit-fan-out (default sequential when `1`) |
| `isolation_mode` | isolated-fan-out (`context` \| `worktree`) |
| `effort_cap` | decompose / research planning |
| `lane_roster` | supervisor |
| `synthesis_criteria` | synthesise-results |
| `output_contract` | compose briefs |
| `planning_folder_path` | optional artifact persistence; plan-and-execute checkpoint link |
| `session_index` | optional, when workers must call workflow-server |
| `unit_results` | output of process-unit-fan-out; input to pure-combine steps (e.g. cargo run-suite) |

---

## Anti-pattern traps

- **AP-82** — do not informally merge worker outputs outside gather → synthesise steps.
- **AP-114 / AP-142** — do not fold this pipeline into one technique Protocol Apply chain or name peer techniques from a technique body; keep step binds (or borrow these activities).
- **AP-140** — do not re-teach concurrent shells / wait-all in technique Protocol; coordination stays here.
- **AP-143 `coordination-in-technique`** — do not mint a strategy technique whose Capability is scatter / wait-all / gather; extend or mirror a pattern activity.
- **AP-110** — do not re-teach harness spawn recipes locally when a shared capability op already wraps the surface; bind that op as a step of the activity.

---

## Pattern notes

### 01 Orchestrator Workers

Runtime decomposition → briefs → dispatch → gather → synthesise. Seed `work_goal`, `synthesis_criteria`; set `dispatch_concurrency` > 1 for parallel fan-out.

### 02 Supervisor

Fixed `{lane_roster}` classification (not dynamic decomposition). Escalation when no lane fits (`lane_id: escalate`).

### 03 Plan and Execute

Soft `plan-confirmed` gate (30s default). `forEach` execute; `while` replan when `plan_needs_replan`. Nested re-execute after replan.

### 04 Isolated Fan Out

Same shape as 01 with `isolation_mode` and a validate gate on `gathered_results.completeness` before synthesise.

### 05 Lead Researcher

Research-question planning, parallel dispatch, synthesise, then `while has_research_gaps` follow-up (max 3 rounds).

### 06 Process Unit Fan Out

Same-context process/shell/tool suites (not agent instances). Seed `{work_units}` and `{dispatch_concurrency}` → execute under that bound → wait-all → ordered `{unit_results}`. Consumer binds a pure-combine technique after the spine when a domain envelope is required (e.g. cargo `run-suite`). Fixed-name leaf suites may bind consecutive capability ops and assemble `{unit_results}` from their outputs in roster order.
