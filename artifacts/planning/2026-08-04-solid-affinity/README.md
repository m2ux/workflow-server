# SOLID as a review lens — proposed work

Forward-looking only. What the review measured is recorded in the [batched-dispatch implementation record](../2026-08-03-batched-dispatch-implementation/README.md) under *What the SOLID review found*; this folder holds what is left to do about it.

Three of the review's proposals were carried out on the batched-dispatch branch, and they have been removed from here rather than marked done, so that everything below is genuinely outstanding: the adapter-set closure guard ships as `check:harness-set`, the resumption contract was repaired by dropping `resume-from-checkpoint` from the technique variable and composing the resume stub with `activity-worker`, and the harness rule that admitted two readings of background dispatch now permits one. The implementation record carries what each of them turned out to involve.

## Why the lens is worth keeping

The framework's constructs are the ones the principles are about, so the axes are not being borrowed by analogy. A technique is an interface — declared Inputs and Outputs with per-field optionality, a Protocol body, Rules as invariants. Apply is a call. An activity composes calls. Orchestrator and worker are clients receiving different bundles. Delivery is the linkage step.

Two of the five axes are load-bearing here in ways they usually are not, and one is a genuine hole:

- **Dependency inversion is the framework's native mode.** Braced references are the abstraction; literals are the concretion. Roughly seventeen catalogue entries already enforce it. Nothing to add.
- **Segregation has a price.** A worker's delivery draws down a character budget, so content its recipient cannot act on is a number rather than a preference. Rare, and worth exploiting.
- **Substitutability is the hole**, and structurally so: every cross-surface detector in the catalogue looks for duplication — sameness where difference belongs — and none for divergence where uniformity is required. Item 1 below is the narrowest useful step into it.

Use it for classification and gap-finding. It did not generate the faults it explained, and the substitutability gap was reached by noticing the detector asymmetry rather than by consulting the axis.

## 1. Consider one catalogue addition: variant parity

Named for the smell, not the axis. Where two or more operations are selected by one discriminator at one bind site, compare their declared Inputs, Outputs and artifacts: flag a required input the bind site supplies on one arm only, an output a sibling omits where a common consumer reads them uniformly, and a variant that writes the discriminator a sibling's gate reads.

It collides with nothing, and it closes an exposure the catalogue's own remedies create — two entries prescribe splitting a multi-mode operation into one operation per mode gated at the bind sites, after which nothing checks the siblings agree. Live instance: three operations bound as an escalation chain with three different declared contracts, one consumer reading them uniformly, and the second arm rewriting the discriminator the third arm's gate reads. Only the per-file defects fire today.

Two cautions. It would be the catalogue's first cross-variant detector, so the scan scope must be bounded inside Detect — one bind site, or one gate variable — or it becomes unapplicable. And a member-set version of the same idea is barred until the schema has an enum variable type, because the member set would have to be read out of prose descriptions.

## 2. Report fan-out as metrics, not thresholds

Two ratios are computable and neither should gate: container-rule characters per operation actually referenced, and inherited-I/O characters whose id the receiving protocol never templates. Relevance is a judgement — a container rule is *meant* to be cross-cutting — so a threshold would fail the corpus on its intended design. A warn-only line beside `bench:batch` makes the fan-out visible and a regression arguable without a number pretending to be a fact.

## 3. Consider deduplicating full-mode delivery

Identical rule and I/O blocks repeat inside a single response — 16,453 characters byte-identical in the worst case measured. The collapse pass that would remove them runs only in reference mode, so a freshly spawned worker, which is the case the budget is tightest for, pays all of it. Worth checking whether the same pass can run in full mode.

This got larger while the branch was in flight. Delivering `activity-worker` to every client worker — the role each worker stub had been told to apply without it ever being in the bundle — raised each activity's eager payload by some 5,700 characters. That is a fixed cost on every delivery, and repeated rule text is exactly what a dedupe pass reaches.

## Explicitly not proposed

- **No entry or rename after a SOLID axis.** Barred by the catalogue's own naming rule — entry names identify the smell, not the stance — and by the ban on handing an auditor a framework to re-derive. Three axes are covered well enough that an axis-level entry would be an umbrella restatement: a dependency-inversion entry would yield four findings for one caller-named input description.
- **No relevance gate**, per item 2.
- **No "names a tool this actor cannot call" guard.** Five hits, one true positive; the rest are legitimate prohibitions and an exemption list. Useful only with negation-awareness over prose.
- **No substitutability guard over the agent-entry or analysis sets.** Their members differ by role, deliberately. Enforcing sameness would be wrong; the analysis set's abstraction already switches on implementation identity in its own Protocol, and the repair is to stop calling it polymorphic.
- **No broadened link-existence guard** over the 1,476 anchor-less internal links. Out of proportion to the finding, and it would drown the specific signal; the four map rows were the load-bearing subset, and `check:harness-set` now covers them.

## Hazards to resolve in prose, since no structure can catch them

- One adapter's fallback names a delegation the resolution map structurally prevents.
- An optional tracing argument reaches two adapters of four, silently.
- Only one adapter states where the spawned agent's output is captured; the others leave it to the generic operation. Consistent in effect, inconsistent in where the contract lives, so a reader comparing them cannot tell whether an omission is deliberate.
