---
Subject: Speed and cost of running the workflow-server meta and work-package workflows
Evaluation Date: 2026-08-17
Target: /home/mike1/projects/dev/workflow-server
---

# Evaluation Report: workflow-server meta and work-package workflows

## Executive Summary

This report enumerates every opportunity found to make the meta and work-package workflows faster and cheaper to run, and prices each one against what it saves and what it costs to build. The leading question was mechanisation — agent-executed prose that is really a deterministic procedure — and the answer is that mechanisation is the smaller half of the available saving.

### What was measured

| Item | Figure |
|---|---|
| meta definition tree | 5 activities, 150 technique files, 7 resources, 290 KB |
| work-package definition tree | 15 activities, 112 technique files, 37 resources, 617 KB |
| Implementation surface | 12,343 LOC TypeScript, 18 registered tools, 44 scripts, 26 guards |
| Delivery cost of one 12-activity walk, today | 1,780,292 characters |
| The same walk 32 days earlier | 1,355,532 characters |
| Provably redundant share of that delivery | ~480,793 characters, ~35% |
| Findings in this report | 52 |

The server registers 18 tools, not the 16 the project's own documents state. Every one of the 18 is session control-plane, so no tool on the server performs a domain computation of any kind.

### Supporting analysis

Detailed evidence, measurement provenance and per-item working sit in the analysis artifacts alongside this report. Findings below cite them rather than reproducing them.

- [Evaluation plan](01-evaluation-plan.md)
- Mechanisation Potential: [report](mechanisation-potential/REPORT.md), [findings](mechanisation-potential/DEFINITIVE-FINDINGS.md)
- Context Economy: [delivery cost](dimensions/portfolio-optimize.md), [composition structure](dimensions/portfolio-sdl-abstraction.md)
- Orchestration Topology: [alternative topologies](dimensions/portfolio-architect.md), [ordering defects](dimensions/portfolio-sdl-coupling.md)
- Redundant Work: [dead surface](dimensions/portfolio-reachability.md), [decay rates](dimensions/portfolio-degradation.md)
- Change Economics: [assumption pricing](dimensions/portfolio-claim.md), [surface pricing](dimensions/portfolio-scarcity.md)
- Cross-dimension relation: [synthesis](dimensions/portfolio-synthesis.md)

| Dimension | High | Medium | Low | Total |
|-----------|------|--------|-----|-------|
| Mechanisation Potential | 3 | 6 | 3 | 12 |
| Context Economy | 2 | 5 | 2 | 9 |
| Orchestration Topology | 3 | 6 | 2 | 11 |
| Redundant Work | 3 | 5 | 2 | 10 |
| Change Economics | 4 | 5 | 1 | 10 |
| **Total** | **15** | **27** | **10** | **52** |

No finding is critical. Nothing found undermines the workflows' core purpose; every finding is cost, correctness at the margin, or a guarantee that is documented and does not hold.

## Overall Assessment

### Verdict

Both workflows work, and both are more expensive to run than their content requires. The saving is real, measured, and mostly not where the brief expected it:

- Roughly 35% of one walk's definition delivery is provably redundant — the same bytes, to the same context, inside one response or one batch. None of it requires touching the 262 technique files that carry it.
- The four largest delivery savings are server-side changes of roughly 340 lines of code between them, with no definition migration and no correctness risk.
- Delivery cost rose 31.3% in 32 days. A gate that would have caught this exists, fails when run, and no continuous-integration job invokes it.
- The twelve mechanisation candidates are genuine, and eleven of them save less than the only instrument that could measure them can resolve.
- One free lever exists and nobody has re-measured it: the batch bound is an environment variable pair, and moving it takes a 15-activity run from at least five worker contexts to two.

### Where the risk sits

The largest risk in this programme is not that a change fails. It is that a definition edit lands and is silently inert for the sessions already running.

Default values are seeded only when a session is created. The resume path checks four kinds of drift and never compares the workflow version. So a resumed session runs today's protocol against a bag written under last week's definitions, while its file records a version that no longer describes what it is executing. Six of the twelve mechanisation remedies carry that exposure. The success signal and the failure signal are the same value, so nothing reports it.

The second risk is measurement. The delivery-cost benchmark resolves changes of 13,555 characters or more. The largest single mechanisation candidate is a 5,443-byte file. Deleting the entire text of all ten candidate techniques would register at 2.40% of a walk. An optimisation programme whose instruments cannot distinguish success from noise reads flatness as safety.

## The Core Finding

**Almost every saving found here has its machinery already built, tested, and shipped — and not connected to anything.**

This is not one omission repeated. It is the same shape in six independent places, and it explains more findings than any other observation in the report.

### The server holds the decision and declines to make it

The server holds the full variable bag. It also ships two working condition evaluators. Nothing under `src/tools/` imports either one; their only callers are tests, a harness and two guards. So the delivery layer treats every gated step as undecidable and refuses to bundle it — 89 of work-package's 174 technique steps and 12 of meta's 23, permanently lazy, 189.8 KB fetched over 69 separate round trips. Of the gated steps, 44 in work-package and 6 in meta are decidable the moment the activity opens, because their gates turn on mode variables bound in the first activity and never changed again.

**The evaluator, the variable bag and the delivery path are in one process, and they have never been introduced.**

### The collapse machinery is switched off by the definitions

Every byte-saving path in the delivery layer sits behind one session-scoped boolean. That boolean answers two independent questions at once: has this content already reached this context, and does this content already appear in the response now being assembled. The second question needs no ledger — the earlier copy is fifty lines up in the same payload — and it is safe unconditionally.

The definitions then close the only other door. Three technique files instruct the orchestrator not to enable reference delivery on worker-dispatched sessions. The frozen reference walk confirms the result: zero ledger keys, zero collapses, 1,355,532 characters delivered with the deduplication machinery having fired not once.

**The result is 100,123 characters of byte-identical repetition inside single responses — 30.1% of the eager bundle, and 48.5% of the worst activity's.**

### The instruments exist and are not wired

Four measurement tools and a usage recorder are present. The delivery-cost benchmark is declared in the package manifest and appears in no job, no guard registry and no test. Run today it fails at +31.3%. The one script that would report how many sessions never reach their terminal activity is 127 lines long, in no registry, invoked by nothing — and the answer it would give is that 106 of 130 session records are still marked running, and that meta completes 4 of 58.

A triage file records the corpus commit its 69 human judgements were made about. That field is loaded and never compared to anything.

### The guards are reachable only by accident of subject matter

Twenty-six guards, 5,113 lines of tested code, run in 1.8 seconds. Across the 21 workflow trees there are exactly six lines that invoke a script, in three files, in the two workflows whose subject is this repository. Both target this checkout by definition, which is the one condition under which a bare relative script path resolves. meta and work-package run against arbitrary repositories and name no server root anywhere.

Two of those six invocation lines are already wrong — one names a flag that does not exist, one omits a flag and validates the wrong tree — and nothing detects either.

**So the exemplar that made mechanisation look like a convention rather than new machinery does not itself execute correctly.**

### What this makes cheap, and what it makes dear

The connection work is cheap because the parts are built and tested. The mechanisation work is dearer than it looks, because the only code guaranteed to be present when a step executes is a server deliberately designed to hold no domain plane at all. A procedure moved out of prose lands somewhere that is either always present and domain-blind, or domain-capable and only sometimes present.

### Testable prediction

Re-run the delivery-cost benchmark after the four server-side delivery changes and the gain will exceed its 13,555-character resolution floor by an order of magnitude. Re-run it after all twelve definition-side mechanisation edits and the movement will sit inside the 1% threshold. If the definition edits do move the number, the saving is coming from deleted prose rather than from mechanised procedure — which is a different and smaller claim than the one the mechanisation programme makes.

## Per-Dimension Findings

### Mechanisation Potential

Which agent-executed steps are deterministic procedures a server tool or script could compute instead.

