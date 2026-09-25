# System architecture overview

The Workflow Server drives AI agents through long, multi-step engineering tasks. Three things make that hard: the task is often ambiguous, it runs for longer than any one agent's context lasts, and an agent that loses its place can do real damage to a codebase.

The architecture answers those pressures through a set of models, one per page. Each section below names the pressure and the page that answers it.

## Work is handed down a chain of agents

[Dispatch](dispatch.md). A user-facing agent picks the workflow and talks to the person; a background orchestrator tracks where the run has got to; and a worker executes one activity at a time and then reports.

Splitting them keeps each context small, and it means a worker that runs out of room can be replaced without the run losing its place.

## A background agent still has to ask

[Checkpoints](checkpoint.md). A worker runs with no channel to the user, so it cannot ask a question when it hits one.

A checkpoint is how it stops and gets an answer anyway: the pause is recorded in the session, travels up the chain to the agent that can ask, and the answer travels back down.

## What happens next is not the model's judgement

[State management](state.md). An activity names the outcome it reached by evaluating declared predicates against a bag of declared variables, and the workflow file says where each outcome leads. The same definition and the same state therefore always take the same path.

That page also covers how variables get their initial values, and the two routes by which they change.

## Planning and code stay apart

Session notes stay out of the code change. A session opens one planning folder for them. Where that folder sits is the workspace [project layout](https://github.com/m2ux/workflow-server/blob/workspace/docs/layout.md). What the folder holds, including the progress table, is [state management](state.md#the-planning-folder). How each document in it is named is [the worker bundle](delivery.md#how-documents-are-named).

## Instructions arrive one piece at a time

Loading a whole workflow's instructions into an agent at once degrades it, so behaviour is broken into techniques and handed over as the run needs them. That takes two pages.

[Resolution](resource-resolution.md) covers how a name reaches a file: a technique is a markdown definition of one capability, and activities reference techniques by a `::` path.

[Delivery](delivery.md) covers what then travels — how a role's contract is assembled, the budgets that bound it, and reference delivery, which sends a marker to an agent already holding the bytes.

## A claim to have followed the workflow is checkable

[Workflow fidelity](workflow-fidelity.md). Seven layers make it so: the seal over session state, the checkpoint gate, four advisory validations, and the trace.

## Where else to look

| For | Read |
|-----|------|
| The tool catalogue | [API reference](api-reference.md), with [generated wire contracts](../site/api/tools.html) |
| Build commands and the test suite | [Development guide](development.md) |
| The corpus guards | [`guards/README.md`](../guards/README.md) |
| Routing by what you are doing | [Documentation index](README.md) |
