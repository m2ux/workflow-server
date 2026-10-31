"""Body artifacts are the format checker's sole template source."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from fixtures import SCRIPTS
from format import BODY_ARTIFACTS, Template, template_body


class ArtifactTemplates(unittest.TestCase):
    def test_every_issue_kind_reads_only_its_body_sections(self):
        common = ['Overview', 'Problem', 'Proposal']
        for kind in BODY_ARTIFACTS:
            with self.subTest(kind=kind):
                template = Template(kind)
                expected = common.copy()
                if kind in ('initiative', 'epic'):
                    expected.append('Work Breakdown')
                expected.append('Acceptance Criteria')
                if kind in ('initiative', 'proposal'):
                    expected.append('Non-Goals')
                if kind in ('epic', 'task', 'issue'):
                    expected.append('Open Questions')
                expected.append('References')
                if kind == 'proposal':
                    expected = ['Overview', 'Problem', 'Goal', 'Non-Goals', 'References']
                self.assertEqual(template.headings, expected)
                self.assertEqual(template.optional,
                                 {'Open Questions', 'References'} if kind in ('task', 'issue') else
                                 {'Open Questions'} if kind == 'epic' else
                                 {'References'} if kind == 'proposal' else set())
                columns = (['Epic', 'Description', 'Coverage', 'Depends on', 'Done'] if kind == 'initiative'
                           else ['Task', 'Description', 'Coverage', 'Depends on', 'Joins', 'Done']
                           if kind == 'epic' else None)
                self.assertEqual(template.columns, columns)
        self.assertFalse((SCRIPTS.parent / 'templates').exists())

    def read_specimen(self, text):
        with tempfile.TemporaryDirectory() as directory:
            Path(directory, 'epic-issue-body.md').write_text(text)
            with patch('format.ARTIFACTS', Path(directory)):
                return template_body('epic')

    def test_a_shorter_or_different_fence_inside_a_template_is_content(self):
        body = '## Overview\n\n```bash\necho example\n```\n~~~\n'
        self.assertEqual(self.read_specimen(
            '# Epic\n\n## Fields\n\n### Template\n\n````markdown\n' + body + '````\n'), body)

    def test_examples_outside_fields_template_are_ignored(self):
        self.assertEqual(self.read_specimen(
            '# Epic\n\n## Operations\n\n```markdown\n## Wrong\n```\n'
            '## Fields\n\n### Template\n\n~~~markdown\n## Overview\n~~~\n'
            '### Examples\n\n```markdown\n## Wrong\n```\n'), '## Overview\n')

    def test_missing_unclosed_empty_and_ambiguous_templates_fail(self):
        prefix = '# Epic\n\n## Fields\n\n### Template\n\n'
        for text in ('# Epic\n', prefix + '```markdown\n## Overview\n',
                     prefix + '```markdown\n```\n',
                     prefix + '```markdown\nOne\n```\n```markdown\nTwo\n```\n',
                     '# Epic\n\n## Template\n\n```markdown\n## Overview\n```\n'):
            with self.subTest(text=text), self.assertRaisesRegex(ValueError, 'Fields / Template'):
                self.read_specimen(text)
