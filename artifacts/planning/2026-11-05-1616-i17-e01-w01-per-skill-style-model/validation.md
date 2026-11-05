# Validation

## Tested Revision

Task head `3a73f75ba250942869d0f407990efc2b3b7869bc`, based on `03d353300ca4804194fd50d316d73e3bf1270d1d`. Source changes are limited to the shared checker and its test module. Both task commits preserve the installed document and declaration trees.

## Shared Checker Suite

`python3 -m unittest discover -s skills/test`: 255 tests passed, no skips. The suite includes the existing 208 tests and 47 new declared-model tests. It verifies accepted complete specimens and rejected declarations, headings, preambles, contract links, invocation wrappers, fenced commands, misplaced commands and call verbs.

Nested syntax tests cover literal Markdown headings and fences in HTML, HTML inside a fenced template, shell quoting, broken or unbold argument links, and actual versus specimen contract/REST-gap evidence. Direct tree, skill and subdirectory CLI runs apply the same declared model; distinct skill models remain isolated. The specimen invocation is neutral and carries none of the reference example's tool content. See [full shared-suite log](shared-tests.txt).

## Work Planner Suite

`python3 -m unittest discover -s skills/work-planner/test`: 923 tests, 922 passed and one opt-in live check skipped. This is the complete local Work Planner suite at the task head. See [full log](planner-tests.txt). No external workflow or paid model evaluation is claimed.

## Work Planner Check

`python3 skills/scripts/check_skill_files.py skills/work-planner`: 55 files checked, zero findings. See [checker output](planner-check.txt). The installed model remains selected until the final adoption task.

## Installed Tree Regression

The complete `skills/` check reports 81 files and 68 inherited findings outside Work Planner. Its output is byte-for-byte identical to [the captured baseline](baseline-check.txt); see [current output](tree-check.txt). The user confirms Work Planner-only acceptance, so those inherited findings are regression evidence and do not gate this task. Other skill files and the shared guide are byte-identical to the epic base, verified by `git diff --exit-code` over those paths.

## Guidelines and Reading Paths

The source uses one lexical scanner for Markdown fences and HTML invocation boundaries. Typed declaration validation, heading procedures, field contracts, calls and interfaces have separate focused checks and reuse existing finding and citation ownership. Source review found no remaining duplicated boundary parser, project-name special case, new dependency, validation bypass or transitional dual-style model.

No agent reading path changes: installed Markdown files, links and model declarations retain their bytes. The checker docstring documents the permanent model API. The new model is exercised in temporary specimens; no live disclosure walk or token-saving measurement is claimed.
