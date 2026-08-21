---
metadata:
  version: 1.2.0
---

## Capability

Establishes what the pass is working on, the lens it runs under, and the traced end-to-end flow the change touches.

## Outputs

### lean_brief

A concise brief recording the task, the target, the chosen intensity and scope, and the traced end-to-end flow — the entry path, the data it carries, and the exit/error paths the change touches. Names the rungs that look reachable and the safety-floor obligations that apply, so the climb starts from understanding rather than assumption.

#### artifact

`lean-brief.md`

#### audience

`human`

## Protocol

### 1. Capture the task

- Record `{task_description}` and `{target_path}` verbatim, and the chosen `{lazy_intensity}` and `{pass_scope}`.
- State the one-sentence problem the change must solve. If the problem is not yet clear, resolving it is itself a safety-floor obligation — surface it before tracing.

### 2. Trace the real flow

- Read and trace the affected code per [Understand First](../resources/the-ladder.md#understand-first).
- Use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md) for concept-driven flow discovery and [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) for symbol-level caller/callee inspection when the codebase is indexed; otherwise read the code paths directly.
- Note which [safety-floor](../../ponytail/resources/the-ladder.md#safety-floor) obligations the flow implicates (validation at trust boundaries, error handling, security, accessibility, calibration).

### 3. Record the brief

- Write the `{lean_brief}` into `{artifact_dir}` per [lean-brief](../resources/lean-brief.md#template) and its [Rules](../resources/lean-brief.md#rules), carrying the traced flow, the reachable [rungs](../../ponytail/resources/the-ladder.md#rungs), and the safety-floor obligations in play.
