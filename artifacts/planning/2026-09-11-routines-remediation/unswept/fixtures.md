# The test fixture corpora, and what a fifth step kind costs in them

> Item 11a · sweep of a surface no record in either planning folder reaches · measured at server
> `792f2cc5` and corpus `a4a5d88b`, one server commit past the completeness pass's `ee95e4cd`

The test suite does not only read the corpus. Alongside the eighteen workflows in the `workflows`
submodule sits a second body of workflow definitions, written by hand, living under `tests/fixtures`,
and served to the real server as though it were the corpus. There are 23 of these synthetic workflow
trees carrying 59 activity files, and the routines proposal names none of them: the word *fixture*
appears zero times in all thirteen of its records, and in the sweep folder `tests/fixtures` appears
only where a grep for an identifier collided with one.

The construct the proposal describes reaches every one of these trees on the day it lands. A
`routines/` discovery pass runs wherever the loader discovers an `activities/` directory, and a fifth
member on the step union changes what every one of these files is allowed to contain. So the question
this document answers is what that costs, priced against the one measured precedent in the
repository — the graph fan, which added a fixture root of its own four days ago.

**The headline is an asymmetry nobody has stated.** The fan is executed, so its fixtures are trees to
walk, and its illegal forms fail the load loudly enough to assert on. A routine is materialised away
before anything executes, and it is materialised by the same code path as a checkpoint fragment —
which, when it cannot resolve a reference, **drops the host activity and lets the workflow load
clean**. Measured: `tests/fixtures/fragments/beta-fixture` reports `success` from `loadWorkflow` with
an activity count of zero. An illegal routine form therefore cannot be tested the way the fan's
illegal forms are tested, and stage 3's criterion that "every terminal state of the reference
lifecycle but `Checked` fails the load" names a behaviour the mechanism it copies does not have.

---

## One: the surface, tree by tree

`find tests scripts -name 'workflow.yaml'` returns **23** roots and
`find tests scripts -path '*/activities/*' -name '*.yaml'` returns **59** activity files. Both
figures reproduce the completeness pass exactly. All 59 activity files sit inside the 23 trees:
48 under `fan-corpus`, 5 under `variable-model`, 3 under `fragments`, 3 under `message-binding`.

`tests/fixtures` holds 2,028 lines across 109 files in total.

### The fifteen trees of `tests/fixtures/fan-corpus` — 70 files, 1,141 lines

| Tree | What it exists to prove | Loads |
|---|---|---|
| `list-fan-fixture` | The flagship shape: one source fanning to two branches that converge on one meeting point | clean |
| `instance-fan-fixture` | One activity run once per element of a collection | clean |
| `mixed-fan-fixture` | A bare member and an instance fan in the same destination | clean |
| `chained-fan-fixture` | A fan whose branch is itself a fan source | clean |
| `wide-fan-fixture` | The instance ceiling — `maxInstances` and what happens above it | clean |
| `gather-fixture` | The container read whole, which is what a gather does | clean |
| `templated-artifact-fixture` | A branch technique whose artifact filename interpolates the per-instance variable | clean |
| `meta` | A five-line shared home so the transient-bootstrap path works against this root at all | clean |
| `bare-read-fixture` | A read of the container with no write behind it → `unwritten-read` | clean, guard reports |
| `missing-member-fixture` | A member read the branch never writes → `unwritten-read` | clean, guard reports |
| `no-index-fixture` | A container read that omits the index, so it addresses nothing | clean, guard reports |
| `ungathered-fixture` | A container written and never read → `unread-write` | clean, guard reports |
| `stray-parameter-fixture` | A per-instance parameter read outside the fan | clean, guard reports |
| `collision-list-fixture` | Two list branches whose techniques declare the same output name | clean, guard reports |
| `collision-instance-fixture` | The same collision on the instance form | clean, guard reports |

Eight are clean and seven carry an engineered defect. Every one of the fifteen passes the loader.
That is not incidental — see section three.

