"""The shared skill-file check, over seeded skills in a temporary tree."""

import io
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))

import check_skill_files as checker

FENCE = chr(96) * 3

# The specimen declares directories of its own, so the checks below exercise a
# contract a skill states rather than one the checker knows by name.
STRUCTURE = {
    'modes': {
        'sections': ['Prerequisites', 'Procedure', 'Outcomes', 'Guidance', 'Operations'],
        'required': ['Procedure', 'Outcomes'],
        'specifications': 'Operations',
    },
    'protocols': {
        'sections': ['Prerequisites', 'Procedure', 'Guidance'],
        'required': ['Procedure'],
    },
    'artifacts': {
        'sections': ['Prerequisites', 'Operations', 'Fields', 'Guidance', 'Commands'],
        'required': ['Fields'],
        'procedures': 'Operations',
        'keeps_commands': True,
    },
    '*-mode.md': {
        'sections': ['Prerequisites', 'Procedure', 'Reference', 'Rules', 'Commands'],
        'required': ['Procedure', 'Rules'],
    },
}


def calling(title, target, heading='Procedure'):
    """A file whose procedure runs the command the target names, which is what
    makes a file a caller."""
    return f'# {title}\n\n## {heading}\n\n1. **Fetch.**  Run [Fetch issue]({target}).\n'


