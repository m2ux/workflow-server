# The assumption run, re-derived from the two sites that keep it

Companion to [re-derivation.md](re-derivation.md), which does the same for the convergence run, and
to [stage-2-dispositions.md](../2026-09-11-routines-remediation/stage-2-dispositions.md), which
carries the twelve differences this fold settles.

[README.md](README.md) prints a body for this run and says of it, in the paragraph above the block,
that it is *"a sketch rather than a derived signature"* and that the real one comes "from a
re-derivation of this run that does not exist yet". This is that re-derivation, taken on 2026-09-15
from the corpus as it stands after the convergence fold, and reconciled against a server that served
it.

**Two of the four hosts do not appear here.** The run happens once per run: research and
implementation-analysis reach assumptions-review on every path, so their copies are followed by a
definitive reconciliation and are dropped rather than converged. The sites this derives from are
`07-assumptions-review` and `08-implement`.

## What the sketch got right, and the three places it did not

The shape is right: a batch gate, a record pass gated on the batch answer, and a loop that walks the
open set one at a time with a gate and a record inside it. Six positions, with the announcement that
produces the presentation staying outside the body.

**`needs_individual_interview` is an internal, not an output.** The sketch declares it among the
values the run produces. It is written by the batch gate and read by the two steps after it — the
record pass's gate and the loop's gate — and no host consults it. Declared as an output it is bound
to a host variable that nothing outside the run reads, which the variable guard reports as a write
with no reader. Declared as an internal it is mangled per host and per site, which is what the
corpus now carries.

**The `decision_space` input has no site.** The sketch declares it with a default, to parameterise
which option set the per-item gate offers. The gate's message in the corpus is
`Assumption {current_assumption.id}: {current_assumption.statement}` and the token appears nowhere in
any definition. A parameter with no reference site is a parameter the signature should not carry.

**The gate message is not a parameter either.** The sketch binds the batch gate's text as a
`gate_message` argument. Both surviving sites take that text from one shared declaration, so nothing
varies and there is nothing for a site to bind. The message is a literal in the body and the
presentation it interpolates is a declared input that every site leaves unbound.

## The signature

Thirteen inputs, two outputs, two internals. Ten of the inputs are names the run's techniques reach
through their inherited inputs; no reference site binds one, so each host supplies its own value
under the same spelling.

```yaml
# work-package/routines/residual-assumption-interview.yaml
inputs:
  - assumption_review_presentation   # produced by the host's announcement, which sits outside the run
  - has_open_assumptions
  - open_assumptions
  - is_review_mode
  # …and the ten reached through review-assumptions: assumption_categories, assumption_source,
  # branch_name, component_git_dir, planning_folder_path, pr_number, problem_statement,
  # requirements, target_path, target_repo

outputs:
  - assumption_outcome        # string: confirmed | corrected | deferred
  - has_deferred_assumptions  # boolean

internals:
  - current_assumption
  - needs_individual_interview
```

Both outputs leave the run. `has_deferred_assumptions` is consulted by three gates at
`07-assumptions-review`; `assumption_outcome` is declared as a read at activities the run does not
reach. Neither reaches its reader through the body.

Each site binds the two outputs to the names it already used and passes no arguments:

```yaml
  - kind: routine
    id: residual-assumptions
    routine: residual-assumption-interview
    outputs:
      assumption_outcome: assumption_outcome
      has_deferred_assumptions: has_deferred_assumptions
```

## What a server confirmed

The composed identifiers are `residual-assumptions.batch-gate`, `.record-batch`, `.interview`,
`.interview.present`, `.interview.decision#{…}` and `.interview.record`. Delivery carries no trace of
the construct: no reference step, no routine name, and no checkpoint reference, the mechanism this
run retires having no remaining site anywhere in the corpus.

The internal is mangled to `assumptions_review_residual_assumptions_needs_individual_interview`, the
batch gate's option writes that name, and both gates that consult it read the same name. The two
outputs are written under the names the site bound. The variable bag holds no unmangled spelling of
the internal, so nothing that survives the run carries it.

A dismissal works under the composed identifier: in review mode the batch gate's condition is false,
and the run records the dismissal with no variable set, so the internal stays unset and the loop
cannot open. Three visits to the run produced three distinct records, one per gate answered.

## The cost this fold carries, which is not a behaviour change

Nothing a user does or sees differs. What differs is that a value which used to be declared
workflow-wide is now private to the run, and the mechanical walk fills its variable bag from declared
values. The walk therefore reads an empty slot where it used to read a declared false, and reports
the loop's gate as read-unbound at both sites.

This is a **testability** cost rather than a functional one, and it is structural rather than
incidental: every convergence that promotes a workflow variable to a routine internal — which is the
point of the construct, a value that never leaves a run having no business being workflow-wide —
takes the same value out of view of anything reasoning from declarations. The boundary that lets a
routine be checked on its own is the boundary that hides its internals from outside.

[E05](https://github.com/m2ux/workflow-server/issues/740) W02 is where the walk regains that reach,
and its AC5 names the case exactly: the seed a walk uses supplies what a run needs, *including inputs
no signature declares*. Until then the criterion narrows rather than the signature distorting, which
is the choice AC4 offers.
