# Refuting the server-code sweep

Refutation pass over [sweeps/server-code.md](../sweeps/server-code.md), whose subject is the code in
`src/`, `scripts/` and `tests/` that the ROUTINES proposal at
[2026-09-03-routines/README.md](../../2026-09-03-routines/README.md) would supersede, narrow or leave
alone. I reproduced all **seventeen** candidates: located each construct, read it in full, re-took
every number the sweep states, and tested each verdict against the proposal's nine delivery stages
rather than against the sweep's reasoning. **Eight survived at the verdict the sweep gave them**, one
of those at reduced confidence. **Nine were downgraded.** No whole candidate was withdrawn; **four
sub-claims were**, and they are recorded below rather than dropped. One of the four is the central
measurement of a candidate, and its collapse produced the most consequential new finding in this
pass.

The nine downgrades share one shape, and it recurs often enough to be worth naming before the
evidence: **the sweep counts an addition as a narrowing.** Eight of its ten NARROWS verdicts describe
a construct the design *adds to* — a third textual rewrite beside two, a fourth resolution site, a
new discovery pass, a widened parameter, a merged-scope re-check that does not exist. Nothing about
those constructs shrinks. A ladder that measures what a design takes away has no rung for "the design
builds beside this", and the rung it belongs on is KEEP. Getting that wrong matters, because a
NARROWS verdict reads as scoped work inside an existing construct and a KEEP-plus-plan-defect reads as
new work the design has not costed. Every one of these eight is the second thing.

A second, smaller shape runs through three of the survivors. CV3, CV4 and CV13 answer "is this code
reusable for the new mechanism?" where the ladder asks "does the construct supersede, narrow or leave
this alone?". Reusability is orthogonal to survival: `materializeActivityFragments` is deleted when
the fragment mechanism retires at stage 5, and calling it NARROWS because four of its properties are
a good template describes the future rather than the change. Those verdicts survive on their
evidence, and their shape is corrected in place.

The single largest correction is CV10. The sweep says the server holds three implementations of one
`[workflow::]name` resolution rule and would get a fourth. Read rather than grepped, the technique
loader implements a **different** rule: it disambiguates a workflow prefix from a group prefix by
probing the filesystem (`src/loaders/technique-loader.ts:136`) and admits paths of any depth, where
the fragment resolver reads any `::` head as a workflow and rejects a second separator outright
(`src/loaders/fragment-resolver.ts:41-44`). Measured over the corpus, the two rules agree on **264 of
672** technique bindings and disagree on **408**. So README:314-316's justification for the shared
home — "referencing a routine the way the corpus references a shared technique gives the corpus one
resolution rule rather than two" — is false as stated: a routine reference spelled like a technique
reference resolves differently from one.

## What the verdicts mean here

The sweep does not define its ladder, so these are the definitions this pass applies, chosen so the
distinction carries information about the work rather than about the code's future.

| Verdict | Meaning in this pass |
|---|---|
| **REMOVE** | A named construct that no longer exists after a named stage. The routines work deletes it, and there is nothing left to amend. |
| **DEPRECATE** | The construct keeps its home and its callers, but the reason it exists stops holding at a named stage. It must be retired or re-justified in that change. |
| **NARROWS** | The construct survives with its reach reduced: a smaller subject population, or a branch that admits fewer cases than it admits today. |
| **KEEP** | The construct survives with its reach unchanged. Work added *beside* it is not a narrowing of it — that is new work, and where the design has not priced it, it appears below as a plan defect. |
| **WITHDRAWN** | The claim does not survive measurement. Recorded with the reason, never dropped. |

**REMOVE, DEPRECATE and NARROWS are claims about the routines construct**, not about repository
hygiene. A construct that ought to be deleted for reasons unrelated to routines is not REMOVE; that
is what sank CV1.

## The baseline, and a drift note

The sweep declares its baseline as server tooling at `9ca71c19` on `main` and corpus at `2b8b7215` on
`workflows`. **The working tree has since moved**, to `c1c9682d` and `26e79d8a`. Seven tracked source
files changed in between, four of them sweep-relevant: `src/loaders/workflow-loader.ts`,
`src/tools/workflow-tools.ts`, `scripts/check-activity-variables.ts` and
`scripts/check-binding-fidelity.ts`.

Every figure and every `file:line` in this document is taken at the sweep's declared baseline,
extracted with `git archive 9ca71c19` and `git archive 2b8b7215` into a scratch tree, so that a
citation which does not land is an error rather than drift. Where a cited line has since moved, the
current position is given. The four that matter:

| Citation at `9ca71c19` | At the working tree `c1c9682d` |
|---|---|
| `src/tools/workflow-tools.ts:1399` (`injectResolvedStepIds`) | `:1406` |
| `src/tools/workflow-tools.ts:1408` (`injectCheckpointFragmentBodies`) | `:1415` |
| `scripts/check-activity-variables.ts:147` (`deriveActivityContract`) | `:158` |
| `scripts/check-binding-fidelity.ts:529` (`injectCheckpointFragmentBodies`) | `:570` |

The triage ledger `check-binding-fidelity` carries moved from **72** entries to **70** in the same
span. `src/schema/activity.schema.ts`, `src/loaders/fragment-resolver.ts`,
`src/utils/activity-variables.ts`, `src/utils/validation.ts` and every `scripts/check-*.ts` the sweep
cites other than the two above are untouched, so the bulk of its citations land at both commits.

**Nothing in the design is built, at either commit.**
`grep -rin routine src scripts tests --include=*.ts | grep -vi routinely` returns nothing.
`ls -d workflows/*/routines` reports no such directory. `StepSchema`
(`src/schema/activity.schema.ts:167-172`) declares exactly four members. Stage 0 alone has landed, so
every construct below stands today.

## Plan defects — findings the design owes rather than removals

These change the plan, not the code, and the first two are load-bearing enough that a stage cannot be
written correctly without settling them.

### PD1. The load path in the design diagram does not exist

README:333-354 draws `Parse → Ids → Materialise → Derive → Bind → Ready` and rests the entire
boundary on the ordering: "materialisation runs … **before** the contract is derived, so the
derivation still meets the reference and can treat it as a boundary. Getting that order wrong erases
the signature the whole design rests on."

Measured off `loadWorkflowWithDiagnostics` (`src/loaders/workflow-loader.ts:252-392`), the loader
performs five of those six steps and **not the derivation**. `deriveActivityContract`
(`src/utils/activity-variables.ts:417-582`) has one definition and two call sites, both in one guard:
`scripts/check-activity-variables.ts:147` and `:463`. `grep -rn "deriveActivityContract" src/` returns
the definition and its own doc comment (`src/utils/activity-variables.ts:19`) and nothing else. Both
call sites read `loadWorkflowWithDiagnostics` output (`scripts/check-activity-variables.ts:97`,
`:458`), which is **already materialised** at `src/loaders/workflow-loader.ts:346`.

So a routine reference is gone before the derivation ever meets it, and the stage-3 criterion
"Materialisation runs after identifier resolution and before contract derivation, and a test fails if
the order is swapped" (README:854-855) has no order to swap. The design owes one of three mechanisms
and names none: materialisation becomes optional and the guard asks for the unmaterialised form; the
derivation moves into the loader between steps 4 and 5; or the loader records the sites it spliced and
hands them to the derivation as a side table. README:1087-1089 implies the third for variable
injection — "the loader injects them into that activity's `variables.writes` during materialisation" —
which is a different mechanism from a derivation that "meets the reference", and the two are described
as one thing.

### PD2. A routine that binds any technique with an interpolating protocol has free variables

`readSignature` (`src/utils/activity-variables.ts:348-398`) collects every `{token}` from a bound
operation's protocol blocks, its rules and its artifact filename templates (`:362-372`), strips those
naming the operation's own signature (`:389`), and the derivation adds the remainder to the referring
activity's reads at **one line** — `signature.proseReads.forEach(read)` at `:520`.

Those tokens come from technique markdown. They are not a field of any step, so they lie outside the
substitution field list by construction and materialisation cannot rewrite them. A routine whose body
binds any technique whose prose interpolates a bag name therefore reads a name it does not declare,
which contradicts "A routine has no free variables: every name its body reads or writes is one of the
three" (README:210-212) and "a routine has no free variables and contributes only what it declares"
(README:529). The stage-4 criterion "A routine's declared signature is held against its own body. An
output nothing writes, an input nothing reads … each fail the load" (README:869-871) either reports
every prose-sourced read as an undeclared input, or silently drops the category and loses the tight
boundary that is the second of the design's two claimed differences (README:526-529). The proposal
settles neither. This is the largest unspecified decision on the surface and it is made by one
`forEach`.

### PD3. The resolution rule a routine is said to inherit is not the rule a technique reference follows

README:311-316 argues the shared home from the technique convention. Measured, the two conventions are
different rules that share a spelling.

`parseFragmentRef` (`src/loaders/fragment-resolver.ts:38-45`) splits on `::`, treats a single
separator's head as a **workflow**, and throws `Malformed fragment ref` on a second separator (`:44`).
`candidateWorkflows` (`:47-54`) then resolves a qualified name in that workflow **only**.

The technique resolver does neither. At `src/loaders/technique-loader.ts:136` a leading segment is a
workflow prefix only if `existsSync(getWorkflowTechniquesDir(...))` — a filesystem probe — and
otherwise the head is a **group** resolved `[declaring workflow, meta]` at `:156`. Depth is unbounded:
`group::subgroup::op` is ordinary (`:142`, `:159`).

