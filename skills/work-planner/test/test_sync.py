"""Done on a Work Breakdown row, ticked when the row is complete.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import sys
import tempfile
import unittest
from pathlib import Path

from fixtures import (commit_branches, declared, epic_body, git, hotfix, initiative_body, issue, links, pr,
                      repository, run, url)

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'scripts'))
from format import Review  # noqa: E402


def links_file(root: Path, held: list[dict]) -> str:
    """The issue links its pull requests hold, as --links reads them."""
    path = root / 'links.json'
    path.write_text(json.dumps(held))
    return str(path)


def synced(record: dict, pulls: list[dict], *args: str, held: list[dict] = ()) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        body, pulls_path, fixed = root / 'issue.json', root / 'prs.json', root / 'fixed.md'
        body.write_text(json.dumps(record))
        pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
        done = run('sync.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed),
                   '--links', links_file(root, list(held)),
                   *declared(root, 'docker', 'main', 'workflows'), *args)
        if done.returncode != 0:
            raise AssertionError(done.stderr.strip() or done.stdout)
        return fixed.read_text()


class Done(unittest.TestCase):
    def test_an_open_pull_request_replaces_the_planning_record_link(self):
        plan = 'https://github.com/o/r/blob/engineering/artifacts/planning/x/w01.md'
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({plan})', 'Work', '')))
        fixed = synced(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950')
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | |", fixed)
        self.assertNotIn('w01.md', fixed)

    def test_a_merged_pull_request_leaves_done_empty_while_a_criterion_is_unticked(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        fixed = synced(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')], '--link', 'W01=950')
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | |", fixed)
        self.assertNotIn('| ✓ |', fixed)

    def test_done_ticks_when_every_cited_criterion_is_ticked(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        fixed = synced(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')],
                        '--link', 'W01=950', '--tick', 'AC1')
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | ✓ |", fixed)
        self.assertIn('- [x] **AC1.**', fixed)

    def test_a_further_pull_request_on_the_same_branch_requires_another_task(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/e00/main'),
                 pr(951, '[I01:E00] Rest', merged='2026-09-02T00:00:00Z', base='i01/e00/main')]
        with self.assertRaisesRegex(AssertionError, 'further work needs another task'):
            synced(epic, pulls, '--link', 'W01=951')

    def test_a_row_links_one_delivery_per_long_lived_branch(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/e00/main'),
                 pr(951, '[I01:E00] Corpus', merged='2026-09-02T00:00:00Z', base='i01/e00/workflows')]
        fixed = synced(epic, pulls, '--link', 'W01=951')
        self.assertIn(f"| [W01]({url('pull', 950)}), [W01]({url('pull', 951)}) | Work | AC1 | | | |", fixed)

    @staticmethod
    def per_base():
        return [pr(950, '[I01:E00] Work: main', base='i01/e00/main'),
                pr(951, '[I01:E00] Work: workflows', base='i01/e00/workflows'),
                pr(952, '[I01:E00] Work: docker', base='i01/e00/docker')]

    def test_an_id_named_for_each_pull_request_links_them_all(self):
        plan = 'https://github.com/o/r/blob/engineering/artifacts/planning/x/w01.md'
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({plan})', 'Work', '')))
        fixed = synced(epic, self.per_base(), '--link', 'W01=950,W01=951,W01=952')
        self.assertIn(f"| [W01]({url('pull', 950)}), [W01]({url('pull', 951)}), [W01]({url('pull', 952)}) "
                      "| Work | AC1 | | | |", fixed)
        self.assertNotIn('w01.md', fixed)

    def test_a_repeated_run_leaves_the_row_unchanged(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        once = synced(epic, self.per_base(), '--link', 'W01=950,W01=951')
        again = synced(issue(2, '[I01:E00] First: Epic', body=once), self.per_base(), '--link', 'W01=950,W01=951')
        self.assertEqual(once, again)
        self.assertIn(f"| [W01]({url('pull', 950)}), [W01]({url('pull', 951)}) | Work | AC1 | | | |", again)

    def test_a_run_naming_a_linked_pull_request_keeps_the_row_order(self):
        ident = f"[W01]({url('pull', 950)}), [W01]({url('pull', 951)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((ident, 'Work', '')))
        fixed = synced(epic, self.per_base(), '--link', 'W01=951,W01=952,W01=951')
        self.assertIn(f"| [W01]({url('pull', 950)}), [W01]({url('pull', 951)}), [W01]({url('pull', 952)}) "
                      "| Work | AC1 | | | |", fixed)

    def test_two_named_pull_requests_on_one_branch_are_refused(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', base='i01/e00/main'), pr(951, '[I01:E00] Rest', base='i01/e00/main')]
        with self.assertRaisesRegex(AssertionError, 'names two deliveries on main'):
            synced(epic, pulls, '--link', 'W01=950,W01=951')

    def test_a_repeated_row_link_is_rejected_before_delivery(self):
        ident = f"[W01]({url('pull', 950)}), [W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((ident, 'Work', '')))
        with self.assertRaisesRegex(AssertionError, 'links each delivery once'):
            synced(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])

    def test_a_row_link_naming_another_row_is_rejected_before_delivery(self):
        ident = f"[W01]({url('pull', 950)}), [W02]({url('pull', 951)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((ident, 'Work', '')))
        with self.assertRaisesRegex(AssertionError, 'every link on a task row names that row'):
            synced(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z'),
                          pr(951, '[I01:E00] Rest')])

    def test_an_epic_row_ticks_when_its_issue_is_closed_as_completed(self):
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        with tempfile.TemporaryDirectory() as tmp:
            epic_path, body, fixed = Path(tmp, 'epic.json'), Path(tmp, 'issue.json'), Path(tmp, 'fixed.md')
            epic_path.write_text(json.dumps(epic))
            body.write_text(json.dumps(initiative))
            done = run('sync.py', str(body), '--epics', str(epic_path), '--fix', str(fixed))
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertIn(f"| [E00]({url('issues', 2)}) | Work | AC1 | | ✓ |", fixed.read_text())

    def test_an_open_epic_stays_empty(self):
        epic = issue(2, '[I01:E00] First: Epic')
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        with tempfile.TemporaryDirectory() as tmp:
            epic_path, body, fixed = Path(tmp, 'epic.json'), Path(tmp, 'issue.json'), Path(tmp, 'fixed.md')
            epic_path.write_text(json.dumps(epic))
            body.write_text(json.dumps(initiative))
            done = run('sync.py', str(body), '--epics', str(epic_path), '--fix', str(fixed))
            self.assertEqual(done.returncode, 0, done.stderr)
            text = fixed.read_text()
            self.assertIn(f"| [E00]({url('issues', 2)}) | Work | AC1 |  | |", text)
            self.assertNotIn('| ✓ |', text)


class PassedEvidence(unittest.TestCase):
    @staticmethod
    def plan(*checks):
        return '\n'.join(['## Test Plan', '', '| Test | Description | Coverage | Pass |',
                          '| --- | --- | --- | --- |',
                          *(f'| {test} | Check | {coverage} | {mark} |'
                            for test, coverage, mark in checks)])

    def pull(self, number=950, checks=(('T1', 'AC1', '[✓](https://example.com/evidence#test)'),), merged=True):
        return pr(number, '[I01:E00] Work', body=self.plan(*checks),
                  merged='2026-09-01T00:00:00Z' if merged else None)

    def epic(self, *numbers):
        return issue(2, '[I01:E00] First: Epic', body=epic_body(
            *((f"[W{i:02}]({url('pull', n)})", 'Work', '')
              for i, n in enumerate(numbers or (950,), 1))))

    def test_passed_check_ticks_criterion_and_done(self):
        fixed = synced(self.epic(), [self.pull()])
        self.assertIn('- [x] **AC1.**', fixed)
        self.assertIn('| AC1 | | | ✓ |', fixed)

    def test_all_supported_pass_marks_tick(self):
        for mark in ('[✓](https://example.com/evidence#test)', '[✓](http://example.com/result)'):
            with self.subTest(mark=mark):
                fixed = synced(self.epic(), [self.pull(checks=(('T1', 'AC1', mark),))])
                self.assertIn('- [x] **AC1.**', fixed)

    def test_incomplete_marks_withhold_ticks(self):
        for mark in ('', '[ ]', 'Fail', 'Partial', 'Not run', '[Fail](https://example.com/test)'):
            with self.subTest(mark=mark):
                fixed = synced(self.epic(), [self.pull(checks=(('T1', 'AC1', mark),))])
                self.assertIn('- [ ] **AC1.**', fixed)
                self.assertNotIn('| ✓ |', fixed)

    def test_every_observing_check_must_pass(self):
        for mark in ('', 'Fail', '[✓](https://example.com/evidence#test)'):
            with self.subTest(mark=mark):
                fixed = synced(self.epic(), [self.pull(checks=(('T1', 'AC1', '[✓](https://example.com/evidence#test)'),
                                                              ('T2', 'AC1', mark)))])
                self.assertEqual('- [x] **AC1.**' in fixed, mark == '[✓](https://example.com/evidence#test)')

    def test_nonobserving_rows_supply_no_evidence(self):
        for checks in ((('', 'AC1', '[✓](https://example.com/evidence#test)'),), (('T1', '', '[✓](https://example.com/evidence#test)'),), ()):
            with self.subTest(checks=checks):
                self.assertIn('- [ ] **AC1.**', synced(self.epic(), [self.pull(checks=checks)]))

    def test_unrelated_incomplete_check_does_not_block_observed_criterion(self):
        fixed = synced(self.epic(), [self.pull(checks=(('T1', 'AC1', '[✓](https://example.com/evidence#test)'), ('T2', '', 'Fail')))])
        self.assertIn('- [x] **AC1.**', fixed)

    def test_open_or_unlinked_pull_supplies_no_tick(self):
        self.assertIn('- [ ] **AC1.**', synced(self.epic(), [self.pull(merged=False)]))
        self.assertIn('- [ ] **AC1.**', synced(self.epic(), [self.pull(951)]))

    def test_every_covering_task_needs_passed_observation(self):
        for checks in ((('T1', 'AC1', ''),), (('T1', '', '[✓](https://example.com/evidence#test)'),), (('T1', 'AC1', '[✓](https://example.com/evidence#test)'),)):
            with self.subTest(checks=checks):
                fixed = synced(self.epic(950, 951), [self.pull(), self.pull(951, checks)])
                self.assertEqual('- [x] **AC1.**' in fixed, checks == (('T1', 'AC1', '[✓](https://example.com/evidence#test)'),))

    def test_pending_covering_task_prevents_automatic_and_explicit_ticks(self):
        epic, pulls = self.epic(950, 951), [self.pull(), self.pull(951, merged=False)]
        self.assertIn('- [ ] **AC1.**', synced(epic, pulls))
        with self.assertRaisesRegex(AssertionError, 'not ready to verify'):
            synced(epic, pulls, '--tick', 'AC1')

    def test_multiple_links_require_every_observing_check_to_pass_and_merge(self):
        epic = self.epic()
        epic['body'] = epic['body'].replace(f"[W01]({url('pull', 950)})",
            f"[W01]({url('pull', 950)}), [W01]({url('pull', 951)})")
        for mark, merged, expected in (('[✓](https://example.com/evidence#test)', True, True), ('', True, False), ('[✓](https://example.com/evidence#test)', False, False)):
            with self.subTest(mark=mark, merged=merged):
                fixed = synced(epic, [self.pull(), self.pull(951, (('T1', 'AC1', mark),), merged)])
                self.assertEqual('- [x] **AC1.**' in fixed, expected)
        self.assertIn('- [ ] **AC1.**', synced(epic, [self.pull()]))

    def test_out_of_scope_claim_cannot_verify_another_tasks_criterion(self):
        epic = self.epic(950, 951)
        epic['body'] = epic['body'].replace('| Work | AC1 |', '| Work | AC2 |', 1)
        epic['body'] += '\n- [ ] **AC2.** Other.\n'
        fixed = synced(epic, [self.pull(), self.pull(951, (('T1', '', '[✓](https://example.com/evidence#test)'),))])
        self.assertIn('- [ ] **AC1.**', fixed)
        self.assertIn('- [ ] **AC2.**', fixed)

    def test_existing_tick_and_explicit_verified_tick_are_preserved(self):
        epic = self.epic()
        epic['body'] = epic['body'].replace('- [ ]', '- [x]')
        pulls = [self.pull(checks=(('T1', 'AC1', ''),))]
        self.assertIn('- [x] **AC1.**', synced(epic, pulls))
        self.assertIn('- [x] **AC1.**', synced(self.epic(), pulls, '--tick', 'AC1'))
        self.assertIn('- [x] **AC1.**', synced(self.epic(), [self.pull()], '--tick', 'AC1'))

    def test_missing_or_unreadable_plan_leaves_criterion_unticked(self):
        for body in ('', '## Test Plan\n\n| Test | Coverage |\n| --- | --- |\n| T1 | AC1 |'):
            with self.subTest(body=body):
                pull = self.pull()
                pull['body'] = body
                self.assertIn('- [ ] **AC1.**', synced(self.epic(), [pull]))

    def test_automatic_ticks_report_completion_without_manual_verification(self):
        done, fixed = TaskLinks().run_sync(self.epic(), [self.pull()])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('ticked: AC1', done.stdout)
        self.assertIn('done: W01', done.stdout)
        self.assertNotIn('ready to verify:', done.stdout)
        self.assertNotIn('unmet:', done.stdout)
        self.assertIn('- [x] **AC1.**', fixed)

    def test_automatic_ticks_are_idempotent(self):
        epic, pulls = self.epic(), [self.pull()]
        fixed = synced(epic, pulls)
        epic['body'] = fixed
        self.assertEqual(synced(epic, pulls), fixed)


    def test_result_without_valid_evidence_link_withholds_tick(self):
        for mark in ('✓', '[x]', '[X]', '[✓]()', '[✓](#result)',
                     '[✓](file:///tmp/result)', '[✓](https://)',
                     '[✓](https://example.com/bad target)'):
            with self.subTest(mark=mark):
                fixed = synced(self.epic(), [self.pull(checks=(('T1', 'AC1', mark),))])
                self.assertIn('- [ ] **AC1.**', fixed)

    def test_fenced_example_withholds_automatic_tick(self):
        for fence in ('```markdown', '~~~markdown'):
            with self.subTest(fence=fence):
                pull = self.pull()
                pull['body'] = pull['body'].replace('## Test Plan', '## Test Plan\n\n' + fence) + '\n' + fence[:3]
                self.assertIn('- [ ] **AC1.**', synced(self.epic(), [pull]))


class TaskLinks(unittest.TestCase):
    def run_sync(self, epic: dict, pulls: list[dict], *args: str, tasks: list[dict] = (),
                 held: list[dict] = ()):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            body, pulls_path, fixed = root / 'issue.json', root / 'prs.json', root / 'fixed.md'
            body.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            task_paths = []
            for n, task in enumerate(tasks):
                path = root / f'task-{n}.json'
                path.write_text(json.dumps(task))
                task_paths.append(str(path))
            extra = ['--tasks', *task_paths] if task_paths else []
            done = run('sync.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed),
                       '--links', links_file(root, list(held)),
                       *declared(root, 'docker', 'main', 'workflows'), *extra, *args)
            return done, fixed.read_text() if fixed.exists() else ''

    def test_a_task_issue_with_no_row_is_unplaced(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        task = issue(3, '[I01:E00:W02] Other: Work')
        done, _fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')], tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('unplaced: W02 #3', done.stdout)

    def test_an_open_pull_request_is_linked_and_does_not_deliver(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | |", fixed)
        self.assertNotIn('| ✓ |', fixed)
        self.assertNotIn('ready to verify', done.stdout)
        self.assertNotIn('in flight:', done.stdout)
        self.assertIn('closable: no (undelivered W01', done.stdout)

    def test_an_open_pull_request_is_not_ready_to_tick(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950', '--tick', 'AC1')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('not ready to verify', done.stderr)

    def test_a_further_open_pull_request_is_in_flight_until_linked(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work'), pr(951, '[I01:E00] More')]
        done, _ = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('in flight: #950', done.stdout)
        self.assertNotIn('unmatched: #950', done.stdout)
        self.assertIn('in flight: #951', done.stdout)

    def test_a_row_linking_its_task_issue_links_the_pull_request(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950', tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"[W01]({url('pull', 950)})", fixed)
        self.assertNotIn(url('issues', 3), fixed)
        self.assertIn('uncited: #950 does not link W01 #3', done.stdout)

    def test_a_pull_request_whose_development_field_links_the_task_issue_is_not_uncited(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950',
                                    tasks=[task], held=[links(950, 3)])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"[W01]({url('pull', 950)})", fixed)
        self.assertNotIn('uncited:', done.stdout)

    def test_a_pull_request_linking_another_issue_is_uncited(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950',
                                tasks=[task], held=[links(950, 4)])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('uncited: #950 does not link W01 #3', done.stdout)

    def test_a_link_to_the_same_number_in_another_repository_is_uncited(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work')], '--link', 'W01=950',
                                tasks=[task], held=[links(950, 3, issue_repo='o/s')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('uncited: #950 does not link W01 #3', done.stdout)

    def test_a_pull_request_that_names_the_task_issue_in_its_body_is_uncited(self):
        task = issue(3, '[I01:E00:W01] Task: One')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', body=f"Closes {url('issues', 3)}")]
        done, _ = self.run_sync(epic, pulls, '--link', 'W01=950', tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('uncited: #950 does not link W01 #3', done.stdout)

    def test_a_merged_pull_request_with_an_unticked_criterion_is_unmet(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('unmet: W01 (#950): AC1 unticked', done.stdout)
        self.assertNotIn('done:', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_an_open_pull_request_leaves_coverage_unreported(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('unmet:', done.stdout)

    def test_a_delivered_task_reports_only_its_unticked_criteria(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', '')).replace(
            '| AC1 |', '| AC1, AC2 |').replace('- [ ] **AC1.** Holds.',
                                               '- [x] **AC1.** Holds.\n- [ ] **AC2.** Holds.')
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, _ = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('unmet: W01 (#950): AC2 unticked', done.stdout)
        self.assertNotIn('AC1 unticked', done.stdout)

    def test_a_merged_pull_request_from_another_epic_delivers_the_row(self):
        body = epic_body((f"[W01]({url('pull', 439)})", 'Work', '')).replace('- [ ] **AC1.**', '- [x] **AC1.**')
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [pr(439, '[I00:E09] Other', merged='2026-08-07T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('conflict: W01 links #439, whose title does not name this epic', done.stdout)
        self.assertNotIn('ticked early', done.stdout)
        self.assertIn(f"| [W01]({url('pull', 439)}) | Work | AC1 | | | ✓ |", fixed)
        self.assertIn('closable: yes', done.stdout)

    def test_a_foreign_merged_pull_request_with_an_unticked_criterion_is_unmet(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 439)})", 'Work', '')))
        done, fixed = self.run_sync(epic, [pr(439, '[I00:E09] Other', merged='2026-08-07T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('unmet: W01 (#439): AC1 unticked', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_a_linked_pull_request_absent_from_the_set_does_not_deliver(self):
        body = epic_body((f"[W01]({url('pull', 439)})", 'Work', '')).replace('- [ ] **AC1.**', '- [x] **AC1.**')
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('note: W01 links #439, which is not among the pull requests given', done.stdout)
        self.assertIn('ticked early: AC1 (W01 undelivered)', done.stdout)
        self.assertNotIn('conflict:', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_a_linked_commit_delivers_the_row_when_its_criteria_are_ticked(self):
        commit = 'https://github.com/o/r/commit/b41c0bf3e2201452ba9b9fffe6c681b157a5e946'
        body = epic_body((f"[W01]({commit})", 'Work', '')).replace('- [ ] **AC1.**', '- [x] **AC1.**')
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn(f"| [W01]({commit}) | Work | AC1 | | | ✓ |", fixed)
        self.assertIn('closable: yes', done.stdout)

    def test_done_ticks_once_the_row_no_longer_names_the_unmet_criterion(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', '')).replace('| AC1 |', '| |', 1)
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('done: W01', done.stdout)
        self.assertNotIn('unmet:', done.stdout)
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | | | | ✓ |", fixed)

    def test_a_tick_clears_while_a_cited_criterion_is_unticked(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', '')).replace('| | |', '| | ✓ |', 1)
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('cleared: W01', done.stdout)
        self.assertIn('unmet: W01 (#950): AC1 unticked', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_a_tick_clears_when_the_pull_request_is_open(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', '')).replace('| | |', '| | ✓ |', 1)
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        done, fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('cleared: W01', done.stdout)
        self.assertNotIn('| ✓ |', fixed)

    def test_pull_requests_without_their_issue_links_are_refused(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            body, pulls_path = root / 'issue.json', root / 'prs.json'
            body.write_text(json.dumps(epic))
            pulls_path.write_text(json.dumps(pr(950, '[I01:E00] Work')))
            done = run('sync.py', str(body), '--prs', str(pulls_path))
            self.assertNotEqual(done.returncode, 0)
            self.assertIn('needs --links', done.stderr)

    def test_a_closed_task_issue_stays_delivered_until_its_pull_request_is_linked(self):
        task = issue(3, '[I01:E00:W01] Task: Done', 'closed')
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Work', '')))
        done, _ = self.run_sync(epic, [], tasks=[task])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('ready to verify: AC1 (W01)', done.stdout)
        self.assertIn('note: W01 links task issue #3; link its pull request', done.stdout)


class DoneColumn(unittest.TestCase):
    def test_a_missing_done_column_is_added_empty(self):
        table = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                 '## Work Breakdown\n\n| Task | Description | Depends on | Joins |\n| --- | --- | --- | --- |\n'
                 '| W01 | Work → AC1 | | |\n\n## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                 '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        review = Review(issue(2, '[I01:E00] First: Epic', body=table))
        fixed = review.run()
        self.assertIn('Work Breakdown columns added: Coverage, Done', review.fixed)
        self.assertIn('Coverage filled from the Description', review.fixed)
        self.assertIn('| Task | Description | Coverage | Depends on | Joins | Done |', fixed)
        self.assertIn('| W01 | Work | AC1 | | | |', fixed)

    def test_a_leading_done_column_moves_to_the_end(self):
        epic = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                '## Work Breakdown\n\n| Done | Task | Description | Depends on | Joins |\n'
                '| --- | --- | --- | --- | --- |\n'
                '| [x] | W01 | Work → AC1 | | |\n\n## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        initiative = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                      '## Work Breakdown\n\n| Done | Epic | Description | Depends on |\n'
                      '| --- | --- | --- | --- |\n'
                      '| [x] | [E00](https://github.com/o/r/issues/3) | Work → AC1 | |\n\n'
                      '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n## Non-Goals\n\n- Out.\n\n'
                      '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        epic_fixed = Review(issue(2, '[I01:E00] First: Epic', body=epic)).run()
        initiative_fixed = Review(issue(1, '[I01] First: Initiative', body=initiative)).run()
        self.assertIn('| W01 | Work | AC1 | | | ✓ |', epic_fixed)
        self.assertIn('| [E00](https://github.com/o/r/issues/3) | Work | AC1 | | ✓ |', initiative_fixed)

    def test_a_note_after_the_criteria_stays_on_the_description(self):
        table = ('## Overview\n\nWhy.\n\n## Problem\n\nGap.\n\n## Proposal\n\nMove.\n\n'
                 '## Work Breakdown\n\n| Task | Description | Depends on | Joins | Done |\n'
                 '| --- | --- | --- | --- | --- |\n'
                 '| W01 | Reads count → AC1 ([#1053](https://github.com/o/r/pull/1053)) | | | ✓ |\n\n'
                 '## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n\n'
                 '## References\n\n- **R1.** [Plan](https://example.com) — the plan.\n')
        fixed = Review(issue(2, '[I01:E00] First: Epic', body=table)).run()
        self.assertIn('| W01 | Reads count ([#1053](https://github.com/o/r/pull/1053)) | AC1 | | | ✓ |', fixed)


class InitiativeClose(unittest.TestCase):
    def run_sync(self, epics: list[dict], ticked: bool = True, missing: bool = False) -> str:
        body = initiative_body(*[(f"[E{n:02d}]({url('issues', e['number'])})", '')
                                 for n, e in enumerate(epics)])
        if ticked:
            body = body.replace('- [ ] **AC1.**', '- [x] **AC1.**')
        initiative = issue(1, '[I01] First: Initiative', body=body)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            issue_path = root / 'issue.json'
            issue_path.write_text(json.dumps(initiative))
            paths = []
            for epic in epics:
                path = root / f"epic-{epic['number']}.json"
                path.write_text(json.dumps(epic))
                paths.append(str(path))
            done = run('sync.py', str(issue_path), '--epics', *(paths[:-1] if missing else paths))
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_completed_epics_and_ticked_criteria_close_without_branch_inputs(self):
        out = self.run_sync([issue(2, '[I01:E00] First: Epic', 'closed'),
                             issue(3, '[I01:E01] Second: Epic', 'closed')])
        self.assertIn('closable: yes', out)
        self.assertNotIn('unmerged:', out)

    def test_an_open_epic_blocks_even_with_ticked_initiative_criteria(self):
        out = self.run_sync([issue(2, '[I01:E00] First: Epic', 'closed'),
                             issue(3, '[I01:E01] Second: Epic')])
        self.assertIn('closable: no (undelivered E01)', out)

    def test_a_cancelled_epic_does_not_deliver_the_initiative(self):
        epic = issue(2, '[I01:E00] First: Epic', 'closed')
        epic['state_reason'] = 'not_planned'
        self.assertIn('closable: no (undelivered E00)', self.run_sync([epic]))

    def test_a_missing_epic_blocks_closure(self):
        out = self.run_sync([issue(2, '[I01:E00] First: Epic', 'closed')], missing=True)
        self.assertIn('closable: no (undelivered E00)', out)
        self.assertIn('its id links no issue given by --epics', out)

    def test_completed_epics_still_require_verified_initiative_criteria(self):
        out = self.run_sync([issue(2, '[I01:E00] First: Epic', 'closed')], ticked=False)
        self.assertIn('closable: no (unticked AC1)', out)
        self.assertIn('ready to verify: AC1 (E00)', out)


def ticked(body: str) -> str:
    return body.replace('- [ ] **AC1.**', '- [x] **AC1.**')


class EpicClose(unittest.TestCase):
    def run_sync(self, body: str, pulls: list[dict], held: list[dict] = (), state: str = 'open') -> str:
        epic = issue(2, '[I01:E00] First: Epic', state, body=body)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path),
                       '--links', links_file(root, list(held)),
                       *declared(root, 'docker', 'main', 'workflows'))
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_ticked_criteria_stay_open_until_the_epic_base_merges(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work')]
        out = self.run_sync(body, pulls)
        self.assertIn('unmerged: i01/e00/main', out)
        self.assertNotIn('draft:', out)
        self.assertIn('closable: no (unmerged i01/e00/main)', out)
        self.assertNotIn('in flight:', out)

    def test_an_open_epic_pull_request_is_named(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertIn('unmerged: i01/e00/main (#980 open)', out)
        self.assertNotIn('in flight:', out)
        self.assertNotIn('unmatched:', out)

    def test_a_complete_epic_names_the_draft_to_ready(self):
        """The signal Ready Epic Pull Request runs on: every row delivered, every criterion
        ticked, and the pull request merging the base still a draft."""
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertIn('unmerged: i01/e00/main (#980 draft)', out)

    def test_an_unticked_criterion_withholds_the_draft_from_readying(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', ''))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertNotIn('unmerged:', out)

    def test_a_review_pull_request_that_links_no_issue_is_uncited(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertIn('uncited: #980 does not link E00 #2', out)

    def test_a_review_pull_request_linking_the_epic_issue_is_not_uncited(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls, held=[links(980, 2)])
        self.assertNotIn('uncited:', out)

    def test_a_merged_epic_base_is_closable(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertNotIn('unmerged:', out)
        self.assertNotIn('unmatched:', out)
        self.assertIn('closable: yes', out)

    def test_a_merge_into_another_epic_does_not_complete_delivery(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='i01/e01/main', head='i01/e00/main')]
        self.assertIn('closable: no (unmerged i01/e00/main)', self.run_sync(body, pulls))

    def test_an_epic_head_alone_establishes_an_unmerged_base(self):
        body = ticked(epic_body(("[W01](https://github.com/o/r/commit/abc)", 'Work', '')))
        pulls = [pr(980, '[I01:E00] First', base='main', head='i01/e00/main')]
        self.assertIn('closable: no (unmerged i01/e00/main (#980 open))', self.run_sync(body, pulls))

    def test_one_unmerged_epic_base_blocks_when_another_has_merged(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''),
                                (f"[W02]({url('pull', 951)})", 'More', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(951, '[I01:E00] More', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/workflows', head='i01/e00/w02-more'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertIn('closable: no (unmerged i01/e00/workflows)', out)
        self.assertNotIn('i01/e00/main', out)

    def test_a_closed_issue_does_not_hide_an_unmerged_base(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''),
                                (f"[W02]({url('pull', 951)})", 'More', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/e00/main'),
                 pr(951, '[I01:E00] More', merged='2026-09-01T00:00:00Z', base='i01/e00/workflows'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls, state='closed')
        self.assertIn('#2 epic (closed)', out)
        self.assertIn('closable: no (unmerged i01/e00/workflows)', out)

    def test_an_unticked_criterion_does_not_report_an_unmerged_epic_base(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', ''))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work')]
        out = self.run_sync(body, pulls)
        self.assertNotIn('unmerged', out)
        self.assertIn('closable: no (unticked AC1)', out)

    def test_a_base_no_revision_names_is_unevaluable_rather_than_draft(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work')]
        out = self.run_sync(body, pulls)
        self.assertIn('unevaluable: draft i01/e00/main: no --revision names it, '
                      'so what it carries against main is unread', out)
        self.assertNotIn('draft: ', out)
        self.assertNotIn('unmerged', out)
        self.assertIn('closable: no (undelivered W02)', out)

    def test_an_open_draft_is_not_opened_again(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', ''))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertNotIn('draft:', out)

    def test_a_draft_epic_pull_request_is_named_when_the_epic_is_complete(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main')]
        out = self.run_sync(body, pulls)
        self.assertIn('unmerged: i01/e00/main (#980 draft)', out)
        self.assertNotIn('draft:', out)

    def test_an_undelivered_task_does_not_report_an_unmerged_epic_base(self):
        body = ticked(epic_body(('W01', 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', base='i01/e00/main', head='i01/e00/w01-work')]
        out = self.run_sync(body, pulls)
        self.assertNotIn('unmerged', out)
        self.assertIn('in flight:', out)
        self.assertIn('closable: no (undelivered W01)', out)

    def test_a_delivered_epic_with_no_base_is_closable(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        out = self.run_sync(body, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertNotIn('unmerged:', out)
        self.assertIn('closable: yes', out)

    def test_an_epic_base_in_another_repository_is_named_with_it(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950, 'o/other')})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work', repo='o/other')]
        out = self.run_sync(body, pulls)
        self.assertIn('closable: no (unmerged o/other:i01/e00/main)', out)


class PinnedEpicBase(unittest.TestCase):
    """An epic sync reads the long-lived branches its epic-base commit states.

    The long-lived branch main states docker and main; the epic base i01/e00/workflows adds
    workflows. The main working tree sits on main with an uncommitted statement of its own."""

    def run_sync(self, body: str, pulls: list[dict], revision: str) -> tuple[str, str]:
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            checkout, linked = root / 'checkout', root / 'linked'
            repository(checkout, 'docker', 'main')
            git(checkout, 'branch', 'workflows')
            git(checkout, 'worktree', 'add', str(linked), '-b', 'i01/e00/workflows')
            base = commit_branches(linked, 'docker', 'main', 'workflows')
            (checkout / 'config' / 'branches').write_text('docs\n')
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path),
                       '--links', links_file(root, []), '--project', str(checkout), '--revision', revision)
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout, base

    def pulls(self) -> list[dict]:
        return [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                   base='i01/e00/workflows', head='i01/e00/w01-work')]

    def test_the_epic_base_states_its_own_long_lived_branch(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', '')))
        out, base = self.run_sync(body, self.pulls(), 'i01/e00/workflows')
        self.assertIn('draft: i01/e00/workflows', out)
        self.assertIn(f'source: config/branches at {base} in ', out)

    def test_a_complete_epic_waits_on_the_base_its_commit_declares(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        out, _ = self.run_sync(body, self.pulls(), 'i01/e00/workflows')
        self.assertIn('closable: no (unmerged i01/e00/workflows)', out)

    def test_the_long_lived_revision_does_not_know_the_base(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        out, base = self.run_sync(body, self.pulls(), 'main')
        self.assertNotIn('draft:', out)
        self.assertNotIn('unmerged:', out)
        self.assertIn('target: #950 targets i01/e00/workflows', out)
        self.assertNotIn(base, out)
        self.assertIn('closable: yes', out)


class LongLivedNames(unittest.TestCase):
    """The names are the ones config/branches states at the evaluated commit."""

    def names(self, checkout: Path, revision: str = 'HEAD'):
        return run('sync.py', '--names', '--project', str(checkout), '--revision', revision)

    def test_the_statement_names_the_branches(self):
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            commit = repository(checkout, 'main', 'workflows', 'main')
            done = self.names(checkout)
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertEqual(done.stdout.split(), ['main', 'workflows'])
            self.assertIn(f'source: config/branches at {commit} in {(checkout / ".git").resolve()}', done.stderr)

    def test_a_directory_beside_the_statement_names_nothing(self):
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            repository(checkout, 'main')
            (checkout / '.project' / 'docker').mkdir(parents=True)
            (checkout / 'config' / 'components').mkdir()
            done = self.names(checkout)
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertEqual(done.stdout.split(), ['main'])

    def test_one_commit_reads_alike_from_divergent_and_dirty_worktrees(self):
        with tempfile.TemporaryDirectory() as tmp:
            main, divergent, dirty = Path(tmp) / 'main', Path(tmp) / 'divergent', Path(tmp) / 'dirty'
            evaluated = repository(main, 'docker', 'main')
            git(main, 'worktree', 'add', str(divergent), '-b', 'divergent')
            commit_branches(divergent, 'workflows')
            git(main, 'worktree', 'add', str(dirty), '-b', 'dirty', evaluated)
            (dirty / 'config' / 'branches').write_text('workspace\n')
            (main / 'config' / 'branches').write_text('docs\n')
            results = [self.names(checkout, evaluated) for checkout in (main, divergent, dirty)]
            for done in results:
                self.assertEqual(done.returncode, 0, done.stderr)
                self.assertEqual(done.stdout.split(), ['docker', 'main'])
            self.assertEqual(len({done.stderr for done in results}), 1, [done.stderr for done in results])

    def test_each_worktree_head_reads_its_own_commit(self):
        with tempfile.TemporaryDirectory() as tmp:
            main, divergent = Path(tmp) / 'main', Path(tmp) / 'divergent'
            repository(main, 'docker', 'main')
            git(main, 'worktree', 'add', str(divergent), '-b', 'divergent')
            commit_branches(divergent, 'workflows')
            self.assertEqual(self.names(main).stdout.split(), ['docker', 'main'])
            self.assertEqual(self.names(divergent).stdout.split(), ['workflows'])

    def test_an_uncommitted_statement_is_not_read(self):
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            repository(checkout, 'main')
            (checkout / 'config' / 'branches').write_text('main\nworkflows\n')
            done = self.names(checkout)
            self.assertEqual(done.stdout.split(), ['main'])

    def test_a_revision_resolving_to_no_commit_is_unevaluable(self):
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            repository(checkout, 'main')
            done = self.names(checkout, 'origin/i07/e00/main')
            self.assertEqual(done.returncode, 1)
            self.assertIn(f'unevaluable: config/branches at origin/i07/e00/main in {(checkout / ".git").resolve()} '
                          'is unreadable: the revision resolves to no commit', done.stderr)

    def test_a_statement_only_at_another_revision_is_unevaluable(self):
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            git(checkout, 'init')
            git(checkout, 'commit', '--allow-empty', '-m', 'no statement')
            bare = git(checkout, 'rev-parse', 'HEAD')
            commit_branches(checkout, 'main')
            done = self.names(checkout, bare)
            self.assertEqual(done.returncode, 1)
            self.assertIn(f'unevaluable: config/branches at {bare} in {(checkout / ".git").resolve()} is absent',
                          done.stderr)

    def test_an_empty_statement_is_unevaluable(self):
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            commit = repository(checkout)
            done = self.names(checkout)
            self.assertEqual(done.returncode, 1)
            self.assertIn(f'unevaluable: config/branches at {commit} in {(checkout / ".git").resolve()} '
                          'names no branch', done.stderr)

    def test_a_directory_in_place_of_the_statement_is_unreadable(self):
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            git(checkout, 'init')
            (checkout / 'config' / 'branches').mkdir(parents=True)
            (checkout / 'config' / 'branches' / 'main').write_text('main\n')
            git(checkout, 'add', 'config')
            git(checkout, 'commit', '-m', 'a directory')
            commit = git(checkout, 'rev-parse', 'HEAD')
            done = self.names(checkout)
            self.assertEqual(done.returncode, 1)
            self.assertIn(f'unevaluable: config/branches at {commit} in {(checkout / ".git").resolve()} '
                          'is unreadable: a tree, not a file', done.stderr)

    def test_a_statement_that_is_not_text_is_unreadable(self):
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            git(checkout, 'init')
            (checkout / 'config').mkdir()
            (checkout / 'config' / 'branches').write_bytes(b'main\n\xff\xfe\n')
            git(checkout, 'add', 'config')
            git(checkout, 'commit', '-m', 'binary')
            commit = git(checkout, 'rev-parse', 'HEAD')
            done = self.names(checkout)
            self.assertEqual(done.returncode, 1)
            self.assertEqual(done.stdout, '')
            self.assertIn(f'unevaluable: config/branches at {commit} in {(checkout / ".git").resolve()} '
                          'is unreadable: not UTF-8 text', done.stderr)

    def test_names_read_one_revision(self):
        with tempfile.TemporaryDirectory() as tmp:
            checkout = Path(tmp)
            repository(checkout, 'main')
            done = run('sync.py', '--names', '--project', str(checkout), '--revision', 'HEAD', '--revision', 'main')
            self.assertEqual(done.returncode, 1)
            self.assertIn('--names reads one --revision', done.stderr)

    def test_names_need_a_revision(self):
        with tempfile.TemporaryDirectory() as tmp:
            done = run('sync.py', '--names', '--project', tmp)
            self.assertEqual(done.returncode, 1)
            self.assertIn('--names needs --project and --revision', done.stderr)


CHECKS = ('epic-base pull requests set apart from task deliveries', 'unmerged epic bases', 'draft epic bases',
          'review pull request References', 'review pull request Changes paths', 'review pull request issue links')


class UnavailableDeclaration(unittest.TestCase):
    """An epic sync that cannot read the long-lived branches reports why, and the checks it did not make.

    main states docker and main. The epic base i01/e00/workflows is cut from a commit before any
    statement, so config/branches is present only at another revision."""

    def pulls(self) -> list[dict]:
        return [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                   base='i01/e00/workflows', head='i01/e00/w01-work'),
                pr(951, '[I01:E00] Review', state='open', draft=True,
                   base='workflows', head='i01/e00/workflows')]

    def run_sync(self, body: str, *args: str) -> str:
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in self.pulls()))
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path), '--links', links_file(root, []),
                       *[a.replace('<root>', str(root)) for a in args])
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def checkout(self, root: Path) -> str:
        checkout = root / 'checkout'
        checkout.mkdir()
        git(checkout, 'init')
        git(checkout, 'commit', '--allow-empty', '-m', 'no statement')
        bare = git(checkout, 'rev-parse', 'HEAD')
        git(checkout, 'branch', 'i01/e00/workflows', bare)
        commit_branches(checkout, 'docker', 'main')
        return bare

    def test_a_base_without_the_statement_is_unevaluable_with_its_source(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bare = self.checkout(root)
            out = self.run_sync_in(root, body, 'i01/e00/workflows')
        repository_dir = (root / 'checkout' / '.git').resolve()
        self.assertIn(f'unevaluable: config/branches at {bare} in {repository_dir} is absent', out)
        self.assertNotIn('source:', out)
        self.assertIn('closable: no (long-lived branches unevaluable)', out)
        self.assertNotIn('unmerged:', out)

    def test_the_checks_left_unmade_are_named(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', ''))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.checkout(root)
            out = self.run_sync_in(root, body, 'i01/e00/workflows')
        for check in CHECKS:
            self.assertIn(f'not checked: {check}', out)
        self.assertNotIn('draft:', out)

    def test_a_run_given_no_branches_names_the_checks_it_did_not_make(self):
        out = self.run_sync(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        self.assertIn('unevaluable: long-lived branches not given', out)
        for check in CHECKS:
            self.assertIn(f'not checked: {check}', out)

    def test_a_readable_statement_leaves_no_check_unmade(self):
        body = epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', ''))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.checkout(root)
            out = self.run_sync_in(root, body, 'main')
        self.assertNotIn('unevaluable:', out)
        self.assertNotIn('not checked:', out)
        self.assertIn('source: config/branches at ', out)

    def run_sync_in(self, root: Path, body: str, *revisions: str) -> str:
        args = ['--project', str(root / 'checkout')]
        for revision in revisions:
            args += ['--revision', revision]
        return self.run_sync(body, *args)


class SeveralEpicBases(unittest.TestCase):
    """An epic sync reads the declaration at each epic-base commit it is given.

    The epic base i01/e00/main sits on main, which states docker and main; i01/e00/workflows adds
    workflows on its own commit."""

    def run_sync(self, body: str, *revisions: str, absent: bool = False) -> tuple[str, dict[str, str], Path]:
        epic = issue(2, '[I01:E00] First: Epic', body=body)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            checkout, linked = root / 'checkout', root / 'linked'
            commits = {'main': repository(checkout, 'docker', 'main')}
            git(checkout, 'branch', 'i01/e00/main')
            git(checkout, 'worktree', 'add', str(linked), '-b', 'i01/e00/workflows')
            if absent:
                git(linked, 'rm', '-q', 'config/branches')
                git(linked, 'commit', '-m', 'drop the statement')
                commits['workflows'] = git(linked, 'rev-parse', 'HEAD')
            else:
                commits['workflows'] = commit_branches(linked, 'docker', 'main', 'workflows')
            git(checkout, 'worktree', 'add', str(root / 'docker'), '-b', 'i01/e00/docker', commits['main'])
            git(root / 'docker', 'commit', '--allow-empty', '-m', 'docker work')
            commits['docker'] = git(root / 'docker', 'rev-parse', 'HEAD')
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in self.pulls()))
            args = ['--project', str(checkout)]
            for revision in revisions:
                args += ['--revision', revision]
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path), '--links', links_file(root, []), *args)
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout, commits, (checkout / '.git').resolve()

    def pulls(self) -> list[dict]:
        return [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                   base='i01/e00/main', head='i01/e00/w01-work')]

    def test_disagreeing_declarations_are_each_reported_with_their_source(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        out, commits, repo = self.run_sync(body, 'i01/e00/main', 'i01/e00/workflows')
        self.assertIn(f"unevaluable: config/branches at {commits['main']} in {repo} states docker, main", out)
        self.assertIn(f"unevaluable: config/branches at {commits['workflows']} in {repo} states docker, main, workflows",
                      out)
        self.assertNotIn('source:', out)
        self.assertNotIn('unmerged:', out)
        for check in CHECKS:
            self.assertIn(f'not checked: {check}', out)
        self.assertIn('closable: no (long-lived branches unevaluable)', out)

    def test_agreeing_declarations_are_read_from_each_source(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        out, commits, repo = self.run_sync(body, 'i01/e00/main', 'i01/e00/docker', 'main')
        self.assertIn(f"source: config/branches at {commits['main']} in {repo}", out)
        self.assertIn(f"source: config/branches at {commits['docker']} in {repo}", out)
        self.assertEqual(out.count('source:'), 2)
        self.assertIn('closable: no (unmerged i01/e00/main)', out)
        self.assertNotIn('unevaluable:', out)

    def test_one_absent_declaration_leaves_the_names_unevaluable(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        out, commits, repo = self.run_sync(body, 'i01/e00/main', 'i01/e00/workflows', absent=True)
        self.assertIn(f"unevaluable: config/branches at {commits['workflows']} in {repo} is absent", out)
        self.assertIn(f"source: config/branches at {commits['main']} in {repo}", out)
        self.assertIn('not checked: unmerged epic bases', out)
        self.assertIn('closable: no (long-lived branches unevaluable)', out)


def epic_rows(*rows: tuple[str, str, str]) -> str:
    """An epic body. Each row is the task id, its Coverage, and its Joins."""
    lines = ['## Work Breakdown', '',
             '| Task | Description | Coverage | Depends on | Joins | Done |',
             '| --- | --- | --- | --- | --- | --- |']
    named: list[str] = []
    for task, coverage, joins in rows:
        lines.append(f'| {task} | Work | {coverage} | | {joins} | |')
        for token in (part.strip() for part in coverage.split(',')):
            if len(token) > 2 and token.startswith('AC') and token[2:].isdigit() and token not in named:
                named.append(token)
    criteria = [f'- [ ] **{name}.** Holds.' for name in named]
    return '\n'.join(lines + ['', '## Acceptance Criteria', ''] + criteria + [''])


def plan_body(*rows: tuple[str, str], prose: str = '') -> str:
    """A pull request body whose Test Plan table holds rows of (test, coverage)."""
    lines = ['## Test Plan', '', '| Test | Description | Coverage | Pass |', '| --- | --- | --- | --- |']
    lines += [f'| {test} | The check holds. | {coverage} | |' for test, coverage in rows]
    if prose:
        lines += ['', prose]
    return '\n'.join(lines) + '\n'


class TestPlanAgreement(unittest.TestCase):
    def run_sync(self, epic: dict, pulls: list[dict], *args: str):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            body, pulls_path, fixed = root / 'issue.json', root / 'prs.json', root / 'fixed.md'
            body.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed),
                       '--links', links_file(root, []),
                       *declared(root, 'docker', 'main', 'workflows'), *args)
            return done, fixed.read_text() if fixed.exists() else ''

    def test_a_plan_that_names_an_uncovered_criterion_is_reported(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    body=plan_body(('T1', 'AC1'), ('T2', 'AC3')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W01: AC3 named, which the row does not cover', done.stdout)

    def test_a_covered_criterion_no_plan_row_names_is_reported(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1, AC2', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', body=plan_body(('T1', 'AC1')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W01: AC2 covered and named by no test', done.stdout)
        self.assertNotIn('no test observes it', done.stdout)

    def test_a_pull_request_with_no_test_plan_reports_unreadable(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1', '')))
        done, _fixed = self.run_sync(epic, [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950: unreadable test plan', done.stdout)

    def test_an_empty_test_cell_is_unobserved(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', body=plan_body(('', 'AC1')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W01: AC1 covered and no test observes it', done.stdout)
        self.assertNotIn('named by no test', done.stdout)

    def test_an_exact_plan_reports_nothing(self):
        task = f"[W01]({url('pull', 950)})"
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows((task, 'AC1', '')))
        pulls = [pr(950, '[I01:E00] Work', body=plan_body(('T1', 'AC1')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('disagreement:', done.stdout)

    def test_joined_rows_agree_when_the_plan_names_their_coverage(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', 'W02'),
            (f"[W02]({url('pull', 950)})", 'AC2', 'W01')))
        pulls = [pr(950, '[I01:E00] Work', body=plan_body(('T1', 'AC1'), ('T2', 'AC2')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('disagreement:', done.stdout)

    def test_a_joined_plan_that_misses_one_row_names_that_row(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', 'W02'),
            (f"[W02]({url('pull', 950)})", 'AC2', 'W01')))
        pulls = [pr(950, '[I01:E00] Work', body=plan_body(('T1', 'AC1')))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W02: AC2 covered and named by no test', done.stdout)
        self.assertNotIn('disagreement: #950 W01', done.stdout)

    def test_a_disagreement_leaves_linking_and_ticks_unchanged(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(('W01', 'AC1', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    body=plan_body(('T1', 'AC1'), ('T2', 'AC3')))]
        done, fixed = self.run_sync(epic, pulls, '--link', 'W01=950', '--tick', 'AC1')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W01: AC3 named, which the row does not cover', done.stdout)
        self.assertIn(f"| [W01]({url('pull', 950)}) | Work | AC1 | | | ✓ |", fixed)
        self.assertIn('- [x] **AC1.**', fixed)

    def test_a_statement_that_assigns_a_criterion_to_the_wrong_row_is_reported(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        prose = 'AC2 is not delivered here; it belongs to W03.'
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', body=plan_body(('T1', 'AC1'), prose=prose))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W03: AC2 assigned to W03, which the table gives to W02', done.stdout)
        self.assertNotIn('named, which', done.stdout)
        self.assertNotIn('named by no test', done.stdout)

    def test_left_to_and_owned_by_assign_the_same_way(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        for prose in ('AC2 is left to W03.', 'AC2 is owned by W03.'):
            pulls = [pr(950, '[I01:E00] Work', body=plan_body(('T1', 'AC1'), prose=prose))]
            done, _fixed = self.run_sync(epic, pulls)
            self.assertEqual(done.returncode, 0, done.stderr)
            self.assertIn('disagreement: #950 W03: AC2 assigned to W03, which the table gives to W02', done.stdout)

    def test_a_sentence_assigns_each_criterion_it_names(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        prose = 'AC1 and AC2 belong to W03.'
        pulls = [pr(950, '[I01:E00] Work', body=plan_body(('T1', 'AC1'), prose=prose))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('disagreement: #950 W03: AC1 assigned to W03, which the table gives to W01', done.stdout)
        self.assertIn('disagreement: #950 W03: AC2 assigned to W03, which the table gives to W02', done.stdout)

    def test_a_statement_that_assigns_a_criterion_to_its_row_is_silent(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        prose = 'AC2 is not delivered here; it belongs to W02.'
        pulls = [pr(950, '[I01:E00] Work', body=plan_body(('T1', 'AC1'), prose=prose))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('disagreement:', done.stdout)

    def test_an_assignment_in_the_next_sentence_is_not_read(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_rows(
            (f"[W01]({url('pull', 950)})", 'AC1', ''),
            ('W02', 'AC2', '')))
        prose = 'AC2 is not delivered here. It belongs to W03.'
        pulls = [pr(950, '[I01:E00] Work', body=plan_body(('T1', 'AC1'), prose=prose))]
        done, _fixed = self.run_sync(epic, pulls)
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertNotIn('disagreement:', done.stdout)


def review_body(*numbers: int) -> str:
    """A review pull request body whose References cite the given pull requests."""
    lines = ['## Overview', '', 'The base carries the epic.', '', '## References', '']
    lines += [f"- **R{i}.** [Work]({url('pull', n)}) — a task delivery." for i, n in enumerate(numbers, 1)]
    return '\n'.join(lines + [''])


class ReviewReferences(unittest.TestCase):
    def run_sync(self, pulls: list[dict], body: str | None = None) -> str:
        epic = issue(2, '[I01:E00] First: Epic',
                     body=body or epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', '')))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path),
                       '--links', links_file(root, []),
                       *declared(root, 'docker', 'main', 'workflows'))
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_a_review_body_that_cites_every_merge_is_silent(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main',
                    body=review_body(950))]
        self.assertNotIn('references:', self.run_sync(pulls))

    def test_a_merge_the_review_body_omits_names_both_sets(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(951, '[I01:E00] More', merged='2026-09-02T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w02-more'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main',
                    body=review_body(950))]
        out = self.run_sync(pulls)
        self.assertIn('references: i01/e00/main (#980) cites #950; merged #950, #951', out)

    def test_a_review_body_with_no_references_names_the_merges(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main')]
        out = self.run_sync(pulls)
        self.assertIn('references: i01/e00/main (#980) cites none; merged #950', out)

    def test_a_cited_pull_request_that_did_not_merge_into_the_base_is_named(self):
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main',
                    body=review_body(950, 44))]
        out = self.run_sync(pulls)
        self.assertIn('references: i01/e00/main (#980) cites #44, #950; merged #950', out)

    def test_a_bare_number_cites_a_pull_request(self):
        body = '\n'.join(['## References', '', '- **R1.** #950 — a task delivery.', ''])
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main', body=body)]
        self.assertNotIn('references:', self.run_sync(pulls))

    def test_a_citation_outside_references_is_not_read(self):
        body = '\n'.join(['## Overview', '', 'Opened on #950.', '', '## References', ''])
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main', body=body)]
        out = self.run_sync(pulls)
        self.assertIn('references: i01/e00/main (#980) cites none; merged #950', out)

    def test_each_base_is_measured_against_its_own_merges(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''),
                                (f"[W02]({url('pull', 951)})", 'More', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(951, '[I01:E00] More', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/workflows', head='i01/e00/w02-more'),
                 pr(980, '[I01:E00] First', base='main', head='i01/e00/main', body=review_body(950)),
                 pr(981, '[I01:E00] First', base='workflows', head='i01/e00/workflows',
                    body=review_body(950))]
        out = self.run_sync(pulls, body=body)
        self.assertIn('references: i01/e00/workflows (#981) cites #950; merged #951', out)
        self.assertNotIn('(#980)', out)

    def test_a_merged_review_pull_request_is_not_measured(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                    base='i01/e00/main', head='i01/e00/w01-work'),
                 pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                    base='main', head='i01/e00/main')]
        self.assertNotIn('references:', self.run_sync(pulls, body=body))


class TaskCriteria(unittest.TestCase):
    """A task issue's criteria against the pull request that delivers it, open or merged."""

    def run_sync(self, record: dict, pulls: list[dict], *args: str):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            body, pulls_path, fixed = root / 'issue.json', root / 'prs.json', root / 'fixed.md'
            body.write_text(json.dumps(record))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(body), '--prs', str(pulls_path), '--fix', str(fixed), *args)
            return done, fixed.read_text() if fixed.exists() else ''

    def task(self, ticked: bool = False) -> dict:
        return issue(3, '[I01:E00:W01] First: Work',
                     body=f"## Acceptance Criteria\n\n- [{'x' if ticked else ' '}] **AC1.** Holds.\n")

    def test_an_open_pull_request_makes_the_criteria_ready_to_verify(self):
        done, _ = self.run_sync(self.task(), [pr(950, '[I01:E00] Work')], '--pr', '950')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('linked: W01 in flight on #950', done.stdout)
        self.assertIn('ready to verify: AC1 (W01)', done.stdout)

    def test_a_criterion_ticks_while_the_pull_request_is_open(self):
        done, fixed = self.run_sync(self.task(), [pr(950, '[I01:E00] Work')],
                                    '--pr', '950', '--tick', 'AC1')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('- [x] **AC1.**', fixed)

    def test_an_open_pull_request_leaves_the_task_unclosable(self):
        done, _ = self.run_sync(self.task(True), [pr(950, '[I01:E00] Work')], '--pr', '950')
        self.assertIn('closable: no (undelivered W01)', done.stdout)

    def test_a_merged_pull_request_delivers_and_closes_the_task(self):
        done, _ = self.run_sync(self.task(True),
                                [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')],
                                '--pr', '950')
        self.assertIn('linked: W01 delivered by #950', done.stdout)
        self.assertIn('closable: yes', done.stdout)

    def test_a_task_with_no_pull_request_reports_a_tick_as_early(self):
        done, _ = self.run_sync(self.task(True), [pr(950, '[I01:E00] Work')])
        self.assertIn('ticked early: AC1 (W01 has no pull request)', done.stdout)

    def test_a_pull_request_naming_another_epic_is_refused(self):
        done, _ = self.run_sync(self.task(), [pr(950, '[I01:E01] Work')], '--pr', '950')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('no pull request naming I01:E00', done.stderr)


class HistoricalDelivery(unittest.TestCase):
    def inspect(self, record, pulls, *args):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            source, records, fixed = root / 'issue.json', root / 'prs.json', root / 'fixed.md'
            source.write_text(json.dumps(record))
            records.write_text('\n'.join(json.dumps(p) for p in pulls))
            result = run('sync.py', str(source), '--prs', str(records),
                         '--links', links_file(root, []), '--fix', str(fixed),
                         *declared(root, 'main', 'workflows'), *args)
            return result, fixed.read_text() if fixed.exists() else None

    def test_closed_table_normalizes_embedded_coverage_before_delivery(self):
        body = ('## Work Breakdown\n\n| Done | Task | Description |\n| --- | --- | --- |\n'
                f'| ✓ | [W01]({url("pull", 950)}) | Work → AC2 |\n\n'
                '## Acceptance Criteria\n\n- [x] **AC2.** Holds.\n')
        record = issue(2, '[I01:E00] First: Epic', 'closed', body=body)
        pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')]
        result, fixed = self.inspect(record, pulls)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('| Task | Description | Coverage | Depends on | Joins | Done |', fixed)
        self.assertIn(f'| [W01]({url("pull", 950)}) | Work | AC2 | | | ✓ |', fixed)
        self.assertIn('normalized:', result.stdout)
        self.assertNotIn('AC1', fixed)
        record['body'] = fixed
        again, stable = self.inspect(record, pulls)
        self.assertEqual(stable, fixed)
        self.assertNotIn('normalized:', again.stdout)

    def test_closed_table_preserves_existing_coverage_and_dependencies(self):
        body = epic_body((f'[W01]({url("pull", 950)})', 'Work', 'E01:W01'))
        body = body.replace('| Joins | Done |', '| Done |').replace('| --- | --- | --- | --- | --- | --- |', '| --- | --- | --- | --- | --- |')
        body = body.replace('| E01:W01 | | |', '| E01:W01 | |')
        result, fixed = self.inspect(issue(2, '[I01:E00] First: Epic', 'closed', body=body),
                                     [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('| Work | AC1 | E01:W01 | | |', fixed)
        self.assertIn('unmet: W01 (#950): AC1 unticked', result.stdout)

    def test_unknown_historical_column_blocks_without_losing_content(self):
        body = epic_body(('W01', 'Work', '')).replace('Coverage', 'Evidence')
        result, fixed = self.inspect(issue(2, '[I01:E00] First: Epic', 'closed', body=body), [])
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('column not in the template: Evidence', result.stderr)
        self.assertIsNone(fixed)

    def test_linked_merged_title_is_repaired_then_reread_without_repeat(self):
        record = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({url("pull", 950)})', 'Work', '')))
        pulls = [pr(950, 'Work: Preserve the purpose', merged='2026-09-01T00:00:00Z')]
        result, fixed = self.inspect(record, pulls)
        expected = '[I01:E00] Work: Preserve the purpose'
        self.assertIn(f'retitle: #950 → {expected}', result.stdout)
        self.assertIn('conflict:', result.stdout)
        pulls[0]['title'] = expected
        reread, stable = self.inspect(record, pulls)
        self.assertNotIn('retitle:', reread.stdout)
        self.assertNotIn('conflict:', reread.stdout)
        self.assertEqual(stable, fixed)

    def test_pull_request_linked_in_the_run_is_checked_for_its_prefix_in_that_run(self):
        record = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        named = pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')
        result, fixed = self.inspect(record, [named], '--link', 'W01=950')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn(f'[W01]({url("pull", 950)})', fixed)
        self.assertIn('linked: W01 → #950', result.stdout)
        self.assertNotIn('retitle:', result.stdout)
        for title in ('Work', '[I01] Work', '[I01:E00:W01] Work'):
            with self.subTest(title=title):
                result, fixed = self.inspect(record, [pr(950, title, merged='2026-09-01T00:00:00Z')],
                                             '--link', 'W01=950')
                self.assertNotEqual(result.returncode, 0)
                self.assertIn('--link W01=950: no pull request naming this epic', result.stderr)
                self.assertIsNone(fixed)

    def test_title_repairs_exclude_open_unlinked_and_other_epic_titles(self):
        record = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({url("pull", 950)})', 'Work', '')))
        for linked in [pr(950, 'Open work'), pr(950, '[I01:E01] Other work', merged='2026-09-01T00:00:00Z')]:
            with self.subTest(title=linked['title']):
                result, _ = self.inspect(record, [linked, pr(951, 'Unlinked', merged='2026-09-01T00:00:00Z')])
                self.assertNotIn('retitle:', result.stdout)
                self.assertIn('conflict:', result.stdout)


    def test_matching_historical_initiative_and_task_prefixes_receive_epic_prefix(self):
        record = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({url("pull", 950)})', 'Work', '')))
        for prefix in ('[I01]', '[I01:E00:W01]'):
            with self.subTest(prefix=prefix):
                result, _ = self.inspect(record, [pr(950, prefix + ' Work', merged='2026-09-01T00:00:00Z')])
                self.assertIn('retitle: #950 → [I01:E00] Work', result.stdout)

    def test_a_linked_task_titled_pull_request_is_retitled_once(self):
        record = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({url("pull", 950)})', 'Work', '')))
        result, _ = self.inspect(record, [pr(950, '[I01:E00:W01] Work', merged='2026-09-01T00:00:00Z')])
        self.assertEqual(result.stdout.count('retitle: #950'), 1, result.stdout)

    def test_another_initiatives_prefix_is_a_conflict(self):
        record = issue(2, '[I01:E00] First: Epic', body=epic_body((f'[W01]({url("pull", 950)})', 'Work', '')))
        result, _ = self.inspect(record, [pr(950, '[I02] Work', merged='2026-09-01T00:00:00Z')])
        self.assertNotIn('retitle:', result.stdout)
        self.assertIn('conflict:', result.stdout)


class BranchContract(unittest.TestCase):
    """Task pull requests target their epic's base, and an integration pull request merges that
    base into the long-lived branch it names."""

    def run_sync(self, pulls: list[dict], body: str = '', number: int = 2, which: str = '01:E00',
                 project: bool = True) -> str:
        epic = issue(number, f'[I{which}] First: Epic',
                     body=body or epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            names = declared(root, 'main', 'workspace') if project else []
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path),
                       '--links', links_file(root, []), *names)
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_the_valid_routes_report_no_target(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                                base='i01/e00/main', head='i01/e00/w01-work'),
                             pr(951, '[I01:E00] Work: workspace', base='i01/e00/workspace',
                                head='i01/e00/w01-work-workspace'),
                             pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                                base='main', head='i01/e00/main')])
        self.assertNotIn('target:', out)

    def test_a_task_pull_request_targeting_a_long_lived_branch_is_reported(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                                base='main', head='i01/e00/w01-work')])
        self.assertIn('target: #950 targets main; it targets i01/e00/main', out)

    def test_a_task_branch_for_one_of_several_bases_names_its_own(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', base='main', head='i01/e00/w01-work-workspace'),
                             pr(951, '[I01:E00] Work: main', base='i01/e00/main', head='i01/e00/w01-work-main')])
        self.assertIn('target: #950 targets main; it targets i01/e00/workspace', out)

    def test_a_single_branch_slug_ending_in_a_branch_name_names_no_base(self):
        out = self.run_sync([pr(950, '[I01:E00] Tidy', base='i01/e00/w03-other', head='i01/e00/w04-tidy-workspace'),
                             pr(951, '[I01:E00] Document', base='i01/e00/w03-other',
                                head='i01/e00/w05-document-main')])
        self.assertIn('target: #950 targets i01/e00/w03-other; it targets one of i01/e00/main or '
                      'i01/e00/workspace', out)
        self.assertIn('target: #951 targets i01/e00/w03-other; it targets one of i01/e00/main or '
                      'i01/e00/workspace', out)

    def test_a_sibling_ending_in_no_long_lived_branch_confirms_no_slug_word(self):
        out = self.run_sync([pr(950, '[I01:E00] Tidy', base='i01/e00/w03-other', head='i01/e00/w04-tidy-workspace'),
                             pr(951, '[I01:E00] Tidy docs', base='i01/e00/main', head='i01/e00/w04-tidy-docs')])
        self.assertIn('target: #950 targets i01/e00/w03-other; it targets one of i01/e00/main or '
                      'i01/e00/workspace', out)

    def test_a_head_without_a_slug_names_no_branch_by_its_name(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', base='i01/e00/w03-other', head='main'),
                             pr(951, '[I01:E00] Other', base='i01/e00/main', head='workspace')])
        self.assertIn('target: #950 targets i01/e00/w03-other; it targets one of i01/e00/main or '
                      'i01/e00/workspace', out)

    def test_a_single_branch_slug_ending_in_a_branch_name_yields_to_its_target(self):
        out = self.run_sync([pr(950, '[I01:E00] Tidy', base='main', head='i01/e00/w04-tidy-workspace')])
        self.assertIn('target: #950 targets main; it targets i01/e00/main', out)

    def test_a_target_naming_no_long_lived_branch_names_each_base(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', base='i01/e00/w02-other', head='i01/e00/w01-work')])
        self.assertIn('target: #950 targets i01/e00/w02-other; it targets one of i01/e00/main or '
                      'i01/e00/workspace', out)

    def test_a_task_pull_request_targeting_another_epics_base_is_reported(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', base='i01/e01/main', head='i01/e00/w01-work')])
        self.assertIn('target: #950 targets i01/e01/main', out)

    def test_a_task_pull_request_targeting_an_undeclared_branch_is_reported(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', base='i01/e00/docs', head='i01/e00/w01-work')])
        self.assertIn('target: #950 targets i01/e00/docs', out)

    def test_an_integration_pull_request_into_another_long_lived_branch_is_reported(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                                base='i01/e00/main', head='i01/e00/w01-work'),
                             pr(980, '[I01:E00] First', base='workspace', head='i01/e00/main')])
        self.assertIn('target: #980 merges i01/e00/main into workspace; it targets main', out)

    def test_an_integration_into_the_wrong_branch_leaves_the_base_unmerged(self):
        body = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        out = self.run_sync([pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                                base='i01/e00/main', head='i01/e00/w01-work'),
                             pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z',
                                base='workspace', head='i01/e00/main')], body)
        self.assertIn('target: #980 merges i01/e00/main into workspace', out)
        self.assertIn('closable: no (unmerged i01/e00/main)', out)

    def test_a_pull_request_closed_without_merging_is_not_reported(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', state='closed', base='main', head='i01/e00/w01-work')])
        self.assertNotIn('target:', out)

    def test_an_epic_integrates_while_another_epic_is_incomplete(self):
        body = ticked(epic_body((f"[W01]({url('pull', 960)})", 'Work', '')))
        out = self.run_sync([pr(950, '[I01:E00] Work', base='i01/e00/main', head='i01/e00/w01-work'),
                             pr(960, '[I01:E01] Other', merged='2026-09-01T00:00:00Z',
                                base='i01/e01/main', head='i01/e01/w01-other'),
                             pr(981, '[I01:E01] Second', merged='2026-09-02T00:00:00Z',
                                base='main', head='i01/e01/main')], body, number=3, which='01:E01')
        self.assertNotIn('target:', out)
        self.assertIn('closable: yes', out)

    def test_the_contract_is_not_checked_without_the_long_lived_branches(self):
        out = self.run_sync([pr(950, '[I01:E00] Work', base='main', head='i01/e00/w01-work')], project=False)
        self.assertNotIn('target:', out)
        self.assertIn('not checked: pull request targets', out)


class EpiclessTitles(unittest.TestCase):
    """An initiative pull request whose title names no epic is reported."""

    PULLS = [pr(950, '[I01] Shared work'), pr(951, '[I01:E00:W01] Task-titled work', merged='2026-09-01T00:00:00Z'),
             pr(952, '[I01:E00] Named work'), pr(953, '[I02] Another initiative'),
             pr(954, '[I010] Near-miss prefix'), pr(955, '[I01:E1] Short epic id'),
             pr(956, '[I01: E00] Spaced epic id'), pr(957, '[I01 E00] Unseparated epic id')]

    def run_sync(self, record: dict, *args: str) -> str:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(record))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in self.PULLS))
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path), *args)
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def assert_epicless(self, out: str) -> None:
        self.assertIn('no epic: #950 [I01] Shared work', out)
        self.assertNotIn('no epic: #951', out)
        self.assertIn('retitle: #951 → [I01:E00] Task-titled work', out)
        self.assertNotIn('no epic: #952', out)
        self.assertNotIn('no epic: #953', out)
        self.assertNotIn('#954', out)
        for line in ('#955 [I01:E1] Short epic id', '#956 [I01: E00] Spaced epic id',
                     '#957 [I01 E00] Unseparated epic id'):
            self.assertIn(f'no epic: {line}', out)

    def test_the_epic_sync_reports_them(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = self.run_sync(issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', ''))),
                                '--links', links_file(Path(tmp), []))
        self.assert_epicless(out)

    def test_the_initiative_sync_reports_them(self):
        initiative = issue(1, '[I01] First: Initiative', body=initiative_body((f"[E00]({url('issues', 2)})", '')))
        out = self.run_sync(initiative)
        self.assert_epicless(out)


class DraftBase(unittest.TestCase):
    """An epic base is draft only where it carries a commit its long-lived branch lacks.

    The remote-tracking refs origin/main and origin/i01/e00/main stand where a fetch leaves them, and
    the base is named to the run as origin/i01/e00/main. fork/i01/e00/main stands beside the base on a
    remote that holds no long-lived branch. W02 is undelivered, so the epic is incomplete."""

    BODY = ticked(epic_body((f"[W01]({url('pull', 950)})", 'Work', ''), ('W02', 'More', '')))
    TASK = pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/e00/main', head='i01/e00/w01-work')

    def run_sync(self, base_ahead: int, main_ahead: int, pulls: list[dict] = (),
                 revisions: tuple[str, ...] = ('origin/i01/e00/main',)) -> str:
        epic = issue(2, '[I01:E00] First: Epic', body=self.BODY)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            checkout = root / 'checkout'
            start = repository(checkout, 'docker', 'main')
            for ref, ahead in (('i01/e00/main', base_ahead), ('main', main_ahead)):
                git(checkout, 'checkout', '-q', '-B', f'local/{ref}', start)
                for n in range(ahead):
                    git(checkout, 'commit', '--allow-empty', '-m', f'{ref} {n}')
                git(checkout, 'update-ref', f'refs/remotes/origin/{ref}', 'HEAD')
            git(checkout, 'update-ref', 'refs/remotes/fork/i01/e00/main', 'origin/i01/e00/main')
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in [self.TASK, *pulls]))
            args = ['--project', str(checkout)]
            for revision in revisions:
                args += ['--revision', revision]
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path), '--links', links_file(root, []), *args)
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout

    def test_a_base_level_with_its_branch_is_not_draft(self):
        out = self.run_sync(base_ahead=0, main_ahead=0)
        self.assertNotIn('draft', out)
        self.assertNotIn('unevaluable:', out)

    def test_a_base_behind_its_branch_is_not_draft(self):
        out = self.run_sync(base_ahead=0, main_ahead=3)
        self.assertNotIn('draft', out)

    def test_a_base_ahead_of_its_branch_is_draft(self):
        out = self.run_sync(base_ahead=1, main_ahead=0)
        self.assertIn('draft: i01/e00/main', out)
        self.assertNotIn('unevaluable:', out)

    def test_a_base_ahead_of_and_behind_its_branch_is_draft(self):
        self.assertIn('draft: i01/e00/main', self.run_sync(base_ahead=1, main_ahead=3))

    def test_a_merged_review_leaves_a_level_base_without_a_draft(self):
        review = pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z', base='main', head='i01/e00/main')
        self.assertNotIn('draft', self.run_sync(base_ahead=0, main_ahead=0, pulls=[review]))

    def test_a_base_that_gains_a_commit_after_its_review_merged_is_draft_again(self):
        review = pr(980, '[I01:E00] First', merged='2026-09-02T00:00:00Z', base='main', head='i01/e00/main')
        self.assertIn('draft: i01/e00/main', self.run_sync(base_ahead=1, main_ahead=0, pulls=[review]))

    def test_an_open_review_withholds_the_draft(self):
        review = pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main')
        self.assertNotIn('draft:', self.run_sync(base_ahead=1, main_ahead=0, pulls=[review]))

    def test_a_long_lived_branch_absent_beside_the_base_is_unevaluable(self):
        out = self.run_sync(base_ahead=1, main_ahead=0, revisions=('fork/i01/e00/main',))
        self.assertIn('unevaluable: draft i01/e00/main: fork/main resolves to no commit', out)
        self.assertNotIn('draft: ', out)

    def test_a_base_in_another_repository_is_unevaluable(self):
        task = pr(951, '[I01:E00] Work', merged='2026-09-01T00:00:00Z', base='i01/e00/main',
                  head='i01/e00/w01-work', repo='o/other')
        out = self.run_sync(base_ahead=0, main_ahead=0, pulls=[task])
        self.assertIn('unevaluable: draft o/other:i01/e00/main: is in o/other, not the --project repository', out)


