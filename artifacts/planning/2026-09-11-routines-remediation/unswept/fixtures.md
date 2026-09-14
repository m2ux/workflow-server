# The test fixture corpora, and what a fifth step kind costs in them

> Item 11a · a sweep of the one surface no record in either planning folder reaches · measured at
> server `fe5f5f78` and corpus `e9d26007`, 92 server commits past the completeness pass's `ee95e4cd`

The test suite does not only read the corpus. Beside the eighteen workflow definitions on the
corpus tree sits a second body of workflow definitions, written by hand, living under
`tests/fixtures`, and handed to the real server as though it were the corpus. There are **28** of
these synthetic workflow trees carrying **68** activity files — more trees than the corpus has
workflows, and about half as many activity files as the corpus has — and the routines proposal
names none of them. The word *fixture* appears **zero** times in all thirteen of its records.

A `routines/` discovery pass runs wherever the loader discovers an `activities/` directory, and a
fifth member on the step union changes what every activity file in the repository is allowed to
contain. Both reach all 28 trees on the day they land. This document measures that surface, prices
it against the one construct in the repository that has already paid the bill, and says what the
plan owes.

**Three findings drive everything below.**

First, **the engine's continuous integration has no corpus at all.** `.github/workflows/verify.yml:28`
checks out with `submodules: false` and never provisions a workflows worktree, so
`liveCorpusRoot()` returns null and 36 `skipIf` sites across 28 test files stand down. Every
workflow definition that the engine's own CI loads is a fixture. So is the delivery-cost gate, and
so is the container smoke test in `docker-publish.yml`. The fixture corpora are not a sideline to
the corpus — on CI they are the whole definition surface.

Second, **a fifth step kind does not fail a load; it drops an activity.** Measured, not argued:
`tests/fixtures/fragments/beta-fixture` carries a step whose discriminator the schema refuses, and
`loadWorkflow` returns `success` with an activity count of **zero**. The invalid activity is logged
as a warning and skipped at `src/loaders/workflow-loader.ts:88-93`; the workflow still resolves at
line 388. Stage 3's criterion that "every terminal state of the reference lifecycle but `Checked`
fails the load" names a behaviour the loader does not currently have for anything the activity
schema rejects.

Third, **the fan put its legal shapes in committed fixture trees and its illegal shapes nowhere
near them.** Seventeen trees hold the forms that load; 31 illegal forms live in temporary
directories written inline by one 740-line test file. A construct materialised away at load
inherits the second half of that split and gets little use out of the first.

---

## One: the surface, root by root

`find tests scripts -name 'workflow.yaml'` returns **28** synthetic workflow roots and
`find tests scripts -path '*/activities/*' -name '*.yaml'` returns **68** fixture activity files.
`tests/fixtures` holds **124** files and **2,255** lines in total. There is no README anywhere under
it; every tree's purpose is stated, where it is stated at all, in the header comment of the test
that reads it.

The completeness pass's figures reproduce exactly at the revision it measured —
`git ls-tree -r ee95e4cd --name-only` filtered the same two ways returns **23** and **59**. Five
trees and nine activity files have landed since, across 92 commits.

### `tests/fixtures/fan-corpus` — 17 trees, 79 files, 1,290 lines

The largest fixture root in the repository, and the measured precedent for a new construct. Six
trees are asserted *clean* by the guard test, seven carry an engineered defect the guard must
report, and four exist for a single behaviour each.

