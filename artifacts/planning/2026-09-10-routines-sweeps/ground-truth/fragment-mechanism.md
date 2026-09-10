# The mechanisms a routine would retire, measured corpus-wide

Ground truth for the sweep of the routines proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). Every figure below was taken
from the repository rather than from the proposal, and the command or the `file:line` that produced
it is recorded beside it so it can be re-taken.

Server tooling at `9ca71c19` on `main`; corpus at `2b8b7215` on the `workflows` branch. The proposal
pins its own measurements to server `4740f4d6` / corpus `131e2942`, with
[gap-review.md](../../2026-09-03-routines/gap-review.md) re-checked at `f315b772` / `b5e54574`.
Where a figure disagrees with the proposal this document says so and gives its own; where the
disagreement is corpus movement rather than arithmetic, the commit that moved it is named.

**Nothing in the routines design is built.** There is no `routines/` directory in any workflow, no
`routine` member of the step union, and no materialisation pass:
`ls workflows/*/routines` reports no such file or directory, `src/schema/activity.schema.ts:167`
declares `StepSchema` over exactly four members — `TechniqueStepSchema`, `ActionStepSchema`,
`CheckpointStepSchema`, `LoopStepSchema` — and
`grep -rn "kind: routine\|'routine'\|\"routine\"" src/ scripts/ workflows/` returns nothing. A
case-insensitive grep for the bare word across the same trees returns only the English adverb
"routinely" and similar prose. So every construct counted here is one that stands today and that a
routine would supersede, narrow or leave alone.

Four populations follow. The first three are counts of schema constructs and guard rules. The
fourth is a judgement about prose and is marked as such.

---

## One. The fragment mechanism

### There is exactly one declaration, and it holds two gate bodies

`grep -rn "fragments" --include=*.yaml --include=*.yml workflows/` returns two lines. One is prose
inside a checkpoint message about a changelog fragment
(`workflows/work-package/activities/12-strategic-review.yaml:196`) and has nothing to do with the
mechanism. The other is the single declaration, at
`workflows/work-package/workflow.yaml:15`. It spans lines 15 to 71 — **57 lines**, the next
top-level key being `techniques:` at line 72 — and declares two named checkpoint bodies under
`fragments.checkpoints`.

**`assumption-interview`** (`workflows/work-package/workflow.yaml:17-49`, 33 lines). It carries a
shared `condition` — an `and` of `is_review_mode != true` and `has_open_assumptions == true`
(lines 18-28) — a message reading `{assumption_review_presentation}` (line 29), and three options
(lines 30-49):

| Option id | Label | Effect |
|---|---|---|
| `accept-agent-positions` | Accept agent positions | `assumption_outcome: confirmed` |
| `defer-all` | Defer all to stakeholders | `has_deferred_assumptions: true`, `assumption_outcome: deferred` |
| `interview-individually` | Interview individually | `needs_individual_interview: true` |

**`assumption-decision`** (`workflows/work-package/workflow.yaml:50-71`, 22 lines). No shared
condition. Its message reads `{current_assumption.id}` and `{current_assumption.statement}`
(line 51), and it offers three options (lines 52-71):

| Option id | Label | Effect |
|---|---|---|
| `resolve-inline` | Accept the assumption | `assumption_outcome: confirmed` |
| `correct-assumption` | Correct the assumption | `assumption_outcome: corrected` |
| `defer-to-stakeholder` | Defer to stakeholder review | `has_deferred_assumptions: true`, `assumption_outcome: deferred` |

Between them the two bodies write four names — `assumption_outcome`,
`has_deferred_assumptions`, `needs_individual_interview` — and read three:
`is_review_mode`, `has_open_assumptions`, `assumption_review_presentation`, plus
`current_assumption` through the per-item message. Those are one activity's state living in a
routing file, which is the proposal's own complaint about the arrangement, and it reproduces exactly.

### Separating the reference sites from the other `ref:` lines

`grep -rn "ref:" workflows/ | wc -l` gives **25**. The schema admits `ref` in exactly one place:
`ref` is a field on `CheckpointStepSchema` and on nothing else
(`src/schema/activity.schema.ts:134`), declared mutually exclusive with the body fields. The only
other appearance of the token in `src/schema/` is the string `'ref'` in the exempt-data-id list at
`src/schema/identifiers.ts:38`, which is a naming-convention carve-out for external tool
parameters, not a construct. `WorkflowFragmentsSchema` has one key, `checkpoints`
(`src/schema/workflow.schema.ts:40-42`) — the mechanism's rule half is already gone, as the
proposal states.

