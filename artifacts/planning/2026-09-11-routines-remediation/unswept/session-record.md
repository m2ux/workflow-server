# The session record, and what a materialised routine does to a run already in flight

> Item 11b of the routines remediation · **re-measured at server `fe5f5f78` on `main`, corpus
> `e9d26007` on `workflows`** — 92 server commits past the `ee95e4cd` the task statement names and 91
> past the `792f2cc5` its sibling records pin. Subject: the
> [routines proposal](../../2026-09-03-routines/README.md), against the surface the
> [completeness pass](../../2026-09-10-routines-sweeps/verification/completeness.md) recorded as
> reached by nothing.

The proposal describes a construct that folds a shared run of steps into a host activity and prefixes
every identifier inside it. What the server keeps on disk about a run in progress is one JSON file per
planning folder, and several of the things that file remembers are remembered **by name** — the name
of a gate that was answered, the name of a step whose technique was delivered, the name of a variable a
step wrote. Renaming those names in the definitions does not rename them in the file. This document
measures what the file holds, who writes each part and who reads it back, and then says for each part
what a run that is mid-flight when the definitions change actually does.

**Two things changed under this document between the completeness pass and now, and both change what
it can claim.** The corpus is no longer a submodule at `<checkout>/workflows`: the engine tree stopped
pinning it (`bb28377f`), and the definitions now sit under `corpus/` inside a sibling worktree that
the guards resolve by default (`guards/workflows-root.ts:4-6`). And the guard scripts moved from
`scripts/` to `guards/`, so the session-against-definition check is
`guards/check-session-contract.ts`. Every path and line in this record is the tree as it stands; where
a figure differs from the one the completeness pass published, both are given.

**The headline, and it bounds everything below.** Of the **84** `session.json` files on disk, the
server will open **seven**. Seventy-five carry the run's position in a scalar the schema no longer
knows and are refused by name; two more carry a history event type outside the enum and fail the
parse. So the population a routines migration could strand is not 84 files or the 163 session records
inside them — it is seven files, thirteen records, five of them `work-package` runs, of which exactly
one has entered the run stages 5 and 6 convert and it is already past it. Every hazard this document
records is live in mechanism and, today, zero in incidence — and saying so is the point, because the
same measurement says which hazard stops being zero the moment a run is suspended at the wrong moment.

---

## One. Which sessions the server will open

`loadSessionForTool` does three things before a tool sees a record: verifies the HMAC seal
(`src/utils/session/resolver.ts:241`), parses against `SessionFileSchema` (`:242`), and refuses a
record written before the frontier (`:252`). The third is the one that matters here.

`assertNotPreFrontier` (`src/utils/session/resolver.ts:265-278`, **14 lines**) throws when the raw
JSON carries a string `currentActivity` and no `frontier` key at all. Its doc comment states the
hazard as an invariant rather than as history: a non-strict object strips the field it no longer
knows, the frontier's default supplies an empty list, and the result is indistinguishable from a
session's first call, whose next transition would retire nothing.

Applying exactly that predicate, plus `safeValidateSessionFile`, to every file on disk:

```
session files: 84
  refused — history event type outside the enum: 2
  refused — predates the frontier: 75
  the server will open: 7
```

The seven, and what is inside them:

| Planning folder | Top record | Child | Child frontier | Child history |
|---|---|---|---|---|
| `2026-09-10-fan-conformance-live-run` | `fan-conformance`, running | — | — | 56 |
| `2026-09-11-fan-conformance` | `meta`, running | `fan-conformance`, completed | — | 134 |
| `2026-09-11-server-owned-session-setup` | `meta`, running | `work-package`, running | `lean-coding-audit` | 458 |
| `2026-09-12-session-records-which-path-drove` | `meta`, running | `work-package`, running | `start-work-package` | 26 |
| `2026-09-14-meta` | `meta`, running | `work-package`, running | `start-work-package` | 3 |
| `2026-09-14-time-to-client-dispatch` | `meta`, running | `work-package`, running | `design-philosophy` | 136 |
| `2026-09-14-work-package-git-image` | `meta`, running | `work-package`, running | `start-work-package` | 3 |

None of the thirteen carries an `activeCheckpoint`. None carries a checkpoint response at any of the
eight reference sites stage 5 renames. One — the `work-package` child of
`2026-09-11-server-owned-session-setup` — carries **71** history events naming a step inside the
converted runs, and its frontier is `lean-coding-audit`, the ninth activity, downstream of all four
assumption-run hosts. It has been through the blast radius and come out.

The refusal is also the tree's settled answer to a session it can no longer interpret, and that is
worth holding on to for section eight: when an identifier population last moved in the live record —
`currentActivity`, a scalar, becoming `frontier`, a list — the answer was neither a mapping table nor
silence. It was fourteen lines that name the record, state what it records, say why that cannot
resume, and end *"Start a fresh session."*

---

## Two. There are two session schemas, and the positional keys belong to the one nothing persists

`src/schema/session.schema.ts` (**356** lines) declares `SessionFile`, the shape of `session.json`.
`src/schema/state.schema.ts` (**238**) declares `WorkflowState`. The second is not an older version of
the first. It is a separate shape the server never writes.

`SessionFile` is what the load path parses (`resolver.ts:242`), what the legacy converter validates
before writing (`migration.ts:333`), and what the session peek in `get_resource` reads. `WorkflowState`
has exactly one consumer outside its own module: `scripts/generate-schemas.ts:6,26`, which renders it
to `schemas/state.schema.json`. Its own entry points — `createInitialState`
(`state.schema.ts:219-228`), `validateState` (`:230`), `safeValidateState` (`:231`), `addHistoryEvent`
(`:234-237`) — have **no callers at all**, only the blanket re-export at `src/index.ts:7`. What
`state.schema.ts` genuinely supplies is the two schemas `session.schema.ts` imports at its first seven
lines: `HistoryEntrySchema` and `CheckpointResponseSchema`.

