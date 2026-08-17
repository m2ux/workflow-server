# Coupling Clock (SDL-3, "When ORDER matters") — Orchestration Topology — `workflows/meta/**`, `workflows/work-package/**`, `src/**`, `scripts/**`

Lens 14, resource `prism/sdl-coupling`. The lens hunts hidden temporal coupling: ordering dependencies and time-gap
vulnerabilities the interface does not reveal. Pointed at orchestration topology, its three steps read as: what must be
established before a dispatch can be correct (Step 1), where a reading taken at one moment is acted on at another
(Step 2), and which execution sequences produce failures nothing names (Step 3). The topology findings fall out of the
gaps, because in this system the shape of the work IS a sequence of readings and actions separated by turns.

## Census the findings rest on

Measured directly from the definition trees (`scratchpad/count.py`, `gates.py`, `loops.py` over
`workflows/*/activities/*.yaml`), not restated from the brief.

| | work-package | meta |
|---|---|---|
| Activities | 15 | 5 |
| Steps (all kinds, loop bodies included) | 249 | 41 |
| `kind: technique` steps | 174 | 23 |
| Distinct techniques those steps bind | 145 | 23 |
| Duplicate step→technique bindings | **29** | 0 |
| `kind: checkpoint` steps | 44 | 5 |
| — blocking | 30 | 5 |
| — `blocking: false` | 14 | 0 |
| — carrying a `condition` | 33 | 4 |
| — carrying `autoAdvanceMs` | 15 | 0 |
| `kind: loop` steps | 15 | 2 |
| — without `maxIterations` | **5** | 0 |
| Technique steps inside a loop body | 31 | 6 |
| — of those, carrying no own `when`/`condition` | **30** | 0 |

Bundling eligibility of the technique steps, classifying each gate by whether every variable it names is declared in
`workflow.yaml` and unwritten by an earlier step of the same activity (quoted literals stripped):

| | work-package | meta |
|---|---|---|
| Ungated — eager-bundleable today | 78 | 11 |
| Gated, but **decidable at activity entry** | **44** | 6 |
| Gated and genuinely runtime-undecidable | 52 | 6 |

Server-side constants in force: `DEFAULT_BATCH_HEADROOM_FRACTION = 0.35`, `DEFAULT_BATCH_MAX_ACTIVITIES = 3`,
`DEFAULT_BUNDLE_HEADROOM_FRACTION = 0.80`, `DEFAULT_BUNDLE_CHARS_PER_TOKEN = 4`
(`src/config.ts:155–201`), `MIN_RESPONSE_SECONDS = 3` (`src/tools/workflow-tools.ts:1518`).

---

## Step 1 — The implicit initialization contract

### 1.1 The session is structurally single-threaded, and nothing says so

`SessionFile` carries exactly one `currentActivity` and exactly one `activeCheckpoint`
(`src/schema/session.schema.ts:89`). Six calls refuse to serve while that one checkpoint slot is occupied:
`get_workflow` (`workflow-tools.ts:420`), `get_activity` (`:786`), `get_trace` (`:1703`), `get_technique`
(`resource-tools.ts:621`), `get_resource` (`resource-tools.ts:841`), and `next_activity`, which carries its own
guard (`workflow-tools.ts:538`). That is every delivery call the server has.

**The contract:** *one agent context is doing workflow work in this session at any instant.* It is enforced only in the
negative — by a lock that makes concurrency fail rather than by an interface that expresses it. The four step kinds the
schema admits are `technique`, `action`, `checkpoint`, `loop` (`src/schema/activity.schema.ts:153–157`). There is no
concurrent step kind. So the definition language cannot express "these steps are independent", and the runtime would
refuse it if it could.

The escape hatch is real but expensive: `dispatch_child` (`resource-tools.ts:417`) mints a whole separate session with
its own pointer, its own checkpoint slot and its own planning folder. Fan-out costs a session, not a step.

