# Evaluation Report: workflow-server `meta` and `work-package` workflows

## Executive Summary

This report enumerates the remaining opportunities to make the `meta` and `work-package` workflows faster and cheaper to run, measured against the build as it stands after the optimisation work merged on 17 and 18 August 2026. Both halves of the original complaint are in scope: what a run costs in tokens, and how long it takes.

### The measured starting position

- One recorded 12-activity walk delivers **1,302,319 characters over 242 tool calls**, reproduced to the character on every re-run.
- That walk costs the server **9,325 ms**. A model turn on this workload costs **13.1 s**. A worker spawn costs **87 s**.
- The definition corpus is 909 KB: `meta` at 5 activities and 23 technique steps, `work-package` at 15 activities and 176 technique steps.
- Delivery trajectory: 1,355,532 characters in July, 1,780,292 before the recent work, 1,302,319 now — a fall of 477,973, or 26.85%.
- Over the same window the call count fell from 246 to 242: **four round trips of 246, 1.6%**.

### Findings by dimension and severity

| Dimension | Critical | High | Medium | Low | Total |
|-----------|----------|------|--------|-----|-------|
| Remediation Effect | 1 | 3 | 5 | 1 | 10 |
| Delivery Economy | 0 | 2 | 5 | 2 | 9 |
| Orchestration Topology and Critical Path | 1 | 3 | 4 | 1 | 9 |
| Mechanisation Potential | 0 | 4 | 4 | 0 | 8 |
| Redundant Work | 0 | 2 | 5 | 2 | 9 |
| Change Economics | 0 | 3 | 4 | 1 | 8 |
| **Total** | **2** | **17** | **27** | **7** | **53** |

## Overall Assessment

### Verdict

The recent optimisation work is real and correctly measured. It removed 477,973 characters from a recorded walk, in a single server commit, and the result reproduces to the character. It also removed four round trips of 246, and round trips are what set the run's wall-clock. The two halves of the complaint have different drivers, and only one of them has been addressed.

- **Roughly 410,000 characters — 31.5% of the walk — remain available from machinery that is already built, tested and switched off.** The change is three lines.
- **146 of the walk's 242 round trips are removable**, most of them by widening two tool parameters to accept a list. At 13.1 s a turn, that is the largest wall-clock item anyone can act on.
- **73% of the server's own time per walk re-parses a corpus pinned for the life of the session.** No instrument in the repository reports it.
- The two definition changes in the recent work were net cost-positive by 6,180 characters. They bought correctness, and they were priced at merge.

### Where the risk sits

The risk is not in any single opportunity. It is that the number ordering the programme is taken under conditions the system does not run in, and the programme has been fitted to that number for long enough that correcting an estimate now reads as a regression.

- The flagship saving of the recent work is worth 381,520 characters under the recorded walk's agent topology and **zero** under the topology the definitions specify.
- The cost gate is one-sided. It fails on growth beyond 1% and never fires on a saving, so a large improvement that lands without re-recording the baseline leaves an equivalent margin of silent regrowth behind it. That failure has already happened once: delivery rose 31.3% in 32 days with a working benchmark sitting unconsulted.
- Honouring the retention signal the definitions already transmit costs **+381,520 characters, +29.3%**, against a gate that fails at 1%. The correct fix is currently unmergeable under the programme's own ratchet.

## The Core Finding

Every number that orders this programme comes from one deterministic walk, and that walk is the single configuration in which every estimate the delivery layer makes happens to be exact.

### The walk's agent topology is not the run's

The recorded walk runs one agent identity across all twelve activities and passes no delivery-mode parameter. The definitions mint an identity per dispatch and tell a fresh worker to omit that parameter because it holds nothing. Under the walk's topology the server's liveness check is an exact oracle, the variable bag never changes mid-activity because no technique executes, and the batch bound is exempt by name. Run the same walk under the topology the definitions specify and `get_activity` goes from 12 calls and 520,075 characters to 22 calls and 1,177,328, the worker bundle from 65,253 characters to 446,773, and all three estimates degrade at once. **The programme's largest recorded win is a property of the meter.**

