# How long a generated identifier may be, and where a name inside a routine lives

> Item 12 of the routines remediation · 2026-09-14 · server `fe5f5f78`, corpus `e9d26007`
> Subject: the [routines proposal](../2026-09-03-routines/README.md)'s two open items, measured
> against the signature in [re-derivation.md](../2026-09-03-routines/re-derivation.md)

The routines proposal declares two questions unanswered, and they are one question asked at two
depths. The first asks how long a name the loader generates is allowed to get. The second asks
whether a name written inside a shared body belongs to that body — a scope the loader knows about —
or whether it keeps living in the one flat bag the workflow already has, made unique by having the
host activity and the reference site spelled into it. Both are recorded as waiting on the identifier
measurements being taken again, because the signature those measurements were first taken against was
shaped by a technique that has since been deleted, and the signature that replaced it composes a
prefix running to four segments rather than three.

This takes the measurements again, at the tree as it stands, and answers both. Each answer is a
recommendation for the owner, not a decision.

**The length question has no bound to violate, and the four-segment prefix is shorter than what the
corpus already carries.** Nothing anywhere in the server bounds the length of an identifier: a
`grep` for `maxLength` over `schemas/` returns nothing, and a `grep` for `.max(` over `src/` and
`guards/` returns only arithmetic. The longest step id in the corpus today is 58 characters. The
longest identifier the re-derived convergence signature generates is 54. So the migration this item
gates does not set a new maximum, does not approach one, and cannot break a positional parse — every
consumer that takes an identifier apart reads it by a separator the composed prefix does not use, or
by a prefix length the composed prefix leaves intact.

**The depth question is where the numbers actually are, and they belong to the other migration.** The
figures the proposal tabulates — a 105-character step id and a 124-character response key — come from
the assumption run, not the convergence run, and they come from a name the internals rule mangles
rather than from the step prefix. Taken consistently at one host instead of two, that response key is
**134** characters, not 124. The value doing the inflating is `challenge_findings`, which seven
activities in one workflow declare and write today, under one flat spelling, with the variable guard
green.

## How this was measured

Server `fe5f5f78` on `main`, 92 commits past the `ee95e4cd` the sweep folder closed at. Corpus
`e9d26007` on the `workflows` branch, 38 commits past `a4a5d88b`. The tree moved under this item as
it moved under the sweeps, and three of the moves change a citation rather than a conclusion: the
guard scripts now live in `guards/` rather than `scripts/`, `CHECKPOINT_INSTANCE_SEPARATOR` is now
`INSTANCE_SEPARATOR` (`src/loaders/workflow-loader.ts:472`), and `checkpointBaseId` is now `baseId`
(`:475`). Every figure below is re-derived here rather than carried; the ones that reproduce to the
digit are marked, and the ones that moved are listed at the end.

The population work runs from
[`measure/identifier-lengths.py`](measure/identifier-lengths.py), which parses all 122 activity files
and walks nested loop bodies, so a loop-body step counts once in its own right rather than being
missed. The bound sweep and the parse sweep are greps over `src/`, `guards/` and `schemas/`, listed
with the figures they produced at the end.

## Nothing bounds an identifier's length, and one thing bounds it from below

Every place an identifier is constrained, and what does the constraining.

| Identifier | Constraint | Where it is enforced |
|---|---|---|
| A step id, any kind | `z.string()` — no shape, no length | `src/schema/activity.schema.ts:97`, `:107`, `:133`, `:154` |
| A variable name | lowercase snake_case, **at least two words**; no maximum | `QUALIFIED_DATA_ID_PATTERN`, `src/schema/identifiers.ts:16`, applied at `src/schema/variable.schema.ts:7` |
| A technique I/O id in markdown | the same two-word rule, on the surface no schema sees | `guards/check-identifier-qualification.ts`, hard zero with no ledger |
| An artifact filename | one path segment ending in an extension, `{token}` placeholders allowed; no length | `ARTIFACT_NAME_PATTERN`, `src/schema/technique.schema.ts:54` |
| A `{token}` inside prose or a field | `[a-zA-Z_][a-zA-Z0-9_]*` with optional `.`-separated members — **no hyphen**; no length | `IDENTIFIER_PATTERN`, `src/utils/binding-provenance.ts:36`; `TOKEN_RE`, `src/utils/activity-variables.ts:249` |
| The checkpoint response key | `activity_id` + `-` + `checkpoint_id`, stored under an unconstrained record key | composed at `src/tools/workflow-tools.ts:2110`, typed at `src/schema/state.schema.ts:173` |
| The `checkpoint_id` a worker sends | `z.string()` | `src/tools/workflow-tools.ts:2032` |
| `sessionIndex` | exactly six RFC 4648 base32 characters | `src/schema/session.schema.ts:74`, `:262`; `src/schema/state.schema.ts:148` |

