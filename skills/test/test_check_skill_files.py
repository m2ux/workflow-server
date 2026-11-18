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
from contextlib import redirect_stderr, redirect_stdout
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
    },
    'protocols': {
        'sections': ['Prerequisites', 'Procedure', 'Guidance'],
        'required': ['Procedure'],
    },
    'artifacts': {
        'sections': ['Prerequisites', 'Operations', 'Fields', 'Guidance'],
        'required': ['Fields'],
        'procedures': 'Operations',
    },
    '*-mode.md': {
        'sections': ['Prerequisites', 'Procedure', 'Reference', 'Rules'],
        'required': ['Procedure', 'Rules'],
    },
    '*': {
        'sections': ['Prerequisites', 'Procedure', 'Reference', 'Rules'],
        'required': ['Procedure'],
    },
}


def declare(directory, structure):
    """Write the skill guide whose Sections table declares the structure: one
    column per selector, one row per option, a blank cell where a selector
    leaves an option undeclared."""
    selectors = list(structure)
    options = list(dict.fromkeys(option for entry in structure.values() for option in entry))

    def cell(value):
        if isinstance(value, bool):
            return 'yes' if value else 'no'
        if isinstance(value, list):
            return ', '.join(map(str, value))
        if isinstance(value, dict):
            return ', '.join(f'{name}: {verb}' for name, verb in value.items())
        return str(value)

    rows = [['Option', *selectors], ['---'] * (len(selectors) + 1)]
    rows += [[option, *(cell(structure[s][option]) if option in structure[s] else '' for s in selectors)]
             for option in options]
    directory.mkdir(parents=True, exist_ok=True)
    (directory / 'guidelines.md').write_text(
        '# Guidelines\n\n## Sections\n\n' + ''.join('| ' + ' | '.join(row) + ' |\n' for row in rows))


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
        declare(self.skill, STRUCTURE)

    def write(self, name, text):
        path = self.skill / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def findings(self):
        files = sorted(self.skill.rglob('*.md'))
        declared = {}
        cache = {}
        out = []
        for path in files:
            out += checker.check(path, self.root, cache, declared)
        return [(Path(where).name, line, kind) for where, line, kind, _ in out]

    def kinds(self):
        return {kind for _, _, kind in self.findings()}

    def test_declared_heading_and_unheaded_procedures_preserve_citation_roles(self):
        structure = json.loads(json.dumps(STRUCTURE))
        structure['protocols']['procedures'] = 'Procedure'
        declare(self.skill, structure)
        for body in ('### 1. Read the Issue\n\nRun [Fetch Issue](../artifacts/issue.md#fetch-issue).\n\n'
                     '### 2. Return the Issue\n\nReturn the issue.\n',
                     'Run [Fetch Issue](../artifacts/issue.md#fetch-issue) and return it.\n'):
            with self.subTest(body=body):
                protocol = self.write('protocols/intake.md',
                    '# Intake\n\n## Prerequisites\n\n- [Identity](../artifacts/issue.md#identity)\n\n'
                    '## Procedure\n\n' + body + '\n## Guidance\n\n'
                    'See [Advice](../artifacts/issue.md#advice).\n')
                issue = self.write('artifacts/issue.md',
                    '# Issue\n\n## Operations\n\n### Fetch Issue\n\nFetches one.\n\n'
                    '#### Fetch Issue Inputs\n\n[Identity](#identity)\n\n'
                    '#### Fetch Issue Invocation\n\nAccess the issue.\n\n'
                    '## Fields\n\n### Identity\n\nNumber.\n\n### Advice\n\nContext.\n')
                kinds = {target: kind for _, target, kind in checker.citation_kinds(protocol, structure['protocols'])}
                self.assertEqual(kinds, {'../artifacts/issue.md#identity': checker.PREREQUISITE_READ,
                    '../artifacts/issue.md#fetch-issue': checker.STEP,
                    '../artifacts/issue.md#advice': checker.DESCRIPTIVE})
                _, called = checker.citations([protocol, issue], {})
                self.assertEqual(called[issue]['fetch-issue'], {protocol})
                self.assertEqual(self.findings(), [])

    def scoped_operations(self):
        structure = json.loads(json.dumps(STRUCTURE))
        structure['artifacts']['scoped_children'] = ['Inputs', 'Outputs', 'Procedure']
        declare(self.skill, structure)
        return self.write('artifacts/issue.md', '# Issue\n\n## Operations\n\n'
            '### Read Alpha\n\n#### Inputs\n\nALPHA_INPUT.\n\n'
            '#### Outputs\n\nALPHA_OUTPUT.\n\n#### Procedure\n\nReturn alpha.\n\n'
            '### Read Beta\n\n#### Inputs\n\nBETA_INPUT.\n\n'
            '#### Outputs\n\nBETA_OUTPUT.\n\n#### Procedure\n\nReturn beta.\n\n'
            '## Fields\n\n### Identity\n\nNumber.\n')

    def test_declared_operation_roles_are_scoped_and_unique_operation_links_resolve(self):
        self.scoped_operations()
        self.write('references/guide.md', '# Guide\n\nSee [Alpha](../artifacts/issue.md#read-alpha).\n')
        self.assertEqual(self.findings(), [])

    def test_flat_links_to_repeated_roles_are_unresolved_from_local_and_other_files(self):
        path = self.scoped_operations()
        path.write_text(path.read_text() + '\nSee [Inputs](#inputs).\n')
        self.write('references/guide.md', '# Guide\n\nSee [Inputs](../artifacts/issue.md#inputs).\n')
        self.assertEqual(sum(kind == 'unresolved anchor' for _, _, kind in self.findings()), 2)
        self.assertNotIn('duplicate anchor', self.kinds())

    def test_declared_role_twice_within_one_operation_is_reported(self):
        path = self.scoped_operations()
        path.write_text(path.read_text().replace('ALPHA_INPUT.\n', 'ALPHA_INPUT.\n\n#### Inputs\n\nExtra.\n'))
        self.assertIn('duplicate anchor', self.kinds())

    def test_role_repeated_outside_its_declared_procedure_is_reported(self):
        path = self.scoped_operations()
        path.write_text(path.read_text().replace('### Identity', '### Inputs'))
        self.assertIn('duplicate anchor', self.kinds())

    def test_undeclared_skill_retains_flat_heading_uniqueness(self):
        self.scoped_operations()
        declare(self.skill, STRUCTURE)
        self.assertIn('duplicate anchor', self.kinds())

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

    def test_a_numbered_step_reference_with_a_heading_is_reported(self):
        self.write('references/guide.md', '# Guide\n\n## Procedure\n\n### 1. Fetch\n\nOne.\n\n'
                                          '### 2. Report\n\nRepeat step 1 for each board.\n')
        self.assertIn('unlinked step reference', self.kinds())

    def test_a_named_step_reference_with_a_heading_is_reported(self):
        self.write('references/guide.md', '# Guide\n\n## Procedure\n\n### 1. Arising Issues\n\nOne.\n\n'
                                          '### 2. Report\n\nResume the arising-issues step.\n')
        self.assertIn('unlinked step reference', self.kinds())

    def test_a_linked_or_headless_step_reference_is_allowed(self):
        self.write('references/guide.md', '# Guide\n\n## Procedure\n\n### 1. Fetch\n\nOne.\n\n'
                                          '### 2. Report\n\nRepeat [Fetch](#1-fetch), then the next step, '
                                          'then step 3.\n')
        self.assertNotIn('unlinked step reference', self.kinds())

    def test_a_selection_link_may_point_anywhere_in_its_file(self):
        self.write('references/guide.md', '# Guide\n\n## Route\n\nUse [Spec](#spec) for the run.\n\n'
                                          '## Spec\n\nA sentence.\n')
        self.assertEqual(self.findings(), [])

    def test_a_prerequisite_example_in_a_code_span_is_a_specimen(self):
        self.write('references/guide.md', '# Guide\n\n## Common\n\nOne.\n\n'
                                          '- **Rule.**  Cite it as `Read [Common](#common) first.` in the body.\n')
        self.assertEqual(self.findings(), [])

    CATALOG = '# Catalog\n\n## Commands\n\n### Fetch issue\n\nFetches one issue.\n'
    MODE = '# Plan mode\n\nWhat the mode does.\n'
    PROCEDURE = '\n## Procedure\n\n1. **Open.**  The first step.\n'
    RULES = '\n## Rules\n\n- **Scope.**  One sentence.\n'

    def test_a_commands_section_is_reported_wherever_it_stands(self):
        for name in ('SKILL.md', 'references/catalog.md', 'references/plan-mode.md', 'artifacts/issue.md'):
            with self.subTest(name=name):
                self.write(name, self.CATALOG)
                self.assertIn(('catalog.md' if 'catalog' in name else Path(name).name, 3, 'Commands section'),
                              self.findings())
                (self.skill / name).unlink()

    def test_a_guides_commands_rules_are_no_commands_section(self):
        self.write('references/guidelines.md', '# Guidelines\n\n## Commands\n\n'
                   '- **One spec per operation.**  Every command has a sub-section.\n')
        self.assertNotIn('Commands section', self.kinds())

    def test_a_specification_in_its_running_step_stands(self):
        self.write('references/plan.md', '# Plan\n\n## Procedure\n\n'
                   '1. **Fetch.**  Fetch the issue.\n\n'
                   f'   {FENCE}bash\n   gh api repos/o/r/issues/1\n   {FENCE}\n')
        self.assertEqual(self.findings(), [])

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

    def test_a_procedure_file_no_entry_covers_is_reported(self):
        declare(self.skill, {key: entry for key, entry in STRUCTURE.items() if key != '*'})
        self.write('references/dispatch.md', '# Dispatch\n\nWhat it does.\n' + self.PROCEDURE)
        self.assertEqual(self.kinds(), {'procedure file with no structure entry'})

    def test_a_file_carrying_no_procedure_needs_no_entry(self):
        declare(self.skill, {key: entry for key, entry in STRUCTURE.items() if key != '*'})
        self.write('references/guide.md', '# Guide\n\n## Findings\n\nOne sentence.\n')
        self.assertEqual(self.findings(), [])

    def test_a_directory_entry_covers_its_nested_folders(self):
        self.write('modes/review/plan.md', '# Plan\n\nA plan.\n')
        self.assertEqual([kind for _, _, kind in self.findings()],
                         ['section missing', 'section missing'])

    def test_the_star_entry_is_not_a_suffix_for_every_file(self):
        self.write('references/guide.md', '# Guide\n\n## Findings\n\nOne sentence.\n')
        self.assertEqual(self.findings(), [])

    def test_the_entry_point_keeps_its_own_structure(self):
        self.write('SKILL.md', '---\nname: specimen\n---\n\n# Specimen\n\n'
                               '## Modes\n\n1. **Plan.**  The first mode.\n')
        self.assertEqual(self.findings(), [])

    def test_declared_entry_sections_preserve_order_and_required_sections(self):
        declare(self.skill, {
            '*SKILL.md': {'sections': ['Activities', 'Dependencies'],
                          'required': ['Activities', 'Dependencies']}})
        self.write('SKILL.md', '# Specimen\n\n## Activities\n\nChoose one.\n\n'
                   '## Dependencies\n\nPython.\n')
        self.assertEqual(self.findings(), [])
        self.write('SKILL.md', '# Specimen\n\n## Dependencies\n\nPython.\n\n'
                   '## Activities\n\nChoose one.\n')
        self.assertIn('sections out of order', self.kinds())
        self.write('SKILL.md', '# Specimen\n\n## Activities\n\nChoose one.\n')
        self.assertIn('section missing', self.kinds())

    def test_a_trailing_blank_line_is_reported(self):
        self.write('SKILL.md', '# Specimen\n\nA sentence.\n\n')
        self.assertIn('trailing blank line', self.kinds())

    def test_modes_directory_uses_outcomes_and_operations(self):
        self.write('modes/plan-mode.md', '# Plan\n\n## Procedure\n\n'
                   '1. **Check.**\n   Check the files.\n\n'
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
                   '- Run [Fetch issue](#fetch-issue).\n\n### Fetch Issue\n\nFetches it.\n\n'
                   '## Fields\n\nNumber.\n')
        self.write('artifacts/source.md', '# Source\n\n## Operations\n\n### Fetch Source\n\nFetches it.\n\n'
                   '## Fields\n\nText, read through [Fetch Source](#fetch-source).\n')
        self.assertEqual(self.findings(), [])

    def test_a_single_step_artifact_operation_is_a_caller(self):
        path = self.write('artifacts/issue.md', '# Issue\n\n## Operations\n\n'
                          '### Read Tracker Issue\n\n- Run [Fetch issue](#fetch-issue).\n\n'
                          '### Fetch Issue\n\nFetches it.\n\n## Fields\n\nNumber.\n')
        _, called = checker.citations([path], {})
        self.assertEqual(called[path]['fetch-issue'], {path})


    def test_a_structure_reaches_files_whatever_root_is_named(self):
        """The contract comes from the nearest guide declaring Sections above
        the file under check, so naming the tree or one directory of a skill
        applies the same contract as naming the skill."""
        self.write('modes/plan.md', '# Plan\n\n## Procedure\n\n1. **Check.**  A step.\n\n'
                   '## Outcomes\n\nDone.\n')
        for root in (self.root, self.skill, self.skill / 'modes'):
            with self.subTest(root=root.name):
                printed = io.StringIO()
                with redirect_stdout(printed):
                    status = checker.main([str(root)])
                self.assertEqual((status, printed.getvalue().splitlines()[-1].split(', ')[1]),
                                 (0, '0 findings'))

    def test_a_structure_entry_without_sections_is_refused(self):
        """An entry naming no sections would pass every file it covers, so the
        check reports the contract rather than running on it."""
        declare(self.skill, {'modes': {'required': ['Procedure']}})
        self.write('modes/plan.md', '# Plan\n')
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill)])
        self.assertEqual(status, 1)
        self.assertIn('modes states no sections', printed.getvalue())

    def test_an_unreadable_structure_is_refused(self):
        (self.skill / 'guidelines.md').write_text('# Guidelines\n\n## Sections\n\nNo table.\n')
        self.write('modes/plan.md', '# Plan\n')
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill)])
        self.assertEqual(status, 1)
        self.assertIn('unreadable structure', printed.getvalue())

    def test_declared_section_levels_bound_sections_procedures_and_specifications(self):
        for level in (1, 2, 3):
            with self.subTest(level=level):
                structure = json.loads(json.dumps(STRUCTURE))
                structure['artifacts']['section_level'] = level
                declare(self.skill, structure)
                h = '#' * level
                path = self.write('artifacts/issue.md',
                    f'{h} Operations\n\n{h}# Read Issue\n\n'
                    '- Run [Fetch Issue](#fetch-issue).\n\n'
                    f'{h}# Fetch Issue\n\nFetches it.\n\n'
                    f'{h} Fields\n\n{h}# Identity\n\nNumber.\n')
                self.assertEqual(self.findings(), [])
                _, called = checker.citations([path], {})
                self.assertEqual(called[path], {'fetch-issue': {path}})
                path.write_text(path.read_text() + f'\n{h} Surprise\n\nUnexpected.\n')
                self.assertIn('section outside the set', self.kinds())

    def test_invalid_section_levels_are_refused(self):
        for level in (0, 7, 'one', 'yes', 1.5):
            with self.subTest(level=level):
                declare(self.skill, {
                    'artifacts': {'sections': ['Fields'], 'section_level': level}})
                self.write('artifacts/issue.md', '# Fields\n\nNumber.\n')
                printed = io.StringIO()
                with redirect_stdout(printed):
                    status = checker.main([str(self.skill)])
                self.assertEqual(status, 1)
                self.assertIn('section_level must be an integer from 1 to 6', printed.getvalue())

    def test_declared_levels_keep_required_reads_separate_from_callers(self):
        for key in ('artifacts', '*'):
            for level in (1, 2, 3):
                with self.subTest(key=key, level=level):
                    entry = dict(STRUCTURE[key], section_level=level)
                    declare(self.skill, {key: entry})
                    h = '#' * level
                    procedure = entry.get('procedures', 'Procedure')
                    path = self.write('artifacts/issue.md',
                        f'{h} Prerequisites\n\n- [Context](context.md)\n\n'
                        f'{h} {procedure}\n\n1. Run [Fetch](#fetch).\n\n'
                        f'{h}# Fetch\n\nFetches with [Fields](context.md#fields "○").\n\n'
                        f'{h} Guidance\n\nSee [Advice](context.md#advice).\n')
                    context = path.parent / 'context.md'
                    kinds = {target: kind for _, target, kind in checker.citation_kinds(path, entry)}
                    self.assertEqual(kinds, {'context.md': checker.PREREQUISITE_READ,
                        '#fetch': checker.STEP, 'context.md#fields': checker.SPECIFICATION,
                        'context.md#advice': checker.DESCRIPTIVE})
                    _, called = checker.citations([path], {})
                    self.assertEqual(called, {path: {'fetch': {path}}})
                    reached = checker.reach([path], {})
                    self.assertEqual(reached[context], {'': {(path, checker.PREREQUISITE_READ)},
                        'fields': {(path, checker.SPECIFICATION)}})

    def test_declared_levels_bound_each_graphql_gap(self):
        for level in (1, 2, 3):
            with self.subTest(level=level):
                declare(self.skill, {
                    'artifacts': dict(STRUCTURE['artifacts'], section_level=level)})
                h = '#' * level
                path = self.write('artifacts/issue.md',
                    f'{h} Fields\n\nNumber.\n\n{h} Guidance\n\n'
                    f'{h}# Fetch Issue\n\nFetches it.\n\n{FENCE}bash\n'
                    f'gh api graphql -F query=@issue.graphql\n{FENCE}\n\n'
                    f'{h}# Fetch Board\n\nFetches it.\n\n**REST gap:** Board field.\n\n'
                    f'{FENCE}bash\ngh api graphql -F query=@board.graphql\n{FENCE}\n')
                found = checker.interfaces(path, self.root, {})
                self.assertEqual([(kind, detail) for _, _, kind, detail in found],
                                 [('GraphQL without a REST gap', 'Fetch Issue')])

    def test_declared_levels_bound_mode_command_blocks(self):
        for level in (1, 2, 3):
            with self.subTest(level=level):
                declare(self.skill, {
                    'modes': dict(STRUCTURE['modes'], section_level=level)})
                h = '#' * level
                path = self.write('modes/plan-mode.md',
                    f'{h} Procedure\n\n1. Run [Fetch](#fetch).\n\n'
                    f'{FENCE}bash\ngh api repos/o/r\n{FENCE}\n\n'
                    f'{h} Outcomes\n\nFetched.\n\n'
                    f'{FENCE}bash\ngh api repos/o/r\n{FENCE}\n')
                found = checker.mode_commands(path, self.root, {})
                self.assertEqual([(line, kind) for _, line, kind, _ in found],
                                 [(13, 'command spelled out in a mode')])

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
        declare(self.skill, structure)
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
        return [(line, detail) for _, line, kind, detail
                in checker.check(path, self.root, {}, {})
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
        declare(self.skill, STRUCTURE)
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

    def test_a_shell_block_outside_the_mode_procedure_is_reported(self):
        self.mode('1. **Fetch.**\n   Fetch it.\n',
                  f'### Fetch Issue\n\nFetches one issue.\n\n{FENCE}bash\ngh api repos/o/r\n{FENCE}\n')
        self.assertEqual(self.found('command spelled out in a mode'), [('plan-mode.md', 18)])

    def test_an_unlabelled_block_outside_the_mode_procedure_is_reported(self):
        self.mode('1. **Fetch.**\n   Fetch it.\n', f'### Fetch Issue\n\n{FENCE}\ngh api repos/o/r\n{FENCE}\n')
        self.assertEqual(len(self.found('command spelled out in a mode')), 1)

    def test_a_command_in_the_step_running_it_stands(self):
        self.mode(f'1. **Fetch.**\n   Fetch it.\n\n   {FENCE}bash\n   gh api repos/o/r\n   {FENCE}\n')
        status, printed = self.run_check()
        self.assertEqual((status, printed.splitlines()[-1].split(', ')[1]), (0, '0 findings'))

    def test_a_command_several_steps_run_stands_under_the_procedure(self):
        self.mode('1. **Fetch.**\n   Run [Fetch Issue](#fetch-issue).\n'
                  '2. **Refresh.**\n   Run [Fetch Issue](#fetch-issue) again.\n\n'
                  f'### Fetch Issue\n\nFetches one issue.\n\n{FENCE}bash\ngh api repos/o/r\n{FENCE}\n')
        status, printed = self.run_check()
        self.assertEqual((status, printed.splitlines()[-1].split(', ')[1]), (0, '0 findings'))

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
        return self.write('artifacts/issue.md', '# Issue\n\n## Operations\n\n' + specification
                          + '\n## Fields\n\nNumber, linked through [Link Issue](#link-issue).\n')

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
        self.assertEqual(self.found('GraphQL without a REST gap'), [('issue.md', 5)])

    def test_graphql_through_a_script_without_a_rest_gap_is_reported(self):
        self.artifact(self.specification('python3 scripts/link.py add'),
                      script="run(['gh', 'api', 'graphql', '-F', 'query=@mutation'])\n")
        self.assertEqual(self.found('GraphQL without a REST gap'), [('issue.md', 5)])

    def test_a_script_sending_no_graphql_needs_no_gap(self):
        self.artifact(self.specification('python3 scripts/link.py add'),
                      script="run(['gh', 'api', 'repos/o/r/issues'])\n")
        self.assertEqual(self.found('GraphQL without a REST gap'), [])

    def test_a_classic_projects_mutation_is_reported_whatever_its_gap(self):
        self.artifact(self.specification('gh api graphql -f query=addProjectCard', gap=True))
        self.assertEqual(self.found('Projects classic interface'), [('issue.md', 14)])

    def test_a_classic_projects_endpoint_is_reported(self):
        self.artifact(self.specification("gh api 'repos/<owner>/<repo>/projects'"))
        self.assertEqual(self.found('Projects classic interface'), [('issue.md', 12)])

    def test_a_classic_projects_field_in_prose_is_reported(self):
        self.write('references/guide.md', '# Guide\n\nRead each projectCards entry.\n')
        self.assertEqual(self.found('Projects classic interface'), [('guide.md', 3)])

    def test_a_classic_projects_field_in_a_script_is_reported(self):
        self.write('scripts/board.py', 'QUERY = "{ repository { projects(first: 5) { nodes { id } } } }"\n')
        self.assertEqual(self.found('Projects classic interface'), [('board.py', 1)])

    def test_a_body_file_sent_as_text_is_reported(self):
        self.artifact(self.specification("gh api --method PATCH 'repos/o/r/issues/1' -f 'body=@body.md'"))
        self.assertEqual(self.found('file value sent as text'), [('issue.md', 12)])

    def test_a_body_file_sent_as_text_in_an_html_invocation_is_reported(self):
        self.artifact('### Link Issue\n\nLinks one issue.\n\n<big><pre>\ngh api repos/o/r/issues/1 &#92;\n'
                      "  --raw-field body=@body.md\n</pre></big>\n")
        self.assertEqual(self.found('file value sent as text'), [('issue.md', 11)])

    def test_a_joined_flag_and_a_hyphenated_key_sent_as_text_are_reported(self):
        self.artifact(self.specification("gh api 'repos/o/r/issues/1' --raw-field=body=@body.md -fbody-text=@b.md"))
        self.assertEqual(self.found('file value sent as text'), [('issue.md', 12)])

    def test_a_body_file_read_as_a_file_and_text_sent_as_text_are_accepted(self):
        self.artifact(self.specification("gh api 'repos/o/r/issues/1' -F 'body=@body.md' -f title='Fix @home'"))
        self.write('references/guide.md', '# Guide\n\nNever send -f body=@file, which sends the path.\n')
        self.assertEqual(self.found('file value sent as text'), [])

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
    """Callers are the steps running a target and reach decides what a reader
    loads, over one specimen holding an execution step and an artifact keeping
    its subject's command as an operation of its own."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        self.skill.mkdir()
        declare(self.skill, STRUCTURE)
        self.issue = self.write('artifacts/issue.md',
                                '# Issue\n\n## Prerequisites\n\nRead these files first.\n\n'
                                '- [Body](body.md)\n\n## Operations\n\n### Read Tracker Issue\n\n'
                                '- Run [Fetch Issue](#fetch-issue).\n\n### Fetch Issue\n\nFetches it.\n\n'
                                '## Fields\n\nNumber, as [Body](body.md#fields) describes.\n')
        self.body = self.write('artifacts/body.md', '# Body\n\n## Operations\n\n### Check Body\n\n'
                               'Checks it.\n\n## Fields\n\nText.\n')
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

    def test_a_subject_owned_artifact_command_stays_with_its_subject(self):
        _, called = checker.citations(self.files(), {})
        self.assertEqual(called[self.issue]['fetch-issue'], {self.issue})
        self.write('modes/sync.md', calling('Sync', '../artifacts/issue.md#fetch-issue') +
                   '\n## Outcomes\n\nRead.\n')
        files = self.files()
        declared = {}
        findings = []
        for path in files:
            findings += checker.check(path, self.root, {}, declared)
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
        found = []
        for path in files:
            found += checker.check(path, self.root, {}, {})
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
        out = []
        for path in files:
            out += checker.check(path, self.root, {})
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

    def test_a_bold_label_with_a_coded_asterisk_has_a_separate_body(self):
        self.write('SKILL.md', '# Specimen\n\n- **`exposure:*` has no default.**\n'
                   '  The confirmed row supplies the value.\n')
        self.assertEqual(self.wraps_found(), [])
        self.write('SKILL.md', '# Specimen\n\n- **`exposure:*` has no default.**\n'
                   '  The confirmed row supplies\n  the value.\n')
        self.assertEqual(self.wraps_found(), [4])

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
        self.assertEqual(self.found('GraphQL without a REST gap'), [('issue.md', 5)])

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
        self.mode('1. **Fetch.**\n   Fetch it.\n', f'### Fetch\n\n{FENCE}Bash\ngh api repos/o/r\n{FENCE}\n')
        self.assertEqual(self.found('command spelled out in a mode'), [('plan-mode.md', 16)])

    def test_siblings_under_different_parents_are_not_compared(self):
        self.write('references/coverage.md',
                   '# Coverage\n\n## Engine\n\n### Main Coverage\n\nThe suite establishes the baseline.\n\n'
                   '## Images\n\n### Docker Coverage\n\nUse the reviewed files.\n')
        self.assertEqual(self.found('parallel section in another mood'), [])


class SkillsCheckedTogether(unittest.TestCase):
    """The check run over a seeded `skills/` tree, naming every skill in it:
    alpha holds a section beta's prose cites, which resolves across them."""

    CATALOG = '# Catalog\n\n## Issues\n\n### Fetch issue\n\nFetches one issue.\n'
    JUMP = '\n#### Too deep\n\nA sentence.\n'

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.write('alpha/SKILL.md', '# Alpha\n\nA sentence.\n')
        self.write('alpha/references/catalog.md', self.CATALOG)
        self.write('beta/SKILL.md', '# Beta\n\nEvery check opens with '
                   '[Fetch issue](../alpha/references/catalog.md#fetch-issue).\n')

    def write(self, name, text):
        path = self.root / 'skills' / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)

    def run_check(self, *names):
        """The check over the named skills; it passes when it exits zero."""
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.root / 'skills' / name) for name in names])
        return status == 0, printed.getvalue()

    def test_the_seeded_tree_reports_nothing_judged_whole(self):
        self.assertEqual(self.run_check('alpha', 'beta'), (True, '3 files checked, 0 findings\n'))

    def test_a_finding_fails(self):
        self.write('beta/SKILL.md', '# Beta\n\nEvery check opens with '
                   '[Fetch issue](../alpha/references/catalog.md#fetch-issue).\n' + self.JUMP)
        self.assertFalse(self.run_check('alpha', 'beta')[0])

    def test_the_check_takes_no_exclusion(self):
        printed = io.StringIO()
        with self.assertRaises(SystemExit), redirect_stdout(printed):
            checker.main(['--help'])
        self.assertNotIn('--exclude', printed.getvalue())
        with self.assertRaises(SystemExit) as refused, redirect_stderr(io.StringIO()):
            checker.main([str(self.root / 'skills' / 'alpha'), '--exclude', 'beta'])
        self.assertEqual(refused.exception.code, 2)

    def test_a_run_names_at_least_one_skill(self):
        for argv in ([], ['--quiet'], ['--compare', 'HEAD', 'HEAD']):
            with self.subTest(argv=argv):
                with self.assertRaises(SystemExit) as refused, redirect_stderr(io.StringIO()):
                    checker.main(argv)
                self.assertEqual(refused.exception.code, 2)


