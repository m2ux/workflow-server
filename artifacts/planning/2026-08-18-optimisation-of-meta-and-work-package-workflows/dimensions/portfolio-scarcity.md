---
target: /home/mike1/projects/dev/workflow-server
date: 2026-08-18
lens: scarcity (08)
dimension: Change Economics
corpus: workflows@2e8b6297 (superproject pin 72db28ae)
baseline: .engineering/artifacts/planning/2026-08-17-meta-and-work-package-workflow-optimisation/EVALUATION-REPORT.md
---

# Change Economics — Scarcity

## Summary

A 12-activity work-package walk delivers **1,302,319 characters over 242 tool calls**. Reproduced twice against `workflows@2e8b6297`, byte-identical to `scripts/fixtures/token-benchmark-baseline.json`.

The floor is not close. **468,885 bytes** of definition source carry the whole walk — every activity file, every technique file, every resource section, each counted once. Today's delivery is **2.78 times** that. Between the floor and today sit three layers, and only one of them is inherent.

Server compute is not scarce and never will be: **8,510 milliseconds** of server time across all 242 calls. What is scarce is the number of times a model must take a turn to receive those characters, and the size of the context that has to hold them.

The report's central measured claim: **the batch activity cap of 3 is not the binding constraint.** The character budget is, and the two bind within one activity of each other. Moving either dial alone buys one dispatch. Moving both buys three. That changes the order everything else should be taken in.

## What was measured, and how

| Instrument | Invocation | Result |
|---|---|---|
| Delivery cost, fresh mode | `bench:token --context-mode=fresh --gate` | 1,302,319 chars, 242 calls, gate PASS at 0% |
| Delivery cost, persistent mode | `bench:token --context-mode=persistent` | 891,439 chars, 160 delivery calls |
| Payload-union probe | instrumented walk, per-call hash census | 117 distinct payloads, union 940,938 chars |
| Batch benchmark | `bench:batch --activities=<walk head 3>` | batched 253,118 chars vs 275,053 per-activity |
| Guard sweep | `check:all` | 28 guards, 1.8 s, 28 pass |
| Test suite | `vitest run` | 1,049 tests, 37.4 s wall |
| Session census | `sessions:census` | 64 running, 18 completed |
| Server latency | audit log, 242 calls | 8,510 ms total |

Static counts come from the corpus at `workflows@2e8b6297` and from `src/`, `scripts/`, `tests/` at superproject HEAD.

## 1. The floor: what is immovable regardless of redesign

Four floors, each measured, each strictly below the one above it.

| Layer | Characters | Share of today | What separates it from the layer above |
|---|---:|---:|---|
| **Today** (fresh mode) | 1,302,319 | 100% | — |
| **F1** — every distinct payload delivered once, today's envelope | 940,938 | 72.2% | 361,381 chars of byte-identical repetition to the same context |
| **F2** — the shipped ledger switched on (persistent mode, zero code change) | 891,439 | 68.4% | measured, not modelled: the machinery exists and is off |
| **F3** — raw definition source the walk touches, each byte once, no envelope | 468,885 | 36.0% | 422,554 chars of composition envelope: group contracts, inherited-IO blocks, provenance decoration, response notes, YAML re-serialisation |
| **F4** — the branches this run actually takes | 330,000–400,000 | 25–31% | 47,670 of 61,581 step bytes (77.4%) sit behind a gate |

F3 decomposes as: 12 activity YAML files 84,898 bytes; `work-package/workflow.yaml` 28,289; 88 technique files (60 directly bound, 12 ancestor group contracts, 16 nested operations) 219,742; resources at the anchor-optimal union 135,956.

**F3 is the immovable core.** 468,885 bytes is the prose an agent has to be handed to execute this walk correctly, and no delivery redesign touches it — only deleting corpus content does. The 26.8% fall from 1,780,292 to 1,302,319 moved delivery from 3.80× F3 to 2.78× F3. Reaching 1.5× F3 is available. Reaching 1.0× is not, because composition has to say *which* technique a body belongs to and *which* step bound it.

