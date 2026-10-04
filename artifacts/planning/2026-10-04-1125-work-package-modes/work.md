# Work — I10 E06

Each heading is one task. The epic table is the index. This file is the detail.

Reusable routines, techniques, and resources are specced, created, and tested before an activity binds them. Wiring then derives behaviour from those activities and compares it with the behaviour the mode expected.

When they differ, the wiring task changes the routine, technique, or resource, and the tests that cover the change, until fit, form, and function hold. The same task changes the expected behaviour or the function when the structure shows that earlier statement was wrong.

Every test of a task accompanies that task:

- its unit tests
- its integration tests
- its walk

A failure in any of them keeps the task open. None of those tests is a later row.

Component tasks do not share a pull request. Each contract is tested on its own, and a shared pull request would hide a failure in one contract behind another. The pairs named below are the ones Check Dependencies prints.

## W01 Place and walk the legacy workflow

The combined workflow moves to `corpus/work-package/workflows/legacy/`. The workflow id is `legacy`. The schema path is `../../../../schemas/workflow.schema.json`.

Links whose target moved follow the files. Technique references to the combined workflow become `legacy::`. A caller that starts the combined workflow names `legacy`, including `execute-package`.

The files that move are:

- `workflow.yaml`
- `activities/`
- `techniques/`
- `routines/`
- `resources/`
- the README

Legacy declares `is_review_mode` and `stealth_mode`. It does not bind the library. Its file layout is the behaviour reference for the components that follow. It is not the grain those components copy.

The tests of this move accompany it. A sidecar specimen walks legacy. The claim table in this record names the walk. The task stays open while any of its tests report a failure.

Depends on E05. This task shares no pull request, because every later task reads this move.

Delivers AC1 and AC13. The canon audit (AC9) is shared with every task.

## W02 Add the library and its guard

`corpus/work-package/` holds the library folders and no `workflow.yaml`:

- `routines/`
- `techniques/`
- `resources/`

The library README names each mode in one line, and does not spec the routines or the resources:

- `workflows/legacy`
- `workflows/implement`
- `workflows/review`
- `workflows/remediate`

The mode-variable guard lands on `main`. Its unit tests and its integration test accompany it. The library files land on `workflows`. This task is done when both pull requests have merged.

The unit tests fail when:

- implement, review, or remediate declares `is_review_mode` or `stealth_mode`
- one of those workflows declares a variable none of its activities reads or writes

The integration test loads a fixture workflow that declares one of those names and expects the guard to fail.

Depends on W01. This task shares no pull request. The component tasks depend on it.

Delivers AC6, AC7, and AC11.

## W03 Refactor resource grain

The resources that live with the combined workflow are reviewed for grain and rewritten onto the library. A procedure a technique owns moves out of the resource. Citations are at section grain. A section fetch returns that section. Legacy keeps its own copies.

A resource holds:

- templates
- vocabularies
- criteria
- policy

The set is:

- the plan guide
- the findings guide
- the close-out guide
- the ADR guide
- the elicitation guide
- the design-framework guide
- the assumptions guide
- the review guides

The tests accompany the refactor. A unit test fails when a refactored resource still contains a protocol cadence. An integration test fetches one section and fails when the response is the whole file.

Depends on W02. Does not join W04 or W07. Resource grain, the workspace routines, and delivery are separate contracts.

Delivers AC21 and AC22.

## W04 Add workspace, commit, and push

Spec and create the library routines for opening a workspace, committing, and pushing. A parameter selects the workspace kind and whether the push must be private.

The private-remote check is a phase of the push routine when the host is determinate, and a technique when the URL is ambiguous. The routine binds `git::` and `github::` directly. A local technique exists only where this library adds a reading those namespaces do not contain.

The tests accompany the routines. A unit test fails when the empty-diff gate or the determinate-private gate accepts the wrong input. An integration test loads each routine in a fixture workflow and fails when the splice does not bind the shared technique.

Depends on W02. Does not join:

- W03
- W05
- W06
- W08

Each of those is a separate contract.

Delivers AC16. AC14 and AC15 are shared with the other component tasks.

## W05 Add the document fill

Spec and create the one write technique. It cites a section of a resource W03 refactored. The parameter names the section. A composition, such as the review summary, is not this technique.

The sections are:

- plan
- findings
- close-out
- ADR
- elicitation

The tests accompany the technique. A unit test fails when the technique cites a section the resource does not contain. An integration test loads the technique against a fixture resource and fails when the cited section is not the one the parameter selected.

Depends on W03. Does not join W04, W06, or W07. The fill, the workspace routines, the review judgments, and delivery do not share a contract.

Delivers AC17. AC14 and AC15 are shared.

## W06 Add the review judgments

Spec and create the review-judgment techniques. They cite the resource sections W03 refactored.

The techniques are:

- the diff review
- the code review
- the test-suite review
- settling findings

The diff review runs once. A fill applies a person's reply. The per-block interview stays a checkpoint. After a fix, only the lens that raised the finding runs again.

The tests accompany the techniques. A unit test fails when a second lens is selected for a finding the first lens raised. An integration test loads the diff technique and the fill and fails when the reply is applied by fetching the whole review again.

