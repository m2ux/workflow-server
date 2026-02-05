# COMPLETE: Global Agent Rules Migration

**Issue:** [#17](https://github.com/m2ux/workflow-server/issues/17)  
**PR:** [#18](https://github.com/m2ux/workflow-server/pull/18)  
**Date Completed:** 2026-01-23

---

## Summary

Migrated missing agent guidelines from external AGENTS.md to the workflow-server by implementing a new `get_rules` MCP tool. The external AGENTS.md was at the repo root and was missed during the WP-006 guide migration.

---

## What Was Delivered

### New Files

| File | Purpose |
|------|---------|
| `workflows/meta/rules.toon` | Global agent rules in TOON format (10 sections) |
| `src/loaders/rules-loader.ts` | Rules loading logic |
| `tests/rules-loader.test.ts` | Unit tests for rules loader |

### Modified Files

| File | Change |
|------|--------|
| `src/errors.ts` | Added `RulesNotFoundError` |
| `src/loaders/index.ts` | Export rules-loader |
| `src/tools/resource-tools.ts` | Register `get_rules` tool |
| `src/loaders/activity-loader.ts` | Add `next_action` to ActivityIndex |
| `tests/mcp-server.test.ts` | Integration tests for get_rules |

---

## Rule Sections Migrated

1. **Code Modification Boundaries** (critical)
2. **Implementation Workflow Boundaries** (critical)
3. **File and Directory Restrictions** (high)
4. **Communication Standards** (high)
5. **Documentation Standards** (high)
6. **Task Management** (medium)
7. **Error Recovery and Edge Cases** (medium)
8. **Version Control Practices** (high)
9. **GitHub CLI Usage** (medium)
10. **Context Management Strategy** (low)

---

## Execution Order

After this change, agents following the workflow receive rules before execution:

```
get_activities → get_rules → get_skill → get_workflow → ...
```

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Store rules in `meta/rules.toon` | Consistent with universal resources pattern |
| Use `next_action` field | Matches existing activity pattern |
| Return parsed JSON | Agents can process structured data |
| Workflow rules take precedence | Allows per-workflow customization |

---

## Test Results

| Category | Count | Status |
|----------|-------|--------|
| Total Tests | 96 | ✅ Pass |
| New Tests | 10 | ✅ Pass |
| Build | - | ✅ Pass |
| Linter | - | ✅ No errors |

---

## Commits

### Main Branch (fix/17-rules-migration)
- `7d793a0` feat: Add get_rules tool for global agent guidelines
- `c487e0c` refactor: Remove redundant 'important' field from ActivityIndex
- `9bd969f` refactor: Rename first_action to next_action for consistency

### Workflows Branch
- `77b0052` feat: Add global agent rules from AGENTS.md
- `e3f28f2` fix: Add prerequisite to assumptions checkpoint
