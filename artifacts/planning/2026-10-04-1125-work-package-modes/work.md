# Work — I10 E06

Each heading is one task. The epic table is the index. This file is the detail.

Reusable routines and techniques are specced, created, and tested before an activity binds them. The tests for those components are unit tests and integration tests. A walk of a mode stays in the task that wires that mode, because a failure in the walk keeps that task open. Wiring the activities is the later, smaller work.

## W01 Place and walk the legacy workflow

Move `workflow.yaml`, `activities/`, `techniques/`, `routines/`, `resources/`, and the README from `corpus/work-package/` to `corpus/work-package/workflows/legacy/`. The workflow id is `legacy`. The schema path is `../../../../schemas/workflow.schema.json`. Links whose target moved follow the files. Technique references to the combined workflow become `legacy::`. A caller that starts the combined workflow, including `execute-package`, names `legacy`.

Legacy declares `is_review_mode` and `stealth_mode`. It does not bind the library. Its file layout is the behaviour reference for the components that follow. It is not the grain those components copy.

A sidecar specimen walks legacy. The claim table in this record names the walk. The task stays open while that walk reports a failure in the move.

Depends on E05. Shares no pull request: every later task reads this move.

Delivers AC1 and AC13. The canon audit (AC9) is shared with every task.

## W02 Add the library and its guard

`corpus/work-package/` holds `routines/`, `techniques/`, and `resources/`, and no `workflow.yaml`. The library README names `workflows/legacy`, `workflows/implement`, `workflows/review`, and `workflows/remediate`, one line each. It does not spec the routines.

The mode-variable guard lands on `main`, with unit tests. It fails when implement, review, or remediate declares `is_review_mode` or `stealth_mode`, and when one of those workflows declares a variable none of its activities reads or writes. An integration test loads a fixture workflow that declares one of those names and expects the guard to fail. The library files land on `workflows`. This task is done when both pull requests have merged.

Depends on W01. Shares no pull request. The component tasks are the first consumers, and they depend on this task.

Delivers AC6, AC7, and AC11.

## W03 Add workspace, commit, and push

Spec and create the library routines for opening a workspace, committing, and pushing. A parameter selects the workspace kind and whether the push must be private. The private-remote check is a phase of the push routine when the host is determinate, and a technique when the URL is ambiguous. The routine binds `git::` and `github::` directly. A local technique exists only where this library adds a reading those namespaces do not contain.

A unit test fails when the empty-diff gate or the determinate-private gate accepts the wrong input. An integration test loads each routine in a fixture workflow and fails when the splice does not bind the shared technique.

Depends on W02. Does not join W04, W05, or W06. Each of those is a separate contract with its own tests, and a shared pull request would hide a failure in one contract behind another.

Delivers AC16. AC14 and AC15 are shared with the other component tasks.

## W04 Add the document fill

Spec and create the one write technique and the resource sections it fills: plan, findings, close-out, ADR, and elicitation. The technique cites the section the parameter names. A composition, such as the review summary, is not this technique.

A unit test fails when the technique cites a section the resource does not contain. An integration test loads the technique against a fixture resource and fails when the cited section is not the one the parameter selected.

Depends on W02. Does not join W03 or W07. The fill and the delivery routines do not share a contract, and delivery does not depend on this task.

Delivers AC17. AC14 and AC15 are shared.

## W05 Add design and discovery

Spec and create the design and discovery components. The problem statement is its own technique. Classification and the path rationale are one technique. The routine records that comprehension runs. Research gather, synthesis, and triage stay three techniques. The elicitation routine walks the guide's domain list, and the discussion technique names domains already settled. The research document is a fill from W04.

A unit test fails when a component's declared inputs do not match the contract in the [grain rubric](grain-rubric.md). An integration test loads the routine in a fixture workflow and fails when a settled domain is still posed.

Depends on W04. Does not join W03, W06, or W07. Design and discovery are one sizeable contract. Review judgments and delivery are others.

Delivers AC18. AC14 and AC15 are shared.

## W06 Add the review judgments