### The other eight trees

| Root | Trees | What they exist to prove |
|---|---|---|
| `tests/fixtures/variable-model` | `bare-fixture`, `child-fixture`, `seed-fixture`, `meta` | Declared defaults are seeded into a session, a worker's variable outputs persist, and a value declaration constrains what it admits |
| `tests/fixtures/fragments` | `alpha-fixture` (declares), `beta-fixture` (references, with defects), `gamma-fixture` (inline duplication) | The nine rules of the shared-checkpoint-fragment guard, and nothing else |
| `tests/fixtures/message-binding` | `binding-fixture` | A gate message citing a path its own activity produces, versus one already in the bag |

Four further fixture roots hold no workflow tree and are named here for completeness, because a
routines change does not reach them: `markdown-techniques` (two directories of technique markdown for
the technique loader), `legacy-session` (a pre-migration state file), `inspect-session` (a Python
script), and `run-profile` (four JSONL transcripts).

One detail worth recording. The guards' own enumerator treats a directory as a workflow when it holds
a `workflow.yaml`, an `activities/` **or** a `techniques/` folder
(`scripts/workflows-root.ts:41-45`). It does not mention `routines/`. A workflow directory that holds
routines and nothing else is invisible to that enumeration, and the two `markdown-techniques`
directories are already workflow directories by that rule and by no other.

---

## Two: how each tree is reached, and by what

Three read paths exist, and the distinction is the whole of this document.

**The real server.** Five test files hand an on-disk fixture root to `createHarness`, which stands up
the genuine server over an in-memory transport with that root as its workflows directory
(`tests/e2e/harness.ts:36-56`; the root is taken from `opts.workflowDir` at line 41, falling back to
the corpus). Those files are `tests/e2e/fan-walk.test.ts:21` and `tests/fan-ceiling.test.ts:18` on
`fan-corpus`, and `tests/variable-seeding.test.ts:100`, `tests/session-concurrency.test.ts:144` and
`tests/launched-workflow-completion.test.ts:126` on `variable-model`. A sixth call,
`tests/variable-seeding.test.ts:527-529`, copies `variable-model` into a temporary directory first and
serves the copy, so the drift assertions can mutate it.

The completeness pass says four of the ten go through the real server and names three `createHarness`
lines. I measure **five** distinct test files, six call sites. I give my own figure.

**The real loader, without the server.** Three test files call `loadWorkflow` against a fixture root
directly: `tests/e2e/fan-walk.test.ts:29`, `tests/fan-graph-readers.test.ts:26` and
`tests/fan-container-guard.test.ts:58`. All three read `fan-corpus`.

**Raw YAML, bypassing the loader entirely.** Three guard modules are invoked against a fixture root as
a plain directory of files: `scripts/check-activity-variables.ts` over `fan-corpus`
(`tests/fan-container-guard.test.ts:18`), `scripts/check-fragments.ts` over `fragments`
(`tests/fragments-guard.test.ts:12-15`), and `scripts/check-message-binding.ts` over
`message-binding` (`tests/message-binding.test.ts:10-13`).

Counting distinct test files that read anything under `tests/fixtures`, I measure **13**; counting
only those that read one of the 23 workflow trees, **9**. The completeness pass says ten. I give my
own figures and note the discrepancy is a counting boundary, not a moved tree.

**No registered guard sees any of this.** `grep -rn "tests/" scripts/check-*.ts` returns nothing, and
the corpus root resolves to `WORKFLOWS_DIR`, `--root`, or the `workflows` submodule and nothing else
(`scripts/workflows-root.ts:24-38`, `tests/corpus-root.ts:19-40`). So the 40 registered guards —
`grep -c "  id: '" scripts/guards.ts` — never walk a fixture tree. A fixture is reached by a guard
only when a test hands the guard's collector a path, and three tests do.

---

## Three: what the loader does to an illegal form, and why it decides everything else