Over the baseline corpus's 672 technique bindings, read by `parseFragmentRef`'s rule:

| How `parseFragmentRef` would read it | Bindings |
|---|---|
| Bare name — both rules agree (declaring workflow, then `meta`) | **260** |
| One separator, head is a workflow directory — both rules agree | **4** |
| One separator, head is a group directory — read as a workflow that does not exist, no fallback | **360** |
| Two or more separators — `Malformed fragment ref`, throws | **48** |

The rules agree on 264 bindings and disagree on 408. A routine reference spelled `[workflow::]name`
follows the fragment rule, so the corpus does not get "one resolution rule rather than two" — it gets
a third rule that looks like the second and resolves like the first. The design owes either an
explicit statement that a routine name carries no group grammar and at most one separator, or a
reconciliation of the two resolvers.

### PD4. Stage 4's guard-column criterion is priced at two discovery passes and costs fifteen

README:874-876 asks that "Every guard that reads an activity file sits in a recorded column. The
authored-form guards walk `routines/`". CV16 prices this at two discovery passes. Measured, an
`activities/` directory is opened by **fifteen** independent `readdir` sites implementing **four**
distinct rules:

| Rule | Sites |
|---|---|
| Flat `readdir`, numeric-prefix regex gate | `src/loaders/workflow-loader.ts:75-81` |
| Flat, `.yaml` suffix only | `scripts/validate-activities.ts:110`, `scripts/validate-workflow-yaml.ts:141`, `scripts/check-activity-technique-overlap.ts:63`, `scripts/check-launched-workflows.ts:138`, `scripts/check-self-composed-set.ts:103`, `scripts/check-self-provisioned-input.ts:81`, `scripts/check-when-expression.ts:63` |
| Flat, `.ya?ml`, or every entry filtered later | `scripts/check-fragments.ts:170`, `scripts/check-message-binding.ts:101`, `scripts/check-decision-order.ts:177`, `scripts/check-review-mode-gating.ts:201`, `scripts/check-variable-model.ts:170`, `scripts/check-checkpoint-entry.ts:41` |
| **Recursive**, `.ya?ml`, nested library subdirectories included | `scripts/workflow-declarations.ts:19-25`, `scripts/check-binding-fidelity.ts:502-506` |

One of the fifteen — `scripts/check-message-binding.ts:101` — has **no entry in `scripts/guards.ts`**
at all, so a criterion phrased as "every guard sits in a recorded column" already has a guard reading
activity files from outside the registry the column would be recorded in.
`scripts/check-session-contract.ts` is a second unregistered guard that reads activities, though it
takes them from the loader (`:87`) rather than from disk, so it would see a materialised routine
without changing.

### PD5. The exhaustiveness criterion reaches 34 of 61 sites, and its unnamed prerequisite costs 712 errors

The stage-3 criterion "An exhaustiveness assertion over the step kinds fails to compile when a kind is
added" (README:856) is structurally capped by what the compiler sees. `tsconfig.json` sets
`include: ["src/**/*"]` and `git ls-files | grep tsconfig` returns exactly one file;
`vitest.config.ts` has no `typecheck` block. So of the 61 step-kind comparison sites, 34 are inside
the typechecker and 27 are not.

Extending the compiler to reach them is the prerequisite the criterion does not name, and it is not
free. With `include: ["src/**/*", "scripts/**/*", "tests/**/*"]` under the repository's own compiler
options at the baseline, `tsc --noEmit` reports **712 errors across 65 files** — 225 in `scripts/`
across 33 files, 487 in `tests/`. 498 of the 712 are TS4111 (index-signature property access, the
consequence of `noPropertyAccessFromIndexSignature` meeting untyped parsed YAML), so the substantive
residue is around 214; among it is exactly the error the sweep names,
`scripts/check-loop-shape.ts(96,11): error TS2345: Argument of type '"breakCondition"' is not
assignable to parameter of type 'keyof LoopStep'`.

### PD6. Nothing compares the two representations, and there is no ordering guarantee to build on

The delivered activity text is assembled in four sequential statements in one function body —
`src/tools/workflow-tools.ts:1399`, `:1405-1410`, `:1823-1825`, `:1867`. No comment states the order
is load-bearing, no test names `injectResolvedStepIds`, and no test compares the object path against
the text path. The one test of the textual path, `tests/fragment-resolver.test.ts:184-195`, runs the
fragment injector alone over a 16-line synthetic fixture. The stage-3 criteria at README:859-863 — a
differential test over every activity in the corpus on every run, comparing parsed objects field for
field and a named set of fields as text — are therefore entirely new code with nothing to extend, and
the ordering criterion at README:854-855 constrains the object path only (see PD1).

### PD7. Identifier population is typed to an activity, and two containers collapse a collision silently

README:1158-1162 wants identifier population "**per definition** — a routine's own body has its ids
filled within the routine's scope before prefixing, and uniqueness is re-checked in the merged scope
afterwards". Half exists.

`populateStepIds` (`src/schema/activity.schema.ts:193-224`) is already a per-scope mechanism and
already treats a loop body as an independent scope (`:216-218`). But its signature is
`populateStepIds(activity: Activity)` and it interpolates `activity.id` into all three of its messages
(`:202`, `:209`), so a routine — which is not an `Activity` — cannot be passed to it without widening
the parameter or synthesising a shell.

And **no merged-scope re-check exists anywhere**. `flattenActivitySteps` returns a list, and the two
consumers that could notice a clash both collapse it: `knownIds` is a `Set`
(`src/utils/validation.ts:128-130`), and `declarationIndex` is a `Map` keyed by id
(`src/utils/validation.ts:147`) — the second is the one that decides the step-order check, so a
collision loses an order constraint as well as a manifest entry. Both fail silently.

### PD8. The intra-activity artifact limit has no mechanism, and a routine's artifact inherits a fanning host's obligation

README:1139-1147 requires "A routine whose body declares an artifact may be referenced at most once
per activity", closed transitively. Nothing checks the intra-activity case at any grain:
`DerivedContract.artifactNames` is a `Set` (`src/utils/activity-variables.ts:446`), so two steps in
one activity resolving one filename collapse to one entry, and both consumers
(`scripts/check-activity-variables.ts:372`, `:399`) are keyed on a `fan`.

A second interaction follows from materialisation and is not addressed: because the derivation runs on
the *materialised* activity, a routine's artifact names enter `artifactNames` for the host, and the
instance arm at `scripts/check-activity-variables.ts:395-408` requires every artifact name on a fanned
activity to interpolate that fan's per-instance parameter. A routine authored without knowledge of a
fanning host fails there. Stage 8's fan-out routine is the site where this first becomes live. I mark
this PLAUSIBLE rather than confirmed: it follows from materialisation existing, which it does not yet.

### PD9. The stage-3 criterion that mentions the id injector justifies itself by an empty hazard

The criterion at README:857-858 — "The textual splicer emits an explicit prefixed `id:` on every step
it splices, nested bodies included, so `injectResolvedStepIds` has nothing to match inside a
materialised routine" — states an obligation and then justifies it by a regex whose subject population
is zero (CV1). The obligation is right and the justification is empty: what makes an explicit `id:`
on every spliced step necessary is that the object path fills ids and the text path must agree, and
that hazard is untouched by `injectResolvedStepIds`, which only matches a step whose first YAML key is
`technique`. The criterion needs its real reason written down, or removing the injector will read as
licence to drop it.

### PD10. The verifying schema-generator variant, as specified, cannot see the file it most needs to

`scripts/generate-schemas.ts:25-29` generates five JSON schemas; `schemas/` holds six.
`schemas/technique.schema.json` is hand-authored draft-07 with its own `$id`, and no code references
it (`grep -rn "technique\.schema\.json" src scripts tests package.json` is empty). Meanwhile
`docs/technique-protocol-specification.md:9` states it is "generated from
[its Zod source](../src/schema/technique.schema.ts)" — the documentation asserts what the repository
does not do.

The stage-3 criterion asks that "the schema generator has a verifying variant, so a forgotten
regeneration fails continuous integration" (README:846-848). A `--check` written to that wording
regenerates the generator's own five and diffs them; it stays blind to a sixth file that is not in the
set. Catching the hand-authored schema needs a directory-completeness assertion, which is a different
check and is not what the criterion asks for. Also worth noting for scheduling:
`npm run build:schemas` (`package.json:10`) appears in neither `test:ci` nor
`.github/workflows/verify.yml`, so there is no regeneration step in CI to forget yet.

## Verdicts after refutation

