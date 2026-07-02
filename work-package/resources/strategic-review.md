---
name: strategic-review
description: Ensures the final implementation is minimal and focused by identifying and removing speculative or unnecessary changes before finalizing the PR.
metadata:
  version: 1.1.0
  order: 18
  legacy_id: 18
---

# Strategic Review Guide

Problem-solving commonly leaves behind speculative changes, debugging infrastructure, or exploratory code that becomes unnecessary once the root cause is understood. The strategic review finds and removes these before finalizing the PR, so PRs are clean, reviewable, and contain only intentional changes.

Perform it in the Strategic Review activity, after validation and before finalization. Especially important when: the implementation involved significant investigation or debugging; multiple approaches were tried; infrastructure or tooling changes were made during development; or the final solution is simpler than initially anticipated.

## Review Procedure

### 1. Speculative Changes Audit

| Category | Questions to Ask |
|----------|------------------|
| **Infrastructure** | Were CI/CD changes, build configuration, or environment setup modified speculatively? Are they still needed for the final solution? |
| **Dependencies** | Were dependencies added, removed, or modified that aren't required by the final implementation? |
| **Debug Code** | Are there debug statements, verbose logging, or diagnostic outputs that should be removed? |
| **Fallback Logic** | Were fallback mechanisms added that are unnecessary given the final approach? |
| **Configuration** | Were configuration files modified beyond what the final solution requires? |

### 2. Compare Against Baseline

```bash
# List all files changed in this branch
git diff --name-only <base-branch> HEAD

# For each file, ask: Is this change necessary for the solution?
git diff <base-branch> HEAD -- <file>
```

For each changed file, verify:
- [ ] The change directly supports the solution (not a speculative attempt)
- [ ] The change is minimal (no unnecessary additions)
- [ ] The change doesn't include debugging artifacts
- [ ] The change wasn't superseded by a simpler approach

### 3. Solution Minimality Check

| Question | If "No" |
|----------|---------|
| Is every changed file necessary for the fix? | Revert unnecessary file changes |
| Is every added line of code necessary? | Remove speculative or debug code |
| Are all new dependencies required? | Remove unused dependencies |
| Are all configuration changes required? | Revert unnecessary config changes |
| Is the solution as simple as it could be? | Consider simplification |

### 4. Revert Unnecessary Changes

```bash
# Revert a specific file to match the base branch
git checkout <base-branch> -- <file>

# Or use interactive staging to selectively revert portions
git checkout -p <base-branch> -- <file>

# Stage reverted changes
git add <reverted-files>
```

## Finding Categories

- **Investigation Artifacts** — changes made while understanding the problem: extra logging or print statements, verbose error messages for debugging, temporary workarounds that were superseded, exploratory test configurations.
- **Over-Engineering** — solutions that grew beyond what was needed: generic abstractions for specific problems, fallback mechanisms for cases that can't occur, unused configuration options, infrastructure for features not implemented.
- **Orphaned Infrastructure** — supporting changes that outlived their purpose: CI job dependencies added for failed approaches, environment variables for abandoned features, build steps for removed functionality, unnecessary wait/synchronization logic.

## Strategic Review Artifact Template

Create `strategic-review-{n}.md` in the planning folder using this template (the activity's `artifactPrefix` is prepended at write time; n increments on successive reviews):

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