| Tree | What it exists to prove | Consumed by |
|---|---|---|
| `list-fan-fixture` | A destination naming two activities, converging on the meeting point their own exits name | real server, real loader, guard |
| `instance-fan-fixture` | A destination naming one activity and the collection to run it over, one worker per element | real server, real loader, guard |
| `mixed-fan-fixture` | A list whose members are part different activities and part repeats of one | real server, guard |
| `chained-fan-fixture` | A fan whose collection is an earlier fan's container — the read exempt from the bare-container rule | guard |
| `gather-fixture` | The container read whole | guard |
| `templated-artifact-fixture` | An instance-fanned activity whose artifact name carries the fan parameter as a token | guard |
| `wide-fan-fixture` | An instance fan declaring a ceiling above the server's own, to prove which of the two bounds decides | real server |
| `dotted-fan-fixture` | An instance fan whose collection is reached at a path into a named object | real server |
| `two-fans-same-activity-fixture` | Two sequential instance fans of one activity, each over its own collection | real server |
| `meta` | A two-file shared home so the transient-bootstrap path works against this root at all | real server |
| `bare-read-fixture` | A container read with no write behind it → `unwritten-read` | guard |
| `missing-member-fixture` | A member read the branch never writes → `unwritten-read` | guard |
| `no-index-fixture` | A container read omitting the index, so it addresses nothing → `unwritten-read` | guard |
| `ungathered-fixture` | A container written and never read → `unread-write` | guard |
| `stray-parameter-fixture` | A per-instance parameter read outside the fan → `unwritten-read` | guard |
| `collision-list-fixture` | Two list branches whose composed signatures resolve one literal artifact filename | guard |
| `collision-instance-fixture` | An instance-fanned activity whose artifact name does not interpolate the fan parameter | guard |

Every one of the seventeen loads clean through `loadWorkflow`. The seven defects are guard findings,
not load failures — a distinction that decides what a routines fixture root can and cannot be, and
section four returns to it.

The root carries drift of its own. Six of the seventeen `workflow.yaml` files —
`bare-read`, `gather`, `missing-member`, `no-index`, `stray-parameter` and `ungathered` — share one
byte-identical `description:` line, "A correct fan of each form with a gather-bound meeting point,
plus the collision arms", which describes none of them. A tree's purpose is recoverable only from
the assertions in `tests/fan-container-guard.test.ts`.

### `tests/fixtures/fragments` — 3 trees, 6 files, 100 lines

The trees for the mechanism stage 5 retires. `alpha-fixture` declares the `fragments:` block and is
the referenced workflow; `beta-fixture` references it and carries every defect; `gamma-fixture`
authors one checkpoint body inline at two sites. Section three prices what stage 5 does to them, and
the answer is not "delete".

### `tests/fixtures/variable-model` — 4 trees, 9 files, 129 lines

`bare-fixture` declares variables with no defaults so nothing seeds; `seed-fixture` exercises
`defaultValue` seeding and `setVariable` type validation across two activities; `child-fixture` is a
child workflow whose own defaults must seed the embedded child bag; `meta` is the bootstrap home.
This is the root handed to the real MCP server most often — four test files start a harness on it.

### `tests/fixtures/message-binding` — 1 tree, 4 files, 116 lines

Three activities covering the bound and unbound cases a user-facing message can reach. Read only by
`guards/check-message-binding.ts`, and **this tree does not load**: `loadWorkflow` on it fails with
"checkpoint 'cites-own-output' option 'revise' selects exit 'revise', which the activity does not
declare." Nothing notices, because nothing loads it.

### `tests/fixtures/markdown-techniques` — 2 trees, 12 files, 186 lines

`meta` and `work-package`, holding only `techniques/` — no `activities/`, and both fail
`loadWorkflow` with `initialActivity: Required`. They exist so the technique loader has content
addressed the way the corpus addresses it, including a deliberately malformed operation under
`work-package/techniques/malformed-ops/`.

### `tests/fixtures/token-bench` — 1 tree, 3 files, 36 lines

`delivery-fixture`, a linear two-activity walk, and the newest tree of the six roots. It is the
subject of the delivery-cost gate: `.github/workflows/verify.yml:53-54` points `WORKFLOWS_DIR` at
this root and compares characters delivered against `tests/fixtures/token-benchmark-baseline.json`,
failing at a 1% regression. `.github/workflows/docker-publish.yml:53,65` points the built container
at the same root for both transport smoke tests.

