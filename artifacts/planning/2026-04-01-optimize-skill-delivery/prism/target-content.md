# Design Proposal: Unified Protocol Schema for Workflow Orchestration Entities

## Problem Statement

At present, workflows, activities, and skills have ostensibly identical internal semantics: they are sequences of operations with conditional branching, iteration, and messaging. However, these three entity types are represented heterogeneously, with activities having the most expressive representation and skills having the least expressive, where loops and conditionals are forced into prose.

The proposal is to optimise workflows by defining a new "protocol" schema that is shared by workflow, activity, and skill alike, capturing the fundamental condition and iteration semantics while allowing freedom for each variant to constrain additional features like input/output artifacts, tool calling, etc.

## Current State: Three Schemas with Divergent Control Flow Models

### Activity Schema (Most Expressive)

Activities have the richest control flow representation:

- **Steps**: Ordered execution units with `id`, `name`, `description`, `skill` reference, `condition` (evaluated against state variables), `required` flag, and `actions` array.
- **Loops**: Three types — `forEach` (iterate over collection), `while` (check condition before each iteration), `doWhile` (execute then check). Each has `variable`, `over`, `condition`, `maxIterations`, `breakCondition`, and can contain `steps` or `activities`.
- **Decisions**: Automated branching with multiple `branches`, each having `condition`, `transitionTo`, and `isDefault`.
- **Checkpoints**: Blocking user decision points with `options` (each with `effect` that can `setVariable`, `transitionTo`, or `skipActivities`), `condition`, `blocking`, `defaultOption`, `autoAdvanceMs`.
- **Transitions**: Navigation between activities with `condition` and `isDefault`.
- **Entry/Exit Actions**: `log`, `validate`, `set`, `emit`, `message` actions at activity boundaries.
- **Rules**: `string[]` of ordered imperative directives.

Example (requirements-elicitation activity):
```
loops[2]:
  - id: assumption-reconciliation
    type: while
    condition:
      type: simple
      variable: has_resolvable_assumptions
      operator: ==
      value: true
    steps[3]:
      - id: targeted-analysis
        skill: reconcile-assumptions
      - id: update-assumptions-and-artifact
        skill: reconcile-assumptions
      - id: reclassify-resolvability
        skill: reconcile-assumptions
  - id: domain-iteration
    type: forEach
    variable: current_domain
    over: question_domains
    maxIterations: 5
    steps[2]:
      - id: ask-question
        skill: elicit-requirements
      - id: record-response
        skill: elicit-requirements

decisions[1]:
  - id: user-intent
    branches[4]:
      - id: answered
        transitionTo: next-question
      - id: skip-question
        transitionTo: next-question
      - id: skip-domain
        transitionTo: next-domain
      - id: done
        transitionTo: collect-assumptions
```

### Skill Schema (Least Expressive)

Skills have no formal control flow constructs:

- **Protocol**: A flat map of phase-name → string[], where each phase is an ordered list of imperative prose bullets. No conditions, no loops, no decisions — all control flow is implicit in the prose.
- **Rules**: Object with named key-value pairs (different format from activity/workflow rules which are string arrays).
- **Inputs/Outputs**: Structured definitions with `id`, `description`, `required`, `default`, and `artifact` for persistence.
- **Tools**: Declarations of available tools with `when`, `params`, `returns`, `usage`.
- **Errors**: Named error definitions with `cause`, `recovery`, `detection`.
- No `steps` construct, no `loops`, no `decisions`, no `checkpoints`, no `transitions`.

Example (review-test-suite skill):
```
protocol:
  load-guidance[2]:
    - Use attached resource 17 (test-suite-review) for full review criteria
    - Identify all test files in the project related to changed code
  run-tests[1]:
    - Run the test suite to establish a passing baseline
  review-tests[5]:
    - Assess test coverage relative to implementation changes
    - Check for anti-patterns (flaky tests, over-mocking, brittle assertions)
    - Verify test isolation and independence
    - Review assertion quality and error message clarity
    - "For Rust projects, reference TDD best practices from resource 23"
  document-findings[2]:
    - Document findings with severity and recommendations
    - Create test-suite-review.md report in planning folder
  present-summary[1]:
    - Summarize coverage gaps and critical issues for checkpoint
```

Note how the final bullet "for checkpoint" implies interaction with activity-level checkpoints, but the skill has no formal way to declare this dependency. Similarly, "for Rust projects" implies a conditional but is expressed as prose within a bullet.

