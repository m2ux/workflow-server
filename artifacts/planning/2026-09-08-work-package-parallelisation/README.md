# Work-package concurrency: what can run side by side, what that saves, and what to fix instead

**Date:** 2026-09-08
**Corpus:** `workflows` at `5f92dc06a47cc27221653fa330f7adfb0dc4b409`. **Server:** `main` at `295c0681f506efe180f8e88e84fe9a50dfc82054`.
**Supersedes for work-package:** [2026-09-03 concurrency demand inventory](../2026-09-03-concurrency-demand-inventory/work-package-stages.md), re-derived 133 corpus commits later.

The plan this document reaches is an investigation output. Nothing here changes a definition.

---

## 1. Summary

The work-package workflow runs fifteen activities in sequence, and each activity runs its own steps in sequence. This investigation walked every step, every loop body and every technique in it, looking for work that is genuinely independent — two or more units that read nothing the other writes, write nothing the other writes, and hold no conversation with the operator in between — and asked what it would take to run those units at the same time.

Thirty-six catalogue entries reduce to thirty distinct sites once the duplicate per-slice views are merged. Of those thirty:

- **One** site has a fan worth real wall-clock: the three review passes in `post-impl-review`. Three technique definitions of 105, 107 and 110 lines, each a full reasoning pass over the same change surface with its own tool work, run once per run.
- **Seven** sites are the adversarial-challenge fan that the corpus already authored deliberately, at two or three units each, all inside convergence loops that stop as soon as nothing further resolves.
- **Ten** are two-unit pairs whose combined work is shorter than the fixed cost of handing a unit to a fresh agent.
- **One** is already concurrent and needs nothing: the four cargo checks in `validate`.
- The remaining **eleven** are foreclosed by something structural — an operator question inside the span, one shared working tree, one append-ordered file, or a chain where each step reads what the one before it wrote.

The load-bearing finding is not about any candidate. **Nothing in this workflow runs in parallel today, and the reason is the execution model rather than the definitions.** Every activity step runs inside an agent that the server spawned to run that one activity, and a spawned agent holds no primitive for spawning further agents. So a step cannot hand out work; only the orchestrator can, and the orchestrator is forbidden to execute steps.

The natural conclusion — "build a way for an activity to declare a fan-out step the orchestrator executes on its behalf" — was priced. It costs a fifth step kind in a closed schema, its mirror in the TypeScript schema, the six source files that switch on step kind, at least four of thirty-six guards, two canon resources, and a retraction of the rule that orchestrators never execute activity steps. That is a large change to the invariant the whole execution model rests on, bought for one site's wall clock. **It is not recommended, and the plan's first stage records that decision rather than starting the work.**

What the investigation found instead is a larger, cheaper prize with no concurrency in it at all: eleven correctness and single-home defects that pay on their own terms, two of them live bugs; eleven technique definitions that fuse independent produce paths and are owed a split on design grounds regardless; and one step that can simply be deleted, saving a render and a network round trip every run. Plus one concurrency shape that needs no new machinery, because the corpus already uses it — several tool invocations issued together inside a single agent turn and awaited, which is how the cargo validation suite already runs four checks at once.

## 2. What happens today

### How a run is executed

A work-package run is driven by an orchestrating agent. That agent does not do the work itself: for each activity in turn, it spawns a worker agent, hands it the activity's steps and the current variable bag — the named values the workflow carries between steps and activities — and waits. The worker runs the steps, writes its artifacts, and returns. The orchestrator then advances to the next activity and spawns the next worker. Workers are batched so that one agent can carry a run of consecutive activities in one context, which is why the fixed start-up cost of a fresh agent is paid once per run rather than once per activity.

Two rules in the canon fix this shape. Orchestrators never execute activity steps or produce domain artifacts — they delegate. And there is exactly one level of delegation: an orchestrator dispatches workers, and a worker dispatches none of its own. The harness technique that spawns an agent states the consequence directly: a spawned agent has no dispatch primitive, so running work one unit at a time is that agent's contract rather than a shortfall against it. This is what "depth-1" names — one level of agent nesting, and no more.

The effect on every candidate in this survey is the same. **Every step this investigation examined runs inside a worker.** A worker cannot hand three challenge perspectives to three agents, because it has nothing to hand them to. So a candidate being independent is necessary but nowhere near sufficient: the question that decides it is where the dispatch would have to live for it actually to run concurrently, and for in-activity work the honest answer today is "nowhere".

### One premise that turned out to be wrong

A recurring claim across the survey held that a technique's outputs do not reach the variable bag until the activity boundary, so any fan whose result feeds a later step in the same activity requires splitting the activity in two. That is a misreading. The guard it cites is about user-facing message text: the server receives an activity's outputs on the call that advances to the next activity, so a message rendered before that boundary interpolates a value the server's copy of the bag does not yet hold. Step-to-step binding is a different mechanism and works within an activity — the binding technique lands each bound operation's declared outputs in the bag and lets a later step read them by name or by dotted path. The corpus proves it seven times over: the challenge step's findings pass straight to the adjacent combine step inside one activity, at seven sites.

This matters because it removes the stated reason for splitting activities 02 through 15 — and those splits were the most expensive item in the survey. They also carry two costs nobody had named. Splitting `design-philosophy` at the point the survey proposed makes a checkpoint the new activity's first step, which a registered guard rejects outright. And every one of activities 02 through 15 is borrowed wholesale by the `remediate-vuln` workflow, so each split forces graph re-binding in a second workflow plus two of its READMEs, or that workflow refuses to load.

### What "scatter-gather" already means here

The corpus has a named primitive for fanning work out and folding it back: scatter the work units, gather their results into an ordered keyed collection, then hand that collection to a single combine operation. Its own rules say the two scatter modes — one unit at a time, or all at once — share one contract, and that running one unit at a time is the correct default wherever genuine parallel fan-out is not needed. Seven work-package activities declare this primitive, and seven sites use it as authored. The definitions are not defective; they are running the sequential case, which the primitive explicitly blesses.

### The one place concurrency already happens

`validate` runs four cargo checks — build check, lint, test, format check — by starting four concurrent foreground shell invocations against the same build scope and waiting for all four before composing the result. No agent is spawned, so the depth-1 rule does not bind. The group's own rule blesses the shape and names the boundary: several foreground shells at once is within the rule; backgrounding any of them is not. There is also a declared fallback for hosts below the resource floor, where the three compiling checks run one after another.

This is the shape any in-activity concurrency in this workflow should take.

## 3. The enabling stage: where parallel work can run

Four options were considered. They are ranked by what they cost, cheapest first.

### Option A — concurrency inside one worker's turn (recommended)

The worker keeps the steps it has and issues their tool work concurrently within its own turn, gathering the results into one structured envelope, exactly as the cargo suite already does. Nothing is spawned, so nothing needs a dispatch primitive.

**Cost:** prose in the Protocol of the techniques concerned, plus a declared structured gather and a declared sequential fallback. Zero schema surface, zero new files, zero new bag variables, zero guard entries, no invariant retracted.

**Reach:** the sites whose units are tool-bound rather than reasoning-bound. That is the post-impl review trio (each pass runs its own graph queries, impact walks, coverage map or analysis chain), the three prior-feedback list calls in `start-work-package`, and the two stealth verifications in `submit-for-review` — though the latter two are too small to be worth the prose.

**Limitation, stated plainly:** this does not make three reasoning passes think at once. It overlaps their I/O. For the post-impl trio that is the larger part of each pass's elapsed time; for the challenge perspectives it is none of it.

### Option B — a fan-out step the orchestrator executes on the activity's behalf

An activity declares a step of a new kind; the orchestrator recognises it and runs the fan.

**Cost, counted:** the activity schema carries exactly four step kinds and closes each one to a fixed field set, so this is a fifth kind plus its TypeScript mirror. Six source files switch on step kind — validation, activity-variable analysis, binding provenance, the fragment resolver, the workflow tools, the loader. At least four of thirty-six guards read step kinds. Two canon resources — the schema construct inventory and the anti-pattern catalog — describe the construct set. That is roughly fifteen files before a single site migrates.

**The blocking cost is not files.** An orchestrator running an activity's step *is* an orchestrator executing an activity step, which the `no-domain-work` rule forbids. This option requires retracting that rule.