F4 is a bracket, not a point, and the bracket is the finding. Across the 12 walked activities there are 211 steps; **131 carry a gate (62.1%)**, and those gated steps hold **77.4% of all step bytes**. `11-validate` is 100% gated. `13-submit-for-review` is 97.6%. The server can currently prove exactly **4** of them dead at activity open and leaves **76** undecidable. So somewhere between 2.7% and 77.4% of the step surface is shipped for branches this run does not take, and nothing in the build can narrow that bracket further today.

## 2. Ranking the scarce resources

Ranked by what actually binds, most binding first.

**1. Sequential model turns.** 242 tool calls, one model turn each. Server work across all of them is 8,510 ms — 35 ms a call. `resume_checkpoint` averages 3.8 ms. Every second of a run's wall-clock that is not those 8.5 seconds is model latency, human latency at 10 checkpoints, and 4 to 5 worker spawns at a measured mean of 87 s. Turns are the resource; bytes matter because they consume the context that forces a respawn, which is the single most expensive turn there is.

**2. Worker context window.** The batch budget at a 200,000-token declaration is `200,000 × 0.35 × 4 = 280,000` characters. First activity of the walk alone delivers **199,020** — 71.1% of the budget for one activity. This is the resource the whole delivery programme is really about.

**3. Risk budget for saved sessions.** 64 sessions are marked running (9 work-package, 55 meta), across 70 session files totalling 4,041,656 bytes. Session load is strict-schema plus seal verification, and `docs/dispatch_model.md` records the consequence: an earlier server reading a session carrying a newer history event fails validation as `SEAL_MISMATCH`, the error normally read as tampering. Forward reads are safe; rollback is not.

**4. Developer time.** Least scarce, by a wide margin, and the ranking usually assumed is the reverse. The full suite is **37.4 s** for 1,049 tests. The 28-guard sweep is **1.8 s**. `tests/` already carries 18,955 LOC against `src/`'s 12,628 — a 1.50 test-to-source ratio, which means the scaffolding a new server change needs is written. The 18 tool registrations sit in two files in one uniform pattern.

The inversion matters. Every remaining opportunity here is priced in developer hours by habit, and developer hours are the one input this repository has in surplus.

## 3. Every concrete problem, and the scarcity it assumes inexhaustible

### P1 — Two of the three delivery channels cannot refer back to their own context

`src/tools/workflow-tools.ts:877` computes `mayReferBack = bundle !== 'full' && (referenceMode || hasDispatch(state, scope))`. That second limb is what closed the invariant-worker-bundle regression: the bundle costs 35,204 characters on activity 1, 24,311 on activity 2, then **620 and 543** for the remaining ten.

`src/tools/resource-tools.ts:801` and `:940` compute the same decision without the `hasDispatch` limb. `get_resource` and `get_technique` collapse only when the session declares `contextMode: 'persistent'` or the caller passes `bundle: 'reference'` per call. Neither happens on a worker-dispatched run: `meta/techniques/workflow-engine/dispatch-activity.md:93` states that `context_mode: "persistent"` stays off worker sessions.

Measured cost: **353,697 characters of `get_resource`** — 67.0% of that channel — is a byte-identical repeat to a context that already holds it. `get_technique` adds 7,684. The single largest line is `review-mode`, 21,239 characters delivered **12 times** for 254,868, which is **19.6% of the whole walk**. `pr-description` is 6,475 × 12 = 77,700.

Corroboration from the other side: persistent mode drops `get_resource` from 527,683 to 91,591 and records 71 unchanged answers against 0 in fresh mode.

**Scarcity assumed inexhaustible: agent context window.** The design treats a fresh context as unable to hold anything, and then treats every subsequent delivery to that same identity as if it were also fresh.

### P2 — The whole-versus-section choice is inverted on the heaviest file

`review-mode` is fetched whole (21,239 chars) and also by three of its sections (14,705 chars combined). Six files in the walk are fetched both whole and by section: `review-mode`, `pr-description`, `wp-plan`, `session-trace`, `deferred-items`, `follow-ups`. On five of the six the section union is cheaper than the file.

