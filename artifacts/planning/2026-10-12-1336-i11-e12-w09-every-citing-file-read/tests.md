# Test Record

Checks run for W09, against base `b2fb799b` and revision `23ce2ab4`. Every run is from the unit's worktree, with the scripts under `scripts/sbx`.

```bash
python3 -m unittest discover -s skills/test -p test_check_skill_files.py
python3 skills/scripts/check_skill_files.py skills/work-planner skills/workflow-canon skills/gitnexus skills/server-in-the-loop
```

## T1 A Sibling Specification in Another File

A specimen catalog holding `### Fetch issue`, and a second file whose own `## Commands` listing carries a specification citing it. A specification names a sibling to say where the companion operation is stated, so the citation is not a call, the specification has no caller, and it stands.

- `test_a_sibling_specification_in_another_file_is_not_a_caller` — passed, reporting nothing.
- Its counterpart in the holding file keeps reporting: `test_a_sibling_specification_of_a_catalog_is_not_a_caller` — passed.

**Result:** ✓

## T2 Reference Prose in Another File

A specimen catalog, and a second file whose `## Checks` passage names the specification in prose. The passage runs nothing, so the file is not a caller and the specification stands.

- `test_reference_prose_in_another_file_is_not_a_caller` — passed, reporting nothing.
- Its counterpart in the holding file keeps reporting: `test_reference_prose_of_the_holding_file_is_not_a_caller` — passed.

**Result:** ✓

## T3 A Procedure Under a Heading of Its Own Name

A specimen whose `## Delivery` carries a numbered step citing a specification of its own `## Commands` listing, with one further procedure citing the same specification. `Delivery` is a procedure, so the holding file counts as a caller and the specification stands.

- `test_a_procedure_under_a_heading_of_its_own_name_counts_as_a_caller` — passed.
- The live cases it stands for: `work-breakdown.md`'s Task Merge under `## Delivery`, and `review-passes.md`'s `## Ordering Pass`.

**Result:** ✓

## T4 That Procedure in Another File

A specimen catalog, and a second file whose `## Ordering Pass` carries a numbered step citing the specification. The section is a procedure wherever it stands, so the file is the specification's one caller and the catalog is reported.

- `test_a_procedure_under_a_heading_of_its_own_name_in_another_file_is_a_caller` — passed, reporting `command specification with one caller`.

**Result:** ✓

## T5 A Procedure Heading Over Prose

A specimen whose `## Procedure` is a bullet of guidance about procedure steps, naming a specification in another file. The heading names no steps, so the section runs nothing and the specification stands.

- `test_a_procedure_heading_over_prose_runs_no_command` — passed, reporting nothing.
- The live case it stands for: `work-planner/references/guidelines.md#procedure`, a bullet stating that a sub-bullet under a numbered step is in sentence case.

**Result:** ✓

## T6 A Specification in the Entry Point

A specimen `SKILL.md` carrying a `## Commands` listing, with one procedure elsewhere running the specification. The entry point holds no command of its own, so the specification is reported there whatever cites it.

- `test_a_specification_in_the_entry_point_is_reported` — passed, reporting `command specification in the entry point` and nothing else.

**Result:** ✓

## T7 Shared Check Suite

The whole suite of the shared check, over seeded specimen skills in a temporary tree.

```text
Ran 55 tests in 0.019s

OK
```

The base carried 49 tests and all 49 stand. The six added are T1 to T6. Every specimen citing a specification from another file states that citation as a procedure step, since the caller test now asks the same question of that file as of the holding one.

**Result:** ✓

## T8 The Check Over Every Skill

The check over `skills/work-planner`, `skills/workflow-canon`, `skills/gitnexus` and `skills/server-in-the-loop`, at the base and at this revision. The skills' own files are unchanged by this unit, so the difference is the rule's.

| Revision | Files | Findings |
| --- | --- | --- |
| `b2fb799b` | 64 | 51 |
| `23ce2ab4` | 64 | 50 |

Findings per file:

| File | `b2fb799b` | `23ce2ab4` |
| --- | --- | --- |
| `work-planner/references/commands.md` | 36 | 42 |
| `workflow-canon/references/canon-context.md` | 8 | 2 |
| `workflow-canon/references/change-surface.md` | 6 | 0 |
| `gitnexus/gitnexus-cli/SKILL.md` | 1 | 6 |

Each difference is the symmetric test:

- **Six added in `commands.md`.**  A sibling specification of the catalog was the second caller that kept each of the six silent. The catalog runs nothing, so each has one caller and is reported.
- **Twelve dropped in Workflow Canon.**  Each was cited from a reference file alone — `walk-rules.md`, `coverage.md`, `canon-map.md`, `definition-scope.md`, `audit-dispatch.md` — whose sections state routes in prose rather than steps. A passage of reference prose is not a caller, so each specification has none and stands.
- **Five added in `gitnexus-cli/SKILL.md`.**  Its `## Commands` listing holds five specifications in a skill's entry point.

**Result:** ✓

## T9 The Check Over Work Planner at W08's Head

The check over `skills/work-planner` at `i11/e12/w08-command-specifications-move-to`, which is where the move this rule measures stands.

| Revision | Files | Findings |
| --- | --- | --- |
| base `b2fb799b` | 29 | 4 |
| this revision | 29 | 10 |

The three specifications the move placed with their procedures fall silent, as the rule says they must:

| Specification | Where it stands | The procedure that runs it |
| --- | --- | --- |
| Merge Pull Request | `work-breakdown.md:306` | `work-breakdown.md:224`, Task Merge under `## Delivery` |
| Capture Issue Development | `work-breakdown.md:273` | a procedure of the same file |
| Renumber Epics | `review-passes.md:101` | `review-passes.md:55`, `## Ordering Pass` |

`List Initiative Titles` also falls silent. Its one citation is `SKILL.md`'s Formatting Scheme, a passage of reference prose, so it has no caller and stands in the catalog. The placement the silence could otherwise hide — a specification inside an entry point — is reported directly instead, as T6 shows.

Ten specifications stand reported. Each is held by `commands.md`, each has exactly one procedure caller, and each was kept silent at the base by a second citation that runs nothing:

| Specification | Its one caller | What kept it silent |
| --- | --- | --- |
| List Labels | `propose-mode.md` | `SKILL.md` Formatting Scheme, and a sibling specification |
| Patch Pull Request Body | `understand-mode.md` | `deliver-mode.md` Reference |
| Find Theme Board | `sync-mode.md` | `board.md` Select |
| Create Board | `sync-mode.md` | `SKILL.md` Themes and Boards, and Dependencies |
| Create Proposals Board | `propose-mode.md` | `SKILL.md` Themes and Boards, and Dependencies |
| Find Status Field | `sync-mode.md` | `board.md` Read |
| Fetch Board Items with Status | `sync-mode.md` | `board.md` Read, `advance-mode.md` Commands, two sibling specifications |
| Create Task Worktree | `deliver-mode.md` | `SKILL.md` Dependencies |
| Create Pull Request Worktree | `understand-mode.md` | `SKILL.md` Dependencies, and a sibling specification |
| Index Repository | `understand-mode.md` | `SKILL.md` Dependencies, `understand-mode.md` Rules, a sibling specification |

These ten are the move's remainder, not the rule's defect: each stands in the catalog although exactly one procedure runs it, which is the state the epic's AC3 forbids. They are W08's to place.

**Result:** ✓
