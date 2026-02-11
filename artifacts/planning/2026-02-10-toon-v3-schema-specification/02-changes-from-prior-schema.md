# Changes from Prior Schema

This document captures the differences between the prior activity schema and Compose, along with the design decisions that drove each change.

## Summary of Changes

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

## Design Decisions

Each edge case encountered during schema design was resolved through a structured decision process. These decisions define the behavioral semantics of the Compose activity language.

| # | Edge Case | Decision | Rationale |
|---|-----------|----------|-----------|
| 1 | Branch rejoin | Branches rejoin the parent flow after the decision unless they contain a terminal instruction (`break`, `activity:`) | Matches flowchart semantics — diamond nodes reconverge |
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
