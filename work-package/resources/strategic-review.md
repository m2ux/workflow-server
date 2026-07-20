---
name: strategic-review
description: Strategic review artifact template for speculative-change, over-engineering, and orphaned-infrastructure findings.
metadata:
  version: 1.2.1
  order: 18
  legacy_id: 18
---

# Strategic Review Guide

Problem-solving commonly leaves behind speculative changes, debugging infrastructure, or exploratory code that becomes unnecessary once the root cause is understood. The strategic review finds and removes these before finalizing the PR, so PRs are clean, reviewable, and contain only intentional changes.

## Strategic Review Artifact Template

```markdown
# Strategic Review

> strategic-review · [work package] · [base-branch] → [feature-branch] · [date] · [Agent/Human]

**Diff:** [count] files, +[added] / -[removed]

## Findings Summary

| Category | Items Found | Action Required |
|----------|-------------|-----------------|
| Investigation Artifacts | [count] | [Remove/Keep/Partial] |
| Over-Engineering | [count] | [Remove/Keep/Partial] |
| Orphaned Infrastructure | [count] | [Remove/Keep/Partial] |
| **Total** | **[count]** | |

## Investigation Artifacts

[Omit this section if none found]

| File | Line(s) | Description | Action | Rationale |
|------|---------|-------------|--------|-----------|
| [file.rs] | [10-15] | Debug logging for X | Remove | No longer needed after fix |

## Over-Engineering

[Omit this section if none found]

| File | Description | Action | Rationale |
|------|-------------|--------|-----------|
| [file.rs] | Generic abstraction for specific case | Simplify | Only one use case exists |

## Orphaned Infrastructure

[Omit this section if none found]

| File | Description | Action | Rationale |
|------|-------------|--------|-----------|
| [ci.yml] | Build step for abandoned approach | Remove | Approach was superseded |

## Scope Assessment

[Exception-only: if every change maps to a requirement, state "All changes in scope — minimal and focused" on one line. Add rows only for scope creep, flagged for user decision.]

| File / Change | In Scope? | Notes |
|---------------|-----------|-------|
| [file.rs] | No | [Flagged as scope creep — reason] |

## PR Body Conformance

[Exception-only: if the live PR body conforms to the required format, state "Body conforms — no findings" on one line. Otherwise list findings.]

| Finding | Detail |
|---------|--------|
| [e.g. Missing section] | [Description] |

## Minimality Assessment

[Exception-only: if all five minimality-check questions pass, state "All 5 minimality checks pass" on one line. Add rows only for questions answered "No".]

| Question | Answer | Notes |
|----------|--------|-------|
| [Failing question] | No | [Details] |

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
