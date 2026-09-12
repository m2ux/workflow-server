# The session record, and what a materialised routine does to a run already in flight

> Item 11b of the routines remediation · measured at server `792f2cc5`, corpus `a4a5d88b`
> Subject: the [routines proposal](../../2026-09-03-routines/README.md), against the surface the
> [completeness pass](../../2026-09-10-routines-sweeps/verification/completeness.md) recorded as
> reached by nothing

The proposal describes a construct that materialises a shared run of steps into a host activity and
prefixes every identifier inside it. What the server keeps on disk about a run in progress is a
single JSON file per planning folder, and several of the things that file remembers are remembered
**by name** — the name of a gate that was answered, the name of a step whose technique was fetched,
the name of a variable a step wrote. Renaming those names in the definitions does not rename them in
the file. This document measures what the file holds, who writes each part and who reads it back,
and then says for each part what a run that is mid-flight when the definitions change actually does.

The completeness pass named two identifier populations. One of them, the composed checkpoint key,
the proposal addresses and accepts. The other, the positional step index, turns out to be inert for a
reason sharper than "no writer" — and in its place there is a **third** population, name-keyed step
identity, which is live, which is read back against the current definitions, and which nothing in
either planning folder mentions.

**The headline.** Orphaned checkpoint responses staying as dead data is the consequence the proposal
accepts, and the repository already contains fifteen such orphans from an earlier definition change,
so that acceptance is supported by evidence rather than only by argument. But two consequences of a
different class sit beside it. A session suspended at a gate inside a converted body cannot be
answered at all — the two tools that could clear it both refuse, so the run has no legal next move
and no test covers the path. And the session-against-definition guard turns **12 findings into 15**
on a session record nobody touched, purely because the conversion removes the write declarations the
run satisfied; that is measured below, twice, with the command to re-take it.

---

## One. There are two session schemas, and the server writes only one of them

`src/schema/session.schema.ts` (338 lines) declares `SessionFile`, the shape of `session.json`.
`src/schema/state.schema.ts` (231 lines) declares `WorkflowState`. The second is not a second
version of the first — it is a separate shape that the server never persists.

`SessionFile` is what the load path parses. `loadSessionForTool` verifies the seal and then calls
`safeValidateSessionFile` (`src/utils/session/resolver.ts:241-242`); the legacy converter validates
against the same function before writing (`src/utils/session/migration.ts:333`); `get_resource`'s
session peek uses it twice (`src/tools/resource-tools.ts:234`, `:257`). `WorkflowState`'s own
entry points have no callers: `createInitialState` (`src/schema/state.schema.ts:212-221`) and
`validateState` (`:223`) are reached only through the barrel re-export at `src/index.ts:7`. What
`state.schema.ts` does supply is the two schemas `session.schema.ts` imports —
`HistoryEntrySchema` and `CheckpointResponseSchema` (`src/schema/session.schema.ts:2-7`) — and one
generated artifact: `scripts/generate-schemas.ts:26` writes `schemas/state.schema.json`, which
`src/resources/schema-resources.ts:10` serves to agents as "State schema — runtime execution
progress tracking".

This matters for the positional-step question, and it is the discriminator the completeness pass
reached for and did not quite land. `currentStep`, `completedSteps`, `activeLoops`, `parentWorkflow`
and `lastError` are fields of `WorkflowState` (`state.schema.ts:163`, `:165`, `:167`, `:171`, `:173`)
and **are not fields of `SessionFile` at all**. So it is not that the live record carries unwritten
positional fields; it is that the schema declaring them is not the record. They nonetheless reach
agents, because `schemas/state.schema.json` publishes `currentStep`, `completedSteps` and
`activeLoops` (lines 36, 47 and 92 of that file) as the runtime progress model.

The one producer of those fields anywhere writes the **legacy** envelope, not the live record:
`scripts/generate-session-token.ts:167-199` builds a `state` literal carrying `completedSteps: {}`
and `activeLoops: []` and writes it to `workflow-state.json` (`:109`, `:202`) — which is the input
`migration.ts` consumes and deletes. `buildSessionFromLegacy` carries over variables,
completedActivities, checkpointResponses, startedAt, currentTechnique and exit
(`src/utils/session/migration.ts:203-249`) and never looks at `completedSteps` or `activeLoops`.

Measured across the repository's own live records — 78 `session.json` files, 151 `SessionFile`
records once embedded children are counted — the four positional history event types and the loop
state are empty: **zero** `loop_started`, `loop_iteration`, `loop_completed`, `loop_break`,
`decision_reached` or `decision_branch_taken` events in 151 records. That is a stronger reading of
the same fact than a grep for writers, because it is the corpus of records rather than the code.