### 1.2 Parallelism exists in the corpus and the server cannot see it

Seven of fifteen work-package activities declare `techniques: [scatter-gather]` (02, 04, 05, 06, 07, 08, 15), and
`workflows/meta/techniques/scatter-gather.md` describes a genuine parallel mode dispatching through
`harness-compat::spawn-concurrent`. Meta even ships two reference topologies as pattern activities:
`workflows/meta/activities/patterns/04-isolated-fan-out.yaml` and `05-lead-researcher.yaml`.

But that fan-out happens *inside a technique body*, below the server's horizon. Concurrent instances never call the
server under their own `agent_id`; the parent gathers their results and reports one `activity_complete`. Consequences,
all of them silent:

- the batch bound (`src/utils/batch.ts`) sees one context where N ran, so N-way fan-out draws down nothing;
- the delivery ledger (`src/utils/delivery.ts`) records no deliveries for the instances, so they cannot be collapsed
  against and cannot be measured;
- `record_usage` charges N instances' tokens to the parent's single `activity_usage` row, so the per-activity cost
  figures the batch settings are revised from (`config.ts:196–198`) systematically overstate serial cost and
  understate fan-out count.

**Named contract:** *the batch bound assumes one context per `agent_id`.* Scatter-gather violates it by construction
and no check exists, because the violation is invisible at the protocol boundary.

### 1.3 `get_technique` binds to the session pointer, not to the caller's dispatch

`get_technique` takes `session_index`, `agent_id`, `step_id`, `bundle`, `full` — and **no `activity_id`**
(`resource-tools.ts:607–613`). It then reads `state.currentActivity` at eight sites to decide which activity's step
list to search, which workflow scope to resolve against, and what provenance to attach
(`resource-tools.ts:628, 634, 643, 645, 651, 663, 676, 690`). `get_activity` is the same — its own description says
"load the current activity definition (from session state — no activity_id)" (`workflow-tools.ts:770`).

`activity-worker.md:36` asks the worker to verify: "Confirm the activity `id` on the `get_activity` response … equals
`{activity_id}`". That check exists for `get_activity` only. A composed `get_technique` response carries no activity id,
so there is nothing for the worker to compare — the same assumption on the lazier, more frequent call has no
verification instruction and no verifiable field.

**Named contract:** *the session pointer still names the activity this worker was dispatched for.* Documented in one
place, checked on one of the two calls, and unavailable to check on the other.

### 1.4 Agent identity continuity is asserted, never verified

`dispatchKind` derives fresh-versus-resume from the scope alone (`src/utils/dispatch.ts:30`): a scope the server has
met is a resume, a scope it has not is a spawn. The whole reference-delivery saving rests on that inference. The
failure mode is stated in the codebase in plain words — `batchRefusalMessage` warns that "a fresh context under a used
identity would receive markers for content it does not hold" (`batch.ts:194–196`), and `deliveryScope` explains the
same for cross-worker sharing (`delivery.ts:49–52`).

Nothing can detect it. A context that was compacted, restarted, or replaced but kept its `agent_id` receives
`{ delivery: 'unchanged', content_hash }` for instructions it has never seen, and proceeds. No error, no event, no
warning. The mitigation offered is a worker-side rule — `force-full-after-summarization`
(`activity-worker.md:43`) — which requires the worker to notice its own amnesia.

The server does detect the mirror-image case: `priorDeliveryScope` / `recordRedelivery` (`dispatch.ts:70–94`) flag the
same activity delivered whole twice under different identities. That is the *cheap* failure — waste, not corruption —
and it is the one that gets an event.

---

## Step 2 — Invariant windows

### 2.1 The flagship: `may_continue` is read at the start of an activity and acted on at its end

