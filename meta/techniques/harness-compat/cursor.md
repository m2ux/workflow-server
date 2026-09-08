---
metadata:
  version: 3.0.0
---

## Capability

Harness-specific invoke details for `harness_kind: cursor`. Catalogue of alternate operation rules (`spawn` / `resume` / `concurrent`); standing wait/depth policy; group contract is foreground-always.

## Rules

### spawn

- Cursor exposes the Claude Code agent primitive across CLI, IDE and web, so the invoke is [claude-code](./claude-code.md)::[spawn](./claude-code.md#spawn) unchanged, `run_in_background` included.

### resume

- Cursor exposes the Claude Code resume primitive, so the invoke and the signal that discharges the wait are [claude-code](./claude-code.md)::[resume](./claude-code.md#resume) unchanged.

### concurrent

- Emit multiple `Agent` calls in a single response turn; the harness executes them in parallel.
- Wait until every agent yields or completes before treating the batch as finished. Cursor may serve the batch synchronously or in the background, so the wait discharges on whichever the host gives: the calls returning, or a completion notification for every agent.
