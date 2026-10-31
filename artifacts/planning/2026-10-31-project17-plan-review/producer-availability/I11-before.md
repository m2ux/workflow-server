## Overview

Agent-engineering work in this repository is planned, tracked and delivered through one skill. A request to propose work, break it down, review a plan, bring it in step with what has landed, or hand out what is ready is served by a mode of that skill, and the issues it writes are the plan. Every initiative stands on its theme's board, every criterion states one invariant a named instrument can fail, and a board can be read as a standup or walked for the work it makes available.

## Problem

The scheme that plans every other piece of work is the one body of work with no plan.

- **Requirements held outside the plan.**
  The skill was built by directive across many pull requests. What was required of it is held in the session transcripts and the specification drawn from them, so a change to the skill is checked against an intent only where the plan answers to that specification.
- **No criteria to check against.**
  Nothing states what the skill must achieve, so a regression in one mode is caught only when someone notices the output is wrong.
- **Rules the skill states but nothing checks.**
  The conventions binding the skill's own files — its frontmatter, its command specifications, its prose layout, its vocabulary — are prose, so conformance rests on whoever remembers them.
- **Work outside any structure.**
  Issues raised against the skill sit in the tracker with no initiative above them, so they reach no board view and no dependency check.
- **A complete epic waits on a click.**
  Its review pull request stays a draft until the user marks it ready, though every condition for that mark is one the delivery scripts already establish.
- **A theme with no home.**
  The scheme is engineering process, not the definition product the existing themes describe, so its work has nowhere to stand.

## Proposal

- **One initiative over the scheme.**
  The skill's delivered work and its open work are planned as epics of a single initiative, on a board of its own theme.
- **The specification is the source.**
  The requirements drawn from the sessions in which the scheme was argued stand as one document, and the initiative's criteria answer to it in both directions.
- **Criteria over the whole scheme.**
  Each criterion states an outcome the modes achieve together, kept by the skill's fixture suite or by a check run over the repository's live issues and boards.
- **Every house rule reaches a check.**
  A rule a script can decide is reached through a named operation, the skill's own files included, so conformance is measurable across the tracker and across the skill at once.
- **Delivery settles what the board and the review show.**
  A completed epic's review pull request stands for user review once completion checks and agent review of its current integration head and base pass without blocking findings; delivery statuses account for reservations and open work.
- **The open work joins the structure.**
  Issues raised against the skill become tasks of an epic, or take the standalone layout where no goal covers them.

- **The interface follows capability.**
  Use REST for operations REST supports and current GraphQL for everything REST cannot do, including reads and writes, without a one-off exception. Command specifications identify the REST capability gap; project operations use Projects V2, never deprecated Projects (classic) fields, types or mutations.

- **Delivery integrates each epic.**
  Task branches start from and their pull requests target the corresponding epic base, named `iNN/eNN/<long-lived-branch>`. Dependent tasks start after their prerequisites are delivered into that base.
- **Each epic reaches its long-lived targets.**
  A completed epic integrates each base into its corresponding configured long-lived branch after validation, current-head-and-base agent review and required human approval. An epic remains open until every base merges; other incomplete epics do not prevent its integration unless they are prerequisites.

- **One final comparison owns retrieval non-regression.**
  Binding Citations owns the no-increase verdict for the remaining layout work against pinned baseline `04de875a8517dcf229462e3b939099e16ffe3e63`. Earlier layout records and conformance-task measurements supply evidence; a measurement alone does not establish a pass.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/1167) | Planner Skill | AC1, AC8, AC17 | | ✓ |