### The walk's unit is not the run's cost

The 242-call walk costs the server 9,325 ms. A recorded real run issued 352 calls over 156.7 minutes — 26.7 seconds of wall-clock per call. One worker spawn at 87 s is **9.4 times the entire server-side cost of the whole walk**. The gate compares delivered characters and nothing else. The call count sits in the same fixture, is printed in the scorecard four lines above the verdict, and plays no part in the decision. **A change that removes 146 round trips and no bytes registers as 0%.**

### The walk's subject is half the corpus

The gate walks `work-package` only, and the continuous-integration invocation passes no workflow argument. The `meta` tree — 5 activities, 291 KB, and the dispatch loop every client run passes through — is measured by nothing. It holds **75.9% of the remaining block repetition** and six of the eleven surviving mechanisation candidates. Its own benchmark arm does not complete.

### What the walk cannot see does not get built

Attributability and realism trade against each other, and this repository has bought attributability outright. All 28 guards are file readers. All four benchmarks price delivery. The one instrument that measures human wall-clock runs in no job and no registry. So the walk takes one path, one iteration per loop, zero seconds of human deliberation, no failures and no retries — against a census in which **65 of 83 recorded sessions, 78.3%, never reached a terminal activity**. The programme reliably finds byte-shaped costs on the single completed path, and cannot represent the quantity that most of its remaining candidates change.

### Testable prediction

Give the resource and technique delivery tools the refer-back predicate the activity tool already has, then re-run the gate. It will report delivery down roughly 31%, with resource calls unchanged at 162, checkpoint triples at 10, and total tool calls at 242. It will PASS, and nothing will require the baseline to be re-recorded. A real run's wall-clock will not move. If the run instead gets measurably faster, the round-trip account in this report is wrong.

## Per-Dimension Findings

### Remediation Effect

What the recent work changed, what it measurably bought, and what it introduced.

| ID | Severity | Title |
|----|----------|-------|
| REM-01 | CRITICAL | The recorded walk is the one topology in which every delivery estimate is exact |
| REM-02 | HIGH | The gate-answering predicate withholds on absences the same module knows how to answer |
| REM-03 | HIGH | An action's write never reaches the server bag, so delivery answers "no" for a gate the run answers "yes" |
| REM-04 | HIGH | The worker bundle collapses on identity alone, and the correction reads as a 29.3% regression |
| REM-05 | MEDIUM | The boundary-accurate batch reading has no caller, and the definitions assert the stale reading is correct |
| REM-06 | MEDIUM | The three gate-decision counters reach a log line and nothing else |
| REM-07 | MEDIUM | The new ordering guard scans one activity's top-level steps, and its largest exemption re-admits the class it closed |
| REM-08 | MEDIUM | Version drift is detected, seeded and re-stamped without a signal, and only at session open |
| REM-09 | MEDIUM | A safety-floor gate reads a path nothing can ever answer |
| REM-10 | LOW | The corpus stamp compares commit identifiers where the guarantee is a property of trees |

**REM-01 — The recorded walk is the one topology in which every delivery estimate is exact** (CRITICAL)
The whole 26.85% fall is one server commit, `ab810342`, at −484,153 characters. Three quarters of it is the worker bundle no longer re-shipping per activity, measured at 65,253 characters against 446,773. Under one agent identity per dispatch — what the definitions mandate — every dispatch is a new context taking full delivery, and that saving is zero. No instrument in the repository runs in the second topology, so nothing in the build can report the difference.

