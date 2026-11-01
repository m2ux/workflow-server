"""renumber.py rewrites an initiative's epic numbers, or one epic's task numbers, across issue bodies.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import pr, run


def renumbered(bodies: dict[str, str], *args: str, outside: dict[str, str] | None = None,
               prs: list[dict] | None = None) -> tuple[int, str, str, dict[str, str]]:
    """renumber.py over the bodies and the outside bodies, each written to its own file; the exit
    code, output, errors and each file's text afterwards. An argument naming a body is replaced by
    that body's path; the bodies follow the arguments, the outside bodies follow --outside."""
    outside = outside or {}
    with tempfile.TemporaryDirectory() as tmp:
        paths = {name: str(Path(tmp, f'{name}.md')) for name in {**bodies, **outside}}
        for name, text in {**bodies, **outside}.items():
            Path(paths[name]).write_text(text)
        extra = []
        if prs is not None:
            prs_path = Path(tmp, 'prs.json')
            prs_path.write_text('\n'.join(json.dumps(p) for p in prs))
            extra = ['--prs', str(prs_path)]
        argv = [paths.get(a, a) for a in args] + extra + [paths[n] for n in bodies]
        if outside:
            argv += ['--outside', *(paths[n] for n in outside)]
        done = run('renumber.py', *argv)
        after = {name: Path(path).read_text() for name, path in paths.items()}
    return done.returncode, done.stdout, done.stderr, after


INITIATIVE = (
    '## Work Breakdown\n\n'
    '| Epic | Description | Coverage | Depends on | Done |\n'
    '| --- | --- | --- | --- | --- |\n'
    '| [E00](https://github.com/o/r/issues/940) | Base | AC1 | | |\n'
    '| [E01](https://github.com/o/r/issues/941) | Next | AC1 | E00 | |\n'
    '| [E06](https://github.com/o/r/issues/946) | Last | AC1 | E01 | |\n'
)


def epics(*args: str, outside: dict[str, str] | None = None, prs: list[dict] | None = None,
          **bodies: str) -> tuple[int, str, str, dict[str, str]]:
    return renumbered(bodies or {'initiative': INITIATIVE}, '--initiative', '07', '--map', *args,
                      outside=outside, prs=prs)


class RenumberEpics(unittest.TestCase):
    def test_every_form_of_an_epic_reference_follows_the_map(self):
        body = 'E06 needs E06 W02, E06:W02, I07 E06 and I07:E06:W02.\n'
        code, _, _, after = epics('6:2', initiative=body)
        self.assertEqual(code, 0)
        self.assertEqual(after['initiative'], 'E02 needs E02 W02, E02:W02, I07 E02 and I07:E02:W02.\n')

    def test_a_swap_rewrites_each_reference_once(self):
        code, _, _, after = epics('6:0,0:6', initiative='E00 then E06.\n')
        self.assertEqual(code, 0)
        self.assertEqual(after['initiative'], 'E06 then E00.\n')

    def test_a_link_keeps_its_target(self):
        code, _, _, after = epics('6:2', initiative=INITIATIVE)
        self.assertEqual(code, 0)
        self.assertIn('| [E02](https://github.com/o/r/issues/946) | Last | AC1 | E01 | |', after['initiative'])

    def test_a_number_absent_from_the_map_keeps_its_own(self):
        code, _, _, after = epics('6:2', initiative=INITIATIVE)
        self.assertEqual(code, 0)
        self.assertIn('| [E00](https://github.com/o/r/issues/940) |', after['initiative'])
        self.assertIn('| [E01](https://github.com/o/r/issues/941) | Next | AC1 | E00 | |', after['initiative'])

    def test_a_reference_to_another_initiative_is_left_as_it_is(self):
        code, _, _, after = epics('6:2', initiative='E06 follows I03 E06 and I03:E06:W01.\n')
        self.assertEqual(code, 0)
        self.assertEqual(after['initiative'], 'E02 follows I03 E06 and I03:E06:W01.\n')

    def test_every_supplied_body_is_rewritten_and_counted(self):
        code, out, _, after = epics('6:2', initiative=INITIATIVE, epic='Builds on E06 W01.\n')
        self.assertEqual(code, 0)
        self.assertEqual(after['epic'], 'Builds on E02 W01.\n')
        self.assertIn('initiative.md: 1 references rewritten', out)
        self.assertIn('epic.md: 1 references rewritten', out)

    def test_an_outside_body_changes_only_references_carrying_this_initiative(self):
        other = 'Our E06 waits on I07 E06 and I07:E06:W02.\n'
        code, _, _, after = epics('6:2', outside={'other': other})
        self.assertEqual(code, 0)
        self.assertEqual(after['other'], 'Our E06 waits on I07 E02 and I07:E02:W02.\n')

    def test_a_pull_request_on_another_epic_or_initiative_does_not_hold_the_map(self):
        code, _, _, after = epics('6:2', prs=[pr(950, '[I07:E01] Next'), pr(951, '[I03:E06] Elsewhere')])
        self.assertEqual(code, 0)
        self.assertIn('[E02](https://github.com/o/r/issues/946)', after['initiative'])

    def test_an_initiative_pull_request_naming_no_epic_does_not_hold_the_map(self):
        code, _, _, after = epics('6:2', prs=[pr(950, '[I07] Work')])
        self.assertEqual(code, 0)
        self.assertIn('[E02](https://github.com/o/r/issues/946)', after['initiative'])

    def test_a_pull_request_on_an_epic_its_map_keeps_does_not_hold_the_map(self):
        code, _, _, after = epics('6:6,1:2', prs=[pr(950, '[I07:E06] Last')])
        self.assertEqual(code, 0)
        self.assertIn('[E02](https://github.com/o/r/issues/941)', after['initiative'])


