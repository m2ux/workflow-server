# Binding Citations — October 2026

> Planning record · Created 2026-10-13

## Executive Summary

Work Planner and Workflow Canon carry 680 internal citations between them, and nothing states what a reader owes one. The entry point of each skill tells its reader to follow a mode file's links "as each step needs them", which leaves the obligation to the reader's judgment on each of the 550 and 130 links the two skills hold. The shared guidelines type two kinds of link — a selection link the reader chooses from, and a prerequisite citation in the form `Read [Name](target) first.` — and neither covers the common case: a citation mid-sentence inside a procedure step, naming the guide whose rule the step must satisfy. Work Planner states none of the 550 in the prerequisite form, so every citation it carries is untyped.

It matters because a step that reads as complete without its citation gets performed without it, and the skill cannot tell afterwards that the rule went unread. The cost of making every citation binding is paid in reference scope: 150 of the citations across the two skills name a whole file, so a binding obligation on them would pull entire mode files into a reader that needed one section. This record holds the decision to make a citation binding by default, to spell a whole-document read as the file's own title anchor so the structure carries the scope rather than a declaration, and to turn the gate on only once both skills comply.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Decisions](decisions.md) | The obligation a citation carries, how scope is bounded, and the order the gate lands in |

## Links

| Resource | Link |
| --- | --- |
| Initiative I11 Work Planner | [#1166](https://github.com/m2ux/workflow-server/issues/1166) |
| Shared skill guidelines | [guidelines.md](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md) |
| Shared skill-file check | [check_skill_files.py](https://github.com/m2ux/workflow-server/blob/workspace/skills/scripts/check_skill_files.py) |
| Skill layout, which placed each specification | [#1319](https://github.com/m2ux/workflow-server/issues/1319) |