This is the discriminator for the positional-step question, and it is sharper than the one the
completeness pass reached for. That pass recorded `currentStep` and `completedSteps` as an identifier
population materialisation moves, mitigated by having no writer. Measured at the tree, the position is
stronger: **they are not fields of the live record at all.** `currentStep` (`state.schema.ts:170`),
`completedSteps` (`:172`), `activeLoops` (`:174`), `currentActivity` (`:169`), `parentWorkflow` (`:178`)
and `lastError` (`:180`) are members of `WorkflowStateBaseSchema` and appear nowhere in `SessionFile`.

Their only producer anywhere writes the **legacy** envelope, not the record:
`scripts/generate-session-token.ts:167-199` builds a `state` literal carrying `completedSteps: {}` and
`activeLoops: []` and writes it to `workflow-state.json`, which is the input `migration.ts` consumes
and then deletes. `buildSessionFromLegacy` (`migration.ts:169-251`) carries over variables, completed
activities, checkpoint responses, `startedAt`, `currentTechnique` and `exit`, and never looks at
either field.

Across all 163 records: **zero** occurrences of `currentStep`, `completedSteps` or `activeLoops`; zero
`loop_started`, `loop_iteration`, `loop_completed`, `loop_break`, `decision_reached` or
`decision_branch_taken` events in 14,830 history events. That is a stronger reading than a grep for
writers, because it is the corpus of records rather than the code.

Three positional keys **are** in the live record's own schemas, and all three are inert:

| Key | Where | Writers | Occurrences in 163 records |
|---|---|---|---|
| `history[].step` | `state.schema.ts:92`, `StepIndex` = int ≥ 1 | none | 0 |
| `history[].decision`, `history[].loop` | `:94`, `:95` | none | 0 |
| `triggeredWorkflows[].triggeredFrom.stepIndex` | `session.schema.ts:266` | both writers omit it (`resource-tools.ts:664`, `:713`) | 0 |

**Verdict on the positional step keys: KEEP, and the reason is not the one on record.** A routine
changes nothing here, and cannot, because two of the three named fields belong to a record shape
nothing writes and the third has no writer. Two consequences follow. Deleting them would be correct
and is out of scope. Leaving them is also correct — but `schemas/state.schema.json` then goes on
publishing `currentStep` (line 36), `completedSteps` (47) and `activeLoops` (92) to agents as the
runtime progress model, under the description *"State schema — runtime execution progress tracking"*
(`src/resources/schema-resources.ts:10`), while the schema that **is** the live record,
`schemas/session-file.schema.json`, is generated (`scripts/generate-schemas.ts:28`) and served as no
MCP resource at all — `SCHEMA_IDS` is `['workflow', 'activity', 'condition', 'technique', 'state']`
(`src/loaders/schema-loader.ts:16`).

---

## Three. Every field of the live record, and what a routine does to it

Key shapes below are the literal composition in the code. "Changed by a routine" asks only whether
materialisation as the proposal specifies it — step and gate identifiers prefixed with the reference
step id and a full stop (README:539-542), internals renamed with the host activity and reference site
underscore-joined (README:194-198) — alters the string the field holds or is keyed on.