**Verdict on the positional step index: KEEP, and the reason is not the one recorded.** A routine
changes nothing here, and it cannot, because the fields belong to a record shape nothing writes. Two
consequences follow for the plan. Deleting them would be correct and is out of scope. Leaving them is
also correct — but `schemas/state.schema.json` then keeps telling agents that runtime progress is
tracked positionally, which is a statement about a routine-relevant surface that a routines change
does not falsify and that is already false today.

---

## Two. Every field of the live record, and what a routine does to it

Key shapes below are the literal composition in the code. "Changed by a routine" asks only whether
materialisation as the proposal specifies it — step and gate identifiers prefixed with the reference
step id and a full stop (README:537-542), internals renamed with the host activity and reference site
underscore-joined (README:194-198) — alters the string the field holds or is keyed on.

| Field | Key / value shape | Written by | Read back by | Changed by a routine | What a run in flight does |
|---|---|---|---|---|---|
| `sessionIndex` `session.schema.ts:74` | 6-char base32 of the folder path | `derivation.ts` at create | `resolveSessionLocation` `store.ts:596`, `:619`, `:573` | No | — |
| `workflowId` `:77` | workflow id | create / migrate | `loadWorkflow` at every tool | No | — |
| `workflowVersion` `:78` | semver | create / migrate | `validateWorkflowVersion` `validation.ts:60-65` | No | **The only existing drift signal.** A conversion that bumps the workflow version makes every subsequent call carry "Workflow version drift: session started with vX but current definition is vY". Warn-only, and it names no identifier |
| `frontier[]` `:106` | `<activityId>` or `<activityId>#<instance>` | `next_activity` `workflow-tools.ts:1144`, resource-tools | `baseId` fan resolution `workflow-tools.ts:727-754` | No — a routine is never a transition destination (README:746-747) | — |
| `currentTechnique` `:107` | technique id | tool calls | projections | No | — |
| `exit` `:109` | exit id | `next_activity` `:1145` | `getExitBindings` | No — exits stay on the host activity | — |
| `activeCheckpoint.checkpointId` `:42-62`, `:112` | gate id, possibly `<base>#<instance>` | `yield_checkpoint` `:2124` | `getCheckpoint` at `present_checkpoint` `:2285` and `respond_checkpoint` `:2353` | **Yes** | **The run wedges.** See §3 |
| `activeCheckpoint.activityId` | activity id | `:2124` | same | No | — |
| `variables` `:115` | flat bag, keyed on variable name | `applyVariableWrites` `variable-seed.ts:112` | every gate message, every technique binding | **Yes, for internals** | The old bare name stays in the bag holding the last value written; the routine writes a new prefixed name, or by the proposal's own rule writes nothing to the bag at all (README:198). Nothing reads the stale entry, because an internal by definition has no cross-activity consumer |
| `completedActivities[]` `:118` | activity ids | `next_activity` | `projectActivities`, `check-session-contract.ts:119` | No | — |
| `checkpointResponses` `:120-124` | **`<activityId>-<checkpointId>`** composed at `workflow-tools.ts:2417`, probed at `:2069` | `respond_checkpoint` `:2437` | replay probe `:2077`, `projectCheckpoints` `:236-246`, `resume_checkpoint` `:2240-2250`, `immediateExitCut` `validation.ts:91-96` | **Yes** | Recorded answers orphan; the gate is asked again. Accepted at README:1133-1135. Measured: 10 keys at the eight sites stage 5 renames |
| `history[].activity` `state.schema.ts:84` | activity id | all event writers | `validateTechniqueFetches` `validation.ts:207`, `:217`; `check-session-contract.ts:102` | No | — |
| `history[].step` `state.schema.ts:85` | `StepIndex` = int ≥ 1 | **nothing** | nothing | n/a | Inert. 151 records, no occurrence |
| `history[].checkpoint` `:86` | gate id | `:2094`, `:2134`, `:2442` | `projectHistory` `:303` only — echoed, never joined to a definition | **Yes** | The log carries two spellings for one gate. Legible degradation |
| `history[].decision` `:87`, `history[].loop` `:88` | ids | **nothing** | nothing | n/a | Inert. Zero `decision_*` and `loop_*` events in 151 records |
| `history[].data.stepId` (unconstrained, `state.schema.ts:89`) | **step id** | `technique_fetched` `resource-tools.ts:763`, `technique_bundled` `workflow-tools.ts:1910`, `step_started` `step-events.ts:23`, `step_completed` `workflow-tools.ts:1122` | `validateTechniqueFetches` `validation.ts:220`, `:226`; `appendStepStartedIfAbsent` `step-events.ts:15` | **Yes** | See §5. 5,536 events carry it; 460 name a step inside the runs stages 5 and 6 convert |
| `history[].data.name` (`variable_set`) | variable name | `variable-seed.ts:113-127` | **`check-session-contract.ts:99-115`** | **Yes, for internals** | See §4. The guard re-judges the record against the post-conversion contract |
| `status` `:135` | enum | `next_activity` | `get_workflow_status` | No | — |
| `triggeredWorkflows[].triggeredFrom.stepIndex` `:250` | int ≥ 1 | **nothing** — both writers omit it (`resource-tools.ts:552`, `:601`) | nothing | n/a | Inert |
| `planningFolderPath` `:156`, `repo` `:164`, `contextMode` `:175` | paths / ids | `start_session` | resolution, presentation | No | — |
| `deliveredContent` `:188` | `agentId → <channel>:<id-or-hash> → content hash` | `get_activity` `:1473`, `:1487`, `:1616`; `get_technique`; `get_resource` | `deliveredHash` on every delivery | Keys no; **hashes yes** | See §6. 6,107 entries, 3,257 of them under `technique:` |
| `declaredArtifacts[].id` `:195-199` | agent-reported artifact id | `next_activity` `:1130-1141` | reconciliation `:1225` | No — ids come from the worker's report, not the definition | — |