Once-per-id floor 174,042. With containment (a whole file supersedes its own sections) 148,430. Anchor-optimal 135,956. So **38,086 characters** sit between the best identifier-level ledger and the best content-level choice.

**Scarcity assumed inexhaustible: the agent's attention.** The corpus asks the agent to choose whole-or-section by how much it will need, and the agent chooses whole because that is always safe.

### P3 — The eager budget cannot bind, and reports a number with 7× slack

`eagerBudgetChars = context_tokens × 0.8 × 4 = 640,000`. Measured spend across all 12 activities: maximum **91,516** (14.3%), median ≈46,000 (7.2%). Three guard branches enforce a bound no workload can reach.

**Scarcity assumed inexhaustible: nothing — this is the opposite failure.** It rations a resource that is not scarce, and carries ~80 lines, two response fields and their tests to do it. Zero characters saved by removing it; the whole value is carrying cost and the removal of a reported figure that reads as meaningful and is not.

### P4 — Eager resource bundling is switched off on the mode production uses

`src/tools/workflow-tools.ts:1163-1167`: in full mode the response carries resource ids only, never bodies. Telemetry confirms `bundled_resources: 0` on every one of the 12 activities. The consequence is **162 separate `get_resource` round trips** for 82 distinct ids.

The comment states the reason honestly: in a fresh context there is nothing to collapse against, so bundling bodies measured at +24.5% on `get_activity`. That reasoning is correct *before* P1 is fixed and wrong after it.

**Scarcity assumed inexhaustible: sequential model turns.** 162 round trips are treated as free because each one is small.

### P5 — 76 gated steps stay lazy because the bag is empty when the gate is read

`src/utils/gate-liveness.ts:157` returns `undefined` when a gate reads a variable written inside the same activity; `:162` when the value is simply absent. Measured over the walk: **66 steps bundled, 76 left lazy for want of an answer, 4 pruned as provably false.** The new machinery decides 5.0% of the gated surface.

The 76 are not a server gap. `13-submit-for-review` leaves 15 steps lazy at a point in the run where the bag is nearly full — those gates read variables the same activity writes. Closing them is a definition-side ordering change across 12 activity files, guarded by the `check-decision-order.ts` that already exists.

**Scarcity assumed inexhaustible: round trips again, and the corpus author's time.** Reordering a step so its gate is decidable at activity open costs authoring effort the delivery layer then never has to pay.

### P6 — Group rules and inherited-IO ship attached to operations they do not concern

Intra-response collapse is live and firing: **215 unchanged-markers** appear inside `get_activity` responses across the walk, in fresh mode, with no persistent ledger. The identical-block case is closed.

What remains is the differing-set case. Activity 1's response still carries 7 distinct `rules` blocks and 16 `inherited_inputs` blocks. Corpus-wide, `bench:batch` reports **144 rule entries totalling 54,157 characters, of which 2.1% name the operation they were delivered with**, and **433 inherited-IO items totalling 56,057 characters, of which 10.6% are templated to their carrier**. Roughly 98% of delivered rule text concerns something other than the operation it is stapled to.

**Scarcity assumed inexhaustible: context window, via composition convenience.** Merging the contract into every descendant is the cheapest thing for the composer to do and the most expensive thing for the reader to receive.

### P7 — The instrument that prices a definition change cannot run on the pull request that makes it

`workflows/.github/workflows/verify-corpus.yml` runs the 28-guard sweep against a definition pull request. Its own comment excludes the rest: *"Guards only, not the test suite. The walk snapshots are stamped against one corpus commit."* The delivery-cost gate lives in `.github/workflows/verify.yml:82` on the superproject, and checks out the corpus **at the pinned commit** (`verify.yml:41-52`).

So a definition change is priced only after it merges, on the superproject pointer-bump pull request, where the remedies are to revert the corpus or re-record the fixture. **267 of 1,383 main commits (19.3%) are pointer bumps; 108 in the last 60 days.**

