# Fan Conformance Workflow

> Part of the [workflow corpus](../README.md)

Runs every form of graph fan against a real checkout and reports what happened: one worker per branch, each with an identity and a container slot of its own, entering the activity they converge on once. A session supplies it a planning folder to report into and the component to survey; everything else the run produces. The surveys the branches perform are cheap on purpose, so the run's cost is the routing's cost and the evidence is about the routing.

It serves two readers. One wants to know whether this server's fanning works, and takes that from the report a run leaves behind. The other is writing a fan of their own and wants a worked example of each shape one can take — so every part of the grammar below is reached somewhere in [the graph](workflow.yaml), for a reason that stage would have anyway rather than as a demonstration.

## The grammar a destination is written in

An exit's destination takes three written forms, and one reserved id ends the run:

| Destination | What it opens | Reached in |
|-------------|---------------|------------|
| An activity id | One branch, no fan | Most exits here |
| A list of members, each an id **or** an instance fan | Every member's branches, flattened into one set | Stage one |
| One activity with a collection to run it over | One branch per element | Stages two and three |
| `__terminal__` | Nothing — the run ends | The report's exit |

`__terminal__` is a reserved activity id rather than a form of its own, which is why a destination is a string, a list, or an instance fan and nothing else.

A list member is never itself a list, so a barrier inside a barrier cannot be written down rather than being refused when it is.

## Stage one — a list that names activities and fans over a collection

```
plan-conformance ─┬─ survey-files ────┐
                  ├─ survey-history ──┤
                  ├─ survey-tree#0 ───┼─ choose-probes
                  └─ survey-tree#1 ───┘
```

One destination, mixed: it names two activities directly and names a third with a collection to run it over. Each named member opens one branch, the fanned member opens one per element, and they all converge on `choose-probes` when the last of them returns. The flattening is what makes them one fan rather than two.

Four things this stage is the corpus's only example of:

- **The members answer to one bound.** The server's ceiling counts branches after every member is flattened, so the named members and the fanned member spend the same budget. That is why the fanned member declares an instance cap: it holds itself to a width that leaves room for its siblings, whatever the plan puts in the collection. A member's own cap can only ever narrow the server's ceiling, never widen it.
- **The collection is reached at a path.** A fan's `over` takes a variable's name or a dotted path into a named value, and this one takes the path. The variable that has to exist is the head of that path, which is what the load checks and what an activity has to write.
- **The elements are plain strings.** An element is a slug string or an object carrying a string `id`; the other two fans here use objects and this one uses strings. Either way the element's id names its container slot, its row in the gather manifest, and its artifact filename.
- **The fan is seeded by the call that opens it.** The activity whose exit opens this destination is also the one that writes the collection it fans over. The collection is read from the variable bag as the fan is entered, including what that same call just wrote, so a source can supply the collection it fans over.

Each member gets a container of its own, and they differ in shape: a named member's holds a single slot, the fanned member's holds one per element. The convergence reads them all the same way, which is the point — it does not need to know which member produced what it is reading.

## Stage two — one activity over a collection

```
choose-probes ─┬─ probe-directory#0 ─┐
               ├─ probe-directory#1 ─┼─ open-notes
               └─ probe-directory#2 ─┘
```

The destination names one activity and the collection the previous stage produced. The run opens one instance per entry, each handed its own entry, and they converge when the last returns. The width is that collection's length, and the run settles it before anything is surveyed so the width is a decision rather than a consequence of the component it was pointed at.

The meeting point of the first fan is the source of the second. That is legal and deliberate: a fan may not converge on the activity whose exit opens it — it would open again on every convergence and the graph would give it no way to finish — but nothing stops a convergence from opening a fan of its own.

## Stage three — instances that commit in checkouts of their own

```
             opened          ┌─ note-probe#0 ─┐
open-notes ──────────────────┼─ note-probe#1 ─┼─ merge-notes ──┐
     │                       └─ note-probe#n ─┘                │
     └───────────────────────────────────────────────────── report-conformance
             nothing-to-note
```

