# Architecture Overview — Delivery Lanes

> architecture-overview · [m2ux/workflow-server#1627](https://github.com/m2ux/workflow-server/pull/1627) · 2026-11-05

## Summary

Each task row carries a board-wide lane index. Lane owns its assignments, validation and admission operations; callers consume that subject API. The same integration also carries Plan/Deliver request routing, queue reporting, table preservation and bounded join diagnostics.

## Structure

The current graph measures 25 changed files, 212 changed-symbol contexts and 49 affected process traces. All 212 contexts return found without reported partial/stale/error results. Production call relationships place four consumers around Lane, with delivery and queue sharing board state below their entry points.

```mermaid
---
title: Components — Lane Validation Before Refactor
---
flowchart LR
    Format[format.py] -->|reads lanes| Deps[deps.py]
    Deliver[deliver.py] -->|reads lanes| Deps
    Queue[board-queue.py] -->|reads lanes| Deps
    Tests[test_deps.py] -->|tests reader| Deps
    style Deps fill:#c8e6c9,stroke:#2e7d32
```

```mermaid
---
title: Components — Lane Subject Operations
---
flowchart LR
    Format[format.py] -->|reads lanes| Lane[lane.py]
    Deps[deps.py] -->|reads and checks units| Lane
    Deliver[deliver.py] -->|checks and admits units| Lane
    Queue[board-queue.py] -->|checks and labels units| Lane
    Deliver -->|reads state and groups units| Board[board.py]
    Queue -->|reads state and groups units| Board
    style Lane fill:#c8e6c9,stroke:#2e7d32
    style Board fill:#c8e6c9,stroke:#2e7d32
```

### Lane Ownership

- **Subject contract.**
  [Lane](https://github.com/m2ux/workflow-server/blob/73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0/skills/work-planner/artifacts/lane.md#L1) defines index, assignment, unit consistency, admission and labels. The implementation depends only on standard-library values and files.
- **Body shape.**
  [Epic Issue Body](https://github.com/m2ux/workflow-server/blob/73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0/skills/work-planner/artifacts/epic-issue-body.md#L130) owns the seven-column table with Lane after Joins and before Done, and delegates assignment.
- **Shared state.**
  [Board](https://github.com/m2ux/workflow-server/blob/73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0/skills/work-planner/scripts/board.py#L467) supplies the row-state and unit grouping functions used by both consumers. Queue placement is independent of lane annotations.

## Behaviour

The graph's `proc_67_main` measures this assignment-validation path; full CLI branching and result handling are covered by observing tests.

### Confirmed Lane Assignment

```mermaid
---
title: Sequence — Confirmed Lane Assignment Validation
---
sequenceDiagram
    actor Caller
    participant Main as lane.main
    participant Assign as lane.assign_lanes
    participant Read as lane.read_lanes
    participant Index as lane.is_index
    Caller->>Main: confirmed map and body
    Main->>Assign: apply map
    Assign->>Read: validate resulting table
    Read->>Index: validate populated cells
    Index-->>Read: decimal validity
    Read-->>Assign: assignments and findings
    Assign-->>Main: valid body or refusal
    Main-->>Caller: output body or error
```

- **Assignment.**
  Unknown rows and malformed resulting cells refuse output. Other body cells and line endings are preserved.
- **Admission.**
  Lane `02` differs from `2`; a request admits its matching units and unlaned units. A malformed unrelated row remains diagnostic without rejecting a healthy selected unit.

## What Changed

### Lane Operations

- **One owner.**
  Artifacts and consumers share the Lane rule home and executable operations; focused functions expose only the values each caller needs.
- **Current contracts.**
  The [PR Changes](https://github.com/m2ux/workflow-server/pull/1627) describes the full integration surface, including mode routing and table operations.

## Reading Order

1. [Lane contract](https://github.com/m2ux/workflow-server/blob/73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0/skills/work-planner/artifacts/lane.md#L1) — subject fields and operations.
2. [Lane implementation](https://github.com/m2ux/workflow-server/blob/73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0/skills/work-planner/scripts/lane.py#L1) — parsing, assignment, consistency and admission.
3. [Board state](https://github.com/m2ux/workflow-server/blob/73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0/skills/work-planner/scripts/board.py#L467) — shared eligibility and grouping.
4. [Delivery](https://github.com/m2ux/workflow-server/blob/73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0/skills/work-planner/scripts/deliver.py#L343) and [queue](https://github.com/m2ux/workflow-server/blob/73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0/skills/work-planner/scripts/board-queue.py#L281) — caller policies and reports.
5. [Lane regressions](https://github.com/m2ux/workflow-server/blob/73b6bcf0cdc6c379a6abbcd67c81c6082553c6c0/skills/work-planner/test/test_lane.py#L1) — behavior and refusal cases.

## Risks and Watch Points

- **Graph limits.**
  The final analyzer reports 141 candidate entries dropped, 571 callees skipped and 21 walks cut by budget. Graph edges/traces are supplementary evidence; absence is not proof of no path. Complete source-diff inspection and behavioral suites establish the review scope. No claim of complete inferred flows is made.
- **Disclosure limits.**
  Fresh-context walks confirm Lane reachability and the supplied cases but do not complete broad pre-existing mode prerequisite closures. See the preserved failures and missing evidence in the disclosure record.
- **Merge boundary.**
  One approving human review is required before integration can merge.

## References

- **R1.** [Review](review.md) — complete guideline and SOLID dispositions.
- **R2.** [Measurements](graph-contexts.json) and [Flow Traces](graph-traces.json) — exact-head graph evidence, with analyzer limits in graph-final.log.
- **R3.** [Disclosure](disclosure.md) — independent observations and limits.
