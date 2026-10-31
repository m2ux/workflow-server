"""The shared skill-file check, over seeded skills in a temporary tree."""

import io
import json
import os
import shutil
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
        self.write('SKILL.md', f'# Specimen\n\n## Layout\n\n{FENCE}markdown\n## Layout\n{FENCE}\n')
        self.assertEqual(self.findings(), [])

    def test_a_repeated_anchor_is_reported_when_it_is_cited(self):
        self.write('SKILL.md', '# Specimen\n\nSee [terms](references/guide.md#terms).\n')
        self.write('references/guide.md', '# Guide\n\n## Terms\n\nOne.\n\n## Terms\n\nTwo.\n')
        self.assertIn('duplicate anchor is cited', self.kinds())

    def test_a_repeated_anchor_nobody_cites_is_left_alone(self):
        self.write('references/guide.md', '# Guide\n\n## Terms\n\nOne.\n\n## Terms\n\nTwo.\n')
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
        body = '\n'.join(f'Sentence {number}.' for number in range(9))
        self.write('SKILL.md', f'# Specimen\n\n{body}\n')
        self.assertIn('prose over eight lines', self.kinds())

    def test_eight_lines_of_prose_is_within_the_limit(self):
        body = '\n'.join(f'Sentence {number}.' for number in range(8))
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
        self.write('SKILL.md', '# Specimen\n\n## Route\n\nUse [Spec](#spec) for the run.\n\n'
                               '## Spec\n\nA sentence.\n')
        self.assertEqual(self.findings(), [])

    def test_a_prerequisite_example_in_a_code_span_is_a_specimen(self):
        self.write('SKILL.md', '# Specimen\n\n## Common\n\nOne.\n\n'
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

    def test_a_specification_nobody_cites_stands(self):
        self.write('references/catalog.md', self.CATALOG)
        self.assertEqual(self.findings(), [])

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
                   '# Plan\n\n## Commands\n\n### Close issue\n\nCloses one issue.\n'
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
        self.assertEqual(self.kinds(), {'command specification in the entry point'})

    def test_a_heading_of_a_catalogs_conventions_is_not_a_specification(self):
        self.write('references/commands.md', self.LISTING)
        self.write('references/plan.md', '# Plan\n\nSee [Execution](commands.md#execution) for it.\n')
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
        self.write('modes/plan.md', '# Plan\n')
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
        self.write('artifacts/source.md', '# Source\n\n## Fields\n\nText.\n\n'
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


if __name__ == '__main__':
    unittest.main()