**Recommendation: decline.** Weakening the invariant the execution model rests on, to buy wall-clock at one site, is the worst available trade. The design canon's own guidance points the same way — the simplest implementation that fully meets current requirements, and no speculative construct.

### Option C — let the orchestrator hold more than one worker at once

The meta orchestrator's activity loop is a `while` over a single scalar naming the current activity, with a single scalar holding the live worker's identity, gating two mutually exclusive branches. One worker, by construction. Making it hold several is a change to meta's dispatch loop, not to work-package.

**Cost:** the loop shape, the worker-identity handling, and the session-file questions in the next subsection. **Recommendation: decline for now, and record it as meta's question with a meta owner.** No work-package change reaches concurrency through it, so nothing in this plan should be parked behind it.

### Option D — split activities so the orchestrator runs the halves concurrently

Does not work even before it is priced: the activity loop advances one activity at a time. And splitting a borrowed activity forces graph re-binding in `remediate-vuln`. **Reject.**

### What breaks if two workers share one session

Any option that puts two agents in one session has to answer five things. Option A answers all five for free, because there is still one agent, one bag and one gate slot. Options B and C must answer each separately.

| Hazard | Why it bites | Option A | Options B and C |
|---|---|---|---|
| **One outstanding operator question per session** | The session file holds `activeCheckpoint` as a single object, and every content-delivery tool is gated until it resolves. Two units cannot both be waiting on a person. | No second agent, so no second gate. | Must forbid a gate inside any fanned unit, and prove it structurally. |
| **Per-instance bag clobber** | Two instances landing the same output name race and overwrite. The scatter-gather primitive already forbids auto-binding instance outputs by name. | One bag, one writer at a time. | Must keep per-unit outputs isolated until the combine step, and hoist any shared resolution ahead of the fan. |
| **One working tree and one git index** | The naming contract fixes one feature worktree per work package; commit operations assert the branch and stage into that one index. | No concurrent checkout. | Per-unit worktree isolation exists in the pattern library, and fixes only this hazard. |
| **Append-ordered artifacts** | The provenance log's contract is that a row is added as its task completes and never rewritten, so the record reads in the order the work happened. Order is a declared property, not a file accident. | Serial appends. | Must route all appends through one combine writer. |
| **Single-writer files** | The planning README has an orchestrator-owned progress table and a technique-owned overview section; the deferrals register gives an item one row for its whole life. | Unchanged. | Must partition or serialise every shared file. |

**Recommendation for stage 1: adopt Option A, decline Option B, record Option C as meta's question, reject Option D.** Then correct the one place in the corpus that currently claims more than the execution model grants: the pattern-library README says its activities cover in-activity fan-out only and tells a consumer to set the dispatch concurrency above one for parallel fan-out, while the harness technique says parallel scatter is available only at the orchestrator. Those two homes disagree at HEAD, and no proposal can cite a home that contradicts itself.

## 4. The candidates

Class is what the survey found about the site itself: **independent** (no defect in the way), **blocked** (independent once a named prerequisite is fixed), **foreclosed** (structurally cannot fan), **already concurrent**. Disposition is what this plan does with it.

| Site | Units | Class | What it saves | Where dispatch must live | Disposition |
|---|---|---|---|---|---|
| `start-work-package` — three prior-feedback list calls fused in one technique | 3 read-only API calls | blocked | Roughly two-thirds of a short latency-bound ingest; seconds | One worker turn, after the technique split | Split for compliance; overlap the calls in-turn |
| `start-work-package` — branch probe beside PR probe | 2 trivial | independent | Negative — smaller than an agent's start-up cost | n/a | Drop |
| `start-work-package` — four platform-exclusive step pairs | 1 arm ever fires | foreclosed | None | n/a | Drop |
| `design-philosophy` — define beside classify | 2 reasoning | independent | Negative; the survey itself notes there is no I/O to overlap | n/a | Drop; keep the missing-write fix |
| `requirements-elicitation` — collect assumptions beside create document | 2 | blocked | Negative | n/a | Drop; keep the undeclared-write fix |
| `requirements-elicitation`, `research`, `implementation-analysis` — per-item interview loops | 1 gate per iteration | foreclosed | None | n/a | Drop; batch the gate in `requirements-elicitation` |
| `research` — knowledge-base sweep beside web sweep | Ordered by construction | foreclosed | None | n/a | Drop; split for contract correctness |
| `implementation-analysis` — effectiveness beside baselines, fused in one technique | 2 long, evenly matched | blocked | About a quarter of a long step | One worker turn, after the split | Split for compliance; no fan |
| `implementation-analysis` — baseline-state worktree passes | 2, one worktree | foreclosed | None | n/a | Split for compliance; no fan |
| Seven challenge sites (`design-philosophy`, `research`, `implementation-analysis`, `plan-prepare`, `assumptions-review`, `implement`, `codebase-comprehension`) | 3 units at six sites, 2 at the seventh | blocked | See prose below | Orchestrator only | Leave as authored |
| Three convergence-loop bodies taken whole | Read-after-write chain | foreclosed | None | n/a | Drop |
| `plan-prepare` — plan, test plan, overview | Ordered | foreclosed | None | n/a | Drop; keep the unbound-input fix |
| `assumptions-review` — record then register deferred | Ordered | foreclosed | None | n/a | Drop |
| `assumptions-review` — tracker posts | Mutually exclusive | foreclosed | None | n/a | Drop |
| `implement` — task cycle per plan task | 1 per iteration | foreclosed | None — five independent serialisers | n/a | Drop |
| `lean-coding-audit` — over-engineering scan beside debt harvest | 2, badly unequal | blocked | Ceiling is the shorter unit: one grep, one write, one boolean | n/a | Drop the fan; fix the borrow |
| `lean-coding-audit` — the gated third pass | 1, ordered three ways | foreclosed | None | n/a | Delete the step |
| **`post-impl-review` — three review passes** | **3 long, comparable** | **blocked** | **The whole prize in this survey** | **One worker turn** | **Overlap the tool work in-turn, after timing** |
| `post-impl-review` — fix-cycle passes | 2, unequal (the pair is the longer) | blocked | Well under half a fix round, at most three rounds | One worker turn | Defer behind the trio |
| `post-impl-review` — per-block interview loop | 1 gate per iteration | foreclosed | None | n/a | Drop |
| `validate` — four cargo checks | 4 | already concurrent | Banked | n/a — shells in the caller's turn | Leave; do not wrap |
| `strategic-review` — conformance sweep beside changes fragment | 2 short | independent | Small | n/a | Drop the fan; retire the double writer |
| `submit-for-review` — findings classification beside artifact publish | 2, unequal in kind | blocked | Hides two network round trips behind one judgement | One worker turn | Drop; keep the unbound-input fix |
| `submit-for-review` — two stealth verifications | 2 trivial | independent | Negative | n/a | Drop |
| `submit-for-review` — render, verify, mark ready | Ordered on one remote resource | foreclosed | None from parallelism | n/a | Delete the redundant render |
| `submit-for-review` — await-review loop | 1 gate | foreclosed | None | n/a | Drop |
| `complete` — retrospective beside next-package selection | 2, very unequal | blocked | Hides only the shorter unit | n/a | Drop |
| `complete` — deferred-item raise loop | 1 gate per row | foreclosed | None as authored | n/a | Batch the gate |
| `codebase-comprehension` — challenge perspectives | 2 | blocked | Half of one pass | Part of the seven-site family | Leave; fix the bind defect |

### The three review passes in `post-impl-review`

This is the only site where concurrency buys something a reader would notice. Three passes read the same change surface and reason over it independently: a code review, a test-suite review, and a structural analysis. Their declared contracts are disjoint — each writes its own findings report and its own method note, and none declares another's output as an input. Their combine step already sits adjacent. There is no operator question between them. Each definition is 105, 107 and 110 lines of protocol, and each executes real tool work: graph change-detection with per-symbol impact walks, a diff-coverage map plus a suite run, and a full structural analysis chain.

Two things must be true before any fan here means anything. First, the fan's width is conditional, not fixed: the structural pass runs inline only on a non-complex run, and a complex run dispatches a sub-workflow instead. Second — and this is a prerequisite rather than an incidental defect — the combine cannot currently tell the passes apart. The classification technique declares optional per-pass findings inputs that drive its two routing flags, and neither bind site supplies them; both bind only the single diff-review report. The wiring a gather needs is exactly the wiring that is missing, and the same loop that gates the fix cycle reads those two flags. **That is a live defect and it pays on its own.**

