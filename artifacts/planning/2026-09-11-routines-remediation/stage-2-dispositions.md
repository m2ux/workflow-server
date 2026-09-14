# What the shared assumption run converges on

Stage 2 of the [routines plan](../2026-09-03-routines/README.md), for
[#531 W3](https://github.com/m2ux/workflow-server/issues/531). Companion to the
[verified sweep outcome](../2026-09-10-routines-sweeps/README.md), whose ninth plan defect is that
this record does not exist.

Four activities in the `work-package` workflow all do the same thing about assumptions that are
still open. Each announces what is left, puts one question to the user about the whole set, records
the answer, and then walks the residual items one at a time when the user asks for that. The four
copies are not identical. Before one shared definition replaces them, somebody has to say — per
difference, in writing — what the surviving version does and which site therefore changes. That
written answer is the entire deliverable of the plan's second stage, and it changes no definition
file.

Nothing had produced it. Six supersession sweeps generated 111 candidates and assigned **none** of
them here. Excluding the two documents that exist to record the absence — the sweep folder's README
and its completeness pass — the phrase "stage 2" appears in exactly one of the folder's other
sixteen documents, twice, in a single paragraph
([sweeps/design-itself.md:997-998](../2026-09-10-routines-sweeps/sweeps/design-itself.md)). The
stage's own acceptance criterion pins the population at **ten** rows
([README:836-838](../2026-09-03-routines/README.md)). The folder's measurements support **twelve**.
This is the twelve, each reproduced against the activity files rather than carried from a document —
necessary, because two documents in the routines folder disagree about which rows are already
settled.

The absence is not only a missing document. Stage 5, the stage that edits the four hosts, grades
itself against this record: its second criterion is that "each of stage 2's dispositions is
observable in the result" ([README:885](../2026-09-03-routines/README.md)). With no dispositions
there is nothing for that criterion to be observable against, so the stage that changes live
behaviour cannot be graded at all.

## Where this was measured

Server tooling at `ee95e4cd`, the revision the sweep folder is pinned to, read in the linked
worktree `.worktrees/2026-09-11-register-findings` whose HEAD is exactly that commit. Corpus at
`a4a5d88b`, the revision the completeness pass measured.

**The run's five files are byte-identical across three corpus revisions**, which is what makes every
line number below stable. `git diff` over `04-research.yaml`, `05-implementation-analysis.yaml`,
`07-assumptions-review.yaml`, `08-implement.yaml` and `work-package/workflow.yaml` reports no output
between `a4a5d88b`, `2a9d07ee` (the submodule pointer `ee95e4cd` carries) and `e9d26007` (the
`workflows` branch head today). The corpus figures below were taken on the clean `e9d26007` tree,
because the `a4a5d88b` worktree carries the in-flight gate fix described under row 5.

**Two things have moved on `main` since `ee95e4cd`, and a reader today needs both spellings.** The
guard scripts live under `guards/` rather than `scripts/`, so a citation of
`scripts/check-activity-variables.ts` reads `guards/check-activity-variables.ts` at `main`'s
`fe5f5f78`. And `main` no longer carries the `workflows` submodule: product definitions sit under
`corpus/` on the `workflows` branch, which the guards reach through
`.worktrees/workflows` (`guards/workflows-root.ts:1-14`). One server line number moved with ordinary
work: the dismissal check is `src/tools/workflow-tools.ts:2399-2405` at `ee95e4cd` and `:2433-2439`
at `fe5f5f78`.

**The suite figure this record can stand behind is not the sweep folder's.** At `main`'s `fe5f5f78`
against corpus `e9d26007`, `npx tsx guards/check-all.ts` reports **41 guards in 4.1 seconds — 38
pass, 1 fail, 2 unmeasured**. The failure is one stale triage entry in `binding-fidelity` naming
`meta/techniques/version-control/merge-branches.md`, and the two unmeasured guards look for a
`workflows/` directory the primary checkout no longer has. None of the three touches the assumption
run. The sweeps' "40 guards, 40 pass, 0 fail" does not reproduce at this tree and this record does
not carry it.

Each row below was re-derived by parsing the four host activity files with a YAML parser and
comparing the step objects field by field, rather than by reading the census. Where a figure in the
routines folder or the sweep folder does not reproduce, this record gives its own and says so.

The four hosts, and the one routing file holding the two shared gate bodies:

| File | Lines | Where the run sits |
|---|---|---|
| `work-package/activities/04-research.yaml` | 253 | 134-136, then 169-246 |
| `work-package/activities/05-implementation-analysis.yaml` | 155 | 80-82, then 115-148 |
| `work-package/activities/07-assumptions-review.yaml` | 205 | 106-141 |
| `work-package/activities/08-implement.yaml` | 234 | 191-227 |
| `work-package/workflow.yaml` | 223 | `fragments:` at 15-71 |

## The run as it stands: eight positions, and two of them identical

Reading the four files as step objects and matching positions by their place in the sequence rather
than by their names, the run occupies eight positions. For each: how many distinct identifiers the
four hosts spell it with, whether the parsed step is identical in every field at all four, and which
fields differ when it is not.

| Position | Step at `08-implement` | Spellings | Instances | Identical in every field? | Fields that vary |
|---|---|---|---|---|---|
| A — the record pass | `update-assumptions-log` | 1 | 4 | **Yes** | — |
| B — the announcement | `present-resolved-assumptions` | 2 | 4 | No | `actions`, `id`, `when` |
| C — the batch gate | `implementation-assumption-interview` | 4 | 4 | No | `id` |
| D — the batch record | `record-batch-response` | 2 | 4 | No | `id`, `when` |
| E — the interview loop | `assumption-interview` | 2 | 4 | No | `id`, `maxIterations`, `steps`, `when` |
| F — the per-item present | `present-assumption` | 1 | 4 | **Yes** | — |
| G — the per-item gate | `implementation-assumption-decision#{current_assumption.id}` | 4 | 4 | No | `condition`, `id` |
| H — the per-item record | `record-response` | 2 | 4 | No | `id` |

**Eighteen distinct identifiers for eight positions over 32 step instances.** Counting only
positions C through H, which is the inventory the sweep's corpus verification takes, that is 15
spellings over 24 instances — reproduced exactly. Counting the announcement as a seventh position
gives **17 spellings over 28 instances**;
[corpus-vocabulary.md](../2026-09-10-routines-sweeps/verification/corpus-vocabulary.md) CV7 states
sixteen, and I cannot reach that figure. The announcement carries two spellings —
`present-resolved-assumptions` at three hosts and `present-residual-assumptions` at
`07-assumptions-review.yaml:107` — and 15 + 2 is 17.

Two positions are identical in every field at all four hosts, and only one of them is identical in
placement too. The record pass is the same three lines everywhere — `update-assumptions-log` binding
`review-assumptions::record` with no gate — yet it sits **before** the shared convergence loop at
two hosts and **after** the interview loop at the other two, which is the first difference below. So
of the six positions inside the interview run proper, **exactly one — the per-item present — is the
same in every field at all four hosts.** The rest is four different runs wearing one shape.

The hosts' own step sequences place the run as follows: `04-research` has 15 top-level steps with
the run at 7 and 9 and 13-15; `05-implementation-analysis` has 10, at 5 and 7-10;
`07-assumptions-review` has 11, at 3-7; `08-implement` has 7, at 3-7.

## The twelve differences, and what each converges on

Rows 1 to 10 keep the numbering of [drift-census.md](../2026-09-03-routines/drift-census.md) so this
record can be read against it. Rows 11 and 12 are the two the census does not carry.

Three dispositions are possible, and every row gets exactly one. **Already converged in the corpus**
means no decision is owed because ordinary corpus work settled it. **Converges with no decision**
means one shared definition normalises it by construction and no live behaviour turns on the choice.
**Converges by a decision** names what the run now does and which site changes.

| # | What differs | At which sites | Disposition |
|---|---|---|---|
| 1 | The record pass sits before the shared convergence loop at two hosts and after the interview loop at two | before: `04-research.yaml:134-136` (step 7 of 15, the loop at step 8), `05-implementation-analysis.yaml:80-82` (step 5 of 10); after: `07-assumptions-review.yaml:139-141` (step 7 of 11), `08-implement.yaml:225-227` (step 7 of 7) | **By a decision, already taken.** The run's pass sits after the interview loop, that being the only position from which it can record what the interview just collected. The two hosts recording early keep that step where it is, outside the run, seeding rather than closing — and under the once-per-run decision they drop the run entirely, so no surviving site changes |
| 2 | The announcement's message text | present at `04-research.yaml:172-177`, `05-implementation-analysis.yaml:118-123`, `08-implement.yaml:194-199`; absent at `07-assumptions-review.yaml` | **Already converged.** The three nine-line spans are byte-identical: an `action: message` rendering `**Assumptions**` then `{assumption_review_presentation}`. `diff` over the three produces no output. The census's "text A at two sites, text B at one" no longer stands |
| 3 | The announcement is gated at one host and ungated at three | gated at `07-assumptions-review.yaml:109`; ungated at the other three | **By a decision, already taken** — the guard is review mode alone. This changes behaviour at both surviving sites; see [Two consequences of decisions already taken](#two-consequences-of-decisions-already-taken) |
| 4 | The announcement is separated from the batch gate by unrelated steps at one host | `04-research.yaml`, top-level steps 10-12: `close-research-phase` (178-183), `announce-derived-context-scope` (184-189), `context-scope-declaration` (190-221) | **With no decision.** The intervening steps are the host's own and stay outside any shared definition. **Three steps, not the census's four** — `derive-context-scope` stood in the file at census revision `131e2942` and is gone. And the host drops the run, so the contiguity question expires with it |
| 5 | The batch-record gate carries a review-mode clause at two hosts and omits it at two | carried: `05-implementation-analysis.yaml:130`, `07-assumptions-review.yaml:116`; omitted: `04-research.yaml:228`, `08-implement.yaml:206` | **By a decision — and a live behaviour change.** The clause is required; the two hosts omitting it gain it. A separate code track takes this decision independently of routines and its edit is written. See [row 5 in full](#row-5--one-step-records-an-answer-nobody-gave-at-two-of-the-four-hosts) |
| 6 | The interview loop's gate carries the same clause at the same two hosts | carried: `05-implementation-analysis.yaml:138`, `07-assumptions-review.yaml:123`; omitted: `04-research.yaml:236`, `08-implement.yaml:214` | **By a decision, no behaviour change.** The clause is redundant here and goes from the two hosts carrying it. The flag the loop tests has one writer in the whole workflow, that writer cannot fire in review mode, and all four hosts seed the flag false — so the loop is already skipped in review mode without the clause. Same code track, same commit |
| 7 | An iteration ceiling of 20 at three hosts, absent at one | `maxIterations: 20` at `04-research.yaml:235`, `05-implementation-analysis.yaml:137`, `08-implement.yaml:213`; absent at `07-assumptions-review.yaml:117-123` | **By a decision.** One bound of 20 in the shared body, which is the corpus's only written value for this loop and what the proposal's own worked body carries ([README:261](../2026-09-03-routines/README.md)). The site that changes is `07-assumptions-review`, whose walk over the residual set gains a declared ceiling it lacks. See [row 7 in full](#row-7--the-one-loop-with-no-ceiling) |
| 8 | The per-item gate is written inline at one host and by reference at three | — | **Already converged.** All four are `ref: assumption-decision`, at `04-research.yaml:243`, `05-implementation-analysis.yaml:145`, `07-assumptions-review.yaml:130` and `08-implement.yaml:221` |
| 9 | The per-item gate offers three answers at one host and two at three | — | **Already converged, and against this folder's own recommendation.** The shared body at `work-package/workflow.yaml:50-71` offers three: accept (`:53`), correct (`:59`), defer (`:65`). The census recommended two everywhere; the corpus took three, and `review-assumptions/record.md:20` documents the three-term outcome vocabulary |
| 10 | Step identifiers differ by hand-written prefix | all four hosts | **With no decision.** The reference site supplies the prefix. Measured above: 18 spellings, eight positions, 32 instances. The prefixes buy legibility rather than disambiguation — identifiers are scoped per activity, so four gates in four activities cannot collide |
| 11 | The per-item gate carries a site condition at one host | `07-assumptions-review.yaml:131-135`, the only site condition on any of the eight fragment reference steps | **By a decision, and a live behaviour change either way. This one needs the owner.** See [row 11 in full](#row-11--dismissibility-changes-whichever-way-it-is-settled) |
| 12 | The announcement varies three ways: its identifier, its gate, and whether it renders the presentation itself | `id`: `present-resolved-assumptions` ×3 against `present-residual-assumptions` at `07-assumptions-review.yaml:107`; `when` at `:109` only; `action: message` block at the other three only | **By a decision.** The announcement stays **outside** the shared body, so the variation stays host-authored and nothing normalises it. See [row 12 in full](#row-12--the-announcement-sits-outside-the-body-so-its-three-way-variation-stays-at-the-hosts) |

The twelve partition five ways:

- **Already converged in the corpus, owing only the line recording it** — rows 2, 8 and 9.
- **Converge by construction, with no decision and no behaviour change** — rows 4 and 10.
- **Carry a decision taken before this record** — rows 1 and 3, in
  [decisions.md](../2026-09-03-routines/decisions.md); rows 5 and 6, on the code track as
  [#638](https://github.com/m2ux/workflow-server/issues/638).
- **Decided here** — rows 7 and 12.
- **The owner's** — row 11.

**Five rows change what a real run does at a site that survives the migration**: rows 3, 5, 7, 11 and
12. A sixth change comes from a decision no row carries — the once-per-run decision removes the run
entirely from two of the four hosts. Every one of those six is named with its site below, which is
what the walk-before-merge requirement needs
([README:814-818](../2026-09-03-routines/README.md)).

**Two documents in the routines folder disagree about row 2, and the corpus supports converged.** The
census's re-check note says two rows converged, meaning 8 and 9;
[fragment-mechanism.md:231](../2026-09-10-routines-sweeps/ground-truth/fragment-mechanism.md) records
row 2 as a third, already converged at the revision the re-check ran against. Diffing the three
nine-line announcement spans at this tree produces no output. Row 2 is converged.

## Row 5 — one step records an answer nobody gave, at two of the four hosts

This is the row that makes the migration not behaviour-preserving, and it is a defect in the corpus
today rather than anything a routine introduces.

The batch gate is one shared body declared once, at `work-package/workflow.yaml:17-49`. Its own
condition is an `and` of two tests (`:18-28`): the run is not in review mode, and open assumptions
remain. So in review mode that gate is dismissed rather than answered, and none of its three options
is ever chosen.

One of those three options — *interview individually*, at `:44-49` — is the **only** writer anywhere
in the corpus of the flag saying individual interviews are wanted. A corpus-wide search for
`needs_individual_interview` returns thirteen lines: one `setVariable` at `workflow.yaml:49`, four
activity-level declarations, and eight gate expressions. All four hosts declare the flag with
`defaultValue: false` (`04-research.yaml:66`, `05-implementation-analysis.yaml:56`,
`07-assumptions-review.yaml:59`, `08-implement.yaml:71`), and `is_review_mode` carries
`defaultValue: false` at `workflow.yaml:78`.

The recording step's gate tests two things: open assumptions remain, and individual interviews are
*not* wanted. In review mode the second is reliably true, because its only writer cannot fire. And
the first can still become true, because the shared convergence loop that sets it is **ungated at all
four hosts** — the `assumption-convergence` `doWhile` carries `continueWhile`, `loopType`,
`maxIterations`, `name` and `steps` and no `when` (`04-research.yaml:137-146`,
`05-implementation-analysis.yaml:83-92`, `07-assumptions-review.yaml:74-83`,
`08-implement.yaml:159-168`), and its closing `analyse-challenge::combine` binds
`residual_opens_remain` to `has_open_assumptions` (`04-research.yaml:167`,
`05-implementation-analysis.yaml:113`, `07-assumptions-review.yaml:104`, `08-implement.yaml:189`).

So at the two hosts whose recording gate omits the review-mode clause, a review-mode run with open
assumptions reaches that step having asked nobody anything, and records a batch outcome. Those hosts
are `04-research.yaml:228` and `08-implement.yaml:206`, and **both are reachable with
`is_review_mode == true`**, by different routes:

- `research` sits on the ordinary path. No edge between `start-work-package` and `research` tests
  review mode: `codebase-comprehension`'s `research-needed` exit tests `needs_elicitation` and
  `needs_research` alone (`15-codebase-comprehension.yaml:161-162`), and the graph routes
  `research-needed` there (`workflow.yaml:184`).
- `implement` is reached in review mode only by re-entry. `assumptions-review` exits `review-mode` to
  `lean-coding-audit` (`workflow.yaml:195`), skipping `implement`; `post-impl-review`'s `has-blocker`
  exit (`10-post-impl-review.yaml:296-297`) routes back to `implement` (`workflow.yaml:203`). So the
  wrong record needs a blocker, which narrows the exposure without removing it.

**A corroborating detail the folder does not carry.** All four hosts declare a read of
`is_review_mode` — `04-research.yaml:11`, `05-implementation-analysis.yaml:13`,
`07-assumptions-review.yaml:10`, `08-implement.yaml:13` — but at `04-research` and `08-implement` no
gate the author wrote consults it. The declaration is satisfied only because the loader copies the
shared gate body's condition onto the reference step (`src/loaders/fragment-resolver.ts:127`) and the
contract derivation collects names out of a step's structured condition
(`src/utils/activity-variables.ts:499`), the guard reading loader output rather than file text
(`scripts/check-activity-variables.ts:34`). Both hosts' contracts therefore claim a review-mode
awareness their own gates do not implement.

**Recommendation, and it is the owner's call: the clause is required, and the two hosts that omit it
gain it.** It is the owner's because either answer changes what a live run records. Dropping the
clause from the two hosts that carry it makes all four record a batch outcome in review mode; adding
it to the two that omit it stops two hosts recording an outcome for a question nobody was asked. The
dataflow does not choose between those — it establishes that the clause is load-bearing here and
redundant on the loop gate, which is what makes rows 5 and 6 different. Which behaviour is wanted is
a judgement about what a review-mode pass is for, and the answer that a review-mode pass reads rather
than decides is the one this record recommends.

### What the code track takes, and what stage 2 owes after it lands

That call is being made on a separate track, as
[#638](https://github.com/m2ux/workflow-server/issues/638). **The edit is written.** The corpus
branch `workflow/review-mode-gate-findings`, checked out in
`.worktrees/2026-09-11-register-findings/workflows` at `a4a5d88b`, carries four uncommitted gate
edits and nothing else in these four files:

| Host | Gate | The edit |
|---|---|---|
| `04-research.yaml:228` | batch record | gains `is_review_mode != true` as the leading conjunct |
| `08-implement.yaml:206` | batch record | gains `is_review_mode != true` as the leading conjunct |
| `05-implementation-analysis.yaml:138` | interview loop | drops `is_review_mode != true` |
| `07-assumptions-review.yaml:123` | interview loop | drops `is_review_mode != true` |

That is exactly the disposition this record reaches by re-measurement, in both directions, taken for
the reason this record gives. The same working tree carries the B6 fix
([#637](https://github.com/m2ux/workflow-server/issues/637)) as deletions of 27 lines from
`workflow-design/activities/08-quality-review.yaml` and 34 from `10-post-update-review.yaml`. None of
it has landed: at the `workflows` branch head `e9d26007` all four gates still read as tabled above.

**After that edit lands, stage 2 owes the record and nothing else on rows 5 and 6.** Both rows change
disposition to *already converged in the corpus*, the way rows 2, 8 and 9 did. All four batch-record
gates then read `is_review_mode != true && has_open_assumptions == true && needs_individual_interview
!= true` and all four interview loops read `needs_individual_interview == true && has_open_assumptions
== true`, so the shared body has one gate to materialise at each position and no site changes at the
migration. The walk obligation transfers with the edits to the track that makes them: it is that
track's review-mode run that has to show the recording step not firing at `research` and `implement`.
A second consequence comes free — both hosts then name `is_review_mode` in a gate their own author
wrote, so the declared read stops depending on fragment inheritance to be satisfied.

**If it does not land before the migration, both rows come back as decisions the migration itself has
to take**, and the shared body has to be authored to the reading above rather than to the one the
proposal's example encodes. See [what the proposal's own worked body
encodes](#what-the-proposals-own-worked-body-encodes-and-why-it-cannot-be-authored-as-written).

## Row 7 — the one loop with no ceiling

Three hosts bound the individual interview at twenty passes and one does not. The bound is a safety
limit the executing agent enforces (`src/schema/activity.schema.ts:161`), so the site without one
walks a residual set of any size and the sites with one stop at twenty.

The corpus convention is measurable. Across all 132 activity files there are **53 loops: 26 `forEach`
of which 21 carry a ceiling, 13 `while` of which 10 do, and 14 `doWhile` of which 13 do.**
`07-assumptions-review`'s `assumption-interview-loop` is one of five `forEach` loops in the whole
corpus with no ceiling, and the other four walk task lists, deferred items and work packages rather
than a residual question set. No guard has an opinion either way — `scripts/check-loop-shape.ts`
names `maxIterations` nowhere.

**Disposition: one bound of 20 in the shared body, and `07-assumptions-review` gains a ceiling.** It
is the only value the corpus writes for this loop, it is what the proposal's worked body carries, and
three of the four hosts already run under it. The change is live: a residual set of more than twenty
assumptions stops short at that host where today it does not. That is what the walk checks — against
the sets a real run produces, not against the bound.

## Row 11 — dismissibility changes whichever way it is settled

This is the row that needs a person, and the reason it cannot be settled by preference is that the
field in question is a capability switch rather than a test.

When the server is asked to dismiss a checkpoint as inapplicable, it checks one thing: that the
checkpoint carries a `condition` field. It never evaluates that condition — `src/tools/workflow-tools.ts:2399-2405`
throws `Cannot dismiss checkpoint '<id>': it has no condition field` and does nothing else with the
value. The schema states the rule twice, at `src/schema/activity.schema.ts:75` and `:85`: on a
checkpoint step, `condition` and not `when` is what makes the gate dismissible. So the presence of
the field confers the capability, and its truth value is irrelevant to what removing it does.

Measured over all 132 activity files, parsing every `kind: checkpoint` node at any loop depth:
**115 checkpoint steps, of which 66 carry a structured `condition` as written, 2 carry `when` alone,
none carries both, and 47 carry neither.** Four more gain a condition at load, by inheritance from
the shared batch-gate body, so **70 gates are dismissible at run time.**

Of the eight fragment reference steps, exactly one carries a site condition of its own:
`07-assumptions-review.yaml:131-135`, five lines testing that the run is not in review mode, on the
per-item gate. It is legal precisely because the `assumption-decision` body declares no condition
(`workflow.yaml:50-71`) and the loader rejects a condition on both sides
(`src/loaders/fragment-resolver.ts:118-122`). The other three per-item gates inherit nothing and carry
nothing, so they are not dismissible. **That five-line block is the corpus's only dismissible per-item
assumption gate.** Ten checkpoints anywhere in the corpus sit inside a loop and carry a condition as
written; six of the ten sit immediately inside a `forEach` over a collection, so are per-item in the
sense that matters here; and of those six, this is the only one the assumption run owns. The others
walk submodule candidates at `meta/activities/02-resolve-target.yaml:64`, a scope manifest three times
at `workflow-design/activities/06-scope-and-draft.yaml:180`, `:224` and `:260`, and a scope manifest
once at `workflow-authoring/activities/06-scope-and-draft.yaml:135`.

Both directions change live behaviour:

- **Drop it.** The one host with a dismissible per-item gate loses it. An agent that today answers
  `condition_not_met` at that gate gets a thrown error instead, and the corpus keeps no dismissible
  per-item assumption gate anywhere.
- **Keep it, in the shared body.** Three hosts gain a dismissible per-item gate they do not have, and
  the dismissal becomes available in every run rather than only in the review-mode run the block was
  written for. Under the once-per-run decision two of those three drop the run, so the surviving
  arithmetic is one host — `implement` — gaining a capability it lacks.

A third shape is worth naming, because the design admits it: keep the block **at the reference site**,
which is where it lives today. The proposal's signature has no field for it — its worked per-item gate
is a body step carrying `options` and nothing else
([README:269-271](../2026-09-03-routines/README.md)) — so this shape costs the construct a field, and
whether a reference step may add a condition to a body gate is a stage-3 question nothing in the plan
answers.

**Recommendation, and it is the owner's call.** Keep the condition, in the shared body. Three
reasons. The enclosing loop at that host already tests the same thing
(`07-assumptions-review.yaml:123`, and after the #638 edit the test moves to the batch gate's
inherited condition), so the block is not load-bearing as a *test* and only the capability is at
stake. Dismissibility is the mechanism by which an agent reports that a question does not apply to
this item, which is exactly the situation a per-item walk over a residual set produces. And of the two
errors available, giving one surviving host a capability it did not ask for is recoverable by deleting
one block later, while removing the corpus's only instance of that capability is a subtraction nothing
in the guard suite would notice. The countervailing argument is real and the owner should weigh it: a
gate dismissible in every run is a gate a worker can skip in every run, and nothing evaluates the
predicate that was meant to bound that.

Whichever way it goes, the migration is not behaviour-preserving at this row and should not be
described as if it were. Two adjacent facts the owner needs: the four batch gates get their
dismissibility from the shared body by inheritance today, and the proposal's worked batch gate
([README:248-251](../2026-09-03-routines/README.md)) carries `message` and `options` and no condition
— so **four of the corpus's 70 dismissible gates become non-dismissible** as a side effect of the
migration as drawn, with no row of any census naming it. That is the same decision as this one at a
different position, and it should be taken with it.

## Row 12 — the announcement sits outside the body, so its three-way variation stays at the hosts

The step immediately before the batch gate binds `review-assumptions::assemble-open-set` and is the
only producer of the presentation the gate displays. It varies three ways across the four hosts: its
identifier, its gate, and whether it carries the `action: message` block that renders the value.

The decision is which side of the shared definition it falls on, and the proposal's own worked example
answers it. The example body opens at the batch gate
([README:249-251](../2026-09-03-routines/README.md)); the corpus name
`assumption_review_presentation` appears nowhere in the example's `internals`, which name
`assumption_presentation` and `current_assumption` (`:241-245`); and the name appears exactly once in
the whole example, inside the literal string the *reference site* binds as a `gate_message` argument
(`:288`). The corpus agrees: the value is the declared output of two host techniques
(`review-assumptions/assemble-open-set.md:18` and `assemble-one.md:18`) and a declared activity-level
write at all four hosts (`04-research.yaml:23`, `05-implementation-analysis.yaml:25`,
`07-assumptions-review.yaml:28`, `08-implement.yaml:26`) with zero declared reads anywhere.

**Disposition: the announcement stays outside the shared body.** The host produces the presentation
and interpolates it into the argument it binds at the reference site. The three-way variation is
therefore host-authored and nothing converges it — which is the answer, not a failure to give one, and
it has three consequences the later stages inherit:

1. The run is six positions inside the shared body, not seven. Stage 5's criterion that "the eight
   write declarations for the run's two internals are gone from the four hosts"
   ([README:886-888](../2026-09-03-routines/README.md)) is wrong by four: the four
   `assumption_review_presentation` declarations survive, and only `current_assumption`'s four become
   one internal.
2. Row 3's decision — guard the announcement on review mode alone — is a decision about a **host**
   step rather than a routine step, and it applies at the two hosts that keep the run.
3. Whether the value is rendered by the announcement or by the gate is a separate content question,
   and the corpus already answers it twice. At the three hosts carrying the message block the
   presentation renders twice per run: once by the announcement's own message, and again inside the
   batch gate's message at `workflow.yaml:29`. At `07-assumptions-review` it renders once, by the gate
   alone. **Recommendation: adopt the one host's shape — no message block, the gate renders it.** That
   removes a duplicate render at the surviving site, leaves one vehicle for the value, and is the shape
   a `gate_message` argument implies.

## Two consequences of decisions already taken

Both are behaviour changes at live sites that no row of the census counts, and neither needs a fresh
decision. They need naming, so the walk knows to look for them.

**The once-per-run decision removes the whole run from two hosts.** Research reaches
implementation-analysis on its only exit (`workflow.yaml:184-185`), which reaches plan-prepare on its
only exit (`:186-187`), which reaches assumptions-review (`:188-189`); and the two paths skipping
research — `codebase-comprehension`'s `comprehension-complete` and `skip-optional-activities` exits
(`:222-223`) — land at implementation-analysis and plan-prepare respectively. So both hosts are
followed by a definitive reconciliation on every path, and both drop their copies
(`decisions.md:620-623`, measured there at 8,351 delivered characters removed from one of them). The
live sites after the migration are `07-assumptions-review` and `08-implement`. This is why rows 1 and
4 have no surviving divergent site, and why rows 5 and 6 narrow to `08-implement` against
`07-assumptions-review` if #638 does not land first.

**Guarding the announcement on review mode alone changes both surviving hosts.** At `08-implement` the
announcement is ungated today, so in review mode it fires and prints the presentation; with the guard
it stops. At `07-assumptions-review` the announcement carries two conjuncts today (`:109`) and the
decision keeps only the review-mode one, so in a non-review run with no residual assumptions the step
now runs where before it did not. The effect there is nil in delivery, because that host renders
nothing itself and the gate that follows carries both tests regardless — the reasoning
`decisions.md:625-632` gives. The effect at `08-implement` is a message that stops appearing in review
mode, and that is the one the walk should see.

## What the proposal's own worked body encodes, and why it cannot be authored as written

Three of the twelve rows are decided the wrong way, or not at all, by the example the plan offers as
its specification ([README:216-275](../2026-09-03-routines/README.md)). An implementer authoring the
shared body from that example reproduces the defect the corpus is fixing.

- **Its recording step is gated `when: needs_individual_interview != true`** (`:255`) with no
  review-mode clause, and the reference site supplies `when: has_open_assumptions == true` (`:291`).
  That is exactly the reading at `04-research` and `08-implement` — the one #638 corrects. Authoring
  it converges all four hosts onto the defect.
- **Its per-item gate carries `options` and no condition** (`:269-271`), and its batch gate carries
  `message` and `options` and no condition (`:249-251`). That takes row 11's decision silently, in the
  direction losing the corpus's only dismissible per-item assumption gate, and takes four batch gates
  out of the dismissible 70 as well.
- **Its loop hard-codes `over: open_assumptions`** (`:260`) while declaring neither that name nor
  `has_open_assumptions` in its signature. The design's no-free-variables rule admits three categories
  ([README:210-213](../2026-09-03-routines/README.md)) and this name is in none of them.

Two further mismatches make the example unusable verbatim, both recorded in the sweep verification as
PD9 and PD10: it binds `review-assumptions::interview` with an `assembly_mode` input, and neither the
operation nor the input exists in the corpus; and it names the routine `assumption-reconciliation`,
which is already the `id` of two live loop steps.

## What this stage owes, and what it does not

Stage 2 changes no definition file. Its deliverable is this record and the one-line seed the
announcement decision needed, which is in place — `is_review_mode` carries `defaultValue: false` at
`work-package/workflow.yaml:78`.

**The criterion, restated at the population the corpus supports.** The plan's text pins ten rows and
names rows 1, 5 and 6 as the behaviour-changing ones
([README:836-842](../2026-09-03-routines/README.md)). Replace it with:

- Each of the census's **twelve** differences carries a recorded disposition: already converged in the
  corpus, converges with no decision, or converges by a decision naming what the run now does and
  which site changes.
- The rows changing behaviour at a site that survives the migration name the site and the change.
  Measured at `a4a5d88b`, those are rows **3, 5, 7, 11 and 12**, and the once-per-run decision is a
  sixth change no row carries. Rows 1, 4 and 6 have no surviving divergent site, and rows 2, 8 and 9
  are already converged.
- No definition changes. State the population as the census's output at the revision the disposition
  is taken, not as a literal — the same correction stage 1's window baseline needs.

Two counts move with that restatement, and both move the same way. The census's closing paragraph
counts three rows as changing behaviour at a live site — row 1 at two sites and rows 5 and 6 at two
each. Measured here, **five rows change behaviour at a surviving site and a sixth change comes from a
decision no row carries**; row 1 is not one of them, because the once-per-run decision removes its two
divergent sites, and neither is row 6, whose clause is provably redundant. And the sweep folder's own
reading — that stage 2 owes "the twelve behaviour differences, two of them live changes with no
recorded decision" — is right about twelve and generous about two: three of the twelve are already
converged, and the number still open to a person is **one**.

**That one row is 11, dismissibility**, together with the same question at the batch gate. Row 5 is
decided, its edit is written on the #638 track, and when that lands rows 5 and 6 become *already
converged in the corpus* and this stage owes only the line recording it.

**Two obligations pass to later stages from rows settled here.**

- Stage 5's criterion loses four declarations. Row 12 puts the announcement outside the body, so
  `assumption_review_presentation`'s four write declarations survive the migration and only
  `current_assumption`'s four become one internal.
- Each surviving host's declared read of `is_review_mode` needs a consulting site after the migration.
  Today that read is satisfied at `04-research` and `08-implement` only by the condition the loader
  copies onto the batch gate. The #638 edit gives both an authored gate naming the flag, which closes
  it at those two; at `07-assumptions-review` and `05-implementation-analysis` an authored gate already
  names it. If stage 4's boundary means the host derivation never consults the routine body, then
  unless the reference step's own `when` names `is_review_mode`, `check-activity-variables` reports
  `unused-declaration` — "declares a read of '…' that no step, gate, loop or transition consults"
  (`scripts/check-activity-variables.ts:252-253`) — and that guard is hard zero with no ledger (`:25`).

## Re-taking every figure

```
# the trees these figures were taken at
git -C .worktrees/2026-09-11-register-findings rev-parse HEAD
git -C .worktrees/2026-09-11-register-findings submodule status
git -C .worktrees/workflows rev-parse HEAD

# the run's five files, byte-identical across three corpus revisions
git -C .worktrees/workflows diff --stat a4a5d88b:work-package/workflow.yaml e9d26007:corpus/work-package/workflow.yaml

# the run, position by position, and the spelling inventory
python3 .engineering/artifacts/planning/2026-09-11-routines-remediation/measure/run-positions.py

# the dismissibility census, and the eight reference steps
python3 .engineering/artifacts/planning/2026-09-11-routines-remediation/measure/checkpoint-conditions.py

# the shared gate bodies
sed -n '15,71p' .worktrees/workflows/corpus/work-package/workflow.yaml

# the flag with one writer, and its four seeds
grep -rn "needs_individual_interview" .worktrees/workflows/corpus/
grep -rn -A4 "name: is_review_mode" .worktrees/workflows/corpus/work-package/workflow.yaml

# the edit the code track has written, at the four gates
git -C .worktrees/2026-09-11-register-findings/workflows diff -- work-package/activities/

# the mechanism behind dismissibility
sed -n '2399,2406p' src/tools/workflow-tools.ts
sed -n '118,128p' src/loaders/fragment-resolver.ts

# the suite
npx tsx guards/check-all.ts
```

The two scripts named above are the ones this record was measured with. The first parses the four host
files, matches the eight positions, and prints per-position spelling counts and the set of fields that
differ; the second walks every `kind: checkpoint` node at any loop depth across all 132 activity files
and partitions them on `condition` and `when`. Both resolve the corpus root at `workflows/` where a
submodule holds it and `.worktrees/workflows/corpus/` where a branch worktree does, which is the pair
`guards/workflows-root.ts` resolves over.

Their rules are stated in full in the sections above, which is what makes each figure re-derivable:
positions are matched by place in the sequence rather than by identifier; a step is compared as its
parsed object with keys sorted; an activity file is any `.yaml` under a directory named `activities`
at any depth, so a workflow nested under a grouping folder is counted; and a gate counts as
dismissible when the `condition` field is present after the loader has copied any shared body's
condition onto it. The loop census reads each loop step's `loopType` and whether it declares
`maxIterations`, over the same file set.
