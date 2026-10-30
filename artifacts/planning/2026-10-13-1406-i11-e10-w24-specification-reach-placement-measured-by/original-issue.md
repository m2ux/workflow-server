# Original Issue

> Specification Reach: Placement Measured by What a File Must Open · issue #1406 · opened 2026-10-13 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W24] Specification Reach: Placement Measured by What a File Must Open` |
| Labels | `bug`, `type:task` |
| Opened | 2026-10-13 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

The placement rule asks which procedure runs a command and sends the specification to that procedure's file. Retrieval asks which files a mode must open to work. The two agree where a mode's own steps run the operation, and part company where one mode's command specification cites an operation held in another mode's file. This task closes that gap and re-measures what the layout now costs.

## Problem

- **The caller test counts procedures, and a specification is not one.**
  A file is a caller where a procedure of it carries the citation. A citation inside a command specification makes its file no caller, so an operation it depends on can be placed elsewhere without the rule reporting anything.
- **Deliver mode gained a file.**
  `deliver-mode.md` cited `sync-mode.md` zero times before the section-set change and twice after: `Link Pull Request to Issue` in Open Task Pull Request, and `Fetch Board Items with Status` in Find Available Work. Both stood in the catalog, which Deliver mode opens anyway.
- **The guide reaches the same file for a third operation.**
  [Review Pull Request](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/work-breakdown.md#L178) sends the merging session to `Update Review Pull Request`, now held in `sync-mode.md`. A delivering session runs it after every task merge.
- **No record measured the result.**
  The disclosure verification records cover the first restructure and the conventions placement. Three later units changed the layout and none re-measured retrieval, so the initiative criterion asserting a layout change costs no more than the layout it replaced stands unverified.

## Proposal

- **A specification counts as reach.**
  Where a file's command specification cites an operation, that file must open the file holding it, so the specification counts alongside a procedure when the placement rule asks who reaches an operation. An operation two files reach stays in the catalog both already open.
- **Each mode's retrieval is measured at the current head.**
  A disclosure verification record walks each mode over the layout as it now stands and compares the files opened with the record the first restructure left.
- **An operation whose placement raised retrieval goes back to the catalog.**
  The catalog is what several procedures share, and an operation reached from two modes is that case whatever form the reach takes.

## Acceptance Criteria

- [ ] **AC1.** The shared skill-file check reports a command specification held in a mode file that another mode's file reaches, whether that reach is a procedure's citation or a command specification's, as the check's own test suite shows against a specimen carrying one.
- [ ] **AC2.** A disclosure verification record measures each mode's retrieval over the layout at the skill's head and records no mode opening more files than the record of the layout it replaced, as that record shows.

## References

- **R1.** [Disclosure verification record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-13-1319-i11-e12-w11-disclosure-verification-over-each) — the files each mode opens under the first restructure, which is the measurement this one is compared against.