| ID | Severity | Title |
|----|----------|-------|
| MECH-01 | HIGH | The two largest workflows invoke no repository script |
| MECH-02 | HIGH | Progress item-link repointing cannot execute; its input has no producer |
| MECH-03 | HIGH | The branch-name prefix table omits one member of its own enum |
| MECH-04 | MEDIUM | A closed status table is applied by hand about thirty times per run |
| MECH-05 | MEDIUM | The artifact mint race cannot be won by an agent |
| MECH-06 | MEDIUM | Review-mode ambiguity is self-assessed, so the gate cannot catch confident error |
| MECH-07 | MEDIUM | Planning-folder link checking is partly wired and partly unwritten |
| MECH-08 | MEDIUM | The change-surface technique specifies an unspecified join |
| MECH-09 | MEDIUM | Artifact conformance fuses computable detection with generative correction |
| MECH-10 | LOW | Deterministic detection is fused with judgement inside single steps |
| MECH-11 | LOW | Six small total functions are carried as full technique files |
| MECH-12 | LOW | The infrastructure-submodule predicate is total prose |

**MECH-01 — The two largest workflows invoke no repository script** (HIGH)
Three techniques in a sibling workflow run repository guards from protocol prose and land the results in declared outputs. Across the 262 technique files of meta and work-package, no protocol step invokes any script. Every other mechanisation opportunity is therefore priced as new infrastructure when part of it is an editing task, and the 26 guards are treated as unreachable when four are demonstrably reachable.
*Saving:* turns restated procedure into a checkable relation across 262 files and ~101,200 words.
*Build cost:* one convention paragraph, plus roughly 100 to 160 lines of guard and a registry entry. Blocked on MECH-01 having an address to invoke — see ECO-01 — and on the exemplar being fixed first, see ECO-02. A check that a named script still accepts the arguments the prose passes has no precedent in the suite, and that is the expensive half.

**MECH-02 — Progress item-link repointing cannot execute; its input has no producer** (HIGH)
The Progress-table synchronisation technique declares an input for the delivered artifact and branches on it, but the only two references to that input are inside the declaring file. No call site binds it. The documented policy row — complete, deliverable landed elsewhere, link repointed at the artifact that holds it — never fires, so a deliverable that landed elsewhere is marked complete with a link to a file that does not hold it.
*Saving:* restores a documented behaviour for every planning-folder index.
*Build cost:* about 20 words in one prose argument list. The remedy is not a step-binding rename: the orchestration spine is invoked from prose and carries zero structured step bindings, so there is no binding block to edit. The fix is inert for every session already past the artifact-writing step, so land ECO-04 first.

**MECH-03 — The branch-name prefix table omits one member of its own enum** (HIGH)
The issue-type enum has five members. The prefix table maps four of them, gives no rule for choosing between two of those four, and provides no mapping for epic. An epic-typed work package reaches branch composition with the prefix undefined and the agent invents one, so two runs on the same epic produce different branch names.
*Saving:* removes an invented value from branch and pull-request identity, on a value the corpus itself states is expensive to change once a pull request is open.
*Build cost:* about ten lines across the outputs and two steps. The prefix variable also has no producer under any of the five declared inputs, and the binding guard does not see that, so the producer fix precedes the enum fix.

**MECH-04 — A closed status table is applied by hand about thirty times per run** (MEDIUM)
A five-by-five legal-write matrix, a three-row link reconciliation table and a per-status default are executed by an agent at every dispatch and every activity completion. A 15-activity run applies the same closed table roughly 30 times. The reported output is a count rather than a diff, so a cell written against policy is indistinguishable from a correct one.
*Saving:* the largest in the mechanisation set, and the only one that clears the benchmark's resolution floor — implementing the policy removes a 15,690-byte policy resource as a run-time dependency of the highest-frequency orchestrator hook, against 128 resource fetches averaging 3,501 characters each.
*Build cost:* roughly 150 to 200 lines in `src/tools/`, not a script. Depends on MECH-02's binding. Must return a diff.

**MECH-05 — The artifact mint race cannot be won by an agent** (MEDIUM)
The artifact-writing technique instructs a re-scan for an existing numbered instance before creating one. Scan-then-create spans two tool calls and is not atomic for an agent. A lost race mints a second numbered instance of one logical artifact, detected only on the next write and then logged rather than resolved.
*Saving:* closes a race no prose can close, on the most-cited technique surveyed at 87 corpus references.
*Build cost:* roughly 110 to 140 lines in `src/tools/`, using an exclusive-create open. The session seal covers only the session file's bytes, so writing into the planning folder needs no new trust boundary. Land before MECH-02, because the wrong instance path otherwise lands in a Progress link.

**MECH-06 — Review-mode ambiguity is self-assessed, so the gate cannot catch confident error** (MEDIUM)
Review-mode detection inspects the request through an open enumeration and sets an ambiguity flag when intent is unclear. The confirm gate is conditioned on that flag, so it fires on declared uncertainty only. A confident misclassification never reaches the gate and then partitions the run.
*Saving:* protects 85 references to the review-mode flag across 11 of 15 activities — 52 step gates, 29 checkpoint conditions and 4 checkpoint effects.
*Build cost:* about three lines to assert a contradiction no correct classification can satisfy, or to make the confirm unconditional. This is the largest definition blast radius in the set and forces the most expensive walk-snapshot re-baseline, so sequence it last among the definition edits.

**MECH-07 — Planning-folder link checking is partly wired and partly unwritten** (MEDIUM)
Links carrying no anchor are validated by nothing, because the anchor guard walks only anchored links. Resolution against the publish reference is specified in the technique and implemented nowhere. The five slug edge cases the guard documents appear in no technique prose, so an agent and continuous integration disagree on the first heading containing an ampersand.
*Saving:* ends the class where a link check passes on the working tree and the published folder returns a 404 with a clean report on file.
*Build cost:* the cheap half is not a flag. It is three edits to the anchor guard: relax the skip for targets outside its root, add a scanned-count assertion so an empty root cannot report clean, and admit a root shape that is not a corpus. The remaining half — resolution against a git reference — is roughly 120 lines of new capability.

**MECH-08 — The change-surface technique specifies an unspecified join** (MEDIUM)
The technique pairs two git diff invocations and builds one row per path, with renames keeping git's rename form. The two commands disagree on rename row shape and the join key is not given. For binary files one of them emits a dash where the declared additions and deletions fields require integers.
*Saving:* removes silently dropped and misattributed rename and binary rows from every change surface a review activity reads.
*Build cost:* roughly 60 to 90 lines. This is the one candidate where a script is the right surface, because its consumer is a review activity in a checkout that has git anyway.

**MECH-09 — Artifact conformance fuses computable detection with generative correction** (MEDIUM)
The conformance technique both detects violations and corrects them in place in artifacts the run has already persisted. Three of its four correction actions are mechanical. Two are genuinely generative. Grading the whole technique as judgement-bound conceals the three computable actions, and the in-place correction records no diff.
*Saving:* computes detection and three of four corrections across 25 corpus references.
*Build cost:* roughly 150 lines, plus a substantial rewrite of the largest technique named in this report.

**MECH-10 — Deterministic detection is fused with judgement inside single steps** (LOW)
Component selection ranks three tiers, of which two are string equality and the third has no stated criterion. Worktree creation fuses deterministic registration detection with two interactive escalations. The computable half cannot be lifted without splitting the step.
*Saving:* small, and bounded, because the output is a recommendation presented at a user gate rather than a decision taken.
*Build cost:* about 15 lines to lift the mechanical ranking tiers out as computed inputs to the existing gate.

**MECH-11 — Six small total functions are carried as full technique files** (LOW)
Six techniques state total functions with no fallback path. Mechanising them removes no degradability, because none is stated. The saving is the difference between a procedure statement and a signature plus an invocation, roughly 30 to 60 words per step, because the technique file is delivered either way.
*Saving:* 1,620 to 2,200 characters, 0.12% to 0.16% of one walk — eight times below the only instrument that could measure it. Do not gate this on a benchmark.
*Build cost:* six edits of roughly ten lines each. Inside a batched landing the marginal cost is near zero, which makes now their cheapest moment and later their most expensive.

