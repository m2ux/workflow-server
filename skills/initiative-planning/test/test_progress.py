"""progress.py: one test per rule its docstring states.

Run from the skill directory: python3 -m unittest discover -s test
"""
import sys
import unittest
from datetime import date, datetime, timezone

from fixtures import SCRIPTS, epic_body, initiative_body, issue, item, pr, progress, section, url

sys.path.insert(0, str(SCRIPTS))
from progress import week_before  # noqa: E402

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

    def test_pull_request_citing_a_listed_task_issue_no_row_links_is_left_out(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W02', 'More', '')))
        out = summary([item(epic, 'In Progress'), item(issue(4, '[I01:E00:W02] More: Task', 'closed', IN), 'Done')],
                      [pr(51, '[I01:E00] More', IN, body='Closes #4')])
        self.assertEqual(section(out, 'Completed')[1:], [f"    ◦ W02 More — {url('issues', 4)}"])

    def test_a_pull_request_given_twice_is_listed_once(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body(('W01', 'Work', '')))
        twice = pr(9, '[I01:E00] Work', IN)
        out = summary([item(epic, 'In Progress')], [twice, twice])
        self.assertEqual(section(out, 'Completed')[1:], [f"    ◦ Work — {url('pull', 9)}"])

    def test_pull_requests_are_known_by_url_across_repositories(self):
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('pull', 40)})", 'Here', '')))
        other = issue(2, '[I01:E00] Other: Epic', body=epic_body(('W01', 'There', '')), repo='o/s')
        prs = [pr(40, '[I01:E00] In r', IN), pr(40, '[I01:E00] In s', IN, repo='o/s')]
        out = summary([item(epic, 'In Progress'), item(other, 'In Progress')], prs)
        self.assertEqual(section(out, 'Completed'), [
            f"• *I01:E00 First* — {url('issues', 2)}",
            f"    ◦ W01 Here — {url('pull', 40)}",
            f"• *I01:E00 Other* — {url('issues', 2, 'o/s')}",
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
        # The epic in o/s links a task issue in o/r; a bare #3 in an o/s pull request means o/s#3.
        epic = issue(2, '[I01:E00] First: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Task', '')),
                     repo='o/s')
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

    def test_default_window_opens_a_week_before_today(self):
        self.assertEqual(week_before(date(2026, 9, 28)), date(2026, 9, 21))
        self.assertEqual(week_before(date(2026, 10, 1)), date(2026, 9, 24))
        before = week_before(datetime.now(timezone.utc).date())
        done = progress([item(issue(1, '[I01] Idle: All'), 'Backlog')], [])
        after = week_before(datetime.now(timezone.utc).date())
        self.assertIn(done.stdout.splitlines()[0],
                      {f'*Progress since {d:%a} {d.day} {d:%b}*' for d in (before, after)})

    def test_board_is_linked_under_the_heading(self):
        out = summary([item(issue(1, '[I01] Idle: All'), 'Backlog')])
        self.assertEqual(out.splitlines()[1], 'Board: https://github.com/orgs/o/projects/7')

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

    def test_epic_without_a_work_breakdown_is_reported(self):
        bare = item(issue(4, '[I08:E01] Bare: Epic', body='## Overview\n\nx\n'), 'Ready')
        done = progress([bare], [], '--since', SINCE)
        self.assertEqual(section(done.stdout, 'Next'), [f"• *I08:E01 Bare* — {url('issues', 4)}"])
        self.assertIn('#4 [I08:E01] Bare: Epic: no Work Breakdown', done.stderr)

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


