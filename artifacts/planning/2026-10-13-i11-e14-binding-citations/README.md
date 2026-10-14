# Binding Citations — October 2026

> Planning record · Created 2026-10-13

## Executive Summary

Work Planner and Workflow Canon carry 680 internal citations between them, and the form that says when one is loaded is stated nowhere. Both skills already use that form: the entry point states that the selected mode's file is read in full before its links are followed, and each mode file's Prerequisites states that the command conventions are read before its first specification. What is missing is the rule behind it, and the default for a step whose preceding text says nothing. The shared guidelines type a selection link the reader chooses from and a prerequisite citation in the form `Read [Name](target) first.`, and neither covers the common case: a citation mid-sentence inside a procedure step, naming the guide whose rule the step must satisfy. Work Planner states none of its 550 in the prerequisite form.

It matters because a step that reads as complete without its citation gets performed without it, and the skill cannot tell afterwards that the rule went unread. The cost of a stated obligation is paid in reference scope: 150 of the citations across the two skills name a whole file, so an obligation on them would pull entire mode files into a reader that needed one section. This record holds the decision to state the timing in the text preceding a set of citations, to bind a step's citation where that text says nothing, to make a whole-file citation carry the case that calls for it and to read it in every case where it carries none, to spell a whole-document read as the file's own title anchor so the structure carries the scope rather than a declaration, and to turn the gate on only once both skills comply.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [Decisions](decisions.md) | The targets a reading rule serves, the obligation a citation carries, how scope is bounded, how the read set is derived, and the order the gate lands in |
| [Sample mode file](sample-plan-mode.md) | Plan mode rewritten under every rule the epic states, for review before the work starts |

## Links

| Resource | Link |
| --- | --- |
| Initiative I11 Work Planner | [#1166](https://github.com/m2ux/workflow-server/issues/1166) |
| Shared skill guidelines | [guidelines.md](https://github.com/m2ux/workflow-server/blob/workspace/skills/guidelines.md) |
| Shared skill-file check | [check_skill_files.py](https://github.com/m2ux/workflow-server/blob/workspace/skills/scripts/check_skill_files.py) |
| Skill layout, which placed each specification | [#1319](https://github.com/m2ux/workflow-server/issues/1319) |
