# Artifact Management

An agent working a task produces two kinds of output. One is the change to the code. The other is the notes it keeps while deciding that change: plans, reviews, and the record of the run. Those notes stay out of the code's history.

Where the two are stored, and how the notes are committed, is [project layout](https://github.com/m2ux/workflow-server/blob/workspace/docs/layout.md) on the workspace branch. How the server is pointed at the directories it reads is [root binding](configuration.md#root-binding).

## The planning folder

A session is one run of a workflow. It opens one planning folder, and that folder holds everything the run writes down. The path is in [project layout](https://github.com/m2ux/workflow-server/blob/workspace/docs/layout.md#a-sessions-notes). `PLANNING_SLUG` overrides the `artifacts/planning` segment.

The folder holds a `README.md` a person can open to see what the work is and how far it has got. The server writes `session.json` and `.session-token` beside it. Those two files, and what the seal proves, are in [state management](state-management-model.md#the-two-files). The history of tool calls lives in `session.json`. How that history is recorded and read back is in [workflow fidelity](workflow-fidelity.md). Documents an activity produces are written in this folder and nowhere else.

The `README.md` carries a Progress table. The orchestrator, the agent that tracks the run, marks a row in progress before it hands the activity to a worker, and complete once that activity's work is committed. The worker reports the documents it produced. It does not edit the table. The table still advances when a worker is lost and replaced.

## How documents are named

An activity is one phase of a workflow, stored as a file such as `02-analyse-sources.yaml`. The leading digits are a prefix the server reads from that filename. A worker puts the prefix in front of each document it writes, so the analysis lands as `02-analyse-sources.md`. Sorting the folder by name sorts it by activity, and two activities do not share a filename.

The server also tells the worker which documents the activity is expected to produce. It builds that list from the outputs of the techniques the activity's steps use. Each entry names the output and the filename. The activity file does not carry the list.
