"""progress.py: one test per rule its docstring states.

Run from the skill directory: python3 -m unittest discover -s test
"""
import sys
import unittest
from datetime import date

from fixtures import SCRIPTS, epic_body, issue, item, pr, progress, section, url

sys.path.insert(0, str(SCRIPTS))
from progress import previous_working_day  # noqa: E402

SINCE = '2026-09-25'
IN = '2026-09-26T08:00:00Z'
BEFORE = '2026-09-20T08:00:00Z'


def summary(items, prs=(), *args, tz='UTC'):
    done = progress(items, list(prs), '--since', SINCE, *args, tz=tz)
    if done.returncode:
        raise AssertionError(done.stderr)
    return done.stdout


class Completed(unittest.TestCase):
    def test_initiative_closed_in_window_is_complete(self):
        out = summary([item(issue(1, '[I01] Shipped: All', 'closed', IN), 'Done')])
        self.assertEqual(section(out, 'Completed'),
                         [f"• *I01 Shipped*, initiative complete — {url('issues', 1)}"])

    def test_epic_closed_in_window_is_complete(self):
        out = summary([item(issue(2, '[I01:E00] First: Epic', 'closed', IN, epic_body()), 'Done')])
        self.assertEqual(section(out, 'Completed'), [f"• *I01:E00 First*, epic complete — {url('issues', 2)}"])

    def test_done_item_closed_before_window_is_left_out(self):
        out = summary([item(issue(2, '[I01:E00] First: Epic', 'closed', BEFORE, epic_body()), 'Done')])
        self.assertEqual(section(out, 'Completed'), ['• Nothing'])

    def test_task_issue_closed_in_window_is_listed_under_its_epic(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Task', '')))
        task = issue(3, '[I01:E00:W01] Task Issue: Done', 'closed', IN)
        out = summary([item(epic, 'In Progress'), item(task, 'Done')])
        self.assertEqual(section(out, 'Completed'), [
            f"• *I01:E00 First* — {url('issues', 2)}",
            f"    ◦ W01 Task Issue — {url('issues', 3)}"])

    def test_row_linking_a_pull_request_merged_in_the_window_is_listed(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(
            (f"[W01]({url('pull', 50)})", 'Old work', ''), (f"[W02]({url('pull', 51)})", 'New work', '')))
        prs = [pr(50, '[I01:E00] Old', BEFORE), pr(51, '[I01:E00] New', IN)]
        out = summary([item(epic, 'In Progress')], prs)
        self.assertEqual(section(out, 'Completed'), [
            f"• *I01:E00 First* — {url('issues', 2)}",
            f"    ◦ W02 New work — {url('pull', 51)}"])

    def test_merged_pull_request_no_row_links_is_listed_by_title(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        out = summary([item(epic, 'In Progress')], [pr(52, '[I01:E00] Unlinked fix', IN)])
        self.assertIn(f"    ◦ Unlinked fix — {url('pull', 52)}", section(out, 'Completed'))

    def test_pull_request_citing_a_listed_task_issue_is_left_out(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Task', '')))
        task = issue(3, '[I01:E00:W01] Task Issue: Done', 'closed', IN)
        out = summary([item(epic, 'In Progress'), item(task, 'Done')],
                      [pr(53, '[I01:E00] Delivers it', IN, body='Closes #3')])
        self.assertNotIn('Delivers it', out)

    def test_pull_request_citing_an_unlisted_task_issue_is_kept(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Task', '')))
        task = issue(3, '[I01:E00:W01] Task Issue: Open')
        out = summary([item(epic, 'In Progress'), item(task, 'In Progress')],
                      [pr(53, '[I01:E00] Part of it', IN, body='Part of #3')])
        self.assertIn(f"    ◦ Part of it — {url('pull', 53)}", section(out, 'Completed'))

    def test_task_issue_on_the_board_is_listed_once(self):
        # Row W01 links a pull request; the board also holds W01's task issue, and a merged pull
        # request cites W02's task issue, which no row links.
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 50)})", 'Work', ''),
                                                                 ('W02', 'More', '')))
        prs = [pr(50, '[I01:E00] Work', IN), pr(51, '[I01:E00] More', IN, body='Closes #4')]
        out = summary([item(epic, 'In Progress'), item(issue(3, '[I01:E00:W01] Work: Task', 'closed', IN), 'Done'),
                       item(issue(4, '[I01:E00:W02] More: Task', 'closed', IN), 'Done')], prs)
        self.assertEqual(section(out, 'Completed')[1:], [
            f"    ◦ W01 Work — {url('issues', 3)}",
            f"    ◦ W02 More — {url('issues', 4)}"])

    def test_pull_requests_are_known_by_url_across_repositories(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 40)})", 'Here', '')))
        prs = [pr(40, '[I01:E00] In r', IN), pr(40, '[I01:E00] In s', IN, repo='o/s')]
        out = summary([item(epic, 'In Progress')], prs)
        self.assertEqual(section(out, 'Completed')[1:], [
            f"    ◦ W01 Here — {url('pull', 40)}",
            f"    ◦ In s — {url('pull', 40, 'o/s')}"])


