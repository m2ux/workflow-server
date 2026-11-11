"""priority.py: the rank a priority label gives, the label a number names, and the execution-order key, as Work Priority states them.
"""
import sys
import unittest

from fixtures import SCRIPTS, issue

sys.path.insert(0, str(SCRIPTS))
from priority import execution_key, label, rank  # noqa: E402


def ranked(number: int, *labels: str) -> dict:
    return issue(number, f'[I{number:02d}] Theme: Work', labels=labels)


class Rank(unittest.TestCase):
    def test_a_priority_label_is_the_prefix_and_a_positive_integer(self):
        self.assertEqual(rank(ranked(1, 'priority: 3')), 3)
        self.assertEqual(rank(ranked(1, 'priority: 1000')), 1000)

    def test_anything_else_ranks_nothing(self):
        for name in ('priority: 0', 'priority: 03', 'priority: -1', 'priority:3', 'Priority: 3',
                     'priority: 3 ', 'priority: high', 'p: 3'):
            with self.subTest(name=name):
                self.assertIsNone(rank(ranked(1, name)))

    def test_two_labels_count_as_the_larger(self):
        self.assertEqual(rank(ranked(1, 'priority: 2', 'bug', 'priority: 7')), 7)

    def test_an_issue_with_no_priority_label_is_unranked(self):
        self.assertIsNone(rank(ranked(1)))
        self.assertIsNone(rank({'number': 1}))


class Label(unittest.TestCase):
    def test_the_label_a_number_names_ranks_as_that_number(self):
        for number in (1, 10, 250):
            with self.subTest(number=number):
                self.assertEqual(label(number), f'priority: {number}')
                self.assertEqual(rank(ranked(1, label(number))), number)

    def test_a_value_that_is_not_a_positive_integer_names_no_label(self):
        for value in (0, -3, True, 2.0, '3', None):
            with self.subTest(value=value):
                with self.assertRaises(ValueError):
                    label(value)


class ExecutionKey(unittest.TestCase):
    def order(self, *entries: tuple) -> list[str]:
        return [name for name, *_ in sorted(entries, key=lambda entry: execution_key(*entry[1:]))]

    def test_a_larger_initiative_rank_comes_first_whatever_the_epic_rank(self):
        low, high = ranked(1, 'priority: 1'), ranked(2, 'priority: 5')
        self.assertEqual(self.order(('low', low, ranked(10, 'priority: 9')),
                                    ('high', high, ranked(11, 'priority: 1'))), ['high', 'low'])

    def test_the_epic_rank_orders_epics_within_one_initiative(self):
        parent = ranked(1, 'priority: 2')
        self.assertEqual(self.order(('one', parent, ranked(10, 'priority: 1'), (), (10,)),
                                    ('five', parent, ranked(11, 'priority: 5'), (), (11,))), ['five', 'one'])

    def test_an_unranked_or_absent_issue_follows_the_ranked_at_its_own_level(self):
        epic = ranked(10, 'priority: 1')
        self.assertEqual(self.order(('absent', None, epic), ('bare', ranked(2), epic),
                                    ('ranked', ranked(1, 'priority: 1'), epic)), ['ranked', 'absent', 'bare'])
        parent = ranked(1, 'priority: 1')
        self.assertEqual(self.order(('bare', parent, ranked(11), (), (1,)),
                                    ('ranked', parent, epic, (), (2,))), ['ranked', 'bare'])
        self.assertEqual(execution_key(None, None), execution_key(ranked(2), ranked(11)))

    def test_initiative_order_separates_equally_ranked_initiatives_before_epic_rank(self):
        first, second = ranked(1, 'priority: 3'), ranked(2, 'priority: 3')
        self.assertEqual(self.order(('second', second, ranked(11, 'priority: 9'), ('o/r', 2)),
                                    ('first', first, ranked(10, 'priority: 1'), ('o/r', 1))),
                         ['first', 'second'])

    def test_without_initiative_order_equally_ranked_initiatives_rank_their_epics_together(self):
        first, second = ranked(1, 'priority: 3'), ranked(2, 'priority: 3')
        self.assertEqual(self.order(('second', second, ranked(11, 'priority: 9'), (), ('o/r', 2)),
                                    ('first', first, ranked(10, 'priority: 1'), (), ('o/r', 1))),
                         ['second', 'first'])

    def test_epic_order_breaks_the_remaining_ties(self):
        parent, epic = ranked(1, 'priority: 3'), ranked(10, 'priority: 2')
        self.assertEqual(self.order(('later', parent, epic, (), ('o/r', 12)),
                                    ('earlier', parent, epic, (), ('o/r', 11))), ['earlier', 'later'])


if __name__ == '__main__':
    unittest.main()
