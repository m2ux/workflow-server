# Fan Conformance Report

> `.` · 2026-09-17T12:06:58Z

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

Two probes of three earned a note, so the writer fan opened at two. The empty-collection exit beside it stayed unreached, and the row above says so rather than being trimmed away.

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

Every slot carried the designator its unit was handed, read by container position. No branch was served a sibling's element.

## Overlap

| Fan | Branch | Started | Finished | Duration |
|-----|--------|---------|----------|----------|
| plan-conformance.planned | survey-tree#0 (src) | 12:07:25Z | 12:07:48Z | 23s |
| plan-conformance.planned | survey-tree#1 (tests) | 12:07:30Z | 12:07:53Z | 23s |
| plan-conformance.planned | survey-files | 12:07:36Z | 12:07:55Z | 19s |
| plan-conformance.planned | survey-history | 12:07:40Z | 12:08:26Z | 46s |
| choose-probes.chosen | probe-directory#0 (P1) | 12:10:09Z | 12:10:21Z | 12s |
| choose-probes.chosen | probe-directory#1 (P2) | 12:10:14Z | 12:10:27Z | 13s |
| choose-probes.chosen | probe-directory#2 (P3) | 12:10:19Z | 12:10:28Z | 9s |
| open-notes.opened | note-probe#0 (N1) | 12:11:27Z | 12:12:29Z | 62s |
| open-notes.opened | note-probe#1 (N2) | 12:11:33Z | 12:13:13Z | 100s |

| Fan | Wall clock | Sum of branch durations | Difference |
|-----|------------|-------------------------|------------|
| plan-conformance.planned | 61s | 111s | 50s |
| choose-probes.chosen | 19s | 34s | 15s |
| open-notes.opened | 106s | 162s | 56s |

**Reading:** every fan is a batch. In each one the last branch to start did so before the first had finished, which is the evidence: `survey-history` opened at 12:07:40 with three siblings still running, `probe-directory#2` at 12:10:19 with both siblings still running, `note-probe#1` at 12:11:33 with its sibling still running. No fan shows intervals abutting end-to-start.

For the mixed destination, the two kinds also overlap each other rather than queueing behind one another. The bare members ran 12:07:36–12:08:26; the fanned instances ran 12:07:25–12:07:53. `survey-files` opened while both tree instances were still running, so the destination is one batch of four and not two batches in sequence.

Every instant above was recorded by the branch that reports it. The run baseline is 12:06:58Z and no branch claims a start before it.

## Isolation

| Note | Directory | Branch | Commit | Merged |
|------|-----------|--------|--------|--------|
| N1 | tests | fan-note-N1 | c60080a9 | merged at 8d2e88aa |
| N2 | guards | fan-note-N2 | 0b4f034a | merged at 86803c03 |

**Reading:** each writer took a checkout of its own off `origin/main`, committed one file on a branch named for its own designator, and neither touched the other's path. Both branches are accounted for, both merged cleanly, and they merged in the order the collection named them. The integration head is 86803c03.

The merges landed on a branch taken off `origin/main` rather than onto `main` in place, so the checkout's own `main` ref is where it was. The commit the instances diverged from is the same either way.

## What the surveys found

The file survey counted 543 files under the component. TypeScript dominates at 268 files, then YAML at 124 and Markdown at 60 — a shape consistent with a server whose corpus and guard suite are as large as its source. The fullest directories are `tests` at 111 files and `guards` at 61.

The history survey read the last 50 commits, spanning 2026-09-16T11:53 to 2026-09-17T10:37, all by one author. Fourteen were merges and thirty-six carried paths. Movement concentrates in `guards` at 21 commits and `tests` at 20, with `src/loaders` third at 5 — the guard suite and its tests are where the work has been.

The tree survey walked two roots. `src` is shallow and compact: depth 3, 8 directories, 69 files. `tests` is neither: depth 6, 104 directories, 284 files. The test tree is an order of magnitude wider than the source it covers.

## Probes

| Probe | Directory | Why picked | Files | Subdirectories | Largest file |
|-------|-----------|------------|-------|----------------|--------------|
| P1 | tests | Named by both surveys and the deepest tree root | 111 direct / 284 total | e2e, fixtures | tests/mcp-server.test.ts, 135584 bytes |
| P2 | guards | Most commits in the window, 21, against 61 files | 61 / 61 | none | guards/check-binding-fidelity.ts, 56408 bytes |
| P3 | src/loaders | Highest commit-to-file ratio either survey names | 11 / 11 | none | src/loaders/workflow-loader.ts, 49967 bytes |

## Anything the record did not expect

- The two note writers were given one instruction and produced two different layouts. Both found that the session planning folder resolves inside the uninitialised `.engineering` submodule and cannot be staged from a host-repo checkout; N1 wrote at its checkout root, N2 mirrored the planning-folder layout at a regular path. Neither is wrong under the instruction, which is the finding: the instruction does not determine the path.
- The `batch` block reported `activities: 5` against `max_activities: 3` while still answering `may_continue: true`. A count past its own stated limit with permission granted alongside it is two readings that cannot both be right.
- The call that opened the first fan returned three activity ids for four branches, and each retirement's outstanding list carried display names rather than instance-qualified ids. Two `survey-tree` instances are indistinguishable in those payloads; the correspondence between a branch and its return is carried by fan order alone.
