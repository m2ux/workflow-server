# Skill Separation Component Rows — November 2026

> Epic plan revision · Created 2026-11-09

## Executive Summary

The completed ownership audit of I17:E02 left three broad fix rows: general prose naming kinds, general scripts branching on kinds, and rule ownership with bounded prerequisite reads. This record splits them into one row per implementation component, each with its own criterion, its observing regressions and a work item declaring the one file it extends, so the delivery survey can dispatch them and parallel rows never share a component.

The split follows the audit's component map. A kind registration in the entry point and one script registry come first; hot-fix artifacts and module supply the interface operations; every general file then reaches kinds only through them. Shared executable rules get one home each, with priority interpretation taken from #1631. The Board Status extraction, the checker and the retained-preparation route move after their new producers, and fresh reading trials close the route verification.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [w14.md](w14.md) | W14 work item: Kind registration names interface operations |
| [w15.md](w15.md) | W15 work item: One script registry maps kinds to modules |
| [w16.md](w16.md) | W16 work item: Hot-fix module implements the kind interface |
| [w17.md](w17.md) | W17 work item: Board script owns title tag parsing |
| [w18.md](w18.md) | W18 work item: Dependency Graph fields hold shapes only |
| [w19.md](w19.md) | W19 work item: Required Criteria field holds the declaration |
| [w20.md](w20.md) | W20 work item: Hot-fix supplies the registered interface operations |
| [w21.md](w21.md) | W21 work item: Hot-fix Body owns body population |
| [w22.md](w22.md) | W22 work item: Align Mode names no individual kind |
| [w23.md](w23.md) | W23 work item: Board artifact names no individual kind |
| [w24.md](w24.md) | W24 work item: deliver.py reaches kinds through the registry |
| [w25.md](w25.md) | W25 work item: board-queue.py reaches kinds through the registry |
| [w26.md](w26.md) | W26 work item: sync.py reaches kinds through the registry |
| [w27.md](w27.md) | W27 work item: progress.py reaches kinds through the registry |
| [w28.md](w28.md) | W28 work item: format.py reaches kinds through the registry |
| [w29.md](w29.md) | W29 work item: agent_review.py reaches kinds through the registry |
| [w30.md](w30.md) | W30 work item: dispatch.py names no individual kind |
| [w31.md](w31.md) | W31 work item: orphans.py reaches kinds through the registry |
| [w32.md](w32.md) | W32 work item: Deliver Mode reaches kinds through registration |
| [w33.md](w33.md) | W33 work item: Hoist Mode reaches kinds through registration |
| [w34.md](w34.md) | W34 work item: Unit Dispatch reaches kinds through registration |
| [w35.md](w35.md) | W35 work item: Issue Delivery reaches kinds through registration |
| [w36.md](w36.md) | W36 work item: Task Merge reaches kinds through registration |
| [w37.md](w37.md) | W37 work item: Issue Closure names no individual kind |
| [w38.md](w38.md) | W38 work item: Delivery Plan units name no kind |
| [w39.md](w39.md) | W39 work item: Delivery Branches kind-free with bounded fields |
| [w40.md](w40.md) | W40 work item: Delivery Brief kind-free with bounded fields |
| [w41.md](w41.md) | W41 work item: Dispatch Batch names no individual kind |
| [w42.md](w42.md) | W42 work item: Board Queue artifact names no individual kind |
| [w43.md](w43.md) | W43 work item: Pull Request artifact names no individual kind |
| [w44.md](w44.md) | W44 work item: Agent Review names no individual kind |
| [w45.md](w45.md) | W45 work item: Standup Report names no individual kind |
| [w46.md](w46.md) | W46 work item: statuses.py kind-free with one identity |
| [w47.md](w47.md) | W47 work item: Board Status artifact and transformations |
| [w48.md](w48.md) | W48 work item: Board Delivery calls the status operations |
| [w49.md](w49.md) | W49 work item: Hot-fix uses the extracted status contract |
| [w50.md](w50.md) | W50 work item: Hot-fix module exports only its interface |
| [w51.md](w51.md) | W51 work item: Detect Fields behavior and prerequisite violations |
| [w52.md](w52.md) | W52 work item: Retained preparations select verified worktree reuse |
| [w53.md](w53.md) | W53 work item: Fresh reading trials confirm bounded entry routes |
| [joins.md](joins.md) | Candidate units of one component that stay split, and why |
| [changes.md](changes.md) | The change list this run applied or held |
| [decisions.md](decisions.md) | Split decisions: numbering, test catalogue contention, dropped edges, criterion split |
| [deps.log](deps.log) | Dependency and numbering check over the saved body |
| [survey.log](survey.log) | Delivery survey after the save |
| [epic-draft.md](epic-draft.md) | The epic body this run saved |

## Links

| Resource | Link |
| --- | --- |
| Epic | [I17:E02](https://github.com/m2ux/workflow-server/issues/1615) |
| Audit record | [W02 audit](../2026-11-06-1615-i17-e02-w02-audit-ownership-fields-and/) |
| Upstream priority capability | [#1631](https://github.com/m2ux/workflow-server/issues/1631) |