Branches of a fan share one working tree and one git index, and a commit derives its paths from that tree's status — so no instance could stage or attribute its own change, and the load refuses a fanned activity that commits. The exception is evidence rather than assertion: an activity that materialises its own checkout binds `version-control::create-worktree`, the load looks for that binding, and finding it admits the commit operations. The claim and the thing claimed are one artifact, so there is nothing to declare and nothing to take on trust.

Each writer materialises a checkout keyed to its own designator, writes its note there, commits on a branch of its own and reports that branch. The activity they converge on merges the branches the container names, and accounts for a branch that held nothing as an outcome rather than a gap.

A fan of no instances is refused when it opens: the activity the branches converge on would be entered with an activity the graph says runs having never run. So where no probe finds anything worth committing, a predicate on the source's exit routes the run past the writers entirely. **A graph that fans over a collection that may be empty says what happens when it is.**

## What a run leaves behind

One document, shaped by [conformance-report](resources/conformance-report.md#template). It answers one question in several sections:

- **Identity** — did each slot report back the designator its unit was handed? A disagreement means a branch was served a sibling's element, and it is printed as a disagreement rather than reconciled.
- **Overlap** — did the branches of each fan run at the same time? Every instant comes from a branch's own record, because the activity writing the report was not running while they were. Overlapping intervals are a batch; abutting ones are a queue, which is a correct result the report states plainly.
- **Forms reached** — which parts of the grammar this run actually opened, including the parts it did not, since a route past a stage leaves the forms that stage carries unreached.
- **Isolation** — did each writer commit on a branch of its own, and did those branches merge?
- **What the record did not expect** — empty slots, missing intervals, a branch that started before the run did.

## Activities

| # | Activity | Role in the flow |
|---|----------|------------------|
| [01](activities/01-plan-conformance.yaml) | Plan Conformance | Fixes the instant every branch's interval is read against, names the survey roots, settles the probe width |
| [02](activities/02-survey-files.yaml) | Survey Files | A member the first destination names directly — counts files by extension, ranks directories by size |
| [03](activities/03-survey-history.yaml) | Survey History | The other named member — summarises recent commits and the directories they touched |
| [04](activities/04-choose-probes.yaml) | Choose Probes | Where the first fan converges and the second opens: reads every container, picks the directories to probe |
| [05](activities/05-probe-directory.yaml) | Probe Directory | One instance per picked directory, each describing only its own |
| [06](activities/06-survey-tree.yaml) | Survey Tree | The fanned member of the first destination — one instance per root, each walking only the root it was handed |
| [07](activities/07-open-notes.yaml) | Open Notes | Chooses which findings are worth committing, and routes past the writers when none are |
| [08](activities/08-note-probe.yaml) | Note Probe | One writer per note, each in a checkout of its own, committing on a branch of its own |
| [09](activities/09-merge-notes.yaml) | Merge Notes | Where the writers converge — merges the branches the container names |
| [10](activities/10-report-conformance.yaml) | Report Conformance | Where the run converges: reads every container whole and writes the report |

## Where a branch's outputs land

No meeting point names a slot. Each reads its containers whole, and a container's own order carries the correspondence — the width is a run-time value no authored index could be checked against, which is why an index is never written down.

A container's name is its activity's id with dashes as underscores and `_outputs` appended. That holds whether the activity was named directly or fanned, and whether it opened one branch or several, so a convergence reads one form regardless of the shape of the fan that filled it.

## Running it

Every fan here is sized to fit inside the server's default ceiling, and each is sized by something different: one by a cap declared on the member, one by a width the run settles before it surveys anything, and one by how many findings turned out to be worth committing. The server refuses a destination wider than its ceiling at the moment the fan opens and names the bound that refused it, so widening a fan means raising the server's ceiling too — and each extra branch costs a whole further delivery of its activity.

The run writes nothing outside its planning folder until the note writers, and each of those works in a checkout of its own on a branch of its own.