| Id | Construct | Sweep | Verified | Confidence |
|---|---|---|---|---|
| CV1 | `injectResolvedStepIds` — the textual step-id injector | REMOVE | **DEPRECATE** | CONFIRMED |
| CV2 | The two-injector delivery chain and the order among its stages | NARROWS | **KEEP** | CONFIRMED |
| CV3 | `injectCheckpointFragmentBodies` — two consumers, one runner-conditional | KEEP | **KEEP** | CONFIRMED |
| CV4 | `materializeActivityFragments` — the object-path fragment materialiser | NARROWS | **NARROWS** | PLAUSIBLE |
| CV5 | `deriveActivityContract` is not in the load path | NARROWS | **KEEP** | CONFIRMED |
| CV6 | The change to the derivation, measured by compiler | NARROWS | **NARROWS** | CONFIRMED |
| CV7 | No exhaustive switch over step kinds, 27 of 61 sites outside the typechecker | NARROWS | **KEEP** | CONFIRMED |
| CV8 | `flattenActivitySteps` and the eight independent walks | KEEP | **KEEP** | CONFIRMED |
| CV9 | `populateStepIds` — the per-scope identifier pass | NARROWS | **KEEP** | CONFIRMED |
| CV10 | `[workflow::]name` resolution with a `meta` fallback, three times over | NARROWS | **KEEP** | CONFIRMED |
| CV11 | `TechniqueBindingSchema` — the argument grammar `with` duplicates | NARROWS | **KEEP** | CONFIRMED |
| CV12 | The derivation cannot take a non-activity, and prose reads are free variables | NARROWS | **KEEP** | CONFIRMED |
| CV13 | `unused-fragment` and `duplicate-checkpoint` — the reusable half of stages 1 and 4 | KEEP | **KEEP** | CONFIRMED |
| CV14 | `fan-artifact-collision` — the filename-collision family, fans only | KEEP | **KEEP** | CONFIRMED |
| CV15 | The raw-text delivery path | DEPRECATE | **DEPRECATE** | CONFIRMED |
| CV16 | Activity discovery, and the schema generator with no verifying variant | NARROWS | **KEEP** | CONFIRMED |
| CV17 | `INSTANCE_SEPARATOR` and the checkpoint response key | KEEP | **KEEP** | CONFIRMED |

---

## CV1 — The injector's subject population is empty, and no stage deletes it

**Reproduced.** `injectResolvedStepIds` at `src/schema/activity.schema.ts:234-243`, one regex
`/^(\s*)- technique:[ \t]*(.+)$/gm`, with `defaultStepId` at `:181-184` as its object-path
counterpart, called from `populateStepIds` at `:205` and from the injector at `:239`. One production
call site, `src/tools/workflow-tools.ts:1399`. `git grep "injectResolvedStepIds" 9ca71c19 -- tests`
returns nothing; so does the same search for `populateStepIds` and `defaultStepId`.

**The subject count reproduces exactly, three ways.** I re-took all three with my own probes rather
than accepting them:

| Measurement | Sweep | Mine |
|---|---|---|
| Activity files whose text `injectResolvedStepIds` changes | 0 of 117 | **0 of 117** |
| Source lines matching the `- technique:` opener, across all 122 activity files | 0 | **0** |
| Technique steps declaring no `id:` | 0 of 672 | **0 of 672** |

The first came from importing `injectResolvedStepIds` from the baseline tree and comparing output to
input over every `<wf>/activities/*.yaml`; the other two from a `yaml.safe_load` walk of all 122 files
(117 flat plus the 5 under `meta/activities/patterns/`), which also reproduces the step population
exactly: 1,003 steps, 672 `kind: technique`, 162 `action`, 115 `checkpoint`, 54 `loop`, and 1,003 of
1,003 carrying an authored id.

The schema argument reproduces too: every member of `steps[].anyOf` in
`schemas/activity.schema.json` requires `kind`, so a step whose first YAML key is `technique` must
still write `kind: technique` on a later line to validate. The injector's target is a schema-valid
step in an unnatural key order, which nothing in the corpus writes.

**Verdict: DEPRECATE, down from REMOVE.** Two things break the REMOVE case.

First, **no stage deletes it.** REMOVE, on this ladder, is a claim about the routines construct. The
stage-3 criterion at README:857-858 does not retire `injectResolvedStepIds`; it routes *around* it by
requiring the splicer to emit explicit prefixed ids. The sweep concedes the point itself: "the honest
replacement is to require `id` on the technique step member … and is a schema change the routine work
does not need." A construct the design leaves standing is not REMOVE.

Second, **"deleting it retires the criterion" does not hold.** I withdraw that sub-claim below. The
criterion's obligation — an explicit `id:` on every spliced step — is needed whether or not the
injector exists, because the object path fills ids from `populateStepIds` and the text path must
agree; the injector never covered that hazard, since it matches only the `- technique:` opener form.
What the injector's removal retires is the criterion's *stated reason*, leaving the real reason
unwritten. That is PD9.

What survives is DEPRECATE's exact shape: the construct keeps its home and its one caller, and stage
3 makes the justification in its own doc comment (`:226-232`, "A step whose id was derived from its
technique begins with the `- technique:` field") false for spliced content while the corpus has
already made it false for authored content.

**What breaks if it goes at the wrong time.** Nothing measurable. The hazard it was written against
is live for the other authoring form and this injector does not cover it: a step written `kind:
technique` first with no `id:` gets an id from `populateStepIds` and none from the regex. Removing it
removes a partial guard against a divergence the corpus does not exercise — and must not take
`defaultStepId` with it (see the keep list).

---

## CV2 — Four textual stages, no ordering guarantee, and the chain grows rather than shrinking

**Reproduced.** The four stages land exactly where the sweep says: `injectResolvedStepIds` at
`src/tools/workflow-tools.ts:1399`; `injectCheckpointFragmentBodies` gated on the
`scanCheckpointRefLines` pre-scan at `:1405-1410`; the composed artifact contract appended to the same
string at `:1823-1825`; the ops section, header, inherited rules and enforcement notes prepended at
`:1867`. All four are sequential statements in one function body. The comment at `:1401-1404` explains
the fragment materialisation and says nothing about ordering. No test names the id injector, and
`tests/fragment-resolver.test.ts:166-199` runs the fragment injector alone over a synthetic fixture.

The sweep's note that [agent-interpretation.md:85](../../2026-09-03-routines/agent-interpretation.md)
cites `injectCheckpointFragmentBodies` at `:1049-1058` where it now sits at `:1408-1409` reproduces,
and is line drift.

**Verdict: KEEP, down from NARROWS.** The routines construct adds a third textual rewrite to this
chain. It removes nothing from it and narrows no branch of it. Under this pass's definitions that is
KEEP, and the sweep's own verdict paragraph concedes the narrowing it claims is empty — "the ordering
obligation the record raises is vacuous under CV1: stage 1 is a no-op over the corpus, so whichever
way you order the three, the observable result is the same today."

What is real here is the absence, and it is PD6: no differential test, no ordering comment, and a
stage-3 criterion set (README:859-863) that is new code end to end. The one substantive observation I
would keep from the sweep's reasoning is its sharpest: the routine splicer is the first textual rewrite
whose output is *structural* rather than field-level — a whole step block at a computed indentation —
and `injectCheckpointFragmentBodies` is line-oriented by construction
(`src/loaders/fragment-resolver.ts:168-188` walks backwards to the nearest `- ` opener at the right
indentation to prove it is inside a checkpoint step). Nothing in the existing textual machinery emits
a nested block.

---

## CV3 — Two consumers, and only the delivery one is runner-conditional

**Reproduced.** `injectCheckpointFragmentBodies` at `src/loaders/fragment-resolver.ts:161-211`, with
`scanCheckpointRefLines` at `:218-224`. Line-oriented as described: the standalone `ref:` match at
`:192`, the enclosing-block proof at `:168-188`, the replacement serialised at the same indentation at
`:197-208`.

Two production call sites, both confirmed:

| Consumer | Site | Verified |
|---|---|---|
| `get_activity` delivery | `src/tools/workflow-tools.ts:1408` | the worker reads the original file text (`readActivityRaw` at `src/loaders/workflow-loader.ts:951-1005` returns unmodified content) |
| `check-binding-fidelity` | `scripts/check-binding-fidelity.ts:529` | the rationale at `:524-527` reproduces verbatim |

**The refutation of the proposal's costing survives, and I strengthened its evidence.** README:464-465
says "The runner never delivers activity text, so the textual implementation is written for an
arrangement that is ending." The guard's consumption is not runner-conditional, and the reason is
structural rather than incidental: `check-binding-fidelity` does not go through the loader at all. It
imports `parseDefinition` (`:56`), the fragment resolver (`:61`) and the sync fragments index (`:62`),
and reads raw activity YAML at `:523` before injecting at `:529`. It never imports
`loadWorkflowWithDiagnostics`, so the object-path materialiser at
`src/loaders/workflow-loader.ts:346` is invisible to it — the textual injector is the *only*
materialisation it can see. Blinding it turns a **72-entry** triage ledger
(`scripts/binding-fidelity-triage.json`, `entries` array; 70 at the working tree) into silence about
every fragment-declared `setVariable` producer and every fragment message read.

**Verdict: KEEP, survives.** Two corrections, neither fatal.

The reference count is off: the sweep says "four test references in
`tests/fragment-resolver.test.ts`"; `grep -c` gives **three** (the import at `:8`, the `describe` at
`:166`, the call at `:185`). And `parseDefinition` is imported at `:56`, not `:55`.

The verdict is also mis-shaped, and this is the more useful correction. The named function is
**deleted** when the fragment mechanism retires at stage 5 — the sweep says so itself: "At stage 5 the
fragment mechanism goes anyway." What KEEP correctly names is not the code but the *obligation*: a
guard that reads authored YAML and wants materialised content still needs a textual materialiser after
the fragment one is gone. So the honest reading is that the code is REMOVE and the obligation is
KEEP, and the gap between them is unscoped work the proposal admits at README:1069. Read as a claim
about code survival the verdict is wrong; read as a claim about what the design still owes it is
right, and it is the second-best argument in the sweep.