Four absences are worth stating as facts rather than as gaps, because each is somewhere a length
limit would ordinarily hide.

- **No identifier becomes a filename.** The session record is always `session.json` inside a planning
  folder (`src/utils/session/store.ts:42`, `:307-309`), so no step, checkpoint or variable name ever
  reaches a path segment. Artifact filenames come from a technique's own `#### artifact` declaration
  joined to the host activity's numeric prefix — the longest in the corpus is 59 characters, 62 with
  its prefix, against a 255-byte filesystem limit.
- **No store key is derived from an identifier.** The in-process trace store is keyed on session id
  and capped by session count, 1,000 by default (`src/trace.ts:33`, `:63-68`).
- **The only numeric character bound in the server is a log truncation.** `MAX_LOG_VALUE_LENGTH` is
  8,192 (`src/logging.ts:24`), applied to warn and error data values (`:43-44`). The worst identifier
  this item measures is 1.6% of it.
- **The only other character-denominated bound is the delivery budget**, which is computed per worker
  context from the declared context window (`src/utils/batch.ts:137`) and counts whole activity
  deliveries. An identifier is three orders of magnitude below its resolution.

The asymmetry is the useful finding: **the repository bounds a data identifier from below and never
from above.** A variable name must carry at least two words because a bare word names a category
rather than a concept; nothing says a name may not carry eight. So the length question is not "what
limit does this breach" — there is none — but "at what length does a name stop being readable by the
agent that has to compose it, and by the person reading a trace".

## The longest identifiers the corpus carries, by population

All 122 activity files, 990 steps, every one of them carrying an authored id — `defaultStepId` has no
live corpus consumer on the activity side today.

| Population | Size | Distinct | Longest | Median | Longest member |
|---|---|---|---|---|---|
| Step ids, all depths | 990 | 807 | **58** | 19 | `implementation-assumption-decision#{current_assumption.id}` — `work-package/activities/08-implement.yaml:220` |
| Checkpoint step ids | 115 | 109 | **58** | 19 | the same one |
| Checkpoint response keys | 115 | 113 | **76** | 37 | `implementation-analysis-analysis-assumption-decision#{current_assumption.id}` — from `05-implementation-analysis.yaml:144` |
| Variable names declared in activities | 1,265 | 451 | **33** | 16 | `resign_unsigned_commits_requested` — `12-strategic-review.yaml:75` |
| Variable names declared in a `workflow.yaml` | 130 | 92 | **27** | 14 | `all_analysis_artifact_paths` — `prism-audit/workflow.yaml:32` |
| Artifact filenames | 150 | 131 | **59** | 19 | `{scanner_assignment.id}-{scanner_assignment.submodule}.json` — `cicd-pipeline-security-audit/techniques/scan-injection-patterns/TECHNIQUE.md:28` |

The 58 and the 76 reproduce the proposal's own two corpus rows to the digit. Two things about them
are worth carrying.

**The longest identifiers in the corpus are already composed, and a person did not write them
whole.** Every one of the six longest step ids is a loop-body gate carrying the per-iteration
discriminator, whose tail is a `{token}` the worker expands at run time. The length the corpus
tolerates today is therefore not authored length; it is the length of a base plus an interpolation.
That is the same shape a routine prefix produces, one segment earlier.

**The per-iteration discriminator sits at twelve sites, not eleven.** The proposal states eleven
(`decisions.md:407`). Parsing every checkpoint id in the corpus gives twelve carrying `#`, spread
over ten activities in three workflows — seven in `work-package`, two in `workflow-authoring`, one in
`meta` — from 45 to 76 characters as response keys.

