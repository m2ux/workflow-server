# Work Package Implementation Workflow

> Carries ONE work package to the terminal state its mode reaches — a merged pull request on the implementation path, a posted review awaiting the author's disposition on the review path.

---

## Overview

This workflow guides the complete lifecycle of a single work package through its main activities plus a codebase-comprehension sub-flow, entered from design-philosophy or assumptions-review. Each activity has defined techniques, checkpoints, and exits. Activities may be conditional (skipped based on complexity) or looped (repeated on failure), and review mode conditions their steps, checkpoints, and exits.

Where assumptions or comprehension questions are settled, agent-resolvable concerns converge before any residual stakeholder ask.

| # | Activity | Description |
|---|----------|-------------|
| 01 | [**Start Work Package**](./activities/README.md#01-start-work-package) | Verify/create issue, set up branch, PR, and planning folder |
| 02 | [**Design Philosophy**](./activities/README.md#02-design-philosophy) | Classify problem, assess complexity, determine workflow path |
| 15 | [**Codebase Comprehension**](./activities/README.md#codebase-comprehension-optional) | Build/augment mental model of codebase via persistent knowledge artifacts |
| 03 | [**Requirements Elicitation**](./activities/README.md#03-requirements-elicitation-optional) | Clarify requirements through stakeholder conversation |
| 04 | [**Research**](./activities/README.md#04-research-optional) | Discovery fan branch — knowledge-base and web research |
| 05 | [**Implementation Analysis**](./activities/README.md#05-implementation-analysis-optional) | Discovery fan branch — baselines and gaps |
| 06 | [**Plan & Prepare**](./activities/README.md#06-plan--prepare) | Discovery fan join — research gates, assumption ingest, plan |
| 07 | [**Assumptions Review**](./activities/README.md#07-assumptions-review) | Converge the open assumptions and settle what stays open with the user before implementation |
| 08 | [**Implement**](./activities/README.md#08-implement) | Execute tasks with implement-test-commit cycles |
| 20 | [**Contract Tests**](./activities/README.md#contract-tests) | Implementation fan branch — contract suites that fail on the base tree |
| 21 | [**Implementation Join**](./activities/README.md#implementation-join) | Implementation fan join — hoist both branches, run the suites, settle provenance |
| 09 | [**Lean-Coding Audit**](./activities/README.md#09-lean-coding-audit) | Tag and score over-engineering, harvest deliberate-simplification debt, apply accepted simplifications |
| 16 | [**Prism Decision**](./activities/README.md#prism-decision) | Settle whether structural analysis takes the full prism pipeline or the inline pass |
| 17 | [**Code Review**](./activities/README.md#code-review) | Automated review fan branch — code findings |
| 18 | [**Structural Analysis**](./activities/README.md#structural-analysis) | Automated review fan branch — inline structural pass |
| 19 | [**Test Suite Review**](./activities/README.md#test-suite-review) | Automated review fan branch — coverage map and test findings |
| 10 | [**Post-Implementation Review**](./activities/README.md#10-post-implementation-review) | Review fan join — manual diff gates, full prism when chosen, classify, fix cycle |
| 11 | [**Validate**](./activities/README.md#11-validate) | Run tests, build, and lint checks |
| 12 | [**Strategic Review**](./activities/README.md#12-strategic-review) | Ensure minimal, focused changes |
| 13 | [**Submit for Review**](./activities/README.md#13-submit-for-review) | Push PR, mark ready, handle reviewer feedback |
| 14 | [**Complete**](./activities/README.md#14-complete) | Finalize documentation, create ADR, resolve session traces, and conduct retrospective |

**Detailed documentation:**

- **Activities:** See [activities/README.md](./activities/README.md) for per-activity orientation (purpose and role) and a link to each activity's authoritative YAML definition.
- **Techniques:** See [techniques/README.md](./techniques/README.md) for the technique inventory orientation; per-technique protocols live in the technique files.
- **Resources:** See [resources/README.md](./resources/README.md) for the resource index.

The cross-cutting [`variable-binding`](/meta/techniques/variable-binding.md) technique applies to every activity. An activity declares its own `techniques[]` block only for an activity-specific strategy technique such as [`scatter-gather`](/meta/techniques/scatter-gather.md), on activities that aggregate per-item outputs across iteration.

---

## Workflow Flow

Activity order and the exits between activities are the `graph` in [workflow.yaml](./workflow.yaml).

---
## Orchestration Model

Inherits the meta orchestrator/worker pattern — [workflow-orchestrator](/meta/techniques/workflow-engine/workflow-orchestrator.md) / [activity-worker](/meta/techniques/workflow-engine/activity-worker.md) via [dispatch-activity](/meta/techniques/workflow-engine/dispatch-activity.md). Work-package-specific mode behaviour is below.

---

## Review Mode

The workflow carries a work package over an existing pull request as well as over a new implementation. Review mode is ordinary state — a boolean `is_review_mode` variable, with every mode-specific behaviour expressed as a condition on a step, a checkpoint, or an exit predicate.

[REVIEW-MODE.md](./REVIEW-MODE.md) is where review mode is documented: how it activates, what it changes, and where a review run still stops for a person.

---

## Appendix: Artifact Locations

| Location | Path | Purpose |
|----------|------|---------|
| Planning | `{planning_folder_path}` | Work package planning documents and review artifacts |
| Session trace | `{planning_folder_path}/session-trace.md` | Lean mechanical close-out summary (tool counts, durations, errors, validation-warning clusters) when opaque handoff tokens resolve |
| Reviews | `.engineering/artifacts/reviews` | PR review analysis documents |
| ADR | `{adr_dir}` | Architecture Decision Records |
| Comprehension | `{comprehension_dir}` | Persistent codebase knowledge artifacts (cumulative across work packages) |
