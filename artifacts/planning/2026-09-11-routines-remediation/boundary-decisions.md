# Three things the repository refuses to grant the routines design

Stages 3 and 4 of the [routines plan](../2026-09-03-routines/README.md), for
[#531 W3/W4](https://github.com/m2ux/workflow-server/issues/531). Companion to the
[verified sweep outcome](../2026-09-10-routines-sweeps/README.md), whose third, fourth and fifth plan
defects are the three questions settled here.

A routine is a named, parameterised run of steps that lives in its own file and is referred to from
an activity. Two of the construct's claimed advantages — that a reference can be treated as a
boundary, and that what crosses that boundary is exactly what the routine declares — turn on three
assumptions about the code. Measured, all three are false. Each is a place where somebody has to
choose rather than measure, because the design cannot be built either way until the choice is made,
and because two of the three change what a stage is allowed to promise.

This record establishes the facts, lays the options out with what each costs, recommends one, and
says what only the owner can settle. Where a choice changes an acceptance criterion, the current
wording is quoted and a replacement is given.

**The headline.** The load path the design diagram draws is not merely unbuilt — the order it draws
cannot produce the property it is drawn for. Materialisation splices a routine's steps in place of
its reference, so a contract derivation running *after* materialisation meets spliced steps and never
meets a reference. The diagram and the sentence under it contradict each other, and the stage-3
criterion that would have caught it asks for a test of an ordering between a loader function and a
guard script, which is not an ordering anything can swap.

## Where this was measured

Server tooling at `ee95e4cd`, the revision the brief names. The corpus submodule at `a4a5d88b`. Both
were extracted with `git archive` into a scratch tree, because every worktree standing at `ee95e4cd`
is carrying a parallel agent's uncommitted edits — one of them to `src/loaders/workflow-loader.ts`,
which is the file decision one turns on.

`main` has since moved to `fe5f5f78` and renamed `scripts/` to `guards/`. Nothing in the three
decisions changes, but a reader chasing a citation on `main` should expect the derivation's two call
sites at `guards/check-activity-variables.ts:158` and `:483`.

Nothing in the design is built. No `routines/` directory exists in any of the eighteen corpus
workflows, and `src/schema/activity.schema.ts:167-172` declares `StepSchema` over four members. The
registry in `scripts/guards.ts` holds 40 guards against 44 `check-`/`validate-` scripts on disk, and
`check-activity-variables` passes over this corpus, reporting that "every activity declares the
variables it reads and writes, every write has a reader, and every read has a writer on every path".
That last fact matters throughout: the contract check is at hard zero today, so every new finding
class discussed below starts life as a regression.

---

# One. Nothing in the load path derives a contract, and the order the design draws would erase the thing it is drawn to protect

## What is true today

A workflow is loaded by `loadWorkflowWithDiagnostics` (`src/loaders/workflow-loader.ts:249-393`). It
does six things in order:

| Order | What | Site |
|---|---|---|
| 1 | Parse and validate each activity file | `src/loaders/workflow-loader.ts:87-93`, `:167-173` |
| 2 | Fill in any step identifier the author left out, per scope | `:94`, `:174` (`populateStepIds`, defined at `src/schema/activity.schema.ts:193`) |
| 3 | Validate the assembled workflow object | `:312` |
| 4 | Splice shared checkpoint bodies into the steps that refer to them | `:346` (`materializeActivityFragments`) |
| 5 | Merge every activity's write declarations into the workflow's variable set | `:367` |
| 6 | Check that each exit an activity declares is bound by the graph | `:383` |

Deriving a contract is not among them. `deriveActivityContract` is defined once, at
`src/utils/activity-variables.ts:417`, and a search of `src/`, `scripts/` and `tests/` returns that
definition, a mention of its own name in the module's doc comment at `:19`, and exactly two call
sites — `scripts/check-activity-variables.ts:158` and `:483`. Both sit inside one guard script. Both
read the loader's output, at `:108` and `:477`, so both are handed activities whose fragment
references were already spliced away at step 4.

So there is no ordering in the loader between materialisation and derivation, because only one of the
two is in the loader.

The second fact is the one no document in the sweep folder states, and it is worse than the first.
The design's diagram draws `Parse → Ids → Materialise → Derive → Bind → Ready` (README:333-350) and
the sentence beneath it says materialisation runs "**before** the contract is derived, so the
derivation still meets the reference and can treat it as a boundary" (README:352-354). Those cannot
both be true. Materialisation is a substitution (README:356): it replaces a reference step with the
routine's own steps, renamed, and the diagram's own terminal node reads "Loaded workflow — ordinary
steps only". A derivation running after that meets the routine's spliced body. The reference is gone.
To meet a reference, the derivation has to run *before* materialisation, which is the opposite of
what the diagram draws.

Three further facts settle what the options cost.

**The splice mutates in place.** `materializeActivityFragments` returns `void`
(`src/loaders/fragment-resolver.ts:137-152`) and walks the activity's own step array. There is no
authored copy left behind once it has run.

**The loader already carries a side table.** `WorkflowWithDiagnostics`
(`src/loaders/workflow-loader.ts:44-53`) returns `activitySourceWorkflow`, a map from activity id to
the workflow the file was authored in, kept because a borrowed activity resolves its bare references
against its source rather than its borrower. Adding a second such table is a pattern the loader
already has, not a new one.

**The derivation is expensive and the loader is on the request path.** The derivation reads every
bound operation's markdown through `composeActivityTechnique`, which is why it costs what it does.
Timed over the eighteen corpus workflows and their 143 activities, three consecutive runs:

| Run | Load | Derivation | Ratio |
|---|---|---|---|
| 1 | 235.1 ms | 484.2 ms | 2.1× |
| 2 | 243.0 ms | 493.7 ms | 2.0× |
| 3 | 249.8 ms | 502.0 ms | 2.0× |

For `work-package` alone — fifteen activities — the load is 46.2 ms and the derivation 104.3 ms.
`loadWorkflow` and `loadWorkflowWithDiagnostics` are called at seven sites in
`src/tools/workflow-tools.ts` (`:616`, `:956`, `:1420`, `:2031`, `:2278`, `:2345`, `:2578`), and the
loader holds no cross-call cache: the only map in it is `fragmentCache`
(`src/loaders/workflow-loader.ts:338`), built and discarded inside a single load. So a derivation
moved into the loader is paid on every tool call that loads a workflow.

One correction to the design's own survey while the subject is open. README:1066-1068 states that six
guards consume the loader and names `check-audience`, `check-stealth-isolation`,
`check-activity-variables`, `check-session-contract`, `check-all-refs` and `check-artifact-guides`.
Measured, five do: `check-all-refs`, `check-activity-variables`, `validate-workflow-yaml`,
`check-session-contract` and `check-stealth-isolation`. Two of the named six do not, and one that does
is not named.

## What the design assumes

That the load path has a stage between materialisation and variable contribution at which a
derivation runs and sees a reference; that the order of those two stages is the guarantee; and that a
test can fail when the order is swapped. Stage 3's fourth criterion (README:854-855) and stage 4's
first (README:867-868) both rest on it, and stage 4's entire contribution is the boundary.

## The options, and what each costs

**A — Move the derivation into the loader, after the splice.** This is the diagram read literally.

The derivation would run over materialised steps, which is exactly the state its two call sites
already see, so nothing about the boundary improves — a routine's internals and its prefixed
identifiers would flow into the host activity's contract and the signature would count for nothing.
Stage 4's first criterion becomes unachievable rather than unimplemented. Cost: 2.0× the load on
every one of the seven tool call sites, and a decision about what the loader does with findings it
was not previously producing. **Reject.** It pays the highest price for the property it removes.

**B — Move the derivation into the loader, before the splice.** The order the diagram should have
drawn.

The derivation meets the reference, the boundary exists, and the criterion becomes testable as
written with its two terms reversed. Cost: the same 2.0× per load, plus a harder problem. The
derivation's output today is guard findings, graded against a corpus. Running it inside the loader
means either computing it and throwing it away on the request path, or turning contract findings into
load failures — which changes behaviour at all seven tool call sites and at all five loader-consuming
guards, for a rule that is currently a guard's business. **Viable, expensive, and it moves a
guard-grade analysis onto the request path.**

**C — The loader returns both forms.** It keeps the authored activities alongside the materialised
ones, on the object it already returns.

The guard derives from the authored form and meets the reference; the server delivers the
materialised form. The boundary stops depending on an order at all, because the two forms coexist.
Cost: `materializeActivityFragments` mutates in place, so each activity must be copied before the
splice — memory and a structured clone per load, but no technique-markdown reads and nothing added to
the request path. The real cost is a register: every consumer now chooses a form, and one that
chooses wrong is silently wrong. That register is already owed — README:1024-1083 is a two-column
table assigning each guard to the authored or the materialised form, and stage 4's fourth criterion
asks for it — so this option makes an existing obligation load-bearing rather than adding one.
**Cheapest on the request path.**

**D — A side table of spliced spans.** The loader records, per activity, which runs of steps came
from which routine and under what signature, and the derivation skips those spans and charges the
signature instead.

The loader already returns a table of this shape (`:44-53`), and README:1087-1089 already assumes
something like it — "the loader injects them into that activity's `variables.writes` during
materialisation". Cost: the derivation gains a second traversal rule that has to stay correct through
nesting and identifier prefixing, and a span that drifts by one step yields a wrong contract with no
error anywhere. **Most machinery for the same result, and the only option whose failure mode is
silent.**

## Recommendation

**Take C.** Derive from the authored form, deliver the materialised form, and stop making the
boundary a property of an order.

The reason is that the boundary's only consumer is a guard. Stage 4 wants the derivation to treat a
reference as a boundary so that a routine's internals do not appear in its host's contract and so
that a routine can be checked without a host. Both of those are things a guard does over authored
files. Putting the machinery for them on the request path, which is what A and B do, buys nothing for
the server and costs 2.0× the load on every call. D buys the same thing as C and adds a silent
failure mode.

C also makes stage 3's ordering criterion unnecessary rather than merely unsatisfiable, which is the
right outcome for a criterion whose subject does not exist.

## What the owner must confirm

- That the contract derivation stays a guard concern and does not become a load failure. C assumes
  this. If the intent is that a routine whose body contradicts its signature fails the *load* rather
  than failing a guard run, B is the option, and its cost has to be accepted.
- That a second copy of every activity per load is acceptable. The measurement above prices the
  derivation, not the clone; the clone should be measured before the stage is scheduled, and it is
  the one number this record does not have.
- That the guard column register (README:1024-1083) becomes a real register rather than a planning
  table. Stage 4's fourth criterion already asks for this and `GuardSpec` (`scripts/guards.ts`) does
  not hold it; under C it stops being a nicety.

## The criteria that change

Stage 3, fourth criterion. Current (README:854-855):

> - [ ] Materialisation runs after identifier resolution and before contract derivation, and a test
>       fails if the order is swapped.

Replacement:

> - [ ] The loader returns the authored activities alongside the materialised ones. A test loads an
>       activity whose step list contains a routine reference and asserts that the authored form
>       still carries a `kind: routine` step while the materialised form carries none, and that
>       identifiers inside the materialised body are prefixed from the reference step.

Stage 4, first criterion. Current (README:867-868):

> - [ ] The derivation treats a reference as a boundary: the signature counts and the body is never
>       consulted.

Replacement:

> - [ ] The contract derivation reads the authored form. A test derives the contract of an activity
>       whose only step is a routine reference and asserts the result is exactly the routine's
>       declared signature — the inputs a `with` binding does not satisfy with a literal as reads,
>       the bound outputs as writes, and no internal and no name reachable only through the body.

And the architecture section needs its diagram corrected, because a reader following README:333-354
will build option A and believe it has a boundary.

---

# Two. A shared run reads names its signature does not declare, and the largest source is not the one the sweep found

## What is true today

When the contract derivation meets a step that binds a technique, it asks the technique what it
needs. `readSignature` (`src/utils/activity-variables.ts:348-398`) composes the operation with its
container contracts and then gathers every `{token}` interpolation from three places: the titles and
steps of its protocol blocks (`:362-365`), its rules (`:366-368`), and the filename template of any
artifact one of its outputs declares (`:369-372`). It drops the tokens naming the operation's own
declared inputs and outputs (`:373`, `:389`) and hands the rest back as `proseReads`. The derivation
adds all of them to the referring activity's reads on one line, `signature.proseReads.forEach(read)`
at `:520`.

Those tokens live in technique markdown. They are not a field of any step, so nothing in the
substitution field list reaches them and materialisation cannot rewrite them. That is the finding the
sweep made, and it reproduces. Measured over the 676 technique bindings in the corpus's 132 activity
files, applying the same placeholder and environment-probe filters the code applies
(`src/utils/activity-variables.ts:237-246`):

| | Count |
|---|---|
| Bindings whose signature carries at least one surviving prose token | **174** of 676 |
| Distinct names arriving this way | **118** |
| Distinct operations carrying at least one | **130** |
| Activity files receiving at least one | **65** of 132 |

By source: 110 of the 118 names come from protocol titles and steps, 11 from rules, and 3 from
artifact filename templates. Only two — `codebase_area` and `decision_title` — are reachable through
an artifact filename alone. That is the whole of the carve-out the design already states
(README:212-214), and it covers two names out of 118.

**But prose is not the largest source, and on the design's own worked bodies it is not a source at
all.** There is a second way a bound operation puts a name into its host's contract, and the design
never mentions it. At `:508-519` the derivation walks the operation's declared inputs. An input the
step binds contributes whatever the binding spells. An input the step does *not* bind resolves from
the session bag under its own name — `consume(input.id)` when the input carries a default or is
marked optional (`:517`), and `read(input.id)` when it does not (`:518`). A required input nobody
binds is therefore a read of a name the step never spells, which inside a routine is a free variable
exactly as a prose token is, and for the same reason: there is no field for materialisation to
rewrite, because the binding is absent.

Run against the two routine bodies the proposal's own re-derivation writes out
(`re-derivation.md:110-206`), using the real resolver:

| Routine | Declared | Free variables | Where they come from |
|---|---|---|---|
| `challenge-concerns` | 2 inputs, 4 outputs, 0 internals | **8** | unbound required inputs of `analyse-challenge::challenge` and `::combine` |
| `converge-assumptions` | 0 inputs, 4 outputs, 0 internals | **10** | unbound required inputs of `review-assumptions::reconcile` |

The eight are `branch_name`, `component_git_dir`, `planning_folder_path`, `pr_number`,
`problem_statement`, `requirements`, `target_path` and `target_repo`. `converge-assumptions` adds
`assumption_source` and `assumption_categories`. Not one of the eighteen arrives from prose: the
three operations these bodies bind — `analyse-challenge::challenge`, `analyse-challenge::combine` and
`review-assumptions::reconcile` — carry **zero** surviving prose tokens between them at this corpus
revision.

One detail is worth keeping because it shows the category is not cosmetic. `target_path` is marked
optional on `analyse-challenge::challenge`, so it is consumed rather than read there; it is not
marked on `::combine`, so the same name in the same two-step body is invisible at one step and a read
at the next.

Held against what the corpus does today, the eight behave as ordinary workflow variables and the two
do not. Emitting the derived contracts with
`check-activity-variables --emit-contracts` and checking each name against the seven `work-package`
activities that carry assumption work:

- `branch_name`, `component_git_dir`, `planning_folder_path`, `pr_number`, `problem_statement`,
  `requirements`, `target_path`, `target_repo` — read by **all seven**.
- `assumption_source`, `assumption_categories` — read by **none**, because they are declared as
  variables nowhere in the corpus and are supplied as literals at the reference site instead. They
  are bound on the `collect-assumptions` step that sits *outside* the convergence loop
  (`work-package/activities/04-research.yaml:130`,
  `work-package/activities/02-design-philosophy.yaml:168-169`), with a different literal per host,
  while the `reconcile-assumptions` step inside the loop binds nothing at all
  (`04-research.yaml:148-150`). So `review-assumptions::reconcile` reads two names from a bag that
  has never held them. That is a defect in the corpus today, and converting the run to a routine is
  what would surface it.

## What the design assumes

That a routine has no free variables — "every name its body reads or writes is one of the three,
which is what makes the signature a contract and the body checkable on its own" (README:210-212),
with a single carve-out for artifact filename templates (README:212-214). And that this is one of the
construct's two advantages over any other way of sharing a body: "a technique's delivered prose leaks
its `{token}`s into the referring activity's reads … whereas a routine has no free variables and
contributes only what it declares" (README:526-529).

## The options, and what each costs

**1 — Carve out the categories.** Name prose tokens, unbound required technique inputs and artifact
filename templates as exempt from the invariant.

Cost, measured: on the design's own two bodies this exempts 18 free variables out of 18. Stage 4's
signature check (README:869-871) then has nothing left to check on the corpus's flagship conversion,
because the only names it can hold against a body are the ones already declared. Stage 4's walker
seed (README:877) is drawn from the declared inputs, so it supplies 2 of the 10 names
`converge-assumptions` needs and the walk stalls or invents the rest. And README:526-529's tight
boundary is withdrawn in substance while staying on the page. **The check goes vacuous and the seed
stays short.**

**2 — Drop the invariant.** State that a routine reads from its host's bag like any activity, and
that its signature names only what varies between reference sites.

This is the honest description of what the corpus does — eight of the twelve names are read by all
seven hosts already. Cost: the derivation can no longer charge a host the signature alone, because
the host is still on the hook for those eight. It must charge the routine's transitively derived free
set, which is a second derivation over the routine body. That machinery is the isolated check stage 4
already wants, so the cost is in the claim rather than the code — but stage 4's first criterion,
"the body is never consulted", is exactly what has to go. **The check survives in a different shape;
the seed still cannot be drawn from the declared inputs.**

**3 — Require the body's free names to be declared as inputs.** Every name a routine's body reads and
its signature does not declare becomes a declared input, and the load fails otherwise.

This is the only option that keeps both properties. The signature check stays meaningful in both
directions: a declared input the body never reads is a finding, and a name the body reads that the
signature omits is a load failure. And the walker seed becomes satisfiable, because seeding from the
declared inputs now supplies every name the body reads — which is the whole point of README:877.

Cost as stated: `converge-assumptions` goes from 0 declared inputs to 10, `challenge-concerns` from 2
to 8, and each of the six convergence reference sites binds all ten — sixty argument lines against
the 192 lines of duplication the stage removes. It also retires the re-derivation's own framing that
"six byte-identical blocks means every value in them is a constant" (`re-derivation.md:100`): eight of
the ten are constants across the six sites, and two vary per host today.

**3′ — The same, with an unbound input falling through to the host's value under the same name.** The
routine declares the name, which is what makes the read visible in the signature and checkable
against the body; a reference site that does not bind it means "take what the host has". This is the
name-match convention the derivation already implements for technique inputs at `:517-518`, given a
third standing on a routine input declaration rather than a fourth mechanism. The sixty argument
lines do not appear, and both properties are kept.

## Recommendation

**Take 3′.** Declare the free names as inputs; let an unbound one fall through to the host's bag.

It is the only shape in which stage 4's two criteria mean anything. Option 1 exempts precisely the
names that make the check worth running; option 2 removes the check's subject; both leave the walker
seed unable to start a walk. Option 3 keeps the properties and pays for them at every reference site,
which is a tax on the mechanism whose purpose is to remove repetition. The fall-through in 3′ is not
new machinery — it is the standing `readSignature` already computes for a technique input, applied to
a routine input.

Two things follow and should be written down at the same time.

**The tight-boundary claim is withdrawn.** README:526-529 offers two differences a routine has over a
technique. The first — that a declared signature becomes checkable against a mechanical body — is
real and survives intact; it is what stage 4 grades, and it is the one the guarantees table records
(README:624-625). The second — that the boundary is tighter — does not. A routine's signature under
3′ names the same reads the host already carries. Two restatements carry the same claim and need the
same correction: README:757-758, which lists "read a name it does not declare" among the things a
routine cannot do, and the design's own reader-by-reader summary at README:72, where the contract
derivation "treats a routine reference as a boundary: the routine's signature counts, its body does
not".

**The design's stated carve-out has to be implemented, not just stated.** Artifact filename tokens
enter the same list as protocol and rule tokens, at `:369-372`. A routine binding a technique that
declares an artifact will read `codebase_area` or `decision_title` unless those tokens are kept out
of `proseReads` at the point they are collected. Two names, and the rule already exists in prose.

## What the owner must confirm

- Whether a reference site that does not bind a declared input is legal. 3′ says yes and the
  signature is still complete; 3 says no. This is the whole difference between the two, and it is a
  judgement about how much a reference site should have to spell.
- What happens to `assumption_source` and `assumption_categories`. They are read from a bag that does
  not hold them, at every host, today. The options are to declare them as workflow variables, to bind
  them inside the routine body as literals, or to declare them as routine inputs the six sites bind —
  and only the third preserves the per-host difference the corpus currently expresses outside the
  loop. This is a stage-2 disposition that no census row carries.
- Whether the tight-boundary claim's withdrawal changes the case for the construct. It should not —
  the checkability difference is the one that collapses 28 variable declarations to seven — but the
  proposal argues from both, and an owner who was persuaded by the second is entitled to re-read the
  case with it removed.

## The criteria that change

Stage 4, second criterion. Current (README:869-871):

> - [ ] A routine's declared signature is held against its own body. An output nothing writes, an
>       input nothing reads, and an internal that is read but not written or written but not read
>       each fail the load.

Replacement:

> - [ ] A routine's declared signature is held against its own body, where the body's reads are the
>       tokens its step fields spell plus, for every bound operation, that operation's prose
>       interpolations and the declared inputs the step leaves unbound. An output nothing writes, a
>       declared input nothing reads, an internal read but not written or written but not read, and
>       **a name the body reads that the signature does not declare**, each fail the load. An
>       artifact filename template is the one exemption, because the worker interpolates it at write
>       time and no definition reads it.

Stage 4, fifth criterion. Current (README:877):

> - [ ] The walker gains a routine-level entry, seeded from the declared inputs.

Replacement:

> - [ ] The walker gains a routine-level entry, seeded from the declared inputs — which, by the
>       criterion above, name every value the body reads, so the seed is complete by construction
>       rather than by inspection.

And README:210-214 needs restating so the invariant describes what it now is: a routine has no
*undeclared* free variables, and an unbound input takes the host's value under the same name.

---

# Three. Two resolution rules share one spelling, and they disagree on 406 of 676 bindings

## What is true today

The corpus spells a cross-scope reference with a double colon, and two different rules read that
spelling. They are implemented three times.

**The fragment rule.** `parseFragmentRef` (`src/loaders/fragment-resolver.ts:38-45`) splits on `::`.
One segment is a bare name. Two segments make the head a **workflow**, and `candidateWorkflows`
(`:47-54`) then looks in that workflow and nowhere else (`:49`). Three or more segments throw
`Malformed fragment ref` (`:44`). A bare name resolves against the current workflow and then `meta`
(`:50-52`).

**The technique rule.** `readTechniqueWithSource` (`src/loaders/technique-loader.ts:110-188`) decides
the same question by asking the filesystem: the head is a workflow prefix only when
`<corpus>/<head>/techniques` exists (`:136`). Otherwise the head is a **group**, resolved against the
declaring workflow and then `meta` (`:154-156`), and depth is unbounded — `group::subgroup::op` is
ordinary (`:155`, `:159`). A bare name falls back to `meta` the same way (`:179-186`).

`parseTechniquePath` (`:233-251`) is a second implementation of the technique rule, carrying the same
probe at `:246`, used by `resolveTechniques` at `:273`.

Reading every technique binding in the corpus's 132 activity files by the fragment rule, and
comparing against what the technique loader does with it:

| How the fragment rule reads it | Bindings | Agreement |
|---|---|---|
| Bare name — current workflow, then `meta` | **266** | agree |
| One separator, head is a directory carrying `techniques/` | **4** | agree |
| One separator, head is not — read as a workflow that does not exist, with no group fallback | **359** | **disagree** |
| Two or more separators — throws | **47** | **disagree** |

**Agree on 270, disagree on 406, of 676.** Over the flat population the loader itself discovers — 129
files, 656 bindings, excluding the three in `meta/activities/patterns/` — the split is 266 / 4 / 339 /
47, agreeing on 270 and disagreeing on 386. The sweep's figure was 264 agreeing and 408 disagreeing
of 672 at the older corpus pin; the shape reproduces and the digits have moved, as they should have
over 28 commits.

Forty-six distinct heads are read as a workflow by one rule and a group by the other. The largest are
`review-assumptions` (38 bindings), `workflow-engine` (32), `version-control` (25),
`workflow-definition` (24) and `orchestration-patterns` (15). The throwing bucket has five distinct
references, of which `work-package::manage-artifacts::write-artifact` accounts for 42 of the 47 — a
reference the technique loader resolves cleanly as a cross-workflow prefix plus a nested group.

The four the rules agree on are worth naming because they are the entire population of real
cross-workflow technique prefixes in the corpus: `work-package::project-type-detection` and
`work-package::repo-root-resolution` at `remediate-vuln/01-start.yaml`, and
`work-package::stakeholder-overview` at `workflow-design/01-intake-and-context.yaml` and
`06-scope-and-draft.yaml`.

All eighteen corpus workflows carry a `techniques/` directory, which is why the head-is-a-workflow
question never diverges for a real workflow name today. A workflow added without one would diverge
immediately.

## What the design assumes

README:311-316 argues the shared home from a single premise:

> A routine name resolves as `[workflow::]name` … That is the resolution the existing shared gate
> reference already implements … **The shared home is therefore `meta`**, because that is what a bare
> technique path already falls back to: referencing a routine the way the corpus references a shared
> technique gives the corpus one resolution rule rather than two.

Two claims are folded together there, and they have different fates.

- *A routine reference resolves the way a technique reference does.* False, for 406 of 676 bindings.
- *A bare name falls back to `meta`.* True of **every** resolver in the tree — the fragment rule at
  `fragment-resolver.ts:50-52` and the technique rule at `technique-loader.ts:179-186` — and
  exercised by 266 bindings.

The shared-home conclusion needs only the second. It survives; its stated reason does not.

## The options, and what each costs

**1 — No group grammar.** A routine name is `[workflow::]name`, at most one separator, exactly the
fragment rule.

This matches the directory the design specifies. A routine lives at `routines/<name>.yaml`, one file
per routine, with no position number (README:182, README:1124) — a flat directory with no group level
for a grammar to address. Cost: none beyond a sentence. `parseFragmentRef` is eight lines and already
under test. The design owes an explicit statement that a routine name carries no group grammar, and a
load failure on a second separator whose message says that rather than "Malformed fragment ref". The
divergence between the two technique resolvers stays confined to techniques and never reaches
routines.

**2 — The probe rule.** Decide workflow-versus-group by testing whether `<corpus>/<head>/routines`
exists, with unbounded depth.

Cost: a filesystem probe per reference on the load path, a nested `routines/` shape the design does
not specify and the corpus would not use, and a third implementation of a rule already implemented
twice. It buys the ability to group routines, and there are no routine groups. **Reject.**

**3 — A third grammar**, such as a slash form or a mandatory prefix. A fourth spelling in a corpus
already carrying two rules across three implementations. **Reject.**

## Recommendation

**Take 1**, and repair the argument rather than the rule.

The rule the design names is the right one; the reason it gives for naming it is false and has to be
replaced, because a reader who believes "one resolution rule rather than two" will also believe the
corpus has no resolver divergence to worry about. The shared home rests on the `meta` fallback, which
every resolver in the tree implements identically and 266 bindings exercise. That premise is true,
narrow, and sufficient.

The argument survives with the shared-home conclusion unchanged: `work-package` for the assumption
routine, `meta` for the fan-out, `workflow-design` for commit-and-publish — the placements
`placement.md` derives — because those follow from the file-ownership rule and from the bare-name
fallback, not from the claim about a single rule.

## What the owner must confirm

- That reconciling the two technique resolvers is a separate decision, not folded into routines. It
  is real debt — 406 bindings read one way by one resolver and another way by the other, and a third
  implementation of the same rule sitting beside the second — but nothing about routines requires
  fixing it, and a stage that adopts it will not finish. The right home is its own ticket.
- That a routine name will never want a group. If the corpus is expected to grow routine families
  that want a namespace, option 1 has to be revisited before the grammar ships, because widening a
  shipped grammar is cheaper than narrowing one.

## The wording that changes

README:311-316 is prose rather than a criterion, and it is the load-bearing sentence. Replacement:

> A routine name resolves as `[workflow::]name`: a qualified name in that workflow only, a bare name
> against the referring workflow and then the shared home. A borrowed activity resolves against its
> **source** workflow rather than its borrower, exactly as a fragment reference does. A routine name
> carries no group grammar and a second separator fails the load, because a routine lives one file
> deep in a flat `routines/` directory and has no group level to name. **The shared home is therefore
> `meta`**, because a bare name falls back to `meta` in every resolver the tree has — the checkpoint
> fragment resolver and the technique loader alike.

Stage 3 lists resolution in its scope (README:771) and carries no criterion for it. One is owed:

> - [ ] A routine reference with two or more separators fails the load with a message naming the
>       routine, the reference site and the one-separator rule. A qualified reference resolves in the
>       named workflow only; a bare reference resolves against the referring activity's source
>       workflow and then `meta`. A test covers all three.

---

# What this changes in the plan

| Stage | Criterion | Change |
|---|---|---|
| 3 | Materialisation before derivation, testable by swapping (README:854-855) | Replaced. The order stops being the guarantee; the loader returning both forms is |
| 3 | — | Added. A resolution criterion, which the stage's scope implies and its criteria omit |
| 4 | The derivation treats a reference as a boundary (README:867-868) | Replaced. The boundary is the authored form, and the criterion names what a reference-only activity's contract must equal |
| 4 | A routine's signature is held against its body (README:869-871) | Replaced. The body's reads are widened to prose interpolations and unbound declared inputs, with the artifact filename the one exemption |
| 4 | The walker's routine entry is seeded from the declared inputs (README:877) | Replaced. Complete by construction once the criterion above holds |
| — | The tight-boundary claim (README:526-529, restated at README:72 and README:757-758) | Withdrawn. The checkability difference survives; the tightness does not |
| — | One resolution rule rather than two (README:311-316) | Replaced. The shared home rests on the `meta` fallback, which is true, rather than on a single rule, which is not |
| — | The load-path diagram (README:333-354) | Corrected. As drawn it erases the reference it claims to preserve |

Three of the eight are withdrawals of a claim rather than repairs to a mechanism, which is the thing
worth carrying out of this record: the construct is not in doubt, but two of the three advantages the
proposal argues from do not hold as stated, and a stage graded against them cannot pass.

# How each figure was taken

Server tooling extracted with `git archive ee95e4cd`, corpus with `git archive a4a5d88b`, both into a
scratch tree, with `node_modules` symlinked from the parent checkout so the repository's own resolver
could be used rather than reimplemented.

The five scripts behind the counts are in [measure/](measure/) and run in place from a server
checkout, taking the corpus root as their first argument:

| Script | Figures |
|---|---|
| [`resolver-disagreement.py`](measure/resolver-disagreement.py) | The 676 bindings and their 266 / 4 / 359 / 47 split; the flat grain; the throwing references and the disagreeing heads. Takes `recursive` as a second argument for the 132-file grain |
| [`prose-sourced-reads.ts`](measure/prose-sourced-reads.ts) | 174 bindings, 118 names, 130 operations, 65 activity files |
| [`prose-read-sources.ts`](measure/prose-read-sources.ts) | The 110 / 11 / 3 split by source, and the two names reachable only through an artifact filename |
| [`routine-free-variables.ts`](measure/routine-free-variables.ts) | The 8 and 10 free variables of the design's two worked bodies, each with the step and the reason |
| [`derivation-cost.ts`](measure/derivation-cost.ts) | Load against derivation, per workflow and in total |

- **Load-path order, call sites, resolver line numbers** — read from the extracted files;
  `grep -rn "deriveActivityContract" src scripts tests` and
  `grep -rn "populateStepIds" src/ scripts/ tests/`.
- **Loader consumers** — `grep -ln "loadWorkflowWithDiagnostics\|loadWorkflow(" scripts/check-*.ts
  scripts/validate-*.ts`, five files.
- **Load and derivation timings** — a script calling `loadWorkflowWithDiagnostics` then
  `deriveActivityContract` per activity for all eighteen workflows, three consecutive runs.
- **Technique binding classification** — every activity YAML parsed, every step walked at all depths,
  every `technique` reference classified by segment count and by whether `<corpus>/<head>/techniques`
  exists. Reported at both the recursive grain (132 files, 676 bindings) and the flat grain the
  loader discovers (129 files, 656 bindings).
- **Prose-sourced reads** — `readSignature`'s collection replayed against `composeActivityTechnique`
  for every binding, with the placeholder and environment-probe filters from
  `src/utils/activity-variables.ts:237-246` applied as the code applies them.
- **Routine free variables** — the two bodies at `re-derivation.md:110-206` resolved through the real
  loader, with each bound operation's declared inputs classified as bound, suppliable-and-unbound, or
  required-and-unbound, and each name tested against the routine's three declaration lists.
- **Live host contracts** — `npx tsx scripts/check-activity-variables.ts --emit-contracts --root
  <corpus>`, 143 derived contracts, each free variable tested against the seven `work-package`
  activities carrying assumption work.
- **Guard counts** — `grep -cE "^\s+id: '" scripts/guards.ts` gives 40;
  `ls scripts/ | grep -cE "^(check|validate)-.*\.ts$"` gives 44.