So the 25 lines partition as:

| Population | Count | Where |
|---|---|---|
| Checkpoint fragment references | **8** | four `work-package` activity files, listed below |
| `actions/checkout` `ref:` in a real GitHub workflow | 2 | `workflows/.github/workflows/verify-corpus.yml:41,57` |
| `actions/checkout` `ref:` quoted inside audit resources and techniques | 13 | `cicd-pipeline-security-audit/` resources and techniques |
| Documentation of the fragment mechanism itself | 1 | `workflows/workflow-design/resources/schema-construct-inventory.md:68` |
| A findings-register template field named "Base ref" | 1 | `workflows/workflow-authoring/resources/findings-register.md:21` |

The eight reference sites, four per fragment, all inside one workflow:

| Fragment | Activity file | Line | Step id | Position |
|---|---|---|---|---|
| `assumption-interview` | `work-package/activities/04-research.yaml` | 224 | `research-assumption-interview` | top level, step 12 of 15 |
| `assumption-interview` | `work-package/activities/05-implementation-analysis.yaml` | 126 | `analysis-assumption-interview` | top level, step 7 of 10 |
| `assumption-interview` | `work-package/activities/07-assumptions-review.yaml` | 112 | `residual-assumption-batch` | top level, step 3 of 11 |
| `assumption-interview` | `work-package/activities/08-implement.yaml` | 202 | `implementation-assumption-interview` | top level, step 3 of 7 |
| `assumption-decision` | `work-package/activities/04-research.yaml` | 243 | `research-assumption-decision#{current_assumption.id}` | inside the `assumption-interview` forEach |
| `assumption-decision` | `work-package/activities/05-implementation-analysis.yaml` | 145 | `analysis-assumption-decision#{current_assumption.id}` | inside the `assumption-interview` forEach |
| `assumption-decision` | `work-package/activities/07-assumptions-review.yaml` | 130 | `assumption-decision#{current_assumption.id}` | inside the `assumption-interview-loop` forEach |
| `assumption-decision` | `work-package/activities/08-implement.yaml` | 221 | `implementation-assumption-decision#{current_assumption.id}` | inside the `assumption-interview` forEach |

Four reference sites each, so **neither fragment is referenced twice by any one activity** — the
collision case the proposal's identifier prefixing is designed for still has no instance in the
corpus, exactly as the proposal states at README:551.

One reference site carries a site condition the others do not:
`work-package/activities/07-assumptions-review.yaml:131-135` declares
`is_review_mode != true` on its `assumption-decision` ref step. That is legal precisely because
`assumption-decision` declares no shared condition, and the loader would reject it if the fragment
did (`src/loaders/fragment-resolver.ts:118-122`).

The four hosts are all borrowed by a second workflow. `workflows/remediate-vuln/workflow.yaml:202-216`
lists **14** activity files from `work-package`, including all four assumption-run hosts and
`15-codebase-comprehension`. A borrowed activity resolves its bare refs against its source
workflow (`src/loaders/fragment-resolver.ts:132-152`), so the eight references keep their meaning in
both workflows.

### The fragment guard's nine rules, against the script as it stands

`scripts/check-fragments.ts` declares nine rule names in the `FragmentViolation` union at
`scripts/check-fragments.ts:56-65`. It passes clean today:
`npx tsx scripts/check-fragments.ts` prints
`fragments: OK — every ref resolves, every fragment is used, no inline duplicates`.

