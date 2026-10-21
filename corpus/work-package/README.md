# Work Package Implementation Workflow

> Carries ONE work package to the terminal state its mode reaches — a merged pull request on the implementation path, a posted review awaiting the author's disposition on the review path.

---

## Overview

This workflow guides the complete lifecycle of a single work package through its main activities plus a codebase-comprehension sub-flow, entered from design-philosophy or assumptions-review. Each activity has defined techniques, checkpoints, and exits. Activities may be conditional (skipped based on complexity) or looped (repeated on failure), and review mode conditions their steps, checkpoints, and exits.

Where assumptions or comprehension questions are settled, agent-resolvable concerns converge before any residual stakeholder ask.

---

## When to use

Use this workflow when you want to:

- Carry one feature, bug fix, enhancement, or refactoring through implementation and review.
- Review an existing pull request and record findings for its author.
- Keep requirements, assumptions, validation, and close-out artifacts together for one work package.

---

## Parameters

- [work request](techniques/review-mode-detection.md#user_request) describes the task and whether it calls for implementation or review.
- [repository context](techniques/repo-root-resolution.md#inputs) identifies the host checkout and, when applicable, the component being worked on.
- [issue reference (optional)](techniques/issue-reference-detection.md#issue_request) identifies an existing GitHub issue or Jira ticket by key, number, or URL.

### Review Mode

- [pull request reference](techniques/review-mode-detection.md#pr_reference) supplies the existing pull request's number or URL; the run asks when that reference is missing.

---

## Graph

Activity order and the exits between activities are the `graph` in [workflow.yaml](./workflow.yaml).

Arrow labels are exit ids; a slash groups exits with the same destination. Multiple destinations for one exit run as parallel branches and converge at their join activity. Start marks the initial activity; End is the terminal state.

```mermaid
graph TD
    startNode(["Start"]) --> SWP["01 start-work-package"]
    SWP -->|"done"| DP["02 design-philosophy"]

    DP -->|"revise-classification"| DP
    DP -->|"done"| CC["15 codebase-comprehension"]

    CC -->|"needs-elicitation"| REL["03 requirements-elicitation"]
    CC -->|"research-needed / comprehension-complete"| RS["04 research"]
    CC -->|"research-needed / comprehension-complete"| IA["05 implementation-analysis"]
    CC -->|"skip-optional-activities"| PP["06 plan-prepare"]

    REL -->|"elicitation-incomplete"| REL
    REL -->|"research-needed / no-research-needed"| RS
    REL -->|"research-needed / no-research-needed"| IA
    RS -->|"done"| PP
    IA -->|"done"| PP

    PP -->|"revise"| PP
    PP -->|"done"| AR["07 assumptions-review"]

    AR -->|"needs-further-discussion"| AR
    AR -->|"needs-comprehension"| CC
    AR -->|"needs-plan-revision"| PP
    AR -->|"review-mode"| LCA["09 lean-coding-audit"]
    AR -->|"assumptions-approved"| CT["20 contract-tests"]
    AR -->|"assumptions-approved"| IMP["08 implement"]

    CT -->|"done"| IJ["21 implementation-join"]
    IMP -->|"done"| IJ
    IJ -->|"needs-rework"| IMP
    IJ -->|"needs-contract-tests"| CT
    IJ -->|"done"| LCA["09 lean-coding-audit"]
    LCA -->|"done"| PD["16 prism-decision"]
    PD -->|"remeasure"| PD
    PD -->|"done"| CR["17 code-review"]
    PD -->|"done"| SA["18 structural-analysis"]
    PD -->|"done"| TSR["19 test-suite-review"]
    CR -->|"done"| PIR["10 post-impl-review"]
    SA -->|"done"| PIR
    TSR -->|"done"| PIR
    PIR -->|"has-blocker"| IMP
    PIR -->|"done"| VAL["11 validate"]
    VAL -->|"done"| SR["12 strategic-review"]

    SR -->|"review-failed"| PP
    SR -->|"needs-more-review"| SR
    SR -->|"review-mode / review-passed"| SFR["13 submit-for-review"]

    SFR -->|"provide-input"| SFR
    SFR -->|"review-requires-changes"| PP
    SFR -->|"review-mode / review-approved / abort"| COMP["14 complete"]

    COMP -->|"done"| doneNode(["End"])
```

---

## Activities

See the [activity index and flow diagrams](activities/README.md) for each activity’s purpose and internal flow.

---

## Techniques

The [technique catalog](techniques/README.md) describes each capability and shared contract; [shared routines](routines/README.md) combine reusable activity steps.

---

## Resources

The [resource catalog](resources/README.md) links the planning, review, and close-out guides and maps planning artifacts to their templates.

---

## File Structure

```
corpus/work-package/
├── workflow.yaml   # Workflow definition and graph
├── README.md       # Workflow orientation
├── REVIEW-MODE.md  # Review-mode guide
├── activities/     # Activity definitions and orientation
├── routines/       # Shared activity steps
├── techniques/     # Technique protocols and shared contracts
└── resources/      # Reference material and artifact guides
```