The ceremony is live and currently unsatisfied in this checkout: the walk-snapshot stamp names `72db28ae` while the corpus working tree is at `2e8b6297`, and the benchmark prints `Corpus mismatch` while the gate passes at 0%. The two commits are content-identical — one is the feature branch, the other its merge — so nothing is broken. The point is that nothing distinguishes that case from a real one.

**Scarcity assumed inexhaustible: attention at the merge boundary.** The design assumes someone notices the pointer bump needs six walk snapshots, a corpus stamp and a delivery fixture re-recorded in the same commit.

### P8 — Session state grows with no bound and no eviction

70 session files hold 4,041,656 bytes; the largest is 330,965. A 12-activity solo walk writes **265 delivery-ledger keys** (289 in persistent mode). Nothing evicts a dead worker's ledger scope, and a completed child's full state including its history is embedded in its parent's file.

**Scarcity assumed inexhaustible: disk, and the seal's tolerance for size.** Every ledger improvement in this report makes the file larger — per-entry keys most of all.

## 4. The alternative design, gambling on the opposite scarcities

Today's design spends context to save turns: deliver the whole activity, whole techniques, whole resources, so the worker asks less often. Invert it.

**Design B — turn-cheap, context-poor.** The server delivers, per activity, the step list, the gate expressions, and identifiers only. Every body arrives on request. Batch cap goes to 15; the character budget is retired because nothing large is pushed.

**Concrete result, computed from the measured per-activity figures.** F3 says the walk's distinct definition text is 468,885 bytes. Design B delivers approximately that, plus identifiers, because nothing repeats and nothing composes — call it 520,000 characters, **40% of today**. One worker context holds the whole 12-activity walk: 520,000 characters is 130,000 tokens, inside a 200,000-token window with room to read code. Dispatches fall from 5 to 1, removing **4 × 87 s = 348 seconds** of spawn wall-clock.

**The new trade-offs, and they are not small.**

- Round trips rise from 199 delivery calls to roughly 350: every technique body and every resource section becomes its own call. At 35 ms of server time that is free; at one model turn each it is 151 additional turns, which on any plausible turn cost exceeds the 348 seconds saved.
- The worker decides what to fetch. Today it receives 66 bundled bodies and cannot skip a step it never saw. Under Design B a step whose body the worker judges unnecessary is a step silently not executed, and the manifest check has an identifier to agree about rather than content.
- Single-context walks make the batch bound vestigial and the blast radius total. A context lost at activity 11 today costs one activity's re-delivery; under Design B it costs the whole walk's accumulated reasoning.

**Design C — context-rich, turn-cheap.** The mirror image: fix P1, fix P2, bundle resource bodies in full mode, raise both dials. Delivery falls to roughly 900,000 characters and rises per context; the walk fits in 2 worker contexts; round trips fall from 199 to about 40. The trade-off is that one worker holds 640,000 characters — **160,000 tokens of a 200,000-token window** — of definition text before it reads a line of the target codebase. The `BATCH_MAX_ACTIVITIES` cap exists precisely to refuse that bet, and `src/config.ts:106-114` says so: the cap covers *"the context establishment the server never delivers, the code a worker reads, the artifacts it drafts, and degradation across a long walk."*

Design C is the honest description of what raising both dials commits to. It is not free; it is a wager that delivered characters are the only thing filling a worker's window, and the cap is the standing bet against exactly that.

## 5. The conservation law

**Every design must put the same 468,885 bytes of definition text in front of an agent, and must re-establish a reading whenever it crosses a context boundary.** The first quantity is conserved by content. The second is conserved by topology.

The corollary is the useful part. Total cost decomposes as

```
cost = F3 × (repetition factor) + (context boundaries) × (establishment cost)
```

and every lever moves one term at the other's expense. Reference delivery drives the repetition factor toward 1 and, by shrinking per-activity delivery, permits fewer boundaries. Bigger batches cut boundaries and raise the risk that one boundary crossing loses more. Pruning dead steps attacks F3 itself, and is the only lever that does — which is why it is both the most valuable in principle and the only one whose failure mode is a step the worker never sees.

