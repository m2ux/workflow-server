## Overview

Work Planner is a general-purpose skill, and one rule in it holds for this project alone: an epic whose tasks change workflow definitions must carry a corpus audit criterion. This epic gives the skill a general statement that a project may require criteria of its epics, a declaration the project fills in, and moves the corpus audit into this project's declaration, so the guide states the mechanism and the project states its own answer.

## Problem

- **One project's doctrine is stated as the skill's law.**
  The Corpus Audit section of the Work Breakdown Guide fixes the criterion's wording, the row's name and the audit that evidences it. A project with no definition corpus meets a rule it cannot satisfy and cannot switch off.
- **The engine matches this project's vocabulary.**
  `format.py` decides an epic's compliance by searching its criteria for the phrase `canon audit`. A general-purpose check tests for a term only this project uses.
- **The parameterisation stops at the branch.**
  `Check Format` takes `--corpus`, so the branch the corpus lives on is a project value. The meaning attached to that branch is not, which made the rule read as general when it is not.
- **The skill already has the seam this rule should have used.**
  A project states its long-lived branches in `config/branches` at its root. The guide states the rule, reports the names unevaluable when the file is absent, and names this project's values only under a labelled Example.

## Proposal

- **A project declares the criteria its epics must carry.**
  The guide states that a project may require a criterion of an epic whose rows reach a named branch, and where the project declares it. Which criterion, and on which branch, is the project's to state.
- **A declared criterion carries what the check needs to report it.**
  The condition that triggers it, the criterion's text, a phrase identifying it in an epic that already carries it, and the name of the row that delivers it.
- **An absent declaration is unevaluable, never defaulted.**
  A project declaring nothing neither acquires this project's corpus audit nor silently loses a requirement it meant to state, which is how `config/branches` already reports a missing statement.
- **The corpus audit becomes this project's declaration.**
  Its substance is unchanged and this repository's epics carry it exactly as they do now. What changes is where it is stated, and that `format.py` carries no vocabulary of its own.

## Work Breakdown

| Task | Description | Coverage | Depends on | Joins | Done |
| --- | --- | --- | --- | --- | --- |
| W01 | A project declares the criteria its epics carry | AC1 | | | |
| W02 | The format check reads the declaration | AC2 | W01 | | |
| W03 | The corpus audit moves to this project's declaration | AC3 | W02 | | |

## Acceptance Criteria

- [ ] **AC1.** A project states the criteria an epic must carry when its rows reach a named branch, in a declaration the guide names, and a project stating none leaves the requirement unevaluable rather than unmet, as the skill's fixture suite checks against a project declaring one and a project declaring none.
- [ ] **AC2.** The format check reports an epic that omits a criterion its project declares, by the identifying phrase that declaration carries and by no term of its own, as the skill's fixture suite checks against two projects whose declarations differ.
- [ ] **AC3.** No criterion a single project requires stands in the skill's guide, as the format check reports the same requirement over this repository's epics with the declaration in place and reports none for a project declaring nothing.

## References

- **R1.** [Planning record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-13-i11-e13-project-variance) — the shape chosen for the declaration, the options weighed, and what each costs.
- **R2.** [Long-lived branch declaration](https://github.com/m2ux/workflow-server/blob/workspace/config/branches) — the seam this epic follows, and the reporting of an absent statement it copies.
- **R3.** [Work Breakdown Guide](https://github.com/m2ux/workflow-server/blob/workspace/skills/work-planner/references/work-breakdown.md) — the Corpus Audit section whose doctrine moves, and the branch declaration rule beside it.
