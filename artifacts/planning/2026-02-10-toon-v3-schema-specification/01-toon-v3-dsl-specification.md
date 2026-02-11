# Compose DSL Specification

**Version**: 3.0.0
**Date**: 2026-02-10
**Status**: Draft

---

## 1. Overview and Design Rationale

### Problem

The prior schema declared primitives — steps, checkpoints, conditions, loops, decisions — as independent top-level blocks with no explicit composition. The executing agent must reconstruct the sequential flow by correlating step IDs with checkpoint IDs, inferring which loops nest inside which steps, and following `transitionTo` edges scattered across decisions and checkpoints. This makes workflow execution non-deterministic: two agents reading the same activity file may infer different execution orders.

### Design Goal

Introduce **flows** as a composition layer that orders primitives into deterministic sequences — like a flowchart — while keeping primitives independently defined and referenceable. Reduce the primitive type count and eliminate redundancy.

### Changes from Prior Schema

| Aspect | Prior | Compose |
|--------|-------|---------|
| Primitive types | 5 (steps, checkpoints, conditions, loops, decisions) | 3 (steps, decisions, loops) |
| Composition | Implicit (agent-inferred) | Explicit (`flows:` block) |
| Checkpoints | Separate primitive | Merged into decisions (`message:` field) |
| Conditions | Separate primitive | Merged into decisions (`condition:` field) |
| Messages | `entryActions` / `exitActions` | Inline `- message:` in flows |
| Mode handling | `modeOverrides` per activity | Workflow-level `mode` variable evaluated by decisions |
| Data flow | `context_to_preserve` (flat list) | Scoped skill `inputs`/`outputs` with provenance |
| Names | Explicit `name:` field | Derived from ID (replace `-` with space) |

---

## 2. Primitives

### 2.1 Steps

A step is a unit of work. Trivial steps are performed directly by the agent. Non-trivial steps declare a `skill:` reference — just the skill ID, nothing more.

**Input/output resolution**: The skill's own definition declares its inputs and outputs by name. At runtime, the agent resolves each input name by pattern-matching against variables in the scoping chain (local flow > loop variable > activity-level > workflow-level). If a name is ambiguous across scopes, the skill's input definition uses a qualified reference (`NN.step-id.name`) to select explicitly. The step does not redeclare inputs or outputs — that would be redundant with the skill definition. Skill outputs are injected into the current scope after execution.

**Rules live in skills**: Steps do not carry rules. If a step requires behavioral constraints, that signals a skill is needed — the skill definition houses the rules. This keeps steps as pure references and rules co-located with the procedural knowledge that enforces them.

**Deterministic vs. dynamic questions**: Fixed-option questions with known branches are handled by interactive decisions (see Section 2.2). Dynamic questions — where the content, phrasing, or follow-up logic depends on runtime context — are steps backed by a skill. The skill declares its own context inputs (current domain, prior responses, etc.) and produces structured outputs (question text, user response, adaptation signals). These resolve from the environment automatically.

**EBNF**:

```ebnf
Steps       ::= 'steps:' NEWLINE StepDef+
StepDef     ::= INDENT Id ':' NEWLINE StepBody
StepBody    ::= DescLine SkillRef?
DescLine    ::= INDENT2 'description:' STRING NEWLINE
SkillRef    ::= INDENT2 'skill:' Id NEWLINE
```

**Alloy constraint**:

```alloy
-- Step IDs are unique within an activity
fact StepUniqueness {
  all disj s1, s2: Step | s1.id != s2.id
}

-- Skill inputs resolve from the scoping chain at the point of invocation
-- Resolution: local flow outputs > loop variable > activity inputs > workflow vars
fact InputProvenance {
  all a: Activity, s: a.steps | some s.skill implies
    all i: s.skill.declaredInputs |
      i.name in resolve[scopeAt[a, s]]
}
```

**Example**:

```
steps:
  collect-assumptions:
    description: "Identify assumptions made when interpreting user responses."
    skill: assumptions-review
    # skill declares inputs: [raw-responses] — resolved from scope
    # skill declares outputs: [categorized-assumptions] — injected into scope

  post-assumptions-to-jira:
    description: "Prepare assumptions as Jira comment, get approval, post to ticket."
    skill: jira-comment
    # skill declares inputs: [categorized-assumptions, issue-number]
    # categorized-assumptions resolves from local flow (collect-assumptions output)
    # issue-number resolves from activity 01 — skill qualifies as 01.create-issue.issue-number
```