The load has five decision points, and they do not agree with each other about failure.

| Stage in `src/loaders/workflow-loader.ts` | On failure |
|---|---|
| Per-file activity schema validation, line 87-92 | **Drops the activity**, records a `DefinitionLoadError`, workflow loads |
| Workflow schema validation, line 312-315 | **Fails the load** |
| Fragment materialisation per activity, line 342-356 | **Drops the activity**, records the error, workflow loads |
| Variable merge contradictions, line 368-373 | **Fails the load** |
| Exit-binding validation, line 383-384 | **Fails the load** |

The two silent stages are stated as design, not as oversight: the comment at lines 348-351 says the
contract is "the same as a per-file load failure — exclude the activity and surface the error … instead
of letting an unmaterialized checkpoint fail later downstream".

I probed all 23 trees through `loadWorkflow`. Twenty-two report success. One,
`message-binding/binding-fixture`, fails with *"Activity 'produce-then-render' checkpoint
'cites-own-output' option 'revise' selects exit 'revise', which the activity does not declare"* — an
exit-binding error, one of the loud stages. And one of the twenty-two successes is a success in name
only: `fragments/beta-fixture` loads with **activityCount 0**, because its single activity carries a
step with a `ref` and no `kind` (`tests/fixtures/fragments/beta-fixture/activities/00-beta-activity.yaml:16`)
and a `ref` to a fragment that does not exist (line 15). The activity is dropped at the schema stage
and the workflow reports clean.

**This is the precedent that governs routines, because routine materialisation is the same
mechanism.** The proposal's construct is materialised at load into the host activity, resolving the
way a technique reference does. If it is implemented where fragment materialisation sits, then an
unresolved, cyclic, unbound or overbound routine reference drops the host activity and the workflow
loads. Stage 3's criterion — *"Every terminal state of the reference lifecycle but `Checked` fails the
load, with a message naming the routine, the reference site and the reason. None is a warning"*
(`2026-09-03-routines/README.md:849-850`) — is a stronger guarantee than the code path it copies
provides, and the proposal nowhere says which of the five decision points the routine check occupies.

The diagnostics are carried, so the information is not lost. But they are barely read: across the
whole suite, exactly two assertions touch `activityLoadErrors`, both in
`tests/workflow-loader.test.ts` (lines 140 and 157). A routines load-rules test written against the
fragment precedent has to assert on a field the suite has two existing consumers for; a test written
against stage 3's wording has to assert `result.success === false`, which needs the check moved to one
of the loud stages.

---

## Four: the trees that are deletions rather than migrations

Stage 5 retires the shared-checkpoint-fragment mechanism: the `fragments` block leaves
`work-package/workflow.yaml`, seven of the guard's nine rules are deleted, and `duplicate-checkpoint`
keeps its rule with a remedy naming a routine (`2026-09-03-routines/README.md:882-884`).

`tests/fixtures/fragments` — three trees, 6 files, 100 lines — exists for that guard and for nothing
else. Its three titles say so: *"Fragments guard fixture — declaring workflow"*, *"— referencing
workflow with defects"*, *"— inline duplication"*. Its one consumer,
`tests/fragments-guard.test.ts` (58 lines), asserts exactly eight engineered findings and that there
are no others (line 56).

Sorting those eight against what survives stage 5:

| Finding | Tree carrying it | Survives? |
|---|---|---|
| `unresolved-ref` | `beta-fixture` | no — rule retires |
| `ref-opens-step` | `beta-fixture` | no |
| `ref-body-conflict` | `beta-fixture` | no |
| `undeclared-effect-variable` | `beta-fixture` | no |
| `unused-fragment` | `alpha-fixture` | no |
| `duplicate-rule` ×2 | rule text shared `alpha`+`beta`, and `beta`+`gamma` | **yes** — never a fragment rule |
| `duplicate-checkpoint` | two identical inline checkpoints in `gamma-activity` | **yes** |

