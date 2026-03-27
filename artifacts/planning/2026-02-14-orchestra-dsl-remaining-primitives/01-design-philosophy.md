# Design Philosophy — Orchestra DSL Remaining Primitives

| | |
|---|---|
| **Issue** | [#45](https://github.com/m2ux/workflow-server/issues/45) |
| **Branch** | `feat/orchestra-dsl-remaining-primitives` |
| **Date** | 2026-02-14 |

---

## 1. Problem Statement

The Orchestra DSL specification (`docs/orchestra-specification.md`) defines formal grammar (EBNF) and semantic constraints (Alloy-style) only for the **activity** primitive (section 3, ~800 lines). The four remaining primitives each have JSON schemas but lack the corresponding Orchestra grammar, constraints, validation rules, and examples:

| Primitive | Schema | Lines | Spec Status |
|-----------|--------|-------|-------------|
| **Workflow** | `workflow.schema.json` | 174 | Section 2 — single-line TBD stub |
| **Skill** | `skill.schema.json` | 493 | Section 4 — single-line TBD stub |
| **Condition** | `condition.schema.json` | 119 | No section exists |
| **State** | `state.schema.json` | 410 | No section exists |

**Impact**: Without formal grammar and constraints for these primitives:
- Validation tooling cannot verify workflow, skill, condition, or state definitions
- Agent interpretation of these primitives relies on implicit JSON schema conventions rather than an explicit, deterministic specification
- Cross-primitive references (e.g., workflow referencing activity IDs, conditions referencing declared variables) have no formal verification mechanism
- The specification is incomplete — the overview (section 1) promises grammar for four primitives but delivers only one

## 2. Classification

**Type**: Inventive goal — extending the specification to cover new primitives with formal grammar productions and constraint definitions. This is not fixing a defect or implementing a known solution; it requires designing new language constructs that are consistent with the existing activity grammar while addressing each primitive's distinct semantics.

**Problem category**: Specification design / DSL extension

## 3. Complexity Assessment

**Rating**: Complex

Four distinct primitives, each with its own semantic character:

- **Workflow** — The orchestration layer. Defines metadata, variables (typed, with defaults and required flags), execution modes (activation variables, recognition patterns, skip lists, defaults), artifact locations (path patterns with variable interpolation), and activity sequencing (initial activity pointer). Key design questions: how does mode activation interact with activity sequencing? How are variable scoping rules expressed at the workflow level?

- **Skill** — The richest primitive (493-line schema). Defines agent capabilities with protocol steps, tool definitions (when/params/returns/next/action), inputs (id, required, default), outputs (id, components, artifact persistence), rules, interpretation guidance (transitions, checkpoints, decisions, loops, resources, templates), execution patterns, error definitions with recovery, and resumption strategies. Key design question: which fields are core DSL constructs vs. runtime guidance that should remain outside the grammar?

- **Condition** — Recursive boolean algebra. Four forms: simple comparison (variable + operator + value, with 8 operators including exists/notExists), AND (2+ sub-conditions), OR (2+ sub-conditions), NOT (single sub-condition). The activity grammar already has inline boolean expressions (`BoolExpr`); the condition schema defines a structured, composable counterpart used in transitions and decisions. Key design question: how does the structured condition relate to the inline `BoolExpr` in activity decisions?

- **State** — The runtime execution model. Tracks workflow identity and versioning, temporal markers (started/updated/completed), position (current activity + step), completion tracking (activities, steps), checkpoint responses (with effects: variables set, transitions, skips), decision outcomes, active loop stack (with iteration tracking), variable values, chronological history (20 event types), status lifecycle (6 states), workflow nesting (parent references with return-to, triggered child references with status). Key design question: how much of state is DSL-specifiable vs. purely runtime?

## 4. Workflow Path

**Selected**: Full workflow — elicitation + research before planning.

**Rationale**: The skill and state primitives are sufficiently complex that requirements need clarification before grammar design:

- **Elicitation needed**: Which skill schema fields are core DSL constructs (must appear in grammar) vs. optional runtime guidance? How should the state primitive relate to the DSL — is it a first-class specifiable construct or a runtime artifact with a defined schema? How do cross-primitive references (workflow→activity, condition→variable, state→workflow) compose?

- **Research needed**: Reviewing DSL specification patterns (how other formal grammars handle recursive constructs, state machines, capability declarations) will improve grammar quality. Understanding Alloy modeling conventions for runtime state vs. static structure will inform the constraint design.

## 5. Constraints

1. **Schema alignment**: The Orchestra grammar for each primitive must be consistent with its existing JSON schema. Fields, types, and required/optional status must match.
2. **Pattern consistency**: Each primitive section must follow the pattern established in section 3 (Activity): primitives → EBNF grammar → Alloy-style constraints (signatures + facts/predicates) → validation rules table → complete example.
3. **Cross-primitive composition**: The grammar must compose across primitives — workflows reference activities, activities reference skills, decisions evaluate conditions, state tracks all of the above.
4. **Resource deferral**: The Resource primitive (section 5) can remain TBD. It is a reference material container without complex semantic behavior and is out of scope for this work package.
5. **Backward compatibility**: The existing activity grammar (section 3) must not be modified. New grammar productions extend, not replace.

## 6. Success Criteria

- [ ] Each of the four primitives has an EBNF grammar section in the specification
- [ ] Each primitive has Alloy-style semantic constraints (signatures + facts/predicates)
- [ ] Each primitive has a validation rules table (Rule ID, Severity, Description, Alloy Ref)
- [ ] Each primitive has at least one complete, annotated example
- [ ] Cross-primitive constraints are defined (workflow→activity, condition→variable, state→workflow/activity)
- [ ] The composed grammar forms a complete, parseable DSL specification
