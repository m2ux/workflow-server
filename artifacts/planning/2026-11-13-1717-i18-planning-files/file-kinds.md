# File-Kind Survey

The file kinds planning records hold, read on 2026-11-13 from three engineering worktrees, and the owner each kind takes.

## Method

- **Sources.**
  `artifacts/planning/` on the `engineering` branch of workflow-server, prosiform and midnight-agent-eng, as their local worktrees held them.
- **Kinds.**
  Every file path relative to its record folder, with digits normalised (`e00/w01.md` reads as `eN/wN.md`). Counts are files; "recent" counts folders dated 2026-10-15 or later, the Work Planner era.
- **Layout.**
  For recent folders: whether the name is `<yyyy-mm-dd>[-<ref>]-<slug>`, whether README.md exists, whether each other file is linked from the README, and whether each README link to a local file resolves.

## Counts of the Main Kinds

Recent-folder file counts, workflow-server / prosiform / midnight-agent-eng.

| Kind as written | Counts | Owner |
| --- | --- | --- |
| `README.md` | 205 / 420 / 74 | Planning Record |
| `wN.md`, `fN.md`, `h-wN.md` (delivery record) | 212+11 / 532+1 / 69+2 | Work Item |
| `eN/wN.md`, `iN-eN/wN.md`, `work-items/eN/wN.md`, `eN-work-items/wN.md` (plan record) | 23+0+27+19 / 172+77+0+0 / 65 | Work Item |
| `bodies/eN.md`, `bodies/iN.md`, `eN-body.md`, `epic.md`, `iN-eN.md` | `bodies/eN.md` 4 / 0 / 0, `eN-body.md` 0 / 15 / 0, `epic.md` 1 / 5 / 3, `iN-eN.md` 0 / 28 / 0 | Initiative Issue Body, Epic Issue Body |
| `drafts/issue-N.md` | 0 / 16 / 0 | Out of scope: Align revisions are working files |
| `goal-trace.md` | 2 / 3 / 4 | Goal Trace |
| `review.md`, `findings.md` | 14 / 6 / 5; 1 / 7 / 2 | Review Finding |
| `decisions.md`, `plan-change.md` | 3 / 17 / 8; 0 / 1 / 15 | Plan Change |
| `changes.md`, `change-list.md` | 37 / 98 / 32; 42 / 132 / 0 | Plan Change |
| `dependencies.txt`, `joins.md` | 5 / 0 / 0; 5 / 15 / 1 | Dependency Graph |
| `test-results.md`, `test-evidence.md`, `validation.md`, `evidence.md` | 29 / 9 / 0; 24 / 0 / 0; 62 / 289 / 48; 20 / 6 / 0 | Test Plan |
| `agent-review.json`, `agent-review-N.json` | 30 / 7 / 3; 0 / 19 / 0 | Agent Review |
| `review-notes.md` | 10 / 1 / 0 | Out of scope: the Review Record holds its content |
| `architecture-overview.md` | 14 / 24 / 5 | Architecture Overview |
| `design.md` and other declared deliverables (`solid-guidelines.md`, `disclosure.md`, `preservation.json`, `target-rules.json`) | `design.md` 15 / 11 / 5 | The declaring work item's Component; published through Engineering Branch |
| Snapshots and readbacks (`snapshots/*`, `*-before.json`, `*-readback.json`, `original-issue.md`, `initiative-verification/*`, `decision-trace/*`) | `snapshots/EN.md` 18 / 0 / 0, `original-issue.md` 0 recent | Out of scope: working files, kept outside the repository |
| Raw check output (`*.log`, `head-checks.json`) | `planner.log` 30 / 0 / 0, `skill-check.log` 32 / 0 / 1 | Out of scope: working files; Test Plan's results file and Dependency Graph's report keep what a record cites |
| Session progress (`progress.md`, `todos.md`, `todo.md`, `delivery.md`, `plan.md`) | `progress.md` 10 / 2 / 3, `todos.md` 0 / 13 / 8, `delivery.md` 15 / 1 / 4 | Out of scope: the board holds progress, the work item holds the plan |
| workflow-server session state (`session.json`, `.session-token`, `contexts/N.json`, `context-N.json`) | `contexts/N.json` 102 / 0 / 0, `context-N.json` 46 / 0 / 0 | Out of scope: another tool's state |
| Pre-Work-Planner outputs (`NN-assumptions-log.md`, `NN-test-plan.md`, `COMPLETE.md` and the like) | 0 recent | Out of scope: earlier records, which stay as written |

## Layout of Recent Folders

| Repository | Folders | Name departs | No README | Unlisted files | Missing link targets |
| --- | --- | --- | --- | --- | --- |
| workflow-server | 207 | 1 (`workspace-harness-support`) | 2 | 26 folders, 430 files | 12 folders |
| prosiform | 423 | 0 | 3 | 14 folders, 1330 files | 98 folders |
| midnight-agent-eng | 74 | 0 | 0 | 4 folders, 21 files | 4 folders |

A missing link target counts any README link to a local path that does not exist, a link outside the folder included.