---

## CV4 — The near-twin, verified, with one over-count

**Reproduced.** `materializeActivityFragments` at `src/loaders/fragment-resolver.ts:137-152`, walking
steps and recursing into loop bodies only (`:146-147`), scoped to the activity's source workflow
(`:132-136` doc, `:140` parameter). `materializeCheckpointStep` at `:96-130`: refuses a local body
field beside `ref` (`:111-116`), refuses a condition on both sides (`:118-122`), copies five fields
and deletes the `ref` (`:123-128`).

Reference counts all reproduce. `materializeActivityFragments`: one definition, one call site,
`src/loaders/workflow-loader.ts:346`, inside the per-activity try/catch that excludes an activity
whose fragments do not resolve (`:342-355`, the exclude-and-report contract at `:348-354`).
`materializeCheckpointStep`: one definition, one production caller (`:145`).
`collectCheckpointRefs` (`:227-237`): one definition, one caller, `workflow-loader.ts:336`, feeding
the lookup pre-load at `:325-340`. `WorkflowFragmentsSchema` has one key, `checkpoints`
(`src/schema/workflow.schema.ts:40-42`).

**One count does not reproduce.** The sweep says "the module asserts its own non-recursion **three**
times". `grep -rn "cannot itself contain\|never recurses\|plain content" src scripts schemas` returns
**two** sites: `src/loaders/fragment-resolver.ts:17-18` and `src/schema/workflow.schema.ts:39`. I
could construct no search giving three. Separately, "eight references in
`tests/fragment-resolver.test.ts`" measures as **12 textual occurrences, 10 of them calls**; eight is
the count of `expect(() => materializeCheckpointStep(...))` assertion sites specifically (`:116`,
`:122`, `:127`, `:142`, `:147`, `:152`, `:153`, `:160`), which is a defensible sub-count described as
the whole.

**Verdict: NARROWS, survives at reduced confidence.** The reusable/not-reusable split is the sweep's
best analytical work and it holds: the source-workflow scoping is the resolution scope a borrowed
activity's routine reference needs unchanged; the exclude-and-report failure contract is the shape
every terminal state of the reference lifecycle wants; the lookup pre-load is the pattern a routine
file read wants. And `materializeCheckpointStep` genuinely **fills fields on an existing step** where a
routine **replaces one step with N** at a computed prefix with a simultaneous rename, so it cannot be
extended in place — and the module's two non-recursion assertions become false, because a routine may
reference another routine (README:318-328).

I mark it PLAUSIBLE rather than CONFIRMED because the verdict is mis-shaped in the same way as CV3:
the module is deleted at stage 5, so what NARROWS describes is pattern reuse, not code survival. Two
of the four "reusable" properties — the failure contract and the pre-load — are patterns, not code
that can be called; only the scoping is a value (`activitySourceWorkflow` at
`src/loaders/workflow-loader.ts:277`, `:288`) that a new mechanism can read directly.

**What breaks if it goes at the wrong time** reproduces and is worth keeping verbatim in spirit: both
representations have to go in the same change, or the object path and the text path disagree about
whether a gate exists.

---

## CV5 — The derivation is not in the load path, and that is a plan defect rather than a narrowing

**Reproduced, line for line.** The load-path table is exact:

| Order | What | Site | Verified |
|---|---|---|---|
| 1 | parse and validate each activity file | `src/loaders/workflow-loader.ts:87-93`, `:167-173` | yes |
| 2 | `populateStepIds` | `:94`, `:174` | yes |
| 3 | validate the workflow object | `:312-316` | yes |
| 4 | `materializeActivityFragments` | `:346` | yes |
| 5 | `mergeActivityVariables` | `:367` | yes |
| 6 | `validateExitBindings` | `:383` | yes |

`deriveActivityContract` is absent from all six. Two call sites, both in
`scripts/check-activity-variables.ts` (`:147`, `:463`), both over already-materialised activities
(`:97`, `:458`). The guard's hard-zero note at `:25` reproduces verbatim: "Hard zero, no ledger: every
finding named a definition defect and each was fixed in the corpus."

**Verdict: KEEP, down from NARROWS.** Nothing about `deriveActivityContract` narrows. The construct is
either relocated into the loader, or fed a side table, or left where it is with materialisation made
optional — three different designs, none of them a narrowing, and the proposal specifies none. The
sweep's own verdict paragraph does not name a narrowed subject; it names a missing mechanism. That is
PD1, and it is the most consequential finding on the surface, so filing it as a verdict on a code
construct understates it.

The sweep's closing observation reproduces and matters: ordering the derivation before the splice is
exactly what would fix the class-(d) instance the guard ground truth has no answer for, because a
materialised internal is `undeclared-use` twice over against a guard that is hard zero with no ledger
— and that ordering does not exist to be preserved.

---

## CV6 — Three compile errors, then zero, both reproduced exactly

**Reproduced.** The derivation's step loop is a chain of positive comparisons, not a switch:
`src/utils/activity-variables.ts:483` (the loop), `:487` (`loop`), `:498` (the `else`), `:499`
(`step.condition`), `:502` (`technique`), `:539` (`checkpoint`), `:552` (`technique || action`). Write
side `write` at `:474-481`; read side `read` at `:449-457`.

**I re-ran the probe rather than accepting it, and both halves reproduce to the character.** Copied
`src/`, `tsconfig.json` and `package.json` at `9ca71c19` to a scratch directory, symlinked the
repository's `node_modules`, ran `tsc --noEmit`. Baseline: clean, exit 0. Added a `RoutineStepSchema`
as a fifth member of `StepSchema` carrying `kind: 'routine'`, a required `id`, a `routine` string, a
`with` record of the `TechniqueBindingSchema` scalar union, an `outputs` record of strings and the
`stepCommonFields` spread. Result: **exactly three errors, all TS2339 `Property 'condition' does not
exist`**, at

```
src/tools/workflow-tools.ts(1571,60)
src/utils/activity-variables.ts(499,27)
src/utils/validation.ts(123,65)
```

Every one is a site treating "not a loop" as "carries a `condition`" — `validation.ts:123` is
`(s.kind === 'loop' ? s.continueWhile === undefined : s.condition === undefined)`. Adding
`...stepEntryCondition` to the probe member — the spread three of the four existing kinds carry
(`src/schema/activity.schema.ts:101`, `:110`, `:140`) and the loop kind deliberately does not
(`:151`) — recompiles **clean: zero errors, with a step kind nothing handles.**

**Verdict: NARROWS, survives.** This is a genuine narrowing and the only one on the surface: the
`else` at `:498-500` admits "every kind that is not a loop" today and must admit "every kind that is
neither a loop nor a routine reference" after stage 3. The compiler names both edits.

One correction to the framing. The sweep's title quotes "the 'one change' to the derivation", and
README:531's "That is the single change to the derivation" refers to the *boundary semantics* of the
preceding paragraph — a routine contributing only its declared signature where a technique step leaks
its prose `{token}`s (README:521-529) — not to an edit count. So the sweep measures the edit cost of
implementing that semantic change, which is fair work, against a sentence that was not making an edit
count claim. The measurement stands on its own; the quotation does not support it.

The sweep's closing hazard is the sharpest sentence in the document and reproduces exactly: "The
three-error result is the design's own safety net and it is one field away from being disabled."

---

## CV7 — The counts reproduce exactly, and the finding is about a criterion rather than a construct

**Reproduced, every figure.**

| Measurement | Sweep | Mine |
|---|---|---|
| `kind (===\|!==\|==\|!=) '(technique\|action\|checkpoint\|loop)'` sites, `src scripts tests` | 61 across 22 files | **61 across 22 files** |
| in `src/` (typechecked) | 34 across 8 files | **34 across 8 files** |
| in `scripts/` + `tests/` (not typechecked) | 27 across 14 files | **27 across 14 files** |
| `switch (step.kind)` / `switch (s.kind)` / `assertNever` / `: never =` | none | **none** |

The per-file tally reproduces in order: `activity.schema.ts` 7, `workflow-tools.ts` 6,
`tests/e2e/walker.ts` 5, `binding-provenance.ts` 5, `activity-variables.ts` 5, `fragment-resolver.ts`
4. `tsconfig.json` sets `include: ["src/**/*"]` and `git ls-files | grep tsconfig` returns exactly one
path — the 83 other `tsconfig.json` files under `.worktrees/` are checkouts of the same file, so the
sweep's "one tsconfig in the repository" is right on the tracked set. `vitest.config.ts` has no
`typecheck` block.

The sweep's disagreement with README:431-433's "57 places across 19 files" stands; my count is the
same 61 across 22 under the same rule, and I could construct no rule giving 57.

`scripts/check-loop-shape.ts` reproduces as a live example, and I proved it rather than inferring it:
the local `LoopStep` interface at `:43-49` declares five fields and omits `breakCondition`, `has` is
typed `(field: keyof LoopStep)` at `:53`, and `has('breakCondition')` at `:96` is a real TS2345 that
appears the moment `scripts/` enters the compiler.

**Verdict: KEEP, down from NARROWS.** All 61 sites keep testing for the same four kinds after the
construct lands, because a `kind: routine` step exists between parsing and materialisation and nowhere
else (README:430-431). Nothing narrows. The finding — that the stage-3 criterion at README:856 reads
as covering the population and structurally reaches 34 of 61, or 55.7% — is a defect in the criterion,
not a change to the code. It is PD5, now priced at 712 errors across 65 files.

