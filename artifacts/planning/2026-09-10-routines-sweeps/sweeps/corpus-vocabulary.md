# What the corpus definitions would owe a routine, and what they would get back

The sweep of the definition tree at `workflows/` for the routines proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). Companion to the three
ground-truth records in [../ground-truth/](../ground-truth/), which count the guard machinery, the
mechanisms a routine retires, and what stage 0 landed. This one reads the definitions themselves.

Server tooling at `9ca71c19` on `main`; corpus at `2b8b7215` on the `workflows` branch. Every figure
below was taken from the repository. Where a figure disagrees with the proposal, or with a
ground-truth record, this document gives its own and says so.

**Nothing in the design is built.** `grep -rn "kind: routine\|routines/" workflows/ src/ scripts/
schemas/` returns nothing, `ls workflows/*/routines` reports no such file or directory, and
`src/schema/activity.schema.ts:167` declares `StepSchema` over exactly four members. The guard suite
is green: `npx tsx scripts/check-all.ts` reports 40 guards in 3.1 seconds, 40 pass, 0 fail. So every
construct here is one that stands today.

## What binds this surface together

One thing does, and it is smaller than the proposal's three headline arguments suggest. A run of
steps in this corpus has no name, so **everything a run needs from its surroundings is written out
once per site, and everything it hands back is declared once per site.** That produces four
populations, and each is a separate sweep result rather than a restatement of the others.

- **Copied structure.** 192 lines of byte-identical loop across six files, 141 lines of one
  interview run across four, 22-line loop blocks repeated across two workflows with seventeen lines
  in common, and whole activity files that differ in five lines of 27 and eight of 41.
- **Copied declarations.** 255 of the corpus's 635 activity-level write declarations — **40.2%** —
  are byte-identical copies of a declaration body that appears at two or more activity files, across
  88 distinct bodies. That is the population a signature collapses, and it is the largest measured
  number in this sweep.
- **Copied conventions with no mechanism behind them.** Hand-written step-id prefixes, an
  accumulating `set` action written eleven times with two byte-identical descriptions, an output
  remap block copied at seven sites.
- **Canon prose that names the run because there is nothing to point at.** The construct-choice table
  spells out four ordered step sequences as the alternative to borrowing an activity, and the design
  principles enumerate exactly two composition routes.

Against that, one mechanism does exist for one narrow case — the checkpoint fragment — and it works
by *inheritance* rather than by declaration, which is the thing a routine cannot reproduce and the
sharpest finding in this sweep.

**29 candidates.** Nine come out entirely, one comes out only after something else lands, nine
survive with a smaller job, seven the construct leaves alone, and three are claims in the proposal
that the corpus contradicts.

## Verdicts

| Id | Construct | Verdict | Stage |
|---|---|---|---|
| CV1 | The `fragments.checkpoints` block — two gate bodies, 57 lines | REMOVE | 5 |
| CV2 | The eight `ref:` reference steps | REMOVE | 5 |
| CV3 | A fragment body's inherited reads of the host workflow's flat namespace, and the dismissibility its shared condition confers | NARROWS | 5 |
| CV4 | The site condition on the per-item gate at `07-assumptions-review` | REMOVE | 5 |
| CV5 | Eight write declarations for the run's two internals | REMOVE | 5 |
| CV6 | The other twenty of the twenty-eight assumption-run declarations | NARROWS | 5 |
| CV7 | Fifteen hand-written step-id spellings for six positions | REMOVE | 5 |
| CV8 | The `#{item.field}` per-iteration discriminator, twelve corpus sites | KEEP | none |
| CV9 | Six byte-identical 32-line convergence loop blocks | REMOVE | 6 |
| CV10 | `challenge_findings` — seven write declarations, no reader, no step mention | REMOVE | 6 |
| CV11 | `has_resolvable_assumptions` — six declared *reads* at the six identical sites | REMOVE | 6 |
| CV12 | The four `combine` output remaps at seven sites, four ids to seven names | KEEP | 6 |
| CV13 | The 79-line `deep-dive-iteration` loop at the comprehension site | NARROWS | 6 |
| CV14 | Two `assumption-reconciliation` while loops across two workflows | KEEP | none |
| CV15 | `iteration_mode` and `analyse-challenge::run-loop` | STALE | none |
| CV16 | The prism per-unit passes — three the proposal names, two it does not | NARROWS | 7 |
| CV17 | `all_artifact_paths` at ten prism activities, and the accumulating `set` at eleven sites | NARROWS | 7 |
| CV18 | The compose-then-dispatch fan-out run at fourteen sites in seven files | NARROWS | 8 |
| CV19 | Five fan-out write declarations at four `meta` and two `substrate` activities | REMOVE | 8 |
| CV20 | The two `02-execute-analysis` activities in `prism-audit` and `prism-evaluate` | KEEP | none |
| CV21 | `schema-construct-inventory.md:68` — the checkpoint-fragment row | DEPRECATE | 5 |
| CV22 | `schema-construct-inventory.md:36-37` and design principle 26 — the composition-layer enumeration | NARROWS | 3 |
| CV23 | `schema-construct-inventory.md:38-42` — four rows spelling a step run in prose | NARROWS | 8 |
| CV24 | `audit-schema-validation.md:29` — corpus prose stating what the fragment guard checks | STALE | 5 |
| CV25 | `AP-114 pass-orchestration-in-technique` — its Fix names one destination | NARROWS | 3 |
| CV26 | `AP-38 no-duplicate-technique-steps` | KEEP | none |
| CV27 | `duplicate-rule` and `duplicate-checkpoint` — two rules over an empty population | KEEP | 5 |
| CV28 | The produce-then-persist pair — 46 bind sites, 39 adjacencies, 36 distinct producers | KEEP | none |
| CV29 | `decisions.md:432-433` — "every activity that would refer to one declares a single `done` exit" | STALE | none |

Verdicts mean: **REMOVE**, the construct goes entirely at the named stage. **DEPRECATE**, it has to
go but not before something else lands, and taking it out early leaves a live mechanism
undocumented or reddens a named guard while a named caller survives. **NARROWS**, it survives with a
smaller job. **KEEP**, the routines construct leaves it alone. **STALE**, the construct is fine and
the proposal's description of it is what needs correcting.

---

## CV1 — The two shared gate bodies

`workflows/work-package/workflow.yaml:15-71` is the corpus's single `fragments` declaration. It spans
**57 lines**, the next top-level key being `techniques:` at line 72, and holds two named checkpoint
bodies: `assumption-interview` at `:17-49` (33 lines, three options) and `assumption-decision` at
`:50-71` (22 lines, three options). `grep -rn "fragments" --include=*.yaml workflows/` returns this
line and one unrelated prose mention of a changelog fragment at
`work-package/activities/12-strategic-review.yaml:196`.

Between them the two bodies read four names and write three. Of the four reads, **one** —
`is_review_mode`, in `assumption-interview`'s shared condition at `:22` — is a declared workflow
variable (`work-package/workflow.yaml:76`). The other three are activity-scoped:
`has_open_assumptions` at `:26`, `assumption_review_presentation` in the message at `:29`, and
`current_assumption` through `assumption-decision`'s message at `:51`. Of the three writes, **one** —
`assumption_outcome` — is a workflow variable (`work-package/workflow.yaml:112`, and also
`workflow-design/workflow.yaml:27` and `remediate-vuln/workflow.yaml:80`); `has_deferred_assumptions`
and `needs_individual_interview` are activity-scoped only. So five of the seven names the routing
file's gate bodies touch belong to one activity's state, which reproduces the proposal's complaint
about the arrangement exactly.

