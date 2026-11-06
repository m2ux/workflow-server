# I17 Decisions

## The User's Decisions, 2 November 2026

1. **No proposal.** Propose Mode is waived; the goal below is confirmed as given.
2. **Goal.** Every Work Planner skill fix found before I16's cutover is delivered in workflow-server before I16 E00 extracts the skill, so the extraction carries it. Further fixes are added as task rows as they are found.
3. **Number.** I17, continuing the initiative numbers across repositories: prosiform-skills holds I16 and workflow-server's highest is I15. This departs from Select Tracker Number, which reads one repository's titles.
4. **Shape.** One epic, E00 Pre-Cutover Fixes, whose task rows are the fixes.
5. **Rows.** W01 planning commits directly to engineering; W02 an epic closed as not planned leaves its initiative; W03 board sync removes an item closed other than as completed whether or not a body cites it; W04 sync reads every linked pull request whatever its title. W03 and W04 were added during drafting, before publication.
6. **Theme and board.** `theme:planning`, `bot:ai-assisted`, on board 17 at the status newly published work takes.
7. **Priority.** The epic carries `priority: 6`. The initiative carries no priority label, since Plan Mode ranks epics only; Advance Mode ranks initiatives.
8. **Cutover edge.** I16 E00 W00 names I17 E00 as its prerequisite, recorded in I16's own record.
9. **I16 in References.** I17's References cite I16, which stands on the same board. The same-board References rule bars it; the user keeps it.
10. **Planning on engineering.** Every planning artifact, draft bodies and work items included, is committed directly to the engineering branch. No planning branch and no discussion pull request. This departs from Plan Mode step 2 and from the Bodies convention that keeps body files outside the repository; W01 makes it the skill's design.

## Planning Decisions

- **One initiative criterion.** The goal's two clauses, delivered in workflow-server and carried by the extraction, are one fact: each fix's merge commit is an ancestor of the commit the extraction is cut from. The extraction is the time bound, a milestone outside this initiative.
- **No edges between rows.** Each row changes its own component and consumes no other row's output. W03 is prompted by W02's rule but reads only board items and issue states, so it needs nothing W02 produces.
- **No joins to account for.** The four rows declare four components, so the dependency check finds no candidate unit.
- **Components beyond the declared one.** W01 also removes the discussion command from `artifacts/pull-request.md` and restates the Bodies convention in `SKILL.md`; W02 also changes `scripts/format.py`; W03 also restates removal in `artifacts/board.md`. The Component rule splits a task extending more than one component; the rows are kept as the user shaped them, each one pull request's worth of one fix. W01 and W04 both touch `artifacts/pull-request.md`, on one epic base, so the second rebases on the first.
- **Priority.** The dependency check proposes 1 for the lone epic; the user's 6 is applied.
- **Labels.** `bug` is added to both issues, as the shared Labels condition applies it to defects.
- **Cutover edge names the epic.** The W00 cell names `I17:E00` rather than its rows, because the epic takes further rows as faults are found and a row list would go stale. The dependency check reads another initiative's epic as an external reference.
- **Record folder.** Named for the initiative's issue, 1597, which matched the number read before creation.

## E02 Skill Separation, 2 November 2026

The user's decisions:

1. **Epic, not a standalone issue.** The delivery-path breach raised as #1614 becomes a separation-of-concerns review of the whole skill, raised as [I17:E02](https://github.com/m2ux/workflow-server/issues/1615). #1614 is closed into it.
2. **Scope.** Every artifact, mode, protocol and script in `skills/work-planner`, with its tests where a rule moves.
3. **Shape.** W01 audits the skill against SOLID and the one-home rule and records each breach with its file, rule and owning home in this folder. W02 (prose), W03 (scripts) and W04 (one-home rules) take the findings by concern. Each is split into one row per group of files it touches before it starts.
4. **Extraction waits.** I16's extraction waits for E02, as for E00, so the skill moves already separated.
5. **Priority.** The epic carries `priority: 6`.

Planning decisions:

- **No tests-pass criterion.** The tests and skill-file check are a gate every pull request meets, so no row carries them as a criterion.
- **I17 reopened.** Its AC1 is unticked again until E02's fixes are in the extraction commit's history.
6. **SOLID guidelines first.** Artifact and protocol files are classes, and linked operations are method calls that encapsulate each file's state. A new W01 lands SOLID guidelines fitted to that model in the skill's guidelines, drafted in [e02/solid-guidelines.md](e02/solid-guidelines.md). The audit becomes W02 and measures against them. The fix rows become W03 to W05.

## E01 Skill Style, 2 November 2026

The user's decisions:

1. **Purpose.** [I17:E01](https://github.com/m2ux/workflow-server/issues/1616) gives the skill the file style its prosiform form needs: the groundwork for prosiform compliance. It takes priority, with `priority: 7`.
2. **Reference, style only.** The example under prosiform's `example/` is an older, stale work-planner. E01 takes its formatting and file shape and none of its content. No `technical-debt.md`, no new protocols; protocol extraction is a SOLID concern for E02's audit.
3. **Not yet.** Prerequisites sections stay. No prosiform frontmatter and no `pf` instruction.
4. **No link marks.** The prosiform link marks (↳ ⇉ ⫽ ¬) need prosiform's grammar to place, so they are left for the compliance work along with the frontmatter and the `pf` instruction.
5. **Per-skill section model.** The shared guidelines and the other skills keep their shape. work-planner declares its model in its own guidelines, `structure.json` and `rules.json`, and the shared checker reads each skill's declared model.
6. **Rows.** W01 is the section model and checker. W02 builds rules, conventions and configuration from the live SKILL.md and guidelines. W03 restyles the modes and W04 the protocols. W05 to W07 restyle the artifacts in three file groups: issue and bodies; board, queue, planning and review; delivery, branch and pull request. W02 depends on W01, and W03 to W07 depend on W02 and run in parallel.
7. **Order.** The SOLID guidelines and audit consume the restyled skill through the producer rows recorded in Separation's task table. The extraction includes Style and Separation.

Planning decisions:

- **Numbering.** Style is E01 and Separation is E02, following their producer order.
8. **Command presentation.** (User, 2026-11-05.) The migration follows the command presentation defined in [E01 Proposal](https://github.com/m2ux/workflow-server/issues/1616#proposal), using the specific Graph Index step referenced there. The proposal is the requirement’s home; the example supplies presentation only.


## E03 Delivery Lanes, 3 November 2026 — Decision History

The user's decisions:

1. **Epic, not a hot-fix.** The lanes feature raised as hot-fix F08 is too big for a hot-fix. Lanes join I17 as E03 so they land before the extraction. [#1625](https://github.com/m2ux/workflow-server/issues/1625) itself becomes [I17:E03](https://github.com/m2ux/workflow-server/issues/1625); F08 stays unused.
2. **Design.** The Proposal bullets of the epic are the interview's decisions: an optional `**Lane:** <id>` work-item line beside Component, an opaque board-wide index stating no reason; the run names its lane in its request and nothing is stored per session; a run naming no lane takes only unlaned rows; a laned run takes its own lane's rows and unlaned rows, never another lane's, by priority alone; Plan mode asks whether an initiative uses lanes and proposes each row's lane; joined rows in different lanes are a Plan and Align finding and the dependency check refuses such a unit; Advance and the board queue report each Ready unit's lane.
3. **The queue filter ships first.** The rows that let a laned Deliver run skip other lanes' rows depend on none of the Plan, Align or report rows, since prosiform's I10 waits on that filter to run two sessions.

Planning decisions:

- **One component per row.** Ten rows, one file each. The queue filter is W01 to W06: the work-item declaration, the delivery plan's lane rule, the joined-lane rule, the dependency check's lane reader, the survey's lane filter and Deliver mode's lane. W07 to W10 are Plan mode and the board-queue report.
- **Each rule and its script ship together.** W02 joins W05, W03 joins W04 and W08 joins W09: each artifact describes the command its script row implements, so one pull request lands both.
- **One lane reader.** The dependency check reads the Lane line beside Component, and the survey and the board queue import that reader, as they import its component reader.
- **Align needs no row.** Plan and Align both run Check Dependencies and Numbering, so the joined-lane rule lives in the dependency graph alone and both modes report it from the check. Plan mode's row adds only the lanes question.
- **Hot-fix units are unlaned.** A hot-fix has no work item, so every run is offered it.
- **Board queue reads the engineering worktree.** Its `next` report names each Ready unit's lane, read from the work items there. It reads files and runs no git.
- **Criteria per row.** #1625's five criteria spanned several rows each; they are split into one criterion per row, AC1 to AC10, keeping every one of the original conditions.
- **Labels.** `type:epic`, `theme:planning`, `bot:ai-assisted` and `priority: 7`, as E01 carries. No `type:hot-fix`.
- **Priority.** The dependency check proposes 2 for E00, E01 and E03 and 1 for E02, matching the live labels' order, with E03 alongside E01. E01's rows declare no components yet, so contention between E01 and E03 is unchecked; both edit the same artifacts and modes, which is put to the user.
- **I17 admits a feature.** Its Proposal gains a bullet admitting a feature the skill must carry, and AC1 reads "fix and feature".
- **Board.** E03 stands on board 17 at Ready, assigned to the user: I17 is In Progress and E03, with no prerequisite epic, carries the highest number among I17's epics that can start, beside E01.
- **E03 lands before E01.** (User, 2026-11-03.) E03 takes `priority: 8` above E01's 7, so the lane rules land first and E01 restyles their text with the rest. This supersedes `priority: 7` above.
- **The queue report is deferred.** (User, 2026-11-03.) Whether the board queue and Advance report each Ready unit's lane (W08 to W10, which teach the queue units and a read of the engineering worktree) is held for the user; it is settled before W08 starts. W01 to W07 are unaffected.


## E03 Task-Table Lanes, 4 November 2026

The user's confirmed design:

1. **Storage.** A lane is a new Work Breakdown column, not a work-item declaration.
2. **Position.** The exact epic table columns are Task, Description, Coverage, Depends on, Joins, Lane, Done.
3. **Cell.** Lane holds a bare index such as 2, or an empty value for an unlaned row. The index remains opaque and board-wide.

Planning decisions:

- **Historical delivery.** W01 and PR #1626 keep their number, merge and Done tick. Its original declaration criterion is retained in its delivery evidence and retired as AC1 from the current epic. The epic's current criteria are AC2–AC14.
- **One data home.** W02 owns the task-table contract (AC11) and W03 removes the work-item declaration path (AC12). They join so the schema and declaration removal ship together.
- **Reader and validation.** W04–W06 join the dependency rule, its shared row-lane reader, and format validation/preservation (AC3, AC4, AC13, AC14). The reader takes raw Lane cells from the epic body; work-item files supply components. Malformed populated cells are reported, not treated as empty lanes.
- **Filter next.** W07+W08 deliver admission rules and the survey filter. A row's lane remains available when it has no work-item link. W09 integrates the requested lane into Deliver; W10 writes confirmed values through Populate Epic Issue Body.
- **Reporting.** W11+W12 and W13 read the Lane cells already supplied in issue snapshots. They introduce no engineering-worktree input for lane data. The existing reporting decision remains held until before W11 starts; this renumbers the previously held W08–W10 scope.
- **Numbering.** Only undelivered rows are renumbered, as the [row map](e03-lane-column-renumbering.json) records. No task beyond W01 has a delivering pull request or reservation.
- **Priority.** E03 retains its confirmed priority 8, ahead of E01 at 7 and E02 at 6. The storage correction adds no cross-epic edge or contention requiring another priority decision.
- **Scope.** This request revises the published plan and its work items. Source implementation and the draft integration remain at the delivered declaration revision. The new table contract is implemented by W02+W03.


## E03 Arising Join Input, 4 November 2026

- **Source.** #1630 records priority recursion on a qualified cross-epic joined shape at baseline 74e19867e905523b85d2da84c7b1cb35b2b60b53. Delivery units belong to one epic and its bases; qualified parser acceptance supplies no cross-epic delivery contract.
- **Placement.** The session's task-creation and folded-work allowance places the bounded-diagnostic fix in E03 W14, covering AC15. It remains future work and is not dispatched by the W04–W06 session.
- **Input.** W14 consumes the early parsed-unit stage W05 establishes. It reports invalid joined scope before priority evaluation.
- **Numbering.** W14 is appended to preserve the existing published row identities and record links. Its lower dependency level is an explicit numbering advisory. The dependency check's no-cycle and join checks remain binding.
- **Priority.** E03 retains priority 8 and its sibling order. No cross-epic dependency or parallel component contention is added.


## Automatic Remaining Delivery, 5 November 2026

- **Authorization.** The user requests automatic starts for the remaining work items. The active delivery scope is E03 W07–W14, retaining the published joins and dependencies.
- **Reporting.** The instruction covers the remaining published reporting rows W11–W13, resolving the earlier pre-start deferral and retaining their issue-snapshot design.
- **Coordination.** The coordinator refreshes the live queue after each completed unit and starts the next eligible work within harness capacity, with a published record and verified reservation before each session.
- **Upstream.** [#1631](https://github.com/m2ux/workflow-server/issues/1631) asks Work Planner to provide this continuous automatic-dispatch behavior. It is reported as future work and is not added to the current delivery scope.
- **Record.** [Automatic delivery authorization](../2026-11-05-free-work-auto-start/automatic-delivery.md) states the units, coordination and completion boundaries.

## Epic Order, 5 November 2026

The user confirms Style as E01 (#1616) and Separation as E02 (#1615). The Separation guidelines row consumes E01 W03, W04, W05, W06 and W07; those terminal producers carry the complete style chain. Existing task ids, criteria, priority labels and completed E00/E03 delivery identities are preserved. The unstarted Style W01 record and its branch/worktree carry E01. The cross-initiative extraction row names the same issue identities with their current epic labels.

## Style-Model Activation, 5 November 2026

The user confirms checker capability in E01 W01 and installed model adoption in final W08 after W02–W07. AC1 is demonstrated against specimen skills; AC8 owns the installed Work Planner declaration and zero-finding full check. The terminal conversions are W08's direct producers, and Separation W01 consumes W08. The held W01 reservation and task identity remain current. The new capability has no transitional dual-style model or validation bypass.

## Checker Acceptance Scope, 5 November 2026

The user confirms Work Planner as the sole acceptance scope. Specimen fixtures verify its proposed model in AC1; the installed Work Planner check supplies AC8's zero-finding gate. The 68 existing findings in other skills are baseline evidence, not work assigned to this delivery. Their files remain unchanged.

## Fields and Transformations, 6 November 2026

- The user places the Status Changes extraction in E02 and requires guidelines/tests to identify this and similar candidates.
- Existing W01/W02 and AC1/AC2 gain the field/operation boundary and an exhaustive Fields classification. New W06–W09 and AC6–AC10 preserve existing row/criterion identities and priority.
- W06–W08 are one joined unit so the artifact and both known caller components remain valid together. They share the existing general-fix prerequisites and carry extraction regressions in that same unit. W09 supplies the reusable checker feature and its own positive/negative fixtures afterward.
- Candidate detection reports evidence for review; conditional constraints and literal examples are valid. The audit settles semantic ownership and adds any further component rows before dispatch.
- The plan remains unlaned and waits for E01 W08 on workspace. No source implementation or delivery start is included in this planning request.

## Retained Preparation Follow-up — 2026-11-06

The user selected “Plan it in E02” for the preservation review's pre-existing retained-worktree ambiguity. E02 W10 consumes the existing correction from #1631 / PR #1645 and the completed separation diagnostics, reconciles the protocol route and verifies non-mutating reuse and single-start behavior. The plan adds three criteria with one task owner, keeps the existing rows and priority, and authorizes no implementation or merge.
