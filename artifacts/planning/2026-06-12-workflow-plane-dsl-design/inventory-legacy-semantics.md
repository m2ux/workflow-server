# Legacy Activity Language (Orchestra v3.0.0) — Exhaustive Semantics Inventory

Sources (all read in full, 2026-06-12):

- SPEC — `/home/mike1/projects/main/workflow-server/docs/orchestra-specification.md` (917 lines; v1.0.0, dated 2026-02-10, Status: Draft)
- EBNF — `/home/mike1/projects/main/workflow-server/grammar/activity.ebnf` (129 lines; grammar v3.0.0)
- GRAMMAR-README — `/home/mike1/projects/main/workflow-server/grammar/README.md` (37 lines)
- ALS — `/home/mike1/projects/main/workflow-server/constraints/activity.als` (279 lines; v3.0.0)
- ALS-README — `/home/mike1/projects/main/workflow-server/constraints/README.md` (45 lines)

`constraints/` directory contents: only `README.md` and `activity.als`. `workflow.als`, `skill.als`, `resource.als` listed as TBD (ALS-README:13-18). Likewise `grammar/` has only `activity.ebnf` defined; `workflow.ebnf`, `skill.ebnf`, `resource.ebnf` TBD (GRAMMAR-README:13-18).

Scope note: Orchestra fully defines only the **Activity** primitive. Workflow, Technique, Resource remain legacy schemas (`schemas/*.schema.json`) — SPEC:19-28, SPEC §2 (line 36-38), §4 (899-911), §5 (915-917). Design goal: a **deterministic landscape** — same definition + same state ⇒ same execution path for any conforming agent (SPEC:15, 30-32). Three primitives (steps, decisions, loops) composed by flows; the execution path is explicit in the file, never reconstructed by the agent (SPEC:32).

---

## 1. Top-level activity structure

```ebnf
Activity   ::= Header InputsDecl? Primitives Flows        (EBNF:15)
Header     ::= 'id:' Id NL 'version:' Version NL 'description:' STRING NL   (EBNF:17-19)
InputsDecl ::= 'inputs:' IdList NL                        (EBNF:21)
Primitives ::= Steps? Decisions? Loops?                   (EBNF:23)
```

- Header is mandatory: `id`, semver `version` (`DIGIT+ '.' DIGIT+ '.' DIGIT+`, EBNF:121), quoted `description`.
- `inputs:` is optional; comma-separated `IdList` of bare `Id` or `QualifiedId` (EBNF:120). Semantics: external data the activity needs — only data **not produced within the activity's own flow** (SPEC:695-697). Activity-level inputs participate in scope level 3 (see §8).
- All three primitive sections are optional; `flows:` is mandatory (and FLOW-001 requires `main`).
- Indentation is fixed 2-space units: `INDENT`=2sp, `INDENT2`=4sp, `INDENT3`=6sp (EBNF:125-127). Alloy signature: `Activity { id, activityInputs: set Id, steps, decisions, loops, flows }` (ALS:27-34).

## 2. Steps (SPEC §3.1.1, lines 48-101; EBNF:25-36; ALS:36-45)

```ebnf
Steps    ::= 'steps:' NL StepDef+
StepDef  ::= INDENT Id ':' NL StepBody
StepBody ::= INDENT2 'description:' STRING NL SkillRef?
SkillRef ::= INDENT2 'skill:' Id NL
```

A step is a **unit of work**. Two kinds:

1. **Trivial step** — `description:` only, no `skill:`. Performed directly by the agent (SPEC:50; EBNF comment 26-29). Alloy: `Step { id: one Id, skill: lone SkillRef }` (ALS:36-39).
2. **Technique-backed step** — has `skill:` naming a technique by its `::` path, resolved via `get_technique(step_id)`. Resolution: same-workflow path is implicit; an unqualified path resolves **current-workflow-first, then falls back to `meta`** (SPEC:50). NOTE: the field keyword is literally `skill:` (legacy naming retained from the skills era); SPEC prose says "technique", grammar/Alloy say `skill`/`SkillRef`/`SkillDef`.

