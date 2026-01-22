# Implementation Analysis: Skills Interface

## Current Implementation Overview

### Architecture

```
src/
├── config.ts              # Server configuration (env vars)
├── errors.ts              # Custom error classes
├── result.ts              # Result type utilities
├── server.ts              # MCP server creation, registers tools/resources
├── loaders/
│   ├── guide-loader.ts    # File reading for guides
│   └── workflow-loader.ts # Workflow JSON loading
├── resources/
│   └── guide-resources.ts # MCP resource handlers for guides
└── tools/
    └── workflow-tools.ts  # MCP tool handlers
```

### Existing Patterns

| Pattern | Implementation | Relevance |
|---------|----------------|-----------|
| **Resource registration** | `guide-resources.ts` uses `server.resource()` | Direct template for skill resources |
| **File loading** | `guide-loader.ts` with Result type | Template for skill loading |
| **Configuration** | Environment variables with defaults | May need `SKILL_DIR` or hardcode path |
| **Error handling** | Custom error classes with codes | Need `SkillNotFoundError` |

### Resource Registration Pattern

```typescript
// Static resource (listing)
server.resource('guides-list', 'workflow://guides', { description: '...' }, async () => {...});

// Dynamic resource (individual items)
server.resource('guide', new ResourceTemplate('workflow://guides/{name}', { list: undefined }), {...}, async (uri, variables) => {...});
```

### Loader Pattern

```typescript
// Returns Result<T, Error> for error handling
export async function readGuide(guideDir: string, name: string): Promise<Result<string, GuideNotFoundError>> {...}
```

## Gap Analysis

| Current State | Required State | Gap |
|---------------|----------------|-----|
| Guide resources only | Skill resources | New resource handlers needed |
| No skill loader | Skill JSON loading | New loader needed |
| No skill directory | `prompts/skills/` | Directory + config |
| No IDE setup | Bootstrap document | New file needed |

## Implementation Approach

### Option A: Follow Guide Pattern Exactly

- Add `skillDir` to config
- Create `skill-loader.ts` mirroring `guide-loader.ts`
- Create `skill-resources.ts` mirroring `guide-resources.ts`
- Environment variable `SKILL_DIR`

**Pros:** Consistent with existing patterns
**Cons:** Skills are in main branch, not workflow-data; env var may be unnecessary

### Option B: Hardcoded Path (Recommended)

- Skills live in `prompts/skills/` (main branch, not workflow-data)
- No new config needed; path relative to project root
- Simpler loader focused on JSON parsing
- Resource handler reads from fixed location

**Pros:** Simpler, skills don't need separate env config
**Cons:** Less flexible (acceptable given single skill requirement)

## Recommended Approach: Option B

### Changes Required

| File | Change |
|------|--------|
| `src/errors.ts` | Add `SkillNotFoundError` |
| `src/loaders/skill-loader.ts` | New: Load skill JSON files |
| `src/loaders/index.ts` | Export skill loader |
| `src/resources/skill-resources.ts` | New: MCP resource handlers |
| `src/resources/index.ts` | Export skill resources |
| `src/server.ts` | Register skill resources |
| `prompts/skills/workflow-execution.json` | New: Skill definition |
| `prompts/ide-setup.md` | New: Bootstrap instructions |

### Resource URIs

| URI | Purpose |
|-----|---------|
| `workflow://skills` | List available skills |
| `workflow://skills/{id}` | Get specific skill JSON |

### Estimated Effort

| Task | Time |
|------|------|
| Error class | 5m |
| Skill loader | 15m |
| Skill resources | 15m |
| Server integration | 5m |
| Skill JSON content | 30m |
| IDE setup | 5m |
| Tests | 30m |
| **Total** | ~2h |

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| JSON skill too large | Low | Hybrid structure keeps it ~300-400 tokens |
| Agent misinterprets skill | Medium | Include examples in skill JSON |
| Path resolution issues | Low | Use `import.meta.url` or `__dirname` equivalent |

## Dependencies

- No external dependencies
- Relies on existing MCP SDK patterns
- Follows established loader/resource patterns

## Date

2026-01-20