`batchState` returns `mayContinue` computed from history at the instant `get_activity` answers
(`batch.ts:149–160`), and the file's own comment names the gap: "`mayContinue` is answered before the lazy fetches of
the activity just taken draw down the same budget, so `true` can still become a refusal at the next boundary"
(`batch.ts:147–148`). `activity-worker.md` then hard-wires the stale reading into the protocol: step 1 says "Read
`may_continue` from the `batch:` block leading that response" (`:38`), and step 3's last bullet says pass "the
`may_continue` read in step 1 as `batch_may_continue`" (`:54`). Between those two reads sit every lazy
`get_technique` and `get_resource` of the activity.

The window is not marginal — it is the majority of the payload. `config.ts:166–172` records that `bench:batch`'s
161,027 characters over a three-activity run is the *eager floor* (53,676 a activity), while across 112 sealed worker
contexts one activity costs a median 74,109 characters with lazy fetches counted, p90 182,642, maximum 261,827. So the
reading the worker carries to the end of the activity understates that context's consumption by roughly 20,000
characters at the median, ~129,000 at p90 and ~208,000 at the maximum, against a 280,000-character budget at a
200,000-token declared window.

The consequence is designed for, not prevented: `dispatch-activity.md:97` states it outright — "a batch reported as
having room can still be refused at the next boundary; the refusal is an ordinary outcome". What that ordinary outcome
costs is one `next_activity` (which has *already advanced the session pointer*, `continue-batch.md:46`), one harness
continuation turn, one refused `get_activity`, and then a full replacement spawn under a fresh identity taking the
activity in full (`continue-batch.md:60`). The saving batching exists to buy is spent recovering from a reading the
system knew was provisional.

**Admission is also checked before delivery rather than after** (`workflow-tools.ts:805`, and the rationale at
`config.ts:190–193`), so an admitted activity can carry a batch up to 261,827 characters past its budget — 93% of the
budget again on measured content.

### 2.2 The orchestrator loop reads two vintages of `worker_result` in one iteration

`meta/activities/03-dispatch-client-workflow.yaml` runs an eight-step loop body. Step 1
(`continue-batched-worker`, `:31`) is gated on `worker_result.result_type == "activity_complete" &&
worker_result.batch_may_continue` — the *previous* iteration's envelope. Steps 1 and 2 both produce a new
`worker_result`. Steps 3–7 (`:52, 59, 67, 78, 86`) then read `worker_result` meaning the *current* one. One variable,
two vintages, one iteration, and nothing in the definition marks the rebind.

Combined with 2.1: the loop head's continue decision is guarded on a value the server documents as provisional, and
`release-spent-worker` (`:92`) declines to release the identity precisely when that value is stale-true — so the loop
walks into the refusal rather than pre-empting it.

### 2.3 `checkpointResponses` is a permanent replay cache with no invalidation

Written at `workflow-tools.ts:1631`, read at `:1341`, keyed `<activity-id>-<checkpoint-id>` (`:1340`). Grepping `src/`
for `checkpointResponses` finds writes, the read, schema, and migration — **and no clear, expire, or invalidate
anywhere**. On replay the worker is told to "continue execution WITHOUT yielding to the orchestrator" (`:1370`).

The key carries no fingerprint of the state the decision was about. Concrete failure: `pr-check` in
`01-start-work-package.yaml:537` records `use-existing` with `pr_number: "{existing_pr_number}"`. A session resumed
weeks later, after that PR merged or closed, replays the option and re-binds the dead PR number without asking. Same
shape for `review-mode-detection` (`:40`, records `is_review_mode`), `platform-selection` (`:409`), and
`build-artifact-check` (`13-submit-for-review.yaml:262`) — every one of them describes a world that can move.

### 2.4 The eager budget is checked against a corpus that no longer binds it

`eagerBudgetChars = context_tokens × 0.80 × 4` (`workflow-tools.ts:926`). At a 200,000-token declared window that is
**640,000 characters — larger than the entire 617 KB work-package definition**. The budget the bundler was built
around cannot bind. What actually stops bundling is the blanket rule at `workflow-tools.ts:898–900`: "A step gated by
`when`/`condition` (on itself or an enclosing loop) may never execute and stays lazy regardless of size."

