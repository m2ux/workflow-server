# Requirements Elicitation: Handling Inline Techniques

> 2026-08-17 · [#397](https://github.com/m2ux/workflow-server/issues/397) · Confirmed

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

This package carries **four deliverables**. The epic's stated convention is one pull request per work item, and four work items in one pull request departs from it; that was chosen knowingly over splitting W0 out first. If planning finds the combined review surface untenable, that is a planning finding for its own gate rather than a licence to re-cut scope.

1. **W0 — cross-workflow ancestry.** One documented ancestry rule for cross-workflow references, applied identically by both delivery doors, with the specification section and the composition routine's comments stating it, and a test composing one cross-workflow reference through both doors. Its direction is settled rather than open: W3a composes under home-tree ancestry, so W0 resolves to *contract follows the file's home tree*. It is the smallest of the four — the fix is confined to which techniques directory the composition routine resolves ancestors from, one specification section, and one test.
2. **W2 — check the calls we already write.** A guard resolves every inline reference through the same loader the server uses and checks arguments against the callee's declared inputs. Its grammar lives in a shared module that fold delivery later imports. Unambiguous defects fail hard from day one, including the three rule-addressed-as-operation sites and the one dangling target, repaired in the same change; contract classes are delta-gated. The same scan resolves the neighbouring reference kinds with no static check today — dotted rule citations, bare resource links, artifact-name tokens. Call sites whose callee is a value are enumerated and reported as beyond static reach, with closure over the enumerable set where one exists.
3. **W3a — deliver the referenced techniques.** Referenced bodies arrive deduplicated, transitively, within the delivery budget, composed under W0's ancestry rule, with a delivery event per body and the stealth reachable-text scan running over the delivered closure. A delivered callee is **keyed in the delivery ledger as a technique**, so it collapses against a step-bound delivery of the same operation at both doors; the call site's binding annotations ride as a separate block rather than being baked into the body, which is what keeps that collapse available. The core-operations workarounds retire.
4. **The canon and specification amendment.** The three-way contradiction closes in the same pass that makes the platform express the rule.
5. **The cycle-rule correction.** Traversal delivers each body once and continues at a revisit, replacing the recorded rule that a reference cycle fails the load.

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

## Counting this area

Five measurement defects were self-caught across comprehension's four passes, and every one was a unit or definition error rather than a coding mistake. Every count below names its unit. Two figures this package had been carrying were re-derived at corpus commit `34cd5429`, and **neither reproduces**.

| Figure as carried | Unit as carried | Re-derived | Verdict |
|---|---|---|---|
| 118 call edges | unstated | 148 to 235 deduplicated (caller file, callee file) pairs, depending on the verb list | Superseded; not reproducible under any verb list |
| 137 raw `Apply`-link occurrences across 88 files | link occurrences | 217 link occurrences across 92 files | Superseded |
| 822 technique-link occurrences across 192 files | link occurrences | 822 across 192 files | Reproduces exactly |

The edge spread is the finding, not the number. The definition both comprehension artifacts state — an invoking verb followed by whitespace, an unanchored relative link to a technique file, inside a Protocol section, fences skipped — is under-specified in one term: **which words count as an invoking verb is not enumerated anywhere**. Holding every other criterion fixed and varying only that list:

| Verb list | Edges (pairs) | Callers | Callees | Nodes |
|---|---|---|---|---|
| apply only | 148 | 79 | 72 | 119 |
| apply, invoke | 153 | 82 | 76 | 126 |
| apply, invoke, run | 156 | 82 | 79 | 129 |
| the above plus follow, use | 204 | 99 | 82 | 144 |
| the above plus call, dispatch, delegate, per | 235 | 110 | 92 | 157 |

A 59% spread under wordings that read identically in prose. Comprehension's published figure of 168 edges over 87 callers sits between the third and fourth rows and is not reproducible from the definition as written.

This has a direct consequence for acceptance. The epic's W2 criterion — that the guard "reproduces the 118-edge inventory" — is **not testable as written**, on two counts: the target number reproduces under no verb list, and the definition it would be measured against does not fix its own terms. It is replaced by [SC-3](#success-criteria), which keys acceptance to a grammar the guard itself publishes with its totals asserted — reproducible by construction rather than by agreement.

This is the sixth count in this area to move under a change of definition, after the five comprehension self-caught, so it is a property of the area rather than a run of bad luck. The standing rule holds without exception: a count is restated with its unit or re-derived before anything is planned against it, and that includes the figures still carried in [02-design-philosophy.md](02-design-philosophy.md), which have not been re-derived under this discipline.

One re-derivation reproduces comprehension exactly and is carried forward: the single real dangling target, an apply of the pull-request creation operation in `prism-update/techniques/submit-update.md` whose relative path climbs one directory too many and lands outside the corpus root.

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | One documented ancestry rule for cross-workflow references, applied identically by the activity-bundle door and the step-bound door, with the addressing specification and the composition routine's comments stating it | A test composes one cross-workflow reference through both doors and asserts identical inputs, outputs, rules and protocol; the graph-navigation group's five shared rules either travel through both doors or are explicitly restated |
| SC-2 | The reference grammar is one shared module, consumed by both the guard and — later — fold delivery, and it contains no anchor-slug computation | Single-definition check: no second grammar or slugger in the tree; #398 W1's surface untouched |
| SC-3 | The guard enumerates every inline call site under a **normative** grammar it publishes — the verb list included — and asserts the resulting totals, so a new site fails the guard rather than joining an unmeasured remainder | The guard's own definition is the reference, not a historical count. A verb added to or removed from the published list changes the asserted totals and fails the assertion until re-baselined |
| SC-4 | Argument conformance is classified across all inline call sites into name-match-satisfied versus genuinely unbound | Guard output, bins asserted; the bins are the disposition worklist |
| SC-5 | Unambiguous defect classes fail hard from day one, with the known sites repaired in the same change: the three rule-addressed-as-operation sites and the one dangling pull-request-creation target | Guard exits non-zero on a seeded instance of each class; the four known sites are green after repair |
| SC-6 | Call sites whose callee is named by a value are enumerated and reported as beyond static reach, with the total asserted; where the value is drawn from a set the corpus enumerates, closure over that set is checked instead | Guard output distinguishes unmeasured from clean. The class is three shapes, not one: table-drawn and bind-supplied both resolve; only catalog-selected is genuinely out of reach, and it selects a resource rather than a technique |
| SC-7 | Referenced bodies arrive deduplicated and transitively, within the existing delivery budget, with a delivery event per body | Token benchmark carries a referenced-technique scenario; the heaviest closure in the corpus is 46,865 bytes against a 640,000-character budget at a 200,000-token declared context |
| SC-7a | A delivered callee is keyed as a technique, collapsing against a step-bound delivery of the same operation at both doors, with any call-site binding annotation delivered as a separate block | Of the 81 distinct techniques an inline call reaches, 31 are also bound as an activity step: a delivery test asserts one body, not two, when the same operation arrives both ways in one agent context. No new key namespace appears |
| SC-8 | Traversal delivers each body once and continues at a revisit; no reference cycle fails a load | The three correctly-authored cycle members load green; a synthetic deep chain terminates |
| SC-9 | The stealth reachable-text scan runs over the delivered closure rather than the single technique | Measured cost stays a rounding error on delivery: composition dominates the scan by about two orders of magnitude (22.3 ms against 0.29 ms on the heaviest caller) |
| SC-10 | Every `core-ops.ts` baseline entry whose comment attributes it to inline-reference non-delivery is removed, and the operations it named reach their agent through the delivery path instead | 11 entries in the orchestrator baseline list carry that attribution. Each is removed only once the reference that stood in for it resolves and delivers; an entry still unserved stays, and the residue is reported |
| SC-11 | The design canon, the construct inventory and the addressing specification state what the loader does, with the three-way contradiction closed | The prohibition on technique-to-technique work calls, the specification's call grammar, and the newer conformance entry over inline call sites all read consistently after the pass |
| SC-12 | The corpus loads with unchanged meaning at the corpus commit this package delivers at | Zero regressions across the technique corpus, stated against the delivered submodule commit and its file count rather than against a historical count |

## Assumptions

Assumptions surfaced during elicitation: [assumptions log](02-assumptions-log.md) — record each there (categories: Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria Interpretation), not here.

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | Does the falsified hoist premise reopen the doctrine, or is the recorded decision executed? | Executed with one correction. The premise that died was the blanket hoist, which the visibility rule never proposed; the rule's own scoping survives. The correction is the cycle rule |
| Stakeholder | Who decides, and who is affected? | The user is sole stakeholder, acting as product owner and domain expert. Affected: workflow authors, executing agents, guard maintainers, and whoever works the migration batches downstream |
| Context | What does "blocked on W0" cost, and is #398 W1 blocking? | W0 is not external — see the scope answer. #398 W1 is not blocking: this package's surface is the unanchored references, and anchor semantics stay in #398 |
| Scope | How much of the epic does this package deliver? | The full arc. Working that through establishes it means four deliverables, not three — W0 is pulled in, and accepted |
| Success | Are the epic's acceptance criteria usable as written? | Two are not. The 118-edge reproduction criterion is untestable and is replaced by SC-3; the 554-file criterion is keyed to a stale count and is restated against the delivered corpus commit |
| Success | How is a delivered callee keyed in the delivery ledger? | As a technique, with call-site binding annotations carried as a separate block — keeping the collapse against a step-bound delivery for the 31 techniques reached both ways |

### Clarifications Made

- **"Blocked on W0" resolved.** #405 was closed on filing, subsumed into #397 as W0. There is no open issue, no branch and no pull request delivering it, and the epic's convention is one pull request per work item. Nothing is in flight to wait on, so choosing the full arc means this package delivers W0. It is small — the capture puts the fix at which techniques directory the composition routine resolves ancestors from, one specification section and one test — but it is a fourth deliverable, and a wait agreed is not a build agreed. This returns to the stakeholder as a gate.
- **W0's own design choice is already made.** The capture offers two coherent end states, home-tree ancestry or executing-workflow ancestry. W3a composes "under the home-ancestry rule", so choosing the full arc chooses home-tree. Recorded rather than absorbed.
- **The flag reassurance does not cover W3a.** The note carried against this package's scope — that activation is staged behind a server flag so the corpus never half-folds — describes W3b, which ships flag-gated. W3a has no flag and needs none: it is additive delivery, and call sites keep prose semantics. The half-fold risk belongs to the migration batches, which are out of scope.
- **The cycle correction reaches further than the doctrine record.** The epic body's own W3a description states that referenced bodies are "followed transitively with reference cycles failing the load". Correcting the rule therefore amends the epic text and its acceptance criteria, not only the doctrine decision record.

### Open Questions Resolved

- Whether the activity layer properly handles technique use, as the hoist proposal assumed — no; 82 of 748 bind sites carry the same contract defect.
- Whether fragments could carry a hoisted technique — no; strict two-key container, no reference field on a technique step, resolver visits checkpoints only.
- Whether stop-at-revisit costs anything against fail-the-load — no; measured identical.

## Confirmation

**Confirmed by:** User, at checkpoints `stakeholder-transcript` and `elicitation-complete`.
**Date:** 2026-08-17
**Notes:** Seven decisions settled — keep the visibility rule and correct its cycle input; deliver the full arc; accept W0 as a fourth deliverable knowing it departs from one-pull-request-per-work-item; file the borrowed-activity gap as its own ticket through the follow-ups activity; key a delivered callee as a technique with annotations carried separately; replace the 118-edge acceptance criterion with SC-3; restate the 554-file criterion against the delivered corpus commit.
