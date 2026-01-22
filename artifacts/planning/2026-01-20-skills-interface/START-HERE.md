# Skills Interface - Start Here

## Quick Reference

| Field | Value |
|-------|-------|
| **Issue** | [#1](https://github.com/m2ux/workflow-server/issues/1) |
| **PR** | [#2](https://github.com/m2ux/workflow-server/pull/2) |
| **Branch** | `feat/skills-interface` |
| **Status** | Planning Complete |

## Documents

| Document | Purpose |
|----------|---------|
| [00-requirements-elicitation.md](00-requirements-elicitation.md) | Elicited requirements |
| [01-implementation-analysis.md](01-implementation-analysis.md) | Current state analysis |
| [02-kb-research.md](02-kb-research.md) | Research findings |
| [03-work-package-plan.md](03-work-package-plan.md) | Implementation plan |

## Summary

Implement a skills interface that provides structured guidance for agents to consistently execute workflows via MCP resources.

## Key Decisions

- Single "workflow-execution" skill for all workflows
- MCP Resources for skill delivery (not Tools)
- Hybrid JSON structure optimized for token efficiency
- Agent-managed in-memory state
- IDE setup file for bootstrap

## Next Steps

1. Switch to `feat/skills-interface` branch
2. Implement tasks per [work package plan](03-work-package-plan.md)
3. Test and validate
4. Update PR for review