So the deletion is not the root. `beta-fixture` is a pure deletion: every one of its four defects
belongs to a retiring rule, and it exists for no other purpose. `alpha-fixture` loses its `fragments`
block and its `unused-fragment-gate` and keeps its workflow-level rule text, because that text is one
half of a surviving `duplicate-rule` pair. `gamma-fixture` is untouched: both its duplicated inline
checkpoints and its activity-level rule text feed surviving rules — but `duplicate-rule` fires only
across two or more workflows, so deleting `beta-fixture` outright takes the second site of the
`beta`+`gamma` pair with it and silently drops one of the two `duplicate-rule` findings the test
asserts.

**Net: one tree deleted, two edited, and a guard test whose count changes from 8 to 3.** Nothing in
either planning folder records this. The 45-path change list names "`scripts/check-fragments.ts`,
`scripts/fragments-index.ts` and their two test files"
(`2026-09-10-routines-sweeps/sweeps/stale-restatement.md:133-134`) without naming the tree those tests
read or which of its defects survive.

And the second of those two test files is not fixture-backed at all. `tests/fragment-resolver.test.ts`
pins its materialisation assertions to the **real corpus**: `WORKFLOW_DIR = corpusRoot()` at line 27,
and the block at lines 203-245 names `work-package`, `prism` and `remediate-vuln` by id, three
activity/checkpoint pairs by id, and the fragment `assumption-interview` by name. Its helper at lines
34-41 throws outright when the named fragment is absent from `work-package/workflow.yaml` — which is
precisely what stage 5 makes true. Three tests and one helper, 42 lines, break by construction on the
day the `fragments` block leaves the corpus, and no stage budgets rewriting them against a fixture.

---

## Five: what a new step kind costs here, priced against the fan

`tests/fixtures/fan-corpus` arrived in three commits, all within two days, all purely additive:
`be325d0f` (2026-09-09, 16 files, 159 lines), `4defd3cd` (2026-09-10, 54 file-changes, 920 lines) and
`c2d0a50b` (2026-09-10, 4 files, 62 lines). The sum, 1,141 insertions, equals the root's current line
count exactly, so nothing has been rewritten since.

The fan's test surface splits into four layers, and only one of them uses an on-disk tree:

| Layer | Where the cases live | Lines |
|---|---|---|
| Destination schema — what parses | in-memory objects, `tests/fan-destination-schema.test.ts` | 131 |
| Load rules — the illegal shapes | trees written to `mkdtempSync` at run time, `tests/fan-load-rules.test.ts` | 714 |
| Graph readers, the walk, the guard | the 15 on-disk trees | 592 across 4 files |
| Arrival intersection — a unit | in-memory graphs, `tests/fan-arrival-intersection.test.ts` | 224 |

Total: 1,661 lines of test plus 1,141 lines of fixture, **2,802 lines for one construct**. The largest
single file, at 714 lines, is the one with no on-disk fixture at all.

A routine is a different kind of thing, and the difference changes the shape of the bill in both
directions.

**Layers one, two and four transfer at roughly the same size.** The routine step's parse, the
signature's parse and the substitution unit are all in-memory work. The load rules — unresolved,
cyclic, unbound, overbound, colliding declaration, malformed name — are a per-rule test file writing
trees to a temporary directory, exactly as the fan's are. There is more to check than the fan had: the
fan has one rule family, and the reference lifecycle the proposal draws has at least four terminals
plus the colliding-declaration terminal it lacks (plan defect 10) and the Malformed terminal the
sweeps ask for. Call this layer comparable to the fan's 714 lines or larger.

