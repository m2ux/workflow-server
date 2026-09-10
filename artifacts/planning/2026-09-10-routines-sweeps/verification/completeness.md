# Three surfaces the sweep never opened, a stage nothing was assigned to, and a count the plan is keyed to that has since moved

A completeness pass over the fifteen documents in
[2026-09-10-routines-sweeps](../) — three ground-truth records, six sweeps, six verifications — held
against the ROUTINES proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). It does not re-argue a verdict.
It asks what the sweep did not reach, and answers each question by going to the repository rather
than by reading the folder.

Every figure below was taken here. Where it disagrees with a document in the folder, both figures are
given and the file:line that settles it is named.

## The tree this was measured against

Server tooling is at `ee95e4cd` on `main`, **23 commits past the `9ca71c19`** the six sweeps declare.
The corpus submodule is at `a4a5d88b` on `workflows`, **28 commits past `2b8b7215`** and 14 past the
`26e79d8a` the verifications measured. Only `sweeps/stale-restatement.md` is pinned to this tree; it
declares `ee95e4cd` / `a4a5d88b` at its line 9.

What that movement did to the constituency, measured:

| Figure | At the sweeps' pin | Here |
|---|---|---|
| Activity YAML files | 122 | **132** |
| `workflow.yaml` files | 17 | **18** |
| Steps / technique / action / checkpoint / loop | 1003 / 672 / 162 / 115 / 54 | **1004 / 676 / 160 / 115 / 53** |
| Maximal shared windows (top level / nested) | 26 (21 / 5) | **24 (19 / 5)** |
| `meta/activities/patterns/` activity files | 5 | **3** |
| `orchestration-patterns::dispatch-workers` bind sites | 14 in 7 files | **11 in 5 files** |
| Activity files nothing validates | 5 of 122 | **3 of 132** |
| Registered guards | 40 | **40**, all passing in 3.4s |

Nothing in the design is built: `ls workflows/*/routines` reports no such file or directory, and
`src/schema/activity.schema.ts:167` still declares `StepSchema` over four members. Stage 5's whole
subject also stands untouched — `workflows/work-package/workflow.yaml:15` opens the single
`fragments` block and `:72` closes it (57 lines), and the eight reference steps are at the same eight
lines the ground truth names (`04-research.yaml:224` and `:243`,
`05-implementation-analysis.yaml:126` and `:145`, `07-assumptions-review.yaml:112` and `:130`,
`08-implement.yaml:202` and `:221`).

One thing improved on its own. `guard-obligations.md` records the walk-snapshot stamp as stale —
"it names `cc09d641` while the corpus checkout is at `2b8b7215`, and the parent's committed gitlink
is `a904da93`". Today `tests/e2e/__snapshots__/corpus-sha.json` names `2a9d07ee` and the committed
gitlink is `2a9d07ee`, so the pair the pull-request check compares
(`.github/actions/workflows-corpus:38-53`) agrees and only the working checkout is ahead.

---

## One. The surfaces nobody swept

The brief names nine candidate surfaces. Each was checked against all fifteen documents by searching
for the file paths and construct names that would have to appear if it had been read.

| Surface | Reached by | Verdict |
|---|---|---|
| Generated JSON schemas | `sweeps/docs-and-site.md` CV13, CV14, CV21; `verification/canon-rules.md` P10; `sweeps/server-code.md` CV16 | **Covered**, four independent readings |
| Delivery budget | `ground-truth/guard-obligations.md` § Two; `sweeps/server-code.md` CV15; `sweeps/design-itself.md` CV14 | **Covered** |
| Harness adapters | `ground-truth/guard-obligations.md` classifies `harness-adapter-set` risk "none — it reads variable values, not steps" | **Covered by classification.** No candidate, and the classification holds: `scripts/check-harness-adapter-set.ts` reads only technique markdown under `meta/techniques/harness-compat` |
| MCP schema-resource surface | `verification/docs-and-site.md` PD2 only | **Covered late**, and only in a verification |
| Tests | `sweeps/server-code.md` declares `src/`, `scripts/`, `tests/` as its surface | **Partial** — reached as grep scope, never as an obligation |
| The walker | `sweeps/server-code.md` CV7, CV8 name four `kind === 'loop'` sites in it | **Partial** — sites, not the construct |
| MCP tool descriptions | `sweeps/docs-and-site.md` measured the generated page only | **Not covered at source** |
| Test fixture corpora | nothing | **Not covered** |
| The session record | nothing | **Not covered** |