**Verdict: REMOVE at stage 5, in the same commit as CV2.** Splitting them fails either way. Delete
the block while the eight refs survive and the loader throws `FragmentResolutionError`
(`src/loaders/fragment-resolver.ts:63-65`), `check-fragments` raises `unresolved-ref`
(`scripts/check-fragments.ts:207-208`), and the four loader-consuming guards go down with it —
`activity-variables`, `stealth-isolation`, `refs` and `workflow-yaml`, each hard zero with no ledger.
Delete the eight refs while the block survives and `unused-fragment` fires
(`scripts/check-fragments.ts:242`), also hard zero.

**Blast radius.** 57 lines at one file; eight caller steps in four files (CV2); one corpus canon row
(CV21); one corpus technique sentence (CV24); seven of the fragment guard's nine rules; twelve
committed option-coverage entries, which
[../ground-truth/guard-obligations.md](../ground-truth/guard-obligations.md) measures.

## CV2 — The eight reference steps

`grep -rn "ref:" --include=*.yaml workflows/` outside `cicd-pipeline-security-audit` and
`.github/` returns exactly eight lines, four per fragment, all inside `work-package`:

| Fragment | File | Line | Step id |
|---|---|---|---|
| `assumption-interview` | `work-package/activities/04-research.yaml` | 224 | `research-assumption-interview` |
| `assumption-interview` | `work-package/activities/05-implementation-analysis.yaml` | 126 | `analysis-assumption-interview` |
| `assumption-interview` | `work-package/activities/07-assumptions-review.yaml` | 112 | `residual-assumption-batch` |
| `assumption-interview` | `work-package/activities/08-implement.yaml` | 202 | `implementation-assumption-interview` |
| `assumption-decision` | `work-package/activities/04-research.yaml` | 243 | `research-assumption-decision#{current_assumption.id}` |
| `assumption-decision` | `work-package/activities/05-implementation-analysis.yaml` | 145 | `analysis-assumption-decision#{current_assumption.id}` |
| `assumption-decision` | `work-package/activities/07-assumptions-review.yaml` | 130 | `assumption-decision#{current_assumption.id}` |
| `assumption-decision` | `work-package/activities/08-implement.yaml` | 221 | `implementation-assumption-decision#{current_assumption.id}` |

No activity references either fragment twice, so the collision case the identifier prefixing is
designed for has no instance. All four host files are borrowed by a second workflow:
`workflows/remediate-vuln/workflow.yaml:203-216` names fourteen `work-package` activity files,
including all four hosts and all seven convergence sites. A borrowed activity resolves its bare refs
against its source workflow (`src/loaders/fragment-resolver.ts:132-152`), so the eight references
keep their meaning in both.

**Verdict: REMOVE at stage 5.** Each becomes a step inside one routine body, so the caller count
falls from eight to zero and the corpus's authored gate count falls by eight.

## CV3 — What a fragment inherits and a routine has to declare

This is the candidate the brief asks about directly, and the answer is that a one-step routine can
do everything a fragment does today **except inherit**, and paying for the inheritance costs more
than the mechanism it replaces.

Three things a fragment gets for free.

**A fragment body reads the host workflow's flat variable namespace with no declaration of any
kind.** `assumption-interview` reads `is_review_mode`, `has_open_assumptions` and
`assumption_review_presentation`, and writes `assumption_outcome`, `has_deferred_assumptions` and
`needs_individual_interview` — six names, zero declarations in the fragment. A routine has no free
variables: "every name its body reads or writes is one of the three" categories (README:210-211). So
a one-step routine for `assumption-interview` declares **three inputs and three outputs**, and each
of the four reference sites binds three `with` arguments and three output maps — **24 bindings against
today's four `ref:` lines and nothing else.** The lone-gate case therefore costs 6 declarations plus
24 bindings to replace 4 lines, which is a regression in economy at exactly the case
`decisions.md:442-447` names as the reason the second mechanism need not survive. The record states
three counts on which the routine form is better — signature, computed home, prefixed identifiers.
The fourth count runs the other way, and the record does not carry it. Two of the three it does carry
are inert here: the computed home is `work-package`, which is where the block already lives, and no
activity references either fragment twice.

**A shared condition is written once and copied onto every use site by the loader.**
`src/loaders/fragment-resolver.ts:127` does `if (body.condition) step.condition =
structuredClone(body.condition)`, so `assumption-interview`'s two-conjunct condition
(`work-package/workflow.yaml:18-28`) reaches all four batch gates from one place. Under the
proposal's own example routine the batch gate carries `message` and `options` and no condition
(README:248-251), and the entry test moves to the reference site as
`when: has_open_assumptions == true` (README:291). That is four copies of a condition the mechanism
currently holds once — the duplication the fragment exists against, reintroduced at the field the
fragment was best at. Keeping it inside the routine instead means the body reads `is_review_mode` and
`has_open_assumptions`, which it may not, so they become two more inputs and eight more bindings.

**A checkpoint's `condition` is what makes it dismissible, and `when` is not.**
`src/schema/activity.schema.ts:75` states it: "On a checkpoint step, only `condition` (not `when`)
enables condition_not_met dismissal", and `:85` repeats it. The server enforces it —
`src/tools/workflow-tools.ts:2392-2398` throws `Cannot dismiss checkpoint '<id>': it has no condition
field` when `condition_not_met` arrives at a checkpoint with no `condition`. Measured over all 122
activity files: **115 checkpoint steps, of which 66 carry a structured `condition` as written, 2
carry `when` alone, none carries both, and 47 carry neither.** The four batch gates sit in the
"neither" bucket as written and in the `condition` bucket after materialisation, so the corpus has
**70 dismissible gates** at load and four of them get their dismissibility from a file other than
their own. Converting them the way the proposal's example does drops it at all four.

**Verdict: NARROWS at stage 5.** The mechanism is reproducible; the inheritance is not, and the
migration owes an explicit answer on whether the batch gate keeps a `condition`. If it does, the
routine declares two further inputs and the sites bind them. If it does not, four gates stop being
dismissible and that is a behaviour change at a live site, which the standing criterion at
README:815-818 puts under the walk-before-merge rule.

## CV4 — The one site condition with no home in the signature

`work-package/activities/07-assumptions-review.yaml:131-135` puts `is_review_mode != true` on its
`assumption-decision` ref step. It is the only one of the eight reference steps carrying a site
condition, and it is legal precisely because `assumption-decision` declares none — the loader rejects
a condition on both sides (`src/loaders/fragment-resolver.ts:118-122`).

Under the proposal's signature the per-item gate is a step inside the routine body (README:269-271)
with no `when` and no `condition`, and the reference site's gates apply to the whole reference rather
than to one step inside it. So this condition has nowhere to go. Neither
[drift-census.md](../../2026-09-03-routines/drift-census.md) nor
[re-derivation.md](../../2026-09-03-routines/re-derivation.md) resolves it;
[../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md) records it as row 11,
a difference the census does not carry, without saying what becomes of it.

It can be dropped, and the reason is in the file. The gate sits inside the `forEach`
`assumption-interview-loop`, whose own gate at `07-assumptions-review.yaml:123` reads
`is_review_mode != true && needs_individual_interview == true && has_open_assumptions == true`. The
loop is not entered in review mode, so the inner condition can never be reached with
`is_review_mode == true`. It is redundant against its enclosing loop.

**Verdict: REMOVE at stage 5.** One condition block, five lines, one site. Removing it changes no
behaviour because the enclosing gate subsumes it — but it does remove the gate's dismissibility at
that one site, which is the CV3 question again at a second place, and the disposition record should
say so rather than let regeneration take it.

## CV5 — Eight declarations for two values that never leave

Two of the seven names the assumption run touches never cross an activity boundary:
`assumption_review_presentation`, the judgement-augmentation context the batch gate displays, and
`current_assumption`, the interview loop's item. Measured by reading `variables.writes[].name` and
`variables.reads[]` from all 122 activity files:

