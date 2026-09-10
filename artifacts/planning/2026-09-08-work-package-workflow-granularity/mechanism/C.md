# C. The planning folder, artifact names, and the progress table

## C. The planning folder, artifact names, and the progress table

### 1. Where a child's artifacts land

One folder — the parent's — and nothing in the corpus says so.

`dispatch_child` on a persistent parent returns `planning_folder_path: presentPlanningPath(parentFolder)` (`src/tools/resource-tools.ts:623`). No folder is created on that path; the only `ensurePlanningFolder` call in the tool is on the transient-promotion branch (`src/tools/resource-tools.ts:543-547`), which `handle-sub-workflow` does not take. Every subsequent server answer agrees: `get_workflow` reports `planning_folder_path: presentPlanningPath(loaded.folderAbsPath)` (`src/tools/workflow-tools.ts:675`), and `folderAbsPath` is documented as "Absolute path to the **top-level** planning folder" (`src/utils/session/resolver.ts:116-117`) — for an embedded child, `loadSessionForTool` resolves the parent's folder and navigates a `jsonPath` inside its file (`src/utils/session/resolver.ts:143-156`). So N children of one parent all resolve to one directory.

Two further facts sharpen this:

- **`get_activity` never returns the folder.** `planning_folder_path` appears exactly once in `src/tools/workflow-tools.ts`, at `:675` (`get_workflow`, an orchestrator tool). A worker learns the path only from the prompt the orchestrator composed (`dispatch-activity.md:54`, `03-dispatch-client-workflow.yaml:62` binding `state: variables`).
- **The child's own bag does not carry it.** `work-package`'s `planning_folder_path` declares no `defaultValue` (`work-package/workflow.yaml:119-121`), and `seedDefaults` copies only declarations that have one (`src/utils/variable-seed.ts:12-18`, applied at `src/tools/resource-tools.ts:482-485`). The child session's variable bag therefore has no folder at all; the value in play is whatever the parent orchestrator holds in *its* bag.

The one rule that governs artifact location says "Write planning artifacts only under the server-returned `{planning_folder_path}` — never compose or reconstruct that path" (`meta/techniques/agent-conduct.md:44-46`). Followed literally by a child, that rule *is* the collision: the server-returned path is the parent's folder, and the rule explicitly forbids deriving a child-specific one. No definition file anywhere states that a child shares the parent's folder — a corpus-wide grep for that idea returns nothing — so the sharing is an emergent property of the server response with no authored rule over it.

### 2. Under what names

Two naming regimes exist, and neither distinguishes children.

| Regime | Name | Where the name comes from |
|---|---|---|
| Workflows bundling `manage-artifacts` | `{artifact_prefix}-{bare_filename}` (e.g. `09-code-review.md`) | `artifact-prefix` rule (`manage-artifacts/TECHNIQUE.md:84-86`); the prefix is server-computed from the **activity filename index of that workflow** (`src/loaders/workflow-loader.ts:82`, `:167`) and delivered per activity as `artifact_prefix` (`src/tools/workflow-tools.ts:1440-1454`) |
| Workflows that do not (e.g. `prism`) | Fixed bare names — `REPORT.md`, `DEFINITIVE-FINDINGS.md`, `RUN-MANIFEST.json` | `prism/techniques/generate-report.md:36,60`; `prism/techniques/emit-run-manifest.md:40,76`. A grep for `write-artifact` across `prism/` returns nothing — no prefix, no find-or-update |

The prefix is the crux: it indexes activities *within one workflow*, and every workflow numbers its activities from `01`. So a child's activity `03` and the parent's activity `03` — and two different children's `03`s — all deliver the string `03`. The prefix orders artifacts; it does not identify their producer.

### 3. Two children, same declared filename

**The second write silently replaces the first child's artifact, and neither child is told.**

`write-artifact`'s Protocol is find-or-create keyed on the bare filename over `{target_dir}` (default `planning_folder_path` — `write-artifact.md:24-30`):