### 2.2 Decisions

A decision is a branch point. It evaluates state and routes execution to one of several branches. Two forms exist:

**Interactive decisions** have a `message:` field. The agent presents the message to the user, offers the branches as options, and blocks for a response. Branches are the user's choices.

**Programmatic decisions** have no `message:`. They evaluate existing state:
- `variable:` — multi-way match on a named variable. Branch keys are literal match values. Branches are indented under `variable:`.
- `condition:` — boolean algebra expression. Branches are `true:` and `false:`.

**Branch behavior**:
- Branches **rejoin** the flow after the decision unless they contain a **terminal instruction** (`break` or `activity:`).
- An **empty branch** (key with no children) is an implicit pass-through — execution falls through to rejoin.
- A **branchless decision** (interactive, with `message:` but no branch keys) is a blocking acknowledgment gate — the agent waits for the user, then continues.
- Decisions may **self-reference** to create retry loops. The validator must confirm at least one branch does not recurse (exit path exists).

**Boolean algebra operators**: `==`, `!=`, `&&`, `||`, `!`, parentheses for grouping. Operates on variables resolved via the scoping chain.

**Default handling**: For `variable:` decisions, a `default:` branch handles unmatched values. The validator **warns** if `default:` is absent. At runtime, a missing match with no default is treated as a pass-through.

**EBNF**:

```ebnf
Decisions       ::= 'decisions:' NEWLINE DecisionDef+
DecisionDef     ::= INDENT Id ':' NEWLINE DecisionBody

DecisionBody    ::= InteractiveBody | VariableBody | ConditionBody

InteractiveBody ::= INDENT2 'message:' STRING NEWLINE Branch*
VariableBody    ::= INDENT2 'variable:' Id NEWLINE VarBranch+ DefaultBranch?
ConditionBody   ::= INDENT2 'condition:' BoolExpr NEWLINE
                     INDENT3 'true:' NEWLINE FlowFragment
                     INDENT3 'false:' NEWLINE FlowFragment

Branch          ::= INDENT2 Id ':' NEWLINE FlowFragment?
VarBranch       ::= INDENT3 Id ':' NEWLINE FlowFragment?
DefaultBranch   ::= INDENT3 'default:' NEWLINE FlowFragment

FlowFragment    ::= (INDENT FlowItem NEWLINE)+
FlowItem        ::= '- step:' Id
                   | '- decision:' Id
                   | '- loop:' Id
                   | '- flow:' Id
                   | '- message:' STRING
                   | '- activity:' Id
                   | '- break'

BoolExpr        ::= BoolTerm (('&&' | '||') BoolTerm)*
BoolTerm        ::= '!' BoolTerm | '(' BoolExpr ')' | Comparison
Comparison      ::= Id ('==' | '!=') Value
Value           ::= STRING | 'true' | 'false' | 'null' | NUMBER
```

**Alloy constraints**:

```alloy
-- Interactive decisions have message, no variable/condition
fact InteractiveForm {
  all d: Decision | some d.message implies
    no d.variable and no d.condition
}

-- Self-referencing decisions must have an exit path
fact RetryTermination {
  all d: Decision | d in d.branches.refs implies
    some b: d.branches | d not in b.refs.*(branches.refs)
}

-- Variable decisions: warn if no default
pred MissingDefault[d: Decision] {
  some d.variable and no d.defaultBranch
}
```

**Examples**:

```
decisions:
  # Interactive — blocks for user input
  stakeholder-transcript:
    message: "Provide the stakeholder transcript or summary here."
    provide-transcript:
      - step: stakeholder-discussion
    skip-discussion:

  # Interactive — branchless acknowledgment gate
  document-ready:
    message: "Requirements document created. Ready to proceed?"

  # Interactive — self-referencing retry
  jira-comment-review:
    message: "Review the Jira comment before posting."
    post-comment:
    edit-comment:
      - step: post-assumptions-to-jira
      - decision: jira-comment-review
    skip-posting:

  # Programmatic — variable multi-way match
  platform-routing:
    variable: 01.check-issue.issue-platform
      jira:
        - step: post-assumptions-to-jira
        - decision: jira-comment-review
      github:
        - step: post-assumptions-to-github
      default:
        - step: create-document

  # Programmatic — boolean algebra condition
  requirements-confirmed:
    condition: elicitation-complete == true && requirements-document != null
      true:
        - activity: research
      false:
        - decision: stakeholder-transcript

  # Programmatic — mode branching (workflow-level variable)
  mode-elicitation-path:
    variable: mode
      implement:
        - step: stakeholder-discussion
      review:
        - activity: implementation-analysis
```

### 2.3 Loops

A loop iterates a named flow over a collection. Only `forEach` is supported. While-like behavior is achieved through decision self-reference (see Section 2.2).

A `break` instruction within a loop's flow exits the **innermost containing loop only** and resumes the parent flow after the loop reference. `break` does not propagate to outer loops.

An `activity:` instruction within a loop's flow is a **layered terminal** — it exits the loop, the flow, and the entire activity immediately.

**EBNF**:

```ebnf
Loops       ::= 'loops:' NEWLINE LoopDef+
LoopDef     ::= INDENT Id ':' NEWLINE LoopBody
LoopBody    ::= INDENT2 'type: forEach' NEWLINE
                INDENT2 'variable:' Id NEWLINE
                INDENT2 'over:' Id NEWLINE
                (INDENT2 'maxIterations:' NUMBER NEWLINE)?
                INDENT2 'flow:' Id NEWLINE
```

**Alloy constraints**:

```alloy
-- Loop flow must reference an existing flow
fact LoopFlowExists {
  all l: Loop | l.flow in Flow.id
}

-- break is only valid inside a loop's flow (direct or nested)
fact BreakScope {
  all b: Break | some l: Loop | b in l.flow.items.*(nested)
}

-- break exits only the innermost enclosing loop
fact BreakInnermost {
  all b: Break | b.target = innermost[b, Loop]
}
```

**Example**:

```
loops:
  domain-iteration:
    type: forEach
    variable: current-domain
    over: question-domains
    maxIterations: 5
    flow: domain-body
```

### 2.4 Flows

A flow is a named, ordered sequence of primitive references. Flows are the composition layer — they stitch steps, decisions, loops, messages, and other flows into a deterministic execution order.

Every activity must have a `main` flow. This is the entry point. Additional named flows are referenced by loops (via `flow:`) or by decision branches (via `- flow:`).

`- message:` is an inline string — no separate declaration. Used for entry/exit notifications or mid-flow status updates.

`- activity:` transitions to a named activity, exiting the current activity entirely.

`- break` exits the innermost enclosing loop.

`- flow: continue` is an explicit "proceed to next item" — useful in decision branches for readability, but functionally equivalent to an empty branch (pass-through).

**EBNF**:

```ebnf
Flows       ::= 'flows:' NEWLINE FlowDef+
FlowDef     ::= INDENT Id ':' NEWLINE FlowItems
FlowItems   ::= (INDENT2 FlowItem NEWLINE)+
FlowItem    ::= '- step:' Id
              | '- decision:' Id
              | '- loop:' Id
              | '- flow:' Id
              | '- message:' STRING
              | '- activity:' Id
              | '- break'
```

**Alloy constraints**:

```alloy
-- Every activity has a main flow
fact MainFlowExists {
  all a: Activity | "main" in a.flows.id
}

-- Every named flow is referenced (no orphans)
fact FlowReachability {
  all f: Flow | f.id = "main" or
    f.id in (Loop.flow + Decision.branches.flowRefs + Flow.items.flowRefs)
}

-- break only appears inside a loop's reachable flow graph
fact BreakContext {
  all f: Flow, i: f.items | i = Break implies
    some l: Loop | f in l.flow.*(reachable)
}
```

**Example**:

```
flows:
  main:
    - message: "Starting requirements elicitation"
    - decision: mode-elicitation-path
    - decision: stakeholder-transcript
    - loop: domain-iteration
    - step: collect-assumptions
    - decision: platform-routing
    - step: create-document
    - step: update-assumptions-log
    - decision: requirements-confirmed
    - message: "Requirements elicitation complete"

  domain-body:
    - step: ask-question
    - decision: user-intent
    - decision: domain-complete
```