| [E01](https://github.com/m2ux/workflow-server/issues/1168) | Issue Prose | AC2 | [E00](https://github.com/m2ux/workflow-server/issues/1167) | ✓ |
| [E02](https://github.com/m2ux/workflow-server/issues/1169) | Acceptance Criteria | AC3, AC11 | [E00](https://github.com/m2ux/workflow-server/issues/1167) | ✓ |
| [E03](https://github.com/m2ux/workflow-server/issues/1170) | Theme Boards | AC4 | [E00](https://github.com/m2ux/workflow-server/issues/1167) | ✓ |
| [E04](https://github.com/m2ux/workflow-server/issues/1171) | Board Progress | AC5 | [E03](https://github.com/m2ux/workflow-server/issues/1170) | ✓ |
| [E05](https://github.com/m2ux/workflow-server/issues/1172) | Delivery Sync | AC6, AC12 | [E00](https://github.com/m2ux/workflow-server/issues/1167) | ✓ |
| [E06](https://github.com/m2ux/workflow-server/issues/1173) | Plan Review | AC7 | [E02](https://github.com/m2ux/workflow-server/issues/1169), [E03](https://github.com/m2ux/workflow-server/issues/1170), [E05](https://github.com/m2ux/workflow-server/issues/1172) | ✓ |
| [E07](https://github.com/m2ux/workflow-server/issues/1174) | Proposal Funnel | AC10 | [E03](https://github.com/m2ux/workflow-server/issues/1170) | ✓ |
| [E08](https://github.com/m2ux/workflow-server/issues/1175) | Available Work | AC9, AC13 | [E02](https://github.com/m2ux/workflow-server/issues/1169), [E03](https://github.com/m2ux/workflow-server/issues/1170), [E05](https://github.com/m2ux/workflow-server/issues/1172) | ✓ |
| [E09](https://github.com/m2ux/workflow-server/issues/1176) | Board Rules | AC4 | | |
| [E10](https://github.com/m2ux/workflow-server/issues/1181) | Conformance Checks | AC12, AC14, AC15, AC16, AC18, AC20, AC21, AC22, AC23, AC24 | | |
| [E11](https://github.com/m2ux/workflow-server/issues/1249) | Plan Reading | AC25, AC26, AC27, AC28 | | ✓ |
| [E12](https://github.com/m2ux/workflow-server/issues/1319) | Skill Layout | AC19, AC29 | | ✓ |
| [E13](https://github.com/m2ux/workflow-server/issues/1373) | Project Variance | AC31 | | |
| [E14](https://github.com/m2ux/workflow-server/issues/1427) | Binding Citations | AC30, AC32, AC33 | | |
| [E15](https://github.com/m2ux/workflow-server/issues/1430) | Delivery Signals | AC4, AC34 | | ✓ |
| [E16](https://github.com/m2ux/workflow-server/issues/1474) | Evidence Capture | AC35 | | |
| [E17](https://github.com/m2ux/workflow-server/issues/1482) | Epic Review | AC34, AC36 | | |

## Acceptance Criteria

- [x] **AC1.** Every mode the skill offers is named in its summary and stated in a file of its own, as the skill's fixture suite checks each mode bullet.
- [x] **AC2.** Every agent-engineering issue body conforms to its kind's template and to the scheme's prose rules, as the format check reports over the repository's open issues.
- [x] **AC3.** Every acceptance criterion the skill writes states one invariant that an instrument it names can fail, as the format check reports over the repository's open issues.
- [ ] **AC4.** Each initiative and its epics stand on the board of their theme, at the status their issues' state implies, as the board check reports over the repository's linked boards.
- [x] **AC5.** A board reads as a standup summary in which each item carries one mark for its state, as the skill's fixture suite checks the summary it produces.
- [x] **AC6.** No Work Breakdown row records a state its pull requests and its criteria do not support, as the skill's fixture suite checks against pull request and issue fixtures.
- [x] **AC7.** A review reports every criterion no epic covers, every work-breakdown cell that disagrees with its delivery, and every criterion a merged pull request leaves unmet, as the skill's fixture suite checks against plans carrying each fault.
- [x] **AC8.** Work raised outside the structure reaches an initiative, an epic, a task or the standalone layout with nothing it recorded lost, as the skill's fixture suite checks the candidates and placements it lists.
- [x] **AC9.** A board hands out the work it makes available, each dispatch carrying the brief the skill holds, as the skill's fixture suite checks the queue it plans.
- [x] **AC10.** A proposal is raised and tracked on a board of its own until it is approved, as the format check reports over the repository's open proposals.
- [x] **AC11.** An initiative's criteria agree with the sources it marks, in both directions, as the review pass reports over the repository's open initiatives.
- [ ] **AC12.** Delivery pull requests follow the task-to-epic-base and epic-base-to-long-lived-branch routes stated in Proposal, as pull-request fixtures verify valid and invalid targets.
- [x] **AC13.** A row a session holds links that session's planning artifacts for as long as it holds it, as the skill's fixture suite checks the reservations it plans.
- [ ] **AC14.** An identifier that delivered work carries is unchanged by a renumbering, as the skill's fixture suite checks the renumbering it plans.
- [ ] **AC15.** A pull request delivering initiative work names in its title the epic it delivers, as the format check reports over the repository's initiative pull requests.
- [ ] **AC16.** A dependent task starts from its epic base after its prerequisite tasks are delivered into that base, as delivery fixtures verify met and unmet task dependencies.
- [ ] **AC17.** A body of work the skill plans leaves a planning record holding the decisions its criteria rest on, as the review pass reports over the repository's open initiatives.
- [ ] **AC18.** The skill's description carries a trigger phrase for every mode it offers, as the skill's fixture suite checks the frontmatter against the mode summary.
- [x] **AC19.** Every command the skill runs is specified once, in the file whose procedure runs it where one procedure runs it, as the shared skill-file check reports over the skill's files.
- [ ] **AC20.** Every house rule a script can decide is reached through a named operation rather than left to prose, as the skill's fixture suite checks each rule against a plan carrying its fault.
- [ ] **AC21.** A convention binding every skill in the repository stands in the shared guide alone, as the skill's fixture suite checks the shared guide against the skill's own.
- [ ] **AC22.** One term names each concept across the skill's instructions, references and scripts, as the skill's fixture suite checks the vocabulary of its files.
- [ ] **AC23.** The skill's prose holds the layout its authoring guide states — one line per paragraph and list item, markdown links, and a bold lead labelling its sentence — as the skill's fixture suite checks its files.
- [ ] **AC24.** Every GitHub command specification conforms to the interface capability policy stated in Proposal, as the interface fixture suite verifies allowed and forbidden operations.
- [ ] **AC25.** A merged pull request's passed test plan settles the epic criteria its checks observe, as the skill's fixture suite shows against a plan with and without the tick.
- [ ] **AC26.** A pull request written to an earlier test-plan shape is brought current by an alignment, and an unreadable plan is reported as unreadable, as the skill's fixture suite shows.
- [ ] **AC27.** A References entry citing a private repository is reported when the issue is public, as the skill's fixture suite shows.
- [ ] **AC28.** Every Work Breakdown row is read by its task id, whatever its Task cell links, so each dependency and Joins entry naming a row the table carries resolves to it, as the dependency check reports over the repository's open epics.
- [x] **AC29.** A reader finds each kind of content in the skill at a fixed location — a mode's sections, a command's specification and a shared convention each where its kind is stated to sit — as the shared skill-file check reports over the skill's files.
- [ ] **AC30.** Every matched retrieval scenario opens no more distinct instruction files than the pinned baseline stated in Proposal, as the final disclosure comparison records using one instrument and identical scenario inputs on both revisions.
- [ ] **AC31.** A rule that holds for one project alone is stated by that project and read by the skill, as the skill's fixture suite checks a plan whose project declares the rule and one whose project declares nothing.
- [ ] **AC32.** Every citation in the skill's instructions names the section its reader must hold, as the shared skill-file check reports over the skill's files.
- [ ] **AC33.** A step the skill's instructions bind to a cited rule is performed with that rule's content, as the citation-efficacy record holds for each scenario whose outcome a broad read cannot reach.
- [ ] **AC34.** A completed epic's review pull request stands for user review when completion checks and the current agent-review gate pass, as delivery fixtures demonstrate for passing, missing, stale and blocking review evidence.
- [ ] **AC35.** The evidence a sync run decides on is produced by a command the skill names rather than assembled by hand, as the skill's fixture suite checks each capture against the operation that calls it.

- [ ] **AC36.** An epic handoff carries agent review evidence identifying its current integration head and base, as delivery-procedure fixtures demonstrate.

## Non-Goals

- It does not plan work outside agent engineering.
- It does not carry out the work it plans.
- It does not decide which theme an initiative belongs to.
- It does not replace the tracker or the project boards as the record of where work stands.
- It does not set a throughput, latency or capacity target for the skill's own runs.


## References

- **R1.** **Source.** [Current Work Planner requirements](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-31-project17-plan-review/current-requirements.md) — The current requirement statements, supersession map, delivery ownership and explicitly unresolved source decision.
- **R2.** [Work Planner Retrospective](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-06-work-planner-retrospective) — The sessions behind the specification, and how they were selected.
- **R3.** [Work Planner](https://github.com/m2ux/workflow-server/tree/workspace/skills/work-planner) — The skill, its modes, its command specs and its fixture suite.
- **R4.** [Historical requirements and provenance](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-31-project17-plan-review/source-reconciliation/requirements-before.md) — The original requirement register and meeting links, interpreted through the current marked source.