**Input/output resolution** (SPEC:52): the technique definition (separate markdown file) declares inputs and output(s) by name. At runtime the agent resolves each input by **pattern-matching names against the 4-level scoping chain** (local flow > loop variable > activity > workflow). Outputs are **injected into the current scope after execution** (and accumulate across loop iterations — see SPEC:719 `elicitation-log` example). `SkillDef { id, declaredInputs: seq InputDecl, declaredOutputs: seq OutputDecl, rules: set String }`; `InputDecl { name (bare or qualified NN.step.name), required: Bool, default: lone Value }`; `OutputDecl { name }` (ALS:47-62).

**Rules live in techniques, never on steps** (SPEC:54): steps carry no rules; behavioural constraints belong in the technique definition and are pulled into the activity's bundled response when referenced. Steps stay pure references; rules stay co-located with the procedural knowledge enforcing them.

**Deterministic vs dynamic questions** (SPEC:56): fixed-option questions = interactive decisions; dynamic questions (content/phrasing/follow-up depend on runtime context) = technique-backed steps whose technique declares its own context inputs and produces structured outputs, resolved from the environment automatically.

## 3. Decisions (SPEC §3.1.2, lines 103-227; EBNF:38-69; ALS:64-76)

A decision is a **branch point**: evaluates state, routes execution to one of several branches. Alloy: `Decision { id, message: lone String, variable: lone Id, condition: lone BoolExpr, branches: set Branch, defaultBranch: lone Branch }`; `Branch { key: one Id, items: seq FlowItem }` (ALS:64-76).

### 3a. Interactive decisions
- Discriminator: presence of `message:` (DEC-003 forbids `variable:`/`condition:` alongside it).
- Agent **presents the message to the user, offers the branches as options, and blocks for a response**. Branches are the user's choices (SPEC:107). Branch keys are author-chosen `Id`s at INDENT2; each may carry an optional `FlowFragment` (EBNF:56-57, 67).
- **Branchless interactive decision** (`message:` with zero branch keys, `Branch*` allows it): a **blocking acknowledgment gate** — agent waits for the user, then continues (SPEC:116; example `document-ready` SPEC:188-190).
- Message text may interpolate scope variables with `{name}` (example `"Domain '{current-domain}' complete."` SPEC:792 — interpolation shown by example only, not in grammar).

### 3b. Programmatic decisions — `variable:` (multi-way match)
- No `message:`. `variable:` names a variable (bare or qualified, e.g. `01.check-issue.issue-platform`, SPEC:202) resolved via the scoping chain.
- Branch keys at INDENT3 are **literal match values** (SPEC:110); one or more `VarBranch`, plus optional `DefaultBranch ::= 'default:' NL FlowFragment` (EBNF:59-61, 68-69 — note `default:` requires a non-empty fragment per grammar).
- **Default handling** (SPEC:121): validator **WARNS if `default:` absent** (DEC-001). At runtime, an unmatched value with no default is treated as a **pass-through** (execution continues after the decision).

### 3c. Programmatic decisions — `condition:` (boolean)
- No `message:`. `condition:` holds a boolean-algebra expression; branches are exactly `true:` and `false:` at INDENT3 (EBNF:63-65). `true:` is mandatory; `false:` optional in the canonical grammar (`(INDENT3 'false:' NL FlowFragment)?`, EBNF:65 and SPEC:396-398) — the inline SPEC §3.1.2 EBNF (SPEC:133-135) shows both required; the standalone grammar file is more permissive.
- Boolean algebra (SPEC:119; EBNF:102-113): operators `==`, `!=`, `&&`, `||`, `!`, parentheses for grouping. Precedence encoded in grammar: `||` lowest (BoolOr), then `&&` (BoolAnd), then unary `!`/parens/comparison. Comparisons are `Id ('==' | '!=') Value` where `Value ::= STRING | true | false | null | NUMBER` (EBNF:113, 117). Operands resolve via the scoping chain. No `<`/`>`/arithmetic — equality/inequality only.