Step nesting is shallow and stays shallow: of 990 steps, 804 are top level, 181 sit in one loop body
and 5 sit two deep. Of 115 checkpoints, 93 are top level, 20 one deep, 2 two deep.

## What the four-segment prefix composes, at each reference site

The re-derived signature is two routines. The outer, referred to at six activities, declares no
inputs and wraps a `doWhile` loop around a reconcile step and a reference to the inner one. The inner,
referred to at seven activities in total, is the challenge-and-fold pair. Materialisation prefixes
every identifier inside a routine with the reference step's own id, using a full stop, and prefixes
compose through nesting.

**Six hosts** — `design-philosophy`, `research`, `implementation-analysis`, `plan-prepare`,
`assumptions-review`, `implement` — each carrying one `kind: routine` step whose id stays
`assumption-convergence`:

| Materialised step id | Characters |
|---|---|
| `assumption-convergence.convergence` | 34 |
| `assumption-convergence.convergence.reconcile` | 44 |
| `assumption-convergence.convergence.challenge.challenge` | **54** |
| `assumption-convergence.convergence.challenge.combine` | 52 |

**The seventh host**, `codebase-comprehension`, refers to the inner routine directly from inside a
loop its own activity owns, at the step id the corpus already writes there
(`15-codebase-comprehension.yaml:96`):

| Materialised step id | Characters |
|---|---|
| `challenge-open-questions.challenge` | 34 |
| `challenge-open-questions.combine` | 32 |

Three observations, and the first is the answer to the question this item gates.

**The longest thing the four-segment prefix produces is 54 characters, against a corpus maximum of
58.** The migration lowers nothing and raises nothing: it adds four identifiers per host that sit
inside the range six identifiers in the corpus already occupy. The re-derivation names
`assumption-convergence.convergence.challenge.combine` as the four-segment case; the longer sibling is
`…challenge.challenge`, at 54, because the inner routine's first step and the reference to it carry
the same word.

**This signature contributes no checkpoint at all, so it generates no new response key.** Neither
routine declares a gate — the outer is a loop over a reconcile and a reference, the inner is two
technique steps. The 105 and 124 the proposal tabulates cannot arise from this migration. They arise
from the assumption run, which is a different stage and a signature nobody has re-derived.

**The prefix costs 91 delivered characters per host, against 32 lines of body removed per host.** The
four ids occupy 93 characters today and 184 materialised, a delta of +91 at each of the six and +546
across them, against 192 lines of duplicated body removed in total. As a share of the delivered
activity that is 0.97% at `02-design-philosophy.yaml` and 1.65% at `05-implementation-analysis.yaml`,
the smallest of the six files. The delivery-budget question the proposal defers until measured asks
about techniques bundled twice; this migration binds the same two operations per host before and
after, and refers to no routine twice in any activity, so the only delta is the 91 characters.

## Where the proposal's figures come from, and the one that is understated

The proposal's table is reproducible, and reproducing it shows it is assembled from two different
hosts. Re-derived at each of the four activities that carry the assumption run, against the
proposal's own sketch of it (`README.md:216-275`, reference step `reconcile-assumptions`):

| Host | `current_assumption` | `assumption_presentation` | Loop-body step id | Response key |
|---|---|---|---|---|
| `research` | 49 | 54 | 95 | 104 |
| `implement` | 50 | 55 | 96 | 106 |
| `assumptions-review` | 59 | 64 | **105** | **124** |
| `implementation-analysis` | 64 | **69** | 110 | **134** |

The proposal's 69 is `implementation-analysis`; its 105 and 124 are `assumptions-review`. Read at one
host, the worst case is `implementation-analysis` throughout, and the worst response key is **134**.
The correction does not change any conclusion — there is no bound at 124 either — but the table should
state one host or state the range.

Two qualifications belong with those numbers. The assumption run's signature is a sketch rather than
a re-derivation: the four hosts spell its six positions with fifteen different step ids, so the
reference-site id is a decision stage 5 has not taken, and every figure above moves with it. And the
sketch's reference id, `reconcile-assumptions`, is already a step id in the corpus — it is the first
technique step inside the convergence loop at all six sites — so adopting it verbatim puts one
spelling on two different things in one file.

