# Where a loop keeps its continuation test

Companion to [README.md](README.md), for [#531 W3/W4](https://github.com/m2ux/workflow-server/issues/531).
This resolves the blocker [conversion-trial.md](conversion-trial.md) found: a routine that owns a
loop has nowhere unambiguous to say "repeat while this holds".

Measured on 2026-09-04 against the server at `4740f4d6` and the `workflows` branch at `131e2942`.

> **Landed 2026-09-06, with one deliberate difference.** `continueWhile` carries the continuation
> test, `condition` is not a field of a loop step, no loop in the corpus carries one, and
> `check-loop-shape` enforces the shape. **`breakCondition` was kept rather than deleted**: it is
> now an early exit belonging to item iteration — a `forEach` may stop part way through its
> collection — and the guard rejects it on a `while` or `doWhile`, which already decide each pass in
> `continueWhile`. It remains at zero sites, so the measurement below stands and only the
> disposition changed. The recommendation and the acceptance criteria are corrected in place; gap 4
> of [gap-review.md](gap-review.md) records the pass that found the difference.

**The blocker turns out not to be an ambiguity waiting to bite. It is a live defect: six of the eight
loops that are defined by running their body at least once do not run it at all.** That changes the
argument for fixing it from "a shared definition would propagate a wrong reading" to "the reading is
already wrong, in the corpus, today".

## What a loop step carries

A loop step has five fields that bear on whether and how often it runs.

| Field | What the schema says | forEach (27) | while (10) | doWhile (9) |
|---|---|---|---|---|
| `when` | Inline gate — the step runs when this holds | 12 | 1 | 2 |
| `condition` | Structured gate — the step runs when this holds | **0** | **10** | **9** |
| `breakCondition` | Early exit, evaluated each iteration | 0 | 0 | 0 |
| `over` / `variable` | The collection and the item | 27 | 0 | 0 |
| `maxIterations` | Safety ceiling | 22 | 7 | 8 |

Two things fall out of that table and neither is a matter of opinion.

**The corpus has already partitioned the two meanings.** Not one of the 27 `forEach` loops carries a
`condition`; every one of the 19 `while`/`doWhile` loops does, and in every case its content is a
continuation test — `needs_audit_fixes == true`, `plan_approved == false`,
`awaiting_review == true`. Twelve `forEach` loops gate entry with `when`. Three `while`/`doWhile`
loops carry **both**, and use them exactly this way: `when: is_review_mode != true` is unmistakably
an entry gate and `condition: needs_simplification == true` is unmistakably a continuation test.

So `when` is already the entry gate on every step kind, and `condition` on a loop already means
something `condition` means nowhere else. The change proposed below writes down what authors do; it
does not ask them to do something new.

**`breakCondition` is unexercised.** Zero sites. It is read in exactly one place in the server — the
contract derivation collects its variable references — and by nothing else. The end-to-end walker
never looks at it. That makes it a field free to be given a meaning, which is what happened to it.

## What the readers do with it

Three readers meet a loop's `condition`, and all three read it as an entry gate.

**Delivery.** `src/tools/workflow-tools.ts:1204` computes each step's gate as
`gateAnswer({ when: s.when, condition: s.condition, … })` and combines the two under and-semantics.
For a loop it then narrows the whole body by that verdict before recursing at `:1210`. So a
continuation test decides whether the body's techniques are bundled into the activity delivery.

**The end-to-end walker.** `tests/e2e/walker.ts:490` is
`if (step.condition && !evaluateCondition(step.condition, variables)) continue;` — applied to every
step, and it sits *before* the loop arm at `:495`. A loop whose `condition` is false on arrival is
skipped whole; its body is never walked.

**The contract derivation.** `src/utils/activity-variables.ts:365` collects `condition` references
as reads for every step kind, and the loop arm adds `over` and `breakCondition`. Reads are reads
either way, so this reader is unharmed — but it is the one that would have to learn a new field.

Both evaluators return **false for an unbound read** as well as for a false one, which is stated at
`src/utils/gate-liveness.ts:186-189`.

## What that costs today

### Six of eight do-while loops never run their body

A `doWhile` names one property: the body runs, and *then* the test decides whether to run it again.
Evaluating its `condition` on arrival inverts that.

Evaluating each top-level `while`/`doWhile` loop's condition against the bag as seeded from declared
defaults — the state at the moment the loop is reached, since **eight of the nine `doWhile` loops
have no earlier step in their own activity that writes the variable** — gives:

| | Enters | Skipped |
|---|---|---|
| `while` (10, one nested and not evaluated) | 3 | 6 |
| `doWhile` (9, one nested and not evaluated) | **2** | **6** |

The two `doWhile` loops that do enter, enter by an accident of polarity: both test `== false`
against a variable seeded `false`. Nothing about them is more correct than the six that do not.

The six that do not:

- `plain-language/04-evaluate.yaml` — `evaluate-revise-loop`
- `work-package/04-research.yaml` — `research-reconciliation`
- `work-package/09-lean-coding-audit.yaml` — `simplification-apply-cycle`
- `work-package/10-post-impl-review.yaml` — `review-fix-cycle`
- `work-package/11-validate.yaml` — `fix-revalidate-cycle`
- `work-package/13-submit-for-review.yaml` — `await-review-loop`

The runner record already carries one of these as a known defect, found by walking. It is six.

### Loop bodies are excluded from eager delivery for the wrong reason

Of the 46 loops in the corpus, 16 sit in an activity that appears in the committed delivery baseline.
**Twelve of those 16 have no body step eagerly bundled in any recorded delivery** — six `forEach`,
six `while`/`doWhile`.

The six `forEach` exclusions are ordinary lazy delivery: their `when` reads a flag the same activity
produces, so the gate has no answer yet and the body is fetched step by step instead. That is the
mechanism working.

The six others are excluded because a **continuation test** was consulted at entry. Between them they
carry 17 body steps. Four of the six carry no `when` at all, so under the change below their bodies
become unconditionally eligible for bundling; the other two become eligible whenever the run is not
in review mode.

### And a shared definition would multiply it

This is the part that blocks W4. A routine owning a loop is written once and materialised at every
reference site, so a wrong reading stops being one activity's problem and becomes every referring
activity's. The convergence routine has seven sites.

## The options

**A — Document the overload.** State in the schema that `condition` on a loop step is the
continuation test, and special-case the readers by step kind. No corpus edits.

*Rejected.* It keeps a field whose meaning depends on its parent, which is the trap that produced six
skipped loop bodies, and every reader still needs a `kind === 'loop'` branch. The `doWhile` defect
has to be fixed either way, so the "no edits" saving is smaller than it looks.

**B — Reuse `breakCondition`, inverted.** The field is unused and its shape is right.

*Rejected.* An exit test is the negation of a continuation test, so the migration would negate 19
authored conditions — three of them compound. A mechanical rewrite that inverts a gate is exactly the
change that fails silently, and the field would then be named for the opposite of what the corpus
writes.

**C — Put it on `loopType`.** Not expressible: `loopType` is an enum and a continuation test is an
expression.

**D — Give it its own field.** Recommended, below.

## The recommendation

**Add `continueWhile` to the loop step, forbid `condition` on a loop step, and scope
`breakCondition` to item iteration.** This file first recommended deleting `breakCondition` on the
strength of its zero sites. Scoping it is the better answer, because the two fields then describe
two different questions rather than one field describing none: `continueWhile` decides whether a
repeat-until loop runs again, and `breakCondition` stops a `forEach` part way through a collection.
A guard rule carries the split, below.

```yaml
  - kind: loop
    id: simplification-apply-cycle
    loopType: doWhile
    when: is_review_mode != true        # entry: does this loop run at all
    continueWhile:                      # continuation: does it run again
      type: simple
      variable: needs_simplification
      operator: "=="
      value: true
    maxIterations: 3
```

`loopType` says *when* the test is taken — before the first iteration for `while`, after it for
`doWhile`. `continueWhile` says *what* the test is. `when` says whether the loop is entered at all,
uniformly with every other step kind. `over` and `variable` are `forEach`'s, and so is
`breakCondition`, which stops a walk part way through the collection. `maxIterations` is the
ceiling. Six fields, six jobs, no overlap.

The name is chosen so it reads correctly under both iteration types. `while` collides with
`loopType: while`; `until` inverts the polarity the corpus writes; `continueWhile` states the
condition under which iteration continues, which is what all 19 sites already express.

### The migration is a key rename

`continueWhile` takes the same `Condition` shape the corpus already writes, so all 19 sites change
`condition:` to `continueWhile:` and nothing else. No expression is rewritten, no polarity flips, and
the dialect migration that will eventually move structured conditions to the inline `when` grammar
sweeps this field along with the rest, later and separately.

### Most readers correct themselves

The delivery path needs **no change at all**. It reads `s.condition`, and after the migration a loop
step does not have one — so its gate is `when` alone, which is the entry gate, which is what the
narrowing of its body should have been based on all along. The bug is fixed by the field moving out
from under the reader, not by teaching the reader a special case.

| Reader | Change |
|---|---|
| Delivery gate (`workflow-tools.ts:1204`) | **None.** A loop step no longer carries `condition` |
| Contract derivation (`activity-variables.ts:372`) | Read `continueWhile` in the loop arm, alongside the `breakCondition` read it makes today |
| End-to-end walker (`walker.ts:490`) | The generic skip stops firing on loops. Add: a `while` tests `continueWhile` before walking the body once; a `doWhile` walks it once unconditionally |
| Schema (`activity.schema.ts`) | `continueWhile` added, `condition` omitted from the loop member, `breakCondition` re-described as a `forEach` early exit; regenerate `schemas/*.json` |
| Guards | One new shape rule, below |

The walker change is the smallest one that removes the defect and no larger. Actually **iterating** a
loop is the runner's job and stays out of scope — the walker keeps its single deterministic pass, and
what changes is that a `doWhile` gets that pass instead of nothing.

### One new guard rule

A loop's shape is now checkable, and it was not before:

- `forEach` declares `over` and `variable`, and no `continueWhile`. Its early exit is
  `breakCondition`.
- `while` and `doWhile` declare `continueWhile`, and no `over`, `variable` or `breakCondition` —
  each pass is already decided by the continuation test.
- A `while`/`doWhile` with no `continueWhile` and no `maxIterations` is unbounded — a hard finding.

`condition` on a loop needs no rule: the step kinds are closed objects, so a field outside the
declared set is already a schema error.

## Why now is cheap, and why later is dearer

**Nineteen sites, one key each, and a guard that makes the shape enforceable afterwards.** The whole
surface is enumerated above.

**Every reader that currently misreads the field stops seeing it.** There is no window in which one
reader has been taught the new field and another has not, because the migration and the schema change
land together and the old field ceases to exist.

**The corpus is at its smallest for this.** Nineteen loops today. Every convergence run that becomes
a routine adds a loop to a shared definition, where a later migration would have to reason about
reference sites as well as authored sites.

**And it pays for itself independently of routines.** Six `doWhile` bodies start running. Seventeen
body steps become eligible for eager delivery. One field with two meanings becomes two fields with
one each. None of that needs #531 to have started.

## What it does not fix

**It does not make anything iterate.** The walker still takes one pass and the server still drives no
repetition. This settles *where the continuation test lives* so that a program can eventually read
it; writing the program is the runner's work.

**It does not decide what a skipped body should have done.** Six `doWhile` loops start running bodies
that have never run in a recorded walk. Two of them — the validation fix cycle and the review fix
cycle — carry techniques that write files. The migration should be walked before it is merged, and
any body that turns out to have been dead for a reason should be dispositioned rather than woken up.

**It does not touch `forEach`.** Twenty-seven loops are unaffected, and the assumption routine's loop
is one of them — which is why stage 5 of the proposal is not blocked on any of this.

**It does not settle the dialect.** `continueWhile` takes a structured `Condition` because that is
what the corpus writes. When the two predicate dialects unify, this field migrates with the other 19
structured conditions and not before.

## Acceptance criteria

- [ ] A loop step declares `continueWhile` for its continuation test; `condition` is not a field of a
      loop step; `breakCondition` names the `forEach` early exit and nothing else.
- [ ] All 19 `while`/`doWhile` loops carry their existing condition under the new key, unchanged in
      content and in polarity.
- [ ] The delivery gate for a loop step is its `when` alone, and the six loop bodies excluded by a
      continuation test are eligible for eager bundling on the same terms as any other step.
- [ ] The end-to-end walker walks a `doWhile` body once regardless of its continuation test, and a
      `while` body once when the test holds.
- [ ] A guard rejects a `forEach` carrying `continueWhile`, a `while`/`doWhile` without one, and a
      `while`/`doWhile` with neither a continuation test nor an iteration ceiling.
- [ ] The delivery baseline is re-recorded, and the six newly-walked `doWhile` bodies are reviewed
      rather than accepted by regeneration.
- [ ] The generated JSON schemas match their source.

## What this unblocks

Stage 6 of the routines proposal — #531 W4, the convergence loop — needs a routine to own a `while`
loop, and that becomes expressible the moment `continueWhile` exists. Stage 5, the assumption run,
was never blocked: its loop is a `forEach`.

The sequencing is therefore: this change, then W4. It is independent of W3, and it should be taken
whether or not routines are built at all.
