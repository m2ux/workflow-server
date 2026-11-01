# Script Reachability Audit

Evaluated on `i11/e16/workspace` at `dd9f5ebd3`. Each path reads script → command block → citing operation → calling procedure → test.

## E16 Scripts

| Script | Command block | Citing operation | Calling procedure | Test |
| --- | --- | --- | --- | --- |
| `development.py` | None; a module | Reached through its importers: `links-by-pull-request`, `links-by-issue`, `closure-sweep`, `development-link` | Through those scripts | `test_link_capture.py`, `test_development_link.py`, `test_closure_sweep.py` |
| `links-by-pull-request.py` | `pull-request.md` Capture Pull Request Links | Fetch Pull Request Issue Links; Access Development Links | Advance, Deliver, Standup and Sync modes; Read Delivery Evidence | `test_link_capture.py` |
| `links-by-issue.py` | `issue.md` Capture Issue Links | Read Issue Development | Capture Issue Development (Issue Closure protocol); Audit Closure Evidence (Sync mode) | `test_link_capture.py` |
| `closure-sweep.py` | `issue.md` Sweep Closure Evidence | Audit Closure Evidence | Sync mode | `test_closure_sweep.py` |
| `revision-check.py` | `acceptance-criteria.md` Run at Revision | Verify Selected Criteria | Align and Sync modes; Issue Delivery protocol | `test_revision_check.py` |
| `development-link.py` add | `pull-request.md` Set Development Link | Access Development Links | Link Pull Request to Issue (Publish Pull Request; Sync mode) | `test_development_link.py` |
| `development-link.py` remove | `pull-request.md` Remove Development Link | Access Development Links, removal branch | **Gap:** no procedure requested a removal | `test_development_link.py` |

## Findings

- **Removal unreachable.** Close Tracker Issue named the user's decision on removing an abandoned or incorrect link and ran nothing on it. Fixed: Close Tracker Issue returns the link to its caller, and the Issue Closure protocol obtains the decision, runs Access Development Links with the removal request, and repeats from its issue step.
- **Structure declaration.** `structure.json` declares directories of markdown only; the skill keeps no script declaration, so none applies.
- **Command sandboxing.** The network commands (`links-by-*`, `development-link`) run unsandboxed and the local ones (`closure-sweep`, `revision-check`) under `sbx`, matching the workspace rule that `gh` never runs in the sandbox.

## Other Scripts

Every other script is named by a cited command block or imported by one. `renumber.py` has no test of its own; it predates E16 and is deferred as debt.

## Check Decision

The shared skill-file check reads markdown only and reports no unreachable script. AC7 takes a guard: `test_documents.py` requires every script under `scripts/` to be named by a command specification some procedure cites, or imported by a script that is. A probe script with no command fails it. The guard lives in the skill's suite because the scripts directory and its command convention are this skill's own.

## Validation

Run on the task branch at `40e80afaf`, which merges `i11/e16/workspace` at `ff2e49829` after that base took `workspace` (E13).

- `python3 -m pytest skills/work-planner/test -q`: 541 passed, 1078 subtests passed.
- `python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
- A probe script under `scripts/` with no command fails `test_every_script_is_run_by_a_cited_command`, naming it; removing the probe restores the pass.
