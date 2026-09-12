# Fan Conformance Report

> . · 2026-09-11T15:23:17Z

## What ran

| Fan | Form | Branches opened | Slots filled |
|-----|------|-----------------|--------------|
| plan-conformance.planned | a list naming two activities and fanning a third over a collection | 4 | 4 |
| choose-probes.chosen | one activity per element | 3 | 3 |
| open-notes.opened | one activity per element, each in a checkout of its own | 2 | 2 |

## Forms the run exercised

One row per part of the destination grammar this run reached, so a reader can see which parts have been measured and which have not.

| Form | Where | Reached |
|------|-------|---------|
| A list member written as a bare activity id | plan-conformance.planned | yes |
| A list mixing bare ids with an instance fan | plan-conformance.planned | yes |
| One activity over a collection | choose-probes.chosen | yes |
| A member bounded by its own `maxInstances` | plan-conformance.planned | yes |
| A collection reached at a dotted path | plan-conformance.planned | yes |
| Elements that are plain strings | plan-conformance.planned | yes |
| Elements that are objects carrying an `id` | choose-probes.chosen, open-notes.opened | yes |
| A fan seeded by the call that enters it | plan-conformance.planned | yes |
| A convergence that opens a fan of its own | choose-probes | yes |
| An exit routing past a fan whose collection is empty | open-notes.nothing-to-note | no |
| Instances committing in checkouts of their own | open-notes.opened | yes |

## Identity

One row per branch. A slot reporting a designator other than the one its unit was handed is a mismatch, and a mismatch is stated as a mismatch. A branch from a bare member reports its own activity id, so its row is filled the same way as a fanned one.

| Fan | Unit id | Designator the slot reports | Agree |
|-----|---------|-----------------------------|-------|
| plan-conformance.planned | survey-files | survey-files | yes |
| plan-conformance.planned | survey-history | survey-history | yes |
| plan-conformance.planned | src | src | yes |
| plan-conformance.planned | tests | tests | yes |
| choose-probes.chosen | P1 | P1 | yes |
| choose-probes.chosen | P2 | P2 | yes |
| choose-probes.chosen | P3 | P3 | yes |
| open-notes.opened | N1 | N1 | yes |
| open-notes.opened | N2 | N2 | yes |

## Overlap

One row per branch, every fan, in container order.

| Fan | Branch | Started | Finished | Duration |
|-----|--------|---------|----------|----------|
| plan-conformance.planned | survey-files | 2026-09-11T15:43:04Z | 2026-09-11T15:43:04Z | 0s |
| plan-conformance.planned | survey-history | 2026-09-11T15:43:04Z | 2026-09-11T15:43:04Z | 0s |
| plan-conformance.planned | survey-tree src | 2026-09-11T15:43:04Z | 2026-09-11T15:43:04Z | 0s |
| plan-conformance.planned | survey-tree tests | 2026-09-11T15:43:04Z | 2026-09-11T15:43:04Z | 0s |
| choose-probes.chosen | P1 | 2026-09-11T15:43:51Z | 2026-09-11T15:43:51Z | 0s |
| choose-probes.chosen | P2 | 2026-09-11T15:43:51Z | 2026-09-11T15:43:51Z | 0s |
| choose-probes.chosen | P3 | 2026-09-11T15:43:51Z | 2026-09-11T15:43:51Z | 0s |
| open-notes.opened | N1 | 2026-09-11T15:45:32Z | 2026-09-11T15:45:43Z | 11s |
| open-notes.opened | N2 | 2026-09-11T15:45:38Z | 2026-09-11T15:45:43Z | 5s |

| Fan | Wall clock | Sum of branch durations | Difference |
|-----|------------|-------------------------|------------|
| plan-conformance.planned | 0s | 0s | 0s |
| choose-probes.chosen | 0s | 0s | 0s |
| open-notes.opened | 11s | 16s | 5s |

**Reading:** At the recorded grain, every fan is a batch: each fan's branches share a start instant, or overlap. The first destination's bare members (survey-files, survey-history) and its fanned instances (survey-tree src, survey-tree tests) all sit on `2026-09-11T15:43:04Z`, so the mixed destination is a batch at both the member-kind grain and the destination grain. The probe fan shares `2026-09-11T15:43:51Z`. The note writers overlap: N1 starts at 15:45:32, N2 at 15:45:38, both finish at 15:45:43. The 5s difference on that fan is what the overlap bought.

## Isolation

One row per note writer, from `{note_targets}` and `{merge_report}`. Empty of rows where the run routed past the writers, which is stated as the route taken rather than left blank.

| Note | Directory | Branch | Commit | Merged |
|------|-----------|--------|--------|--------|
| N1 | tests | fan-note-N1 | e6c3bf8e7a012a68e97f284862facf09d68f6628 | yes (1f670dce7281223cf8aff046411fb0438f99ba17) |
| N2 | guards | fan-note-N2 | 1c573424da7c4716fbbebb786898151d4345dec3 | yes (027116888be72282327601d74d90ae8e2f073e09) |

**Reading:** Each writer committed on a branch of its own (`fan-note-N1`, `fan-note-N2`) in a checkout of its own under the planning folder. Both merged cleanly onto an integration checkout taken from `origin/main`; no conflict, no empty branch. Integration head `027116888be72282327601d74d90ae8e2f073e09`. That merge was not applied to the primary checkout.

## What the surveys found

The file survey listed 474 tracked files. The ten most common extensions are led by TypeScript (233), then YAML (96) and Markdown (57). The directories holding the most files are `tests` (94), `guards` (54) and `scripts` (22).

The history survey read the last 50 commits, all by Mike Clay. The directories those commits touched most are `tests` (29), `docs` (17) and `.` (14).

The tree survey walked `src` (depth 3, 9 directories, 59 files) and `tests` (depth 6, 78 directories, 233 files). Each slot reported back the root it was handed.

## Probes

| Probe | Directory | Why picked | Files | Subdirectories | Largest file |
|-------|-----------|------------|-------|----------------|--------------|
| P1 | tests | Largest directory (94 files), most active (29 of last 50 commits), and the deeper tree-survey root (depth 6). | 94 direct / 233 total | e2e, fixtures | tests/mcp-server.test.ts (133947 bytes) |
| P2 | guards | Second-largest (54 files) and among the most-touched directories (12 commits). | 54 direct / 54 total | (none) | guards/check-binding-fidelity.ts (52531 bytes) |
| P3 | docs | Named by both file and history surveys (15 files, 17 commits). | 15 direct / 15 total | (none) | docs/orchestra-specification.md (35245 bytes) |

## Anything the record did not expect

none
