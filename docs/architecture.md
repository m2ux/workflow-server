# System Architecture Overview

The Workflow Server drives AI agents through long, multi-step engineering tasks. Three things make that hard: the task is often ambiguous, it runs for longer than any one agent's context lasts, and an agent that loses its place can do real damage to a codebase. The architecture is split into six models, each answering one of those pressures, and each documented on its own page.

Work is handed down [a chain of agents](dispatch-model.md) rather than done by one. A user-facing agent picks the workflow and talks to the person; a background orchestrator tracks where the run has got to; and a worker executes one activity at a time and then reports. Splitting them this way keeps each context small, and it means a worker that runs out of room can be replaced without the run losing its place.

Because a worker runs in the background with no channel to the user, it cannot ask a question when it hits one. [Checkpoints](checkpoint-model.md) are how it stops and gets an answer anyway: the pause is recorded in the session, travels up the chain to the agent that can ask, and the answer travels back down.

What happens next is never left to the model's judgement. [Transitions are deterministic](state-management-model.md): an activity names the outcome it reached by evaluating declared predicates against a bag of declared variables, and the workflow file says where each outcome leads, so the same definition and the same state always take the same path. That page also covers how variables get their initial values and the two paths by which they change.

Planning and code are kept strictly apart. [Workspace isolation](artifact-management-model.md) covers the boundary: session state, plans and artifacts live under an engineering root, feature worktrees live under the checkout, and the two are committed independently. It also covers how artifacts are named and how the planning folder is laid out.

Loading a whole workflow's instructions into an agent at once degrades it. [Techniques and resources are resolved lazily](resource-resolution-model.md) instead: a technique is a markdown definition of one capability, activities reference techniques by a `::` path, and the server composes and delivers only what the current step needs. The same page covers reference delivery, which lets an agent that already holds a payload be sent a marker instead of the bytes.

Finally, an autonomous agent's claim to have followed the workflow has to be checkable. [Workflow fidelity](workflow-fidelity.md) describes the seven layers that make it so — the seal over session state, the checkpoint gate, four advisory validations, and the trace.

## Where else to look

The tool catalogue is in the [API reference](api-reference.md), with the generated [wire contracts](../site/api/tools.html) giving each parameter schema. For build commands, the test suite and the corpus guards, start with the [development guide](development.md).