- Step 1 scans for `<NN>-{bare_filename}` **at any two-digit prefix** or a bare `{bare_filename}` (`write-artifact.md:43`).
- Step 2: exactly one match → "UPDATE that file in place… Keep its existing numeric prefix; do NOT create a second copy under a different number" (`write-artifact.md:44`).
- Step 4, the mint-attempt guard: re-scan before creating; if an instance appeared "(race or stale listing), fall through to step 2 (update) instead of creating. Never mint a second numbered instance of the same bare filename" (`write-artifact.md:46`).
- Step 5 preserves only siblings that are "a different logical artifact" (`write-artifact.md:47`).

Read against two children, the discipline is unambiguous and unhelpful: **the key is the bare filename and the scan is folder-wide, so a second child's write is by construction an update of the first child's file.** The technique has no notion of session, workflow, or producer — the only identity it carries is the filename, and step 4 explicitly names a race and resolves it *toward* the merge. Child B, running activity `07`, writing `code-review.md`, finds child A's `03-code-review.md` and overwrites its content while keeping A's prefix. A reader who follows the seeded Progress link `[Code review](09-code-review.md)` reaches a file that exists and holds the wrong child's content — `verify-artifact-links` classifies only `missing-target`, `unresolved-anchor`, `worktree-citation`, `resource-id-as-link` (`work-package/techniques/manage-artifacts/verify-artifact-links.md:20`), so a resolving link to substituted content is invisible to it. That link check is also folder-scoped, enumerating "every `.md` file" in the folder (`:26`), so one child's close-out sweeps the other child's artifacts as if they were its own.

Truly simultaneous writes get the worse outcome: step 4's re-scan is a check-then-act window, so both children can scan empty and both create — `03-code-review.md` and `07-code-review.md`. The next writer then hits step 1's mint-conflict branch, updates the **lowest-numbered** instance, and reports the duplicate paths to its caller (`write-artifact.md:43`). Nothing reconciles the orphan; the higher-numbered file just stops being written to.

The one escape is `target_dir`, and it is a per-workflow authoring decision, not a per-child one. `work-package` binds it to a subdirectory exactly once, for the cumulative comprehension corpus (`work-package/activities/15-codebase-comprehension.yaml:53-59` sets `comprehension_dir`, `:70-75` passes it), and `codebase-wiki` binds it to `{wiki_path}` (`codebase-wiki/techniques/README.md:39`). The corpus's actual multi-child pattern does the same thing by hand: `prism-audit` sets "`{output_path}` to the scope's `output_subdir` under `{audit_output_path}`" before each dispatch (`prism-audit/techniques/execute-analysis/compose-trigger-context.md:36`, output declared at `:20-24`). But that value reaches the child only because the parent relays it — `passContext` is documented as agent-relayed: "The server does not copy them — a child session's bag starts from the child workflow's own declared defaults, nothing more" (`src/schema/activity.schema.ts:40`). And `prism`'s `output_path` defaults to `.` (`prism/workflow.yaml:28-31`), so an unrelayed prism child writes `REPORT.md` into the process cwd.

**Is there any namespacing by session index, child slug, or numbered prefix?** No.

- **Session index** — `child_session_index` appears in exactly one file in the entire corpus, `meta/techniques/workflow-engine/handle-sub-workflow.md:22-28`. No definition consumes it; neither dispatch site even captures it as a step output (`prism-audit/activities/02-execute-analysis.yaml:74-80`, `work-package/activities/10-post-impl-review.yaml:177-182`). Nothing can namespace on a value nothing holds.
- **Child slug** — `planning_slug` is only read on the transient-promotion branch and is "Ignored if the parent is already persistent" (`src/tools/resource-tools.ts:459`, used at `:527-530`).
- **Numbered prefix** — collides, per §2.
- **Filename series** — the `{n}`-templated series (`write-artifact.md:50`) is a per-artifact authoring device, not per-child, and the interpolated `{n}` is another value nothing binds from the child identity.