| Field | Key / value shape | Written by | Read back by | Changed | What a run in flight does |
|---|---|---|---|---|---|
| `schemaVersion` `session.schema.ts:71` | literal `1` | create | parse | No | — |
| `sessionIndex` `:74` | 6-char base32 of the folder path | `derivation.ts` at create | `resolveSessionLocation` `store.ts:588-597`, `:619`, `:642` | No | — |
| `workflowId` `:77` | workflow id | create / migrate | `loadWorkflow` at every tool | No | — |
| `workflowVersion` `:78` | semver | create / migrate | `validateWorkflowVersion` `validation.ts:60-65` | No | **The only drift signal the record has.** A conversion that bumps the workflow version makes every later call carry *"Workflow version drift: session started with vX but current definition is vY"*. Warn-only, and it names no identifier |
| `agentId` `:81`, `seq` `:87`, `ts` `:90`, `startedAt` `:93` | identity and bookkeeping | create / `advanceSession` | store, projections | No | — |
| `frontier[]` `:106` | `<activityId>` or `<activityId>#<instance>` | `next_activity` `workflow-tools.ts:1158-1159`, `resource-tools.ts` | `yield_checkpoint` `:2064`, fan resolution | No — a routine is never a transition destination (README:746-747) | — |
| `currentTechnique` `:107` | technique id | tool calls | projections | No — materialisation renames no technique | — |
| `exit` `:109` | exit id | `next_activity` `:1159` | `getExitBindings` | No — exits stay on the host activity | — |
| `activeCheckpoint.checkpointId` `:42-61`, `:112` | gate id, possibly `<base>#<instance>` | `yield_checkpoint` `:2158-2163` | `getCheckpoint` at `present_checkpoint` `:2319` and `respond_checkpoint` `:2387` | **Yes** | **The run has no legal next move.** See §4 |
| `activeCheckpoint.activityId` | activity id | `:2160` | same | No | — |
| `variables` `:115` | flat bag, keyed on variable name | `applyVariableWrites` `variable-seed.ts:112` | every gate message, every technique binding, the contract guard | **Yes, for internals** | The bare name stays in the bag holding the last value written; the routine writes a prefixed name, or by the proposal's own rule writes nothing to the bag (README:198). Nothing reads the stale entry — an internal has no cross-activity consumer by definition. 2 of 163 records hold `assumption_review_presentation`, 1 holds `challenge_findings`, none holds `current_assumption` |
| `completedActivities[]` `:118` | activity ids | `next_activity` | `projectActivities`, `check-session-contract.ts:119` | No | — |
| `checkpointResponses` `:120-124` | **`<activityId>-<checkpointId>`**, composed at `workflow-tools.ts:2451` | `respond_checkpoint` `:2471` | replay probe `:2110-2111`, `projectCheckpoints` `:236-246`, `resume_checkpoint` `:2274`, `immediateExitCut` `validation.ts:91-96` | **Yes** | The recorded answer orphans and the gate is asked again. Accepted at README:1132-1137. Measured: 10 entries at the eight sites stage 5 renames |
| `history[].activity` `state.schema.ts:91` | activity id | every event writer | `validateTechniqueFetches` `validation.ts:207`, `:217`; `check-session-contract.ts:101-102` | No | — |
| `history[].step` `:92` | `StepIndex` | **nothing** | nothing | n/a | Inert. 0 of 163 records |
| `history[].checkpoint` `:93` | gate id | `:2128`, `:2168`, `:2476` | `projectHistory` `:303` only — echoed, never joined to a definition | **Yes** | The log carries two spellings for one gate. 1,448 occurrences. Legible degradation |
| `history[].decision` `:94`, `history[].loop` `:95` | ids | **nothing** | nothing | n/a | Inert. 0 of 163 records |
| `history[].data.stepId` (unconstrained, `:96`) | **step id** | `technique_fetched` `resource-tools.ts:871-875`, `technique_bundled` `workflow-tools.ts:1930-1934`, `step_started` `step-events.ts:19-24`, `step_completed` `workflow-tools.ts:1131-1138` | `validateTechniqueFetches` `validation.ts:220`, `:226`; `appendStepStartedIfAbsent` `step-events.ts:12-17` | **Yes** | See §5. 6,072 events carry it; 531 name a step inside the converted runs |
| `history[].data.name` (`variable_set`) | variable name | `variable-seed.ts:113-127` | **`check-session-contract.ts:97-115`** | **Yes, for internals** | See §6. The guard re-judges the record against the post-conversion contract |
| `status` `:135` | enum | `next_activity` | `get_workflow_status` | No | — |
| `triggeredWorkflows[].triggeredFrom.stepIndex` `:266` | int ≥ 1 | **nothing** — both writers omit it | nothing | n/a | Inert |
| `planningFolderPath` `:156`, `repo` `:164`, `contextMode` `:175`, `executionPath` `:182` | paths / ids / enums | `start_session` | resolution, presentation, accounting | No | — |
| `deliveredContent` `:195` | `agentId → <channel>:<id-or-hash> → content hash` | `recordDeliveries` `delivery.ts:76`, called at `workflow-tools.ts:659`, `:1919` and `resource-tools.ts:943`, `:1066` | `deliveredHash` on every delivery | Keys no; **hashes yes** | See §7. 6,856 entries, 3,715 under `technique:` |
| `declaredArtifacts[].id` `:202-206` | agent-reported artifact id | `next_activity` `:1130-1155` | reconciliation | No — ids come from the worker's report, not the definition | — |

Two structural facts complete the picture, and both cut the other way from the risks above.

**The session store is entirely identifier-blind.** Across 919 lines, `src/utils/session/store.ts`
reads exactly two things out of a session record: `sessionIndex` (`:588-597`, `:619-620`, `:642-643`)
and `triggeredWorkflows[i].state` while walking for it. Grepping the store for any other field of
`SessionFile` — `variables`, `history`, `checkpointResponses`, `activeCheckpoint`, `frontier`,
`completedActivities`, `deliveredContent`, `currentTechnique`, `workflowId` — returns nothing.
`TOP_LEVEL_KEY_PRIORITY` (`:114-135`) names them, but only to fix a human-friendly serialisation
order. A rename inside the record is invisible to the store, and every ordinary server write re-seals,
so the seal is not a hazard on the happy path.

**The seal is a hazard on every other path.** `verifySeal` refuses any record whose canonical bytes do
not hash to the stored seal, with *"session.json has been modified outside the server"*
(`store.ts:517-523`), and the load path calls it before parsing (`resolver.ts:241`). Any out-of-band
rewrite of keys — a hand edit, a stream editor, an offline remapper — turns a recoverable orphan into
an unloadable session. A remapper has to write through `writeSessionFile` (`store.ts:424`) or
`replaceSessionFile` (`:461`), which means holding the server key from `getOrCreateServerKey`
(`src/utils/session/crypto.ts:43`, reading `<state-dir>/secret`).

---

## Four. The consequence the proposal has not noticed: a suspended gate that cannot be answered

`activeCheckpoint` holds the gate a worker yielded on and is waiting for the orchestrator to resolve
(`session.schema.ts:36-61`). Both tools that read it look the gate's definition up by the recorded id
and **throw when it is absent**:

- `present_checkpoint` — `getCheckpoint(result.value, active.activityId, active.checkpointId)` then
  `if (!checkpoint) throw new Error('Checkpoint not found: …')` (`workflow-tools.ts:2319-2320`).
- `respond_checkpoint` — the same lookup at `:2387`, then
  `if (!checkpoint) throw new Error('Checkpoint definition not found: …')` at `:2388`. The throw
  precedes the mode branch, so `option_id`, `auto_advance` and `condition_not_met` all reach it.

The lookup cannot be satisfied by a renamed gate. `getCheckpoint` tries an exact id match, then
compares base ids — the segment before the first `#` (`workflow-loader.ts:495-506`, `:475`), and its
own comment says base equality is on the full pre-`#` segment, not a prefix. A recorded
`implementation-assumption-interview` and a materialised `reconcile-assumptions.batch-gate` agree on
neither.

Every way out is closed, and there are more of them than the completeness pass's note implies.