---

## 3. EBNF Grammar

Complete formal grammar for a Compose activity file.

```ebnf
(* ===== Top-level structure ===== *)

Activity        ::= Header InputsDecl? Primitives Flows

Header          ::= 'id:' Id NEWLINE
                     'version:' Version NEWLINE
                     'description:' STRING NEWLINE

InputsDecl      ::= 'inputs:' IdList NEWLINE

Primitives      ::= Steps? Decisions? Loops?

(* ===== Steps ===== *)

Steps           ::= 'steps:' NEWLINE StepDef+
StepDef         ::= INDENT Id ':' NEWLINE StepBody
StepBody        ::= INDENT2 'description:' STRING NEWLINE
                     SkillRef?

SkillRef        ::= INDENT2 'skill:' Id NEWLINE

(* ===== Decisions ===== *)

Decisions       ::= 'decisions:' NEWLINE DecisionDef+
DecisionDef     ::= INDENT Id ':' NEWLINE DecisionBody

DecisionBody    ::= InteractiveBody
                   | VariableBody
                   | ConditionBody

InteractiveBody ::= INDENT2 'message:' STRING NEWLINE
                     Branch*

VariableBody    ::= INDENT2 'variable:' Id NEWLINE
                     VarBranch+
                     DefaultBranch?

ConditionBody   ::= INDENT2 'condition:' BoolExpr NEWLINE
                     INDENT3 'true:' NEWLINE FlowFragment
                     (INDENT3 'false:' NEWLINE FlowFragment)?

Branch          ::= INDENT2 Id ':' NEWLINE FlowFragment?
VarBranch       ::= INDENT3 Id ':' NEWLINE FlowFragment?
DefaultBranch   ::= INDENT3 'default:' NEWLINE FlowFragment

(* ===== Loops ===== *)

Loops           ::= 'loops:' NEWLINE LoopDef+
LoopDef         ::= INDENT Id ':' NEWLINE LoopBody
LoopBody        ::= INDENT2 'type: forEach' NEWLINE
                     INDENT2 'variable:' Id NEWLINE
                     INDENT2 'over:' Id NEWLINE
                     (INDENT2 'maxIterations:' NUMBER NEWLINE)?
                     INDENT2 'flow:' Id NEWLINE

(* ===== Flows ===== *)

Flows           ::= 'flows:' NEWLINE FlowDef+
FlowDef         ::= INDENT Id ':' NEWLINE FlowItems
FlowItems       ::= (INDENT2 FlowItem NEWLINE)+

FlowItem        ::= '- step:' Id
                   | '- decision:' Id
                   | '- loop:' Id
                   | '- flow:' Id
                   | '- message:' STRING
                   | '- activity:' Id
                   | '- break'

FlowFragment    ::= (INDENT FlowItem NEWLINE)+

(* ===== Boolean algebra ===== *)

BoolExpr        ::= BoolOr
BoolOr          ::= BoolAnd ('||' BoolAnd)*
BoolAnd         ::= BoolUnary ('&&' BoolUnary)*
BoolUnary       ::= '!' BoolUnary
                   | '(' BoolExpr ')'
                   | Comparison
Comparison      ::= Id ('==' | '!=') Value

(* ===== Terminals ===== *)

Value           ::= STRING | 'true' | 'false' | 'null' | NUMBER
Id              ::= LETTER_LC (LETTER_LC | DIGIT | '-')*
QualifiedId     ::= DIGIT+ '.' Id '.' Id
IdList          ::= (Id | QualifiedId) (',' (Id | QualifiedId))*
Version         ::= DIGIT+ '.' DIGIT+ '.' DIGIT+
STRING          ::= '"' [^"]* '"'
NUMBER          ::= DIGIT+
NEWLINE         ::= '\n'
INDENT          ::= '  '
INDENT2         ::= '    '
INDENT3         ::= '      '
LETTER_LC       ::= [a-z]
DIGIT           ::= [0-9]
```

---

## 4. Semantic Constraints (Alloy-style)

### 4.1 Signatures

