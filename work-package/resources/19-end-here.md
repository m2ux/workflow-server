---
id: end-here
version: 1.0.0
---

# End Workflow Guide

**Purpose:** Guide for completing and finalizing a work-package workflow.

---

## Overview

This guide helps you properly complete and finalize a work-package workflow. Ending a workflow involves ensuring all phases are complete, documentation is finalized, and the PR is ready for merge.

> **Key Insight:** A well-ended workflow leaves a clear trail for future reference and ensures nothing is left incomplete.

---

## Completion Checklist

Before ending a workflow, verify the following:

- [ ] All implementation tasks are complete
- [ ] All tests pass (unit, integration, e2e as applicable)
- [ ] Build succeeds without errors
- [ ] No linter errors or warnings
- [ ] Strategic review is complete
- [ ] COMPLETE.md document is created
- [ ] ADR created if architecturally significant
- [ ] PR description is updated with final details
- [ ] All commits are pushed
- [ ] PR is marked ready for review

---

## Finalization Steps

### 1. Verify Implementation Complete

**Actions:**
- Check all tasks in TODO list are completed
- Run full test suite
- Verify build passes

**🛑 CHECKPOINT:** "All tests pass and build succeeds?"

---

### 2. Create Completion Document

**Actions:**
- Create COMPLETE.md using the [complete guide](16-complete.md)
- Document what was implemented, test results, and any deferred items

**🛑 CHECKPOINT:** "COMPLETE.md accurately reflects implementation?"

---

### 3. Update Planning Documents

**Actions:**
- Update START-HERE.md status to Complete
- Update progress table with final status
- Ensure all document links are correct

---

### 4. Finalize PR

**Actions:**
- Update PR description with implementation summary
- Add test results and coverage information
- Mark PR as ready for review

**🛑 CHECKPOINT:** "PR description confirmed?"

---

### 5. Post-Implementation Tasks

**Actions:**
- Capture workflow retrospective (if non-trivial) - see [retrospective guide](17-workflow-retrospective.md)
- Archive session history (if metadata repo exists)
- Identify any follow-up work items

---

### 6. Confirm Completion

**Actions:**
- Present final summary to user
- Confirm workflow is complete

---

## Completion Summary Template

Use this template when presenting the final summary:

```markdown
## Workflow Complete

**Work Package:** [Name]
**Issue:** #[N]
**PR:** #[N]
**Branch:** [branch-name]

### What Was Implemented
- [List of completed items]

### Test Results
- [X] tests passing
- [X]% coverage

### Documents Created
- START-HERE.md (updated)
- COMPLETE.md
- [Other documents]

### Next Steps
- PR ready for review
- [Any follow-up items]
```

---

## Completion Rules

1. **Never end a workflow with failing tests**
2. **Always create COMPLETE.md before marking done**
3. **Update START-HERE.md status to Complete**
4. **Ensure PR is ready for review before ending**
5. **Document any deferred or out-of-scope items**

---

## Related Guides

- [Work Package Implementation Workflow](../workflow.toon)
- [Completion Guide](16-complete.md)
- [PR Description Guide](11-pr-description.md)
- [Workflow Retrospective Guide](17-workflow-retrospective.md)
