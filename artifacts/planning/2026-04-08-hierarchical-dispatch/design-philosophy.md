# Design Philosophy: Hierarchical Dispatch

## Problem Statement

The workflow server currently handles single workflows sequentially. However, to support complex orchestrations, it is necessary to implement a hierarchical dispatch capability. This will allow workflows to act as parent orchestrators, dispatching and managing sub-workflows.

### System Understanding
The existing workflow server manages workflows using a flat state machine approach with activities and skills. Adding hierarchical dispatch requires modifying the engine to manage a tree of workflow executions, propagating state and handling completion callbacks or continuations from sub-workflows.

### Impact Assessment
This change significantly increases the orchestration capabilities of the workflow server, enabling more modular and reusable workflow definitions.

### Success Criteria
1.  Workflows can dispatch sub-workflows using a specific action or tool.
2.  Parent workflow execution is properly paused or manages concurrent state while sub-workflows execute.
3.  Sub-workflow completion correctly returns control and results to the parent workflow.
4.  All existing tests pass, and new tests verify the hierarchical dispatch behavior.

### Constraints
*   Must maintain backward compatibility with existing single-workflow executions.
*   Must align with the existing token-based session management system.

## Problem Classification
*   **Type:** Inventive Goal (Improvement - Adding new capability)
*   **Complexity:** Complex
*   **Rationale:** Modifying the core workflow execution engine to support hierarchical state requires careful design of the session state, token structure, and state propagation between parent and child workflows.

## Workflow Path Rationale
Given the **complex** classification, a full workflow including requirements elicitation and research is necessary to fully understand the implications on the execution engine and token structure.
*   **needs_elicitation:** true
*   **needs_research:** true
*   **skip_optional_activities:** false

## Constraints
*   Token size must not explode due to hierarchical state.
*   Session recovery and checkpointing must work seamlessly across the hierarchy.
