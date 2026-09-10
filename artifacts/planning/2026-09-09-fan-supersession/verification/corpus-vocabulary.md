# The corpus fan-out vocabulary — verified

**Refutation pass.** I reproduced all 26 constructs from the repository — every path, line number, binding count and reference sweep in the candidate set checks out, which is unusual and worth saying. The finder's measurements are sound: 15 dispatch-workers bindings across 7 files, 7 gather-results bindings, 26 activity-level scatter-gather declarations, zero borrows of `meta/activities/patterns/` into any workflow's `activities:` list, zero YAML bindings of spawn-concurrent or invoke-as-tool. I re-derived the unexecutability chain independently (orchestrator-conduct.md:14, workflow-orchestrator.md:35, spawn-agent.md:44-46, dispatch-workers.md:29-30) and it holds, including the finder's sharpest original contribution: dispatch-workers has NO executable branch from an activity step, because its sequential branch is spawn-agent rather than the in-context loop, so the delivery plan's tier-four instruction to keep the operation with "its in-activity sequential contract stated positively" has no contract to state.

What the verdicts got wrong is cost, in one repeated way and three specific ones.

The repeated error is ordering. Five REMOVE verdicts (dispatch-workers, the scatter-gather parallel mode, dispatch_concurrency, compose-worker-briefs, patterns/README.md) treat constructs with live callers as same-change deletions. src/tools/workflow-tools.ts:1212-1216 resolves every step's `technique:` ref through `composeActivityTechnique` at get_activity time, and deriveArtifactContract (:122-145) reads step technique outputs — so deleting dispatch-workers.md breaks activity DELIVERY for three graph-reachable client activities, two of them `required: true`. check-all-refs.ts walks only flat `techniques[]` lists, so the guard suite would not even catch it. Ten of the fifteen bindings sit in sites delivery-plan.md:267 puts explicitly out of the staged plan, and the finder's own candidate 23 votes to keep them. You cannot remove the operation while deprecating its callers.

The three specific errors are more interesting than the ordering.

**invoke-as-tool is not a finding.** The fan does not serve agent-as-tool — a graph edge dispatches a full activity with exits, artifacts and bag writes, whereas this operation returns only `tool_result` and discards the transcript. The design mentions it nowhere in either planning document. And the finder's own cited evidence refutes it: binding-fidelity-triage.json:5 states the repo's policy that "having no consumer inside the corpus is the expected state of a library, not a broken seam." REMOVE → KEEP.

**effort_cap is the design's own construct.** README:2074 calls it "the authored upstream half of the width bound" — the design assigns the collection-length cap at the source and the fan's ceiling at the destination to different quantities. That is precisely the question the finder posed and left open. DEPRECATE → KEEP.

**Two prohibitions are irreducible.** depth-1-only's second paragraph and challenge.md:27 both read as stale mode-selection vocabulary and are not: "parallel scatter is available only where the dispatch primitive is — hoist a pass there" is the design's own cited sanction (README:1202, :1357) and acquires a mechanism rather than losing a subject, and challenge.md:27 is the one sentence telling a worker which scatter mode is available to *it*, which the fan does not change because the fan lives at the orchestrator. Both REMOVE → KEEP; each needs one phrase amended, not deletion.

Three smaller corrections. spawn-concurrent.md:40's "sequential fallback via spawn-agent remains valid" is not stale — dispatch-activity.md:55 applies spawn-agent, so a chain of plain graph edges *is* that fallback, and it becomes more true after the change; the finder's one proposed edit to a KEEP is withdrawn. gather-results.md:44 names synthesise-results as the owner of combination, which the finder's caller count for synthesise-results missed and which the design's joins contradict by binding workflow-local combines — one extra edit in the operation the fan promotes. And plan-research-questions is charged under `duplicate-shared-capability`, whose detect clause at anti-patterns.md:1439 requires "a NON-META technique's Protocol"; both operations in the pair are meta ops in one group, so the family does not reach them.

One tension the sweep should surface rather than resolve. delivery-plan.md:51 has `scatter-gather.md` GAIN "the third scatter mode over one gather contract" in stage 4 — the design plans a three-mode file, where mode 2 has never been executable from any of its 7 call sites. Candidates 2 and 3 are therefore arguments against the design's own stage 4, not consequences of it. That is legitimate under "prefer removing the thing that needs a prohibition," but it is a proposal to change the plan and should be raised as one. Relatedly: retiring the pattern activities falsifies the `pattern-library-seed` rationale (binding-fidelity-triage.json:7) behind both of its suppressions, which needs re-justifying rather than merely surviving — a blast-radius item no candidate carried.

Net: 4 verdicts survive at REMOVE-or-stronger strength as filed (01-orchestrator-workers at REMOVE; the three client sites, synthesise-results and classify-request at DEPRECATE), 5 KEEPs upheld, 4 REMOVEs became KEEPs or held as KEEPs against the finder, and 11 REMOVEs became DEPRECATEs. The single most load-bearing correction is that the plan-and-execute KEEP is right for exactly the reasons stated and I re-derived all three — it binds no dispatch, its forEach accumulates across iterations (execute-plan-step.md:46), and it holds a hard gate a fan branch may never reach — plus a fourth discriminator the finder found and I confirmed by measuring all 26 declaration sites: it is the one pattern activity that does not declare scatter-gather at all.

A verdict of REMOVE means the fan does this job now and leaving the construct means two paths do one job. DEPRECATE means it keeps a caller for the moment. KEEP means it looked superseded and is not — those are the entries a confident implementer would delete by mistake.

## Survived refutation

| Construct | Verdict | Confidence |
|---|---|---|
| workflows/meta/techniques/orchestration-patterns/dispatch-workers.md — the whole operation | DEPRECATE | CONFIRMED |
| workflows/meta/techniques/scatter-gather.md — the parallel scatter mode (Protocol step 1 parallel bullet at :14, step 2 parallel bullet at :17) | DEPRECATE | CONFIRMED |
| workflows/meta/techniques/scatter-gather.md — rule `one-gather-contract-two-scatter-modes` (:22-24) | DEPRECATE | CONFIRMED |
| workflows/meta/techniques/scatter-gather.md — rule `parallelism-is-optimisation` (:38-40) and its two Honor back-references | DEPRECATE | CONFIRMED |
| `dispatch_concurrency` — the concurrency setting, declared at orchestration-patterns/TECHNIQUE.md:16-18 and dispatch-workers.md:16-18 | DEPRECATE | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/compose-worker-briefs.md | DEPRECATE | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/invoke-as-tool.md | KEEP | CONFIRMED |
| workflows/meta/activities/patterns/01-orchestrator-workers.yaml | REMOVE | CONFIRMED |
| workflows/meta/activities/patterns/02-supervisor.yaml | DEPRECATE | CONFIRMED |
| workflows/meta/activities/patterns/04-isolated-fan-out.yaml | DEPRECATE | CONFIRMED |
| workflows/meta/activities/patterns/05-lead-researcher.yaml | DEPRECATE | CONFIRMED |
| workflows/meta/activities/patterns/03-plan-and-execute.yaml, and the operations plan-steps / execute-plan-step / replan | KEEP | CONFIRMED |
| workflows/meta/activities/patterns/README.md | DEPRECATE | CONFIRMED |
| workflows/meta/techniques/harness-compat/spawn-agent.md — the second paragraph of rule `depth-1-only` (:46) | KEEP | CONFIRMED |
| workflows/work-package/techniques/analyse-challenge/challenge.md — the scatter bullet's mode-selection clause (:27) | KEEP | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md — the group input `isolation_mode`, and the rules `isolation-mode-write-boundary` and `workers-see-briefs-only` | DEPRECATE | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md — the group input `effort_cap` (:24-26) | KEEP | CONFIRMED |
| workflows/workflow-design/resources/schema-construct-inventory.md — the routing rows for fan-out | DEPRECATE | CONFIRMED |
| workflows/meta/techniques/harness-compat/spawn-concurrent.md, the four harness `concurrent` rule slices, and resolve-harness-operation's `concurrent` operation_kind | KEEP | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/gather-results.md | KEEP | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/decompose-work-units.md | KEEP | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/assess-research-gaps.md | KEEP | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/plan-research-questions.md | KEEP | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/synthesise-results.md | DEPRECATE | CONFIRMED |
| workflows/meta/techniques/orchestration-patterns/classify-request.md | DEPRECATE | CONFIRMED |
| The three client dispatch sites: cicd-pipeline-security-audit/activities/03-primary-scan.yaml, substrate-node-security-audit/activities/02-reconnaissance.yaml, substrate-node-security-audit/activities/03-primary-audit.yaml | DEPRECATE | CONFIRMED |