### Three fixture roots that are not workflow trees

`legacy-session` (a pre-migration `workflow-state.json` and a token, read by `migration.test.ts` and
two cases in `mcp-server.test.ts`), `inspect-session` (a Python script the server shells out to), and
`run-profile` (six recorded run transcripts). A routines change reaches none of these directly. It
reaches `legacy-session` only if materialisation moves the positional step keys a stored session
holds — which is the session-record sweep's subject, not this one.

---

## Two: how each root is consumed, and by what

**18** test files read something under `tests/fixtures` at `fe5f5f78`, up from **13** at `ee95e4cd`.
Restricted to the ones reading a *workflow tree* rather than a session or a transcript, the figure
is **15**, up from **10** — and ten is exactly the completeness pass's count, so that figure
reproduces under the reading it intended.

Four consumption paths exist, and they differ in what a routine would be visible to.

**Through the real MCP server.** Nine test files start a harness on a committed fixture root, across
eleven call sites: `tests/e2e/fan-walk.test.ts:21`, `tests/fan-ceiling.test.ts:18`,
`tests/fan-exit-destinations.test.ts:16`, `tests/fan-identity.test.ts:16`,
`tests/fan-projection.test.ts:15`, `tests/launched-workflow-completion.test.ts:126`,
`tests/server-owned-session-setup.test.ts:52` and `:355`, `tests/session-concurrency.test.ts:144`,
and `tests/variable-seeding.test.ts:100` and `:529`. A tenth,
`tests/http-transport.test.ts:15`, builds a server config on `tests/fixtures/token-bench` whenever
no live corpus is present. These see a routine only after materialisation has removed it.

*A correction the completeness pass owes.* It records "four of the ten go through the real server"
and names three sites. Re-measured at its own revision with
`git grep -n "createHarness({ workflowDir" ee95e4cd -- tests`, the count is **five** test files over
**six** call sites — `e2e/fan-walk`, `fan-ceiling`, `launched-workflow-completion`,
`session-concurrency`, and `variable-seeding` twice. The figure was one low when it was written and
is five low now.

**Through the real loader, without the server.** `tests/fan-graph-readers.test.ts:26` calls
`loadWorkflow(FAN_CORPUS, id)` directly for two trees. Same visibility as above: post-materialisation.

**Through a guard, reading raw YAML.** `tests/fan-container-guard.test.ts:18` runs
`collectFindings` from `guards/check-activity-variables.ts` over the whole fan root;
`tests/fragments-guard.test.ts:15` runs `collectFragmentViolations` over the fragments root;
`tests/message-binding.test.ts:13` runs `collectFindings` over the message-binding root. These read
the authored file and therefore **do** see a routine reference, and they are the only consumers that
ever will.

**Through the technique loader.** `tests/technique-loader.test.ts:13` addresses
`tests/fixtures/markdown-techniques` with `readTechnique`, `composeTechnique` and
`resolveTechniques`, never through `loadWorkflow`.

**Through the benchmark.** `scripts/run-token-benchmark.ts` walks `token-bench/delivery-fixture`
with the real server and diffs delivered characters against the committed baseline.

That the fan root serves both a real server and a raw-reading guard is the single most useful fact
here: `check-activity-variables` is precisely the guard stage 4 requires to "resolve a routine's
effects against the routine's declared outputs and internals", and the fan has already demonstrated
that one fixture root can serve it and a harness at once.

### What the guard suite cannot see

Guards resolve their corpus through `requireWorkflowsRoot` in `guards/workflows-root.ts`, whose
precedence is `--root` > `WORKFLOWS_DIR` > `.worktrees/workflows` of the primary checkout. No
registered guard is ever pointed at `tests/fixtures` by `check:all`. Grepping `guards/` and
`package.json` for `tests/fixtures` returns nothing. So a fixture tree is invisible to all 41
registered guards unless a test hands the guard's collector the path itself — which three tests do.