| Rule | Emitted at | What it polices | Scope |
|---|---|---|---|
| `malformed-ref` | `:207-208` | A `ref` value that does not split as `name` or `workflow::name` (`src/loaders/fragment-resolver.ts:38-45`) | **The fragment mechanism only.** Nothing else parses a ref |
| `unresolved-ref` | `:207-208` | A ref naming no `fragments.checkpoints` entry under the resolver's fallback order | **The fragment mechanism only** |
| `ref-body-conflict` | `:199` and `:212` | A ref step also declaring `message`/`options`/`defaultOption`/`autoAdvanceMs`/`blocking`, or a condition on both step and fragment | **The fragment mechanism only** — the one-home rule for a body that has two possible homes |
| `ref-opens-step` | `:176` | A checkpoint step whose `- ` list opener is the `ref:` line itself. The raw-YAML delivery path replaces standalone `ref:` lines only (`src/loaders/fragment-resolver.ts:190-209`), so the step must write `id:` first | **The fragment mechanism only** — and specifically its textual half. See the note below |
| `unused-fragment` | `:242` | A declared fragment referenced nowhere corpus-wide | **The fragment mechanism only** |
| `inline-duplicate-of-fragment` | `:247` | An inline checkpoint body whose normalised form equals a declared fragment's | **The fragment mechanism only** — the re-inlining drift vector the mechanism exists against |
| `undeclared-effect-variable` | `:218` | A referencing workflow whose variable set does not declare a name the fragment's `setVariable` effects write. Emitted inside the `typeof ref === 'string'` branch at `:196`, so it fires on ref steps and nothing else | **The fragment mechanism only** |
| `duplicate-rule` | `:257-263` | Identical normalised rule text authored inline in two or more workflows, no fragment involved. Its remedy is the conduct technique, not a fragment (`:261-262`) | **Wider.** Rules are not shared through fragments at all (`src/loaders/fragment-resolver.ts:9-10`) |
| `duplicate-checkpoint` | `:269` | Identical normalised inline checkpoint bodies at two or more sites, no fragment involved | **Wider.** It detects the condition a fragment *or* a routine would answer; only its remedy names the mechanism |