### The test fixture corpora — 23 synthetic workflow trees, 59 activity files, reached by nothing

`find tests scripts -name 'workflow.yaml'` returns **23** synthetic workflow roots and
`find tests scripts -path '*/activities/*' -name '*.yaml'` returns **59** fixture activity files:
fifteen trees under `tests/fixtures/fan-corpus/`, three under `tests/fixtures/fragments/`, four under
`tests/fixtures/variable-model/`, one under `tests/fixtures/message-binding/`. Ten test files consume
them, and four of the ten go through the real server —
`tests/variable-seeding.test.ts:100`, `tests/session-concurrency.test.ts:144` and
`tests/launched-workflow-completion.test.ts:126` all call
`createHarness({ workflowDir: resolve(import.meta.dirname, 'fixtures/variable-model') })`, so a
`routines/` discovery pass and a fifth `StepSchema` member reach these trees the day they land.

The word **"fixture" appears zero times in all thirteen records of the design folder**
(`grep -rc fixture` over `2026-09-03-routines/*.md` returns 0 for every file). In the fifteen sweep
documents `tests/fixtures` appears twice, and both are grep collisions rather than readings:
`sweeps/stale-restatement.md:108` excludes `tests/fixtures/fragments/alpha-fixture/workflow.yaml:9`
from a key count because the identifier `unused-fragment-gate` matches its literal, and
`verification/stale-restatement.md:131` says the same.

What that costs. `tests/fixtures/fragments/` is three workflow trees that exist only to exercise the
mechanism stage 5 retires; `sweeps/stale-restatement.md:133-134` puts
`scripts/check-fragments.ts`, `scripts/fragments-index.ts` "and their two test files" in the
45-path change list and never names the tree those tests read. And no stage names a fixture a
routines change would have to **add**: `tests/fixtures/fan-corpus/` holds fifteen trees for one graph
construct, which is the measured precedent for what a `kind: routine` member costs in fixtures, and
the plan budgets none of it. `ls tests/*.test.ts tests/e2e/*.test.ts` gives **91** test files, of
which **14** are guard tests, so 27 of the 40 registered guards have no paired unit test at all —
the twelve guards that would gain a `routines/` walk are drawn from a population where two-thirds are
tested only through `check:all`.

### The session record — 1,648 lines, and two identity surfaces, of which the design addresses one

`grep -rn "session.schema"` over the sweep folder returns **nothing**. `src/schema/session.schema.ts`
(338 lines), `src/utils/session/migration.ts` (414) and `src/utils/session/store.ts` (896) are read by
no document. The folder reaches the persisted state only through the loop vocabulary —
`ground-truth/stage-0-state.md:171-178` and `sweeps/docs-and-site.md` CV9 both measure
`loop_started`/`loop_iteration`/`loop_completed`/`loop_break` and `activeLoops` and find no writer.

The session record carries two identifiers materialisation moves, and they are not the same kind of
thing.

**The composed checkpoint key.** `checkpointResponses` (`src/schema/state.schema.ts:166`,
`src/schema/session.schema.ts:124`) is keyed on `${activity_id}-${checkpoint_id}`
(`src/tools/workflow-tools.ts:2069`), parsed back at `src/utils/validation.ts:91-96`. The design
addresses this at README:1130-1137 and accepts it: "a run that crosses the migration finds no recorded
answer for a renamed gate and asks again … **This is accepted and stated rather than mechanised.**"

**The positional step index.** `currentStep` and `completedSteps` are keyed on
`StepIndex = z.number().int().min(1)` (`src/schema/state.schema.ts:4`, `:163`, `:165`) — a position,
not a name. Materialisation splices N steps in place of one, so every index after a reference site
shifts. The design says nothing about it, and neither does any sweep. The mitigating fact, which
belongs in the record rather than being left to be rediscovered: both fields are **vestigial**. A
grep for `currentStep:` and `completedSteps:` across `src/` returns only the two declarations and one
initialiser (`src/schema/state.schema.ts:216`, `scripts/generate-session-token.ts:175`) — the same
no-writer position `activeLoops` is in. So this is a KEEP with a discriminator, not a defect, and it
is worth stating because the discriminator is the only thing that makes it one.