### DEPRECATE — workflows/meta/techniques/orchestration-patterns/dispatch-workers.md — the whole operation

**Why the fan takes it.** The fan relocates concurrent dispatch to the layer that holds the primitive. I reproduced the unexecutability chain end to end and it is stronger than the delivery plan admits: orchestrator-conduct.md:14 (no-domain-work) says orchestrators never execute activity steps, workflow-orchestrator.md:35 repeats it, and spawn-agent.md:44-46 denies a spawned worker the dispatch primitive. Both of this operation's branches need that primitive — mode 1 applies spawn-agent (dispatch-workers.md:29), mode 2 spawn-concurrent (:30) — so the delivery plan's tier-four instruction to keep it with 'its in-activity sequential contract stated positively' has no contract to state. Note the contrast the finder drew correctly: scatter-gather's SEQUENTIAL mode is an in-context forEach with no agent at all, which is why a worker can run it; dispatch-workers' sequential mode is spawn-agent, which a worker cannot.

**Evidence.** 15 bindings across 7 files, independently re-measured with `rg -n 'orchestration-patterns::[a-z-]+' --glob '*.yaml'`: cicd-pipeline-security-audit/activities/03-primary-scan.yaml:27,50,56,62; substrate-node-security-audit/activities/02-reconnaissance.yaml:37,49; substrate-node-security-audit/activities/03-primary-audit.yaml:48,75,81,87; meta/activities/patterns/01:43, 02:48, 04:47, 05:47,76. Exactly as claimed. The four composer operations closing with a dispatch-workers bullet also reproduce (compose-scanner-briefs.md:22, compose-verification-brief.md:22, compose-merge-brief.md:22, compose-roster-briefs.md:22); a fifth composer, dispatch-scanners::compose-gap-briefs, does NOT carry that bullet. Design README:1202 says dispatch-workers is 'left alone'; delivery-plan.md:306 retires only its parallel selection.

**Blast radius.** Wider than stated in one decisive respect the finder missed: src/tools/workflow-tools.ts:1212-1216 resolves EVERY step's `technique:` ref through `composeActivityTechnique` at get_activity time, and deriveArtifactContract (workflow-tools.ts:122-145) reads step technique outputs to synthesise the activity's artifact contract. Deleting dispatch-workers.md therefore breaks activity DELIVERY for cicd-pipeline-security-audit/activities/03-primary-scan.yaml (`required: true`, graph-reachable at workflow.yaml:31-32) and substrate-node-security-audit/activities/02-reconnaissance.yaml (`required: true`) and 03-primary-audit.yaml (both reachable at workflow.yaml:66-71). check-all-refs.ts only walks flat `techniques[]` lists (scripts/check-all-refs.ts:20,52), so it would NOT catch this — the failure lands at run time, not in the guard suite. Otherwise as stated: canon at schema-construct-inventory.md rows 38/39/42, anti-patterns.md:1439, design-principles.md:87, substrate-node-security-audit/techniques/README.md:15,65,66.

**If left alone.** Two operations claim concurrent dispatch and the one four canon surfaces route an author to cannot run from where they say to bind it. Every step binding it is a protocol a worker reads and cannot perform — an instruction reaching a role that cannot act on it.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE. Ten of the fifteen bindings are in two shipping audit workflows whose migration delivery-plan.md:267 puts explicitly out of the staged plan, and get_activity resolves step-level technique refs, so the file cannot be deleted while those sites stand — the removal is gated on tier one, not co-schedulable with the fan. The finder's substantive correction to the delivery plan survives intact and I strengthened it: there is no in-activity sequential contract to state positively, because the sequential branch is spawn-agent, not the in-context loop.

### DEPRECATE — workflows/meta/techniques/scatter-gather.md — the parallel scatter mode (Protocol step 1 parallel bullet at :14, step 2 parallel bullet at :17)

**Why the fan takes it.** In-activity fan-out relocated to the routing layer, with each branch gaining a real activity identity. The deadness measurement reproduces exactly: I counted 26 activity-level `- scatter-gather` declarations, and ran `rg -c 'kind: loop'` across all of them. All 19 non-dispatch declarers carry at least one loop step. Of the 7 that bind dispatch-workers, six carry no loop at all and the seventh (05-lead-researcher.yaml:60) has one `while` whose body binds dispatch again. So the parallel bullet is the only mode those seven can be using, and none of them can run it.

**Evidence.** scatter-gather.md:14 and :17 are the two bullets, read in full. Loop counts, measured: work-package 02/04/05/06/07/08/15, prism 01/02/03/05, prism-audit 02, prism-evaluate 02/05, midnight-system-review 03, work-packages 04/07, workflow-design 03/06 — every one returns 1 or more. cicd 03-primary-scan, substrate 02-reconnaissance, substrate 03-primary-audit, meta patterns 01/02/04 return zero.

**Blast radius.** As stated, plus one thing the finder did not weigh: delivery-plan.md:51 has this same file GAIN 'the third scatter mode over one gather contract' in stage 4. The design therefore plans a three-mode file, not a two-mode one, so removing mode 2 here is a change to the design's own plan rather than an implication of it. Also: the three live client activities declare scatter-gather at activity level and carry no loop step, so stripping the parallel bullet leaves their declared strategy technique with no applicable mode until tier one migrates them.

**If left alone.** The corpus keeps two ways to open several workers over a collection and the older one is unreachable from every site it can be written at, while parallelism-is-optimisation points an author at it as the optimisation to reach for.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE, on the same coupling as dispatch-workers: three of the seven users are live shipping activities that tier one has not touched. I also surfaced the tension the finder left implicit — the delivery plan adds a third mode to this file rather than retiring the second, so this candidate is an argument against the design's stage 4, not a consequence of it. That is worth saying out loud, because it is the one place in this sweep where the repo principle and the delivery plan disagree.

### DEPRECATE — workflows/meta/techniques/scatter-gather.md — rule `one-gather-contract-two-scatter-modes` (:22-24)

**Why the fan takes it.** Only the rule's final sentence is at issue. The equivalence claim — 'Parallel mode is sequential mode plus concurrency and isolation; sequential mode is the `concurrency = 1` case of parallel mode' — cannot be extended to a graph fan: DestinationSchema refuses fewer than two members, so a fan has no concurrency-1 case, and the design states the discontinuity outright (README:387: 'There is no continuation test, no early exit, no nesting, no body'). The rule's name also becomes false the moment a third mode lands.