Spec and create the review-judgment techniques: the diff review, the code review, the test-suite review, and settling findings. The diff review runs once. A fill applies a person's reply. The per-block interview stays a checkpoint. After a fix, only the lens that raised the finding runs again.

A unit test fails when a second lens is selected for a finding the first lens raised. An integration test loads the diff technique and the fill and fails when the reply is applied by fetching the whole review again.

Depends on W04. Does not join W03, W05, or W07. The review judgments are a sizeable contract of their own.

Delivers AC19. AC14 and AC15 are shared.

## W07 Add the delivery routines

Spec and create three separate library routines: publish a pull request, post a review, and push to a private remote. A mode binds only the routine it runs. The private push waits for a confirmation that names the remote when the host is already known to be private, and the ambiguous-URL reading stays a technique. These routines bind the push routine from W03.

A unit test fails when one delivery routine names a technique that belongs to another mode. An integration test loads each routine in a fixture workflow and fails when the unused mode's technique is bound.

Depends on W03. Does not join W04, W05, or W06. Delivery is a sizeable contract, and it does not share a pull request with the judgments it is not built from.

Delivers AC20. AC14 and AC15 are shared.

## W08 Add and walk the implement workflow

Wire `workflows/implement/` to the components above. The folder holds `workflow.yaml`, `activities/`, and a README. The id is `implement`. The graph is the authoring path: start, design, comprehension, optional elicitation and research, analysis, plan, assumptions, implement, lean-coding audit that applies, post-impl review that fixes, validate that fixes, strategic review that applies, submit that pushes and marks ready, and complete that writes an ADR when complexity requires it.

Activities bind `work-package::` routines and techniques, and only those this graph runs. The workflow declares neither `is_review_mode` nor `stealth_mode`, and no review-delivery name and no security-remote name. The README states this mode and names no other mode's activities.

A sidecar specimen walks implement. The step manifest includes no step that posts a pull-request review and no step that pushes to a private remote. The claim table names the walk. The task stays open while that walk reports a failure.

`execute-package` keeps naming `legacy` until this walk shows a package reaching a merged pull request.

Depends on W05, W06, and W07. Joins W09: wiring the two modes, and walking them, is one pull request.

Delivers AC3. AC8 and AC12 are shared with W09 and W10.

## W09 Add and walk the review workflow

Wire `workflows/review/` to the components above. The id is `review`. Start captures the existing pull request. Elicitation and implement are absent. Lean-coding, post-impl, validate, and strategic review document and do not apply. Submit posts the review. Complete republishes the close-out and skips the ADR.

The workflow declares neither `is_review_mode` nor `stealth_mode`. It omits implementation-plan execution names and public-pull-request lifecycle names it never writes. The README states this mode and names no other mode's activities.

A sidecar specimen walks review. The step manifest includes no step that writes implementation files and no step that creates a public pull request. The claim table names the walk. The task stays open while that walk reports a failure.

Depends on W05, W06, and W07. Joins W08.

Delivers AC4. AC8 and AC12 are shared with W08 and W10.

## W10 Add and walk the remediate workflow

Wire `workflows/remediate/` to the components above. The id is `remediate`. Start is the private fork and the `security` remote, with no public GitHub. The rest follows implement. Submit is a private push. The walk's push names only a private remote, and the walk reaches that push only after a checkpoint whose message names the remote. Isolation rules sit on this workflow.

It declares neither `is_review_mode` nor `stealth_mode`, and neither `rating_cap`, `prior_feedback_triage`, nor `squash_merge_supported`. It omits public-pull-request names and review-delivery names, and declares the advisory and private-fork names. The README states this mode and names no other mode's activities.

A sidecar specimen walks remediate. The claim table names the walk. The task stays open while that walk reports a failure.

`corpus/remediate-vuln` is retired. Its readers are retargeted: prism-audit, the readme-seed specimen, and the meta patterns note.

Depends on W08. Does not join W09: W09 joins W08, and this task depends on W08, so it cannot land in that pull request.

Delivers AC2, AC5, and AC10. AC8 and AC12 are shared with W08 and W09.