| Name | Declared writes | Declared reads |
|---|---|---|
| `assumption_review_presentation` | 4 — `04-research.yaml:23`, `05-implementation-analysis.yaml:25`, `07-assumptions-review.yaml:28`, `08-implement.yaml:26` | **0** |
| `current_assumption` | 4 — `04-research.yaml:44`, `05-implementation-analysis.yaml:38`, `07-assumptions-review.yaml:37`, `08-implement.yaml:42` | **0** |

Neither appears in any `workflow.yaml` `variables[]`. **Eight declarations, zero declared reads
anywhere in the corpus.** That reproduces the proposal's figure exactly.

One asymmetry the figure hides. `assumption_review_presentation` appears in the *steps* of three of
its four declaring hosts — `04-research.yaml:177`, `05-implementation-analysis.yaml:123`,
`08-implement.yaml:199`, each inside a byte-identical `action: message` block — and at zero steps of
`07-assumptions-review.yaml`, whose announcement step (`:106-109`) carries no message action at all.
So one of the four declarations describes a value the file never mentions again.

**Verdict: REMOVE at stage 5.** These are the internals. Eight declarations at four files become two
`internals` entries in one routine file. Nothing outside the four hosts declares an interest, so
nothing else can break.

## CV6 — The twenty remaining assumption-run declarations

The run's other five names are declared as writes at all four hosts too. Corpus-wide the seven names
carry **38** write declarations across eight activity files, because `has_deferred_assumptions` (7),
`has_open_assumptions` (8), `open_assumptions` (7) and `assumption_outcome` (4) also reach
`02-design-philosophy.yaml`, `03-requirements-elicitation.yaml`, `06-plan-prepare.yaml` and, for two
of them, `workflow-design/activities/03-requirements-refinement.yaml`. **28 of the 38 sit at the four
hosts**, which reproduces.

Declared write totals per host are **15, 11, 12 and 17** at `04-research.yaml`,
`05-implementation-analysis.yaml`, `07-assumptions-review.yaml` and `08-implement.yaml`. README:38
says "at two of the four hosts that is seven of eight declared writes"; **no host declares eight
writes.** The strongest case the corpus supports is `05-implementation-analysis.yaml`, where ten of
eleven declared writes describe the two shared runs and the eleventh is `changed_files`. The
argument survives re-measurement; the ratio does not.
[../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md) reaches the same ten
of eleven independently.

`assumption_outcome` is the one name of the seven that genuinely crosses activities: 4 declared
writes, **6 declared reads** (`02-design-philosophy`, `03-requirements-elicitation`, `04-research`,
`05-implementation-analysis`, `06-plan-prepare`, `workflow-design/03-requirements-refinement`), and
three workflow-level declarations. Its ten activity-level declarations sit at **eight** distinct
files, and it appears in the steps of **none** of them — the only writer in the corpus is a fragment
option effect (`work-package/workflow.yaml:36`, `:43`, `:58`, `:64`, `:71`).

**Verdict: NARROWS at stage 5.** Twenty declarations at four files become three `outputs` entries in
one routine. The workflow-level declarations stay, and so do the ten declarations at the four
activities that are not reference sites: `02`, `03`, `06` and `workflow-design/03` declare these
names because their own steps write them, not because they host the run.

## CV7 — Fifteen spellings for six positions

The run occupies six step positions inside what becomes the routine body, at each of four hosts —
24 step instances. Their identifiers were written by hand and they do not agree:

| Position | Spellings | Where they differ |
|---|---|---|
| Batch gate | **4** | `research-assumption-interview`, `analysis-assumption-interview`, `residual-assumption-batch`, `implementation-assumption-interview` |
| Batch record | **2** | `record-batch-response` ×3, `record-batch-decision` at `07` |
| Interview loop | **2** | `assumption-interview` ×3, `assumption-interview-loop` at `07` |
| Per-item present | **1** | `present-assumption` ×4 |
| Per-item gate | **4** | `research-`, `analysis-`, bare, `implementation-` prefixes on `assumption-decision` |
| Per-item record | **2** | `record-response` ×3, `record-decision` at `07` |

**Fifteen distinct identifiers for six positions over 24 step instances.** Under a routine, six body
ids plus four reference-site ids are authored and the other fourteen spellings stop existing. The
proposal is right that the prefixes buy legibility rather than disambiguation — identifiers are
scoped per activity, and a checkpoint response is keyed on the activity and the checkpoint together —
but the measurement worth carrying is that three of the six positions are spelled differently at
exactly one host, `07-assumptions-review`, and one position (`present-assumption`) is spelled the
same at all four. The convention is hand-maintained and it is 5 for 6 inconsistent.

**Verdict: REMOVE at stage 5.** Fourteen of the fifteen spellings go. Every one of the 24 step
identifiers changes, which is the sessions-in-flight cost the proposal accepts at README:1130-1137
and the twelve stale option-coverage entries
[../ground-truth/guard-obligations.md](../ground-truth/guard-obligations.md) measures.

## CV8 — The per-iteration discriminator

`grep -rn 'id: .*#{' --include=*.yaml workflows/` returns **twelve** sites. Four are the per-item
assumption gates. The other eight are `meta/activities/02-resolve-target.yaml:64`,
`workflow-authoring/activities/09-validate-and-commit.yaml:128` and `:175`,
`workflow-authoring/activities/06-scope-and-draft.yaml:98` and `:135`,
`work-package/activities/03-requirements-elicitation.yaml:116`,
`work-package/activities/10-post-impl-review.yaml:162`, and
`work-package/activities/14-complete.yaml:92`. Three of the twelve discriminate on a round counter at
the top level rather than on a loop item.

**Verdict: KEEP.** The routines design reserves `#` for exactly this and takes a full stop as the
prefix separator because "the server splits a checkpoint id on the first one to find its base
definition" (README:544-546). The construct is untouched at all twelve sites; what changes is that
four of them gain a generated prefix in front.

## CV9 — Six byte-identical loop blocks

Six activity files carry a `doWhile` loop whose body is `review-assumptions::reconcile`, then
`analyse-challenge::challenge`, then `analyse-challenge::combine`. Located by the `id:
assumption-convergence` line and closed at the first line indented no deeper than the `- ` opener,
then normalised for leading indentation and hashed:

| File | Lines | Length |
|---|---|---|
| `work-package/activities/02-design-philosophy.yaml` | 177-208 | 32 |
| `work-package/activities/04-research.yaml` | 137-168 | 32 |
| `work-package/activities/05-implementation-analysis.yaml` | 83-114 | 32 |
| `work-package/activities/06-plan-prepare.yaml` | 115-146 | 32 |
| `work-package/activities/07-assumptions-review.yaml` | 74-105 | 32 |
| `work-package/activities/08-implement.yaml` | 159-190 | 32 |

All six hash to one SHA-256 prefix, `9365f28c74d12705`. **192 lines of byte-identical structure**,
including the perspective list `["stakeholder-gap", "rejected-paths", "evidence-strength"]` and all
four output remaps. The hash prefix differs from the `1d1e8bc06add9904` in
[../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md) because the
normalisation differs; the identity across all six, and the 192, reproduce.