**REM-02 — The gate-answering predicate withholds on absences the same module knows how to answer** (HIGH)
The server declines to answer any gate whose compared variable is absent, including the negated forms that absence answers — which is how the corpus spells "not in that mode". The module exports the helper that draws the distinction, and that helper has zero callers in the server. Replacing five lines with one call to it was applied, measured and reverted: bundled steps rose 66 to 78, technique fetches fell 24 to 12, delivery fell 18,608 characters, and total calls fell 242 to 230. All 16 of the module's own tests pass unchanged. One repository-level test asserting that a continuation always delivers less turns red without a defect being introduced.

**REM-04 — The worker bundle collapses on identity alone** (HIGH)
The collapse now fires for any identity the server has met, in every delivery mode. A worker whose context was compacted while live keeps its identity and receives short markers for bytes it no longer holds. The definitions already compute and transmit the fact the server is guessing at, but they bind it true for any continuation of a live worker, so honouring it does not close the hazard — and measured on the gated walk it costs +381,520 characters against a gate that fails at 1%.

**Where the evidence is contested.** Four claims in this dimension were settled by re-measurement rather than by agreement, and the reader should know which.

- **The recoverable gated-step population.** One reading put 34 of 91 gated `work-package` technique steps as permanently undecidable and 57 as recoverable. Re-measurement against the server's own producer index returns the reverse: **57 undecidable, 34 recoverable**. The corrected figure is used throughout, and it inverts the value of relaying worker writes back to the server — worth one additional bundled step on the recorded path, not fifty-seven, and that one step is the correctness defect REM-03 names.
- **Whether round trips can fall from the server side alone.** Asserted impossible, then falsified by execution: twelve round trips came out of one line with no definition change.
- **The class of REM-04.** Rated a ten-line fix on the ground that the definitions already transmit the missing fact. Settled as structural, because the flag they transmit does not report the fact the estimate is wrong about.
- **The position-aware veto.** The server discards a step ordinal its producer index already computes, and rated as worth the whole 57-step population. Measured, restoring it lifts **7 of 57** vetoes in `work-package` and 1 of 11 in `meta`. The other 50 are the correct consequence of delivery taking one reading of the bag before any step of the activity has run.

One earlier finding is withdrawn: a local guard-sweep failure did not reproduce, and all 28 guards pass. One is added: the test suite fails at HEAD, 1 of 1,049, on the corpus-stamp assertion of REM-10.

**Most important insight:** Of the prior report's 52 findings, 6 are closed, 15 are partly addressed and 31 are untouched — a disposition three independent measurements agree on, with nothing wrongly closed. The work that landed was almost entirely server-side and almost entirely byte-shaped, and it left the round-trip count flat while reporting the largest single improvement in the system's recorded history.

### Delivery Economy

The bytes still shipped into agent contexts per run, and the abstraction that would collapse each remaining duplication.

| ID | Severity | Title |
|----|----------|-------|
| DEL-01 | HIGH | Two of the three delivery channels cannot refer back to their own context |
| DEL-02 | HIGH | Three quarters of the server's time per walk re-parses a corpus pinned for the session |
| DEL-03 | MEDIUM | A section's ledger entry can never resolve against the file that contains it |
| DEL-04 | MEDIUM | A composed technique is keyed on the technique and hashed on the step binding |
| DEL-05 | MEDIUM | Set-valued blocks are keyed as scalars, so one added entry re-ships the whole block |
| DEL-06 | MEDIUM | The workflow bundle is 108,356 characters at session open, unscoped and ungated |
| DEL-07 | MEDIUM | Five of the twenty activities in scope hold three quarters of the remaining repetition and are on no instrument |
| DEL-08 | LOW | Three eager-delivery bounds no corpus can reach, and a schema knob zero activities use |
| DEL-09 | LOW | In full mode the delivery path loads every resource body it declines to deliver |