class RefuseEpics(unittest.TestCase):
    def assertRefused(self, *args: str, says: str, **kwargs) -> None:
        code, _, err, after = epics(*args, **kwargs)
        self.assertNotEqual(code, 0)
        self.assertIn(says, err)
        self.assertIn('Nothing was written.', err)
        self.assertEqual(after['initiative'], INITIATIVE)

    def test_two_numbers_sent_to_one_are_refused(self):
        self.assertRefused('6:2,1:2', says='map sends epics onto [2]')

    def test_a_number_the_map_leaves_out_is_refused_as_a_target(self):
        self.assertRefused('6:1', says='map sends epics onto [1]')

    def test_a_number_absent_from_the_bodies_is_refused_as_a_source(self):
        self.assertRefused('9:4', says='map renumbers epics absent from the supplied files: [9]')

    def test_an_epic_a_pull_request_names_keeps_its_number(self):
        self.assertRefused('6:2', prs=[pr(950, '[I07:E06] Last', merged='2026-10-01T00:00:00Z')],
                           says='work a pull request names keeps its number: E06')

    def test_an_open_pull_request_holds_its_epic_too(self):
        self.assertRefused('6:2', prs=[pr(950, '[I07:E06] Last')], says='keeps its number: E06')

    def test_a_refusal_leaves_the_outside_bodies_unwritten(self):
        other = 'Waits on I07 E06.\n'
        code, _, _, after = epics('6:1', outside={'other': other})
        self.assertNotEqual(code, 0)
        self.assertEqual(after['other'], other)


EPIC = (
    '## Work Breakdown\n\n'
    '| Task | Description | Coverage | Depends on | Joins | Done |\n'
    '| --- | --- | --- | --- | --- | --- |\n'
    '| [W01](https://github.com/o/r/pull/950) | Merged | AC1 | | | ✓ |\n'
    '| [W02](https://github.com/o/r/issues/952) | Planned | AC1 | W01 | | |\n'
    '| W03 | Draft | AC1 | W02 | | |\n'
    '| W07 | Late | AC1 | W03, E02 W07 | | |\n'
    '\n'
    'W07 follows W03; see [I07 E00](https://github.com/o/r/issues/940) W07.\n'
)


def tasks(task_map: str, outside: dict[str, str] | None = None, own: str = EPIC,
          **bodies: str) -> tuple[int, str, str, dict[str, str]]:
    return renumbered({'own': own, **bodies}, '--initiative', '07', '--epic', '1', '--own', 'own',
                      '--tasks', task_map, outside=outside)