Recommendation: fix the wiring, then time the trio. If the tool work is the larger share of elapsed time, overlap it inside the one worker turn using the cargo-suite shape. Do not dispatch agents for it.

### The seven challenge sites

Six activities fan a concern set across three adversarial perspectives — a stakeholder-gap lens, a rejected-paths lens and an evidence-strength lens — and the seventh fans two, a pedagogy lens and rejected paths. The definitions are already correct for a fan: each unit receives only the concern set plus its perspective name and never another unit's findings; per-perspective outputs stay isolated until the combine; the single declared output is an ordered collection keyed by perspective; the combine is a separate bound step with an explicit output remap at every site. The technique names its own mode selection and defers to the depth-1 rule.

Two reasons not to hoist this. First, sizing. Every one of the seven sits inside a loop that continues only while resolvable concerns remain — a convergence loop, which stops when nothing further resolves. The safety bound is ten iterations at three sites, but ten iterations of a convergence loop would itself be the defect, not the expected case. Sized at realistic iteration counts the aggregate drops several-fold and falls below the single post-impl site it was said to dominate. Second, shape. The fan sits inside the loop body, so hoisting it to an orchestrator step turns every loop iteration into an activity boundary — seven sites times N iterations of split, plus four new step binds per site, plus the enabler. And each self-contained worker brief re-carries the concern set, so per-unit token cost rises as wall-clock falls.

The definitions stay as authored. What does get fixed at these sites is free and unrelated to concurrency: one roster constant with six identical copies and no authoritative home; one classification value interpolated by a gate message but absent from its activity's writes; and one bind in `codebase-comprehension` that challenges the settled-facts corpus artifact when the authoritative open-question set lives in the comprehension log, so the combine appends open items into the document whose own rule forbids them.

### The three prior-feedback list calls

The cleanest ratio anywhere in the workflow, and the one place where the compliance fix and the fan are the same edit. One technique's first section applies three separate GitHub list operations — issue comments, pull-request reviews, pull-request review comments — retaining three distinct locals, and its second section applies a fourth to disposition check failures. Four work invocations inside one operation, which the canon names as orchestration hidden in a technique. Splitting it turns one bind into five activity steps, three of which are independent read-only API calls.

The absolute saving is seconds. Take the split for the canon reason, place the steps below the repository-root resolution so the repository path is produced before it is spent — a live ordering defect today, since the technique spends that path three steps before its only producer and the variable declares no default — and overlap the three calls in-turn if it is convenient. Do not dispatch agents for seconds of API latency.

## 5. Techniques to split

Eleven technique definitions fuse work that belongs in separate operations. Two bands: splits that pay for compliance alone, and splits whose fan value depends on the enabler — which, since the enabler is declined, means their fan value is zero and their compliance value is the whole return. Every one is stated with that honesty below.

### Band 1 — pays for compliance alone, no fan follows

**`work-package/techniques/manage-git/detect-merge-strategy.md` — retire, do not split.** The entire protocol is one line applying the shared `github-cli-protocol::view-repo` operation, and its sole declared output is that operation's own output name. It is a facade over a shared capability. Delete the file and bind `github-cli-protocol::view-repo` at the single call site in `01-start-work-package.yaml` with an input deviation supplying the component repository path. Downstream readers consume the bag name, not this operation, so they are unaffected. Canon: **duplicate-shared-capability**, **Prefer Shared Capability**, **Prefer Removing the Thing That Needs a Prohibition**. Verified: one bind, no external referencer, no README row names it.

**`work-package/techniques/research/research.md` — split into two operations.** One protocol produces two collections from two different source systems and declares no inputs at all while spending two of them. Yield `search-knowledge-base` (inputs: requirements, problem statement; output: knowledge-base findings) and `research-web` (inputs: knowledge-base findings, requirements, problem statement; output: web findings), plus a direct bind of the knowledge-base index load that the protocol currently applies inline. Three steps replace one bind in `04-research.yaml`, and both output names get declared in that activity's contract, which today declares neither. Canon: **numbered-protocol-phases**, **pass-orchestration-in-technique**, **Atomic Techniques; Compose at Activities**, **technique-inputs-declared**. **No fan follows** — the web pass is defined as gap-filling against the knowledge-base pass and cross-references its findings, so the two sweeps are ordered by construction.

**`work-package/techniques/research/synthesize.md` — split into two operations.** Two sections produce five outputs across two unrelated produce paths; the second derives a provenance scope from the two source collections rather than from the first section's outputs. Yield `synthesize` (findings synthesis, applicable patterns, synthesis assumptions) and `scope-provenance` (context scope, context-scope-uncertain flag). Canon: **numbered-protocol-phases**, **Atomic Techniques; Compose at Activities**, **contract-not-procedure**. Note honestly: the survey counted a message-binding fix as part of this split's return. That guard is unregistered and its findings are corpus-wide and pre-existing, so **do not count it here** — it is its own sweep.

**`work-package/techniques/review-baseline-state.md` — split into three local operations plus two direct binds.** Four sections, three outputs, two work invocations, and raw git commands inline. Yield `checkout-baseline` (output: base commit), `document-expected-changes` (inputs: requirements, base commit; output: expected changes) and `capture-authored-surface` (inputs: base branch, target path; output: `authored_surface`, with the merge-in guard folded in as its second phase), and bind the two GitHub operations directly. Two corrections to the survey's specification: name the third output as an identifier rather than a prose phrase, and **do not declare the changed-files set as an input of the operation that produces it**. Canon: **numbered-protocol-phases**, **pass-orchestration-in-technique**, **Bind Sibling Operations as Steps**, **io-id-shape**. **No fan follows** — the three local passes serialise on the single feature worktree, and the ordering is a stated invariant: the expected-changes reference is derived from requirements independently of what the change actually did.

**`work-package/techniques/design-philosophy/classify.md` — split off one work invocation.** The classification phase applies a complexity-signal operation inline. Strip the invocation from the protocol and bind `gitnexus-operations::complexity-signal` as its own step in `02-design-philosophy.yaml`, gated on the target symbol existing. Canon: **pass-orchestration-in-technique**, **Bind Sibling Operations as Steps**. **Correct the survey's rationale before writing this:** the claim that the complexity signal is dead because its input has no producer is wrong. That identifier is one of three ambient context identifiers the engine recognises as supplied by the caller at runtime rather than produced inside a workflow, and the technique correctly marks it optional. Having no in-workflow producer is the designed state. **Do not mint a resolver for it.**

**`work-package/techniques/requirements-elicitation/create-document.md` — remove two undeclared writes.** The protocol directs a write into the assumptions log and the deferrals register while declaring one output and one artifact. Both writes already have owners the workflow binds elsewhere. **Remove both offending clauses in one edit** — not only the register clause the survey named, but also the line above it that records the assumptions into the requirements document itself, which contradicts the link-only parenthetical below it. What remains is the statement that the document carries link-only slots for both. Canon: **One Authoritative Home**, **canonical-fact-home**, **Prefer Removing the Thing That Needs a Prohibition**.

**`work-package/techniques/update-pr/render.md` and its container contract — narrow the container, split the publish.** The render protocol fuses template selection, body composition, link-URL derivation from four git invocations, and a publish to the GitHub API performed by applying a meta operation inline. Only the composition is this technique's own capability. Separately, the container declares two body-conformance outputs that the loader merges into all five member operations, so four of them declare a product only one produces. Move both outputs onto `verify-body.md`. Canon: **pass-orchestration-in-technique**, **output-without-destination**. **Cross-workflow obligation:** the `midnight-system-review` workflow binds one of this container's operations, so narrowing the container changes that operation's composed contract as that workflow sees it. Name its publish activity and its two READMEs in the change manifest.

### Band 2 — larger splits, still compliance-only

**`work-package/techniques/implementation-analysis/analyze.md` — the largest monolith in the survey.** Six numbered sections, four declared outputs, no declared inputs, five work invocations. Yield four operations: `locate-implementation`, `evaluate-effectiveness`, `establish-baselines`, `identify-gaps`, and bind the five graph operations directly. Canon: **no-monolith-masking-steps** (the split remedy), **numbered-protocol-phases**, **pass-orchestration-in-technique**, **technique-inputs-declared**.