- `next_activity` is the only other writer that clears the field (`:1160`), and it refuses to run while
  one is set: *"Cannot transition to …: Active checkpoint '…' on activity '…'. The orchestrator must
  resolve it by calling respond_checkpoint"* (`:976-981`).
- `yield_checkpoint` refuses to yield a second gate (`:2046-2047`), and `resume_checkpoint` refuses to
  continue (`:2261-2262`).
- `assertNoActiveCheckpoint` (`src/utils/session/params.ts:68-76`) gates five more handlers on the
  same field: `get_workflow` (`:613`), `get_activity` (`:1382`), `get_trace` (`:2544`), `get_technique`
  (`resource-tools.ts:754`) and `get_resource` (`:981`). Its message is *"All tools are gated until the
  checkpoint is resolved."*
- `start_session` does not touch `activeCheckpoint`, so re-opening the folder does not clear it.

What is left to a session in that state is `inspect_session`, `get_workflow_status` — which reports it
`blocked` (`:2614-2616`) — `record_usage` and `dispatch_child`. Four tools, none of which can move the
run. The recovery is to hand-edit the record, which breaks the seal, or to start again.

Neither this path nor the tree's one existing record-refusal has a test:
`grep -rn "Checkpoint definition not found\|Checkpoint not found\|predates the frontier" tests/`
returns nothing.

**Measured incidence today: zero, for two independent reasons.** Eight of the 163 records carry an
`activeCheckpoint`:

| Records | Workflow | Activity | Gate | Top file loads |
|---|---|---|---|---|
| 6 | `meta` | `end-workflow` | `completion-confirmed` | no |
| 1 | `workflow-authoring` | `scope-and-draft` | `scope-confirmed#0` | no |
| 1 | `work-package` | `plan-prepare` | `approach-confirmed` | no |

None is at a gate any stage renames, and all eight sit inside files the server already refuses. So this
is a latent hazard, not an observed fault, and the record should say so. But the window it needs is not
hypothetical — it is the interval between a worker yielding and a human answering, and the corpus of
records holds 649 `checkpoint_reached` events. The third row is the near miss worth naming:
`plan-prepare` is an activity stage 6 converts, and `approach-confirmed` survives only because it sits
outside the `assumption-convergence` loop the conversion touches.

**This is not the same class of consequence as an orphaned response.** An orphaned response costs a
question asked twice, and the run continues. A gate suspended inside a converted body costs the run.
The proposal's *"accepted and stated"* covers the first and says nothing about the second.

---

## Five. The step identity that is live, and the one the record was said to have

The completeness pass looked for positional step keys and found them inert. The population it did not
look for is the name-keyed one, and it sits in the field the schema leaves unconstrained:
`history[].data` is `z.record(z.unknown())` (`state.schema.ts:96`), and four event writers put a step
**id** in it.

Measured over 163 records: **6,072** history events carry `data.stepId`, spanning **468** distinct step
ids — 2,619 `technique_bundled`, 1,348 `step_completed`, 1,152 `step_started`, and 953 of the 969
`technique_fetched`. Of those, **531** name a step inside the runs stages 5 and 6 convert:

| Step id | Events | Stage |
|---|---|---|
| `collect-assumptions` | 152 | 5 |
| `update-assumptions-log` | 136 | 5 |
| `reconcile-assumptions` | 81 | 6 |
| `present-resolved-assumptions` | 60 | 5 |
| `create-assumptions-log` | 33 | 5 |
| `challenge-assumptions` | 22 | 6 |
| `combine-assumption-challenges` | 22 | 6 |
| `present-assumption` | 15 | 5 |
| `record-response` | 6 | 5 |
| `record-batch-response` | 3 | 5 |
| `assumption-interview` | 1 | 5 |

There is a third spelling as well, in exactly one record: an `action_logged` event carrying
`data.step: "announce-completion"` — a step name under `step` rather than `stepId`, in
`2026-06-30-review-mode-harden-config-defects/session.json`, one of the two files the enum refuses.

Two readers join these ids back to the current definitions, and both survive the rename — for reasons
that have to be recorded, because they are what make this a KEEP rather than a defect.

**`validateTechniqueFetches`** (`validation.ts:184-237`) warns when a manifested technique step has no
recorded delivery in the current visit. It collects `data.stepId` into `fetchedStepIds` (`:220`) and
credits a step whose id is in that set (`:226`). After a rename the pre-migration events name
unprefixed ids and the definition names prefixed ones, so the step-keyed credit misses. **The exposure
narrows to nothing measurable, on a fallback nobody named:** the same loop also collects
`data.techniqueId` (`:221`) and credits any step whose binding resolves to a fetched technique id
(`:228`), and materialisation renames no technique. Measured over 163 records, **0 of 3,572**
step-bound `technique_fetched` and `technique_bundled` events lack a `techniqueId`. Every event that
would lose its step-keyed credit keeps its technique-keyed one.

**`appendStepStartedIfAbsent`** (`step-events.ts:7-25`) is idempotent on the triple
(activity, `data.stepId`, `agentId`) (`:12-17`). A step whose id has been prefixed does not match the
`step_started` already recorded for it, so a second event is appended for the same step. One extra row
in a 1,152-row population, affecting nothing that reads it.

**`immediateExitCut`** (`validation.ts:80-99`) is the one place a recorded key is parsed back into a
definition lookup: it strips the `<activityId>-` prefix and resolves the remainder as a step id via
`topLevelStepIndex` (`:91-96`, `activity.schema.ts:340`). A pre-migration response at a renamed gate
would resolve to −1, the cut would be lost, and `validateStepManifest` would then require the full step
list instead of the truncated one (`:116-117`). **Measured, this cannot fire.** The mechanism needs a
gate that selects an `immediate: true` exit and sits inside a converted body. None of the four stage-5
host activities — `research`, `implementation-analysis`, `assumptions-review`, `implement` — declares
an immediate exit, and at the stage-6 sites that do, the selecting gate is outside the
`assumption-convergence` loop. Verdict: KEEP, with a discriminator that has to be re-checked if a later
stage converts a run containing an immediate-exit gate.