### 3d. Branch behavior (applies to all decision forms; SPEC:113-117)
- **Rejoin-unless-terminal**: branches rejoin the flow after the decision unless they contain a terminal instruction (`break` or `- activity:`) — TERM-002; `terminals = Break + ActivityTransition` (ALS:119-121, 262-266).
- **Empty branch** (key with no children): implicit pass-through; execution falls through to rejoin (SPEC:115; example `skip-discussion:` SPEC:758).
- **Self-referencing retry**: a branch may reference its own decision (`- decision: <self>`) to form a retry loop; validator must confirm **at least one branch does not recurse** (exit path exists) — DEC-002 (SPEC:117; example `jira-comment-review` SPEC:771-777). While-like behavior is achieved exclusively through decision self-reference (no while loop exists; EBNF:72-73, SPEC:231).
- Branch bodies are `FlowFragment`s, i.e. inline sequences of any `FlowItem` (steps, decisions, loops, flow refs, messages, activity transitions, break).

## 4. Loops (SPEC §3.1.3, lines 229-278; EBNF:71-81; ALS:78-84)

```ebnf
LoopBody ::= 'type: forEach' NL 'variable:' Id NL 'over:' Id NL
             ('maxIterations:' NUMBER NL)? 'flow:' Id NL
```

- **Only `forEach` is supported** — `type: forEach` is a literal token in the grammar (EBNF:77). No while/until/repeat. While-like behavior = decision self-reference (SPEC:231).
- `variable:` — the iteration variable name, bound per-iteration (scope level 2).
- `over:` — name of the collection variable iterated, resolved via the scoping chain.
- `maxIterations:` — optional NUMBER iteration cap. Alloy: `maxIterations: lone Int` (ALS:82). No semantics beyond a cap are specified (no overflow behavior defined in spec).
- `flow:` — names the flow executed once per iteration (the loop body); must exist (LOOP-001).
- **`break`** inside a loop's flow (direct or nested) exits the **innermost containing loop only** and **resumes the parent flow after the loop reference**; break does **not** propagate to outer loops (SPEC:233; LOOP-003 `BreakInnermost`, ALS:216-220). Valid only within a loop's reachable flow graph (LOOP-002).
- **`- activity:`** inside a loop's flow is a **layered terminal**: exits the loop, the flow, and the entire activity immediately (SPEC:235; TERM-001).
- Alloy: `Loop { id, variable: one Id, over: one Id, maxIterations: lone Int, flow: one Id }` (ALS:78-84).

## 5. Flows (SPEC §3.1.4, lines 280-350; EBNF:83-100; ALS:86-98)

- A flow is a **named, ordered sequence of primitive references** — the composition layer stitching steps, decisions, loops, messages, and other flows into deterministic execution order (SPEC:282).
- **Every activity must have a `main` flow** — the entry point (FLOW-001). Additional named flows are referenced by loops (`flow:`) or decision branches / other flows (`- flow:`) (SPEC:284); unreferenced named flows are orphans (FLOW-002 WARN).
- Seven `FlowItem` kinds (EBNF:92-98; ALS:91-98):
  | Item | Semantics |
  |---|---|
  | `- step: Id` | Execute the named step (StepRef) |
  | `- decision: Id` | Evaluate the named decision (DecisionRef) |
  | `- loop: Id` | Run the named loop (LoopRef). Also usable inside a branch to restart/re-enter a loop (example `revisit:` SPEC:794-795) |
  | `- flow: Id` | Inline-invoke another named flow (FlowRef); must resolve (FLOW-003). Special form `- flow: continue` = explicit "proceed to next item" — readability sugar in decision branches, **functionally equivalent to an empty branch / pass-through** (SPEC:292) |
  | `- message: STRING` | Inline string presented to the user — no separate declaration; entry/exit notifications or mid-flow status (SPEC:286; MessageItem) |
  | `- activity: Id` | **Activity transition terminal**: transition to the named activity, exiting the current activity entirely (SPEC:288; layered terminal w.r.t. loops/flows, SPEC:235; TERM-001) |
  | `- break` | Exit innermost enclosing loop (SPEC:290; LOOP-002/003) |
- `FlowFragment` (decision-branch bodies) admits the identical `FlowItem` set (EBNF:100).

## 6. Inputs declaration & qualified cross-activity references