class SkillFileChecks(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        (self.skill / 'references').mkdir(parents=True)
        (self.skill / 'structure.json').write_text(json.dumps(STRUCTURE))

    def write(self, name, text):
        path = self.skill / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def findings(self):
        files = sorted(self.skill.rglob('*.md'))
        declared = {}
        cited, called = checker.citations(files, declared)
        cache = {}
        out = []
        for path in files:
            out += checker.check(path, self.root, cache, cited, called, declared)
        return [(Path(where).name, line, kind) for where, line, kind, _ in out]

    def kinds(self):
        return {kind for _, _, kind in self.findings()}

    def test_a_conforming_skill_reports_nothing(self):
        self.write('SKILL.md', '---\nname: specimen\n---\n\n# Specimen\n\n'
                               'One sentence.\n\n- **Mode.**  See [guide](references/guide.md#terms).\n')
        self.write('references/guide.md', '# Guide\n\n## Terms\n\nA sentence.\n')
        self.assertEqual(self.findings(), [])

    def test_a_link_to_a_missing_file_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\nSee [guide](references/absent.md).\n')
        self.assertIn('unresolved link', self.kinds())

    def test_a_link_to_a_missing_heading_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\nSee [terms](references/guide.md#absent).\n')
        self.write('references/guide.md', '# Guide\n\n## Terms\n\nA sentence.\n')
        self.assertIn('unresolved anchor', self.kinds())

    def test_a_link_inside_a_fence_is_a_specimen(self):
        self.write('SKILL.md', f'# Specimen\n\n{FENCE}markdown\n[absent](references/absent.md)\n{FENCE}\n')
        self.assertEqual(self.findings(), [])

    def test_a_link_inside_a_code_span_is_a_specimen(self):
        self.write('SKILL.md', '# Specimen\n\nWrite `[absent](references/absent.md)` in the body.\n')
        self.assertEqual(self.findings(), [])

    def test_a_template_placeholder_is_not_a_path(self):
        self.write('SKILL.md', '# Specimen\n\n- **R1.** [{{Title}}]({{URL}}) and [more](…).\n')
        self.assertEqual(self.findings(), [])

    def test_a_heading_inside_a_fence_is_not_an_anchor(self):
        self.write('references/guide.md', f'# Guide\n\n## Layout\n\n{FENCE}markdown\n## Layout\n{FENCE}\n')
        self.assertEqual(self.findings(), [])

    def test_a_skipped_heading_level_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\n### Deep\n\nA sentence.\n')
        self.assertIn('heading jump', self.kinds())

    def test_a_bullet_holding_a_code_fence_is_reported(self):
        self.write('SKILL.md', f'# Specimen\n\n- {FENCE}bash\nls\n{FENCE}\n')
        self.assertIn('bullet holding a code fence', self.kinds())

    def test_a_bullet_holding_a_bullet_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\n- - Read the roster first.\n')
        self.assertIn('bullet holding a bullet', self.kinds())

    def test_an_empty_bullet_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\n- \n\nA sentence.\n')
        self.assertIn('empty bullet', self.kinds())

    def test_frontmatter_and_thematic_breaks_are_not_bullets(self):
        self.write('SKILL.md', '---\nname: specimen\n---\n\n# Specimen\n\nA sentence.\n\n---\n')
        self.assertEqual(self.findings(), [])

    def test_prose_over_eight_lines_is_reported(self):
        body = '\n\n'.join(f'Sentence {number}.' for number in range(9))
        self.write('SKILL.md', f'# Specimen\n\n{body}\n')
        self.assertIn('prose over eight lines', self.kinds())

    def test_eight_lines_of_prose_is_within_the_limit(self):
        body = '\n\n'.join(f'Sentence {number}.' for number in range(8))
        self.write('SKILL.md', f'# Specimen\n\n{body}\n')
        self.assertEqual(self.findings(), [])

    def test_a_long_list_is_one_structure(self):
        body = '\n'.join(f'- Item {number}.' for number in range(20))
        self.write('SKILL.md', f'# Specimen\n\n{body}\n')
        self.assertEqual(self.findings(), [])

    def test_a_long_table_is_one_structure(self):
        body = '\n'.join(f'| {number} | value |' for number in range(20))
        self.write('SKILL.md', f'# Specimen\n\n| A | B |\n| --- | --- |\n{body}\n')
        self.assertEqual(self.findings(), [])

    def test_a_wide_inline_bold_lead_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\n- **Label.**  ' + 'word ' * 25 + '\n')
        self.assertIn('inline bold lead too wide', self.kinds())

    def test_a_bold_label_on_its_own_line_has_no_width_limit(self):
        self.write('SKILL.md', '# Specimen\n\n- **Label.**\n  ' + 'word ' * 40 + '\n')
        self.assertEqual(self.findings(), [])

    def test_a_prerequisite_citation_inside_one_file_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\n## Common\n\nOne.\n\n## Spec\n\n'
                               'Read [Common](#common) first. Then run it.\n')
        self.assertIn('prerequisite citation inside one file', self.kinds())

    def test_a_prerequisite_citation_naming_its_own_file_is_reported(self):
        self.write('references/guide.md', '# Guide\n\n## Common\n\nOne.\n\n## Spec\n\n'
                                          'Read [Common](guide.md#common) first.\n')
        self.assertIn('prerequisite citation inside one file', self.kinds())

    def test_a_prerequisite_citation_crossing_a_file_is_allowed(self):
        self.write('SKILL.md', '# Specimen\n\nRead [Terms](references/guide.md#terms) first.\n')
        self.write('references/guide.md', '# Guide\n\n## Terms\n\nA sentence.\n')
        self.assertEqual(self.findings(), [])

    def test_a_selection_link_may_point_anywhere_in_its_file(self):
        self.write('references/guide.md', '# Guide\n\n## Route\n\nUse [Spec](#spec) for the run.\n\n'
                                          '## Spec\n\nA sentence.\n')
        self.assertEqual(self.findings(), [])

    def test_a_prerequisite_example_in_a_code_span_is_a_specimen(self):
        self.write('references/guide.md', '# Guide\n\n## Common\n\nOne.\n\n'
                                          '- **Rule.**  Cite it as `Read [Common](#common) first.` in the body.\n')
        self.assertEqual(self.findings(), [])

    CATALOG = '# Catalog\n\n## Commands\n\n### Fetch issue\n\nFetches one issue.\n'
    LISTING = ('# Commands\n\n## Conventions\n\n### Execution\n\nWhere every command runs.\n'
               '\n## Issues\n\n### Fetch issue\n\nFetches one issue.\n')
    MODE = '# Plan mode\n\nWhat the mode does.\n'
    PROCEDURE = '\n## Procedure\n\n1. **Open.**  The first step.\n'
    RULES = '\n## Rules\n\n- **Scope.**  One sentence.\n'

    def test_a_specification_cited_from_one_other_file_is_reported(self):
        self.write('references/catalog.md', self.CATALOG)
        self.write('references/plan.md', calling('Plan', 'catalog.md#fetch-issue'))
        self.assertIn('command specification with one caller', self.kinds())

    def test_a_specification_several_files_cite_stands(self):
        self.write('references/catalog.md', self.CATALOG)
        self.write('references/plan.md', calling('Plan', 'catalog.md#fetch-issue'))
        self.write('references/sync.md', calling('Sync', 'catalog.md#fetch-issue'))
        self.assertEqual(self.findings(), [])

    def test_a_specification_nobody_cites_is_reported(self):
        self.write('references/catalog.md', self.CATALOG)
        self.assertEqual(self.findings(), [('catalog.md', 5, 'command specification nothing cites')])

    def test_a_specification_only_its_own_file_cites_stands(self):
        self.write('references/catalog.md',
                   '# Catalog\n\nRun [Fetch issue](#fetch-issue) for it.\n' + self.CATALOG[len('# Catalog\n'):])
        self.assertEqual(self.findings(), [])

    def test_a_procedure_of_the_holding_file_counts_as_a_caller(self):
        self.write('references/plan.md',
                   '# Plan\n\n## Procedure\n\n1. **Open.**  Run [Fetch issue](#fetch-issue).\n'
                   '\n## Commands\n\n### Fetch issue\n\nFetches one issue.\n')
        self.write('references/sync.md', calling('Sync', 'plan.md#fetch-issue'))
        self.assertEqual(self.findings(), [])

    def test_a_step_under_a_procedure_sub_section_counts_as_a_caller(self):
        self.write('references/plan.md',
                   '# Plan\n\n## Procedure\n\n### Open\n\n1. **Open.**  Run [Fetch issue](#fetch-issue).\n'
                   '\n## Commands\n\n### Fetch issue\n\nFetches one issue.\n')
        self.write('references/sync.md', calling('Sync', 'plan.md#fetch-issue'))
        self.assertEqual(self.findings(), [])

    def test_a_procedure_under_a_heading_of_its_own_name_counts_as_a_caller(self):
        self.write('references/plan.md',
                   '# Plan\n\n## Delivery\n\n1. **Open.**  Run [Fetch issue](#fetch-issue).\n'
                   '\n## Commands\n\n### Fetch issue\n\nFetches one issue.\n')
        self.write('references/sync.md', calling('Sync', 'plan.md#fetch-issue'))
        self.assertNotIn('command specification with one caller', self.kinds())

    def test_a_procedure_under_a_heading_of_its_own_name_in_another_file_is_a_caller(self):
        self.write('references/catalog.md', self.CATALOG)
        self.write('references/plan.md', calling('Plan', 'catalog.md#fetch-issue', 'Ordering Pass'))
        self.assertIn('command specification with one caller', self.kinds())

    def test_a_procedure_heading_over_prose_runs_no_command(self):
        self.write('references/catalog.md', self.CATALOG)
        self.write('references/guide.md',
                   '# Guide\n\n## Procedure\n\n- **Sub-bullets.**  A step naming '
                   '[Fetch issue](catalog.md#fetch-issue) is in sentence case.\n')
        self.assertEqual(self.findings(), [])

    ROUTE_CATALOG = ('# Catalog\n\n## Commands\n\n### Plan assignments\n\nPlans them.\n'
                     '\n### Bind agent\n\nBinds one.\n\n### Write packet\n\nWrites one.\n')
    ROUTE_CALLER = ('# Plan\n\n## Procedure\n\n'
                    '1. **Plan.**  Run [Plan assignments](catalog.md#plan-assignments).\n'
                    '2. **Bind.**  Run [Bind agent](catalog.md#bind-agent).\n'
                    '3. **Write.**  Run [Write packet](catalog.md#write-packet).\n')

    def test_a_prose_route_naming_commands_in_order_runs_none(self):
        self.write('references/catalog.md', self.ROUTE_CATALOG)
        self.write('references/plan.md', self.ROUTE_CALLER)
        self.write('references/dispatch.md',
                   '# Dispatch\n\n## Dispatch Route\n\nUse [Plan assignments](catalog.md#plan-assignments), '
                   '[Bind agent](catalog.md#bind-agent), then [Write packet](catalog.md#write-packet).\n')
        self.assertEqual([kind for _, _, kind in self.findings()],
                         ['command specification with one caller'] * 3)

    def test_the_same_route_stated_as_steps_runs_each_command(self):
        self.write('references/catalog.md', self.ROUTE_CATALOG)
        self.write('references/plan.md', self.ROUTE_CALLER)
        self.write('references/dispatch.md',
                   '# Dispatch\n\n## Dispatch Route\n\n'
                   '1. **Plan.**  Run [Plan assignments](catalog.md#plan-assignments).\n'
                   '2. **Bind.**  Run [Bind agent](catalog.md#bind-agent).\n'
                   '3. **Write.**  Run [Write packet](catalog.md#write-packet).\n')
        self.assertNotIn('command specification with one caller', self.kinds())

    def test_a_sibling_specification_of_a_catalog_is_not_a_caller(self):
        self.write('references/commands.md',
                   '# Commands\n\n## Issues\n\n### Fetch issue\n\nFetches one issue.\n'
                   '\n### Close issue\n\nRun [Fetch issue](#fetch-issue) first.\n')
        self.write('references/plan.md', calling('Plan', 'commands.md#fetch-issue'))
        self.assertIn('command specification with one caller', self.kinds())

    def test_a_sibling_specification_in_another_file_is_not_a_caller(self):
        self.write('references/catalog.md', self.CATALOG)
        self.write('references/plan.md',
                   '# Plan\n\nIssues close through [Close issue](#close-issue).\n'
                   '\n## Commands\n\n### Close issue\n\nCloses one issue.\n'
                   '\n- Run [Fetch issue](catalog.md#fetch-issue) first.\n')
        self.assertEqual(self.findings(), [])

    def test_reference_prose_of_the_holding_file_is_not_a_caller(self):
        self.write('references/context.md',
                   '# Context\n\n## Checks\n\nEvery check runs [Fetch issue](#fetch-issue).\n'
                   '\n## Commands\n\n### Fetch issue\n\nFetches one issue.\n')
        self.write('references/plan.md', calling('Plan', 'context.md#fetch-issue'))
        self.assertIn('command specification with one caller', self.kinds())

    def test_reference_prose_in_another_file_is_not_a_caller(self):
        self.write('references/catalog.md', self.CATALOG)
        self.write('references/context.md',
                   '# Context\n\n## Checks\n\nEvery check runs [Fetch issue](catalog.md#fetch-issue).\n')
        self.assertEqual(self.findings(), [])

    def test_a_rules_section_of_the_holding_file_is_not_a_caller(self):
        self.write('references/plan.md',
                   '# Plan\n\n## Rules\n\n- **Scope.**  Run [Fetch issue](#fetch-issue) alone.\n'
                   '\n## Commands\n\n### Fetch issue\n\nFetches one issue.\n')
        self.write('references/sync.md', calling('Sync', 'plan.md#fetch-issue'))
        self.assertIn('command specification with one caller', self.kinds())

    def test_a_catalog_entry_cited_from_one_file_is_reported(self):
        self.write('references/commands.md',
                   '# Commands\n\n## Issues\n\n### Fetch issue\n\nFetches one issue.\n')
        self.write('references/plan.md', calling('Plan', 'commands.md#fetch-issue'))
        self.assertIn('command specification with one caller', self.kinds())

    def test_a_specification_in_the_entry_point_is_reported(self):
        self.write('SKILL.md', '---\nname: specimen\n---\n\n# Specimen\n\n'
                               '## Commands\n\n### Fetch issue\n\nFetches one issue.\n')
        self.write('references/plan.md', calling('Plan', '../SKILL.md#fetch-issue'))
        self.assertIn('command specification in the entry point', self.kinds())

    def test_a_heading_of_a_catalogs_conventions_is_not_a_specification(self):
        self.write('references/commands.md', self.LISTING)
        self.write('references/plan.md', '# Plan\n\nSee [Execution](commands.md#execution) '
                                          'for [Fetch issue](commands.md#fetch-issue).\n')
        self.assertEqual(self.findings(), [])

    def test_a_heading_of_a_catalogs_listing_is_a_specification(self):
        self.write('references/commands.md', self.LISTING)
        self.write('references/plan.md', calling('Plan', 'commands.md#fetch-issue'))
        self.assertIn('command specification with one caller', self.kinds())

    def test_a_heading_outside_a_commands_section_is_not_a_specification(self):
        self.write('references/catalog.md', '# Catalog\n\n## Reference\n\n### Fetch issue\n\nA sentence.\n')
        self.write('references/plan.md', calling('Plan', 'catalog.md#fetch-issue'))
        self.assertEqual(self.findings(), [])

    def test_a_caller_under_another_root_is_reported(self):
        elsewhere = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, elsewhere)
        catalog = self.write('references/catalog.md', self.CATALOG)
        plan = elsewhere / 'sibling' / 'references' / 'plan.md'
        plan.parent.mkdir(parents=True)
        target = os.path.relpath(catalog, plan.parent)
        plan.write_text(calling('Plan', f'{target}#fetch-issue'))
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill), str(elsewhere / 'sibling')])
        self.assertEqual(status, 1)
        self.assertIn('command specification with one caller', printed.getvalue())

    def test_a_conforming_mode_file_reports_nothing(self):
        self.write('references/plan-mode.md', self.MODE + self.PROCEDURE + self.RULES)
        self.assertEqual(self.findings(), [])

    def test_a_mode_section_outside_the_set_is_reported(self):
        self.write('references/plan-mode.md',
                   self.MODE + self.PROCEDURE + '\n## Findings\n\nOne sentence.\n' + self.RULES)
        self.assertIn('section outside the set', self.kinds())

    def test_mode_sections_out_of_order_are_reported(self):
        self.write('references/plan-mode.md', self.MODE + self.RULES + self.PROCEDURE)
        self.assertIn('sections out of order', self.kinds())

    def test_a_mode_file_without_a_procedure_is_reported(self):
        self.write('references/plan-mode.md', self.MODE + self.RULES)
        self.assertIn('section missing', self.kinds())

    def test_a_mode_file_without_rules_is_reported(self):
        self.write('references/plan-mode.md', self.MODE + self.PROCEDURE)
        self.assertIn('section missing', self.kinds())

    def test_a_mode_file_without_either_section_is_reported_for_each(self):
        self.write('references/plan-mode.md', self.MODE)
        self.assertEqual([kind for _, _, kind in self.findings()],
                         ['section missing', 'section missing'])

    def test_a_reference_file_carrying_a_procedure_takes_the_set(self):
        self.write('references/dispatch.md',
                   '# Dispatch\n\n## Phases\n\n1. **Open.**  The first step.\n')
        self.assertEqual({kind for _, _, kind in self.findings()},
                         {'section outside the set', 'section missing'})

    def test_a_reference_file_whose_sections_are_the_set_reports_nothing(self):
        self.write('references/dispatch.md', '# Dispatch\n\nWhat it does.\n' + self.PROCEDURE)
        self.assertEqual(self.findings(), [])

    def test_a_reference_file_carrying_a_procedure_needs_no_rules(self):
        self.write('references/dispatch.md',
                   '# Dispatch\n\nWhat it does.\n\n## Prerequisites\n\nOne sentence.\n'
                   + self.PROCEDURE)
        self.assertEqual(self.findings(), [])

    def test_a_reference_file_with_sections_out_of_order_is_reported(self):
        self.write('references/dispatch.md',
                   '# Dispatch\n\nWhat it does.\n' + self.RULES + self.PROCEDURE)
        self.assertIn('sections out of order', self.kinds())

    def test_a_file_carrying_no_procedure_carries_any_section(self):
        self.write('references/guide.md', '# Guide\n\n## Findings\n\nOne sentence.\n')
        self.assertEqual(self.findings(), [])

    def test_a_step_under_a_sub_section_selects_the_file(self):
        self.write('references/dispatch.md',
                   '# Dispatch\n\n## Phases\n\n### Route\n\n1. **Open.**  The first step.\n')
        self.assertIn('section outside the set', self.kinds())

    def test_the_entry_point_keeps_its_own_structure(self):
        self.write('SKILL.md', '---\nname: specimen\n---\n\n# Specimen\n\n'
                               '## Modes\n\n1. **Plan.**  The first mode.\n')
        self.assertEqual(self.findings(), [])

    def test_a_trailing_blank_line_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\nA sentence.\n\n')
        self.assertIn('trailing blank line', self.kinds())

    def test_modes_directory_uses_outcomes_and_operations(self):
        self.write('modes/plan-mode.md', '# Plan\n\n## Procedure\n\n'
                   '1. **Check.**\n   Run [Check files](#check-files).\n\n'
                   '## Outcomes\n\nThe files conform.\n\n## Operations\n\n'
                   '### Check Files\n\nChecks files.\n')
        self.assertEqual(self.findings(), [])

    def test_modes_directory_requires_procedure_and_outcomes(self):
        self.write('modes/plan.md', '# Plan\n\nA plan.\n')
        self.assertEqual([kind for _, _, kind in self.findings()],
                         ['section missing', 'section missing'])

    def test_directory_layout_is_not_selected_by_filename_alone(self):
        self.write('references/plan-mode.md', self.MODE + self.PROCEDURE + '\n## Outcomes\n\nDone.\n')
        self.assertIn('section outside the set', self.kinds())
        self.assertIn('section missing', self.kinds())

    def test_artifacts_directory_accepts_single_step_and_command_only_contracts(self):
        self.write('artifacts/issue.md', '# Issue\n\n## Operations\n\n### Read Tracker Issue\n\n'
                   '- Run [Fetch issue](#fetch-issue).\n\n## Fields\n\nNumber.\n\n'
                   '## Commands\n\n### Fetch Issue\n\nFetches it.\n')
        self.write('artifacts/source.md', '# Source\n\n## Fields\n\n'
                   'Text, read through [Fetch Source](#fetch-source).\n\n'
                   '## Commands\n\n### Fetch Source\n\nFetches it.\n')
        self.assertEqual(self.findings(), [])

    def test_an_artifact_command_keeps_its_subject_with_one_external_caller(self):
        self.write('artifacts/issue.md', '# Issue\n\n## Fields\n\nNumber.\n\n'
                   '## Commands\n\n### Fetch Issue\n\nFetches it.\n')
        self.write('modes/plan.md', calling('Plan', '../artifacts/issue.md#fetch-issue') +
                   '\n## Outcomes\n\nThe issue is read.\n')
        self.assertEqual(self.findings(), [])

    def test_a_single_step_artifact_operation_is_a_caller(self):
        path = self.write('artifacts/issue.md', '# Issue\n\n## Operations\n\n'
                          '### Read Tracker Issue\n\n- Run [Fetch issue](#fetch-issue).\n\n'
                          '## Fields\n\nNumber.\n\n## Commands\n\n### Fetch Issue\n\nFetches it.\n')
        _, called = checker.citations([path], {})
        self.assertEqual(called[path]['fetch-issue'], {path})

    def test_mode_operations_are_specifications_not_procedures(self):
        path = self.write('modes/plan.md', '# Plan\n\n## Procedure\n\n'
                          '1. **Check.**\n   Run [Check files](#check-files).\n\n'
                          '## Outcomes\n\nDone.\n\n## Operations\n\n### Check Files\n\n'
                          '1. A specimen naming [another](#other).\n\n### Other\n\nA command.\n')
        _, called = checker.citations([path], {})
        self.assertNotIn('other', called[path])

    def test_a_structure_reaches_files_whatever_root_is_named(self):
        """The contract comes from the nearest structure file above the file
        under check, so naming the tree or one directory of a skill applies the
        same contract as naming the skill."""
        self.write('modes/plan.md', '# Plan\n\n## Procedure\n\n1. **Check.**  A step.\n\n'
                   '## Outcomes\n\nDone.\n')
        for root in (self.root, self.skill, self.skill / 'modes'):
            with self.subTest(root=root.name):
                printed = io.StringIO()
                with redirect_stdout(printed):
                    status = checker.main([str(root)])
                self.assertEqual((status, printed.getvalue().splitlines()[-1]),
                                 (0, '1 files checked, 0 findings'))

    def test_a_structure_entry_without_sections_is_refused(self):
        """An entry naming no sections would pass every file it covers, so the
        check reports the contract rather than running on it."""
        (self.skill / 'structure.json').write_text(json.dumps({'modes': {'required': ['Procedure']}}))
        self.write('modes/plan.md', '# Plan\n')
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill)])
        self.assertEqual(status, 1)
        self.assertIn('modes states no sections', printed.getvalue())

    def test_an_unreadable_structure_is_refused(self):
        (self.skill / 'structure.json').write_text('{')
        self.write('modes/plan.md', '# Plan\n')
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill)])
        self.assertEqual(status, 1)
        self.assertIn('unreadable structure', printed.getvalue())

    def test_directory_sections_reject_wrong_order_and_rules(self):
        self.write('artifacts/issue.md', '# Issue\n\n## Fields\n\nNumber.\n\n'
                   '## Operations\n\n### Read Tracker Issue\n\n- Read it.\n\n## Rules\n\nOne.\n')
        self.assertIn('sections out of order', self.kinds())
        self.assertIn('section outside the set', self.kinds())

    def test_an_artifact_without_fields_fails_even_without_steps(self):
        self.write('artifacts/issue.md', '# Issue\n')
        self.assertIn('section missing', self.kinds())

    def test_a_nested_fence_keeps_template_headings_and_links_out_of_the_scan(self):
        self.write('artifacts/issue.md', '# Issue\n\n## Fields\n\n### Template\n\n' +
                   FENCE + '`markdown\n## Template Heading\n' + FENCE + 'bash\nexample\n' +
                   FENCE + '\n## Another Heading\n[missing](absent.md)\n~~~\n' + FENCE + '`\n')
        self.assertEqual(self.findings(), [])

    def run_command(self):
        with redirect_stdout(io.StringIO()):
            return checker.main([str(self.skill), '--quiet'])

    def test_the_command_exits_non_zero_on_a_finding(self):
        self.write('SKILL.md', '# Specimen\n\nSee [guide](references/absent.md).\n')
        self.assertEqual(self.run_command(), 1)

    def test_the_command_exits_zero_when_clean(self):
        self.write('SKILL.md', '# Specimen\n\nA sentence.\n')
        self.assertEqual(self.run_command(), 0)


