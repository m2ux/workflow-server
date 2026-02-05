# Global Agent Rules - Implementation Plan

**Date:** 2026-01-23  
**Priority:** HIGH  
**Status:** Planning  
**Estimated Effort:** 2-3h agentic + 30m review

---

## Overview

### Problem Statement

The external AGENTS.md containing comprehensive agent behavioral guidelines was not migrated during WP-006 because it was at the repository root. Agents are not following important rules (e.g., using deprecated GitHub API). Rules need to apply globally to ALL workflows.

### Scope

**In Scope:**
- Create `get_rules` MCP tool
- Convert AGENTS.md to TOON format (`meta/rules.toon`)
- Update `get_activities` to instruct calling `get_rules`
- Implement rules-loader following existing patterns

**Out of Scope:**
- Modifying individual workflow rule arrays
- Per-workflow rule override mechanisms (beyond existing workflow rules)

---

## Research & Analysis

*See companion planning artifacts:*
- **Requirements:** [00-requirements-elicitation.md](00-requirements-elicitation.md)
- **Implementation Analysis:** [01-implementation-analysis.md](01-implementation-analysis.md)

### Key Findings Summary

**From Requirements:**
- Rules must apply to ALL workflows globally
- Workflow-specific rules take precedence on conflict
- Execution order: `get_activities` → `get_rules` → other tools

**From Implementation Analysis:**
- `meta/` folder contains universal resources (intents, skills)
- Existing loader pattern: `NN-{id}.toon` files with TOON parsing
- Activity loader already builds dynamic index with `next_action` guidance

---

## Proposed Approach

### Solution Design

1. Store global rules in `meta/rules.toon` on workflows branch
2. Create `rules-loader.ts` following skill-loader pattern
3. Add `get_rules` tool to `resource-tools.ts`
4. Modify `readActivityIndex()` to include rules instruction in response

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Single `meta/rules.toon` | Simple, consistent with meta pattern | Less modular | **Selected** |
| Rules directory `meta/rules/` | More modular | Overcomplicated for single file | Rejected |
| Embed in workflow definitions | Per-workflow customization | Duplicates rules, harder to maintain | Rejected |

---

## Implementation Tasks

### Task 1: Convert AGENTS.md to TOON (20-30 min)
**Goal:** Create `meta/rules.toon` on workflows branch  
**Deliverables:**
- `workflows/meta/rules.toon` - All AGENTS.md sections in TOON format

**Sections to convert:**
- Agent Guardrails (Code Modification, Process Attribution)
- Implementation Workflow Boundaries
- File and Directory Restrictions
- Communication Standards
- Documentation Standards
- Task Management
- Error Recovery and Edge Cases
- Version Control Practices
- GitHub CLI Usage

### Task 2: Implement rules-loader.ts (15-20 min)
**Goal:** Create loader following existing patterns  
**Deliverables:**
- `src/loaders/rules-loader.ts` - Rules loading logic
- `src/loaders/index.ts` - Export rules-loader

**Functions:**
- `readRules(workflowDir: string): Promise<Result<Rules, RulesNotFoundError>>`

### Task 3: Add RulesNotFoundError (5 min)
**Goal:** Add error type for missing rules  
**Deliverables:**
- `src/errors.ts` - Add RulesNotFoundError class

### Task 4: Add get_rules tool (10-15 min)
**Goal:** Register new MCP tool  
**Deliverables:**
- `src/tools/resource-tools.ts` - Add get_rules tool registration

### Task 5: Update get_activities response (10-15 min)
**Goal:** Instruct agents to call get_rules after get_activities  
**Deliverables:**
- `src/loaders/activity-loader.ts` - Update ActivityIndex interface and response

### Task 6: Add tests (20-30 min)
**Goal:** Test coverage for new functionality  
**Deliverables:**
- `tests/rules-loader.test.ts` - Rules loader tests
- Update `tests/mcp-server.test.ts` - get_rules tool test

### Task 7: Commit and push workflows branch (5 min)
**Goal:** Commit rules.toon to workflows branch  
**Deliverables:**
- Commit on workflows branch with rules.toon

---

## Success Criteria

### Functional Requirements
- [x] `get_rules` tool returns complete AGENTS.md content in structured format
- [x] `get_activities` response includes instruction to call `get_rules`
- [x] Rules file exists on workflows branch at `meta/rules.toon`

### Quality Requirements
- [x] All existing tests pass (72+)
- [x] New rules-loader tests pass
- [x] get_rules tool integration test passes

---

## Testing Strategy

### Unit Tests (rules-loader.test.ts)
- `readRules()` returns parsed TOON rules
- `readRules()` returns error when file missing
- Rules structure matches expected interface

### Integration Tests (mcp-server.test.ts)
- `get_rules` tool returns valid response
- `get_activities` response includes rules instruction

---

## Dependencies & Risks

### Requires (Blockers)
- [x] Access to workflows branch worktree
- [x] External AGENTS.md content (already fetched)

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| TOON parsing issues | MEDIUM | LOW | Follow existing guide TOON patterns |
| Large rules file | LOW | LOW | TOON format is token-efficient |

---

**Status:** Ready for implementation
