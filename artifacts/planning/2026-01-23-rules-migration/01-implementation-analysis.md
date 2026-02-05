# Implementation Analysis: Global Agent Rules

**Issue:** [#17](https://github.com/m2ux/workflow-server/issues/17)  
**Date:** 2026-01-23

---

## Current State

### Directory Structure

```
workflows/                          # Worktree for 'workflows' branch
├── meta/                           # Universal/global resources
│   ├── intents/                    # Activity definitions
│   │   ├── 01-start-workflow.toon
│   │   ├── 02-resume-workflow.toon
│   │   └── 03-end-workflow.toon
│   ├── skills/                     # Universal skills
│   │   ├── 00-activity-resolution.toon
│   │   └── 01-workflow-execution.toon
│   └── meta.toon                   # Meta workflow definition
├── work-package/                   # Work-package workflow resources
│   ├── guides/                     # 18 guide files
│   ├── templates/                  # 12 template files
│   └── work-package.toon           # Workflow definition
└── README.md
```

### Existing Patterns

| Component | Pattern | Location |
|-----------|---------|----------|
| Activities | `meta/intents/NN-{id}.toon` | activity-loader.ts |
| Skills | `meta/skills/NN-{id}.toon` (universal) | skill-loader.ts |
| Guides | `{workflow}/guides/NN-{name}.toon` | guide-loader.ts |
| Templates | `{workflow}/templates/NN-{name}.md` | template-loader.ts |

### Current `get_activities` Response

```json
{
  "description": "Match user goal to an activity...",
  "usage": "After matching an activity, call the tool specified in next_action...",
  "activities": [...],
  "quick_match": {...}
}
```

**Problem:** No instruction to call `get_rules` before proceeding.

### Current Workflow Rules

Work-package workflow has 6 rules focused on checkpoint/approval:
1. Agents must NOT proceed past checkpoints without user confirmation
2. Ask, don't assume
3. Summarize, then proceed
4. One task at a time
5. Explicit approval
6. Decision points require user choice

**Gap:** Missing comprehensive agent behavioral guidelines from AGENTS.md.

---

## Proposed Implementation

### 1. Rules File Location

**Option A (Recommended):** Single file in meta workflow
```
meta/rules.toon                    # Global agent rules
```

**Option B:** Rules directory (more complex, not needed)
```
meta/rules/00-agent-guidelines.toon
```

**Decision:** Option A - Single `meta/rules.toon` file is sufficient.

### 2. Rules Loader

New `rules-loader.ts` following existing patterns:

```typescript
// meta/rules.toon location
const RULES_FILE = 'rules.toon';

interface Rules {
  id: string;
  version: string;
  description: string;
  sections: RulesSection[];
}

export async function readRules(workflowDir: string): Promise<Result<Rules, RulesNotFoundError>>
```

### 3. New `get_rules` Tool

Add to `resource-tools.ts`:

```typescript
server.tool(
  'get_rules',
  'Get global agent rules - behavioral guidelines that apply to all workflow executions',
  {},
  withAuditLog('get_rules', async () => {
    const result = await readRules(config.workflowDir);
    if (!result.success) throw result.error;
    return { content: [{ type: 'text', text: result.value }] };
  })
);
```

### 4. Update `get_activities` Response

Modify `readActivityIndex()` to include rules instruction:

```typescript
const index: ActivityIndex = {
  description: 'Match user goal to an activity...',
  usage: 'After matching an activity, call the tool specified in next_action...',
  important: 'Before executing any workflow, call get_rules to retrieve global agent guidelines.',
  next_action: {
    tool: 'get_rules',
    parameters: {}
  },
  activities,
  quick_match,
};
```

### 5. New Error Type

Add to `errors.ts`:

```typescript
export class RulesNotFoundError extends Error {
  readonly code = 'RULES_NOT_FOUND';
  constructor() { 
    super('Global rules not found'); 
    this.name = 'RulesNotFoundError'; 
  }
}
```

---

## Files to Modify

### Main Branch (src/)

| File | Change |
|------|--------|
| `src/loaders/rules-loader.ts` | **New** - Rules loading logic |
| `src/loaders/index.ts` | Export rules-loader |
| `src/errors.ts` | Add RulesNotFoundError |
| `src/tools/resource-tools.ts` | Add get_rules tool |
| `src/loaders/activity-loader.ts` | Update ActivityIndex to include rules instruction |
| `tests/rules-loader.test.ts` | **New** - Rules loader tests |

### Workflows Branch

| File | Change |
|------|--------|
| `meta/rules.toon` | **New** - Global agent rules in TOON format |

---

## TOON Rules Format

```toon
id: agent-rules
version: 1.0.0
description: Global agent behavioral guidelines for all workflow executions
precedence: Workflow-specific rules override these global rules on conflict

sections[N]:
  - id: code-modification
    title: Code Modification Boundaries
    rules[M]:
      - Do not modify code unless explicitly directed by the user
      - Always request permission before making changes
      - ...
  
  - id: communication
    title: Communication Standards
    rules[M]:
      - Use measured, technical language
      - Avoid hyperbolic statements
      - ...
```

---

## Implementation Tasks

1. **Convert AGENTS.md to TOON** - Create `meta/rules.toon` on workflows branch
2. **Implement rules-loader.ts** - Following existing loader patterns
3. **Add RulesNotFoundError** - New error type
4. **Add get_rules tool** - Register in resource-tools.ts
5. **Update get_activities** - Add rules instruction to response
6. **Add tests** - Rules loader and tool tests
7. **Update exports** - Add to loaders/index.ts

---

## Success Criteria

1. ✅ `get_rules` tool returns complete AGENTS.md content in TOON format
2. ✅ `get_activities` response instructs calling `get_rules` next
3. ✅ Rules file exists on `workflows` branch at `meta/rules.toon`
4. ✅ All tests pass (existing + new)

---

## Execution Order After Implementation

```
User: "Start work-package workflow"
Agent:
  1. get_activities           → Returns activity index with rules instruction
  2. get_rules                → Returns global agent guidelines  
  3. get_skill                → Returns workflow-execution skill
  4. get_workflow             → Returns work-package workflow definition
  5. ... proceed with workflow phases
```
