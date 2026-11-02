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

## E01 Skill Separation, 2 November 2026

The user's decisions:

1. **Epic, not a standalone issue.** The delivery-path breach raised as #1614 becomes a separation-of-concerns review of the whole skill, raised as [I17:E01](https://github.com/m2ux/workflow-server/issues/1615). #1614 is closed into it.
2. **Scope.** Every artifact, mode, protocol and script in `skills/work-planner`, with its tests where a rule moves.
3. **Shape.** W01 audits the skill against SOLID and the one-home rule and records each breach with its file, rule and owning home in this folder. W02 (prose), W03 (scripts) and W04 (one-home rules) take the findings by concern. Each is split into one row per group of files it touches before it starts.
4. **Extraction waits.** I16's extraction waits for E01, as for E00, so the skill moves already separated.
5. **Priority.** The epic carries `priority: 6`.

Planning decisions:

- **No tests-pass criterion.** The tests and skill-file check are a gate every pull request meets, so no row carries them as a criterion.
- **I17 reopened.** Its AC1 is unticked again until E01's fixes are in the extraction commit's history.
6. **SOLID guidelines first.** Artifact and protocol files are classes, and linked operations are method calls that encapsulate each file's state. A new W01 lands SOLID guidelines fitted to that model in the skill's guidelines, drafted in [e01/solid-guidelines.md](e01/solid-guidelines.md). The audit becomes W02 and measures against them. The fix rows become W03 to W05.

## E02 Skill Style, 2 November 2026

The user's decisions:

1. **Purpose.** [I17:E02](https://github.com/m2ux/workflow-server/issues/1616) gives the skill the file style its prosiform form needs: the groundwork for prosiform compliance. It takes priority, with `priority: 7`.
2. **Reference, style only.** The example under prosiform's `example/` is an older, stale work-planner. E02 takes its formatting and file shape and none of its content. No `technical-debt.md`, no new protocols; protocol extraction is a SOLID concern for E01's audit.
3. **Not yet.** Prerequisites sections stay. No prosiform frontmatter and no `pf` instruction.
4. **Link marks included.** ↳ for a mode, ⇉ for a sub-agent dispatch, ⫽ for parallel dispatch, ¬ for a deferred document.
5. **Per-skill section model.** The shared guidelines and the other skills keep their shape. work-planner declares its model in its own guidelines, `structure.json` and `rules.json`, and the shared checker reads each skill's declared model.
6. **Rows.** W01 is the section model and checker. W02 builds rules, conventions and configuration from the live SKILL.md and guidelines. W03 restyles the modes and W04 the protocols. W05 to W07 restyle the artifacts in three file groups: issue and bodies; board, queue, planning and review; delivery, branch and pull request. W02 depends on W01, and W03 to W07 depend on W02 and run in parallel.
7. **Order.** E01 waits for E02: E01's W01 depends on E02, so the SOLID guidelines and the audit work on the restyled skill. The extraction waits for E02 as well.

Planning decisions:

- **Numbering.** E02 runs before E01 but keeps the next free number, since E01 was already published.
