# Routines — decision record

Companion to [README.md](README.md), for [#531 W3](https://github.com/m2ux/workflow-server/issues/531)
and the originating [#520](https://github.com/m2ux/workflow-server/issues/520). What is settled about
the design, what remains open, and the reason in each case — since the reason is what a later reader
needs in order to reopen one honestly.

The proposal itself is in [README.md](README.md); the evidence is in
[investigation.md](investigation.md), [drift-census.md](drift-census.md),
[conversion-trial.md](conversion-trial.md) and [placement.md](placement.md).

Five entries carry a **2026-09-06/07 marker**, where the corpus or the server has moved since the
entry was written: three where what the entry proposed has landed, one where it landed differently,
and one where the corpus settled a content question the other way. [gap-review.md](gap-review.md)
holds the pass that found them and the twelve gaps that remain.

Six of the entries below were settled by **converting a real activity** before anything was fixed,
rather than by reasoning about one; they are marked *(trial)*, and three of them overturn what this
record said beforehand. Three more, marked *(re-run)*, were settled by **executing** that conversion
through a prototype materialiser and the real contract derivation — see
[conversion-rerun.md](conversion-rerun.md). Those three are corrections to rules that read correctly
on the page and are wrong when run.

## Settled

**A routine is its own kind of definition and takes no place in the graph.** The alternative — promote
the shared run to an activity four activities route through — costs a hand-off per visit, and
establishing a fresh worker context is measured at 23,000 to 42,000 tokens with re-dispatch
accounting for about 31% of a 4.1-million-token run. Four sites would become four extra hand-offs
whose only content is a gate and two record passes. A guard already forbids an activity opening with
a decision, and this run opens with one, so the promotion is not available without splitting the run
in half. The size argument stated in #520 — that the run is smaller than any activity — does not hold
and is not the reason: at five steps the run is the median activity, and 63 of 122 activities are no
larger. The reason is where it sits, not how big it is.

**A routine is not an extension of the technique, and a technique gains no mechanical body.** The
alternative — an optional `steps:` section on the technique, materialised wherever a file carries one
— reuses far more than the promotion to an activity does, and it is worth naming what: `kind:
technique` already exists, so the whole step-kind reach problem the README works through does not
arise; resolution (`[workflow::]group::operation`), semantic versioning, container-contract
inheritance and a home rule are all in place; routine inputs and outputs are already the shape a
technique's take, as the proposal notes in two places; and the convergence migration becomes an edit
to one file rather than its deletion and replacement.

It fails on what a technique is. Three principles and two anti-patterns define the construct by the
absence of exactly this content: *Keep Session Interaction in Activities* makes techniques
session-blind and gives activities checkpoint `message` and `options`; *Keep Orchestration in
Structure* gives activities stage, checkpoints and transitions; *Atomic Techniques; Compose at
Activities* forbids branching
orchestration and technique-to-technique work calls; and `session-interaction-in-technique` and
`pass-orchestration-in-technique` each fire on a technique that gates a person or sequences sibling
operations. A routine's whole payload is checkpoints, loops and sequenced binds. The line is also
live rather than historical: the corpus moved the convergence loop out of a technique and onto
activity steps at seven sites on 2026-09-06, citing `pass-orchestration-in-technique` — so the
question "where does mechanical content inside a technique go" already has an answer, and the answer
was `steps[]`.

**The construct is called a routine, and `operation` is the candidate that fails hardest.** The
README dismisses the alternatives in one clause; this is the working, because a name is the thing
most likely to be reopened by someone who has not seen it.

`operation` is the corpus's word for a technique-group child, and it is load-bearing in five places:
`techniques/<group>/<op>.md` in the markdown loader, `group::operation` as the step-binding string,
`OpSignature` in the contract derivation, the principle titled *Bind Sibling Operations as Steps*,
and `pass-orchestration-in-technique`'s remedy. What rules it out is not the collision but the
meaning: **an operation is singular by construction.** The construct inventory says "one operation
per step; split compounds", `no-monolith-masking-steps` names a compound operation as a defect, and
the duplicate-step classifier polices the one-step-one-op mapping. A routine is by definition the
thing that becomes several steps, so `operation` would name it with the word whose invariant it
breaks, and a step reading `kind: operation` would promise an atomicity the construct exists to deny
— beside `kind: technique` steps, which keep it.

`routine` is free: 18 occurrences across `src/`, `scripts/`, `schemas/` and `workflows/`, every one
ordinary English — "routine block production", "RPC access is routine" — and none of them naming a
construct. Two frictions come with it and neither is a collision. It connotes a fixed unvarying run
where varying the run at the point of use is a headline use case; and outside this repository it is
the harness's word for a scheduled agent.

The remaining candidates fail on their own terms. `procedure` is loaded — *Separate Contract from
Procedure*, plus `procedure-in-protocol`, `procedure-in-capability`, `procedure-in-io-contract` and
`procedure-in-description` — so it is the corpus's word for HOW-content in the wrong home. `pattern`
is taken by the orchestration-pattern activities under `meta/activities/patterns/`, and it names the
activity-level alternative the first decision above rejects. `sequence` is how the schema describes
an activity's own steps. `macro` names the expansion rather than the thing named, and carries the
unhygienic-substitution connotation that prefixing and simultaneous substitution exist to refute —
and under the typed language it is a function, not a macro. `run` collides with a session execution.

**A technique body is delivered and a routine body is consumed, so one file cannot hold both.** A
`protocol:` crosses to a worker who executes it by judgement, after every ancestor container's
`Initial`/`Final` wrap and renumbering, and it counts against the eager-bundle budget. A `steps:`
body is read by the server and erased by materialisation; nothing reaches a worker as itself. Every
technique consumer — `get_technique`, the bundler, `composeLoaded`, the provenance annotator, and
eleven of the thirty-seven guard scripts — would need a per-file discriminator to know which of the
two it is holding, where the directory split gives each guard one answer for every file it reads.
The two sections cannot coexist either, a materialised routine having no fetch site for prose to be
delivered at, so the merge needs a mutual-exclusion rule plus opt-outs from inherited I/O (a routine
has no free variables) and from protocol wrap — three prohibitions where *Prefer Removing the Thing
That Needs a Prohibition* says one construct should retire instead. `internals` would land on the
schema surface of all 566 technique files to serve the few carrying steps.

Under the typed language the two dissolve into different things — a routine into a typed function
returning steps, a technique into an instruction payload — so merging them now buys a sum type to
unpick later.

**What survives of the alternative, for whoever reopens it.** Two things, and neither is the merge.
The narrower version of the reuse argument is to put routines *in* the techniques namespace —
`techniques/<group>/<op>.yaml` beside `<op>.md` — inheriting resolution, versioning and discovery
while keeping the schema and the guard partition distinct. It still needs the inherited-I/O and
protocol-wrap opt-outs, and it collides with the placement rule, which counts referring activity
files where technique resolution falls back to `meta`. Cheaper than the merge, dearer than a
`routines/` directory, and the trade is legibility of the namespace against two carve-outs.

The genuine overlap is elsewhere, and this proposal already half-concedes it under *Future features*:
`write-artifact` is bound at 42 step sites, almost always straight after the step that produced what
it persists. The shape that removes those 42 bindings is a **technique declaring where its product is
persisted** — an output-declaration change, not a steps body — and it shares nothing with the routine
mechanism, so it neither waits on this work nor argues for merging into it.

**The referring activity's declared contract is held against the routine's signature, not its body.**
This is the single change to `deriveActivityContract`, and it is the whole of what a routine buys
over any arrangement that shares a body without one. Today the run's seven variables are declared
four times over, once per host, for 28 declarations — and at two of the four hosts that is seven of
eight total writes, so the activity's contract describes the shared run rather than the activity.
Under a signature the seven declarations have one home, and each host declares only what its `with`
bindings read.

**A routine's steps are materialised into the referring activity at load, before the contract is
validated and before exit bindings are checked.** Everything downstream — the step manifest, artifact
composition, the guard suite, the end-to-end walker, the delivery composer — sees ordinary steps.
This is the arrangement the fragment mechanism already uses and the reason it can be retired rather
than layered over. The ordering matters: materialising *after* contract validation would erase the
signature boundary the previous decision depends on.

**Substitution is kind-aware: a body binding written `"{input_id}"` materialises as a reference when
the reference site supplied one, as a literal when it supplied one, and not at all when the value is
absent.** *(re-run)* Executing the materialiser found that rewriting the token root — the obvious
reading of the substitution rule below — turns literals into variable references: `concern_kind`
bound to the literal `open_questions` materialised as `"{open_questions}"`, which the derivation
would then look for and not find. The body's brace syntax means *the value of this parameter*, and
what that value is cannot be known until the reference site is read. An absent argument omits the
binding entirely rather than emitting an empty literal, which would override name-match resolution
with nothing.

**An output the reference site does not bind is dropped from the materialised bindings.** *(re-run)*
A technique step's unremapped output lands under its own id; applying that rule to a routine would
put the routine's internal name into the session. A routine output that may be left unbound says so
in its declaration; one that may not is a load failure when it is.

**Materialisation is a simultaneous substitution over every field of the body that can name a
variable, not a splice.** *(trial)* This overturns what this record said before the conversion was
run. A routine's input and output ids are the names in scope inside it, so a loop testing
`convergence_flag` has to be rewritten to test whatever the reference site bound that output to. The
fields needing rewriting — gates, condition blocks, a loop's continuation test and early exit, a
loop's collection and item variable, a checkpoint's id template and message, an option's effect
names and values, a technique binding's input and output maps, an action's target, message and
value, and a body step's technique name — are
exactly the fields the contract derivation already walks, so the implementation is that traversal
inverted. Simultaneity is a requirement, not a detail: an iterative rewrite over a binding mapping
`a → b` and `b → c` renames some occurrences twice. Building the splice first would mean building
this twice.

**A routine output is an output id carrying a variable declaration, and a reference site binds it to
a session variable under `outputs:`.** *(trial)* This overturns the earlier decision that outputs are
full declarations carrying a fixed `name`. The convergence run serves two domains that name the same
fact differently — six sites call it `has_resolvable_assumptions` and the seventh calls it
`needs_comprehension` — so a fixed name cannot express it, and today the technique takes those names
as *inputs*, which is why the writes are invisible to the producer index. Output binding is the same
shape a technique step's `outputs` remap already has; the declaration travels with the binding, so
the host contributes a typed, described, defaulted variable without restating it.

**A routine may reference another routine; a reference cycle is a load failure.** *(trial)* This
overturns the nesting non-goal. The first genuine conversion needs it: six sites want a run wrapped
in a loop and the seventh wants the run alone inside a loop the activity owns. The alternatives are
duplicating a three-step body — the duplication the construct exists to remove — or a parameter that
switches the loop off, which is the defect being converted away. Depth is bounded by cycle detection
rather than by a limit, and prefixes compose. What should be measured before it lands is the
resulting identifier length against the checkpoint response key.

**A routine declares inputs, outputs and internals, and an internal's name carries the host activity
as well as the reference site.** *(simulated)* An internal is a name the body's steps pass between
themselves and that never leaves — the convergence run has one, the assumption run has two, and those
two occupy eight write declarations across four activities today. Running the guard suite over a
converted corpus forced the category: with only inputs and outputs, such a name becomes an
activity-level production in every activity carrying the routine, and the crossing check reports it.

Prefixing from the reference site alone is not enough, and the guard suite forced that too. A step
identifier is unique within its activity; a variable name shares one flat namespace across the whole
workflow, so four sites sharing one reference id produced one internal name in four activities and
four crossing findings. The materialised name is underscore-joined from the activity and the
reference site, staying snake_case. The convergence conversion appeared to survive the weaker rule
only because its internal carried a hyphen the identifier tokeniser does not recognise, so the
derivation never saw the interpolation at all — a worse outcome than the finding.

**An internal declares an id and a description, and nothing else.** *(settled 2026-09-07)* No type,
no default, no value set — because an internal never enters the workflow's variable set, so nothing
merges it, nothing seeds it and nothing holds one declaration against another. A type would be a
field with no reader. The standing this gives an internal is the one the variable schema already
gives intra-activity dataflow: "a name written by an earlier step of the same activity is resolved
internally and is not declared here". An internal is that, scoped tighter — written and read inside
one run rather than one activity.

Two consequences follow and both are accepted. A value passed between a routine's steps is not
type-checked, in exactly the way a value passed between an activity's steps is not. And a checkpoint
effect inside a routine may target an internal, which no declared type validates; the guard that
type-checks such an effect is silent there and reports it where the target is an output.

An internal may serve as a loop's item variable — `current_assumption` is one at four sites — and may
hold a collection, under the ordinary id-shape rules. What it may not do is go undeclared: the
no-free-variables rule admits exactly three categories, and a body naming something outside them
fails the load, like every terminal state but `Checked`. A declared internal that nothing writes,
and one that nothing reads, each fail the load too — the treatment the signature check gives an
unwritten output and an unread input, for the same reason.

The corpus consequence is a subtraction: `challenge_findings` is a declared activity-level write at
six sites, so applying this rule removes six declarations the corpus has recently added.

**A nested routine reference's `with` and `outputs` maps are substitution fields.** *(simulated)*
Left out of the field list — which they were, "a technique binding's input and output maps" not
covering them — an inner routine's declarations are collected under names local to the outer routine
and land in the host activity's variable declarations. Observed directly: four routine-internal
output ids injected as session variables at all six assumptions sites.

**A routine has no free variables, and artifact filename templates are carved out.** *(trial)* Every
name a routine's body reads or writes is a declared input or output; otherwise the signature is not a
contract, the body is not checkable alone, and materialisation cannot know which names to rewrite.
The carve-out is required rather than convenient: an artifact name template is interpolated by the
worker at run time from the technique's own outputs, so a token in one names a value that does not
exist until the step runs, and applying the rule to it would make the rule unimplementable.

**An input may be declared `kind: technique`, and such a routine is checkable per reference site
rather than in isolation. The convergence family has no site for it; the `prism` per-unit passes
do.** *(trial; scope corrected 2026-09-07; sites found 2026-09-08)* Re-deriving the convergence run
from the landed loop block puts the analysis outside the shared body and gives the six sites that
share it one operation between them, so nothing there binds a technique by parameter. A different
family does: `prism`'s `02-adversarial-pass`, `03-synthesis-pass` and `05-behavioral-synthesis-pass`
are each one `forEach` loop over `analysis_units` binding one operation, and two of the three agree
on every field but the operation reference and the step id. The feature is therefore out of the
**first** version's scope with a stage of its own — stage 7 — rather than out of scope entirely, and
the three guarantees hold universally until that stage and conditionally after it: contracts derive
in isolation, routines walk from their declared inputs, and the artifact check runs once per routine,
each with an exception for the routines that bind a technique by parameter.

**The prism family is the benign case, for the reason the convergence family was.** The routine never
reads its parameter's outputs — the pass writes its artifacts and appends to `all_artifact_paths`
through an action the routine owns — so the bound question stays out of stage 7 entirely. The prism
measurement is in [higher-order-routines.md](higher-order-routines.md) and the convergence one in
[re-derivation.md](re-derivation.md).

The reasoning that admits the feature at all stands as first written. As originally measured, the
convergence run took the analysis it performs as a parameter. Refusing higher-order parameters
forces one routine per domain, which is the fork the technique's own rule forbids. Substituting the
literal before the derivation runs makes every signature resolve, at the stated price: the guard
holding a routine's declaration against its body runs once per reference site for such a routine,
and the isolated-checking guarantee carries that qualifier rather than being claimed universally.

**A technique parameter takes one reference and not a set of them, and the two obstacles are one
obstacle seen twice.** *(measured 2026-09-08)* A set-valued parameter would make the number of
materialised steps depend on an argument, which is the shape that turns a fan-out over a fixed set of
operations into one generic routine. Three things follow, and the first is only a restriction.

Arity has to be known when the definitions load, because materialisation sits between identifier
resolution and contract derivation. So the argument is a literal list at the reference site, which
excludes `substrate`'s runtime `agent_roster`, `prism`'s `analysis_units`, and every other
runtime-arity fan-out. Nothing is lost there: those are the sites already served by dispatching
briefs, and the feature's constituency is the fixed sets.

The two that bite are at the audit sweep, the corpus's one site running a fixed set of distinct
operations as in-context steps. Its six operations — the union of what
`workflow-design/activities/08-quality-review.yaml` and `10-post-update-review.yaml` bind — declare
three different output shapes: two carry a findings collection, a count and a path; three carry a
collection and a path with no count; `audit-schema-validation` declares `pass_count` and `fail_count`.
Every one prefixes its own domain. So no bound spans them, and each member needs a filename, a
content variable and sometimes a count gate supplied per site — which is the caller-named-write defect
A2 and A3 record, arriving by construction rather than by accident.

Neutral output naming collapses each member's argument to a bare reference and immediately creates the
second obstacle: N members then write the same flat name, and nothing in the schema accumulates step
outputs into a collection. `accumulate-never-overwrite` is prose the executing agent honours, and the
corpus's mechanical accumulation is a `set` action on a collection inside a loop body plus, on the
dispatch path, a `gather-results` operation returning a keyed collection. Neither serves an unrolled
sibling set. Remapping per member is per-member naming arriving from the other side.

**So the feature waits on a scope, not on a routine.** The prerequisites are B6 and neutral output
names on the audit family, both of which stand alone; what remains after them is where the members'
outputs land, which is the scoped-names item below reached from a fifth direction.
[higher-order-routines.md](higher-order-routines.md) carries the working.

**A routine describes a fan-out and does not enforce one.** *(measured 2026-09-08)* There is no
runner: `get_activity` delivers the activity file's YAML with textual injections applied, and the
worker executes the steps in document order, evaluating iteration, continuation tests and `when`
gates itself. Concurrency is the worker's, and the contract that makes a fan-out correct already lives
where it can be honoured — `scatter-gather`'s four rules, declared at activity level in 26 activity
files, with `harness-compat::spawn-concurrent` as the dispatch primitive and `spawn-agent` as the
sequential fallback. A routine contributes a name, a signature and one home for the steps. No stage
may claim parallelism as something the construct adds.

One consequence binds the design: `parallelism-is-optimisation` holds sequential mode always valid
and the `concurrency = 1` case of parallel mode, so a routine emitting the same steps for both modes
is conformant, and a routine needing to know the mode structurally is two runs by this proposal's own
test.

**The fan-out run is generic without any parameter, because its unit of work is a brief.**
*(measured 2026-09-08)* `decompose-work-units` emits `{ id, brief, tools_hint? }` where the brief is a
self-contained worker instruction, `compose-worker-briefs` turns each into a prompt,
`dispatch-workers` sends them, `gather-results` returns an ordered keyed collection with a
completeness verdict, and `synthesise-results` combines. A technique reference travels inside a brief
as data — which is how `substrate` dispatches ten agents from a roster and how
`cicd-pipeline-security-audit` dispatches per-submodule scanners, both binding the shared primitives
with their own adapters either side. So a routine over that run declares ordinary inputs, derives its
contract in isolation, and admits whatever arity the session computes. **A higher-order parameter buys
nothing where the members run in separate contexts**; it earns its cost only where they run as steps
in the caller's own.

**A capability parameter carries no declared bound, and neutral output naming is what makes one
unnecessary.** *(measured 2026-09-07)* The question is whether `kind: technique` should also state
what a substituted operation must satisfy — the bound that turns a higher-order parameter into a
generic one. Two families were measured, and they disagree about whether a bound is even writable.

The convergence run's parameter admits `review-assumptions::reconcile` at six sites and
`codebase-comprehension::deep-dive` at the seventh. Different groups, so no bound naming a group can
express the set; and their signatures share one input and no outputs, so the strongest structural
bound is *any operation reading `comprehension_artifact`*, which admits most of the corpus. **This
family needs no bound because the routine never consumes its parameter's outputs** — the analysis
lands in the bag under its own ids and the concrete challenge step reads them by name.

The audit family is the opposite case and the general one. Seven operations, of which three declare
`<domain>_findings`, `<domain>_finding_count` and `<domain>_findings_path`, two declare the same
without the count their callers' gates read, and `audit-schema-validation` declares `pass_count` and
`fail_count` instead. A shape exists and is held by hand. Parameterising the audit puts **three
body positions on names the parameter supplies** — the persist step's content, the gate's count, and
the filename — so unbounded substitution forces those three through as scalar arguments per site,
which is the caller-named-write defect A2 and A3 of [findings-register.md](findings-register.md)
record, re-created deliberately.

What resolves both without grammar is the fix B4 prescribes for one technique, applied to a
family: **neutral output names plus the reference site's `outputs:` remap.** Names that line up need
no bound to check, and neutral naming exposes the two audits missing a count rather than admitting
them under a permissive bound. A bound cannot be written by name while every member prefixes its
own domain, and writing one by shape alone is the type grammar this construct is designed to be
migrated into rather than to anticipate — under the typed language the parameter is
`(analysis: Technique<In, Out>) => Step[]` and the bound is inferred.

**The corpus has since run the first half of that, and it came out as predicted.** The convergence
technique's fold now declares four outputs over neutral names — `concern_document`,
`concerns_agent_resolvable`, `residual_opens_remain`, `residual_opens` — each bound at its site by
an output remap, which is B4's prescribed fix arriving independently and identically. The
convergence family therefore no longer illustrates the case for a bound at all: its parameter's two
operations agree on one input name and the routine reads none of their outputs. What is left
untested is the audit family, where neutral naming has not landed.

So the order matters, and it is the reason this is settled rather than open: **neutral naming lands
before a bound is reconsidered.** Until it does, a bound looks like the only way to express those
routines, which is how the question keeps reopening. Two further conditions belong with it. The
producer-plus-persist pairing was the leading second constituency and **may not exist** — finding B6
of [findings-register.md](findings-register.md) records five audits whose artifacts their callers
write a second time, and if the write steps are the redundant half, both audit-and-persist windows
in the census dissolve. B6 is live and unassigned, so that condition is unsettled rather than
pending. And enumerating permitted techniques stays rejected on its own grounds,
below: an enumeration points a dependency at callers, which a structural bound would not, and that
distinction is what a later reader should reopen on.

The general form of the question — which polymorphism mechanisms the typed language should take, and
which it should refuse — is surveyed in
`2026-08-31-typed-execution-redesign/polymorphism-survey.md`. Its answer for bounds is the same one
reached here, by a different route: a bound naming a *contract* is writable where a bound naming a
group or an output set is not, and declaring contract satisfaction independently of directory
containment is one of the two mechanisms it recommends designing against real sites now.

**A `with` binding admits the step binding's scalar union; a braced value is a reference and a bare
value is a literal.** *(trial)* This settles what was open decision 5. A collection argument stays a
JSON string because that is what every step binding in the corpus already does, so there is one rule
rather than two. On the literal-versus-reference reading, a routine reference is a new site with no
legacy, so it adopts the destination of the binding-resolution work from the start instead of adding
a 194th site to that migration.

**A loop's continuation test gets its own field, `continueWhile`, and `condition` is removed from
the loop step.** *(trial; landed 2026-09-06)* The conversion trial raised this as a blocker
on stage 6 and measuring it found something worse than an ambiguity: **six of the eight top-level
`doWhile` loops in the corpus never run their body**, because both mechanical readers take the
continuation test as an entry gate and both read an unbound variable as false. A `doWhile` names one
property and that is the property being lost. The corpus has already partitioned the two meanings —
no `forEach` carries a `condition`, all 19 `while`/`doWhile` loops do and every one is a continuation
test, and the three loops carrying both fields use `when` for entry and `condition` for continuation.
So the change writes down what authors do. The migration is a key rename at 19 sites with no
expression rewritten, the delivery path needs no change because the field it misreads simply stops
existing on a loop step, and the whole thing is worth doing whether or not routines are built. The
full case, options and acceptance criteria are in
[continuation-condition.md](continuation-condition.md).

**`breakCondition` is an early exit belonging to item iteration.** *(landed 2026-09-06)* This
folder proposed deleting it, on the measurement that it sits at zero sites. What landed keeps the
field and gives it a rule: a `forEach` may stop part way through its collection, and a repeat-until
loop states its stopping condition in `continueWhile`, so `check-loop-shape` rejects a
`while`/`doWhile` carrying one. Zero sites is a shape nothing has needed yet rather than a field
nothing can use. The consequence for a routine is one field: a routine body's `forEach` may carry an
early exit, so `breakCondition` is one of the fields materialisation substitutes over.

**Identifiers inside a materialised routine are prefixed from the reference step's id, with a full
stop as the separator.** `#` is taken — `CHECKPOINT_INSTANCE_SEPARATOR` is `#` and `checkpointBaseId`
splits on the first one, so a prefix using it would swallow the iteration discriminator. `::` is the
technique-path separator. A full stop collides with neither, and it reads as containment.
`reconcile-assumptions.interview.decision#{current_assumption.id}` states its reference site, its
loop and its base, and still resolves to one definition. Two references to one routine in one
activity are collision-free by construction. That case does not occur in the corpus — identifiers are
scoped per activity and no activity refers to a shared gate body twice — so the site prefix is
untested against real content, while the per-iteration discriminator it composes with is load-bearing
at eleven sites today.

**A routine's home is the workflow that owns the activity files referring to it, not the workflows
whose graphs include them.** The reference-counting rule that #520 proposes puts the assumption
routine in the shared home, because `remediate-vuln` borrows all four of its hosts from work-package
— the exact fault the placement rule exists to prevent, reached by obeying it. The reasoning is in
[placement.md](placement.md).

**A referrer is an activity file or another routine, and the set is closed transitively.**
*(settled 2026-09-07)* Nesting makes the placement rule partial: a routine referred to only by other
routines has no referring activity file, and the rule returns nothing rather than something wrong.
So a routine's referrers are the activity files referencing it plus the referrers of every routine
referencing it, and its home is the workflow owning that set. The corpus has no such routine yet —
the pass the convergence routine wraps is referred to by an activity directly as well as through the
loop — and the clause is adopted anyway, because the closure is the walk cycle detection already
performs and the alternative is a guard with no verdict.

**The same closure decides whether a routine declares an artifact.** *(settled 2026-09-07)* The
one-reference-per-activity limit on an artifact-declaring routine has to read through a nested
reference: a routine declares an artifact when its own body binds a technique declaring one, **or
when any routine it references does.** At one level the limit is evaded by wrapping — a routine
declaring nothing itself, referencing one that declares an artifact, referenced twice, writes one
filename twice. Depth itself needs no bound: cycle detection terminates the walk, and how long the
composed prefix may grow is the identifier-length item below.

**A routine declares no outcome and returns none.** Every activity that would refer to one declares a
single `done` exit, so nothing in the corpus can receive an outcome today. A routine's effect on
control flow is through the variables it writes, which the referring activity's own gates and exits
already read.

**A routine has no artifact prefix, and artifacts written inside one land under the referring
activity's prefix.** `artifactPrefix` is server-computed from the activity's filename position, and a
routine has no position. Nothing further is needed: the prefix is a property of where the work is
being done, and the work is being done inside the host activity.

**The fragment mechanism retires entirely with the migration.** Its rule half is already gone. Its
checkpoint half is the two bodies this proposal converts, and a shared gate that is *not* part of a
larger run becomes a one-step routine rather than keeping a second mechanism alive for that case. The
routine form is better for a lone gate on all three counts the fragment lacks: it carries a
signature, its home is computed rather than inherited from whoever declared it first, and its
identifiers are prefixed by the mechanism. Seven of the fragment guard's nine rules go with it —
`malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `unused-fragment`,
`inline-duplicate-of-fragment` and `undeclared-effect-variable`. `duplicate-rule` stays as it is;
`duplicate-checkpoint` stays with its remedy changed to name a routine.

**Delivery keeps two representations until the runner lands, and this is paid knowingly.** The
textual splicer that replaces a `ref:` line in raw activity YAML has to grow into one that replaces a
whole step block, nested steps and all, at the right indentation. It is built for a delivery
arrangement the runner ends, so it is written to be deleted — and while it lives, the two
implementations have to agree on every generated identifier. That agreement is the thing to test
hardest, because a disagreement shows up as a worker reading a step the server does not think exists.

## Settled at the system boundary

Ten interfaces between the construct and the system around it, settled on 2026-09-04. Two were
settled against a simulation that contradicted the first answer; both are marked.

**A guard reads the form it audits.** *(simulated)* Seven guards check how a definition is written
and read files as written, gaining `routines/` as a second directory to walk: the fragment guard, the
`when`-expression guard, the `set`-value guard, the self-composed-set guard, the
self-provisioned-input guard, description hygiene and activity–technique overlap. Four check how a
run behaves and take the loader's materialised activities: checkpoint entry, decision order,
review-mode gating and binding fidelity. The harness-adapter guard reads variable values rather than
steps and is unaffected. The two columns are each forced by a concrete case, below.

**The activity–technique overlap guard resolves a reference step to the routine's step bindings.**
*(settled 2026-09-07)* The rule is hard-zero: an activity's top-level `techniques[]` list may not
re-list a technique any of its steps binds. A routine breaks it in a direction neither form shows —
read as written the overlap is invisible, because the activity lists the technique and the routine
binds it; read through the loader the guard audits generated bindings, which the classification rules
out. So it stays in the authored column and learns the one thing it needs: a `kind: routine` step
contributes the bindings of the routine it names. This is the only guard where reading the authored
form is not by itself enough.

**A routine file is its own name scope, and the variable-model guard reads it as one.**
*(settled 2026-09-07)* `check-variable-model` requires a checkpoint effect's `setVariable` to name a
declared workflow variable, hard-zero. Inside a routine an effect names an output id or an internal,
neither of which is a bag name until materialisation, so every gate in every routine violates the
rule as authored. The classification above settles the direction: `setVariable` is a field an author
writes, and routing this guard through the loader would have it audit generated names — the failure
the `set`-value case is used to rule out. So it reads `routines/` as written, and inside such a file
a declared output or internal satisfies the rule while a workflow variable does not, a routine
having no free variables. The other four rules take the same scope: the two that compare a literal
against a target's declared type or value set apply where the target is an output and stay silent on
an internal, which declares none; the default-type rule checks a routine input's default; and the
`exists`-on-defaulted rule extends to an `exists` gate on a defaulted input, constant for the reason
it is constant on a defaulted variable.

**Guards divide by what they audit, not by how they load.** *(simulated)* Routing all twelve
raw-YAML guards through the loader was the first answer and it does not survive: the loader
materialises shared gate bodies, so `check-fragments` would check nothing, and materialisation
rewrites `when` expressions and `set` values, so `check-when-expression` and
`check-set-action-values` would audit generated text and report clean over ground they never read. A
guard auditing what will run takes materialised activities; a guard auditing what an author wrote
reads files as written and gains `routines/` as a second directory to walk. The second group needs no
loader, which is less work than the first answer, not more.

**A routine output declares no default, injection fires only into a gap, and an absent default is no
opinion.** *(simulated)* Injecting the routine's output declaration into the referring activity's
writes is right, and the first form of it fails on the corpus. A default is a seed applied at session
creation — a property of the variable, not of a run that writes it mid-flight — so a routine
declaring one collides with the owner's the moment they differ. Simulating the merge over the real
work-package workflow: a routine carrying a default that disagrees with the owner's produces a
contradiction; injection that replaces an existing host declaration produces a contradiction; and a
type-only declaration produces one too, because the merge compares an absent default as `null`.
Three amendments together give zero contradictions across all seven reference sites with every
variable keeping its owner's default: declare no default, inject only where the host declares
nothing, and treat an absent default as no opinion with a present one winning. The last is two lines
in `disagreement` and the merge's precedence.

**The absent-default change lands before any corpus conversion, not alongside it.** *(simulated;
landed 2026-09-06)* `disagreement` now compares two present defaults only, and `fillSilences` takes
the value from whichever site names one, so a routine output declaring no default merges cleanly.
Running the guard suite over a converted corpus against an unchanged server fails four guards —
activity variables, stealth isolation, references and workflow validity — with one message between
them, because a declaration disagreement is a load failure and takes down every loader-based guard at
once. The two lines are a prerequisite, not a tidy-up.

**An absent default is no opinion, corpus-wide.** *(simulated)* A declaration saying nothing about a
starting value agrees with any declaration naming one, and the one naming a value wins. Measured
before deciding: 113 variables are declared at two or more sites and every one already agrees about
whether a starting value is present, so the relaxation silences no existing finding. It gives up a
rule that currently holds — that authors are consistent about naming starting values — in exchange
for a routine output being able to stay silent about a seed it has no business setting.

**A variable a routine writes that nothing else declares is simply unseeded.** *(simulated)* The
copied declaration is what puts the name in the workflow's namespace, which is the part that matters;
a starting value is needed only where something reads before the routine has run, and the existing
reachability check already fails a read no path reaches a write for. The corpus deliberately spells
"not in that mode" as a value nobody set, so an unset value is not a defect.

**A routine may take a technique as a parameter, and the three checks that depend on it run per
reference site.** *(simulated)* Its contract, whether its body declares an artifact, and whether every
gate option is exercised all turn on which technique the parameter names, so each runs once per use
site rather than once per routine. The alternatives are worse: enumerating permitted techniques in
the routine points a dependency at its callers, and splitting the run per domain breaks the shared
protocol's own rule against forking in order to satisfy a checker.

**The declared-versus-derived comparison runs over copied declarations, and a mismatch means the
expansion is broken.** *(simulated)* The comparison looks circular and is not: the copy comes from the
routine's signature and the derived side comes from walking the expanded steps and reading every
technique they bind. Run over the converted comprehension activity it reports three real names, which
are the fold technique's over-declaration — a check that was supposed to be checking itself catching
a corpus defect on its first run.

**The differential test parses the text path's output and compares objects.** *(simulated)* Field for
field against what the object path built, over every activity in the corpus. Layout, indentation and
comment placement are ignored, since preserving them is why the text path exists; structural and
naming divergence is caught, including a step spliced at the wrong nesting depth. A prototype splicer
round-trips identically for a routine step nested inside a loop body, which is the hardest position
the corpus offers.

**A routine lives at `routines/<name>.yaml` with its own discovery pass and JSON schema.** Activity
discovery requires a numeric filename prefix and a routine has none. Declaring routines inline in
`workflow.yaml` reproduces the fault #519 raises; sharing `activities/` makes a filename convention
load-bearing.

**A session crossing the migration re-asks its renamed gates.** No key mapping, no refusal. A
definition change is a definition change, and a mapping table is permanent server cruft for a one-off
rename.

**A routine whose body declares an artifact is referenced at most once per activity.** Artifact names
carry the host's numeric prefix and the technique's bare filename, and identifier prefixing does not
reach them. Whether a body declares an artifact depends on the reference site when the analysis is a
parameter, so the check runs per site.

**The delivery budget is measured before it is ruled on.** A routine referenced twice contributes its
techniques to the bundle twice. There is no data and therefore no rule.

**Load order is ids, then shared gate bodies, then routines, then the derivation** — and identifier
population happens per definition, a routine's own body being filled within its own scope before
prefixing, with uniqueness re-checked in the merged scope.

**The textual path is built, with a differential test against the object path.** Both agree on every
generated identifier for every activity, on every run. Delivery stays byte-stable for activities
carrying no routine, and the implementation is deleted when the runner stops delivering activity text.

**A routine's version is its own.** Referring activities do not move when it changes — the property
the shared gate mechanism already has.

**The walker gains a routine-level entry**, walking a routine's steps against a variable set seeded
from its declared inputs so every gate option is exercised once. A routine binding a technique by
parameter is walked per reference site instead, for the same reason its contract is derivable only
there.

## Settled about the run itself

The four content questions the drift census parked, settled on 2026-09-04 and then measured. These
decide what happens at live sites and belong to whoever owns the work-package workflow's behaviour,
not to the construct.

**The log pass records the decisions, so it sits after the interview.** Two sites record before the
convergence loop and two after the residual interview, under one step name doing two jobs. The run's
pass records what the interview just collected; a site's own pre-analysis log step stays outside the
run, seeding rather than closing.

**The per-item gate offers three answers, and the corpus settled it the other way.** *(overtaken
2026-09-07)* This record chose two, on the measurement that the third answer's outcome value —
`corrected` — is read by no gate, condition or protocol, and concluded that the design resource
documenting the three-term vocabulary should be corrected to match the gates.

The corpus did the reverse and the reverse is now the state: the shared `assumption-decision` body
carries `resolve-inline`, `correct-assumption` writing `assumption_outcome: corrected`, and
`defer-to-stakeholder`; `review-assumptions/record.md` documents the three-term vocabulary as the
outcome set; and the one site that carried three options by hand now references the shared body like
the other three. So a correction is genuinely available to a user, an unread outcome value is a
record the assumptions log carries rather than a gate the corpus routes on, and the routine has one
gate body to materialise because the corpus already has one.

Two of the census's ten differences are converged by that change without a routine — the
inline-versus-reference split and the option count, the latter being one of the two the census
reserved for a person.

**The run happens once per run, at two sites.** Research and implementation-analysis reach
assumptions-review on every path, so their copies are followed by a definitive reconciliation and are
dropped. Measured, dropping the run from implementation-analysis removes 8,351 delivered characters
and three gates the server could not answer.

**The announcement is guarded on review mode alone, and that carries a one-line prerequisite.**
*(simulated)* Guarding on the residual-assumption flag as well reads a value the same activity
produces, which costs the announcement its place in the delivered bundle. Guarding on review mode
alone was chosen because that guard is answerable at hand-over — and measured, it was not, because
`is_review_mode` carried no default and an unseeded read is as unanswerable as an unproduced one.
Seeding it restores the bundling at both sites. The prerequisite is met: the flag carries
`defaultValue: false` on the work-package workflow file, and the absent-default merge change that
seeding it needed landed with it.

**A routine name resolves exactly as a shared technique's does, so the shared home is `meta` and
there is no separate question.** *(settled 2026-09-07)* This was recorded as open — is the shared
home `meta` or something new — and the answer is that the construct never needed one of its own.
A routine resolves as `[workflow::]name`: qualified means that workflow only, bare means the
referring workflow and then the fallback, which is the resolution shared gate bodies and technique
paths both already implement. Mirroring that resolution *is* choosing `meta`, because `meta` is what
a bare technique reference falls back to. One resolution rule for the corpus rather than two is the
argument, and it is a better one than the cheapness this record first offered.

The measurement supports it independently. Eight technique groups in `meta` are bound as steps, and
**all eight are bound by a workflow other than `meta`** — `verify-artifact-conforms` by fifteen
workflows, `workflow-engine` and `version-control` by seven each. Meta's technique layer is not a
domain workflow's library that others borrow from; it is already the shared library, and nothing in
it squats. That is a different situation from the one #519 raises, where generic rule texts sat in
`prism` and `work-package` — domain workflows lending content their subject does not cover.

What was left of the objection is that `meta` also runs: five activity files of its own plus a
patterns directory. A library that is also a workflow is confusing to read even when nothing in it is
misplaced. That is a real observation and it is not a placement question — the mechanism that
addresses it is a workflow declaring which of its definitions it exports, surveyed as module
visibility in `2026-08-31-typed-execution-redesign/polymorphism-survey.md` and belonging to the
typed language rather than to this construct. Placement stays computed from referring files, with
the fallback the rest of the corpus already uses.

## Still open

Two items, and they are the same question at two depths. Neither is blocked by anything above and
nothing above is blocked by them. They are named rather than numbered, because the numbers were
cited from six files and a list is a poor home for an identifier.

**The identifier-length item — how long may a generated identifier be?** Measured rather than
guessed:

| | Characters |
|---|---|
| Longest step id in the corpus today | 58 |
| Longest checkpoint response key today | 76 |
| Generated step id, one level | 32 |
| Generated step id, nested routine | 45 |
| Generated internal variable name | 69 |
| Generated step id, loop body | **105** |
| Generated response key, worst case | **124** |

So the conversions produce identifiers about 1.6 times the current maximum, not an order of
magnitude, and nothing anywhere bounds them: these are JSON keys in the session record and
arguments to `get_technique`, never filenames.

**It is a legibility question where a runtime emits the key it generated, and a correctness
question while a worker composes one.** `yield-checkpoint` assigns the per-iteration key to the
worker — expand the declared `#{...}` template, or choose the loop item's id or slug — so the key
is assembled by a model out of the delivered text, over a base carrying the reference site's
prefix and a template interpolating the internal's materialised name. `checkpointBaseId` splits on
the first `#`, so a mis-composed instance does not fail: it records a new checkpoint and asks a
question whose answer already exists. The reasoning, and the two answers available — the server
composing the id and the worker echoing it, or scope-resolved internals under the scoped-names item
— are in [agent-interpretation.md](agent-interpretation.md).

The interesting part is where the length comes from. The 105-character step id is a loop-body
checkpoint whose per-iteration discriminator interpolates the internal's materialised name, so the
internal's prefix inflates the step id as well as the variable. And the internal carries that
prefix only because materialisation puts it in the bag where the contract derivation sees it and
the crossing check compares it across activities.

**So this item and the internals rule are the same question asked twice.** Encoding uniqueness in
the name is one answer; the other is teaching the derivation about internals — the loader records
which names came from a routine's internals and the derivation excludes them — after which
`current_assumption` needs no prefix at all and both numbers collapse. That is a larger change
with a real hazard behind it, since two activities would then write one bag name, and it should be
weighed once there is a reason to care about the length.

The scoped-names item below is the third form of the same question, asked at the root.

**The scoped-names item — does a name inside a routine belong to a scope, or to a mangled global?**
The bag is one flat
namespace per workflow, and every workaround in this proposal that concerns names descends from
that: the internals rule and its underscore-joined activity-plus-site prefix, the 124-character
worst-case response key above, the crossing check reporting an activity-level production for a
value that never leaves a loop body, and the injection rule that has to fire only into a gap
because two declarations of one name are a load failure. A routine is already a lexical scope —
inputs, outputs and internals *are* its declared bindings, and it has no free variables — so the
flat bag is what forces the scope to be simulated in the spelling of a name rather than held by
the loader.

Scoping the names is the alternative, and it settles the length by removing the reason a name is
long — including the correctness half of it, since a worker composing a checkpoint key from a
short scoped name has far less to get right. It is a larger change than either answer there:
the session record's key layout, the crossing check, the producer index and `inspect_session`'s
variable view all read the bag as flat today.

**The construct is not blocked on it.** The mangled form is measured and materialises correctly,
and the cheaper answer to the correctness half is the server composing the checkpoint instance id
rather than the worker — so this item is where the length goes away, not where it becomes safe.

Where this reaches beyond routines is worth stating, because the question arrives from that
direction too. Merging the workflow and activity shapes into one nesting construct — a primary
activity with nested activities — is the other route to scoped names, and it is not the route to
take. Nesting by *reference* is already what a workflow is: `initialActivity` is the primary
activity and `activities:` is a reference list that crosses workflow boundaries, fourteen of
`remediate-vuln`'s fifteen entries being `work-package` files. Nesting by *containment* would cost
the thing the redesign record calls the best structural idea in the system — exits in the activity,
destinations in the workflow graph — because containment is the opposite of reference, and 21
activities appear in more than one graph. The two levels also differ by runtime boundary rather
than by shape: a workflow is a session and an activity is a dispatch, so one construct for both
needs a flag deciding which, and a construct plus a mode flag is the shape stage 6 exists to
remove. **Scoped names are available without any of that**, which is why the question is recorded
here as its own item rather than as an argument about construct shape.
