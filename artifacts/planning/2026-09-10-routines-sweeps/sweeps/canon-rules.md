# The rules and the canon, swept against a corpus that has routines

Sweep of the rule and canon surfaces for the routines proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md). Companion to the three
ground-truth records in [../ground-truth/](../ground-truth/), which count the guards, the fragment
mechanism and what stage 0 landed; this one counts the *written rules* those mechanisms are
described by, and asks of each whether it survives the construct.

Server tooling at `9ca71c19` on `main`; corpus at `2b8b7215` on the `workflows` branch. Every
figure below was taken from the repository. Where a figure disagrees with the proposal or with a
comment in the code, this document says so and gives its own.

**Nothing in the design is built.** `ls workflows/*/routines` reports no such file or directory,
`src/schema/activity.schema.ts:167` declares `StepSchema` over exactly four members, and
`grep -rn "kind: routine" workflows/ src/ scripts/` returns nothing. So every candidate below is a
rule that binds today.

## What binds this surface together

A rule surface here is any place that tells an author or an auditor *which construct to reach for*.
Four such places exist, and they are unequal in reach:

- **Guard rule text.** Nine rules in `scripts/check-fragments.ts:56-65`, one registry claim in
  `scripts/guards.ts:252-258`, and the header prose each guard opens with. A guard rule is the only
  rule on this surface that fails a build.
- **Corpus canon.** Three resources under `workflows/workflow-design/resources/` —
  `design-principles.md` (35 numbered principles), `anti-patterns.md` (151 `AP-NN` entries),
  `schema-construct-inventory.md` (7 `##` sections) — plus the two literacy guides
  `convention-conformance.md` and `format-conventions.md`, and the ontology at
  `workflows/meta/resources/workflow-canonical.md`. Reach is measurable:
  `workflows/workflow-authoring/techniques/workflow-definition/audit-canon.md:62` takes **one
  enumeration unit per `##` section** of design-principles, the construct inventory and
  convention-conformance, and `workflows/workflow-design/techniques/audit-expressiveness.md:36`
  calls the inventory the "sole source of informal→formal construct mappings for this pass".
- **Rules buckets in the definitions.** 13 of the 17 `workflow.yaml` files carry a `rules:` key;
  12 carry text. **Activity-level `rules[]` has zero instances corpus-wide.**
- **Technique `## Rules` sections.** 586 technique markdown files; the sweep below reports how many
  say anything about a shared run.

Two surfaces outside the corpus are in scope because a guard's own rule home lives there:
`docs/checkpoint-model.md`, named as the rule home for `check-decision-order` at
`scripts/check-decision-order.ts:8`, and `schemas/README.md`, named as the documentation home for
every schema by `schema-construct-inventory.md:19-25`.

**24 candidates.** They are unevenly distributed, and the distribution is itself a finding: the
fragment mechanism has exactly **one** canon home (`schema-construct-inventory.md:68`) and **zero**
anti-pattern entries, while the routines construct's *own* obligations land on eleven closed
enumerations of the step kinds that no single edit reaches.

## Verdict vocabulary

The four verdicts this sweep keeps separate, and how each maps onto the structured record's enum:

| Verdict | Structured | Meaning |
|---|---|---|
| SUBSUMED | `REMOVE` | The construct does this job. Leaving the rule leaves two homes for one rule. |
| CONTRADICTED | `DEPRECATE` | The rule is false once the construct lands and must be amended in the same commit. |
| MISROUTING | `DEPRECATE` | The rule sends an author to a construct the migration retires; its destination changes. |
| NARROWS | `NARROWS` | The construct shrinks the rule's subject without emptying it. |
| KEEP | `KEEP` | Looks like one of the above and is not. The discriminator is given. |
| — | `STALE` | Already false today, independent of routines. Recorded because the sweep found it. |

## Verdict table

