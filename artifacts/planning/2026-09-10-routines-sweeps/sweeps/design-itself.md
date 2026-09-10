# The routines design, swept against itself and against the repository

Sweep of the routines proposal at [2026-09-03-routines/README.md](../../2026-09-03-routines/README.md)
and its twelve companion records. Server tooling at `9ca71c19` on `main`; corpus at `2b8b7215` on
the `workflows` branch; planning artifacts on `.engineering`.

What binds this surface together is that the subject is a document rather than a tree. Nothing in
the design is built — `ls workflows/*/routines` reports no such directory,
`src/schema/activity.schema.ts:167` declares `StepSchema` over exactly four members, and
`grep -rn routine src/` finds nothing. So every construct below is either a thing the design
proposes to ship, or a statement the design makes about the repository that the repository can
answer. Two questions produced the candidates: where the design adds a second path or a prohibition
that removing something would obviate, and which of its load-bearing claims the repository
falsifies. **Nineteen candidates**, of which five say do not ship it, five say ship it smaller, one
says the second path earns its keep, and eight are claims the repository contradicts.

The two heaviest findings are worth naming before the table. The design's central invariant — that a
routine reads no name it does not declare — is contradicted by the design's own worked example, by
the corpus run that example is drawn from, and by both signatures in the document the proposal tells
a planner to read instead of the conversion artifacts. And stage 1's fourth acceptance criterion
asks for a stored, monotonically falling guard baseline, which is a mechanism this repository
removed on purpose and recorded its reasons for removing.

Every figure below was taken from the repository. Where it disagrees with the proposal, or with the
ground-truth records this sweep was handed, the disagreement is stated and both figures given.

---

## Verdicts

| Id | Construct | Verdict | Stage |
|---|---|---|---|
| CV1 | A routine whose body declares an artifact may be referenced once per activity | REMOVE | 4 |
| CV2 | The textual splicer over raw YAML, as a second representation | NARROWS | 3 |
| CV3 | `check-activity-technique-overlap` resolving a reference step to routine bindings | REMOVE | 4 |
| CV4 | `internals` as a third declaration category | REMOVE | 3 |
| CV5 | A routine referencing another routine, delivered at stage 3 | NARROWS | 3 |
| CV6 | A per-output "may be left unbound" marker, with a load failure policing it | NARROWS | 3 |
| CV7 | A bare `with` argument reads as a literal | NARROWS | 3 |
| CV8 | "A routine has no free variables" | STALE | 3, 4 |
| CV9 | "Materialisation runs after identifier resolution and before contract derivation" | STALE | 3, 4 |
| CV10 | "Six guards consume the loader today" | STALE | 4 |
| CV11 | "A guard reads the form it audits and the column assignment follows" | STALE | 4 |
| CV12 | Stage 1's guard runs from a baseline that can only fall | STALE | 1, 6, 8 |
| CV13 | The technique-valued input parameter | NARROWS | 7 |
| CV14 | "Delivery is byte-identical", and per-site bundled characters reviewed | STALE | 3, 5, 6 |
| CV15 | "A shared run has a use — refused at load" | STALE | 4 |
| CV16 | "Every activity that would refer to one declares a single ending" | STALE | none |
| CV17 | Stage 8's four occurrences of one run | STALE | 8 |
| CV18 | The absent-default merge change, described as two lines still to write | STALE | 3 |
| CV19 | An exhaustiveness assertion that fails to compile when a kind is added | NARROWS | 3 |
| CV20 | The reference-site `outputs` remap | KEEP | 3 |

---

## CV1 — The once-per-activity artifact prohibition

**Construct.** README:1143-1147. An artifact filename is the host activity's numeric prefix plus the
technique's bare filename, and a routine has no prefix of its own, so "two references to one
artifact-declaring routine in one activity would write one filename twice. **A routine whose body
declares an artifact may be referenced at most once per activity**; a second reference fails the
load." A routine declares an artifact when its own body binds a technique declaring one "or when any
routine it references does — read at one level the limit is evaded by wrapping the declaring routine
in one that declares nothing." Stage 4's criterion carries it: the artifact-declaration check uses
the same transitive closure as placement (README:874-875).

**Measured references.** The mechanism it describes is real. `src/tools/workflow-tools.ts:1793-1796`
records that the worker names artifacts as `{artifactPrefix}-{bare_filename}`, and the prefix comes
from the activity filename at `src/loaders/workflow-loader.ts:95` via
`parseActivityFilename` (`src/loaders/filename-utils.ts:6-10`).

The hazard, however, is not a routine's. One artifact filename declared by two or more step bindings
in one activity is what the corpus does routinely. I parsed all 122 activity files, resolved each
`step.technique` to the technique file's `#### artifact` declarations, and counted filenames per
activity: **11 activity files carry 24 (filename, activity) pairs where two or more step bindings
declare the same artifact filename**, the largest at four steps.

| Activity file | Filename | Step bindings |
|---|---|---|
| `work-package/activities/10-post-impl-review.yaml` | `change-block-index.md` | 4 |
| `work-package/activities/04-research.yaml` | `assumptions-log.md` | 3 |
| `work-package/activities/05-implementation-analysis.yaml` | `assumptions-log.md` | 3 |
| `work-package/activities/07-assumptions-review.yaml` | `assumptions-log.md` | 3 |
| `work-package/activities/08-implement.yaml` | `assumptions-log.md` | 3 |
| `plain-language/activities/02-source-analysis.yaml` | `source-analysis.md` | 2 |
| `workflow-design/activities/08-quality-review.yaml` | five filenames | 2 each |
| `workflow-design/activities/10-post-update-review.yaml` | four filenames | 2 each |
| `workflow-design/activities/06-scope-and-draft.yaml` | three filenames | 2 each |
| `workflow-authoring/activities/01-intake-and-context.yaml` | `change-brief.md` | 2 |
| `midnight-system-review/activities/02-area-derivation.yaml` | `investigation-plan.md` | 2 |

The step ids say why. `analyze-source` then `revise-source-analysis`; `audit-conformance` then
`re-audit-conformance`; `code-review` then `re-code-review`. Writing one artifact twice in one
activity is how the corpus expresses produce-then-revise. Nothing forbids it: no guard in the
40-entry registry (`scripts/guards.ts:28-347`) reports a duplicate artifact filename within an
activity, and the delivered contract dedupes them — `composeActivityArtifacts` keeps a `seen` set on
the filename and emits one entry (`src/tools/workflow-tools.ts:173`, `:181`).

The assumption run is itself an instance. `review-assumptions::record` declares
`#### artifact` at `workflows/work-package/techniques/review-assumptions/record.md:22`, and
`04-research.yaml` binds it at three step sites — `update-assumptions-log` (:135-136),
`record-batch-response` (:226-227) and `record-response` (:245-246). Two of those three are inside
the run stage 5 converts, so the routine declares an artifact, and the third stays with the host
until stage 6 moves it into the convergence routine. The rule, keyed on references to the routine,
sees none of that.

**Verdict: REMOVE.** The shape of an artifact prefix that needs no prohibition is the one the tree
already has: none. A filename is derived from the activity's position and the technique's
declaration, both of which are unchanged by materialisation, and one filename written by N steps of
one activity is the corpus's ordinary produce-then-revise idiom at 24 measured pairs. Deleting the
rule deletes the acknowledged wrapping hole with it, and takes the transitive-closure obligation off
the artifact check — placement still needs the closure, the artifact check no longer does.

**Blast radius.** Removing it early costs nothing mechanical: no guard, no load check and no
delivered field depends on the rule, because the rule does not exist. What is lost is a warning
about a real authoring mistake — a routine referenced twice whose two runs each want their own
artifact. That case has no instance: neither fragment is referenced twice by any one activity
(`fragment-mechanism.md`, reproduced from the eight reference sites at
`work-package/activities/04-research.yaml:224,243`, `05-implementation-analysis.yaml:126,145`,
`07-assumptions-review.yaml:112,130`, `08-implement.yaml:202,221`), which the proposal itself states
at README:551. Removing the rule at the wrong time — after authors have written a second reference
expecting it to fail — is not reachable, because stage 4 is where it would land and no stage after it
authors a second reference.

---

## CV2 — The textual splicer as a second representation

**Construct.** README:453-484 and README:1164-1188. Two delivery paths need resolution: the parsed
object graph, and the raw activity text `get_activity` hands the worker. "The textual half grows:
today it replaces one `ref:` line with a body, and it will have to replace a whole step block,
nested steps and all, at the right indentation." The proposal calls it "the largest cost in the
proposal and it is paid knowingly" (README:464), and says the implementation "is written for an
arrangement that is ending" and "is deleted when the runner stops delivering activity text"
(README:1175).