The consequence is plain and it is what makes fixtures a viable home for illegal forms: **the
corpus must pass every guard and the loader; a fixture tree must pass only whatever its own test
asks of it.** `message-binding/binding-fixture` proves the point by failing the load today.

---

## Three: the trees that exist for the mechanism stage 5 retires

`tests/fixtures/fragments` is three trees, six files, 100 lines, with exactly one consumer —
`tests/fragments-guard.test.ts`, 58 lines. No fragment reference exists in any other fixture tree.
The resolver's own unit test, `tests/fragment-resolver.test.ts` (246 lines), builds its cases as
inline objects and reads the live corpus when one is present; it owns no fixture.

Running the guard over the root returns **8** violations, which is the number its test pins:

| Rule | Site | Stage 5 |
|---|---|---|
| `ref-opens-step` | `beta-fixture/activities/00-beta-activity.yaml` | retires |
| `ref-body-conflict` | `beta-fixture/activities/00-beta-activity.yaml` | retires |
| `undeclared-effect-variable` | `beta-fixture/activities/00-beta-activity.yaml` | retires |
| `unresolved-ref` | `beta-fixture/activities/00-beta-activity.yaml` | retires |
| `unused-fragment` | `alpha-fixture/workflow.yaml` | retires |
| `duplicate-rule` | `alpha-fixture/workflow.yaml` | **survives** |
| `duplicate-rule` | `beta-fixture/workflow.yaml` | **survives** |
| `duplicate-checkpoint` | `gamma-fixture/activities/00-gamma-activity.yaml` | **survives** |

**So no tree here is a whole deletion, and the sweep folder's framing needs one correction.** Each
of the three trees carries exactly one finding for a rule that outlives the mechanism. What stage 5
removes is a set of *blocks*, not directories:

- `alpha-fixture/workflow.yaml` lines 7–31 — the `fragments:` block, 25 of the file's 37 lines. Its
  `rules:` block at lines 4–6 stays, because it is one half of a `duplicate-rule` pair.
- `alpha-fixture/activities/00-alpha-activity.yaml`, all 7 lines — its only step is
  `ref: confirm-gate`.
- `beta-fixture/activities/00-beta-activity.yaml`, all 16 lines — four of the four retiring
  reference-side rules. Its manifest stays, carrying both duplicated rule texts.
- `gamma-fixture` is untouched.

Net: **48 of 100 lines**, two of six files, and zero of three directories. The guard test's closing
assertion that the root "reports nothing beyond the engineered defects" at 8 violations has to be
re-derived to 3, and the two surviving trees have to keep loading with zero activities each — which
they will, per the drop-and-continue behaviour measured in section four.

Two of the guard's nine rules have no fixture coverage at all today: `malformed-ref` and
`inline-duplicate-of-fragment` fire on nothing in this root. Both are in the retiring seven, so the
gap closes by deletion rather than by being filled.

*A second correction.* `sweeps/stale-restatement.md:133-134` lists `scripts/check-fragments.ts`,
`scripts/fragments-index.ts`, `scripts/guards.ts` and "their two test files" in its 45-path change
list. All three now live under `guards/` (`git ls-tree -r ee95e4cd` shows them at `scripts/`, and
`git ls-tree -r HEAD` at `guards/`), and the list still names no fixture tree. The same paragraph's
"three committed baselines stage 5 re-records" includes one that moved into this surface: commit
`76d76e21` deleted `scripts/fixtures/token-benchmark-baseline.json` and created
`tests/fixtures/token-benchmark-baseline.json` in the same change that created the `token-bench`
tree.

---

## Four: what a new step kind costs here — the graph fan, measured

The fan is the only construct in this repository to have been built since the fixture corpora took
their current shape, so it is the precedent, and it is recent enough to price exactly.

