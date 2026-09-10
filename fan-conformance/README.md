# Fan Conformance Workflow

> Part of the [workflow corpus](../README.md)

Runs every form of graph fan against a real checkout and reports what happened: one worker per branch, each with an identity and a container slot of its own, entering the activity they converge on once. It exists because the routing is the only thing under test — the surveys the branches run are cheap on purpose, so the run's cost is the routing's cost and the evidence is about the routing.

## The grammar a destination is written in

An exit's destination is one of four things, and this workflow runs each of them:

| Destination | What it opens | Where |
|-------------|---------------|-------|
| An activity id | One branch, no fan | `survey-files.surveyed`, and most exits here |
| `__terminal__` | The end of the run | `report-conformance.reported` |
| A list of members, each an id **or** an instance fan | Every member's branches, flattened into one set | `plan-conformance.planned` |
| One activity with a collection to run it over | One branch per element | `choose-probes.chosen`, `open-notes.opened` |

A list member is never itself a list, so a barrier inside a barrier cannot be written down rather than being refused when it is.

## Stage one — a list that names activities and fans over a collection

```
plan-conformance ─┬─ survey-files ────┐
                  ├─ survey-history ──┤
                  ├─ survey-tree#0 ───┼─ choose-probes
                  └─ survey-tree#1 ───┘
```

```yaml
planned:
  - survey-files
  - survey-history
  - activity: survey-tree
    over: survey_plan.roots
    variable: survey_root
    maxInstances: 2
```

One destination, three members, four branches. Two members name an activity directly; the third names an activity and a collection, and contributes one branch per element. All four converge on `choose-probes` when the last of them returns — the flattening is what makes them one fan rather than two.

Four things are worth reading off that block:

- **The members answer to one bound.** The server's ceiling counts branches after flattening, so the two plain members and the fanned member spend the same budget. `maxInstances: 2` is declared for that reason: it sits tighter than the server's ceiling so the whole destination fits inside it. A member's own bound can only ever narrow the server's, never widen it.
- **The collection is reached at a path.** `over` takes a name or a dotted path into a named value, and `survey_plan.roots` is the second. The variable that must exist is the head of the path, `survey_plan`.
- **The elements are plain strings.** An element is a slug string or an object carrying a string `id`; the other two fans here use objects, and this one uses strings. Either way the element's id names its container slot, its row in the gather manifest, and its artifact filename.
- **The fan is seeded by the call that opens it.** `plan-conformance` writes `survey_plan` and its own exit fans over it. The collection is read from the bag as the fan is entered, including what that same call just wrote, so a source can supply the collection it fans over.

Each member gets a container of its own, and they differ in shape: `survey_files_outputs` and `survey_history_outputs` hold a single slot each, `survey_tree_outputs` holds one per root. `choose-probes` reads all three the same way, which is the point — a convergence does not need to know which member produced what it is reading.

## Stage two — one activity over a collection

```
choose-probes ─┬─ probe-directory#0 ─┐
               ├─ probe-directory#1 ─┼─ open-notes
               └─ probe-directory#2 ─┘
```

The destination names one activity and the collection `choose-probes` produced. The run opens one instance per entry, each handed its own entry at `probe_target`, and they converge when the last returns. The width is the collection's length — `probe_budget`, settled before any survey runs.

The meeting point of the first fan is the source of the second. That is legal and deliberate: a fan may not converge on the activity whose exit opens it, but nothing stops a convergence from opening a fan of its own.

## Stage three — instances that commit in checkouts of their own

```
open-notes ─┬─ note-probe#0 ─┐
            ├─ note-probe#1 ─┼─ merge-notes ─┐
            └─ note-probe#n ─┘               ├─ report-conformance
            └─ (nothing-to-note) ────────────┘
```

Branches of a fan share one working tree, so an activity that commits is refused unless it takes a checkout of its own. `note-probe` binds `version-control::create-worktree` as its first step, and that binding is what admits the commit operations after it — the claim and the thing claimed are one artifact, so there is nothing to declare and nothing to take on trust.

Each writer materialises a checkout named for its own designator, writes its note there, commits on a branch of its own and reports that branch. `merge-notes` brings in the branches the container names.

`open-notes` has two exits because a fan of no instances is refused when it opens: the activity the branches converge on would otherwise be entered with an activity the graph says runs having never run. Where no probe finds anything worth committing, `has_notes` is false and `nothing-to-note` routes the run straight to the report. **A graph that fans over a collection that may be empty says what happens when it is.**

## What a run leaves behind

One document, `fan-conformance-report.md`, shaped by [conformance-report](resources/conformance-report.md#template). It answers one question in several sections:

- **Identity** — did each slot report back the designator its unit was handed? A disagreement means a branch was served a sibling's element, and it is printed as a disagreement rather than reconciled.
- **Overlap** — did the branches of each fan run at the same time? Every instant comes from a branch's own record, because the activity writing the report was not running while they were. Overlapping intervals are a batch; abutting ones are a queue, which is a correct result the report states plainly.
- **Isolation** — did each writer commit on a branch of its own, and did those branches merge?
- **What the record did not expect** — empty slots, missing intervals, a branch that started before the run did.

## Activities

| # | Activity | Role in the flow |
|---|----------|------------------|
| [01](activities/01-plan-conformance.yaml) | Plan Conformance | Fixes the instant every branch's interval is read against, names the survey roots, settles the probe width |
| [02](activities/02-survey-files.yaml) | Survey Files | A member the first destination names directly — counts files by extension, ranks directories by size |
| [03](activities/03-survey-history.yaml) | Survey History | The other named member — summarises recent commits and the directories they touched |
| [04](activities/04-choose-probes.yaml) | Choose Probes | Where the first fan converges and the second opens: reads all three containers, picks the directories to probe |
| [05](activities/05-probe-directory.yaml) | Probe Directory | One instance per picked directory, each describing only its own |
| [06](activities/06-survey-tree.yaml) | Survey Tree | The fanned member of the first destination — one instance per root, each walking only the root it was handed |
| [07](activities/07-open-notes.yaml) | Open Notes | Chooses which findings are worth committing, and routes past the writers when none are |
| [08](activities/08-note-probe.yaml) | Note Probe | One writer per note, each in a checkout of its own, committing on a branch of its own |
| [09](activities/09-merge-notes.yaml) | Merge Notes | Where the writers converge — merges the branches the container names |
| [10](activities/10-report-conformance.yaml) | Report Conformance | Where the run converges: reads every container whole and writes the report |

## Where a branch's outputs land

No meeting point names a slot. Each reads the container whole — `survey_files_outputs`, `survey_history_outputs`, `survey_tree_outputs`, `probe_directory_outputs`, `note_probe_outputs` — and the container's own order carries the correspondence. The width is a run-time value no authored index could be checked against, which is why an index is never written down.

A container's name is its activity's id with dashes as underscores and `_outputs` appended, so `survey-tree` lands in `survey_tree_outputs`. That holds whether the activity was named directly or fanned, and whether it opened one branch or several.

## Running it

The first destination opens four branches and the second opens `probe_budget`, three by default. The server refuses a destination wider than its own ceiling at the moment the fan opens, so a run wanting more raises `FAN_MAX_BRANCHES` as well as the budget it is changing.