**Measured references.** The raw-text path is real and live.
`src/tools/workflow-tools.ts:1399` runs `injectResolvedStepIds` over the file text and `:1405-1409`
runs `injectCheckpointFragmentBodies` over the result. Today's textual half is
`injectCheckpointFragmentBodies` plus `scanCheckpointRefLines` — `src/loaders/fragment-resolver.ts:154-224`,
**71 lines** — against an object half of `materializeCheckpointStep` plus
`materializeActivityFragments` at `src/loaders/fragment-resolver.ts:90-152`, **63 lines**. The two
are already the same order of size for a mechanism that replaces one line.

What the second path costs the proposal is measurable in its own acceptance criteria. Stage 3 has
eight (README:846-863). **Three of the eight exist only because the second path exists**: the
explicit prefixed `id:` on every spliced step (README:857-858), the differential test over every
activity in the corpus comparing parsed objects field for field and seven named fields as text
(README:859-862), and byte-identical delivery for a routine-free activity (README:863). A fourth,
`ref-opens-step`'s successor, is discussed at CV19's neighbour: the fragment guard rule that exists
because the injector is line-oriented (`scripts/check-fragments.ts:176`,
`src/loaders/fragment-resolver.ts:190-209`) retires with the mechanism and is immediately restated
as stage 3's criterion. The rule count falls by one; the hazard is re-created.

What the second path buys is delivery of the worker's own file. That arrangement has no scheduled
end in the tree. `src/` holds no runner: its directories are `config.ts`, `errors.ts`, `index.ts`,
`loaders`, `logging.ts`, `middleware`, `resources`, `result.ts`, `schema`, `server.ts`, `tools`,
`trace.ts`, `transports`, `utils`, `worktree-validator.ts`, and `grep -rln runner src/` matches
nothing. The runner exists as three planning folders
(`2026-03-05-headless-slack-runner`, `2026-08-28-runner-execution-protocol`,
`2026-08-30-runner-execution-protocol`). So "written for an arrangement that is ending" is a bet on
unscheduled work, and the deletion date is unknown.

**Verdict: NARROWS.** Ship stage 3 with one representation. The construct is a load-time
transformation with no run-time trace (the proposal's own second typed-language property,
README:958-960), so the object path is the authoritative one; the question is only what
`get_activity` hands a worker for an activity carrying a routine. Delivering the serialised
materialised steps for that activity alone — the shape `injectCheckpointFragmentBodies` already
produces per gate, extended to the step — costs the routine-carrying activities their comment layout
and costs the design nothing else. Three of stage 3's eight criteria go with it, and so does the
class of failure the proposal names as the one to test hardest: "a worker reading a step the server
does not believe exists" (README:468).

**Blast radius.** Removing the textual path at the wrong time means removing it for the fragment
mechanism too, and that path is live at eight reference sites in four activity files. The narrowing
is therefore scoped: keep `injectCheckpointFragmentBodies` for gates, and decline to build its
routine-sized sibling. Delivery for the 118 activity files carrying no routine is untouched, because
`scanCheckpointRefLines` (`src/loaders/fragment-resolver.ts:218-224`) already gates the textual path
behind a pre-scan and a routine pre-scan would do the same.

---

## CV3 — Routine awareness in the activity-technique overlap guard

**Construct.** README:1041-1050. `check-activity-technique-overlap` is hard-zero: an activity's
top-level `techniques[]` may not re-list a technique any of its steps binds. Read as written, an
overlap a routine introduces is invisible; read through the loader it would audit generated
bindings. So the guard "stays in the authored column and **its overlap test resolves a reference
step to the routine's own step bindings**… It is the one place the authored/materialised split is not
by itself sufficient, and it is settled that way rather than carried."

**Measured references.** The guard is `scripts/check-activity-technique-overlap.ts`; the rule is
stated at `:4-11` and it reads `<workflow>/activities/*.yaml` non-recursively at `:57-66`. It passes
clean today.

The construct it polices is thin. Over all 122 activity files, **32 carry a top-level `techniques[]`
list, holding 33 entries between them, naming 4 distinct techniques**:

| Technique listed | Entries | Bound as `step.technique` anywhere in the corpus |
|---|---|---|
| `scatter-gather` | 26 | **0 sites** |
| `execute-cicd-audit` | 4 | **0 sites** |
| `execute-sub-agent` | 2 | 3 sites, at three activities that do not list it |
| `variable-binding` | 1 | **0 sites** |

Three of the four are never bound as a step anywhere, and the fourth is bound only at
`substrate-node-security-audit/activities/10-sub-crate-review.yaml`,
`11-sub-static-analysis.yaml` and `12-sub-toolkit-review.yaml`. So the overlap the guard exists to
catch is close to structurally impossible for the entries that exist: an activity-level entry is a
cross-cutting capability, and a capability is not an operation a step binds.

The exception has no instance at the design's own sites. Every one of the seven convergence and
assumption hosts lists `scatter-gather` and nothing else —
`work-package/activities/02-design-philosophy.yaml:83-84`, `04-research.yaml:78-79`,
`05-implementation-analysis.yaml:61-62`, `06-plan-prepare.yaml:59-60`,
`07-assumptions-review.yaml:68-69`, `08-implement.yaml:84-85`,
`15-codebase-comprehension.yaml:52-53`. The three fan-out pattern activities list `scatter-gather`
(`meta/activities/patterns/01-orchestrator-workers.yaml:31-32`, `04-isolated-fan-out.yaml:32-33`,
`05-lead-researcher.yaml:35-36`) and bind `orchestration-patterns::*`. The three prism per-unit
activities list `scatter-gather` (`prism/activities/02-adversarial-pass.yaml:16-17`,
`03-synthesis-pass.yaml:16-17`, `05-behavioral-synthesis-pass.yaml:16-17`) and bind
`full-prism::*` / `behavioral-pipeline::*`. **No routine body in stages 5 through 8 binds any of the
four listed techniques.**

**Verdict: REMOVE.** A single exception to a clean rule is the shape the repository canon tells you
to answer with a different rule, and here the different rule is available: the activity-level
`techniques[]` list and a step binding are two homes for "this activity needs this technique", and
the guard is the validation policing the overlap. Retire the overlap awareness and the exception
goes; retire the activity-level list itself — 33 entries, 4 names, 26 of them one name — and the
guard goes too. Neither is stage 4's job, but neither is teaching this guard about routines.

**Blast radius.** Dropping the routine-awareness change leaves the guard exactly as it stands, hard
zero, over authored content, with `stepBound` (`scripts/check-activity-technique-overlap.ts:38-53`)
recursing generically into any `steps` key at any depth — which means it will reach a routine body if
routine bodies ever live in an activity file, and reach nothing if they live in `routines/`. The loss
is a finding class with no member. The risk of removing it late rather than early is that stage 4
spends its budget on a guard change with no site while the twelve guards ground truth measures as
genuinely needing `routines/` go unassigned.

---

## CV4 — `internals` as a third declaration category

**Construct.** README:188-208. A routine declares internals: "names its body's steps pass between
themselves and that never leave." An internal declares an id and a description and nothing else, may
not go undeclared, and "a declared internal nothing writes or nothing reads" fails the load. Its
materialised name carries the host activity and the reference site, underscore-joined. Stage 4's
criterion holds the category (README:869-870); stage 5's removes eight host declarations
(README:886-888) and stage 6's makes `challenge_findings` an internal (README:905).

**Measured references.** The subtraction is real: `assumption_review_presentation` and
`current_assumption` are declared writes at exactly the four hosts and read nowhere, and
`challenge_findings` is a declared write at seven convergence sites — ground truth reproduces both,
and the seven for `challenge_findings` corrects the proposal's six at README:208 and README:905.

What the category buys mechanically is nothing, because the contract derivation already gives an
undeclared name exactly the standing an internal wants. `read` returns early on a name outside the
workflow's declared namespace (`src/utils/activity-variables.ts:452`), adding it to `mentions` and to
nothing else; `write` adds to `writes` only inside the namespace
(`src/utils/activity-variables.ts:475-478`), so an undeclared production lands in `produces` and
`producedSoFar` alone. `check-activity-variables`'s `undeclared-use` reads `record.derived.reads` and
`record.derived.writes` (`scripts/check-activity-variables.ts:199-217`) — both namespace-filtered —
and its `undeclared-crossing` rule (`:225-237`) fires only when another activity in the workflow
`mentions` the name, which a name prefixed with its host and reference site cannot have.

**This corrects the ground-truth record I was handed.** `guard-obligations.md` lists
`check-activity-variables` · `undeclared-use` as "(d) instance 2 — the sharpest, and unnamed",
firing at stage 3 the moment materialisation splices anything. It does not fire.
`implement_reconcile_assumptions_assumption_presentation` is outside the namespace on both sides, so
it never reaches `reads` or `writes`, and it is unique to one host so it never reaches
`undeclared-crossing`. The unspecified mechanism the record asks for — "the loader excluding
internals from the derivation, or the derivation learning the category" — is already there, and it is
neither: it is the namespace filter, which predates the design.

