"""format.py on standalone issues.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import re
import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path

from fixtures import SCRIPTS, hotfix_body, issue, pr, run

sys.path.insert(0, str(SCRIPTS))
from format import DECLARATION, DECLARED_FIELDS, DEPENDENCY, Required, Review, required_criteria  # noqa: E402


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



def initiative_with(criteria: tuple[int, ...], references: tuple[int, ...] = (1,)) -> Review:
    """An initiative whose rows cover the labelled criteria, the first row the first and the second the rest."""
    labels = [f'AC{n}' for n in criteria]
    text = ('## Overview\n\nWhy.\n\n## Problem\n\n- **Gap.**\n  Evidence.\n\n## Proposal\n\n- **Move.**\n  Design.\n\n'
            '## Work Breakdown\n\n| Epic | Description | Coverage | Depends on | Done |\n'
            '| --- | --- | --- | --- | --- |\n'
            f'| [E00](https://github.com/o/r/issues/2) | Ledger Record | {labels[0]} | | |\n'
            f'| [E01](https://github.com/o/r/issues/3) | Ledger Read | {", ".join(labels[1:])} | | |\n\n'
            '## Acceptance Criteria\n\n'
            + ''.join(f'- [ ] **{label}.** The ledger holds, as its check shows.\n' for label in labels)
            + '\n## Non-Goals\n\n- It leaves the runtime alone.\n\n## References\n\n'
            + ''.join(f'- **R{n}.** [Source](https://example.com/{n}) — background.\n' for n in references))
    r = Review(issue(1, '[I01] Ledger Work: The Source Named', body=text,
                     labels=('type:initiative', 'theme:mechanical')))
    r.run()
    return r


class CriterionLabels(unittest.TestCase):
    def test_labels_ascending_with_a_gap_stand(self):
        r = initiative_with((1, 3, 4))
        self.assertFalse(any('labels' in item for item in r.decide))

    def test_labels_starting_past_one_stand(self):
        r = initiative_with((2, 3))
        self.assertFalse(any('labels' in item for item in r.decide))

    def test_a_repeated_label_is_left_to_decide(self):
        r = initiative_with((1, 2, 2))
        self.assertIn('AC labels partly missing or out of sequence', r.decide)

    def test_a_descending_label_is_left_to_decide(self):
        r = initiative_with((1, 3, 2))
        self.assertIn('AC labels partly missing or out of sequence', r.decide)

    def test_a_reference_gap_is_left_to_decide(self):
        r = initiative_with((1, 2), references=(1, 3))
        self.assertIn('R labels partly missing or out of sequence', r.decide)


INITIATIVE_GUIDE = SCRIPTS.parent / 'artifacts' / 'initiative-issue-body.md'


def initiative_section(heading: str) -> str:
    """One Fields subsection of the initiative guide, up to the next heading of its level."""
    return INITIATIVE_GUIDE.read_text().split(f'\n### {heading}\n', 1)[1].split('\n### ', 1)[0]


class NotPlannedEpic(unittest.TestCase):
    def test_its_row_leaves_with_the_criteria_only_it_covers(self):
        rule = next(line for line in initiative_section('Work Breakdown').splitlines()
                    if 'closed as not planned' in line)
        self.assertIn('leaves the table', rule)
        self.assertIn('Each criterion only that row covers leaves with it', rule)
        self.assertIn('another row also covers stays', rule)
        self.assertIn('issue-body.md#criterion-labels', rule)

    def test_references_name_where_its_work_went(self):
        self.assertTrue(any("not-planned epic's row" in line and 'takes' in line
                            for line in initiative_section('References').splitlines()))

    def test_the_label_rule_has_its_heading(self):
        self.assertIn('\n#### Criterion Labels\n', (SCRIPTS.parent / 'artifacts' / 'issue-body.md').read_text())


def proposal_body() -> str:
    return ('## Overview\n\nThe problem.\n\n## Problem\n\n- **Gap.**\n  Evidence.\n\n'
            '## Goal\n\n- The bad key is rejected.\n\n'
            '## Non-Goals\n\n- It leaves the runtime alone.\n\n'
            '## References\n\n- **R1.** [Note](https://example.com) — The note.\n')


class Proposal(unittest.TestCase):
    def test_a_proposal_needs_no_theme_and_no_work_breakdown(self):
        r = Review(issue(1, '[P00] Key Validation: Reject Bad Keys', body=proposal_body(),
                         labels=('type:proposal',)))
        r.run()
        self.assertEqual(r.decide, [])
        self.assertEqual(r.apply, [])

    def test_a_proposal_without_its_prefix_is_a_finding(self):
        r = Review(issue(1, 'Key Validation: Reject Bad Keys', body=proposal_body(),
                         labels=('type:proposal',)))
        r.run()
        self.assertIn('title has no [P00] prefix', r.decide)

    def test_an_unprefixed_issue_does_not_become_a_proposal(self):
        r = Review(issue(1, 'Key Validation: Reject Bad Keys', body=proposal_body()))
        r.run()
        self.assertNotIn('labels: add type:proposal', r.apply)

    def test_a_theme_label_is_removed(self):
        r = Review(issue(1, '[P00] Key Validation: Reject Bad Keys', body=proposal_body(),
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
        r = Review(issue(1, '[P00] Key Validation: Reject Bad Keys', body=text, labels=('type:proposal',)))
        r.run()
        self.assertTrue(any('initiative template' in item for item in r.decide))


def task_body() -> str:
    return (f'{body("Friction.", "Design.")}\n## References\n\n- **R1.** [Guide](https://example.com) — What it says.\n')


class TaskPrefix(unittest.TestCase):
    """A type:task issue is a task whatever its prefix depth."""

    def test_a_task_without_its_task_id_is_reported_missing_it(self):
        r = Review(issue(1, '[I07:E01] Key Validation: Reject Bad Keys', body=task_body(),
                         labels=('type:task',)))
        r.run()
        self.assertEqual(r.kind, 'task')
        self.assertTrue(any('has no task id' in item for item in r.decide))

    def test_a_task_without_its_task_id_is_not_made_an_epic(self):
        r = Review(issue(1, '[I07:E01] Key Validation: Reject Bad Keys', body=task_body(),
                         labels=('type:task',)))
        r.run()
        self.assertFalse(any('type:epic' in item for item in r.apply))
        self.assertFalse(any('Work Breakdown' in item or 'epic template' in item for item in r.decide))

    def test_a_task_with_its_task_id_is_left(self):
        r = Review(issue(1, '[I07:E01:W02] Key Validation: Reject Bad Keys', body=task_body(),
                         labels=('type:task',)))
        r.run()
        self.assertFalse(any('task id' in item for item in r.decide))


class TaskRowDependencies(unittest.TestCase):
    """A task row names rows; the initiative row is the one that names epics."""

    def test_the_epic_kind_takes_only_row_references(self):
        accepted = ('W03', 'W04–W09', 'E01:W02', 'I05:E00:W02', '#750')
        for value in accepted:
            with self.subTest(value=value):
                self.assertTrue(DEPENDENCY['epic'].fullmatch(value))
        self.assertIsNone(DEPENDENCY['epic'].fullmatch('E01'))

    def test_the_initiative_kind_takes_epic_references(self):
        for value in ('E01', 'I05:E00', '#750'):
            with self.subTest(value=value):
                self.assertTrue(DEPENDENCY['initiative'].fullmatch(value))


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

    def test_a_pull_request_on_the_issues_repository_is_a_finding(self):
        body = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Work | AC1 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [PR #950](https://github.com/o/r/pull/950) — pull request.\n')
        r = Review(issue(2, '[I01:E00] First: Epic', body=body, labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertTrue(any('References: names' in item and 'same board' in item for item in r.decide))

    def test_a_pull_request_in_another_repository_is_left(self):
        body = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n'
                '| W01 | Work | AC1 | | | |\n\n'
                '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [Delivery](https://github.com/other/org/pull/1179) — the pull request.\n')
        r = Review(issue(2, '[I01:E00] First: Epic', body=body, labels=('type:epic', 'theme:mechanical')))
        r.run()
        self.assertFalse(any('References:' in item for item in r.decide))

    def test_an_epic_written_from_the_template_has_no_references_finding(self):
        from format import template_body
        template = template_body('epic')
        filled = template
        for key, value in (('PLANNING_RECORD_URL',
                            'https://github.com/o/r/blob/workspace/.engineering/artifacts/planning/record'),
                           ('OWNER', 'o'), ('REPO', 'r'), ('INITIATIVE_ISSUE', '10'), ('NN', '01')):
            filled = filled.replace('{{' + key + '}}', value)
        filled = re.sub(r'\{\{[^}]*\}\}', 'note', filled)
        initiative = ('## Work Breakdown\n\n| Epic | Description | Coverage | Depends on | Done |\n'
                      '| --- | --- | --- | --- | --- |\n'
                      '| [E00](https://github.com/o/r/issues/2) | Queue Plan | AC1 | | |\n')
        r = Review(issue(2, '[I01:E00] Queue Plan: Hold The Work', body=filled,
                         labels=('type:epic', 'theme:mechanical')),
                   initiative=issue(10, '[I01] Board Work: Track The Queue', body=initiative))
        r.run()
        self.assertFalse(any(item.startswith('References:') for item in r.decide))

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


GUIDE = SCRIPTS.parent / 'artifacts' / 'epic-issue-body.md'


def guide_section(heading: str) -> str:
    """One Fields subsection of the epic guide, up to the next heading of its level."""
    text = GUIDE.read_text()
    return text.split(f'\n### {heading}\n', 1)[1].split('\n### ', 1)[0]


def guide_example() -> str:
    return textwrap.dedent(re.search(r'```json\n(.*?)\n\s*```', guide_section('Required Criteria'), re.DOTALL)[1])


AUDIT = Required(tuple(json.loads(guide_example())), 'the guide example')
LOAD_TEST = {'branch': 'main', 'paths': ['services/api'],
             'criterion': 'The service holds its load target, as the load test shows.',
             'phrase': 'load test', 'row': 'Load test of the changed service'}
WANTED = 'no criterion carries "canon audit"'
DEFINITION = 'corpus/meta/workflow.toon'


def epic_with(criterion: str, title: str = '[I01:E00] First: Epic') -> dict:
    body = ('## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
            '| --- | --- | --- | --- | --- | --- |\n| W01 | Work | AC1 | | | |\n\n'
            f'## Acceptance Criteria\n\n- [ ] **AC1.** {criterion}\n')
    return issue(2, title, body=body, labels=('type:epic', 'theme:mechanical'))


def required_review(criterion: str, base: str, required: Required | None = AUDIT,
                    files: tuple[str, ...] | None = (DEFINITION,),
                    more: tuple[dict, ...] = (), more_files: dict[int, list[str]] | None = None) -> Review:
    """An epic whose pull request #950 targets base and changes files, None when they are not supplied,
    reviewed for the criteria its project requires."""
    changed = {} if files is None else {950: list(files)}
    changed.update(more_files or {})
    r = Review(epic_with(criterion), prs=[pr(950, '[I01:E00] Work', base=base), *more],
               required=required, files=changed)
    r.run()
    return r


class RequiredReach(unittest.TestCase):
    def test_an_epic_reaching_the_branch_states_the_criterion(self):
        r = required_review('Holds.', 'i01/e00/workflows')
        found = [item for item in r.decide if WANTED in item]
        self.assertEqual(len(found), 1)
        self.assertIn('#950 change corpus on workflows', found[0])
        self.assertIn('Canon audit of the changed definitions', found[0])

    def test_an_epic_reaching_the_long_lived_branch_states_the_criterion(self):
        r = required_review('Holds.', 'workflows')
        self.assertTrue(any(WANTED in item for item in r.decide))

    def test_an_epic_reaching_through_an_initiative_branch_states_the_criterion(self):
        r = required_review('Holds.', 'i01/workflows')
        self.assertTrue(any(WANTED in item for item in r.decide))

    def test_the_phrase_in_any_case_answers_the_check(self):
        r = required_review("The definitions carry no finding, as the Canon Audit's coverage report shows.",
                            'i01/e00/workflows')
        self.assertFalse(any(WANTED in item for item in r.decide))

    def test_an_epic_off_the_branch_states_nothing(self):
        r = required_review('Holds.', 'i01/e00/main')
        self.assertFalse(any('no criterion carries' in item for item in r.decide))

    def test_the_declared_vocabulary_alone_is_matched(self):
        declared = Required((LOAD_TEST,), 'another project')
        both = (DEFINITION, 'services/api/handler.py')
        on_main = required_review('Holds.', 'i01/e00/main', declared, files=both)
        self.assertTrue(any('no criterion carries "load test"' in item and 'Load test of the changed service' in item
                            for item in on_main.decide))
        on_workflows = required_review('Holds.', 'i01/e00/workflows', declared, files=both)
        self.assertFalse(any('no criterion carries' in item for item in on_workflows.decide))

    def test_an_epic_checked_without_a_declaration_is_held_to_nothing(self):
        r = required_review('Holds.', 'i01/e00/workflows', required=None)
        self.assertFalse(any('required criteria' in item or 'no criterion carries' in item for item in r.decide))

    def test_unevaluable_criteria_are_reported_and_none_is_lacking(self):
        r = required_review('Holds.', 'i01/e00/workflows', Required((), 'nowhere', 'no declaration'))
        self.assertIn('required criteria unevaluable: no declaration', r.decide)
        self.assertFalse(any('no criterion carries' in item for item in r.decide))

    def test_an_epic_without_pull_requests_lacks_nothing(self):
        r = Review(epic_with('Holds.'), required=AUDIT)
        r.run()
        self.assertFalse(any('no criterion carries' in item for item in r.decide))


class RequiredPaths(unittest.TestCase):
    def test_a_change_touching_no_declared_path_is_held_to_nothing(self):
        r = required_review('Holds.', 'i01/e00/workflows', files=('config/branches',))
        self.assertFalse(any('no criterion carries' in item or 'required criteria' in item for item in r.decide))

    def test_a_change_touching_one_declared_path_is_held_to_its_criterion(self):
        r = required_review('Holds.', 'i01/e00/workflows', files=('config/branches', DEFINITION))
        self.assertTrue(any(WANTED in item for item in r.decide))

    def test_a_declared_path_names_itself_and_what_lies_under_it(self):
        declared = Required(({**AUDIT.criteria[0], 'paths': ['corpus/meta/', 'README.md']},), 'paths')
        for changed, held in (('corpus/meta', True), ('corpus/meta/workflow.toon', True), ('README.md', True),
                              ('corpus/metadata.toon', False), ('corpus/README.md', False), ('docs/README.md', False)):
            with self.subTest(changed=changed):
                r = required_review('Holds.', 'workflows', declared, files=(changed,))
                self.assertEqual(any(WANTED in item for item in r.decide), held)

    def test_a_change_to_a_declared_path_on_another_branch_is_held_to_nothing(self):
        r = required_review('Holds.', 'i01/e00/main')
        self.assertFalse(any('no criterion carries' in item or 'required criteria' in item for item in r.decide))

    def test_a_pull_request_without_its_changed_files_is_unevaluable(self):
        r = required_review('Holds.', 'i01/e00/workflows', files=None)
        self.assertIn('required criteria unevaluable: no changed files for #950, reaching workflows', r.decide)
        self.assertFalse(any(WANTED in item for item in r.decide))

    def test_a_known_change_to_a_declared_path_holds_the_epic_beside_an_unknown_one(self):
        r = required_review('Holds.', 'i01/e00/workflows', files=None,
                            more=(pr(951, '[I01:E00] More', base='workflows'),), more_files={951: [DEFINITION]})
        self.assertTrue(any(WANTED in item and '#951 change' in item for item in r.decide))
        self.assertFalse(any('unevaluable' in item for item in r.decide))

    def test_an_epic_carrying_the_criterion_needs_no_changed_files(self):
        r = required_review("Holds, as the canon audit's coverage report shows.", 'i01/e00/workflows', files=None)
        self.assertFalse(any('no criterion carries' in item or 'required criteria' in item for item in r.decide))


class ProjectVocabulary(unittest.TestCase):
    def test_a_projects_required_criterion_stands_only_in_the_guide_example(self):
        example = re.search(r'```json\n.*?\n\s*```', guide_section('Required Criteria'), re.DOTALL)[0]
        terms = {term.casefold() for entry in AUDIT.criteria for term in (entry['phrase'], entry['row'])}
        skill = SCRIPTS.parent
        sources = [p for p in sorted(skill.rglob('*')) if p.suffix in ('.md', '.py', '.json') and 'test' not in p.parts]
        found = []
        for path in sources:
            text = path.read_text()
            if path == GUIDE:
                text = text.replace(example, '')
            found += [f'{path.relative_to(skill)}: {term}' for term in terms if term in text.casefold()]
        self.assertTrue(sources)
        self.assertEqual(found, [])


GIT = ('git', '-c', 'user.email=t@t', '-c', 'user.name=T', '-c', 'init.defaultBranch=main',
       '-c', 'commit.gpgsign=false', '-c', 'core.hooksPath=/dev/null')


def git(cwd: Path, *args: str) -> str:
    """Run git in cwd and return its output, failing the test on a git error."""
    done = subprocess.run([*GIT, *args], cwd=cwd, capture_output=True, text=True)
    assert done.returncode == 0, done.stderr
    return done.stdout.strip()


def commit_declaration(checkout: Path, text: str | None, message: str = 'declare') -> str:
    """Commit the declaration holding text, or its removal when text is None, returning the commit."""
    path = checkout / DECLARATION
    if text is None:
        path.unlink(missing_ok=True)
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text)
    git(checkout, 'add', '--all')
    git(checkout, 'commit', '--allow-empty', '-m', message)
    return git(checkout, 'rev-parse', 'HEAD')


class DeclarationAtRevision(unittest.TestCase):
    def setUp(self):
        self.root = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.checkout = self.root / 'checkout'
        self.checkout.mkdir()
        git(self.checkout, 'init')

    def read(self, revision: str, checkout: Path | None = None) -> Required:
        return required_criteria(str(checkout or self.checkout), revision)

    def test_the_guide_names_the_declaration_and_its_fields(self):
        section = guide_section('Required Criteria')
        self.assertIn(f'`{DECLARATION}` at its root', section)
        self.assertEqual(tuple(re.findall(r'^\| `(\w+)` \|', section, re.MULTILINE)), DECLARED_FIELDS)

    def test_the_criteria_and_their_source_come_from_the_resolved_commit(self):
        commit = commit_declaration(self.checkout, guide_example())
        read = self.read('HEAD')
        self.assertEqual(read.unevaluable, '')
        self.assertEqual(read.criteria, AUDIT.criteria)
        common = git(self.checkout, 'rev-parse', '--path-format=absolute', '--git-common-dir')
        self.assertEqual(read.source, f'{DECLARATION} at {commit} in {common}')

    def test_divergent_revisions_each_read_their_own_declaration(self):
        audit = commit_declaration(self.checkout, guide_example())
        git(self.checkout, 'switch', '-c', 'other')
        load = commit_declaration(self.checkout, json.dumps([LOAD_TEST]))
        self.assertEqual(self.read(audit).criteria, AUDIT.criteria)
        self.assertEqual(self.read('main').criteria, AUDIT.criteria)
        self.assertEqual(self.read(load).criteria, (LOAD_TEST,))
        self.assertIn(load, self.read('other').source)

    def test_working_files_choose_nothing(self):
        commit_declaration(self.checkout, guide_example())
        (self.checkout / DECLARATION).write_text(json.dumps([LOAD_TEST]))
        self.assertEqual(self.read('HEAD').criteria, AUDIT.criteria)

    def test_the_same_revision_reads_alike_from_every_worktree(self):
        commit_declaration(self.checkout, guide_example())
        linked = self.root / 'linked'
        git(self.checkout, 'worktree', 'add', '-b', 'side', str(linked))
        commit_declaration(linked, json.dumps([LOAD_TEST]))
        self.assertEqual(self.read('main', linked), self.read('main'))
        self.assertEqual(self.read('side', linked), self.read('side'))
        self.assertEqual(self.read('main').criteria, AUDIT.criteria)

    def test_a_revision_resolving_to_no_commit_is_unevaluable(self):
        commit_declaration(self.checkout, guide_example())
        read = self.read('no-such-branch')
        self.assertIn('no-such-branch resolves to no commit', read.unevaluable)
        self.assertEqual(read.criteria, ())

    def test_a_project_declaring_none_is_unevaluable(self):
        commit_declaration(self.checkout, None)
        self.assertTrue(self.read('HEAD').unevaluable.startswith(f'no {DECLARATION} at '))

    def test_a_declaration_at_another_revision_supplies_nothing(self):
        declared = commit_declaration(self.checkout, guide_example())
        removed = commit_declaration(self.checkout, None, 'remove')
        self.assertEqual(self.read(declared).criteria, AUDIT.criteria)
        self.assertIn(f'no {DECLARATION} at {removed}', self.read('HEAD').unevaluable)
        (self.checkout / DECLARATION).write_text(guide_example())
        self.assertEqual(self.read('HEAD').criteria, ())

    def test_an_empty_declaration_is_unevaluable(self):
        for text in ('', '[]', '{}'):
            with self.subTest(text=text):
                commit_declaration(self.checkout, text)
                read = self.read('HEAD')
                self.assertTrue(read.unevaluable.endswith('declares no criterion'))
                self.assertEqual(read.criteria, ())

    def test_an_unreadable_declaration_is_unevaluable(self):
        commit_declaration(self.checkout, 'branch: workflows')
        self.assertTrue(self.read('HEAD').unevaluable.endswith('is not JSON'))

    def test_an_entry_lacking_a_field_is_unevaluable(self):
        entry = {'branch': 'workflows', 'criterion': 'Holds.', 'phrase': ''}
        commit_declaration(self.checkout, json.dumps([entry]))
        self.assertTrue(self.read('HEAD').unevaluable.endswith('lacks paths, phrase, row'))

    def test_paths_other_than_a_list_of_paths_are_unevaluable(self):
        for paths in ('corpus', [], [''], ['corpus', 3]):
            with self.subTest(paths=paths):
                commit_declaration(self.checkout, json.dumps([{**LOAD_TEST, 'paths': paths}]))
                read = self.read('HEAD')
                self.assertTrue(read.unevaluable.endswith('lacks paths'))
                self.assertEqual(read.criteria, ())


class CheckFormat(unittest.TestCase):
    def setUp(self):
        self.root = Path(self.enterContext(tempfile.TemporaryDirectory()))
        self.checkout = self.root / 'checkout'
        self.checkout.mkdir()
        git(self.checkout, 'init')
        self.epic = self.root / 'epic.json'
        self.epic.write_text(json.dumps(epic_with('Holds.')))
        self.prs = self.root / 'prs.json'
        self.prs.write_text(json.dumps(pr(950, '[I01:E00] Work', base='i01/e00/workflows')) + '\n')
        self.files = self.root / 'changed-950.txt'
        self.files.write_text(f'config/branches\n{DEFINITION}\n')

    def check(self, *args: str):
        return run('format.py', str(self.epic), '--prs', str(self.prs), '--files', f'950={self.files}', *args)

    def test_the_run_names_its_source_and_the_lacking_criterion(self):
        commit = commit_declaration(self.checkout, guide_example())
        done = self.check('--project', str(self.checkout), '--revision', 'HEAD')
        self.assertEqual(done.returncode, 1)
        self.assertIn(f'source: {DECLARATION} at {commit} in ', done.stdout)
        self.assertIn(WANTED, done.stdout)

    def test_a_missing_declaration_is_reported_unevaluable(self):
        commit_declaration(self.checkout, None)
        (self.checkout / DECLARATION).parent.mkdir(exist_ok=True)
        (self.checkout / DECLARATION).write_text(guide_example())
        done = self.check('--project', str(self.checkout), '--revision', 'HEAD')
        self.assertEqual(done.returncode, 1)
        self.assertIn('required criteria unevaluable: no ' + DECLARATION, done.stdout)
        self.assertNotIn('no criterion carries', done.stdout)

    def test_changed_files_touching_no_declared_path_bring_nothing(self):
        commit_declaration(self.checkout, guide_example())
        self.files.write_text('config/branches\n')
        done = self.check('--project', str(self.checkout), '--revision', 'HEAD')
        self.assertNotIn('no criterion carries', done.stdout)
        self.assertNotIn('unevaluable', done.stdout)

    def test_files_name_their_pull_request(self):
        done = run('format.py', str(self.epic), '--files', str(self.files))
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('expected NUMBER=FILE', done.stderr)

    def test_project_and_revision_go_together(self):
        done = self.check('--project', str(self.checkout))
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('--project and --revision go together', done.stderr)


class CoverageNamesDelivery(unittest.TestCase):
    """A row's Coverage names the criteria it delivers, complete or open."""

    def findings(self, rows: str) -> list[str]:
        text = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nDesign.\n\n'
                '## Work Breakdown\n\n| Task | Description | Coverage | Depends on | Joins | Done |\n'
                '| --- | --- | --- | --- | --- | --- |\n' + rows + '\n'
                '## Acceptance Criteria\n\n- [x] **AC1.** The ledger names its source.\n'
                '- [ ] **AC2.** A reader sees that source.\n')
        r = Review(issue(1, '[I00:E01] Ledger Record: The Source Named', body=text,
                         labels=('type:epic', 'theme:mechanical')))
        r.run()
        return r.decide

    def test_a_complete_row_with_an_empty_cell_is_reported(self):
        decide = self.findings('| W01 | Record the ledger | | | | ✓ |\n'
                               '| W02 | Read the ledger | AC1, AC2 | | | |\n')
        self.assertIn('W01: Coverage does not name the criteria it delivers', decide)

    def test_a_complete_row_naming_its_criteria_is_left(self):
        decide = self.findings('| W01 | Record the ledger | AC1 | | | ✓ |\n'
                               '| W02 | Read the ledger | AC2 | W01 | | |\n')
        self.assertFalse(any('Coverage' in item for item in decide))

    def test_a_complete_row_whose_criteria_a_further_task_adopts_is_left(self):
        decide = self.findings('| W01 | Record the ledger | | | | ✓ |\n'
                               '| W02 | Read the ledger | AC1, AC2 | W01 | | |\n')
        self.assertFalse(any('Coverage' in item for item in decide))

    def test_a_further_task_naming_a_range_adopts_each_row_in_it(self):
        decide = self.findings('| [W01](https://example.com/w01) | Record the ledger | | | | ✓ |\n'
                               '| W02 | Read the ledger | AC1, AC2 | [W01–W01](https://example.com) | | |\n')
        self.assertFalse(any('Coverage' in item for item in decide))

    def test_an_open_row_with_an_empty_cell_is_reported(self):
        decide = self.findings('| W01 | Record the ledger | | | | |\n'
                               '| W02 | Read the ledger | AC1, AC2 | W01 | | |\n')
        self.assertIn('W01: Coverage does not name the criteria it delivers', decide)

    def test_a_complete_row_citing_a_missing_criterion_is_reported(self):
        decide = self.findings('| W01 | Record the ledger | AC1, AC7 | | | ✓ |\n'
                               '| W02 | Read the ledger | AC2 | W01 | | |\n')
        self.assertIn('W01: Coverage cites AC7, which is not a criterion', decide)


