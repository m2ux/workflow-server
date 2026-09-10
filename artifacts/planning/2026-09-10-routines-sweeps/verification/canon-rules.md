# Refuting the rules-and-canon sweep

Refutation pass over [sweeps/canon-rules.md](../sweeps/canon-rules.md), whose subject is the written
rules an author or an auditor is sent to — guard rule text, corpus canon, the `rules` buckets in the
definitions, and technique `## Rules` sections — held against the routines proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). Every figure below was taken
from the repository by this pass. Where a figure disagrees with the sweep, with a ground-truth
record or with the proposal, the disagreement is stated, my own figure is given, and the search that
produced it is named.

I reproduced all **24** candidates: located each construct, read it in full, counted its references
myself, and re-took every number rather than accepting one. **Eighteen survived at the verdict the
sweep gave them**, nine of those carrying a corrected citation, a corrected count or a refuted
sub-claim inside an unchanged verdict. **Four were downgraded** — CR10, CR12, CR18 and CR20. **Two
were reclassified in the other direction**, CR2 and CR3, because the sweep asked for an amendment
where the rule simply has no subject left. No whole candidate was withdrawn; **two arms of two
surviving candidates were**, and both are recorded below rather than dropped.

The four downgrades share one shape and it is worth naming, because it is the shape the sweep's own
CR23 warns against and then fails to apply elsewhere: **an enumeration that goes *silent* about a
routine was read as an enumeration that becomes *false*, and a destination that becomes merely
*worse* was read as a destination that is *retired*.** Principle 22 and AP-01 keep their exact test
when a fourth kind of body exists, and AP-01's Detect carries a general second clause that already
reaches an inline-authored routine. `prefer-activity-composition` says "bound as activity steps",
and a `kind: routine` step is an activity step. AP-38 keeps its Detect and its exemptions unchanged;
only its population moves. CR23 states the discriminator in its own words — "incomplete, not false …
conflating the two is what this verdict exists to prevent" — and the four downgrades are the four
places the sweep conflated them.

The two withdrawn arms share a different shape, and it is the more expensive one. CR10's second arm
costs a variable-merge change at stage 4 that **landed with stage 0**, because the sweep read the
proposal's body rather than the proposal's own gap review. CR12's AP-17 arm reasons from what an
auditor might do with a Fix sentence rather than from the Detect that decides whether the entry
fires at all.

Beyond the verdicts, one thing changes the plan more than any single candidate: **the corpus has
moved, and two of stage 8's four reference sites are gone from it.**

## What I measured against, and why it matters here

