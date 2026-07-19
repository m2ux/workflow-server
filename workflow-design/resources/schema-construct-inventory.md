---
name: schema-construct-inventory
description: Maps informal patterns (what agents tend to write as prose) to their formal schema equivalents.
metadata:
  order: 1
  legacy_id: 1
---

# Schema Construct Inventory

Maps informal patterns (what agents tend to write as prose) to their formal schema equivalents. Every piece of prose must be checked against this inventory — if a formal construct exists, it must be used. Schema Expressiveness anti-patterns sharpen the same concern for catalog audits.

**Authoritative schema sources:**

| Schema | Path | Documentation |
|--------|------|---------------|
| Workflow | `schemas/workflow.schema.json` | `schemas/README.md — Workflow Schema` |
| Activity | `schemas/activity.schema.json` | `schemas/README.md — Activity Schema` |
| Technique | `schemas/technique.schema.json` | `schemas/README.md — Technique Schema` |
| Condition | `schemas/condition.schema.json` | `schemas/README.md — Condition Schema` |
| State | `schemas/state.schema.json` | `schemas/README.md — State Schema` |

The MCP resource `workflow-server://schemas` returns all five schemas as a single JSON object. The `schemas/README.md` file (45KB) contains the full ontology with entity relationships, field tables, examples, and validation guidance.

---

## Activity-Level Constructs (activity.schema.json)

An activity has a **single ordered `steps[]`** in which every step carries a required `kind` discriminator (`technique` / `action` / `checkpoint` / `loop`). Checkpoints and loops are step KINDS at their concrete position in the sequence, not separate parallel arrays. `decisions[]` and `transitions[]` remain activity-level — they are cross-activity routing the orchestrator evaluates at the activity boundary, not steps.

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "Do X, then do Y, then do Z" | **Technique step** | `steps[]` entry with `kind: technique`, `.id`, `.technique` (a `group::operation` string, or `{ name, inputs?, outputs? }` for input/output deviations), optional `.actions` — pure binding: no `description` / `name` / `note` (`procedure-in-protocol`, `bound-step-no-description`). One operation per step; split compounds (`no-monolith-masking-steps`). |
| "Compose / chain techniques for work" / "Apply technique B from inside technique A" | **Activity technique steps** (not Protocol Apply) | Consecutive `steps[]` entries with `kind: technique`, each binding one op; activities (and checkpoints/loops) are the composition layer. Technique Protocols stay atomic produce paths over tools and resources — they do not `Apply` / `::`-invoke other techniques for work (`pass-orchestration-in-technique`, [Atomic Techniques; Compose at Activities](./design-principles.md#26-atomic-techniques-compose-at-activities)). |
| "Compose / reuse activities" / "borrow an activity for a shared orchestration pattern" | **Activity→activity composition** | Borrow, bind, or include a standalone activity (or activity pattern) for reusable orchestration — allowed under [Atomic Techniques; Compose at Activities](./design-principles.md#26-atomic-techniques-compose-at-activities). Distinct from technique→technique Apply. |
| "When entering/finishing, log/validate/set" | **Action step** | `steps[]` entry with `kind: action`, `.id`, `.actions[]` (`log`/`validate`/`set`/`emit`/`message`); a leading/trailing control step carries lifecycle actions at the start/end of the sequence (`actions[]` may be empty for a marker step). Pure action/control/checkpoint/loop steps need no `technique` binding. |
| "Ask the user whether to proceed" | **Checkpoint step** | `steps[]` entry with `kind: checkpoint`, a stable `.id`, `.message` (statement of the subject — no `?` / confirm-imperative / next-step narration / caption of the prior technique; embed `[label]({path})` for any durable artifact — same link rule applies to action `message` fields; `link-named-artifacts`, `no-caption-only-message`), `.options[]` with `.effect` (the decision space), optional `.defaultOption` / `.autoAdvanceMs` / `.blocking`; its POSITION in `steps[]` is when it is presented (present-then-checkpoint: place it immediately after the step whose output it confirms). See `link-named-artifacts`, `no-next-step-narration`, `statement-not-question`, `no-caption-only-message`. |
| "Repeat for each item" / "do until done" | **Loop step** | `steps[]` entry with `kind: loop`, `.id`, `.loopType` (forEach/while/doWhile), `.variable`, `.over`, `.condition`, `.breakCondition`, `.maxIterations`, optional `.name`; its body is a nested `.steps[]` |
| "If X then do A, otherwise do B" (automated) | **Decision** (activity-level) | `decisions[].branches[]` with `.condition` and `.transitionTo` |
| "Then move on to the next phase" | **Transition** (activity-level) | `transitions[].to`, `.condition`, `.isDefault` |
| "This triggers the X workflow" | **Trigger** | `triggers.workflow`, `.description`, `.passContext` |
| "This produces a report file" | **Technique output artifact** (activity `artifacts[]` is SERVER-COMPUTED, never authored) | declare a `#### artifact` on the producing technique's `## Outputs`; `get_activity` synthesizes the activity's artifact contract from its steps' bound techniques (`no-hand-authored-artifacts`) |
| "The expected result is X" | **Outcome** | `outcome[]` (string array) |
| "Only run when X is true" | **Step gate** | `steps[].when` / `steps[].condition` (references condition.schema.json) — a shared base field on every step kind |
| "The agent must follow these constraints" | **Activity rules** | `rules[]` (string array) |

## Workflow-Level Constructs (workflow.schema.json)

| Informal Pattern | Formal Construct | Schema Fields |
|---|---|---|
| "Track whether the user confirmed" | **Variable** | `variables[].name`, `.type`, `.description`, `.defaultValue` |
| "Can run in fast or thorough mode" | **Activation variable + conditional flow** | one authoritative mode `variable` (enum or boolean) set by a detection step/checkpoint early in the workflow, with `transitions[].condition` and step `when`/`condition` gates that compare it directly — no parallel derived shadow flags |
| "The agent must always do X" (session conduct) | **Workflow rules** | `rules.workflow` / `rules.activity` / `rules.universal` (partitioned by audience). Runtime-relevant only — design-time authoring standards migrate to the workflow-design canon (`rule-audience-bucket`, `runtime-rules-only`). |
| "Every activity needs this strategy technique" | **Inherited techniques** | `techniques.workflow` (orchestrator, bundled into `get_workflow`) / `techniques.activity` (inherited by every activity, injected into `get_activity`). Activity-local `techniques[]` is STRATEGY only — per-step ops bind via `step.technique` (`techniques-list-disjoint`). |
| "Start with the first activity" | **Initial activity** | `initialActivity` (activity ID) |

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
| `transitionTo` | Jump to a specific activity | `{ "transitionTo": "rejected" }` |
| `skipActivities` | Skip downstream activities | `{ "skipActivities": ["research"] }` |

## Action Types

Step `actions[]` carry lifecycle behaviour (entry/exit logic lives on a leading/trailing control step in `steps[]`, not in a separate hook):

| Action | Purpose |
|---|---|
| `log` | Record to execution history |
| `validate` | Check pre-condition, fail if not met |
| `set` | Assign a variable value |
| `emit` | Signal an event |
| `message` | Display markdown content to user |
