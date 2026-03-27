# Work-Package Workflow Structural Enforcement Audit

**Workflow:** work-package v3.4.0  
**Audit Date:** 2026-03-19  
**Scope:** Compliance review of workflow-level and activity-level rules for structural enforcement

---

## 1. Workflow-Level Rules (12 rules)

| # | Rule | Violable by Ignoring? | Structural Mechanism | Rating |
|---|------|----------------------|----------------------|--------|
| 1 | PREREQUISITE: Agents MUST read and follow AGENTS.md before starting any work | Yes | None. No checkpoint, condition, or validation requires AGENTS.md to have been read. | **text-only** |
| 2 | Agents must NOT proceed past checkpoints without user confirmation | Yes | Checkpoints are defined with `blocking: true` and options. The orchestrator/worker protocol requires workers to yield `checkpoint_pending` at checkpoints. However, there is no runtime enforcement—an agent could skip yielding and proceed. Compliance is behavioral, not structurally enforced. | **partially enforced** |
| 3 | Ask, don't assume - Clarify requirements before acting | Yes | None. | **text-only** |
| 4 | Summarize, then proceed - Provide brief status before asking to continue | Yes | None. | **text-only** |
| 5 | One task at a time - Complete current work before starting new work | Yes | The implement activity has a `task-cycle` loop (forEach over `plan.tasks`) that structurally sequences tasks. The general rule is broader; only the implementation phase has this structure. | **partially enforced** |
| 6 | Explicit approval - Get clear 'yes' or 'proceed' before major actions (within activity checkpoints only — NOT between activities) | Yes | Blocking checkpoints at major decision points (e.g., confirm-implementation, pr-creation, assumptions-log-final) require user selection. Not all "major actions" have checkpoints; coverage is partial. | **partially enforced** |
| 7 | Decision points require user choice - When issues are found, user decides whether to proceed or loop back | Yes | Activities define decisions with checkpoints (e.g., feedback-triage, review-outcome, blocker-gate). Transitions consume user-selected variables. An agent could skip presenting options. | **partially enforced** |
| 8 | AUTOMATIC TRANSITION RULE: The orchestrator MUST advance between activities automatically... | Yes | The transition table is defined in TOON; `validate_transition` can verify allowed transitions. The orchestrator must choose to call it and respect results. No automatic enforcement. | **partially enforced** |
| 9 | EXECUTION MODEL: This workflow uses an orchestrator/worker pattern... | Yes | The workflow declares the pattern; skills (orchestrate-workflow, execute-activity) implement it. No structural enforcement that the receiving agent acts as orchestrator vs. worker—it's a role assignment rule. | **text-only** |
| 10 | ORCHESTRATOR DISCIPLINE: The orchestrator MUST NOT execute activity steps... | Yes | Role separation is defined but not enforced. An orchestrator agent could execute steps; there is no validation that step execution came from the worker. | **text-only** |
| 11 | CHECKPOINT YIELD RULE: When a checkpoint message references generated content... the worker MUST include that content in the 'context' field... | Yes | Checkpoints define messages and options; the rule specifies how to populate the yield. No validation that context was included. | **text-only** |
| 12 | README PROGRESS RULE: After each completed activity, the orchestrator MUST update... | Yes | The rule specifies README updates as part of commit-artifacts. No validation step or precondition checks that the README was updated before transition. | **text-only** |

---

## 2. Activity-Level Rules Summary

| Activity | rules[] count | Text-Only | Structurally Enforced |
|----------|---------------|-----------|------------------------|
| start-work-package | 3 | 3 | 0 |
| design-philosophy | 4 | 4 | 0 |
| requirements-elicitation | 1 | 1 | 0 |
| research | 1 | 1 | 0 |
| implementation-analysis | 1 | 1 | 0 |
| plan-prepare | 1 | 1 | 0 |
| assumptions-review | 5 | 5 | 0 |
| implement | 4 | 4 | 0 |
| post-impl-review | 6 | 6 | 0 |
| validate | 1 | 1 | 0 |
| strategic-review | 1 | 1 | 0 |
| submit-for-review | 1 | 1 | 0 |
| complete | 1 | 1 | 0 |
| codebase-comprehension | 10 | 10 | 0 |
| **Total** | **40** | **40** | **0** |

**Summary counts:**
- **Total activity-level rules:** 40
- **Text-only:** 40 (100%)
- **Structurally enforced:** 0 (0%)

*Note: "Structurally enforced" here means a mechanism (checkpoint, condition, validate action, decision, or loop) that prevents violation without agent compliance. Activity rules are predominantly procedural guidance (e.g., "load skill for protocol") or references to CHECKPOINT YIELD RULE—none have dedicated structural mechanisms.*

---

## 3. Critical Rules That SHOULD Have Structural Enforcement

### High Priority

1. **Rule 2: Do not proceed past checkpoints without user confirmation**
   - **Why:** Core workflow fidelity. Skipping checkpoints bypasses user control and can lead to incorrect or unwanted actions.
   - **Recommendation:** Add a `validate_checkpoint_response` or similar mechanism: before the worker can report activity completion, the orchestrator must confirm that all blocking checkpoints were presented and user responses recorded. Alternatively, define checkpoint IDs as required completion tokens that must be present in the worker's result before the orchestrator accepts completion.

2. **Rule 12: README PROGRESS RULE**
   - **Why:** Ensures planning folder README stays in sync with workflow progress. Missing updates break traceability.
   - **Recommendation:** Add an `exitAction` or pre-transition validation that checks for README updates (e.g., presence of ✅ markers in Progress table, footer status line). Or make README update a required step with a `validate` action before transition.

3. **Rule 1: PREREQUISITE: Read AGENTS.md**
   - **Why:** AGENTS.md contains critical boundaries (e.g., no code modification without direction, engineering artifact structure). Skipping it increases risk of boundary violations.
   - **Recommendation:** Add a bootstrap checkpoint at workflow start (e.g., in start-work-package entry) that requires explicit confirmation: "I have read AGENTS.md and understand the project boundaries." Or a `validate` action that checks for a specific token/acknowledgment in state.

### Medium Priority

4. **Rule 11: CHECKPOINT YIELD RULE (context field)**
   - **Why:** When checkpoint messages reference generated content (analyses, plans, assumptions), the user must see that content to make informed choices. Omitting context degrades decision quality.
   - **Recommendation:** For checkpoints whose messages reference "generated content," add a schema or validation that the `checkpoint_pending` yield includes a non-empty `context` field. Could be enforced at the MCP/server layer if checkpoint definitions declare `requiresContext: true`.

5. **Rule 10: ORCHESTRATOR DISCIPLINE**
   - **Why:** Prevents the orchestrator from doing domain work (code, reviews, artifacts), which would blur roles and bypass worker skills.
   - **Recommendation:** Harder to enforce structurally. Could add a convention: worker results must include `steps_completed` and `artifacts_produced`; orchestrator logic rejects transitions when the orchestrator itself produced artifacts. Requires protocol-level support.

---

## 4. Methodology Notes

- **Violable by ignoring:** A rule is violable if an agent can bypass it by simply not following the instruction, without any structural barrier.
- **Structural mechanism:** Checkpoints (blocking), conditions (transitions, loops), validate actions, or decisions that constrain behavior regardless of agent intent.
- **Partially enforced:** Some structural support exists (e.g., checkpoint definitions, transition table) but compliance still depends on agent behavior; no automatic validation prevents violation.
- **Text-only:** No structural mechanism; compliance is entirely behavioral.