**Layer three is where the asymmetry bites, and it cuts the bill.** The fan needs fifteen on-disk trees
because a fan changes the walk: to prove the walk you must have a tree to walk, one per shape, and the
e2e harness must serve the root. A routine changes nothing after the load completes. What has to be
proved is that the materialised step list is the step list a hand-authored activity would have carried
— stage 3 says so itself, asking for a differential test comparing "parsed objects field for field"
and, as text, the fields a worker acts on (`README.md:859-862`). That is not a tree to walk. It is a
**pair**: one tree whose activity references a routine, one whose activity spells the steps out, and an
equality assertion between the two loads. Two trees per shape, with no walk and no harness, against the
fan's one tree per shape with both.

There is no precedent for that pair anywhere in `tests/fixtures`. The nearest thing is
`fragment-resolver.test.ts:216-234`, which asserts materialisation against the corpus by reading the
declared fragment body back out of `workflow.yaml` and checking the loaded activity contains it — a
single-tree, self-referential form that works for a body with no parameters and does not extend to a
substitution.

**And stage 3's differential test cannot substitute for the fixtures.** It runs "over every activity in
the corpus on every run". The corpus has 132 activity files
(`find workflows -path '*/activities/*' -name '*.yaml'`) and on the day stage 3 lands, zero of them
carry a routine — the first migration is stage 5. A differential test over 132 routine-free activities
compares two identical paths and asserts the construct is inert, which is worth having and is not
evidence the construct works. The only place a routine exists between stage 3 and stage 5 is a fixture.

**A fifth step kind also has to not break what is there.** Five test files hand an on-disk fixture root
to the real server and three call the real loader against one; the schema union it widens is a
four-member discriminated union at `src/schema/activity.schema.ts:167-172`; and `kind === 'loop'` is
tested at 21 sites across `src/`, `scripts/` and `tests/`. Seven files under `tests/` name the `loop`
kind literally — five test files plus the two walk helpers `tests/e2e/walker.ts` and
`tests/e2e/coverage.ts`, which is where an unhandled fifth kind would surface as a walk error rather
than an assertion.

**Then the guard column.** Stage 4 requires every guard that reads an activity file to sit in a recorded
column, with the authored-form guards walking `routines/` (`README.md:874-876`). Measured: of 42
`scripts/check-*.ts` scripts, **6** reach definitions through `loadWorkflow` and so see the
materialised expansion, and **17** parse YAML directly and so see the reference. Sixteen of those
parse-only scripts never load anything. For each of them, "does it false-positive on an unexpanded
routine reference?" is a question only a fixture tree can answer, and three guard collectors already
have the plumbing for it — `check-activity-variables` over `fan-corpus`, `check-fragments` over
`fragments`, `check-message-binding` over `message-binding`. That plumbing is the cheap part; what is
missing is the tree.

**Estimate.** Six to ten trees, not fifteen: one for `routines/` discovery, one `meta/routines/` for the
shared-home fallback the resolution rule names, and a reference/expansion pair for each of the three
shapes worth pairing — a plain parameterised body, a body binding a technique, and a nested reference.
On the order of 400 to 700 lines of fixture, against the fan's 1,141. The illegal forms add no fixture
lines and around 700 lines of test. The guard column adds a routine reference to one existing tree per
root that a guard collector already walks — three edits, not three new trees. Against 2,802 lines for
the fan, a routine plausibly costs 1,500 to 2,000, weighted away from on-disk fixtures and towards a
single large load-rules file.

The proposal already owns the raw material and does not know it. Its own worked conversion ships three
hand-written routine bodies totalling 313 lines
(`2026-09-03-routines/conversion/routines/analyse-challenge-pass.yaml` 88,
`assumption-reconciliation.yaml` 143, `converge-concerns.yaml` 82) and two converted host activities
totalling 231 lines. That is a fixture tree in everything but location, and the word *fixture* does not
appear in it.

---

## Six: can an illegal routine form live in a fixture tree at all?

Directly: **not in a tree that anything loads, and the two trees in the repository that hold an illegal
form are the exceptions that prove it.**

