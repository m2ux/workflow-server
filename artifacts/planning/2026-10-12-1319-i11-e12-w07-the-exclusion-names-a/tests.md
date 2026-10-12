# Test Record

Checks run for W07, against base `67fe12ad` and revision `a8f177ae`. Every run is from the unit's worktree, with the scripts under `scripts/sbx`.

```bash
python3 -m unittest discover -s skills/test -p test_check_skill_files.py
python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/gitnexus skills/server-in-the-loop
```

## T1 Procedure Citation

A specimen whose h2 `Procedure` cites a specification of its own `## Commands` listing, with one further file citing the same specification. The holding file counts as a caller, the specification has two, and the check reports nothing.

- `test_a_procedure_of_the_holding_file_counts_as_a_caller` — passed.
- The live case it stands for: `skills/workflow-canon/references/revise-mode.md#check-skill-summaries`, cited from step 5 of that file's Procedure and from `coverage.md:130`, draws no finding at either revision.

**Result:** ✓

## T2 Sibling Specification

A specimen catalog, h1 `Commands`, whose `### Close issue` cites `### Fetch issue` of the same listing, with one further file citing `### Fetch issue`. The sibling citation does not make the catalog a caller, so the specification has one caller and is reported.

- `test_a_sibling_specification_of_a_catalog_is_not_a_caller` — passed, reporting `command specification with one caller`.

**Result:** ✓

## T3 Reference Prose and a Rules Bullet

Two specimens outside a catalog. One states the citation in a `## Checks` passage of reference prose, the other in a `## Rules` bullet; each has one further file citing the specification. Neither section runs the command, so the holding file is not a caller and each specification is reported.

- `test_reference_prose_of_the_holding_file_is_not_a_caller` — passed.
- `test_a_rules_section_of_the_holding_file_is_not_a_caller` — passed.

**Result:** ✓

## T4 Procedure Sub-Section

A specimen whose `## Procedure` holds an h3 `### Open` carrying the citation, with one further file citing the specification. A Procedure section runs to the next heading of its level or above, so the step counts and the specification stands.

- `test_a_step_under_a_procedure_sub_section_counts_as_a_caller` — passed.

**Result:** ✓

## T5 Shared Check Suite

The whole suite of the shared check, over seeded specimen skills in a temporary tree.

```text
Ran 49 tests in 0.016s

OK
```

The base carried 45 tests. The case asserting that any citation from the holding file suppresses the finding is replaced by the five specimens above, so the suite gains four.

**Result:** ✓

## T6 The Check Over Every Skill

The check over `skills/work-planner`, `skills/workflow-canon`, `skills/gitnexus` and `skills/server-in-the-loop`, at the base and at this revision.

| Revision | Files | Findings |
| --- | --- | --- |
| `67fe12ad` | 64 | 31 |
| `a8f177ae` | 64 | 51 |

Every finding of the base stands at this revision; none is dropped. The twenty added are the twenty entries in the [suppression table](suppressions.md), each a specification a catalog or a reference file holds although exactly one procedure elsewhere runs it: eleven in `work-planner/references/commands.md`, five in `workflow-canon/references/canon-context.md` and four in `workflow-canon/references/change-surface.md`.

Findings per file at this revision:

| File | Findings |
| --- | --- |
| `work-planner/references/commands.md` | 36 |
| `workflow-canon/references/canon-context.md` | 8 |
| `workflow-canon/references/change-surface.md` | 6 |
| `gitnexus/gitnexus-cli/SKILL.md` | 1 |

The 50 command-specification findings over work-planner and workflow-canon are the scope W08 moves.

**Result:** ✓