### Workflow Schema (Intermediate)

Workflows sit between activities and skills in expressiveness:

- **Activities**: Array of activity references (the primary structuring mechanism).
- **Variables**: Typed variable declarations with `name`, `type`, `description`, `defaultValue`, `required`.
- **Rules**: `string[]` of ordered imperative directives (same format as activities, different from skills).
- **Modes**: Execution mode modifications with `recognition`, `skipActivities`, `defaults`.
- **initialActivity**: Entry point declaration.
- No direct `steps`, `loops`, or `decisions` at the workflow level — these are delegated to activities.

## The Heterogeneity Problem

### 1. Rules Format Inconsistency
- **Workflow + Activity**: `rules` is `string[]` (ordered imperative directives)
- **Skill**: `rules` is `object` with named key-value pairs

### 2. Control Flow Gap
- **Activity**: Has formal `loops` (forEach/while/doWhile), `decisions` (conditional branches), `checkpoints` (user interaction points), and conditional `steps`.
- **Skill**: Has none of these. A skill that needs iteration must express it as prose: "For each file in the changed files list, review..." A skill that needs conditional logic must say: "If the project uses Rust, then..."
- **Workflow**: Has none directly; delegates to activities.

### 3. Execution Step Representation
- **Activity**: `steps[]` with structured `id`, `name`, `description`, `skill`, `condition`, `required`, `actions`.
- **Skill**: `protocol{}` with phase-name → string[] (imperative bullet lists, no structured metadata per step).
- **Workflow**: No step concept — uses activities as the unit of sequencing.

### 4. Semantic Equivalence Despite Syntactic Divergence
All three entities fundamentally express the same thing: "do X, then Y, and if Z then W, repeating until Q." But each uses a different syntax, making it impossible to:
- Compose them uniformly
- Apply the same tooling (validators, visualizers, static analysis)
- Refactor between levels (promote a skill's protocol to an activity's step structure, or collapse an activity into a skill)

## Proposed Solution: Unified Protocol Schema

### Core Idea

Define a `protocol.schema.json` that captures the fundamental operational semantics shared by all three entity types:

1. **Operation Sequence**: An ordered list of operations (replacing `steps` in activities, `protocol` phases in skills, and `activities` in workflows).
2. **Conditional Execution**: Each operation may have a `condition` (replacing implicit prose conditionals in skills).
3. **Iteration**: Formal loop constructs available at all levels (replacing prose iteration in skills).
4. **Messaging/Interaction**: Formalized interaction points (replacing implicit checkpoint references in skill prose).
5. **Composition**: Each operation can reference a sub-protocol (enabling nesting/composition).

### Variant Constraints

Each entity type extends the base protocol with its own constraints:

- **Workflow Protocol**: Operations are coarse-grained (activity-level). Adds: `variables`, `modes`, `initialActivity`, `artifactLocations`, `executionModel`.
- **Activity Protocol**: Operations are medium-grained (step-level). Adds: `checkpoints`, `transitions`, `artifacts`, `entryActions`, `exitActions`, `modeOverrides`, `skills` references.
- **Skill Protocol**: Operations are fine-grained (instruction-level). Adds: `tools`, `inputs`, `outputs`, `errors`, `resources`.

### Design Constraints

1. **Backward Compatibility**: Existing TOON files must remain valid or have a clear migration path.
2. **Granularity Preservation**: Skills should remain lightweight. The protocol should not force skills to adopt activity-level verbosity for simple sequential procedures.
3. **Semantic Precision vs. Authoring Ergonomics**: Formal loop/condition syntax in skills may improve machine interpretability but could harm authoring ergonomics for simple procedures.
4. **Runtime Interpretation**: The workflow-server must be able to interpret the unified protocol at all three granularity levels.
5. **TOON Format Compatibility**: The protocol must be expressible in TOON syntax, which has its own constraints on nested structure representation.

### Open Questions

1. Should the unified protocol support all three loop types (forEach, while, doWhile) at all levels, or should some be restricted to certain entity types?
2. How does checkpoint/interaction semantics work at the skill level? Skills currently delegate interaction to the activity that references them.
3. Should the rules format be unified? If so, which format wins — the string array (workflow/activity) or the named object (skill)?
4. What is the migration strategy for existing TOON files?
5. Does formal control flow in skills create a "skill complexity creep" problem where skills gradually absorb activity-level responsibilities?