**MECH-12 — The infrastructure-submodule predicate is total prose** (LOW)
The exclusion rule is three literal string tests over a total predicate. There is no boundary case and no run-to-run variance available, so the classification cannot flip between runs on this rule.
*Saving:* none on correctness. Cost only, and negligible.
*Build cost:* three lines, worth doing only inside a landing that is happening anyway.

**Most important insight:** the corpus renders "a procedure nobody has scripted" and "a procedure that cannot be scripted" as identical protocol prose, so mechanisation adoption tracks what a workflow is about rather than what its steps do.

### Context Economy

Tokens spent shipping definition content into agent contexts, and where that delivery is redundant or oversized.

| ID | Severity | Title |
|----|----------|-------|
| CTX-01 | HIGH | The invariant worker bundle re-ships once per activity |
| CTX-02 | HIGH | Group contracts are re-attached to every operation in the same response |
| CTX-03 | MEDIUM | The collapse machinery is off in production and cannot reach set-valued blocks |
| CTX-04 | MEDIUM | Language-conditional resources ship on every walk |
| CTX-05 | MEDIUM | The section-versus-whole resource choice is inverted for the two heaviest files |
| CTX-06 | MEDIUM | Delivery-mechanics prose restates the tool schema, per technique |
| CTX-07 | MEDIUM | Resource identifiers qualify against the wrong workflow |
| CTX-08 | LOW | The eager-delivery budget asserts a bound that cannot bind |
| CTX-09 | LOW | Twenty-two forwarder techniques pay the group contract twice |

**CTX-01 — The invariant worker bundle re-ships once per activity** (HIGH)
Every activity delivery carries a worker technique bundle assembled from a fixed core set. Across all 20 activities of the two workflows there are exactly three distinct values: 34,619, 35,204 and 40,069 characters. Delivered once per activity that is 735,210 characters for at most 40,069 characters of distinct content, and it is 47% of the median activity's whole 74,109-character delivery, paid before a single step is read.
*Saving:* 281,632 characters, about 70,400 tokens, on a 12-activity walk at the current batch cap of three activities. 387,244 characters for a single-worker walk, which is 56% of the reference fixture's entire activity-payload spend.
*Build cost:* zero new machinery for the cheaper option. The ledger keys for this bundle already exist and only one condition gates them; a second delivery under the same agent identity is provably a resumed context whatever the session mode says. The alternative is a definition edit to three files that today forbid reference delivery on worker sessions.

**CTX-02 — Group contracts are re-attached to every operation in the same response** (HIGH)
Composition merges each ancestor group's rules into the technique value, so the group contract ships once per technique the response carries. File size understates wire cost by up to 4.24 times as a result: a 2,587-byte technique composes to 10,956 characters, 7,189 of them rules. The same technique costs 5,612 characters through one projection and 18,753 through another — a 3.34-times spread on byte-identical content, decided by which of two functions in one file built the response.
*Saving:* 100,123 characters, about 25,030 tokens, of byte-identical intra-response repetition — 30.1% of the eager bundle corpus-wide, 48.5% of the worst activity's, 46.7% of the next. Hoisting the rules to a sibling block saves a further 76,359 characters unconditionally and turns two heavily used techniques from 10,956 and 14,895 characters into 3,767 and 4,035.
*Build cost:* about 15 to 40 lines for the response-local pass, plus one response note explaining that a marker may point at an earlier entry of the same response. Hoisting adds a projection parameter and requires restating the claim that a bundled entry is byte-identical to a direct fetch.

**CTX-03 — The collapse machinery is off in production and cannot reach set-valued blocks** (MEDIUM)
Reference delivery is disabled for the first activity of every worker, which is the only activity a single-activity batch ever takes. When it does run it leaves 71,216 characters on the table, because its ledger keys are whole-block: a merged rules record is a group's rules united with the technique's own, so it is never byte-identical to one already sent. The same applies to inherited-input lists, which differ by exactly the entries a technique declares itself and re-ship whole to carry the difference.
*Saving:* 71,216 characters, about 17,800 tokens. Total collapse rises from 20.5% to 33.9%. The largest single wins are 14,002 characters on one activity and 10,473 on another.
*Build cost:* per-entry hashing, mirroring a split already present one level up. The delivered-content map grows from 73 keys to low thousands and lives inside the sealed session file, so measure the seal and serialise cost first.

**CTX-04 — Language-conditional resources ship on every walk** (MEDIUM)
Two techniques say "for Rust projects, follow" and then link a resource. The condition is a sentence and the link is a link, so the extractor sees an unconditional reference and the project type in the bag is never consulted.
*Saving:* 27,066 characters of Rust test-driven-development material per non-Rust walk, or 34,568 characters — about 8,600 tokens — including four sections of a Rust-named resource that every language uses as its generic review template.
*Build cost:* a schema addition plus an extractor change if done as link syntax, or zero schema at the price of one step per gate. Renaming the misnamed template is a separate edit with anchor updates.

**CTX-05 — The section-versus-whole resource choice is inverted for the two heaviest files** (MEDIUM)
Agents are told to choose between a whole resource and a section by how much they will need. For the two most-cited resources the corpus chooses wrongly. One 21,480-character file is cited by 13 anchors summing 24,805 characters, with 5,781 of those shipped twice. A 15,547-character file is cited by 9 anchors summing 19,718 characters, with the innermost 958 shipping three times. The containment check that would catch this compares string offsets rather than heading depth, so it sees a file containing a section and never a section containing a subsection.
*Saving:* 3,325 and 4,171 characters on those two files, and 20 ledger keys collapsing to 2, so every later fetch of any of those sections becomes a marker instead of a body. For scale, the reference walk spent 448,084 characters over 128 resource fetches — 3.95 times the 113,527-character union of what it fetched.
*Build cost:* roughly 60 lines. The section extractor already tracks heading depth. Add a rule for when the union of anchors is cheaper than the file.

**CTX-06 — Delivery-mechanics prose restates the tool schema, per technique** (MEDIUM)
Of the 8,286 bytes in the engine group's contract, 5,014 — 60.5% — is prose about how to call the server rather than about the workflow engine's domain. Eight rules restate parameter descriptions the client already holds, and four response notes restate them again at delivery time. The tool schema is delivered once per session and stays resident; this block is paid again per composed technique, per activity.
*Saving:* 5,014 characters off every composed engine technique, about 20,056 characters across the four activities that deliver one, and it compounds with the deduplication work that shrinks whatever survives. A separate case is smaller and starker: four harness variants total 4,410 characters per workflow delivery, of which 3,297 are always wrong.
*Build cost:* a pure definition edit, strictly gated on the server-side delivery changes landing first. Confirm the template and audience guards do not require a non-empty rules section. Keep the two rules that are engine semantics rather than tool mechanics.

**CTX-07 — Resource identifiers qualify against the wrong workflow** (MEDIUM)
Resource identifiers extracted from a technique body are qualified against the workflow the activity was authored in, never the workflow the technique was authored in. A technique borrowed across workflows therefore mis-qualifies its own same-workflow links.
*Saving:* not tokens. 5,631 characters of resource body that currently never arrive, three bundling warnings on every delivery for two activities, and two steps that presently execute without their template.
*Build cost:* one extra field on a composition result and one argument change at the call site. Extend the anchor guard to resolve through the delivery path rather than the filesystem, so this class fails at continuous integration rather than at run time.

**CTX-08 — The eager-delivery budget asserts a bound that cannot bind** (LOW)
The eager budget derives from a declared context window and reaches 640,000 characters at 200,000 tokens. The largest eager bundle in either tree is 77,161 characters — 12.1% of budget, 8.3 times slack. Three guard branches enforce it and none is reachable at any window a current model reports. Separately, the reported spend omits the 35,204-character worker bundle, understating a typical activity delivery by roughly half.
*Saving:* zero characters, ever. It removes about 80 lines, one limb of the batch calculation, their tests and two response fields that report a bound with 8.3 times slack. Fixing the reported spend saves nothing and makes every other measurement here trustworthy.
*Build cost:* three lines for the measurement fix, and do it first so the reference fixture is complete. Retiring the budget needs either a small-window floor or acceptance of an activity-cap-only bound.