| Id | Construct | Verdict | Stage |
|---|---|---|---|
| CR1 | `check-fragments` — `malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `undeclared-effect-variable` | SUBSUMED (`REMOVE`) | 5 |
| CR2 | `check-fragments` — `unused-fragment` | CONTRADICTED (`DEPRECATE`) | 4 |
| CR3 | `check-fragments` — `inline-duplicate-of-fragment` | CONTRADICTED (`DEPRECATE`) | 5 |
| CR4 | `check-fragments` — `duplicate-checkpoint`'s remedy | MISROUTING (`DEPRECATE`) | 5 |
| CR5 | `check-fragments` — `duplicate-rule` | KEEP | — |
| CR6 | `scripts/guards.ts:252-258` — the `fragments` registry entry | CONTRADICTED (`DEPRECATE`) | 5 |
| CR7 | `schema-construct-inventory.md:68` — the Checkpoint fragment row | MISROUTING (`DEPRECATE`) | 5 |
| CR8 | `schema-construct-inventory.md:47` — the loop step's field list | `STALE` | 0 |
| CR9 | `schema-construct-inventory.md:52` — "a shared base field on every step kind" | `STALE` | 0 |
| CR10 | `schema-construct-inventory.md:54` — the variable contract row | CONTRADICTED (`DEPRECATE`) | 4 |
| CR11 | Eleven closed four-kind step enumerations | CONTRADICTED (`DEPRECATE`) | 3 |
| CR12 | Three closed "activity, technique, resource" body enumerations | CONTRADICTED (`DEPRECATE`) | 3 |
| CR13 | `docs/checkpoint-model.md:113,116` | CONTRADICTED (`DEPRECATE`) | 5 |
| CR14 | `schemas/README.md:279,335,341,500` | CONTRADICTED (`DEPRECATE`) | 5 |
| CR15 | `schemas/README.md:499` and `check-checkpoint-presentation.ts:23,88-90,148-158` — the rules half of the mechanism | `STALE` | — |
| CR16 | `check-set-action-values.ts:173-174` — the scan's stated reason | CONTRADICTED (`DEPRECATE`) | 5 |
| CR17 | `audit-schema-validation.md:29` — the guard roster bullet | CONTRADICTED (`DEPRECATE`) | 5 |
| CR18 | `orchestration-patterns/TECHNIQUE.md:64-66` — `prefer-activity-composition` | MISROUTING (`DEPRECATE`) | 8 |
| CR19 | `meta/activities/patterns/README.md:40` — "copy the step pipeline into a local activity" | MISROUTING (`DEPRECATE`) | 8 |
| CR20 | `anti-patterns.md:542-552` — AP-38 `no-duplicate-technique-steps` | NARROWS | 8 |
| CR21 | The absent cross-activity duplication rule | KEEP — statable for the first time | 1 + 3 |
| CR22 | `design-principles.md:161-163` — principle 35 | KEEP | — |
| CR23 | `convention-conformance.md:16,20`; `format-conventions.md:29,35` | KEEP | — |
| CR24 | `workflow-canonical.md:34-37` — the `::` resolution rule | KEEP | — |

---

## The nine fragment rules, one at a time

The proposal states that seven of the nine die, `duplicate-rule` stays as it is, and
`duplicate-checkpoint` stays with its remedy changed
([decisions.md:447-450](../../2026-09-03-routines/decisions.md)). The partition into seven-and-two
reproduces: read against the script, the seven named rules each reach the corpus only through a
`ref` value on a checkpoint step or a `fragments.checkpoints` entry, and the two survivors reach it
through inline content with no reference in the path. **The partition is right and the word "die"
is wrong for two of the seven.** Five have no subject left; one keeps its subject and changes
enforcement layer; one keeps its purpose and loses its only policeman.

The guard passes clean today: `npx tsx scripts/check-fragments.ts` prints
`fragments: OK — every ref resolves, every fragment is used, no inline duplicates`. Its whole
subject is **one declaration** (`workflows/work-package/workflow.yaml:15-71`, 57 lines, two named
gate bodies) and **eight reference sites** — `04-research.yaml:224` and `:243`,
`05-implementation-analysis.yaml:126` and `:145`, `07-assumptions-review.yaml:112` and `:130`,
`08-implement.yaml:202` and `:221`. `grep -rn "ref:" --include=*.yaml workflows/*/activities/`
returns exactly those eight lines.

### CR1 — Five rules with no subject left

**Construct.** `malformed-ref` and `unresolved-ref` (raised at `scripts/check-fragments.ts:207-208`),
`ref-body-conflict` (`:199` and `:212`), `ref-opens-step` (`:176`), `undeclared-effect-variable`
(`:218`).

**Measured references.** All five fire only inside the `typeof ref === 'string'` branch at
`scripts/check-fragments.ts:196`, or — for `ref-opens-step` — on the raw-text regex
`/^\s*- ref:/m` at `:175`. `ref` is a field on `CheckpointStepSchema` and on nothing else
(`src/schema/activity.schema.ts:134`). Eight sites, one declaration; zero findings today.

**Verdict: SUBSUMED.** Each of the five loses its subject entirely once `ref` and
`fragments.checkpoints` leave the schema.

- `malformed-ref` / `unresolved-ref` — the *parse* they police recurs verbatim on the routine
  reference: "A routine name resolves as `[workflow::]name`" (README:311-314), which is deliberately
  the same resolution the shared gate already implements. The proposal moves the obligation to a
  load failure — `Unresolved` in the reference lifecycle (README:728). **The lifecycle has no
  `Malformed` state.** `Unresolved`, `Cyclic`, `Unbound` and `Overbound` are the four non-`Checked`
  terminals (README:722-741), and a value like `routine: a::b::c` or `routine: work-package::`
  matches none of them. `parseFragmentRef` (`src/loaders/fragment-resolver.ts:38-45`) raises
  "Malformed" today and is what `:207` reads to pick the rule. The rule goes; the state it maps to
  does not exist yet.
- `ref-body-conflict` — the one-home prohibition for a body with two possible homes. A
  `kind: routine` step carries `id`, `routine`, `with`, `outputs` and the site gates
  (README:279-291); it has no body fields for a conflict to arise between, and no shared `condition`
  of its own for the second half of the rule to compare against. The prohibition has nothing left to
  prohibit, which is principle 35 at
  `workflows/workflow-design/resources/design-principles.md:161-163` working as written — see CR22.
- `ref-opens-step` — the rule exists because the textual injector matches a standalone `ref:` line
  at its own indentation (`src/loaders/fragment-resolver.ts:190-209`). With no `ref:` lines the rule
  has no subject. The hazard's routines analogue is narrower than
  [fragment-mechanism.md:148-154](../ground-truth/fragment-mechanism.md) reads it: the proposal's
  prototype splicer locates a routine step **by its own indentation** rather than by a standalone-line
  regex (README:1171-1173), and stage 3's criterion covers the ids of *spliced* steps
  (README:1179-1182). What neither covers is the reference step's own opener in the host file.
  `injectResolvedStepIds` (`src/schema/activity.schema.ts:234-243`) rewrites `- technique:` lines
  only, and `populateStepIds` (`:198-205`) already refuses any non-technique step without an `id`,
  so a `- routine:` opener is a load error rather than a silent mis-splice. **The hazard is
  discharged by the closed object, not by a rule.**
- `undeclared-effect-variable` — the cleanest of the five. Its subject is a *referencing* workflow
  whose variable set lacks a name the shared body's `setVariable` writes (`:214-221`). Under
  routines the reference site binds outputs to host names and the loader injects them into the
  referring activity's `variables.writes` (README:1095-1101), and `declaredVariables`
  (`scripts/workflow-declarations.ts:61-71`) resolves borrowed activities into the borrower's set,
  so the cross-workflow reach the rule exists for is carried by injection. The hole
  [fragment-mechanism.md:156-164](../ground-truth/fragment-mechanism.md) records — the loop at
  `scripts/check-fragments.ts:169-171` reads only `root/<workflow>/activities`, so `remediate-vuln`'s
  fourteen borrowed ref-carrying activities are never audited under `remediate-vuln` — closes with
  the rule.

**Blast radius.** Removing these five before stage 5 lands leaves the eight live reference sites
ungraded: a mistyped `ref` becomes a silent delivery of an unresolved step. Removing them *with*
stage 5 costs nothing, because there is nothing left to grade. The `Malformed` gap has to be closed
inside stage 3, not stage 5, because it is a load-failure enumeration and not a guard rule.

### CR2 — `unused-fragment` keeps its subject and changes layer

**Construct.** `scripts/check-fragments.ts:241-243` — "a declared fragment nothing references,
corpus-wide". Header statement at `:18`.

**Measured references.** One emission site; two declared fragments, both used.

**Verdict: CONTRADICTED.** The rule is counted among the seven that die, and the *subject* does not
die: an unreferenced routine is exactly the same defect. Stage 4's criterion is "A routine with no
reference site anywhere fails the load" (README:878). So the obligation moves from a corpus-wide
guard sweep to a load failure — a strictly stronger home, and a different one. Two consequences the
proposal does not draw:

- A load failure fires only when something loads the file. `validate-activities.ts` is
  non-recursive (`:110`) and `loadActivitiesFromDir` (`src/loaders/workflow-loader.ts:72-107`) is
  too, which is why the five activity files under `workflows/meta/activities/patterns/` validate
  against nothing today. A `routines/` file that no `workflow.yaml` reaches is in the same position
  unless discovery is unconditional over the directory.
- The guard's reach is *corpus-wide by construction* (`:235-250` iterates every workflow id); a
  load failure's reach is whatever the loader was asked to load. The stage-4 criterion says
  "anywhere", so this is a criterion the load path has to be built to satisfy rather than one it
  satisfies for free.

**Blast radius.** Deleting the rule at stage 5 while the load failure is only in stage 4's criteria
leaves an unreferenced routine undetected for the duration. The two must land together, and stage 4
precedes stage 5 in the dependency column, so the ordering already works if the criterion is met.

### CR3 — `inline-duplicate-of-fragment` keeps its purpose and loses its policeman

**Construct.** `scripts/check-fragments.ts:244-248`, raised at `:247`. Header at `:19-20`: "an
inline checkpoint body identical (normalized) to a declared fragment: the inline copy must become a
reference". The guard's own header names this as the reason it exists in both directions —
"content that should be a reference is not quietly re-inlined (the drift vector the mechanism was
built against)" (`:5-6`).

**Measured references.** One emission site; zero findings today; the normalisation is
`normalizeCheckpointBody` at `:74-94`.

**Verdict: CONTRADICTED.** The rule as written has no subject after stage 5 — there is no fragment
for an inline body to duplicate. Its *purpose* has a subject and, measured against what remains,
**no home at all**:

- `duplicate-checkpoint` (`:266-271`) requires `sites.length >= 2`. After a migration the shared
  body lives once in a routine and the re-inlined copy is one site, so the surviving rule cannot
  see it.
- `duplicate-checkpoint` also never reads a routine. Its collection loop is
  `readdirSync(adir).filter(...)` over `root/<workflow>/activities` (`:169-171`), non-recursive and
  scoped to `activities/`. `workflows/meta/activities/patterns/` is already outside it.
- Stage 1's drift guard is specified over activity files — "any run of two or more consecutive
  steps that appears in two or more **activity files**" (README:822-823). A routine body is not an
  activity file, so a run duplicated between a routine and one activity is outside its criterion as
  written.

So the correct disposition is not deletion but re-authoring: an inline run identical to a declared
routine's body is one site plus one declaration, and something has to compare them. The cheapest
form is the same one the stage-1 guard already needs — extend its file set to `routines/` and treat
a declaration as a site.

**Blast radius.** Deleting it at stage 5 as the proposal states opens the drift vector the whole
mechanism was built against, on the same commit that removes the only rule covering it. Nothing
fails; the corpus simply stops being graded on re-inlining.

### CR4 — `duplicate-checkpoint`'s remedy names the retiring mechanism

**Construct.** `scripts/check-fragments.ts:269`, whose detail string ends "— extract a fragment".
Header at `:24-25`: "identical (normalized) checkpoint body authored inline at two or more sites:
extract a fragment".

**Measured references.** Two prose sites in one file (`:24-25` and `:269`). Zero findings today, so
the string has never been printed.

**Verdict: MISROUTING.** The rule's *detect* is wider than the mechanism —
[fragment-mechanism.md:135](../ground-truth/fragment-mechanism.md) records it correctly as
detecting "the condition a fragment *or* a routine would answer; only its remedy names the
mechanism" — and it reproduces: the rule's path (`:224-229` then `:266-271`) touches no `ref` value
and no `fragments` block. The remedy has to name a routine. The proposal says so
(README:883-885), and `decisions.md:443-446` supplies the destination for the lone-gate case
explicitly: "a shared gate that is *not* part of a larger run becomes a one-step routine rather than
keeping a second mechanism alive for that case."

**Blast radius.** Changing the string early is harmless: it prints only on a finding, and there are
none. Changing it late means the first author to hit the rule after stage 5 is told to reach for a
construct that no longer exists.

### CR5 — `duplicate-rule` is untouched, and here is why it looks touched

**Construct.** `scripts/check-fragments.ts:253-265`, header at `:21-23`.

**Measured references.** One emission site. The index it reads is built from `rules.workflow`,
`rules.activity` and `rules.universal` in each `workflow.yaml` (`:152-166`) plus activity-file
`rules[]` (`:181-191`), with a 30-character floor (`MIN_DUP_RULE_LENGTH`, `:52`). Measured against
the corpus: **12 workflow.yaml files carry rule text; activity-level `rules[]` has zero instances**,
so the activity arm at `:181-191` currently indexes nothing.

**Verdict: KEEP.** Three discriminators, each of which a refuter can check:

1. Its path never reaches a `ref` or a `fragments` block. The guard's own header says rules are not
   shared this way (`:7-9`), and `WorkflowFragmentsSchema` has one key, `checkpoints`
   (`src/schema/workflow.schema.ts:38-41`).
2. Its remedy names the meta conduct technique (`:261-262`), not a fragment. That home is
   unaffected.
3. A routine declares no rules. The proposal puts `check-checkpoint-presentation` at
   "walks `routines/`? No" on exactly that ground (README:1029), and the routine definition
   (README:180-230) has no `rules` key. So no routine can introduce a duplicate rule.

**Blast radius.** None. Removing it would drop the only corpus-wide check that two workflows have
not each authored the same conduct sentence.

### CR6 — The registry entry states a claim that stops being true

**Construct.** `scripts/guards.ts:252-258` — `id: 'fragments'`, `npmScript: 'check:fragments'`,
`json: false`, and `proves: 'every checkpoint fragment ref resolves, is used, and is not inlined
twice'`. Wired at `package.json:43`.

**Measured references.** One registry row of 40 (`scripts/guards.ts:28-347`). One `package.json`
script. `tests/guard-registry.test.ts:38` asserts only that `proves` is non-empty —
`expect(GUARDS.filter((g) => g.proves.trim().length === 0)).toEqual([])` — so **nothing tests
whether a `proves` string is true.**

**Verdict: CONTRADICTED.** All three clauses lose their subject at stage 5 while the script
survives carrying `duplicate-rule` and `duplicate-checkpoint`, neither of which is about a fragment.
The id, the npm script name, the registry claim, and the clean-run message at `:280` all have to
change in the same commit, or the suite advertises a guarantee it no longer provides. The
reconciliation test that closes 44 scripts on disk against 40 registry entries
(`tests/guard-registry.test.ts:67-86`) will not notice: it counts files and names, not claims.

**Blast radius.** Renaming the guard is the visible half. The invisible half is that
`scripts/check-delta.ts` compares this guard by exit code and new output lines only — it is one of
the 18 with `json: false` — so a rewritten output line reads as new findings on a delta run.

---

## Corpus canon

### CR7 — The Checkpoint fragment row is canon's only home for the mechanism

**Construct.** `workflows/workflow-design/resources/schema-construct-inventory.md:68` — the row
mapping the informal pattern "Several activities ask the user the same question" to
`fragments.checkpoints.<name>` plus a `kind: checkpoint` step with `ref: [workflow::]name`.

**Measured references.** The inventory is cited from **10 files** (excluding itself):
`workflow-design/techniques/yaml-authoring.md:39`, `context-loading.md:45`,
`audit-expressiveness.md:36`, `workflow-design/README.md:153` and `:237`,
`workflow-design/resources/README.md:14` and `:105`, `anti-patterns.md:1501`,
`workflow-authoring/resources/README.md:47`,
`workflow-authoring/techniques/workflow-definition/audit-canon.md:62` and
`.../yaml-authoring.md:44`. Two of those reach the row's own section by anchor:
`workflow-authoring/.../yaml-authoring.md:44` cites
`schema-construct-inventory.md#workflow-level-constructs-workflowschemajson` directly, and
`audit-canon.md:62` takes one enumeration unit per `##` section — the section holding this row is
one of the 7. `audit-expressiveness.md:36` calls the inventory the "sole source of informal→formal
construct mappings for this pass" and `:37` forbids restating it, so the row is applied as written.

**Verdict: MISROUTING.** Stage 5 retires the mechanism and `decisions.md:443-446` states the
replacement destination for precisely this row's informal pattern: a shared gate that is not part of
a larger run becomes a one-step routine. The row's Formal Construct column becomes a routine; its
Schema Fields column becomes `routines/<name>.yaml` plus `kind: routine`.

**Blast radius.** Changing it early, before stage 3 lands the construct, routes an author to a
directory that does not exist. Changing it late means the expressiveness audit — a pass that persists
findings and gates on them (`audit-expressiveness.md:44-48`) — instructs an author to author a
fragment into a corpus whose loader has none, which fails the load rather than merely misleading.
It has to move on the same commit as stage 5.

### CR8 — The loop step's field list names a field the load refuses

**Construct.** `schema-construct-inventory.md:47` gives the loop step's fields as `.loopType`,
`.variable`, `.over`, `.condition`, `.breakCondition`, `.maxIterations` and optional `.name`.

**Measured references.** One row. `LoopStepSchema` (`src/schema/activity.schema.ts:152-164`) is a
closed object of twelve fields spreading `stepCommonFields` alone at `:163` — no entry condition —
and closing with `.strict()` at `:164`. So `condition` on a loop is a load error, and
`continueWhile` (`:157`), the field that actually carries the continuation test, is absent from the
row. Zero of the corpus's 54 loop steps carry `condition`
([stage-0-state.md](../ground-truth/stage-0-state.md)).

**Verdict: STALE**, from stage 0, which has landed. This is the load-bearing half of the pair
stage-0-state.md flags: the other is `schemas/README.md:383`, and this one is corpus canon — the
table an author consults to choose a construct. It names a field that fails the load and omits the
one that carries the test.

**Blast radius.** Nothing breaks on removal; the row is already wrong. It is in scope for this sweep
because a routine body holds loops (README:1027 puts `check-loop-shape` at "walks `routines/`?
**Yes**"), so an author writing a routine's loop reads this row and writes an unloadable field.

### CR9 — "A shared base field on every step kind" is true of one field and false of the other

**Construct.** `schema-construct-inventory.md:52` — the informal pattern "Only run when X is true"
maps to **Step gate**: "`steps[].when` / `steps[].condition` (references condition.schema.json) — a
shared base field on every step kind".

**Measured references.** One row. `stepCommonFields` (`src/schema/activity.schema.ts:73-78`, holding
`when` and `required`) is spread on all four step members — `:100`, `:109`, `:139`, `:163`.
`stepEntryCondition` (`:84-86`, holding `condition`) is spread on **three** — `:101` technique,
`:110` action, `:140` checkpoint — and not on `LoopStepSchema`. The comment above the spread states
the rule directly.

**Verdict: STALE**, from stage 0. `when` is a shared base field on every step kind; `condition` is
not. The row asserts both of one sentence.

**Blast radius.** None on removal. Recorded because a `kind: routine` step is the fifth member the
row will have to speak for, and it takes the site gates every step kind carries (README:290-298) —
so the row needs the correction before it is widened, or the widening propagates the error.

### CR10 — The variable contract row is contradicted twice by stage 4

**Construct.** `schema-construct-inventory.md:54` — the **Variable contract** row. Two claims are
load-bearing: `variables.writes[]` holds "full declarations for what it puts in the bag — operation
outputs, remap targets, checkpoint `setVariable` keys, `set` targets, loop items", and "two
declarations of one name that disagree on `type` or `defaultValue` fail the load
(`check:activity-variables`)".

**Measured references.** One row, in the section `audit-canon.md:62` walks as an enumeration unit.
The guard it cites is hard zero with no ledger (`scripts/check-activity-variables.ts:25`) and
consumes the loader (`:34`, `:97`).

**Verdict: CONTRADICTED at stage 4**, on both claims.

- The enumeration lists five sources, all of them things an author writes. Stage 4 adds a sixth the
  author does not write: the loader injects a routine's bound outputs into the referring activity's
  `variables.writes` during materialisation (README:1095-1101), firing "only where the referring
  activity does not already declare the bound name" (README:1100-1101). Meanwhile the row's own
  example of an author-written source disappears at a reference site — "loop items" is where
  `current_assumption` lives today, and it becomes a routine **internal**, declared in the routine
  and in no activity contract (README:194-198).
- The merge rule the row states changes. README:1102-1104: "Today it compares an absent default as
  `null` and reports disagreement with any present one, so a no-default declaration would fail the
  load on contact with the corpus. Two lines." A routine output declares no default
  (README:1091-1094), so the row's disagreement test is one of the two lines stage 4 changes.

**Blast radius.** This is the row a reviewer consults to decide whether an activity's declared
contract is complete. Leaving it standing after stage 4 tells that reviewer to expect declarations
the loader now supplies, and to expect a loop item among them where a routine has one.
[guard-obligations.md:165-180](../ground-truth/guard-obligations.md) records the matching mechanical
gap — `check-activity-variables`'s `undeclared-use` fires at **stage 3** on a materialised internal,
with the mechanism unspecified — so the row and the guard have to be settled together.

### CR11 — Eleven closed enumerations of the four step kinds

**Construct.** Every place that lists the step kinds as a closed set. Measured by
`grep -rnE "action.*checkpoint.*loop" --include=*.md workflows/ docs/ schemas/`, which returns
exactly these eleven lines and no false positive:

| Site | Form |
|---|---|
| `workflows/workflow-design/resources/schema-construct-inventory.md:31` | "every step carries a required `kind` discriminator (`technique` / `action` / `checkpoint` / `loop`)" |
| `workflows/workflow-design/resources/schema-construct-inventory.md:45` | "Pure action/control/checkpoint/loop steps need no `technique` binding" |
| `workflows/workflow-design/resources/format-conventions.md:33` | "Ordered `steps[]` with `kind:` technique / action / checkpoint / loop" |
| `schemas/README.md:46` | four kinds, spelled out in prose |
| `schemas/README.md:83` | "each step a kind: technique, action, checkpoint, or loop" |
| `schemas/README.md:100` | the mermaid node `steps[] (kind: technique\|action\|checkpoint\|loop)` |
| `schemas/README.md:299` | "Ordered, kind-tagged execution list (technique / action / checkpoint / loop)" |
| `schemas/README.md:322` | "Required discriminator: `technique`, `action`, `checkpoint`, or `loop`" |
| `schemas/README.md:560` | as `:299` |
| `schemas/README.md:1122` | as `:299`, in the activity-schema section |
| `schemas/README.md:1153` | as `:299` |

Three corpus canon sites, eight in `schemas/README.md`. The Zod union itself is
`src/schema/activity.schema.ts:167-172`, and `schemas/activity.schema.json` is generated from it
(`scripts/generate-schemas.ts:20`).

**Verdict: CONTRADICTED at stage 3.** A fifth member makes all eleven false. The generated JSON
schema follows the Zod source automatically; none of the eleven does.
`schema-construct-inventory.md:45` is the one that is wrong in a second way as well: a
`kind: routine` step also needs no `technique` binding, so the row's list of the kinds exempt from
binding is incomplete on the same edit.

**Blast radius.** `format-conventions.md:33` sits **inside a fenced template block**
(`format-conventions.md:14-54`), so a guard that skips fences — the convention
`check-technique-template.ts:24-25` follows — cannot see it. `schemas/README.md` is cited by 5
corpus files (`workflow-design/techniques/yaml-authoring.md:34`, `context-loading.md:41`,
`reconcile-design-assumptions.md:39`, `schema-construct-inventory.md:19-25`,
`workflow-authoring/.../yaml-authoring.md:38`), each of which sends an author there for "the field
tables, required properties, and valid values". Stage 3 adds a construct and no guard counts these
enumerations, so the only thing that finds them is a sweep keyed on the phrase — which is what
`AP-129 stale-restatement-after-change` (`anti-patterns.md:1703-1713`) prescribes and what this
row records the key for.

### CR12 — Three closed enumerations of what may not be inlined

**Construct.** The bodies canon says must live in their own file:

- `design-principles.md:101-103`, principle 22 Modular Over Inline: "Constructs live in their own
  files. Parents reference siblings; they do not embed activity, technique, or resource bodies
  inline."
- `anti-patterns.md:88`, AP-01 `no-inline-content` Detect: "An activity, technique, or resource body
  is inlined into a parent YAML/markdown file".
- `anti-patterns.md:290`, AP-17 `bound-step-no-description` Do-not-flag, which enumerates the step
  kinds a field-purity finding does not apply to — `kind: loop` and `kind: checkpoint` — after a
  Detect scoped to `kind: technique` and `kind: action` (`:288`) and a Fix asserting "Resulting
  bound step = `id` + `technique` + structural fields only" (`:292`).

**Measured references.** Principle 22 is cited by AP-01's Fix (`anti-patterns.md:92`). AP-01 sits in
the `structural-anti-patterns` unit `audit-canon.md:65-67` enumerates. `anti-patterns.md` is cited
from **17 files** in the corpus; `design-principles.md` from **14**.

**Verdict: CONTRADICTED at stage 3.** A routine body is a fourth kind of body that must live in its
own file, and a routine's reference step is a fifth kind of step whose allowed fields are `routine`,
`with` and `outputs` (README:279-291) — none of which appears in AP-17's field-purity sentence.
Left as they are: an inlined routine body escapes both principle 22 and AP-01 because neither
enumeration reaches it, and an auditor applying AP-17's "structural fields only" to a
`kind: routine` step flags `with:` and `outputs:` as prose.

**Blast radius.** AP-01's Fix is the entry the catalogue's own Creation Rules hold to a *structural
test that transfers to a foreign workflow on the same schema* (`anti-patterns.md:49`). An
enumeration of body kinds is that structural test; widening it is a one-word edit and skipping it
silently narrows the entry.

---

## Guard rule homes outside the corpus

### CR13 — `docs/checkpoint-model.md` is the fragment mechanism's prose home for a guard

**Construct.** `docs/checkpoint-model.md:113` lists `ref` in the "Declaring a checkpoint" field
table — "Names a shared checkpoint body instead of writing one inline" — and `:116` is a whole
paragraph on the mechanism, ending "The `check:fragments` guard rejects an inline body that
duplicates a fragment."

**Measured references.** `scripts/check-decision-order.ts:8` names this file as the recorded home
for that guard's keying rules and their reasons — "What the rule keys on, and why each exemption
holds: docs/checkpoint-model.md § Where a Checkpoint Belongs", the section beginning at `:118`.
Outside the planning folder, the only other readers are two site pages
(`site/specifications.html:89`, `site/specs/checkpoints.html:72`). **No corpus file cites it**, so
its audience is a guard author and a site reader.

**Verdict: CONTRADICTED at stage 5.** Both the field row and the paragraph become false. The
paragraph is the fullest prose statement of the mechanism anywhere in the repository, so it is the
one a reader lands on after the schema.

**Blast radius.** Removing `:116` early would leave the eight live reference sites undocumented
while they still run. Removing it late leaves a guard's own rule home describing a mechanism the
guard no longer has rules for — and `check-decision-order` still points at this file, so the
staleness is one hop from a live guard.

### CR14 — Four statements of the mechanism in the schema documentation

**Construct.** `schemas/README.md:279` (the workflow `fragments` field row), `:335` (the
"By reference" authoring form for a checkpoint step, which also names `check:fragments`), `:341`
(the checkpoint `ref` field row), `:500` (the `fragments` row in the second workflow field table).

**Measured references.** Four rows, in the document `schema-construct-inventory.md:19-25` names as
the documentation home for every schema and which 5 corpus files send an author to.

**Verdict: CONTRADICTED at stage 5.** Every one describes a construct the schema no longer admits.
`:335` additionally names a guard whose rules are gone.

**Blast radius.** The document is hand-maintained: `schemas/` holds 6 generated JSON schemas
(`scripts/generate-schemas.ts:20`) and this README is not one of them. There is no `--check` mode
and `npm run build:schemas` appears in neither `test:ci` nor `verify.yml`
([guard-obligations.md](../ground-truth/guard-obligations.md)), so nothing catches the four rows
either way. Stage 3 adds a seventh schema and a routines section to the same document.

### CR15 — The rules half of the mechanism is already gone and two readers still describe it

**Construct.** Two statements about rule fragments:

- `schemas/README.md:499` gives `rules` as
  `{ workflow?, activity?, universal?: (string \| { ref })[] }` and says "Entries are rule strings
  or `{ ref }` fragment imports".
- `scripts/check-checkpoint-presentation.ts:23` states the guard's scope as "`rules.workflow`,
  `rules.activity`, `rules.universal` and `fragments.rules` in every `workflow.yaml`"; `:88-90`
  describes reading a rule fragment and names a site — "`remediate-vuln`'s orchestration-model
  fragment is a string"; `:148-158` is the code path that reads `fragments['rules']`.

**Measured references.** `WorkflowRulesSchema` (`src/schema/workflow.schema.ts:47-51`) declares all
three buckets as `z.array(z.string())`. `WorkflowFragmentsSchema` (`:38-41`) has one key,
`checkpoints`, and is `.strict()`. So `fragments.rules` is unrepresentable and a `{ ref }` entry in
a rules bucket fails the load. Corpus-wide, `grep -rn "fragments" --include=*.yaml workflows/`
returns two lines: the single declaration at `work-package/workflow.yaml:15` and a changelog-fragment
message at `12-strategic-review.yaml:196`. **`workflows/remediate-vuln/workflow.yaml` has no
`fragments` key at all** — `grep -n "fragments" workflows/remediate-vuln/workflow.yaml` exits 1. The
same `schemas/README.md` contradicts itself: `:279`'s row for the same field gives
`{ workflow?, activity?, universal?: string[] }`.

**Verdict: STALE**, independent of routines. Recorded because the sweep reads the same vocabulary
and because it changes what CR6 costs: `check-checkpoint-presentation` carries a dead branch and a
false site claim today, and the proposal's assessment of that guard — "Authored. It audits rule
buckets against the engine's presentation contract, and a routine declares no rules"
(README:1029) — is right about routines and silent about the dead branch.

**Blast radius.** Deleting `:148-158` removes a code path with no possible input. Deleting `:88-90`
removes a comment asserting a corpus site that does not exist, which is the same defect shape
`AP-129` names and which
[stage-0-state.md](../ground-truth/stage-0-state.md) records twice over for `breakCondition`.

### CR16 — A guard's stated reason for its own scan dies with the mechanism

**Construct.** `scripts/check-set-action-values.ts:173-174` — the comment justifying why the guard
reads `workflow.yaml` as well as the activity tree: "`workflow.yaml` too: a workflow root carries
checkpoint fragments, and a `setVariable` there writes the bag exactly as one inside an activity
does."

**Measured references.** One comment; the scan it justifies is `:175-177`. The guard is hard zero
with no baseline (`:27-28`).

**Verdict: CONTRADICTED at stage 5.** No workflow root carries a checkpoint fragment after the
migration, so the stated reason evaporates. The scan may still be right — `ActivitySchema` is
importable into `workflow.schema.ts` and a `workflow.yaml` could carry an inline step, though
[stage-0-state.md](../ground-truth/stage-0-state.md) measures zero today — so the fix is the
sentence, not the scan.

**Blast radius.** None mechanically. It is the clearest small instance of the class this sweep
exists for: a comment that reads as current fact about a mechanism the migration removes, inside a
guard that keeps running.

### CR17 — The guard roster an auditor is handed names the mechanism

**Construct.**
`workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:29` — a
Protocol bullet: "`check-fragments.ts` — every fragment reference resolves, every fragment is used,
and no inline body duplicates a fragment or another site".

**Measured references.** One bullet, inside a hand-maintained roster of **13 guards plus the two
validators** (`:22-33`) against a 40-entry registry (`scripts/guards.ts:28-347`). The technique's
own `## Rules` section opens at `:44` with `guard-green-is-narrow-evidence`, so the roster is
Protocol, not Rules.

**Verdict: CONTRADICTED at stage 5.** All three clauses of the bullet lose their subject, exactly as
CR6's `proves` string does — the bullet is a paraphrase of it. Two further consequences:

- The roster is hand-maintained and already 25 guards short of the registry. Nothing reconciles it:
  `tests/guard-registry.test.ts` reconciles the registry against the scripts on disk
  (`:67-86`), not against this list.
- Stages 3 and 4 add guard obligations — `routines/` discovery, a routine schema validator, the
  authored-column guards walking a second definition directory
  ([guard-obligations.md](../ground-truth/guard-obligations.md) measures **12** guards needing that
  walk against the proposal's 9) — and none of them reaches this roster automatically.

**Blast radius.** An auditor following the bullet after stage 5 runs a guard whose two remaining
rules have nothing to do with what the bullet promises, reads a clean result, and records
schema-validation coverage it did not get. The technique's own rule
`guard-green-is-narrow-evidence` (`:46-48`) is the warning against exactly that, aimed at a
different blind spot.

---

## The orchestration surface, at stage 8

### CR18 — `prefer-activity-composition` enumerates two homes and stage 8 makes a third the right one

**Construct.** `workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md:64-66` — a
`## Rules` entry: "Multi-op pipelines (decompose → dispatch → gather → synthesise) are bound as
activity steps or borrowed pattern activities under `meta/activities/patterns/`. These ops do not
`Apply` sibling orchestration-patterns operations for work."

**Measured references.** One rule, on a container `TECHNIQUE.md`, so it is inherited by every
operation in the group — 12 nested operations
(`ls workflows/meta/techniques/orchestration-patterns/`). The pipeline it names is authored out at
**four** sites, measured directly:
`meta/activities/patterns/01-orchestrator-workers.yaml:37-51`,
`04-isolated-fan-out.yaml:38-61` (with an intervening `require-complete` action at `:53-58`),
`05-lead-researcher.yaml:41-55`, and `05-lead-researcher.yaml:70-84` inside the `gap-followup` loop
declared at `:59`. Those are exactly the four reference sites stage 8's criterion names
(README:936-939).

**Verdict: MISROUTING at stage 8.** The rule's prohibition half stays true — a routine is not a
Protocol `Apply` — and its enumeration of homes becomes incomplete in the direction that matters: it
tells an author to *bind the ops as activity steps*, which is to write the run out again, at the
same four sites the stage removes. The remedy is a third clause naming the routine, not a rewrite.

**Blast radius.** The rule binds the whole group, so it is the sentence a fan-out author reads. It
is also inherited into every operation's composed contract, which means the delivered text carries
it to workers. Changing it before stage 3 routes an author to a construct that does not exist;
leaving it after stage 8 routes them to a copy.

### CR19 — Canon instructs an author to copy a step pipeline

**Construct.** `workflows/meta/activities/patterns/README.md:40` — inside "How to consume": "Wire
your own `transitions` in a thin local wrapper activity when the borrowed file has none, **or copy
the step pipeline into a local activity** and bind the same ops with input overrides."

**Measured references.** One sentence. The README is the pattern library's own front door; its
catalog map (`:17-25`) gives the five borrow refs, and `schema-construct-inventory.md:41` and `:42`
plus `design-principles.md:119` and `:87` all point at it.

**Verdict: MISROUTING.** This is the only sentence in the corpus that tells an author to copy a run
of steps rather than reference it, and it is the practice that produced the four occurrences CR18
measures. Once the construct exists the second alternative is a routine reference with `with`
bindings, which is what "bind the same ops with input overrides" is trying to describe without a
mechanism.

**Blast radius.** The sentence is a fallback for the case where a borrowed activity has no
transitions of its own. Removing it without a replacement leaves that case unanswered, so the edit
belongs with stage 3 at the earliest (the construct) and stage 8 at the latest (the site set). Note
that all five files under `workflows/meta/activities/patterns/` **validate against nothing today** —
`npm run check:activities` prints "Total: 117 passed" against 122 activity YAML files on disk, and
the corpus documents the reason at `schema-construct-inventory.md:37` — so a copy made under this
instruction is ungraded twice over.

### CR20 — AP-38's classification has three arms and needs a fourth

**Construct.** `workflows/workflow-design/resources/anti-patterns.md:542-552`, AP-38
`no-duplicate-technique-steps`. Detect at `:548` classifies N steps binding one technique in one
activity as (a) redundant re-execution, (b) unrolled iteration, (c) monolith-masking. Do-not-flag at
`:550` exempts "distinct-purpose invocations at different pipeline points" and "same op as distinct
phases inside one loop iteration".

**Measured references.** Cited by name from `anti-patterns.md:302` (AP-18's Do-not-flag) and
nowhere else in the corpus; the catalogue as a whole is cited from 17 files.
`05-lead-researcher.yaml` binds **five** operations twice each in one activity —
`compose-worker-briefs` at `:43` and `:72`, `dispatch-workers` at `:46` and `:75`, `gather-results`
at `:49` and `:78`, `synthesise-results` at `:55` and `:84`, `assess-research-gaps` at `:58` and
`:87` — and every one of the ten is exempted by the two Do-not-flag clauses.

**Verdict: NARROWS.** The entry is not false and its exemptions are correct as written: the second
occurrence really is at a different pipeline point and really is inside a loop body. What the
construct changes is that the *reason* the ten pairs exist becomes nameable — a whole four-step run
occurs twice in one file — and a fourth classification becomes statable: **(d) repeated run — the
same consecutive sequence at two positions, extracted to a routine and referenced twice.** The
proposal counts this same intra-file occurrence as one no guard can see (README:941-942, stage 8's
"the intra-file occurrence at `05-lead-researcher` is gone even though no guard could see it").

**Blast radius.** Adding the arm before the construct exists gives an auditor a Fix with no
destination. Leaving it out after stage 8 leaves the catalogue unable to name the defect the stage
removed, so the next author reintroduces it under an exemption that still reads as correct.

---

## Rules the construct makes statable, and rules that pass on their merits

### CR21 — There is no rule anywhere for a run repeated across activities

**Construct.** The absence. Measured:

- `grep -c "fragment" workflows/workflow-design/resources/anti-patterns.md` returns **0**. Not one
  of the 151 `AP-NN` entries mentions the shared-body mechanism.
- `grep -n "across activities\|two or more activities\|several activities\|two or more sites"` over
  `anti-patterns.md`, `design-principles.md` and `schema-construct-inventory.md` returns **nothing**.
- The nearest entries are all scoped elsewhere: AP-38 (`:542`) is within one activity; AP-110
  `duplicate-shared-capability` (`:1433`) is a technique re-implementing a meta capability; AP-22
  `single-rule-authority` (`:346`) is rule text; AP-61 `factor-repeated-paths` (`:825`) is a path
  literal; AP-39 `hoist-universal-techniques` (`:554`) is an activity `techniques[]` listing.
  Principles 18, 22, 26 and 34 cover shared *capability*, modular *files*, technique atomicity and
  substitutability — none names a shared run of steps.

**Verdict: KEEP** — nothing to remove. This is the record's entry for the direction nobody has
tested. The corpus carries **26 maximal shared windows across 122 activity files, 21 top level and
5 nested** ([fragment-mechanism.md](../ground-truth/fragment-mechanism.md), reproducing the
proposal's own search), and **192 lines of byte-identical convergence structure under one SHA-256
prefix at six sites**. None of it is a catalogued smell, and the reason is visible: an entry's Fix
must state "portable remediation (delete, migrate, encode, rename)" (`anti-patterns.md:41`), and
until stage 3 there is no construct to migrate a shared run into. **The rule is unstatable because
the destination does not exist**, which is the cleanest example in this sweep of a canon gap caused
by a missing construct rather than by neglect.

What becomes statable, in the catalogue's own Detect/Do-not-flag/Fix shape, once stage 3 lands:
Detect — a run of two or more consecutive steps, matching on step kind and binding, appears in two
or more activity files or twice in one; Do not flag — runs already held by a routine reference, and
runs whose members differ structurally rather than by a declared input; Fix — declare a routine
under `routines/` and reference it, binding the differences as inputs. Stage 1's guard
(README:822-834) is the mechanical half and lands first, so from stage 1 there is a measured
population and no rule naming it — a state worth avoiding by writing the entry with the guard.

### CR22 — Principle 35 is the canon warrant for the migration, and the design passes it

**Construct.** `workflows/workflow-design/resources/design-principles.md:161-163`, principle 35
Prefer Removing the Thing That Needs a Prohibition: "Prose warning against a path — *do not also use
X*, *never combine this with Y* — usually means two constructs now do one job. Retire one and the
warning has nothing left to say, along with the validation and carve-outs that existed only to
police the overlap."

**Measured references.** One `##` section, walked as an enumeration unit by `audit-canon.md:62`.

**Verdict: KEEP**, and it is the discriminator for CR1. `ref-body-conflict` is precisely a
prohibition that exists only to police two homes for one gate body — its emission at
`scripts/check-fragments.ts:199` fires when a ref step also declares body fields, and at `:212` when
a condition sits on both step and fragment — and both carve-outs go with the mechanism.
`src/schema/activity.schema.ts:126-130` states the two-form authoring rule the prohibition enforces.
Principle 35's second clause also settles what happens where both paths must survive, and after
stage 5 they do not.

Read the other way, the principle does **not** fire on the design's own prohibitions, and it is
worth saying why rather than leaving it to inference. "A routine whose body declares an artifact may
be referenced at most once per activity" (README:1143-1145) exists because an artifact filename is
the host activity's numeric prefix plus the technique's bare filename and a routine has no prefix of
its own — a structural collision in one construct, not two constructs doing one job. Same for the
no-recursion rule and the no-free-variables rule.

### CR23 — Two literacy tables that look misrouted and are merely silent

**Construct.** `workflows/workflow-design/resources/convention-conformance.md:16` ("File naming |
Activities `NN-name.yaml`; techniques/resources kebab-case `.md`") and `:20` ("Checkpoint structure
| Inline `kind: checkpoint` steps with `message`, `options`, effects — same shapes as references");
plus the same pair in the template at `format-conventions.md:29` and `:35`.

**Measured references.** `convention-conformance.md` is a whole enumeration unit for
`audit-canon.md:62` (it has one `##` section) and is cited by
`workflow-design/techniques/reconcile-design-assumptions.md:39` as a criteria home.
`format-conventions.md:29,35` sit inside a fenced template block (`:14-54`).

**Verdict: KEEP**, with two discriminators.

- `:16` is **incomplete, not false.** A routine is not an activity, so "Activities `NN-name.yaml`"
  stays true; a routine file is `routines/<name>.yaml` with no position number (README:182-184), and
  the row is silent on it. The fix at stage 3 is an addition, not an amendment — which is a
  different obligation from every CONTRADICTED row above, and conflating the two is what this
  verdict exists to prevent. Note the row is not inert: an auditor comparing a drafted routine file
  against "the established conventions" and finding none would reach for AP-04 `no-invented-naming`
  (`anti-patterns.md:118-128`), whose Fix is correct as written — propose the convention and get
  approval — so the catalogue handles the gap even while the table is silent.
- `:20` and `format-conventions.md:35` give the **inline** checkpoint as the convention and never
  mention the ref form. That is the form that survives routines, so neither row is misrouted. It is
  also evidence for CR7's blast radius: the fragment mechanism's *only* home in corpus canon is one
  row in the construct inventory. Two conformance surfaces, one anti-pattern catalogue of 151
  entries and 35 design principles say nothing about it.

### CR24 — The `::` resolution rule is the one canon home routines inherit unchanged

**Construct.** `workflows/meta/resources/workflow-canonical.md:34-37`: "A technique is addressed by
its id… Addressing uses `::` paths: a reference to a technique in the same workflow is implicit, and
resolution searches the current workflow first, then `meta`."

**Measured references.** The ontology binds every file declaring `metadata.ontology:
workflow-canonical` (`:15-16`). `design-principles.md:123` names it as the home for loader
composition, and `anti-patterns.md:1501` exempts it as an authoritative platform home.

**Verdict: KEEP**, and it becomes load-bearing rather than changing. The proposal adopts this exact
rule for routine names: "A routine name resolves as `[workflow::]name` — a qualified name in that
workflow only, a bare name against the referring workflow and then the shared home… **The shared
home is therefore `meta`**, because that is what a bare technique path already falls back to:
referencing a routine the way the corpus references a shared technique gives the corpus one
resolution rule rather than two" (README:311-317). So this is the surface a refuter might expect to
need a routines clause and does not: the rule generalises without an edit.

**Blast radius.** None. Recorded because its `## On-disk layout` table (`:24-28`) enumerates three
shapes — standalone technique, container technique, resource — and does not mention `activities/`
either, so a routines row does **not** belong there. The table's scope is technique and resource
files; adding a routine row would extend the ontology past what it governs.

---

## What I looked for and did not find

An empty result on a surface is evidence, so each is recorded with the search that produced it.

**No anti-pattern entry mentions the fragment mechanism.**
`grep -c "fragment" workflows/workflow-design/resources/anti-patterns.md` returns **0** over 151
entries. So stage 5 retires a mechanism the catalogue has never had a smell for, and the only canon
edit stage 5 forces in `workflow-design/resources/` is CR7's single row.

**No design principle names a shared run of steps.** All 35 `##` sections read; the closest are 18
Prefer Shared Capability (`:85-87`, about a *capability* a technique owns), 22 Modular Over Inline
(`:101-103`, about *files*), 26 Atomic Techniques; Compose at Activities (`:117-119`, about
technique→technique calls and whole-activity borrowing) and 34 SOLID at the Definition Layer
(`:155-159`, whose Substitutability clause is the nearest abstract statement). None reaches a
sub-activity run.

**No rules bucket in any definition mentions a fragment, a shared run or a repeated sequence.** All
17 `workflow.yaml` files parsed; 13 carry a `rules:` key, 12 carry text across the `workflow`,
`activity` and `universal` buckets. Every entry is domain conduct — evidence grading, isolation
models, severity rubrics, toolchain routing. Not one mentions a construct choice.

**Activity-level `rules[]` has zero instances corpus-wide.** So `check-fragments.ts:181-191`
(the activity arm of `duplicate-rule`'s index) and `check-checkpoint-presentation.ts`'s recursive
activity-rules walk both run over an empty population. This is a standing fact rather than a
routines consequence, and it means the construct inventory's row 53 ("The agent must follow these
constraints | **Activity rules** | `rules[]`") maps an informal pattern onto a construct the corpus
never uses.

**Only one technique `## Rules` entry in 586 technique files states how a repeated multi-step run is
to be authored.** A keyword scan of every `## Rules` section for *fragment*, *shared run*,
*repeated*, *duplicate*, *reuse*, *borrow*, *gate body*, *copy*, *same sequence*, *extract* and
*factor* returned 35 lines, of which exactly one — `prefer-activity-composition` at
`orchestration-patterns/TECHNIQUE.md:64-66`, CR18 — is about authoring a run of steps. Every other
hit is domain content (deduplication of findings, immutable baselines, path factoring in prose).
**No technique `## Rules` entry anywhere mentions the fragment mechanism.**

**No guard other than `check-fragments` has a remedy naming the fragment mechanism.**
`grep -rn "fragment" scripts/*.ts`, excluding `check-fragments.ts` and `fragments-index.ts`, returns
**28 lines across 6 files**, and every one is accounted for without a second remedy appearing:
`check-checkpoint-presentation.ts` (10 lines — `:23`, `:88-90`, `:148-158`, the scope claim and the
dead `fragments.rules` path, CR15); `check-binding-fidelity.ts` (8 — `:61-62` and `:493` imports,
`:524-530` materialising fragments before reading, which is the shape of a routines-aware answer,
plus `:386`, where the word means a `changes/` changelog fragment); `guards.ts` (4 — the registry
entry, CR6); `check-site-links.ts` (4 — `:6`, `:77`, `:83-84`, where the word means a URL
fragment); `check-set-action-values.ts` (1 — `:173`, CR16); `run-batch-benchmark.ts` (1 — `:16`, a
consumer's header comment). **No finding detail string outside `check-fragments.ts` tells an author
to reach for a fragment.**

**No `proves` string in the registry is tested for truth.** `tests/guard-registry.test.ts:38`
asserts non-emptiness only. So CR6 is invisible to the suite that reconciles the registry.

**No canon surface describes a routine, a materialisation pass or a second definition directory.**
`grep -rn "kind: routine\|routines/" --include=*.md workflows/ docs/ schemas/` returns nothing
outside the planning folder. Stage 3 therefore adds a construct to a canon with eleven closed
enumerations of the step kinds (CR11), three closed enumerations of what may not be inlined (CR12),
and no row anywhere for a shared run — and no guard counts any of them.

---

## Re-taking every figure

```
# the nine fragment rules and their emission sites
grep -n "malformed-ref\|unresolved-ref\|ref-body-conflict\|ref-opens-step" scripts/check-fragments.ts
grep -n "unused-fragment\|inline-duplicate-of-fragment\|duplicate-rule\|duplicate-checkpoint\|undeclared-effect-variable" scripts/check-fragments.ts
npx tsx scripts/check-fragments.ts

# the mechanism's whole subject
grep -rn "fragments" --include=*.yaml --include=*.yml workflows/
grep -rn "ref:" --include=*.yaml workflows/*/activities/
grep -n "fragments" workflows/remediate-vuln/workflow.yaml

