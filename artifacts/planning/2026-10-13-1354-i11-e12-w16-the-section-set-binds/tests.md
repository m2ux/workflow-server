# W16 — Test Evidence

Both checks were run in the unit's worktree at `.worktrees/i11-e12-w16`, on branch `i11/e12/w16-the-section-set-binds`, under `scripts/sbx`.

## T1 — The check's own suite

Observes AC17 of [I11 E12](https://github.com/m2ux/workflow-server/issues/1319): the section set, its order and the Procedure heading applied to a file carrying a procedure outside a mode file, and not applied to a file carrying none.

```text
python3 -m unittest discover -s skills/test -p test_check_skill_files.py
Ran 63 tests in 0.023s
OK
```

The suite carries seven cases for the widened rule:

- `test_a_reference_file_carrying_a_procedure_takes_the_set` — a reference file whose only top-level section is `Phases`, carrying a numbered step, is reported for the section outside the set and for the missing Procedure.
- `test_a_reference_file_whose_sections_are_the_set_reports_nothing` — the same file with `Procedure` reports nothing.
- `test_a_reference_file_carrying_a_procedure_needs_no_rules` — Prerequisites and Procedure alone report nothing, so Rules is not demanded of a file that is not a mode.
- `test_a_reference_file_with_sections_out_of_order_is_reported` — Rules before Procedure is reported.
- `test_a_file_carrying_no_procedure_carries_any_section` — a file whose sections are outside the set and which carries no step reports nothing.
- `test_a_step_under_a_sub_section_selects_the_file` — a step under a sub-heading selects the top-level section that holds it, as the caller rule already reads it.
- `test_the_entry_point_keeps_its_own_structure` — a SKILL.md carrying a numbered step reports nothing, because the entry point's structure is named elsewhere in the guidelines.

## T2 — The shared check over every skill

Observes AC17 of [#1319](https://github.com/m2ux/workflow-server/issues/1319): every skill file carrying a procedure takes the named sections in the named order.

```text
python3 skills/scripts/check_skill_files.py skills/gitnexus skills/server-in-the-loop skills/work-planner skills/workflow-canon
gitnexus/gitnexus-cli/SKILL.md:12: command specification in the entry point — analyze — Build or refresh the index
gitnexus/gitnexus-cli/SKILL.md:27: command specification in the entry point — status — Check index freshness
gitnexus/gitnexus-cli/SKILL.md:35: command specification in the entry point — clean — Delete the index
gitnexus/gitnexus-cli/SKILL.md:48: command specification in the entry point — wiki — Generate documentation from the graph
gitnexus/gitnexus-cli/SKILL.md:65: command specification in the entry point — list — Show all indexed repos
gitnexus/gitnexus-cli/SKILL.md:82: inline bold lead too wide — 119 characters, limit 100
64 files checked, 6 findings
```

- **No section finding over 64 files.**
  Every file carrying a procedure takes the named set and its order.
- **The six that remain are the six the run reported before this change.**
  All of them sit in `gitnexus/gitnexus-cli/SKILL.md`: five command specifications in an entry point and one over-wide bold lead. They are a command-placement and a layout finding, not a section finding, and the gitnexus skills are not written to the shared guidelines.

## Suites run beside them

- `skills/work-planner/test` — 302 tests, OK.
- `skills/workflow-canon/test` — 76 tests, 38 failures, every one of them the fixture refusing to run without `CANON_TEST_ENGINE` naming an engine with its installed `yaml` package. The gate is environmental, and this change touches no audit script.
