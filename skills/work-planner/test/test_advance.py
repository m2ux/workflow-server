"""The queue advance.py sets on a theme board.

Run from the skill directory: python3 -m unittest discover -s test
"""
import json
import tempfile
import unittest
from pathlib import Path

from fixtures import epic_body, initiative_body, issue, item, pr, run, url


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
         questions: str = '') -> dict:
    body = epic_body(*tasks)
    if questions:
        body += f'\n## Open Questions\n\n- {questions}\n'
    return issue(number, f'[I{which}] Epic {number}: Work', body=body, repo=repo)


def queue(items: list[dict], prs: list[dict] | None = None, unplanned: tuple[str, ...] = ()) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        items_path, prs_path, fields = root / 'items.json', root / 'prs.json', root / 'fields.json'
        items_path.write_text(json.dumps(items))
        prs_path.write_text(''.join(json.dumps(row) + '\n' for row in prs or []))
        fields.write_text(json.dumps(FIELDS))
        extra = [arg for spec in unplanned for arg in ('--unplanned', spec)]
        done = run('advance.py', '--items', str(items_path), '--prs', str(prs_path),
                   '--board', 'users/o/projectsV2/9', '--fields', str(fields),
                   '--out', str(root / 'out'), '--assignee', 'me', *extra)
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
        self.assertIn('[I02] High: Next: Backlog → Ready', out)
        self.assertIn('[I01] Low: Later: Ready → Backlog', out)
        self.assertIn('next #2 [I02] High: Next: E00', out)
        self.assertNotIn('[I02:E00]', out.split('next', 1)[0])

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
        self.assertIn('[I02:E00] Epic 5: Work: Backlog → Ready', out)

    def test_an_open_pull_request_holds_the_swap(self):
        low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 3)})", ''))
        high = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((low, 'In Progress'), (high, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')),
                    [pr(9, '[I01:E00] Open')])
        self.assertIn('wait #1 [I01] Low: Current: open pull request https://github.com/o/r/pull/9', out)
        self.assertNotIn('→', out)
        self.assertIn('to do: 0', out)

    def test_in_review_does_not_fill_the_slot(self):
        reviewing = initiative(1, 'Done: Waiting', (f"[E00]({url('issues', 3)})", ''), priority='priority: 5')
        nxt = initiative(2, 'Next: Up', (f"[E00]({url('issues', 4)})", ''))
        out = queue(staged((reviewing, 'In Review'), (nxt, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Done'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('[I02] Next: Up: Backlog → Ready', out)
        self.assertNotIn('[I01] Done: Waiting:', out)

    def test_a_debt_initiative_has_its_own_slot(self):
        feature = initiative(1, 'Feature: Current', (f"[E00]({url('issues', 3)})", ''))
        debt = initiative(2, 'Debt: Next', (f"[E00]({url('issues', 4)})", ''),
                          priority='priority: 2', labels=('tech-debt',))
        out = queue(staged((feature, 'In Progress'), (debt, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('[I02] Debt: Next: Backlog → Ready', out)
        self.assertNotIn('[I01] Feature: Current:', out)

    def test_an_unlabelled_backlog_initiative_stays_there(self):
        bare = initiative(1, 'Bare: None', (f"[E00]({url('issues', 3)})", ''), priority='')
        ranked = initiative(2, 'Ranked: High', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((bare, 'Backlog'), (ranked, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('[I02] Ranked: High: Backlog → Ready', out)
        self.assertNotIn('[I01] Bare: None:', out)

    def test_a_labelled_tie_promotes_neither(self):
        later = initiative(2, 'Later: Same', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        earlier = initiative(1, 'Earlier: Same', (f"[E00]({url('issues', 3)})", ''), priority='priority: 5')
        out = queue(staged((later, 'Ready'), (earlier, 'Backlog'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog')))
        self.assertIn('tie ', out)
        self.assertNotIn('→', out)

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
        self.assertIn('order ordinary: #1 [I01] Feature: One', out)
        self.assertIn('order debt: #2 [I02] Debt: One', out)
        self.assertNotIn('→', out)

    def test_an_in_progress_initiative_without_priority_is_asked(self):
        bare = initiative(1, 'Bare: Current', (f"[E00]({url('issues', 2)})", ''), priority='')
        out = queue(staged((bare, 'In Progress'), (epic(2, '01:E00', ('W01', 'Go', '')), 'In Progress')))
        self.assertIn('ask #1 [I01] Bare: Current: priority', out)
        self.assertNotIn('→', out)

    def test_an_unplanned_initiative_waits_for_its_pull_request(self):
        bare = initiative(1, 'Bare: Current', (f"[E00]({url('issues', 3)})", ''), priority='')
        nxt = initiative(2, 'Next: Up', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((bare, 'In Progress'), (nxt, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')),
                    [pr(9, '[I01:E00] Open')], unplanned=('1',))
        self.assertIn('wait #1 [I01] Bare: Current: open pull request https://github.com/o/r/pull/9', out)
        self.assertNotIn('→', out)

    def test_an_unplanned_initiative_returns_to_backlog_with_its_epics(self):
        bare = initiative(1, 'Bare: Current', (f"[E00]({url('issues', 3)})", ''), priority='')
        nxt = initiative(2, 'Next: Up', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((bare, 'In Progress'), (nxt, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')), unplanned=('1',))
        self.assertIn('[I01] Bare: Current: In Progress → Backlog', out)
        self.assertIn('[I01:E00] Epic 3: Work: In Progress → Backlog', out)
        self.assertIn('[I02] Next: Up: Backlog → Ready', out)

    def test_a_pull_request_without_the_epic_does_not_hold_the_swap(self):
        low = initiative(1, 'Low: Current', (f"[E00]({url('issues', 3)})", ''))
        high = initiative(2, 'High: Next', (f"[E00]({url('issues', 4)})", ''), priority='priority: 5')
        out = queue(staged((low, 'In Progress'), (high, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'In Progress'),
                           (epic(4, '02:E00', ('W01', 'Go', '')), 'Backlog')),
                    [pr(9, '[I01] Open')])
        self.assertIn('[I01] Low: Current: In Progress → Ready', out)
        self.assertNotIn('wait ', out)

    def test_each_repository_has_its_own_slot(self):
        here = initiative(1, 'Here: One', (f"[E00]({url('issues', 3)})", ''))
        there = initiative(1, 'There: One', (f"[E00]({url('issues', 4, 'o/s')})", ''), repo='o/s')
        out = queue(staged((here, 'Backlog'), (there, 'Backlog'),
                           (epic(3, '01:E00', ('W01', 'Go', '')), 'Backlog'),
                           (epic(4, '01:E00', ('W01', 'Go', ''), repo='o/s'), 'Backlog')))
        self.assertIn('[I01] Here: One: Backlog → Ready', out)
        self.assertIn('[I01] There: One: Backlog → Ready', out)

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

    def test_an_open_question_keeps_the_next_epic_in_backlog(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''))
        asking = epic(2, '01:E00', ('W01', 'Go', ''), questions='Which shape?')
        out = queue(staged((current, 'In Progress'), (asking, 'Backlog')))
        self.assertNotIn('→ Ready', out)
        self.assertIn('to do: 0', out)

    def test_a_partly_completed_epic_of_the_in_progress_initiative_is_in_progress(self):
        current = initiative(1, 'Current: Work', (f"[E00]({url('issues', 2)})", ''))
        started = epic(2, '01:E00', ('[W01](https://github.com/o/r/pull/9)', 'Go', ''))
        out = queue(staged((current, 'In Progress'), (started, 'Ready')),
                    [pr(9, '[I01:E00] Go', merged='2026-01-01T00:00:00Z')])
        self.assertIn('[I01:E00] Epic 2: Work: Ready → In Progress', out)


if __name__ == '__main__':
    unittest.main()