**The fixture root it added.** `tests/fixtures/fan-corpus`: **17** trees, **79** files, **1,290**
lines. It arrived across five commits between 2026-09-09 and 2026-09-11 — `be325d0f` (4 trees),
`4defd3cd` (10 trees), `c2d0a50b`, `ebeb4edb`, `d5b70434` (one each). At 1,290 lines it is **57%**
of everything under `tests/fixtures`.

**The tests it added.** Eleven files, **2,083** lines, in three distinct idioms:

| Idiom | Files | Lines | What it holds |
|---|---|---|---|
| Committed fixture root | 7 | 944 | Every *legal* fan shape, shared by a harness, the loader and a guard |
| Temporary trees written inline | 1 | 740 | Every *illegal* fan shape — 31 cases, 32 `loadErrors` calls |
| In-memory objects, no tree | 3 | 399 | Pure functions over a graph or a technique |

The 740-line file is `tests/fan-load-rules.test.ts`. It `mkdtempSync`es one root in `beforeAll`,
writes a whole workflow per case, loads it, and asserts on the message. Its own header states the
design: "The fan's shape rules, one test per rule. They live in the load and only there, so a
malformed fan cannot be walked at all." Not one of those 31 illegal shapes is a committed file.

### What the same shape costs for a construct materialised away at load

Four asymmetries change the answer, and each of them shifts cost from the committed root to the
inline one.

**A routine is not observable after the load, so the harness-facing half of the fan's root buys
less.** The fan's seventeen trees earn their keep because a loaded fan is still a fan — the harness
walks it, the graph readers read it, the guard finds it. Six test files assert on a fan through the
server or the loader, naming six of the seventeen trees between them — `instance-fan`, `list-fan`,
`mixed-fan`, `wide-fan`, `dotted-fan` and `two-fans-same-activity` — plus the shared `meta` every
harness bootstraps from. A loaded routine is a host
activity with substituted steps and prefixed identifiers, so a harness-facing assertion can only
inspect the substitution result. The two stage-3 criteria that need a harness —
the textual splicer emitting an explicit prefixed `id:` on every spliced step, and delivery being
byte-identical for an activity carrying no routine — are both properties of delivered bytes, which
is a walk rather than a file, and the second of them is already gated in CI against
`token-bench/delivery-fixture`.

**The population a fifth kind lands on is small and oddly shaped.** Across all 68 fixture activity
files there are **58** steps: 44 `action`, 8 `checkpoint`, 5 `technique`, and 1 with no `kind` at
all (the `ref-opens-step` defect). There are **zero** `loop` steps, and zero nesting of any kind.
So the fixture corpora contain no instance of the construct stage 0 landed `continueWhile` for, and
a routine that owns a loop — the whole justification for stage 0 standing alone — has no fixture
precedent to copy.

**The guards are the only readers that see a routine, and their fixtures are mostly not committed.**
Two guard fixture roots are committed (`fragments`, `message-binding`) and one is shared with the
harness (`fan-corpus`). Nine test files instead build a guard corpus in a temporary directory and
call `declareFixtureWorkflows` from `tests/corpus-fixture.ts` to make each directory discoverable:
`artifact-guides-guard`, `audience-guard`, `bootstrap-self-contained`, `branch-as-step-guard`,
`checkpoint-entry-guard`, `harness-adapter-set`, `loop-shape-guard`, `self-composed-set-guard`,
`set-action-values`. The helper they share, `writeWorkflowFixture` at `tests/corpus-fixture.ts:10-15`,
writes a three-line `workflow.yaml` and nothing else. Every authored-form guard that stage 4 sends to
walk `routines/` needs a routine in its fixture, so either that helper grows a routines writer or
nine call sites each write their own.

