---
id: strategic-review
version: 1.0.0
---

# Strategic Review Guide

## Purpose

The strategic review ensures the final implementation is minimal and focused. During problem-solving, it's common to add speculative changes, debugging infrastructure, or exploratory code that becomes unnecessary once the root cause is understood. This review identifies and removes such artifacts before finalizing the PR.

## When to Perform

Perform a strategic review in Phase 8 (Strategic Review), after validation and before finalization. The review is especially important when:

- The implementation involved significant investigation or debugging
- Multiple approaches were tried before finding the solution
- Infrastructure or tooling changes were made during development
- The final solution is simpler than initially anticipated

## Review Checklist

### 1. Speculative Changes Audit

Identify changes made during investigation that are no longer required:

| Category | Questions to Ask |
|----------|------------------|
| **Infrastructure** | Were CI/CD changes, build configuration, or environment setup modified speculatively? Are they still needed for the final solution? |
| **Dependencies** | Were dependencies added, removed, or modified that aren't required by the final implementation? |
| **Debug Code** | Are there debug statements, verbose logging, or diagnostic outputs that should be removed? |
| **Fallback Logic** | Were fallback mechanisms added that are unnecessary given the final approach? |
| **Configuration** | Were configuration files modified beyond what the final solution requires? |

### 2. Compare Against Baseline

Compare the current branch against the parent/base branch:

```bash
# List all files changed in this branch
git diff --name-only <base-branch> HEAD

# For each file, ask: Is this change necessary for the solution?
git diff <base-branch> HEAD -- <file>
```

**For each changed file, verify:**

- [ ] The change directly supports the solution (not a speculative attempt)
- [ ] The change is minimal (no unnecessary additions)
- [ ] The change doesn't include debugging artifacts
- [ ] The change wasn't superseded by a simpler approach

### 3. Solution Minimality Check

Ask these questions about the final implementation:

| Question | If "No" |
|----------|---------|
| Is every changed file necessary for the fix? | Revert unnecessary file changes |
| Is every added line of code necessary? | Remove speculative or debug code |
| Are all new dependencies required? | Remove unused dependencies |
| Are all configuration changes required? | Revert unnecessary config changes |
| Is the solution as simple as it could be? | Consider simplification |

### 4. Revert Unnecessary Changes

For changes identified as unnecessary:

```bash
# Revert a specific file to match the base branch
git checkout <base-branch> -- <file>

# Or use interactive staging to selectively revert portions
git checkout -p <base-branch> -- <file>
```

**Stage reverted changes:**

```bash
git add <reverted-files>
```

## Checkpoint Template

```markdown
# 🛑 Checkpoint: [Checkpoint Name]

## Summary

[Brief summary of what was completed and key findings/outcomes]

---

## Key Points

### Completed
- [What was accomplished]
- [Key deliverables produced]

### Findings
- [Key finding 1]
- [Key finding 2]

### Decisions Made
- [Decision 1] - [Rationale]
- [Decision 2] - [Rationale]

---

## Status

[Current status and any blockers or concerns]

---

## Next Steps

[What happens next if confirmed]

---

**Confirmation Required:**

1. **Confirmed** - Proceed to next phase
2. **Need clarification** - Discuss further before proceeding
```

## Common Patterns to Watch For

### Investigation Artifacts

Changes made while understanding the problem:

- Extra logging or print statements
- Verbose error messages for debugging
- Temporary workarounds that were superseded
- Test configurations that were exploratory

### Over-Engineering

Solutions that grew beyond what was needed:

- Generic abstractions for specific problems
- Fallback mechanisms for cases that can't occur
- Configuration options that aren't used
- Infrastructure for features not implemented

### Orphaned Infrastructure

Supporting changes that outlived their purpose:

- CI job dependencies added for failed approaches
- Environment variables for abandoned features
- Build steps for removed functionality
- Wait/synchronization logic that's unnecessary

## Integration with Workflow

The strategic review is its own phase (Phase 8) after validation and before finalization. It ensures the PR contains only the minimal, focused changes required for the solution.

```
Phase 6: Implement Tasks
        │
        ▼
Phase 7: Testing & Validation
        │
        ▼
Phase 8: Strategic Review  ← You are here
    ├─ 8.1 Speculative Changes Audit
    ├─ 8.2 Compare Against Baseline
    ├─ 8.3 Revert Unnecessary Changes
    ├─ 8.4 Checkpoint
    └─ 8.5 Checklist
        │
        ▼
Phase 9: Finalize
    ├─ 9.1 Update ADR Status
    ├─ 9.2 Finalize Test Plan
    ├─ 9.3 Completion Document
    └─ 9.4 Inline Documentation
```

## Summary

The strategic review prevents "solution sprawl" by:

1. **Auditing** all changes against the baseline
2. **Identifying** speculative or unnecessary modifications
3. **Reverting** changes that don't support the final solution
4. **Verifying** the implementation is minimal and focused

This ensures PRs are clean, reviewable, and contain only intentional changes.