```alloy
sig Activity {
  id: one Id,
  activityInputs: set Id,
  steps: set Step,
  decisions: set Decision,
  loops: set Loop,
  flows: set Flow
}

sig Step {
  id: one Id,
  skill: lone SkillRef
}

sig SkillRef {
  id: one Id
  -- inputs/outputs are declared in the skill definition (separate file)
  -- resolved from the scoping chain at the invocation point
}

sig SkillDef {
  id: one Id,
  declaredInputs: seq InputDecl,
  declaredOutputs: seq OutputDecl,
  rules: set String
}

sig InputDecl {
  name: one Id,       -- bare name or qualified (NN.step.name)
  required: one Bool,
  default: lone Value
}

sig OutputDecl {
  name: one Id
}

sig Decision {
  id: one Id,
  message: lone String,
  variable: lone Id,
  condition: lone BoolExpr,
  branches: set Branch,
  defaultBranch: lone Branch
}

sig Branch {
  key: one Id,
  items: seq FlowItem
}

sig Loop {
  id: one Id,
  variable: one Id,
  over: one Id,
  maxIterations: lone Int,
  flow: one Id
}

sig Flow {
  id: one Id,
  items: seq FlowItem
}

abstract sig FlowItem {}
sig StepRef extends FlowItem { ref: one Id }
sig DecisionRef extends FlowItem { ref: one Id }
sig LoopRef extends FlowItem { ref: one Id }
sig FlowRef extends FlowItem { ref: one Id }
sig MessageItem extends FlowItem { text: one String }
sig ActivityTransition extends FlowItem { ref: one Id }
sig Break extends FlowItem {}
```

### 4.2 Structural Constraints

```alloy
-- PROV-001: Every required skill input resolves from the scoping chain
-- at the step's invocation point
fact InputProvenance {
  all a: Activity, s: a.steps | some s.skill implies
    let def = lookupSkillDef[s.skill.id] |
      all i: elems[def.declaredInputs] | i.required = True implies
        i.name in resolve[scopeAt[a, s]]
}

-- PROV-002: Cross-activity references in skill input declarations use
-- qualified NN.step-id.name form
fact QualifiedCrossRef {
  all d: SkillDef, i: elems[d.declaredInputs] |
    isCrossActivity[i.name] implies isQualified[i.name]
}

-- SYM-001: Step IDs unique within activity
fact StepUniqueness {
  all a: Activity, disj s1, s2: a.steps | s1.id != s2.id
}

-- SYM-002: Decision IDs unique within activity
fact DecisionUniqueness {
  all a: Activity, disj d1, d2: a.decisions | d1.id != d2.id
}

-- SYM-003: Loop IDs unique within activity
fact LoopUniqueness {
  all a: Activity, disj l1, l2: a.loops | l1.id != l2.id
}

-- SYM-004: Flow IDs unique within activity
fact FlowUniqueness {
  all a: Activity, disj f1, f2: a.flows | f1.id != f2.id
}
```

### 4.3 Flow Constraints

```alloy
-- FLOW-001: Every activity has a main flow
fact MainFlowExists {
  all a: Activity | some f: a.flows | f.id = "main"
}

-- FLOW-002: Every named flow is referenced by a loop, decision branch, or flow
fact FlowReachability {
  all a: Activity, f: a.flows | f.id = "main" or
    f.id in a.loops.flow +
            { id: Id | some b: a.decisions.branches | FlowRef in elems[b.items] and id = FlowRef.ref } +
            { id: Id | some f2: a.flows | FlowRef in elems[f2.items] and id = FlowRef.ref }
}

-- FLOW-003: Flow references resolve to existing flows
fact FlowRefValid {
  all a: Activity, f: a.flows, i: elems[f.items] |
    i in FlowRef implies i.ref in a.flows.id
}
```

### 4.4 Loop Constraints

```alloy
-- LOOP-001: Loop flow references an existing flow
fact LoopFlowExists {
  all a: Activity, l: a.loops | l.flow in a.flows.id
}

-- LOOP-002: break only appears within a loop's reachable flow graph
fact BreakContext {
  all a: Activity, f: a.flows, i: elems[f.items] |
    i in Break implies f.id in reachableFromLoop[a]
}

-- LOOP-003: break exits innermost enclosing loop only
fact BreakInnermost {
  all b: Break | b.target = innermost[b, Loop]
}
```