**Evidence.** scatter-gather.md:22-24 read in full. Zero external citations reproduced: `rg -n one-gather-contract-two-scatter-modes` over the whole repo returns exactly one hit, its own heading. DestinationSchema's `.min(2, 'a fan names at least two members…')` is at design README:604-607.

**Blast radius.** Narrower than 'the whole rule'. The rule's first two sentences — one gather contract, a mode-independent combine step — are precisely what the design extends: delivery-plan.md:51 gives this file 'the third scatter mode over one gather contract', and design README:2072 adds `a-join-gathers-the-container-not-an-index`, which binds the join's gather to the SAME ordered-keyed-collection contract this rule asserts. Removing the rule wholesale removes the framing the third mode is written to hang on. What must go is the equivalence sentence and the rule's name; the gather-contract claim is load-bearing.

**If left alone.** A claim that cannot hold of the fan sits in a strategy technique 26 activities declare, and it is the sentence that would license describing a graph fan as the concurrency-N case of an in-context loop.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE and the claim narrowed from the whole rule to its third sentence plus its name. The finder's own text conceded the rule 'licenses' the design's third-mode framing but then treated that as a reason to remove it; the gather-contract half is the part the design actually depends on, and deleting it would break something the design relies on.

### DEPRECATE — workflows/meta/techniques/scatter-gather.md — rule `parallelism-is-optimisation` (:38-40) and its two Honor back-references

**Why the fan takes it.** The cost framing is backwards on the design's own arithmetic. README §3: 'A fan pays a whole further delivery for every branch past the first, so it costs more tokens than the sequential walk it replaces… That is correctness and latency, not efficiency.' Calling concurrency an 'optimisation' inverts that. And the parenthetical mode selector — '(the `concurrency = 1` case)' — dies with dispatch_concurrency.

**Evidence.** scatter-gather.md:38-40; back-references at harness-compat/spawn-concurrent.md:38-40 and orchestration-patterns/TECHNIQUE.md:60-62. Three occurrences total, reproduced by `rg -n parallelism-is-optimisation` over the whole repo.

**Blast radius.** Two files, not three. orchestration-patterns/TECHNIQUE.md:62 ('a `{dispatch_concurrency}` of 1 remains correct') goes with dispatch_concurrency, as claimed. But spawn-concurrent.md:40 — 'sequential fallback via spawn-agent remains valid' — is NOT stale, and the finder read it wrong. dispatch-activity.md:55 applies harness-compat::spawn-agent, so spawn-agent is the orchestrator's own sequential dispatch primitive, and a chain of plain graph edges dispatched one at a time IS a sequential fallback via spawn-agent. The design's own alternative to fanning — write a chain rather than a fan — is exactly that sentence. It becomes more true after the change, not less.

**If left alone.** A cost claim the design measured as backwards sits where an author decides whether to fan.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE and one of the two Honor back-references removed from the finding. The rule's practical advice ('where genuine parallel fan-out is not needed, sequential is the correct default') is strengthened by the design's cost arithmetic, not falsified — so this is a rewording of the framing and the parenthetical, not a deletion of three files' worth of rule. The finder's claim that spawn-concurrent.md:40 'names a fallback in a sibling operation that also cannot run from an activity' is false: spawn-agent runs at the orchestrator, in dispatch-activity, on every dispatch in the corpus.

### DEPRECATE — `dispatch_concurrency` — the concurrency setting, declared at orchestration-patterns/TECHNIQUE.md:16-18 and dispatch-workers.md:16-18

**Why the fan takes it.** A destination's authored form says how many workers open — one id opens one, a list of N opens N, an instance fan opens one per element. A numeric mode selector on a dispatch operation has nothing left to select, and InstanceFanSchema.maxInstances caps rather than chooses, with the design giving the bound one home (README:72).

**Evidence.** Reproduced with `rg -n dispatch_concurrency` over the whole repo, 11 lines: declarations at TECHNIQUE.md:16 and dispatch-workers.md:16; the two protocol branches at dispatch-workers.md:29,30; the Honor at TECHNIQUE.md:62; three activity reads at 01:7, 04:7, 05:7; two bindings at 02-supervisor.yaml:50 (literal `1`) and cicd .../03-primary-scan.yaml:29 (`dispatch_concurrency: scanners_assigned`); prose at patterns/README.md:58.

**Blast radius.** As stated. The load-bearing correction is the cicd binding: 03-primary-scan.yaml is `required: true` (line 14) and graph-reachable (cicd workflow.yaml:31-32), and binds this input by name at line 29. Removing the input declaration while that binding stands makes a step bind an input its operation does not declare — a binding-fidelity finding, and the site is in a shipping workflow tier one has not migrated.

**If left alone.** A second width authority sits on an operation, able to disagree with the destination form and with maxInstances, against the design's 'the width bound has one home'. patterns/README.md:58 keeps telling authors to set it above 1 to get fan-out, which has never produced fan-out from where it is bound.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE. The finder's own candidate 23 marks the cicd site DEPRECATE — kept for now — which is inconsistent with removing the input that site binds. The setting goes with tier one, in the same change as the binding, not before it.

### DEPRECATE — workflows/meta/techniques/orchestration-patterns/compose-worker-briefs.md

**Why the fan takes it.** Its whole product is dispatch-workers' input, and the fan composes branch prompts elsewhere — through workflow-engine::compose-prompt, with the per-instance work unit arriving as a server-computed one-value projection bound at the name the destination declares. The design says the brief-composition step is 'displaced' (README:2074) and delivery-plan.md:259 repeats it: 'the brief-composition step is displaced, the brief travelling as the projection'.

**Evidence.** 5 bindings, reproduced: 01-orchestrator-workers.yaml:40, 02-supervisor.yaml:44, 04-isolated-fan-out.yaml:42, 05-lead-researcher.yaml:44 and :73. Read in full: compose-worker-briefs.md:38 ends 'Do not dispatch', and :37 reads `{isolation_mode}`, an input it does not declare itself (it comes from the group contract at TECHNIQUE.md:20-22).

**Blast radius.** As stated, plus the design's own position against removal, which the finder did not quote: README:2074 says the operation 'survives for fan-out inside one worker.' That is an explicit keep. It is also, on the finder's own chain, an unexecutable home — fan-out inside one worker requires spawn-agent, which spawn-agent.md:44-46 denies a worker — so the design's stated reason for keeping it does not hold. That makes this a schedule with a stated defect in the design, not a same-change removal.

**If left alone.** A prompt composer with no dispatcher to feed, still named in two canon bind recipes, and still keeping isolation_mode and workers-see-briefs-only alive on the group contract.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE. The design explicitly retains this operation, so removing it in the fan's change contradicts a stated design position — and it holds 5 live bindings in files tier four, not the fan's own stages, retires. I did confirm the finder's underlying point, which is that the design's justification for the keep names a path that cannot execute; that belongs in the record as a defect to resolve, not as licence to delete now.

### KEEP — workflows/meta/techniques/orchestration-patterns/invoke-as-tool.md

**Why the fan takes it.** It does not. The finder said as much and then removed it anyway on an audit-adjacency argument, and that argument fails three separate tests. First, the design never mentions it: `rg -n 'invoke-as-tool|agent-as-tool|agent as tool'` over the entire planning folder returns nothing. Second, the fan does not serve agent-as-tool — a graph edge dispatches a full activity with its own exits, artifacts commit, usage entry and bag writes, whereas this operation returns only `tool_result` and explicitly discards the intermediate transcript (invoke-as-tool.md:38). Those are different constructs, and inventory row 43 is the only home for the intent. Third, its zero-binding state is not evidence of death by this repo's own standard.