One argument the design makes against an absence that is not an absence. README:1135-1137 declines a
key mapping because "a key-mapping table would be permanent server cruft for a one-off rename."
`src/utils/session/migration.ts:219-238` already normalises legacy checkpoint-response keys, and its
own comment says "key prefixing is best-effort (we use the legacy key verbatim when activity is
unknown)". The mechanism the design rejects as new cruft is a mechanism the tree has.

### The walker — the promised entry has no entry point, and its step-kind union is compiler-enforced and unchecked

`tests/e2e/walker.ts` is 1,045 lines. README:1196-1200 promises: "The walker gains a routine-level
entry: it walks a routine's steps against a variable set seeded from its declared inputs, so every
option of every gate inside it is exercised once rather than only through whichever host activities a
walk happens to reach."

Two facts nobody measured.

`walk()` at `tests/e2e/walker.ts:680` takes `(harness, workflowId, policy, opts)` and its first two
acts are `start_session` with `{ workflow_id, agent_id: 'e2e-walker' }` (`:690-693`) and
`get_workflow` with the returned `session_index` (`:699`). Everything downstream reads
`ActivityDef` (`:86-94`), which requires `id` and carries `exits`, `techniques` and `artifactPrefix`.
A routine is "not a transition destination, never a workflow's first or last node" (README:745-748)
and declares no exits, so there is no session it can be the subject of. The routine-level entry is a
second walker, not an option on this one, and no stage budgets it. This is the same shape
`sweeps/server-code.md` CV12 found for `deriveActivityContract` — a checker typed to an activity — one
layer out, and the folder draws the parallel nowhere.

`StepDef.kind` at `tests/e2e/walker.ts:68` is `'technique' | 'action' | 'checkpoint' | 'loop'`, a
closed union the compiler enforces, with a doc comment restating the four at `:67`. It is the only
compiler-enforced four-kind enumeration in the repository, and it sits outside the typecheck:
`tsconfig.json` sets `"include": ["src/**/*"]`, so adding a fifth kind produces no error there.
Neither enumeration count in the folder reaches it. `sweeps/canon-rules.md` CR11 grepped markdown
only and found eleven; `verification/canon-rules.md` P10 extended the same pattern over `src/`,
`scripts/` and `schemas/*.json` and found four more (`src/resources/schema-resources.ts:7`,
`scripts/generate-schemas.ts:29`, `schemas/activity.schema.json:4`,
`src/schema/activity.schema.ts:296`) — and stopped short of `tests/`.
`sweeps/docs-and-site.md` CV13's seventeen are documentation surfaces. **The enumeration set is
sixteen sites, not eleven and not fifteen**, and the sixteenth is the only one a compiler could have
caught and cannot.

### The MCP tool descriptions

`src/tools/workflow-tools.ts` declares seventeen tools with hand-written English descriptions.
`sweeps/docs-and-site.md:919-925` measured the generated page —
`grep -cn "loop\|fragment" site/api/tools.html` returns 0 — and concluded "the generated tool
reference carries nothing this sweep falsifies". The source is a different answer. `get_activity`'s
description at `src/tools/workflow-tools.ts:1346` already narrates the graph fan: "Name it with
`activity_id`, activity and instance together where the graph runs one activity once per element of a
collection." So this surface **is** maintained when a construct lands, which is evidence that a
routines change owes an edit here, and no stage names it. `next_activity` at `:926` describes the
optional step manifests a routine's prefixed ids change, and `resume_checkpoint` at `:2218` describes
the resolved-checkpoint payload keyed on the renamed gate.

---

## Two. A verdict resting on a fact nobody measured

Several verdicts rest on figures re-taken two and three times. One rests on a number every document
in the folder took at a superseded revision, and it is the number the plan is most keyed to.

**Stage 1's acceptance criterion is pinned to the window count, and the window count has moved.**
The criterion at README:824-825 reads: "It recurses into loop bodies. The search in `measure/` finds
26 maximal windows, five of them nested, and the guard reproduces that count." Stages 6 and 8 then
grade convergence by that baseline falling and by nothing else — README:906-907 and README:941-942.