class RenumberTasks(unittest.TestCase):
    def test_bare_numbers_in_the_own_body_follow_the_map(self):
        code, _, _, after = tasks('7:4,3:5')
        self.assertEqual(code, 0)
        self.assertIn('| W05 | Draft | AC1 | W02 | | |', after['own'])
        self.assertIn('| W04 | Late | AC1 | W05, E02 W07 | | |', after['own'])
        self.assertIn('W04 follows W05;', after['own'])

    def test_another_epics_task_is_left_as_it_is(self):
        code, _, _, after = tasks('7:4')
        self.assertEqual(code, 0)
        self.assertIn('E02 W07', after['own'])

    def test_a_bare_number_right_after_a_link_belongs_to_the_linked_epic(self):
        code, _, _, after = tasks('7:4')
        self.assertEqual(code, 0)
        self.assertIn('[I07 E00](https://github.com/o/r/issues/940) W07.', after['own'])

    def test_qualified_references_in_other_bodies_follow_the_map(self):
        other = 'Needs E01 W07, E01:W07 and I07:E01:W07, not W07 or E02 W07 or I03:E01:W07.\n'
        code, _, _, after = tasks('7:4', task=other)
        self.assertEqual(code, 0)
        self.assertEqual(after['task'],
                         'Needs E01 W04, E01:W04 and I07:E01:W04, not W07 or E02 W07 or I03:E01:W07.\n')

    def test_the_own_body_is_rewritten_when_it_is_also_listed_among_the_bodies(self):
        with tempfile.TemporaryDirectory() as tmp:
            own = Path(tmp, 'own.md')
            own.write_text(EPIC)
            done = run('renumber.py', '--initiative', '07', '--epic', '1', '--own', str(own),
                       '--tasks', '7:4', str(own))
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertEqual(done.stdout.count('own.md:'), 1)
            self.assertIn('| W04 | Late |', own.read_text())

    def test_an_outside_body_changes_only_references_carrying_this_initiative(self):
        other = 'Our E01 W07 waits on I07 E01 W07 and I07:E01:W07.\n'
        code, _, _, after = tasks('7:4', outside={'other': other})
        self.assertEqual(code, 0)
        self.assertEqual(after['other'], 'Our E01 W07 waits on I07 E01 W04 and I07:E01:W04.\n')

    def test_a_range_it_rewrites_is_printed_for_checking(self):
        code, out, _, _ = tasks('7:4', own=EPIC + '\nW02–W07 land together.\n')
        self.assertEqual(code, 0)
        self.assertIn('  check range: W02–W04 land together.', out)

    def test_a_row_linking_its_task_issue_may_move(self):
        code, _, _, after = tasks('2:4')
        self.assertEqual(code, 0)
        self.assertIn('| [W04](https://github.com/o/r/issues/952) | Planned |', after['own'])


class RefuseTasks(unittest.TestCase):
    def assertRefused(self, task_map: str, says: str) -> None:
        other = 'Needs E01 W07.\n'
        code, _, err, after = tasks(task_map, task=other)
        self.assertNotEqual(code, 0)
        self.assertIn(says, err)
        self.assertIn('Nothing was written.', err)
        self.assertEqual(after, {'own': EPIC, 'task': other})

    def test_two_numbers_sent_to_one_are_refused(self):
        self.assertRefused('7:4,3:4', says='map sends tasks onto [4]')

    def test_a_row_the_map_leaves_out_is_refused_as_a_target(self):
        self.assertRefused('7:2', says='map sends tasks onto [2]')

    def test_a_row_the_own_body_lacks_is_refused_as_a_source(self):
        self.assertRefused('9:4', says='map renumbers tasks absent from the supplied files: [9]')

    def test_a_row_linking_a_pull_request_keeps_its_number(self):
        self.assertRefused('1:4', says='work a pull request names keeps its number: E01:W01')

    def test_a_row_linking_a_commit_keeps_its_number(self):
        code, _, err, _ = tasks('1:4', own=EPIC.replace('/pull/950', '/commit/abc123'))
        self.assertNotEqual(code, 0)
        self.assertIn('keeps its number: E01:W01', err)

    def test_a_ticked_row_linking_a_pull_request_keeps_its_number(self):
        ticked = EPIC.replace('| [W01](https', '| [x] | [W01](https')
        code, _, err, _ = tasks('1:4', own=ticked)
        self.assertNotEqual(code, 0)
        self.assertIn('keeps its number: E01:W01', err)


class Arguments(unittest.TestCase):
    def test_a_run_needs_exactly_one_mode(self):
        neither = run('renumber.py', '--initiative', '07')
        both = run('renumber.py', '--initiative', '07', '--map', '1:2', '--tasks', '1:2')
        for done in (neither, both):
            self.assertNotEqual(done.returncode, 0)
            self.assertIn('give either --map (epics) or --epic, --own and --tasks (tasks)', done.stderr)

    def test_task_mode_needs_its_epic_and_own_body(self):
        done = run('renumber.py', '--initiative', '07', '--epic', '1', '--tasks', '1:2')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('task mode needs --epic and --own', done.stderr)


if __name__ == '__main__':
    unittest.main()
