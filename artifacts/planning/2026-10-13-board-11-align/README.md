# Board 11 Alignment — October 2026

> Alignment pass · Created 2026-10-13

## Executive Summary

The Mechanical board's three open debt initiatives — I13 Corpus Debt, I14 Instrument Debt and I15 Server Debt — were aligned against their templates, the review criteria and their delivery. Format is clean across all three initiatives and every open epic bar three rows; the departures are in what the tables claim about delivery, in the criteria the initiatives restate from their epics, and in ten review pull requests held ready while their epics are incomplete.

Twelve rows linked a merged pull request while a criterion in their Coverage stayed unticked. Each was verified against its own epic base rather than ticked on the strength of the merge. Three hold and are ticked; nine do not, and four of those share one cause: the shared libraries declare required inputs their own operations never read, which no workflow that borrows them can reach. That residue is now I13 E05.

## Verification

Every criterion was observed against the epic base that carries its work, not against the integration tip, since none of these epics has merged.

| Issue | Criteria | Instrument | Result |
| --- | --- | --- | --- |
| #1138 | AC1, AC2, AC3 | `check-inherited-input-never-spent` against `i13/e01/workflows` | Fail — 39 findings, 4 in workflow-authoring, 3 in cicd-pipeline-security-audit, 5 in work-package |
| #708 | AC1, AC2, AC4 | `check-role-barred-calls` against `i14/e04/workflows` | Fail — the guard does not load, see Guard imports |
| #708 | AC3 | `check-declared-fallbacks` against `i14/e04/workflows` | Fail — 4 violations, all in `corpus/meta/techniques/workflow-engine` |
| #710 | AC1, AC2, AC4 | `batch-loop-walk` and `batched-dispatch` on `i15/e01/main` against the `workflows` tip | Pass — 23 tests, ticked |
| #750 | AC12 | `gate-differential` against `i15/e02/workflows` | Fail — 30 gates disagree with their structured originals |
| #1242 | AC3 | A live sidecar walk | Not observable without a running instance |

## The library residue

With each workflow's own inputs sourced, the inherited-input guard reports 39 sites on the E01 base, every one inheriting one of three declarations: `session_index` from the workflow-engine library (23 sites across eight namespaces), `work_goal` from orchestration-patterns (12 sites across two), and `evaluation_report` from prism-evaluate's resolve-findings (4 sites). The same library holds the four inputs the fallback check reports.

A workflow sourcing its own inputs cannot reach a slot its library declares, so the residue survives every per-workflow fix. I13 E05 takes the three inputs and the four fallbacks, which is what makes #1138 AC1–AC3 and #708 AC3 reachable.

## Guard imports

`check-role-barred-calls.ts` fails to load on its own epic base: `'../src/loaders/core-ops.js' does not provide an export named 'CORE_ORCHESTRATOR_TECHNIQUES'`. The I14 E04 W01 row already depends on I14 E07 W01, the guard-imports task, so the edge is sound and the numbering is what disagrees with it.

## Decisions

| Decision | Taken |
| --- | --- |
| Ten review pull requests heading epic bases were ready while their epics had undelivered rows | Converted to draft: #1381, #1382, #1383, #1387–#1390, #1397–#1399 |
| Twelve unmet rows could be ticked on the merge or verified | Verified each against its epic base; three ticked, nine left unticked with the measurement recorded |
| The library residue could sit in a new epic, in rows on two epics, or be excluded by narrowing the criteria | A new epic under Corpus Debt, #1410, owning `corpus/meta` and the prism-evaluate declaration |
| Three rows added tests for criteria their epic covered elsewhere, and carried no Coverage | Each epic gained a criterion for the test that row adds, cited from the row |
| I13 restated seven of its epics' criteria | Raised to seven criteria stating what the epics achieve together, with the Coverage cells remapped |
| The 131 task pairs that could share a pull request | Named in [Separate deliveries](joins.md), each delivering on its own |
| Red Trunk was to be renumbered below Missing Checks | Refused by the script: a pull request names E03, E04 and E06, and work a pull request names keeps its number. The guard-imports row moved to E04, the epic that owns its inputs |
| I15 E02 had ticked AC2 and AC3 while 29 steps still carried a structured condition | Both unticked, AC12 restated as the outcome alone, AC15 added for the differential harness W04 delivered, and W05 added to convert the 29 |
| Thirty-six merged pull requests link no issue | Each checked against its row: none delivers a row that has a task issue, so none is owed a link. #948 W04 and W05 now link #1274 and #1275, which their rows omitted |
| Ten epic base commits name I04 | Left as they are; each base squash-merges, so the pull request title is what lands on the long-lived branch |
| #1300 targeted `workspace` with no epic base | `i14/e06/workspace` cut and #1300 retargeted at it, merging cleanly |
| #723 is claimed by I14 E03 W01 and W02 and by the closed I05 E02 W02 | I14 E03's rows cite commit `dbb69ddc` instead, leaving the closed epic untouched |
| I13 E01 and E05 would each wait for the other | E01's AC1-AC3 narrowed to inputs each workflow declares, which its merged rows delivered. The corpus-wide statement stays on the initiative's AC3, cited by both epics, and E01's AC9 is retired |
| Review References cite task merges that git cannot show | Kept. The bases were rebuilt as one squashed commit each, so sync reports `merged none` on every one until it merges |
| I14 E07's criteria were out of sequence | Renumbered to AC1-AC3, with #1404's test plan relabelled |
| No reference carries the Source marker | Left unmarked. Every reference is background, and each criterion stands on the instrument it names |

## Corrections

I14 AC7, AC8 and AC13 were first read as restatements of single epic criteria. AC13 states what E06 achieves across its three harnesses where E06's own criteria are per-harness, and AC7 and AC8 each stand above four of E03's. Only I13 carried duplicates.

The I15 E01 corpus share was first read as stranded, because its two merges are contained in no integration branch and no `i15/e01/workflows` base exists. The branch-separation record states that `i04/e03/workflows` was absorbed — #1187 and #1194 changed only lines later epics rewrote — and its validation shows the aggregate tree reproducing the integration tree with no residual diff. The epic legitimately carries one base, and the three criteria were verified against the `workflows` tip.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Findings](findings.md) | Every departure the pass found, by area, with the measurement behind it |
| [Separate deliveries](joins.md) | The 131 task pairs that could share a pull request and do not, and why each delivers on its own |

## Links

| Resource | Link |
| --- | --- |
| Board | https://github.com/users/m2ux/projects/11/views/4 |
| Corpus Debt | https://github.com/m2ux/workflow-server/issues/1379 |
| Instrument Debt | https://github.com/m2ux/workflow-server/issues/1380 |
| Server Debt | https://github.com/m2ux/workflow-server/issues/1378 |
| Library Inputs | https://github.com/m2ux/workflow-server/issues/1410 |
| Branch separation | https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-10-12-706-i04-branch-separation/README.md |