**DEL-01 — Two of the three delivery channels cannot refer back to their own context** (HIGH)
The activity tool asks whether the server has met this context and collapses what it already sent. The resource and technique tools ask a narrower question that is false on every worker in the production topology, so their ledger is written on every call and read on none: 265 recorded entries, zero collapses. Those two tools carry **186 of the walk's 242 calls and 673,888 of its characters**. Switching the session's declared mode and changing nothing else measures the difference at **410,880 characters, 31.5% of the walk** — the resource channel falls 436,092 and the technique channel 78,597, against 103,809 of growth in the activity response. The narrowest form of the change is three lines. It is 28 times the gate's 1% trip point, and it is the only entry in this dimension that shortens both the byte bill and the context bill: one worker's accumulated delivery falls from 1,192,302 to 826,404, taking a 12-activity walk from six worker contexts to four. Record block hashes on the technique tool in every mode first, or the saving holds only on a solo walk and not on a resumed worker.

**DEL-02 — Three quarters of the server's time per walk re-parses a corpus pinned for the session** (HIGH)
There is no cache anywhere in the loaders. One walk performs 216 workflow loads for 2 distinct workflows, 5,602 technique loads for 136 distinct files, and 257 resource reads for 30 distinct files — **27.4 MB of YAML re-parsed**. Reading a resource costs 0.12 ms of a 31.2 ms call. The other 99.6% re-parses a workflow definition the response does not contain. Memoising on the corpus revision saves roughly **6,480 ms of the 8,828 ms** a walk spends inside tool handlers and zero characters, which is why no instrument reports it. The one number that would price it, per-call duration, is already in every audit-log line and is never summed.

**Most important insight:** The remaining duplication is not in the corpus. Zero technique files restate an inherited contract. The repetition is synthesised at composition and then re-delivered per response, and every ledger entry names a composition output rather than a composition input. Five characters of step-bound annotation invalidate four deliveries of a 7,600-character technique. One entry added to a group contract invalidates that block for every technique in the group. The codebase already contains the fix in miniature, applied to exactly one field.

### Orchestration Topology and Critical Path

How the run is distributed across agents, turns and round trips, and what sets its wall-clock.

| ID | Severity | Title |
|----|----------|-------|
| ORC-01 | CRITICAL | The cost gate is denominated in characters, so no round-trip saving can be defended |
| ORC-02 | HIGH | 153 of 162 resource fetches are one wave serialised by document order |
| ORC-03 | HIGH | The review wait holds a worker, a batch identity and a session-wide lock |
| ORC-04 | HIGH | A gate costs four server calls and six agent boundaries; review mode resolves fifteen of them by timer, at 435 seconds of sleep |
| ORC-05 | MEDIUM | Neither batch setting can be varied by the instruments meant to price them |
| ORC-06 | MEDIUM | The documented batch calibration is computed on 43.6% of what the bound charges, and it inverts |
| ORC-07 | MEDIUM | Eight of eleven activity boundaries carry no routing decision |
| ORC-08 | MEDIUM | Four fifths of adjacent step pairs have no declared data edge, and the schema cannot say so |
| ORC-09 | LOW | The workflow that drives every run has no cost instrument that completes |

**ORC-01 — The cost gate is denominated in characters** (CRITICAL)
The gate compares one quantity against the fixture. Call counts are computed, printed and never compared. So a change that removes 146 round trips and no bytes registers as 0% and is invisible, while a change that adds 1.1% to delivery in order to remove fifty round trips fails. Every rule in the delivery contract is denominated the same way. This is the structural reason the expensive half of the complaint has moved 26.8% and the slow half has not moved at all.

**ORC-02 — 153 of 162 resource fetches are one wave serialised by document order** (HIGH)
Every identifier in that group is known the instant the activity payload lands, and no fetch's result changes what the next fetch asks for. Collapsed into contiguous bursts the 162 calls are 16 waves. What forces the serialisation is prose written when the cost being managed was bytes, not a data dependency. Widening the two delivery tools to accept a list of identifiers takes the walk from **242 round trips to 96**, at zero byte change. The handlers already loop over a resolved list for eager bundling.

