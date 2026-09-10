# Techniques as routine parameters, and whether scatter-gather can be one routine

Companion to [README.md](README.md), [decisions.md](decisions.md) and
[re-derivation.md](re-derivation.md).

The question: can a routine take techniques as input parameters, so that a run like scatter-gather is
written once as a generic routine and each site supplies the set of operations to be run in parallel?

Measured on 2026-09-07 against the server at `dc57988d` and `workflows` at `95660422`: all 122
activity files parsed, their 26 `forEach` sites classified, and the operations bound in the corpus's
fan-out and audit families read for their declared signatures.

## The short answer

**A generic parallel scatter-gather routine is available now, with no higher-order parameter and no
schema change** — because the corpus's existing parallel fan-out is generic over *data*, not over
technique references. Each unit of work travels as a composed prompt through
`orchestration-patterns::compose-worker-briefs` → `dispatch-workers` → `gather-results` →
`synthesise-results`, and that four-step run sits at four places in three activity files, one of them
twice in the same file. Naming it as a routine with a declared signature is the plain case the
construct already handles. It is the fan-out entry the future-features table already carries.

**A routine that takes a *set of technique references* and runs them as steps in the caller's own
context is mechanically feasible and blocked on two things that are not the routine mechanism.** It
needs the members' signatures to line up, and the audit family — the one live site — has six members
of which two carry the full three-output shape, three carry two outputs, and one declares something
else entirely, every one of them prefixing its outputs with its own domain. And it needs somewhere
for the members' outputs to land, which under the neutral naming that makes the parameter writable is
one collection rather than N scalars, and no construct in the schema accumulates step outputs into a
collection.

**The singular `kind: technique` parameter, on the other hand, now has sites.**
[re-derivation.md](re-derivation.md) retired it from the first version's scope on the finding that the
convergence family no longer needs it, which holds. Three prism activities and one prism-audit /
prism-evaluate pair are a different family, and they want exactly that feature. That is the finding
in this document with the shortest path to a stage.

## Two ways a fan-out is already generic, and only one of them needs a parameter

The corpus runs work in parallel in two quite different shapes, and the distinction decides
everything below.

**Generic over data.** The work unit is a self-contained prompt. `decompose-work-units` emits an
ordered array of `{ id, brief, tools_hint? }` where `brief` is "a self-contained worker instruction";
`compose-worker-briefs` turns each into `{ id, description, prompt }`; `dispatch-workers` sends them
as one `spawn-concurrent` batch when `dispatch_concurrency` exceeds 1 and one `spawn-agent` per brief
otherwise; `gather-results` returns `gathered_results` carrying ordered `items`, a per-id
`dispatch_manifest` and a `completeness` verdict; `synthesise-results` combines. The set being
parallelised is a runtime collection. The number of members is not known until the session runs.

**Generic over nothing.** The set is written out by hand. `cargo-operations::run-suite` names four
sibling operations in its protocol — check, clippy, test, fmt-check — starts them concurrently
against the same `{build_scope}`, waits for all four, and composes one envelope. `prism`'s
`behavioral-pipeline::independent-lenses` names four lens resources, dispatches them concurrently up
to four at once, and leaves the combining to a separate synthesis pass. Both are one operation whose
capability is *the whole fan-out*, with the membership baked in.

The user's proposal is a third shape: generic over technique references. It matters that the first
shape already covers every runtime-arity site, because that is where the corpus's parallelism
actually lives, and it needs nothing new.

### The set of techniques can travel as data today

A brief is a prompt string. Nothing stops a brief from naming the operation the worker is to apply —
that is how `substrate-node-security-audit` dispatches ten primary agents from an `agent_roster` its
`assign-roster` op computes at run time from the target profile, and the worker loads what it needs
through `get_technique`.

So a routine whose input is an ordinary collection of technique references, composed into briefs and
dispatched, is expressible under the construct as specified. The technique reference is a value, the
routine has no higher-order parameter, its contract derives in isolation, and the arity may be
whatever the session computes. **Where the members are to run in separate contexts, the higher-order
parameter buys nothing.** It is needed only when the members must run as steps in the caller's own
context, which is the sequential case.

