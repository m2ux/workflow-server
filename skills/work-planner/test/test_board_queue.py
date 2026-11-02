"""The queue board-queue.py sets on a theme board.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import epic_body, hotfix, initiative_body, issue, item, pr, run, url


RECORD = 'https://github.com/o/r/tree/engineering/artifacts/planning/2026-11-01-2-i01-e00-w01-go/'
FIELDS = [{'id': 7, 'name': 'Status', 'options': [
    {'name': name, 'id': n} for n, name in enumerate(
        ('Backlog', 'Ready', 'In Progress', 'In Review', 'Done'), start=1)]}]


def staged(*entries: tuple[dict, str]) -> list[dict]:
    items = []
    for n, (content, status) in enumerate(entries):
        content['id'] = 1000 + content['number']
        row = item(content, status)
        row['id'] = 100 + n
        items.append(row)
    return items


def initiative(number: int, name: str, *rows: tuple[str, str], priority: str = 'priority: 3',
               labels: tuple[str, ...] = (), repo: str = 'o/r') -> dict:
    return issue(number, f'[I{number:02d}] {name}', body=initiative_body(*rows),
                 labels=(priority, *labels) if priority else labels, repo=repo)


def epic(number: int, which: str, *tasks: tuple[str, str, str], repo: str = 'o/r',
         questions: str = '', priority: str = 'priority: 1') -> dict:
    body = epic_body(*tasks)
    if questions:
        body += f'\n## Open Questions\n\n- {questions}\n'
    return issue(number, f'[I{which}] Epic {number}: Work', body=body,
                 labels=(priority,) if priority else (), repo=repo)


def queue_run(items: list[dict], prs: list[dict] | None = None, unplanned: tuple[str, ...] = ()):
    """The complete queue run, for a test reading its exit status as well as its output."""
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        items_path, prs_path, fields = root / 'items.json', root / 'prs.json', root / 'fields.json'
        items_path.write_text(json.dumps(items))
        prs_path.write_text(''.join(json.dumps(row) + '\n' for row in prs or []))
        fields.write_text(json.dumps(FIELDS))
        extra = [arg for spec in unplanned for arg in ('--unplanned', spec)]
        return run('board-queue.py', '--items', str(items_path), '--prs', str(prs_path),
                   '--board', 'users/o/projectsV2/9', '--fields', str(fields),
                   '--out', str(root / 'out'), '--assignee', 'me', *extra)


def queue(items: list[dict], prs: list[dict] | None = None, unplanned: tuple[str, ...] = ()) -> str:
    done = queue_run(items, prs, unplanned)
    if done.returncode != 0:
        raise AssertionError(done.stderr or done.stdout)
    return done.stdout


class Queue(unittest.TestCase):
    def test_the_highest_backlog_initiative_moves_to_ready(self):
        first = initiative(1, 'Low: Later', (f"[E00]({url('issues', 3)})", ''))
        second = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((first, 'Ready'), (second, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('[I02] High: Next: Backlog → In Progress', out)
        self.assertNotIn('[I01] Low: Later: Ready →', out)

    def test_a_higher_priority_takes_in_progress_once_pull_requests_finish(self):
        low = initiative(1, 'Low: Current',
                         (f"[E00]({url('issues', 3)})", ''),
                         (f"[E01]({url('issues', 4)})", f"[E00]({url('issues', 3)})"))
        high = initiative(2, 'High: Next', (f"[E00]({url('issues', 5)})", ''), priority='priority: 5')
        started = epic(3, '01:E00', ('[W01](https://github.com/o/r/pull/9)', 'Go', ''))
        waiting = epic(4, '01:E01', ('W01', 'Go', ''))
        nxt = epic(5, '02:E00', ('W01', 'Go', ''))
        merged = [pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')]
        out = queue(staged((low, 'In Progress'), (high, 'Backlog'), (started, 'Backlog'),
                           (waiting, 'Backlog'), (nxt, 'Backlog')), merged)
        self.assertIn('[I01] Low: Current: In Progress → Ready', out)
        self.assertIn('[I01:E00] Epic 3: Work: Backlog → Ready', out)
        self.assertNotIn('Epic 4', out)
        self.assertIn('[I02] High: Next: Backlog → In Progress', out)

    def test_an_open_pull_request_holds_the_swap(self):
        low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 3)})", ''))
        high = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((low, 'In Progress'), (high, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')),
                    [pr(9, '[I01:E00] Open')])
        self.assertIn('wait #1 [I01] Low: Current:', out)
        self.assertIn('[I02] High: Next: Backlog → In Progress', out)
        self.assertNotIn('[I01] Low: Current: In Progress →', out)

    def test_in_review_does_not_fill_the_slot(self):
        reviewing = initiative(1, 'Done: Waiting', (f"[E00]({url('issues', 3)})", ''), priority='priority: 5')
        nxt = initiative(2, 'Next: Up', (f"[E00]({url('issues', 4)})", ''))
        out = queue(staged((reviewing, 'In Review'), (nxt, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Done'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('[I02] Next: Up: Backlog → In Progress', out)
        self.assertNotIn('[I01] Done: Waiting:', out)

    def test_a_debt_initiative_has_its_own_slot(self):
        feature = initiative(1, 'Feature: Current', (f"[E00]({url('issues', 3)})", ''))
        debt = initiative(2, 'Debt: Next', (f"[E00]({url('issues', 4)})", ''),
                          priority='priority: 2', labels=('tech-debt',))
        out = queue(staged((feature, 'In Progress'), (debt, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('[I02] Debt: Next: Backlog → Ready', out)
        self.assertNotIn('[I01] Feature: Current: In Progress →', out)

    def test_an_unlabelled_backlog_initiative_stays_there(self):
        bare = initiative(1, 'Bare: None', (f"[E00]({url('issues', 3)})", ''), priority='')
        ranked = initiative(2, 'Ranked: High', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((bare, 'Backlog'), (ranked, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('[I02] Ranked: High: Backlog → In Progress', out)
        self.assertNotIn('[I01] Bare: None:', out)

    def test_a_labelled_tie_promotes_neither(self):
        later = initiative(2, 'Later: Same', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        earlier = initiative(1, 'Earlier: Same', (f"[E00]({url('issues', 3)})", ''), priority='priority: 5')
        out = queue(staged((later, 'Ready'), (earlier, 'Backlog'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('[I01] Earlier: Same: Backlog → In Progress', out)
        self.assertIn('[I02] Later: Same: Ready → In Progress', out)
        self.assertNotIn('tie ', out)

    def test_an_unlabelled_ready_initiative_returns_to_backlog(self):
        bare = initiative(1, 'Bare: Ready', (f"[E00]({url('issues', 2)})", ''), priority='')
        out = queue(staged((bare, 'Ready'), (epic(2, '01:E00', ('W01', 'Go', '')), 'Ready')))
        self.assertIn('[I01] Bare: Ready: Ready → Backlog', out)
        self.assertIn('[I01:E00] Epic 2: Work: Ready → Backlog', out)

    def test_no_priority_and_nothing_in_progress_asks_for_two_orders(self):
        feature = initiative(1, 'Feature: One', (f"[E00]({url('issues', 3)})", ''), priority='')
        debt = initiative(2, 'Debt: One', (f"[E00]({url('issues', 4)})", ''), priority='', labels=('bug',))
        out = queue(staged((feature, 'Backlog'), (debt, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('order: #1 [I01] Feature: One, #2 [I02] Debt: One', out)
        self.assertNotIn('→', out)
        self.assertNotIn('the queue is current', out)

    def test_an_in_progress_initiative_without_priority_is_asked(self):
        bare = initiative(1, 'Bare: Current', (f"[E00]({url('issues', 2)})", ''), priority='')
        out = queue(staged((bare, 'In Progress'), (epic(2, '01:E00', ('W01', 'Go', '')), 'In Progress')))
        self.assertIn('order: #1 [I01] Bare: Current', out)
        self.assertNotIn('→', out)
        self.assertNotIn('the queue is current', out)

    def test_an_unplanned_initiative_waits_for_its_pull_request(self):
        bare = initiative(1, 'Bare: Current', (f"[E00]({url('issues', 3)})", ''), priority='')
        nxt = initiative(2, 'Next: Up', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((bare, 'In Progress'), (nxt, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')),
                    [pr(9, '[I01:E00] Open')], unplanned=('1',))
        self.assertIn('wait #1 [I01] Bare: Current: open pull request https://github.com/o/r/pull/9', out)
        self.assertIn('[I02] Next: Up: Backlog → In Progress', out)

    def test_an_unplanned_initiative_returns_to_backlog_with_its_epics(self):
        bare = initiative(1, 'Bare: Current', (f"[E00]({url('issues', 3)})", ''), priority='')
        nxt = initiative(2, 'Next: Up', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((bare, 'In Progress'), (nxt, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')), unplanned=('1',))
        self.assertIn('[I01] Bare: Current: In Progress → Backlog', out)
        self.assertIn('[I01:E00] Epic 3: Work: In Progress → Backlog', out)
        self.assertIn('[I02] Next: Up: Backlog → In Progress', out)

    def test_a_pull_request_without_the_epic_does_not_hold_the_swap(self):
        low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 3)})", ''))
        high = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((low, 'In Progress'), (high, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')),
                    [pr(9, '[I01] Open')])
        self.assertIn('[I01] Low: Current: In Progress → Ready', out)
        self.assertIn('[I02] High: Next: Backlog → In Progress', out)
        self.assertNotIn('wait ', out)

    def test_each_repository_has_its_own_slot(self):
        here = initiative(1, 'Here: One', (f"[E00]({url('issues', 3)})", ''))
        there = initiative(1, 'There: One', (f"[E00]({url('issues', 4, 'o/s')})", ''), repo='o/s')
        out = queue(staged((here, 'Backlog'), (there, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(4, '01:E00', ('W01', 'Go', ''), repo='o/s'), 'Backlog')))
        self.assertIn('[I01] Here: One: Backlog → In Progress', out)
        self.assertIn('o/s#1 [I01] There: One: Backlog → In Progress', out)

    def test_only_the_next_epic_of_the_in_progress_initiative_is_ready(self):
        current = initiative(1, 'Current: Work',
                             (f"[E00]({url('issues', 2)})", ''),
                             (f"[E01]({url('issues', 3)})", f"[E00]({url('issues', 2)})"),
                             (f"[E02]({url('issues', 4)})", f"[E01]({url('issues', 3)})"))
        done = issue(2, '[I01:E00] Epic 2: Work', 'closed', body=epic_body(('W01', 'Go', '')))
        nxt = epic(3, '01:E01', ('W01', 'Go', ''))
        extra = epic(4, '01:E02', ('W01', 'Go', ''))
        out = queue(staged((current, 'In Progress'), (done, 'Done'), (nxt, 'Backlog'), (extra, 'Ready')))
        self.assertIn('[I01:E01] Epic 3: Work: Backlog → Ready', out)
        self.assertIn('[I01:E02] Epic 4: Work: Ready → Backlog', out)

    def pair(self, first: str, second: str, held: str = 'Backlog') -> str:
        """Two epics of the In Progress initiative that can both start, with their priorities."""
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''),
                             (f"[E01]({url('issues', 3)})", ''))
        return queue(staged((current, 'In Progress'),
                            (epic(2, '01:E00', ('W01', 'Go', ''), priority=first), 'Backlog'),
                            (epic(3, '01:E01', ('W01', 'Go', ''), priority=second), held)))

    def test_epics_sharing_the_highest_number_start_together(self):
        out = self.pair('priority: 5', 'priority: 5')
        self.assertIn('[I01:E00] Epic 2: Work: Backlog → Ready', out)
        self.assertIn('[I01:E01] Epic 3: Work: Backlog → Ready', out)

    def test_an_epic_of_a_lower_number_waits_while_the_highest_set_runs(self):
        out = self.pair('priority: 5', 'priority: 2', held='Ready')
        self.assertIn('[I01:E00] Epic 2: Work: Backlog → Ready', out)
        self.assertIn('[I01:E01] Epic 3: Work: Ready → Backlog', out)

    def test_an_epic_with_no_priority_waits_while_a_labelled_sibling_can_start(self):
        out = self.pair('priority: 2', '')
        self.assertIn('[I01:E00] Epic 2: Work: Backlog → Ready', out)
        self.assertNotIn('[I01:E01] Epic 3: Work: Backlog → Ready', out)

    def test_an_epic_with_no_priority_stays_in_backlog_when_no_labelled_sibling_can_start(self):
        out = self.pair('', '')
        self.assertNotIn('→ Ready', out)
        self.assertIn('to do: 0', out)

    def test_a_ready_epic_with_no_priority_returns_to_backlog(self):
        out = self.pair('', '', held='Ready')
        self.assertIn('[I01:E01] Epic 3: Work: Ready → Backlog', out)
        self.assertNotIn('→ Ready', out)

    def test_an_epic_with_no_priority_is_reported_waiting_on_a_priority(self):
        out = self.pair('priority: 2', '')
        self.assertIn('rank #1 [I01] Current: Work: E01', out)
        out = self.pair('', '')
        self.assertIn('rank #1 [I01] Current: Work: E00, E01', out)

    def test_an_epic_with_no_priority_stays_in_backlog_while_its_labelled_sibling_has_open_questions(self):
        """The labelled sibling cannot start, so nothing labelled can start or is running."""
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''),
                             (f"[E01]({url('issues', 3)})", ''))
        asking = epic(2, '01:E00', ('W01', 'Go', ''), questions='Which shape?', priority='priority: 2')
        bare = epic(3, '01:E01', ('W01', 'Go', ''), priority='')
        out = queue(staged((current, 'In Progress'), (asking, 'Backlog'), (bare, 'Backlog')))
        self.assertNotIn('→ Ready', out)
        self.assertNotIn('next #1', out)
        self.assertNotIn('assignees', out)
        self.assertIn('rank #1 [I01] Current: Work: E01', out)

    def test_a_labelled_epic_is_not_reported_waiting_on_a_priority(self):
        out = self.pair('priority: 5', 'priority: 2')
        self.assertNotIn('rank ', out)

    def test_a_lower_set_waits_while_a_higher_one_is_under_way(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''),
                             (f"[E01]({url('issues', 3)})", ''))
        started = epic(2, '01:E00', (f"[W01]({url('pull', 9)})", 'Go', ''), priority='priority: 5')
        later = epic(3, '01:E01', ('W01', 'Go', ''), priority='priority: 2')
        out = queue(staged((current, 'In Progress'), (started, 'In Progress'), (later, 'Backlog')),
                    [pr(9, '[I01:E00] Go')])
        self.assertNotIn('[I01:E01] Epic 3: Work: Backlog → Ready', out)

    def test_an_epic_with_no_table_is_reported_and_leaves_the_queue_running(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''))
        broken = issue(2, '[I01:E00] Broken: Work', body='## Work Breakdown\n\nTBD\n')
        out = queue(staged((current, 'In Progress'), (broken, 'Backlog')))
        self.assertIn('Work Breakdown has no table', out)

    def test_an_open_question_keeps_the_next_epic_in_backlog(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''))
        asking = epic(2, '01:E00', ('W01', 'Go', ''), questions='Which shape?')
        out = queue(staged((current, 'In Progress'), (asking, 'Backlog')))
        self.assertNotIn('→ Ready', out)
        self.assertIn('to do: 0', out)

    def test_a_task_dependency_leaves_its_epic_ready(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''),
                             (f"[E01]({url('issues', 3)})", ''))
        prerequisite = epic(2, '01:E00', (f"[W01]({url('pull', 9)})", 'Produce', ''))
        dependent = epic(3, '01:E01', ('W01', 'Independent work', ''),
                         ('W02', 'Consume', f"[E00:W01]({url('issues', 2)})"))
        pulls = [pr(9, '[I01:E00] Produce', merged='2026-01-01T00:00:00Z', base='i01/e00/main')]
        out = queue(staged((current, 'In Progress'), (prerequisite, 'In Review'), (dependent, 'Ready')), pulls)
        self.assertNotIn('[I01:E01] Epic 3: Work: Ready → Backlog', out)

    def test_an_initiative_row_dependency_keeps_its_epic_in_backlog(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''),
                             (f"[E01]({url('issues', 3)})", f"[E00]({url('issues', 2)})"))
        prerequisite = epic(2, '01:E00', (f"[W01]({url('pull', 9)})", 'Produce', ''))
        dependent = epic(3, '01:E01', ('W01', 'Work', ''))
        pulls = [pr(9, '[I01:E00] Produce', merged='2026-01-01T00:00:00Z', base='i01/e00/main')]
        out = queue(staged((current, 'In Progress'), (prerequisite, 'In Review'), (dependent, 'Ready')), pulls)
        self.assertIn('[I01:E01] Epic 3: Work: Ready → Backlog', out)
        prerequisite['state'], prerequisite['state_reason'] = 'closed', 'completed'
        out = queue(staged((current, 'In Progress'), (prerequisite, 'Done'), (dependent, 'Backlog')), pulls)
        self.assertIn('[I01:E01] Epic 3: Work: Backlog → Ready', out)

    def test_a_reserved_epic_of_the_in_progress_initiative_is_in_progress(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''))
        held = epic(2, '01:E00', (f'[W01]({RECORD})', 'Go', ''))
        out = queue(staged((current, 'In Progress'), (held, 'Ready')))
        self.assertIn('[I01:E00] Epic 2: Work: Ready → In Progress', out)

    def test_an_epic_with_an_open_delivery_pull_request_is_in_progress(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''))
        out = queue(staged((current, 'In Progress'), (epic(2, '01:E00', ('W01', 'Go', '')), 'Backlog')),
                    [pr(9, '[I01:E00] Go', base='i01/e00/workspace', head='i01/e00/w01-go')])
        self.assertIn('[I01:E00] Epic 2: Work: Backlog → In Progress', out)

    def test_a_delivered_row_alone_leaves_the_epic_to_the_ready_rule(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''))
        started = epic(2, '01:E00', (f"[W01]({url('pull', 9)})", 'Go', ''), ('W02', 'More', ''))
        merged = [pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')]
        out = queue(staged((current, 'In Progress'), (started, 'In Progress')), merged)
        self.assertIn('[I01:E00] Epic 2: Work: In Progress → Ready', out)
        asking = epic(2, '01:E00', (f"[W01]({url('pull', 9)})", 'Go', ''), questions='Which shape?')
        out = queue(staged((current, 'In Progress'), (asking, 'In Progress')), merged)
        self.assertIn('[I01:E00] Epic 2: Work: In Progress → Backlog', out)

    def test_an_integration_draft_does_not_hold_the_swap(self):
        low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 3)})", ''))
        high = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        draft = pr(9, '[I01:E00] Integration', base='workspace', head='i01/e00/workspace', draft=True)
        out = queue(staged((low, 'In Progress'), (high, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')), [draft])
        self.assertNotIn('wait ', out)
        self.assertIn('[I01] Low: Current: In Progress → Ready', out)

    def test_a_pull_request_naming_an_epic_the_table_does_not_list_does_not_hold_the_swap(self):
        low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 3)})", ''))
        high = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((low, 'In Progress'), (high, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')), [pr(9, '[I01:E01] Moved')])
        self.assertNotIn('wait ', out)
        self.assertIn('[I01] Low: Current: In Progress → Ready', out)

    def test_the_lower_of_two_incumbents_returns_to_backlog(self):
        low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 4)})", ''), priority='priority: 2')
        mid = initiative(2, 'Mid: Current', (f"[E00]({url('issues', 5)})", ''), priority='priority: 3')
        high = initiative(3, 'High: Next', (f"[E00]({url('issues', 6)})", ''), priority='priority: 5')
        out = queue(staged((low, 'In Progress'), (mid, 'In Progress'), (high, 'Backlog'),
                           (epic(4, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(5, '02:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(6, '03:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('[I02] Mid: Current: In Progress → Ready', out)
        self.assertIn('[I01] Low: Current: In Progress → Backlog', out)
        self.assertIn('[I03] High: Next: Backlog → In Progress', out)

    def test_a_lower_ready_initiative_leaves_while_a_pull_request_holds_the_slot(self):
        incumbent = initiative(1, 'Mid: Current', (f"[E00]({url('issues', 4)})", ''), priority='priority: 3')
        choice = initiative(2, 'High: Next', (f"[E00]({url('issues', 5)})", ''), priority='priority: 5')
        extra = initiative(3, 'Low: Waiting', (f"[E00]({url('issues', 6)})", ''), priority='priority: 1')
        out = queue(staged((incumbent, 'In Progress'), (choice, 'Backlog'), (extra, 'Ready'),
                           (epic(4, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(5, '02:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(6, '03:E00', ('W01', 'Go', '')), 'Backlog')),
                    [pr(9, '[I01:E00] Open')])
        self.assertIn('wait #1 [I01] Mid: Current:', out)
        self.assertIn('[I03] Low: Waiting: Ready → Backlog', out)
        self.assertIn('[I02] High: Next: Backlog → In Progress', out)

    def test_a_confirmed_tie_starts_in_parallel(self):
        first = initiative(1, 'First: Tied', (f"[E00]({url('issues', 3)})", ''), priority='priority: 5')
        second = initiative(2, 'Second: Tied', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((first, 'Backlog'), (second, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')),
                    )
        self.assertIn('[I01] First: Tied: Backlog → In Progress', out)
        self.assertIn('[I02] Second: Tied: Backlog → In Progress', out)
        self.assertIn('[I01:E00] Epic 3: Work: Backlog → Ready', out)
        self.assertIn('[I02:E00] Epic 4: Work: Backlog → Ready', out)
        self.assertNotIn('tie ', out)

    def test_incumbents_that_share_a_rank_are_a_tie(self):
        low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 4)})", ''), priority='priority: 3')
        same = initiative(2, 'Same: Current', (f"[E00]({url('issues', 5)})", ''), priority='priority: 3')
        high = initiative(3, 'High: Next', (f"[E00]({url('issues', 6)})", ''), priority='priority: 5')
        out = queue(staged((low, 'In Progress'), (same, 'In Progress'), (high, 'Backlog'),
                           (epic(4, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(5, '02:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(6, '03:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertNotIn('tie ', out)
        self.assertIn('[I03] High: Next: Backlog → In Progress', out)
        self.assertIn('[I01] Low: Current: In Progress → Ready', out)
        self.assertIn('[I02] Same: Current: In Progress → Ready', out)

    def test_an_unplanned_wait_clears_a_ready_initiative_that_is_not_the_choice(self):
        bare = initiative(1, 'Bare: Current', (f"[E00]({url('issues', 4)})", ''), priority='')
        choice = initiative(2, 'High: Next', (f"[E00]({url('issues', 5)})", ''), priority='priority: 5')
        extra = initiative(3, 'Low: Waiting', (f"[E00]({url('issues', 6)})", ''), priority='priority: 1')
        out = queue(staged((bare, 'In Progress'), (choice, 'Ready'), (extra, 'Ready'),
                           (epic(4, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(5, '02:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(6, '03:E00', ('W01', 'Go', '')), 'Backlog')),
                    [pr(9, '[I01:E00] Open')], unplanned=('1',))
        self.assertIn('wait #1 [I01] Bare: Current:', out)
        self.assertNotIn('[I03] Low: Waiting: Ready →', out)
        self.assertIn('[I02] High: Next: Ready → In Progress', out)


def assigned(content: dict) -> dict:
    content['assignees'] = [{'login': 'me'}]
    return content


class ReadyFollowsTheInitiative(unittest.TestCase):
    """An unstarted epic is Ready exactly when its initiative is Ready or In Progress and its
    delivery and planning prerequisites are met."""

    def three(self, held: str, **gates) -> str:
        """Initiatives the queue places In Progress, Ready and Backlog, each with one epic held."""
        top = initiative(1, 'Top: Now', (f"[E00]({url('issues', 4)})", gates.get('depends', '')),
                         priority='priority: 5')
        mid = initiative(2, 'Mid: Next', (f"[E00]({url('issues', 5)})", gates.get('depends', '')),
                         priority='priority: 3')
        low = initiative(3, 'Low: Later', (f"[E00]({url('issues', 6)})", gates.get('depends', '')),
                         priority='priority: 1')
        questions = gates.get('questions', '')
        return queue(staged((top, 'In Progress'), (mid, 'Ready'), (low, 'Backlog'),
                            (epic(4, '01:E00', ('W01', 'Go', ''), questions=questions), held),
                            (epic(5, '02:E00', ('W01', 'Go', ''), questions=questions), held),
                            (epic(6, '03:E00', ('W01', 'Go', ''), questions=questions), held),
                            (issue(9, '[I09] Elsewhere: Open', body=initiative_body()), 'Backlog')))

    def test_an_epic_is_ready_under_an_in_progress_or_ready_initiative(self):
        out = self.three('Backlog')
        self.assertIn('[I01:E00] Epic 4: Work: Backlog → Ready', out)
        self.assertIn('[I02:E00] Epic 5: Work: Backlog → Ready', out)
        self.assertIn('next #2 [I02] Mid: Next: E00', out)
        self.assertNotIn('Epic 6', out)

    def test_a_ready_epic_under_a_backlog_initiative_returns_to_backlog(self):
        out = self.three('Ready')
        self.assertNotIn('[I01:E00] Epic 4: Work: Ready →', out)
        self.assertNotIn('[I02:E00] Epic 5: Work: Ready →', out)
        self.assertIn('[I03:E00] Epic 6: Work: Ready → Backlog', out)

    def test_an_unmet_delivery_prerequisite_keeps_the_epic_in_backlog(self):
        out = self.three('Ready', depends=f"[I09]({url('issues', 9)})")
        for name in ('[I01:E00] Epic 4', '[I02:E00] Epic 5', '[I03:E00] Epic 6'):
            self.assertIn(f'{name}: Work: Ready → Backlog', out)

    def test_an_unmet_planning_prerequisite_keeps_the_epic_in_backlog(self):
        out = self.three('Backlog', questions='Which shape?')
        self.assertNotIn('→', out)
        self.assertIn('to do: 0', out)

    def test_an_epic_under_an_initiative_in_review_leaves_ready(self):
        reviewing = initiative(1, 'Done: Waiting', (f"[E00]({url('issues', 3)})", ''))
        out = queue(staged((reviewing, 'In Review'), (epic(3, '01:E00', ('W01', 'Go', '')), 'Ready')))
        self.assertIn('[I01:E00] Epic 3: Work: Ready → Backlog', out)

    def waiting(self, held: str, priority: str, unplanned: tuple[str, ...] = (),
                engaged: str = 'In Progress') -> str:
        """An initiative kept In Progress by an open pull request on E00, below a higher one."""
        current = initiative(1, 'Low: Current', (f"[E00]({url('issues', 3)})", ''),
                             (f"[E01]({url('issues', 5)})", ''), priority=priority)
        high = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        return queue(staged((current, 'In Progress'), (high, 'Backlog'),
                            (epic(3, '01:E00', ('W01', 'Go', '')), engaged),
                            (epic(5, '01:E01', ('W01', 'Go', '')), held),
                            (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')),
                     [pr(9, '[I01:E00] Open', base='i01/e00/workspace', head='i01/e00/w01-go')],
                     unplanned=unplanned)

    def test_an_initiative_waiting_in_the_next_set_readies_no_epic(self):
        out = self.waiting('Backlog', 'priority: 3')
        self.assertIn('wait #1 [I01] Low: Current', out)
        self.assertNotIn('Epic 5', out)
        self.assertNotIn('next #1', out)

    def test_a_ready_epic_under_an_initiative_waiting_below_the_next_set_returns_to_backlog(self):
        out = self.waiting('Ready', 'priority: 1')
        self.assertNotIn('Epic 3: Work: In Progress →', out)
        self.assertIn('wait #1 [I01] Low: Current', out)
        self.assertIn('[I01:E01] Epic 5: Work: Ready → Backlog', out)

    def test_a_ready_epic_under_a_waiting_unplanned_initiative_returns_to_backlog(self):
        out = self.waiting('Ready', '', unplanned=('1',))
        self.assertIn('wait #1 [I01] Low: Current', out)
        self.assertIn('[I01:E01] Epic 5: Work: Ready → Backlog', out)

    def test_an_inactive_epic_in_progress_under_a_waiting_initiative_returns_to_backlog(self):
        for where, priority, unplanned in (('next set', 'priority: 3', ()),
                                           ('below the next set', 'priority: 1', ()),
                                           ('unplanned', '', ('1',))):
            with self.subTest(where):
                out = self.waiting('In Progress', priority, unplanned)
                self.assertIn('wait #1 [I01] Low: Current', out)
                self.assertIn('[I01:E01] Epic 5: Work: In Progress → Backlog', out)
                self.assertNotIn('Epic 3: Work: In Progress →', out)

    def test_an_epic_in_review_or_held_by_a_session_keeps_its_initiative_waiting(self):
        """board.py holds an initiative In Progress while a listed epic is In Review or active, so the
        queue waits on it in every set rather than moving it."""
        held_row = (f'[W01]({RECORD})', 'Go', '')
        integration = [pr(9, '[I01:E00] Integration', head='i01/e00/main', base='main')]
        for engaged, row, prs, line in (('In Review', ('W01', 'Go', ''), integration, 'E00 In Review'),
                                        ('In Progress', held_row, [], 'E00 held by a session')):
            for where, priority, unplanned in (('next set', 'priority: 3', ()),
                                               ('below the next set', 'priority: 1', ()),
                                               ('unplanned', '', ('1',))):
                with self.subTest(engaged=engaged, where=where):
                    low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 3)})", ''),
                                     (f"[E01]({url('issues', 5)})", ''), priority=priority)
                    high = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''),
                                      priority='priority: 5')
                    out = queue(staged((low, 'In Progress'), (high, 'Backlog'),
                                       (epic(3, '01:E00', row), engaged),
                                       (epic(5, '01:E01', ('W01', 'Go', '')), 'Backlog'),
                                       (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')),
                                prs, unplanned=unplanned)
                    self.assertIn(f'wait #1 [I01] Low: Current: {line}', out)
                    self.assertNotIn('[I01] Low: Current: In Progress →', out)
                    self.assertNotIn('Epic 3: Work:', out)
                    self.assertNotIn('Epic 5', out)
                    self.assertNotIn('reconcile', out)

    def test_an_active_epic_under_a_waiting_initiative_is_in_progress(self):
        for where, priority, unplanned in (('next set', 'priority: 3', ()), ('unplanned', '', ('1',))):
            with self.subTest(where):
                out = self.waiting('Backlog', priority, unplanned, engaged='Backlog')
                self.assertIn('wait #1 [I01] Low: Current', out)
                self.assertIn('[I01:E00] Epic 3: Work: Backlog → In Progress', out)
                self.assertNotIn('Epic 5', out)


class BacklogTakesTheTree(unittest.TestCase):
    """An initiative returning to Backlog takes its unstarted epics, keeps Done and names work under
    way or in review for reconciliation."""

    def shelved(self, *epics: tuple[dict, str], prs: list[dict] | None = None) -> str:
        rows = [(f"[E{n:02d}]({url('issues', content['number'])})", '') for n, (content, _) in enumerate(epics)]
        bare = assigned(initiative(1, 'Bare: Parked', *rows, priority=''))
        return queue(staged((bare, 'Ready'), *epics), prs)

    def test_unstarted_epics_return_without_an_assignee_and_done_stays(self):
        done = issue(2, '[I01:E00] Epic 2: Work', 'closed', body=epic_body(('W01', 'Go', '')))
        out = self.shelved((done, 'Done'), (assigned(epic(3, '01:E01', ('W01', 'Go', ''))), 'Ready'))
        self.assertIn('[I01] Bare: Parked: Ready → Backlog', out)
        self.assertIn('[I01:E01] Epic 3: Work: Ready → Backlog', out)
        self.assertIn("gh api --method DELETE repos/o/r/issues/3/assignees -f 'assignees[]=me'", out)
        self.assertIn("gh api --method DELETE repos/o/r/issues/1/assignees -f 'assignees[]=me'", out)
        self.assertNotIn('--method POST repos/o/r/issues/', out)
        self.assertNotIn('Epic 2', out)
        self.assertNotIn('reconcile', out)

    def test_an_epic_in_review_is_reported_and_nothing_moves(self):
        out = self.shelved((epic(2, '01:E00', ('W01', 'Go', '')), 'In Review'),
                           (epic(3, '01:E01', ('W01', 'Go', '')), 'Ready'))
        self.assertIn('reconcile #1 [I01] Bare: Parked: E00 (In Review)', out)
        self.assertNotIn('→', out)

    def test_a_reserved_epic_is_reported_and_nothing_moves(self):
        out = self.shelved((epic(2, '01:E00', (f'[W01]({RECORD})', 'Go', '')), 'In Progress'),
                           (epic(3, '01:E01', ('W01', 'Go', '')), 'Ready'))
        self.assertIn('reconcile #1 [I01] Bare: Parked: E00 (work under way)', out)
        self.assertNotIn('→', out)

    def test_an_open_delivery_pull_request_is_reported_and_nothing_moves(self):
        out = self.shelved((epic(2, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           prs=[pr(9, '[I01:E00] Go', base='i01/e00/workspace', head='i01/e00/w01-go')])
        self.assertIn('reconcile #1 [I01] Bare: Parked: E00 (work under way)', out)
        self.assertNotIn('→', out)

    def test_an_unplanned_initiative_holding_a_reservation_waits(self):
        bare = initiative(1, 'Bare: Current', (f"[E00]({url('issues', 3)})", ''), priority='')
        nxt = initiative(2, 'Next: Up', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((bare, 'In Progress'), (nxt, 'Backlog'),
                           (epic(3, '01:E00', (f'[W01]({RECORD})', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')), unplanned=('1',))
        self.assertIn('wait #1 [I01] Bare: Current: E00 held by a session', out)
        self.assertNotIn('[I01] Bare: Current: In Progress →', out)
        self.assertNotIn('Epic 3: Work: In Progress →', out)
        self.assertIn('[I02] Next: Up: Backlog → In Progress', out)


def handed_off(number: int, which: str) -> dict:
    """An open epic whose one row is delivered and whose criterion is ticked, awaiting agent review."""
    found = epic(number, which, ('[W01](https://github.com/o/r/pull/8)', 'Go', ''))
    found['body'] = found['body'].replace('- [ ] **AC1.**', '- [x] **AC1.**')
    assert '- [x] **AC1.**' in found['body']
    return found


AWAITING = [pr(9, '[I01:E00] Integration', head='i01/e00/main', base='main'),
            pr(8, '[I01:E00] Go', merged='2026-01-01T00:00:00Z', base='i01/e00/main', head='i01/e00/w01-go')]


class EpicHandoff(unittest.TestCase):
    """An epic with every criterion ticked awaits its agent review where board.py holds it: the queue
    neither readies, parks nor releases it, and it holds its initiative In Progress."""

    def test_the_queue_leaves_it_in_progress_under_its_running_initiative(self):
        only = initiative(1, 'Only: Current', (f"[E00]({url('issues', 3)})", ''))
        out = queue(staged((only, 'In Progress'), (handed_off(3, '01:E00'), 'In Progress')), AWAITING)
        self.assertNotIn('Epic 3: Work:', out)
        self.assertNotIn('next #1', out)

    def test_it_holds_its_initiative_waiting_in_every_set(self):
        for where, priority, unplanned in (('next set', 'priority: 3', ()),
                                           ('below the next set', 'priority: 1', ()),
                                           ('unplanned', '', ('1',))):
            with self.subTest(where):
                low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 3)})", ''), priority=priority)
                high = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
                out = queue(staged((low, 'In Progress'), (high, 'Backlog'),
                                   (handed_off(3, '01:E00'), 'In Progress'),
                                   (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')), AWAITING, unplanned)
                self.assertIn('wait #1 [I01] Low: Current: E00 awaiting review', out)
                self.assertNotIn('[I01] Low: Current: In Progress →', out)
                self.assertNotIn('Epic 3: Work:', out)

    def test_a_returning_initiative_names_it_for_reconciliation(self):
        bare = assigned(initiative(1, 'Bare: Parked', (f"[E00]({url('issues', 3)})", ''), priority=''))
        out = queue(staged((bare, 'Ready'), (handed_off(3, '01:E00'), 'In Progress')), AWAITING)
        self.assertIn('reconcile #1 [I01] Bare: Parked: E00 (awaiting review)', out)
        self.assertNotIn('→', out)


class UnresolvableGates(unittest.TestCase):
    """A queue run meeting a Depends on entry it cannot resolve."""

    def run_with(self, depends: str):
        one = initiative(1, 'Theme: Work', (f"[E00]({url('issues', 3)})", ''),
                         (f"[E01]({url('issues', 4)})", depends))
        return queue_run(staged((one, 'In Progress'),
                                (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                                (epic(4, '01:E01', ('W01', 'Go', '')), 'Backlog')))

    def test_the_run_names_the_row_and_the_entry_and_leaves_it_unplaced(self):
        done = self.run_with('E09 (W04)')
        self.assertIn('unresolved: #1 [I01] Theme: Work E01: cannot resolve E09 (W04): '
                      'it names no row and links no issue', done.stdout)
        self.assertNotIn('Epic 4', done.stdout.split('unresolved:')[0])
        self.assertEqual(done.returncode, 1)

    def test_a_prerequisite_that_has_not_landed_places_the_row(self):
        done = self.run_with(f"[E00]({url('issues', 3)})")
        self.assertNotIn('cannot resolve', done.stdout)
        self.assertIn('[I01:E00] Epic 3: Work: Backlog → Ready', done.stdout)
        self.assertEqual(done.returncode, 0)


class HotFixes(unittest.TestCase):
    def test_an_open_hot_fix_is_ready_whatever_the_priority_sets(self):
        low = initiative(1, 'Low: Later', (f"[E00]({url('issues', 3)})", ''), priority='')
        out = queue(staged((low, 'Backlog'), (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (hotfix(4), 'Backlog'), (hotfix(5), None)))
        self.assertIn('[F04] Key Validation: Reject Bad Keys: Backlog → Ready', out)
        self.assertIn('[F05] Key Validation: Reject Bad Keys: no Status → Ready', out)
        self.assertIn('assign #4', out)
        self.assertIn('  order:', out)

    def test_an_open_hot_fix_out_of_the_hot_fix_format_goes_to_backlog(self):
        unlabelled = hotfix(6)
        unlabelled['labels'] = [{'name': 'type:hot-fix'}]
        out = queue(staged((hotfix(4, target=None), 'Ready'), (hotfix(5, target=None), 'In Progress'),
                           (unlabelled, 'In Review'), (hotfix(7, target=None), None)))
        self.assertIn('[F04] Key Validation: Reject Bad Keys: Ready → Backlog', out)
        self.assertIn('[F05] Key Validation: Reject Bad Keys: In Progress → Backlog', out)
        self.assertIn('[F06] Key Validation: Reject Bad Keys: In Review → Backlog', out)
        self.assertIn('[F07] Key Validation: Reject Bad Keys: no Status → Backlog', out)
        self.assertNotIn('Ready', out.replace('Ready → Backlog', ''))

    def test_a_hot_fix_keeps_in_progress_and_leaves_in_review_for_it(self):
        out = queue(staged((hotfix(4), 'In Progress'), (hotfix(5), 'In Review')))
        self.assertNotIn('[F04]', out)
        self.assertIn('[F05] Key Validation: Reject Bad Keys: In Review → In Progress', out)

    def test_an_open_hot_fix_left_done_returns_to_ready(self):
        out = queue(staged((hotfix(6), 'Done')))
        self.assertIn('[F06] Key Validation: Reject Bad Keys: Done → Ready', out)

    def test_a_closed_hot_fix_is_done_or_leaves_the_board(self):
        merged, dropped = hotfix(4), hotfix(5)
        merged['state'] = dropped['state'] = 'closed'
        merged['state_reason'], dropped['state_reason'] = 'completed', 'not_planned'
        out = queue(staged((merged, 'In Progress'), (dropped, 'Ready')))
        self.assertIn('[F04] Key Validation: Reject Bad Keys: In Progress → Done', out)
        self.assertIn('remove #5 [F05] Key Validation: Reject Bad Keys (closed, not completed)', out)

    def test_a_hot_fix_holds_back_no_epic(self):
        top = initiative(1, 'Top: Now', (f"[E00]({url('issues', 3)})", ''))
        out = queue(staged((top, 'In Progress'), (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (hotfix(4), 'In Progress')))
        self.assertIn('Epic 3: Work: Backlog → Ready', out)
        self.assertNotIn('wait', out)


if __name__ == '__main__':
    unittest.main()
