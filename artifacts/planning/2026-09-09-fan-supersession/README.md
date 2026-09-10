# What the fan makes obsolete

> Investigation · 2026-09-09

The removals cluster into **four groups, three of them real clusters and one a grab-bag**. Two of the clusters are ordered against each other, which is what makes the sequencing non-obvious: the corpus vocabulary cannot come out until the code that lets the corpus express the shape differently is in, and the code cluster cannot come out until stage 5 lands the frontier.

| Cluster | What binds it together | Members | Stage |
|---|---|---|---|
| **A — the unexecutable fan-out vocabulary** | An in-activity dispatch layer that has never been able to run from where it is bound, plus every canon row that routes an author to it | 4 pattern activities, `dispatch-workers`' parallel selection, `dispatch_concurrency`, `isolation_mode`, 3 rules, 6 canon rows | Stage 6–7, some only after tier-one migration |
| **B — the scalar position** | `currentActivity` and everything derived from a single-valued cursor | 9 src files, 2 generated artifacts, 3 out-of-plan session readers, a second whole state schema | Stage 5 |
| **C — destination-as-string** | The type `string` where a three-form union now lives, and every renderer that interpolates it | `ExitBinding.to` + 5 readers, 2 private `Graph` copies, 1 ER-diagram attribute | Stages 1–2 |
| **D — dead on arrival** | Constructs the fan neither supersedes nor touches; it merely supplies the occasion to sweep them | `MetaResponseSchema`, `checkpoint_handle`, the `transitions` vocabulary, the grammar/constraints TBD tables | Any stage; **argue them on their own footing, not as fan consequences** |

And one finding that is not a removal at all: **the design itself introduces two things that removal would obviate**, one of which is load-bearing. That goes first, because it changes the plan rather than the code.

---

## The design should not ship these two

### `from_activity` must be required, not optional — and the design's subsumption claim is false

`README.md:1051` declares `from_activity: z.string().optional()`, and step 1 of the resolution rule (`README.md:1058`) reads *"Unnamed with at most one entry: the sole entry."* `README.md:1076` and rule **T3** (`README.md:1791`) both claim this "Subsumes the second-advance hazard `one-advance-per-activity` names."

**It does not.** I reproduced the mechanism in live code and in the corpus:

- `continue-batch.md:46` calls `next_activity { session_index, activity_id, step_manifest, agent_id }` — no exiting-activity parameter.
- `dispatch-activity.md:51` calls `next_activity { session_index, activity_id, step_manifest }` — likewise.
- The hazard the rule actually names is *"a second advance onto an activity **already current**"* (`continue-batch.md:70`), not onto one already retired.
- In `src/tools/workflow-tools.ts`, line 769 takes `const exitingActivity = draft.currentActivity`, lines 770–773 push `activity_exited` and `completedActivities.push(...)`, and line 842 assigns `draft.currentActivity = activity_id`. **There is no comparison between the two anywhere in that mutator.**

So on the exact sequence the prose forbids, the frontier holds one entry — the activity already current — step 1 resolves to it as "the sole entry", step 3 retires it as complete before a worker has walked a step, and step 5 re-enters it. T3 never fires, because the call names nothing.

Requiring the parameter whenever the frontier is non-empty is what makes the design's own claim true. The honest contract is the conditional shape T2 already uses for `exit`: required whenever the frontier is non-empty, omitted on a session's first call. **This turns the `one-advance-per-activity` prose rule from a scheduled-for-amendment item into a KEEP** — and only one of the two can be closed by removal.

### The stage-5 migration criterion is unsatisfiable as written

`delivery-plan.md:162` requires *"A session recorded before this stage migrates and resumes, its single recorded activity converting to a one-entry frontier,"* and `README.md:1015` names the legacy converter in `src/utils/session/migration.ts` as the mechanism (it writes `currentActivity` at line 243).

`migratePlanningFolder` short-circuits at `migration.ts:281-282`:

```ts
if (await sessionFileExists(folderAbsPath)) {
  return { migrated: false, reason: 'already-migrated' };
}
```

Every pre-frontier record *is* a `session.json`, so `buildSessionFromLegacy` is unreachable for it. Such a record is parsed by `safeValidateSessionFile` instead: `frontier`'s default supplies an empty list, the now-unknown `currentActivity` key is stripped by the non-strict object, and the session resumes **with no position at all** — the first transition then reads as a session's first call and silently skips retiring the activity that was in flight. The criterion needs a different mechanism on the `session.json` read path, or an honest restatement that pre-frontier records do not resume. The converter itself is a KEEP: it has a live `start_session` caller at `resource-tools.ts:211` and four legacy folders still convertible only by it.

---

## Cluster A — the unexecutable fan-out vocabulary

The whole cluster rests on one fact I re-derived from the corpus rather than from the design: **`orchestration-patterns::dispatch-workers` is bound 15 times across 7 files, and neither of its two branches can execute at any of them.** `spawn-agent.md:44-46` denies a spawned agent the dispatch primitive; `orchestrator-conduct.md:14` and `workflow-orchestrator.md:35` say orchestrators never execute activity steps. Its sequential branch applies `spawn-agent` (`dispatch-workers.md:29`) and its parallel branch `spawn-concurrent` (`:30`) — both dispatch primitives. So the delivery plan's tier-four instruction to keep the operation with *"its in-activity sequential contract stated positively"* (`delivery-plan.md:306`) **has no contract to state.** That is a correction the plan owes.

The binding split, which the plan does not make and which drives the whole sequencing:

| Where | Bindings | Migratable in the staged plan? |
|---|---|---|
| `cicd-pipeline-security-audit/activities/03-primary-scan.yaml` (lines 27, 50, 56, 62) | 4 | Stage 7 — this is the adoption target |
| `substrate-node-security-audit/activities/03-primary-audit.yaml` (48, 75, 81, 87) | 4 | **No** — `delivery-plan.md:267` puts it out of scope |
| `substrate-node-security-audit/activities/02-reconnaissance.yaml` (37, 49) | 2 | **No** — same |
| `meta/activities/patterns/01, 02, 04, 05` | 5 | Yes — nothing borrows them |

`rg -n 'meta/patterns/|activities/patterns/' --glob '*.yaml'` returns **zero** across the whole corpus, and `workflow-loader.ts:59-94` does one non-recursive `readdir`, so the pattern subdirectory is never loaded into meta's graph. The library has no consumers but prose.

### REMOVE — the fan does this job now

