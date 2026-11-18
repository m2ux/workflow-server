# F00 Test Results

Branch `f00-command-specifications-in-steps` at 32d3b188b, cut from `workspace` at a70671a73 and merged with `workspace` at 3ea815122.

## T1. Shared Commands Rules

`skills/guidelines.md` at 32d3b188b:

- Commands > **In the step that runs it.** states that a specification sits in the procedure step that runs it, with its description, template and detail and its `○` inputs and `●` output, and that no file takes a Commands section. A specification several steps run, or a step of another file runs, is an operation of its own in the procedure section of the file owning its subject.
- Procedure files > **Top-level sections.** lists Prerequisites, Procedure, Reference and Rules; Files > **References.** declares no `specifications` or `keeps_commands` option. SKILL.md > **Commands.** keeps the entry point free of any Commands section.

`scripts/sbx python3 -m unittest discover -s skills/test` at 32d3b188b: 285 tests, OK. Covers AC1.

## T2. Commands Section and Specifications Key Refused

`scripts/sbx python3 -m unittest discover -s skills/test` at 32d3b188b: 285 tests, OK, among them:

- `test_a_commands_section_is_reported_wherever_it_stands`: a `## Commands` section in SKILL.md, a catalog, a mode file and an artifact is each reported as `Commands section`.
- `test_a_commands_section_is_refused_in_a_heading_model`: a Commands section in a heading-model artifact is reported.
- `test_a_guides_commands_rules_are_no_commands_section`: a guide's Commands rules are not reported.
- `test_a_specifications_key_is_refused`: a Sections table declaring `specifications` exits 1 with `artifacts has unknown options: specifications`; `test_malformed_models_fail_closed_before_file_validation` refuses `specifications` and `keeps_commands` alike.
- `test_a_specification_in_its_running_step_stands`, `test_an_operation_several_steps_run_may_be_one_specification` and `test_a_command_in_the_step_running_it_stands`: a specification in its step, or as an operation several steps run, reports nothing.

`grep -rln '^## Commands' skills --include=*.md` at 32d3b188b names only `skills/guidelines.md` and `skills/workflow-canon/references/guidelines.md`, each a guide's Commands rules. No Sections table declares `specifications`. Covers AC2.

## T3. Converted Skills

At 32d3b188b:

- `cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test`: 1197 tests, OK, 1 skipped.
- `CANON_TEST_ENGINE=<engine> scripts/sbx python3 -m unittest discover -s skills/workflow-canon/test`: 76 tests, OK. The engine is the `.project/main` checkout's guards, src, scripts and schemas with an installed `node_modules`; an engine lacking either fails the three `test_audit_scope` tests, as at a70671a73.
- `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 65 files, 0 findings.
- `scripts/sbx python3 skills/scripts/check_skill_files.py skills/workflow-canon`: 18 files, 15 findings, none a Commands section: 12 `convention in both guides`, 2 `parallel section in another mood` in coverage.md and 1 `link to the entry point` in review-mode.md, each standing at a70671a73. The two `command specification nothing cites` findings there go with their kind.
- `scripts/sbx python3 skills/scripts/check_skill_files.py skills/gitnexus`: no Commands section. Its 39 findings are 37 sections outside the entry-point set, the five command sections among them, and two layout findings; at a70671a73 the same file carried a Commands section outside the set and five specifications in the entry point.
- Text preservation, against a70671a73: each of work-planner's 119 specifications stands with its title and body unchanged; workflow-canon's 55 differ only by indentation, heading marks, a title becoming a bold label and local link targets; gitnexus-cli's 5 differ only by heading level. Every link resolves, as the skill-file check's `unresolved anchor` reports none.

Covers AC3.