**The path rule that names a file's workflow does not know about routines.** `workflowIdFromCorpusPath`
at `src/loaders/corpus-index.ts:64-69` finds the owning workflow by looking for one of three reserved
directory names — `activities`, `resources`, `techniques`, declared at line 39. Measured directly:
`prism/activities/03-analyse.yaml` resolves to `prism`, and `prism/routines/fold.yaml` resolves to
`null`, as does `corpus/security/prism/routines/fold.yaml`. `citePath` in `guards/workflows-root.ts`
falls back to the raw relative path when that happens, so a guard finding sited on a routine would
be keyed by path rather than by workflow id — the exact thing the function's own doc comment says
the id-keyed site key exists to prevent. Adding `routines` to the reserved set is one line; not
adding it silently breaks every ledger site key that lands on a routine.

### The estimate

Priced against the fan and adjusted for those four differences: a committed root of **5 to 7** trees
rather than seventeen (a host with one reference, a host with two references to one routine, a
routine referencing a routine, a cross-workflow reference, a shared `meta`, and one or two carrying
an engineered defect for the guards); **one** inline-temp-tree test file in the shape of
`fan-load-rules`, carrying every terminal of the reference lifecycle, which the proposal's own
lifecycle section puts at four named states plus the `Malformed` terminal it lacks plus the
input/output collision the sweeps' defect 10 names; and a **routines writer** on
`tests/corpus-fixture.ts` plus routine content in however many of the nine temp-corpus guard tests
stage 4 actually changes. The committed root is smaller than the fan's; the inline file is not.

---

## Five: can an illegal routine form live in a fixture tree at all?

Yes, with three qualifications, and the qualifications are what decide where the work goes.

**A committed fixture tree may hold a form the loader refuses.** Nothing walks `tests/fixtures` but
the tests that name it, and `loadWorkflow` is called on a named id rather than on a root, so one
illegal tree beside legal ones is inert. `tests/fixtures/message-binding/binding-fixture` is the
standing proof: it fails `loadWorkflow` with an option selecting an undeclared exit, and it has
lived there being read by a guard that parses raw YAML. The same holds for
`tests/fixtures/markdown-techniques/meta` and `work-package`, both of which fail with
`initialActivity: Required`.

**But the form the routines plan most wants to assert on is not refused — it is dropped.** This is
the finding that matters most. `tests/fixtures/fragments/beta-fixture/activities/00-beta-activity.yaml`
carries a step with no `kind` field at line 16. The activity schema rejects it with
`invalid_union_discriminator`, expecting `'technique' | 'action' | 'checkpoint' | 'loop'`. The loader
logs "Skipping invalid activity", pushes a `DefinitionLoadError`, and **continues**
(`src/loaders/workflow-loader.ts:88-93`). The workflow then loads successfully with an activity count
of zero, and the dropped activity's id is still admitted as a known id for exit-binding validation at
line 382. A schema-level malformation of a routine reference — an unknown field, a `with` that is not
an object, a missing `routine:` — therefore produces a green load and a silently smaller workflow.

Stage 3's criterion is: *Every terminal state of the reference lifecycle but `Checked` fails the
load, with a message naming the routine, the reference site and the reason. None is a warning.*
Against the measured loader, half that sentence describes a change nobody has costed. The terminals
reachable by *resolution* (unresolved, cyclic, unbound, overbound) can fail the load because the
resolver runs after the activity validates. The terminals reachable by *shape* cannot, because the
activity never reaches the resolver. Either the criterion is scoped to resolution terminals, or the
plan buys a change to drop-and-continue — which is a behaviour change affecting every activity in
the repository, not a routines feature, and no stage names it.

**A guard fixture and a load fixture cannot be the same tree.** The three committed guard roots are
read raw, so an illegal form in them is the *subject*. The harness roots are loaded, so an illegal
form in them is either invisible (dropped) or fatal to every test in the file. The fan resolved this
by keeping the two apart — seventeen legal trees in one root, 31 illegal ones in `mkdtemp`. A
routines landing has the same constraint and less room, because its guard fixtures and its load
fixtures want the *same* construct at the same site.