**`meta/activities/patterns/01-orchestrator-workers.yaml`** is the only clean REMOVE in this cluster. Its verdict is "Served fully" (`delivery-plan.md:259`): three graph nodes, the gather's binding carrying across unedited. Every one of its five steps is fan-out; only `decompose-work-units` survives, in its own file, gaining a caller at the fan's source.

*Blast radius:* `patterns/README.md` rows 17 and 56-58; `schema-construct-inventory.md` rows 37 and 38. Three guard scripts deliberately recurse into the directory and would measure less — `check-binding-fidelity.ts:443`, `check-loop-shape.ts:126`, `check-set-action-values.ts:160`, each carrying a comment recording why. **One item no sweep carried:** `scripts/binding-fidelity-triage.json:322-328` suppresses `synthesise-results`' producerless `synthesis_criteria` under the `pattern-library-seed` rationale, whose text at line 7 reads *"A borrowable pattern activity binds an op whose input the BORROWING workflow seeds."* Retire the borrowable activities and that rationale stops being true — both suppressions need re-justifying, not merely surviving.

*If it goes without them:* canon row 38 keeps routing authors to a pipeline whose middle step does nothing, and the pattern has two homes — a library file and an inventory row — which is the coexistence the repo principle forbids.

**`meta/techniques/scatter-gather.md` — `parallelism-is-optimisation` (lines 38-40).** Its cost claim is backwards on the design's own arithmetic: a fan "pays a whole further delivery for every branch past the first… That is correctness and latency, not efficiency" (`README.md:58`). Calling concurrency an optimisation inverts that, and the parenthetical `concurrency = 1` mode selector dies with `dispatch_concurrency`. I verified exactly three sites: the home plus two `Honor` citers at `spawn-concurrent.md:38-40` and `orchestration-patterns/TECHNIQUE.md:60-62`. `## Rules` is at-most-once in the template (`check-technique-template.ts:60`), so an emptied section is legal to delete.

**`orchestration-patterns/TECHNIQUE.md` — `parallelism-is-optimisation` (60-62)** and **`spawn-concurrent.md` — `parallelism-is-optimisation` (38-40)**. The first constrains `dispatch_concurrency`, which has exactly one reader in the group (`dispatch-workers.md:16,18,29,30`), so its subject vanishes with the parallel selection. The second tells `dispatch-fan` — which gains `spawn-concurrent`'s first executable caller — that the concurrency is optional, and the fan's whole purchase is wall clock. *One correction to the sweeps:* `spawn-concurrent.md:40`'s "sequential fallback via spawn-agent remains valid" is **not** stale in itself — `dispatch-activity.md:55` applies `spawn-agent`, so a chain of plain graph edges *is* that fallback. What carries the removal is the duplicate home at `generic.md:26` plus the licence to forfeit the fan's only benefit.

**`design-principles.md:119` — the five-name parenthetical** *(orchestrator-workers, supervisor, plan-and-execute, isolated-fan-out, lead-researcher)*. Verified verbatim, with the authoritative README link immediately before it. This is a copy of a directory's contents inside the canon, and §34's own test (`:159`) names the coupling: *"A file that must change only to keep agreeing … is coupled to content it does not own, and the citation is what survives removing the copy."* The plan's stale-key list at `delivery-plan.md:198` names only §18, the inventory row and the patterns README — **this site is not on it.** §26's sentence and its README link stay; the parenthetical goes.

**`schema-construct-inventory.md:39` — the supervisor row** (PLAUSIBLE, not confirmed). `02-supervisor.yaml:50` binds `dispatch_concurrency: 1` over a one-element collection — and `DestinationSchema` refuses a list under two members, so **no fan can express this**. What supersedes it is a plain graph edge with `when` predicates, a construct that predates this design entirely. Marked PLAUSIBLE because deleting the row strands the informal pattern "supervisor / fixed specialist lanes" in a file whose universal obligation is that every construct have a formal answer; a one-line row pointing at the graph may be the honest fix.

### DEPRECATE — scheduled out, but a caller survives

The repeated error across the sweeps was treating these as same-change deletions. They are not, for one mechanical reason: **`src/tools/workflow-tools.ts:1212-1216` resolves every step's `technique:` ref through `composeActivityTechnique` at `get_activity` time, and `deriveArtifactContract` (`:122-145`) reads step technique outputs.** Deleting `dispatch-workers.md` therefore breaks activity *delivery* for three graph-reachable client activities, two of them `required: true` (`cicd .../03-primary-scan.yaml:14`, `substrate .../02-reconnaissance.yaml:23`). `check-all-refs.ts` walks only flat `techniques[]` lists, so **the guard suite would not catch it** — the failure lands at run time.