Two structural facts complete the picture, and both cut the other way from the risk above.

**`store.ts` is entirely identifier-blind.** Across 896 lines it reads exactly two things out of a
session record: `sessionIndex` (`:573`, `:596`, `:619`) and `triggeredWorkflows[i].state` (`:563-579`).
It canonicalises with a fixed top-level key order (`:113-133`), HMAC-seals the bytes and swaps both
files into place. No gate id, step id or variable name is load-bearing anywhere in it. A rename
inside the record is invisible to the store, and every ordinary server write re-seals, so the seal is
not a hazard on the happy path.

**The seal is a hazard on every other path.** `verifySeal` refuses any record whose bytes do not hash
to the stored seal, with `session.json has been modified outside the server`
(`store.ts:494-500`), and `loadSessionForTool` calls it before parsing (`resolver.ts:241`). So any
out-of-band rewrite of keys — a hand edit, a sed script, an offline remapper — converts a recoverable
orphan into an unloadable session. A remapper has to write through `writeSessionFile`
(`store.ts:422-427`) or `replaceSessionFile` (`:438-444`), which means holding the server key from
`getOrCreateServerKey` (`src/utils/session/crypto.ts:43`, reading `<state-dir>/secret`).

---

## Three. The consequence the proposal has not noticed: a suspended gate that cannot be answered

`activeCheckpoint` holds the gate a worker yielded on and is waiting for the orchestrator to resolve
(`session.schema.ts:36-62`). Both tools that read it look the gate's definition up by the recorded
id and **throw when it is absent**:

- `present_checkpoint` — `getCheckpoint(result.value, active.activityId, active.checkpointId)` then
  `if (!checkpoint) throw new Error('Checkpoint not found: …')` (`workflow-tools.ts:2285-2286`).
- `respond_checkpoint` — the same lookup at `:2353`, then
  `if (!checkpoint) throw new Error('Checkpoint definition not found: …')` at `:2354`. The throw
  precedes the mode branch, so `option_id`, `auto_advance` and `condition_not_met` all hit it.

The lookup cannot be satisfied by a renamed gate. `getCheckpoint` tries an exact id match, then
compares base ids — the segment before the first `#` (`workflow-loader.ts:473-476`, `:500-503`). A
recorded `implementation-assumption-interview` and a materialised
`reconcile-assumptions.batch-gate` agree on neither.

The two ways out are both closed. `next_activity` is the only other writer that clears
`activeCheckpoint` (`:1146`), and it refuses to run while one is set: *"Cannot transition to …:
Active checkpoint '…' on activity '…'. The orchestrator must resolve it by calling
respond_checkpoint"* (`:962-966`). `yield_checkpoint` refuses to yield a second gate (`:2012-2013`)
and `resume_checkpoint` refuses to continue (`:2227-2228`). So the run has no legal next move: the
tool that must clear the field cannot find the definition, and the tool that could clear it as a side
effect insists the first one runs. `get_workflow_status` reports the session `blocked`
(`:2581-2583`) and `inspect_session` still reads it, so the state is observable — and unadvanceable.

**Measured incidence today: zero of eight.** Eight of the 151 records carry an `activeCheckpoint`.
None is at a gate stage 5 renames:

| Records | Workflow | Activity | Gate |
|---|---|---|---|
| 6 | `meta` | `end-workflow` | `completion-confirmed` |
| 1 | `work-package` | `plan-prepare` | `approach-confirmed` |
| 1 | `workflow-authoring` | `scope-and-draft` | `scope-confirmed#0` |

So this is a latent hazard, not an observed fault, and the record should say so. But the window is
not hypothetical: it is the interval between a worker yielding and a human answering, eight records
are sitting in it right now, and the corpus of records holds 644 `checkpoint_reached` events. The
second row is the near miss worth naming — `plan-prepare` is an activity stage 6 converts, and
`approach-confirmed` survives only because it sits outside the `assumption-convergence` loop the
conversion touches (`work-package/activities/06-plan-prepare.yaml:115-146`, `:160-161`).

