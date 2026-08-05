---
metadata:
  version: 3.4.0
---

## Capability

Abstract sub-agent dispatch operations — harness-independent vocabulary for spawning, continuing, and concurrently dispatching agents.

## Inputs

### harness_kind

Identifier of the harness in use.

## Rules

### harness-independence

All techniques and activities MUST reference operation names from this technique ([spawn-agent](./spawn-agent.md), [continue-agent](./continue-agent.md), [spawn-concurrent](./spawn-concurrent.md)) rather than harness-specific tool syntax. Harness-specific invocation details live only in the harness technique files ([claude-code](./claude-code.md), [cursor](./cursor.md), [cline](./cline.md), [generic](./generic.md)). Generic spawn/continue/concurrent ops resolve the target through [resolve-harness-operation](./resolve-harness-operation.md) — the single authoritative `{harness_kind}` → file map — and must not inline that map.

### foreground-always

CRITICAL: every dispatch operation in this technique MUST be blocking-equivalent for the orchestrator — the orchestrator must observe the worker's `<checkpoint_yield>` or completion before continuing.

- Use a true foreground/blocking spawn wherever the harness offers one. Where it does, that is the only conforming form — a harness that can block has no reason to dispatch in the background, and an adapter that permits it anyway is reading this bullet as advice.
- Only where the harness cannot true-block: async dispatch plus waiting on that harness's completion signal is blocking-equivalent and satisfies this rule. This is a fallback for harnesses without a blocking primitive, not an option for those that have one. Hold the turn open until that signal arrives for that agent — an acknowledgement that the dispatch was accepted is not the signal, and a turn that ends before it arrives is the fire-and-forget dispatch this rule forbids, whatever the dispatch intended.
- Fire-and-forget dispatch with no completion wait is forbidden — that path silently drops checkpoint delivery.

Harness-specific technique files document how each host expresses blocking-equivalent wait — the primitive, whether it can block, and the signal to wait on where it cannot; this rule states only the contract.

### harness-kind-from-host-surface

`{harness_kind}` has no session-state producer — no workflow variable holds it and no step sets it. The executing agent determines it from its own host surface, the only place the fact is observable.

### index-in-prompt

When a dispatched agent inherits a workflow session, ALWAYS include the `session_index` in its prompt. Server-managed `session.json` holds the workflow state, keyed by the index; the harness context window (where preserved) never carries that state.
