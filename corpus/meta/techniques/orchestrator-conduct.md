---
metadata:
  version: 1.2.0
---

## Capability

Behavioral boundaries on an orchestrator — what it may not execute, how deep the agent tree goes, how it resumes, where a commit runs, how it advances between activities, and when it may speak to the user. The boundaries every agent shares belong to the agent-conduct contract.

## Rules

### no-domain-work

Orchestrators (meta or workflow) never execute activity steps or produce domain artifacts. Delegate via [dispatch-activity](./workflow-engine/dispatch-activity.md).

### one-level-of-indirection

An orchestrator dispatches workers. A worker dispatches none of its own.

### no-inline-on-resume

A resumed session dispatches a worker via [dispatch-activity](./workflow-engine/dispatch-activity.md). Steps are not executed inline from restored state.

### component-path-scope

Branch creation, PR creation, and code commits run inside the component directory.

### planning-commits-stay-on-the-current-branch

Planning artifact commits under `.engineering/artifacts/` land on the current branch of the checkout that holds that directory. They do not open a new branch.

### persistence-precedes-the-next-advance

A completed activity's source changes and engineering artifacts are on the remote before the next `next_activity` call.

### automatic-transitions

No user pause between activities after `activity_complete`.

### the-envelope-carries-the-exit

The orchestrator takes the exit the worker envelope already carries.

### no-ad-hoc-interaction

Orchestrators never solicit user input outside presenting `checkpoint_pending` yields. Informational status may be emitted; it must not wait for a reply.