**The length comes from the internals rule, not from the step prefix.** A step id one level deep is
32 characters (`reconcile-assumptions.batch-gate`). What takes it to 110 is the internal's
materialised name interpolated into the gate's per-iteration discriminator: the base is 40 characters
and the interpolated token is 64.

## The internal is where the four-segment prefix bites, and the rule does not say how

`challenge_findings` passes from the challenge step to the fold step and never leaves, which makes it
an internal of the inner routine. The internals rule says an internal's materialised name carries
both the host activity and the reference site, underscore-joined. With nesting, "the reference site"
has two readings and the proposal states neither.

| Host | Innermost reference id only | Full composed reference path |
|---|---|---|
| `research` | 37 | 72 |
| `implement` | 38 | 73 |
| `plan-prepare` | 41 | 76 |
| `design-philosophy` | 46 | 81 |
| `assumptions-review` | 47 | 82 |
| `implementation-analysis` | 52 | **87** |
| `codebase-comprehension` | 66 | 66 |

The shorter reading takes the innermost reference id alone — `implementation_analysis` +
`challenge` + `challenge_findings`. The longer takes the whole composed path, hyphens and full stops
flattened to underscores — `implementation_analysis_assumption_convergence_convergence_challenge_challenge_findings`.

**The shorter reading is what makes the rule collide, and the rule exists to stop collisions.** Two
references to one routine in one activity are collision-free in step ids by construction, because the
step prefix is the reference site's own id. Under the shorter reading an internal loses that property
the moment the routine is reached twice by two different paths whose innermost reference ids agree —
which is exactly the shape nesting introduces. So the rule as written implies the longer reading, the
longer reading is 87 characters at its worst, and the proposal should say so in one sentence rather
than leaving it to be inferred.

At the comprehension site the two readings coincide at 66, because the reference is one level deep.

## The parses a longer name could break

Two consumers take an identifier apart rather than comparing it whole, and the verification folder
names both. Re-measured here.

**`baseId` splits on the first `#`** (`src/loaders/workflow-loader.ts:475-478`, `indexOf`), returning
everything before it. It has **14 call sites across three files** — `src/utils/validation.ts:95`,
`:284`; `src/loaders/workflow-loader.ts:462`, `:504`, `:505`, `:536`; and eight in
`src/tools/workflow-tools.ts` (`:727`, `:728`, `:743`, `:907`, `:915`, `:934`, `:1007`, `:1420`). Ten
read an activity or frontier id and four read a checkpoint id. A prefix using `#` would be swallowed
at all fourteen; a prefix using a full stop passes through, and a 54-character base before a `#`
behaves exactly as a 19-character one does.

**`immediateExitCut` reads by prefix length** (`src/utils/validation.ts:91-95`). It forms
`activityId + '-'`, keeps the response keys starting with it, and recovers the checkpoint id as
`key.slice(prefix.length)`. This is the one positional read in the server, and it is positional only
in the sense of knowing where the activity id ends — which it does because it was handed the activity.
The composed key is ambiguous in principle, both halves being kebab-case, and this is why a `-`-joined
routine prefix is unavailable: it would deepen an ambiguity the parse already carries. A `.`-joined
prefix adds nothing the parse has to resolve.

**No consumer reads a step id as a dotted path.** There are 19 `.split('.')` sites across `src/` and
`guards/`. Every one of them takes a variable path, a condition path, a `when` expression, a fan's
collection expression, a filesystem path, or a dotted rule address in prose — `gate-liveness.ts:7`
and `:56`, `activity-variables.ts:253`, `:303`, `:314`, `condition.schema.ts:42`,
`when-expression.ts:289`, `workflow-tools.ts:771`, `workflow-loader.ts:933`, and ten in the guards.
The full stop is therefore free in the step-id vocabulary and taken in the variable vocabulary, which
is exactly why the internals rule joins with an underscore and the step prefix joins with a full stop.
That split is load-bearing and it survives measurement.