That rule was a correct conservative default when gates were rare. The corpus now gates 96 of 174 work-package
technique steps (55%), and by the census above **44 of those 96 have gates decidable from the variable bag at the
moment `get_activity` answers**. Three activities bundle nothing at all: `13-submit-for-review` (17 technique steps,
all gated, 13 of them entry-decidable on `is_review_mode` / `stealth_mode`, both bound long before activity 13 opens),
`11-validate` (8 gated, 5 entry-decidable), and meta's `03-dispatch-client-workflow` (6 gated — correctly so, all six
are loop bodies keyed on the live envelope).

The evaluator already exists. `evaluateWhenExpression(expr, vars)` sits at `src/schema/when-expression.ts:301` and is
the reference implementation `activity-worker.md:52` tells workers to match. Its callers are
`scripts/check-stealth-isolation.ts`, `scripts/guards.ts`, `scripts/check-when-expression.ts`, `tests/e2e/walker.ts`,
and two batch tests. **Zero callers in `src/tools/` or `src/utils/`.** The server holds the bag and the evaluator in
the same process and never introduces them.

### 2.5 Loop bodies re-fetch a body that never changes

30 of work-package's 31 loop-body technique steps carry no own `when`/`condition` — the same operations run every
iteration; only the count is runtime. `08-implement.yaml:22–67` is the clearest case: `task-cycle` is a `forEach` over
`implementation_plan.tasks` whose six body techniques (`implement-task`, `run-tests`, `commit`, `log-provenance`,
`self-review`, `collect-assumptions`) are all unconditional. Under `progressive-step-technique-load` each is fetched on
reach, every iteration. Reference delivery collapses iterations 2..N to a 16-hex hash (`delivery.ts:41`) — the bytes
are saved, the round trip is not. A six-task plan issues about 36 `get_technique` calls for six bodies.

---

## Step 3 — Ordering bugs

### 3.1 `platform-selection` is consumed eight steps before it is set — `01-start-work-package.yaml`

`issue_platform` is read by `verify-jira-issue` (`:216`), `verify-github-issue` (`:227`), `search-github-issue`
(`:234`), the `github-issue-missing` gate (`:253`), the `jira-project-selection` gate (`:294`), `lookup-current-user`
(`:433`), `assign-issue-*` (`:441, 456`) and both `link-pr-to-ticket-*` (`:635, 659`). It is *written* by the
`platform-selection` checkpoint at **`:409`**.

On the create path the inversion is total: `create-issue` (`:405`, `when: needs_issue_creation == true`) takes no
`issue_platform` input and reads it from the bag — and runs four lines before the gate that binds it. On the "no issue
present → create new issue" route there is no prior issue reference to have derived a platform from, so `create-issue`
executes against an unbound variable and the user is asked which platform to use for an issue that has already been
created.

**Fix:** move the `platform-selection` checkpoint to immediately after the `issue-verification` gate (`:183`).
Definition edit, one block moved. Repairs the create path; no round-trip change.

### 3.2 `jira-project-selection` fires when there is no new issue — `01-start-work-package.yaml:294`

Its condition is `issue_platform == 'jira'` alone. Its message is "Select the Jira project for **the new issue**."
Every Jira run with an existing issue stops and asks the user to choose a project for an issue that will never be
created. (Compounded by 3.1: on the create path `issue_platform` is not yet `jira`, so the gate is *skipped* exactly
when it is needed.)

**Fix:** add `needs_issue_creation == true` as a conjunct. Saving: one full gate cycle — 4 MCP calls
(`yield_checkpoint` / `present_checkpoint` / `respond_checkpoint` / `resume_checkpoint`), two agent-turn boundaries,
and the ≥3-second server-enforced floor (`workflow-tools.ts:1518, 1559`) — on every Jira run with an existing issue.