Neither this path nor the tree's one existing record-refusal has a test:
`grep -rn "Checkpoint definition not found\|Checkpoint not found\|predates the frontier" tests/`
returns nothing.

**This is not the same class of consequence as an orphaned response.** An orphaned response costs a
question asked twice. A suspended gate whose definition has been renamed costs the run, and the
recovery is to hand-edit the record — which breaks the seal — or to start again. The proposal's
"accepted and stated" covers the first and says nothing about the second.

---

## Four. The guard that turns red on a record nobody touched

`scripts/check-session-contract.ts` asks whether a run stayed inside the contracts the definitions
declare. It builds the declared writes per activity from the **current** corpus
(`:86-89`), walks the record's `variable_set` events, and reports `undeclared-write` for any name the
activity that wrote it does not declare (`:97-115`). Its own header invites being pointed at real
records: *"Point it at any session: a smoke run's, an end-to-end walk's, or a real one"* (`:23-24`).

Stage 6 removes write declarations. The proposal states it as a subtraction: *"`challenge_findings`
is a declared activity-level write at six sites today, so applying this rule removes six declarations
rather than adding any"* (README:207-208). Measured at the corpus, it is **seven**, which is the
figure the sweep folder's own verification already corrected:

```
workflows/work-package/activities/02-design-philosophy.yaml:23
workflows/work-package/activities/04-research.yaml:29
workflows/work-package/activities/05-implementation-analysis.yaml:31
workflows/work-package/activities/06-plan-prepare.yaml:34
workflows/work-package/activities/07-assumptions-review.yaml:34
workflows/work-package/activities/08-implement.yaml:32
workflows/work-package/activities/15-codebase-comprehension.yaml:22
```

Run against one real record — the `work-package` child embedded in
`.engineering/artifacts/planning/2026-09-09-parallel-activities/session.json`, 495 history
events — the guard reports:

```
session-contract: 114 write(s) measured against a contract
session-contract: 12 violation(s)
```

Copy the corpus, remove those seven declarations and nothing else, and re-run the same guard against
the same unchanged record:

```
declarations removed: 7 across 7 files
session-contract: 114 write(s) measured against a contract
session-contract: 15 violation(s)
    the run wrote 'challenge_findings' … which declares no such write (source variables_changed)   [codebase-comprehension]
    the run wrote 'challenge_findings' … which declares no such write (source variables_changed)   [design-philosophy]
    the run wrote 'challenge_findings' … which declares no such write (source yield_checkpoint)    [research]
```

Twelve findings become fifteen. The run did nothing wrong; it wrote a name the activity declared at
the time, and the conversion withdrew the declaration. The guard's own finding text offers the reader
two readings — *"either the contract is short of what the activity really produces, or the run
produced what the definition never sanctioned"* (`:111-113`) — and neither is what happened. A third
reading is needed and the guard cannot supply it, because a record carries no definition revision.

Scope of the exposure, measured over all 151 records: 2,388 `variable_set` events, of which 92 name a
variable the conversion reclassifies —

| Name | events | records holding it in the bag |
|---|---|---|
| `has_open_assumptions` | 24 | 35 |
| `has_resolvable_assumptions` | 22 | 19 |
| `open_assumptions` | 22 | 7 |
| `assumptions_log` | 21 | 8 |
| `challenge_findings` | 3 | 1 |

Only `challenge_findings` loses its declaration outright, which is why the delta is three and not
ninety-two: the signature injects `assumptions_log` and `has_resolvable_assumptions` as declared
writes at the six assumptions sites (README:1100-1111), so those keep a declaration, and
`open_assumptions` / `has_open_assumptions` are the fold technique's over-declaration the proposal
already records. So the finding is small in volume and exact in mechanism, and the mechanism is what
generalises: **any stage that withdraws a write declaration re-judges every historical record that
satisfied it.** Stages 5 and 6 both do.

One more thing the guard cannot see, and it is the larger half. `readSession` parses the top-level
file and `checkSession` takes it whole (`:155-162`, `:67-71`); neither descends into
`triggeredWorkflows[i].state`. Of 151 records, **73 are embedded** and therefore unreachable by
pointing the guard at the canonical `session.json` path. Pointed at the file above it reports 15
writes measured and 1 finding; pointed at the child extracted from that same file it reports 114 and
12. The work-package run is the child.

---

## Five. The step identity that is live, and the one the record was said to have

The completeness pass looked for positional step keys and found them inert. The population it did
not look for is the name-keyed one, and it sits in the same field the schema leaves unconstrained:
`history[].data` is `z.record(z.unknown())` (`state.schema.ts:89`), and four event writers put a step
**id** in it.

