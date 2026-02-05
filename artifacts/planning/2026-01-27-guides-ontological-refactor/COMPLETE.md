# Guides Ontological Refactor - Complete

**Completed**: 2026-01-27

## Summary

Successfully refactored the workflow-server from a "guides" and "phases" model to a unified "activities" and "resources" ontology. This provides cleaner separation of concerns and enables cross-workflow triggering.

## Changes Made

### Schema Updates
- Unified Phase and Activity into single Activity model
- Added workflow trigger capability for nested workflow execution
- Updated state schema for nested workflow state management
- Renamed `per_phase` to `per_activity` in skill schemas
- Renamed `guides` to `resources` in interpretation schemas

### Codebase Changes
- Deleted `guide-loader.ts`, created `resource-loader.ts`
- Updated all tool names: `list_guides` → `list_workflow_resources`, `get_guide` → `get_resource`
- Removed `guideDir` from server configuration
- Updated all tests for new API

### Workflow Structure
- Standardized `workflow.toon` naming convention
- Added `activities/` folders for workflow-specific activities
- Renamed `guides/` to `resources/` in workflow folders
- Created `work-packages` workflow with proper activity structure

### Documentation
- Updated `schemas/README.md` with complete ontology documentation
- Updated `docs/api-reference.md` with new tool names and workflow types
- Updated `docs/development.md` with resource loader information
- Updated `README.md` with current workflow list

## Metrics

| Metric | Value |
|--------|-------|
| Files changed (main) | 31 |
| Lines added/removed | +1890 / -1582 |
| Tests passing | 85/85 |
| Schema warnings | 0 |

## Tags Created

| Branch | Tag | Commit |
|--------|-----|--------|
| main | `main/v0.2.0` | `1f530b0` |
| workflows | `workflows/v0.2.0` | `aad14c9` |

## Next Steps

1. Merge PR to main branch
2. Update any downstream consumers of the API
3. Consider adding lint script to package.json