---

## Six. Withdrawing a write declaration re-judges every record that satisfied it

`guards/check-session-contract.ts` asks whether a run stayed inside the contracts the definitions
declare. It builds the declared writes per activity from the **current** corpus (`:86-89`), walks the
record's `variable_set` events, and reports `undeclared-write` for any name the activity that wrote it
does not declare (`:97-115`). Its own header invites being pointed at real records: *"Point it at any
session: a smoke run's, an end-to-end walk's, or a real one"* (`:23-24`).

Stages 5 and 6 remove write declarations. The proposal states stage 6's as a subtraction:
*"`challenge_findings` is a declared activity-level write at six sites today, so applying this rule
removes six declarations rather than adding any"* (README:207-208). Measured at the corpus it is
**seven**, across seven files — the figure the sweep folder's own verification already corrected.
Stage 5 withdraws eight more, the assumption run's two internals at four hosts apiece
(README:188-192). Fifteen declarations in total, in seven files:

```
challenge_findings              7
assumption_review_presentation  4
current_assumption              4
```

Run the guard over **every** record on disk — all 163, descending into embedded children — first
against the corpus as it stands and then against a copy with exactly those fifteen declarations
removed and nothing else changed:

```
records walked: 163
writes measured against a contract, across all records: 2620
undeclared-write findings, corpus as it stands: 655
undeclared-write findings, fifteen declarations withdrawn: 661
records whose finding count moves: 2
   2026-08-15-handling-inline-techniques/session.json (depth 1, work-package): 41 -> 43
   2026-09-09-parallel-activities/session.json (depth 1, work-package): 12 -> 16
```

Six new findings, in two records, both archived `work-package` children, neither reachable by the
server. Taken alone, the `challenge_findings` half on the second of those records reproduces to the
digit:

```
# corpus as it stands
session-contract: 114 write(s) measured against a contract
session-contract: 12 violation(s)

# seven challenge_findings declarations removed, same unchanged record
session-contract: 114 write(s) measured against a contract
session-contract: 15 violation(s)
    the run wrote 'challenge_findings' … which declares no such write (source variables_changed)
    the run wrote 'challenge_findings' … which declares no such write (source variables_changed)
    the run wrote 'challenge_findings' … which declares no such write (source yield_checkpoint)
```

Twelve findings become fifteen. The run did nothing wrong; it wrote a name the activity declared at the
time, and the conversion withdrew the declaration. The guard's own finding text offers the reader two
readings — *"either the contract is short of what the activity produces, or the run produced what the
definition does not sanction"* (`:111-113`) — and neither is what happened. A third reading is needed
and the guard cannot supply it, because a record carries no definition revision.

Two things keep this in proportion, and both belong in the record.

**The volume is small and the mechanism generalises.** Of 2,672 `variable_set` events across all
records, 147 name a variable the conversion reclassifies. Only `challenge_findings` and the two
internals lose a declaration outright, which is why the delta is six and not a hundred and forty-seven:
the signature injects `assumptions_log` and `has_resolvable_assumptions` as declared writes at the
six assumptions sites (README:1106-1112), and `open_assumptions` / `has_open_assumptions` are the fold
technique's over-declaration the proposal already records. So the finding is small in volume and exact
in mechanism — and the mechanism is the part that carries: **any stage that withdraws a write
declaration re-judges every historical record that satisfied it.** Stages 5 and 6 both do. Against a
baseline of 655 findings the tree already carries, six more is 0.9%; against a reviewer reading a
diff, it is six unexplained regressions on files nobody touched.

**Most of the population is invisible to the guard as invoked.** `readSession` parses the top-level
file and `checkSession` takes it whole (`:155-162`, `:67-71`); neither descends into
`triggeredWorkflows[i].state`. Of 163 records, **79 are embedded**. Pointed at
`.engineering/artifacts/planning/2026-09-09-parallel-activities/session.json` the guard measures the
`meta` shell — 15 writes, 1 finding — and never sees the 495-event `work-package` run beneath it. The
work-package run is the child, and it is the one whose count moves.

For completeness: on the only openable record inside the blast radius — the `work-package` child of
`2026-09-11-server-owned-session-setup` — the guard reports 132 writes and 11 findings, and the
fifteen-declaration withdrawal changes neither. That run never wrote `challenge_findings`.

---

## Seven. The delivery ledger keeps its keys and loses its hashes

`deliveredContent` maps an agent scope to a content key to the hash of the content last delivered in
full (`session.schema.ts:184-195`). Measured over 163 records: **6,856 entries** across 328 agent
scopes in 115 records — 3,715 under `technique:`, 1,976 under `bundle:`, 997 under `resource:`, 166
under `activity_rules:`, 2 under `workflow_bundle:`. The channel list is documented at
`src/utils/delivery.ts:17-30`, and **no channel is keyed on a step id**, so materialisation moves no
key.

It moves the hashes. The eager step-technique path ledgers under `technique:<techniqueId>`
(`workflow-tools.ts:1635`) and hashes the composed body *after* provenance decoration (`:1625`,
`:1632`, `:1636`). The decoration writes a `source:` line per input
(`binding-provenance.ts:375-391`, `:398-410`), and `producerText` renders that line as
`'<stepId>' (activity '<activityId>')` (`:243-252`). Prefix a producer step and the note changes, the
body changes, the hash changes — under an unchanged key. A session in `contextMode: 'persistent'`
therefore takes a **full re-delivery** of content it already holds, once per affected key per agent
scope.

Composing every technique step in `work-package` through the server's own path and reading the
decorated bodies:

```
technique steps in work-package: 202
decorated with a provenance context: 202
carrying a source: line naming a step a routine renames: 38
distinct ledger keys affected: 8
```

Thirty-eight steps in nine activities, under eight keys. **Three of the thirty-eight are steps no stage
converts** — `assess-ticket-completeness` in `design-philosophy`, `register-deferred-assumptions` in
`assumptions-review`, `register-deferred-findings` in `strategic-review`. They change because the
*producer* of an input is renamed, not because the step is. That is the half the proposal's delivery
budget section does not reach: it says the bundled-character change is *"measured before ruled on"*
(README:1149-1154) and attributes it to the step count. The attribution needs a second sentence.

Across the record corpus, 114 ledger entries sit under those eight keys — 47 under
`technique:review-assumptions::collect`, 47 under `::record`, 7 each under
`technique:analyse-challenge::challenge` and `::combine`, 3 under `technique:assess-ticket-completeness`,
2 under `::assemble-open-set`, 1 under `technique:manage-registers::append-deferred-item`.

One discriminator narrows the cost, and it is visible in the same run. The ledger key is the technique
id, but the composed body differs per step, so two steps binding one technique already write different
hashes under one key and already overwrite each other. `research :: update-assumptions-log` and
`research :: record-batch-response` both ledger under `technique:review-assumptions::record`, at hashes
`7b67fc04…` and `b2ad810e…`. The re-delivery a rename causes is therefore one extra full delivery per
affected key per scope on the first call after the migration, in a ledger that already thrashes on that
key — not a systemic change to delivery cost.

---

## Eight. Testing the proposal's argument against a key-mapping table

README:1132-1137 declines a mapping on one ground: *"A definition change is a definition change, and a
key-mapping table would be permanent server cruft for a one-off rename."* The completeness pass put the
counter-example as: the tree already carries one, at `src/utils/session/migration.ts:219-238`. **Read at
the tree, that is not what that code is, and the argument fails for three better reasons.**

### It is a value normaliser, not a key mapper

The block converts the *value* shape. A legacy `checkpointResponses` entry may be a bare option-id
string; the loop wraps it as `{ optionId, respondedAt }` so the record validates, keeps an entry that is
already object-shaped, and drops anything else (`:226-238`). The key is written through **verbatim** —
`normalisedResponses[key] = …`. There is no prefixing branch and no activity lookup: `heldActivityId` is
computed once at `:182` and used at exactly one place, the `frontier` assignment at `:243`.

So the module's own comment misdescribes it. *"key prefixing is best-effort (we use the legacy key
verbatim when activity is unknown)"* (`:221-223`) implies a branch that prefixes when the activity **is**
known. No such branch exists. This is a live stale statement of the `AP-129 stale-restatement-after-change`
class the sweep folder is already acting on, and it is the reason a reader looking for a mapping table
finds one.

Worse, the code's actual output is a set of permanently unresolvable keys, and the repository ships the
fixture that proves it. `tests/fixtures/legacy-session/workflow-state.json` carries
`"checkpointResponses":{"pr-creation":"proceed","classification-confirmed":"confirmed"}` — bare
checkpoint ids with no activity segment. The converter normalises both values and emits both keys
unchanged. The live probe looks the entry up under the activity id, a hyphen and the checkpoint id
joined (`workflow-tools.ts:2110-2111`, composed at `:2451`). Both gates exist in the corpus today —
`classification-confirmed` in `design-philosophy` (`corpus/work-package/activities/02-design-philosophy.yaml:93`)
and `pr-creation` in `start-work-package` (`01-start-work-package.yaml:787`) — and both compose to keys
that 10 and 21 records respectively already hold. The prefixing the comment claims would have hit.
The verbatim keys never can. None of the 16 tests in `tests/migration.test.ts` (230 lines) asserts
anything about those keys.

### It cannot reach a session the routines migration would touch

`migratePlanningFolder` short-circuits when `session.json` exists (`:281-283`), converts
`workflow-state.json` one way, and deletes the envelope on success (`:348`). Every session the routines
migration crosses already has a `session.json`. The repository states this discriminator in its own
words, in a doc comment written for a different purpose: *"The legacy converter never reaches one: it
converts a folder holding no session file, and a pre-frontier record is a session file"*
(`src/utils/session/resolver.ts:262-263`).

It is also the wrong fidelity even if it could run. It drops history entirely, by design (`:165-167`,
`:203-204`), which is the whole `data.stepId` and `variable_set` population; and it reconstructs from
`createInitialSessionFile`, so `activeCheckpoint`, `deliveredContent`, `declaredArtifacts`,
`triggeredWorkflows`, `contextMode`, `repo`, `planningFolderPath`, `status`, `executionPath` and `seq`
do not survive.

**Verdict: wrong shape.** Not "needs extending" — wrong trigger, wrong target, wrong fidelity, three
independent ways.

### The tree's real precedent for a moved session identifier is a refusal, and it costs 14 lines

When an identifier population last moved in the live record, the answer was a refusal that names the
record and prescribes the remedy: `assertNotPreFrontier`, fourteen lines, section one. The same shape
recurs a second time. Two records are refused outright because they carry history event types the enum
does not hold:

```
REFUSED 2026-06-07-issue-128/session.json                          history.18.type: … received 'log'
REFUSED 2026-06-30-review-mode-harden-config-defects/session.json  history.19.type: … received 'action_logged'
```

`loadSessionForTool` turns that into `SessionStoreError(SEAL_MISMATCH)` carrying the issue list
(`resolver.ts:243-249`). So the repository's settled practice on a record it can no longer interpret is
to say so loudly and stop — twice, in two different mechanisms, and 77 files' worth of consequence.

