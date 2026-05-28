# resume-from-checkpoint

Continue execution after the orchestrator resolves a checkpoint.

## Inputs

### session_index

The `session_index` for the worker's session — unchanged across the yield/respond/resume sequence (the server-managed index is stable across all tool calls)

### effects

Variable updates passed back by the orchestrator

## Output

### session_index

Same `session_index` as the input (returned for symmetry; the index is stable)

## Procedure

1. Call `resume_checkpoint({ session_index })`; the server verifies that `session.json#activeCheckpoint` has been cleared by the orchestrator's `respond_checkpoint`.
2. Apply `effects` to local state and continue from the paused step.

## Errors

### checkpoint_still_active

**Cause:** `resume_checkpoint` returned `no active checkpoint` or `checkpoint is still active`.

**Recovery:** The orchestrator has not yet called `respond_checkpoint` to resolve the checkpoint. Wait for the orchestrator to resume you; do not call `resume_checkpoint` until the resume prompt arrives.
