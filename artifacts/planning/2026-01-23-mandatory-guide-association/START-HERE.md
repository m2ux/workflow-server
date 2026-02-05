# Mandatory Guide Association - January 2026

**Created:** 2026-01-23  
**Status:** Complete  
**Type:** Feature  
**Issue:** [#19](https://github.com/m2ux/workflow-server/issues/19)

## Executive Summary

Add mandatory guide associations to activities so agents load the appropriate guide before proceeding with workflow execution. This addresses the issue where agents skip formal processes (like the 5-phase resumption with 4 checkpoints) because activities don't indicate which guide should be loaded first.

## Progress

| Phase | Status | Notes |
|-------|--------|-------|
| Issue Verification | ✅ Complete | Issue #19 verified |
| PR Creation | ✅ Complete | [PR #20](https://github.com/m2ux/workflow-server/pull/20) created |
| Requirements Elicitation | ✅ Complete | 7 requirements captured |
| Implementation Analysis | ✅ Complete | 5 files to modify, 2 to create |
| Research | ⊘ Skipped | Not needed for internal change |
| Plan & Prepare | ✅ Complete | 8 tasks, PR updated |
| Implementation | ✅ Complete | 8/8 tasks done |
| Validation | ✅ Complete | 99 tests passing |
| Strategic Review | ✅ Complete | Changes minimal and focused |
| Finalize | ✅ Complete | PR ready for review |

## Success Criteria

- [x] Activity schema includes `mandatory_guide` field
- [x] All activities have appropriate guides associated
- [x] `get_activities` response includes guide references
- [x] `workflow-execution` skill documents the mandatory guide loading requirement
- [x] Agent cannot proceed past activity resolution without loading the mandatory guide

## Documents

| Document | Description |
|----------|-------------|
| [START-HERE.md](./START-HERE.md) | This document - work package overview |

## Timeline

- **Phase 1:** Issue Verification & PR Creation
- **Phase 3:** Implementation Analysis
- **Phase 5:** Plan & Prepare
- **Phase 6:** Implementation
- **Phase 7-10:** Validation, Review, Finalize, Update PR