### 3.3 The cheapest hard-fail check sits behind the most expensive operation — `01-start-work-package.yaml`

`analyze-repo-with-gitnexus` (`:154`) runs a full repository index. `verify-signing-precondition` (`:163`) then
validates `signing.configured == true` and aborts the run if it is false. Every unsigned-repo run pays the entire
GitNexus index before discovering it cannot proceed.

**Fix:** hoist `verify-signing-precondition` to sit directly after `resolve-repo-root` (`:144`), before the index.
Saving: the whole index cost on the failure path.

### 3.4 A human-latency spin loop held inside a worker context and the session lock — `13-submit-for-review.yaml:336`

`await-review-loop` is a `doWhile` with **no `maxIterations`**. Its body is one action and the `review-received`
checkpoint (`:350`), whose `no-waiting` option sets `awaiting_review: true` and re-presents the gate. So the worker
polls a human for the duration of a real PR review, and for that whole period:

- the worker's harness context stays live and billable;
- the batch identity cannot be released or advanced;
- `activeCheckpoint` is occupied, which by 1.1 blocks **every** delivery call in the session, for every context.

This is the single largest wall-clock item in the topology, and it is structural rather than incidental.

**Fix:** make the wait an activity boundary. Transition out to a parked terminal state after `mark-ready`, and let a
resume re-enter on `review-received`. The session's replay cache (2.3) already supports re-entry. Saving: the entire
human-review latency comes off worker-context lifetime and off the session lock.

### 3.5 Three stealth gates interleaved with the checks they depend on — `13-submit-for-review.yaml`

Order today: `verify-push-remote` (`:126`) → `private-remote-confirmation` gate (`:133`) → `verify-push-signatures`
(`:149`) → `push-confirmation` gate (`:157`). Both verifications are machine checks, mutually independent, and both
describe the same push. The signature check is placed *between* the two gates purely by document order.

**Fix:** hoist `verify-push-signatures` above `:133` and merge the two gates into one that presents remote identity,
remote privacy and signature status together. Saving: one full gate cycle per stealth run, and the user makes one
decision about one push instead of two about halves of it.

### 3.6 A gate asking a question the bag can already answer — `13-submit-for-review.yaml:262`

`build-artifact-check` asks "Do any build-dependent artifacts need user-owned regeneration?" — then its follow-on gate
`build-artifact-handoff` (`:290`) templates `{build_dependent_artifact_commands}` into its own message, proving the
command list is already bound at `:262`.

**Fix:** condition `build-artifact-check` on `build_dependent_artifact_commands != []`, or delete it and let
`build-artifact-handoff` carry the whole decision with its existing two options plus a "none needed" third. Saving:
one gate cycle on the common no-regen path.

### 3.7 Duplicate step→technique bindings — 29 in work-package

174 technique steps bind 145 distinct techniques. Worst offenders: `15-codebase-comprehension` (9 steps, 5 distinct),
`01-start-work-package` (31 steps, 26 distinct — `derive-branch-name` at `:484` and `compute-canonical-target-path` at
`:491` both bind `naming-conventions`), and `04-research`, `05-implementation-analysis`, `07-assumptions-review`,
`08-implement`, `10-post-impl-review` at three duplicates each. `08-implement` binds `review-assumptions::record`
three times (`:92, :115, :118`) and `review-assumptions::interview` twice (`:82, :107`).

The `technique:<resolvedId>` ledger key collapses the bytes (`delivery.ts:22`). It does not collapse the call. 29
round trips return a hash.

### 3.8 Independent detections serialized by document order

- `01-start-work-package.yaml`: `detect-merge-strategy` (`:170`), `detect-project-type` (`:173`) and `check-issue`
  (`:181`) are three mutually independent read-only detections, all queued behind the GitNexus index at `:154`.
  Adding `detect-review-mode` (`:12`) makes a four-way independent set.
