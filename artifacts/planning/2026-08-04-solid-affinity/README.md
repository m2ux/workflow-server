# SOLID affinity of the workflow framework — findings and intuitions

Written for later consideration, not as a change proposal. Three review lenses ran against superproject `f2cde163` / corpus `b107c4f0`: substitutability across polymorphic call sites, segregation measured against the delivery budget, and coverage of the anti-pattern catalogue. What follows separates what was measured from what is judgement, and says which of the judgements I hold weakly.

## Why the framework has real affinity, not a metaphor

The schema already names the nouns the principles are about, which is unusual. A **technique** is an interface: `## Inputs` / `## Outputs` with per-field optionality, a `## Protocol` that is its body, and `## Rules` that are its invariants. **Apply** is a call. An **activity** composes calls into steps with gates. **Actors** — orchestrator and worker — are clients, and they receive different bundles. **Delivery** is the linkage step, and on this branch it has a byte budget.

So the principles are not being borrowed by analogy. They land on constructs that exist.

Two properties make the fit unusual in ways worth stating up front.

**The polymorphism is textual and late-bound.** A technique is normally reached by a `technique:` binding, which every guard reads. But it can also be reached through the *value of a variable* — `Apply {agent_technique}`, `Apply {harness_technique}'s {harness_operation}`, `invoke the bound {analyse_technique}`. Those calls resolve at runtime from a string. This is the single most generalisable finding of the pass: **wherever a technique is reached through a value rather than a binding, argument conformance is unchecked.** `check:binding` verifies the *caller's* declared inputs and never the indirect callee's. Every substitutability defect below lives in that blind spot.

**Segregation has a price here, which it usually does not.** ISP is normally an aesthetic argument. On this branch a worker context may accumulate `context_tokens × 0.35 × 4` characters before the server refuses the next activity, so content delivered to an actor that cannot act on it is measurable in the bound. That makes ISP the one axis where a violation can be quoted as a number.

## Affinity, principle by principle

Ranked by how load-bearing the principle is here rather than by how much prose it generates.

**Dependency Inversion — the framework's native strength.** The corpus is essentially a DIP machine: `{braced}` references are the abstraction, literals are the concretion, and roughly seventeen catalogue entries enforce it. `io-agnostic-contract` (an I/O naming a specific caller) and `technique-stage-agnostic` (a technique encoding graph position) are DIP stated in domain terms. One honest qualification: with no injection mechanism in the schema, what these enforce is *acyclic layering* — technique below activity below workflow — plus an abstract bind contract, rather than DIP's abstraction-injection proper.

**Interface Segregation — best-instrumented, because it can be counted.** Measured below. Covered by nine entries and three principles, none of which I had identified before the pass.

**Open/Closed — pervasive under another name.** Every entry whose Detect asks *must this be edited when something else changes?* is an OCP entry — roughly twelve of them, filed under *drift on extension*. `capability-as-op-inventory` is the purest: its Detect is literally the edit-on-extension test.

**Single Responsibility — present, but split across three families that do not know they are related.** Cohesion at op grain (`no-monolith-masking-steps`, `no-duplicate-technique-steps`), section purity within one surface (thirteen entries — the largest family in the catalogue), and cohesion by actor (`worker-rule-reach`, `rule-audience-bucket`, `artifact-audience-declared`, `instruction-narrates-an-actor`). Martin's formulation — a module answers to one actor — is the third of those, and it is the one this branch kept tripping over.

**Liskov — the gap, and the reason it is a gap is structural.** One entry covers a slice of it (`unproduced-value-read`). The organising observation, which I hold strongly because it survived three independent checks: **every cross-surface Detect in the catalogue looks for duplication or contradiction — sameness where difference belongs. Not one looks for divergence where uniformity is required.** That second family is Liskov, and the catalogue has no vocabulary for it.

## Compliance — what was measured

### Segregation, in characters

Worker, first `get_activity`, work-package: 15 activities, 1,029,165 chars, median 72,049. The fixed rules-and-techniques floor is 22,477–27,123 chars — **33–38% of a median delivery** before the workflow says anything of its own. A synthetic one-activity, one-technique workflow still costs a worker 18,388 chars.

Content the receiving actor has no tool, input, or observable for:

| finding | cost |
|---|---|
| Container-declared I/O riding with every operation — 618 entries, 8.9% named in the op they ride with, 2.1% templated in its protocol | 107,572 chars, 10.5% of the walk |
| Container rules re-merged inside every bundled step, 16,453 of it byte-identical within one response | 75,032 chars |
| `variable-binding`'s authoring-time conventions delivered to a runtime reader — 5 of 6 rules govern how a binding is *written* | 2,957 chars per delivery, 90.6% of that block |
| `rules.activity` describing a stage 14 of 15 workers are not in | 1,273 × 14 |
| A four-rule checkpoint group where 80% is the other actor's duty | 657 chars per delivery |

Aggregate unactionable content: **5,439 chars per delivery**, 7.5% of a median work-package activity.

**The calibration that keeps this honest:** at a 200k declared window the *activity cap* binds before the character budget (3 × 72,049 = 216,147, or 77% of 280,000). Removing all 5,439 chars buys no additional activity there. It matters below roughly 103k declared tokens, where the threshold would fall to about 96k. So the ISP findings are real and countable, and their present value is smaller than the numbers suggest.

**The bucket partition is sound but covers almost nothing.** `rules.workflow` / `rules.activity` / `rules.universal` deliver exactly as declared — verified by probe — and no workflow puts a cross-actor tool token in the wrong bucket. But buckets exist only on `workflow.yaml`. Of the rule characters reaching a work-package worker, **9.0% are bucketed**; the orchestrator's figure is 4.3%. Every leak above lives in the 91–96% that carries no actor discipline at all. The container `TECHNIQUE.md` is the one surface in the tree with no audience mechanism.

### Substitutability

Eight polymorphic call sites; two guarded. The unguarded ones and what they hide:

**`resume-from-checkpoint` does not produce the postcondition its caller declares.** `resume-worker` declares its output as one of two tagged envelopes. `resume-from-checkpoint` has no `## Outputs`, no rules, and a two-line Protocol ending "continue from the paused step". `compose-prompt` states the abstraction's precondition as three fields it declares none of. The failure path is real: `continue-agent::resume-is-optimisation` permits a resume to degrade to a fresh spawn, and `cline` and `generic` explicitly do so. On that path the agent receives only the resume stub — no `get_activity`, so no worker bundle, no envelope obligation — while `resume-worker` waits for an envelope nothing told it to produce.

**The harness adapter set is contract-free and enumerated twice.** Four adapters, sections `Capability > Rules` only, no declared I/O. The obligation to expose exactly `spawn`, `resume`, `concurrent` lives in one prose sentence. The set is enumerated in the resolution map — which calls itself "authoritative, edit only here" — and again in `src/loaders/core-ops.ts`, whose own comment explains why it must be. Both must agree; nothing checks it. Two of four adapters additionally require a `subagent_type` argument the abstraction cannot supply.

**Mutations that pass 23 guards and 924 tests:** a fifth adapter declaring only `spawn`; a sixth renaming `spawn` to `spawn-agent`; a map row pointing at a file that does not exist; deleting `concurrent` from an existing adapter; an `agent_technique` implementation with an extra required input. The reverse direction — a core-ops entry with no file — *is* caught, by `definition-lint` and the walk. The gap is exactly one direction.

**`analyse_technique` is a switch wearing an abstraction's clothes.** Its two implementations have disjoint required inputs, the sole binding that selects one passes none of that one's three required inputs, and the abstraction's own Protocol special-cases on the implementation's identity. `run-loop::parameterize-dont-fork` asserts the opposite in the same file.

**The tell that makes the case in one sentence:** the corpus's largest polymorphic set — 60+ prism lenses through `{lens_name}` — *is* guarded, and guarded on the right property. `check:prism-lenses` proves reachability and coverage and deliberately does not check shape, because `lens-is-program` declares shape variance as the contract. Same construct as the harness set. Reachability guarded there, unguarded here.

## What I would and would not build