The category's second problem is that the design's own signatures do not use it. `re-derivation.md`
is the document README:1252-1254 tells a planner to read instead of the conversion artifacts. Its
`converge-assumptions.yaml` (`re-derivation.md:158-204`) declares `outputs` and `steps` and **no
`internals` block**, while `re-derivation.md:100-101` says the routine "declares no inputs, four
outputs, one internal". Its `challenge-concerns.yaml` (`re-derivation.md:110-157`) also declares no
internals, and its body needs one: `analyse-challenge::challenge` declares output
`challenge_findings` (`workflows/work-package/techniques/analyse-challenge/challenge.md:18`) and
`analyse-challenge::combine` declares it as an input (`combine.md:12`), which is precisely the
hand-off README:189-190 names as the convergence run's one internal.

**Verdict: REMOVE.** The alternative is the rule already in the tree: a name a routine body writes
before it reads is an internal read by the closest-producer-before-position rule the derivation
applies (`src/utils/activity-variables.ts:455`, and the doc comment at `:409-411`). A routine-body
checker deriving its contract from its own steps — which stage 4 builds regardless — can report a
name read with no producer before it, and prefix every name that is neither an input nor an output.
Both jobs the category does are derivable from the body. The design's own typed-language argument
supports this: inputs are parameters and outputs are a return type (README:951-957); a function's
locals are not part of its type, and `internals` puts them there.

**Blast radius.** Removing the category before stage 5 removes nothing the migration needs: the
fifteen declarations still go, because the writes move into the routine and the names leave the
workflow namespace when the last host declaration does. Removing it after a `routines/` schema has
shipped with an `internals` key is a schema change against authored files. The cost of keeping it is
one more declaration category, one more load failure to specify and test, and the schema surface for
a category the two worked signatures both omit.

---

## CV5 — Nesting delivered at stage 3

**Construct.** README:318-327. "A routine step is legal inside a routine. Nesting is what lets the
same run be reused both wrapped in a loop and on its own: the convergence run needs both forms, six
sites wanting the loop and the seventh wanting a single pass inside a loop its activity owns." A
cycle is a load failure; prefixes compose. Stage 3 lands "the `routines/` directory, the
`kind: routine` step, resolution, materialisation, identifier prefixing, and the load failures"
(README:771).

**Measured references.** Nesting is load-bearing where the proposal says it is. The seventh
convergence site cannot hold the three-step window because `revise-questions` sits between its
analysis and its challenge — `workflows/work-package/activities/15-codebase-comprehension.yaml:92-94`
— so what all seven share is the two-step `challenge` → `combine` pair and what six share is that
pair plus `reconcile`. The alternative is two copies of the pair, which is what the construct exists
to remove. The nested reference is written out at `re-derivation.md:195-204`.

But its first consumer is stage 6, not stage 3. The assumption run stage 5 converges is flat: its
five steps at `07-assumptions-review.yaml:106-141` are announce, gate, record, a `forEach` whose body
is three steps, and a closing record, with no reference to any second run. So **nesting ships at
stage 3 with no reference site until stage 6, two stages later**, and stage 5 sits between them.

Nesting is also what three other complications rest on. Placement's referrer rule needs a transitive
closure only because of it (README:566-571: "Nesting makes the rule partial otherwise"). The artifact
prohibition of CV1 is evadable only by wrapping (README:1145-1146). And the substitution field list
gains "a nested routine reference's own `with` and `outputs` maps", which README:366-369 calls "easy
to miss and expensive to miss".

**Verdict: NARROWS.** Deliver the `kind: routine` step at stage 3 and refuse it inside a routine
body until stage 6, its first site. The refusal is one check against a construct with no
instance, and it takes cycle detection, the placement closure and the nested-map substitution arm out
of stage 3 — the stage the proposal itself calls the load-bearing one (README:780). Stage 6 restores
all three, against a real reference site, with stage 3 and 5 already merged.

**Blast radius.** The order matters and the direction is one-way. Adding nesting at stage 6 is
additive: a construct refused becomes a construct admitted, and no authored file changes. Removing
nesting after stage 6 has authored `converge-assumptions` referencing `challenge-concerns` would
break the one shared body the convergence migration exists to create. So the narrowing has to be
taken at stage 3 or not at all.

---

## CV6 — A per-output marker for an output that may be left unbound

**Construct.** README:305-309. "An output a reference site does not bind is **dropped from the
materialised bindings**… A routine output that may be left unbound says so in its declaration;
leaving an unmarked one unbound is a load failure. Falling back to the output's own id here — the
rule a technique step's unremapped output follows — would put a routine's internal name into the
session bag."

**Measured references.** The marker is written out once in the whole folder, as `unbound: permitted`
on `residual_opens` (`re-derivation.md:136`). Its constituency is one output at one of seven sites.
The six identical convergence sites bind all four output ids; the comprehension site binds three —
`concern_document: comprehension_artifact`, `concerns_agent_resolvable: needs_comprehension`,
`residual_opens_remain: has_open_questions` at
`workflows/work-package/activities/15-codebase-comprehension.yaml:109-111` — and leaves
`residual_opens` unbound. So: **one marker field, one marked output, one unbound site out of seven.**

The rejected alternative's stated cost does not hold. A technique step's unremapped output lands
under its own id (`src/utils/activity-variables.ts:535`: `for (const output of signature.outputs) if
(!remapped.has(output)) landed(output, output)`), and `landed` calls `write`, which is
namespace-filtered at `src/utils/activity-variables.ts:475`. A name no workflow declares therefore
never enters the workflow's variable set — it lands in `produces` and stops. So an unremapped routine
output falling back to its own id does not "put a routine's internal name into the session bag" by any
mechanism in the loader or the derivation; it would reach the bag only if a worker chose to report it,
which is equally true of the 346 unremapped technique-step outputs already in the corpus.

**Verdict: NARROWS.** Take the technique step's rule — an unbound output lands under its own id and
the namespace filter drops it — and delete both the marker and the load failure. If the design still
wants the load failure, it can have it without a per-output field: a routine output no reference site
binds and no site marks is reportable by the routine-body checker as an output nothing consumes,
which is the finding README:624 already asks for from the other direction.

**Blast radius.** Removing the marker before the `routines/` schema ships costs nothing. Removing it
after stage 6 has authored `unbound: permitted` on `residual_opens` is a schema change against one
authored line. Keeping it costs a schema field, a load failure and a rule that every future routine
author has to learn, for one output.

---

## CV7 — A bare `with` argument reads as a literal

**Construct.** README:294-298. "`with` admits the same scalar union a technique step's `inputs`
admits… A braced value is a reference and a bare value is a literal; a routine reference is a new
binding site with no legacy, so it adopts that reading from the start rather than joining the
193-site migration that is settling it elsewhere." The substitution table at README:374-379 makes it
concrete: a braced argument keeps its braces, a literal drops them.

**Measured references.** I parsed every `step.technique` object binding in all 122 activity files:
**413 input bindings — 346 bare strings, 61 containing a brace, 6 non-string.** The existing reading
of a bare value is neither "literal" nor "reference" but resolved at read time, and the code says so:
`src/utils/binding-provenance.ts:312-318` — "A bare string is a rename when it names a resolvable bag
entry, otherwise a literal — statically indistinguishable, so an unmatched bare value is reported as
the literal it…". The schema description agrees (`src/schema/activity.schema.ts:65`: "source
expression (rename of a bag variable, literal, or `{template}`)"), and the derivation implements it at
`src/utils/activity-variables.ts:467-470`, matching on the whole string against the namespace.

Both readings occur in the corpus at the same spelling. `concern_document: assumptions_log`
(`workflows/work-package/activities/02-design-philosophy.yaml:197`, `:203`) is a rename;
`guide_map: cicd-pipeline-security-audit/README#planning-artifact-to-guide-map`
(`cicd-pipeline-security-audit/activities/04-report-generation.yaml`) is a literal.

The design's own worked conversion writes the ambiguous form. `re-derivation.md:199` binds the nested
reference with `concern_document: assumptions_log` — bare. Under README:376-378 that materialises as
the literal characters `assumptions_log`, which then lands at a technique-step input binding where
the dynamic reading resolves it as a rename. It works, by the reading the design declines to adopt.

I could not reproduce the 193. The figure appears once in the whole folder, at README:297, with no
source, and nothing in the tree names a migration settling the braced/bare question at a binding
site — the one guard on the question, `check-set-action-values`, is scoped to `set` action values
(`scripts/check-set-action-values.ts:8-26`). My figure for the population is 346 bare technique-step
input bindings.