Measured over 151 records: **5,536** history events carry `data.stepId` — 2,417 `technique_bundled`,
1,178 `step_completed`, 1,003 `step_started`, 938 of the 954 `technique_fetched`. Of those, **460**
name a step inside the runs stages 5 and 6 convert:

| Step id | events | Stage |
|---|---|---|
| `collect-assumptions` | 140 | 5 |
| `update-assumptions-log` | 125 | 5 |
| `reconcile-assumptions` | 67 | 6 |
| `present-resolved-assumptions` | 56 | 5 |
| `create-assumptions-log` | 29 | 5 |
| `present-assumption` | 15 | 5 |
| `challenge-assumptions` | 9 | 6 |
| `combine-assumption-challenges` | 9 | 6 |
| `record-response` | 6 | 5 |
| `record-batch-response` | 3 | 5 |
| `assumption-interview` | 1 | 5 |

There is a third spelling as well, in exactly one record: an `action_logged` event carrying
`data.step: "announce-completion"` — a step name under `step` rather than `stepId`
(`.engineering/artifacts/planning/2026-06-30-review-mode-harden-config-defects/session.json`).

Two readers join these ids back to the current definitions.

**`validateTechniqueFetches`** (`validation.ts:184-237`) warns when a manifested technique step has
no recorded delivery in the current visit. It collects `data.stepId` into `fetchedStepIds` (`:220`)
and credits a step whose id is in that set (`:226`). After a rename the pre-migration events name
unprefixed ids and the definition names prefixed ones, so the step-keyed credit misses. **The
exposure narrows to nothing measurable, and the reason is worth recording as the discriminator:** the
same loop also collects `data.techniqueId` (`:221`) and credits any step whose binding resolves to a
fetched technique id (`:228`), and materialisation does not rename techniques. Measured over 151
records, **0 of 3,355** step-bound `technique_fetched` and `technique_bundled` events lack a
`techniqueId`. So every event that would lose its step-keyed credit keeps its technique-keyed one.
Verdict: KEEP, on a fallback nobody named.

**`appendStepStartedIfAbsent`** (`step-events.ts:7-25`) is idempotent on the triple
(activity, `data.stepId`, `agentId`) (`:12-17`). A step whose id has been prefixed does not match the
`step_started` already recorded for it, so a second event is appended for the same step. One extra
row in a 1,003-row population, affecting nothing that reads it.

**`immediateExitCut`** (`validation.ts:80-99`) is the one place a recorded key is parsed back into a
definition lookup: it strips the `<activityId>-` prefix and resolves the remainder as a step id via
`topLevelStepIndex` (`:91-96`, `activity.schema.ts:340-345`). A pre-migration response at a renamed
gate would resolve to -1, the cut would be lost, and `validateStepManifest` would then require the
full step list instead of the truncated one (`:116-117`). **Measured, this cannot fire.** The
mechanism needs a gate that selects an `immediate: true` exit and is inside a converted body. The
corpus has 20 `immediate: true` exits across 16 files; none of the four stage-5 host activities
(`research`, `assumptions-review`, `implement`, `implementation-analysis`) declares one; and at the
two stage-6 sites that do — `02-design-philosophy.yaml:258-259` and `06-plan-prepare.yaml:182-183` —
the selecting gate (`classification-confirmed`, `approach-confirmed`) is outside the
`assumption-convergence` loop. Verdict: KEEP, with a discriminator that has to be re-checked if a
later stage converts a run containing an immediate-exit gate.

---

## Six. The delivery ledger keeps its keys and loses its hashes

`deliveredContent` maps an agent scope to a content key to the hash of the content last delivered in
full (`session.schema.ts:177-188`). Measured over 151 records: **6,107 entries** — 3,257 under
`technique:`, 1,755 under `bundle:`, 927 under `resource:`, 166 under `activity_rules:`, 2 under
`workflow_bundle:`. **No channel is keyed on a step id**, so materialisation moves no key.

It moves the hashes. The eager step-technique bundle ledgers under `technique:<techniqueId>`
(`workflow-tools.ts:1616`) and hashes the composed body *after* provenance decoration
(`:1608`, `:1614`, `:1617`). The decoration writes a `source:` line per input
(`binding-provenance.ts:366-372`, `:398-399`), and those lines name the producing step:
`producerText` renders `'<stepId>' (activity '<activityId>')` (`:243-252`). Prefixing a producer step
changes the note, changes the body, changes the hash — under an unchanged key. A session in
`contextMode: 'persistent'` therefore receives a **full re-delivery** of content it already holds,
once per affected technique per agent scope.

The proposal's delivery-budget section says the bundled-character change is *"measured before ruled
on"* (README:1149-1154) and attributes the change to the step count. This is a second and independent
reason the baseline moves, and it applies to techniques outside the routine body as well — any
technique whose inputs resolve to a producer inside one. The re-record the proposal already schedules
covers it; the attribution needs a sentence.

