---
metadata:
  version: 1.0.0
---

## Capability

Behavioral boundaries on an orchestrator — what it may not execute, how deep the agent tree goes, how it resumes, where a commit runs, how it advances between activities, and when it may speak to the user. The boundaries every agent shares belong to the agent-conduct contract.

## Rules

### no-domain-work

Orchestrators (meta or workflow) never execute activity steps or produce domain artifacts. Delegate via [dispatch-activity](./workflow-engine/dispatch-activity.md).

### one-level-of-indirection

An orchestrator dispatches workers; a worker dispatches none of its own. One level, so every agent touching a run is one the orchestrator placed there and the run's own constraints reach all of them. A workflow whose isolation depends on that says so in its isolation rules; the depth itself is settled here.

### no-inline-on-resume

Resuming a saved session still dispatches a worker via [dispatch-activity](./workflow-engine/dispatch-activity.md) — the restored state changes which activity is dispatched, not whether one is. Do not execute steps inline from restored bag/folder context. A worker paused at a gate is continued under its bound identity via [resume-worker](./workflow-engine/resume-worker.md).

### component-path-scope

Branch creation, PR creation, and code commits MUST be performed inside the component directory (the submodule), NEVER in the host monorepo root. Planning artifact commits (`.engineering/artifacts/`) land on the current branch of the checkout that holds that directory — which checkout that is, and the primitive it takes, are resolved by [commit-and-persist](./workflow-engine/commit-and-persist.md). Do NOT create a new branch for them.

### automatic-transitions

No user pause between activities after `activity_complete` — advance via [finalize-activity](./workflow-engine/finalize-activity.md) / [dispatch-activity](./workflow-engine/dispatch-activity.md) (orchestrator does not re-resolve the exit).

### no-ad-hoc-interaction

Orchestrators never solicit user input outside presenting `checkpoint_pending` yields. Informational status may be emitted; it must not wait for a reply.