### 4.5 Decision Constraints

```alloy
-- DEC-001: Variable decisions should have a default branch (WARN, not ERROR)
pred MissingDefault {
  some d: Decision | some d.variable and no d.defaultBranch
}

-- DEC-002: Self-referencing decisions have at least one non-recursive exit
fact RetryTermination {
  all a: Activity, d: a.decisions |
    d.id in d.branches.items.ref implies
      some b: d.branches | d.id not in reachableRefs[b]
}

-- DEC-003: Interactive decisions have message, no variable/condition
fact InteractiveForm {
  all d: Decision | some d.message implies
    no d.variable and no d.condition
}

-- DEC-004: Programmatic decisions have variable or condition, not both
fact ProgrammaticForm {
  all d: Decision | no d.message implies
    (some d.variable and no d.condition) or
    (no d.variable and some d.condition)
}
```

### 4.6 Terminal Constraints

```alloy
-- TERM-001: activity: is valid anywhere and terminates activity scope
-- (No structural constraint needed — semantic: execution halts at this point)

-- TERM-002: Branches rejoin unless they contain a terminal
fun terminals: set FlowItem {
  Break + ActivityTransition
}

pred branchRejoins[b: Branch] {
  no (elems[b.items] & terminals)
}
```

### 4.7 Variable Scoping

Resolution order (innermost to outermost):

1. **Local flow scope** — outputs from steps earlier in the current flow
2. **Loop variable** — the iteration variable of the enclosing loop
3. **Activity-level** — declared `inputs:` and all step outputs within the activity
4. **Workflow-level** — variables set by the workflow (e.g., `mode`)

```alloy
fun resolve[name: Id, context: FlowContext]: lone Value {
  localScope[context, name] != none implies localScope[context, name]
  else loopScope[context, name] != none implies loopScope[context, name]
  else activityScope[context, name] != none implies activityScope[context, name]
  else workflowScope[context, name]
}
```

---

## 5. Design Decisions

| # | Edge Case | Decision | Rationale |
|---|-----------|----------|-----------|
| 1 | Branch rejoin | Branches rejoin the parent flow after the decision unless they contain a terminal instruction (`break`, `activity:`) | Matches flowchart semantics --- diamond nodes reconverge |
| 2 | Empty branches | Empty branch (no children) = implicit pass-through. Branchless interactive decision = blocking acknowledgment gate | Minimizes syntax for common "just continue" cases |
| 3 | Retry patterns | Decisions may self-reference to create implicit retry loops. Validator enforces at least one non-recursive exit branch | Avoids a separate `while` loop type; keeps loop count to `forEach` only |
| 4 | Boolean algebra | `variable:` for multi-way value match, `condition:` for compound boolean algebra (`==`, `!=`, `&&`, `\|\|`, `!`, parens) | Two forms cover enum-style routing and compound guards without overloading one syntax |
| 5 | Loop types | `forEach` only. While-like behavior via decision self-reference | Single loop type reduces cognitive load; retry patterns are naturally interactive |
| 6 | Terminals in loops | Layered: `break` exits innermost loop scope, `activity:` exits entire activity scope. Both are immediate at their respective levels | Matches familiar programming semantics (break vs. return) |
| 7 | Provenance | Strict: every skill input must resolve to an upstream output or a declared activity-level `inputs:` entry. Validator fails on unresolved inputs | Catches data flow errors at authoring time, not execution time |
| 8 | Non-formalizable rules | Rules live in skills, not steps. A step needing behavioral constraints signals that a skill is required — the skill houses the rules | Keeps rules co-located with the procedural knowledge that enforces them; steps remain pure references |
| 9 | Default branch | Validator warns if a `variable:` decision has no `default:` branch. Runtime treats unmatched values as pass-through | Catches potential oversights without blocking execution |
| 10 | Messages | Inline `- message: "text"` in flows. No separate declaration | Entry/exit notifications are lightweight; no reuse need |
| 11 | Activity outputs | All step skill outputs are implicitly exported. Downstream activities reference via `NN.step-id.output-name` | Avoids redundant output declarations; validator checks on the consumer side |
| 12 | Deterministic vs. dynamic questions | Deterministic (fixed options) = interactive decision. Dynamic (context-dependent) = step with skill binding | Decisions handle known branches; skills handle runtime-generated questions with proper input provenance |