- `inputs: a, b, 01.create-issue.issue-number` — comma-separated, mixing bare and qualified ids (EBNF:21, 120; SPEC:697).
- `QualifiedId ::= DIGIT+ '.' Id '.' Id` = `NN.step-id.name` — activity ordinal, producing step id, output name (EBNF:119). Used for cross-activity references in activity `inputs:` and in technique input declarations (PROV-002 requires the qualified form for any cross-activity ref; ALS:137-143). Example resolution comment: `issue-number resolves from activity 01 — technique qualifies as 01.create-issue.issue-number` (SPEC:100). `variable:` decisions may also match directly on a qualified id (SPEC:202, 762).

## 7. Lexical / token rules (EBNF:115-129)

- `Id ::= LETTER_LC (LETTER_LC | DIGIT | '-')*` — kebab-case, must start lowercase letter.
- `Value ::= STRING | 'true' | 'false' | 'null' | NUMBER`; `STRING ::= '"' [^"]* '"'` (no escapes defined); `NUMBER ::= DIGIT+` (non-negative integers only); `Version ::= D+.D+.D+`.
- Fixed 2/4/6-space indentation levels; `NEWLINE ::= '\n'`.

## 8. Variable scoping — 4-level chain (SPEC §3.3.7, lines 668-684; ALS:109-116, 268-279)

Resolution order, innermost to outermost (first hit wins):

1. **Local flow scope** — outputs of steps earlier in the current flow.
2. **Loop variable** — iteration variable of the enclosing loop.
3. **Activity-level** — declared `inputs:` plus **all step outputs within the activity**.
4. **Workflow-level** — variables set by the workflow (e.g. `mode`; example decision SPEC:222-227, 746-751).

Alloy `resolve` is a cascading lookup: local, else loop, else activity, else workflow (ALS:111-116). The chain governs: technique input resolution (PROV-001), `variable:` decision operands, boolean-condition operands (SCOPE-002), and loop `over:` collections.

## 9. Terminal semantics summary

- `- break` — terminates **innermost loop only**; control resumes in the parent flow **after** the loop reference.
- `- activity: Id` — terminates loop + flow + activity (layered); execution halts in this activity immediately and transitions to the named activity (TERM-001 "valid anywhere and terminates activity scope", ALS:259-260).
- Everything else rejoins: decision branches without a terminal rejoin the containing flow; empty branch / unmatched-no-default / `- flow: continue` are all pass-throughs.

## 10. Validation rules — complete catalog

Severities (ALS-README:38-44): **ERROR** = validation fails, must fix before execution; **WARN** = flagged during authoring, does not block execution; **INFO** = documentation, clarifies expected behavior.

