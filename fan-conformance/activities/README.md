# Fan Conformance Activities

> Part of the [Fan Conformance Workflow](../README.md)

The activities that carry a run from a fixed baseline through three fans to one report. Most of them exist to be a branch or to be the place branches converge, because the routing is what the run is evidence about.

This file is an orientation map to the roles those two positions impose. The authoritative definition of each activity — its steps, exits, technique bindings and transitions — lives in the per-activity YAML linked below and is served by `get_activity`. The shape of the graph they are wired into lives in [`workflow.yaml`](../workflow.yaml), and the [workflow README](../README.md) walks it stage by stage.

---

## Who is a branch and who is a meeting point

| # | Activity | Position | What that position requires of it |
|---|----------|----------|-----------------------------------|
| [01](01-plan-conformance.yaml) | Plan Conformance | Source of the first fan | Writes the collection its own exit fans over, and fixes the baseline every branch's interval is read against |
| [02](02-survey-files.yaml) | Survey Files | Branch, named directly | Records its own interval; reads nothing a sibling wrote |
| [03](03-survey-history.yaml) | Survey History | Branch, named directly | The same, over history rather than files |
| [06](06-survey-tree.yaml) | Survey Tree | Branch, one instance per element | Reads only the element it was handed, and reports that element back so a mismatch is visible |
| [04](04-choose-probes.yaml) | Choose Probes | Meeting point, and source of the next fan | Reads every container whole; produces the collection the next fan runs over |
| [05](05-probe-directory.yaml) | Probe Directory | Branch, one instance per element | Describes only its own directory, and reports its designator back |
| [07](07-open-notes.yaml) | Open Notes | Meeting point, and source of the last fan | Chooses what is worth committing, and carries the predicate that routes past the writers when nothing is |
| [08](08-note-probe.yaml) | Note Probe | Branch, isolated | Takes a checkout of its own before it commits, and reports the branch it landed on |
| [09](09-merge-notes.yaml) | Merge Notes | Meeting point | Accounts for every branch the container names, including one that held nothing |
| [10](10-report-conformance.yaml) | Report Conformance | Meeting point, terminal | Reads every container whole and writes the one document the run leaves behind |

## What a branch owes the run

A branch cannot see its siblings, so everything the report needs about it has to come out of its own output. That makes two obligations structural rather than stylistic: it records the instants it started and finished, and it reports back the designator it was handed. The first is what lets a reader tell a batch from a queue; the second is the only evidence that a branch was served its own element rather than a sibling's.

Branches that commit owe one more thing. They share a working tree with their siblings, so an activity that commits takes a checkout of its own first — and the load reads that from what the activity binds rather than from anything it declares.

## What a meeting point owes the run

A meeting point never names a slot. It reads its containers whole and lets their order carry the correspondence, because the width of a fan is a run-time value no authored index could be checked against. An empty slot is a branch that did not report, and it stays in the account as an empty row rather than being dropped.

Choose Probes and Open Notes are each a meeting point and a fan source at once. That is legal — a fan may not converge on the activity whose exit opens it, but nothing stops a convergence from opening a fan of its own.
