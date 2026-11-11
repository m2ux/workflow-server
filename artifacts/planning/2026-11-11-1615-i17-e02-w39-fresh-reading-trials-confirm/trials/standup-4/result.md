# Standup: Process board (project 17), since 2026-11-04, all initiatives

## Result

Completed. Standup Mode ran end to end: scope selected (board 17 from theme-board.txt), delivery taken as current from the caller checkpoint (no initiative needed a Sync refresh), fetch steps served by the captured items/prs/links snapshots and status field 422017304, report composed with progress.py, management paragraph written and the final report rendered with --summary. Stopped nowhere.

## Report

~~~
*Progress since Wed 4 Nov*

This week moved the cutover-readiness initiative much closer to its goal of landing every known skill fix before the planning skill moves to a repository of its own. Every skill file now follows a single checked writing style, which lays the groundwork for compliance with the new authoring format. Delivery can be split into separate lanes so that independent work runs side by side, failed deliveries now recover to a confirmed draft or a clear merge outcome rather than an uncertain state, and published plans are confirmed as saved together with their parent context. Most of the work to separate the skill's responsibilities also landed, so each kind of work now plugs into the skill through one registry instead of being named throughout its files.

Board: https://github.com/users/m2ux/projects/17

*Initiatives*
🔄 *I17 Cutover Readiness:* Every Known Skill Fix Lands Before the Extraction — https://github.com/m2ux/workflow-server/issues/1597

*Completed*
✅ *I17:E01 Skill Style* — https://github.com/m2ux/workflow-server/issues/1616
    ✅ W01 Per-skill style model and checker — https://github.com/m2ux/workflow-server/pull/1640
    ✅ W02 Rules, conventions and configuration files — https://github.com/m2ux/workflow-server/pull/1642
    ✅ W03 Modes in the new style — https://github.com/m2ux/workflow-server/pull/1643
    ✅ W04 Protocols in the new style — https://github.com/m2ux/workflow-server/pull/1644
    ✅ W05 Issue and body artifacts in the new style — https://github.com/m2ux/workflow-server/pull/1646
    ✅ W06 Board, queue, planning and review artifacts restyled — https://github.com/m2ux/workflow-server/pull/1651
    ✅ W07 Delivery, branch and pull-request artifacts restyled — https://github.com/m2ux/workflow-server/pull/1647
    ✅ W08 Activate the Work Planner style model — https://github.com/m2ux/workflow-server/pull/1652
    ✅ Skill Style: The Groundwork for Prosiform Compliance — https://github.com/m2ux/workflow-server/pull/1641
🔄 *I17:E02 Skill Separation* — https://github.com/m2ux/workflow-server/issues/1615
    ✅ W01 SOLID guidelines, Fields and read-context boundaries — https://github.com/m2ux/workflow-server/pull/1656
    ✅ W11 Automatic answers follow saved queue evidence — https://github.com/m2ux/workflow-server/pull/1663
    ✅ W12 Diagram fidelity governs readable size — https://github.com/m2ux/workflow-server/pull/1664
    ✅ W13 Review findings follow the approved scope — https://github.com/m2ux/workflow-server/pull/1666
    ✅ W14 Kind registration names interface operations — https://github.com/m2ux/workflow-server/pull/1668
    ✅ W15 One script registry maps kinds to modules — https://github.com/m2ux/workflow-server/pull/1671
    ✅ W16 Hot-fix module implements the kind interface — https://github.com/m2ux/workflow-server/pull/1671
    ✅ W17 Board script owns title tag parsing — https://github.com/m2ux/workflow-server/pull/1667
    ✅ W18 Dependency Graph fields hold shapes only — https://github.com/m2ux/workflow-server/pull/1669
    ✅ W19 Required Criteria field holds the declaration — https://github.com/m2ux/workflow-server/pull/1670
    ✅ W20 Hot-fix supplies the registered interface operations — https://github.com/m2ux/workflow-server/pull/1680
    ✅ W21 Hot-fix Body owns body population — https://github.com/m2ux/workflow-server/pull/1682
    ✅ W22 Align Mode names no individual kind — https://github.com/m2ux/workflow-server/pull/1679
    ✅ W23 Board artifact names no individual kind — https://github.com/m2ux/workflow-server/pull/1677
    ✅ W24 deliver.py reaches kinds through the registry — https://github.com/m2ux/workflow-server/pull/1683
    ✅ W26 sync.py reaches kinds through the registry — https://github.com/m2ux/workflow-server/pull/1674
    ✅ W28 format.py reaches kinds through the registry — https://github.com/m2ux/workflow-server/pull/1678
    ✅ W29 agent_review.py reaches kinds through the registry — https://github.com/m2ux/workflow-server/pull/1673
    ✅ W30 dispatch.py names no individual kind — https://github.com/m2ux/workflow-server/pull/1672
    ✅ W31 orphans.py reaches kinds through the registry — https://github.com/m2ux/workflow-server/pull/1675
    ✅ W32 Tasks declare every file they change — https://github.com/m2ux/workflow-server/pull/1684
    ✅ W33 Remaining scripts reach kinds through the registry — https://github.com/m2ux/workflow-server/pull/1687
    ✅ W34 Modes and protocols reach kinds through registration — https://github.com/m2ux/workflow-server/pull/1686
    ✅ W35 General artifacts name no kind — https://github.com/m2ux/workflow-server/pull/1685
    ✅ W36 Board Status artifact, Board Delivery and Hot-fix callers — https://github.com/m2ux/workflow-server/pull/1689
    ✅ W37 Detect Fields behavior and prerequisite violations — https://github.com/m2ux/workflow-server/pull/1692
    ✅ W40 Kinds supply their review rule — https://github.com/m2ux/workflow-server/pull/1690
    ✅ W41 Script patterns and test imports have one definition — https://github.com/m2ux/workflow-server/pull/1691
