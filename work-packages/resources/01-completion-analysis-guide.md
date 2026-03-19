---
id: completion-analysis-guide
version: 1.0.0
---

# Completion Analysis Guide

**Purpose:** How to assess an initiative that is continuing from previous work.

---

## When to Use

Use completion analysis when the user indicates this is **continuing previous work** — there are existing planning documents, partial implementations, or prior roadmap artifacts.

## Analysis Steps

### 1. Locate Existing Artifacts

- Search `.engineering/artifacts/planning/` for folders matching the initiative
- Check for existing START-HERE.md, README.md, and package plan documents
- Look for completed or in-progress work packages

### 2. Assess Completion State

For each previously identified work package, determine:

| State | Indicators |
|-------|-----------|
| **Complete** | Merged PR, status marked done in START-HERE.md |
| **In Progress** | Open branch, open PR, partially implemented |
| **Planned** | Plan document exists, no implementation started |
| **Not Started** | Identified but no plan document |

### 3. Identify Changes Since Last Session

- Check git log for commits related to the initiative
- Look for new issues or PRs created since planning
- Note any scope changes or new requirements

### 4. Document Findings

Create `01-COMPLETION-ANALYSIS.md` with:

```markdown
# Completion Analysis

**Initiative:** {initiative_name}
**Previous Planning:** {path to existing planning folder}
**Analysis Date:** {YYYY-MM-DD}

## Completion State

| Package | Status | Evidence |
|---------|--------|----------|
| [Name] | Complete/In Progress/Planned/Not Started | [Link or description] |

## Progress Summary

- **Completed:** N of M packages
- **In Progress:** N packages
- **Remaining:** N packages

## Changes Since Last Session

[Notable changes, new requirements, or scope adjustments]

## Recommendation

[Continue with existing plan / Revise plan / Re-prioritize]
```