## The four-step fan-out run, and one copy the census cannot see

| Activity | The run | Note |
|---|---|---|
| `meta/activities/patterns/01-orchestrator-workers.yaml` | compose-briefs, dispatch, gather, synthesise | after `decompose-work-units` |
| `meta/activities/patterns/04-isolated-fan-out.yaml` | compose-briefs, dispatch, gather, **validate**, synthesise | `isolation_mode` bound into compose; a completeness gate before synthesis |
| `meta/activities/patterns/05-lead-researcher.yaml` | compose-briefs, dispatch, gather, synthesise | after `plan-research-questions` |
| `meta/activities/patterns/05-lead-researcher.yaml`, inside `gap-followup` | compose-followup-briefs, dispatch-followup, gather-followup, synthesise-followup | the same four operations, second copy in the same file |

All four bind the same four operations. Nothing varies but one input (`isolation_mode`), one inserted
completeness gate, and the identifiers. That is a routine with at most one declared input.

[drift-census.md](drift-census.md) records this run as four steps at two sites, and the
dispatch-and-gather pair at three. The fourth occurrence is the census's stated blind spot arriving at
a live site: the window search reads top-level step lists only, and keeps a window appearing in two or
more activity *files*. `lead-researcher` carries the run twice within one file, once at the top level
and once inside its own `while` loop, so neither half of the method sees it. The census calls the gap
small and it is — one occurrence — but it is an occurrence in the family this document is about, and
it raises the fan-out run's constituency from two sites to four.

**A routine also answers the thing that repetition costs today.** `lead-researcher`'s follow-up loop
re-binds the four operations under four fresh identifiers, and nothing holds the two copies together.
Under a routine the loop body is one reference step, and the copies stop being expressible — the same
argument the convergence loop makes, at a smaller site.

## The singular technique parameter has sites after all

The corpus has three activities whose entire step list is one `forEach` loop over `analysis_units`
binding one operation:

| Activity | Operation bound | `prior_artifact_paths` | Entry gate on the body step |
|---|---|---|---|
| `prism/activities/02-adversarial-pass.yaml` | `full-prism::adversarial` | `all_artifact_paths` | `current_unit.pipeline_mode == 'full-prism'` |
| `prism/activities/03-synthesis-pass.yaml` | `full-prism::synthesis` | `all_artifact_paths` | `current_unit.pipeline_mode == 'full-prism'` |
| `prism/activities/05-behavioral-synthesis-pass.yaml` | `behavioral-pipeline::synthesis` | `behavioral_output_paths` | `current_unit.pipeline_mode == 'behavioral'` |

Two of the three are identical but for the operation reference and the step id. Every other field
agrees: `loopType`, `variable: current_unit`, `over: analysis_units`, `maxIterations: 100`, the
`target_content: "{current_unit.target}"` binding, and an accumulating `set` action on
`all_artifact_paths` carrying the same description. The third differs in two values that are
parameters, not structure.

One routine — a per-unit pass taking the operation, the prior-paths collection and the mode as
inputs — carries all three. Its signature has exactly the shape [decisions.md](decisions.md) reasons
about: a routine whose body binds a technique by parameter, checkable per reference site rather than
in isolation. And it has no bound problem, for the reason the convergence family had none: **the
routine never reads the parameter's outputs.** The pass writes its artifacts and appends to
`all_artifact_paths` through an action the routine owns.

