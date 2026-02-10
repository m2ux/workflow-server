/**
 * Activity Semantic Constraints
 * Version: 3.0.0
 * Date:    2026-02-10
 *
 * Alloy specification defining structural and semantic constraints for
 * activity files. Covers provenance, symbol uniqueness, flow structure,
 * loop behavior, decision validation, terminal semantics, and variable
 * scoping.
 *
 * Reference: .engineering/artifacts/planning/2026-02-10-toon-v3-schema-specification/
 */

module activity

-- ===================================================================
-- Signatures
-- ===================================================================

sig Id {}
sig String {}
sig Value {}
sig Bool {}
sig BoolExpr {}
sig FlowContext {}

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

-- ===================================================================
-- Helper functions (abstract — implemented by validator)
-- ===================================================================

-- Look up a skill definition by ID
fun lookupSkillDef[id: Id]: lone SkillDef {
  { d: SkillDef | d.id = id }
}

-- Compute the set of variable names in scope at a given step
-- Resolution order: local flow > loop variable > activity > workflow
fun resolve[name: Id, context: FlowContext]: lone Value {
  localScope[context, name] != none implies localScope[context, name]
  else loopScope[context, name] != none implies loopScope[context, name]
  else activityScope[context, name] != none implies activityScope[context, name]
  else workflowScope[context, name]
}

-- Terminal flow items
fun terminals: set FlowItem {
  Break + ActivityTransition
}

-- ===================================================================
-- Provenance Constraints
-- ===================================================================

-- PROV-001: Every required skill input resolves from the scoping chain
-- at the step's invocation point.
-- Severity: ERROR
fact InputProvenance {
  all a: Activity, s: a.steps | some s.skill implies
    let def = lookupSkillDef[s.skill.id] |
      all i: elems[def.declaredInputs] | i.required = True implies
        i.name in resolve[scopeAt[a, s]]
}

-- PROV-002: Cross-activity references in skill input declarations use
-- qualified NN.step-id.name form.
-- Severity: ERROR
fact QualifiedCrossRef {
  all d: SkillDef, i: elems[d.declaredInputs] |
    isCrossActivity[i.name] implies isQualified[i.name]
}

-- ===================================================================
-- Symbol Uniqueness Constraints
-- ===================================================================

-- SYM-001: Step IDs unique within activity
-- Severity: ERROR
fact StepUniqueness {
  all a: Activity, disj s1, s2: a.steps | s1.id != s2.id
}

-- SYM-002: Decision IDs unique within activity
-- Severity: ERROR
fact DecisionUniqueness {
  all a: Activity, disj d1, d2: a.decisions | d1.id != d2.id
}

-- SYM-003: Loop IDs unique within activity
-- Severity: ERROR
fact LoopUniqueness {
  all a: Activity, disj l1, l2: a.loops | l1.id != l2.id
}

-- SYM-004: Flow IDs unique within activity
-- Severity: ERROR
fact FlowUniqueness {
  all a: Activity, disj f1, f2: a.flows | f1.id != f2.id
}

-- ===================================================================
-- Flow Constraints
-- ===================================================================

-- FLOW-001: Every activity has a main flow
-- Severity: ERROR
fact MainFlowExists {
  all a: Activity | some f: a.flows | f.id = "main"
}

-- FLOW-002: Every named flow is referenced by a loop, decision branch, or flow
-- Severity: WARN
fact FlowReachability {
  all a: Activity, f: a.flows | f.id = "main" or
    f.id in a.loops.flow +
            { id: Id | some b: a.decisions.branches | FlowRef in elems[b.items] and id = FlowRef.ref } +
            { id: Id | some f2: a.flows | FlowRef in elems[f2.items] and id = FlowRef.ref }
}

-- FLOW-003: Flow references resolve to existing flows
-- Severity: ERROR
fact FlowRefValid {
  all a: Activity, f: a.flows, i: elems[f.items] |
    i in FlowRef implies i.ref in a.flows.id
}

-- ===================================================================
-- Loop Constraints
-- ===================================================================

-- LOOP-001: Loop flow references an existing flow
-- Severity: ERROR
fact LoopFlowExists {
  all a: Activity, l: a.loops | l.flow in a.flows.id
}

-- LOOP-002: break only appears within a loop's reachable flow graph
-- Severity: ERROR
fact BreakContext {
  all a: Activity, f: a.flows, i: elems[f.items] |
    i in Break implies f.id in reachableFromLoop[a]
}

-- LOOP-003: break exits innermost enclosing loop only
-- Severity: INFO
fact BreakInnermost {
  all b: Break | b.target = innermost[b, Loop]
}

-- ===================================================================
-- Decision Constraints
-- ===================================================================

-- DEC-001: Variable decisions should have a default branch
-- Severity: WARN (not ERROR — runtime treats missing match as pass-through)
pred MissingDefault {
  some d: Decision | some d.variable and no d.defaultBranch
}

-- DEC-002: Self-referencing decisions have at least one non-recursive exit
-- Severity: ERROR
fact RetryTermination {
  all a: Activity, d: a.decisions |
    d.id in d.branches.items.ref implies
      some b: d.branches | d.id not in reachableRefs[b]
}

-- DEC-003: Interactive decisions have message, no variable/condition
-- Severity: ERROR
fact InteractiveForm {
  all d: Decision | some d.message implies
    no d.variable and no d.condition
}

-- DEC-004: Programmatic decisions have variable or condition, not both
-- Severity: ERROR
fact ProgrammaticForm {
  all d: Decision | no d.message implies
    (some d.variable and no d.condition) or
    (no d.variable and some d.condition)
}

-- ===================================================================
-- Terminal Constraints
-- ===================================================================

-- TERM-001: activity: is valid anywhere and terminates activity scope
-- (No structural constraint — semantic: execution halts immediately)

-- TERM-002: Branches rejoin unless they contain a terminal
-- Severity: ERROR
pred branchRejoins[b: Branch] {
  no (elems[b.items] & terminals)
}

-- ===================================================================
-- Variable Scoping
-- ===================================================================

-- Resolution order (innermost to outermost):
-- 1. Local flow scope  — outputs from steps earlier in the current flow
-- 2. Loop variable     — the iteration variable of the enclosing loop
-- 3. Activity-level    — declared inputs: and all step outputs within the activity
-- 4. Workflow-level    — variables set by the workflow (e.g., mode)

-- SCOPE-001: Resolution follows the defined precedence
-- SCOPE-002: Boolean algebra expressions must reference resolvable variable names