Three further parses are separator-count sensitive, and none of them sees a materialised step id.
`parseFragmentRef` (`src/loaders/fragment-resolver.ts:37-45`) admits one `::` and throws on a second.
`containerMember` and `readCarriesIndex` (`src/utils/activity-variables.ts:302-316`) require an
all-digit segment in second position. `branchKey` (`src/schema/workflow.schema.ts:144`) substitutes
every hyphen in an activity id for an underscore to derive a bag name, and would mangle a full stop —
but a routine is never a fan branch, so it never reaches it.

One consumer composes rather than parses, and it is the correctness half of the length question.
`yield_checkpoint` assigns the per-iteration key to the worker: the corpus technique that documents
the call tells the agent to "expand a declared `#{...}` template, or use the loop item's id/slug"
(`meta/techniques/workflow-engine/yield-checkpoint.md:24`), and the server matches the definition on
the base while keying the response on the full string (`:35-37`). A mis-composed instance therefore
does not fail. It records a new checkpoint and asks a question whose answer already exists. What a
model has to reproduce exactly, at the assumption run's worst host, is a 110-character string of
which 64 characters are a mangled variable name it never sees anywhere else.

## The identifier-length item — recommendation

**Recommended: adopt no limit, and state the measured ceiling as a fact the design carries rather than
as a rule it enforces.** Three measurements support it.

Nothing in the server or the schemas bounds a length, so a limit would be new machinery with no
existing enforcement point, and the construct is not waiting on it. The migration this item was said
to gate produces a maximum of 54 characters against a corpus maximum of 58, so a limit set anywhere
sensible would be inert on the only conversion in scope. And a limit is the wrong instrument for the
failure that actually exists: the hazard is a worker mis-composing a key, and a cap on how long the
key may be does not make a 90-character key easier to reproduce than a 110-character one.

**Recommended alongside: move composition of the per-iteration key from the worker to the server.**
This is the proposal's own cheaper answer to the correctness half, and the measurements say it is the
whole of the correctness half. The server already owns the base definition, owns the loop item, and
already keys the response on the full string; the only reason the worker composes the id is that
`yield_checkpoint` takes it as a parameter. That change retires the one failure mode length
contributes to, and it is independent of everything in stages 3 through 6.

**Recommended for the record: restate the proposal's table at one host**, with the worst case as 134
rather than 124, and mark the assumption-run rows as conditional on a reference-site id stage 5 has
not chosen.

## The scoped-names item — recommendation

**Recommended: keep the mangled global for the first version, and record scoping as the settled
direction with the evidence that it costs nothing the corpus is currently getting.**

The mangled form works and is measured: 87 characters at worst, no bound breached, no parse broken,
and the guard suite silent on it. `read` returns for any name outside the declared namespace and
`write` records into `writes` only inside it (`src/utils/activity-variables.ts:450-457`, `:475-482`),
and `undeclared-crossing` skips a name with no consumer elsewhere
(`guards/check-activity-variables.ts:243`), which a name carrying its host and reference site cannot
have. So a prefixed internal reaches neither rule — the completeness pass's withdrawn claim
re-confirmed here at the moved line numbers rather than carried.

What the measurement adds is the price of the thing the mangling buys. The internals rule exists to
stop two activities writing one bag name. **Seven activities in one workflow write one bag name
today**: `challenge_findings` is declared at `02-design-philosophy.yaml:23`, `04-research.yaml:29`,
`05-implementation-analysis.yaml:31`, `06-plan-prepare.yaml:34`, `07-assumptions-review.yaml:34`,
`08-implement.yaml:32` and `15-codebase-comprehension.yaml:22` — seven, against the proposal's six —
and `npx tsx guards/check-activity-variables.ts` reports OK over the whole corpus. `current_assumption`
and `assumption_review_presentation` are each declared at four. So fifteen write declarations across
the two runs carry three values that never leave the step sequence that produces them, under three
flat spellings, with nothing reporting it.

That reframes the hazard the proposal records against scoping — "two activities would then write one
bag name" — as the corpus's present and green state for exactly these values. The mangling does not
remove a live fault; it forecloses one that the flat bag has never actually produced here, at a cost
of 87 characters and of a name a model must reproduce inside a gate template.

