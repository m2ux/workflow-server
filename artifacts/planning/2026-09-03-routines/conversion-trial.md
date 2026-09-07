# A conversion, run for real

Companion to [README.md](README.md), for [#531 W3/W4](https://github.com/m2ux/workflow-server/issues/531)
and the originating [#520](https://github.com/m2ux/workflow-server/issues/520).

The proposal specifies a construct. This is what happened when one real activity and the technique
it binds were actually converted to it. Twelve edges surfaced. Two are blockers, four change the
specification, and one of them — what materialisation *is* — is a different mechanism from the one
the proposal describes.

The conversion artifacts are in [conversion/](conversion/) and are simulated: they are not in the
corpus and nothing has been changed under `workflows/`. Measured on 2026-09-04 against the server at
`4740f4d6` and the `workflows` branch at `131e2942`.

> **The technique converted here was deleted on 2026-09-06**, its loop written onto activity steps
> at all seven sites. **Twelve of the thirteen findings below are findings about the construct** —
> nesting, substitution, output binding, no free variables, capability parameters, the continuation
> field — and each one stands, several having since been executed. What does not carry forward is the
> **signature**: the artifacts parameterise seven values because the prose forwarded seven, where
> the landed loop block parameterises three and remaps four outputs over neutral names. Two of the
> artifacts' four output ids — `residue_flag` and `residue_collection` — are shapes
> `boolean-id-shape` and `collection-id-shape` reject, and the corpus has already replaced all four.
> **Re-derive the signature from the landed block before implementing against these files**;
> [gap-review.md](gap-review.md) carries the comparison.

## Choosing the candidate

Every technique file's `## Protocol` section was scored for control-flow vocabulary — repetition,
branching, and links naming another technique — and joined to how many activity step sites bind it.
Twenty-five techniques carry iteration vocabulary and are bound at a step. The head of the list:

| Sites | Iteration terms | Branch terms | Prose links | Technique |
|---|---|---|---|---|
| 5 | 6 | 11 | 4 | `verify-sub-agent-output` |
| **7** | **3** | **4** | **0** | **`analyse-challenge::run-loop`** |
| 8 | 2 | 3 | 2 | `review-assumptions::interview` |
| 2 | 4 | 15 | 2 | `apply-checklist` |
| 2 | 4 | 2 | 6 | `scan-storage-lifecycle` |

`analyse-challenge::run-loop` was chosen on three grounds and not on its score.

**Its Capability sentence is a loop.** "Parameterized analyse–challenge–combine iterations until
agent-resolvable concerns converge." The prose that follows is a `while` loop invoking three
techniques per pass, one of them named by a parameter.

**Every construct it needs already exists in the step schema.** A loop step, a bound technique per
body step, an iteration bound, an input binding. Nothing about it wants prose.

**One of its seven sites proves the split is wrong from the inside.** At
`work-package/activities/15-codebase-comprehension.yaml` the activity wraps the technique in a
`kind: loop` step of its own and passes `iteration_mode: once` to switch the technique's internal
loop off. Iteration is expressed twice, in two different mechanisms, reconciled by a parameter whose
only job is to disable one of them. That is the sub-optimal distribution of concerns in the flesh,
and it is why this site was chosen as the one to convert.

The host activity is `codebase-comprehension`: 8 top-level steps, a `while` loop with 4 body steps,
4 exits, 15 declared reads and 3 declared writes.

## What was converted

| Artifact | What it is |
|---|---|
| [conversion/routines/analyse-challenge-pass.yaml](conversion/routines/analyse-challenge-pass.yaml) | One analyse → challenge → fold pass, as three steps |
| [conversion/routines/converge-concerns.yaml](conversion/routines/converge-concerns.yaml) | The iterating form: a `while` loop whose body references the pass |
| [conversion/15-codebase-comprehension.yaml](conversion/15-codebase-comprehension.yaml) | The host activity, converted, with every change marked |
| [conversion/06-plan-prepare.excerpt.yaml](conversion/06-plan-prepare.excerpt.yaml) | The other reference form, at one of the six iterating sites |

`run-loop.md` — 78 lines of prose — becomes 78 lines of routine plus 82 for the pass it iterates.
**The conversion is not smaller.** It is the same content expressed where a reader can act on it,
and the trade is legibility for enforceability, not brevity for verbosity.

## What the conversion found

### 1. A routine has to be able to reference another routine

Six sites want the loop; the seventh wants one pass, because it iterates around a user gate that
belongs to the activity. So the corpus needs both forms, and they share a body.

Three ways to have both, and only one is acceptable:

- **Nest.** `converge-concerns` holds a loop whose body is a reference to `analyse-challenge-pass`.
- **Duplicate.** Both routines carry their own copy of the three steps — the duplication the
  construct exists to remove, reintroduced in the construct's first use.
- **Parameterise the iteration.** One routine with a `pass_only` input gating its loop — which is
  `iteration_mode` under a new name, and `iteration_mode` is the defect being removed.

**Nesting has to be in the first version.** The proposal lists it as a non-goal; the first genuine
conversion needs it. The cost is small and bounded: cycle detection over a reference graph, which
the load already needs for the single-level case, and a prefix that composes
(`converge-assumptions.pass.iteration.challenge`). What should be measured before this lands is the
resulting identifier length against the checkpoint response key, which is the activity id and the
checkpoint id together.

### 2. A routine output is an identifier with a declaration, and the reference site may rename it

The technique takes three of its inputs — `convergence_flag`, `residue_flag`, `residue_collection` —
as the **names of session variables to write**, chosen by the caller. The assumptions sites bind
them to `has_resolvable_assumptions`, `has_open_assumptions` and `open_assumptions`; the
comprehension site binds two of them to `needs_comprehension` and `has_open_questions`.

The proposal declares a routine's outputs as full variable declarations carrying a `name`. That
makes the name fixed, and this run cannot have a fixed name — it serves two domains that name the
same fact differently.

**A routine output is an output id with a declaration attached, and a reference site binds it to a
session variable under `outputs:`** — the same shape a technique step's `outputs` remap already has.
The declaration travels with the binding, so the host contributes a typed, described, defaulted
variable without restating it.

This is what turns the three flag-name inputs into three output bindings, and it is why the
converted `06-plan-prepare` excerpt has the same three names in the same three places, read by a
reader that can now act on them.

### 3. Materialisation is a substitution, not a splice

The proposal describes materialisation as splicing a routine's steps into the referring activity and
prefixing their identifiers. That is enough for the assumption run, whose body names session
variables directly. It is not enough for anything parameterised.

Inside a routine, its declared inputs and outputs are **the names in scope**. The loop in
`converge-concerns` tests `convergence_flag`, which is an output id, not a bag name. Materialising
it into `06-plan-prepare` has to rewrite that test to read `has_resolvable_assumptions`.

So materialisation rewrites every field that can name a variable:

| Field | Example in this conversion |
|---|---|
| `when` expressions | — |
| `condition` blocks | the loop's continuation test on `convergence_flag` |
| loop `over` and item `variable` | — |
| checkpoint `id` templates and `message` | — |
| checkpoint option `setVariable` names and values | — |
| technique binding `inputs` and `outputs` maps | `combine`'s three output remaps |
| action `target`, `message`, `value` | — |
| a body step's `technique:` name | `"{analyse_technique}"` — see finding 6 |

**That list is exactly the set of fields the contract derivation already walks.** The implementation
is the same traversal, inverted: where the derivation reads names out of those fields,
materialisation rewrites them. Building the second against the first is the cheapest way to keep
them from disagreeing, and a disagreement between them is a step whose gate reads a variable nobody
writes.

Two further consequences. Substitution has to be simultaneous rather than iterative, or a binding
that maps `a → b` and `b → c` renames some occurrences twice. And the raw-YAML delivery path has to
perform the same substitution on text, which raises the cost of the second representation the
proposal already flags as its largest.

### 4. A routine has no free variables

`run-loop`'s protocol forwards `{assumptions_log}`, `{target_path}`, `{comprehension_artifact}` and
`{comprehension_log}` "as applicable". Three of those four are declared inputs of the technique. The
fourth is not.

If a routine's body may read names it does not declare, its signature is not a contract, its body is
not checkable on its own, and materialisation has no way to know which names to rewrite and which to
leave. So: **every name a routine's body reads or writes is a declared input or output.** For this
conversion that means four optional forwards become four declared inputs with empty defaults.

**One carve-out is required and it is not optional.** An artifact filename template — `deep-dive`
declares `{codebase_area}.md` — is interpolated by the worker at run time from the technique's own
outputs, not read from the definition. The no-free-variables rule applies to the fields the
definition reads, listed under finding 3, and not to artifact name templates. Without that carve-out
the rule is unimplementable, because the token names a value that does not exist until the step runs.

### 5. A `while` loop has nowhere unambiguous to keep its continuation condition — a blocker

`converge-concerns` needs to say "repeat while the concern set is still converging". The only field
available is `condition`, which the schema documents as an **entry gate**, and which both mechanical
readers treat as one. Nineteen repeat-until loops in the corpus do the same thing, including the
host activity's own loop.

A routine that owns a loop therefore cannot be given an unambiguous reading. Writing the loop inside
a shared definition makes this worse than it is today, because a wrong reading now propagates to
every reference site at once instead of staying in one activity.

**W4 is blocked on the field's meaning being settled.** W3, the construct itself, is not: the
assumption routine's loop is a `forEach` over a collection and has no continuation condition.

**Measuring the blocker made it larger than a blocker.** Both mechanical readers take a loop's
`condition` at entry, and both read an unbound variable as false — so **six of the eight top-level
`doWhile` loops in the corpus never run their body**, which is the one property a `doWhile` names.
Seventeen further body steps are excluded from eager delivery for the same reason. The resolution is
a `continueWhile` field and a key rename at 19 sites, set out in
[continuation-condition.md](continuation-condition.md); it should be taken whether or not routines
are built.

### 6. A technique reference can be a parameter, and it makes the routine monomorphic

`analyse_technique` is a technique path supplied by the caller —
`review-assumptions::reconcile` at six sites, `codebase-comprehension::deep-dive` at the seventh. In
the routine body that is `technique: "{analyse_technique}"`.

The contract derivation resolves a bound technique's signature by reading its file. It cannot read
`{analyse_technique}`. Two ways out:

- **Refuse.** A routine body may not bind a technique by parameter. That forces one routine per
  domain — the fork the technique's own `parameterize-dont-fork` rule forbids.
- **Monomorphise.** Materialisation substitutes the literal before the derivation runs, so each
  reference site yields a concrete path and every signature resolves.

Monomorphisation is right, and it works only because materialisation happens at load and the
argument is a literal in a definition file. It has a price the proposal must state:

> **A routine whose body binds a technique by parameter has no signature of its own.** Its contract
> is derivable per reference site and not in isolation, so the isolated-checking guarantee is
> qualified rather than universal, and the guard that holds a routine's declared signature against
> its body runs once per reference site for such a routine instead of once per routine.

An input whose value is a technique reference should say so — `kind: technique` on the input
declaration — so the loader knows to substitute before resolving and the guard knows which routines
it cannot check alone.

### 7. Not every repeated-looking run is a repeat

The host activity runs a seed pass before its loop: analyse, write the artifact, revise the
questions, write the log. The loop body then runs analyse, write the artifact, write the log. It
reads like a partially unrolled first iteration, and the obvious move is to fold it into the routine
as a first-iteration variant.

It is not a copy. The seed pass runs the analysis with **no challenge and no fold**, which is a
different run with a different result. Folding it in would silently add two techniques to a pass
that deliberately omits them.

The converted activity keeps it, marked. The general point belongs in the migration guidance: a
mechanical search for repeated runs finds candidates, and a candidate is not a duplicate until
somebody has read both.

### 8. A prose token propagates a read into every activity that binds the technique

This is the measured heart of the misplacement, and it is worse than it looks.

The contract derivation collects the `{tokens}` in a technique's delivered prose and treats every
one that is **not** a declared signature entry as a direct read of the session by the binding
activity. `run-loop`'s protocol carries thirteen tokens. Ten are declared by the technique or its
group. Three are not: `comprehension_log`, `needs_comprehension` and `has_open_questions`.

Two of those three appear in a single sentence about one of the two domains the technique serves —
the clause that says to follow the analysis with `revise-questions` when the concern kind is open
questions. The propagation is exact:

| Token | Activities declaring a read | Of those, activities binding `run-loop` |
|---|---|---|
| `has_open_questions` | **7** | **7** |
| `needs_comprehension` | 6 | 6 |

Seven activities bind the technique. Seven activities read `has_open_questions`. They are the same
seven, and no other activity in the corpus reads it. Six of them are running assumptions, where the
sentence carrying the token does not apply — so six activities declare a read of a comprehension
variable because of a clause that never fires for them.

**And nothing writes it.** `has_open_questions` is written only through a parameter, which the
producer index cannot see, so no activity declares the write — and the name is therefore declared at
the **workflow root**, in both `work-package/workflow.yaml` and `remediate-vuln/workflow.yaml`, with
a default. The contract guard passes because a workflow-owned name satisfies its
read-needs-a-writer test unconditionally.

Read by prose, written by parameter, declared at the workflow root. That is the same inversion #519
raises about gate bodies, arriving by a completely different route — and it is what a declared
routine signature closes, because a routine's output binding is a write the derivation can see.

Across the five bag names the technique writes through parameters, over 20 parameter bindings, the
corresponding write is hand-declared at 13 and absent at 7:

| Bag name | Parameter bindings | Activities declaring the write |
|---|---|---|
| `has_open_assumptions` | 6 | 6 of 6 |
| `open_assumptions` | 6 | 6 of 6 |
| `needs_comprehension` | 1 | 1 of 1 |
| `has_resolvable_assumptions` | 6 | **0 of 6** |
| `has_open_questions` | 1 | **0 of 1** |

Where it is declared, it is declared by hand. Where it is not, the fact is invisible.

### 9. `iteration_mode` exists because a gate cannot live inside prose

The seventh site disables the technique's loop because it needs a **user decision inside each
iteration** — a soft sufficiency gate with a thirty-second auto-advance — and a technique's protocol
has no way to hold one. So the activity took the loop and the technique kept a parameter saying it
had been taken.

A routine can hold a gate. But putting one in `converge-concerns` would give it to the six sites
that do not want it, so the right answer is the two-routine split of finding 1, with the gate staying
in the activity. Naming the cause matters for the migration guidance: **when a shared run needs a
decision at one site and not at others, the split is between the run and the loop over it, not
between two variants of the run.**

### 10. Three small bindings that should follow existing rules rather than invent new ones

- **A collection argument is a JSON string.** `challenge_perspectives` is authored as
  `'["pedagogy", "rejected-paths"]'` because a step binding's `inputs` admits string, number or
  boolean and nothing else. A routine's `with` should admit exactly the same union, so the corpus
  has one rule rather than two.
- **A reference is braced from the start.** `with: comprehension_artifact: comprehension_artifact`
  is ambiguous under today's binding heuristic — literal or rename. A routine reference is a new
  site with no legacy, so it should require `"{comprehension_artifact}"` for a reference and read a
  bare value as a literal, adopting the destination of the binding-resolution work rather than
  adding a site to its migration.
- **An invocation written in prose becomes a step.** `revise-questions` is invoked from `run-loop`'s
  protocol in a sentence conditioned on the analyse technique. Converted, it is a step of the
  activity, where the condition is a gate rather than a clause. That is one of the corpus's inline
  invocations retired by this conversion.

## What the conversion retires

The `analyse-challenge` group carries nine rules across four files. Converting the loop retires four
of them and leaves five, which is the right split: the four that go are statements about structure,
and the five that stay are statements about judgement.

| Rule | Where | Under the conversion |
|---|---|---|
| `max-iterations-safety` | run-loop | Becomes `maxIterations: 10` on the loop step |
| `no-user-interaction` | run-loop | Becomes a guard: the converge routine contains no checkpoint step |
| `structure-enforces-convergence` | group | **Unrepresentable** — there is one body |
| `parameterize-dont-fork` | group | **Unrepresentable** — there is one body |
| `one-gather-contract` | run-loop | Stays prose — governs what happens inside the challenge pass |
| `isolation-then-combine` | challenge | Stays prose |
| `evidence-over-rhetoric` | challenge | Stays prose |
| `combine-owns-flags` | combine | Stays prose |
| `empty-set-is-success` | combine | Stays prose |

Two more retirements fall out:

- **`run-loop.md` goes entirely.** Its Protocol is the routine; its inputs are the routine's
  signature. `TECHNIQUE.md`'s group contract becomes the routine signature too, and `challenge.md`
  and `combine.md` survive unchanged as techniques.
- **`combine.md` loses five of its nine declared outputs.** Five are domain aliases —
  `open_assumptions`, `has_resolvable_assumptions`, `has_open_assumptions`, `needs_comprehension`,
  `has_open_questions` — each marked "(when `concern_kind` is X)". They are a discriminated union
  written as a prose annotation on an output list. Under output bindings at the reference site they
  are the caller's names, and combine declares four.
- **Three names stop being both an input and an output.** `convergence_flag`, `residue_flag` and
  `residue_collection` are declared in both the group's Inputs and its Outputs, because they are
  names of variables rather than values. Each appears once after the conversion, as an output.

## What the conversion does not fix

**The seed pass stays hand-written.** Finding 7. It is a genuinely different run and no mechanism
converges it.

**The analysis techniques keep their prose.** `deep-dive`, `reconcile`, `challenge` and `combine`
are judgement, and nothing here parses them. What moved is the loop around them.

**The delivered payload grows.** Materialising two nested routines into an activity produces more
YAML than the single technique-binding step it replaces, and the raw-text delivery path has to
produce it with substitutions applied. The source gains one small file and loses a technique; the
wire gains steps.

**`comprehension_log` remains undeclared.** It is a prose token of `run-loop` that names no declared
entry and no workflow variable, so it falls out of the derivation entirely — neither a read nor a
write anywhere. Converting the loop makes it a declared input of the routine, which is an
improvement, but the underlying gap is a technique reading a name nothing in the workflow's namespace
owns, and that class of defect is untouched by this work.

## What this changes in the specification

| # | Change | Where it lands |
|---|---|---|
| 1 | A routine may reference another routine; a cycle is a load failure | Non-goal removed; [decisions.md](decisions.md) |
| 2 | A routine output is an id with a declaration; a reference site binds it under `outputs:` | The definition and the reference site |
| 3 | Materialisation is a simultaneous substitution over every variable-naming field, built on the derivation's traversal | Architecture |
| 4 | A routine has no free variables, with artifact name templates carved out | The definition |
| 5 | An input may be declared `kind: technique`; such a routine is checkable per reference site, not in isolation | The definition; the isolated-checking guarantee is qualified |
| 6 | `with` admits the step binding's scalar union; a reference is braced and a bare value is a literal | The reference site; settles open decision 5 |
| 7 | A loop's continuation test moves to `continueWhile`; `condition` leaves the loop step and `breakCondition` becomes the `forEach` early exit | New stage 0, independent of the rest; [continuation-condition.md](continuation-condition.md) |

The first three are load-bearing. Finding 3 in particular is not a refinement of the proposal's
materialisation — it is a different mechanism, and building the splice first would mean building it
twice.