Two corrections. Section 6 links gaps to measurable success criteria from the requirements and does **not** read the baselines — the survey inferred that dependency, so declare `identify-gaps` on requirements and effectiveness only. And the survey's precondition "promote the four names to the activity's contract" is a guard hazard: the activity-variables guard requires every declared write to have a reader, and it passes today. **Promote only the names a later activity reads.** Values consumed by a sibling step inside the same activity stay as the operations' declared outputs, which step-to-step binding already carries.

**`work-package/techniques/review-existing-feedback.md` — split into one local operation plus four direct binds.** As described in section 4. The local operation that remains is `triage-prior-feedback` (inputs: the three comment collections and the base branch; outputs: the triage artifact and the rating cap). Canon: **pass-orchestration-in-technique**, **Bind Sibling Operations as Steps**, **Atomic Techniques; Compose at Activities**.

One blocker the survey raised should be **struck**: it claimed three parallel list calls would each land the same repository-coordinate names and clobber each other. The coordinate resolution happens inside each leaf operation's own protocol, so those names are the applied operation's outputs, not the bound operation's, and they never land in the caller's bag. The real precondition is the ordering fix the entry already names.

**`work-package/techniques/review-assumptions/reconcile.md` — split into three operations, not four.** Five protocol phases fuse four independent produce paths plus one that belongs to a different artifact entirely: a resolvability classification over the whole open set, an independent per-assumption code investigation, two phases that fold results into the log and set the convergence flags, and a fifth that augments the comprehension corpus from a second optional input, gated by a sentence of prose rather than a condition.