**The proposal's list reproduces exactly.**
[decisions.md:447-450](../../2026-09-03-routines/decisions.md) names the seven rules that die as
`malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `unused-fragment`,
`inline-duplicate-of-fragment` and `undeclared-effect-variable`, keeps `duplicate-rule` as it is,
and keeps `duplicate-checkpoint` with its remedy changed. Read against the script, that partition is
the same one the third column above arrives at independently: the seven named rules each reach the
corpus only through a `ref` value or a `fragments.checkpoints` entry, and the two survivors reach it
through inline content with no reference anywhere in the path.

Two observations the proposal does not carry.

**`ref-opens-step` encodes a constraint the routines design re-creates rather than removes.** The
rule exists because the textual injector is line-oriented: it matches a standalone `ref:` line at its
own indentation and replaces it with a serialised body
(`src/loaders/fragment-resolver.ts:192-209`). Deleting the rule with the mechanism is correct, but
the routines proposal's own stage-3 criterion — "the textual splicer emits an explicit prefixed
`id:` on every step it splices" (README:858) — is the same requirement restated for a bigger
splicer. The rule count falls by one; the hazard does not.

**`undeclared-effect-variable` audits fewer activities than its own statement claims.** Its comment
says the effect fires in the *referencing* workflow's bag
(`scripts/check-fragments.ts:214`), but the loop that reaches ref steps reads only
`root/<workflow>/activities` (`scripts/check-fragments.ts:169-171`). `remediate-vuln` has one
activity file of its own and borrows fourteen, so its fourteen borrowed ref-carrying activities are
never audited under `remediate-vuln`. It passes anyway, because `declaredVariables` resolves
borrowed activities into the borrower's declared set
(`scripts/workflow-declarations.ts:61-71`) and both workflows therefore compute the same
contributions. The hole is benign at today's corpus and it is real.

### The guard suite this sits in

`ls scripts/check-*.ts | wc -l` gives **42 scripts**; `wc -l scripts/check-*.ts` totals
**8,198 lines**. No script in it compares one step sequence against another —
`ls scripts/ | grep -i "repeat\|routine"` returns nothing, which is what stage 1 of the proposal
would add. The proposal states the suite at 35 scripts and 6,749 lines (README:611) and elsewhere at
thirty-seven (README:1020); both figures are below what stands.

---

## Two. The duplicated runs the migration converges

### The proposal's own search reproduces exactly

`python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py` run against
the corpus at `2b8b7215` reports:

```
activity files parsed: 122
maximal shared windows: 26  (top level 21, inside a loop body 5)
```

That is the figure [measure/README.md:19-20](../../2026-09-03-routines/measure/README.md) records
for `b5e54574` — 26 windows across 122 activity files, 21 top level and 5 nested — reproduced
without change. The five nested windows are also the same five it tabulates, with the same activity
counts: `challenge` → `combine` at seven activities, `reconcile` → `challenge` → `combine` at six,
`assemble-one` → per-item gate → `record` at four, a five-step audit-and-fix run at two, and the
`handle-sub-workflow` pair at two.

The script reads definitions and writes nothing. It was not edited.

### The assumption run: four copies, and what differs today

The run is: announce the residual set, gate the batch, record the batch answer, then iterate the
residual items — present, gate, record — with a closing record pass. Four activity files carry it,
and their top-level step lists place it as follows.

| Host | Top-level steps | The run's step indices | Contiguous? |
|---|---|---|---|
| `work-package/activities/04-research.yaml` | 15 | 8, then 12, 13, 14 | **No** — three steps intervene |
| `work-package/activities/05-implementation-analysis.yaml` | 10 | 6, 7, 8, 9 | Yes |
| `work-package/activities/07-assumptions-review.yaml` | 11 | 2, 3, 4, 5, 6 | Yes |
| `work-package/activities/08-implement.yaml` | 7 | 2, 3, 4, 5, 6 | Yes |

The shared window is four steps at `04-research` and `05-implementation-analysis` and five at
`07-assumptions-review` and `08-implement`, the fifth being the closing record pass those two carry
after the loop. Each loop body is three steps at all four hosts. In source lines, the run occupies:

| Host | Announcement | Batch gate | Batch record | Loop | Closing record | Total |
|---|---|---|---|---|---|---|
| `04-research.yaml` | 169-177 (9) | 222-224 (3) | 225-228 (4) | 229-246 (18) | — | **34** |
| `05-implementation-analysis.yaml` | 115-123 (9) | 124-126 (3) | 127-130 (4) | 131-148 (18) | — | **34** |
| `07-assumptions-review.yaml` | 106-109 (4) | 110-112 (3) | 113-116 (4) | 117-138 (22) | 139-141 (3) | **36** |
| `08-implement.yaml` | 191-199 (9) | 200-202 (3) | 203-206 (4) | 207-224 (18) | 225-227 (3) | **37** |

**141 lines across the four hosts**, plus the 57-line `fragments` block at the workflow root, for
**198 lines of source describing one run**. The proposal states 138 plus 51 for 189 (README:474-476);
each of the three figures is a few lines low.

Differences between the copies, re-measured against the corpus as it stands rather than taken from
[drift-census.md](../../2026-09-03-routines/drift-census.md):

| # | Difference | Sites | Stands today? |
|---|---|---|---|
| 1 | The record pass sits before the convergence loop at two hosts and after the interview loop at two | before: `04-research.yaml` step 6, `05-implementation-analysis.yaml` step 4; after: `07-assumptions-review.yaml` step 6, `08-implement.yaml` step 6 | **Yes** |
| 2 | The announcement's message text | `04-research.yaml:169-177`, `05-implementation-analysis.yaml:115-123`, `08-implement.yaml:191-199` | **No — converged.** The three blocks are byte-identical (`diff` over the three nine-line spans: no output). They were already identical at `b5e54574`. The census lists this as a live mechanical difference |
| 3 | The announcement is gated at one host and ungated at three | gated at `07-assumptions-review.yaml:109` (`is_review_mode != true && has_open_assumptions == true`) | **Yes** |
| 4 | The announcement is separated from the gate by unrelated steps at one host | `04-research.yaml` steps 9-11 — `close-research-phase`, `announce-derived-context-scope`, `context-scope-declaration`, lines 178-221 | **Yes, at three steps.** The census says four. `git show 131e2942:…/04-research.yaml` carries a fourth, `derive-context-scope`, deleted since — corpus movement, not a miscount |
| 5 | The batch-record gate carries `is_review_mode != true` at two hosts and omits it at two | carried: `05-implementation-analysis.yaml:130`, `07-assumptions-review.yaml:116`; omitted: `04-research.yaml:228`, `08-implement.yaml:206` | **Yes** |
| 6 | The interview loop's gate carries the same conjunct at the same two hosts | carried: `05-implementation-analysis.yaml:138`, `07-assumptions-review.yaml:123`; omitted: `04-research.yaml:236`, `08-implement.yaml:214` | **Yes** |
| 7 | `maxIterations: 20` at three hosts, absent at one | absent at `07-assumptions-review.yaml:117-123` | **Yes** |
| 8 | The per-item gate inline at one host, by reference at three | — | **No — converged.** All four reference `assumption-decision` |
| 9 | The per-item gate offers three options at one host and two at three | — | **No — converged.** The shared body offers three (`workflow.yaml:52-71`) |
| 10 | Step ids differ by hand-written prefix | batch gates `research-` / `analysis-` / `residual-assumption-batch` / `implementation-`; batch record `record-batch-response` ×3 vs `record-batch-decision`; per-item record `record-response` ×3 vs `record-decision`; loop `assumption-interview` ×3 vs `assumption-interview-loop` | **Yes** |
| 11 | The per-item gate carries a site condition at one host | `07-assumptions-review.yaml:131-135` | **Yes.** The census does not list it |

So **seven of the census's ten differences stand, three have converged, and one difference the
census does not carry has appeared.** Row 2 in particular is worth flagging: the census re-check note
claims two rows converged, and this is a third, already converged at the revision the re-check was
taken against.

### The convergence loop: six byte-identical blocks and one variant

Six activity files carry a `doWhile` loop whose body is `review-assumptions::reconcile`, then
`analyse-challenge::challenge`, then `analyse-challenge::combine`:

| Host | Loop block | Lines |
|---|---|---|
| `work-package/activities/02-design-philosophy.yaml` | 177-208 | 32 |
| `work-package/activities/04-research.yaml` | 137-168 | 32 |
| `work-package/activities/05-implementation-analysis.yaml` | 83-114 | 32 |
| `work-package/activities/06-plan-prepare.yaml` | 115-146 | 32 |
| `work-package/activities/07-assumptions-review.yaml` | 74-105 | 32 |
| `work-package/activities/08-implement.yaml` | 159-190 | 32 |

All six hash to one SHA-256 prefix, `1d1e8bc06add9904`, over the extracted block text. **192 lines
of byte-identical structure**, which reproduces the proposal's headline figure exactly, including
the perspective list `["stakeholder-gap", "rejected-paths", "evidence-strength"]` and the four
output remaps that appear in every copy.

The seventh site is `work-package/activities/15-codebase-comprehension.yaml`, whose
`deep-dive-iteration` `while` loop spans **lines 79-157, 79 lines**. Its body runs `deep-dive`, then
`revise-questions`, then the same `challenge`/`combine` pair (lines 95-111) with the comprehension
domain's names and three output bindings rather than four, then two artifact writes and a
sufficiency gate. The proposal states this variant at 75 lines (README:43) and, in the same folder,
at 80 (re-derivation.md:56); I measure 79.

What the seven sites share at the grain a routine would carry is therefore two nested windows, and
the search finds both: the `challenge` → `combine` pair at **seven** activities, and
`reconcile` → `challenge` → `combine` at **six**. `revise-questions` sitting between the analysis
and the challenge at the seventh site is what forces the two-level split, and it is visible in the
file at `15-codebase-comprehension.yaml:92-94`.

Across the seven sites the `combine` step binds **four** output ids —
`concern_document`, `concerns_agent_resolvable`, `residual_opens_remain`, `residual_opens` — to
**seven** distinct destination names: `assumptions_log`, `has_resolvable_assumptions`,
`has_open_assumptions` and `open_assumptions` at the six identical sites, and
`comprehension_artifact`, `needs_comprehension` and `has_open_questions` at the comprehension site,
which binds three of the four. The proposal describes this as "the same three outputs to five
different names" (README:303); it is four outputs to seven names.

---

## Three. The declarations a signature subsumes

The run touches seven names. Six come from the two fragment bodies and the loop —
`assumption_outcome`, `has_deferred_assumptions`, `needs_individual_interview`,
`assumption_review_presentation`, `has_open_assumptions`, `open_assumptions` — and the seventh,
`current_assumption`, is the forEach item variable.

**All seven are declared as writes at each of the four hosts: 28 declarations.** That figure
reproduces. What it is 28 *of* does not:

| Host | Declared writes | Of those, the run's seven | The convergence loop's three | Neither |
|---|---|---|---|---|
| `04-research.yaml` | 15 | 7 | 3 | 5 |
| `05-implementation-analysis.yaml` | 11 | 7 | 3 | 1 |
| `07-assumptions-review.yaml` | 12 | 7 | 3 | 2 |
| `08-implement.yaml` | 17 | 7 | 3 | 7 |

The proposal says "at two of the four hosts that is seven of eight declared writes" (README:38).
No host declares eight writes. The strongest form the corpus supports is
`05-implementation-analysis.yaml`, where **ten of eleven declared writes** describe the two shared
runs and the eleventh is `changed_files` — an activity whose contract almost entirely describes runs
it shares with siblings. That is the proposal's point, and it survives being re-measured; only the
ratio it is stated at does not.

Corpus-wide the seven names carry **38** declarations across eight activity files, because
`has_deferred_assumptions` (7), `has_open_assumptions` (8) and `open_assumptions` (7) are also
declared at `02-design-philosophy.yaml`, `03-requirements-elicitation.yaml`,
`06-plan-prepare.yaml` and, for two of them,
`workflow-design/activities/03-requirements-refinement.yaml`. A routine's signature reaches the 28
at the four hosts; the other ten belong to activities that are not reference sites.

### The eight declarations for the run's two internals

The two names the proposal classes as internals are `assumption_review_presentation` — the
judgement-augmentation context the batch gate displays — and `current_assumption`, the loop's item.
Each is declared as a write at exactly the four hosts and nowhere else, and **neither is declared as
a read anywhere in the corpus**:

| Name | Declared writes | Declared reads |
|---|---|---|
| `assumption_review_presentation` | 4 — `04-research.yaml:23`, `05-implementation-analysis.yaml:25`, `07-assumptions-review.yaml`, `08-implement.yaml` | 0 |
| `current_assumption` | 4 — `04-research.yaml:44`, `05-implementation-analysis.yaml:38`, `07-assumptions-review.yaml`, `08-implement.yaml` | 0 |

**Eight write declarations across four hosts, for values that never cross an activity boundary.**
That reproduces exactly, and the zero-read column is corroborating evidence the proposal does not
carry: nothing outside the run declares an interest in either name.

### `challenge_findings` is declared at seven sites, not six

`grep -rn "challenge_findings" workflows/` returns thirteen lines. Two are the technique files that
produce and consume it (`analyse-challenge/challenge.md:18,37,38,44` and
`analyse-challenge/combine.md:12,38`), one is an anti-pattern example, and **seven** are
activity-level write declarations:

`02-design-philosophy.yaml:23`, `04-research.yaml:29`, `05-implementation-analysis.yaml:31`,
`06-plan-prepare.yaml:34`, `07-assumptions-review.yaml:34`, `08-implement.yaml:32`,
`15-codebase-comprehension.yaml:22`.

Those seven are precisely the seven convergence sites. The proposal states six, at README:208,
README:905 and re-derivation.md:257. This is not corpus movement since the re-check:
`git grep -c "name: challenge_findings" b5e54574` already returns seven files. At the census
revision it returned none — `git grep -l "name: challenge_findings" 131e2942` is empty — so the
declarations were added between the two revisions and the figure was taken mid-flight and never
re-taken. **Stage 6 removes seven declarations, not six.**

### `assumptions_log` is not a name declared nowhere

README:1097-1099 says converting the convergence run "promotes `assumptions_log`, a name declared
nowhere in the corpus today", and conversion-rerun.md:246-249 states it more strongly — "not on a
workflow file, not as any activity's read or write".

Today `assumptions_log` is a declared activity-level **write at eight activity files**:
`02-design-philosophy.yaml`, `03-requirements-elicitation.yaml`, `04-research.yaml:26`,
`05-implementation-analysis.yaml:28`, `06-plan-prepare.yaml`, `07-assumptions-review.yaml`,
`08-implement.yaml`, `workflow-design/activities/03-requirements-refinement.yaml`; a declared read at
`workflow-design/activities/09-validate-and-commit.yaml`; and a workflow-level variable in
`workflows/workflow-design/workflow.yaml`.

`git grep -l "name: assumptions_log" b5e54574 -- "*/activities/*.yaml"` already returns the same
eight files, so the claim was stale at the revision the gap review re-checked against.
`gap-review.md:45` records the underlying finding A4 as **Fixed** on exactly these grounds, and
`findings-register.md:33` agrees — but the README and the conversion record still carry the
pre-fix figure. `03-requirements-elicitation`, the one activity conversion-rerun names as owing a
declaration because it is not a reference site, already declares it.

The same staleness reaches `has_open_questions`. investigation.md:271-275 says it "has no declared
writer in any activity anywhere" and sits at the workflow root in `work-package/workflow.yaml` and
`remediate-vuln/workflow.yaml`. Today it is declared as a write at
`15-codebase-comprehension.yaml:43` and appears in no `workflow.yaml` at all.

**So stage 6 promotes no undeclared name.** The declaration obligation the proposal treats as a
consequence of the migration has already been discharged by ordinary corpus work.

---

## Four. Prose-encoded runs — the weakest population, and it is a judgement

This population is not a count of a schema construct. It is a reading of prose, and every figure in
it depends on a counting rule stated below rather than on anything the schema admits. It is kept
separate for that reason.

### The proposal's named exemplar no longer exists

investigation.md:305-321 argues the case on `analyse-challenge::run-loop`: a technique whose
Protocol is a `while` loop invoking three techniques per pass, carrying an `iteration_mode` input
whose only job is to switch its own loop off at the one site that wraps it in a real `kind: loop`
step. The proposal names `iteration_mode` as a parameter that "exists because a gate cannot live
inside prose" (conversion-trial.md:274).

Neither survives. `grep -rn "iteration_mode" workflows/ src/ scripts/` returns nothing, and
`grep -rn "run-loop" workflows/` returns nothing;
`workflows/work-package/techniques/analyse-challenge/` holds three files — `TECHNIQUE.md`,
`challenge.md`, `combine.md`. The technique was deleted on 2026-09-06, which
[gap-review.md](../../2026-09-03-routines/gap-review.md) records as gap 3 and
[re-derivation.md:73-96](../../2026-09-03-routines/re-derivation.md) works through for the
signature. The consequence the two records do not draw is that **the proposal's single strongest
piece of evidence for this population is gone**, and with it the one site where iteration was
expressed twice in two mechanisms.

### The mechanical superset

Counting rule: for each of the **586** technique markdown files under `workflows/*/techniques/`,
take the `## Protocol` section, and count markdown links resolving to an existing `.md` file inside a
`techniques/` tree other than the file itself. That gives **444 links across 145 files**, of which
**85 files name two or more distinct other techniques**. The proposal reports 235 across 66 of 582
files (investigation.md:330) and states in the same paragraph that the figure is a counting rule
rather than a corpus fact and that nothing in the proposal is keyed to the total. Mine is a
different rule and a larger corpus; both statements hold.

A tighter rule gets closer to "a run a routine could hold". Require the Protocol line to carry an
imperative governing the link — *apply*, *dispatch via*, *invoke*, *run*, *bind*, *via* — so a
technique cited as a tool inside a step is excluded and a technique named as an ordered step is not.
That gives **108 technique files, 67 of them bound at one or more activity step sites, for 121 bind
sites**.

### The judged subset

Reading the top of that list by bind-site count, five are genuinely a run of steps in prose and the
rest are guarded single calls or tool citations:

| Technique | Bind sites | What the Protocol holds |
|---|---|---|
| `meta/techniques/orchestration-patterns/dispatch-workers.md` | **14** | Step 2 is a forEach over `{worker_briefs}` applying `harness-compat::spawn-agent` per brief and appending to `{dispatched_results}` (line 25). A `kind: loop` step over a collection, written as a sentence |
| `work-package/techniques/analyse-challenge/challenge.md` | **7** | Three phases — Scatter, Per-Perspective Challenge, Gather (lines 24-38) — dispatching via `scatter-gather`. A fan-out run, written as three headings |
| `meta/techniques/version-control/commit-regular-files.md` | 5 | Step 3 applies `push-branch` with named parameters. A second step, in prose |
| `workflow-design/techniques/audit-conformance.md` | 4 | Four numbered phases, the last of which persists findings to a satellite guide — the audit-and-persist pairing the drift census lists as a provisional shared window |
| `work-package/techniques/update-pr/render.md` | 4 | Step 5 applies `github-cli-protocol::update-pr-description` with `repo_path` and `body` bound and sets `{rendered_pr_body}` from it. A technique step with an output remap, in prose |

Against those, the largest contributors to the mechanical count are not runs.
`review-assumptions/reconcile.md` (8 bind sites) has five numbered phases whose links are almost all
citations of `gitnexus-operations` as a tool inside one phase.
`substrate-node-security-audit/techniques/verify-sub-agent-output.md` (5) has nine numbered checks
with the same shape. Seven `github-cli-protocol` operations each open with
`1. Apply [resolve-repo-coordinates]`, which is a prologue, not a run. And
`dispatch-sub-agents/compose-roster-briefs.md` (6) points the other way entirely: its link is the
instruction *"Do not dispatch agents from this operation — the binding activity binds
orchestration-patterns::dispatch-workers next"* (line 22). That is prose telling the reader that two
consecutive step sites are one unit — evidence for a routine at the **call site**, not for content
inside the technique.

**So the honest figure is: five techniques carrying 34 bind sites between them read as a run a
routine could hold; a further 62 techniques carrying 87 bind sites delegate in prose without being a
run.** The 34 is the number worth carrying, and it is small.

One adjacent count the proposal flags for re-taking. `work-package/techniques/manage-artifacts/write-artifact.md`
is bound at **46** step sites, counting top-level and nested loop bodies — the most-bound technique
in the corpus by a factor of nearly three over `review-assumptions/record.md` at 16. The proposal
carries 42 (README:983) and says the figure needs re-counting before it is read as a constituency
(README:990). It does, and it is 46.

---

## Figures the proposal states that could not be reproduced

| Figure the proposal states | Where | Measured here | Cause |
|---|---|---|---|
| The run's seven variables are "seven of eight declared writes" at two hosts | README:38 | No host declares 8; 15/11/12/17. The best case is 10 of 11 at `05-implementation-analysis.yaml` | Arithmetic |
| 51 lines of shared gate bodies at the workflow root | README:475 | 57 — `workflow.yaml:15-71` | Arithmetic |
| 138 lines of the run across the four activity files; 189 total | README:474-476 | 141 and 198 | Arithmetic, plus row-4 corpus movement |
| Four unrelated steps between announcement and gate at `04-research` | drift-census.md:94 | Three — `04-research.yaml` steps 9-11 | Corpus movement: `derive-context-scope` deleted since `131e2942` |
| The announcement message differs — text A at two sites, text B at one | drift-census.md:176 | Byte-identical at all three announcing sites, and already so at `b5e54574` | Stale row |
| `challenge_findings` is a declared activity-level write at six sites | README:208, README:905, re-derivation.md:257 | Seven — all seven convergence sites. Already seven at `b5e54574`, zero at `131e2942` | Taken mid-flight, never re-taken |
| `assumptions_log` is declared nowhere in the corpus | README:1097, conversion-rerun.md:247 | Declared as a write at eight activity files, a read at one, and a workflow variable in `workflow-design` | Stale; `gap-review.md:45` records the fix, the README does not |
| `has_open_questions` has no declared writer in any activity | investigation.md:271 | Declared as a write at `15-codebase-comprehension.yaml:43`; absent from every `workflow.yaml` | Stale |
| The seventh convergence site is a 75-line variant | README:43 | 79 lines — `15-codebase-comprehension.yaml:79-157`. re-derivation.md:56 says 80 | Two figures in the folder, neither matching |
| Seven sites bind "the same three outputs to five different names" | README:303 | Four output ids to seven distinct names | Arithmetic |
| A 35-script, 6,749-line guard suite; elsewhere thirty-seven scripts | README:611, README:1020 | 42 scripts, 8,198 lines | Corpus movement |
| One workflow borrows thirteen activities from another | README:574, investigation.md:356 | `remediate-vuln` borrows 14 — `remediate-vuln/workflow.yaml:202-216` | Arithmetic or movement |
| `write-artifact` bound at 42 sites | README:983 | 46 | Corpus movement |
| `iteration_mode` exists because a gate cannot live inside prose | conversion-trial.md:274 | Neither `iteration_mode` nor `analyse-challenge::run-loop` exists in the corpus | The technique was deleted 2026-09-06 |
| 235 Protocol links across 66 of 582 technique files | investigation.md:330 | 444 across 145 of 586, by the rule stated above | Different counting rule; the proposal says so |

Figures that reproduced without change: the single `fragments` declaration and its two bodies; eight
fragment reference sites; nine guard rules partitioning seven-and-two exactly as
decisions.md:447-450 names them; 26 maximal shared windows, 21 top level and 5 nested, over 122
activity files; six byte-identical 32-line convergence blocks under one SHA for 192 lines; 28
activity-level declarations of the run's seven names at the four hosts; eight declarations for the
run's two internals, with zero declared reads for either.

## Re-taking every figure

```
# population one
grep -rn "fragments" --include=*.yaml --include=*.yml workflows/
grep -rn "ref:" workflows/ | wc -l
grep -rn "ref:" --include=*.yaml workflows/*/activities/
npx tsx scripts/check-fragments.ts
ls scripts/check-*.ts | wc -l ; wc -l scripts/check-*.ts | tail -1

# population two
python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py
grep -rn "id: assumption-convergence" --include=*.yaml workflows/work-package/activities/
grep -rn "analyse-challenge::challenge" --include=*.yaml workflows/

# population three
grep -rn "challenge_findings" workflows/
grep -rn "name: assumptions_log" workflows/*/activities/*.yaml
grep -rn "name: has_open_questions" workflows/*/activities/*.yaml workflows/*/workflow.yaml

# population four
grep -rn "iteration_mode" workflows/ src/ scripts/
grep -rn "run-loop" workflows/
```

The block extraction, the per-name declaration tally, the source-line spans and the two prose
measurements were taken with throwaway scripts. Their rules are stated in full in the sections
above, which is what makes each figure re-derivable: the convergence blocks are located by their
`id: assumption-convergence` line and closed at the first line indented no deeper than the opener;
declarations are read from each activity's `variables.writes[].name`; spans are the line range of a
top-level step from its `- ` opener to the line before the next; the prose counts apply the two
stated link rules to each file's `## Protocol` section.
