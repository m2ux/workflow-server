"""format.py on standalone issues.

Run from the skill directory: python3 -m unittest discover -s test
"""
import sys
import unittest

from fixtures import SCRIPTS, issue

sys.path.insert(0, str(SCRIPTS))
from format import Review  # noqa: E402


def body(problem: str, proposal: str) -> str:
    return (f'## Overview\n\nWhy.\n\n## Problem\n\n{problem}\n\n## Proposal\n\n{proposal}\n\n'
            '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n')


def review(problem: str, proposal: str = 'Design.') -> tuple[Review, str]:
    r = Review(issue(1, 'Key Validation: Reject Bad Keys', body=body(problem, proposal)))
    return r, r.run()


class BoldLeads(unittest.TestCase):
    def test_bullet_body_moves_to_the_next_line(self):
        r, fixed = review('- **Length is the only check.** The value is never checked.')
        self.assertIn('- **Length is the only check.**\n  The value is never checked.\n', fixed)
        self.assertIn('Problem: 1 bold leads given their body on the next line', r.fixed)

    def test_sub_bullet_keeps_its_indent(self):
        _, fixed = review('- **Facet.**\n  - **Part.** Detail.')
        self.assertIn('  - **Part.**\n    Detail.\n', fixed)

    def test_paragraph_body_moves_to_the_next_line(self):
        _, fixed = review('Gap.', '**Validate early.** Drop the key at the boundary.')
        self.assertIn('**Validate early.**\nDrop the key at the boundary.\n', fixed)

    def test_body_already_on_its_own_line_is_left(self):
        r, _ = review('- **Facet.**\n  Evidence.', '- **Move.**\n  Done.')
        self.assertEqual(r.fixed, [])

    def test_bold_inside_a_sentence_is_left(self):
        r, _ = review('- **Two** layouts exist.')
        self.assertEqual(r.fixed, [])

    def test_fenced_code_is_left(self):
        r, _ = review('- **Facet.**\n  ```\n  **Log.** line\n  ```')
        self.assertEqual(r.fixed, [])

    def test_other_sections_are_left(self):
        r, _ = review('Gap.')
        self.assertEqual(r.fixed, [])