Yield: `classify-resolvability` (emits the ordered work list plus the immediate-convergence flags for the two early-exit cases); a per-assumption analysis operation (input: one assumption plus the target path; output: that assumption's finding with its evidence, resolution and any newly surfaced assumption — writing nothing shared); and `fold-analysis` (input: the gathered findings; sole writer of the log and the three flags).

Three corrections to the survey's specification, all load-bearing:

- **Drop the proposed fourth operation.** `codebase-comprehension::deep-dive` already owns recording a deep dive in the comprehension log and promoting its settled outcomes to the corpus artifact, and `revise-questions` owns the open-question table. Strip phase 5 from the protocol and let the activity bind the existing operation, gated on the comprehension artifact. Canon: **duplicate-shared-capability**; and **no-monolith-masking-steps** orders its remedies reuse-before-split.
- **Do not widen the container with the no-interaction rule.** The container merges its rules into every member, and two of those members are bound by the `workflow-design` workflow, so widening delivers the rule to another workflow's agents. Leave it on the operation whose unattended cadence it constrains. Canon: **rule-binds-beyond-its-operation**.
- **Rename the per-unit input.** The name the survey chose is already the interview-loop item at two activities. And settle the standing `analyse` phantom first: three files reference an operation by that name and no such file exists, so a second identifier beginning with it compounds a reference without provenance. Canon: **no-invented-naming**, **Convention Over Invention**.

Also: the scorecard the fold phase emits "as a bindable pass result" has no declared output entry. That is **technique-outputs-declared**, not output-without-destination — the latter's detection starts from a declared output.

**And do not insert the orchestration pipeline.** The survey proposed replacing the reconcile step with a decompose / brief / dispatch / gather run. It buys nothing at this commit, and its stated justification misread the decompose operation's outputs section as its inputs — that operation emits work units; it does not require an array input.

**`work-package/techniques/task-completion-review.md` — split into two operations.** The soundest split in the set. Phase 1 verifies symbol provenance and produces both declared outputs; phase 2 assesses the change against a Rust-substrate review resource and produces nothing declared, landing only in the worker's report. Phase 2 is also project-coupled in a way phase 1 is not, while the fused operation is bound unconditionally — its sibling test step is properly gated on project type. Yield `verify-symbol-provenance` (staying inside the settle loop whose continue condition reads exactly its output) and `assess-task-quality` (a sibling step outside that loop, gated on project type). Retire the rule directing assumptions to the log: the collect operation owns that duty and the activity binds it as the very next step. Canon: **no-monolith-masking-steps**, **technique-outputs-declared**, **single-rule-authority**, **Encode Constraints as Structure**.

Two corrections. The real cost of the fusion is not that phase 2 sits behind a checkpoint — the gate is conditional and follows both phases. It is that the settle loop re-runs the quality pass up to three times for a loop only phase 1 drives. And **settle the second operation's output destination before writing the split**: the artifact route needs a guide-map row in the workflow's resources README, a guide carrying a template and rules, and a declared audience — two guards with hard zero and no baseline. The cheaper route is to interpolate the findings identifier from the activity as a message.

## 6. The generic pattern: no new file is warranted

**Finding: a new scatter-gather pattern activity should not be written.** The pattern library already holds five borrowable fan-out pipelines, and the two that match every candidate in this survey are `01-orchestrator-workers.yaml` (decompose, compose briefs, dispatch, gather, synthesise) and `04-isolated-fan-out.yaml` (the same shape with an isolation mode and a completeness gate before synthesis). Their README already prescribes the consumption route: borrow the activity into a client workflow's activity list, or copy the step pipeline into a local activity and bind the same operations with input overrides. Writing a sixth file that says the same thing is **duplicate-shared-capability** and **Prefer Shared Capability**, and the design canon puts new techniques last.

If Option B or C ever lands for an unrelated reason, the borrow needs no new definition — only overrides. For the one site worth migrating, the local activity step run is:

```yaml
  - kind: technique
    id: decompose-review-passes
    technique:
      name: orchestration-patterns::decompose-work-units
      inputs:
        planning_context: review_pass_roster
  - kind: technique
    id: compose-pass-briefs
    technique: orchestration-patterns::compose-worker-briefs
  - kind: technique
    id: dispatch-review-passes
    technique:
      name: orchestration-patterns::dispatch-workers
      inputs:
        dispatch_concurrency: 3
  - kind: technique
    id: gather-review-passes
    technique:
      name: orchestration-patterns::gather-results
      inputs:
        expected_ids: work_units
```

That is inert today: the dispatch operation resolves a concurrency above one to a concurrent-spawn operation, which needs the dispatch primitive a worker does not have. **State that in the plan rather than shipping the steps.**

Two edits to the pattern library are owed now, and neither is a new activity.

**Edit 1 — reconcile the library's claim with the execution model.** `meta/activities/patterns/README.md` states that these activities cover in-activity fan-out only, and its note on the orchestrator-workers pattern tells a consumer to set the dispatch concurrency above one for parallel fan-out. The harness technique states that parallel scatter is available only at the orchestrator. Retire the in-activity framing from the README and let the harness technique remain the single home for where parallel scatter runs, per **One Authoritative Home**. Any future proposal that cites the library depends on this being settled first.

**Edit 2 — give the challenge roster one home.** The identical three-perspective roster appears as a JSON string inside a bind-site literal at six activities; the seventh carries a two-perspective variant. The container contract already declares the roster as an input, with no default. Add a default there and delete all six literals — implicit same-name binding then supplies it with no deviation at all. Canon: **bag-value-as-literal**, **One Authoritative Home**. The edit to `work-package/techniques/analyse-challenge/TECHNIQUE.md` is exactly this, inserted under the existing roster input:

```markdown
### challenge_perspectives

List of adversarial perspectives (or lens names) for the challenge pass.

#### default

`["stakeholder-gap", "rejected-paths", "evidence-strength"]`
```

The seventh site's two-perspective roster is the one genuine deviation and stays as a bind-site override. **Do not extend the activity schema to admit array-typed technique inputs** — the string-only constraint is the signal that a bind-site literal is the wrong home for a roster, not an obstacle to route around. Canon: **schema-is-constraint**.

## 7. What was ruled out

This section is load-bearing. Each entry below was examined and refuted with structural evidence, and recording the reason is what stops the next pass paying to rediscover it.

**Adjacent steps that are exclusive, not parallel.** Four step pairs in `start-work-package` and one in `assumptions-review` look like fans to a mechanical adjacency scan. Each pair carries complementary guards on one variable — one issue platform against the other, review mode against not — so exactly one arm ever fires. Mutually exclusive guard branches are an explicit do-not-flag under **no-duplicate-technique-steps**. The worktree pair additionally shares one side effect: both binds fetch and add a worktree in the same component repository.

**Every span containing an operator question.** Five loops hold a checkpoint in the body: the domain-question loop in `requirements-elicitation`, the per-assumption decision loops in `research` and `implementation-analysis`, the per-block interview loop in `post-impl-review`, and the deferred-item raise loop in `complete`. The session file holds one outstanding checkpoint as a single object, and every content-delivery tool is gated until it resolves, so two iterations cannot both be waiting. This is presence of operator dialogue, not absence of independence. The corpus's own answer to the cost is batching rather than fanning — two of these loops already take one batch gate, record a batch response, and gate the per-item loop on an opt-in flag. **The two that have not applied that answer should:** the domain-question loop asks unconditionally, and the deferred-item raise loop asks once per register row.

**Read-after-write chains that look like sibling steps.** The reconcile-challenge-combine body at three sites is a strict chain: each step reads what its predecessor wrote, and the loop's own continue condition reads the combine's output. The opening produce chain in `plan-prepare` is ordered because the test plan and the todo registration both consume the plan's task list, and the stakeholder overview consumes both prior products. The record-then-register-deferred pair in `assumptions-review` is ordered because the register operation reads the log's deferred rows. The render-verify-mark-ready chain in `submit-for-review` is ordered on one remote resource, the pull-request description body.

**The knowledge-base and web sweeps in `research`.** The most plausible-looking false candidate: two independent source systems, two disjoint outputs. The web pass reads the knowledge-base pass's product at both ends — it opens on the gaps internal documentation did not answer and closes by cross-referencing the two collections — and the division of labour between institutional knowledge and current industry context only works if the web pass knows what the internal pass missed. Making them concurrent changes what the web sweep is for.

**The baseline-state passes in `implementation-analysis`.** One worktree, two mutually exclusive checkouts. Section 1 checks out the base branch in the feature worktree, section 2 derives expected changes against the tree section 1 left in place, and section 3 checks out the change branch in that same worktree so the authored surface reads against it. The naming contract admits exactly one worktree per work package, and the ordering is a stated invariant.

**The task cycle in `implement`.** Five independent serialisers, any one of them fatal: one git index and one branch tip, with the commit operation asserting the branch and halting on mismatch; a checkpoint inside the loop body; an append-ordered provenance log whose chronological order is a declared property of the artifact; six per-iteration scalars written every pass; and dependency-depth task ordering declared as a first-class plan property. **Per-unit worktree isolation does not rescue it** — it fixes the git index and gives no unit its own gate slot, its own append position, or its own copy of the plan's ordering. That open question from the prior backlog is settled negative.

**Ten two-unit pairs whose fan is negative-value.** Recorded once as a general rule rather than ten times: a two-unit fan over units shorter than a fresh agent's start-up cost is negative-value at any dispatch point, because the fan finishes when its slowest unit finishes and each dispatched unit re-pays the baseline the orchestrator's batching exists to amortise. That covers both stealth verifications, both `start-work-package` probes, the define-classify pair, the collect-document pair, the retrospective-and-handoff pair, the lean-audit scan pair (whose ceiling is one grep plus one write plus one boolean), the classification-beside-publish pair, the conformance-beside-fragment pair, the effectiveness-beside-baselines pair, and the three prior-feedback list calls. **None of the survey's estimates carried a dispatch-overhead term, which is why ten negative-value fans read as small positives.**

**The claim that a percentage saving is knowable.** Nothing in this corpus has been timed — not a challenge pass, not a code review, not an ingest step. The survey stated fractions ("two-thirds off", "a quarter of a long step") computed against unit counts rather than measured durations, and with no overhead term on the cost side. The lean-coding workflow's own honesty boundary forbids exactly this shape of figure, because the comparison has no real second term. **Carry unit counts and unit kinds; carry no percentage until something is measured.**

## 8. Staged plan

Eight stages. Each is independently mergeable and none blocks another, except where a dependency is named.

---

### Stage 1 — Settle where parallel work can run

**Delivers.** A recorded decision, and the corpus corrections that make it true. Adopt in-turn tool concurrency as the only sanctioned in-activity fan; decline the fifth step kind, with its price recorded (roughly fifteen files, plus retraction of `no-domain-work`); record multiple live workers as meta's question with a meta owner; reject activity splitting for concurrency. Retire the in-activity fan-out framing from `meta/activities/patterns/README.md` so the harness technique remains the single home for where parallel scatter runs.

**Depends on.** Nothing.

**Acceptance criteria.** The pattern-library README no longer claims a capability the execution model does not grant, and no longer instructs a consumer to raise dispatch concurrency for in-activity fan-out. The harness technique is unchanged and is the sole home. A decision record lands in `.engineering/artifacts/planning/`, naming the priced options and the reason each was declined. `npm run check:all` is green.

**Guard and sweep obligations.** None beyond the corpus guard run. This stage touches meta's corpus documentation only.

---

### Stage 2 — Fix the live defects

**Delivers.** Seven fixes, two of them live bugs, none needing any concurrency change.

1. **Repository path spent before it is produced.** In `01-start-work-package.yaml`, the prior-feedback step spends the component repository path three steps before its only producer, and the variable declares no default. Move the step below the resolution, or bind the path explicitly.
2. **A loop gating on flags whose driving inputs are unbound.** In `10-post-impl-review.yaml`, the fix cycle continues on two routing flags, and the operation that sets them never receives the per-pass findings inputs that drive them — both bind sites supply only the single diff-review report. The same omission exists at the `13-submit-for-review.yaml` bind. Bind the per-pass findings at all three sites.
3. **Unbound required input on the stakeholder overview.** In `06-plan-prepare.yaml`, the overview step supplies only a heading; its source-material input is bound by three other callers and unbound here, and appears in neither the activity's reads nor the workflow's variables.
4. **Unbound assumption source.** In `03-requirements-elicitation.yaml`, the collect step leaves its source input unbound.
5. **Unresolvable inputs at the cross-workflow lean-audit borrow.** In `09-lean-coding-audit.yaml`, four ponytail group inputs are unresolvable — a corpus grep for all four across work-package returns nothing. Bind the artifact directory (the planning folder is the natural value) and the task description. **Leave the intensity and scope inputs to their contract defaults** and do not declare them; both defaults are already the lens a post-implementation diff audit wants, and binding them would add variables no gate or message reads.
6. **Two names for one plan value, with the producer unnamed.** The plan document is interpolated by a gate message and declared nowhere; the test-plan document appears nowhere at all; and `08-implement.yaml` iterates a workflow-level implementation plan no activity writes. Settle on one name with a declared producer.
7. **An unbounded convergence loop.** `15-codebase-comprehension.yaml`'s deep-dive loop carries no iteration bound while every sibling convergence loop does.

**Depends on.** Nothing. Item 2 is a prerequisite for Stage 8.

**Acceptance criteria.** Every previously unbound input resolves through a bind, a same-name bag variable or a declared default. `npm run check:all` green, `npm run check:delta` clean against the merge base.

**Guard and sweep obligations.** The activity-variables guard requires every declared read to have a writer on every path — item 6 must not introduce a write with no reader. The binding-fidelity ledger pins this exact corpus commit and matches entries on check, site-without-line-number and detail; eleven of its seventy-two triaged findings are in work-package, so **re-issue by hand every judgement whose site or detail these edits move, in the same commit.** There is no regenerate command.

---

### Stage 3 — Delete the always-redundant pull-request render

**Delivers.** The only change in this plan that buys wall clock by removing a step. In `13-submit-for-review.yaml` the standalone description render and the re-render inside the verification loop bind the same operation under the same guard with the same effective template variant; the conformance flag defaults false, so the loop always runs at least once and the standalone render is always immediately re-run. Delete the standalone step. One render and one pull-request-description API write saved per run.

**Depends on.** Nothing.

**Acceptance criteria.** The loop's first iteration is the first render. `npm run check:all` green, and the redundant-re-execution class under **no-duplicate-technique-steps** no longer applies at this site.

**Guard and sweep obligations.** Corpus guard run. Check the binding ledger for an entry naming the deleted step.

---

### Stage 4 — Give four facts one home each

**Delivers.** Four single-home fixes, each removing a construct rather than adding one.

1. **The challenge roster.** Add the default to `work-package/techniques/analyse-challenge/TECHNIQUE.md` as specified in section 6 and delete all six identical bind-site literals. Six lines removed.
2. **The merge-strategy facade.** Delete `work-package/techniques/manage-git/detect-merge-strategy.md` and bind the shared repository-view operation at the single call site.
3. **The requirements document's undeclared writes.** Remove both offending clauses from `work-package/techniques/requirements-elicitation/create-document.md`, leaving the link-only slots.
4. **Two writers on one planning README.** In `12-strategic-review.yaml`, the artifact-conformance sweep corrects the planning README in place — its guide map carries a row for that filename and its third phase is a correction — while the README-conformance operation reads the same file and re-applies its creation when absent. **Retire one writer.** Either state that the planning README is out of scope for the artifact sweep and remove that guide-map row, or make the README-conformance operation the only writer. Canon: **Prefer Removing the Thing That Needs a Prohibition**.

**Depends on.** Nothing.

**Acceptance criteria.** One authoritative home per fact; the retired file has no remaining referencer (verified by corpus grep); no README row names the deleted operation; `npm run check:all` green.

**Guard and sweep obligations.** For item 1, the inherited-inputs guard forbids re-declaring a container input on a leaf — declare the default on the container only. For item 4, whichever operation is narrowed may be bound by another workflow; check before editing.

---

### Stage 5 — Split the small monoliths

**Delivers.** Band 1 of section 5: the two research splits, the classify split, the baseline-state split, and the pull-request render split with its container narrowing. Each lands on its own canon entry, and each is priced honestly at zero concurrency.

**Depends on.** Stage 4 for the merge-strategy retirement only if the same commit touches `01-start-work-package.yaml`; otherwise nothing.

**Acceptance criteria.** Every resulting operation declares every value its protocol reads as an input or gives it a default, and declares every value it emits as an output. No operation applies another for work inside a numbered protocol phase where a bind at the activity would serve. `npm run check:all` green.

**Guard and sweep obligations.** The container narrowing in the render split reaches `midnight-system-review` — name its publish activity and its two READMEs in the manifest and re-verify after. Declare newly named outputs in the binding activity's contract **only where a later activity reads them**. Re-issue affected binding-ledger judgements.

**Stale restatements to carry in the same edit.** Any README sentence describing a split technique as one operation. Record the occurrence count in the manifest, as **stale-restatement-after-change** requires.

---

### Stage 6 — Split the two large monoliths

**Delivers.** The implementation-analysis split (four operations plus five direct binds) and the reconcile split (three operations, with the comprehension phase rebound to the existing deep-dive operation). The reconcile split is the one with the most corrections against the survey's specification — drop the proposed fourth operation, leave the no-interaction rule on its own operation, rename the per-unit input, and do not insert the orchestration pipeline.

**Depends on.** Nothing, but should follow Stage 5 so the smaller splits establish the review pattern.

**Acceptance criteria.** The reconcile group has three operations, not four; the comprehension augmentation is a gated bind of the existing operation; the prose gate on the comprehension artifact is expressed as a condition; the fold operation is the sole writer of the assumptions log in the reconcile path; the scorecard value is either declared as an output with a reader or removed. Every promoted name in the implementation-analysis split has a reader. `npm run check:all` green.

**Guard and sweep obligations.** The activity-variables guard is the binding constraint on the implementation-analysis split — promote only what a later activity reads. Settle the standing `analyse` reference before minting any identifier beginning with it.

**Stale restatements to carry in the same edit.** `work-package/activities/README.md` names the convergence loop body as reconcile, challenge, combine in six mermaid node labels and names the comprehension loop in a seventh. `work-package/README.md` states the same three-stage shape and states where the fan-out primitive is declared. `work-package/techniques/README.md` states the same. **Nine sites; carry them all in one edit and record the count.**

---

### Stage 7 — Split the task-completion review, and batch two operator gates

**Delivers.** The task-completion split (provenance verification inside the settle loop, quality assessment as a project-gated sibling outside it, the duplicated log rule retired), which also removes up to three redundant re-runs of the quality pass per task. Plus the two loops that have not applied the corpus's own batching answer: the domain-question loop in `requirements-elicitation` and the deferred-item raise loop in `complete` each present the open set once, take one batch gate, record the batch decision, and gate the per-item loop on an opt-in flag — the shape two sibling activities already use.

**Depends on.** A decision on the quality findings' destination, which must be made before the split is written.

**Acceptance criteria.** The settle loop's continue condition reads only the operation it drives. The quality assessment is gated on project type alongside its sibling test step. Its output has a named destination: either a guide-map row plus a guide with a template and rules plus a declared audience, or an interpolated identifier in an activity message. Both batched loops gate their per-item body on an opt-in flag. `npm run check:all` green.

**Guard and sweep obligations.** The artifact-guides guard resolves a guide from the producing workflow's resources README or from a resource naming the filename and carrying a template, and every corpus artifact resolves today, so **a new unmapped artifact fails outright**. The audience guard is a hard zero with no baseline. Both apply only to the artifact route.

---

### Stage 8 — Register the message-binding guard, then measure the one site worth measuring

**Delivers.** Two things, in order.

First, register the existing message-binding check in the guard registry and in the package scripts, then triage its corpus-wide findings. The script exists and runs, but it is absent from the thirty-six-guard registry and has no script entry, so it is invisible to both the full and delta guard runs. **Until it is registered, no proposal may count one of its findings as a benefit** — Stage 5 explicitly does not.

Second, time the three review passes in `post-impl-review`. If their tool work is the larger share of elapsed time, express it as concurrent invocations awaited inside the one worker turn, gathered into a structured envelope, with a declared sequential fallback — the cargo-suite shape, in the three passes' own protocols. **Do not lift that shape into a shared operation:** the cargo suite remains its single other call site, and one consumer is not duplication.

**Depends on.** Stage 2 item 2. The gather contract a fan needs is exactly the per-pass findings wiring that is missing.

**Acceptance criteria.** The message-binding check appears in the registry with corpus scope and JSON output, has a package script, and its findings are triaged rather than suppressed. For the timing: a measured figure exists, recorded with the corpus commit it was taken at. If the figure does not justify the prose, **the stage closes having measured and declined**, and that is a successful outcome.

**Guard and sweep obligations.** Registering a guard changes what the full and delta runs report; triage every finding it surfaces rather than baselining them away. The corpus-adoption obligation applies if this stage moves the submodule pointer: the token-cost walk is owed on every adoption, and where it has crossed its threshold the fixture is re-recorded in the same commit.

## 9. Non-goals

- **A fifth activity step kind, or any concurrency field on the loop step.** The loop step is closed to its current field set and carries no concurrency field. Adding one so existing content validates is **schema-is-constraint**. If the schema genuinely cannot express an orchestrator-executed fan, that absence is the finding and belongs to a schema ticket taken separately.
- **Retracting or weakening `no-domain-work` or `one-level-of-indirection`.** The execution model rests on them.
- **Session-level parallelism.** Two workers in one session, or two outstanding operator questions, is a session-file shape question owned by meta.
- **Changes to the meta dispatch loop.** Its single-worker shape is recorded here as the reason Option C is declined; changing it is meta's work with meta's owner.
- **Splitting any activity.** Not for concurrency, not as a side effect. Every activity from `design-philosophy` onward is borrowed by `remediate-vuln`.
- **A new pattern activity, or a shared operation wrapping concurrent shells.** The library already covers the first; the second has one call site.
- **Backward compatibility for anything this plan removes.** The retired facade, the deleted render step, the removed clauses and the retired duplicate writer go away rather than becoming fallbacks.
- **Any percentage saving figure.** None is stated because none is measured.
- **The corpus-wide message-binding findings as a fan prerequisite.** They are pre-existing across four workflows and are their own sweep.

## 10. Evidence

All citations are `path:line`, relative to `/home/mike1/projects/dev/workflow-server`, at submodule HEAD `5f92dc06`.

### The execution model and the depth-1 constraint

- Orchestrators never execute activity steps: `workflows/meta/techniques/orchestrator-conduct.md:12-14`.
- One level of delegation, a worker dispatches none of its own: `workflows/meta/techniques/orchestrator-conduct.md:16-18`.
- A spawned agent has no dispatch primitive; `concurrency = 1` is its contract; parallel scatter is available only at the orchestrator: `workflows/meta/techniques/harness-compat/spawn-agent.md:42-46`.
- Sequential mode is the correct default where genuine fan-out is not needed: `workflows/meta/techniques/scatter-gather.md:38-40`. One gather contract, two scatter modes: `:26-28`. Isolation then combine, no per-instance bag clobber: `:34-36`.
- The meta activity loop is a `while` over one scalar activity with one scalar worker identity, gating two mutually exclusive branches: `workflows/meta/activities/03-dispatch-client-workflow.yaml:31-40`, `:44`, `:55`, `:96-102`. The harness baseline is paid once a run rather than once an activity: `:122`.

### Step-to-step binding within an activity

- Outputs land in the bag under their declared name: `workflows/meta/techniques/variable-binding.md:20`. A later `when`/`condition`/`transition` reads them by name or dotted path: `:21`. The composed signature is the contract: `:12`.
- The message-binding guard's subject is server-rendered message text before the activity boundary, and it names the two producers that do reach the bag mid-activity: `scripts/check-message-binding.ts:3-12`.
- The corpus passes challenge findings to an adjacent combine step inside one activity at seven sites: `workflows/work-package/activities/02-design-philosophy.yaml:192-208`, `04-research.yaml:152-168`, `05-implementation-analysis.yaml:98-114`, `06-plan-prepare.yaml:129-146`, `07-assumptions-review.yaml:88-105`, `08-implement.yaml:173-190`, `15-codebase-comprehension.yaml:95-111`.

### The schema surface an orchestrator-executed fan would need

- Four step kinds: `schemas/activity.schema.json:187`, `:395`, `:430`, `:514`. No `concurrency` field anywhere in that schema (grep returns nothing). The loop step closes at `:575` over the field set at `:525-572`.
- Technique input values are constrained to string, number or boolean: `schemas/activity.schema.json:206-215`.
- Thirty-eight registered guards: `scripts/guards.ts` (38 `id:` entries).
- The message-binding check is unregistered: no match for `check-message-binding` in `scripts/guards.ts` or `package.json`.

### Session-layer foreclosure

- `activeCheckpoint` is a single object with required fields and closed properties: `schemas/session-file.schema.json:54-115`, required at `:109-113`, closed at `:114`.
- All tools are gated until the checkpoint resolves: `src/utils/session/params.ts:62-70`.
- Loops holding a gate in the body: `03-requirements-elicitation.yaml:115-137`; `04-research.yaml:241-243` and `05-implementation-analysis.yaml:143-145` by reference to fragments at `workflows/work-package/workflow.yaml:17-49` and `:50-71`; `10-post-impl-review.yaml:150-168` with default option at `:154` and auto-advance at `:155`; `14-complete.yaml:91-106`; `08-implement.yaml:132-155`.
- The batching precedent: `07-assumptions-review.yaml:106-123` and `08-implement.yaml:191-214`, with the per-item loops gated at `04-research.yaml:236` and `05-implementation-analysis.yaml:138`. The domain loop has no such gate: `03-requirements-elicitation.yaml:104-110`.

### The one already-concurrent site

- Four concurrent foreground shells, awaited: `workflows/meta/techniques/cargo-operations/run-suite.md:30`, wait at `:33`, sequential fallback below the host floor at `:32`, per-check statuses taken at `:34`, structured envelope composed at `:35`. Group rule blessing it: `workflows/meta/techniques/cargo-operations/TECHNIQUE.md:55`. Single-call-site do-not-flag: `workflows/workflow-design/resources/anti-patterns.md:1807`. Agent concurrency is a different mechanism: `workflows/meta/techniques/harness-compat/spawn-concurrent.md:6-8`.

### The post-impl trio

- Three passes with disjoint artifacts: `workflows/work-package/techniques/review-code.md:26-48`, `review-test-suite.md:20-44`, `workflows/prism/techniques/structural-analysis.md:18-28`. Disjoint declared inputs: `review-code.md:10-23`, `review-test-suite.md:10-18`, `structural-analysis.md:10-14`. Tool work: `review-code.md:60-70`, `review-test-suite.md:54-62`, `structural-analysis.md:72-101`. File sizes 105, 107 and 110 lines.
- Steps and adjacent combine: `10-post-impl-review.yaml:169-191`, combine at `:186-191`. Conditional fan width: `:175` against `:176-182`. Fix cycle bounded at three: `:208`.
- The unbound per-pass findings inputs: `workflows/work-package/techniques/findings-classification.md:16-22`, bound sites supplying only the diff report at `10-post-impl-review.yaml:188-191`, `:233-236` and `13-submit-for-review.yaml:130-131`. The loop reads those two flags at `10-post-impl-review.yaml:197-207`.

### The seven challenge sites

- One unit per perspective, each receiving only the concern set plus its name: `workflows/work-package/techniques/analyse-challenge/challenge.md:26-28`. Isolation until combine: `:42-44`. No merge into the concern document here: `:38`. Ordered keyed output: `:16-20`. The mode-selection hedge: `:27`.
- Combine is the single writer, bound separately: `analyse-challenge/combine.md:16-32`; binds at `02:198-208`, `04:158-168`, `05:104-114`, `06:136-146`, `07:95-105`, `08:180-190`, `15:102-111`.
- Container declares the roster and the concern document with no default: `workflows/work-package/techniques/analyse-challenge/TECHNIQUE.md:10-18`. Container inputs are a do-not-flag for unread declared inputs: `workflows/workflow-design/resources/anti-patterns.md:1843`.
- Six identical roster literals: `02:196`, `04:156`, `05:102`, `06:134`, `07:93`, `08:178`; the two-perspective variant at `15:100`.
- Convergence loops: `02:177-186`, `04:137-146`, `05:83-92`, `06:115-128`, `07:74-87`, `08:159-172`, `15:79-94`. Continue conditions at `02:180`, `04:140`, `05:86`, `06:118`, `07:77`, `08:162`. Iteration bounds at `06:124`, `07:83`, `08:168`; none at `15:82-87`.
- Missing write for the classification value the gate message interpolates: `02:19-81` against `02:99`.
- The comprehension bind defect: `15:100-101` and `combine.md:36-39` against `workflows/work-package/techniques/codebase-comprehension/revise-questions.md:20` and `workflows/work-package/resources/codebase-comprehension.md:349-351`, with promotion keeping the challenge output local to the log at `:311` and the log template's lens section at `:295-299`.
- Self-contained briefs re-carry context: `workflows/meta/techniques/orchestration-patterns/compose-worker-briefs.md:37-38`.

### The prior-feedback fan and its ordering defect

- Three list applications retaining three locals, and a fourth application in the next section: `workflows/work-package/techniques/review-existing-feedback.md:38-40`, `:51`. Declared leaf outputs: `list-issue-comments.md:18`, `list-pr-reviews.md:18`, `list-pr-review-comments.md:18`.
- The bind at `01-start-work-package.yaml:338-341`; its only repository-path producer at `01:345-347` via `repo-root-resolution.md:30-32`; no default at `workflows/work-package/workflow.yaml:90-92` or `01:38-40`.
- Coordinate resolution happens inside each leaf's protocol, so it is the applied operation's output, not the bound operation's: `list-issue-comments.md:26`, `view-repo.md:19`, against `variable-binding.md:12`, `:20`.

### Foreclosed sites

- Exclusive guards: `01-start-work-package.yaml:484`/`:495`, `:656`/`:660`, `:717`/`:724`, `:853-856`/`:877-880`; `07-assumptions-review.yaml:182`/`:189`. Do-not-flag: `workflows/workflow-design/resources/anti-patterns.md:548-550`. Shared worktree side effect: `manage-git/create-worktree.md:28-40`.
- Research sweeps ordered: `workflows/work-package/techniques/research/research.md:36`, `:40`, `:37`; undeclared reads at `:25`.
- Baseline-state worktree: `review-baseline-state.md:29-30`, `:34`, `:39-41`, invariant at `:54-56`; one worktree per package at `naming-conventions.md:58-59`, `:63-65`.
- Task cycle: branch assertion and staging at `manage-git/commit-paths.md:30`, `:34-40`; directory scope at `manage-git/TECHNIQUE.md:19-29`; gate at `08-implement.yaml:132-155`; append-only ordered log at `dco-provenance/TECHNIQUE.md:22-24`; dependency ordering at `plan-prepare/plan.md:24-26`; per-iteration scalars at `08:21-82`; worktree isolation addresses only the workspace at `compose-worker-briefs.md:37`.
- Chains: `review-assumptions/reconcile.md:16-28` into `analyse-challenge/TECHNIQUE.md:16-18` and `combine.md:10-32`, remapped at `06:142-146`, `07:101-105`, `08:186-190`, both writing the one log in place per `reconcile.md:20` and `combine.md:47-51`. Plan chain: `create-test-plan.md:12-14`, `:38`; `plan-prepare/create-todos.md:12-14`, `:20`; `stakeholder-overview.md:12-14`, `:31`. Deferred register ordered behind the log: `manage-registers/append-deferred-item.md:16-18`, `:38`; one row per item for its life at `manage-registers/TECHNIQUE.md:20-22`. Render chain: `update-pr/verify-body.md:12-14`, `render.md:28`, `mark-ready.md:28`, loop at `13:305-310`.

### The redundant render

- Standalone render at `13-submit-for-review.yaml:296-299`; loop re-render pinning the same variant at `:312-317`; template default at `workflows/work-package/techniques/update-pr/TECHNIQUE.md:32-34`; conformance flag defaults false at `13:48-51`. Redundant-re-execution class: `workflows/workflow-design/resources/anti-patterns.md:548`.

### The lean-audit borrow

- Two independent scans: `workflows/ponytail/techniques/review-over-engineering.md:10-14`, `:22-24`; `harvest-debt.md:12-26`, `:30-40`. Report-only rule: `workflows/ponytail/techniques/TECHNIQUE.md:62-64`. Ponytail splits them across `03-over-engineering-review.yaml:5-13` and `05-harvest-debt-and-report.yaml:5-28`.
- Four unresolvable inputs at the borrow (corpus grep across `work-package` returns zero for the artifact directory, the intensity and the scope): defaults present at `workflows/ponytail/techniques/TECHNIQUE.md:24-30`, `:32-38`; workflow-level-only artifact directory at `workflows/ponytail/workflow.yaml:29-32` against the write at `harvest-debt.md:36`; the task description declared required with no default at `ponytail/techniques/TECHNIQUE.md:12-14`.
- The gated third pass is ordered three ways and its scoreboard has no destination in work-package: `report-gain.md:12-14`, `:32-34`; `harvest-debt.md:24-26`, `:40`; `09-lean-coding-audit.yaml:44-47` carrying no actions, against ponytail's own message bind at `05-harvest-debt-and-report.yaml:29-34`. Benchmark provenance: `report-gain.md:18-20` and `ponytail/resources/honesty-boundary.md:26-32`; the sanctioned per-repo figure at `honesty-boundary.md:18`; the fabricated-figure prohibition at `:17`.

### Splits, and the corrections to their specifications

- Implementation-analysis monolith: `implementation-analysis/analyze.md:10-26`, `:35-49`, `:51-55`, `:57-62`, `:64-68`; no declared values in the activity contract at `05:20-59`; bind at `05:68-70`.
- Reconcile monolith: `review-assumptions/reconcile.md:30-66`, outputs at `:16-28`, per-assumption phase at `:39-46`, comprehension phase at `:62-66` with its prose gate at `:66`, undeclared scorecard at `:52`, no-interaction rule at `:68-72`.
- The existing comprehension owner: `codebase-comprehension/deep-dive.md:8`, `:69-79`; `revise-questions.md:12-25`. Reuse before split: `workflows/workflow-design/resources/anti-patterns.md:304`, `:1439`, `:1443`; new techniques last resort: `workflows/workflow-design/resources/design-principles.md:119`.
- Container rule reach: `workflows/workflow-design/activities/03-requirements-refinement.yaml:141`, `:169`; rule-relocation requirement at `design-principles.md:55`; entry at `anti-patterns.md:1925`.
- The standing `analyse` reference with no file: `workflows/work-package/README.md:11`; `review-assumptions/reconcile.md:84`, `:86`; `review-assumptions/assemble-open-set.md:14`; folder contents are `challenge.md` and `combine.md` only. Naming requirement at `anti-patterns.md:124` and `design-principles.md:43`. Name already taken: `07:37-39`, `08:42-44`.
- Task-completion review: two concerns named at `task-completion-review.md:8`; declared outputs at `:20-28`; undeclared phase-2 product at `:38-41`; duplicated log rule at `:50-52` against `review-assumptions/collect.md:30` and the next step at `08:156-158`; project coupling at `workflows/work-package/resources/rust-substrate-code-review.md:104-224` against the ungated bind at `08:129-131` and the gated sibling at `08:103`; the settle loop at `08:121-127`.
- Merge-strategy facade: `manage-git/detect-merge-strategy.md:16-18`, output name at `:12` against `github-cli-protocol/view-repo.md:12`, `:21`; container-declared repository path at `github-cli-protocol/TECHNIQUE.md:12`; single bind at `01:385-387`; readers consume the bag name at `manage-git/instruct-merge-strategy.md:12`, `:20`, `:24`, `:31` and `13:26`.
- Requirements-document writes: `requirements-elicitation/create-document.md:24-36`, `:43`, `:44`; owners bound at `03:153-155` and in the register group; home assignment at `workflows/work-package/resources/canonical-home-map.md` and `workflows/work-package/resources/README.md:54`.
- Ambient context identifiers: `src/utils/binding-provenance.ts:32-33`, resolution at `:271`; optional marker at `design-philosophy/classify.md:10-14`; the inline application at `:35`.
- Decompose operation emits work units; its inputs are the planning context and effort cap: `workflows/meta/techniques/orchestration-patterns/decompose-work-units.md:10-18`, `:20-24`.
- Render split and container outputs: `update-pr/render.md:16-28`, `:22-26`, `:28`; container outputs at `update-pr/TECHNIQUE.md:36-44`; cross-workflow consumer at `workflows/midnight-system-review/activities/06-publish-review.yaml:43`, documented at `midnight-system-review/techniques/README.md:31` and `midnight-system-review/README.md:72`.

### The pattern library

- Library scope claim and the dispatch-concurrency instruction: `workflows/meta/activities/patterns/README.md:7`, `:58`. Consumption route: `:36-46`. Five activities: `01-orchestrator-workers.yaml` through `05-lead-researcher.yaml`. Isolation mode and completeness gate: `04-isolated-fan-out.yaml:9`, `:44`, `:58-59`.
- Dispatch concurrency resolves above one to the concurrent-spawn operation: `workflows/meta/techniques/orchestration-patterns/dispatch-workers.md:20-30`.
- Default-value convention for a technique input: `workflows/meta/techniques/cargo-operations/TECHNIQUE.md:20-22`.
- In-activity fan-out is sanctioned as a pattern borrow: `workflows/workflow-design/resources/design-principles.md:119`; construct mapping at `workflows/workflow-design/resources/schema-construct-inventory.md:38`.

### Guard and adoption obligations

- First-step checkpoint is mechanically rejected: `scripts/check-checkpoint-entry.ts:16-18`, `:47`; registered at `scripts/guards.ts:107-114`; rationale at `:7`.
- Every declared write needs a reader: `scripts/check-activity-variables.ts`, registered at `scripts/guards.ts:38-44`.
- Artifact guide resolution, no baseline: `scripts/check-artifact-guides.ts:11-18`, `:26-27`; work-package guide map at `workflows/work-package/resources/README.md:45-74`.
- Audience declaration, hard zero: `scripts/check-audience.ts:9-15`, `:26-28`.
- Inherited inputs guard: `scripts/guards.ts:45-51`.
- Binding ledger pinned to this corpus commit, matched on check plus site-without-line plus detail, no regenerate command: `scripts/binding-fidelity-triage.json` (`corpusSha` and note).
- Cross-workflow borrow of every activity from `design-philosophy` onward: `workflows/remediate-vuln/workflow.yaml:203-216`, graph at `:159-200`; per-activity table at `workflows/remediate-vuln/README.md:20`, chain at `:36`, assertion at `workflows/remediate-vuln/activities/README.md:7`. Unbound exit fails the load: `schemas/workflow.schema.json:392`, `:765`.
- Adoption prices the corpus and re-records the fixture: `AGENTS.md` (Testing section).

### Stale restatements to sweep

- `workflows/work-package/activities/README.md:73`, `:91`, `:146`, `:171`, `:191`, `:209`, `:246`.
- `workflows/work-package/README.md:11`, `:37`.
- `workflows/work-package/techniques/README.md:9`.
- `workflows/meta/activities/patterns/README.md:7`, `:58`.
- Sweep and single-edit requirement with recorded count: `workflows/workflow-design/resources/anti-patterns.md:1709`, `:1713`. Mermaid transcription carve-out does not exempt staleness: `:574`.