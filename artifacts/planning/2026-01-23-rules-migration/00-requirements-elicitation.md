# Requirements Elicitation: Global Agent Rules

**Issue:** [#17](https://github.com/m2ux/workflow-server/issues/17)  
**Date:** 2026-01-23

---

## Problem Statement

The external AGENTS.md file containing comprehensive agent behavioral guidelines was not migrated during WP-006 (guide migration) because it was at the repository root, not in the work-package folder. This has resulted in agents not following important rules such as:

- Using deprecated GitHub API (GraphQL) instead of REST API for mutations
- Other behavioral guidelines not being applied

**Root Cause:** Rules need to apply to ALL workflows globally, not embedded in individual workflow definitions.

---

## Stakeholders

| Stakeholder | Role | Needs |
|-------------|------|-------|
| Workflow users | Primary | Agents that follow consistent behavioral guidelines |
| Workflow authors | Secondary | Clear precedence rules for workflow-specific vs global rules |

---

## Scope

### ✅ In Scope

1. Create new `get_rules` MCP tool to retrieve global agent rules
2. Convert ALL rules from external AGENTS.md to TOON format
3. Store rules file on `workflows` branch (consistent with existing structure)
4. Update `get_activities` response to instruct agents to call `get_rules` next
5. Implement rules loader following existing loader patterns

### ❌ Out of Scope

1. Modifying individual workflow rule arrays
2. Creating per-workflow rule override mechanisms (beyond existing workflow rules)

### Design Decisions

- **Rule precedence:** Workflow-specific rules take precedence over global rules if conflicts exist
- **Storage location:** `workflows` branch, TOON format
- **Execution order:** `get_activities` → `get_rules` → workflow-specific tools

---

## Success Criteria

1. **`get_rules` tool functional**
   - Returns complete AGENTS.md content in structured TOON format
   - Accessible via MCP tool call

2. **`get_activities` updated**
   - Response instructs agents to call `get_rules` as next action
   - Execution order: `get_activities` → `get_rules` → other tools

3. **Rules file on workflows branch**
   - All rules from external AGENTS.md converted to TOON
   - Stored in appropriate location on `workflows` branch

4. **Tests pass**
   - New rules loader tests added and passing
   - Existing tests continue to pass

---

## Source Material

**External AGENTS.md:** https://github.com/m2ux/agent-resources/blob/main/AGENTS.md

Key sections to migrate:
- Agent Guardrails (Code Modification Boundaries)
- Implementation Workflow Boundaries
- File and Directory Restrictions
- Communication Standards
- Documentation Standards
- Context Management Strategy
- Task Management
- Workflow Patterns
- Error Recovery and Edge Cases
- Version Control Practices (including GitHub CLI usage)

---

## User Stories

1. **As a workflow user**, I want agents to receive global behavioral rules before executing any workflow, so that they follow consistent guidelines.

2. **As a workflow author**, I want workflow-specific rules to override global rules when needed, so that I can customize behavior for specific workflows.