class HotFixes(unittest.TestCase):
    """A hot-fix takes the standalone template under an [F00] title, type:hot-fix and a theme, and its
    Overview names its target branch in one Target: line."""

    def check(self, title: str, labels: tuple[str, ...], text: str | None = None) -> Review:
        r = Review(issue(1, title, labels=labels, body=text or hotfix_body('workspace')))
        r.run()
        return r

    def test_a_titled_and_labelled_hot_fix_passes(self):
        r = self.check('[F00] Key Validation: Reject Bad Keys', ('type:hot-fix', 'theme:canon', 'priority: 10'))
        self.assertEqual(r.kind, 'hot-fix')
        self.assertEqual((r.apply, r.decide), ([], []))

    def test_the_prefix_alone_makes_a_hot_fix_that_lacks_its_label(self):
        r = self.check('[F03] Key Validation: Reject Bad Keys', ('theme:canon', 'priority: 10'))
        self.assertEqual(r.kind, 'hot-fix')
        self.assertEqual(r.apply, ['labels: add type:hot-fix'])

    def test_a_hot_fix_carries_priority_ten_alone(self):
        r = self.check('[F00] Key Validation: Reject Bad Keys', ('type:hot-fix', 'theme:canon', 'priority: 3'))
        self.assertEqual(r.apply, ['labels: remove priority: 3, add priority: 10'])

    def test_the_label_without_the_prefix_is_a_finding_on_a_standalone_issue(self):
        r = self.check('Key Validation: Reject Bad Keys', ('type:hot-fix', 'theme:canon'))
        self.assertEqual(r.kind, 'issue')
        self.assertIn('type:hot-fix on a title without an [F00] prefix: retitle it as a hot-fix, '
                      'or remove the label', r.decide)

    def test_a_hot_fix_needs_a_theme(self):
        r = self.check('[F00] Key Validation: Reject Bad Keys', ('type:hot-fix',))
        self.assertIn('no theme:* label', r.decide)

    def test_a_hot_fix_states_its_boundary_in_the_proposal(self):
        text = hotfix_body() + '\n## Non-Goals\n\n- Nothing else.\n'
        r = self.check('[F00] Key Validation: Reject Bad Keys', ('type:hot-fix', 'theme:canon'), text)
        self.assertIn('Non-Goals: a hot-fix states its boundary in the Proposal', r.decide)

    def test_a_hot_fix_names_its_target(self):
        r = self.check('[F00] Key Validation: Reject Bad Keys', ('type:hot-fix', 'theme:canon', 'priority: 10'),
                       hotfix_body(None))
        self.assertEqual(r.decide, ['hot-fix: no Target: lines in the Overview; it names one target branch'])

    def test_a_hot_fix_names_one_target(self):
        text = hotfix_body().replace('Target: `main`', 'Target: `main`\n\nTarget: `workspace`')
        r = self.check('[F00] Key Validation: Reject Bad Keys', ('type:hot-fix', 'theme:canon', 'priority: 10'), text)
        self.assertEqual(r.decide, ['hot-fix: 2 Target: lines in the Overview; it names one target branch'])

    def test_each_hot_fix_fault_is_reported_once(self):
        r = self.check('[F00] Key Validation: Reject Bad Keys', ('type:hot-fix',), hotfix_body(None))
        self.assertEqual(r.apply, ['labels: add priority: 10'])
        self.assertEqual(r.decide, ['no theme:* label',
                                    'hot-fix: no Target: lines in the Overview; it names one target branch'])

    def test_a_standalone_issue_needs_no_target(self):
        r = self.check('Key Validation: Reject Bad Keys', (), body('Gap.', 'Design.'))
        self.assertEqual(r.decide, [])