---

## Seven. Testing the proposal's argument against a key-mapping table

README:1135-1137 declines a mapping on one ground: *"A definition change is a definition change, and
a key-mapping table would be permanent server cruft for a one-off rename."* The completeness pass
put the counter-example as: the tree already carries one, at
`src/utils/session/migration.ts:219-238`. **Read at the tree, that is not what that code is, and the
argument fails for three better reasons.**

### It is a value normaliser, not a key mapper

The block converts the *value* shape. A legacy `checkpointResponses` entry may be a bare option-id
string; the loop wraps it as `{ optionId, respondedAt }` so the record validates, keeps an entry that
is already object-shaped, and drops anything else (`:226-238`). The key is written through
**verbatim** — `normalisedResponses[key] = …`. There is no prefixing branch and no activity lookup:
`heldActivityId` is computed once at `:182` and used at exactly one place, the `frontier` assignment
at `:243`.

So the module's own comment misdescribes it. *"key prefixing is best-effort (we use the legacy key
verbatim when activity is unknown)"* (`:222-223`) implies a branch that prefixes when the activity
*is* known. No such branch exists. This is a live stale statement in the file, of the
`AP-129 stale-restatement-after-change` class the sweep folder is already acting on, and it is the
reason a reader looking for a mapping table finds one.

Worse, the code's actual output is a set of **permanently unresolvable keys**, and the repository
ships the fixture that proves it. `tests/fixtures/legacy-session/workflow-state.json:1` carries
`"checkpointResponses":{"pr-creation":"proceed","classification-confirmed":"confirmed"}` — bare
checkpoint ids with no activity segment. The converter normalises both values and emits both keys
unchanged. The live probe is `state.checkpointResponses?.[`${activity_id}-${checkpoint_id}`]`
(`workflow-tools.ts:2069`, composed at `:2417`), so `classification-confirmed` can never match
`design-philosophy-classification-confirmed`. The mechanism offered as precedent for mapping keys
manufactures the exact outcome the proposal says it is accepting. None of the 16 tests in
`tests/migration.test.ts` (230 lines) asserts anything about those keys; the fixture test checks
`workflowId`, `workflowVersion`, one variable and one completed activity (`:51-66`).

### It cannot reach a session the routines migration would touch

`migratePlanningFolder` short-circuits when `session.json` exists (`:281-283`), converts
`workflow-state.json` one way, and deletes the envelope on success (`:348`). Every session the
routines migration crosses already has a `session.json`. The repository states this discriminator in
its own words, in a doc comment written for a different purpose: *"The legacy converter never reaches
one: it converts a folder holding no session file, and a pre-frontier record is a session file"*
(`src/utils/session/resolver.ts:262-263`).

It is also the wrong fidelity even if it could run. It drops history entirely, by design
(`:167-168`, `:204`), which is the whole `data.stepId` and `variable_set` population; and it
reconstructs from `createInitialSessionFile`, so `activeCheckpoint`, `deliveredContent`,
`declaredArtifacts`, `triggeredWorkflows`, `contextMode`, `repo`, `planningFolderPath`, `status` and
`seq` do not survive.

**Verdict: wrong shape.** Not "needs extending" — wrong trigger, wrong target, wrong fidelity, three
independent ways.

### The tree's real precedent for a moved session identifier is a refusal, and it costs 14 lines

The last time an identifier population moved in the live record, the answer was neither a mapping
table nor silence. `currentActivity` (a scalar) became `frontier` (a list), and
`assertNotPreFrontier` (`src/utils/session/resolver.ts:257-278`, **14 lines**) refuses such a record
by name, with the diagnosis and the remedy in the message: *"session.json in … predates the frontier:
it records one current activity ('…') where the run's position is now the list of activities in
flight. Such a record has no position to resume from — reading it would look like a session that has
not started, and the next transition would retire nothing. Start a fresh session."* Its doc comment
states the hazard as an invariant: a non-strict object strips the field it no longer knows, the
default fills in, and the result is indistinguishable from a session's first call.

The same shape recurs a second time. Two of the 78 records are already **refused** outright, because
they carry history event types the enum does not hold:

```
REFUSED 2026-06-30-review-mode-harden-config-defects/session.json  history.19.type: … received 'action_logged'
REFUSED 2026-06-07-issue-128/session.json                          history.18.type: … received 'log'
```

`loadSessionForTool` maps that to `SessionStoreError(SEAL_MISMATCH)` with the issue list
(`resolver.ts:243-249`). So the repository's settled practice on a record it can no longer interpret
is to say so loudly and stop — twice, in two different mechanisms.