**ORC-03 — The review wait holds a worker, a batch identity and a session-wide lock** (HIGH)
An unbounded loop polls a human for the duration of a real pull-request review. Its body is one empty action step and one checkpoint. Three things are held for that whole period: the worker's context, the batch identity, and the session's single checkpoint slot — which five delivery tools check with no agent component, making it a session-wide mutex rather than a per-context one. While one gate is open, no context anywhere in the session can read anything. This is also why running independent work concurrently cannot be bought by spawning parallel workers: the first to reach a gate freezes the rest.

**Most important insight:** Supervision is purchased with round trips, and this workload's exchange rate is lopsided — 13.1 seconds of wall-clock per round trip against a server that composes the payload in 52 milliseconds. Each of the four guarantees the current topology buys, the batch bound, the step manifest, the checkpoint slot and the delivery ledger, could be re-established at a coarser grain for a fraction of that. Coarser supervision at the same coverage is the whole design space.

### Mechanisation Potential

Protocol steps in the agent-executed prose that a script, a server tool, a schema construct or a deletion could take over.

| ID | Severity | Title |
|----|----------|-------|
| MEC-01 | HIGH | The server names the algorithm that produces its own required argument and cannot run it |
| MEC-02 | HIGH | The link guard reports a clean pass having inspected 40% of the links, and accepts any directory as a root |
| MEC-03 | HIGH | No guard reads workflow prose for script invocations, so every drift in the restatement layer is undetectable |
| MEC-04 | HIGH | The progress hook declares an artifact input and branches on it, and none of its five call sites can bind it |
| MEC-05 | MEDIUM | The surviving mechanisation programme measures 123 characters under the gate's own threshold |
| MEC-06 | MEDIUM | Twenty-three deterministic preconditions sit outside every survey and every guard |
| MEC-07 | MEDIUM | Ten guards are absent from the only workflow that runs guards, and three of fifteen restatements have drifted |
| MEC-08 | MEDIUM | Two guards speak the machine-readable finding protocol and the registry says they do not |

**MEC-01 — The server names the algorithm that produces its own required argument and cannot run it** (HIGH)
The session-opening tool's own description states the coordinate it requires, names the exact procedure that computes it, gives the precedence rule and says where the answer is stored — in a process that contains no subprocess call anywhere in its 55 files and 12,628 lines. The procedure is 8,226 bytes of agent-executed prose across six definitions, it runs at least twice per engagement, and its output feeds a blocking gate eight lines later. Every part of it is a total function except one tier of one component.

**MEC-02 — The link guard reports a clean pass having inspected 40% of the links** (HIGH)
The guard skips every link without an anchor, never asserts that it scanned anything, and accepts any directory as a root — pointed at an unrelated scratch directory it walks in and reports on whatever it finds. Across the two trees there are 358 anchored links and 543 unanchored ones, so **60.3% of relative links are validated by nothing**. Renaming a file that only anchor-free links reach fails zero of 28 guards. Three edits close it, and it is the cheapest correctness win in the set.

**MEC-03 — No guard reads workflow prose for script invocations** (HIGH)
Fifteen guards are named in workflow prose that restates, by hand, what the guard registry already states canonically. Three of the fifteen restatements have already drifted from the registry line they copy, one workflow states an argument contract both named scripts contradict, and four guards omit from their own usage line a flag they implement. Nothing compares any of these pairs, so the whole class is undetectable by construction.

**Most important insight:** Nine of the twelve prior mechanisation candidates survive a strict judgement-call filter, and the conclusion that they are "below the instrument's resolution" is wrong. The instrument resolves one character in 1.3 million and three consecutive walks agreed exactly. What they are below is a one-sided 1% dead-band set by a flag, overridable per invocation. Every one of them is measurable, attributable to a single commit and reportable — and six of the eleven are resident in the half of the corpus no instrument walks, where the correct statement is not that the saving is small but that nothing measures the surface it is on.

### Redundant Work

Steps, artifacts and verification that produce nothing the run consumes, and what keeps the surplus invisible.