Concretely: `work-package/activities/10-post-impl-review.yaml:79-85` relays `target_path`, `component_name`, `issue_title` to its prism child and no output path at all. Today's single work-package child dispatch already has no namespacing; two of them would write the same three fixed filenames.

### 4. Does a child get rows in the parent's progress table?

**No.** The table has one owner, its rows sit at the grain of one workflow's activities, and a child's activities are not among them.

**Who owns it.** The orchestrator, exclusively. `sync-progress-status` is the "Orchestrator-owned Progress **status** writer" (`sync-progress-status.md:8`); `finalize-activity` bars the worker — "Planning-folder `README.md` Progress/Status sync and engineering commit/push are **not** worker duties" (`finalize-activity.md:78-80`); and the resource closes the set: "Every moment in the table is an orchestrator's, and this table is the whole set of them: a status write comes from one of these moments or from nowhere" (`meta/resources/planning-readme.md:179`).

**The call sites** are all in the parent's drive loop: in-progress before dispatch (`dispatch-activity.md:48-50`, which also commits the README alone so the mark reaches the remote), blocked and path-skip (`dispatch-activity.md:61-62`), and complete-or-N/A after the activity (`commit-and-persist.md:22`) — the five moments tabulated at `planning-readme.md:165-177`, with the vocabulary `⬚ 🟡 ✅ ❌ ⊘` at `:119-127`.

**The grain** is the seeding workflow's activities: "Tracks workflow **activities** (primary) and their planning artifacts" and "**Every activity** in the workflow gets at least one Progress row" (`planning-readme.md:74-79`). Rows come from one workflow's readme-seed inventory, spliced as authored (`create-readme.md:48-53`; `work-package/resources/readme-seed.md:26-58`).

**Why a child gets no rows.** Selection resolves `{artifact_prefix}` through the row-ownership map of the single bound `{seed_profile}` (`sync-progress-status.md:22,26,42-48`; `planning-readme.md:185-188`), and "A row absent from the map is unselectable — a writer cannot resolve which activity owns it, so its status never advances" (`planning-readme.md:105`). The parent's map keys `01`–`15` to the parent's own Item labels (`work-package/resources/readme-seed.md:68-89`). A child's activities appear in neither the inventory nor the map, so no candidate row exists for them.

What a child *does* get is the row of the parent activity that dispatched it, and only that: the work-package seed carries `| 23 | [Structural analysis](10-structural-analysis.md) | Prism L12 when written standalone |` (`readme-seed.md:52`) owned by prefix `10` (`:83`) — the whole prism child run collapses into rows belonging to `post-impl-review`.

Two aggravations follow.

- **The prefix key is not namespaced by workflow.** `sync-progress-status` takes one `seed_profile` and resolves the prefix "from `{activity_id}`'s server `artifactPrefix` (activity filename index)" (`:43`). A child activity numbered `03`, marked against the parent's profile, selects the rows the *parent's* `03` owns — Requirements elicitation — and writes a status onto them. Neither the technique nor the transition policy can detect it; the write is well-formed. Note also that the meta drive loop never binds `seed_profile` at all: `03-dispatch-client-workflow.yaml:89-95` passes only `activity_id`, and `commit-and-persist.md:22` forwards `activity_id`, `planning_folder_path`, `target_status`. The profile is inferred, and with two children in one folder "the workflow's readme-seed profile" no longer names one thing.
- **A child can destroy the table outright.** This is where the brief needs correcting (see corrections): `dispatch_child` seeds no README, but a *work-package* child's first activity does. `01-start-work-package.yaml:689-694` binds `workflow-engine::create-readme` with `seed_profile: work-package/readme-seed`, and create-readme's step 6 is "Write the populated `README.md` to `{planning_folder_path}/README.md`" (`create-readme.md:53`) — a full write of the Template plus the child's own inventory, into the parent's folder. The parent's Progress table, its accumulated statuses, and its Links table are replaced by a fresh child seed. `verify-readme-conforms` would not notice: it compares H2 sections, extra H1s, and header-block fields (`verify-readme-conforms.md:26-43`) — a correctly-shaped README with the wrong workflow's rows conforms.