| ID | Severity | Meaning | Alloy ref (ALS lines) | Spec |
|---|---|---|---|---|
| PROV-001 | ERROR | Every **required** technique input (declared in technique def) must resolve from the scoping chain at the step's invocation point | `InputProvenance` (127-135) | SPEC:846 |
| PROV-002 | ERROR | Cross-activity references in technique input declarations must use qualified `NN.step-id.name` form | `QualifiedCrossRef` (137-143) | SPEC:847 |
| SYM-001 | ERROR | Step IDs unique within activity | `StepUniqueness` (149-153) | SPEC:853 |
| SYM-002 | ERROR | Decision IDs unique within activity | `DecisionUniqueness` (155-159) | SPEC:854 |
| SYM-003 | ERROR | Loop IDs unique within activity | `LoopUniqueness` (161-165) | SPEC:855 |
| SYM-004 | ERROR | Flow IDs unique within activity | `FlowUniqueness` (167-171) | SPEC:856 |
| FLOW-001 | ERROR | Every activity must have a `main` flow | `MainFlowExists` (177-181) | SPEC:862 |
| FLOW-002 | WARN | Every non-main named flow must be referenced by a loop, decision branch, or flow (no orphans) | `FlowReachability` (183-190) | SPEC:863 |
| FLOW-003 | ERROR | Flow references (`- flow:` items / loop `flow:`) must resolve to existing flow IDs | `FlowRefValid` (192-197) | SPEC:864 |
| LOOP-001 | ERROR | Loop `flow:` must reference an existing flow | `LoopFlowExists` (203-207) | SPEC:870 |
| LOOP-002 | ERROR | `break` only valid within a loop's reachable flow graph | `BreakContext` (209-214) | SPEC:871 |
| LOOP-003 | INFO | `break` exits the innermost enclosing loop only | `BreakInnermost` (216-220) | SPEC:872 |
| DEC-001 | WARN | `variable:` decisions should have a `default:` branch (runtime treats missing match as pass-through, hence WARN not ERROR) | `MissingDefault` pred (226-230) | SPEC:878 |
| DEC-002 | ERROR | Self-referencing decisions must have at least one non-recursive exit branch (`d.id not in reachableRefs[b]` for some branch — transitive, not just direct) | `RetryTermination` (232-238) | SPEC:879 |
| DEC-003 | ERROR | Interactive decisions (with `message:`) must not have `variable:` or `condition:` | `InteractiveForm` (240-245) | SPEC:880 |
| DEC-004 | ERROR | Programmatic decisions (no `message:`) must have **exactly one** of `variable:` / `condition:` | `ProgrammaticForm` (247-253) | SPEC:881 |
| TERM-001 | INFO | `- activity:` is valid anywhere and terminates the entire activity scope immediately | comment only (259-260) | SPEC:887 |
| TERM-002 | ERROR | Decision branches rejoin unless they contain a terminal (`break`, `activity:`); `terminals = Break + ActivityTransition` | `branchRejoins` pred + `terminals` fun (119-121, 262-266) | SPEC:888 |
| SCOPE-001 | INFO | Resolution order: local flow > loop variable > activity > workflow | `resolve` fun (109-116, 278) | SPEC:894 |
| SCOPE-002 | ERROR | Boolean algebra expressions must reference resolvable variable names | comment only, no Alloy fact (279) | SPEC:895 |

No additional rule IDs exist in either source — the .als and the spec §3.5 tables enumerate exactly these 20 (PROV×2, SYM×4, FLOW×3, LOOP×3, DEC×4, TERM×2, SCOPE×2). DEC-002's `RetryTermination` and FLOW-002's reachability are the only rules requiring transitive-closure analysis; PROV-001 requires cross-file analysis (technique definitions), and TERM-002/LOOP-002/003 require flow-graph context. SCOPE-002 and TERM-001/LOOP-003/SCOPE-001 have no executable Alloy fact (semantic/informational).

## 11. Constructs validated by Alloy abstract helpers (validator-implemented, ALS:100-121)

`lookupSkillDef[id]` (technique lookup by id), `resolve[name, context]` (4-level cascade), `terminals` (Break + ActivityTransition), plus undefined-in-Alloy helpers referenced by facts: `scopeAt[a, s]`, `isCrossActivity`, `isQualified`, `reachableFromLoop[a]`, `innermost[b, Loop]`, `reachableRefs[b]`, `elems[seq]`. These mark the contract surface a TypeScript validator must implement.

## 12. Cross-cutting facts relevant to the DSL redesign

- Field keyword for technique binding is the legacy `skill:` (grammar/Alloy use Skill\* names throughout) while prose has migrated to "technique" — naming debt to resolve in the new DSL.
- Step bindings are **name-coupled and implicit**: no explicit wiring of inputs/outputs at the step site; everything resolves by name through the scope chain (the thing the generated TS technique contracts in the new design make type-checkable).
- Decision form is discriminated structurally (`message` vs `variable` vs `condition`), enforced by DEC-003/004 — maps naturally to a TS discriminated union.
- `- flow: continue` is reserved-word-by-convention (an `Id` value with special semantics), as is branch key `default:` and flow id `main` — three magic strings in the legacy language.
- The grammar permits a `condition:` decision with `true:` only (EBNF:65); the spec's inline EBNF (SPEC:133-135) requires both — a spec-internal inconsistency to resolve in the successor.
- Message interpolation `{var}` appears in examples (SPEC:792) but is absent from STRING grammar — undocumented feature.
- `NUMBER` is unsigned-integer only; `Value` has no float/array/object forms; collections only enter via `over:` referencing a scope variable.