- `meta/00-discover-session.yaml`: `extract-context` (`:64`), `name-initiative` (`:67`) and `scan-planning-folders`
  (`:70`) are independent; only the third depends on `resume_intent_requested` from `:61`.
- `13-submit-for-review.yaml`: `verify-push-remote` (`:126`) and `verify-push-signatures` (`:149`), as above.

None of this is expressible. The schema has four step kinds and none of them is "concurrent" (`activity.schema.ts:153`).

---

## The coupling law

**Every reading this system acts on is taken one turn before the action, and the interface presents it as current.**

Three instances, ranked by damage-per-visibility:

1. **`may_continue`** (2.1) — read at activity open, acted on at activity close, understating consumption by up to
   208,000 characters. Damage: a wasted continuation turn plus a full replacement spawn. Visibility: documented in
   three places (`batch.ts:147`, `config.ts:190`, `dispatch-activity.md:97`) and unfixable from the worker's side.
2. **`agent_id` continuity** (1.4) — asserted at mint, trusted forever, never verified. Damage: a worker silently
   executes an activity whose instructions arrived as hashes. Visibility: **none**. No event, no error, no counter.
   This is the widest damage with the least visible cause.
3. **`state.currentActivity`** (1.3) — read by `get_technique` at call time, set by the orchestrator at transition
   time, with no parameter to pin the two together. Damage: a lazy fetch resolved against the wrong activity.
   Visibility: an error if the step id is absent from the new activity, **silence if a same-named step exists**.

The topological reading of that law: this system's cost is not in its bytes, it is in the number of times it must
re-establish a reading across a turn boundary. 617 KB of work-package definition is one number; the ~300 MCP round
trips a full walk issues is the one that matters, and roughly half of them exist because a decision available at time
T was deferred to time T+n.

---

## Opportunities

Ordered by saving per unit of build. Every row names a surface.