Every reproduction of 26 in the folder was taken at `2b8b7215`:
`ground-truth/fragment-mechanism.md:180-193`, `sweeps/corpus-vocabulary.md:345-349`,
`verification/canon-rules.md:46`, `verification/corpus-vocabulary.md:52-54`. The verifications ran
the whole census again at the live tree — `verification/corpus-vocabulary.md:55-59` gives "128 files,
633 declarations, 85 shared bodies, 242 copies, 38.2%, and eleven `dispatch-workers` sites" — and did
not re-run the window search there. `sweeps/design-itself.md` CV12 declared the stored-baseline
*mechanism* stale and never questioned the *count*.

Run at the tree:

```
python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py
activity files parsed: 132
maximal shared windows: 24  (top level 19, inside a loop body 5)
```

**24 windows, 19 top level, 5 nested.** The criterion as written cannot be satisfied: a guard that
reproduces 26 over this corpus is wrong, and a guard that reports 24 fails the criterion. The nested
count is the half that held, which is why the drift is easy to miss. Two top-level windows have gone
with the two deleted pattern activities and with the substrate dispatch site the graph fan absorbed.
The measurement that settles it is the command above, re-run at whatever revision stage 1 lands
against, with the criterion restated as "reproduces the count the search reports at the revision the
guard lands" rather than as a literal.

Two more verdicts rested on single readings and both survive the re-take.

`ground-truth/guard-obligations.md` class (c) concludes "**8 surfaces, 0 entries at risk**", and the
whole two-branch hazard argument rests on it — "a corpus pull request cannot edit a ledger on `main`
… Measured above: zero entries in any of the eight name a site the migration renames, so this hazard
does not fire." One throwaway script, run once. Re-taken by serialising each entry and testing it
against every stage-5 through stage-8 site path and activity id: `scripts/binding-fidelity-triage.json`
0 of 70, `workflows/section-framing-triage.json` 4 of 102, `scripts/canonical-home-map-triage.json`
0 of 4, `scripts/nested-output-home-triage.json` 0 of 2. The four section-framing hits are
`work-package/resources/codebase-comprehension.md`, `implementation-analysis.md`,
`knowledge-base-research.md` and `research-reconciliation.md` — all `<workflow>/resources/*.md`
prose, which is the exemption the ground truth reasoned from. **The verdict holds**, and the
binding-fidelity ledger now holds 70 entries rather than the 72 it records.

`ground-truth/guard-obligations.md` class (b) concludes "**Stages 7 and 8 move no gate at all**",
and sized it on five files, two of which the corpus has since deleted. Re-taken on the survivors:
`grep -c "kind: checkpoint"` gives 0 at `meta/activities/patterns/02-supervisor.yaml`, 0 at
`05-lead-researcher.yaml`, and 0 at each of `prism/activities/02-adversarial-pass.yaml`,
`03-synthesis-pass.yaml` and `05-behavioral-synthesis-pass.yaml`. **The verdict holds.** One
adjacency worth recording: `meta/activities/patterns/03-plan-and-execute.yaml` declares **one**
checkpoint, and it is the one pattern activity no document in either folder names.

---

## Three. Counts with one reading behind them

Figures stated once anywhere in the folder, with no second reading. Fourteen of the sixteen are
`ground-truth/guard-obligations.md`'s, which is the document the other five sweeps cite rather than
re-measure.

| Figure | Stated at | Second reading |
|---|---|---|
| 113 option keys in 3 groups (90 / 16 / 7), 12 naming a stage-5 gate | `guard-obligations.md` § One | none — `docs-and-site.md` PD4 restates it citing the same source |
| 96 occurrences of the three convergence step ids in the walk snapshot (34 / 31 / 31) | `guard-obligations.md` § Two | none |
| 8 recorded-verdict surfaces, 0 entries at risk | `guard-obligations.md` class (c) | none |
| 285 distinct declared option keys | `guard-obligations.md` § Counts | none |
| 113 distinct declared checkpoints | `guard-obligations.md` § Counts | none |
| 22 checkpoint occurrences inside a loop body | `guard-obligations.md` § Counts | none |
| 102 entries in `workflows/section-framing-triage.json` | `guard-obligations.md` | none |
| 72 entries collapsing to 70 distinct keys in `binding-fidelity-triage.json` | `guard-obligations.md` | partial — `docs-and-site.md` cites 72 against `docs/development.md`'s 69 |
| 7,699 lines across the 40 registered scripts | `guard-obligations.md` | none |
| 15 corpus paths pinned in TypeScript (5 / 5 / 12 skipped) | `guard-obligations.md` | none |
| `DRY_WALKS` 50, and 36 the lowest value that clears `workflow-design` | `guard-obligations.md` § One | none |
| 1,421,070 delivered characters, `get_activity` 685,563 of them | `guard-obligations.md` § Two | partial — `design-itself.md` CV14 reads the same file |
| "333 links across 116 files" under the imperative rule | `corpus-vocabulary.md` CV25 | none — `verification/corpus-vocabulary.md` PD11 could not re-derive it and got 169 across 76 |
| 413 technique-step input bindings: 346 bare, 61 braced, 6 non-string | `design-itself.md` CV7 | none |
| 24 (filename, activity) pairs at 11 activity files declaring one artifact twice | `design-itself.md` CV1 | none |
| "Nineteen candidates" | `sweeps/design-itself.md:14` | none, and its own verdict table at `:32-52` carries **twenty** rows, CV1 through CV20; `verification/design-itself.md:1` uses twenty |

