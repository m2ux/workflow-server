# Meta Workflow Activities

> Part of the [Meta Workflow](../README.md)

Lifecycle activities that run inside the meta session when the agent remains on meta after `start_session` has opened the client. Unique catalog matches walk the child from [bootstrap](../resources/bootstrap-protocol.md). Each activity's role and place in the sequence is indexed in the [Meta Workflow README](../README.md).

Borrowable mid-phase orchestration pattern activities live under [`patterns/`](./patterns/README.md) and are **not** part of this lifecycle list.

The authoritative definition of each activity — its steps, technique bindings, checkpoints, loop, transitions, and outcomes — lives in the linked `.yaml` file and is served by `get_activity`. The entries below are orientation only.

---

### 03. Dispatch Client Workflow

Drives the already-open client workflow end to end inline via [`03-dispatch-client-workflow.yaml`](./03-dispatch-client-workflow.yaml) (dispatch → present/respond on yield → commit-and-persist → advance → continue that same worker while its batch has room and the next destination is one activity). `client_session_index` and `client_initial_activity` come from `start_session`. A destination that fans ends that identity: the source commits, the worker is released, and [dispatch-fan](../techniques/workflow-engine/dispatch-fan.md) opens the branches. Each worker carries a bounded run of activities, so a fresh context is established once a run rather than once an activity; the bound is the server's, enforced at delivery ([batch-is-bounded-by-the-server](../techniques/workflow-engine/dispatch-activity.md#batch-is-bounded-by-the-server)). Role and auth boundaries: [agent-conduct](../techniques/agent-conduct.md) + [dispatch-activity](../techniques/workflow-engine/dispatch-activity.md). Leads to [End Workflow](#04-end-workflow) when the client workflow is exhausted.

Definition: [`03-dispatch-client-workflow.yaml`](./03-dispatch-client-workflow.yaml)

---

### 04. End Workflow

Closes out the client workflow: it verifies the client workflow's outcomes against final state, generates a session summary, and surfaces a completion checkpoint. The outcomes come from a list the client workflow seeded, or from what its own activities reported as they completed. Final state is already durably persisted by the server on every authenticated call, so no agent-side persist step is needed. If outcomes are unmet, the user can return to [Dispatch Client Workflow](#03-dispatch-client-workflow); otherwise the session is closed.

Definition: [`04-end-workflow.yaml`](./04-end-workflow.yaml)