# the registry claim and what tests it
sed -n '252,258p' scripts/guards.ts
grep -n "proves" tests/guard-registry.test.ts
grep -n "check:fragments" package.json

# canon: the fragment row, the loop row, the gate row, the contract row
sed -n '47p;52p;54p;68p' workflows/workflow-design/resources/schema-construct-inventory.md
grep -c "^## " workflows/workflow-design/resources/schema-construct-inventory.md
grep -c "^## " workflows/workflow-design/resources/design-principles.md
grep -c "^### AP-" workflows/workflow-design/resources/anti-patterns.md
grep -c "fragment" workflows/workflow-design/resources/anti-patterns.md

# canon reach
grep -rn "schema-construct-inventory" --include=*.md --include=*.yaml workflows/
grep -rl "anti-patterns.md" --include=*.md --include=*.yaml workflows/ | wc -l
grep -rl "design-principles" --include=*.md --include=*.yaml workflows/ | wc -l
grep -rl "schemas/README" --include=*.md --include=*.yaml workflows/ | wc -l
sed -n '60,64p' workflows/workflow-authoring/techniques/workflow-definition/audit-canon.md
sed -n '34,38p' workflows/workflow-design/techniques/audit-expressiveness.md

# closed enumerations
grep -rnE "action.*checkpoint.*loop" --include=*.md workflows/ docs/ schemas/
grep -n "stepCommonFields\|stepEntryCondition" src/schema/activity.schema.ts
sed -n '167,172p' src/schema/activity.schema.ts

# the rules half of the mechanism, and the rules buckets
sed -n '38,51p' src/schema/workflow.schema.ts
grep -n "fragments\|{ ref }" schemas/README.md
grep -n "fragments" scripts/check-checkpoint-presentation.ts

# the stage-8 site set
grep -n "id:\|technique:\|kind:" workflows/meta/activities/patterns/05-lead-researcher.yaml
sed -n '64,66p' workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md
sed -n '40p' workflows/meta/activities/patterns/README.md

# the guard roster an auditor is handed
sed -n '22,33p' workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md
```

Three measurements were taken with throwaway scripts under the session scratchpad, and their rules
are stated in full above so each is re-derivable. The rules-bucket dump parses every
`workflows/*/workflow.yaml` with `yaml.safe_load` and prints each entry of each of the three
buckets, then every `workflows/*/activities/**/*.yaml`'s `rules` list. The technique `## Rules` scan
locates the `## Rules` heading in each of the 586 files under `workflows/*/techniques/**/*.md`,
takes the span to the next `##` heading, and prints every line containing one of the eleven listed
keywords. Neither writes anything. Counts of `##` sections and `### AP-` entries are plain
`grep -c` over the file.