**A temporary tree is invisible to everything except the assertion beside it.** Forty test files call
`mkdtempSync`. Nothing in `check:all` walks `/tmp`; nothing regenerates a schema against it; no
coverage walk reaches it; and no reviewer reading a diff of `tests/fixtures/` sees it. That is the
right property for a case whose whole content is one error message, and the wrong one for a case
meant to be shared, re-read, or re-run under a later change. The fan's split is the correct reading
of that trade, and a routines landing should copy it rather than improve on it.

---

## Six: what the proposal owes

### Which stage carries it

**Stage 3 carries the committed fixture root, and it is a prerequisite for four of its own eight
criteria, not a follow-on.** Stage 3's deliverable is "the `routines/` directory, the `kind: routine`
step, resolution, materialisation, identifier prefixing, and the load failures". Every one of those
needs a definition to run against, and on engine CI the only definitions present are fixtures. Its
criterion that "the differential test runs both paths over every activity **in the corpus** on every
run" cannot be graded as written: `verify.yml` checks out with `submodules: false`, so the corpus is
absent and the population is zero. The criterion has to name a fixture root, or the job has to
provision a corpus, and the proposal chooses neither.

**Stage 4 carries the guard fixtures.** Its criterion that "the authored-form guards walk
`routines/`" lands on a population where two guard roots are committed and nine are built in
temporary directories through one shared three-line helper. That helper is the cheapest single edit
in the whole fixture surface and no stage names it.

**Stage 5 carries the fragments edit, which is smaller than "delete the fixture".** 48 of 100 lines
and two of six files, with all three trees surviving to serve `duplicate-rule` and
`duplicate-checkpoint`, and the guard test's violation total re-derived from 8 to 3.

**Stage 5 and stage 6 also inherit the delivery baseline**, which is now a fixture. Both require
"the delivery baseline is re-recorded". The baseline that gates CI is
`tests/fixtures/token-benchmark-baseline.json`, recorded against `token-bench/delivery-fixture` — a
two-activity tree that carries no routine and never will. It therefore proves stage 3's
byte-identical-delivery criterion and nothing else, and the criterion about re-recording a baseline
"at each site" refers to walk artifacts on the corpus tree that engine CI does not have. Say which
of the two is meant.

### What the acceptance criteria would have to say

Stage 3 gains three, and one existing criterion is rewritten.

- [ ] A committed fixture root holds a workflow declaring a routine, a host referring to it, a host
      carrying two references to one routine, a routine referring to a routine, and a cross-workflow
      reference. Every tree in it loads clean, and the root is reachable by both a harness and a
      raw-reading guard, as `tests/fixtures/fan-corpus` is today.
- [ ] `routines` joins the reserved directory names at `src/loaders/corpus-index.ts:39`, so
      `workflowIdFromCorpusPath` names a routine file's owning workflow and a guard finding sited on
      a routine keys by workflow id rather than by path.
- [ ] Every terminal of the reference lifecycle has a case in one inline-temp-tree test file, in the
      shape of `tests/fan-load-rules.test.ts`, each asserting the message rather than the failure.
- [ ] *Rewritten:* the terminals reachable by **resolution** fail the load with a message naming the
      routine, the reference site and the reason. The terminals reachable by **shape** are stated
      separately, because an activity the schema rejects is dropped with a warning and its workflow
      still loads — so either the criterion excludes them, or the stage names the change to
      drop-and-continue and prices it against all 132 corpus activity files and all 68 fixture ones.
- [ ] *Rewritten:* the differential test runs both paths over every activity in a named root that is
      present in continuous integration. Naming "the corpus" grades the criterion against zero
      activities on the engine tree.

Stage 4 gains two.

- [ ] `writeWorkflowFixture` in `tests/corpus-fixture.ts` writes a `routines/` directory on request,
      and each of the nine temporary-corpus guard tests that gains a routines obligation uses it.
