# Requirements Elicitation: Handling Inline Techniques

> 2026-08-17 · [#397](https://github.com/m2ux/workflow-server/issues/397) · Six deliverables

## Problem Statement

A technique file calls another technique from inside its own Protocol prose, and the server treats that sentence as ordinary text: nothing resolves the reference, nothing checks its arguments against the callee's declared inputs, and the callee's body never arrives with the caller. A whole class of instruction therefore goes unchecked — callers drift silently when a callee is renamed or changes what it needs, and a step whose technique cannot be loaded cannot be executed as written. Three written authorities disagree about whether the construct is even legitimate, and nothing mechanical stands behind any of them.

## Goal

Every inline technique call is resolved, argument-checked and delivered by the server, under one written rule that says which calls stay in prose and which become activity steps — and the design canon, the addressing specification and the running platform all say the same thing about them.

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| Workflow author | A call written in a protocol behaves like a call: it resolves, its arguments are checked, and a rename that breaks it fails a check rather than stranding silently | As a workflow author, I want the server to see the calls I write so that renaming a technique cannot silently break its callers |
| Executing agent | The body of a technique named in the protocol it is executing arrives with that protocol | As an executing agent, I want a referenced technique delivered alongside its caller so that I execute the step as written instead of improvising |
| Guard maintainer | One definition of what a reference is, shared by the guard and the runtime | As a guard maintainer, I want the reference grammar in one module so that the check and the loader cannot disagree about what a call is |

### Secondary Stakeholders

- Whoever works the migration batches — this package produces the worklist they consume, and its guard bins are the pre-sort.

## Context

### Integration Points

- **Composition pipeline** — `markdown-technique-loader`, `technique-loader`, `fragment-resolver`. Its only body rewrite today is resource links, so an inline technique reference passes through verbatim.
- **Two delivery doors** — the activity bundle (`get_activity`) and the lazy step fetch (`get_technique`). They share one composition function and are byte-identical by construction; only the activity door runs an outbound reference scan.
- **Guard registry** — `check-all-refs`, `check-binding-fidelity`, `check-resource-anchors`, `check-stealth-isolation`. The stealth check is the only guard that reads a composed protocol, so it is the one a change to composition perturbs first.
- **Design canon and addressing specification** — the two written authorities that currently contradict each other, in different submodules.
- **`core-ops.ts` baseline lists** — the hand-maintained stand-in for the missing delivery.

### Dependencies

- **W0 — cross-workflow ancestry.** In scope, not a wait. Nothing external is in flight to depend on: #405 was closed on filing, subsumed into #397 as W0, with no open issue, branch or pull request delivering it. The dependency is therefore internal sequencing — W0 lands before this package's W3a half.
- **#398 W1 — the shared slug computation.** Not a blocking dependency. This package's surface is the references that carry *no* anchor, and anchor semantics stay in #398. The requirement it generates is negative: the grammar module built here must not grow an anchor slugger beside #398's.

### Constraints

- **Technical:** the canonical prose call form stays the declaration site, so the corpus loads with unchanged meaning and the change carries no corpus migration of its own. Delivery cost stays inside the existing bundling budget. The engine layer — `workflow-engine`, `agent-conduct`, `harness-compat` — is excluded as a fold target from product techniques. Canon and specification amend with delivery rather than ahead of it.
- **Timeline:** W0 lands before W3a. Within this package that is a sequencing constraint on its own work, not a wait on another party.
- **Resources:** agentic development time plus separate human review.

## Scope

### In Scope

This package carries **six numbered deliverables**: the three epic work items W0, W2 and W3a, the canon-and-specification amendment, the cycle-rule correction, and the wrapper conversion. The epic's stated convention is one pull request per work item, and a package this size in one pull request departs from it; carrying W0 here rather than splitting it out first was chosen knowingly, and the wrapper conversion adds the largest single piece of review surface. If planning finds the combined review surface untenable, that is a planning finding for its own gate rather than a licence to re-cut scope.

1. **W0 — cross-workflow ancestry.** One documented ancestry rule for cross-workflow references, applied identically by both delivery doors, with the specification section and the composition routine's comments stating it, and a test composing one cross-workflow reference through both doors. Its direction is settled rather than open: W3a composes under home-tree ancestry, so W0 resolves to *contract follows the file's home tree*. It is the smallest of the six — the fix is confined to which techniques directory the composition routine resolves ancestors from, one specification section, and one test.
2. **W2 — check the calls we already write.** A guard resolves every inline reference through the same loader the server uses and checks arguments against the callee's declared inputs. Its grammar lives in a shared module that fold delivery later imports. Unambiguous defects fail hard from day one, including the three rule-addressed-as-operation sites and the one dangling target, repaired in the same change; contract classes are delta-gated. The same scan resolves the neighbouring reference kinds with no static check today — dotted rule citations, bare resource links, artifact-name tokens. Call sites whose callee is a value are enumerated and reported as beyond static reach, with closure over the enumerable set where one exists.
3. **W3a — deliver the referenced techniques.** Referenced bodies arrive deduplicated, transitively, within the delivery budget, composed under W0's ancestry rule, with a delivery event per body and the stealth reachable-text scan running over the delivered closure. A delivered callee is **keyed in the delivery ledger as a technique**, so it collapses against a step-bound delivery of the same operation at both doors; the call site's binding annotations ride as a separate block rather than being baked into the body, which is what keeps that collapse available. The core-operations workarounds retire.
4. **The canon and specification amendment.** The three-way contradiction closes in the same pass that makes the platform express the rule.
5. **The cycle-rule correction.** Traversal delivers each body once and continues at a revisit, replacing the recorded rule that a reference cycle fails the load.
6. **The wrapper conversion, bounded to where the wrapper is already tool-backed.** The **41 logical call sites** whose operation already calls a typed tool reach that operation through a tool: GitNexus's 38 and Atlassian's 3. The prose at those sites is a second layer over a validated call, so converting it crosses no boundary that is not already crossed. Of the 41, **15 are intra-group GitNexus calls** that become ordinary calls inside the implementation, and **26 become tool calls**. Operations carrying an interpretive tail split rather than convert whole — GitNexus's `impact` derives a risk level against thresholds and surfaces HIGH or CRITICAL to a person, so it converts as a tool plus a thin interpreting technique, and those interpreting halves join the guard's worklist. The **49 shell-backed sites** keep their prose form: GitHub 38, `version-control` 6, `manage-git` 4, `cargo-operations` 1. Their contracts require the host shell, host credentials, host network and host SSH agent with `GH_TOKEN` and `GITHUB_TOKEN` left unset, and a server-hosted tool runs in the server process and would need the credential those contracts leave unset. The fold stays owed across the remaining population, whose operations start an agent, address a person, or supply judgement — none of which is a call code can make.

### Out of Scope

1. **The borrowed-activity gap (143 bind sites)** — independent of inline calls; filed as its own ticket through the follow-ups activity while the evidence is fresh. See the [deferred-items register](deferred-items.md).
2. **W1 (protocol variants), W3b (verified call joints, dormant), W4 (variant-parity catalogue entry)** — separate work items of the same epic.
3. **Migration batches** — the guard's mechanical bins seed the disposition worklist; no edge is dispositioned here. Folding them in would put an unreviewed pre-sort into the same change as the checker that produces it.
4. **A blanket hoist of inline calls to activity level** — not proposed by the visibility rule and ruled out by the evidence; see [What the evidence changed](#what-the-evidence-changed).

### Deferred

Deferred scope items: [deferred-items register](deferred-items.md) — record each item there, not here.

## What the evidence changed

The request opened as a choice between hoisting inline calls to activity level "where technique use is properly handled" and defining a canonical inline mechanism. Comprehension measured the premise inside the first option and found it false. At the activity layer **82 of 748 technique bind sites** leave at least one required *own* input of their callee unsupplied, carrying **109 missing required inputs** between them — the same defect the technique side shows at **56 call sites**, at roughly a fifth of the density rather than absent. Four call shapes have no activity-layer expression at any price: a call between two protocol bullets, a value that crossed that call as protocol-run-scoped scratch state, a call gated on something known only mid-protocol, and a call repeated a technique-determined number of times. Fragments cannot serve as the substrate — a strict two-key container, no reference field on a technique step, and a resolver that visits checkpoints only. No guard exists that would confirm a hoist had been done correctly; the container-contract guard's own header names that check as out of scope. And the analysis group's standing rule against re-implementing its loop per activity was written into the corpus before this package existed.

What that falsifies is the blanket hoist, which the visibility rule never proposed. The rule scopes hoisting to calls whose outcome the workflow acts on, and that rationale survives the premise intact. So the decision is **execute with correction**, not reopen: the doctrine's substance stands, one input to it was wrong, and the correction is cheap and measured.

The correction is the cycle rule. Under the conservative reading the corpus contains exactly **one cycle and two self-references**, all three correct as authored — a retry-and-confirm pair between the index-freshness check and the indexing operation, the freshness check applying itself after re-indexing, and cloud-site resolution applying itself for error recovery, which is the shape the specification explicitly sanctions. Three of 87 callers reach one. A rule that fails the load on cycles rejects all three. Stop-at-revisit was simulated across the corpus: every caller terminates, the deepest walk queues **26 entries**, and the heaviest delivered closure is **46,865 bytes** — identical to a traversal that cannot meet a cycle at all. The policy costs nothing, and it is not new: the resource loop already gathers identifiers into a set before loading, and the ledger already stages a hash per body and consults it before staging the next.

## The wrapper-code alternative

A second reading of the corpus asks whether the techniques these calls reach could be replaced by code — an MCP tool per operation — so that a nested technique call becomes a tool call and needs no fold mechanism at all. It is a scope question rather than an implementation one, so it is settled here, and the answer is bounded: the **41 logical call sites** whose operation already calls a typed tool convert, the **49 shell-backed sites** keep their prose form, and the fold stays owed across the **94 logical call sites** that remain. Everything below is measured at corpus commit `34cd5429`, the commit the rest of this document measures at, and every count names its unit.

### The population does divide, and the ratio is the one figure here that holds

Grouping inline calls by the directory that owns the callee separates two populations. Operations that wrap a single external call — GitHub, GitNexus, Jira and Confluence, git — sit on one side. Operations that start an agent, reach a person, or supply judgement sit on the other.

| Callee group | Logical call sites | Class |
|---|---|---|
| `github-cli-protocol` | 38 | wraps an external call |
| `gitnexus-operations` | 38 | wraps an external call |
| `workflow-engine` | 22 | engine |
| `harness-compat` | 12 | engine |
| `version-control` | 6 | wraps an external call |
| `manage-git` | 4 | wraps an external call |
| `atlassian-operations` | 3 | wraps an external call |
| `cargo-operations` | 1 | wraps an external call |
| eight domain and analytical callees | 11 | neither |
| **Total** | **135** | |

That is **90 wrapper sites, 34 engine sites and 11 domain sites**. The wrapper share is 67%, and it is stable in a way nothing else in this area has been: 68% of raw link occurrences, 67% of logical call sites, 68% of deduplicated pairs. Six counts here have moved under a change of definition and a seventh moved during this pass; this ratio moves by one point across three units. The division is real.

The absolute figures the proposal was framed with are all low. The wrapper population is 90 sites rather than 68, the engine population 34 rather than 22, and the total 135 rather than about 90 — the numeral 90 turning out to name the wrapper part rather than the whole. GitNexus is the largest single correction at 38 sites rather than 22. GitHub is the closest at 38 against 39, and `resolve-repo-coordinates` reproduces exactly at 17 sites, the most-called inline technique in the corpus.

One population named in the proposal is not in this census at all. The analytical callees — reconcile, challenge, combine — are reached by binding a variable to a technique name, not by a link a scanner can read. They are the class [SC-6](#success-criteria) exists for, and counting them beside link-borne calls mixes a statically visible population with a statically invisible one. Their true count is zero under this unit, and the question of what they cost belongs to SC-6.

### Intra-group calls disappear rather than convert

Every one of the 17 calls to `resolve-repo-coordinates` comes from a sibling in its own group: seventeen GitHub operations each resolving owner and repository before their REST call, and no caller anywhere else. Across the corpus **69 of 135 logical call sites are intra-group** — GitHub 17 of 38, GitNexus 15 of 38, `workflow-engine` 21 of 22.

This matters more than the conversion question it sits inside. When a group becomes a set of tools, its internal calls do not become tool calls: they become ordinary function calls inside the implementation, invisible to the corpus and to any guard over it. Were the GitHub group to convert, `resolve-repo-coordinates` would not become the eighteenth tool; it would become a helper the other seventeen call.

The conversion this package carries reaches GitNexus and Atlassian, so the effect lands there. Of GitNexus's 38 logical call sites, **15 are intra-group** and leave the corpus entirely rather than relocating to a new mechanism; the other 23 become tool calls. With Atlassian's 3, the converted population of **41 logical call sites** resolves as **15 vanishing outright and 26 becoming tool calls**. GitHub keeps its prose form, so its 17 intra-group calls stay in the corpus and its 38 sites measure what a shell-backed conversion would be worth rather than anything this package delivers.

### Where the code would run is the question the proposal does not ask

The proposal prefers tools to scripts on the ground that scripts would make the server execute code, a new capability and a new trust boundary, while tools live where tools already live. That holds for part of the population and inverts for the larger part.

**Already tool-backed — 41 sites.** GitNexus operations call `gitnexus_*` tools and read `gitnexus://` resources; Atlassian operations call the Atlassian tools. The prose is genuinely a second layer over a validated typed call, and converting it crosses no boundary that is not already crossed. These 41 are the population this package converts.

**Shell-backed and host-credentialed — 49 sites.** GitHub, `version-control`, `manage-git` and `cargo` shell out. GitHub's own group contract is explicit that this is deliberate: every `gh` invocation runs on the host shell, with host credentials, host network and host SSH agent, and `GH_TOKEN` and `GITHUB_TOKEN` stay unset unless a known-good token is intentionally supplied. A server-hosted tool runs in the server process and would need a credential the contract says to leave unset. Converting these moves GitHub and git write access across exactly the boundary the proposal invokes tools to avoid, so these 49 keep their prose form.

So the mechanism splits the population a second time, on a different axis than the first, and the two axes do not agree: the largest wrapper group is the one where conversion is most costly. This axis, not the wrapper share, is where the conversion boundary falls.

### The reasoning is in the containers, not the operations

Counted per operation the proposal is right. Of the 37 wrapper operations an inline call reaches, **33 carry no rule of their own**; group-wide it is 77 of 84. Counted per contract it does not follow, because every one of those operations inherits its group container, and the five wrapper containers carry **27 rule entries** between them — nine in `version-control`, six in GitNexus, five in Atlassian, four in GitHub, three in `manage-git`.

Three of those are the reason a wrapper is prose. GitHub's `ask-before-replying` requires the user's agreement before replying to review feedback — a human channel, inside the largest wrapper group. `version-control`'s `read-agents-md` requires reading the target repository's own instructions and honouring them, which is interpretation of a document written after the code. GitNexus's `edges-the-parser-cannot-see` is the escape hatch: where the graph holds no edge, re-derive the caller set by hand and record which basis the rating rests on.

Three others are gains, and the proposal is right that code sometimes removes a rule rather than losing it. `rest-only` and `github-access-only-here` become structurally true once the tool is the only path to GitHub. `resolve-cloud-id-once` becomes a cache rather than an instruction. `named-tree-outranks-the-binding` becomes impossible to violate once the fallback order is a function signature.

The escape hatches concentrate in the operations that carry an interpretive tail. `impact` calls one tool and then derives a risk level against thresholds, falls back to a hand-derived caller set when the graph is blind, and requires HIGH or CRITICAL risk to be surfaced to a person before an edit proceeds. It converts as a tool plus a thin interpreting technique, not as a tool. **Of the 37 wrapper operations reached, 5 convert with nothing left over; 32 either carry a rule, cross a threshold, hold an escape hatch, reach a person, or call another technique.** The clean five carry one call site each.

The population that figure counts is the 37 wrapper operations an inline call reaches **across all five wrapper groups**, so the clean five are spread over those groups and the figure says nothing about any one of them. Measured inside the two groups this package converts, the ratio is worse than the aggregate suggests. In `gitnexus-operations`, **17 operations, and after the shared staleness sentence is extracted 2 retire whole** — `read-cluster` and `read-process`, each a single bullet reading one MCP resource. `detect-changes` is arguable at a third, its two trailing bullets reading as usage guidance rather than a tool call. Every other operation keeps an interpreting half: five derive or classify a result, four hold a resolution fallback beyond staleness, nine call a sibling operation, and two reach a person. In `atlassian-operations`, **20 of 24 files are clean on all five keep-criteria**, and cleanliness there is not a licence to delete — see the reachability finding below. So no operation in the converted population is retirable on the strength of the aggregate figure; each is decided on its own contract.

### Loud at runtime is real, and it is not a substitute for the guard

The proposal's central mechanism claim holds. A tool schema declares its required arguments and the transport rejects a call that omits one, so a contract violation announces itself to an agent that can read the error and fix it. That is a genuine improvement on the 56 omitted inputs the technique side carries today, which fail silently and went unnoticed for exactly that reason.

The limit is coverage. Loud-at-runtime fires only on a path that executes, and the branches carrying the escape hatches are the cold ones — the graph with no edge, the symbol that will not resolve, the index found stale, the retry after re-indexing. For those, conversion turns "silent forever" into "loud the first time anyone runs it", which may be a long time and is not a check. A guard enumerates every site whether or not it runs. The two are complementary, and neither replaces the other.

### What this does to the guard, and what it does not

The guard's disposition worklist holds **94 logical call sites at corpus commit `34cd5429`** — 49 shell-backed wrapper, 34 engine, 11 domain — plus the interpreting halves of the operations that split. The 41 converted sites are not in it. That is a smaller worklist than the 135 logical call sites the census counts, and not a smaller grammar. Every term [SC-3](#success-criteria) publishes still has to be fixed for 94 sites for the same reason it has to be fixed for 135: a term left free admits two readings of the same file, at any population size. The ninth term subsumes two of the seven already named, so the grammar is pinned by fixtures rather than by totals alone. **The conversion changes the size of the problem and not its shape**, so SC-3 stands as written and grows the terms owed to it below.

### The two convergences do not hold

Two claims that the wrapper boundary coincides with boundaries already drawn were tested, and neither survives.

**The engine-target exclusion is not the same boundary.** Of the 34 engine-target call sites, **30 are engine calling engine**, which the doctrine's exclusion explicitly permits, having considered and rejected excluding intra-engine folds. Three come from `orchestration-patterns`, which [F-8](04-kb-research.md#findings) already records as neither engine nor a product workflow, so the exclusion's terms do not decide them. **One** is unambiguously a product caller reaching an engine callee. The exclusion therefore removes between one and four of 34 sites, where the mechanisation boundary removes all 34. The two name the same groups and carve out populations an order of magnitude apart; naming the same groups is not carving out the same set. This corroborates F-8's finding that the exclusion is nearly a no-op, from the opposite direction.

**The four inexpressible shapes are not confined to the remainder.** Three of comprehension's four — a call between two protocol bullets, a value crossing it as protocol-scoped scratch state, a call gated on something known only mid-protocol — are present throughout the wrapper population. A GitHub operation applying `resolve-repo-coordinates` and then using owner and repository in its next bullet is the first two shapes exactly. Only the fourth, repetition a technique itself determines, is distinctive to the analytical remainder.

What follows is not that the fold is unnecessary but that the reason for it changes. Those four shapes are obstacles to **hoisting a call to activity level**, and code does not express them — it removes them, a mid-protocol call becoming a function call and scratch state becoming a local. The remainder needs a fold for a different reason: its operations start an agent, address a person, or supply the judgement the agent exists for, and none of those is a call code can make. That reason is stronger than the inherited one and does not depend on the shape argument at all.

**So the fold mechanism is still needed.** It is needed for the **94 logical call sites at corpus commit `34cd5429`** that the worklist holds rather than all 135 the census counts, and W2's guard targets that set, but nothing in the wrapper analysis reaches the engine layer.

### Converting the wrappers does not settle the door question

[SC-10](#success-criteria) withdraws eleven baseline entries served only at `get_workflow`, a door the fold was never costed against. Converting an entry to a tool would remove it from every door at once, which looks like it dissolves the collision. Measured against the eleven, it does not, and the conversion this package carries touches none of them. **Two of them are wrapper operations** — the two `version-control` commit operations — and `version-control` is shell-backed, so both sit outside the converted 41. **Nine are engine**: compose-prompt, sync-progress-status, spawn-agent, continue-agent, resolve-harness-operation and the four harness adapter files, none of which converts. Conversion removes **0 of 11**, so [F-2](04-kb-research.md#findings) and [F-3](04-kb-research.md#findings) survive in full and both have to be answered before SC-10 removes anything.

## Counting this area

Five measurement defects were self-caught across comprehension's four passes, and every one was a unit or definition error rather than a coding mistake. Every count below names its unit. Two figures this package had been carrying were re-derived at corpus commit `34cd5429`, and **neither reproduces**.

| Figure as carried | Unit as carried | Re-derived | Verdict |
|---|---|---|---|
| 118 call edges | unstated | 148 to 235 deduplicated (caller file, callee file) pairs, depending on the verb list | Superseded; not reproducible under any verb list |
| 137 raw `Apply`-link occurrences across 88 files | link occurrences | 217 link occurrences across 92 files | Superseded |
| 822 technique-link occurrences across 192 files | link occurrences | 822 across 192 files — **only when anchored links are counted**; 721 across 179 without them | Reproduces exactly, under the opposite anchoring rule to the edge count beside it |
| Three rule-addressed-as-operation sites | unstated | 2 under this document's baseline grammar; 6 if any invoking verb and any section count | Superseded; reproduces under neither boundary |
| 11 of 28 orchestrator baseline entries ([RE-7](02-assumptions-log.md#log)) | baseline entries | 11 of **20** — the orchestrator list is 20 entries and the worker list 8; 28 is the total across both roles | Corrected, first-hand from the source |

Two of those rows are corrections this pass owns rather than inherits. The 822 figure — the one figure the record singles out as reproducing — reproduces exactly and only when anchored links are counted, which is the opposite of the rule the edge count printed beside it in the same table uses. No criterion is keyed to it, so it is harmless in itself; as evidence it is another instance of the pattern this section exists to record. And the retirement denominator at [RE-7](02-assumptions-log.md#log) is load-bearing rather than cosmetic, because [SC-10](#success-criteria) makes retirement per-entry against that list: the attributed share is 55% of the orchestrator baseline, not 39% of both baselines together.

The edge spread is the finding, not the number. The definition both comprehension artifacts state — an invoking verb followed by whitespace, an unanchored relative link to a technique file, inside a Protocol section, fences skipped — is under-specified in one term: **which words count as an invoking verb is not enumerated anywhere**. Holding every other criterion fixed and varying only that list:

| Verb list | Edges (pairs) | Callers | Callees | Nodes |
|---|---|---|---|---|
| apply only | 148 | 79 | 72 | 119 |
| apply, invoke | 153 | 82 | 76 | 126 |
| apply, invoke, run | 156 | 82 | 79 | 129 |
| the above plus follow, use | 204 | 99 | 82 | 144 |
| the above plus call, dispatch, delegate, per | 235 | 110 | 92 | 157 |

A 59% spread under wordings that read identically in prose. Comprehension's published figure of 168 edges over 87 callers sits between the third and fourth rows and is not reproducible from the definition as written.

### Two more free terms, and one of them subsumes two the grammar already names

[F-1](04-kb-research.md#findings) fixes seven terms and [RC-4](04-kb-research.md#open-research-candidates) adds an eighth — whether a technique-link destination must carry a leading dot. A ninth surfaced while re-deriving the wrapper population, and it is the second most material term measured to date.

A qualified call is written as two markdown links: `[group](TECHNIQUE.md)::[op](op.md)`. One logical call, two links, and every scanner counting links counts it twice. **37 of 172 raw occurrences are the container half of such a pair** — 22% of the corpus. Collapsing each pair to the operation it names takes 172 raw occurrences to 135 logical call sites and 144 deduplicated pairs to 121.

The term also explains two of F-1's seven rather than joining them. Excluding container targets moves the count 18% and switching the unit to link occurrences moves it 20%, and both are largely measuring this one form: once qualified pairs collapse, only **2 of 135** logical call sites still target a group container, both of them the rule-addressed-as-operation defect [SC-5](#success-criteria) repairs. Two terms the grammar treats as independent are mostly one term seen twice — which is the strongest evidence yet that a grammar published as a list of terms needs fixtures rather than totals behind it, because a list cannot show that two of its entries overlap.

This document's own scanner reproduces F-1's ratios and not its absolute figures: 144 deduplicated pairs against F-1's 142, with the same offset of two on nearly every row and every ratio matching within a point. It independently reproduces the three calibration figures — the single dangling target in `prism-update/submit-update`, both correctly-authored self-references, and the 822 link total. The two-edge offset is unexplained and is stated rather than reconciled; it does not bear on any criterion, and the ratio form is what the sensitivity argument rests on.

The count of free terms is **ten**, which is itself the finding: each was discovered by measuring rather than by reading the definition, and the definition reads complete each time. The tenth — whether a call site whose destination resolves to no file counts, and which callee bin owns it — was found the same way, at the analysis gate and recorded at [IA-11](02-assumptions-log.md#log); it is named in [SC-3](#success-criteria) and published by the grammar module.

This has a direct consequence for acceptance. The epic's W2 criterion — that the guard "reproduces the 118-edge inventory" — is **not testable as written**, on two counts: the target number reproduces under no verb list, and the definition it would be measured against does not fix its own terms. It is replaced by [SC-3](#success-criteria), which keys acceptance to a grammar the guard itself publishes with its totals asserted — reproducible by construction rather than by agreement.

This is the sixth count in this area to move under a change of definition, after the five comprehension self-caught, so it is a property of the area rather than a run of bad luck. The standing rule holds without exception: a count is restated with its unit or re-derived before anything is planned against it, and that includes the figures still carried in [02-design-philosophy.md](02-design-philosophy.md), which have not been re-derived under this discipline.

One re-derivation reproduces comprehension exactly and is carried forward: the single real dangling target, an apply of the pull-request creation operation in `prism-update/techniques/submit-update.md` whose relative path climbs one directory too many and lands outside the corpus root.

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | One documented ancestry rule for cross-workflow references, applied identically by the activity-bundle door and the step-bound door, with the addressing specification and the composition routine's comments stating it | A test composes one cross-workflow reference through both doors and asserts identical inputs, outputs, rules and protocol; the graph-navigation group's five shared rules either travel through both doors or are explicitly restated |
| SC-2 | The reference grammar is one shared module, consumed by both the guard and — later — fold delivery, and it contains no anchor-slug computation | Single-definition check: no second grammar or slugger in the tree; #398 W1's surface untouched |
| SC-3 | The guard enumerates every inline call site under a **normative** grammar it publishes in full, and asserts the resulting totals, so a new site fails the guard rather than joining an unmeasured remainder. The grammar fixes **ten** terms: the verb list, case sensitivity of the invoking verb, verb-to-link adjacency, counting unit, container-target inclusion, section scope, anchoring, whether a leading dot is required of a technique-link destination, whether a qualified `group::op` citation written as two links counts as one call or two, and whether a call site whose destination resolves to no file counts as a call site and which callee bin owns it | The guard's own definition is the reference, not a historical count. Changing any published term changes the asserted totals and fails the assertion until re-baselined. Each term is pinned by a fixture rather than by a total alone, because two of the ten were found to overlap and a total cannot show that. The case term carries its *value* and not only its question: the verb matches case-insensitively, which is the reading that reproduces the published 172 raw occurrences and 135 logical call sites |
| SC-4 | Argument conformance is classified across all inline call sites into name-match-satisfied versus genuinely unbound | Guard output, bins asserted; the bins are the disposition worklist |
| SC-5 | Unambiguous defect classes fail hard from day one, with the known sites repaired in the same change: the rule-addressed-as-operation sites and the one dangling pull-request-creation target | Guard exits non-zero on a seeded instance of each class, and the known sites are green after repair. The site count is stated with the grammar term that produces it, not carried as a bare number: **2** rule-addressed sites under the published baseline (both citing `version-control::infrastructure-submodule-paths`), **6** if any invoking verb and any section count. The previously recorded three reproduces under neither |
| SC-6 | Call sites whose callee is named by a value are enumerated and reported as beyond static reach, with the total asserted; where the value is drawn from a set the corpus enumerates, closure over that set is checked instead | Guard output distinguishes unmeasured from clean. The class is three shapes, not one: table-drawn and bind-supplied both resolve; only catalog-selected is genuinely out of reach, and it selects a resource rather than a technique |
| SC-7 | Referenced bodies arrive deduplicated and transitively, within the existing delivery budget, with a delivery event per body | Token benchmark carries a referenced-technique scenario; the heaviest closure in the corpus is 46,865 bytes against a 640,000-character budget at a 200,000-token declared context |
| SC-7a | A delivered callee is keyed as a technique, collapsing against a step-bound delivery of the same operation at both doors, with any call-site binding annotation delivered as a separate block | Of the 81 distinct techniques an inline call reaches, 31 are also bound as an activity step: a delivery test asserts one body, not two, when the same operation arrives both ways in one agent context. No new key namespace appears |
| SC-8 | Traversal delivers each body once and continues at a revisit; no reference cycle fails a load | The three correctly-authored cycle members load green; a synthetic deep chain terminates |
| SC-9 | The stealth reachable-text scan runs over the delivered closure rather than the single technique | Measured cost stays a rounding error on delivery: composition dominates the scan by about two orders of magnitude (22.3 ms against 0.29 ms on the heaviest caller) |
| SC-10 | Every `core-ops.ts` baseline entry whose comment attributes it to inline-reference non-delivery is removed, and the operations it named reach their agent through the delivery path instead | 11 entries in the orchestrator baseline list carry that attribution. Each is removed only once the reference that stood in for it resolves and delivers; an entry still unserved stays, and the residue is reported |
| SC-11 | The design canon, the construct inventory and the addressing specification state what the loader does, with the three-way contradiction closed | The prohibition on technique-to-technique work calls, the specification's call grammar, and the newer conformance entry over inline call sites all read consistently after the pass |
| SC-12 | The corpus loads with unchanged meaning at the corpus commit this package delivers at | Zero regressions across the technique corpus, stated against the delivered submodule commit and its file count rather than against a historical count |
| SC-13 | The 41 already tool-backed logical call sites reach their operation through a typed tool — GitNexus's 38 and Atlassian's 3 — with the 15 intra-group GitNexus calls becoming ordinary calls inside the implementation and the other 26 becoming tool calls. Operations carrying an interpretive tail deliver a tool plus a thin interpreting technique, and those halves enter the guard's worklist. The 49 shell-backed sites keep their prose form, and no `gh` or git write path runs in the server process | The guard's disposition worklist counts **94 logical call sites** at the delivered corpus commit, with the grammar's totals re-baselined against that commit rather than against `34cd5429`; a scan of the server process for a `gh` invocation or a git write returns nothing; each converted operation's tool declares the arguments its prose named |

| SC-14 | A folded call site's delivered closure carries what its callee would inherit at step level — the callee's inherited rules and its inherited inputs and outputs — so a callee is governed when it is folded exactly as it is when it is bound as a step | Per call site, the guard asserts the delivered closure contains the callee's inherited rule set and its inherited I/O blocks. The assertion is the general property rather than a list of named rules, so a group gaining a rule needs no criterion edit. Runtime compliance is out of scope: whether an agent honours a delivered rule is no more statically knowable for a folded callee than for any other rule, and a criterion claiming otherwise would be untestable in the way the 118-edge criterion was |

SC-14 exists because this package was opened over prose obligations that no mechanism checked, and the
cost of that is already measured here: 56 call sites omitting a required input, unnoticed for months
precisely because nothing looked, plus three declared inputs left unsatisfied while this run executed its
own steps. Resting the design's central decision — that a folded callee arrives governed — on another
unchecked prose obligation would reproduce the failure the package exists to remove. The marginal cost is
small: the attributed rules block the decision requires is being built regardless, so the criterion checks
a property of machinery already in scope rather than asking for new machinery.

### Reproducible is not the same as complete

This sits beside [SC-3](#success-criteria) rather than inside it, because it is a limit on what that
criterion authorises rather than a change to what it asserts.

SC-3 makes the guard's total **reproducible**: the guard publishes its grammar, the grammar fixes its ten
terms, and changing a term changes the total and fails the assertion until it is re-baselined. Anyone can
re-derive the number and get the same number. That is the whole of what it claims, and it is enough for a
guard whose job is to assert a total and fail a new site into visibility.

It is not a claim that the grammar sees every place the corpus reaches an operation. The grammar counts an
invoking verb from a published list, adjacent to an unanchored markdown link, inside a Protocol section,
outside fences, with qualified pairs collapsed. A reference that arrives any other way is outside the count
**by design** and is a real consumer regardless. Measured against `gitnexus-operations`: the published verb
list introduces roughly 40% of the reaching tokens, `via` appears on no list while occurring on 33 Protocol
lines that carry an unanchored technique link, and one workflow — `midnight-system-review`, nine reaches
across three files — carries no markdown link and no qualified id at all, so every link-based or `::`-based
extractor reads it as a non-consumer. Case is a second axis: six files spell the tool only as `GitNexus`, and two of those reach
`analyze` semantically with no identifier of any kind.

The two purposes need different properties, and this is the distinction to hold. **A total needs to be
reproducible. A deletion needs to be complete.** An asserted total is sound evidence that the guard counts
what it says it counts, and it is not evidence that nothing else calls the thing being deleted — so it is
never authorisation to delete. Both statements are true at once: the grammar is fit for the guard and unfit
for a retirement decision, and neither fact is a defect in the other. A retirement establishes its consumer
set by a sweep that is deliberately wider than the grammar — every reference form, every verb, case-
insensitive, fences and tables and YAML included — and the grammar's total is not a substitute for that
sweep at any population size.

The corollary for the guard is that a site leaving the grammar's count has not left the corpus. It has left
the count.

**Link resolution is not complete either.** The wider sweep above resolves references by link target under
no verb list, which is broader than the grammar and still not the consumer set. `midnight-system-review`
reaches these operations in ordinary prose. Re-derived at `12400e85`: **five files name GitNexus, three of
them carrying nine reaches** by backticked operation name — `query`, `context` and `impact` in each — and the
workflow carries **zero markdown links naming the group and zero qualified pairs**. The magnitude supersedes
the six-files-and-twelve-reaches figure carried previously; the structural claim it was cited for measures
exact, and that is the claim which bears weight. A link-resolving sweep reads that workflow as a non-consumer
exactly as the grammar does. **A semantic call needs no syntax**,
so no extractor keyed on syntax of any kind — verb, link, qualified pair, dotted address — is a completeness
argument. Completeness comes from reading, and its cost is why it is spent on deletions rather than on
totals.

### What the guard stage inherits: the verb list decides its own coverage

An independent sweep resolved the GitNexus cross-group consumer set by link target under no verb list, with
qualified pairs collapsed per the grammar's ninth term and READMEs, CHANGELOGs and fenced blocks excluded.
Unit: logical call sites. It found **76 cross-group logical call sites across 31 caller files in 4
workflows, reaching 16 targets** — fifteen operations and the group container — against the 23 sites over 11
operations this document's census carried, plus the intra-group edges counted separately.

The distribution is the finding, not the total:

Re-derived at the delivered corpus pin `12400e85`, driving the delivered grammar module's own classifier and
fence-aware link finder and varying only the verb test. Unit: cross-group logical call sites into
`gitnexus-operations`, qualified pairs collapsed, anchored links excluded, `## Protocol` sections only.

| Workflow | Logical call sites | Caller files | Sites the published grammar sees |
|---|---|---|---|
| `work-package` | 32 | 17 | **23** |
| `substrate-node-security-audit` | 22 | 7 | **0** |
| `prism` | 20 | 6 | **0** |
| `ponytail` | **2** | **1** | **0** |
| **Total** | **76** | **31** | **23** |

**The published grammar sees 23 of 76 — 30% coverage. Fifty-three sites are invisible, every one of them
because the invoking verb is not `apply`, the only verb the published verb list contains.** Every site the
grammar sees is in `work-package`. Three workflows score zero, and **five of the sixteen cross-group targets
have their entire consumer set invisible** — the operations `read-cluster`, `read-process`,
`reversibility-signal` and `verify-index`, plus the group container reached as a standalone target.

Three figures the earlier sweep carried are superseded, and one of them is a table defect rather than a
measurement drift:

| Figure as carried | Re-derived at `12400e85` | Verdict |
|---|---|---|
| `ponytail` contributes no counted sites, its row carrying an em-dash | **2 sites in 1 caller file**, and the stated total of 75 equals the sum of the other three rows exactly | Superseded: the row was omitted from its own total, not measured at zero |
| The published grammar sees 17 of 75 | **23 of 76** — 30% coverage rather than 23% | Superseded; the direction and the order of magnitude both stand |
| Seven of fifteen operations entirely invisible | **Five of sixteen targets**, four of them operations and the fifth the group container | Superseded; the denominator counts targets, the container being reached standing alone |

The em-dash row is the second instance in this package of a breakdown that omits a row and still sums
plausibly, after the per-group table found missing `github-cli-protocol`. Two instances in one area make it a
property of these tables rather than a slip, so a breakdown is checked against its own total before anything
is planned against it.

This is the guard stage's first question rather than a note against it, because it decides what SC-3's
asserted total means. A guard asserting a reproducible total over a one-verb grammar reports clean across a
group where 77% of the call sites are unchecked — and it is not wrong to do so, since the total reproduces
exactly as SC-3 requires. The criterion is satisfied and the coverage is 23%, which is the distinction this
section exists to hold.

So whether the verb list widens is a live decision for tasks 6 and 7, and its cost is measured against the
published grammar rather than estimated. The verb list is the term the 59% edge spread was measured against,
so every widening re-baselines every asserted total and changes the fixture pinning that term.

**The verbs actually in use, found by tallying what precedes every unanchored technique link in a Protocol
section at `12400e85`.** `apply` leads at 107 occurrences. Then `use` at 12 as a standalone verb and more in
phrases, `via` on 33 lines carrying such a link — the dominant connector in
`substrate-node-security-audit`, which writes *derive … via*, *seed … via* and *cross-check … via* — and
`check via` as a recurring compound. Twenty-seven links carry **no preceding word at all**, and
`substrate-node-security-audit` also reaches operations after a bare colon, so a verb list of any width
leaves those outside the count.

| Verb list | Logical call sites | Deduplicated pairs | Caller files | Distinct callees | GitNexus cross-group coverage |
|---|---|---|---|---|---|
| `apply` — as published | **129** | **115** | 72 | 58 | 23 of 76 — **30%** |
| plus `via` | 170 | 150 | 92 | 68 | 49 of 76 — 64% |
| plus `use`, `follow`, `per` | 198 | 178 | 101 | 73 | 67 of 76 — 88% |
| plus `see`, `call`, `run`, `check` | 211 | 191 | 105 | 79 | 70 of 76 — 92% |

Two readings of that table matter. **The first widening buys the most**: adding `via` alone takes coverage
from 30% to 64% for 35 further pairs, where the last four verbs add 13 pairs for 4 points. And **the pair
series carried previously is superseded on basis rather than arithmetic** — 148 to 204 to 235 was measured
with the other terms set loosely, and holding the published grammar's other nine terms fixed gives **115 to
150 to 178 to 191**. The widening is real and roughly two thirds the size the earlier series implies.

Deciding to keep one verb is a defensible answer that is recorded as a decision, because the alternative —
leaving it unstated — is what let a one-verb grammar read as a complete one.

### Cleanliness is not reachability, and in Atlassian they run the other way

Two re-derivations against `atlassian-operations` (24 files: 23 operations plus the container):

| Figure as carried | Re-derived | Verdict |
|---|---|---|
| 21 of 24 files reached by nobody | **18 of 24 unreached, 6 reached** | Superseded; overstates orphaning by 3 files |
| 19 of 24 files showing no residue | **20 of 24 clean on all five keep-criteria** | Superseded by one file |
| Reached and clean are nearly disjoint | **They overlap heavily — 4 of the 6 reached files are clean** | Superseded; the relationship is inverted |

The third row is the one that matters, and it inverts the hazard rather than resizing it. The concern
recorded against a naive "retire the clean ones" pass was that it would delete files nothing calls, which is
untidy but harmless. Measured, the opposite is the live risk: two thirds of the reached set is clean, so the
files a cleanliness filter selects first are `get-jira-issue`, `user-info`, `edit-jira-issue` and
`comment-jira-issue` — **all four bound as live steps** in `01-start-work-package.yaml` and
`07-assumptions-review.yaml`. Cleanliness measures what a file contains; reachability measures who needs it;
the two are independent, and filtering on the first deletes live bindings. Retirement is gated on
reachability, with cleanliness deciding only what survives in a file that stays.

Two defects surfaced while measuring this, both of the class the package already counts. The container's
`transitions-are-dynamic` rule requires a transitions lookup before a transition, and the only live
consumer of `transition-jira-issue` performs none — and binds that operation without its required
`status_transition` input, so it is also one of the omitted-required-input sites. And
`resolve-cloud-id-once`, the container's first rule, points at an operation nothing reaches: the caller
asserts a non-null cloud id and instructs the agent in prose to call the raw tool, which is the shape
GitNexus's `must-use-operations` rule exists to forbid. Both are recorded in the
[deferred-items register](deferred-items.md) rather than repaired here, being outside this package's
converted scope.

## Assumptions

Assumptions surfaced during elicitation: [assumptions log](02-assumptions-log.md) — record each there (categories: Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria Interpretation), not here.

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | Does the falsified hoist premise reopen the doctrine, or is the recorded decision executed? | Executed with one correction. The premise that died was the blanket hoist, which the visibility rule never proposed; the rule's own scoping survives. The correction is the cycle rule |
| Stakeholder | Who decides, and who is affected? | The user is sole stakeholder, acting as product owner and domain expert. Affected: workflow authors, executing agents, guard maintainers, and whoever works the migration batches downstream |
| Context | What does "blocked on W0" cost, and is #398 W1 blocking? | W0 is not external — see the scope answer. #398 W1 is not blocking: this package's surface is the unanchored references, and anchor semantics stay in #398 |
| Scope | How much of the epic does this package deliver? | The full arc. Working that through pulls W0 into this package as a deliverable rather than a wait on another party, and that is accepted |
| Success | Are the epic's acceptance criteria usable as written? | Two are not. The 118-edge reproduction criterion is untestable and is replaced by SC-3; the 554-file criterion is keyed to a stale count and is restated against the delivered corpus commit |
| Success | How is a delivered callee keyed in the delivery ledger? | As a technique, with call-site binding annotations carried as a separate block — keeping the collapse against a step-bound delivery for the 31 techniques reached both ways |
| Scope | Could the callee techniques be replaced by wrapper code, removing the need for a fold? | Partly, and the boundary is where the code would run rather than the wrapper share. 90 of 135 logical call sites wrap an external call and 45 do not; the division is real and the ratio stable across three units. The 41 sites already backed by a typed tool convert as a sixth deliverable; the 49 shell-backed ones keep their prose form. The fold is still owed — for 94 logical call sites at corpus commit `34cd5429` |
| Scope | Which operations convert cleanly? | 5 of the 37 wrapper operations reached convert with nothing left over, carrying one call site each. 32 carry a rule, a threshold, an escape hatch, a human channel or a nested call, and split into a tool plus a thin interpreting technique |
| Context | Does the tools-not-scripts argument clear the whole wrapper population? | No, and it is what bounds the conversion to 41 sites. Those 41 already call a typed tool and cross no new boundary; 49 shell out under a contract that mandates host credentials and unset tokens, so converting those would move write access into the server process |
| Success | Does conversion moot SC-3's grammar, or the guard? | Neither. The worklist holds 94 logical call sites at corpus commit `34cd5429` rather than 135, and every one of the grammar's published terms is still fixed for the same reason — a free term admits two readings at any population size. Loud-at-runtime is a real gain but covers only executed paths, and the escape hatches are on cold ones |
| Success | Does conversion settle the door question at SC-10? | No, and it removes none of the eleven. The 2 wrapper entries are shell-backed `version-control` commit operations that stay prose, and the other 9 are engine, so F-2 and F-3 survive in full and still gate the retirement |
| Problem | Do the wrapper boundary and the engine-target exclusion agree? | No — a shared blind spot rather than corroboration. The exclusion removes 1 to 4 of 34 engine-target sites; 30 are engine calling engine, which it permits in full |

### Clarifications Made

- **"Blocked on W0" resolved.** #405 was closed on filing, subsumed into #397 as W0. There is no open issue, no branch and no pull request delivering it, and the epic's convention is one pull request per work item. Nothing is in flight to wait on, so choosing the full arc means this package delivers W0. It is small — the capture puts the fix at which techniques directory the composition routine resolves ancestors from, one specification section and one test — but it is a fourth deliverable, and a wait agreed is not a build agreed. This returns to the stakeholder as a gate.
- **W0's own design choice is already made.** The capture offers two coherent end states, home-tree ancestry or executing-workflow ancestry. W3a composes "under the home-ancestry rule", so choosing the full arc chooses home-tree. Recorded rather than absorbed.
- **The flag reassurance does not cover W3a.** The note carried against this package's scope — that activation is staged behind a server flag so the corpus never half-folds — describes W3b, which ships flag-gated. W3a has no flag and needs none: it is additive delivery, and call sites keep prose semantics. The half-fold risk belongs to the migration batches, which are out of scope.
- **The cycle correction reaches further than the doctrine record.** The epic body's own W3a description states that referenced bodies are "followed transitively with reference cycles failing the load". Correcting the rule therefore amends the epic text and its acceptance criteria, not only the doctrine decision record.

### Clarifications made on the reopened pass

- **The wrapper hypothesis was verified operation by operation, and its ratio survived while its counts did not.** The 67% wrapper share is stable across three units, which in an area where seven counts have moved under a definition change is the strongest form of evidence available here. Every absolute figure it was framed with was low, and the analytical callees it counted are not in this census at all.
- **Converting a group deletes its internal calls rather than converting them.** 69 of 135 logical call sites are intra-group, and all 17 calls to the corpus's most-called inline technique come from its own siblings. This is the largest single effect measured on the reopened pass and it favours conversion. Within the converted 41, it accounts for the 15 GitNexus sites that leave the corpus outright against the 26 that become tool calls.
- **The proposal's own trust-boundary argument does not clear its largest group.** GitHub's group contract mandates the host shell and unset tokens; a server-hosted tool needs the credential the contract says to leave unset.
- **A ninth free grammar term was found, and it subsumes two the grammar already names.** The qualified `group::op` two-link form is 22% of raw occurrences, and container-target inclusion and counting unit are largely measuring it. A published list of terms cannot show that two of its entries overlap, which is the case for fixtures rather than totals.

### Open Questions Resolved

- Whether the activity layer properly handles technique use, as the hoist proposal assumed — no; 82 of 748 bind sites carry the same contract defect.
- Whether fragments could carry a hoisted technique — no; strict two-key container, no reference field on a technique step, resolver visits checkpoints only.
- Whether stop-at-revisit costs anything against fail-the-load — no; measured identical.
- Whether the fold is still needed once the tool-backed wrappers convert — yes, for 94 logical call sites at corpus commit `34cd5429`; nothing in the wrapper analysis reaches the engine layer.
- Which of the wrapper population converts — the 41 logical call sites already backed by a typed tool, GitNexus's 38 and Atlassian's 3, as a sixth deliverable rather than a substitution for the fold. The 49 shell-backed sites keep their prose form, because their contracts require the host shell, host credentials, host network and host SSH agent with `GH_TOKEN` and `GITHUB_TOKEN` unset, and a server-hosted tool would need the credential those contracts leave unset.
- Whether comprehension's four inexpressible shapes live only in the non-mechanical remainder — no; three of the four are present throughout the wrapper population. They obstruct a hoist, not mechanisation, and the remainder resists code for a different and stronger reason.

## Confirmation

**Confirmed by:** User, at checkpoints `stakeholder-transcript` and `elicitation-complete` (first pass).
**Date:** 2026-08-17
**Notes:** Seven decisions settled — keep the visibility rule and correct its cycle input; deliver the full arc; accept W0 as a fourth deliverable knowing it departs from one-pull-request-per-work-item; file the borrowed-activity gap as its own ticket through the follow-ups activity; key a delivered callee as a technique with annotations carried separately; replace the 118-edge acceptance criterion with SC-3; restate the 554-file criterion against the delivered corpus commit.

**Reopened pass:** Confirmed by the user at `elicitation-complete`, 2026-08-22. One decision settled — the wrapper population converts only where it is already tool-backed, which is the 41 logical call sites in GitNexus and Atlassian, and that conversion is an additional deliverable rather than a substitution for the fold. Four further items carry into requirements without a gate, each a measurement or a correction rather than a choice: SC-3 strengthened to nine published grammar terms; SC-5's site count restated with the term that produces it; RE-7's denominator corrected to 11 of 20; the 822 anchoring mismatch recorded. SC-13 states the conversion's acceptance, and the guard's disposition worklist stands at 94 logical call sites at corpus commit `34cd5429`.
