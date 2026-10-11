# Workflow Engine

> Part of [techniques](../README.md)

Contract and rules for executing a workflow's structured flow — sessions, activities, agents, Progress, and checkpoints.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`activity-worker`](activity-worker.md) | Worker for a dispatched activity — executes bound steps, yields checkpoints, and walks on to the next activity while its batch has room |
| [`commit-and-persist`](commit-and-persist.md) | Post-activity Progress mark plus commit/push of source-side changes and engineering artifacts |
| [`compose-prompt`](compose-prompt.md) | Compose a minimal stub that binds agent identity and directs the agent to Apply a bundled workflow-engine agent technique |
| [`continue-batch`](continue-batch.md) | Advance the session to the next activity and continue the worker already carrying the batch, under the delivery identity its dispatch bound |
| [`create-readme`](create-readme.md) | Planning-folder `README.md` from the universal planning Template under the bound readme-seed profile |
| [`create-session`](create-session.md) | Fresh client workflow session embedded under the current meta session |
| [`derive-planning-slug`](derive-planning-slug.md) | The canonical planning slug for a work package — today's date plus its kebab-case initiative name — composed and returned without touching the filesystem |
| [`dispatch-activity`](dispatch-activity.md) | Transition the session to a target activity and spawn a worker to carry it, and the bounded run of activities behind it |
| [`evaluate-transition`](evaluate-transition.md) | Name the outcome the just-completed activity reached, and read where the workflow sends it |
| [`finalize-activity`](finalize-activity.md) | Compile the `activity_complete` result after all steps, checkpoints, and artifacts are done |
| [`generate-summary`](generate-summary.md) | Compose the markdown session summary presented at workflow close |
| [`handle-sub-workflow`](handle-sub-workflow.md) | Launch a workflow as a child of the current session, and report where it opens and where it writes |
| [`list-workflows`](list-workflows.md) | Retrieve the catalog of available workflows |
| [`present-checkpoint-to-user`](present-checkpoint-to-user.md) | Load the active checkpoint's details and present them to the user |
| [`read-session`](read-session.md) | The live session record — its variable bag and its execution trace — for a consumer that reasons over what the session has actually done |
| [`respond-checkpoint`](respond-checkpoint.md) | Send the user's selection back to the server, clearing the active checkpoint |
| [`resume-from-checkpoint`](resume-from-checkpoint.md) | Continue execution after the orchestrator resolves a checkpoint |
| [`resume-worker`](resume-worker.md) | Continue the worker that already holds an activity under the delivery identity its dispatch bound, or replace it where that context is gone |
| [`revise-session-metrics`](revise-session-metrics.md) | Rewrite the client planning folder's session-trace and token-usage artifacts from the full client session ledger after that workflow has finished — including the terminal activity's own… |
| [`start-session`](start-session.md) | The top-level workflow session: its index and binding, and either the embedded client or an opening decision |
| [`sync-progress-status`](sync-progress-status.md) | Orchestrator-owned Progress **status** writer for selected activity (and optional item) rows in the planning-folder README |
| [`take-activity`](take-activity.md) | Advance a session this context owns onto an activity and carry that activity here, under the technique a dispatched worker would have carried it under |
| [`verify-outcomes`](verify-outcomes.md) | Compare a workflow's declared `outcomes` against state and identify gaps |
| [`verify-readme-conforms`](verify-readme-conforms.md) | Conformance check that the planning-folder `README.md` matches the universal planning Template (and seed-declared append H2s) |
| [`workflow-orchestrator`](workflow-orchestrator.md) | Orchestrator agent for a client workflow — owns the activity loop, checkpoint bubbling, and post-activity persistence |
| [`yield-checkpoint`](yield-checkpoint.md) | Pause at a checkpoint and surface the yield — or continue immediately when the server replays a recorded response |