That also corrects the proposal's one statement about this surface. `investigation.md:365-368` is the
only place in the thirteen records of the design folder that reaches the session schema, and it says:
*"Unknown fields still disappear from a session without complaint … Routines add no session state of
their own, so this is not made worse."* True for unknown object fields; false for the history enum,
which refuses rather than erasing. And both halves miss the case that matters, because a rename adds no
field and removes none — it leaves the field set intact and makes the lookups miss.

### What to do instead

The proposal is right that a permanent table is the wrong answer, and right that a definition change is
a definition change. What the measurement changes is the scope of *"accepted and stated"*: the statement
lives in a planning document and the server says nothing at all. Three things follow, in increasing cost.

1. **A refusal for the suspended gate, on the `assertNotPreFrontier` pattern.** When `activeCheckpoint`
   names a gate the current definition does not hold, throw a diagnosis that names the gate, the
   activity, and the fact that the definition changed under the run — rather than
   `Checkpoint definition not found`, which reads as a corpus bug. Roughly the fourteen lines of the
   existing precedent, at `present_checkpoint:2320` and `respond_checkpoint:2388`, and the two are one
   shared helper. This is the only item that turns a wedged run into a legible one.
2. **A revision stamp, or a cheaper reading of the version field.** `workflowVersion` is already pinned
   and already compared (`validation.ts:60-65`); a conversion that bumps the workflow version is what
   makes every stale-key miss attributable. Free if the stages bump, and the plan should say they do.
3. **A one-shot remapper as a script, not a server path.** If the ten orphaned response keys and the
   six new guard findings are judged worth carrying, the shape is a tool under `scripts/` that reads the
   record, rewrites keys, and re-seals through `replaceSessionFile` — deleted when the stages land. That
   is not permanent cruft, and it is the only form that can reach a record the legacy converter is
   defined never to touch. On today's measurement it would have seven files to run against, which is
   itself an argument for not writing it.

---

## Nine. What the proposal accepts knowingly, and what it has not noticed

Stated plainly, because the two are being conflated.

**Accepted, stated, and supported by evidence the proposal does not cite.** Orphaned checkpoint
responses. README:1132-1137 says the gate is asked again and the old entry stays as dead data. The
repository already contains the experiment, at a scale the proposal could have leaned on. Resolving
every recorded key against the corpus the way the server does — split on `<activityId>-`, then
`getCheckpoint`, which matches an exact id or an equal base id — over all 163 records:

```
checkpointResponses keys: 653
  resolve to a live gate definition: 420
  orphaned (workflow loads, no gate): 233 over 51 distinct keys
```

**Two hundred and thirty-three of 653 recorded answers, 35.7%, already name an activity-and-gate pair
the corpus does not hold.** The largest families are `validate-and-commit-pre-commit-attestation` (18),
`intake-and-context-mode-confirmation` (17), `requirements-refinement-assumption-decision` and its
per-item variants (15), `intake-and-context-change-request-confirmed` (15),
`resolve-target-repo-type-confirmed` (14) and `post-update-review-post-update-disposition` (14). They
have been absorbed with no mapping table, no diagnosis and no observed harm. One qualification, offered
as a reading rather than a measurement: at least seven of the 51 distinct keys — `implement-commit-signing-blocked`,
`implement-gitnexus-conversion-shape` and five siblings — read as ad-hoc decisions admitted part-way
through a run, which `respond_checkpoint` records under the same composed key (`:2451`) and which the
activity never declared. Those orphan by design, and the repository therefore writes unresolvable keys
deliberately as well as by attrition.

Stage 5 adds **ten more**, at the eight reference-form sites it renames:

| Activity | Gate | Entries |
|---|---|---|
| `research` | `research-assumption-interview` | 4 |
| `assumptions-review` | `assumption-decision` | 2 |
| `implementation-analysis` | `analysis-assumption-interview` | 2 |
| `assumptions-review` | `residual-assumption-batch` | 1 |
| `research` | `research-assumption-decision` | 1 |
| `implement` | either gate | 0 |
| `implementation-analysis` | `analysis-assumption-decision` | 0 |

Ten orphans on top of 233 already carried, none of them in a file the server will open. The acceptance
is sound, and the plan can now state it with a number instead of an argument.

**Not noticed, and not the same class.**

- **A gate suspended inside a converted body leaves the run with no legal move** (§4). Not dead data —
  a dead run. Two tools throw, three refuse by name, five more are gated centrally, the recovery breaks
  the seal, and no test covers it. Latent at zero of eight records today, all eight inside files the
  server already refuses.
- **Withdrawing a write declaration re-judges every historical record that satisfied it** (§6). Six new
  findings across 163 records from fifteen removed declarations, twelve-to-fifteen on one unchanged
  record from seven of them. The guard's two offered readings are both wrong and it has no third.
- **The step identity materialisation moves is a name in `data.stepId`, not a position** (§5). 531 of
  6,072 events name a step inside the converted runs. The consequences turn out survivable — and only
  because of a technique-id fallback that covers 3,572 of 3,572 events and an immediate-exit population
  that misses the blast radius, neither of which anyone had checked.
- **The delivery baseline moves for a second reason** (§7): provenance notes embed producer step ids, so
  38 of `work-package`'s 202 technique steps recompose under unchanged ledger keys — three of them at
  steps no stage converts.

**Correct as stated, for a reason the record should carry.** The positional step keys change nothing,
because the schema that declares them is not the record the server writes (§2) — a stronger
discriminator than "no writer", and the one that stops a confident implementer deleting the fields and
then wondering why `schemas/state.schema.json` still describes them.

**A precedent that is narrower than it looks.** Stage 0 re-keyed 19 loops (README:768) and crossed with
no session migration and no recorded incident. That is not evidence that identifier renames are safe in
the record; it is evidence that the loop vocabulary is unwritten. Zero `loop_started`, `loop_iteration`,
`loop_completed` or `loop_break` events exist in 14,830 history events, and `activeLoops` is a field of
the schema the server does not write. Stages 5 and 6 rename populations with 653 and 6,072 live
occurrences respectively.