**Verdict: NARROWS.** One reading per file, not two. Require every `with` value that names something
to be braced, and refuse a bare value that resolves in the host's declared namespace — a check the
derivation's own `readWholeName` already performs (`src/utils/activity-variables.ts:467-470`). That
leaves one syntax with one meaning at the new site and no ambiguity an author cannot see. Adopting
the existing dynamic reading instead is the other consistent answer; what is not consistent is a
third reading at a site adjacent to 346 instances of the second.

**Blast radius.** This is decided before any file is authored, so the cost of getting it wrong is
paid by every routine reference site written afterwards. Deciding it late — after stage 5 and 6 have
authored ten reference sites — means re-reading ten `with` maps under a changed rule, with no guard
that can tell a rename from a literal.

---

## CV8 — "A routine has no free variables"

**Claim.** README:210-214: "Inside a routine, its input, output and internal ids are **the names in
scope**. A routine has no free variables: every name its body reads or writes is one of the three,
which is what makes the signature a contract and the body checkable on its own. The one carve-out is
an artifact filename template." Restated as a prohibition at README:757-758 and as the reason the
contract boundary is tight at README:527-530.

**What the repository says.** The invariant fails in the design's own worked example, in the corpus
run that example is drawn from, and in both signatures of the document the proposal says to read
instead.

*The example.* README:216-275 declares inputs `gate_message` and `decision_space`; outputs
`has_deferred_assumptions`, `needs_individual_interview`, `assumption_outcome`; internals
`assumption_presentation` and `current_assumption`. Its loop step at README:258 reads
`over: open_assumptions`. **`open_assumptions` is in none of the three lists.** The same example
declares the internal `assumption_presentation` and never writes or reads it in the body it shows,
which README:205-206 makes a load failure; the presentation arrives from the host instead, inside the
`gate_message` argument at README:288.

*The corpus run.* At `workflows/work-package/activities/07-assumptions-review.yaml:106-141` the run
reads six names: `is_review_mode` (`:109`, `:116`, `:123`, and the per-item gate's condition at
`:131-135`), `has_open_assumptions` (`:109`, `:116`, `:123`), `assumption_review_presentation` (via
the fragment message at `workflows/work-package/workflow.yaml:29`), `needs_individual_interview`
(`:116`, `:123`), `open_assumptions` (`:122`) and `current_assumption` (`:129`, and
`workflow.yaml:51`). Three of those — `is_review_mode`, `has_open_assumptions`, `open_assumptions` —
are outside the proposal's declared signature.

*The re-derived signatures.* `converge-assumptions` (`re-derivation.md:158-204`) declares no inputs
and four outputs, and its first body step binds `review-assumptions::reconcile`, which declares the
input `comprehension_artifact` (`workflows/work-package/techniques/review-assumptions/reconcile.md:10-14`).
`challenge-concerns` (`re-derivation.md:110-157`) declares two inputs and four outputs, and its body
binds `analyse-challenge::challenge`, which declares the input `target_path`
(`workflows/work-package/techniques/analyse-challenge/challenge.md:10-14`), and passes
`challenge_findings` from `challenge` (`challenge.md:18`) to `combine` (`combine.md:12`) without
declaring it.

So the invariant needs at least three carve-outs the proposal does not state: a bound operation's
optional inputs, a bound operation's output consumed by a later body step, and a name the body reads
that the reference site is expected to have in scope. Two of the three names are marked
*(optional)* and are therefore `suppliable` in `readSignature`
(`src/utils/activity-variables.ts:377`), so `deriveActivityContract` calls `consume` rather than
`read` (`:517-518`) and they never enter the derived reads — which is why the claim survives a
derivation-based check while failing as stated.

**Verdict: STALE.**

**Blast radius.** Four things rest on the invariant. The tight boundary (README:527-530): "a routine
has no free variables and contributes only what it declares" — with `is_review_mode`,
`has_open_assumptions` and `open_assumptions` as inputs, the assumption routine's signature grows
from two inputs to five and the referring activity reads them anyway, so the boundary is not tighter
than a technique's, only differently sized. Isolated checking (README:625, stage 4's criterion at
README:869-870): a body whose reads include names the signature does not carry cannot be held against
its declaration without deciding which names are exempt. The walker's routine-level entry (README:877,
"seeded from the declared inputs"): a seed drawn from the declared inputs alone cannot supply
`challenge_findings`, `target_path` or `comprehension_artifact`, so the walk either stalls or invents
values. And the `check-binding-fidelity` collision ground truth measures as (d) instance 3 gets
larger, not smaller: every routine-input read is unresolvable to that guard by construction, and the
input count is understated.

---

## CV9 — "Materialisation runs after identifier resolution and before contract derivation"

**Claim.** README:337-354 draws one load path — Files → Parse → Ids → Materialise → Derive → Bind →
Ready — and states: "Materialisation runs **after** identifiers are resolved… and **before** the
contract is derived… Getting that order wrong erases the signature the whole design rests on." Stage
3's criterion is "Materialisation runs after identifier resolution and before contract derivation, and
a test fails if the order is swapped" (README:854-855). README:1156-1162 restates it as load order.

**What the repository says.** The contract derivation is not in the load path. `deriveActivityContract`
is declared at `src/utils/activity-variables.ts:417` and has exactly two call sites in the whole
repository, both in one guard script: `scripts/check-activity-variables.ts:147` and `:463`. The
loader never calls it.

The loader's own order, per `src/loaders/workflow-loader.ts`, is: read and `parseDefinition`, then
`safeValidateActivity`, then `populateStepIds` (`:94` in `loadActivitiesFromDir`, `:174` in
`resolveActivityReference`), then `artifactPrefix` from the filename (`:95`, `:180`), then fragment
materialisation and rule splicing during `loadWorkflowWithDiagnostics` (`:252` onward, fragments at
`:318`), then `mergeActivityVariables` and exit binding. `deriveActivityContract` appears nowhere in
it. The first half of the ordering claim reproduces — `populateStepIds` runs before fragment
materialisation — and the second half names a stage the loader does not have.

**Verdict: STALE.**

**Blast radius.** The criterion as written cannot be tested, because there is no in-loader order to
swap: a test would have to assert an ordering between a loader function and a guard script's call
into a utility. The design's substantive requirement survives and needs restating: the derivation
must see a *reference step* rather than a materialised body, and since the derivation runs inside
`check-activity-variables` over `loadWorkflowWithDiagnostics` output (`:97`, `:34`), materialisation
in the loader means the derivation will see materialised steps and never meet a reference. That is the
opposite of what the boundary needs. Either the loader must expose both forms — the materialised
activity for delivery and the reference-bearing activity for derivation — or the derivation must move
into the loader so the order exists. Both are unscoped work, and stage 4's entire boundary guarantee
depends on which is chosen. This is the one candidate whose falsity changes the plan's shape rather
than its wording.

---

## CV10 — "Six guards consume the loader today"

**Claim.** README:1066-1071: "**Six guards consume the loader today**: `check-audience`,
`check-stealth-isolation`, `check-activity-variables`, `check-session-contract`, `check-all-refs` and
`check-artifact-guides`."

**What the repository says.** `grep -rn "loadWorkflow\|loadWorkflowWithDiagnostics" scripts/*.ts`
returns five guard scripts and two non-guards. **Four registered guards consume the workflow loader**
— `check-activity-variables` (`scripts/check-activity-variables.ts:34`, `:97`, `:458`),
`check-all-refs` (`scripts/check-all-refs.ts:11`, `:34`), `check-stealth-isolation`
(`scripts/check-stealth-isolation.ts:38`, `:144`) and `validate-workflow-yaml`
(`scripts/validate-workflow-yaml.ts:17`, `:130`) — plus `check-session-contract`
(`scripts/check-session-contract.ts:31`, `:73`), which the registry excuses by name at
`tests/guard-registry.test.ts:77-86`. The two non-guards are `scripts/coverage-scope.ts:32` and
`scripts/run-batch-benchmark.ts:73`.

Neither `check-audience` nor `check-artifact-guides` opens an activity file at all: both read
technique markdown through the markdown technique loader (`scripts/check-audience.ts:35`,
`scripts/check-artifact-guides.ts:38`). And `validate-workflow-yaml`, a real consumer, is unnamed.
This reproduces `guard-obligations.md` exactly and independently.

**Verdict: STALE.**

**Blast radius.** Stage 4's criterion "the guards that have to move onto the loader have moved"
(README:876) is sized off this figure. The proposal's own admission at README:1069-1071 — "that column
states where four guards *should* sit, and moving each one there is unscoped work" — is the accurate
sentence, and it contradicts the table two dozen lines above it. Anyone planning stage 4 from the
table will budget for two guards that are already elsewhere and miss one that is not.

---

## CV11 — "A guard reads the form it audits and the column assignment follows"

**Claim.** README:1004-1013 offers "one sentence [that] classifies every guard the suite has and
every guard it gains", with a two-column table. Stage 4's criterion is "Every guard that reads an
activity file sits in a recorded column" (README:876).