**CTX-09 — Twenty-two forwarder techniques pay the group contract twice** (LOW)
Twenty-two techniques are four content lines or fewer and at least half an instruction to apply another operation. A forward is not free on the wire, because each group contract is inherited at both ends. Two of the pair have also forked, which is the same shape becoming a defect: one copy of a push technique declares the remote that stealth mode relies on and the other does not.
*Saving:* roughly 6,500 characters and one round trip per forwarded call, across 22 forwarders, plus one closed contract fork.
*Build cost:* small per file, 22 files, each with call sites to re-point.

**Most important insight:** the boundary that destroys the most is one session-scoped boolean standing in for two independent questions, and the definitions have told the orchestrator to answer it no.

### Orchestration Topology

How work is distributed across agents and turns, and where the shape itself is the cost.

| ID | Severity | Title |
|----|----------|-------|
| TOP-01 | HIGH | A gated step is never eagerly bundled, however decidable its gate |
| TOP-02 | HIGH | Gate density dominates the topology, and loop gates multiply it |
| TOP-03 | HIGH | The review wait is a spin loop holding a worker and the session lock |
| TOP-04 | MEDIUM | Dead step bytes ship and draw down the batch budget |
| TOP-05 | MEDIUM | The batch reading is taken at an activity's open and acted on at its close |
| TOP-06 | MEDIUM | Four ordering defects in the two heaviest activities |
| TOP-07 | MEDIUM | Independent work is serialised by document order, and cannot be expressed otherwise |
| TOP-08 | MEDIUM | Round trips that return a hash: loop bodies and duplicate bindings |
| TOP-09 | MEDIUM | The checkpoint replay cache has no invalidation |
| TOP-10 | LOW | Concurrent fan-out is invisible to the batch bound and to usage rows |
| TOP-11 | LOW | Lazy fetches and worker identity cannot be checked against the dispatch |

**TOP-01 — A gated step is never eagerly bundled, however decidable its gate** (HIGH)
The bundler skips any step carrying a gate, regardless of size and regardless of whether the gate is already decidable. That leaves 89 of work-package's 174 technique steps lazy (51.1%) and 12 of meta's 23 (52.2%). Three activities bundle nothing at all, including one that ships 42.7 KB over 17 separate fetches. The orchestrator's own hot loop, re-entered once per client activity, bundles nothing and fetches 28.6 KB over six calls.
*Saving:* 44 work-package and 6 meta steps move from guaranteed-lazy to bundleable, roughly 44 fewer round trips and about 120 KB moved from lazy to bundled. Budget utilisation rises from 32% to 62%. One activity goes from zero bundled steps to up to 13.
*Build cost:* about 200 lines for a liveness helper and a handler change, plus one guard. No definition edits. The predicate becomes "not provably dead", which is a strict superset of today's behaviour for ungated steps and a strict subset for provably dead ones, so no worker can lose a step it would have executed.

**TOP-02 — Gate density dominates the topology, and loop gates multiply it** (HIGH)
The two workflows carry 49 checkpoints. Each one costs a fixed seven hops: a yield, a presentation, a network call to the git remote, a question to the user, a response, a harness resume and a worker resume. Eight of the 44 work-package gates sit inside loop bodies and five of those carry a per-iteration discriminator, so they fire once per collection item. On the ordinary create path only 20 of the 44 certainly fire; 16 never fire at all.
*Saving:* the largest single reduction available anywhere in the corpus. The per-iteration gates are 110 bounded presentations plus one unbounded loop in work-package and 25 in meta — up to 770 and 175 hops respectively — collapsing to five batched presentations with an individual-interview opt-out. The corpus already hand-rolls exactly that escape in one place. Hoisting the certain, message-independent gates takes 20 presentations to eight or ten, about 80 further hops.
*Build cost:* roughly 200 lines for batched presentation tools, five activity edits and one guard for the loop gates; roughly 150 lines and one more guard for hoisting. Hoisting is sound only for gates whose message templates nothing the activity itself binds, which is a static property of the definition and therefore checkable.

**TOP-03 — The review wait is a spin loop holding a worker and the session lock** (HIGH)
The await-review loop has no iteration bound. Its body re-presents a gate whose "still waiting" option sets a flag and asks again. So the worker polls a human for the duration of a real pull-request review, and for that whole period the worker's context stays live and billable, the batch identity cannot be released, and an occupied checkpoint slot blocks every one of the server's six delivery calls for every context in the session.
*Saving:* the entire human-review latency comes off worker-context lifetime and off the session-wide lock. This is the single largest wall-clock item in the topology, and it is structural rather than incidental. It also removes one of the five unbounded loops.
*Build cost:* one activity split into two, one new transition and one resume entry. The replay cache already makes re-entry work, but the parked gate must be excluded from replay or the resume answers itself.

**TOP-04 — Dead step bytes ship and draw down the batch budget** (MEDIUM)
On the ordinary create path, 22,262 bytes across 55 steps of work-package's step definitions are provably dead — 32.2% of all step bytes. One activity ships 11,881 dead bytes over 27 dead steps, 68.3% of its own step bytes. Untaken branches of the activity documents add more: 60% of one meta activity, 38% and 36% of two others. Every one of those bytes is charged against the quantity the batch bound is expressed in.
*Saving:* 22,262 bytes off work-package and 1,248 off meta, which frees enough budget to take a 15-activity run from at least eight worker contexts to about five — roughly 4.3 minutes of spawn time at a measured mean of 87 seconds per dispatch.
*Build cost:* about 100 lines plus a verification harness, and this is the highest-risk item in the delivery programme. A wrongly pruned step is one the worker never sees, cannot report and cannot fail a manifest check on. Keep the identifier and gate expression in the payload so the manifest has a row to disagree about. It is also the smallest saving in that programme, so dropping it costs about 18% of the programme's value.

**TOP-05 — The batch reading is taken at an activity's open and acted on at its close** (MEDIUM)
Whether a worker may take another activity is computed when the activity is delivered, and the protocol carries that reading to the end of the activity. Between the two sit every lazy fetch of that activity. The eager floor is 53,676 characters per activity while the measured median with lazy fetches counted is 74,109, the ninetieth percentile 182,642 and the maximum 261,827. So the reading understates consumption by roughly 20,000 characters at the median and about 208,000 at the maximum, against a 280,000-character budget.
*Saving:* removes each stale-true continuation, which costs one activity advance with the session pointer already moved, one harness continuation turn, one refused delivery and one full replacement spawn. The frequency is already counted by a recorded refusal event.
*Build cost:* the batch calculation is already exported and free of side effects, so the read is nearly free. One server change plus a one-line change in two techniques.

**TOP-06 — Four ordering defects in the two heaviest activities** (MEDIUM)
The platform-selection gate is read by nine sites and written eight steps later, so on the create path an issue is created before the platform is chosen and the user is then asked which platform to use for an issue that already exists. A project-selection gate is conditioned on platform alone, so every run with an existing issue stops to choose a project for an issue that will never be created. The cheapest hard-fail check sits behind a full repository index, so every unsigned-repository run pays the index before discovering it cannot proceed. A build-artifact gate asks a question its follow-on gate proves the bag can already answer.
*Saving:* repairs a broken create path; removes one full gate cycle from every Jira run with an existing issue and one from the common no-regeneration path, each being four calls, two turn boundaries and a three-second server floor; saves a whole repository index on every unsigned-repository run.
*Build cost:* four definition edits, no server change. Extend the checkpoint-entry guard to flag a gate whose variable writes are read by an earlier step of the same activity — that guard would have caught the first defect mechanically.

**TOP-07 — Independent work is serialised by document order, and cannot be expressed otherwise** (MEDIUM)
Four detections in the first work-package activity are mutually independent given the repository root and run in sequence behind a full index. Three probes in the first meta activity are independent. Two push verifications describe the same push and are separated only by a gate. Three read-only reviews in the post-implementation activity are independent analyses run one after another. The schema admits four step kinds and none of them is concurrent, and the runtime would refuse concurrency if the schema could express it.
*Saving:* four serial probes become one wave; three serial analyses become one wave.
*Build cost:* a concurrency field on a step group, which the schema does not have — though the fan-out primitive it would use is already defined in two techniques. Note the accounting trap: fan-out inside a technique body is invisible to the server, so without TOP-10 the cost moves off the measured path rather than off the bill.