### 5. Two children concurrently: three hazards, three fixes

They are genuinely separate failures, and conflating them yields a fix that repairs one and leaves the others live.

| Hazard | Mechanism | Failure | Where a fix belongs |
|---|---|---|---|
| **Session file** | `saveSessionForTool` merges into `loaded.topState` — a snapshot taken at load — via `replacePath` and rewrites the whole file (`src/utils/session/resolver.ts:193-201`); `writeSessionFile` writes unconditionally (`src/utils/session/store.ts:328-338`). `loaded.bytes` is carried but never compared, and a grep for `mutex`/`lock`/`flock`/`withLock`/`CAS` across `src/` returns nothing | Lost update. Child A's `next_activity` and child B's `record_usage` both load, both write; the later write's top-state has no trace of the earlier. The seal is recomputed over the bytes actually written (`store.ts:333-336`), so the clobber is **not** a `SEAL_MISMATCH` — it is silent | Server-side. Compare-and-swap on `loaded.bytes` (reject on drift) or a per-folder write lock. Nothing an agent or a definition can do |
| **README file** | One `README.md` mutated by read-modify-write from both drive loops (`sync-progress-status.md:42-48`), with no lock and no per-child section | Lost status update, or a table re-seeded from the wrong profile (§4). Also mis-selection via the colliding prefix key | Definition-side. Namespace the ownership key by workflow, or give each child its own index file, or keep the table strictly parent-owned and never let a child's orchestration touch it |
| **Artifact files** | Find-or-update keyed on bare filename over a shared folder (`write-artifact.md:41-50`) | Content substitution, or duplicate mint through the step-4 window (§3) | Definition-side, and cheap: a per-child `target_dir`, which the technique already accepts (`write-artifact.md:24-30`) and which `prism-audit` already uses per run (`compose-trigger-context.md:36`) |

A fourth, distinct from all three, is worth naming because it lands in git rather than in either file: `commit-and-persist` commits **all** changes under `.engineering/artifacts/` including `README.md`, `session.json` and `.session-token` (`commit-and-persist.md:27`, `:52-54`), and "Push must succeed before this operation returns" with one retry (`:27`, `:31`). Two children post-activity in one checkout means concurrent `git commit`/`push` in one worktree: each commit sweeps the other's half-written artifacts, the second push is a non-fast-forward, and the run refuses to advance (`:31`). And because `session.json` and its seal are two separate atomic writes in sequence (`store.ts:335-336` — the doc comment at `:358-359` names "torn write" as a `SEAL_MISMATCH` cause), a commit taken between them publishes a session file whose seal does not match its bytes.

One more consequence specific to *dispatching* two children at once, same root cause as hazard 1: `newArrayIndex = parentState.triggeredWorkflows.length` and `childSessionIndex = computeEmbeddedSessionIndex(parentFolder, childJsonPath)` (`src/tools/resource-tools.ts:593-595`, `:605-621`), the index being an HMAC over realpath + `:` + the jsonPath string (`src/utils/session/derivation.ts:122-131`). Two concurrent `dispatch_child` calls from stale snapshots compute the same length, hence the same jsonPath, hence the **same** `session_index` — and one `triggeredWorkflows` entry is lost in the second write. The two "children" then address one sub-state. Children must be dispatched serially even before anything they do is considered.

That serial constraint is what the corpus already asserts for its only multi-child workflow: `prism-audit` runs its children in a `forEach` loop (`prism-audit/activities/02-execute-analysis.yaml:64-82`) and states the reason plainly — "Scopes run sequentially so each prism run has full resources and no cross-analysis interference" (`prism-audit/activities/README.md:29`). Nor is there a loop shape that could drive two: `03-dispatch-client-workflow.yaml` holds a single `current_activity` and a single `worker_agent_id` (`:31-40`, `:44-55`, `:103-109`), so one drive loop tracks one child's position.


## Corrections to prior premises