def changes_body(*spans: str) -> str:
    """A review pull request body whose Changes bullets name the given code spans."""
    lines = ['## Overview', '', 'The base carries the epic.', '', '## Changes', '', '### Review Bodies', '']
    lines += [f'- **Names `{span}`.**\n  The behaviour as it is.' for span in spans]
    return '\n'.join(lines + ['', '## References', '', f"- **R1.** [Work]({url('pull', 950)}) — a task delivery.", ''])


class ReviewChanges(unittest.TestCase):
    """A review body's Changes paths measured against the head commit of the base it fronts.

    The head commit holds config/branches, skills/work-planner/scripts/sync.py and docs/guide.md."""

    def run_sync(self, body: str, sha: str | None = None) -> str:
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', '')))
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            args = declared(root, 'docker', 'main', 'workflows')
            checkout = root / 'checkout'
            for path in ('skills/work-planner/scripts/sync.py', 'docs/guide.md'):
                (checkout / path).parent.mkdir(parents=True, exist_ok=True)
                (checkout / path).write_text('text\n')
            git(checkout, 'add', '.')
            git(checkout, 'commit', '-m', 'files')
            head = git(checkout, 'rev-parse', 'HEAD')
            review = pr(980, '[I01:E00] First', draft=True, base='main', head='i01/e00/main', body=body)
            review['head']['sha'] = head if sha is None else sha
            pulls = [pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z',
                        base='i01/e00/main', head='i01/e00/w01-work'), review]
            issue_path, pulls_path = root / 'issue.json', root / 'prs.json'
            issue_path.write_text(json.dumps(epic))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(issue_path), '--prs', str(pulls_path),
                       '--links', links_file(root, []), *args)
            self.assertEqual(done.returncode, 0, done.stderr)
            return done.stdout.replace(head[:9], '<head>')

    def test_a_path_absent_from_the_head_is_named(self):
        out = self.run_sync(changes_body('skills/work-planner/references/command-conventions.md'))
        self.assertIn('changes: i01/e00/main (#980) names '
                      'skills/work-planner/references/command-conventions.md, absent at <head>', out)

    def test_paths_standing_at_the_head_are_silent(self):
        out = self.run_sync(changes_body('skills/work-planner/scripts/sync.py', './docs/guide.md#usage'))
        self.assertNotIn('changes:', out)

    def test_a_bare_file_name_stands_anywhere_in_the_tree(self):
        self.assertNotIn('changes:', self.run_sync(changes_body('sync.py')))
        out = self.run_sync(changes_body('command-conventions.md'))
        self.assertIn('changes: i01/e00/main (#980) names command-conventions.md, absent at <head>', out)

    def test_a_span_that_names_no_file_is_not_measured(self):
        out = self.run_sync(changes_body('i01/e00/main', 'sync.py --names', '*.md', '1.2.3', 'Makefile'))
        self.assertNotIn('changes:', out)

    def test_an_extensionless_path_absent_from_the_head_is_named(self):
        out = self.run_sync(changes_body('skills/work-planner/scripts/missing-tool', 'config/missing'))
        self.assertIn('changes: i01/e00/main (#980) names skills/work-planner/scripts/missing-tool, absent at <head>', out)
        self.assertIn('changes: i01/e00/main (#980) names config/missing, absent at <head>', out)

    def test_an_extensionless_file_or_directory_at_the_head_is_silent(self):
        out = self.run_sync(changes_body('config/branches', 'skills/work-planner/scripts', 'skills/work-planner/'))
        self.assertNotIn('changes:', out)

    def test_a_line_reference_is_not_part_of_the_path(self):
        self.assertNotIn('changes:', self.run_sync(changes_body('skills/work-planner/scripts/sync.py:444',
                                                                'docs/guide.md:3-9')))
        out = self.run_sync(changes_body('docs/missing.md:12'))
        self.assertIn('changes: i01/e00/main (#980) names docs/missing.md, absent at <head>', out)

    def test_a_path_outside_changes_is_not_measured(self):
        body = '\n'.join(['## Overview', '', 'See `missing/file.md`.', '', '## References', '',
                          f"- **R1.** [Work]({url('pull', 950)}) — a task delivery.", ''])
        self.assertNotIn('changes:', self.run_sync(body))

    def test_a_dotted_name_no_file_at_the_head_carries_is_not_measured(self):
        out = self.run_sync(changes_body('board.Outputs', 'args.project', 'Outputs.consumer'))
        self.assertNotIn('changes:', out)

    def test_a_component_names_its_path_on_the_branch_the_review_fronts(self):
        self.assertNotIn('changes:', self.run_sync(changes_body('main:docs/guide.md', 'workflows:missing/flow.yaml')))
        out = self.run_sync(changes_body('main:docs/missing.md'))
        self.assertIn('changes: i01/e00/main (#980) names main:docs/missing.md, absent at <head>', out)

    def test_a_head_commit_the_checkout_does_not_hold_is_unevaluable(self):
        out = self.run_sync(changes_body('docs/guide.md'), sha='0' * 40)
        self.assertIn(f"unevaluable: i01/e00/main (#980) Changes paths: head {'0' * 40} is not held in", out)
        self.assertNotIn('changes:', out)


