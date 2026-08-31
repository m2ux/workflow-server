# Rejected alternatives

Designs weighed while writing the typed-execution record, with the reason each was dropped. Recorded
here so the epic body can state the chosen design positively and so none of these is re-derived.

---

## 1. Take the existing epics incrementally and do not redesign

**The honest counterfactual, and the strongest competitor.**

Twenty-one open issues, each carefully evidenced, each with a bounded fix. Nothing on the tracker is
speculative; several carry measurements this redesign leans on. Delivered one at a time, they would
raise the floor considerably: #513 gives one predicate dialect, #401 gives a correct session start,
#404 gives a cheaper delivery, #402 unblocks two stalled migrations.

**Why it is not the recommendation.** The issues keep arriving at the same wall from different sides.
#404 W7 asks whether a full delivery can drop content it has already sent; #404 W10 asks why the
activity body alone cannot collapse; #404 W9 asks why a repeat fetch is answered in full. Three items,
three mechanisms, one cause — payloads are composed per request rather than compiled once. Likewise
#513 wants a rule that can fail a build, #497 wants a corpus that can check itself, and 6,471 lines of
guard exist because neither can happen where the semantics live.

The incremental path is not wrong; it is expensive in a specific way. Each fix adds mechanism to a
substrate that cannot hold the rule the fix states, so the mechanism has to be maintained separately
from the thing it governs, forever. The 249-commit drift on the binding-fidelity verdicts is what that
costs after a few months.

**How the two are reconciled.** The epic's first milestone (W1 to W3) is deliberately the slice that
#523 already proposes. If it does not earn its keep, the incremental path is still open and nothing
has been spent on the parts that only pay off later.

---

## 2. A bespoke workflow language with its own grammar

**Considered because #513 already points at it** — "the grammar file becomes the source the parser is
generated from, so the specification and the implementation cannot disagree."

**Dropped because the checking this design needs is not syntax.** A generated parser gives one
predicate dialect and load-time parse failure, which is #513's stage 3 and is genuinely valuable. It
does not give type unification across declaration sites, definite-assignment over a step sequence,
signature agreement for borrowed techniques, or effect containment. Each of those would have to be
written from scratch, and each is a real static analysis rather than a lint — which is what the
existing 6,471 lines of guard already are, and the argument for not writing them a second time.

An embedded language inherits all four from a mature checker, plus an editor experience nobody has to
build.

**What survives from the alternative.** A grammar artifact for the expression dialect is still worth
having as the specification of what the intermediate form's predicates mean, independent of the front
end that produces them.

---

## 3. Keep YAML and add a schema-driven type layer

**Dropped because JSON Schema cannot express the constraints that matter here.** Two declarations of
one name agreeing on type is a unification problem; a gate reading a variable no earlier step binds is
a dataflow problem; a workflow that must never disclose is a containment problem. None is expressible
as a document schema, which is exactly why they are guards.

Adding a type layer over YAML means writing that checker anyway — at which point the YAML is a worse
surface syntax for a language that already exists.

---

## 4. Promote every guard to a load failure

**The cheapest-looking option: keep everything, make the 33 checks run at load and refuse the
definition.**

**Dropped because it hardens the mechanism instead of removing it.** The guards stay outside the
language, still needing separate maintenance, still able to drift from their subject, still unable to
run where a definition changes. What changes is only that a violation now stops the server rather than
printing. The corpus-debt triage file — findings classified `harmless` / `fix-later` / `live-bug` —
would have to grow a suppression mechanism for every finding currently tolerated, which is more
machinery, not less.

This is the shape of remediation that fixes findings by accreting mechanism, and it is worth naming
because it will look attractive at every point where this epic looks expensive.

---

## 5. Attest the runner cryptographically

**Already rejected in #523 and the rejection is kept.** The server accepts a transition because it
derives the same one, not because the caller proves its identity. A client producing correct
transitions is acceptable whatever it is; a client producing incorrect ones is refused whatever it
claims.

Extending that principle downward — accepting a gate stop only when the runtime reproduces it from the
returned outputs — is this design's one addition, and it needs no identity either.

---

## 6. One agent call per step

**Dropped on the exchange rate.** There are 611 technique steps across 117 activities. A round trip
costs about what 18,800 characters of fresh content cost, and a fresh context costs 23,000 to 42,000
tokens to establish. A per-step call in a fresh context multiplies the largest cost in the system by
roughly five; a per-step call inside a living context still loses money below about four steps, since
the average composed step technique is 5,275 characters.

The unit is a run of steps ending at the first gate the runtime cannot answer from the outputs the run
has produced.

*Caveat carried forward:* both exchange rates are unreviewed in their source and want re-measuring
before a grain is fixed. See [evidence.md §5](./evidence.md).

---

## 7. Keep the orchestrator agent and give it better instructions

**Dropped because it is the current design, and the ~33,000 characters of per-dispatch protocol prose
are the evidence that it does not converge.** Each defect found in orchestrator behaviour has been
answered with more instruction, delivered on every dispatch, to every agent, forever. The instruction
describes a computation whose answer the server already derives for its own delivery decisions.

The role is not deleted because the agent does it badly. It is deleted because the job has a
deterministic answer and a program is the right thing to hold one.

---

## 8. Make runs fully deterministic by constraining technique outputs

**Considered as a way to strengthen the audit claim past replay-determinism.** If every technique
returned only structured values from a closed vocabulary, a run would reproduce from the definition
alone.

**Dropped because the prose judgement is the product.** A technique's value is that a model reads a
protocol and exercises judgement over a codebase; constraining that to a closed vocabulary removes the
thing the system exists to orchestrate. Replay-determinism — the run reproduces given the recorded
returns — is what audit needs, and claiming more would be false.

---

## 9. Parallel execution inside a session

**Held out, following #523.** One decision point at a time per session, one cursor per session, and
parallelism at session granularity through child workflows.

The temptation under a runtime is real: with a typed step graph, independent subtrees are visible and
schedulable. It is declined for this epic because the corpus does not currently express which work is
independent — #523's own protocol-verification record withdraws the claim that a runner could work
that out for itself — and because a second concurrent cursor changes what the session log has to
guarantee. Worth revisiting once the log and the cursor exist.

---

## 10. Replace prose techniques with typed code

**Dropped without hesitation, and stated here because a typed design invites it.** Technique bodies —
Capability, Protocol, Rules — stay prose. They are the payload for the model, nothing in this design
parses them, and the boundary #523 draws is the right one.

The corollary is a real authoring constraint rather than a preference: 436 of 2,459 protocol bullets
open with a conditional or a repetition, so control flow lives inside technique bodies as well as
above them. A call-out is therefore atomic, and the runtime cannot resume one part-way.

---

## 11. Big-bang rewrite

**Dropped in favour of pivoting on the intermediate form.** The corpus is roughly 2.5 MB of prose and
half a megabyte of structure, representing most of the system's accumulated value. A rewrite that
cannot run the existing corpus cannot be evaluated against the existing corpus.

The chosen shape: define the intermediate form, write a YAML importer, and require both engines to
agree on the walk suite — identical transitions, identical artifacts, and no more delivered bytes —
before anything is removed.

---

## 12. Split the repository so the corpus can hold its own tests

**Declined, following #497's own non-goal.** The two branches stay as they are. Under this design the
corpus becomes a package depending on a runtime package, which is what gives it a toolchain; that is a
dependency relationship, not a repository split.