class HeadingSpacingChecks(unittest.TestCase):
    """A heading carries a blank line above it, so no list item or paragraph
    can read it in as its own text."""

    KIND = 'heading without a blank line above'
    setUp = SkillFileChecks.setUp
    write = SkillFileChecks.write
    findings = SkillFileChecks.findings
    kinds = SkillFileChecks.kinds

    def test_a_heading_flush_beneath_a_list_item_is_reported(self):
        self.write('references/guide.md', '# Guide\n\n## Terms\n\n- **One.**\n  A sentence.\n'
                                          '## Whole\n\nA sentence.\n')
        self.assertIn(('guide.md', 7, self.KIND), self.findings())

    def test_a_heading_flush_beneath_a_heading_is_reported(self):
        self.write('references/guide.md', '# Guide\n\n## Outputs\n### Report\n\nA sentence.\n')
        self.assertIn(('guide.md', 4, self.KIND), self.findings())

    def test_a_heading_opening_the_file_or_its_body_is_left_alone(self):
        self.write('SKILL.md', '---\nname: specimen\n---\n# Specimen\n\nOne sentence.\n')
        self.write('references/guide.md', '# Guide\n\n## Terms\n\nA sentence.\n')
        self.assertNotIn(self.KIND, self.kinds())

    def test_a_heading_inside_a_fence_is_left_alone(self):
        self.write('references/guide.md', f'# Guide\n\n## Terms\n\n{FENCE}markdown\n'
                                          f'A sentence.\n## Template\n{FENCE}\n')
        self.assertNotIn(self.KIND, self.kinds())


class EntryPointSections(unittest.TestCase):
    """A skill's entry point measured against the set the shared guidelines
    name for it, whatever it carries."""

    setUp = SkillFileChecks.setUp
    write = SkillFileChecks.write
    findings = SkillFileChecks.findings

    ENTRY = ('---\nname: specimen\ndescription: Use to plan the work.\n---\n\n# Specimen\n\nOne sentence.\n\n'
             '- **Plans**  The plans it acts on.\n')
    MODES = '\n## Modes\n\n- **[Plan](references/plan-mode.md)**\n  - Forward-looking, scoped to one plan\n'
    RULES = '\n## Rules\n\n- **One home.**  Each rule is stated once.\n'
    CONVENTIONS = '\n## Conventions\n\n- **Session.**  Unset the token first.\n'
    DEPENDENCIES = '\n## Dependencies\n\n- **git.**\n'

    def entry(self, *sections):
        self.write('SKILL.md', self.ENTRY + ''.join(sections))
        self.write('references/plan-mode.md', '# Plan\n\n## Procedure\n\n1. **Plan.**  Plan it.\n'
                                              '\n## Rules\n\n- **Scope.**  One plan.\n')
        return [(line, kind) for name, line, kind in self.findings() if name == 'SKILL.md']

    def test_an_entry_point_carrying_the_named_set_in_order_reports_nothing(self):
        self.assertEqual(self.entry(self.MODES, self.RULES, self.CONVENTIONS, self.DEPENDENCIES), [])

    def test_each_named_section_is_optional(self):
        self.assertEqual(self.entry(), [])
        self.assertEqual(self.entry(self.MODES, self.DEPENDENCIES), [])

    def test_a_section_outside_the_set_is_reported(self):
        self.assertEqual(self.entry(self.MODES, '\n## Troubleshooting\n\nOne sentence.\n'),
                         [(17, 'section outside the set')])

    def test_a_section_out_of_order_is_reported(self):
        self.assertEqual(self.entry(self.MODES, self.DEPENDENCIES, self.RULES),
                         [(21, 'sections out of order')])

    def test_each_departure_is_reported(self):
        found = self.entry(self.CONVENTIONS, self.RULES, '\n## After Indexing\n\nOne sentence.\n')
        self.assertEqual([kind for _, kind in found], ['sections out of order', 'section outside the set'])

    def test_an_entry_point_carrying_steps_takes_its_own_set(self):
        found = self.entry(self.MODES, '\n## Procedure\n\n1. **Run.**  Run it.\n')
        self.assertEqual(found, [(17, 'section outside the set')])

    def test_a_contract_covering_every_file_does_not_reach_the_entry_point(self):
        structure = dict(STRUCTURE, **{'*.md': {'sections': ['Procedure'], 'required': ['Procedure']}})
        (self.skill / 'structure.json').write_text(json.dumps(structure))
        self.assertEqual(self.entry(self.MODES, self.RULES), [])


