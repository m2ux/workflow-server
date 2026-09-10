---
name: schema-construct-inventory
description: Maps informal patterns (what agents tend to write as prose) to their formal schema equivalents.
metadata:
  order: 1
  legacy_id: 1
---

# Schema Construct Inventory

## Universal obligation

Maps informal patterns (what agents tend to write as prose) to their formal schema equivalents. Every piece of prose must be checked against this inventory — if a formal construct exists, it must be used. Schema Expressiveness anti-patterns sharpen the same concern for catalog audits.

**Authoritative schema sources:**

| Schema | Path | Documentation |
|--------|------|---------------|
| Workflow | `schemas/workflow.schema.json` | `schemas/README.md — Workflow Schema` |
| Activity | `schemas/activity.schema.json` | `schemas/README.md — Activity Schema` |
| Technique | `schemas/technique.schema.json` | `schemas/README.md — Technique Schema` |
| Condition | `schemas/condition.schema.json` | `schemas/README.md — Condition Schema` |
| State | `schemas/state.schema.json` | `schemas/README.md — State Schema` |

URI `workflow-server://schemas` aggregates the schemas listed above. Full ontology, field tables, examples, and validation guidance: `schemas/README.md`.

---

## Activity-Level Constructs (activity.schema.json)

An activity has a **single ordered `steps[]`** in which every step carries a required `kind` discriminator (`technique` / `action` / `checkpoint` / `loop`). Checkpoints and loops are step KINDS at their concrete position in the sequence, not separate parallel arrays. `exits[]` is activity-level — the outcomes the orchestrator resolves at the activity boundary, not steps. An exit names the outcome and nothing else: which activity follows it is bound in the workflow's `graph`, so no activity file names another activity.

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "Do X, then do Y, then do Z" | **Technique step** | `steps[]` entry with `kind: technique`, `.id`, `.technique` (a `group::operation` string, or `{ name, inputs?, outputs? }` for input/output deviations), optional `.actions` — pure binding: no `description` / `name` / `note` (`procedure-in-protocol`, `bound-step-no-description`). One operation per step; split compounds (`no-monolith-masking-steps`). |
| "Compose / chain techniques for work" / "Apply technique B from inside technique A" | **Activity technique steps** (not Protocol Apply) | Consecutive `steps[]` entries with `kind: technique`, each binding one op; activities (and checkpoints/loops) are the composition layer. Technique Protocols stay atomic produce paths over tools and resources — they do not `Apply` / `::`-invoke other techniques for work (`pass-orchestration-in-technique`, [Atomic Techniques; Compose at Activities](./design-principles.md#26-atomic-techniques-compose-at-activities)). |
| "Compose / reuse activities" / "borrow an activity for a shared orchestration pattern" | **Activity→activity composition** | Borrow, bind, or include a standalone activity (or activity pattern) for reusable orchestration — allowed under [Atomic Techniques; Compose at Activities](./design-principles.md#26-atomic-techniques-compose-at-activities). Distinct from technique→technique Apply. Cross-workflow string refs (e.g. `work-package/08-implement.yaml`, `meta/patterns/02-supervisor.yaml`) resolve via the loader; meta pattern activities live under `meta/activities/patterns/` (subdirectory — not part of meta's lifecycle graph). |
| "orchestrator-workers / fan-out then consolidate" (mid-phase) | **Graph, an instance fan** | Three graph nodes: the activity that emits the work units, the activity to run once per unit, and the one they converge on. Bind `orchestration-patterns::decompose-work-units` at the source — its id-and-brief records are a fan's collection by construction — and `gather-results` at the meeting point, with the fan's own collection as `expected_ids`. Work units inside ONE worker are the other grain: a `forEach` loop step over the same collection, which pays one delivery rather than N. |
| "supervisor / fixed specialist lanes" | **Borrow supervisor pattern** | Borrow [`meta/patterns/02-supervisor.yaml`](../../meta/activities/patterns/02-supervisor.yaml) or bind `orchestration-patterns::classify-request` → compose → dispatch → gather → synthesise; seed `{lane_roster}`. |
| "plan-and-execute" | **Borrow plan-and-execute pattern** | Borrow [`meta/patterns/03-plan-and-execute.yaml`](../../meta/activities/patterns/03-plan-and-execute.yaml) or bind `orchestration-patterns::plan-steps` / `execute-plan-step` / `replan` with forEach + while. |
| "subagent-isolation / workers with their own workspace" | **Child session per unit** | A worker shares its caller's workspace, and a graph fan's branches share one working tree and one git index — so neither route gives a unit a checkout of its own, and the load refuses a fanned activity binding any version-control operation. Where a unit must mutate its own workspace, dispatch it as a child session through `handle-sub-workflow` / `dispatch_child`. Where it mutates no checkout, fan it from the graph and let the branches share the tree. |
| "lead-researcher / research rounds until the gaps close" | **Borrow lead-researcher pattern** | Borrow [`meta/patterns/05-lead-researcher.yaml`](../../meta/activities/patterns/05-lead-researcher.yaml) or bind `plan-research-questions` → dispatch → synthesise → `assess-research-gaps` while loop. The loop is what the pattern is for; a fan opens once and cannot re-dispatch after a synthesis. A single round whose questions each deserve their own context is a graph instance fan over the questions. |
| "agent as tool / opaque sub-agent call" | **Technique bind** | Bind `orchestration-patterns::invoke-as-tool` as a step; parent bag receives `{tool_result}` only. |
| "hierarchical agents / manager tree" | **Child workflow composition** | `dispatch_child` / `workflow-engine::handle-sub-workflow` plus borrow a pattern activity inside the child. Harness depth-1 forbids nested Task orchestrators ([harness-compat::spawn-agent](../../meta/techniques/harness-compat/spawn-agent.md)). |
| "When entering/finishing, log/validate/set" | **Action step** | `steps[]` entry with `kind: action`, `.id`, `.actions[]` (`log`/`validate`/`set`/`emit`/`message`); a leading/trailing control step carries lifecycle actions at the start/end of the sequence (`actions[]` may be empty for a marker step). Pure action/control/checkpoint/loop steps need no `technique` binding. |
| "Ask the user whether to proceed" | **Checkpoint step** | `steps[]` entry with `kind: checkpoint`, a stable `.id`, `.message` (statement of the subject — no `?` / confirm-imperative / next-step narration / caption of the prior technique; embed `[label]({path})` for any durable artifact — same link rule applies to action `message` fields; `link-named-artifacts`, `no-caption-only-message`), `.options[]` with `.effect` (the decision space), and `.defaultOption` plus `.autoAdvanceMs` together where the gate is soft (declare both or neither); its POSITION in `steps[]` is when it is presented (present-then-checkpoint: place it immediately after the step whose output it confirms). See `link-named-artifacts`, `no-next-step-narration`, `statement-not-question`, `no-caption-only-message`. |
| "Repeat for each item" / "do until done" | **Loop step** | `steps[]` entry with `kind: loop`, `.id`, `.loopType` (forEach/while/doWhile), `.variable`, `.over`, `.condition`, `.breakCondition`, `.maxIterations`, optional `.name`; its body is a nested `.steps[]` |
| "If X then do A, otherwise do B" (automated) / "Then move on to the next phase" | **Exit** (activity-level) + **graph binding** (workflow-level) | `exits[].id` (the outcome, in the activity's vocabulary), `.when` (the inline predicate selecting it), `.isDefault` (exactly one once there are two or more), `.immediate` (ends the sequence where a checkpoint option selects it); the destination is `graph.<activity>.<exit>` in the workflow file |
| "This triggers the X workflow" | **Trigger** | `triggers.workflow`, `.description`, `.passContext` |
| "This produces a report file" | **Technique output artifact** (activity `artifacts[]` is SERVER-COMPUTED, never authored) | declare a `#### artifact` on the producing technique's `## Outputs`, one filename per output — one path segment with an extension, `{token}` placeholders allowed, rejected at load otherwise (`artifact-name-is-filename`); `get_activity` synthesizes the activity's artifact contract from its steps' bound techniques (`no-hand-authored-artifacts`) |
| "The expected result is X" | **Outcome** | `outcome[]` (string array) |
| "Only run when X is true" | **Step gate** | `steps[].when` / `steps[].condition` (references condition.schema.json) — a shared base field on every step kind |
| "The agent must follow these constraints" | **Activity rules** | `rules[]` (string array) |
| "This activity needs X and produces Y" | **Variable contract** | `variables.reads[]` (names it consults: gates, routing, loop collections, prose, and bound-operation inputs it does not supply itself) and `variables.writes[]` (full declarations for what it puts in the bag — operation outputs, remap targets, checkpoint `setVariable` keys, `set` targets, loop items). A write declaration is contributed to every workflow whose graph includes the activity, so the declaration lives with the activity rather than with each including workflow; two declarations of one name that disagree on `type` or `defaultValue` fail the load (`check:activity-variables`). |

## Workflow-Level Constructs (workflow.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "The session starts with X" / "this policy holds all run" | **Workflow variable** | `variables[].name`, `.type`, `.description`, `.defaultValue` — the file's own declarations are session facts and policy spanning activities. A variable an activity produces is declared by that activity under `variables.writes` and contributed here on inclusion, so a value one activity hands the next has one home. |
| "Can run in fast or thorough mode" | **Activation variable + conditional flow** | one authoritative mode `variable` (enum or boolean) set by a detection step/checkpoint early in the workflow, with `exits[].when` and step `when`/`condition` gates that compare it directly — no parallel derived shadow flags |
| "The agent must always do X" (session conduct) | **Workflow rules** | `rules.workflow` / `rules.activity` / `rules.universal` (partitioned by audience). Runtime-relevant only — design-time authoring standards migrate to the workflow-design canon (`rule-audience-bucket`, `runtime-rules-only`). **Reach differs by construct**: `rules.activity` binds every activity the workflow includes, a technique group's container `## Rules` binds every operation in that group, and a Protocol bullet binds one operation. Collapsing a rule into a narrower home drops the audiences the wider one carried, so name what the surviving home covers ([Non-Destructive Updates](./design-principles.md#10-non-destructive-updates)). |
| "Every activity needs this strategy technique" | **Inherited techniques** | `techniques.workflow` (orchestrator, bundled into `get_workflow`) / `techniques.activity` (inherited by every activity, injected into `get_activity`). Activity-local `techniques[]` is STRATEGY only — per-step ops bind via `step.technique` (`techniques-list-disjoint`). |
| "Start with the first activity" | **Initial activity** | `initialActivity` (activity ID) |
| "After X, go to Y" / "this activity can end the run" | **Graph** | `graph.<activity>.<exit>` naming where that outcome leads — one activity, or `__terminal__` to end the run; the two rows below cover a destination that opens several branches. Every exit of every activity the workflow includes is bound here, or the load fails; a workflow that borrows an activity binds that activity's exits itself, so two workflows can run one activity in different orders. |
| "these activities read none of each other's output" | **Graph, a list destination** | `graph.<activity>.<exit>` naming two or more members. They run together, one worker to each, and the run continues from the single activity all of their own exits name — nothing declares that meeting point, and it is entered once, after the last branch returns. Each branch lands its outputs in a slot under a key derived from its activity id, so two branches cannot collide; the meeting point gathers the container. |
| "do this once per work unit, each in its own worker" | **Graph, an instance fan** | `graph.<activity>.<exit>` naming `{ activity, over, variable }` — the activity, the collection to run it once per element of, and the name each instance reads its own element at. The graph carries the collection's NAME, so nothing about a work unit enters the routing file and the width is that collection's length when the fan is entered. Declare `maxInstances` only to sit tighter than the server's ceiling, with the reason stated. For the same work inside ONE worker, which pays one delivery rather than N, use a `forEach` loop step instead. |
| "Several activities ask the user the same question" | **Checkpoint fragment** | `fragments.checkpoints.<name>` holds the gate body — `condition`, `message`, `options[]` with their effects — and a `kind: checkpoint` step reaches it by `ref: [workflow::]name` (bare name resolves against the declaring workflow, then meta). `ref` is mutually exclusive with the body fields: a ref step carries its `id`, and a `condition` only where the fragment declares none. |

## Technique-Level Constructs (technique.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "First do A, then do B" (procedure) | **Protocol** | `protocol[]` — ordered blocks `{ title?, steps[] }`; titled blocks `Initial`/`Final` on a container wrap descendants (server renumbers) |
| "Shared I/O/rules for every technique in the folder" | **Container TECHNIQUE.md** | Workflow-root or group `TECHNIQUE.md` — loader merges Inputs/Outputs/Rules/Errors into descendants; container `Initial`/`Final` protocol wraps (server renumbers). Capability names contribution only (`platform-semantics-in-capability`); set membership is the folder contents |
| "Needs a checklist path as input" | **Inputs** | `inputs[].id`, `.description`, `.required`, `.default`, `.components` (composite members as `####` sub-sections) |
| "Produces an audit report" | **Output** | `output[].id`, `.description`, `.components` (`####` sub-sections), `.artifact.name` (`#### artifact`) |
| "Never modify the schema" | **Rules** | `rules.{rule-name}` — flat name-value pairs |
| "Use get_workflow to load data" | **Tools** | `tools.{name}.when`, `.params`, `.returns`, `.next` |
| "If X fails, recover by Y" (failure handling) | **Protocol step** | written inline in the protocol step that gives rise to the failure |
| "How to interpret checkpoints" | **Interpretation** | `interpretation.checkpoints`, `.transitions`, `.decisions` |
| "How to resume after restart" | **Resumption** | `resumption.description`, `.steps[]` |

## Condition Constructs (condition.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "If status equals approved" | **Simple** | `type: "simple"`, `variable`, `operator`, `value` |
| "If the variable is defined" | **Existence** | `operator: "exists"` or `"notExists"` |
| "If A and B are both true" | **AND** | `type: "and"`, `conditions[]` |
| "If either A or B is true" | **OR** | `type: "or"`, `conditions[]` |
| "If X is not the case" | **NOT** | `type: "not"`, `condition` |

## Checkpoint Effects

Always wire checkpoint option consequences to formal effects:

| Effect | Purpose | Example |
|---|---|---|
| `setVariable` | Set variables based on user choice | `{ "setVariable": { "approved": true } }` |
| `exit` | Select one of the activity's declared outcomes; where it leads is the workflow's `graph` to say, and `present_checkpoint` states that consequence before the user chooses | `{ "exit": "rejected" }` |

## Action Types

Step `actions[]` carry lifecycle behaviour (entry/exit logic lives on a leading/trailing control step in `steps[]`, not in a separate hook):

| Action | Purpose |
|---|---|
| `log` | Record to execution history |
| `validate` | Check pre-condition, fail if not met |
| `set` | Assign a variable value |
| `emit` | Signal an event |
| `message` | Display markdown content to user |