---

## Ten. Stale statements in these files, due today and not caused by routines

Four, all of the `AP-129 stale-restatement-after-change` class, all inside the surface this document
covers, and all cheap.

1. `src/utils/session/migration.ts:221-223` — *"key prefixing is best-effort (we use the legacy key
   verbatim when activity is unknown)"*. There is no prefixing branch; the key is always verbatim. This
   is the statement that made a value normaliser look like a key mapper.
2. `src/schema/session.schema.ts:36-40` — *"all authenticated tools (except `respond_checkpoint`) are
   gated until the orchestrator resolves the checkpoint"*. Six authenticated handlers do not gate:
   `present_checkpoint` and `respond_checkpoint` are the resolution mechanism, `inspect_session` and
   `get_workflow_status` are diagnostics, and `record_usage` and `dispatch_child` are unguarded. The
   correct enumeration already exists, thirty lines away in another file
   (`src/utils/session/params.ts:56-67`) — one rule with two homes, one of them wrong.
3. `src/resources/schema-resources.ts:10` — `state` is served as *"State schema — runtime execution
   progress tracking"*. It is not the record the server writes, and the three fields a reader would take
   as the progress model — `currentStep`, `completedSteps`, `activeLoops` — have no writer and zero
   occurrences. The live record's schema is generated separately as `schemas/session-file.schema.json`
   and registered as no MCP resource at all.
4. `src/schema/state.schema.ts:101` — `// Key format: "activityId-checkpointId" (e.g., "review-approve")`.
   The composition is right and the example is ambiguous in the one way that matters: `review-approve`
   reads as a single hyphenated token, and the parse at `validation.ts:91-96` depends on knowing where
   the activity segment ends. Worth an example whose two halves are visibly two.

---

## Eleven. Commands that re-take every figure

Line counts, and the coverage claim this document exists to close:

```
wc -l src/schema/session.schema.ts src/schema/state.schema.ts \
      src/utils/session/migration.ts src/utils/session/store.ts
grep -rn "session.schema\|session/store\|session/migration\|SessionFile" \
      .engineering/artifacts/planning/2026-09-10-routines-sweeps/ \
      .engineering/artifacts/planning/2026-09-03-routines/
```

The three files the completeness pass measured are **356 + 414 + 919 = 1,689** lines, against the 1,648
it published at `ee95e4cd` — `session.schema.ts` gained the `executionPath` field and its resolver, and
`store.ts` gained 23 lines. `state.schema.ts` is a fourth file at 238 lines that the count leaves out
and that declares the two schemas the first one imports. The citation grep returns nine lines: six are
the completeness pass itself naming the gap (`:98`, `:99`, `:108`, `:125`, `:519`, `:522`), one is
`investigation.md:365`, and two are generator-argument lists in the documentation sweep and its
verification. The six sweeps and six verifications reach none of these files as a subject.

The record-corpus figures come from four scripts that walk
`.engineering/artifacts/planning/**/session.json`, recursing through `triggeredWorkflows[i].state`:

| Figure | How |
|---|---|
| 84 files, 163 records, 79 embedded | count `SessionFile` nodes at depth 0 and below |
| 2 enum-refused, 75 pre-frontier, 7 openable | `safeValidateSessionFile`, then the predicate at `resolver.ts:265-269` verbatim |
| 653 keys, 420 resolving, 233 orphaned over 51 distinct | for each key, split on each `<activityId>-` the workflow declares and call `getCheckpoint`; 10 of them at the eight `ref:`-form pairs |
| 8 suspended gates | collect `activeCheckpoint` by `(workflowId, activityId, checkpointId)` |
| 6,072 `data.stepId` events, 468 ids, 531 in converted runs | count by event type, match `baseId(stepId)` against the converted step lists |
| 3,572 step-bound technique events, 0 without `techniqueId` | filter `technique_fetched` / `technique_bundled` carrying `data.stepId` |
| 2,672 `variable_set`, 147 reclassified | filter `type == 'variable_set'` on `data.name` |
| 6,856 ledger entries by channel | split each `deliveredContent` key on the first `:` |
| 14,830 history events, zero `loop_*` / `decision_*` | count by `type` |

The corpus figures:

```
grep -rn "challenge_findings" --include=*.yaml .worktrees/workflows/corpus/    # 7 declarations, 7 files
grep -rn "ref:" --include=*.yaml .worktrees/workflows/corpus/                  # 8 steps, 4 files
grep -rn "id: classification-confirmed\|id: pr-creation" --include=*.yaml .worktrees/workflows/corpus/
```

The provenance figure, which composes every technique step in `work-package` through
`composeActivityTechnique` → `provenanceContextFor` → `decorateTechniqueProvenance` →
`projectTechniqueToYaml` and counts the `source:` lines naming a converted step: 202 steps, 202
decorated, 38 naming one, 8 distinct ledger keys.

The guard delta, which is the one figure worth re-running by hand because it is the argument:

```
# baseline on one extracted work-package child: 114 writes, 12 findings
npx tsx guards/check-session-contract.ts <child.json> --root .worktrees/workflows

# same record, corpus copy with the seven challenge_findings write declarations removed:
#   114 writes, 15 findings — three new, at codebase-comprehension, design-philosophy and research
npx tsx guards/check-session-contract.ts <child.json> --root <mutated copy>

# all 163 records, fifteen declarations withdrawn: 655 -> 661 findings, 2 records moving
```

Extracting the child matters. Pointed at
`.engineering/artifacts/planning/2026-09-09-parallel-activities/session.json` the guard measures the
`meta` shell — 15 writes, 1 finding — and never sees the 495-event `work-package` run embedded beneath
it.
