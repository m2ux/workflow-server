# Design Philosophy

**Work Package:** Checkpoint Enforcement Reliability  
**Issue:** #51 - Workflow orchestration checkpoint enforcement is unreliable  
**Created:** 2026-03-12

---

## Problem Statement

The orchestrator/worker execution model relies on the worker sub-agent to voluntarily yield at blocking checkpoints defined in activity definitions. In practice, the worker frequently bypasses these checkpoints due to LLM completion bias — the model's tendency to generate a complete response rather than stop mid-activity. The orchestrator then accepts the `activity_complete` result without validating that required checkpoints were responded to. The combined effect locks users out of workflow decisions the system was designed to surface.

### System Context

The workflow server implements a Goal → Activity → Skill → Tools model where:
- The **orchestrator** loads workflow definitions, manages state, evaluates transitions, and dispatches activities to a worker
- The **worker** self-bootstraps from activity and skill definitions, executes steps sequentially, and reports structured results
- **Blocking checkpoints** are defined within activities as explicit yield points requiring user input
- The worker communicates results via structured output: `activity_complete` (all done) or `checkpoint_pending` (yielding for user input)

The checkpoint enforcement chain has three links, all of which can fail:
1. Worker prompt instructions tell the worker to yield — but LLM completion bias overrides this
2. Skill definitions describe checkpoint behavior — but lack structural enforcement
3. Orchestrator receives results — but does not validate checkpoint coverage

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | High — users are locked out of required decisions |
| Scope | All workflows using the orchestrator/worker model with blocking checkpoints |
| Business Impact | Workflow execution becomes non-deterministic; user trust in guided workflows erodes |

---

## Problem Classification

**Type:** Specific Problem

**Subtype:**
- [x] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [ ] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

**Rationale:** The failure mode is observable and reproducible. Three root causes are identified: (1) LLM completion bias in the worker, (2) missing validation logic in the orchestrator, (3) no server-side structural enforcement. The fix scope spans prompt templates, skill TOON definitions, orchestrator validation logic, and potentially server-side gate architecture. Requirements are well-specified in the issue with clear acceptance criteria.

---

## Workflow Path Decision

**Selected Path:** Skip optional activities — direct to codebase comprehension and planning

**Activities Included:**
- [x] Design Philosophy (current)
- [x] Codebase Comprehension (mandatory)
- [ ] Requirements Elicitation (skipped — requirements are clear)
- [ ] Research (skipped — solution space is bounded)
- [x] Plan & Prepare
- [x] Implementation
- [x] Review

**Rationale:** The issue prescribes three distinct fix levels with clear acceptance criteria. The root causes are known. No external research or stakeholder elicitation is needed. Codebase comprehension is essential to understand current checkpoint handling, orchestration skill definitions, and server architecture before planning implementation.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Compatibility | Changes must be backward-compatible with existing workflow definitions |
| Interface | Must work within the current MCP tool interface (no server protocol changes) |
| Context Budget | Worker prompt changes must remain within typical LLM context window budgets |
| Scope | Workflow content changes limited to checkpoint enforcement — no new activities or workflows |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Checkpoint bypass prevention | Required blocking checkpoints are always presented to the user | 100% enforcement |
| Orchestrator validation | `activity_complete` rejected when required checkpoints missing | Zero false acceptances |
| User lockout incidents | Users locked out of workflow decisions | Zero occurrences |
| Backward compatibility | Existing workflow definitions continue to work | No regressions |

---

## Notes

- The three fix levels (orchestrator validation, worker prompts, system architecture) form a defense-in-depth strategy — each level independently reduces bypass risk
- Orchestrator validation is the most critical and immediate fix — it provides a safety net regardless of worker behavior
- Worker prompt improvements reduce the frequency of bypass attempts but cannot guarantee compliance
- System architecture changes (server-side gates, smaller activities) are the most robust long-term solution but require the most design work
- The reconciliation step should verify how checkpoints are currently defined in activity TOON files and how the orchestrate-workflow skill handles validation
