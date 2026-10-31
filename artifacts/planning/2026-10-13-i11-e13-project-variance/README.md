# Project Variance — October 2026

> Planning record · Created 2026-10-13

## Executive Summary

Work Planner is a general-purpose skill. One rule in it is not general: an epic whose tasks change workflow definitions must carry a corpus audit criterion, delivered by a last row named `Canon audit of the changed definitions`, evidenced by the canon audit's coverage report. The branch the corpus lives on is a project value, passed to the format check as `--corpus`. Everything else about the rule — the criterion's wording, the row's name, the audit that evidences it, and the literal phrase `canon audit` that `format.py` matches to decide compliance — is workflow-server's answer written into the skill's law.

It matters because the skill already has the seam this rule should have used. A project states its long-lived branches in `config/branches` at its root; the guide states the general rule, reports the names unevaluable when the file is absent, and names workflow-server only under a labelled Example. The corpus audit rule ignored that precedent, so a reader of the guide meets one project's vocabulary as though every project shared it, and a project with no definition corpus has a rule it cannot satisfy and cannot switch off. This record holds the decision to give the skill a general declaration a project fills in, and to move the corpus audit into this project's declaration.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [W02 declaration reader](w02.md) | Read required criteria at the evaluated commit |
| [Decisions](decisions.md) | The shape chosen for the declaration, the options weighed, and what each costs |

## Links

| Resource | Link |
| --- | --- |
| Initiative I11 Work Planner | [#1166](https://github.com/m2ux/workflow-server/issues/1166) |
| Long-lived branch declaration | [config/branches](https://github.com/m2ux/workflow-server/blob/workspace/config/branches) |
| Work Breakdown Guide | [work-breakdown.md](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/work-breakdown.md) |
| The corpus audit criterion as delivered | [#1359](https://github.com/m2ux/workflow-server/pull/1359) |