The proposal's own search reproduces too. `python3
.engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py` reports 122 activity
files parsed and **26 maximal shared windows, 21 top level and 5 nested**, and the widest nested
window is `challenge` → `combine` at **seven** activities with `reconcile` → `challenge` →
`combine` at **six**.

**Verdict: REMOVE at stage 6.** 192 lines become one routine body of about 26 lines plus six
reference steps. Nothing in the guard suite compares step sequences, so nothing reddens on the way
out — `ls scripts/ | grep -i "repeat\|routine"` returns nothing, which is what stage 1 exists to add.

## CV10 — `challenge_findings`, declared seven times and mentioned in no step

`grep -rn "challenge_findings" workflows/` returns thirteen lines. Four are `analyse-challenge/challenge.md`
(`:18`, and the container's Outputs), two are `analyse-challenge/combine.md` (`:12`, `:38`), one is an
anti-pattern example, and **seven** are activity-level write declarations:
`02-design-philosophy.yaml:23`, `04-research.yaml:29`, `05-implementation-analysis.yaml:31`,
`06-plan-prepare.yaml:34`, `07-assumptions-review.yaml:34`, `08-implement.yaml:32`,
`15-codebase-comprehension.yaml:22`.

Those seven are precisely the seven convergence sites. The name has **zero declared reads** anywhere
and appears in **zero steps** of any activity file — it exists in the declarations only because the
contract derivation reads it out of the bound technique's composed signature.
`analyse-challenge/challenge.md:18-20` declares it as an output; `analyse-challenge/combine.md:12-14`
declares it as an input. Nothing else touches it.

README:208, README:905 and `re-derivation.md:257` all state six.
[../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md) reaches seven and
records that the figure was taken mid-flight. I reach seven independently.

**Verdict: REMOVE at stage 6.** Seven declarations become one `internals` entry on
`challenge-concerns`. It is the strongest single instance of the pattern in the corpus: a name whose
only home is a declaration block, copied seven times, describing a value that passes between two
adjacent steps.

## CV11 — Six read declarations nobody counts

`has_resolvable_assumptions` is declared as a write at **eight** activity files and as a **read at
six** — `02-design-philosophy`, `04-research`, `05-implementation-analysis`, `06-plan-prepare`,
`07-assumptions-review`, `08-implement`. Those six are exactly the six byte-identical convergence
sites.

At each of them the name has exactly two occurrences in the steps, and both are inside the loop block
CV9 removes: the `continueWhile` variable (`02:183`, `04:143`, `05:89`, `06:121`, `07:80`, `08:165`)
and the `combine` output remap (`02:206`, `04:166`, `05:112`, `06:144`, `07:103`, `08:188`). Nothing
outside the block reads it.

So when the loop moves into `converge-assumptions`, the write survives as a bound output at each site
and **the read declaration has nothing left to describe.** Six read declarations come out. The
proposal counts the twelve declarations injection *supplies* (README:1108) and the six — actually
seven — `challenge_findings` declarations it removes; nobody counts these six.

**Verdict: REMOVE at stage 6.** Six declarations at six files, uncounted by any record in the
routines folder. `03-requirements-elicitation.yaml:190` and
`workflow-design/activities/03-requirements-refinement.yaml:154` also read the name in a
`continueWhile`, but neither is a convergence site — see CV14 — so their declarations stay.

## CV12 — Four output ids, seven destination names

Every one of the seven convergence sites carries an `outputs` remap on its `combine` step. The six
identical sites bind all four ids; the comprehension site binds three:

| Output id | Destination at the six | Destination at `15-codebase-comprehension` |
|---|---|---|
| `concern_document` | `assumptions_log` | `comprehension_artifact` (`:109`) |
| `concerns_agent_resolvable` | `has_resolvable_assumptions` | `needs_comprehension` (`:110`) |
| `residual_opens_remain` | `has_open_assumptions` | `has_open_questions` (`:111`) |
| `residual_opens` | `open_assumptions` | *unbound* |

**Four output ids to seven distinct destination names.** README:303 describes this as "the same three
outputs to five different names"; it is four to seven, which
[../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md) also measures.

`residual_opens` is marked `*(optional)*` in `analyse-challenge/combine.md:32`, which is what makes
the comprehension site's three-of-four binding legal today and what `re-derivation.md:136` carries
forward as `unbound: permitted`.

**Verdict: KEEP at stage 6.** The remap is the mechanism the routine preserves rather than removes —
README:300-303 makes it the reason one routine can serve two domains. Twenty-eight remap lines at
seven sites become the same twenty-eight as reference-site `outputs` bindings. Stage 6's own
criterion at README:900-901 says so. What is worth flagging is that this is the one place in the
migration where the line count does **not** fall: the copies survive because they are the varying
part.

## CV13 — The seventh convergence site

`work-package/activities/15-codebase-comprehension.yaml:79-157` is a `while` loop, **79 lines**,
whose body runs `codebase-comprehension::deep-dive`, then `revise-questions`, then the same
`challenge`/`combine` pair at `:95-111`, then two `write-artifact` calls at `:112-126`, then a
sufficiency gate at `:127-157`. README:43 states 75 lines and `re-derivation.md:56` states 80; I
measure 79, as does
[../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md).

`revise-questions` at `:92-94` sitting between the analysis and the challenge is what forces the
two-level split: the seven sites share only the two steps after it, which is why the shared body is
`challenge-concerns` and not the whole loop.

**Verdict: NARROWS at stage 6.** Seventeen of the 79 lines come out — the `challenge` and `combine`
steps at `:95-111` become one nested reference. The `deep-dive`, `revise-questions`, the two artifact
writes and the sufficiency gate all stay with the activity, which is what
`re-derivation.md:52-56` says and what keeps the
`work-package::codebase-comprehension::comprehension-sufficient` key in
`ACCEPTED_HEADLESS_AUTO_ADVANCE` alive.

## CV14 — Two reconciliation loops nothing reaches

`work-package/activities/03-requirements-elicitation.yaml:184-196` and
`workflow-design/activities/03-requirements-refinement.yaml:148-160` are each a 13-line `while` loop
named `Assumption Reconciliation Loop`, with `continueWhile` on
`has_resolvable_assumptions == true`, no `maxIterations`, and a single-step body whose id is
`reconcile-iteration` at both. **Twelve of the thirteen lines are identical.** The one that differs
is the technique bound: `review-assumptions::reconcile` at the first,
`reconcile-design-assumptions` at the second.

Two things follow, and both are findings about the plan rather than about the corpus.

**No stage reaches them.** Stage 5 takes the four assumption hosts, stage 6 the seven convergence
sites, stage 7 the three prism per-unit passes, stage 8 the fan-out. Neither of these files is on any
list.

**The stage-1 guard as specified cannot see them.** Its criterion is "any run of two or more
consecutive steps that appears in two or more activity files… matching on step kind and binding"
(README:822-824). This run is one step, and its binding is the field that varies. The proposal's own
search confirms it: `repeated-runs.py` finds 26 windows and neither of these is among them.

**Verdict: KEEP.** The construct stands as it is. It is a stage-7-shaped site — a run identical but
for the operation it binds — at two activities in two workflows, and it is worth recording because it
is evidence that the technique-parameter family is wider than the three sites
[higher-order-routines.md](../../2026-09-03-routines/higher-order-routines.md) measures. Converting
it would need the `kind: technique` input and would trade 26 lines for a routine plus two references,
which is close to break-even.

## CV15 — The proposal's exemplar for a gate that cannot live in prose

`grep -rn "iteration_mode" workflows/ src/ scripts/` returns nothing. `grep -rn "run-loop"
workflows/` returns nothing. `workflows/work-package/techniques/analyse-challenge/` holds three files
— `TECHNIQUE.md`, `challenge.md`, `combine.md`.

`conversion-trial.md:274` names `iteration_mode` as a parameter that "exists because a gate cannot
live inside prose", and `investigation.md:305-321` builds the whole prose-encoded-runs argument on
`analyse-challenge::run-loop`. Neither exists.
[gap-review.md](../../2026-09-03-routines/gap-review.md) records the deletion as gap 3;
[../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md) draws the consequence.

I swept for a live successor and found none. Technique inputs whose id ends in `mode` number fifteen
across the corpus — `isolation_mode` (`meta/techniques/orchestration-patterns/TECHNIQUE.md:16`),
`headless_mode` at three sites, `is_review_mode` at five, `context_mode`
(`meta/techniques/workflow-engine/start-session.md:32`), and `pipeline_mode` at four prism
techniques. None of them switches a technique's own loop off. The closest live thing is
`current_unit.pipeline_mode`, which gates three prism steps in **YAML** (`02-adversarial-pass.yaml:38`,
`03-synthesis-pass.yaml:38`, `05-behavioral-synthesis-pass.yaml:38`) — a gate that already lives
where the schema puts gates.

**Verdict: STALE.** The construct is gone; two records still argue from it. Nothing in the corpus
today is a parameter that exists because a gate cannot live inside technique prose, so the
population the proposal calls its weakest has, at this specific claim, no members at all.

## CV16 — The prism per-unit passes, and the two the proposal does not name

`prism/activities/02-adversarial-pass.yaml` and `prism/activities/03-synthesis-pass.yaml` are 41-line
files that `diff` in **eight lines**: `id`, `name`, `description`, the loop's `id` and `name`, the
step `id`, and the technique reference (`full-prism::adversarial` against `full-prism::synthesis`).
`prism/activities/05-behavioral-synthesis-pass.yaml` is the same shape with a different collection
input and gate value. Those are the three the proposal takes at stage 7 (README:936, README:407-408).

There are two more, and no record names them. `prism/activities/07-dispute-pass.yaml` and
`prism/activities/10-reflect-pass.yaml` are **27-line** files that `diff` in **five lines**: `id`,
`name`, `description`, the step `id`, and the technique reference (`dispute-analysis` against
`reflect-analysis`). Everything else — the reads list, the `all_artifact_paths` write declaration,
the closing `action: set` and its description — is byte-identical.

Neither pair is visible to the proposal's search, for the same reason as CV14: the search signs a
technique step as its operation reference plus its input bindings, and the operation reference is
what varies. `repeated-runs.py` reports no window at any prism activity.

**Verdict: NARROWS at stage 7.** The stage's constituency is five activity files, not three, and two
of the five are a second, simpler shape — a bare two-step run rather than a `forEach` body. Whether
one routine serves both shapes or two are needed is a decision no record has taken.

## CV17 — One accumulating action, written eleven times

`grep -rn "target: all_artifact_paths" --include=*.yaml workflows/` returns **eleven** sites: ten
prism activities (`01-structural-pass.yaml:74`, `02-adversarial-pass.yaml:36`,
`03-synthesis-pass.yaml:36`, `05-behavioral-synthesis-pass.yaml:36`, `07-dispute-pass.yaml:23`,
`08-subsystem-pass.yaml:47`, `09-verified-pass.yaml:41`, `10-reflect-pass.yaml:23`,
`11-smart-pass.yaml:53`, `12-adaptive-pass.yaml:40`) and
`prism-evaluate/activities/02-execute-analysis.yaml:77`. Ten of the eleven carry one of two
byte-identical descriptions: `Accumulated artifact paths across the run.` at six sites and
`Accumulated artifact paths across units.` at four.

The paired declaration is copied further. The `all_artifact_paths` write declaration — name, type
`array`, and the description `Accumulated list of all artifact paths across all units` — is
**byte-identical at ten prism activity files** (`01:11`, `02:10`, `03:10`, `05:10`, `07:9`, `08:9`,
`09:9`, `10:9`, `11:10`, `12:12`). That is the single most-copied declaration body in the corpus.
`current_unit` is byte-identical at four (`01:17`, `02:13`, `03:13`, `05:13`).

**Verdict: NARROWS at stage 7.** Stage 7's criterion says "the accumulating `set` action stays inside
the routine" (README:926-927), which removes it from the three sites the stage takes and leaves it at
eight. The `all_artifact_paths` declaration is a workflow-spanning accumulator rather than a run's
output — `prism-evaluate` writes it too — so it survives the routine as a bound output name at every
site. The measurement worth carrying is the ratio: converting three of eleven sites leaves the
convention hand-maintained at the other eight.

## CV18 — Fourteen dispatches, every one preceded by a compose

`orchestration-patterns::dispatch-workers` is bound at **fourteen** step sites across **seven
activity files in four workflows**, and at every one of the fourteen the immediately preceding step
is a compose operation:

| File | Occurrences | Compose operation |
|---|---|---|
| `cicd-pipeline-security-audit/activities/03-primary-scan.yaml` | 3 | `dispatch-scanners::compose-verification-brief`, `::compose-gap-briefs`, `::compose-merge-brief` |
| `meta/activities/patterns/01-orchestrator-workers.yaml` | 1 | `orchestration-patterns::compose-worker-briefs` |
| `meta/activities/patterns/02-supervisor.yaml` | 1 | same |
| `meta/activities/patterns/04-isolated-fan-out.yaml` | 1 | same |
| `meta/activities/patterns/05-lead-researcher.yaml` | 2 — one top level, one in the `gap-followup` loop | same |
| `substrate-node-security-audit/activities/02-reconnaissance.yaml` | 2 | `dispatch-sub-agents::compose-roster-briefs` ×2 |
| `substrate-node-security-audit/activities/03-primary-audit.yaml` | 4 | `dispatch-sub-agents::compose-roster-briefs` ×4 |

**Seven of the fourteen are intra-file repetitions**, and no window search sees any of them: the
census's method keeps a window appearing in two or more activity *files*
(`drift-census.md:28-30`). The census names one such case — the second occurrence inside
`05-lead-researcher` — and treats it as the method's known exception
(`drift-census.md:59-67`). It is not an exception. It is 2 more at `cicd/03-primary-scan`, 1 at
`substrate/02-reconnaissance`, 3 at `substrate/03-primary-audit`, and 1 at `lead-researcher`: seven
repetitions the method is blind to, in four files.

Stage 8 names four reference sites — `01-orchestrator-workers`, `04-isolated-fan-out`,
`05-lead-researcher` and its follow-up loop (README:936-938). It omits `02-supervisor`, which the
proposal's own search finds carrying the three-step head at three activities, and it omits both
`substrate` files and `cicd/03-primary-scan`, which bind the same `dispatch-workers` operation
after a workflow-local compose.

**Verdict: NARROWS at stage 8.** The run's constituency is fourteen occurrences in seven files, not
four in three. Stage 8's claim that the routine needs no parameter of any kind (README:797-799) holds
only for the five `meta` occurrences: the other nine bind a compose operation from
`dispatch-sub-agents` or `dispatch-scanners`, which is the varying field again and therefore the
`kind: technique` input stage 7 introduces. Stage 8's acceptance criterion that the drift baseline
"falls by the fan-out windows and by nothing else" (README:941-942) cannot be checked against the
nine occurrences the baseline never contained.

## CV19 — Five fan-out declarations at six files

`work_units`, `worker_briefs`, `dispatched_results`, `gathered_results` and `combined_synthesis` are
declared byte-identically — name, type and description — at the four `meta` pattern activities:

| Name | Files | Lines |
|---|---|---|
| `dispatched_results` | 4 | `01:21`, `02:26`, `04:22`, `05:21` |
| `gathered_results` | 4 | `01:24`, `02:29`, `04:25`, `05:24` |
| `combined_synthesis` | 4 | `01:27`, `02:32`, `04:28`, `05:27` |
| `worker_briefs` | 3 | `01:18`, `04:19`, `05:18` |
| `work_units` | 2 | `01:15`, `04:16` |

`02-supervisor.yaml:20` and `05-lead-researcher.yaml:15` also declare `work_units`, and
`02-supervisor.yaml:23` declares `worker_briefs`, but with domain-specific descriptions rather than
the shared one, so they fall outside the byte-identical count.
`substrate-node-security-audit` carries two of the five again under a second byte-identical body:
`dispatched_results` at `02-reconnaissance.yaml:14` and `03-primary-audit.yaml:17`, `worker_briefs`
at `02-reconnaissance.yaml:20` and `03-primary-audit.yaml:31`.

**Verdict: REMOVE at stage 8.** Seventeen declarations across the four `meta` files, plus four more
across the two `substrate` files under a second body — **twenty-one in all at six files** — become
five `outputs` entries on one routine. Note the hazard: none of the four `meta` files is in any
workflow's graph.
`meta/activities/patterns/` is a subdirectory the loader never walks
(`src/loaders/workflow-loader.ts:72-107` is non-recursive), so `npm run check:activities` prints
"Total: 117 passed" against 122 files on disk and the five pattern activities validate against
nothing. Three of stage 8's four reference sites are among those five, and all three declare **zero**
exits.

## CV20 — Two activities that are one activity with a domain rename

`prism-audit/activities/02-execute-analysis.yaml` (91 lines) and
`prism-evaluate/activities/02-execute-analysis.yaml` (106 lines) are the same activity with every
name substituted: `audit_scopes` against `execution_groups`, `current_scope` against `current_group`,
`all_analysis_artifact_paths` against `all_artifact_paths`, `audit_description` against
`evaluation_description`.

The loop blocks are `prism-audit:64-85` and `prism-evaluate:79-100`, **22 lines each, seventeen of
them identical.** The five that differ are the loop id, the loop name, the item variable, the
collection, and the compose reference — `execute-analysis::compose-trigger-context` against
`compose-trigger-context`, which resolve to two separate files whose own `diff` is 64 lines. The four
body steps are the same four operations in the same order, with `workflow-engine::handle-sub-workflow`
carrying the same `workflow_id: prism` input at both.

The proposal's search finds only the three-step tail of this — `handle-sub-workflow` →
`prism/read-run-manifest` → `accumulate-analysis-run` at two activities — because it signs a loop by
its collection expression and the collections are named differently.

**Verdict: KEEP.** No stage reaches it. It is the clearest case in the corpus of the thing README:300-303
says the reference-site `outputs` remap exists for — one run, two domains naming the same fact
differently — and it sits outside every stage of the plan. Recording it as a candidate rather than
converting it: the shared body would need the compose operation as a `kind: technique` parameter,
which puts it behind stage 7, and the two `compose-trigger-context` files differ enough that
converging them is a separate question from naming the run.

## CV21 — The construct-choice table's row for a construct that stops existing

`workflows/workflow-design/resources/schema-construct-inventory.md:68` is the corpus canon row an
author reads to choose the shared-gate construct. It reads, in full: *"Several activities ask the user
the same question" → **Checkpoint fragment** → `fragments.checkpoints.<name>` holds the gate body —
`condition`, `message`, `options[]` with their effects — and a `kind: checkpoint` step reaches it by
`ref: [workflow::]name` (bare name resolves against the declaring workflow, then meta). `ref` is
mutually exclusive with the body fields: a ref step carries its `id`, and a `condition` only where
the fragment declares none.*

It is accurate today, in every clause, against `src/schema/activity.schema.ts:117-142` and
`src/loaders/fragment-resolver.ts:96-130`.

**Verdict: DEPRECATE at stage 5.** The row cannot come out before the mechanism does — removing it
first leaves the corpus's only construct-choice answer for a shared gate undocumented while eight
reference steps still use it, and `check-resource-anchors` would not notice, because it checks link
targets rather than claims. It cannot stay after either: a canon row naming
`fragments.checkpoints.<name>` when no such key is admitted reads as current fact, which is the defect
`AP-129 stale-restatement-after-change` names (`anti-patterns.md:1703-1713`). The replacement row is
owed by stage 3, not stage 5 — the routine exists two stages before the fragment goes — so the table
carries both for the interval, and the disposition record should say which row an author is meant to
follow in that window.

## CV22 — The canon's enumeration of composition layers

Two adjacent rows of the same table state where a run of steps may live.

`schema-construct-inventory.md:36` answers *"Compose / chain techniques for work" / "Apply technique B
from inside technique A"* with **Activity technique steps (not Protocol Apply)** — "activities (and
checkpoints/loops) are the composition layer."

`schema-construct-inventory.md:37` answers *"Compose / reuse activities" / "borrow an activity for a
shared orchestration pattern"* with **Activity→activity composition** — "Borrow, bind, or include a
standalone activity (or activity pattern) for reusable orchestration."

Design principle 26, at `workflows/workflow-design/resources/design-principles.md:117-119`, states
the closure: "Activities are the composition layer — they bind techniques (and checkpoints/loops)
into useful work. Activity→activity composition is allowed… **Reuse a shared capability by binding it
from an activity (or borrowing that activity)**, not by `Apply [other-technique]` inside a Protocol."

That parenthetical is an exhaustive list of two, and a routine is a third member of it. It is also the
route the canon currently prescribes for exactly the cases stages 5 through 8 convert: the borrowable
pattern library principle 26 names by path is `meta/activities/patterns/`, which holds three of stage
8's four sites.

**Verdict: NARROWS at stage 3.** Three prose sites — one canon row, one canon row's neighbour, one
design principle — enumerate the reuse routes and become incomplete the day a `kind: routine` step
loads. Nothing mechanical checks them, so nothing reddens; the cost of leaving them is that an author
consulting the table for "reuse a shared run" is routed to borrow an activity, which the proposal's
own dispatch-cost argument (README:649-656) says is the expensive answer.

## CV23 — Four canon rows that write the run out in prose

Rows 38 through 42 of `schema-construct-inventory.md` prescribe the orchestration patterns, and four
of them spell out an ordered step sequence as the alternative to borrowing the activity:

- `:38` — "Bind `orchestration-patterns::decompose-work-units` at the source… and `gather-results` at
  the meeting point, with the fan's own collection as `expected_ids`."
- `:39` — "Borrow `meta/patterns/02-supervisor.yaml` **or bind** `orchestration-patterns::classify-request`
  → compose → dispatch → gather → synthesise; seed `{lane_roster}`."
- `:41` — "Borrow `meta/patterns/04-isolated-fan-out.yaml`; seed `{isolation_mode}`… Completeness gate
  before synthesise."
- `:42` — "Borrow `meta/patterns/05-lead-researcher.yaml` **or bind** `plan-research-questions` →
  fan-out → synthesise → `assess-research-gaps` while loop."

Each is a run of steps written as a sentence, in the canon, because the canon has no name to point
at. Two of them are the literal step sequences of `02-supervisor.yaml:37-56` and
`05-lead-researcher.yaml:37-87`.

This sits awkwardly against `AP-107 bind-site-is-orchestration-truth`
(`anti-patterns.md:1393-1401`), which flags "prose outside activity YAML" that "enumerates an ordered
or complete list of activities, steps, or technique passes" not generated from the bind sites, with
the test "the prose must change when a bind changes, but the YAML was not the source of the list."
These four rows meet the detect and are saved only by the "pointers to the YAML" exemption, which
each satisfies with a link alongside the enumeration.

**Verdict: NARROWS at stage 8.** Four canon rows whose "or bind A → B → C → D" clause becomes "or
reference the fan-out routine". The measurement worth carrying is that the corpus's own anti-pattern
catalogue already treats a prose step sequence as a defect and cannot object here, because the
alternative it would demand — a name for the run — does not exist.

## CV24 — Corpus prose stating what the fragment guard checks

`workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:29` reads:
"`check-fragments.ts` — every fragment reference resolves, every fragment is used, and no inline body
duplicates a fragment or another site." It is one bullet in a technique bound at **one** step site —
`workflow-authoring/activities/08-quality-review.yaml`, inside its `target-sweep-loop` body — and it
names three of the guard's nine rules. The same-named file in the other design workflow,
`workflow-design/techniques/audit-schema-validation.md`, is bound at six sites and mentions no guard
script: `grep -rn "check-fragments" workflows/workflow-design/` returns nothing.

Two of the three die at stage 5. `unresolved-ref` and `unused-fragment` are both on
`decisions.md:447-449`'s list of seven; "no inline body duplicates a fragment" is
`inline-duplicate-of-fragment`, also on it. "or another site" is `duplicate-checkpoint`, which
survives with its remedy changed. So of the four clauses in one sentence, three go and one changes
meaning.

**Verdict: STALE at stage 5.** One line, in a technique bound at one site, in a workflow that audits
other workflows' schema conformance. It is the second corpus definition file that documents the
fragment mechanism, after CV21, and neither
[../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md) nor the proposal
counts it — the ground truth's `ref:` partition finds `schema-construct-inventory.md:68` and stops
there, because this sentence contains no `ref:` token.

## CV25 — The anti-pattern that forbids a run in technique prose

`AP-114 pass-orchestration-in-technique` (`anti-patterns.md:1481-1491`) is the rule governing the
whole prose-encoded-runs population. Its Detect fires when a "Technique Capability or Protocol
applies, invokes, or runs another technique/operation for work". Its **Fix** at `:1491` names one
destination: "bind each sibling or shared operation as its own activity step in the order required".
Its Do-not-flag at `:1489` exempts "activity borrow/bind/include of reusable orchestration patterns"
— which is CV22's second route again.

I re-took the mechanical measurement of the population this rule governs. Over the **586** technique
markdown files under `workflows/*/techniques/`, taking each `## Protocol` section and counting
markdown links resolving to an existing `.md` file inside a `techniques/` tree other than the file
itself: **444 links across 145 files**, of which **85 name two or more distinct other techniques**.
That reproduces
[../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md) exactly, and it
differs from `investigation.md:330`'s 235 across 66 of 582 by counting rule and corpus size, as the
proposal itself says it would. Requiring the Protocol line to carry an imperative governing the link
gives **333 links across 116 files** — my rule counts links, the ground truth's counts bind sites of
the containing technique and reaches 108 files and 121 bind sites.

Two files in that population genuinely hold a run of steps rather than a tool citation, and both are
load-bearing for the migrations. `meta/techniques/orchestration-patterns/dispatch-workers.md:25` is a
`forEach` over `{worker_briefs}` written as a sentence — "For each brief in order, apply
harness-compat::spawn-agent with that brief's prompt; append each `{ id, result }` to
`{dispatched_results}`" — in a technique bound at fourteen step sites (CV18).
`work-package/techniques/analyse-challenge/challenge.md:24-38` is three phases, Scatter,
Per-Perspective Challenge, Gather, in a technique bound at seven step sites (CV9, CV13).

**Verdict: NARROWS at stage 3.** AP-114's Fix gains a second destination the moment a routine can
hold a run, and its Do-not-flag gains a fourth exempt shape — a routine reference — alongside the
loader wrap, the activity step bind and the activity borrow. Nothing mechanical is affected:
`check-branch-as-step` audits dash sub-bullets for conditionals and no guard reads AP-114's Fix. The
population it governs is not what a routine converts, and the honest figure is small: of 145 files
naming another technique in their Protocol, two carry a run whose conversion has a reference-site
count already measured elsewhere in this sweep.

## CV26 — The rule that comes closest to seeing a repeated run, and cannot

`AP-38 no-duplicate-technique-steps` (`anti-patterns.md:542-552`) is the corpus's nearest thing to a
duplication detect over steps. Its Detect is "**Two or more step definitions in one activity** bind
the same technique reference", and its Do-not-flag exempts "distinct-purpose invocations at different
pipeline points" and "same op as distinct phases inside one loop iteration".

Two properties make it blind to everything in this sweep. It is scoped to **one activity**, so it
cannot compare across files. And it matches a **single technique reference**, so it cannot see a
sequence. `review-assumptions::record` is bound at fifteen step sites, three of them inside
`04-research.yaml` alone (`:136`, `:227`, `:246`), and both exemptions apply, so the guard is silent
where it does look.

**Verdict: KEEP.** It stays exactly as it is, and it is the measured corroboration of the proposal's
central claim at README:33-34 — that "nothing anywhere compares a *sequence* of steps against
another sequence". The claim reproduces: `ls scripts/ | grep -i "repeat\|routine"` returns nothing,
and the closest catalogue rule is per-activity and per-single-step by construction.

## CV27 — Two guard rules with no population to police

`scripts/check-fragments.ts` survives stage 5 with two of its nine rules. `duplicate-rule`
(`:257-263`) reports identical normalised rule text authored inline in two or more workflows.
`duplicate-checkpoint` (`:269`) reports identical normalised inline checkpoint bodies at two or more
sites.

Both are at zero today. `npx tsx scripts/check-fragments.ts` prints "fragments: OK — every ref
resolves, every fragment is used, no inline duplicates", and the guard is hard zero with no ledger
(`scripts/check-fragments.ts:30`). So the corpus carries no duplicated rule text and no duplicated
inline gate body. Rules are not shared through fragments at all — `WorkflowFragmentsSchema` has one
key, `checkpoints` (`src/schema/workflow.schema.ts:40-42`) — and `check-fragments.ts:8-10` records
that a duplicated rule's remedy is the conduct technique rather than a shared home.

**Verdict: KEEP at stage 5.** `duplicate-rule` keeps its rule and its remedy; `duplicate-checkpoint`
keeps its rule with its remedy naming a routine, which is `decisions.md:449-450` and stage 5's
criterion at README:883-884. What the sweep adds is that both rules currently police an empty
population, so a routines migration cannot be graded by either: neither will change colour.

## CV28 — The pairing the proposal names as a future feature

`write-artifact` is the most-bound technique in the corpus. Counting every spelling —
`work-package::manage-artifacts::write-artifact` at 42 sites and `manage-artifacts::write-artifact`
at 4 — gives **46 bind sites**, at every loop depth. README:983 states 42, which is exact for the
qualified spelling alone; [../ground-truth/fragment-mechanism.md](../ground-truth/fragment-mechanism.md)
states 46, which is exact for both. The next-most-bound technique is `verify-artifact-conforms` at 15
and `review-assumptions::record` at 15, so the factor of nearly three reproduces.

Of the 46, **39 are immediately preceded by another technique step** — the produce-then-persist
pairing README:980-988 names. But those 39 have **36 distinct predecessors**, and only five appear
more than once, each exactly twice: `audit-expressiveness`, `audit-conformance`,
`verify-high-findings`, `audit-principles` and `audit-anti-patterns`. Two of the 46 follow another
`write-artifact`, four follow a checkpoint, two follow a loop, and one is the first step in its
sequence.

**Verdict: KEEP.** This is not a shared run and a routine cannot hold it. One routine over the
pairing needs the operation as a `kind: technique` parameter — stage 7's feature — and 39 reference
sites, each supplying a different producer whose output ids differ, which forfeits the three
guarantees README:410-414 says are unconditional while no routine binds a technique by parameter.
README:990-996 already says the 42 needs re-counting before it is read as a constituency, and finding
B6 is the reason. The re-count is 46 bind sites, 39 adjacencies, 36 distinct producers, and the
constituency does not survive it.

## CV29 — The claim that no reference site could receive an outcome

`decisions.md:432-433` reads: "**A routine declares no outcome and returns none.** Every activity
that would refer to one declares a single `done` exit, so nothing in the corpus can receive an
outcome today." README:746-748 restates it.

Measured over every reference site the plan names:

| Site | Exits | Ids |
|---|---|---|
| `02-design-philosophy.yaml` | 2 | `revise-classification`, `done` |
| `04-research.yaml` | 1 | `done` |
| `05-implementation-analysis.yaml` | 1 | `done` |
| `06-plan-prepare.yaml` | 2 | `done`, `revise` |
| `07-assumptions-review.yaml` | **5** | `needs-comprehension`, `needs-plan-revision`, `needs-further-discussion`, `review-mode`, `assumptions-approved` |
| `08-implement.yaml` | 1 | `done` |
| `15-codebase-comprehension.yaml` | **4** | `needs-elicitation`, `research-needed`, `skip-optional-activities`, `comprehension-complete` |
| `01-orchestrator-workers.yaml` | **0** | — |
| `04-isolated-fan-out.yaml` | **0** | — |
| `05-lead-researcher.yaml` | **0** | — |
| `02-adversarial-pass.yaml`, `03-synthesis-pass.yaml`, `05-behavioral-synthesis-pass.yaml` | 1 each | `done` |

**Three of the seven stage-5 and stage-6 sites declare a single `done` exit. Four declare two to
five. Three of stage 8's four sites declare none at all.**

The conclusion survives; the reason does not. None of the fourteen declared exit predicates at those
sites reads a name a routine would write: `02` and `06` select their second exit by a checkpoint
option (`immediate: true` at `02-design-philosophy.yaml:259`), `07`'s five read
`needs_comprehension`, `needs_plan_revision`, `needs_further_discussion` and `is_review_mode`
(`:191-200`), and `15`'s four read `needs_elicitation`, `needs_research` and
`skip_optional_activities` (`:158-166`). So no exit is selected by a routine output at the same
activity.

One near miss is worth recording. `needs_comprehension` **is** a routine output at the comprehension
site — `15-codebase-comprehension.yaml:110` binds `concerns_agent_resolvable: needs_comprehension` —
and `07-assumptions-review.yaml:192` routes on `needs_comprehension == true`. A routine output
therefore reaches a routing decision, one activity later, through the ordinary variable bag. That is
allowed and it is not an outcome; it is worth stating because "nothing in the corpus can receive an
outcome" invites the reading that a routine's writes never reach the graph, and they do.

**Verdict: STALE.** The construct rule is right and the sentence supporting it is false against the
corpus. The correct statement is that no reference site's exit predicate reads a name a routine
writes, which is a claim about fourteen predicates rather than about exit counts, and which holds.

---

## What I looked for and did not find

An empty result on a surface is evidence, so these are recorded with the command that produced them.

**No routine-shaped construct anywhere in the corpus, in code or in prose.**
`grep -rn "kind: routine\|routines/" workflows/ src/ scripts/ schemas/` returns nothing. No corpus
resource, README or technique anticipates the construct or reserves a name for it. The
construct-choice table's answers for a shared run are borrow-an-activity (`:37`) and
bind-consecutive-steps (`:36`), and nothing else.

**No second `fragments` declaration, and no rule fragment.** One workflow of seventeen declares
`fragments`, and `WorkflowFragmentsSchema` admits one key
(`src/schema/workflow.schema.ts:40-42`). So the mechanism's rule half is not merely retired in
practice — the schema cannot express it.

**No fragment referenced twice by one activity, and no soft shared gate.** Four reference sites each,
one per activity per fragment. Neither body declares `defaultOption` or `autoAdvanceMs`, so the
softness-pairing invariant the loader enforces at `src/loaders/fragment-resolver.ts:78-88` has no
fragment-side instance to prove itself against. That invariant, and the body-completeness check at
`:102-107`, are checkpoint rules that happen to live in the fragment resolver; retiring the mechanism
must keep both, and no record in the routines folder says so.

**No duplicated rule text and no duplicated inline gate body.** `check-fragments` is clean, so the
two rules that survive stage 5 police nothing today (CV27).

**No mode parameter that exists because a gate cannot live in technique prose.** Fifteen
`*_mode` technique inputs, none of them switching a technique's own iteration off (CV15). The one
construct that came closest, `analyse-challenge::run-loop` with its `iteration_mode`, was deleted on
2026-09-06.

**No shared step window between `workflow-design` and `workflow-authoring`.** The two workflows carry
four same-named activity files — `01-intake-and-context`, `06-scope-and-draft`, `08-quality-review`,
`09-validate-and-commit` — whose pairwise `diff`s run 316, 532, 467 and 427 lines, and
`repeated-runs.py` finds no window between them. Their steps bind different technique groups
(`workflow-definition::audit-canon` against `audit-anti-patterns`), so the duplication that does
exist is fourteen same-named **technique markdown files** across the two groups. A routine cannot help
with duplicated technique prose, and this is out of the construct's reach.

**No `breakCondition` at any corpus site.** Zero of 54 loop steps carry it;
`grep -rn breakCondition --include=*.yaml workflows/` returns nothing. Recorded because README:790-793
makes it "one more field materialisation substitutes over", and the field it substitutes over has no
subject. The stage-0 sweep owns this surface;
[../ground-truth/stage-0-state.md](../ground-truth/stage-0-state.md) carries it in full.

**No corpus activity whose exits could receive a routine's outcome.** Fourteen exit predicates across
the seven stage-5 and stage-6 sites, none reading a routine output (CV29). The construct's
prohibition is safe; the sentence stating why is not.

**No shared window the proposal's search reports that this sweep could not locate.** All 26 windows
reproduce, 21 top level and 5 nested, over 122 activity files parsed. What the sweep adds is four
families the search structurally cannot see: a one-step loop (CV14), a run whose only variation is
the operation bound (CV14, CV16, CV20), an intra-file repetition (CV18, seven instances in four
files), and a loop whose collection is renamed between two workflows (CV20).

## Re-taking every figure

```
# nothing is built
grep -rn "kind: routine\|routines/" workflows/ src/ scripts/ schemas/
npx tsx scripts/check-all.ts

# the fragment mechanism (CV1, CV2, CV27)
grep -rn "fragments" --include=*.yaml workflows/
grep -rn "ref:" --include=*.yaml workflows/
npx tsx scripts/check-fragments.ts
grep -n "condition_not_met" src/tools/workflow-tools.ts

# the convergence blocks and the window search (CV9, CV13)
python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py
grep -rn "id: assumption-convergence" --include=*.yaml workflows/
grep -rn "id: assumption-reconciliation" --include=*.yaml workflows/

# duplicated declarations (CV5, CV6, CV10, CV11, CV17, CV19)
grep -rn "name: challenge_findings" workflows/*/activities/*.yaml
grep -rn "    - name: all_artifact_paths" workflows/prism/activities/*.yaml
grep -rn "target: all_artifact_paths" --include=*.yaml workflows/

# the fan-out and the per-unit passes (CV16, CV18, CV20)
grep -rn "orchestration-patterns::dispatch-workers" --include=*.yaml workflows/
diff workflows/prism/activities/07-dispute-pass.yaml workflows/prism/activities/10-reflect-pass.yaml
diff workflows/prism-audit/activities/02-execute-analysis.yaml workflows/prism-evaluate/activities/02-execute-analysis.yaml

# identifiers (CV7, CV8)
grep -rn 'id: .*#{' --include=*.yaml workflows/

# corpus canon (CV21, CV22, CV23, CV24, CV25, CV26)
sed -n '36,42p;47p;68p' workflows/workflow-design/resources/schema-construct-inventory.md
sed -n '113,120p' workflows/workflow-design/resources/design-principles.md
sed -n '542,552p;1393,1401p;1481,1491p' workflows/workflow-design/resources/anti-patterns.md
sed -n '29p' workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md

# write-artifact (CV28)
grep -rn "write-artifact" --include=*.yaml workflows/ | wc -l
```

Six measurements were taken with throwaway scripts, and each rule is stated in full above so the
figure is re-derivable without them. The convergence blocks are located by their `id:` line, closed
at the first line indented no deeper than the `- ` opener, dedented and hashed. Declarations are read
from each activity's `variables.writes[].name` and `variables.reads[]` over all 122 files matching
`workflows/*/activities/**/*.yaml`. The duplicated-declaration census keys each write declaration on
its whole JSON body with sorted keys and keeps every body appearing at two or more distinct files.
Technique step bindings are counted by walking every node with a `technique` field at any loop depth,
taking the bare string or the binding's `name`. The checkpoint gate census counts `condition` and
`when` presence on every `kind: checkpoint` node at any depth, reading the file as written. The prose
count takes each file's `## Protocol` section, resolves every markdown link against the file's own
directory, and keeps those resolving to an existing `.md` inside a `techniques/` tree other than
itself.