| # | Opportunity | Saving | Cost to build |
|---|---|---|---|
| **O1** | **Gate-aware eager bundling.** Wire `evaluateWhenExpression` (`when-expression.ts:301`) into the bundler at `workflow-tools.ts:898–900`: for each gated technique step, evaluate its `when` against `sessionView(state).variables`; bundle where it evaluates decidably true, stay lazy where false or where a named variable is unbound. | Moves **44 work-package + 6 meta** technique steps from guaranteed-lazy to bundleable. `13-submit-for-review` goes from 0 bundled to up to 13 (7 on a create/non-stealth run); `11-validate` from 0 to 5; `14-complete` from 6 to 13. Each avoided fetch is one MCP round trip and one worker turn-fragment. Budget headroom is free — the eager budget at 200k tokens is 640,000 chars against a 617 KB whole corpus. | Server change, ~1 function call plus a tri-state (true/false/unknown) return so unbound variables stay lazy. `evaluateWhenExpression` returns `boolean`, so it needs an `unknown` arm or a pre-check that every named identifier is present in the bag. Guard: extend `scripts/check-when-expression.ts`. Risk: bundling a step whose gate flips mid-activity — bounded by restricting to variables not written by any earlier step of the same activity, which is exactly the 44/6 classification above. |
| **O2** | **Bundle loop bodies once.** The enclosing-loop exclusion in the same rule is stricter than it needs to be: a loop's runtime unknown is *how many times*, not *which operations*. Bundle loop-body technique steps that carry no own gate. | **30 of 31** work-package loop-body technique steps qualify. `08-implement`'s six-technique `task-cycle` stops re-fetching per task (≈36 calls → 6 for a six-task plan). | Same server surface as O1, one clause. Requires the bundled ▼ STEP block to be legible as "this runs every iteration" so the worker does not re-fetch out of habit — a note on `step_techniques_note`. |
| **O3** | **Report `may_continue` at the boundary, not at the open.** Add the post-activity batch reading to the point the worker actually decides: either a `batch` block on the `next_activity` response, or a cheap `batch_state` read the worker calls in `finalize-activity` before emitting `batch_may_continue`. | Removes the stale-true continue: one `next_activity`, one harness continuation turn, one refused `get_activity`, and one replacement spawn per occurrence. Frequency is already countable — `batch_refused` events are recorded per scope/activity/limit (`batch.ts:206–229`). | Server change in `src/tools/` plus a one-line change to `activity-worker.md:54` and `finalize-activity.md`. `batchState` is already exported and side-effect-free, so the read is nearly free. |
| **O4** | **Park the review wait instead of spinning it.** Split `13-submit-for-review` at `mark-ready` (`:330`): everything before it is one activity ending in a parked terminal transition; `review-received` onward is re-entered on resume. | Takes the full human-review latency off worker-context lifetime and off the session-wide `activeCheckpoint` lock. Also removes the corpus's most consequential unbounded loop (one of five). | Definition edit: one activity split into two, one new transition, one entry in the resume path. The replay cache (2.3) already makes re-entry work; `checkpointResponses` will need the parked gate excluded from replay or the resume answers itself. |
| **O5** | **Fix the four ordering defects.** 3.1 (move `platform-selection` to after `:183`), 3.2 (add `needs_issue_creation` conjunct), 3.3 (hoist signing check above the GitNexus index), 3.6 (condition `build-artifact-check` on a non-empty command list). | 3.1 repairs a broken create path. 3.2 and 3.6 each remove one gate cycle (4 MCP calls + 2 turn boundaries + ≥3s) from a common path. 3.3 saves a full repo index on every unsigned-repo run. | Four definition edits, no server change. 3.1 and 3.2 want a guard: extend `scripts/check-checkpoint-entry.ts` to flag a checkpoint whose `setVariable` targets are read by an earlier step of the same activity. That guard would have caught 3.1 mechanically. |
| **O6** | **Merge the stealth gates** (3.5): hoist `verify-push-signatures` above `:133`, collapse `private-remote-confirmation` and `push-confirmation` into one decision. | One gate cycle per stealth run, and one coherent decision replacing two partial ones. | Definition edit. Note the deliberate friction: three gates on an irreversible push is defensible as a safety design. The trade is real and should be stated, not assumed away. |
| **O7** | **Fingerprint the replay cache** (2.3). Extend the `checkpointResponses` key or record from `<activity-id>-<checkpoint-id>` to include a hash of the variables the checkpoint's `condition` and option effects name; replay only on a match, otherwise re-ask. | Stops a resumed session silently re-applying a decision about a world that has moved (`pr-check` binding a dead PR number is the concrete case). | Server change at `workflow-tools.ts:1340` and `:1631`, plus a migration arm in `src/utils/session/migration.ts:220–255`, which already normalises two legacy shapes. Cheap; the risk is over-invalidation re-asking questions whose answer did not really depend on the changed variable. |
| **O8** | **Pin the worker's activity on lazy fetches** (1.3). Add an optional `activity_id` to `get_technique`; when supplied and unequal to `state.currentActivity`, refuse with a named error instead of resolving against the pointer. | Converts a silent wrong-activity resolution into a loud one. Prerequisite for any topology where the orchestrator advances while a worker is still fetching. | Server change, one parameter and one comparison in `resource-tools.ts`. Backward compatible (optional). |
| **O9** | **Collapse the 29 duplicate bindings** (3.7), starting with `08-implement`'s three `review-assumptions::record` steps and `15-codebase-comprehension`'s 9→5. | 29 round trips that today return a 16-hex hash. Smallest per-item saving here, but it is pure subtraction. | Definition edits across 11 activities. Some duplicates are legitimate — the same operation applied to different inputs at different points — so this is a case-by-case review, not a sweep. A guard counting duplicate bindings per activity would make regressions arguable, in the warn-only style of `src/utils/fan-out.ts:121–131`. |
| **O10** | **Make fan-out visible** (1.2). Have `scatter-gather`'s parallel mode mint a child `agent_id` per instance and have instances call the server directly, or add a `record_fanout` counterpart to `record_usage` so instance counts and costs land in history. | The batch settings are revised from per-activity usage rows (`config.ts:196–198`); today those rows silently aggregate N-way fan-out into one serial-looking figure. Fixing this fixes the evidence base for every other batch tuning decision. | The larger build. Direct instance calls collide with 1.1 — the single `activeCheckpoint` and single `currentActivity` mean instances cannot take activities, only techniques and resources, which is probably the right restriction. `record_fanout` is the cheap version: one tool in `src/tools/workflow-tools.ts`, one event type, no protocol change. |