class ReviewedUrlCases(unittest.TestCase):
    """Each case the agent review of #1555 at 8bddff05a raised against the
    check's surviving rules: Projects (classic) called by an absolute API URL,
    every classic mutation, and a REST gap named mid-line."""

    CATALOG = SkillsCheckedTogether.CATALOG
    setUp = SkillsCheckedTogether.setUp
    write = SkillsCheckedTogether.write
    run_check = SkillsCheckedTogether.run_check

    def classic(self, line):
        return checker.CLASSIC.search(line) is not None

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
        passed, output = self.run_check('alpha', 'beta')
        self.assertFalse(passed)
        self.assertIn('GraphQL without a REST gap', output)


class DeclaredHeadingModels(unittest.TestCase):
    """The heading model is selected by declarations, independently for each skill."""

    MODEL = {
        'SKILL.md': {'sections': ['Modes', 'Dependencies']},
        'modes': {
            'sections': ['Prerequisites', 'Procedure', 'Outcomes'],
            'required': ['Procedure', 'Outcomes'], 'procedures': 'Procedure',
            'steps': 'headings', 'commands': 'html', 'link_roles': True,
            'preamble': ['../rules.md', '../conventions.md', '#outcomes'],
            'calls': {'artifacts': 'Apply', 'modes': 'Follow', 'protocols': 'Follow'},
        },
        'protocols': {
            'sections': ['Prerequisites', 'Procedure'], 'required': ['Procedure'],
            'procedures': 'Procedure', 'steps': 'headings', 'commands': 'html', 'link_roles': True,
            'preamble': ['../rules.md', '../conventions.md'],
            'calls': {'artifacts': 'Apply', 'modes': 'Follow', 'protocols': 'Follow'},
        },
        'artifacts': {
            'sections': ['Prerequisites', 'Operations', 'Fields'],
            'required': ['Fields'], 'procedures': 'Operations', 'steps': 'headings',
            'commands': 'html', 'contracts': 'Fields', 'link_roles': True,
            'calls': {'artifacts': 'Apply'},
        },
    }
    INVENTORY = '''# Inventory

## Operations

### Read Inventory

An inventory page from supplied evidence.

#### 1. Fetch Inventory Page

Run [Fetch Inventory Page](#fetch-inventory-page "ƒ").

##### Fetch Inventory Page

Fetches one inventory page.

Fetch the requested page using [Limit](#limit "○").

<big><pre>
inventory_fetch { [**limit**](#limit "○"), offset }
</pre></big>

Provide [Page](#page "●").

#### 2. Inspect Inventory Page

Inspect the page against the requested inventory and provide findings.

## Fields

### Limit

The requested page size.

### Page

The returned inventory page.
'''
    MODE = '''# Audit

Audit the supplied inventory.

Follow [Rules](../rules.md), [Conventions](../conventions.md) and [Outcomes](#outcomes).

## Procedure

### 1. Read Inventory

Apply [Read Inventory](../artifacts/inventory.md#read-inventory "ƒ").

## Outcomes

The inventory is checked.
'''
    PROTOCOL = '''# Prepare

Prepare the supplied inventory.

Follow [Rules](../rules.md) and [Conventions](../conventions.md).

## Procedure

### 1. Read Inventory

Apply [Read Inventory](../artifacts/inventory.md#read-inventory "ƒ").
'''

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        self.skill.mkdir()
        self.declare(self.MODEL)
        self.write('SKILL.md', '# Specimen\n\nOne declared skill.\n')
        self.write('rules.md', '# Rules\n\nThe shared scope.\n')
        self.write('conventions.md', '# Conventions\n\nThe execution context.\n')
        self.inventory = self.write('artifacts/inventory.md', self.INVENTORY)
        self.mode = self.write('modes/audit-mode.md', self.MODE)
        self.protocol = self.write('protocols/prepare.md', self.PROTOCOL)

    def write(self, name, text):
        path = self.skill / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def declare(self, model):
        declare(self.skill, model)

    def findings(self):
        files = sorted(self.skill.rglob('*.md'))
        structures = {}
        found = []
        for path in files:
            found += checker.check(path, self.root, {}, structures)
            found += checker.mode_commands(path, self.root, structures)
            found += checker.interfaces(path, self.root, structures)
        return found

    def kinds(self):
        return {kind for _, _, kind, _ in self.findings()}

    def replace(self, path, old, new):
        text = path.read_text()
        self.assertIn(old, text)
        path.write_text(text.replace(old, new))

    def test_the_complete_selected_model_conforms(self):
        self.assertEqual(self.findings(), [])

    def test_explicit_entry_declaration_selects_its_section_set(self):
        self.write('SKILL.md', '# Specimen\n\n## Rules\n\nThe shared scope.\n')
        self.assertIn('section outside the set', self.kinds())

    def test_an_exact_file_declaration_precedes_its_directory(self):
        model = json.loads(json.dumps(self.MODEL))
        model['inventory.md'] = {'sections': ['Fields'], 'required': ['Fields']}
        self.declare(model)
        self.assertIn('section outside the set', self.kinds())

    def test_intro_purpose_can_precede_the_preamble(self):
        self.assertEqual(self.findings(), [])
        self.replace(self.mode, 'Audit the supplied inventory.', 'The inventory supplied by the caller.')
        self.assertEqual(self.findings(), [])

    def test_a_preamble_in_the_procedure_does_not_supply_intro_context(self):
        line = 'Follow [Rules](../rules.md), [Conventions](../conventions.md) and [Outcomes](#outcomes).'
        self.replace(self.mode, line + '\n\n', '')
        self.replace(self.mode, '### 1. Read Inventory\n', '### 1. Read Inventory\n\n' + line + '\n')
        self.assertIn('procedure preamble missing', self.kinds())

    def test_a_preamble_requires_one_complete_intro_line(self):
        self.replace(self.mode, ' and [Outcomes](#outcomes).', '.\n\n[Outcomes](#outcomes).')
        self.assertIn('procedure preamble missing', self.kinds())

    def test_repeated_complete_preambles_are_reported(self):
        line = 'Follow [Rules](../rules.md), [Conventions](../conventions.md) and [Outcomes](#outcomes).'
        self.replace(self.mode, line, line + '\n\n' + line)
        self.assertIn('procedure preamble missing', self.kinds())

    def test_an_ordered_list_cannot_supply_heading_steps(self):
        self.replace(self.mode, '### 1. Read Inventory', '1. Read Inventory')
        self.assertIn('list step in heading model', self.kinds())
        self.assertIn('procedure without heading steps', self.kinds())

    def test_heading_numbers_start_at_one(self):
        self.replace(self.mode, '### 1. Read Inventory', '### 2. Read Inventory')
        self.assertIn('heading step sequence', self.kinds())

    def test_heading_numbers_are_consecutive(self):
        self.replace(self.mode, '## Outcomes', '### 3. Finish Audit\n\nKeep the evidence.\n\n## Outcomes')
        self.assertIn('heading step sequence', self.kinds())

    def test_child_procedures_have_independent_sequences(self):
        self.replace(self.mode, '## Outcomes', '''### 2. Repeat Audit

Follow [Refresh Inventory](#refresh-inventory "ƒ").

### Refresh Inventory

The inventory refreshed for the next pass.

#### 1. Read Refreshed Inventory

Apply [Read Inventory](../artifacts/inventory.md#read-inventory "ƒ").

#### 2. Retain Evidence

Keep the refreshed inventory.

## Outcomes''')
        self.assertEqual(self.findings(), [])
        self.replace(self.mode, '#### 2. Retain Evidence', '#### 3. Retain Evidence')
        self.assertIn('heading step sequence', self.kinds())

    def test_each_artifact_operation_has_its_own_step_sequence(self):
        second = self.INVENTORY.split('### Read Inventory', 1)[1].split('## Fields', 1)[0]
        second = second.replace('Inventory Page', 'Refreshed Page').replace('inventory-page', 'refreshed-page')
        self.replace(self.inventory, '## Fields', '### Refresh Inventory' + second + '## Fields')
        self.assertEqual(self.findings(), [])

    def test_nested_item_without_an_introducing_parent_is_reported(self):
        self.replace(self.mode, 'Apply [Read Inventory]', '  - Apply [Read Inventory]')
        self.assertIn('indented detail in heading model', self.kinds())

    def test_item_nested_under_its_introduction_is_valid(self):
        self.replace(self.mode, 'Apply [Read Inventory]', '- For the refreshed inventory:\n  - Apply [Read Inventory]')
        self.assertEqual(self.findings(), [])

    def test_item_skipping_a_level_is_reported(self):
        self.replace(self.mode, 'Apply [Read Inventory]', '- For the refreshed inventory:\n    - Apply [Read Inventory]')
        self.assertIn('indented detail in heading model', self.kinds())

    def test_nested_item_after_a_blank_line_is_reported(self):
        self.replace(self.mode, 'Apply [Read Inventory]', '- For the refreshed inventory:\n\n  - Apply [Read Inventory]')
        self.assertIn('indented detail in heading model', self.kinds())

    def test_flush_bullets_are_valid_step_detail(self):
        self.replace(self.mode, 'Apply [Read Inventory]', '- Apply [Read Inventory]')
        self.assertEqual(self.findings(), [])

    def test_command_annotation_supplies_input_without_repeated_prose(self):
        self.replace(self.inventory, 'Fetch the requested page using [Limit](#limit "○").', '')
        self.assertEqual(self.findings(), [])

    def test_command_arguments_require_role_titles(self):
        self.replace(self.inventory, '[**limit**](#limit "○")', '[**limit**](#limit)')
        self.assertIn('invocation argument contract', self.kinds())

    def test_command_annotation_can_supply_the_output(self):
        self.replace(self.inventory, 'Provide [Page](#page "●").', 'The page is available.')
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }',
                     'inventory_fetch { [**limit**](#limit "○"), offset } &gt; [**page**](#page "●")')
        self.assertEqual(self.findings(), [])

    def test_command_transformation_annotation_resolves_its_callable(self):
        self.replace(self.inventory, 'inventory_fetch {', '[**inventory_fetch**](#read-inventory "ƒ") {')
        self.assertEqual(self.findings(), [])

    def test_unselected_role_model_keeps_argument_field_validation(self):
        model = {name: dict(entry) for name, entry in self.MODEL.items()}
        model['artifacts'].pop('link_roles')
        self.declare(model)
        self.replace(self.inventory, 'inventory_fetch {', '[**inventory_fetch**](#read-inventory "ƒ") {')
        self.assertIn('invocation argument contract', self.kinds())

    def test_command_transformation_cannot_select_a_field(self):
        self.replace(self.inventory, 'inventory_fetch {', '[**inventory_fetch**](#limit "ƒ") {')
        self.assertIn('operation link role', self.kinds())

    def test_repeated_command_parameter_list_is_reported(self):
        self.replace(self.inventory, '### Limit', '### Offset\n\nThe page offset.\n\n### Limit')
        self.replace(self.inventory, ', offset }', ', [**offset**](#offset "○") }')
        self.replace(self.inventory, 'Fetch the requested page using [Limit](#limit "○").',
                     'Run the command using [Limit](#limit "○") and [Offset](#offset "○").')
        self.assertIn('duplicate command parameter prose', self.kinds())

    def test_long_shell_invocation_requires_continuations(self):
        command = 'inventory_fetch --limit [**limit**](#limit "○") --label ' + "'" + 'x' * 140 + "'"
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }', command)
        self.assertIn('unwrapped shell invocation', self.kinds())
        self.replace(self.inventory, command, command.replace(' --', ' \\\n  --'))
        self.assertNotIn('unwrapped shell invocation', self.kinds())

    def test_word_titles_do_not_supply_role_contracts(self):
        self.replace(self.inventory, '#limit "○"', '#limit "input"')
        self.replace(self.inventory, '#page "●"', '#page "output"')
        self.replace(self.mode, '#read-inventory "ƒ"', '#read-inventory "operation"')
        self.assertIn('command contract links', self.kinds())
        self.assertIn('operation link role', self.kinds())

    def test_each_command_provides_a_contextual_output(self):
        self.replace(self.inventory, 'Provide [Page](#page "●").', 'Provide the page.')
        self.assertIn('command contract links', self.kinds())

    def test_input_links_cannot_select_an_operation_as_a_field(self):
        self.replace(self.inventory, '[Limit](#limit "○")', '[Limit](#read-inventory "○")')
        self.assertIn('command contract links', self.kinds())

    def test_a_callable_link_requires_its_operation_title(self):
        self.replace(self.mode, '#read-inventory "ƒ"', '#read-inventory')
        self.assertIn('operation link role', self.kinds())

    def test_an_operation_title_cannot_select_a_field(self):
        self.replace(self.mode, '#read-inventory "ƒ"', '#limit "ƒ"')
        self.assertIn('operation link role', self.kinds())

    def test_role_links_in_headings_do_not_supply_prose_inputs(self):
        self.replace(self.inventory, 'Fetch the requested page using [Limit](#limit "○").',
                     'Fetch the requested page.')
        self.replace(self.inventory, '[**limit**](#limit "○")', 'limit')
        self.replace(self.inventory, '#### 1. Fetch Inventory Page',
                     '#### 1. Fetch [Limit](#limit "○")')
        self.assertIn('command contract links', self.kinds())

    def test_role_titles_preserve_destinations_and_do_not_create_field_callers(self):
        self.assertEqual(checker.LINK.findall('[Limit](#limit "○")'), ['#limit'])
        kinds = checker.citation_kinds(self.inventory, self.MODEL['artifacts'])
        self.assertTrue(any(target == '#limit' and kind == checker.SPECIFICATION for _, target, kind in kinds))
        self.assertFalse(any(target == '#page' and kind == checker.STEP for _, target, kind in kinds))

    def test_contract_links_can_reach_another_artifacts_fields(self):
        self.write('artifacts/source.md', '# Source\n\n## Fields\n\n### Limit\n\nThe page size.\n')
        self.replace(self.inventory, '[Limit](#limit "○")', '[Limit](source.md#limit "○")')
        self.replace(self.inventory, '[**limit**](#limit "○")', '[**limit**](source.md#limit "○")')
        self.assertEqual(self.findings(), [])

    def test_fenced_shell_and_tool_invocations_are_rejected(self):
        for language in ('bash', 'shell', 'console', 'tool', ''):
            with self.subTest(language=language):
                self.inventory.write_text(self.INVENTORY.replace('<big><pre>', FENCE + language).replace('</pre></big>', FENCE))
                self.assertIn('fenced invocation in HTML model', self.kinds())

    def test_a_fenced_markdown_template_is_specimen_text(self):
        self.replace(self.inventory, 'Fetch the requested page using [Limit](#limit "○").',
                     'Fetch the requested page using [Limit](#limit "○").\n\n' + FENCE + 'markdown\n<big><pre>\n[**missing**](#absent)\n' + FENCE)
        self.assertEqual(self.findings(), [])

    def test_malformed_html_wrappers_are_reported(self):
        for replacement in ('<pre>', '<big>', '<big><pre>\n<big><pre>'):
            with self.subTest(replacement=replacement):
                self.inventory.write_text(self.INVENTORY.replace('<big><pre>', replacement))
                self.assertIn('malformed HTML invocation', self.kinds())

    def test_an_unclosed_html_wrapper_is_reported(self):
        self.replace(self.inventory, '</pre></big>\n', '')
        self.assertIn('malformed HTML invocation', self.kinds())

    def test_an_empty_html_invocation_is_reported(self):
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }', '')
        self.assertIn('malformed HTML invocation', self.kinds())

    def test_an_html_invocation_belongs_to_its_command_specification(self):
        command = '<big><pre>\ninventory_fetch { [**limit**](#limit "○"), offset }\n</pre></big>\n\n'
        self.replace(self.inventory, command, '')
        self.replace(self.inventory, '#### 2. Inspect', command + '#### 2. Inspect')
        # The specification owns the invocation up to its next heading.
        self.assertEqual(self.findings(), [])
        self.replace(self.inventory, command + '#### 2. Inspect', '#### 2. Inspect')
        self.replace(self.inventory, '## Fields\n', '## Fields\n\n' + command)
        self.assertIn('invocation outside a procedure', self.kinds())

    def test_raw_html_in_invocations_is_rejected(self):
        for payload in ('[**<limit>**](#limit "○")', "'<workspace>'", '>', '>>', '<'):
            with self.subTest(payload=payload):
                self.inventory.write_text(self.INVENTORY.replace(
                    'inventory_fetch {', 'inventory_fetch ' + payload + ' {'))
                self.assertIn('unescaped HTML in invocation', self.kinds())

    def test_encoded_invocation_literals_preserve_contracts(self):
        for payload in ('[**&lt;limit&gt;**](#limit "○")', "'&lt;workspace&gt;'", '&gt;', '&gt;&gt;', '&lt;'):
            with self.subTest(payload=payload):
                self.inventory.write_text(self.INVENTORY.replace(
                    'inventory_fetch {', 'inventory_fetch ' + payload + ' {'))
                self.assertEqual(self.findings(), [])

    def test_inline_invocation_wrappers_are_not_literal_html(self):
        self.replace(self.inventory, '<big><pre>\ninventory_fetch { [**limit**](#limit "○"), offset }\n</pre></big>',
                     '<big><pre>inventory_fetch { [**limit**](#limit "○"), offset }</pre></big>')
        self.assertEqual(self.findings(), [])

    def test_argument_links_resolve_even_among_shell_quoting(self):
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }',
                     "cmd --literal '&lt;workspace&gt;' \\\n  --input `[**limit**](#limit \"○\")` --json '{\"key\": \"value\"}'")
        self.assertEqual(self.findings(), [])

    def test_literal_brackets_before_argument_links_keep_their_contracts(self):
        for redirection in ('&gt;', '&gt;&gt;'):
            with self.subTest(redirection=redirection):
                command = ('gh api --paginate "repos/o/r/pulls?state=all&per_page=100" '
                           '--jq \'.[] | select(.title | startswith("[I") or startswith("[F"))\' '
                           + redirection + " '[**limit**](#limit \"○\")'")
                command = command.replace(' --', ' \\\n  --')
                self.inventory.write_text(self.INVENTORY.replace(
                    'inventory_fetch { [**limit**](#limit "○"), offset }', command))
                self.assertEqual(self.findings(), [])

    def test_literal_brackets_do_not_hide_unbold_contract_links(self):
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }',
                     "cmd --filter '[I' --output '[**limit**](#limit \"○\")' --input '[limit](#limit)'")
        self.assertIn('invocation argument contract', self.kinds())

    def test_literal_brackets_do_not_hide_broken_argument_targets(self):
        for target in ('#absent', '#read-inventory'):
            with self.subTest(target=target):
                self.inventory.write_text(self.INVENTORY.replace(
                    'inventory_fetch { [**limit**](#limit "○"), offset }',
                    "cmd --filter '[I' --output '[**limit**](" + target + ")'"))
                self.assertIn('invocation argument contract', self.kinds())

    def test_a_missing_argument_anchor_is_reported(self):
        self.replace(self.inventory, '[**limit**](#limit "○")', '[**limit**](#absent)')
        self.assertIn('unresolved anchor', self.kinds())
        self.assertIn('invocation argument contract', self.kinds())

    def test_a_missing_argument_file_is_reported(self):
        self.replace(self.inventory, '[**limit**](#limit "○")', '[**limit**](missing.md#limit)')
        self.assertIn('unresolved link', self.kinds())

    def test_a_contract_backed_argument_link_is_bold(self):
        self.replace(self.inventory, '[**limit**](#limit "○")', '[limit](#limit)')
        self.assertIn('invocation argument contract', self.kinds())

    def test_argument_targets_are_contracts_not_arbitrary_headings(self):
        self.replace(self.inventory, '[**limit**](#limit "○")', '[**limit**](#read-inventory)')
        self.assertIn('invocation argument contract', self.kinds())

    def test_literal_headings_and_fences_in_html_do_not_change_markdown_state(self):
        payload = '### Literal Heading\n' + FENCE + 'bash\n1. literal command text\n- **Literal label**\n' + FENCE
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }', payload)
        lines, fenced, headings = checker.scan(self.inventory)
        self.assertEqual(lines, self.inventory.read_text().splitlines())
        self.assertNotIn('Literal Heading', [title for _, _, title in headings])
        self.assertFalse(any(fenced))
        self.assertEqual(self.findings(), [])

    def test_argument_contracts_are_required_reach_and_not_operation_callers(self):
        files = sorted(self.skill.rglob('*.md'))
        declared = {}
        _, called = checker.citations(files, declared)
        self.assertNotIn('limit', called.get(self.inventory, {}))
        self.assertEqual(called[self.inventory]['read-inventory'], {self.mode, self.protocol})
        self.assertIn((self.inventory, checker.SPECIFICATION), checker.reach(files, declared)[self.inventory]['limit'])

    def test_artifact_operations_use_the_declared_apply_verb(self):
        self.replace(self.mode, 'Apply [Read Inventory]', 'Follow [Read Inventory]')
        self.assertIn('operation call verb', self.kinds())

    def test_mode_and_protocol_calls_use_follow(self):
        self.replace(self.mode, 'Apply [Read Inventory](../artifacts/inventory.md#read-inventory "ƒ").',
                     'Follow [Prepare](../protocols/prepare.md "ƒ").')
        self.assertEqual(self.findings(), [])
        self.replace(self.mode, 'Follow [Prepare]', 'Apply [Prepare]')
        self.assertIn('operation call verb', self.kinds())

    def test_field_citations_are_not_operation_calls(self):
        self.replace(self.mode, 'Apply [Read Inventory](../artifacts/inventory.md#read-inventory "ƒ").',
                     'Inspect [Limit](../artifacts/inventory.md#limit).')
        self.assertEqual(self.findings(), [])

    def test_html_graphql_needs_its_own_specification_rest_gap(self):
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }', 'gh api graphql -F query=@query.graphql')
        self.assertIn('GraphQL without a REST gap', self.kinds())
        self.replace(self.inventory, 'Fetch the requested page using [Limit](#limit "○").', 'Fetch the requested page using [Limit](#limit "○").\n\n**REST gap:** REST exposes no relation write.')
        self.assertNotIn('GraphQL without a REST gap', self.kinds())

    def test_another_specifications_rest_gap_cannot_cover_an_invocation(self):
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }', 'gh api graphql -F query=@query.graphql')
        self.replace(self.inventory, '## Fields', '### Retain Evidence\n\n**REST gap:** REST exposes no relation write.\n\n## Fields')
        self.assertIn('GraphQL without a REST gap', self.kinds())

    def test_html_script_access_retains_interface_validation(self):
        self.write('scripts/read.py', "COMMAND = 'gh api graphql'\n")
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }', 'python3 scripts/read.py')
        self.assertIn('GraphQL without a REST gap', self.kinds())

    def test_html_commands_still_reject_projects_classic(self):
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }', 'gh api projects/123/columns')
        self.assertIn('Projects classic interface', self.kinds())

    def test_declarations_are_applied_from_each_supported_cli_root(self):
        for root in (self.root, self.skill, self.skill / 'modes'):
            with self.subTest(root=root):
                printed = io.StringIO()
                with redirect_stdout(printed):
                    status = checker.main([str(root)])
                self.assertEqual(status, 0, printed.getvalue())
                self.assertIn('0 findings', printed.getvalue())

    def test_distinct_skills_retain_their_declared_models(self):
        legacy = self.root / 'legacy'
        legacy.mkdir()
        declare(legacy, STRUCTURE)
        (legacy / 'SKILL.md').write_text('# Legacy\n\n## Rules\n\nThe existing rule.\n')
        (legacy / 'modes').mkdir()
        (legacy / 'modes/plan.md').write_text('# Plan\n\n## Procedure\n\n1. Read it.\n\n## Outcomes\n\nDone.\n')
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.root)])
        self.assertEqual(status, 0, printed.getvalue())

    def test_specimen_role_links_do_not_supply_operation_inputs(self):
        self.replace(self.inventory, '[**limit**](#limit "○")', 'limit')
        self.replace(self.inventory, 'Fetch the requested page using [Limit](#limit "○").',
                     FENCE + 'markdown\nUse [Limit](#limit "○").\n' + FENCE)
        self.assertIn('command contract links', self.kinds())

    def test_literal_rest_gap_text_in_payload_is_not_evidence(self):
        self.replace(self.inventory, 'inventory_fetch { [**limit**](#limit "○"), offset }',
                     'gh api graphql -F query=@query.graphql\n**REST gap:** A literal payload line.')
        self.assertIn('GraphQL without a REST gap', self.kinds())

    def test_indented_step_paragraphs_are_reported(self):
        self.replace(self.mode, 'Apply [Read Inventory]', '  Apply [Read Inventory]')
        self.assertIn('indented detail in heading model', self.kinds())

    def test_code_spans_before_calls_preserve_the_call_prefix(self):
        self.replace(self.mode, 'Apply [Read Inventory]', 'For `current`, Apply [Read Inventory]')
        self.assertEqual(self.findings(), [])

    def test_path_shaped_selectors_are_refused(self):
        model = json.loads(json.dumps(self.MODEL))
        model['../modes'] = model['modes']
        self.declare(model)
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill)])
        self.assertEqual(status, 1)
        self.assertIn('invalid file selector', printed.getvalue())

    def test_malformed_models_fail_closed_before_file_validation(self):
        invalid = [
            {'sections': ['Procedure', 'Procedure']},
            {'required': ['Absent']}, {'steps': 'lists'},
            {'commands': 'fenced'}, {'contracts': 'Absent'}, {'preamble': ['rules.md', '']},
            {'calls': {'artifacts': 'Run'}}, {'calls': 'artifacts'},
            {'keeps_commands': True}, {'link_roles': 'true'}, {'unknown': True}, {'procedures': 'Absent'},
            {'specifications': 'Procedure'},
        ]
        for values in invalid:
            with self.subTest(values=values):
                model = json.loads(json.dumps(self.MODEL))
                model['modes'].update(values)
                self.declare(model)
                printed = io.StringIO()
                with redirect_stdout(printed):
                    status = checker.main([str(self.skill)])
                self.assertEqual(status, 1)
                self.assertIn('unreadable structure', printed.getvalue())

    def test_a_specifications_key_is_refused(self):
        """A specification stands in the step running it, so a structure
        naming a section to hold specifications is refused."""
        model = json.loads(json.dumps(self.MODEL))
        model['artifacts']['specifications'] = 'Operations'
        self.declare(model)
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill)])
        self.assertEqual(status, 1)
        self.assertIn('artifacts has unknown options: specifications', printed.getvalue())

    def test_a_commands_section_is_refused_in_a_heading_model(self):
        self.replace(self.inventory, '## Fields', '## Commands\n\n### Fetch Page\n\nFetches one.\n\n## Fields')
        self.assertIn('Commands section', self.kinds())

    def test_an_operation_several_steps_run_may_be_one_specification(self):
        spec = self.INVENTORY.split('##### Fetch Inventory Page\n', 1)[1].split('#### 2.', 1)[0]
        self.replace(self.inventory, '##### Fetch Inventory Page\n' + spec, '')
        self.replace(self.inventory, '## Fields', '### Fetch Inventory Page\n' + spec + '## Fields')
        self.replace(self.inventory, 'Inspect the page against', 'Run [Fetch Inventory Page](#fetch-inventory-page "ƒ") '
                     'again, then inspect the page against')
        self.assertEqual(self.findings(), [])

    def test_nested_calls_have_no_duplicate_io_contract(self):
        self.replace(self.inventory, 'Run [Fetch Inventory Page](#fetch-inventory-page "ƒ").',
                     'Run [Fetch Inventory Page](#fetch-inventory-page "ƒ") with [Limit](#limit "○").')
        self.assertIn('command contract links', self.kinds())

    def test_command_calls_use_run(self):
        self.replace(self.inventory, 'Run [Fetch Inventory Page]', 'Apply [Fetch Inventory Page]')
        self.assertIn('operation call verb', self.kinds())

    def test_a_procedures_output_does_not_supply_the_command_contract(self):
        self.replace(self.inventory, 'Provide [Page](#page "●").', 'Provide the page.')
        self.replace(self.inventory, 'Inspect the page against the requested inventory and provide findings.',
                     'Provide [Page](#page "●").')
        self.assertIn('command contract links', self.kinds())

    def test_entity_continuations_preserve_shell_tokenization(self):
        self.assertEqual(checker.logical_command_lines('git &#92;\n  status'), ['git status'])

    def test_a_step_names_its_action_without_repeating_its_parent(self):
        self.replace(self.inventory, '#### 1. Fetch Inventory Page', '#### 1. Read Inventory')
        self.assertIn('repeated procedure title', self.kinds())

    def test_a_specification_contains_exactly_one_invocation(self):
        command = '<big><pre>\ninventory_fetch { [**limit**](#limit "○"), offset }\n</pre></big>'
        self.replace(self.inventory, command, command + '\n\n' + command)
        self.assertIn('malformed HTML invocation', self.kinds())

    def test_a_table_not_headed_option_is_refused(self):
        (self.skill / 'guidelines.md').write_text(
            '# Guidelines\n\n## Sections\n\n| Kind | modes |\n| --- | --- |\n| sections | Procedure |\n')
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill)])
        self.assertEqual(status, 1)
        self.assertIn('Sections holds no table headed Option', printed.getvalue())

    def test_a_row_with_the_wrong_cell_count_is_refused(self):
        (self.skill / 'guidelines.md').write_text(
            '# Guidelines\n\n## Sections\n\n| Option | modes |\n| --- | --- |\n| sections | Procedure | Rules |\n')
        printed = io.StringIO()
        with redirect_stdout(printed):
            status = checker.main([str(self.skill)])
        self.assertEqual(status, 1)
        self.assertIn("Sections row 'sections' has 3 cells, not 2", printed.getvalue())


