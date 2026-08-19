---
target: /home/mike1/projects/dev/workflow-server — workflows/meta/**, workflows/work-package/**; implementation surface src/**, scripts/**, tests/e2e/**
date: 2026-08-18
lens: sdl-coupling (14)
dimension: Orchestration Topology and Critical Path
---

# Orchestration Topology and Critical Path — coupling lens

What sets a run's wall-clock, which of its round trips are forced by a data dependency, and which are forced only by the order the definitions happen to be written in.

Every figure below was measured on 2026-08-18 against the build at `1297e655` (server) and `2e8b6297` (corpus), after the remediation of 2026-08-17/18. Nothing is quoted from the prior report without re-measurement.

---

## The measurement that reframes the dimension

The 12-activity walk was re-run twice under `scripts/run-token-benchmark.ts` and reproduces the recorded figures exactly: **242 tool calls, 1,302,319 delivery characters**. The new number is the one nobody had taken: the audit log carries `duration_ms` on every call, and the whole walk costs the server **9,325 milliseconds**.

| Tool | Calls | Total server ms | Mean ms | Max ms |
|---|---:|---:|---:|---:|
| `get_resource` | 162 | 5,435 | 33.5 | 50 |
| `get_technique` | 24 | 1,433 | 59.7 | 71 |
| `get_activity` | 12 | 1,092 | 91.0 | 128 |
| `next_activity` | 12 | 441 | 36.8 | 44 |
| `yield_checkpoint` | 10 | 365 | 36.5 | 53 |
| `respond_checkpoint` | 10 | 348 | 34.8 | 39 |
| `start_session` | 1 | 98 | 98.0 | 98 |
| `get_workflow` | 1 | 76 | 76.0 | 76 |
| `resume_checkpoint` | 10 | 37 | 3.7 | 5 |
| **Total** | **242** | **9,325** | **38.5** | **128** |

Against that, the recorded 2026-08-17 evaluation run issued 352 tool calls over 156.7 minutes of dispatch time (`04-session-trace.md`), a mean of **26.7 seconds of wall-clock per tool call** — and that run's per-dispatch means range from 10.6 to 35 seconds a call across nine dispatches. The server is between 300 and 900 times faster than the turn that calls it.

So the whole of this dimension reduces to one arithmetic. **A round trip removed is worth roughly 26 seconds. A byte removed is worth whatever that byte adds to a model turn's prefill, which is real but second-order.** The two are not interchangeable, and the repository's only cost instrument prices exactly one of them.

Two more terms sit on the critical path and are invisible to the headless benchmark:

- **Context establishment.** `scripts/run-batch-benchmark.ts:39-42` prices a dispatch at a measured 87 seconds before the worker's first server call — the mean of four real dispatches (77, 65, 42, 165 s) on the profiled 27 July run. The 12-activity walk needs 5 worker contexts at today's settings (measured below), which is 7.25 minutes of establishment.
- **Gate floors.** `src/tools/workflow-tools.ts:1586` sets a 3-second minimum between a yield and its response, and `:1646-1652` refuses an auto-advance before the full `autoAdvanceMs` has elapsed. Ten gates fire on the walk; five of them carry a 30-second timer, so the server-imposed floor is 30 seconds and the ceiling on unattended running is 180. The e2e harness sets `minCheckpointResponseSeconds: 0` (`tests/e2e/harness.ts:42`), so the benchmark never pays either.

---

## Census

Counted by parsing every activity file and flattening loop bodies into the parent.

| | work-package | meta |
|---|---:|---:|
| Activities | 15 | 5 |
| Steps, all kinds | 266 | 44 |
| — technique | 176 | 23 |
| — checkpoint | 44 | 5 |
| — action | 31 | 14 |
| — loop | 15 | 2 |
| Steps carrying their own `when` | 83 | 19 |
| Steps carrying their own `condition` (non-loop) | 40 | 6 |
| Steps gated by any gate, own or enclosing | 158 | 26 |
| Technique steps so gated | 91 | 12 |
| Distinct technique names bound | 111 | 23 |
| Duplicate bindings within one activity | 30 | 0 |
| Technique steps inside a loop body | 31 | 6 |
| — of those, carrying no gate of their own | 30 | 0 |
| Checkpoints inside a loop body | 9 | 1 |
| Checkpoints with a per-iteration `#{…}` discriminator | 5 | 1 |
| Checkpoints with no gate at all | 11 | 1 |
| Checkpoints declaring `defaultOption` + `autoAdvanceMs` | 15 | 0 |
| Total declared auto-advance timer | 435 s | 0 s |
| Checkpoints declaring `blocking: true` | 14 | 2 |
| Unbounded `while` / `doWhile` loops | 3 | 0 |

**Where the census disagrees with the grounding.** The plan's headline figures — 176 technique steps, 44 checkpoints, 83 when-gated steps for work-package; 23, 5 and 19 for meta — all reproduce exactly. Three figures carried over from the 2026-08-17 report do not:

- That report counted **174** technique steps and **145** distinct techniques against 176 and 111 here. The step count differs by two; the distinct count differs because this census counts the *binding name* written in the activity YAML, and the earlier one counted resolved ids across the whole corpus. On the binding-name basis, 176 steps bind 111 names.
- That report counted **29** duplicate bindings; this one counts **30** within a single activity. `codebase-comprehension` binds 9 steps to 5 names, `start-work-package` 32 to 26.
- That report counted **8** loop-body gates and **five** unbounded loops. This census finds **9** loop-body checkpoints and **3** unbounded condition loops (`03-requirements-elicitation.yaml:84`, `15-codebase-comprehension.yaml:50`, `13-submit-for-review.yaml:350`); two further loops are `forEach` with no `maxIterations`, bounded by their collection rather than unbounded.

---

## The walked path

The benchmark walks 12 of the 15 activities under the skip-optional policy: `start-work-package → design-philosophy → codebase-comprehension → plan-prepare → assumptions-review → implement → lean-coding-audit → post-impl-review → validate → strategic-review → submit-for-review → complete`.

Per activity, the calls that walk actually issues:

| Activity | `get_activity` | `get_technique` | `get_resource` | gates | server ms |
|---|---:|---:|---:|---:|---:|
| start-work-package | 1 | 6 | 15 | 2 | 1,067 |
| design-philosophy | 1 | 0 | 13 | 1 | 555 |
| codebase-comprehension | 1 | 3 | 16 | 0 | 755 |
| plan-prepare | 1 | 1 | 14 | 1 | 661 |
| assumptions-review | 1 | 0 | 7 | 0 | 353 |
| implement | 1 | 0 | 10 | 0 | 417 |
| lean-coding-audit | 1 | 0 | 14 | 1 | 574 |
| post-impl-review | 1 | 1 | 25 | 2 | 1,066 |
| validate | 1 | 0 | 7 | 0 | 295 |
| strategic-review | 1 | 2 | 14 | 0 | 626 |
| submit-for-review | 1 | 9 | 10 | 3 | 1,215 |
| complete | 1 | 2 | 17 | 0 | 740 |

The ten gates that fire are `issue-verification`, `pr-creation`, `classification-and-path-confirmed`, `approach-confirmed`, `audit-findings-confirmed`, `file-index-table`, `local-validation-permission`, `dco-sign-off-confirmation`, `body-non-conformant`, `review-outcome`. **Thirty-six checkpoint definitions ship on this path and ten fire** — the other 26 are review-mode, stealth-mode, Jira-platform or issue-creation branches that the walk delivers and never reaches.

A real hierarchical run issues more than 242 calls. The robot walker skips `present_checkpoint` (ten calls, one per gate — `present-checkpoint-to-user.md:24`), skips `record_usage` (twelve, one per activity — `dispatch-activity.md:67` makes it mandatory), and skips the orchestrator's opening `get_workflow_status` (`workflow-orchestrator.md:33`). **A real walk is about 265 server calls**, and each activity boundary additionally carries a git commit and a push to the remote before the transition may be evaluated (`commit-and-persist.md:38`) — twelve network round trips the benchmark cannot see.

---

## Findings

| ID | Severity | Title | Buys |
|----|----------|-------|------|
| CP-01 | HIGH | 153 of 162 resource fetches are one wave serialised by document order | round trips |
| CP-02 | HIGH | The cost gate is denominated in characters, so no round-trip saving can be defended | round trips |
| CP-03 | HIGH | The boundary-accurate batch reading landed in the server and no caller asks for it | round trips |
| CP-04 | HIGH | The review wait still holds a worker, a batch identity and the session-wide lock | wall-clock |
| CP-05 | MEDIUM | Raising the batch cap buys exactly one dispatch; the budget is what binds | wall-clock |
| CP-06 | MEDIUM | Eight of eleven activity boundaries carry no routing decision | round trips |
| CP-07 | MEDIUM | A gate is four server calls and six agent boundaries; the corpus prices three | round trips |
| CP-08 | MEDIUM | Four fifths of adjacent step pairs have no declared data edge, and the schema cannot say so | round trips |
| CP-09 | MEDIUM | The new ordering guard sees only the top-level steps of one activity | correctness |
| CP-10 | MEDIUM | Neither batch setting can be varied by the instruments meant to price them | evidence |
| CP-11 | LOW | Reference delivery cuts a third of the bytes and leaves 71 round trips returning a hash | bytes |
| CP-12 | LOW | The replay cache still carries no fingerprint of the state it decided about | correctness |
| CP-13 | LOW | meta drives every run and has no cost instrument at all | evidence |

---

### CP-01 — 153 of 162 resource fetches are one wave serialised by document order (HIGH)

Attributing each `get_resource` call to the response that revealed its id: **153 of the 162 fetches follow directly from a `get_activity` response, and only 9 follow a lazily fetched technique.** Every id in the larger group is known the instant the activity payload lands. The corpus says so itself — `resource-loading-via-tool` (`workflow-engine/TECHNIQUE.md:28`) states that the ids come from "the `resources` map keys, `resource_refs`, and the refs in the operation bodies this response carried", all of which arrive in one response.

Nothing about those 153 fetches is ordered. `get_resource` (`src/tools/resource-tools.ts:865-899`) takes one id, reads the session pointer, resolves a file and returns it; it writes no variable, and no fetch's result changes what the next fetch asks for. Collapsed into contiguous bursts, the 162 calls are **16 waves** — one to three per activity, the largest 25 calls deep in `post-impl-review`.

What forces the serialisation is prose. `activity-worker.md:52` says "Execute each activity step in document order"; `progressive-step-technique-load` (`workflow-engine/TECHNIQUE.md:82`) says "A step's bound technique loads as that step is reached; the whole activity is never pre-fetched." Both rules are aimed at context economy — do not pay for what you may not execute — and both were written when the cost being managed was bytes. Neither is a data dependency.

*Saving, round trips:* collapsing every wave to one turn takes the walk from **242 round trips to 96**, a 60.3% reduction, at zero byte change. Adding a plural `resource_ids: string[]` to `get_resource` makes it 96 actual server calls rather than 96 turns issuing 242 calls, so the saving survives a harness that does not parallelise tool calls. The same treatment of `get_technique` — 24 calls in 9 contiguous waves — removes a further 15.
*Build cost:* one optional array parameter on each of two tools, with the single-id form retained; the handlers already loop over a resolved list for eager bundling (`workflow-tools.ts:1110-1130`). Two sentences in `resource-loading-via-tool` and `progressive-step-technique-load` to say that a step's *content* may arrive early even though its *execution* stays in document order. The begin-beat protocol (`workflow-tools.ts:1185`) already separates those two things for bundled steps, so the distinction is one the corpus makes elsewhere.
*Risk:* a worker that pre-fetches a resource for a step it later skips pays bytes it would not have paid. That is the trade the eager-bundling budget already makes, and it is bounded by the same budget.

### CP-02 — The cost gate is denominated in characters, so no round-trip saving can be defended (HIGH)

`evaluateGate` (`scripts/run-token-benchmark.ts:340-360`) compares one quantity against the fixture: `deliveryChars`, the sum of `get_activity`, `get_workflow`, `get_resource` and `get_technique` characters. Call counts are computed and printed in the scorecard (`:305-307`) and never gated. `.github/workflows/verify.yml:83` runs `bench:token --gate` and nothing else — `bench:batch`, which reports dispatches avoided, and `bench:dispatch`, which prices a respawn against a resume, do not run in CI at all.

The consequence is exact and mechanical. **A change that removes 146 round trips and no bytes registers as 0% and is invisible to the gate. A change that adds 1.1% to delivery in order to remove fifty round trips fails it.** Run today, the gate passes at precisely 0.0% against the fixture, with `get_resource calls 162 → 162` printed four lines above the verdict and playing no part in it.

This is the structural reason the slow half of the complaint has not moved while the expensive half has. Every rule in the delivery contract is denominated the same way: `fetch-costs-what-it-delivers` ("A fetch hands over the whole composed body — thousands of characters"), `resource-section-or-whole` ("Choose bare vs `#section` by how much of the resource this agent context will need"). Both optimise the payload. Neither mentions the call.

*Saving:* none directly. It is the precondition for CP-01, CP-03, CP-06 and CP-07 being arguable at all.
*Build cost:* add `toolCalls` totals to the gated set with their own threshold, and run `bench:batch --gate` beside `bench:token`. The fixture already records `toolCalls`, so no re-recording is needed. About thirty lines and one CI step.

### CP-03 — The boundary-accurate batch reading landed in the server and no caller asks for it (HIGH)

`batchState` answers `mayContinue` from the events recorded so far, and its own comment states the window: "`mayContinue` is answered before the lazy fetches of the activity just taken draw down the same budget, so `true` can still become a refusal at the next boundary" (`src/utils/batch.ts:146-148`). On the walked path that window is large. The eager payload of an activity is 4,328 to 108,304 characters; with lazy fetches counted, the same activities cost 36,047 to 198,747. The reading taken at `get_activity` understates what the activity will consume by a median of roughly 50,000 characters, against a 280,000-character budget.

The remediation fixed this on the server. Commit `ab810342` added a `_meta.batch` block to `next_activity` (`src/tools/workflow-tools.ts:744-758`), computed at the boundary, after the exiting activity's lazy fetches are in the history — precisely the reading a continue-or-respawn decision wants. `docs/dispatch_model.md:103` documents it: "pass the exiting worker's `agent_id` and `context_tokens` and its `_meta.batch` counts those lazy fetches."

**No call site in the corpus passes `context_tokens` to `next_activity`.** `dispatch-activity.md:50` calls `next_activity { session_index, activity_id, step_manifest }`. `continue-batch.md:46` adds `agent_id` and stops there. `context_tokens` appears exactly once in the whole corpus, in `compose-prompt.md:45`, where it is bound to `get_activity`. Both consumers of the answer still read the stale one: `batch-is-bounded-by-the-server` (`dispatch-activity.md:97`) tells the orchestrator to "continue a worker while the `activity_complete` envelope reports `batch_may_continue` true", and `batch-ends-where-the-server-says` (`activity-worker.md`) tells the worker to read `may_continue` from the block leading its `get_activity` response.

The server offers a fresh reading; the definitions ask for the stale one and then document the staleness as an expected outcome.

*Saving, round trips:* each stale-true continuation costs an advance with the session pointer already moved, an orchestrator turn, a `continue-agent` that re-establishes the worker, a refused `get_activity`, a report back, a fresh identity and a full respawn — around 87 seconds of establishment plus four turn boundaries, per occurrence. The occurrences are already counted: `recordBatchRefusal` (`src/utils/batch.ts:206`) writes one `batch_refused` event per scope, activity and limit.
*Build cost:* add `context_tokens` to two tool-call signatures in two technique files, and change two rules to read `_meta.batch.may_continue` from `next_activity` rather than `batch_may_continue` from the envelope. No server change. This is the completion of work already paid for.

### CP-04 — The review wait still holds a worker, a batch identity and the session-wide lock (HIGH)

`13-submit-for-review.yaml:347-387` declares `await-review-loop`, a `doWhile` on `awaiting_review == true` with **no `maxIterations`**. Its body is one empty action and the `review-received` checkpoint, whose `no-waiting` option sets `awaiting_review: true` and asks again. The worker polls a human for the duration of a real pull-request review.

Three things are held for that whole period. The worker's context stays live and billable. The batch identity cannot be released, because `delivery-keys-on-agent-context` binds it "for as long as that worker carries its batch". And the session's single `activeCheckpoint` slot stays occupied — which matters because `assertNoActiveCheckpoint` is called by **five delivery tools**: `get_workflow` (`workflow-tools.ts:421`), `get_activity` (`:808`), `get_trace` (`:1771`), `get_technique` (`resource-tools.ts:651`) and `get_resource` (`:881`). The check reads `state.activeCheckpoint` with no agent component, so it is a **session-wide mutex, not a per-context one**: while one gate is open, no context anywhere in the session can read anything. `next_activity` refuses independently (`workflow-tools.ts:542-548`).

That same mutex is why the "run independent work concurrently" opportunity cannot be taken by spawning parallel workers inside a session. Seven of fifteen work-package activities declare `techniques: [scatter-gather]` at the activity level, and `harness-compat/spawn-concurrent.md` dispatches real concurrent instances — but those instances never call the server under their own identity, and if they did, the first one to reach a gate would freeze the rest.

*Saving, wall-clock:* the entire human-review latency comes off worker-context lifetime and off the session lock. It is the single largest wall-clock item anywhere in the topology and it is structural rather than incidental.
*Build cost:* split the activity in two at the mark-ready step, with one new transition and one resume entry. The replay cache already makes re-entry work; the parked gate must be excluded from replay or the resume answers itself.

### CP-05 — Raising the batch cap buys exactly one dispatch; the budget is what binds (MEDIUM)

The counterfactual the plan asked for, measured directly by driving the server with `batchMaxActivities` overridden and walking all twelve activities:

| `BATCH_MAX_ACTIVITIES` | Worker contexts | Eager delivery chars | Where a new context starts |
|---:|---:|---:|---|
| 1 | 12 | 904,085 | every activity |
| **3 (today)** | **4** | **730,060** | plan-prepare, lean-coding-audit, strategic-review |
| 6 | 3 | 728,358 | assumptions-review, submit-for-review |
| 12 | 3 | 728,358 | assumptions-review, submit-for-review |

At a cap of 6 and above the answer stops changing: the 280,000-character budget (200,000 tokens × 0.35 × 4) binds before the activity cap does. Repeating the arithmetic with lazy fetches counted at their measured per-activity totals gives 5 contexts at today's settings and 4 with the cap removed entirely.

**Raising the cap from 3 buys exactly one dispatch** — about 87 seconds and 1,702 characters — and raising it past 6 buys nothing. Batching at 3 has already captured seven of the eight avoidable dispatches; the eighth is the whole remaining prize. The lever that still has travel is the budget, and the budget is a byte quantity, so it is CP-01's and the Delivery Economy dimension's business rather than the cap's.

*Saving, wall-clock:* one dispatch, 87 seconds at the measured spawn cost.
*Build cost:* one default changed from 3 to 6 in `src/config.ts:165`. The risk the cap covers is real and not measured here — establishment the server never sees, code the worker reads, artifacts it drafts, degradation across a long walk — so the change wants `batch_refused` counts from real runs behind it. Which is what CP-10 makes impossible today.

### CP-06 — Eight of eleven activity boundaries carry no routing decision (MEDIUM)

Reading every `transitions:` block: **nine of work-package's fifteen activities declare exactly one transition with no condition on it.** On the walked path, eight of the eleven non-terminal boundaries have precisely one possible successor — `start-work-package`, `design-philosophy`, `plan-prepare`, `implement`, `lean-coding-audit`, `post-impl-review`, `validate`, and (off-path) `research` and `implementation-analysis`. Only `codebase-comprehension` (4 transitions), `assumptions-review` (5), `strategic-review` (3) and `submit-for-review` (3) route on state.

Every one of those eight boundaries nonetheless costs an orchestrator round trip. The worker cannot cross it: `worker-control-plane-ban` (`activity-worker.md`) forbids the worker calling `next_activity` or `get_workflow`, and `one-advance-per-activity` (`continue-batch.md:68-72`) makes the advance the orchestrator's alone. The boundary exists for three reasons and routing is not one of them — the commit and push (`commit-and-persist.md:38`), the usage row (`account-every-activity`), and the pointer advance.

The commit is the load-bearing one and it is genuinely ordered: `continue-batch.md:47` says "Advance only where the finished activity is already committed: this call is the transition that commit has to precede." So the boundary is real. What is conventional is that a *decisionless* boundary costs the same as a deciding one.

*Saving, round trips:* a `next_activity` that accepts the routing decision the worker already computed — `finalize-activity` has it, and `dispatch-activity.md:59` already treats `worker_result.next_activity_id` as authoritative — lets the eight decisionless boundaries be crossed without a separate orchestrator deliberation turn. The call remains; the turn spent deciding what to pass it does not.
*Build cost:* no server change. One rule in `workflow-orchestrator.md` distinguishing a single-transition exit (enact it) from a conditional one (evaluate it). A guard that flags an activity whose transitions are one unconditional default is four lines against the same parse `check-decision-order.ts` already does.

### CP-07 — A gate is four server calls and six agent boundaries; the corpus prices three (MEDIUM)

The benchmark records ten `yield_checkpoint`, ten `respond_checkpoint`, ten `resume_checkpoint` — thirty calls. The real protocol is four. `present_checkpoint` sits between the yield and the response (`present-checkpoint-to-user.md:24`), and `present-before-any-resolution` (`:33`) makes it unskippable: "Every resolution path — `option_id`, `auto_advance`, or `condition_not_met` — MUST be preceded by an `AskQuestion`."

The agent boundaries are six per gate, from `docs/checkpoint_model.md:9-72`: worker yields and stops; orchestrator echoes the block and sleeps; meta orchestrator calls `present_checkpoint` and asks the user; user answers; meta resumes the orchestrator; orchestrator resumes the worker; worker calls `resume_checkpoint`. Each of those is a model turn that reads and re-emits state. **Ten gates are 40 server calls and about 60 agent-boundary crossings**, on top of two server-side floors: 3 seconds minimum per gate (`workflow-tools.ts:1586`), and the full `autoAdvanceMs` on the five fired gates that declare one — 150 seconds if nobody answers.

Of the 44 work-package checkpoints, **17 read and template nothing their own activity produces**, which is the mechanical test for whether a gate could be hoisted out of the activity and batched with others. But of the ten gates the walk actually fires, only **three** pass that test, and one of those three fails on inspection: `approach-confirmed`'s message is "Approach presented above. Select whether to confirm or revise" (`06-plan-prepare.yaml:93`). It depends on an artifact and a conversation, neither of which the variable contract names. So the mechanical test finds a gate hoistable that plainly is not.

That is the finding underneath the finding. **The I/O contract cannot express the dependency that actually pins a gate's position**, so hoistability cannot be decided by a guard, and the earlier estimate of "20 presentations down to eight or ten" is not supportable on the ordinary create path. The honest figure is three candidates out of ten fired gates, each needing a human read.

*Saving, round trips:* batched presentation of the per-iteration gates remains the large item — five checkpoints in work-package carry a `#{…}` discriminator and fire once per collection item, and `assumptions-review` already hand-rolls exactly that escape with `residual-assumption-batch`. Hoisting is worth at most three gates on this path, around 12 server calls and 18 boundary crossings.
*Build cost:* a batched-presentation tool for the loop gates. For hoisting, an artifact or presentation dependency the contract can carry, so the question is decidable at all.

### CP-08 — Four fifths of adjacent step pairs have no declared data edge, and the schema cannot say so (MEDIUM)

Building each activity's step graph from declared technique inputs and outputs, binding remaps, action `set` targets, checkpoint option effects and gate reads: on the walked path, **114 of 145 adjacent non-checkpoint step pairs (79%) have no producer-to-consumer edge between them.** `post-impl-review` reaches 100% — all thirteen of its adjacent pairs are contract-independent, including `manual-diff-review`, `code-review`, `structural-analysis-inline` and `test-suite-review`, four read-only analyses run one after another. `implement` is 91%, `plan-prepare` 89%.

Some of those pairs are genuinely ordered by side effects the contract does not name — `push-commits → update-description` and `implement-task → run-tests` are real orderings that no variable records. That is the point. **Where the ordering is real, the contract cannot prove it; where the ordering is incidental, nothing can exploit it.** Both halves are the same defect: sequence is carried by document position and by nothing else.

The schema offers no way out. `StepSchema` (`src/schema/activity.schema.ts:153`) is a discriminated union over four literals — `technique`, `action`, `checkpoint`, `loop` — and `loopType` admits `forEach`, `while` and `doWhile`. There is no concurrent kind and no step-group construct. Seven activities declare `scatter-gather` at the activity level, and `spawn-concurrent.md` exists, but neither can be attached to a run of steps in the file, and per CP-04 the session lock would refuse the result.

*Saving, round trips:* four independent detections in `start-work-package` (`derive-host-repo`, `detect-merge-strategy`, `detect-project-type`, `analyze-repo-with-gitnexus`, at lines 141-176) become one wave; four read-only reviews in `post-impl-review` become one. Each wave is n turns collapsing to one.
*Build cost:* a `concurrent: true` flag on a step group, which the schema does not have. Note the accounting trap — fan-out inside a technique body is invisible to the server, so without a fan-out recording event the cost moves off the measured path rather than off the bill. `src/utils/fan-out.ts` does not help here: despite the name, it measures how much of a delivered operation is inherited rules and I/O declared above it, warn-only, and knows nothing about concurrency.

### CP-09 — The new ordering guard sees only the top-level steps of one activity (MEDIUM)

`scripts/check-decision-order.ts` was added by the remediation and it works: the four ordering defects the prior report named are closed. `platform-selection` now sits at `01-start-work-package.yaml:217`, above all nine of its readers. `jira-project-selection` (`:337`) carries the `needs_issue_creation == true` conjunct. `verify-signing-precondition` (`:154`) precedes `analyze-repo-with-gitnexus` (`:160`), so an unsigned repository fails before it pays for the index. `build-artifact-check` (`13-submit-for-review.yaml`) carries a `project_type == 'rust-substrate'` clause, which is what took the walk from eleven checkpoint round trips to ten.

The guard's reach is narrower than the class it names. `collectFindings` (`:173-207`) iterates `def?.steps` at `:187` and searches `steps.slice(0, index)` at `:193` — **top-level steps only, and only within one activity file**. Three things escape it:

- **Loop bodies.** A checkpoint inside a loop that decides a value an earlier step of the same body reads is not scanned. Nine work-package checkpoints sit in loop bodies.
- **Cross-activity ordering.** Four variables are decided by a checkpoint in one activity and read by gates in later ones: `is_review_mode` (decided in `start-work-package`, gating steps in **nine of the twelve walked activities**), `issue_platform`, `problem_complexity` and `run_local_validation`. The graph is acyclic on the walked path today — a producer-index sweep finds no variable read before its earliest producer — but nothing checks that it stays so.
- **Artifact and presentation dependencies**, per CP-07.

`is_review_mode` is the coupling with the widest reach in either workflow: one gate answer in the first activity fixes the shape of nine of the remaining eleven.

*Saving:* correctness, not time. The guard closed four defects and would not catch their loop-body or cross-activity equivalents.
*Build cost:* recurse into `steps` (about ten lines), and add a second pass over the transition graph that orders activities topologically and checks producer-before-reader across the whole walk. The producer index the server already builds (`src/utils/binding-provenance.ts:111`) supplies both sides.

### CP-10 — Neither batch setting can be varied by the instruments meant to price them (MEDIUM)

`docs/dispatch_model.md:97` states the evidence standard: "Revising either value needs evidence a byte count cannot supply… `batch_refused` counts and per-activity usage rows over real runs are what a revision rests on."

Both benchmarks go through `createHarness` (`tests/e2e/harness.ts:31-43`), which builds its config as an object literal. It never calls `loadConfig()`, so `BATCH_MAX_ACTIVITIES` and `BATCH_HEADROOM_FRACTION` are read from the environment nowhere in the test or benchmark path — setting either has no effect, which is how the twelve-activity `bench:batch` run above died at the cap of 3 with the override in place. The same literal sets `minCheckpointResponseSeconds: 0`, so the 3-second gate floor is switched off for every measurement.

The counterfactual in CP-05 exists only because it was driven around the harness with a directly constructed server. The repository's own tools cannot produce it.

*Saving:* evidence. Every batch tuning decision currently rests on a measurement the tools cannot vary.
*Build cost:* thread an optional config override through `HarnessOptions` and add `--max-activities` / `--headroom-fraction` flags to `bench:batch`. Roughly twenty lines.

### CP-11 — Reference delivery cuts a third of the bytes and leaves 71 round trips returning a hash (LOW)

The same walk under `--context-mode=persistent`:

| | fresh | persistent | delta |
|---|---:|---:|---:|
| Delivery characters | 1,302,319 | 891,439 | −31.5% |
| Tool calls | 242 | 203 | −16.1% |
| `get_resource` calls | 162 | 123 | −24.1% |
| `get_resource` characters | 527,683 | 91,591 | −82.6% |
| `get_activity` characters | 520,075 | 623,884 | **+20.0%** |
| Resource answers that were unchanged markers | 0 | 71 | — |

Two readings. First, reference delivery is a byte instrument, not a round-trip one: it removes 31.5% of the characters and 16.1% of the calls, and **71 of the 123 surviving resource calls (58%) return an unchanged marker** — a round trip that costs a model turn and delivers a hash. Second, the mode trades in both directions: `get_activity` grows by 103,809 characters because reference mode moves resource bodies into a sibling `resources` map (`workflow-tools.ts:1094`), buying 39 fewer separate fetches with more bytes in one response. That is the only place in the system where bytes are consciously spent to buy round trips, and it is a mode switch rather than a policy.

For scale on the other side of the same trade, `bench:dispatch` measures a fresh spawn against a resume of the same activity across six activities: 1,209,792 characters against 327,908, a 72.9% saving. Keeping a worker is worth roughly three times what collapsing its content is.

*Saving, bytes:* already available; the fresh-mode walk is the benchmark's deliberate worst case.
*Build cost:* none for the mode. Removing the 71 marker round trips is CP-01's plural parameter, since a wave that asks for twelve ids in one call returns twelve markers in one response.

### CP-12 — The replay cache still carries no fingerprint of the state it decided about (LOW)

`yield_checkpoint` looks up `state.checkpointResponses[`${activity_id}-${checkpoint_id}`]` (`workflow-tools.ts:1408-1409`) and, on a hit, returns `status: "replayed"` with the stored option and tells the worker to continue without yielding. The key is the activity id and the checkpoint id. Nothing else. The record is never cleared, expired or invalidated anywhere in `src/`.

A session resumed weeks later replays a "use the existing pull request" answer and re-binds a pull-request number that has since merged or closed. The same shape applies to `platform-selection` and `build-artifact-check`. On the topology side this is a *saving* that is sometimes wrong: `docs/dispatch_model.md:113` relies on it — "a replacement worker… re-crosses already-answered gates silently" — so replay is what keeps a failed resume to the cost of one activity. The mechanism is load-bearing and unguarded at the same time.

*Saving:* stops a resumed session silently re-applying a decision about a world that has moved.
*Build cost:* extend the record with a hash of the variables the gate's condition and option effects name. Over-invalidation is the risk — re-asking a question whose answer did not really depend on the changed variable.

### CP-13 — meta drives every run and has no cost instrument at all (LOW)

`bench:token --workflow=meta` does not complete: it fails at `run-token-benchmark.ts:490` reading `session.json` under a `transition-<uuid>` planning slug the walker generated and the benchmark does not track. So the workflow that carries every client run — and whose `dispatch-client-workflow` activity is a `while` loop re-entered once per client activity, capped at 200 iterations (`03-dispatch-client-workflow.yaml:22-28`) — has no recorded delivery figure, no call count and no gate.

Delivered in isolation to a fresh worker, meta's five activities cost 293,294 characters, and `dispatch-client-workflow` — the hot loop — is 39,332 of them with **zero step techniques eagerly bundled**, because all six of its technique steps are gated and none of the gates is answerable at delivery. Every one of its operations is a separate round trip, every time round the loop.

*Saving:* evidence, and a hot loop that is currently unmeasured.
*Build cost:* resolve the planning slug from the walk result rather than the input in the benchmark's meta path. One function.

---

## The round-trip ledger, separated from the byte ledger

Measured today: 242 server calls, 1,302,319 delivery characters, 9,325 ms of server compute, 5 worker contexts, 10 gates.

**Reduces round trips (the wall-clock half):**

| Change | Round trips removed | Bytes changed | Surface |
|---|---:|---:|---|
| CP-01 waves — plural `resource_ids`, plural `step_ids` | 146 of 242 (−60%) | 0 | server (2 params) + 2 rules |
| CP-03 boundary batch reading | one respawn cycle per stale-true, already counted by `batch_refused` | 0 | 2 technique files |
| CP-06 decisionless boundaries | 8 orchestrator deliberation turns | 0 | 1 rule + 1 guard |
| CP-07 batched loop-gate presentation | up to 5 per-iteration gates × collection size | small increase | server tool + 5 activity edits |
| CP-08 concurrent step groups | 2 waves on the walked path | 0 | schema + runtime |

**Reduces wall-clock without touching round trips:**

| Change | Saving | Surface |
|---|---:|---|
| CP-04 split the review wait out of the activity | the whole human-review latency, off worker lifetime and the session lock | 1 activity split |
| CP-05 raise the cap from 3 to 6 | 1 dispatch, 87 s | 1 config default |

**Reduces bytes:**

| Change | Saving | Surface |
|---|---:|---|
| CP-11 reference delivery | −31.5% delivery characters, −16% calls | already available; mode selection |

**Buys neither, and gates everything above:** CP-02 (the instrument), CP-10 (the tunability), CP-13 (the missing meta measurement), CP-09 and CP-12 (correctness).

---

## The coupling law

Three orderings run this system, and only one of them is a data dependency.

The first is **the commit**. An activity's artifacts must be on the remote before its transition is evaluated. That ordering is real, it is stated (`commit-and-persist.md:38`), and it is what makes the activity the indivisible unit of dispatch. Nothing here proposes weakening it.

The second is **the gate**. A human answer must arrive before the step that consumes it runs. That ordering is real too, and it costs four server calls, six agent boundaries and a 3-second server floor apiece — and it is enforced by a session-wide mutex that no two contexts in a session can be on opposite sides of.

The third is **document order**, and it is not a dependency at all. It carries 153 of the 162 resource fetches, 24 technique fetches, 79% of adjacent step pairs, and eight of eleven activity boundaries. Nothing checks it, because there is nothing to check: the schema has one construct for sequence and none for independence, so a step that must follow its predecessor and a step that merely happens to be written after it are the same object.

Which temporal assumption, violated, does the widest damage with the least visible cause? **That the answer taken at an activity's open is still the answer at its close.** It is the shape of `may_continue`, read at delivery and acted on a hundred thousand characters later. It is the shape of `gateAnswer`, which decides eager bundling against `bagAtOpen` (`workflow-tools.ts:986`) and correctly returns `undefined` for anything the activity itself writes — the one place the system defends the window and does so well. It is the shape of the replay cache, which answers a question with a decision taken in a world that no longer exists. And it is the shape of the whole cost programme: the instrument was calibrated when the cost was bytes, the rules were written to that instrument, the remediation moved bytes by 26.8%, and the run is still slow because the quantity that sets its wall-clock was never on the dial.

The server takes 9.3 seconds to serve this walk. Everything else is waiting.