**TOP-08 — Round trips that return a hash: loop bodies and duplicate bindings** (MEDIUM)
Thirty of work-package's 31 loop-body technique steps carry no gate of their own — the same operations run every iteration and only the count is runtime. Each is fetched on reach, every iteration. Separately, 174 technique steps bind 145 distinct techniques, so 29 bindings are duplicates; one activity binds nine steps to five techniques and another binds the same recording operation three times. The content ledger collapses the bytes in both cases. It does not collapse the call.
*Saving:* a six-task plan issues about 36 fetches for six bodies and would issue six. The 29 duplicate bindings are 29 round trips that today return a 16-character hash.
*Build cost:* one clause on the same bundling predicate as TOP-01, plus a note that the bundled block runs every iteration. The duplicate bindings are definition edits across 11 activities and need case-by-case review, because some duplicates are the same operation applied to different inputs.

**TOP-09 — The checkpoint replay cache has no invalidation** (MEDIUM)
Checkpoint responses are keyed by activity and checkpoint and are never cleared, expired or invalidated. On replay the worker is told to continue without yielding. The key carries no fingerprint of the state the decision was about, so a session resumed weeks later replays a "use the existing pull request" answer and re-binds a pull-request number that has since merged or closed. The same shape applies to platform selection and to the build-artifact gate.
*Saving:* stops a resumed session silently re-applying a decision about a world that has moved.
*Build cost:* extend the key or the record to include a hash of the variables the gate's condition and option effects name, plus a migration arm beside two that already normalise legacy shapes. The risk is over-invalidation re-asking questions whose answer did not really depend on the changed variable.

**TOP-10 — Concurrent fan-out is invisible to the batch bound and to usage rows** (LOW)
Seven of fifteen work-package activities declare a scatter-gather capability, and the parallel mode dispatches real concurrent instances. Those instances never call the server under their own identity, so the batch bound sees one context where several ran, the delivery ledger records nothing for them, and the usage recorder charges several instances' tokens to one row.
*Saving:* none directly. It fixes the evidence base for every batch tuning decision, because the per-activity figures the batch settings are revised from currently overstate serial cost and understate fan-out.
*Build cost:* a fan-out recording tool is the cheap version — one tool, one event type, no protocol change. Having instances call the server directly collides with the single activity pointer and the single checkpoint slot.

**TOP-11 — Lazy fetches and worker identity cannot be checked against the dispatch** (LOW)
The technique-fetch call takes no activity identifier and reads the session pointer at eight sites to decide what to search and what provenance to attach. The worker is instructed to verify the activity identifier on the activity call, and there is nothing to compare on the more frequent lazy call. Separately, fresh-versus-resumed is inferred from the identity alone, so a context that was compacted or replaced but kept its identity receives markers for content it has never seen, with no error, event or warning.
*Saving:* converts a silent wrong-activity resolution into a loud one.
*Build cost:* one optional parameter and one comparison, backward compatible.

**Most important insight:** this system's cost is not in its bytes but in the number of times it must re-establish a reading across a turn boundary, and roughly half of the round trips a full walk issues exist because a decision available at one moment was deferred to a later one.

### Redundant Work

Work the workflows perform that produces nothing the run consumes.

| ID | Severity | Title |
|----|----------|-------|
| RED-01 | HIGH | A delivery-cost gate exists, fails at 31.3%, and nothing runs it |
| RED-02 | HIGH | One whole activity produces nothing a non-Rust run consumes |
| RED-03 | HIGH | Three gates can never flip, and one leaves two shipped artifacts as drafts |
| RED-04 | MEDIUM | Forty-five dead definition files, and no guard measures deadness |
| RED-05 | MEDIUM | Eighteen variables are consumed with no producer, because declaration counts as production |
| RED-06 | MEDIUM | Verification is duplicated inside work-package, not between the guards and the workflows |
| RED-07 | MEDIUM | Terminal-activity bookkeeping rarely runs, because runs rarely reach the terminal activity |
| RED-08 | MEDIUM | Five hundred and fourteen unanchored links, and 1,414 unchecked artifact pairs |
| RED-09 | LOW | Write-only variables, empty action steps and contract-free group stubs |
| RED-10 | LOW | Session state grows without a bound, and two instruments sit orphaned |

**RED-01 — A delivery-cost gate exists, fails at 31.3%, and nothing runs it** (HIGH)
The delivery-cost benchmark, run today against the same 12-activity path and the same policy as its frozen reference, fails its own gate at +31.3%. Delivery rose from 1,355,532 to 1,780,292 characters in 32 days: activity payloads up 43.5%, the workflow bundle up 82.1%, resources up 17.8%. The two calls whose content is the definitions themselves account for 348,259 of the 424,760 added characters — 82% of the regression, roughly 106,000 additional tokens per walk.
*Saving:* caps the resident regression at whatever a new baseline records, and prices every later definition change at merge. This is the highest-value item in the report per unit of work.
*Build cost:* one continuous-integration step and one re-record. Choose the threshold deliberately: 1% is right against a fresh baseline and will flag ordinary authoring if left against the old one.

**RED-02 — One whole activity produces nothing a non-Rust run consumes** (HIGH)
Trace the validation activity's 11 steps for a project the detector classifies as other — which includes this TypeScript repository. Every producing step is gated on the Rust project type. The sole producer of the validation result anywhere in the corpus is one of those steps. The fix-and-revalidate loop then handles failures from a suite that never ran. The activity's declared outcome is satisfied by the not-applicable branch alone.
*Saving:* one whole activity payload and one activity advance per generic run — about 57 KB, 8% of the measured activity-payload total for one walk.
*Build cost:* medium, and the honest fix is new capability rather than deletion. Either add a language-neutral validation operation, or give the activity a project-type entry condition.

**RED-03 — Three gates can never flip, and one leaves two shipped artifacts as drafts** (HIGH)
A gate is distinct from an unproduced variable when the variable's only writer sets the value it already defaults to. Three gates are in that state. The consequential one is in meta: the completion flag defaults to false and its only writer sets it false, so the session-metrics revision never executes. Three separate files document that a mid-run write of the trace and usage artifacts is a draft that the terminal activity rewrites. It does not.
*Saving:* restores a documented post-exit rewrite; two shipped artifacts stop being drafts in every run. Highest correctness value per word in this report.
*Build cost:* one definition edit — either set the flag on the completion outcome, or declare it an output of the activity-finalising operation.

**RED-04 — Forty-five dead definition files, and no guard measures deadness** (MEDIUM)
Thirty-one of meta's 149 technique files are provably unreachable (20.8%) against three of work-package's 111 (2.7%). A 20-file orchestration-pattern library has zero in-edges and cannot be reached by identifier either, because the activity loader reads its directory without recursion. An entire five-file search group has zero references anywhere in 21 workflows, and the capability it holds is inlined in prose elsewhere. The whole Confluence half of one operations group is unreachable — eight of nine operations — and no workflow in the corpus writes to Confluence.
*Saving:* 45 files and 44.4 KB, about 6,000 tokens of corpus surface. This is maintenance load, not run payload: technique files load lazily, so an unreferenced file is never fetched. The difference between the two trees is instructive — the tree pruned once, by hand, carries a seventh of the dead fraction of the tree that never was.
*Build cost:* about 88 to 151 lines for a reachability guard, by the existing guard precedent, and it must implement two edge kinds this evaluation had to derive by hand. Build the guard before pruning, or the ratchet restarts the next day.