Nothing here removes F3. The prior report's rejected alternative — making a gate-delimited segment the dispatch unit — failed on exactly this law: it cut the first term and multiplied the second, and worker continuity across a gate was priced at two to four times what collapsing delivered content saves.

## 6. Forced trade-offs, and where the design sits

**Delivery economy versus agent correctness.** The design sits conservatively, and correctly for the moment. Full delivery is the default because *"a freshly spawned worker lands in an empty context and the repeated bundle is load-bearing"* (`workflow-tools.ts:865`). That is right for the first delivery to an identity and wrong for the second, and `mayReferBack` already draws that line on the `get_activity` path. Extending the same line to the resource path is not a new bet; it is applying the bet already taken to the channel that carries 40.5% of the walk.

**Mechanisation versus flexibility.** The design sits on the flexible side and pays for it. 18 registered tools, every one session control-plane; 28 guards reachable only as repository CI; zero script invocations across the 262 technique files of meta and work-package. Nothing found here changes the prior report's verdict: the checkout is the only surface that can run a guard and the only surface not guaranteed present.

**Batching versus blast radius.** The design sits at cap 3 and the documented reason survives scrutiny: `docs/dispatch_model.md` records that a failed resume costs one activity and not the batch, because the session cursor tracks the run and checkpoint responses replay for any worker. So the blast radius of a lost context is one activity's re-delivery **regardless of batch size**. The cap is therefore not protecting against loss. It is protecting against degradation across a long walk — a real concern that no instrument in this repository can measure.

**Instrument resolution versus claim size.** The delivery gate resolves 1% = **13,023 characters**. P1 is 27.7% (27× the floor). P2 is 2.9% (2.9×). P3 is 0%. P5 and P6 are unmeasurable by this instrument until they change delivered bytes. That ratio should decide what gets claimed, not what gets built.

## 7. The submodule boundary as a scarcity constraint

Definitions live in the `workflows` submodule; the server lives in the superproject. A paired change needs both, and the recent history shows the shape: definition PR #468 landed at `cf4d0774`, adopted by superproject commit `64085235`; definition PR #470 landed at `72db28ae`, adopted by `15ba859e`.

What the boundary rations:

- **Measurement.** The corpus PR gets 28 guards in 1.8 seconds and no delivery gate, no walk snapshots, no test suite. The superproject PR gets everything but sees the corpus only at the pin.
- **Atomicity.** A server change and the definition change that depends on it cannot land together. One of them is live against the other's old form for the duration of the gap. This is survivable now only because the resume path gained `versionDrift` and late-seeding (`src/tools/resource-tools.ts:277-311`), which is the single most consequential thing the remediation closed.
- **Ceremony.** A pointer bump is one submodule commit, one pointer bump, six walk snapshots across six policies (`tests/e2e/snapshot.test.ts:46-56`), one corpus stamp, and the delivery fixture — all in one commit or the suite goes red.

The ceremony is fixed per landing, not per edit. That is decisive for sequencing: **every definition-only change in this programme belongs in one landing**, and the cheap tail is cheapest now and dearest later.

## 8. The batch bound as a rationing device

`BATCH_MAX_ACTIVITIES = 3` and `BATCH_HEADROOM_FRACTION = 0.35` (`src/config.ts:164-165`) ration two different readings of one physical resource: the worker's context window. The fraction rations what the server can see and count. The cap rations what it cannot — establishment, code read, artifacts drafted, degradation.

**Is the cap the binding constraint? Measured, from the real per-activity delivery of the 12-activity walk, at the 280,000-character budget:**

| Mode | Contexts | Boundary 1 | Boundary 2 | Boundary 3 | Boundary 4 |
|---|---:|---|---|---|---|
| fresh (production) | **5** | delivery_budget @ 303,640 | activity_cap | activity_cap | activity_cap |
| persistent | **4** | activity_cap | activity_cap | activity_cap | walk end |

