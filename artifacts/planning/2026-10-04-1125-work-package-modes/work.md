# Work — I10 E06

Each heading is one task. The epic table is the index. This file is the detail.

## W01 Place combined workflow at legacy

Move `workflow.yaml`, `activities/`, `techniques/`, `routines/`, `resources/`, and the README from `corpus/work-package/` to `corpus/work-package/workflows/legacy/`. The workflow id is `legacy`. The schema path is `../../../../schemas/workflow.schema.json`. Links whose target moved follow the files. Technique references to the combined workflow become `legacy::`. A caller that starts the combined workflow, including `execute-package`, names `legacy`.

Legacy declares `is_review_mode` and `stealth_mode`. It does not bind the library.

Depends on E05. Shares no pull request: every later task reads this move, so none of them can land in the pull request that delivers it.

Delivers AC1. The canon audit (AC9) is shared with every task.

## W02 Add the shared mode library

`corpus/work-package/` holds `routines/`, `techniques/`, and `resources/`, and no `workflow.yaml`. The library README names `workflows/legacy`, `workflows/implement`, `workflows/review`, and `workflows/remediate`.

Routines and the techniques they run live here. A series, a loop, a branch, or a gate is a routine. A phase of one judgment is a technique an activity points at. A command a shared namespace owns is that technique, bound from the routine. A resource holds fill and consult. The [grain rubric](grain-rubric.md) is the rule.

The mode-variable guard lands on `main`. It fails when implement, review, or remediate declares `is_review_mode` or `stealth_mode`, and when one of those workflows declares a variable none of its activities reads or writes. The library files land on `workflows`. This task is done when both pull requests have merged.

Depends on W01. Shares no pull request. W03 and W04 are the first consumers, and they depend on this task.

Delivers AC6, AC7, and AC12.

## W03 Add the implement workflow

`workflows/implement/` holds `workflow.yaml`, `activities/`, and a README. The id is `implement`. The graph is the authoring path: start, design, comprehension, optional elicitation and research, analysis, plan, assumptions, implement, lean-coding audit that applies, post-impl review that fixes, validate that fixes, strategic review that applies, submit that pushes and marks ready, and complete that writes an ADR when complexity requires it.

The workflow declares neither `is_review_mode` nor `stealth_mode`, and no review-delivery name and no security-remote name. Activities bind library routines and techniques as `work-package::`, and only those this graph runs. The README states this mode and names no other mode's activities.

`execute-package` keeps naming `legacy` until an implement walk shows a package reaching a merged pull request.

Depends on W02. Joins W04: one pull request adds both mode workflows.

Delivers AC8, shared with W04 and W05.

## W04 Add the review workflow

`workflows/review/` holds `workflow.yaml`, `activities/`, and a README. The id is `review`. The graph reviews an existing pull request and posts the review. Start captures the pull request. Elicitation and implement are absent. Lean-coding, post-impl, validate, and strategic review document and do not apply. Submit posts the review. Complete republishes the close-out and skips the ADR.

The workflow declares neither `is_review_mode` nor `stealth_mode`. It omits implementation-plan execution names and public-pull-request lifecycle names it never writes. The README states this mode and names no other mode's activities.

Depends on W02. Joins W03.

Delivers AC8, shared with W03 and W05.

## W05 Add the remediate workflow

`workflows/remediate/` holds `workflow.yaml`, `activities/`, and a README. The id is `remediate`. Start is the private fork and the `security` remote, with no public GitHub. The rest follows implement. Submit is a private push, and the push waits for a confirmation that names the remote. Isolation rules sit on this workflow.

It declares neither `is_review_mode` nor `stealth_mode`, and neither `rating_cap`, `prior_feedback_triage`, nor `squash_merge_supported`. It omits public-pull-request names and review-delivery names, and declares the advisory and private-fork names. The README states this mode and names no other mode's activities.

`corpus/remediate-vuln` is retired. Its readers are retargeted: prism-audit, the readme-seed specimen, and the meta patterns note.

Depends on W03. Shares no pull request. It depends on W03, and W03 joins W04, so this task cannot land in that pull request. It does not join W06 or W07: those walks are evidence about implement and review, and this task authors a different workflow.

Delivers AC2 and AC13. AC8 is shared with W03 and W04.

## W06 Walk the implement workflow

A sidecar specimen walks implement. The step manifest includes no step that posts a pull-request review and no step that pushes to a private remote. The claim table in this record names the walk.

Depends on W03. Joins W07: one pull request adds both walks.

Delivers AC3.

## W07 Walk the review workflow

A sidecar specimen walks review. The step manifest includes no step that writes implementation files and no step that creates a public pull request. The claim table in this record names the walk.

Depends on W04. Joins W06.

Delivers AC4.

## W08 Walk remediate and legacy

A sidecar specimen walks remediate and one walks legacy. The remediate walk's push names only a private remote, and the walk reaches that push only after a checkpoint whose message names the remote. The claim tables name all four walks: legacy, implement, review, and remediate.

Depends on W05, W06, and W07. Shares no pull request. It reads the walks from W06 and W07 and the remediate workflow from W05, so it cannot land in those pull requests.

Delivers AC5, AC10, and AC11.