class FieldsBoundary(unittest.TestCase):
    """Fields state values: execution under them fails."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        self.skill.mkdir()
        declare(self.skill, DeclaredHeadingModels.MODEL)
        self.write('SKILL.md', '# Specimen\n\nOne declared skill.\n')
        self.write('rules.md', '# Rules\n\nThe shared scope.\n')
        self.write('conventions.md', '# Conventions\n\nThe execution context.\n')
        self.write('artifacts/agent-review.md', '# Agent Review\n\n## Fields\n\n### Review Record\n\nA record.\n')
        self.write('artifacts/board-queue.md', '# Board Queue\n\n## Fields\n\n### Epic Activity\n\nActive.\n\n'
                   '### Task Eligibility\n\nEligible.\n\n### Unresolvable Dependencies\n\nUnresolvable.\n')

    def write(self, name, text):
        path = self.skill / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def artifact(self, body, heading='Status Changes', section='Fields', name='artifacts/board-delivery.md'):
        """An artifact holding one operation and the body under one field heading."""
        return self.write(name, '# Board Delivery\n\n## Operations\n\n### Read Board\n\nThe board.\n\n'
                          '#### 1. Inspect Board\n\nInspect the board and provide findings.\n\n'
                          f'## {section}\n\n### Board Items\n\nThe supplied board items.\n\n### {heading}\n\n{body}\n')

    def kinds(self, path):
        return [(line, kind, detail) for _, line, kind, detail in checker.check(path, self.root, {}, {})]

    def line_of(self, path, text):
        return next(number for number, line in enumerate(path.read_text().splitlines(), 1) if text in line)

    def test_numbered_steps_and_headings_under_fields_are_execution(self):
        path = self.artifact('The changes.\n\n1. Read the board.\n2. Write each change.\n\n#### 1. Apply Changes\n\nApply them.')
        found = [(line, kind) for line, kind, _ in self.kinds(path) if kind == 'executable step in Fields']
        self.assertEqual(found, [(self.line_of(path, '1. Read the board.'), 'executable step in Fields'),
                                 (self.line_of(path, '2. Write each change.'), 'executable step in Fields'),
                                 (self.line_of(path, '#### 1. Apply Changes'), 'executable step in Fields')])

    def test_an_operation_call_under_fields_is_execution_and_a_definition_link_is_not(self):
        path = self.artifact('Apply [Read Board](#read-board "ƒ") before saving.')
        details = [detail for _, kind, detail in self.kinds(path) if kind == 'executable step in Fields']
        self.assertEqual(details, ['call: Apply [Read Board](#read-board "ƒ")'])
        path = self.artifact('The board as [Read Board](#read-board "ƒ") provides it.')
        self.assertNotIn('executable step in Fields', {kind for _, kind, _ in self.kinds(path)})

    def test_declared_call_verbs_match_literally(self):
        entry = {'contracts': 'Fields', 'calls': {'artifacts': 'App.y'}}
        path = self.artifact('Appxy [Read Board](#read-board "ƒ") before saving.')
        self.assertEqual(list(checker.fields_steps(path, *checker.scan(path), entry)), [])
        path = self.artifact('App.y [Read Board](#read-board "ƒ") before saving.')
        self.assertEqual([detail for _, detail in checker.fields_steps(path, *checker.scan(path), entry)],
                         ['call: App.y [Read Board](#read-board "ƒ")'])

    def test_command_invocations_under_fields_keep_their_own_kinds(self):
        path = self.artifact('<big><pre>\ngh issue view 1\n</pre></big>')
        self.assertIn('invocation outside a procedure', {kind for _, kind, _ in self.kinds(path)})
        path = self.artifact(FENCE + 'bash\ngh issue view 1\n' + FENCE)
        self.assertIn('fenced invocation in HTML model', {kind for _, kind, _ in self.kinds(path)})

    def test_specimen_steps_under_fields_are_not_execution(self):
        path = self.artifact(FENCE + 'markdown\n1. Read the board.\nApply [Read Board](#read-board "ƒ").\n' + FENCE
                             + '\n\nThe template above, eg `1. Apply [Read Board](#read-board "ƒ")`.')
        self.assertNotIn('executable step in Fields', {kind for _, kind, _ in self.kinds(path)})


class InstalledWorkPlannerModel(unittest.TestCase):
    """The installed Work Planner's Fields, as its declared model selects them."""

    SKILL = Path(__file__).resolve().parents[1] / 'work-planner'

    def setUp(self):
        self.paths = sorted(path for path in self.SKILL.rglob('*.md') if 'fixtures' not in path.parts)

    def test_installed_fields_hold_no_execution(self):
        files = [(path, self.SKILL.parent) for path in self.paths]
        kinds = {kind for path, root in files for _, _, kind, _ in checker.check(path, root, {}, {})}
        self.assertNotIn('executable step in Fields', kinds)


