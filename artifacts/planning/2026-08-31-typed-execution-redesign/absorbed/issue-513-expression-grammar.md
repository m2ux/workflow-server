## Summary

The definition language has two ways to write a predicate: a short string like `count > 3`, and a
nested block spelling out the same comparison. A migration has been moving the corpus from the second
to the first in stages — plain gates and `&&` compounds in [PR #374](https://github.com/m2ux/workflow-server/pull/374),
then `||`, parentheses and precedence in [#380](https://github.com/m2ux/workflow-server/issues/380).
109 blocks remain in the older form.

An evaluation ran to answer a different question — where else the definition language could carry
expressions in a compact, language-like syntax, since the step gate is the only place that does. The
answer came back mostly negative, and it points at finishing the migration rather than extending it.
Most of what looked like an opportunity for shorthand is either already legal and declined by
authors, structurally forced, or a deliberate rule nobody wrote down. What is genuinely scarce is not
expressiveness but enforceable location: ten of the fifteen rules governing predicates today live in
prose, code comments, or nowhere, where nothing can fail when they are broken.

This issue carries that work: one predicate dialect for both activity and workflow definitions, and
every rule it states given an artifact that fails when it is violated.

## What happens today

**Two dialects that neither contain nor agree with each other.** 281 predicates are written as
strings and 109 as nested blocks. The block form carries presence tests the string form cannot
express; the string form carries a bare-name truth test the block form has no operator for. They also
disagree: each is evaluated by different code that converts non-numbers differently, and of thirteen
predicates written both ways, five returned opposite answers. The bag supplies such values routinely —
95 declarations are list-typed and 50 object-typed, of 657. Nothing computes both answers, so a
disagreement returns an ordinary-looking false with no place to observe it.

**One intent, five different availabilities.** Which predicate an author may write depends on where
they write it. A step gate takes both forms; an exit takes only the string; a checkpoint requires the
block form for an unrelated reason; an action has no gate field at all; a workflow graph edge admits
no predicate. An author who learns one position cannot transfer that knowledge, and a gate cannot move
position without being rewritten or losing capability.

**The predicates that escaped needed a field, not a syntax.** One field is left unconstrained by the
schema, and 37 distinct predicates migrated into it. 33 of those 37 already parse as valid
expressions in the string dialect. They moved because an action has nowhere to put a gate. Only four
values parse under neither form — one presence test and three emptiness tests — and those four are
the entire genuine syntax shortfall the corpus exhibits.

**Authors have already declined brevity.** Where a terser form is legal, shorter, and documented in
the field's own description, explicit comparison appears 272 times against 9. The explicit form fails
closed on a string, a number or a list; the terse one asserts only JavaScript truthiness, and on a
list-typed variable it is constant.

**The workflow tier's blank is a rule.** All 192 graph edges across 17 workflows are bare destination
strings, with no exceptions, because an activity names its own outcomes and the workflow names
destinations — which is what lets an activity be borrowed into any graph. That property is protected
today only by the accident that the declared type cannot hold a predicate, and no test asserts it.

## The fix

**Stage 1 — measure the coercion difference.** Determine which live predicates change answer when the
two number conversions become one. This gates everything that rewrites a predicate, because a rewrite
that flips a gate produces no signal anywhere.

**Stage 2 — settle the grammar.** One dialect, extended to express everything both forms could, plus
the three things neither could say: a postfix presence test, an emptiness test, and a comparison
against another variable. Set membership replaces the repeated alternation chains the corpus writes
by hand. A bare name stops being a predicate and an unquoted bare word on the right of a comparison
stops parsing, both because they are traps rather than brevity.

**Stage 3 — parse at load.** The gate field is an unvalidated string today, so nothing in the type
system, the schema or the build sees an expression. Making it a parsed type — a definition whose gate
does not parse fails to load — reaches every position, including the two the current guard never
covered.

**Stage 4 — remove the second dialect and migrate.** 198 corpus sites and 3 source call sites. The
checkpoint's dependence on field presence is replaced by an explicit marker, and actions gain a typed
gate field, which are the two things that must exist before the block form can go.

**Stage 5 — write the formal artifacts.** A grammar and a constraint model for each tier. The activity
tier needs both; the workflow tier needs mostly the constraint model, because its predicate-free edges
are a property to assert rather than a syntax to describe. The grammar file becomes the source the
parser is generated from, so the specification and the implementation cannot disagree.

**Stage 6 — deliver the parsed form.** Agents evaluate gates, and today they receive the grammar as
prose and interpret expressions by reasoning over it. Once the parse happens at load, the parsed form
travels with the activity and the agent walks a structure instead.

## Why now is cheap

Fifteen of the evaluation's forty-eight findings cease to exist under this design rather than needing
a fix of their own — a finding about how two dialects relate cannot survive there being one. The
earlier stages of the migration already landed the parser work that made compound expressions safe,
so this stage inherits rather than rebuilds it. And the migration is measured rather than estimated:
the sites are enumerated, and the one hazard in rewriting them has a named precondition.

## Scope

- The two predicate forms, their evaluators, and the shared conversion between them
- The gate field's type, and the point at which an expression is parsed
- The positions a predicate may occupy, and what power each position has
- The checkpoint's dismissibility, which currently rides on which field is present
- The generated schemas, and the drift between them and their source
- The four formal artifacts, and what generates or checks each

## Acceptance criteria

- One predicate dialect. No definition file can express a predicate the settled grammar does not
  describe.
- For every rule the grammar states, an artifact fails when that rule is violated. A rule whose only
  home is a description string is rejected.
- The four unparseable values in the unconstrained field parse, and the field's remaining ambiguity is
  closed by giving actions a gate rather than by widening what the field accepts.
- A predicate rewritten during the migration is demonstrably answer-preserving, on the evidence of
  stage 1 rather than on inspection.
- The workflow tier's predicate-free edges are asserted, not merely observed.

## Non-goals

- **Brevity shorthand for the boolean case.** The corpus rejects it 272 to 9, and the terse form is
  less safe than the explicit one.
- **A predicate language for workflow graph edges.** The absence is the rule; the artifacts state it.
- **Conditional dismissibility for checkpoints.** A boolean marker replaces the current coupling; a
  predicate there would re-create the second home for predicates that this work removes.
- The nine workflow-definition defects the same run surfaced. Those concern the machinery that ran the
  evaluation rather than the language it evaluated, and are recorded separately in the same folder.

## Investigation detail

The evaluation, its four analytical dimensions, and the two analysis runs behind them:
**[2026-08-24-shorthand-expression-grammar-for-workflow-yaml](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-24-shorthand-expression-grammar-for-workflow-yaml)**

- [EVALUATION-REPORT.md](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-24-shorthand-expression-grammar-for-workflow-yaml/EVALUATION-REPORT.md) — 47 consolidated findings across consistency, expressiveness, architecture and feasibility, from 54 raised by the two analysis runs.
- [MITIGATION-PLAN.md](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-24-shorthand-expression-grammar-for-workflow-yaml/MITIGATION-PLAN.md) — 48 dispositions, each recording whether it deletes a path, makes a state unrepresentable, or states a rule once; the migration table; and the three named preconditions.
- `consistency/` and `dimensions/` — the underlying analyses, including the adversarial pass that overturned twelve claims of the first and the synthesis that adjudicated between them by re-execution.

Predecessors: the corpus migration tracked by [#338](https://github.com/m2ux/workflow-server/issues/338) W7 and [#189](https://github.com/m2ux/workflow-server/issues/189) C8, delivered in [PR #374](https://github.com/m2ux/workflow-server/pull/374), and the operator work in [#380](https://github.com/m2ux/workflow-server/issues/380).

