# W01 Test Evidence

Tested revision: `a13614b61` on `i11/e10/w01-skill-frontmatter-and-prose`, which merges `i11/e10/workspace` at `ac4220296`. Every command ran locally from the unit worktree under the workspace sandbox.

## T1 Mode Trigger Checks

The `FrontmatterAndLayoutChecks` tests over specimen skills, for the frontmatter check.

- `test_a_description_triggering_every_mode_reports_nothing` — a description naming Audit and Revise reports nothing.
- `test_a_mode_the_description_never_names_is_reported` — a description naming Audit alone reports Revise.
- `test_a_folded_description_is_read_whole` — a `>-` block across lines, "revising" carrying Revise, reports nothing.
- `test_a_trigger_word_inside_another_word_carries_no_mode` — "explain a deplanned board" carries no Plan.
- `test_a_skill_without_modes_needs_no_trigger` and `test_a_mode_listed_outside_an_entry_point_is_not_read` — controls.

```text
python3 -m pytest skills/test -q -k FrontmatterAndLayoutChecks
14 passed, 172 deselected
```

Against the checker at `ba441c2b8`, the two reporting tests fail, so the suite detects the fault only the new check reports.

The finding kind is registered in the check's `KINDS`, and `skills/rules.json` maps `frontmatter/description` to it beside `review`, which the rules gate in the shared suite reads.

## T2 Hard-Wrap Checks

The same class, for the layout check.

- `test_a_hard_wrapped_paragraph_is_reported`, `test_a_hard_wrapped_list_item_is_reported`, `test_a_body_wrapped_under_its_bold_label_is_reported` and `test_a_lazy_line_after_a_sub_bullet_is_reported` — each specimen reports one finding at the item's first line.
- `test_a_paragraph_wrapped_three_times_is_reported_once` — one finding per item.
- `test_one_line_items_and_their_structures_report_nothing` — one-line paragraphs, a label with its body beneath, sub-bullets, steps, a table, a quote, bold field lines and HTML report nothing.
- `test_wrapped_text_inside_a_fence_is_a_specimen` and `test_a_folded_frontmatter_value_is_not_prose` — fences and frontmatter are not prose.

Against the checker at `ba441c2b8`, the five reporting tests fail. The finding kind is registered in `KINDS`, and `skills/rules.json` maps `layout/one-line-per-item` to it.

## T3 Shared and Work Planner Suites

```text
python3 -m pytest skills/test skills/work-planner/test -q
876 passed, 1 skipped, 1837 subtests passed
```

The two bounded-prose tests specimen one-line paragraphs separated by blank lines, the layout the guidelines require. The entry-point section specimens carry a description triggering their Plan mode, as a conforming entry point does.

The Workflow Canon suite gives 39 passed and 38 skipped at the tested revision, as at the merged bases before it.

## T4 Check Over Every Skill

```text
python3 skills/scripts/check_skill_files.py skills    82 files checked, 0 findings
```

At `ba441c2b8` the new checks reported one untriggered mode (work-planner Understand) and seven hard-wrapped items in work-planner and gitnexus-guide; a later base added one in the workflow-canon entry point. The base at `ac4220296` adds none of either kind, and reports one wide bold lead in `skills/guidelines.md` (Resolution), whose body now stands beneath its label. Each is fixed at the tested revision.
