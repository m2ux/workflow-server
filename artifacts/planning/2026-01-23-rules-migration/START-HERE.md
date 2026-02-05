# Rules Migration - Start Here

## Quick Reference

| Field | Value |
|-------|-------|
| **Issue** | [#17](https://github.com/m2ux/workflow-server/issues/17) |
| **PR** | [#18](https://github.com/m2ux/workflow-server/pull/18) |
| **Branch** | `fix/17-rules-migration` |
| **Status** | Complete |

## Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [00-requirements-elicitation.md](00-requirements-elicitation.md) | Elicited requirements | ✅ Complete |
| [01-implementation-analysis.md](01-implementation-analysis.md) | Current state analysis | ✅ Complete |
| [03-work-package-plan.md](03-work-package-plan.md) | Implementation plan | ✅ Complete |
| [04-test-plan.md](04-test-plan.md) | Test plan | ✅ Complete |
| [COMPLETE.md](COMPLETE.md) | Completion summary | ✅ Complete |

## Summary

Check and migrate missing agent guidelines from external AGENTS.md (agent-resources repo) to the work-package workflow rules. The external AGENTS.md was at the repo root, not in the work-package folder, so it was missed during the WP-006 guide migration.

## Problem Statement

The work-package workflow currently has 6 rules focused on checkpoint/approval behavior. The comprehensive agent guidelines from the external AGENTS.md (~200+ lines covering code modification boundaries, communication standards, version control practices, etc.) were not migrated.

## Key Findings

- **External AGENTS.md**: Comprehensive guidelines (~200+ lines)
- **Local `.engineering/AGENTS.md`**: Condensed version (~20 lines)
- **Work-package workflow rules**: 6 rules (checkpoint/approval focused)

## Next Steps

1. Complete Phase 1 - Create draft PR
2. Decide on requirements elicitation need
3. Proceed with implementation analysis
