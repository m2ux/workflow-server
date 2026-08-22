# Handling Inline Techniques - Implementation Plan

> plan · HIGH · Ready · 10-15h agentic + 3-4h review · 2026-08-22

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

**A folded callee delivers the operation body alone** (PL-1). A qualified call is two links naming one
operation, and delivery follows the counting grammar in collapsing them, so a group container body is not
a closure member and a callee's container rules stay out of the caller's obligation set. One decision
settles three questions: closure contents, rule propagation, and what SC-7 asserts — 40,671 bytes over 12
members for the heaviest caller.

**Folded bodies ride the channel their compensation already rides** (PL-2). The eleven core-operations
entries attributed to non-delivery are served at the orchestrator door, which carries no budget parameter
and cannot drop content, so charging folded bodies to that same operations-bundle channel makes the
retirement like-for-like. The cost is stated rather than hidden: that channel's serialised size seeds the
eager counter at the activity door, so the budget SC-7 speaks of is partly spent before any step technique
is considered, and every task claiming to fit it names which channel it was measured against.

### Alternatives Considered

Three of this approach's decisions are still open, and their alternatives and trade-offs home in the
[log's Open Assumptions entries](02-assumptions-log.md#open-assumptions) — PL-1 on what a folded closure
contains, PL-2 on which counter a folded body draws on, PL-3 on whether one classifier owns the link
space. They are not restated here. The two decisions this plan settles on its own authority:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Acceptance pinned by a fixture per grammar term | Reproducible by construction; matches the repo's existing per-finding triage convention | New machinery — no guard in the registry asserts a total today | **Selected** |
| Acceptance pinned by an asserted total plus a re-baseline | One line of verification | A regenerable baseline with the reason field removed, which is the mechanism this repo retired and recorded its reasons for retiring | Rejected |
| Commit sequencing inside one pull request | Keeps the shared grammar module in one reviewable change with its three consumers | Requires the ordering below to be honoured | **Selected** |
| Splitting the pull request per work item | Matches the epic's stated convention | Separates the grammar module from the guard, the traversal and the authorities that consume it | Rejected |

### Commit sequencing

The review hazard is ordering, not size. The conversion removes 41 of 135 logical call sites from the
corpus whose totals the new guard asserts, so a guard baselined before the conversion lands is green
against a corpus the same change is still editing, and a reviewer cannot separate a guard defect from a
legitimate re-baseline. The ordering that removes it:

1. Tasks 1-2 (grammar module, W0 ancestry) — no corpus effect.
2. Tasks 3-4 (conversion, prose retirement) — all corpus-affecting work, plus the submodule re-pin.
3. Task 5 (the two rule-addressed repairs and the dangling target) — the last corpus edit.
4. Task 6 (guard) and Task 7 (fixtures) — totals baselined here, against the delivered corpus commit.
5. Tasks 8-12 — delivery, doors, retirement, scan, authorities.

### Assumptions

Assumptions underlying the approach: [assumptions log](02-assumptions-log.md). Three of them are open
design decisions — what a folded closure contains, which counter a folded body draws on, and whether one
classifier owns the link space. They are settled at the assumptions-review activity, which this plan
transitions to, and not at this activity's approach gate: that gate is non-blocking and auto-advances to
`confirmed`, so a decision reached by its timer is not a decision anyone made. PL-2 is path-committing and
is the one to settle first.

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

### Task 3: GitNexus and Atlassian operations reach their tools directly (90-150 min)
**Goal:** The eleven distinct operations behind the twenty-three cross-group converted call sites are
typed tools; the eighteen intra-group calls become ordinary calls inside the implementation.
**Deliverables:**
- `src/tools/gitnexus-tools.ts` - up to eleven tool registrations, each declaring the arguments its prose named
- `src/tools/gitnexus-tools.ts` - `impact` splits into a tool plus a thin interpreting technique, the threshold and escape hatch staying in the technique
- `tests/gitnexus-tools.test.ts` - one case per registered tool, and the `TOOLS` roster updated

### Task 4: Converted prose retires from the corpus (30-45 min)
**Goal:** The corpus no longer carries wrapper prose for operations a tool now serves, and the submodule
pin moves to the delivered commit.
**Deliverables:**
- `workflows/meta/techniques/gitnexus-operations/` - converted operations removed, interpreting halves kept
- `workflows/meta/techniques/atlassian-operations/` - intra-group calls resolved into their callers
- the `workflows` gitlink - re-pinned to the delivered corpus commit

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

### Task 7: Grammar fixtures and asserted totals (40-60 min)
**Goal:** Each of the ten published terms is pinned by a fixture, so changing a term changes a fixture
rather than only a number.
**Deliverables:**
- `tests/fixtures/reference-grammar/` - one fixture per term, including the two that overlap
- `tests/reference-grammar-conformance.test.ts` - totals asserted against the delivered corpus commit

### Task 8: Reference traversal with a visited set (60-90 min)
**Goal:** Referenced bodies are collected transitively and deduplicated, each delivered once, the walk
continuing at a revisit.
**Deliverables:**
- `src/loaders/reference-traversal.ts` - depth-first walk carrying a visited set, emitting a delivery event per body
- `tests/reference-traversal.test.ts` - the three correctly-authored cycle members, and a synthetic deep chain

### Task 9: Folded bodies are keyed as techniques (30-45 min)
**Goal:** A delivered callee collapses against a step-bound delivery of the same operation, with call-site
binding annotations carried as a separate block.
**Deliverables:**
- `src/utils/delivery.ts` - folded callees keyed by technique identifier; annotation block keyed separately
- `tests/delivery.test.ts` - one body when the same operation arrives both ways in one agent context

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
| Task total exceeds the estimate the work package was scoped with | MEDIUM | HIGH | Stated plainly: thirteen tasks at 10-15h agentic against the 1-4h placeholder carried for implementation |
| Tool surface grows from 18 registered tools to as many as 29 | LOW | HIGH | Bounded by measurement: eleven distinct operations, not forty-one call sites |

**Note on length.** This runs to 218 lines against the guide's 150-line budget, and the deviation is
stated rather than absorbed by cutting. The task blocks account for roughly half the document: thirteen
tasks, each carrying the goal and concrete deliverable paths the guide itself mandates. The compressible
material has been compressed — the decision spaces of the three open assumptions now live only in the
log, where an open assumption's alternatives belong, and every homed section is a link rather than a
restatement. What remains over budget is one task block per unit of work across six deliverables.

**Status:** Ready for implementation