---

## CV8 — The shared traversal and the eleven loop-only walks, verified

**Reproduced.** `flattenActivitySteps` at `src/schema/activity.schema.ts:322-332`, documented at
`:318-321` as "The single traversal all step/checkpoint consumers route through", recursing into
exactly one thing at `:327`.

**13 call sites across 9 files**, all confirmed: `activity.schema.ts:354`, `validation.ts:129` and
`:200`, `binding-provenance.ts:154`, `activity-variables.ts:483`, `workflow-tools.ts:1548` and
`:1834`, `resource-tools.ts:682`, `workflow-loader.ts:783` and `:795`, `tests/e2e/coverage.ts:39` and
`:147`, `scripts/run-batch-benchmark.ts:191`. README:436's "nine files use it" reproduces.

The eight further loop-only walks reproduce at every cited line, and so do the three guards that add
the same limit — `check-loop-shape.ts:112`, `check-stealth-isolation.ts:176`,
`check-description-hygiene.ts:126-127` — giving eleven loop-only recursions outside the shared
traversal against the proposal's eight, which is the `src`-plus-`tests` set. The three walks that
recurse on the `steps` key regardless of kind reproduce too: `composeActivityArtifacts`
(`workflow-tools.ts:158`, `Array.isArray(s.steps)`), `check-review-mode-gating.ts:173` (`if
(s.steps)`), `activityCheckpointSteps` (`tests/e2e/walker.ts:596`).

**Verdict: KEEP, survives.** Nothing widens any of these, and README:440's conclusion is right: after
materialisation there is no compound kind left to walk. The blast-radius sentence is also right and
CV6's probe proves it: a `kind: routine` step that survived materialisation is walked as a leaf by all
eleven with no error, no missing manifest entry and no guard finding, because none of them asserts on
an unknown kind.

---

## CV9 — Half the identifier mechanism exists, and none of the half that matters

**Reproduced.** `populateStepIds` at `src/schema/activity.schema.ts:193-224`; `fillScope` at `:194`
with a per-scope `seen` set (`:196`), the unresolvable-step error (`:200-204`), the duplicate-id error
(`:207-212`) and the loop-body recursion as an independent scope (`:216-218`). Three call sites:
`src/loaders/workflow-loader.ts:94`, `:174`, `scripts/validate-activities.ts:44`. No test exercises
it.

Corpus measurements reproduce, with one convention difference:

| Measurement | Sweep | Mine |
|---|---|---|
| Steps carrying an id | 1,003 of 1,003 | **1,003 of 1,003** |
| Step ids repeated across scopes within one activity | 0 | **0** |
| Maximum loop nesting depth | 2 | **2 levels of loop** (my walk reports scope depth 3) |

The depth figure is the same fact counted from a different origin: there is a loop inside a loop and
no loop inside that, which is nesting depth 2 in the sweep's terms and scope depth 3 in mine. Not a
disagreement.

**Verdict: KEEP, down from NARROWS.** Every one of the sweep's three bullets is an addition or a
blocker, not a narrowing: `fillScope` already has the shape a routine body wants; the merged-scope
re-check does not exist and must be written; and `populateStepIds(activity: Activity)` must be widened
or worked around. That is PD7.

I confirmed the silent-collapse claim and found a second instance the sweep missed. `knownIds` is a
`Set` at `src/utils/validation.ts:128-130`, consumed at `:140` to report unexpected manifest entries —
so a collision shrinks the set and nothing complains. But `declarationIndex` at `:147` is a `Map`
keyed by id, and it is what the step-order subsequence check reads at `:150-158`; a duplicate
overwrites, so a collision also loses an order constraint. Two containers, two silences, one of them
in the check nobody would look at.

The sweep's honest note reproduces and is worth keeping: prefixing is what makes the merged scope safe
by construction, the re-check is the assertion that prefixing worked, and with zero cross-scope
repeats in the corpus it lands green on day one whether or not it is correct.

---

## CV10 — Two implementations of one rule, one implementation of a different rule

**Reproduced in part.** `parseFragmentRef` at `src/loaders/fragment-resolver.ts:38-45`;
`candidateWorkflows` at `:47-54`, **not exported**; the inline re-implementation at
`scripts/check-fragments.ts:128` is textually the same expression as `fragment-resolver.ts:50-52`.
`META_WORKFLOW_ID` is declared twice: exported at `src/loaders/fragment-resolver.ts:25` and privately
re-declared at `src/loaders/technique-loader.ts:84`. All of that holds.

**The central measurement does not.** The sweep says "The technique loader implements the same
fallback a third time, at three sites: `:156`, `:181-185`, `:308`." Read in full, the technique loader
implements a **different** rule, and the difference is exactly the one a routine reference would trip
over:

- **Workflow-versus-group is decided by a filesystem probe.** At
  `src/loaders/technique-loader.ts:136`, a leading segment is a cross-workflow prefix only if
  `existsSync(getWorkflowTechniquesDir(workflowDir, segs[0]))`. Otherwise `segs[0]` is a *group* and
  the remainder is an op path, resolved `[declaring workflow, meta]` at `:156`. `candidateWorkflows`
  has no probe: any `::` head is a workflow.
- **Depth is unbounded.** `group::subgroup::op` is ordinary (`:142`, `:159`), where
  `parseFragmentRef` throws `Malformed fragment ref` on a second separator (`:44`).
- Only the bare-name branch (`:172-187`) and the qualified-no-fallback behaviour (`:136-152`) match
  `candidateWorkflows`. The `::`-bearing bare-group branch is the majority case and it does not.

So there are **two** implementations of the fragment rule — `candidateWorkflows` and the inline copy
at `check-fragments.ts:128` — and one implementation of a richer technique rule. And the disagreement
is not theoretical: over the baseline corpus's 672 technique bindings, `parseFragmentRef` would read
360 one-separator group heads as non-existent workflows with no fallback, and throw on the 48 that
carry two separators. The rules agree on 264 bindings. That is PD3, and it undercuts README:311-316's
argument for the shared home rather than the sweep's verdict.

**Verdict: KEEP, down from NARROWS, with its central count withdrawn.** The routines construct adds a
resolution site; it narrows nothing. `candidateWorkflows` being unexported and copied once is real
duplication measured today, and the stage-5 relocation hazard the sweep names is real: the resolver a
routine needs lives in the module the fragment mechanism's retirement deletes, so a routine resolver
written on top of it at stage 3 has to be relocated at stage 5, while `check-fragments.ts`'s inline
copy disappears with the guard and the technique loader's rule stays. The two-line
export-and-reroute the sweep recommends is now a smaller win than it claims — it unifies two sites,
not four.

---

## CV11 — The shape is free, the reading is new, and nothing narrows

**Reproduced.** `TechniqueBindingSchema` at `src/schema/activity.schema.ts:63-67`:
`inputs: z.record(z.union([z.string(), z.number(), z.boolean()]))` and `outputs: z.record(z.string())`.
README:294-304 specifies `with` as the same scalar union and `outputs` as the same remap, so the
shapes are identical.

The two heuristic readings reproduce verbatim. `resolveInputSource` at
`src/utils/binding-provenance.ts:288` onward, with `TOKEN_RE` and `EXACT_TOKEN_RE` at `:275-276` and
the comment at `:312-314`: "A bare string is a rename when it names a resolvable bag entry, otherwise
a literal — statically indistinguishable, so an unmatched bare value is reported as the literal it
most likely is rather than flagged." And `readWholeName` at `src/utils/activity-variables.ts:467-470`:
"The namespace settles which it is, so the match is on the whole string and not on a head."

`grep -rln "unbraced\|braced" scripts/*.ts src/**/*.ts` returns exactly two files —
`scripts/check-set-action-values.ts` (the `unbraced-reference` rule at `:110`, `:126`) and
`src/utils/activity-variables.ts` — so the sweep's "the only place the distinction is enforced rather
than guessed is one field of one step kind" reproduces.

**Verdict: KEEP, down from NARROWS.** `TechniqueBindingSchema` is untouched by the construct; the
routine reference site borrows its shape and declares its own semantics. That is an addition. The
sweep's own text concedes it — README:296-298 says a routine reference "is a new binding site with no
legacy, so it adopts that reading from the start rather than joining the 193-site migration" — and the
code confirms there is nothing to inherit, which makes the substitution table at README:376-380 new
code. The hazard reproduces and is worth carrying: if `with` reuses the technique-binding reading
rather than the declared one, a literal argument materialises as `"{open_questions}"`, a reference to
a variable nothing writes, which is the failure README:381-383 names.

One internal inconsistency in the sweep: `resolveInputSource` is cited as `:288-319` in the candidate
body and `:288-330` in the closing survey. The function opens at `:288`.

---

## CV12 — The inversion is not total in either direction, and the prose read is unspecified

**Reproduced at every line.** The derivation reads five activity-shaped things: `activity.id` at
`:506` (passed to `readSignature`), `activity.exits[].when` at `:570-572`, `activity.rules` at `:573`,
`activity.outcome` at `:574`, `activity.triggers[].passContext` at `:576`. `namespace:
ReadonlySet<string>` is required at `:423`, and `write` at `:474-481` puts a name outside the
namespace into `produces` and `producedSoFar` and nowhere else (`:479-480`).

