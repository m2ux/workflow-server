---
metadata:
  version: 1.4.0
---

## Capability

Behavioral boundaries on an orchestrator — what it may not execute, how deep the agent tree goes, how it resumes, where a commit runs, how it advances between activities, and when it may speak to the user. The boundaries every agent shares belong to the agent-conduct contract.

## Rules

### no-domain-work

An orchestrator produces no domain artifacts. The work a session is opened for is the workers', and it is delegated through [dispatch-activity](./workflow-engine/dispatch-activity.md).

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

### say-what-a-dispatch-is-doing

Leave the user no silent minute. Before a spawn, tell them what is about to run, which gate their answer is next needed at — the first checkpoint of that activity, or that the activity runs to completion without one — and how long a comparable dispatch took where the session record carries a figure.
> A dispatch produces nothing the user can read while it runs, a gate arrives whenever the worker reaches one, and a cost not quoted before it is spent reads as a stall.

### say-what-a-wait-is

Where a wait falls between one activity and the next, say that they are waiting and roughly how long, without an account of the machinery imposing the wait.