| ID | Severity | Title |
|----|----------|-------|
| RED-01 | HIGH | Verification is scoped by binding, and 38% of the shared library is outside it |
| RED-02 | HIGH | Two live copies of one operation now differ in declared inputs, output shape and version, and both resolve |
| RED-03 | MEDIUM | Thirty-two technique files no delivery path reaches, and deadness tracks citation style |
| RED-04 | MEDIUM | Two suppression files, 177 entries, one verdict, no expiry, and the staleness signal never reaches CI |
| RED-05 | MEDIUM | 540 anchor-free relative links are proved by nothing, and 129 of them cross a tree boundary |
| RED-06 | MEDIUM | Three gates that cannot move and two transition edges that cannot be taken |
| RED-07 | MEDIUM | The pattern exemplars are outside every schema check, and one linked resource cannot be fetched |
| RED-08 | LOW | Two parallel drawings of the step graph with a disjoint vocabulary, already four edges wrong |
| RED-09 | LOW | A definition file's version moves on 35% to 58% of the commits that change its body |

**RED-01 — Verification is scoped by binding, and binding only decays** (HIGH)
Every guard defines its scan set from something a run reaches — a step binding, a link that carries an anchor, a file in a non-recursive directory read. Of 233 operation files, **145 are inside binding resolution and 88 are not**: 14 reached only by a list of string literals in the server repository, 10 reached only from exemplar activities no workflow borrows, 40 reached only by a prose link, and 24 reached by nothing at all. Adding a file adds nothing to the guarded set until something binds it. Removing the last binding removes a file from the guarded set immediately and produces no finding, so the unverified fraction is monotonically non-decreasing under neglect. An invalid step kind injected into an exemplar activity passes all 28 guards.

**Most important insight:** Deadness in this corpus is caused by inlining, not by obsolescence. The issue-creation sequence, the knowledge-base search and the submodule-path predicate are all live capabilities whose operation definitions are unreachable because one consumer restated the calls in prose instead of applying the operations. The same file's other branch, written as an operation reference, keeps 19 of 21 sibling operations alive. The fix is a citation, not a deletion.

### Change Economics

What each remaining opportunity costs to build, what it risks, and the order they should be taken in.

| ID | Severity | Title |
|----|----------|-------|
| CHG-01 | HIGH | The gate is a one-sided ratchet that never re-records on an improvement |
| CHG-02 | HIGH | Characters price the bill and not the clock, and the instrument that prices the clock runs nowhere |
| CHG-03 | HIGH | Prior prices cannot be carried forward, and the two largest remaining targets are absent from the prior list |
| CHG-04 | MEDIUM | The surface taxonomy does not predict cost; delivery movement does |
| CHG-05 | MEDIUM | Saved-session safety rests on a version bump that fires on 15% of the commits that need it |
| CHG-06 | MEDIUM | The batch bound is free to turn and not free to justify, and both dials must move to buy three dispatches |
| CHG-07 | MEDIUM | A definition pull request gets 28 guards and no cost gate |
| CHG-08 | LOW | Session state grows with no bound and no eviction, and every ledger improvement enlarges it |

**CHG-01 — The gate is a one-sided ratchet** (HIGH)
The gate reduces to a comparison that fails on growth beyond 1% and passes any improvement of any magnitude. Nothing re-records the fixture on an improvement, and no test asserts that the fixture matches a fresh run. So if the delivery changes in this report land and save 300,000 characters without a re-record, the gate thereafter permits **23% of silent regrowth** before it says a word — each increment individually defensible and far under the trip point. This produces no symptom at any stage: the scorecard prints a negative delta the whole way, which reads as "still better than baseline" and is true and useless. It is the failure this gate was built to prevent, reintroduced by success.