---

## Alternative topologies, and what each trades

**A. Today — serial batch-of-3, one context per run.** 15 activities, cap 3, budget binding at 2 on heavy content
(`config.ts:176–182`), so 5–8 worker contexts per work-package walk. Each boundary re-establishes context; each of the
~28 firing gates costs 4 MCP calls, 2 turn boundaries and ≥3 seconds. *Trades:* maximal simplicity and a session model
that cannot race, against ~300 round trips and a wall clock dominated by 3.4.

**B. Same shape, cheaper deliveries — O1 + O2 + O3 + O5.** No topology change at all. Bundling reaches 122 of 174
work-package technique steps instead of 78; loop bodies stop repeating; the batch boundary stops mispredicting; four
gate cycles come off common paths. *Trades:* the eager bundle grows, so a worker's first payload is larger and a
context lost early loses more — mitigated because the budget is nowhere near binding (2.4). This is the highest
return per unit of build and requires no change to the concurrency model.

**C. Detection fan-out inside activity 01.** Run `detect-review-mode`, `detect-merge-strategy`, `detect-project-type`
and `check-issue` as one `spawn-concurrent` batch through the existing `scatter-gather` primitive, and hoist the
signing check above the GitNexus index (3.3). *Trades:* four serial detections become one round; but per 1.2 the
server sees none of it, so the cost moves off the measured path rather than off the bill. Only worth doing with O10,
or the batch settings degrade further.

**D. Gate batching — collect, then ask once.** Several activities present a run of gates with no work between them.
Collecting the decidable ones and presenting a single multi-part checkpoint would cut cycles proportionally. *Trades:*
this fights the `blocking: false` + `autoAdvanceMs` design already in place on 15 work-package checkpoints, which
solves the same problem differently by not waiting. Extending auto-advance coverage is the cheaper half of this idea;
a genuine multi-question checkpoint is a schema change (`CheckpointStepSchema`, `activity.schema.ts:123`) and touches
`present_checkpoint` / `respond_checkpoint` / the `option_id` contract.

**E. Sub-session fan-out via `dispatch_child`.** The only concurrency the server can currently see. Each child gets its
own pointer, checkpoint slot, batch ledger and planning folder. *Trades:* real isolation and real visibility, against
a whole session's setup per branch — and children cannot share a variable bag, so anything the branches must agree on
has to round-trip through the parent. Right for genuinely independent work (research strands, review perspectives);
wrong for four detections that all write into one bag.

**F. Per-agent activity pointers.** Replace the single `currentActivity` / `activeCheckpoint` with per-`agent_id`
slots, letting several workers hold different activities of one session. *Trades:* this is the only change that makes
intra-session concurrency expressible, and it is the largest. It touches the session schema, all six
`assertNoActiveCheckpoint` sites, `next_activity`'s exit-prior bookkeeping (`workflow-tools.ts:580–617`), the
step-manifest validation, and every resume path. It also needs O8 first, because per-agent pointers make 1.3 a routine
occurrence rather than a race. Not recommended ahead of B, which buys most of the throughput for a fraction of the
risk.

**Recommended sequence:** B (O1, O2, O3, O5) → O4 → O7, O8 → measure with `bench:batch` and the `batch_refused`
counts → then decide between C+O10 and F on evidence the current instrumentation cannot yet produce.