---

## 6. Complete Example

Full `requirements-elicitation` activity rewritten in Compose, annotated with constraint references.

```
id: requirements-elicitation
version: 3.0.0
description: "Discover and clarify what the work package should accomplish through structured sequential conversation."

# Activity-level inputs: external data this activity needs [PROV-001, PROV-002]
# Only data not produced within this activity's own flow
inputs: raw-responses, 01.create-issue.issue-number, 01.check-issue.issue-platform

# ============================================================
# Primitives
# ============================================================

steps:
  # Trivial step — no skill binding
  stakeholder-discussion:                                         # [SYM-001]
    description: "Prompt user to initiate discussion with key stakeholders."

  # Dynamic question — skill-backed, context-dependent
  ask-question:                                                   # [PROV-001]
    description: "Present ONE question from current domain. Wait for response."
    skill: domain-question
    # skill inputs [current-domain, elicitation-log] resolve from loop var + scope
    # skill outputs [question-text, user-response] injected into scope

  record-response:
    description: "Capture answer or mark as skipped. Adapt follow-up."
    skill: response-capture
    # skill inputs [user-response, current-domain] resolve from local flow + loop var
    # skill outputs [elicitation-log] injected, accumulates across iterations

  collect-assumptions:
    description: "Identify assumptions made when interpreting user responses."
    skill: assumptions-review
    # skill inputs [raw-responses] resolve from activity inputs

  post-assumptions-to-jira:
    description: "Prepare assumptions as Jira comment, get approval, post to ticket."
    skill: jira-comment
    # skill inputs [categorized-assumptions] from local flow
    # skill inputs [issue-number] qualified as 01.create-issue.issue-number in skill def

  post-assumptions-to-github:
    description: "Post assumptions as GitHub issue comment."
    skill: github-comment

  create-document:
    description: "Create requirements document using elicitation output template."
    skill: artifact-management

  update-assumptions-log:
    description: "Add requirements-phase assumptions to the assumptions log."
    skill: assumptions-log-update

decisions:
  # Mode branching — workflow-level variable [Decision 4, variable form]
  mode-elicitation-path:
    variable: mode
      implement:
        - step: stakeholder-discussion
      review:
        - activity: implementation-analysis                       # [TERM-001]

  # Interactive — user provides transcript [Decision 2, empty branch]
  stakeholder-transcript:
    message: "Provide the stakeholder transcript or summary here."
    provide-transcript:
      - step: stakeholder-discussion
    skip-discussion:                                              # empty = pass-through

  # Programmatic — route by platform [Decision 4, Decision 9]
  platform-routing:
    variable: 01.check-issue.issue-platform
      jira:
        - step: post-assumptions-to-jira
        - decision: jira-comment-review
      github:
        - step: post-assumptions-to-github
      # validator warns: no default branch                        # [DEC-001]

  # Interactive — self-referencing retry [Decision 3]
  jira-comment-review:
    message: "Review the Jira comment before posting."
    post-comment:                                                 # empty = pass-through
    edit-comment:
      - step: post-assumptions-to-jira
      - decision: jira-comment-review                             # [DEC-002] self-ref
    skip-posting:

  # Interactive — mid-loop user intent [Decision 6, break]
  user-intent:
    message: "How would you like to proceed?"
    answered:
      - step: record-response                                     # rejoins [Decision 1]
    skip-question:                                                # empty = pass-through
    skip-domain:
      - break                                                     # [LOOP-002, LOOP-003]
    done:
      - break

  # Interactive — end-of-domain control
  domain-complete:
    message: "Domain '{current-domain}' complete."
    next-domain:                                                  # empty = pass-through
    revisit:
      - loop: domain-iteration
    finish-early:
      - break                                                     # [LOOP-003]

  # Programmatic — boolean algebra [Decision 4, condition form]
  requirements-confirmed:
    condition: elicitation-complete == true && requirements-document != null
      true:
        - activity: research                                      # [TERM-001]
      false:
        - decision: stakeholder-transcript                        # retry

loops:
  domain-iteration:                                               # [LOOP-001]
    type: forEach
    variable: current-domain
    over: question-domains
    maxIterations: 5
    flow: domain-body                                             # references flow below

# ============================================================
# Flows — deterministic composition [FLOW-001, FLOW-002]
# ============================================================

flows:
  main:                                                           # [FLOW-001] entry point
    - message: "Starting requirements elicitation"                # [Decision 10]
    - decision: mode-elicitation-path
    - decision: stakeholder-transcript
    - loop: domain-iteration
    - step: collect-assumptions
    - decision: platform-routing
    - step: create-document
    - step: update-assumptions-log
    - decision: requirements-confirmed
    - message: "Requirements elicitation complete"

  domain-body:                                                    # [FLOW-002] ref'd by loop
    - step: ask-question
    - decision: user-intent
    - decision: domain-complete
```