`readSignature` at `:348-398` collects prose `{token}`s from protocol block titles and steps
(`:362-365`), rules (`:366-368`) and artifact filename templates (`:370-372`), strips those naming the
operation's own signature (`:389`), and the derivation adds the remainder at `:520`. Materialisation
cannot reach them: they come from technique markdown, not from a step field. And the derivation reads a
body step's `technique:` name only as a reference to resolve (`:504`), never as a variable, while
materialisation must rewrite it (README:366).

So README:384-385's "The field list is exactly the set the contract derivation already walks. The
implementation is that traversal inverted" is refuted in both directions, and I confirm the sweep's
measurement of it.

**Verdict: KEEP, down from NARROWS.** The derivation's parameter object needs *widening* for a routine,
not narrowing, and the prose-read decision is a specification the design has not written. That is PD2,
and by the sweep's own assessment — "the largest unwritten specification I found on this surface" — it
belongs in the plan-defect list rather than in a code verdict.

Two corrections. The sweep says "**five** activity-only fields" and then "A routine declares none of
the **four**." Four is right and five is not: `activity.id` is not activity-only, because a routine has
a name, so the blocker is the four routing, rules, outcome and trigger fields. And the sweep quotes
README:445-447 as "with no host workflow in sight" where the text reads "with no host **activity** in
sight" — the difference matters, because a routine's guard does have a workflow scope to resolve bound
ops against and that is what `scopeWorkflowId` at `:421` supplies.

---

## CV13 — The reusable normaliser and index, verified, with the verdict answering a reuse question

**Reproduced.** `scripts/check-fragments.ts` declares nine rules (`:57-65`). `unused-fragment` at
`:239-243` with the corpus-wide reference index `usedCheckpointFragments` at `:123` keyed on
`canonicalTarget` at `:125-135`; `duplicate-checkpoint` at `:266-271` with `normalizeCheckpointBody`
at `:74-94` and `inlineCheckpointSites` at `:139`, populated at `:224-229`.

Counts reproduce: **42** `scripts/check-*.ts` files, **40** `id:` entries in `scripts/guards.ts`,
`ls scripts/ | grep -iE "repeat|routine|sequence"` empty. Running the guard against the baseline corpus
prints exactly the sweep's line: `fragments: OK — every ref resolves, every fragment is used, no
inline duplicates`.

**I re-established the absent sequence comparison by reading, not by name.** A filename grep is the
weak method the sweep itself warns against elsewhere, so I checked the candidates that could plausibly
compare runs: `check-activity-technique-overlap` compares an activity's `techniques[]` list against
its step bindings as *sets* (`:39-53`, `:68-70`); `check-fragments`' two duplicate rules index single
bodies and single rule strings (`:224-229`, `:159-165`); nothing in `scripts/` builds a key from more
than one step. The claim holds: no guard compares one step sequence against another, which is what
stage 1 adds.

**Verdict: KEEP, survives.** The analysis is right that neither rule becomes stage 1 or stage 4 by
extension — `duplicate-checkpoint` compares one body at a time and is blind to a sequence, where stage
1 needs a maximal shared-window search over consecutive steps (README:822-827) — and right that the
normaliser at `:74-94` is the reusable piece and the index-by-canonical-form pattern at `:224-229`
generalises to windows.

The verdict does answer a different question from the ladder's, though, and both of its rules move on
the ladder: by the sweep's own account stage 5 deletes seven of the nine rules with `unused-fragment`
among them, and README:882-884 keeps `duplicate-checkpoint` "with its remedy naming a routine", which
is a text change. On the ladder those two are REMOVE and DEPRECATE. What KEEP correctly captures is
that neither rule's *mechanism* is a partial implementation of what the design needs.

The scheduling hazard reproduces and is worth restating: deleting the file rather than the seven rules
takes `duplicate-checkpoint`, `duplicate-rule` and the normaliser with it.

---

## CV14 — The collision family, verified, and it only looks at fans

**Reproduced at every line.** `fan-artifact-collision` at `scripts/check-activity-variables.ts:364-409`
with the reasoning at `:364-369` verbatim. The distinct arm at `:377-393` reports two branches of one
fan whose composed signatures resolve one literal filename; the instance arm at `:395-408` reports a
fanned activity whose artifact name does not interpolate the fan's per-instance parameter. Both read
`DerivedContract.artifactNames`, declared at `src/utils/activity-variables.ts:230` and populated at
`:507` from `readSignature`'s `:381-383`. `artifactNames` has exactly two consumers, `:372` and `:399`,
both keyed on a `fan` from `fanGroups(workflow)` (`:374`, `:397`). It is a `Set` at
`src/utils/activity-variables.ts:446`, so two steps in one activity resolving one filename collapse to
one entry with nothing reported.

**Verdict: KEEP, survives.** The two questions are genuinely different, and the sweep states the
distinction crisply: this family asks "do two *contexts* resolve one filename", where README:1139-1147's
limit asks "does one *activity* reach one artifact-declaring definition twice". Nothing today checks
the second at any grain, and the data-loss argument at `:364-369` is the right precedent for the
routine limit to cite.

I add one interaction the sweep does not reach, filed as PD8: because the derivation runs on the
materialised activity, a routine's artifact names enter the host's `artifactNames`, and the instance arm
at `:395-408` then demands that each interpolate the host fan's parameter. A routine authored without
knowledge of a fanning host fails there — which lands first at stage 8, whose four reference sites
include `04-isolated-fan-out` (README:936-938).

---

## CV15 — The raw-text path, and the inflation figures reproduced to the character

**Reproduced.** `readActivityRaw` at `src/loaders/workflow-loader.ts:951-1005`: reads the original
activity file, validates it, returns the unmodified text plus its source workflow. One definition, one
caller, `src/tools/workflow-tools.ts:1396`. `scanCheckpointRefLines`: one definition, one production
caller, `:1405`. Four of 117 activity files carry a `ref:` line — the four assumption-run hosts — so
the pre-scan's fast path takes 113 of 117 off the resolution path.

**I re-ran the inflation measurement and it reproduces exactly**, character for character, running both
injectors with a real fragments lookup built from each `workflow.yaml`:

| Stage | Sweep | Mine |
|---|---|---|
| Source, four files | 30,316 | **30,316** |
| After `injectResolvedStepIds` | 30,316 (unchanged) | **30,316** (unchanged) |
| After `injectCheckpointFragmentBodies` | 38,096 | **38,096** |
| Delta | +7,780, 25.7% | **+7,780, 25.7%** |

README:470-472's 28,154 → 34,717, +6,563, 23.3% does not reproduce; the direction and order of
magnitude do, and the difference is corpus movement.

I can sharpen the sweep's correction of "the seven shared gate bodies". `work-package/workflow.yaml` is
the only file in the corpus with a `fragments:` block, and it declares **two** checkpoint bodies —
`assumption-interview` and `assumption-decision` — referenced at **eight** sites, two per host across
four hosts. So README:470 is wrong on both counts: two bodies, eight sites.

**Verdict: DEPRECATE, survives.** Stated the way the sweep states it, so it is not mis-scheduled: the
routines work neither retires nor needs to retire the raw-text path. What retires it is the runner
ceasing to deliver activity text, and CV3 records that even then the textual materialiser survives in a
guard. The construct keeps its home and its one caller while the reason it exists stops holding at a
stage this proposal does not own — which is DEPRECATE's shape with the stage named as external, exactly
as the sweep's "none — runner" stage column says.

The hazard reproduces: `responseText` at `src/tools/workflow-tools.ts:1867` is the activity body plus
four framing blocks, and the body *is* the file text.

---

## CV16 — Discovery is not two passes, and the generator's gap is real but differently shaped

**Reproduced in part.** `parseActivityFilename` at `src/loaders/filename-utils.ts:6-10` matching
`/^(\d+)-(.+)\.ya?ml$/`. The loader's discovery is prefix-gated (`src/loaders/workflow-loader.ts:80-81`)
and non-recursive (`:75`), and the numeric prefix becomes `activity.artifactPrefix` at `:95`. The
guard's discovery is a different rule: `scripts/validate-activities.ts:110` filters on
`f.endsWith('.yaml')` alone, with `findWorkflowDirs` at `:61-83` looking one level down, and it reads
`safeValidateActivity` directly at `:40`. The disagreement is invisible because every activity filename
in the corpus carries a numeric prefix — `ls */activities/*.yaml | grep -vE "/[0-9]+-"` is empty at the
baseline.

The schema side reproduces: `scripts/generate-schemas.ts:25-29` generates five schemas — workflow,
state, condition, session-file, activity — and `schemas/` holds six `.schema.json` files, the sixth
hand-authored draft-07 with its own `$id` and generated by nothing. There is no `--check` mode, and
`npm run build:schemas` (`package.json:10`) is in neither `test:ci` nor `verify.yml`. The sweep's
disagreement with [guard-obligations.md](../ground-truth/guard-obligations.md)'s "6 generated" stands;
I measure five generated plus one hand-authored.

**Two figures do not reproduce.**

`parseActivityFilename` has **five** call sites, not six: `src/loaders/workflow-loader.ts:80`, `:178`,
`:965`, `:993`, and `scripts/validate-workflow-yaml.ts:32`. The sweep enumerates exactly those five and
labels them six; the sixth is presumably the definition.

More consequentially, "The routine discovery pass is **two** passes, not one" is a serious undercount.
Fifteen `readdir` sites open an `activities/` directory, implementing four distinct rules, one of them
recursive — the table is in PD4. Two of the fifteen guards are absent from `scripts/guards.ts`
entirely. This changes the price of the stage-4 criterion at README:874-876 by an order of magnitude,
which is why it is filed as a plan defect rather than left inside the verdict.

**Verdict: KEEP, down from NARROWS.** `routines/` needs its own discovery, its own generated schema and
its own place in `get_workflow` (README:1124-1128). Every one of those is an addition; nothing existing
narrows. The sweep's second refinement — that the verifying variant "would also catch that
`technique.schema.json` is not in the generator's set at all" — is also downgraded: a `--check` written
to the criterion's own wording regenerates the five and diffs them, and stays blind to a sixth file
outside the set. Catching it needs a directory-completeness assertion, and there is a reason to want
one: `docs/technique-protocol-specification.md:9` asserts the schema is generated from its Zod source.
That is PD10.

The sweep's closing hazard needs one correction. It says a `routines/` directory "that only the loader
discovers gets no schema validation, which is the state the five `meta/activities/patterns/` files are
in today". Measured, those five files are in a *worse* state: no `workflow.yaml` in the corpus
references them (`grep -rn "patterns/" */workflow.yaml` is empty), and both discovery passes are
non-recursive, so **neither** the loader nor `check:activities` ever reads them — which is why 122
activity files exist and `npm run check:activities` reports 117. If the loader did discover a
`routines/` directory it would validate what it found (`safeValidateActivity` at
`src/loaders/workflow-loader.ts:87`); the pattern files' problem is that nothing discovers them at all.

---

## CV17 — The separator argument, verified and strengthened

**Reproduced.** `INSTANCE_SEPARATOR = '#'` at `src/loaders/workflow-loader.ts:470`, documented at
`:463-469`; `baseId` at `:473-476`, returning everything before the **first** `#` (`:474`,
`indexOf`). The checkpoint response key is hyphen-joined at `src/tools/workflow-tools.ts:2069`
(`` `${activity_id}-${checkpoint_id}` ``), with the matching prefix parse at
`src/utils/validation.ts:91-96` and the record write at `src/tools/workflow-tools.ts:2430`.