**CHG-02 — Characters price the bill and not the clock** (HIGH)
Delivered characters convert directly to billed input tokens, so the byte count is a good proxy for money. It is not a proxy for time. On a recorded real run, 59% of the span was worker model time, 3% human wait and 38% orchestrator handoff with nothing executing. Delivery into those contexts was about 60,000 tokens, at most 6.6% of the span. The largest single wall-clock event anywhere in the repository's records is a 196.8-minute mid-run stall that no byte count sees. The repository owns a wall-clock instrument. It is in no job, no guard registry and no test.

**CHG-03 — Prior prices cannot be carried forward** (HIGH)
Every percentage in the prior report is against a 1,780,292-character walk, and today's walk is 1,302,319. Each saving's share has grown and the ordering has shifted. Several remaining items were priced against machinery that has since been switched on, so their residual value is an upper bound of unknown tightness. Two items are now worth more than priced and appear nowhere in the prior short-term list: the resource channel at 527,683 characters over 162 calls, up 17.8% since July and moved zero by the recent work, and the workflow bundle at 108,356 characters in one response, up 82.2% since July and moved 76 characters. **Together they are 48.8% of today's delivery.** One ablation run per candidate costs about ten seconds and replaces every inherited estimate with a measured one.

**Most important insight:** The cost model the programme sequences on is wrong in a way that changes the answer. A definition-only landing costs five files and roughly thirty lines in the superproject, always the same five, three of them machine-regenerated — measured twice, identically. A server change that moves delivery pays the same ceremony. So the expensive category is neither "definition" nor "server". It is **anything that moves the delivered payload**, and it spans both trees. Batch by delivery impact, and let everything that does not move the walk land freely.

## Cross-Cutting Patterns

**A capability lands on one side of a boundary and the other side never arrives**
- **Affected dimensions:** all six.
- **Evidence:** the boundary-accurate batch reading is computed and read by nothing, and the parameter that populates it is passed by no call site; the helper that would widen the gate predicate is exported with zero callers in the server; the liveness check the resource tools would need is imported by those tools and used only for bookkeeping; a declared hook input has no binder; a schema knob for per-activity bundling has zero users across 21 workflow trees; and 5,374 lines of guard code are reachable only as a repository CI step.

**An absence and an acceptance produce the same signal**
- **Affected dimensions:** Remediation Effect, Mechanisation Potential, Redundant Work, Change Economics.
- **Evidence:** 70 of 70 suppression verdicts are "harmless", with zero classified as debt and zero as live defects; the link guard prints a pass having skipped 543 links; the ordering guard reports OK while never entering a loop body; the gate predicate returns the same answer for "unknowable" and "not relayed"; a missing batch block is indistinguishable from a terminal activity; and a decision taken by a 30-second timer is recorded exactly as a human selection.

**Verification is scoped by binding, and binding only decays**
- **Affected dimensions:** Redundant Work, Mechanisation Potential, Change Economics.
- **Evidence:** 88 of 233 operation files sit outside binding resolution; 272 link targets are bound by nothing and linked without an anchor; five exemplar activity files are validated by no schema check; the guarded set shrinks silently whenever a reference is deleted, renamed or softened into prose, and grows only by deliberate act.

**The dials, thresholds and calibrations were all set against the eager floor**
- **Affected dimensions:** Orchestration Topology, Change Economics, Delivery Economy.
- **Evidence:** the documented calibration says the activity cap binds first, that roughly seven activities fit the budget, and that the crossover sits near 114,000 declared tokens. All three are computed on the 43.6% of charged delivery that arrives inside the activity response. Re-measured with the lazy 56.4% included, the answers are three activities and 195,405 tokens, and the two limits bind within 2.3% of each other. Neither setting can be varied through the test harness, so no benchmark in the repository has ever exercised them.

**A quarter of the number the gate defends is a property of the harness**
- **Affected dimensions:** Delivery Economy, Change Economics, Orchestration Topology.
- **Evidence:** a hardcoded seven-identifier probe re-fetches the same resources on every activity, accounting for **349,162 of 1,302,319 characters, 26.8% of the gated total**. One file alone is 19.6% of the walk over twelve fetches. The gate therefore resolves changes to two files twelve times more sharply than changes to the other 337, in both directions. One of the seven identifiers names a heading that no longer exists, billing twelve failed round trips per gated run into the total it defends.