That also corrects the proposal's one statement about this surface. `investigation.md:365-367` is the
only place in the thirteen records of the design folder that reaches the session schema, and it says:
*"Unknown fields still disappear from a session without complaint … Routines add no session state of
its own, so this is not made worse."* True for unknown object fields; false for the enum, which
refuses rather than erasing. And both halves miss the case that matters, because a rename adds no
field and removes none — it leaves the field set intact and makes the lookups miss.

### What to do instead

The proposal is right that a permanent table is the wrong answer, and right that a definition change
is a definition change. What the measurement changes is the scope of "accepted and stated": the
statement lives in a planning document, and the server says nothing at all. Three things follow, in
increasing cost.

1. **A refusal for the suspended gate, on the `assertNotPreFrontier` pattern.** When
   `activeCheckpoint` names a gate the current definition does not hold, throw a diagnosis that names
   the gate, the activity and the fact that the definition changed under the run — rather than
   `Checkpoint definition not found`, which reads as a corpus bug. Roughly the 14 lines of the
   existing precedent, at `present_checkpoint:2286` and `respond_checkpoint:2354`, and the two are a
   shared helper. This is the only item that turns a wedged run into a legible one.
2. **A revision stamp on the record, or a cheaper reading of the version field.** `workflowVersion`
   is already pinned and already compared (`validation.ts:60-65`); the conversion bumping the
   workflow version is what makes every stale-key miss attributable. Free if the stages bump, and the
   plan should say they do.
3. **A one-shot remapper as a script, not a server path.** If the ten measured orphan keys and the
   three withdrawn declarations are judged worth carrying, the shape is a `scripts/` tool that reads
   the record, rewrites keys, and re-seals through `replaceSessionFile` — deleted when the stages
   land. That is not permanent cruft, and it is the only form that can reach a record the legacy
   converter is defined never to touch.

---

## Eight. What the proposal accepts knowingly, and what it has not noticed

Stated plainly, because the two are being conflated.

**Accepted, stated, and supported by evidence the proposal does not cite.** Orphaned checkpoint
responses. README:1130-1137 says the answer is asked again and the old entry stays as dead data. The
repository already contains the experiment. Of 648 composed keys across 151 records, **15** are
`requirements-refinement-assumption-decision` and its per-item variants, at an activity/gate pair the
corpus no longer holds: the activity `requirements-refinement` exists in `workflow-design`
(`workflow-design/activities/03-requirements-refinement.yaml:1`) and declares `design-context` and
`spec-confirmed` only, no `assumption-decision`. Fifteen response keys have been orphaned by an
earlier definition change, absorbed with no mapping table, no diagnosis and no observed harm. Stage 5
adds **10 more** at the eight ref-form sites it renames:

| Activity | Gate | Keys |
|---|---|---|
| `research` | `research-assumption-interview` | 4 |
| `assumptions-review` | `assumption-decision` | 2 |
| `implementation-analysis` | `analysis-assumption-interview` | 2 |
| `assumptions-review` | `residual-assumption-batch` | 1 |
| `research` | `research-assumption-decision` | 1 |
| `implement` | either gate | 0 |
| `implementation-analysis` | `analysis-assumption-decision` | 0 |

Ten orphans on top of fifteen already carried. The acceptance is sound, and the plan can now say so
with a number instead of an argument.

**Not noticed, and not the same class.**

- **A gate suspended inside a converted body leaves the run with no legal move** (§3). Not dead data
  — a dead run. Two tools throw, the third refuses, the recovery breaks the seal, and no test covers
  it. Latent at zero of eight records today; one of the eight is one step position outside the blast
  radius.
- **Withdrawing a write declaration re-judges every historical record that satisfied it** (§4).
  Twelve findings to fifteen, measured on one unchanged record, from removing seven declarations. The
  guard's two offered readings are both wrong and it has no third.
- **The step identity that materialisation moves is a name in `data.stepId`, not a position** (§5).
  460 of 5,536 events name a step inside the converted runs. The consequences turn out to be
  survivable — and only because of a technique-id fallback (`validation.ts:228`) and an
  immediate-exit population that misses the blast radius by measurement, neither of which anyone
  had checked.
- **The delivery baseline moves for a second reason** (§6): provenance notes embed producer step ids,
  so 3,257 `technique:` ledger hashes change under unchanged keys.

**Correct as stated, for a reason the record should carry.** The positional step keys change nothing,
because the schema that declares them is not the record the server writes (§1) — a stronger
discriminator than "no writer", and the one that keeps a confident implementer from deleting the
fields and then wondering why `schemas/state.schema.json` still describes them.

**A precedent that is narrower than it looks.** Stage 0 re-keyed 19 loops (README:768) and crossed
with no session migration and no recorded incident. That is not evidence that identifier renames are
safe in the record; it is evidence that the *loop* vocabulary is unwritten. Zero `loop_started`,
`loop_iteration`, `loop_completed` or `loop_break` events exist in 151 records, and `activeLoops` is
a field of the schema the server does not write. Stage 5 and stage 6 rename populations with 648 and
5,536 live occurrences respectively.

