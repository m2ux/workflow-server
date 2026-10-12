# Work Planner Skill Layout — October 2026

> Planning record · Created 2026-10-12

## Executive Summary

Work Planner states 79 command specifications in a single 870-line catalog, 30 percent of the skill's markdown, and all ten of its mode files link into that catalog to reach the handful of operations their procedures run. Thirty-one of those specifications have exactly one caller. The sibling skill, workflow-canon, carried out the same restructure in October 2026: specifications moved to the files whose procedures run them, the shared conventions became a file of their own, and the shared guidelines gained the rules that keep the layout in place. This record holds the decisions that apply those lessons to Work Planner, as epic E12 of initiative I11.

It matters because the guidelines now state rules the skill does not follow, and because two of those rules are decidable by a script that already exists. A rule stated in prose and checked by whoever remembers it is the fault I11 was raised to fix. Extending `skills/scripts/check_skill_files.py` with a rule for a misplaced command specification and a rule for a stray top-level section makes the layout measurable across every skill in the repository at once, so the restructure holds after the session that made it.

## Decisions

- **Vehicle: a new epic, not tasks under E10.**
  E10 Conformance Checks already owns AC19, AC21 and AC23 and would have absorbed this work without argument. A separate epic was chosen so the layout change states its own criteria and carries its own breakdown, rather than arriving as rows under an epic scoped to checks.
- **AC19 moves to E12, restated.**
  It read "specified once and reached by its operation name, as the skill's fixture suite checks each mode file's command links", which asserts a single catalog. Localisation keeps "specified once" and retires the catalog reading, so the criterion now names the file whose procedure runs the command, and names the shared check as its instrument. E10's Coverage drops it.
- **The instrument is the shared check, not a work-planner fixture.**
  Both new rules are added to `skills/scripts/check_skill_files.py`, which binds every skill in the repository. workflow-canon already conforms to both, so the cost is bounded, and gitnexus is measured rather than assumed.
- **Scope stops at work-planner and the shared check.**
  Extending the check turns gitnexus red. Those findings are hoisted as their own issue rather than carried by this epic, which would otherwise take on a skill that has had no guideline review at all.
- **The catalog survives, smaller.**
  Thirty-one specifications have one caller and move; forty-eight have several and stay. Work Planner keeps a catalog where workflow-canon dissolved one, because the shared rule holds a catalog to be correct where most of its entries have several callers.

## Joins

[Check Dependencies](https://github.com/m2ux/workflow-server/blob/fae97e9e/skills/work-planner/references/commands.md#check-dependencies) prints one eligible pair in E12: W02 and W03. Neither depends on the other, and they do not share a pull request.

- **W02 redistributes 870 lines across seventeen files.**
  Its review is a comparison of every moved specification against its original. The workflow-canon restructure corrupted four specifications in exactly this move, and the damage was found only by reading the files, after a link check, 71 tests and a structural check had all passed over it. That diff is read on its own.
- **W03 renames two sections and fixes three layout faults.**
  Landing it inside W02's diff would hide it. It is a small, separately reviewable change against files W02 also touches, and it follows W02 rather than joining it.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [e12.md](e12.md) | The drafted epic body, the source for every later edit to the issue |

## Links

| Resource | Link |
| --- | --- |
| I11 Work Planner | https://github.com/m2ux/workflow-server/issues/1166 |
| I11:E10 Conformance Checks | https://github.com/m2ux/workflow-server/issues/1181 |
| Workflow Canon command localisation | https://github.com/m2ux/workflow-server/pull/1296 |
| Canon audit matrices record | https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-11-canon-audit-matrices |