class IssueWithoutRepository(unittest.TestCase):
    """An epic, task or initiative sync reads no repository from the issue it is not given one for."""

    def run_sync(self, record: dict, *args: str):
        del record['repository_url']
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            body, pulls = root / 'issue.json', root / 'prs.json'
            body.write_text(json.dumps(record))
            pulls.write_text(json.dumps(pr(950, '[I01:E00] Work', merged='2026-09-01T00:00:00Z')))
            return run('sync.py', str(body), '--prs', str(pulls), '--links', links_file(root, [links(950, 3)]),
                       *args)

    def test_an_epic_without_repository_url_syncs(self):
        done = self.run_sync(issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 950)})", 'Work', ''))))
        self.assertEqual(done.returncode, 0, done.stderr)

    def test_a_task_without_repository_url_syncs(self):
        done = self.run_sync(issue(3, '[I01:E00:W01] Work: Task', body='## Acceptance Criteria\n\n- [ ] **AC1.** Holds.\n'),
                             '--pr', '950')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('linked: W01 delivered by #950', done.stdout)


class HotFixDelivery(unittest.TestCase):
    """A hot-fix is recorded as a task issue whose delivery is the pull request linking it."""

    def run_hotfix(self, pulls: list[dict], held: list[dict], *args: str):
        record = hotfix(4, target='workspace')
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            body, pulls_path, fixed = root / 'issue.json', root / 'prs.json', root / 'fixed.md'
            body.write_text(json.dumps(record))
            pulls_path.write_text('\n'.join(json.dumps(p) for p in pulls))
            done = run('sync.py', str(body), '--prs', str(pulls_path), '--links', links_file(root, held),
                       '--fix', str(fixed), *args)
            return done, fixed.read_text() if fixed.exists() else ''

    def test_a_merged_linking_pull_request_delivers_and_ticks_it(self):
        done, fixed = self.run_hotfix([pr(950, '[F04] Reject Bad Keys', merged='2026-11-01T00:00:00Z', base='workspace')],
                                      [links(950, 4)], '--pr', '950', '--tick', 'AC1,AC2')
        self.assertEqual(done.returncode, 0, done.stderr)
        self.assertIn('#4 hot-fix (open)', done.stdout)
        self.assertIn('linked: F04 delivered by #950', done.stdout)
        self.assertIn('closable: yes', done.stdout)
        self.assertIn('- [x] **AC1.** Holds.', fixed)

    def test_a_pull_request_not_linking_it_is_refused(self):
        done, _ = self.run_hotfix([pr(950, '[F04] Reject Bad Keys', base='workspace')], [links(950, 7)], '--pr', '950')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('--pr 950: does not deliver F04: its Development field does not link #4', done.stderr)

    def test_a_linking_pull_request_without_its_prefix_is_refused(self):
        done, _ = self.run_hotfix([pr(950, 'Key Validation: Reject Bad Keys', base='workspace')], [links(950, 4)],
                                  '--pr', '950')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('--pr 950: does not deliver F04: its title does not open with [F04]', done.stderr)

    def test_a_linking_pull_request_into_another_branch_is_refused(self):
        done, _ = self.run_hotfix([pr(950, '[F04] Reject Bad Keys', base='main')], [links(950, 4)],
                                  '--pr', '950')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('--pr 950: does not deliver F04: its base is main, not the target workspace',
                      done.stderr)