In fresh mode the **budget binds first**, on the opening pair: `start-work-package` alone delivers 199,020 characters, and adding `design-philosophy` reaches 303,640 against a budget of 280,000. In persistent mode every boundary is the cap — and the third activity is admitted at 261,923 characters, 93.5% of budget. **The two limits bind within one activity of each other in both modes.**

The consequence for the "free dial" that the prior report priced at 261 seconds:

| Change | Contexts, fresh | Contexts, persistent | Dispatches saved |
|---|---:|---:|---:|
| today (cap 3, fraction 0.35) | 5 | 4 | — |
| cap raised, fraction unchanged | 4 | 3 | **1** (≈87 s) |
| fraction 0.80, cap 3 | 4 | 3 | **1** (≈87 s) |
| both raised | **2** | **2** | **3** (≈261 s) |

The 261-second projection is real and reproduces against current delivery — but only if **both** dials move. Either alone buys one dispatch. And "both raised" is Design C: one worker holding 160,000 tokens of delivered definition text before it reads any code.

The eager-only measurement that the documentation rests on gives the opposite answer, and the documentation says why. `bench:batch` over the walk's opening three activities reports 253,118 characters batched — **90.4% of budget** for three activities, not the 57% recorded for the lighter analysis run. Add the lazy fetches those activities really make and it is 438,056. The documented claim that *"the cap binds first on measured content"* holds only for the eager floor.

**Fixing P1 changes the answer.** At the F1 floor, per-activity delivery falls 27.7% uniformly and the admission table becomes 4 contexts in fresh mode with every boundary the activity cap. So P1 both saves a dispatch on its own and converts the binding limit from the budget to the cap — which is the precondition for the dial decision to be about anything.

## 9. Sequencing dependencies and mutual exclusions

**Hard dependencies.**

- P1 → dial re-decision. P1 moves per-activity delivery by ~28% and changes which limit binds. Setting the dials first tunes against numbers P1 invalidates.
- P1 → P2. Before P1, `review-mode`'s 233,629 characters of repeat swamp the 6,534-character whole-versus-section error on the same file. After P1, P2 is 2.9× the gate's resolution floor and attributable.
- P1 → P4. Bundling resource bodies in full mode costs +24.5% on `get_activity` today, for the reason the code comment states. After P1 the second and later deliveries collapse and the trade becomes bytes-neutral, turns-positive.
- P3 → any batch-budget change. The eager budget and the batch budget are separate settings that read the same declared window. Retiring the one that cannot bind removes the confusion before the one that does bind is retuned.
- P5, P6 and every other definition edit → one landing. The submodule ceremony is per landing.
- P8 measurement → per-entry ledger keys. A larger sealed ledger is a session-file growth decision and 265 keys is the current baseline.

**Mutual exclusions.**

- Design B and Design C are exclusive at the topology level. Committing to identifier-only delivery makes the batch bound vestigial; committing to bigger batches makes identifier-only delivery pointless.
- Raising `BATCH_HEADROOM_FRACTION` to 0.80 and retaining the activity cap as a degradation guard are in tension by construction. Both raised is the only combination that buys three dispatches, and it is exactly the combination the cap was introduced to prevent.
- Pruning dead step bodies from the payload excludes keeping a manifest row the worker can disagree about, unless the identifier and gate expression stay in the payload. Choose the second; the first is the only change in this programme whose failure mode is silent.

## 10. Prioritised sequence

Ordered by measured saving per unit of risk, subject to the dependencies above.

**1. Give `get_resource` and `get_technique` the context-scoped refer-back that `get_activity` already has.** (P1)
Saving **361,381 characters, 27.7% of the walk** — 27× the gate's resolution floor. Independently corroborated at −410,880 by the persistent-mode arm. Build: one `hasDispatch` limb on two expressions in `src/tools/resource-tools.ts`; the ledger writes already exist. Risk: the identical failure mode already shipped and tested on the heavier channel. Also converts the binding batch limit from the budget to the cap, and takes fresh-mode contexts from 5 to 4 by itself. Take it first; nothing else in this list is measurable until it lands.