## Corrections and Recommendations

### Immediate

- **Give the resource and technique delivery tools the refer-back predicate the activity tool already has.** Three lines, 410,880 characters, 31.5% of the walk, and one worker context taking three activities instead of two. Record block hashes on the technique tool in every mode first, or the saving holds only on a solo walk.
- **Replace the value-path loop in the gate predicate with the module's own unbound-positive-read helper.** One line, measured: 12 fewer round trips and 18,608 fewer characters. Correct the repository test that asserts a continuation always delivers less.
- **Add the call count and the checkpoint-triple count to the gated set, and add a lower bound to the gate** so a landing that improves delivery by more than 1% without re-recording the baseline fails. Roughly twenty lines, and both quantities are already in the fixture.
- **Fix the probe identifier that names no heading, and re-record the fixture.** Twelve failing round trips per gated run, currently baked into the baseline.
- **Compare corpus trees rather than commit identifiers** in the stamp test and the benchmark's corpus note. Ten lines, and it removes a permanently red test and a class of re-records that buy nothing.
- **Wire the two batch settings through the test harness.** Four lines. Nothing about either dial is measurable until it lands.
- **Run one ablation per remaining candidate against today's tree.** About two minutes of machine time, and it replaces every inherited estimate.

### Short-term

- **Widen the two delivery tools to accept a list of identifiers.** 162 resource calls become 12 and 24 technique calls become at most 12 — 146 of 242 round trips, at 13.1 s a turn.
- **Bind the worker identity and declared window into the two places the definitions advance an activity**, and change the two rules that read the stale open-time reading. No server change is needed, and it completes work already paid for. Relay the worker's variable map in the same edit — it buys one bundled step and one correct gate answer, not the fifty-seven it was credited with.
- **Memoise the corpus on its revision.** About 60 lines, roughly 6,480 ms of 8,828 ms, and zero characters. The guard scripts walk the corpus deliberately and must bypass it.
- **Give the benchmark a second arm over `meta`.** It holds three quarters of the remaining block repetition and six of eleven surviving mechanisation candidates, and its own arm does not currently complete.
- **Split the review wait out of the submission activity.** The whole human-review latency comes off worker lifetime and off the session-wide checkpoint lock.
- **Make the link guard require a root, assert a scanned count, and stop skipping unanchored links.** Three edits, and 543 links become checkable for the first time.
- **Batch every definition-only edit into one landing.** The ceremony is five files and thirty lines per landing, fixed, and three of the five regenerate from a command.

### Structural

- **Key the delivery ledger by content extent rather than by identifier string**, so a section is a sub-range of a file already delivered, and key set-valued blocks per entry rather than whole. Measure the sealed-session growth first: 265 entries becomes low thousands.
- **Split a composed technique into an invariant core and a step-bound delta**, keyed separately. The codebase already does exactly this for one field, for exactly this reason.
- **Build a second instrument that runs under one agent identity per dispatch.** Until one exists, correcting an over-optimistic estimate registers as a pure regression, and the largest recorded win cannot be distinguished from an artefact of the meter.
- **Give every suppression an expiry that fails rather than warns.** The repository already holds the counter-design in the corpus-stamp snapshot, which fails on mismatch. The difference between the two files is a policy choice.
- **Replace the version-bump trigger for saved-session seeding with a content fingerprint** over the declared variable names and defaults. Fourteen of 32 commits to the manifest that matters left the version where it was.
- **Re-decide the two batch dials last, and only against real-run refusal counts and usage rows.** Both must move to buy three dispatches, and both raised is precisely the combination the activity cap was introduced to prevent — one worker holding 160,000 tokens of definition text before it reads a line of code.