**What the repository says.** There is nowhere to record a column. `GuardSpec`
(`scripts/guards.ts:14-26`) declares `id`, `script`, `npmScript`, `scope`, `json` and `proves`;
`scope` is `'corpus' | 'repo'` (`:12`) and its documented purpose is which tree the delta runner
re-runs a guard against (`:9-10`), not which form of a definition it reads. So the "recorded column"
is the README's own table, which is a planning artifact, and the criterion asks for a register the
tree does not hold.

The classification itself does not hold either. None of the four guards the table puts in the
materialised column consumes the loader: `check-checkpoint-entry`, `check-decision-order`,
`check-review-mode-gating` and `check-binding-fidelity` all parse raw activity YAML — the last one
resolving the fragment mechanism itself before reading, at `scripts/check-binding-fidelity.ts:529`.
Reproduced independently and consistent with `guard-obligations.md`.

One consequence of the misclassification neither the proposal nor the ground-truth record names.
`check-review-mode-gating` is placed in the materialised column (README:1012). It reads
`<workflow>/activities/*.yaml` non-recursively (`scripts/check-review-mode-gating.ts:198-206`), and
it exempts a mode-aware checkpoint by matching the literal `is_review_mode` in a step's `when`
(`:113`) or condition (`:88-104`). A routine body's gate is invisible to it on both counts: the file
is not in its scan, and inside a routine the name would be an input id. The four batch gates it
should be auditing are the four the assumption run carries, each with `is_review_mode` conjuncts on
the steps around it (`07-assumptions-review.yaml:109`, `:116`, `:123`, `:131-135`).

**Verdict: STALE.**

**Blast radius.** The sentence is offered as sufficient for the whole suite and, by the proposal's own
count, places 21 of 40 guards; ground truth measures 19 unplaced. Stage 4's criterion is therefore
both unrecordable and, as written, unsatisfiable without the unscoped loader moves the same section
admits. A planner reading the table will assume four guards see materialised activities and will
discover at stage 5 that they read the four hosts as written.

---

## CV12 — Stage 1's guard runs from a baseline that can only fall

**Claim.** Stage 1's fourth acceptance criterion, README:828-830: "It runs from a baseline of the
windows present when it lands, and the baseline can only fall. A hard zero is wrong here: the drift
is what stages 5 and 6 remove, and the guard has to be useful before they do." Stage 6 depends on it
— "The stage-1 guard's baseline falls by the windows this removes, and does not fall by any others"
(README:906-907) — and so does stage 8 (README:941-942).

**What the repository says.** This repository removed stored guard baselines and recorded why.
`scripts/check-delta.ts:4-12`: "A stored baseline is a cache of 'what did this guard report before my
change'. It drifts, it needs pruning PRs, and it silently absorbs real defects (issue #327 R1). The
before-state does not need storing: it is the merge-base with the integration branch." The finding-key
normaliser keeps a memento: `scripts/guard-protocol.ts:53-57` calls it "the same normalisation the
retired baselines used". There is no baselines directory, no `baseline` field on `GuardSpec`
(`scripts/guards.ts:14-26`), and no baseline mechanism in `scripts/guard-protocol.ts`.

The mechanism that replaced baselines cannot reach the migration. `check:delta` resolves the
submodule commit a tree-ish recorded — `git ls-tree <treeish> workflows`
(`scripts/check-delta.ts:72-76`) — and materialises the merge-base in a throwaway worktree with the
submodule pinned to it (`:88-120`). The corpus branch carries no submodule, and the corpus
pull-request job runs `npm run check:all` and nothing else
(`workflows/.github/workflows/verify-corpus.yml:70`). So on the side where stages 5 and 6 land, every
guard is graded absolutely and there is no ratchet of any kind.

Three per-guard ledgers do exist — `scripts/binding-fidelity-triage.json`,
`scripts/canonical-home-map-triage.json`, `scripts/nested-output-home-triage.json`, with
`scripts/artifact-guide-baseline.json` absent — and the first reports its own stale entries
(`scripts/check-binding-fidelity.ts:892`, `:910`), which is a falling-only discipline in practice. So
the criterion is buildable. It is buildable by re-introducing, for one guard, the exact mechanism the
delta runner's header rejects on principle, and by putting it on a branch where the delta runner
cannot correct it.

**Verdict: STALE.**

**Blast radius.** Stage 1 is the stage the proposal says is "useful with or without the rest — and it
is what proves the migration converged" (README:769). Its usefulness rests on a construct the
repository decided against, and its two downstream consumers — stage 6's "the baseline falls by the
windows this removes, and does not fall by any others" and stage 8's equivalent — are the only
mechanical evidence either migration converged rather than merely passing. If the baseline is not
built, both criteria become manual comparisons of two guard runs, which is what `check:delta` was
built to be and cannot be here. If it is built, it is a stored allowance on the corpus branch,
ungraded by the ratchet, absorbing whatever the migration adds. Either way stage 1 needs re-specifying
before it is planned, and stages 6 and 8 need criteria that do not name a baseline.

---

## CV13 — The technique-valued input parameter

**Claim.** README:394-421 and stage 7 (README:775, criteria README:912-930). An input may be declared
`kind: technique`; the price is that "a routine whose body binds a technique by parameter has no
signature of its own", and three guarantees become conditional for those routines. The constituency
is "three `prism` activities whose entire step list is one `forEach` loop over `analysis_units`
binding one operation, two of them identical but for the operation reference and the step id".

**Measured references.** Reproduced, with the delta measured. `diff` between
`workflows/prism/activities/02-adversarial-pass.yaml` and `03-synthesis-pass.yaml` returns six hunks
touching eight lines: `id`, `name`, `description`, the loop `id`, the loop `name`, the step `id` and
the technique reference (`full-prism::adversarial` versus `full-prism::synthesis`). The third,
`05-behavioral-synthesis-pass.yaml`, differs from `02` at 22 changed lines and in three substantive
places beyond the operation: it reads `behavioral_output_paths` rather than `all_artifact_paths` for
`prior_artifact_paths` (`:33`), its gate compares `current_unit.pipeline_mode == 'behavioral'` rather
than `'full-prism'` (`:38`), and its declared reads differ (`:6-8`).

So the family is **two sites sharing a body and one variant**, in three files of 41, 41 and 42 lines
whose entire step list is one 20-line `forEach`. Each declares one exit (`done`) and, as measured at
CV3, lists `scatter-gather` at activity level and binds it nowhere.

**Verdict: NARROWS.** The feature buys one home for two byte-shared step lists and, per README:410-414
and stage 7's third criterion (README:919-921), turns three universal guarantees into per-reference-site
checks: the contract, the artifact declaration and gate-option coverage. That is a second checking
path — once-per-routine and once-per-site — added for a family that declares zero checkpoint steps, so
the option-coverage half of the price buys nothing at its own site. Ship the parameter only if stage 7
also states which of the two remaining checks actually differ per site for these three routines, and
name the variant (`05`) as a second routine or a second input rather than a third reference to the
first. The narrower alternative worth pricing against it: the three prism files are three graph
destinations over one run, and the corpus already has a construct for one definition run N ways with
per-branch values (`fanGroups` and `branchKey`, `src/loaders/workflow-loader.ts:567-615`,
`src/utils/activity-variables.ts:149-158`).

**Blast radius.** Stage 7 depends only on stage 4 and nothing depends on it (README:795-800), so
deferring or reshaping it costs no other stage. Shipping it early is the expensive direction: the day
one routine binds a technique by parameter, "every routine's contract is derivable in isolation"
stops being a fact about the tree and becomes a fact about a subset, and stage 7's fourth criterion
requires "every place claiming them universally is updated" (README:922-923) — including the four
guarantee tables at README:609-629.

---

## CV14 — Byte-identical delivery, and per-site bundled characters reviewed

**Claim.** Stage 3's eighth criterion: "Delivery is byte-identical for every activity that carries no
routine" (README:863). Stage 5's fifth: "The delivery baseline is re-recorded, and the change in
bundled characters at each site is reviewed against the measured prediction rather than accepted by
regeneration" (README:890-891), repeated for stage 6 (README:908).

**What the repository says.** There is no per-activity delivery artifact in the tree. The one
delivery baseline is `scripts/fixtures/token-benchmark-baseline.json`, whose `chars` field is nine
per-tool totals — `get_activity` 685,563 of 1,421,070 — over a single twelve-activity path recorded
in the same file:

```
start-work-package, design-philosophy, codebase-comprehension, plan-prepare, assumptions-review,
implement, lean-coding-audit, post-impl-review, validate, strategic-review, submit-for-review, complete
```

