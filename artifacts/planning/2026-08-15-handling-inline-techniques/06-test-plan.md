# Test Plan: Handling Inline Techniques

> **ADR:** none owed yet · **Ticket:** [#397](https://github.com/m2ux/workflow-server/issues/397) · **PR:** [#466](https://github.com/m2ux/workflow-server/pull/466)

## Overview

This test plan validates that a technique reference written inside another technique's protocol is
resolved, argument-checked and delivered by the server, under one grammar shared by the checker and the
runtime.

Key changes to validate:

1. `reference-grammar` - fixes the ten counting terms and classifies a markdown link as technique
   reference, resource reference, or neither
2. `composeTechniqueWithSource` - resolves container ancestry from the callee's own source workflow
3. `reference-traversal` - depth-first walk carrying a visited set, delivering each body once
4. `check-inline-references` - enumerates every call site and bins its argument conformance
5. `delivery` - keys a folded callee as a technique, carrying call-site annotations separately
6. GitNexus and Atlassian tool registrations - the operations the converted prose reached

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR466-TC-01 | Verify a cross-workflow reference composes to identical inputs, outputs, rules and protocol through the activity-bundle door and the step-bound door | Integration |
| PR466-TC-02 | Verify the graph-navigation group's five shared rules reach the agent through both doors, or are explicitly restated | Integration |
| PR466-TC-03 | Verify container ancestry resolves from the callee's source workflow when the requested workflow differs | Unit |
| PR466-TC-04 | Verify the tree holds one reference grammar and one slug computation, with no anchor slugger inside the shared module | Unit |
| PR466-TC-05 | Verify each of the ten published grammar terms is pinned by a fixture that fails when the term's meaning changes | Unit |
| PR466-TC-06 | Verify the two terms found to overlap are each pinned independently, so a fixture distinguishes them | Unit |
| PR466-TC-07 | Verify the guard's asserted call-site totals match the delivered corpus commit and fail until re-baselined after a term changes | Integration |
| PR466-TC-08 | Verify every inline call site is classified into name-match-satisfied versus genuinely unbound, with the bins asserted | Integration |
| PR466-TC-09 | Verify the guard exits non-zero on a seeded rule-addressed-as-operation site | Unit |
| PR466-TC-10 | Verify the guard exits non-zero on a seeded dangling reference target carrying no anchor | Unit |
| PR466-TC-11 | Verify the two known rule-addressed sites and the one dangling target report clean after repair | Integration |
| PR466-TC-12 | Verify call sites whose callee is named by a value are enumerated and reported as beyond static reach, with the total asserted | Integration |
| PR466-TC-13 | Verify closure over the harness table is checked where the corpus enumerates the callee set | Unit |
| PR466-TC-14 | Verify referenced bodies arrive deduplicated and transitively, with one delivery event per body | Integration |
| PR466-TC-15 | Verify the heaviest closure in the corpus is delivered within the budget, measured against the named channel | Performance |
| PR466-TC-16 | Verify a folded callee and a step-bound delivery of the same operation yield one body, not two, in one agent context | Integration |
| PR466-TC-17 | Verify a call site's binding annotations arrive as a block separate from the callee body | Unit |
| PR466-TC-18 | Verify the three correctly-authored cycle members load without error and each body is delivered once | Integration |
| PR466-TC-19 | Verify a synthetic deep reference chain terminates and its queue depth is bounded | Unit |
| PR466-TC-20 | Verify a group container body is not a delivered closure member when the qualified pair naming its operation collapses | Unit |
| PR466-TC-31 | Verify a folded callee's container rules reach the agent executing that call, and that the caller's own obligation set gains no rule from a container tree it does not belong to | Integration |
| PR466-TC-21 | Verify the reachable-text scan runs over the delivered closure across the whole corpus rather than one technique in one workflow | Integration |
| PR466-TC-22 | Verify the scan's cost stays a rounding error against composition on the heaviest closure | Performance |
| PR466-TC-23 | Verify an attributed core-operations entry is removed only once the reference standing in for it delivers at that entry's own door | Integration |
| PR466-TC-24 | Verify an attributed entry whose door is still unserved remains present and is reported as residue | Unit |
| PR466-TC-25 | Verify the whole technique corpus loads with unchanged meaning at the delivered corpus commit | E2E |
| PR466-TC-26 | Verify the guard's disposition worklist counts the expected logical call sites at the delivered corpus commit | Integration |
| PR466-TC-27 | Verify each converted operation's tool declares the arguments its prose named, and rejects a call omitting a required one | Unit |
| PR466-TC-28 | Verify no `gh` invocation and no git write path runs inside the server process | Integration |
| PR466-TC-29 | Verify every corpus-scoped guard reports unmeasured rather than clean when the corpus submodule is unprovisioned | Unit |
| PR466-TC-30 | Verify the design canon, construct inventory and addressing specification state the same rule about inline call sites | Manual |

*Detailed steps, expected results, and source links will be added after implementation.*

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| SC-1 | One ancestry rule applied identically by both delivery doors | PR466-TC-01, PR466-TC-02, PR466-TC-03 |
| SC-2 | The reference grammar is one shared module carrying no anchor slugger | PR466-TC-04 |
| SC-3 | Every call site enumerated under a normative grammar of ten published terms, each pinned by a fixture | PR466-TC-05, PR466-TC-06, PR466-TC-07 |
| SC-4 | Argument conformance classified into asserted bins | PR466-TC-08 |
| SC-5 | Unambiguous defect classes fail hard, known sites repaired | PR466-TC-09, PR466-TC-10, PR466-TC-11 |
| SC-6 | Value-named callees enumerated, closure checked where a set is enumerable | PR466-TC-12, PR466-TC-13 |
| SC-7 | Bodies arrive deduplicated and transitively within the delivery budget | PR466-TC-14, PR466-TC-15 |
| SC-7a | A folded callee is keyed as a technique and collapses against a step-bound delivery | PR466-TC-16, PR466-TC-17, PR466-TC-20 |
| PL-1 (open) | A folded callee executes under the constraints that govern it | PR466-TC-31 |
| SC-8 | Each body delivered once, traversal continuing at a revisit | PR466-TC-18, PR466-TC-19 |
| SC-9 | The reachable-text scan runs over the delivered closure | PR466-TC-21, PR466-TC-22 |
| SC-10 | Attributed baseline entries retire against the door that serves them | PR466-TC-23, PR466-TC-24 |
| SC-11 | The three written authorities read consistently | PR466-TC-30 |
| SC-12 | The corpus loads with unchanged meaning at the delivered commit | PR466-TC-25 |
| SC-13 | The already tool-backed call sites reach their operation through a typed tool, no host-credentialed path in the server | PR466-TC-26, PR466-TC-27, PR466-TC-28 |
| G10 (analysis-derived) | Every corpus guard can report unmeasured | PR466-TC-29 |

Every criterion maps to at least one case. Three coverage notes rather than gaps: SC-11 is verified by
reading three prose authorities and has no mechanical case; SC-9's cost case replicates figures whose
current evidence is sample-size two; and PR466-TC-31's expected result is fixed by whichever position
[PL-1](02-assumptions-log.md#pl-1-what-a-folded-closure-contains) settles on, so the case is listed with
its objective and authored once that decision lands. Closure membership and rule enforcement are separate
cases because they are separate questions — the first follows from the counting grammar, the second does
not follow from anything yet decided, and one case covering both would pass while the enforcement question
stayed open.

## Running Tests

*Commands will be added after implementation.*