The three carrying the most weight are the three the migration would be graded by. All three were
re-taken above; two reproduce and one has moved:

- **113 / 12** reproduces exactly. `tests/e2e/option-coverage.json` holds three groups of 90, 16 and
  7, and twelve keys name the four batch gates — three options each at
  `research:research-assumption-interview`,
  `implementation-analysis:analysis-assumption-interview`,
  `implement:implementation-assumption-interview` and
  `assumptions-review:residual-assumption-batch`.
- **96 (34 / 31 / 31)** reproduces exactly against
  `tests/e2e/__snapshots__/snapshot.test.ts.snap`.
- **8 surfaces / 0 at risk** reproduces, with the binding-fidelity ledger at **70** entries rather
  than 72.

Three lighter ones re-taken at the same time, so the record carries them: **285 declared option keys
is now 283**, **22 loop-body checkpoints reproduces**, and **7,699 script lines is now 7,769**.
`DRY_WALKS = 50` (`tests/e2e/option-coverage.test.ts:57`) and
`DEFAULT_MAX_REGRESSION_PCT = 1` (`scripts/run-token-benchmark.ts:175`) both reproduce, and the
option-coverage test's own comments still carry the three stale figures the ground truth flagged —
"276 options are taken, and of the 121 that are not" at `:27`, "50 covers 154 of 275 declared
options" at `:45`. **113 distinct declared checkpoints could not be reproduced from the stated rule**:
a parse of every `kind: checkpoint` node at any loop depth over all 132 activity files gives 115, and
115 is also what `ground-truth/stage-0-state.md` and `sweeps/corpus-vocabulary.md` CV3 report for the
same population, so the 113 is a different grain the document does not name.

---

## Four. The stage nothing was assigned to

Across the five sweeps that carry verdict tables there are **111 candidates** — 29 in
`corpus-vocabulary.md`, 24 in `canon-rules.md`, 21 in `docs-and-site.md`, 20 in `design-itself.md`,
17 in `server-code.md`. Tallied by the stage column:

| Stage | Candidates naming it |
|---|---|
| 0 | 10 |
| 1 | 3, every one inside a compound ("1 + 3", "1 / 4", "1, 6, 8") |
| **2** | **0** |
| 3 | 32 |
| 4 | 13 |
| 5 | 25 |
| 6 | 7 |
| 7 | 3 |
| 8 | 9 |
| none | 11 |

**Stage 2 is named twice in the whole folder, both in one paragraph of one document, and no candidate
anywhere is assigned to it.** `grep -rn "stage 2\|Stage 2\|stage-2"` returns
`sweeps/design-itself.md:997-998` and nothing else; the other fourteen documents never mention it.
That paragraph says: "Stage 2's first criterion — a recorded disposition per row — is the only
stage-2 criterion, and it survives the re-measurement with three rows now answerable as 'already
converged in the corpus'."

**The silence is not correct.** Stage 2's criteria (README:832-838) pin the population: "Each of the
census's **ten** differences carries a recorded disposition", and "The rows that change behaviour at
a live site name the site and the change — row 1 at two sites, rows 5 and 6 at two." Read against
what the folder itself measured, that population is wrong in three directions at once, and every
correction was charged to some other stage:

1. **Three of the ten converged in the corpus**, so three dispositions are answerable without a
   decision — `ground-truth/fragment-mechanism.md:228-245` rows 2, 8 and 9.
