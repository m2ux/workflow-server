# Implementation Analysis - Use TOON Format for Workflows

**Date:** 2026-01-20  
**Work Package:** Use TOON format for workflows (#4)  
**Status:** Complete

---

## Implementation Review

### Existing Location

| Component | Path | Description |
|-----------|------|-------------|
| Workflow Loader | `src/loaders/workflow-loader.ts` | Loads and validates workflow JSON files |
| Intent Loader | `src/loaders/intent-loader.ts` | Loads intent JSON files |
| Skill Loader | `src/loaders/skill-loader.ts` | Loads skill JSON files |
| Workflow Files | `workflow-data/workflows/*.json` | Workflow definitions |
| Intent Files | `prompts/intents/*.json` | Intent definitions |
| Skill Files | `prompts/skills/*.json` | Skill definitions |
| Schema Files | `schemas/*.json` | JSON Schema definitions |

### Usage Patterns

**How JSON files are used today:**

1. **Workflow Loading** (`loadWorkflow`):
   - Read file with `readFile(filePath, 'utf-8')`
   - Parse with `JSON.parse(content)`
   - Validate with Zod schema (`safeValidateWorkflow`)
   - Return typed `Workflow` object

2. **Intent Loading** (`readIntent`, `readIntentIndex`):
   - Read file with `readFile(filePath, 'utf-8')`
   - Parse with `JSON.parse(content)` 
   - Cast to `Intent` or `IntentIndex` type
   - No runtime validation

3. **Skill Loading** (`readSkill`):
   - Read file with `readFile(filePath, 'utf-8')`
   - Parse with `JSON.parse(content)`
   - Cast to `Skill` type
   - No runtime validation

4. **File Discovery** (`listWorkflows`, `listIntents`, `listSkills`):
   - Use `readdir` to list files
   - Filter by `.json` extension
   - Load each file to extract metadata

**Call frequency:** On-demand via MCP tools (list_workflows, get_workflow, etc.)

### Dependencies

**Depends On:**
- `node:fs` / `node:fs/promises` - File system operations
- `JSON.parse` - Native JSON parsing
- Zod schemas (`src/schema/*.ts`) - Workflow validation

**Depended On By:**
- MCP tools (`src/tools/workflow-tools.ts`)
- MCP resources (`src/resources/*.ts`)

### Architecture

**Existing patterns:**
- Result type pattern for error handling (`ok`/`err`)
- Type assertions after JSON.parse for intents/skills
- Zod schema validation only for workflows
- File extension hardcoded as `.json` in loaders

**Known technical debt:**
- Intent/skill loaders lack runtime validation
- File extension is hardcoded in multiple places
- No abstraction over file format (JSON-specific)

---

## Effectiveness Evaluation

### What's Working Well ✅

| Capability | Evidence | Confidence |
|------------|----------|------------|
| Workflows load correctly | Tests pass, MCP tools return valid data | HIGH |
| Schema validation catches errors | `safeValidateWorkflow` returns typed errors | HIGH |
| Result pattern handles failures | All loaders return `Result<T, Error>` | HIGH |

### What's Not Working ❌

| Issue | Evidence | Impact |
|-------|----------|--------|
| High token count | work-package.json = ~6,386 tokens | HIGH |
| Poor human readability | Deep nesting, verbose syntax | MEDIUM |
| Hardcoded `.json` extension | Multiple files reference `.json` | LOW |

### Workarounds in Place

- None currently - users accept the token cost and readability issues

---

## Baseline Metrics

| File | Current Size | Est. Tokens | Category |
|------|-------------|-------------|----------|
| `work-package.json` | 25,545 chars | ~6,386 | Workflow |
| `example-workflow.json` | 1,451 chars | ~362 | Workflow |
| `workflow.schema.json` | 33,063 chars | ~8,265 | Schema |
| `state.schema.json` | 7,584 chars | ~1,896 | Schema |
| `condition.schema.json` | 2,328 chars | ~582 | Schema |
| `workflow-execution.json` | 2,994 chars | ~748 | Skill |
| `start-workflow.json` | 1,304 chars | ~326 | Intent |
| `end-workflow.json` | 1,305 chars | ~326 | Intent |
| `resume-workflow.json` | 1,378 chars | ~344 | Intent |
| `index.json` (intents) | 1,164 chars | ~291 | Intent Index |
| **TOTAL** | **78,116 chars** | **~19,526 tokens** | |

**Measurement Method:** `wc -c` for character count, divided by 4 for token estimate

### Key Findings

- The `work-package.json` workflow alone uses ~6,386 tokens
- Combined workflow + schema files use ~19,526 tokens
- JSON syntax overhead (braces, quotes, colons) contributes significantly to token count

---

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority |
|----|-----|---------------|---------------|--------|----------|
| G1 | High token usage | ~19,526 tokens total | 30%+ reduction (~13,668 tokens) | LLM cost/context | HIGH |
| G2 | Poor readability | Verbose JSON with deep nesting | Clean TOON format | Developer experience | MEDIUM |
| G3 | Hardcoded extension | `.json` in 3 loaders | Configurable or `.toon` | Maintainability | LOW |
| G4 | Missing validation | Intent/skill lack runtime validation | Consistent validation | Code quality | LOW |

---

## Opportunities for Improvement

### Quick Wins (Low Effort, High Impact)

1. **Install `@toon-format/toon` package:**
   - Expected impact: Enable TOON parsing capability
   - Effort: 5 minutes

2. **Create TOON utility functions:**
   - Expected impact: Centralized encode/decode logic
   - Effort: 30 minutes

### Structural Improvements (Higher Effort)

1. **Update all loaders to use TOON:**
   - Expected impact: All files loaded as TOON
   - Effort: 2-3 hours

2. **Convert all JSON files to TOON:**
   - Expected impact: Token reduction across all files
   - Effort: 1-2 hours

### Optimization Opportunities

1. **Measure actual token savings:**
   - Expected impact: Validate 30%+ reduction target
   - Effort: 30 minutes

---

## Success Criteria

### Performance Targets

- [ ] **Token count:** Reduce from ~19,526 to <13,668 tokens (30%+ reduction)
- [ ] **work-package.json:** Reduce from ~6,386 to <4,470 tokens

### Quality Targets

- [ ] **Test coverage:** All existing tests pass
- [ ] **Build:** `npm run build` succeeds without errors
- [ ] **Lint:** No new linter errors introduced

### Functional Requirements

- [ ] All MCP tools return identical data structures
- [ ] All loaders successfully parse TOON files
- [ ] File extension changed from `.json` to `.toon`

### Measurement Strategy

**How will we validate improvements?**

1. **Token comparison script:**
   - Convert JSON to TOON
   - Count characters/tokens in both
   - Calculate percentage reduction

2. **Functional validation:**
   - Run `npm test` to verify all tests pass
   - Manually test MCP tools to confirm behavior unchanged

3. **Build validation:**
   - Run `npm run build` to confirm compilation succeeds

---

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| `wc -c` on JSON files | File size | Total ~78KB, ~19,526 tokens |
| Loader source code | Implementation | JSON.parse used, .json hardcoded |
| Test suite | Quality | All tests currently pass |

---

**Status:** Ready for research decision
