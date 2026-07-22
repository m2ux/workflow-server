---
metadata:
  version: 1.0.0
---

## Capability

Capture the task and target, fix the intensity and scope of the lazy lens, and trace the real end-to-end flow the change touches — so the rung is chosen against the actual problem, not a guess at it. Honours [understand-before-climb](ponytail/the-ladder#understand-first): the affected code is read and traced before any simplification is selected.

## Outputs

### lean_brief

A concise brief recording the task, the target, the chosen intensity and scope, and the traced end-to-end flow — the entry path, the data it carries, and the exit/error paths the change touches. Names the rungs that look reachable and the safety-floor obligations that apply, so the climb starts from understanding rather than assumption.

#### artifact

`lean-brief.md`

## Protocol

### 1. Capture the task

- Record `{task_description}` and `{target_path}` verbatim, and the chosen `{lazy_intensity}` and `{pass_scope}`.
- State the one-sentence problem the change must solve. If the problem is not yet clear, resolving it is itself a safety-floor obligation — surface it before tracing.

### 2. Trace the real flow

- Read the affected code fully. Trace the real end-to-end flow the change touches: the entry path, the data it carries, the exit and error paths.
- Use [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[query](../../meta/techniques/gitnexus-operations/query.md) for concept-driven flow discovery and [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[context](../../meta/techniques/gitnexus-operations/context.md) for symbol-level caller/callee inspection when the codebase is indexed; otherwise read the code paths directly.
- Note which [safety-floor](ponytail/the-ladder#safety-floor) obligations the flow implicates (validation at trust boundaries, error handling, security, accessibility, calibration).

### 3. Record the brief

- Write the `{lean_brief}`: task, target, intensity, scope, the traced flow, the reachable [rungs](ponytail/the-ladder#rungs), and the safety-floor obligations in play.