So the recommendation is sequencing rather than preference. Land the construct on the mangled form,
because it is measured and it materialises correctly. Record that scoping is where the length goes
away rather than where it becomes safe, that it collapses the 87 to 18, and that the four surfaces
reading the bag as flat — the session record's key layout, the crossing check, the producer index and
`inspect_session`'s variable view — are the scope of that change. Do not schedule it inside the
routines plan; it is a change to what a name is, and the routines plan is a change to what a body is.

**One clarification the proposal owes now, at no cost:** which of the two readings of "the reference
site" an internal's name takes when the reference is nested. State the full composed path, since the
shorter reading loses the collision-freedom the rule exists to provide.

## The two names

The proposal names the two routines provisionally and says so. Both proposed names are verb-first
phrases — `challenge-concerns` and `converge-assumptions` — which is the shape the corpus gives a
technique *operation* (`analyse-challenge::challenge`, `review-assumptions::reconcile`). A routine is
not an operation; it is a named shared body that a step refers to. The corpus already has two of
those, and they are the construct a routine replaces outright: the checkpoint fragments
`assumption-interview` and `assumption-decision` (`work-package/workflow.yaml:17`, `:50`). Both are
kebab-case qualified noun phrases in the subject-plus-act shape, and both resolve under the
`[workflow::]name` grammar a routine adopts. That is the convention to conform to, and conforming to
an existing one is what `no-invented-naming` (AP-04) asks for.

### The inner routine: `concern-challenge-pass`

The run it names is one adversarial challenge of a concern set followed by the fold of the findings
back into it. Every word of the proposed name is already written in the contract the run binds.
`work-package/techniques/analyse-challenge/TECHNIQUE.md:8` states the capability as "Adversarial
challenge of a concern set and the fold of its findings back into that set", names its input
`challenge_perspectives` as "adversarial perspectives … for **the challenge pass**", and describes
`concern_document` as "the log or table **this pass** reads and updates". So `concern`, `challenge`
and `pass` are the contract's own three words for subject, act and unit of work — nothing is invented.

The head noun matters and it is `pass`. The distinction between the two routines is precisely that
this one runs once and the other runs it until nothing resolvable remains, so the name has to say
"one traversal" for the pair to read correctly. `pass` is the corpus's word for that: ten `prism`
activities carry it as their head noun — `structural-pass`, `adversarial-pass`, `synthesis-pass`,
`behavioral-synthesis-pass`, `dispute-pass`, `subsystem-pass`, `verified-pass`, `reflect-pass`,
`smart-pass`, `adaptive-pass`.

The qualifier must be domain-neutral, and this is measured rather than stylistic: the same body serves
assumptions at six sites and comprehension open questions at the seventh, binding `concern_document`
to `assumptions_log` at one and to `comprehension_artifact` at the other
(`07-assumptions-review.yaml:94` against `15-codebase-comprehension.yaml:101`). `concern` is the word
the technique chose to be neutral with, so the routine inherits it rather than picking a second.

### The outer routine: `assumption-convergence`

The corpus has already named this run, six times, byte-identically. The loop block carries
`id: assumption-convergence` and `name: Assumption Convergence Loop` at all six hosts, under one
SHA across 32 lines. Taking the routine's name from the id the sites already spell means the
migration renames nothing, the reference step keeps the id it has, and no reader has to learn a
second word for the thing.

It is right for the name to be domain-specific where the inner one is neutral, and the signature says
why: the outer routine declares **no inputs** and four assumption-named outputs, because six
byte-identical copies means every value in it is a constant. A name promising neutrality would promise
a parameterisation the body does not have.

Naming the routine after the step id that refers to it is the arrangement the loader already assumes:
a technique step that omits its id gets one derived from the last segment of the operation it binds
(`defaultStepId`, `src/schema/activity.schema.ts:181-184`). No corpus step relies on that today — all
990 carry an authored id — but 199 of the 661 technique steps spell their id as the operation's own
last segment anyway, so a definition name and the step id referring to it agreeing is an established
reading rather than a new one.

### What the two names settle, and what they leave

