# SOLID as a review lens — proposed work

Forward-looking only. What the review measured is recorded in the [batched-dispatch implementation record](../2026-08-03-batched-dispatch-implementation/README.md) under *What the SOLID review found*; this folder holds what to do about it, and nothing here has been acted on.

## Why the lens is worth keeping

The framework's constructs are the ones the principles are about, so the axes are not being borrowed by analogy. A technique is an interface — declared Inputs and Outputs with per-field optionality, a Protocol body, Rules as invariants. Apply is a call. An activity composes calls. Orchestrator and worker are clients receiving different bundles. Delivery is the linkage step.

Two of the five axes are load-bearing here in ways they usually are not, and one is a genuine hole:

- **Dependency inversion is the framework's native mode.** Braced references are the abstraction; literals are the concretion. Roughly seventeen catalogue entries already enforce it. Nothing to add.
- **Segregation has a price.** A worker's delivery draws down a character budget, so content its recipient cannot act on is a number rather than a preference. Rare, and worth exploiting.
- **Substitutability is the hole**, and structurally so: every cross-surface detector in the catalogue looks for duplication — sameness where difference belongs — and none for divergence where uniformity is required.

Use it for classification and gap-finding. It did not generate the faults it explained, and the substitutability gap was reached by noticing the detector asymmetry rather than by consulting the axis.

## 1. Build the adapter-set closure guard

The one guard the review argued for. Prove that three enumerations describe one set: the resolution map's rows, the adapter files each declaring a rule slice for every slice the map's vocabulary names, and the loader's core-ops list — in both directions, with no orphan adapter file and no mapped file missing.

Baseline is clean: four map rows, four adapter files, four core-ops refs, three slices, twelve slices of twelve present. It lands green, so every future failure is real, and it catches all four adapter mutations that pass today.

Two authoring constraints. The map is prose, so a reformat must surface as *unmeasured* rather than pass — the repo has `assertScanned` for exactly that, and loosening the pattern instead would be the wrong fix. And a harness with no concurrent primitive is conceivable; today two adapters handle that by declaring the slice and documenting a sequential fallback inside it, which is the shape to enforce. If the corpus ever wants a truly absent slice, the guard failing is the right prompt for that conversation rather than a reason to exempt it.

**The case in one sentence:** the corpus's largest polymorphic set — sixty-plus prism lenses reached through a variable — is already guarded on reachability, and deliberately not on shape, because a lens declares its own output shape as its contract. Same construct as the harness adapters. Reachability guarded there, unguarded here.

## 2. Repair the resumption contract

Not a guard — a narrower version lands red, which makes it canon work. `resume-from-checkpoint` needs declared Outputs and the rules a resumed worker owes, so that whichever technique the abstraction names, a caller waiting on an envelope is waiting for something the reader was told to produce. Its two siblings reach that obligation through an activity fetch the resumed agent never makes.

Related and worth resolving together: two harness rules pull against each other. One permits a resume to degrade to a fresh spawn and requires workflows to be correct anyway; the other treats a resumed agent as the same delivery context, so reference delivery returns unchanged markers for bytes a degraded context never received. The mitigation for that exists — on a surface the resumed agent is not directed to read.

## 3. Consider one catalogue addition: variant parity

Named for the smell, not the axis. Where two or more operations are selected by one discriminator at one bind site, compare their declared Inputs, Outputs and artifacts: flag a required input the bind site supplies on one arm only, an output a sibling omits where a common consumer reads them uniformly, and a variant that writes the discriminator a sibling's gate reads.

It collides with nothing, and it closes an exposure the catalogue's own remedies create — two entries prescribe splitting a multi-mode operation into one operation per mode gated at the bind sites, after which nothing checks the siblings agree. Live instance: three operations bound as an escalation chain with three different declared contracts, one consumer reading them uniformly, and the second arm rewriting the discriminator the third arm's gate reads. Only the per-file defects fire today.

Two cautions. It would be the catalogue's first cross-variant detector, so the scan scope must be bounded inside Detect — one bind site, or one gate variable — or it becomes unapplicable. And a member-set version of the same idea is barred until the schema has an enum variable type, because the member set would have to be read out of prose descriptions.

## 4. Report fan-out as metrics, not thresholds

Two ratios are computable and neither should gate: container-rule characters per operation actually referenced, and inherited-I/O characters whose id the receiving protocol never templates. Relevance is a judgement — a container rule is *meant* to be cross-cutting — so a threshold would fail the corpus on its intended design. A warn-only line beside `bench:batch` makes the fan-out visible and a regression arguable without a number pretending to be a fact.

## 5. Consider deduplicating full-mode delivery

Identical rule and I/O blocks repeat inside a single response — 16,453 characters byte-identical in the worst case measured. The collapse pass that would remove them runs only in reference mode, so a freshly spawned worker, which is the case the budget is tightest for, pays all of it. Worth checking whether the same pass can run in full mode.

## Explicitly not proposed

- **No entry or rename after a SOLID axis.** Barred by the catalogue's own naming rule — entry names identify the smell, not the stance — and by the ban on handing an auditor a framework to re-derive. Three axes are covered well enough that an axis-level entry would be an umbrella restatement: a dependency-inversion entry would yield four findings for one caller-named input description.
- **No relevance gate**, per item 4.
- **No "names a tool this actor cannot call" guard.** Five hits, one true positive; the rest are legitimate prohibitions and an exemption list. Useful only with negation-awareness over prose.
- **No substitutability guard over the agent-entry or analysis sets.** Their members differ by role, deliberately. Enforcing sameness would be wrong; the analysis set's abstraction already switches on implementation identity in its own Protocol, and the repair is to stop calling it polymorphic.
- **No broadened link-existence guard** over the 1,476 anchor-less internal links. Out of proportion to the finding, and it would drown the specific signal; the four map rows are the load-bearing subset and item 1 covers them.

## Hazards to resolve in prose, since no structure can catch them

- One adapter's fallback names a delegation the resolution map structurally prevents.
- A group rule admits two readings: one adapter forbids background dispatch outright, another permits it conditionally.
- An optional tracing argument reaches two adapters of four, silently.
- Only one adapter states where the spawned agent's output is captured; the others leave it to the generic operation. Consistent in effect, inconsistent in where the contract lives, so a reader comparing them cannot tell whether an omission is deliberate.