class EntryPointLinks(unittest.TestCase):
    """SKILL.md is the compilation entry, so no other file of the skill links it; a plain mention is no link."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.root)
        self.skill = self.root / 'specimen'
        self.write('SKILL.md', '# Specimen\n\nSee [guide](references/guide.md) and [Modes](#modes).\n\n## Modes\n\nOne.\n')

    def write(self, name, text):
        path = self.skill / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
        return path

    def found(self):
        files = sorted(self.skill.rglob('*.md'))
        out = []
        for path in files:
            out += checker.check(path, self.root, {}, {})
        return [(str(Path(where).relative_to('specimen')), line, kind)
                for where, line, kind, _ in out if kind == 'link to the entry point']

    def test_a_link_to_the_entry_point_is_reported(self):
        self.write('references/guide.md', '# Guide\n\nEach kind the [entry point](../SKILL.md#modes) lists.\n')
        self.assertEqual(self.found(), [('references/guide.md', 3, 'link to the entry point')])

    def test_a_plain_mention_and_the_entry_point_linking_itself_pass(self):
        self.write('references/guide.md', '# Guide\n\nRevise changes SKILL.md and its `[entry](../SKILL.md)` specimen.\n')
        self.assertEqual(self.found(), [])


if __name__ == '__main__':
    unittest.main()