**RED-05 — Eighteen variables are consumed with no producer, because declaration counts as production** (MEDIUM)
Eighteen of work-package's 140 declared variables (12.9%) are read and never written. The sharpest case is the declared input of the most-bound technique in the workflow, depended on by 15 step bindings, holding an empty list forever. A safety-floor validation names a variable nothing sets, so a rule the workflow promises to enforce can only fail or be ignored. Two transition edges out of the assumptions activity are gated on unproduced variables, so an activity the definition says has five exits has three. The binding guard accepts a declared workflow variable as a producer, which is exactly why all of this passes.
*Saving:* restores a safety check and two documented loop-backs, and catches the class rather than the instances.
*Build cost:* small definition edits per instance, plus a no-writer rule in the binding guard requiring every consumed declared variable to have a writer, a set target or a technique output of that name. Four externally seeded names need an exemption with a stated reason each.

**RED-06 — Verification is duplicated inside work-package, not between the guards and the workflows** (MEDIUM)
The brief's hypothesis was that the 26 guards duplicate in-workflow verification. They do not overlap at all: the guards are invoked by no step in either tree, run in 1.8 seconds, and the conformance technique is bound exactly once in the whole corpus. The real duplication is internal. Ninety of work-package's 264 steps are verification-shaped (34%). One review technique is bound four times, two of those being consecutive steps in one activity with the same technique, the same gate and no distinguishing inputs. An architecture summary is bound twice and both bindings write the same file, so the second overwrites the first.
*Saving:* about 5.6 KB off one activity's review-mode payload and one fewer execution of a 5,647-byte protocol; 3.2 KB and one artifact write cycle for the summary.
*Build cost:* definition edits. Confirm first that the two consecutive steps were meant to be different passes — if so, the fix is inputs rather than deletion.

**RED-07 — Terminal-activity bookkeeping rarely runs, because runs rarely reach the terminal activity** (MEDIUM)
Worktree teardown is bound once, at the terminal activity, gated on a flag set thirteen activities earlier. Across 130 session records, 106 are still marked running (81.5%). meta completes 4 of 58 (6.9%), with 27 sitting at the terminal activity without finishing it. work-package completes a median 10 of 15 activities. The residue is 25 linked worktrees and 529 MB, with nothing prunable. The same distance explains the index problem: 83 artifacts sit on disk with their index row marked not started, in 28 of 83 folders, while only 3 of 618 complete rows over-claim.
*Saving:* recovers the worktree residue class, makes the running status mean something, and stops a reader skipping finished work.
*Build cost:* medium, and it needs a decision first — is an abandoned run's worktree garbage, or work someone intends to resume? The cheap adjunct is a warn line comparing the index to the directory at each synchronisation, and a report-only wiring of the 127-line census script that already answers the question.

**RED-08 — Five hundred and fourteen unanchored links, and 1,414 unchecked artifact pairs** (MEDIUM)
The anchor guard checks 347 anchored links, both file existence and heading slug. It ignores 514 unanchored relative links by documented design, and 132 of those cross from one tree into the other. All 132 resolve today, which is the finding rather than a reassurance: 132 hard-coded relative paths depend on one tree's directory layout staying exactly where it is, and the toolchain has no opinion about any of them. Widening the model, 1,414 of 1,806 manually synchronised artifact pairs have no automated check (78.3%), and the two largest unchecked classes are also the two whose failures are silent.
*Saving:* arrests the largest silent class. The guard lands green and stays green.
*Build cost:* medium, and the exclusion list is the whole design problem. A naive existence check reports 22 findings that are all correct as written — index rows in two template files, naming artifacts a session mints inside its own folder. Name those two files and require a stated reason for any third.

**RED-09 — Write-only variables, empty action steps and contract-free group stubs** (LOW)
Sixteen of work-package's 140 variables are written by 30 checkpoint effects and read by nothing. One of them is set true by all three options of its gate, so it carries no information even as a record. Five action steps declare an empty action list and cannot act; each carries a gate and sits before a checkpoint. One of the five is the whole integration with the analysis workflow, so that path is inert, and the variable declared to carry its output has neither producer nor reader. Two group contracts carry a capability heading and nothing else while still costing an ancestor load.
*Saving:* 16 fewer declarations from 140, 30 fewer effects, five fewer steps from 264, and two fewer empty ancestors in the composition path. Small payload, real comprehension gain.
*Build cost:* definition edits plus one guard that rejects an empty action list. Triage the write-only set individually — some are deliberate audit breadcrumbs.

**RED-10 — Session state grows without a bound, and two instruments sit orphaned** (LOW)
There is no history cap anywhere in the source: no maximum, no slice, no trim. History is 45% of this evaluation's own serialized state tree at 254 bytes per event, and a completed child's full state including its full history is embedded in its parent's file. Mean state per run rose from 12,096 bytes in June to 127,481 in August, a factor of 10.5, and 3,867,763 bytes are committed across 69 files. Separately, a 16,943-byte record of human judgements reached the pinned corpus with no consumer, four days after it was written, because its checker was never merged; and a triage file records the corpus commit its verdicts were made about in a field nothing compares.
*Saving:* bounds the growth term, and ends two cases where a record's authority outlives its checker.
*Build cost:* the history cap is a real design question rather than a cleanup, because history is the audit trail. A cheaper first move is not inlining a completed child's full state in its parent. The two orphaned records cost about five lines and one decision each.

**Most important insight:** every guard in this system checks a property of one file, and every decay in this system is a disagreement between two artifacts — so a green sweep of all 26 guards is the starting condition for this dimension's findings, not a counter-argument to them.

### Change Economics

For each opportunity, what building it costs and what it risks.

| ID | Severity | Title |
|----|----------|-------|
| ECO-01 | HIGH | The checkout is the one surface not guaranteed present, and it is the default choice |
| ECO-02 | HIGH | The exemplar the convention would propagate does not itself execute correctly |
| ECO-03 | HIGH | Eleven of twelve mechanisation savings are below the instruments' resolution |
| ECO-04 | HIGH | A definition edit is silently inert for the sessions already running |
| ECO-05 | MEDIUM | The re-baseline ceremony is fixed per landing, which inverts the recommended order |
| ECO-06 | MEDIUM | The batch bound is a free dial, turned up once and turned back |
| ECO-07 | MEDIUM | The planning folder is not the expensive surface it is assumed to be |
| ECO-08 | MEDIUM | Eleven of twelve candidates are guarded by nothing, and the spine is outside the guards' reach |
| ECO-09 | MEDIUM | Mechanisation must return a diff, not a count |
| ECO-10 | LOW | Maintainer attention is the gate on every new guard |

**ECO-01 — The checkout is the one surface not guaranteed present, and it is the default choice** (HIGH)
Three implementation surfaces are available and they are not interchangeable. Ordered by presence at the moment of execution they are strict: the server is present by definition, because the run is a sequence of calls to it; the corpus is present because the server reads it; the checkout is present only when the run's subject happens to be this repository. Every script invocation in all 21 trees is a bare relative path, and the path-presentation module exists precisely because the server's filesystem is routinely not the agent's — under a container the server rewrites the planning folder path for the host, and no other path.
*Saving:* unblocks every invocation-based mechanisation. Without an address, a prose script step in these two workflows either halts a run that used to complete or, more likely, is hand-derived and reported as if the script had run — a mechanisation that increases confidence without increasing determinism.
*Build cost:* cheapest is one response field exposing a host-presented server root through the rewriting machinery that already exists and is tested. Next is one tool that runs a named guard from the existing registry, roughly 150 lines over shipped code with its finding protocol and exit-code contract already written, and namespace-proof. Shipping the guards as an installed package costs most and multiplies version skew across 21 trees.

**ECO-02 — The exemplar the convention would propagate does not itself execute correctly** (HIGH)
The convention's evidence is a sibling workflow's audit technique. One of its steps restates an escape-hatch flag that does not exist in the 825-line script it names. Another runs a reference guard without a root argument, so an authoring run reviewing a worktree validates the stale main copy — a defect the root-resolution module carries the docstring for. Two of six sites are wrong; the drift rate is 33% and detection is zero.
*Saving:* prevents the convention propagating a broken form across 262 files.
*Build cost:* two edits in one file. It must land before the file is held up as the pattern, and it means the collapse from four pieces of machinery to one sentence rests on a counter-example nobody executed.