Depends on W03. Does not join:

- W04
- W05
- W07
- W08

The review judgments are a sizeable contract of their own.

Delivers AC19. AC14 and AC15 are shared.

## W07 Add the delivery routines

Spec and create three separate library routines. A mode binds only the routine it runs. These routines bind the push routine from W04.

The routines are:

- publish a pull request
- post a review
- push to a private remote

The private push waits for a confirmation that names the remote when the host is already known to be private. The ambiguous-URL reading stays a technique.

The tests accompany the routines. A unit test fails when one delivery routine names a technique that belongs to another mode. An integration test loads each routine in a fixture workflow and fails when the unused mode's technique is bound.

Depends on W04. Does not join:

- W03
- W05
- W06
- W08

Delivery does not share a pull request with the resources or the judgments it is not built from.

Delivers AC20. AC14 and AC15 are shared.

## W08 Add design and discovery

Spec and create the design and discovery components. The research document is a fill from W05, into a section W03 refactored.

The components are:

- The problem statement is its own technique.
- Classification and the path rationale are one technique.
- The routine records that comprehension runs.
- Research gather, synthesis, and triage stay three techniques.
- The elicitation routine walks the guide's domain list.
- The discussion technique names domains already settled.

The tests accompany the components. A unit test fails when a component's declared inputs do not match the contract in the [grain rubric](grain-rubric.md). An integration test loads the routine in a fixture workflow and fails when a settled domain is still posed.

Depends on W05. Does not join W04, W06, or W07. Design and discovery are one sizeable contract.

Delivers AC18. AC14 and AC15 are shared.

## W09 Add and walk the implement workflow

Wire `workflows/implement/` to the components above. The folder holds `workflow.yaml`, `activities/`, and a README. The id is `implement`.

The graph is the authoring path:

- start
- design
- comprehension
- optional elicitation and research
- analysis
- plan
- assumptions
- implement
- lean-coding audit that applies
- post-impl review that fixes
- validate that fixes
- strategic review that applies
- submit that pushes and marks ready
- complete that writes an ADR when complexity requires it

Activities bind `work-package::` routines and techniques, and only those this graph runs. The workflow declares neither `is_review_mode` nor `stealth_mode`. The README states this mode and names no other mode's activities.

The workflow omits:

- review-delivery names
- security-remote names

The tests of this wiring accompany it. A sidecar specimen walks implement. Any unit or integration test of this wiring is in this task. The claim table names the walk. The task stays open while any of its tests report a failure.

A mismatch changes the bound routine, technique, or resource in this task, with the tests that cover that change.

The step manifest includes no step that:

- posts a pull-request review
- pushes to a private remote

`execute-package` keeps naming `legacy` until this walk shows a package reaching a merged pull request.

Depends on W06, W07, and W08. Joins W10: wiring the two modes, with their tests, is one pull request.

Delivers AC3. AC8 and AC12 are shared with W10 and W11.

## W10 Add and walk the review workflow

Wire `workflows/review/` to the components above. The id is `review`. Start captures the existing pull request. Submit posts the review. Complete republishes the close-out and skips the ADR.

The path omits elicitation and implement. These activities document and do not apply:

- lean-coding
- post-impl
- validate
- strategic review

The workflow declares neither `is_review_mode` nor `stealth_mode`. The README states this mode and names no other mode's activities.

The workflow omits:

- implementation-plan execution names
- public-pull-request lifecycle names it never writes

The tests of this wiring accompany it. A sidecar specimen walks review. Any unit or integration test of this wiring is in this task. The claim table names the walk. The task stays open while any of its tests report a failure.

A mismatch changes the bound routine, technique, or resource in this task, with the tests that cover that change.

The step manifest includes no step that:

- writes implementation files
- creates a public pull request

Depends on W06, W07, and W08. Joins W09.

Delivers AC4. AC8 and AC12 are shared with W09 and W11.

## W11 Add and walk the remediate workflow

Wire `workflows/remediate/` to the components above. The id is `remediate`. Start is the private fork and the `security` remote, with no public GitHub. The rest follows implement. Submit is a private push. Isolation rules sit on this workflow.

The walk's push names only a private remote. The walk reaches that push only after a checkpoint whose message names the remote.

The workflow declares neither `is_review_mode` nor `stealth_mode`. It also leaves undeclared:

- `rating_cap`
- `prior_feedback_triage`
- `squash_merge_supported`

The README states this mode and names no other mode's activities.

The workflow omits:

- public-pull-request names
- review-delivery names

It declares the advisory and private-fork names.

The tests of this wiring accompany it. A sidecar specimen walks remediate. Any unit or integration test of this wiring is in this task. The claim table names the walk. The task stays open while any of its tests report a failure.

A mismatch changes the bound routine, technique, or resource in this task, with the tests that cover that change.

`corpus/remediate-vuln` is retired. Its readers are retargeted:

- prism-audit
- the readme-seed specimen
- the meta patterns note

Depends on W09. Does not join W10: W10 joins W09, and this task depends on W09, so it cannot land in that pull request.

Delivers AC2, AC5, and AC10. AC8 and AC12 are shared with W09 and W10.