---

## 7. Validation Rules Checklist

Machine-interpretable rules derived from the Alloy constraints in Section 4. Each rule has an ID, severity, description, and the Alloy fact it implements.

### Provenance

| Rule | Severity | Description | Alloy Ref |
|------|----------|-------------|-----------|
| `PROV-001` | ERROR | Every required skill input (declared in the skill definition) must resolve from the scoping chain at the step's invocation point | `InputProvenance` |
| `PROV-002` | ERROR | Cross-activity references in skill input declarations must use qualified `NN.step-id.name` form | `QualifiedCrossRef` |

### Symbol Uniqueness

| Rule | Severity | Description | Alloy Ref |
|------|----------|-------------|-----------|
| `SYM-001` | ERROR | Step IDs unique within activity | `StepUniqueness` |
| `SYM-002` | ERROR | Decision IDs unique within activity | `DecisionUniqueness` |
| `SYM-003` | ERROR | Loop IDs unique within activity | `LoopUniqueness` |
| `SYM-004` | ERROR | Flow IDs unique within activity | `FlowUniqueness` |

### Flow Structure

| Rule | Severity | Description | Alloy Ref |
|------|----------|-------------|-----------|
| `FLOW-001` | ERROR | Every activity must have a `main` flow | `MainFlowExists` |
| `FLOW-002` | WARN | Every named flow must be referenced by a loop, decision, or flow | `FlowReachability` |
| `FLOW-003` | ERROR | Flow references (`- flow:` / loop `flow:`) must resolve to existing flow IDs | `FlowRefValid` |

### Loop Validation

| Rule | Severity | Description | Alloy Ref |
|------|----------|-------------|-----------|
| `LOOP-001` | ERROR | Loop `flow:` must reference an existing flow | `LoopFlowExists` |
| `LOOP-002` | ERROR | `break` only valid within a loop's reachable flow graph | `BreakContext` |
| `LOOP-003` | INFO | `break` exits the innermost enclosing loop only | `BreakInnermost` |

### Decision Validation

| Rule | Severity | Description | Alloy Ref |
|------|----------|-------------|-----------|
| `DEC-001` | WARN | Variable decisions should have a `default:` branch | `MissingDefault` |
| `DEC-002` | ERROR | Self-referencing decisions must have at least one non-recursive exit branch | `RetryTermination` |
| `DEC-003` | ERROR | Interactive decisions (with `message:`) must not have `variable:` or `condition:` | `InteractiveForm` |
| `DEC-004` | ERROR | Programmatic decisions must have exactly one of `variable:` or `condition:` | `ProgrammaticForm` |

### Terminal Instructions

| Rule | Severity | Description | Alloy Ref |
|------|----------|-------------|-----------|
| `TERM-001` | INFO | `activity:` terminates the entire activity scope immediately | — |
| `TERM-002` | ERROR | Decision branches rejoin unless they contain a terminal (`break`, `activity:`) | `branchRejoins` |

### Variable Scoping

| Rule | Severity | Description | Alloy Ref |
|------|----------|-------------|-----------|
| `SCOPE-001` | INFO | Resolution order: local flow > loop variable > activity > workflow | `resolve` |
| `SCOPE-002` | ERROR | Boolean algebra expressions must reference resolvable variable names | — |