**Two of the four stage-5 hosts are not on that path** — `research` and `implementation-analysis`
appear nowhere in it. So the change in bundled characters at `04-research.yaml` and
`05-implementation-analysis.yaml` cannot be reviewed against the baseline, because the baseline never
visits them. Those are precisely the two hosts carrying drift rows 5 and 6, the review-mode conjunct
differences the census records at `05-implementation-analysis.yaml:130`, `:138` and
`04-research.yaml:228`, `:236`. Five of the seven stage-6 sites are on the path; the same two are not.

The gate is aggregate and one-directional: `DEFAULT_MAX_REGRESSION_PCT = 1` at
`scripts/run-token-benchmark.ts:175`, run as `bench:token --gate` from
`.github/workflows/verify.yml:70`, and it fails on a regression only. Byte-identity is not what it
measures. The committed walk snapshots (`tests/e2e/__snapshots__/snapshot.test.ts.snap`) record step
and checkpoint manifests, not delivered text, and `tests/e2e/resume-delivery-identity.test.ts` tests
content-marker identity across a gate rather than text against a baseline.

**Verdict: STALE.**

**Blast radius.** Stage 3's byte-identity criterion is the one that lets a server pull request merge
against an un-migrated corpus, and it is currently checkable only by writing the check — the
differential test of README:859-862 could carry it, comparing the delivered text of all 122 activity
files before and after, but the criterion does not say so and no artifact holds the before. Stage 5
and 6's "at each site" reviews are unachievable at two of eleven sites without adding `research` and
`implementation-analysis` to the benchmark path, which changes the baseline total and so has to happen
before the migration rather than as part of it.

---

## CV15 — "A shared run has a use — refused at load"

**Claim.** README:629: "A shared run has a use | **Refused at load** | A routine with no reference
sites fails, mirroring the finding an unreferenced shared gate body already produces." Stage 4's last
criterion repeats it: "A routine with no reference site anywhere fails the load" (README:878). The
neighbouring row makes the same move for placement — "**Refused at load** | Placement is computed from
referring files and a guard enforces it" (README:614).

**What the repository says.** The mirror is a guard, not a load. `unused-fragment` is emitted at
`scripts/check-fragments.ts:242`, inside a corpus-wide sweep that first collects
`usedCheckpointFragments` across every workflow's activities and then walks every workflow's declared
fragments (`:234-249`). The loader's only fragment diagnostic is a warning on an unparsable block —
`logWarn('Invalid fragments block; refs into it will not resolve', …)` at
`src/loaders/workflow-loader.ts:207`.

A load cannot answer the question. `loadWorkflow(workflowDir, workflowId)`
(`src/loaders/workflow-loader.ts:242`) loads one workflow; `buildFragmentsLookup` (`:221`) pre-reads
only the fragment blocks a given activity's refs name (`:235-239`). "No reference site anywhere" is a
corpus-wide predicate, and the shared home is `meta` (README:314-316), so a routine in `meta`
referenced from `work-package` is unreferenced from `meta`'s own load and referenced from
`work-package`'s. The placement row is self-contradicting in one sentence: refused at load, enforced
by a guard.

**Verdict: STALE.**

**Blast radius.** The enforcement-strength table is how the proposal argues its value, and two of its
rows claim a strength one level above what the tree can deliver. That matters concretely at stage 4,
whose criterion says "fails the load": implementing it would put a corpus-wide directory scan inside a
single-workflow load, which is the recursion `readWorkflowFragments` exists to avoid
(`src/loaders/workflow-loader.ts:193-197`: "fragment resolution must not recurse into full loads").
The correct home is a guard, alongside `unused-fragment`, and the criterion should say so — which also
means the finding lands on the corpus pull request, where no ratchet runs.

---

## CV16 — "Every activity that would refer to one declares a single ending"

**Claim.** README:745-748. A routine may not take a place in the graph: "It is not a transition
destination, never a workflow's first or last node, and it declares no outcome. Every activity that
would refer to one declares a single ending, so nothing in the corpus could receive an outcome."

**What the repository says.** Four of the seven activities that would refer to a routine declare more
than one exit:

| Site | Exits declared |
|---|---|
| `work-package/activities/07-assumptions-review.yaml` | **5** — `needs-comprehension`, `needs-plan-revision`, `needs-further-discussion`, `review-mode`, `assumptions-approved` |
| `work-package/activities/15-codebase-comprehension.yaml` | **4** — `needs-elicitation`, `research-needed`, `skip-optional-activities`, `comprehension-complete` |
| `work-package/activities/02-design-philosophy.yaml` | **2** — `revise-classification`, `done` |
| `work-package/activities/06-plan-prepare.yaml` | **2** — `done`, `revise` |
| `04-research.yaml`, `05-implementation-analysis.yaml`, `08-implement.yaml` | 1 — `done` |
| `meta/activities/patterns/01`, `04`, `05` | **0** |

Corpus-wide, **49 checkpoint options across 28 activity files carry `effect.exit`**, and two of them
sit in the same files as the convergence block the design converges:
`work-package/activities/02-design-philosophy.yaml:108` (`exit: revise-classification`) and
`06-plan-prepare.yaml:178` (`exit: revise`). The schema is explicit about what such an option names:
"Exit of the owning activity this option selects — a name from the activity's `exits[]`"
(`src/schema/activity.schema.ts:51`).

**Verdict: STALE.**

**Blast radius.** The rule may well be right; its evidence is wrong, and the wrong evidence hides a
second hole. `effect.exit` names a host exit id, which is a name outside the three declaration
categories, and the substitution field list at README:364-368 covers "an option's effect names and
values" without saying what happens to an `exit` that has no binding at the reference site. No gate
inside the runs stages 5 and 6 convert carries one today — the two shared fragment bodies at
`workflows/work-package/workflow.yaml:17-71` carry `setVariable` only — so nothing breaks
immediately. But the design's stated reason for a routine having no outcome is a fact about the corpus
that four of seven sites contradict, and the moment a shared run wants a gate that ends its host, the
rule has to be re-argued from something else. The three fan-out sites declaring zero exits is the
sharper version: a routine cannot select an exit from an activity that has none.

---

## CV17 — Stage 8's four occurrences of one run

**Claim.** Stage 8, README:776 and README:936-943. "The four-step dispatch run — compose briefs,
dispatch, gather, synthesise — becomes one routine, referred to at the three `meta` pattern activities
and inside `lead-researcher`'s follow-up loop… Four occurrences of one run, one of them a second copy
in the same file that no guard can see, become one body with a signature." Stage 8 "is the cheaper: it
needs no schema field" (README:797-799).

**What the repository says.** Two problems, and the second is structural.

*The run is not four occurrences of one run.* At
`workflows/meta/activities/patterns/01-orchestrator-workers.yaml:37-51` the four steps are contiguous
and bare. At `05-lead-researcher.yaml:41-55` they are contiguous and bare, and at `:70-84` the
follow-up loop repeats them with `-followup` suffixes on the step ids. At
`04-isolated-fan-out.yaml:38-61` they are **not contiguous**: an `action` step, `require-complete`,
sits between `gather` and `synthesise` (`:53-58`), and `compose-briefs` carries an input deviation
`isolation_mode: isolation_mode` (`:40-43`). So the population is three occurrences of a four-step run
plus one variant that differs in both shape and binding. Stage 8's own second criterion leaves the
variant unresolved — "The completeness `validate` at `04-isolated-fan-out` stays with the referring
activity or becomes a declared input, and the record says which" (README:937-938) — and the first
branch of that choice makes the run non-contiguous at that site, so the routine cannot hold it.

*The site is outside everything.* All five pattern activities live at
`workflows/meta/activities/patterns/`, a subdirectory. `loadActivitiesFromDir`
(`src/loaders/workflow-loader.ts:72-107`) reads one directory with `readdir` and skips any entry
`parseActivityFilename` rejects (`src/loaders/filename-utils.ts:6-10`), which `patterns` is. No
`workflow.yaml` in the corpus references them: `grep -rn "patterns/" workflows/*/workflow.yaml`
returns nothing, and the only references are technique prose and two resource documents. `npm run
check:activities` validates 117 of the corpus's 122 activity files.

So materialisation — a load-time pass — never runs at stage 8's sites, because those files are never
loaded. A `routines/` file referenced only from them is never validated, and the four loader-consuming
guards of CV10 never see any of it.

**Verdict: STALE.**

**Blast radius.** Stage 8's first criterion is "the routine declares ordinary inputs and no
`kind: technique` parameter, and its contract derives in isolation" (README:935), and its fourth is
that the stage-1 baseline falls by the fan-out windows "and by nothing else" (README:941-942). The
contract derivation runs inside `check-activity-variables` over loaded workflows, which do not include
these files; the stage-1 window search does reach them, because the measure script parses all 122
files. So stage 8's own convergence evidence comes from the one mechanism that sees the site, and every
correctness check comes from mechanisms that do not. Nothing depends on stage 8 (README:795-796), so
the cost of ordering it wrong is contained — but "the cheaper stage" is cheaper because it lands
where nothing grades it, and that is worth stating in the stage rather than discovering during it.