---

## Nine. Stale statements in the three files, due today and not caused by routines

Four, all in the `AP-129 stale-restatement-after-change` class, all inside the 1,648 lines this
document covers, and all cheap.

1. `src/utils/session/migration.ts:222-223` — *"key prefixing is best-effort (we use the legacy key
   verbatim when activity is unknown)"*. There is no prefixing branch; the key is always verbatim.
   This is the statement that made a value normaliser look like a key mapper.
2. `src/schema/session.schema.ts:36-41` — *"all authenticated tools (except `respond_checkpoint`) are
   gated until the orchestrator resolves the checkpoint"*. Two tools check `activeCheckpoint` and
   refuse: `next_activity` (`workflow-tools.ts:962-966`) and `yield_checkpoint` (`:2012-2013`), plus
   `resume_checkpoint` (`:2227-2228`). `get_activity`, `get_technique`, `get_resource`,
   `record_usage`, `inspect_session` and `get_trace` do not. Grepping `activeCheckpoint` across `src/`
   returns 24 sites across four files — 18 in `workflow-tools.ts`, 3 in `session/params.ts`, 2 in the
   schema, 1 in `session/store.ts` — and no central gate.
3. `src/resources/schema-resources.ts:10` — `state` is served as *"State schema — runtime execution
   progress tracking"*. It is not the record the server writes, and the three fields a reader would
   take as the progress model (`currentStep`, `completedSteps`, `activeLoops`) have no writer. The
   live record's schema is generated separately as `schemas/session-file.schema.json` and is not
   registered as an MCP resource at all.
4. `src/schema/state.schema.ts:94` — `// Key format: "activityId-checkpointId" (e.g., "review-approve")`.
   The composition is right and the example is ambiguous in the one way that matters: `review-approve`
   reads as a single hyphenated token, and the parse at `validation.ts:91-96` depends on knowing where
   the activity segment ends. Worth an example whose two halves are visibly two.

---

## Ten. Commands that re-take every figure

Line counts and the sweep-coverage claim:

```
wc -l src/schema/session.schema.ts src/schema/state.schema.ts \
      src/utils/session/migration.ts src/utils/session/store.ts
grep -rc "session.schema\|session/store\|session/migration" \
      .engineering/artifacts/planning/2026-09-10-routines-sweeps/ \
      .engineering/artifacts/planning/2026-09-03-routines/ | grep -v ":0"
```

The four scripts that produced every session-record figure live beside this document's working notes
and are reproduced here as their measurements; each walks
`.engineering/artifacts/planning/**/session.json`, recursing through `triggeredWorkflows[i].state`:

| Figure | How |
|---|---|
| 78 files, 151 records, 73 embedded | walk the tree, count `SessionFile` nodes at depth 0 and below |
| 648 composed keys, 108 distinct, 10 at the eight ref sites, 15 pre-orphaned | match `base(key)` against `activityId + '-' + checkpointId` for the eight `ref:`-form pairs |
| 8 suspended gates | collect `activeCheckpoint` by `(workflowId, activityId, checkpointId)` |
| 5,536 `data.stepId` events, 460 in converted runs | count by event type and match `base(stepId)` against the converted step lists |
| 2,388 `variable_set`, 92 reclassified | filter `type == 'variable_set'` on `data.name` |
| 6,107 ledger entries by channel | split each `deliveredContent` key on the first `:` |
| 2 refused records | `npx tsx` over `safeValidateSessionFile` from `src/schema/session.schema.ts` |

The corpus figures:

```
grep -rn "challenge_findings" --include=*.yaml workflows/            # 7 declarations, 7 files
grep -rn "ref:" --include=*.yaml workflows/                          # 8 steps, 4 files
grep -rn "kind: checkpoint" --include=*.yaml workflows/ | wc -l      # 115
grep -rc "immediate: true" --include=*.yaml -r workflows/ | grep -v ":0"   # 20 exits, 16 files
```

The guard delta, which is the one figure worth re-running by hand because it is the argument:

```
# baseline: 12 findings, 114 writes measured
npx tsx scripts/check-session-contract.ts <the extracted work-package child> --root workflows

# after removing the seven `challenge_findings` write declarations from a corpus copy:
#   15 findings, 114 writes measured — three new, at codebase-comprehension,
#   design-philosophy and research
npx tsx scripts/check-session-contract.ts <the same child> --root <the mutated copy>
```

Extracting the child matters: pointed at
`.engineering/artifacts/planning/2026-09-09-parallel-activities/session.json` the guard measures the
`meta` shell (15 writes, 1 finding) and never sees the 495-event `work-package` run embedded beneath
it.