The sweep is pinned to server tooling at `9ca71c19` on `main` and corpus at `2b8b7215` on the
`workflows` branch. At that pin the sweep's measurements are, with the exceptions listed under
[Figures I could not reproduce](#figures-i-could-not-reproduce), exact — 586 technique markdown
files, 122 activity YAML files, 17 `workflow.yaml` files, 151 `AP-NN` entries, 35 `##` sections in
design-principles, 7 in the construct inventory, eleven closed step-kind enumerations at eleven
named lines, ten files citing the construct inventory, 26 maximal shared windows split 21 and 5. I
re-took each of those and each came back the same.

The working tree does not stand at that pin. Server tooling is at `c1c9682d` and the corpus
submodule at `26e79d8a`, thirteen commits past `2b8b7215`. I measured both: the pinned corpus by
extracting `git archive 2b8b7215` into a scratch directory and running the same instruments against
it, and the live tree directly. Where the two disagree the disagreement is a fact about the design's
constituency rather than about the sweep's accuracy.

The material difference is in one directory. `meta/activities/patterns/` held five activity files at
`2b8b7215` and holds three now: `01-orchestrator-workers.yaml` and `04-isolated-fan-out.yaml` were
deleted by `f6cb1dc2` ("Retire the pattern activity the graph fan replaces") and `b5471e45`
("Retire the isolation pattern nothing could reach"). Those two files are two of the four reference
sites stage 8 names (README:936-938). The construct that replaced them is not a routine — it is a
graph-level instance fan, and the canon now routes an author there:
`workflow-design/resources/schema-construct-inventory.md:38` maps "orchestrator-workers / fan-out
then consolidate" to **Graph, an instance fan**, `:41` maps "subagent-isolation / each unit its own
commit" to a fan declaring `isolation: worktree`, and
`meta/activities/patterns/README.md:9` states the rule plainly: "Running units together is the
graph's layer."

## What the verdicts mean

The sweep keeps four verdicts and maps them onto the structured record's enum. I keep the same
mapping and state each as an action, because the action is what a plan executes.

| Verdict | Meaning here |
|---|---|
| REMOVE | The construct leaves the rule with no subject. The rule is deleted, not amended. Any obligation that survives its deletion is a separate thing that needs its own home, and it is reported as a plan defect rather than folded into the verdict. |
| DEPRECATE | The rule keeps a subject and becomes false, or keeps a subject and sends an author to a construct the migration retires. It is amended in the commit that lands the change. |
| NARROWS | The construct shrinks what the rule speaks about without emptying it, or leaves it accurate and incomplete. The fix is an addition, and shipping without the addition costs coverage rather than correctness. |
| KEEP | It looks like one of the above and is not. Discriminators are given, preferring several independent ones over one. |
| STALE | Already false today, independent of routines. Recorded because the sweep found it. |
| WITHDRAWN | The sweep's case does not survive. Recorded with the reason. |

## Verdicts after refutation

| Id | Construct | Sweep | Verified | Confidence |
|---|---|---|---|---|
| CR1 | `check-fragments` — `malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `undeclared-effect-variable` | REMOVE | **REMOVE** | CONFIRMED |
| CR2 | `check-fragments` — `unused-fragment` | DEPRECATE | **REMOVE** (reclassified) | CONFIRMED |
| CR3 | `check-fragments` — `inline-duplicate-of-fragment` | DEPRECATE | **REMOVE** (reclassified) | CONFIRMED |
| CR4 | `check-fragments` — `duplicate-checkpoint`'s remedy | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CR5 | `check-fragments` — `duplicate-rule` | KEEP | **KEEP** | CONFIRMED |
| CR6 | `scripts/guards.ts:252-258` — the `fragments` registry entry | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CR7 | `schema-construct-inventory.md:68` — the checkpoint-fragment row | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CR8 | `schema-construct-inventory.md:47` — the loop step's field list | STALE | **STALE** | CONFIRMED |
| CR9 | `schema-construct-inventory.md:52` — "a shared base field on every step kind" | STALE | **STALE** | CONFIRMED |
| CR10 | `schema-construct-inventory.md:54` — the variable contract row | DEPRECATE | **NARROWS** (downgraded; second arm withdrawn) | PLAUSIBLE |
| CR11 | Eleven closed four-kind step enumerations | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CR12 | Three closed "activity, technique, resource" body enumerations | DEPRECATE | **KEEP** (downgraded; AP-17 arm withdrawn) | CONFIRMED |
| CR13 | `docs/checkpoint-model.md:113,116` | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CR14 | `schemas/README.md:279,335,341,500` | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CR15 | `schemas/README.md:499` and `check-checkpoint-presentation.ts`'s rules half | STALE | **STALE** | CONFIRMED |
| CR16 | `check-set-action-values.ts:173-174` — the scan's stated reason | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CR17 | `audit-schema-validation.md:29` — the guard roster bullet | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CR18 | `orchestration-patterns/TECHNIQUE.md` — `prefer-activity-composition` | DEPRECATE | **KEEP** (downgraded) | CONFIRMED |
| CR19 | `meta/activities/patterns/README.md:39` — "copy the step pipeline" | DEPRECATE | **DEPRECATE** | PLAUSIBLE |
| CR20 | `anti-patterns.md:542-552` — AP-38 | NARROWS | **KEEP** (downgraded) | CONFIRMED |
| CR21 | The absent cross-activity duplication rule | KEEP | **KEEP** | CONFIRMED |
| CR22 | `design-principles.md:161-163` — principle 35 | KEEP | **KEEP** | CONFIRMED |
| CR23 | `convention-conformance.md:16,20`; `format-conventions.md:29,35` | KEEP | **KEEP** | CONFIRMED |
| CR24 | `workflow-canonical.md:34-37` — the `::` resolution rule | KEEP | **KEEP** | CONFIRMED |

---

## Plan defects

Ten findings here are fixes the design owes rather than rules the migration removes. They are put
first because they change the plan.

### P1. Two of stage 8's four reference sites are gone, and the construct that replaced them is not a routine

Stage 8's acceptance criterion names four reference sites: "`01-orchestrator-workers`,
`04-isolated-fan-out`, `05-lead-researcher` and the follow-up loop inside it" (README:936-938). Two
of the four files no longer exist. `ls workflows/meta/activities/patterns/` returns
`02-supervisor.yaml`, `03-plan-and-execute.yaml`, `05-lead-researcher.yaml` and `README.md`.

I ran the proposal's own instrument — `measure/repeated-runs.py`, which stage 1 promotes to a guard
— against both corpora. At `2b8b7215` it reports 26 maximal shared windows, 21 top level and 5
inside a loop body, and the fan-out family appears at three window sizes: a four-step window
(compose → dispatch → gather → synthesise) shared by `01-orchestrator-workers` and
`05-lead-researcher`; a three-step window shared by those two plus `02-supervisor`; and a two-step
window over five files. Against the tree as it stands the same script reports **24 maximal shared
windows, 19 top level and 5 nested**, and the four-step window is gone entirely. The only cross-file
fan-out window left is the three-step compose → dispatch → gather, shared by `02-supervisor.yaml`
and `05-lead-researcher.yaml`.

So the run stage 8 exists to name now occurs at exactly two places, both inside one file —
`05-lead-researcher.yaml:41-55` and `:70-84` — which is the occurrence the proposal itself says no
guard can see (README:941-942). Stage 8's second criterion, "the stage-1 guard's baseline falls by
the fan-out windows and by nothing else", is written against a baseline that has already fallen by
two windows for a reason unrelated to routines.

What the design owes: stage 8's site set re-taken against the live corpus, and a stated position on
whether a two-occurrence intra-file run in a library activity that validates against nothing is
worth a construct — set beside the graph fan, which the canon now names for this shape at
`schema-construct-inventory.md:38` and `meta/activities/patterns/README.md:9`.

### P2. A fifth occurrence of the fan-out run that the design never names

`meta/activities/patterns/02-supervisor.yaml` runs compose-brief (`:42-44`) → dispatch (`:45-47`) →
gather (`:48-53`) → an `announce-escalation` action (`:54-59`) → synthesise (`:60-62`). That is the
same four operations in the same order with one intervening action, which is the exact shape
`04-isolated-fan-out` had (its intervening step was a `require-complete` validate). Its one further
difference is a single input binding: `gather` takes `expected_ids: worker_briefs` where the others
take `expected_ids: work_units` — a difference a routine parameterises.

`grep -rn "supervisor" .engineering/artifacts/planning/2026-09-03-routines/` returns nothing. The
word appears nowhere in the proposal or its twelve companion records. The instrument does see the
file: at both corpus revisions `02-supervisor.yaml` is an owner of the three-step fan-out window.

The consequence is CR3's coverage gap with a live site attached. If stage 8 converts
`05-lead-researcher` and leaves `02-supervisor`, the corpus ends with a routine holding the run and
one activity holding an inline copy of most of it, and nothing in the guard suite or in stage 1's
criterion compares an inline run against a routine declaration.

### P3. The hazard `ref-opens-step` polices is not discharged by the closed object

The sweep argues that the routines analogue of `ref-opens-step` needs no rule, because
`injectResolvedStepIds` rewrites `- technique:` lines only
(`src/schema/activity.schema.ts:234-243`) and `populateStepIds` refuses a non-technique step with no
id (`:198-205`), "so a `- routine:` opener is a load error rather than a silent mis-splice".

It is not a load error. `populateStepIds` throws when `step.id` is absent; it cannot see field
order. A step written

```yaml
  - routine: assumption-reconciliation
    kind: routine
    id: reconcile-assumptions
```

carries its id and loads. That is precisely the shape `ref-opens-step` forbids today: the corpus's
eight reference sites all write `- kind: checkpoint` / `id:` / `ref:` in that order
(`workflows/work-package/activities/04-research.yaml:222-224` and `:241-243`), and the guard rule at
`scripts/check-fragments.ts:175-176` is what keeps them that way, matching the raw text
`/^\s*- ref:/m`. The reason the rule exists is that the textual injector is line-oriented: its
regex at `src/loaders/fragment-resolver.ts:192` requires `^(\s*)ref:` at its own indentation, so a
`ref:` on the list-item line is delivered unexpanded.

The proposal's splicer has the same exposure — it locates a routine step "by its own indentation"
(README:1172) — and stage 3's criterion covers the ids of the steps it *splices* (README:1181-1184),
not the reference step's own opener in the host file. The sweep notices this ("What neither covers is
the reference step's own opener in the host file") and then closes it with an argument that does not
reach. The ground-truth record states it correctly:
[fragment-mechanism.md:148-154](../ground-truth/fragment-mechanism.md) — "The rule count falls by
one; the hazard does not."

What the design owes: stage 3 either keeps an authored-form rule requiring a routine reference
step's `- ` opener to be its `kind:` line, or locates a routine step structurally rather than by
line. Measured today, no step in 128 activity files opens with anything but `- kind:` or `- id:`, so
the convention holds and the cost of the rule is nil; the cost of dropping it is that nothing holds
it.

### P4. The re-inlining comparison has no home after stage 5

Three things have to be true together for a re-inlined copy of a shared body to be caught, and after
stage 5 none of them is. `duplicate-checkpoint` requires two inline sites —
`if (sites.length >= 2)` at `scripts/check-fragments.ts:267` — and a migration leaves one inline copy
against one routine declaration. Its collection loop reads `root/<workflow>/activities`
non-recursively (`:169-171`), so it never opens a routine file. Stage 1's guard is specified over
"two or more **activity files**" (README:822-823), and a routine body is not an activity file.

What the design owes: stage 1's first criterion widened to "activity files and routine files, with a
routine declaration counting as a site". That is cheaper written into stage 1 than retrofitted at
stage 5, and it is the same edit CR3 identifies.

### P5. `unused-fragment`'s corpus-wide reach is not free at the load

The rule the migration retires is corpus-wide by construction: `check-fragments.ts:235-250` iterates
every workflow id on disk. Stage 4 replaces it with "A routine with no reference site anywhere fails
the load" (README:878). A load failure reaches whatever the loader was asked to load, and the
loader's reach is narrower than the disk's: `loadActivitiesFromDir`
(`src/loaders/workflow-loader.ts:72-107`) is non-recursive and skips any file
`parseActivityFilename` rejects (`:80-81`), and `validate-activities.ts:110` is non-recursive too.
The consequence is measurable: `npx tsx scripts/validate-activities.ts workflows` prints
"Total: 125 passed" against 128 activity YAML files on disk — the three files under
`meta/activities/patterns/` validate against nothing. At `2b8b7215` the same command printed
"Total: 117 passed" against 122 files, the sweep's figure exactly.

What the design owes: stage 3's `routines/` discovery stated as unconditional over the directory,
not as a lookup driven by reference sites, or stage 4's "anywhere" narrowed to what it can mean.

### P6. The reference lifecycle has no `Malformed` state

`parseFragmentRef` raises a `Malformed fragment ref` error for a value with more than one `::`
(`src/loaders/fragment-resolver.ts:38-45`), and `check-fragments.ts:207` reads the word to choose
between `malformed-ref` and `unresolved-ref`. The routine reference adopts the same address grammar,
`[workflow::]name` (README:311-314), and the lifecycle's non-`Checked` terminals are `Unresolved`,
`Cyclic`, `Unbound` and `Overbound` (README:727-732). A value like `routine: a::b::c` or
`routine: work-package::` matches none of them.

What the design owes: the state, added at stage 3 with the load failures rather than at stage 5 with
the rule deletions. The sweep is right about this and it is repeated here because it is the one
CR1 item that is an addition rather than a subtraction.

### P7. The proposal costs a variable-merge change that landed with stage 0

README:1102-1104 states, as work stage 4 owes: "Today it compares an absent default as `null` and
reports disagreement with any present one, so a no-default declaration would fail the load on
contact with the corpus. Two lines."

It does not. `disagreement` in `src/utils/activity-variables.ts:62-75` reports a default
disagreement only where both declarations name one — `if (a.defaultValue !== undefined && b.defaultValue !== undefined)`
at `:64` — and `fillSilences` at `:82-90` takes the present default whichever site declared it. The
doc comment at `:56-61` states the rule: "Silence is no opinion". `git log -S fillSilences` names one
commit, `3a36b0db` "Give a loop's continuation test its own field, and let silence agree", and
`git show 9ca71c19:src/utils/activity-variables.ts | grep -c fillSilences` returns 2, so the change
was already in the tree the sweep measured.

The proposal's own gap review has it: [gap-review.md:53](../../2026-09-03-routines/gap-review.md) —
"C2 — an absent default read as a disagreement | **Landed**". The README body, which carries the
instruction "**Read it before planning any stage**" about that very file, still costs the work.

What the design owes: README:1102-1104 corrected. This is also the whole of CR10's second arm, and
it is withdrawn below.

### P8. `check-activity-variables` fires at stage 3 and the mechanism is unspecified

The construct inventory's variable contract row and the guard that enforces it have to be settled
together, and the guard's side is the unspecified one.
[guard-obligations.md:165-180](../ground-truth/guard-obligations.md) records it: the guard is hard
zero with no ledger (`scripts/check-activity-variables.ts:25`) and already consumes the loader
(`:34`), `deriveActivityContract` walks materialised steps, and a materialised internal is written
and read by those steps while declared in no activity contract — `undeclared-use` twice over, at
stage 3, the moment materialisation splices anything. Stage 4's criterion covers
`check-variable-model` and internals (README:876) and says nothing about this guard. Stage 5 removes
the eight host declarations (README:886-888) without saying what stops the derived side reporting
them.

### P9. AP-38's proposed fourth arm and CR21's proposed new entry are two homes for one rule

CR20 proposes adding a fourth classification arm to AP-38 — "(d) repeated run — the same consecutive
sequence at two positions, extracted to a routine and referenced twice". CR21 proposes a new
catalogue entry whose Detect is "a run of two or more consecutive steps … appears in two or more
activity files **or twice in one**". The second half of CR21's Detect is the whole of CR20's fourth
arm.

Two further facts argue for one home rather than two. AP-38 sits under
`## Description Hygiene Anti-Patterns` (`anti-patterns.md:394`), whose family is prose in
description fields; a structural-duplication rule belongs under `## Structural Anti-Patterns`
(`:78`), which is where CR21's entry would go and which `audit-canon.md:65` enumerates as its own
unit. And the catalogue's own AP-22 `single-rule-authority` (`:346`) names "the same rule has more
than one home — across levels, or twice within one rules block" as the defect, while
principle 35 (`design-principles.md:161-163`) says retire one of two constructs doing one job.

What the design owes: one entry, in Structural, and AP-38 left exactly as written.

### P10. The step-kind enumeration set is four sites short, and one of the four is generated

CR11's grep is scoped to markdown — `grep -rnE "action.*checkpoint.*loop" --include=*.md workflows/ docs/ schemas/`
— and its eleven hits reproduce exactly, at the eleven line numbers stated, with no false positive.
The same pattern over `src/`, `scripts/` and `schemas/*.json` returns four more:

| Site | What it is |
|---|---|
| `src/resources/schema-resources.ts:7` | "an ordered list of kind-tagged steps (technique \| action \| checkpoint \| loop)" — the description served at `workflow-server://schemas`, the URI the construct inventory names at `:25` |
| `scripts/generate-schemas.ts:29` | the hand-written `description` argument passed to `generate(ActivitySchema, 'activity', …)` |
| `schemas/activity.schema.json:4` | the generated file's `"description"`, carrying that string verbatim |
| `src/schema/activity.schema.ts:296` | a code comment; the schema's own docstring at `:89-93` spells the four kinds out a second time |

The generated one matters most, because CR11's blast radius says "The generated JSON schema follows
the Zod source automatically; none of the eleven does". The structure does. The description does
not: it is a string literal in the generator, so regenerating reproduces the stale enumeration
rather than fixing it. And nothing runs the generator in continuous integration —
`build:schemas` appears at `package.json:10` and in neither `test:ci` nor `verify.yml`, and
`scripts/generate-schemas.ts` has no verifying variant, which is the gap the proposal already asks
stage 3 to close (README:846-848).

While counting: `schemas/` holds six JSON schemas and **five** are generated —
`generate-schemas.ts:25-29` emits workflow, state, condition, session-file and activity.
`schemas/technique.schema.json` is hand-authored, on draft-07 with its own `$id`. CR14's "6
generated JSON schemas" is one too many.

---

## The nine fragment rules

The partition the proposal states — seven rules die, `duplicate-rule` stays as it is,
`duplicate-checkpoint` stays with its remedy changed
([decisions.md:442-450](../../2026-09-03-routines/decisions.md)) — reproduces against the script, and
so does the sweep's reading of it. What I dispute is the verdict vocabulary applied to three of the
seven, and one supporting figure.

The guard passes clean: `npx tsx scripts/check-fragments.ts` prints
`fragments: OK — every ref resolves, every fragment is used, no inline duplicates`, exit 0. Its
whole subject is one declaration at `workflows/work-package/workflow.yaml:15` and eight reference
sites, and `grep -rn "ref:" --include=*.yaml workflows/*/activities/` returns exactly those eight
lines: `04-research.yaml:224` and `:243`, `05-implementation-analysis.yaml:126` and `:145`,
`07-assumptions-review.yaml:112` and `:130`, `08-implement.yaml:202` and `:221`.
`grep -rn "fragments" --include=*.yaml --include=*.yml workflows/` returns two lines, the
declaration and a changelog message at `12-strategic-review.yaml:196` that means a different thing
by the word.

### CR1 — Five rules with no subject left · REMOVE · CONFIRMED

**Reproduced.** The nine rules are the union at `scripts/check-fragments.ts:57-65`. The five in this
candidate are raised at `:207-208` (`malformed-ref` / `unresolved-ref`), `:199` and `:212`
(`ref-body-conflict`), `:176` (`ref-opens-step`) and `:218` (`undeclared-effect-variable`). All but
`ref-opens-step` fire inside the `typeof ref === 'string'` branch at `:196`; `ref-opens-step` fires
on the raw-text regex at `:175`. `ref` is a field on `CheckpointStepSchema`
(`src/schema/activity.schema.ts:134`) and on no other step kind — `StepSchema` at `:167-172` has
four members and the other three are closed objects without it. Zero findings today.

**Verdict stands.** Each of the five loses its subject when `ref` and `fragments.checkpoints` leave
the schema. Two of the sweep's five sub-arguments need correcting and one is refuted.

Refuted: the `ref-opens-step` discharge argument, worked through at [P3](#p3-the-hazard-ref-opens-step-polices-is-not-discharged-by-the-closed-object).
The rule goes and the hazard survives, which is what the ground-truth record says and what the
sweep talks itself out of.

Corrected: the sweep writes that the loop at `check-fragments.ts:169-171` means "`remediate-vuln`'s
fourteen borrowed ref-carrying activities are never audited under `remediate-vuln`". The phrasing
comes from [fragment-mechanism.md:156-164](../ground-truth/fragment-mechanism.md) and it overcounts.
`workflows/remediate-vuln/workflow.yaml:203-216` borrows **fourteen** `work-package` activities, of
which **four** carry `ref` steps — `04-research`, `05-implementation-analysis`,
`07-assumptions-review`, `08-implement` — for the eight sites. The hole is real and it is four
files wide, not fourteen. It is benign because `declaredVariables` resolves borrowed activities into
the borrower's set (`scripts/workflow-declarations.ts:61-71`), which reproduces as stated.

Confirmed as stated: `ref-body-conflict` is a prohibition with two homes to police and nothing left
to prohibit once one home goes, which is principle 35 working as written (see CR22); the
`Malformed` state gap (see [P6](#p6-the-reference-lifecycle-has-no-malformed-state)); and
`undeclared-effect-variable`'s cross-workflow reach being carried by output injection
(README:1095-1101).

### CR2 — `unused-fragment` · REMOVE, reclassified from DEPRECATE · CONFIRMED

**Reproduced.** One emission site, `check-fragments.ts:242`, inside the registry sweep at
`:235-250`; header statement at `:18`. Two declared fragments, both used.

**Reclassified.** The sweep's case is that the rule keeps its subject — "an unreferenced routine is
exactly the same defect" — and so must be amended rather than deleted. The rule's subject is a
`fragments.checkpoints` entry. After stage 5 there are none, so the rule is vacuous, and a vacuous
rule is deleted. That the same *defect shape* recurs on a different construct is an obligation
transferring to a new home (stage 4's load failure, README:878), not the old rule surviving. The
sweep's own CR1 treats vacuity as REMOVE; treating CR2 differently is the inconsistency, and the
verdict that follows from the evidence is REMOVE.

This is one of two places I moved a verdict up the ladder rather than down, and the reason is that
it makes the plan simpler rather than stronger: nothing is amended, one thing is deleted, and one
new thing is owed. The new thing is [P5](#p5-unused-fragments-corpus-wide-reach-is-not-free-at-the-load),
and both halves of the sweep's warning about it survive — a load failure fires only when something
loads the file, and the guard's reach is corpus-wide by construction while the loader's is not.

### CR3 — `inline-duplicate-of-fragment` · REMOVE, reclassified from DEPRECATE · CONFIRMED

**Reproduced.** One emission site at `:247`, inside the same registry sweep; header at `:19-20`; the
normalisation is `normalizeCheckpointBody` at `:74-94`, which keeps message, blocking, defaultOption,
autoAdvanceMs and each option's id, label, description and effect, and drops step id and site gates.
Zero findings today. The guard's own header names the reason it exists in both directions at `:5-6`.

**Reclassified, for the same reason as CR2.** "An inline checkpoint body identical to a declared
fragment" has no subject after stage 5. The rule is deleted.

**And the sweep's real finding survives intact, as a plan defect.** The purpose does have a subject
and after stage 5 it has no home, for the three reasons the sweep gives, each of which I checked and
each of which holds: `sites.length >= 2` at `:267`; the non-recursive `activities/`-scoped collection
at `:169-171`; and stage 1's criterion being written over activity files (README:822-823). See
[P4](#p4-the-re-inlining-comparison-has-no-home-after-stage-5), and see
[P2](#p2-a-fifth-occurrence-of-the-fan-out-run-that-the-design-never-names) for the live site that
would land in the gap.

### CR4 — `duplicate-checkpoint`'s remedy names the retiring mechanism · DEPRECATE · CONFIRMED

**Reproduced.** Two prose sites in one file: the header at `:24-25` and the detail string at `:269`,
which ends "— extract a fragment". The rule's path — collection at `:224-229`, emission at
`:266-271` — touches no `ref` value and no `fragments` block, so its detect is wider than the
mechanism, exactly as [fragment-mechanism.md:135](../ground-truth/fragment-mechanism.md) records.
Zero findings, so the string has never printed.

**Verdict stands.** The remedy has to name a routine, and `decisions.md:443-444` supplies the
destination for the lone-gate case in the design's own words: "a shared gate that is *not* part of a
larger run becomes a one-step routine rather than keeping a second mechanism alive for that case."
The blast-radius reading holds too — changing the string early is free because it prints only on a
finding.

### CR5 — `duplicate-rule` is untouched · KEEP · CONFIRMED

**Reproduced.** One emission site at `:257-263`. The index it reads is built from `rules.workflow`,
`rules.activity` and `rules.universal` in each `workflow.yaml` (`:153-166`) plus activity-file
`rules[]` (`:181-191`), with a 30-character floor at `:52`. Measured over the pinned corpus by
parsing every `workflows/*/workflow.yaml`: **17 files, 13 carrying a `rules:` key, 12 carrying
text** — `codebase-wiki/workflow.yaml` has the key and no entries — and **zero** of 122 activity
files carrying a non-empty `rules[]`. Both figures are the sweep's exactly. On the live tree the
same census gives 18 workflow files, 13 with a key, 12 with text, and zero activity `rules[]`.

**Verdict stands, with a corrected citation.** The sweep gives `WorkflowFragmentsSchema` as
`src/schema/workflow.schema.ts:38-41`; it is at `:40-42`, `.strict()` on `:42`, and the file is
byte-identical in that region at `9ca71c19` and at `HEAD`. The three discriminators hold and I add a
fourth in the keep list.

### CR6 — The registry entry states a claim that stops being true · DEPRECATE · CONFIRMED

**Reproduced.** `scripts/guards.ts:252-258`: `id: 'fragments'` (`:252`),
`script: 'scripts/check-fragments.ts'` (`:253`), `npmScript: 'check:fragments'` (`:254`),
`scope: 'corpus'` (`:255`), `json: false` (`:256`), and
`proves: 'every checkpoint fragment ref resolves, is used, and is not inlined twice'` (`:257`).
Wired at `package.json:43`. One row of **40** — `GUARDS` opens at `:28` and the array closes at
`:347`. `tests/guard-registry.test.ts:38` is quoted correctly and asserts non-emptiness only:
`expect(GUARDS.filter((g) => g.proves.trim().length === 0)).toEqual([])`. The reconciliation test at
`:67-86` starts from the files on disk, and `ls scripts/ | grep -E "^(check|validate)-.*\.ts$" | wc -l`
gives **44**, so the 44-against-40 framing reproduces.

**Verdict stands.** All three clauses of `proves` lose their subject at stage 5 while the script
survives carrying two rules that are not about fragments, so the claim becomes false and has to be
amended in the same commit.

The blast-radius mechanism reproduces exactly: `scripts/check-delta.ts:19-21` states that guards
outside the `--json` protocol "are compared by exit code and by new output lines", and `:172-173`
parses findings only when `guard.json`, so a rewritten clean-run message at `check-fragments.ts:280`
reads as new output on a delta run.

**One figure corrected.** The sweep calls this "one of the 18 with `json: false`".
`grep -c "json: false" scripts/guards.ts` gives **16**. Parsing the 40 entries: 22 declare
`json: true`, 16 declare `json: false`, and **2 declare no `json` key at all** —
`inherited-inputs` and `section-framing`. So 18 guards lack the finding protocol and 16 declare its
absence; the sweep's number is right about the population and wrong as stated.

---

## Corpus canon

### CR7 — The checkpoint-fragment row is canon's only home for the mechanism · DEPRECATE · CONFIRMED

**Reproduced.** `workflows/workflow-design/resources/schema-construct-inventory.md:68` maps "Several
activities ask the user the same question" to **Checkpoint fragment**:
`fragments.checkpoints.<name>` plus "a `kind: checkpoint` step reaches it by `ref: [workflow::]name`".

The reach reproduces exactly, and it is the sweep's most careful measurement. Excluding the file
itself, the inventory is cited from **ten** files at eleven lines:
`workflow-design/techniques/yaml-authoring.md:39`, `context-loading.md:45`,
`audit-expressiveness.md:36`, `workflow-design/README.md:153` and `:237`,
`workflow-design/resources/README.md:14` and `:105`, `anti-patterns.md:1501`,
`workflow-authoring/resources/README.md:47`,
`workflow-authoring/techniques/workflow-definition/audit-canon.md:62`, and
`workflow-authoring/techniques/workflow-definition/yaml-authoring.md:44`. The last of those cites
the row's own section by anchor, and `audit-canon.md:62` takes one enumeration unit per `##` section
of the inventory, of which there are 7. `audit-expressiveness.md:36` calls the inventory the "sole
source of informal→formal construct mappings for this pass" and `:37` forbids restating it, so the
row is applied as written; `:44-48` is the persist-findings step that makes the pass gate on what it
found.

**Verdict stands.** The row's Formal Construct column names something the schema no longer admits
after stage 5, so it is false and must be amended in that commit, to `routines/<name>.yaml` plus
`kind: routine` per `decisions.md:443-444`.

**And the row's solitude reproduces.** `grep -c "fragment" anti-patterns.md` returns **0** across
151 `AP-NN` entries. `grep -c "fragment" design-principles.md` returns **1**, and it is a nominal
collision: `design-principles.md:137` uses the word for a section of a multi-part resource, not for
a shared gate body. That is the failure mode the sweep is being tested for and it did not fall into
it — the word is not counted.

### CR8 — The loop step's field list names a field the load refuses · STALE · CONFIRMED

**Reproduced.** `schema-construct-inventory.md:47` gives the loop step's fields as `.loopType`,
`.variable`, `.over`, `.condition`, `.breakCondition`, `.maxIterations` and optional `.name`.
`LoopStepSchema` (`src/schema/activity.schema.ts:152-164`) is a closed object of twelve fields —
kind, id, name, loopType, continueWhile, variable, over, breakCondition, maxIterations, steps, plus
`when` and `required` from `stepCommonFields` spread at `:163` — and closes with `.strict()` at
`:164`. It spreads `stepCommonFields` alone: no `stepEntryCondition`, so no `condition`.
`continueWhile` is at `:157`.

I re-took the corpus figure by walking every loop step in every activity file at the pinned corpus:
**54 loop steps, 0 carrying `condition`, 0 carrying `breakCondition`, 27 carrying `continueWhile`**.
The first two reproduce [stage-0-state.md](../ground-truth/stage-0-state.md) and the proposal's claim
that `breakCondition` "sits at zero sites" (README:792).

**Verdict stands.** The row names a field that fails the load and omits the one that carries the
test. Its relevance to routines is the sweep's: a routine body holds loops, and the proposal puts
`check-loop-shape` at "walks `routines/`? **Yes**" (README:1027), so an author writing a routine's
loop reads this row.

### CR9 — "A shared base field on every step kind" is true of one field and false of the other · STALE · CONFIRMED

**Reproduced.** `schema-construct-inventory.md:52` maps "Only run when X is true" to **Step gate**:
"`steps[].when` / `steps[].condition` (references condition.schema.json) — a shared base field on
every step kind". `stepCommonFields` (`src/schema/activity.schema.ts:73-78`, holding `when` and
`required`) is spread on all four members, at `:100`, `:109`, `:139` and `:163`.
`stepEntryCondition` (`:84-86`, holding `condition`) is spread on three — `:101`, `:110`, `:140` —
and not on the loop. The comment at `:80-83` states the rule directly.

**Verdict stands.** One sentence asserts of two fields what is true of one. Recorded because a
`kind: routine` step is the fifth member the row will speak for and it takes the site gates every
step kind carries (README:281), so the correction wants to precede the widening.

### CR10 — The variable contract row · NARROWS, downgraded from DEPRECATE · PLAUSIBLE

**Reproduced.** `schema-construct-inventory.md:54` states two load-bearing things:
`variables.writes[]` holds "full declarations for what it puts in the bag — operation outputs, remap
targets, checkpoint `setVariable` keys, `set` targets, loop items", and "two declarations of one
name that disagree on `type` or `defaultValue` fail the load (`check:activity-variables`)". The row
sits in the Activity-Level Constructs section, one of the 7 `##` units `audit-canon.md:62` walks.
The guard it cites is hard zero with no ledger (`scripts/check-activity-variables.ts:25`) and
consumes the loader (`:34`).

**Second arm withdrawn.** The sweep says the row's merge rule "changes" at stage 4 and quotes
README:1102-1104 for the change. That change landed with stage 0 and the row is unaffected by it —
see [P7](#p7-the-proposal-costs-a-variable-merge-change-that-landed-with-stage-0). Read against the
code as it stands, the row is also still *true*: `disagreement` reports a default conflict only
where both declarations name one, and the row says "declarations … that disagree on `type` or
`defaultValue`", which is what the code does. A routine output declaring no default (README:1090-1094)
therefore raises nothing, and the row needs no edit on this account.

**First arm downgraded.** The row's enumeration lists five sources and every one is something an
author writes. Stage 4 adds a sixth the author does not write: the loader injects a routine's bound
outputs into the referring activity's `variables.writes` during materialisation
(README:1095-1101), "only where the referring activity does not already declare the bound name"
(README:1100). That does not make the row false — it remains an accurate instruction about what an
author writes, and README:1108-1112 confirms a hand-written declaration still wins. It makes the row
*incomplete* about where a declaration can come from, which is an addition rather than an
amendment. Same for "loop items": a loop inside a routine becomes an internal (README:194-198), and
a loop in an activity's own steps stays an activity write, so the example narrows without becoming
wrong.

The confidence is PLAUSIBLE rather than CONFIRMED for one reason, and it is the reason the addition
is worth making: the row is a walked enumeration unit, and a reviewer applying it to a converted
activity that declares none of the bound names by hand would report a missing declaration the loader
supplies. That is a false positive the addition prevents. The mechanical half of the same problem is
[P8](#p8-check-activity-variables-fires-at-stage-3-and-the-mechanism-is-unspecified).

### CR11 — Eleven closed enumerations of the four step kinds · DEPRECATE · CONFIRMED

**Reproduced exactly.** `grep -rnE "action.*checkpoint.*loop" --include=*.md workflows/ docs/ schemas/`
returns eleven lines and no false positive, at the eleven line numbers the sweep names:
`schema-construct-inventory.md:31` and `:45`, `format-conventions.md:33`, and `schemas/README.md:46`,
`:83`, `:100`, `:299`, `:322`, `:560`, `:1122` and `:1153`. Three corpus canon sites, eight in the
schema documentation. The Zod union is `src/schema/activity.schema.ts:167-172`.

**Verdict stands.** A fifth member makes each false in the sense that matters most for `:322`
("Required discriminator: `technique`, `action`, `checkpoint`, or `loop`") and `:83` ("each step a
kind: technique, action, checkpoint, or loop") — a field table telling an author a valid value is
invalid. `:45` is wrong in the second way the sweep names as well: a `kind: routine` step needs no
`technique` binding either.

Two supporting claims reproduce. `format-conventions.md:33` sits inside a fenced template block
opening at `:14` and closing at `:54`, and `scripts/check-technique-template.ts:25` states the
convention a fence-skipping guard follows: "Headings and sigils inside fenced code blocks are
illustrative — skipped". `schemas/README.md` is cited by five corpus files, and they are the five
the sweep names: `workflow-design/techniques/yaml-authoring.md:34`, `context-loading.md:41`,
`reconcile-design-assumptions.md:39`, `schema-construct-inventory.md:19-25`, and
`workflow-authoring/techniques/workflow-definition/yaml-authoring.md:38`.

**One claim refuted and the count extended**, at
[P10](#p10-the-step-kind-enumeration-set-is-four-sites-short-and-one-of-the-four-is-generated). The
enumeration lives at four further sites the markdown grep cannot reach, one of them a generated
file, so "the generated JSON schema follows the Zod source automatically" is true of the structure
and false of `schemas/activity.schema.json:4`.

### CR12 — Three closed enumerations of what may not be inlined · KEEP, downgraded from DEPRECATE · CONFIRMED

**Reproduced.** `design-principles.md:101-103` is principle 22 Modular Over Inline: "Constructs live
in their own files. Parents reference siblings; they do not embed activity, technique, or resource
bodies inline." `anti-patterns.md:88` is AP-01 `no-inline-content`'s Detect. `anti-patterns.md:288`
is AP-17's Detect, `:290` its Do-not-flag, `:292` its Fix. AP-01 sits under
`## Structural Anti-Patterns` (`:78`), the unit `audit-canon.md:65` enumerates, and its Fix at `:92`
cites principle 22.

**AP-17's arm is withdrawn.** The sweep says an auditor applying AP-17's "structural fields only" to
a `kind: routine` step would flag `with:` and `outputs:` as prose. AP-17's Detect is scoped by kind:
"A `kind: technique` or `kind: action` step that binds an op still carries `description` or `name`"
(`:288`). A `kind: routine` step is neither, so the entry never fires on one and its Fix sentence is
never reached. The Do-not-flag at `:290` exists to spare an auditor from checking loop and
checkpoint steps that the Detect *does* pattern-match on structure; a routine step needs no entry
there for the same reason a workflow-level `variables` block needs none. This is reasoning from what
an auditor might do with a Fix rather than from the Detect that decides whether the entry applies.

**The other two arms downgrade to KEEP, with three discriminators.**

First, there is no channel to inline a routine body. The reference step is a closed object carrying
`routine`, `with`, `outputs`, its id and the site gates (README:279-291); nothing in the design
admits a routine declared inside `workflow.yaml` or inside an activity. The gap principle 22 would
be widened to cover is unreachable.

Second, AP-01's Detect already reaches an inline-authored routine through its general second clause:
"An activity, technique, or resource body is inlined into a parent YAML/markdown file **(or a new
construct is authored inline rather than as a sibling file)**" (`:88`). The enumeration in the first
clause is not the whole test.

Third, principle 22's list is already narrower than the corpus and is not read as closed: a
checkpoint fragment body *is* a body inlined into `workflow.yaml`, and the principle does not
mention checkpoint bodies. A list that has been living beside a counter-example does not become
false when a fourth kind appears.

**One citation corrected.** The sweep's blast radius quotes the catalogue's Creation Rules as
requiring a Fix to state "portable remediation (delete, migrate, encode, rename)" and cites
`anti-patterns.md:41`. Line 41 says "Fix states portable remediation (and may link a principle for
the target stance)". The parenthetical the sweep quotes is at `:59`. The claim is right; its address
is wrong, and CR21's argument leans on the same quote.

### CR13 — `docs/checkpoint-model.md` is the mechanism's prose home for a guard · DEPRECATE · CONFIRMED

**Reproduced.** `docs/checkpoint-model.md:113` is the `ref` row in the "Declaring a checkpoint" field
table — "Names a shared checkpoint body instead of writing one inline" — and `:116` is a whole
paragraph on the mechanism ending "The `check:fragments` guard rejects an inline body that duplicates
a fragment." `scripts/check-decision-order.ts:8` names this file as the recorded home for that
guard's keying rules and their reasons, pointing at "§ Where a Checkpoint Belongs", the section
opening at `:118`. Outside the planning folder its only other readers are two site pages,
`site/specifications.html:89` and `site/specs/checkpoints.html:72`; no corpus file cites it.

**Verdict stands.** Both the field row and the paragraph become false at stage 5, and the paragraph
is the fullest prose statement of the mechanism anywhere in the repository, so it is where a reader
lands after the schema. The staleness would sit one hop from a live guard that still points at the
file.

### CR14 — Four statements of the mechanism in the schema documentation · DEPRECATE · CONFIRMED

**Reproduced.** `schemas/README.md:279` is the workflow `fragments` field row; `:335` is the "By
reference" authoring form for a checkpoint step, which also names `check:fragments`; `:341` is the
checkpoint `ref` field row; `:500` is the `fragments` row in the second workflow field table. The
document is the one `schema-construct-inventory.md:19-25` names as the documentation home for every
schema, and five corpus files send an author there.

**Verdict stands.** Each describes a construct the schema no longer admits, and `:335` additionally
names a guard whose rules are gone.

**One figure corrected.** `schemas/` holds six JSON schemas and five are generated; see
[P10](#p10-the-step-kind-enumeration-set-is-four-sites-short-and-one-of-the-four-is-generated). The
rest of the blast radius reproduces: this README is not generated, there is no `--check` mode in
`scripts/generate-schemas.ts`, and `build:schemas` sits at `package.json:10` and in no CI entry
point, so nothing catches the four rows either way. Stage 3 adds a seventh schema file to the same
directory and a routines section to the same document.

### CR15 — The rules half of the mechanism is already gone and two readers still describe it · STALE · CONFIRMED

**Reproduced, with corrected citations.** `schemas/README.md:499` gives `rules` as
`{ workflow?, activity?, universal?: (string \| { ref })[] }` and says "Entries are rule strings or
`{ ref }` fragment imports". `scripts/check-checkpoint-presentation.ts:23` states the guard's scope
as "`rules.workflow`, `rules.activity`, `rules.universal` and `fragments.rules` in every
`workflow.yaml`"; `:88-90` describes reading a rule fragment and names a site —
"`remediate-vuln`'s orchestration-model fragment is a string"; `:148-158` is the code path reading
`fragments['rules']`.

Against the schema: `WorkflowRulesSchema` declares all three buckets as `z.array(z.string())` at
`src/schema/workflow.schema.ts:29-33`, and `WorkflowFragmentsSchema` at `:40-42` has one key,
`checkpoints`, and is `.strict()`. The sweep cites those as `:47-51` and `:38-41`; `:47-51` is the
doc comment of `InstanceFanSchema`, and the file is identical in this region at `9ca71c19` and at
`HEAD`, so neither citation was right at its own pin. `fragments.rules` is unrepresentable and a
`{ ref }` entry in a rules bucket fails the load.
`grep -n "fragments" workflows/remediate-vuln/workflow.yaml` exits 1: the workflow the comment names
has no `fragments` key. And `schemas/README.md:279` gives the same field as
`{ workflow?, activity?, universal?: string[] }`, contradicting `:499` four hundred lines away.

**Verdict stands.** Already false today, independent of routines, and it changes what CR6 costs: the
guard the proposal assesses as "it audits rule buckets against the engine's presentation contract,
and a routine declares no rules" (README:1029) carries a dead branch and a false site claim while
that assessment is being made. The proposal is right about routines and silent about the branch.

### CR16 — A guard's stated reason for its own scan dies with the mechanism · DEPRECATE · CONFIRMED

**Reproduced.** `scripts/check-set-action-values.ts:173-174` is the comment: "`workflow.yaml` too: a
workflow root carries checkpoint fragments, and a `setVariable` there writes the bag exactly as one
inside an activity does." The scan it justifies is `:175-177`. The guard is hard zero with no
baseline (`:27-28`).

**Verdict stands.** No workflow root carries a checkpoint fragment after the migration, so the
stated reason evaporates while the scan may still be right. The fix is the sentence, not the scan —
which is also why the scan is in the keep list.

### CR17 — The guard roster an auditor is handed names the mechanism · DEPRECATE · CONFIRMED

**Reproduced.** `workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:29`
is the Protocol bullet: "`check-fragments.ts` — every fragment reference resolves, every fragment is
used, and no inline body duplicates a fragment or another site". The roster is hand-maintained and
holds two validators at `:22-23` plus thirteen guards at `:25-37` — the sweep's count of "13 guards
plus the two validators" reproduces, though its range `:22-33` stops four bullets short of the
roster's end at `:37`. Against a 40-entry registry that leaves the roster 25 entries short, which
also reproduces, the two validators being registry entries (`tests/guard-registry.test.ts:60`
requires ids `refs`, `activities` and `workflow-yaml`). The technique's `## Rules` section opens at
`:44` with `guard-green-is-narrow-evidence` at `:46-48`, so the roster is Protocol rather than Rules.

**Verdict stands.** All three clauses lose their subject at stage 5 — the bullet is a paraphrase of
CR6's `proves` string — and nothing reconciles the roster: `tests/guard-registry.test.ts:67-86`
reconciles the registry against the scripts on disk, not against this list. An auditor following the
bullet after stage 5 runs a guard whose two remaining rules have nothing to do with what the bullet
promises, and records coverage it did not get, which is what the technique's own
`guard-green-is-narrow-evidence` warns about from a different direction.

---

## The orchestration surface

This is where the corpus has moved under the sweep, and two of its three candidates change verdict
as a result.

### CR18 — `prefer-activity-composition` · KEEP, downgraded from DEPRECATE · CONFIRMED

**Reproduced.** At `2b8b7215` the rule sits at `meta/techniques/orchestration-patterns/TECHNIQUE.md:64-66`,
where `:64` is the heading `### prefer-activity-composition` and `:66` the rule text: "Multi-op
pipelines (decompose → dispatch → gather → synthesise) are bound as activity steps or borrowed
pattern activities under `meta/activities/patterns/`. These ops do not `Apply` sibling
orchestration-patterns operations for work." On the live tree the same text sits at `:60-62`,
unchanged word for word. It is a rule on a container `TECHNIQUE.md`, so it is inherited by every
operation in the group, and the group holds **12** nested operations.

The four sites the sweep measures reproduce exactly at the pinned corpus:
`01-orchestrator-workers.yaml:37-51`, `04-isolated-fan-out.yaml:38-61` with the intervening
`require-complete` validate action at `:53-58`, `05-lead-researcher.yaml:41-55`, and
`05-lead-researcher.yaml:70-84` inside the `gap-followup` loop declared at `:59`. Two of the four
files are gone from the tree.

**Downgraded to KEEP, on three discriminators.**

First, the rule's text is not a copy instruction. "Bound as activity steps" names the layer the
pipeline lives at — an activity's `steps[]` rather than a technique's Protocol `Apply` chain — and a
`kind: routine` step is an activity step whose materialisation produces exactly those bindings. The
sweep reads the clause as "bind each op as its own step", which is stronger than the words carry and
is not what the rule is for: its second sentence, "These ops do not `Apply` sibling
orchestration-patterns operations for work", names the boundary the whole rule polices.

Second, if the enumeration is incomplete the fix is an addition — a third clause naming the routine
— and the sweep says so itself ("The remedy is a third clause naming the routine, not a rewrite").
An accurate rule whose fix is an addition is CR23's own KEEP shape.

Third, the destination this rule points at has already moved, and not toward a routine. Two of the
five pattern activities it names are retired, and the canon's live answer for the shape is a graph
instance fan: `schema-construct-inventory.md:38` and `:41`, and
`meta/activities/patterns/README.md:9`. A rule amended to name a routine at stage 8 would be
amended against a corpus that answered the same question a different way.

The population fact stands and is worth carrying: the pipeline is authored out at two places today,
both in `05-lead-researcher.yaml`, and the instrument reports no cross-file four-step window for it
at all.

### CR19 — Canon instructs an author to copy a step pipeline · DEPRECATE · PLAUSIBLE

**Reproduced, at a new line.** The sentence is `meta/activities/patterns/README.md:39` on the live
tree and `:40` at `2b8b7215`: "Wire your own `transitions` in a thin local wrapper activity when the
borrowed file has none, or copy the step pipeline into a local activity and bind the same ops with
input overrides."

The uniqueness claim reproduces.
`grep -rn "copy the step\|copy the pipeline\|copy the run\|copy these steps\|duplicate the step" --include=*.md workflows/`
returns exactly this one line. It is the only sentence in the corpus telling an author to copy a run
of steps rather than reference it.

**Verdict stands, at reduced confidence, and the reach claim is refuted.** The sweep says the README
is pointed at by "`schema-construct-inventory.md:41` and `:42` plus `design-principles.md:119` and
`:87`". Measured: `grep -rn "activities/patterns/README" --include=*.md --include=*.yaml workflows/`
returns three lines — `meta/README.md:29`, `design-principles.md:119` and `anti-patterns.md:1439`.
Inventory `:41` and `:42` point at the *activity files* `04-isolated-fan-out.yaml` and
`05-lead-researcher.yaml` (and `:41` now points at neither, having become the `isolation: worktree`
fan row), and `design-principles.md:87` — principle 18 — does not mention the pattern directory at
all; it points at `orchestration-patterns/TECHNIQUE.md`.

The verdict is PLAUSIBLE rather than CONFIRMED because of what the sentence is for. It answers the
case where a borrowed activity carries no transitions of its own, and a routine does not answer that
case by itself: a routine cannot take a place in the graph (README:746-748), so the author still
needs the local activity and the change is from "copy the pipeline into it" to "reference the
routine from it". That is a real change of destination inside one clause, which is why the verdict
holds — but it is one clause of a fallback whose subject survives, not a misrouting of the whole
sentence. The sweep's further claim that this instruction "is the practice that produced the four
occurrences CR18 measures" no longer has four occurrences behind it, and the two that went were
retired in favour of the graph fan rather than converted.

The double-ungraded observation reproduces and is now stronger in proportion:
`npx tsx scripts/validate-activities.ts workflows` prints "Total: 125 passed" against 128 activity
YAML files, so the three surviving pattern files validate against nothing, and the corpus states the
reason at `schema-construct-inventory.md:37` — the subdirectory is library-only and not part of
meta's lifecycle graph.

### CR20 — AP-38's classification · KEEP, downgraded from NARROWS · CONFIRMED

**Reproduced.** `anti-patterns.md:542-552` is AP-38 `no-duplicate-technique-steps`. Detect at `:548`
classifies N steps binding one technique in one activity as (a) redundant re-execution, (b) unrolled
iteration, (c) monolith-masking. Do-not-flag at `:550` carries four carve-outs, of which two are the
sweep's: "distinct-purpose invocations at different pipeline points" and "same op as distinct phases
inside one loop iteration". The entry is cited by name from `anti-patterns.md:302`, AP-18's
Do-not-flag, and nowhere else in the corpus; `grep -rn "no-duplicate-technique-steps"` over
`workflows/ docs/ scripts/ src/ schemas/` returns that line and the heading.

`05-lead-researcher.yaml` binds five operations twice each in one activity, and four of the sweep's
five line pairs are exact: `compose-worker-briefs` at `:43` and `:72`, `dispatch-workers` at `:46`
and `:75`, `synthesise-results` at `:55` and `:84`, `assess-research-gaps` at `:58` and `:87`. The
fifth is off by one in both halves: `gather-results` is bound at `:50` and `:79`, the sweep's `:49`
and `:78` being the `technique:` key lines above the `name:` values.

**Downgraded to KEEP, on three discriminators.**

First, the entry's test does not change and the sweep says so — "The entry is not false and its
exemptions are correct as written". What changes is the population, and only if stage 8 converts the
two occurrences: after conversion an auditor reading the file sees two `kind: routine` steps, which
is not "two or more step definitions … bind the same technique reference", so the five pairs leave
its subject. That is an incidental consequence of a migration, not an edit the entry owes.

Second, the fourth arm the sweep proposes duplicates CR21's proposed entry, and would land in the
wrong family — see [P9](#p9-ap-38s-proposed-fourth-arm-and-cr21s-proposed-new-entry-are-two-homes-for-one-rule).
An action that the design should not take is not a verdict on the construct.

Third, a correction that sharpens the same point: the sweep says all ten occurrences are "exempted
by the two Do-not-flag clauses". One clause does the work. Each pair is one top-level occurrence and
one inside the `gap-followup` loop body, so "distinct-purpose invocations at different pipeline
points" applies to all five and "same op as distinct phases inside one loop iteration" applies to
none — that clause covers two occurrences *within* one loop iteration, which the corpus does not
have here.

---

## Rules the construct makes statable, and rules that pass on their merits

### CR21 — There is no rule anywhere for a run repeated across activities · KEEP · CONFIRMED

**Reproduced, every figure.** `grep -c "fragment" anti-patterns.md` returns 0 across 151 entries.
`grep -n "across activities\|two or more activities\|several activities\|two or more sites"` over
`anti-patterns.md`, `design-principles.md` and `schema-construct-inventory.md` exits 1 with no
output. The near-miss entries are all scoped elsewhere and each is where the sweep says: AP-38 at
`:542` within one activity, AP-110 `duplicate-shared-capability` at `:1433`, AP-22
`single-rule-authority` at `:346`, AP-61 `factor-repeated-paths` at `:825`, AP-39
`hoist-universal-techniques` at `:554`. I read all 35 `##` sections of design-principles: 18 Prefer
Shared Capability (`:85-87`) is about a capability a technique owns, 22 Modular Over Inline
(`:101-103`) about files, 26 Atomic Techniques (`:117-119`) about technique-to-technique calls and
whole-activity borrowing, 34 SOLID at the Definition Layer (`:155-159`) the nearest abstract
statement. None reaches a sub-activity run.

**The measured population reproduces independently.** Running `measure/repeated-runs.py` against the
extracted pinned corpus gives "activity files parsed: 122 / maximal shared windows: 26 (top level
21, inside a loop body 5)" — the sweep's split exactly. And I re-took the convergence figure from
raw text rather than from prose: extracting every `kind: loop` block whose body binds
`analyse-challenge::challenge` and hashing the block text gives **six sites under one SHA-256** —
`02-design-philosophy.yaml:177-207`, `04-research.yaml:137-167`,
`05-implementation-analysis.yaml:83-113`, `06-plan-prepare.yaml:115-145`,
`07-assumptions-review.yaml:74-104`, `08-implement.yaml:159-189` — each **32 lines**, for 192 lines,
plus one variant at `15-codebase-comprehension.yaml:79-156`, which my delimiter measures at 79 lines
where the proposal says 75.

**Verdict stands.** Nothing to remove, and the reason the entry cannot be written yet reproduces:
an entry's Fix must state portable remediation, and until stage 3 there is no construct to migrate a
shared run into. The one correction is the address of that requirement — `anti-patterns.md:59`, not
`:41`. The sweep's warning about sequencing also holds: stage 1 lands the guard and creates a
measured population, so writing the entry with the guard rather than after stage 8 avoids a stretch
where a defect is counted and unnamed. Its home is `## Structural Anti-Patterns` (`:78`), and it is
the one home — see [P9](#p9-ap-38s-proposed-fourth-arm-and-cr21s-proposed-new-entry-are-two-homes-for-one-rule).

### CR22 — Principle 35 is the canon warrant for the migration · KEEP · CONFIRMED

**Reproduced.** `design-principles.md:161-163` is principle 35 Prefer Removing the Thing That Needs
a Prohibition, quoted correctly, and it carries a third sentence the sweep does not quote but does
rely on: "Where both paths must survive, the prohibition names the home that owns the surviving
behaviour rather than restating it." One `##` section, walked as an enumeration unit by
`audit-canon.md:62`.

**Verdict stands, and the principle does the work the sweep asks of it.**
`ref-body-conflict` is a prohibition that exists only to police two homes for one gate body: it
fires at `check-fragments.ts:199` when a ref step also declares body fields and at `:212` when a
condition sits on both step and fragment, and `src/schema/activity.schema.ts:126-130` states the
two-form authoring rule it enforces. Both carve-outs go with the mechanism.

The reverse reading holds too, and I checked the design's own prohibitions against the principle
rather than taking the sweep's word. "A routine whose body declares an artifact may be referenced at
most once per activity" (README:1143-1144) exists because an artifact filename is the host activity's
numeric prefix plus the technique's bare filename and a routine has no prefix of its own — one
construct with a structural collision, not two constructs doing one job. The no-recursion rule
(README:326) and the no-free-variables rule (README:210-214) have the same shape.

### CR23 — Two literacy tables that look misrouted and are merely silent · KEEP · CONFIRMED

**Reproduced.** `convention-conformance.md:16` is the File naming row — "Activities `NN-name.yaml`;
techniques/resources kebab-case `.md`" — and `:20` the Checkpoint structure row — "Inline
`kind: checkpoint` steps with `message`, `options`, effects — same shapes as references". The same
pair sits at `format-conventions.md:29` and `:35`, inside the fenced template block `:14-54`.
`convention-conformance.md` has one `##` section, so it is a whole enumeration unit for
`audit-canon.md:62`, and `reconcile-design-assumptions.md:39` cites it as a criteria home.

**Verdict stands, and both discriminators check out.** `:16` is incomplete rather than false: a
routine is not an activity, so "Activities `NN-name.yaml`" stays true, and a routine file is
`routines/<name>.yaml` with no position number (README:182-184), which the row does not speak to. The
row is not inert either — `convention-conformance.md:23` sends a divergence to `no-invented-naming`,
and AP-04 at `anti-patterns.md:118-128` handles it correctly as written, its Fix being "propose the
new convention and get approval before adopting it".

`:20` and `format-conventions.md:35` give the inline checkpoint as the convention and never mention
the ref form, which is the form that survives, so neither row is misrouted. That is also the
evidence for CR7's solitude: two conformance surfaces, 151 anti-pattern entries and 35 design
principles say nothing about the fragment mechanism, and its single canon home is one row in the
construct inventory.

### CR24 — The `::` resolution rule is the one canon home routines inherit unchanged · KEEP · CONFIRMED

**Reproduced.** `meta/resources/workflow-canonical.md:34-37`: "A technique is addressed by its id
(the file/folder slug). A nested technique is addressed `group::sub` … Addressing uses `::` paths: a
reference to a technique in the same workflow is implicit, and resolution searches the current
workflow first, then `meta`." The ontology binds every file declaring
`metadata.ontology: workflow-canonical` (`:15-16`). `design-principles.md:123` names it as the home
for loader composition and `anti-patterns.md:1501` exempts it as an authoritative platform home.

**Verdict stands, with one refinement.** The proposal adopts this rule for routine names
(README:311-317) and reaches `meta` as the shared home by the same fallback, so the rule generalises
without an edit. But the ontology carries only the bare-name half. The other two halves the routine
reference depends on live elsewhere: qualified names resolving in that workflow only, with no
fallback, is at `src/loaders/fragment-resolver.ts:12-14` and `schemas/README.md:341`; and a borrowed
activity resolving against its source workflow rather than its borrower is at
`fragment-resolver.ts:132-135`. So this is the canon surface a refuter might expect to need a
routines clause and does not, while the rule itself is homed in three places, only one of which is
canon.

The layout observation holds and is worth keeping: the `## On-disk layout` table at `:24-28`
enumerates three shapes — standalone technique, container technique, resource — and does not mention
`activities/`, so a `routines/` row does not belong there either. Its opening sentence at `:20-22`
("A workflow's content lives under `techniques/` and `resources/` in three shapes") is already
narrower than it reads, independently of routines.

---

## The keep list

What a confident implementer would delete by mistake while executing this plan, each with the
discriminators that separate it from the thing it resembles.

**1. `duplicate-rule` (`scripts/check-fragments.ts:253-265`) — it lives in the file being gutted.**
Its index is built from the three `rules.*` buckets (`:153-166`) and activity `rules[]` (`:181-191`)
and its path never touches a `ref` value or a `fragments` block. Its remedy names the meta conduct
technique (`:261-262`), a home the migration does not touch. A routine declares no `rules` key
(README:180-230), which is why the proposal puts `check-checkpoint-presentation` at "walks
`routines/`? No" (README:1029). And rules were never shareable this way in the first place:
`WorkflowFragmentsSchema` has one key and is `.strict()` (`src/schema/workflow.schema.ts:40-42`), a
fact the resolver states at `fragment-resolver.ts:9-10`. Removing it would drop the only corpus-wide
check that two workflows have not each authored the same conduct sentence.

**2. `duplicate-checkpoint`'s rule, as distinct from its remedy (`:266-271`).** CR4 changes a
string; nothing changes the rule. Three discriminators: its detect touches no `ref` and no
`fragments` block; it is the only corpus-wide comparison of two inline gate bodies; and stage 1's
guard is not a substitute, because `measure/repeated-runs.py:64-69` signs a checkpoint as its
option ids and never compares message text, so two gates with identical options and different
messages are one signature to it and two findings to this rule.

**3. `check-checkpoint-presentation`'s live half (`:145-147`).** CR15 makes `:148-158` a dead branch
over an unrepresentable input, and the temptation is to take the guard with it. `scanRulesObject`
over the three buckets runs over 12 workflow files that carry rule text. Delete the branch at
`:148-158` and the site claim at `:88-90`; keep the guard and its scope sentence at `:23` minus the
`fragments.rules` clause.

**4. The `workflow.yaml` arm of `check-set-action-values`'s scan (`:175-177`).** CR16 kills the
comment above it, and a careless edit takes the `roots` line with the sentence. Discriminators: the
sentence names a reason, the line enumerates a path; `ActivitySchema` is importable into
`workflow.schema.ts` so a `workflow.yaml` step remains representable; and the guard is hard zero
with no baseline (`:27-28`), so a narrowed scan cannot be detected by a green run.

**5. `schema-construct-inventory.md:53`, the Activity rules row.** It maps "The agent must follow
these constraints" onto `rules[]`, and `rules[]` has **zero** instances across 122 activity files at
the pinned corpus and zero across 128 on the live tree. Having no instances is not the same as being
obsolete: `rules[]` is an activity field on a live schema, a routine declares none, and the
emptiness is a standing fact about the corpus rather than a routines consequence. The repository
states this policy for itself in a guard's own triage rationale — `check-fragments.ts:30`, "Hard-zero:
every finding is a defect in the corpus, not the guard" — and `check-activity-variables.ts:25`,
"Hard zero, no ledger: every finding named a definition defect and each was fixed in the corpus". A
population of zero is what a hard-zero rule looks like when it is working.

**6. `meta/activities/patterns/02-supervisor.yaml` and `05-lead-researcher.yaml`.** Stage 8 arrives
at this directory after two of its five files have already been retired, and the reflex is to finish
the job. Discriminators: `05-lead-researcher` is the only file in the corpus where the four-step run
occurs twice, and `README.md:67` states why the loop is what the pattern is for — "a fan opens once
and cannot re-dispatch after a synthesis" — so the graph fan does not replace it. `02-supervisor` is
the only cross-file partner left for the three-step window, and it is the site
[P2](#p2-a-fifth-occurrence-of-the-fan-out-run-that-the-design-never-names) is about. Both validate
against nothing today, so a change made here is ungraded twice over.

**7. `workflow-canonical.md:34-37`.** A surface named in a sweep of resolution rules invites an edit.
Three discriminators: the proposal adopts the rule verbatim (README:311-317); the ontology binds by
frontmatter declaration (`:15-16`) so an edit here reaches every declaring file; and its layout
table (`:24-28`) governs technique and resource shapes only, already omitting `activities/`, so
adding a `routines/` row would extend the ontology past what it governs.

**8. `format-conventions.md:33`, and the two conformance rows with it.** CR11 lists `:33` among
eleven enumerations to widen, and it sits inside a fenced template (`:14-54`) that an author fills
in rather than reads. Discriminators: a fence-skipping guard cannot see it
(`check-technique-template.ts:25`), so an edit here is unverified either way; and the template's
`## Change-relevant shapes` instruction at `:53` says "Only rows/bullets this draft will use — omit
the rest", so a row deleted from the template is a row no generated literacy page can carry.

**9. Principle 22 (`design-principles.md:101-103`) and AP-01 (`anti-patterns.md:88`).** See CR12.
Discriminators, again: AP-01's Detect carries a general second clause that already reaches a
construct authored inline; there is no schema channel to inline a routine body; and principle 22's
list already lives beside a counter-example, the checkpoint fragment body inlined into
`workflow.yaml`.

**10. AP-17's Do-not-flag (`anti-patterns.md:290`).** A fifth step kind looks like a missing
carve-out. It is not: AP-17's Detect is scoped to `kind: technique` and `kind: action` (`:288`), so
the entry never fires on a routine step, and the closed reference-step object makes the prose fields
it polices unrepresentable there anyway.

---

## Withdrawn, recorded

**CR10's second arm — "the merge rule the row states changes".** Withdrawn. The change it costs
landed with stage 0 in commit `3a36b0db`: `disagreement` at
`src/utils/activity-variables.ts:62-75` reports a default conflict only where both declarations name
one, `fillSilences` at `:82-90` takes the present default, and the doc comment at `:56-61` states
the rule. `git show 9ca71c19:src/utils/activity-variables.ts | grep -c fillSilences` returns 2, so it
was already in the tree the sweep measured, and
[gap-review.md:53](../../2026-09-03-routines/gap-review.md) records it as **Landed**. The claim was
carried from README:1102-1104 rather than re-taken. The row's disagreement sentence is true against
the code as it stands and needs no edit on this account. What survives is the correction owed to the
proposal, at [P7](#p7-the-proposal-costs-a-variable-merge-change-that-landed-with-stage-0).

**CR12's AP-17 arm — "an auditor applying AP-17's 'structural fields only' to a `kind: routine` step
flags `with:` and `outputs:` as prose".** Withdrawn. AP-17's Detect is scoped by kind at
`anti-patterns.md:288` to `kind: technique` and `kind: action`, so the entry does not fire on a
routine step and its Fix sentence at `:292` is never reached. The verdict reasoned from what an
auditor might do with a Fix rather than from the Detect that decides whether the entry applies.

---

## Figures I could not reproduce

Each is given with my own figure and the search that produced it.

| Sweep states | Measured | Search |
|---|---|---|
| "`anti-patterns.md` is cited from **17 files** in the corpus" (CR20) | **13** files contain the string `anti-patterns.md`, 12 excluding the catalogue itself; **34** files contain `anti-patterns` in any form | `grep -rl "anti-patterns.md" --include=*.md --include=*.yaml workflows/ \| wc -l` and the same for `anti-patterns`, both at the pinned corpus — these are the sweep's own stated commands |
| "`design-principles.md` from **14**" (CR20) | **15** files contain `design-principles`, **14** excluding the file itself; 12 contain `design-principles.md` | `grep -rl "design-principles" --include=*.md --include=*.yaml workflows/ \| wc -l`; the sweep's figure reproduces only if the file itself is excluded, which its command does not do |
| "it is one of the **18** with `json: false`" (CR6) | **16** entries declare `json: false`; 22 declare `json: true`; **2** declare no `json` key (`inherited-inputs`, `section-framing`), so 18 lack the protocol | `grep -c "json: false" scripts/guards.ts`, then parsing the 40 entries of `GUARDS` (`:28-347`) |
| "a keyword scan of every `## Rules` section … returned **35** lines" (What I looked for) | **27** lines, across 193 files carrying a `## Rules` section out of 586 technique markdown files | a script locating an exact `## Rules` heading in each of `workflows/*/techniques/**/*.md`, taking the span to the next `##`, and printing every line containing one of the eleven keywords the sweep lists. The load-bearing finding is unaffected: exactly **one** hit — `orchestration-patterns/TECHNIQUE.md:66` — is about authoring a run of steps, and the single occurrence of the word *fragment* (`work-package/techniques/manage-artifacts/TECHNIQUE.md:53`) means a URL fragment |
| "`schemas/` holds **6 generated** JSON schemas" (CR14) | 6 JSON schemas, **5** generated — `generate-schemas.ts:25-29` emits workflow, state, condition, session-file, activity; `technique.schema.json` is hand-authored on draft-07 | `ls schemas/*.json`, `grep -n "^generate(" scripts/generate-schemas.ts`, `head -6 schemas/technique.schema.json` |
| "`remediate-vuln`'s **fourteen** borrowed ref-carrying activities" (CR1, from the ground-truth record) | **fourteen** borrowed activities, of which **four** carry `ref` steps | `grep -c "work-package/" workflows/remediate-vuln/workflow.yaml` gives 14 at `:203-216`; the eight `ref:` lines sit in four of them |
| "an entry's Fix must state 'portable remediation (delete, migrate, encode, rename)' (`anti-patterns.md:41`)" (CR12, CR21) | `:41` says "Fix states portable remediation (and may link a principle for the target stance)"; the quoted parenthetical is at **`:59`** | `grep -n "portable remediation" anti-patterns.md` |
| "the seventh a 75-line variant" (README:44, restated around CR21) | **79** lines, `15-codebase-comprehension.yaml:79-156`, by a delimiter that runs a `- kind: loop` block to the next item at or above its own indentation | the block-extraction script under the scratchpad, which also reproduces 6 × 32 = 192 exactly |

Citations that moved because the tooling or the corpus moved, rather than because the sweep was
wrong: `orchestration-patterns/TECHNIQUE.md:64-66` is now `:60-62` with identical text;
`meta/activities/patterns/README.md:40` is now `:39`; and the eight `fragment` lines in
`check-binding-fidelity.ts` were exactly `:61-62`, `:386`, `:493`, `:524-530` at `9ca71c19` and are
now `:61-62`, `:427`, `:534`, `:565-571`. Citations that were wrong at the sweep's own pin:
`src/schema/workflow.schema.ts:47-51` for `WorkflowRulesSchema` (`:29-33`), `:38-41` for
`WorkflowFragmentsSchema` (`:40-42`), `audit-schema-validation.md:22-33` for a roster running to
`:37`, and `05-lead-researcher.yaml:49` and `:78` for bindings at `:50` and `:79`.

---

## Re-taking every figure

```
# revision frame
git -C . log --oneline -1
git -C workflows log --oneline -1
git -C workflows ls-tree --name-only 2b8b7215 meta/activities/patterns/
mkdir -p /tmp/corpus-2b8b7215 && git -C workflows archive 2b8b7215 | tar -x -C /tmp/corpus-2b8b7215

# the fragment mechanism's whole subject
npx tsx scripts/check-fragments.ts
grep -rn "ref:" --include=*.yaml workflows/*/activities/
grep -rn "fragments" --include=*.yaml --include=*.yml workflows/
grep -n "fragments" workflows/remediate-vuln/workflow.yaml
grep -c "work-package/" workflows/remediate-vuln/workflow.yaml

# the nine rules, their emission sites, and the schema they reach
sed -n '56,65p;169,171p;196p;199p;207,208p;212p;218p;242p;247p;257,263p;266,271p' scripts/check-fragments.ts
sed -n '73,78p;84,86p;100,102p;109,111p;134p;139,141p;152,164p;167,172p;198,205p;234,243p' src/schema/activity.schema.ts
sed -n '29,33p;40,42p' src/schema/workflow.schema.ts
sed -n '38,45p;190,209p' src/loaders/fragment-resolver.ts

# the registry claim, what tests it, and how a delta reads it
sed -n '252,258p' scripts/guards.ts
grep -c "json: false" scripts/guards.ts ; grep -c "json: true" scripts/guards.ts
grep -n "proves" tests/guard-registry.test.ts
sed -n '19,21p;172,173p' scripts/check-delta.ts
ls scripts/ | grep -E "^(check|validate)-.*\.ts$" | wc -l

# canon rows, section counts and reach
sed -n '31p;45p;47p;52p;53p;54p;68p' workflows/workflow-design/resources/schema-construct-inventory.md
grep -c "^## " workflows/workflow-design/resources/schema-construct-inventory.md
grep -c "^## " workflows/workflow-design/resources/design-principles.md
grep -c "^### AP-" workflows/workflow-design/resources/anti-patterns.md
grep -c "fragment" workflows/workflow-design/resources/anti-patterns.md
grep -c "fragment" workflows/workflow-design/resources/design-principles.md
grep -rn "schema-construct-inventory" --include=*.md --include=*.yaml workflows/
grep -rl "schemas/README" --include=*.md --include=*.yaml workflows/
grep -rn "activities/patterns/README" --include=*.md --include=*.yaml workflows/
grep -n "^## " workflows/workflow-design/resources/anti-patterns.md

# the step-kind enumerations, in markdown and outside it
grep -rnE "action.*checkpoint.*loop" --include=*.md workflows/ docs/ schemas/
grep -rnE "technique.*action.*checkpoint.*loop" --include=*.ts --include=*.json src/ scripts/ schemas/
grep -n "^generate(" scripts/generate-schemas.ts
grep -n "build:schemas" package.json .github/workflows/verify.yml

# the variable merge, and when it landed
sed -n '56,90p' src/utils/activity-variables.ts
git log -S "fillSilences" --oneline -- src/utils/activity-variables.ts
git show 9ca71c19:src/utils/activity-variables.ts | grep -c "fillSilences"

# the populations
python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py --root /tmp/corpus-2b8b7215
python3 .engineering/artifacts/planning/2026-09-03-routines/measure/repeated-runs.py
npx tsx scripts/validate-activities.ts /tmp/corpus-2b8b7215
npx tsx scripts/validate-activities.ts workflows

# the stage-8 site set
grep -rn "compose-worker-briefs\|dispatch-workers\|gather-results\|synthesise-results" --include=*.yaml workflows/
sed -n '38,62p' workflows/meta/activities/patterns/02-supervisor.yaml
sed -n '38,87p' workflows/meta/activities/patterns/05-lead-researcher.yaml
grep -rn "supervisor" .engineering/artifacts/planning/2026-09-03-routines/
```

Four measurements were taken with throwaway scripts under the session scratchpad, and each is
stated in full so it can be rebuilt. The rules-bucket census parses every `*/workflow.yaml` with
`yaml.safe_load` and counts a file as carrying text when any of the three buckets holds a string,
then parses every `*/activities/**/*.yaml` and reports a non-empty `rules` list. The technique
`## Rules` scan locates an exact `## Rules` heading, takes the span to the next `##`, and prints
every line containing one of the eleven keywords. The loop census walks every activity file's steps
recursively and counts `kind: loop` steps carrying `condition`, `breakCondition` and
`continueWhile`. The convergence-block census extracts each `- kind: loop` block as raw text, runs
it to the next list item at or above its own indentation, keeps the blocks whose text contains
`analyse-challenge::challenge`, and groups them by SHA-256. None writes anything.
