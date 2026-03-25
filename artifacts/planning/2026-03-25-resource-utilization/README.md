# Resource Utilization Fix — Planning

**Issue:** [#61](https://github.com/m2ux/workflow-server/issues/61)
**Branch:** `fix/61-resource-utilization`
**PR:** [#62](https://github.com/m2ux/workflow-server/pull/62)
**Date:** 2026-03-25

## Problem Statement

After the session management redesign (#59), template resources (PR descriptions, READMEs, etc.) are attached to skill responses via `_resources` in `get_skill`/`get_skills`, but agents are not correctly utilizing them during workflow execution. Root causes: underscore prefix signals metadata, naming inconsistency between tools, "Load resource" language implies a tool call, and resource location instructions are buried in the wrong section.

## Status

Plan-prepare complete — ready for implementation.

## Progress

| Phase | Artifact | Status |
|-------|----------|--------|
| Design Philosophy | `02-design-philosophy.md` | ✅ Complete |
| Assumptions Log | `02-assumptions-log.md` | ✅ Complete |
| Work Package Plan | `06-work-package-plan.md` | ✅ Complete |
| Test Plan | `06-test-plan.md` | ✅ Complete |
| Implementation | 6 tasks (server code + 53 TOON files) | Pending |
| Validation | `npm test && npm run typecheck` | Pending |

## Links

| Link | URL |
|------|-----|
| Issue | [#61](https://github.com/m2ux/workflow-server/issues/61) |
| PR | [#62](https://github.com/m2ux/workflow-server/pull/62) |
| Branch | `fix/61-resource-utilization` |
