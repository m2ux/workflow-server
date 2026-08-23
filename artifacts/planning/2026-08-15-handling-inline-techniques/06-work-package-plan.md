# Handling Inline Techniques - Implementation Plan

> plan · HIGH · Ready · 11-16h agentic + 3-4h review · 2026-08-22

## Overview

### Problem & Scope

Problem, scope, and success criteria: [requirements](03-requirements-elicitation.md).

## Inputs

- [Requirements](03-requirements-elicitation.md#success-criteria) — the thirteen criteria this plan schedules against, and the six numbered deliverables.
- [Implementation Analysis](05-implementation-analysis.md#gap-analysis) — the thirteen gaps that become tasks, and the two constraints this plan turns into sequencing.
- [Implementation Analysis](05-implementation-analysis.md#baseline-metrics) — the baselines every task's acceptance is measured against.
- [KB Research](04-kb-research.md#recommended-approach) — the shared-grammar precedent, the categorical argument for cycle tolerance, and the fixtures-over-totals correction.
- [Codebase Comprehension](15-codebase-comprehension.md#what-elicitation-inherits) — the four call shapes a hoist cannot express, and where a fold attaches.

## Proposed Approach

### Solution Design

The work builds one shared reference grammar and then hangs three consumers off it: a guard that
enumerates and argument-checks every inline call, a traversal that delivers referenced bodies, and the
written authorities that describe both. The grammar module is the first task because everything else
imports it, and it is deliberately held narrower than any consumer wants — it classifies links and fixes
the ten counting terms, and it computes no anchor slug, that surface staying with #398.

**Reference traversal is new, not amended.** No reference discovered during resolution is followed
anywhere in the tree today, so there is no traversal to change and no cycle detection to correct. The
cycle-rule deliverable is therefore the *policy the new traversal is built to* — a visited set carried
across a depth-first walk, delivering each body once and continuing at a revisit. Delivery is a
reachability problem rather than an evaluation problem: no closure member computes a value another member
consumes, which is why revisit-tolerance is correct independently of what the corpus happens to contain.

**A folded callee arrives governed as it would at step level** (PL-1, settled). The governing principle is
that anything a callee would normally inherit is not lost because the callee was called: its rules and its
inputs and outputs travel with it. A qualified call is two links naming one operation, so the closure
carries the operation body and not the group container body — but the callee's inherited context rides
beside that body, scoped to the call. The caller therefore joins no container tree and gains no permanent
obligation, while the callee runs under the constraints that govern it. Parity is the test: what the callee
would inherit as a step, it inherits when folded.

The alternative readings are closed for stated reasons. Delivering the body with no inherited context at
all is the loss the principle forbids, and it would silently drop the three rules the wrapper analysis
identified as the reason a wrapper is prose rather than code — the human agreement before replying to
review feedback, the instruction to read the target repository's own guidance, and the escape hatch that
re-derives a caller set where the graph holds no edge. Delivering the container bodies does not lose the
inheritance but discharges it by merging the callee's obligations permanently into the caller's set,
changing the caller beyond the call.

**What this costs, measured rather than estimated.** The heaviest caller's closure is 12 operation bodies
at 40,671 bytes, and the inherited rules text adds 5,580, for 46,251 — against 46,865 for the discarded
option that ships whole container bodies. The two are 614 bytes apart, 1.3%, because rules text is 90% of
the container bodies it replaces, so **no delivery-cost argument separates them**; the decision is about
obligation scope alone. All the readings sit between 6.35% and 7.32% of the 640,000-character budget, and
the cost is accepted rather than minimised.

**Half the mechanism exists, and the half that does not is the load-bearing half.** Delivering a
technique's rules without its container body is already the normal case: the rule set is aggregated from a
separately computed set of rule-source techniques rather than from the set of delivered bodies, and a
qualified `group::op` reference already has the loader deliver the operation body while putting the group
container in the rule-source set alone. The inherited inputs and outputs are likewise free — the
own-versus-inherited partition is computed inside composition, so a callee composed by the same routine
receives its `inherited_inputs` and `inherited_outputs` blocks whether it arrives as a step or as a
reference. **Two things are genuinely owed.** Rules opt out of that partition, being written back as one
merged map, and their in-flight attribution is discarded at formatting — so an attributed rules block is
needed. And the per-call decoration pass that annotates inputs and outputs is keyed on a bound step id and
a step binding, neither of which a call site has, so it needs a call-site identity before it can be
extended to rules. **Without both, the design degrades to the option it rejected**: the rules arrive merged
and unattributed, the caller carries them as its own, and the only thing gained is the absence of two
container bodies. The attributed block is not a refinement on top of this decision — it is the mechanism
that makes the decision real, which is why [SC-14](03-requirements-elicitation.md#success-criteria) asserts
the property rather than trusting it.

**Folded bodies ride the channel their compensation already rides** (PL-2, settled). The eleven
core-operations entries attributed to non-delivery are served at the orchestrator door, which carries no
budget parameter and cannot drop content, so charging folded bodies to that same operations-bundle channel
makes the retirement like-for-like: compensation and replacement ride one channel, and SC-10 cannot outrun
SC-7 for those eleven entries.

The two alternatives lost for different reasons, and the difference matters. **Charging the budgeted eager
channel is disqualified rather than rejected** — it would move eleven entries whose whole purpose is
compensating for non-delivery onto a channel that drops content at first overflow, with no flag, turning a
channel that cannot lose content into one that loses it silently. That is precisely the failure this
package exists to remove, so taking it would have the package reintroduce its own subject. **Adding a
budget parameter to the orchestrator door lost on measurement, not on principle**, and is recorded here as
available and not taken: it is the option that makes the third door legible and answers
[F-2](04-kb-research.md#findings) and [F-3](04-kb-research.md#findings) head-on, and it was declined only
because the starvation it guards against is not live — the heaviest closure sits at roughly 7.2% of the
640,000-character budget. Adding contract surface to a door that has never carried a budget, to pre-empt a
problem the measurements say is absent, is the speculative abstraction the design principles rule out. A
later package facing a larger corpus should revisit it on that measurement rather than rediscovering the
argument.

The cost is stated rather than hidden: this channel's serialised size seeds the eager counter at the
activity door, so the budget SC-7 speaks of is partly spent before any step technique is considered, and
**every task claiming to fit that budget names which channel it was measured against.** And this choice
does not close F-2 or F-3. They remain open findings: the door inventory and the counter behaviour they
describe are unchanged by deciding which counter a folded body draws on.

**The conversion is a deletion rather than an addition** (settled at the `gitnexus-conversion-shape` gate).
The operations being converted are prose wrappers that name a tool and then add something around it. The
tool they name is not this server's: it belongs to a separate MCP server the agent already holds a
connection to, which already declares its arguments and already rejects a call that omits a required one.
So the conversion retires the wrapper and lets the call reach that tool directly, keeping only the
interpreting half where the wrapper holds a rule, a threshold, an escape hatch, a human contact or an
onward technique call — the parts no tool schema can carry.

**The alternative is recorded as available and not taken**, on the same footing as the orchestrator-door
budget parameter under PL-2. Registering the eleven distinct operations as tools of this server would have
taken the tool surface from 18 to as many as 29 and given the conversion a guarantee this server owns
end-to-end. It was declined on architecture rather than on cost: the server makes no outbound calls of any
kind today — no HTTP client, no MCP client transport, no dependency on either external server anywhere in
the source — so registering them means building an outbound client purely to forward calls to a server the
agent already reaches, duplicating eleven typed tools. That is a new capability rather than a conversion,
and it is what the design principles rule out twice over, against speculative abstraction and against
adding a dependency before exhausting those in place. A later package that needs this server to own the
guarantee should revisit it as the client question it is, rather than as a conversion detail.

### Alternatives Considered

The two decisions carrying the most weight — a folded callee arriving governed, and the counter a folded
body draws on — are narrated in the Solution Design above, each with the readings it closes and why. The
remaining decisions:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| One classifier owns the technique-versus-resource link partition | The blind spot is spelling-dependent: a bare one-slash technique path is claimed as a resource id while its dot-prefixed spelling is not, making it invisible to exactly the guard SC-3 exists to make total | Slightly wider than the minimum SC-2 demands | **Selected** |
| Leave the link-space collision to follow-ups | A smaller first change | The second scan is built on the predicate carrying the defect, so it inherits it; the module is a deliverable either way, so the saving is only the partition's own tests | Rejected |
| Acceptance pinned by a fixture per grammar term | Reproducible by construction; matches the repo's existing per-finding triage convention | New machinery — no guard in the registry asserts a total today | **Selected** |
| Acceptance pinned by an asserted total plus a re-baseline | One line of verification | A regenerable baseline with the reason field removed, which is the mechanism this repo retired and recorded its reasons for retiring | Rejected |
| Commit sequencing inside one pull request | Keeps the shared grammar module in one reviewable change with its three consumers | Requires the ordering below to be honoured | **Selected** |
| Splitting the pull request per work item | Matches the epic's stated convention | Separates the grammar module from the guard, the traversal and the authorities that consume it | Rejected |

### Evidence this run produced about itself

Three records for the later activities, each with a home other than this plan; this subsection is the
pointer so none is lost.

**The binding-gap rate, for the [provenance log](08-provenance-log.md).** Four declared inputs went
unsatisfied while this run executed its own steps — `source_material`, which the server marked UNRESOLVED;
`default_branch` and `github_issue_number`, both declared and absent from the session bag, resolved from
`origin/HEAD` and from the pull request's own issue link rather than guessed; and `assumption_categories`,
whose description says it arrives by step binding where the binding activity supplies none. **The finding
is the rate, not the list.** Every one was met while executing a step, and none was found by scanning for
it — so this defect surfaces at a rate an execution path reveals and a corpus scan does not. That is
first-hand evidence for the activity-layer contract gap measured at 82 of 748 bind sites, and it is
stronger than the count of four, which is only as large as this run happened to be.

**A commit message superseded by its artifact.** The message for `470eeea` records SC-10 as retiring 2 of
11 baseline entries where the measurement is 0 of 11. The history stands as written under the no-amend
rule; anything citing that commit cites the artifact figure and notes the message is superseded.

**The batch block is intermittent, not absent.** Every activity of this run before assumptions-review
reported no `batch:` block on its delivery, and each worker correctly defaulted to taking no further
activity rather than assuming room. The block was present on the assumptions-review delivery. So the
behaviour is intermittent rather than missing, which is a different and more useful finding than the
suspected server defect the earlier notes recorded — for the close-out.

### Commit sequencing

The review hazard is ordering, not size. The conversion removes 41 of 135 logical call sites from the
corpus whose totals the new guard asserts, so a guard baselined before the conversion lands is green
against a corpus the same change is still editing, and a reviewer cannot separate a guard defect from a
legitimate re-baseline. The ordering that removes it:

1. Tasks 1-2 (grammar module, W0 ancestry) — no corpus effect.
2. Tasks 3-4 (conversion, prose retirement) — corpus-affecting work.
3. Task 5 (the two rule-addressed repairs and the dangling target) — the last corpus edit, and the submodule re-pin closes the corpus stage behind it.
4. Task 6 (guard) and Task 7 (fixtures) — totals baselined here, against the delivered corpus commit.
5. Tasks 8-12 — delivery, doors, retirement, scan, authorities.

The re-pin belongs to the last corpus edit rather than to the conversion, because the pin is what makes a
corpus commit citable and the guard's totals are asserted against the pinned commit. Re-pinning after
Task 4 and then editing the corpus again in Task 5 would leave the pin naming a commit the corpus has since
moved past, which is the state the sequencing exists to prevent: a guard baselined against a pin that no
longer describes the tree. One re-pin, after the last corpus edit, and the corpus stage ends there.

### Assumptions

Assumptions underlying the approach: [assumptions log](02-assumptions-log.md). All are settled — none open,
none deferred. The three design decisions this plan rests on are recorded above: a folded callee arrives
governed (PL-1), folded bodies are charged to the operations bundle (PL-2), and the shared grammar module
owns the technique-versus-resource link partition (PL-3). PL-1's resolution puts an attributed rules block
of 5,580 bytes on the channel PL-2 selects, above the 40,671 of operation bodies on the heaviest caller, so
the two are consistent by construction rather than by coincidence.

## Implementation Tasks

### Task 1: Shared reference grammar module (40-60 min)
**Goal:** One narrow module fixing the ten counting terms and classifying a markdown link as technique
reference, resource reference, or neither, consumed by both the guard and delivery.
**Deliverables:**
- `src/utils/reference-grammar.ts` - term constants, link classifier, call-site extractor; no anchor slugger
- `src/utils/resource-ref.ts` - resource claiming delegates to the shared classifier
- `tests/reference-grammar.test.ts` - classifier cases including the bare-slug and slash-bearing forms

### Task 2: Home-tree ancestry for cross-workflow references (20-30 min)
**Goal:** All three ancestor-resolution sites resolve container contracts from the callee's own source
workflow.
**Deliverables:**
- `src/loaders/technique-loader.ts` - the two sites that resolve from the requested workflow take the source workflow
- `tests/technique-loader.test.ts` - one cross-workflow reference composed through both doors, asserting identical inputs, outputs, rules and protocol against the shared projection

### Task 3: The wrapper conversion — DEFERRED at the `gitnexus-conversion-acceptance-unsatisfiable` gate

**Status: unstarted, and deferred to a requirements decision rather than rescheduled.** The conflict is
between two published clauses, so no implementation choice resolves it. SC-13 stays **explicitly open**
rather than partially delivered, which is what keeps the guard's baseline in tasks 6-7 honest: a fraction of
a criterion delivered is a baseline nobody can interpret.

**Why the acceptance cannot be met.** The task's two clauses were that each retained interpreting half
declares the arguments its prose named, and that the twenty-three cross-group sites stop being inline call
sites. Retire-wrappers-only keeps every half holding a rule, a threshold, an escape hatch, a human contact
or an onward call — and a half worth keeping is a half that must be called, which is an inline call site. So
the sites narrow rather than disappear. Classifying all 17 GitNexus operations against the five
keep-criteria, and assuming the shared staleness sentence is extracted first, **2 retire whole**:
`read-cluster` and `read-process`. Retirement therefore removes **2 of 23 cross-group sites**, both links in
one file.

**The premise failed measurement four times, and every correction shrank it.** 41 converted sites at the
outset; then the "five convert with nothing left over" figure turned out to count a different population;
then zero of the eleven retired whole; then 2 of 23 sites. A premise that shrinks under every re-derivation
is a premise to re-decide rather than to re-estimate, and that is the deferral's ground.

**A second, independent blocker.** The group container's own `must-use-operations` rule forbids the target
state in as many words: raw `gitnexus_*` calls and Cypher must not appear in technique protocols, and raw
calls live only inside the operation procedures. A caller reaching the tool directly is exactly that. The
rule is cited by dotted address from three places in `substrate-node-security-audit`, so retiring it is a
cross-workflow edit rather than a local one.

**Two facts about the population, recorded because they bound any later attempt.** `read-cluster` and
`read-process` read MCP *resources* rather than calling tools, so no tool schema could hold them under any
conversion shape — the two operations that retire most cleanly are the two a tool cannot replace. And the
staleness sentence sits in **twelve** operation files in two spelling variants, against the eleven carried
previously; the container already half-states it as `index-freshness-first`, so extracting it is a
de-duplication into a rule that exists rather than a new rule.

**The alternative, recorded as available and not taken**, on the same footing as PL-2's orchestrator-door
budget parameter. Each interpreting half is promoted into a container rule; the operation files then retire;
each caller makes the tool call directly and cites the rule by dotted address — the shape two
`substrate-node-security-audit` techniques already use. This delivers all 23 sites and preserves the
interpreting content once rather than duplicating it into callers, and it is the reading the requirements'
own finding that *the reasoning is in the containers, not the operations* points at. Its cost is **roughly
49 to 75 consumer sites edited** and `must-use-operations` rewritten with its three cross-workflow
citations. It may be the right architecture discovered late; that judgement belongs to whoever picks the
deferral up, which is why the option is recorded with its cost rather than dismissed.

### Task 4: Atlassian intra-group calls resolve into their callers (30-45 min)
**Goal:** No Atlassian operation reaches a sibling from its own Protocol, so the group's intra-group call
sites leave the corpus.
**Deliverables:**
- `workflows/meta/techniques/atlassian-operations/` - the three Protocol-section intra-group calls resolved, taking the group from 3 to 0
- the `workflows` gitlink - re-pinned to the delivered corpus commit, after Task 5

The group's ten intra-group references divide by section, and only one part is a call site. **Seven sit in
`TECHNIQUE.md`'s `## Rules`**, where a rule citing the operation it governs is the rule's own form and the
grammar — scoped to Protocol sections — does not count them; they stay. **Three sit in Protocol sections**,
and all three are the group's entire logical call-site count, reproducing the census figure of 3 exactly.
Each resolves on its own terms: the transition operation's hatch restated an obligation
`transitions-are-dynamic` already imposes unconditionally, so it goes and the invariant is cited instead;
the create-issue hatch names the tool its one-line callee wraps; and `resolve-cloud-id` held a **reference to
itself**, telling the reader of that operation to apply that operation, which is a misplaced sentence rather
than a recovery path — the ordering obligation it stated lives in `resolve-cloud-id-once`.

The original rationale for this task was conditional on the conversion: an intra-group call becomes an
ordinary function call once the group becomes code. With the conversion deferred that rationale is
unavailable, and the independent one is narrower and holds on its own — two of the three callees are
one-line pure wrappers, so the reference carried indirection rather than content, and the third was
circular. `list-jira-issue-types` becomes unreached by this change; the file stays, because deleting it is a
conversion act.

### Task 5: Unambiguous defects repaired (15-25 min)
**Goal:** The two rule-addressed-as-operation sites and the one dangling target are correct.
**Deliverables:**
- `workflows/.../infrastructure-submodule-paths` citations - addressed as rules rather than operations
- `workflows/prism-update/techniques/submit-update.md` - the relative path resolves inside the corpus root

### Task 6: Inline reference guard (60-90 min)
**Goal:** Every inline call site is enumerated under the published grammar, resolved through the server's
own loader, and its arguments classified into name-match-satisfied versus genuinely unbound.
**Deliverables:**
- `scripts/check-inline-references.ts` - enumeration, resolution, argument bins, and the value-named-callee report
- `scripts/guards.ts` - registry entry for the new guard
- `scripts/inline-reference-triage.json` - per-finding verdicts with named rationales
- every corpus-scoped guard - resolves its root strictly, so an unprovisioned corpus reports unmeasured rather than clean

**This task opens with a decision, not with a script: how wide is the verb list.** The measurement is in
[requirements](03-requirements-elicitation.md#what-the-guard-stage-inherits-the-verb-list-decides-its-own-coverage)
— the published one-verb list sees 17 of the 75 GitNexus cross-group logical call sites, three whole
workflows score zero, and seven of fifteen operations have their entire cross-group consumer set invisible.
The guard's total still reproduces, so SC-3 is satisfied at 23% coverage; the criterion and the coverage are
separate facts. Widening is costed: the verb list is the term the 59% edge spread was measured against, so
every widening re-baselines every asserted total and changes the fixture pinning that term — 148 pairs at
one verb, 204 at five, 235 at nine. Keeping one verb is a defensible answer. Leaving the width unstated is
not, because that is what let a one-verb grammar read as a complete one.

### Task 7: Grammar fixtures and asserted totals (40-60 min)
**Goal:** Each published term is pinned by a fixture, so changing a term changes a fixture rather than only
a number.
**Deliverables:**
- `tests/fixtures/reference-grammar/` - one fixture per term, including the two that overlap
- `tests/reference-grammar-conformance.test.ts` - totals asserted against the delivered corpus commit

**The term count is ten, and the tenth is named rather than implied.** This plan, Task 1's delivered module,
the [test plan](06-test-plan.md#acceptance-criteria-matrix) and
[SC-3](03-requirements-elicitation.md#success-criteria) all publish **ten** terms, the tenth being whether a
call site whose destination resolves to no file counts and which callee bin owns it. One fixture per term
cannot be written against two counts, so the fixture set is what forced the count to be stated in one place —
the argument for fixtures restated as a live instance. The tenth is named explicitly because an unnamed term
is how the first nine each came to be discovered by measuring rather than by reading.

### Task 8: Reference traversal with a visited set (60-90 min)
**Goal:** Referenced bodies are collected transitively and deduplicated, each delivered once, the walk
continuing at a revisit.
**Deliverables:**
- `src/loaders/reference-traversal.ts` - depth-first walk carrying a visited set, emitting a delivery event per body
- `tests/reference-traversal.test.ts` - the three correctly-authored cycle members, and a synthetic deep chain

The corpus cycle is identified rather than described, so the test binds to named files. `verify-index` and
`analyze` in `meta/techniques/gitnexus-operations/` reach each other: `verify-index` applies `analyze` on
the index-absent branch and again when the index is stale, and `analyze` closes by optionally applying
`verify-index` to confirm freshness. `verify-index` also applies itself, retrying after the analyze it
triggered. That is a two-member cycle plus a self-loop, in one directory, between two files — the smallest
live fixture the visited set can be exercised against, and the one a naive intra-group resolution walks
forever. Both arms are guarded in prose (one optional, one branch-conditional), which is why the corpus
loads today and why the cycle is invisible until something follows the references: the traversal is the
first consumer that does.

### Task 9: Folded bodies are keyed as techniques and arrive governed (90-120 min)
**Goal:** A delivered callee collapses against a step-bound delivery of the same operation, and carries the
inherited context that governs it, scoped to the call.
**Deliverables:**
- `src/utils/delivery.ts` - folded callees keyed by technique identifier; annotation block keyed separately
- `src/loaders/technique-loader.ts` - rules join the own-versus-inherited partition, emitted as an attributed block rather than one merged map
- `src/utils/binding-provenance.ts` - the decoration pass takes a call-site identity where a bound step id does not exist, and covers rules alongside inputs and outputs
- `tests/delivery.test.ts` - one body when the same operation arrives both ways in one agent context
- `tests/technique-loader.test.ts` - a folded callee's inherited rules and inherited I/O both present and attributed to the call

Inherited inputs and outputs need no work here: the partition is computed inside composition, so a callee
composed as a reference receives them exactly as one composed as a step. The task is the rules half plus
the call-site key. This is the one re-estimate in the plan — 30-45 minutes to 90-120 — which moves the
total from 10-15h to **11-16h agentic**, the header figure carrying the change.

### Task 10: Door coverage and the charging rule (60-90 min)
**Goal:** Each door either delivers folded bodies or is documented as not delivering them, and the counter
each body is charged to is explicit.
**Deliverables:**
- `src/tools/workflow-tools.ts` - folded bodies attached at the activity and orchestrator doors, charged to the operations bundle
- `src/tools/workflow-tools.ts` - the orchestrator door either takes an agent identity, so a folded callee collapses per technique there as SC-7a requires, or documents that it collapses only as a whole bundle; today it has neither an identity nor a per-technique key
- `src/tools/resource-tools.ts` - budget input and multi-body response shape for the step-bound door
- `docs/resource_resolution_model.md` - the door-and-counter table corrected to the twenty-entry orchestrator list

### Task 11: Core-operations entries retire per door (30-45 min)
**Goal:** Each attributed baseline entry is removed once the reference standing in for it delivers at the
door that entry serves; an unserved entry stays and is reported.
**Deliverables:**
- `src/loaders/core-ops.ts` - attributed entries removed, residue commented with the door still owed
- `scripts/check-harness-adapter-set.ts` - the non-runtime consumer follows the list it reads

### Task 12: Closure-scoped scanning and delivery measurement (30-45 min)
**Goal:** The reachable-text scan reads the closure rather than a single technique, across the corpus
rather than one workflow, and the delivery benchmark can express a referenced-technique scenario.
**Deliverables:**
- `scripts/check-stealth-isolation.ts` - scans the delivered closure; workflow scope defaults to all
- `scripts/run-token-benchmark.ts` - a scenario mechanism, carrying a referenced-technique scenario

### Task 13: The written authorities state what the loader does (45-70 min)
**Goal:** Canon, construct inventory and addressing specification agree with each other and with the
platform, and the cycle policy is stated where the epic states its opposite.
**Deliverables:**
- the design canon - the technique-to-technique prohibition reconciled with the conformance entry over inline call sites
- the addressing specification - the ancestry rule, the call grammar, and revisit-tolerance with its categorical reason
- the construct inventory - the inline call site as a governed surface
- epic #397 body and acceptance criteria - the cycle policy and the replaced edge-count criterion

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria); baselines and
measurement: [implementation analysis](05-implementation-analysis.md#baseline-metrics). Task-level
acceptance beyond those: the guard's asserted totals are baselined only after Task 5 (gap
[G3](05-implementation-analysis.md#gap-analysis)), and every corpus guard can report unmeasured
(gap [G10](05-implementation-analysis.md#gap-analysis)).

## Testing Strategy

Test cases and acceptance matrix: [test plan](06-test-plan.md). Ordering constraint the test plan does not
carry: the corpus submodule must be provisioned in the working tree before any corpus-scoped case runs, or
it reports unmeasured rather than failing.

## Dependencies & Risks

### Requires (Blockers)

- [ ] The corpus submodule provisioned in the work-package worktree — currently empty there, so every corpus-scoped check reads unmeasured.
- [ ] The feature branch brought current with `main` — it sits 54 commits behind and 1 ahead, and is published under PR 466 at exactly its remote. Integration is the implementation activity's first act: a rebase would rewrite a published commit and force a non-fast-forward push, so the branch is merged forward, and doing it before any implementation exists would bury the change under an unrelated merge. The same step handles the sibling test-suite branch named in the risks below.

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Guard totals baselined against a corpus the same change is still editing | HIGH | MEDIUM | The commit sequencing above; totals land after Task 5 |
| The sibling `refactor/lean-test-suite` branch rewrites the suite these tasks extend | MEDIUM | HIGH | State the test baseline commit; rebase before Tasks 1-2 land |
| Folded bodies grow the operations bundle, shrinking eager step coverage | MEDIUM | MEDIUM | Each task states the channel its budget claim is measured against; the benchmark gate already fails a 1% delivery regression |
| The eleven attributed entries retire ahead of the door serving them | HIGH | LOW | Task 11 retires per door, reporting residue rather than removing optimistically |
| Task total exceeds the estimate the work package was scoped with | MEDIUM | HIGH | Stated plainly: thirteen tasks at 11-16h agentic against the 1-4h placeholder carried for implementation |
| The attributed rules block is treated as optional, degrading the design to the option it rejected | HIGH | MEDIUM | SC-14 asserts the property per call site, so the degradation fails a check rather than passing unnoticed |
| Tool surface stays at 18 registered tools, so the conversion's gain rests on tools this server does not own | LOW | HIGH | Accepted by decision: the named tools already declare their arguments and already reject an incomplete call, so the guarantee holds without this server registering anything |

**Note on length.** This runs to roughly 315 lines against the guide's 150-line budget, and the deviation is
stated rather than absorbed by cutting. Two things account for it. Thirteen task blocks carry roughly a
third of the document, each with the goal and concrete deliverable paths the guide itself mandates. And the
three design decisions this plan rests on are narrated with the readings they close and why — which is the
plan's own canonical content, the guide naming Proposed Approach as where design decisions and their
alternatives home. Every homed section elsewhere is a link rather than a restatement, and the compressible
material has been compressed: while those decisions were open their decision spaces lived only in the
assumptions log, and they moved here when they were settled rather than being duplicated in both.

**Status:** Ready for implementation
