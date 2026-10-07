"""Mode summaries in each skill's SKILL.md.

A mode bullet names one capability, as the skill guidelines' Modes section states.
"""
import re
import unittest
from pathlib import Path

SKILLS = Path(__file__).resolve().parents[2]

STATUS = re.compile(r'\b(In Progress|In Review|Backlog|Ready|Done)\b')
RELATION = re.compile(r'\b(of|for|from|with|into|against|as|on|to|whose|that|within|when|in)\b|:')
GERUND = re.compile(r'^[A-Z][a-z]+ing\b')


def mode_bullets(text: str) -> list[tuple[str, str]]:
    lines = text.splitlines()
    try:
        start = next(i for i, line in enumerate(lines) if line == '## Modes')
    except StopIteration:
        return []
    end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith('## ')), len(lines))
    found = []
    mode = ''
    for line in lines[start:end]:
        if line.startswith('- **['):
            mode = line.split(']')[0].split('[')[-1]
        elif line.startswith('  - ') and mode:
            found.append((mode, line[4:]))
    return found


def problem(bullet: str) -> str | None:
    """Why a mode bullet departs from a capability phrase, or None when it holds."""
    if bullet.endswith('.'):
        return 'a trailing full stop'
    if ', so ' in bullet:
        return 'a purpose clause'
    for match in STATUS.finditer(bullet):
        prefix = bullet[:match.start()]
        if not prefix.endswith(('as ', 'in ')):
            return 'a board status outside a phrase'
    if GERUND.match(bullet) or bullet.startswith(('To ', 'What ')):
        return None
    if len(bullet.split()) <= 4 and ',' not in bullet:
        return None
    if RELATION.search(bullet):
        return None
    return 'not a noun phrase or a gerund phrase'


class ModeSummaries(unittest.TestCase):
    def test_each_skill_names_a_capability(self):
        departures = []
        seen = []
        for path in sorted(SKILLS.glob('*/SKILL.md')):
            for mode, bullet in mode_bullets(path.read_text()):
                seen.append(f'{path.parent.name} {mode}')
                why = problem(bullet)
                if why:
                    departures.append(f'{path.parent.name} {mode}: {why}: {bullet}')
        self.assertEqual(departures, [])
        self.assertIn('work-planner Advance', seen)
        self.assertIn('work-planner Align', seen)
        self.assertIn('workflow-canon Audit', seen)

    def test_a_placement_rule_is_not_a_capability_phrase(self):
        ruled = (
            'Sync of the board\'s open initiatives, so Status matches delivery',
            'A parallel work map when nothing is In Progress and no initiative has a priority',
            'The highest priority number In Progress together, and the next number Ready together',
            'Partly completed epics In Progress on a running initiative, and its next unstarted epic Ready',
        )
        for bullet in ruled:
            self.assertIsNotNone(problem(bullet), bullet)

    def test_a_noun_phrase_and_a_gerund_hold(self):
        held = (
            'Dependency checks',
            'Closure of complete task issues, epics and initiatives',
            'Placement of the highest set as In Progress and the next set as Ready',
            'Conformance with the guidelines and the skill\'s own guidelines',
            'Scoping the problem: the friction, the evidence, and the boundary',
        )
        for bullet in held:
            self.assertIsNone(problem(bullet), bullet)