- [ ] Each guard moved into the recorded column has a case proving it reports on a routine body, run
      against a fixture rather than only through `check:all` — which matters because 14 of the test
      files in this repository are guard tests and 41 guards are registered.

Stage 5 gains one, and loses an assumption.

- [ ] The fragments fixture keeps all three trees. `alpha-fixture`'s `fragments:` block (lines 7–31)
      and both fragment-referencing activity files are removed, and `tests/fragments-guard.test.ts`
      asserts the three findings that outlive the mechanism: two `duplicate-rule` and one
      `duplicate-checkpoint`.

---

## Figures, and how to retake them

Every count above was measured at server `fe5f5f78` and corpus `e9d26007`. Baseline figures were
extracted with `git ls-tree` at `ee95e4cd` so a disagreement with the completeness pass is about the
same bytes.

```
find tests scripts -name 'workflow.yaml' | wc -l                          # 28  (23 at ee95e4cd)
find tests scripts -path '*/activities/*' -name '*.yaml' | wc -l          # 68  (59 at ee95e4cd)
find tests/fixtures -type f | wc -l                                       # 124
find tests/fixtures -type f -print0 | xargs -0 wc -l | tail -1            # 2255
find tests/fixtures/fan-corpus -type f | wc -l                            # 79, 1290 lines, 17 trees
git grep -ln "fixtures/" HEAD -- tests | grep -v 'tests/fixtures/' | wc -l  # 18 consumers (13 at ee95e4cd)
grep -rn "createHarness({ workflowDir" tests | grep fixtures              # 11 sites, 9 files
grep -rln "mkdtempSync" tests/*.ts tests/e2e/*.ts | wc -l                 # 40
grep -rln "declareFixtureWorkflows" tests/*.ts | wc -l                    # 10, incl. the helper
grep -rn "skipIf" tests/*.ts tests/e2e/*.ts | wc -l                       # 42, of which 36 corpus-gated
ls tests/*.test.ts tests/e2e/*.test.ts | wc -l                            # 100 (91 at ee95e4cd)
ls tests/*guard*.test.ts | wc -l                                          # 14, unchanged
grep -c "id: '" guards/guards.ts                                          # 41 registered guards
grep -rci fixture .engineering/.../2026-09-03-routines/*.md               # 0 for all 13 records
grep -rli routines src/ guards/ schemas/ tests/ scripts/                  # no matches
find .worktrees/workflows -name 'workflow.yaml' | wc -l                   # 18 corpus workflows
find .worktrees/workflows -path '*/activities/*' -name '*.yaml' | wc -l   # 132 corpus activity files
```

Three measurements were taken by running repository code rather than by counting files, and each is
reproducible by loading the module under `tsx`:

- `loadWorkflow` over all 28 fixture trees: 25 succeed, 3 fail — `message-binding/binding-fixture`
  on an undeclared exit, and both `markdown-techniques` trees on `initialActivity: Required`.
  `fragments/beta-fixture` succeeds with an activity count of zero.
- `collectFragmentViolations('tests/fixtures/fragments')` returns 8 violations at the sites tabled
  in section three.
- `workflowIdFromCorpusPath('prism/routines/fold.yaml')` returns `null`; the same call on an
  `activities/`, `techniques/` or `resources/` path returns `prism`.

Step kinds across all 68 fixture activity files, by a raw YAML parse rather than through the loader,
so dropped activities are counted: 58 steps — 44 `action`, 8 `checkpoint`, 5 `technique`, 1 with no
`kind`; zero `loop`, zero nested.

**One figure I could not reproduce.** The completeness pass's "four of the ten go through the real
server" does not re-derive at its own revision under any reading I could construct: counting
`createHarness` calls on a committed fixture root gives five files and six sites at `ee95e4cd`.
The count of ten consuming test files does reproduce, under the reading "test files consuming a
workflow-tree fixture" — the full consumer count at that revision, including the session and
transcript fixtures, is thirteen.