2. **An eleventh row exists.** `ground-truth/fragment-mechanism.md:240` records the site condition at
   `07-assumptions-review.yaml:131-135` as "a difference the census does not carry". It is still
   there — the only site condition on any of the eight reference steps.
   `sweeps/corpus-vocabulary.md` CV4 charged it to **stage 5** as a REMOVE on the ground that removing
   it "changes no behaviour", and `verification/corpus-vocabulary.md` PD5 downgraded that to
   DEPRECATE precisely because it *is* a behaviour change with "no recorded decision". A recorded
   decision is stage 2's entire deliverable, and no document puts it there.
3. **A twelfth row exists.** `verification/corpus-vocabulary.md` PD4 found a seventh step position in
   the run that no record counts, varying three ways across the four hosts — its id
   (`present-resolved-assumptions` at three hosts against `present-residual-assumptions` at
   `07-assumptions-review.yaml:107`), its site gate, and whether it carries the `action: message`
   block that renders the value. That is a drift-census row by definition and it is filed as a
   boundary question instead.

So stage 2's criterion names ten rows where the folder's own measurements support twelve, three of
which need no decision and two of which have no owner. The measurement that would settle it is a
re-run of the census against `a4a5d88b` producing a row-by-row disposition table, and the cheapest
place to put it is stage 2, whose stated deliverable is exactly that table and whose criterion says
"No definition changes."

**Stage 1's silence is different and is defensible.** Stage 1 adds a guard and removes nothing, so no
REMOVE belongs to it. Its obligations do exist and are recorded under other stages' candidates:
`sweeps/canon-rules.md` CR21 says the catalogue entry for a repeated run should be written with the
guard, and `verification/canon-rules.md` P4 says the stage-1 guard's file set is the cheapest home
for the re-inlining comparison that loses its policeman at stage 5 — "cheaper written into stage 1
than retrofitted at stage 5". What stage 1 does not survive is its own count, which is section two
above.

---

## Five. Guards nobody classified, and three whose class the ground truth argues both ways

`ground-truth/guard-obligations.md` classifies all 40 registered guards into (a) second definition
directory, (b) content that changes, (c) ledger goes stale, (d) violated by construction, and
concludes "20 of 40 in the blast radius, 20 untouched". Two problems, both measurable.

### `check-message-binding` is in no class at all

`ls scripts/` matches **44** files against `^(check|validate)-.*\.ts$` and the registry holds 40, so
four are excused by name at `tests/guard-registry.test.ts:77-86`. Three of the four are runners or
need a live session. The fourth is a corpus guard: `scripts/check-message-binding.ts:98` opens
`join(root, workflow, 'activities')` and reads activity files directly. By the ground truth's own
definition of class (a) — "It reads activity files, and a routine body is an activity file's worth of
steps living somewhere else. Unless it walks `routines/` the rules it enforces stop applying to the
content that moved there" — it is class (a). It appears in no class, because the classification is
scoped to the registry, and the ground truth mentions it only to correct its recorded figure.

That figure is still wrong and the direction matters. `tests/guard-registry.test.ts:83` records the
guard as one that "holds at 107 findings the engine could not have avoided". Run here, it reports
**106**. The reconciliation that closes 44 scripts on disk against 40 registry entries reads the
reason string's existence and never its truth, so the number can drift indefinitely — the same defect
`sweeps/canon-rules.md` CR6 identifies for the registry's `proves` claims, on the same test file.

### Three guards are class (a) by the definition and absent from the list

The class (a) list has twelve members. It excludes `check-checkpoint-entry`, `check-decision-order`
and `check-review-mode-gating`, which sit in class (b) alone. All three read raw activity YAML
non-recursively, which is precisely (a): `scripts/check-checkpoint-entry.ts:39`,
`scripts/check-decision-order.ts:174`, `scripts/check-review-mode-gating.ts:198`.