- "no folder is created and no README seeded for the child" is right about `dispatch_child` but wrong as a statement about the child's run: a `work-package` child's first activity seeds one itself. `work-package/activities/01-start-work-package.yaml:689-694` binds `workflow-engine::create-readme` with `seed_profile: work-package/readme-seed`, and create-readme step 6 writes the populated Template to `{planning_folder_path}/README.md` (`workflows/meta/techniques/workflow-engine/create-readme.md:53`) — i.e. over the parent's README, replacing the parent's Progress table and Links table with the child's own seed inventory.
- "The child inherits the parent's planning folder" holds for the path the parent is told, but the child's own variable bag does not contain it: `work-package`'s `planning_folder_path` declares no `defaultValue` (`workflows/work-package/workflow.yaml:119-121`) and `seedDefaults` copies only declarations that have one (`src/utils/variable-seed.ts:12-18`), so the key is absent from the child session's bag. The value in play is the parent orchestrator's own binding, relayed into worker prompts as substitution state (`workflows/meta/activities/03-dispatch-client-workflow.yaml:62`).
- The brief treats parallel dispatch as unsettled at the harness level; at the server level it is settled and negative. Two concurrent `dispatch_child` calls both compute `newArrayIndex = parentState.triggeredWorkflows.length` from their own stale snapshots (`src/tools/resource-tools.ts:593-595`), so both derive the SAME `session_index` (`src/utils/session/derivation.ts:122-131`) and the second whole-file write drops the first child's `triggeredWorkflows` entry (`src/utils/session/resolver.ts:193-201`). No lock or compare-and-swap exists anywhere in `src/`.

## Confidence

Settled from the corpus: the child's folder is the parent's (three independent server call sites); artifact names come either from a per-workflow activity-index prefix or from fixed bare names, and neither encodes the producer; `write-artifact`'s find-or-update keys on the bare filename over a folder-wide scan and resolves a detected race toward update, so a second child's write is an update of the first's file; `child_session_index` is consumed by nothing in the corpus, so no session-index namespacing exists; the Progress table is orchestrator-owned, sits at the grain of one workflow's activities, and a child's activities are unselectable because they are absent from the bound seed's row-ownership map; a work-package child re-seeds the parent's README wholesale; and there is no lock, mutex, or compare-and-swap on session writes anywhere in `src/`, with the seal recomputed over whatever bytes were written, so a lost update is silent rather than a SEAL_MISMATCH.

Not settled from the corpus, and I have not laundered these into observed facts: (a) whether the harness in fact issues two tool calls to one server process concurrently — `meta/techniques/harness-compat/claude-code.md`'s `concurrent` rule is an authored instruction to the model, not an observed property, and what would settle it is the harness's own dispatch behaviour plus whether the MCP transport serialises requests; (b) how often the check-then-act windows (write-artifact step 4, session load-then-write, session.json-then-seal) actually interleave at runtime — the code contains no guard either way, so the hazard is real but its frequency is a runtime question a concurrency test would answer, not the corpus; (c) whether any deployment serialises tool calls upstream of the server. I also did not exhaustively audit every workflow's artifact-writing bindings — I read `work-package`, `prism`, `prism-audit`, and grepped `target_dir` corpus-wide, so a workflow outside those with a per-child naming device would be a gap in my scan, though the `target_dir` grep makes that unlikely.

## Citations

