# Orchestrator Context Overfill and Staleness

## Problem

The current orchestrator execution model loads the full workflow definition via `get_workflow` at session start and holds it in context for the entire conversation. This creates two compounding problems:

### Context Overfill

The orchestrator accumulates context throughout a workflow execution:

- Full workflow definition (~13KB for work-package, 253 lines, 14 activities)
- State variables (growing as activities complete and set variables)
- Worker dispatch prompts and structured results (per activity)
- Checkpoint presentations and user responses (via AskQuestion)
- Transition evaluation reasoning

For a 14-activity workflow, by activity 8-10 the orchestrator's context window is saturated. Early content (including the workflow definition itself) gets pushed back in the attention window and effectively becomes invisible to the model, even if technically still present in the context.

### Definition Staleness

The orchestrator works from a cached copy of the workflow definition loaded at session start. Two forms of staleness:

1. **File staleness**: If the workflow `.toon` file is updated during execution, the orchestrator continues using the old definition
2. **Attention staleness**: As the context grows, the workflow definition (loaded early) falls out of the model's effective attention window. Later activities receive worse orchestration because the model can no longer reliably reference the transition table, conditions, or activity metadata

### Combined Effect

The workflow definition is loaded early (consuming context budget), referenced throughout (needs to stay accessible), but the context window is finite and attention-weighted toward recent content. This means:

- Later activities get progressively worse orchestration quality
- Transition evaluation becomes unreliable as the transition table falls out of attention
- The orchestrator may "hallucinate" transitions or conditions from partial memory of the definition

## Root Cause

The server is a content server — it serves definitions but plays no role in workflow advancement. All orchestration logic (state tracking, condition evaluation, transition selection) runs agent-side. This design puts the full burden of workflow fidelity on the agent's context window.

## Implications for Token Design

The session token was initially designed to carry workflow context (workflow_id, activity_id) so tools wouldn't need explicit parameters. But this conflates two concerns:

1. **Parameter convenience** — encoding context the agent already knows
2. **Server-side validation** — enabling the server to verify agent behavior

If tools accept explicit parameters again (workflow_id, activity_id), the token can serve a different purpose: capturing the *previous* call's state so the server can validate that the *current* call is consistent with the workflow's execution path. The token becomes a validation aid rather than a parameter carrier.

## Proposed Direction

Move transition evaluation and validation to the server side. The token carries provenance (where the agent was), explicit parameters declare intent (where the agent wants to go), and the server validates consistency between the two. This reduces context pressure on the orchestrator and shifts workflow fidelity enforcement to the server.
