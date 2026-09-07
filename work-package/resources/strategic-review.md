---
name: strategic-review
description: Strategic review artifact template for speculative-change, over-engineering, and orphaned-infrastructure findings.
metadata:
  version: 1.5.0
  order: 18
  legacy_id: 18
---

# Strategic Review Guide

Problem-solving commonly leaves behind speculative changes, debugging infrastructure, or exploratory code that becomes unnecessary once the root cause is understood. The strategic review finds and removes these before finalizing the PR, so PRs are clean, reviewable, and contain only intentional changes.

## Field List

Designators use the prefix declared for this report's category at [Strategic Review](./review-mode.md#strategic-review). Every finding carries the fields of [Fields](./findings-report.md#fields), laid out per [Finding Layout](./findings-report.md#finding-layout). This report declares:

| Declaration | Value |
|---|---|
| `Category` vocabulary | Investigation Artifact / Over-Engineering / Orphaned Infrastructure / Scope Creep / PR Body Conformance |

On a strategic finding, `Description` states what the change carries, `Impact` what carrying it costs the reader or the maintainer, and `Recommendation` opens with the verb it asks for — remove, simplify, or keep — followed by the argument for it.

## Speculative Changes Audit

The areas a scope review probes for changes the final solution does not need.

| Category | Questions to Ask |
|----------|------------------|
| **Infrastructure** | Were CI/CD changes, build configuration, or environment setup modified speculatively? Are they still needed for the final solution? |
| **Dependencies** | Were dependencies added, removed, or modified that aren't required by the final implementation? |
| **Debug Code** | Are there debug statements, verbose logging, or diagnostic outputs that should be removed? |
| **Fallback Logic** | Were fallback mechanisms added that are unnecessary given the final approach? |
| **Configuration** | Were configuration files modified beyond what the final solution requires? |

## Minimality Check

Five questions over the change set, each answered "No" carrying the cleanup its row names.

| Question | If "No" |
|----------|---------|
| Is every changed file necessary for the fix? | Revert unnecessary file changes |
| Is every added line of code necessary? | Remove speculative or debug code |
| Are all new dependencies required? | Remove unused dependencies |
| Are all configuration changes required? | Revert unnecessary config changes |
| Is the solution as simple as it could be? | Consider simplification |

## Changes Fragment Issue Reference

A changes fragment carries a GitHub issue reference, and the project's check-changes job accepts one of two forms: a full issue URL matching `github\.com/.+/issues/[0-9]+`, or a trailer matching `(Fixes|Closes|Resolves):?\s+#[0-9]+`. A fragment carrying neither fails that job.

## Strategic Review Artifact Template

```markdown
# Strategic Review

> strategic-review · [work package] · [base-branch] → [feature-branch] · [date] · [Agent/Human] · what was walked: [method record](NN-strategic-review-{n}-method.md)

**Diff:** [count] files, +[added] / -[removed]

## Findings

[One heading per finding, ascending by designator, no grouping heading between them. With no findings, state "all changes justified — no findings" on one line.]

### SR-1 — [one line naming the finding]

**Category:** [category]

**Severity:** [render-scale value]

**Description:** [what the change carries, opening with an inline link to the named thing]

**Impact:** [what carrying it costs]

**Recommendation:** [remove / simplify / keep, then the argument for it]

## Cleanup Actions Taken

[Omit this section if no cleanup was needed]

| Action | Files Affected | Commit |
|--------|----------------|--------|
| Removed debug logging | [file1, file2] | [hash] |

## Review Result

**Outcome:** [Passed / Minor Cleanup Completed / Significant Rework Needed]

**Rationale:** [Brief explanation of the outcome]

**Next Step:** [Proceed to finalize / Return to planning]
```

## Method Record Template

```markdown
# Strategic Review Method

> strategic-review method · [work package] · [date] · findings: [strategic review](NN-strategic-review-{n}.md)

## Scope Assessment

[Exception-only: if every change maps to a requirement, state "All changes in scope — minimal and focused" on one line. Add rows only for scope creep, each carried to the report as a finding.]

| File / Change | In Scope? | Notes |
|---------------|-----------|-------|
| [file.rs] | No | [Flagged as scope creep — reason] |

## PR Body Conformance

[Exception-only: if the live PR body conforms to the required format, state "Body conforms — no findings" on one line. Otherwise list what diverged, each carried to the report as a finding.]

| Divergence | Detail |
|---------|--------|
| [e.g. Missing section] | [Description] |

## Minimality Assessment

[Exception-only: if all five minimality-check questions pass, state "All 5 minimality checks pass" on one line. Add rows only for questions answered "No".]

| Question | Answer | Notes |
|----------|--------|-------|
| [Failing question] | No | [Details] |

## Delivery Scope

[Every designator the run produced, each in exactly one class, per [Delivery Completeness](./findings-report.md#delivery-completeness).]

| Class | Designators |
|-------|-------------|
| Carried to the pull request | [SR-1, SR-2, …] |
| Handed to the audit | [SR-3, …] |
| Held | [SR-4, …] |
```

## Rules

- **Line budget:** ~120 lines. Each recommendation is one entry with its scope-fit reason.
