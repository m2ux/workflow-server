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

    def test_a_complete_row_may_omit_coverage(self):
        text = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nDesign.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Record the ledger | | | | ✓ |\n'
                '| W02 | Read the ledger | AC1 | W01 | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** The ledger names its source.\n')
        r = Review(issue(1, '[I00:E01] Ledger Record: The Source Named', body=text,
                         labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertFalse(any('Coverage does not name' in item for item in r.decide))

    def test_an_open_row_names_its_coverage(self):
        text = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nDesign.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Record the ledger | | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** The ledger names its source.\n')
        r = Review(issue(1, '[I00:E01] Ledger Record: The Source Named', body=text,
                         labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertTrue(any(item.startswith('W01: Coverage does not name') for item in r.decide))


class OneRow(unittest.TestCase):
    def test_a_criterion_cited_by_two_tasks_is_imprecise(self):
        text = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nDesign.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Record the ledger | AC1 | | | |\n'
                '| W02 | Read the ledger | AC1 | W01 | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** The ledger names its source.\n')
        r = Review(issue(1, '[I00:E01] Ledger Record: The Source Named', body=text,
                         labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertTrue(any(item.startswith('AC1 is cited by W01, W02') and
                            'at least one acceptance criterion' in item for item in r.decide))

    def test_one_task_citing_a_criterion_is_left(self):
        text = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nDesign.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Record the ledger | AC1 | | | |\n'
                '| W02 | Read the ledger | AC2 | W01 | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** The ledger names its source.\n'
                '- [ ] **AC2.** A reader sees that source.\n')
        r = Review(issue(1, '[I00:E01] Ledger Record: The Source Named', body=text,
                         labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertFalse(any('cited by' in item for item in r.decide))

    def test_a_task_covering_two_criteria_is_left(self):
        text = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nDesign.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Record the ledger | AC1, AC2 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** The ledger names its source.\n'
                '- [ ] **AC2.** A reader sees that source.\n')
        r = Review(issue(1, '[I00:E01] Ledger Record: The Source Named', body=text,
                         labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertFalse(any('cited by' in item or item.startswith('W01: delivers') for item in r.decide))


def proposal_body() -> str:
    return ('## Overview\n\nThe problem.\n\n## Problem\n\n- **Gap.**\n  Evidence.\n\n'
            '## Goal\n\n- The bad key is rejected.\n\n'
            '## Non-Goals\n\n- It leaves the runtime alone.\n\n'
            '## References\n\n- **R1.** [Note](https://example.com) — The note.\n')


class Proposal(unittest.TestCase):
    def test_a_proposal_needs_no_theme_and_no_work_breakdown(self):
        r = Review(issue(1, 'Key Validation: Reject Bad Keys', body=proposal_body(),
                         labels=('type:proposal',)))
        r.run()
        self.assertEqual(r.decide, [])
        self.assertEqual(r.apply, [])

    def test_an_unprefixed_issue_does_not_become_a_proposal(self):
        r = Review(issue(1, 'Key Validation: Reject Bad Keys', body=proposal_body()))
        r.run()
        self.assertNotIn('labels: add type:proposal', r.apply)

    def test_a_theme_label_is_removed(self):
        r = Review(issue(1, 'Key Validation: Reject Bad Keys', body=proposal_body(),
                         labels=('type:proposal', 'theme:canon')))
        r.run()
        self.assertIn('labels: remove theme:canon', r.apply)
        self.assertFalse(any('theme' in item for item in r.decide))

    def test_a_work_breakdown_follows_the_initiative_template(self):
        text = proposal_body().replace(
            '## Non-Goals',
            '## Proposal\n\nMove.\n\n'
            '## Work Breakdown\n\n| Epic | Description | Coverage | Depends on | Done |\n'
            '| --- | --- | --- | --- | --- |\n| E00 | Work | AC1 | | |\n\n'
            '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n## Non-Goals')
        r = Review(issue(1, 'Key Validation: Reject Bad Keys', body=text, labels=('type:proposal',)))
        r.run()
        self.assertTrue(any('initiative template' in item for item in r.decide))


class References(unittest.TestCase):
    def test_a_reference_naming_own_initiative_is_a_finding(self):
        body = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Work | AC1 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [Initiative](https://github.com/o/r/issues/10) — I01, the initiative.\n')
        r = Review(issue(2, '[I01:E00] First: Epic', body=body, labels=('type:epic', 'theme:mechanical')),
                   initiative=issue(10, '[I01] Main: Initiative'))
        r.run()
        self.assertTrue(any('References: names' in item and 'same board' in item for item in r.decide))

    def test_a_reference_naming_own_epic_is_a_finding(self):
        body = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Work | AC1 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [E00](https://github.com/o/r/issues/2) — earlier epic.\n')
        r = Review(issue(3, '[I01:E01] Second: Epic', body=body, labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertTrue(any('References: names' in item and 'same board' in item for item in r.decide))

    def test_a_reference_naming_a_pull_request_is_a_finding(self):
        body = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Work | AC1 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [PR #950](https://github.com/o/r/pull/950) — pull request.\n')
        r = Review(issue(2, '[I01:E00] First: Epic', body=body, labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertTrue(any('References: names' in item and 'same board' in item for item in r.decide))

    def test_a_reference_to_an_external_doc_is_left(self):
        body = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Work | AC1 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110) — HTTP Semantics.\n')
        r = Review(issue(2, '[I01:E00] First: Epic', body=body, labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertFalse(any('References:' in item for item in r.decide))

    def test_a_reference_to_a_planning_record_is_left(self):
        body = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Work | AC1 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [Planning record](https://github.com/o/r/blob/main/planning/w01.md) — The record.\n')
        r = Review(issue(2, '[I01:E00] First: Epic', body=body, labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertFalse(any('References:' in item for item in r.decide))

    def test_a_reference_to_another_initiative_is_left(self):
        body = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Work | AC1 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [I05:E00 Language](https://github.com/o/r/issues/500) — Language spec.\n')
        r = Review(issue(2, '[I01:E00] First: Epic', body=body, labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertFalse(any('References:' in item for item in r.decide))

    def test_an_initiative_check_with_its_epics_reads_their_numbers(self):
        body = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Epic | Description | Coverage | Depends on | Done |\n'
                '| --- | --- | --- | --- | --- |\n'
                '| [E00](https://github.com/o/r/issues/2) | Work | AC1 | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## Non-Goals\n\n- Out.\n\n'
                '## References\n\n- **R1.** [Epic](https://github.com/o/r/issues/2) — the epic.\n')
        epic = issue(2, '[I01:E00] First: Epic')
        r = Review(issue(1, '[I01] Main: Initiative', body=body,
                         labels=('type:initiative', 'theme:mechanical')), epics=[epic])
        r.run()
        self.assertTrue(any('References: names' in item and '#2' in item for item in r.decide))