A second, weaker pair sits at `prism-audit/activities/02-execute-analysis.yaml` and
`prism-evaluate/activities/02-execute-analysis.yaml`: both initialise two accumulators — one named
`completed_analyses` at each, the other `all_analysis_artifact_paths` at one and `all_artifact_paths`
at the other — then loop over scopes or groups binding `compose-trigger-context` (each workflow's
own), then `workflow-engine::handle-sub-workflow`, then `read-run-manifest` (each workflow's own). Two
of the three bound operations are per-workflow, so the routine takes two technique parameters and one
name parameter, and the `compose-trigger-context` pair would want reconciling first — they differ in
what they compose, not only in where they live.

And one site is the canonical sequential scatter-gather in full:
`midnight-system-review/activities/03-evidence-probes.yaml` sets `area_evidence_records` to `[]`,
loops `investigation_areas` binding one per-area probe, then binds one consolidation op. It is the
only one of the 26 `forEach` sites that pairs an accumulator initialiser, a single-operation body and
a following combine step. **On its own it is one site, so it does not justify a routine** — it is the
shape a scatter-gather routine would have, waiting for a second referrer.

## What a set-valued parameter needs, and where each part stands

Say a routine declares `inputs: [{ id: unit_operations, kind: technique, arity: set }]` and a
reference site supplies a list. Five things follow.

**1. The arity has to be known when the definitions load.** Materialisation runs between identifier
resolution and contract derivation, all at load. A set whose membership is a session variable cannot
be unrolled and cannot contribute a signature. So the argument is a literal list at the reference
site. This is a real restriction rather than a formality: it excludes `substrate`'s runtime
`agent_roster`, `prism`'s `analysis_units`, and every other runtime-arity fan-out — which are exactly
the sites the data-generic path already serves. **Nothing is lost, but the feature's constituency is
only the fixed sets.**

**2. Materialisation grows a repetition.** Today it splices one body per reference and rewrites the
names inside it; a set-valued parameter makes the number of emitted steps depend on an argument. The
identifier rule composes without change — an unrolled step's id comes from the member reference's last
`::` segment, which is what `defaultStepId` already derives, prefixed from the reference site as every
materialised identifier is. What does change is a rule the proposal states plainly: a routine may not
*vary its own steps by anything but a declared input*. A set-valued input is a declared input, so the
rule holds as written, but its intent — one body, one shape — needs restating for a body whose step
count is an argument.

**3. The members' signatures have to line up, and at the live site they do not.** The one place in the
corpus that runs a fixed set of distinct operations as in-context steps is the audit sweep, at
`workflow-design/activities/08-quality-review.yaml` (four audits) and `10-post-update-review.yaml`
(five). Their union is six operations, and these are their declared outputs:

| Operation | Declared outputs |
|---|---|
| `audit-expressiveness` | `expressiveness_findings`, `expressiveness_finding_count`, `expressiveness_findings_path` |
| `audit-conformance` | `conformance_findings`, `conformance_finding_count`, `conformance_findings_path` |
| `audit-principles` | `principle_findings`, `principle_findings_path` |
| `audit-anti-patterns` | `anti_pattern_findings`, `anti_pattern_findings_path` |
| `verify-high-findings` | `verified_findings`, `verified_findings_path` |
| `audit-schema-validation` | `pass_count`, `fail_count` |

Two of the six carry the full triad, three carry a pair with no count, one declares something else.
Every one prefixes its own domain. This is the measurement [decisions.md](decisions.md) records under
the capability-parameter item, unchanged at the current revision, and it is why a bound is not
writable: a bound naming a group cannot span them and a bound naming outputs cannot either while every
member prefixes differently. The prescribed fix is neutral output names plus the reference site's
output remap — the same fix the convergence fold has already had — and the recorded order is that
**neutral naming lands before a bound is reconsidered.**

**4. Each member needs more than its own reference, until neutral naming lands.** At
`10-post-update-review.yaml` the sweep is five audits each followed by a persist through
`work-package::manage-artifacts::write-artifact`, and each persist supplies a member-specific
filename and a member-specific content variable: `expressiveness-findings.md` with
`expressiveness_findings`, `conformance-findings.md` with `conformance_findings`, and so on. Two of
them carry a `when` on a member-specific count; two carry none, because their operation declares no
count; and `audit-schema-validation` has no persist at all.

So a set-valued argument over this family is not a set of technique references. It is a set of records
each carrying an operation, a filename, a content variable name and an optional gate expression —
three body positions on names the caller supplies, which is the caller-named-write defect A2 and A3 of
[findings-register.md](findings-register.md) record, re-created deliberately. That is the outcome
`decisions.md` predicted from the shape alone; this is it observed at the live site.

Under neutral naming the record collapses to the reference, because the filename derives from the
member's own id and the content from the member's neutral output.

**5. Neutral naming then forces a gather.** Once every member declares the same output ids, unrolling
N members writes N values to the same flat name. The variable bag is one namespace per workflow and
nothing in the schema accumulates: `scatter-gather`'s `accumulate-never-overwrite` rule is prose the
executing agent honours, and the corpus's mechanical accumulation is an `action: set` on a collection
inside a loop body plus, on the dispatch path, a `gather-results` operation that returns a keyed
collection. Neither serves an unrolled sibling set. So the routine either remaps per member — which is
per-member naming again, arriving from the other side — or the gather becomes a construct, which is a
scoping change to the variable model and larger than this feature.

**The two obstacles are therefore one obstacle seen twice.** Per-member names make the parameter
unwritable as a bound; neutral names make the outputs collide. What resolves both is a scope, which
is the item [polymorphism-survey.md](../2026-08-31-typed-execution-redesign/polymorphism-survey.md)
lists as *adopt, arrives with the compiler* and which the routine record already carries as an open
question about internals being scope-resolved rather than name-mangled.

## A routine describes a fan-out; it cannot enforce one

Worth stating, because it bounds what the feature could ever buy. There is no runner.
`get_activity` delivers the activity file's own YAML with textual injections applied, and
`activity-worker.md` directs the worker to execute the steps in document order. Iteration,
continuation tests and `when` gates are all evaluated by the executing agent; the schema says so
field by field.

So concurrency is the worker's, today and under any version of this feature. The contract that makes
a fan-out correct already lives where it can be honoured: `scatter-gather`'s four rules — one gather
contract across two scatter modes, accumulate-never-overwrite, isolation-then-combine,
order-is-preserved — declared at activity level in 26 activity files, with
`harness-compat::spawn-concurrent` as the dispatch primitive and `spawn-agent` as the sequential
fallback. A routine adds a name, a signature and one home for the steps. **It adds no parallelism,
and a proposal for it should not claim any.**

One consequence is worth carrying: `parallelism-is-optimisation` says sequential mode is always valid
and is the `concurrency = 1` case. A routine that emits the same steps for both modes is consistent
with that rule; a routine that needs to know the mode structurally is not, and would be two runs by
the proposal's own test.

## Where the canon already leans

Two catalogue entries touch this from opposite directions, and both favour moving a fixed set to the
bind site rather than keeping it in prose.

`bind-site-is-orchestration-truth` (AP-107) flags prose outside activity YAML that enumerates an
ordered or complete list of technique passes not generated from the authoritative bind sites, and its
exemptions admit "a technique that only applies a sibling without listing a parallel set" — so a
prose-listed parallel set is the shape the entry is uneasy about. `run-suite`'s protocol and
`independent-lenses`'s protocol each list one.

`capability-as-op-inventory` (AP-123) makes the same point about a capability statement that must be
edited whenever a nested op is added or renamed. `run-suite`'s capability names the four checks by
what they cover.

Against that, the entries the survey cites for refusal apply to the *bound*, not to the parameter.
`no-monolith-masking-steps` (AP-18) forbids one operation with two signatures selected by a mode
input, which a set-valued parameter does not create.
[polymorphism-survey.md](../2026-08-31-typed-execution-redesign/polymorphism-survey.md) refuses
mechanisms that make an irregular shape expressible and adopts mechanisms about where a thing lives.
By that test a set-valued technique parameter over the audit family as it stands is the first kind —
it makes six irregular signatures bindable — and the same parameter over the family after neutral
naming is the second.

## Whether to move the corpus onto the scatter-gather primitives first

Asked as a possible prerequisite: convert the hand-written fan-outs to bind
`orchestration-patterns`'s dispatch ops before the routines work lands. **The answer is no, and
mostly because it has already happened.**

`substrate-node-security-audit/activities/03-primary-audit.yaml` binds
`orchestration-patterns::dispatch-workers` and `gather-results` directly, with
`dispatch-sub-agents::compose-roster-briefs` and `collect-results` as domain adapters either side —
the compose op's protocol states that the binding activity binds `dispatch-workers` next, and the
collect op consumes `gathered_results.items`, its `dispatch_manifest` and its `completeness` verdict.
`cicd-pipeline-security-audit` has the same arrangement through its own `dispatch-scanners` adapters.
`analyse-challenge::challenge`, the pass at seven sites, applies the `scatter-gather` technique for
its scatter, keeps per-perspective findings isolated, and leaves merging to a separate `combine` op.
The strategy technique is declared at activity level in 26 activity files. There is no backlog of
non-conformant fan-outs to convert.

What sits off the primitives sits off them for reasons already written down:

| Site | Why it stays | |
|---|---|---|
| `cargo-operations::run-suite` | Its group rule requires foreground shells owned by the caller and forbids `run_in_background` inside a worker, because the OS process group dies with the worker and the build is lost | Conversion would violate the contract |
| `behavioral-pipeline::independent-lenses` | The four lenses are followed in the same context by graph augmentation that reads each lens's output and appends measured evidence | Conversion puts the augmentation past a gather |
| The `workflow-design` audit sweep | The caller gates on per-audit counts, and `isolation-then-combine` forbids binding per-instance outputs into the parent bag by name | Conversion needs a combine op written first |

**And it would not help this work.** The fan-out routine's constituency is the three
`meta/activities/patterns/` files, which are already on the primitives; a conversion pass adds sites
at the technique layer, and a routine lives at the step layer. The one prerequisite worth taking
early is not a conversion: settling B6 and giving the audit family neutral output names is on the
critical path for the set-valued parameter and stands on its own merits.

## Recommendation

**Take the fan-out routine, without any higher-order machinery — stage 8.** Four occurrences of one
four-step run across three files, one input's worth of variation, and a fourth copy inside one file
that the drift census cannot see. It is an ordinary routine under the construct as specified, and it
needs nothing after stage 4.

**Revive the singular `kind: technique` parameter against the prism trio — stage 7.** The
re-derivation retired it for want of a site; the prism per-unit passes are that site, and they are the
benign case — the routine never reads the parameter's outputs, so the whole bound question stays out
of it. Two of the three sites are identical but for the operation reference. This restores the
feature's cost to what `decisions.md` already priced: three checks run per reference site rather than
per routine.

**Hold the set-valued parameter until neutral output naming lands on the audit family — no stage.**
Its only
live site is the audit sweep, and until the six members agree on their output ids the argument is a
set of records carrying caller-named writes, which re-creates a defect the register already holds. The
sequence is fixed and short: settle B6 (five audits whose artifacts their callers write a second
time — if the write step is the redundant half, both audit-and-persist windows dissolve and the sweep
is smaller than it looks), give the family neutral output names, then reconsider the parameter with
the gather question as its remaining blocker.

**Do not add a parallel step kind.** The proposal's own measurement applies: step kinds are tested in
57 places across 19 files with no exhaustive switch anywhere, `flattenActivitySteps` recurses into a
loop body and nothing else, and eight further walks recurse independently. A kind that survives
materialisation compiles clean everywhere and is handled nowhere. A fan-out has no need of one — the
dispatch is an operation, and the concurrency is the worker's.

## What this does not cover

- **Whether the fan-out routine's home is `meta`.** The three referring activities all live in
  `meta/activities/patterns/`, so the computed placement rule puts it in `meta` for the ordinary
  reason rather than the shared-home one. Worth confirming against
  [placement.md](placement.md) rather than assuming.
- **`prism`'s `independent-lenses` and `cargo-operations`'s `run-suite` as conversion candidates.**
  Each is one operation, so each is one site; neither justifies a routine on its own, and both would
  need their fixed sets moved to a bind site before they could share one.
- **The `compose-trigger-context` pair.** The prism-audit / prism-evaluate routine needs those two
  operations reconciled or parameterised, and they differ in content rather than in placement. Not
  read closely here.
- **The raw-text path for an unrolled body.** The proposal names textual materialisation as its
  largest cost, and a body whose step count depends on an argument makes that splicer emit a variable
  number of blocks. Not measured.
