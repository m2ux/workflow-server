# Change Block Index — PR #93

**PR:** [#93](https://github.com/m2ux/workflow-server/pull/93) feat: agent-id meta-skill loading, cross-workflow resources, nested skill resources  
**Base:** `ba238c7` → **Head:** `2c2737c`  
**Files changed:** 2 | **Insertions:** +200 | **Deletions:** -38

---

| # | File | Lines | Change Summary | Est. Review |
|---|------|-------|----------------|-------------|
| 1 | `src/tools/resource-tools.ts` | 14-26 | New `parseResourceRef()` — cross-workflow prefix parser | 1m |
| 2 | `src/tools/resource-tools.ts` | 28-43 | Refactored `loadSkillResources()` — uses parseResourceRef, preserves original ref as index | 2m |
| 3 | `src/tools/resource-tools.ts` | 46-58 | New `bundleSkillWithResources()` — strips raw resources, attaches _resources | 1m |
| 4 | `src/tools/resource-tools.ts` | 109-116 | `get_skills` tool description + `agent_id` parameter added | 1m |
| 5 | `src/tools/resource-tools.ts` | 117-148 | `get_skills` handler — 3-branch model (workflow/activity+meta/activity) | 3m |
| 6 | `src/tools/resource-tools.ts` | 149-177 | `get_skills` handler — bundled skills, removed flat array, token.aid update | 2m |
| 7 | `src/tools/resource-tools.ts` | 181-212 | `get_skill` handler — uses bundleSkillWithResources | 1m |
| 8 | `tests/mcp-server.test.ts` | 253-258 | Updated existing skill test — `_resources` under skill | 1m |
| 9 | `tests/mcp-server.test.ts` | 261-321 | Structured resources test suite — nesting, stripping, frontmatter | 3m |
| 10 | `tests/mcp-server.test.ts` | 355-371 | Updated workflow-level skill test — nested structure | 1m |
| 11 | `tests/mcp-server.test.ts` | 394-479 | Agent-ID meta-skill loading tests — 4 cases | 3m |
| 12 | `tests/mcp-server.test.ts` | 484-509 | Cross-workflow resource resolution tests — 2 cases | 2m |

**Total estimated review time:** ~21 minutes