**Evidence.** Zero YAML bindings reproduced across all of workflows/. Read in full: invoke-as-tool.md:37 applies spawn-agent. The triage entry the finder cited is real (scripts/binding-fidelity-triage.json:266-272, check `dead-output`, verdict harmless) — but its rationale, `shared-op-return-contract` at line 5, states the repo's policy verbatim: 'Library ops are bound ad hoc by any workflow, so having no consumer inside the corpus is the expected state of a library, not a broken seam.' That rationale is shared by roughly forty entries, so it does not go with this file either.

**Blast radius.** Nothing to remove. Its real defect is placement, not existence: patterns/README.md:22 and inventory row 43 route an author to bind it in a local activity step, where no worker can apply spawn-agent. But meta/activities/03-dispatch-client-workflow.yaml is inline-executed by the top-level agent (design README:1202 names it as the one such activity), so the operation is executable in principle at the orchestrator layer — the unexecutability is a property of the canon's recommended bind site, not of the operation.

**If left alone.** A never-bound operation keeps loading and two canon surfaces keep routing authors to an unexecutable bind site. That is worth fixing by moving the recommended bind site, not by deleting the only construct serving the agent-as-tool intent.

**Changed under scrutiny.** REMOVE downgraded to KEEP — the largest correction in this sweep. The fan takes nothing from this operation, so under the stated rubric ('REMOVE — the fan does this job now') it fails the test outright. The finder's own evidence refutes it: the triage entry it cited as proof of deadness is the repo declaring that an unbound library op is the expected state of a library. Removing it would leave the agent-as-tool intent with no construct at all, which no part of the design asks for.

### REMOVE — workflows/meta/activities/patterns/01-orchestrator-workers.yaml

**Why the fan takes it.** The design's verdict is 'Served fully' (delivery-plan.md:259): three graph nodes — source, fan, meeting point — with the gather's binding carrying across unedited and the pattern's home moving 'from a borrowable activity file to an inventory row'. The whole activity is fan-out; nothing in it survives the migration except the decompose operation, which lives in its own file and gains a caller at the fan's source.

**Evidence.** Read in full. Five steps at lines 35-52: decompose (37), compose-briefs (40), dispatch (43, dispatch-workers), gather (47, `expected_ids: work_units`), synthesise (52). Zero consumers reproduced two independent ways. First, `rg -n 'meta/patterns|patterns/0[1-5]-'` over the whole repo returns only patterns/README.md and schema-construct-inventory.md — never a workflow's `activities:` list. Second, src/loaders/workflow-loader.ts:59-94 does one `readdir` and calls `parseActivityFilename(file)` per entry with no descent, so the subdirectory is never loaded into meta's graph. It also declares no `exits:`, which is what delivery-plan.md:259 means by 'a fannable per-unit activity must declare one'.

**Blast radius.** As stated: patterns/README.md rows 17 and 56-58, schema-construct-inventory.md rows 37 and 38. Guard scripts do read the directory deliberately and would measure less — scripts/check-binding-fidelity.ts:443, check-loop-shape.ts:126, check-set-action-values.ts:160 all carry comments recording why they recurse. One blast-radius item the finder missed: scripts/binding-fidelity-triage.json:322-328 suppresses synthesise-results' producerless `synthesis_criteria` under the `pattern-library-seed` rationale, whose text (line 7) reads 'A borrowable pattern activity binds an op whose input the BORROWING workflow seeds — the contract documented in meta/activities/patterns/README.md.' Retire the borrowable pattern activities and that rationale stops being true, so the suppression needs re-justifying rather than merely surviving.

**If left alone.** Canon row 38 keeps routing an author to borrow a pipeline whose middle step silently does nothing, and the same pattern has two homes — a library activity and an inventory row for the fan — which is the coexistence the repo principle forbids.

**Changed under scrutiny.** REMOVE upheld, the only one of the four fan-out pattern activities I left at REMOVE. Zero consumers verified independently by both the reference sweep and the loader's non-recursion; the fan serves it fully; the design names the replacement home. I added the triage-rationale consequence the finder missed.

### DEPRECATE — workflows/meta/activities/patterns/02-supervisor.yaml

**Why the fan takes it.** It does not, and that is the point the finder half-made and then discarded. The design's verdict is 'Served but pointless. The construct it wants is a plain graph edge, executed by the ordinary dispatch operation' (delivery-plan.md:260). A one-element fan is unrepresentable — DestinationSchema refuses a list under two members — so lane selection is served by an activity with one exit per lane and `when` predicates, a construct that predates this design by a long way. The fan's arrival is the occasion for the audit, not the superseding construct.

**Evidence.** Read in full. Steps at lines 39-65; `dispatch` at 48 binding dispatch-workers with `dispatch_concurrency: 1` at line 50 — the corpus's only literal binding of that input, reproduced. Zero consumers, same two measurements as 01. Its `lane_roster` read has no producer and is suppressed at scripts/binding-fidelity-triage.json:315-321 under `pattern-library-seed`.

**Blast radius.** As stated: patterns/README.md rows 18 and 60-62, schema-construct-inventory.md row 39, and the `lane_roster` suppression. Its classify-request step is that operation's only binding in the corpus.

**If left alone.** A five-step unexecutable pipeline stays the canon-recommended way to express 'route to one of N specialists' when one activity with N exits and N graph bindings does it and runs, and it keeps dispatch_concurrency alive with its only literal binding.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE on the rubric's own test. 'REMOVE — the fan does this job now' does not hold here: the fan cannot express a one-member destination, so what supersedes this pattern is a graph edge that already existed. It should still be scheduled out, and tier four names it — but recording it as a fan-driven removal would misattribute the reason, and the reason is what a future reader needs.

### DEPRECATE — workflows/meta/activities/patterns/04-isolated-fan-out.yaml

**Why the fan takes it.** Half of it. Context isolation is what a fan branch structurally is — every branch a fresh context under its own identity — and completeness stops being a thing to validate, because the join 'is entered only on the call that empties the frontier, so no expected id can be missing there' (design README:2070). The design's verdict is 'Partly served' (delivery-plan.md:261). The unserved half is worktree isolation, and the design is explicit that it is unserved rather than migrated: 'A fan's branches share one working tree and one git index, and a commit derives its paths from that tree's status, so no branch can attribute its own change' (README:535), and README:2197 says worktree isolation 'is not served at all'.

**Evidence.** Read in full. Steps 35-62: decompose (38), compose-briefs with `isolation_mode: isolation_mode` (42-44), dispatch (47), gather (51), `require-complete` validate on `gathered_results.completeness` (54-59), synthesise (62). Zero consumers, same two measurements as 01. It is the corpus's only activity-level reader of `isolation_mode` (line 9), reproduced by `rg -n isolation_mode` over the whole repo.

**Blast radius.** As stated: patterns/README.md rows 20 and 68-70, schema-construct-inventory.md row 41. But the group input does not die with it — compose-worker-briefs.md:37 also reads `{isolation_mode}`, and the design keeps that operation (README:2074), so the input keeps a reader in a surviving file.