**ECO-03 — Eleven of twelve mechanisation savings are below the instruments' resolution** (HIGH)
Four instruments price this system and all four price delivery. The delivery-cost gate defaults to a 1% threshold, so its resolution floor is 13,555 characters. The largest mechanisation candidate is a 5,443-byte file, 0.40% of a walk. Deleting the entire text of all ten candidate techniques registers at 2.40%, and the candidates do not propose deletion. The dispatch and batch benchmarks resolve dispatch count, and no candidate changes it. The usage recorder carries a documented factor-of-two counting ambiguity, and the largest candidate's saving — about two hand-applications of a table per activity — sits inside it.
*Saving:* nothing directly. It changes what the programme may claim. Eleven of twelve savings are simultaneously real and unfalsifiable, and flatness will read as safety.
*Build cost:* free, and it is a re-description rather than a build. Restate the one measurable saving against the instrument that exists: not "a table stops being applied by hand" but "a 15,690-byte policy resource stops being a run-time dependency of the highest-frequency hook", which is gateable and attributable to one commit.

**ECO-04 — A definition edit is silently inert for the sessions already running** (HIGH)
Definition bodies are safe against sessions in flight, because the delivery ledger keys on a hash of the payload rather than on an identifier, so an edited body delivers in full to a resuming worker. Bag state is not safe. Defaults are seeded at fresh session creation and at child dispatch, nowhere else. The resume path checks four kinds of drift and never compares the loaded workflow version against the recorded one. So a resumed session runs new protocol against an old bag under an old recorded version, and each of those three facts is individually correct and jointly silent.
*Saving:* converts the slowest invisible failure in the candidate set into a line of output, and it is the only item that makes the other eleven safer to land. Six of the twelve remedies carry this exposure; the largest cohort is 85 references across 11 of 15 activities.
*Build cost:* about ten lines beside the four drift checks already there, one test, no corpus change, no re-baseline, no submodule bump. Precede every definition landing with the running-session census, which is one command against a script that already exists — if the count is zero the whole exposure column collapses.

**ECO-05 — The re-baseline ceremony is fixed per landing, which inverts the recommended order** (MEDIUM)
A definition edit is a submodule commit, a pointer bump, six committed walk snapshots across six policies, a corpus stamp, an empty unresolved-reference baseline and a re-stamp. Guard delta checking materialises the merge base in a throwaway worktree and runs the whole registry twice. Each walk has a 45-second budget, six-walk hooks budget 270 seconds, and the continuous-integration runner is roughly four times slower than local — one lint already went from 60 to 120 seconds and then timed out anyway.
*Saving:* one landing carrying every definition-only edit instead of twelve landings paying the ceremony twelve times. This directly reverses the instruction to sequence the cheapest items last: their marginal cost inside a batched landing is near zero, so now is their cheapest moment and later their most expensive.
*Build cost:* none. It is a sequencing decision.

**ECO-06 — The batch bound is a free dial, turned up once and turned back** (MEDIUM)
Two constants govern how many activities one worker context may take, and both are settable by environment variable. The comment above the defaults records that the higher bundling fraction "would admit thirteen of fifteen activities into one context". Moving from the current pair to that one takes a 15-activity run from at least five worker contexts to two, saving roughly 261 seconds of spawn wall-clock and three context establishments, at zero build cost and zero corpus edit.
*Saving:* potentially the largest in this report, and by a wide margin the cheapest. It could dominate the entire mechanisation programme.
*Build cost:* zero for the change. The honest qualification is that the dial has already been at the higher setting and was revised down, on evidence a byte count cannot see — the bound measures characters while the resource it protects includes context establishment. So the recommendation is not "raise it": it is to re-run the batch benchmark and a real-run profile against a current run, which costs less than the lowest-value mechanisation item.

**ECO-07 — The planning folder is not the expensive surface it is assumed to be** (MEDIUM)
The intuition that writing into a user's planning folder is costly because the server owns it is false. Seal verification covers the session file's bytes only: it reads that file, hashes those bytes and compares. Writing an index or an artifact into the folder does not touch the seal. The server also already resolves the folder canonically and already authenticates by session index, so a new operation needs no path plumbing and no new trust boundary.
*Saving:* re-sites two candidates from the least-privileged surface to the one that is always present. The atomic mint becomes the cheapest item in the set rather than an outlier, because an exclusive-create open is one line and the server is the only party that can hold it.
*Build cost:* the tool body is the small part. The expensive parts are one-time per tool rather than per capability: a large server test file, a documentation-drift test walking 11 product globs, and a pre-decision content budget of 110,000 characters that a new tool's description and schema land inside.

**ECO-08 — Eleven of twelve candidates are guarded by nothing, and the spine is outside the guards' reach** (MEDIUM)
Eleven of the twelve mechanisation candidates are protected by no guard at all. The single exception is protected by a guard that checks a different property than the one that fails. The 26-guard suite reads the corpus at authoring time, so every candidate whose defect manifests during a run is invisible to it by construction. Worse, the guard that would catch the unbound-input defect iterates structured step bindings, and the technique in question has 19 corpus references and zero structured bindings — the whole orchestration spine is invoked from prose, against 181 structured bindings in work-package activity documents and 24 in meta's. A measured instance shows the same boundary: a branch-prefix variable resolves to nothing and the guard reports zero untriaged findings.
*Saving:* makes the class visible rather than the instances.
*Build cost:* the binding guard's parse domain is the real work, and moving the spine's invocations into structured bindings is a re-architecture of the orchestrator technique rather than a mechanisation.

**ECO-09 — Mechanisation must return a diff, not a count** (MEDIUM)
Every value this system produces is verified in one of three places: at authoring time by a guard, at run time by a gate, or after the fact by a reader. Mechanisation moves a value's producer. It does not move its verifier. A computed value with no diff is checked by a reader exactly as a hand-derived value with no diff is. Five of the twelve candidates produce values whose only verifier is a reader: an index link no expression reads, a row count rather than a diff, a duplicate instance detected on the next write, a broken-link list nothing re-reads, and in-place corrections of already-persisted artifacts.
*Saving:* converts five reader-verified decisions into run-time or authoring-time ones. Without it, mechanisation buys accuracy of derivation and nothing else.
*Build cost:* one extra return field per operation. Determinism of the producer is free once the code is written; verifiability of the product costs that field, and it is the field the corpus consistently omits.

**ECO-10 — Maintainer attention is the gate on every new guard** (LOW)
A new guard is the cheapest new capability in the repository: roughly 160 lines of script, a six-field registry entry, one manifest line and 15 to 170 lines of test, with the registry test asserting the entry is complete and unique. The scarce resource is the verdicts it produces. The binding triage register holds 69 entries under 12 rationales and every single verdict is "harmless", while the file's own note defines two further verdicts precisely so that "harmless" and "live bug" stop being the same silence. A register in which nothing is ever classified as debt has stopped distinguishing.
*Saving:* none. Naming it prevents a guard shipping findings faster than anyone can adjudicate them.
*Build cost:* the invocation guard would flag protocol steps across 262 technique files, each needing a human verdict before the guard can go green. Budget that backlog inside the build rather than as a follow-on.

**Most important insight:** what the three implementation surfaces really trade is maintainer attention, and the surface taxonomy in use is a taxonomy of authorship rather than of execution — so the cheapest-looking surface is the one that silently does not run.

## Cross-Cutting Patterns

**The mechanism exists and nothing invokes it**
- **Affected dimensions:** all five.
- **Evidence:** two working gate evaluators live in the same process as the variable bag and are imported by nothing in the tool layer. The deduplication path is gated by one boolean the definitions instruct workers not to set, and the reference walk records zero collapses. The delivery-cost gate fails at 31.3% and is in no job. A 127-line census script answers the running-session question and is in no registry. A triage file's corpus stamp is loaded and never compared. The batch dial is an environment variable pair that was set higher and reverted. Twenty-six tested guards are invoked from six lines, none of them in the two workflows in scope.