---

## CV18 — The absent-default merge change described as two lines still to write

**Claim.** README:1102-1104: "**The merge treats an absent default as no opinion, and a declaration
carrying one wins.** Today it compares an absent default as `null` and reports disagreement with any
present one, so a no-default declaration would fail the load on contact with the corpus. Two lines."

**What the repository says.** It is already there. `disagreement`
(`src/utils/activity-variables.ts:62-75`) compares defaults only when both are present —
`if (a.defaultValue !== undefined && b.defaultValue !== undefined)` at `:64` — and the same for value
sets at `:69`. `fillSilences` (`:82-90`) takes a starting value from whichever site names one. The doc
comment at `:56-61` states the rule as the design: "Silence is no opinion."

The proposal's own records agree and the README does not. `gap-review.md:53` records "C2 — an absent
default read as a disagreement | **Landed** | `disagreement` compares two present defaults only, and
`fillSilences` fills from whichever site names one", and `decisions.md:518` dates it 2026-09-06.
README:783 says the same in the other direction — "the absent-default merge change among them. Those
are in place, so the column is complete as it stands" — thirty lines from where README:1102-1104 asks
for two lines of work.

**Verdict: STALE.**

**Blast radius.** Small and worth clearing anyway. Under this claim the design carries a prerequisite
it does not have, and the one measured result that depends on it — "injecting the convergence
routine's outputs at all seven of its reference sites merges the work-package workflow with **zero
contradictions**" (README:1106-1108) — is stronger than the README says, because the merge behaviour
it needs is the merge behaviour that stands.

---

## CV19 — An exhaustiveness assertion over the step kinds

**Claim.** README:428-451 and stage 3's fifth criterion (README:856): "An exhaustiveness assertion
over the step kinds fails to compile when a kind is added." Its premise: "the corpus's step kinds are
tested in **57 places across 19 files, every one a positive comparison, with no exhaustive switch
anywhere**, so a kind that survived materialisation would compile clean everywhere and be handled
nowhere."

**Measured references.** The premise reproduces in substance and not in figure. Grepping
`kind === '<k>'` and `kind !== '<k>'` over the four step kinds across `src/`, `scripts/` and `tests/`
gives **60 comparisons across 22 files**, split 34 in `src/` (8 files), 15 in `scripts/` (9 files) and
11 in `tests/` (5 files). No exhaustive switch exists: `grep -rn "assertNever\|: never =\|satisfies
never"` over the same trees returns nothing. `flattenActivitySteps` has **9 users**, reproducing the
proposal's nine, and recurses into exactly one thing — `if (s.kind === 'loop' && s.steps.length)
rec(s.steps)` at `src/schema/activity.schema.ts:327` — so an unknown compound kind is walked as a
leaf.

The criterion, however, can only protect part of that. `tsconfig.json` sets
`"include": ["src/**/*"]`, and `typecheck` is `tsc --noEmit` (`package.json:24`). So `scripts/` and
`tests/` are never typechecked, and an assertion that "fails to compile when a kind is added" reaches
**34 of the 60 comparisons, in 8 of the 22 files**. The 26 comparisons in `scripts/` and `tests/`
would compile clean whatever is added, which is the same failure mode the criterion is written
against. The repository already carries an instance of exactly this gap:
`scripts/check-loop-shape.ts:43-49` declares a local `LoopStep` interface without `breakCondition`
while `:96` indexes it as `keyof LoopStep`, and that compiles only because `scripts/` is outside the
typecheck.

**Verdict: NARROWS.** Keep the assertion and state its reach: an exhaustive discrimination in
`src/`, at the one place that consumes the kind, plus a runtime assertion or a test for the guard
scripts, which no compiler protects. Alternatively widen `tsconfig` — but that is a repository change
with its own blast radius and it does not belong inside stage 3.

**Blast radius.** The criterion is described as "a small hardening of ground this proposal stands on
rather than part of what it delivers" (README:449-451), and at its stated reach it is smaller than
that. Landing it as written and believing it is the hazard: nine guard scripts comparing step kinds
would still compile clean against a fifth kind, and eight of the nine read activity files.

---

## CV20 — The reference-site `outputs` remap

**Construct.** README:300-304. "`outputs` maps an output id to the session variable its value lands
under, exactly as a technique step's `outputs` remap does. **This is what lets one routine serve two
domains that name the same fact differently** — the corpus has such a run waiting, whose seven sites
bind the same three outputs to five different names."

**Measured references.** The construct earns its keep and the figure understates it. Across the seven
convergence sites, `analyse-challenge::combine` binds **four** output ids to **seven** distinct
destination names. Six sites bind all four identically — `concern_document: assumptions_log`,
`concerns_agent_resolvable: has_resolvable_assumptions`, `residual_opens_remain:
has_open_assumptions`, `residual_opens: open_assumptions`, e.g.
`workflows/work-package/activities/02-design-philosophy.yaml:205-208` and
`07-assumptions-review.yaml:102-105`. The seventh binds three to three different names —
`concern_document: comprehension_artifact`, `concerns_agent_resolvable: needs_comprehension`,
`residual_opens_remain: has_open_questions` at
`workflows/work-package/activities/15-codebase-comprehension.yaml:109-111`. Four ids, seven names,
one output unbound. The proposal's "three outputs to five different names" (README:303) does not
reproduce; this reaches the same four-to-seven that `fragment-mechanism.md` reaches independently.

**Verdict: KEEP.** This is a second path — a routine output has both its own id and a per-site
destination name — and it is the one that pays for itself. Without it the comprehension domain loses
`comprehension_artifact`, `needs_comprehension` and `has_open_questions`, and the alternative is two
routines for one two-step body, which is the duplication stage 6 exists to remove. It is also not new
machinery: it is the technique-step `outputs` remap (`src/schema/activity.schema.ts:66`) applied one
level up, and the derivation already reads it (`src/utils/activity-variables.ts:534`). Stage 6's third
criterion — "The four output remaps each site carries today survive as reference-site bindings, so no
domain loses the name it uses" (README:898-899) — is the right criterion and it is measurable.

**Blast radius.** Removing it would falsify stage 6 outright. It is the one place where the design's
extra indirection is doing work no existing construct does at the routine grain.

---

## What I looked for and did not find

An empty result on a surface is evidence, so each of these is recorded with what was searched.

**A second path in the fragment retirement.** The proposal says seven of the fragment guard's nine
rules die and two survive. Read against `scripts/check-fragments.ts:56-65` and the emission sites, the
partition is exactly the one `decisions.md:447-450` names, and the two survivors — `duplicate-rule`
(`:257-263`) and `duplicate-checkpoint` (`:269`) — reach the corpus through inline content with no
`ref` value in the path. This claim holds and is not a candidate. The one thing worth carrying is
folded into CV2: `ref-opens-step` (`:176`) exists because the textual injector is line-oriented
(`src/loaders/fragment-resolver.ts:190-209`), and stage 3's criterion at README:857-858 restates the
same requirement for a larger splicer.

**A prohibition hiding in the identifier scheme.** README:544-546 argues the full stop is the only
separator available because `#` is the per-iteration discriminator and `::` is the technique path. I
checked whether a dot in a step id collides with anything: the checkpoint response key is
`` `${activity_id}-${checkpoint_id}` `` (`src/tools/workflow-tools.ts:2069`) and is parsed back only
by `immediateExitCut` (`src/utils/validation.ts:91-97`), which strips the activity prefix and then
splits on `#` via `baseId` (`src/loaders/workflow-loader.ts:473`) before an exact-id lookup through
`topLevelStepIndex` (`src/schema/activity.schema.ts:340-344`), which walks loop bodies. A dotted step
id survives all of that. Variable reads take a dotted path through `bagName`
(`src/utils/activity-variables.ts:251`), but a step id is not a variable. No candidate.

**A configuration knob.** I looked for anything in the design that a definition author could set to
choose between behaviours — a mode, a flag, an opt-out. There is one, `kind: technique` on an input
(CV13), and it is a parameter rather than a knob. `bundleTechniques`
(`src/schema/activity.schema.ts:294`) is the corpus's one live opt-in of that shape and the design
does not touch it. Nothing else.

**A compatibility layer.** README:951-953 states the design carries "**no compatibility obligation**"
toward the typed definition language — "no dual format, nothing held open" — and I found nothing in
the specification that contradicts it. The two representations of CV2 are a delivery-path duplication,
not a format compatibility layer, and the design says the mechanism is deleted rather than adapted
(README:958-960). No candidate beyond CV2.

**A falsification of the prose-leak argument.** README:527-530 claims a technique's delivered prose
leaks its `{token}`s into the referring activity's reads. This holds: `readSignature` collects
`proseReads` from every protocol block title, protocol step, rule text and artifact filename
(`src/utils/activity-variables.ts:361-388`) and filters only names the operation itself declares
(`:387`). The boundary difference the design claims over a technique is real for prose; what is not
real is that it is total, which is CV8.

