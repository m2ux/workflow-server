# W22 Test Evidence

Head `86f0bc04acff5882fe21ba3a929fa718f8b2299f` on `i11/e10/w22-canon-conventions-reached-without`, which carries `origin/i11/e10/workspace` at `00ce33566`. Base for the negative runs: `707c1bb24f605f2a164f2bb32d134e209f4fa1e6`, with the head's test file copied into a detached worktree. Every command runs from the unit worktree under `sbx`.

## T1

Retrieval walk over each Workflow Canon mode (AC28): `python3 -m pytest skills/test/test_check_skill_files.py -q -k CanonConventionsReach`.

- **Head.**  3 passed, 4 subtests passed.
- **Base.**  Author and Audit fail the walk, and the entry point holds no Conventions section.

The walk retrieves SKILL.md and the mode file whole, then each section a required citation in a retrieved part reaches, to closure. The last column lists the files the skill-wide conventions' citations alone open.

| Mode | Files opened at head | Opened for the conventions alone |
| --- | --- | --- |
| Author | SKILL.md, audit-dispatch, audit-mode, author-mode, canon-context, change-surface, design-flow, planning, reporting | none |
| Audit | SKILL.md, audit-dispatch, audit-mode, canon-context, canon-map, change-surface, planning, reporting | none |
| Review | SKILL.md, canon-context, coverage, planning, review-mode, templates/integration-review | none |
| Revise | skills/guidelines, SKILL.md, canon-context, guidelines, planning, review-mode, revise-mode | none |

| Mode | Files opened at base | Opened for the conventions alone |
| --- | --- | --- |
| Author | as head, plus command-conventions | command-conventions |
| Audit | as head, plus command-conventions | command-conventions |
| Review | SKILL.md, command-conventions, coverage, planning, review-mode, templates/integration-review | none |
| Revise | skills/guidelines, SKILL.md, command-conventions, guidelines, planning, revise-mode | none |

- **Review and Revise at base.**  Both opened command-conventions for Run Project Check, so the conventions cost them nothing extra there.
- **Review and Revise at head.**  Run Project Check is now a recognized specification, so its existing citation of Canon Check Conventions counts as reach and opens a canon-context section. Revise reaches Run Project Check in review-mode through its Run Skill Checks specification. Revise opens one file more than at base, the measured cost of placing the specification with its one caller. Author and Audit each open one fewer.

## T2

Run Project Check placement (AC29): `python3 -m pytest skills/test/test_check_skill_files.py -q -k CanonRunProjectCheck`.

- **Head.**  4 passed: under Canon's declared `*-mode.md` structure, a specification in its caller's Commands is recognized once with no finding; one away from its one caller is reported; a second-level section outside Commands is no specification; Workflow Canon holds it once, in review-mode.md, with review-mode.md its only caller and no finding.
- **Base.**  The Workflow Canon run fails: no Run Project Check specification is recognized.

## T3

Shared and work-planner suites: `python3 -m pytest skills/test skills/work-planner/test -q`.

- 857 passed, 1 skipped, 1837 subtests passed.
- At `8b35508fd` the base itself failed 18 shared-suite tests: two finding kinds unregistered in `KINDS`, and interface fixtures holding a specification nothing cites. This branch fixed both (`a72af28d5`); #1576 landed the same registration on the base, and the merge at the head takes the base's.

## T4

Shared check over every skill, as the Verify skills gate runs it: `python3 skills/scripts/check_skill_files.py skills/workflow-canon skills/work-planner skills/server-in-the-loop skills/gitnexus`.

- 81 files checked, 0 findings. `git diff --check` clean.

## Not Run

- **Workflow Canon's own suite.**  It needs an engine checkout in `CANON_TEST_ENGINE`. The change touches no Canon script, template or fixture, and no Canon test reads the moved prose.