**If left alone.** Two paths claim isolated fan-out and the runnable one gives only context isolation, so the canon keeps pointing at the unrunnable one for the worktree case without saying the case has no home.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE. Removing this file withdraws the corpus's only expression of worktree-isolated concurrent work, and the design states plainly that a fan cannot provide it. A withdrawal of capability with no successor is a decision to take deliberately, with the loss written down, not a sweep item — and the finder's own text said so ('record it as withdrawn capability, not as migrated') while still voting REMOVE.

### DEPRECATE — workflows/meta/activities/patterns/05-lead-researcher.yaml

**Why the fan takes it.** The design's verdict is 'Served at a stated cost' (delivery-plan.md:262): the initial fan-out becomes a graph instance fan over the questions, and the follow-up round becomes a graph cycle in which the meeting point assesses gaps and routes back to the source, with the container's reset materialisation putting round two in fresh slots.

**Evidence.** Read in full. Eleven orchestration-patterns bindings, the most of any file in the corpus, at lines 41, 44, 47, 51, 56, 59, 73, 76, 80, 85, 88 — two of them dispatch-workers (47, 76), reproduced. The follow-up loop is lines 60-88 with `maxIterations: 3` at line 64. Zero consumers, same two measurements as 01. It is the only binding site of plan-research-questions (41) and assess-research-gaps (59, 88).

**Blast radius.** As stated: patterns/README.md rows 21 and 72-74, schema-construct-inventory.md row 42. The obligation that transfers is real and unmet: `maxIterations: 3` is a schema-declared, loader-enforced ceiling, and a graph cycle has no equivalent declaration — delivery-plan.md:262 says 'the declared iteration ceiling gives way to an authored round counter.' That counter does not exist yet.

**If left alone.** The richest binding site of the vocabulary stays as an eleven-step pipeline whose two dispatch steps cannot run, and canon row 42 keeps recommending it.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE, conditional on one thing being built first. Retiring this activity before a meeting point authors and gates a round counter converts a schema-enforced three-round bound into an unbounded graph cycle. The finder noted the trade and then treated it as free; it is a precondition on the removal, which is what makes this a schedule rather than a deletion.

### KEEP — workflows/meta/activities/patterns/03-plan-and-execute.yaml, and the operations plan-steps / execute-plan-step / replan

**Why the fan takes it.** Nothing about it. I verified all three of the independent reasons and each holds. It binds no dispatch: its four bindings are plan-steps:31, execute-plan-step:59, replan:73, execute-plan-step:84, so every step runs in the caller's own worker context. Its forEach accumulates across iterations: execute-plan-step.md:46 says 'Append `{step_result}` onto `{prior_step_results}` (create the list when absent) — never overwrite a prior step's entry. Downstream loop iterations and replan read the accumulated history', and :44 has iteration N read that history. A fan structurally forbids that — branches land in isolated dense slots and no branch can read a sibling's output. And it holds a hard `plan-confirmed` checkpoint at lines 32-47, which a fan branch may never reach, since a session holds one outstanding question at a time and the orchestrator's turn does not resume until every branch returns (design README:523).

**Evidence.** Read in full. It is also the one pattern activity that does NOT declare scatter-gather at activity level — I re-measured all 26 declaration sites and this file is not among them. delivery-plan.md:306 agrees: 'the plan-and-execute pattern is kept because it binds no dispatch'.

**Blast radius.** Nothing to change in it. It becomes the sole occupant of meta/activities/patterns/, which is why the directory's README is a rewrite rather than a deletion, and why the guard scripts that recurse into the directory (check-binding-fidelity.ts:443, check-loop-shape.ts:126, check-set-action-values.ts:160) keep having something to measure.

**If left alone.** Nothing wrong is left alone. The risk runs the other way: a sweep that took the pattern directory wholesale would remove a working, gate-bearing, cross-iteration-accumulating activity and three executable operations whose contract the fan does not touch.

**Changed under scrutiny.** KEEP upheld unchanged. This is the in-context sequential case the sweep was warned about, and the finder got it right — I re-derived all three reasons rather than accepting them, including the scatter-gather non-declaration, which is the cleanest single discriminator between this file and the four beside it.

### DEPRECATE — workflows/meta/activities/patterns/README.md

**Why the fan takes it.** Four of its five catalog rows lose their subject, and its two framing sentences are the prohibition shape the repo principle names: line 7 partitions dispatch between two paths ('Session-level orchestrator/worker dispatch remains dispatch-activity. These activities cover in-activity fan-out / consolidate only') and line 50 polices the overlap ('do not re-teach Task / spawn-concurrent recipes locally'). Retire the in-activity path and both sentences have nothing left to say.

**Evidence.** Read in full. Catalog rows 15-25; the partition at 7; the concurrency instructions at 40 ('a non-default dispatch concurrency') and 58 ('set `dispatch_concurrency` > 1 for parallel fan-out'); traps at 46-50. Line 5's library-only claim is confirmed at src/loaders/workflow-loader.ts:59-94.

**Blast radius.** Four inbound canon links reproduced — meta/README.md:29 ('Pattern library: see activities/patterns/README.md'), design-principles.md:87, anti-patterns.md:1439, schema-construct-inventory.md rows 37-42 — all of which resolve to this path and would break on deletion. Two triage suppressions cite it by name through the `pattern-library-seed` rationale at scripts/binding-fidelity-triage.json:7, at lines 315-321 (classify-request's lane_roster) and 322-328 (synthesise-results' synthesis_criteria).

**If left alone.** A catalog advertising four unexecutable pipelines, and a consumption protocol whose second step tells authors to re-bind for a dispatch concurrency that no longer selects anything.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE and narrowed from the file to its contents. The file survives: plan-and-execute still lives in the directory, four canon surfaces link this exact path, and delivery-plan.md:306 says 'the pattern directory's README describes only what remains' — describes, not is deleted. What goes is the four fan-out catalog rows, the line 7 partition, the concurrency instructions at 40 and 58, and the third trap. The finder called it 'a rewrite-to-nothing rather than a deletion of the directory' and then filed it as REMOVE anyway.

### KEEP — workflows/meta/techniques/harness-compat/spawn-agent.md — the second paragraph of rule `depth-1-only` (:46)

**Why the fan takes it.** Only one phrase of it. `concurrency = 1` names a mode selector that goes with dispatch_concurrency, and that phrase needs amending. Everything else in the paragraph the design leans on by name rather than retiring.

**Evidence.** spawn-agent.md:46 read in full. The design quotes this paragraph as its own sanction, twice. README:1202: '`depth-1-only` in spawn-agent states the reason and sanctions this placement by name — a spawned agent has no dispatch primitive, parallel scatter is available only where the primitive is, and a pass whose fan-out is worth an orchestrator-owned step should be hoisted there.' README:1357: 'That rule already ends by instructing an author to hoist a pass to the orchestrator when its fan-out is worth an orchestrator-owned step, and offers no construct for doing so. This is that construct.'

**Blast radius.** Two citing sites depend on the paragraph: work-package/techniques/analyse-challenge/challenge.md:27 and schema-construct-inventory.md:44. The second cites only the depth fact. The first cites the mode language, so amending the phrase means rewording that clause too.

**If left alone.** The single phrase `concurrency = 1` keeps a removed mode selector alive in the one file every dispatch operation Honors. That is worth fixing; it is one phrase.

**Changed under scrutiny.** REMOVE downgraded to KEEP. The sentences 'Parallel scatter is available only where the dispatch primitive is — at the orchestrator' and 'Hoist a pass there when its fan-out is worth an orchestrator-owned step' do not go stale when the fan lands — they acquire the mechanism they were missing, which is the design's own account of why it exists. Deleting the paragraph deletes the design's cited justification. The finder's claim that 'every noun in it disappears' is wrong: the orchestrator, the dispatch primitive and the hoist all survive and become concrete.

