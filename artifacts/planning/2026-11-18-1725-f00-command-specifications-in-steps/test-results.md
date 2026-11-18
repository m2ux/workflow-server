# F00 Test Results

Branch `f00-command-specifications-in-steps` at fbecce7d8, cut from `workspace` at a70671a73 and merged with `workspace` at 3ea815122. workflow-canon and skills/gitnexus carry no change against `workspace`.

## T1. Shared Commands Rules

`skills/guidelines.md` at fbecce7d8:

- Commands > **In the step that runs it.** states that a specification one step runs is written in that step, with its description, template and detail, its `○` inputs and `●` output and no link to it, and that no file takes a Commands section. One several steps run, a step of another file runs, or other text links to, is an operation of its own its callers Apply, with no numbered step heading.
- Commands > **One spec per operation.** names an operation's sub-section, a single-step command by its plain title in the step's line, and each of several by its bold title.
- Procedure files > **Top-level sections.** lists Prerequisites, Procedure, Reference and Rules; Files > **References.** declares no `specifications` or `keeps_commands` option.

`scripts/sbx python3 -m unittest discover -s skills/test` at fbecce7d8: 305 tests, OK. Covers AC1.

## T2. Commands Section and Specifications Key Refused

`scripts/sbx python3 -m unittest discover -s skills/test` at fbecce7d8: 305 tests, OK, among them:

- `test_a_commands_section_is_reported_wherever_it_stands` and `test_a_commands_section_is_refused_in_a_heading_model`: a `## Commands` section in an entry point, a catalog, a mode file and an artifact is reported as `Commands section`; `test_a_guides_commands_rules_are_no_commands_section` leaves a guide's Commands rules alone.
- `test_a_specifications_key_is_refused` and `test_malformed_models_fail_closed_before_file_validation`: a Sections table declaring `specifications` or `keeps_commands` exits 1 as an unreadable structure.

`scripts/sbx python3 skills/scripts/check_skill_files.py skills` at fbecce7d8: 87 files checked, 45 findings, each in workflow-canon, which keeps its Commands sections out of scope. No other skill carries a `## Commands` section, and no Sections table declares `specifications`. Covers AC2.

## T3. Work Planner

At fbecce7d8:

- `cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test`: 1197 tests, OK, 1 skipped.
- `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 65 files, 0 findings. The check reads each step's commands with their `○` and `●` links, one contract per command, and applies the Apply verb to every operation specification.
- Placement: 55 specifications one step runs are that step's text, the step's line naming each by its plain title and a step running several opening each with its bold title; 64 are operations their callers Apply. `--compare a70671a73 HEAD skills/work-planner` reports the 55 as removed headings and their steps as differing by the added text.
- Text preservation, against a70671a73: each specification's body stands in its step or operation unchanged but for the bold title on a body a step shares, `Apply` for `Run` on a link to an operation specification, the Compare Section Bodies description restating the own-text comparison, the Open Task Pull Request detail naming Review Hot-fix Before Merge without its link, and the Validate Lane Unit sentence moved from a step into Check Dependencies.

Covers AC3.

## T4. Server-in-the-Loop and the Vendored Skills

At fbecce7d8:

- `scripts/sbx python3 skills/scripts/check_skill_files.py skills/server-in-the-loop`: 3 files checked, 0 findings. Its entry point holds Modes, Rules, Conventions and Dependencies; references/loop-mode.md holds the procedure with each command in its step, under the Sections table of references/guidelines.md.
- skills/guidelines.md Files > **Vendored.** states that the gitnexus skills under `skills/gitnexus/` stand outside the guidelines and the shared check. A run over skills/ checks none of their files, and naming `skills/gitnexus/gitnexus-cli` checks 0 files, as `test_a_vendored_skill_stands_outside_the_check` shows.

Covers AC4.