class EmptySectionChecks(unittest.TestCase):
    """A heading whose section holds nothing, measured over seeded files."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        self.skill.mkdir()

    def empty(self, text):
        path = self.skill / 'guide.md'
        path.write_text(text)
        lines, _, headings = checker.scan(path)
        return [title for _, title in checker.empty_sections(lines, headings)]

    def test_a_heading_followed_by_a_heading_of_its_level_is_reported(self):
        self.assertEqual(self.empty('# Guide\n\nA sentence.\n\n## Sources\n\n## Sessions\n\nA sentence.\n'),
                         ['Sources'])

    def test_a_heading_at_the_end_of_the_file_is_reported(self):
        self.assertEqual(self.empty('# Guide\n\nA sentence.\n\n## Sources\n'), ['Sources'])

    def test_a_heading_whose_body_is_its_sub_sections_is_clean(self):
        self.assertEqual(self.empty('# Guide\n\n## Terms\n\n### Branch\n\nA sentence.\n'), [])

    def test_an_empty_sub_section_is_reported_beneath_a_clean_parent(self):
        self.assertEqual(self.empty('# Guide\n\n## Terms\n\n### Branch\n\n### Base\n\nA sentence.\n'),
                         ['Branch'])

    def test_a_fenced_example_is_content(self):
        self.assertEqual(self.empty('# Guide\n\n## Example\n\n```bash\nrun\n```\n'), [])

    def test_a_heading_inside_a_fence_is_neither_reported_nor_a_boundary(self):
        self.assertEqual(self.empty('# Guide\n\n## Template\n\n```markdown\n## Empty\n```\n'), [])

    def test_the_command_reports_the_heading_and_its_file(self):
        (self.skill / 'SKILL.md').write_text('# Specimen\n\nA sentence.\n\n## Sources\n\n## Sessions\n\nA sentence.\n')
        output = io.StringIO()
        with redirect_stdout(output):
            status = checker.main([str(self.skill)])
        self.assertEqual(status, 1)
        self.assertIn('specimen/SKILL.md:5: heading without content — Sources', output.getvalue())

    def test_a_fixture_tree_is_not_a_skill_file(self):
        fixture = self.skill / 'test' / 'fixtures' / 'corpus.md'
        fixture.parent.mkdir(parents=True)
        fixture.write_text('## Outputs\n### report\n')
        (self.skill / 'SKILL.md').write_text('# Specimen\n\nA sentence.\n')
        with redirect_stdout(io.StringIO()):
            self.assertEqual(checker.main([str(self.skill)]), 0)


class ParallelSectionMood(unittest.TestCase):
    """Sibling sections whose titles end in one word open in one mood."""

    COMMANDS = ('## Commands\n\n### Check Shell Syntax\n\nParse a script.\n\n'
                '### Validate Compose\n\nResolve the file.\n')

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        self.skill.mkdir()

    def findings(self, text):
        path = self.skill / 'coverage.md'
        path.write_text(text)
        cited, called = checker.citations([path], {})
        return [(line, detail) for _, line, kind, detail
                in checker.check(path, self.root, {}, cited, called, {})
                if kind == 'parallel section in another mood']

    def test_a_section_directing_among_stating_siblings_is_reported(self):
        found = self.findings(
            '# Coverage\n\n## Main Coverage\n\n'
            'For engine work, [Check Shell Syntax](#check-shell-syntax) and '
            '[Validate Compose](#validate-compose) establish the baseline.\n\n'
            '## Docker Coverage\n\n'
            '[Check Shell Syntax](#check-shell-syntax) for changed helpers.\n\n'
            '## Workflows Coverage\n\nUse [Validate Compose](#validate-compose) for the corpus.\n\n'
            + self.COMMANDS)
        self.assertEqual(found, [(7, 'Docker Coverage directs, Main Coverage states'),
                                 (11, 'Workflows Coverage directs, Main Coverage states')])

    def test_siblings_in_one_mood_report_nothing(self):
        self.assertEqual(self.findings(
            '# Coverage\n\n## Main Coverage\n\n'
            '[Check Shell Syntax](#check-shell-syntax) establishes the baseline.\n\n'
            '## Docker Coverage\n\n'
            '[Check Shell Syntax](#check-shell-syntax) covers changed helpers, and '
            '[Validate Compose](#validate-compose) resolves the file.\n\n'
            '## Workspace Coverage\n\nThe check exercises the scripts.\n\n' + self.COMMANDS), [])

    def test_specifications_directing_together_report_nothing(self):
        self.assertEqual(self.findings('# Coverage\n\n' + self.COMMANDS), [])

    def test_sections_of_different_kinds_or_levels_are_not_compared(self):
        self.assertEqual(self.findings(
            '# Coverage\n\n## Main Coverage\n\nThe suite establishes the baseline.\n\n'
            '## Docker Images\n\nUse the reviewed files.\n\n'
            '### Build Coverage\n\nUse a disposable tree.\n'), [])

    def test_an_opening_neither_mood_decides_is_not_compared(self):
        self.assertEqual(self.findings(
            '# Coverage\n\n## Main Coverage\n\nThe suite establishes the baseline.\n\n'
            '## Docker Coverage\n\nEngine tests alone do not cover this.\n\n'
            '## Shell Coverage\n\n- **Helpers.**  Use disposable directories.\n'), [])


SHARED_GUIDE = ('# Skill Guidelines\n\n## Prose\n\nHow prose is written.\n\n'
                '- **Succinct.**  Plain words.\n- **Terms.**\n  - One concept, one term.\n'
                '  - **Nested.**  A sub-bullet states no rule of its own.\n')
SHARED_RULES = {'prose/succinct': ['review'], 'prose/terms': ['retired term']}


class SkillWideChecks(unittest.TestCase):
    """The checks over a whole skill: commands, vocabulary, guides, interface
    and rules, each run through the command over a specimen tree holding a
    shared guide beside one skill."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        (self.skill / 'structure.json').parent.mkdir(parents=True)
        (self.skill / 'structure.json').write_text(json.dumps(STRUCTURE))
        self.write('SKILL.md', '# Specimen\n\nA sentence.\n')
        (self.root / 'guidelines.md').write_text(SHARED_GUIDE)
        (self.root / 'rules.json').write_text(json.dumps(SHARED_RULES))

    def write(self, name, text):
        path = self.skill / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def run_check(self):
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill)])
        return status, printed.getvalue()

    def found(self, kind):
        """Each finding of one kind, as its file name and line."""
        _, printed = self.run_check()
        return [(Path(line.split(':')[0]).name, int(line.split(':')[1]))
                for line in printed.splitlines() if f': {kind}' in line]

    def mode(self, procedure, operations=''):
        return self.write('modes/plan-mode.md', '# Plan Mode\n\n## Procedure\n\n' + procedure +
                          '\n## Outcomes\n\n- **Done.**  The goal.\n' +
                          (f'\n## Operations\n\n{operations}' if operations else ''))

    # Commands check.

    def test_a_shell_block_in_a_mode_procedure_is_reported(self):
        self.mode(f'1. **Fetch.**\n   Fetch it.\n\n   {FENCE}bash\n   gh api repos/o/r\n   {FENCE}\n')
        self.assertEqual(self.found('command spelled out in a mode'), [('plan-mode.md', 8)])

    def test_an_unlabelled_block_in_a_mode_procedure_is_reported(self):
        self.mode(f'1. **Fetch.**\n   Fetch it.\n\n{FENCE}\ngh api repos/o/r\n{FENCE}\n')
        self.assertEqual(len(self.found('command spelled out in a mode')), 1)

    def test_a_command_inside_the_modes_specification_stands(self):
        self.mode('1. **Fetch.**\n   Run [Fetch Issue](#fetch-issue).\n',
                  f'### Fetch Issue\n\nFetches one issue.\n\n{FENCE}bash\ngh api repos/o/r\n{FENCE}\n')
        status, printed = self.run_check()
        self.assertEqual((status, printed.splitlines()[-1]), (0, '2 files checked, 0 findings'))

    def test_a_template_block_in_a_mode_is_no_command(self):
        self.mode(f'1. **Write.**\n   Write it.\n\n{FENCE}markdown\n## Heading\n{FENCE}\n')
        self.assertEqual(self.found('command spelled out in a mode'), [])

    def test_a_shell_block_outside_a_mode_file_is_not_this_checks(self):
        self.write('references/guide.md', f'# Guide\n\nA sentence.\n\n{FENCE}bash\ngh api repos/o/r\n{FENCE}\n')
        self.assertEqual(self.found('command spelled out in a mode'), [])

    # Vocabulary check.

    def declare(self, terms):
        (self.skill / 'vocabulary.json').write_text(json.dumps(terms))

    def test_a_retired_term_in_prose_is_reported(self):
        self.declare({'pull request': ['PR', 'PRs']})
        self.write('references/guide.md', '# Guide\n\nOpen the PRs here.\n')
        self.assertEqual(self.found('retired term'), [('guide.md', 3)])

    def test_a_retired_term_in_a_script_is_reported(self):
        self.declare({'pull request': ['PR']})
        self.write('scripts/sync.py', '"""Sync one PR."""\n')
        self.assertEqual(self.found('retired term'), [('sync.py', 1)])

    def test_a_retired_term_in_code_is_a_specimen(self):
        self.declare({'pull request': ['PR']})
        self.write('references/guide.md', f'# Guide\n\nPass `PR` as given.\n\n{FENCE}text\nPR\n{FENCE}\n')
        self.assertEqual(self.found('retired term'), [])

    def test_a_retired_term_matches_whole_and_by_case(self):
        self.declare({'pull request': ['PR']})
        self.write('scripts/sync.py', 'prs = parse("--prs")\nPRINT = 1\n')
        self.assertEqual(self.found('retired term'), [])

    def test_a_skill_declaring_no_vocabulary_reports_no_term(self):
        self.write('references/guide.md', '# Guide\n\nOpen the PRs here.\n')
        self.assertEqual(self.found('retired term'), [])

    def test_an_unreadable_vocabulary_is_refused(self):
        self.declare({'pull request': 'PR'})
        status, printed = self.run_check()
        self.assertEqual(status, 1)
        self.assertIn('unreadable declaration', printed)

    # Guides check.

    def guide(self, text, rules=None):
        self.write('guidelines.md', '# Guidelines\n\n' + text)
        (self.skill / 'rules.json').write_text(json.dumps(rules or {}))

    def test_a_shared_convention_restated_in_a_skill_guide_is_reported(self):
        self.guide('## Prose\n\n- **Terms.**  The scheme is one word.\n', {'prose/terms': ['review']})
        self.assertEqual(self.found('convention in both guides'), [('guidelines.md', 5)])

    def test_a_shared_label_under_another_section_stands(self):
        self.guide('## Modes\n\n- **Terms.**  A mode names its terms.\n', {'modes/terms': ['review']})
        self.assertEqual(self.found('convention in both guides'), [])

    def test_a_skill_specific_label_stands(self):
        self.guide('## Prose\n\n- **Scheme.**  The scheme is one word.\n', {'prose/scheme': ['review']})
        status, _ = self.run_check()
        self.assertEqual(status, 0)

    # Interface check.

    def artifact(self, specification, script=None):
        if script is not None:
            self.write('scripts/link.py', script)
        return self.write('artifacts/issue.md', '# Issue\n\n## Fields\n\n'
                          'Number, linked through [Link Issue](#link-issue).\n\n## Commands\n\n'
                          + specification)

    def specification(self, command, gap=False):
        return ('### Link Issue\n\nLinks one issue.\n\n**Inputs:** Issue identity.\n\n'
                + ('**REST gap:** REST exposes no write to the relation.\n\n' if gap else '')
                + f'{FENCE}bash\n{command}\n{FENCE}\n')

    def test_a_rest_operation_is_accepted(self):
        self.artifact(self.specification("gh api --method POST 'repos/<owner>/<repo>/issues/<n>/labels'"))
        status, _ = self.run_check()
        self.assertEqual(status, 0)

    def test_a_graphql_read_with_its_rest_gap_is_accepted(self):
        self.artifact(self.specification('gh api graphql -F query=@read.graphql', gap=True))
        status, _ = self.run_check()
        self.assertEqual(status, 0)

    def test_a_graphql_write_through_a_script_with_its_rest_gap_is_accepted(self):
        self.artifact(self.specification('python3 scripts/link.py add', gap=True),
                      script="run(['gh', 'api', 'graphql', '-F', 'query=@mutation'])\n")
        status, _ = self.run_check()
        self.assertEqual(status, 0)

    def test_graphql_without_a_rest_gap_is_reported(self):
        self.artifact(self.specification('gh api graphql -F query=@read.graphql'))
        self.assertEqual(self.found('GraphQL without a REST gap'), [('issue.md', 9)])

    def test_graphql_through_a_script_without_a_rest_gap_is_reported(self):
        self.artifact(self.specification('python3 scripts/link.py add'),
                      script="run(['gh', 'api', 'graphql', '-F', 'query=@mutation'])\n")
        self.assertEqual(self.found('GraphQL without a REST gap'), [('issue.md', 9)])

    def test_a_script_sending_no_graphql_needs_no_gap(self):
        self.artifact(self.specification('python3 scripts/link.py add'),
                      script="run(['gh', 'api', 'repos/o/r/issues'])\n")
        self.assertEqual(self.found('GraphQL without a REST gap'), [])

    def test_a_classic_projects_mutation_is_reported_whatever_its_gap(self):
        self.artifact(self.specification('gh api graphql -f query=addProjectCard', gap=True))
        self.assertEqual(self.found('Projects classic interface'), [('issue.md', 18)])

    def test_a_classic_projects_endpoint_is_reported(self):
        self.artifact(self.specification("gh api 'repos/<owner>/<repo>/projects'"))
        self.assertEqual(self.found('Projects classic interface'), [('issue.md', 16)])

    def test_a_classic_projects_field_in_prose_is_reported(self):
        self.write('references/guide.md', '# Guide\n\nRead each projectCards entry.\n')
        self.assertEqual(self.found('Projects classic interface'), [('guide.md', 3)])

    def test_a_classic_projects_field_in_a_script_is_reported(self):
        self.write('scripts/board.py', 'QUERY = "{ repository { projects(first: 5) { nodes { id } } } }"\n')
        self.assertEqual(self.found('Projects classic interface'), [('board.py', 1)])

    def test_projects_v2_and_its_board_link_are_accepted(self):
        self.artifact(self.specification("gh project item-list 17 --owner m2ux"))
        self.write('references/guide.md', '# Guide\n\nThe [board](https://github.com/users/m2ux/projects/17) '
                                          'is `users/m2ux/projectsV2/17`, read through `projectsV2(first: 1)`.\n')
        status, _ = self.run_check()
        self.assertEqual(status, 0)

    # Rules check.

    def test_a_rule_reaching_a_check_or_review_stands(self):
        self.guide('## Modes\n\n- **Outcomes.**  Each names a goal.\n- **Size.**  Short.\n',
                   {'modes/outcomes': ['review'], 'modes/size': ['prose over eight lines']})
        status, _ = self.run_check()
        self.assertEqual(status, 0)

    def test_a_rule_no_operation_decides_is_reported(self):
        self.guide('## Modes\n\nWhat a mode holds.\n\n- **Outcomes.**  Each names a goal.\n')
        self.assertEqual(self.found('house rule no operation decides'), [('guidelines.md', 7)])

    def test_a_rule_naming_an_unknown_operation_is_reported(self):
        self.guide('## Modes\n\n- **Outcomes.**  Each names a goal.\n', {'modes/outcomes': ['outcome check']})
        self.assertEqual(self.found('house rule no operation decides'), [('guidelines.md', 5)])

    def test_a_declaration_for_no_rule_is_reported(self):
        self.guide('## Modes\n\n- **Outcomes.**  Each names a goal.\n',
                   {'modes/outcomes': ['review'], 'modes/goals': ['review']})
        self.assertEqual(self.found('declared rule absent'), [('rules.json', 1)])

    def test_two_rules_under_one_key_are_ambiguous(self):
        self.guide('## Modes\n\n- **Outcomes.**  Each names a goal.\n- **Outcomes.**  Each is met.\n',
                   {'modes/outcomes': ['review']})
        self.assertEqual(self.found('ambiguous house rule'), [('guidelines.md', 6)])

    def test_the_shared_guide_is_read_from_a_run_over_its_skill(self):
        (self.root / 'rules.json').write_text(json.dumps({'prose/succinct': ['review']}))
        self.assertEqual(self.found('house rule no operation decides'), [('guidelines.md', 8)])

    def test_an_unreadable_rules_declaration_is_refused(self):
        self.guide('## Modes\n\n- **Outcomes.**  Each names a goal.\n', {'modes/outcomes': []})
        status, printed = self.run_check()
        self.assertEqual(status, 1)
        self.assertIn('unreadable declaration', printed)

    def test_every_kind_the_source_reports_is_registered(self):
        source = (Path(checker.__file__)).read_text()
        reported = set(re.findall(r"(?:report|finding)\([^'\n]*'([^']+)'", source))
        self.assertTrue(reported)
        self.assertEqual(reported - set(checker.KINDS), set())

    def test_an_unregistered_kind_is_refused(self):
        with self.assertRaises(KeyError):
            checker.finding(self.skill / 'SKILL.md', self.root, 0, 'no such kind')