### KEEP — workflows/work-package/techniques/analyse-challenge/challenge.md — the scatter bullet's mode-selection clause (:27)

**Why the fan takes it.** It does not. The clause tells a reader which mode is available to the context IT is running in, and the fan does not change that answer for a worker — the fan lives at the orchestrator, and this operation's seven bind sites are all activities a worker executes. Removing the clause removes the one sentence stopping a worker from attempting parallel dispatch it cannot perform.

**Evidence.** Read the operation in full. challenge.md:27 is exactly as quoted: 'Dispatch via [scatter-gather]; the mode available to this context follows [depth-1-only]'. Seven bindings reproduced, each paired with `analyse-challenge::combine`: work-package/activities 02:194, 04:154, 05:100, 06:132, 07:91, 08:176, 15:98. All seven declare scatter-gather at activity level and all seven carry loop steps (`rg -c 'kind: loop'` returns 1 to 4 for each), so all seven use the sequential in-context mode. delivery-plan.md:306 keeps this site: tier two is 'the tier the arithmetic disqualifies'.

**Blast radius.** One clause read by seven activities. Its `isolation-then-combine` rule at :42 survives — it is the corpus's own statement of the discipline the fan raises to graph grain (design README:515 cites it by name).

**If left alone.** Nothing wrong is left alone. If depth-1-only's `concurrency = 1` phrasing is amended, this clause's anchor changes wording, so the clause is reworded to name the fact directly — a worker holds no dispatch primitive, so run the sequential scatter — rather than deleted.

**Changed under scrutiny.** REMOVE downgraded to KEEP. The finder read this as 'a prohibition standing in for a choice that no longer exists', but the choice it resolves is not going away: after the fan lands there are genuinely two ways to get per-perspective isolation — this in-context sequential scatter, or a graph fan at the orchestrator — and this clause is what tells a worker which one is its own. That is exactly the distinction the sweep brief warned about: the in-context sequential loop needs no agent and runs anywhere, so the fan does not replace it, and the sentence saying so is load-bearing rather than stale.

### DEPRECATE — workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md — the group input `isolation_mode`, and the rules `isolation-mode-write-boundary` and `workers-see-briefs-only`

**Why the fan takes it.** Context isolation stops being a setting and becomes the construct — a fan branch is a separate worker with a fresh delivery scope. `workers-see-briefs-only` becomes structural for a branch: it is dispatched for one activity, handed one element at one name, and the design says it 'wants to learn nothing about the fan's width' (README:230). `worktree` has no successor: 'A fan's branches share one working tree and one git index' (README:535).

**Evidence.** Read in full. TECHNIQUE.md:20-22 declares isolation_mode; :56-58 is isolation-mode-write-boundary; :64-66 is workers-see-briefs-only. Reproduced by `rg -n isolation_mode` over the whole repo: three readers, not two — 04-isolated-fan-out.yaml:9 (activity read) and :44 (bound into compose-worker-briefs), plus compose-worker-briefs.md:37's worktree clause.

**Blast radius.** Narrower than stated, because one consumer is not a removal candidate. The design keeps compose-worker-briefs (README:2074: 'it survives for fan-out inside one worker'), and that operation reads `{isolation_mode}` at line 37 and is governed by `workers-see-briefs-only`. So both the input and that rule keep a reader in a file the design retains. Otherwise as stated: schema-construct-inventory.md row 41 seeds the input. The group's surviving rules are `no-nested-orchestrators` (:68-70, which is what makes the whole unexecutability finding true) and `prefer-activity-composition` (:72-74).

**If left alone.** Keeping `isolation_mode` implies worktree-isolated concurrency is still expressible somewhere in the corpus, which after this change it is not — and that is the one thing the sweep should state plainly rather than leave a stale input to imply.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE, because the finder's blast radius missed that compose-worker-briefs — which the design explicitly keeps — is a surviving reader of both the input and the briefs rule. They go when it goes, not before.

### KEEP — workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md — the group input `effort_cap` (:24-26)

**Why the fan takes it.** It does not, and the design says so in as many words. README:2074, on the work-unit decomposition operation gaining a caller at the fan's source: 'its effort cap is the authored upstream half of the width bound.' The design treats a cap on the collection's length at the source as the legitimate upstream complement of the destination's width bound, not as a competing authority over one number. That is the exact question the finder posed — 'whether a collection-length cap at the source is a distinct fact from a width cap at the destination' — and the design answers yes.

**Evidence.** TECHNIQUE.md:24-26 read in full. Reproduced by `rg -n effort_cap`: three activity reads (01:8, 04:8, 05:8) and three operations honouring it (decompose-work-units.md:16-18,29; plan-research-questions.md:16-18,29; assess-research-gaps.md:20-22,37). Two of the three honouring operations survive this sweep. The design's own width-bound sentence (README:72) governs how wide a FAN may open, which is a different quantity from how long a decomposition's output is.

**Blast radius.** Nothing to remove. Three activity reads disappear with the pattern activities; the declaration and the three honouring operations stand. What it needs is the one sentence the finder said would settle it if the facts were distinct — that the cap bounds the collection at the source and the fan's ceiling bounds the branches at the destination.

**If left alone.** Nothing wrong is left alone. Removing it would be the error: it is the only authored bound on how much work a decomposition emits, and nothing in the fan replaces it.

**Changed under scrutiny.** DEPRECATE downgraded to KEEP. The finder framed this as three caps governing one number with only two acknowledged; the design acknowledges all three and assigns each a different quantity. The 'second authority over one number' reading does not survive reading README:2074.

### DEPRECATE — workflows/workflow-design/resources/schema-construct-inventory.md — the routing rows for fan-out

**Why the fan takes it.** For four of these intents the answer becomes the graph destination — a list, an instance fan, or a plain edge — and delivery-plan.md:259 says the pattern's home 'moves from a borrowable activity file to an inventory row'. Two rows for one intent, one naming a construct that cannot run from where it says to bind it, is the two-paths-one-job condition.

**Evidence.** Read rows 34-44 in full. Row 38 spells the whole dead chain: 'bind `orchestration-patterns::decompose-work-units` → `compose-worker-briefs` → `dispatch-workers` → `gather-results` → `synthesise-results` as consecutive activity steps'. Row 39 supervisor, row 41 subagent-isolation, row 42 lead-researcher. Row 40 (plan-and-execute) survives, as claimed. Row 44 (hierarchical agents) cites spawn-agent's depth fact and survives on the rule's first paragraph.

**Blast radius.** Four rows, not five. Row 43 ('agent as tool / opaque sub-agent call' → bind invoke-as-tool) does NOT go: the fan does not serve agent-as-tool and the design never mentions it, so removing the row leaves that intent with no formal construct at all. Row 37 does need editing — I confirmed it cites `meta/patterns/01-orchestrator-workers.yaml` as its example of a cross-workflow string ref, and `work-package/08-implement.yaml` is already in the same cell and serves.

**If left alone.** The canon surface an author is required to consult keeps naming, for four fan-out intents, constructs that cannot execute from where it says to bind them, while the construct that can sits one row away. The workflow-canon skill routes definition authors through this file before they draft, so it is the highest-leverage stale claim in the sweep.