**2. Retire the eager-delivery character budget, keep the activity cap.** (P3)
Saving zero characters, ever. Removes ~80 lines, one limb of the batch calculation, two response fields reporting a bound with 7× slack, and their tests. Take it second because it is the opportunity to not build, and because it clears the confusion between two settings that read the same declared window before the one that binds gets retuned.

**3. Make resource containment anchor-aware.** (P2)
Saving **38,086 characters, 2.9%** — 2.9× the floor, attributable only after step 1. About 60 lines; the section extractor already tracks heading depth.

**4. Re-decide the two batch dials against a fresh admission table.** (P4 precondition, dial decision)
Zero build cost, three dispatches (≈261 s) available, and both dials must move to get them. Re-run `bench:token` and `bench:batch` after steps 1–3, rebuild the admission table, and state explicitly what fraction 0.80 commits a worker to holding. The cap is the standing bet against context degradation; overturning it needs `batch_refused` counts and per-activity usage from real runs, which cost less than any build item on this list.

**5. Bundle resource bodies in full mode.** (P4)
Saving is turns, not bytes: **162 `get_resource` round trips** collapse into the 12 activity responses. Bytes-neutral only after step 1. Gate it on the step-4 measurement so the batch budget is set with bundled bodies counted.

**6. Hoist group rules and inherited-IO to a sibling block.** (P6)
54,157 characters of rule text of which 2.1% names its own operation; 56,057 of inherited-IO of which 10.6% is templated. Larger than P2 and later than it because it needs a projection parameter and a restatement of the claim that a bundled entry is byte-identical to a direct fetch.

**7. One definition landing, carrying every definition-only edit.** (P5 and the tail)
The ceremony is fixed per landing: one submodule commit, one pointer bump, six walk snapshots, one corpus stamp, one delivery fixture. Inside it: reorder the gates that read variables their own activity writes, so more of the 76 undecidable steps become decidable at activity open. Sequence the largest-blast-radius edit last within the landing. Run the session census first — **64 sessions are marked running**, and the resume path's `versionDrift` late-seeding now covers them, which is why this step is affordable at all.

**8. Close the definition-PR measurement gap.** (P7)
The corpus pull request gets 28 guards and no cost gate; the superproject pull request sees the corpus only at the pin. Either run the delivery gate on `verify-corpus.yml` against a server checkout of `main`, accepting that walk snapshots stay out, or accept that definition changes are priced one merge late and say so where the ceremony is documented. Placed here because steps 1–7 are the changes worth measuring; measuring an unchanged corpus buys nothing.

**9. Decide the session-state growth term.** (P8)
4,041,656 bytes across 70 files, 265 ledger keys per walk, no eviction and no cap. Every step above makes the file larger. This is a design decision — what a truncated history must still answer — not a cleanup, and it is last because nothing above it is blocked on it.

## 11. What remains unmovable in six months

**The 468,885 bytes.** No delivery mechanism removes definition text. Only deleting corpus content does, and the corpus grows: delivery rose 31.3% in 32 days once already.

**The composition envelope's floor, at roughly 1.3× F3.** A response must say which technique a body is, which step bound it, and which contract it inherits. That is not repetition; it is addressing. Today's 2.78× can reach about 1.5×. It cannot reach 1.0×.

**One model turn per delivery boundary.** Server time is 35 ms a call and will fall further. Turn latency will not, and 242 turns is the shape of this walk under any byte count.

**Context establishment at 87 seconds a spawn.** The server never delivers it and cannot measure it. Every batch decision is a bet on a number no instrument in this repository produces.

**The submodule boundary.** Two repositories, two CI surfaces, one instrument that can only run on the second. Merging the corpus into the superproject would close it and would also make every definition edit a server release. Neither side of that is going to be chosen in six months.

**The bracket on dead step bytes.** 131 of 211 steps gated, 77.4% of step bytes behind a gate, 4 provably dead. Narrowing that needs the bag bound earlier, which is 12 activity files of ordering work in a corpus that grows faster than it is reordered. The bracket will still be a bracket.
