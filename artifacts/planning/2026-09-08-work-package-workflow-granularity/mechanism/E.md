# E. Can the orchestrator hold two live child sessions at once

# Verdict up front

**(iii) They need a server change.**

The line behind it is a comment the server wrote about itself: `src/tools/workflow-tools.ts:1514` — *"the session store is last-writer-wins over the whole file."* Structurally that is `src/utils/session/resolver.ts:197-200` (`replacePath(loaded.topState, …)` against a load-time snapshot, then a whole-file write) plus `src/utils/session/store.ts:328-338` (write state, write seal; no lock, no version, no precondition), plus `src/tools/resource-tools.ts:593-595` (the child's slot, and therefore its identity, derived from a stale `.length`).

The two halves answer differently, so take them separately.

## Half one — *starting* two children

**Passes the definition layer. Fails the server.**

Nothing in the corpus gates a second dispatch. `dispatch_child`'s own description says a persistent parent "appends a second child instead" (`src/tools/resource-tools.ts:451`), the handler contains no `assertNoActiveCheckpoint` and no status check (`:464-626` — compare `get_technique` at `:651` and `get_activity` at `workflow-tools.ts:1025`, which do), and the session schema is recursive so a second slot is representable.

Whether the *caller* can issue two `dispatch_child` calls in one turn **cannot be settled from this corpus.** The only evidence is an authored instruction: `workflows/meta/techniques/harness-compat/claude-code.md:26` — "Emit multiple `Agent` calls in a single response turn; the harness executes them in parallel." That is a claim about a tool surface, written in a markdown file the server delivers. What would settle it: a recorded trace or transcript showing two `dispatch_child` events against one parent with overlapping timestamps, or the harness's own parallel-tool-call documentation.

What *is* settled from code is that it does not matter, because the server does not care whether they arrive concurrently — if they do, it hands back **two children carrying the same `session_index`** and silently drops one. And I can settle the interleaving question at the library layer, which is the part people usually assume protects them:

`node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:342-343` dispatches every request as `Promise.resolve().then(() => handler(request, fullExtra))` and `_onrequest` returns immediately; `onmessage` at `:228-242` does not await it. **The SDK does not serialise requests on a connection.** Neither transport adds one: `src/transports/stdio.ts:11-15` is four lines, and `src/transports/http.ts:159` awaits `transport.handleRequest` per express request with no queue. So two tool calls arriving close together genuinely interleave at every `await`.

## Half two — both children *running*

**Fails unconditionally, at the storage layer, independent of the harness.**

Even in the lucky case where the two dispatches land in distinct slots, every subsequent tool call on either child reads the whole file, mutates one sub-state, and rewrites the whole file from its own snapshot. There is no mechanism by which both children's advances survive.

---

# Mechanism by mechanism

| # | Mechanism | Serialises? | Failure |
|---|---|---|---|
| M1 | Array-slot derivation | **No — it aliases** | Two children, one `session_index`; one child erased |
| M2 | Whole-file rewrite | **No — LWW by design** | Silent lost update of a child's entire state |
| M3 | The drive loop | **Yes, structurally** | Definition simply cannot express two |
| M4 | Delivery ledger on `agent_id` | Keys don't collide | Ledger entry lost → marker for bytes never sent |
| M5 | Step-manifest validation | No collision | Phantom fidelity warnings from lost history |
| M6 | `record_usage` | No collision | Dropped usage row; reported count exceeds disk |
| M7 | Trace accumulation | No collision — *unless M1 fires* | One bucket, one cursor, both children's events |
| M8 | Shared planning folder | **No — actively shared** | One README Progress table, LWW |
| M9 | Single worktree + git index | **Yes, by failing** | `index.lock` contention; non-fast-forward push |

## M1 — the array-slot derivation: does not serialise, it *aliases*

`newArrayIndex = parentState.triggeredWorkflows.length` (`resource-tools.ts:593`) reads the snapshot taken at `:466`. There is no reload between load and save.

Two `dispatch_child` calls whose loads both precede either write both see `.length === 0`, both build `childJsonPath = […, 'triggeredWorkflows', 0, 'state']` (`:594`), and `computeEmbeddedSessionIndex` HMACs `realpath(folder) + ':' + "triggeredWorkflows.0.state"` (`src/utils/session/derivation.ts:126-130`) — **byte-identical input, identical 6-char index for both children.**

Then the second `saveSessionForTool` (`:621`) writes `replacePath(loaded.topState, [], parentNext)` — a one-element `triggeredWorkflows` built from the stale tree. Child A is gone from the file, and the index the orchestrator holds for A now resolves to B's child.

The consequence depends on the workflow ids. Different ids: A's worker calls `get_activity`, which loads the workflow from `state.workflowId` (`workflow-tools.ts:1055`) and dies with `Activity not found: <A's activity>` (`:1057`). Same id: the two are **indistinguishable**, and both drive loops drive one child, each thinking it owns it.

No collision detector fires. `resolveSessionLocation` throws `COLLISION` only when it finds more than one match (`store.ts:570-576`); the clobber leaves exactly one.

And the outcome is **nondeterministic**. `loadSessionForTool` → `resolveSessionLocation` walks the entire planning tree with a `readSessionFile` per folder, recursively (`store.ts:472-522`) — dozens of awaits. If A's rename happens to land before B's walk reaches the folder, B sees `.length === 1` and gets slot 1 and a distinct index. Nothing makes that deterministic in either direction.

## M2 — the whole-file rewrite: last-writer-wins, and the code says so

`saveSessionForTool` re-inserts `newState` at `loaded.jsonPath` into `loaded.topState` — the snapshot from `resolver.ts:144-156` — and writes the whole file (`resolver.ts:197-200` → `store.ts:328-338`).

**I searched for every form of concurrency control and there is none.** No lock, mutex, semaphore, lockfile, ETag, revision counter, mtime check, or compare-and-swap anywhere in `src/`. `writeAtomic` (`store.ts:207-266`) gives *torn-write* safety via stage-fsync-rename — atomicity of one write, not isolation between two.

The field a CAS would need already exists and is dead: `LoadedSession.bytes` is "Raw bytes of the on-disk top file (pre-mutation)" (`resolver.ts:118-119`), populated at `:144`, returned at `:156`, and **read by no consumer anywhere in `src/`.**

The hazard is documented in three places, all describing exactly the problem this question asks about:

- `workflow-tools.ts:1513-1516` — *"Persist against a FRESH load, not the snapshot captured before composition: the session store is last-writer-wins over the whole file … saving the pre-composition snapshot would silently revert any concurrent write (sibling worker save, orchestrator checkpoint resolution) that landed in that window."*
- `workflow-tools.ts:1032-1037` — the batch-refusal save is placed with no await before it *"so it cannot revert a concurrent write the way a save against a pre-composition snapshot would."*
- `tests/batch-bound.test.ts:46-52` — a test that reads the source and asserts no `await` sits between the load and the refusal save, because *"the one that is wrong only loses a concurrent write under a race … a later edit that slips an await in front of it would reintroduce the lost update silently."*

So the mitigation in force is a hand-placed *narrowed window*, per call site, guarded by a source-scraping test. It is not a closed window. Even the tightest path — `record_usage`, load at `:1809`, save at `:1825` with only synchronous `advanceSession` between — still has, between the file *read* and the file *rename*: `canonicaliseJson`, `computeSeal` (awaits `getOrCreateServerKey`), `mkdir`, `open`, `writeFile`, `fh.sync()`, `rename`, directory fsync (`store.ts:333-336`, `:207-266`). Many event-loop turns. And two of the busiest handlers do **not** reload: `dispatch_child` (load `:466` → save `:621`) and `next_activity` (load `:716` → `loadWorkflow` at `:720` → save `:865`).

**Read-modify-write traced for two children at slots 0 and 1:**

1. Worker A: `next_activity(idxA)` → reads `topState₀`, navigates `tw[0].state`, mutates → `replacePath(topState₀, ['triggeredWorkflows',0,'state'], A′)` → writes a file with `tw[0]=A′`, `tw[1]=B@A's-read-time`.
2. Worker B: `next_activity(idxB)` also read `topState₀` → writes a file with `tw[0]=A@B's-read-time`, `tw[1]=B′`.
3. Whichever `rename` lands last owns the **entire file**.

What the loser loses is not one field. It is that child's `currentActivity`, `completedActivities`, its `history`, its `deliveredContent`, its `activeCheckpoint` — and the parent's own `history` and `triggeredWorkflows[i].status` besides. Three of those are load-bearing downstream:

- The **batch bound is derived from history** (`src/utils/batch.ts:72-123` reads `activity_dispatched` / `technique_fetched` / `resource_fetched` events). A lost write drops `activity_dispatched` events, so `batchActivities` undercounts and a worker is admitted past its cap.
- The **delivery ledger** loses entries (see M4).
- `activeCheckpoint` is the one **hard** gate (`workflow-tools.ts:723-728`). Losing it lets a transition through that should have been refused.

## M3 — the drive loop: this one really does serialise

`workflows/meta/activities/03-dispatch-client-workflow.yaml:31-116` is one `while` loop (`:34-39`) carrying exactly one of everything: one `client_session_index` (declared `:8`, passed at `:49`, `:60`, `:68`, `:76`, `:84`), one `current_activity` (primed `:29-30`, advanced `:100-102`, tested `:37-39` and `:112`), one `worker_agent_id` (`:44`, `:50`, `:86`, released `:105-109`), one `worker_result`. `client_session_index` is a scalar in the meta bag (`workflows/meta/workflow.yaml:60-62`), written once.

**What would have to change in the definition:** two independent `(current_activity, worker_agent_id, worker_result)` triples with a per-child dispatch and a join. The schema has no parallel step kind — `loopType` is `forEach | while | doWhile` (`src/schema/activity.schema.ts:156`), and both `forEach` and `maxIterations` are explicitly *"enforced by the executing agent"* (`:157`, `:161`), i.e. sequential-by-prose. Condition values are `string | number | boolean | null` only (`schemas/workflow.schema.json:153-160`), so loop state cannot be array-valued.

**Does the change reach the server?** For dispatch-and-gather, no — the corpus already owns the primitive. `workflows/meta/techniques/scatter-gather.md:12-18` defines parallel mode via `harness-compat::spawn-concurrent`; `spawn-concurrent.md:22-34` is dispatch-batch-then-await-all; `claude-code.md:24-27` is the harness binding. `isolation-then-combine` (`scatter-gather.md:30-32`) even states the right discipline: per-instance outputs are never auto-bound into the parent bag by name, *"which would race and clobber across instances."*

But the loop drives **activities**, and every activity a child takes writes the shared file. A definition-only change makes it fail faster, not safely. So: the definition change is necessary and insufficient.

## M4 — delivery ledger keyed on `agent_id`: keys don't collide, bytes do

`deliveryScope(state, agentId)` returns the per-call `agent_id` (`src/utils/delivery.ts:63-65`); `recordDeliveries` writes `draft.deliveredContent[scope]` on the **child's own** SessionFile (`:76-81`). Two children under distinct worker ids partition cleanly, and `delivery.ts:47-61` already explains why the scope is the agent rather than the session.

The collision is not in the keys — it is that both ledgers live in one file and M2 decides which survives. The benign direction re-delivers in full (wasteful). The direction that bites is the one `delivery.ts:55` names: the surviving ledger records a hash whose bytes the receiving context never got, and *"a marker is unreadable to a context that never received the bytes."*

## M5 — step-manifest validation: no collision, and advisory anyway

`validateStepManifest` and `validateTechniqueFetches` read the loaded child's `state.currentActivity`, `state.checkpointResponses`, `state.history` (`workflow-tools.ts:735-743`). Per-child; two children cannot cross-contaminate. Every manifest outcome is a warning folded into `buildValidation` (`:916-924`) — nothing hard-gates. But `state.history` is exactly what M2 loses, so a lost write makes `validateTechniqueFetches` report a fidelity gap that never happened. A false warning, not a wrong transition.

The one genuine hard gate here, `activeCheckpoint` (`:723-728`), is per-child, so two children *can* each hold a live checkpoint. That the orchestrator can only put one in front of the user at a time is a definition concern, not a server one.

## M6 — `record_usage`: no collision

Appends one `activity_usage` event to the child's own history, keyed by the caller's `activity` plus optional `agentId` (`workflow-tools.ts:1813-1824`). Different children write different sub-states. Failure is M2's: a lost write drops a row, and because the response's `usage_events` count is computed from `next.history` — the caller's own snapshot (`:1827`) — the number it reports can exceed what is on disk.

## M7 — trace accumulation: no collision, *unless M1 fires*

`TraceStore` is an in-process `Map` keyed on `sid` (`src/trace.ts:73-74`, `96-102`), where `sid` is `state.sessionIndex` — the child's own (`src/logging.ts:103-107`; `workflow-tools.ts:976-991`). Distinct indices, distinct buckets, distinct cursors. Nothing serialises.

But this is where M1 compounds: when both children share one index, their events land in **one bucket with one cursor**, and `getSegmentAndAdvanceCursor` (`trace.ts:108-114`) hands whichever child calls `next_activity` first a token containing *both* children's events — while the other child's segment has already been consumed and can never be emitted.

## M8 — the shared planning folder: not neutral, actively shared

`dispatch_child` returns `planning_folder_path: presentPlanningPath(parentFolder)` (`resource-tools.ts:623`). Both children get the **parent's** folder; neither gets one of its own. So both children's `sync-progress-status` open the same `{planning_folder_path}/README.md` and edit the same Progress surface (`workflows/meta/techniques/workflow-engine/sync-progress-status.md:42`), and both children's `commit-and-persist` rewrite the same rows and the same header `**Status:**` line (`commit-and-persist.md:22-24`). No lock on a markdown file either; last writer wins.

Second-order noise: `next_activity` diffs the planning folder with `readdir` and warns about files with no matching declared artifact id (`workflow-tools.ts:874-910`). With two children in one folder, each warns about the other's artifacts.

## M9 — single feature worktree and git index: serialises by *failing*

`commit-and-persist.md:26-31` commits source changes under `{host_repo_path}/{component_path}`, then commits **and pushes** everything under `.engineering/artifacts/` — *"including `README.md`, `session.json` and `.session-token`"* (`:27`, with `session-files-ride-along` at `:52-54`) — and the push must succeed before the operation returns (`:31`; `commit-after-activity` at `:38`). The primitive is plain `git add` / `git commit -s` / push in one working tree (`commit-regular-files.md:26-28`).

Two children hitting an activity boundary together contend on `.git/index.lock`, and the second push is a non-fast-forward. `commit-and-persist.md:31` says surface the error and do not advance — which makes this **the only mechanism on the list that fails loudly rather than silently.** Cold comfort: it means concurrency is discovered as a git error, after the state corruption of M2 has already happened.

Two children of `work-package` specifically: the bag holds **one** `target_path` (`workflows/work-package/workflow.yaml:84-86`), created once (`01-start-work-package.yaml:715-721`) and removed at `14-complete.yaml:165-167`. And `target_path` declares no `defaultValue`, so `seedDefaults` (`src/utils/variable-seed.ts:12-18`) puts nothing in either child's bag — neither inherits the parent's worktree path, so each would either re-derive it (converging on one tree) or create its own.

---

# The smallest server change, and what it must guarantee

**Option A — per-folder serialisation.** One async mutex keyed on `folderAbsPath`, held across `loadSessionForTool` → mutate → `writeSessionFile`. **Guarantee: no two handlers may observe the same on-disk bytes and both write.** Two insertion sites only, because the codebase already funnels through them (`resolver.ts:138` load, `store.ts:328` write). Fixes M1 for free — the second `dispatch_child` reads `.length === 1`.

**Option B — compare-and-swap on the seal, which I'd argue is the better fit.** `saveSessionForTool` already holds `loaded.bytes` (`resolver.ts:119`), currently unused. Re-read `session.json`, compare against it, and on mismatch throw a retryable `SessionStoreError`; the caller re-runs load-mutate. **Guarantee: a write whose base is stale fails loudly instead of silently reverting.** No queueing, no deadlock surface, and it converts every existing silent lost update — including the ones the "reload before save" comments are hand-managing today — into an error.

Option B also satisfies the repo's own stated preference for *removing the thing that needs a prohibition* rather than adding mechanism beside it: with a CAS in place, the hand-placed reload invariant at `workflow-tools.ts:1513-1518` and the source-scraping test at `tests/batch-bound.test.ts:46-52` both become unnecessary.

**Neither option touches M8 or M9.** A per-child planning folder needs `dispatch_child` to materialise one and seed the child's `planningFolderPath` — and the code already exists: the transient-promotion branch calls `ensurePlanningFolder` at `resource-tools.ts:543-547`. The persistent branch simply does not take it. The single worktree, branch and push (M9) is a definition-level problem no server change addresses.

# What *is* available today

Promoting activity sets out of `work-package` into children works **sequentially**, with no change to either layer. The meta graph already re-enters the drive loop (`workflows/meta/workflow.yaml:32-35`, `end-workflow: return: dispatch-client-workflow`; the exit exists at `04-end-workflow.yaml:65`), `dispatch_child` appends a further child to a persistent parent (`resource-tools.ts:451`, `:593`), and nothing gates a second dispatch. The only edit needed is that `client_session_index` is a single scalar (`meta/workflow.yaml:60-62`) overwritten by the next `create-session`.

Concurrency is the part that is foreclosed without server work — and note that it is foreclosed by the *storage layer*, not by the depth rule everyone reaches for first.

## Corrections to prior premises

- The meta workflow's dispatch site is NOT `handle-sub-workflow`. No activity binds it — grep over `workflows/meta/activities/` finds no reference, and `handle-sub-workflow` appears only as a workflow-level technique listing (`workflows/meta/workflow.yaml:15`) plus cross-references. The bound step is `workflow-engine::create-session` (`workflows/meta/activities/01-initialize-session.yaml:50`), whose Protocol passes `planning_slug` and `repo` as well and uses `agent_id: 'orchestrator'`, not `'workflow-orchestrator'` (`workflows/meta/techniques/workflow-engine/create-session.md:44`). This matters for question E: passing `planning_slug` from a transient parent routes the FIRST dispatch through the transient-promotion branch (`src/tools/resource-tools.ts:505-584`), which hard-codes `['triggeredWorkflows', 0, 'state']` (`:550`) and has no slot arithmetic at all. Only a persistent parent takes the appending branch (`:587-625`). So a second child would be the first call in the meta walk ever to exercise `newArrayIndex`.
- `depth-1-only` is not what forecloses concurrent children, and citing it that way inverts its meaning. `workflows/meta/techniques/harness-compat/spawn-agent.md:46` states the opposite of a prohibition: "Parallel scatter is available only where the dispatch primitive is — at the orchestrator." Two child drive loops would run in the orchestrator's own turn, not in nested orchestrator agents, so the depth rule is silent on them. The obstacle is the storage layer (`src/tools/workflow-tools.ts:1514`).
- "Parallel dispatch is not a server capability" is right about the server but understates the corpus. The definitions carry a first-class parallel primitive: `workflows/meta/techniques/scatter-gather.md:12-18` (parallel mode), `spawn-concurrent.md:22-34` (dispatch batch, await all, results in input order), and `scatter-gather.md:30-32` (`isolation-then-combine`, which already forbids auto-binding per-instance outputs into the parent bag because it "would race and clobber across instances"). The harness binding at `claude-code.md:26` is the only layer that is a bare authored instruction.
- `docs/dispatch-model.md:36` describes a child model the code does not implement: "a child session under the child planning folder" with "the parent's `session.json` … under the child's `parentSession` field." `dispatch_child` passes no `parentSession` to `createInitialSessionFile` on either branch (`src/tools/resource-tools.ts:552-560`, `:596-604`; the arg is optional at `src/schema/session.schema.ts:300`, assigned at `:336`), and the persistent branch creates no child folder — it returns the parent's (`:623`). This is load-bearing for E in the wrong direction: a reader trusting that doc would conclude children hold separate state files and therefore cannot contend on writes, which is the exact opposite of what the code does.
- Side effect of the above, worth flagging separately: because `dispatch_child` never sets `parentSession`, the child-completion notifier at `src/tools/workflow-tools.ts:930-953` — which flips `triggeredWorkflows[i].status` from `running` to `completed` — is gated on `state.parentSession?.sessionIndex` and is therefore dead for every child `dispatch_child` mints. A child's recorded status stays `running` forever, so "how many children are live" is not answerable from the parent's own state file.
- `src/utils/fan-out.ts` is a false friend for anyone searching `src/` for parallelism. It measures how far container rules and inherited I/O entries reach across composed techniques (`src/utils/fan-out.ts:4-14`), is warn-only, and has nothing to do with dispatch.

## Confidence

Certain, from code: (1) There is no lock, mutex, lockfile, ETag, revision counter, mtime check, or compare-and-swap anywhere in `src/` — I grepped for every spelling of each. (2) `saveSessionForTool` writes the whole top file from a load-time snapshot (`resolver.ts:197-200`, `store.ts:328-338`) and the source itself calls this last-writer-wins (`workflow-tools.ts:1514`). (3) `LoadedSession.bytes` exists and is read by no consumer, so the raw material for a CAS is present and unused. (4) Two `dispatch_child` calls whose loads both precede either write compute an identical `session_index`, because the HMAC input is byte-identical (`resource-tools.ts:593-595` + `derivation.ts:126-130`). (5) The MCP SDK does not serialise requests on a connection — `_onrequest` fires the handler through `Promise.resolve().then(...)` and returns, and `onmessage` does not await it. Neither transport adds a queue. (6) The drive-loop definition carries exactly one `current_activity` / `worker_agent_id` / `client_session_index`, and the schema has no parallel step kind.

Cannot be settled from this corpus — the harness tool surface. Whether the caller actually emits two `dispatch_child` (or two `Agent`) calls in one turn rather than sequentially rests solely on an authored instruction in `workflows/meta/techniques/harness-compat/claude-code.md:26`, which is a markdown file the server delivers, not an observation. What would settle it: a recorded trace or transcript showing two `dispatch_child` events against one parent with overlapping timestamps, or the harness's own parallel-tool-call documentation. I have deliberately not laundered that instruction into an observed fact — and I note it does not change the verdict, since the failure is in the storage layer and fires whether the two calls arrive together or the two children merely run together afterwards.

Untested by me, and worth a caveat: I did not execute two concurrent dispatches to observe the clobber empirically. The reasoning is static, but it is corroborated rather than merely inferred — the repo's own comments (`workflow-tools.ts:1513-1516`, `:1032-1037`) and a source-scraping test (`tests/batch-bound.test.ts:46-52`) name the lost-update failure mode explicitly. The existing "concurrent session isolation" tests (`tests/mcp-server.test.ts:1563-1590`) do not cover this case: they await each call in sequence and use two separate top-level planning folders, never two children inside one file.

One judgement call flagged as such: I rank compare-and-swap over a per-folder mutex on design grounds (it removes the hand-placed reload invariant instead of adding mechanism beside it) rather than on measured evidence. Either satisfies the guarantee the verdict requires.

## Citations

- src/tools/workflow-tools.ts:1513-1516
- src/tools/workflow-tools.ts:1032-1037
- src/tools/workflow-tools.ts:1517-1518
- src/tools/workflow-tools.ts:1521-1522
- src/tools/workflow-tools.ts:1529-1561
- src/tools/workflow-tools.ts:723-728
- src/tools/workflow-tools.ts:735-743
- src/tools/workflow-tools.ts:865
- src/tools/workflow-tools.ts:874-910
- src/tools/workflow-tools.ts:916-924
- src/tools/workflow-tools.ts:930-953
- src/tools/workflow-tools.ts:976-991
- src/tools/workflow-tools.ts:1025
- src/tools/workflow-tools.ts:1044-1053
- src/tools/workflow-tools.ts:1055-1057
- src/tools/workflow-tools.ts:1813-1827
- src/tools/resource-tools.ts:451
- src/tools/resource-tools.ts:464-466
- src/tools/resource-tools.ts:505-584
- src/tools/resource-tools.ts:543-551
- src/tools/resource-tools.ts:552-560
- src/tools/resource-tools.ts:587-595
- src/tools/resource-tools.ts:596-604
- src/tools/resource-tools.ts:605-621
- src/tools/resource-tools.ts:623
- src/tools/resource-tools.ts:651
- src/utils/session/resolver.ts:113-124
- src/utils/session/resolver.ts:138-157
- src/utils/session/resolver.ts:164-181
- src/utils/session/resolver.ts:193-201
- src/utils/session/resolver.ts:63-90
- src/utils/session/store.ts:207-266
- src/utils/session/store.ts:328-338
- src/utils/session/store.ts:365-393
- src/utils/session/store.ts:436-525
- src/utils/session/store.ts:472-522
- src/utils/session/store.ts:563-577
- src/utils/session/derivation.ts:105-131
- src/utils/delivery.ts:47-65
- src/utils/delivery.ts:52-55
- src/utils/delivery.ts:76-81
- src/utils/batch.ts:59-66
- src/utils/batch.ts:72-123
- src/utils/batch.ts:149-160
- src/utils/variable-seed.ts:12-18
- src/utils/fan-out.ts:4-14
- src/trace.ts:41
- src/trace.ts:73-74
- src/trace.ts:81-114
- src/logging.ts:82-111
- src/logging.ts:113-135
- src/schema/activity.schema.ts:152-165
- src/schema/session.schema.ts:295-340
- src/server.ts:12-53
- src/transports/http.ts:105-165
- src/transports/stdio.ts:11-15
- schemas/workflow.schema.json:153-160
- tests/batch-bound.test.ts:46-73
- tests/mcp-server.test.ts:1563-1590
- node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:228-242
- node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:272-273
- node_modules/@modelcontextprotocol/sdk/dist/esm/shared/protocol.js:342-351
- workflows/meta/activities/03-dispatch-client-workflow.yaml:5-16
- workflows/meta/activities/03-dispatch-client-workflow.yaml:29-39
- workflows/meta/activities/03-dispatch-client-workflow.yaml:42-109
- workflows/meta/activities/03-dispatch-client-workflow.yaml:110-119
- workflows/meta/activities/01-initialize-session.yaml:50
- workflows/meta/activities/04-end-workflow.yaml:62-65
- workflows/meta/workflow.yaml:30-35
- workflows/meta/workflow.yaml:60-62
- workflows/meta/techniques/workflow-engine/create-session.md:42-47
- workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:20-28
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:38-44
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:100-106
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:22-31
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:36-41
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:52-54
- workflows/meta/techniques/workflow-engine/sync-progress-status.md:42
- workflows/meta/techniques/version-control/commit-regular-files.md:24-28
- workflows/meta/techniques/harness-compat/spawn-agent.md:40-46
- workflows/meta/techniques/harness-compat/spawn-concurrent.md:22-34
- workflows/meta/techniques/harness-compat/claude-code.md:24-27
- workflows/meta/techniques/harness-compat/TECHNIQUE.md:22-30
- workflows/meta/techniques/scatter-gather.md:10-18
- workflows/meta/techniques/scatter-gather.md:30-40
- workflows/work-package/workflow.yaml:84-86
- workflows/work-package/activities/01-start-work-package.yaml:715-721
- workflows/work-package/activities/14-complete.yaml:165-167
- docs/dispatch-model.md:36