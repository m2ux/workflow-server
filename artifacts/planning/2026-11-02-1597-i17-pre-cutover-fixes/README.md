# Pre-Cutover Fixes — November 2026

> Planning record · Created 2026-11-02

## Executive Summary

This record plans I17, which delivers every Work Planner skill fix found before the skill's cutover into workflow-server's `workspace` branch, ahead of I16's extraction of the skill to prosiform-skills. One epic, Pre-Cutover Fixes, holds each fix as a task row, and a fault found later joins it as a further row. Skill Style (E02) and Skill Separation (E01) prepare the skill for its new home, and Delivery Lanes (E03) adds the lanes a workspace needs before the extraction.

It matters because I16 moves the skill with its content unchanged, and workflow-server then drops its copy. A fix merged after the extraction is cut would reach only the copy that is dropped, so I16's extraction row waits on this epic.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Decisions](decisions.md) | The user's decisions, the planning decisions taken from them, and the departures from the skill |
| [Goal trace](goal-trace.md) | The goal clauses traced to the criteria and the epic, the ranked gaps and the outside threats |
| [Review](review.md) | Each review finding and its resolution |
| [Dependency report](dependencies.txt) | The dependency, joins, contention and priority report |
| [I17 body](bodies/i17.md) | The initiative body as saved |
| [E00 body](bodies/e00.md) | The epic body as saved |
| [E00 W01](e00/w01.md) | Planning commits directly to engineering |
| [E00 W02](e00/w02.md) | Not-planned epic leaves its initiative |
| [E00 W03](e00/w03.md) | Board sync removes uncited not-planned items |
| [E00 W04](e00/w04.md) | Sync reads every linked pull request |
| [E01 SOLID guidelines](e01/solid-guidelines.md) | The SOLID guidelines draft E01 W01 lands |
| [E03 body](bodies/e03.md) | The Delivery Lanes epic body as saved |
| [E03 W01](e03/w01.md) | Work item declares an optional lane |
| [E03 W02](e03/w02.md) | Delivery plan admits units by lane |
| [E03 W03](e03/w03.md) | Joined rows share one lane |
| [E03 W04](e03/w04.md) | Dependency check reads lanes, refuses split units |
| [E03 W05](e03/w05.md) | Available-work survey filters units by lane |
| [E03 W06](e03/w06.md) | Deliver mode passes the requested lane |
| [E03 W07](e03/w07.md) | Plan mode proposes each row's lane |
| [E03 W08](e03/w08.md) | Board queue reports Ready units' lanes |
| [E03 W09](e03/w09.md) | Board-queue script prints Ready unit lanes |
| [E03 W10](e03/w10.md) | Advance mode reports Ready units' lanes |

## Links

| Resource | Link |
| --- | --- |
| Initiative | [I17](https://github.com/m2ux/workflow-server/issues/1597) |
| Pre-Cutover Fixes | [I17:E00](https://github.com/m2ux/workflow-server/issues/1598) |
| Skill Separation | [I17:E01](https://github.com/m2ux/workflow-server/issues/1615) |
| Skill Style | [I17:E02](https://github.com/m2ux/workflow-server/issues/1616) |
| Delivery Lanes | [I17:E03](https://github.com/m2ux/workflow-server/issues/1625) |
| The initiative waiting on the lane filter | [m2ux/prosiform I10](https://github.com/m2ux/prosiform/issues/464) |
| The cutover this initiative precedes | [m2ux/prosiform-skills I16](https://github.com/m2ux/prosiform-skills/issues/1) |
| The extraction row that waits on it | [m2ux/prosiform-skills I16:E00](https://github.com/m2ux/prosiform-skills/issues/2) |
| Skill at the planned revision | [workspace@785a5ee8c](https://github.com/m2ux/workflow-server/tree/785a5ee8c715b802498aa41712e0489425a22cfa/skills/work-planner) |
| Board | [Process: How Work Is Planned and Delivered](https://github.com/users/m2ux/projects/17) |