**One guard: harness-adapter-set closure.** Prove that three enumerations are one set — map rows, adapter files with a `### <slice>` for every declared slice, and `CORE_ORCHESTRATOR_TECHNIQUES` — in both directions, with no orphan adapter file. Baseline is clean today (4 rows, 4 files, 4 refs, 3 slices, 12/12 slices present), so it lands green and every future failure is real. It catches all four uncaught harness mutations. The map is prose, so a reformat must surface as *unmeasured* rather than pass; the repo already has `assertScanned` for exactly that.

**Three guards I would not build, with reasons.**

*Not a relevance gate on container rules or inherited I/O.* Both ratios are computable — 3 of 29 operations referenced, 2.1% of inherited entries templated — but relevance is a judgement, not a structure. A container rule is *meant* to be cross-cutting. A threshold would fail the corpus on its intended design. Report both as warn-only metrics beside `bench:batch` instead, so fan-out is visible and a regression is arguable without a number pretending to be a fact.

*Not "names a tool this actor cannot call."* Ran it: five hits, one true positive. Three are legitimate prohibitions and one an exemption list. Making it useful needs negation-awareness over prose.

*Not a substitutability guard over `agent_technique` or `analyse_technique`.* Their members differ by design — worker, orchestrator, resumption. A narrower "every `agent_technique` value declares Outputs" lands **red with three violations**, which makes it a canon repair rather than a guard.

## Canon — the honest conclusion

**Importing SOLID vocabulary is barred by the catalogue's own rules, and I was wrong to reach for it.** A Creation Rule states entry names identify the *smell*, not the *stance*; SOLID axis names are stance names. *Taxonomy-as-Detect* bars handing an auditor a five-axis framework. And three axes are so well covered that an axis-level entry would be an *Umbrella restatement*: a DIP entry would yield four findings for one caller-named input description, against a family of seventeen.

**One addition is worth considering: variant parity, named for the smell.** Where two or more operations are selected by one discriminator at one bind site, compare their declared Inputs, Outputs and artifacts — flag a required input the bind site supplies on one arm only, an output a sibling omits where a common consumer reads them uniformly, and a variant that writes the discriminator a sibling's gate reads. It collides with nothing, and it closes an exposure the catalogue's own Fixes create: `artifact-name-is-filename` and `no-duplicate-technique-steps` both prescribe "split into one op per mode and gate the bind sites", after which nothing checks the siblings agree. Live instance: `prism/activities/12-adaptive-pass.yaml` — three ops, three contracts, one consumer, and stage-2 rewriting the discriminator stage-3's gate reads. Only the per-file defects fire today. Two authoring cautions: it would be the first cross-variant Detect, so the scan scope must be bounded inside Detect or it becomes unapplicable; and the schema has no enum variable type, so a member-set version of the same idea would have to read prose, which is barred.

**Five hazards that are not structurally checkable**, and so argue for canon or prose rather than a guard: `cline`'s resume fallback "via generic" is unreachable through the map that resolves it; `foreground-always` admits two readings, one adapter forbidding background dispatch and another permitting it conditionally; `{description}` reaches two adapters of four; only one adapter states where the output is captured; and — the sharpest — `resume-is-optimisation` and `resume-preserves-delivery-scope` pull against each other, because a degraded resume re-binds the identity into a context holding nothing, so reference delivery returns unchanged markers for bytes that context never received. The mitigation exists, on a surface the resumed agent is not directed to read.

## What I hold weakly

SOLID was applied **after** the findings, not before. It explained faults already in hand and pointed at one hole nothing covered; it did not generate the findings. I would use it as a classification and gap-finding lens, not as a discovery method, and I would not have reached the Liskov gap without first noticing that every cross-surface Detect looks for duplication.

The affinity claim is strongest for DIP and ISP, where the constructs are literal, and weakest for LSP, where "substitutable" has to be read as "a caller reaching this through a value gets what the value's contract promised" — a fair reading, but a reading.

## Corrections this pass made to my own earlier mapping

Recorded because they were confident and wrong. `single-rule-authority` is DRY, not SRP — one invariant in two homes is the converse of one home with two responsibilities. `capability-as-op-inventory` is OCP. `no-one-step-rules` is placement. `inherited-rules-re-enumerated` is pure OCP, not ISP. I had found one of roughly twelve OCP entries and about a fifth of DIP's, mapped the two actor-cohesion entries under ISP when they are SRP-by-actor, and called Liskov empty when one entry covers a slice of it.