Both files are `work-package/routines/<name>.yaml`. All seven referring files are
`work-package/activities/*.yaml`, so the placement rule computes `work-package` as the home for both —
`remediate-vuln` borrowing fourteen of those files changes nothing, which is the case `placement.md`
exists to handle. Neither name is qualified, neither carries a `::`, and neither needs a group
grammar, so both sidestep the resolution-rule reconciliation the sweep folder records as plan defect 5
rather than depending on how it is settled.

What the names do not settle is the assumption run's, which is stage 5's and is not re-derived
anywhere. Its provisional reference id collides with a live step id, and the four hosts spell its six
positions fifteen ways, so that naming is a decision with evidence still to gather.

## Figures that moved, and figures that reproduce

Moved, and each should be corrected where it is stated:

- The per-iteration discriminator sits at **12** checkpoint ids, not 11 (`decisions.md:407`).
- `baseId` has **14** call sites across **3** files, not the 13 across 4 the server-code verification
  records; the roles split 10 activity-shaped and 4 checkpoint-shaped.
- `challenge_findings` is declared at **7** activities, not 6 — reproducing the completeness pass's
  correction against `README.md:905`.
- The worst-case response key for the assumption run is **134**, not 124; the proposal's table takes
  its internal from one host and its key from another.
- The guard scripts moved from `scripts/` to `guards/`, and the two identifier symbols were renamed;
  every sweep citation to `scripts/check-*.ts`, `CHECKPOINT_INSTANCE_SEPARATOR` or `checkpointBaseId`
  needs repointing.

Reproduce to the digit: the longest corpus step id at **58**; the longest checkpoint response key at
**76**; the generated one-level step id at **32**; the generated internal at **69** and the loop-body
step id at **105** and response key at **124**, each at the host the proposal silently chose; the
nested-routine example `converge-assumptions.pass.iteration.challenge` at **45**; six byte-identical
32-line convergence blocks under one SHA across seven binding activities; and **115** checkpoint
steps.

## Re-taking these figures

Run from the server checkout root. The corpus root is `workflows/` where a submodule holds it and
`.worktrees/workflows/corpus/` where a branch worktree does.

    # every population, the composed prefixes, and the delivery delta
    python3 .engineering/artifacts/planning/2026-09-11-routines-remediation/measure/identifier-lengths.py
    python3 ...measure/identifier-lengths.py --report composed

    # the absence of any length bound
    grep -rn maxLength schemas/                                   # nothing
    grep -rn '\.max(' src/ guards/ --include=*.ts | grep -v Math  # nothing
    grep -n MAX_LOG_VALUE_LENGTH src/logging.ts                   # 8192, the only one

    # the two parses, and the vocabulary each separator belongs to
    grep -rn 'baseId(' src/ guards/ --include=*.ts | wc -l        # 15 lines, 14 of them calls
    grep -n 'prefix.length' src/utils/validation.ts               # :95
    grep -rn "split('\.')" src/ guards/ --include=*.ts | wc -l    # 19, none of them a step id

    # the sites, and that the six blocks are still one body
    grep -rln 'analyse-challenge::challenge' --include=*.yaml <corpus>   # 7 files
    grep -rn 'name: challenge_findings' --include=*.yaml <corpus>        # 7 declarations
    npx tsx guards/check-activity-variables.ts --root <corpus>           # OK

    # the vocabulary the two names are built from
    sed -n '1,20p' <corpus>/work-package/techniques/analyse-challenge/TECHNIQUE.md
    grep -rn 'id: .*-pass$' --include=*.yaml <corpus>                    # 10 prism activities
    grep -n -A2 '^fragments:' <corpus>/work-package/workflow.yaml        # the two shared bodies

Measured against the [routines proposal](../2026-09-03-routines/README.md) §Identifier hygiene and
§Decisions, [decisions.md](../2026-09-03-routines/decisions.md) §Still open,
[re-derivation.md](../2026-09-03-routines/re-derivation.md), and the
[verified sweep outcome](../2026-09-10-routines-sweeps/README.md) — whose
[server-code](../2026-09-10-routines-sweeps/verification/server-code.md) CV17 named the two
identifier parses, and whose
[completeness](../2026-09-10-routines-sweeps/verification/completeness.md) pass reached the session
record's two identity surfaces (§One) and withdrew the variable-guard claim this item re-confirms
(§Six).
