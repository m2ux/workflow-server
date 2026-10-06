# Retrospective I04 Membership — October 2026

> Initiative planning record · Created 2026-10-06

## Executive Summary

Between 2 and 6 October 2026, nineteen pull requests merged to `workflow-server` without an initiative reference in the title. Five of them pay down cost the definitions and the server carry, which is what [I04](https://github.com/m2ux/workflow-server/issues/706) exists to do, and so should have been planned and delivered as its work. This record holds the evaluation of every candidate, the measurements behind each verdict, and where each admitted pull request now sits in the plan.

Two of the five land in epics the initiative already carries. The other three deliver a class the initiative never stated — a check that reports a defect the corpus does not carry, and a walk model that reads fewer steps than the definitions hold — and open E10.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Assessment](assessment.md) | Every pull request merged 2–6 October, its changes, and the membership verdict |
| [Measurements](measurements.md) | The sweep and suite runs behind each tick |

## Verdicts

| Pull request | Changes | Home |
| --- | --- | --- |
| [#1118](https://github.com/m2ux/workflow-server/pull/1118) | The declared-values guard counts a cited member roster | E10 W01 |
| [#1144](https://github.com/m2ux/workflow-server/pull/1144) | The `inherited-input-never-spent` catalogue entry | E09 W00 |
| [#1145](https://github.com/m2ux/workflow-server/pull/1145) | That entry's Detect, Fires-on and sibling boundaries | E09 W00 |
| [#1155](https://github.com/m2ux/workflow-server/pull/1155) | Three guards turned green by closing findings no branch introduced | E07 W01 |
| [#1158](https://github.com/m2ux/workflow-server/pull/1158) | The activity-loop walk model reads every body step | E10 W02 |

Fourteen further pull requests were read and left outside the initiative. [Assessment](assessment.md) states the reason for each.

## What this leaves open

- **The branch split that hid two of the five.**
  The corpus branch's CI runs the guard sweep and the option-coverage walk; the server suite runs on `main` against the corpus `workflows` serves. A corpus change that falsifies a server test passes its own branch's checks and turns `main` red with nothing on `main` having changed. #1158 names this as the reason twenty failing tests went unnoticed and fixes the failures, not the split. No criterion in I04 holds it, and no epic takes it.
- **E07's review-mode gating criterion.**
  AC2 reads "the review-mode-gating guard reports no findings against the corpus". The sweep reports it clean, and it does so because the guard's `ACCEPTED_HEADLESS_AUTO_ADVANCE` list suppresses three checkpoints — the list the epic's W02 exists to clear. The criterion is satisfied by the suppression it means to remove.

## Links

| Resource | Link |
| --- | --- |
| Technical Debt initiative | [#706](https://github.com/m2ux/workflow-server/issues/706) |
| Red Guards | [#1116](https://github.com/m2ux/workflow-server/issues/1116) |
| Unspent Inputs | [#1138](https://github.com/m2ux/workflow-server/issues/1138) |
| I04 replan record | [2026-10-03-706-i04-replan](../2026-10-03-706-i04-replan/README.md) |
| Unspent inputs record | [2026-10-05-706-unspent-inputs](../2026-10-05-706-unspent-inputs/README.md) |