**One citation is off and one count is too small.** The checkpoint-id role of `baseId` is at
`src/utils/validation.ts:95`, not `:96`. And `baseId` has **13 call sites across 4 files**, not the two
the sweep names:

| Role | Sites |
|---|---|
| Activity, frontier and manifest ids | `workflow-loader.ts:460`, `:534`; `workflow-tools.ts:727`, `:728`, `:743`, `:899`, `:913`, `:986`, `:1396`; `validation.ts:284` |
| Checkpoint ids | `workflow-loader.ts:502`, `:503`; `validation.ts:95` |

The larger count strengthens the verdict rather than weakening it: a prefix using `#` would be
swallowed at ten activity-shaped sites and three checkpoint-shaped ones.

**Verdict: KEEP, survives.** The code carries README:544-547's argument further, exactly as the sweep
says. `#` is unavailable because `baseId` splits on the first one in both id vocabularies; `::` is the
technique-path separator (`fragment-resolver.ts:39`, `activity.schema.ts:176-178`); and the second
reason the proposal does not give holds — the response key splits on `-` over kebab-case activity and
step ids, so a `-`-joined prefix would deepen an ambiguity `key.slice(prefix.length)` already has,
while a `.`-joined one passes through intact.

The failure mode reproduces: a prefix using `#` breaks `readActivityRaw`'s file resolution and
`immediateExitCut`'s step lookup simultaneously, and both fail silently — the first returns
`ActivityNotFoundError`, the second returns `-1` at `src/utils/validation.ts:98` and the immediate-exit
cut is simply not applied.

---

## The keep list

What a confident implementer would delete by mistake while executing these stages, each with several
independent discriminators from the thing it resembles.

### `injectCheckpointFragmentBodies` and `scanCheckpointRefLines`

Resembles: a delivery-path-only transform, retired with the runner.

- **Two production call sites, not one.** `scripts/check-binding-fidelity.ts:529` is the second.
- **The second consumer never touches the loader.** It imports `parseDefinition` (`:56`), the fragment
  resolver (`:61`) and the sync fragments index (`:62`), and no loader entry point — so the object-path
  materialiser at `src/loaders/workflow-loader.ts:346` is invisible to it and the textual injector is
  the only materialisation it can see.
- **A 72-entry triage ledger depends on the view it produces.** Every suppression in
  `scripts/binding-fidelity-triage.json` was recorded against a materialised reading; blinding the
  guard makes 72 recorded judgements silently vacuous rather than failing loudly.
- **Its two consumers retire on different schedules.** Delivery goes with the runner; the guard goes
  only when it moves onto the loader, which README:1069 concedes is unscoped.

### `defaultStepId`

Resembles: the id injector's helper, dying with it.

- **Two consumers, and only one is subject-free.** `src/schema/activity.schema.ts:205` is on the load
  path and exercised by all 1,003 corpus steps' worth of activities; `:239` is the injector's.
- **A schema change must precede its removal.** `id` is optional only on `TechniqueStepSchema`
  (`:97`); `ActionStepSchema` (`:107`), `CheckpointStepSchema` (`:133`) and `LoopStepSchema` (`:154`)
  all require it, and `populateStepIds` throws for a non-technique kind without one (`:200-204`).
- **The function is what makes 672 authored ids optional.** Deleting it without requiring `id` turns
  the derivation into a load failure for any future technique step that omits one.

### `ref-opens-step` (`scripts/check-fragments.ts:175-177`)

Resembles: a rule about step ids, retired with `injectResolvedStepIds`.

- **It is not about step ids and does not mention the id injector.** It requires a checkpoint step to
  declare `id:` before `ref:` so the *fragment* injector can find a standalone `ref:` line.
- **Its reason is the fragment injector's line orientation.** `isCheckpointStep`
  (`src/loaders/fragment-resolver.ts:168-188`) walks backwards to the nearest `- ` opener at
  `fieldIndent - 2`; a step opening `- ref:` has no such opener, so the line is left unmaterialised and
  the worker receives a reference.
- **It is one of the seven rules stage 5 deletes, but only after the injector goes.** Deleting it while
  the textual injector still runs re-opens a silent delivery failure — the object path materialises the
  step and the text path does not.

### `...stepEntryCondition` on any new step member

Resembles: boilerplate every step kind carries.

- **It is the single field that disables the design's own safety net.** Verified: with it the probe
  compiles clean with an unhandled kind; without it, three TS2339 errors name the three sites that must
  change.
