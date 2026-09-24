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

This inventory names the construct. Field tables, required properties, and examples live in `schemas/README.md`. The URI `workflow-server://schemas` aggregates the JSON schemas. On-disk layout and technique inheritance live in [On-disk layout](/meta/resources/workflow-canonical.md#on-disk-layout).

- Workflow — `schemas/workflow.schema.json`, `schemas/README.md#workflow-schema`
- Activity — `schemas/activity.schema.json`, `schemas/README.md#activity-schema`
- Technique — `schemas/technique.schema.json`, `schemas/README.md#technique-schema`
- Condition — `schemas/condition.schema.json`, `schemas/README.md#condition-schema`
- Routine — `schemas/routine.schema.json`, `schemas/README.md#routine-routineschemajson`

## Activity-Level Constructs (activity.schema.json)

Each entry maps a phrase onto an activity construct.

### A stage of the protocol

An activity: the stage that binds the techniques and routines and holds the conversation at that point in the session.

[24. Keep Session Interaction in Activities](./design-principles.md#24-keep-session-interaction-in-activities). Fields: `schemas/README.md#activity`.

### Do X, then do Y, then do Z

A technique step: one `steps[]` entry with `kind: technique`, binding one operation.

[AP-15. procedure-in-protocol](./anti-patterns.md#ap-15-procedure-in-protocol), [AP-17. bound-step-no-description](./anti-patterns.md#ap-17-bound-step-no-description), [AP-18. no-monolith-masking-steps](./anti-patterns.md#ap-18-no-monolith-masking-steps). Fields: `schemas/README.md#step`.

### Compose or chain techniques for work

Consecutive technique steps in the activity.

[25. Bind Sibling Operations as Steps](./design-principles.md#25-bind-sibling-operations-as-steps), [26. A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading), [AP-114. pass-orchestration-in-technique](./anti-patterns.md#ap-114-pass-orchestration-in-technique).

### Compose or reuse activities

A borrowed, bound, or included activity.

[43. An Activity Reuses Activities](./design-principles.md#43-an-activity-reuses-activities).

### Orchestrator-workers, fan-out then consolidate

A graph instance fan: the activity that emits the work units, the activity that runs once per unit, and the activity they converge on.

[40. Fan-Out Lives at the Layer That Runs the Work](./design-principles.md#40-fan-out-lives-at-the-layer-that-runs-the-work), [scatter-gather](/meta/techniques/scatter-gather.md). Fields: `schemas/README.md#workflow-root-entity`.

### Supervisor, fixed specialist lanes

The supervisor pattern activity.

[02-supervisor.yaml](/meta/activities/patterns/02-supervisor.yaml), [43. An Activity Reuses Activities](./design-principles.md#43-an-activity-reuses-activities).

### Plan and execute

The plan-and-execute pattern activity.

[03-plan-and-execute.yaml](/meta/activities/patterns/03-plan-and-execute.yaml), [43. An Activity Reuses Activities](./design-principles.md#43-an-activity-reuses-activities).

### Subagent isolation, each unit its own commit

A graph instance fan whose activity binds `git::create-worktree`.

[a-branch-that-commits-takes-a-checkout-of-its-own](/meta/techniques/scatter-gather.md#a-branch-that-commits-takes-a-checkout-of-its-own).

### Lead researcher, research rounds until the gaps close

The lead-researcher pattern activity.

[05-lead-researcher.yaml](/meta/activities/patterns/05-lead-researcher.yaml), [43. An Activity Reuses Activities](./design-principles.md#43-an-activity-reuses-activities).

### Agent as tool, an opaque sub-agent call

A technique step binding `orchestration-patterns::invoke-as-tool`.

[invoke-as-tool](/meta/techniques/orchestration-patterns/invoke-as-tool.md).

### Hierarchical agents, a manager tree

A child workflow.

[handle-sub-workflow](/meta/techniques/workflow-engine/handle-sub-workflow.md), [spawn-agent](/meta/techniques/harness-compat/spawn-agent.md).

### When entering or finishing, log, validate, or set

An action step: one `steps[]` entry with `kind: action`.

Fields: `schemas/README.md#action`.

### Ask the user whether to proceed

A checkpoint step: one `steps[]` entry with `kind: checkpoint`.

[AP-09. checkpoint-not-prose](./anti-patterns.md#ap-09-checkpoint-not-prose), [AP-97. link-named-artifacts](./anti-patterns.md#ap-97-link-named-artifacts), [AP-98. no-next-step-narration](./anti-patterns.md#ap-98-no-next-step-narration), [AP-99. statement-not-question](./anti-patterns.md#ap-99-statement-not-question), [AP-101. no-caption-only-message](./anti-patterns.md#ap-101-no-caption-only-message). Fields: `schemas/README.md#checkpoint-steps`.

### Repeat for each item, or do until done

A loop step: one `steps[]` entry with `kind: loop`.

[AP-10. loop-not-prose](./anti-patterns.md#ap-10-loop-not-prose). Fields: `schemas/README.md#loop-steps`.

### Several activities carry the same run of steps

A routine step: one `steps[]` entry with `kind: routine`.

[42. A Routine Holds the Codified Path](./design-principles.md#42-a-routine-holds-the-codified-path). Fields: `schemas/README.md#routine-step`.

### If X then do A, otherwise do B

An activity exit, bound to its destination in the workflow `graph`.

Fields: `schemas/README.md#exits-and-the-graph`.

### This triggers the X workflow

An activity trigger.

Fields: `schemas/README.md#triggers`.

### This produces a report file

A `#### artifact` on the producing technique's output.

[AP-12. artifact-not-buried](./anti-patterns.md#ap-12-artifact-not-buried), [AP-31. no-hand-authored-artifacts](./anti-patterns.md#ap-31-no-hand-authored-artifacts), [AP-130. artifact-name-is-filename](./anti-patterns.md#ap-130-artifact-name-is-filename).

### The expected result is X

An activity `outcome` entry.

[AP-32. outcome-names-value](./anti-patterns.md#ap-32-outcome-names-value). Fields: `schemas/README.md#activity`.

### Only run when X is true

The step gate: `when` on every kind, and `condition` on a technique, action, or checkpoint step.

[Condition Constructs](#condition-constructs-conditionschemajson). Fields: `schemas/README.md#step`.

### The agent must follow these constraints

An activity `rules` entry.

[AP-69. no-activity-prose-rules](./anti-patterns.md#ap-69-no-activity-prose-rules), [9. Encode Constraints as Structure](./design-principles.md#9-encode-constraints-as-structure).

### This activity needs X and produces Y

The activity variable contract, `variables.reads` and `variables.writes`, for names that cross the activity boundary.

Fields: `schemas/README.md#enforcement-model`.

## Workflow-Level Constructs (workflow.schema.json)

Each entry maps a phrase onto a workflow construct.

### The same procedure, performed across many sessions

A workflow: the durable graph of activities for that circumstance.

[1. Workflows Ossify Patterns](./design-principles.md#1-workflows-ossify-patterns).

### The session starts with X, or this policy holds all run

A workflow variable.

Fields: `schemas/README.md#variables`.

### Can run in fast or thorough mode

One mode variable, with exits and step gates that read it.

[AP-14. mode-as-state](./anti-patterns.md#ap-14-mode-as-state), [AP-112. no-derived-state-shadow](./anti-patterns.md#ap-112-no-derived-state-shadow).

### The agent must always do X

A workflow rule in the audience bucket that hears it.

[AP-37. rule-audience-bucket](./anti-patterns.md#ap-37-rule-audience-bucket), [AP-100. runtime-rules-only](./anti-patterns.md#ap-100-runtime-rules-only), [38. A Relocation Records the Outcome It Keeps](./design-principles.md#38-a-relocation-records-the-outcome-it-keeps).

### Every activity needs this strategy technique

A technique reference on `techniques.workflow` or `techniques.activity`.

[AP-36. techniques-list-disjoint](./anti-patterns.md#ap-36-techniques-list-disjoint), [AP-39. hoist-universal-techniques](./anti-patterns.md#ap-39-hoist-universal-techniques). Fields: `schemas/README.md#techniquesreference`.

### Start with the first activity

The workflow's `initialActivity`.

Fields: `schemas/README.md#workflow-root-entity`.

### After X, go to Y, or this activity can end the run

A `graph` binding from that activity's exit to one activity, or to `__terminal__`.

Fields: `schemas/README.md#exits-and-the-graph`.

### These activities read none of each other's output

A `graph` destination naming two or more activities that run together.

Fields: `schemas/README.md#workflow-root-entity`.

### Do this once per work unit, each in its own worker

A `graph` destination naming the activity, the collection, and the per-instance variable.

[40. Fan-Out Lives at the Layer That Runs the Work](./design-principles.md#40-fan-out-lives-at-the-layer-that-runs-the-work), [scatter-gather](/meta/techniques/scatter-gather.md). Fields: `schemas/README.md#workflow-root-entity`.

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

### The same run, differing only in the operation it binds

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

[26. A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading), [AP-135. tool-contract-restated-in-protocol](./anti-patterns.md#ap-135-tool-contract-restated-in-protocol).

### First do A, then do B

The technique Protocol.

[Protocol](/meta/resources/workflow-canonical.md#protocol), [15. Phase by Sequenced Outcome](./design-principles.md#15-phase-by-sequenced-outcome), [AP-108. numbered-protocol-phases](./anti-patterns.md#ap-108-numbered-protocol-phases).

### Shared inputs, outputs, or rules for every technique in the folder

The container `TECHNIQUE.md` contract.

[Base-contract inheritance](/meta/resources/workflow-canonical.md#base-contract-inheritance), [27. State Contract Contribution](./design-principles.md#27-state-contract-contribution), [AP-115. platform-semantics-in-capability](./anti-patterns.md#ap-115-platform-semantics-in-capability).

### Needs a checklist path as input

A technique input.

[AP-16. technique-inputs-declared](./anti-patterns.md#ap-16-technique-inputs-declared). Fields: `schemas/README.md#technique-schema`.

### Produces an audit report

A technique output.

[AP-109. technique-outputs-declared](./anti-patterns.md#ap-109-technique-outputs-declared), [AP-12. artifact-not-buried](./anti-patterns.md#ap-12-artifact-not-buried). Fields: `schemas/README.md#technique-schema`.

### Never modify the schema

A technique rule.

[45. A Rule States One Invariant](./design-principles.md#45-a-rule-states-one-invariant), [AP-152. one-invariant-per-rule](./anti-patterns.md#ap-152-one-invariant-per-rule).

### If X fails, recover by Y

A step of the Protocol phase that gives rise to the failure.

[Sections](/meta/resources/workflow-canonical.md#sections).

### How to interpret a gate, or resume after a restart

A Protocol phase when the duty is work, and a `## Rules` entry when it is a standing invariant.

[AP-121. rule-as-protocol-step](./anti-patterns.md#ap-121-rule-as-protocol-step), [26. A Technique Is a Reading](./design-principles.md#26-a-technique-is-a-reading).

## Condition Constructs (condition.schema.json)

Each entry maps a phrase onto a condition.

### If status equals approved

A simple condition.

Fields: `schemas/README.md#simple-conditions`.

### If the variable is defined

A simple condition with operator `exists` or `notExists`.

Fields: `schemas/README.md#simple-conditions`.

### If A and B are both true

A condition of type `and`.

Fields: `schemas/README.md#composite-conditions`.

### If either A or B is true

A condition of type `or`.

Fields: `schemas/README.md#composite-conditions`.

### If X is not the case

A condition of type `not`.

Fields: `schemas/README.md#composite-conditions`.