class InProgress(unittest.TestCase):
    def test_epic_lists_its_open_pull_requests_ready_and_draft(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        prs = [pr(54, '[I01:E00] Ready one'), pr(55, '[I01:E00] Drafted', draft=True)]
        out = summary([item(epic, 'In Progress')], prs)
        self.assertEqual(section(out, 'In progress'), [
            f"• *I01:E00 First* — {url('issues', 2)}",
            f"    ◦ In Review: Ready one — {url('pull', 54)}",
            f"    ◦ Draft: Drafted — {url('pull', 55)}"])

    def test_epic_in_review_is_noted(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        out = summary([item(epic, 'In Review')], [pr(54, '[I01:E00] Ready one')])
        self.assertEqual(section(out, 'In progress')[0], f"• *I01:E00 First*, in review — {url('issues', 2)}")

    def test_active_task_issue_stands_for_the_pull_requests_citing_it(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Task', '')))
        task = issue(3, '[I01:E00:W01] Task Issue: Open')
        out = summary([item(epic, 'In Progress'), item(task, 'In Review')],
                      [pr(56, '[I01:E00] For the task', body='For #3')])
        self.assertEqual(section(out, 'In progress'), [
            f"• *I01:E00 First* — {url('issues', 2)}",
            f"    ◦ In Review: W01 Task Issue — {url('issues', 3)}"])

    def test_bare_number_from_another_repository_cites_nothing(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Task', '')))
        task = issue(3, '[I01:E00:W01] Task Issue: Open')
        out = summary([item(epic, 'In Progress'), item(task, 'In Progress')],
                      [pr(41, '[I01:E00] Elsewhere', body='See #3', repo='o/s')])
        self.assertIn(f"    ◦ In Review: Elsewhere — {url('pull', 41, 'o/s')}", section(out, 'In progress'))

    def test_epic_with_nothing_open_names_its_next_task(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(
            (f"[W01]({url('pull', 60)})", 'Delivered', ''), ('W02', 'Next up', 'W01')))
        out = summary([item(epic, 'In Progress')], [pr(60, '[I01:E00] Done', BEFORE)])
        self.assertEqual(section(out, 'In progress')[1], '    ◦ Next: W02 Next up')

    def test_next_task_skips_delivered_blocked_and_active_tasks(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(
            (f"[W01]({url('pull', 60)})", 'Delivered', ''),
            (f"[W02]({url('issues', 3)})", 'Active', ''),
            ('W03', 'Blocked', 'W02'),
            ('W04', 'Free', '')))
        out = summary([item(epic, 'Ready'), item(issue(3, '[I01:E00:W02] Active: Task'), 'In Progress')],
                      [pr(60, '[I01:E00] Done', BEFORE)])
        self.assertEqual(section(out, 'Next'), [f"• *I01:E00 First*, next W04 Free — {url('issues', 2)}"])

    def test_next_task_skips_a_task_issue_off_the_board(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(
            (f"[W01]({url('issues', 3)})", 'Dropped', ''), ('W02', 'Free', '')))
        out = summary([item(epic, 'Ready')])
        self.assertEqual(section(out, 'Next'), [f"• *I01:E00 First*, next W02 Free — {url('issues', 2)}"])


class Next(unittest.TestCase):
    def ready(self, number: int, epic: int, labels=()):
        return item(issue(number, f'[I01:E{epic:02d}] Epic {epic}: Ready', body=epic_body(('W01', 'Go', '')),
                          labels=labels), 'Ready')

    def test_ranked_by_priority_label_then_reference(self):
        items = [self.ready(10, 0, ['priority: low']), self.ready(11, 1), self.ready(12, 2, ['priority: highest']),
                 self.ready(13, 3, ['priority: high']), self.ready(14, 4, ['priority: medium'])]
        refs = [line.split('*')[1].split(' ')[0] for line in section(summary(items), 'Next')]
        self.assertEqual(refs, ['I01:E02', 'I01:E03', 'I01:E01', 'I01:E04', 'I01:E00'])

    def test_first_five_and_a_count_of_the_rest(self):
        lines = section(summary([self.ready(10 + n, n) for n in range(7)]), 'Next')
        self.assertEqual(len(lines), 6)
        self.assertEqual(lines[-1], '…and 2 more ready')

    def test_task_issue_a_ready_epic_names_next_is_not_listed_again(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Queued', '')))
        out = summary([item(epic, 'Ready'), item(issue(3, '[I01:E00:W01] Queued: Task'), 'Ready')])
        self.assertEqual(section(out, 'Next'), [f"• *I01:E00 First*, next W01 Queued — {url('issues', 2)}"])

    def test_task_issue_an_active_epic_names_next_is_not_listed_again(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Queued', '')))
        out = summary([item(epic, 'In Progress'), item(issue(3, '[I01:E00:W01] Queued: Task'), 'Ready')])
        self.assertEqual(section(out, 'In progress')[1], '    ◦ Next: W01 Queued')
        self.assertEqual(section(out, 'Next'), ['• Nothing'])


class Window(unittest.TestCase):
    def test_window_opens_at_local_midnight(self):
        # 15:00 UTC on 24 Sep is 01:00 on 25 Sep in Sydney (UTC+10).
        items = [item(issue(1, '[I01] Shipped: All', 'closed', '2026-09-24T15:00:00Z'), 'Done')]
        self.assertIn('initiative complete', summary(items, tz='Australia/Sydney'))
        self.assertNotIn('initiative complete', summary(items, tz='UTC'))

    def test_default_window_opens_on_the_previous_working_day(self):
        self.assertEqual(previous_working_day(date(2026, 9, 28)), date(2026, 9, 25))  # Monday
        self.assertEqual(previous_working_day(date(2026, 9, 29)), date(2026, 9, 28))  # Tuesday
        self.assertEqual(previous_working_day(date(2026, 9, 27)), date(2026, 9, 25))  # Sunday

    def test_heading_names_the_window_and_initiative(self):
        out = summary([item(issue(1, '[I08] Libraries: All'), 'In Progress')], (), '--initiative', 'I08')
        self.assertEqual(out.splitlines()[0], '*Progress since Fri 25 Sep* — I08')


class Options(unittest.TestCase):
    items = [item(issue(2, '[I08:E00] Eight: Epic', body=epic_body(('W01', 'Go', ''))), 'Ready'),
             item(issue(3, '[I09:E00] Nine: Epic', body=epic_body(('W01', 'Go', ''))), 'Ready')]

    def test_initiative_accepts_each_form(self):
        for form in ('I08', 'I8', '8', 'i08'):
            with self.subTest(form=form):
                out = summary(self.items, (), '--initiative', form)
                self.assertIn('I08:E00', out)
                self.assertNotIn('I09:E00', out)

    def test_initiative_rejects_other_text(self):
        done = progress(self.items, [], '--initiative', 'X9')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('not an initiative reference', done.stderr)

    def test_unreadable_epic_is_summarised_without_tasks(self):
        broken = item(issue(4, '[I08:E01] Broken: Epic', body='## Work Breakdown\n\nTBD\n'), 'Ready')
        done = progress([broken], [], '--since', SINCE)
        self.assertEqual(done.returncode, 0)
        self.assertEqual(section(done.stdout, 'Next'), [f"• *I08:E01 Broken* — {url('issues', 4)}"])
        self.assertIn('#4 [I08:E01] Broken: Epic: Work Breakdown has no table', done.stderr)

    def test_initiative_reports_no_other_initiative_epics(self):
        broken = item(issue(4, '[I09:E01] Broken: Epic', body='## Work Breakdown\n\nTBD\n'), 'Ready')
        done = progress([*self.items, broken], [], '--since', SINCE, '--initiative', 'I08')
        self.assertEqual(done.stderr, '')

    def test_items_without_status_exit(self):
        done = progress([item(issue(2, '[I08:E00] Eight: Epic'), None)], [], '--since', SINCE)
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('no Status field', done.stderr)

    def test_item_without_content_is_skipped(self):
        out = summary([*self.items, item(None, 'Ready')])
        self.assertEqual(len(section(out, 'Next')), 2)

    def test_empty_sections_say_nothing(self):
        out = summary([item(issue(1, '[I01] Idle: All'), 'Backlog')])
        for name in ('Completed', 'In progress', 'Next'):
            self.assertEqual(section(out, name), ['• Nothing'])


if __name__ == '__main__':
    unittest.main()