- src/tools/resource-tools.ts:623
- src/tools/resource-tools.ts:543-547
- src/tools/resource-tools.ts:459
- src/tools/resource-tools.ts:482-485
- src/tools/resource-tools.ts:527-530
- src/tools/resource-tools.ts:593-595
- src/tools/resource-tools.ts:605-621
- src/tools/workflow-tools.ts:675
- src/tools/workflow-tools.ts:1440-1454
- src/utils/session/resolver.ts:116-117
- src/utils/session/resolver.ts:143-156
- src/utils/session/resolver.ts:193-201
- src/utils/session/store.ts:207-227
- src/utils/session/store.ts:328-338
- src/utils/session/store.ts:358-359
- src/utils/session/store.ts:365-392
- src/utils/session/derivation.ts:122-131
- src/utils/variable-seed.ts:12-18
- src/loaders/workflow-loader.ts:82
- src/loaders/workflow-loader.ts:167
- src/schema/activity.schema.ts:40
- src/schema/activity.schema.ts:310
- workflows/meta/techniques/agent-conduct.md:44-46
- workflows/meta/techniques/workflow-engine/handle-sub-workflow.md:20-28
- workflows/meta/techniques/workflow-engine/sync-progress-status.md:8
- workflows/meta/techniques/workflow-engine/sync-progress-status.md:22
- workflows/meta/techniques/workflow-engine/sync-progress-status.md:26
- workflows/meta/techniques/workflow-engine/sync-progress-status.md:42-48
- workflows/meta/techniques/workflow-engine/sync-progress-status.md:54-56
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:48-50
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:54
- workflows/meta/techniques/workflow-engine/dispatch-activity.md:61-62
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:22
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:27
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:31
- workflows/meta/techniques/workflow-engine/commit-and-persist.md:52-54
- workflows/meta/techniques/workflow-engine/finalize-activity.md:78-80
- workflows/meta/techniques/workflow-engine/create-readme.md:20-22
- workflows/meta/techniques/workflow-engine/create-readme.md:48-53
- workflows/meta/techniques/workflow-engine/verify-readme-conforms.md:26-43
- workflows/meta/resources/planning-readme.md:74-79
- workflows/meta/resources/planning-readme.md:90
- workflows/meta/resources/planning-readme.md:99-105
- workflows/meta/resources/planning-readme.md:119-127
- workflows/meta/resources/planning-readme.md:165-177
- workflows/meta/resources/planning-readme.md:179
- workflows/meta/resources/planning-readme.md:185-188
- workflows/meta/activities/03-dispatch-client-workflow.yaml:31-40
- workflows/meta/activities/03-dispatch-client-workflow.yaml:44-55
- workflows/meta/activities/03-dispatch-client-workflow.yaml:62
- workflows/meta/activities/03-dispatch-client-workflow.yaml:89-95
- workflows/meta/activities/03-dispatch-client-workflow.yaml:103-109
- workflows/work-package/techniques/manage-artifacts/write-artifact.md:24-30
- workflows/work-package/techniques/manage-artifacts/write-artifact.md:41-50
- workflows/work-package/techniques/manage-artifacts/TECHNIQUE.md:84-86
- workflows/work-package/techniques/manage-artifacts/TECHNIQUE.md:47
- workflows/work-package/techniques/manage-artifacts/verify-artifact-links.md:20
- workflows/work-package/techniques/manage-artifacts/verify-artifact-links.md:26
- workflows/work-package/workflow.yaml:119-121
- workflows/work-package/activities/01-start-work-package.yaml:689-694
- workflows/work-package/activities/10-post-impl-review.yaml:79-85
- workflows/work-package/activities/10-post-impl-review.yaml:177-182
- workflows/work-package/activities/15-codebase-comprehension.yaml:53-59
- workflows/work-package/activities/15-codebase-comprehension.yaml:70-75
- workflows/work-package/resources/readme-seed.md:26-58
- workflows/work-package/resources/readme-seed.md:52
- workflows/work-package/resources/readme-seed.md:68-89
- workflows/prism/workflow.yaml:28-31
- workflows/prism/techniques/generate-report.md:36
- workflows/prism/techniques/generate-report.md:60
- workflows/prism/techniques/emit-run-manifest.md:40
- workflows/prism/techniques/emit-run-manifest.md:76
- workflows/prism-audit/activities/02-execute-analysis.yaml:36-44
- workflows/prism-audit/activities/02-execute-analysis.yaml:64-82
- workflows/prism-audit/activities/README.md:29
- workflows/prism-audit/techniques/execute-analysis/compose-trigger-context.md:20-24
- workflows/prism-audit/techniques/execute-analysis/compose-trigger-context.md:36
- workflows/codebase-wiki/techniques/README.md:39