# A specimen move: Fetch Issue leaves the issue artifact for the sync mode,
# its link retargeted, and the other sections stay where they stand.
BEFORE = {
    'skill/artifacts/issue.md': (
        '# Issue\n\n## Commands\n\n### Fetch Issue\n\nRead the issue.\n\n'
        '- See [Fields](issue.md#fields).\n\n### Save Issue\n\nWrite the issue.\n\n'
        '## Fields\n\n### Template\n\nThe issue template.\n'),
    'skill/modes/sync-mode.md': (
        '# Sync\n\n## Operations\n\n### Close Issue\n\nClose the issue.\n\n'
        + chr(96) * 3 + '\n### Fenced Heading\n' + chr(96) * 3 + '\n'),
}
AFTER = {
    'skill/artifacts/issue.md': (
        '# Issue\n\n## Commands\n\n### Save Issue\n\nWrite the issue.\n\n'
        '## Fields\n\n### Template\n\nThe issue template.\n'),
    'skill/modes/sync-mode.md': (
        '# Sync\n\n## Operations\n\n### Close Issue\n\nClose the issue.\n\n'
        + chr(96) * 3 + '\n### Fenced Heading\n' + chr(96) * 3 + '\n\n'
        '### Fetch Issue\n\nRead the issue.\n\n'
        '- See [Fields](../artifacts/issue.md#fields).\n'),
}