**Changed under scrutiny.** REMOVE downgraded to DEPRECATE and the row set narrowed from five to four. Row 43 was swept in on the same over-broad reasoning as invoke-as-tool itself. The downgrade to DEPRECATE follows the rows' subjects: two of the four point at pattern activities I downgraded to DEPRECATE, so the rows go when their targets do.

### KEEP — workflows/meta/techniques/harness-compat/spawn-concurrent.md, the four harness `concurrent` rule slices, and resolve-harness-operation's `concurrent` operation_kind

**Why the fan takes it.** It does not — the fan promotes it. The design leans on three of its properties by name (README:1214): the `concurrent` rule's one-turn emission, foreground-always's blocking-equivalent wait, and this operation's input-order results. It gains its first executable caller.

**Evidence.** Read in full. Zero YAML bindings reproduced across all of workflows/; its sole textual caller today is dispatch-workers.md:30. All four harness files carry a `concurrent` slice — claude-code.md:24, cursor.md:20, cline.md:23, generic.md:23 — and resolve-harness-operation.md:14,24,38 lists `concurrent` among the three operation kinds each harness technique exposes. foreground-always is at harness-compat/TECHNIQUE.md:22-26 and is stated as CRITICAL and blocking-equivalent.

**Blast radius.** Nothing to remove — and one edit fewer than the finder proposed. Its `parallelism-is-optimisation` Honor at :38-40 says 'sequential fallback via spawn-agent remains valid', and that stays true: dispatch-activity.md:55 applies spawn-agent, so spawn-agent is the orchestrator's sequential dispatch primitive and a chain of plain graph edges is precisely the sequential alternative to a fan. substrate-node-security-audit/techniques/README.md:66 does need editing, since it describes this operation as 'Invoked inside meta orchestration-patterns::dispatch-workers'.

**If left alone.** Nothing wrong. The trap is the opposite reading — sweeping spawn-concurrent out as part of an unexecutable vocabulary. Removing it would leave dispatch-fan re-teaching a harness recipe locally, which is duplicate-shared-capability at the exact site the design chose to avoid it.

**Changed under scrutiny.** KEEP upheld, with the finder's one proposed edit withdrawn. Its claim that :40 'names a fallback in a sibling operation that also cannot run from an activity' inverts the fact: spawn-agent runs at the orchestrator, in dispatch-activity, on every dispatch in the corpus, and the fallback the sentence names is the authoring choice the design itself recommends.

### KEEP — workflows/meta/techniques/orchestration-patterns/gather-results.md

**Why the fan takes it.** It does not — this is the half of the vocabulary the fan makes live. An instance fan's join cannot spell its reads, the width being a run-time collection length with no indirection in the placeholder grammar, so it hands the container whole to this operation with the fan's own collection as `expected_ids`. The design binds it that way (README:496-502) and adds one rule for it, `a-join-gathers-the-container-not-an-index` (README:2072).

**Evidence.** Read in full. Its declared input shape at :12-18 is already exactly a branch container — `{id, result}` pairs in input order, an unfilled slot carrying an id and `result: null` at :28. 7 bindings reproduced: cicd 03-primary-scan.yaml:33, 01:47, 02:54, 04:51, 05:51 and :80, substrate 03-primary-audit.yaml:52 — all consuming dispatch-workers output. README:2040: it 'has never had an executing caller'.

**Blast radius.** Wider than one sentence, and the finder missed the second edit. Line 44 reads 'Do not merge item payloads into parent bag scalars — combination is `[synthesise-results](./synthesise-results.md)`'s job', but the design's join binds a workflow-local combine after the gather (research-sweep::combine, review-assumptions::reconcile), never synthesise-results. So this operation names a combine owner the fan's joins will not bind, and that pointer needs amending in the same change. Its `completeness` output becomes structurally constant at a fan's join (README:2070), so 04-isolated-fan-out's require-complete validate needs no successor; `dispatch_manifest` keeps a live reading.

**If left alone.** Nothing wrong, but the sequencing matters: an operation whose entire binding set is retired in one change and whose sole future caller is a construct not yet built reads as dead to any guard counting call sites.

**Changed under scrutiny.** KEEP upheld, blast radius widened. The finder said 'One documentation change'; there are two, and the second is a cross-reference from this operation to synthesise-results, which the finder separately voted to deprecate — leaving the design's promoted join operation pointing at a scheduled-out combine owner.

### KEEP — workflows/meta/techniques/orchestration-patterns/decompose-work-units.md

**Why the fan takes it.** It does not — the fan needs it, unchanged, at a new bind site. README:2074: 'The work-unit decomposition operation gains a caller, unchanged, at the fan's source: its units are id-and-brief records with a stable slug id, which is exactly a fan's collection.'

**Evidence.** Read in full. Its Protocol at :26-31 reads and reasons only — no spawn-agent, no spawn-concurrent, nothing needing a dispatch primitive — so it executes in a worker today. Output contract at :22-24 is an ordered array of `{id, brief, tools_hint?}` with a stable slug id, which matches the design's worked collection shape at README:346. 2 bindings, both in pattern activities: 01:37, 04:38.

**Blast radius.** Both current bindings disappear with the pattern activities, leaving it unbound until a fan source binds it. schema-construct-inventory.md row 38 names it as step one of the dead chain, so it needs a mention on the new fan row or it reads as orphaned.

**If left alone.** Nothing wrong. The risk is losing it in the sweep: it is the piece of the vocabulary that always ran and that the fan actively needs, sitting in a technique group most of whose members are being retired.

**Changed under scrutiny.** KEEP upheld unchanged. I verified the Protocol requires no dispatch primitive and the output contract matches the design's collection shape, rather than accepting the finder's assertion.

### KEEP — workflows/meta/techniques/orchestration-patterns/assess-research-gaps.md

**Why the fan takes it.** It does not — only its enclosure changes. The design converts the follow-up round into a graph cycle in which the meeting point assesses gaps and routes back to the source (delivery-plan.md:262), so the judgement becomes a meeting-point step whose output feeds an exit predicate and whose re-emitted work units become the second fan's collection.

**Evidence.** Read in full. Protocol at :34-38 reads and compares only; it binds no dispatch. 2 bindings, both in 05-lead-researcher.yaml:59 and :88, driving the `while has_research_gaps` loop at lines 60-69.

**Blast radius.** Both bindings go with 05-lead-researcher, leaving it unbound until a meeting point binds it. One obligation transfers: `maxIterations: 3` at 05-lead-researcher.yaml:64 is a schema-declared ceiling, and a graph cycle carries no such declaration, so the round bound becomes an authored counter the meeting point must write and gate on.

**If left alone.** Nothing wrong, but the enforcement gap is the thing to carry forward: retiring the loop without authoring the round counter turns a bounded follow-up into an unbounded graph cycle.

**Changed under scrutiny.** KEEP upheld unchanged, and the enforcement obligation it names is the reason I downgraded 05-lead-researcher from REMOVE to DEPRECATE — the two findings are one coupled change, and the finder filed them at different strengths.

### KEEP — workflows/meta/techniques/orchestration-patterns/plan-research-questions.md

**Why the fan takes it.** It does not. Its job is to WRITE the collection a fan runs over, which sits at the fan's source and is untouched — the same position the design assigns decompose-work-units unchanged (README:2074). The fold-into-its-sibling case rests on `duplicate-shared-capability`, and that anti-pattern does not reach this pair.

