---
metadata:
  version: 1.0.0
---

## Capability

The language a step's gates and a loop's controls are written in — what an expression means, and how many times a body runs.

## Rules

### gate-evaluation

`when` is one dialect wherever it appears: gating a step, and selecting an activity's exit. The executing agent evaluates it against the variable bag; the server evaluates none.

Operators are `==`, `!=`, `>`, `<`, `>=`, `<=`, unary `!`, `&&`, `||`, parentheses, and a bare name for truthiness. A comparison is a name, an operator and a literal, and binds as one unit, so `!a == b` is `!(a == b)` and a negated left side needs its own parentheses. Precedence over those units, tightest first: `()`, `!`, `&&`, `||`. Mixing `&&` and `||` at one nesting depth requires parentheses.

- A name is a dotted path into the bag. A segment reaching a non-object yields nothing, and a path yielding nothing is falsy.
- `==` and `!=` are identity: the types match or the test is false, so `"5" == 5` is false.
- An unquoted word right of a comparison is a string literal — `a == b` tests `a` against the text `b`, never against the variable `b`.
- A bare name alone holds when its value is truthy.
- `>`, `<`, `>=`, `<=` read both sides as numbers and are false when either side is not a finite one.
- An expression that does not parse is false.

### structured-condition-evaluation

`continueWhile`, `breakCondition` and a checkpoint's `condition` are written structurally: `{ type: simple, variable, operator, value }`, composed under `and`, `or` and `not`. The executing agent evaluates these too.

- `variable` is a dotted path, read as `gate-evaluation` reads one.
- `==`, `!=` and the four ordering operators carry the meanings they carry inline.
- `exists` holds when the value is neither absent nor null; `notExists` is its complement. The form has no truthiness of its own, so a bare name's is stated this way.
- `and` and `or` each take two or more conditions.

On a checkpoint, `condition` is what makes the gate dismissible through `respond_checkpoint { condition_not_met }`; `when` there decides only whether the step is reached.

### loop-control

These fields decide whether and how often a body runs, one question each.

- `when` decides whether the loop is entered at all — the entry gate every step kind carries. A loop carries no `condition`.
- `loopType` says when the continuation test is taken: `while` before the first pass, `doWhile` after it. `forEach` walks a collection and takes no such test.
- `continueWhile` is that test, and the body runs again while it holds. Every `while` and `doWhile` declares it and no `forEach` does, iteration there being bounded by the collection.
- `over` names the collection a `forEach` walks — a plain bag reference such as `implementation_plan.tasks`, read as a name rather than evaluated. `variable` names what each element binds to for its pass: an ordinary write into the shared bag, readable inside the body and after the loop.
- `breakCondition` is read before each item and stops iteration when it holds.
- `maxIterations` is the ceiling on passes, and the executing agent enforces it.
