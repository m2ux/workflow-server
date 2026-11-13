# I18 Decisions

## The User's Decisions, 13 November 2026

1. **No proposal.** The work is feature-scale; the goal below is confirmed as given, and Propose Mode is skipped.
2. **Goal.** Planning is a collection of files with a structure and a location, and each of its rules has one home:
   - G1. Engineering Branch owns where a record lands and how: finding the engineering worktree; direct commit with sweep, rebase and push; no epic base, task pull request or review pull request; the push's bypass notice expected. Planning Record publishes through it, and so does any other engineering-side content, such as design documents.
   - G2. Planning Record owns only what is general to a record: the collection of files as a whole, its dated folder naming, its location in the engineering worktree, its README index, and how a file joins it. It defines no specific file kind.
   - G3. Each file kind belongs to its owner, not to general planning. Each owner states its file's path within the record and its template, and links Planning Record for the folder. Every kind records hold today has an owner, or falls out of scope; none is put in Planning Record.
   - G4. New records only. Existing records stay as written, and no migration is planned.
   - G5. A layout check that makes a new record checkable by script is in scope if it is cheap.
3. **Shape.** One initiative, one epic, a handful of rows.
4. **Board.** Board 17 at Backlog, with no priority label on either issue.
5. **Delivery.** Every finding is fixed in the delivery that finds it. The user reviews and merges the epic review pull request; no agent merges it.

## Planning Decisions

- **Number.** I18: workflow-server's highest initiative prefix is I17, as List Prefixed Titles printed.
- **Record folder.** Named for the initiative's issue, 1717, read as the next number before creation and matched by the saved issue.
- **Labels.** `type:initiative` or `type:epic`, `theme:planning`, `enhancement` and `bot:ai-assisted`.
- **No design row.** The user settled the two artifacts and the ownership rule, and this record settles each owner's path and template in the table below, so no row designs before the others build.
- **No lanes.** One epic of five rows needs no lane assignment; the rows' lanes are empty.
- **Joined first unit.** Engineering Branch and the narrowed Planning Record both rewrite `planning-record.md` and its test, so they land as one pull request of five criteria.
- **New records only, by date.** The layout check passes a folder dated before the date Planning Record states for it, so a record opened earlier stays as written while a new one is checked on every publish.
- **Body drafts per owner.** Initiative Issue Body and Epic Issue Body each state their own draft path, as the user named. Other body kinds a record does not hold.
- **Decisions belong to Plan Change.** Rules' Decisions bullet records a decision in the planning record and no artifact owned the file. Plan Change already defines the change list a run's record keeps; its record file `decisions.md` holds the user's decisions and the change list as entries, so the lane map is a decision entry and the separate change-list files (`changes.md`, `change-list.md`) have one name.
- **Review notes leave.** `review-notes.md` restates the Agent Review record's findings, dispositions, fix evidence and exclusions, which the JSON record already holds, so no artifact takes it on.
- **Test results take one name.** Test Plan's Result Evidence names "the work's published planning document"; Test Plan owns it as `test-results.md`, the file workflow-server records already use.
- **Work items in two shapes.** A plan record holds `e<nn>/w<nn>.md`, since one plan spans epics; a delivery record holds `<task-id>.md`, the name the released row links.
- **Working files stay out.** Snapshots, readbacks, raw logs, session progress and another tool's state are working files, kept outside the repository as Conventions states for body files. What a record cites of them is its owner's report: Dependency Graph's or Test Plan's.

## File-Kind Ownership

| Kind | Path within the record | Owner |
| --- | --- | --- |
| Record index | `README.md` | Planning Record |
| Initiative body draft | `bodies/i<nn>.md` | Initiative Issue Body |
| Epic body draft | `bodies/e<nn>.md` | Epic Issue Body |
| Work item | `e<nn>/w<nn>.md` in a plan record; `<task-id>.md` in a delivery record | Work Item |
| Goal trace | `goal-trace.md` | Goal Trace |
| Review findings and their resolutions | `review.md` | Review Finding |
| Dependency report | `dependencies.txt` | Dependency Graph |
| Split-unit record | `joins.md` | Dependency Graph |
| Decisions and change list | `decisions.md` | Plan Change |
| Test results | `test-results.md` | Test Plan |
| Agent review record | `agent-review.json` | Agent Review |
| Architecture overview | `architecture-overview.md` | Architecture Overview |
| Design documents and other engineering-side deliverables | the path the work item declares | The declaring Work Item's Component, published through Engineering Branch |
| Review notes | none | Out of scope: the agent review record holds them |
| Align revision drafts, snapshots, readbacks, raw logs | none | Out of scope: working files outside the repository |
| Session progress and to-do lists | none | Out of scope: the board holds progress, the work item the plan |
| workflow-server session state | none | Out of scope: another tool's state |
| Pre-Work-Planner work-package outputs | none | Out of scope: earlier records, kept as written |

The [file-kind survey](file-kinds.md) lists the names each kind is written under today and their counts.