**Evidence.** Read in full alongside its sibling. Output shapes do coincide — plan-research-questions.md:24 and decompose-work-units.md:24 both emit an ordered array of `{id, brief, tools_hint?}` — but the Protocols differ substantively: :29-31 derives breadth-first research questions and demands 'briefs that demand structured findings (claims + sources), not open-ended essays', against decompose's 'minimum set of independent subtasks that cover the goal without overlap'. 1 binding, 05-lead-researcher.yaml:41.

**Blast radius.** One binding, disappearing with 05-lead-researcher; schema-construct-inventory.md row 42 names it. Nothing else.

**If left alone.** Nothing wrong is left alone. Its Outputs section does describe its product by the mechanism it fed — 'suitable for parallel fan-out' — and that phrase is worth restating as the collection contract it now is.

**Changed under scrutiny.** DEPRECATE downgraded to KEEP. The finder's cited authority refutes it: anti-patterns.md:1439 detects `duplicate-shared-capability` only where 'A NON-META technique's Protocol embeds a harness recipe… for a capability that already exists as a meta or cross-workflow shared op'. Both operations here are meta ops in the same group, so the family does not apply by its own detect clause. And the unbinding is collateral from the pattern retirement, which the repo's own library policy (binding-fidelity-triage.json:5) treats as the expected state of a library op rather than a defect.

### DEPRECATE — workflows/meta/techniques/orchestration-patterns/synthesise-results.md

**Why the fan takes it.** The fan makes combination structural — 'a join that needs a combined value binds a step that gathers it' — but in both of the design's worked examples the step bound after the gather is a workflow-local combine (research-sweep::combine at README:505-510, review-assumptions::reconcile at README:481-490), never this generic operation. So the fan takes the shape and leaves this operation without the callers that gave it purpose.

**Evidence.** Read in full. It binds no dispatch — :33-38 reads `{gathered_results.items}`, reconciles, and emits, with an explicit 'do not re-dispatch workers from this op' — so it executes today. 5 bindings across 4 files, reproduced: 01:52, 02:65, 04:62, 05:56 and :85, all in pattern activities. Its `synthesis_criteria` input has no producer anywhere and is suppressed at scripts/binding-fidelity-triage.json:322-328 under `pattern-library-seed`.

**Blast radius.** Wider than the finder measured, and in a direction that argues for keeping it. gather-results.md:44 — in the operation the design promotes to every fan's join — names this operation as the owner of combination: 'combination is synthesise-results's job'. That is a textual caller in a surviving, design-promoted file, which the finder's caller count missed. Also: retiring the pattern activities falsifies the `pattern-library-seed` rationale for this suppression, since that rationale (binding-fidelity-triage.json:7) turns on a borrowable pattern activity existing to be seeded by a borrower.

**If left alone.** After the patterns go it is an unbound definition that still loads, still carries a suppression whose rationale no longer holds, and still appears in three canon bind recipes that no longer exist.

**Changed under scrutiny.** DEPRECATE upheld, blast radius widened and the decision reframed. The finder said the decision is 'whether any join actually binds it'; the sharper question is what gather-results.md:44 says instead, because that line currently makes this operation the canonical combine for the very operation the fan promotes. Either a join binds it and it stays, or that pointer is rewritten to name the workflow-local combine — and the pointer edit lands whichever way the decision goes.

### DEPRECATE — workflows/meta/techniques/orchestration-patterns/classify-request.md

**Why the fan takes it.** Not the fan, and the finder was right to be exact about that. What serves 'route to one of N specialists' is an activity with one exit per lane and `when` predicates plus graph bindings, a construct that long predates this design. What is genuinely obsolete is its output SHAPE: a one-element `work_units` array exists only to feed compose → dispatch → gather, and lane selection at graph grain is an exit, not an array.

**Evidence.** Read in full. 1 binding in the whole corpus, 02-supervisor.yaml:41. Its `work_units` output at :26-28 is explicitly the dispatch-shaped one-element array ('The selected lane as a one-element ordered array… `id` = `{lane_id}`'). Its `lane_roster` input has no producer and is suppressed at scripts/binding-fidelity-triage.json:315-321. delivery-plan.md:260 on the pattern: 'Served but pointless. The construct it wants is a plain graph edge, executed by the ordinary dispatch operation.'

**Blast radius.** One binding, disappearing with 02-supervisor; schema-construct-inventory.md row 39 names it; the `lane_roster` suppression, whose `pattern-library-seed` rationale stops holding once no borrowable pattern activity binds the op. The `lane_id` / `classification_rationale` half of the contract (:20-24) is the part worth preserving for roster-driven routing — as an activity writing those two values and declaring one exit per lane, with the `work_units` output dropped.

**If left alone.** A single-binding operation loses its only caller and keeps loading, with a dispatch-shaped output feeding nothing and a suppression whose stated rationale no longer applies.

**Changed under scrutiny.** DEPRECATE upheld, narrowed. Only the `work_units` output is obsoleted, and the construct obsoleting it is a plain graph edge rather than the fan — so this is scheduled out on the same reasoning as 02-supervisor, not as a fan consequence. I also added that the triage suppression needs re-justifying rather than merely surviving.

### DEPRECATE — The three client dispatch sites: cicd-pipeline-security-audit/activities/03-primary-scan.yaml, substrate-node-security-audit/activities/02-reconnaissance.yaml, substrate-node-security-audit/activities/03-primary-audit.yaml

**Why the fan takes it.** Each at a different strength, per delivery-plan.md:263-265. The pipeline scan is 'Served, and the readiest of the fifteen' — it already parameterises width at run time, so migration deletes `scanners_assigned` rather than adding a variable. The substrate primary batch is 'Partly served' as three chained nodes. Substrate reconnaissance is 'Not served, and does not want to be': two sequential single-agent dispatches with a file check between them, whose fix is two graph edges.

**Evidence.** All three read in full. cicd 03-primary-scan.yaml: `required: true` (line 14), dispatch bindings at 27, 50, 56, 62, gather at 33 with `expected_ids: worker_briefs`, width from `dispatch_concurrency: scanners_assigned` at 29, reachable at cicd workflow.yaml:31-32 (`primary-scan.scan-verified: report-generation`). substrate 02-reconnaissance.yaml: dispatches at 37 and 49 with a `verify-output-files` check between them at 38-43 — the shape the design calls a chain of two activities. substrate 03-primary-audit.yaml: dispatches at 48, 75, 81, 87, gather at 52. Both substrate activities reachable at substrate workflow.yaml:66-71.

**Blast radius.** As stated, with one correction and one addition. Correction: substrate 02-reconnaissance.yaml is ALSO `required: true` (line 23), not only the cicd site — so two of the three are required activities in shipping workflows, which raises the cost of a partial migration. Addition: four local composer operations close with a bullet naming dispatch-workers as the next step (compose-scanner-briefs.md:22, compose-verification-brief.md:22, compose-merge-brief.md:22, compose-roster-briefs.md:22); a fifth composer, dispatch-scanners::compose-gap-briefs, does not, so the count of four is right. substrate-node-security-audit/techniques/README.md:15,65,66 documents the chain.

**If left alone.** Three live, graph-reachable activities — two of them required — whose central steps have never been able to execute, in workflows that presently claim to run per-submodule scanners concurrently.

**Changed under scrutiny.** DEPRECATE upheld. These sites are the reason five other REMOVE verdicts in this candidate set had to come down: they are the surviving callers of dispatch-workers, gather-results, dispatch_concurrency and the scatter-gather parallel mode, and get_activity resolves their step bindings through composeActivityTechnique at delivery time. I corrected the required-activity count from one to two.

