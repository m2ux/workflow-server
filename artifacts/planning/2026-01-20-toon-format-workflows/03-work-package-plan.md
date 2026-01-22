# Use TOON Format for Workflows - Implementation Plan

**Date:** 2026-01-20  
**Priority:** MEDIUM  
**Status:** Ready  
**Estimated Effort:** 2-3h agentic + 30m review

---

## Overview

### Problem Statement

The current JSON workflow files are verbose, consuming excessive LLM tokens when loaded into context and making manual reading/editing difficult for developers. The `work-package.json` workflow alone uses ~6,386 tokens, and combined data files use ~19,526 tokens. This increases LLM costs and reduces effective context window utilization.

### Scope

**In Scope:**
- Convert `workflow-data/workflows/*.json` → `.toon`
- Convert `prompts/intents/*.json` → `.toon`
- Convert `prompts/skills/*.json` → `.toon`
- Update loaders to parse TOON instead of JSON
- Add `@toon-format/toon` dependency
- Update file path references and filters

**Out of Scope:**
- Schema files (`schemas/*.json`) - These are JSON Schema files used for validation, not LLM context
- Changing workflow data structure or schema
- Adding new workflow features
- Changing MCP tool API interfaces

---

## Research & Analysis

*See companion planning artifacts for full details:*
- **Web Research:** [02-web-research.md](02-web-research.md)
- **Implementation Analysis:** [01-implementation-analysis.md](01-implementation-analysis.md)

### Key Findings Summary

**From Web Research:**
- TOON SDK: `@toon-format/toon` with `encode()`/`decode()` API
- `decode()` returns plain JS objects — Zod validation unchanged
- Token savings: 30-60% depending on data structure
- Spec v3.0 is stable (2025-11-24)

**From Implementation Analysis:**
- **Baseline:** ~19,526 tokens across all data files
- **Gap:** JSON syntax overhead (braces, quotes, colons) significant
- **Opportunity:** TOON tabular format optimal for workflow phases arrays

---

## Proposed Approach

### Solution Design

1. **Add TOON dependency** — Install `@toon-format/toon` npm package
2. **Create TOON utility module** — Centralize decode logic with error handling
3. **Update loaders** — Replace `JSON.parse()` with `decode()` in all loaders
4. **Convert data files** — Use CLI to convert JSON → TOON
5. **Update file filters** — Change `.json` → `.toon` in file discovery
6. **Validate** — Run tests, verify MCP tools work identically

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| TOON format | 30-60% token reduction, better readability, mature SDK | New dependency, learning curve | **Selected** |
| YAML format | Human readable, no new dependency | Less token efficient than TOON, parsing complexity | Rejected |
| Minified JSON | Some token reduction | Still verbose, poor readability | Rejected |
| Keep JSON | No changes needed | No improvement | Rejected |

---

## Implementation Tasks

### Task 1: Add TOON Dependency (5 min)

**Goal:** Install the `@toon-format/toon` package

**Deliverables:**
- `package.json` - Add `@toon-format/toon` dependency
- `package-lock.json` - Updated lock file

### Task 2: Create TOON Utility Module (15-20 min)

**Goal:** Centralized TOON decode function with error handling

**Deliverables:**
- `src/utils/toon.ts` - TOON decode wrapper with error handling
- Export from `src/utils/index.ts`

### Task 3: Update Workflow Loader (20-30 min)

**Goal:** Parse `.toon` files instead of JSON

**Deliverables:**
- `src/loaders/workflow-loader.ts` - Updated to use TOON decode
- File extension changed from `.json` to `.toon`

### Task 4: Update Intent Loader (15-20 min)

**Goal:** Parse `.toon` intent files

**Deliverables:**
- `src/loaders/intent-loader.ts` - Updated to use TOON decode
- File extension changed from `.json` to `.toon`

### Task 5: Update Skill Loader (15-20 min)

**Goal:** Parse `.toon` skill files

**Deliverables:**
- `src/loaders/skill-loader.ts` - Updated to use TOON decode
- File extension changed from `.json` to `.toon`

### Task 6: Convert Workflow Files (20-30 min)

**Goal:** Convert JSON workflow files to TOON format

**Deliverables:**
- `workflow-data/workflows/work-package.toon` - Converted from JSON
- `workflow-data/workflows/example-workflow.toon` - Converted from JSON
- Delete original `.json` files

### Task 7: Convert Intent Files (15-20 min)

**Goal:** Convert JSON intent files to TOON format

**Deliverables:**
- `prompts/intents/index.toon` - Converted
- `prompts/intents/start-workflow.toon` - Converted
- `prompts/intents/resume-workflow.toon` - Converted
- `prompts/intents/end-workflow.toon` - Converted
- Delete original `.json` files

### Task 8: Convert Skill Files (10-15 min)

**Goal:** Convert JSON skill files to TOON format

**Deliverables:**
- `prompts/skills/workflow-execution.toon` - Converted
- Delete original `.json` files

### Task 9: Update Tests (30-45 min)

**Goal:** Ensure all tests pass with TOON files

**Deliverables:**
- Update test fixtures if needed
- Update any hardcoded `.json` references in tests
- All tests passing

### Task 10: Measure Token Savings (15-20 min)

**Goal:** Validate 30%+ token reduction

**Deliverables:**
- Token count comparison before/after
- Update PR description with results

---

## Success Criteria

*Based on baseline metrics and gap analysis above*

### Functional Requirements
- [ ] All MCP tools return identical data structures (addresses gap: G3)
- [ ] All loaders successfully parse TOON files (addresses gap: G3)
- [ ] File extension changed from `.json` to `.toon` (addresses gap: G3)

### Performance Targets
- [ ] **Token count:** Reduce from ~19,526 to <13,668 tokens (30%+ reduction)
- [ ] **work-package workflow:** Reduce from ~6,386 to <4,470 tokens

### Quality Requirements
- [ ] All existing tests pass
- [ ] Build succeeds (`npm run build`)
- [ ] No new linter errors

### Measurement Strategy

**How will we validate improvements?**
1. Count characters/tokens before conversion (already done: ~19,526 tokens)
2. Count characters/tokens after conversion
3. Calculate percentage reduction
4. Run `npm test` to verify all tests pass
5. Run `npm run build` to verify compilation

---

## Testing Strategy

### Unit Tests
- Workflow loader: Load `.toon` file, validate structure
- Intent loader: Load `.toon` file, verify all fields
- Skill loader: Load `.toon` file, verify all fields

### Integration Tests
- MCP tools: Verify list_workflows, get_workflow return correct data
- Resources: Verify intent/skill resources return correct data

### Validation
- Compare decoded TOON output to original JSON parsed output
- Verify Zod schema validation still works

---

## Dependencies & Risks

### Requires (Blockers)
- [x] TOON TypeScript SDK available (`@toon-format/toon`)
- [x] TOON spec stable (v3.0)

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| TOON decode produces different structure | HIGH | LOW | SDK is mature, test with actual files |
| Edge cases in workflow data | MEDIUM | MEDIUM | Convert one file first, validate thoroughly |
| Tests fail after conversion | MEDIUM | MEDIUM | Run tests after each loader update |
| Less than 30% token reduction | LOW | LOW | TOON benchmarks show 30-60% typical |

---

**Status:** Ready for implementation