**A drift-census row that has silently converged.** `fragment-mechanism.md` measured seven of ten
census rows standing, three converged and one new. I re-read the four hosts' announcement blocks and
loop gates and reached the same partition, so I have nothing to add and no candidate. Stage 2's first
criterion — a recorded disposition per row — is the only stage-2 criterion, and it survives the
re-measurement with three rows now answerable as "already converged in the corpus", which is one of
the three dispositions the criterion admits (README:836-838).

**A guard that would newly fail on a routine's authored form beyond the four ground truth names.** I
re-took the (d) sweep. `check-variable-model` · `setvariable-undeclared` reproduces —
`scripts/check-variable-model.ts:118` requires a declaration in `workflow.yaml` variables[] and the
guard is hard zero (`:26-28`). `check-binding-fidelity` reproduces as stated and remains conditional
on the loader move. `check-checkpoint-entry` reproduces as latent. `check-activity-variables` **does
not** reproduce, for the namespace-filter reason at CV4, and I report that disagreement. I found one
the record does not name — `check-review-mode-gating`, at CV11 — and it is a coverage loss rather
than a violation, because the four batch gates already evade it through the fragment `ref`.

**A per-activity delivery artifact.** Searched `tests/e2e/__snapshots__/` (two files),
`scripts/fixtures/` and every test naming `get_activity`. The only committed delivery figures are the
nine per-tool totals in `scripts/fixtures/token-benchmark-baseline.json`. This is CV14, and the empty
result is the finding.

---

## Re-taking every figure

```
# nothing is built
ls workflows/*/routines ; grep -rn "kind: routine" workflows/ ; grep -rln routine src/
sed -n '165,172p' src/schema/activity.schema.ts

# CV1 — artifact filenames declared twice in one activity
grep -n "artifact" -B 6 workflows/work-package/techniques/review-assumptions/record.md
grep -n "record-batch-response" -A 3 workflows/work-package/activities/04-research.yaml
sed -n '146,185p' src/tools/workflow-tools.ts
sed -n '1793,1800p' src/tools/workflow-tools.ts

# CV2 — the two representations
sed -n '90,224p' src/loaders/fragment-resolver.ts
sed -n '1396,1412p' src/tools/workflow-tools.ts
ls src/ ; grep -rln runner src/

# CV3 — the activity-level techniques list
grep -rn "^techniques:" -A 3 --include=*.yaml workflows/*/activities/
cat scripts/check-activity-technique-overlap.ts

# CV4, CV6 — the namespace filter
sed -n '440,540p' src/utils/activity-variables.ts
sed -n '196,258p' scripts/check-activity-variables.ts

# CV7 — braced versus bare
sed -n '281,320p' src/utils/binding-provenance.ts
sed -n '60,70p' src/schema/activity.schema.ts

# CV8 — free variables
sed -n '100,145p' workflows/work-package/activities/07-assumptions-review.yaml
sed -n '15,72p' workflows/work-package/workflow.yaml
sed -n '1,20p' workflows/work-package/techniques/review-assumptions/reconcile.md
sed -n '1,20p' workflows/work-package/techniques/analyse-challenge/challenge.md
sed -n '1,20p' workflows/work-package/techniques/analyse-challenge/combine.md
cat workflows/work-package/techniques/analyse-challenge/TECHNIQUE.md

# CV9, CV10 — the load path and its consumers
grep -rn "deriveActivityContract" --include=*.ts .
sed -n '72,110p' src/loaders/workflow-loader.ts
grep -rn "loadWorkflow" scripts/*.ts

# CV11, CV12 — the registry, the columns, the retired baselines
sed -n '1,30p' scripts/guards.ts
sed -n '1,60p' scripts/check-delta.ts
sed -n '50,60p' scripts/guard-protocol.ts
ls scripts/*triage*.json scripts/*baseline*.json
sed -n '190,215p' scripts/check-review-mode-gating.ts

# CV13 — the prism family
diff workflows/prism/activities/02-adversarial-pass.yaml workflows/prism/activities/03-synthesis-pass.yaml
diff workflows/prism/activities/02-adversarial-pass.yaml workflows/prism/activities/05-behavioral-synthesis-pass.yaml

# CV14 — the delivery baseline
grep -n "DEFAULT_MAX_REGRESSION_PCT" scripts/run-token-benchmark.ts
grep -n "bench:token" .github/workflows/verify.yml
ls tests/e2e/__snapshots__/

# CV15 — unused-fragment
sed -n '234,250p' scripts/check-fragments.ts
sed -n '193,215p' src/loaders/workflow-loader.ts

# CV17 — the pattern activities
grep -rn "patterns/" --include=*.yaml workflows/*/workflow.yaml
sed -n '30,62p' workflows/meta/activities/patterns/04-isolated-fan-out.yaml
npm run check:activities | tail -3

# CV18 — the merge
sed -n '55,95p' src/utils/activity-variables.ts

# CV19, CV20 — kinds and remaps
grep -rn "assertNever" --include=*.ts src/ scripts/ tests/
grep -rln flattenActivitySteps --include=*.ts src/ scripts/ tests/
cat tsconfig.json ; grep -n '"typecheck"' package.json
sed -n '95,115p' workflows/work-package/activities/15-codebase-comprehension.yaml

# CV5, CV16 — nesting sites, and exits
sed -n '95,210p' .engineering/artifacts/planning/2026-09-03-routines/re-derivation.md
grep -n "exit:" workflows/work-package/activities/*.yaml
```

Five figures were taken with throwaway scripts under this session's scratchpad, and each states its
rule in full above so the figure is re-derivable: the artifact-filename tally resolves each
`step.technique` to its technique file's `#### artifact` bodies and counts filenames per activity file
at any loop depth; the activity-level `techniques[]` tally reads the top-level `techniques` key of all
122 activity files; the step-binding probe collects every `step.technique` name at any loop depth
corpus-wide; the binding tally counts every key of every `step.technique.inputs` object, classified by
whether the value is a string containing a brace, a bare string, or a non-string; and the exit tally
reads each activity's `exits[]` length and counts every checkpoint option carrying `effect.exit` at
any loop depth.

## Figures the proposal or the ground-truth records state that I could not reproduce

| Figure | Where | Measured here |
|---|---|---|
| Step kinds tested in 57 places across 19 files | README:431-433 | **60 across 22** by the two-operator rule stated at CV19 — 34 in `src/`, 15 in `scripts/`, 11 in `tests/` |
| Seven sites bind "the same three outputs to five different names" | README:303 | **Four output ids to seven names**, one output unbound at one site |
| A 193-site migration settling the braced/bare reading | README:297 | **346 bare** technique-step input bindings of 413; no migration in the tree, and the figure appears once in the folder with no source |
| `check-activity-variables` · `undeclared-use` fires on a materialised internal at stage 3 | `guard-obligations.md`, (d) instance 2 | **It does not.** `read` and `write` are namespace-filtered (`src/utils/activity-variables.ts:452`, `:475`) and `undeclared-crossing` needs a second activity to mention the name (`scripts/check-activity-variables.ts:225-237`) |
| The absent-default merge change is two lines still to write | README:1102-1104 | **Landed** — `src/utils/activity-variables.ts:62-75`, `:82-90`; `gap-review.md:53` and `decisions.md:518` agree, README:783 agrees, README:1102-1104 does not |
| Six guards consume the loader | README:1066 | **4 registered plus 1 unregistered**, reproducing `guard-obligations.md` |
| "Every activity that would refer to one declares a single ending" | README:747-748 | **Four of seven declare more than one exit**; three fan-out sites declare none; 49 options carry `effect.exit` across 28 files |
| `challenge_findings` declared at six sites | README:208, README:905 | **Seven**, reproducing `fragment-mechanism.md` |
| Four occurrences of one four-step fan-out run | README:776 | **Three occurrences plus one variant** — an `action` step interrupts at `04-isolated-fan-out.yaml:53-58` and `compose-briefs` carries an input deviation at `:40-43` |
| `converge-assumptions` "declares no inputs, four outputs, one internal" | `re-derivation.md:100-101` | The signature written at `re-derivation.md:158-204` declares **no `internals` block** |

Figures that reproduced without change: the single `fragments` declaration and its eight reference
sites in four activity files; the four-and-seven exit split at `04-research`,
`05-implementation-analysis` and `08-implement` versus the rest; nine users of
`flattenActivitySteps`, recursing into `loop` alone; no exhaustiveness assertion anywhere; the
`{artifactPrefix}-{bare_filename}` artifact rule; 6 generated JSON schemas with no verifying variant
and `build:schemas` wired into no CI job; the fragment guard's nine rules partitioning seven and two;
and the four loader-consuming registered guards.