The ground truth knows this and says so in a different section: "**none of
`check-checkpoint-entry`, `check-decision-order`, `check-review-mode-gating` or
`check-binding-fidelity` consumes the loader**", verified here — `grep -ln "loadWorkflowWithDiagnostics\|loadWorkflow("`
over `scripts/check-*.ts scripts/validate-*.ts` returns exactly five files:
`check-all-refs.ts`, `check-session-contract.ts`, `validate-workflow-yaml.ts`,
`check-activity-variables.ts`, `check-stealth-isolation.ts`. So the document proves the four read the
authored form and then leaves three of them out of the class that describes the authored form. The
class (a) count is **15 of 40, not 12**, once `check-binding-fidelity` is counted as the ground truth
itself says it should be if it stays authored, and 16 counting `check-message-binding` outside the
registry.

`sweeps/design-itself.md` CV11 reached the sharpest half of this independently and filed it as a
misclassification of the proposal rather than of the risk class: `check-review-mode-gating` exempts a
mode-aware checkpoint by matching the literal `is_review_mode` in a step's `when` or condition, and
inside a routine that name would be an input id, so the guard is blind on both counts. That is a
coverage loss with a mechanism, and it belongs in a class.

### One guard whose (d) status two documents assert and two deny

Recorded under section six, because it is a contradiction rather than a gap.

### One classification that holds, and is worth keeping

`check-resource-anchors` is the ground truth's "one guard that reaches `routines/` for free, needing
no change at all". Verified: `walkFiles` at `scripts/check-resource-anchors.ts:72-80` recurses into
every directory except `.git` and `node_modules` and yields every `.md` and `.yaml`. A
`routines/*.yaml` file arrives in its scan the day the directory exists.

---

## Six. Where two documents disagree

Five disagreements between documents in this folder. Each is settled here against the repository.

### `check-activity-variables` · `undeclared-use` at stage 3 — three documents against two

`ground-truth/guard-obligations.md:165-180` makes it class (d) instance 2, "the sharpest, and
unnamed", firing "at **stage 3**, the moment materialisation splices anything, with no column move
and no unscoped work in front of it", with "the mechanism … unspecified".
`verification/canon-rules.md` P8 repeats it verbatim as a plan defect the design owes.
`sweeps/design-itself.md` CV4 says it does not fire, and `verification/design-itself.md:407-415`
confirms that reading.

**The repository supports the design-itself reading.** `read` at
`src/utils/activity-variables.ts:449-457` returns at `:452` for any name outside the declared
namespace, adding it to `mentions` and nothing else; `write` at `:474-481` adds to `writes` only
inside the namespace (`:475`). `undeclared-use` iterates `record.derived.reads` at
`scripts/check-activity-variables.ts:210` and `record.derived.writes` / `memberWrites` at `:220`,
both namespace-filtered, so a prefixed internal reaches neither. `undeclared-crossing` at `:236-247`
does read the wider `produces`, but skips any name with no consumer elsewhere —
`if (consumers.length === 0) continue` at `:243` — and a name carrying its host activity and
reference site has no consumer elsewhere by construction. The namespace at `:126-129` is assembled
from the declarations, which is what makes the filter total.

So the unspecified mechanism the ground truth asks for is already in the tree and is neither of the
two candidates it names. **Verdict: WITHDRAWN.** Class (d) has three instances, not four, and the
blast-radius arithmetic that reads "(d) adds no guard the other two do not already hold" is
unaffected.

Worth carrying, because it is the live half of the same question: `unused-declaration` at
`scripts/check-activity-variables.ts:257-266` fires when a declared write "no step produces", hard
zero with no ledger. That is the rule the seventh `challenge_findings` declaration lands on, which is
`verification/corpus-vocabulary.md` PD2 and `verification/docs-and-site.md` PD3. Re-measured here:
`grep -rn "name: challenge_findings" --include=*.yaml workflows/` returns **seven** —
`02-design-philosophy.yaml:23`, `04-research.yaml:29`, `05-implementation-analysis.yaml:31`,
`06-plan-prepare.yaml:34`, `07-assumptions-review.yaml:34`, `08-implement.yaml:32`,
`15-codebase-comprehension.yaml:22` — against README:905's six.

### Five generated schemas or six

`ground-truth/guard-obligations.md` § Two: "`schemas/` holds **6** generated JSON schemas, written by
`scripts/generate-schemas.ts` (`:20`)", and `sweeps/design-itself.md`'s reproduced-without-change list
repeats "6 generated JSON schemas". `sweeps/server-code.md` CV16, `sweeps/docs-and-site.md` CV21 and
`verification/canon-rules.md` P10 all say five generated plus one hand-authored.

**The repository says five.** `grep -c "^generate(" scripts/generate-schemas.ts` returns 5;
`ls schemas/*.schema.json | wc -l` returns 6. `schemas/technique.schema.json:2` carries an `$id`,
and the generator's fixed preamble at `scripts/generate-schemas.ts:20` never emits one. The
consequence the two documents that say six cannot see is
`verification/docs-and-site.md` PD1's: a verifying generator built over the directory is permanently
red on a file the change does not touch.

### Which commit deleted `01-orchestrator-workers.yaml`

`verification/canon-rules.md:56-58` attributes the deletion to `f6cb1dc2` ("Retire the pattern
activity the graph fan replaces"). `verification/corpus-vocabulary.md:39-42` attributes it to
`67ac93f0` with the same subject line.

**`67ac93f0` is the deletion.** `git -C workflows log --diff-filter=D` over the two pattern paths
returns `b5471e45` for `04-isolated-fan-out.yaml` and `67ac93f0` for `01-orchestrator-workers.yaml`.
`f6cb1dc2` exists and is a different commit — "Point the corpus at the retired orchestrator-workers
pattern", the follow-up that repaired the references. The right SHA against the right subject matters
here because both verifications tell a stage-8 planner to re-derive against these commits.

### Thirteen commits or fourteen

`verification/canon-rules.md:50` says the corpus is "at `26e79d8a`, thirteen commits past
`2b8b7215`". `verification/corpus-vocabulary.md:36` and `verification/docs-and-site.md:9-10` say
fourteen. `git log --oneline 2b8b7215..26e79d8a | wc -l` returns **14**. The same document also gives
the server as "thirteen commits ahead" of `9ca71c19` at `c1c9682d`, which reproduces.

### The hazard `ref-opens-step` polices — already settled inside the folder, recorded so it is not re-opened

`sweeps/canon-rules.md` CR1 concludes "**The hazard is discharged by the closed object, not by a
rule**". `ground-truth/fragment-mechanism.md:148-154` concludes "The rule count falls by one; the
hazard does not". `verification/canon-rules.md` P3 sides with the ground truth and shows why: a step
written `- routine:` first with `kind:` and `id:` on later lines carries its id and loads, because
`populateStepIds` "throws when `step.id` is absent; it cannot see field order".

Verified: `src/schema/activity.schema.ts:198-204` throws only when `!step.id`, and
`injectResolvedStepIds` at `:234-243` rewrites `- technique:` openers alone. So CR1 is right about
the reference step needing an explicit id and wrong that field order is thereby constrained. The
folder has settled this correctly; it is listed because CR1's sentence is the one an implementer
reading the sweep rather than the verification will act on.

---

## The three things I would do first

**One. Re-run the window search and re-write stage 1's criterion, before anything is built.**
`python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py` reports 24
windows, 19 top level and 5 nested, over 132 activity files. README:824-825 requires the guard to
reproduce 26 with five nested, and README:906-907 and README:941-942 make that baseline falling the
only mechanical evidence that stages 6 and 8 converged. The criterion has to name the search rather
than a literal, and the same edit should widen the guard's file set to `routines/` with a declaration
counting as a site, which is `verification/canon-rules.md` P4's fix arriving one stage earlier than
it asks.

**Two. Write the stage-2 disposition table, at twelve rows.** Stage 2 has no candidate in 111 and two
mentions in fifteen documents, and its criterion pins ten census rows. The folder has measured
twelve: the census's ten, minus the three that converged in the corpus, plus the site condition at
`07-assumptions-review.yaml:131-135` and the seventh step position
`verification/corpus-vocabulary.md` PD4 found. Two of those twelve are behaviour changes at live
sites with no recorded decision, which is the one thing stage 2 exists to produce, and both are
currently filed as stage-5 removals.

**Three. Sweep the three surfaces nobody opened, and size them before stage 3.** The test fixture
corpora — 23 synthetic workflow trees and 59 activity files, four consumed through the real loader,
with `tests/fixtures/fragments/`'s three trees retiring at stage 5 and no budget anywhere for the
fixtures a `kind: routine` member needs. The session record — `src/schema/session.schema.ts` plus
`src/utils/session/*`, 1,648 lines, read by no document, where `completedSteps` and `currentStep` are
positional and the design's stated reason for declining a key mapping is contradicted by
`src/utils/session/migration.ts:219-238`. And the walker — where the promised routine-level entry has
no entry point, because `walk()` at `tests/e2e/walker.ts:680` starts from `start_session` and a
routine is not a workflow node, and where `StepDef.kind` at `:68` is the one compiler-enforced
four-kind union in the repository and sits outside `tsconfig.json`'s `include`.
