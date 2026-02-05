# Guides Ontological Refactor

**January 2026**

| Created | Status | Type |
|---------|--------|------|
| 2026-01-27 | Complete | Refactor |

## Executive Summary

Refactor the work-package `guides/` folder into a cleaner ontological model where activities define workflow steps, skills define reusable capabilities, and resources provide reference material. This eliminates duplication (e.g., GitHub and Jira issue guides sharing common content) and improves agent comprehension.

## Progress

| Phase | Status |
|-------|--------|
| Issue Created | ✅ Complete (#26) |
| PR Created | ✅ Complete |
| Requirements Elicitation | ✅ Complete |
| Implementation Analysis | ✅ Complete |
| Research | ⊘ N/A |
| Planning | ✅ Complete |
| Implementation | ✅ Complete |
| Validation | ✅ Complete |
| Strategic Review | ✅ Complete |
| Finalize | ✅ Complete |

## Success Criteria

- [x] All former guides classified as activity, skill, or resource
- [x] Activities and skills validate against respective schemas
- [x] Single issue-creation activity with platform-specific skills
- [x] No duplicate content across files
- [x] Zero "guide" references in codebase (deprecated)

## Documents

| Document | Description |
|----------|-------------|
| [GitHub Issue #26](https://github.com/m2ux/workflow-server/issues/26) | Problem definition and scope |
| 01-unified-activity-schema-design.md | Schema design for unified activity model |
| COMPLETE.md | Completion summary |

## Key Changes

- **Unified Activity Model**: Merged Phase and Activity into single Activity concept
- **Workflow Triggers**: Activities can trigger child workflows with state isolation
- **Guides → Resources**: Renamed throughout codebase and workflows
- **Schema Compliance**: All activities validate against updated schemas
- **Workflow Structure**: Standardized `workflow.toon` naming and `activities/` folders
