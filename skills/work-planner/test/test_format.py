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

    def test_intro_to_sub_bullets_stays_on_the_lead_line(self):
        r, _ = review('- **Framing is undocumented.** Nothing describes:\n  - the extrinsic type;')
        self.assertEqual(r.fixed, [])

    def test_intro_to_sub_bullets_rejoins_the_lead_line(self):
        r, fixed = review('- **Framing is undocumented.**\n  Nothing describes:\n  - the extrinsic type;')
        self.assertIn('- **Framing is undocumented.** Nothing describes:\n  - the extrinsic type;\n', fixed)
        self.assertIn('Problem: 1 bold leads given back the line introducing their sub-bullets', r.fixed)

    def test_body_before_a_paragraph_moves_to_the_next_line(self):
        _, fixed = review('**Boundary.** It excludes:\n\n- the RPCs.')
        self.assertIn('**Boundary.**\nIt excludes:\n', fixed)

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


class PlanIds(unittest.TestCase):
    def test_problem_naming_an_epic_is_a_finding(self):
        r, _ = review('The walk stops at E09.')
        self.assertIn('Problem: names E09;', ' '.join(r.decide))

    def test_proposal_naming_a_task_and_a_criterion_is_a_finding(self):
        r, _ = review('Gap.', 'W01 meets AC1.')
        self.assertIn('Proposal: names W01, AC1;', ' '.join(r.decide))

    def test_a_merged_pull_request_and_another_initiative_are_left(self):
        r, _ = review('See #440. I05:E00 holds the language.')
        self.assertFalse(any('names' in item for item in r.decide))

    def test_own_initiative_epic_is_a_finding(self):
        r = Review(issue(1, '[I00:E12] Tip Validation: Each Criterion Attested',
                         body=body('I00:E12 has not landed.', 'Design.'),
                         labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertTrue(any('I00:E12' in item for item in r.decide))

    def test_the_table_may_name_a_task(self):
        text = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nDesign.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Record the ledger | AC1 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n')
        r = Review(issue(1, '[I00:E12] Tip Validation: Each Criterion Attested', body=text,
                         labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertFalse(any(item.startswith('Problem:') or item.startswith('Proposal:') for item in r.decide))


def proposal_body() -> str:
    return ('## Overview\n\nThe end state.\n\n## Problem\n\n- **Gap.**\n  Evidence.\n\n'
            '## Proposal\n\n- **Move.**\n  What is done.\n\n## Acceptance Criteria\n\n'
            '- [ ] **AC1.** Holds, as the user confirms from a production run.\n\n'
            '## Non-Goals\n\n- It leaves the runtime alone.\n\n'
            '## References\n\n- **R1.** [Note](https://example.com) — The note.\n')


class Proposal(unittest.TestCase):
    def test_a_proposal_needs_no_theme_and_no_work_breakdown(self):
        r = Review(issue(1, '[I] Key Validation: Reject Bad Keys', body=proposal_body(),
                         labels=('type:proposal',)))
        r.run()
        self.assertEqual(r.decide, [])
        self.assertEqual(r.apply, [])

    def test_a_missing_type_label_is_applied(self):
        r = Review(issue(1, '[I] Key Validation: Reject Bad Keys', body=proposal_body()))
        r.run()
        self.assertIn('labels: add type:proposal', r.apply)

    def test_a_theme_label_is_removed(self):
        r = Review(issue(1, '[I] Key Validation: Reject Bad Keys', body=proposal_body(),
                         labels=('type:proposal', 'theme:canon')))
        r.run()
        self.assertIn('labels: remove theme:canon', r.apply)
        self.assertFalse(any('theme' in item for item in r.decide))

    def test_a_work_breakdown_follows_the_initiative_template(self):
        text = proposal_body().replace(
            '## Acceptance Criteria',
            '## Work Breakdown\n\n| Epic | Description | Coverage | Depends on | Done |\n'
            '| --- | --- | --- | --- | --- |\n| E00 | Work | AC1 | | |\n\n## Acceptance Criteria')
        r = Review(issue(1, '[I] Key Validation: Reject Bad Keys', body=text, labels=('type:proposal',)))
        r.run()
        self.assertTrue(any('initiative template' in item for item in r.decide))

