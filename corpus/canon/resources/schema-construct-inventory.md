---
name: schema-construct-inventory
description: Maps informal patterns (what agents tend to write as prose) to their formal schema equivalents.
metadata:
  order: 1
  legacy_id: 1
---

# Schema Construct Inventory

## Universal obligation

Every piece of prose is checked against the entries below. Where a formal construct exists, the definition uses it. [Schema Expressiveness](./anti-patterns.md#schema-expressiveness) audits the same misses.

This inventory names the construct. Field tables and required properties live in the JSON schemas below. The URI `workflow-server://schemas` serves the workflow, activity, technique and condition schemas; the routine schema is read at its repository path. On-disk layout and technique inheritance live in [On-disk layout](/meta/resources/workflow-canonical.md#on-disk-layout).

- Workflow — `schemas/workflow.schema.json`
- Activity — `schemas/activity.schema.json`
- Technique — `schemas/technique.schema.json`
- Condition — `schemas/condition.schema.json`
- Routine — `schemas/routine.schema.json`

## Activity-Level Constructs (activity.schema.json)

Each entry maps a phrase onto an activity construct.

### A stage of the protocol

An activity: the stage that binds the techniques and routines and holds the conversation at that point in the session.

[24. Keep Session Interaction in Activities](./design-principles.md#24-keep-session-interaction-in-activities).

### Do X, then do Y, then do Z

A technique step: one `steps[]` entry with `kind: technique`, binding one technique.

[anti-patterns](./anti-patterns.md): `procedure-in-protocol`, `bound-step-no-description`, `no-monolith-masking-steps`.

### Compose or chain techniques for work

Consecutive technique steps in the activity.

[25. Bind Sibling Techniques as Steps](./design-principles.md#25-bind-sibling-techniques-as-steps), [26. A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading); [anti-patterns](./anti-patterns.md): `pass-orchestration-in-technique`.

### Compose or reuse activities

An activity file borrowed from another workflow, listed under the workflow's `activities:` as `<workflow>/[activities/]…/NN-<id>.yaml`.

[43. A Workflow Borrows Activities](./design-principles.md#43-a-workflow-borrows-activities).

### Orchestrator-workers, fan-out then consolidate

A graph instance fan: the activity that emits the work units, the activity that runs once per unit, and the activity they converge on.

[40. Fan-Out Lives at the Layer That Runs the Work](./design-principles.md#40-fan-out-lives-at-the-layer-that-runs-the-work), [scatter-gather](/meta/techniques/scatter-gather.md).

### Supervisor, fixed specialist lanes

The supervisor pattern activity.

[02-supervisor.yaml](/meta/activities/patterns/02-supervisor.yaml), [43. A Workflow Borrows Activities](./design-principles.md#43-a-workflow-borrows-activities).

### Plan and execute

The plan-and-execute pattern activity.

[03-plan-and-execute.yaml](/meta/activities/patterns/03-plan-and-execute.yaml), [43. A Workflow Borrows Activities](./design-principles.md#43-a-workflow-borrows-activities).

### Subagent isolation, each unit its own commit

A graph instance fan whose activity binds `git::create-worktree`.

[a-branch-that-commits-takes-a-checkout-of-its-own](/meta/techniques/scatter-gather.md#a-branch-that-commits-takes-a-checkout-of-its-own).

### Lead researcher, research rounds until the gaps close

The lead-researcher pattern activity.

[05-lead-researcher.yaml](/meta/activities/patterns/05-lead-researcher.yaml), [43. A Workflow Borrows Activities](./design-principles.md#43-a-workflow-borrows-activities).

### Agent as tool, an opaque sub-agent call

A technique step binding `orchestration-patterns::invoke-as-tool`.

[invoke-as-tool](/meta/techniques/orchestration-patterns/invoke-as-tool.md).

### Hierarchical agents, a manager tree

A child workflow.

[handle-sub-workflow](/meta/techniques/workflow-engine/handle-sub-workflow.md), [spawn-agent](/meta/techniques/harness-compat/spawn-agent.md).

### When entering or finishing, log, validate, or set

An action step: one `steps[]` entry with `kind: action`.

### Ask the user whether to proceed

A checkpoint step: one `steps[]` entry with `kind: checkpoint`.

[anti-patterns](./anti-patterns.md): `checkpoint-not-prose`, `link-named-artifacts`, `no-next-step-narration`, `statement-not-question`, `no-caption-only-message`.

### Repeat for each item, or do until done

A loop step: one `steps[]` entry with `kind: loop`.

[anti-patterns](./anti-patterns.md): `loop-not-prose`.

### Several activities carry the same run of steps

A routine step: one `steps[]` entry with `kind: routine`.

[42. A Routine Holds the Codified Path](./design-principles.md#42-a-routine-holds-the-codified-path).

### If X then do A, otherwise do B

An activity exit, bound to its destination in the workflow `graph`.

### This triggers the X workflow

An activity trigger.

### This produces a report file

A `#### artifact` on the producing technique's output.

[anti-patterns](./anti-patterns.md): `artifact-not-buried`, `no-hand-authored-artifacts`, `artifact-name-is-filename`.

### The expected result is X

An activity `outcome` entry.

[anti-patterns](./anti-patterns.md): `outcome-names-value`.

### Only run when X is true

The step gate: `when` on every kind, and `condition` on a technique, action, or checkpoint step.

[Condition Constructs](#condition-constructs-conditionschemajson).

### The agent must follow these constraints

An activity `rules` entry.

[9. Encode Constraints as Structure](./design-principles.md#9-encode-constraints-as-structure); [anti-patterns](./anti-patterns.md): `no-activity-prose-rules`.

### This activity needs X and produces Y

The activity variable contract, `variables.reads` and `variables.writes`, for names that cross the activity boundary.

## Workflow-Level Constructs (workflow.schema.json)

Each entry maps a phrase onto a workflow construct.

### The same procedure, performed across many sessions

A workflow: the durable graph of activities for that circumstance.

[1. Workflows Ossify Patterns](./design-principles.md#1-workflows-ossify-patterns).

### The session starts with X, or this policy holds all run

A workflow variable.

### Can run in fast or thorough mode

One mode variable, with exits and step gates that read it.

[anti-patterns](./anti-patterns.md): `mode-as-state`, `no-derived-state-shadow`.

### The agent must always do X

A workflow rule in the audience bucket that hears it.

[38. A Relocation Records the Outcome It Keeps](./design-principles.md#38-a-relocation-records-the-outcome-it-keeps); [anti-patterns](./anti-patterns.md): `rule-audience-bucket`, `runtime-rules-only`.

### Every activity needs this strategy technique

A technique reference on `techniques.workflow` or `techniques.activity`.

[anti-patterns](./anti-patterns.md): `techniques-list-disjoint`, `hoist-universal-techniques`.

### Start with the first activity

The workflow's `initialActivity`.

### After X, go to Y, or this activity can end the run

A `graph` binding from that activity's exit to one activity, or to `__terminal__`.

### These activities read none of each other's output

A `graph` destination naming two or more activities that run together.

### Do this once per work unit, each in its own worker

A `graph` destination naming the activity, the collection, and the per-instance variable.

[40. Fan-Out Lives at the Layer That Runs the Work](./design-principles.md#40-fan-out-lives-at-the-layer-that-runs-the-work), [scatter-gather](/meta/techniques/scatter-gather.md).

## Routine-Level Constructs (routine.schema.json)

Each entry maps a phrase onto a routine. The file shape is `schemas/routine.schema.json`. Layout: [On-disk layout](/meta/resources/workflow-canonical.md#on-disk-layout).

### Accepted, codified, consistent application of a judgement

A routine.

[42. A Routine Holds the Codified Path](./design-principles.md#42-a-routine-holds-the-codified-path), [1. Workflows Ossify Patterns](./design-principles.md#1-workflows-ossify-patterns).

### Name this run so two activities can share it

The routine file at `routines/<name>.yaml`. The filename is the name every reference resolves.

Fields: `schemas/routine.schema.json`.

### The run needs a value its host holds

A routine input.

Fields: `schemas/routine.schema.json`.

### The same run, differing only in the technique it binds

A routine input with `kind: technique`.

Fields: `schemas/routine.schema.json`.

### The run produces a value the host reads afterwards

A routine output.

Fields: `schemas/routine.schema.json`.

### A value the run's own steps pass between themselves

A routine internal.

Fields: `schemas/routine.schema.json`.

## Technique-Level Constructs (technique.schema.json)

Each entry maps a phrase onto a technique.

### The practitioner's judgement on live feedback

A technique.

[26. A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading), [42. A Routine Holds the Codified Path](./design-principles.md#42-a-routine-holds-the-codified-path).

### A tool with a large call space

A technique: one produce path through that space.

[26. A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading); [anti-patterns](./anti-patterns.md): `tool-contract-restated-in-protocol`.

### First do A, then do B

The technique Protocol.

[Protocol](/meta/resources/workflow-canonical.md#protocol), [15. Phase by Sequenced Outcome](./design-principles.md#15-phase-by-sequenced-outcome); [anti-patterns](./anti-patterns.md): `numbered-protocol-phases`.

### Shared inputs, outputs, or rules for every technique in the folder

The container `TECHNIQUE.md` contract.

[Base-contract inheritance](/meta/resources/workflow-canonical.md#base-contract-inheritance), [27. State Contract Contribution](./design-principles.md#27-state-contract-contribution); [anti-patterns](./anti-patterns.md): `platform-semantics-in-capability`.

### Needs a checklist path as input

A technique input.

[anti-patterns](./anti-patterns.md): `technique-inputs-declared`.

### Produces an audit report

A technique output.

[anti-patterns](./anti-patterns.md): `technique-outputs-declared`, `artifact-not-buried`.

### Never modify the schema

A technique rule.

[45. A Rule States One Invariant](./design-principles.md#45-a-rule-states-one-invariant); [anti-patterns](./anti-patterns.md): `one-invariant-per-rule`.

### If X fails, recover by Y

A step of the Protocol phase that gives rise to the failure.

[Sections](/meta/resources/workflow-canonical.md#sections).

### How to interpret a gate, or resume after a restart

A Protocol phase when the duty is work, and a `## Rules` entry when it is a standing invariant.

[26. A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading); [anti-patterns](./anti-patterns.md): `rule-as-protocol-step`.

## Condition Constructs (condition.schema.json)

Each entry maps a phrase onto a condition.

### If status equals approved

A simple condition.

### If the variable is defined

A simple condition with operator `exists` or `notExists`.

### If A and B are both true

A condition of type `and`.

### If either A or B is true

A condition of type `or`.

### If X is not the case

A condition of type `not`.