✅ *I17:E03 Delivery Lanes* — https://github.com/m2ux/workflow-server/issues/1625
    ✅ W01 Work item declares an optional lane — https://github.com/m2ux/workflow-server/pull/1626
    ✅ W02 Task table carries the lane column — https://github.com/m2ux/workflow-server/pull/1628
    ✅ W03 Work item holds its component declaration — https://github.com/m2ux/workflow-server/pull/1628
    ✅ W04 Joined rows share one lane — https://github.com/m2ux/workflow-server/pull/1629
    ✅ W05 Dependency check reads task table lanes — https://github.com/m2ux/workflow-server/pull/1629
    ✅ W06 Lane cells validate and survive table writes — https://github.com/m2ux/workflow-server/pull/1629
    ✅ W07 Delivery plan admits units by lane — https://github.com/m2ux/workflow-server/pull/1632
    ✅ W08 Available-work survey filters units by lane — https://github.com/m2ux/workflow-server/pull/1632
    ✅ W09 Deliver mode passes the requested lane — https://github.com/m2ux/workflow-server/pull/1634
    ✅ W10 Plan mode writes task row lanes — https://github.com/m2ux/workflow-server/pull/1633
    ✅ W11 Board queue reports Ready units' lanes — https://github.com/m2ux/workflow-server/pull/1637
    ✅ W12 Board-queue script prints Ready unit lanes — https://github.com/m2ux/workflow-server/pull/1637
    ✅ W13 Advance mode reports Ready unit lanes — https://github.com/m2ux/workflow-server/pull/1638
    ✅ W14 Cross-epic joins receive bounded diagnostics — https://github.com/m2ux/workflow-server/pull/1635
    ✅ Delivery Lanes: Each Task Row Carries Its Lane — https://github.com/m2ux/workflow-server/pull/1627
✅ *I17:E04 Delivery Failure Recovery* — https://github.com/m2ux/workflow-server/issues/1654
    ✅ W01 Confirm draft state after failed hot-fix readiness — https://github.com/m2ux/workflow-server/pull/1657
    ✅ W02 Explicit merge outcomes and permission boundaries — https://github.com/m2ux/workflow-server/pull/1658
    ✅ W03 Epic continuation follows the merge outcome — https://github.com/m2ux/workflow-server/pull/1658
    ✅ Delivery Failure Recovery: Verified Draft and Merge Outcomes — https://github.com/m2ux/workflow-server/pull/1660
✅ *I17:E05 Plan Publication* — https://github.com/m2ux/workflow-server/issues/1655
    ✅ W01 Confirm epic and parent publication sequence — https://github.com/m2ux/workflow-server/pull/1661
    ✅ Plan Publication: Confirm Saved Epic and Parent Context — https://github.com/m2ux/workflow-server/pull/1662

*In progress*
🔄 *I17:E02 Skill Separation* — https://github.com/m2ux/workflow-server/issues/1615
    📝 Skill Separation: Ownership and Bounded Context — https://github.com/m2ux/workflow-server/pull/1659

*Next*
• Nothing

*Key*
I=Initiative, E=Epic, W=Work Item, F=Hot-fix
✅ done · 🔄 in progress · 👀 in review · 📝 draft · ▶️ ready
~~~

## Unresolved findings

- None. No unresolved initiatives, no off-board dependencies, no unreadable Work Breakdowns; progress.py wrote nothing to stderr.

## Files

- report.txt (final report), summary.txt (management paragraph), draft.txt (first render without paragraph) in this folder.