class SectionBodyComparison(unittest.TestCase):
    def judged(self, before, after):
        results, _, _ = checker.compare(before, after)
        return {(kind, title) for kind, _, _, title, _ in results}

    def test_a_moved_section_with_a_retargeted_link_reads_as_moved(self):
        results, _, _ = checker.compare(BEFORE, AFTER)
        moved = [result for result in results if result[3] == 'Fetch Issue']
        self.assertEqual(moved, [('moved', 'skill/artifacts/issue.md',
                                  'skill/modes/sync-mode.md', 'Fetch Issue', [])])

    def test_sections_left_in_place_read_as_identical(self):
        self.assertTrue({('identical', 'Save Issue'), ('identical', 'Template'),
                         ('identical', 'Close Issue')} <= self.judged(BEFORE, AFTER))

    def test_a_heading_inside_a_fence_is_no_section(self):
        _, counted_base, counted_head = checker.compare(BEFORE, AFTER)
        self.assertEqual((counted_base, counted_head), (4, 4))

    def test_a_reworded_body_is_differing_with_its_diff(self):
        after = dict(AFTER)
        after['skill/modes/sync-mode.md'] = after['skill/modes/sync-mode.md'].replace(
            'Read the issue.', 'Read the issue and its comments.')
        results, _, _ = checker.compare(BEFORE, after)
        differing = [result for result in results if result[0] == 'differing']
        self.assertEqual([result[3] for result in differing], ['Fetch Issue'])
        self.assertIn('-Read the issue.', differing[0][4])
        self.assertIn('+Read the issue and its comments.', differing[0][4])

    def test_a_changed_fragment_is_a_difference(self):
        after = dict(AFTER)
        after['skill/modes/sync-mode.md'] = after['skill/modes/sync-mode.md'].replace(
            '#fields', '#template')
        self.assertIn(('differing', 'Fetch Issue'), self.judged(BEFORE, after))

    def test_a_changed_absolute_url_is_a_difference(self):
        before = {'a.md': '### Link\n\n[Docs](https://example.com/one#x)\n'}
        after = {'a.md': '### Link\n\n[Docs](https://example.com/two#x)\n'}
        self.assertEqual(self.judged(before, after), {('differing', 'Link')})

    def test_a_removed_and_an_added_section_are_reported(self):
        after = dict(AFTER)
        after['skill/artifacts/issue.md'] = after['skill/artifacts/issue.md'].replace(
            '### Save Issue', '### Store Issue')
        judged = self.judged(BEFORE, after)
        self.assertIn(('removed', 'Save Issue'), judged)
        self.assertIn(('added', 'Store Issue'), judged)

    def test_an_emptied_body_is_differing(self):
        after = dict(AFTER)
        after['skill/artifacts/issue.md'] = after['skill/artifacts/issue.md'].replace(
            'Write the issue.\n\n', '')
        self.assertIn(('differing', 'Save Issue'), self.judged(BEFORE, after))

    def test_a_heading_its_own_file_still_holds_is_not_paired_elsewhere(self):
        before = {'a.md': '### Template\n\nOne.\n', 'b.md': '### Template\n\nTwo.\n'}
        after = {'a.md': '### Template\n\nOne.\n', 'b.md': '### Template\n\nTwo.\n'}
        self.assertEqual(self.judged(before, after), {('identical', 'Template')})

    def git(self, *arguments):
        subprocess.run(['git', '-c', 'user.name=Specimen', '-c', 'user.email=specimen@example.com',
                        *arguments], cwd=self.root, check=True, capture_output=True)

    def commit(self, files):
        for name, text in files.items():
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
        self.git('add', '-A')
        self.git('commit', '-q', '-m', 'specimen')
        return subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=self.root, check=True,
                              capture_output=True, text=True).stdout.strip()

    def run_comparison(self, base, head):
        here = os.getcwd()
        os.chdir(self.root)
        self.addCleanup(os.chdir, here)
        output = io.StringIO()
        with redirect_stdout(output):
            code = checker.main(['--compare', base, head, 'skill'])
        return code, output.getvalue()

    def specimen_repository(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.git('init', '-q')
        return self.commit(BEFORE)

    def test_the_command_passes_a_clean_move_between_revisions(self):
        base = self.specimen_repository()
        head = self.commit(AFTER)
        code, output = self.run_comparison(base, head)
        self.assertEqual(code, 0)
        self.assertIn('moved: skill/artifacts/issue.md -> skill/modes/sync-mode.md ### Fetch Issue',
                      output)
        self.assertIn(f'4 sections at {base}, 4 sections at {head}, 0 added, removed or differing',
                      output)

    def test_the_command_fails_a_move_that_damaged_a_body(self):
        base = self.specimen_repository()
        after = dict(AFTER)
        after['skill/modes/sync-mode.md'] = after['skill/modes/sync-mode.md'].replace(
            'Read the issue.', 'Read it.')
        head = self.commit(after)
        code, output = self.run_comparison(base, head)
        self.assertEqual(code, 1)
        self.assertIn('differing: skill/artifacts/issue.md -> skill/modes/sync-mode.md ### Fetch Issue',
                      output)
        self.assertIn('  +Read it.', output)

    def test_an_unknown_revision_is_refused(self):
        self.specimen_repository()
        code, output = self.run_comparison('absent', 'HEAD')
        self.assertEqual(code, 1)
        self.assertIn('unreadable revision', output)


class CallersAndReach(unittest.TestCase):
    """Callers decide placement and reach decides what a reader loads, over
    one specimen holding an execution step, a command specification citing a
    sibling, and an artifact keeping its subject's command."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        self.skill.mkdir()
        (self.skill / 'structure.json').write_text(json.dumps(STRUCTURE))
        self.issue = self.write('artifacts/issue.md',
                                '# Issue\n\n## Prerequisites\n\nRead these files first.\n\n'
                                '- [Body](body.md)\n\n## Operations\n\n### Read Tracker Issue\n\n'
                                '- Run [Fetch Issue](#fetch-issue).\n\n## Fields\n\n'
                                'Number, as [Body](body.md#fields) describes.\n\n'
                                '## Commands\n\n### Fetch Issue\n\nFetches it.\n')
        self.body = self.write('artifacts/body.md', '# Body\n\n## Fields\n\nText.\n\n'
                               '## Commands\n\n### Check Body\n\nChecks it.\n')
        self.plan = self.write('modes/plan.md',
                               '# Plan\n\n## Procedure\n\n'
                               '1. **Read.**  Run [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue).\n'
                               '2. **Check.**  Run [Check Plan](#check-plan).\n\n'
                               '## Outcomes\n\nThe plan is read.\n\n## Operations\n\n'
                               '### Check Plan\n\nChecks it.\n\n'
                               '- Run [Check Body](../artifacts/body.md#check-body) first.\n')

    def write(self, name, text):
        path = self.skill / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def files(self):
        return sorted(self.skill.rglob('*.md'))

    def kinds(self, path):
        declared = {}
        return {target: kind for _, target, kind in
                checker.citation_kinds(path, checker.contract(path, declared))}

    def test_an_execution_step_is_a_caller_and_reach(self):
        _, called = checker.citations(self.files(), {})
        reached = checker.reach(self.files(), {})
        self.assertEqual(self.kinds(self.plan)['../artifacts/issue.md#read-tracker-issue'], checker.STEP)
        self.assertEqual(called[self.issue]['read-tracker-issue'], {self.plan})
        self.assertEqual(reached[self.issue]['read-tracker-issue'], {(self.plan, checker.STEP)})

    def test_a_command_specification_link_is_reach_and_no_caller(self):
        cited, called = checker.citations(self.files(), {})
        reached = checker.reach(self.files(), {})
        self.assertEqual(self.kinds(self.plan)['../artifacts/body.md#check-body'], checker.SPECIFICATION)
        self.assertEqual(cited[self.body]['check-body'], {self.plan})
        self.assertNotIn('check-body', called.get(self.body, {}))
        self.assertEqual(reached[self.body]['check-body'], {(self.plan, checker.SPECIFICATION)})

    def test_a_specification_link_moves_no_specification(self):
        """Without the artifact keeping its subject's commands, the body's
        command has one file reaching it. A specification's reach asks for no
        move, and the same citation stated as a step does."""
        (self.skill / 'structure.json').write_text(json.dumps(
            {key: {k: v for k, v in entry.items() if k != 'keeps_commands'}
             for key, entry in STRUCTURE.items()}))

        def placed():
            files = self.files()
            declared = {}
            cited, called = checker.citations(files, declared)
            findings = []
            for path in files:
                findings += checker.check(path, self.root, {}, cited, called, declared)
            return [(Path(where).name, detail) for where, _, kind, detail in findings
                    if kind == 'command specification with one caller']

        self.assertEqual(placed(), [])
        self.write('modes/plan.md', calling('Plan', '../artifacts/body.md#check-body') +
                   '\n## Outcomes\n\nChecked.\n')
        self.assertEqual(placed(), [('body.md', 'Check Body, cited from specimen/modes/plan.md')])

    def test_a_subject_owned_artifact_command_stays_with_its_subject(self):
        _, called = checker.citations(self.files(), {})
        self.assertEqual(called[self.issue]['fetch-issue'], {self.issue})
        self.write('modes/sync.md', calling('Sync', '../artifacts/issue.md#fetch-issue') +
                   '\n## Outcomes\n\nRead.\n')
        files = self.files()
        declared = {}
        cited, called = checker.citations(files, declared)
        findings = []
        for path in files:
            findings += checker.check(path, self.root, {}, cited, called, declared)
        self.assertEqual(findings, [])
        reached = checker.reach(files, declared)
        self.assertEqual({source.name for source, _ in reached[self.issue]['fetch-issue']},
                         {'issue.md', 'sync.md'})

    def test_prerequisites_are_reach_and_descriptive_links_are_neither(self):
        kinds = self.kinds(self.issue)
        self.assertEqual(kinds['body.md'], checker.PREREQUISITE_READ)
        self.assertEqual(kinds['body.md#fields'], checker.DESCRIPTIVE)
        reached = checker.reach(self.files(), {})
        self.assertEqual(reached[self.body][''], {(self.issue, checker.PREREQUISITE_READ)})
        self.assertNotIn('fields', reached[self.body])

    def test_a_canonical_prerequisite_sentence_is_reach(self):
        guide = self.write('references/guide.md',
                           '# Guide\n\nRead [Fields](../artifacts/body.md#fields) first.\n')
        self.assertEqual(self.kinds(guide)['../artifacts/body.md#fields'], checker.PREREQUISITE_READ)


class UncitedSpecifications(unittest.TestCase):
    """A specification no procedure runs stays with the subject whose text
    names it, and one nothing names is reported."""

    COMMANDS = '\n## Commands\n\n### Fetch issue\n\nFetches one issue.\n'

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        self.skill.mkdir()
        (self.skill / 'structure.json').write_text(json.dumps(STRUCTURE))

    def write(self, name, text):
        path = self.skill / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def uncited(self):
        files = sorted(self.skill.rglob('*.md'))
        declared = {}
        cited, called = checker.citations(files, declared)
        found = []
        for path in files:
            found += checker.check(path, self.root, {}, cited, called, declared)
        return [(Path(where).name, detail) for where, _, kind, detail in found
                if kind == 'command specification nothing cites']

    def test_a_specification_no_procedure_runs_and_nothing_cites_is_reported(self):
        self.write('references/catalog.md', '# Catalog\n' + self.COMMANDS)
        self.assertEqual(self.uncited(), [('catalog.md', 'Fetch issue')])

    def test_a_step_citing_it_clears_the_report(self):
        self.write('references/catalog.md', '# Catalog\n' + self.COMMANDS)
        self.write('references/plan.md', calling('Plan', 'catalog.md#fetch-issue'))
        self.assertEqual(self.uncited(), [])

    def test_a_subject_owned_command_nothing_cites_is_reported(self):
        self.write('artifacts/issue.md', '# Issue\n\n## Fields\n\nNumber.\n' + self.COMMANDS)
        self.assertEqual(self.uncited(), [('issue.md', 'Fetch issue')])

    def test_a_subject_owned_command_its_prose_names_stays(self):
        self.write('artifacts/issue.md', '# Issue\n\n## Fields\n\n'
                   'Number, read through [Fetch issue](#fetch-issue).\n' + self.COMMANDS)
        self.assertEqual(self.uncited(), [])

    def test_a_sibling_specification_citing_it_keeps_it(self):
        self.write('references/catalog.md', '# Catalog\n' + self.COMMANDS +
                   '\n### Close issue\n\nCloses one issue.\n'
                   '\n- Run [Fetch issue](#fetch-issue) first.\n')
        self.assertEqual(self.uncited(), [('catalog.md', 'Close issue')])

    def test_a_prerequisite_citing_it_keeps_it(self):
        self.write('references/catalog.md', '# Catalog\n' + self.COMMANDS)
        self.write('references/guide.md',
                   '# Guide\n\nRead [Fetch issue](catalog.md#fetch-issue) first.\n')
        self.assertEqual(self.uncited(), [])

    def test_reference_prose_in_another_file_keeps_it(self):
        self.write('references/catalog.md', '# Catalog\n' + self.COMMANDS)
        self.write('references/guide.md',
                   '# Guide\n\nEvery check opens with [Fetch issue](catalog.md#fetch-issue).\n')
        self.assertEqual(self.uncited(), [])

    def test_the_entry_point_reports_its_specification_as_misplaced_alone(self):
        self.write('SKILL.md', '---\nname: specimen\n---\n\n# Specimen\n' + self.COMMANDS)
        self.assertEqual(self.uncited(), [])


class RepeatedHeadings(unittest.TestCase):
    """A heading whose anchor an earlier heading of its file holds is reported,
    whether or not a link cites it."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        self.skill.mkdir()

    def write(self, name, text):
        path = self.skill / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def repeats(self):
        files = sorted(self.skill.rglob('*.md'))
        cited, called = checker.citations(files, {})
        found = []
        for path in files:
            found += checker.check(path, self.root, {}, cited, called, {})
        return [(Path(where).name, line, detail)
                for where, line, kind, detail in found if kind == 'duplicate anchor']

    def test_a_repeat_nothing_cites_is_reported(self):
        self.write('guide.md', '# Guide\n\n## Terms\n\nOne.\n\n## Terms\n\nTwo.\n')
        self.assertEqual(self.repeats(), [('guide.md', 7, 'terms, also at line 3')])

    def test_a_cited_repeat_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\nSee [terms](guide.md#terms).\n')
        self.write('guide.md', '# Guide\n\n## Terms\n\nOne.\n\n## Terms\n\nTwo.\n')
        self.assertEqual(self.repeats(), [('guide.md', 7, 'terms, also at line 3')])

    def test_titles_differing_only_in_what_the_anchor_drops_are_one_anchor(self):
        self.write('guide.md', '# Guide\n\n## Open Questions\n\nOne.\n\n### open questions?\n\nTwo.\n')
        self.assertEqual(self.repeats(), [('guide.md', 7, 'open-questions, also at line 3')])

    def test_each_further_repeat_names_the_first(self):
        self.write('guide.md', '# Guide\n\n## Problem\n\nA.\n\n## Problem\n\nB.\n\n## Problem\n\nC.\n')
        self.assertEqual(self.repeats(), [('guide.md', 7, 'problem, also at line 3'),
                                          ('guide.md', 11, 'problem, also at line 3')])

    def test_distinct_headings_are_not_repeats(self):
        self.write('guide.md', '# Guide\n\n## Epic Problem\n\nA.\n\n## Task Problem\n\nB.\n')
        self.assertEqual(self.repeats(), [])

    def test_one_title_in_two_files_is_not_a_repeat(self):
        self.write('epic.md', '# Epic\n\n## Problem\n\nA.\n')
        self.write('task.md', '# Task\n\n## Problem\n\nB.\n')
        self.assertEqual(self.repeats(), [])

    def test_a_repeat_inside_a_fence_is_a_specimen(self):
        self.write('guide.md', f'# Guide\n\n## Terms\n\n{FENCE}markdown\n## Terms\n{FENCE}\n')
        self.assertEqual(self.repeats(), [])


class SpecificationInItsCallersCommands(unittest.TestCase):
    """A command specification is one in the Commands section of the mode file
    whose procedure runs it, under a structure declaring mode files by name
    pattern."""

    MODE = '*-mode.md'

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        (self.skill / 'references').mkdir(parents=True)
        (self.skill / 'structure.json').write_text(json.dumps({self.MODE: STRUCTURE[self.MODE]}))
        self.write('references/revise-mode.md',
                   '# Revise\n\n## Procedure\n\n1. **Check.**  Run [Run Skill Checks](#run-skill-checks).\n\n'
                   '## Rules\n\n- **Scope.**  One skill.\n\n## Commands\n\n### Run Skill Checks\n\n'
                   'Checks it.\n\n- Use [Run Project Check](review-mode.md#run-project-check).\n')

    def write(self, name, text):
        path = self.skill / name
        path.write_text(text)
        return path

    def placed(self, root):
        files = sorted(path for path in root.rglob('*.md') if 'fixtures' not in path.relative_to(root).parts)
        declared = {}
        cited, called = checker.citations(files, declared)
        findings = []
        for path in files:
            findings += checker.check(path, root.parent, {}, cited, called, declared)
        held = [(path.name, title) for path in files
                for _, title in checker.specifications(
                    checker.scan(path)[2], checker.held_section(checker.contract(path, declared)))
                if title == 'Run Project Check']
        return held, called, findings

    def test_a_specification_in_its_callers_commands_is_recognized_and_placed(self):
        review = self.write('references/review-mode.md',
                            '# Review\n\n## Procedure\n\n1. **Exercise.**  [Run Project Check](#run-project-check).\n\n'
                            '## Rules\n\n- **Scope.**  One integration.\n\n## Commands\n\n'
                            '### Run Project Check\n\nRuns the selected check.\n')
        held, called, findings = self.placed(self.skill)
        self.assertEqual(held, [('review-mode.md', 'Run Project Check')])
        self.assertEqual(called[review.resolve()]['run-project-check'], {review.resolve()})
        self.assertEqual(findings, [])

    def test_a_specification_away_from_its_one_caller_is_reported(self):
        self.write('references/review-mode.md',
                   '# Review\n\n## Procedure\n\n1. **Exercise.**  [Run Project Check](checks.md#run-project-check).\n\n'
                   '## Rules\n\n- **Scope.**  One integration.\n')
        self.write('references/checks.md', '# Checks\n\n## Commands\n\n### Run Project Check\n\nRuns it.\n')
        self.write('references/revise-mode.md',
                   '# Revise\n\n## Procedure\n\n1. **Check.**  Check it.\n\n## Rules\n\n- **Scope.**  One skill.\n')
        held, _, findings = self.placed(self.skill)
        self.assertEqual(held, [('checks.md', 'Run Project Check')])
        self.assertEqual([(Path(where).name, kind) for where, _, kind, _ in findings],
                         [('checks.md', 'command specification with one caller')])

    def test_a_section_outside_a_commands_section_is_no_specification(self):
        self.write('references/review-mode.md',
                   '# Review\n\n## Procedure\n\n1. **Exercise.**  [Run Project Check](checks.md#run-project-check).\n\n'
                   '## Rules\n\n- **Scope.**  One integration.\n')
        self.write('references/checks.md', '# Checks\n\n## Run Project Check\n\nRuns it.\n')
        self.write('references/revise-mode.md',
                   '# Revise\n\n## Procedure\n\n1. **Check.**  Check it.\n\n## Rules\n\n- **Scope.**  One skill.\n')
        held, _, findings = self.placed(self.skill)
        self.assertEqual(held, [])
        self.assertEqual(findings, [])


def entry_point(description, modes=('Audit', 'Revise')):
    """A specimen entry point whose Modes section lists each named mode."""
    listed = ''.join(f'- **[{mode}](references/{mode.lower()}-mode.md)**\n'
                     f'  - Backward-looking, scoped to one skill\n' for mode in modes)
    return (f'---\nname: specimen\ndescription: {description}\n---\n\n# Specimen\n\n'
            f'One sentence.\n\n## Modes\n\n{listed}')


class FrontmatterAndLayoutChecks(unittest.TestCase):
    """Mode triggers in the description, and one line per paragraph or item."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        (self.skill / 'references').mkdir(parents=True)

    def write(self, name, text):
        path = self.skill / name
        path.write_text(text)
        return path

    def findings(self):
        files = sorted(self.skill.rglob('*.md'))
        cited, called = checker.citations(files)
        out = []
        for path in files:
            out += checker.check(path, self.root, {}, cited, called)
        return [(Path(where).name, line, kind, detail) for where, line, kind, detail in out]

    def modes_found(self):
        return [detail for _, _, kind, detail in self.findings() if kind == 'mode without a trigger phrase']

    def wraps_found(self):
        return [line for _, line, kind, _ in self.findings() if kind == 'hard-wrapped line']

    def seed_modes(self, modes=('Audit', 'Revise')):
        for mode in modes:
            self.write(f'references/{mode.lower()}-mode.md', f'# {mode}\n\nA sentence.\n')

    def test_a_description_triggering_every_mode_reports_nothing(self):
        self.seed_modes()
        self.write('SKILL.md', entry_point('Use to audit workflow X or revise this skill.'))
        self.assertEqual(self.findings(), [])

    def test_a_mode_the_description_never_names_is_reported(self):
        self.seed_modes()
        self.write('SKILL.md', entry_point('Use to audit workflow X.'))
        self.assertEqual(self.modes_found(), ['Revise'])

    def test_a_folded_description_is_read_whole(self):
        self.seed_modes()
        self.write('SKILL.md', entry_point('>-\n  Use to audit workflow X\n  or revising this skill.'))
        self.assertEqual(self.modes_found(), [])

    def test_a_trigger_word_inside_another_word_carries_no_mode(self):
        self.seed_modes(('Plan',))
        self.write('SKILL.md', entry_point('Use to explain a deplanned board.', ('Plan',)))
        self.assertEqual(self.modes_found(), ['Plan'])

    def test_a_skill_without_modes_needs_no_trigger(self):
        self.write('SKILL.md', '---\nname: specimen\ndescription: Use for anything.\n---\n\n# Specimen\n\nOne.\n')
        self.assertEqual(self.findings(), [])

    def test_a_mode_listed_outside_an_entry_point_is_not_read(self):
        self.write('references/guide.md', '# Guide\n\n## Modes\n\n- **[Audit](guide.md)**\n')
        self.assertEqual(self.modes_found(), [])

    def test_a_hard_wrapped_paragraph_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\nOne sentence that the author\nwrapped at a column.\n')
        self.assertEqual(self.wraps_found(), [3])

    def test_a_hard_wrapped_list_item_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\n- An item that the author\n  wrapped at a column.\n- Another.\n')
        self.assertEqual(self.wraps_found(), [3])

    def test_a_body_wrapped_under_its_bold_label_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\n- **Label.**\n  The body, which the author\n  wrapped at a column.\n')
        self.assertEqual(self.wraps_found(), [4])

    def test_a_paragraph_wrapped_three_times_is_reported_once(self):
        self.write('SKILL.md', '# Specimen\n\nOne\nsentence\nwrapped.\n')
        self.assertEqual(self.wraps_found(), [3])

    def test_a_lazy_line_after_a_sub_bullet_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\n1. **Step.**\n   The body.\n   - A sub-bullet.\n   A further line.\n')
        self.assertEqual(self.wraps_found(), [5])

    def test_one_line_items_and_their_structures_report_nothing(self):
        self.write('SKILL.md', '# Specimen\n\nOne paragraph.\n\nAnother paragraph.\n\n'
                               '- **Label.**\n  Its body on one line.\n  - A sub-bullet.\n'
                               '1. **Step.**  Inline body.\n2. A step.\n\n'
                               '| A | B |\n| --- | --- |\n| 1 | 2 |\n\n> A quote.\n\n'
                               '**Inputs:** One line.\n\n**Example:**\n\n<details>\n<summary>More</summary>\n')
        self.assertEqual(self.wraps_found(), [])

    def test_wrapped_text_inside_a_fence_is_a_specimen(self):
        self.write('SKILL.md', f'# Specimen\n\n{FENCE}text\nOne sentence that the author\nwrapped.\n{FENCE}\n')
        self.assertEqual(self.wraps_found(), [])

    def test_a_folded_frontmatter_value_is_not_prose(self):
        self.write('SKILL.md', '---\nname: specimen\ndescription: >-\n  Use for\n  anything.\n---\n\n# Specimen\n\nOne.\n')
        self.assertEqual(self.wraps_found(), [])


class ReviewedCheckCases(unittest.TestCase):
    """Each case the agent review of #1555 raised against the check: every
    Projects (classic) form, prose that only mentions projects, a bulleted
    REST gap, an unbolded mode bullet, and the branches the earlier tests left
    unobserved."""

    setUp = SkillWideChecks.setUp
    write = SkillWideChecks.write
    run_check = SkillWideChecks.run_check
    found = SkillWideChecks.found
    artifact = SkillWideChecks.artifact
    specification = SkillWideChecks.specification
    mode = SkillWideChecks.mode

    def classic(self, line):
        self.write('scripts/board.py', line + '\n')
        return self.found('Projects classic interface')

    # Projects (classic), every form.

    def test_a_classic_project_route_is_reported(self):
        self.assertEqual(self.classic("run(['gh', 'api', 'projects/123/columns'])"), [('board.py', 1)])

    def test_a_classic_route_under_a_placeholder_is_reported(self):
        self.assertEqual(self.classic("ROUTE = '/projects/{project_id}/collaborators'"), [('board.py', 1)])

    def test_a_classic_column_route_is_reported(self):
        self.assertEqual(self.classic("ROUTE = 'projects/columns/cards/7'"), [('board.py', 1)])

    def test_a_classic_project_the_user_creates_is_reported(self):
        self.assertEqual(self.classic("run(['gh', 'api', '--method', 'POST', 'user/projects', '-f', 'name=x'])"),
                         [('board.py', 1)])

    def test_a_classic_project_field_by_number_is_reported(self):
        self.assertEqual(self.classic('QUERY = "{ repository { project(number: 1) { columns { nodes { id } } } } }"'),
                         [('board.py', 1)])

    # Prose and code that only mention projects.

    def test_prose_naming_projects_is_no_interface(self):
        self.write('references/guide.md', '# Guide\n\nThe board spans several projects (repositories and docs).\n')
        self.assertEqual(self.found('Projects classic interface'), [])

    def test_a_function_named_projects_is_no_interface(self):
        self.assertEqual(self.classic('def projects(self):'), [])

    def test_projects_v2_routes_fields_and_board_links_are_no_interface(self):
        self.assertEqual(self.classic(
            "LINKS = ['orgs/o/projectsV2/3', '{ user { projectV2(number: 17) { id } } }', "
            "f'https://github.com/{owner}/projects/{number}', '/home/mike1/projects/dev']"), [])

    # The REST gap.

    def test_a_bulleted_rest_gap_is_accepted(self):
        self.artifact('### Link Issue\n\nLinks one issue.\n\n- **REST gap:** REST exposes no write to the relation.\n\n'
                      f'{FENCE}bash\ngh api graphql -F query=@link.graphql\n{FENCE}\n')
        self.assertEqual(self.found('GraphQL without a REST gap'), [])

    def test_a_gap_stated_by_another_specification_does_not_cover_it(self):
        self.artifact(self.specification('gh api graphql -F query=@link.graphql')
                      + '\n### Unlink Issue\n\nUnlinks one issue.\n\n**REST gap:** None.\n\n'
                      f'{FENCE}bash\ngh api graphql -F query=@unlink.graphql\n{FENCE}\n')
        self.assertEqual(self.found('GraphQL without a REST gap'), [('issue.md', 9)])

    def test_graphql_named_in_prose_needs_no_gap(self):
        self.artifact('### Link Issue\n\nLinks one issue, never through gh api graphql.\n\n'
                      f'{FENCE}bash\ngh api repos/o/r/issues/1\n{FENCE}\n')
        self.assertEqual(self.found('GraphQL without a REST gap'), [])

    # The entry point.

    def test_an_unbolded_mode_bullet_is_checked_for_its_trigger(self):
        self.write('SKILL.md', '---\nname: specimen\ndescription: Use to audit workflow X.\n---\n\n'
                               '# Specimen\n\nOne sentence.\n\n## Modes\n\n'
                               '- **[Audit](modes/audit-mode.md)**\n- [Revise](modes/revise-mode.md)\n')
        self.assertEqual(self.found('mode without a trigger phrase'), [('SKILL.md', 13)])

    def test_a_multi_word_mode_is_carried_by_its_words_in_order(self):
        for description, expected in (('Use when planning changes.', []),
                                      ('Use to plan the work, then change it.', [('SKILL.md', 12)])):
            with self.subTest(description=description):
                self.write('SKILL.md', f'---\nname: specimen\ndescription: {description}\n---\n\n'
                                       '# Specimen\n\nOne sentence.\n\n## Modes\n\n'
                                       '- **[Plan Change](modes/plan-mode.md)**\n')
                self.assertEqual(self.found('mode without a trigger phrase'), expected)

    def test_an_entry_point_commands_section_is_outside_the_set(self):
        self.write('SKILL.md', '# Specimen\n\nA sentence.\n\n## Commands\n\n### Run It\n\nRuns it.\n')
        self.assertEqual(self.found('section outside the set'), [('SKILL.md', 5)])

    # Layout, commands and mood.

    def test_a_heading_followed_by_its_paragraph_is_not_wrapped(self):
        self.write('references/guide.md', '# Guide\nOne sentence directly beneath.\n')
        self.assertEqual(self.found('hard-wrapped line'), [])

    def test_a_fence_language_is_read_whatever_its_case(self):
        self.mode(f'1. **Fetch.**\n   Fetch it.\n\n{FENCE}Bash\ngh api repos/o/r\n{FENCE}\n')
        self.assertEqual(self.found('command spelled out in a mode'), [('plan-mode.md', 8)])

    def test_siblings_under_different_parents_are_not_compared(self):
        self.write('references/coverage.md',
                   '# Coverage\n\n## Engine\n\n### Main Coverage\n\nThe suite establishes the baseline.\n\n'
                   '## Images\n\n### Docker Coverage\n\nUse the reviewed files.\n')
        self.assertEqual(self.found('parallel section in another mood'), [])


WORKFLOW = Path(__file__).resolve().parents[2] / '.github' / 'workflows' / 'verify-skills.yml'


class SkillCheckWorkflow(unittest.TestCase):
    """The skill-check workflow's job steps, run over a seeded `skills/`
    tree: alpha holds a command specification beta's prose cites, so alpha
    judged alone reports it as cited by nothing."""

    CATALOG = '# Catalog\n\n## Commands\n\n### Fetch issue\n\nFetches one issue.\n'
    JUMP = '\n#### Too deep\n\nA sentence.\n'

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        scripts = self.root / 'skills' / 'scripts'
        scripts.mkdir(parents=True)
        shutil.copy(Path(checker.__file__), scripts)
        self.write('alpha/SKILL.md', '# Alpha\n\nA sentence.\n')
        self.write('alpha/references/catalog.md', self.CATALOG)
        self.write('beta/SKILL.md', '# Beta\n\nEvery check opens with '
                   '[Fetch issue](../alpha/references/catalog.md#fetch-issue).\n')

    def write(self, name, text):
        path = self.root / 'skills' / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def run_jobs(self, excluded):
        """Every run step of the skill-check job, in order, with `EXCLUDED`
        set; the job passes when each step exits zero."""
        import yaml
        workflow = yaml.safe_load(WORKFLOW.read_text())
        env = {**os.environ, **workflow.get('env', {}), 'EXCLUDED': excluded}
        output, passed = '', True
        for step in workflow['jobs']['skill-files']['steps']:
            if 'run' not in step:
                continue
            run = subprocess.run(['bash', '--noprofile', '--norc', '-eo', 'pipefail', '-c', step['run']],
                                 cwd=self.root, env=env, capture_output=True, text=True)
            output += run.stdout + run.stderr
            passed = passed and run.returncode == 0
        return passed, output

    def test_the_seeded_tree_reports_nothing_judged_whole(self):
        self.assertEqual(self.run_jobs(''), (True, '3 files checked, 0 findings\n'))

    def test_an_exclusion_only_isolation_supports_fails(self):
        passed, output = self.run_jobs('alpha')
        self.assertFalse(passed)
        self.assertIn('alpha:0: excluded skill without a finding', output)

    def test_an_excluded_skill_with_a_finding_in_the_whole_tree_passes(self):
        self.write('alpha/SKILL.md', '# Alpha\n\nA sentence.\n' + self.JUMP)
        self.assertEqual(self.run_jobs('alpha'),
                         (True, 'alpha excluded, 1 findings held aside\n3 files checked, 0 findings\n'))

    def test_every_skill_excluded_passes(self):
        self.write('alpha/SKILL.md', '# Alpha\n\nA sentence.\n' + self.JUMP)
        self.write('beta/SKILL.md', '# Beta\n\nEvery check opens with '
                   '[Fetch issue](../alpha/references/catalog.md#fetch-issue).\n' + self.JUMP)
        self.assertTrue(self.run_jobs('alpha beta')[0])

    def test_a_finding_in_scope_fails(self):
        self.write('beta/SKILL.md', '# Beta\n\nEvery check opens with '
                   '[Fetch issue](../alpha/references/catalog.md#fetch-issue).\n' + self.JUMP)
        self.assertFalse(self.run_jobs('')[0])

    def test_an_exclusion_naming_no_skill_fails(self):
        self.assertFalse(self.run_jobs('gamma')[0])


class ReviewedExclusionAndUrlCases(unittest.TestCase):
    """Each case the agent review of #1555 at 8bddff05a raised against the
    check: a nested excluded skill and a sibling sharing its name's prefix,
    Projects (classic) called by an absolute API URL, every classic mutation,
    a REST gap named mid-line, a tree holding no skill, and the job running
    the check's own suite."""

    setUp = SkillCheckWorkflow.setUp
    write = SkillCheckWorkflow.write
    run_jobs = SkillCheckWorkflow.run_jobs
    CATALOG = SkillCheckWorkflow.CATALOG
    JUMP = SkillCheckWorkflow.JUMP

    def classic(self, line):
        return checker.CLASSIC.search(line) is not None

    # Exclusions.

    def test_a_nested_excluded_skill_is_held_aside(self):
        self.write('family/x/SKILL.md', '# X\n\nA sentence.\n' + self.JUMP)
        self.write('family/y/SKILL.md', '# Y\n\nA sentence.\n')
        self.assertEqual(self.run_jobs('family/x'),
                         (True, 'family/x excluded, 1 findings held aside\n5 files checked, 0 findings\n'))

    def test_a_sibling_sharing_the_excluded_name_is_reported(self):
        self.write('family/x/SKILL.md', '# X\n\nA sentence.\n' + self.JUMP)
        self.write('family/xy/SKILL.md', '# XY\n\nA sentence.\n' + self.JUMP)
        self.assertEqual(self.run_jobs('family/x'),
                         (False, 'family/xy/SKILL.md:5: heading jump \u2014 h1 to h4\n'
                                 'family/x excluded, 1 findings held aside\n5 files checked, 1 findings\n'))

    def test_a_tree_holding_no_skill_passes(self):
        shutil.rmtree(self.root / 'skills' / 'alpha')
        shutil.rmtree(self.root / 'skills' / 'beta')
        self.assertEqual(self.run_jobs(''), (True, '0 files checked, 0 findings\n'))

    def test_the_workflow_runs_the_checks_own_suite(self):
        import yaml
        jobs = yaml.safe_load(WORKFLOW.read_text())['jobs'].values()
        runs = [step['run'] for job in jobs for step in job['steps'] if 'run' in step]
        self.assertTrue(any(re.search(r'\bpytest\b.*\bskills/test\b', run) for run in runs))

    # Projects (classic) by absolute API URL.

    def test_a_classic_route_by_absolute_api_url_is_reported(self):
        for line in ('gh api https://api.github.com/repos/o/r/projects',
                     'curl https://api.github.com/projects/1',
                     'curl -X POST https://api.github.com/user/projects',
                     'gh api https://api.github.com/orgs/o/projects',
                     'curl https://github.example.com/api/v3/projects/columns/7'):
            with self.subTest(line=line):
                self.assertTrue(self.classic(line))

    def test_board_web_links_and_v2_names_are_no_interface(self):
        for line in ('See https://github.com/orgs/o/projects/3 for the board.',
                     'https://github.com/users/u/projects/17',
                     'gh api https://api.github.com/orgs/o/projectsV2',
                     'deleteProjectV2Item(input: {})', 'createProjectV2(input: {})',
                     'linkProjectV2ToRepository(input: {})', 'updateProjectV2(input: {})'):
            with self.subTest(line=line):
                self.assertFalse(self.classic(line))

    # Every classic mutation.

    def test_every_classic_mutation_is_reported(self):
        for name in ('addProjectCard', 'addProjectColumn', 'moveProjectCard', 'moveProjectColumn',
                     'deleteProjectCard', 'deleteProjectColumn', 'updateProjectCard', 'updateProjectColumn',
                     'createProject', 'updateProject', 'deleteProject', 'cloneProject',
                     'convertProjectCardNoteToIssue', 'linkRepositoryToProject', 'unlinkRepositoryFromProject'):
            with self.subTest(name=name):
                self.assertTrue(self.classic(f'mutation {{ {name}(input: {{}}) {{ clientMutationId }} }}'))

    def test_a_projects_field_without_arguments_is_reported(self):
        self.assertTrue(self.classic('{ repository(owner: "o", name: "r") { projects { totalCount } } }'))
        self.assertFalse(self.classic('{ node(id: "x") { ... on ProjectV2Item { project { title } } } }'))

    # The REST gap.

    def test_a_rest_gap_named_mid_line_is_no_gap(self):
        guide = self.root / 'skills' / 'alpha' / 'artifacts' / 'issue.md'
        guide.parent.mkdir(parents=True)
        guide.write_text('# Issue\n\n## Commands\n\n### Link Issue\n\n'
                         'Links one issue, as the **REST gap:** of Unlink Issue states.\n\n'
                         f'{FENCE}bash\ngh api graphql -F query=@link.graphql\n{FENCE}\n')
        passed, output = self.run_jobs('')
        self.assertFalse(passed)
        self.assertIn('GraphQL without a REST gap', output)


class ExclusionsPlacedByPath(unittest.TestCase):
    """An excluded skill holds a finding aside only when the finding's file
    lies within it, whatever name the finding carries: roots under different
    parents can name files alike."""

    JUMP = SkillCheckWorkflow.JUMP

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)

    def write(self, name, text):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def test_a_like_named_file_under_another_parent_is_reported(self):
        self.write('one/x/SKILL.md', '# X\n\nA sentence.\n' + self.JUMP)
        self.write('two/x/SKILL.md', '# X\n\nA sentence.\n' + self.JUMP)
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.root / 'one' / 'x'), str(self.root / 'two' / 'x'),
                                   '--exclude', str(self.root / 'one' / 'x')])
        self.assertEqual((status, printed.getvalue()),
                         (1, 'x/SKILL.md:5: heading jump \u2014 h1 to h4\n'
                             'x excluded, 1 findings held aside\n2 files checked, 1 findings\n'))


if __name__ == '__main__':
    unittest.main()