A tree under `fan-corpus` cannot be loader-illegal, because two test files serve the whole root to the
real server and three load named trees from it. Every one of its fifteen trees loads clean, including
all seven that carry an engineered defect — those defects are *guard*-visible, not loader-visible. That
is why `tests/fan-load-rules.test.ts` exists at 714 lines, writing every illegal shape to
`mkdtempSync` at line 22 through a helper at lines 47-72, with its own comment at lines 16-17 saying
plainly that it "authors illegal shapes". The fan's rules "live in the load and only there" (lines
9-13), so its illegal forms cannot be on disk and are not.

The two on-disk trees that do hold an illegal form both sit outside the loader's reach.
`message-binding/binding-fixture` cannot load at all and is read only as raw YAML by
`check-message-binding`. `fragments/beta-fixture` loads to zero activities and is read only as raw YAML
by `check-fragments`. Neither is served to the server by anything.

For a routine this decides the test design twice over.

- **An illegal routine reference can sit in a fixture tree only if that tree is never served to the
  harness and never loaded** — that is, only in a raw-YAML-guard root of the `fragments` /
  `message-binding` kind. Put one in `fan-corpus` or `variable-model` and five existing real-server
  test files start serving a root with a broken member.
- **And it buys less than the fan's equivalent, because the failure is quiet.** An illegal fan shape
  produces `result.error.issues`, which the test asserts per rule and per message. An illegal routine
  shape, at the materialisation point the proposal implies, produces a dropped activity and a clean
  load, which the test can only reach through `activityLoadErrors`.

The complement is also true and is the part the proposal should lean on: **a fixture under a temporary
directory is invisible to every guard.** No registered guard reads under `tests/`, the corpus root is
the submodule or an explicit override, and a `mkdtempSync` root exists only inside one test's lifetime.
So the illegal-form fixtures need not be loader-legal, need not be guard-clean, and cost nothing in the
`check:all` suite — which is exactly why 714 of the fan's 1,661 test lines live there. A routines
load-rules file should be built the same way, and no stage says so.

---

## Seven: what the proposal owes

### Which stage carries it

Split across two, matching where the mechanism lands.

**Stage 3 carries the fixture root.** Its first criterion already creates the thing that needs
fixtures — "`routines/` has its own discovery pass and its own generated JSON schema"
(`README.md:846-848`) — and its differential test is the criterion that cannot be met without them,
because the corpus carries no routine until stage 5. Stage 3 should own the root, the
discovery tree, the `meta/routines/` fallback tree, the reference/expansion pairs, and the load-rules
file. Nothing in stage 3's eight criteria mentions a test input today.

**Stage 4 carries the guard column's fixture, because that is where the column is enforced.** Its
criterion already says the authored-form guards walk `routines/`; what it does not say is how a guard
is shown to do so. Sixteen guard scripts parse YAML and never load, and three fixture roots already
carry a guard collector.

**Stage 5 carries the retirement, and owes a line it does not have.** Its criteria list the corpus
changes and the re-recorded baselines and say nothing about the three `fragments` trees, the guard test
whose engineered-finding count drops from 8 to 3, or the three corpus-pinned materialisation tests in
`fragment-resolver.test.ts` that break when `work-package` loses its `fragments` block.

### What the criteria would have to say

For stage 3, replacing nothing and adding four lines:

- [ ] A fixture workflow root under `tests/fixtures/routines/` carries a tree whose `routines/`
      directory the discovery pass finds, and a `meta/routines/` whose body a bare reference in a
      sibling workflow resolves to. The count of trees is stated in the root's own README, not
      inferred.
- [ ] For each of a plain parameterised body, a body binding a technique whose prose interpolates a
      token, and a nested reference, the root carries a **pair** of trees — one referencing the
      routine, one spelling its steps out — and a test asserts the two loads are equal field for
      field, and equal as text in the fields a worker reads directly.