class Repositories(unittest.TestCase):
    """A board spanning repositories, each numbering its own initiatives."""

    def epic(self, number: int, repo: str, *rows):
        return issue(number, '[I01:E00] ' + repo.split('/')[1].upper() + ' Epic: Work',
                     body=epic_body(*rows or (('W01', 'Go', ''),)), repo=repo)

    def test_same_reference_in_two_repositories_stays_apart(self):
        out = summary([item(self.epic(2, 'o/r'), 'In Progress'), item(self.epic(2, 'o/s'), 'In Progress')],
                      [pr(7, '[I01:E00] Only in s', repo='o/s')])
        self.assertEqual(section(out, 'In progress'), [
            f"• *I01:E00 R Epic* — {url('issues', 2)}",
            '    ◦ Next: W01 Go',
            f"• *I01:E00 S Epic* — {url('issues', 2, 'o/s')}",
            f"    ◦ In Review: Only in s — {url('pull', 7, 'o/s')}"])

    def test_pull_request_names_an_epic_in_its_own_repository_only(self):
        out = summary([item(self.epic(2, 'o/s'), 'In Progress')], [pr(7, '[I01:E00] Elsewhere', IN)])
        self.assertEqual(section(out, 'Completed'), ['• Nothing'])
        self.assertNotIn('Elsewhere', out)

    def cross(self, *extra):
        """Initiative I01 in o/r whose epic E02 is held in o/s, with task issue W01 back in o/r."""
        initiative = issue(1, '[I01] Home: Initiative',
                           body=initiative_body((f"[E01]({url('issues', 5)})", ''),
                                                (f"[E02]({url('issues', 2, 'o/s')})", '')))
        first = issue(5, '[I01:E01] First: Epic', body=epic_body(('W01', 'After two', 'E02')))
        second = issue(2, '[I01:E02] Second: Epic', body=epic_body((f"[W01]({url('issues', 3)})", 'Task', '')),
                       repo='o/s')
        return [item(initiative, 'In Progress'), item(first, 'Ready'), *extra, item(second, 'In Progress')]

    def test_pull_request_in_the_initiatives_repository_counts_for_its_epic_elsewhere(self):
        out = summary(self.cross(), [pr(9, '[I01:E02] Work')])
        self.assertIn(f"    ◦ In Review: Work — {url('pull', 9)}", section(out, 'In progress'))

    def test_bare_epic_dependency_resolves_through_the_initiative(self):
        done_second = issue(2, '[I01:E02] Second: Epic', 'closed', IN, body=epic_body(('W01', 'Task', '')),
                            repo='o/s')
        items = [*self.cross()[:2], item(done_second, 'Done')]
        done = progress(items, [], '--since', SINCE)
        self.assertIn(f"• *I01:E01 First*, next W01 After two — {url('issues', 5)}", section(done.stdout, 'Next'))
        self.assertNotIn('E02 links no issue', done.stderr)

    def test_task_issue_in_another_repository_groups_under_its_epic(self):
        out = summary(self.cross(item(issue(3, '[I01:E02:W01] Task: Active'), 'In Progress')))
        self.assertEqual(section(out, 'In progress'), [
            f"• *I01:E02 Second* — {url('issues', 2, 'o/s')}",
            f"    ◦ In Progress: W01 Task — {url('issues', 3)}"])

    def test_task_issue_in_another_repository_named_next_is_not_listed_again(self):
        items = self.cross(item(issue(3, '[I01:E02:W01] Task: Queued'), 'Ready'))
        items[-1] = item(items[-1]['content'], 'Ready')
        out = summary(items)
        self.assertEqual([l for l in section(out, 'Next') if 'W01 Task' in l or 'E02:W01' in l],
                         [f"• *I01:E02 Second*, next W01 Task — {url('issues', 2, 'o/s')}"])

    def test_initiative_named_in_two_repositories_needs_its_repository(self):
        items = [item(self.epic(2, 'o/r'), 'Ready'), item(self.epic(2, 'o/s'), 'Ready')]
        done = progress(items, [], '--since', SINCE, '--initiative', 'I01')
        self.assertNotEqual(done.returncode, 0)
        self.assertIn('o/r:I01', done.stderr)
        self.assertIn('o/s:I01', done.stderr)
        out = summary(items, (), '--initiative', 'o/s:I01')
        self.assertEqual(section(out, 'Next'), [f"• *I01:E00 S Epic*, next W01 Go — {url('issues', 2, 'o/s')}"])

    def test_group_without_its_epic_names_its_repository(self):
        out = summary([item(issue(3, '[I01:E00:W01] Lone: Task', repo='o/s'), 'In Progress')])
        self.assertEqual(section(out, 'In progress')[0], '• *o/s I01:E00*')

    def test_pull_request_without_a_repository_url_is_reported(self):
        stray = {**pr(9, '[I01:E00] Stray'), 'html_url': 'not a url'}
        done = progress([item(self.epic(2, 'o/r'), 'In Progress')], [stray], '--since', SINCE)
        self.assertIn('pull request #9 [I01:E00] Stray: no repository in its URL', done.stderr)

    def test_next_task_hides_only_its_own_repositorys_task_issue(self):
        epic = self.epic(2, 'o/r', (f"[W01]({url('issues', 3)})", 'Queued', ''))
        out = summary([item(epic, 'Ready'), item(issue(3, '[I01:E00:W01] Queued: Task'), 'Ready'),
                       item(issue(3, '[I01:E00:W01] Other: Task', repo='o/s'), 'Ready')])
        self.assertEqual(section(out, 'Next'), [
            f"• *I01:E00 R Epic*, next W01 Queued — {url('issues', 2)}",
            f"• *I01:E00:W01 Other* — {url('issues', 3, 'o/s')}"])


if __name__ == '__main__':
    unittest.main()
