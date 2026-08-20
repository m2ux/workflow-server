# Resolution Dialogue — Running Dispositions

> **Read the corrections section before acting on `EVALUATION-REPORT.md`.** Five findings have not
> survived re-measurement against the code: **CHG-03**, **DEL-01**, **MEC-02/RED-05** and **REM-07** had
> figures overturned, and **MEC-07** had its conclusion overturned and carries no mitigation. The report
> stands as the artifact the analyses produced; this file and the mitigation plan are where it is
> corrected. A reader taking the report at face value is misled on all five.

Working record for the resolution dialogue over the 53 findings in `EVALUATION-REPORT.md`. Written as
each gate resolves so the accumulated decisions survive a lost worker context. `MITIGATION-PLAN.md` is
compiled from this record when every finding has a disposition.

## Standing decisions

These were settled at a gate and are not re-opened per finding.

- **Citation rule (CHG-03).** Every saving figure carries `(measured)` or `(estimated)` with its basis
  named. A figure with neither does not go in the plan.
- **Ablation runs (CHG-03).** A prerequisite task recorded in the plan, not work this dialogue performs.
- **Ladder discipline (from finding 6 onward).** Each mitigation names the rung it sits at and why every
  lazier rung fails. T3 is rung 7, the floor — the classification most in need of the ladder.
- **Honesty boundary.** No per-repo lines-saved figure is claimed. Published benchmark medians, where
  cited, are labelled as benchmark medians.
- **Order.** Tier T1 → T2 → T3 → T4; within a tier by severity; within a severity band,
  instrument-before-system, then measured-before-estimated, then report order.
- **Safety floor overrides a lazier rung (precedent, set at ORC-05).** The lazier option there was to have
  `createHarness` call `loadConfig` and pick up env vars for free — one line, no new options. Rejected on
  the ground that it would make every test read the developer's environment, so a machine with
  `BATCH_MAX_ACTIVITIES` set would silently change suite behaviour. **Hermeticity of the test harness is a
  correctness property, and correctness lives on the floor.** The floor is not traded for a line.

## Tier counts at classification

T1 24 · T2 3 · T3 25 · T4 1. Report's own tiering was 7 immediate, 10 short-term, 10 structural,
**26 with no tier at all** — the 26 are the reason this dialogue runs and each takes its own gate.

## Every CRITICAL and HIGH finding is dispositioned — 19 of 19

Stock-take at the T3 High boundary. 37 of 53 decided; 16 remain, all T3 Medium/Low plus the single T4.

| Outcome | Count |
|---|---:|
| Accepted (some in part, some revised) | 31 |
| Refuted | 1 — MEC-07 |
| Subsumed | 2 — MEC-05, DEL-09 |
| Declined on cost | 1 — RED-08 |
| Accepted with a hazard knowingly open | 1 — REM-04 |