**The delivery unit is the whole activity, so every branch a run cannot take is paid for**
- **Affected dimensions:** Context Economy, Orchestration Topology, Redundant Work.
- **Evidence:** 22,262 dead step bytes on the ordinary create path, 32.2% of all step bytes and 68.3% of one activity's. Untaken document branches reach 60% of one activity. 89 of 174 technique steps stay lazy because the delivery layer will not evaluate a gate, while 44 of them are decidable at activity entry. One whole activity's payload is delivered to every non-Rust run to set one boolean. 34,568 characters of Rust material ship on every non-Rust walk.

**The same bytes reach the same context, inside one response and across one batch**
- **Affected dimensions:** Context Economy, Orchestration Topology.
- **Evidence:** 100,123 characters of byte-identical intra-response repetition, 30.1% of the eager bundle and 48.5% of the worst activity's. An invariant worker bundle of at most 40,069 distinct characters delivered as 735,210, with 281,632 addressable at the current batch cap. 45,936 characters of cross-activity resource repeat inside the manifests. Twenty-nine duplicate bindings and thirty loop-body steps re-fetched every iteration, each returning a hash and still paying the round trip.

**Every guard checks one file; every decay is a relation between two artifacts**
- **Affected dimensions:** Redundant Work, Change Economics, Mechanisation Potential.
- **Evidence:** 1,414 of 1,806 manually synchronised pairs have no automated check. 514 unanchored links, 132 of them crossing a tree boundary. Eighteen unproduced-but-consumed variables pass because the guard accepts declaration as production. A branch-prefix variable resolves to nothing while the guard reports zero untriaged findings. All 26 guards pass in 1.8 seconds against a corpus carrying every finding in this report.

**A mechanised value has no verifier but a reader**
- **Affected dimensions:** Mechanisation Potential, Change Economics, Redundant Work.
- **Evidence:** five of twelve candidates return counts rather than diffs. Eighty-three index rows understate finished work against three that over-claim, and nothing in a run re-reads them. No instrument in the repository can report a wrong status cell, a duplicated artifact instance, a mis-joined rename row or a 404 in a published folder. Four benchmarks and a usage recorder all measure delivery.

**Presence at execution time, not build effort, orders the three surfaces**
- **Affected dimensions:** Change Economics, Mechanisation Potential, Context Economy.
- **Evidence:** six bare-relative script invocations, all in the two workflows whose target is this repository. The path-presentation module exists because the server's filesystem is routinely not the agent's. Seal verification covers the session file only, so a tool can write the planning folder without a new trust boundary. Eighteen registrations sit in two files in one uniform pattern, so a tool's body is the small part of its cost.

## Corrections and Recommendations

Sequenced by cost against saving, and by what unblocks what. Every definition-only edit belongs in one corpus landing, because the ceremony is fixed per landing rather than per edit.

### Immediate

Zero or near-zero build, no definition landing. Each one makes the rest safer or measurable, so take all seven before anything below.

- **Wire the delivery-cost gate into continuous integration and re-baseline it** (RED-01) — one step, one re-record, against a resident regression.
- **Fix the reported eager-delivery spend** (CTX-08) — three lines, and do it first so the fixture the gate compares against is complete.
- **Add a workflow-version comparison to the resume path** (ECO-04) — the smallest change here with the largest effect on the safety of every definition edit below.
- **Run the running-session census before any definition landing** (ECO-04) — one command against a script that already exists.
- **Re-measure the batch bound, then decide it** (ECO-06) — two benchmark runs, on the cheapest lever in the report.
- **Fix the two defective script-invocation sites** (ECO-02) — a precondition for holding that file up as a pattern.
- **Compare the binding triage's corpus stamp to the corpus** (ECO-08, RED-10) — report rather than fail.

### Short-term

Server-side delivery changes: roughly 340 lines between them, no definition migration, and the bulk of the measured saving.

- **Bundle steps whose gate is not provably false** (TOP-01, TOP-08) — take this first. It is the largest saving with no correctness risk, the same clause also stops loop bodies re-fetching, and its result de-risks everything after it.
- **Make block deduplication response-local and unconditional** (CTX-02).
- **Hoist group rules to a sibling block on the bundled-step path** (CTX-02) — it also shrinks whatever the deduplication leaves.
- **Deliver the invariant worker bundle once per agent context** (CTX-01) — the ledger keys already exist; one condition gates them.
- **Qualify resource identifiers against the technique's own workflow** (CTX-07) — correctness, not tokens.
- **Make resource containment anchor-aware** (CTX-05).
- **Add per-entry ledger keys for rules and inherited items** (CTX-03) — measure the cost of a larger sealed ledger first.
- **Report the batch reading at the activity boundary** (TOP-05).
- **Add an optional activity identifier to the technique fetch** (TOP-11) — backward compatible.
- **Retire the eager-delivery character budget, keep the activity cap** (CTX-08) — the opportunity to not build. Gate the deletion on a small-window floor.

### Structural

New capability, a new trust boundary, or a decision that must be taken first. Every definition edit here belongs in the one corpus landing.

- **Give a worker an address for the guards** (ECO-01) — everything invocation-based is blocked on this.
- **Make the artifact mint atomic, then bind the delivered artifact into the status synchronisation** (MECH-05, MECH-02) — in that order, because the wrong instance path otherwise lands in an index link.
- **Implement the status policy as one operation returning a diff** (MECH-04, ECO-09) — the only mechanisation saving the delivery gate can resolve.
- **Make the completion flag reachable and the validation activity honest** (RED-03, RED-02) — the first is one edit; the second is new capability rather than deletion.
- **Fix the four ordering defects and merge the interleaved gates** (TOP-06, TOP-07) — plus one guard extension that would have caught the first defect mechanically. State the friction being traded: three gates on an irreversible push is a defensible safety design.
- **Park the review wait instead of spinning it** (TOP-03) — one activity split into two, against the largest wall-clock item in the topology.
- **Batch the per-iteration loop gates and hoist the certain ones** (TOP-02) — the corpus already hand-rolls the escape in one place.
- **Complete the branch-prefix table and give the prefix a producer** (MECH-03) — producer first, or the new row joins four that also never resolve.
- **Build the definition-reachability guard, then prune** (RED-04, RED-09) — pruning without the guard is a one-off and the ratchet restarts.
- **Stop letting declaration count as production in the binding guard** (RED-05) — four named exemptions, each with a stated reason.
- **Check unanchored relative links, with a declared template exclusion** (RED-08) — the exclusion list is the design problem.
- **Split artifact conformance at the detect-and-correct seam, and script the change-surface join** (MECH-09, MECH-08).
- **Finish the planning-folder link check** (MECH-07) — three guard edits, then the ref-relative capability.
- **State the invocation convention and guard it** (MECH-01, ECO-10) — only after an address exists and the exemplar is fixed, with the triage backlog inside the build.
- **Assert the review-mode contradiction** (MECH-06) — last among the definition edits, on the largest blast radius in the set.
- **Cut the delivery-mechanics prose, gate conditional resources structurally, and retire the forwarders** (CTX-06, CTX-04, CTX-09) — the first is strictly gated on the server-side delivery changes.
- **Prune the provably dead step bodies from the delivered payload** (TOP-04) — last in the delivery programme. It is the only change there whose failure mode is silent, and also its smallest saving, so dropping it costs about 18% of that programme's value.
- **Make fan-out visible, cap session history, move terminal cleanup off the terminal activity** (TOP-10, RED-10, RED-07) — each needs a decision before code: what a fan-out instance is to the batch bound, what a truncated history must still answer, and whether an abandoned run's worktree is garbage or work someone intends to resume.
- **Do the low-value tail inside the same landing** (MECH-10, MECH-11, MECH-12) — near-zero marginal cost batched, and not to be gated on a benchmark that cannot resolve them.

One alternative was considered and rejected: making a gate-delimited segment the delivery and dispatch unit rather than the activity. Its one real benefit is splitting the two heaviest activities, which gate-aware bundling and pruning deliver at a fraction of the cost. Its price is worker continuity across a gate — the code the worker read, the artifacts it drafted, its model of the codebase — priced at two to four times what collapsing delivered content saves.
