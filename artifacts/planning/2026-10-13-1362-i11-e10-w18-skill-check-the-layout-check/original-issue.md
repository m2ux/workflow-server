# Original Issue

> [Skill Check: The Layout Check Reaches a Gate](https://github.com/m2ux/workflow-server/issues/1362) · opened 2026-10-13 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W18] Skill Check: The Layout Check Reaches a Gate` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-13 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

The repository holds a skill-file check that measures link resolution, command-specification placement, mode-file section sets and bullet layout across every skill, and nothing runs it. No continuous-integration job invokes it and no package script names it, so the only thing that reports a skill layout fault is an agent that chooses to run it.

## Problem

- **Nothing in the repository invokes the check.**
  A search for `check_skill_files` across `.github/`, `package.json` and the shell scripts at [`ee5cdc9c`](https://github.com/m2ux/workflow-server/tree/ee5cdc9c) returns the script and its own tests alone.
- **The branch that holds the skills is outside the verify job's triggers.**
  [`verify.yml`](https://github.com/m2ux/workflow-server/blob/ee5cdc9c/.github/workflows/verify.yml#L20) fires on `main`, `i<n>/main` and `i<n>/e<n>/main`. The skills live on `workspace`, which matches none of them.
- **A fault the check reports has already merged.**
  Three inline bold leads over the stated limit stand on `workspace`, reported by the check and merged without it running.

## Proposal

- **A job runs the check over every skill.**
  `skills/scripts/check_skill_files.py` runs against each folder under `skills/`, and a finding fails the job, so the layout is measured on every change rather than on the changes an agent remembers to measure.
- **It fires where the skills live.**
  The job's triggers cover `workspace` and the branches promoted into it, as `verify.yml` covers the main lineage for the engine.
- **Its scope is stated where it excludes a skill.**
  A skill the check reports findings over today is named with the reason it is out of scope, so the job starts green and a new finding is a new fault.

## Acceptance Criteria

- [ ] **AC1.** A continuous-integration job runs the shared skill-file check over every skill in scope and fails on a finding, as a run of that job against a branch carrying a layout fault shows.
- [ ] **AC2.** The job runs on the branch the skills live on, as its trigger configuration states and a run on a push to that branch shows.

## References

- **R1.** [`check_skill_files.py`](https://github.com/m2ux/workflow-server/blob/ee5cdc9c/skills/scripts/check_skill_files.py) — the check and the rules it measures.
- **R2.** [`verify.yml`](https://github.com/m2ux/workflow-server/blob/ee5cdc9c/.github/workflows/verify.yml) — the job whose triggers cover the main lineage.

