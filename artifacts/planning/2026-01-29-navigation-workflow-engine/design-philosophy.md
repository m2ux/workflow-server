# Design Philosophy: Navigation-Based Workflow Engine

**Created:** 2026-01-29
**Issue:** [#34](https://github.com/m2ux/workflow-server/issues/34)

---

## Problem Definition

**Problem Statement:**
Agents executing workflows via the workflow-server do not maintain workflow fidelity. They batch operations, skip checkpoints, assume responses, and interpret schema semantics inconsistently.

**Root Cause:**
Agents interpret schemas probabilistically; there is no server-side enforcement mechanism. The system trusts agents to maintain fidelity, but LLMs optimize for task completion over process compliance.

**Impact:**
- Workflow steps are skipped
- Checkpoints are not enforced
- Non-deterministic execution
- Core value proposition of workflow system is undermined

---

## Problem Classification

| Attribute | Value |
|-----------|-------|
| **Type** | Specific Problem - Cause Known |
| **Complexity** | Moderate-to-Complex |
| **Root Cause Known** | Yes - no server-side enforcement |
| **Solution Clarity** | High - navigation-based engine with server-side enforcement |

---

## Workflow Path Decision

| Path | Selected | Rationale |
|------|----------|-----------|
| Requirements Elicitation | No | Requirements are clear from discussion |
| Research | **Yes** | Research state machine patterns and similar implementations |
| Direct to Planning | No | Research needed to validate approach |

---

## Success Criteria

- [ ] Checkpoints cannot be skipped - progression blocked until user responds
- [ ] Loop iterations executed sequentially - batching impossible
- [ ] Invalid transitions rejected - engine returns errors
- [ ] State tokens are opaque - agents cannot interpret or be biased
- [ ] Agents receive only valid actions - cannot deviate from prescribed path
- [ ] Existing workflow definitions continue to work

---

## Constraints

| Constraint | Description |
|------------|-------------|
| Agent-side state storage | State must be stored by agent for resumption |
| Stateless engine | Server should not require session storage |
| Opaque state tokens | State must be encoded to prevent agent interpretation |
| Backward compatibility | Existing .toon workflow definitions should continue to function |

---

## Next Steps

1. **Research** - Investigate state machine patterns, similar navigation APIs, encoding strategies
2. **Implementation Analysis** - Analyze current workflow-server code to understand integration points
3. **Planning** - Create detailed implementation plan with tasks