- [ ] Every terminal state of the reference lifecycle is exercised by a tree written to a temporary
      directory, one case per terminal, each asserting the message names the routine, the reference
      site and the reason. The criterion states which of the load's five decision points the check
      occupies, and the test asserts on `loadWorkflow`'s failure rather than on
      `activityLoadErrors` — or says explicitly that it asserts on the diagnostics and why.
- [ ] The five test files that serve an on-disk fixture root to the real server, and the three that
      call the loader against one, pass unchanged. A fifth step kind that breaks one of them is a
      finding, not a fixture update.

For stage 4, one line:

- [ ] Each of the 17 guard scripts that parse activity YAML without loading is exercised against a
      fixture tree carrying an unexpanded routine reference, and reports on it exactly what the
      recorded column says it should — silence, or a finding naming the routine.

For stage 5, one line:

- [ ] `tests/fixtures/fragments` is reduced to the trees the surviving rules need, and the
      fragment guard's engineered-finding count is restated from its new fixture rather than
      decremented. The three materialisation tests in `tests/fragment-resolver.test.ts` that name
      `work-package`'s `assumption-interview` fragment are rewritten against a fixture root before
      the corpus block is removed, not after.

### The one thing that is cheaper than it looks

`check-resource-anchors` reaches a new definition directory for free, because its scan is
directory-shaped rather than path-shaped — the sweeps establish that. The same property does not hold
for the enumerator every guard shares: `isWorkflowDir` at `scripts/workflows-root.ts:41-45` recognises
`workflow.yaml`, `activities/` and `techniques/`, and a `routines/` disjunct is a one-line addition
that stage 4's column criterion should name explicitly, because without it a routines-only directory
is not a workflow to any guard.

---

## Re-taking these figures

```
cd <server-checkout>
find tests scripts -name 'workflow.yaml' -print | wc -l                   # 23
find tests scripts -path '*/activities/*' -name '*.yaml' -print | wc -l   # 59
find tests/fixtures -type f -print | wc -l                                # 109
find tests/fixtures -type f -print0 | xargs -0 wc -l | tail -1            # 2028 total
find tests/fixtures/fan-corpus -type f -print0 | xargs -0 wc -l | tail -1 # 1141 total
ls tests/*.test.ts tests/e2e/*.test.ts | wc -l                            # 91
ls tests/*guard*.test.ts | wc -l                                          # 14
grep -c "  id: '" scripts/guards.ts                                       # 40
ls scripts/check-*.ts | wc -l                                             # 42
grep -rln "loadWorkflow" scripts/check-*.ts | wc -l                       # 6
grep -rln "from 'yaml'\|parseDefinition" scripts/check-*.ts | wc -l       # 17
grep -rn "createHarness(" tests/ --include=*.ts                           # 6 fixture-root calls
grep -rn "loadWorkflow(" tests/ --include=*.ts                            # 3 fixture-root call sites
grep -rn "tests/" scripts/check-*.ts                                      # nothing
grep -rci "fixture" .engineering/artifacts/planning/2026-09-03-routines/   # 0 in every file
find workflows -path '*/activities/*' -name '*.yaml' -print | wc -l       # 132
wc -l tests/fan-*.test.ts tests/e2e/fan-walk.test.ts                      # 1661 total
git show --stat be325d0f -- tests/fixtures/fan-corpus                     # 159 insertions
git show --stat 4defd3cd -- tests/fixtures/fan-corpus                     # 920 insertions
git show --stat c2d0a50b -- tests/fixtures/fan-corpus                     #  62 insertions
```

The load probe in section three is not a committed test. It was a throwaway file that iterated the
four fixture roots, called `loadWorkflow(root, tree)` on each directory holding a `workflow.yaml`, and
printed success or the joined issues. To re-take it, write that loop, run it under vitest, and delete
it; the two results that matter are `message-binding/binding-fixture` failing on an undeclared exit
and `fragments/beta-fixture` succeeding with `activityCount 0`, the second of which is visible in the
loader's own log line at `src/loaders/workflow-loader.ts:386`.