- **The four existing kinds are not uniform about it.** Technique, action and checkpoint carry it
  (`:101`, `:110`, `:140`); the loop kind deliberately does not, and says why (`:150-151`: "A loop
  carries no `condition`, so its entry gate is `when`").
- **The three errors are the only exhaustiveness signal the repository has.** There is no `switch` on a
  step kind and no `assertNever` anywhere, so nothing else fails when a kind goes unhandled.

### `candidateWorkflows` (`src/loaders/fragment-resolver.ts:47-54`)

Resembles: the one shared `[workflow::]name` resolver, ready to serve routines.

- **It is not the technique resolution rule.** It reads any `::` head as a workflow, which is wrong for
  360 of the corpus's 672 technique bindings, and it throws on the 48 that carry two separators
  (`:44`).
- **It is duplicated once, not twice.** `scripts/check-fragments.ts:128` is the copy; the technique
  loader implements a different rule with a filesystem probe (`src/loaders/technique-loader.ts:136`).
- **It lives in the module that the fragment mechanism's retirement deletes.** A routine resolver built
  on it at stage 3 must be relocated at stage 5.
- **`META_WORKFLOW_ID` is not one constant.** The exported one (`fragment-resolver.ts:25`) has five use
  sites outside its own file; `technique-loader.ts:84` re-declares it privately with eight more.

### `artifactNames` as a `Set` (`src/utils/activity-variables.ts:446`)

Resembles: a container to widen so the intra-activity collision check becomes possible.

- **The Set is correct for the question its two consumers ask.** Both are fan-keyed (`:372`, `:399`)
  and ask whether two *contexts* resolve one filename; deduplication within one context is the right
  behaviour for that.
- **Widening it changes nothing on its own.** No consumer counts occurrences, so a multiset would be
  discarded at both call sites until a non-fan-keyed consumer exists.
- **The routine limit is a different question at a different grain.** README:1139-1147 asks how many
  times one activity reaches one artifact-declaring definition, which is a property of the reference
  graph, not of the resolved name set.

### The five `meta/activities/patterns/` files

Resembles: dead definitions, unreferenced and unvalidated.

- **Having no referrer is the expected state of a library, and the repository says so in its own triage
  rationale.** `scripts/binding-fidelity-triage.json:5`: "Library ops are bound ad hoc by any
  workflow, so having no consumer inside the corpus is the expected state of a library, not a broken
  seam." And `:7`, on these exact files: "A borrowable pattern activity binds an op whose input the
  BORROWING workflow seeds — the contract documented in `meta/activities/patterns/README.md`.
  Producers resolve per-workflow, so the library home can never show one."
- **They are stage 8's delivery site, not dead weight.** README:936-938 names
  `01-orchestrator-workers`, `04-isolated-fan-out` and `05-lead-researcher` as three of the fan-out
  routine's four reference sites.
- **They are not invisible everywhere.** The two recursive walkers see them —
  `scripts/workflow-declarations.ts:19-25` and `scripts/check-binding-fidelity.ts:502-506`, both
  documented as including "nested library subdirectories" — so their declarations are already held to
  the binding contract.
- **Their real gap is discovery, not liveness.** Both non-recursive passes miss them, which is the
  117-versus-122 gap; that is an argument for extending discovery, not for deleting files.

### `INSTANCE_SEPARATOR` and `baseId`

Resembles: a fan-instance helper with two call sites.

- **Thirteen call sites across four files**, split across two id vocabularies with different failure
  modes: a missing activity definition (`ActivityNotFoundError`) and a step index of `-1` that silently
  skips the immediate-exit cut.
- **Both `#` and `-` are unavailable to a routine prefix**, for independent reasons: `baseId` splits on
  the first `#` in both vocabularies, and the response key is `-`-joined
  (`src/tools/workflow-tools.ts:2069`) over kebab-case ids parsed by prefix length
  (`src/utils/validation.ts:91-95`).
- **The per-iteration discriminator is the load-bearing half.** README:554-556 is right that the
  templated form (`assumption-decision#{current_assumption.id}`) has a corpus case and the two-references
  case does not, and `getCheckpoint` (`src/loaders/workflow-loader.ts:493-504`) compares on base ids in
  both directions to serve it.

## Withdrawn, recorded

No whole candidate was withdrawn. Four sub-claims were, and each stays here with its reason.

| Withdrawn claim | Candidate | Why |
|---|---|---|
| "The technique loader implements the same fallback a third time, at three sites" | CV10 | It implements a different rule: workflow-versus-group by filesystem probe (`src/loaders/technique-loader.ts:136`) and unbounded `::` depth, against a resolver that reads any `::` head as a workflow and throws on a second separator (`src/loaders/fragment-resolver.ts:41-44`). The two disagree on 408 of 672 corpus technique bindings. Two implementations of the fragment rule, one of a richer technique rule. |
| "Deleting it retires the criterion" (README:857-858) | CV1 | The criterion's obligation — an explicit prefixed `id:` on every spliced step — survives the injector's removal, because the object path fills ids and the text path must agree. `injectResolvedStepIds` never covered that hazard, matching only the `- technique:` opener form. What removal retires is the criterion's stated reason. |
| "the module asserts its own non-recursion three times" | CV4 | `grep -rn "cannot itself contain\|never recurses\|plain content" src scripts schemas` returns two sites: `src/loaders/fragment-resolver.ts:17-18` and `src/schema/workflow.schema.ts:39`. No search I could construct gives three. |
| "The routine discovery pass is two passes, not one" | CV16 | Fifteen `readdir` sites open an `activities/` directory under four distinct rules, one recursive; two of the guards involved are absent from `scripts/guards.ts`. Two understates the stage-4 obligation by an order of magnitude. See PD4. |

## Figures re-taken, and the ones that did not reproduce

Every number the sweep states, re-measured. Reproduced exactly unless the third column says otherwise.

| Figure | Sweep | This pass |
|---|---|---|
| Activity files `injectResolvedStepIds` changes | 0 of 117 | 0 of 117 |
| `- technique:` opener lines, 122 activity files | 0 | 0 |
| Technique steps with no authored id | 0 of 672 | 0 of 672 |
| Step population | 1,003 steps, 672 technique | 1,003 steps; 672 technique, 162 action, 115 checkpoint, 54 loop |
| Steps carrying an id | 1,003 of 1,003 | 1,003 of 1,003 |
| Cross-scope repeated step ids | 0 | 0 |
| Maximum loop nesting | 2 | 2 levels of loop (scope depth 3 by my origin) — convention, not disagreement |
| Step-kind comparison sites | 61 / 22 files; 34 in `src`, 27 outside | identical, per-file tally identical |
| Exhaustiveness idioms | none | none |
| `flattenActivitySteps` call sites | 13 across 9 files | 13 across 9 files |
| Loop-only recursions outside the shared traversal | 8, or 11 with guards | 8, or 11 with guards |
| Compile probe, no `condition` spread | 3 × TS2339, three named sites | identical, exit-code verified |
| Compile probe, with `condition` spread | 0 errors | 0 errors |
| Delivery inflation over four hosts | 30,316 → 38,096, +7,780, 25.7% | identical |
| Activity files carrying a `ref:` line | 4 of 117 | 4 of 117 |
| Fragment reference sites | 8 (2 per host) | 8, over **2** declared bodies |
| `check-*.ts` scripts / registry ids | 42 / 40 | 42 / 40 |
| `check-fragments` result | OK, message quoted | identical message |
| Generated JSON schemas | 5 generated, 1 hand-authored | 5 generated, 1 hand-authored |
| `binding-fidelity` triage ledger | 72 entries | 72 at `9ca71c19`, 70 at the working tree |
| `injectCheckpointFragmentBodies` test references | 4 | **3** (`:8`, `:166`, `:185`) |
| `materializeCheckpointStep` test references | 8 | **12 occurrences, 10 calls**; 8 is the `expect(() => ...)` sub-count |
| Non-recursion assertions | 3 | **2** |
| `parseActivityFilename` call sites | 6 | **5** (the sweep enumerates five) |
| Implementations of the `[workflow::]name` rule | 3, going to 4 | **2**, plus one different rule — see PD3 |
| `baseId` roles / sites | 2 roles, 2 sites cited | 2 roles, **13 sites across 4 files** |
| Activity-file discovery passes | 2 | **15 sites, 4 rules** — see PD4 |
| `check-activity-variables` hard zero, no ledger | `:25` | `:25`, verbatim |
| `validation.ts` checkpoint `baseId` site | `:96` | **`:95`** |
| `check-binding-fidelity` `parseDefinition` import | `:55` | **`:56`** |
| Extending `tsconfig` to `scripts` and `tests` | not measured | **712 errors across 65 files**; 225 in `scripts` / 33 files, 487 in `tests`; 498 TS4111 |
| Technique bindings the two resolution rules disagree on | not measured | **408 of 672** |

## How the measurements were taken

Everything below is reproducible from the baseline trees, extracted with
`git archive 9ca71c19 src scripts schemas tsconfig.json package.json`, `git archive 9ca71c19 tests`
and `git archive 2b8b7215` into a scratch directory, with the repository's `node_modules` symlinked
beside them.

**The compile probe (CV6, CV7).** `tsc --noEmit` over the extracted `src/` with the repository's own
`tsconfig.json`: clean, exit 0. A `RoutineStepSchema` added as a fifth member of `StepSchema` with
`kind: 'routine'`, a required `id`, a `routine` string, a `with` record of the `TechniqueBindingSchema`
scalar union, an `outputs` record of strings and the `stepCommonFields` spread: three TS2339 errors.
The `stepEntryCondition` spread added to the same member: zero. Separately, a second tree with
`include: ["src/**/*", "scripts/**/*", "tests/**/*"]` under the same compiler options: 712 errors,
counted by `grep -c "error TS"` and grouped by code and by path prefix.

**The delivery inflation and the injector's subject count (CV1, CV15).** A tsx script importing
`injectResolvedStepIds` from the extracted `src/schema/activity.schema.ts` and
`injectCheckpointFragmentBodies` / `resolveCheckpointFragment` / `scanCheckpointRefLines` from
`src/loaders/fragment-resolver.ts`, with the fragments lookup built from each `workflow.yaml`'s
`fragments` key through `parseDefinition`. It walks every `<wf>/activities/*.yaml`, counts the files
each injector changes, and reports source, post-id-injection and post-fragment-injection character
counts per host file.

**The step population and identifier scopes (CV1, CV9).** A `yaml.safe_load` walk of every `.yaml` and
`.yml` under `*/activities/**`, counting each node carrying a string `kind`, recursing into a
`kind: loop` node's `steps`, recording every id with its scope, and reporting ids repeated across
scopes within one file. It also counts lines matching the `- technique:` opener regex.

**The resolution-rule disagreement (CV10, PD3).** A `yaml.safe_load` walk of the same files collecting
every `step.technique` reference in bare-string and `{ name }` form, classified by how
`parseFragmentRef` would read it: zero separators, one separator whose head is a workflow directory,
one separator whose head is not, and two or more separators. Workflow directories taken as the set of
directories containing a `workflow.yaml`.

**Reference counts.** `git grep -n` at `9ca71c19` over `src scripts tests`, per symbol, with the
definition and import lines distinguished from call sites by reading each hit.

```
git grep -En "kind (===|!==|==|!=) ['\"](technique|action|checkpoint|loop)['\"]" 9ca71c19 -- src scripts tests
git grep -n  "switch (step.kind)\|switch (s.kind)\|assertNever\|: never =" 9ca71c19 -- src scripts tests
git grep -n  "flattenActivitySteps\|populateStepIds\|defaultStepId\|injectResolvedStepIds" 9ca71c19 -- src scripts tests
git grep -n  "deriveActivityContract\|artifactNames\|META_WORKFLOW_ID\|baseId(" 9ca71c19 -- src scripts
grep -rn "cannot itself contain\|never recurses\|plain content" src scripts schemas
grep -rn "readdirSync(adir)\|readdirSync(activitiesDir)" scripts/*.ts
grep -c  "    id: '" scripts/guards.ts ; ls scripts/check-*.ts | wc -l
grep -rn "technique\.schema\.json" src scripts tests package.json site docs .github
```
