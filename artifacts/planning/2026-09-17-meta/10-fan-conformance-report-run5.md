# Fan Conformance Report

> `.` · 2026-09-17T12:43:59Z

## What ran

| Fan | Form | Branches opened | Slots filled |
|-----|------|-----------------|--------------|
| plan-conformance.planned | a list naming two activities and fanning a third over a collection | 4 | 4 |
| choose-probes.chosen | one activity per element | 3 | 3 |
| open-notes.opened | one activity per element, each in a checkout of its own | 2 | 2 |

## Forms the run exercised

| Form | Where | Reached |
|------|-------|---------|
| A list member written as a bare activity id | plan-conformance.planned | yes |
| A list mixing bare ids with an instance fan | plan-conformance.planned | yes |
| One activity over a collection | choose-probes.chosen | yes |
| A member bounded by its own `maxInstances` | plan-conformance.planned | yes — bound 2, width 2 |
| A collection reached at a dotted path | plan-conformance.planned | yes — `survey_plan.roots` |
| Elements that are plain strings | plan-conformance.planned | yes — `src`, `tests` |
| Elements that are objects carrying an `id` | choose-probes.chosen, open-notes.opened | yes |
| A fan seeded by the call that enters it | plan-conformance.planned | yes |
| A convergence that opens a fan of its own | choose-probes | yes |
| An exit routing past a fan whose collection is empty | open-notes.nothing-to-note | no |
| Instances committing in checkouts of their own | open-notes.opened | yes |

## Identity

| Fan | Unit id | Designator the slot reports | Agree |
|-----|---------|-----------------------------|-------|
| plan-conformance.planned | src | src | yes |
| plan-conformance.planned | tests | tests | yes |
| plan-conformance.planned | survey-files | survey-files | yes |
| plan-conformance.planned | survey-history | survey-history | yes |
| choose-probes.chosen | P1 | P1 | yes |
| choose-probes.chosen | P2 | P2 | yes |
| choose-probes.chosen | P3 | P3 | yes |
| open-notes.opened | N1 | fan-note-N1 | yes |
| open-notes.opened | N2 | fan-note-N2 | yes |

Every slot carried the designator its unit was handed, read by container position.

This run is also the first where every branch was addressable from the advance that opened it. Each call reported its outstanding branches by the id that names them — `survey-tree#0` and `survey-tree#1` distinctly, not two copies of `Survey Tree` — so no step of this walk had to reconstruct a branch id from a display name or read it out of session state.

## Overlap

| Fan | Branch | Started | Finished | Duration |
|-----|--------|---------|----------|----------|
| plan-conformance.planned | survey-tree#0 (src) | 12:44:16Z | 12:44:29Z | 13s |
| plan-conformance.planned | survey-tree#1 (tests) | 12:44:21Z | 12:44:36Z | 15s |
| plan-conformance.planned | survey-files | 12:44:26Z | 12:44:53Z | 27s |
| plan-conformance.planned | survey-history | 12:44:30Z | 12:44:56Z | 26s |
| choose-probes.chosen | probe-directory#0 (P1) | 12:45:48Z | 12:45:58Z | 10s |
| choose-probes.chosen | probe-directory#1 (P2) | 12:45:53Z | 12:46:07Z | 14s |
| choose-probes.chosen | probe-directory#2 (P3) | 12:45:58Z | 12:46:10Z | 12s |
| open-notes.opened | note-probe#0 (N1) | 12:46:49Z | 12:47:45Z | 56s |
| open-notes.opened | note-probe#1 (N2) | 12:46:55Z | 12:48:03Z | 68s |

| Fan | Wall clock | Sum of branch durations | Difference |
|-----|------------|-------------------------|------------|
| plan-conformance.planned | 40s | 81s | 41s |
| choose-probes.chosen | 22s | 36s | 14s |
| open-notes.opened | 74s | 124s | 50s |

**Reading:** every fan is a batch. The last branch of each started before the first had finished — `survey-history` at 12:44:30 with three siblings running, `probe-directory#2` at 12:45:58 with both siblings running, `note-probe#1` at 12:46:55 with its sibling running. No fan shows intervals abutting end-to-start.

For the mixed destination, the two kinds overlap each other as well. The bare members ran 12:44:26–12:44:56 and the fanned instances 12:44:16–12:44:36; `survey-files` opened while both tree instances were still running, so the destination is one batch of four rather than two batches in sequence.

Every instant above was recorded by the branch reporting it. The baseline is 12:43:59Z and no branch claims a start before it.

## Isolation

| Note | Directory | Branch | Commit | Merged |
|------|-----------|--------|--------|--------|
| N1 | tests | fan-note-N1 | f1f17eb0 | merged, integration head bc4c48f4 |
| N2 | guards | fan-note-N2 | 63658845 | merged, integration head bc4c48f4 |

**Reading:** each writer took a checkout of its own, wrote at the path its unit was handed, and committed on a branch named for its own designator. Both branches are accounted for and both merged cleanly, in the order the collection named them.

The two notes landed at `notes/N1.md` and `notes/N2.md` — one layout, chosen by the stage that opened the writers rather than by each writer. Both branches survived an earlier run of this specimen, and that run's notes rode along in the merge at `08-note-N1.md` and `planning-notes/2026-09-17-meta-2/08-N2-note.md`: two writers, one instruction, two layouts. The old and new sit in one tree, which is the clearest statement of what handing the path down buys.

The merges landed on a branch taken off `origin/main` rather than onto `main` in place, so the checkout's own `main` ref is where it was.

## What the surveys found

The file survey counted 543 files. TypeScript dominates at 268, then YAML at 124 and Markdown at 60 — the shape of a server whose corpus and guard suite rival its source. The fullest directories are `tests` at 111 files and `guards` at 61.

The history survey read 50 commits by one author. Movement concentrates in `tests` at 25 commits and `guards` at 23, with `tests/e2e` and `src/loaders` next — the test and guard surfaces are where the work has been.

The tree survey walked two roots. `src` is shallow and compact at depth 3, 8 directories, 69 files. `tests` is neither: depth 6, 104 directories, 284 files, an order of magnitude wider than the source it covers.

## Probes

| Probe | Directory | Why picked | Files | Subdirectories | Largest file |
|-------|-----------|------------|-------|----------------|--------------|
| P1 | tests | Named by both surveys and the deeper tree root | 111 direct / 284 total | e2e, fixtures | tests/mcp-server.test.ts, 135584 bytes |
| P2 | guards | 23 commits against 61 files, the densest movement of any large directory | 61 / 61 | none | guards/check-binding-fidelity.ts, 56408 bytes |
| P3 | src/loaders | 5 commits against 11 files, the only `src` directory either survey puts this high | 11 / 11 | none | src/loaders/workflow-loader.ts, 49967 bytes |

## Anything the record did not expect

- Both note branches already existed from an earlier run of this specimen, and both writers resolved that the same way: check the branch out rather than recreate it, preserving the earlier commit. The specimen says nothing about a branch that already exists, so the agreement is the writers' own judgement rather than the definition's.
- The batch block reported `bounded: false` with no limits to this walk's own agent, and `bounded: true` with both limits to every dispatched worker. The count of 5 activities against a cap of 3 that the previous run reported does not recur.