**`net so far: ≈ +100 lines, −1 file`** (approximate; T1 closed at ≈ +3, and T2/T3 have added the vector
gate's siblings, the cache, the git-config reader, the guard migrations and the array widening).

## No identifier in this system tracks content

A property of the whole system, not a finding about one file. **Three separate gates had to run before it
was visible**, and each measured a different identifier failing the same way.

| Identifier | Measurement | What it shows |
|---|---|---|
| **File version** (RED-09) | 179 commits across 30 technique files, **90 changed the version — 50.3%** | half of body changes leave the version untouched |
| **File version** (RED-02) | `mark-ready`, two live copies **both at v1.1.1**, one declaring Inputs and one declaring none | the version did not move across a **real signature divergence** |
| **Corpus commit** (REM-10) | `72db28ae` and `2e8b6297` share tree `d00cfe27…`, `git diff` **empty** | the commit moved with **no content change at all** |

**Both directions fail.** Versions and commits move when content does not, and stay put when content
does. Nothing in the corpus, the session or the CI baseline is keyed on what it actually contains.

**CHG-05's `contentHash` fingerprint is the first identifier that will track content — and it covers one
narrow slice:** declared variable names and defaults. Not transitions, not steps, not checkpoints, not
technique bodies. Whoever extends content-keying further should start from this table rather than from a
single finding, because the failure is systemic and the fix so far is not.

## Is this remediation lean? — the evidence, not the assertion

The single most important number in this plan. T3 means *"the capability does not exist and must be
built."* Of the **ten** T3 findings dispositioned:

| | Count |
|---|---:|
| Produced a **genuinely new mechanism** | **2** |
| Satisfied by **reuse or extension** of something already in the repository | **7** |
| **Declined** outright | **1** |

Both survivors are small: DEL-02's module-level `Map` (stdlib) and MEC-01's ~30-line `.git/config`
reader. Neither needed a framework.

**Four rung-7 proposals were rejected in favour of a lower rung:**

| Finding | Rung-7 proposal rejected | Taken instead |
|---|---|---|
| REM-01 | build a second walker | one flag on the existing one |
| ORC-02 | a new batch endpoint | widen two parameters |
| DEL-02 | revision-keyed cache with invalidation | a path-keyed `Map` |
| MEC-03 | a prose-versus-registry guard | nothing — declined on a four-item surface |

**Four further components were declined inside accepted findings:** ORC-03 Part B (per-agent checkpoint
slot), ORC-04 Part B (protocol change), REM-04's +29.3% correction, MEC-03's server-prose owner.

**And the corollary, which is the more useful finding for the repository.** A tier premised on *"the
capability does not exist"* was **wrong seven times in ten**, and in every one of those seven **the
capability existed and was unreferenced, unwired or unmigrated** — an exported helper with no caller, a
walker mode with one test caller, a predicate on one channel of three, a boundary reading no call site
populates, two root helpers adopted in 14 places and not 8, a plural loop already returning the shape a
singular tool refuses to. **That is the capability-on-one-side pattern, now measured at a rate across a
whole tier rather than observed in instances.** The repository's problem is not that it lacks
capabilities. It is that it does not finish wiring the ones it builds.

### Did T3's premise hold? — the build-versus-reuse count

T3 means *"the capability does not exist and must be built"*. Of the **ten** T3 findings dispositioned:

| Outcome | Count | Findings |
|---|---:|---|
| **Genuinely new mechanism** | **2** | DEL-02 (a module-level `Map`, stdlib) · MEC-01 (~30 lines reading `.git/config`) |
| **Satisfied by reuse or extension of what already exists** | **7** | REM-01 (walker mode + one flag) · CHG-02 (instrument exists and is tested) · ORC-02 (plural loop and keyed map already in `get_activity`) · ORC-03 Part A (existing yield/resume) · ORC-04 Part A (extend a guard) · REM-04 (existing event machinery) · RED-01 (two helpers adopted in 14 places) |
| **Declined outright** | **1** | MEC-03's prose-versus-registry guard |

**T3's premise held twice in ten.** Both survivors are small and neither needed a framework. Seven were
answered by something the repository had already built and not finished wiring up — which is the
capability-on-one-side pattern again, now measured across a whole tier. Components were also declined
*inside* accepted findings: ORC-03 Part B, ORC-04 Part B, REM-04's 29.3% correction, and MEC-03's
server-prose owner.

**This is the strongest available answer to whether the remediation over-builds.** It does not.

## TOP ITEM — the client drops `_meta`, and two server mechanisms are dead because of it

**Not in the report.** Found by asking why 262 of 276 dispatches took exactly one activity. It ranks
above all 53 report findings because it explains three of them and disables two mechanisms outright.

**What the server computes, and where it attaches it.** `workflow-tools.ts:1332-1339` builds the batch
reading on **every successful `get_activity`** — `activities`, `max_activities`, `delivered_chars`,
`budget_chars`, `may_continue` — and attaches it at line 1366 as `_meta: { …, dispatch, batch, … }`.
**Unconditionally: no `contextMode` gate, no extra parameter, no condition.** The leading hypothesis was a
third `contextMode` gate after DEL-01 and DEL-06; **that hypothesis is wrong** and is recorded as wrong.

**The definitions are correct.** `compose-prompt` instructs `get_activity { session_index,
context_tokens, agent_id }`, which is exactly what is required. Nothing further must be passed. **This is
not a contract defect and not an agent error.**

**The client drops it.** The raw `get_activity` response, persisted verbatim at the start of this
dialogue, is `[ { "type": "text", "text": "…" } ]` — **a bare content array with no `_meta` sibling
(measured)**. The client surfaces `content` only.

**The causal chain, end to end.** Workers cannot read `may_continue` → every worker reports
`batch_may_continue: false`, correctly → the orchestrator spawns a fresh worker per activity → each
scope's `activities.length` is 0 at delivery → `exempt = activities.length === 0` is always true →
`batchRefusal` never refuses → **zero `batch_refused` events in 70 sessions and 276 dispatches
(measured)**. The zero-refusal result and the 14-of-276 batching rate are **one fact with one cause**, and
it is not a dial setting.

**`recordBatchRefusal` is NOT behind the same condition** — it runs unconditionally at
`workflow-tools.ts:827-836`, ahead of composition. So zero refusals is genuine, but it is a *consequence*
of never batching rather than independent evidence that the cap is generous.

**Three mechanisms dead for one cause:**

| Mechanism | Depends on | State |
|---|---|---|
| **Batching** | `_meta.batch.may_continue` | never runs — 14 of 276 dispatches took 2+ activities |
| **Trace resolution** | `_meta.trace_token`, accumulated by `dispatch-activity` step 2 | **`trace_tokens[]` empty for the entire run and can never be otherwise**; `resolve-trace-at-close-out` is unsatisfiable |
| **Validation warnings** | `_meta.validation`, which `validation-warnings` tells every worker to check | never observed once across ~30 `get_activity` calls |

**Client-wide, not worker-side only.** The orchestrator's `next_activity` responses returned exactly
`{activity_id, name, session_index}` — no `_meta`, no `trace_token`.

**Direct evidence from this session (measured).** Eight workers, `client-worker-02` through
`client-worker-08`; roughly thirty `get_activity` calls, each passing `context_tokens`; **`_meta` observed
zero times**; the orchestrator's own `trace_tokens[]` empty throughout.

**It explains three report findings and invalidates how they are framed.** **CHG-06**, **ORC-05** and
**ORC-07** all treat the batch dial as the constraint. **Acting on them as written would have calibrated a
mechanism that never runs.** CHG-06's question was unanswerable for a reason nobody had identified.

**Ninth instance of capability-on-one-side, and the most consequential** — the others disabled a saving;
this one disables the mechanism.

**Direction, recorded as a direction and not proposed.** Every other server→worker signal already rides
in the response **body**: `bundle_note`, `resources_note`, `step_techniques_note`, `enforcement_notes`,
`activity_rules`. Moving the batch reading there uses the channel that demonstrably works. Deleting
batching outright is the rung-1 alternative, defensible only after the mechanism has had one fair test.
**The fix is a separate decision with the evidence in front of it.**

## Disposition labels

A finding carrying no mitigation does so for one of three reasons, and they are not interchangeable.
A reader deciding what to revisit needs to know which.

- **Refuted** — the claim is false. Do not revisit. *(MEC-07)*
- **Refuted in part** — the claim's stated mechanism is false, but a narrower residue survives and is
  carried to a named finding. Revisit only through that finding. *(REM-08 → CHG-05)*
- **Subsumed** — the claim is true and its remedy is already accepted elsewhere. Revisit only if the
  absorbing mitigation is dropped. *(MEC-05; DEL-09, pending DEL-02)*
- **Declined on cost** — the claim may hold, but the fix does not earn itself. Revisit if the cost
  balance changes. *(RED-08)*

## Tier T1 complete — stock-take at the band boundary

**All 24 T1 findings are dispositioned.** A replacement worker resuming here starts from this section.

| Outcome | Count | Findings |
|---|---:|---|
| Accepted | 21 | ORC-01, CHG-01, CHG-03*, DEL-01, REM-02, REM-03, MEC-02, RED-05, MEC-04, RED-02, ORC-05, REM-06, REM-05*, REM-07, REM-09, MEC-08, RED-03, RED-06†, RED-07†, REM-10, DEL-08*, DEL-09 |
| Skipped on evidence (**refuted**) | 1 | MEC-07 |
| Skipped on rung 1 (**not refuted**) | 1 | RED-08 |

\* revised after acceptance · † accepted in part, remainder deferred to the RED-03 triage

**Running scoreboard, all accepted mitigations:** ORC-01 ≈ +20 · CHG-01 ≈ +11 · CHG-03 ≈ +5 · DEL-01 ≈ +7 ·
REM-02 ≈ +2 · REM-03 ≈ +1 · MEC-02 ≈ +9 · MEC-04 −4 · RED-02 −35/−1 file · ORC-05 ≈ +9 · REM-06 ≈ +5 ·
REM-05 ≈ +6 · REM-07 ≈ +2 · REM-09 ≈ +6 · MEC-08 ≈ +2 · RED-03 ≈ −1 · RED-06 ≈ −18 · RED-07 ≈ +1 ·
REM-10 ≈ 0 · DEL-08 ≈ −25 · DEL-09 0.

**`net after T1: ≈ +3 lines, −1 file.`** The additions and deletions have very nearly cancelled. No
per-repo savings figure is claimed; per `honesty-boundary.md` the only genuine per-repo count is the
recorded deliberate simplifications in this file.

**Report reliability after T1.** Six findings did not survive re-measurement intact: **CHG-03**,
**DEL-01**, **MEC-02/RED-05**, **REM-07** and **RED-06** had figures overturned; **MEC-07** had its
conclusion overturned; **RED-07** and **RED-08** were each half-verified. One figure reproduced exactly
(**RED-03**'s 32) and one was independently re-verified in a single command (**REM-10**'s trees).

**Remaining:** 29 findings — T2 ×3, T3 ×25, T4 ×1 — plus the three queued scope additions.

## Dispositions

| # | ID | Sev | Tier | Decision | Mitigation as accepted |
|---|----|-----|------|----------|------------------------|
| 1 | ORC-01 | CRITICAL | T1 | accept | Gate on a vector, not a scalar. Add `totalToolCalls` and `checkpointTriples` deltas to `buildVsReference`; fail if any gated quantity regresses past its own threshold (delivery 1%, call counts zero tolerance); name the failing quantity in `reason`; add both rows to `writeScorecard`. ~20 lines, one file, no fixture re-record. Both quantities already in the fixture (`toolCalls` sums to 242; yield/respond/resume 10 each). |
| 2 | CHG-01 | HIGH | T1 | accept | Symmetric band. Add `DEFAULT_IMPROVEMENT_RERECORD_PCT = -1` lower bound per gated quantity; remedy message names re-recording; no escape flag, because the growth-side procedure already applies. Correct the `--gate` help text at `run-token-benchmark.ts:32` and the growth-only procedure at `docs/development.md:231`. Looser lower bound was offered and declined. |
| 3 | CHG-03 | HIGH | T1→**T3** | accept, **revised** | Reclassified: no incorrect text exists in the target — every stale price sits in a dated planning snapshot that was accurate when written, and nothing in `src/`, `scripts/`, `docs/` or `.github/` carries one. **As revised:** keep `scripts/fixtures/ablations/` (one recorded metrics JSON per candidate), keep the measured-or-estimated citation rule, **drop the `bench:ablate` wrapper**, and add ~5 lines of recipe to `docs/development.md` giving the two existing commands and the redirect. The revision came from this dialogue's own retrospective ladder pass — see the verdict below — and was put to the user as a decision rather than applied silently. |
| 4 | DEL-01 | HIGH | T1 | accept | Three ordered parts. (1) Prerequisite: record technique block hashes in every mode — `dedupTechniqueBlocks` runs only under `referenceMode` at `resource-tools.ts:837`, so a worker that took full delivery then refers back holds no block hashes. (2) Add the `hasDispatch(state, scope)` disjunct to both predicates in `resource-tools.ts`, matching `workflow-tools.ts:877`. (3) Price as 410,880 chars / 31.5% (estimated), production-topology measurement as the first ablation entry. |
| 5 | REM-02 | HIGH | T1 | accept | Replace the value-path loop at `gate-liveness.ts:161-163` with one call to `unboundPositiveReads`, which is exported in the same file with zero callers in `src/`. Leave the `writtenInActivity` loop at 156-158 iterating **all** paths — a variable this activity writes later makes even a negated gate undecidable at delivery. Replace the size-inequality proxy at `fetch-observability.test.ts:202` with the property it stands for. |
| 6 | REM-03 | HIGH | T1 | accept | Rung 2. Amend the `variables_changed` enumeration at `finalize-activity.md:72` to name `action: set` targets as the third class alongside declared step outputs and checkpoint `setVariable` effects. One clause, one file (only one copy exists). Rung-1 alternative — retiring `action: set` across all 28 sites — offered and declined. |
| 7 | MEC-02 | HIGH | T1 | accept | Four parts in `check-resource-anchors.ts`, all rung 1–2 or rung 6. (1) `resolveWorkflowsRoot` → `requireWorkflowsRoot` at line 27. (2) `assertScanned` on files walked, before the verdict at line 143. (3) Where `ANCHORED_RE` does not match but the destination is a relative `.md`, resolve and report `missing-file`. (4) Add `work-package/resources/readme-seed.md` to the existing `PRE_SESSION_RESOURCE` exclusion. Both helpers already exist in `workflows-root.ts`, documented for exactly this purpose. |
| 8 | RED-05 | MEDIUM | T1 | accept | Same edit as MEC-02 part 3 — one population, no ordering separates them. Own disposition: 514 anchor-free links become checkable including the **129 that cross a tree boundary**, which need no extra work because the guard's corpus-root scoping at line 126 already admits them. |
| 9 | MEC-04 | HIGH | T1 | accept | Two parts, net deletion. Rung 1: **delete** `delivered_artifact` (input block at `sync-progress-status.md:32-34` and the trailing clause of protocol step 7) — zero binders corpus-wide, so `yagni` with zero concrete cases. Rung 2/6: **bind** `seed_profile` at `commit-and-persist.md:22` using the corpus convention `<workflow-id>/readme-seed`. Reintroduction criterion for `delivered_artifact` recorded below. |
| 10 | RED-02 | HIGH | T1 | accept | Rung 1: **delete** `workflows/work-package/techniques/finalize-documentation/revise-session-metrics.md`. Zero step bindings, zero prose referrers, absent from its own group `TECHNIQUE.md`; all four corpus references link straight to the meta authority. Reconciling the copies and stripping the pointer's signature were both considered and rejected — deletion removes the drift mechanism, not just the drift. |
| 13 | REM-05 | MEDIUM | T1 | accept, **revised** | The boundary-accurate reading is `workflow-tools.ts:742-758` inside `next_activity`, gated on `agent_id && context_tokens !== undefined`. Two corpus call sites: `dispatch-activity.md:50` passes neither, `continue-batch.md:46` passes `agent_id` only. So the block computes **zero** times. **As revised, rung 2:** record `contextTokens` on the `recordDispatch` call at `workflow-tools.ts:1296` beside `chars`; have `next_activity` read the scope's last declared window from history, collapsing its gate to `if (agent_id && !isTerminal)`; `continue-batch.md:46` needs **no edit**; `dispatch-activity.md:50` gains `agent_id` only. Plus the two rule retargetings as originally accepted. Revision came from a post-acceptance binder check: `context_tokens` is persisted nowhere, so the original edit would have placed an unbindable input into two call sites — the same defect class as MEC-04's `seed_profile`. |
| 52 | CHG-08 | LOW | T3 | accept — **premise refuted, narrow fix taken** | **Measured on this session, which almost doubled during the dialogue: 178,044 → 346,129 bytes.** Composition, minified (222,172): **`triggeredWorkflows` 198,523 — 89.4%**; `history` (92 entries) 18,248 — 8.2%; **`deliveredContent` (4 scopes, 56 ledger keys) 3,589 — 1.6%**; `variables` 1,238. **The finding's causal claim is measurably false:** it says *"every ledger improvement enlarges it"*, and the ledger is **1.6%**. Even a twentyfold growth to ~1,100 keys reaches ~70KB against `triggeredWorkflows`' 198KB. **Ledger eviction declined** — it targets 1.6% and would undercut DEL-01 and DEL-05, both accepted. **`triggeredWorkflows` recorded as the actual growth term with no mitigation proposed**: child-session state is load-bearing for resume and I have not established what could be dropped. Scoping it was offered and declined. **Third item — 36% of the file is whitespace**, not in the report at all, found by measuring: 346,129 on disk against 222,172 minified. **Precondition, to verify before it lands:** confirm the seal does not cover serialised bytes in a way that breaks existing sessions. The likely reading is that the server re-seals on every write, so a pretty-printed session is read, verified, rewritten minified and re-sealed without incident — **that is a reading, not a check**. If the seal does cover raw bytes, the change does not land and a migration pass over existing sessions would be required first. |
| 51 | RED-09 | LOW | T3 | **subsumed by CHG-05** | Range reproduces: 30 technique files with ≥3 commits each, **179 commits touching them, 90 changing the version line — a 50.3% bump rate**, against the claimed 35-58%. `dispatch-activity.md` alone is 20 of 34, **58.8%**, at the top of the band. **No mitigation of its own** — CHG-05's `contentHash` fingerprint is RED-09's fix, applied where it matters. **Bump-enforcing guard declined, and the reason is not "too much work":** it would enforce **ceremony rather than meaning**, and the historical data undercuts it from both directions — it would fail 90 of 179 past commits, demand a bump for a typo, and **half the bumps that did occur signalled nothing either**. **Limit, recorded in both entries: CHG-05's fingerprint covers declared variable names and defaults only, so technique-BODY drift — the exact 50.3% case — still produces no signal.** Widening it to composed technique content was offered and declined, so body drift is unaddressed **by choice**. |
| 50 | CHG-07 | MEDIUM | T3 | accept — **report, do not gate** | **The omission is reasoned and documented, and the reasoning was found before proposing against it.** `workflows/.github/workflows/verify-corpus.yml` runs the full 28-guard registry on definition PRs and deliberately excludes the cost gate; its own header says why: *"The walk snapshots are stamped against one corpus commit, so running them here would compare a pull request's corpus to a baseline generated from a different one and fail on the difference rather than on a defect."* **Accepted:** run `bench:token` **without `--gate`** and print the scorecard, so the author sees the delivery delta at review time; sequenced after REM-10. **Gating there declined** — the gate belongs where the baseline and the corpus move together, which is the superproject. **REM-10 coupling, stated so it is not overread: REM-10 removes the false-alarm case only.** A content-identical definition PR will compare clean once the stamp is a tree rather than a commit; **a PR that changes content still moves the tree, so a corpus-coupled baseline is still not comparable — and that is most PRs.** Anyone reading REM-10 as unblocking a gate here would be wrong. |
| 49 | CHG-05 | MEDIUM | T3 | accept | Rung 2, all reuse. Record a `variablesFingerprint` — `contentHash(stringifyForResponse(variables))`, using the hash function already at `delivery.ts:43` — on the session at open; compare it alongside `workflowVersion` in `validateWorkflowVersion`, so the **nine existing call sites need no change**. **Kept advisory:** the enforce-on-mismatch variant was offered and declined, so **REM-08's residue stays open by choice** — the signal becomes trustworthy, blocking remains a decision nobody has taken. Neither entry reads as closed. **Limit, offered as a discuss option and not taken — record so the guarantee is not overread: the fingerprint covers declared variable names and defaults ONLY.** A changed transition, a changed step or a changed checkpoint could break a resumed session and **would not move it**. Corroborated by REM-10: the corpus moved commit `72db28ae` → `2e8b6297` with an **identical tree**, so version and commit both move independently of content — the fingerprint fixes that for variables and for nothing else. ~5 lines. |
| 48 | RED-04 | MEDIUM | T3 | accept, **part 1 withdrawn after acceptance** | Counts exact: **70 + 107 = 177 entries**, verdict distribution literally **`{"harmless": 177}`** — zero debt, zero live defects. **Fourteen distinct named rationales** across the two files show these were **reasoned about, not rubber-stamped**, so the mitigation is about revisiting rather than carelessness, and the plan must not imply otherwise. **Original part 1 — compare `corpusSha` and fail — WITHDRAWN on my own evidence after acceptance:** `check-binding-fidelity.ts:726` already documents *"An entry that matches nothing is stale and reported"*, `TriagedResult.counts` already carries a `stale` bucket, and `triageStampNote` at line 755 **already performs the corpus comparison I proposed adding**, is called at line 839, and is deliberately **report-only**. Failing on `corpusSha` would fire on **every** definition landing including CHG-04's batched bump — the flood `docs/development.md` warns turns a guard into one nobody runs. **Revised mitigation:** make the existing `stale` count **fail** rather than report; leave `triageStampNote` advisory; add `corpusSha` to `section-framing-triage.json`, which has none. **Permanent limit: a considered "harmless" and an unexamined one are unrecoverable from what is written.** No check repairs that. |
| 47 | MEC-06 | MEDIUM | T3 | accept **narrowly** | **Count: 22, not 23** — meta 5, work-package 17, none in any technique file. **The finding treats 22 preconditions as one mechanisation surface. They are four surfaces with different answers**, and a reader taking the headline at face value would scope work for all of them. **Accepted: the filesystem group only, folded into MEC-01's change** — the server computes and **seeds the fact**; the agent still asserts on it. That distinction is load-bearing: the server has **no action interpreter at all** (`enforcement_notes`: *"The server records the step but applies no action verb"*), so "mechanise a validate action" would mean building one. Seeding a value is not interpreting an assertion. |
| 46 | ORC-08 | MEDIUM | T3 | **declined on cost** | 290 adjacent step pairs, 49 with a data edge, **241 (83.1%) without** — "four fifths" reproduces, and the schema genuinely has no construct for declaring or denying a step-to-step edge. **Declined:** nothing runs activity steps concurrently, no executor would read the field, and per ORC-03 the session-wide checkpoint lock means concurrent steps could not interleave anyway. Adding a zero-consumer schema field one gate after DEL-08 deleted one is not available. **Prerequisite chain, in order: an executor → a per-agent checkpoint slot (ORC-03 Part B, not accepted) → edge declarations. The report proposes the last of the three first.** The documentary argument — explicit edges would give `check-binding-fidelity` more to check — **exists, is not made by the finding, and was offered and not taken**, so it is unscoped and unpriced. See the kind-of-claim correction for what the 83.1% does and does not measure. |
| 45 | ORC-07 | MEDIUM | T3 | accept — **evidence to CHG-06, no separate mitigation** | Measured across both trees: **12 of 18 non-terminal boundaries are decision-free (67%)** — meta 3 of 4, work-package 9 of 14 — against the finding's "eight of eleven". Denominator correction, conclusion unchanged. The decision-free set is the straight-line spine: `start-work-package → design-philosophy → codebase-comprehension`, `research → implementation-analysis → plan-prepare → assumptions-review`, `implement → lean-coding-audit → post-impl-review → validate → strategic-review`, plus meta's entire pre-dispatch sequence. **No new mechanism:** a worker walking through a decision-free boundary is what `continue-batch` already does, and the only limit is `BATCH_MAX_ACTIVITIES = 3`. So **ORC-07 is the structural argument for raising the cap**, and its value is realised entirely through CHG-06. Raising the cap on structural grounds alone was offered and declined — CHG-06 still needs ORC-05's ablations. **Caution, verbatim into CHG-06: only the *dispatch* is removable, not the boundary.** `commit-and-persist`, usage recording and the README progress write all happen there; a reader who takes "no routing decision" for "deletable" loses all three. |
| 43-44 | DEL-07 + ORC-09 | MED + LOW | T3 | accept — **widened to all three benchmarks** | One gate: the report gives both a single recommendation, and it is one edit. **I ran the arm rather than restating its failure, and it changed the mitigation.** `npm run bench:token -- --label=meta-probe --workflow=meta --context-mode=fresh --no-compare` — **the walk succeeds** (meta's 5 activities load, `workflow-engine::dispatch-activity` delivered at 19,906 chars, 23 techniques resolved), then the **metrics read** dies: `Error: ENOENT: no such file or directory, open '/tmp/wf-e2e-E2A70N/.engineering/artifacts/planning/transition-790f025e-…/session.json' at main (scripts/run-token-benchmark.ts:490:32)`. **The arm exists** — `--workflow=<id>` at line 24 — so nothing needs building; sixth instance of capability-on-one-side. **No instrument would have caught this**: the arm is not run by CI, so its breakage is invisible to the repository. **Accepted:** (1) fix the transient-session assumption at `run-token-benchmark.ts:484-490` by taking session state from the harness rather than composing a path; (2) add `--workflow=meta` to the Verify job, which at `verify.yml:83` passes no workflow argument today; (3) record a meta baseline fixture. **Second re-record obligation accepted knowingly** — CHG-01's symmetric band now applies to two fixtures, and whoever lands a delivery change meets both. |
| 42 | DEL-06 | MEDIUM | T3 | accept | **"Unscoped" is wrong** — `workflow-tools.ts:471-474` documents the scoping: orchestrator technique bundle plus rules, variables, `initialActivity` and activity stubs, with per-activity step detail and worker-facing blocks **already excluded** and delivered via `get_activity`. **"Ungated" is half wrong** — a `workflow_bundle:<hash>` collapse exists at lines 447-458, but behind `if (state.contextMode === 'persistent')`, so it **never fires in the fresh mode the definitions mandate**. **Rung 2, one line:** align that condition with the predicate DEL-01 established. **Price corrected from evidence outside the code:** zero on the gated walk, **one full bundle per orchestrator resume — 104,635 characters, observed once in this session (measured)**. The **82.2% growth since July stays unexplained**; the growth-ablation variant was offered and declined, and the ablation is named as the way to answer it. |
| 41 | REM-08 | MEDIUM | T3 | **refuted in part** | Both halves false — nine call sites, not session open; a named warning, not silence. Full treatment in the corrections section. Residue to CHG-05. |
| 37 | RED-01 | HIGH | T3 | accept | **The claim is too strong and the correction re-scopes the fix.** *"Every guard defines its scan set from something a run reaches"* — measured: **24 of 28 guards use `readdirSync`**, of which **3 use the native `recursive: true`** and **12 hand-roll a recursive walk**, so **15 descend**. Most are already directory-scoped. The mechanism survives in the residue — the shallow readers miss whole subdirectories, which is RED-07's five exemplars under `activities/patterns/`. A reader taking the original wording over-estimates the problem and mis-scopes the fix, which is what the rejected **rung-7 re-architecture** of guard scoping would have been. **Rung 2, all reuse:** (1) migrate the seven remaining guards to `requireWorkflowsRoot` — `check-activity-technique-overlap`, `check-section-framing`, `check-self-provisioned-input`, `check-technique-template`, `check-variable-model`, `check-when-expression`, `check-fragments`; (2) add `assertScanned` where a guard counts what it inspects; (3) audit the shallow readers for subdirectories holding real definitions — **authorised work, not a suggestion**. ~20 lines. **Limit, stated plainly: monotonic decay SURVIVES these three parts.** What they close is **green-because-empty**. Those are different properties and the second must not read as the first. |
| 36 | MEC-03 | HIGH | T3 | accept — **three declines and one extension** | **Declined: the prose-versus-registry guard.** MEC-07 measured the surface — **4 restatements across 3 files** against a 28-entry registry, not fifteen. A guard is code to read, test and maintain, policing four lines whose drift could not be reproduced once. Rung 7 for a population of four. **Declined: an owner for server-emitted prose** — `step_techniques_note` is a string literal in `workflow-tools.ts`, so no corpus guard can see it, and a guard grepping the server's own source for prose asserting behaviour is not something that can be written correctly. **Taken, rung 2: extend `check-set-action-values.ts`** to assert every `action: set` target is reportable, closing REM-03's class across **28 sites** — seven times the restatement surface, silent when it fails, and the guard **already parses exactly those sites**. ~20 lines. |
| 35 | MEC-01 | HIGH | T3 | accept **with modification** | Tool description at `resource-tools.ts:103-119` names the coordinate, the procedure (`version-control::resolve-host-repo`), the precedence rule and the storage location. **No subprocess exists in `src/`** — zero `child_process`/`execFile`/`spawnSync`/`execSync` across 55 files, while `tests/` and `scripts/` both use one. **Schema qualification:** `repo` is `z.string().optional()` — required by convention, optional by schema, so nothing rejects a session opened without it. **Rung 6, file reads not subprocess** — spawn-git declined, server stays subprocess-free. **Resolution path, verified in this checkout and corrected by that verification:** worktree `.git` **file** → `gitdir:` → **`commondir`** → superproject `.git/config` → `[remote "origin"]`. A proposal stopping at `gitdir:` reads a directory holding `HEAD`, `index`, `commondir`, `gitdir` and **no `config`**, and would silently produce no default. **Traversal must tolerate stale directories** — `git worktree list` reports 29 entries and several `.worktrees/` children contain only `.idea` with no `.git` at all. Default only when `repo` is omitted, never overriding a passed value; prose stays for the AGENTS.md fallback. ~30 lines. |
| 34 | REM-04 | HIGH | T3 | accept — **measure first; see the open-hazard section** | The only accepted disposition that knowingly leaves a correctness hazard open. Full treatment below. |
| 33 | DEL-02 | HIGH | T3 | accept — **path-keyed** | "No cache anywhere in the loaders" verified precisely: the caching that exists is **per-call** — `touchedSkills` (`technique-loader.ts:267`) and `fragmentCache` (`workflow-loader.ts:327`) are local Maps discarded at return. **No module-level or cross-call state in any of the eight loader files**, and **no corpus revision exists in `src/`** to key on (`resolveCorpusRev` lives only in the benchmark). **Rung 3, stdlib:** a module-level `Map<string, T>` keyed on resolved absolute path in `workflow-loader`, `resource-loader`, `markdown-technique-loader`, `schema-loader`. **Revision-keyed variant declined** — it needs a subprocess call the server never makes plus invalidation machinery, for nothing a restart does not already give. ~20-30 lines, not the report's 60. **Two implementation cautions:** the guard bypass must be **the guards' explicit choice, never inferred from context** — a cache that guesses when to be a cache is how the walk-versus-real-run divergence started; and **process-lifetime invalidation is a stated precondition, not an assumption** — the server must restart when the corpus moves, and editing the corpus under a running server will serve stale definitions, which is exactly what happens during development. **DEL-09's criterion is DISCHARGED** — `resource-loader` is in scope, so the full-mode SC-13 loop at `workflow-tools.ts:1170-1181` is served from the cache. Discharge is **conditional on `resource-loader` remaining in scope** if the mitigation is reduced during implementation. |
| 32 | ORC-04 | HIGH | T3 | accept (Part A) | **435 seconds reconstructs exactly** — 15 checkpoints carry `autoAdvanceMs`, **14 at 30,000 ms and 1 at 15,000**, totalling 435,000 ms. First composite figure in the report to reconstruct to the millisecond. Four-call cost confirmed (`yield`/`present`/`respond`/`resume`) plus `MIN_RESPONSE_SECONDS = 3` at `workflow-tools.ts:1586`; 10 triples = 40 of 242 calls. **Part A (accepted, safety floor):** strip `defaultOption` and `autoAdvanceMs` from the `blocking: true` checkpoint at `12-strategic-review.yaml:165-167`, **and add a guard assertion refusing the combination** — the guard is the load-bearing half, since `activity.schema.ts:113` documents the advisory nature deliberately and nothing else prevents recurrence. **Part B (flagged, not proposed):** folding `resume_checkpoint` into the resumption dispatch removes 10 of 242 calls and one boundary per gate, but changes the worker contract every technique is written against. **Re-pricing trigger:** if ORC-05 and CHG-06 land and gates-per-worker changes, recompute the ten-call saving before anyone concludes the protocol change is not worth it. |
| 31 | ORC-03 | HIGH | T3 | accept (Part A) | All claims verified, and **the lock is broader than the finding says**. Loop: `13-submit-for-review.yaml:347` `await-review-loop`, `doWhile` on `awaiting_review == true`, **no `maxIterations`**; body is `await-review` at :357 with literally **`actions: []`** plus the `review-received` checkpoint. Lock: `assertNoActiveCheckpoint` (`src/utils/session/params.ts:62`) takes `{ checkpointId, activityId }` and **no agent component**; the finding says five delivery tools, there are **six call sites** — `workflow-tools.ts:421`, `:808`, `:1771`, `resource-tools.ts:651`, `:881` — plus the transition guard at `workflow-tools.ts:542`, and the helper's own comment says *every* authenticated handler bar `respond_checkpoint` and `present_checkpoint`. **Part A (rung 2, accepted):** move the wait into its own terminal activity so the submitting worker completes and releases its context and batch identity; a fresh worker takes the wait. ~+20 lines of definition, zero delivery change. **Part B (rung 7, NOT accepted, own gate):** per-agent checkpoint slot. |
| 30 | ORC-02 | HIGH | T3 | accept | Asymmetry exact: `resource-tools.ts:873` `resource_id: z.string()` and `:639` `step_id: z.string()`, both singular — while `workflow-tools.ts:1110` **already** loops an ordered id list and returns a **keyed map**, the `resources` block every worker already parses. So the plural response shape is not hypothetical. **Rung 2 + 6:** widen both to `z.union([z.string(), z.array(z.string())])` with single-string behaviour byte-identical; return the keyed map mirroring `get_activity`'s block; update the two corpus rules that instruct one-id-at-a-time fetching — **the prose is what serialises the wave**, so the server-only variant was declined. **Two silent-if-wrong cautions:** the ledger must write **one entry per id** exactly as the singular path does, and `unchangedMarker` must be **per-id within the map**, not per-response — DEL-01's refer-back predicate reads that state, and a batched fetch must leave it identical to a sequence of singular fetches. ~15 lines. **146 of 242 round trips ≈ 32 min of worker turn time (estimated** — count measured from the fixture, 13.1 s/turn is the report's figure**)**, **zero byte change**. **First mitigation whose value is visible only in the call-count quantity ORC-01 added** — the sequencing decision was made on reasoning and now has evidence. |
| 29 | CHG-02 | HIGH | T3 | accept — **record, do not gate** | Premise holds and is the most important thing in the report: characters proxy money, not time; 59% worker model time, 3% human wait, 38% orchestrator handoff, delivery ≤6.6% of span. **One sub-claim false:** "in no job, no guard registry and **no test**" — `tests/run-profile.test.ts` exists with **15 cases** pinning the instrument's hardest property, that a usage figure belongs to a response rather than a record. Eighth claim not to survive checking, and wrong about the strongest part of the instrument. **"In no job" is a constraint, not an omission:** `run-profile.ts:51` takes `--transcript=~/.claude/projects/<slug>/<session-id>.jsonl` — a real on-disk transcript. CI has no run to point it at. A reader taking the report at face value will try to add a job and fail. **Accepted:** record profile output into `scripts/fixtures/ablations/` using the recorded-JSON convention, and describe `run-profile` in `docs/development.md` beside the other three instruments. **Registry entry declined** on the ground that a registry of guards is not a registry of instruments, and forcing it to be both is the overload the ladder warns against. **Rejected option, recorded with its reason: a synthetic transcript.** It would measure the fixture, which is REM-01's disease. **Honest attribution:** ORC-01 is what actually moves CHG-02's content — round trips are now gated and at 13.1 s each they dominate this workload's wall-clock. Recording profiles adds evidence, not enforcement; crediting CHG-02 with fixing the slow half would overstate it. |
| 28 | REM-01 | **CRITICAL** | T3 | accept — **prescription corrected** | Diagnosis right, prescription wrong by a whole rung. The report's only CRITICAL structural recommendation was *"build a second instrument that runs under one agent identity per dispatch."* **It exists.** `tests/e2e/walker.ts:612-618` mints `worker-${current}-${visitNo}` per dispatch, holds it across every call and gate, re-requests under the same identity after each gate (line 404, `bundle: 'reference'`), and models a retry as a fresh identity — documented at lines 178-182, output captured as `gateRefetches` at line 160. **What is missing is one caller:** `opts.workerIdentity` is set in exactly one place, `tests/e2e/worker-identity-walk.test.ts:35`, and `run-token-benchmark.ts` — which produces the 1,302,319 figure feeding the CI gate — never sets it. **Rung 2 + 6:** add a `--worker-identity` flag (~4 lines, mirroring `--gate`, read via the existing `hasFlag` at line 156) and record `scripts/fixtures/token-benchmark-per-dispatch.json` from a `--worker-identity --no-compare` run. **Not gated** — the CI gate keeps its mode-matched solo comparison; a second gated arm is a separate decision with its own threshold, offered and declined. |
| 27 | CHG-04 | MEDIUM | T2 | **subsumed as a re-scope** | **Ceremony claim reproduces exactly** — commits `15ba859e` and `22e0cfaf`, both definition-only landings, both **five files, the same five**: `docs/development.md`, `scripts/fixtures/token-benchmark-baseline.json`, `tests/e2e/__snapshots__/corpus-sha.json`, `tests/e2e/__snapshots__/snapshot.test.ts.snap`, `workflows`. First is 31 lines; exactly **three regenerate from a command**. **No target text to re-scope:** nothing in `docs/`, `AGENTS.md` or `CLAUDE.md` sequences work by definition-versus-server, and `development.md:230` and `resource_resolution_model.md:225` already price by **delivery added** — the model CHG-04 argues for. Yields a **priority note**, not a target change: see below. |
| 26 | MEC-05 | MEDIUM | T2 | **subsumed** | Substance correct, headline unfounded, no target text, remedy already taken. **Correct:** the candidates sit below the gate's configurable **1% dead-band**, not below the instrument's *resolution* (one character in 1.3 million, three walks agreeing exactly). The dead-band is a flag — `--max-regression-pct`, `run-token-benchmark.ts:33` — verified overridable per invocation. **Unfounded:** "123 characters" has no traceable source. `dimensions/portfolio-audit-code.md:18` gives the largest surviving candidate as **4,097 characters** against a **13,023** floor, **3.2× below**; the shortfall is 8,926. A corpus-wide search for a standalone 123 returns only unrelated quantities (resource-call counts; `100,123` of intra-response repetition). **No target text:** nothing in `docs/`, `src/` or `scripts/` claims mechanisation savings are below the instrument's resolution — every occurrence is in a dated planning snapshot, same shape as CHG-03. **Remedy already accepted three times:** ORC-01 (call counts gated), CHG-01 (two-sided band), CHG-03 (per-candidate ablations bypass the band). **Lens-versus-report contradiction, explained:** `portfolio-audit-code.md:18` concludes "the prediction holds" while the report's insight says the conclusion "is wrong" — both hold under the dead-band/resolution distinction; the report is right, and it is the report's own summary line that carries the bad number. |
| 25 | ORC-06 | MEDIUM | T2 | accept — **delete, not hedge** | `docs/dispatch_model.md:93` asserts "the cap binds first on measured content", "roughly seven activities", and a "114,000 declared tokens" crossover. **The document refutes itself two lines earlier:** line 91 says `bench:batch` "measures activity payloads only … the *eager floor*, not what a batch really accumulates. The lazy half is usually the larger one." And line 97 says revising either dial "needs evidence a byte count cannot supply". The three figures sit between a caveat disclaiming their basis and a disclaimer denying they can inform the decision. **Rung 1: delete.** Strike the cap-binds-first clause and the seven-activities / 114,000-token sentence; replace with one line saying which limit binds is unmeasured; **keep** the measured characters (78,128 / 58,588 / 22,377; 159,093 batched against 232,954 standalone). 43.6% verified exactly: `get_activity` 520,075 of 1,193,963 per-scope delivery. Scaling 159,093 by that basis gives ≈364,892 against a 280,000 budget — so the budget binds before the third activity and **"cap binds first" inverts**. Soften and substitute-my-figures variants both offered and declined. Net −2 lines. |
| 24 | RED-08 | LOW | T1 | **skipped on rung 1** | Not a dismissal — three separate results. (a) **The structural half is wrong:** `activities/README.md:7` documents the division of labour, so the fifteen internal-flow diagrams and the one activity-flow diagram are **complementary by design**, not parallel drawings. (b) **The half the finding missed is right:** `work-package/REVIEW-MODE.md:83` is a genuine second activity-level drawing, and the vocabularies are disjoint — README uses `SWP`/`DP`, REVIEW-MODE uses `IM`/`DETECT`/`CAPTURE`. Banked for whoever builds a diagram checker. (c) **The four-edge count is UNVERIFIED, not refuted** — my extraction mapped only 8 of 32 README edges and 3 of 16 REVIEW-MODE edges, so the claim may well be true and my sweep could not test it. Skip ground: a verification pass plus a ~48-edge rename buys nothing measurable, READMEs are not delivered so there is no byte or latency effect, and no guard exists or was proposed that would consume a unified vocabulary — "it makes a future check possible" is the speculative generality the ladder forbids. |
| 23 | DEL-09 | LOW | T1 | accept — **real, subsumed, zero lines now** | `workflow-tools.ts:1163-1181`: full mode pushes every linked id to `resource_refs` at line 1166, then loops the same ids at 1170-1181 calling `loadResourceDelivery` — reading, extracting and hashing each body — and discards all of it, keeping only whether the load succeeded. The check itself is floor (SC-13: an unresolvable ref must warn, not vanish), so rung 1 cannot delete it; and there is no existence-only resolver in-repo — `resource-delivery.ts` exports exactly one function — so a cheap check would be rung 7 **and a second definition of "resolves"**. **Closed by DEL-02 instead:** memoising the corpus turns these into cache hits, and DEL-09's discarded loads are a subset of DEL-02's measured 257 reads per walk. Measured 2 discarded loads on this activity's own full-mode call. |
| 22 | DEL-08 | LOW | T1 | accept, **widened** | Rung 1 deletion, split three ways. **Delete** `BundleTechniquesSchema` and the `bundleTechniques` field (`activity.schema.ts:13-20, 287`) and the branch reading it (`workflow-tools.ts:1033`) — **zero users corpus-wide**, textbook `yagni`. **Note edit, widened by the audit rather than by the finding:** remove the per-activity size-cap clause (impossible once the knob goes), remove the current budget clause, and **replace the latter with wording saying the budget binds at small declared windows** — at 200k tokens it is 640,000 chars against a largest in-scope technique of 10,044 B, so as written it describes something that never happens in practice. **Keep** both numeric bounds and record them as unreached-by-design: an unreached safety limit is a limit working, and deleting it would remove protection against a future oversized payload — floor territory. Measured: cumulative eager budget 640,000 chars at a 200k window against a largest in-scope technique of 10,044 B; `DEFAULT_MAX_EAGER_RESOURCE_CHARS` 80,000 against a largest in-scope resource of 21,574 B. Deferral until DEL-04/DEL-05 was offered and declined. Net ≈ −25 lines. |
| 21 | REM-10 | LOW | T1 | accept | Rung 4 — one git argument. `tests/corpus-stamp.ts:26` `'rev-parse', 'HEAD'` → `'rev-parse', 'HEAD^{tree}'`; rename `currentCorpusSha` → `currentCorpusTree` and the field `corpusSha` → `corpusTree` at three call sites; update the `writeStamp` note; re-run `npm run baseline:stamp`; same one-argument fix at `run-token-benchmark.ts:325` (`resolveCorpusRev`). **Proven, and independently re-verified:** stamped commit `72db28ae` and `HEAD` `2e8b6297` both carry tree `d00cfe271771e88f0c9b68baf5fc5bc45e95e6a6`, and `git diff --stat` between them is **empty**. The test is red on byte-identical content. Tree comparison removes false alarms and introduces no false passes — two different corpora cannot share a tree hash, so no safety-floor question. Skip-the-renames variant offered and declined. |
| 20 | RED-07 | MEDIUM | T1 | accept (first half) | **First half verified:** the five exemplars at `meta/activities/patterns/01-05*.yaml` are validated by nothing — `validate-activities.ts:110` does a **non-recursive** `readdirSync(activitiesDir).filter(f => f.endsWith('.yaml'))`, so `patterns/` fails the filter and is dropped. They are **live, not dead**: `workflow-design/resources/schema-construct-inventory.md` advertises all five as borrowable, one row each, and `anti-patterns.md:1436` cites them as the shape an author must reuse. Fix at rung 4 — `readdirSync(activitiesDir, { recursive: true })`, the native option already used at `check-site-links.ts:19`. Then run it and report what the five surface. The identical non-recursive read at `check-decision-order.ts:181` folds into REM-07, not counted twice here. **Second half — "one linked resource cannot be fetched" — could NOT be located; see below.** Borrow-string question settled: **the loader accepts the short form.** `workflow-loader.ts:144-147` inserts `activities/` when a ref does not start with it, so `meta/patterns/01-orchestrator-workers.yaml` resolves to `meta/activities/patterns/…`. The inventory's strings are correct; no MEC-03 escalation. |
| 19 | RED-06 | MEDIUM | T1 | accept (Part A) | **Part A, rung 1 deletion:** the two untakeable transition edges at `07-assumptions-review.yaml:144` (→ `plan-prepare` on `needs_plan_revision`) and `:150` (→ `assumptions-review` on `needs_further_discussion`); the decorative `skip_architecture_summary != true` gate at `10-post-impl-review.yaml:139`; and six unread declarations (`needs_plan_revision`, `needs_further_discussion`, `skip_architecture_summary`, `skip_assumption_review`, `assumption_batch_accepted`). **Part B deferred to the RED-03 triage, undecided:** `needs_individual_interview` gates 8 sites across activities 04, 05, 07 and 08 with no producer anywhere — the same shape as REM-09, a capability wired at every consumer whose decision point was never added. Delete-it and wire-it were both offered and declined. Corrected count: 2 frozen variables over 9 gate sites, not three gates; the 2 edges match exactly. Net ≈ −18 lines. |
| 18 | RED-03 | MEDIUM | T1 | accept | **Count reproduces exactly** — independent reachability over 262 technique files, seeded from 412 bindings and closed transitively over relative links, returns **32** unreached. Composition corrected: **29 operations**, 1 already being deleted at RED-02, and **2 `README.md` index files** never meant to be reachable. Rung 2: restore three operation citations — `create-issue.md:104-105` and `resources/jira-issue-creation.md:113` name raw MCP tools (`getJiraProjectIssueTypesMetadata`, `createJiraIssue`) instead of applying `atlassian-operations::list-jira-issue-types` / `::list-jira-issue-fields` / `::create-jira-issue`. The group is demonstrably live: `07-assumptions-review.yaml:125` binds `::comment-jira-issue`, `01-start-work-package.yaml:261` binds `::get-jira-issue`. Then triage the remaining 26 one line each into restore-citation / delete / exempt-as-documentation, **before** proposing any edit from it; if a class emerges it returns as its own gate. |
| 17 | MEC-08 | MEDIUM | T1 | accept | Rung 6, three lines in `scripts/guards.ts`. `refs` (line 208) `json: false` → `json: true`; add `json: true` to `inherited-inputs` (lines 38-43, which omits the field); add `json: false` to `section-framing` (also omits it). Both `check-all-refs.ts:14` and `check-inherited-inputs.ts:23` import `{ runGuard, type Finding }` and handle `--json`. Consequence: `check-delta.ts` reads the flag at lines 156, 172 and 291, so both guards currently run in the delta report as opaque text instead of being compared finding-by-finding. A registry-versus-scripts guard is deferred to MEC-03. |
| 16 | MEC-07 | MEDIUM | T1 | **skipped on evidence** | **Refuted, not deferred.** Measured across every `.md`/`.yaml`/`.yml` in the corpus against the 28-entry registry: **4** guards are named in workflow prose, not fifteen; **24** are named nowhere, not ten; **0** of the claimed 3 drifts reproduced. Only 5 distinct `scripts/*.ts` paths appear in the whole corpus, one of which is `guards.ts` itself. There is no single "workflow that runs guards" — two workflows name guards across three files, and `check:all` walks the registry from `package.json`, outside any workflow. The sharper sub-claim, that one workflow states an argument contract both named scripts contradict, also fails: `validate-workflow-yaml.ts` accepts **both** a positional path (line 99) and `--root` (usage at line 107), so the prose is accurate. And the framing inverts the situation — authoring workflows naming only the 3-4 validators an author runs is correct scoping, not a gap; adding the other 24 would manufacture 24 new hand-copied restatements of a registry nothing compares. Residue carried to MEC-03. |
| 15 | REM-09 | MEDIUM | T1 | accept | Rung 2. Add an `assess-safety-floor` `action: set` step immediately before `validate-safety-floor` in the `09-lean-coding-audit.yaml` loop body, copying the shape of the sibling `reassess-simplification` at lines 78-83. `validate`'s expression target is correct by convention (siblings read `target_path != null`, `gh.auth.status == 0`); the defect is that `safety_floor_cleared` has **no producer anywhere** — grep across work-package returns exactly two hits, its declaration at `workflow.yaml:159` (`defaultValue: false`) and the assertion itself. So the assertion reads false on every pass and can never be true. ponytail's `02-apply-ladder.yaml` binds it properly; work-package borrowed the concept, the name and the technique, and the binding step did not come across. **Depends on REM-03** — this is a 29th `action: set` target and is inert without that clause. ponytail's blocking-checkpoint form was offered and declined (up to three extra interruptions in a `maxIterations: 3` loop). |
| 14 | REM-07 | MEDIUM | T1 | accept | Part 1, rung 2: replace the top-level array at `check-decision-order.ts:186` with `flattenActivitySteps` (`src/schema/activity.schema.ts:315`), which already recurses into loop bodies and is already used by the server at `workflow-tools.ts:974` and `:1244`; take the reader search from the same flattened order. Part 2: delete the exemption at line 191, run the guard, count what fires, narrow **only if it floods** — the narrowing being to exempt only where the default and the checkpoint's value agree and report the rest as a distinct class. The measurement step is authorised work. |
| 11 | ORC-05 | MEDIUM | T1 | accept | Rung 2 + 6. Add `config?: Partial<ServerConfig>` to `HarnessOptions` and spread it **last** into the config literal at `tests/e2e/harness.ts:36-43`; add `--batch-max-activities` and `--batch-headroom-fraction` to `run-batch-benchmark.ts`, read through the flag parser already at line 103. The dials are env-overridable at `config.ts:606-607` and `config.test.ts:208-225` proves that path works, but `createHarness` builds a config **literal** and never calls `loadConfig`, so no instrument can vary either dial. Buys no saving of its own; it is what makes ORC-06 and CHG-06 decidable. |

## Corrections found against the report itself

Recorded because they change what the plan may claim. **When compiled into the plan, order these by
severity of defect rather than by finding id** — a number with no source is a different class from one
that is derived but labelled measured, and a reader assessing how far to trust the report needs the
ordering to see the shape. The severity ladder, worst first:

### Deliberate behaviour misread as defect — a distinct correction class

In each case the system does the thing on purpose, says so in writing, and the finding reads it as an
oversight. **Checked for others before compiling; these are the ones found.**

- **CHG-07 — the cost gate's absence from definition PRs.** `verify-corpus.yml`'s header states the
  reason: a corpus-coupled baseline compared against a different corpus *"would fail on the difference
  rather than on a defect."* Reasoned exclusion, not omission.
- **ORC-04 — 435 seconds of `autoAdvanceMs`.** Correct behaviour in an unattended run; the timers fire
  only when a human does not answer. The defect is that **no instrument attributes them**, not that they
  exist. The report frames intended behaviour as waste.
- **DEL-06 — "unscoped" `get_workflow`.** `workflow-tools.ts:471-474` documents exactly what is excluded
  and why. The scoping pass the finding asks for has already been done.
- **DEL-08's two numeric bounds** — unreached safety limits, kept deliberately. An unreached limit is a
  limit working.
- **ORC-03's single checkpoint slot** and **ORC-05's config literal** sit adjacent to this class: both are
  named as defects, both guarantee something (see the safety-property heading).

**Before removing anything a finding calls an omission, read what the file says about itself.**

### Kind-of-claim corrections — the number is right, what it is taken to mean is wrong

Distinct from a figure correction. Nothing here is arithmetically wrong; each is a correct measurement
presented as evidence for something it does not establish.

- **ORC-08 — 83.1% of adjacent step pairs have no declared data edge.** Correct, and it is an **upper
  bound on concurrency opportunity**, not a measure of one. The detector sees only edges expressed as
  variables. **Dependencies mediated by the filesystem or the agent's working context are invisible to
  it, and both are common here** — this very activity's `compile-plan` depends on 53 executions of
  `present-and-collect-decision`, and **no variable expresses that**. The report presents the figure as a
  measure of available concurrency.
- **DEL-02 — 73% of server time.** Correct, and it is **under 2% of a real run's span**.
- **DEL-01 — 31.5% of the walk.** Correct **in delivered characters**, which are the bill, not the clock.
  Whether it belongs fully in this class turns on REM-01's per-dispatch fixture: under the production
  topology the figure is expected to be materially smaller, so it is **both** a denominator problem and a
  topology problem, and the fixture is what separates the two.

### True numbers whose denominator misleads — a distinct class

Not wrong arithmetic. Each figure below is correct and each is denominated in a quantity that is **not
the one the complaint is about.** A reader dismissing these as arithmetic errors would miss the actual
failure, which is that the report **makes this exact point at CHG-02 and ORC-01 and then leads with
character percentages everywhere else.**

| Figure as reported | True in | Worth in the currency that was complained about |
|---|---|---|
| DEL-02 — **"73% of server time"** | 6,480 ms of 8,828 ms | **under 2% of a real run's span** |
| DEL-01 — **"31.5% of the walk"** | delivered characters | the report's own prediction: *"a real run's wall-clock will not move"* |
| REM-04 — **"+29.3%"** | delivered characters, solo topology | unmeasured; needs REM-01's fixture |
| The headline — **"26.85% fall"** | 477,973 characters | round trips fell **4 of 246, 1.6%** |

**The last row is the whole programme's flagship result**, and it is the largest instance of the class.
Characters are the bill; round trips and spawns are the clock. Put the two denominators adjacent wherever
one of these figures appears, so neither can be read without the other.

**REM-08 — the prior report's *largest named risk*, and both halves of the restated claim are false.**
Recorded here rather than left to inference, because a reader tracking workflow-version drift across the
two reports will come looking for it.

- *"Without a signal"* — false. `validateWorkflowVersion` (`src/utils/validation.ts:53-55`) returns a
  warning naming both versions: *"Workflow version drift: session started with v… but current definition
  is v…."*
- *"Only at session open"* — false. **Nine call sites**: `resource-tools.ts:754`, `:902`, and
  `workflow-tools.ts:430`, `:703`, `:1197`, `:1399`, `:1577`, `:1740`. Each folds the result into
  `buildValidation`, which populates `_meta.validation`. Drift is checked on essentially every
  authenticated call.
- **The delivery path is documented in the corpus the workers read**, and I confirmed it as the
  recipient: the `validation-warnings` rule in this worker's own bundle says *"Check `_meta.validation` in
  each response."*
- **Surviving residue, carried to CHG-05 and not restated as a finding of its own:** drift is signalled
  on every call and **enforced on none**, and `seedDefaults` seeds from the **new** definition's
  declarations while the session was started against the old one. Whether that is tolerable turns on
  whether the version number is trustworthy — CHG-05's subject.

**All three delivery benchmarks break on a transient session, not just one.** Settled while
dispositioning DEL-07/ORC-09. The same unguarded pattern appears in each:

- `run-token-benchmark.ts:490` — the one that fails; error reproduced below
- `run-batch-benchmark.ts:152`
- `run-dispatch-benchmark.ts:119`

Each composes `join(planningFolder, 'session.json')` and reads it without checking existence. **A
transient meta bootstrap writes no planning folder** — `start_session`'s own description says *"Omit
`planning_folder` for a transient meta bootstrap"* — so the slug is a synthetic `transition-<uuid>` and
the file never existed. **The meta tree is invisible to three instruments for one shared reason**, not
one broken arm. Fixing only `run-token-benchmark.ts` leaves the other two failing the same way the first
time anyone points them at meta.

**36% of session state on disk is whitespace.** Not in the report at all, and found by measuring rather
than reading: this session's `session.json` is **346,129 bytes on disk against 222,172 minified**. The
pretty-printing indentation is re-read and re-parsed on every tool call — roughly 250 of them in this
dialogue alone. **The cheapest change in the entire set:** one serialiser argument, zero behavioural
change, subject to the seal precondition recorded against CHG-08. Session state is machine-read;
`inspect_session` exists precisely so nobody reads the file directly.

**Defects the evaluation missed entirely.** Three now, and all three were found by reading the code a
finding pointed at rather than the finding itself. Listed before the report's own errors because a missed
defect is a gap in coverage, not a flaw in reporting.

- **A `blocking: true` gate that resolves itself on a timer.** `12-strategic-review.yaml:165-167` carries
  `blocking: true`, `defaultOption: raise-all` and `autoAdvanceMs: 30000` together.
  `activity.schema.ts:113` states the server's auto-advance gate checks only `defaultOption` +
  `autoAdvanceMs`, **not** `blocking`. So a gate declaring it needs explicit human selection picks
  `raise-all` on a strategic review after thirty seconds, and the record attributes it to a person.
  **Safety-floor defect, not an optimisation.** Found at ORC-04; not in the report.
- **`seed_profile` unbound at the only call site that passes parameters** — a *required* input, found at
  MEC-04, where the report named only the unbound *optional* one.
- **`scripts/` and `tests/` outside the only tsconfig** — 29,000 lines unchecked, which is why
  `GuardSpec.json` can be declared required and omitted twice. Found at MEC-08.

0. **Diagnosis errors — the wrong cause named, so the wrong work follows.** Worst class: a figure
   misleads a decision, but a diagnosis misdirects the work.
   - **REM-01** — prescribed *building a second instrument*. It exists, is commented, is exercised by a
     test, and wants one flag. A reader acting on the report would have built a second walker, and two
     walkers disagreeing about what a dispatch is would be worse than the problem.
   - **CHG-08** — asserts *"every ledger improvement enlarges"* session state. **The ledger is 1.6% of
     the file; the growth is 89.4% child-session state.** The finding does not merely misprice something:
     it points the reader at the **wrong component entirely**, and acting on it — evicting ledger
     entries — would have **undercut DEL-01 and DEL-05, both already accepted**. Strongest single piece
     of evidence in the dialogue that the report's causal claims need checking.
   - **DEL-07 / ORC-09** — attributed meta's invisibility to *a missing benchmark arm*. The arm exists
     and walks meta correctly; **one shared assumption — that every session persists a `session.json` —
     breaks three instruments**, and a transient meta bootstrap writes none. The report names one broken
     arm; the actual state is a shared defect across `run-token-benchmark.ts:490`,
     `run-batch-benchmark.ts:152` and `run-dispatch-benchmark.ts:119`.
0b. **A prescription that would have made things worse** — see REM-01 above. The report's only CRITICAL structural
   recommendation was to **build a second instrument**. The instrument exists, is commented, is exercised
   by a test, and wants **one flag**. A reader acting on the report as written would have built a second
   walker, and two walkers disagreeing about what a dispatch is would be worse than the problem. **A bad
   prescription outranks a bad figure**, because a figure misleads a decision while a prescription
   misdirects the work.
1. **No traceable source** — MEC-05's "123 characters". No basis anywhere in the corpus.
2. **Conclusion overturned** — MEC-07. The claim itself is false.
3. **Derived presented as measured** — CHG-03's "moved zero" and "moved 76 characters".
4. **Miscomputed or inconsistent** — DEL-01's "28 times" (31.5), MEC-02/RED-05's three sizes for one
   population, ORC-06's unreconstructable 195,405 and 2.3%.
5. **Scoped too narrowly** — REM-07 (10 and 116, actually 18 and 194), RED-06 (2 frozen variables over
   9 sites, not three gates), DEL-08 (reachable corpus-wide).
6. **Unverified but not refuted** — RED-08's four edges; RED-07's second clause, unlocatable.

- **DEL-01.** "28 times the gate's trip point" is wrong: 410,880 ÷ 13,023 is **31.5 times**, and 31.5 is
  the figure the same finding uses elsewhere.
- **DEL-01.** The report's testable prediction — passes with no re-record needed — no longer holds once
  CHG-01's symmetric band is accepted. A 31.5% improvement fails the lower bound until re-recorded.
- **DEL-01.** The 410,880 is a single-identity benchmark figure. Under the dispatch topology the
  definitions mandate, collapse fires only within one worker's batch, bounded at two repeat activities
  by `BATCH_MAX_ACTIVITIES = 3`. That number is unmeasured.
- **CHG-03.** "The resource channel moved zero" rests on a *derived* pre-remediation value, not a
  measured one. "Moved 76 characters" is a delta against the first post-remediation recording, not the
  pre-to-post delta it reads as. `portfolio-claim.md` states that only the total and `get_activity` were
  recorded pre-remediation. These are the citation rule's first two entries.
- **REM-02.** The price (18,608 chars, 12 round trips, bundled 66→78, fetches 24→12, calls 242→230) was
  measured once and reverted; the committed tree does not reproduce it. The red `fetch-observability`
  test was not verified, only its existence and assertion.
- **REM-03.** The report specifies a mid-activity relay. Its own contested-evidence block establishes
  that delivery takes one reading of the bag before any step runs, so a mid-activity relay buys nothing
  over reporting at activity end.
- **MEC-02 / RED-05.** The report gives **three sizes for one population**: 543 unanchored links in
  MEC-02, 540 in RED-05, 514 by independent sweep using the guard's own `linkDestinations` /
  `fencedLines` / anchor regex. Anchored: 347 measured against 358 stated. The cross-tree count of
  **129 matches the report exactly**, so the methods agree and the ~60%-unproved conclusion is
  unaffected. My totals are lower because I counted only `.md` targets and skipped braced placeholders.
- **MEC-02.** The 21 unanchored links resolving to nothing are **all** in
  `work-package/resources/readme-seed.md`, naming planning artifacts by their eventual filename —
  placeholders by design. So there are **zero genuine broken unanchored links today**, and the report's
  three-edit recipe would have failed the guard on those 21 rows on first run. Hence the fourth part.
- **MEC-02.** The report names one guard; **eight** call the unproving `resolveWorkflowsRoot`
  (`check-resource-anchors`, `check-activity-technique-overlap`, `check-section-framing`,
  `check-self-provisioned-input`, `check-technique-template`, `check-variable-model`,
  `check-when-expression`, `check-fragments`) against 14 adopters of `requireWorkflowsRoot`. Splitting
  the other seven off to RED-01 was put to the user and confirmed.

- **MEC-04.** The report names the unbound **optional** input `delivered_artifact`. The same technique also
  leaves **`seed_profile` unbound, and `seed_profile` is required** — no `*(optional)*` marker, and
  protocol step 3 reads it to select rows. An unbound required input is a larger defect than an unbound
  optional one, and the report named only the optional one. Violates `signature-is-the-contract`.
- **RED-02.** The report never named the operation. Identified as `revise-session-metrics` by matching all
  three stated divergences (inputs, output shape, version). A finding that does not name its subject is
  itself a reliability item.
- **RED-02.** Two further cross-tree pairs the report does not name. **`mark-ready`** — meta
  `github-cli-protocol/` (v1.1.1, declares Inputs) against work-package `update-pr/` (v1.1.1, **no Inputs
  section at all**). Identical version across a real signature divergence: direct evidence for RED-09 and
  CHG-05, both about the version bump failing to fire — cite it there rather than re-deriving.
  **`create-pr`** — meta v1.1.1 (`branch_name`, refreshes an open PR body) against work-package v1.3.0
  (`issue_number`, links and assigns). Not called a duplicate: they may be genuinely different
  operations, and settling it needs the callers' intent.

## The safety floor overrides the ladder's lazier rung — a pattern, with three grounds

Three times the lazier rung was available and lost. Each loss is recorded with its ground rather than as a
preference, because `the-ladder.md` makes the floor the ground the ladder stands on, not a rung.

- **ORC-05 — hermeticity.** Having `createHarness` call `loadConfig` was one line and free. It would have
  made every test read the developer's environment. Test hermeticity is a correctness property.
- **REM-05 — the round-trip currency.** Deleting the fifteen unreached server lines was strictly lazier.
  ORC-01 had two gates earlier made round trips a gated quantity, so deleting a built capability whose
  only function is to remove a round trip would work against a decision already taken.
- **REM-09 — evidence of intent.** Deleting the no-op `validate` assertion cost no working behaviour,
  since it never fires. It would have deleted the evidence that a floor check was intended, in an activity
  whose workflow declares `safety-floor-never-simplified` as a principle.

## Corrections to figures I previously recorded

- **REM-07 is corpus-wide, and larger than measured.** `collectFindings` iterates every directory holding
  an `activities/` folder — **17 trees**, `prism-evaluate` included. Re-measured across all of them: **18**
  nested checkpoints become visible, not 10, and **194 of 238 bindings (81.5%)** fall under the exemption,
  not 116 of 133. The earlier figures were scoped to meta and work-package only.
- **A false start worth recording.** My first sweep for unanswerable gates scanned workflow variables,
  action targets, checkpoint effects and loop variables — **but not technique outputs**. It returned two
  candidates, and both survived scrutiny: `matched_session` is a declared output of
  `workflow-engine::match-saved-session` bound at `00-discover-session.yaml:75`, and `worker_result.*` is
  self-provisioned from the worker envelope, which `check-self-provisioned-input.ts` exists to permit.
  Neither is a finding.

## Methodological correction — import presence is not protocol participation

Twice the same over-broad heuristic produced candidates that did not survive, and both were caught before
they reached a gate as findings. Recorded so the next person does not repeat it.

- **REM-09.** A producer sweep that scanned workflow variables, action targets, checkpoint effects and
  loop variables — but not **technique outputs** — reported `matched_session` as unproducible. It is a
  declared output of `workflow-engine::match-saved-session`.
- **MEC-08.** Treating any import from `guard-protocol.js` as protocol participation flagged seven
  guards. Four import only `requireRootOrExit`, a root-checking helper. Only the two importing `runGuard`
  speak the protocol.

- **RED-06.** A per-tree frozen-variable sweep reported **33** immovable gates. Nineteen read
  `stealth_mode`, which `workflows/remediate-vuln/activities/01-start.yaml:16` writes — and
  remediate-vuln **borrows these very work-package activities** to run them with disclosure suppressed.
  Those gates are the mechanism working as designed. Deleting them would have silently broken a workflow
  outside this evaluation's scope, with all 28 guards still green.

### Named hazard for whoever executes these mitigations

**The producer search scoped too narrowly.** All three instances above are the same error, and everyone
executing a delete verdict will be running the same kind of search. Before classifying anything as dead:

1. **Include technique outputs.** A `### name` under `## Outputs` in any technique file is a producer.
2. **Check the imported binding, not the import.** A symbol's presence in an import list says the file
   references the module, not that it participates in the module's contract. Look for the call.
3. **Search all 17 trees, not the one you are in.** A borrowing workflow can bind an activity and write
   the variables its gates read. **A file unreached from its own tree is not unreached; it is unreached
   from one tree.** Record which trees were checked for every delete verdict.

**This changes the RED-03 triage design.** That triage cannot be a per-tree sweep. Before it classifies
any of its 26 files as delete-able it must establish, corpus-wide across all 17 trees, whether any
borrowing workflow binds the activity or writes the variable, and record the trees checked per verdict.
It must also reach `needs_individual_interview` explicitly rather than leaving it implicit.

### `contextMode`-gated behaviour is a class, and no instrument can see it

**Two of the four delivery channels carry a working collapse reachable only in a mode the definitions
forbid for worker-dispatched sessions.** Both were found by reading the condition; **neither would be
found by the benchmark, because the benchmark runs the mode in which the capability is off.**

| Channel | Condition | Consequence |
|---|---|---|
| DEL-01 — resource + technique | `referenceMode` only, no `hasDispatch` disjunct | ledger written on every call, read on none |
| DEL-06 — `get_workflow` | `if (state.contextMode === 'persistent')` at `workflow-tools.ts:447` | the `workflow_bundle:<hash>` collapse never fires in fresh mode |

**`contextMode`-gated behaviour is worth an audit as a class.** Any capability whose enabling condition
names `contextMode` is, by construction, invisible to a fresh-mode benchmark and absent from the
production topology.

### The instrument measures the happy path, and several of these costs occur off it

The recorded twelve-activity walk is a **single clean path**: one iteration per loop, no failures, no
retries, no resume, no compaction, no human latency. Anything that happens only on a degraded or resumed
run is invisible to it **by construction** — which is the same defect REM-01 names about *topology*,
applied to *run history*.

| Cost | Why the walk cannot see it | Observed anyway? |
|---|---|---|
| Orchestrator resume re-delivering the workflow bundle | the walk never resumes | **Yes — 104,635 characters, this session** |
| Worker compaction receiving markers for lost bytes (REM-04) | the walk never compacts | no — frequency uncounted |
| Review latency holding a worker for hours (ORC-03) | the walk answers gates instantly | no — 435 s of timer is the only proxy |

**Several figures called "unmeasured" in this dialogue are unmeasured only because the instrument runs
the happy path.** They are not rare; two of the three above are routine.

### Scoping against how the system is described rather than how it is run

Four instances. The hazard is not "scope too narrowly" — each sweep was correctly scoped **to the nominal
case** and wrong about **the operating one**.

| Where | Nominal | Operating |
|---|---|---|
| RED-06 | work-package's own gates | `remediate-vuln` borrows the activities and writes `stealth_mode` |
| DEL-08 | the two evaluated trees | the 80,000-char cap **is** reachable — `anti-patterns.md` at 166,057 B |
| RED-07 | all markdown links | the guard skips fenced blocks; 16 of my 17 hits were template placeholders |
| MEC-01 | `.git` is a directory | **28 linked worktrees** where `.git` is a file — plausibly the majority case |

### One missed gate, and what it shows

At CHG-05 the proposal was written, the options listed and a `<checkpoint_yield>` block emitted — but
`yield_checkpoint` was never called, so no gate existed on the server and there was nothing to resolve.
**The tagged block is not the gate; the tool call is, and an emitted block with no call is
indistinguishable from a real yield in the transcript.** That is this evaluation's own recurring defect
class — *an absence and an acceptance produce the same signal* — occurring in the process rather than in
the system under review. One occurrence across fifty dispositions; recorded, not dwelt on.

### Two mitigations withdrawn after acceptance, both smaller on the second pass

Both withdrawals came from a check run **after** the user had accepted, and both replaced the accepted
version with less code.

| Finding | Accepted first | Withdrawn because | Revised to |
|---|---|---|---|
| REM-05 | pass `context_tokens` at two definition call sites | the orchestrator has **no binder** for it — the value is persisted nowhere | record it on the dispatch event; one call site needs no edit at all |
| RED-04 | compare `corpusSha` and fail | orphan detection **already exists** with a `stale` bucket; the comparison already exists and is deliberately advisory | make the existing `stale` count fail |

**An accepted mitigation is not closed to evidence.**

### The order findings were taken in changed which mitigations were available

Two consecutive dispositions were decided by citing a decision taken **earlier in this same dialogue**,
not by reasoning about the finding alone:

- **ORC-08** declined a per-step dependency construct by citing **DEL-08**, one gate earlier, which
  deleted `bundleTechniques` — a per-activity knob with zero consumers across 21 trees. Adding a
  zero-consumer knob immediately after deleting one is not available as a proposal.
- **ORC-07** proposed no mitigation because **CHG-06** owns the batch cap, and ORC-07's whole value is
  the structural argument for raising it.

**A different order would have produced a different plan.** ORC-08 taken before DEL-08 would have had no
precedent to cite; ORC-07 taken before the wall-clock account was assembled would have read as an
independent optimisation rather than as evidence for one dial. The dialogue became self-consistent rather
than treating each finding independently, and that is a property of the sequence, not of the findings.

### Check the claims that are cheap to check — two for two so far

**Both times a claim was settled by reading two or three files, the answer changed.** REM-10: the stamped
commit and HEAD proved to have **identical trees**, turning a suspected re-record into a one-argument fix.
MEC-01: following `gitdir:` reached a directory with **no `config`**, adding a third hop the proposal
would otherwise have missed and which would have silently produced no default.

Both took minutes. **Where a claim can be settled by reading files, read them.**

### A second, distinct hazard: a sweep that does not match the guard it models

The first three hazards above are all the producer search scoped too narrowly. This one is different in
kind and will bite anyone re-deriving these counts.

- **RED-07.** A sweep for unresolvable bare `resource-id#section` citations returned 17 hits, **16 of
  them unresolvable** — and all 16 were template placeholders (`](url)`, `](pr-url)`, `](link)`,
  `](file#anchor)`) sitting inside fenced template bodies. **`check-resource-anchors.ts:114` skips
  fenced blocks**; my sweep did not. The single genuine bare citation resolves.

**The rule:** when a sweep models a guard's question, it must apply the guard's own exclusions — fenced
blocks, inline code spans, braced placeholders, and the guard's named exemptions. A sweep that is
stricter than the guard reports findings the guard would never raise.

### Where to look next: the capability-on-one-side pattern recurs at a rate

The report names *"a capability lands on one side of a boundary and the other side never arrives"* as its
first cross-cutting pattern — and does not notice how often it recurs in its own material. **Four
instances in twenty-eight findings examined**, all found by asking "who calls this?":

| Finding | Built | Missing |
|---|---|---|
| REM-02 | `unboundPositiveReads`, 16 tests | zero callers in `src/` |
| DEL-01 | the refer-back predicate | present on 1 of 3 delivery channels |
| REM-05 | the boundary-accurate batch reading | neither call site passes the parameter |
| REM-01 | the per-dispatch walker mode | one caller, and it is a test, not the benchmark |

**That is a rate, not a coincidence, and it is a search strategy.** For any capability the corpus or
server documents, grep for its callers before assuming it runs. Three of the four were mis-prescribed by
the report as things to *build*.

### A finding that names a mechanism as a defect without asking what it guarantees

Second instance in thirty-one findings, so it is a class rather than an observation. In both cases the
*correct* fix is bounded by a safety property rather than by effort, and in both the finding treats the
safety mechanism purely as a defect.

| Finding | Named as defect | What it actually guarantees |
|---|---|---|
| ORC-05 | the harness builds a config literal instead of reading env | **test hermeticity** — env-reading would let a developer's shell change suite behaviour |
| ORC-03 | `activeCheckpoint` is one slot with no agent component | **no context acts on state a pending decision will change** |

**Whoever executes these mitigations will meet it again.** Before removing a constraint a finding calls a
defect, ask what breaks when it is gone.

### Sweep scope must match the claim, not the evaluation's boundary

RED-06 and DEL-08 are the same hazard from opposite directions, and both would have produced a wrong
answer at the evaluation's nominal two-tree boundary.

- **RED-06 — too narrow nearly deleted live code.** Nineteen `stealth_mode` gates read as frozen within
  work-package; `remediate-vuln` writes the variable and borrows the activities.
- **DEL-08 — too narrow would have missed a live cap.** `DEFAULT_MAX_EAGER_RESOURCE_CHARS` is
  unreachable within meta and work-package, and **reachable corpus-wide**: `workflow-design/resources/
  anti-patterns.md` is **166,057 bytes against an 80,000 cap**. The finding as written would have had a
  reader believe no corpus can reach that bound.

**The rule:** choose a sweep's scope against the claim being tested, not against the evaluation's stated
boundary. "No corpus can reach this" is a corpus-wide claim whatever the evaluation covers.

### RED-07's second clause could not be located

**Stated plainly so nobody infers it was folded into the half that was fixed.** *"One linked resource
cannot be fetched"* — I could not find it. Both meta and work-package cite resources by relative path
rather than bare id, so the bare-citation class is nearly empty by construction, and the anchored-path
class is already covered by the accepted MEC-02 change. The clause is unfixed, not silently absorbed.

### A class the report does not have: dead variables, not dead gates

`skip_assumption_review` and `assumption_batch_accepted` are declared with defaults and read by
**nothing at all** — not a gate, not a transition, not an interpolation. RED-06 deletes them under Part A.
**No guard would have found them**, which is precisely the unverified-surface problem RED-01 is about.

## Scope addition 1 — ponytail transition gate · **accepted**

**Checked the README's declared divergences before proposing, and neither covers this.** The two
intentional divergences are *"Invoked, not persistent"* and *"Governs what is built, not how you talk"*.
Neither concerns the transition or the safety floor, so this is a genuine mismatch rather than a
documented deviation. **That check is the discipline `the-ladder.md` itself demands — understand before
you climb — and it is what separates this from a finding that assumes an omission.**

**Which of the two is wrong: the prose.** `safety_floor_cleared` is bound correctly by the
`safety-floor-cleared` checkpoint and consumed correctly by the `doWhile` at
`02-apply-ladder.yaml:10-14`. It gates **the climb loop**, not the edge. `workflow.yaml:47`'s claim that
it *"gates the transition into over-engineering-review"* is the false statement. But the loop is bounded
at `maxIterations: 5`, so five "needs-work" answers exhaust it and the unconditional transition fires
with the floor uncleared.

**Accepted, all three parts:** condition the transition on `safety_floor_cleared == true`; add a second
transition routing the exhausted-and-uncleared path to `05-harvest-debt-and-report`, so no path is left
unable to transition; correct `workflow.yaml:47` once the first lands. **Prose-only variant declined**, so
the enforcement lands rather than the hazard being documented. ~+4 lines.

**Symmetry with REM-09 — stronger than either finding alone.** Same corpus, same variable name, two
halves of one transplant that arrived incomplete **in both directions**:

| | Intent | Missing |
|---|---|---|
| **REM-09** (work-package) | documented — the `validate` assertion exists | **the binding** — no producer anywhere, so it reads `false` forever |
| **Ponytail** | documented — `workflow.yaml:47` says the variable gates the transition | **the enforcement** — the transition is unconditional |

## A structural limit none of the 53 findings names: an activity cannot gate on what its YAML did not anticipate

Found by hitting it. `yield_checkpoint { checkpoint_id: "scope-addition#ponytail-transition" }` was
**refused** — *"Checkpoint not found: scope-addition#ponytail-transition in activity
resolution-dialogue"*. The server matches the base id before `#` against the checkpoints the activity's
YAML declares, and this activity declares only `finding-decision` and `confirm-apply`.

**What it cost here.** Work admitted mid-run — three scope additions the evaluation did not produce — had
no id of its own to gate under, so each borrowed `finding-decision`'s. **Every scope addition is recorded
under a label that describes something else**, and anyone reading `checkpointResponses` later must decode
`finding-decision#scope-ponytail-transition` as *not a finding decision*.

**Why it matters beyond bookkeeping.** A workflow that discovers work while running cannot gate on it
without editing its own definition. The dialogue's own outcome — three admitted additions and a top-item
diagnosis that outranks all 53 findings — is exactly the case the construct does not support.

## Scope addition 3 — RED-03 triage · **complete**

**Method:** swept **976 files across 19 trees**, checking every unreached file for a qualified
`group::op` reference, a path reference or a bare-name reference, excluding self-references. Verdict list
is an appendix; trees checked are recorded per verdict.

**Denominator correction, and it affects several earlier entries.** The sweep found **19 trees with
definitions, not 17** — `work-packages` and `plain-language` also hold them. Counts taken earlier against
"all 17 trees" therefore used a slightly narrow denominator: RED-06's cross-tree writer sweep, REM-07's
guard-coverage census, and RED-03's original reachability run. **No conclusion moves.** The two additional
trees contain no writer for any variable RED-06 examined and no reference to any file RED-03 classified —
I re-checked both in this sweep. **The discrepancy is arithmetic, not substantive**, and is recorded
because a reader comparing numbers across entries will notice it.

**Verdicts.** 2 exempt as documentation; 1 already accepted for deletion at RED-02 (the sweep's hit on
`session-trace.md` targets the **meta authority**, not the local copy — verified at RED-02, so deletion
stands); **6 referenced somewhere and therefore not deletable**, of which `invoke-as-tool` and
`knowledge-base-search/TECHNIQUE.md` are advertised-but-uncited and take RED-03's citation fix, and the
two `gitnexus-operations` files are marked **investigate** because a CHANGELOG mention is history rather
than a binding.

**The 23 with no reference in any tree — the triage's real value is that I declined to call them
deletable.** Fifteen are `atlassian-operations` operations, and RED-03 established that
`create-issue.md:104-105` **restates the Jira calls in prose** while the group is demonstrably live
(`::comment-jira-issue` and `::get-jira-issue` are bound). **So "no reference" is evidence of the inlining
defect, not of deadness.** Deleting them would remove the canonical definition and keep the hand-copy —
the same rung-1 rejection RED-03 reached, applied consistently a hundred gates later. They resolve
through RED-03's accepted citation fix.

**`needs_individual_interview` — RED-06 Part B, reached as required. Verdict: delete.** Eight gate sites
across activities 04, 05, 07 and 08, **no producer in any of the 19 trees**, re-confirmed in this sweep.
Unlike `stealth_mode`, **no borrowing workflow writes it**; unlike REM-09, **no floor obligation forces
wiring it**. Delete the four `== true` branches and unwrap the four `!= true` gates. ≈ −12 lines.

## Additions to scope — not report findings

Both admitted by the user during the dialogue rather than raised by the evaluation.

- **ponytail transition gate.** `workflows/ponytail/activities/02-apply-ladder.yaml:37-39` transitions to
  `over-engineering-review` with `isDefault: true` and no condition, while `workflow.yaml:47` describes
  `safety_floor_cleared` as gating that transition. One of the two is wrong. The loop is bounded at
  `maxIterations: 5`, so a conditional transition needs a defined destination for the exhausted-and-
  uncleared path. The ponytail README declares two deliberate divergences — check whether this is one
  before proposing. **Awaiting its own gate.**
- **tsconfig coverage.** `tsconfig.json` is the repository's only TypeScript config, with
  `"include": ["src/**/*"]` and `"rootDir": "./src"`. `scripts/` (47 files, 9,935 LOC) and `tests/`
  (82 files, 18,955 LOC) are outside the typechecked project. This is why `GuardSpec.json`, declared
  required at `guards.ts:23`, can be omitted by two entries while `npx tsc --noEmit` passes clean.
  **Scoped to the narrowest option — `scripts/guards.ts` alone.** Core configuration under the
  file-sensitivity rule; awaiting its own gate.

  **Costed measurement, recorded so nobody re-runs it.** A throwaway config in `/tmp` extending the
  repo config with `rootDir` at the repo root and `declaration`/`declarationMap` off:

  | Scope | Errors |
  |---|---:|
  | `src/` | **0 — already clean** |
  | `scripts/` | 179 |
  | `tests/` | 185 |
  | **Full parity total** | **364** |
  | `scripts/guards.ts` alone | **2** |

  **240 of 364 (66%) are `TS4111`**, from `noPropertyAccessFromIndexSignature` at `tsconfig.json:19` —
  a mechanical `process.env.FOO` → `process.env['FOO']` rewrite. Excluding those: 124 findings, 40 in
  scripts and 84 in tests. Of the remainder, `noUncheckedIndexedAccess` accounts for 31 (TS18048,
  TS2532) and `exactOptionalPropertyTypes` for 19 (TS2375, TS2379), leaving roughly **74** ordinary type
  errors. The `rootDir: "./src"` conflict is real but solvable by a separate config; `scripts/` and
  `tests/` can be admitted together, nothing forces separating them.

  The two errors in the narrow scope are exactly the MEC-08 omissions, reported as
  `TS2741: Property 'json' is missing … but required in type 'GuardSpec'` at `guards.ts(37,3)` and
  `(44,3)`. Both are closed by the three-line MEC-08 fix already accepted, so the narrow scope lands
  green. **Whatever is proposed must be wired into a script that actually runs** — an uninvoked config
  is the green-because-empty failure `workflows-root.ts` names and MEC-02 just closed.

## One mechanism, three findings: `stageField` and the ledger cluster

**Findings 38-40 — DEL-03, DEL-04, DEL-05 — are not three changes.** They are three granularities of one
mechanism that already exists, and the entry is written mechanism-first because that is what made the
reduction visible.

**The mechanism.** `src/utils/delivery.ts:109-129`, `stageField`: hash a field, key it `<prefix>:<hash>`,
collapse to an `unchangedMarker` when the scope already holds it. `dedupTechniqueBlocks` applies it at
**two granularities already** — whole blocks (`DEDUP_BLOCKS`) and the `note`/`items` split within an
inherited block (`INHERITED_SPLIT_BLOCKS`, lines 159-170), *"so a shared preamble collapses across
techniques whose own-input sets differ"* — and records the whole-block key alongside so a reader that
only understands whole-block markers keeps working. **This is the report's own *"the codebase already
contains the fix in miniature, applied to exactly one field"*, and it is precise.**

| Finding | Wants keyed finer | Reachable with `stageField`? | Disposition |
|---|---|---|---|
| **DEL-05** | a set-valued block per entry | **Yes** — the `note`/`items` split, one level deeper | **accept**: extend `rules` to per-entry keying, ~15 lines |
| **DEL-04** | invariant core apart from step-bound delta | **Yes** — `provenance_note` is *already* the step-bound preamble, split at line 156 | **accept: audit first** |
| **DEL-03** | a section as a sub-range of its file | **No** — containment is a new relation no key expresses | **defer**, trigger below |

**DEL-04's audit must reach a definite outcome.** It has been through two hands already and must not pass
to a third as "possibly zero lines". The audit answers one question: **does anything in a composed
technique vary with the step binding other than `provenance_note`?** Two admissible outcomes:
**(a) "Closed — nothing else varies per step binding"**, recorded as closed with no code written; or
**(b) "These fields also vary: ⟨list⟩"**, each then keyed separately via `stageField`. An audit recorded
as inconclusive is the finding handed on unchanged.

**DEL-03's deferral trigger, operational.** Not "re-examine later". The eager path already handles
containment *within one response* — `coveredByItsFile` at `workflow-tools.ts:1106-1112` skips a section
whose file is in the same bundle. What is missing is containment *across* responses, and ORC-02's plural
fetch changes how often that arises.

> **Trigger:** after ORC-02 lands, measure over one recorded walk what share of resource requests ask for
> a `#section` whose bare file the same scope already holds. **If that share exceeds 10%, build
> containment keying. If it is below, record DEL-03 as closed by ORC-02.** **Who looks:** whoever records
> the post-ORC-02 fixture, as part of it.

## MEC-06's 22 preconditions are four surfaces, not one

The finding's headline invites scoping work for all of them. Enumerated and classified:

| Group | Count | Examples | Verdict |
|---|---:|---|---|
| **Needs a subprocess** | ~6 | `gh.auth.status == 0`, `gpg.agent.reachable == true`, `signing.configured == true`, `commits_signed != false`, `on_feature_branch != false`, `push_remote_verified != false` | **Architecturally blocked** — MEC-01's accepted decision keeps the server subprocess-free |
| **Needs a filesystem read** | ~3 | `planning_folder_path.writable == true`, `workflows.worktree.present == true`, `broken_artifact_links == []` | **Accepted** — folded into MEC-01 |
| **Bag read only** | ~6 | `target_path != null`, `host_repo_path != null`, `client_session_index`, `branch`, `cloudId != null`, `component_selection_needed != true` | **Declined — see the correction below** |
| **Judgement or prior work** | ~7 | `fragment_references_issue != false`, `summary_budget_overruns == []`, `missing_prerequisites.length == 0` | **Not candidates** — the report's own filter excludes intent-reading steps |

**Correction to my own decline reasoning, made under scrutiny.** I first declined the bag-read group as
*"guarding already-guaranteed state"*. **That was wrong.** Checking the server: **none of the six is
validated by it** — `target_path`, `host_repo_path`, `client_session_index` and `cloudId` appear nowhere
in `src/` outside the schema, and only one of the six carries a `defaultValue`. They are ordinary
workflow variables the server never inspects. **The honest ground for declining them is different and
weaker:** they are zero-cost agent checks whose mechanisation would require the server to interpret
validate actions, which it deliberately does not do. **They have never been observed to fail; that is not
the same as being guaranteed, and the distinction is recorded rather than papered over.**

**`safety_floor_cleared == true` is excluded from every mechanisation count** — it is REM-09's defect,
already accepted for fix. Counting it as a candidate would double-count a fix as an opportunity.

**Standing cost of the subprocess-free boundary: 14 agent-executed checks** rest on it (the 6 subprocess
preconditions plus the 8 in MEC-01's resolve-host-repo procedure). Recorded because someone may later
want to weigh that decision again.

## `step_techniques_note` — an unowned surface, no proposed owner

Recorded separately so it can be found without reading MEC-03's reasoning to get there.

**What it is.** Server-emitted prose asserting behaviour, composed in `workflow-tools.ts` and shipped on
**every `get_activity` — twelve times per walk**. It is the highest-traffic prose in the system and every
worker reads it.

**Two defects found in it, both incidentally.** (1) It listed *"a per-activity size cap"* as a reason a
step is lazy — a cap that cannot fire, since `bundleTechniques` has zero users; DEL-08 strikes it.
(2) It listed *"past the derived eager-delivery budget"* — reachable only at a small declared window;
at 200k tokens the budget is 640,000 characters against a largest in-scope technique of 10,044 B.

**Why it has no checker, and no honest one is proposed.** It is a string literal in the server's source,
not a corpus file. No corpus guard can see it. A guard that greps the server's own source for prose
asserting behaviour is not something I know how to write correctly, and proposing one would be building a
thing whose failure mode is worse than the defect.

**Standing risk, accepted.** The mitigation is the one DEL-08 took: fix the text when it is found wrong.
Both defects were found by reading the note against the code it describes — which nothing schedules.

## Prerequisites, in order — nothing below the line is reliably priced without them

1. **ORC-05** — `config?: Partial<ServerConfig>` on `HarnessOptions` plus the two batch flags. Until this,
   no instrument can vary either batch dial, so ORC-06, CHG-06 and the whole critical path for the slow
   half of the complaint are blocked.
2. **REM-01's per-dispatch fixture** — the `--worker-identity` flag plus a recorded
   `token-benchmark-per-dispatch.json`. **Load-bearing twice over: it determines DEL-01's real saving and
   REM-04's real cost.** If it is never recorded, both figures stay solo-topology and **REM-04's
   disposition rests on nothing** — the decision not to pay 29.3% was taken partly because that figure is
   probably inflated, and only this fixture can say by how much.
3. **Dial ablations**, recorded in `scripts/fixtures/ablations/` per CHG-03.
4. **CHG-06's decision** on the two batch dials.

## Queued gates — not yet decided

Kept here so none is lost if the dialogue's context is. Three scope additions plus the remaining findings.

| Item | Origin | State |
|---|---|---|
| ponytail transition gate | admitted at REM-09 | specified below; awaiting its own gate |
| `scripts/guards.ts` typecheck config | admitted at MEC-08, scoped at RED-03 | costed; awaiting its own gate |
| RED-03 triage outcome | accepted at RED-03 | triage not yet run; must reach `needs_individual_interview` (RED-06 Part B) explicitly and check all 17 trees per delete verdict |
| Findings 22-53 | evaluation report | 32 remaining: T1 Low ×3, T2 ×3, T3 ×25, T4 ×1 |

## Checked and correct — negative results worth keeping

Each cost a check. Recorded so nobody re-investigates them.

- **Inventory borrow strings resolve.** `workflow-loader.ts:144-147` inserts `activities/` for any
  cross-workflow ref that does not already start with it, so the inventory's short form
  `meta/patterns/01-orchestrator-workers.yaml` resolves to `meta/activities/patterns/…`. The five
  advertised borrow strings are correct documented shorthand, not broken references.
- **Four `guard-protocol.js` importers are correctly declared `json: false`** — `validate-activities`,
  `validate-workflow-yaml`, `check-prism-lens-reachability`, `check-stealth-isolation` import only
  `requireRootOrExit`.
- **`matched_session` and `worker_result.*` are properly produced** — a technique output and a
  self-provisioned envelope value respectively.
- **Nineteen `stealth_mode` gates are live**, written by `remediate-vuln`, which borrows the activities.
- **`resources_note` is accurate in both delivery modes.** Audited as the sibling of the note DEL-08
  corrected. Its reference-mode text names oversize and budget, which are exactly the two conditions at
  `workflow-tools.ts:1140` and `:1148`; its full-mode text correctly says no bodies are bundled. The
  defect is confined to `step_techniques_note`.

## ORC-06 is one task with two steps, not a deletion and a hope

Sequenced explicitly, because deleting a calibration leaves a gap that must be filled by measurement
rather than left open:

1. **ORC-05 lands** — `config?: Partial<ServerConfig>` on `HarnessOptions`, plus the two batch flags on
   `run-batch-benchmark.ts`. Until this, no instrument can vary either dial.
2. **One ablation per dial**, recorded in `scripts/fixtures/ablations/` per CHG-03.
3. **The documentation regains a calibration that has a basis** — measured figures replace the deleted
   ones, carrying `(measured)` per the citation rule.

**Both candidate replacement figures are unreconstructable and neither is recorded as correct.** The
report's *195,405 declared tokens* and *2.3% margin* I could not derive from any combination of the
documented and recorded values; my own working put the crossover nearer 260,000 tokens with the limits
some 30% apart. Substituting mine for the report's would have replaced one unreconstructable figure with
another — the exact defect ORC-06 is about. Neither lands.

## The wall-clock account — where the slow half actually is

The measured real run splits **59% worker model time · 3% human wait · 38% orchestrator handoff with
nothing executing**. Four orchestration findings touch that surface. They do not touch the same part of it.

| Finding | What it removes | Which term |
|---|---|---|
| **ORC-02** | 146 worker round trips at 13.1 s ≈ 32 min | **the 59%** — these calls happen *inside* an activity |
| **ORC-03** | the session-wide checkpoint lock; review latency off worker lifetime | **the 3%**, plus unlocking concurrency |
| **ORC-04** | 10 yield/present/respond/resume triples per walk | **the 38%** — a gate *is* a handoff |
| **ORC-07** | 8 of 11 boundaries carrying no routing decision | **the 38%** — a decision-free boundary need not return to the orchestrator |

**Only ORC-04 and ORC-07 attack the 38% directly. And the largest single item inside it belongs to
none of them: the 87-second worker spawn.** Fewer spawns means a higher `BATCH_MAX_ACTIVITIES`, which is
**CHG-06** — the single T4, and the one finding classified as immovable without data.

**Stated plainly: a reader who lands ORC-02 and ORC-04 and expects the run to feel much faster will be
disappointed.** ORC-02's 32 minutes is real but lands on worker turns; ORC-04 removes ten handoffs out of
a term dominated by spawns. The dominant lever on the dominant term is the batch dial, and turning it
requires the measurement ORC-05 unlocks.

**435 seconds of deliberate sleep sits inside a run's wall-clock, uncounted.** 15 checkpoints carry
`autoAdvanceMs` — 14 at 30 s, 1 at 15 s. **The timers are correct behaviour** in an unattended run; they
fire only when a human does not answer. **The defect is that no instrument attributes them**, so up to
7¼ minutes of intentional waiting is indistinguishable from slowness in any wall-clock reading.
**The report frames this as waste; it is a measurement gap.** Remove the timers and unattended runs break;
count them and the run's clock becomes readable.

**ORC-03 Part A is not on this list of things that make a run faster.** It lands on the 3% human-wait
term and unlocks concurrency **nothing in this corpus exploits** — no workflow here spawns parallel
workers. Its value is cost and resumability: one worker's context and batch slot stop being held for the
hours a real pull-request review takes. It does not move the recorded walk's clock.

**Open question for ORC-03 Part A, to settle when it is written up.** The corpus puts `maxIterations` on
its other loops; `await-review-loop` has none. An unbounded wait is correct for a human review — and an
unbounded loop with an empty body is also exactly how a runaway looks. The two are indistinguishable from
outside. If a bound is right, what happens at the bound must be defined: most likely surfacing a blocked
status rather than transitioning, since a review that has not arrived is not a completed review.

**This reorders the plan.** ORC-05 is not a minor T1 prerequisite. **ORC-05 → dial ablations → CHG-06's
decision is the critical path for the slow half of the complaint.** Everything else in the orchestration
dimension is smaller than that path.

## Implementation-priority notes — strong guidance, not conformance requirements

From CHG-04, with the measurement attached so the guidance survives a reader who disagrees with it.

- **Land every definition-only edit as a single corpus bump**, producing the three regenerated files once
  at the end. Seven accepted mitigations touch definition files — REM-03, REM-05, REM-09, RED-02, RED-03,
  RED-06, MEC-04. Landed separately that is **7 × 5 = 35 file-touches and ≈217 lines** of ceremony;
  landed together, **5 files and ≈31 lines**. Saving **≈30 touches and ≈186 lines that buy nothing** —
  and it is ceremony, so no instrument in the repository sees it.
- **REM-10 lands before that bump.** It changes what `corpus-sha.json` records, and that file is one of
  the three regenerated by every definition landing; landing it after means regenerating the stamp in
  the old commit form and immediately again in the new tree form.

## Tier T2 complete — the tier is itself a finding

**All three T2 members had no target text to re-scope.** CHG-03, MEC-05 and CHG-04 each corrected a claim
that lives only in dated planning artifacts, and in CHG-04's case the target documentation **already
states the correct model in two places**. The tier resolved to the prior report's prose, not the system's.

Recorded as an observation about the evaluation rather than about the corpus: **a "the prose claims more
than measurement supports" finding class tends to point back at the evaluator.** Anyone commissioning a
similar evaluation should expect it and scope the tier accordingly.

## REM-04 — a correctness hazard knowingly left open

**This is the only accepted disposition in the dialogue that leaves a correctness hazard open.** It is
not a deferral and not a subsumption. It is a decision to measure before paying, taken with the failure
mode understood.

**1. The failure.** The server infers what a context holds from identity alone —
`mayReferBack = bundle !== 'full' && (referenceMode || hasDispatch(state, scope))` at
`workflow-tools.ts:877`, and after DEL-01 on all three delivery channels. `hasDispatch` is a pure history
scan: *has this `agent_id` ever been dispatched*. A worker compacted while live keeps its identity and
receives short markers for bytes it no longer holds. **If it does not notice, it proceeds on content it
never had and produces wrong work silently.** `delivery.ts:54` documents the sibling case: *"worker B
receives an unchanged-marker for content only worker A holds."*

**2. Why it is not being fixed now.** The report's correction — stop collapsing on identity alone — costs
**+381,520 characters, +29.3% of every walk, permanently**, against a hazard **nobody has counted**. And
that figure is itself a solo-topology measurement: under the dispatch topology the definitions mandate,
collapse fires only within one worker's batch at `BATCH_MAX_ACTIVITIES = 3`, so the true cost is likely
materially lower. Paying a permanent 29.3% against an unmeasured frequency, on an inflated figure, is a
bad trade on its face. A recovery path already exists, is documented
(`force-full-after-summarization`), and costs one extra call when it fires.

**3. The load-bearing assumption, stated verbatim as it was argued.** *"My argument rests on detection
being reliable at point of use, and I cannot prove that."* The user chose measure-first over the
fail-loud variant, **so the assumption stays unproven by design.** A reader who later finds silent wrong
work should see that this was known and accepted, not overlooked.

**4. Accepted work.** Emit a history event when a worker calls `full: true` / `bundle: "full"` after
being sent a marker for that key; strengthen the marker note to name the recovery call inline; re-price
the 381,520 against REM-01's per-dispatch fixture before reconsidering. ~10 lines and one note edit.

**5. The reversal condition — operational, and a proposal.** A condition phrased as *"if it fires often"*
never fires, because nobody watches. So:

> **Trigger:** the escape-event count is read at every baseline re-record. CHG-01 made a re-record
> mandatory on any delivery move beyond 1% in either direction, so a reader already exists and is already
> scheduled. **Reverse this disposition if the escape fires on more than 2% of marker deliveries across
> the runs since the last re-record, or even once in a run that produced demonstrably wrong work.**
> **Who looks:** whoever performs the re-record, as part of it.

This is a proposal, not a settled threshold — 2% is chosen to be low enough to catch a real problem and
high enough not to trip on a single compaction.

**6. Rejected option, recorded with its reason.** **Content-hash acknowledgement** — the worker returns
the set of hashes it still holds, making the server's guess a fact. Rejected at rung 7: it grows every
request and is a large build against an uncounted hazard. **If the escape count comes back high, this is
the fix to reconsider — not the 29.3%.**

**7. Why this matters beyond REM-04.** Three findings turn on the same root: **the server infers what a
context holds from identity rather than knowing it** — REM-04, DEL-01's predicate, and REM-05's boundary
reading. Content-hash acknowledgement is the only proposal on the table that would make it a fact.

## Carried acceptance criteria — obligations on findings not yet reached

Written here rather than trusted to memory, because a disposition already taken depends on each.

- **DEL-02 must state that the full-mode SC-13 resolve loop is served from the cache.** DEL-09 was
  accepted as *subsumed by DEL-02 with zero lines now*, and that disposition is only sound if DEL-02
  actually closes it. **Sequencing risk:** if DEL-02 is skipped or reduced, **DEL-09 becomes live and
  unfixed**. The fallback is then the rung-7 option — an existence-only **mode on
  `loadResourceDelivery`, never a second function**, so "resolves" keeps one definition.
- **MEC-03 must decide whether server-emitted prose needs a check.** The `step_techniques_note` is not a
  technique file, so no guard reads it and no ladder pass covers it, yet it ships **12 times per walk**
  and is the highest-traffic prose in the system. Two defects have been found in it, **both
  incidentally** (DEL-08's impossible size-cap clause, and the budget clause that never binds in
  practice). A surface with no owner belongs in MEC-03's prose-versus-behaviour scope.
- **DEL-04 / DEL-05 must justify any per-activity opt-out on its own merits.** DEL-08 deleted
  `bundleTechniques`. If either wants that capability back, the proposal must name a concrete caller and
  say why this time differs — the construct existed with **zero users** across 21 trees.
- **RED-03 triage must reach `needs_individual_interview`** (RED-06 Part B) explicitly, and must check
  all 17 trees before any delete verdict.

## Stated non-fixes

What a mitigation does **not** close, so nobody reads more into it than it delivers.

- **REM-10.** The superproject's submodule pointer still moves by commit, so a message-only corpus
  commit will still show the submodule as modified in `git status`. The stamp fix addresses content
  coupling, not pointer identity.

## Open questions — not dispositioned

- **`create-pr`.** Whether meta `github-cli-protocol::create-pr` and work-package `update-pr::create-pr`
  are one operation in two copies or two operations. Needs the callers' intent; no mitigation proposed.
- **`mark-ready`.** Gets its own gate as a second instance of RED-02. Deciding which signature is correct
  requires reading both callers, which has not been done.

## Open verification tasks

- **MEC-04.** The `seed_profile` binding gap is certain from the signature, but the runtime behaviour
  after binding it is **untested** — this session's planning folder has no `README.md`, so
  `sync-progress-status` has never run here. Not to be read as verified.
- **CHG-03.** One ablation run per candidate against today's tree. Prerequisite, not dialogue work.

## Running scoreboard

Per `review-taxonomy.md`, over **every** accepted mitigation — not only those decided after the ladder
came into force at finding 6. An earlier version of this table counted only the ladder-era findings and
read `−33 lines`, which was flattering and wrong.

| # | Finding | Net lines | Rung |
|---|---|---|---|
| 1 | ORC-01 | ~+20 | 6 (reuses `makeDelta` / `Delta.better`) |
| 2 | CHG-01 | ~+8 code, +3 doc | 6 |
| 3 | CHG-03 | ~+5 **as revised** (was ~+30) | 1 for the script, recipe only |
| 4 | DEL-01 | ~+3 predicate, +4 prerequisite | 2 for the predicate, 6 for the prerequisite |
| 5 | REM-02 | −2 loop, ~+4 test | 2 |
| 6 | REM-03 | ~+1 | 2 |
| 7 | MEC-02 | ~+9 | 1–2, one part at 6 |
| 8 | RED-05 | 0 (same edit as MEC-02) | — |
| 9 | MEC-04 | **−4** | 1 and 2 |
| 10 | RED-02 | **−35, −1 file** | 1 |
| 11 | ORC-05 | ~+9 | 2 and 6 |
| 12 | REM-06 | ~+5 | 2 and 6 |
| 13 | REM-05 | ~+6 **as revised** | 2 |
| 14 | REM-07 | ~+3, −1 | 2 and 6 |

**`net so far: ≈ +30 lines, −1 file.`** The CHG-03 revision took ~25 lines out of the earlier ≈ +50.

My arithmetic is higher than the ~+25 estimated by the coordinator because I counted why-comment lines
and documentation edits, which the ladder's comment-proportionality rule treats as in scope. The sign is
what matters: the dialogue is so far **net additive**, and any end-of-run lean review should start from
that, not from the reductions alone.

Per `honesty-boundary.md`: no per-repo savings figure is claimed. The only genuine per-repo count is the
recorded deliberate simplifications in this file; any savings medians cited are published benchmark
medians, never this repo's measurement.

## Retrospective ladder verdicts on our own mitigations

Applied to the four accepted before the ladder came into force. The user's decisions stand; these are the
verdicts an end-of-run lean review will ask for.

- **ORC-01 — justified at rung 6.** The comparison it adds does not exist, and it reuses the `makeDelta`
  helper and the `Delta.better` field already serving thirteen other metrics. Irreducible.
- **CHG-01 — justified at rung 6.** A lower bound is one comparison and nothing in-repo provided it. The
  two documentation edits are required for honesty: the procedure at `docs/development.md:231` fires only
  on growth, so leaving it would document a one-sided gate as if it were symmetric.
- **DEL-01 — justified.** The three-line predicate change is effectively rung 2: it copies an expression
  that already exists verbatim at `workflow-tools.ts:877`. The block-hash prerequisite is a genuine
  behavioural change at rung 6.
- **CHG-03 — NOT justified at rung 7. The `bench:ablate` wrapper does not need to exist.** Verified in the
  code: `--reference=<path>` resolves an arbitrary path (`run-token-benchmark.ts:387`) and is read with a
  plain `JSON.parse(readFileSync(...))` at line 545, and the full metrics object is written to stdout as
  JSON at line 564. So one ablation is already two existing commands:

  ```
  npm run bench:token -- --label=cand-x --context-mode=fresh --no-compare > scripts/fixtures/ablations/cand-x.json
  npm run bench:token -- --label=check  --context-mode=fresh --reference=scripts/fixtures/ablations/cand-x.json
  ```

  CHG-03's own justification said the benchmark already emits the right shape and `--reference` already
  accepts any recorded run — a rung-2 argument used to license a rung-7 change. The directory is a
  directory (zero lines) and the citation rule is a convention (zero lines); only a short documented
  recipe is needed. **Correction adopted:** the wrapper is dropped, the directory and convention stay, and
  ~5 lines of recipe go in `docs/development.md`. Put to the user as a decision, since it modifies a
  mitigation already accepted, and taken by them.

**Standing practice from this.** The ladder is applied retrospectively as the dialogue continues. Where a
later finding's mitigation subsumes or obsoletes one already accepted, it is raised at that finding's gate
and put to the user as a revision. An accepted mitigation is never silently altered, and one now believed
wrong is never left unsaid.

## Owed by this activity

`accepted_mitigations` and `accepted_count` are written by an `action: set` the server does not apply,
and `accepted_count` has no producer in this activity at all. Both are reported in `variables_changed`
on the `activity_complete` envelope, or the `confirm-apply` gate offers to apply zero mitigations after
fifty-three decisions. This is REM-03's own defect, observed in the activity that found it.