| Construct | Why it waits | Gating condition |
|---|---|---|
| `dispatch-workers.md` (whole operation) | 10 of 15 bindings in live graph-reachable activities | Tier-one migration of the two substrate activities |
| `dispatch_concurrency` (11 lines) | `cicd .../03-primary-scan.yaml:29` binds it by name; `check-binding-fidelity.ts` arg-conformance **exits 1** the moment the declaration goes while the binding stands | Stage 7 deletes that binding in the same commit |
| `scatter-gather.md` parallel arms (`:14`, `:17`) | Three live client activities declare the technique at activity level and carry **zero** loop steps, so the parallel arm is the only mode they can be using | Tier one. And see the plan conflict below |
| `one-gather-contract-two-scatter-modes` (`:22-24`) | **Only its third sentence and its name.** The first two sentences — one gather contract, a mode-independent combine — are what `delivery-plan.md:51`'s third mode is written to hang on, and what `README.md:2072`'s new join rule binds to. Zero external citers, so removal breaks no anchor | Stage 4 |
| `compose-worker-briefs.md` (5 bindings) | `README.md:2074` **explicitly retains it** ("it survives for fan-out inside one worker") — on a path `spawn-agent.md:44-46` denies a worker. A stated design defect, not licence to delete now | Tier four, after the defect is resolved |
| `patterns/README.md` — rows, partition (`:7`), concurrency lines (`:9`, `:58`) | The **file** survives: `03-plan-and-execute.yaml` stays in the directory and four canon surfaces link this exact path (`meta/README.md:29`, `design-principles.md:87`, `anti-patterns.md:1439`, `schema-construct-inventory.md:37`). `delivery-plan.md:306` says it "describes only what remains" — describes, not deleted. **Line 7's in-activity-only fence must stay**: after the fan it is what keeps the library off the session layer | Stage 6 |
| `02-supervisor.yaml`, `04-isolated-fan-out.yaml`, `05-lead-researcher.yaml` | Each carries a distinct precondition — see below | Tier four |
| `isolation_mode` + `isolation-mode-write-boundary` | `compose-worker-briefs.md:37` reads it and the design keeps that operation. Removing the group input breaks `04-isolated-fan-out.yaml:44` under arg-conformance | With `compose-worker-briefs` |
| `design-principles.md:87` (§18's routing sentence) | **Amend, do not delete.** `anti-patterns.md:1443` and `design-principles.md:157` both cite §18 as their remediation order; `gather-results` and `decompose-work-units` survive and gain callers | Stage 6 |
| `schema-construct-inventory.md` rows 38, 41, 42 | The informal patterns do not go away, and the file mandates a formal construct for each. Repoint at the graph fan. Only row 38 is on the plan's list — 41 and 42 are unscheduled. **Row 43 (`invoke-as-tool`) must not be swept in** | Stage 6 |
| `synthesise-results.md`, `classify-request.md` | Lose their only bindings with the pattern activities. `gather-results.md:44` names `synthesise-results` as the owner of combination, which the design's joins contradict by binding workflow-local combines — that pointer needs amending whichever way the decision goes | Tier four |
| `anti-patterns.md:1439` (AP-110 Detect arm two) | Its remedy points at the retired home | Stage 6 |

Three preconditions worth stating explicitly, because each is a capability question rather than a scheduling one:

- **`04-isolated-fan-out.yaml` withdraws a capability with no successor.** `README.md:2197`: *"worktree isolation is not served at all: the rule that a worker creates or uses its own worktree before mutating files is precisely what branches sharing one session tree cannot honour."* Unexecutable today too, so nothing regresses — but the corpus loses its only vocabulary for per-worker sandboxes. Record it as withdrawn, not migrated.
- **`05-lead-researcher.yaml` must not go before a round counter exists.** Its `maxIterations: 3` (line 64) is a schema-declared, loader-enforced ceiling; a graph cycle carries no equivalent. `delivery-plan.md:262` says "the declared iteration ceiling gives way to an authored round counter" — that counter does not exist yet. Retiring the activity first converts a bounded follow-up into an unbounded cycle.
- **`02-supervisor.yaml` is superseded by a graph edge, not by the fan.** Schedule it, but do not record the fan as the reason — the reason is what a future reader needs.

### The plan conflict this cluster surfaces

`delivery-plan.md:51` has `scatter-gather.md` **gain** *"the third scatter mode over one gather contract"* in stage 4. The design plans a three-mode file, where mode 2 has never been executable from any of its 7 call sites and mode 3 makes the equivalence claim false (`DestinationSchema` refuses fewer than two members, so a fan has no `concurrency = 1` case). Under *"prefer removing the thing that needs a prohibition"* the corpus should end with two modes, not three. **This is a proposal to change stage 4, not a consequence of it, and should be raised as one.**

---

## Cluster B — the scalar position

One field, `currentActivity`, and everything that reads it as the answer to "what activity is this call about". The design is unambiguous: *"The frontier is the run's only cursor: a scalar kept beside the list would be a second home for the run's position"* (`README.md:1015`).

Measured occurrence spread (lines, `rg -c`): `src/tools/resource-tools.ts` 24, `src/tools/workflow-tools.ts` 14, `src/schema/state.schema.ts` 6, `scripts/count-workflow-sessions.ts` 6, `src/utils/binding-provenance.ts` 4 *(a separate construct — `currentActivityId` provenance-index keys)*, `schemas/README.md` 4, `tests/fixtures/inspect-session/inspect_session.py` 3, `src/schema/session.schema.ts` 3, `src/utils/session/migration.ts` 2, `site/api/schemas.html` 2, and one each in `validation.ts`, `store.ts`, `resolver.ts`, `params.ts`, `logging.ts`, `session-file.schema.json`, `state.schema.json`, `site/design/session-store.html`, `scripts/generate-session-token.ts`. *(The design's "sixty-six references" counts occurrences across a wider set than my per-file line counts reproduce — needs confirmation if the figure matters.)*

**REMOVE, all in stage 5:**

| Construct | Blast radius | What breaks without the accompanying edits |
|---|---|---|
| `session.schema.ts:96, 205, 283` + `store.ts:121` | The write at `workflow-tools.ts:842`, exiting-activity read at 770, four gated validations at 736-747, `get_activity` at 1009, `yield_checkpoint` at 1634 *(one local feeding `getCheckpoint` and three refusal messages)*, `get_workflow_status` at 2179, three output-contract fields at 208/261/335, all 24 `resource-tools.ts` lines, `resolver.ts:135`, `migration.ts:182, 243`, `logging.ts:104` | On a three-branch fan the scalar holds whichever branch wrote last: `get_activity` serves one branch a sibling's body, `get_technique` resolves a step id against the wrong activity, and line 770 lands one branch's writes under a sibling's name. **Plus two artifacts no sweep's plan reaches:** `schemas/session-file.schema.json:42` and `site/api/schemas.html:133` are generated, and `tests/fixtures/inspect-session/inspect_session.py:61` is the Python parity oracle — it names the key literally, so the parity assertion in `tests/mcp-server.test.ts` fails unless edited in the same commit |
| `state.schema.ts:153-230` — the whole `WorkflowState*` cluster, plus `schemas/state.schema.json` | **Bigger than "generated and documented."** `schema-loader.ts:16` lists `'state'` in `SCHEMA_IDS` and `:9` types it on `AllSchemas`; `readAllSchemas` returns `err(...)` for the whole combined `workflow-server://schemas` resource if the file is absent; `schema-resources.ts:10` and `:49` describe it; `tests/schema-loader.test.ts` asserts it loads; `scripts/generate-site-data.ts:691` enumerates it; `src/index.ts:7` re-exports the module | An agent that fetches `workflow-server://schemas/state` — a resource the server advertises and the corpus's own inventory row 23 points at — is told the engine tracks one required current activity, while `session-file.schema.json` beside it carries the frontier. **Delete the file without editing `SCHEMA_IDS` and the combined resource errors for every caller.** I verified only the Zod-side cluster is callerless: `WorkflowStateSchema`, `createInitialState`, `validateState`, `safeValidateState`, `addHistoryEvent`, `NestedWorkflowStateSchema` appear nowhere outside `state.schema.ts` except `scripts/generate-schemas.ts:6,26`. `HistoryEntrySchema`, `HistoryEventTypeSchema`, `LoopStateSchema` and `CheckpointResponseSchema` in the same file are live and **must stay** |
| `validation.ts:14-21` `SessionView` + `resolver.ts:132-138` `sessionView()` | 8 call sites (`workflow-tools.ts` 604, 734, 1052, 1669, 1892, 2067; `resource-tools.ts` 740, 888). `view.act` read 9 times (`validation.ts` 34, 40, 45, 49, 240, 241, 243, 248, 251) — all inside two functions wired only at 928 and 748. **`view.wf` has zero readers tree-wide**; `view.v` is read only at 55-56 | The abstraction is already hollow and the fan makes `act` uncomputable — "the activity this call is about" becomes a per-call resolution, not a field of the record. **This contradicts the design:** `README.md:1002` places `heldActivity` *"beside the existing session view"* and never says what fills `act` once the scalar is gone. That is a hole in the plan, and the strongest form of the finding. Its own doc comment at `validation.ts:11` cites `session-resolver.ts`, a path that does not exist |
| `params.ts:68` — the dead `currentActivity?: string` member | Nothing. All five callers (`workflow-tools.ts` 597, 1007, 2114; `resource-tools.ts` 639, 869) pass a whole `SessionFile` | A mechanical rename carries a dead constraint into the new field name, so a reader concludes the checkpoint gate has something to do with the frontier. The body reads only `state.activeCheckpoint` |
| `validation.ts:304-316` — `MetaResponseSchema`, `MetaResponse`, `buildMeta` | **None.** Exactly three lines tree-wide; zero importers, zero tests, zero generated schemas; `src/index.ts` never re-exports `validation.ts` | It declares itself *"Response `_meta` envelope returned by every authenticated tool"* and admits two fields, three lines from `workflow-tools.ts:937` building `_meta` as an inline literal and `:948`/`:1597` adding `batch` and `exit_destinations`. The fan adds `_meta.barrier` and `_meta.fan` (`README.md:2155`). Already dead and already false; the fan only widens the gap |
| `resource-tools.ts:642-649` — `get_technique`'s bespoke position check | 642-649, 656-657, 662-704, 718-725, 760, 769-781, and the pair at 901-910 in `get_resource` | **It cannot be left alone — it will not compile.** But the sweeps' framing was wrong: this is not "one of two implementations". `get_activity` has **no** such check (`workflow-tools.ts:1009-1012` is a bare `if (!activity_id) throw`), so the duplication is a description of the post-fan state if both are written separately. Schedule it *with* the scalar removal, not as an independent finding. Its failure mode if left as a scalar comparison: on a three-instance fan it refuses two of three correctly-dispatched workers and admits the third by write order |
| `docs/`, `site/` and generated statements | See the documentation sub-cluster below | — |

**DEPRECATE in this cluster:**

- **`currentTechnique`** (`session.schema.ts:97, 206, 284`; `store.ts:122`). Written at `resource-tools.ts:795, 830`; read at exactly one place, `workflow-tools.ts:209` inside `projectIdentity` — a live output-contract field, and pinned by `inspect_session.py:61`. **The frontier tracks activities, not techniques**, so nothing new answers "which technique was most recently fetched"; this is not two paths doing one job. Its dishonesty is also pre-existing — it already means "most recently fetched by anyone" across a batched worker's sequential fetches. Schedule it out onto the `technique_fetched` event stream, which carries techniqueId, stepId, agentId, chars and delivery *per agent context*.
- **`get_activity`'s parameterless-only contract** (`workflow-tools.ts:989`, `1009-1012`). The description says verbatim *"load the current activity definition (from session state — no activity_id)"*. What retires is the **exclusivity** and that sentence — not the calling convention, which `heldActivity`'s sole-entry arm retains for every ordinary walk (`README.md:1007-1012`).
- **`activityGraph` (`activity-variables.ts:540-546`) versus `exitDestinations` (`workflow-loader.ts:506-508`)**. Each has exactly one production caller — `check-activity-variables.ts:233` and `validation.ts:45` respectively. Post-load they are set-equal, but they differ in *ordering*, which is pinned by fixtures (`tests/workflow-loader.test.ts:394-395` asserts `['next','other']` vs `['other','next']`; `tests/activity-variables.test.ts:184` asserts `activityGraph`'s own order). The fan turns a latent duplicate into a maintained one: stage 1 adds a flattening helper to the loader and stage 2 makes the graph builder flatten independently, **with a de-duplication-after-flatten ordering requirement the loader's version does not carry** and which `delivery-plan.md:31` says is caught only by a fixture. Retire `activityGraph`'s independent `Object.values(graph[...])` read in favour of the loader's single derivation; `exitDestinations` keeps its caller and stays.

**REMOVE outright: `SessionFile.exit`.** `session.schema.ts:99`, written once at `workflow-tools.ts:843` (`draft.exit = exit ?? ''`), slotted in `TOP_LEVEL_KEY_PRIORITY` at `store.ts:123`, reconstructed by `migration.ts:187, 245`. **It has no reader anywhere in `src/`** — I traced `projectIdentity` (198-217), `projectSummary` (502-514), every arm of `projectSessionView` (522-543) and `sessionView`, and it is in none of them; every other `.exit` hit in the file is on a binding, an effect or a manifest entry. The per-activity truth is already recorded twice, in the `activity_exited` event and in each manifest entry's own exit. Sealed, canonicalised, migrated state that nothing consults, whose value under a fan is decided by relay order. Dropping the key from the ordering is safe: `verifySeal` (`store.ts:474-497`) compares against the exact bytes read from disk and `SessionFileBaseSchema` is a plain `z.object`, so an in-flight file verifies, parses with the key stripped, and re-seals on the next write.

**The three session readers outside every stage's file list.** Stage 5's principal files are the eight under `src/`. These three read `currentActivity` and are in none of them:

- `scripts/count-workflow-sessions.ts` (`npm run sessions:census`) — declares the field at 41 and 49, populates it at 67 as `str(node.currentActivity)`, prints it at 127. The coercion at line 54 is `(v: unknown): string => (typeof v === 'string' ? v : '')`, so **an array-valued frontier yields the empty string and every running session prints `(none)`** — and reads as a clean result. `docs/development.md:359` documents this as the pre-landing safety check.
- `tests/fixtures/inspect-session/inspect_session.py` — lines 61, 109, 166.
- `scripts/generate-session-token.ts:173` — writes `currentActivity: ''`.

None throws. All three go quietly wrong.

### The documentation sub-cluster

These are statements the fan falsifies, in files the plan's stage table does not list. Ordered by how load-bearing the reader is.

| Site | Statement (verified verbatim) | Verdict |
|---|---|---|
| `site/specs/workflows.html:219` | *"Only one activity is current at a time."* | **REMOVE** — the flattest contradiction of the fan in the repository. `README.md:18` puts one frontier entry per branch |
| `README.md:24-25` | *"The agent moves through activities in order"* / *"Work proceeds activity by activity"* | **REMOVE.** `tests/docs-drift.test.ts:11-12` explicitly exempts `README.md`, so no guard reads it. Mirror at `site/index.html:186` |
| `docs/artifact-management-model.md:35` | *"Ordering artifacts by name then orders them by the activity that wrote them, and two activities cannot collide over one filename."* | **REMOVE.** Falsified by the **instance** fan only — a list fan's branches carry distinct filename-derived prefixes (`workflow-loader.ts:163-168`), but one activity fanned N ways shares one prefix and one contract. This is a safety invariant the new `fan-artifact-collision` guard mechanises; leaving it standing means the guard contradicts the model it enforces, and an author reading this page has no reason to token-template a fanned activity's artifact name. That is data loss. Verified the guarantee appears in exactly one file — `site/specs/artifact-management.html` does not repeat it, so no site mirror is owed |
| `docs/state-management-model.md:125` | *"An orchestrator that keeps one call in flight per session never meets this."* | **REMOVE**, but argue it precisely: the sentence is not false of the orchestrator's own calls, which stay serialised. The callers that meet `STALE_WRITE` are the branch **workers**, and the sentence tells a disciplined orchestrator that a refusal in its log means it was undisciplined. `README.md:1196` classifies that refusal as ordinary. Line 118 ("the current activity and technique") also goes. The plan counts this file at 1 statement; lines 3, 71, 82-83 and 118 are four |
| `docs/api-reference.md:39, 49, 50` | `get_workflow_status` / `next_activity` / `get_activity` rows | **REMOVE.** Row 49 lists parameters `session_index, activity_id, manifests?` and return `activity_id, name` — both change. Row 50 says *"Worker load for the current activity"* and *"names the activity each declared exit leads to"* |
| **`scripts/generate-site-data.ts:347, 374, 378`** | *"plus the current activity and completed steps"* / *"read its destination from the `graph`"* / *"No `activity_id` parameter — the server reads it from session state"* | **REMOVE — and this is the one the plan genuinely misses.** These are hand-maintained and are the **source** of the generated `site/api/tools.html`. Only line 374 matches a stale-restatement key; 347 and 378 match no key in the plan. So `npm run build:site` would faithfully regenerate a false page |
| `schemas/session-file.schema.json:42` + `site/api/schemas.html:133, 186` | `currentActivity` with `"default": ""` | **REMOVE.** `docs/state-management-model.md:127` nominates the JSON as the shape that will not drift. **The silent-failure path is verified:** `generate-site-data.ts:690-694` (`renderSchemasRegion`) reads the *committed* `schemas/*.schema.json` off disk, not the Zod sources — so a missed `npm run build:schemas` followed by `build:site` regenerates the page faithfully from stale JSON and `tests/site.test.ts` stays green. A missed `build:site` fails loudly; a missed `build:schemas` fails nothing |
| `site/design/session-store.html:128`, `site/design/request-lifecycle.html:148, 155` | The Position row naming `currentActivity` first; *"`activity_exited` for the activity being left, `activity_entered` for the new one"*; *"`next_activity` returns just the new activity's id and name"* | **REMOVE.** `docs/documentation-system.md:13` makes `site/design/` a same-change obligation; no `site/design/` page appears in the plan. `renderSitePages()` regenerates only nav and breadcrumbs, so `tests/site.test.ts` never reads the prose |
| `schemas/README.md:214-218` | `string destination FK` in the `ExitBinding` erDiagram block | **REMOVE** — one attribute line. **Do not bundle the neighbours:** `ExitBinding \|o--\|\| Exit` is not falsified (one binding still gives a destination to one exit), the `stateDiagram` chain stays legal, and the flowchart node asserts no arity |
| `docs/dispatch-model.md:39, 122` | *"a session that has not yet entered an activity reports no current activity"* / *"`current_activity`: The activity the sub-agent is executing"* | **DEPRECATE.** The plan schedules this file **additively** ("gains the fan section"), so these survive underneath. Lines 11 and 108 are *incomplete*, not stale — they stay true of every non-fan dispatch and of a replaced branch worker |

---

## Cluster C — destination-as-string

Small, sharp, and entirely stages 1–2.

**`ExitBinding.to: string` (`workflow-loader.ts:481`) and its five consumers.** The doc comment names only "an activity id, or TERMINAL_SENTINEL". `to` is populated at `:502` from `bound[e.id]!` off a record typed `z.record(z.record(z.string()))` (`workflow.schema.ts:51`), so **TypeScript catches none of the widening**. Verified readers: `workflow-loader.ts:507`, `validation.ts:250-251`, `workflow-tools.ts:1431` (the header map, also surfaced at `:1597` in `_meta`), `:1910` (checkpoint consequence), `:2088` (exit payload), `:2092` (the immediate-exit message).

Only `:2092` is a template literal, so only that one mangles: a worker is handed *"whose next target is 'research,codebase-comprehension,implementation-analysis'"*. The other two are JSON fields where a widened value serialises structurally — a response-shape change, not a mangled string. `delivery-plan.md:35` already names all four sites plus the header; `:132` makes *"no rendered message anywhere interpolates a destination directly"* a stage-2 criterion. **Stage 2, accompanying.**

**Two private `Graph` copies: `scripts/check-review-mode-gating.ts:87` and `tests/e2e/walker.ts:53`**, both `Record<string, Record<string, string>>`, with `scripts/smoke/smoke-orchestrator.ts:29` importing the walker's. Neither *fails to compile* against a widened schema — both parse raw YAML and assert the shape, so each stays valid on its own terms while describing something that no longer exists.

*What breaks if they stay:* the hard-zero review-mode guard's `graph[act.id]` lookup returns undefined for a list or object destination, and **the whole subtree beyond a fan drops out of its reachability set — it passes because it stopped looking**. The walker sends a non-string where the tool requires a string, throws, and fails the coverage job's no-walk-errored assertion. Both files already import from `src/schema/`, so importing the destination type is a one-line change. *Scope discipline:* both also carry private `ActivityDef`/`ExitDef`/`StepDef` copies which the fan does **not** touch — remove only `Graph`. **Stage 2, and it must precede any corpus fan.**

**`CHECKPOINT_INSTANCE_SEPARATOR` and `checkpointBaseId` (`workflow-loader.ts:449-455`).** The cleanest removal in the whole set, and the design already schedules it: the separator generalises into `INSTANCE_SEPARATOR`, `baseId` and `instanceIndex` (`README.md:932-958`), with *"No compatibility alias."* I re-derived the call sites independently and they match the design exactly: `workflow-loader.ts:453` (inside the function), `:473-474` (`getCheckpoint`'s base comparison), `validation.ts:89` (`immediateExitCut`), plus the import at `validation.ts:6` and the test import at `tests/workflow-loader.test.ts:13` with assertions at 243-246. The constant has no reader outside its own function body. `delivery-plan.md:125` requires the helpers be tested over both populations and that the retired helper have no surviving alias. **Stage 1, accompanying.**

---

## Cluster D — dead on arrival

Real, worth fixing, and **not fan consequences**. State them on their own footing or the record misattributes the reason.

- **`site/specs/checkpoints.html:176`** — the `checkpoint_handle` paragraph. `rg -l 'checkpoint_handle'` returns **exactly one file** in the whole repository. `docs/checkpoint-model.md:19` and the site's own generated `present_checkpoint` entry (`generate-site-data.ts:394`) both state the opposite. Value as evidence that the hand-authored site tier drifts one construct per model with nothing to catch it.
- **The `transitions` vocabulary.** No activity field by that name exists — `activity.schema.ts:303` declares `exits`. And it is **not confined to the site**: `src/tools/workflow-tools.ts:696` describes `next_activity` as taking *"an id from the current activity's transitions"*, and `src/resources/schema-resources.ts:7-8` describes the activity and condition schemas the same way. Those are live wire descriptions agents read. Site sites: `workflows.html:217`, `protocol.html:77`, `state-management.html:77/117/125`, `guide/definitions.html:114`, generated `api/tools.html:282`.
- **`grammar/README.md` and `constraints/README.md`** — TBD rows for "activity sequencing" and "transition validity", plus *"A future validator can implement these constraints directly in TypeScript"*. Neither file appears in `docs/documentation-system.md`'s source map, and neither carries the not-implemented disclaimer `docs/orchestra-specification.md:3` has. They read as live specification work advertising formalisation of exactly the layer the fan changes.
- **`site/design/session-store.html:139`** — *"twenty-three event types in all"*. I counted the enum: **32** (`workflow_started` … `progress_published`). Pre-existing, wrong by nine, and it violates the documentation system's own no-brittle-counts convention. A fan adds no event type, so **this is not a fan consequence** and must not be carried as one.
- **`tests/docs-drift.test.ts` exists** — correcting a claim that surfaced in more than one sweep. It walks `docs/`, `site/` and `scripts/generate-site-data.ts` with four narrow patterns (session_token, Skill vocabulary, MCP tool tallies, ghost paths) and exempts `README.md`. So the slot for a mechanical check on this whole class is **unfilled, not absent**.

---

## What merely changes — narrowed, not dead

Do not file these as removals. Each keeps a job in reduced scope, and deleting one is the confident-implementer error.

| Construct | What narrows | What survives and why |
|---|---|---|
| `scatter-gather.md` — `accumulate-never-overwrite`, `isolation-then-combine`, `order-is-preserved` | All three name *"parallel mode"* and *"across instances"*, which is the path being removed | The **sequential** grain still needs them: a `forEach` body writing a per-iteration scalar into the parent bag, where no guard sees the clobber. `README.md:1171` cites `scatter-gather.md#isolation-then-combine` by dotted address from the source that implements the wrap. Reword; do not delete |
| `spawn-agent.md:46` — `depth-1-only` para 2 | Only the phrase `concurrency = 1` | *"Parallel scatter is available only where the dispatch primitive is"* is the design's own cited sanction (`README.md:1202`, `:1357` — *"This is that construct"*). It **acquires a mechanism** rather than losing a subject. Deleting it deletes the design's justification, and breaks L14 and D3 |
| `variable-binding.md` — `outputs-by-name-and-path` | Fanned activities stop resolving by its prescribed form | True for every un-fanned activity, which is the whole corpus. And AP-133's own Fix says to state the precedence in the *narrower* entry — which is the fan rule stage 4 **adds**. This entry may need no edit at all |
| `orchestration-patterns/TECHNIQUE.md` — `isolation-then-combine` (`:52-54`) | Drop the five-word *"for parallel fan-out"* qualifier | It is a **citation** to a surviving home, and the operations in the bucket still run work units inside one worker where the invariant is a convention an actor honours. `gather-results` is bound live at two client sites |
| `orchestration-patterns/TECHNIQUE.md` — `prefer-activity-composition` | Only its pipeline-home clause | Its **second sentence** — *"These ops do not `Apply` sibling orchestration-patterns operations for work"* — is the atomic-techniques invariant (§25/§26), which the fan does not touch |
| `anti-patterns.md:1441` — AP-110's fan-out carve-out | Must name `dispatch-fan` | **It gains a subject rather than losing one.** Two layers still stand: session-level graph dispatch (now `dispatch-activity` *and* `dispatch-fan`) and work units inside one worker |
| `docs/checkpoint-model.md:28` | Narrowed inside a fan by T5 | The adhoc-yield grant has a live caller for every non-fan worker: `workflow-tools.ts:1645` builds it and `:1887`/`:1955` serve it with `declared: false` |

---

## The KEEPs — what a confident implementer would delete by mistake

**`meta/activities/patterns/03-plan-and-execute.yaml`** and its three operations. Four independent discriminators, all re-derived:

1. It binds **no dispatch** — `plan-steps:31`, `execute-plan-step:59`, `replan:73`, `execute-plan-step:84`, every step in the caller's own context.
2. Its `forEach` **accumulates across iterations** (`execute-plan-step.md:46`: *"Append `{step_result}` onto `{prior_step_results}` … Downstream loop iterations and replan read the accumulated history"*). A fan structurally forbids that — branches land in isolated dense slots and no branch can read a sibling's.
3. It holds a hard `plan-confirmed` checkpoint (lines 32-47), which a fan branch may never reach (`README.md:523`).
4. **It is the one pattern activity that does not declare `scatter-gather` at all** — I checked all 26 declaration sites and this file is not among them. The cleanest single discriminator between it and the four beside it.

**`orchestration-patterns::invoke-as-tool`.** Zero YAML bindings, and that is *not* evidence of death: `binding-fidelity-triage.json:5` states the repo's own policy — *"having no consumer inside the corpus is the expected state of a library, not a broken seam."* The fan does not serve agent-as-tool: a graph edge dispatches a full activity with exits, artifacts, usage and bag writes, whereas this returns only `tool_result` and explicitly discards the transcript (`:38`). The design mentions it **nowhere** in either planning document, and inventory row 43 is the only home for the intent. Its real defect is placement — `patterns/README.md:22` and row 43 route an author to a bind site no worker can execute — which is fixed by moving the recommended site, not by deleting the operation.

**`effort_cap`** (`orchestration-patterns/TECHNIQUE.md:24-26`). `README.md:2074` calls it *"the authored upstream half of the width bound"* — the design assigns the collection-length cap at the source and the fan's ceiling at the destination to **different quantities**, and `README.md:1802`'s ceiling refusal points at it by name. It is the only authored bound on how much work a decomposition emits.

**`challenge.md:27`** — *"the mode available to this context follows `depth-1-only`"*. Verified all seven bind sites (`work-package/activities` 02:194, 04:154, 05:100, 06:132, 07:91, 08:176, 15:98), every one declaring `scatter-gather` and carrying loop steps. This is the one sentence telling a **worker** which scatter mode is its own, and after the fan there are genuinely two ways to get per-perspective isolation. Reword its anchor phrase; do not delete.

**`validation.ts:33-52` — `validateActivityTransition`.** Not a duplicate of `validateReportedExit` in either direction: `exit` is optional on `next_activity` (`workflow-tools.ts:700`) and T2 requires it only off a fanning exit, so on every ordinary transition with `exit` omitted this is the **only** graph-consistency check that runs; and it never warns on the wrong-exit-name case the other exists for (`validation.ts:251`). Its `!view.act` arm is **BF-09**, a named requirement with three of its own tests (`tests/validation.test.ts:126-149`). *But it acquires a genuine new false positive:* an empty frontier cannot distinguish "nothing has run" from "the run finished", so a stray call on a completed session would newly warn about the initial activity where today `currentActivity` holds `__terminal__`, `exitDestinations` returns `[]`, and it returns null (pinned by `tests/validation.test.ts:85-90`). The initial-call flag must come from the handler's own resolution step 1. **A fix the plan owes, not a removal.**

**`activity_manifest`'s `activity_id` and `exit` members** (`workflow-tools.ts:60-64, 702`; `validateActivityManifest` at `validation.ts:262-285`; recording loop at `782-799`). The manifest is cumulative and re-sent — the comment at 777-781 says so outright — so its entries name activities retired on *earlier* calls, which neither `from_activity` nor the call's own `exit` can address. And `validateActivityManifest:276-280` checks `entry.exit` against *that activity's own* declared exits, a different fact from the graph binding `validateReportedExit:246-252` checks. The composite id lands in the plain string field unchanged and the dedup set keys on it verbatim, so three instances produce three distinct `activity_outcome` events.

**`ActiveCheckpoint.activityId`** (`session.schema.ts:42-62`). Stays single-slot because L9 fails the load on any branch declaring a checkpoint step and T5 refuses an undeclared gate yielded mid-fan, so exactly one activity can ever hold a decision. Widening it makes representable a state those two rules exist to prevent. *One radius correction:* the read that repoints is `workflow-tools.ts:1634`, and that single local feeds `getCheckpoint` **and three refusal messages** — five uses in one handler.

**`EmbeddedSessionRef.triggeredFrom.activityId`** (`session.schema.ts:25, 238-241`). T6 refuses a child dispatch mid-fan and L14's second arm fails the load on a fanned activity binding the child-workflow operation, so the field stays single because the operation does. Four reads repoint: `resource-tools.ts:549, 556, 598, 605`.

**`src/utils/fan-out.ts`** — a **nominal collision only**. Its sole import is `Technique`; "fan-out" here is the reach of a container's declarations across the operations beneath it (rule entries, rule chars, inherited I/O items), and it reads no graph, no destination and no session record. Live, with four consumers in `scripts/run-batch-benchmark.ts` (72, 194, 262, 277). The argument for naming the new derivations for the graph (`destinationTargets`, `isFan`, `branchKey` in `workflow.schema.ts`, where the design puts them) rather than for the word they share.

**`gather-results.md`, `decompose-work-units.md`, `assess-research-gaps.md`, `plan-research-questions.md`** — the half of the vocabulary the fan makes *live*. `gather-results` has never had an executing caller and gets one at every fan's meeting point; its declared input shape (`:12-18`) is already a branch container. `decompose-work-units` binds no dispatch and its output contract (`:22-24`) is exactly a fan's collection. `plan-research-questions` is charged under `duplicate-shared-capability`, whose Detect clause at `anti-patterns.md:1439` requires *"a NON-META technique's Protocol"* — both operations in the pair are meta ops in one group, so the family does not reach them.

**The loop step** (`schema-construct-inventory.md:47`) and **AP-10 `loop-not-prose`**. The trap. An instance fan borrows the loop's exact vocabulary — the collection and the item name — and none of its job: *"it is not a loop step wearing a graph's clothes … There is no continuation test, no early exit, no nesting, no body"* (`README.md:387`). The arithmetic favours the loop: one worker looping N times pays a single delivery. And it runs today, everywhere — `prism/activities/02-adversarial-pass.yaml:19-36` is a live `forEach` over `analysis_units` with `scatter-gather` declared and no dispatch anywhere in it. The **Graph row directly below it (`:48`) is being amended**, so an editor working that table sits one row from a construct that must not move.

Also KEEP, briefly: `orchestrator-conduct.md`'s `one-level-of-indirection` (a fan widens the *breadth* of one level; `03-dispatch-client-workflow.yaml` binds nothing that spawns concurrently, which is the single bind site the design relies on); `agent-conduct.md:32-34`'s `checkpoint-discipline` (reaches an actor with no standing to act on it, so it wants a fan clause, not deletion); `AP-138 output-without-destination` (survives, and its Detect already admits a same-named downstream input, which the design's own gather examples satisfy — the exposure is a fanned member whose name is *not* a downstream input id, and its Fix is destructive); `docs/resource-resolution-model.md:149-155, 178-180` (the per-agent-context ledger is the reason the fan needs no delivery work — `dispatch.ts:30-38` keys on scope alone, so a fresh branch identity reads an empty ledger by construction); `docs/dispatch-model.md:67-110` (the batch bound is per delivery scope and never limits fan width — two bounds, two jobs, and the config home is `src/config.ts:156, 164, 165`); `docs/workflow-fidelity.md:20-36` (`README.md:1100` keeps L3 and L4 **advisory** on purpose, because unwidened they warn on every fan transition); `schemas/README.md:31` (the enforcement row is correct as written for the same reason — the refusals stage 5 adds are fan-scoped additions beside it, not a reclassification).

Four candidates were **withdrawn** and should not be resurrected: `activity_redelivered` (`priorDeliveryScope` at `dispatch.ts:70-77` filters `e.activity === activityId`, and `README.md:2150` names the N−1 misfire as the design's *counterfactual*); `AP-128 unproduced-value-read` (its Detect anchors on a **gated producer** and traverses forward, so a fan parameter with no producer at all is never reached — the exposure belongs to `binding-fidelity`'s orphan-input check, which stage 4 already teaches); `docs/orchestra-specification.md:5` (*"where each outcome leads"* is the exact construction `README.md:11` uses for the post-fan system); and the frontier conversion inside the legacy converter (not a separable construct — `migration.ts:243` must change either way).

---

## Sequencing against the seven stages

| When | What | Why that slot |
|---|---|---|
| **Before stage 1** | Nothing | No removal precedes the schema |
| **Stage 1, accompanying** | `CHECKPOINT_INSTANCE_SEPARATOR` + `checkpointBaseId` | The generalised helpers replace them; `delivery-plan.md:125` requires no surviving alias |
| **Stage 2, accompanying — must precede any corpus fan** | `ExitBinding.to: string` + 5 consumers; both private `Graph` copies | Unflattened, the review-mode guard silently stops looking and the walker throws |
| **Stage 4, accompanying** | `one-gather-contract-two-scatter-modes`' third sentence and its name | The third mode lands here; the gather-contract half is what it hangs on |
| **Stage 5, accompanying** | The whole scalar-position cluster: `currentActivity`, `SessionView`/`sessionView`, `params.ts:68`, `MetaResponseSchema`, `get_technique`'s position check, `SessionFile.exit`, the `WorkflowState*` cluster + `schemas/state.schema.json` (with `SCHEMA_IDS`), `activityGraph`'s independent read | These do not compile once the field goes. **Add to stage 5's file list:** `scripts/count-workflow-sessions.ts`, `scripts/generate-session-token.ts`, `tests/fixtures/inspect-session/inspect_session.py`, `scripts/generate-site-data.ts`, and a `build:schemas` + `build:site` regeneration |
| **Stage 5, accompanying (docs)** | `site/specs/workflows.html:219`; `README.md:24-25`; `docs/artifact-management-model.md:35`; `docs/state-management-model.md:118, 125`; `docs/api-reference.md:39, 49, 50`; `generate-site-data.ts:347, 378`; `session-file.schema.json:42`; the three `site/design/` clauses | Every one is falsified by the frontier, and none is in a stage file list |
| **Stage 6, accompanying** | `parallelism-is-optimisation` ×3; `design-principles.md:119`'s parenthetical; `patterns/README.md` rows + `:9` + `:58`; `design-principles.md:87`; inventory rows 38/41/42 (+39, PLAUSIBLE); `AP-110`'s Detect arm; `docs/dispatch-model.md:39, 122` | Stage 6 is when the fan executes, so this is when the canon can honestly point at it. `delivery-plan.md:181` — *"no row claims a layer another row now owns"* — is the criterion that reaches them |
| **Stage 7 or after (tier one)** | `dispatch_concurrency`; `dispatch-workers.md`; the `scatter-gather` parallel arms | **Hard-ordered.** Removing the `dispatch_concurrency` declaration while `cicd .../03-primary-scan.yaml:29` binds it fails `check-binding-fidelity`'s arg-conformance and exits 1. Stage 7 deletes that binding. The substrate sites are out of the staged plan entirely, so `dispatch-workers.md` cannot be deleted until they migrate — `get_activity` resolves their step technique refs at delivery time and `check-all-refs.ts` would not catch the break |
| **Tier four (unscheduled)** | `02-supervisor`, `04-isolated-fan-out`, `05-lead-researcher`; `compose-worker-briefs`; `isolation_mode` + `isolation-mode-write-boundary` + `workers-see-briefs-only`; `synthesise-results`; `classify-request` | Each carries a precondition: a round counter for 05, an acknowledged capability loss for 04, resolution of the design's own contradictory keep for `compose-worker-briefs` |
| **Independent of all seven** | `checkpoint_handle`; the `transitions` vocabulary (**including `workflow-tools.ts:696` and `schema-resources.ts:7-8`**); `grammar/`+`constraints/` TBD tables; `session-store.html:139`'s event count | Pre-existing drift. The fan is the occasion for a sweep, not the cause. Argue each on its own footing |

**Counts I could not independently reproduce.** The plan's first stale key claims *"28 authored statements across 15 files, plus 3 generated: 31 sites across 18 files"* (`delivery-plan.md:196`). My grep over its seven listed phrasings hit **10 files**, not 18 — the arrow characters in *"exit id → destination"* and some phrasings differ from what I could construct without dynamic-shell constructs. **Needs confirmation before the count is carried into a change manifest.** Likewise `README.md:1015`'s *"sixty-six references to the run's position"*: my per-file line counts total roughly 50 in `src/` (plus 6 in `state.schema.ts`), so the design is counting occurrences over a wider set than I reproduced.

---

## Investigation detail

Five sweeps ran concurrently over separate surfaces. Every candidate each produced was put to an agent instructed to refute it from the repository rather than from the sweep's own reasoning, so a surviving verdict is one that was re-derived independently and a withdrawn one is recorded rather than deleted.

| Surface | Verified outcome — act on this | Candidates, before refutation |
|---|---|---|
| The corpus fan-out vocabulary | [corpus-vocabulary](verification/corpus-vocabulary.md) | [sweep](sweeps/corpus-vocabulary.md) |
| Server code the fan replaces | [server-code](verification/server-code.md) | [sweep](sweeps/server-code.md) |
| Rules the fan makes redundant | [canon-rules](verification/canon-rules.md) | [sweep](sweeps/canon-rules.md) |
| Documentation describing the superseded model | [docs-and-site](verification/docs-and-site.md) | [sweep](sweeps/docs-and-site.md) |
| What the design itself should not be adding | [design-itself](verification/design-itself.md) | [sweep](sweeps/design-itself.md) |

Measured against the [parallel-activities specification](../2026-09-09-parallel-activities/README.md) and its [delivery plan](../2026-09-09-parallel-activities/delivery-plan.md).
